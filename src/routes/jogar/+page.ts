import { parseGameQuery } from '#lib/game/query';

export const prerender = false;
export const ssr = true;

export function load({ url }: { url: URL }) {
	return {
		level: parseGameQuery(url.searchParams)
	};
}
