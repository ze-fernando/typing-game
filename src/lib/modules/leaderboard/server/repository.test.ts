import type { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';
import type { FixedLevelId, GameMode } from '#lib/modules/game/types';
import { applySqliteMigrations, createSqliteRepository, openSqliteDatabase } from './sqlite.server';
import { resolveDatabaseTarget } from './target';
import { MAX_SCORES_PER_BOARD, type LeaderboardRepository, type NewScore } from './types';

function score(overrides: Partial<NewScore> = {}): NewScore {
	return {
		nickname: 'Ana',
		mode: 'pt',
		level: 'iniciante',
		wordsCompleted: 10,
		wordsTotal: 10,
		correctChars: 50,
		comparedChars: 52,
		hintedWords: 0,
		durationMs: 30_000,
		wpm: 20,
		accuracy: 96.2,
		...overrides
	};
}

interface MemoryRepository {
	database: DatabaseSync;
	repository: LeaderboardRepository;
}

async function memoryRepository(limit?: number): Promise<MemoryRepository> {
	const database = await openSqliteDatabase(':memory:');
	return { database, repository: createSqliteRepository(database, limit) };
}

describe('repositório de ranking em SQLite', () => {
	it('converte o apelido padrão antigo em vazio na migração', async () => {
		const { database, repository } = await memoryRepository();
		await repository.insert(score({ nickname: 'Anônimo' }));
		await repository.insert(score({ nickname: 'Zion' }));
		database
			.prepare('DELETE FROM schema_migrations WHERE name = ?')
			.run('20261023120000_anonymous_nickname.sql');

		expect(applySqliteMigrations(database)).toEqual(['20261023120000_anonymous_nickname.sql']);
		const names = (await repository.listTop('pt', 'iniciante', 10)).map((entry) => entry.nickname);
		expect(names.sort()).toEqual(['', 'Zion']);
	});

	it('guarda o apelido anônimo como vazio', async () => {
		const { repository } = await memoryRepository();
		const saved = await repository.insert(score({ nickname: '' }));
		expect(saved.score.nickname).toBe('');
	});

	it('aplica as migrações uma única vez', async () => {
		const { database } = await memoryRepository();
		expect(applySqliteMigrations(database)).toEqual([]);
		const tables = database
			.prepare(
				"SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'leaderboard_scores'"
			)
			.all();
		expect(tables).toHaveLength(1);
	});

	it('insere e devolve a entrada com a posição', async () => {
		const { repository } = await memoryRepository();
		const saved = await repository.insert(score({ nickname: 'Zion', wpm: 42.5 }));

		expect(saved.rank).toBe(1);
		expect(saved.score).toMatchObject({
			nickname: 'Zion',
			mode: 'pt',
			level: 'iniciante',
			wpm: 42.5
		});
		expect(Number.isFinite(Date.parse(saved.score.createdAt))).toBe(true);
	});

	it('ordena o top 10 por wpm, precisão e data', async () => {
		const { repository } = await memoryRepository();
		await repository.insert(score({ nickname: 'lento', wpm: 10 }));
		await repository.insert(score({ nickname: 'primeiro', wpm: 30, accuracy: 90 }));
		await repository.insert(score({ nickname: 'preciso', wpm: 30, accuracy: 99 }));
		await repository.insert(score({ nickname: 'empate-depois', wpm: 30, accuracy: 90 }));
		for (let index = 0; index < 12; index += 1) {
			await repository.insert(score({ nickname: `extra${index}`, wpm: 5 }));
		}

		const top = await repository.listTop('pt', 'iniciante', 10);

		expect(top).toHaveLength(10);
		expect(top.slice(0, 4).map((entry) => entry.nickname)).toEqual([
			'preciso',
			'primeiro',
			'empate-depois',
			'lento'
		]);
	});

	it('calcula a posição considerando desempates', async () => {
		const { repository } = await memoryRepository();
		await repository.insert(score({ wpm: 50 }));
		await repository.insert(score({ wpm: 30 }));
		const tie = await repository.insert(score({ wpm: 30 }));
		const middle = await repository.insert(score({ wpm: 40 }));

		expect(tie.rank).toBe(3);
		expect(middle.rank).toBe(2);
	});

	it('isola rankings por modo e por nível', async () => {
		const { repository } = await memoryRepository();
		const boards: [GameMode, FixedLevelId][] = [
			['pt', 'iniciante'],
			['en', 'iniciante'],
			['en-pt', 'iniciante'],
			['pt', 'expert']
		];
		for (const [mode, level] of boards) {
			await repository.insert(score({ mode, level, nickname: `${mode}-${level}`, wordsTotal: 10 }));
		}

		for (const [mode, level] of boards) {
			const top = await repository.listTop(mode, level, 10);
			expect(top.map((entry) => entry.nickname)).toEqual([`${mode}-${level}`]);
		}
		expect(await repository.listTop('en', 'amador', 10)).toEqual([]);
	});

	it(`guarda no máximo ${MAX_SCORES_PER_BOARD} registros por ranking, podando os piores`, async () => {
		const { database, repository } = await memoryRepository();
		for (let index = 0; index < MAX_SCORES_PER_BOARD + 3; index += 1) {
			await repository.insert(score({ wpm: 10 + (index % 200) / 10, nickname: `p${index}` }));
		}
		await repository.insert(score({ mode: 'en', nickname: 'outro-modo' }));

		const count = (mode: GameMode): number =>
			Number(
				database
					.prepare('SELECT COUNT(*) AS total FROM leaderboard_scores WHERE mode = ?')
					.get(mode)?.total
			);

		expect(count('pt')).toBe(MAX_SCORES_PER_BOARD);
		expect(count('en')).toBe(1);

		const worst = await repository.insert(score({ wpm: 1, nickname: 'pior' }));
		expect(worst.rank).toBeNull();
		expect(count('pt')).toBe(MAX_SCORES_PER_BOARD);

		const best = await repository.insert(score({ wpm: 99, nickname: 'melhor' }));
		expect(best.rank).toBe(1);
		expect(count('pt')).toBe(MAX_SCORES_PER_BOARD);
		const names = database
			.prepare("SELECT nickname FROM leaderboard_scores WHERE mode = 'pt' AND wpm = 10")
			.all()
			.map((row) => row.nickname);
		expect(names).toEqual(['p0', 'p200']);
	});
});

describe('escolha do driver', () => {
	it('usa Neon para URLs Postgres', () => {
		expect(resolveDatabaseTarget('postgresql://u:p@host/db', false)).toEqual({
			kind: 'postgres',
			url: 'postgresql://u:p@host/db'
		});
	});

	it('usa SQLite quando configurado ou em desenvolvimento sem URL', () => {
		expect(resolveDatabaseTarget('sqlite:.data/e2e.sqlite', false)).toEqual({
			kind: 'sqlite',
			filename: '.data/e2e.sqlite'
		});
		expect(resolveDatabaseTarget(undefined, true)).toEqual({
			kind: 'sqlite',
			filename: '.data/leaderboard.sqlite'
		});
	});

	it('fica indisponível em produção sem URL ou com URL desconhecida', () => {
		expect(resolveDatabaseTarget(undefined, false)).toEqual({ kind: 'none' });
		expect(resolveDatabaseTarget('mysql://x', true)).toEqual({ kind: 'none' });
	});
});
