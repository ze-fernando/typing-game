import { calculateAccuracy, calculateWpm } from '#lib/modules/game/scoring';
import { canSubmit } from '#lib/modules/leaderboard/server/rate-limit';
import { getLeaderboardRepository } from '#lib/modules/leaderboard/server/repository.server';
import { scoreSubmissionSchema } from '#lib/modules/leaderboard/validation';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const body = await request.json().catch(() => null);

	if (!body || typeof body !== 'object') {
		return Response.json({ error: 'invalid_json' }, { status: 400 });
	}

	const parsed = scoreSubmissionSchema.safeParse(body);

	if (!parsed.success) {
		const nicknameIssue = parsed.error.issues.some((issue) => issue.path[0] === 'nickname');
		return Response.json(
			{ error: nicknameIssue ? 'invalid_nickname' : 'invalid_payload' },
			{ status: 400 }
		);
	}

	if (!canSubmit(getClientAddress())) {
		return Response.json({ error: 'rate_limited' }, { status: 429 });
	}

	const repository = await getLeaderboardRepository();
	const data = parsed.data;
	const saved = repository
		? await repository
				.insert({
					...data,
					wpm: calculateWpm(data.correctChars, data.durationMs),
					accuracy: calculateAccuracy(data.correctChars, data.comparedChars)
				})
				.catch(() => null)
		: null;

	if (!saved) {
		return Response.json({ error: 'unavailable' }, { status: 503 });
	}

	return Response.json(saved, { status: 201 });
};
