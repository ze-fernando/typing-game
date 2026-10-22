import type { Locale } from './types';

function decimal(value: number, locale: Locale): string {
	const fixed = value.toFixed(1);
	return locale === 'en' ? fixed : fixed.replace('.', ',');
}

export function formatSpeed(wpm: number, locale: Locale): string {
	return decimal(wpm, locale);
}

export function formatPercent(accuracy: number, locale: Locale): string {
	return `${decimal(accuracy, locale)}%`;
}
