import { alternatePaths } from '#lib/modules/i18n/paths';
import { LOCALES, type RouteName } from '#lib/modules/i18n/types';

interface SitemapRoute {
	route: RouteName;
	priority: string;
}

const ROUTES: SitemapRoute[] = [
	{ route: 'home', priority: '1.0' },
	{ route: 'play', priority: '0.8' }
];

export function buildSitemap(siteUrl: string, lastmod: string): string {
	const entries = siteUrl
		? ROUTES.flatMap(({ route, priority }) => {
				const paths = alternatePaths(route);
				const links = [
					...LOCALES.map(
						(locale) =>
							`\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${siteUrl}${paths[locale]}" />`
					),
					`\t\t<xhtml:link rel="alternate" hreflang="x-default" href="${siteUrl}${paths['pt-BR']}" />`
				].join('\n');

				return LOCALES.map(
					(locale) => `\t<url>
\t\t<loc>${siteUrl}${paths[locale]}</loc>
${links}
\t\t<lastmod>${lastmod}</lastmod>
\t\t<changefreq>weekly</changefreq>
\t\t<priority>${priority}</priority>
\t</url>`
				);
			})
		: [];

	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
}

export function buildRobots(siteUrl: string): string {
	return `User-agent: *
Allow: /
Disallow: /api/
${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`;
}
