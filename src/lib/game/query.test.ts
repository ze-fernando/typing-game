import { describe, expect, it } from 'vitest';
import { gameHref, parseGameQuery } from './query';

describe('parseGameQuery', () => {
	it('usa o iniciante como padrão quando não há parâmetros', () => {
		const level = parseGameQuery(new URLSearchParams());

		expect(level?.id).toBe('iniciante');
		expect(level?.seconds).toBe(35);
	});

	it('lê um nível fixo da URL', () => {
		const level = parseGameQuery(new URLSearchParams('nivel=expert'));

		expect(level?.id).toBe('expert');
		expect(level?.wordCount).toBe(30);
	});

	it('lê o modo personalizado com palavras e tempo', () => {
		const level = parseGameQuery(new URLSearchParams('nivel=personalizado&palavras=42&tempo=90'));

		expect(level?.id).toBe('personalizado');
		expect(level?.wordCount).toBe(42);
		expect(level?.seconds).toBe(90);
	});

	it('usa padrões do modo personalizado quando os valores não são informados', () => {
		const level = parseGameQuery(new URLSearchParams('nivel=personalizado'));

		expect(level?.wordCount).toBe(20);
		expect(level?.seconds).toBe(60);
	});

	it('rejeita nível inválido ou valores fora da faixa', () => {
		expect(parseGameQuery(new URLSearchParams('nivel=impossivel'))).toBeNull();
		expect(parseGameQuery(new URLSearchParams('nivel=personalizado&palavras=0'))).toBeNull();
		expect(parseGameQuery(new URLSearchParams('nivel=personalizado&tempo=121'))).toBeNull();
	});
});

describe('gameHref', () => {
	it('gera href fixo sem parâmetros extras', () => {
		const level = parseGameQuery(new URLSearchParams('nivel=amador'));
		expect(level).not.toBeNull();
		if (!level) return;

		expect(gameHref(level)).toBe('/jogar?nivel=amador');
	});

	it('inclui palavras e tempo no modo personalizado', () => {
		const level = parseGameQuery(new URLSearchParams('nivel=personalizado&palavras=15&tempo=45'));
		expect(level).not.toBeNull();
		if (!level) return;

		expect(gameHref(level)).toBe('/jogar?nivel=personalizado&palavras=15&tempo=45');
	});
});
