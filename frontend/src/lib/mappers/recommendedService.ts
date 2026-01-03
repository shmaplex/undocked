// src/mappers/recommendedService.ts
import type { RecommendedService, ServiceProfile } from "@/types";

export function toRecommendedService(p: ServiceProfile): RecommendedService {
	return {
		name: p.name,
		image: p.image, // required
		iconUrl: undefined,
		description: p.image, // placeholder (fine for now)
		hubLink: dockerHubLink(p.image),
	};
}

function dockerHubLink(image: string): string | undefined {
	const [repo] = image.split(":");
	return repo ? `https://hub.docker.com/r/${repo}` : undefined;
}
