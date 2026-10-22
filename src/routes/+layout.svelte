<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import SettingsDialog from '#lib/modules/settings/components/SettingsDialog.svelte';
	import ToastHub from '#lib/modules/ui/components/ToastHub.svelte';
	import { provideI18n } from '#lib/modules/i18n/context';
	import { htmlLang } from '#lib/modules/i18n/paths';
	import { hydrateSettings } from '#lib/modules/settings/settings.svelte';

	let { children, data }: LayoutProps = $props();

	const i18n = provideI18n(() => data.locale);

	onMount(() => {
		void hydrateSettings();
	});

	$effect(() => {
		document.documentElement.lang = htmlLang(i18n.locale);
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="manifest" href="/manifest.webmanifest" />
</svelte:head>

<a class="skip-link" href="#conteudo">{i18n.messages.common.skipLink}</a>
{@render children()}
<SettingsDialog />
<ToastHub />
