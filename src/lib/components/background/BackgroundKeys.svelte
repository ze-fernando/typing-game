<script lang="ts">
	import { onMount } from 'svelte';

	interface FloatingKey {
		id: string;
		label: string;
		x: number;
		y: number;
		size: number;
		depth: number;
		rotate: number;
		duration: number;
		delay: number;
		opacity: number;
		mobile: boolean;
	}

	const keys: FloatingKey[] = [
		{
			id: 'k1',
			label: 'Q',
			x: 6,
			y: 14,
			size: 54,
			depth: 26,
			rotate: -12,
			duration: 11,
			delay: 0,
			opacity: 0.55,
			mobile: true
		},
		{
			id: 'k2',
			label: 'W',
			x: 82,
			y: 10,
			size: 46,
			depth: -18,
			rotate: 9,
			duration: 9,
			delay: 1.2,
			opacity: 0.45,
			mobile: false
		},
		{
			id: 'k3',
			label: 'Espaço',
			x: 64,
			y: 78,
			size: 88,
			depth: 34,
			rotate: -4,
			duration: 13,
			delay: 0.4,
			opacity: 0.5,
			mobile: true
		},
		{
			id: 'k4',
			label: 'Ç',
			x: 18,
			y: 68,
			size: 44,
			depth: -22,
			rotate: 14,
			duration: 10,
			delay: 2,
			opacity: 0.5,
			mobile: true
		},
		{
			id: 'k5',
			label: 'Enter',
			x: 88,
			y: 52,
			size: 74,
			depth: 30,
			rotate: 8,
			duration: 12,
			delay: 0.8,
			opacity: 0.4,
			mobile: false
		},
		{
			id: 'k6',
			label: 'A',
			x: 38,
			y: 22,
			size: 40,
			depth: 16,
			rotate: -8,
			duration: 8,
			delay: 1.6,
			opacity: 0.42,
			mobile: false
		},
		{
			id: 'k7',
			label: '~',
			x: 52,
			y: 42,
			size: 38,
			depth: -14,
			rotate: 18,
			duration: 9.5,
			delay: 0.2,
			opacity: 0.38,
			mobile: true
		},
		{
			id: 'k8',
			label: 'Shift',
			x: 8,
			y: 44,
			size: 62,
			depth: 24,
			rotate: 6,
			duration: 12.5,
			delay: 2.4,
			opacity: 0.35,
			mobile: false
		},
		{
			id: 'k9',
			label: 'K',
			x: 72,
			y: 30,
			size: 42,
			depth: -20,
			rotate: -15,
			duration: 10.5,
			delay: 1,
			opacity: 0.5,
			mobile: true
		},
		{
			id: 'k10',
			label: 'Z',
			x: 30,
			y: 84,
			size: 38,
			depth: 18,
			rotate: 10,
			duration: 9,
			delay: 1.8,
			opacity: 0.4,
			mobile: false
		},
		{
			id: 'k11',
			label: 'Ctrl',
			x: 92,
			y: 82,
			size: 58,
			depth: -26,
			rotate: -6,
			duration: 13.5,
			delay: 0.6,
			opacity: 0.35,
			mobile: false
		},
		{
			id: 'k12',
			label: 'L',
			x: 48,
			y: 8,
			size: 36,
			depth: 12,
			rotate: 12,
			duration: 8.5,
			delay: 2.2,
			opacity: 0.42,
			mobile: false
		},
		{
			id: 'k13',
			label: 'Backspace',
			x: 24,
			y: 50,
			size: 78,
			depth: 28,
			rotate: -9,
			duration: 14,
			delay: 1.4,
			opacity: 0.3,
			mobile: false
		},
		{
			id: 'k14',
			label: 'P',
			x: 76,
			y: 66,
			size: 40,
			depth: -16,
			rotate: 7,
			duration: 10,
			delay: 2.6,
			opacity: 0.45,
			mobile: true
		},
		{
			id: 'k15',
			label: 'Tab',
			x: 60,
			y: 18,
			size: 52,
			depth: 20,
			rotate: -13,
			duration: 11.5,
			delay: 0.9,
			opacity: 0.35,
			mobile: false
		},
		{
			id: 'k16',
			label: 'M',
			x: 12,
			y: 84,
			size: 36,
			depth: -12,
			rotate: 16,
			duration: 9.8,
			delay: 3,
			opacity: 0.4,
			mobile: false
		}
	];

	let container: HTMLElement | undefined = $state();

	onMount(() => {
		if (!container) return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		if (matchMedia('(pointer: coarse)').matches) return;

		let frame = 0;

		const handlePointer = (event: PointerEvent) => {
			if (frame) return;

			frame = requestAnimationFrame(() => {
				frame = 0;
				if (!container) return;
				const x = (event.clientX / window.innerWidth) * 2 - 1;
				const y = (event.clientY / window.innerHeight) * 2 - 1;
				container.style.setProperty('--mx', String(Math.max(-1, Math.min(1, x))));
				container.style.setProperty('--my', String(Math.max(-1, Math.min(1, y))));
			});
		};

		window.addEventListener('pointermove', handlePointer, { passive: true });

		return () => {
			window.removeEventListener('pointermove', handlePointer);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<div
	bind:this={container}
	class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
	aria-hidden="true"
>
	<div
		class="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-400/10"
	></div>
	<div
		class="absolute top-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-[#0a2a52]/10 blur-3xl dark:bg-white/5"
	></div>

	{#each keys as item (item.id)}
		<div
			class="absolute transition-transform duration-300 ease-out {item.mobile
				? 'block'
				: 'hidden md:block'}"
			style="
				left: {item.x}%;
				top: {item.y}%;
				--depth: {item.depth}px;
				transform: translate3d(calc(var(--mx, 0) * var(--depth)), calc(var(--my, 0) * var(--depth)), 0);
			"
		>
			<div
				class="animate-float rounded-2xl bg-[var(--key-bg)] font-mono font-semibold text-[var(--key-text)] shadow-2xl"
				style="
					--key-rotate: {item.rotate}deg;
					width: {item.size}px;
					height: {item.size * 0.72}px;
					font-size: {Math.max(11, item.size * 0.26)}px;
					opacity: {item.opacity};
					animation-duration: {item.duration}s;
					animation-delay: -{item.delay}s;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 6px;
				"
			>
				{item.label}
			</div>
		</div>
	{/each}

	<div class="grid-fade absolute inset-0 opacity-40"></div>
</div>
