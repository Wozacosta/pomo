import { describe, it, expect, vi, beforeEach } from "vitest";

// We need to reset the module to clear the shared AudioContext between tests
// Import fresh each time
describe("sounds", () => {
  let playClickSound: () => void;
  let playEndSound: (type: "jingle" | "birds" | "ring" | "none") => void;
  let previewClickSound: (type: "click" | "none") => void;
  let previewEndSound: (type: "jingle" | "birds" | "ring" | "none") => void;

  let createOscillatorSpy: ReturnType<typeof vi.fn>;
  let createGainSpy: ReturnType<typeof vi.fn>;
  let resumeSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Reset module cache to get fresh sharedAudioContext
    vi.resetModules();

    // Create fresh spies
    createOscillatorSpy = vi.fn(() => ({
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      type: "sine",
    }));

    createGainSpy = vi.fn(() => ({
      connect: vi.fn(),
      gain: {
        value: 0,
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      },
    }));

    resumeSpy = vi.fn().mockResolvedValue(undefined);

    const mockAudioContext = {
      createOscillator: createOscillatorSpy,
      createGain: createGainSpy,
      destination: {},
      currentTime: 0,
      state: "running",
      resume: resumeSpy,
    };

    // Use class constructor for AudioContext
    vi.stubGlobal(
      "AudioContext",
      class {
        createOscillator = createOscillatorSpy;
        createGain = createGainSpy;
        destination = {};
        currentTime = 0;
        state = "running";
        resume = resumeSpy;
      },
    );

    // Import fresh module
    const sounds = await import("./sounds");
    playClickSound = sounds.playClickSound;
    playEndSound = sounds.playEndSound;
    previewClickSound = sounds.previewClickSound;
    previewEndSound = sounds.previewEndSound;
  });

  describe("playClickSound", () => {
    it("creates oscillator and gain node", async () => {
      playClickSound();
      await new Promise((r) => setTimeout(r, 10));

      expect(createOscillatorSpy).toHaveBeenCalled();
      expect(createGainSpy).toHaveBeenCalled();
    });
  });

  describe("playEndSound", () => {
    it("does nothing when sound type is none", async () => {
      playEndSound("none");
      await new Promise((r) => setTimeout(r, 10));

      expect(createOscillatorSpy).not.toHaveBeenCalled();
    });

    it("plays jingle sound with multiple notes", async () => {
      playEndSound("jingle");
      await new Promise((r) => setTimeout(r, 10));

      // Jingle plays 3 notes
      expect(createOscillatorSpy).toHaveBeenCalledTimes(3);
    });

    it("plays birds sound with multiple chirps", async () => {
      playEndSound("birds");
      await new Promise((r) => setTimeout(r, 10));

      // Birds plays 6 chirps
      expect(createOscillatorSpy).toHaveBeenCalledTimes(6);
    });

    it("plays ring sound with multiple harmonics", async () => {
      playEndSound("ring");
      await new Promise((r) => setTimeout(r, 10));

      // Ring plays 4 harmonics
      expect(createOscillatorSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe("previewClickSound", () => {
    it("does nothing when sound type is none", async () => {
      previewClickSound("none");
      await new Promise((r) => setTimeout(r, 10));

      expect(createOscillatorSpy).not.toHaveBeenCalled();
    });

    it("plays click sound for click type", async () => {
      previewClickSound("click");
      await new Promise((r) => setTimeout(r, 10));

      expect(createOscillatorSpy).toHaveBeenCalled();
    });
  });

  describe("previewEndSound", () => {
    it("plays the specified end sound type", async () => {
      previewEndSound("ring");
      await new Promise((r) => setTimeout(r, 10));

      // Ring plays 4 harmonics
      expect(createOscillatorSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe("AudioContext handling", () => {
    it("handles missing AudioContext gracefully", async () => {
      vi.resetModules();
      vi.stubGlobal("AudioContext", undefined);
      vi.stubGlobal("webkitAudioContext", undefined);

      const sounds = await import("./sounds");

      // Should not throw
      expect(() => sounds.playClickSound()).not.toThrow();
    });
  });
});
