// ==========================
// p2p.go
// ==========================
package main

import (
	"encoding/json"
	"time"

	libp2p "github.com/libp2p/go-libp2p"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (sn *ServiceNode) peerDiscoveryLoop(sub *pubsub.Subscription) {
	for {
		msg, err := sub.Next(sn.ctx)
		if err != nil {
			return
		}

		var info PeerInfo
		if err := json.Unmarshal(msg.Data, &info); err != nil {
			continue
		}

		sn.mu.Lock()
		sn.peers[info.ID] = &info
		sn.mu.Unlock()

		runtime.EventsEmit(sn.ctx, "peer-update", info)
	}
}

func (sn *ServiceNode) InitP2P() error {
	h, err := libp2p.New()
	if err != nil {
		return err
	}

	ps, err := pubsub.NewGossipSub(sn.ctx, h)
	if err != nil {
		return err
	}

	topic, err := ps.Join("undocked-services")
	if err != nil {
		return err
	}

	sub, err := topic.Subscribe()
	if err != nil {
		return err
	}

	sn.host = h
	sn.ps = ps
	sn.topic = topic

	go sn.peerDiscoveryLoop(sub)
	return nil
}

func (sn *ServiceNode) BroadcastServices() {
	if sn.topic == nil || sn.host == nil {
		return
	}

	info := PeerInfo{
		ID:       sn.host.ID().String(),
		Services: sn.ListServices(),
		LastSeen: time.Now().Format(time.RFC3339),
	}

	data, _ := json.Marshal(info)
	_ = sn.topic.Publish(sn.ctx, data)
}
