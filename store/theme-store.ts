import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  manuallySet: boolean;
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark", manual?: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      manuallySet: false,
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "light" ? "dark" : "light";
          // Apply to document
          if (typeof window !== "undefined") {
            document.documentElement.classList.toggle(
              "dark",
              newTheme === "dark",
            );
          }
          return { theme: newTheme, manuallySet: true };
        });
      },
      setTheme: (theme, manual = false) => {
        set({ theme, manuallySet: manual });
        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
      },
    }),
    {
      name: "pomodoro-theme-storage",
    },
  ),
);
