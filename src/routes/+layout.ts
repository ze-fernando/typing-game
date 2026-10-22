import { localeFromPath } from '#lib/modules/i18n/paths';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = true;
export const trailingSlash = 'never';

export const load: LayoutLoad = ({ url }) => ({ locale: localeFromPath(url.pathname) });
