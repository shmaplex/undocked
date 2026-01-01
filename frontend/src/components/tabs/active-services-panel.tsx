"use client";

import { Alert } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ServiceCard } from "../service-card";

interface ActiveServicesPanelProps {
	services: any[];
	error?: string; // optional error message if fetching fails
}

export function ActiveServicesPanel({ services, error }: ActiveServicesPanelProps) {
	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Active Services</h2>

			<p className="text-sm text-muted-foreground">
				This panel shows all services currently running on your node. You can start or stop services
				from the "Add Service" tab. Each service shows its Docker image and port.
			</p>

			{error && (
				<Alert variant="destructive" className="mt-2">
					<p>{error}</p>
				</Alert>
			)}

			{services.length === 0 ? (
				<div className="border border-border rounded-radius-md p-6 text-center text-muted-foreground">
					<p>No active services detected.</p>
					<p className="mt-2 text-sm">
						To add a service, go to the <strong>Add Service</strong> tab and enter the service ID,
						Docker image, and port.
					</p>
				</div>
			) : (
				<ScrollArea className="max-h-100 space-y-2 border border-border rounded-radius-md p-2">
					{services.map((s) => (
						<ServiceCard key={s.ServiceID} service={s} />
					))}
				</ScrollArea>
			)}
		</div>
	);
}
