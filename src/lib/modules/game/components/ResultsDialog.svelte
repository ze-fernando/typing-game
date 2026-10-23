<script lang="ts">
	import { Award, Home, RotateCcw, Send } from '@lucide/svelte';
	import { submitScore, type SubmitErrorCode } from '#lib/modules/leaderboard/api';
	import Leaderboard from '#lib/modules/leaderboard/components/Leaderboard.svelte';
	import Button from '#lib/modules/ui/components/Button.svelte';
	import Dialog from '#lib/modules/ui/components/Dialog.svelte';
	import { isFixedLevelId, isTranslationMode } from '#lib/modules/game/levels';
	import { formatDuration } from '#lib/modules/game/scoring';
	import type { BestScore, FixedLevelId, GameResult, ScoreEntry } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';
	import { formatPercent, formatSpeed } from '#lib/modules/i18n/format';
	import { NICKNAME_MAX_LENGTH } from '#lib/modules/leaderboard/limits';

	interface Props {
		open?: boolean;
		result: GameResult | null;
		isRecord?: boolean;
		previousBest?: BestScore | null;
		onrestart: () => void;
		onhome: () => void;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		result,
		isRecord = false,
		previousBest = null,
		onrestart,
		onhome,
		onclose
	}: Props = $props();

	const i18n = useI18n();
	let nickname = $state('');
	let saving = $state(false);
	let errorCode = $state<SubmitErrorCode | null>(null);
	let savedFor = $state.raw<GameResult | null>(null);
	let savedScore = $state<ScoreEntry | null>(null);
	let savedRank = $state<number | null>(null);
	let refreshKey = $state(0);

	const saved = $derived(result !== null && savedFor === result);
	const rankedLevel = $derived<FixedLevelId | null>(
		result && isFixedLevelId(result.level) ? result.level : null
	);
	const canRank = $derived(rankedLevel !== null && result !== null && result.wordsCompleted > 0);
	const recordDelta = $derived(
		isRecord && result && previousBest ? Math.max(0, result.wpm - previousBest.wpm) : null
	);
	const MIN_RELIABLE_MS = 1000;

	function activeTime(durationMs: number): string {
		if (durationMs >= 10_000) return formatDuration(durationMs);
		const seconds = (durationMs / 1000).toFixed(1);
		return `${i18n.locale === 'en' ? seconds : seconds.replace('.', ',')}s`;
	}

	const errorText = $derived(errorCode ? errorMessage(errorCode) : '');

	const stats = $derived(
		result
			? [
					{
						label: i18n.messages.results.speed,
						value:
							result.durationMs < MIN_RELIABLE_MS
								? '—'
								: `${formatSpeed(result.wpm, i18n.locale)} ${i18n.messages.common.speedUnit}`
					},
					{
						label: i18n.messages.results.accuracy,
						value: formatPercent(result.accuracy, i18n.locale)
					},
					{
						label: i18n.messages.results.words,
						value: `${result.wordsCompleted}/${result.wordsTotal}`
					},
					{ label: i18n.messages.results.activeTime, value: activeTime(result.durationMs) },
					{ label: i18n.messages.results.bestCombo, value: `×${result.bestCombo}` },
					isTranslationMode(result.mode)
						? { label: i18n.messages.results.hints, value: String(result.hintedWords) }
						: { label: i18n.messages.results.misses, value: String(result.errors) }
				]
			: []
	);

	$effect(() => {
		if (result && savedFor !== result) {
			errorCode = null;
			savedScore = null;
			savedRank = null;
			saving = false;
		}
	});

	function errorMessage(code: SubmitErrorCode): string {
		const errors = i18n.messages.results.errors;
		if (code === 'network') return errors.network;
		if (code === 'rate_limited') return errors.rateLimited;
		if (code === 'invalid_nickname') return errors.nickname;
		if (code === 'unavailable') return errors.unavailable;
		if (code === 'response') return errors.response;
		return errors.invalid;
	}

	function handleSave(event: SubmitEvent): void {
		event.preventDefault();
		const submittedFor = result;
		if (!submittedFor || !rankedLevel || !canRank || saving || saved) return;

		saving = true;
		errorCode = null;

		void submitScore({
			nickname,
			mode: submittedFor.mode,
			level: rankedLevel,
			wordsCompleted: submittedFor.wordsCompleted,
			wordsTotal: submittedFor.wordsTotal,
			correctChars: submittedFor.correctChars,
			comparedChars: submittedFor.comparedChars,
			hintedWords: submittedFor.hintedWords,
			durationMs: submittedFor.durationMs
		}).then((response) => {
			if (result !== submittedFor) return;
			saving = false;

			if (!response.ok) {
				errorCode = response.error;
				return;
			}

			savedFor = submittedFor;
			savedScore = response.score;
			savedRank = response.rank;
			refreshKey += 1;
		});
	}
