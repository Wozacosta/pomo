"use client";

import { useEffect, useState, useRef } from "react";
import { useTimerStore } from "@/store/timer-store";
import { playClickSound as playClick } from "@/lib/sounds";
import { formatTime } from "@/lib/timer-utils";

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

      {/* Motivational Quote Modal */}
      {showQuote && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowQuote(false)}
        >
          <div
            className="bg-white dark:bg-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center space-y-4">
              <div className="text-4xl">🎉</div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                Great work!
              </h3>
              <blockquote className="text-lg text-zinc-700 dark:text-zinc-300 italic">
                "{currentQuote.text}"
              </blockquote>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                — {currentQuote.author}
              </p>
              <button
                onClick={() => setShowQuote(false)}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-md active:scale-95"
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
