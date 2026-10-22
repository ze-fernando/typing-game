import type { LetterState, WordComparison } from './types';

export interface AnswerComparison extends WordComparison {
	answer: string;
}

export function toChars(value: string): string[] {
	return Array.from(value);
}

export function normalizeWord(value: string): string {
	return value.normalize('NFC').toLocaleLowerCase('pt-BR');
}

export function compareWord(typed: string, target: string): WordComparison {
	const typedChars = toChars(normalizeWord(typed));
	const targetChars = toChars(normalizeWord(target));
	const letters: LetterState[] = targetChars.map((char, index) => {
		const typedChar = typedChars[index];

		if (typedChar === undefined) return 'pending';
		return typedChar === char ? 'correct' : 'incorrect';
	});

	const extra = typedChars.slice(targetChars.length);
	const correctChars = letters.filter((state) => state === 'correct').length;
	const comparedChars = Math.max(targetChars.length, typedChars.length);

	return {
		letters,
		extra,
		correctChars,
		comparedChars,
		isCorrect: typedChars.length === targetChars.length && correctChars === targetChars.length
	};
}

export function compareAnswers(typed: string, answers: readonly string[]): AnswerComparison {
	const comparisons = answers.map((answer) => ({ ...compareWord(typed, answer), answer }));
	const exact = comparisons.find((comparison) => comparison.isCorrect);
	if (exact) return exact;

	return comparisons.reduce((best, comparison) =>
		comparison.correctChars > best.correctChars ? comparison : best
	);
}

export function creditedChars(correctChars: number, hinted: boolean): number {
	return hinted ? Math.floor(correctChars / 2) : correctChars;
}

export function calculateWpm(correctChars: number, durationMs: number): number {
	if (correctChars <= 0 || durationMs <= 0) return 0;

	const minutes = durationMs / 60000;
	const wpm = correctChars / 5 / minutes;

	return Math.round(wpm * 10) / 10;
}

export function calculateAccuracy(correctChars: number, comparedChars: number): number {
	if (comparedChars <= 0) return 100;

	const accuracy = (correctChars / comparedChars) * 100;

	return Math.round(Math.max(0, Math.min(100, accuracy)) * 10) / 10;
}

export function formatClock(remainingMs: number): string {
	const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

	if (totalSeconds >= 60) {
		const minutes = Math.floor(totalSeconds / 60);
		const seconds = totalSeconds % 60;
		return `${minutes}:${String(seconds).padStart(2, '0')}`;
	}

	return String(totalSeconds).padStart(2, '0');
}

export function formatDuration(durationMs: number): string {
	const totalSeconds = Math.max(0, Math.round(durationMs / 1000));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;

	if (minutes === 0) return `${seconds}s`;
	return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}
