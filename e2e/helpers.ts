import { expect, type Page } from '@playwright/test';

export async function waitForRunning(page: Page): Promise<void> {
	await expect(page.locator('[data-game-status="running"]')).toBeVisible({ timeout: 12_000 });
}

export async function currentWord(page: Page): Promise<string> {
	const label = page.locator('p.sr-only').filter({ hasText: /^(Palavra atual|Current word):/ });
	const text = (await label.textContent()) ?? '';
	return text.split(':').slice(1).join(':').trim();
}

export async function currentPrompt(page: Page): Promise<string> {
	const label = page
		.locator('p.sr-only')
		.filter({ hasText: /^(Traduza para o português|Translate into Portuguese):/ });
	const text = (await label.textContent()) ?? '';
	return text.split(':').slice(1).join(':').trim();
}

export async function setTheme(page: Page, theme: 'light' | 'dark'): Promise<void> {
	await page.addInitScript((value) => localStorage.setItem('typing-game:theme', value), theme);
}

export async function hydrated(page: Page): Promise<void> {
	await page.waitForFunction(() => document.documentElement.dataset.theme !== undefined);
	await page.waitForLoadState('networkidle');
}

export async function forceFirstEntry(page: Page, poolSize: number, index: number): Promise<void> {
	await page.addInitScript(
		({ size, target }: { size: number; target: number }): void => {
			let calls = 0;
			const original = crypto.getRandomValues.bind(crypto);
			crypto.getRandomValues = (<T extends ArrayBufferView | null>(buffer: T): T => {
				if (!(buffer instanceof Uint32Array) || buffer.length !== 1) return original(buffer);
				const position = size - 1 - (calls % (size - 1));
				calls += 1;
				buffer[0] = position === target ? 0 : position;
				return buffer;
			}) as typeof crypto.getRandomValues;
		},
		{ size: poolSize, target: index }
	);
}
