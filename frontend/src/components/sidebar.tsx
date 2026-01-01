"use client";

import clsx from "clsx";
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NavItem } from "@/types/nav-item";
import { BrowserOpenURL } from "../../wailsjs/runtime/runtime";

interface SidebarProps {
	logoSrc: string;
	navItems: NavItem[];
	activeTab: string;
	onTabChange: (tab: string) => void;
	revision?: string;
}

export const Sidebar: FC<SidebarProps> = ({
	logoSrc,
	navItems,
	activeTab,
	onTabChange,
	revision,
}) => {
	return (
		<aside className="w-48 bg-sidebar border-r border-sidebar-border flex flex-col">
			{/* Logo */}
			<div className="flex items-center justify-center py-4">
				<img src={logoSrc} alt="Logo" className="w-20 h-20 object-contain" />
			</div>

			{/* Navigation */}
			<ScrollArea className="flex-1 px-0 py-2">
				<div className="flex flex-col gap-1">
					{navItems.map((item) => {
						const isActive = activeTab === item.label;

						return (
							<button
								key={item.label}
								type="button"
								onClick={() => onTabChange(item.label)}
								className={clsx(
									"relative w-full flex flex-col items-center gap-2 py-3 transition-colors",
									"text-sidebar-foreground",
									isActive ? "bg-sidebar-primary/15" : "hover:bg-sidebar-primary/10",
								)}
							>
								{/* Active left bar */}
								<span
									className={clsx(
										"absolute left-0 top-0 h-full bg-sidebar-primary transition-all",
										isActive ? "w-1.5" : "w-0",
									)}
								/>

								{/* Icon container */}
								<div className="relative w-10 h-10 flex items-center justify-center">
									<item.icon className="w-8 h-8 stroke-[1.25]" />

									{item.badge != null && (
										<Badge
											variant="sidebar"
											className="absolute top-1 right-0 translate-x-1 -translate-y-1 rounded-full"
										>
											{item.badge}
										</Badge>
									)}
								</div>

								{/* Label */}
								<span className={clsx("text-xs tracking-wide", isActive && "font-semibold")}>
									{item.label}
								</span>
							</button>
						);
					})}
				</div>
			</ScrollArea>

			{/* Bottom info */}
			<div className="px-4 py-3 border-t border-sidebar-border flex flex-col gap-1 text-xs text-muted-foreground">
				<span>Revision {revision || "dev"}</span>

				<button
					type="button"
					className="hover:underline text-left"
					onClick={() => BrowserOpenURL("https://github.com/your-org/your-repo/issues")}
				>
					Report a bug
				</button>
			</div>
		</aside>
	);
};
