"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StartService, StopService } from "../../wailsjs/go/main/App";
import { EventsEmit, EventsOn } from "../../wailsjs/runtime/runtime";
import { DockerLogs } from "./docker-logs";
import { DockerServiceForm } from "./docker-service-form";
import { DockerStatusAlert } from "./docker-status-alert";

interface DockerServiceCardProps {
	onRefresh: () => void;
	serviceID: string;
	setServiceID: (id: string) => void;
	dockerImage: string;
	setDockerImage: (img: string) => void;
}

export function DockerServiceCard({
	onRefresh,
	serviceID,
	setServiceID,
	dockerImage,
	setDockerImage,
}: DockerServiceCardProps) {
	const [port, setPort] = useState("5000");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [logs, setLogs] = useState("");
	const [dockerRunning, setDockerRunning] = useState<boolean | null>(null);

	// Listen for Docker status updates
	useEffect(() => {
		const unsubDocker = EventsOn("docker-status", (running: boolean) => {
			setDockerRunning(running);
			// Only update service status, not Docker status
		});

		EventsEmit("check-docker-status");
		return () => unsubDocker();
	}, []);

	// Listen for service logs
	useEffect(() => {
		const unsubLogs = EventsOn("service-log", (msg: string) => {
			setLogs((prev) => `${prev}${msg}\n`);
		});
		return () => unsubLogs();
	}, []);

	// Start service handler
	const handleStart = async () => {
		if (!dockerRunning) return setError("Docker is not running.");
		if (!serviceID || !dockerImage || !port) return setError("All fields are required.");

		setLoading(true);
		setError(null);
		setLogs("");
		setStatus(`Starting service "${serviceID}"...`);

		try {
			const output = await StartService(serviceID, dockerImage, port);
			setStatus(output || `Service "${serviceID}" started!`);
		} catch (err: any) {
			setError(err?.message || "Failed to start service");
		} finally {
			setLoading(false);
			onRefresh();
		}
	};

	// Stop service handler
	const handleStop = async () => {
		if (!serviceID) return setError("Service ID is required to stop a service.");

		setLoading(true);
		setError(null);
		setStatus(null);

		try {
			await StopService(serviceID);
			setStatus(`Service "${serviceID}" stopped successfully!`);
			setServiceID("");
			onRefresh();
		} catch (err: any) {
			setError(`Failed to stop service: ${err?.message ?? err}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			{/* Docker Status Card */}
			<DockerStatusAlert
				dockerRunning={dockerRunning}
				error={error}
				status={status}
				onStartDocker={async () => {
					try {
						await EventsEmit("start-docker");
						setTimeout(() => EventsEmit("check-docker-status"), 2000);
					} catch (err) {
						setError("Failed to start Docker");
					}
				}}
			/>

			{/* Service Card */}
			<Card className="flex flex-col h-full">
				<CardHeader>
					<CardTitle>Add a New Service</CardTitle>
					<CardDescription>
						Start or stop Docker-based services. Search images on Docker Hub.
					</CardDescription>
				</CardHeader>

				<CardContent className="flex-1 flex flex-col space-y-3 h-100">
					<DockerServiceForm
						serviceID={serviceID}
						setServiceID={setServiceID}
						dockerImage={dockerImage}
						setDockerImage={setDockerImage}
						port={port}
						setPort={setPort}
						onStart={handleStart}
						onStop={handleStop}
						loading={loading}
						dockerRunning={dockerRunning}
					/>

					<DockerLogs logs={logs} />
				</CardContent>
			</Card>
		</div>
	);
}
