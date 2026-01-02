"use client";

import { useState } from "react";
import { recommendedServices } from "@/config/reccomended-services";
import { DockerServiceCard } from "../docker-service-card";
import { RecommendedServices } from "../recommended-services";

interface AddServicePanelProps {
	onRefresh: () => void;
}

export function AddServicePanel({ onRefresh }: AddServicePanelProps) {
	const [serviceID, setServiceID] = useState("");
	const [dockerImage, setDockerImage] = useState("");

	return (
		<div className="space-y-3">
			<DockerServiceCard
				onRefresh={onRefresh}
				serviceID={serviceID}
				setServiceID={setServiceID}
				dockerImage={dockerImage}
				setDockerImage={setDockerImage}
			/>

			<div className="flex-1">
				<RecommendedServices
					services={recommendedServices}
					onSelect={(name, image) => {
						setServiceID(name);
						setDockerImage(image);
					}}
				/>
			</div>
		</div>
	);
}
