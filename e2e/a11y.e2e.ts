import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('acessibilidade', () => {
	test('home sem violações nos dois temas', async ({ page }) => {
		await page.goto('/');

		const light = await new AxeBuilder({ page }).withTags(TAGS).analyze();
		expect(light.violations).toEqual([]);

		await page.getByRole('button', { name: 'Alternar tema' }).click();

		const dark = await new AxeBuilder({ page }).withTags(TAGS).analyze();
		expect(dark.violations).toEqual([]);
	});

	test('modal personalizado e configurações sem violações', async ({ page }) => {
		await page.goto('/');

		await page.getByRole('button', { name: /Personalizado/ }).click();
		const customDialog = await new AxeBuilder({ page }).withTags(TAGS).analyze();
		expect(customDialog.violations).toEqual([]);
		await page.keyboard.press('Escape');

		await page.getByRole('button', { name: 'Configurações' }).click();
		const settingsDialog = await new AxeBuilder({ page }).withTags(TAGS).analyze();
		expect(settingsDialog.violations).toEqual([]);
	});

	test('tela do jogo sem violações com movimento reduzido', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/jogar?nivel=iniciante');

		await expect(page.locator('p.sr-only').filter({ hasText: 'Palavra atual' })).toBeVisible({
			timeout: 12_000
		});

		const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
		expect(results.violations).toEqual([]);
	});

	test('resultados da partida sem violações', async ({ page }) => {
		await page.goto('/jogar?nivel=personalizado&palavras=5&tempo=5');

		await expect(page.getByRole('heading', { name: 'Fim de partida' })).toBeVisible({
			timeout: 20_000
		});

		const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
		expect(results.violations).toEqual([]);
	});
});
