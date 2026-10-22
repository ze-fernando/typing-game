import type { Handle } from '@sveltejs/kit/hooks';
import { htmlLang, localeFromPath } from '#lib/modules/i18n/paths';

export const handle: Handle = ({ event, resolve }) => {
	const lang = htmlLang(localeFromPath(event.url.pathname));

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
