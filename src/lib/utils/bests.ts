import type { BestScore } from '#lib/game/types';

const BEST_KEY = 'typing-game:best:v1';

function storageKey(level: string): string {
	return `${BEST_KEY}:${level}`;
}

export function getBest(level: string): BestScore | null {
	if (typeof window === 'undefined') return null;

	const raw = localStorage.getItem(storageKey(level));
	if (!raw) return null;

	const [wpmRaw, accuracyRaw, wordsCompletedRaw, wordsTotalRaw, savedAt] = raw.split('|');
	const wpm = Number(wpmRaw);
	const accuracy = Number(accuracyRaw);
	const wordsCompleted = Number(wordsCompletedRaw);
	const wordsTotal = Number(wordsTotalRaw);

	if (
		!Number.isFinite(wpm) ||
		!Number.isFinite(accuracy) ||
		!Number.isFinite(wordsCompleted) ||
		!Number.isFinite(wordsTotal) ||
		!savedAt
	) {
		return null;
	}

	return { wpm, accuracy, wordsCompleted, wordsTotal, savedAt };
}

export function saveBest(level: string, best: BestScore): boolean {
	if (typeof window === 'undefined') return false;

	const current = getBest(level);
	const isBetter =
		!current ||
		best.wpm > current.wpm ||
		(best.wpm === current.wpm && best.accuracy > current.accuracy) ||
		(best.wpm === current.wpm &&
			best.accuracy === current.accuracy &&
			best.wordsCompleted > current.wordsCompleted);

	if (!isBetter) return false;

	const value = [best.wpm, best.accuracy, best.wordsCompleted, best.wordsTotal, best.savedAt].join(
		'|'
	);

	localStorage.setItem(storageKey(level), value);

	return true;
}
