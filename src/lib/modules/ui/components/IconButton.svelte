<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		label: string;
		pressed?: boolean;
		title?: string;
		children: Snippet;
	}

	let {
		label,
		pressed,
		title,
		children,
		class: className = '',
		type = 'button',
		...rest
	}: Props = $props();
</script>

<button
	{...rest}
	{type}
	aria-label={label}
	aria-pressed={pressed}
	title={title ?? label}
	class="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition-colors duration-150 hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50 {className}"
>
	{@render children()}
</button>
