export type FixedLevelId = 'iniciante' | 'amador' | 'expert';
export type LevelId = FixedLevelId | 'personalizado';

export type GameMode = 'pt' | 'en' | 'en-pt' | 'pt-en';

export type TranslationMode = Extract<GameMode, 'en-pt' | 'pt-en'>;

export type GameStatus = 'idle' | 'countdown' | 'running' | 'paused' | 'finished';

export type LetterState = 'correct' | 'incorrect' | 'pending';

export type AccentLevel = 'leve' | 'moderada' | 'complexa' | 'livre';

export interface LevelConfig {
	id: LevelId;
	mode: GameMode;
	wordCount: number;
	seconds: number;
	accent: AccentLevel;
	ranked: boolean;
}

export interface FixedLevelConfig extends LevelConfig {
	id: FixedLevelId;
}

export interface DeckEntry {
	prompt: string;
	answers: readonly string[];
}

export interface WordComparison {
	letters: LetterState[];
	extra: string[];
	correctChars: number;
	comparedChars: number;
	isCorrect: boolean;
}

export interface GameResult {
	mode: GameMode;
	level: LevelId;
	wordsCompleted: number;
	wordsTotal: number;
	correctChars: number;
	comparedChars: number;
	attempts: number;
	errors: number;
	hintedWords: number;
	bestCombo: number;
	durationMs: number;
	wpm: number;
	accuracy: number;
}

export interface ScoreEntry {
	nickname: string;
	mode: GameMode;
	level: FixedLevelId;
	wordsCompleted: number;
	wordsTotal: number;
	wpm: number;
	accuracy: number;
	createdAt: string;
}

export interface ScoreSubmission {
	nickname?: string;
	mode: GameMode;
	level: FixedLevelId;
	wordsCompleted: number;
	wordsTotal: number;
	correctChars: number;
	comparedChars: number;
	hintedWords: number;
	durationMs: number;
}

export interface SubmittedScore {
	score: ScoreEntry;
	rank: number | null;
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
