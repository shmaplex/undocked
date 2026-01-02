"use client";

import L, { type Layer, type Map as LeafletMap } from "leaflet";
import { useEffect, useId, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface Service {
	ServiceID: string;
	DockerImage?: string;
	Port?: string;
}

interface Peer {
	ID: string;
	Services: Service[];
}

interface PeerMapProps {
	peers: Peer[];
}

export function PeerMap({ peers }: PeerMapProps) {
	const mapRef = useRef<LeafletMap | null>(null);
	const markersRef = useRef<Layer[]>([]);
	const mapContainerId = useId();

	// Initialize map
	useEffect(() => {
		if (mapRef.current) return;

		const map = L.map(mapContainerId, {
			zoomControl: false, // ✅ remove zoom buttons
			attributionControl: false,
			scrollWheelZoom: false,
			doubleClickZoom: false,
			boxZoom: false,
			keyboard: false,
		}).setView([0, 0], 2);

		// ✅ Monochrome, minimal tile layer
		L.tileLayer("https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png", {
			subdomains: "abcd",
			maxZoom: 5,
		}).addTo(map);

		mapRef.current = map;
	}, [mapContainerId]);

	// Update markers when peers change
	useEffect(() => {
		const map = mapRef.current;
		if (!map) return;

		// Remove previous markers
		markersRef.current.forEach((marker) => {
			map.removeLayer(marker);
		});
		markersRef.current = [];

		// Add new markers
		peers.forEach((peer) => {
			// NOTE: Replace with real geo later
			const lat = Math.random() * 160 - 80;
			const lon = Math.random() * 360 - 180;

			const marker = L.circleMarker([lat, lon], {
				radius: 4,
				color: "#000",
				fillColor: "#000",
				fillOpacity: 0.9,
				weight: 1,
			}).addTo(map);

			marker.bindPopup(
				`<strong>${peer.ID}</strong><br/>${peer.Services.map((s) => s.ServiceID).join(", ")}`,
			);

			markersRef.current.push(marker);
		});
	}, [peers]);

	return (
		<div className="relative w-full h-80 rounded-radius-lg overflow-hidden border border-border">
			{/* Map */}
			<div id={mapContainerId} className="absolute inset-0 peer-map-canvas" />

			{/* Overlay HUD (IPFS-style) */}
			<div className="absolute top-2 left-2 z-1000 bg-background/80 backdrop-blur px-3 py-2 rounded-md text-xs font-mono border border-border">
				<div className="opacity-70">Connected peers</div>
				<div className="text-lg font-semibold">{peers.length}</div>
			</div>
		</div>
	);
}
