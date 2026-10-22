<script lang="ts">
	import { Settings } from '@lucide/svelte';
	import Wordmark from './Wordmark.svelte';
	import IconButton from '#lib/modules/ui/components/IconButton.svelte';
	import LanguageSwitch from '#lib/modules/i18n/components/LanguageSwitch.svelte';
	import ThemeToggle from '#lib/modules/settings/components/ThemeToggle.svelte';
	import { useI18n } from '#lib/modules/i18n/context';
	import type { RouteName } from '#lib/modules/i18n/types';
	import { openSettings } from '#lib/modules/ui/ui.svelte';

	interface Props {
		route?: RouteName;
	}

	let { route = 'home' }: Props = $props();

	const i18n = useI18n();
</script>

<header class="relative z-30 border-b border-[var(--border)]">
	<div class="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
		<Wordmark />
		<div class="flex items-center gap-2">
			<LanguageSwitch {route} />
			<ThemeToggle />
			<IconButton label={i18n.messages.common.settings} onclick={openSettings}>
				<Settings class="h-[18px] w-[18px]" aria-hidden="true" />
			</IconButton>
		</div>
	</div>
</header>
