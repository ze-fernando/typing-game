<script lang="ts">
	import { dismissToast, toasts } from '#lib/stores/ui.svelte';

	const tones = {
		info: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]',
		success: 'border-[var(--success)]/40 bg-[var(--success-soft)] text-[var(--success)]',
		error: 'border-[var(--danger)]/40 bg-[var(--danger-soft)] text-[var(--danger)]'
	};
</script>

<div
	class="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
	aria-live="polite"
>
	{#each toasts as toast (toast.id)}
		<button
			type="button"
			class="animate-fade-up pointer-events-auto flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium shadow-xl {tones[
				toast.tone
			]}"
			onclick={() => dismissToast(toast.id)}
		>
			<span>{toast.message}</span>
			<span aria-hidden="true" class="text-xs opacity-60">fechar</span>
		</button>
	{/each}
</div>
