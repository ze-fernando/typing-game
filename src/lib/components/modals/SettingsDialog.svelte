<script lang="ts">
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import Toggle from '#lib/components/ui/Toggle.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import {
		resetSettings,
		setEffects,
		setMusic,
		setThemeMode,
		settings
	} from '#lib/stores/settings.svelte';
	import { closeSettings, showToast, ui } from '#lib/stores/ui.svelte';

	const themes = [
		{ value: 'system', label: 'Sistema' },
		{ value: 'light', label: 'Claro' },
		{ value: 'dark', label: 'Escuro' }
	] as const;

	function handleReset(): void {
		resetSettings();
		showToast('Preferências restauradas.', 'success');
	}
</script>

<Dialog
	bind:open={ui.settingsOpen}
	title="Configurações"
	description="Ajuste som, efeitos e aparência. Tudo fica salvo no seu navegador."
	size="sm"
	onclose={closeSettings}
>
	<div class="flex flex-col gap-3">
		<Toggle
			checked={settings.music}
			label="Música"
			description="Trilha ambiente durante a partida."
			onchange={setMusic}
		/>
		<Toggle
			checked={settings.effects}
			label="Efeitos de teclas"
			description="Cliques, acertos, erros e contagem."
			onchange={setEffects}
		/>

		<div class="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)]/60 px-4 py-3">
			<p class="mb-3 text-sm font-semibold">Tema</p>
			<div class="grid grid-cols-3 gap-2" role="group" aria-label="Tema">
				{#each themes as theme (theme.value)}
					<button
						type="button"
						class="cursor-pointer rounded-xl border px-3 py-2 text-xs font-semibold transition {settings.theme ===
						theme.value
							? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]'
							: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'}"
						aria-pressed={settings.theme === theme.value}
						onclick={() => setThemeMode(theme.value)}
					>
						{theme.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex items-center justify-between gap-3">
			<Button variant="ghost" size="sm" onclick={handleReset}>Restaurar padrões</Button>
			<Button size="sm" onclick={closeSettings}>Fechar</Button>
		</div>
	{/snippet}
</Dialog>