</script>

<Dialog
	bind:open
	title={i18n.messages.results.title}
	description={i18n.messages.results.description}
	size="lg"
	scrollLabel={i18n.messages.results.region}
	dismissOnBackdrop={false}
	{onclose}
>
	{#if result}
		<div class="flex flex-col gap-5" data-results>
			{#if isRecord}
				<div
					class="animate-pop flex items-center gap-3 rounded-xl border border-[var(--primary)]/50 bg-[var(--primary-soft)] px-4 py-3"
					role="status"
				>
					<Award class="h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
					<p class="flex flex-wrap items-baseline gap-x-2 text-sm">
						<span class="font-bold tracking-wide text-[var(--primary)] uppercase">
							{i18n.messages.results.record}
						</span>
						<span class="text-[var(--text-muted)]">
							{recordDelta !== null
								? i18n.messages.results.recordDelta(formatSpeed(recordDelta, i18n.locale))
								: i18n.messages.results.firstRecord}
						</span>
					</p>
				</div>
			{/if}

			<dl
				class="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3"
			>
				{#each stats as stat, index (stat.label)}
					<div class="bg-[var(--surface)] px-4 py-3">
						<dt
							class="text-[0.6875rem] font-semibold tracking-[0.15em] text-[var(--text-muted)] uppercase"
						>
							{stat.label}
						</dt>
						<dd
							class="tabular mt-1 font-mono font-bold {index === 0
								? 'text-2xl whitespace-nowrap text-[var(--primary)] sm:text-3xl'
								: 'text-xl'}"
						>
							{stat.value}
						</dd>
					</div>
				{/each}
			</dl>

			{#if result.hintedWords > 0}
				<p class="text-sm text-[var(--text-muted)]">
					{i18n.messages.results.hintsNote(result.hintedWords)}
				</p>
			{/if}

			{#if rankedLevel}
				<section class="flex flex-col gap-3 rounded-xl border border-[var(--border)] p-4 sm:p-5">
					<h3 class="text-sm font-bold tracking-wide">
						{i18n.messages.results.rankingTitle(
							i18n.messages.levels.names[rankedLevel],
							i18n.messages.modes.names[result.mode]
						)}
					</h3>

					{#if !canRank}
						<p class="text-sm text-[var(--text-muted)]">{i18n.messages.results.incompleteNotice}</p>
					{:else if saved}
						<p class="text-sm font-semibold text-[var(--success)]" role="status">
							{i18n.messages.results.saved}
							{savedRank !== null
								? i18n.messages.results.rank(savedRank)
								: i18n.messages.results.outsideTop}
						</p>
					{:else}
						<form class="flex flex-col gap-2 sm:flex-row sm:items-start" onsubmit={handleSave}>
							<label class="flex flex-1 flex-col gap-1">
								<span class="sr-only">{i18n.messages.results.nickname}</span>
								<input
									type="text"
									name="nickname"
									bind:value={nickname}
									maxlength={NICKNAME_MAX_LENGTH}
									autocomplete="nickname"
									placeholder={i18n.messages.results.nicknamePlaceholder}
									class="h-11 w-full rounded-lg border border-[var(--control-border)] bg-[var(--surface)] px-3 text-base text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30"
								/>
								<span class="text-xs text-[var(--text-muted)]"
									>{i18n.messages.results.nicknameHelp}</span
								>
							</label>
							<Button type="submit" disabled={saving}>
								<Send class="h-4 w-4" aria-hidden="true" />
								{saving ? i18n.messages.results.saving : i18n.messages.results.save}
							</Button>
						</form>
						{#if errorText}
							<p role="alert" class="text-sm font-semibold text-[var(--danger)]">{errorText}</p>
						{/if}
					{/if}

					<Leaderboard mode={result.mode} level={rankedLevel} {refreshKey} highlight={savedScore} />
				</section>
			{:else}
				<p
					class="rounded-xl border border-[var(--border)] px-4 py-3 text-sm text-[var(--text-muted)]"
				>
					{i18n.messages.results.customNotice}
				</p>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		<div class="flex flex-wrap items-center justify-between gap-3">
			<Button variant="ghost" size="sm" onclick={onhome}>
				<Home class="h-4 w-4" aria-hidden="true" />
				{i18n.messages.common.home}
			</Button>
			<Button size="md" data-autofocus onclick={onrestart}>
				<RotateCcw class="h-4 w-4" aria-hidden="true" />
				{i18n.messages.common.playAgain}
			</Button>
		</div>
	{/snippet}
</Dialog>
