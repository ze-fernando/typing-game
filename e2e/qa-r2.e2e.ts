import { expect, test, type Page } from '@playwright/test';
import { TRANSLATION_BANK } from '../src/lib/modules/translation/bank';
import { EN_WORDS } from '../src/lib/modules/words/en';
import { PT_WORDS } from '../src/lib/modules/words/pt';
import { currentPrompt, currentWord, forceFirstEntry, hydrated, waitForRunning } from './helpers';

type Level = 'iniciante' | 'amador' | 'expert';
type Theme = 'light' | 'dark';

interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface QaCase {
	name: string;
	path: string;
	pool: readonly string[];
	index: number;
	answer: string | null;
}

const LEVELS: Level[] = ['iniciante', 'amador', 'expert'];
const THEMES: Theme[] = ['dark', 'light'];
const VIEWPORTS = [
	{ width: 740, height: 360 },
	{ width: 844, height: 390 }
];
const FIXED = ['[data-hud-timer]', '[data-hud-stats]', '[data-hud-progress]', '[data-game-input]'];

function capturePath(name: string): string {
	const directory = process.env.QA_ASSETS_DIR;
	return directory ? `${directory}/qa-r2-${name}.png` : test.info().outputPath(`qa-r2-${name}.png`);
}

function charCount(value: string): number {
	return Array.from(value).length;
}

function longestIndex(values: readonly string[]): number {
	return values.reduce(
		(best, value, index) => (charCount(value) > charCount(values[best]) ? index : best),
		0
	);
}

function longestTranslationIndex(level: Level): number {
	return longestIndex(
		TRANSLATION_BANK[level].map((entry): string =>
			[entry.prompt, ...entry.answers].reduce((best, value) =>
				charCount(value) > charCount(best) ? value : best
			)
		)
	);
}

function longestAnswer(answers: readonly string[]): string {
	return answers[longestIndex(answers)];
}

function cases(): QaCase[] {
	return LEVELS.flatMap((level): QaCase[] => {
		const prompts = TRANSLATION_BANK[level].map((entry) => entry.prompt);
		const translation = longestTranslationIndex(level);
		const answer = longestAnswer(TRANSLATION_BANK[level][translation].answers);
		return [
			{
				name: `pt-${level}`,
				path: `/jogar?nivel=${level}`,
				pool: PT_WORDS[level],
				index: longestIndex(PT_WORDS[level]),
				answer: null
			},
			{
				name: `en-${level}`,
				path: `/en/play?nivel=${level}`,
				pool: EN_WORDS[level],
				index: longestIndex(EN_WORDS[level]),
				answer: null
			},
			{
				name: `enpt-en-${level}`,
				path: `/en/play?nivel=${level}&modo=en-pt`,
				pool: prompts,
				index: translation,
				answer
			},
			{
				name: `enpt-pt-${level}`,
				path: `/jogar?nivel=${level}&modo=en-pt`,
				pool: prompts,
				index: translation,
				answer
			}
		];
	});
}

const LINE_BOX_LEADING_PX = 6;

function overlaps(first: Box, second: Box, tolerance: number): boolean {
	return (
		first.x < second.x + second.width - 0.5 &&
		second.x < first.x + first.width - 0.5 &&
		first.y + tolerance < second.y + second.height - 0.5 &&
		second.y < first.y + first.height - 0.5 - tolerance
	);
}

async function visibleBoxes(page: Page, selector: string): Promise<Box[]> {
	const locators = await page.locator(selector).all();
	const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()));
	return boxes.filter((box): box is Box => box !== null && box.width > 0 && box.height > 0);
}

async function inkBoxes(page: Page, selector: string): Promise<Box[]> {
	return page.locator(selector).evaluateAll((elements): Box[] =>
		elements.flatMap((element): Box[] => {
			const range = document.createRange();
			range.selectNodeContents(element);
			return Array.from(range.getClientRects())
				.filter((rect) => rect.width > 0 && rect.height > 0)
				.map((rect) => ({ x: rect.x, y: rect.y, width: rect.width, height: rect.height }));
		})
	);
}

async function collisions(page: Page, others: string[]): Promise<string[]> {
	const viewport = page.viewportSize() ?? { width: 0, height: 0 };
	const words = [
		...(await inkBoxes(page, '[data-word-prompt]')),
		...(await inkBoxes(page, '[data-word-typed]'))
	];
	const found: string[] = [];
	expect(words.length, 'palavra sem caixa').toBeGreaterThan(0);

	for (const word of words) {
		if (word.x < 0 || word.y < 0 || word.x + word.width > viewport.width + 0.5) {
			found.push(`palavra fora do viewport ${JSON.stringify(word)}`);
		}
		for (const selector of others) {
			for (const box of await visibleBoxes(page, selector)) {
				const tolerance = selector === '[data-hud-progress]' ? LINE_BOX_LEADING_PX : 0;
				if (overlaps(word, box, tolerance)) found.push(`palavra × ${selector}`);
			}
		}
	}

	const clipped = await page
		.locator('[data-word-prompt], [data-word-typed]')
		.evaluateAll((elements): boolean[] =>
			elements.map((element) => element.scrollWidth > element.clientWidth + 1)
		);
	if (clipped.some(Boolean)) found.push('palavra cortada horizontalmente');

	return found;
}

