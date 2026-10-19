import type { FixedLevelId, ScoreEntry } from '#lib/game/types';
import { getSql } from './db';

interface ScoreRow {
	nickname: string;
	level: FixedLevelId;
	words_completed: number;
	words_total: number;
	wpm: string | number;
	accuracy: string | number;
	created_at: string | Date;
}

interface InsertScore {
	nickname: string;
	level: FixedLevelId;
	wordsCompleted: number;
	wordsTotal: number;
	correctChars: number;
	comparedChars: number;
	durationMs: number;
	wpm: number;
	accuracy: number;
}

function mapRow(row: ScoreRow): ScoreEntry {
	return {
		nickname: row.nickname,
		level: row.level,
		wordsCompleted: Number(row.words_completed),
		wordsTotal: Number(row.words_total),
		wpm: Number(row.wpm),
		accuracy: Number(row.accuracy),
		createdAt: new Date(row.created_at).toISOString()
	};
}

export async function listScores(level: FixedLevelId, limit: number): Promise<ScoreEntry[] | null> {
	const sql = await getSql();
	if (!sql) return null;

	const rows = await sql<ScoreRow>`
		SELECT nickname, level, words_completed, words_total, wpm, accuracy, created_at
		FROM leaderboard_scores
		WHERE level = ${level}
		ORDER BY wpm DESC, accuracy DESC, created_at ASC
		LIMIT ${limit}
	`
		.execute()
		.catch(() => null);

	if (!rows) return null;

	return rows.map(mapRow);
}

export async function insertScore(entry: InsertScore): Promise<ScoreEntry | null> {
	const sql = await getSql();
	if (!sql) return null;

	const rows = await sql<ScoreRow>`
		INSERT INTO leaderboard_scores (
			nickname,
			level,
			words_completed,
			words_total,
			correct_chars,
			compared_chars,
			duration_ms,
			wpm,
			accuracy
		)
		VALUES (
			${entry.nickname},
			${entry.level},
			${entry.wordsCompleted},
			${entry.wordsTotal},
			${entry.correctChars},
			${entry.comparedChars},
			${entry.durationMs},
			${entry.wpm},
			${entry.accuracy}
		)
		RETURNING nickname, level, words_completed, words_total, wpm, accuracy, created_at
	`
		.execute()
		.catch(() => null);

	if (!rows || rows.length === 0) return null;

	return mapRow(rows[0]);
}
