import { describe, expect, it } from 'vitest';
import { keyboardTier, visibleKeyboardRows } from './keyboard-tiers';

function codes(tier: Parameters<typeof visibleKeyboardRows>[0]): string[] {
	return visibleKeyboardRows(tier).flatMap((row) => row.keys.map((key) => key.code));
}

describe('faixas do teclado virtual', () => {
	it('escolhe a faixa pela largura', () => {
		expect(keyboardTier(true, true)).toBe('compact');
		expect(keyboardTier(false, true)).toBe('medium');
		expect(keyboardTier(false, false)).toBe('full');
	});

	it('viewport baixo usa o compacto mesmo com largura de tablet ou desktop', () => {
		expect(keyboardTier(false, false, true)).toBe('compact');
		expect(keyboardTier(false, true, true)).toBe('compact');
		expect(keyboardTier(false, false, false)).toBe('full');
	});

	it('o compacto mantém letras, acentos e ações', () => {
		const visible = visibleKeyboardRows('compact');
		const keys = visible.flatMap((row) => row.keys.map((key) => key.code));
		expect(keys).toContain('KeyQ');
		expect(keys).toContain('KeyA');
		expect(keys).toContain('KeyZ');
		expect(keys.some((code) => code.startsWith('F') && code !== 'Fn')).toBe(false);
		expect(keys).not.toContain('Digit1');
	});

	it('entre 640 e 767 px não renderiza teclas escondidas, logo não há tabstop invisível', () => {
		const medium = codes('medium');
		expect(medium).not.toContain('Escape');
		expect(medium).not.toContain('F1');
		expect(medium).not.toContain('ArrowLeft');
		expect(visibleKeyboardRows('medium')[0].keys[0].code).toBe('Backquote');
	});

	it('no compacto mostra só letras; no completo, tudo', () => {
		expect(codes('compact').every((code) => code.startsWith('Key'))).toBe(true);
		expect(codes('full')).toContain('F12');
	});
});
