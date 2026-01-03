"use client";

import { Box, Bug, Globe, PlusCircle, Settings } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { NavItem } from "@/types";
import { GetPeers, ListServices } from "../wailsjs/go/main/App";
import logo from "./assets/images/logo-universal@2x.png";
import { Sidebar } from "./components/sidebar";
import { ActiveServicesPanel } from "./components/tabs/active-services-panel";
import { AddServicePanel } from "./components/tabs/add-service-panel";
import { PeerMapPanel } from "./components/tabs/peer-map-panel";

export default function App() {
	const [services, setServices] = useState<any[]>([]);
	const [peers, setPeers] = useState<any[]>([]);
	const [activeTab, setActiveTab] = useState("Add Service");

	const navItems: NavItem[] = [
		{ label: "Add Service", icon: PlusCircle },
		{ label: "Active Services", icon: Box },
		{ label: "Peers", icon: Globe, badge: peers.length },
		{ label: "Settings", icon: Settings },
		{ label: "Diagnostics", icon: Bug },
	];

	const refreshServices = useCallback(async () => {
		try {
			const rawServices = await ListServices();
			const rawPeers = await GetPeers();

			setServices(
				rawServices.map((s: any) => ({
					serviceID: s.serviceID,
					dockerImage: s.dockerImage,
					port: s.hostPort,
					status: s.status,
					startedAt: s.startedAt,
				})),
			);

			setPeers(
				rawPeers.map((p: any) => ({
					ID: p.ID ?? p.NodeID ?? "unknown",
					Services: (p.Services ?? []).map((s: any) => ({
						ServiceID: s.serviceID,
						Port: s.hostPort,
						Requests: s.requests,
						Errors: s.errors,
						Bandwidth: s.bandwidth,
					})),
					LastSeen: p.LastSeen,
				})),
			);
		} catch (err) {
			console.error("Failed to refresh services:", err);
		}
	}, []);

	// 🔑 INITIAL LOAD (THIS WAS MISSING)
	useEffect(() => {
		refreshServices();
	}, [refreshServices]);

	// 🔁 LIVE UPDATES FROM GO
	useEffect(() => {
		window.runtime.EventsOn("service-stats", refreshServices);
		window.runtime.EventsOn("service-error", refreshServices);

		return () => {
			window.runtime.EventsOff("service-stats");
			window.runtime.EventsOff("service-error");
		};
	}, [refreshServices]);

	return (
		<div className="flex min-h-screen bg-background text-foreground">
			<Sidebar
				logoSrc={logo}
				navItems={navItems}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				revision="1.0.0"
			/>

			<main className="flex-1 p-6 space-y-6 overflow-auto">
				{activeTab === "Add Service" && <AddServicePanel onRefresh={refreshServices} />}
				{activeTab === "Active Services" && <ActiveServicesPanel services={services} />}
				{activeTab === "Peers" && <PeerMapPanel peers={peers} />}
			</main>
		</div>
	);
}
