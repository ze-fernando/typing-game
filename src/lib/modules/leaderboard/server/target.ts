export type DatabaseTarget =
	{ kind: 'postgres'; url: string } | { kind: 'sqlite'; filename: string } | { kind: 'none' };

export const DEFAULT_SQLITE_FILE = '.data/leaderboard.sqlite';

export function resolveDatabaseTarget(url: string | undefined, isDev: boolean): DatabaseTarget {
	const value = url?.trim() ?? '';

	if (value.startsWith('postgres://') || value.startsWith('postgresql://')) {
		return { kind: 'postgres', url: value };
	}

	if (value.startsWith('sqlite:')) {
		const filename = value.slice('sqlite:'.length).replace(/^\/\//, '');
		return { kind: 'sqlite', filename: filename || DEFAULT_SQLITE_FILE };
	}

	if (value === '' && isDev) return { kind: 'sqlite', filename: DEFAULT_SQLITE_FILE };

	return { kind: 'none' };
}
