import { expect, test } from '@playwright/test';

const score = {
	nickname: 'Zion',
	level: 'iniciante',
	wordsCompleted: 10,
	wordsTotal: 10,
	wpm: 42.5,
	accuracy: 97.5,
	createdAt: '2026-10-19T12:00:00.000Z'
};

test.describe('ranking na home', () => {
	test('exibe as pontuações quando a API responde', async ({ page }) => {
		await page.route('**/api/leaderboard**', (route) =>
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ scores: [score] })
			})
		);

		await page.goto('/');

		const ranking = page.locator('#ranking');
		await expect(ranking.getByText('Zion')).toBeVisible();
		await expect(ranking.getByText('42,5 ppm')).toBeVisible();
		await expect(ranking.getByText('97,5%')).toBeVisible();
	});

	test('mostra fallback quando a API falha', async ({ page }) => {
		await page.route('**/api/leaderboard**', (route) =>
			route.fulfill({
				status: 503,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Ranking indisponível.' })
			})
		);

		await page.goto('/');

		await expect(page.locator('#ranking').getByText('Ranking indisponível')).toBeVisible();
	});
});
