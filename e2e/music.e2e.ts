import { expect, test, type Page } from '@playwright/test';
import { currentWord, waitForRunning } from './helpers';

interface AudioProbe {
	oscillators: number;
}

async function probeAudio(page: Page): Promise<void> {
	await page.addInitScript((): void => {
		const probe: AudioProbe = { oscillators: 0 };
		(window as unknown as { audioProbe: AudioProbe }).audioProbe = probe;
		const original = AudioContext.prototype.createOscillator;
		AudioContext.prototype.createOscillator = function createOscillator(
			this: AudioContext
		): OscillatorNode {
			probe.oscillators += 1;
			return original.call(this);
		};
	});
}

async function oscillatorCount(page: Page): Promise<number> {
	return page.evaluate(
		(): number => (window as unknown as { audioProbe: AudioProbe }).audioProbe.oscillators
	);
}

function collectErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	return errors;
}

async function disableEffects(page: Page): Promise<void> {
	await page.addInitScript((): void => {
		if (localStorage.getItem('typing-game:settings:v1') !== null) return;
		localStorage.setItem('typing-game:settings:v1', 'music=on&effects=off&theme=system');
	});
}

test.describe('música de fundo', () => {
	test('toca durante a partida, pausa com o jogo e com a aba oculta', async ({ page }) => {
		const errors = collectErrors(page);
		await probeAudio(page);
		await disableEffects(page);
		await page.goto('/jogar?nivel=amador');
		await waitForRunning(page);
		const main = page.locator('main[data-game-status]');
		await expect(main).toHaveAttribute('data-music', 'on');

		await page.keyboard.type((await currentWord(page)).slice(0, 1));
		const before = await oscillatorCount(page);
		await page.waitForTimeout(3000);
		const during = await oscillatorCount(page);
		expect(during).toBeGreaterThan(before);

		await page.getByRole('button', { name: 'Pausar' }).click();
		await expect(main).toHaveAttribute('data-music', 'off');
		await page.waitForTimeout(400);
		const paused = await oscillatorCount(page);
		await page.waitForTimeout(1500);
		expect(await oscillatorCount(page)).toBe(paused);

		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await expect(main).toHaveAttribute('data-music', 'on');

		await page.evaluate((): void => {
			Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
			document.dispatchEvent(new Event('visibilitychange'));
		});
		await expect(main).toHaveAttribute('data-game-status', 'paused');
		await expect(main).toHaveAttribute('data-music', 'off');

		expect(errors).toEqual([]);
	});

	test('o botão Música desliga de verdade e a escolha persiste', async ({ page }) => {
		const errors = collectErrors(page);
		await probeAudio(page);
		await disableEffects(page);
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		const main = page.locator('main[data-game-status]');
		await expect(main).toHaveAttribute('data-music', 'on');

		await page.getByRole('button', { name: 'Configurações' }).click();
		const dialog = page.getByRole('dialog');
		const musicSwitch = dialog.getByRole('switch', { name: /Música/ });
		await expect(musicSwitch).toBeChecked();
		await dialog.getByText('Música', { exact: true }).click();
		await expect(musicSwitch).not.toBeChecked();
		await page.keyboard.press('Escape');
		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await waitForRunning(page);
		await expect(main).toHaveAttribute('data-music', 'off');

		await page.keyboard.type((await currentWord(page)).slice(0, 1));
		const silent = await oscillatorCount(page);
		await page.waitForTimeout(2000);
		expect(await oscillatorCount(page)).toBe(silent);

		expect(
			await page.evaluate((): string | null => localStorage.getItem('typing-game:settings:v1'))
		).toContain('music=off');

		await page.reload();
		await waitForRunning(page);
		await expect(main).toHaveAttribute('data-music', 'off');
		expect(await oscillatorCount(page)).toBe(0);
		await page.getByRole('button', { name: 'Configurações' }).click();
		await expect(dialog.getByRole('switch', { name: /Música/ })).not.toBeChecked();
		await dialog.getByText('Música', { exact: true }).click();
		await page.keyboard.press('Escape');
		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await expect(main).toHaveAttribute('data-music', 'on');

		expect(errors).toEqual([]);
	});

	test('para no fim da partida e ao sair para o início', async ({ page }) => {
		const errors = collectErrors(page);
		await probeAudio(page);
		await disableEffects(page);
		await page.goto('/jogar?nivel=personalizado&palavras=2&tempo=30');
		await waitForRunning(page);
		const main = page.locator('main[data-game-status]');
		await expect(main).toHaveAttribute('data-music', 'on');

		for (let index = 0; index < 2; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 30 });
			await page.keyboard.press('Enter');
		}
		await expect(page.getByRole('heading', { name: 'Fim de partida' })).toBeVisible();
		await expect(main).toHaveAttribute('data-music', 'off');
		await page.waitForTimeout(400);
		const finished = await oscillatorCount(page);
		await page.waitForTimeout(1500);
		expect(await oscillatorCount(page)).toBe(finished);

		await page.getByRole('dialog').getByRole('button', { name: 'Início' }).click();
		await expect(page).toHaveURL(/\/$/);
		const home = await oscillatorCount(page);
		await page.waitForTimeout(1500);
		expect(await oscillatorCount(page)).toBe(home);

		expect(errors).toEqual([]);
	});
});
