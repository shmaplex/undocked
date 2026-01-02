package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
	"strings"
	"sync"
	"time"

	libp2p "github.com/libp2p/go-libp2p"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// ---------------------------
// Data Types
// ---------------------------

type Service struct {
	ServiceID   string `json:"serviceID"`
	DockerImage string `json:"dockerImage"`
	Port        string `json:"port"`
	Status      string `json:"status"` // starting | running | error
	StartedAt   string `json:"startedAt"`
}

type PeerInfo struct {
	ID       string    `json:"id"`
	Services []Service `json:"services"`
	LastSeen string    `json:"lastSeen"`
}

// ---------------------------
// Service Node
// ---------------------------

// ServiceNode manages Docker services and P2P communications.
type ServiceNode struct {
	mu     sync.Mutex
	nodes  map[string]*exec.Cmd // Running Docker containers
	peers  map[string]*PeerInfo // Known peers
	host   host.Host
	pubsub *pubsub.PubSub
	ctx    context.Context
	cancel context.CancelFunc
}

type dockerInspect struct {
	State struct {
		Running bool `json:"Running"`
	} `json:"State"`
	HostConfig struct {
		PortBindings map[string][]struct {
			HostPort string `json:"HostPort"`
		} `json:"PortBindings"`
	} `json:"HostConfig"`
}

func extractHostPort(dockerPorts string) string {
	ports := strings.Split(dockerPorts, ",")
	for _, p := range ports {
		if strings.Contains(p, "->") {
			left := strings.Split(p, "->")[0] // 0.0.0.0:6001
			if strings.Contains(left, ":") {
				return left[strings.LastIndex(left, ":")+1:] // => "6001"
			}
		}
	}
	return ""
}

func waitForContainerRunning(name string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)

	for time.Now().Before(deadline) {
		exists, running, err := dockerContainerState(name)
		if err != nil {
			return err
		}
		if exists && running {
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}

	return fmt.Errorf("container %s did not reach running state", name)
}

func dockerImageExists(image string) bool {
	cmd := exec.Command("docker", "image", "inspect", image)
	return cmd.Run() == nil
}

func pullDockerImage(ctx context.Context, image string) error {
	cmd := exec.Command("docker", "pull", image)

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		return err
	}

	go scanAndEmit(ctx, stdout)
	go scanAndEmit(ctx, stderr)

	return cmd.Wait()
}

func portAvailable(port string) bool {
	cmd := exec.Command("lsof", "-i", ":"+port)
	out, err := cmd.Output()
	if err != nil {
		// lsof returns error when nothing is listening → GOOD
		return true
	}
	return len(out) == 0
}

func findAvailablePort(start int) (string, error) {
	for p := start; p < start+1000; p++ {
		if portAvailable(fmt.Sprintf("%d", p)) {
			return fmt.Sprintf("%d", p), nil
		}
	}
	return "", fmt.Errorf("no available ports found")
}

func runDockerCommand(args ...string) (string, error) {
	cmd := exec.Command("docker", args...)
	out, err := cmd.CombinedOutput()
	return strings.TrimSpace(string(out)), err
}

func inspectContainer(name string) (*dockerInspect, error) {
	out, err := exec.Command("docker", "inspect", name).Output()
	if err != nil {
		return nil, err
	}

	var data []dockerInspect
	if err := json.Unmarshal(out, &data); err != nil || len(data) == 0 {
		return nil, fmt.Errorf("invalid docker inspect output")
	}

	return &data[0], nil
}

func dockerContainerState(name string) (exists bool, running bool, err error) {
	cmd := exec.Command(
		"docker",
		"inspect",
		"--type=container",
		"--format",
		"{{.State.Running}}",
		name,
	)

	out, err := cmd.Output()
	if err != nil {
		// IMPORTANT:
		// Any inspect error == container does not exist
		// Docker does not guarantee error strings
		return false, false, nil
	}

	state := strings.TrimSpace(string(out))
	return true, state == "true", nil
}

func scanAndEmit(ctx context.Context, r interface {
	Read([]byte) (int, error)
}) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		runtime.EventsEmit(ctx, "service-log", scanner.Text())
	}
}

func streamDockerLogs(ctx context.Context, container string) {
	cmd := exec.Command("docker", "logs", "-f", container)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return
	}

	if err := cmd.Start(); err != nil {
		return
	}

	go scanAndEmit(ctx, stdout)
	go scanAndEmit(ctx, stderr)
}

func dockerRunningServices() ([]Service, error) {
	cmd := exec.Command(
		"docker", "ps",
		"--format",
		"{{.Names}}|{{.Image}}|{{.Ports}}",
	)

	out, err := cmd.Output()
	if err != nil {
		return nil, err
	}

	services := []Service{}
	lines := strings.Split(strings.TrimSpace(string(out)), "\n")

	for _, line := range lines {
		parts := strings.Split(line, "|")
		if len(parts) < 3 {
			continue
		}

		port := extractHostPort(parts[2])

		_, err := inspectContainer(parts[0])
		startedAt := ""
		if err == nil {
			startedAt = time.Now().Format(time.RFC3339)
		}

		services = append(services, Service{
			ServiceID:   parts[0],
			DockerImage: parts[1],
			Port:        port,
			Status:      "running",
			StartedAt:   startedAt,
		})

	}

	return services, nil
}

// NewServiceNode creates a new ServiceNode with proper context.
func NewServiceNode() *ServiceNode {
	ctx, cancel := context.WithCancel(context.Background())
	return &ServiceNode{
		nodes:  make(map[string]*exec.Cmd),
		peers:  make(map[string]*PeerInfo),
		ctx:    ctx,
		cancel: cancel,
	}
}

