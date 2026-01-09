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
            if (newTheme === "dark") {
              document.documentElement.classList.add("dark");
              document.documentElement.classList.remove("light");
            } else {
              document.documentElement.classList.add("light");
              document.documentElement.classList.remove("dark");
            }
          }
          return { theme: newTheme, manuallySet: true };
        });
      },
      setTheme: (theme, manual = false) => {
        set({ theme, manuallySet: manual });
        if (typeof window !== "undefined") {
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
          } else {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
          }
        }
      },
    }),
    {
      name: "pomodoro-theme-storage",
    },
  ),
);
