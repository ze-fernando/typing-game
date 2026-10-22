export const NICKNAME_MAX_LENGTH = 20;

export const ANONYMOUS_NICKNAME = '';

export const LEGACY_ANONYMOUS_NICKNAME = 'Anônimo';

export function isAnonymousNickname(nickname: string): boolean {
	const value = nickname.trim();
	return value === ANONYMOUS_NICKNAME || value === LEGACY_ANONYMOUS_NICKNAME;
}

export function displayNickname(nickname: string, anonymousLabel: string): string {
	return isAnonymousNickname(nickname) ? anonymousLabel : nickname;
}
