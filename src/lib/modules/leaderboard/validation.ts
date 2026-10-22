import { z } from 'zod';
import { CUSTOM_LIMITS, getFixedLevel, getLevelPool } from '#lib/modules/game/levels';
import { calculateWpm } from '#lib/modules/game/scoring';
import type { FixedLevelId, GameMode } from '#lib/modules/game/types';
import { ANONYMOUS_NICKNAME, NICKNAME_MAX_LENGTH } from './limits';
import { fixedLevelSchema, gameModeSchema } from './schemas';

export { fixedLevelSchema, gameModeSchema };

export const MAX_WPM_BY_MODE: Record<GameMode, number> = {
	pt: 250,
	en: 250,
	'en-pt': 180
};

export const MIN_MS_PER_WORD = 150;

export const customConfigSchema = z.object({
	words: z.coerce.number().int().min(CUSTOM_LIMITS.minWords).max(CUSTOM_LIMITS.maxWords),
	seconds: z.coerce.number().int().min(CUSTOM_LIMITS.minSeconds).max(CUSTOM_LIMITS.maxSeconds)
});

export const nicknameSchema = z
	.string()
	.trim()
	.max(NICKNAME_MAX_LENGTH, 'O apelido deve ter no máximo 20 caracteres.')
	.regex(/^[\p{L}\p{N} '-]*$/u, 'Use apenas letras, números, espaço, apóstrofo e hífen.');

function answerLengths(mode: GameMode, level: FixedLevelId): number[] {
	return getLevelPool(mode, level)
		.flatMap((entry) => entry.answers.map((answer) => Array.from(answer).length))
		.sort((left, right) => left - right);
}

const LENGTHS_CACHE = new Map<string, number[]>();

function cachedLengths(mode: GameMode, level: FixedLevelId): number[] {
	const key = `${mode}:${level}`;
	const cached = LENGTHS_CACHE.get(key);
	if (cached) return cached;

	const lengths = answerLengths(mode, level);
	LENGTHS_CACHE.set(key, lengths);
	return lengths;
}

export function correctCharsBounds(
	mode: GameMode,
	level: FixedLevelId,
	wordsCompleted: number,
	hintedWords: number
): { minimum: number; maximum: number } {
	const lengths = cachedLengths(mode, level);
	const shortest = lengths.slice(0, wordsCompleted);
	const halvedTail = shortest.slice(shortest.length - hintedWords);
	const minimum =
		shortest.reduce((total, length) => total + length, 0) -
		halvedTail.reduce((total, length) => total + Math.ceil(length / 2), 0);
	const maximum = lengths.slice(-wordsCompleted).reduce((total, length) => total + length, 0);

	return { minimum, maximum };
}

export const scoreSubmissionSchema = z
	.object({
		nickname: nicknameSchema.optional().default(ANONYMOUS_NICKNAME),
		mode: gameModeSchema.default('pt'),
		level: fixedLevelSchema,
		wordsCompleted: z.number().int().min(1).max(100),
		wordsTotal: z.number().int().min(1).max(100),
		correctChars: z.number().int().min(0).max(10000),
		comparedChars: z.number().int().min(0).max(10000),
		hintedWords: z.number().int().min(0).max(100).default(0),
		durationMs: z.number().int().min(1000).max(120000)
	})
	.superRefine((value, context) => {
		const level = getFixedLevel(value.level, value.mode);
		if (!level) return;

		if (value.wordsCompleted > value.wordsTotal) {
			context.addIssue({
				code: 'custom',
				message: 'wordsCompleted não pode ser maior que wordsTotal.',
				path: ['wordsCompleted']
			});
			return;
		}

		if (value.wordsTotal !== level.wordCount || value.durationMs > level.seconds * 1000 + 2000) {
			context.addIssue({ code: 'custom', message: 'Resultado incompatível com o nível.' });
		}

		if (value.hintedWords > value.wordsCompleted || (value.mode !== 'en-pt' && value.hintedWords)) {
			context.addIssue({
				code: 'custom',
				message: 'Dicas incompatíveis com o modo.',
				path: ['hintedWords']
			});
		}

		if (value.correctChars > value.comparedChars) {
			context.addIssue({
				code: 'custom',
				message: 'correctChars não pode ser maior que comparedChars.',
				path: ['correctChars']
			});
		}

		const { minimum, maximum } = correctCharsBounds(
			value.mode,
			value.level,
			value.wordsCompleted,
			Math.min(value.hintedWords, value.wordsCompleted)
		);
		if (value.correctChars < minimum || value.correctChars > maximum) {
			context.addIssue({
				code: 'custom',
				message: 'Caracteres incompatíveis com as palavras concluídas.',
				path: ['correctChars']
			});
		}

		if (value.wordsCompleted < value.wordsTotal && value.durationMs < level.seconds * 1000) {
			context.addIssue({
				code: 'custom',
				message: 'Partida incompleta antes do fim do tempo.',
				path: ['durationMs']
			});
		}

		if (value.durationMs < value.wordsCompleted * MIN_MS_PER_WORD) {
			context.addIssue({
				code: 'custom',
				message: 'Duração curta demais para as palavras concluídas.',
				path: ['durationMs']
			});
		}

		if (calculateWpm(value.correctChars, value.durationMs) > MAX_WPM_BY_MODE[value.mode]) {
			context.addIssue({
				code: 'custom',
				message: 'Velocidade implausível.',
				path: ['durationMs']
			});
		}
	});

export const leaderboardQuerySchema = z.object({
	modo: gameModeSchema.default('pt'),
	nivel: fixedLevelSchema.default('iniciante'),
	limite: z.coerce.number().int().min(1).max(20).default(10)
});
