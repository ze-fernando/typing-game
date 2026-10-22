CREATE TABLE IF NOT EXISTS leaderboard_scores (
	id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	nickname VARCHAR(20) NOT NULL DEFAULT 'Anônimo',
	level VARCHAR(16) NOT NULL CHECK (level IN ('iniciante', 'amador', 'expert')),
	words_completed SMALLINT NOT NULL CHECK (words_completed >= 0),
	words_total SMALLINT NOT NULL CHECK (words_total > 0),
	correct_chars INTEGER NOT NULL CHECK (correct_chars >= 0),
	compared_chars INTEGER NOT NULL CHECK (compared_chars >= 0),
	duration_ms INTEGER NOT NULL CHECK (duration_ms > 0),
	wpm NUMERIC(6, 2) NOT NULL CHECK (wpm >= 0 AND wpm <= 300),
	accuracy NUMERIC(5, 2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
	created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leaderboard_scores_ranking_idx
	ON leaderboard_scores (level, wpm DESC, accuracy DESC, created_at ASC);
