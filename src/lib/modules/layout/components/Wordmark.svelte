<script lang="ts">
	import { resolve } from '$app/paths';
	import { useI18n } from '#lib/modules/i18n/context';
	import { localizedPath } from '#lib/modules/i18n/paths';

	const i18n = useI18n();
</script>

<a
	href={resolve(localizedPath(i18n.locale, 'home'))}
	class="wordmark rounded-md text-base text-[var(--text)] no-underline sm:text-lg"
>
	Typing<span class="sr-only"> </span><span class="text-[var(--primary)]">Game</span>
</a>
