<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		mousePressed?: boolean;
	}

	let { children, mousePressed = false }: Props = $props();
</script>

<div
	class="relative flex min-h-[24rem] w-full items-end justify-center overflow-hidden rounded-[1.75rem] border border-black/40 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] sm:min-h-[30rem] lg:min-h-[34rem]"
>
	<!-- Madeira da mesa -->
	<div
		class="absolute inset-0"
		style="background:
			linear-gradient(180deg, #41291a 0%, #2b180e 55%, #1d0f08 100%),
			repeating-linear-gradient(92deg, rgba(0,0,0,0.18) 0 2px, transparent 2px 9px, rgba(255,255,255,0.03) 9px 11px, transparent 11px 22px);"
		aria-hidden="true"
	></div>

	<!-- Mousepad com mapa -->
	<div
		class="absolute inset-x-3 top-10 bottom-3 overflow-hidden rounded-2xl border border-white/10 sm:inset-x-6 sm:top-14 sm:bottom-6"
		style="background: linear-gradient(160deg, rgba(20,26,43,0.96), rgba(8,11,20,0.98)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.6);"
		aria-hidden="true"
	>
		<svg
			viewBox="0 0 400 200"
			class="absolute inset-0 h-full w-full opacity-[0.16]"
			preserveAspectRatio="xMidYMid slice"
		>
			<g fill="rgba(255,255,255,0.65)">
				<path
					d="M42 38c12-10 34-14 48-7 10 5 9 16 18 21 10 6 24 3 31 12 5 6 0 15-7 18-12 6-27-2-39-8-9-4-19-5-28-10-10-6-16-15-24-22z"
				/>
				<path
					d="M96 96c8-3 17 1 22 8 6 9 3 22 10 30 6 8 18 8 21 17 3 8-4 16-12 17-10 2-19-6-24-14-6-11-5-24-11-34-4-8-13-13-15-20 1-2 5-3 9-4z"
				/>
				<path
					d="M182 52c10-8 26-6 36 2 8 6 19 7 25 15 4 6 0 14-7 15-12 2-24-4-36-6-9-1-19 2-26-4-4-7 1-17 8-22z"
				/>
				<path
					d="M214 96c14-6 31-2 42 9 9 9 22 14 27 26 3 9-3 19-12 21-13 3-24-6-35-12-12-7-27-9-34-20-4-9 3-19 12-24z"
				/>
				<path d="M312 132c9-6 22-4 29 4 6 7 5 18-2 24-8 7-21 6-28-1-7-8-6-21 1-27z" />
				<path d="M296 34c12-6 28-3 36 8 6 8 3 19-5 24-10 6-24 2-31-7-6-8-6-19 0-25z" />
			</g>
			<g stroke="rgba(255,255,255,0.16)" stroke-width="0.6">
				<path d="M0 50h400M0 100h400M0 150h400" />
				<path d="M80 0v200M160 0v200M240 0v200M320 0v200" />
			</g>
			<path d="M92 42h58" stroke="rgba(239,68,68,0.7)" stroke-width="1.2" />
			<path d="M150 42v96" stroke="rgba(239,68,68,0.45)" stroke-width="1" stroke-dasharray="4 4" />
			<path d="M92 138h58" stroke="rgba(239,68,68,0.45)" stroke-width="1" stroke-dasharray="4 4" />
		</svg>
		<div
			class="absolute inset-0"
			style="background: radial-gradient(circle at 50% 80%, rgba(46,107,255,0.12), transparent 60%);"
		></div>
	</div>

	<!-- Notebook -->
	<div
		class="absolute -top-2 right-8 hidden h-24 w-40 rotate-[-4deg] rounded-lg border border-white/10 bg-[#0b0f17] shadow-2xl md:block"
		aria-hidden="true"
	>
		<div class="absolute inset-x-3 top-2 h-1 rounded-full bg-white/10"></div>
		<div class="absolute right-3 bottom-2 left-3 h-1 rounded-full bg-white/5"></div>
	</div>

	<!-- Caneca -->
	<div class="absolute top-12 left-6 hidden sm:block" aria-hidden="true">
		<div class="relative">
			<div
				class="absolute top-4 -right-3 h-8 w-8 rounded-full border-[6px] border-[#f6f1ea]/80"
				style="background: transparent;"
			></div>
			<div
				class="relative flex h-20 w-20 items-end justify-center overflow-hidden rounded-2xl border border-white/20 bg-[#f6f1ea] shadow-2xl"
			>
				<div class="absolute inset-x-0 bottom-0 h-10 bg-[#3b2414]"></div>
				<div class="absolute inset-x-0 bottom-8 h-1.5 bg-[#2a1508]"></div>
				<div class="absolute bottom-10 left-2 h-8 w-8 rotate-12 rounded-full bg-[#d92d20]/80"></div>
				<div
					class="absolute bottom-12 left-10 h-6 w-6 -rotate-12 rounded-full bg-[#d92d20]/60"
				></div>
			</div>
			<div
				class="animate-steam absolute -top-6 left-5 h-8 w-4 rounded-full bg-white/20 blur-md"
			></div>
			<div
				class="animate-steam absolute -top-8 left-8 h-10 w-5 rounded-full bg-white/10 blur-md"
				style="animation-delay: -1.6s;"
			></div>
		</div>
	</div>

	<!-- Mouse -->
	<div
		class="absolute right-6 bottom-10 hidden transition-transform duration-100 sm:block {mousePressed
			? 'translate-y-0.5 scale-[0.99]'
			: ''}"
		aria-hidden="true"
	>
		<svg viewBox="0 0 90 130" class="h-28 w-20 drop-shadow-2xl">
			<path
				d="M45 4C22 4 8 26 8 58c0 38 16 68 37 68s37-30 37-68C82 26 68 4 45 4Z"
				fill="#0c0f14"
				stroke="rgba(255,255,255,0.16)"
				stroke-width="2"
			/>
			<path
				d="M45 4C30 4 18 18 13 38c10-6 21-9 32-9s22 3 32 9C72 18 60 4 45 4Z"
				fill="rgba(255,255,255,0.06)"
			/>
			<path d="M45 6v50" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" />
			<rect
				x="33"
				y="26"
				width="24"
				height="10"
				rx="5"
				fill="#05070a"
				stroke="rgba(255,255,255,0.2)"
			/>
			<circle
				cx="45"
				cy="31"
				r="3"
				fill="#2e6bff"
				class={mousePressed ? 'opacity-100' : 'opacity-70'}
			/>
			<circle cx="45" cy="78" r="10" fill="rgba(46,107,255,0.18)" />
			<path
				d="M30 116c8 4 22 4 30 0"
				stroke="rgba(255,255,255,0.12)"
				stroke-width="2"
				fill="none"
			/>
		</svg>
	</div>

	<!-- Cabos -->
	<svg
		class="animate-cable pointer-events-none absolute inset-0 h-full w-full"
		viewBox="0 0 1200 600"
		preserveAspectRatio="none"
		aria-hidden="true"
	>
		<path
			d="M950 150c80 120 40 240 120 330"
			fill="none"
			stroke="rgba(0,0,0,0.6)"
			stroke-width="7"
			stroke-linecap="round"
		/>
		<path
			d="M950 150c80 120 40 240 120 330"
			fill="none"
			stroke="rgba(46,107,255,0.35)"
			stroke-width="2"
			stroke-dasharray="3 7"
			stroke-linecap="round"
		/>
	</svg>

	<!-- Área do teclado -->
	<div class="relative z-10 mb-5 w-full max-w-3xl px-3 sm:mb-8 sm:px-6">
		<div
			class="animate-glow pointer-events-none absolute inset-x-8 bottom-0 h-24 rounded-full bg-[#2e6bff]/30 blur-3xl"
			aria-hidden="true"
		></div>
		<div class="relative">
			{@render children()}
		</div>
	</div>
</div>
