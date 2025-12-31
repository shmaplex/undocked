package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"os/exec"
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

// StartService launches a Docker container for the given service.
func (sn *ServiceNode) StartService(serviceID, dockerImage, port string) (string, error) {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	if _, exists := sn.nodes[serviceID]; exists {
		return "", fmt.Errorf("service already running")
	}

	cmd := exec.Command("docker", "run", "--name", serviceID, "-p", port+":"+port, dockerImage)

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return "", fmt.Errorf("failed to get stdout pipe: %w", err)
	}
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return "", fmt.Errorf("failed to get stderr pipe: %w", err)
	}

	if err := cmd.Start(); err != nil {
		return "", fmt.Errorf("failed to start docker container: %w", err)
	}

	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			runtime.EventsEmit(sn.ctx, "service-log", scanner.Text())
		}
	}()

	go func() {
		scanner := bufio.NewScanner(stderr)
		for scanner.Scan() {
			runtime.EventsEmit(sn.ctx, "service-log", scanner.Text())
		}
	}()

	sn.nodes[serviceID] = cmd
	sn.BroadcastServices()

	return fmt.Sprintf("Service %q is starting...", serviceID), nil
}

// StopService stops and removes a Docker container by serviceID.
func (sn *ServiceNode) StopService(serviceID string) error {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	cmd, exists := sn.nodes[serviceID]
	if !exists {
		return fmt.Errorf("service not found")
	}

	_ = exec.Command("docker", "stop", serviceID).Run()
	_ = exec.Command("docker", "rm", serviceID).Run()
	delete(sn.nodes, serviceID)

	sn.BroadcastServices()
	return cmd.Process.Kill()
}

// ListServices returns a slice of currently running services.
func (sn *ServiceNode) ListServices() []Service {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	list := []Service{}
	for id := range sn.nodes {
		list = append(list, Service{
			ServiceID:   id,
			DockerImage: "", // optionally track DockerImage
			Port:        "5000",
		})
	}
	return list
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
	sn.mu.Lock()
	defer sn.mu.Unlock()

	if sn.pubsub == nil || sn.host == nil {
		return
	}

	topic, err := sn.pubsub.Join("undocked-services")
	if err != nil {
		return
	}

	services := sn.ListServices()
	peerInfo := PeerInfo{
		ID:       sn.host.ID().String(),
		Services: services,
		LastSeen: time.Now().Format(time.RFC3339),
	}

	data, _ := json.Marshal(peerInfo)
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
