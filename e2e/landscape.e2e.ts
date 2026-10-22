import { expect, test, type Page } from '@playwright/test';
import { TRANSLATION_BANK } from '../src/lib/modules/translation/bank';
import { EN_WORDS } from '../src/lib/modules/words/en';
import { PT_WORDS } from '../src/lib/modules/words/pt';
import { currentPrompt, currentWord, forceFirstEntry, waitForRunning } from './helpers';

type Level = 'iniciante' | 'amador' | 'expert';

interface Box {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface LongestCase {
	name: string;
	path: string;
	poolSize: number;
	index: number;
	prompt: string;
	answer: string | null;
}

const LEVELS: Level[] = ['iniciante', 'amador', 'expert'];
const VIEWPORTS = [
	{ width: 740, height: 360 },
	{ width: 844, height: 390 }
];

function longestIndex(values: readonly string[]): number {
	return values.reduce(
		(best, value, index) =>
			Array.from(value).length > Array.from(values[best]).length ? index : best,
		0
	);
}

function longestAnswer(answers: readonly string[]): string {
	return answers[longestIndex(answers)];
}

function longestCases(): LongestCase[] {
	return LEVELS.flatMap((level): LongestCase[] => {
		const pt = longestIndex(PT_WORDS[level]);
		const en = longestIndex(EN_WORDS[level]);
		const translations = TRANSLATION_BANK[level];
		const translation = longestIndex(
			translations.map((entry) => {
				const answer = longestAnswer(entry.answers);
				return Array.from(answer).length > Array.from(entry.prompt).length ? answer : entry.prompt;
			})
		);
		return [
			{
				name: `pt ${level}`,
				path: `/jogar?nivel=${level}`,
				poolSize: PT_WORDS[level].length,
				index: pt,
				prompt: PT_WORDS[level][pt],
				answer: null
			},
			{
				name: `en ${level}`,
				path: `/en/play?nivel=${level}`,
				poolSize: EN_WORDS[level].length,
				index: en,
				prompt: EN_WORDS[level][en],
				answer: null
			},
			{
				name: `en-pt ${level}`,
				path: `/en/play?nivel=${level}&modo=en-pt`,
				poolSize: translations.length,
				index: translation,
				prompt: translations[translation].prompt,
				answer: longestAnswer(translations[translation].answers)
			}
		];
	});
}

function overlaps(first: Box, second: Box): boolean {
	return (
		first.x < second.x + second.width &&
		second.x < first.x + first.width &&
		first.y < second.y + second.height &&
		second.y < first.y + first.height
	);
}

async function boxOf(page: Page, selector: string): Promise<Box> {
	const box = await page.locator(selector).first().boundingBox();
	expect(box, `${selector} sem caixa`).not.toBeNull();
	return box as Box;
}

async function expectNoOverlap(page: Page, words: string[], others: string[]): Promise<void> {
	const viewport = page.viewportSize();
	expect(viewport).not.toBeNull();

	for (const word of words) {
		const wordBox = await boxOf(page, word);
		expect(wordBox.x).toBeGreaterThanOrEqual(0);
		expect(wordBox.y).toBeGreaterThanOrEqual(0);
		expect(wordBox.x + wordBox.width).toBeLessThanOrEqual(viewport?.width ?? 0);
		expect(wordBox.y + wordBox.height).toBeLessThanOrEqual(viewport?.height ?? 0);

		const clipped = await page
			.locator(word)
			.first()
			.evaluate((element): boolean => element.scrollWidth > element.clientWidth + 1);
		expect(clipped, `${word} cortada`).toBe(false);

		for (const other of others) {
			const otherBox = await boxOf(page, other);
			expect(overlaps(wordBox, otherBox), `${word} sobrepõe ${other}`).toBe(false);
		}
	}
}

const HUD = ['[data-hud-timer]', '[data-hud-stats]', '[data-hud-progress]', '[data-game-input]'];

test.describe('paisagem sem sobreposição com a palavra mais longa', () => {
	for (const viewport of VIEWPORTS) {
		for (const entry of longestCases()) {
			test(`${viewport.width}x${viewport.height} ${entry.name}: ${entry.prompt}`, async ({
				page
			}) => {
				await page.setViewportSize(viewport);
				await forceFirstEntry(page, entry.poolSize, entry.index);
				await page.goto(entry.path);
				await waitForRunning(page);

				if (entry.answer === null) {
					expect(await currentWord(page)).toBe(entry.prompt);
					await expectNoOverlap(page, ['[data-word-prompt]'], HUD);
					await page.keyboard.type(Array.from(entry.prompt).slice(0, -1).join(''));
					await expectNoOverlap(page, ['[data-word-prompt]'], HUD);
					return;
				}

				expect(await currentPrompt(page)).toBe(entry.prompt);
				const others = [...HUD, '[data-hint-rule]'];
				await expectNoOverlap(page, ['[data-word-prompt]', '[data-word-typed]'], others);
				await page.keyboard.type(Array.from(entry.answer).slice(0, -1).join(''));
				await expectNoOverlap(page, ['[data-word-prompt]', '[data-word-typed]'], others);
				await page.getByRole('button', { name: 'Hint' }).click();
				await expectNoOverlap(page, ['[data-word-prompt]', '[data-word-typed]'], others);
			});
		}
	}
});
