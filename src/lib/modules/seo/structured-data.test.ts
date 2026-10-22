import { describe, expect, it } from 'vitest';
import { getMessages } from '#lib/modules/i18n/messages';
import { buildStructuredData, serializeJsonLd } from './structured-data';

describe('dados estruturados', () => {
	it('descreve o jogo no idioma da página', () => {
		const data = buildStructuredData({
			locale: 'en',
			messages: getMessages('en'),
			url: 'https://exemplo.dev/en',
			withFaq: true
		});
		const graph = data['@graph'] as Record<string, unknown>[];

		expect(graph[0]).toMatchObject({ inLanguage: 'en', url: 'https://exemplo.dev/en' });
		expect(graph[0]['@type']).toEqual(['WebApplication', 'VideoGame']);
		expect(graph[1]).toMatchObject({ '@type': 'FAQPage', inLanguage: 'en' });
	});

	it('omite a URL sem domínio configurado e escapa tags', () => {
		const data = buildStructuredData({
			locale: 'pt-BR',
			messages: getMessages('pt-BR'),
			url: null,
			withFaq: false
		});
		const graph = data['@graph'] as Record<string, unknown>[];

		expect(graph).toHaveLength(1);
		expect(graph[0].url).toBeUndefined();
		expect(serializeJsonLd({ text: '</script>' })).toBe('{"text":"\\u003c/script>"}');
	});
});
