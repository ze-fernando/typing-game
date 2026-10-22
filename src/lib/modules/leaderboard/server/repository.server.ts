import { dev } from '$app/env';
import { DATABASE_URL } from '$app/env/private';
import { createPostgresRepository } from './postgres.server';
import { createSqliteRepository, openSqliteDatabase } from './sqlite.server';
import { resolveDatabaseTarget } from './target';
import type { LeaderboardRepository } from './types';

let repository: Promise<LeaderboardRepository | null> | null = null;

async function createRepository(): Promise<LeaderboardRepository | null> {
	const target = resolveDatabaseTarget(DATABASE_URL, dev);

	if (target.kind === 'postgres') return createPostgresRepository(target.url);
	if (target.kind === 'sqlite')
		return createSqliteRepository(await openSqliteDatabase(target.filename));

	return null;
}

export function getLeaderboardRepository(): Promise<LeaderboardRepository | null> {
	repository ??= createRepository().catch(() => {
		repository = null;
		return null;
	});

	return repository;
}
