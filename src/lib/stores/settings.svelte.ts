import { browser } from '$app/env';
import { SvelteURLSearchParams } from 'svelte/reactivity';

export type ThemeMode = 'system' | 'light' | 'dark';

const SETTINGS_KEY = 'typing-game:settings:v1';
const THEME_KEY = 'typing-game:theme';

export const settings = $state({
	music: true,
	effects: true,
	theme: 'system' as ThemeMode
});

let hydrated = false;
let listeningForSystemTheme = false;

export function getResolvedTheme(): 'light' | 'dark' {
	if (settings.theme === 'light' || settings.theme === 'dark') return settings.theme;
	if (!browser) return 'light';

	return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolvedTheme(): 'light' | 'dark' {
	return getResolvedTheme();
}

export function applyTheme(): void {
	if (!browser) return;

	const resolved = resolvedTheme();
	document.documentElement.dataset.theme = resolved;
	document.documentElement.style.colorScheme = resolved;

	const meta = document.querySelector('meta[name="theme-color"]');
	meta?.setAttribute('content', resolved === 'dark' ? '#030a16' : '#f5f8fc');
}

function saveSettings(): void {
	if (!browser) return;

	const params = new SvelteURLSearchParams({
		music: settings.music ? 'on' : 'off',
		effects: settings.effects ? 'on' : 'off',
		theme: settings.theme
	});

	localStorage.setItem(SETTINGS_KEY, params.toString());
	localStorage.setItem(THEME_KEY, settings.theme);
}

export function hydrateSettings(): void {
	if (!browser || hydrated) return;
	hydrated = true;

	const raw = localStorage.getItem(SETTINGS_KEY);
	if (raw) {
		const params = new SvelteURLSearchParams(raw);
		settings.music = params.get('music') !== 'off';
		settings.effects = params.get('effects') !== 'off';
		const theme = params.get('theme');
		if (theme === 'system' || theme === 'light' || theme === 'dark') {
			settings.theme = theme;
		}
	} else {
		const storedTheme = localStorage.getItem(THEME_KEY);
		if (storedTheme === 'system' || storedTheme === 'light' || storedTheme === 'dark') {
			settings.theme = storedTheme;
		}
	}

	applyTheme();

	if (!listeningForSystemTheme) {
		listeningForSystemTheme = true;
		const media = matchMedia('(prefers-color-scheme: dark)');
		media.addEventListener('change', () => {
			if (settings.theme === 'system') applyTheme();
		});
	}
}

export function setMusic(enabled: boolean): void {
	settings.music = enabled;
	saveSettings();
}

export function setEffects(enabled: boolean): void {
	settings.effects = enabled;
	saveSettings();
}

export function setThemeMode(theme: ThemeMode): void {
	settings.theme = theme;
	saveSettings();
	applyTheme();
}

export function resetSettings(): void {
	settings.music = true;
	settings.effects = true;
	settings.theme = 'system';
	if (browser) {
		localStorage.removeItem(SETTINGS_KEY);
		localStorage.removeItem(THEME_KEY);
	}
	applyTheme();
}
