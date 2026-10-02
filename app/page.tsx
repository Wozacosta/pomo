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
import { MenuIcon, MoonIcon, SunIcon } from "@/components/Icons";
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
    <div className="flex h-dvh bg-zinc-50 dark:bg-zinc-950">
      {/* Left Sidebar - Desktop only */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col bg-zinc-50 dark:bg-zinc-950">
        {/* Header with Navigation and Theme Toggle */}
        <header className="h-16 shrink-0 border-b border-zinc-200/80 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle - Desktop only */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Toggle sidebar"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            {/* Brand */}
            <div className="hidden sm:flex items-center gap-2 pr-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" className="w-6 h-6" />
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                Pomo
              </span>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
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
              <nav className="flex md:hidden gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl">
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
            className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <MoonIcon className="w-5 h-5" />
            ) : (
              <SunIcon className="w-5 h-5" />
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <main className={`flex-1 overflow-y-auto ${MOBILE_NAV_HEIGHT} md:pb-0`}>
          {/* Desktop: show based on currentView */}
          <div className="hidden md:block h-full">
            {currentView === "timer" ? (
              <div className="flex items-center justify-center min-h-full">
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
                  <div className="flex items-center justify-center min-h-full">
                    <Timer />
                  </div>
                ) : (
                  <Report />
                )}
              </>
            )}
            {mobileTab === "tasks" && (
              <div className="h-full overflow-y-auto p-5">
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
      <aside className="hidden md:block w-72 lg:w-80 shrink-0 border-l border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
        <MusicPanel />
      </aside>

      {/* Mobile Bottom Navigation */}
      <MobileNav activeTab={mobileTab} onTabChange={handleMobileTabChange} />
    </div>
  );
}
