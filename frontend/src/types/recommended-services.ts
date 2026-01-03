// src/types/recommended-services.ts

export interface RecommendedService {
	name: string;
	image: string;
	description?: string;
	defaultPort?: string;
	hubLink?: string;
	iconUrl?: string;
}
