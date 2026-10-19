<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		ArrowRight,
		Clock3,
		Code2,
		Keyboard,
		Medal,
		MousePointerClick,
		Settings2,
		Target,
		Trophy,
		Zap
	} from '@lucide/svelte';
	import BackgroundKeys from '#lib/components/background/BackgroundKeys.svelte';
	import Leaderboard from '#lib/components/game/Leaderboard.svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import SiteHeader from '#lib/components/layout/SiteHeader.svelte';
	import LevelDialog from '#lib/components/modals/LevelDialog.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { gameHref } from '#lib/game/query';
	import { FIXED_LEVELS } from '#lib/game/levels';
	import type { FixedLevelId, LevelConfig } from '#lib/game/types';
	import Seo from '#lib/seo/Seo.svelte';

	let levelDialogOpen = $state(false);
	let rankingLevel = $state<FixedLevelId>('iniciante');
	let rankingRefresh = $state(0);

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
			class="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-10 pb-16 text-center sm:px-6 sm:pt-16"
		>
			<h1
				class="animate-fade-up text-gradient max-w-3xl text-4xl font-black tracking-tight text-balance sm:text-5xl lg:text-6xl"
			>
				Digite mais rápido. Erre menos. Jogue em português.
			</h1>

			<p
				class="animate-fade-up mt-5 max-w-2xl text-base leading-relaxed text-balance text-[var(--text-muted)] sm:text-lg"
			>
				Um jogo de digitação inspirado em Termo e Contexto: palavras em português, teclado
				interativo, acentos de verdade e uma disputa saudável por velocidade e precisão.
			</p>

			<div class="animate-fade-up mt-8 flex flex-col items-center gap-3 sm:flex-row">
				<Button size="lg" onclick={() => (levelDialogOpen = true)}>
					<Keyboard class="h-5 w-5" aria-hidden="true" />
					Iniciar agora
				</Button>
				<a
					href="https://zioncodes.squareweb.app"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 px-7 text-base font-semibold text-[var(--text)] no-underline transition hover:bg-[var(--surface-2)]"
				>
					<Code2 class="h-5 w-5" aria-hidden="true" />
					Desenvolvedor
				</a>
			</div>

			<div class="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
				{#each levelList as level (level.id)}
					<button
						type="button"
						class="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/70 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--primary)] hover:shadow-lg"
						onclick={() => (levelDialogOpen = true)}
					>
						<span class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--surface-2)]">
							{#if level.id === 'iniciante'}
								<Target class="h-4 w-4" aria-hidden="true" />
							{:else if level.id === 'amador'}
								<Zap class="h-4 w-4" aria-hidden="true" />
							{:else}
								<Trophy class="h-4 w-4" aria-hidden="true" />
							{/if}
						</span>
						<span class="flex flex-col">
							<span class="text-sm font-bold">{level.label}</span>
							<span class="text-xs text-[var(--text-muted)]">
								{level.wordCount} palavras • {level.seconds}s
							</span>
						</span>
					</button>
				{/each}
			</div>
		</section>

		<section id="como-jogar" class="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
			<div class="mb-8 text-center">
				<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Como jogar</h2>
				<p class="mt-2 text-sm text-[var(--text-muted)]">Três passos e a partida começa.</p>
			</div>

			<div class="grid gap-4 sm:grid-cols-3">
				<article class="surface-card rounded-2xl p-5">
					<span
						class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--on-primary)]"
					>
						<Settings2 class="h-5 w-5" aria-hidden="true" />
					</span>
					<h3 class="text-base font-bold">1. Escolha o nível</h3>
					<p class="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
						Iniciante, amador, expert ou um modo personalizado com até 100 palavras.
					</p>
				</article>
				<article class="surface-card rounded-2xl p-5">
					<span
						class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--on-primary)]"
					>
						<MousePointerClick class="h-5 w-5" aria-hidden="true" />
					</span>
					<h3 class="text-base font-bold">2. Digite no ritmo</h3>
					<p class="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
						Use o teclado físico ou clique no teclado interativo. Enter e Espaço confirmam a
						palavra.
					</p>
				</article>
				<article class="surface-card rounded-2xl p-5">
					<span
						class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--on-primary)]"
					>
						<Medal class="h-5 w-5" aria-hidden="true" />
					</span>
					<h3 class="text-base font-bold">3. Entre no ranking</h3>
					<p class="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
						Ao final, veja sua velocidade, precisão e salve o resultado com um apelido.
					</p>
				</article>
			</div>
		</section>

		<section id="niveis" class="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
			<div class="mb-8 flex flex-col items-center text-center">
				<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Níveis pensados para evoluir</h2>
				<p class="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">
					A dificuldade cresce junto com a acentuação e o tamanho das palavras.
				</p>
			</div>

			<div class="grid gap-4 md:grid-cols-3">
				{#each levelList as level (level.id)}
					<article
						class="surface-card flex flex-col gap-4 rounded-3xl p-6 transition hover:-translate-y-1"
					>
						<div class="flex items-center justify-between gap-3">
							<h3 class="text-lg font-bold">{level.label}</h3>
							<span
								class="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[0.68rem] font-bold tracking-wide text-[var(--text-muted)] uppercase"
							>
								{level.accent}
							</span>
						</div>
						<p class="text-sm leading-relaxed text-[var(--text-muted)]">{level.description}</p>
						<div
							class="mt-auto flex items-center gap-4 border-t border-[var(--border)] pt-4 text-sm"
						>
							<span class="flex items-center gap-1.5 font-semibold">
								<Keyboard class="h-4 w-4" aria-hidden="true" />
								{level.wordCount} palavras
							</span>
							<span class="flex items-center gap-1.5 font-semibold">
								<Clock3 class="h-4 w-4" aria-hidden="true" />
								{level.seconds}s
							</span>
						</div>
					</article>
				{/each}
			</div>
		</section>

		<section id="ranking" class="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
			<div
				class="grid items-start gap-6 rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6 lg:grid-cols-[1fr_1.1fr] lg:p-8"
			>
				<div>
					<span
						class="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] ring-1 ring-[var(--border)]"
					>
						<Trophy class="h-3.5 w-3.5 text-[var(--warning)]" aria-hidden="true" />
						Ranking online
					</span>
					<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">
						Veja quem digita mais rápido
					</h2>
					<p class="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
						Os resultados são comparados por palavras por minuto, precisão e data. Escolha um nível
						para ver o top 10. Jogadores anônimos também podem participar.
					</p>
					<div class="mt-5 flex flex-wrap gap-2">
						{#each levelList as level (level.id)}
							<button
								type="button"
								class="cursor-pointer rounded-xl border px-3 py-2 text-xs font-bold transition {rankingLevel ===
								level.id
									? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]'
									: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'}"
								aria-pressed={rankingLevel === level.id}
								onclick={() => (rankingLevel = level.id)}
							>
								{level.label}
							</button>
						{/each}
						<button
							type="button"
							class="cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--text-muted)] transition hover:text-[var(--text)]"
							onclick={() => (rankingRefresh += 1)}
						>
							Atualizar
						</button>
					</div>
				</div>

				<Leaderboard level={rankingLevel} refreshKey={rankingRefresh} title="Top 10" />
			</div>
		</section>

		<section id="faq" class="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-16 sm:px-6">
			<div class="mb-8 text-center">
				<h2 class="text-2xl font-bold tracking-tight sm:text-3xl">Perguntas frequentes</h2>
				<p class="mt-2 text-sm text-[var(--text-muted)]">O essencial para começar sem dúvidas.</p>
			</div>

			<div class="flex flex-col gap-3">
				{#each faq as item (item.question)}
					<details
						class="group rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-5 py-4 open:bg-[var(--surface)]"
					>
						<summary
							class="cursor-pointer list-none text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden"
						>
							<span class="flex items-center justify-between gap-4">
								{item.question}
								<span
									class="text-lg text-[var(--text-muted)] transition group-open:rotate-45"
									aria-hidden="true"
								>
									+
								</span>
							</span>
						</summary>
						<p class="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p>
					</details>
				{/each}
			</div>

			<div
				class="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)]/80 p-8 text-center"
			>
				<h2 class="text-xl font-bold">Pronto para bater seu recorde?</h2>
				<p class="text-sm text-[var(--text-muted)]">Escolha um nível e mostre sua velocidade.</p>
				<Button size="lg" onclick={() => (levelDialogOpen = true)}>
					Jogar agora
					<ArrowRight class="h-5 w-5" aria-hidden="true" />
				</Button>
			</div>
		</section>
	</main>

	<SiteFooter />
	<LevelDialog bind:open={levelDialogOpen} onstart={startLevel} />
</div>
