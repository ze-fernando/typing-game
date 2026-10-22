import { expect, test, type Page } from '@playwright/test';
import { hydrated, waitForRunning } from './helpers';

async function expectNoHorizontalScroll(page: Page): Promise<void> {
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - document.documentElement.clientWidth
	);
	expect(overflow).toBeLessThanOrEqual(0);
}

for (const viewport of [
	{ width: 360, height: 740 },
	{ width: 1440, height: 900 }
]) {
	test.describe(`viewport ${viewport.width}x${viewport.height}`, () => {
		test.use({ viewport });

		test('home pt e en sem rolagem horizontal', async ({ page }) => {
			for (const path of ['/', '/en']) {
				await page.goto(path);
				await hydrated(page);
				await expectNoHorizontalScroll(page);
				await expect(page.locator('[data-level="iniciante"]')).toBeVisible();
			}
		});

		for (const path of ['/jogar?nivel=amador', '/en/play?nivel=iniciante&modo=en-pt']) {
			test(`jogo em ${path} mostra palavra, campo e teclado inteiros`, async ({ page }) => {
				await page.goto(path);
				await waitForRunning(page);
				await expectNoHorizontalScroll(page);

				const field = await page.locator('[data-game-input]').boundingBox();
				expect(field && field.y + field.height).toBeLessThanOrEqual(viewport.height);

				const keyboard = page.getByRole('toolbar');
				await expect(keyboard).toBeVisible();
				const enter = await keyboard.locator('[data-code="Enter"]').boundingBox();
				expect(enter && enter.y + enter.height).toBeLessThanOrEqual(viewport.height);
				expect(enter && enter.height).toBeGreaterThanOrEqual(40);
			});
		}
	});
}

test.describe('tablet 700 px', () => {
	test.use({ viewport: { width: 700, height: 900 } });

	test('teclado virtual não tem parada de tab invisível', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		const tabStop = page.locator('[role="toolbar"] button[data-code][tabindex="0"]');
		await expect(tabStop).toHaveCount(1);
		await expect(tabStop).toBeVisible();
	});
});

test.describe('celular em paisagem', () => {
	test.use({ viewport: { width: 740, height: 360 } });

	test('campo de digitação continua alcançável', async ({ page }) => {
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		await expectNoHorizontalScroll(page);
		await page.locator('[data-game-input]').scrollIntoViewIfNeeded();
		await expect(page.locator('[data-game-input]')).toBeInViewport();
	});
});
