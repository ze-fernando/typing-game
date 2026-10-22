const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;
const submissions = new Map<string, number[]>();

/**
 * Rate limit best-effort por instância da função serverless.
 * Não é uma garantia global, mas reduz abuso trivial sem adicionar infraestrutura.
 */
export function canSubmit(ip: string): boolean {
	const now = Date.now();
	const recent = (submissions.get(ip) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);

	if (recent.length >= MAX_REQUESTS) {
		submissions.set(ip, recent);
		return false;
	}

	recent.push(now);
	submissions.set(ip, recent);

	return true;
}
