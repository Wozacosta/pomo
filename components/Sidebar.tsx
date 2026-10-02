"use client";

import SidebarContent from "./SidebarContent";
import { CloseIcon } from "./Icons";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <div
      className={`transition-all duration-300 ${
        isCollapsed ? "w-0 overflow-hidden border-r-0" : "w-72 lg:w-80"
      } shrink-0 h-full border-r border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900`}
    >
      {/* Fixed inner width so content doesn't reflow while collapsing */}
      <div className="h-full w-72 lg:w-80 px-5 pb-6 overflow-y-auto">
        <div className="sticky top-0 z-10 -mx-5 px-5 h-16 mb-2 flex items-center justify-between bg-white/90 dark:bg-zinc-900/90 backdrop-blur">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Timers
          </h2>
          <button
            onClick={onToggle}
            aria-label="Close sidebar"
            className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        </div>

        <SidebarContent />
      </div>
    </div>
  );
}
