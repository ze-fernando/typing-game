import { expect, test } from '@playwright/test';
import { E2E_SITE_URL } from '../playwright.config';

test.describe('SEO técnico', () => {
	test('sitemap lista as duas versões e robots aponta para ele', async ({ request }) => {
		const sitemap = await (await request.get('/sitemap.xml')).text();
		const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
		expect(locations).toEqual([
			`${E2E_SITE_URL}/`,
			`${E2E_SITE_URL}/en`,
			`${E2E_SITE_URL}/jogar`,
			`${E2E_SITE_URL}/en/play`
		]);
		expect(sitemap).toContain('hreflang="x-default"');

		const robots = await (await request.get('/robots.txt')).text();
		expect(robots).toContain('Disallow: /api/');
		expect(robots).toContain(`Sitemap: ${E2E_SITE_URL}/sitemap.xml`);
	});

	for (const [path, lang, ogLocale, canonical] of [
		['/', 'pt-BR', 'pt_BR', `${E2E_SITE_URL}/`],
		['/en', 'en', 'en_US', `${E2E_SITE_URL}/en`]
	] as const) {
		test(`metadados completos em ${path}`, async ({ page }) => {
			await page.goto(path);
			await expect(page.locator('html')).toHaveAttribute('lang', lang);
			await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', canonical);
			await expect(page.locator('link[hreflang="pt-BR"]')).toHaveAttribute(
				'href',
				`${E2E_SITE_URL}/`
			);
			await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
				'href',
				`${E2E_SITE_URL}/en`
			);
			await expect(page.locator('link[hreflang="x-default"]')).toHaveAttribute(
				'href',
				`${E2E_SITE_URL}/`
			);
			await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', ogLocale);
			await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
				'content',
				`${E2E_SITE_URL}/og.png`
			);
			await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
				'content',
				'summary_large_image'
			);

			const jsonLd = JSON.parse(
				(await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}'
			);
			const types = jsonLd['@graph'].map((item: { '@type': unknown }) => item['@type']);
			expect(types).toContainEqual(['WebApplication', 'VideoGame']);
			expect(types).toContain('FAQPage');
			expect(jsonLd['@graph'][0].inLanguage).toBe(lang);
		});
	}

	test('títulos e descrições são únicos por página e idioma', async ({ page }) => {
		const seen = new Set<string>();
		for (const path of ['/', '/en', '/jogar?nivel=amador', '/en/play?nivel=amador']) {
			await page.goto(path);
			const title = await page.title();
			const description = await page.locator('meta[name="description"]').getAttribute('content');
			expect(seen.has(title)).toBe(false);
			expect(seen.has(description ?? '')).toBe(false);
			seen.add(title);
			seen.add(description ?? '');
		}
	});

	test('página de jogo usa canonical sem parâmetros', async ({ page }) => {
		await page.goto('/en/play?level=amador&mode=en-pt');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`${E2E_SITE_URL}/en/play`
		);
	});
});
