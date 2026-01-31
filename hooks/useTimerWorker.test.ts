import { describe, it, expect, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimerWorker } from "./useTimerWorker";
import { useTimerStore } from "@/store/timer-store";
import { resetTimerStore, mockWorkerInstance } from "../vitest.setup";

describe("useTimerWorker", () => {
  beforeEach(() => {
    resetTimerStore();
    document.title = "";
  });

  describe("document title", () => {
    it("updates document title when timer is running", () => {
      useTimerStore.setState({
        isRunning: true,
        currentTime: 24 * 60 + 30, // 24:30
        timerType: "work",
      });
      renderHook(() => useTimerWorker());

      expect(document.title).toBe("24:30 - Pomodoro");
    });

    it("updates document title for short break", () => {
      useTimerStore.setState({
        isRunning: true,
        currentTime: 4 * 60, // 04:00
        timerType: "shortBreak",
      });
      renderHook(() => useTimerWorker());

      expect(document.title).toBe("04:00 - Short Break");
    });

    it("updates document title for long break", () => {
      useTimerStore.setState({
        isRunning: true,
        currentTime: 14 * 60, // 14:00
        timerType: "longBreak",
      });
      renderHook(() => useTimerWorker());

      expect(document.title).toBe("14:00 - Long Break");
    });

    it("resets document title when timer is not running", () => {
      useTimerStore.setState({
        isRunning: false,
        isPaused: false,
      });
      renderHook(() => useTimerWorker());

      expect(document.title).toBe("Pomodoro Timer");
    });
  });

  describe("worker setup", () => {
    it("sets up worker onmessage handler", () => {
      renderHook(() => useTimerWorker());

      expect(mockWorkerInstance.onmessage).not.toBeNull();
    });

    it("sends start message when running and not paused", () => {
      useTimerStore.setState({ isRunning: true, isPaused: false });
      renderHook(() => useTimerWorker());

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith("start");
    });

    it("sends stop message when paused", () => {
      useTimerStore.setState({ isRunning: true, isPaused: true });
      renderHook(() => useTimerWorker());

      expect(mockWorkerInstance.postMessage).toHaveBeenCalledWith("stop");
    });
  });
});
