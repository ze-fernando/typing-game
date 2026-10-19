import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$app/env/private';

/**
 * Executa SQL parametrizado (tagged template) e devolve as linhas tipadas.
 */
export type Sql = <Row>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<Row[]>;

/**
 * Conexão Postgres (Neon) via DATABASE_URL.
 * Sem a variável definida, o ranking responde 503 e o jogo segue funcionando
 * com recordes locais.
 */
export function getSql(): Sql | null {
	if (!DATABASE_URL) return null;

	const client = neon(DATABASE_URL);

	return <Row>(strings: TemplateStringsArray, ...values: unknown[]) =>
		client(strings, ...values) as Promise<Row[]>;
}
