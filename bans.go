// ==========================
// bans.go
// ==========================
package main

import "sync"

type BanList struct {
	mu     sync.RWMutex
	banned map[string]struct{}
}

func NewBanList() *BanList {
	return &BanList{banned: map[string]struct{}{}}
}

func (b *BanList) Ban(addr string) {
	b.mu.Lock()
	b.banned[addr] = struct{}{}
	b.mu.Unlock()
}

func (b *BanList) IsBanned(addr string) bool {
	b.mu.RLock()
	_, ok := b.banned[addr]
	b.mu.RUnlock()
	return ok
}
