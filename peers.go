// ==========================
// peers.go
// ==========================
package main

import (
	"errors"
	"sync"

	"github.com/libp2p/go-libp2p/core/peer"
)

type ServiceEndpoint struct {
	ServiceID string
	PeerID    peer.ID
	Load      int64
}

type PeerRegistry struct {
	mu       sync.RWMutex
	services []ServiceEndpoint
}

func NewPeerRegistry() *PeerRegistry {
	return &PeerRegistry{}
}

func (pr *PeerRegistry) Update(s []ServiceEndpoint) {
	pr.mu.Lock()
	pr.services = s
	pr.mu.Unlock()
}

func (pr *PeerRegistry) SelectLeastLoaded() (ServiceEndpoint, error) {
	pr.mu.RLock()
	defer pr.mu.RUnlock()
	if len(pr.services) == 0 {
		return ServiceEndpoint{}, errors.New("no services available")
	}
	min := pr.services[0]
	for _, s := range pr.services {
		if s.Load < min.Load {
			min = s
		}
	}
	return min, nil
}
