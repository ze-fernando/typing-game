import { expect, test } from '@playwright/test';
import { hydrated } from './helpers';

test.describe('home em português', () => {
	test('carrega em pt-BR com título, hero e menu de níveis', async ({ page }) => {
		await page.goto('/');

		await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
		await expect(page).toHaveTitle(/Typing Game/);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'Digite em português. Com acento.'
		);
		await expect(page.locator('[data-level="iniciante"]')).toContainText('10 palavras');
		await expect(page.locator('[data-level="iniciante"]')).toContainText('35s');
		await expect(page.locator('[data-level="expert"]')).toContainText('Avançado');
	});

	test('inicia o nível direto pelo menu', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		await page.locator('[data-level="amador"]').click();
		await expect(page).toHaveURL(/\/jogar\?nivel=amador$/);
	});

	test('troca para o modo inglês → português', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		await page.getByRole('button', { name: 'Traduzir do inglês' }).click();
		await expect(page.getByText('Aparece uma palavra em inglês; digite')).toBeVisible();
		await page.locator('[data-level="iniciante"]').click();
		await expect(page).toHaveURL(/\/jogar\?nivel=iniciante&modo=en-pt$/);
	});

	test('atalhos 1–4 iniciam os níveis e o personalizado', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		await page.keyboard.press('3');
		await expect(page).toHaveURL(/\/jogar\?nivel=expert$/);

		await page.goto('/');
		await hydrated(page);
		await page.keyboard.press('4');
		await expect(page.getByRole('heading', { name: 'Modo personalizado' })).toBeVisible();
	});

	test('atalhos não disparam com um diálogo aberto', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		await page.getByRole('button', { name: 'Configurações' }).click();
		await page.keyboard.press('1');
		await expect(page).toHaveURL(/\/$/);
	});

	test('inicia o modo personalizado com os padrões', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		await page.locator('[data-level="personalizado"]').click();

		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Jogar personalizado' }).click();
		await expect(page).toHaveURL(/\/jogar\?nivel=personalizado&palavras=20&tempo=60$/);
	});

	test('mostra mensagem para configuração inválida', async ({ page }) => {
		await page.goto('/jogar?nivel=inexistente');
		await expect(page.getByRole('heading', { name: 'Configuração inválida' })).toBeVisible();
		await page.getByRole('link', { name: 'Voltar ao início' }).click();
		await expect(page).toHaveURL(/\/$/);
	});

	test('configurações salvam música desativada', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		await page.getByRole('button', { name: 'Configurações' }).click();
		await page.getByText('Música', { exact: true }).click();
		await expect(page.getByRole('switch').first()).not.toBeChecked();

		const stored = await page.evaluate(() => localStorage.getItem('typing-game:settings:v1'));
		expect(stored).toContain('music=off');
	});

	test('exibe 404 personalizada', async ({ page }) => {
		const response = await page.goto('/rota-que-nao-existe');
		expect(response?.status()).toBe(404);
		await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
		await expect(page.getByText('Erro 404')).toBeVisible();
	});

	test('rodapé mostra o ano atual e a ZionCodes', async ({ page }) => {
		await page.goto('/');
		const year = new Date().getFullYear();
		await expect(page.getByText(`© ${year} ZionCodes Todos os direitos reservados`)).toBeVisible();
		const footerLink = page.getByRole('contentinfo').getByRole('link', { name: 'ZionCodes' });
		await expect(footerLink).toHaveAttribute('href', 'https://zioncodes.squareweb.app');
		await expect(footerLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('alterna o tema e mantém após recarregar', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		const before = await page.locator('html').getAttribute('data-theme');
		await page.locator('[data-theme-toggle]').click();
		const after = await page.locator('html').getAttribute('data-theme');
		expect(after).not.toBe(before);
		await page.reload();
		await expect(page.locator('html')).toHaveAttribute('data-theme', after ?? '');
	});

	test('mostra recordes por modo e separa o personalizado por configuração', async ({ page }) => {
		await page.addInitScript(() => {
			const savedAt = new Date().toISOString();
			localStorage.setItem('typing-game:best:v1:iniciante', `58.4|95|10|10|${savedAt}`);
			localStorage.setItem('typing-game:best:v1:personalizado:20:60', `31.1|95|20|20|${savedAt}`);
			localStorage.setItem('typing-game:best:v1:personalizado:5:5', `90|95|5|5|${savedAt}`);
		});
		await page.goto('/');
		await hydrated(page);

		await expect(page.locator('[data-level="iniciante"]')).toContainText('recorde 58,4 ppm');
		const custom = page.locator('[data-level="personalizado"]');
		await expect(custom).toContainText('recorde 31,1 ppm · 20 palavras em 60s');
		await expect(custom).not.toContainText('90');

		await page.getByRole('button', { name: 'Traduzir do inglês' }).click();
		await expect(page.locator('[data-level="iniciante"]')).toContainText('10 palavras');
		await expect(page.locator('[data-level="iniciante"]')).not.toContainText('58,4');
	});
});

test.describe('home em inglês', () => {
	test('carrega /en com lang en e textos traduzidos', async ({ page }) => {
		await page.goto('/en');

		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText('Type fast. Then translate.');
		await expect(page.getByText('Example word: heart')).toBeAttached();
		await expect(page.locator('[data-level="expert"]')).toContainText('Advanced');
		const year = new Date().getFullYear();
		await expect(page.getByText(`© ${year} ZionCodes All rights reserved`)).toBeVisible();
	});

	test('inicia uma partida em inglês e o modo português → inglês', async ({ page }) => {
		await page.goto('/en');
		await hydrated(page);
		await page.locator('[data-level="iniciante"]').click();
		await expect(page).toHaveURL(/\/en\/play\?nivel=iniciante$/);

		await page.goto('/en');
		await hydrated(page);
		await page.getByRole('button', { name: 'Translate from Portuguese' }).click();
		await expect(page.getByText('You see a Portuguese word; type')).toBeVisible();
		await page.locator('[data-level="amador"]').click();
		await expect(page).toHaveURL(/\/en\/play\?nivel=amador&modo=pt-en$/);
	});

	test('o seletor BR/US alterna entre as versões', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('link', { name: /US/ }).click();
		await expect(page).toHaveURL(/\/en$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await page.getByRole('link', { name: /BR/ }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
	});

	test('404 dentro de /en fica em inglês', async ({ page }) => {
		const response = await page.goto('/en/nothing-here');
		expect(response?.status()).toBe(404);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
	});
});

test.describe('storage bloqueado', () => {
	test('carrega, aplica tema e joga mesmo com localStorage lançando erro', async ({ page }) => {
		await page.addInitScript(() => {
			Object.defineProperty(window, 'localStorage', {
				configurable: true,
				get() {
					throw new DOMException('Storage bloqueado', 'SecurityError');
				}
			});
		});
		const errors: string[] = [];
		page.on('pageerror', (error) => errors.push(error.message));

		await page.goto('/');
		await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
		await page.locator('[data-theme-toggle]').click();
		await page.locator('[data-level="iniciante"]').click();
		await expect(page.locator('[data-game-status="running"]')).toBeVisible({ timeout: 12_000 });
		expect(errors).toEqual([]);
	});
});
