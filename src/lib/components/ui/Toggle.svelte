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
	class="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/60 px-4 py-3 transition hover:bg-[var(--surface-2)]"
>
	<span class="flex flex-col">
		<span class="text-sm font-semibold text-[var(--text)]">{label}</span>
		{#if description}
			<span class="text-xs text-[var(--text-muted)]">{description}</span>
		{/if}
	</span>
	<span class="relative inline-flex">
		<input
			type="checkbox"
			class="peer sr-only"
			{checked}
			onchange={(event) => onchange?.(event.currentTarget.checked)}
		/>
		<span
			class="h-6 w-11 rounded-full bg-[var(--border-strong)] transition peer-checked:bg-[var(--primary)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus)]"
		></span>
		<span
			class="pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5"
		></span>
	</span>
</label>
