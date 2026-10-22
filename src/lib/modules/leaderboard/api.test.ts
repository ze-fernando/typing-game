import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ScoreSubmission } from '#lib/modules/game/types';
import { fetchLeaderboard, submitScore } from './api';

const submission: ScoreSubmission = {
	mode: 'pt',
	level: 'iniciante',
	wordsCompleted: 1,
	wordsTotal: 10,
	correctChars: 4,
	comparedChars: 4,
	hintedWords: 0,
	durationMs: 35000
};

const score = {
	nickname: 'Ana',
	mode: 'pt',
	level: 'iniciante',
	wordsCompleted: 1,
	wordsTotal: 10,
	wpm: 1.4,
	accuracy: 100,
	createdAt: '2026-10-22T00:00:00.000Z'
};

afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});

describe('cliente do ranking', () => {
	it('pede o ranking do modo e nível escolhidos', async () => {
		const request = vi.fn().mockResolvedValue(new Response(JSON.stringify({ scores: [score] })));
		vi.stubGlobal('fetch', request);

		expect(await fetchLeaderboard('en-pt', 'expert')).toEqual([score]);
		expect(request.mock.calls[0][0]).toBe('/api/leaderboard?modo=en-pt&nivel=expert&limite=10');
	});

	it('devolve estado offline quando a requisição falha', async () => {
		vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
		expect(await fetchLeaderboard('pt', 'iniciante')).toBeNull();
		expect(await submitScore(submission)).toEqual({ ok: false, error: 'network' });
	});

	it('limita requisições travadas a 10 segundos', async () => {
		const controller = new AbortController();
		vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
		vi.stubGlobal(
			'fetch',
			vi.fn(
				(_url, init) =>
					new Promise((_resolve, reject) => {
						init.signal.addEventListener('abort', () => reject(new Error('timeout')));
					})
			)
		);
		const pending = submitScore(submission);
		controller.abort();
		expect(await pending).toEqual({ ok: false, error: 'network' });
		expect(AbortSignal.timeout).toHaveBeenCalledWith(10000);
	});

	it('permite tentar de novo após falha temporária e devolve a posição', async () => {
		const request = vi
			.fn()
			.mockResolvedValueOnce(
				new Response(JSON.stringify({ error: 'unavailable' }), { status: 503 })
			)
			.mockResolvedValueOnce(new Response(JSON.stringify({ score, rank: 3 }), { status: 201 }));
		vi.stubGlobal('fetch', request);

		expect(await submitScore(submission)).toEqual({ ok: false, error: 'unavailable' });
		expect(await submitScore(submission)).toEqual({ ok: true, score, rank: 3 });
		expect(JSON.parse(request.mock.calls[1][1].body)).toEqual(submission);
	});

	it('traduz códigos de erro conhecidos', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValue(new Response(JSON.stringify({ error: 'rate_limited' }), { status: 429 }))
		);
		expect(await submitScore(submission)).toEqual({ ok: false, error: 'rate_limited' });
	});

	it('distingue ranking vazio de resposta inválida', async () => {
		vi.stubGlobal(
			'fetch',
			vi
				.fn()
				.mockResolvedValueOnce(new Response(JSON.stringify({ scores: [] })))
				.mockResolvedValueOnce(new Response('not json'))
				.mockResolvedValueOnce(new Response('{}'))
		);
		expect(await fetchLeaderboard('pt', 'iniciante')).toEqual([]);
		expect(await fetchLeaderboard('pt', 'iniciante')).toBeNull();
		expect(await submitScore(submission)).toEqual({ ok: false, error: 'response' });
	});
});
