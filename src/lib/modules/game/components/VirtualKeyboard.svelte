<script lang="ts">
	import { onMount } from 'svelte';
	import { Delete, X } from '@lucide/svelte';
	import { ACCENT_OPTIONS, KEYBOARD_ROWS } from '#lib/modules/game/keyboard-layout';
	import type { KeyboardKey, KeyboardRow } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';
	import {
		keyboardTier,
		visibleKeyboardRows,
		type KeyboardTier
	} from '#lib/modules/game/keyboard-tiers';

	interface Props {
		pressed?: string[];
		disabled?: boolean;
		onkey: (key: KeyboardKey) => void;
		onchar: (char: string) => void;
	}

	let { pressed = [], disabled = false, onkey, onchar }: Props = $props();

	const i18n = useI18n();
	let accentKey = $state<string | null>(null);
	let tier = $state<KeyboardTier>('full');
	let activeCode = $state<string | null>(null);

	const ACCENT_CODES = ['BracketLeft', 'Quote', 'Semicolon'];
	const allKeys = KEYBOARD_ROWS.flatMap((row) => row.keys);
	const accentKeys = ACCENT_CODES.map((code) => allKeys.find((key) => key.code === code)).filter(
		(key): key is KeyboardKey => Boolean(key)
	);

	const accentOptions = $derived(accentKey ? (ACCENT_OPTIONS[accentKey] ?? []) : []);
	const rows = $derived<KeyboardRow[]>(visibleKeyboardRows(tier));
	const compact = $derived(tier === 'compact');
	const visibleCodes = $derived(
		new Set([
			...rows.flatMap((row) => row.keys.map((key) => key.code)),
			...(compact ? ['Backspace', 'Space', 'Enter', ...ACCENT_CODES] : [])
		])
	);
	const tabStopCode = $derived(
		activeCode && visibleCodes.has(activeCode)
			? activeCode
			: compact
				? ACCENT_CODES[0]
				: (rows[0]?.keys[0]?.code ?? null)
	);

	onMount(() => {
		const compactQuery = window.matchMedia('(max-width: 639px)');
		const mediumQuery = window.matchMedia('(max-width: 767px)');
		const shortQuery = window.matchMedia('(max-height: 480px)');
		const sync = (): void => {
			tier = keyboardTier(compactQuery.matches, mediumQuery.matches, shortQuery.matches);
		};

		sync();
		compactQuery.addEventListener('change', sync);
		mediumQuery.addEventListener('change', sync);
		shortQuery.addEventListener('change', sync);

		return () => {
			compactQuery.removeEventListener('change', sync);
			mediumQuery.removeEventListener('change', sync);
			shortQuery.removeEventListener('change', sync);
		};
	});

	$effect(() => {
		const last = pressed[pressed.length - 1];
		if (last && visibleCodes.has(last)) activeCode = last;
	});

	function keyLabel(key: KeyboardKey): string {
		if (key.kind === 'space') return i18n.messages.keyboard.space;
		if (key.kind === 'backspace') return i18n.messages.keyboard.delete;
		return i18n.messages.keyboard.keyLabels[key.code] ?? key.label;
	}

	function keyText(key: KeyboardKey): string {
		return key.kind === 'space' ? i18n.messages.keyboard.space : key.label;
	}

	function handleKeyPress(key: KeyboardKey): void {
		if (disabled) return;
		activeCode = key.code;

		if (key.kind === 'accent') {
			const options = ACCENT_OPTIONS[key.code] ?? [];
			if (options.length <= 1) {
				if (options[0]) onchar(options[0]);
				return;
			}
			accentKey = accentKey === key.code ? null : key.code;
			return;
		}

		accentKey = null;
		onkey(key);
	}

	function pressAction(code: string, kind: KeyboardKey['kind'], label: string): void {
		if (disabled) return;
		activeCode = code;
		accentKey = null;
		onkey({ code, kind, label });
	}

	function chooseAccent(char: string): void {
		accentKey = null;
		onchar(char);
	}

	function handleNavigation(event: KeyboardEvent): void {
		const direction = event.key;
		if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(direction)) return;

		const root = event.currentTarget as HTMLElement;
		const current = document.activeElement;
		if (!(current instanceof HTMLButtonElement) || !current.dataset.code) return;

		const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-code]')].filter(
			(button) => !button.disabled && button.getClientRects().length > 0
		);
		if (!buttons.includes(current)) return;

		event.preventDefault();

		const origin = current.getBoundingClientRect();
		const originX = origin.left + origin.width / 2;
		const originY = origin.top + origin.height / 2;
		const horizontal = direction === 'ArrowLeft' || direction === 'ArrowRight';
		const sign = direction === 'ArrowRight' || direction === 'ArrowDown' ? 1 : -1;
		let best: HTMLButtonElement | null = null;
		let bestScore = Number.POSITIVE_INFINITY;

		for (const button of buttons) {
			if (button === current) continue;
			const rect = button.getBoundingClientRect();
			const dx = rect.left + rect.width / 2 - originX;
			const dy = rect.top + rect.height / 2 - originY;
			const forward = (horizontal ? dx : dy) * sign;
			if (forward <= 2) continue;
			const score = forward + Math.abs(horizontal ? dy : dx) * 2.5;
			if (score < bestScore) {
				bestScore = score;
				best = button;
			}
		}

		if (!best) return;
		best.focus();
		activeCode = best.dataset.code ?? null;
	}

	function keepTypingFocus(event: MouseEvent): void {
		if (event.target instanceof Element && event.target.closest('button')) event.preventDefault();
	}

	const keyBase =
		'keycap-face flex min-w-0 cursor-pointer flex-col items-center justify-center rounded-md font-mono leading-none text-[var(--key-text)] select-none disabled:cursor-not-allowed disabled:opacity-55';
