import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { createSqliteRepository, openSqliteDatabase } from './sqlite.server';
import { MAX_SCORES_PER_BOARD, type NewScore } from './types';

const directory = mkdtempSync(join(tmpdir(), 'qa-prune-'));

afterAll((): void => {
	rmSync(directory, { recursive: true, force: true });
});

function buildScore(wpm: number, overrides: Partial<NewScore> = {}): NewScore {
	return {
		nickname: `qa${wpm}`,
		mode: 'pt',
		level: 'iniciante',
		wordsCompleted: 10,
		wordsTotal: 10,
		correctChars: 50,
		comparedChars: 50,
		hintedWords: 0,
		durationMs: 30_000,
		wpm,
		accuracy: 100,
		...overrides
	};
}

describe('QA: poda de 1000 registros em arquivo SQLite', () => {
	it('mantém no máximo 1000 por modo e nível sem afetar outros rankings', async () => {
		const database = await openSqliteDatabase(join(directory, 'board.sqlite'));
		const repository = createSqliteRepository(database);

		await repository.insert(buildScore(50, { mode: 'en' }));
		await repository.insert(buildScore(50, { level: 'amador', wordsTotal: 15 }));

		for (let index = 1; index <= 1050; index += 1) {
			await repository.insert(buildScore(index / 10));
		}

		const countBoard = (mode: string, level: string): number =>
			Number(
				database
					.prepare('SELECT COUNT(*) AS total FROM leaderboard_scores WHERE mode = ? AND level = ?')
					.get(mode, level)?.total
			);

		expect(countBoard('pt', 'iniciante')).toBe(MAX_SCORES_PER_BOARD);
		expect(countBoard('en', 'iniciante')).toBe(1);
		expect(countBoard('pt', 'amador')).toBe(1);

		const lowest = database
			.prepare(
				"SELECT MIN(wpm) AS lowest FROM leaderboard_scores WHERE mode = 'pt' AND level = 'iniciante'"
			)
			.get();
		expect(Number(lowest?.lowest)).toBeCloseTo(5.1);

		const outside = await repository.insert(buildScore(0.01));
		expect(outside.rank).toBeNull();
		expect(countBoard('pt', 'iniciante')).toBe(MAX_SCORES_PER_BOARD);

		const top = await repository.insert(buildScore(200));
		expect(top.rank).toBe(1);
		expect(countBoard('pt', 'iniciante')).toBe(MAX_SCORES_PER_BOARD);

		database.close();
	});
});
