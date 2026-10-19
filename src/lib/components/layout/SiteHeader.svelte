<script lang="ts">
	import { resolve } from '$app/paths';
	import { Settings } from '@lucide/svelte';
	import ThemeToggle from '#lib/components/ui/ThemeToggle.svelte';
	import IconButton from '#lib/components/ui/IconButton.svelte';
	import { openSettings } from '#lib/stores/ui.svelte';

	interface Props {
		compact?: boolean;
	}

	let { compact = false }: Props = $props();
</script>

<header
	class="relative z-30 mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6"
>
	<a
		href={resolve('/')}
		class="group flex items-center gap-2.5 rounded-xl px-1 py-1 text-[var(--text)] no-underline"
	>
		<span
			class="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] font-mono text-sm font-bold text-[var(--on-primary)] shadow-lg"
			aria-hidden="true"
		>
			&lt;/
		</span>
		<span class="flex flex-col leading-none">
			<span class="text-sm font-bold tracking-tight">Typing Game</span>
			{#if !compact}
				<span class="text-[0.68rem] font-medium text-[var(--text-muted)]">digite em português</span>
			{/if}
		</span>
	</a>

	<div class="flex items-center gap-2">
		<ThemeToggle />
		<IconButton label="Configurações" onclick={openSettings}>
			<Settings class="h-5 w-5" aria-hidden="true" />
		</IconButton>
	</div>
</header>
