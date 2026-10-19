<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md' | 'lg';

	interface Props extends HTMLButtonAttributes {
		variant?: Variant;
		size?: Size;
		children: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		children,
		class: className = '',
		...rest
	}: Props = $props();

	const variants: Record<Variant, string> = {
		primary:
			'bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] shadow-lg shadow-black/15',
		secondary:
			'border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:bg-[var(--surface-2)]',
		ghost: 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
		danger: 'bg-[var(--danger)] text-white hover:opacity-90'
	};

	const sizes: Record<Size, string> = {
		sm: 'h-9 px-3 text-sm gap-1.5',
		md: 'h-11 px-5 text-sm gap-2',
		lg: 'h-13 px-7 text-base gap-2.5'
	};
</script>

<button
	{...rest}
	class="{variants[variant]} {sizes[
		size
	]} inline-flex cursor-pointer items-center justify-center rounded-xl font-semibold transition duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 {className}"
>
	{@render children()}
</button>
