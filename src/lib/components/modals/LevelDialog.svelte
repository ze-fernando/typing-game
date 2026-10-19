<script lang="ts">
	import { Clock, Type } from '@lucide/svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import { CUSTOM_LIMITS, createCustomLevel } from '#lib/game/levels';
	import type { LevelConfig } from '#lib/game/types';

	interface Props {
		open?: boolean;
		onstart: (level: LevelConfig) => void;
	}

	let { open = $bindable(false), onstart }: Props = $props();

	let words = $state(20);
	let seconds = $state(60);

	const customLevel = $derived(createCustomLevel(words, seconds));

	function startCustom(): void {
		if (!customLevel) return;
		onstart(customLevel);
		open = false;
	}
</script>

<Dialog
	bind:open
	title="Modo personalizado"
	description="Monte uma partida do seu jeito. Não entra no ranking global; o recorde fica no seu navegador."
	size="md"
>
	<div class="flex flex-col gap-5">
		<div class="grid gap-4 sm:grid-cols-2">
			<label
				class="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
			>
				<span
					class="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]"
				>
					<span class="flex items-center gap-1.5">
						<Type class="h-3.5 w-3.5" aria-hidden="true" />
						Palavras
					</span>
					<span class="font-mono text-sm text-[var(--text)]">{words}</span>
				</span>
				<input
					type="range"
					min={CUSTOM_LIMITS.minWords}
					max={CUSTOM_LIMITS.maxWords}
					value={words}
					oninput={(event) => (words = Number(event.currentTarget.value))}
					class="accent-[var(--primary)]"
				/>
			</label>

			<label
				class="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
			>
				<span
					class="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)]"
				>
					<span class="flex items-center gap-1.5">
						<Clock class="h-3.5 w-3.5" aria-hidden="true" />
						Tempo
					</span>
					<span class="font-mono text-sm text-[var(--text)]">{seconds}s</span>
				</span>
				<input
					type="range"
					min={CUSTOM_LIMITS.minSeconds}
					max={CUSTOM_LIMITS.maxSeconds}
					value={seconds}
					oninput={(event) => (seconds = Number(event.currentTarget.value))}
					class="accent-[var(--primary)]"
				/>
			</label>
		</div>

		<div class="flex flex-wrap items-center justify-between gap-3">
			<p class="text-xs text-[var(--text-muted)]">
				{customLevel
					? `${customLevel.wordCount} palavras em ${customLevel.seconds}s`
					: 'Ajuste os valores para continuar'}
			</p>
			<Button disabled={!customLevel} onclick={startCustom}>Jogar personalizado</Button>
		</div>
	</div>
</Dialog>
