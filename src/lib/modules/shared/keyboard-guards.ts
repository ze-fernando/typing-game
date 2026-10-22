export function isTypingTarget(target: EventTarget | null): boolean {
	return (
		target instanceof HTMLElement &&
		target.closest('input, textarea, select, [contenteditable="true"]') !== null
	);
}

export function hasOpenDialog(): boolean {
	return typeof document !== 'undefined' && document.querySelector('dialog[open]') !== null;
}

export function isComposingKey(event: KeyboardEvent): boolean {
	return (
		event.isComposing || event.key === 'Dead' || event.key === 'Process' || event.keyCode === 229
	);
}
