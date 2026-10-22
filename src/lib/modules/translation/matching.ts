import { normalizeWord, toChars } from '#lib/modules/game/scoring';
import type { LetterState } from '#lib/modules/game/types';

export interface TranslationHint {
	first: string;
	length: number;
}

export interface TypedFeedback {
	letters: { char: string; state: LetterState }[];
	onTrack: boolean;
}

export interface AccentMismatch {
	expected: string;
	typed: string;
}

function baseLetter(letter: string): string {
	return letter.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('pt-BR');
}

function commonPrefixLength(left: string[], right: string[]): number {
	let length = 0;
	while (length < left.length && length < right.length && left[length] === right[length]) {
		length += 1;
	}
	return length;
}

export function isAcceptedTranslation(typed: string, answers: readonly string[]): boolean {
	const normalized = normalizeWord(typed.trim());
	return normalized !== '' && answers.some((answer) => normalizeWord(answer) === normalized);
}

export function closestAnswer(typed: string, answers: readonly string[]): string {
	const accentTarget = answers.find((answer) => findAccentMismatch(typed, answer) !== null);
	if (accentTarget !== undefined) return accentTarget;

	const typedChars = toChars(normalizeWord(typed));

	return answers.reduce((best, answer) => {
		const answerLength = commonPrefixLength(typedChars, toChars(normalizeWord(answer)));
		const bestLength = commonPrefixLength(typedChars, toChars(normalizeWord(best)));
		return answerLength > bestLength ? answer : best;
	}, answers[0] ?? '');
}

export function typedFeedback(typed: string, answers: readonly string[]): TypedFeedback {
	const typedChars = toChars(typed);
	const normalizedTyped = toChars(normalizeWord(typed));
	const matched = Math.max(
		0,
		...answers.map((answer) => commonPrefixLength(normalizedTyped, toChars(normalizeWord(answer))))
	);

	return {
		letters: typedChars.map((char, index) => ({
			char,
			state: index < matched ? 'correct' : 'incorrect'
		})),
		onTrack: matched === normalizedTyped.length
	};
}

export function findAccentMismatch(typed: string, target: string): AccentMismatch | null {
	const typedChars = toChars(normalizeWord(typed));
	const targetChars = toChars(normalizeWord(target));

	if (
		typedChars.length !== targetChars.length ||
		typedChars.map(baseLetter).join('') !== targetChars.map(baseLetter).join('')
	) {
		return null;
	}

	for (let index = 0; index < targetChars.length; index += 1) {
		const typedChar = typedChars[index];
		const targetChar = targetChars[index];

		if (typedChar !== targetChar && baseLetter(typedChar) === baseLetter(targetChar)) {
			return { expected: targetChar, typed: typedChar };
		}
	}

	return null;
}

export function translationHint(answers: readonly string[]): TranslationHint {
	const canonical = toChars(normalizeWord(answers[0] ?? ''));
	return { first: canonical[0] ?? '', length: canonical.length };
}
