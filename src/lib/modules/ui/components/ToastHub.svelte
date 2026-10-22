<script lang="ts">
	import { X } from '@lucide/svelte';
	import { useI18n } from '#lib/modules/i18n/context';
	import { dismissToast, toasts } from '#lib/modules/ui/ui.svelte';

	const i18n = useI18n();

	const tones = {
		info: 'border-[var(--border-strong)] text-[var(--text)]',
		success: 'border-[var(--success)]/50 text-[var(--success)]',
		error: 'border-[var(--danger)]/50 text-[var(--danger)]'
	};
</script>

<div
	class="pointer-events-none fixed right-3 bottom-3 z-[60] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2"
	role="status"
	aria-live="polite"
>
	{#each toasts as toast (toast.id)}
		<div
			class="animate-rise pointer-events-auto flex w-full items-center justify-between gap-3 rounded-xl border bg-[var(--surface)] py-2 pr-2 pl-4 text-sm font-medium shadow-[var(--shadow-card)] {tones[
				toast.tone
			]}"
		>
			<span>{toast.message}</span>
			<button
				type="button"
				class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text)]"
				aria-label={i18n.messages.common.close}
				onclick={() => dismissToast(toast.id)}
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>
	{/each}
</div>
