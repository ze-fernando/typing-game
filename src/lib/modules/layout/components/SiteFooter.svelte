<script lang="ts">
	import { onMount } from 'svelte';
	import { useI18n } from '#lib/modules/i18n/context';

	const i18n = useI18n();
	let year = $state(new Date().getFullYear());

	onMount(() => {
		year = new Date().getFullYear();
	});
</script>

<footer class="relative z-10 border-t border-[var(--border)]">
	<div
		class="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-3 px-4 py-6 text-center text-sm text-[var(--text-muted)] sm:flex-row sm:px-6 sm:text-left"
	>
		<p>{i18n.messages.footer.copyright(year)}</p>
		<p class="flex flex-wrap items-center justify-center gap-2 text-xs">
			<span>{i18n.messages.footer.tagline}</span>
			<span aria-hidden="true">·</span>
			<a
				href="https://zioncodes.squareweb.app"
				target="_blank"
				rel="noopener noreferrer"
				class="wordmark text-[var(--text)] no-underline transition-colors hover:text-[var(--primary)]"
			>
				Zion<span class="text-[var(--primary)]">Codes</span>
			</a>
		</p>
	</div>
</footer>
