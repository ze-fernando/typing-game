import { createDeck } from '#lib/modules/game/deck';
import { isTranslationMode } from '#lib/modules/game/levels';
import {
	calculateAccuracy,
	calculateWpm,
	compareAnswers,
	creditedChars
} from '#lib/modules/game/scoring';
import type { DeckEntry, GameResult, GameStatus, LevelConfig } from '#lib/modules/game/types';

export interface GameEvents {
	onCountdown?: (value: number) => void;
	onStart?: () => void;
	onCorrect?: (combo: number) => void;
	onError?: () => void;
	onFinish?: (result: GameResult) => void;
}

export interface GameState {
	status: GameStatus;
	level: LevelConfig;
	deck: DeckEntry[];
	index: number;
	typed: string;
	countdown: number;
	remainingMs: number;
	wordsCompleted: number;
	correctChars: number;
	comparedChars: number;
	attempts: number;
	errors: number;
	wordError: boolean;
	hintVisible: boolean;
	hintedWords: number;
	hintsUsed: number;
	combo: number;
	bestCombo: number;
	result: GameResult | null;
}

export interface GameClock {
	now: () => number;
	every: (callback: () => void, ms: number) => ReturnType<typeof setInterval>;
	stop: (timer: ReturnType<typeof setInterval>) => void;
}

const browserClock: GameClock = {
	now: () => performance.now(),
	every: (callback, ms) => setInterval(callback, ms),
	stop: (timer) => clearInterval(timer)
};

const COUNTDOWN_START = 3;

function initialState(level: LevelConfig): GameState {
	return {
		status: 'idle',
		level,
		deck: createDeck(level),
		index: 0,
		typed: '',
		countdown: COUNTDOWN_START,
		remainingMs: level.seconds * 1000,
		wordsCompleted: 0,
		correctChars: 0,
		comparedChars: 0,
		attempts: 0,
		errors: 0,
		wordError: false,
		hintVisible: false,
		hintedWords: 0,
		hintsUsed: 0,
		combo: 0,
		bestCombo: 0,
		result: null
	};
}

export interface Game {
	state: GameState;
	begin: () => void;
	pause: () => void;
	resume: () => void;
	finish: () => void;
	submit: () => void;
	revealHint: () => void;
	append: (value: string) => void;
	backspace: () => void;
	setTyped: (value: string) => void;
	clearTyped: () => void;
	restart: () => void;
	destroy: () => void;
}

