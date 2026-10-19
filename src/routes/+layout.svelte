<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import SettingsDialog from '#lib/components/modals/SettingsDialog.svelte';
	import ToastHub from '#lib/components/ui/ToastHub.svelte';
	import { hydrateSettings } from '#lib/stores/settings.svelte';

	let { children }: LayoutProps = $props();

	onMount(() => {
		hydrateSettings();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="manifest" href="/manifest.webmanifest" />
	<meta name="theme-color" content="#030a16" />
</svelte:head>

{@render children()}
<SettingsDialog />
<ToastHub />
