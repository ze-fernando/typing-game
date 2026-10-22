ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS mode VARCHAR(8) NOT NULL DEFAULT 'pt';

ALTER TABLE leaderboard_scores ADD COLUMN IF NOT EXISTS hinted_words SMALLINT NOT NULL DEFAULT 0;

ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_mode_check;

ALTER TABLE leaderboard_scores
	ADD CONSTRAINT leaderboard_scores_mode_check CHECK (mode IN ('pt', 'en', 'en-pt'));

ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_hinted_words_check;

ALTER TABLE leaderboard_scores
	ADD CONSTRAINT leaderboard_scores_hinted_words_check
	CHECK (hinted_words >= 0 AND hinted_words <= words_completed);

CREATE INDEX IF NOT EXISTS leaderboard_scores_board_idx
	ON leaderboard_scores (mode, level, wpm DESC, accuracy DESC, created_at ASC, id ASC);

DROP INDEX IF EXISTS leaderboard_scores_ranking_idx;
