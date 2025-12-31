"use client";

import clsx from "clsx";
import type { FC } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { NavItem } from "@/types/nav-item";

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
		<aside className="w-64 bg-color-sidebar border-r border-color-sidebar-border flex flex-col">
			{/* Logo */}
			<div className="p-6 flex items-center justify-center">
				<img src={logoSrc} alt="Logo" className="w-14 h-14 object-contain" />
			</div>

			{/* Navigation */}
			<ScrollArea className="flex-1 px-2 py-4 space-y-1">
				{navItems.map((item) => {
					const isActive = activeTab === item.label;
					return (
						<button
							type="button"
							key={item.label}
							onClick={() => onTabChange(item.label)}
							className={clsx(
								"flex items-center gap-3 w-full px-4 py-3 rounded-md transition-all duration-200",
								isActive
									? "bg-color-sidebar-primary text-color-sidebar-primary-foreground font-semibold"
									: "text-color-sidebar-foreground hover:bg-color-sidebar-hover hover:text-color-sidebar-primary-foreground",
							)}
						>
							<item.icon className="w-5 h-5" />
							<span>{item.label}</span>
							{item.badge && (
								<span className="ml-auto text-xs bg-color-accent text-color-accent-foreground px-2 py-0.5 rounded-full">
									{item.badge}
								</span>
							)}
						</button>
					);
				})}
			</ScrollArea>

			{/* Bottom info */}
			<div className="px-4 py-3 border-t border-color-sidebar-border flex flex-col gap-1 text-xs text-color-muted-foreground">
				<span>Revision {revision || "dev"}</span>
				<a href="/" className="hover:underline text-color-muted-foreground">
					Report a bug
				</a>
			</div>
		</aside>
	);
};
