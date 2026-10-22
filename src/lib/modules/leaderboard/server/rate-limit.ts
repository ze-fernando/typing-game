const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const MAX_CLIENTS = 10_000;
const submissions = new Map<string, number[]>();

export function canSubmit(ip: string): boolean {
	const now = Date.now();
	for (const [client, timestamps] of submissions) {
		if (timestamps.every((timestamp) => now - timestamp >= WINDOW_MS)) submissions.delete(client);
	}
	if (!submissions.has(ip) && submissions.size >= MAX_CLIENTS) return false;
	const recent = (submissions.get(ip) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);

	if (recent.length >= MAX_REQUESTS) {
		submissions.set(ip, recent);
		return false;
	}

	recent.push(now);
	submissions.set(ip, recent);

	return true;
}
