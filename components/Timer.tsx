"use client";

import { useEffect, useState, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { playClickSound as playClick } from "@/lib/sounds";
import { formatTime } from "@/lib/timer-utils";
import { EditIcon } from "./Icons";

type TimerType = "work" | "shortBreak" | "longBreak";

const MODE_LABELS: Record<TimerType, string> = {
  work: "Pomodoro",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

// Full class names so Tailwind can detect them
const MODE_STYLES: Record<
  TimerType,
  { text: string; ring: string; glow: string; dot: string; button: string }
> = {
  work: {
    text: "text-blue-600 dark:text-blue-400",
    ring: "text-blue-600 dark:text-blue-400",
    glow: "bg-blue-500",
    dot: "bg-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 shadow-blue-600/25",
  },
  shortBreak: {
    text: "text-emerald-600 dark:text-emerald-400",
    ring: "text-emerald-500 dark:text-emerald-400",
    glow: "bg-emerald-500",
    dot: "bg-emerald-500",
    button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25",
  },
  longBreak: {
    text: "text-violet-600 dark:text-violet-400",
    ring: "text-violet-500 dark:text-violet-400",
    glow: "bg-violet-500",
    dot: "bg-violet-500",
    button: "bg-violet-600 hover:bg-violet-700 shadow-violet-600/25",
  },
};

interface MotivationalQuote {
  text: string;
  author: string;
}

// Motivational quotes to show after pomodoro completion
const MOTIVATIONAL_QUOTES: MotivationalQuote[] = [
  {
    text: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  {
    text: "Small daily improvements lead to stunning results.",
    author: "Robin Sharma",
  },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg" },
  {
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    text: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "One pomodoro at a time.", author: "Francesco Cirillo" },
  {
    text: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Discipline is choosing between what you want now and what you want most.",
    author: "Abraham Lincoln",
  },
  {
    text: "Your future is created by what you do today, not tomorrow.",
    author: "Robert Kiyosaki",
  },
  {
    text: "It's not about having time, it's about making time.",
    author: "Unknown",
  },
  {
    text: "Every accomplishment starts with the decision to try.",
    author: "John F. Kennedy",
  },
  { text: "The harder you work, the luckier you get.", author: "Gary Player" },
];

export default function Timer() {
  const {
    isRunning,
    isPaused,
    currentTime,
    duration,
    timerType,
    currentTaskName,
    quotesEnabled,

    sessions,
    setCurrentTask,
    tasks,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    setTimerType,
  } = useTimerStore();

  const completedSessionsCount = sessions.filter((s) => s.completed).length;

  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskInput, setTaskInput] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  // Calculate progress percentage
  const progress = ((duration - currentTime) / duration) * 100;

  const handleClickSound = () => {
    const { soundEnabled, clickSoundType } = useTimerStore.getState();
    if (soundEnabled && clickSoundType !== "none") {
      playClick();
    }
  };

  // Track previous time to detect completion (for quote modal)
  const prevTimeRef = useRef(currentTime);
  const prevTimerTypeRef = useRef(timerType);

  // Show motivational quote when timer completes
  useEffect(() => {
    if (prevTimeRef.current > 0 && currentTime === 0) {
      if (quotesEnabled && prevTimerTypeRef.current === "work") {
        const randomQuote =
          MOTIVATIONAL_QUOTES[
            Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
          ];
        setCurrentQuote(randomQuote);
        setShowQuote(true);
      }
    }
    prevTimeRef.current = currentTime;
    prevTimerTypeRef.current = timerType;
  }, [currentTime, quotesEnabled, timerType]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault(); // Prevent page scroll
          if (isRunning && !isPaused) {
            pauseTimer();
          } else if (isPaused) {
            resumeTimer();
          } else {
            handleClickSound();
            startTimer();
          }
          break;
        case "r":
        case "R":
          resetTimer();
          break;
        case "Escape":
          if (showQuote) {
            setShowQuote(false);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isRunning,
    isPaused,
    pauseTimer,
    resumeTimer,
    resetTimer,
    startTimer,
    showQuote,
  ]);

  const handleStart = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      handleClickSound();
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

  const accent = MODE_STYLES[timerType];
  const statusLabel = isPaused
    ? "Paused"
    : isRunning
      ? timerType === "work"
        ? "Focusing"
        : "On a break"
      : MODE_LABELS[timerType];

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-6 py-10 w-full max-w-md">
      {/* Timer Type Selection */}
      <div
        role="group"
        aria-label="Timer mode"
        className="grid grid-cols-3 gap-1 w-full bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-2xl"
      >
        {(["work", "shortBreak", "longBreak"] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setTimerType(type);
            }}
            aria-pressed={timerType === type}
            className={`px-3 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              timerType === type
                ? `bg-white dark:bg-zinc-700 shadow-sm ${MODE_STYLES[type].text}`
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {MODE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Circular Progress */}
      <div className="relative w-72 h-72">
        <div
          aria-hidden
          className={`absolute inset-8 rounded-full blur-3xl opacity-20 dark:opacity-25 transition-colors duration-500 ${accent.glow}`}
        />
        <svg className="relative transform -rotate-90 w-72 h-72">
          {/* Background circle */}
          <circle
            cx="144"
            cy="144"
            r="135"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-zinc-200/80 dark:text-zinc-800"
          />
          {/* Progress circle */}
          <circle
            cx="144"
            cy="144"
            r="135"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 135}`}
            strokeDashoffset={`${2 * Math.PI * 135 * (1 - progress / 100)}`}
            className={`${accent.ring} transition-all duration-1000 ease-linear`}
            strokeLinecap="round"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
          <div
            className={`text-xs font-semibold uppercase tracking-[0.2em] ${
              isRunning && !isPaused ? accent.text : "text-zinc-400 dark:text-zinc-500"
            } transition-colors`}
          >
            {statusLabel}
          </div>
          <div className="text-7xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatTime(currentTime)}
          </div>
          {completedSessionsCount > 0 && (
            <div className="text-sm font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
              #{completedSessionsCount}
            </div>
          )}
        </div>
      </div>

      {/* Current Task/Session Info */}
      <div className="w-full flex justify-center min-h-[52px]">
        {isEditingTask ? (
          <div className="flex items-center gap-2 w-full">
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
              className="flex-1 min-w-0 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              autoFocus
            />
            <button
              onClick={handleTaskSubmit}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95"
            >
              Save
            </button>
          </div>
        ) : currentTaskName ? (
          <div className="flex items-center gap-1 max-w-full pl-4 pr-1 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full">
            <span className={`w-2 h-2 shrink-0 rounded-full ${accent.dot}`} />
            <span className="ml-1.5 truncate text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {currentTaskName}
            </span>
            <button
              onClick={() => {
                setIsEditingTask(true);
                setTaskInput(currentTaskName);
              }}
              aria-label="Edit"
              title="Change focus task"
              className="ml-1 p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <EditIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditingTask(true)}
            className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-4 py-2 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-full"
          >
            + Add focus task
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={!isRunning ? handleStart : isPaused ? resumeTimer : pauseTimer}
            className={`min-w-40 px-10 py-3.5 text-white rounded-full text-base font-semibold transition-all shadow-lg active:scale-95 ${accent.button}`}
          >
            {!isRunning ? "Start" : isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={resetTimer}
            className="px-6 py-3.5 rounded-full text-base font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
          >
            Reset
          </button>
        </div>
        <p className="hidden md:block text-xs text-zinc-400 dark:text-zinc-500">
          <kbd className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-sans">Space</kbd>{" "}
          start / pause ·{" "}
          <kbd className="px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-sans">R</kbd>{" "}
          reset
        </p>
      </div>

      {/* Motivational Quote Modal */}
      {showQuote && (
        <div
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuote(false)}
        >
          <div
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Great work!
              </h3>
              <blockquote className="text-lg text-zinc-700 dark:text-zinc-300 italic">
                &ldquo;{currentQuote.text}&rdquo;
              </blockquote>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                — {currentQuote.author}
              </p>
              <button
                onClick={() => setShowQuote(false)}
                className="mt-4 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-all shadow-sm active:scale-95"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
