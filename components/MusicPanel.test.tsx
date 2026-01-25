import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MusicPanel from "./MusicPanel";

describe("MusicPanel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("rendering", () => {
    it("renders the title", () => {
      render(<MusicPanel />);
      expect(screen.getByText("Concentration Music")).toBeInTheDocument();
    });

    it("renders default music links", () => {
      render(<MusicPanel />);
      expect(screen.getByText("NTS Radio")).toBeInTheDocument();
      expect(screen.getByText("Do You World")).toBeInTheDocument();
      expect(screen.getByText("Lo-Fi Hip Hop")).toBeInTheDocument();
      expect(screen.getByText("Deep Focus")).toBeInTheDocument();
    });

    it("renders category filter buttons", () => {
      render(<MusicPanel />);
      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Radio" })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "YouTube" }),
      ).toBeInTheDocument();
    });

    it("renders add custom link button", () => {
      render(<MusicPanel />);
      expect(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      ).toBeInTheDocument();
    });
  });

  describe("category filtering", () => {
    it("shows all links when All category is selected", () => {
      render(<MusicPanel />);

      // All is selected by default
      expect(screen.getByText("NTS Radio")).toBeInTheDocument();
      expect(screen.getByText("Lo-Fi Hip Hop")).toBeInTheDocument();
    });

    it("filters links by Radio category", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(screen.getByRole("button", { name: "Radio" }));

      expect(screen.getByText("NTS Radio")).toBeInTheDocument();
      expect(screen.getByText("Do You World")).toBeInTheDocument();
      expect(screen.queryByText("Lo-Fi Hip Hop")).not.toBeInTheDocument();
    });

    it("filters links by YouTube category", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(screen.getByRole("button", { name: "YouTube" }));

      expect(screen.queryByText("NTS Radio")).not.toBeInTheDocument();
      expect(screen.getByText("Lo-Fi Hip Hop")).toBeInTheDocument();
      expect(screen.getByText("Deep Focus")).toBeInTheDocument();
    });
  });

  describe("add custom link form", () => {
    it("shows form when add button is clicked", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );

      expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("URL (https://...)"),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Category (e.g., Radio, YouTube)"),
      ).toBeInTheDocument();
    });

    it("hides form when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      expect(screen.queryByPlaceholderText("Title")).not.toBeInTheDocument();
    });

    it("adds custom link with valid URL", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );

      await user.type(screen.getByPlaceholderText("Title"), "My Music");
      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "https://example.com/music",
      );
      await user.type(
        screen.getByPlaceholderText("Category (e.g., Radio, YouTube)"),
        "Streaming",
      );

      await user.click(screen.getByRole("button", { name: "Add" }));

      expect(screen.getByText("My Music")).toBeInTheDocument();
      // Streaming appears both as category button and link category - check link exists
      expect(
        screen.getByRole("link", { name: /My Music/i }),
      ).toBeInTheDocument();
    });

    it("uses Custom as default category", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );

      await user.type(screen.getByPlaceholderText("Title"), "Test Link");
      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "https://test.com",
      );
      // Don't fill category

      await user.click(screen.getByRole("button", { name: "Add" }));

      expect(screen.getByText("Test Link")).toBeInTheDocument();
      // Category should be Custom
      expect(
        screen.getByRole("button", { name: "Custom" }),
      ).toBeInTheDocument();
    });

    it("shows error for invalid URL", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );

      await user.type(screen.getByPlaceholderText("Title"), "Bad Link");
      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "not-a-url",
      );

      await user.click(screen.getByRole("button", { name: "Add" }));

      expect(
        screen.getByText("Please enter a valid http:// or https:// URL"),
      ).toBeInTheDocument();
    });

    it("does not add link without title", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );

      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "https://test.com",
      );

      await user.click(screen.getByRole("button", { name: "Add" }));

      // Form should still be visible
      expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    });

    it("clears form after cancel", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );

      await user.type(screen.getByPlaceholderText("Title"), "Test");
      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "https://test.com",
      );

      await user.click(screen.getByRole("button", { name: "Cancel" }));

      // Reopen form
      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );

      expect(screen.getByPlaceholderText("Title")).toHaveValue("");
      expect(screen.getByPlaceholderText("URL (https://...)")).toHaveValue("");
    });
  });

  describe("custom link deletion", () => {
    it("shows delete button only for custom links", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      // Add a custom link first
      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );
      await user.type(screen.getByPlaceholderText("Title"), "Custom Music");
      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "https://custom.com",
      );
      await user.click(screen.getByRole("button", { name: "Add" }));

      // Should have exactly one delete button (for the custom link)
      const deleteButtons = screen.getAllByTitle("Delete link");
      expect(deleteButtons).toHaveLength(1);
    });

    it("deletes custom link when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      // Add a custom link
      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );
      await user.type(screen.getByPlaceholderText("Title"), "To Delete");
      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "https://delete.com",
      );
      await user.click(screen.getByRole("button", { name: "Add" }));

      expect(screen.getByText("To Delete")).toBeInTheDocument();

      // Delete it
      await user.click(screen.getByTitle("Delete link"));

      expect(screen.queryByText("To Delete")).not.toBeInTheDocument();
    });
  });

  describe("localStorage persistence", () => {
    it("persists custom links to localStorage", async () => {
      const user = userEvent.setup();
      render(<MusicPanel />);

      await user.click(
        screen.getByRole("button", { name: "+ Add Custom Link" }),
      );
      await user.type(screen.getByPlaceholderText("Title"), "Persisted Link");
      await user.type(
        screen.getByPlaceholderText("URL (https://...)"),
        "https://persist.com",
      );
      await user.click(screen.getByRole("button", { name: "Add" }));

      const stored = localStorage.getItem("pomodoro-custom-music-links");
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].title).toBe("Persisted Link");
    });

    it("loads custom links from localStorage on mount", async () => {
      // Pre-populate localStorage
      const customLinks = [
        {
          id: "custom-123",
          title: "Preloaded Link",
          url: "https://preloaded.com",
          category: "Test",
        },
      ];
      localStorage.setItem(
        "pomodoro-custom-music-links",
        JSON.stringify(customLinks),
      );

      render(<MusicPanel />);

      await waitFor(() => {
        expect(screen.getByText("Preloaded Link")).toBeInTheDocument();
      });
    });

    it("handles invalid localStorage data gracefully", () => {
      localStorage.setItem("pomodoro-custom-music-links", "invalid json{");

      // Should not throw
      expect(() => render(<MusicPanel />)).not.toThrow();
    });

    it("handles non-array localStorage data", () => {
      localStorage.setItem(
        "pomodoro-custom-music-links",
        JSON.stringify({ not: "array" }),
      );

      expect(() => render(<MusicPanel />)).not.toThrow();
    });
  });

  describe("link rendering", () => {
    it("renders links with correct href", () => {
      render(<MusicPanel />);

      const ntsLink = screen.getByRole("link", { name: /NTS Radio/i });
      expect(ntsLink).toHaveAttribute("href", "https://www.nts.live");
    });

    it("opens links in new tab", () => {
      render(<MusicPanel />);

      const ntsLink = screen.getByRole("link", { name: /NTS Radio/i });
      expect(ntsLink).toHaveAttribute("target", "_blank");
      expect(ntsLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });
});
