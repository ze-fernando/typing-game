import { describe, expect, it } from 'vitest';
import { getMessages } from './messages';
import { alternatePaths, htmlLang, localeFromPath, localizedPath } from './paths';
import { formatPercent, formatSpeed } from './format';

function shapeOf(value: unknown): unknown {
	if (typeof value === 'function') return `fn:${value.length}`;
	if (Array.isArray(value)) return value.map(shapeOf);
	if (value && typeof value === 'object') {
		return Object.fromEntries(
			Object.keys(value)
				.sort()
				.map((key) => [key, shapeOf((value as Record<string, unknown>)[key])])
		);
	}
	return typeof value;
}

function collectStrings(value: unknown): string[] {
	if (typeof value === 'string') return [value];
	if (Array.isArray(value)) return value.flatMap(collectStrings);
	if (value && typeof value === 'object') return Object.values(value).flatMap(collectStrings);
	return [];
}

describe('catálogo de mensagens', () => {
	it('tem as mesmas chaves, listas e assinaturas em pt-BR e en', () => {
		expect(shapeOf(getMessages('en'))).toEqual(shapeOf(getMessages('pt-BR')));
	});

	it('não deixa textos vazios em nenhum idioma', () => {
		for (const locale of ['pt-BR', 'en'] as const) {
			const empty = collectStrings(getMessages(locale)).filter((text) => text.trim() === '');
			expect(empty).toEqual([]);
		}
	});

	it('traduz de fato os textos principais', () => {
		expect(getMessages('en').home.heading).not.toBe(getMessages('pt-BR').home.heading);
		expect(getMessages('en').footer.copyright(2026)).toBe('© 2026 ZionCodes All rights reserved');
		expect(getMessages('pt-BR').footer.copyright(2026)).toBe(
			'© 2026 ZionCodes Todos os direitos reservados'
		);
	});
});

describe('rotas por idioma', () => {
	it('mapeia rotas e idioma do caminho', () => {
		expect(localizedPath('pt-BR', 'play')).toBe('/jogar');
		expect(localizedPath('en', 'play')).toBe('/en/play');
		expect(alternatePaths('home')).toEqual({ 'pt-BR': '/', en: '/en' });
		expect(localeFromPath('/en')).toBe('en');
		expect(localeFromPath('/en/play')).toBe('en');
		expect(localeFromPath('/entrar')).toBe('pt-BR');
		expect(localeFromPath('/jogar')).toBe('pt-BR');
		expect(htmlLang('en')).toBe('en');
		expect(htmlLang('pt-BR')).toBe('pt-BR');
	});

	it('formata números conforme o idioma', () => {
		expect(formatSpeed(42.25, 'pt-BR')).toBe('42,3');
		expect(formatSpeed(42.25, 'en')).toBe('42.3');
		expect(formatPercent(97.5, 'en')).toBe('97.5%');
		expect(formatPercent(97.5, 'pt-BR')).toBe('97,5%');
	});
});
