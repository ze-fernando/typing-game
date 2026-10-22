import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('$app/env', () => ({ browser: true, dev: false }));

const values = new Map<string, string>();
let releaseRead: () => void = () => undefined;

beforeEach(() => {
	values.clear();
	vi.resetModules();
	const gate = new Promise<void>((resolve) => {
		releaseRead = resolve;
	});
	vi.stubGlobal('window', {
		localStorage: {
			getItem: (key: string) => values.get(key) ?? null,
			setItem: (key: string, value: string) => values.set(key, value),
			removeItem: (key: string) => values.delete(key)
		}
	});
	vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => undefined }));
	vi.stubGlobal('document', {
		documentElement: { dataset: {}, style: {} },
		querySelector: () => null
	});
	vi.doMock('#lib/modules/shared/storage', () => ({
		readStorage: (key: string) => gate.then(() => values.get(key) ?? null),
		writeStorage: (key: string, value: string | null) => {
			if (value === null) values.delete(key);
			else values.set(key, value);
			return Promise.resolve(true);
		}
	}));
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.doUnmock('#lib/modules/shared/storage');
});

describe('preferências', () => {
	it('lê e serializa as preferências salvas', async () => {
		const { parseSettings, serializeSettings } = await import('./settings.svelte');
		const parsed = parseSettings('music=off&effects=on&theme=dark', null);
		expect(parsed).toEqual({ music: false, effects: true, theme: 'dark' });
		expect(parseSettings(serializeSettings(parsed), null)).toEqual(parsed);
		expect(parseSettings(null, 'light').theme).toBe('light');
		expect(parseSettings('theme=roxo', null).theme).toBe('system');
	});

	it('hidratação atrasada não sobrescreve uma escolha feita antes dela terminar', async () => {
		values.set('typing-game:settings:v1', 'music=on&effects=on&theme=light');
		const store = await import('./settings.svelte');

		const hydration = store.hydrateSettings();
		store.setThemeMode('dark');
		store.setMusic(false);
		releaseRead();
		await hydration;

		expect(store.settings.theme).toBe('dark');
		expect(store.settings.music).toBe(false);
		expect(values.get('typing-game:settings:v1')).toContain('theme=dark');
	});

	it('aplica as preferências salvas quando o usuário não mexeu', async () => {
		values.set('typing-game:settings:v1', 'music=off&effects=off&theme=dark');
		const store = await import('./settings.svelte');

		const hydration = store.hydrateSettings();
		releaseRead();
		await hydration;

		expect(store.settings).toEqual({ music: false, effects: false, theme: 'dark' });
		expect(store.themeState.resolved).toBe('dark');
	});
});
