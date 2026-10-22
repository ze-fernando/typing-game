<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import IconButton from '#lib/modules/ui/components/IconButton.svelte';
	import { useI18n } from '#lib/modules/i18n/context';
	import { themeState, toggleTheme } from '#lib/modules/settings/settings.svelte';

	const i18n = useI18n();

	const dark = $derived(themeState.resolved === 'dark');
	const label = $derived(
		`${i18n.messages.theme.label}: ${(dark
			? i18n.messages.theme.dark
			: i18n.messages.theme.light
		).toLowerCase()}`
	);
	const action = $derived(dark ? i18n.messages.theme.toLight : i18n.messages.theme.toDark);
</script>

<IconButton {label} title={action} pressed={dark} data-theme-toggle onclick={toggleTheme}>
	<Sun class="h-[18px] w-[18px] dark:hidden" aria-hidden="true" />
	<Moon class="hidden h-[18px] w-[18px] dark:block" aria-hidden="true" />
</IconButton>
