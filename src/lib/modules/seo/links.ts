import { alternatePaths } from '#lib/modules/i18n/paths';
import type { Locale, RouteName } from '#lib/modules/i18n/types';

export interface AlternateLink {
	locale: Locale;
	href: string;
}

export interface SeoLinks {
	canonical: string | null;
	alternates: AlternateLink[];
	xDefault: string | null;
}

export function buildSeoLinks(siteUrl: string, route: RouteName, locale: Locale): SeoLinks {
	if (!siteUrl) return { canonical: null, alternates: [], xDefault: null };

	const paths = alternatePaths(route);

	return {
		canonical: `${siteUrl}${paths[locale]}`,
		alternates: [
			{ locale: 'pt-BR', href: `${siteUrl}${paths['pt-BR']}` },
			{ locale: 'en', href: `${siteUrl}${paths.en}` }
		],
		xDefault: `${siteUrl}${paths['pt-BR']}`
	};
}
