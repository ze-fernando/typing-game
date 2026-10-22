import type { FixedLevelId, GameMode, ScoreEntry, ScoreSubmission } from '#lib/modules/game/types';
import {
	apiErrorSchema,
	leaderboardResponseSchema,
	submitScoreResponseSchema,
	type ApiErrorCode
} from '#lib/modules/leaderboard/schemas';

export type SubmitErrorCode = ApiErrorCode | 'network' | 'response';

export type SubmitResult =
	{ ok: true; score: ScoreEntry; rank: number | null } | { ok: false; error: SubmitErrorCode };

const TIMEOUT_MS = 10_000;

export async function fetchLeaderboard(
	mode: GameMode,
	level: FixedLevelId,
	limit = 10
): Promise<ScoreEntry[] | null> {
	const params = new URLSearchParams({ modo: mode, nivel: level, limite: String(limit) });
	const response = await fetch(`/api/leaderboard?${params.toString()}`, {
		cache: 'no-store',
		signal: AbortSignal.timeout(TIMEOUT_MS)
	}).catch(() => null);

	if (!response?.ok) return null;

	const parsed = leaderboardResponseSchema.safeParse(await response.json().catch(() => null));

	return parsed.success ? parsed.data.scores : null;
}

export async function submitScore(submission: ScoreSubmission): Promise<SubmitResult> {
	const response = await fetch('/api/scores', {
		method: 'POST',
		signal: AbortSignal.timeout(TIMEOUT_MS),
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(submission)
	}).catch(() => null);

	if (!response) return { ok: false, error: 'network' };

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const parsedError = apiErrorSchema.safeParse(data);
		if (parsedError.success) return { ok: false, error: parsedError.data.error };
		return { ok: false, error: response.status === 503 ? 'unavailable' : 'response' };
	}

	const parsed = submitScoreResponseSchema.safeParse(data);

	if (!parsed.success) return { ok: false, error: 'response' };

	return { ok: true, score: parsed.data.score, rank: parsed.data.rank };
}
