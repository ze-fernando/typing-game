export type ThemeMode = 'system' | 'light' | 'dark';

export type ResolvedTheme = 'light' | 'dark';

export interface Settings {
	music: boolean;
	effects: boolean;
	theme: ThemeMode;
}

export function isThemeMode(value: unknown): value is ThemeMode {
	return value === 'system' || value === 'light' || value === 'dark';
}

export function serializeSettings(value: Settings): string {
	return new URLSearchParams({
		music: value.music ? 'on' : 'off',
		effects: value.effects ? 'on' : 'off',
		theme: value.theme
	}).toString();
}

export function parseSettings(raw: string | null, storedTheme: string | null): Settings {
	const params = new URLSearchParams(raw ?? '');
	const theme = params.get('theme');

	return {
		music: params.get('music') !== 'off',
		effects: params.get('effects') !== 'off',
		theme: isThemeMode(theme) ? theme : isThemeMode(storedTheme) ? storedTheme : 'system'
	};
}
