import { describe, expect, it } from 'vitest';
import { createDeck, shuffle } from './deck';
import { FIXED_LEVELS, createCustomLevel } from './levels';

describe('shuffle', () => {
	it('produz uma permutação sem perder itens', () => {
		const original = ['a', 'b', 'c', 'd', 'e'];
		const result = shuffle(original, () => 0);

		expect(result).toHaveLength(5);
		expect([...result].sort()).toEqual([...original].sort());
	});

	it('não muta o array original', () => {
		const original = ['a', 'b', 'c'];
		shuffle(original, () => 0);

		expect(original).toEqual(['a', 'b', 'c']);
	});
});

describe('createDeck', () => {
	it('cria o baralho com a quantidade exata do nível', () => {
		const deck = createDeck(FIXED_LEVELS.iniciante, () => 0);

		expect(deck).toHaveLength(10);
		expect(new Set(deck).size).toBe(10);
	});

	it('cria 100 entradas no modo personalizado com uma repetição conhecida', () => {
		const custom = createCustomLevel(100, 120);
		expect(custom).not.toBeNull();
		if (!custom) return;

		const deck = createDeck(custom, () => 0);

		expect(deck).toHaveLength(100);
		expect(new Set(deck).size).toBe(99);
		expect(deck.filter((word) => word === 'mesa')).toHaveLength(2);
	});

	it('limita a no máximo 100 palavras mesmo se o nível pedir mais', () => {
		const custom = createCustomLevel(100, 60);
		expect(custom).not.toBeNull();
		if (!custom) return;

		const deck = createDeck({ ...custom, wordCount: 999 }, () => 0);

		expect(deck).toHaveLength(100);
	});
});
