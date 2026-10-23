import { z } from 'zod';

export const fixedLevelSchema = z.enum(['iniciante', 'amador', 'expert']);

export const gameModeSchema = z.enum(['pt', 'en', 'en-pt', 'pt-en']);

export const scoreEntrySchema = z.object({
	nickname: z.string(),
	mode: gameModeSchema,
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
	score: scoreEntrySchema,
	rank: z.number().int().min(1).nullable()
});

export const apiErrorSchema = z.object({
	error: z.enum([
		'invalid_json',
		'invalid_payload',
		'invalid_nickname',
		'rate_limited',
		'unavailable'
	]),
	message: z.string().optional()
});

export type ApiErrorCode = z.infer<typeof apiErrorSchema>['error'];
