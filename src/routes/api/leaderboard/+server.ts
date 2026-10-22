import { getLeaderboardRepository } from '#lib/modules/leaderboard/server/repository.server';
import { leaderboardQuerySchema } from '#lib/modules/leaderboard/validation';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const parsed = leaderboardQuerySchema.safeParse(Object.fromEntries(url.searchParams.entries()));

	if (!parsed.success) {
		return Response.json({ error: 'invalid_payload' }, { status: 400 });
	}

	const repository = await getLeaderboardRepository();
	const scores = repository
		? await repository
				.listTop(parsed.data.modo, parsed.data.nivel, parsed.data.limite)
				.catch(() => null)
		: null;

	if (!scores) {
		return Response.json({ error: 'unavailable' }, { status: 503 });
	}

	return Response.json({ scores }, { headers: { 'cache-control': 'no-store' } });
};
