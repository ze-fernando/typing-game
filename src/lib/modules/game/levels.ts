import type { Locale } from '#lib/modules/i18n/types';
import { REVERSE_TRANSLATION_BANK, TRANSLATION_BANK } from '#lib/modules/translation/bank';
import { EN_WORDS } from '#lib/modules/words/en';
import { PT_WORDS } from '#lib/modules/words/pt';
import type {
	AccentLevel,
	DeckEntry,
	FixedLevelConfig,
	FixedLevelId,
	GameMode,
	LevelConfig,
	LevelId,
	TranslationMode
} from './types';

export const FIXED_LEVEL_IDS: readonly FixedLevelId[] = ['iniciante', 'amador', 'expert'];

export const GAME_MODES: readonly GameMode[] = ['pt', 'en', 'en-pt', 'pt-en'];

const FIXED_LEVEL_SETTINGS: Record<
	FixedLevelId,
	{ wordCount: number; seconds: number; accent: AccentLevel }
> = {
	iniciante: { wordCount: 10, seconds: 35, accent: 'leve' },
	amador: { wordCount: 15, seconds: 30, accent: 'moderada' },
	expert: { wordCount: 30, seconds: 40, accent: 'complexa' }
};

export const CUSTOM_LIMITS = {
	minWords: 1,
	maxWords: 100,
	minSeconds: 5,
	maxSeconds: 120
} as const;

export const CUSTOM_DEFAULTS = { words: 20, seconds: 60 } as const;

export function isGameMode(value: unknown): value is GameMode {
	return value === 'pt' || value === 'en' || isTranslationMode(value);
}

export function isTranslationMode(value: unknown): value is TranslationMode {
	return value === 'en-pt' || value === 'pt-en';
}

export function translationModeFor(locale: Locale): TranslationMode {
	return locale === 'en' ? 'pt-en' : 'en-pt';
}

export function answerLanguage(mode: GameMode): 'en' | 'pt-BR' {
	return mode === 'en' || mode === 'pt-en' ? 'en' : 'pt-BR';
}

export function promptLanguage(mode: GameMode): 'en' | 'pt-BR' {
	return mode === 'en' || mode === 'en-pt' ? 'en' : 'pt-BR';
}

export function isFixedLevelId(value: unknown): value is FixedLevelId {
	return value === 'iniciante' || value === 'amador' || value === 'expert';
}

export function getFixedLevel(id: string, mode: GameMode = 'pt'): FixedLevelConfig | null {
	if (!isFixedLevelId(id)) return null;

	return { id, mode, ranked: true, ...FIXED_LEVEL_SETTINGS[id] };
}

export function createCustomLevel(
	words: number,
	seconds: number,
	mode: GameMode = 'pt'
): LevelConfig | null {
	if (
		!Number.isInteger(words) ||
		!Number.isInteger(seconds) ||
		words < CUSTOM_LIMITS.minWords ||
		words > CUSTOM_LIMITS.maxWords ||
		seconds < CUSTOM_LIMITS.minSeconds ||
		seconds > CUSTOM_LIMITS.maxSeconds
	) {
		return null;
	}

	return { id: 'personalizado', mode, wordCount: words, seconds, accent: 'livre', ranked: false };
}

export function resolveLevel(
	id: string,
	mode: GameMode = 'pt',
	words?: number | null,
	seconds?: number | null
): LevelConfig | null {
	if (id === 'personalizado') {
		return createCustomLevel(
			words ?? CUSTOM_DEFAULTS.words,
			seconds ?? CUSTOM_DEFAULTS.seconds,
			mode
		);
	}

	return getFixedLevel(id, mode);
}

function typingEntries(words: readonly string[]): DeckEntry[] {
	return words.map((word) => ({ prompt: word, answers: [word] }));
}

export function getLevelPool(mode: GameMode, level: FixedLevelId): readonly DeckEntry[] {
	if (mode === 'en-pt') return TRANSLATION_BANK[level];
	if (mode === 'pt-en') return REVERSE_TRANSLATION_BANK[level];
	if (mode === 'en') return typingEntries(EN_WORDS[level]);
	return typingEntries(PT_WORDS[level]);
}

export function getDeckPool(level: LevelConfig): readonly DeckEntry[] {
	if (level.id === 'personalizado') {
		return FIXED_LEVEL_IDS.flatMap((id) => getLevelPool(level.mode, id));
	}

	return getLevelPool(level.mode, level.id);
}

export function levelKey(level: Pick<LevelConfig, 'id' | 'mode'>): `${GameMode}:${LevelId}` {
	return `${level.mode}:${level.id}`;
}
