import { describe, expect, it } from 'vitest';
import { compareAnswers, creditedChars } from '#lib/modules/game/scoring';
import {
	closestAnswer,
	findAccentMismatch,
	isAcceptedTranslation,
	translationHint,
	typedFeedback
} from './matching';

const house = ['casa', 'moradia', 'lar'];
const apple = ['maçã'];

describe('aceite de traduções', () => {
	it('aceita qualquer alternativa listada, sem diferenciar maiúsculas', () => {
		expect(isAcceptedTranslation('casa', house)).toBe(true);
		expect(isAcceptedTranslation('Moradia', house)).toBe(true);
		expect(isAcceptedTranslation('LAR ', house)).toBe(true);
		expect(isAcceptedTranslation('predio', house)).toBe(false);
		expect(isAcceptedTranslation('', house)).toBe(false);
	});

	it('é sensível a acentos', () => {
		expect(isAcceptedTranslation('maçã', apple)).toBe(true);
		expect(isAcceptedTranslation('MAÇÃ', apple)).toBe(true);
		expect(isAcceptedTranslation('maca', apple)).toBe(false);
		expect(isAcceptedTranslation('macã', apple)).toBe(false);
	});

	it('aceita formas compostas e decompostas do mesmo acento', () => {
		expect(isAcceptedTranslation('maçã', apple)).toBe(true);
	});

	it('compara contra a alternativa que acertou ou a mais próxima', () => {
		expect(compareAnswers('lar', house)).toMatchObject({ isCorrect: true, answer: 'lar' });
		expect(compareAnswers('morad', house)).toMatchObject({ isCorrect: false, answer: 'moradia' });
		expect(closestAnswer('mor', house)).toBe('moradia');
		expect(closestAnswer('xyz', house)).toBe('casa');
	});

	it('prioriza a alternativa que explica o acento errado mesmo com empate no prefixo', () => {
		const dog = ['cachorro', 'cão'];
		expect(closestAnswer('cao', dog)).toBe('cão');
		expect(findAccentMismatch('cao', closestAnswer('cao', dog))).toEqual({
			expected: 'ã',
			typed: 'a'
		});
		expect(closestAnswer('cach', dog)).toBe('cachorro');
	});
});

describe('feedback por letra sem revelar a resposta', () => {
	it('marca letras certas enquanto o prefixo existe em alguma alternativa', () => {
		const feedback = typedFeedback('mor', house);
		expect(feedback.onTrack).toBe(true);
		expect(feedback.letters.map((letter) => letter.state)).toEqual([
			'correct',
			'correct',
			'correct'
		]);
	});

	it('marca a partir da primeira divergência', () => {
		const feedback = typedFeedback('cosa', house);
		expect(feedback.onTrack).toBe(false);
		expect(feedback.letters.map((letter) => letter.state)).toEqual([
			'correct',
			'incorrect',
			'incorrect',
			'incorrect'
		]);
	});

	it('aponta o acento errado', () => {
		expect(findAccentMismatch('maca', 'maçã')).toEqual({ expected: 'ç', typed: 'c' });
		expect(findAccentMismatch('mesa', 'maçã')).toBeNull();
	});
});

describe('dica', () => {
	it('revela a primeira letra e o tamanho da resposta canônica', () => {
		expect(translationHint(house)).toEqual({ first: 'c', length: 4 });
		expect(translationHint(apple)).toEqual({ first: 'm', length: 4 });
	});

	it('palavra com dica vale metade dos caracteres, arredondado para baixo', () => {
		expect(creditedChars(7, true)).toBe(3);
		expect(creditedChars(7, false)).toBe(7);
	});
});
