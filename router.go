// ==========================
// router.go
// ==========================
package main

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net"
	"net/http"
	"sync"

	libp2p "github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	circuit "github.com/libp2p/go-libp2p/p2p/protocol/circuitv2/relay"
)

const (
	RouterProtocolID = "/undocked/router/1.0.0"
)

type Router struct {
	mu       sync.RWMutex
	ctx      context.Context
	host     host.Host
	sessions *SessionManager
	stats    *StatsManager
	peers    *PeerRegistry
	httpSrv  *http.Server
	banlist  *BanList
}

func NewRouter(ctx context.Context, peers *PeerRegistry, stats *StatsManager) (*Router, error) {
	h, err := libp2p.New(
		libp2p.EnableRelay(),
		libp2p.EnableNATService(),
		libp2p.NATPortMap(),
		libp2p.Transport(circuit.New),
	)
	if err != nil {
		return nil, err
	}

	r := &Router{
		ctx:      ctx,
		host:     h,
		sessions: NewSessionManager(),
		stats:    stats,
		peers:    peers,
		banlist:  NewBanList(),
	}

	h.SetStreamHandler(RouterProtocolID, r.handleStream)
	return r, nil
}

func (r *Router) StartHTTP(addr string) error {
	mux := http.NewServeMux()
	mux.HandleFunc("/v1/translate", r.handleHTTP)
	mux.HandleFunc("/v1/stats", r.handleStats)
	mux.HandleFunc("/v1/ban", r.handleBan)

	r.httpSrv = &http.Server{
		Addr:    addr,
		Handler: mux,
	}

	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}

	go r.httpSrv.Serve(ln)
	return nil
}

func (r *Router) handleHTTP(w http.ResponseWriter, req *http.Request) {
	if r.banlist.IsBanned(req.RemoteAddr) {
		http.Error(w, "banned", http.StatusForbidden)
		return
	}

	session := r.sessions.NewSession(req.RemoteAddr)
	defer r.sessions.End(session.ID)

	target, err := r.peers.SelectLeastLoaded()
	if err != nil {
		http.Error(w, err.Error(), 503)
		return
	}

	resp, err := r.forwardHTTP(req.Context(), target.PeerID, req)
	if err != nil {
		r.stats.RecordError(target.ServiceID)
		http.Error(w, err.Error(), 502)
		return
	}

	r.stats.RecordRequest(target.ServiceID, int64(len(resp)))
	w.Write(resp)
}

func (r *Router) forwardHTTP(ctx context.Context, peerID peer.ID, req *http.Request) ([]byte, error) {
	s, err := r.host.NewStream(ctx, peerID, RouterProtocolID)
	if err != nil {
		return nil, err
	}
	defer s.Close()

	if err := req.Write(s); err != nil {
		return nil, err
	}

	return io.ReadAll(s)
}

func (r *Router) handleStream(s network.Stream) {
	defer s.Close()

	data, err := io.ReadAll(s)
	if err != nil {
		return
	}

	reader := bufio.NewReader(bytes.NewReader(data))
	req, err := http.ReadRequest(reader)
	if err != nil {
		return
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()

	// Write full HTTP response back over libp2p stream
	if err := resp.Write(s); err != nil {
		return
	}
}

func (r *Router) handleStats(w http.ResponseWriter, _ *http.Request) {
	json.NewEncoder(w).Encode(r.stats.Snapshot())
}

func (r *Router) handleBan(w http.ResponseWriter, req *http.Request) {
	var p struct{ Addr string }
	json.NewDecoder(req.Body).Decode(&p)
	r.banlist.Ban(p.Addr)
	w.WriteHeader(http.StatusOK)
}
