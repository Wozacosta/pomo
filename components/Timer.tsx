'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/timer-store';

export default function Timer() {
  const {
    isRunning,
    isPaused,
    currentTime,
    duration,
    timerType,
    currentTaskName,
    currentTaskId,
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
  
  const completedSessionsCount = sessions.filter(s => s.completed).length;
  
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [taskInput, setTaskInput] = useState('');

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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progress = ((duration - currentTime) / duration) * 100;

  // Play sound when timer completes
  useEffect(() => {
    if (currentTime === 0 && isRunning) {
      // Play notification sound using Web Audio API
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800; // Higher pitch
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        console.log('Timer completed! (audio not available)');
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
      const existingTask = tasks.find(t => t.name.toLowerCase() === taskInput.trim().toLowerCase());
      if (existingTask) {
        setCurrentTask(existingTask.id, existingTask.name);
      } else {
        // Quick entry - just set the name
        setCurrentTask(undefined, taskInput.trim());
      }
      setTaskInput('');
      setIsEditingTask(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-8 p-8">
      {/* Timer Type Selection */}
      <div className="flex gap-2">
        {(['work', 'shortBreak', 'longBreak'] as const).map((type) => (
          <button
            key={type}
            onClick={() => {
              setTimerType(type);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timerType === type
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {type === 'work' ? 'Pomodoro' : type === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </button>
        ))}
      </div>

      {/* Circular Progress */}
      <div className="relative w-64 h-64">
        <svg className="transform -rotate-90 w-64 h-64">
          {/* Background circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-zinc-200 dark:text-zinc-800"
          />
          {/* Progress circle */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 120}`}
            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
            className="text-blue-600 dark:text-blue-400 transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Time Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            {formatTime(currentTime)}
          </div>
        </div>
      </div>

      {/* Current Task/Session Info */}
      <div className="text-center space-y-1">
        {isEditingTask ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTaskSubmit();
                if (e.key === 'Escape') {
                  setIsEditingTask(false);
                  setTaskInput('');
                }
              }}
              placeholder="What are you focusing on?"
              className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleTaskSubmit}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {completedSessionsCount > 0 && (
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                #{completedSessionsCount}
              </div>
            )}
            {currentTaskName ? (
              <>
                <div className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                  {currentTaskName}
                </div>
                <button
                  onClick={() => {
                    setIsEditingTask(true);
                    setTaskInput(currentTaskName);
                  }}
                  className="text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  Edit
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingTask(true)}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              >
                + Add focus task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Start
          </button>
        ) : (
          <button
            onClick={isPaused ? resumeTimer : pauseTimer}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        
        <button
          onClick={resetTimer}
          className="px-8 py-3 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
