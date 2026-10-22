import { describe, expect, it } from 'vitest';
import { createDeck, shuffle } from './deck';
import { createCustomLevel, getFixedLevel } from './levels';

describe('shuffle', () => {
	it('produz uma permutação sem perder itens nem mutar o original', () => {
		const original = ['a', 'b', 'c', 'd', 'e'];
		const result = shuffle(original, () => 0);

		expect([...result].sort()).toEqual(original);
		expect(original).toEqual(['a', 'b', 'c', 'd', 'e']);
	});
});

describe('createDeck', () => {
	it('cria o baralho com a quantidade exata do nível, sem repetir', () => {
		const level = getFixedLevel('iniciante');
		expect(level).not.toBeNull();
		if (!level) return;

		const deck = createDeck(level, () => 0);

		expect(deck).toHaveLength(10);
		expect(new Set(deck.map((entry) => entry.prompt)).size).toBe(10);
	});

	it('usa o banco de tradução no modo inglês → português', () => {
		const level = getFixedLevel('amador', 'en-pt');
		expect(level).not.toBeNull();
		if (!level) return;

		const deck = createDeck(level);

		expect(deck).toHaveLength(15);
		expect(deck.every((entry) => /^[a-z]+$/.test(entry.prompt))).toBe(true);
		expect(deck.every((entry) => entry.answers.length >= 1)).toBe(true);
	});

	it('limita a no máximo 100 palavras', () => {
		const custom = createCustomLevel(100, 60);
		expect(custom).not.toBeNull();
		if (!custom) return;

		expect(createDeck({ ...custom, wordCount: 999 }, () => 0)).toHaveLength(100);
	});
});
