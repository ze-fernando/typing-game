import { expect, test } from '@playwright/test';

test.describe('tela inicial', () => {
	test('carrega com SEO básico e hero', async ({ page }) => {
		await page.goto('/');

		await expect(page).toHaveTitle(/Typing Game/);
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Digite mais rápido');
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			'https://typing-game.netlify.app/'
		);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			'content',
			/Typing Game/
		);
	});

	test('abre o modal de níveis e inicia o nível iniciante', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Iniciar agora' }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'Escolha o nível' })).toBeVisible();
		await expect(dialog.getByText('10 palavras')).toBeVisible();
		await expect(dialog.getByText('15 palavras')).toBeVisible();
		await expect(dialog.getByText('30 palavras')).toBeVisible();

		await dialog.getByRole('button', { name: /Iniciante/ }).click();
		await expect(page).toHaveURL(/\/jogar\?nivel=iniciante/);
	});

	test('inicia o modo personalizado com os padrões', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Iniciar agora' }).click();
		await page.getByRole('dialog').getByRole('button', { name: 'Jogar personalizado' }).click();

		await expect(page).toHaveURL(/nivel=personalizado/);
		await expect(page).toHaveURL(/palavras=20/);
		await expect(page).toHaveURL(/tempo=60/);
	});

	test('mostra mensagem para configuração inválida', async ({ page }) => {
		await page.goto('/jogar?nivel=inexistente');

		await expect(page.getByRole('heading', { name: 'Configuração inválida' })).toBeVisible();
		await page.getByRole('button', { name: 'Voltar ao início' }).click();
		await expect(page).toHaveURL(/\/$/);
	});

	test('configurações salvam música desativada', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Configurações' }).click();
		await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible();

		await page.getByText('Música').click();
		await expect(page.locator('input[type="checkbox"]').first()).not.toBeChecked();

		const stored = await page.evaluate(() => localStorage.getItem('typing-game:settings:v1'));
		expect(stored).toContain('music=off');
	});

	test('exibe página 404 personalizada', async ({ page }) => {
		const response = await page.goto('/rota-que-nao-existe');

		expect(response?.status()).toBe(404);
		await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
		await expect(page.getByText('Erro 404')).toBeVisible();
	});

	test('rodapé mostra o ano atual e o site do desenvolvedor', async ({ page }) => {
		await page.goto('/');

		const year = new Date().getFullYear();
		await expect(page.getByText(`© ${year} ZionCodes Todos os direitos reservados`)).toBeVisible();

		const devLink = page.getByRole('link', { name: 'Desenvolvedor' });
		await expect(devLink).toHaveAttribute('href', 'https://zioncodes.squareweb.app');

		const footerLink = page.getByRole('contentinfo').getByRole('link', { name: 'ZionCodes' });
		await expect(footerLink).toHaveAttribute('href', 'https://zioncodes.squareweb.app');
		await expect(footerLink).toHaveAttribute('rel', 'noopener noreferrer');
	});

	test('alterna o tema', async ({ page }) => {
		await page.goto('/');
		const before = await page.locator('html').getAttribute('data-theme');

		await page.getByRole('button', { name: 'Alternar tema' }).click();

		const after = await page.locator('html').getAttribute('data-theme');
		expect(after).not.toBe(before);
		expect(['light', 'dark']).toContain(after);
	});
});
