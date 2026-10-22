<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Compass, Home, TriangleAlert } from '@lucide/svelte';
	import SiteFooter from '#lib/modules/layout/components/SiteFooter.svelte';
	import SiteHeader from '#lib/modules/layout/components/SiteHeader.svelte';
	import Button from '#lib/modules/ui/components/Button.svelte';
	import { useI18n } from '#lib/modules/i18n/context';
	import { localizedPath } from '#lib/modules/i18n/paths';

	const i18n = useI18n();
	const isNotFound = $derived(page.status === 404);
	const title = $derived(
		isNotFound ? i18n.messages.errorPage.notFoundTitle : i18n.messages.errorPage.genericTitle
	);
	const description = $derived(
		isNotFound ? i18n.messages.errorPage.notFoundText : i18n.messages.errorPage.genericText
	);
</script>

<svelte:head>
	<title>{title} — {i18n.messages.meta.siteName}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<SiteHeader />
	<main
		id="conteudo"
		class="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-5 px-4 py-16 sm:px-6"
	>
		<span class="chip">
			{#if isNotFound}
				<Compass class="h-3.5 w-3.5" aria-hidden="true" />
			{:else}
				<TriangleAlert class="h-3.5 w-3.5" aria-hidden="true" />
			{/if}
			{i18n.messages.errorPage.code(page.status)}
		</span>
		<h1 class="text-[clamp(2rem,7vw,3rem)] leading-tight font-bold tracking-wide">{title}</h1>
		<p class="max-w-[60ch] text-[var(--text-muted)]">{description}</p>
		<Button onclick={() => goto(resolve(localizedPath(i18n.locale, 'home')))}>
			<Home class="h-4 w-4" aria-hidden="true" />
			{i18n.messages.common.backHome}
		</Button>
	</main>
	<SiteFooter />
</div>
