<script lang="ts">
	import { formatClock } from '#lib/modules/game/scoring';
	import { useI18n } from '#lib/modules/i18n/context';
	import { formatPercent, formatSpeed } from '#lib/modules/i18n/format';

	interface Props {
		remainingMs: number;
		totalMs: number;
		wordsCompleted: number;
		wordsTotal: number;
		accuracy: number;
		wpm: number;
		combo: number;
	}

	let { remainingMs, totalMs, wordsCompleted, wordsTotal, accuracy, wpm, combo }: Props = $props();

	const i18n = useI18n();
	const progress = $derived(Math.max(0, Math.min(1, remainingMs / totalMs)));
	const secondsLeft = $derived(Math.max(0, Math.ceil(remainingMs / 1000)));
	const urgency = $derived(secondsLeft <= 5 ? 'danger' : secondsLeft <= 10 ? 'warning' : 'calm');
	const timeTone = $derived(
		urgency === 'danger'
			? 'text-[var(--danger)]'
			: urgency === 'warning'
				? 'text-[var(--warning)]'
				: 'text-[var(--text)]'
	);
	const barTone = $derived(
		urgency === 'danger'
			? 'bg-[var(--danger)]'
			: urgency === 'warning'
				? 'bg-[var(--warning)]'
				: 'bg-[var(--primary)]'
	);

	let announcement = $state('');
	let lastAnnounced = 0;

	$effect(() => {
		const value = secondsLeft;
		if (value === lastAnnounced || value === Math.ceil(totalMs / 1000)) return;

		if ([30, 10, 5, 3, 2, 1].includes(value)) {
			announcement = i18n.messages.game.timeLeft(value);
			lastAnnounced = value;
		}
	});
</script>

<div class="flex flex-col gap-3 landscape-short:gap-1.5">
	<div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
		<div
			role="timer"
			data-hud-timer
			aria-label={i18n.messages.game.timerLabel(secondsLeft)}
			class="flex items-baseline gap-1"
		>
			<span
				class="tabular font-mono text-4xl leading-none font-bold transition-colors sm:text-5xl landscape-short:text-3xl {timeTone}"
				aria-hidden="true"
			>
				{formatClock(remainingMs)}
			</span>
			{#if remainingMs < 60_000}
				<span class="text-sm font-semibold text-[var(--text-muted)]" aria-hidden="true">s</span>
			{/if}
		</div>

		<dl data-hud-stats class="tabular flex flex-wrap items-center gap-2 text-xs">
			<div class="chip">
				<dt class="sr-only">{i18n.messages.game.wordsProgressLabel}</dt>
				<dd>{i18n.messages.game.wordsProgress(wordsCompleted, wordsTotal)}</dd>
			</div>
			<div class="chip">
				<dt class="sr-only">{i18n.messages.game.speedLabel}</dt>
				<dd>{formatSpeed(wpm, i18n.locale)} {i18n.messages.common.speedUnit}</dd>
			</div>
			<div class="chip">
				<dt class="sr-only">{i18n.messages.game.accuracyLabel}</dt>
				<dd>{formatPercent(accuracy, i18n.locale)}</dd>
			</div>
			{#if combo >= 2}
				{#key combo}
					<div
						class="chip animate-pop border-[var(--primary)]/50 bg-[var(--primary-soft)] text-[var(--primary)]"
					>
						<dt class="sr-only">{i18n.messages.game.comboLabel}</dt>
						<dd>{i18n.messages.game.combo(combo)}</dd>
					</div>
				{/key}
			{/if}
		</dl>
	</div>

	<div
		class="h-1 overflow-hidden rounded-full bg-[var(--surface-3)]"
		data-hud-progress
		aria-hidden="true"
	>
		<div
			class="h-full origin-left rounded-full {barTone}"
			style="transform: scaleX({progress})"
		></div>
	</div>

	<p class="sr-only" aria-live="polite">{announcement}</p>
</div>
