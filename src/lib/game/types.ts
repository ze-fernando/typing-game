export type FixedLevelId = 'iniciante' | 'amador' | 'expert';
export type LevelId = FixedLevelId | 'personalizado';

export type GameStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'finished';

export type LetterState = 'correct' | 'incorrect' | 'pending';

export type AccentLevel = 'leve' | 'moderada' | 'complexa' | 'livre';

export interface LevelConfig {
	id: LevelId;
	label: string;
	wordCount: number;
	seconds: number;
	accent: AccentLevel;
	description: string;
	ranked: boolean;
}

export interface FixedLevelConfig extends LevelConfig {
	id: FixedLevelId;
}

export interface WordComparison {
	letters: LetterState[];
	extra: string[];
	correctChars: number;
	comparedChars: number;
	isCorrect: boolean;
}

export interface GameResult {
	level: LevelId;
	wordsCompleted: number;
	wordsTotal: number;
	correctChars: number;
	comparedChars: number;
	attempts: number;
	errors: number;
	durationMs: number;
	wpm: number;
	accuracy: number;
}

export interface ScoreEntry {
	nickname: string;
	level: FixedLevelId;
	wordsCompleted: number;
	wordsTotal: number;
	wpm: number;
	accuracy: number;
	createdAt: string;
}

export interface ScoreSubmission {
	nickname?: string;
	level: FixedLevelId;
	wordsCompleted: number;
	wordsTotal: number;
	correctChars: number;
	comparedChars: number;
	durationMs: number;
}

export interface BestScore {
	wpm: number;
	accuracy: number;
	wordsCompleted: number;
	wordsTotal: number;
	savedAt: string;
}

export interface KeyboardKey {
	code: string;
	label: string;
	secondary?: string;
	width?: number;
	kind?:
		| 'letter'
		| 'number'
		| 'symbol'
		| 'modifier'
		| 'space'
		| 'enter'
		| 'backspace'
		| 'tab'
		| 'caps'
		| 'shift'
		| 'accent'
		| 'function';
	input?: string;
	ariaLabel?: string;
	mobileHidden?: boolean;
}

export interface KeyboardRow {
	id: string;
	keys: KeyboardKey[];
	mobileHidden?: boolean;
}
