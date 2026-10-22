import { describe, expect, it } from 'vitest';
import {
	correctCharsBounds,
	customConfigSchema,
	leaderboardQuerySchema,
	nicknameSchema,
	scoreSubmissionSchema
} from './validation';

describe('nicknameSchema', () => {
	it('grava vazio quando o apelido fica em branco e remove espaços das pontas', () => {
		expect(nicknameSchema.parse('   ')).toBe('');
		expect(nicknameSchema.parse('  Zion  ')).toBe('Zion');
	});

	it('rejeita caracteres especiais e mais de 20 caracteres', () => {
		expect(nicknameSchema.safeParse('a@b').success).toBe(false);
		expect(nicknameSchema.safeParse('<script>').success).toBe(false);
		expect(nicknameSchema.safeParse('a'.repeat(21)).success).toBe(false);
		expect(nicknameSchema.safeParse('a'.repeat(20)).success).toBe(true);
	});

	it('aceita acentos, números, apóstrofo e hífen', () => {
		expect(nicknameSchema.parse("João d'Ávila-2")).toBe("João d'Ávila-2");
	});
});

describe('scoreSubmissionSchema', () => {
	const valid = {
		nickname: 'Zion',
		mode: 'pt',
		level: 'iniciante',
		wordsCompleted: 8,
		wordsTotal: 10,
		correctChars: 40,
		comparedChars: 45,
		hintedWords: 0,
		durationMs: 35_000
	};

	it('aceita um envio válido e assume o modo português quando ausente', () => {
		const { mode, ...withoutMode } = valid;
		void mode;
		const result = scoreSubmissionSchema.safeParse(withoutMode);

		expect(result.success).toBe(true);
		if (result.success) expect(result.data.mode).toBe('pt');
	});

	it('grava apelido vazio quando ausente, sem texto de exibição', () => {
		const { nickname, ...withoutNickname } = valid;
		void nickname;
		const result = scoreSubmissionSchema.safeParse(withoutNickname);

		expect(result.success && result.data.nickname).toBe('');
	});

	it('exige números inteiros e rejeita modo ou nível fora do ranking', () => {
		expect(scoreSubmissionSchema.safeParse({ ...valid, durationMs: 35_000.45 }).success).toBe(
			false
		);
		expect(scoreSubmissionSchema.safeParse({ ...valid, level: 'personalizado' }).success).toBe(
			false
		);
		expect(scoreSubmissionSchema.safeParse({ ...valid, mode: 'pt-en' }).success).toBe(false);
	});

	it('rejeita zero progresso e totais incoerentes', () => {
		expect(scoreSubmissionSchema.safeParse({ ...valid, wordsCompleted: 0 }).success).toBe(false);
		expect(scoreSubmissionSchema.safeParse({ ...valid, wordsCompleted: 11 }).success).toBe(false);
		expect(scoreSubmissionSchema.safeParse({ ...valid, wordsTotal: 12 }).success).toBe(false);
		expect(scoreSubmissionSchema.safeParse({ ...valid, correctChars: 999 }).success).toBe(false);
	});

	it('rejeita caracteres incompatíveis com as palavras do nível', () => {
		expect(
			scoreSubmissionSchema.safeParse({ ...valid, correctChars: 200, comparedChars: 200 }).success
		).toBe(false);
		expect(scoreSubmissionSchema.safeParse({ ...valid, correctChars: 5 }).success).toBe(false);
	});

	it('rejeita partidas incompletas encerradas antes do tempo e durações implausíveis', () => {
		expect(scoreSubmissionSchema.safeParse({ ...valid, durationMs: 1_000 }).success).toBe(false);
		expect(scoreSubmissionSchema.safeParse({ ...valid, durationMs: 40_000 }).success).toBe(false);
		expect(
			scoreSubmissionSchema.safeParse({
				...valid,
				wordsCompleted: 10,
				correctChars: 50,
				comparedChars: 50,
				durationMs: 1_200
			}).success
		).toBe(false);
	});

	it('só aceita dicas no modo de tradução e nunca mais que as palavras concluídas', () => {
		expect(scoreSubmissionSchema.safeParse({ ...valid, hintedWords: 1 }).success).toBe(false);
		const translation = { ...valid, mode: 'en-pt', correctChars: 36, hintedWords: 2 };
		expect(scoreSubmissionSchema.safeParse(translation).success).toBe(true);
		expect(scoreSubmissionSchema.safeParse({ ...translation, hintedWords: 9 }).success).toBe(false);
	});

	it('reduz o mínimo de caracteres quando há palavras com dica', () => {
		const plain = correctCharsBounds('en-pt', 'iniciante', 5, 0);
		const hinted = correctCharsBounds('en-pt', 'iniciante', 5, 2);
		expect(hinted.minimum).toBeLessThan(plain.minimum);
		expect(hinted.maximum).toBe(plain.maximum);
	});
});

describe('leaderboardQuerySchema', () => {
	it('usa português, iniciante e limite 10 por padrão', () => {
		expect(leaderboardQuerySchema.parse({})).toEqual({
			modo: 'pt',
			nivel: 'iniciante',
			limite: 10
		});
	});

	it('lê modo, nível e limite textual', () => {
		expect(leaderboardQuerySchema.parse({ modo: 'en-pt', nivel: 'amador', limite: '5' })).toEqual({
			modo: 'en-pt',
			nivel: 'amador',
			limite: 5
		});
	});

	it('rejeita limite ou modo fora da faixa', () => {
		expect(leaderboardQuerySchema.safeParse({ limite: '21' }).success).toBe(false);
		expect(leaderboardQuerySchema.safeParse({ limite: '0' }).success).toBe(false);
		expect(leaderboardQuerySchema.safeParse({ modo: 'es' }).success).toBe(false);
	});
});

describe('customConfigSchema', () => {
	it('aceita os limites e rejeita fora deles', () => {
		expect(customConfigSchema.safeParse({ words: 100, seconds: 120 }).success).toBe(true);
		expect(customConfigSchema.safeParse({ words: 1, seconds: 5 }).success).toBe(true);
		expect(customConfigSchema.safeParse({ words: 101, seconds: 60 }).success).toBe(false);
		expect(customConfigSchema.safeParse({ words: 10, seconds: 121 }).success).toBe(false);
	});
});
