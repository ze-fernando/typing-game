<script lang="ts">
	import { RefreshCw } from '@lucide/svelte';
	import Leaderboard from './Leaderboard.svelte';
	import IconButton from '#lib/modules/ui/components/IconButton.svelte';
	import SegmentedControl from '#lib/modules/ui/components/SegmentedControl.svelte';
	import { FIXED_LEVEL_IDS, GAME_MODES } from '#lib/modules/game/levels';
	import type { FixedLevelId, GameMode } from '#lib/modules/game/types';
	import { useI18n } from '#lib/modules/i18n/context';

	interface Props {
		initialMode: GameMode;
	}

	let { initialMode }: Props = $props();

	const i18n = useI18n();
	let mode = $state<GameMode | null>(null);
	let level = $state<FixedLevelId>('iniciante');
	let refreshKey = $state(0);

	const activeMode = $derived(mode ?? initialMode);
	const modeOptions = $derived(
		GAME_MODES.map((value) => ({ value, label: i18n.messages.modes.short[value] }))
	);
	const levelOptions = $derived(
		FIXED_LEVEL_IDS.map((value) => ({ value, label: i18n.messages.levels.names[value] }))
	);
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<SegmentedControl
			options={modeOptions}
			value={activeMode}
			label={i18n.messages.leaderboard.modeGroup}
			stretch
			onchange={(value) => (mode = value)}
		/>
		<div class="flex w-full items-center gap-2 sm:w-auto">
			<SegmentedControl
				options={levelOptions}
				value={level}
				label={i18n.messages.leaderboard.levelGroup}
				stretch
				onchange={(value) => (level = value)}
			/>
			<IconButton label={i18n.messages.home.rankingRefresh} onclick={() => (refreshKey += 1)}>
				<RefreshCw class="h-4 w-4" aria-hidden="true" />
			</IconButton>
		</div>
	</div>

	<p class="text-xs font-semibold tracking-[0.15em] text-[var(--text-muted)] uppercase">
		{i18n.messages.leaderboard.title(
			i18n.messages.modes.names[activeMode],
			i18n.messages.levels.names[level]
		)}
	</p>

	<Leaderboard mode={activeMode} {level} {refreshKey} />
</div>
