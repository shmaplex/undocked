"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ServiceAction = "idle" | "starting" | "running" | "stopping" | "error";

interface DockerServiceFormProps {
	serviceID: string;
	setServiceID: (id: string) => void;
	dockerImage: string;
	setDockerImage: (img: string) => void;
	port: string;
	setPort: (p: string) => void;
	onStart: () => void;
	onStop: () => void;
	serviceState: ServiceAction;
	dockerRunning: boolean | null;
}

export function DockerServiceForm({
	serviceID,
	setServiceID,
	dockerImage,
	setDockerImage,
	port,
	setPort,
	onStart,
	onStop,
	serviceState,
	dockerRunning,
}: DockerServiceFormProps) {
	const disabled = !dockerRunning || serviceState === "starting" || serviceState === "stopping";

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="flex flex-col space-y-1">
					<Label>Service ID</Label>
					<Input
						value={serviceID}
						onChange={(e) => setServiceID(e.target.value)}
						disabled={disabled || serviceState === "running"}
					/>
				</div>

				<div className="flex flex-col space-y-1">
					<Label>Docker Image</Label>
					<Input
						value={dockerImage}
						onChange={(e) => setDockerImage(e.target.value)}
						disabled={disabled || serviceState === "running"}
					/>
				</div>

				<div className="flex flex-col space-y-1">
					<Label>Port</Label>
					<Input
						value={port}
						onChange={(e) => setPort(e.target.value)}
						disabled={disabled || serviceState === "running"}
					/>
				</div>
			</div>

			<div className="flex gap-2">
				<Button onClick={onStart} disabled={serviceState !== "idle" || !dockerRunning}>
					{serviceState === "starting" ? "Starting…" : "Start Service"}
				</Button>

				<Button variant="destructive" onClick={onStop} disabled={serviceState !== "running"}>
					{serviceState === "stopping" ? "Stopping…" : "Stop Service"}
				</Button>
			</div>
		</div>
	);
}
