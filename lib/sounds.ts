import type { EndSoundType, ClickSoundType } from "@/store/timer-store";

function getAudioContext(): AudioContext | null {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextClass) return null;
  return new AudioContextClass();
}

let sharedAudioContext: AudioContext | null = null;

async function getSharedAudioContext(): Promise<AudioContext | null> {
  try {
    if (!sharedAudioContext) {
      sharedAudioContext = getAudioContext();
    }
    if (sharedAudioContext?.state === "suspended") {
      await sharedAudioContext.resume();
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

export function playClickSound(): void {
  getSharedAudioContext().then((audioContext) => {
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 1200;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.05
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.05);
    } catch {
      // Audio playback failed
    }
  });
}

function playJingleSound(audioContext: AudioContext): void {
  const notes = [523.25, 659.25, 783.99];
  const noteDuration = 0.15;

  notes.forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = freq;
    oscillator.type = "sine";

    const startTime = audioContext.currentTime + i * noteDuration;
    gainNode.gain.setValueAtTime(0.3, startTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      startTime + noteDuration * 1.5
    );

    oscillator.start(startTime);
    oscillator.stop(startTime + noteDuration * 1.5);
  });
}

function playBirdsSound(audioContext: AudioContext): void {
  const chirps = [
    { freq: 2500, delay: 0 },
    { freq: 3000, delay: 0.1 },
    { freq: 2800, delay: 0.15 },
    { freq: 3200, delay: 0.3 },
    { freq: 2600, delay: 0.35 },
    { freq: 3100, delay: 0.5 },
  ];

  chirps.forEach(({ freq, delay }) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = freq;
    oscillator.type = "sine";

    const startTime = audioContext.currentTime + delay;
    oscillator.frequency.setValueAtTime(freq, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      freq * 1.2,
      startTime + 0.03
    );
    oscillator.frequency.exponentialRampToValueAtTime(
      freq * 0.8,
      startTime + 0.06
    );

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);

    oscillator.start(startTime);
    oscillator.stop(startTime + 0.1);
  });
}

function playRingSound(audioContext: AudioContext): void {
  const fundamentalFreq = 800;
  const harmonics = [1, 2, 3, 4.5];
  const duration = 0.8;

  harmonics.forEach((harmonic, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = fundamentalFreq * harmonic;
    oscillator.type = "sine";

    const startTime = audioContext.currentTime;
    const volume = 0.25 / (i + 1);
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  });
}

export function playEndSound(soundType: EndSoundType): void {
  if (soundType === "none") return;

  getSharedAudioContext().then((audioContext) => {
    if (!audioContext) return;

    try {
      switch (soundType) {
        case "jingle":
          playJingleSound(audioContext);
          break;
        case "birds":
          playBirdsSound(audioContext);
          break;
        case "ring":
          playRingSound(audioContext);
          break;
        default:
          playJingleSound(audioContext);
      }
    } catch {
      // Audio playback failed
    }
  });
}

export function previewClickSound(soundType: ClickSoundType): void {
  if (soundType === "none") return;
  playClickSound();
}

export function previewEndSound(soundType: EndSoundType): void {
  playEndSound(soundType);
}
