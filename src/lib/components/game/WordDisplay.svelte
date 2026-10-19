<script lang="ts">
	import { compareWord } from '#lib/game/scoring';

	interface Props {
		word: string;
		typed: string;
		error?: boolean;
	}

	let { word, typed, error = false }: Props = $props();

	const comparison = $derived(compareWord(typed, word));

	const letterClasses = {
		correct: 'text-[var(--success)]',
		incorrect: 'text-[var(--danger)]',
		pending: 'text-[var(--text-muted)]'
	};
</script>

<div class="flex flex-col items-center gap-3">
	<p class="sr-only" aria-live="polite">Palavra atual: {word}</p>

	<div
		class="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 {error
			? 'animate-shake'
			: ''}"
		aria-hidden="true"
	>
		{#each Array.from(word) as letter, index (index)}
			<span
				class="font-mono text-4xl font-bold tracking-tight transition-colors duration-100 sm:text-5xl lg:text-6xl {letterClasses[
					comparison.letters[index]
				]} {index === typed.length ? 'border-b-2 border-[var(--primary)]' : ''}"
			>
				{letter}
			</span>
		{/each}
		{#each comparison.extra as extra, index (index)}
			<span
				class="font-mono text-4xl font-bold tracking-tight text-[var(--danger)] line-through sm:text-5xl lg:text-6xl"
			>
				{extra}
			</span>
		{/each}
	</div>

	{#if typed.length === 0}
		<p class="text-xs font-medium text-[var(--text-soft)]">
			Digite a palavra e confirme com Espaço ou Enter
		</p>
	{/if}
</div>
