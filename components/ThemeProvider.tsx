"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;

    // Apply theme class
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    // Only run once on mount to check for initial preference
    const stored = localStorage.getItem("pomodoro-theme-storage");

    if (!stored) {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "dark" : "light", false);
    }
  }, [setTheme]);

  return <>{children}</>;
}
