import type { Locale, RouteName } from './types';

export type AppPath = '/' | '/jogar' | '/en' | '/en/play';

const ROUTE_PATHS: Record<Locale, Record<RouteName, AppPath>> = {
	'pt-BR': { home: '/', play: '/jogar' },
	en: { home: '/en', play: '/en/play' }
};

export function localizedPath(locale: Locale, route: RouteName): AppPath {
	return ROUTE_PATHS[locale][route];
}

export function alternatePaths(route: RouteName): Record<Locale, AppPath> {
	return { 'pt-BR': ROUTE_PATHS['pt-BR'][route], en: ROUTE_PATHS.en[route] };
}

export function localeFromPath(pathname: string): Locale {
	return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'pt-BR';
}

export function htmlLang(locale: Locale): string {
	return locale === 'en' ? 'en' : 'pt-BR';
}

export function openGraphLocale(locale: Locale): string {
	return locale === 'en' ? 'en_US' : 'pt_BR';
}
