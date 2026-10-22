import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { TRANSLATION_BANK } from '../src/lib/modules/translation/bank';
import { currentPrompt, currentWord, hydrated, waitForRunning } from './helpers';

const PORTUGUESE_MARKERS =
	/\b(palavras?|partida|nível|níveis|digitar|digite|jogar|início|configurações|tempo|precisão|velocidade|recorde|Anônimo|Dica|Salvar|Iniciante|Amador|Avançado|segundos|Fechar|Sair|Pausar)\b/i;

type Level = 'iniciante' | 'amador' | 'expert';

function answersFor(level: Level, prompt: string): readonly string[] {
	return TRANSLATION_BANK[level].find((entry) => entry.prompt === prompt)?.answers ?? [];
}

function stripAccents(value: string): string {
	return value.normalize('NFD').replace(/\p{M}/gu, '');
}

async function visibleText(page: Page): Promise<string> {
	return page.evaluate((): string => document.body.innerText);
}

function leakedPortuguese(text: string): string[] {
	return text
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => PORTUGUESE_MARKERS.test(line));
}

async function hasHorizontalScroll(page: Page): Promise<boolean> {
	return page.evaluate(
		(): boolean => document.documentElement.scrollWidth > document.documentElement.clientWidth
	);
}

test.describe('QA tema', () => {
	for (const path of ['/', '/en']) {
		test(`QA primeiro quadro já usa o tema do sistema escuro em ${path}`, async ({ page }) => {
			await page.emulateMedia({ colorScheme: 'dark' });
			await page.addInitScript((): void => {
				requestAnimationFrame((): void => {
					(window as unknown as { firstFrameTheme: string }).firstFrameTheme =
						document.documentElement.dataset.theme ?? '';
				});
			});
			await page.goto(path);
			await hydrated(page);
			const firstFrame = await page.evaluate(
				(): string => (window as unknown as { firstFrameTheme: string }).firstFrameTheme
			);
			expect(firstFrame).toBe('dark');
		});
	}

	test('QA preferência claro persiste com sistema escuro no primeiro quadro', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'dark' });
		await page.addInitScript((): void => {
			localStorage.setItem('typing-game:theme', 'light');
			requestAnimationFrame((): void => {
				(window as unknown as { firstFrameTheme: string }).firstFrameTheme =
					document.documentElement.dataset.theme ?? '';
			});
		});
		await page.goto('/en');
		await hydrated(page);
		expect(
			await page.evaluate(
				(): string => (window as unknown as { firstFrameTheme: string }).firstFrameTheme
			)
		).toBe('light');
	});

	test('QA modo sistema acompanha troca do sistema operacional', async ({ page }) => {
		await page.emulateMedia({ colorScheme: 'light' });
		await page.goto('/');
		await hydrated(page);
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
		await page.emulateMedia({ colorScheme: 'dark' });
		await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
	});
});

test.describe('QA inglês sem vazamento de português', () => {
	test('QA home, diálogos, partida, resultado e 404 em /en', async ({ page }) => {
		const leaks: Record<string, string[]> = {};

		await page.goto('/en');
		await hydrated(page);
		leaks.home = leakedPortuguese(await visibleText(page));

		await page.getByRole('button', { name: 'Settings' }).first().click();
		leaks.settings = leakedPortuguese(await visibleText(page));
		await page.keyboard.press('Escape');

		await page.goto('/en/play?nivel=iniciante');
		await waitForRunning(page);
		leaks.play = leakedPortuguese(await visibleText(page));

		for (let index = 0; index < 10; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 40 });
			await page.keyboard.press('Enter');
		}
		await expect(page.getByRole('heading', { name: 'Round over' })).toBeVisible();
		leaks.results = leakedPortuguese(await visibleText(page));

		await page.goto('/en/does-not-exist');
		leaks.notFound = leakedPortuguese(await visibleText(page));

		console.log('QA_LEAKS', JSON.stringify(leaks));
		expect(Object.values(leaks).flat()).toEqual([]);
	});

	test('QA nome padrão do ranking aparece em inglês para jogador anônimo', async ({ page }) => {
		await page.goto('/en/play?nivel=amador');
		await waitForRunning(page);
		for (let index = 0; index < 15; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 40 });
			await page.keyboard.press('Enter');
		}
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Save to leaderboard' }).click();
		await expect(dialog.getByText('Result saved.')).toBeVisible();
		const board = await dialog.locator('[data-leaderboard="en:amador"]').innerText();
		console.log('QA_EN_BOARD', JSON.stringify(board));
		expect(board).not.toContain('Anônimo');
	});
});

test.describe('QA seletor de idioma', () => {
	test('QA BR/US preserva a rota na home e no 404', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		await page.getByRole('link', { name: /US/ }).click();
		await expect(page).toHaveURL(/\/en$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'en');
		await page.getByRole('link', { name: /BR/ }).click();
		await expect(page).toHaveURL(/\/$/);
		await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');

		await page.goto('/jogar?nivel=xyz');
		await page.getByRole('link', { name: /US/ }).click();
		await expect(page).toHaveURL(/\/en\/play$/);
	});
});

