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
		<aside className="w-48 bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)] flex flex-col">
			{/* Logo */}
			<div className="p-0 flex items-center justify-center">
				<img src={logoSrc} alt="Logo" className="w-24 h-24 object-contain" />
			</div>

			{/* Navigation */}
			<ScrollArea className="flex-1 px-0 py-4 space-y-1">
				{navItems.map((item) => {
					const isActive = activeTab === item.label;
					return (
						<button
							key={item.label}
							type="button"
							onClick={() => onTabChange(item.label)}
							className={clsx(
								"relative flex flex-col items-center gap-2 w-full py-2 pl-4 pr-4 transition-all duration-200",
								isActive
									? "bg-[var(--color-sidebar-primary)]/20 font-semibold"
									: "hover:bg-[var(--color-sidebar-primary)]/10",
							)}
						>
							{/* Left border */}
							<div
								className={clsx(
									"absolute left-0 top-0 h-full bg-[var(--color-sidebar-primary)]",
									isActive ? "w-2" : "w-0",
								)}
							/>

							{/* Icon */}
							<item.icon className="w-12 h-12 stroke-[1.5]" />
							{/* Label */}
							<span className="text-sm text-[var(--color-sidebar-foreground)]">{item.label}</span>
							{/* Badge */}
							{item.badge && (
								<span className="absolute top-2 right-2 text-xs bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-foreground)] px-2 py-0.5 rounded-full">
									{item.badge}
								</span>
							)}
						</button>
					);
				})}
			</ScrollArea>

			{/* Bottom info */}
			<div className="px-4 py-3 border-t border-[var(--color-sidebar-border)] flex flex-col gap-1 text-xs text-[var(--color-muted-foreground)]">
				<span>Revision {revision || "dev"}</span>
				<a href="/" className="hover:underline text-[var(--color-muted-foreground)]">
					Report a bug
				</a>
			</div>
		</aside>
	);
};
