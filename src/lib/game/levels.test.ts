import { describe, expect, it } from 'vitest';
import {
	CUSTOM_LIMITS,
	FIXED_LEVELS,
	createCustomLevel,
	getFixedLevel,
	getWordPool,
	resolveLevel
} from './levels';

describe('níveis fixos', () => {
	it('define os três níveis conforme a documentação', () => {
		expect(FIXED_LEVELS.iniciante.wordCount).toBe(10);
		expect(FIXED_LEVELS.iniciante.seconds).toBe(35);
		expect(FIXED_LEVELS.amador.wordCount).toBe(15);
		expect(FIXED_LEVELS.amador.seconds).toBe(30);
		expect(FIXED_LEVELS.expert.wordCount).toBe(30);
		expect(FIXED_LEVELS.expert.seconds).toBe(40);
	});

	it('marca apenas os níveis fixos como ranqueados', () => {
		expect(FIXED_LEVELS.iniciante.ranked).toBe(true);
		expect(FIXED_LEVELS.amador.ranked).toBe(true);
		expect(FIXED_LEVELS.expert.ranked).toBe(true);
	});

	it('busca um nível fixo por id e rejeita desconhecidos', () => {
		expect(getFixedLevel('expert')?.label).toBe('Expert');
		expect(getFixedLevel('personalizado')).toBeNull();
		expect(getFixedLevel('qualquer')).toBeNull();
	});

	it('devolve o pool correto por nível', () => {
		expect(getWordPool(FIXED_LEVELS.iniciante)).toHaveLength(10);
		expect(getWordPool(FIXED_LEVELS.amador)).toHaveLength(15);
		expect(getWordPool(FIXED_LEVELS.expert)).toHaveLength(30);
	});
});

describe('modo personalizado', () => {
	it('aceita os limites máximos', () => {
		const level = createCustomLevel(CUSTOM_LIMITS.maxWords, CUSTOM_LIMITS.maxSeconds);

		expect(level?.wordCount).toBe(100);
		expect(level?.seconds).toBe(120);
		expect(level?.ranked).toBe(false);
	});

	it('rejeita valores fora dos limites', () => {
		expect(createCustomLevel(0, 60)).toBeNull();
		expect(createCustomLevel(101, 60)).toBeNull();
		expect(createCustomLevel(20, 4)).toBeNull();
		expect(createCustomLevel(20, 121)).toBeNull();
		expect(createCustomLevel(10.5, 60)).toBeNull();
	});

	it('resolve o modo personalizado com valores padrão', () => {
		const level = resolveLevel('personalizado', null, null);

		expect(level?.wordCount).toBe(20);
		expect(level?.seconds).toBe(60);
	});

	it('resolve níveis fixos ignorando palavras e tempo', () => {
		expect(resolveLevel('iniciante', 99, 99)?.seconds).toBe(35);
		expect(resolveLevel('desconhecido', null, null)).toBeNull();
	});
});
