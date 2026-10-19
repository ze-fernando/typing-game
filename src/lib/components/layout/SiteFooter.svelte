<script lang="ts">
	import { onMount } from 'svelte';

	let year = $state(new Date().getFullYear());

	onMount(() => {
		year = new Date().getFullYear();
	});
</script>

<footer class="relative z-10 border-t border-[var(--border)] bg-[var(--surface)]/60 py-8">
	<div
		class="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-sm text-[var(--text-muted)] sm:flex-row sm:px-6 sm:text-left"
	>
		<p>© {year} ZionCodes Todos os direitos reservados</p>
		<p class="flex items-center gap-2 text-xs">
			<span>Feito com SvelteKit e Tailwind</span>
			<span aria-hidden="true">•</span>
			<a
				href="https://zioncodes.squareweb.app"
				target="_blank"
				rel="noopener noreferrer"
				class="font-semibold text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-4 transition hover:decoration-[var(--primary)]"
			>
				ZionCodes
			</a>
		</p>
	</div>
</footer>
