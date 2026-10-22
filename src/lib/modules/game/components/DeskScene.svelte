<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	class="relative w-full overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-elevated)] px-2 pt-3 pb-4 sm:px-5 sm:pt-5 sm:pb-6"
>
	<div
		class="pointer-events-none absolute inset-x-[15%] -bottom-16 h-32 rounded-full bg-[var(--glow)] blur-3xl"
		aria-hidden="true"
	></div>
	<div class="relative mx-auto w-full max-w-3xl">
		{@render children()}
	</div>
</div>
