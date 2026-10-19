<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onDestroy, onMount } from 'svelte';
	import { ArrowLeft, Pause, Play, Settings } from '@lucide/svelte';
	import {
		playCountdown,
		playFinish,
		playKeyClick,
		playTypingError,
		playTypingSuccess,
		startMusic,
		stopMusic,
		unlockAudio
	} from '#lib/audio/audio';
	import DeskScene from '#lib/components/game/DeskScene.svelte';
	import GameHud from '#lib/components/game/GameHud.svelte';
	import ResultsDialog from '#lib/components/game/ResultsDialog.svelte';
	import VirtualKeyboard from '#lib/components/game/VirtualKeyboard.svelte';
	import WordDisplay from '#lib/components/game/WordDisplay.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import Tag from '#lib/components/ui/Tag.svelte';
	import { calculateAccuracy, calculateWpm } from '#lib/game/scoring';
	import type { GameResult, KeyboardKey, LevelConfig } from '#lib/game/types';
	import { createGame } from '#lib/stores/game.svelte';
	import { settings } from '#lib/stores/settings.svelte';
	import { openSettings } from '#lib/stores/ui.svelte';
	import { saveBest } from '#lib/utils/bests';

	interface Props {
		level: LevelConfig;
	}

	let { level }: Props = $props();

	let inputEl = $state<HTMLInputElement | undefined>();
	let pressed = $state<string[]>([]);
	let mousePressed = $state(false);
	let resultsOpen = $state(false);
	let lastResult = $state<GameResult | null>(null);
	let isRecord = $state(false);

	function handleFinish(result: GameResult): void {
		lastResult = result;
		isRecord = saveBest(level.id, {
			wpm: result.wpm,
			accuracy: result.accuracy,
			wordsCompleted: result.wordsCompleted,
			wordsTotal: result.wordsTotal,
			savedAt: new Date().toISOString()
		});
		playFinish();
		stopMusic();
		resultsOpen = true;
	}

	// O GameScreen é renderizado dentro de um {#key} por configuração de nível,
	// então o prop `level` é imutável durante toda a vida deste componente.
	// svelte-ignore state_referenced_locally
	const game = createGame(level, {
		onCountdown: playCountdown,
		onStart: startMusic,
		onCorrect: playTypingSuccess,
		onError: playTypingError,
		onFinish: handleFinish
	});

	const elapsedMs = $derived(Math.max(1, level.seconds * 1000 - game.state.remainingMs));
	const liveWpm = $derived(calculateWpm(game.state.correctChars, elapsedMs));
	const liveAccuracy = $derived(
		calculateAccuracy(game.state.correctChars, game.state.comparedChars)
	);
	const currentWord = $derived(game.state.deck[game.state.index] ?? '');
	const wordsTotal = $derived(game.state.deck.length);

	onMount(() => {
		game.begin();
		inputEl?.focus();
	});

	onDestroy(() => {
		game.destroy();
		stopMusic();
	});

	$effect(() => {
		const status = game.state.status;
		if (settings.music && (status === 'running' || status === 'countdown')) {
			startMusic();
		} else {
			stopMusic();
		}
	});

	$effect(() => {
		if (game.state.status === 'running') {
			inputEl?.focus();
		}
	});

	function press(code: string): void {
		if (!pressed.includes(code)) pressed = [...pressed, code];
	}

	function release(code: string): void {
		pressed = pressed.filter((item) => item !== code);
	}

	function flashMouse(): void {
		mousePressed = true;
		setTimeout(() => {
			mousePressed = false;
		}, 140);
	}

	function handleVirtualKey(key: KeyboardKey): void {
		unlockAudio();
		playKeyClick();
		press(key.code);
		setTimeout(() => release(key.code), 130);
		flashMouse();

		if (key.kind === 'backspace') {
			game.backspace();
		} else if (key.kind === 'space' || key.kind === 'enter') {
			game.submit();
		} else if (key.input) {
			game.append(key.input);
		}

		inputEl?.focus();
	}

	function handleVirtualChar(char: string): void {
		unlockAudio();
		playKeyClick();
		flashMouse();
		game.append(char);
		inputEl?.focus();
	}

	function handleKeyDown(event: KeyboardEvent): void {
		unlockAudio();
		press(event.code);

		if (event.isComposing) return;

		const target = event.target;
		const insideButton = target instanceof HTMLElement && target.closest('button') !== null;

		if ((event.key === 'Enter' || event.code === 'Space') && !insideButton) {
			event.preventDefault();
			game.submit();
			return;
		}

		if (event.key === 'Escape') {
			game.clearTyped();
			return;
		}

		if (event.key === 'Backspace' && game.state.typed === '' && game.state.wordError) {
			game.clearTyped();
			return;
		}

		if (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Enter') {
			playKeyClick();
		}
	}

	function handleKeyUp(event: KeyboardEvent): void {
		release(event.code);
	}

	function handleVisibility(): void {
		if (document.hidden && game.state.status === 'running') {
			game.pause();
		}
	}

	function handleInput(event: Event): void {
		const value = (event.currentTarget as HTMLInputElement).value;
		game.setTyped(value);
	}

	function handleRestart(): void {
		resultsOpen = false;
		lastResult = null;
		isRecord = false;
		game.restart();
	}

	function handleHome(): void {
		void goto(resolve('/'));
	}
