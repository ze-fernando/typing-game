<script lang="ts">
	import { formatAccuracy, formatClock, formatWpm } from '#lib/game/scoring';

	interface Props {
		remainingMs: number;
		totalMs: number;
		wordsCompleted: number;
		wordsTotal: number;
		accuracy: number;
		wpm: number;
	}

	let { remainingMs, totalMs, wordsCompleted, wordsTotal, accuracy, wpm }: Props = $props();

	const progress = $derived(Math.max(0, Math.min(1, remainingMs / totalMs)));
	const circumference = 2 * Math.PI * 24;
	const dashOffset = $derived(circumference * (1 - progress));
	const timeTone = $derived(
		progress <= 0.12
			? 'text-[var(--danger)]'
			: progress <= 0.3
				? 'text-[var(--warning)]'
				: 'text-[var(--text)]'
	);
	const wordProgress = $derived(wordsTotal > 0 ? (wordsCompleted / wordsTotal) * 100 : 0);
</script>

<div class="flex items-center gap-4 sm:gap-6">
	<div
		class="relative flex h-16 w-16 items-center justify-center"
		role="timer"
		aria-label="Tempo restante"
	>
		<svg viewBox="0 0 56 56" class="h-16 w-16 -rotate-90" aria-hidden="true">
			<circle cx="28" cy="28" r="24" fill="none" stroke="var(--border)" stroke-width="4" />
			<circle
				cx="28"
				cy="28"
				r="24"
				fill="none"
				stroke="currentColor"
				stroke-width="4"
				stroke-linecap="round"
				class={timeTone}
				stroke-dasharray={circumference}
				stroke-dashoffset={dashOffset}
			/>
		</svg>
		<span class="absolute font-mono text-lg font-bold {timeTone}">{formatClock(remainingMs)}</span>
	</div>

	<div class="flex min-w-0 flex-1 flex-col gap-2">
		<div
			class="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--text-muted)]"
		>
			<span>{wordsCompleted}/{wordsTotal} palavras</span>
			<span class="font-mono">{formatWpm(wpm)} ppm</span>
			<span>{formatAccuracy(accuracy)}</span>
		</div>
		<div class="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
			<div
				class="h-full rounded-full bg-[var(--primary)] transition-[width] duration-200"
				style="width: {wordProgress}%"
			></div>
		</div>
	</div>
</div>
