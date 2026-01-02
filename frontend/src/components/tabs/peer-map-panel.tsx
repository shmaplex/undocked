"use client";

import { useState } from "react";
import { PeerMap } from "@/components/peer-map";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface PeerMapPanelProps {
	peers: any[];
}

export function PeerMapPanel({ peers }: PeerMapPanelProps) {
	const [filter, setFilter] = useState("");

	const filteredPeers = peers.filter((p) => p.ID.includes(filter));

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-semibold">Global Peer Map</h2>

			<PeerMap peers={filteredPeers} />

			<Input
				type="text"
				placeholder="Filter peers..."
				value={filter}
				onChange={(e) => setFilter(e.target.value)}
				className="w-full max-w-xl"
			/>

			<Table className="w-full">
				<TableHeader>
					<TableRow>
						<TableHead>Peer ID</TableHead>
						<TableHead># Services</TableHead>
						<TableHead>Services</TableHead>
						<TableHead>Last Seen</TableHead>
						<TableHead>Status</TableHead>
					</TableRow>
				</TableHeader>

				<TableBody>
					{filteredPeers.map((p) => {
						const lastSeen = new Date(p.LastSeen);
						const isAlive = Date.now() - lastSeen.getTime() < 60_000;

						return (
							<TableRow key={p.ID}>
								<TableCell className="font-mono text-xs">{p.ID.slice(0, 16)}…</TableCell>

								<TableCell>{p.Services.length}</TableCell>

								<TableCell className="truncate max-w-xs">
									{p.Services.map((s: any) => s.ServiceID).join(", ")}
								</TableCell>

								<TableCell className="text-sm text-muted-foreground">
									{lastSeen.toLocaleTimeString()}
								</TableCell>

								<TableCell>
									<Badge variant={isAlive ? "secondary" : "destructive"}>
										{isAlive ? "Online" : "Stale"}
									</Badge>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
}
