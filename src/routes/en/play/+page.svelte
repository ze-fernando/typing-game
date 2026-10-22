<script lang="ts">
	import PlayPage from '#lib/modules/play/PlayPage.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<PlayPage level={data.level} />
