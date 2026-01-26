import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface PomodoroSession {
  id: string;
  duration: number; // in minutes
  startTime: number; // timestamp
  endTime?: number; // timestamp
  completed: boolean;
  musicSource?: string;
  subject?: string; // task/subject name
  taskId?: string; // reference to task
}

export interface Task {
  id: string;
  name: string;
  targetPomodoros: number; // target number of pomodoros
  completedPomodoros: number; // completed pomodoros
  createdAt: number;
}

export type EndSoundType = "jingle" | "birds" | "ring" | "none";
export type ClickSoundType = "click" | "none";

export interface TimerState {
  // Current timer
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number; // remaining seconds
  duration: number; // total duration in seconds
  endTime: number | null; // timestamp when timer should end
  pausedTimeRemaining: number | null; // remaining seconds when paused
  timerType: "work" | "shortBreak" | "longBreak";
  currentTaskId?: string; // current task being worked on
  currentTaskName?: string; // current task name (for quick entry)

  // Settings
  workDuration: number; // default 25 minutes
  shortBreakDuration: number; // default 5 minutes
  longBreakDuration: number; // default 15 minutes

  // Sound settings
  soundEnabled: boolean; // master mute
  endSoundType: EndSoundType;
  clickSoundType: ClickSoundType;

  // Quote settings
  quotesEnabled: boolean;

  // Tasks
  tasks: Task[];

  // History
  sessions: PomodoroSession[];
  totalCompleted: number;
  currentStreak: number;
  longestStreak: number;

  // Actions
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  completeSession: () => void;
  setCurrentTask: (taskId?: string, taskName?: string) => void;
  addTask: (name: string, targetPomodoros?: number) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setTimerType: (type: "work" | "shortBreak" | "longBreak") => void;
  updateSettings: (settings: {
    workDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
  }) => void;
  updateSoundSettings: (settings: {
    soundEnabled?: boolean;
    endSoundType?: EndSoundType;
    clickSoundType?: ClickSoundType;
  }) => void;
  updateQuoteSettings: (settings: { quotesEnabled?: boolean }) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      isRunning: false,
      isPaused: false,
      currentTime: 25 * 60, // 25 minutes in seconds
      duration: 25 * 60,
      endTime: null,
      pausedTimeRemaining: null,
      timerType: "work",

      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,

      soundEnabled: true,
      endSoundType: "jingle",
      clickSoundType: "click",

      quotesEnabled: true,

      tasks: [],
      sessions: [],
      totalCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,

      // Actions
      startTimer: (customDuration) => {
        const duration = customDuration
          ? customDuration * 60
          : get().timerType === "work"
            ? get().workDuration * 60
            : get().timerType === "shortBreak"
              ? get().shortBreakDuration * 60
              : get().longBreakDuration * 60;

        set({
          isRunning: true,
          isPaused: false,
          currentTime: duration,
          duration,
          endTime: Date.now() + duration * 1000,
          pausedTimeRemaining: null,
        });
      },

      pauseTimer: () => {
        const remaining = get().currentTime;
        set({
          isRunning: false,
          isPaused: true,
          endTime: null,
          pausedTimeRemaining: remaining,
        });
      },

      resumeTimer: () => {
        const remaining = get().pausedTimeRemaining ?? get().currentTime;
        set({
          isRunning: true,
          isPaused: false,
          endTime: Date.now() + remaining * 1000,
          pausedTimeRemaining: null,
        });
      },

      resetTimer: () => {
        const duration =
          get().timerType === "work"
            ? get().workDuration * 60
            : get().timerType === "shortBreak"
              ? get().shortBreakDuration * 60
              : get().longBreakDuration * 60;

        set({
          isRunning: false,
          isPaused: false,
          currentTime: duration,
          duration,
          endTime: null,
          pausedTimeRemaining: null,
        });
      },

      tick: () => {
        const { endTime, isRunning, isPaused } = get();

        if (isRunning && !isPaused && endTime) {
          const remaining = Math.max(
            0,
            Math.ceil((endTime - Date.now()) / 1000),
          );
          set({ currentTime: remaining });

          // Timer completed
          if (remaining === 0) {
            get().completeSession();
          }
        }
      },

