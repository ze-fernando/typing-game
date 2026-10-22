import { expect, test, type Page } from '@playwright/test';
import { currentWord, waitForRunning } from './helpers';

interface LevelSample {
	at: number;
	rms: number;
	peak: number;
}

interface AudioStats {
	contexts: number;
	states: string[];
	oscillators: number;
	sources: number;
	activeIntervals: number;
	busDisconnects: number;
	filterTargets: number[];
	samples: LevelSample[];
}

interface QaWindow {
	qaAudio: AudioStats;
}

const SETTINGS_KEY = 'typing-game:settings:v1';

async function instrumentAudio(page: Page, settings: string | null): Promise<void> {
	await page.addInitScript(
		({ key, value }: { key: string; value: string | null }): void => {
			if (value !== null && localStorage.getItem(key) === null) localStorage.setItem(key, value);

			const stats: AudioStats = {
				contexts: 0,
				states: [],
				oscillators: 0,
				sources: 0,
				activeIntervals: 0,
				busDisconnects: 0,
				filterTargets: [],
				samples: []
			};
			(window as unknown as QaWindow).qaAudio = stats;

			const nativeSetInterval = window.setInterval.bind(window);
			const nativeClearInterval = window.clearInterval.bind(window);
			const live = new Set<number>();
			window.setInterval = ((handler: TimerHandler, timeout?: number): number => {
				const id = nativeSetInterval(handler, timeout);
				live.add(id);
				stats.activeIntervals = live.size;
				return id;
			}) as typeof window.setInterval;
			window.clearInterval = ((id?: number): void => {
				if (id !== undefined) live.delete(id);
				stats.activeIntervals = live.size;
				nativeClearInterval(id);
			}) as typeof window.clearInterval;

			const analysers = new WeakMap<BaseAudioContext, AnalyserNode>();
			const nativeConnect = AudioNode.prototype.connect as (
				this: AudioNode,
				target: AudioNode | AudioParam,
				output?: number,
				input?: number
			) => AudioNode | void;
			const nativeDisconnect = AudioNode.prototype.disconnect as (this: AudioNode) => void;

			function tap(context: BaseAudioContext): void {
				if (analysers.has(context)) return;
				const analyser = context.createAnalyser();
				analyser.fftSize = 2048;
				analysers.set(context, analyser);
				const buffer = new Float32Array(analyser.fftSize);
				const started = performance.now();
				nativeSetInterval((): void => {
					analyser.getFloatTimeDomainData(buffer);
					let peak = 0;
					let sum = 0;
					for (const sample of buffer) {
						peak = Math.max(peak, Math.abs(sample));
						sum += sample * sample;
					}
					stats.samples.push({
						at: performance.now() - started,
						rms: Math.sqrt(sum / buffer.length),
						peak
					});
				}, 40);
			}

			AudioNode.prototype.connect = function connect(
				this: AudioNode,
				target: AudioNode | AudioParam,
				output?: number,
				input?: number
			): AudioNode | void {
				if (target instanceof AudioDestinationNode) {
					tap(this.context);
					const analyser = analysers.get(this.context);
					if (analyser) nativeConnect.call(this, analyser);
				}
				return nativeConnect.call(this, target, output, input);
			} as typeof AudioNode.prototype.connect;

			AudioNode.prototype.disconnect = function disconnect(this: AudioNode): void {
				if (this instanceof GainNode) stats.busDisconnects += 1;
				nativeDisconnect.call(this);
			} as typeof AudioNode.prototype.disconnect;

			const NativeContext = window.AudioContext;
			window.AudioContext = new Proxy(NativeContext, {
				construct: (target, args, newTarget): AudioContext => {
					const created = Reflect.construct(target, args, newTarget) as AudioContext;
					stats.contexts += 1;
					stats.states.push(created.state);
					created.addEventListener('statechange', (): void => {
						stats.states.push(created.state);
					});
					return created;
				}
			});

			const nativeOscillator = BaseAudioContext.prototype.createOscillator;
			BaseAudioContext.prototype.createOscillator = function createOscillator(
				this: BaseAudioContext
			): OscillatorNode {
				stats.oscillators += 1;
				return nativeOscillator.call(this);
			};
			const nativeSource = BaseAudioContext.prototype.createBufferSource;
			BaseAudioContext.prototype.createBufferSource = function createBufferSource(
				this: BaseAudioContext
			): AudioBufferSourceNode {
				stats.sources += 1;
				return nativeSource.call(this);
			};
			const nativeTarget = AudioParam.prototype.setTargetAtTime;
			AudioParam.prototype.setTargetAtTime = function setTargetAtTime(
				this: AudioParam,
				target: number,
				startTime: number,
				timeConstant: number
			): AudioParam {
				if (target >= 1000) stats.filterTargets.push(target);
				return nativeTarget.call(this, target, startTime, timeConstant);
			};
		},
		{ key: SETTINGS_KEY, value: settings }
	);
}