const DEMO_CASES: { path: string; level: Level; words: number }[] = [
	{ path: '/en/play', level: 'iniciante', words: 10 },
	{ path: '/en/play', level: 'amador', words: 15 },
	{ path: '/en/play', level: 'expert', words: 30 },
	{ path: '/jogar', level: 'iniciante', words: 10 },
	{ path: '/jogar', level: 'amador', words: 15 },
	{ path: '/jogar', level: 'expert', words: 30 }
];

test.describe('QA modo demo EN→PT', () => {
	for (const demo of DEMO_CASES) {
		test(`QA ${demo.path} ${demo.level}: alternativas, maiúsculas, acento e dica`, async ({
			page
		}) => {
			test.setTimeout(120_000);
			await page.goto(`${demo.path}?nivel=${demo.level}&modo=en-pt`);
			await waitForRunning(page);
			const notes: string[] = [];
			let accentChecked = false;
			let hintChecked = false;

			for (let index = 0; index < demo.words; index += 1) {
				const prompt = await currentPrompt(page);
				const answers = answersFor(demo.level, prompt);
				expect(answers.length, `prompt ${prompt} sem entrada no banco`).toBeGreaterThan(0);
				const accented = answers.find((answer) => stripAccents(answer) !== answer);

				if (!accentChecked && accented) {
					await page.keyboard.type(stripAccents(accented), { delay: 20 });
					await page.keyboard.press('Enter');
					await expect(
						page.getByText(/(Ainda não|Not yet|Acento errado|Wrong accent)/)
					).toBeVisible();
					expect(await currentPrompt(page)).toBe(prompt);
					const accentMessage = await page.getByText(/(Acento errado|Wrong accent)/).count();
					await page.keyboard.press('Escape');
					accentChecked = true;
					notes.push(
						`acento: ${prompt} → ${stripAccents(accented)} recusado; mensagem de acento: ${accentMessage > 0 ? 'sim' : 'NÃO'} (respostas ${answers.join('/')})`
					);
				}

				if (!hintChecked) {
					await page.getByRole('button', { name: /^(Dica|Hint)$/ }).click();
					const hint = await page
						.getByText(/(Começa com|Starts with)/)
						.first()
						.innerText();
					const canonical = Array.from(answers[0].toLocaleLowerCase('pt-BR'));
					expect(hint).toContain(`“${canonical[0]}”`);
					expect(hint).toContain(String(canonical.length));
					hintChecked = true;
					notes.push(`dica: ${hint}`);
					await page.locator('[data-game-input]').focus();
				}

				const chosen = answers[answers.length - 1].toLocaleUpperCase('pt-BR');
				await page.keyboard.type(chosen, { delay: 20 });
				await page.keyboard.press('Enter');
			}

			const dialog = page.getByRole('dialog');
			await expect(
				dialog.getByRole('heading', { name: /(Fim de partida|Round over)/ })
			).toBeVisible();
			const summary = await dialog.innerText();
			expect(summary).toMatch(/(Dicas usadas|Hints used)\s*1/i);
			expect(summary).toMatch(new RegExp(`${demo.words}/${demo.words}`));
			console.log('QA_DEMO', demo.path, demo.level, JSON.stringify(notes));
		});
	}
});

