// ==========================
// sessions.go
// ==========================
package main

import (
	"sync"
	"time"

	"github.com/google/uuid"
)

type Session struct {
	ID        string
	Remote    string
	StartedAt time.Time
	LastSeen  time.Time
}

type SessionManager struct {
	mu       sync.RWMutex
	sessions map[string]*Session
}

func NewSessionManager() *SessionManager {
	return &SessionManager{sessions: map[string]*Session{}}
}

func (sm *SessionManager) NewSession(remote string) *Session {
	s := &Session{
		ID:        uuid.NewString(),
		Remote:    remote,
		StartedAt: time.Now(),
		LastSeen:  time.Now(),
	}
	sm.mu.Lock()
	sm.sessions[s.ID] = s
	sm.mu.Unlock()
	return s
}

func (sm *SessionManager) End(id string) {
	sm.mu.Lock()
	delete(sm.sessions, id)
	sm.mu.Unlock()
}
