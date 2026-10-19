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

	test('inicia o nível direto pelo menu da home', async ({ page }) => {
		await page.goto('/');

		const iniciante = page.getByRole('button', { name: /10 palavras/ });
		await expect(iniciante).toContainText('10 palavras');
		await expect(iniciante).toContainText('35s');

		await iniciante.click();
		await expect(page).toHaveURL(/\/jogar\?nivel=iniciante/);
	});

	test('atalhos 1–4 iniciam os níveis e o personalizado', async ({ page }) => {
		await page.goto('/');

		// A tecla pode ser pressionada antes da hidratação; repete até a navegação ocorrer.
		await expect(async () => {
			await page.keyboard.press('3');
			await expect(page).toHaveURL(/\/jogar\?nivel=expert/, { timeout: 1000 });
		}).toPass({ timeout: 15_000 });

		await page.goto('/');
		await expect(async () => {
			await page.keyboard.press('4');
			await expect(page.getByRole('heading', { name: 'Modo personalizado' })).toBeVisible({
				timeout: 1000
			});
		}).toPass({ timeout: 15_000 });
	});

	test('inicia o modo personalizado com os padrões', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: /Personalizado/ }).click();

		const dialog = page.getByRole('dialog');
		await expect(dialog.getByRole('heading', { name: 'Modo personalizado' })).toBeVisible();
		await dialog.getByRole('button', { name: 'Jogar personalizado' }).click();

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
