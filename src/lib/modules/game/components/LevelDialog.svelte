<script lang="ts">
	import { Clock, Type } from '@lucide/svelte';
	import Button from '#lib/modules/ui/components/Button.svelte';
	import Dialog from '#lib/modules/ui/components/Dialog.svelte';
	import { CUSTOM_DEFAULTS, CUSTOM_LIMITS, createCustomLevel } from '#lib/modules/game/levels';
	import type { GameMode, LevelConfig } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';

	interface Props {
		open?: boolean;
		mode: GameMode;
		onstart: (level: LevelConfig) => void;
	}

	let { open = $bindable(false), mode, onstart }: Props = $props();

	const i18n = useI18n();
	let words = $state<number>(CUSTOM_DEFAULTS.words);
	let seconds = $state<number>(CUSTOM_DEFAULTS.seconds);

	const customLevel = $derived(createCustomLevel(words, seconds, mode));

	function startCustom(): void {
		if (!customLevel) return;
		onstart(customLevel);
		open = false;
	}
</script>

<Dialog
	bind:open
	title={i18n.messages.custom.title}
	description={i18n.messages.custom.description}
	size="md"
>
	<div class="flex flex-col gap-5">
		<p class="flex flex-wrap items-center gap-2 text-sm text-[var(--text-muted)]">
			{i18n.messages.custom.mode}
			<span class="chip">{i18n.messages.modes.names[mode]}</span>
		</p>

		<div class="grid gap-3 sm:grid-cols-2">
			<label class="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
				<span
					class="flex items-center justify-between text-sm font-semibold text-[var(--text-muted)]"
				>
					<span class="flex items-center gap-1.5">
						<Type class="h-4 w-4" aria-hidden="true" />
						{i18n.messages.custom.words}
					</span>
					<span class="tabular font-mono text-base text-[var(--text)]">{words}</span>
				</span>
				<input
					type="range"
					min={CUSTOM_LIMITS.minWords}
					max={CUSTOM_LIMITS.maxWords}
					value={words}
					oninput={(event) => (words = Number(event.currentTarget.value))}
					class="h-6 cursor-pointer"
				/>
			</label>

			<label class="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4">
				<span
					class="flex items-center justify-between text-sm font-semibold text-[var(--text-muted)]"
				>
					<span class="flex items-center gap-1.5">
						<Clock class="h-4 w-4" aria-hidden="true" />
						{i18n.messages.custom.time}
					</span>
					<span class="tabular font-mono text-base text-[var(--text)]">{seconds}s</span>
				</span>
				<input
					type="range"
					min={CUSTOM_LIMITS.minSeconds}
					max={CUSTOM_LIMITS.maxSeconds}
					value={seconds}
					oninput={(event) => (seconds = Number(event.currentTarget.value))}
					class="h-6 cursor-pointer"
				/>
			</label>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3">
			<p class="text-sm text-[var(--text-muted)]" aria-live="polite">
				{customLevel
					? i18n.messages.levels.customSummary(customLevel.wordCount, customLevel.seconds)
					: i18n.messages.custom.invalid}
			</p>
			<Button disabled={!customLevel} onclick={startCustom}>{i18n.messages.custom.start}</Button>
		</div>
	</div>
</Dialog>
