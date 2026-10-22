import type { BarRef, MusicMood, NoteEvent, Song } from './types';

const ARP_STEP_SPACING = 2;
const COMBO_HATS = [3, 11];

export function midiToFrequency(midi: number): number {
	return 440 * 2 ** ((midi - 69) / 12);
}

export function secondsPerStep(song: Song): number {
	return 60 / song.bpm / 4;
}

export function songBars(song: Song): BarRef[] {
	return song.arrangement.flatMap((id) => {
		const section = song.sections[id];
		return section.chords.map((chordName, barInSection) => ({
			section,
			chord: song.chords[chordName],
			chordName,
			barInSection
		}));
	});
}

export function loopStartBar(song: Song): number {
	return song.arrangement
		.slice(0, song.loopFrom)
		.reduce((total, id) => total + song.sections[id].chords.length, 0);
}

export function barAt(song: Song, index: number): BarRef {
	const bars = songBars(song);
	if (index < bars.length) return bars[Math.max(0, index)];

	const loopStart = loopStartBar(song);
	const loopLength = bars.length - loopStart;
	return bars[loopStart + ((index - bars.length) % loopLength)];
}

function percussion(
	instrument: NoteEvent['instrument'],
	steps: readonly number[],
	velocity: number
): NoteEvent[] {
	return steps.map((step) => ({ instrument, step, midi: 0, length: 1, velocity }));
}

function arpeggio(
	bar: BarRef,
	velocity: number,
	octave: number,
	pattern: readonly number[]
): NoteEvent[] {
	return pattern.map((toneIndex, index) => ({
		instrument: 'arp',
		step: index * ARP_STEP_SPACING,
		midi: bar.chord.tones[toneIndex % bar.chord.tones.length] + octave,
		length: ARP_STEP_SPACING,
		velocity: index % 4 === 0 ? velocity : velocity * 0.75
	}));
}

export function barEvents(song: Song, bar: BarRef, mood: MusicMood): NoteEvent[] {
	const { section, chord } = bar;
	const pad: NoteEvent[] = chord.tones.map((midi) => ({
		instrument: 'pad',
		step: 0,
		midi,
		length: song.stepsPerBar,
		velocity: 0.8
	}));
	const bass: NoteEvent[] = section.bass.map((note) => ({
		instrument: 'bass',
		step: note.step,
		midi: chord.bass,
		length: note.length,
		velocity: note.velocity
	}));
	const arp =
		section.arp.length > 0
			? arpeggio(bar, 0.8, section.arpOctave, section.arp)
			: mood.combo
				? arpeggio(bar, 0.45, 12, [0, 2, 1, 3, 2, 1, 3, 2])
				: [];
	const bell: NoteEvent[] = section.bell
		? [
				{
					instrument: 'bell',
					step: 8,
					midi: chord.tones[chord.tones.length - 1] + 12,
					length: 8,
					velocity: bar.barInSection % 2 === 0 ? 0.7 : 0.5
				}
			]
		: [];
	const hats = mood.combo && section.hat.length > 0 ? [...section.hat, ...COMBO_HATS] : section.hat;

	return [
		...pad,
		...bass,
		...arp,
		...bell,
		...percussion('kick', section.kick, 1),
		...percussion('snare', section.snare, 0.8),
		...percussion('hat', hats, 0.6)
	].sort((left, right) => left.step - right.step);
}
