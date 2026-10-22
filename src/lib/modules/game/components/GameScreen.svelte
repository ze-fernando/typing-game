<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onDestroy, onMount, tick, untrack } from 'svelte';
	import {
		ArrowLeft,
		Keyboard,
		Lightbulb,
		Pause,
		Play,
		Settings,
		Smartphone
	} from '@lucide/svelte';
	import {
		playCountdown,
		playFinish,
		playKeyClick,
		playTypingError,
		playTypingSuccess,
		setMusicMood,
		startMusic,
		stopMusic,
		unlockAudio
	} from '#lib/modules/audio/audio';
	import { musicState } from '#lib/modules/audio/music/state.svelte';
	import DeskScene from '#lib/modules/game/components/DeskScene.svelte';
	import GameHud from '#lib/modules/game/components/GameHud.svelte';
	import ResultsDialog from '#lib/modules/game/components/ResultsDialog.svelte';
	import VirtualKeyboard from '#lib/modules/game/components/VirtualKeyboard.svelte';
	import WordDisplay from '#lib/modules/game/components/WordDisplay.svelte';
	import Button from '#lib/modules/ui/components/Button.svelte';
	import Chip from '#lib/modules/ui/components/Chip.svelte';
	import Dialog from '#lib/modules/ui/components/Dialog.svelte';
	import IconButton from '#lib/modules/ui/components/IconButton.svelte';
	import { calculateAccuracy, calculateWpm } from '#lib/modules/game/scoring';
	import type {
		BestScore,
		GameResult,
		GameStatus,
		KeyboardKey,
		LevelConfig
	} from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';
	import { formatPercent, formatSpeed } from '#lib/modules/i18n/format';
	import { localizedPath } from '#lib/modules/i18n/paths';
	import { createGame } from '#lib/modules/game/game.svelte';
	import { settings, settingsStatus } from '#lib/modules/settings/settings.svelte';
	import { openSettings, ui } from '#lib/modules/ui/ui.svelte';
	import { saveBest } from '#lib/modules/game/bests';
	import {
		hasOpenDialog,
		isComposingKey,
		isTypingTarget
	} from '#lib/modules/shared/keyboard-guards';

	interface Props {
		level: LevelConfig;
	}

	let { level }: Props = $props();

	const i18n = useI18n();
	let inputEl = $state<HTMLInputElement | undefined>();
	let pressed = $state<string[]>([]);
	let resultsOpen = $state(false);
	let lastResult = $state.raw<GameResult | null>(null);
	let isRecord = $state(false);
	let previousBest = $state<BestScore | null>(null);
	let inputFocused = $state(false);
	let exitConfirmOpen = $state(false);
	let statusMessage = $state('');
	let deviceKeyboard = $state(false);
	let composing = false;
	let lastStatus: GameStatus = 'idle';
	let resumeAfterExit = false;
	let disposed = false;

	function handleFinish(result: GameResult): void {
		lastResult = result;
		isRecord = false;
		previousBest = null;
		composing = false;

		void saveBest(level, {
			wpm: result.wpm,
			accuracy: result.accuracy,
			wordsCompleted: result.wordsCompleted,
			wordsTotal: result.wordsTotal,
			savedAt: new Date().toISOString()
		}).then((outcome) => {
			if (disposed || lastResult !== result) return;
			isRecord = outcome.saved;
			previousBest = outcome.previous;
		});

		playFinish();
		stopMusic();
		resultsOpen = true;
	}

	const game = createGame(
		untrack(() => level),
		{
			onCountdown: playCountdown,
			onStart: startMusic,
			onCorrect: playTypingSuccess,
			onError: playTypingError,
			onFinish: handleFinish
		}
	);

	const levelName = $derived(i18n.messages.levels.names[level.id]);
	const modeName = $derived(i18n.messages.modes.names[level.mode]);
	const elapsedMs = $derived(Math.max(1, level.seconds * 1000 - game.state.remainingMs));
	const liveWpm = $derived(calculateWpm(game.state.correctChars, elapsedMs));
	const liveAccuracy = $derived(
		calculateAccuracy(game.state.correctChars, game.state.comparedChars)
	);
	const currentEntry = $derived(game.state.deck[game.state.index] ?? null);
	const isTranslation = $derived(level.mode === 'en-pt');
	const showRecovery = $derived(game.state.status === 'running' && !inputFocused);
	const inputLabel = $derived(
		isTranslation ? i18n.messages.game.inputLabelTranslation : i18n.messages.game.inputLabel
	);

	onMount(() => {
		game.begin();
		inputEl?.focus();
	});

	onDestroy(() => {
		disposed = true;
		game.destroy();
		stopMusic();
	});

	$effect(() => {
		const status = game.state.status;
		if (
			settingsStatus.hydrated &&
			settings.music &&
			(status === 'running' || status === 'countdown')
		)
			startMusic();
		else stopMusic();
	});

	$effect(() => {
		if (game.state.status === 'running' && !hasOpenDialog()) inputEl?.focus();
	});

	$effect(() => {
		setMusicMood({
			combo: game.state.combo >= 3,
			urgent: game.state.status === 'running' && game.state.remainingMs <= 10_000
		});
	});

	$effect(() => {
		const status = game.state.status;
		if (status === lastStatus) return;

		if (status === 'paused') statusMessage = i18n.messages.game.statusPaused;
		else if (status === 'running')
			statusMessage =
				lastStatus === 'paused'
					? i18n.messages.game.statusResumed
					: i18n.messages.game.statusRunning;
		else if (status === 'finished') statusMessage = i18n.messages.game.statusFinished;

		lastStatus = status;
	});

	function press(code: string): void {
		if (!pressed.includes(code)) pressed = [...pressed, code];
	}

	function release(code: string): void {
		pressed = pressed.filter((item) => item !== code);
	}

	function focusInput(): void {
		inputEl?.focus();
	}

	async function toggleKeyboard(): Promise<void> {
		deviceKeyboard = !deviceKeyboard;
		inputEl?.blur();
		await tick();
		focusInput();
	}

	function handleVirtualKey(key: KeyboardKey): void {
		unlockAudio();
		playKeyClick();
		press(key.code);
		setTimeout(() => release(key.code), 130);

		if (key.kind === 'backspace') game.backspace();
		else if (key.kind === 'space' || key.kind === 'enter') game.submit();
		else if (key.input) game.append(key.input);

		focusInput();
	}

	function handleVirtualChar(char: string): void {
		unlockAudio();
		playKeyClick();
		game.append(char);
		focusInput();
	}

	function revealHint(): void {
		game.revealHint();
		focusInput();
	}

	function blockedByOverlay(): boolean {
		return ui.settingsOpen || resultsOpen || exitConfirmOpen || hasOpenDialog();
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (event.defaultPrevented || blockedByOverlay()) return;
		unlockAudio();
		press(event.code);

		if (composing || isComposingKey(event)) return;
		if (event.metaKey || event.ctrlKey || event.altKey) return;

		const target = event.target;
		const onInput = target === inputEl;
		const onControl =
			target instanceof HTMLElement && target.closest('button, a, summary') !== null;
		if (!onInput && isTypingTarget(target)) return;

		if (event.key === 'Escape') {
			event.preventDefault();
			if (game.state.status === 'running') game.clearTyped();
			return;
		}

		if (game.state.status !== 'running') return;

		if ((event.key === 'Enter' || event.code === 'Space' || event.key === ' ') && !onControl) {
			event.preventDefault();
			game.submit();
			playKeyClick();
			return;
		}

		if (event.key === 'Backspace' && game.state.typed === '' && game.state.wordError) {
			game.clearTyped();
			return;
		}

		const isTypingKey = event.key === 'Backspace' || (event.key.length === 1 && event.key !== ' ');
		if (!onInput && !onControl && isTypingKey) {
			event.preventDefault();
			if (event.key === 'Backspace') game.backspace();
			else game.append(event.key);
			playKeyClick();
			focusInput();
			return;
		}

		if (onInput && isTypingKey) playKeyClick();
	}

	function handleKeyUp(event: KeyboardEvent): void {
		release(event.code);
	}

	function handleBlur(): void {
		inputFocused = false;
		pressed = [];
	}

	function handleVisibility(): void {
		if (document.hidden && (game.state.status === 'running' || game.state.status === 'countdown')) {
			game.pause();
		}
	}

	function syncInput(input: HTMLInputElement): void {
		const value = input.value;
		if (/\s$/.test(value)) {
			game.setTyped(value.trim());
			game.submit();
			input.value = game.state.typed;
			return;
		}
		game.setTyped(value);
	}

	function handleInput(event: Event): void {
		if (composing || (event instanceof InputEvent && event.isComposing)) return;
		syncInput(event.currentTarget as HTMLInputElement);
	}

	function handleCompositionEnd(event: CompositionEvent): void {
		composing = false;
		syncInput(event.currentTarget as HTMLInputElement);
	}

	function handleRestart(): void {
		resultsOpen = false;
		lastResult = null;
		isRecord = false;
		previousBest = null;
		game.restart();
	}

	function handleHome(): void {
		resultsOpen = false;
		void goto(resolve(localizedPath(i18n.locale, 'home')));
	}

	async function handleResultsClose(): Promise<void> {
		await tick();
		if (resultsOpen || game.state.status !== 'finished') return;
		document.querySelector<HTMLButtonElement>('[data-view-result]')?.focus();
	}

	function requestHome(): void {
		const status = game.state.status;

		if (status === 'running' || status === 'paused' || status === 'countdown') {
			resumeAfterExit = status !== 'paused';
			if (resumeAfterExit) game.pause();
			exitConfirmOpen = true;
			return;
		}

		handleHome();
	}

	function handleExitDialogClose(): void {
		if (!resumeAfterExit) return;
		resumeAfterExit = false;
		game.resume();
	}

	function confirmExit(): void {
		resumeAfterExit = false;
		exitConfirmOpen = false;
		handleHome();
	}

	function openSettingsPaused(): void {
		game.pause();
		openSettings();
	}
