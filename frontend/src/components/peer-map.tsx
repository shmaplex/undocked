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
		if (!mapRef.current) {
			mapRef.current = L.map(mapContainerId, {
				zoomControl: true,
				attributionControl: false,
			}).setView([0, 0], 2);

			L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
				attribution: "&copy; OpenStreetMap contributors",
			}).addTo(mapRef.current);
		}
	}, [mapContainerId]);

	// Update markers when peers change
	useEffect(() => {
		if (!mapRef.current) return;

		// Remove previous markers
		markersRef.current.forEach((marker) => {
			mapRef.current?.removeLayer(marker);
		});
		markersRef.current = [];

		// Add new markers
		peers.forEach((peer) => {
			const lat = Math.random() * 180 - 90;
			const lon = Math.random() * 360 - 180;

			const marker = L.circleMarker([lat, lon], {
				radius: 8,
				color: "var(--color-accent)", // outline
				fillColor: "var(--color-accent-foreground)", // fill
				fillOpacity: 0.8,
				weight: 2,
			}).addTo(mapRef.current!);

			marker.bindPopup(
				`<strong>${peer.ID}</strong><br/>${peer.Services.map((s) => s.ServiceID).join(", ")}`,
			);

			markersRef.current.push(marker);
		});
	}, [peers]);

	return <div id={mapContainerId} className="h-80 w-full border border-border rounded-radius-lg" />;
}
