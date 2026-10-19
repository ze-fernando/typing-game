<script lang="ts">
	import { Award, Home, RotateCcw, Send, Trophy } from '@lucide/svelte';
	import { submitScore } from '#lib/api/leaderboard';
	import Leaderboard from '#lib/components/game/Leaderboard.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import { formatAccuracy, formatDuration, formatWpm } from '#lib/game/scoring';
	import type { FixedLevelId, GameResult } from '#lib/game/types';
	import { showToast } from '#lib/stores/ui.svelte';

	interface Props {
		open?: boolean;
		result: GameResult | null;
		levelLabel: string;
		isRecord?: boolean;
		onrestart: () => void;
		onhome: () => void;
		onSaved?: () => void;
	}

	let {
		open = $bindable(false),
		result,
		levelLabel,
		isRecord = false,
		onrestart,
		onhome,
		onSaved
	}: Props = $props();

	let nickname = $state('');
	let saving = $state(false);
	let message = $state('');
	let saved = $state(false);
	let refreshKey = $state(0);

	const rankedLevel = $derived(
		result && result.level !== 'personalizado' ? (result.level as FixedLevelId) : null
	);

	$effect(() => {
		if (open) {
			saved = false;
			message = '';
		}
	});

	function handleSave(): void {
		if (!result || !rankedLevel || saving) return;
		saving = true;
		message = '';

		submitScore({
			nickname,
			level: rankedLevel,
			wordsCompleted: result.wordsCompleted,
			wordsTotal: result.wordsTotal,
			correctChars: result.correctChars,
			comparedChars: result.comparedChars,
			durationMs: result.durationMs
		}).then((response) => {
			saving = false;

			if (!response.ok) {
				message = response.error;
				return;
			}

			saved = true;
			refreshKey += 1;
			showToast('Resultado salvo no ranking!', 'success');
			onSaved?.();
		});
	}

	const stats = $derived(
		result
			? [
					{ label: 'Velocidade', value: `${formatWpm(result.wpm)} ppm` },
					{ label: 'Precisão', value: formatAccuracy(result.accuracy) },
					{ label: 'Palavras', value: `${result.wordsCompleted}/${result.wordsTotal}` },
					{ label: 'Tempo ativo', value: formatDuration(result.durationMs) }
				]
			: []
	);
</script>

<Dialog
	bind:open
	title="Fim de partida"
	description="Confira seus números e tente superar o próprio recorde."
	size="lg"
>
	{#if result}
		<div class="flex flex-col gap-6">
			{#if isRecord}
				<div
					class="animate-pop flex items-center gap-3 rounded-2xl border border-[var(--warning)]/40 bg-[var(--warning-soft)] px-4 py-3 text-[var(--warning)]"
				>
					<Award class="h-5 w-5" aria-hidden="true" />
					<p class="text-sm font-bold">Novo recorde pessoal! Muito bem.</p>
				</div>
			{/if}

			<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
				{#each stats as stat (stat.label)}
					<div
						class="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/60 p-4 text-center"
					>
						<p class="text-[0.68rem] font-bold tracking-wide text-[var(--text-muted)] uppercase">
							{stat.label}
						</p>
						<p class="mt-1 font-mono text-xl font-bold">{stat.value}</p>
					</div>
				{/each}
			</div>

			{#if rankedLevel}
				<div class="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 p-4 sm:p-5">
					<h3 class="flex items-center gap-2 text-sm font-bold">
						<Trophy class="h-4 w-4 text-[var(--warning)]" aria-hidden="true" />
						Entrar no ranking de {levelLabel}
					</h3>

					{#if saved}
						<p class="mt-3 text-sm font-semibold text-[var(--success)]">
							Resultado salvo. Obrigado por jogar!
						</p>
					{:else}
						<div class="mt-3 flex flex-col gap-2 sm:flex-row">
							<label class="flex-1">
								<span class="sr-only">Apelido</span>
								<input
									type="text"
									bind:value={nickname}
									maxlength="20"
									placeholder="Seu apelido (opcional)"
									class="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] transition outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--primary)]"
								/>
							</label>
							<Button onclick={handleSave} disabled={saving}>
								<Send class="h-4 w-4" aria-hidden="true" />
								{saving ? 'Salvando…' : 'Salvar resultado'}
							</Button>
						</div>
						{#if message}
							<p class="mt-2 text-xs font-semibold text-[var(--danger)]">{message}</p>
						{/if}
					{/if}
				</div>

				<Leaderboard level={rankedLevel} {refreshKey} title={`Top 10 — ${levelLabel}`} />
			{:else}
				<p
					class="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/40 px-4 py-3 text-sm text-[var(--text-muted)]"
				>
					O modo personalizado não entra no ranking global. Seu recorde fica salvo no navegador.
				</p>
			{/if}
		</div>
	{/if}

	{#snippet footer()}
		<div class="flex flex-wrap items-center justify-between gap-3">
			<Button variant="ghost" size="sm" onclick={onhome}>
				<Home class="h-4 w-4" aria-hidden="true" />
				Início
			</Button>
			<Button size="sm" onclick={onrestart}>
				<RotateCcw class="h-4 w-4" aria-hidden="true" />
				Jogar novamente
			</Button>
		</div>
	{/snippet}
</Dialog>
