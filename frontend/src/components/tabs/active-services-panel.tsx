"use client";

import { Alert } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceCard } from "../service-card";

interface ActiveServicesPanelProps {
	services: any[];
	error?: string;
}

export function ActiveServicesPanel({ services, error }: ActiveServicesPanelProps) {
	return (
		<section className="space-y-4">
			<header className="flex items-baseline justify-between">
				<h2 className="text-lg font-semibold">
					Active Services
					<span className="ml-2 text-sm text-muted-foreground">({services.length})</span>
				</h2>
			</header>

			<p className="text-sm text-muted-foreground max-w-prose">
				Services currently running on this node. Manage lifecycle from the
				<strong className="mx-1">Add Service</strong>
				tab.
			</p>

			{error && <Alert variant="destructive">{error}</Alert>}

			{services.length === 0 ? (
				<div className="rounded-lg bg-muted/40 p-6 text-center">
					<div className="text-sm font-medium">No active services</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Start a service to see it listed here.
					</p>
				</div>
			) : (
				<ScrollArea className="max-h-105">
					<div className="grid gap-3">
						{services.map((s) => (
							<ServiceCard key={s.ServiceID} service={s} />
						))}
					</div>
				</ScrollArea>
			)}
		</section>
	);
}
