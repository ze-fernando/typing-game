<script lang="ts">
	import { browser } from '$app/env';
	import { Clock, Flame, Gauge, Sparkles, Target, Trophy, Type, Zap } from '@lucide/svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { CUSTOM_LIMITS, FIXED_LEVELS, createCustomLevel } from '#lib/game/levels';
	import { formatWpm } from '#lib/game/scoring';
	import type { BestScore, FixedLevelId, LevelConfig } from '#lib/game/types';
	import { getBest } from '#lib/utils/bests';

	interface Props {
		open?: boolean;
		onstart: (level: LevelConfig) => void;
	}

	let { open = $bindable(false), onstart }: Props = $props();

	let words = $state(20);
	let seconds = $state(60);
	let bests = $state<Record<string, BestScore | null>>({});

	const customLevel = $derived(createCustomLevel(words, seconds));

	const fixedCards: Array<{
		id: FixedLevelId;
		icon: typeof Gauge;
		accentLabel: string;
	}> = [
		{ id: 'iniciante', icon: Gauge, accentLabel: 'acentos leves' },
		{ id: 'amador', icon: Zap, accentLabel: 'acentos moderados' },
		{ id: 'expert', icon: Flame, accentLabel: 'acentos complexos' }
	];

	$effect(() => {
		if (open && browser) {
			bests = {
				iniciante: getBest('iniciante'),
				amador: getBest('amador'),
				expert: getBest('expert'),
				personalizado: getBest('personalizado')
			};
		}
	});

	function startFixed(id: FixedLevelId): void {
		onstart(FIXED_LEVELS[id]);
		open = false;
	}

	function startCustom(): void {
		if (!customLevel) return;
		onstart(customLevel);
		open = false;
	}
</script>

<Dialog
	bind:open
	title="Escolha o nível"
	description="Três desafios fixos ou monte uma partida do seu jeito."
	size="lg"
>
	<div class="flex flex-col gap-6">
		<div class="grid gap-3 sm:grid-cols-3">
			{#each fixedCards as card (card.id)}
				{@const level = FIXED_LEVELS[card.id]}
				{@const best = bests[card.id]}
				<button
					type="button"
					class="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/50 p-4 text-left transition duration-200 hover:-translate-y-1 hover:border-[var(--primary)] hover:bg-[var(--surface-2)] hover:shadow-xl"
					onclick={() => startFixed(card.id)}
				>
					<span
						class="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--on-primary)] shadow"
					>
						<card.icon class="h-5 w-5" aria-hidden="true" />
					</span>
					<span class="flex flex-col gap-1">
						<span class="text-base font-bold">{level.label}</span>
						<span class="text-xs leading-relaxed text-[var(--text-muted)]">{level.description}</span
						>
					</span>
					<span class="flex flex-wrap gap-1.5 text-[0.68rem] font-semibold">
						<span
							class="rounded-full bg-[var(--surface)] px-2 py-1 text-[var(--text-muted)] ring-1 ring-[var(--border)]"
						>
							{level.wordCount} palavras
						</span>
						<span
							class="rounded-full bg-[var(--surface)] px-2 py-1 text-[var(--text-muted)] ring-1 ring-[var(--border)]"
						>
							{level.seconds}s
						</span>
						<span
							class="rounded-full bg-[var(--surface)] px-2 py-1 text-[var(--text-muted)] ring-1 ring-[var(--border)]"
						>
							{card.accentLabel}
						</span>
					</span>
					<span class="mt-auto flex items-center gap-1.5 text-[0.7rem] text-[var(--text-soft)]">
						<Trophy class="h-3.5 w-3.5" aria-hidden="true" />
						{best ? `Recorde: ${formatWpm(best.wpm)} ppm` : 'Sem recorde ainda'}
					</span>
				</button>
			{/each}
		</div>

		<div class="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-4 sm:p-5">
			<div class="mb-4 flex items-start gap-3">
				<span
					class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--text)] ring-1 ring-[var(--border)]"
				>
					<Sparkles class="h-5 w-5" aria-hidden="true" />
				</span>
				<div>
					<h3 class="text-sm font-bold">Personalizado</h3>
					<p class="text-xs text-[var(--text-muted)]">
						Escolha de {CUSTOM_LIMITS.minWords} a {CUSTOM_LIMITS.maxWords} palavras e de
						{CUSTOM_LIMITS.minSeconds} a {CUSTOM_LIMITS.maxSeconds} segundos. Resultados deste modo ficam
						apenas no seu navegador.
					</p>
				</div>
			</div>

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

			<div class="mt-4 flex flex-wrap items-center justify-between gap-3">
				<p class="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
					<Target class="h-4 w-4" aria-hidden="true" />
					{customLevel
						? `${customLevel.wordCount} palavras em ${customLevel.seconds}s`
						: 'Ajuste os valores para continuar'}
				</p>
				<Button size="sm" disabled={!customLevel} onclick={startCustom}>Jogar personalizado</Button>
			</div>
		</div>
	</div>
</Dialog>
