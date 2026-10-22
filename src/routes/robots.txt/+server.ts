import { PUBLIC_SITE_URL } from '$app/env/public';
import { buildRobots } from '#lib/modules/seo/sitemap';

export const prerender = true;

export function GET(): Response {
	return new Response(buildRobots(PUBLIC_SITE_URL.replace(/\/+$/, '')), {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
}