async function stats(page: Page): Promise<AudioStats> {
	return page.evaluate((): AudioStats => (window as unknown as QaWindow).qaAudio);
}

async function notes(page: Page): Promise<number> {
	const current = await stats(page);
	return current.oscillators + current.sources;
}

function collectErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('console', (message) => {
		if (message.type() === 'error') errors.push(message.text());
	});
	return errors;
}

function dbfs(value: number): number {
	return value > 0 ? 20 * Math.log10(value) : -Infinity;
}

function samplesBetween(samples: LevelSample[], from: number, to: number): LevelSample[] {
	return samples.filter((sample) => sample.at >= from && sample.at < to);
}

const MUSIC_ONLY = 'music=on&effects=off&theme=system';
const EFFECTS_ONLY = 'music=off&effects=on&theme=system';

interface GestureTrace {
	log: string[];
	state: () => string;
}

test.describe('QA R3 música: gesto com política de autoplay real', () => {
	test('QA R3 só soa depois de um gesto', async ({ playwright, baseURL }) => {
		test.skip(
			process.env.QA_HEADED !== '1',
			'O headless do Chromium ignora a política de autoplay; rode com QA_HEADED=1 sob xvfb-run.'
		);
		const browser = await playwright.chromium.launch({
			channel: 'chromium',
			headless: false,
			args: ['--ozone-platform=x11']
		});
		const page = await (await browser.newContext({ baseURL })).newPage();
		await page.addInitScript((value: string): void => {
			localStorage.setItem('typing-game:settings:v1', value);
			const log: string[] = [];
			const NativeContext = window.AudioContext;
			window.AudioContext = new Proxy(NativeContext, {
				construct: (target, args, newTarget): AudioContext => {
					const created = Reflect.construct(target, args, newTarget) as AudioContext;
					const trace = window as unknown as { qaGesture: GestureTrace };
					trace.qaGesture = { log, state: (): string => created.state };
					log.push(`new:${created.state}:${navigator.userActivation.hasBeenActive}`);
					created.addEventListener('statechange', (): void => {
						log.push(`${created.state}:${navigator.userActivation.hasBeenActive}`);
					});
					return created;
				}
			});
		}, MUSIC_ONLY);
		const trace = async (): Promise<string[]> =>
			page.evaluate((): string[] => {
				const value = (window as unknown as { qaGesture: GestureTrace }).qaGesture;
				return [...value.log, `agora:${value.state()}`];
			});

		await page.goto('/jogar?nivel=amador');
		await waitForRunning(page);
		await page.waitForTimeout(1500);
		const before = await trace();
		console.log('QA_R3_GESTO_ANTES', JSON.stringify(before));
		expect(before[0]).toBe('new:suspended:false');
		expect(before.filter((entry) => entry.startsWith('running:'))).not.toContain('running:false');

		await page.keyboard.press('a');
		await expect.poll(async () => (await trace()).at(-1), { timeout: 5000 }).toBe('agora:running');
		const after = await trace();
		console.log('QA_R3_GESTO_DEPOIS', JSON.stringify(after));
		expect(after).toContain('running:true');
		expect(after).not.toContain('running:false');
		await browser.close();
	});
});

