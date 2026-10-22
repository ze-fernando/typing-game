export type Instrument = 'bass' | 'pad' | 'arp' | 'bell' | 'kick' | 'snare' | 'hat';

export type ChordName = 'Am7' | 'Fmaj7' | 'Cmaj7' | 'Em7' | 'Dm7' | 'G6';

export type SectionId = 'intro' | 'groove' | 'lift' | 'breakdown';

export interface Chord {
	bass: number;
	tones: readonly number[];
}

export interface PatternNote {
	step: number;
	length: number;
	velocity: number;
}

export interface Section {
	id: SectionId;
	chords: readonly ChordName[];
	bass: readonly PatternNote[];
	arp: readonly number[];
	arpOctave: number;
	bell: boolean;
	kick: readonly number[];
	snare: readonly number[];
	hat: readonly number[];
}

export interface Song {
	bpm: number;
	stepsPerBar: number;
	chords: Record<ChordName, Chord>;
	sections: Record<SectionId, Section>;
	arrangement: readonly SectionId[];
	loopFrom: number;
}

export interface BarRef {
	section: Section;
	chord: Chord;
	chordName: ChordName;
	barInSection: number;
}

export interface NoteEvent {
	instrument: Instrument;
	step: number;
	midi: number;
	length: number;
	velocity: number;
}

export interface MusicMood {
	combo: boolean;
	urgent: boolean;
}
