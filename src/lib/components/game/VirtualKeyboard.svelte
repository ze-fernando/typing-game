<script lang="ts">
	import { X } from '@lucide/svelte';
	import { ACCENT_OPTIONS, KEYBOARD_ROWS } from '#lib/game/keyboard-layout';
	import type { KeyboardKey } from '#lib/game/types';

	interface Props {
		pressed?: string[];
		disabled?: boolean;
		onkey: (key: KeyboardKey) => void;
		onchar: (char: string) => void;
	}

	let { pressed = [], disabled = false, onkey, onchar }: Props = $props();

	let accentKey = $state<string | null>(null);

	const accentOptions = $derived(accentKey ? (ACCENT_OPTIONS[accentKey] ?? []) : []);

	function isPressed(code: string): boolean {
		return pressed.includes(code);
	}

	function handleKey(key: KeyboardKey): void {
		if (disabled) return;
		accentKey = null;
		onkey(key);
	}

	function handleAccent(key: KeyboardKey): void {
		if (disabled) return;
		const options = ACCENT_OPTIONS[key.code] ?? [];

		if (options.length <= 1) {
			if (options[0]) onchar(options[0]);
			return;
		}

		accentKey = accentKey === key.code ? null : key.code;
	}

	function handleAccentChoice(char: string): void {
		accentKey = null;
		onchar(char);
	}
</script>

<div class="flex w-full flex-col gap-2">
	{#if accentOptions.length > 0}
		<div
			class="animate-fade-up flex flex-wrap items-center gap-1.5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/95 p-2 shadow-xl"
			role="group"
			aria-label="Escolha o caractere acentuado"
		>
			{#each accentOptions as option (option)}
				<button
					type="button"
					class="keycap-face flex h-9 min-w-9 cursor-pointer items-center justify-center rounded-lg px-2 font-mono text-sm font-bold text-[var(--key-text)]"
					onclick={() => handleAccentChoice(option)}
				>
					{option}
				</button>
			{/each}
			<button
				type="button"
				class="ml-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)]"
				aria-label="Fechar acentos"
				onclick={() => (accentKey = null)}
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	{/if}

	{#each KEYBOARD_ROWS as row (row.id)}
		<div
			class="flex gap-1 {row.mobileHidden ? 'hidden md:flex' : 'flex'}"
			role="group"
			aria-label={`Linha ${row.id}`}
		>
			{#each row.keys as key (key.code)}
				<button
					type="button"
					data-code={key.code}
					{disabled}
					aria-label={key.ariaLabel ?? key.label}
					class="keycap-face {isPressed(key.code)
						? 'is-pressed'
						: ''} flex h-10 min-w-0 cursor-pointer flex-col items-center justify-center rounded-lg px-0.5 font-mono text-[0.6rem] leading-none text-[var(--key-text)] select-none disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-[0.68rem] lg:h-12 lg:text-xs {key.mobileHidden
						? 'hidden sm:flex'
						: ''}"
					style="flex-grow: {key.width ?? 1}; flex-basis: 0;"
					onclick={() => {
						if (key.kind === 'accent') {
							handleAccent(key);
							return;
						}
						handleKey(key);
					}}
					oncontextmenu={(event) => event.preventDefault()}
				>
					{#if key.secondary}
						<span class="text-[0.55rem] opacity-60 sm:text-[0.6rem]">{key.secondary}</span>
					{/if}
					<span class="font-semibold">{key.label}</span>
				</button>
			{/each}
		</div>
	{/each}
</div>