test.describe('QA ranking por modo e nível', () => {
	test('QA EN→PT com dica salva no ranking en-pt e não aparece em pt', async ({ page }) => {
		const nickname = `QA ${Date.now().toString().slice(-5)}`;
		await page.goto('/jogar?nivel=iniciante&modo=en-pt');
		await waitForRunning(page);
		for (let index = 0; index < 10; index += 1) {
			const answers = answersFor('iniciante', await currentPrompt(page));
			if (index === 0) {
				await page.getByRole('button', { name: 'Dica' }).click();
				await page.locator('[data-game-input]').focus();
			}
			await page.keyboard.type(answers[0], { delay: 70 });
			await page.keyboard.press('Enter');
		}
		const dialog = page.getByRole('dialog');
		await dialog.getByPlaceholder(/apelido/i).fill(nickname);
		await dialog.getByRole('button', { name: 'Salvar no ranking' }).click();
		await expect(dialog.getByText(/Você ficou em \d+º lugar/i).first()).toBeVisible();
		await page.screenshot({
			path: test.info().outputPath(`qa-results-enpt-saved.png`),
			fullPage: true
		});

		await page.goto('/');
		await hydrated(page);
		const ranking = page.locator('[data-section="ranking"]');
		await ranking.getByRole('button', { name: 'EN → PT', exact: true }).click();
		await expect(ranking.getByText(nickname)).toBeVisible();
		await ranking.screenshot({ path: test.info().outputPath(`qa-ranking-enpt.png`) });
		await ranking.getByRole('button', { name: 'PT', exact: true }).click();
		await expect(ranking.getByText(nickname)).toHaveCount(0);
		await ranking.getByRole('button', { name: 'EN', exact: true }).click();
		await expect(ranking.getByText(nickname)).toHaveCount(0);
	});

	test('QA modo personalizado não oferece envio ao ranking', async ({ page }) => {
		await page.goto('/jogar?nivel=personalizado&palavras=2&tempo=30');
		await waitForRunning(page);
		for (let index = 0; index < 2; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 40 });
			await page.keyboard.press('Enter');
		}
		const dialog = page.getByRole('dialog');
		await expect(dialog.getByText(/fica fora do ranking/)).toBeVisible();
		await expect(dialog.getByRole('button', { name: 'Salvar no ranking' })).toHaveCount(0);
	});

	test('QA API: apelido com 21 caracteres é recusado e 20 aceito', async ({ request }) => {
		const base = {
			mode: 'en',
			level: 'expert',
			wordsCompleted: 30,
			wordsTotal: 30,
			hintedWords: 0,
			durationMs: 39_000
		};
		const chars = await request.get('/api/leaderboard?modo=en&nivel=expert');
		expect(chars.status()).toBe(200);
		const tooLong = await request.post('/api/scores', {
			data: { ...base, nickname: 'a'.repeat(21), correctChars: 330, comparedChars: 330 },
			headers: { 'x-forwarded-for': '203.0.113.21' }
		});
		expect(tooLong.status()).toBe(400);
		expect((await tooLong.json()).error).toBe('invalid_nickname');
	});
});

const VIEWPORTS = [
	{ name: '360x740', width: 360, height: 740 },
	{ name: '390x844', width: 390, height: 844 },
	{ name: '768x1024', width: 768, height: 1024 },
	{ name: '1440x900', width: 1440, height: 900 },
	{ name: 'landscape-740x360', width: 740, height: 360 },
	{ name: 'landscape-844x390', width: 844, height: 390 }
];

test.describe('QA viewports', () => {
	for (const viewport of VIEWPORTS) {
		for (const theme of ['dark', 'light'] as const) {
			test(`QA capturas ${viewport.name} ${theme}`, async ({ page }) => {
				await page.setViewportSize({ width: viewport.width, height: viewport.height });
				await page.emulateMedia({ colorScheme: theme });
				await page.goto('/');
				await hydrated(page);
				expect(await hasHorizontalScroll(page), 'rolagem horizontal na home').toBe(false);
				await page.screenshot({
					path: test.info().outputPath(`qa-home-${viewport.name}-${theme}.png`)
				});

				await page.goto('/en/play?nivel=amador&modo=en-pt');
				await waitForRunning(page);
				expect(await hasHorizontalScroll(page), 'rolagem horizontal no jogo').toBe(false);
				const input = page.locator('[data-game-input]');
				await expect(input).toBeInViewport();
				await page.screenshot({
					path: test.info().outputPath(`qa-play-enpt-${viewport.name}-${theme}.png`)
				});
			});
		}
	}
});

test.describe('QA teclado e foco', () => {
	test('QA navega pela home só com Tab e foco sempre visível', async ({ page }) => {
		await page.goto('/');
		await hydrated(page);
		const invisible: string[] = [];
		for (let index = 0; index < 30; index += 1) {
			await page.keyboard.press('Tab');
			const info = await page.evaluate((): { label: string; visible: boolean } => {
				const element = document.activeElement as HTMLElement | null;
				if (!element || element === document.body) return { label: 'body', visible: true };
				const style = getComputedStyle(element);
				const rect = element.getBoundingClientRect();
				const ring =
					(style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) ||
					style.boxShadow !== 'none';
				return {
					label: `${element.tagName} ${(element.textContent ?? '').trim().slice(0, 30)}`,
					visible: ring && rect.width > 0 && rect.height > 0
				};
			});
			if (!info.visible) invisible.push(info.label);
		}
		console.log('QA_FOCUS_INVISIBLE', JSON.stringify(invisible));
		expect(invisible).toEqual([]);
	});

	test('QA inicia nível e joga sem mouse', async ({ page }) => {
		await page.goto('/en');
		await hydrated(page);
		await page.keyboard.press('1');
		await waitForRunning(page);
		await page.keyboard.type(await currentWord(page), { delay: 40 });
		await page.keyboard.press('Enter');
		await expect(page.getByText('1/10 words')).toBeVisible();
	});

	test('QA axe na partida EN→PT em tema claro e escuro', async ({ page }) => {
		for (const theme of ['light', 'dark'] as const) {
			await page.emulateMedia({ colorScheme: theme });
			await page.goto('/en/play?nivel=expert&modo=en-pt');
			await waitForRunning(page);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
				.analyze();
			console.log('QA_AXE', theme, results.violations.map((violation) => violation.id).join(','));
			expect(results.violations).toEqual([]);
		}
	});
});