      completeSession: () => {
        const {
          timerType,
          sessions,
          totalCompleted,
          currentStreak,
          longestStreak,
          currentTaskId,
          currentTaskName,
          tasks,
        } = get();

        const newSession: PomodoroSession = {
          id: Date.now().toString(),
          duration: get().workDuration,
          startTime: Date.now() - get().duration * 1000,
          endTime: Date.now(),
          completed: true,
          subject: currentTaskName,
          taskId: currentTaskId,
        };

        // Update task progress if task exists
        let updatedTasks = tasks;
        if (currentTaskId && timerType === "work") {
          updatedTasks = tasks.map((task) =>
            task.id === currentTaskId
              ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
              : task,
          );
        }

        // Update streak (simple logic - can be enhanced with grace period)
        const today = new Date().toDateString();
        const lastSession = sessions[sessions.length - 1];
        const lastSessionDate = lastSession
          ? new Date(
              lastSession.endTime || lastSession.startTime,
            ).toDateString()
          : null;

        let newStreak = currentStreak;
        if (lastSessionDate === today) {
          // Same day, maintain streak
          newStreak = currentStreak;
        } else if (
          lastSessionDate === new Date(Date.now() - 86400000).toDateString()
        ) {
          // Yesterday, continue streak
          newStreak = currentStreak + 1;
        } else {
          // New streak
          newStreak = 1;
        }

        set({
          isRunning: false,
          isPaused: false,
          endTime: null,
          pausedTimeRemaining: null,
          sessions: [...sessions, newSession],
          tasks: updatedTasks,
          totalCompleted: totalCompleted + 1,
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
        });

        // Play completion sound (will be handled by component)
      },

      setCurrentTask: (taskId, taskName) => {
        set({ currentTaskId: taskId, currentTaskName: taskName });
      },

      addTask: (name, targetPomodoros = 20) => {
        const newTask: Task = {
          id: Date.now().toString(),
          name,
          targetPomodoros,
          completedPomodoros: 0,
          createdAt: Date.now(),
        };
        set({ tasks: [...get().tasks, newTask] });
      },

      updateTask: (taskId, updates) => {
        set({
          tasks: get().tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task,
          ),
        });
      },

      deleteTask: (taskId) => {
        set({
          tasks: get().tasks.filter((task) => task.id !== taskId),
          currentTaskId:
            get().currentTaskId === taskId ? undefined : get().currentTaskId,
        });
      },

      setTimerType: (type) => {
        const wasRunning = get().isRunning;
        set({ timerType: type });
        // Reset timer with new type
        get().resetTimer();
      },

      updateSettings: (settings) => {
        set({
          workDuration: settings.workDuration ?? get().workDuration,
          shortBreakDuration:
            settings.shortBreakDuration ?? get().shortBreakDuration,
          longBreakDuration:
            settings.longBreakDuration ?? get().longBreakDuration,
        });

        // Reset current timer if not running
        if (!get().isRunning) {
          get().resetTimer();
        }
      },

      updateSoundSettings: (settings) => {
        set({
          soundEnabled: settings.soundEnabled ?? get().soundEnabled,
          endSoundType: settings.endSoundType ?? get().endSoundType,
          clickSoundType: settings.clickSoundType ?? get().clickSoundType,
        });
      },

      updateQuoteSettings: (settings) => {
        set({
          quotesEnabled: settings.quotesEnabled ?? get().quotesEnabled,
        });
      },
    }),
    {
      name: "pomodoro-timer-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Partial<TimerState>;
        if (version === 0) {
          // Migration from version 0: add sound settings with defaults
          return {
            ...state,
            soundEnabled: state.soundEnabled ?? true,
            endSoundType: state.endSoundType ?? "jingle",
            clickSoundType: state.clickSoundType ?? "click",
            quotesEnabled: true,
          };
        }
        if (version === 1) {
          // Migration from version 1: add quotes settings
          return {
            ...state,
            quotesEnabled: state.quotesEnabled ?? true,
          };
        }
        return state as TimerState;
      },
    },
  ),
);
