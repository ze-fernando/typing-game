import { expect, test } from '@playwright/test';
import { currentWord, hydrated, waitForRunning } from './helpers';

const score = {
	nickname: 'Zion',
	mode: 'pt',
	level: 'iniciante',
	wordsCompleted: 10,
	wordsTotal: 10,
	wpm: 42.5,
	accuracy: 97.5,
	createdAt: '2026-10-19T12:00:00.000Z'
};

test.describe('ranking na home', () => {
	test('exibe as pontuações e pede o modo e nível escolhidos', async ({ page }) => {
		const requests: string[] = [];
		await page.route('**/api/leaderboard**', (route) => {
			requests.push(route.request().url());
			return route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({ scores: [score] })
			});
		});

		await page.goto('/');
		const ranking = page.locator('[data-section="ranking"]');
		await expect(ranking.getByText('Zion')).toBeVisible();
		await expect(ranking.getByText('42,5')).toBeVisible();
		await expect(ranking.getByText('97,5%')).toBeVisible();

		await ranking.getByRole('button', { name: 'EN → PT' }).click();
		await ranking.getByRole('button', { name: 'Avançado' }).click();
		await expect.poll(() => requests.at(-1)).toContain('modo=en-pt&nivel=expert');
	});

	test('mostra estado indisponível quando a API falha', async ({ page }) => {
		await page.route('**/api/leaderboard**', (route) =>
			route.fulfill({
				status: 503,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'unavailable' })
			})
		);
		await page.goto('/');
		await expect(
			page.locator('[data-section="ranking"]').getByText('Ranking indisponível agora.')
		).toBeVisible();
	});
});

test.describe('envio real ao ranking com SQLite local', () => {
	test('joga, salva com apelido e aparece no top 10 com a posição', async ({ page }) => {
		const nickname = `E2E ${Date.now().toString().slice(-6)}`;
		await page.goto('/en/play?nivel=iniciante');
		await waitForRunning(page);

		for (let index = 0; index < 10; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 70 });
			await page.keyboard.press('Enter');
		}

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'Round over' })).toBeVisible();
		await dialog.getByPlaceholder('Your nickname (optional)').fill(nickname);
		await dialog.getByRole('button', { name: 'Save to leaderboard' }).click();

		await expect(dialog.getByRole('status').filter({ hasText: 'Result saved.' })).toContainText(
			/You placed #\d+\./
		);
		await expect(
			dialog.locator('[data-leaderboard="en:iniciante"]').getByText(nickname)
		).toBeVisible();

		await page.goto('/en');
		await hydrated(page);
		const ranking = page.locator('[data-section="ranking"]');
		await expect(ranking.getByText(nickname)).toBeVisible();

		await ranking.getByRole('button', { name: 'PT', exact: true }).click();
		await expect(ranking.getByText(nickname)).toHaveCount(0);
	});

	test('a API recusa velocidade implausível', async ({ request }) => {
		const response = await request.post('/api/scores', {
			data: {
				mode: 'pt',
				level: 'iniciante',
				wordsCompleted: 10,
				wordsTotal: 10,
				correctChars: 50,
				comparedChars: 50,
				hintedWords: 0,
				durationMs: 1500
			}
		});
		expect(response.status()).toBe(400);
	});
});
