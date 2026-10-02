"use client";

import { useState, useEffect } from "react";
import { MusicIcon } from "./Icons";

interface MusicLink {
  id: string;
  title: string;
  url: string;
  category: string;
}

const defaultMusicLinks: MusicLink[] = [
  {
    id: "1",
    title: "NTS Radio",
    url: "https://www.nts.live",
    category: "Radio",
  },
  {
    id: "2",
    title: "Do You World",
    url: "https://doyou.world",
    category: "Radio",
  },
  {
    id: "3",
    title: "Lo-Fi Hip Hop",
    url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
    category: "YouTube",
  },
  {
    id: "4",
    title: "SomaFM",
    url: "https://somafm.com/",
    category: "Radio",
  },
];

const STORAGE_KEY = "pomodoro-custom-music-links";

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

let idCounter = 0;
function generateId(): string {
  return `custom-${Date.now()}-${idCounter++}`;
}

function loadCustomLinks(): MusicLink[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is MusicLink =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.url === "string" &&
        typeof item.category === "string",
    );
  } catch {
    return [];
  }
}

function saveCustomLinks(links: MusicLink[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

export default function MusicPanel() {
  const [customLinks, setCustomLinks] = useState<MusicLink[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [urlError, setUrlError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Load custom links from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setCustomLinks(loadCustomLinks());
  }, []);

  const links = [...defaultMusicLinks, ...customLinks];

  const deleteCustomLink = (id: string) => {
    const updated = customLinks.filter((link) => link.id !== id);
    setCustomLinks(updated);
    saveCustomLinks(updated);
  };

  const categories = [
    "All",
    ...Array.from(new Set(links.map((link) => link.category))),
  ];

  const filteredLinks =
    selectedCategory === "All"
      ? links
      : links.filter((link) => link.category === selectedCategory);

  return (
    <div className="h-full px-5 pb-6 space-y-4">
      <div className="h-16 -mb-2 flex items-center">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Concentration Music
        </h2>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            aria-pressed={selectedCategory === category}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === category
                ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Music Links */}
      <div className="space-y-1 -mx-2.5">
        {filteredLinks.map((link) => {
          const isCustom = link.id.startsWith("custom-");
          return (
            <div key={link.id} className="relative">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 pr-3 rounded-xl border border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:border-zinc-200/80 dark:hover:border-zinc-800 transition-all group"
              >
                <span className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <MusicIcon className="w-4 h-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {link.title}
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                    {link.category}
                  </span>
                </span>
                {!isCustom && (
                  <svg
                    aria-hidden
                    className="w-4 h-4 shrink-0 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M9 7h8v8" />
                  </svg>
                )}
              </a>
              {isCustom && (
                <button
                  onClick={() => deleteCustomLink(link.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-zinc-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete link"
                  aria-label={`Delete ${link.title}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Link */}
      {showAddForm ? (
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Category (e.g., Radio, YouTube)"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {urlError && <p className="text-xs text-red-500">{urlError}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => {
                const trimmedUrl = newUrl.trim();
                if (!newTitle.trim()) return;
                if (!isValidUrl(trimmedUrl)) {
                  setUrlError("Please enter a valid http:// or https:// URL");
                  return;
                }
                setUrlError("");
                const newLink: MusicLink = {
                  id: generateId(),
                  title: newTitle.trim(),
                  url: trimmedUrl,
                  category: newCategory.trim() || "Custom",
                };
                const updated = [...customLinks, newLink];
                setCustomLinks(updated);
                saveCustomLinks(updated);
                setNewTitle("");
                setNewUrl("");
                setNewCategory("");
                setShowAddForm(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewTitle("");
                setNewUrl("");
                setNewCategory("");
                setUrlError("");
              }}
              className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-sm font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full p-3 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
        >
          + Add Custom Link
        </button>
      )}
    </div>
  );
}
