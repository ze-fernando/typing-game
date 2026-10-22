<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { ChevronRight } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import LeaderboardPanel from '#lib/modules/leaderboard/components/LeaderboardPanel.svelte';
	import SiteFooter from '#lib/modules/layout/components/SiteFooter.svelte';
	import SiteHeader from '#lib/modules/layout/components/SiteHeader.svelte';
	import LevelDialog from '#lib/modules/game/components/LevelDialog.svelte';
	import SegmentedControl from '#lib/modules/ui/components/SegmentedControl.svelte';
	import {
		CUSTOM_DEFAULTS,
		FIXED_LEVEL_IDS,
		createCustomLevel,
		getFixedLevel
	} from '#lib/modules/game/levels';
	import { gameHref } from '#lib/modules/game/query';
	import type { BestScore, FixedLevelConfig, GameMode, LevelConfig } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';
	import { formatSpeed } from '#lib/modules/i18n/format';
	import { localizedPath, type AppPath } from '#lib/modules/i18n/paths';
	import Seo from '#lib/modules/seo/Seo.svelte';
	import { bestStorageKey, getBest } from '#lib/modules/game/bests';
	import { isTypingTarget, hasOpenDialog } from '#lib/modules/shared/keyboard-guards';

	const i18n = useI18n();
	const primaryMode = $derived<GameMode>(i18n.locale === 'en' ? 'en' : 'pt');

	let selectedMode = $state<GameMode | null>(null);
	let customOpen = $state(false);
	let bests = $state<Record<string, BestScore | null>>({});

	const menuMode = $derived(selectedMode ?? primaryMode);
	const levels = $derived(
		FIXED_LEVEL_IDS.map((id) => getFixedLevel(id, menuMode)).filter(
			(level): level is FixedLevelConfig => level !== null
		)
	);
	const customTarget = $derived(
		createCustomLevel(CUSTOM_DEFAULTS.words, CUSTOM_DEFAULTS.seconds, menuMode)
	);
	const customBest = $derived(customTarget ? (bests[bestStorageKey(customTarget)] ?? null) : null);
	const modeOptions = $derived([
		{ value: primaryMode, label: i18n.messages.modes.typingTab },
		{ value: 'en-pt' as GameMode, label: i18n.messages.modes.translationTab }
	]);

	$effect(() => {
		const currentTargets = customTarget ? [...levels, customTarget] : levels;
		const keys = currentTargets.map((target) => bestStorageKey(target));
		let active = true;

		void Promise.all(currentTargets.map((target) => getBest(target))).then((results) => {
			if (!active) return;
			bests = Object.fromEntries(keys.map((key, index) => [key, results[index]]));
		});

		return () => {
			active = false;
		};
	});

	function startLevel(level: LevelConfig): void {
		const href = gameHref(localizedPath(i18n.locale, 'play'), level, primaryMode);
		void goto(resolve(href as `${AppPath}?${string}`));
	}

	onMount(() => {
		function handleKeydown(event: KeyboardEvent): void {
			if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
			if (hasOpenDialog() || isTypingTarget(event.target)) return;

			const index = ['1', '2', '3'].indexOf(event.key);
			if (index >= 0 && levels[index]) {
				event.preventDefault();
				startLevel(levels[index]);
			} else if (event.key === '4') {
				event.preventDefault();
				customOpen = true;
			}
		}

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<Seo
	title={i18n.messages.meta.homeTitle}
	description={i18n.messages.meta.homeDescription}
	route="home"
	withFaq
/>

<div class="flex min-h-dvh flex-col">
	<SiteHeader route="home" />

	<main id="conteudo" class="relative z-10 flex-1">
		<section class="mx-auto w-full max-w-3xl px-4 pt-10 pb-8 sm:px-6 sm:pt-16">
			<h1
				class="max-w-xl text-[clamp(2rem,7vw,3.25rem)] leading-[1.05] font-bold tracking-wide text-balance"
			>
				{i18n.messages.home.heading}
			</h1>

			<div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<p class="font-mono text-[clamp(2.75rem,13vw,5rem)] leading-none font-bold tracking-tight">
					<span class="sr-only">{i18n.messages.home.demoWordLabel}</span>
					<span aria-hidden="true">cora</span><span
						class="text-[var(--primary)] underline decoration-[var(--primary)] decoration-4 underline-offset-[0.18em]"
						aria-hidden="true">çã</span
					><span aria-hidden="true">o</span>
				</p>
				<ul
					class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-muted)] sm:flex-col sm:items-end"
				>
					<li class="flex items-center gap-1.5">
						<span class="sr-only">{i18n.messages.home.keyComboTilde}</span>
						<span class="flex items-center gap-1.5" aria-hidden="true">
							<kbd>~</kbd>+<kbd>a</kbd>=<span class="font-mono font-bold text-[var(--text)]">ã</span
							>
						</span>
					</li>
					<li class="flex items-center gap-1.5">
						<span class="sr-only">{i18n.messages.home.keyComboAcute}</span>
						<span class="flex items-center gap-1.5" aria-hidden="true">
							<kbd>´</kbd>+<kbd>a</kbd>=<span class="font-mono font-bold text-[var(--text)]">á</span
							>
						</span>
					</li>
					<li class="flex items-center gap-1.5">
						<kbd>ç</kbd>
						<span>{i18n.messages.home.keyOwnCedilla}</span>
					</li>
				</ul>
			</div>

			<p class="mt-6 max-w-[60ch] text-base leading-relaxed text-[var(--text-muted)]">
				{i18n.messages.home.lead}
			</p>
		</section>

		<section class="mx-auto w-full max-w-3xl px-4 pb-14 sm:px-6">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-xl font-bold tracking-wide">
					{i18n.messages.home.menuHeading}
				</h2>
				<SegmentedControl
					options={modeOptions}
					value={menuMode}
					label={i18n.messages.modes.menuTitle}
					size="md"
					stretch
					onchange={(value) => (selectedMode = value)}
				/>
			</div>

			{#if menuMode === 'en-pt'}
				<p
					class="mb-4 max-w-[60ch] text-sm leading-relaxed text-[var(--text-muted)]"
					aria-live="polite"
				>
					{i18n.messages.modes.translationIntro}
				</p>
			{/if}

			<ul class="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
				{#each levels as level, index (level.id)}
					{@const best = bests[bestStorageKey(level)]}
					<li class="border-b border-[var(--border)] last:border-b-0">
						<button
							type="button"
							data-level={level.id}
							class="group grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-offset-[-3px] sm:px-5"
							onclick={() => startLevel(level)}
						>
							<span class="flex min-w-0 flex-col gap-1.5">
								<span class="flex flex-wrap items-center gap-2">
									<span class="text-base font-bold tracking-wide sm:text-lg">
										{i18n.messages.levels.names[level.id]}
									</span>
									{#if level.id === 'iniciante'}
										<span class="chip border-[var(--primary)]/45 text-[var(--primary)]">
											{i18n.messages.levels.recommended}
										</span>
									{/if}
								</span>
								<span class="text-sm leading-relaxed text-[var(--text-muted)]">
									{i18n.messages.levels.descriptions[menuMode][level.id]}
								</span>
								<span
									class="tabular flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[var(--text-soft)]"
								>
									<span>{i18n.messages.levels.wordsCount(level.wordCount)}</span>
									<span aria-hidden="true">·</span>
									<span>{i18n.messages.levels.seconds(level.seconds)}</span>
									{#if best}
										<span aria-hidden="true">·</span>
										<span class="font-semibold text-[var(--primary)]">
											{i18n.messages.levels.record(formatSpeed(best.wpm, i18n.locale))}
										</span>
									{/if}
								</span>
							</span>
							<span class="flex items-center gap-3">
								<kbd class="hidden sm:inline-flex" aria-hidden="true">{index + 1}</kbd>
								<ChevronRight
									class="h-5 w-5 text-[var(--text-soft)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]"
									aria-hidden="true"
								/>
							</span>
						</button>
					</li>
				{/each}
				<li>
					<button
						type="button"
						data-level="personalizado"
						class="group grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-[var(--surface-2)] focus-visible:outline-offset-[-3px] sm:px-5"
						onclick={() => (customOpen = true)}
					>
						<span class="flex min-w-0 flex-col gap-1.5">
							<span class="text-base font-bold tracking-wide sm:text-lg">
								{i18n.messages.levels.names.personalizado}
							</span>
							<span class="text-sm leading-relaxed text-[var(--text-muted)]">
								{i18n.messages.levels.customDescription}
							</span>
							{#if customTarget && customBest}
								<span
									class="tabular flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-[var(--text-soft)]"
								>
									<span>
										{i18n.messages.levels.customRecord(
											customTarget.wordCount,
											customTarget.seconds,
											formatSpeed(customBest.wpm, i18n.locale)
										)}
									</span>
								</span>
							{/if}
						</span>
						<span class="flex items-center gap-3">
							<kbd class="hidden sm:inline-flex" aria-hidden="true">4</kbd>
							<ChevronRight
								class="h-5 w-5 text-[var(--text-soft)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--primary)]"
								aria-hidden="true"
							/>
						</span>
					</button>
				</li>
			</ul>

			<p class="mt-3 hidden text-sm text-[var(--text-muted)] sm:block">
				{i18n.messages.home.shortcutsHint}
			</p>
		</section>

		<section
			class="mx-auto w-full max-w-3xl scroll-mt-20 px-4 pb-14 sm:px-6"
			data-section="ranking"
		>
			<h2 class="mb-4 text-xl font-bold tracking-wide">
				{i18n.messages.home.rankingHeading}
			</h2>
			<div class="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
				<LeaderboardPanel initialMode={primaryMode} />
			</div>
		</section>

		<section class="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
			<h2 class="text-xl font-bold tracking-wide">{i18n.messages.home.faqHeading}</h2>
			<div class="mt-4 border-y border-[var(--border)]">
				{#each i18n.messages.home.faq as item (item.question)}
					<details class="group border-b border-[var(--border)] last:border-b-0">
						<summary
							class="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-semibold marker:hidden [&::-webkit-details-marker]:hidden"
						>
							{item.question}
							<ChevronRight
								class="h-4 w-4 shrink-0 text-[var(--text-soft)] transition-transform group-open:rotate-90"
								aria-hidden="true"
							/>
						</summary>
						<p class="max-w-[65ch] pb-4 text-sm leading-relaxed text-[var(--text-muted)]">
							{item.answer}
						</p>
					</details>
				{/each}
			</div>
		</section>
	</main>

	<SiteFooter />
	<LevelDialog bind:open={customOpen} mode={menuMode} onstart={startLevel} />
</div>
