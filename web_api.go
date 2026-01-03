// ==========================
// web_api.go
// ==========================
package main

import (
	"encoding/json"
	"net/http"
)

type WebAPI struct {
	router *Router
	config *ServiceConfigStore
}

func NewWebAPI(router *Router, config *ServiceConfigStore) *WebAPI {
	return &WebAPI{router: router, config: config}
}

func (api *WebAPI) Register(mux *http.ServeMux) {
	mux.HandleFunc("/v1/services/recommended", api.listRecommended)
	mux.HandleFunc("/v1/services/configure", api.configureService)
	mux.HandleFunc("/v1/translate", api.router.handleHTTP)
	mux.HandleFunc("/v1/stats", api.router.handleStats)
	mux.HandleFunc("/v1/ban", api.router.handleBan)
}

func (api *WebAPI) listRecommended(w http.ResponseWriter, _ *http.Request) {
	all := api.config.List()
	out := []ServiceProfile{}
	for _, p := range all {
		if p.Recommended {
			out = append(out, p)
		}
	}
	json.NewEncoder(w).Encode(out)
}

func (api *WebAPI) configureService(w http.ResponseWriter, r *http.Request) {
	var profile ServiceProfile
	if err := json.NewDecoder(r.Body).Decode(&profile); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	api.config.Add(profile)
	w.WriteHeader(http.StatusOK)
}
