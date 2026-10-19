import { listScores } from '#lib/server/leaderboard';
import { leaderboardQuerySchema } from '#lib/validation';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const parsed = leaderboardQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));

	if (!parsed.success) {
		return Response.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
	}

	const scores = await listScores(parsed.data.nivel, parsed.data.limite);

	if (!scores) {
		return Response.json({ error: 'Ranking indisponível.' }, { status: 503 });
	}

	return Response.json(
		{ scores },
		{
			headers: {
				'cache-control': 'public, s-maxage=30, stale-while-revalidate=300'
			}
		}
	);
};
