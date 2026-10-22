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
		type = 'button',
		...rest
	}: Props = $props();

	const variants: Record<Variant, string> = {
		primary:
			'bg-[var(--primary-solid)] text-[var(--on-primary)] shadow-[0_8px_24px_-12px_rgb(37_99_235/0.8)] hover:bg-[var(--primary-strong)]',
		secondary:
			'border border-[var(--border-strong)] bg-transparent text-[var(--text)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
		ghost: 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
		danger:
			'border border-[var(--danger)] bg-transparent text-[var(--danger)] hover:bg-[var(--danger-soft)]'
	};

	const sizes: Record<Size, string> = {
		sm: 'min-h-10 px-3.5 text-sm gap-1.5',
		md: 'min-h-11 px-5 text-sm gap-2',
		lg: 'min-h-12 px-6 text-base gap-2.5'
	};
</script>

<button
	{...rest}
	{type}
	class="{variants[variant]} {sizes[
		size
	]} inline-flex cursor-pointer items-center justify-center rounded-lg font-semibold tracking-wide transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 {className}"
>
	{@render children()}
</button>
