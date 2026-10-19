import { expect, test } from '@playwright/test';

test.describe('SEO técnico', () => {
	test('robots.txt aponta para o sitemap', async ({ request }) => {
		const response = await request.get('/robots.txt');

		expect(response.status()).toBe(200);
		const body = await response.text();
		expect(body).toContain('User-agent: *');
		expect(body).toContain('Sitemap: https://typing-game.netlify.app/sitemap.xml');
	});

	test('sitemap.xml lista as rotas públicas', async ({ request }) => {
		const response = await request.get('/sitemap.xml');

		expect(response.status()).toBe(200);
		const body = await response.text();
		expect(body).toContain('<loc>https://typing-game.netlify.app/</loc>');
		expect(body).toContain('<loc>https://typing-game.netlify.app/jogar</loc>');
	});

	test('home expõe metadados sociais e descrição', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /digitando/);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			/https:\/\/typing-game\.netlify\.app\/og\.png/
		);
		await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
			'content',
			'summary_large_image'
		);
	});

	test('página de jogo tem título próprio', async ({ page }) => {
		await page.goto('/jogar?nivel=amador');

		await expect(page).toHaveTitle('Jogar — Typing Game');
	});
});
