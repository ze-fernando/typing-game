<script lang="ts">
	import { PUBLIC_SITE_URL } from '$app/env/public';

	interface Props {
		title: string;
		description: string;
		path?: string;
		image?: string;
		type?: string;
	}

	let { title, description, path = '/', image = '/og.png', type = 'website' }: Props = $props();

	const siteUrl = PUBLIC_SITE_URL.replace(/\/+$/, '');
	const canonical = $derived(`${siteUrl}${path.startsWith('/') ? path : `/${path}`}`);
	const imageUrl = $derived(image.startsWith('http') ? image : `${siteUrl}${image}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content="Typing Game" />
	<meta property="og:locale" content="pt_BR" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:image:alt" content="Typing Game — jogo de digitação em português" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
