"use client";

import { useMemo, useState } from "react";
import { useTimerStore } from "@/store/timer-store";

export default function Report() {
  const { sessions, tasks } = useTimerStore();
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  // Group sessions by date and task
  const reportData = useMemo(() => {
    // // TEMP: Mock data for testing (fixed values)
    // const today = new Date();
    // const mockData: Record<string, Record<string, number>> = {};
    // const fixedValues = [
    //   { react: 45, node: 30 },
    //   { react: 60, node: 45 },
    //   { react: 90, node: 60 },
    //   { react: 30, node: 20 },
    //   { react: 120, node: 80 },
    //   { react: 150, node: 100 },
    //   { react: 180, node: 90 },
    // ];
    // for (let i = 6; i >= 0; i--) {
    //   const date = new Date();
    //   date.setDate(today.getDate() - i);
    //   const dateStr = date.toDateString();
    //   mockData[dateStr] = fixedValues[6 - i];
    // }
    // return mockData;
    // // END TEMP

    const data: Record<string, Record<string, number>> = {}; // date -> task -> minutes

    sessions
      .filter((s) => s.completed && s.endTime)
      .forEach((session) => {
        const date = new Date(
          session.endTime || session.startTime,
        ).toDateString();
        const taskName = session.subject || "No Project";
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
    Object.values(reportData).forEach((dayData) => {
      Object.keys(dayData).forEach((task) => taskSet.add(task));
    });
    return Array.from(taskSet);
  }, [reportData]);

  // Calculate totals per task (for the 7-day chart)
  const taskTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.values(reportData).forEach((dayData) => {
      Object.entries(dayData).forEach(([task, minutes]) => {
        totals[task] = (totals[task] || 0) + minutes;
      });
    });
    return totals;
  }, [reportData]);

  // Calculate total hours overall (all sessions ever)
  const totalMinutesOverall = useMemo(() => {
    return sessions
      .filter((s) => s.completed && s.endTime)
      .reduce((sum, session) => sum + session.duration, 0);
  }, [sessions]);

  // Calculate total hours this week (last 7 days)
  const totalMinutesThisWeek = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    return sessions
      .filter((s) => {
        if (!s.completed || !s.endTime) return false;
        const sessionDate = new Date(s.endTime);
        return sessionDate >= weekAgo;
      })
      .reduce((sum, session) => sum + session.duration, 0);
  }, [sessions]);

  // Format hours with decimal
  const formatHours = (minutes: number) => {
    const hours = minutes / 60;
    return hours.toFixed(1);
  };

  // Format time
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Get max value for scaling (round up to nearest hour)
  const maxMinutes = useMemo(() => {
    let max = 0;
    Object.values(reportData).forEach((dayData) => {
      const dayTotal = Object.values(dayData).reduce(
        (sum, mins) => sum + mins,
        0,
      );
      max = Math.max(max, dayTotal);
    });
    // Round up to nearest 60 minutes (1 hour), minimum 60
    return Math.max(Math.ceil(max / 60) * 60, 60);
  }, [reportData]);

  // Get bar height percentage
  const getBarHeight = (minutes: number) => {
    return (minutes / maxMinutes) * 100;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
        Report
      </h2>

      {/* Total Hours Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm">
          <div className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
            Total Hours Overall
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            {formatHours(totalMinutesOverall)}h
          </div>
        </div>
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl border border-green-200 dark:border-green-800 shadow-sm">
          <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
            Hours This Week
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">
            {formatHours(totalMinutesThisWeek)}h
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
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
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {task}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Area */}
        <div className="space-y-4 overflow-visible pt-8">
          {/* Y-axis labels */}
          <div
            className="flex items-end gap-2 overflow-visible"
            style={{ height: "200px" }}
          >
            {/* Y-axis */}
            <div className="flex flex-col justify-between h-full pr-2">
              {Array.from(
                { length: maxMinutes / 60 + 1 },
                (_, i) => maxMinutes - i * 60,
              ).map((val) => (
                <span
                  key={val}
                  className="text-xs text-zinc-600 dark:text-zinc-400"
                >
                  {val}
                </span>
              ))}
            </div>

            {/* Bars for each day */}
            <div className="flex-1 flex items-end gap-2">
              {last7Days.map((day) => {
                const dateStr = day.toDateString();
                const dayData = reportData[dateStr] || {};
                const dayTotal = Object.values(dayData).reduce(
                  (sum, mins) => sum + mins,
                  0,
                );
                const isToday =
                  day.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={dateStr}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    {/* Stacked bars */}
                    <div
                      className="w-full relative cursor-pointer overflow-visible"
                      style={{ height: "200px" }}
                      onMouseEnter={() => setHoveredDay(dateStr)}
                      onMouseLeave={() => setHoveredDay(null)}
                    >
                      {/* Tooltip */}
                      {hoveredDay === dateStr && dayTotal > 0 && (
                        <div
                          className="absolute left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs px-2 py-1 rounded whitespace-nowrap z-50"
                          style={{ top: "-28px" }}
                        >
                          {formatTime(dayTotal)}
                        </div>
                      )}
                      {allTasks.map((task, taskIdx) => {
                        const taskMinutes = dayData[task] || 0;
                        const taskHeight = getBarHeight(taskMinutes);
                        const previousTasksHeight = allTasks
                          .slice(0, taskIdx)
                          .reduce((sum, t) => sum + (dayData[t] || 0), 0);
                        const previousHeight =
                          getBarHeight(previousTasksHeight);

                        return (
                          <div
                            key={task}
                            className="absolute w-full rounded-t pointer-events-none"
                            style={{
                              bottom: `${previousHeight}%`,
                              height: `${taskHeight}%`,
                              backgroundColor: `hsl(${(taskIdx * 360) / allTasks.length}, 70%, 50%)`,
                              border: "1px solid",
                              borderColor: `hsl(${(taskIdx * 360) / allTasks.length}, 70%, 40%)`,
                            }}
                          />
                        );
                      })}
                      {dayTotal === 0 && (
                        <div className="absolute bottom-0 w-full h-1 bg-zinc-200 dark:bg-zinc-700 rounded" />
                      )}
                    </div>

                    {/* X-axis labels */}
                    <div
                      className={`text-xs ${isToday ? "font-bold" : ""} text-zinc-600 dark:text-zinc-400`}
                    >
                      {day.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-500">
                      {day.toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Summary
          </h3>
        </div>
        <div className="space-y-1">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b-2 border-zinc-200 dark:border-zinc-700">
            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              PROJECT
            </div>
            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-right">
              TIME (HH:MM)
            </div>
          </div>
          {Object.entries(taskTotals)
            .sort(([, a], [, b]) => b - a)
            .map(([task, totalMinutes]) => (
              <div
                key={task}
                className="grid grid-cols-2 gap-4 py-3 border-b border-zinc-100 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 rounded-lg px-2 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded shadow-sm"
                    style={{
                      backgroundColor: `hsl(${(allTasks.indexOf(task) * 360) / Math.max(allTasks.length, 1)}, 70%, 50%)`,
                    }}
                  />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {task}
                  </span>
                </div>
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 text-right">
                  {formatTime(totalMinutes)}
                </div>
              </div>
            ))}
          {Object.keys(taskTotals).length === 0 && (
            <div className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
              No data yet. Complete some Pomodoros to see your report!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
