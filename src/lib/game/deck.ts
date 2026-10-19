import { getWordPool } from './levels';
import type { LevelConfig } from './types';

export type RandomInt = (maxExclusive: number) => number;

export function secureRandomInt(maxExclusive: number): number {
	if (maxExclusive <= 1) return 0;

	if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
		const buffer = new Uint32Array(1);
		crypto.getRandomValues(buffer);
		return buffer[0] % maxExclusive;
	}

	return Math.floor(Math.random() * maxExclusive);
}

export function shuffle<T>(items: readonly T[], randomInt: RandomInt = secureRandomInt): T[] {
	const result = [...items];

	for (let index = result.length - 1; index > 0; index -= 1) {
		const swapIndex = randomInt(index + 1);
		const current = result[index];
		result[index] = result[swapIndex];
		result[swapIndex] = current;
	}

	return result;
}

export function createDeck(level: LevelConfig, randomInt: RandomInt = secureRandomInt): string[] {
	const pool = getWordPool(level);
	const targetSize = Math.min(Math.max(level.wordCount, 1), 100);
	const result: string[] = [];

	while (result.length < targetSize) {
		const remaining = targetSize - result.length;
		const batch = shuffle(pool, randomInt).slice(0, Math.min(remaining, pool.length));
		result.push(...batch);
	}

	return result;
}
