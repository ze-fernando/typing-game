<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { ChevronRight, RefreshCw } from '@lucide/svelte';
	import BackgroundKeys from '#lib/components/background/BackgroundKeys.svelte';
	import Leaderboard from '#lib/components/game/Leaderboard.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import LevelDialog from '#lib/components/modals/LevelDialog.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import { FIXED_LEVELS } from '#lib/game/levels';
	import { gameHref } from '#lib/game/query';
	import { formatWpm } from '#lib/game/scoring';
	import type { BestScore, FixedLevelId, LevelConfig } from '#lib/game/types';
	import Seo from '#lib/seo/Seo.svelte';
	import { ui } from '#lib/stores/ui.svelte';
	import { getBest } from '#lib/utils/bests';

	let levelDialogOpen = $state(false);
	let rankingLevel = $state<FixedLevelId>('iniciante');
	let rankingRefresh = $state(0);
	let bests = $state<Partial<Record<FixedLevelId, BestScore | null>>>({});

	const levelList = [FIXED_LEVELS.iniciante, FIXED_LEVELS.amador, FIXED_LEVELS.expert];

	const faq = [
		{
			question: 'Preciso instalar alguma coisa para jogar?',
			answer:
				'Não. O Typing Game roda direto no navegador, de graça, e funciona em computador, tablet e celular.'
		},
		{
			question: 'Como funciona o modo personalizado?',
			answer:
				'Você escolhe de 1 a 100 palavras e de 5 a 120 segundos. Esse modo não entra no ranking global; o recorde fica salvo no seu navegador.'
		},
		{
			question: 'Os acentos contam?',
			answer:
				'Sim. Cada nível cobra um tipo de acentuação: leve no iniciante, moderada no amador e complexa no expert. Maiúsculas e minúsculas não fazem diferença.'
		},
		{
			question: 'O ranking é anônimo?',
			answer:
				'Sim. Você pode jogar sem cadastro. Para aparecer no ranking, basta informar um apelido opcional ao final da partida.'
		}
	];

	function startLevel(level: LevelConfig): void {
		void goto(resolve(gameHref(level) as `/jogar?${string}`));
	}

	function openCustom(): void {
		levelDialogOpen = true;
	}

	onMount(() => {
		bests = {
			iniciante: getBest('iniciante'),
			amador: getBest('amador'),
			expert: getBest('expert')
		};

		const shortcuts: Record<string, () => void> = {
			'1': () => startLevel(FIXED_LEVELS.iniciante),
			'2': () => startLevel(FIXED_LEVELS.amador),
			'3': () => startLevel(FIXED_LEVELS.expert),
			'4': openCustom
		};

		function handleKeydown(event: KeyboardEvent): void {
			if (levelDialogOpen || ui.settingsOpen) return;
			if (event.metaKey || event.ctrlKey || event.altKey) return;

			const target = event.target;
			if (target instanceof HTMLElement && target.closest('input, textarea, select')) return;

			shortcuts[event.key]?.();
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<Seo
	title="Typing Game — Jogo de digitação em português"
	description="Treine velocidade e precisão digitando palavras em português. Níveis iniciante, amador e expert, modo personalizado e ranking online."
	path="/"
/>

<div class="relative min-h-dvh overflow-hidden">
	<BackgroundKeys />
	<SiteHeader />

	<main id="conteudo" class="relative z-10">
		<section
			class="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pt-12 pb-12 text-center sm:px-6 sm:pt-20"
		>
			<h1 class="text-3xl font-black tracking-tight text-balance sm:text-4xl lg:text-5xl">
				Digite mais rápido. Erre menos.
			</h1>
			<p
				class="mt-4 max-w-lg text-sm leading-relaxed text-balance text-[var(--text-muted)] sm:text-base"
			>
				Jogo de digitação em português com acentos de verdade, teclado interativo e ranking por
				nível. Escolha um desafio e comece.
			</p>

			<div
				class="mt-9 w-full divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-left"
			>
				{#each levelList as level, index (level.id)}
					{@const best = bests[level.id]}
					<button
						type="button"
						class="group flex w-full cursor-pointer items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--surface-2)] sm:px-5"
						onclick={() => startLevel(level)}
					>
						<span class="font-mono text-xs text-[var(--text-soft)]" aria-hidden="true">
							{String(index + 1).padStart(2, '0')}
						</span>
						<span class="flex min-w-0 flex-1 flex-col gap-0.5">
							<span class="text-sm font-bold sm:text-base">{level.label}</span>
							<span class="truncate text-xs text-[var(--text-muted)]">
								{level.wordCount} palavras · {level.seconds}s · acento {level.accent}
							</span>
						</span>
						{#if best}
							<span class="hidden shrink-0 font-mono text-xs text-[var(--text-muted)] sm:block">
								recorde {formatWpm(best.wpm)} ppm
							</span>
						{/if}
						<kbd class="hidden shrink-0 sm:block">{index + 1}</kbd>
						<ChevronRight
							class="h-4 w-4 shrink-0 text-[var(--text-soft)] transition-transform group-hover:translate-x-0.5"
							aria-hidden="true"
						/>
					</button>
				{/each}

				<button
					type="button"
					class="group flex w-full cursor-pointer items-center gap-4 px-4 py-4 transition-colors hover:bg-[var(--surface-2)] sm:px-5"
					onclick={openCustom}
				>
					<span class="font-mono text-xs text-[var(--text-soft)]" aria-hidden="true">04</span>
					<span class="flex min-w-0 flex-1 flex-col gap-0.5">
						<span class="text-sm font-bold sm:text-base">Personalizado</span>
						<span class="truncate text-xs text-[var(--text-muted)]">
							até 100 palavras · até 120s · fora do ranking
						</span>
					</span>
					<kbd class="hidden shrink-0 sm:block">4</kbd>
					<ChevronRight
						class="h-4 w-4 shrink-0 text-[var(--text-soft)] transition-transform group-hover:translate-x-0.5"
						aria-hidden="true"
					/>
				</button>
			</div>

			<p class="mt-3 text-xs text-[var(--text-muted)]">
				Pressione <kbd>1</kbd>–<kbd>4</kbd> ou clique. Na partida, <kbd>Enter</kbd> ou
				<kbd>Espaço</kbd> confirmam a palavra.
			</p>
		</section>

		<section id="ranking" class="mx-auto w-full max-w-2xl scroll-mt-20 px-4 pb-12 sm:px-6">
			<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-sm font-bold sm:text-base">Ranking · Top 10</h2>
				<div class="flex items-center gap-2">
					<div
						class="flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5"
						role="group"
						aria-label="Nível do ranking"
					>
						{#each levelList as level (level.id)}
							<button
								type="button"
								aria-pressed={rankingLevel === level.id}
								class="cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition-colors {rankingLevel ===
								level.id
									? 'bg-[var(--surface-3)] text-[var(--text)]'
									: 'text-[var(--text-muted)] hover:text-[var(--text)]'}"
								onclick={() => (rankingLevel = level.id)}
							>
								{level.label}
							</button>
						{/each}
					</div>
					<IconButton label="Atualizar ranking" onclick={() => (rankingRefresh += 1)}>
						<RefreshCw class="h-4 w-4" aria-hidden="true" />
					</IconButton>
				</div>
			</div>

			<Leaderboard level={rankingLevel} refreshKey={rankingRefresh} />
		</section>

		<section id="faq" class="mx-auto w-full max-w-2xl scroll-mt-20 px-4 pb-16 sm:px-6">
			<h2 class="text-sm font-bold text-[var(--text-muted)]">Dúvidas frequentes</h2>
			<div class="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
				{#each faq as item (item.question)}
					<details class="group">
						<summary
							class="flex cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden"
						>
							{item.question}
							<span
								class="text-[var(--text-soft)] transition-transform group-open:rotate-45"
								aria-hidden="true"
							>
								+
							</span>
						</summary>
						<p class="pb-4 text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p>
					</details>
				{/each}
			</div>
		</section>
	</main>

	<SiteFooter />
	<LevelDialog bind:open={levelDialogOpen} onstart={startLevel} />
</div>
