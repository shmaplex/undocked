"use client";

import { useEffect, useState } from "react";
import type { RecommendedService } from "@/types";
import { ListRecommendedServices } from "../../wailsjs/go/main/App";
import { DockerServiceCard } from "../docker-service-card";
import { RecommendedServices } from "../recommended-services";

interface AddServicePanelProps {
	onRefresh: () => void;
}

export function AddServicePanel({ onRefresh }: AddServicePanelProps) {
	const [serviceID, setServiceID] = useState("");
	const [dockerImage, setDockerImage] = useState("");
	const [port, setPort] = useState("6000");
	const [recommended, setRecommended] = useState<RecommendedService[]>([]);

	// 🔑 Load recommended services from backend
	useEffect(() => {
		ListRecommendedServices().then(setRecommended).catch(console.error);
	}, []);

	return (
		<div className="space-y-3">
			<DockerServiceCard
				onRefresh={onRefresh}
				serviceID={serviceID}
				setServiceID={setServiceID}
				dockerImage={dockerImage}
				setDockerImage={setDockerImage}
				port={port}
				setPort={setPort}
			/>

			<div className="flex-1">
				<RecommendedServices
					services={recommended}
					onSelect={(svc) => {
						setServiceID(svc.name);
						setDockerImage(svc.image);
						if (svc.defaultPort) {
							setPort(svc.defaultPort);
						}
					}}
				/>
			</div>
		</div>
	);
}
