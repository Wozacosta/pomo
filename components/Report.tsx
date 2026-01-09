'use client';

import { useMemo } from 'react';
import { useTimerStore } from '@/store/timer-store';

export default function Report() {
  const { sessions, tasks } = useTimerStore();

  // Group sessions by date and task
  const reportData = useMemo(() => {
    const data: Record<string, Record<string, number>> = {}; // date -> task -> minutes
    
    sessions
      .filter(s => s.completed && s.endTime)
      .forEach(session => {
        const date = new Date(session.endTime || session.startTime).toDateString();
        const taskName = session.subject || 'No Project';
        const minutes = session.duration;
        
        if (!data[date]) {
          data[date] = {};
        }
        if (!data[date][taskName]) {
          data[date][taskName] = 0;
        }
        data[date][taskName] += minutes;
      });
    
    return data;
  }, [sessions]);

  // Get last 7 days
  const last7Days = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  }, []);

  // Get all unique tasks
  const allTasks = useMemo(() => {
    const taskSet = new Set<string>();
    Object.values(reportData).forEach(dayData => {
      Object.keys(dayData).forEach(task => taskSet.add(task));
    });
    return Array.from(taskSet);
  }, [reportData]);

  // Calculate totals per task
  const taskTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.values(reportData).forEach(dayData => {
      Object.entries(dayData).forEach(([task, minutes]) => {
        totals[task] = (totals[task] || 0) + minutes;
      });
    });
    return totals;
  }, [reportData]);

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Get max value for scaling
  const maxMinutes = useMemo(() => {
    let max = 0;
    Object.values(reportData).forEach(dayData => {
      const dayTotal = Object.values(dayData).reduce((sum, mins) => sum + mins, 0);
      max = Math.max(max, dayTotal);
    });
    return Math.max(max, 1); // At least 1 to avoid division by zero
  }, [reportData]);

  // Get bar height percentage
  const getBarHeight = (minutes: number) => {
    return (minutes / maxMinutes) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Report</h2>

      {/* Chart */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            {allTasks.map((task, idx) => (
              <div key={task} className="flex items-center gap-1">
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    backgroundColor: `hsl(${(idx * 360) / allTasks.length}, 70%, 50%)`,
                  }}
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="space-y-4">
          {/* Y-axis labels */}
          <div className="flex items-end gap-2" style={{ height: '200px' }}>
            {/* Y-axis */}
            <div className="flex flex-col justify-between h-full pr-2">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((val) => (
                <span key={val} className="text-xs text-zinc-600 dark:text-zinc-400">
                  {Math.round((val / 7) * maxMinutes)}
                </span>
              ))}
            </div>

            {/* Bars for each day */}
            <div className="flex-1 flex items-end gap-2">
              {last7Days.map((day) => {
                const dateStr = day.toDateString();
                const dayData = reportData[dateStr] || {};
                const dayTotal = Object.values(dayData).reduce((sum, mins) => sum + mins, 0);
                const isToday = day.toDateString() === new Date().toDateString();

                return (
                  <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
                    {/* Stacked bars */}
                    <div className="w-full relative" style={{ height: '200px' }}>
                      {allTasks.map((task, taskIdx) => {
                        const taskMinutes = dayData[task] || 0;
                        const taskHeight = getBarHeight(taskMinutes);
                        const previousTasksHeight = allTasks
                          .slice(0, taskIdx)
                          .reduce((sum, t) => sum + (dayData[t] || 0), 0);
                        const previousHeight = getBarHeight(previousTasksHeight);

                        return (
                          <div
                            key={task}
                            className="absolute w-full rounded-t"
                            style={{
                              bottom: `${previousHeight}%`,
                              height: `${taskHeight}%`,
                              backgroundColor: `hsl(${(taskIdx * 360) / allTasks.length}, 70%, 50%)`,
                              border: '1px solid',
                              borderColor: `hsl(${(taskIdx * 360) / allTasks.length}, 70%, 40%)`,
                            }}
                            title={`${task}: ${formatTime(taskMinutes)}`}
                          />
                        );
                      })}
                      {dayTotal === 0 && (
                        <div className="absolute bottom-0 w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      )}
                    </div>

                    {/* X-axis labels */}
                    <div className={`text-xs ${isToday ? 'font-bold' : ''} text-zinc-600 dark:text-zinc-400`}>
                      {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Summary</h3>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-700">
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">PROJECT</div>
            <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400 text-right">TIME (HH:MM)</div>
          </div>
          {Object.entries(taskTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([task, totalMinutes]) => (
              <div
                key={task}
                className="grid grid-cols-2 gap-4 py-2 border-b border-zinc-100 dark:border-zinc-700"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{
                      backgroundColor: `hsl(${(allTasks.indexOf(task) * 360) / Math.max(allTasks.length, 1)}, 70%, 50%)`,
                    }}
                  />
                  <span className="text-sm text-zinc-900 dark:text-zinc-50">{task}</span>
                </div>
                <div className="text-sm text-zinc-900 dark:text-zinc-50 text-right">
                  {formatTime(totalMinutes)}
                </div>
              </div>
            ))}
          {Object.keys(taskTotals).length === 0 && (
            <div className="py-4 text-center text-sm text-zinc-600 dark:text-zinc-400">
              No data yet. Complete some Pomodoros to see your report!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
