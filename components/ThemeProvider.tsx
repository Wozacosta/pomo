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

    console.log("[ThemeProvider] Applying theme:", theme);
    console.log("[ThemeProvider] Current classes:", root.classList.toString());

    // Apply theme class
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    console.log("[ThemeProvider] Updated classes:", root.classList.toString());
  }, [theme]);

  useEffect(() => {
    // Only run once on mount to check for initial preference
    const stored = localStorage.getItem("pomodoro-theme-storage");
    console.log("[ThemeProvider] Stored theme:", stored);

    if (!stored) {
      // Check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      console.log("[ThemeProvider] System prefers dark:", prefersDark);
      setTheme(prefersDark ? "dark" : "light", false);
    } else {
      console.log("[ThemeProvider] Using stored preference");
    }
  }, [setTheme]);

  return <>{children}</>;
}
