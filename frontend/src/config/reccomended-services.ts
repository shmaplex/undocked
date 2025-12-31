// src/config/recommended-services.ts
import type { RecommendedService } from "@/types";

export const recommendedServices: RecommendedService[] = [
	{
		name: "LibreTranslate",
		image: "libretranslate/libretranslate:latest",
		description: "Self-hosted translation service",
		hubLink: "https://hub.docker.com/r/libretranslate/libretranslate",
	},
	{
		name: "MinIO",
		image: "minio/minio:latest",
		description: "S3-compatible object storage for file sharing",
		hubLink: "https://hub.docker.com/r/minio/minio",
	},
	{
		name: "IPFS Node",
		image: "ipfs/go-ipfs:latest",
		description: "Decentralized file sharing network",
		hubLink: "https://hub.docker.com/r/ipfs/go-ipfs",
	},
	{
		name: "Matrix Synapse",
		image: "matrixdotorg/synapse:latest",
		description: "Decentralized chat server for real-time communication",
		hubLink: "https://hub.docker.com/r/matrixdotorg/synapse",
	},
	{
		name: "GUN DB",
		image: "gun-db/gun:latest",
		description: "Peer-to-peer real-time database",
		hubLink: "https://hub.docker.com/r/gun-db/gun",
	},
	{
		name: "Syncthing",
		image: "syncthing/syncthing:latest",
		description: "Secure file synchronization between nodes",
		hubLink: "https://hub.docker.com/r/syncthing/syncthing",
	},
	{
		name: "PeerTube",
		image: "chocobozzz/peertube:latest",
		description: "Decentralized video hosting",
		hubLink: "https://hub.docker.com/r/chocobozzz/peertube",
	},
	{
		name: "Nextcloud",
		image: "nextcloud:latest",
		description: "Self-hosted cloud collaboration platform",
		hubLink: "https://hub.docker.com/_/nextcloud",
	},
	{
		name: "Jitsi Meet",
		image: "jitsi/jitsi-meet:latest",
		description: "Open-source video conferencing platform",
		hubLink: "https://hub.docker.com/r/jitsi/jitsi-meet",
	},
	{
		name: "Fission",
		image: "fission/fission:latest",
		description: "Serverless framework for edge and p2p deployments",
		hubLink: "https://hub.docker.com/r/fission/fission",
	},
];
