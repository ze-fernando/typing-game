ALTER TABLE leaderboard_scores DROP CONSTRAINT IF EXISTS leaderboard_scores_mode_check;

ALTER TABLE leaderboard_scores
	ADD CONSTRAINT leaderboard_scores_mode_check CHECK (mode IN ('pt', 'en', 'en-pt', 'pt-en'));
