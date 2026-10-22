<script lang="ts">
	import { fetchLeaderboard } from '#lib/modules/leaderboard/api';
	import Button from '#lib/modules/ui/components/Button.svelte';
	import type { FixedLevelId, GameMode, ScoreEntry } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';
	import { formatPercent, formatSpeed } from '#lib/modules/i18n/format';
	import { displayNickname } from '#lib/modules/leaderboard/limits';

	interface Props {
		mode: GameMode;
		level: FixedLevelId;
		limit?: number;
		refreshKey?: number;
		highlight?: ScoreEntry | null;
	}

	let { mode, level, limit = 10, refreshKey = 0, highlight = null }: Props = $props();

	const i18n = useI18n();
	let scores = $state<ScoreEntry[] | null>(null);
	let loading = $state(true);
	let retryKey = $state(0);

	$effect(() => {
		const request = { mode, level, limit, refreshKey, retryKey };
		loading = true;
		let active = true;

		void fetchLeaderboard(request.mode, request.level, request.limit).then((data) => {
			if (!active) return;
			scores = data;
			loading = false;
		});

		return () => {
			active = false;
		};
	});

	function isHighlighted(score: ScoreEntry): boolean {
		return (
			highlight !== null &&
			highlight.createdAt === score.createdAt &&
			highlight.nickname === score.nickname
		);
	}
</script>

<div data-leaderboard={`${mode}:${level}`} aria-busy={loading}>
	{#if loading}
		<p class="sr-only" role="status">{i18n.messages.leaderboard.loading}</p>
		<ul class="flex flex-col gap-1.5" aria-hidden="true">
			{#each [0, 1, 2, 3] as row (row)}
				<li class="h-10 animate-pulse rounded-lg bg-[var(--surface-2)]"></li>
			{/each}
		</ul>
	{:else if scores === null}
		<div class="flex flex-col items-center gap-1 py-8 text-center" role="status">
			<p class="text-sm font-semibold text-[var(--text)]">
				{i18n.messages.leaderboard.unavailable}
			</p>
			<p class="text-sm text-[var(--text-muted)]">{i18n.messages.leaderboard.unavailableHelp}</p>
			<Button variant="secondary" size="sm" class="mt-3" onclick={() => (retryKey += 1)}>
				{i18n.messages.leaderboard.retry}
			</Button>
		</div>
	{:else if scores.length === 0}
		<div class="flex flex-col items-center gap-1 py-8 text-center" role="status">
			<p class="text-sm font-semibold text-[var(--text)]">{i18n.messages.leaderboard.empty}</p>
			<p class="text-sm text-[var(--text-muted)]">{i18n.messages.leaderboard.emptyHelp}</p>
		</div>
	{:else}
		<ol class="flex flex-col">
			{#each scores as score, index (score.createdAt + score.nickname + index)}
				<li
					class="tabular grid grid-cols-[2.25rem_minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-[var(--border)] px-2 py-2.5 text-sm last:border-b-0 {isHighlighted(
						score
					)
						? 'rounded-lg bg-[var(--primary-soft)]'
						: ''}"
				>
					<span
						class="font-mono text-xs font-bold {index === 0
							? 'text-[var(--primary)]'
							: 'text-[var(--text-soft)]'}"
					>
						{i18n.messages.leaderboard.position(index + 1)}
					</span>
					<span class="truncate font-semibold"
						>{displayNickname(score.nickname, i18n.messages.leaderboard.anonymous)}</span
					>
					<span class="font-mono font-bold">
						{formatSpeed(score.wpm, i18n.locale)}
						<span class="text-xs font-medium text-[var(--text-muted)]">
							{i18n.messages.common.speedUnit}
						</span>
					</span>
					<span class="w-14 text-right font-mono text-xs text-[var(--text-muted)]">
						{formatPercent(score.accuracy, i18n.locale)}
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</div>
