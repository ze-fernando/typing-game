import { createDeck } from '#lib/game/deck';
import { calculateAccuracy, calculateWpm, compareWord } from '#lib/game/scoring';
import type { GameResult, GameStatus, LevelConfig } from '#lib/game/types';

export interface GameEvents {
	onCountdown?: (value: number) => void;
	onStart?: () => void;
	onCorrect?: () => void;
	onError?: () => void;
	onFinish?: (result: GameResult) => void;
}

export interface GameState {
	status: GameStatus;
	level: LevelConfig;
	deck: string[];
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
	result: GameResult | null;
}

function initialState(level: LevelConfig): GameState {
	return {
		status: 'idle',
		level,
		deck: createDeck(level),
		index: 0,
		typed: '',
		countdown: 3,
		remainingMs: level.seconds * 1000,
		wordsCompleted: 0,
		correctChars: 0,
		comparedChars: 0,
		attempts: 0,
		errors: 0,
		wordError: false,
		result: null
	};
}

export function createGame(level: LevelConfig, events: GameEvents = {}) {
	const state = $state<GameState>(initialState(level));

	let countdownTimer: ReturnType<typeof setInterval> | null = null;
	let tickTimer: ReturnType<typeof setInterval> | null = null;
	let startedAt = 0;
	let pausedAt = 0;
	let pausedTotal = 0;

	function clearCountdown(): void {
		if (countdownTimer) {
			clearInterval(countdownTimer);
			countdownTimer = null;
		}
	}

	function clearTicker(): void {
		if (tickTimer) {
			clearInterval(tickTimer);
			tickTimer = null;
		}
	}

	function clearTimers(): void {
		clearCountdown();
		clearTicker();
	}

	function activeElapsed(): number {
		if (!startedAt) return 0;

		const now = state.status === 'paused' && pausedAt ? pausedAt : performance.now();

		return Math.max(0, now - startedAt - pausedTotal);
	}

	function tick(): void {
		if (state.status !== 'running') return;

		const elapsed = activeElapsed();
		state.remainingMs = Math.max(0, level.seconds * 1000 - elapsed);

		if (state.remainingMs <= 0) {
			finish();
		}
	}

	function startTicker(): void {
		clearTicker();
		tickTimer = setInterval(tick, 50);
	}

	function begin(): void {
		if (state.status !== 'idle' && state.status !== 'finished') return;

		clearTimers();
		state.status = 'countdown';
		state.countdown = 3;
		state.typed = '';
		state.wordError = false;
		state.remainingMs = level.seconds * 1000;
		state.index = 0;
		state.wordsCompleted = 0;
		state.correctChars = 0;
		state.comparedChars = 0;
		state.attempts = 0;
		state.errors = 0;
		state.result = null;
		state.deck = createDeck(level);
		startedAt = 0;
		pausedAt = 0;
		pausedTotal = 0;
		events.onCountdown?.(state.countdown);

		countdownTimer = setInterval(() => {
			if (state.countdown > 1) {
				state.countdown -= 1;
				events.onCountdown?.(state.countdown);
				return;
			}

			clearCountdown();
			state.countdown = 0;
			state.status = 'running';
			startedAt = performance.now();
			pausedTotal = 0;
			state.remainingMs = level.seconds * 1000;
			events.onStart?.();
			startTicker();
		}, 1000);
	}

	function pause(): void {
		if (state.status !== 'running') return;

		pausedAt = performance.now();
		state.status = 'paused';
		clearTicker();
	}

	function resume(): void {
		if (state.status !== 'paused') return;

		if (pausedAt) {
			pausedTotal += performance.now() - pausedAt;
			pausedAt = 0;
		}

		state.status = 'running';
		events.onStart?.();
		startTicker();
	}

	function finish(): void {
		if (state.status === 'finished') return;

		const elapsed = Math.min(level.seconds * 1000, Math.max(1, activeElapsed()));
		clearTimers();
		state.status = 'finished';
		state.remainingMs = Math.max(0, level.seconds * 1000 - elapsed);
		state.typed = '';
		state.wordError = false;

		const result: GameResult = {
			level: level.id,
			wordsCompleted: state.wordsCompleted,
			wordsTotal: state.deck.length,
			correctChars: state.correctChars,
			comparedChars: state.comparedChars,
			attempts: state.attempts,
			errors: state.errors,
			durationMs: elapsed,
			wpm: calculateWpm(state.correctChars, elapsed),
			accuracy: calculateAccuracy(state.correctChars, state.comparedChars)
		};

		state.result = result;
		events.onFinish?.(result);
	}

	function submit(): void {
		if (state.status !== 'running') return;

		const target = state.deck[state.index];
		if (!target) {
			finish();
			return;
		}

		const comparison = compareWord(state.typed.trim(), target);
		state.attempts += 1;
		state.correctChars += comparison.correctChars;
		state.comparedChars += comparison.comparedChars;

		if (comparison.isCorrect) {
			state.wordsCompleted += 1;
			state.index += 1;
			state.typed = '';
			state.wordError = false;
			events.onCorrect?.();

			if (state.index >= state.deck.length) {
				finish();
			}

			return;
		}

		state.errors += 1;
		state.wordError = true;
		events.onError?.();
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
		state.typed = value;
		state.wordError = false;
	}

	function clearTyped(): void {
		state.typed = '';
		state.wordError = false;
	}

	function restart(): void {
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
		append,
		backspace,
		setTyped,
		clearTyped,
		restart,
		destroy
	};
}
