import { parseGameQuery } from '#lib/modules/game/query';
import type { PageLoad } from './$types';

export const prerender = false;
export const ssr = true;

export const load: PageLoad = ({ url }) => ({ level: parseGameQuery(url.searchParams, 'en') });
