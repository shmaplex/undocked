"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface Service {
	ServiceID: string;
	DockerImage?: string;
	Port?: string;
}

interface ServiceCardProps {
	/** The service object to display */
	service: Service;
}

/**
 * Displays a service card with its ID, Docker image, and port.
 */
export function ServiceCard({ service }: ServiceCardProps) {
	return (
		<Card className="hover:shadow-xl transition-shadow duration-200 bg-card border border-border rounded-radius-md">
			<CardHeader>
				<CardTitle className="text-card-foreground text-lg">{service.ServiceID}</CardTitle>
				{service.DockerImage && (
					<CardDescription className="text-muted-foreground text-sm truncate">
						{service.DockerImage}
					</CardDescription>
				)}
			</CardHeader>
			<CardContent className="flex justify-between items-center pt-2">
				<Badge variant="secondary" className="bg-accent text-accent-foreground rounded-radius-sm">
					Port: {service.Port ?? "N/A"}
				</Badge>
			</CardContent>
		</Card>
	);
}
