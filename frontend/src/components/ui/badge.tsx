import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center justify-center border px-1 py-0 text-[10px] font-semibold leading-none whitespace-nowrap shrink-0 gap-1 focus-visible:ring-2 focus-visible:ring-ring/50 transition-colors",
	{
		variants: {
			variant: {
				default: "rounded-full border-transparent bg-primary text-primary-foreground",

				secondary: "rounded-full border-transparent bg-secondary text-secondary-foreground",

				destructive: "rounded-full border-transparent bg-destructive text-white",

				outline: "rounded-full text-foreground border-border",

				/** ✅ SIDEBAR BADGE (FIXED) */
				sidebar:
					"rounded-full min-w-4.5 h-4.5 bg-sidebar-accent text-sidebar-accent-foreground border-transparent",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	},
);

function Badge({
	className,
	variant,
	asChild = false,
	...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
	const Comp = asChild ? Slot : "span";

	return (
		<Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
	);
}

export { Badge, badgeVariants };
