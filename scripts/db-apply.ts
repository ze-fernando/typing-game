import { existsSync, mkdirSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

type DatabaseTarget =
	{ kind: 'postgres'; url: string } | { kind: 'sqlite'; filename: string } | { kind: 'unknown' };

type Driver = 'postgres' | 'sqlite';

interface Migration {
	name: string;
	content: string;
}

interface MigrationRow {
	name: string;
}

const root = path.resolve(import.meta.dirname, '..');
const ENV_FILES = ['.env.local', '.env'];
const DEFAULT_SQLITE_FILE = '.data/leaderboard.sqlite';

for (const file of ENV_FILES) {
	const envFile = path.join(root, file);
	if (existsSync(envFile)) process.loadEnvFile(envFile);
}

function resolveTarget(rawUrl: string | undefined): DatabaseTarget {
	const value = rawUrl?.trim() ?? '';

	if (value.startsWith('postgres://') || value.startsWith('postgresql://')) {
		return { kind: 'postgres', url: value };
	}

	if (value.startsWith('sqlite:')) {
		const filename = value.slice('sqlite:'.length).replace(/^\/\//, '');
		return { kind: 'sqlite', filename: filename || DEFAULT_SQLITE_FILE };
	}

	if (value === '') return { kind: 'sqlite', filename: DEFAULT_SQLITE_FILE };

	return { kind: 'unknown' };
}

async function listMigrations(driver: Driver): Promise<Migration[]> {
	const directory = path.join(root, 'db/migrations', driver);
	const files = (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort();

	return Promise.all(
		files.map(async (file) => ({
			name: file,
			content: await readFile(path.join(directory, file), 'utf8')
		}))
	);
}

function splitStatements(content: string): string[] {
	return content
		.split(';')
		.map((statement) => statement.trim())
		.filter((statement) => statement.length > 0);
}

async function applyPostgres(url: string): Promise<number> {
	const { neon } = await import('@neondatabase/serverless');
	const sql = neon(url);

	await sql.query(
		'CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())'
	);
	const applied = new Set(
		((await sql.query('SELECT name FROM schema_migrations')) as MigrationRow[]).map(
			(row) => row.name
		)
	);
	const pending = (await listMigrations('postgres')).filter(
		(migration) => !applied.has(migration.name)
	);

	for (const migration of pending) {
		for (const statement of splitStatements(migration.content)) {
			await sql.query(statement);
		}
		await sql.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migration.name]);
		console.info(`Aplicado (Postgres): ${migration.name}`);
	}

	return pending.length;
}

async function applySqlite(filename: string): Promise<number> {
	const { DatabaseSync } = await import('node:sqlite');
	const absolute = path.resolve(root, filename);
	mkdirSync(path.dirname(absolute), { recursive: true });

	const database = new DatabaseSync(absolute);
	database.exec(
		"CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))"
	);
	const applied = new Set(
		database
			.prepare('SELECT name FROM schema_migrations')
			.all()
			.map((row) => (row as unknown as MigrationRow).name)
	);
	const pending = (await listMigrations('sqlite')).filter(
		(migration) => !applied.has(migration.name)
	);

	for (const migration of pending) {
		database.exec(migration.content);
		database.prepare('INSERT INTO schema_migrations (name) VALUES (?)').run(migration.name);
		console.info(`Aplicado (SQLite ${filename}): ${migration.name}`);
	}

	database.close();
	return pending.length;
}

const target = resolveTarget(process.env.DATABASE_URL);

if (target.kind === 'unknown') {
	console.error('DATABASE_URL deve começar com postgresql:// (Neon) ou sqlite: (local).');
	process.exit(1);
}

const count =
	target.kind === 'postgres' ? await applyPostgres(target.url) : await applySqlite(target.filename);

console.info(`${count} migração(ões) pendente(s) aplicada(s).`);