test.describe('QA R2 paisagem com a palavra mais longa', () => {
	for (const viewport of VIEWPORTS) {
		for (const theme of THEMES) {
			for (const entry of cases()) {
				const label = `${entry.name}-${viewport.width}x${viewport.height}-${theme}`;
				test(`QA R2 ${label}`, async ({ page }) => {
					await page.setViewportSize(viewport);
					await page.emulateMedia({ colorScheme: theme });
					await forceFirstEntry(page, entry.pool.length, entry.index);
					await page.goto(entry.path);
					await waitForRunning(page);
					const others = [...FIXED, '[data-hint-rule]'];
					const problems: string[] = [];

					if (entry.answer === null) {
						expect(await currentWord(page)).toBe(entry.pool[entry.index]);
						problems.push(...(await collisions(page, others)));
						await page.keyboard.type(Array.from(entry.pool[entry.index]).slice(0, -1).join(''));
						problems.push(...(await collisions(page, others)));
					} else {
						expect(await currentPrompt(page)).toBe(entry.pool[entry.index]);
						problems.push(...(await collisions(page, others)));
						const hintButton = page.getByRole('button', { name: /^(Dica|Hint)$/ });
						await hintButton.click();
						await page.locator('[data-game-input]').focus();
						await page.keyboard.type(Array.from(entry.answer).slice(0, -1).join(''));
						problems.push(...(await collisions(page, others)));
					}

					await page.screenshot({ path: capturePath(label) });
					expect(problems, label).toEqual([]);
				});
			}
		}
	}
});

test.describe('QA R2 reteste dos P2', () => {
	test('QA R2 dog → cao mostra acento errado', async ({ page }) => {
		const prompts = TRANSLATION_BANK.iniciante.map((entry) => entry.prompt);
		await forceFirstEntry(page, prompts.length, prompts.indexOf('dog'));
		await page.goto('/en/play?nivel=iniciante&modo=en-pt');
		await waitForRunning(page);
		expect(await currentPrompt(page)).toBe('dog');
		await page.keyboard.type('cao');
		await page.keyboard.press('Enter');
		await expect(page.getByText('Wrong accent: use ã instead of a.')).toBeVisible();
		expect(await currentPrompt(page)).toBe('dog');
		await page.screenshot({ path: capturePath('dog-cao-wrong-accent') });
		await page.keyboard.press('Escape');
		await page.keyboard.type('CÃO');
		await page.keyboard.press('Enter');
		await expect(page.getByText('1/10 words')).toBeVisible();
	});

	for (const path of ['/en/play', '/jogar']) {
		test(`QA R2 placeholder inteiro em 360x740 ${path}`, async ({ page }) => {
			await page.setViewportSize({ width: 360, height: 740 });
			await page.goto(`${path}?nivel=amador&modo=en-pt`);
			await waitForRunning(page);
			const input = page.locator('[data-game-input]');
			const fits = await input.evaluate((element): { text: string; fits: boolean } => {
				const field = element as HTMLInputElement;
				const style = getComputedStyle(field);
				const canvas = document.createElement('canvas').getContext('2d');
				if (!canvas) return { text: field.placeholder, fits: false };
				canvas.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
				const available =
					field.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
				return {
					text: field.placeholder,
					fits: canvas.measureText(field.placeholder).width <= available
				};
			});
			console.log('QA_R2_PLACEHOLDER', path, JSON.stringify(fits));
			expect(fits.fits).toBe(true);
			await page.screenshot({
				path: capturePath(`placeholder-360x740${path.replace(/\//g, '-')}`)
			});
		});
	}

	test('QA R2 anônimo localizado nas duas línguas', async ({ page }) => {
		await page.goto('/en/play?nivel=iniciante');
		await waitForRunning(page);
		for (let index = 0; index < 10; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 60 });
			await page.keyboard.press('Enter');
		}
		const dialog = page.getByRole('dialog');
		await dialog.getByRole('button', { name: 'Save to leaderboard' }).click();
		await expect(dialog.getByText('Result saved.')).toBeVisible();
		const board = dialog.locator('[data-leaderboard="en:iniciante"]');
		await expect(board).toContainText('Anonymous');
		await expect(board).not.toContainText('Anônimo');

		await page.goto('/');
		await hydrated(page);
		const ranking = page.locator('[data-section="ranking"]');
		await ranking.getByRole('button', { name: 'EN', exact: true }).click();
		await expect(ranking).toContainText('Anônimo');
		await expect(ranking).not.toContainText('Anonymous');
	});
});
