import type { Messages } from '#lib/modules/i18n/messages';
import { htmlLang } from '#lib/modules/i18n/paths';
import type { Locale } from '#lib/modules/i18n/types';

export interface StructuredDataInput {
	locale: Locale;
	messages: Messages;
	url: string | null;
	withFaq: boolean;
}

export function buildStructuredData(input: StructuredDataInput): Record<string, unknown> {
	const language = htmlLang(input.locale);
	const application: Record<string, unknown> = {
		'@type': ['WebApplication', 'VideoGame'],
		name: input.messages.meta.siteName,
		description: input.messages.meta.appDescription,
		applicationCategory: 'GameApplication',
		genre: 'Educational',
		gamePlatform: 'Web browser',
		operatingSystem: 'Any',
		inLanguage: language,
		availableLanguage: ['pt-BR', 'en'],
		isAccessibleForFree: true,
		author: { '@type': 'Organization', name: 'ZionCodes', url: 'https://zioncodes.squareweb.app' },
		offers: { '@type': 'Offer', price: '0', priceCurrency: input.locale === 'en' ? 'USD' : 'BRL' }
	};

	if (input.url) application.url = input.url;

	const graph: Record<string, unknown>[] = [application];

	if (input.withFaq) {
		graph.push({
			'@type': 'FAQPage',
			inLanguage: language,
			mainEntity: input.messages.home.faq.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: { '@type': 'Answer', text: item.answer }
			}))
		});
	}

	return { '@context': 'https://schema.org', '@graph': graph };
}

export function serializeJsonLd(data: Record<string, unknown>): string {
	return JSON.stringify(data).replace(/</g, '\\u003c');
}
