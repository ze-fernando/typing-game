import { PUBLIC_SITE_URL } from '$app/env/public';

export const prerender = true;

export function GET(): Response {
	const siteUrl = PUBLIC_SITE_URL.replace(/\/+$/, '');
	const lastmod = new Date().toISOString().slice(0, 10);
	const routes = [
		{ path: '/', priority: '1.0', changefreq: 'weekly' },
		{ path: '/jogar', priority: '0.8', changefreq: 'weekly' }
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
	.map(
		(route) => `\t<url>
\t\t<loc>${siteUrl}${route.path}</loc>
\t\t<lastmod>${lastmod}</lastmod>
\t\t<changefreq>${route.changefreq}</changefreq>
\t\t<priority>${route.priority}</priority>
\t</url>`
	)
	.join('\n')}
</urlset>
`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
