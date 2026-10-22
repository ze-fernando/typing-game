import { CUSTOM_LIMITS, isGameMode, resolveLevel } from './levels';
import type { GameMode, LevelConfig } from './types';

function parseBoundedInt(raw: string | null, min: number, max: number): number | undefined | null {
	if (raw === null) return undefined;

	const value = Number(raw);

	if (raw.trim() === '' || !Number.isInteger(value) || value < min || value > max) {
		return null;
	}

	return value;
}

function readParam(searchParams: URLSearchParams, official: string, alias: string): string | null {
	return searchParams.get(official) ?? searchParams.get(alias);
}

export function parseGameQuery(
	searchParams: URLSearchParams,
	defaultMode: GameMode = 'pt'
): LevelConfig | null {
	const level = readParam(searchParams, 'nivel', 'level') ?? 'iniciante';
	const rawMode = readParam(searchParams, 'modo', 'mode');

	if (rawMode !== null && !isGameMode(rawMode)) return null;

	const mode = rawMode ?? defaultMode;

	if (level === 'personalizado') {
		const words = parseBoundedInt(
			readParam(searchParams, 'palavras', 'words'),
			CUSTOM_LIMITS.minWords,
			CUSTOM_LIMITS.maxWords
		);
		const seconds = parseBoundedInt(
			readParam(searchParams, 'tempo', 'time'),
			CUSTOM_LIMITS.minSeconds,
			CUSTOM_LIMITS.maxSeconds
		);

		if (words === null || seconds === null) return null;

		return resolveLevel('personalizado', mode, words, seconds);
	}

	return resolveLevel(level, mode);
}

export function gameHref(playPath: string, level: LevelConfig, defaultMode: GameMode): string {
	const params = new URLSearchParams({ nivel: level.id });

	if (level.mode !== defaultMode) params.set('modo', level.mode);

	if (level.id === 'personalizado') {
		params.set('palavras', String(level.wordCount));
		params.set('tempo', String(level.seconds));
	}

	return `${playPath}?${params.toString()}`;
}
