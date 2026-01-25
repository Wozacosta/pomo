import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useTimerStore } from "./timer-store";

describe("timer-store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-25T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("startTimer()", () => {
    it("sets isRunning=true and calculates endTime from workDuration", () => {
      const store = useTimerStore.getState();
      store.startTimer();

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.endTime).toBe(Date.now() + 25 * 60 * 1000);
      expect(state.currentTime).toBe(25 * 60);
      expect(state.duration).toBe(25 * 60);
    });

    it("uses customDuration param when provided", () => {
      const store = useTimerStore.getState();
      store.startTimer(10);

      const state = useTimerStore.getState();
      expect(state.duration).toBe(10 * 60);
      expect(state.currentTime).toBe(10 * 60);
      expect(state.endTime).toBe(Date.now() + 10 * 60 * 1000);
    });

    it("uses shortBreakDuration when timerType is shortBreak", () => {
      useTimerStore.setState({
        timerType: "shortBreak",
        shortBreakDuration: 5,
      });
      const store = useTimerStore.getState();
      store.startTimer();

      const state = useTimerStore.getState();
      expect(state.duration).toBe(5 * 60);
      expect(state.currentTime).toBe(5 * 60);
    });

    it("uses longBreakDuration when timerType is longBreak", () => {
      useTimerStore.setState({ timerType: "longBreak", longBreakDuration: 15 });
      const store = useTimerStore.getState();
      store.startTimer();

      const state = useTimerStore.getState();
      expect(state.duration).toBe(15 * 60);
      expect(state.currentTime).toBe(15 * 60);
    });
  });

  describe("pauseTimer()", () => {
    it("sets isPaused=true and isRunning=false", () => {
      useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();

      const state = useTimerStore.getState();
      expect(state.isPaused).toBe(true);
      expect(state.isRunning).toBe(false);
    });

    it("stores current currentTime in pausedTimeRemaining", () => {
      useTimerStore.getState().startTimer();
      // Simulate some time passing
      useTimerStore.setState({ currentTime: 1000 });
      useTimerStore.getState().pauseTimer();

      const state = useTimerStore.getState();
      expect(state.pausedTimeRemaining).toBe(1000);
    });

    it("clears endTime to null", () => {
      useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();

      const state = useTimerStore.getState();
      expect(state.endTime).toBeNull();
    });
  });

  describe("resumeTimer()", () => {
    it("resumes from paused state and recalculates endTime from pausedTimeRemaining", () => {
      useTimerStore.getState().startTimer();
      useTimerStore.setState({ currentTime: 600, pausedTimeRemaining: 600 });
      useTimerStore.getState().pauseTimer();

      const beforeResume = Date.now();
      useTimerStore.getState().resumeTimer();

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(true);
      expect(state.isPaused).toBe(false);
      expect(state.endTime).toBe(beforeResume + 600 * 1000);
      expect(state.pausedTimeRemaining).toBeNull();
    });

    it("falls back to currentTime when pausedTimeRemaining is null", () => {
      useTimerStore.setState({
        isRunning: false,
        isPaused: true,
        currentTime: 300,
        pausedTimeRemaining: null,
      });

      const beforeResume = Date.now();
      useTimerStore.getState().resumeTimer();

      const state = useTimerStore.getState();
      expect(state.endTime).toBe(beforeResume + 300 * 1000);
    });
  });

  describe("resetTimer()", () => {
    it("resets based on current timerType (work)", () => {
      useTimerStore.setState({ timerType: "work", workDuration: 25 });
      useTimerStore.getState().startTimer();
      useTimerStore.getState().resetTimer();

      const state = useTimerStore.getState();
      expect(state.currentTime).toBe(25 * 60);
      expect(state.duration).toBe(25 * 60);
    });

    it("resets based on current timerType (shortBreak)", () => {
      useTimerStore.setState({
        timerType: "shortBreak",
        shortBreakDuration: 5,
      });
      useTimerStore.getState().resetTimer();

      const state = useTimerStore.getState();
      expect(state.currentTime).toBe(5 * 60);
    });

    it("resets based on current timerType (longBreak)", () => {
      useTimerStore.setState({ timerType: "longBreak", longBreakDuration: 15 });
      useTimerStore.getState().resetTimer();

      const state = useTimerStore.getState();
      expect(state.currentTime).toBe(15 * 60);
    });

    it("clears isRunning, isPaused, endTime, pausedTimeRemaining", () => {
      useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();
      useTimerStore.getState().resetTimer();

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.endTime).toBeNull();
      expect(state.pausedTimeRemaining).toBeNull();
    });
  });

  describe("tick()", () => {
    it("decrements currentTime based on endTime when running", () => {
      useTimerStore.getState().startTimer();

      // Advance time by 1 second
      vi.advanceTimersByTime(1000);
      useTimerStore.getState().tick();

      const state = useTimerStore.getState();
      expect(state.currentTime).toBe(25 * 60 - 1);
    });

    it("does nothing when isPaused=true", () => {
      useTimerStore.getState().startTimer();
      useTimerStore.getState().pauseTimer();
      const currentTimeBefore = useTimerStore.getState().currentTime;

      vi.advanceTimersByTime(1000);
      useTimerStore.getState().tick();

      expect(useTimerStore.getState().currentTime).toBe(currentTimeBefore);
    });

    it("does nothing when isRunning=false", () => {
      const currentTimeBefore = useTimerStore.getState().currentTime;

      vi.advanceTimersByTime(1000);
      useTimerStore.getState().tick();

      expect(useTimerStore.getState().currentTime).toBe(currentTimeBefore);
    });

    it("does nothing when endTime=null", () => {
      useTimerStore.setState({
        isRunning: true,
        isPaused: false,
        endTime: null,
      });
      const currentTimeBefore = useTimerStore.getState().currentTime;

      vi.advanceTimersByTime(1000);
      useTimerStore.getState().tick();

      expect(useTimerStore.getState().currentTime).toBe(currentTimeBefore);
    });

    it("calls completeSession() when remaining hits 0", () => {
      useTimerStore.getState().startTimer(1); // 1 minute = 60 seconds

      // Advance to exactly when timer should complete
      vi.advanceTimersByTime(60 * 1000);
      useTimerStore.getState().tick();

      const state = useTimerStore.getState();
      expect(state.isRunning).toBe(false);
      expect(state.sessions.length).toBe(1);
      expect(state.totalCompleted).toBe(1);
    });
  });

  describe("completeSession()", () => {
    it("creates session with correct timestamps and duration", () => {
      useTimerStore.setState({ workDuration: 25, duration: 25 * 60 });
      useTimerStore.getState().completeSession();

      const state = useTimerStore.getState();
      expect(state.sessions.length).toBe(1);
      const session = state.sessions[0];
      expect(session.duration).toBe(25);
      expect(session.endTime).toBe(Date.now());
      expect(session.completed).toBe(true);
    });

    it("increments totalCompleted", () => {
      useTimerStore.setState({ totalCompleted: 5 });
      useTimerStore.getState().completeSession();

      expect(useTimerStore.getState().totalCompleted).toBe(6);
    });

    it("updates task completedPomodoros if currentTaskId set", () => {
      const taskId = "task-1";
      useTimerStore.setState({
        timerType: "work",
        currentTaskId: taskId,
        tasks: [
          {
            id: taskId,
            name: "Test Task",
            targetPomodoros: 20,
            completedPomodoros: 2,
            createdAt: Date.now(),
          },
        ],
      });
      useTimerStore.getState().completeSession();

      const task = useTimerStore.getState().tasks.find((t) => t.id === taskId);
      expect(task?.completedPomodoros).toBe(3);
    });
  });

  describe("streak logic", () => {
    it("same day: streak stays same (no increment)", () => {
      const today = new Date("2026-01-25T12:00:00");
      vi.setSystemTime(today);

      // First session today
      useTimerStore.setState({
        currentStreak: 3,
        sessions: [
          {
            id: "1",
            duration: 25,
            startTime: today.getTime() - 30 * 60 * 1000,
            endTime: today.getTime() - 5 * 60 * 1000,
            completed: true,
          },
        ],
      });

      useTimerStore.getState().completeSession();
      expect(useTimerStore.getState().currentStreak).toBe(3);
    });

    it("yesterday continuation: streak increments by 1", () => {
      const today = new Date("2026-01-25T12:00:00");
      const yesterday = new Date("2026-01-24T12:00:00");
      vi.setSystemTime(today);

      useTimerStore.setState({
        currentStreak: 3,
        sessions: [
          {
            id: "1",
            duration: 25,
            startTime: yesterday.getTime(),
            endTime: yesterday.getTime() + 25 * 60 * 1000,
            completed: true,
          },
        ],
      });

      useTimerStore.getState().completeSession();
      expect(useTimerStore.getState().currentStreak).toBe(4);
    });

    it("new streak: resets to 1 when gap > 1 day", () => {
      const today = new Date("2026-01-25T12:00:00");
      const twoDaysAgo = new Date("2026-01-23T12:00:00");
      vi.setSystemTime(today);

      useTimerStore.setState({
        currentStreak: 5,
        sessions: [
          {
            id: "1",
            duration: 25,
            startTime: twoDaysAgo.getTime(),
            endTime: twoDaysAgo.getTime() + 25 * 60 * 1000,
            completed: true,
          },
        ],
      });

      useTimerStore.getState().completeSession();
      expect(useTimerStore.getState().currentStreak).toBe(1);
    });

    it("first session ever: streak becomes 1", () => {
      useTimerStore.setState({ currentStreak: 0, sessions: [] });
      useTimerStore.getState().completeSession();
      expect(useTimerStore.getState().currentStreak).toBe(1);
    });
  });

  describe("Task CRUD", () => {
    describe("addTask()", () => {
      it("creates task with name and targetPomodoros: 20 default", () => {
        useTimerStore.getState().addTask("Test Task");

        const tasks = useTimerStore.getState().tasks;
        expect(tasks.length).toBe(1);
        expect(tasks[0].name).toBe("Test Task");
        expect(tasks[0].targetPomodoros).toBe(20);
        expect(tasks[0].completedPomodoros).toBe(0);
      });

      it("allows custom targetPomodoros", () => {
        useTimerStore.getState().addTask("Custom Task", 10);

        const tasks = useTimerStore.getState().tasks;
        expect(tasks[0].targetPomodoros).toBe(10);
      });
    });

    describe("updateTask()", () => {
      it("updates specific task by id", () => {
        useTimerStore.getState().addTask("Original Name");
        const taskId = useTimerStore.getState().tasks[0].id;

        useTimerStore.getState().updateTask(taskId, { name: "Updated Name" });

        const task = useTimerStore
          .getState()
          .tasks.find((t) => t.id === taskId);
        expect(task?.name).toBe("Updated Name");
      });
    });

    describe("deleteTask()", () => {
      it("removes task", () => {
        useTimerStore.getState().addTask("Task to Delete");
        const taskId = useTimerStore.getState().tasks[0].id;

        useTimerStore.getState().deleteTask(taskId);

        expect(useTimerStore.getState().tasks.length).toBe(0);
      });

      it("clears currentTaskId if deleted task was current", () => {
        useTimerStore.getState().addTask("Current Task");
        const taskId = useTimerStore.getState().tasks[0].id;
        useTimerStore.setState({ currentTaskId: taskId });

        useTimerStore.getState().deleteTask(taskId);

        expect(useTimerStore.getState().currentTaskId).toBeUndefined();
      });

      it("does not clear currentTaskId when deleting non-current task", () => {
        const task1 = {
          id: "task-1",
          name: "Task 1",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        };
        const task2 = {
          id: "task-2",
          name: "Task 2",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        };
        useTimerStore.setState({
          tasks: [task1, task2],
          currentTaskId: task1.id,
        });

        useTimerStore.getState().deleteTask(task2.id);

        expect(useTimerStore.getState().currentTaskId).toBe(task1.id);
        expect(useTimerStore.getState().tasks.length).toBe(1);
      });
    });
  });

  describe("setTimerType()", () => {
    it("changes timerType and calls resetTimer", () => {
      useTimerStore.setState({ timerType: "work", shortBreakDuration: 5 });
      useTimerStore.getState().setTimerType("shortBreak");

      const state = useTimerStore.getState();
      expect(state.timerType).toBe("shortBreak");
      expect(state.currentTime).toBe(5 * 60);
    });

    it("captures wasRunning but currently unused - documenting behavior", () => {
      useTimerStore.getState().startTimer();
      expect(useTimerStore.getState().isRunning).toBe(true);

      useTimerStore.getState().setTimerType("shortBreak");

      // After setTimerType, timer is reset (not running)
      expect(useTimerStore.getState().isRunning).toBe(false);
    });
  });

  describe("updateSettings()", () => {
    it("updates duration settings", () => {
      useTimerStore.getState().updateSettings({
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
      });

      const state = useTimerStore.getState();
      expect(state.workDuration).toBe(30);
      expect(state.shortBreakDuration).toBe(10);
      expect(state.longBreakDuration).toBe(20);
    });

    it("calls resetTimer() when not running", () => {
      useTimerStore.setState({ timerType: "work", isRunning: false });
      useTimerStore.getState().updateSettings({ workDuration: 30 });

      expect(useTimerStore.getState().currentTime).toBe(30 * 60);
    });

    it("does NOT call resetTimer() when running", () => {
      useTimerStore.getState().startTimer(); // 25 min default
      const currentTimeBefore = useTimerStore.getState().currentTime;

      useTimerStore.getState().updateSettings({ workDuration: 30 });

      // Timer continues with old duration
      expect(useTimerStore.getState().currentTime).toBe(currentTimeBefore);
      expect(useTimerStore.getState().isRunning).toBe(true);
    });
  });

  describe("setCurrentTask()", () => {
    it("sets both currentTaskId and currentTaskName", () => {
      useTimerStore.getState().setCurrentTask("task-123", "My Task");

      const state = useTimerStore.getState();
      expect(state.currentTaskId).toBe("task-123");
      expect(state.currentTaskName).toBe("My Task");
    });

    it("can clear by passing undefined", () => {
      useTimerStore.setState({
        currentTaskId: "task-123",
        currentTaskName: "My Task",
      });
      useTimerStore.getState().setCurrentTask(undefined, undefined);

      const state = useTimerStore.getState();
      expect(state.currentTaskId).toBeUndefined();
      expect(state.currentTaskName).toBeUndefined();
    });
  });
});
