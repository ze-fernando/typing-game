import { browser } from '$app/env';
import { settings, settingsStatus } from '#lib/modules/settings/settings.svelte';
import { createMusicPlayer, type MusicPlayer } from './music/player';
import { musicState } from './music/state.svelte';
import type { MusicMood } from './music/types';

type SupportedWindow = Window &
	typeof globalThis & {
		webkitAudioContext?: typeof AudioContext;
	};

let context: AudioContext | null = null;
let music: MusicPlayer | null = null;

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

function effectsEnabled(): boolean {
	return settingsStatus.hydrated && settings.effects;
}

export function unlockAudio(): void {
	getContext();
}

export function playKeyClick(): void {
	if (!effectsEnabled()) return;

	tone(210 + Math.random() * 70, 0.045, {
		type: 'triangle',
		volume: 0.035,
		endFrequency: 140
	});
}

export function playTypingError(): void {
	if (!effectsEnabled()) return;

	tone(155, 0.16, { type: 'sawtooth', volume: 0.05, endFrequency: 95 });
}

export function playTypingSuccess(): void {
	if (!effectsEnabled()) return;

	tone(620, 0.09, { type: 'sine', volume: 0.045 });
	tone(880, 0.12, { type: 'sine', volume: 0.035, delay: 0.06 });
}

export function playCountdown(value: number): void {
	if (!effectsEnabled()) return;

	tone(value > 0 ? 420 : 720, value > 0 ? 0.09 : 0.2, {
		type: 'sine',
		volume: 0.05
	});
}

export function playFinish(): void {
	if (!effectsEnabled()) return;

	tone(523.25, 0.16, { type: 'sine', volume: 0.05 });
	tone(659.25, 0.16, { type: 'sine', volume: 0.045, delay: 0.12 });
	tone(783.99, 0.28, { type: 'sine', volume: 0.045, delay: 0.24 });
}

export function startMusic(): void {
	if (!browser || !settings.music || !settingsStatus.hydrated) return;

	const audio = getContext();
	if (!audio) return;

	music ??= createMusicPlayer(audio, audio.destination);
	music.start();
	musicState.playing = true;
}

export function stopMusic(): void {
	music?.stop();
	musicState.playing = false;
}

export function setMusicMood(mood: MusicMood): void {
	music?.setMood(mood);
}
