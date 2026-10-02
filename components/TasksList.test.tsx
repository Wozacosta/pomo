import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TasksList from "./TasksList";
import { useTimerStore } from "@/store/timer-store";
import { resetTimerStore } from "../vitest.setup";

describe("TasksList component", () => {
  beforeEach(() => {
    resetTimerStore();
    // Mock window.confirm for happy-dom
    window.confirm = vi.fn(() => true);
  });

  it("renders empty state message when no tasks", () => {
    render(<TasksList />);
    expect(
      screen.getByText("No tasks yet. Click + to add one."),
    ).toBeInTheDocument();
  });

  it("renders list of tasks with name and progress", () => {
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 5,
          createdAt: Date.now(),
        },
        {
          id: "task-2",
          name: "Write Tests",
          targetPomodoros: 10,
          completedPomodoros: 2,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    expect(screen.getByText("Study React")).toBeInTheDocument();
    expect(screen.getByText("Write Tests")).toBeInTheDocument();
    expect(screen.getByText("5 / 20")).toBeInTheDocument();
    expect(screen.getByText("2 / 10")).toBeInTheDocument();
  });

  it("add task button (+ icon) shows input form", async () => {
    const user = userEvent.setup();
    render(<TasksList />);

    // Click the + button (accessible by SVG content)
    const addButton = screen.getByRole("button", { name: "Add task" });
    await user.click(addButton);

    expect(screen.getByPlaceholderText("Task name...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("new task input submits on Enter and calls addTask()", async () => {
    const user = userEvent.setup();
    render(<TasksList />);

    // Click + button to show form
    const addButton = screen.getByRole("button", { name: "Add task" });
    await user.click(addButton);

    const input = screen.getByPlaceholderText("Task name...");
    await user.type(input, "New Task{Enter}");

    const tasks = useTimerStore.getState().tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0].name).toBe("New Task");
    expect(tasks[0].targetPomodoros).toBe(20);
  });

  it("Escape key in add mode closes add form without calling addTask()", async () => {
    const user = userEvent.setup();
    render(<TasksList />);

    // Click + button to show form
    const addButton = screen.getByRole("button", { name: "Add task" });
    await user.click(addButton);

    const input = screen.getByPlaceholderText("Task name...");
    await user.type(input, "Some text{Escape}");

    // Form should close
    expect(
      screen.queryByPlaceholderText("Task name..."),
    ).not.toBeInTheDocument();
    // No task should be added
    expect(useTimerStore.getState().tasks.length).toBe(0);
  });

  it("task checkbox toggles setCurrentTask() - checked calls with task id", async () => {
    const user = userEvent.setup();
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    const checkbox = screen.getByRole("checkbox");
    await user.click(checkbox);

    expect(useTimerStore.getState().currentTaskId).toBe("task-1");
    expect(useTimerStore.getState().currentTaskName).toBe("Study React");
  });

  it("task checkbox unchecked calls setCurrentTask with undefined", async () => {
    const user = userEvent.setup();
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
      currentTaskId: "task-1",
    });
    render(<TasksList />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(useTimerStore.getState().currentTaskId).toBeUndefined();
  });

  it("edit button enables inline editing with current task name", async () => {
    const user = userEvent.setup();
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    // Find edit button (has pencil icon SVG path)
    const editButtons = screen.getAllByRole("button");
    // Edit button is the one with the edit icon path
    const editButton = editButtons.find((btn) =>
      btn.querySelector('svg path[d*="M11 5H6"]'),
    );
    expect(editButton).toBeTruthy();
    await user.click(editButton!);

    // Should show input with current name
    const input = screen.getByDisplayValue("Study React");
    expect(input).toBeInTheDocument();
    expect(input.tagName).toBe("INPUT");
  });

  it("Escape key in edit mode cancels edit without calling updateTask()", async () => {
    const user = userEvent.setup();
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    // Click edit button
    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons.find((btn) =>
      btn.querySelector('svg path[d*="M11 5H6"]'),
    );
    await user.click(editButton!);

    const input = screen.getByDisplayValue("Study React");
    await user.clear(input);
    await user.type(input, "Changed Name{Escape}");

    // Should revert and show original name
    expect(screen.getByText("Study React")).toBeInTheDocument();
    expect(useTimerStore.getState().tasks[0].name).toBe("Study React");
  });

  it("Enter key in edit mode saves edit and calls updateTask()", async () => {
    const user = userEvent.setup();
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    // Click edit button
    const editButtons = screen.getAllByRole("button");
    const editButton = editButtons.find((btn) =>
      btn.querySelector('svg path[d*="M11 5H6"]'),
    );
    await user.click(editButton!);

    const input = screen.getByDisplayValue("Study React");
    await user.clear(input);
    await user.type(input, "Updated Name{Enter}");

    expect(useTimerStore.getState().tasks[0].name).toBe("Updated Name");
    expect(screen.getByText("Updated Name")).toBeInTheDocument();
  });

  it("delete button calls deleteTask() after confirm", async () => {
    const user = userEvent.setup();
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    // Find delete button (has trash icon SVG path)
    const deleteButtons = screen.getAllByRole("button");
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg path[d*="M19 7l"]'),
    );
    expect(deleteButton).toBeTruthy();
    await user.click(deleteButton!);

    expect(window.confirm).toHaveBeenCalledWith("Delete this task?");
    expect(useTimerStore.getState().tasks.length).toBe(0);
  });

  it("delete button does not delete when confirm returns false", async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => false);
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    const deleteButtons = screen.getAllByRole("button");
    const deleteButton = deleteButtons.find((btn) =>
      btn.querySelector('svg path[d*="M19 7l"]'),
    );
    await user.click(deleteButton!);

    expect(useTimerStore.getState().tasks.length).toBe(1);
  });

  it("selected task (currentTaskId matches) shows highlight styling", () => {
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
        {
          id: "task-2",
          name: "Write Tests",
          targetPomodoros: 10,
          completedPomodoros: 0,
          createdAt: Date.now(),
        },
      ],
      currentTaskId: "task-1",
    });
    render(<TasksList />);

    // Find the task container elements
    const taskContainers = screen.getAllByTestId("task-item");
    expect(taskContainers.length).toBe(2);

    // First task should have ring-2 ring-blue-500 classes
    expect(taskContainers[0].className).toContain("ring-2");
    expect(taskContainers[0].className).toContain("ring-blue-500");

    // Second task should NOT have ring-2
    expect(taskContainers[1].className).not.toContain("ring-2");
  });

  it("Cancel button closes add form", async () => {
    const user = userEvent.setup();
    render(<TasksList />);

    // Click + button to show form
    const addButton = screen.getByRole("button", { name: "Add task" });
    await user.click(addButton);

    expect(screen.getByPlaceholderText("Task name...")).toBeInTheDocument();

    // Click Cancel
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByPlaceholderText("Task name..."),
    ).not.toBeInTheDocument();
  });

  it("new task can be created with a custom goal", async () => {
    const user = userEvent.setup();
    render(<TasksList />);

    await user.click(screen.getByRole("button", { name: "Add task" }));
    await user.type(screen.getByPlaceholderText("Task name..."), "Read book");

    const goalInput = screen.getByLabelText("Goal (pomodoros)");
    await user.clear(goalInput);
    await user.type(goalInput, "8");
    await user.click(screen.getByRole("button", { name: "Increase goal" }));
    await user.click(screen.getByRole("button", { name: "Add" }));

    const tasks = useTimerStore.getState().tasks;
    expect(tasks[0].name).toBe("Read book");
    expect(tasks[0].targetPomodoros).toBe(9);
  });

  it("editing a task updates its goal", async () => {
    const user = userEvent.setup();
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 20,
          completedPomodoros: 3,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    await user.click(
      screen.getByRole("button", { name: "Edit goal for Study React" }),
    );
    const goalInput = screen.getByLabelText("Goal (pomodoros)");
    expect(goalInput).toHaveValue(20);

    await user.clear(goalInput);
    await user.type(goalInput, "5{Enter}");

    expect(useTimerStore.getState().tasks[0].targetPomodoros).toBe(5);
    expect(useTimerStore.getState().tasks[0].name).toBe("Study React");
    expect(screen.getByText("3 / 5")).toBeInTheDocument();
  });

  it("goal cannot go below 1", async () => {
    const user = userEvent.setup();
    render(<TasksList />);

    await user.click(screen.getByRole("button", { name: "Add task" }));
    const goalInput = screen.getByLabelText("Goal (pomodoros)");
    await user.clear(goalInput);
    await user.type(goalInput, "0");

    expect(
      screen.getByRole("button", { name: "Decrease goal" }),
    ).toBeDisabled();
  });

  it("progress bar reflects completed pomodoros", () => {
    useTimerStore.setState({
      tasks: [
        {
          id: "task-1",
          name: "Study React",
          targetPomodoros: 4,
          completedPomodoros: 1,
          createdAt: Date.now(),
        },
      ],
    });
    render(<TasksList />);

    const bar = screen.getByRole("progressbar", {
      name: "Study React progress",
    });
    expect(bar).toHaveAttribute("aria-valuenow", "1");
    expect(bar).toHaveAttribute("aria-valuemax", "4");
  });
});
