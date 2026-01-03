"use client";

import fallbackIconUrl from "@/assets/images/docker-image.svg";
import { Card } from "@/components/ui/card";
import type { RecommendedService } from "@/types";
import { BrowserOpenURL } from "../../wailsjs/runtime/runtime";

interface RecommendedServiceCardProps {
	service: RecommendedService;
	onSelect: (service: RecommendedService) => void;
}

export function RecommendedServiceCard({ service, onSelect }: RecommendedServiceCardProps) {
	return (
		<Card
			className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4 hover:shadow-lg transition-shadow cursor-pointer bg-background rounded-md"
			onClick={() => onSelect(service)}
		>
			{/* Icon */}
			<div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted-foreground flex items-center justify-center">
				{service.iconUrl ? (
					<img src={service.iconUrl} alt={service.name} className="w-full h-full object-contain" />
				) : (
					<img
						src={fallbackIconUrl}
						alt={service.name}
						className="w-2/3 h-2/3 object-contain invert"
					/>
				)}
			</div>

			{/* Info */}
			<div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
				<div className="flex flex-col">
					<h4 className="font-semibold text-lg truncate">
						<button
							type="button"
							className="text-left hover:underline"
							onClick={(e) => {
								e.stopPropagation();
								if (service.hubLink) {
									BrowserOpenURL(service.hubLink);
								}
							}}
						>
							{service.name}
						</button>
					</h4>

					{service.description && (
						<p className="text-sm text-muted-foreground mt-1">{service.description}</p>
					)}
				</div>
			</div>
		</Card>
	);
}
