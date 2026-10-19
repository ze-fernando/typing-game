import { browser } from '$app/env';
import { settings } from '#lib/stores/settings.svelte';

type SupportedWindow = Window &
	typeof globalThis & {
		webkitAudioContext?: typeof AudioContext;
	};

let context: AudioContext | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;
let musicPlaying = false;

function getContext(): AudioContext | null {
	if (!browser) return null;

	if (!context) {
		const AudioContextConstructor =
			window.AudioContext ?? (window as SupportedWindow).webkitAudioContext;

		if (!AudioContextConstructor) return null;
		context = new AudioContextConstructor();
	}

	if (context.state === 'suspended') {
		void context.resume().catch(() => undefined);
	}

	return context;
}

function tone(
	frequency: number,
	duration: number,
	options: { type?: OscillatorType; volume?: number; delay?: number; endFrequency?: number } = {}
): void {
	const audio = getContext();
	if (!audio) return;

	const start = audio.currentTime + (options.delay ?? 0);
	const oscillator = audio.createOscillator();
	const gain = audio.createGain();
	const volume = options.volume ?? 0.05;

	oscillator.type = options.type ?? 'sine';
	oscillator.frequency.setValueAtTime(frequency, start);
	if (options.endFrequency) {
		oscillator.frequency.exponentialRampToValueAtTime(options.endFrequency, start + duration);
	}

	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

	oscillator.connect(gain);
	gain.connect(audio.destination);
	oscillator.start(start);
	oscillator.stop(start + duration + 0.02);
}

export function unlockAudio(): void {
	getContext();
}

export function playKeyClick(): void {
	if (!settings.effects) return;

	tone(210 + Math.random() * 70, 0.045, {
		type: 'triangle',
		volume: 0.035,
		endFrequency: 140
	});
}

export function playTypingError(): void {
	if (!settings.effects) return;

	tone(155, 0.16, { type: 'sawtooth', volume: 0.05, endFrequency: 95 });
}

export function playTypingSuccess(): void {
	if (!settings.effects) return;

	tone(620, 0.09, { type: 'sine', volume: 0.045 });
	tone(880, 0.12, { type: 'sine', volume: 0.035, delay: 0.06 });
}

export function playCountdown(value: number): void {
	if (!settings.effects) return;

	tone(value > 0 ? 420 : 720, value > 0 ? 0.09 : 0.2, {
		type: 'sine',
		volume: 0.05
	});
}

export function playFinish(): void {
	if (!settings.effects) return;

	tone(523.25, 0.16, { type: 'sine', volume: 0.05 });
	tone(659.25, 0.16, { type: 'sine', volume: 0.045, delay: 0.12 });
	tone(783.99, 0.28, { type: 'sine', volume: 0.045, delay: 0.24 });
}

function ambientNote(frequency: number, delay = 0): void {
	const audio = getContext();
	if (!audio || !musicGain) return;

	const start = audio.currentTime + delay;
	const oscillator = audio.createOscillator();
	const gain = audio.createGain();

	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime(frequency, start);
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(0.5, start + 1.4);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + 5.2);

	oscillator.connect(gain);
	gain.connect(musicGain);
	oscillator.start(start);
	oscillator.stop(start + 5.3);
}

export function startMusic(): void {
	if (!browser || !settings.music || musicPlaying) return;

	const audio = getContext();
	if (!audio) return;

	musicPlaying = true;
	musicGain = audio.createGain();
	musicGain.gain.setValueAtTime(0.0001, audio.currentTime);
	musicGain.gain.exponentialRampToValueAtTime(0.045, audio.currentTime + 1.5);
	musicGain.connect(audio.destination);

	const notes = [110, 164.81, 220, 246.94, 329.63, 220, 164.81, 130.81];
	let index = 0;

	ambientNote(notes[index]);
	index = (index + 1) % notes.length;

	musicTimer = setInterval(() => {
		if (!musicPlaying) return;
		ambientNote(notes[index], 0);
		index = (index + 1) % notes.length;
	}, 2600);
}

export function stopMusic(): void {
	if (musicTimer) {
		clearInterval(musicTimer);
		musicTimer = null;
	}

	musicPlaying = false;

	if (context && musicGain) {
		musicGain.gain.setTargetAtTime(0.0001, context.currentTime, 0.25);
		musicGain = null;
	}
}

export function suspendAudio(): void {
	stopMusic();
	if (context?.state === 'running') {
		void context.suspend().catch(() => undefined);
	}
}
