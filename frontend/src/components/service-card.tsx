"use client";

export interface Service {
	ServiceID: string;
	DockerImage?: string;
	HostPort?: string;
	Status?: string;
	StartedAt?: string;
}

export function ServiceCard({ service }: { service: Service }) {
	const status = service.Status ?? "unknown";

	const statusColor =
		status === "running"
			? "bg-success text-white"
			: status === "starting"
				? "bg-warn text-warn-foreground"
				: "bg-destructive text-destructive-foreground";

	return (
		<div className="rounded-lg bg-card shadow-sm hover:shadow-md transition p-4">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<div className="font-medium truncate">{service.ServiceID}</div>

					{service.DockerImage && (
						<div className="text-xs text-muted-foreground truncate mt-0.5">
							{service.DockerImage}
						</div>
					)}
				</div>

				<span className={`px-2 py-0.5 text-xs rounded-full ${statusColor}`}>{status}</span>
			</div>

			<div className="mt-3 flex justify-between text-xs text-muted-foreground">
				<div>
					Port <span className="text-foreground">{service.HostPort ?? "—"}</span>
				</div>

				{service.StartedAt && <div>Started {new Date(service.StartedAt).toLocaleTimeString()}</div>}
			</div>
		</div>
	);
}
