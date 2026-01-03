// ==========================
// src/types/web-api.ts
// ==========================
export interface ServiceProfile {
	name: string;
	image: string;
	containerPort: number;
	env?: Record<string, string>;
	command?: string[];
	recommended: boolean;
	exposeHTTP: boolean;
	authRequired?: boolean;
	rateLimitPerMin?: number;
}

export interface TranslateRequest {
	q: string;
	source: string;
	target: string;
	format?: "text" | "html";
}
