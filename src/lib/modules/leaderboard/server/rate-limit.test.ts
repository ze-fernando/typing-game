import { describe, expect, it, vi } from 'vitest';
import { canSubmit } from './rate-limit';

describe('canSubmit', () => {
	it('libera um cliente após expirar a janela', () => {
		const clock = vi.spyOn(Date, 'now');
		clock.mockReturnValue(100_000);
		for (let index = 0; index < 5; index += 1) expect(canSubmit('expiry-test')).toBe(true);
		expect(canSubmit('expiry-test')).toBe(false);
		clock.mockReturnValue(160_001);
		expect(canSubmit('expiry-test')).toBe(true);
		clock.mockRestore();
	});
	it('permite até 5 envios por janela', () => {
		const ip = `test-permite-${Date.now()}`;

		expect(canSubmit(ip)).toBe(true);
		expect(canSubmit(ip)).toBe(true);
		expect(canSubmit(ip)).toBe(true);
		expect(canSubmit(ip)).toBe(true);
		expect(canSubmit(ip)).toBe(true);
	});

	it('bloqueia o sexto envio seguido', () => {
		const ip = `test-bloqueia-${Date.now()}`;

		for (let index = 0; index < 5; index += 1) {
			expect(canSubmit(ip)).toBe(true);
		}

		expect(canSubmit(ip)).toBe(false);
	});

	it('isola o limite por IP', () => {
		const first = `test-a-${Date.now()}`;
		const second = `test-b-${Date.now()}`;

		for (let index = 0; index < 5; index += 1) {
			canSubmit(first);
		}

		expect(canSubmit(first)).toBe(false);
		expect(canSubmit(second)).toBe(true);
	});
});
