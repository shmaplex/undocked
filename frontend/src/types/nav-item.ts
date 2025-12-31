import type { FC, SVGProps } from "react";

export interface NavItem {
	label: string;
	icon: FC<SVGProps<SVGSVGElement>>;
	badge?: string | number;
}
