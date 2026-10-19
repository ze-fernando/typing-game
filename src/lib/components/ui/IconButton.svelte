<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		label: string;
		children: Snippet;
	}

	let { label, children, class: className = '', ...rest }: Props = $props();
</script>

<button
	{...rest}
	aria-label={label}
	title={label}
	class="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text)] active:scale-95 {className}"
>
	{@render children()}
</button>
