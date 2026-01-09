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
      } border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg`}
    >
      <div className="h-full p-6 space-y-6 overflow-y-auto">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors group"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Timers</h2>
          <svg
            className="w-5 h-5 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors"
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
        <div className="space-y-3">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
            <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Total Completed</div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{totalCompleted}</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
            <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">{currentStreak} days</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm">
            <div className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Longest Streak</div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">{longestStreak} days</div>
          </div>
        </div>

        {/* Tasks List */}
        <TasksList />

        {/* Recent Sessions */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(-5).reverse().map((session) => (
              <div
                key={session.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-sm border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
              >
                <div className="font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                  {new Date(session.startTime).toLocaleTimeString()}
                </div>
                <div className="text-zinc-600 dark:text-zinc-400 text-xs">
                  {session.duration} min • {session.subject || 'No task'} • {session.completed ? '✓ Completed' : 'Incomplete'}
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
    </div>
  );
}
