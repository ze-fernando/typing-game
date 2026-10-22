import { describe, expect, it } from 'vitest';
import {
	CUSTOM_LIMITS,
	FIXED_LEVEL_IDS,
	createCustomLevel,
	getDeckPool,
	getFixedLevel,
	getLevelPool,
	isGameMode,
	levelKey,
	resolveLevel
} from './levels';

describe('níveis fixos', () => {
	it('define os três níveis conforme a documentação', () => {
		expect(getFixedLevel('iniciante')).toMatchObject({ wordCount: 10, seconds: 35, ranked: true });
		expect(getFixedLevel('amador')).toMatchObject({ wordCount: 15, seconds: 30, ranked: true });
		expect(getFixedLevel('expert')).toMatchObject({ wordCount: 30, seconds: 40, ranked: true });
	});

	it('usa os mesmos tempos e quantidades em todos os modos', () => {
		for (const mode of ['pt', 'en', 'en-pt'] as const) {
			for (const id of FIXED_LEVEL_IDS) {
				const level = getFixedLevel(id, mode);
				expect(level?.mode).toBe(mode);
				expect(level?.wordCount).toBe(getFixedLevel(id)?.wordCount);
			}
		}
	});

	it('rejeita ids desconhecidos e o personalizado como nível fixo', () => {
		expect(getFixedLevel('personalizado')).toBeNull();
		expect(getFixedLevel('avancado')).toBeNull();
	});

	it('reconhece apenas os três modos', () => {
		expect(isGameMode('pt')).toBe(true);
		expect(isGameMode('en-pt')).toBe(true);
		expect(isGameMode('pt-en')).toBe(false);
	});

	it('gera uma chave estável por modo e nível', () => {
		expect(levelKey({ id: 'expert', mode: 'en-pt' })).toBe('en-pt:expert');
	});
});

describe('bancos por modo', () => {
	it('tem pelo menos 150 entradas por nível em cada modo', () => {
		for (const mode of ['pt', 'en', 'en-pt'] as const) {
			for (const id of FIXED_LEVEL_IDS) {
				expect(getLevelPool(mode, id).length).toBeGreaterThanOrEqual(150);
			}
		}
	});

	it('nos modos de digitação a resposta é a própria palavra', () => {
		const [entry] = getLevelPool('pt', 'amador');
		expect(entry.answers).toEqual([entry.prompt]);
	});

	it('o personalizado junta os três níveis do modo', () => {
		const custom = createCustomLevel(20, 60, 'en');
		expect(custom).not.toBeNull();
		if (!custom) return;

		const total = FIXED_LEVEL_IDS.reduce((sum, id) => sum + getLevelPool('en', id).length, 0);
		expect(getDeckPool(custom)).toHaveLength(total);
	});
});

describe('modo personalizado', () => {
	it('aceita os limites máximos e fica fora do ranking', () => {
		const level = createCustomLevel(CUSTOM_LIMITS.maxWords, CUSTOM_LIMITS.maxSeconds);

		expect(level).toMatchObject({ wordCount: 100, seconds: 120, ranked: false, mode: 'pt' });
	});

	it('rejeita valores fora dos limites', () => {
		expect(createCustomLevel(0, 60)).toBeNull();
		expect(createCustomLevel(101, 60)).toBeNull();
		expect(createCustomLevel(20, 4)).toBeNull();
		expect(createCustomLevel(20, 121)).toBeNull();
		expect(createCustomLevel(10.5, 60)).toBeNull();
	});

	it('resolve o personalizado com valores padrão e níveis fixos ignorando extras', () => {
		expect(resolveLevel('personalizado', 'en-pt', null, null)).toMatchObject({
			wordCount: 20,
			seconds: 60,
			mode: 'en-pt'
		});
		expect(resolveLevel('iniciante', 'pt', 99, 99)?.seconds).toBe(35);
		expect(resolveLevel('desconhecido')).toBeNull();
	});
});
