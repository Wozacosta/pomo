import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

export interface TimerState {
  // Current timer
  isRunning: boolean;
  isPaused: boolean;
  currentTime: number; // remaining seconds
  duration: number; // total duration in seconds
  timerType: 'work' | 'shortBreak' | 'longBreak';
  currentTaskId?: string; // current task being worked on
  currentTaskName?: string; // current task name (for quick entry)
  
  // Settings
  workDuration: number; // default 25 minutes
  shortBreakDuration: number; // default 5 minutes
  longBreakDuration: number; // default 15 minutes
  
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
  setTimerType: (type: 'work' | 'shortBreak' | 'longBreak') => void;
  updateSettings: (settings: {
    workDuration?: number;
    shortBreakDuration?: number;
    longBreakDuration?: number;
  }) => void;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      isRunning: false,
      isPaused: false,
      currentTime: 25 * 60, // 25 minutes in seconds
      duration: 25 * 60,
      timerType: 'work',
      
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      
      tasks: [],
      sessions: [],
      totalCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      
      // Actions
      startTimer: (customDuration) => {
        const duration = customDuration 
          ? customDuration * 60 
          : get().timerType === 'work' 
            ? get().workDuration * 60
            : get().timerType === 'shortBreak'
              ? get().shortBreakDuration * 60
              : get().longBreakDuration * 60;
        
        set({
          isRunning: true,
          isPaused: false,
          currentTime: duration,
          duration,
        });
      },
      
      pauseTimer: () => {
        set({ isRunning: false, isPaused: true });
      },
      
      resumeTimer: () => {
        set({ isRunning: true, isPaused: false });
      },
      
      resetTimer: () => {
        const duration = get().timerType === 'work' 
          ? get().workDuration * 60
          : get().timerType === 'shortBreak'
            ? get().shortBreakDuration * 60
            : get().longBreakDuration * 60;
        
        set({
          isRunning: false,
          isPaused: false,
          currentTime: duration,
          duration,
        });
      },
      
      tick: () => {
        const { currentTime, isRunning, isPaused } = get();
        
        if (isRunning && !isPaused && currentTime > 0) {
          const newTime = currentTime - 1;
          set({ currentTime: newTime });
          
          // Timer completed
          if (newTime === 0) {
            get().completeSession();
          }
        }
      },
      
      completeSession: () => {
        const { timerType, sessions, totalCompleted, currentStreak, longestStreak, currentTaskId, currentTaskName, tasks } = get();
        
        const newSession: PomodoroSession = {
          id: Date.now().toString(),
          duration: get().workDuration,
          startTime: Date.now() - (get().duration * 1000),
          endTime: Date.now(),
          completed: true,
          subject: currentTaskName,
          taskId: currentTaskId,
        };
        
        // Update task progress if task exists
        let updatedTasks = tasks;
        if (currentTaskId && timerType === 'work') {
          updatedTasks = tasks.map(task => 
            task.id === currentTaskId
              ? { ...task, completedPomodoros: task.completedPomodoros + 1 }
              : task
          );
        }
        
        // Update streak (simple logic - can be enhanced with grace period)
        const today = new Date().toDateString();
        const lastSession = sessions[sessions.length - 1];
        const lastSessionDate = lastSession 
          ? new Date(lastSession.endTime || lastSession.startTime).toDateString()
          : null;
        
        let newStreak = currentStreak;
        if (lastSessionDate === today) {
          // Same day, maintain streak
          newStreak = currentStreak;
        } else if (lastSessionDate === new Date(Date.now() - 86400000).toDateString()) {
          // Yesterday, continue streak
          newStreak = currentStreak + 1;
        } else {
          // New streak
          newStreak = 1;
        }
        
        set({
          isRunning: false,
          isPaused: false,
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
          tasks: get().tasks.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        });
      },
      
      deleteTask: (taskId) => {
        set({
          tasks: get().tasks.filter(task => task.id !== taskId),
          currentTaskId: get().currentTaskId === taskId ? undefined : get().currentTaskId,
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
          shortBreakDuration: settings.shortBreakDuration ?? get().shortBreakDuration,
          longBreakDuration: settings.longBreakDuration ?? get().longBreakDuration,
        });
        
        // Reset current timer if not running
        if (!get().isRunning) {
          get().resetTimer();
        }
      },
    }),
    {
      name: 'pomodoro-timer-storage',
    }
  )
);
