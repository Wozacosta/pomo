import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarContent from "./SidebarContent";
import { useTimerStore } from "@/store/timer-store";
import { resetTimerStore } from "../vitest.setup";

// Mock the sounds module
vi.mock("@/lib/sounds", () => ({
  previewEndSound: vi.fn(),
  previewClickSound: vi.fn(),
}));

describe("SidebarContent", () => {
  beforeEach(() => {
    resetTimerStore();
    vi.clearAllMocks();
  });

  describe("stats display", () => {
    it("displays total completed count", () => {
      useTimerStore.setState({ totalCompleted: 42 });
      render(<SidebarContent />);

      expect(screen.getByText("Total Completed")).toBeInTheDocument();
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("displays current streak with singular day", () => {
      useTimerStore.setState({ currentStreak: 1 });
      render(<SidebarContent />);

      expect(screen.getByText("Current Streak")).toBeInTheDocument();
      expect(screen.getByText("1 day")).toBeInTheDocument();
    });

    it("displays current streak with plural days", () => {
      useTimerStore.setState({ currentStreak: 5 });
      render(<SidebarContent />);

      expect(screen.getByText("5 days")).toBeInTheDocument();
    });

    it("displays longest streak with singular day", () => {
      useTimerStore.setState({ longestStreak: 1 });
      render(<SidebarContent />);

      expect(screen.getByText("Longest Streak")).toBeInTheDocument();
      expect(screen.getByText("1 day")).toBeInTheDocument();
    });

    it("displays longest streak with plural days", () => {
      useTimerStore.setState({ longestStreak: 10 });
      render(<SidebarContent />);

      expect(screen.getByText("10 days")).toBeInTheDocument();
    });
  });

  describe("sound settings", () => {
    it("renders sound enabled toggle", () => {
      render(<SidebarContent />);

      expect(screen.getByText("Sound Enabled")).toBeInTheDocument();
      expect(
        screen.getByRole("switch", { name: "Toggle sound enabled" }),
      ).toBeInTheDocument();
    });

    it("toggle shows correct state when sound is enabled", () => {
      useTimerStore.setState({ soundEnabled: true });
      render(<SidebarContent />);

      const toggle = screen.getByRole("switch", {
        name: "Toggle sound enabled",
      });
      expect(toggle).toHaveAttribute("aria-checked", "true");
    });

    it("toggle shows correct state when sound is disabled", () => {
      useTimerStore.setState({ soundEnabled: false });
      render(<SidebarContent />);

      const toggle = screen.getByRole("switch", {
        name: "Toggle sound enabled",
      });
      expect(toggle).toHaveAttribute("aria-checked", "false");
    });

    it("clicking toggle updates sound enabled state", async () => {
      const user = userEvent.setup();
      useTimerStore.setState({ soundEnabled: true });
      render(<SidebarContent />);

      await user.click(
        screen.getByRole("switch", { name: "Toggle sound enabled" }),
      );

      expect(useTimerStore.getState().soundEnabled).toBe(false);
    });

    it("keyboard Enter toggles sound", async () => {
      const user = userEvent.setup();
      useTimerStore.setState({ soundEnabled: true });
      render(<SidebarContent />);

      const toggle = screen.getByRole("switch", {
        name: "Toggle sound enabled",
      });
      toggle.focus();
      await user.keyboard("{Enter}");

      expect(useTimerStore.getState().soundEnabled).toBe(false);
    });

    it("keyboard Space toggles sound", async () => {
      const user = userEvent.setup();
      useTimerStore.setState({ soundEnabled: true });
      render(<SidebarContent />);

      const toggle = screen.getByRole("switch", {
        name: "Toggle sound enabled",
      });
      toggle.focus();
      await user.keyboard(" ");

      expect(useTimerStore.getState().soundEnabled).toBe(false);
    });

    it("renders end sound select", () => {
      render(<SidebarContent />);

      expect(screen.getByText("End Sound")).toBeInTheDocument();
      expect(screen.getByLabelText("End Sound")).toBeInTheDocument();
    });

    it("end sound select has all options", () => {
      render(<SidebarContent />);

      const select = screen.getByLabelText("End Sound");
      expect(select).toContainHTML("Jingle");
      expect(select).toContainHTML("Birds");
      expect(select).toContainHTML("Ring");
      expect(select).toContainHTML("None");
    });

    it("changing end sound updates store and previews sound", async () => {
      const user = userEvent.setup();
      const { previewEndSound } = await import("@/lib/sounds");
      useTimerStore.setState({ soundEnabled: true }); // Enable sound so select is not disabled
      render(<SidebarContent />);

      await user.selectOptions(screen.getByLabelText("End Sound"), "birds");

      expect(useTimerStore.getState().endSoundType).toBe("birds");
      expect(previewEndSound).toHaveBeenCalledWith("birds");
    });

    it("renders click sound select", () => {
      render(<SidebarContent />);

      expect(screen.getByText("Click Sound")).toBeInTheDocument();
      expect(screen.getByLabelText("Click Sound")).toBeInTheDocument();
    });

    it("click sound select has all options", () => {
      render(<SidebarContent />);

      const select = screen.getByLabelText("Click Sound");
      expect(select).toContainHTML("Click");
      expect(select).toContainHTML("None");
    });

    it("changing click sound updates store and previews sound", async () => {
      const user = userEvent.setup();
      const { previewClickSound } = await import("@/lib/sounds");
      useTimerStore.setState({ soundEnabled: true }); // Enable sound so select is not disabled
      render(<SidebarContent />);

      await user.selectOptions(screen.getByLabelText("Click Sound"), "none");

      expect(useTimerStore.getState().clickSoundType).toBe("none");
      expect(previewClickSound).toHaveBeenCalledWith("none");
    });

    it("sound selects are disabled when sound is disabled", () => {
      useTimerStore.setState({ soundEnabled: false });
      render(<SidebarContent />);

      expect(screen.getByLabelText("End Sound")).toBeDisabled();
      expect(screen.getByLabelText("Click Sound")).toBeDisabled();
    });
  });

  describe("recent sessions", () => {
    it("shows empty message when no sessions", () => {
      useTimerStore.setState({ sessions: [] });
      render(<SidebarContent />);

      expect(screen.getByText("Recent Sessions")).toBeInTheDocument();
      expect(screen.getByText("No sessions yet")).toBeInTheDocument();
    });

    it("displays recent sessions", () => {
      const sessions = [
        {
          id: "1",
          duration: 25,
          startTime: new Date("2025-01-25T10:00:00").getTime(),
          endTime: new Date("2025-01-25T10:25:00").getTime(),
          completed: true,
          subject: "Study Math",
        },
        {
          id: "2",
          duration: 25,
          startTime: new Date("2025-01-25T11:00:00").getTime(),
          endTime: new Date("2025-01-25T11:25:00").getTime(),
          completed: false,
          subject: "Review Notes",
        },
      ];
      useTimerStore.setState({ sessions });
      render(<SidebarContent />);

      expect(screen.getByText(/Study Math/)).toBeInTheDocument();
      expect(screen.getByText(/Review Notes/)).toBeInTheDocument();
      expect(screen.getByText(/✓ Completed/)).toBeInTheDocument();
      expect(screen.getByText(/Incomplete/)).toBeInTheDocument();
    });

    it("shows only last 5 sessions in reverse order", () => {
      const sessions = Array.from({ length: 7 }, (_, i) => ({
        id: String(i),
        duration: 25,
        startTime: Date.now() - (7 - i) * 30 * 60 * 1000,
        endTime: Date.now() - (7 - i) * 30 * 60 * 1000 + 25 * 60 * 1000,
        completed: true,
        subject: `Session ${i + 1}`,
      }));
      useTimerStore.setState({ sessions });
      render(<SidebarContent />);

      // Should show sessions 3-7 (last 5), with session 7 first (reversed)
      expect(screen.getByText(/Session 7/)).toBeInTheDocument();
      expect(screen.getByText(/Session 3/)).toBeInTheDocument();
      expect(screen.queryByText(/Session 1/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Session 2/)).not.toBeInTheDocument();
    });
  });

  describe("tasks list integration", () => {
    it("renders TasksList component", () => {
      render(<SidebarContent />);

      // TasksList should be rendered - check for the Tasks heading
      expect(screen.getByText("Tasks")).toBeInTheDocument();
      // And the empty state message
      expect(screen.getByText(/No tasks yet/)).toBeInTheDocument();
    });
  });
});
