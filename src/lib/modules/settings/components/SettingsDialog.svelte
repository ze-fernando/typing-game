<script lang="ts">
	import Button from '#lib/modules/ui/components/Button.svelte';
	import Dialog from '#lib/modules/ui/components/Dialog.svelte';
	import SegmentedControl from '#lib/modules/ui/components/SegmentedControl.svelte';
	import Toggle from '#lib/modules/ui/components/Toggle.svelte';
	import { useI18n } from '#lib/modules/i18n/context';
	import {
		resetSettings,
		setEffects,
		setMusic,
		setThemeMode,
		settings,
		type ThemeMode
	} from '#lib/modules/settings/settings.svelte';
	import { closeSettings, showToast, ui } from '#lib/modules/ui/ui.svelte';

	const i18n = useI18n();

	const themes = $derived<{ value: ThemeMode; label: string }[]>([
		{ value: 'system', label: i18n.messages.theme.system },
		{ value: 'light', label: i18n.messages.theme.light },
		{ value: 'dark', label: i18n.messages.theme.dark }
	]);

	function handleReset(): void {
		resetSettings();
		showToast(i18n.messages.settings.resetDone, 'success');
	}
</script>

<Dialog
	bind:open={ui.settingsOpen}
	title={i18n.messages.settings.title}
	description={i18n.messages.settings.description}
	size="sm"
	onclose={closeSettings}
>
	<div class="flex flex-col gap-3">
		<Toggle
			checked={settings.music}
			label={i18n.messages.settings.music}
			description={i18n.messages.settings.musicHelp}
			onchange={setMusic}
		/>
		<Toggle
			checked={settings.effects}
			label={i18n.messages.settings.effects}
			description={i18n.messages.settings.effectsHelp}
			onchange={setEffects}
		/>

		<div
			class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] px-4 py-3"
		>
			<p class="text-sm font-semibold">{i18n.messages.theme.label}</p>
			<SegmentedControl
				options={themes}
				value={settings.theme}
				label={i18n.messages.theme.label}
				onchange={setThemeMode}
			/>
		</div>
	</div>

	{#snippet footer()}
		<div class="flex items-center justify-between gap-3">
			<Button variant="ghost" size="sm" onclick={handleReset}>{i18n.messages.settings.reset}</Button
			>
			<Button size="sm" onclick={closeSettings}>{i18n.messages.common.close}</Button>
		</div>
	{/snippet}
</Dialog>
