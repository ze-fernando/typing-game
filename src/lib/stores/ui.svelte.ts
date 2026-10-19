import { browser } from '$app/env';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastMessage {
	id: number;
	message: string;
	tone: ToastTone;
}

export const ui = $state({
	settingsOpen: false
});

export const toasts = $state<ToastMessage[]>([]);

let nextToastId = 1;

export function openSettings(): void {
	ui.settingsOpen = true;
}

export function closeSettings(): void {
	ui.settingsOpen = false;
}

export function dismissToast(id: number): void {
	const index = toasts.findIndex((toast) => toast.id === id);
	if (index >= 0) toasts.splice(index, 1);
}

export function showToast(message: string, tone: ToastTone = 'info', duration = 4200): number {
	const id = nextToastId;
	nextToastId += 1;
	toasts.push({ id, message, tone });

	if (browser) {
		setTimeout(() => dismissToast(id), duration);
	}

	return id;
}