test.describe('QA R3 música', () => {
	test('QA R3 trilha medida em tempo real: sem silêncio, sem clipping', async ({ page }) => {
		test.setTimeout(90_000);
		const errors = collectErrors(page);
		await instrumentAudio(page, MUSIC_ONLY);
		await page.goto('/jogar?nivel=amador');
		await waitForRunning(page);
		const startedAt = (await stats(page)).samples.at(-1)?.at ?? 0;
		await page.waitForTimeout(25_000);
		const all = (await stats(page)).samples;
		const playing = samplesBetween(all, startedAt + 2000, startedAt + 25_000);
		const peak = Math.max(...playing.map((sample) => sample.peak));
		const rms = Math.sqrt(
			playing.reduce((total, sample) => total + sample.rms * sample.rms, 0) / playing.length
		);
		let longestSilence = 0;
		let silenceStart: number | null = null;
		for (const sample of playing) {
			if (sample.rms < 0.0005) {
				silenceStart ??= sample.at;
				longestSilence = Math.max(longestSilence, sample.at - silenceStart);
			} else silenceStart = null;
		}
		console.log(
			'QA_R3_TRILHA',
			JSON.stringify({
				windows: playing.length,
				peak: Number(peak.toFixed(4)),
				peakDbfs: Number(dbfs(peak).toFixed(1)),
				rms: Number(rms.toFixed(4)),
				rmsDbfs: Number(dbfs(rms).toFixed(1)),
				longestSilenceMs: Math.round(longestSilence)
			})
		);
		expect(playing.length).toBeGreaterThan(400);
		expect(peak).toBeLessThan(1);
		expect(rms).toBeGreaterThan(0.001);
		expect(longestSilence).toBeLessThan(1500);
		expect(errors).toEqual([]);
	});

	test('QA R3 música fica abaixo dos efeitos', async ({ page }) => {
		test.setTimeout(90_000);
		await instrumentAudio(page, EFFECTS_ONLY);
		await page.goto('/jogar?nivel=amador');
		await waitForRunning(page);
		for (let index = 0; index < 6; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 60 });
			await page.keyboard.press('Enter');
			await page.waitForTimeout(300);
		}
		const effects = (await stats(page)).samples;
		const effectPeak = Math.max(...effects.map((sample) => sample.peak));
		const effectLoud = effects
			.map((sample) => sample.rms)
			.sort((left, right) => right - left)
			.slice(0, 10);
		const effectRms = effectLoud.reduce((total, value) => total + value, 0) / effectLoud.length;

		const musicContext = await page
			.context()
			.browser()!
			.newContext({ baseURL: test.info().project.use.baseURL });
		const musicPage = await musicContext.newPage();
		await instrumentAudio(musicPage, MUSIC_ONLY);
		await musicPage.goto('/jogar?nivel=amador');
		await waitForRunning(musicPage);
		await musicPage.waitForTimeout(12_000);
		const music = samplesBetween((await stats(musicPage)).samples, 3000, 15_000);
		const musicPeak = Math.max(...music.map((sample) => sample.peak));
		const musicRms = Math.sqrt(
			music.reduce((total, sample) => total + sample.rms * sample.rms, 0) / music.length
		);
		console.log(
			'QA_R3_MIX',
			JSON.stringify({
				effectPeakDbfs: Number(dbfs(effectPeak).toFixed(1)),
				effectLoudRmsDbfs: Number(dbfs(effectRms).toFixed(1)),
				musicPeakDbfs: Number(dbfs(musicPeak).toFixed(1)),
				musicRmsDbfs: Number(dbfs(musicRms).toFixed(1)),
				gapRmsDb: Number((dbfs(effectRms) - dbfs(musicRms)).toFixed(1))
			})
		);
		expect(music.length).toBeGreaterThan(200);
		expect(musicRms).toBeGreaterThan(0.001);
		expect(musicRms).toBeLessThan(effectRms);
		await musicContext.close();
	});

	test('QA R3 botão Música liga e desliga de verdade e persiste', async ({ page }) => {
		const errors = collectErrors(page);
		await instrumentAudio(page, MUSIC_ONLY);
		await page.goto('/jogar?nivel=amador');
		await waitForRunning(page);
		const main = page.locator('main[data-game-status]');
		await expect(main).toHaveAttribute('data-music', 'on');

		await page.getByRole('button', { name: 'Configurações' }).first().click();
		await page.getByRole('switch', { name: /Música/ }).focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('Escape');
		await expect(main).toHaveAttribute('data-music', 'off');
		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await waitForRunning(page);
		await page.waitForTimeout(700);
		const off = await notes(page);
		await page.waitForTimeout(2000);
		expect(await notes(page)).toBe(off);

		await page.reload();
		await waitForRunning(page);
		await page.keyboard.press('a');
		await page.waitForTimeout(2000);
		await expect(main).toHaveAttribute('data-music', 'off');
		expect(await notes(page)).toBe(0);

		await page.getByRole('button', { name: 'Configurações' }).first().click();
		await page.getByRole('switch', { name: /Música/ }).focus();
		await page.keyboard.press('Space');
		await page.keyboard.press('Escape');
		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await waitForRunning(page);
		await expect(main).toHaveAttribute('data-music', 'on');
		await page.waitForTimeout(2000);
		expect(await notes(page)).toBeGreaterThan(0);
		await page.reload();
		await waitForRunning(page);
		await expect(main).toHaveAttribute('data-music', 'on');
		expect(errors).toEqual([]);
	});

	test('QA R3 pausa, aba oculta e retomada', async ({ page }) => {
		const errors = collectErrors(page);
		await instrumentAudio(page, MUSIC_ONLY);
		await page.goto('/jogar?nivel=amador');
		await waitForRunning(page);
		const main = page.locator('main[data-game-status]');
		await page.waitForTimeout(1500);

		await page.evaluate((): void => {
			Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
			document.dispatchEvent(new Event('visibilitychange'));
		});
		await expect(main).toHaveAttribute('data-game-status', 'paused');
		await expect(main).toHaveAttribute('data-music', 'off');
		await page.waitForTimeout(500);
		const hidden = await notes(page);
		await page.waitForTimeout(2000);
		expect(await notes(page)).toBe(hidden);

		await page.evaluate((): void => {
			Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
			document.dispatchEvent(new Event('visibilitychange'));
		});
		await expect(main).toHaveAttribute('data-game-status', 'paused');
		await page.getByRole('button', { name: 'Continuar' }).first().click();
		await expect(main).toHaveAttribute('data-music', 'on');
		await page.waitForTimeout(2500);
		expect(await notes(page)).toBeGreaterThan(hidden);
		expect(errors).toEqual([]);
	});

	test('QA R3 combo adiciona camada e últimos 10 s abrem o filtro', async ({ page }) => {
		test.setTimeout(90_000);
		await instrumentAudio(page, MUSIC_ONLY);
		await page.goto('/jogar?nivel=amador');
		await waitForRunning(page);
		const windowMs = 8000;
		const baselineStart = await notes(page);
		await page.waitForTimeout(windowMs);
		const baseline = (await notes(page)) - baselineStart;

		const comboPage = await page.context().newPage();
		await instrumentAudio(comboPage, MUSIC_ONLY);
		await comboPage.goto('/jogar?nivel=amador');
		await waitForRunning(comboPage);
		const comboStart = await notes(comboPage);
		const comboBegin = Date.now();
		for (let index = 0; index < 3; index += 1) {
			await comboPage.keyboard.type(await currentWord(comboPage), { delay: 30 });
			await comboPage.keyboard.press('Enter');
		}
		await comboPage.waitForTimeout(Math.max(0, windowMs - (Date.now() - comboBegin)));
		const combo = (await notes(comboPage)) - comboStart;
		console.log('QA_R3_COMBO', JSON.stringify({ windowMs, baseline, combo }));
		expect(combo).toBeGreaterThan(baseline);
		await comboPage.close();

		const urgentPage = await page.context().newPage();
		await instrumentAudio(urgentPage, MUSIC_ONLY);
		await urgentPage.goto('/jogar?nivel=personalizado&palavras=50&tempo=12');
		await waitForRunning(urgentPage);
		await urgentPage.waitForTimeout(3500);
		const targets = (await stats(urgentPage)).filterTargets;
		console.log('QA_R3_FILTRO', JSON.stringify(targets));
		expect(targets).toContain(9000);
		await urgentPage.close();
	});

	test('QA R3 resultado para a música e desconecta o barramento', async ({ page }) => {
		const errors = collectErrors(page);
		await instrumentAudio(page, MUSIC_ONLY);
		await page.goto('/jogar?nivel=iniciante');
		await waitForRunning(page);
		await page.waitForTimeout(1200);
		for (let index = 0; index < 10; index += 1) {
			await page.keyboard.type(await currentWord(page), { delay: 30 });
			await page.keyboard.press('Enter');
		}
		await expect(page.getByRole('dialog')).toBeVisible();
		await expect(page.locator('main[data-game-status]')).toHaveAttribute('data-music', 'off');
		await page.waitForTimeout(600);
		const finished = await notes(page);
		await page.waitForTimeout(2500);
		const after = await stats(page);
		expect(after.oscillators + after.sources).toBe(finished);
		expect(after.busDisconnects).toBeGreaterThanOrEqual(1);
		const tail = samplesBetween(after.samples, after.samples.at(-1)!.at - 1000, Infinity);
		const tailPeak = Math.max(...tail.map((sample) => sample.peak));
		console.log('QA_R3_RESULTADO', JSON.stringify({ disconnects: after.busDisconnects, tailPeak }));
		expect(tailPeak).toBeLessThan(0.001);
		expect(errors).toEqual([]);
	});

	test('QA R3 trocar de rota várias vezes não acumula timers nem contextos', async ({ page }) => {
		test.setTimeout(120_000);
		const errors = collectErrors(page);
		await instrumentAudio(page, MUSIC_ONLY);
		await page.goto('/');
		await page.waitForLoadState('networkidle');
		const readings: number[] = [];

		for (let round = 0; round < 8; round += 1) {
			await page.keyboard.press(String((round % 3) + 1));
			await waitForRunning(page);
			await page.waitForTimeout(1200);
			await page
				.getByRole('button', { name: /^Sair$/ })
				.first()
				.click();
			await page.getByRole('button', { name: 'Sair da partida' }).click();
			await page.waitForURL(/\/$/);
			await page.waitForTimeout(2500);
			readings.push((await stats(page)).activeIntervals);
		}

		const final = await stats(page);
		console.log(
			'QA_R3_ROTAS',
			JSON.stringify({ intervals: readings, contexts: final.contexts, notes: final.oscillators })
		);
		expect(final.contexts).toBe(1);
		expect(new Set(readings.slice(1)).size).toBe(1);
		expect(readings.at(-1)).toBeLessThanOrEqual(readings[0]);
		const quiet = await notes(page);
		await page.waitForTimeout(2000);
		expect(await notes(page)).toBe(quiet);
		expect(errors).toEqual([]);
	});
});
