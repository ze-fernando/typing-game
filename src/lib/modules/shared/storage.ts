export function readStorage(key: string): Promise<string | null> {
	return Promise.resolve()
		.then(() => (typeof window === 'undefined' ? null : window.localStorage.getItem(key)))
		.catch(() => null);
}

export function writeStorage(key: string, value: string | null): Promise<boolean> {
	return Promise.resolve()
		.then(() => {
			if (typeof window === 'undefined') return false;
			if (value === null) window.localStorage.removeItem(key);
			else window.localStorage.setItem(key, value);
			return true;
		})
		.catch(() => false);
}
