'use client';

import { useState } from 'react';
import { useTimerStore } from '@/store/timer-store';
import TasksList from './TasksList';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { sessions, totalCompleted, currentStreak, longestStreak } = useTimerStore();

  return (
    <div
      className={`transition-all duration-300 ${
        isCollapsed ? 'w-0 overflow-hidden' : 'w-80'
      } border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900`}
    >
      <div className="h-full p-6 space-y-6">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Timers</h2>
          <svg
            className="w-5 h-5 text-zinc-600 dark:text-zinc-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Stats */}
        <div className="space-y-4">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Total Completed</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{totalCompleted}</div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Current Streak</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{currentStreak} days</div>
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Longest Streak</div>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{longestStreak} days</div>
          </div>
        </div>

        {/* Tasks List */}
        <TasksList />

        {/* Recent Sessions */}
        <div>
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(-5).reverse().map((session) => (
              <div
                key={session.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm"
              >
                <div className="text-zinc-900 dark:text-zinc-50">
                  {new Date(session.startTime).toLocaleTimeString()}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  {session.duration} min • {session.subject || 'No task'} • {session.completed ? 'Completed' : 'Incomplete'}
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <div className="p-3 text-sm text-zinc-600 dark:text-zinc-400 text-center">
                No sessions yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
