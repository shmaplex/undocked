"use client";

import { ScrollArea } from "@/components/ui/scroll-area";

interface DockerLogsProps {
	logs: string;
}

export function DockerLogs({ logs }: DockerLogsProps) {
	return (
		<ScrollArea className="mt-4 flex-1 min-h-24 max-h-48 p-3 bg-black text-gray-300 rounded font-mono text-xs whitespace-pre-wrap overflow-auto">
			{logs || "Service logs will appear here..."}
		</ScrollArea>
	);
}
