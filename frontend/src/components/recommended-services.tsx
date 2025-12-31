"use client";

import { RecommendedServiceCard } from "@/components/recommended-service-card";
import type { RecommendedService } from "@/types";

interface RecommendedServicesProps {
	services: RecommendedService[];
	onSelect: (name: string, image: string) => void;
}

export function RecommendedServices({ services, onSelect }: RecommendedServicesProps) {
	return (
		<div className="bg-color-muted p-4 rounded-radius-md space-y-4">
			<h3 className="font-semibold text-lg">Recommended Services</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{services.map((s) => (
					<RecommendedServiceCard key={s.image} service={s} onSelect={onSelect} />
				))}
			</div>
		</div>
	);
}
