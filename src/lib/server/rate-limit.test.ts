import { describe, expect, it } from 'vitest';
import { canSubmit } from './rate-limit';

describe('canSubmit', () => {
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
