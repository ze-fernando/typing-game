import type { BestScore, LevelConfig } from '#lib/modules/game/types';
import { readStorage, writeStorage } from '#lib/modules/shared/storage';

const BEST_KEY = 'typing-game:best:v1';

export type BestTarget = Pick<LevelConfig, 'id' | 'mode' | 'wordCount' | 'seconds'>;

export interface SaveBestOutcome {
	saved: boolean;
	previous: BestScore | null;
}

function validBest(best: BestScore): boolean {
	return (
		Number.isFinite(best.wpm) &&
		best.wpm > 0 &&
		Number.isFinite(best.accuracy) &&
		best.accuracy >= 0 &&
		best.accuracy <= 100 &&
		Number.isInteger(best.wordsCompleted) &&
		best.wordsCompleted > 0 &&
		Number.isInteger(best.wordsTotal) &&
		best.wordsTotal >= best.wordsCompleted &&
		best.wordsTotal <= 100 &&
		Number.isFinite(Date.parse(best.savedAt))
	);
}

export function bestStorageKey(target: BestTarget): string {
	const modePart = target.mode === 'pt' ? '' : `:${target.mode}`;
	const customPart = target.id === 'personalizado' ? `:${target.wordCount}:${target.seconds}` : '';

	return `${BEST_KEY}${modePart}:${target.id}${customPart}`;
}

function parseBest(raw: string, target: BestTarget): BestScore | null {
	const parts = raw.split('|');
	if (parts.length !== 5) return null;

	const [wpm, accuracy, wordsCompleted, wordsTotal] = parts.slice(0, 4).map(Number);
	const best = { wpm, accuracy, wordsCompleted, wordsTotal, savedAt: parts[4] };

	if (!validBest(best) || best.wordsTotal !== target.wordCount) return null;
	return best;
}

function isBetter(candidate: BestScore, current: BestScore | null): boolean {
	if (!current) return true;
	if (candidate.wpm !== current.wpm) return candidate.wpm > current.wpm;
	if (candidate.accuracy !== current.accuracy) return candidate.accuracy > current.accuracy;
	return candidate.wordsCompleted > current.wordsCompleted;
}

export async function getBest(target: BestTarget): Promise<BestScore | null> {
	if (typeof window === 'undefined') return null;

	const raw = await readStorage(bestStorageKey(target));
	return raw ? parseBest(raw, target) : null;
}

export async function saveBest(target: BestTarget, best: BestScore): Promise<SaveBestOutcome> {
	if (typeof window === 'undefined' || !validBest(best) || best.wordsTotal !== target.wordCount) {
		return { saved: false, previous: null };
	}

	const previous = await getBest(target);
	if (!isBetter(best, previous)) return { saved: false, previous };

	const value = [best.wpm, best.accuracy, best.wordsCompleted, best.wordsTotal, best.savedAt].join(
		'|'
	);
	const saved = await writeStorage(bestStorageKey(target), value);

	return { saved, previous };
}
