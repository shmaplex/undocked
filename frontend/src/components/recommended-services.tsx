"use client";

import { RecommendedServiceCard } from "@/components/recommended-service-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RecommendedService } from "@/types";

interface RecommendedServicesProps {
	services: RecommendedService[];
	onSelect: (name: string, image: string) => void;
}

export function RecommendedServices({ services, onSelect }: RecommendedServicesProps) {
	return (
		<div className="bg-muted p-4 rounded-xl flex flex-col h-74">
			{" "}
			{/* fixed height */}
			<h3 className="font-semibold text-lg mb-2">Recommended Services</h3>
			<ScrollArea className="flex-1 overflow-auto pr-3">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{services.map((s) => (
						<RecommendedServiceCard key={s.image} service={s} onSelect={onSelect} />
					))}
				</div>
			</ScrollArea>
		</div>
	);
}
