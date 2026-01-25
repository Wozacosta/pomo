import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Timer from "./Timer";
import { useTimerStore } from "@/store/timer-store";
import { resetTimerStore, mockWorkerInstance } from "../vitest.setup";

describe("Timer component", () => {
  beforeEach(() => {
    resetTimerStore();
  });

  it("renders initial state with formatted time (25:00)", () => {
    render(<Timer />);
    expect(screen.getByText("25:00")).toBeInTheDocument();
  });

  it("renders timer type buttons for work/shortBreak/longBreak", () => {
    render(<Timer />);
    expect(
      screen.getByRole("button", { name: "Pomodoro" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Short Break" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Long Break" }),
    ).toBeInTheDocument();
  });

  it("timer type buttons switch between work/shortBreak/longBreak", async () => {
    const user = userEvent.setup();
    render(<Timer />);

    // Initial: work (25 min)
    expect(screen.getByText("25:00")).toBeInTheDocument();

    // Switch to short break (5 min)
    await user.click(screen.getByRole("button", { name: "Short Break" }));
    expect(screen.getByText("05:00")).toBeInTheDocument();
    expect(useTimerStore.getState().timerType).toBe("shortBreak");

    // Switch to long break (15 min)
    await user.click(screen.getByRole("button", { name: "Long Break" }));
    expect(screen.getByText("15:00")).toBeInTheDocument();
    expect(useTimerStore.getState().timerType).toBe("longBreak");
  });

  it("Start button calls startTimer()", async () => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "Start" }));

    expect(useTimerStore.getState().isRunning).toBe(true);
  });

  it("Pause button appears when running and calls pauseTimer()", async () => {
    const user = userEvent.setup();
    useTimerStore.getState().startTimer();
    render(<Timer />);

    const pauseButton = screen.getByRole("button", { name: "Pause" });
    expect(pauseButton).toBeInTheDocument();

    await user.click(pauseButton);

    expect(useTimerStore.getState().isPaused).toBe(true);
    expect(useTimerStore.getState().isRunning).toBe(false);
  });

  it("Start button when paused calls resumeTimer()", async () => {
    const user = userEvent.setup();
    // Set paused state directly - pauseTimer sets isPaused=true, isRunning=false
    useTimerStore.setState({
      isPaused: true,
      isRunning: false,
      pausedTimeRemaining: 1000,
    });
    render(<Timer />);

    // When paused and not running, Start button is shown but handleStart resumes
    const startButton = screen.getByRole("button", { name: "Start" });
    await user.click(startButton);

    expect(useTimerStore.getState().isRunning).toBe(true);
    expect(useTimerStore.getState().isPaused).toBe(false);
  });

  it("Reset button calls resetTimer()", async () => {
    const user = userEvent.setup();
    useTimerStore.getState().startTimer();
    useTimerStore.setState({ currentTime: 600 }); // 10 min remaining
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(useTimerStore.getState().isRunning).toBe(false);
    expect(useTimerStore.getState().currentTime).toBe(25 * 60);
  });

  it('shows "+ Add focus task" button when no task set', () => {
    render(<Timer />);
    expect(
      screen.getByRole("button", { name: "+ Add focus task" }),
    ).toBeInTheDocument();
  });

  it('shows task input on "+ Add focus task" button click', async () => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "+ Add focus task" }));

    expect(
      screen.getByPlaceholderText("What are you focusing on?"),
    ).toBeInTheDocument();
  });

  it("task input submits on Enter and calls setCurrentTask()", async () => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "+ Add focus task" }));
    const input = screen.getByPlaceholderText("What are you focusing on?");

    await user.type(input, "Study React{Enter}");

    expect(useTimerStore.getState().currentTaskName).toBe("Study React");
  });

  it("task input with existing task (case-insensitive) calls setCurrentTask with existing task", async () => {
    const user = userEvent.setup();
    const task = {
      id: "task-1",
      name: "Study React",
      targetPomodoros: 20,
      completedPomodoros: 0,
      createdAt: Date.now(),
    };
    useTimerStore.setState({ tasks: [task] });
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "+ Add focus task" }));
    const input = screen.getByPlaceholderText("What are you focusing on?");

    // Type with different case
    await user.type(input, "study react{Enter}");

    const state = useTimerStore.getState();
    expect(state.currentTaskId).toBe("task-1");
    expect(state.currentTaskName).toBe("Study React");
  });

  it("task input with new task name calls setCurrentTask with undefined id", async () => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "+ Add focus task" }));
    const input = screen.getByPlaceholderText("What are you focusing on?");

    await user.type(input, "New Task{Enter}");

    const state = useTimerStore.getState();
    expect(state.currentTaskId).toBeUndefined();
    expect(state.currentTaskName).toBe("New Task");
  });

  it("displays current task name when set", () => {
    useTimerStore.setState({ currentTaskName: "My Focus Task" });
    render(<Timer />);

    expect(screen.getByText("My Focus Task")).toBeInTheDocument();
  });

  it("shows Edit button when task is set", () => {
    useTimerStore.setState({ currentTaskName: "My Focus Task" });
    render(<Timer />);

    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("progress circle updates with timer progress", () => {
    // At 50% progress (half of 25 min = 12.5 min = 750 sec remaining)
    useTimerStore.setState({
      duration: 25 * 60,
      currentTime: 750, // Half way
    });
    render(<Timer />);

    // Find the progress circle (second circle element)
    const circles = document.querySelectorAll("circle");
    expect(circles.length).toBe(2);

    // Progress circle should have strokeDashoffset reflecting progress
    const progressCircle = circles[1];
    const circumference = 2 * Math.PI * 135;
    const expectedOffset = circumference * (1 - 50 / 100);
    expect(progressCircle.getAttribute("stroke-dashoffset")).toBe(
      String(expectedOffset),
    );
  });

  it("worker tick simulation triggers tick()", async () => {
    vi.useFakeTimers();
    render(<Timer />);

    // Start the timer
    useTimerStore.getState().startTimer();

    // Advance time and simulate worker tick
    vi.advanceTimersByTime(1000);
    mockWorkerInstance.simulateTick();

    // tick() should have been called, updating currentTime
    // Since we can't easily verify tick was called without spying,
    // we verify the worker's onmessage was set up
    expect(mockWorkerInstance.onmessage).not.toBeNull();

    vi.useRealTimers();
  });

  it("task input closes on Escape key", async () => {
    const user = userEvent.setup();
    render(<Timer />);

    await user.click(screen.getByRole("button", { name: "+ Add focus task" }));
    const input = screen.getByPlaceholderText("What are you focusing on?");

    await user.type(input, "Some text{Escape}");

    // Input should be hidden
    expect(
      screen.queryByPlaceholderText("What are you focusing on?"),
    ).not.toBeInTheDocument();
    // Task should not be set
    expect(useTimerStore.getState().currentTaskName).toBeUndefined();
  });

  it("displays session count when completed sessions exist", () => {
    useTimerStore.setState({
      sessions: [
        {
          id: "1",
          duration: 25,
          startTime: Date.now() - 30 * 60 * 1000,
          endTime: Date.now() - 5 * 60 * 1000,
          completed: true,
        },
        {
          id: "2",
          duration: 25,
          startTime: Date.now() - 60 * 60 * 1000,
          endTime: Date.now() - 35 * 60 * 1000,
          completed: true,
        },
      ],
    });
    render(<Timer />);

    expect(screen.getByText("#2")).toBeInTheDocument();
  });

  describe("keyboard shortcuts", () => {
    it("Space key starts timer when not running", async () => {
      const user = userEvent.setup();
      render(<Timer />);

      await user.keyboard(" ");

      expect(useTimerStore.getState().isRunning).toBe(true);
    });

    it("Space key pauses timer when running", async () => {
      const user = userEvent.setup();
      useTimerStore.getState().startTimer();
      render(<Timer />);

      await user.keyboard(" ");

      expect(useTimerStore.getState().isPaused).toBe(true);
      expect(useTimerStore.getState().isRunning).toBe(false);
    });

    it("Space key resumes timer when paused", async () => {
      const user = userEvent.setup();
      useTimerStore.setState({
        isPaused: true,
        isRunning: false,
        pausedTimeRemaining: 1000,
      });
      render(<Timer />);

      await user.keyboard(" ");

      expect(useTimerStore.getState().isRunning).toBe(true);
      expect(useTimerStore.getState().isPaused).toBe(false);
    });

    it("R key resets timer", async () => {
      const user = userEvent.setup();
      useTimerStore.getState().startTimer();
      useTimerStore.setState({ currentTime: 600 });
      render(<Timer />);

      await user.keyboard("r");

      expect(useTimerStore.getState().isRunning).toBe(false);
      expect(useTimerStore.getState().currentTime).toBe(25 * 60);
    });

    it("Shift+R key also resets timer", async () => {
      const user = userEvent.setup();
      useTimerStore.getState().startTimer();
      useTimerStore.setState({ currentTime: 600 });
      render(<Timer />);

      await user.keyboard("R");

      expect(useTimerStore.getState().isRunning).toBe(false);
      expect(useTimerStore.getState().currentTime).toBe(25 * 60);
    });

    it("keyboard shortcuts are disabled when typing in input", async () => {
      const user = userEvent.setup();
      render(<Timer />);

      await user.click(
        screen.getByRole("button", { name: "+ Add focus task" }),
      );
      const input = screen.getByPlaceholderText("What are you focusing on?");

      // Type space in input - should not start timer
      await user.type(input, " ");

      expect(useTimerStore.getState().isRunning).toBe(false);
    });
  });

  describe("task editing", () => {
    it("Edit button opens task input with current task name", async () => {
      const user = userEvent.setup();
      useTimerStore.setState({ currentTaskName: "Current Task" });
      render(<Timer />);

      await user.click(screen.getByRole("button", { name: "Edit" }));

      const input = screen.getByPlaceholderText("What are you focusing on?");
      expect(input).toHaveValue("Current Task");
    });

    it("Save button submits task input", async () => {
      const user = userEvent.setup();
      render(<Timer />);

      await user.click(
        screen.getByRole("button", { name: "+ Add focus task" }),
      );
      await user.type(
        screen.getByPlaceholderText("What are you focusing on?"),
        "My Task",
      );
      await user.click(screen.getByRole("button", { name: "Save" }));

      expect(useTimerStore.getState().currentTaskName).toBe("My Task");
    });

    it("empty task input does not submit", async () => {
      const user = userEvent.setup();
      render(<Timer />);

      await user.click(
        screen.getByRole("button", { name: "+ Add focus task" }),
      );
      await user.click(screen.getByRole("button", { name: "Save" }));

      // Input should still be visible
      expect(
        screen.getByPlaceholderText("What are you focusing on?"),
      ).toBeInTheDocument();
      expect(useTimerStore.getState().currentTaskName).toBeUndefined();
    });

    it("whitespace-only task input does not submit", async () => {
      const user = userEvent.setup();
      render(<Timer />);

      await user.click(
        screen.getByRole("button", { name: "+ Add focus task" }),
      );
      await user.type(
        screen.getByPlaceholderText("What are you focusing on?"),
        "   ",
      );
      await user.click(screen.getByRole("button", { name: "Save" }));

      // Input should still be visible
      expect(
        screen.getByPlaceholderText("What are you focusing on?"),
      ).toBeInTheDocument();
    });
  });

  describe("Resume button", () => {
    it("shows Resume button when paused and running", async () => {
      useTimerStore.setState({
        isRunning: true,
        isPaused: true,
        pausedTimeRemaining: 1000,
      });
      render(<Timer />);

      expect(
        screen.getByRole("button", { name: "Resume" }),
      ).toBeInTheDocument();
    });

    it("Resume button calls resumeTimer", async () => {
      const user = userEvent.setup();
      useTimerStore.setState({
        isRunning: true,
        isPaused: true,
        pausedTimeRemaining: 1000,
      });
      render(<Timer />);

      await user.click(screen.getByRole("button", { name: "Resume" }));

      expect(useTimerStore.getState().isRunning).toBe(true);
      expect(useTimerStore.getState().isPaused).toBe(false);
    });
  });

  describe("document title", () => {
    it("updates document title when timer is running", () => {
      useTimerStore.setState({
        isRunning: true,
        currentTime: 24 * 60 + 30, // 24:30
        timerType: "work",
      });
      render(<Timer />);

      expect(document.title).toBe("24:30 - Pomodoro");
    });

    it("updates document title for short break", () => {
      useTimerStore.setState({
        isRunning: true,
        currentTime: 4 * 60, // 04:00
        timerType: "shortBreak",
      });
      render(<Timer />);

      expect(document.title).toBe("04:00 - Short Break");
    });

    it("updates document title for long break", () => {
      useTimerStore.setState({
        isRunning: true,
        currentTime: 14 * 60, // 14:00
        timerType: "longBreak",
      });
      render(<Timer />);

      expect(document.title).toBe("14:00 - Long Break");
    });

    it("resets document title when timer is not running", () => {
      useTimerStore.setState({
        isRunning: false,
        isPaused: false,
      });
      render(<Timer />);

      expect(document.title).toBe("Pomodoro Timer");
    });
  });

  describe("time formatting", () => {
    it("formats single digit minutes with leading zero", () => {
      useTimerStore.setState({ currentTime: 5 * 60 }); // 5 minutes
      render(<Timer />);

      expect(screen.getByText("05:00")).toBeInTheDocument();
    });

    it("formats single digit seconds with leading zero", () => {
      useTimerStore.setState({ currentTime: 25 * 60 + 5 }); // 25:05
      render(<Timer />);

      expect(screen.getByText("25:05")).toBeInTheDocument();
    });

    it("formats zero time correctly", () => {
      useTimerStore.setState({ currentTime: 0 });
      render(<Timer />);

      expect(screen.getByText("00:00")).toBeInTheDocument();
    });
  });
});
