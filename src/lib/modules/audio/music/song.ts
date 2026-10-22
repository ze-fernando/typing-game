import type { Song } from './types';

export const SONG: Song = {
	bpm: 88,
	stepsPerBar: 16,
	chords: {
		Am7: { bass: 45, tones: [57, 60, 64, 67] },
		Fmaj7: { bass: 41, tones: [53, 57, 60, 64] },
		Cmaj7: { bass: 36, tones: [55, 59, 60, 64] },
		Em7: { bass: 40, tones: [52, 55, 59, 62] },
		Dm7: { bass: 38, tones: [50, 53, 57, 60] },
		G6: { bass: 43, tones: [55, 59, 62, 64] }
	},
	sections: {
		intro: {
			id: 'intro',
			chords: ['Am7', 'Fmaj7', 'Cmaj7', 'Em7'],
			bass: [{ step: 0, length: 16, velocity: 0.7 }],
			arp: [],
			arpOctave: 12,
			bell: true,
			kick: [],
			snare: [],
			hat: []
		},
		groove: {
			id: 'groove',
			chords: ['Am7', 'Fmaj7', 'Cmaj7', 'Em7', 'Am7', 'Fmaj7', 'Cmaj7', 'Em7'],
			bass: [
				{ step: 0, length: 6, velocity: 0.9 },
				{ step: 6, length: 2, velocity: 0.55 },
				{ step: 8, length: 4, velocity: 0.75 },
				{ step: 14, length: 2, velocity: 0.5 }
			],
			arp: [0, 2, 1, 3, 2, 1, 3, 2],
			arpOctave: 12,
			bell: false,
			kick: [0, 7, 10],
			snare: [4, 12],
			hat: [2, 6, 10, 14]
		},
		lift: {
			id: 'lift',
			chords: ['Dm7', 'Fmaj7', 'Cmaj7', 'G6'],
			bass: [
				{ step: 0, length: 4, velocity: 0.9 },
				{ step: 4, length: 2, velocity: 0.6 },
				{ step: 8, length: 4, velocity: 0.8 },
				{ step: 12, length: 2, velocity: 0.6 },
				{ step: 14, length: 2, velocity: 0.55 }
			],
			arp: [0, 1, 2, 3, 3, 2, 1, 2],
			arpOctave: 24,
			bell: false,
			kick: [0, 8, 10],
			snare: [4, 12],
			hat: [2, 6, 7, 10, 14, 15]
		},
		breakdown: {
			id: 'breakdown',
			chords: ['Fmaj7', 'Em7', 'Dm7', 'Em7'],
			bass: [
				{ step: 0, length: 8, velocity: 0.65 },
				{ step: 8, length: 8, velocity: 0.55 }
			],
			arp: [],
			arpOctave: 12,
			bell: true,
			kick: [0],
			snare: [],
			hat: []
		}
	},
	arrangement: ['intro', 'groove', 'lift', 'groove', 'breakdown'],
	loopFrom: 1
};
