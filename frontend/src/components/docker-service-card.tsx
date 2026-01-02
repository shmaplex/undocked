"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StartService, StopService } from "../../wailsjs/go/main/App";
import { EventsEmit, EventsOn } from "../../wailsjs/runtime/runtime";
import { DockerLogs } from "./docker-logs";
import { DockerServiceForm } from "./docker-service-form";
import { DockerStatusAlert } from "./docker-status-alert";

type ServiceAction = "idle" | "starting" | "running" | "stopping" | "error";

export function DockerServiceCard({
	onRefresh,
	serviceID,
	setServiceID,
	dockerImage,
	setDockerImage,
}: any) {
	const [port, setPort] = useState("6000");
	const [serviceState, setServiceState] = useState<ServiceAction>("idle");
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [logs, setLogs] = useState("");
	const [dockerRunning, setDockerRunning] = useState<boolean | null>(null);

	useEffect(() => {
		const unsub = EventsOn("docker-status", setDockerRunning);
		EventsEmit("check-docker-status");
		return unsub;
	}, []);

	useEffect(() => {
		const unsub = EventsOn("service-log", (msg: string) => {
			setLogs((p) => p + msg + "\n");
		});
		return unsub;
	}, []);

	const handleStart = async () => {
		setServiceState("starting");
		setError(null);
		setLogs("");

		const output = await StartService(serviceID, dockerImage, port);

		if (output.toLowerCase().includes("failed") || output.toLowerCase().includes("error")) {
			setServiceState("error");
			setError(output);
			return;
		}

		setServiceState("running");
		setStatus(output);
		onRefresh();
	};

	const handleStop = async () => {
		setServiceState("stopping");
		try {
			await StopService(serviceID);
			setServiceState("idle");
			setStatus(`Service "${serviceID}" stopped.`);
			setServiceID("");
			onRefresh();
		} catch (e: any) {
			setServiceState("error");
			setError(e?.message ?? "Stop failed");
		}
	};

	return (
		<div className="space-y-3">
			<DockerStatusAlert dockerRunning={dockerRunning} error={error} status={status} />

			<Card>
				<CardHeader>
					<CardTitle>Add a New Service</CardTitle>
					<CardDescription>Docker-backed local services</CardDescription>
				</CardHeader>

				<CardContent>
					<DockerServiceForm
						serviceID={serviceID}
						setServiceID={setServiceID}
						dockerImage={dockerImage}
						setDockerImage={setDockerImage}
						port={port}
						setPort={setPort}
						onStart={handleStart}
						onStop={handleStop}
						serviceState={serviceState}
						dockerRunning={dockerRunning}
					/>

					<DockerLogs logs={logs} />
				</CardContent>
			</Card>
		</div>
	);
}
