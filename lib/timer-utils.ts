/**
 * Format seconds into MM:SS display string.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Get display label for a timer type.
 */
export function getTimerLabel(
  timerType: "work" | "shortBreak" | "longBreak",
): string {
  switch (timerType) {
    case "work":
      return "Pomodoro";
    case "shortBreak":
      return "Short Break";
    case "longBreak":
      return "Long Break";
  }
}
