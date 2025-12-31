"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DockerServiceFormProps {
	serviceID: string;
	setServiceID: (id: string) => void;
	dockerImage: string;
	setDockerImage: (img: string) => void;
	port: string;
	setPort: (p: string) => void;
	onStart: () => void;
	onStop: () => void;
	loading: boolean;
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
	loading,
	dockerRunning,
}: DockerServiceFormProps) {
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="flex flex-col space-y-1">
					<Label htmlFor="service-id">Service ID</Label>
					<Input
						id="service-id"
						value={serviceID}
						onChange={(e) => setServiceID(e.target.value)}
						placeholder="Unique service name"
						disabled={loading || !dockerRunning}
					/>
				</div>

				<div className="flex flex-col space-y-1">
					<Label htmlFor="docker-image">Docker Image</Label>
					<Input
						id="docker-image"
						value={dockerImage}
						onChange={(e) => setDockerImage(e.target.value)}
						placeholder="e.g., libretranslate/libretranslate:latest"
						disabled={loading || !dockerRunning}
					/>
				</div>

				<div className="flex flex-col space-y-1">
					<Label htmlFor="port">Port</Label>
					<Input
						id="port"
						value={port}
						onChange={(e) => setPort(e.target.value)}
						placeholder="5000"
						disabled={loading || !dockerRunning}
					/>
				</div>
			</div>

			<div className="flex gap-2">
				<Button variant="default" onClick={onStart} disabled={loading || !dockerRunning}>
					{loading ? "Starting..." : "Start Service"}
				</Button>
				<Button variant="destructive" onClick={onStop} disabled={loading || !dockerRunning}>
					{loading ? "Stopping..." : "Stop Service"}
				</Button>
			</div>
		</div>
	);
}
