<script lang="ts">
	import { resolve } from '$app/paths';
	import { useI18n } from '#lib/modules/i18n/context';
	import type { RouteName } from '#lib/modules/i18n/types';
	import { LOCALES } from '#lib/modules/i18n/types';
	import { localizedPath } from '#lib/modules/i18n/paths';

	interface Props {
		route: RouteName;
	}

	let { route }: Props = $props();

	const i18n = useI18n();
</script>

<nav aria-label={i18n.messages.common.languageGroup}>
	<ul class="flex items-center rounded-full border border-[var(--border)] p-1">
		{#each LOCALES as locale (locale)}
			<li>
				<a
					href={resolve(localizedPath(locale, route))}
					hreflang={locale}
					lang={locale}
					aria-current={i18n.locale === locale ? 'page' : undefined}
					title={i18n.messages.common.languageNames[locale]}
					class="flex min-h-9 min-w-10 items-center justify-center rounded-full px-2.5 text-xs font-bold tracking-[0.15em] no-underline transition-colors {i18n.locale ===
					locale
						? 'bg-[var(--primary-solid)] text-[var(--on-primary)]'
						: 'text-[var(--text-muted)] hover:text-[var(--text)]'}"
				>
					{i18n.messages.common.languageCodes[locale]}
					<span class="sr-only">{i18n.messages.common.languageNames[locale]}</span>
				</a>
			</li>
		{/each}
	</ul>
</nav>
