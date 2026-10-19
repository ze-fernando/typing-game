import type { FixedLevelConfig, FixedLevelId, LevelConfig, LevelId } from './types';
import { CUSTOM_POOL, WORDS } from './words';

export const FIXED_LEVELS: Record<FixedLevelId, FixedLevelConfig> = {
	iniciante: {
		id: 'iniciante',
		label: 'Iniciante',
		wordCount: 10,
		seconds: 35,
		accent: 'leve',
		description: 'Palavras curtas e acentuação leve. Ideal para pegar o ritmo.',
		ranked: true
	},
	amador: {
		id: 'amador',
		label: 'Amador',
		wordCount: 15,
		seconds: 30,
		accent: 'moderada',
		description: 'Palavras do dia a dia com acentos moderados e mais velocidade.',
		ranked: true
	},
	expert: {
		id: 'expert',
		label: 'Expert',
		wordCount: 30,
		seconds: 40,
		accent: 'complexa',
		description: 'Acentuação complexa, palavras longas e pouco tempo. Sem medo.',
		ranked: true
	}
};

export const CUSTOM_LIMITS = {
	minWords: 1,
	maxWords: 100,
	minSeconds: 5,
	maxSeconds: 120
} as const;

export function getFixedLevel(id: string): FixedLevelConfig | null {
	if (id === 'iniciante' || id === 'amador' || id === 'expert') {
		return FIXED_LEVELS[id];
	}

	return null;
}

export function createCustomLevel(words: number, seconds: number): LevelConfig | null {
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

	return {
		id: 'personalizado',
		label: 'Personalizado',
		wordCount: words,
		seconds,
		accent: 'livre',
		description: `${words} palavras em ${seconds} segundos, com acentos de todos os níveis.`,
		ranked: false
	};
}

export function resolveLevel(
	id: string,
	words?: number | null,
	seconds?: number | null
): LevelConfig | null {
	if (id === 'personalizado') {
		return createCustomLevel(words ?? 20, seconds ?? 60);
	}

	return getFixedLevel(id);
}

export function getWordPool(level: LevelConfig): readonly string[] {
	if (level.id === 'personalizado') {
		return CUSTOM_POOL;
	}

	return WORDS[level.id as FixedLevelId];
}

export function getLevelFromConfig(config: LevelConfig): LevelId {
	return config.id;
}
