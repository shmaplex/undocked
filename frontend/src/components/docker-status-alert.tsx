"use client";

import { Play } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrowserOpenURL, EventsEmit } from "../../wailsjs/runtime/runtime";

interface DockerStatusAlertProps {
	dockerRunning: boolean | null;
	error?: string | null;
	status?: string | null;
	onStartDocker?: () => Promise<void>;
}

export function DockerStatusAlert({
	dockerRunning,
	error,
	status,
	onStartDocker,
}: DockerStatusAlertProps) {
	const [startingDocker, setStartingDocker] = useState(false);

	const handleStartDocker = async () => {
		if (!onStartDocker) return;
		setStartingDocker(true);
		try {
			await onStartDocker();
			await EventsEmit("check-docker-status");
		} finally {
			setStartingDocker(false);
		}
	};

	// Loading state
	if (dockerRunning === null) {
		return <p className="text-xs text-gray-500">Checking Docker...</p>;
	}

	return (
		<div className="flex flex-col gap-1 text-xs bg-gray-50 border border-gray-200 rounded px-3 py-2">
			<div className="flex items-center justify-between">
				{/* Status dot + label */}
				<div className="flex items-center gap-2">
					<span
						className={`w-2.5 h-2.5 rounded-full ${dockerRunning ? "bg-green-500" : "bg-red-500"}`}
					/>
					<span className="font-medium">{dockerRunning ? "Docker ready" : "Docker not ready"}</span>
				</div>

				{/* Start button if Docker is not running */}
				{!dockerRunning && onStartDocker && (
					<Button
						variant="outline"
						size="sm"
						className="flex items-center gap-1 text-xs py-1 px-2"
						onClick={handleStartDocker}
						disabled={startingDocker}
					>
						<Play className="w-3 h-3" />
						{startingDocker ? "Starting..." : "Start Docker"}
					</Button>
				)}
			</div>

			{/* Optional messages */}
			{status && dockerRunning && <p className="text-gray-500">{status}</p>}
			{error && <p className="text-red-500">{error}</p>}

			{/* Manual instructions */}
			{!dockerRunning && (
				<p className="text-gray-400">
					Or{" "}
					<button
						type="button"
						className="underline text-blue-500 hover:text-blue-600"
						onClick={(e) => {
							e.stopPropagation();
							BrowserOpenURL("https://docs.docker.com/get-docker/");
						}}
					>
						start Docker manually
					</button>
				</p>
			)}
		</div>
	);
}
