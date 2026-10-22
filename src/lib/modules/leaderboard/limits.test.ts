import { describe, expect, it } from 'vitest';
import { EN_MESSAGES } from '#lib/modules/i18n/messages/en';
import { PT_MESSAGES } from '#lib/modules/i18n/messages/pt';
import { displayNickname, isAnonymousNickname } from './limits';

describe('apelido anônimo', () => {
	it('reconhece vazio e o padrão antigo como anônimos', () => {
		expect(isAnonymousNickname('')).toBe(true);
		expect(isAnonymousNickname('   ')).toBe(true);
		expect(isAnonymousNickname('Anônimo')).toBe(true);
		expect(isAnonymousNickname('Zion')).toBe(false);
	});

	it('exibe o rótulo do idioma da página', () => {
		expect(displayNickname('', EN_MESSAGES.leaderboard.anonymous)).toBe('Anonymous');
		expect(displayNickname('Anônimo', EN_MESSAGES.leaderboard.anonymous)).toBe('Anonymous');
		expect(displayNickname('', PT_MESSAGES.leaderboard.anonymous)).toBe('Anônimo');
		expect(displayNickname('Zion', EN_MESSAGES.leaderboard.anonymous)).toBe('Zion');
	});
});
