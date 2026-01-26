"use client";

import { useTimerStore } from "@/store/timer-store";
import type { EndSoundType, ClickSoundType } from "@/store/timer-store";
import { previewEndSound, previewClickSound } from "@/lib/sounds";
import TasksList from "./TasksList";

export default function SidebarContent() {
  const {
    sessions,
    totalCompleted,
    currentStreak,
    longestStreak,
    soundEnabled,
    endSoundType,
    clickSoundType,
    quotesEnabled,
    updateSoundSettings,
    updateQuoteSettings,
  } = useTimerStore();

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="space-y-3">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Total Completed
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {totalCompleted}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
          <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
            Current Streak
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
          <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">
            Longest Streak
          </div>
          <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
            {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <TasksList />

      {/* Sound Settings */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Sound Settings
        </h3>
        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          {/* Master Mute Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="sound-enabled-toggle"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              Sound Enabled
            </label>
            <button
              id="sound-enabled-toggle"
              role="switch"
              aria-checked={soundEnabled}
              aria-label="Toggle sound enabled"
              onClick={() =>
                updateSoundSettings({ soundEnabled: !soundEnabled })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  updateSoundSettings({ soundEnabled: !soundEnabled });
                }
              }}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                soundEnabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  soundEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* End Sound Selection */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="end-sound-select"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              End Sound
            </label>
            <select
              id="end-sound-select"
              value={endSoundType}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  value === "jingle" ||
                  value === "birds" ||
                  value === "ring" ||
                  value === "none"
                ) {
                  updateSoundSettings({ endSoundType: value });
                  previewEndSound(value);
                }
              }}
              disabled={!soundEnabled}
              className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="jingle">Jingle</option>
              <option value="birds">Birds</option>
              <option value="ring">Ring</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Click Sound Selection */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="click-sound-select"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              Click Sound
            </label>
            <select
              id="click-sound-select"
              value={clickSoundType}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "click" || value === "none") {
                  updateSoundSettings({ clickSoundType: value });
                  previewClickSound(value);
                }
              }}
              disabled={!soundEnabled}
              className="px-3 py-1.5 text-sm bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="click">Click</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quote Settings */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Motivational Quotes
        </h3>
        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center justify-between">
            <label
              htmlFor="quotes-enabled-toggle"
              className="text-sm text-zinc-700 dark:text-zinc-300"
            >
              Show after Pomodoro
            </label>
            <button
              id="quotes-enabled-toggle"
              role="switch"
              aria-checked={quotesEnabled}
              aria-label="Toggle motivational quotes"
              onClick={() =>
                updateQuoteSettings({ quotesEnabled: !quotesEnabled })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  updateQuoteSettings({ quotesEnabled: !quotesEnabled });
                }
              }}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                quotesEnabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  quotesEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          Recent Sessions
        </h3>
        <div className="space-y-2">
          {sessions
            .slice(-5)
            .reverse()
            .map((session) => (
              <div
                key={session.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                  {new Date(session.startTime).toLocaleTimeString()}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-xs">
                  {session.duration} min • {session.subject || "No task"} •{" "}
                  {session.completed ? "✓ Completed" : "Incomplete"}
                </div>
              </div>
            ))}
          {sessions.length === 0 && (
            <div className="p-4 text-sm text-zinc-500 dark:text-zinc-500 text-center bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
              No sessions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
