import { expect, test } from '@playwright/test';
import { currentPrompt, currentWord, waitForRunning } from './helpers';

const input = '[data-game-input]';

test.describe('partida', () => {
	test('joga uma partida completa e vê o resultado', async ({ page }) => {
		await page.goto('/jogar?nivel=personalizado&palavras=3&tempo=60');
		await waitForRunning(page);

		for (let index = 0; index < 3; index += 1) {
			const word = await currentWord(page);
			await page.keyboard.type(word, { delay: 20 });
			await page.keyboard.press('Enter');
		}

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'Fim de partida' })).toBeVisible();
		await expect(dialog.getByText('3/3')).toBeVisible();
		await expect(dialog.getByText('Maior combo')).toBeVisible();
		await expect(dialog.getByText('×3')).toBeVisible();
		await expect(dialog.getByText('Novo recorde pessoal')).toBeVisible();
		await expect(dialog.getByText('Primeiro recorde neste nível')).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'Jogar novamente' })).toBeFocused();
	});

	test('usa o teclado nativo do celular em telas de toque', async ({ browser }) => {
		const context = await browser.newContext({ hasTouch: true, isMobile: true });
		const page = await context.newPage();
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);

		await expect(page.locator(input)).toHaveAttribute('inputmode', 'text');
		await expect(page.getByRole('group', { name: 'Teclado virtual ABNT2' })).toHaveCount(0);
		await expect(page.getByRole('button', { name: 'Usar teclado virtual ABNT2' })).toBeVisible();
		await context.close();
	});

	test('jogo em português → inglês pede a tradução em inglês', async ({ page }) => {
		await page.goto('/en/play?nivel=iniciante&modo=pt-en');
		await waitForRunning(page);

		await expect(page.locator(input)).toHaveAttribute('placeholder', 'In English');
		await expect(page.locator(input)).toHaveAttribute('lang', 'en');
	});

	test('digita a primeira palavra e avança a contagem', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		await page.keyboard.type(await currentWord(page), { delay: 20 });
		await page.keyboard.press('Space');
		await expect(page.getByText('1/10 palavras')).toBeVisible();
	});

	test('teclado virtual insere acento pelo seletor', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		await page.locator('button[data-code="BracketLeft"]').click();
		const picker = page.getByRole('group', { name: 'Escolha o caractere acentuado' });
		await picker.getByRole('button', { name: 'á' }).click();
		await expect(page.locator(input)).toHaveValue('á');
	});

	test('erro não avança, aponta o problema e permite continuar', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		await page.keyboard.type('zzz');
		await page.keyboard.press('Enter');
		await expect(page.getByText('Ainda não.')).toBeVisible();
		await page.locator('button[data-code="KeyA"]').click();
		await expect(page.locator(input)).toHaveValue('zzza');
		await page.keyboard.press('Escape');
		await expect(page.locator(input)).toHaveValue('');
	});

	test('pausa e continua a partida', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		await page.getByRole('button', { name: 'Pausar' }).click();
		await expect(page.getByText('Pausado', { exact: true })).toBeVisible();
		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await waitForRunning(page);
	});

	test('sair no meio pede confirmação e congela o tempo', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		await page.getByRole('button', { name: 'Sair' }).click();
		await expect(page.getByRole('heading', { name: 'Sair da partida?' })).toBeVisible();
		await page.keyboard.type('abc');
		await page.getByRole('dialog').getByRole('button', { name: 'Continuar' }).click();
		await waitForRunning(page);
		await expect(page.locator(input)).toHaveValue('');
	});

	test('fecha o resultado sem perder as ações e bloqueia digitação', async ({ page }) => {
		await page.goto('/jogar?nivel=personalizado&palavras=5&tempo=5');
		await expect(page.getByRole('heading', { name: 'Fim de partida' })).toBeVisible({
			timeout: 20_000
		});
		await page.keyboard.press('Escape');
		await expect(page.getByText('Partida finalizada', { exact: true })).toBeVisible();
		await page.keyboard.type('abc');
		await expect(page.locator(input)).toHaveValue('');
		await page.getByRole('button', { name: 'Ver resultado' }).click();
		await expect(page.getByRole('heading', { name: 'Fim de partida' })).toBeVisible();
	});
});

test.describe('modo inglês → português', () => {
	test('aceita a tradução, mostra feedback e conta a dica', async ({ page }) => {
		await page.goto('/en/play?nivel=iniciante&modo=en-pt');
		await waitForRunning(page);
		await expect(page.locator('[data-game-input]')).toHaveAttribute('placeholder', 'In Portuguese');
		await expect(
			page.getByText('A hint shows the first letter and length. A hinted word scores half.', {
				exact: true
			})
		).toBeVisible();

		const prompt = await currentPrompt(page);
		expect(prompt).toMatch(/^[a-z]+$/);

		await page.getByRole('button', { name: 'Hint' }).click();
		const hint = page.getByText(/^Starts with “.+” and has \d+ letters?\.$/);
		await expect(hint).toBeVisible();
		const [, first, length] = (await hint.textContent())?.match(/“(.+)” and has (\d+)/) ?? [];
		expect(first).toBeTruthy();
		expect(Number(length)).toBeGreaterThan(0);

		await page.keyboard.type('qqqq');
		await page.keyboard.press('Enter');
		await expect(page.getByText('Not yet.')).toBeVisible();
		await expect(page.getByText('0/10 words')).toBeVisible();
	});

	test('também funciona no site em português com o alias mode', async ({ page }) => {
		await page.goto('/jogar?nivel=amador&mode=en-pt');
		await waitForRunning(page);
		await expect(page.locator('[data-game-input]')).toHaveAttribute('placeholder', 'Em português');
		await expect(page.getByRole('button', { name: 'Dica' })).toBeVisible();
	});
});

test.describe('API de ranking', () => {
	test('lista o ranking por modo e nível', async ({ request }) => {
		const response = await request.get('/api/leaderboard?modo=en-pt&nivel=expert');
		expect(response.status()).toBe(200);
		expect(Array.isArray((await response.json()).scores)).toBe(true);
	});

	test('rejeita nível personalizado e modo desconhecido', async ({ request }) => {
		const custom = await request.post('/api/scores', {
			data: {
				mode: 'pt',
				level: 'personalizado',
				wordsCompleted: 1,
				wordsTotal: 10,
				correctChars: 4,
				comparedChars: 4,
				durationMs: 30_000
			}
		});
		expect(custom.status()).toBe(400);
		expect((await custom.json()).error).toBe('invalid_payload');

		const mode = await request.get('/api/leaderboard?modo=klingon');
		expect(mode.status()).toBe(400);
	});
});
