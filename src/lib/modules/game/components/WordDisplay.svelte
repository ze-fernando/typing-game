<script lang="ts">
	import { compareWord, normalizeWord } from '#lib/modules/game/scoring';
	import type { DeckEntry, GameMode } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';
	import {
		closestAnswer,
		findAccentMismatch,
		translationHint,
		typedFeedback
	} from '#lib/modules/translation/matching';

	interface Props {
		entry: DeckEntry;
		mode: GameMode;
		typed: string;
		error?: boolean;
		hintVisible?: boolean;
	}

	let { entry, mode, typed, error = false, hintVisible = false }: Props = $props();

	const i18n = useI18n();
	const ACCENTED = /[áàâãéêíóôõúüç]/i;
	const isTranslation = $derived(mode === 'en-pt');
	const promptLetters = $derived(Array.from(entry.prompt));
	const typedLength = $derived(Array.from(typed).length);
	const promptChars = $derived(promptLetters.length);
	const typingChars = $derived(Math.max(promptChars, typedLength, 4));
	const translationChars = $derived(Math.max(promptChars, typedLength, 8));
	const comparison = $derived(compareWord(typed, entry.prompt));
	const feedback = $derived(typedFeedback(typed, entry.answers));
	const hint = $derived(translationHint(entry.answers));

	const letterClasses = {
		correct: 'text-[var(--success)]',
		incorrect: 'text-[var(--danger)] underline decoration-2 underline-offset-[0.2em]',
		pending: 'text-[var(--text-muted)]'
	};

	const errorMessage = $derived.by(() => {
		if (!error) return '';
		const target = isTranslation ? closestAnswer(typed, entry.answers) : entry.prompt;
		const mismatch = findAccentMismatch(typed, target);
		return mismatch
			? i18n.messages.game.accentError(mismatch.expected, mismatch.typed)
			: i18n.messages.game.wrongWord;
	});

	function pendingClass(letter: string): string {
		return ACCENTED.test(normalizeWord(letter)) ? 'text-[var(--primary)]' : letterClasses.pending;
	}
</script>

<div class="@container flex w-full flex-col items-center gap-3 text-center landscape-short:gap-1">
	<p class="sr-only" aria-live="polite">
		{isTranslation
			? i18n.messages.game.currentPrompt(entry.prompt)
			: i18n.messages.game.currentWord(entry.prompt)}
	</p>

	{#if isTranslation}
		<p
			class="word-fit leading-none font-bold tracking-wide break-all [--glyph:0.66] [--word-max:clamp(2.25rem,9vw,3.5rem)] landscape-short:[--word-max:2.25rem]"
			style:--chars={promptChars}
			data-word-prompt
			lang="en"
			aria-hidden="true"
		>
			{entry.prompt}
		</p>
		<div
			class="word-fit flex min-h-[1.6em] max-w-full flex-wrap items-center justify-center font-mono leading-tight font-bold [--word-max:clamp(1.75rem,7vw,3rem)] landscape-short:[--word-max:1.75rem] {error
				? 'animate-shake'
				: ''}"
			style:--chars={translationChars}
			data-word-typed
			lang="pt-BR"
			aria-hidden="true"
		>
			{#each feedback.letters as letter, index (index)}
				<span
					class="{letterClasses[letter.state]} {index === typedLength - 1 ? 'animate-letter' : ''}"
				>
					{letter.char}
				</span>
			{/each}
			<span class="ml-0.5 inline-block h-[1em] w-[0.08em] bg-[var(--primary)]"></span>
		</div>
		{#if hintVisible}
			<p class="chip border-[var(--warning)]/45 tracking-normal text-[var(--warning)] normal-case">
				{i18n.messages.game.hintReveal(hint.first, hint.length)}
			</p>
		{/if}
	{:else}
		<div
			class="word-fit flex max-w-full flex-wrap items-end justify-center font-mono leading-tight font-bold [--word-max:clamp(2.25rem,9vw,4.25rem)] landscape-short:[--word-max:2.5rem] {error
				? 'animate-shake'
				: ''}"
			style:--chars={typingChars}
			data-word-prompt
			lang={mode === 'en' ? 'en' : 'pt-BR'}
			aria-hidden="true"
		>
			{#each promptLetters as letter, index (index)}
				{@const state = comparison.letters[index]}
				<span
					class="relative {state === 'pending'
						? pendingClass(letter)
						: letterClasses[state]} {index === typedLength - 1 ? 'animate-letter' : ''}"
				>
					{letter}
					{#if index === typedLength}
						<span class="absolute inset-x-0 -bottom-1 h-[3px] rounded-full bg-[var(--primary)]"
						></span>
					{/if}
				</span>
			{/each}
			{#each comparison.extra as extra, index (index)}
				<span class="text-[var(--danger)] line-through">{extra}</span>
			{/each}
		</div>
	{/if}

	<p class="min-h-5 text-sm font-semibold text-[var(--danger)]" aria-live="polite">
		{errorMessage}
	</p>

	{#if typed.length === 0 && !error && !isTranslation}
		<p class="-mt-3 text-sm text-[var(--text-soft)] landscape-short:hidden">
			{i18n.messages.game.typeHint}
		</p>
	{/if}
</div>
