import type { KeyboardRow } from './types';

function letter(code: string, label: string, secondary?: string) {
	return {
		code,
		label,
		secondary,
		kind: 'letter' as const,
		input: label.toLowerCase()
	};
}

function key(
	code: string,
	label: string,
	options: {
		secondary?: string;
		width?: number;
		kind?: KeyboardRow['keys'][number]['kind'];
		input?: string;
		ariaLabel?: string;
	} = {}
) {
	return {
		code,
		label,
		secondary: options.secondary,
		width: options.width,
		kind: options.kind,
		input: options.input,
		ariaLabel: options.ariaLabel
	};
}

const functionRow: KeyboardRow = {
	id: 'function',
	mobileHidden: true,
	keys: [
		key('Escape', 'Esc', { width: 1.15 }),
		key('F1', 'F1', { kind: 'function' }),
		key('F2', 'F2', { kind: 'function' }),
		key('F3', 'F3', { kind: 'function' }),
		key('F4', 'F4', { kind: 'function' }),
		key('F5', 'F5', { kind: 'function' }),
		key('F6', 'F6', { kind: 'function' }),
		key('F7', 'F7', { kind: 'function' }),
		key('F8', 'F8', { kind: 'function' }),
		key('F9', 'F9', { kind: 'function' }),
		key('F10', 'F10', { kind: 'function' }),
		key('F11', 'F11', { kind: 'function' }),
		key('F12', 'F12', { kind: 'function' }),
		key('PrintScreen', 'PrtSc', { kind: 'function' }),
		key('Delete', 'Del', { kind: 'function' })
	]
};

const numberRow: KeyboardRow = {
	id: 'numbers',
	keys: [
		key('Backquote', "'", { secondary: '"', input: "'", kind: 'symbol' }),
		key('Digit1', '1', { secondary: '!', input: '1', kind: 'number' }),
		key('Digit2', '2', { secondary: '@', input: '2', kind: 'number' }),
		key('Digit3', '3', { secondary: '#', input: '3', kind: 'number' }),
		key('Digit4', '4', { secondary: '$', input: '4', kind: 'number' }),
		key('Digit5', '5', { secondary: '%', input: '5', kind: 'number' }),
		key('Digit6', '6', { secondary: '¨', input: '6', kind: 'number' }),
		key('Digit7', '7', { secondary: '&', input: '7', kind: 'number' }),
		key('Digit8', '8', { secondary: '*', input: '8', kind: 'number' }),
		key('Digit9', '9', { secondary: '(', input: '9', kind: 'number' }),
		key('Digit0', '0', { secondary: ')', input: '0', kind: 'number' }),
		key('Minus', '-', { secondary: '_', input: '-', kind: 'symbol' }),
		key('Equal', '=', { secondary: '+', input: '=', kind: 'symbol' }),
		key('Backspace', 'Backspace', { width: 2.1, kind: 'backspace' })
	]
};

const topLetterRow: KeyboardRow = {
	id: 'top-letters',
	keys: [
		key('Tab', 'Tab', { width: 1.55, kind: 'tab' }),
		letter('KeyQ', 'Q'),
		letter('KeyW', 'W'),
		letter('KeyE', 'E'),
		letter('KeyR', 'R'),
		letter('KeyT', 'T'),
		letter('KeyY', 'Y'),
		letter('KeyU', 'U'),
		letter('KeyI', 'I'),
		letter('KeyO', 'O'),
		letter('KeyP', 'P'),
		key('BracketLeft', '´', {
			secondary: '`',
			kind: 'accent',
			ariaLabel: 'Tecla de acento agudo e crase'
		}),
		key('BracketRight', '[', { secondary: '{', input: '[', kind: 'symbol' })
	]
};

const homeLetterRow: KeyboardRow = {
	id: 'home-letters',
	keys: [
		key('CapsLock', 'Caps', { width: 1.7, kind: 'caps' }),
		letter('KeyA', 'A'),
		letter('KeyS', 'S'),
		letter('KeyD', 'D'),
		letter('KeyF', 'F'),
		letter('KeyG', 'G'),
		letter('KeyH', 'H'),
		letter('KeyJ', 'J'),
		letter('KeyK', 'K'),
		letter('KeyL', 'L'),
		key('Semicolon', 'Ç', {
			secondary: ';',
			kind: 'accent',
			ariaLabel: 'Tecla Ç'
		}),
		key('Quote', '~', {
			secondary: '^',
			kind: 'accent',
			ariaLabel: 'Tecla de til e circunflexo'
		}),
		key('Backslash', ']', { secondary: '}', input: ']', kind: 'symbol' }),
		key('Enter', 'Enter', { width: 1.8, kind: 'enter' })
	]
};

const bottomLetterRow: KeyboardRow = {
	id: 'bottom-letters',
	keys: [
		key('ShiftLeft', 'Shift', { width: 2.15, kind: 'shift' }),
		key('IntlBackslash', '\\', { secondary: '|', input: '\\', kind: 'symbol' }),
		letter('KeyZ', 'Z'),
		letter('KeyX', 'X'),
		letter('KeyC', 'C'),
		letter('KeyV', 'V'),
		letter('KeyB', 'B'),
		letter('KeyN', 'N'),
		letter('KeyM', 'M'),
		key('Comma', ',', { secondary: '<', input: ',', kind: 'symbol' }),
		key('Period', '.', { secondary: '>', input: '.', kind: 'symbol' }),
		key('Slash', '/', { secondary: '?', input: '/', kind: 'symbol' }),
		key('ShiftRight', 'Shift', { width: 2.15, kind: 'shift' })
	]
};

const bottomRow: KeyboardRow = {
	id: 'bottom',
	keys: [
		key('ControlLeft', 'Ctrl', { width: 1.25, kind: 'modifier' }),
		key('MetaLeft', 'Win', { width: 1.15, kind: 'modifier' }),
		key('AltLeft', 'Alt', { width: 1.2, kind: 'modifier' }),
		key('Space', 'Espaço', { width: 6.2, kind: 'space' }),
		key('AltRight', 'AltGr', { width: 1.35, kind: 'modifier' }),
		key('Fn', 'Fn', { width: 1.1, kind: 'modifier' }),
		key('ControlRight', 'Ctrl', { width: 1.25, kind: 'modifier' }),
		{ ...key('ArrowLeft', '←', { width: 1, kind: 'modifier' }), mobileHidden: true },
		{ ...key('ArrowUp', '↑', { width: 1, kind: 'modifier' }), mobileHidden: true },
		{ ...key('ArrowDown', '↓', { width: 1, kind: 'modifier' }), mobileHidden: true },
		{ ...key('ArrowRight', '→', { width: 1, kind: 'modifier' }), mobileHidden: true }
	]
};

export const KEYBOARD_ROWS: KeyboardRow[] = [
	functionRow,
	numberRow,
	topLetterRow,
	homeLetterRow,
	bottomLetterRow,
	bottomRow
];

export const ACCENT_OPTIONS: Record<string, string[]> = {
	BracketLeft: ['á', 'à', 'â', 'ã', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú', 'ü'],
	Quote: ['ã', 'õ', 'â', 'ê', 'ô'],
	Semicolon: ['ç', 'Ç'],
	Backquote: ["'", '"']
};

export function getInputForCode(code: string): string | null {
	for (const row of KEYBOARD_ROWS) {
		const found = row.keys.find((item) => item.code === code);
		if (found?.input) return found.input;
	}

	return null;
}
