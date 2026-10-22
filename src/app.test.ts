import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

const template = readFileSync(new URL('./app.html', import.meta.url), 'utf8');
const bootstrap = template.match(/<script>([\s\S]*?)<\/script>/)?.[1];

async function resolveInitialTheme(
	storage: { getItem: () => string | null },
	dark: boolean
): Promise<{ dataset: Record<string, string>; style: Record<string, string> }> {
	const root = { dataset: {} as Record<string, string>, style: {} as Record<string, string> };
	if (!bootstrap) throw new Error('Theme bootstrap not found');
	await runInNewContext(bootstrap, {
		localStorage: storage,
		matchMedia: () => ({ matches: dark }),
		document: { documentElement: root }
	});
	return root;
}

describe('initial document theme', () => {
	it('respects the saved preference before hydration', async () => {
		const root = await resolveInitialTheme({ getItem: () => 'light' }, true);
		expect(root.dataset.theme).toBe('light');
		expect(root.style.colorScheme).toBe('light');
	});

	it('uses the system preference when storage access is denied', async () => {
		const root = await resolveInitialTheme(
			{
				getItem: () => {
					throw new Error('Storage access denied');
				}
			},
			true
		);
		expect(root.dataset.theme).toBe('dark');
		expect(root.style.colorScheme).toBe('dark');
	});

	it('falls back to the system for absent or unrecognized preferences', async () => {
		for (const preference of [null, 'system', 'invalid']) {
			const root = await resolveInitialTheme({ getItem: () => preference }, false);
			expect(root.dataset.theme).toBe('light');
		}
	});
});
