"use client";

import { useState, useEffect } from "react";
import Timer from "@/components/Timer";
import Sidebar from "@/components/Sidebar";
import SidebarContent from "@/components/SidebarContent";
import MusicPanel from "@/components/MusicPanel";
import Report from "@/components/Report";
import MobileNav from "@/components/MobileNav";
import NavButton from "@/components/NavButton";
import { useThemeStore } from "@/store/theme-store";
import { useTimerWorker } from "@/hooks/useTimerWorker";
import { View, MobileTab } from "@/types/navigation";

// Height of mobile bottom nav (h-16 = 64px) - used for content padding
const MOBILE_NAV_HEIGHT = "pb-16";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<View>("timer");
  const [mobileTab, setMobileTab] = useState<MobileTab>("timer");
  const { theme, setTheme } = useThemeStore();

  // Timer worker must be mounted here (top level) so it persists across view switches
  useTimerWorker();

  // Reset currentView to timer when switching mobile tabs (F5 fix)
  const handleMobileTabChange = (tab: MobileTab) => {
    setMobileTab(tab);
    if (tab === "timer") {
      setCurrentView("timer");
    }
  };

  // Sync theme changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  // Get mobile page title for non-timer tabs
  const getMobileTitle = () => {
    if (mobileTab === "tasks") return "Tasks & Stats";
    if (mobileTab === "music") return "Music";
    return null;
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Left Sidebar - Desktop only */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
        {/* Header with Navigation and Theme Toggle */}
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle - Desktop only */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:block p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Desktop navigation */}
            <nav className="hidden md:flex gap-2">
              <NavButton
                active={currentView === "timer"}
                onClick={() => setCurrentView("timer")}
              >
                Timer
              </NavButton>
              <NavButton
                active={currentView === "report"}
                onClick={() => setCurrentView("report")}
              >
                Report
              </NavButton>
            </nav>

            {/* Mobile: Timer/Report toggle when on timer tab */}
            {mobileTab === "timer" && (
              <nav className="flex md:hidden gap-2">
                <NavButton
                  active={currentView === "timer"}
                  onClick={() => setCurrentView("timer")}
                >
                  Timer
                </NavButton>
                <NavButton
                  active={currentView === "report"}
                  onClick={() => setCurrentView("report")}
                >
                  Report
                </NavButton>
              </nav>
            )}

            {/* Mobile: Page title when not on timer tab (F14 fix - moved outside nav) */}
            {mobileTab !== "timer" && (
              <span className="md:hidden text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                {getMobileTitle()}
              </span>
            )}
          </div>

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light", true)}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <svg
                className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-zinc-600 dark:text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${MOBILE_NAV_HEIGHT} md:pb-0`}>
          {/* Desktop: show based on currentView */}
          <div className="hidden md:block h-full">
            {currentView === "timer" ? (
              <div className="flex items-center justify-center h-full">
                <Timer />
              </div>
            ) : (
              <Report />
            )}
          </div>

          {/* Mobile: show based on mobileTab */}
          <div className="md:hidden h-full">
            {mobileTab === "timer" && (
              <>
                {currentView === "timer" ? (
                  <div className="flex items-center justify-center h-full">
                    <Timer />
                  </div>
                ) : (
                  <Report />
                )}
              </>
            )}
            {mobileTab === "tasks" && (
              <div className="h-full overflow-y-auto p-6 bg-white dark:bg-zinc-900">
                <SidebarContent />
              </div>
            )}
            {mobileTab === "music" && (
              <div className="h-full overflow-y-auto">
                <MusicPanel />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Right Panel - Desktop only */}
      <div className="hidden md:block w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto shadow-lg">
        <MusicPanel />
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />
    </div>
  );
}
