import { describe, expect, it } from 'vitest';
import { CUSTOM_POOL, WORDS, WORD_COUNTS } from './words';

describe('listas de palavras', () => {
	it('mantém exatamente as quantidades documentadas', () => {
		expect(WORDS.iniciante).toHaveLength(10);
		expect(WORDS.amador).toHaveLength(15);
		expect(WORDS.expert).toHaveLength(30);
		expect(WORDS.extras).toHaveLength(45);
	});

	it('monta o pool personalizado com 100 entradas e 99 únicas', () => {
		expect(CUSTOM_POOL).toHaveLength(100);
		expect(new Set(CUSTOM_POOL).size).toBe(99);
		expect(CUSTOM_POOL.filter((word) => word === 'mesa')).toHaveLength(2);
	});

	it('expoe a contagem por pool', () => {
		expect(WORD_COUNTS.iniciante).toBe(10);
		expect(WORD_COUNTS.amador).toBe(15);
		expect(WORD_COUNTS.expert).toBe(30);
		expect(WORD_COUNTS.extras).toBe(45);
		expect(WORD_COUNTS.custom).toBe(100);
	});
});
