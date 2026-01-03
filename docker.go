// ==========================
// docker.go
// ==========================
package main

import (
	"bufio"
	"context"
	"fmt"
	"os/exec"
	"strings"
	"time"
)

type dockerInspect struct {
	State struct {
		Running bool `json:"Running"`
	} `json:"State"`
}

// --------------------------
// Core helpers
// --------------------------

func execDocker(args ...string) error {
	cmd := exec.Command("docker", args...)
	return cmd.Run()
}

func execDockerOutput(args ...string) ([]byte, error) {
	cmd := exec.Command("docker", args...)
	return cmd.CombinedOutput()
}

func runDockerCommand(args ...string) ([]byte, error) {
	cmd := exec.Command("docker", args...)
	return cmd.CombinedOutput()
}

// --------------------------
// Docker status
// --------------------------

func DockerRunning() bool {
	return exec.Command("docker", "info").Run() == nil
}

func DockerImageExists(image string) bool {
	return exec.Command("docker", "image", "inspect", image).Run() == nil
}

// --------------------------
// Image handling
// --------------------------

func PullDockerImage(ctx context.Context, image string, logFn func(string)) error {
	cmd := exec.Command("docker", "pull", image)

	stdout, _ := cmd.StdoutPipe()
	stderr, _ := cmd.StderrPipe()

	if err := cmd.Start(); err != nil {
		return err
	}

	go scanLines(stdout, logFn)
	go scanLines(stderr, logFn)

	return cmd.Wait()
}

func scanLines(r interface {
	Read([]byte) (int, error)
}, logFn func(string)) {
	scanner := bufio.NewScanner(r)
	for scanner.Scan() {
		logFn(scanner.Text())
	}
}

// --------------------------
// Containers
// --------------------------

func ContainerState(name string) (exists, running bool) {
	out, err := exec.Command(
		"docker", "inspect",
		"--type=container",
		"--format", "{{.State.Running}}",
		name,
	).Output()

	if err != nil {
		return false, false
	}

	return true, strings.TrimSpace(string(out)) == "true"
}

func WaitForRunning(name string, timeout time.Duration) error {
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		_, running := ContainerState(name)
		if running {
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}
	return fmt.Errorf("container %s did not start", name)
}

func RunContainer(id, image, port string) error {
	args := []string{
		"run", "-d",
		"--name", id,

		"--label", "undocked.service=true",
		"--label", "undocked.id=" + id,

		"-p", port,
		image,
	}

	return execDocker(args...)
}

func StopAndRemove(serviceID string) {
	_ = execDocker("stop", serviceID)
	_ = execDocker("rm", serviceID)
}

// --------------------------
// Listing
// --------------------------

func ListRunningServices() ([]Service, error) {
	out, err := exec.Command(
		"docker", "ps",
		"--filter", "label=undocked.service=true",
		"--format",
		`{{.ID}}|{{.Image}}|{{.Names}}|{{.Ports}}|{{.Status}}|{{.RunningFor}}`,
	).Output()
	if err != nil {
		return nil, err
	}

	var services []Service

	lines := strings.Split(strings.TrimSpace(string(out)), "\n")
	for _, line := range lines {
		if line == "" {
			continue
		}

		parts := strings.Split(line, "|")
		if len(parts) < 6 {
			continue
		}

		id := parts[2] // container name == ServiceID

		services = append(services, Service{
			ServiceID:   id,
			DockerImage: parts[1],
			HostPort:    extractHostPort(parts[3]),
			Status:      "running",
			StartedAt:   parts[5],
		})
	}

	return services, nil
}

func extractHostPort(ports string) string {
	for _, p := range strings.Split(ports, ",") {
		if strings.Contains(p, "->") {
			left := strings.Split(p, "->")[0]
			return left[strings.LastIndex(left, ":")+1:]
		}
	}
	return ""
}
