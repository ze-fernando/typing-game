import { describe, expect, it } from 'vitest';
import { MUSIC_VOLUME, createMusicPlayer, type MusicTimers } from './player';

interface FakeNode {
	kind: string;
	connected: boolean;
	disconnected: boolean;
}

interface FakeAudio {
	context: AudioContext;
	nodes: FakeNode[];
	setTime: (seconds: number) => void;
}

interface FakeParam {
	value: number;
	setValueAtTime: () => FakeParam;
	exponentialRampToValueAtTime: () => FakeParam;
	setTargetAtTime: () => FakeParam;
	cancelScheduledValues: () => FakeParam;
}

function fakeParam(): FakeParam {
	const param: FakeParam = {
		value: 0,
		setValueAtTime: () => param,
		exponentialRampToValueAtTime: () => param,
		setTargetAtTime: () => param,
		cancelScheduledValues: () => param
	};
	return param;
}

function fakeAudio(): FakeAudio {
	let time = 0;
	const nodes: FakeNode[] = [];

	function node(kind: string): Record<string, unknown> {
		const record: FakeNode = { kind, connected: false, disconnected: false };
		nodes.push(record);
		return {
			gain: fakeParam(),
			frequency: fakeParam(),
			detune: fakeParam(),
			type: '',
			buffer: null,
			connect: (): void => {
				record.connected = true;
			},
			disconnect: (): void => {
				record.disconnected = true;
			},
			start: (): void => undefined,
			stop: (): void => undefined
		};
	}

	const context = {
		get currentTime(): number {
			return time;
		},
		sampleRate: 8000,
		createGain: () => node('gain'),
		createBiquadFilter: () => node('filter'),
		createOscillator: () => node('oscillator'),
		createBufferSource: () => node('noise'),
		createBuffer: (_channels: number, length: number) => ({
			getChannelData: () => new Float32Array(length)
		})
	};

	return {
		context: context as unknown as AudioContext,
		nodes,
		setTime: (seconds) => {
			time = seconds;
		}
	};
}

interface FakeTimers extends MusicTimers {
	runIntervals: () => void;
	runLater: () => void;
	activeIntervals: () => number;
}

function fakeTimers(): FakeTimers {
	const intervals = new Map<number, () => void>();
	const later: (() => void)[] = [];
	let nextId = 1;

	return {
		every: (callback) => {
			const id = nextId;
			nextId += 1;
			intervals.set(id, callback);
			return id as unknown as ReturnType<typeof setInterval>;
		},
		clearEvery: (timer) => {
			intervals.delete(timer as unknown as number);
		},
		later: (callback) => {
			later.push(callback);
		},
		runIntervals: () => {
			for (const callback of intervals.values()) callback();
		},
		runLater: () => {
			for (const callback of later.splice(0)) callback();
		},
		activeIntervals: () => intervals.size
	};
}

describe('player de música', () => {
	it('toca abaixo dos efeitos e para sem deixar timer nem nó do barramento conectado', () => {
		const audio = fakeAudio();
		const timers = fakeTimers();
		const player = createMusicPlayer(audio.context, {} as AudioNode, undefined, timers);

		expect(MUSIC_VOLUME).toBeLessThan(1);
		player.start();
		expect(player.isPlaying()).toBe(true);
		expect(timers.activeIntervals()).toBe(1);

		audio.setTime(3);
		timers.runIntervals();
		expect(audio.nodes.filter((node) => node.kind === 'oscillator').length).toBeGreaterThan(0);

		player.stop();
		expect(player.isPlaying()).toBe(false);
		expect(timers.activeIntervals()).toBe(0);

		timers.runLater();
		const bus = audio.nodes.slice(0, 2);
		expect(bus.map((node) => node.kind)).toEqual(['gain', 'filter']);
		expect(bus.every((node) => node.disconnected)).toBe(true);
	});

	it('liga e desliga várias vezes com um único agendador ativo', () => {
		const audio = fakeAudio();
		const timers = fakeTimers();
		const player = createMusicPlayer(audio.context, {} as AudioNode, undefined, timers);

		for (let round = 0; round < 5; round += 1) {
			player.start();
			player.start();
			expect(timers.activeIntervals()).toBe(1);
			audio.setTime(round + 1);
			timers.runIntervals();
			player.stop();
			expect(timers.activeIntervals()).toBe(0);
		}
	});
});
