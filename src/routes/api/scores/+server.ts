import { getFixedLevel } from '#lib/game/levels';
import { calculateAccuracy, calculateWpm } from '#lib/game/scoring';
import { insertScore } from '#lib/server/leaderboard';
import { canSubmit } from '#lib/server/rate-limit';
import { scoreSubmissionSchema } from '#lib/validation';
import type { RequestHandler } from './$types';

const MAX_WPM = 300;

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	const body = await request.json().catch(() => null);

	if (!body) {
		return Response.json({ error: 'JSON inválido.' }, { status: 400 });
	}

	const parsed = scoreSubmissionSchema.safeParse(body);

	if (!parsed.success) {
		return Response.json(
			{ error: 'Dados inválidos.', issues: parsed.error.issues },
			{ status: 400 }
		);
	}

	const data = parsed.data;
	const level = getFixedLevel(data.level);

	if (!level || data.wordsTotal !== level.wordCount) {
		return Response.json({ error: 'Nível ou total de palavras inválido.' }, { status: 400 });
	}

	if (data.durationMs > level.seconds * 1000 + 2000) {
		return Response.json({ error: 'Duração incompatível com o nível.' }, { status: 400 });
	}

	const wpm = calculateWpm(data.correctChars, data.durationMs);
	const accuracy = calculateAccuracy(data.correctChars, data.comparedChars);

	if (wpm > MAX_WPM) {
		return Response.json({ error: 'Velocidade implausível.' }, { status: 400 });
	}

	if (!canSubmit(getClientAddress())) {
		return Response.json({ error: 'Muitos envios em pouco tempo.' }, { status: 429 });
	}

	const score = await insertScore({
		nickname: data.nickname,
		level: data.level,
		wordsCompleted: data.wordsCompleted,
		wordsTotal: data.wordsTotal,
		correctChars: data.correctChars,
		comparedChars: data.comparedChars,
		durationMs: data.durationMs,
		wpm,
		accuracy
	});

	if (!score) {
		return Response.json({ error: 'Ranking indisponível.' }, { status: 503 });
	}

	return Response.json({ score }, { status: 201 });
};
