import type { FixedLevelId, GameMode, ScoreEntry, SubmittedScore } from '#lib/modules/game/types';

export interface NewScore {
	nickname: string;
	mode: GameMode;
	level: FixedLevelId;
	wordsCompleted: number;
	wordsTotal: number;
	correctChars: number;
	comparedChars: number;
	hintedWords: number;
	durationMs: number;
	wpm: number;
	accuracy: number;
}

export interface LeaderboardRepository {
	listTop: (mode: GameMode, level: FixedLevelId, limit: number) => Promise<ScoreEntry[]>;
	insert: (score: NewScore) => Promise<SubmittedScore>;
}

export interface ScoreRow {
	nickname: string;
	mode: GameMode;
	level: FixedLevelId;
	words_completed: number | string;
	words_total: number | string;
	wpm: number | string;
	accuracy: number | string;
	created_at: string | Date;
}

export interface RankRow {
	ahead: number | string;
	kept: number | boolean | string;
}

export const MAX_SCORES_PER_BOARD = 1000;

export function mapScoreRow(row: ScoreRow): ScoreEntry {
	return {
		nickname: row.nickname,
		mode: row.mode,
		level: row.level,
		wordsCompleted: Number(row.words_completed),
		wordsTotal: Number(row.words_total),
		wpm: Number(row.wpm),
		accuracy: Number(row.accuracy),
		createdAt: new Date(row.created_at).toISOString()
	};
}

export function readRank(row: RankRow | undefined): number | null {
	if (!row) return null;
	const kept = row.kept === true || row.kept === 1 || row.kept === '1' || row.kept === 't';
	return kept ? Number(row.ahead) + 1 : null;
}
