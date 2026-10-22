import { getContext, setContext } from 'svelte';
import { getMessages, type Messages } from './messages';
import type { Locale } from './types';

export interface I18n {
	readonly locale: Locale;
	readonly messages: Messages;
}

const I18N_KEY = Symbol('i18n');

export function provideI18n(readLocale: () => Locale): I18n {
	const i18n: I18n = {
		get locale() {
			return readLocale();
		},
		get messages() {
			return getMessages(readLocale());
		}
	};

	setContext(I18N_KEY, i18n);
	return i18n;
}

export function useI18n(): I18n {
	return (
		getContext<I18n | undefined>(I18N_KEY) ?? {
			locale: 'pt-BR',
			messages: getMessages('pt-BR')
		}
	);
}
