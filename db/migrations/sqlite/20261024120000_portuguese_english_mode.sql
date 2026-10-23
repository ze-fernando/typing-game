CREATE TABLE leaderboard_scores_next (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	nickname TEXT NOT NULL DEFAULT 'Anônimo' CHECK (length(nickname) <= 20),
	mode TEXT NOT NULL DEFAULT 'pt' CHECK (mode IN ('pt', 'en', 'en-pt', 'pt-en')),
	level TEXT NOT NULL CHECK (level IN ('iniciante', 'amador', 'expert')),
	words_completed INTEGER NOT NULL CHECK (words_completed >= 0),
	words_total INTEGER NOT NULL CHECK (words_total > 0),
	correct_chars INTEGER NOT NULL CHECK (correct_chars >= 0),
	compared_chars INTEGER NOT NULL CHECK (compared_chars >= 0),
	hinted_words INTEGER NOT NULL DEFAULT 0 CHECK (hinted_words >= 0 AND hinted_words <= words_completed),
	duration_ms INTEGER NOT NULL CHECK (duration_ms > 0),
	wpm REAL NOT NULL CHECK (wpm >= 0 AND wpm <= 300),
	accuracy REAL NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
	created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT INTO leaderboard_scores_next
	SELECT id, nickname, mode, level, words_completed, words_total, correct_chars, compared_chars, hinted_words, duration_ms, wpm, accuracy, created_at
	FROM leaderboard_scores;

DROP TABLE leaderboard_scores;

ALTER TABLE leaderboard_scores_next RENAME TO leaderboard_scores;

CREATE INDEX IF NOT EXISTS leaderboard_scores_board_idx
	ON leaderboard_scores (mode, level, wpm DESC, accuracy DESC, created_at ASC, id ASC);
