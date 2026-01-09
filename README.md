# Pomodoro Timer App

A simple, elegant Pomodoro timer built with Next.js 16, featuring concentration music links and productivity tracking.

## Features

### MVP Features (Implemented)
- ✅ **Basic Pomodoro Timer** - 25-minute default, customizable duration
- ✅ **Visual Progress Indicator** - Circular progress ring showing time remaining
- ✅ **Pause/Resume Functionality** - Full control over timer state
- ✅ **Notification Sound** - Web Audio API beep when timer completes
- ✅ **Music Links Sidebar** - Curated links to concentration music (NTS, Do You World, YouTube)
- ✅ **localStorage Persistence** - All timer data saved locally
- ✅ **Dark/Light Mode** - Toggle between themes
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
└── store/
    ├── timer-store.ts   # Timer state management
    └── theme-store.ts   # Theme state management
```

## Getting Started

### Prerequisites

- Node.js >= 20.9.0 (recommended) or >= 18.18.2 (minimum)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Usage

1. **Start a Timer:** Click the "Start" button to begin a 25-minute Pomodoro session
2. **Pause/Resume:** Control the timer with pause and resume buttons
3. **Reset:** Reset the timer to the default duration
4. **Music Links:** Browse concentration music in the right panel
5. **Stats:** View your productivity stats in the left sidebar
6. **Dark Mode:** Toggle theme using the sun/moon icon in the header

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
