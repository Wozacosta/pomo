'use client';

import { useState } from 'react';

interface MusicLink {
  id: string;
  title: string;
  url: string;
  category: string;
}

const defaultMusicLinks: MusicLink[] = [
  {
    id: '1',
    title: 'NTS Radio',
    url: 'https://www.nts.live',
    category: 'Radio',
  },
  {
    id: '2',
    title: 'Do You World',
    url: 'https://doyou.world',
    category: 'Radio',
  },
  {
    id: '3',
    title: 'Lo-Fi Hip Hop',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    category: 'YouTube',
  },
  {
    id: '4',
    title: 'Deep Focus',
    url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    category: 'YouTube',
  },
];

export default function MusicPanel() {
  const [links] = useState<MusicLink[]>(defaultMusicLinks);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(links.map(link => link.category)))];

  const filteredLinks = selectedCategory === 'All'
    ? links
    : links.filter(link => link.category === selectedCategory);

  return (
    <div className="h-full p-6 space-y-4">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Concentration Music</h2>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Music Links */}
      <div className="space-y-2">
        {filteredLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{link.title}</div>
            <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{link.category}</div>
          </a>
        ))}
      </div>

      {/* Add Custom Link (placeholder for future) */}
      <button className="w-full p-3 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
        + Add Custom Link
      </button>
    </div>
  );
}