</script>

<svelte:window onkeydown={handleKeyDown} onkeyup={handleKeyUp} onblur={() => (pressed = [])} />
<svelte:document onvisibilitychange={handleVisibility} />

<main
	id="conteudo"
	class="relative flex min-h-dvh flex-col landscape-short:h-dvh landscape-short:min-h-0 landscape-short:overflow-hidden"
	data-game-status={game.state.status}
	data-music={musicState.playing ? 'on' : 'off'}
>
	<h1 class="sr-only">{i18n.messages.game.heading(levelName, modeName)}</h1>
	<p class="sr-only" aria-live="polite">{statusMessage}</p>

	<header class="shrink-0 border-b border-[var(--border)]">
		<div
			class="mx-auto flex w-full max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:px-6 landscape-short:py-1"
		>
			<div class="flex min-w-0 items-center gap-2">
				<Button variant="ghost" size="sm" onclick={requestHome}>
					<ArrowLeft class="h-4 w-4" aria-hidden="true" />
					<span class="sr-only sm:not-sr-only">{i18n.messages.game.exit}</span>
				</Button>
				<Chip class="truncate">
					<span class="hidden sm:inline">{i18n.messages.modes.short[level.mode]} ·</span>
					{levelName}
				</Chip>
			</div>

			<div class="flex items-center gap-2">
				{#if game.state.status === 'running'}
					<IconButton label={i18n.messages.game.pause} onclick={() => game.pause()}>
						<Pause class="h-[18px] w-[18px]" aria-hidden="true" />
					</IconButton>
				{:else if game.state.status === 'paused'}
					<IconButton label={i18n.messages.game.resume} onclick={() => game.resume()}>
						<Play class="h-[18px] w-[18px]" aria-hidden="true" />
					</IconButton>
				{/if}
				<IconButton
					label={deviceKeyboard
						? i18n.messages.game.useVirtualKeyboard
						: i18n.messages.game.useDeviceKeyboard}
					onclick={toggleKeyboard}
				>
					{#if deviceKeyboard}
						<Keyboard class="h-[18px] w-[18px]" aria-hidden="true" />
					{:else}
						<Smartphone class="h-[18px] w-[18px]" aria-hidden="true" />
					{/if}
				</IconButton>
				<IconButton label={i18n.messages.common.settings} onclick={openSettingsPaused}>
					<Settings class="h-[18px] w-[18px]" aria-hidden="true" />
				</IconButton>
			</div>
		</div>
	</header>

	<div
		class="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 px-3 py-3 sm:gap-5 sm:px-6 sm:py-6 landscape-short:min-h-0 landscape-short:flex-row landscape-short:items-stretch landscape-short:px-2 [@media(max-height:560px)]:gap-1 [@media(max-height:560px)]:py-1 [@media(max-height:800px)]:gap-1 [@media(max-height:800px)]:py-1 sm:[@media(max-height:800px)]:gap-1 sm:[@media(max-height:800px)]:py-1"
	>
		<section
			class="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:p-6 landscape-short:flex landscape-short:min-h-0 landscape-short:min-w-0 landscape-short:flex-[1.2] landscape-short:flex-col landscape-short:gap-1.5 [@media(max-height:560px)]:p-2 [@media(max-height:800px)]:p-3 sm:[@media(max-height:800px)]:p-3"
		>
			<GameHud
				remainingMs={game.state.remainingMs}
				totalMs={level.seconds * 1000}
				wordsCompleted={game.state.wordsCompleted}
				wordsTotal={game.state.deck.length}
				accuracy={liveAccuracy}
				wpm={liveWpm}
				combo={game.state.combo}
			/>

			<div
				class="flex min-h-32 items-center justify-center py-3 sm:min-h-36 landscape-short:min-h-0 landscape-short:flex-1 landscape-short:py-0 [@media(max-height:560px)]:min-h-0 [@media(max-height:560px)]:py-1 [@media(min-height:801px)]:sm:min-h-44"
			>
				{#if game.state.status === 'countdown' || game.state.status === 'idle'}
					<div class="flex flex-col items-center gap-2">
						<p class="text-sm font-semibold tracking-[0.15em] text-[var(--text-muted)] uppercase">
							{i18n.messages.game.getReady}
						</p>
						{#key game.state.countdown}
							<span
								class="animate-countdown tabular font-mono text-7xl font-bold text-[var(--primary)] landscape-short:text-5xl"
								aria-live="assertive"
							>
								{game.state.countdown > 0 ? game.state.countdown : i18n.messages.game.go}
							</span>
						{/key}
					</div>
				{:else if game.state.status === 'paused'}
					<div class="flex flex-col items-center gap-3 text-center">
						<p class="text-2xl font-bold tracking-wide">{i18n.messages.game.paused}</p>
						<p class="text-sm text-[var(--text-muted)]">{i18n.messages.game.pausedHelp}</p>
						<Button onclick={() => game.resume()}>
							<Play class="h-4 w-4" aria-hidden="true" />
							{i18n.messages.game.resume}
						</Button>
					</div>
				{:else if game.state.status === 'running' && currentEntry}
					<WordDisplay
						entry={currentEntry}
						mode={level.mode}
						typed={game.state.typed}
						error={game.state.wordError}
						hintVisible={game.state.hintVisible}
					/>
				{:else if game.state.status === 'finished' && lastResult}
					<div class="flex max-w-md flex-col items-center gap-3 text-center" data-finished-panel>
						<p class="text-xl font-bold tracking-wide">{i18n.messages.game.finished}</p>
						<p class="tabular font-mono text-sm text-[var(--text-muted)]">
							{i18n.messages.game.wordsProgress(lastResult.wordsCompleted, lastResult.wordsTotal)} ·
							{formatSpeed(lastResult.wpm, i18n.locale)}
							{i18n.messages.common.speedUnit} · {formatPercent(lastResult.accuracy, i18n.locale)}
						</p>
						<div class="flex flex-wrap items-center justify-center gap-2">
							<Button onclick={handleRestart}>{i18n.messages.common.playAgain}</Button>
							<Button variant="secondary" data-view-result onclick={() => (resultsOpen = true)}>
								{i18n.messages.game.viewResult}
							</Button>
							<Button variant="ghost" onclick={handleHome}>{i18n.messages.common.home}</Button>
						</div>
					</div>
				{/if}
			</div>

			<div class="flex items-center gap-2">
				<div class="relative flex min-w-0 flex-1">
					<input
						bind:this={inputEl}
						value={game.state.typed}
						oninput={handleInput}
						oncompositionstart={() => (composing = true)}
						oncompositionend={handleCompositionEnd}
						onfocus={() => (inputFocused = true)}
						onblur={handleBlur}
						disabled={game.state.status !== 'running'}
						autocomplete="off"
						autocapitalize="off"
						autocorrect="off"
						spellcheck="false"
						inputmode={deviceKeyboard ? 'text' : 'none'}
						enterkeyhint="done"
						lang={level.mode === 'en' ? 'en' : 'pt-BR'}
						aria-label={inputLabel}
						aria-describedby="game-input-help"
						placeholder={isTranslation
							? i18n.messages.game.translatePlaceholder
							: i18n.messages.game.placeholder}
						data-game-input
						class="h-12 w-full min-w-0 rounded-lg border border-[var(--control-border)] bg-[var(--bg)] px-3 text-center font-mono text-lg text-[var(--text)] outline-none placeholder:text-[var(--text-soft)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 disabled:opacity-60 landscape-short:h-11"
					/>
					{#if showRecovery}
						<button
							type="button"
							class="absolute top-1/2 right-1.5 min-h-9 -translate-y-1/2 cursor-pointer rounded-md border border-[var(--primary)]/50 bg-[var(--surface)] px-2.5 text-xs font-semibold text-[var(--primary)]"
							onclick={focusInput}
						>
							{i18n.messages.game.backToField}
						</button>
					{/if}
				</div>
				{#if isTranslation}
					<Button
						variant="secondary"
						class="h-12 min-w-12 shrink-0 px-3 landscape-short:h-11 landscape-short:min-w-11"
						disabled={game.state.status !== 'running' || game.state.hintVisible}
						title={i18n.messages.game.hintRule}
						onclick={revealHint}
					>
						<Lightbulb class="h-4 w-4" aria-hidden="true" />
						<span class="sr-only sm:not-sr-only">{i18n.messages.game.hintButton}</span>
					</Button>
				{/if}
			</div>
			<p id="game-input-help" class="sr-only">
				{i18n.messages.game.inputHelp}
				{isTranslation ? i18n.messages.game.hintRule : ''}
			</p>
			{#if isTranslation}
				<p
					class="mt-2 text-xs text-[var(--text-muted)] landscape-short:mt-0 landscape-short:leading-snug"
					data-hint-rule
				>
					{i18n.messages.game.hintRule}
				</p>
			{/if}
		</section>

		{#if !deviceKeyboard}
			<div
				class="flex min-h-0 flex-col justify-end landscape-short:min-w-0 landscape-short:flex-1 landscape-short:justify-center"
			>
				<DeskScene>
					<VirtualKeyboard
						{pressed}
						disabled={game.state.status !== 'running'}
						onkey={handleVirtualKey}
						onchar={handleVirtualChar}
					/>
				</DeskScene>
			</div>
		{/if}
	</div>

	<ResultsDialog
		bind:open={resultsOpen}
		result={lastResult}
		{isRecord}
		{previousBest}
		onrestart={handleRestart}
		onhome={handleHome}
		onclose={handleResultsClose}
	/>

	<Dialog
		bind:open={exitConfirmOpen}
		title={i18n.messages.game.exitTitle}
		description={i18n.messages.game.exitDescription}
		size="sm"
		onclose={handleExitDialogClose}
	>
		<p class="text-sm leading-relaxed text-[var(--text-muted)]">{i18n.messages.game.exitBody}</p>

		{#snippet footer()}
			<div class="flex flex-wrap items-center justify-end gap-2">
				<Button variant="ghost" size="sm" onclick={() => (exitConfirmOpen = false)}>
					{i18n.messages.common.continue}
				</Button>
				<Button variant="danger" size="sm" onclick={confirmExit}>
					{i18n.messages.game.exitConfirm}
				</Button>
			</div>
		{/snippet}
	</Dialog>
</main>
