package main

import (
	"context"
	"embed"
	"encoding/json"
	"fmt"
	"os/exec"
	"sync"
	"time"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"

	libp2p "github.com/libp2p/go-libp2p"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
)

// ---------------------------
// Data types
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
type ServiceNode struct {
	mu     sync.Mutex
	nodes  map[string]*exec.Cmd
	peers  map[string]*PeerInfo
	host   host.Host
	pubsub *pubsub.PubSub
	ctx    context.Context
	cancel context.CancelFunc
}

func NewServiceNode() *ServiceNode {
	ctx, cancel := context.WithCancel(context.Background())
	return &ServiceNode{
		nodes:  make(map[string]*exec.Cmd),
		peers:  make(map[string]*PeerInfo),
		ctx:    ctx,
		cancel: cancel,
	}
}

func (sn *ServiceNode) StartService(serviceID, dockerImage, port string) error {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	if _, exists := sn.nodes[serviceID]; exists {
		return fmt.Errorf("service already running")
	}

	cmd := exec.Command("docker", "run", "-d", "--name", serviceID, "-p", port+":"+port, dockerImage)
	if err := cmd.Start(); err != nil {
		return err
	}

	sn.nodes[serviceID] = cmd
	sn.BroadcastServices()
	return nil
}

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

func (sn *ServiceNode) ListServices() []Service {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	list := []Service{}
	for id := range sn.nodes {
		list = append(list, Service{
			ServiceID:   id,
			DockerImage: "",
			Port:        "5000",
		})
	}
	return list
}

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

func (sn *ServiceNode) GetPeers() []PeerInfo {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	result := []PeerInfo{}
	for _, p := range sn.peers {
		result = append(result, *p)
	}
	return result
}

//go:embed all:frontend/dist
var assets embed.FS

// ---------------------------
// Main
// ---------------------------
func main() {
	node := NewServiceNode()

	err := wails.Run(&options.App{
		Title:  "undocked",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			if err := node.InitP2P(); err != nil {
				fmt.Println("Error initializing P2P:", err)
			}
		},
		Bind: []interface{}{
			node,
		},
	})

	if err != nil {
		fmt.Println("Error starting app:", err)
	}
}
