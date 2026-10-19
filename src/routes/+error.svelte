<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Compass, Home, TriangleAlert } from '@lucide/svelte';
	import SiteFooter from '#lib/components/layout/SiteFooter.svelte';
	import Button from '#lib/components/ui/Button.svelte';

	const isNotFound = $derived(page.status === 404);
	const title = $derived(isNotFound ? 'Página não encontrada' : 'Algo deu errado');
	const description = $derived(
		isNotFound
			? 'O endereço acessado não existe ou foi movido. Volte ao início para começar a digitar.'
			: (page.error?.message ?? 'Tente recarregar a página em alguns instantes.')
	);

	function goHome(): void {
		void goto(resolve('/'));
	}
</script>

<div class="flex min-h-dvh flex-col">
	<main
		id="conteudo"
		class="relative flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center"
	>
		<span
			class="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--primary)]"
		>
			{#if isNotFound}
				<Compass class="h-8 w-8" aria-hidden="true" />
			{:else}
				<TriangleAlert class="h-8 w-8" aria-hidden="true" />
			{/if}
		</span>

		<p class="font-mono text-sm font-bold text-[var(--text-muted)]">Erro {page.status}</p>
		<h1 class="text-3xl font-black sm:text-4xl">{title}</h1>
		<p class="max-w-md text-sm text-[var(--text-muted)]">{description}</p>

		<Button onclick={goHome}>
			<Home class="h-4 w-4" aria-hidden="true" />
			Voltar ao início
		</Button>
	</main>

	<SiteFooter />
</div>
