import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MobileNav from "./MobileNav";

describe("MobileNav component", () => {
  it("renders all three tabs", () => {
    render(<MobileNav activeTab="timer" onTabChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Tasks" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Timer" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Music" })).toBeInTheDocument();
  });

  it("marks active tab with aria-selected", () => {
    render(<MobileNav activeTab="timer" onTabChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Timer" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "Tasks" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "Music" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
  });

  it("calls onTabChange when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="timer" onTabChange={onTabChange} />);

    await user.click(screen.getByRole("tab", { name: "Tasks" }));
    expect(onTabChange).toHaveBeenCalledWith("tasks");

    await user.click(screen.getByRole("tab", { name: "Music" }));
    expect(onTabChange).toHaveBeenCalledWith("music");
  });

  it("supports keyboard navigation with arrow keys", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="timer" onTabChange={onTabChange} />);

    const timerTab = screen.getByRole("tab", { name: "Timer" });
    timerTab.focus();

    await user.keyboard("{ArrowRight}");
    expect(onTabChange).toHaveBeenCalledWith("music");

    await user.keyboard("{ArrowLeft}");
    expect(onTabChange).toHaveBeenCalledWith("tasks");
  });

  it("supports Home and End keys for navigation", async () => {
    const user = userEvent.setup();
    const onTabChange = vi.fn();
    render(<MobileNav activeTab="timer" onTabChange={onTabChange} />);

    const timerTab = screen.getByRole("tab", { name: "Timer" });
    timerTab.focus();

    await user.keyboard("{Home}");
    expect(onTabChange).toHaveBeenCalledWith("tasks");

    await user.keyboard("{End}");
    expect(onTabChange).toHaveBeenCalledWith("music");
  });

  it("has correct tabindex on active vs inactive tabs", () => {
    render(<MobileNav activeTab="music" onTabChange={() => {}} />);

    expect(screen.getByRole("tab", { name: "Music" })).toHaveAttribute(
      "tabIndex",
      "0"
    );
    expect(screen.getByRole("tab", { name: "Timer" })).toHaveAttribute(
      "tabIndex",
      "-1"
    );
    expect(screen.getByRole("tab", { name: "Tasks" })).toHaveAttribute(
      "tabIndex",
      "-1"
    );
  });

  it("has tablist role on nav element", () => {
    render(<MobileNav activeTab="timer" onTabChange={() => {}} />);
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});
