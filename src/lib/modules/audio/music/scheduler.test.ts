import { describe, expect, it } from 'vitest';
import {
	createStepScheduler,
	type ScheduledStep,
	type SchedulerClock,
	type TimerHandle
} from './scheduler';

interface FakeClock extends SchedulerClock {
	advance: (seconds: number) => void;
	active: () => number;
}

function fakeClock(): FakeClock {
	let now = 0;
	let nextId = 1;
	const timers = new Map<number, () => void>();

	return {
		now: () => now,
		every: (callback) => {
			const id = nextId;
			nextId += 1;
			timers.set(id, callback);
			return id as unknown as TimerHandle;
		},
		stop: (timer) => {
			timers.delete(timer as unknown as number);
		},
		advance: (seconds) => {
			const target = now + seconds;
			while (now < target) {
				now = Math.min(target, now + 0.025);
				for (const callback of timers.values()) callback();
			}
		},
		active: () => timers.size
	};
}

function collect(clock: FakeClock, steps: ScheduledStep[]): ReturnType<typeof createStepScheduler> {
	return createStepScheduler({
		clock,
		secondsPerStep: 0.25,
		stepsPerBar: 4,
		onStep: (scheduled) => steps.push(scheduled)
	});
}

describe('agendador com lookahead', () => {
	it('agenda só até o horizonte e em tempos exatos', () => {
		const clock = fakeClock();
		const steps: ScheduledStep[] = [];
		const scheduler = collect(clock, steps);

		scheduler.start(0, 0.1);
		expect(steps).toEqual([{ time: 0.1, bar: 0, step: 0 }]);

		clock.advance(1);
		expect(steps.map((item) => item.time)).toEqual([0.1, 0.35, 0.6, 0.85, 1.1]);
		expect(steps.map((item) => [item.bar, item.step])).toEqual([
			[0, 0],
			[0, 1],
			[0, 2],
			[0, 3],
			[1, 0]
		]);
	});

	it('não agenda duas vezes o mesmo passo e para sem deixar timer', () => {
		const clock = fakeClock();
		const steps: ScheduledStep[] = [];
		const scheduler = collect(clock, steps);

		scheduler.start(0, 0);
		scheduler.start(0, 0);
		clock.advance(3);
		const keys = steps.map((item) => `${item.bar}:${item.step}`);
		expect(new Set(keys).size).toBe(keys.length);
		expect(clock.active()).toBe(1);

		scheduler.stop();
		expect(clock.active()).toBe(0);
		expect(scheduler.isRunning()).toBe(false);
		const count = steps.length;
		clock.advance(2);
		expect(steps).toHaveLength(count);
	});

	it('retoma no começo do compasso seguinte ao parar', () => {
		const clock = fakeClock();
		const steps: ScheduledStep[] = [];
		const scheduler = collect(clock, steps);

		scheduler.start(2, 0);
		clock.advance(0.5);
		const resumeBar = scheduler.stop();
		expect(resumeBar).toBe(3);

		scheduler.start(resumeBar, clock.now());
		expect(steps.at(-1)).toMatchObject({ bar: 3, step: 0 });
	});
});
