<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

	interface Props {
		children: Snippet;
		tone?: Tone;
		class?: string;
	}

	let { children, tone = 'neutral', class: className = '' }: Props = $props();

	const tones: Record<Tone, string> = {
		neutral: '',
		primary: 'border-[var(--primary)]/45 bg-[var(--primary-soft)] text-[var(--primary)]',
		success: 'border-[var(--success)]/45 bg-[var(--success-soft)] text-[var(--success)]',
		warning: 'border-[var(--warning)]/45 bg-[var(--warning-soft)] text-[var(--warning)]',
		danger: 'border-[var(--danger)]/45 bg-[var(--danger-soft)] text-[var(--danger)]'
	};
</script>

<span class="chip {tones[tone]} {className}">{@render children()}</span>
