<script lang="ts">
	import { PUBLIC_SITE_URL } from '$app/env/public';
	import { useI18n } from '#lib/modules/i18n/context';
	import { htmlLang, openGraphLocale } from '#lib/modules/i18n/paths';
	import type { RouteName } from '#lib/modules/i18n/types';
	import { buildSeoLinks } from './links';
	import { buildStructuredData, serializeJsonLd } from './structured-data';

	interface Props {
		title: string;
		description: string;
		route: RouteName;
		withFaq?: boolean;
	}

	let { title, description, route, withFaq = false }: Props = $props();

	const i18n = useI18n();
	const siteUrl = PUBLIC_SITE_URL.replace(/\/+$/, '');
	const links = $derived(buildSeoLinks(siteUrl, route, i18n.locale));
	const imageUrl = `${siteUrl}/og.png`;
	const otherLocale = $derived(i18n.locale === 'en' ? 'pt-BR' : 'en');
	const jsonLd = $derived(
		serializeJsonLd(
			buildStructuredData({
				locale: i18n.locale,
				messages: i18n.messages,
				url: links.canonical,
				withFaq
			})
		)
	);
	const jsonLdTag = $derived('<script type="application/ld+json">' + jsonLd + '</' + 'script>');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	{#if links.canonical}
		<link rel="canonical" href={links.canonical} />
		{#each links.alternates as alternate (alternate.locale)}
			<link rel="alternate" hreflang={alternate.locale} href={alternate.href} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={links.xDefault} />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={i18n.messages.meta.siteName} />
	<meta property="og:locale" content={openGraphLocale(i18n.locale)} />
	<meta property="og:locale:alternate" content={openGraphLocale(otherLocale)} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	{#if siteUrl}
		<meta property="og:url" content={links.canonical} />
		<meta property="og:image" content={imageUrl} />
		<meta property="og:image:width" content="1200" />
		<meta property="og:image:height" content="630" />
	{/if}
	<meta property="og:image:alt" content={i18n.messages.meta.ogImageAlt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	{#if siteUrl}<meta name="twitter:image" content={imageUrl} />{/if}
	<meta name="content-language" content={htmlLang(i18n.locale)} />

	{@html jsonLdTag}
</svelte:head>
