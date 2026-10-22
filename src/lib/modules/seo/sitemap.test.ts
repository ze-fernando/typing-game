import { describe, expect, it } from 'vitest';
import { buildRobots, buildSitemap } from './sitemap';

describe('sitemap e robots', () => {
	it('lista as versões pt-BR e en com alternates', () => {
		const xml = buildSitemap('https://exemplo.dev', '2026-10-22');
		const locations = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

		expect(locations).toEqual([
			'https://exemplo.dev/',
			'https://exemplo.dev/en',
			'https://exemplo.dev/jogar',
			'https://exemplo.dev/en/play'
		]);
		expect(xml).toContain('hreflang="x-default" href="https://exemplo.dev/"');
		expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
	});

	it('não inventa domínio quando não há URL pública', () => {
		expect(buildSitemap('', '2026-10-22')).not.toContain('<url>');
		expect(buildRobots('')).not.toContain('Sitemap:');
		expect(buildRobots('https://exemplo.dev')).toContain(
			'Sitemap: https://exemplo.dev/sitemap.xml'
		);
	});
});
