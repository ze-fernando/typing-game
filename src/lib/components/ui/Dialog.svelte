<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		title: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
		footer?: Snippet;
		onclose?: () => void;
	}

	let {
		open = $bindable(false),
		title,
		description,
		size = 'md',
		children,
		footer,
		onclose
	}: Props = $props();

	let dialog: HTMLDialogElement | undefined = $state();

	const sizes = {
		sm: 'max-w-md',
		md: 'max-w-2xl',
		lg: 'max-w-4xl'
	};

	$effect(() => {
		if (!dialog) return;

		if (open && !dialog.open) {
			dialog.showModal();
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
		if (event.target === dialog) {
			open = false;
		}
	}
</script>

<dialog
	bind:this={dialog}
	onclose={handleClose}
	oncancel={handleCancel}
	onclick={handleBackdropClick}
	aria-label={title}
	class="animate-pop m-auto w-[calc(100vw-2rem)] {sizes[
		size
	]} overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-0 text-[var(--text)] shadow-2xl"
>
	<div class="flex max-h-[85dvh] flex-col">
		<header
			class="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-6"
		>
			<div class="flex flex-col gap-1">
				<h2 class="text-lg font-bold tracking-tight">{title}</h2>
				{#if description}
					<p class="text-sm text-[var(--text-muted)]">{description}</p>
				{/if}
			</div>
			<button
				type="button"
				class="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
				aria-label="Fechar"
				onclick={() => (open = false)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					class="h-5 w-5"
					aria-hidden="true"
				>
					<path d="M18 6 6 18M6 6l12 12" />
				</svg>
			</button>
		</header>

		<div class="overflow-y-auto px-5 py-5 sm:px-6">
			{@render children()}
		</div>

		{#if footer}
			<footer class="border-t border-[var(--border)] px-5 py-4 sm:px-6">
				{@render footer()}
			</footer>
		{/if}
	</div>
</dialog>
