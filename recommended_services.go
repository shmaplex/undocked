// ==========================
// recommended_services.go
// ==========================
package main

func (sn *ServiceNode) ListRecommendedServices() []ServiceProfile {
	return sn.config.ListRecommended()
}

func LoadRecommendedServices(store *ServiceConfigStore) {
	store.Add(ServiceProfile{
		Name:          "LibreTranslate",
		Image:         "libretranslate/libretranslate:latest",
		ContainerPort: 6000,
		ExposeHTTP:    true,
		Recommended:   true,
		Env: map[string]string{
			"LT_LOAD_ONLY": "en,ko,ja,zh",
		},
		RateLimitPerMin: 120,
	})

	store.Add(ServiceProfile{
		Name:          "MinIO",
		Image:         "minio/minio:latest",
		ContainerPort: 9000,
		ExposeHTTP:    true,
		Recommended:   true,
		Command:       []string{"server", "/data"},
	})

	store.Add(ServiceProfile{
		Name:          "IPFS",
		Image:         "ipfs/go-ipfs:latest",
		ContainerPort: 5001,
		ExposeHTTP:    false,
		Recommended:   true,
	})

	store.Add(ServiceProfile{
		Name:          "Matrix Synapse",
		Image:         "matrixdotorg/synapse:latest",
		ContainerPort: 8008,
		ExposeHTTP:    true,
		Recommended:   true,
	})
}
