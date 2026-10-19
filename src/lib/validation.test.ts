import { describe, expect, it } from 'vitest';
import {
	customConfigSchema,
	leaderboardQuerySchema,
	nicknameSchema,
	scoreSubmissionSchema
} from './validation';

describe('nicknameSchema', () => {
	it('usa Anônimo quando vazio', () => {
		expect(nicknameSchema.parse('   ')).toBe('Anônimo');
	});

	it('remove espaços das pontas', () => {
		expect(nicknameSchema.parse('  Zion  ')).toBe('Zion');
	});

	it('rejeita caracteres especiais', () => {
		expect(nicknameSchema.safeParse('a@b').success).toBe(false);
		expect(nicknameSchema.safeParse('a'.repeat(21)).success).toBe(false);
	});

	it('aceita acentos, números, apóstrofo e hífen', () => {
		expect(nicknameSchema.parse("João d'Ávila-2")).toBe("João d'Ávila-2");
	});
});

describe('scoreSubmissionSchema', () => {
	const valid = {
		nickname: 'Zion',
		level: 'iniciante',
		wordsCompleted: 8,
		wordsTotal: 10,
		correctChars: 40,
		comparedChars: 45,
		durationMs: 30_000
	};

	it('aceita um envio válido', () => {
		const result = scoreSubmissionSchema.safeParse(valid);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.nickname).toBe('Zion');
		}
	});

	it('aplica o apelido padrão quando ausente', () => {
		const { nickname, ...withoutNickname } = valid;
		void nickname;
		const result = scoreSubmissionSchema.safeParse(withoutNickname);

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.nickname).toBe('Anônimo');
		}
	});

	it('rejeita palavras concluídas maior que o total', () => {
		const result = scoreSubmissionSchema.safeParse({ ...valid, wordsCompleted: 11 });

		expect(result.success).toBe(false);
	});

	it('rejeita acertos maior que caracteres comparados', () => {
		const result = scoreSubmissionSchema.safeParse({ ...valid, correctChars: 999 });

		expect(result.success).toBe(false);
	});

	it('rejeita nível personalizado no ranking', () => {
		const result = scoreSubmissionSchema.safeParse({ ...valid, level: 'personalizado' });

		expect(result.success).toBe(false);
	});
});

describe('leaderboardQuerySchema', () => {
	it('usa iniciante e limite 10 por padrão', () => {
		const result = leaderboardQuerySchema.parse({});

		expect(result.nivel).toBe('iniciante');
		expect(result.limite).toBe(10);
	});

	it('converte limite textual', () => {
		const result = leaderboardQuerySchema.parse({ nivel: 'amador', limite: '5' });

		expect(result.nivel).toBe('amador');
		expect(result.limite).toBe(5);
	});

	it('rejeita limite fora da faixa', () => {
		expect(leaderboardQuerySchema.safeParse({ limite: '21' }).success).toBe(false);
		expect(leaderboardQuerySchema.safeParse({ limite: '0' }).success).toBe(false);
	});
});

describe('customConfigSchema', () => {
	it('aceita os limites', () => {
		expect(customConfigSchema.safeParse({ words: 100, seconds: 120 }).success).toBe(true);
		expect(customConfigSchema.safeParse({ words: 1, seconds: 5 }).success).toBe(true);
	});

	it('rejeita fora dos limites', () => {
		expect(customConfigSchema.safeParse({ words: 101, seconds: 60 }).success).toBe(false);
		expect(customConfigSchema.safeParse({ words: 10, seconds: 121 }).success).toBe(false);
	});
});
