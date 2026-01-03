// ==========================
// stats.go
// ==========================
package main

import (
	"sync"
	"time"
)

type ServiceStats struct {
	Requests   int64
	Errors     int64
	Bandwidth  int64
	LastUpdate time.Time
}

type StatsManager struct {
	mu    sync.RWMutex
	stats map[string]*ServiceStats
}

func NewStatsManager() *StatsManager {
	return &StatsManager{stats: map[string]*ServiceStats{}}
}

func (sm *StatsManager) RecordRequest(service string, bytes int64) {
	sm.mu.Lock()
	s := sm.ensure(service)
	s.Requests++
	s.Bandwidth += bytes
	s.LastUpdate = time.Now()
	sm.mu.Unlock()
}

func (sm *StatsManager) RecordError(service string) {
	sm.mu.Lock()
	s := sm.ensure(service)
	s.Errors++
	s.LastUpdate = time.Now()
	sm.mu.Unlock()
}

func (sm *StatsManager) ensure(service string) *ServiceStats {
	if s, ok := sm.stats[service]; ok {
		return s
	}
	s := &ServiceStats{}
	sm.stats[service] = s
	return s
}

func (sm *StatsManager) Snapshot() map[string]ServiceStats {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	out := map[string]ServiceStats{}
	for k, v := range sm.stats {
		out[k] = *v
	}
	return out
}
