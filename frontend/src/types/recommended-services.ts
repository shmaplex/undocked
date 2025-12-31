// src/types/recommended-services.ts

export interface RecommendedService {
	name: string;
	image: string;
	description: string;
	hubLink: string;
	iconUrl?: string; // optional direct URL to Docker icon/logo
}
