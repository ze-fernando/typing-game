import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { bestStorageKey, getBest, saveBest, type BestTarget } from './bests';

const best = {
	wpm: 25,
	accuracy: 90,
	wordsCompleted: 5,
	wordsTotal: 10,
	savedAt: '2026-10-22T10:00:00.000Z'
};
const beginner: BestTarget = { id: 'iniciante', mode: 'pt', wordCount: 10, seconds: 35 };
const values = new Map<string, string>();

beforeEach(() => {
	values.clear();
	vi.stubGlobal('window', {
		localStorage: {
			getItem: (key: string) => values.get(key) ?? null,
			setItem: (key: string, value: string) => values.set(key, value)
		}
	});
});

afterEach(() => vi.unstubAllGlobals());

describe('recordes locais', () => {
	it('mantém a chave antiga do português e separa os outros modos', () => {
		expect(bestStorageKey(beginner)).toBe('typing-game:best:v1:iniciante');
		expect(bestStorageKey({ ...beginner, mode: 'en-pt' })).toBe(
			'typing-game:best:v1:en-pt:iniciante'
		);
		expect(bestStorageKey({ id: 'personalizado', mode: 'pt', wordCount: 10, seconds: 30 })).toBe(
			'typing-game:best:v1:personalizado:10:30'
		);
	});

	it('não premia progresso zero', async () => {
		expect(await saveBest(beginner, { ...best, wordsCompleted: 0 })).toEqual({
			saved: false,
			previous: null
		});
	});

	it('separa configurações personalizadas e modos', async () => {
		const custom: BestTarget = { id: 'personalizado', mode: 'pt', wordCount: 10, seconds: 30 };
		expect((await saveBest(custom, best)).saved).toBe(true);
		expect(await getBest({ ...custom, seconds: 60 })).toBeNull();
		expect(await getBest({ ...custom, mode: 'en' })).toBeNull();
		expect(await getBest(custom)).toEqual(best);
	});

	it('ignora registros corrompidos', async () => {
		for (const raw of [
			'-1|90|5|10|2026-10-22',
			'25|110|5|10|2026-10-22',
			'25|90|11|10|2026-10-22',
			'25|90|5|10|invalid',
			'25|90|5.5|10|2026-10-22',
			'25|90|5|10'
		]) {
			values.set('typing-game:best:v1:iniciante', raw);
			expect(await getBest(beginner)).toBeNull();
		}
	});

	it('preserva o melhor resultado e informa o anterior', async () => {
		expect(await saveBest(beginner, best)).toEqual({ saved: true, previous: null });
		expect(await saveBest(beginner, { ...best, wpm: 20 })).toEqual({
			saved: false,
			previous: best
		});
		const better = { ...best, wpm: 30 };
		expect(await saveBest(beginner, better)).toEqual({ saved: true, previous: best });
		expect(await getBest(beginner)).toEqual(better);
	});
});
