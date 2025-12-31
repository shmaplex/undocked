"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recommendedServices } from "@/config/reccomended-services";
import { StartService, StopService } from "../../../wailsjs/go/main/ServiceNode";
import { RecommendedServices } from "../recommended-services";

interface AddServicePanelProps {
	onRefresh: () => void;
}

export function AddServicePanel({ onRefresh }: AddServicePanelProps) {
	const [serviceID, setServiceID] = useState("");
	const [dockerImage, setDockerImage] = useState("");
	const [port, setPort] = useState("5000");
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleStart = async () => {
		if (!serviceID || !dockerImage || !port) {
			setError("All fields are required to start a service.");
			return;
		}
		setError(null);
		setStatus(null);
		setLoading(true);
		try {
			await StartService(serviceID, dockerImage, port);
			setStatus(`Service "${serviceID}" started successfully!`);
			setServiceID("");
			setDockerImage("");
			setPort("5000");
			onRefresh();
		} catch (err: any) {
			setError(`Failed to start service: ${err?.message ?? err}`);
		} finally {
			setLoading(false);
		}
	};

	const handleStop = async () => {
		if (!serviceID) {
			setError("Service ID is required to stop a service.");
			return;
		}
		setError(null);
		setStatus(null);
		setLoading(true);
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
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Add a New Service</CardTitle>
					<CardDescription>
						Start or stop Docker-based services. Search for images on{" "}
						<a
							href="https://hub.docker.com/search?q=&type=image"
							target="_blank"
							rel="noopener noreferrer"
							className="text-color-accent underline"
						>
							Docker Hub
						</a>
						.
					</CardDescription>
				</CardHeader>

				<CardContent className="space-y-4">
					{error && <Alert variant="destructive">{error}</Alert>}
					{status && <Alert variant="default">{status}</Alert>}

					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="flex flex-col space-y-1">
							<Label htmlFor="service-id">Service ID</Label>
							<Input
								id="service-id"
								value={serviceID}
								onChange={(e) => setServiceID(e.target.value)}
								placeholder="Unique service name"
								disabled={loading}
							/>
						</div>

						<div className="flex flex-col space-y-1">
							<Label htmlFor="docker-image">Docker Image</Label>
							<Input
								id="docker-image"
								value={dockerImage}
								onChange={(e) => setDockerImage(e.target.value)}
								placeholder="e.g., libretranslate/libretranslate:latest"
								disabled={loading}
							/>
						</div>

						<div className="flex flex-col space-y-1">
							<Label htmlFor="port">Port</Label>
							<Input
								id="port"
								value={port}
								onChange={(e) => setPort(e.target.value)}
								placeholder="5000"
								disabled={loading}
							/>
						</div>
					</div>

					<div className="flex gap-2">
						<Button variant="default" onClick={handleStart} disabled={loading}>
							{loading ? "Starting..." : "Start Service"}
						</Button>
						<Button variant="destructive" onClick={handleStop} disabled={loading}>
							{loading ? "Stopping..." : "Stop Service"}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Recommended Services Section with distinct background */}
			<RecommendedServices
				services={recommendedServices}
				onSelect={(name, image) => {
					setServiceID(name);
					setDockerImage(image);
				}}
			/>
		</div>
	);
}
