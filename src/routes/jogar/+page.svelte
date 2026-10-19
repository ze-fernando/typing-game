<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import GameScreen from '#lib/components/game/GameScreen.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Seo from '#lib/seo/Seo.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function goHome(): void {
		void goto(resolve('/'));
	}
</script>

<Seo
	title="Jogar — Typing Game"
	description="Partida de digitação em português com tempo, precisão e ranking. Escolha o nível e comece a digitar."
	path="/jogar"
/>

{#if data.level}
	{#key `${data.level.id}-${data.level.wordCount}-${data.level.seconds}`}
		<GameScreen level={data.level} />
	{/key}
{:else}
	<main
		id="conteudo"
		class="relative flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center"
	>
		<h1 class="text-3xl font-black">Configuração inválida</h1>
		<p class="max-w-md text-sm text-[var(--text-muted)]">
			Os parâmetros da partida não são válidos. Volte ao início e escolha um nível novamente.
		</p>
		<Button onclick={goHome}>Voltar ao início</Button>
	</main>
{/if}
