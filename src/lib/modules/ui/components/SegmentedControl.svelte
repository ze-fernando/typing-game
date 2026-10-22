<script lang="ts" generics="Value extends string">
	interface Option {
		value: Value;
		label: string;
	}

	interface Props {
		options: readonly Option[];
		value: Value;
		label: string;
		size?: 'sm' | 'md';
		stretch?: boolean;
		onchange: (value: Value) => void;
	}

	let { options, value, label, size = 'sm', stretch = false, onchange }: Props = $props();
</script>

<div
	class="gap-1 rounded-full border border-[var(--border)] p-1 {stretch
		? 'flex w-full sm:inline-flex sm:w-auto'
		: 'inline-flex max-w-full'}"
	role="group"
	aria-label={label}
>
	{#each options as option (option.value)}
		<button
			type="button"
			aria-pressed={value === option.value}
			class="min-w-0 cursor-pointer rounded-full leading-tight font-semibold tracking-wide transition-colors duration-150 {stretch
				? 'flex-1 sm:flex-none'
				: ''} {size === 'sm'
				? 'min-h-9 px-3 text-xs'
				: 'min-h-10 px-3 text-xs sm:px-4 sm:text-sm'} {value === option.value
				? 'bg-[var(--primary-solid)] text-[var(--on-primary)]'
				: 'text-[var(--text-muted)] hover:text-[var(--text)]'}"
			onclick={() => onchange(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>