</script>

<div
	class="flex w-full flex-col gap-1.5 sm:gap-2"
	role="toolbar"
	aria-label={i18n.messages.keyboard.group}
	aria-orientation="horizontal"
	tabindex="-1"
	onkeydown={handleNavigation}
	onmousedown={keepTypingFocus}
>
	<p class="sr-only">{i18n.messages.keyboard.instructions}</p>

	{#if accentOptions.length > 0}
		<div
			class="animate-rise flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-2 shadow-[var(--shadow-card)]"
			role="group"
			aria-label={i18n.messages.keyboard.accentPicker}
		>
			{#each accentOptions as option (option)}
				<button
					type="button"
					class="{keyBase} h-11 min-w-11 px-2 text-base font-bold"
					onclick={() => chooseAccent(option)}
				>
					{option}
				</button>
			{/each}
			<button
				type="button"
				class="ml-auto flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
				aria-label={i18n.messages.keyboard.closeAccents}
				onclick={() => (accentKey = null)}
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	{/if}

	{#if compact}
		<div
			class="flex items-center gap-1"
			role="group"
			aria-label={i18n.messages.keyboard.accentStrip}
		>
			<span
				class="shrink-0 pr-1 pl-0.5 text-[0.6875rem] font-semibold tracking-[0.15em] text-[var(--text-muted)] uppercase"
				aria-hidden="true"
			>
				{i18n.messages.keyboard.accentStripTitle}
			</span>
			{#each accentKeys as key (key.code)}
				<button
					type="button"
					data-code={key.code}
					{disabled}
					aria-label={keyLabel(key)}
					tabindex={tabStopCode === key.code ? 0 : -1}
					class="{keyBase} {pressed.includes(key.code)
						? 'is-pressed'
						: ''} h-11 flex-1 gap-0.5 text-sm"
					onclick={() => handleKeyPress(key)}
					oncontextmenu={(event) => event.preventDefault()}
				>
					{#if key.secondary}<span class="text-[0.6875rem] opacity-60">{key.secondary}</span>{/if}
					<span class="font-bold">{key.label}</span>
				</button>
			{/each}
		</div>
	{/if}

	{#each rows as row (row.id)}
		<div
			class="flex gap-1"
			role="group"
			aria-label={i18n.messages.keyboard.row(i18n.messages.keyboard.rows[row.id] ?? row.id)}
			data-row={row.id}
		>
			{#each row.keys as key (key.code)}
				<button
					type="button"
					data-code={key.code}
					{disabled}
					aria-label={keyLabel(key)}
					tabindex={tabStopCode === key.code ? 0 : -1}
					class="{keyBase} {pressed.includes(key.code) ? 'is-pressed' : ''} {compact
						? 'h-11 text-sm font-bold'
						: 'h-10 gap-0.5 px-0.5 text-[0.6875rem] sm:h-11 lg:text-xs'}"
					style="flex-grow: {key.width ?? 1}; flex-basis: 0;"
					onclick={() => handleKeyPress(key)}
					oncontextmenu={(event) => event.preventDefault()}
				>
					{#if key.secondary && !compact}
						<span class="text-[0.6875rem] opacity-60">{key.secondary}</span>
					{/if}
					{#if key.kind === 'backspace'}
						<Delete class="h-4 w-4" aria-hidden="true" />
					{:else}
						<span class="truncate font-semibold">{keyText(key)}</span>
					{/if}
				</button>
			{/each}
		</div>
	{/each}

	{#if compact}
		<div class="flex gap-1" role="group" aria-label={i18n.messages.keyboard.actions}>
			<button
				type="button"
				data-code="Backspace"
				{disabled}
				aria-label={i18n.messages.keyboard.delete}
				tabindex={tabStopCode === 'Backspace' ? 0 : -1}
				class="{keyBase} {pressed.includes('Backspace') ? 'is-pressed' : ''} h-11"
				style="flex-grow: 1.4; flex-basis: 0;"
				onclick={() => pressAction('Backspace', 'backspace', i18n.messages.keyboard.delete)}
			>
				<Delete class="h-4 w-4" aria-hidden="true" />
			</button>
			<button
				type="button"
				data-code="Space"
				{disabled}
				tabindex={tabStopCode === 'Space' ? 0 : -1}
				class="{keyBase} {pressed.includes('Space') ? 'is-pressed' : ''} h-11 text-xs font-semibold"
				style="flex-grow: 4; flex-basis: 0;"
				onclick={() => pressAction('Space', 'space', i18n.messages.keyboard.space)}
			>
				{i18n.messages.keyboard.space}
			</button>
			<button
				type="button"
				data-code="Enter"
				{disabled}
				tabindex={tabStopCode === 'Enter' ? 0 : -1}
				class="{keyBase} {pressed.includes('Enter') ? 'is-pressed' : ''} h-11 text-xs font-semibold"
				style="flex-grow: 1.6; flex-basis: 0;"
				onclick={() => pressAction('Enter', 'enter', i18n.messages.keyboard.enter)}
			>
				{i18n.messages.keyboard.enter}
			</button>
		</div>
	{/if}
</div>
