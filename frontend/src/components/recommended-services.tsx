import { toRecommendedService } from "@/lib/mappers/recommendedService";
import type { ServiceProfile } from "@/types";
import { RecommendedServiceCard } from "./recommended-service-card";
import { ScrollArea } from "./ui/scroll-area";

interface RecommendedServicesProps {
	services: ServiceProfile[];
	onSelect: (service: ServiceProfile) => void;
}

export function RecommendedServices({ services, onSelect }: RecommendedServicesProps) {
	return (
		<div className="bg-muted p-4 rounded-xl flex flex-col h-74">
			<h3 className="font-semibold text-lg mb-2">Recommended Services</h3>

			<ScrollArea className="flex-1 pr-3">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{services.map((s) => {
						const view = toRecommendedService(s);

						return (
							<RecommendedServiceCard
								key={s.image}
								service={view}
								onSelect={() => onSelect(s)} // 👈 keep original
							/>
						);
					})}
				</div>
			</ScrollArea>
		</div>
	);
}