export function createGame(
	level: LevelConfig,
	events: GameEvents = {},
	clock: GameClock = browserClock
): Game {
	const state = $state<GameState>(initialState(level));
	const limitMs = level.seconds * 1000;

	let countdownTimer: ReturnType<typeof setInterval> | null = null;
	let tickTimer: ReturnType<typeof setInterval> | null = null;
	let startedAt = 0;
	let pausedAt = 0;
	let pausedTotal = 0;
	let pausedCountdown = false;

	function clearCountdown(): void {
		if (countdownTimer) {
			clock.stop(countdownTimer);
			countdownTimer = null;
		}
	}

	function clearTicker(): void {
		if (tickTimer) {
			clock.stop(tickTimer);
			tickTimer = null;
		}
	}

	function clearTimers(): void {
		clearCountdown();
		clearTicker();
	}

	function activeElapsed(): number {
		if (!startedAt) return 0;

		const now = state.status === 'paused' && pausedAt ? pausedAt : clock.now();

		return Math.max(0, now - startedAt - pausedTotal);
	}

	function tick(): void {
		if (state.status !== 'running') return;

		state.remainingMs = Math.max(0, limitMs - activeElapsed());

		if (state.remainingMs <= 0) finish();
	}

	function startTicker(): void {
		clearTicker();
		tickTimer = clock.every(tick, 50);
	}

	function resetRound(): void {
		Object.assign(state, initialState(level), { status: 'countdown' as GameStatus });
		startedAt = 0;
		pausedAt = 0;
		pausedTotal = 0;
		pausedCountdown = false;
	}

	function begin(): void {
		if (state.status !== 'idle' && state.status !== 'finished') return;

		clearTimers();
		resetRound();
		events.onCountdown?.(state.countdown);
		startCountdown();
	}

	function startCountdown(): void {
		countdownTimer = clock.every(() => {
			if (state.countdown > 1) {
				state.countdown -= 1;
				events.onCountdown?.(state.countdown);
				return;
			}

			clearCountdown();
			state.countdown = 0;
			state.status = 'running';
			startedAt = clock.now();
			pausedTotal = 0;
			state.remainingMs = limitMs;
			events.onStart?.();
			startTicker();
		}, 1000);
	}

	function pause(): void {
		if (state.status === 'countdown') {
			pausedCountdown = true;
			clearCountdown();
			state.status = 'paused';
			return;
		}
		if (state.status !== 'running') return;

		tick();
		if (state.status !== 'running') return;

		pausedAt = clock.now();
		state.status = 'paused';
		clearTicker();
	}

	function resume(): void {
		if (state.status !== 'paused') return;

		if (pausedCountdown) {
			pausedCountdown = false;
			state.status = 'countdown';
			startCountdown();
			return;
		}

		if (pausedAt) {
			pausedTotal += clock.now() - pausedAt;
			pausedAt = 0;
		}

		state.status = 'running';
		events.onStart?.();
		startTicker();
	}

	function finish(): void {
		if (state.status === 'finished' || state.status === 'idle') return;

		const elapsed = Math.round(Math.min(limitMs, Math.max(1, activeElapsed())));
		clearTimers();
		state.status = 'finished';
		state.remainingMs = Math.max(0, limitMs - elapsed);
		state.typed = '';
		state.wordError = false;
		state.hintVisible = false;

		const result: GameResult = {
			mode: level.mode,
			level: level.id,
			wordsCompleted: state.wordsCompleted,
			wordsTotal: state.deck.length,
			correctChars: state.correctChars,
			comparedChars: state.comparedChars,
			attempts: state.attempts,
			errors: state.errors,
			hintedWords: state.hintedWords,
			bestCombo: state.bestCombo,
			durationMs: elapsed,
			wpm: calculateWpm(state.correctChars, elapsed),
			accuracy: calculateAccuracy(state.correctChars, state.comparedChars)
		};

		state.result = result;
		events.onFinish?.(result);
	}

	function advance(correctChars: number): void {
		state.correctChars += creditedChars(correctChars, state.hintVisible);
		if (state.hintVisible) state.hintedWords += 1;
		state.wordsCompleted += 1;
		state.index += 1;
		state.typed = '';
		state.wordError = false;
		state.hintVisible = false;
		state.combo += 1;
		state.bestCombo = Math.max(state.bestCombo, state.combo);
		events.onCorrect?.(state.combo);

		if (state.index >= state.deck.length) finish();
	}

	function submit(): void {
		if (state.status !== 'running') return;
		tick();
		if (state.status !== 'running' || !state.typed.trim()) return;

		const entry = state.deck[state.index];
		if (!entry) {
			finish();
			return;
		}

		const comparison = compareAnswers(state.typed.trim(), entry.answers);
		state.attempts += 1;
		state.comparedChars += comparison.comparedChars;

		if (comparison.isCorrect) {
			advance(comparison.correctChars);
			return;
		}

		state.errors += 1;
		state.combo = 0;
		state.wordError = true;
		events.onError?.();
	}

	function revealHint(): void {
		if (state.status !== 'running' || state.hintVisible || !isTranslationMode(level.mode)) return;
		state.hintVisible = true;
		state.hintsUsed += 1;
	}

	function append(value: string): void {
		if (state.status !== 'running') return;
		state.typed += value;
		state.wordError = false;
	}

	function backspace(): void {
		if (state.status !== 'running') return;
		state.typed = Array.from(state.typed).slice(0, -1).join('');
		state.wordError = false;
	}

	function setTyped(value: string): void {
		if (state.status !== 'running') return;
		state.typed = value;
		state.wordError = false;
	}

	function clearTyped(): void {
		state.typed = '';
		state.wordError = false;
	}

	function restart(): void {
		clearTimers();
		state.status = 'finished';
		begin();
	}

	function destroy(): void {
		clearTimers();
	}

	return {
		state,
		begin,
		pause,
		resume,
		finish,
		submit,
		revealHint,
		append,
		backspace,
		setTyped,
		clearTyped,
		restart,
		destroy
	};
}
