import { expect, test } from '@playwright/test';

test.describe('partida', () => {
	test('digita a primeira palavra e avança a contagem', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');

		const currentWord = page.locator('p.sr-only').filter({ hasText: 'Palavra atual' });
		await expect(currentWord).toBeVisible({ timeout: 12_000 });

		const label = (await currentWord.textContent()) ?? '';
		const word = label.replace('Palavra atual:', '').trim();
		expect(word.length).toBeGreaterThan(0);

		await page.keyboard.type(word, { delay: 25 });
		await page.keyboard.press('Enter');

		await expect(page.getByText('1/10 palavras')).toBeVisible({ timeout: 5_000 });
	});

	test('teclado virtual insere acento pelo popover', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');

		await expect(page.locator('p.sr-only').filter({ hasText: 'Palavra atual' })).toBeVisible({
			timeout: 12_000
		});

		await page.locator('button[data-code="BracketLeft"]').click();

		const popover = page.getByRole('group', { name: 'Escolha o caractere acentuado' });
		await expect(popover).toBeVisible();

		await popover.getByRole('button', { name: 'á' }).click();

		await expect(page.locator('input[aria-label="Digite a palavra"]')).toHaveValue('á');
	});

	test('permite continuar digitando após um erro', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');

		await expect(page.locator('p.sr-only').filter({ hasText: 'Palavra atual' })).toBeVisible({
			timeout: 12_000
		});

		await page.keyboard.type('zzz');
		await page.keyboard.press('Enter');

		await page.locator('button[data-code="KeyA"]').click();

		await expect(page.locator('input[aria-label="Digite a palavra"]')).toHaveValue('zzza');
	});

	test('pausa e continua a partida', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');

		await expect(page.locator('p.sr-only').filter({ hasText: 'Palavra atual' })).toBeVisible({
			timeout: 12_000
		});

		await page.getByRole('button', { name: 'Pausar' }).click();
		await expect(page.getByText('Pausado')).toBeVisible();

		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await expect(page.getByText('Pausado')).not.toBeVisible();
	});

	test('exibe o modal de resultados ao fim do tempo', async ({ page }) => {
		await page.goto('/jogar?nivel=personalizado&palavras=5&tempo=5');

		await expect(page.getByRole('heading', { name: 'Fim de partida' })).toBeVisible({
			timeout: 20_000
		});
		await expect(page.getByRole('dialog').getByText('Velocidade')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Jogar novamente' })).toBeVisible();
	});

	test('interrompe a digitação depois do fim da partida', async ({ page }) => {
		await page.goto('/jogar?nivel=personalizado&palavras=5&tempo=5');

		await expect(page.getByRole('heading', { name: 'Fim de partida' })).toBeVisible({
			timeout: 20_000
		});

		await page.keyboard.press('Escape');
		await expect(page.getByText('Partida finalizada')).toBeVisible();

		await page.keyboard.type('abc');

		await expect(page.locator('input[aria-label="Digite a palavra"]')).toHaveValue('');
	});
});

test.describe('API de ranking', () => {
	test('responde 503 sem banco configurado ou 200 com ranking', async ({ request }) => {
		const response = await request.get('/api/leaderboard?nivel=iniciante');

		expect([200, 503]).toContain(response.status());

		const body = await response.json();
		if (response.status() === 200) {
			expect(Array.isArray(body.scores)).toBe(true);
		} else {
			expect(typeof body.error).toBe('string');
		}
	});

	test('rejeita nível personalizado no envio de score', async ({ request }) => {
		const response = await request.post('/api/scores', {
			data: {
				level: 'personalizado',
				wordsCompleted: 1,
				wordsTotal: 10,
				correctChars: 4,
				comparedChars: 4,
				durationMs: 30_000
			}
		});

		expect(response.status()).toBe(400);
	});
});
