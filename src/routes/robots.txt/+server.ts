import { PUBLIC_SITE_URL } from '$app/env/public';

export const prerender = true;

export function GET(): Response {
	const siteUrl = PUBLIC_SITE_URL.replace(/\/+$/, '');

	const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${siteUrl}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
