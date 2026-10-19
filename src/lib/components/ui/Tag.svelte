<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		tone?: 'neutral' | 'success' | 'danger' | 'warning';
	}

	let { children, tone = 'neutral' }: Props = $props();

	const tones = {
		neutral: 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)]',
		success: 'border-transparent bg-[var(--success-soft)] text-[var(--success)]',
		danger: 'border-transparent bg-[var(--danger-soft)] text-[var(--danger)]',
		warning: 'border-transparent bg-[var(--warning-soft)] text-[var(--warning)]'
	};
</script>

<span
	class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold {tones[
		tone
	]}"
>
	{@render children()}
</span>
