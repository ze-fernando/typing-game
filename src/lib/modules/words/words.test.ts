import { describe, expect, it } from 'vitest';
import { TRANSLATION_BANK } from '#lib/modules/translation/bank';
import { EN_WORDS } from './en';
import { PT_WORDS } from './pt';

const ACCENTED = /[áàâãéêíóôõúüç]/;

describe('banco de palavras em português', () => {
	it('mantém a progressão de acentuação', () => {
		expect(PT_WORDS.iniciante.some((word) => ACCENTED.test(word))).toBe(false);
		expect(PT_WORDS.amador.every((word) => ACCENTED.test(word))).toBe(true);
		const accented = PT_WORDS.expert.filter((word) => ACCENTED.test(word)).length;
		expect(accented / PT_WORDS.expert.length).toBeGreaterThanOrEqual(0.75);
		expect(PT_WORDS.expert.every((word) => Array.from(word).length >= 10)).toBe(true);
	});

	it('não repete palavras e usa NFC minúsculo sem espaço', () => {
		const all = [...PT_WORDS.iniciante, ...PT_WORDS.amador, ...PT_WORDS.expert];
		expect(new Set(all).size).toBe(all.length);
		expect(all.every((word) => word === word.normalize('NFC').toLocaleLowerCase('pt-BR'))).toBe(
			true
		);
		expect(all.some((word) => /\s/.test(word))).toBe(false);
	});
});

describe('banco de palavras em inglês', () => {
	it('usa apenas a-z, sem repetir, crescendo de tamanho por nível', () => {
		const all = [...EN_WORDS.iniciante, ...EN_WORDS.amador, ...EN_WORDS.expert];
		expect(all.every((word) => /^[a-z]+$/.test(word))).toBe(true);
		expect(new Set(all).size).toBe(all.length);
		expect(EN_WORDS.iniciante.every((word) => word.length <= 5)).toBe(true);
		expect(EN_WORDS.expert.every((word) => word.length >= 10)).toBe(true);
	});
});

describe('banco de tradução inglês → português', () => {
	it('tem prompts únicos e respostas sem espaço', () => {
		const entries = [
			...TRANSLATION_BANK.iniciante,
			...TRANSLATION_BANK.amador,
			...TRANSLATION_BANK.expert
		];
		const prompts = entries.map((entry) => entry.prompt);
		expect(new Set(prompts).size).toBe(prompts.length);
		expect(entries.every((entry) => entry.answers.length >= 1)).toBe(true);
		expect(entries.flatMap((entry) => entry.answers).some((answer) => /\s/.test(answer))).toBe(
			false
		);
	});

	it('segue a progressão de acentos pela resposta canônica', () => {
		expect(TRANSLATION_BANK.iniciante.some((entry) => ACCENTED.test(entry.answers[0]))).toBe(false);
		expect(TRANSLATION_BANK.amador.every((entry) => ACCENTED.test(entry.answers[0]))).toBe(true);
	});
});
