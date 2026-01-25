"use client";

import SidebarContent from "./SidebarContent";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <div
      className={`transition-all duration-300 ${
        isCollapsed ? "w-0 overflow-hidden" : "w-80"
      } border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-lg`}
    >
      <div className="h-full p-6 space-y-6 overflow-y-auto">
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-between p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors group"
        >
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Timers
          </h2>
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

        <SidebarContent />
      </div>
    </div>
  );
}
