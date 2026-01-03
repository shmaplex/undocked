// ==========================
// models.go
// ==========================
package main

import (
	"os/exec"
	"sync"
	"time"
)

type NodeSnapshot struct {
	Services []Service               `json:"services"`
	Peers    []PeerInfo              `json:"peers"`
	Stats    map[string]ServiceStats `json:"stats"`
}

type ServiceConfigStore struct {
	mu       sync.RWMutex
	profiles map[string]ServiceProfile
}

// --------------------------

type Service struct {
	ServiceID   string `json:"serviceID"`
	DockerImage string `json:"dockerImage"`
	HostPort    string `json:"hostPort"`
	Status      string `json:"status"`
	StartedAt   string `json:"startedAt"`

	// NEW
	Requests    int64 `json:"requests"`
	Errors      int64 `json:"errors"`
	Bandwidth   int64 `json:"bandwidth"`
	ActiveConns int   `json:"activeConns"`
}

type PeerInfo struct {
	ID       string    `json:"id"`
	Services []Service `json:"services"`
	LastSeen string    `json:"lastSeen"`
}

type ServiceProfile struct {
	Name            string            `json:"name"`
	Image           string            `json:"image"`
	ContainerPort   int               `json:"containerPort"`
	Env             map[string]string `json:"env"`
	Command         []string          `json:"command"`
	Recommended     bool              `json:"recommended"`
	ExposeHTTP      bool              `json:"exposeHTTP"`
	AuthRequired    bool              `json:"authRequired"`
	RateLimitPerMin int               `json:"rateLimitPerMin"`
}

type ServiceInstance struct {
	InstanceID string
	ProfileID  string
	Port       int
	Addr       string
	Cmd        *exec.Cmd
	StartedAt  time.Time
}
