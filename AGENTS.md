# AGENTS.md - AI Assistant Guide

This document provides context and guidelines for AI assistants (like Claude, GPT, etc.) working on this Pomodoro Timer project.

## Project Overview

A modern Pomodoro Timer application built with Next.js 16, featuring dark mode, task management, productivity tracking, and curated concentration music links.

## Tech Stack

- **Framework**: Next.js 16.1.1 (App Router)
- **Runtime**: Node.js >=20.9.0
- **Package Manager**: pnpm 10.26.2
- **Language**: TypeScript 5.9.3
- **State Management**: Zustand 5.0.9 with persistence
- **Styling**: Tailwind CSS v4.1.18
- **UI**: React 19.2.3

## Architecture Patterns

### State Management
- **Zustand stores** with localStorage persistence
- Two main stores:
  - `timer-store.ts`: Timer state, tasks, sessions, streaks
  - `theme-store.ts`: Theme (light/dark) preferences

### File Structure
```
pomodoro-timer/
├── app/
│   ├── layout.tsx       # Root layout with theme script
│   ├── page.tsx         # Main page (timer/report views)
│   └── globals.css      # Tailwind v4 config + dark mode
├── components/
│   ├── Timer.tsx        # Main timer with circular progress
│   ├── Sidebar.tsx      # Stats, tasks, recent sessions
│   ├── TasksList.tsx    # Task management UI
│   ├── MusicPanel.tsx   # Concentration music links
│   ├── Report.tsx       # Analytics and charts
│   └── ThemeProvider.tsx # Client-side theme management
└── store/
    ├── timer-store.ts   # Timer state & logic
    └── theme-store.ts   # Theme state & persistence
```

## Key Implementation Details

### Dark Mode (Tailwind v4)
- **Critical**: `@custom-variant dark (&:where(.dark, .dark *));` in `globals.css`
- Classes must be explicitly added/removed (not toggled)
- Blocking script in `layout.tsx` prevents FOUC
- System preference detection on first visit
- Manual override with sun/moon toggle button

### Timer Logic
- Uses `setInterval` for ticking (1-second intervals)
- Three types: work (25m), short break (5m), long break (15m)
- Web Audio API for completion sound
- Sessions saved with timestamps, duration, task reference

### Styling Conventions
- All components have `dark:` variants for backgrounds, text, borders
- Use `zinc` color palette for neutral UI elements
- Blue (`blue-600`) for primary actions
- Smooth transitions: `transition-colors`, `transition-all`

## Common Tasks

### Adding a New Component
1. Create in `components/` directory
2. Use `'use client'` if it has state/effects
3. Add dark mode classes: `bg-white dark:bg-zinc-900`
4. Import and use relevant Zustand stores

### Modifying Timer Behavior
- Edit `store/timer-store.ts`
- Timer actions: `startTimer`, `pauseTimer`, `resumeTimer`, `resetTimer`, `tick`
- Session completion: `completeSession` (updates stats, tasks, streaks)

### Adding New Theme Features
- Modify `store/theme-store.ts` for state
- Update `components/ThemeProvider.tsx` for logic
- Add CSS variables in `globals.css` if needed

### Creating New Pages
- Add to `app/` directory (App Router)
- Use Server Components by default
- Add `'use client'` only when needed (state, effects, browser APIs)

## Code Style Guidelines

### TypeScript
- Strict types (no `any` unless absolutely necessary)
- Define interfaces for complex objects
- Use type inference where obvious

### React
- Functional components only
- Custom hooks for reusable logic
- Minimize useEffect dependencies
- Clean up intervals/listeners

### Tailwind
- Prefer utility classes over custom CSS
- Use semantic spacing: `p-4`, `gap-2`, `space-y-4`
- Responsive design: default mobile, then `md:`, `lg:`
- Dark mode: always include `dark:` variants

### State Management
- Keep Zustand stores flat and simple
- Use middleware sparingly (persist only when needed)
- Derive computed values in selectors or components
- Avoid nested updates

## Known Issues & Gotchas

### Node Version
- **Must use Node 20.9.0+** for Next.js 16
- Build will fail on Node 18
- Use `nvm` or `n` to switch versions