</script>

<svelte:window
	onkeydown={handleKeyDown}
	onkeyup={handleKeyUp}
	onvisibilitychange={handleVisibility}
/>

<main id="conteudo" class="relative flex min-h-dvh flex-col overflow-hidden">
	<div
		class="pointer-events-none absolute inset-0 -z-10"
		style="background:
			radial-gradient(circle at 50% 0%, rgba(46,107,255,0.16), transparent 42rem),
			linear-gradient(180deg, var(--bg), var(--bg-elevated));"
		aria-hidden="true"
	></div>

	<header
		class="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6"
	>
		<div class="flex items-center gap-2">
			<Button variant="ghost" size="sm" onclick={handleHome}>
				<ArrowLeft class="h-4 w-4" aria-hidden="true" />
				Sair
			</Button>
			<Tag>{level.label}</Tag>
		</div>

		<div class="flex items-center gap-2">
			{#if game.state.status === 'running'}
				<IconButton label="Pausar" onclick={() => game.pause()}>
					<Pause class="h-5 w-5" aria-hidden="true" />
				</IconButton>
			{:else if game.state.status === 'paused'}
				<IconButton label="Continuar" onclick={() => game.resume()}>
					<Play class="h-5 w-5" aria-hidden="true" />
				</IconButton>
			{/if}
			<IconButton label="Configurações" onclick={openSettings}>
				<Settings class="h-5 w-5" aria-hidden="true" />
			</IconButton>
		</div>
	</header>

	<section
		class="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center gap-6 px-4 pb-6 sm:px-6"
	>
		<div
			class="relative w-full max-w-3xl rounded-3xl border border-[var(--border)] bg-[var(--surface)]/85 p-4 shadow-2xl backdrop-blur sm:p-6"
		>
			<GameHud
				remainingMs={game.state.remainingMs}
				totalMs={level.seconds * 1000}
				wordsCompleted={game.state.wordsCompleted}
				{wordsTotal}
				accuracy={liveAccuracy}
				wpm={liveWpm}
			/>

			<div class="mt-6 flex min-h-36 items-center justify-center">
				{#if game.state.status === 'countdown'}
					<div class="flex flex-col items-center gap-2">
						<p class="text-sm font-semibold text-[var(--text-muted)]">Prepare os dedos</p>
						<span
							class="animate-countdown font-mono text-7xl font-black text-[var(--primary)]"
							aria-live="assertive"
						>
							{game.state.countdown > 0 ? game.state.countdown : 'Vai!'}
						</span>
					</div>
				{:else if game.state.status === 'paused'}
					<div class="flex flex-col items-center gap-3">
						<p class="text-2xl font-black">Pausado</p>
						<p class="text-sm text-[var(--text-muted)]">O tempo está congelado.</p>
						<Button size="sm" onclick={() => game.resume()}>
							<Play class="h-4 w-4" aria-hidden="true" />
							Continuar
						</Button>
					</div>
				{:else if currentWord}
					<WordDisplay word={currentWord} typed={game.state.typed} error={game.state.wordError} />
				{:else}
					<p class="text-lg font-bold">Partida finalizada</p>
				{/if}
			</div>

			<input
				bind:this={inputEl}
				value={game.state.typed}
				oninput={handleInput}
				autocomplete="off"
				autocapitalize="off"
				autocorrect="off"
				spellcheck="false"
				aria-label="Digite a palavra"
				class="absolute h-px w-px overflow-hidden opacity-0"
				tabindex="-1"
			/>
		</div>

		<div class="w-full max-w-3xl">
			<DeskScene {mousePressed}>
				<VirtualKeyboard
					{pressed}
					disabled={game.state.status !== 'running'}
					onkey={handleVirtualKey}
					onchar={handleVirtualChar}
				/>
			</DeskScene>
		</div>
	</section>

	<ResultsDialog
		bind:open={resultsOpen}
		result={lastResult}
		levelLabel={level.label}
		{isRecord}
		onrestart={handleRestart}
		onhome={handleHome}
	/>
</main>
