import { PUBLIC_SITE_URL } from '$app/env/public';
import { buildSitemap } from '#lib/modules/seo/sitemap';

export const prerender = true;

export function GET(): Response {
	const body = buildSitemap(
		PUBLIC_SITE_URL.replace(/\/+$/, ''),
		new Date().toISOString().slice(0, 10)
	);

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
