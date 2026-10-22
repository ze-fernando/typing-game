import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCustomLevel, getFixedLevel } from '#lib/modules/game/levels';
import type { GameResult, LevelConfig } from '#lib/modules/game/types';
import { createGame, type Game, type GameClock } from './game.svelte';

let now = 0;

const clock: GameClock = {
	now: () => now,
	every: (callback, ms) => setInterval(callback, ms),
	stop: (timer) => clearInterval(timer)
};

function advance(ms: number): void {
	now += ms;
	vi.advanceTimersByTime(ms);
}

function startedGame(level: LevelConfig, onFinish?: (result: GameResult) => void): Game {
	const game = createGame(level, { onFinish }, clock);
	game.begin();
	advance(3000);
	return game;
}

function typeCurrent(game: Game, value?: string): void {
	game.setTyped(value ?? game.state.deck[game.state.index].answers[0]);
	game.submit();
}

beforeEach(() => {
	now = 0;
	vi.useFakeTimers();
});

afterEach(() => vi.useRealTimers());

const beginner = getFixedLevel('iniciante') as LevelConfig;

describe('partida', () => {
	it('só libera digitação depois da contagem regressiva', () => {
		const game = createGame(beginner, {}, clock);
		game.begin();
		expect(game.state.status).toBe('countdown');
		game.setTyped('abc');
		expect(game.state.typed).toBe('');
		advance(3000);
		expect(game.state.status).toBe('running');
		expect(game.state.remainingMs).toBe(35_000);
	});

	it('termina exatamente no prazo e ignora envios depois dele', () => {
		const onFinish = vi.fn();
		const game = startedGame(beginner, onFinish);
		game.setTyped(game.state.deck[0].answers[0]);
		now += 35_000;
		game.submit();

		expect(game.state.status).toBe('finished');
		expect(game.state.wordsCompleted).toBe(0);
		expect(onFinish).toHaveBeenCalledTimes(1);
		expect(onFinish.mock.calls[0][0].durationMs).toBe(35_000);
	});

	it('pausa congela o tempo ativo e a retomada continua de onde parou', () => {
		const game = startedGame(beginner);
		advance(10_000);
		game.pause();
		advance(60_000);
		expect(game.state.status).toBe('paused');
		expect(game.state.remainingMs).toBe(25_000);
		game.resume();
		advance(5_000);
		expect(game.state.remainingMs).toBe(20_000);
	});

	it('pausar durante a contagem retoma a contagem', () => {
		const game = createGame(beginner, {}, clock);
		game.begin();
		advance(1000);
		game.pause();
		advance(10_000);
		expect(game.state.status).toBe('paused');
		game.resume();
		expect(game.state.status).toBe('countdown');
		advance(2000);
		expect(game.state.status).toBe('running');
	});

	it('prefixo ou palavra errada não pontua e zera o combo', () => {
		const game = startedGame(beginner);
		typeCurrent(game);
		typeCurrent(game);
		expect(game.state.combo).toBe(2);
		const target = game.state.deck[game.state.index].answers[0];
		typeCurrent(game, target.slice(0, -1));

		expect(game.state.wordError).toBe(true);
		expect(game.state.wordsCompleted).toBe(2);
		expect(game.state.combo).toBe(0);
		expect(game.state.bestCombo).toBe(2);
		expect(game.state.errors).toBe(1);
	});

	it('termina ao concluir o baralho com WPM pelo tempo ativo', () => {
		const level = createCustomLevel(2, 30) as LevelConfig;
		const onFinish = vi.fn();
		const game = startedGame(level, onFinish);
		const chars = game.state.deck.reduce(
			(total, entry) => total + Array.from(entry.answers[0]).length,
			0
		);
		now += 6_000;
		typeCurrent(game);
		typeCurrent(game);

		const result = onFinish.mock.calls[0][0] as GameResult;
		expect(result.wordsCompleted).toBe(2);
		expect(result.correctChars).toBe(chars);
		expect(result.durationMs).toBe(6_000);
		expect(result.wpm).toBe(Math.round((chars / 5 / 0.1) * 10) / 10);
		expect(result.bestCombo).toBe(2);
	});

	it('não gera partida nova depois de terminar até reiniciar', () => {
		const game = startedGame(createCustomLevel(1, 5) as LevelConfig);
		advance(5_000);
		expect(game.state.status).toBe('finished');
		game.append('a');
		expect(game.state.typed).toBe('');
		game.restart();
		expect(game.state.status).toBe('countdown');
		expect(game.state.wordsCompleted).toBe(0);
	});
});

describe('modo inglês → português', () => {
	const translation = getFixedLevel('iniciante', 'en-pt') as LevelConfig;

	it('aceita qualquer tradução alternativa', () => {
		const game = startedGame(translation);
		const entry = game.state.deck[0];
		typeCurrent(game, entry.answers[entry.answers.length - 1].toUpperCase());
		expect(game.state.wordsCompleted).toBe(1);
	});

	it('dica vale metade dos caracteres e é contada no resultado', () => {
		const onFinish = vi.fn();
		const game = startedGame(translation, onFinish);
		const answer = game.state.deck[0].answers[0];
		game.revealHint();
		game.revealHint();
		typeCurrent(game, answer);

		expect(game.state.hintsUsed).toBe(1);
		expect(game.state.hintedWords).toBe(1);
		expect(game.state.correctChars).toBe(Math.floor(Array.from(answer).length / 2));
		expect(game.state.hintVisible).toBe(false);
		game.finish();
		expect(onFinish.mock.calls[0][0].hintedWords).toBe(1);
	});

	it('não oferece dica nos modos de digitação', () => {
		const game = startedGame(beginner);
		game.revealHint();
		expect(game.state.hintVisible).toBe(false);
	});
});
