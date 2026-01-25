"use client";

import { useCallback } from "react";
import { MobileTab } from "@/types/navigation";
import { TasksIcon, TimerIcon, MusicIcon } from "./Icons";

interface MobileNavProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

const tabs: { id: MobileTab; label: string }[] = [
  { id: "tasks", label: "Tasks" },
  { id: "timer", label: "Timer" },
  { id: "music", label: "Music" },
];

const iconMap = {
  tasks: TasksIcon,
  timer: TimerIcon,
  music: MusicIcon,
};

export default function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, currentIndex: number) => {
      let newIndex = currentIndex;
      if (e.key === "ArrowLeft") {
        newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      } else if (e.key === "ArrowRight") {
        newIndex = currentIndex === tabs.length - 1 ? 0 : currentIndex + 1;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = tabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      onTabChange(tabs[newIndex].id);
    },
    [onTabChange],
  );

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 md:hidden z-50"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab, index) => {
          const Icon = iconMap[tab.id];
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
              tabIndex={activeTab === tab.id ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                activeTab === tab.id
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <Icon />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
