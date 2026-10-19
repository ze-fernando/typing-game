import type { DatabaseConnection } from '@netlify/database';

export type Sql = DatabaseConnection['sql'];

/**
 * O módulo @netlify/database só está disponível no runtime da Netlify.
 * O import dinâmico + catch mantém o jogo funcional sem banco configurado.
 */
export async function getSql(): Promise<Sql | null> {
	return import('@netlify/database').then(({ getDatabase }) => getDatabase().sql).catch(() => null);
}
