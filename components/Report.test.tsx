import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Report from "./Report";
import { useTimerStore } from "@/store/timer-store";
import { resetTimerStore } from "../vitest.setup";

describe("Report component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-25T12:00:00"));
    resetTimerStore();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders empty state when no sessions", () => {
    render(<Report />);
    expect(
      screen.getByText(
        "No data yet. Complete some Pomodoros to see your report!",
      ),
    ).toBeInTheDocument();
  });

  it("renders chart section with last 7 days", () => {
    render(<Report />);

    // Check for date labels (Jan 19 - Jan 25 for frozen date of Jan 25)
    expect(screen.getByText("Jan 19")).toBeInTheDocument();
    expect(screen.getByText("Jan 20")).toBeInTheDocument();
    expect(screen.getByText("Jan 21")).toBeInTheDocument();
    expect(screen.getByText("Jan 22")).toBeInTheDocument();
    expect(screen.getByText("Jan 23")).toBeInTheDocument();
    expect(screen.getByText("Jan 24")).toBeInTheDocument();
    expect(screen.getByText("Jan 25")).toBeInTheDocument();
  });

  it("groups sessions by date correctly", () => {
    const jan25 = new Date("2026-01-25T10:00:00");
    const jan24 = new Date("2026-01-24T10:00:00");

    useTimerStore.setState({
      sessions: [
        {
          id: "1",
          duration: 25,
          startTime: jan25.getTime() - 25 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
          subject: "Study",
        },
        {
          id: "2",
          duration: 25,
          startTime: jan25.getTime() - 50 * 60 * 1000,
          endTime: jan25.getTime() - 25 * 60 * 1000,
          completed: true,
          subject: "Study",
        },
        {
          id: "3",
          duration: 25,
          startTime: jan24.getTime() - 25 * 60 * 1000,
          endTime: jan24.getTime(),
          completed: true,
          subject: "Work",
        },
      ],
    });

    render(<Report />);

    // Should show task legends (appears in both legend and summary, so use getAllByText)
    expect(screen.getAllByText("Study").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Work").length).toBeGreaterThan(0);
  });

  it("calculates task totals correctly", () => {
    const jan25 = new Date("2026-01-25T10:00:00");
    const jan24 = new Date("2026-01-24T10:00:00");

    useTimerStore.setState({
      sessions: [
        // Study: 25 + 25 = 50 minutes
        {
          id: "1",
          duration: 25,
          startTime: jan25.getTime() - 25 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
          subject: "Study",
        },
        {
          id: "2",
          duration: 25,
          startTime: jan24.getTime() - 25 * 60 * 1000,
          endTime: jan24.getTime(),
          completed: true,
          subject: "Study",
        },
        // Work: 30 minutes
        {
          id: "3",
          duration: 30,
          startTime: jan24.getTime() - 60 * 60 * 1000,
          endTime: jan24.getTime() - 30 * 60 * 1000,
          completed: true,
          subject: "Work",
        },
      ],
    });

    render(<Report />);

    // Study: 50 minutes = 00:50
    expect(screen.getByText("00:50")).toBeInTheDocument();
    // Work: 30 minutes = 00:30
    expect(screen.getByText("00:30")).toBeInTheDocument();
  });

  it("formats time as HH:MM (hours:minutes)", () => {
    const jan25 = new Date("2026-01-25T10:00:00");

    useTimerStore.setState({
      sessions: [
        // 90 minutes = 1:30
        {
          id: "1",
          duration: 90,
          startTime: jan25.getTime() - 90 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
          subject: "Long Task",
        },
      ],
    });

    render(<Report />);

    // 90 minutes = 01:30
    expect(screen.getByText("01:30")).toBeInTheDocument();
  });

  it("summary table shows tasks sorted by total time descending", () => {
    const jan25 = new Date("2026-01-25T10:00:00");

    useTimerStore.setState({
      sessions: [
        // Task A: 60 minutes
        {
          id: "1",
          duration: 60,
          startTime: jan25.getTime() - 60 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
          subject: "Task A",
        },
        // Task B: 30 minutes
        {
          id: "2",
          duration: 30,
          startTime: jan25.getTime() - 90 * 60 * 1000,
          endTime: jan25.getTime() - 60 * 60 * 1000,
          completed: true,
          subject: "Task B",
        },
        // Task C: 120 minutes (should be first)
        {
          id: "3",
          duration: 120,
          startTime: jan25.getTime() - 210 * 60 * 1000,
          endTime: jan25.getTime() - 90 * 60 * 1000,
          completed: true,
          subject: "Task C",
        },
      ],
    });

    render(<Report />);

    // Find all task names in the summary table (inside the grid rows, not legend)
    // The summary table has tasks in grid-cols-2 divs
    const summarySection = screen.getByRole("heading", { name: "Summary" })
      .parentElement?.parentElement;
    expect(summarySection).toBeTruthy();

    // Get all task name spans within the summary (text-sm font-medium class in summary)
    const taskSpans = summarySection!.querySelectorAll("span.font-medium");
    const taskNames = Array.from(taskSpans).map((span) => span.textContent);

    // Should be sorted by total time descending: Task C (120), Task A (60), Task B (30)
    expect(taskNames[0]).toBe("Task C");
    expect(taskNames[1]).toBe("Task A");
    expect(taskNames[2]).toBe("Task B");
  });

  it("shows correct 7-day range labels for frozen date", () => {
    render(<Report />);

    // Frozen date is Jan 25, 2026
    // Last 7 days: Jan 19, 20, 21, 22, 23, 24, 25
    expect(screen.getByText("Jan 19")).toBeInTheDocument();
    expect(screen.getByText("Jan 25")).toBeInTheDocument();

    // Should NOT have Jan 18 or Jan 26
    expect(screen.queryByText("Jan 18")).not.toBeInTheDocument();
    expect(screen.queryByText("Jan 26")).not.toBeInTheDocument();
  });

  it('displays "No Project" for sessions without subject', () => {
    const jan25 = new Date("2026-01-25T10:00:00");

    useTimerStore.setState({
      sessions: [
        {
          id: "1",
          duration: 25,
          startTime: jan25.getTime() - 25 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
        },
      ],
    });

    render(<Report />);

    // Appears in both legend and summary
    expect(screen.getAllByText("No Project").length).toBeGreaterThan(0);
  });

  it("only counts completed sessions", () => {
    const jan25 = new Date("2026-01-25T10:00:00");

    useTimerStore.setState({
      sessions: [
        // Completed session
        {
          id: "1",
          duration: 25,
          startTime: jan25.getTime() - 25 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
          subject: "Done",
        },
        // Incomplete session (should be ignored)
        {
          id: "2",
          duration: 25,
          startTime: jan25.getTime() - 50 * 60 * 1000,
          endTime: jan25.getTime() - 25 * 60 * 1000,
          completed: false,
          subject: "Incomplete",
        },
      ],
    });

    render(<Report />);

    // Appears in both legend and summary
    expect(screen.getAllByText("Done").length).toBeGreaterThan(0);
    expect(screen.queryByText("Incomplete")).not.toBeInTheDocument();
  });

  it("renders Report heading", () => {
    render(<Report />);
    expect(screen.getByRole("heading", { name: "Report" })).toBeInTheDocument();
  });

  it("renders Summary heading", () => {
    render(<Report />);
    expect(
      screen.getByRole("heading", { name: "Summary" }),
    ).toBeInTheDocument();
  });

  it("displays weekday labels for each day", () => {
    render(<Report />);

    // Check for weekday abbreviations (depends on the actual days)
    // Jan 25, 2026 is a Sunday
    expect(screen.getByText("Sun")).toBeInTheDocument();
    expect(screen.getByText("Sat")).toBeInTheDocument(); // Jan 24
  });

  it("displays total hours overall", () => {
    const jan25 = new Date("2026-01-25T10:00:00");
    const jan10 = new Date("2026-01-10T10:00:00"); // Outside 7-day window

    useTimerStore.setState({
      sessions: [
        {
          id: "1",
          duration: 60, // 1 hour
          startTime: jan25.getTime() - 60 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
          subject: "Recent",
        },
        {
          id: "2",
          duration: 120, // 2 hours (outside 7-day window)
          startTime: jan10.getTime() - 120 * 60 * 1000,
          endTime: jan10.getTime(),
          completed: true,
          subject: "Old",
        },
      ],
    });

    render(<Report />);

    // Total overall: 60 + 120 = 180 minutes = 3.0 hours
    expect(screen.getByText("Total Hours Overall")).toBeInTheDocument();
    expect(screen.getByText("3.0h")).toBeInTheDocument();
  });

  it("displays hours this week correctly", () => {
    const jan25 = new Date("2026-01-25T10:00:00");
    const jan10 = new Date("2026-01-10T10:00:00"); // Outside 7-day window

    useTimerStore.setState({
      sessions: [
        {
          id: "1",
          duration: 90, // 1.5 hours (within 7 days)
          startTime: jan25.getTime() - 90 * 60 * 1000,
          endTime: jan25.getTime(),
          completed: true,
          subject: "Recent",
        },
        {
          id: "2",
          duration: 120, // 2 hours (outside 7-day window)
          startTime: jan10.getTime() - 120 * 60 * 1000,
          endTime: jan10.getTime(),
          completed: true,
          subject: "Old",
        },
      ],
    });

    render(<Report />);

    // Hours this week: 90 minutes = 1.5 hours
    expect(screen.getByText("Hours This Week")).toBeInTheDocument();
    expect(screen.getByText("1.5h")).toBeInTheDocument();
  });

  it("shows 0.0h when no sessions exist", () => {
    render(<Report />);

    // Both "Total Hours Overall" and "Hours This Week" show 0.0h
    const zeroHours = screen.getAllByText("0.0h");
    expect(zeroHours).toHaveLength(2);
  });
});
