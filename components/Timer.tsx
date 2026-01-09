"use client";

import { useEffect, useState } from "react";
import { useTimerStore } from "@/store/timer-store";

export default function Timer() {
  const {
    isRunning,
    isPaused,
    currentTime,
    duration,
    timerType,
    currentTaskName,

    sessions,
    setCurrentTask,
    tasks,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTimerType,
    tick,
  } = useTimerStore();

  const completedSessionsCount = sessions.filter((s) => s.completed).length;

  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskInput, setTaskInput] = useState("");

  // Timer tick effect
  useEffect(() => {
    if (!isRunning || isPaused) return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, tick]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate progress percentage
  const progress = ((duration - currentTime) / duration) * 100;

  // Play sound when timer completes
  useEffect(() => {
    if (currentTime === 0 && isRunning) {
      // Play notification sound using Web Audio API
      try {
        const AudioContextClass =
          window.AudioContext ||
          (
            window as typeof AudioContext & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext;
        if (!AudioContextClass) return;
        const audioContext = new AudioContextClass();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Higher pitch
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + 0.5,
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch {
        console.log("Timer completed! (audio not available)");
      }
    }
  }, [currentTime, isRunning]);

  const handleStart = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      startTimer();
    }
  };

  const handleTaskSubmit = () => {
    if (taskInput.trim()) {
      // Check if task exists
      const existingTask = tasks.find(
        (t) => t.name.toLowerCase() === taskInput.trim().toLowerCase(),
      );
      if (existingTask) {
        setCurrentTask(existingTask.id, existingTask.name);
      } else {
        // Quick entry - just set the name
        setCurrentTask(undefined, taskInput.trim());
      }
      setTaskInput("");
      setIsEditingTask(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      {/* Timer Type Selection */}
      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
        {(["work", "shortBreak", "longBreak"] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setTimerType(type);
            }}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              timerType === type
                ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-md"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            {type === "work"
              ? "Pomodoro"
              : type === "shortBreak"
                ? "Short Break"
                : "Long Break"}
          </button>
        ))}
      </div>

      {/* Circular Progress */}
      <div className="relative w-72 h-72">
        <svg className="transform -rotate-90 w-72 h-72 drop-shadow-lg">
          {/* Background circle */}
          <circle
            cx="144"
            cy="144"
            r="135"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            className="text-zinc-200 dark:text-zinc-800"
          />
          {/* Progress circle */}
          <circle
            cx="144"
            cy="144"
            r="135"
            stroke="currentColor"
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 135}`}
            strokeDashoffset={`${2 * Math.PI * 135 * (1 - progress / 100)}`}
            className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-linear drop-shadow-md"
            strokeLinecap="round"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Current Task/Session Info */}
      <div className="text-center space-y-2 min-w-[300px]">
        {isEditingTask ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTaskSubmit();
                if (e.key === "Escape") {
                  setIsEditingTask(false);
                  setTaskInput("");
                }
              }}
              placeholder="What are you focusing on?"
              className="flex-1 px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
            />
            <button
              onClick={handleTaskSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {completedSessionsCount > 0 && (
              <div className="text-sm font-medium text-zinc-500 dark:text-zinc-500">
                #{completedSessionsCount}
              </div>
            )}
            {currentTaskName ? (
              <>
                <div className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl inline-block">
                  {currentTaskName}
                </div>
                <div>
                  <button
                    onClick={() => {
                      setIsEditingTask(true);
                      setTaskInput(currentTaskName);
                    }}
                    className="text-xs text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => setIsEditingTask(true)}
                className="text-sm text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                + Add focus task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            Start
          </button>
        ) : (
          <button
            onClick={isPaused ? resumeTimer : pauseTimer}
            className="px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}

        <button
          onClick={resetTimer}
          className="px-10 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
