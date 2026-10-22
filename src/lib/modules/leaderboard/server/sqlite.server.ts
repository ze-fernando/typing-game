import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import type { FixedLevelId, GameMode, ScoreEntry, SubmittedScore } from '#lib/modules/game/types';
import { BOARD_ORDER, SCORE_COLUMNS } from './queries';
import {
	MAX_SCORES_PER_BOARD,
	mapScoreRow,
	readRank,
	type LeaderboardRepository,
	type NewScore,
	type RankRow,
	type ScoreRow
} from './types';

const MIGRATIONS = import.meta.glob<string>('/db/migrations/sqlite/*.sql', {
	query: '?raw',
	import: 'default',
	eager: true
});

function migrationName(path: string): string {
	return path.split('/').pop() ?? path;
}

export function applySqliteMigrations(database: DatabaseSync): string[] {
	database.exec(
		"CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))"
	);
	const applied = new Set(
		database
			.prepare('SELECT name FROM schema_migrations')
			.all()
			.map((row) => String(row.name))
	);
	const pending = Object.keys(MIGRATIONS)
		.sort()
		.filter((path) => !applied.has(migrationName(path)));

	for (const path of pending) {
		database.exec(MIGRATIONS[path]);
		database.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(migrationName(path));
	}

	return pending.map(migrationName);
}

export async function openSqliteDatabase(filename: string): Promise<DatabaseSync> {
	const { DatabaseSync } = await import('node:sqlite');

	if (filename !== ':memory:') mkdirSync(dirname(filename), { recursive: true });

	const database = new DatabaseSync(filename);
	database.exec('PRAGMA busy_timeout = 3000');
	if (filename !== ':memory:') database.exec('PRAGMA journal_mode = WAL');
	applySqliteMigrations(database);

	return database;
}

export function createSqliteRepository(
	database: DatabaseSync,
	maxScoresPerBoard = MAX_SCORES_PER_BOARD
): LeaderboardRepository {
	const listStatement = database.prepare(
		`SELECT ${SCORE_COLUMNS} FROM leaderboard_scores WHERE mode = ? AND level = ? ORDER BY ${BOARD_ORDER} LIMIT ?`
	);
	const insertStatement = database.prepare(
		`INSERT INTO leaderboard_scores (nickname, mode, level, words_completed, words_total, correct_chars, compared_chars, hinted_words, duration_ms, wpm, accuracy)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id, ${SCORE_COLUMNS}`
	);
	const pruneStatement = database.prepare(
		`DELETE FROM leaderboard_scores WHERE mode = ? AND level = ? AND id NOT IN (
			SELECT id FROM leaderboard_scores WHERE mode = ? AND level = ? ORDER BY ${BOARD_ORDER} LIMIT ?
		)`
	);
	const rankStatement = database.prepare(
		`WITH target AS (SELECT * FROM leaderboard_scores WHERE id = ?)
		SELECT
			(SELECT COUNT(*) FROM leaderboard_scores AS other, target
				WHERE other.mode = target.mode AND other.level = target.level AND (
					other.wpm > target.wpm
					OR (other.wpm = target.wpm AND other.accuracy > target.accuracy)
					OR (other.wpm = target.wpm AND other.accuracy = target.accuracy AND (
						other.created_at < target.created_at
						OR (other.created_at = target.created_at AND other.id < target.id)
					))
				)) AS ahead,
			EXISTS (SELECT 1 FROM target) AS kept`
	);

	async function listTop(
		mode: GameMode,
		level: FixedLevelId,
		limit: number
	): Promise<ScoreEntry[]> {
		const rows = listStatement.all(mode, level, limit) as unknown as ScoreRow[];
		return rows.map(mapScoreRow);
	}

	async function insert(score: NewScore): Promise<SubmittedScore> {
		const inserted = insertStatement.get(
			score.nickname,
			score.mode,
			score.level,
			score.wordsCompleted,
			score.wordsTotal,
			score.correctChars,
			score.comparedChars,
			score.hintedWords,
			score.durationMs,
			score.wpm,
			score.accuracy
		) as unknown as ScoreRow & { id: number };

		pruneStatement.run(score.mode, score.level, score.mode, score.level, maxScoresPerBoard);
		const rank = rankStatement.get(inserted.id) as unknown as RankRow | undefined;

		return { score: mapScoreRow(inserted), rank: readRank(rank) };
	}

	return { listTop, insert };
}
