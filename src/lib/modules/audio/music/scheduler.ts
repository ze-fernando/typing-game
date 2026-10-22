export type TimerHandle = ReturnType<typeof setInterval>;

export interface SchedulerClock {
	now: () => number;
	every: (callback: () => void, ms: number) => TimerHandle;
	stop: (timer: TimerHandle) => void;
}

export interface ScheduledStep {
	time: number;
	bar: number;
	step: number;
}

export interface SchedulerOptions {
	clock: SchedulerClock;
	secondsPerStep: number;
	stepsPerBar: number;
	onStep: (scheduled: ScheduledStep) => void;
	lookaheadMs?: number;
	scheduleAheadSeconds?: number;
}

export interface StepScheduler {
	start: (fromBar: number, startTime: number) => void;
	stop: () => number;
	isRunning: () => boolean;
}

export function createStepScheduler(options: SchedulerOptions): StepScheduler {
	const lookaheadMs = options.lookaheadMs ?? 25;
	const scheduleAhead = options.scheduleAheadSeconds ?? 0.12;
	let timer: TimerHandle | null = null;
	let nextTime = 0;
	let bar = 0;
	let step = 0;

	function tick(): void {
		const horizon = options.clock.now() + scheduleAhead;
		while (nextTime < horizon) {
			options.onStep({ time: nextTime, bar, step });
			nextTime += options.secondsPerStep;
			step += 1;
			if (step === options.stepsPerBar) {
				step = 0;
				bar += 1;
			}
		}
	}

	function start(fromBar: number, startTime: number): void {
		if (timer !== null) return;
		bar = fromBar;
		step = 0;
		nextTime = startTime;
		tick();
		timer = options.clock.every(tick, lookaheadMs);
	}

	function stop(): number {
		if (timer !== null) options.clock.stop(timer);
		timer = null;
		return step === 0 ? bar : bar + 1;
	}

	return { start, stop, isRunning: () => timer !== null };
}
