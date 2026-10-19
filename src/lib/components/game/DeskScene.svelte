<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div
	class="relative flex min-h-[22rem] w-full items-end justify-center overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-elevated)] sm:min-h-[26rem] lg:min-h-[28rem]"
>
	<div class="grid-fade absolute inset-0" aria-hidden="true"></div>
	<div
		class="pointer-events-none absolute inset-x-10 bottom-4 h-40 rounded-full bg-[var(--primary)]/10 blur-3xl"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mb-4 w-full max-w-3xl px-3 sm:mb-6 sm:px-6">
		{@render children()}
	</div>
</div>
