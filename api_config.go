// ==========================
// api_config.go
// ==========================
package main

import "sort"

func NewServiceConfigStore() *ServiceConfigStore {
	return &ServiceConfigStore{
		profiles: make(map[string]ServiceProfile),
	}
}

func (s *ServiceConfigStore) Add(p ServiceProfile) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.profiles[p.Name] = p
}

func (s *ServiceConfigStore) Get(name string) (ServiceProfile, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	p, ok := s.profiles[name]
	return p, ok
}

// List returns a snapshot of all service profiles, sorted by name
func (s *ServiceConfigStore) List() []ServiceProfile {
	s.mu.RLock()
	defer s.mu.RUnlock()

	out := make([]ServiceProfile, 0, len(s.profiles))
	for _, p := range s.profiles {
		out = append(out, p)
	}

	sort.Slice(out, func(i, j int) bool {
		return out[i].Name < out[j].Name
	})

	return out
}

// ListRecommended returns only recommended services, sorted by name
func (s *ServiceConfigStore) ListRecommended() []ServiceProfile {
	s.mu.RLock()
	defer s.mu.RUnlock()

	out := make([]ServiceProfile, 0)
	for _, p := range s.profiles {
		if p.Recommended {
			out = append(out, p)
		}
	}

	sort.Slice(out, func(i, j int) bool {
		return out[i].Name < out[j].Name
	})

	return out
}
