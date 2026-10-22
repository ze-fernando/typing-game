<script lang="ts">
	import type { Snippet } from 'svelte';
	import { X } from '@lucide/svelte';
	import { useI18n } from '#lib/modules/i18n/context';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
		footer?: Snippet;
		scrollLabel?: string;
		dismissOnBackdrop?: boolean;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description,
		size = 'md',
		children,
		footer,
		scrollLabel,
		dismissOnBackdrop = true,
		onclose
	}: Props = $props();

	const i18n = useI18n();
	let dialog: HTMLDialogElement | undefined = $state();

	const scrollRegion = $derived(
		scrollLabel ? { tabindex: 0, role: 'region', 'aria-label': scrollLabel } : {}
	);

	const sizes = {
		sm: 'max-w-md',
		md: 'max-w-xl',
		lg: 'max-w-3xl'
	};

	$effect(() => {
		if (!dialog) return;

		if (open && !dialog.open) {
			dialog.showModal();
			dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	function handleClose(): void {
		open = false;
		onclose?.();
	}

	function handleCancel(event: Event): void {
		event.preventDefault();
		open = false;
	}

	function handleBackdropClick(event: MouseEvent): void {
		if (dismissOnBackdrop && event.target === dialog) open = false;
	}
</script>

<dialog
	bind:this={dialog}
	onclose={handleClose}
	oncancel={handleCancel}
	onclick={handleBackdropClick}
	aria-label={title}
	class="animate-pop m-auto w-[calc(100vw-1.5rem)] {sizes[
		size
	]} overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text)] shadow-[var(--shadow-card)]"
>
	<div class="flex max-h-[calc(100dvh-1.5rem)] flex-col">
		<header
			class="flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6"
		>
			<div class="flex flex-col gap-1 text-left">
				<h2 class="text-lg font-bold tracking-wide">{title}</h2>
				{#if description}
					<p class="text-sm text-[var(--text-muted)]">{description}</p>
				{/if}
			</div>
			<button
				type="button"
				class="-mr-2 flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--text-muted)] transition-colors hover:text-[var(--primary)]"
				aria-label={i18n.messages.common.close}
				onclick={() => (open = false)}
			>
				<X class="h-5 w-5" aria-hidden="true" />
			</button>
		</header>

		<div class="min-h-0 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6" {...scrollRegion}>
			{@render children()}
		</div>

		{#if footer}
			<footer class="shrink-0 border-t border-[var(--border)] px-5 py-4 sm:px-6">
				{@render footer()}
			</footer>
		{/if}
	</div>
</dialog>
