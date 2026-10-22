import { describe, expect, it } from 'vitest';
import { buildSeoLinks } from './links';

describe('links de SEO', () => {
	it('usa o caminho do idioma atual como canonical e publica os dois alternates', () => {
		expect(buildSeoLinks('https://exemplo.dev', 'home', 'pt-BR')).toEqual({
			canonical: 'https://exemplo.dev/',
			alternates: [
				{ locale: 'pt-BR', href: 'https://exemplo.dev/' },
				{ locale: 'en', href: 'https://exemplo.dev/en' }
			],
			xDefault: 'https://exemplo.dev/'
		});

		expect(buildSeoLinks('https://exemplo.dev', 'play', 'en')).toEqual({
			canonical: 'https://exemplo.dev/en/play',
			alternates: [
				{ locale: 'pt-BR', href: 'https://exemplo.dev/jogar' },
				{ locale: 'en', href: 'https://exemplo.dev/en/play' }
			],
			xDefault: 'https://exemplo.dev/jogar'
		});
	});

	it('omite URLs públicas quando não há origem configurada', () => {
		expect(buildSeoLinks('', 'home', 'pt-BR')).toEqual({
			canonical: null,
			alternates: [],
			xDefault: null
		});
	});
});
