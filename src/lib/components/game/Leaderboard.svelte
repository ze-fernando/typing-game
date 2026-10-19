<script lang="ts">
	import { Trophy } from '@lucide/svelte';
	import { fetchLeaderboard } from '#lib/api/leaderboard';
	import { formatAccuracy, formatWpm } from '#lib/game/scoring';
	import type { FixedLevelId, ScoreEntry } from '#lib/game/types';

	interface Props {
		level: FixedLevelId;
		limit?: number;
		refreshKey?: number;
		title?: string;
	}

	let { level, limit = 10, refreshKey = 0, title = 'Ranking' }: Props = $props();

	let scores = $state<ScoreEntry[] | null>(null);
	let loading = $state(true);

	$effect(() => {
		const request = { level, limit, refreshKey };
		loading = true;
		let active = true;

		fetchLeaderboard(request.level, request.limit).then((data) => {
			if (!active) return;
			scores = data;
			loading = false;
		});

		return () => {
			active = false;
		};
	});

	const medals = ['🥇', '🥈', '🥉'];
</script>

<section class="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-4 shadow-lg">
	<header class="mb-3 flex items-center justify-between gap-3">
		<h3 class="flex items-center gap-2 text-sm font-bold">
			<Trophy class="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
			{title}
		</h3>
		<span class="text-[0.68rem] font-semibold text-[var(--text-muted)] uppercase">{level}</span>
	</header>

	{#if loading}
		<ul class="flex flex-col gap-2" aria-hidden="true">
			<li class="h-11 animate-pulse rounded-xl bg-[var(--surface-2)]"></li>
			<li class="h-11 animate-pulse rounded-xl bg-[var(--surface-2)]"></li>
			<li class="h-11 animate-pulse rounded-xl bg-[var(--surface-2)]"></li>
		</ul>
	{:else if !scores || scores.length === 0}
		<p class="py-6 text-center text-sm text-[var(--text-muted)]">
			Ranking indisponível ou ainda sem resultados. Jogue para inaugurar.
		</p>
	{:else}
		<ol class="flex flex-col gap-1.5">
			{#each scores as score, index (score.createdAt + score.nickname + index)}
				<li
					class="flex items-center justify-between gap-3 rounded-xl border border-transparent px-3 py-2 text-sm transition hover:border-[var(--border)] hover:bg-[var(--surface-2)]/60"
				>
					<span class="flex min-w-0 items-center gap-2">
						<span class="w-6 shrink-0 text-center font-mono text-xs text-[var(--text-soft)]">
							{medals[index] ?? index + 1}
						</span>
						<span class="truncate font-medium">{score.nickname}</span>
					</span>
					<span class="flex shrink-0 items-center gap-2 font-mono text-xs">
						<span class="font-semibold text-[var(--text)]">{formatWpm(score.wpm)} ppm</span>
						<span class="text-[var(--text-muted)]">{formatAccuracy(score.accuracy)}</span>
					</span>
				</li>
			{/each}
		</ol>
	{/if}
</section>
