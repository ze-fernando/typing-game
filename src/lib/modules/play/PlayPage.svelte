<script lang="ts">
	import { resolve } from '$app/paths';
	import GameScreen from '#lib/modules/game/components/GameScreen.svelte';
	import SiteFooter from '#lib/modules/layout/components/SiteFooter.svelte';
	import SiteHeader from '#lib/modules/layout/components/SiteHeader.svelte';
	import type { LevelConfig } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';
	import { localizedPath } from '#lib/modules/i18n/paths';
	import Seo from '#lib/modules/seo/Seo.svelte';

	interface Props {
		level: LevelConfig | null;
	}

	let { level }: Props = $props();

	const i18n = useI18n();
</script>

<Seo
	title={i18n.messages.meta.playTitle}
	description={i18n.messages.meta.playDescription}
	route="play"
/>

{#if level}
	{#key `${level.mode}-${level.id}-${level.wordCount}-${level.seconds}`}
		<GameScreen {level} />
	{/key}
{:else}
	<div class="flex min-h-dvh flex-col">
		<SiteHeader route="play" />
		<main
			id="conteudo"
			class="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start justify-center gap-4 px-4 py-16 sm:px-6"
		>
			<h1 class="text-3xl font-bold tracking-wide">{i18n.messages.game.invalidTitle}</h1>
			<p class="max-w-[60ch] text-[var(--text-muted)]">{i18n.messages.game.invalidText}</p>
			<a
				href={resolve(localizedPath(i18n.locale, 'home'))}
				class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--primary-solid)] px-5 text-sm font-semibold tracking-wide text-[var(--on-primary)] shadow-[0_8px_24px_-12px_rgb(37_99_235/0.8)] transition-[background-color,transform] duration-150 hover:bg-[var(--primary-strong)] active:scale-[0.98]"
			>
				{i18n.messages.common.backHome}
			</a>
		</main>
		<SiteFooter />
	</div>
{/if}
