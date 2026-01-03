// ==========================
// service_launcher.go
// ==========================
package main

import "fmt"

func (sn *ServiceNode) StartFromProfile(name string, hostPort int) string {
	profile, ok := sn.config.Get(name)
	if !ok {
		return "service profile not found"
	}

	port := fmt.Sprintf("%d", hostPort)
	containerPort := fmt.Sprintf("%d", profile.ContainerPort)

	args := []string{
		"run", "-d",
		"--name", name,
		"-p", port + ":" + containerPort,
	}

	for k, v := range profile.Env {
		args = append(args, "-e", k+"="+v)
	}

	args = append(args, profile.Image)
	args = append(args, profile.Command...)

	if _, err := execDockerOutput(args...); err != nil {
		return err.Error()
	}

	if err := WaitForRunning(name, 15); err != nil {
		return err.Error()
	}

	sn.refreshServices()
	sn.BroadcastServices()
	return "service started"
}
