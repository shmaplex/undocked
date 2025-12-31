// types/wails.d.ts
declare module "@wailsapp/runtime" {
	export const runtime: {
		EventsOn: (event: string, callback: (data: any) => void) => () => void;
		EventsEmit: (event: string, data?: any) => void;
	};
}
