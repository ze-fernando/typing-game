import { createNoiseBuffer, playVoice, type VoiceTarget } from './instruments';
import { barAt, barEvents, secondsPerStep } from './patterns';
import { createStepScheduler, type SchedulerClock, type ScheduledStep } from './scheduler';
import { SONG } from './song';
import type { MusicMood, NoteEvent, Song } from './types';

export interface MusicPlayer {
	start: () => void;
	stop: () => void;
	setMood: (mood: MusicMood) => void;
	isPlaying: () => boolean;
}

export interface MusicTimers {
	every: (callback: () => void, ms: number) => ReturnType<typeof setInterval>;
	clearEvery: (timer: ReturnType<typeof setInterval>) => void;
	later: (callback: () => void, ms: number) => void;
}

interface Bus {
	gain: GainNode;
	filter: BiquadFilterNode;
}

export const MUSIC_VOLUME = 0.28;
const FADE_IN_SECONDS = 1.6;
const FADE_OUT_SECONDS = 0.5;
const CALM_CUTOFF = 2400;
const URGENT_CUTOFF = 9000;
const START_DELAY_SECONDS = 0.08;

const browserTimers: MusicTimers = {
	every: (callback, ms) => setInterval(callback, ms),
	clearEvery: (timer) => clearInterval(timer),
	later: (callback, ms) => {
		setTimeout(callback, ms);
	}
};

export function createMusicPlayer(
	context: AudioContext,
	destination: AudioNode,
	song: Song = SONG,
	timers: MusicTimers = browserTimers
): MusicPlayer {
	const stepSeconds = secondsPerStep(song);
	const noise = createNoiseBuffer(context);
	let bus: Bus | null = null;
	let mood: MusicMood = { combo: false, urgent: false };
	let resumeBar = 0;
	let currentBar = -1;
	let currentEvents: NoteEvent[] = [];

	const clock: SchedulerClock = {
		now: () => context.currentTime,
		every: timers.every,
		stop: timers.clearEvery
	};

	function eventsFor(bar: number): NoteEvent[] {
		if (bar !== currentBar) {
			currentBar = bar;
			currentEvents = barEvents(song, barAt(song, bar), mood);
		}
		return currentEvents;
	}

	function handleStep(scheduled: ScheduledStep): void {
		if (!bus) return;
		const target: VoiceTarget = { context, output: bus.filter, noise };
		for (const event of eventsFor(scheduled.bar)) {
			if (event.step === scheduled.step) playVoice(target, event, scheduled.time, stepSeconds);
		}
	}

	const scheduler = createStepScheduler({
		clock,
		secondsPerStep: stepSeconds,
		stepsPerBar: song.stepsPerBar,
		onStep: handleStep
	});

	function cutoff(): number {
		return mood.urgent ? URGENT_CUTOFF : CALM_CUTOFF;
	}

	function createBus(): Bus {
		const gain = context.createGain();
		const filter = context.createBiquadFilter();
		const now = context.currentTime;
		filter.type = 'lowpass';
		filter.frequency.setValueAtTime(cutoff(), now);
		filter.connect(gain);
		gain.gain.setValueAtTime(0.0001, now);
		gain.gain.exponentialRampToValueAtTime(MUSIC_VOLUME, now + FADE_IN_SECONDS);
		gain.connect(destination);
		return { gain, filter };
	}

	function releaseBus(old: Bus): void {
		old.gain.gain.cancelScheduledValues(context.currentTime);
		old.gain.gain.setTargetAtTime(0.0001, context.currentTime, FADE_OUT_SECONDS / 4);
		timers.later(
			() => {
				old.filter.disconnect();
				old.gain.disconnect();
			},
			(FADE_OUT_SECONDS + 1.5) * 1000
		);
	}

	function start(): void {
		if (scheduler.isRunning()) return;
		bus = createBus();
		currentBar = -1;
		scheduler.start(resumeBar, context.currentTime + START_DELAY_SECONDS);
	}

	function stop(): void {
		if (!scheduler.isRunning()) return;
		resumeBar = scheduler.stop();
		if (bus) releaseBus(bus);
		bus = null;
	}

	function setMood(next: MusicMood): void {
		if (next.combo === mood.combo && next.urgent === mood.urgent) return;
		mood = next;
		bus?.filter.frequency.setTargetAtTime(cutoff(), context.currentTime, 0.8);
	}

	return { start, stop, setMood, isPlaying: () => scheduler.isRunning() };
}
