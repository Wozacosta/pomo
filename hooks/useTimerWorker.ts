import { useEffect, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { playEndSound } from "@/lib/sounds";
import { formatTime, getTimerLabel } from "@/lib/timer-utils";

/**
 * Hook that manages the timer Web Worker, sound playback on completion,
 * and document title updates. Must be mounted at the top level (page.tsx)
 * so it persists across view switches (timer / report).
 */
export function useTimerWorker() {
  const { isRunning, isPaused, currentTime, timerType, tick } = useTimerStore();

  const workerRef = useRef<Worker | null>(null);
  const prevTimeRef = useRef<number | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    workerRef.current = new Worker("/timer-worker.js");
    workerRef.current.onmessage = () => {
      tick();
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, [tick]);

  // Start/stop worker based on timer state
  useEffect(() => {
    if (isRunning && !isPaused) {
      workerRef.current?.postMessage("start");
    } else {
      workerRef.current?.postMessage("stop");
    }
  }, [isRunning, isPaused]);

  // Update document title with countdown
  useEffect(() => {
    const label = getTimerLabel(timerType);

    if (isRunning || isPaused) {
      document.title = `${formatTime(currentTime)} - ${label}`;
    } else {
      document.title = "Pomodoro Timer";
    }

    return () => {
      document.title = "Pomodoro Timer";
    };
  }, [currentTime, timerType, isRunning, isPaused]);

  // Play sound when timer completes (detects transition to 0)
  // Reads soundEnabled/endSoundType from store at call time to avoid stale closures.
  // prevTimeRef starts as null to prevent false-trigger on hydration.
  useEffect(() => {
    if (
      prevTimeRef.current !== null &&
      prevTimeRef.current > 0 &&
      currentTime === 0
    ) {
      const { soundEnabled, endSoundType } = useTimerStore.getState();
      if (soundEnabled) {
        playEndSound(endSoundType);
      }
    }
    prevTimeRef.current = currentTime;
  }, [currentTime]);
}
