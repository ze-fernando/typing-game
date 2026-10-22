import { KEYBOARD_ROWS } from '#lib/modules/game/keyboard-layout';
import type { KeyboardRow } from '#lib/modules/game/types';

export type KeyboardTier = 'compact' | 'medium' | 'full';

const COMPACT_ROW_IDS = ['top-letters', 'home-letters', 'bottom-letters'];

export function keyboardTier(
	isCompact: boolean,
	isMedium: boolean,
	isShortViewport = false
): KeyboardTier {
	if (isCompact || isShortViewport) return 'compact';
	return isMedium ? 'medium' : 'full';
}

export function visibleKeyboardRows(tier: KeyboardTier): KeyboardRow[] {
	if (tier === 'compact') {
		return KEYBOARD_ROWS.filter((row) => COMPACT_ROW_IDS.includes(row.id)).map((row) => ({
			...row,
			keys: row.keys.filter((key) => key.kind === 'letter')
		}));
	}

	if (tier === 'medium') {
		return KEYBOARD_ROWS.filter((row) => !row.mobileHidden).map((row) => ({
			...row,
			keys: row.keys.filter((key) => !key.mobileHidden)
		}));
	}

	return KEYBOARD_ROWS;
}
