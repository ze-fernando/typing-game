ALTER TABLE leaderboard_scores ALTER COLUMN nickname SET DEFAULT '';

UPDATE leaderboard_scores SET nickname = '' WHERE nickname = 'Anônimo';
