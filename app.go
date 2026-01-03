// ==========================
// app.go
// ==========================
package main

import (
	"context"
	"fmt"
	"net/http"
	"os/exec"
	"time"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type App struct {
	ctx    context.Context
	node   *ServiceNode
	api    *WebAPI
	server *http.Server
}

func NewApp() *App {
	return &App{
		node: NewServiceNode(),
	}
}

func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
	a.node.SetWailsContext(ctx)
	_ = a.node.InitP2P()

	// Bind JS events
	runtime.EventsOn(ctx, "check-docker-status", func(optionalData ...interface{}) {
		a.node.CheckDockerStatus() // emits docker-status asynchronously
	})

	runtime.EventsOn(ctx, "start-docker", func(optionalData ...interface{}) {
		go func() {
			cmd := exec.Command("open", "-a", "Docker") // macOS
			err := cmd.Start()
			if err != nil {
				fmt.Println("Failed to start Docker:", err)
				runtime.EventsEmit(ctx, "docker-status", false) // immediate feedback
			} else {
				fmt.Println("Docker starting...")
				runtime.EventsEmit(ctx, "docker-status", true) // immediately assume starting
			}
		}()
	})

	// Initial check
	a.node.CheckDockerStatus()

	// Start periodic Docker status checks every 5s
	go func() {
		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				a.node.CheckDockerStatus()
			case <-a.node.ctx.Done(): // stop if context is canceled
				return
			}
		}
	}()
}

func (a *App) GetNodeSnapshot() NodeSnapshot {
	return NodeSnapshot{
		Services: a.node.ListServices(),
		Peers:    a.node.GetPeers(),
		Stats:    a.node.stats.Snapshot(),
	}
}

// Greet example function
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// Expose ServiceNode methods via App
func (a *App) StartService(serviceID, dockerImage, port string) string {
	return a.node.StartService(serviceID, dockerImage, port)
}

func (a *App) StopService(serviceID string) string {
	return a.node.StopService(serviceID)
}

func (a *App) ListServices() []Service {
	return a.node.ListServices()
}

func (a *App) ListRecommendedServices() []ServiceProfile {
	return a.node.ListRecommendedServices()
}

func (a *App) GetPeers() []PeerInfo {
	return a.node.GetPeers()
}

// Update: CheckDockerStatus no longer returns bool
func (a *App) CheckDockerStatus() {
	a.node.CheckDockerStatus() // emits docker-status asynchronously
}
