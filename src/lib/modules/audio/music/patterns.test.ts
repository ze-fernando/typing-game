import { describe, expect, it } from 'vitest';
import {
	barAt,
	barEvents,
	loopStartBar,
	midiToFrequency,
	secondsPerStep,
	songBars
} from './patterns';
import { SONG } from './song';
import type { MusicMood } from './types';

const CALM: MusicMood = { combo: false, urgent: false };
const A_MINOR_PITCH_CLASSES = new Set([9, 11, 0, 2, 4, 5, 7]);

describe('composição', () => {
	it('usa 88 BPM em semicolcheias', () => {
		expect(SONG.bpm).toBe(88);
		expect(secondsPerStep(SONG)).toBeCloseTo(60 / 88 / 4, 6);
		expect(midiToFrequency(69)).toBe(440);
		expect(midiToFrequency(57)).toBeCloseTo(220, 6);
	});

	it('organiza intro, groove, lift, groove e breakdown em 28 compassos', () => {
		const bars = songBars(SONG);
		expect(bars).toHaveLength(28);
		expect(bars.map((bar) => bar.section.id)).toEqual([
			...Array(4).fill('intro'),
			...Array(8).fill('groove'),
			...Array(4).fill('lift'),
			...Array(8).fill('groove'),
			...Array(4).fill('breakdown')
		]);
		expect(loopStartBar(SONG)).toBe(4);
	});

	it('repete sem emenda a partir do groove, sem voltar à intro', () => {
		const total = songBars(SONG).length;
		expect(barAt(SONG, total).section.id).toBe('groove');
		expect(barAt(SONG, total).barInSection).toBe(0);
		expect(barAt(SONG, total + 24)).toEqual(barAt(SONG, total));
		expect(barAt(SONG, total - 1).section.id).toBe('breakdown');
		for (let index = total; index < total * 3; index += 1) {
			expect(barAt(SONG, index).section.id).not.toBe('intro');
		}
	});

	it('mantém todas as notas na escala de lá menor', () => {
		for (let index = 0; index < songBars(SONG).length; index += 1) {
			for (const event of barEvents(SONG, barAt(SONG, index), { combo: true, urgent: true })) {
				if (event.midi > 0) expect(A_MINOR_PITCH_CLASSES.has(event.midi % 12)).toBe(true);
			}
		}
	});

	it('gera eventos determinísticos dentro do compasso', () => {
		const bar = barAt(SONG, 5);
		const first = barEvents(SONG, bar, CALM);
		expect(barEvents(SONG, bar, CALM)).toEqual(first);
		for (const event of first) {
			expect(event.step).toBeGreaterThanOrEqual(0);
			expect(event.step).toBeLessThan(SONG.stepsPerBar);
			expect(event.velocity).toBeGreaterThan(0);
			expect(event.velocity).toBeLessThanOrEqual(1);
		}
		expect(first.map((event) => event.step)).toEqual(
			[...first.map((event) => event.step)].sort((left, right) => left - right)
		);
	});

	it('a intro só tem pad, baixo e sino, e o groove traz bateria e arpejo', () => {
		const intro = new Set(barEvents(SONG, barAt(SONG, 0), CALM).map((event) => event.instrument));
		expect([...intro].sort()).toEqual(['bass', 'bell', 'pad']);
		const groove = new Set(barEvents(SONG, barAt(SONG, 4), CALM).map((event) => event.instrument));
		expect([...groove].sort()).toEqual(['arp', 'bass', 'hat', 'kick', 'pad', 'snare']);
	});

	it('o combo acrescenta uma camada sem mudar a harmonia', () => {
		const calm = barEvents(SONG, barAt(SONG, 0), CALM);
		const combo = barEvents(SONG, barAt(SONG, 0), { combo: true, urgent: false });
		expect(combo.filter((event) => event.instrument === 'arp').length).toBeGreaterThan(0);
		expect(combo.filter((event) => event.instrument === 'pad')).toEqual(
			calm.filter((event) => event.instrument === 'pad')
		);
		const grooveHats = (mood: MusicMood): number =>
			barEvents(SONG, barAt(SONG, 4), mood).filter((event) => event.instrument === 'hat').length;
		expect(grooveHats({ combo: true, urgent: false })).toBeGreaterThan(grooveHats(CALM));
	});
});
