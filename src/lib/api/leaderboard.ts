import type { FixedLevelId, ScoreEntry, ScoreSubmission } from '#lib/game/types';

export type SubmitResult = { ok: true; score: ScoreEntry } | { ok: false; error: string };

function isFixedLevelId(value: unknown): value is FixedLevelId {
	return value === 'iniciante' || value === 'amador' || value === 'expert';
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function isScoreEntry(value: unknown): value is ScoreEntry {
	if (!value || typeof value !== 'object') return false;

	const entry = value as Record<string, unknown>;

	return (
		typeof entry.nickname === 'string' &&
		isFixedLevelId(entry.level) &&
		Number.isInteger(entry.wordsCompleted) &&
		Number.isInteger(entry.wordsTotal) &&
		isFiniteNumber(entry.wpm) &&
		isFiniteNumber(entry.accuracy) &&
		typeof entry.createdAt === 'string'
	);
}

function readScores(data: unknown): ScoreEntry[] | null {
	if (!data || typeof data !== 'object') return null;

	const scores = (data as Record<string, unknown>).scores;

	if (!Array.isArray(scores) || !scores.every(isScoreEntry)) return null;

	return scores;
}

function readScore(data: unknown): ScoreEntry | null {
	if (!data || typeof data !== 'object') return null;

	const score = (data as Record<string, unknown>).score;

	return isScoreEntry(score) ? score : null;
}

export async function fetchLeaderboard(
	level: FixedLevelId,
	limit = 10
): Promise<ScoreEntry[] | null> {
	const params = new URLSearchParams({ nivel: level, limite: String(limit) });
	const response = await fetch(`/api/leaderboard?${params.toString()}`).catch(() => null);

	if (!response?.ok) return null;

	const data = await response.json().catch(() => null);

	return readScores(data);
}

export async function submitScore(submission: ScoreSubmission): Promise<SubmitResult> {
	const response = await fetch('/api/scores', {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(submission)
	}).catch(() => null);

	if (!response) {
		return { ok: false, error: 'Sem conexão com o ranking.' };
	}

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		const message =
			data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
				? data.error
				: 'Não foi possível salvar o resultado.';
		return { ok: false, error: message };
	}

	const score = readScore(data);

	if (!score) {
		return { ok: false, error: 'Resposta inválida do ranking.' };
	}

	return { ok: true, score };
}
