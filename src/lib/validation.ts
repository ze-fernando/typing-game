import { z } from 'zod';
import { CUSTOM_LIMITS } from './game/levels';

export const fixedLevelSchema = z.enum(['iniciante', 'amador', 'expert']);

export const customConfigSchema = z.object({
	words: z.coerce.number().int().min(CUSTOM_LIMITS.minWords).max(CUSTOM_LIMITS.maxWords),
	seconds: z.coerce.number().int().min(CUSTOM_LIMITS.minSeconds).max(CUSTOM_LIMITS.maxSeconds)
});

export const nicknameSchema = z
	.string()
	.trim()
	.max(20, 'O apelido deve ter no máximo 20 caracteres.')
	.regex(/^[\p{L}\p{N} '-]*$/u, 'Use apenas letras, números, espaço, apóstrofo e hífen.')
	.transform((value) => value || 'Anônimo');

export const scoreSubmissionSchema = z
	.object({
		nickname: nicknameSchema.optional().default('Anônimo'),
		level: fixedLevelSchema,
		wordsCompleted: z.number().int().min(0).max(100),
		wordsTotal: z.number().int().min(1).max(100),
		correctChars: z.number().int().min(0).max(10000),
		comparedChars: z.number().int().min(0).max(10000),
		durationMs: z.number().int().min(1000).max(120000)
	})
	.refine((value) => value.wordsCompleted <= value.wordsTotal, {
		message: 'wordsCompleted não pode ser maior que wordsTotal.',
		path: ['wordsCompleted']
	})
	.refine((value) => value.correctChars <= value.comparedChars, {
		message: 'correctChars não pode ser maior que comparedChars.',
		path: ['correctChars']
	});

export const leaderboardQuerySchema = z.object({
	nivel: fixedLevelSchema.default('iniciante'),
	limite: z.coerce.number().int().min(1).max(20).default(10)
});

export const scoreEntrySchema = z.object({
	nickname: z.string(),
	level: fixedLevelSchema,
	wordsCompleted: z.number().int(),
	wordsTotal: z.number().int(),
	wpm: z.number(),
	accuracy: z.number(),
	createdAt: z.string()
});

export const leaderboardResponseSchema = z.object({
	scores: z.array(scoreEntrySchema)
});

export const submitScoreResponseSchema = z.object({
	score: scoreEntrySchema
});
