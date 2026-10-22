import { browser } from '$app/env';
import { readStorage, writeStorage } from '#lib/modules/shared/storage';
import {
	parseSettings,
	serializeSettings,
	type ResolvedTheme,
	type Settings,
	type ThemeMode
} from './settings-codec';

export type { ResolvedTheme, Settings, ThemeMode } from './settings-codec';
export { parseSettings, serializeSettings } from './settings-codec';

export const SETTINGS_KEY = 'typing-game:settings:v1';
export const THEME_KEY = 'typing-game:theme';

const THEME_COLORS: Record<ResolvedTheme, string> = { light: '#fafafa', dark: '#000000' };

export const settings = $state<Settings>({
	music: true,
	effects: true,
	theme: 'system'
});

export const themeState = $state<{ resolved: ResolvedTheme }>({ resolved: 'light' });

export const settingsStatus = $state<{ hydrated: boolean }>({ hydrated: false });

let hydration: Promise<void> | null = null;
let editVersion = 0;

function systemPrefersDark(): boolean {
	return browser && matchMedia('(prefers-color-scheme: dark)').matches;
}

export function getResolvedTheme(): ResolvedTheme {
	if (settings.theme === 'light' || settings.theme === 'dark') return settings.theme;
	return systemPrefersDark() ? 'dark' : 'light';
}

export function applyTheme(): void {
	const resolved = getResolvedTheme();
	themeState.resolved = resolved;
	if (!browser) return;

	document.documentElement.dataset.theme = resolved;
	document.documentElement.style.colorScheme = resolved;
	document
		.querySelector('meta[name="theme-color"]')
		?.setAttribute('content', THEME_COLORS[resolved]);
}

function persist(): void {
	editVersion += 1;
	if (!browser) return;

	void writeStorage(SETTINGS_KEY, serializeSettings(settings));
	void writeStorage(THEME_KEY, settings.theme);
}

function watchSystemTheme(): void {
	matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		if (settings.theme === 'system') applyTheme();
	});
}

async function loadSettings(): Promise<void> {
	const versionAtStart = editVersion;
	const [raw, storedTheme] = await Promise.all([readStorage(SETTINGS_KEY), readStorage(THEME_KEY)]);

	if (editVersion === versionAtStart) Object.assign(settings, parseSettings(raw, storedTheme));

	settingsStatus.hydrated = true;
	applyTheme();
	watchSystemTheme();
}

export function hydrateSettings(): Promise<void> {
	if (!browser) return Promise.resolve();
	hydration ??= loadSettings();
	return hydration;
}

export function setMusic(enabled: boolean): void {
	settings.music = enabled;
	persist();
}

export function setEffects(enabled: boolean): void {
	settings.effects = enabled;
	persist();
}

export function setThemeMode(theme: ThemeMode): void {
	settings.theme = theme;
	persist();
	applyTheme();
}

export function toggleTheme(): void {
	setThemeMode(getResolvedTheme() === 'dark' ? 'light' : 'dark');
}

export function resetSettings(): void {
	settings.music = true;
	settings.effects = true;
	settings.theme = 'system';
	editVersion += 1;
	if (browser) {
		void writeStorage(SETTINGS_KEY, null);
		void writeStorage(THEME_KEY, null);
	}
	applyTheme();
}
