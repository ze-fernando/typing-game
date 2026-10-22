import { afterEach, describe, expect, it, vi } from 'vitest';
import { readStorage, writeStorage } from './storage';

afterEach(() => vi.unstubAllGlobals());

describe('optional storage', () => {
	it('recovers when even reading localStorage is forbidden', async () => {
		vi.stubGlobal(
			'window',
			Object.defineProperty({}, 'localStorage', {
				get() {
					throw new Error('blocked');
				}
			})
		);
		expect(await readStorage('key')).toBeNull();
		expect(await writeStorage('key', 'value')).toBe(false);
	});
	it('recovers from quota errors', async () => {
		vi.stubGlobal('window', {
			localStorage: {
				setItem() {
					throw new Error('quota');
				}
			}
		});
		expect(await writeStorage('key', 'value')).toBe(false);
	});
});