### Tailwind v4 Dark Mode
- Config is in CSS, not `tailwind.config.js`
- Must use `@custom-variant` directive
- Classes must be explicit (`.add()` / `.remove()`, not `.toggle()`)

### Web Audio API
- Requires user interaction to work in some browsers
- Use `try/catch` for fallback behavior
- Type as `any` for webkit compatibility

### Zustand Persistence
- Serializes to localStorage as JSON
- Check `typeof window !== 'undefined'` before DOM access
- Handle hydration mismatches with `suppressHydrationWarning`

## Testing Checklist

When making changes, verify:

- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Build succeeds: `pnpm build` (requires Node 20+)
- [ ] Dark mode works (toggle in UI)
- [ ] Timer starts/pauses/resets correctly
- [ ] Tasks can be added/edited/deleted
- [ ] Sessions persist after reload
- [ ] No console errors
- [ ] Responsive on mobile viewport

## Development Workflow

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Type check
npx tsc --noEmit

# Build for production
pnpm build

# Run production build
pnpm start

# Lint
pnpm lint
```

## Environment Requirements

- Node.js >= 20.9.0
- pnpm >= 10.26.2
- Modern browser with ES2020+ support
- localStorage enabled

## Future Enhancements (Roadmap)

### Phase 2
- Music categories and favorites
- Custom music links
- Enhanced streak tracking with grace period
- Basic achievements system
- Offline support (Service Worker)
- PWA installation

### Phase 3
- Optional backend sync
- Cross-device real-time sync
- Subject tagging for learning sessions
- Advanced analytics
- Music correlation with productivity

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [React 19 Docs](https://react.dev/)

## Debugging Tips

### Dark Mode Not Working
1. Check `@custom-variant` is in `globals.css`
2. Verify classes on `<html>` element in DevTools
3. Check localStorage: `localStorage.getItem('pomodoro-theme-storage')`
4. See `DARK_MODE_SETUP.md` for comprehensive guide

### Timer Issues
1. Check if `setInterval` is being cleared properly
2. Verify `tick()` is being called each second
3. Look for competing useEffect dependencies
4. Check browser console for errors

### State Not Persisting
1. Verify localStorage is enabled
2. Check Zustand persist config has correct `name`
3. Look for serialization errors (circular refs)
4. Clear storage and test fresh: `localStorage.clear()`

## Contributing Guidelines

When modifying this project:

1. **Maintain existing patterns**: Follow the established architecture
2. **Add dark mode**: Every new UI element needs `dark:` classes
3. **Type safety**: No `any` types without good reason
4. **Mobile-first**: Ensure responsive design
5. **Accessibility**: Include ARIA labels, keyboard navigation
6. **Performance**: Avoid unnecessary re-renders
7. **Documentation**: Update README.md and this file as needed

## Agent-Specific Notes

### When Adding Features
- Start by checking if similar patterns exist in the codebase
- Reuse components and utilities when possible
- Keep features modular and self-contained
- Add to roadmap sections in README if it's a significant feature

### When Fixing Bugs
- Reproduce the issue first
- Check if it's a known issue (see "Known Issues" above)
- Fix root cause, not symptoms
- Add defensive programming for edge cases
- Consider if fix impacts dark mode, persistence, or mobile

### When Refactoring
- Don't change working dark mode implementation
- Keep Zustand stores simple
- Maintain type safety
- Test thoroughly after refactoring
- Update documentation if patterns change

## Quick Reference

### Key Files to Know
- `app/globals.css` - Tailwind v4 config, dark mode setup
- `app/layout.tsx` - Root layout, theme script, fonts
- `app/page.tsx` - Main app UI and layout
- `store/timer-store.ts` - All timer logic and state
- `store/theme-store.ts` - Theme management
- `components/Timer.tsx` - Main timer component

### Common Imports
```typescript
import { useTimerStore } from '@/store/timer-store';
import { useThemeStore } from '@/store/theme-store';
import { useState, useEffect } from 'react';
```

### Dark Mode Classes Pattern
```tsx
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50">
  <button className="bg-blue-600 hover:bg-blue-700">
    Action
  </button>
</div>
```

---

**Last Updated**: 2025
**Version**: 0.1.0
**Status**: Active Development