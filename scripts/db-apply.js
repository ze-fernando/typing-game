import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { neon } from '@neondatabase/serverless';

const root = path.resolve(import.meta.dirname, '..');
const envFile = path.join(root, '.env');

if (existsSync(envFile)) {
	process.loadEnvFile(envFile);
}

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
	console.error('Defina DATABASE_URL (veja .env.example) antes de aplicar as migrações.');
	process.exit(1);
}

const sql = neon(databaseUrl);
const migrationsDir = path.join(root, 'db/migrations');
const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

for (const file of files) {
	const content = await readFile(path.join(migrationsDir, file), 'utf8');
	const statements = content
		.split(';')
		.map((statement) => statement.trim())
		.filter((statement) => statement.length > 0);

	for (const statement of statements) {
		await sql.query(statement);
	}

	console.info(`Aplicado: ${file}`);
}

console.info(`${files.length} migração(ões) aplicada(s).`);
