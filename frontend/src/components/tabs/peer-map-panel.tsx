"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { PeerMap } from "../peer-map";

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
						<TableHead>Services</TableHead>
						<TableHead>Last Seen</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredPeers.map((p) => (
						<TableRow key={p.ID}>
							<TableCell>{p.ID}</TableCell>
							<TableCell>{p.Services.map((s: any) => s.ServiceID).join(", ")}</TableCell>
							<TableCell>{p.LastSeen}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
