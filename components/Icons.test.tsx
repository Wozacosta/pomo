import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TasksIcon,
  TimerIcon,
  MusicIcon,
  MenuIcon,
  CloseIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  TrashIcon,
  EditIcon,
  CheckIcon,
} from "./Icons";

describe("Icons", () => {
  describe("TasksIcon", () => {
    it("renders with default className", () => {
      render(<TasksIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });

    it("renders with custom className", () => {
      render(<TasksIcon className="w-8 h-8 text-blue-500" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-8", "h-8", "text-blue-500");
    });

    it("has aria-hidden for accessibility", () => {
      render(<TasksIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("TimerIcon", () => {
    it("renders with default className", () => {
      render(<TimerIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });

    it("renders with custom className", () => {
      render(<TimerIcon className="w-4 h-4" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-4", "h-4");
    });

    it("has aria-hidden for accessibility", () => {
      render(<TimerIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("MusicIcon", () => {
    it("renders with default className", () => {
      render(<MusicIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });

    it("renders with custom className", () => {
      render(<MusicIcon className="w-10 h-10" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-10", "h-10");
    });

    it("has aria-hidden for accessibility", () => {
      render(<MusicIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("MenuIcon", () => {
    it("renders with default className", () => {
      render(<MenuIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });

    it("renders with custom className", () => {
      render(<MenuIcon className="w-5 h-5" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-5", "h-5");
    });
  });

  describe("CloseIcon", () => {
    it("renders with default className (w-5 h-5)", () => {
      render(<CloseIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-5", "h-5");
    });

    it("renders with custom className", () => {
      render(<CloseIcon className="w-6 h-6" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });
  });

  describe("SunIcon", () => {
    it("renders with default className", () => {
      render(<SunIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });

    it("renders with custom className", () => {
      render(<SunIcon className="w-4 h-4 text-yellow-500" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-4", "h-4", "text-yellow-500");
    });
  });

  describe("MoonIcon", () => {
    it("renders with default className", () => {
      render(<MoonIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });

    it("renders with custom className", () => {
      render(<MoonIcon className="w-4 h-4 text-gray-800" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-4", "h-4", "text-gray-800");
    });
  });

  describe("PlusIcon", () => {
    it("renders with default className (w-5 h-5)", () => {
      render(<PlusIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-5", "h-5");
    });

    it("renders with custom className", () => {
      render(<PlusIcon className="w-6 h-6" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6");
    });
  });

  describe("TrashIcon", () => {
    it("renders with default className (w-4 h-4)", () => {
      render(<TrashIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-4", "h-4");
    });

    it("renders with custom className", () => {
      render(<TrashIcon className="w-5 h-5 text-red-500" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-5", "h-5", "text-red-500");
    });
  });

  describe("EditIcon", () => {
    it("renders with default className (w-4 h-4)", () => {
      render(<EditIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-4", "h-4");
    });

    it("renders with custom className", () => {
      render(<EditIcon className="w-5 h-5" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-5", "h-5");
    });
  });

  describe("CheckIcon", () => {
    it("renders with default className (w-4 h-4)", () => {
      render(<CheckIcon />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-4", "h-4");
    });

    it("renders with custom className", () => {
      render(<CheckIcon className="w-6 h-6 text-green-500" />);
      const svg = document.querySelector("svg");
      expect(svg).toHaveClass("w-6", "h-6", "text-green-500");
    });
  });

  describe("SVG attributes", () => {
    it("all icons have proper SVG structure", () => {
      const icons = [
        TasksIcon,
        TimerIcon,
        MusicIcon,
        MenuIcon,
        CloseIcon,
        SunIcon,
        MoonIcon,
        PlusIcon,
        TrashIcon,
        EditIcon,
        CheckIcon,
      ];

      icons.forEach((Icon, index) => {
        const { unmount } = render(<Icon />);
        const svg = document.querySelector("svg");

        expect(svg).toBeInTheDocument();
        expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
        expect(svg).toHaveAttribute("fill", "none");
        expect(svg).toHaveAttribute("stroke", "currentColor");

        unmount();
      });
    });

    it("all icons have path elements with strokeLinecap and strokeLinejoin", () => {
      const icons = [
        TasksIcon,
        TimerIcon,
        MusicIcon,
        MenuIcon,
        CloseIcon,
        SunIcon,
        MoonIcon,
        PlusIcon,
        TrashIcon,
        EditIcon,
        CheckIcon,
      ];

      icons.forEach((Icon) => {
        const { unmount } = render(<Icon />);
        const path = document.querySelector("path");

        expect(path).toBeInTheDocument();
        expect(path).toHaveAttribute("stroke-linecap", "round");
        expect(path).toHaveAttribute("stroke-linejoin", "round");

        unmount();
      });
    });
  });
});
