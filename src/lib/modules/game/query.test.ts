import { describe, expect, it } from 'vitest';
import { gameHref, parseGameQuery } from './query';

describe('parseGameQuery', () => {
	it('usa o iniciante e o modo padrão quando não há parâmetros', () => {
		expect(parseGameQuery(new URLSearchParams())).toMatchObject({ id: 'iniciante', mode: 'pt' });
		expect(parseGameQuery(new URLSearchParams(), 'en')).toMatchObject({ mode: 'en' });
	});

	it('lê nível e modo oficiais e os aliases em inglês', () => {
		expect(parseGameQuery(new URLSearchParams('nivel=expert&modo=en-pt'))).toMatchObject({
			id: 'expert',
			mode: 'en-pt',
			wordCount: 30
		});
		expect(parseGameQuery(new URLSearchParams('level=amador&mode=en-pt'), 'en')).toMatchObject({
			id: 'amador',
			mode: 'en-pt'
		});
	});

	it('lê o modo personalizado com palavras e tempo', () => {
		expect(
			parseGameQuery(new URLSearchParams('nivel=personalizado&palavras=42&tempo=90'))
		).toMatchObject({ id: 'personalizado', wordCount: 42, seconds: 90 });
		expect(parseGameQuery(new URLSearchParams('nivel=personalizado'))).toMatchObject({
			wordCount: 20,
			seconds: 60
		});
	});

	it('rejeita nível, modo ou valores inválidos', () => {
		expect(parseGameQuery(new URLSearchParams('nivel=impossivel'))).toBeNull();
		expect(parseGameQuery(new URLSearchParams('modo=klingon'))).toBeNull();
		expect(parseGameQuery(new URLSearchParams('nivel=personalizado&palavras=0'))).toBeNull();
		expect(parseGameQuery(new URLSearchParams('nivel=personalizado&palavras='))).toBeNull();
		expect(parseGameQuery(new URLSearchParams('nivel=personalizado&tempo=121'))).toBeNull();
	});
});

describe('gameHref', () => {
	it('omite o modo padrão e usa sempre os nomes oficiais', () => {
		const amador = parseGameQuery(new URLSearchParams('nivel=amador'));
		const demo = parseGameQuery(new URLSearchParams('level=amador&mode=en-pt'), 'en');
		expect(amador && gameHref('/jogar', amador, 'pt')).toBe('/jogar?nivel=amador');
		expect(demo && gameHref('/en/play', demo, 'en')).toBe('/en/play?nivel=amador&modo=en-pt');
	});

	it('inclui palavras e tempo no modo personalizado', () => {
		const level = parseGameQuery(new URLSearchParams('nivel=personalizado&palavras=15&tempo=45'));
		expect(level && gameHref('/jogar', level, 'pt')).toBe(
			'/jogar?nivel=personalizado&palavras=15&tempo=45'
		);
	});
});
