import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { useTimerStore } from "@/store/timer-store";
import { useThemeStore } from "@/store/theme-store";

// Mock Worker class
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  onerror: ((e: ErrorEvent) => void) | null = null;

  postMessage = vi.fn();
  terminate = vi.fn();

  // Helper to simulate tick from outside
  simulateTick() {
    this.onmessage?.({ data: "tick" } as MessageEvent);
  }
}

export let mockWorkerInstance: MockWorker = new MockWorker();

// Use a class that wraps MockWorker for proper constructor behavior
vi.stubGlobal(
  "Worker",
  class {
    constructor() {
      mockWorkerInstance = new MockWorker();
      return mockWorkerInstance;
    }
  },
);

// Mock AudioContext
const mockAudioContext = {
  createOscillator: vi.fn(() => ({
    type: "sine",
    frequency: { setValueAtTime: vi.fn() },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
    connect: vi.fn(),
  })),
  destination: {},
  currentTime: 0,
};

vi.stubGlobal(
  "AudioContext",
  vi.fn(() => mockAudioContext),
);
vi.stubGlobal(
  "webkitAudioContext",
  vi.fn(() => mockAudioContext),
);

// Store reset helpers
export function resetTimerStore() {
  useTimerStore.setState({
    isRunning: false,
    isPaused: false,
    currentTime: 25 * 60,
    duration: 25 * 60,
    endTime: null,
    pausedTimeRemaining: null,
    timerType: "work",
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    tasks: [],
    sessions: [],
    totalCompleted: 0,
    currentStreak: 0,
    longestStreak: 0,
    currentTaskId: undefined,
    currentTaskName: undefined,
  });
}

export function resetThemeStore() {
  useThemeStore.setState({
    theme: "light",
    manuallySet: false,
  });
  // Reset DOM classList
  document.documentElement.classList.remove("dark", "light");
}

// Clean up before each test
beforeEach(() => {
  localStorage.clear();
  resetTimerStore();
  resetThemeStore();
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
