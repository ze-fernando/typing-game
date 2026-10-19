import { CUSTOM_LIMITS, getFixedLevel, resolveLevel } from './levels';
import type { LevelConfig } from './types';

/**
 * Converte um parâmetro textual em inteiro dentro da faixa.
 * Retorna `undefined` quando ausente e `null` quando inválido.
 */
function parseBoundedInt(raw: string | null, min: number, max: number): number | undefined | null {
	if (raw === null) return undefined;

	const value = Number(raw);

	if (!Number.isInteger(value) || value < min || value > max) {
		return null;
	}

	return value;
}

export function parseGameQuery(searchParams: URLSearchParams): LevelConfig | null {
	const nivel = searchParams.get('nivel') ?? 'iniciante';

	if (nivel === 'personalizado') {
		const words = parseBoundedInt(
			searchParams.get('palavras'),
			CUSTOM_LIMITS.minWords,
			CUSTOM_LIMITS.maxWords
		);
		const seconds = parseBoundedInt(
			searchParams.get('tempo'),
			CUSTOM_LIMITS.minSeconds,
			CUSTOM_LIMITS.maxSeconds
		);

		if (words === null || seconds === null) return null;

		return resolveLevel('personalizado', words, seconds);
	}

	return getFixedLevel(nivel);
}

export function gameHref(level: LevelConfig): string {
	const params = new URLSearchParams({ nivel: level.id });

	if (level.id === 'personalizado') {
		params.set('palavras', String(level.wordCount));
		params.set('tempo', String(level.seconds));
	}

	return `/jogar?${params.toString()}`;
}
