import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { currentWord, hydrated, setTheme, waitForRunning } from './helpers';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function expectNoViolations(page: Page): Promise<void> {
	const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
	expect(
		results.violations.map((violation) => `${violation.id}: ${violation.nodes.length}`)
	).toEqual([]);
}

for (const theme of ['light', 'dark'] as const) {
	test.describe(`acessibilidade no tema ${theme}`, () => {
		test.beforeEach(async ({ page }) => {
			await setTheme(page, theme);
			await page.emulateMedia({ reducedMotion: 'reduce' });
		});

		test('home pt e en sem violações', async ({ page }) => {
			for (const path of ['/', '/en']) {
				await page.goto(path);
				await hydrated(page);
				await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
				await expectNoViolations(page);
			}
		});

		test('diálogos sem violações', async ({ page }) => {
			await page.goto('/');
			await hydrated(page);
			await page.locator('[data-level="personalizado"]').click();
			await expectNoViolations(page);
			await page.keyboard.press('Escape');
			await page.getByRole('button', { name: 'Configurações' }).click();
			await expectNoViolations(page);
		});

		test('jogo e resultado sem violações', async ({ page }) => {
			await page.goto('/jogar?nivel=personalizado&palavras=2&tempo=30');
			await waitForRunning(page);
			await expectNoViolations(page);
			for (let index = 0; index < 2; index += 1) {
				await page.keyboard.type(await currentWord(page), { delay: 30 });
				await page.keyboard.press('Enter');
			}
			await expect(page.getByRole('heading', { name: 'Fim de partida' })).toBeVisible();
			await expectNoViolations(page);
		});

		test('modo demo sem violações', async ({ page }) => {
			await page.goto('/en/play?nivel=iniciante&modo=en-pt');
			await waitForRunning(page);
			await page.getByRole('button', { name: 'Hint' }).click();
			await expectNoViolations(page);
		});
	});
}

test('contagem regressiva continua visível com movimento reduzido', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/jogar?nivel=iniciante');
	const countdown = page.locator('.animate-countdown');
	await expect(countdown).toBeVisible();
	expect(Number(await countdown.evaluate((node) => getComputedStyle(node).opacity))).toBe(1);
});
