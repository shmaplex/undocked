// ==========================
// service_node.go
// ==========================
package main

import (
	"context"
	"sync"
	"time"

	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type ServiceNode struct {
	// Core lifecycle
	mu     sync.Mutex
	ctx    context.Context
	cancel context.CancelFunc

	// App subsystems
	stats  *StatsManager
	config *ServiceConfigStore

	// Runtime state
	peers    map[string]*PeerInfo
	services map[string]Service

	// P2P
	host  host.Host
	ps    *pubsub.PubSub
	topic *pubsub.Topic
}

func NewServiceNode() *ServiceNode {
	ctx, cancel := context.WithCancel(context.Background())

	config := NewServiceConfigStore()
	LoadRecommendedServices(config)

	sn := &ServiceNode{
		ctx:      ctx,
		cancel:   cancel,
		config:   config,
		stats:    NewStatsManager(),
		peers:    make(map[string]*PeerInfo),
		services: make(map[string]Service),
	}

	sn.refreshServices()

	return sn
}

func (sn *ServiceNode) SetWailsContext(ctx context.Context) {
	sn.ctx = ctx
}

// --------------------------
// Docker
// --------------------------

func (sn *ServiceNode) CheckDockerStatus() {
	runtime.EventsEmit(sn.ctx, "docker-status", DockerRunning())
}

// --------------------------
// Services (manual start)
// --------------------------

func (sn *ServiceNode) StartService(id, image, port string) string {
	if !DockerRunning() {
		return "Docker is not running"
	}

	exists, running := ContainerState(id)
	if exists && running {
		return "Service already running"
	}

	if !DockerImageExists(image) {
		_ = PullDockerImage(sn.ctx, image, func(s string) {
			runtime.EventsEmit(sn.ctx, "service-log", s)
		})
	}

	if exists && !running {
		if err := execDocker("start", id); err != nil {
			return err.Error()
		}
	} else {
		if err := RunContainer(id, image, port); err != nil {
			return err.Error()
		}
	}

	if err := WaitForRunning(id, 15*time.Second); err != nil {
		return err.Error()
	}

	sn.refreshServices()
	sn.BroadcastServices()
	return "service started"
}

func (sn *ServiceNode) StopService(id string) string {
	StopAndRemove(id)
	sn.refreshServices()
	sn.BroadcastServices()
	return "service stopped"
}

func (sn *ServiceNode) ListServices() []Service {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	out := make([]Service, 0, len(sn.services))
	for _, s := range sn.services {
		out = append(out, s)
	}
	return out
}

// --------------------------
// Peers
// --------------------------

func (sn *ServiceNode) GetPeers() []PeerInfo {
	sn.mu.Lock()
	defer sn.mu.Unlock()

	out := make([]PeerInfo, 0, len(sn.peers))
	for _, p := range sn.peers {
		out = append(out, *p)
	}
	return out
}

// --------------------------
// Internal
// --------------------------

func (sn *ServiceNode) refreshServices() {
	svcs, err := ListRunningServices()
	if err != nil {
		return
	}

	stats := sn.stats.Snapshot()

	sn.mu.Lock()
	defer sn.mu.Unlock()

	sn.services = make(map[string]Service)
	for _, s := range svcs {
		if st, ok := stats[s.ServiceID]; ok {
			s.Requests = st.Requests
			s.Errors = st.Errors
			s.Bandwidth = st.Bandwidth
		}
		sn.services[s.ServiceID] = s
	}
}
