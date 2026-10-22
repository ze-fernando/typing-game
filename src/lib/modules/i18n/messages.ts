import { EN_MESSAGES } from './messages/en';
import { PT_MESSAGES, type Messages } from './messages/pt';
import type { Locale } from './types';

export type { Messages };

const CATALOG: Record<Locale, Messages> = {
	'pt-BR': PT_MESSAGES,
	en: EN_MESSAGES
};

export function getMessages(locale: Locale): Messages {
	return CATALOG[locale];
}
