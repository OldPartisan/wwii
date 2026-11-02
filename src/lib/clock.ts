import gsap from 'gsap';
import { useSyncExternalStore } from 'react';
import { clampDay, toDay, TOTAL_DAYS } from './date';

type FrameSub = (day: number) => void;
type VoidSub = () => void;

class Clock {
  day = toDay('1939-09-01');
  playing = false;
  /** Days per real second. */
  speed = 7;

  private frameSubs = new Set<FrameSub>();
  private uiSubs = new Set<VoidSub>();
  private stateSubs = new Set<VoidSub>();
  private uiDay = this.day;
  private lastUi = 0;
  private version = 0;
  private running = false;

  start(): void {
    if (this.running) return;
    this.running = true;
    gsap.ticker.add(this.tick);
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;
    gsap.ticker.remove(this.tick);
  }

  private tick = (_time: number, deltaMs: number): void => {
    if (this.playing) {
      const dt = Math.min(deltaMs, 120) / 1000;
      const next = this.day + dt * this.speed;
      if (next >= TOTAL_DAYS) {
        this.day = TOTAL_DAYS;
        this.playing = false;
        this.emitState();
      } else {
        this.day = next;
      }
      this.emitFrame();
    }
    const now = performance.now();
    if (now - this.lastUi > 80) {
      this.lastUi = now;
      if (this.uiDay !== this.day) {
        this.uiDay = this.day;
        this.uiSubs.forEach((f) => f());
      }
    }
  };

  setDay(day: number): void {
    const clamped = clampDay(day);
    if (clamped === this.day) return;
    this.day = clamped;
    this.emitFrame();
    this.emitUi(true);
  }

  setPlaying(playing: boolean): void {
    if (this.playing === playing) return;
    if (playing && this.day >= TOTAL_DAYS) this.day = 0;
    this.playing = playing;
    this.emitState();
    this.emitUi(true);
  }

  toggle(): void {
    this.setPlaying(!this.playing);
  }

  setSpeed(speed: number): void {
    this.speed = speed;
    this.emitState();
  }

  private emitFrame(): void {
    this.frameSubs.forEach((f) => f(this.day));
  }

  private emitUi(force = false): void {
    if (force || this.uiDay !== this.day) {
      this.uiDay = this.day;
      this.lastUi = performance.now();
      this.uiSubs.forEach((f) => f());
    }
  }

  private emitState(): void {
    this.version++;
    this.stateSubs.forEach((f) => f());
  }

  subscribeFrame = (cb: FrameSub): (() => void) => {
    this.frameSubs.add(cb);
    cb(this.day);
    return () => this.frameSubs.delete(cb);
  };

  subscribeUi = (cb: VoidSub): (() => void) => {
    this.uiSubs.add(cb);
    return () => this.uiSubs.delete(cb);
  };

  subscribeState = (cb: VoidSub): (() => void) => {
    this.stateSubs.add(cb);
    return () => this.stateSubs.delete(cb);
  };

  getUiDay = (): number => this.uiDay;
  getVersion = (): number => this.version;
}

export const clock = new Clock();

export function useDay(): number {
  return useSyncExternalStore(clock.subscribeUi, clock.getUiDay, clock.getUiDay);
}

export function usePlayback(): { playing: boolean; speed: number } {
  useSyncExternalStore(clock.subscribeState, clock.getVersion, clock.getVersion);
  return { playing: clock.playing, speed: clock.speed };
}
