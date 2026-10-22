import { midiToFrequency } from './patterns';
import type { NoteEvent } from './types';

export interface VoiceTarget {
	context: AudioContext;
	output: AudioNode;
	noise: AudioBuffer;
}

const NOISE_SECONDS = 1;

export function createNoiseBuffer(context: AudioContext): AudioBuffer {
	const buffer = context.createBuffer(1, context.sampleRate * NOISE_SECONDS, context.sampleRate);
	const data = buffer.getChannelData(0);
	for (let index = 0; index < data.length; index += 1) data[index] = Math.random() * 2 - 1;
	return buffer;
}

function envelope(
	target: VoiceTarget,
	time: number,
	peak: number,
	attack: number,
	release: number,
	hold = 0
): GainNode {
	const gain = target.context.createGain();
	gain.gain.setValueAtTime(0.0001, time);
	gain.gain.exponentialRampToValueAtTime(peak, time + attack);
	gain.gain.setValueAtTime(peak, time + attack + hold);
	gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + hold + release);
	gain.connect(target.output);
	return gain;
}

function oscillator(
	target: VoiceTarget,
	type: OscillatorType,
	frequency: number,
	destination: AudioNode,
	start: number,
	stop: number,
	detune = 0
): OscillatorNode {
	const node = target.context.createOscillator();
	node.type = type;
	node.frequency.setValueAtTime(frequency, start);
	node.detune.setValueAtTime(detune, start);
	node.connect(destination);
	node.start(start);
	node.stop(stop);
	return node;
}

function lowpass(target: VoiceTarget, frequency: number, destination: AudioNode): BiquadFilterNode {
	const filter = target.context.createBiquadFilter();
	filter.type = 'lowpass';
	filter.frequency.value = frequency;
	filter.connect(destination);
	return filter;
}

function noiseHit(
	target: VoiceTarget,
	time: number,
	type: BiquadFilterType,
	frequency: number,
	peak: number,
	release: number
): void {
	const source = target.context.createBufferSource();
	const filter = target.context.createBiquadFilter();
	filter.type = type;
	filter.frequency.value = frequency;
	source.buffer = target.noise;
	source.connect(filter);
	filter.connect(envelope(target, time, peak, 0.002, release));
	source.start(time);
	source.stop(time + release + 0.05);
}

function playPad(target: VoiceTarget, event: NoteEvent, time: number, duration: number): void {
	const gain = envelope(
		target,
		time,
		0.018 * event.velocity,
		0.6,
		0.9,
		Math.max(0, duration - 0.6)
	);
	const filter = lowpass(target, 1100, gain);
	const frequency = midiToFrequency(event.midi);
	const stop = time + duration + 1;
	oscillator(target, 'sawtooth', frequency, filter, time, stop, -7);
	oscillator(target, 'sawtooth', frequency, filter, time, stop, 7);
}

function playBass(target: VoiceTarget, event: NoteEvent, time: number, duration: number): void {
	const gain = envelope(
		target,
		time,
		0.09 * event.velocity,
		0.01,
		0.12,
		Math.max(0, duration - 0.12)
	);
	const filter = lowpass(target, 520, gain);
	oscillator(target, 'triangle', midiToFrequency(event.midi), filter, time, time + duration + 0.2);
}

function playArp(target: VoiceTarget, event: NoteEvent, time: number): void {
	const gain = envelope(target, time, 0.03 * event.velocity, 0.005, 0.32);
	const filter = lowpass(target, 2600, gain);
	oscillator(target, 'triangle', midiToFrequency(event.midi), filter, time, time + 0.4);
}

function playBell(target: VoiceTarget, event: NoteEvent, time: number): void {
	const gain = envelope(target, time, 0.025 * event.velocity, 0.01, 1.6);
	const frequency = midiToFrequency(event.midi);
	oscillator(target, 'sine', frequency, gain, time, time + 1.7);
	oscillator(target, 'sine', frequency * 2.01, gain, time, time + 0.8);
}

function playKick(target: VoiceTarget, event: NoteEvent, time: number): void {
	const gain = envelope(target, time, 0.12 * event.velocity, 0.004, 0.32);
	const node = oscillator(target, 'sine', 110, gain, time, time + 0.36);
	node.frequency.exponentialRampToValueAtTime(42, time + 0.14);
}

export function playVoice(
	target: VoiceTarget,
	event: NoteEvent,
	time: number,
	secondsPerStep: number
): void {
	const duration = event.length * secondsPerStep;

	if (event.instrument === 'pad') playPad(target, event, time, duration);
	else if (event.instrument === 'bass') playBass(target, event, time, duration);
	else if (event.instrument === 'arp') playArp(target, event, time);
	else if (event.instrument === 'bell') playBell(target, event, time);
	else if (event.instrument === 'kick') playKick(target, event, time);
	else if (event.instrument === 'snare')
		noiseHit(target, time, 'bandpass', 1800, 0.05 * event.velocity, 0.14);
	else noiseHit(target, time, 'highpass', 7200, 0.03 * event.velocity, 0.05);
}
