<script lang="ts">
	interface Props {
		checked: boolean;
		label: string;
		description?: string;
		onchange?: (checked: boolean) => void;
	}

	let { checked, label, description, onchange }: Props = $props();
</script>

<label
	class="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-[var(--border)] px-4 py-3 transition-colors hover:border-[var(--border-strong)]"
>
	<span class="flex flex-col">
		<span class="text-sm font-semibold text-[var(--text)]">{label}</span>
		{#if description}
			<span class="text-xs text-[var(--text-muted)]">{description}</span>
		{/if}
	</span>
	<span class="relative inline-flex shrink-0">
		<input
			type="checkbox"
			role="switch"
			class="peer sr-only"
			{checked}
			onchange={(event) => onchange?.(event.currentTarget.checked)}
		/>
		<span
			class="h-6 w-11 rounded-full border border-[var(--control-border)] bg-[var(--surface-2)] transition-colors peer-checked:border-[var(--primary-solid)] peer-checked:bg-[var(--primary-solid)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]"
		></span>
		<span
			class="pointer-events-none absolute top-1 left-1 h-4 w-4 rounded-full bg-[var(--text-muted)] transition-transform peer-checked:translate-x-5 peer-checked:bg-white"
		></span>
	</span>
</label>
