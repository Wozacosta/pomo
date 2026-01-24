# Pomodoro Timer App

A simple, elegant Pomodoro timer built with Next.js 16, featuring concentration music links and productivity tracking.

## Features

### MVP Features (Implemented)
- ✅ **Basic Pomodoro Timer** - 25-minute default, customizable duration
- ✅ **Visual Progress Indicator** - Circular progress ring showing time remaining
- ✅ **Pause/Resume Functionality** - Full control over timer state
- ✅ **Notification Sound** - Web Audio API beep when timer completes
- ✅ **Browser Tab Countdown** - Shows remaining time in browser tab title (e.g., "23:45 - Pomodoro")
- ✅ **Background Tab Support** - Timer continues accurately even when tab is in background (uses Web Worker)
- ✅ **Music Links Sidebar** - Curated links to concentration music (NTS, Do You World, YouTube)
- ✅ **localStorage Persistence** - All timer data saved locally
- ✅ **Dark/Light Mode** - Automatic system preference detection with manual toggle override
- ✅ **Simple Stats** - Total completed, current streak, longest streak
- ✅ **Basic Timeline** - Recent sessions display

### Architecture

- **Framework:** Next.js 16 with App Router
- **State Management:** Zustand with persistence middleware
- **Styling:** Tailwind CSS with dark mode support
- **Type Safety:** TypeScript

### Project Structure

```
pomodoro-timer/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Main page with layout
│   └── globals.css      # Global styles
├── components/
│   ├── Timer.tsx        # Main timer component
│   ├── Sidebar.tsx      # Stats and session history
│   └── MusicPanel.tsx   # Music links panel
├── public/
│   └── timer-worker.js  # Web Worker for background timer
└── store/
    ├── timer-store.ts   # Timer state management
    └── theme-store.ts   # Theme state management
```

### Timer Implementation

The timer uses a **timestamp-based approach** combined with a **Web Worker** to ensure accurate timing even when the browser tab is in the background.

**Why this matters:**
- Browsers throttle `setInterval` to ~1/minute in background tabs to save resources
- A naive countdown would freeze or drift significantly when the tab is not visible

**How it works:**

1. **Timestamp-based timing** (`store/timer-store.ts`):
   - When timer starts, stores `endTime = Date.now() + duration * 1000`
   - Each tick calculates remaining time as `endTime - Date.now()`
   - When paused, stores `pausedTimeRemaining` and clears `endTime`
   - When resumed, recalculates `endTime` from remaining time

2. **Web Worker** (`public/timer-worker.js`):
   - Runs in a separate thread, not throttled by browser
   - Sends `tick` message every second to the main thread
   - Timer component receives messages and updates state

3. **Document title** (`components/Timer.tsx`):
   - Updates on every tick with format: `"23:45 - Pomodoro"`
   - Shows session type (Pomodoro, Short Break, Long Break)
   - Resets to "Pomodoro Timer" when timer is stopped

## Getting Started

### Prerequisites

- Node.js >= 20.9.0 (required for Next.js 16)
- pnpm >= 10.26.2 (package manager)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

### Using pnpm

This project uses pnpm as the package manager. If you don't have pnpm installed:

```bash
# Install pnpm globally
npm install -g pnpm

# Or use Corepack (built into Node.js 16+)
corepack enable
corepack prepare pnpm@10.26.2 --activate
```

**Why pnpm?**
- Faster installation and less disk space usage
- Strict dependency resolution (prevents phantom dependencies)
- Better monorepo support
- Lockfile is committed for reproducible builds

## Usage

1. **Start a Timer:** Click the "Start" button to begin a 25-minute Pomodoro session
2. **Pause/Resume:** Control the timer with pause and resume buttons
3. **Reset:** Reset the timer to the default duration
4. **Music Links:** Browse concentration music in the right panel
5. **Stats:** View your productivity stats in the left sidebar
5. **Dark Mode:** Automatically follows system preference, or toggle manually using the sun/moon icon in the header

## Future Enhancements (Phase 2)

- Music categories and favorites
- Custom music links
- Enhanced streaks with grace period
- Basic achievements system
- Offline support (Service Worker + IndexedDB)
- PWA mobile installation

## Future Enhancements (Phase 3)

- Backend sync (optional login)
- Cross-device real-time sync
- Learning sessions with subject tagging
- Advanced analytics and music correlation
- Research links section

## License

MIT
