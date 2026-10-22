import { neon } from '@neondatabase/serverless';
import type { FixedLevelId, GameMode, ScoreEntry, SubmittedScore } from '#lib/modules/game/types';
import {
	MAX_SCORES_PER_BOARD,
	mapScoreRow,
	readRank,
	type LeaderboardRepository,
	type NewScore,
	type RankRow,
	type ScoreRow
} from './types';

export function createPostgresRepository(
	url: string,
	maxScoresPerBoard = MAX_SCORES_PER_BOARD
): LeaderboardRepository {
	const sql = neon(url);

	async function listTop(
		mode: GameMode,
		level: FixedLevelId,
		limit: number
	): Promise<ScoreEntry[]> {
		const rows = (await sql`
			SELECT nickname, mode, level, words_completed, words_total, wpm, accuracy, created_at
			FROM leaderboard_scores
			WHERE mode = ${mode} AND level = ${level}
			ORDER BY wpm DESC, accuracy DESC, created_at ASC, id ASC
			LIMIT ${limit}
		`) as ScoreRow[];

		return rows.map(mapScoreRow);
	}

	async function insert(score: NewScore): Promise<SubmittedScore> {
		const [inserted] = (await sql`
			INSERT INTO leaderboard_scores (
				nickname, mode, level, words_completed, words_total, correct_chars,
				compared_chars, hinted_words, duration_ms, wpm, accuracy
			)
			VALUES (
				${score.nickname}, ${score.mode}, ${score.level}, ${score.wordsCompleted},
				${score.wordsTotal}, ${score.correctChars}, ${score.comparedChars},
				${score.hintedWords}, ${score.durationMs}, ${score.wpm}, ${score.accuracy}
			)
			RETURNING id, nickname, mode, level, words_completed, words_total, wpm, accuracy, created_at
		`) as (ScoreRow & { id: string })[];

		await sql`
			DELETE FROM leaderboard_scores
			WHERE mode = ${score.mode} AND level = ${score.level} AND id NOT IN (
				SELECT id FROM leaderboard_scores
				WHERE mode = ${score.mode} AND level = ${score.level}
				ORDER BY wpm DESC, accuracy DESC, created_at ASC, id ASC
				LIMIT ${maxScoresPerBoard}
			)
		`;

		const [rank] = (await sql`
			WITH target AS (SELECT * FROM leaderboard_scores WHERE id = ${inserted.id})
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
				EXISTS (SELECT 1 FROM target) AS kept
		`) as RankRow[];

		return { score: mapScoreRow(inserted), rank: readRank(rank) };
	}

	return { listTop, insert };
}