// SetWailsContext allows Wails App to provide its context to the node
func (sn *ServiceNode) SetWailsContext(ctx context.Context) {
	sn.ctx = ctx
}

func (sn *ServiceNode) StartService(serviceID, dockerImage, port string) string {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	// -----------------------------
	// Validation
	// -----------------------------
	if serviceID == "" || dockerImage == "" || port == "" {
		return "All fields are required."
	}

	if err := exec.Command("docker", "info").Run(); err != nil {
		return "Docker is not running. Please start Docker and try again."
	}

	// -----------------------------
	// Inspect container
	// -----------------------------
	exists, running, err := dockerContainerState(serviceID)
	if err != nil {
		return fmt.Sprintf("Docker inspect failed: %v", err)
	}

	// -----------------------------
	// CASE 1: Exists + Running
	// -----------------------------
	if exists && running {
		go streamDockerLogs(sn.ctx, serviceID)
		sn.BroadcastServices()
		return fmt.Sprintf("Service %q is already running.", serviceID)
	}

	// -----------------------------
	// CASE 2: Exists + Stopped → START
	// -----------------------------
	if exists && !running {
		out, err := runDockerCommand("start", serviceID)
		if err != nil {
			return fmt.Sprintf("Docker failed to start container:\n%s", out)
		}

		if err := waitForContainerRunning(serviceID, 15*time.Second); err != nil {
			return err.Error()
		}

		go streamDockerLogs(sn.ctx, serviceID)
		sn.BroadcastServices()

		return fmt.Sprintf("Service %q is now running.", serviceID)
	}

	// -----------------------------
	// CASE 3: Container does NOT exist
	// -----------------------------

	// Ensure port availability
	if !portAvailable(port) {
		newPort, err := findAvailablePort(6000)
		if err != nil {
			return fmt.Sprintf("Port %s unavailable and no alternatives found.", port)
		}
		port = newPort
	}

	// Ensure image exists
	if !dockerImageExists(dockerImage) {
		runtime.EventsEmit(sn.ctx, "service-log", "Pulling Docker image: "+dockerImage)
		if err := pullDockerImage(sn.ctx, dockerImage); err != nil {
			return fmt.Sprintf("Failed to pull Docker image %q: %v", dockerImage, err)
		}
	}

	// Run container
	out, err := runDockerCommand(
		"run",
		"-d",
		"--name", serviceID,
		"-p", port+":6000",
		dockerImage,
	)
	if err != nil {
		return fmt.Sprintf("Docker run failed:\n%s", out)
	}

	if err := waitForContainerRunning(serviceID, 15*time.Second); err != nil {
		return err.Error()
	}

	go streamDockerLogs(sn.ctx, serviceID)
	sn.BroadcastServices()

	return fmt.Sprintf("Service %q is now running on port %s.", serviceID, port)
}

// StopService stops and removes a Docker container by serviceID.
func (sn *ServiceNode) StopService(serviceID string) string {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	_, _, err := dockerContainerState(serviceID)
	if err != nil {
		return "Failed to inspect service."
	}

	_ = exec.Command("docker", "stop", serviceID).Run()
	_ = exec.Command("docker", "rm", serviceID).Run()

	sn.BroadcastServices()
	return fmt.Sprintf("Service %q stopped.", serviceID)
}

// ListServices returns a slice of currently running services.
func (sn *ServiceNode) ListServices() []Service {
	services, err := dockerRunningServices()
	if err != nil {
		return []Service{}
	}
	return services
}

// InitP2P initializes the libp2p host and gossip-sub pubsub network.
func (sn *ServiceNode) InitP2P() error {
	h, err := libp2p.New()
	if err != nil {
		return err
	}
	sn.host = h

	ps, err := pubsub.NewGossipSub(sn.ctx, h)
	if err != nil {
		return err
	}
	sn.pubsub = ps

	topic, err := ps.Join("undocked-services")
	if err != nil {
		return err
	}

	sub, err := topic.Subscribe()
	if err != nil {
		return err
	}

	go sn.listenAnnouncements(sub)
	return nil
}

// listenAnnouncements listens for incoming peer announcements.
func (sn *ServiceNode) listenAnnouncements(sub *pubsub.Subscription) {
	for {
		msg, err := sub.Next(sn.ctx)
		if err != nil {
			return
		}

		var peerInfo PeerInfo
		if err := json.Unmarshal(msg.Data, &peerInfo); err != nil {
			continue
		}

		sn.mu.Lock()
		sn.peers[peerInfo.ID] = &peerInfo
		sn.mu.Unlock()
	}
}

// BroadcastServices sends a list of local services to the P2P network.
func (sn *ServiceNode) BroadcastServices() {
	if sn.pubsub == nil || sn.host == nil {
		return
	}

	info := PeerInfo{
		ID:       sn.host.ID().String(),
		Services: sn.ListServices(),
		LastSeen: time.Now().Format(time.RFC3339),
	}

	data, _ := json.Marshal(info)
	topic, _ := sn.pubsub.Join("undocked-services")
	_ = topic.Publish(sn.ctx, data)
}

// GetPeers returns a slice of known peers.
func (sn *ServiceNode) GetPeers() []PeerInfo {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	result := []PeerInfo{}
	for _, p := range sn.peers {
		result = append(result, *p)
	}
	return result
}

// CheckDockerStatus emits the current Docker running status
func (sn *ServiceNode) CheckDockerStatus() {
	go func() {
		dockerRunning := false
		cmd := exec.Command("docker", "info")
		if err := cmd.Run(); err == nil {
			dockerRunning = true
		}
		runtime.EventsEmit(sn.ctx, "docker-status", dockerRunning)
	}()
}
