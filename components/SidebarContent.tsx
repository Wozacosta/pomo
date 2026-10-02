"use client";

import { useRef, useState } from "react";
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
    exportData,
    importData,
  } = useTimerStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importData(event.target?.result as string);
      if (result.success) {
        setImportStatus({
          type: "success",
          message: "Data imported successfully.",
        });
      } else {
        setImportStatus({
          type: "error",
          message: result.error || "Import failed.",
        });
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);

    // Reset input so the same file can be re-imported
    e.target.value = "";
  };

  return (
    <div className="space-y-7">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 p-4 rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
          <div className="text-xs font-medium text-blue-100">
            Total Completed
          </div>
          <div className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
            {totalCompleted}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Current Streak
          </div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {currentStreak} {currentStreak === 1 ? "day" : "days"}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Longest Streak
          </div>
          <div className="mt-1 text-xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {longestStreak} {longestStreak === 1 ? "day" : "days"}
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <TasksList />

      {/* Sound Settings */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Sound Settings
        </h3>
        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
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
              className="px-2.5 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="px-2.5 py-1.5 text-sm bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="click">Click</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quote Settings */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Motivational Quotes
        </h3>
        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
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

      {/* Data Management */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Data
        </h3>
        <div className="space-y-3 p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
          <div className="flex gap-2">
            <button
              onClick={exportData}
              className="flex-1 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
          {importStatus && (
            <div
              className={`text-xs px-2 py-1.5 rounded-lg ${
                importStatus.type === "success"
                  ? "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950"
                  : "text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950"
              }`}
            >
              {importStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Recent Sessions */}
      <div>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Recent Sessions
        </h3>
        {sessions.length > 0 ? (
          <ul className="divide-y divide-zinc-200/80 dark:divide-zinc-800 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 overflow-hidden">
            {sessions
              .slice(-5)
              .reverse()
              .map((session) => (
                <li
                  key={session.id}
                  className="flex items-center gap-3 px-3.5 py-2.5 text-sm"
                >
                  <span
                    className={`w-1.5 h-1.5 shrink-0 rounded-full ${
                      session.completed ? "bg-green-500" : "bg-zinc-400"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                      {session.subject || "No task"}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(session.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • {session.duration} min •{" "}
                      {session.completed ? "✓ Completed" : "Incomplete"}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <div className="p-4 text-sm text-zinc-500 dark:text-zinc-400 text-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
            No sessions yet
          </div>
        )}
      </div>
    </div>
  );
}
