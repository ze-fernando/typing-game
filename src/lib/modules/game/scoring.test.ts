import { describe, expect, it } from 'vitest';
import {
	calculateAccuracy,
	calculateWpm,
	compareWord,
	formatClock,
	formatDuration,
	normalizeWord,
	toChars
} from './scoring';

describe('compareWord', () => {
	it('marca letras corretas, incorretas e pendentes', () => {
		const result = compareWord('caza', 'casa');

		expect(result.letters).toEqual(['correct', 'correct', 'incorrect', 'correct']);
		expect(result.correctChars).toBe(3);
		expect(result.comparedChars).toBe(4);
		expect(result.isCorrect).toBe(false);
	});

	it('ignora maiúsculas e minúsculas', () => {
		const result = compareWord('ÁRVORE', 'árvore');

		expect(result.isCorrect).toBe(true);
		expect(result.correctChars).toBe(6);
	});

	it('diferencia acentos', () => {
		const result = compareWord('arvore', 'árvore');

		expect(result.isCorrect).toBe(false);
		expect(result.letters[0]).toBe('incorrect');
		expect(result.correctChars).toBe(5);
	});

	it('conta caracteres extras como erro', () => {
		const result = compareWord('casas', 'casa');

		expect(result.isCorrect).toBe(false);
		expect(result.extra).toEqual(['s']);
		expect(result.comparedChars).toBe(5);
	});

	it('trata palavra incompleta como pendente e não correta', () => {
		const result = compareWord('ca', 'casa');

		expect(result.isCorrect).toBe(false);
		expect(result.letters).toEqual(['correct', 'correct', 'pending', 'pending']);
		expect(result.correctChars).toBe(2);
	});
});

describe('cálculos da partida', () => {
	it('calcula WPM com 5 caracteres por palavra', () => {
		expect(calculateWpm(25, 60_000)).toBe(5);
		expect(calculateWpm(50, 30_000)).toBe(20);
	});

	it('retorna 0 para entradas inválidas', () => {
		expect(calculateWpm(0, 60_000)).toBe(0);
		expect(calculateWpm(25, 0)).toBe(0);
	});

	it('calcula precisão percentual com uma casa decimal', () => {
		expect(calculateAccuracy(9, 10)).toBe(90);
		expect(calculateAccuracy(0, 0)).toBe(100);
		expect(calculateAccuracy(1, 3)).toBe(33.3);
	});

	it('formata tempo restante como segundos ou minutos', () => {
		expect(formatClock(35_000)).toBe('35');
		expect(formatClock(65_000)).toBe('1:05');
		expect(formatClock(0)).toBe('00');
	});

	it('formata duração ativa', () => {
		expect(formatDuration(35_000)).toBe('35s');
		expect(formatDuration(65_000)).toBe('1m 05s');
	});
});

describe('helpers de texto', () => {
	it('converte para code points, incluindo emojis', () => {
		expect(toChars('ação')).toEqual(['a', 'ç', 'ã', 'o']);
		expect(toChars('ok👍')).toEqual(['o', 'k', '👍']);
	});

	it('normaliza para NFC minúsculo', () => {
		expect(normalizeWord('AÇÃO')).toBe('ação');
	});
});
