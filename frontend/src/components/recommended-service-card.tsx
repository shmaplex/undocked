"use client";

import fallbackIconUrl from "@/assets/images/docker-image.svg";
import { Card } from "@/components/ui/card";
import type { RecommendedService } from "@/types";

interface RecommendedServiceCardProps {
	service: RecommendedService;
	onSelect: (name: string, image: string) => void;
}

export function RecommendedServiceCard({ service, onSelect }: RecommendedServiceCardProps) {
	return (
		<Card
			className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 hover:shadow-lg transition-shadow cursor-pointer bg-color-background rounded-radius-md"
			onClick={() => onSelect(service.name, service.image)}
		>
			{/* Icon / Avatar */}
			<div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-color-muted-foreground flex items-center justify-center">
				{service.iconUrl ? (
					<img src={service.iconUrl} alt={service.name} className="w-full h-full object-contain" />
				) : (
					<img
						src={fallbackIconUrl}
						alt={service.name}
						className="w-full h-full object-contain opacity-20"
					/>
				)}
			</div>

			{/* Main info */}
			<div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
				<div className="flex flex-col">
					<h4 className="font-semibold text-lg truncate">
						<a
							href={service.hubLink}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:underline"
							onClick={(e) => e.stopPropagation()}
						>
							{service.name}
						</a>
					</h4>
					<p className="text-sm text-color-muted-foreground mt-1">{service.description}</p>
				</div>
			</div>
		</Card>
	);
}
