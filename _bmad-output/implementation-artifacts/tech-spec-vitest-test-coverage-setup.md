---
title: 'Vitest Test Coverage Setup'
slug: 'vitest-test-coverage-setup'
created: '2026-01-25'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['next.js-16', 'react-19', 'zustand', 'typescript', 'tailwind-4', 'vitest', 'react-testing-library', 'jsdom']
files_to_modify: ['package.json', 'vitest.config.ts', 'vitest.setup.ts', 'store/timer-store.test.ts', 'store/theme-store.test.ts', 'components/Timer.test.tsx', 'components/TasksList.test.tsx', 'components/Report.test.tsx']
code_patterns: ['path-alias-@/*', 'zustand-persist-middleware', 'web-worker-timer']
test_patterns: ['co-located-tests', 'vi-fake-timers', 'mock-localstorage', 'mock-web-worker']
---

# Tech-Spec: Vitest Test Coverage Setup

**Created:** 2026-01-25

## Overview

### Problem Statement

Pomodoro timer app has zero test coverage. Need a test framework and comprehensive tests to catch regressions and ensure reliability.

### Solution

Set up Vitest with React Testing Library, write unit tests for Zustand stores and component tests for React components, with proper mocking for localStorage, Web Workers, and Date.

### Scope

**In Scope:**
- Vitest + React Testing Library setup
- Unit tests for `timer-store.ts` (timer logic, task CRUD, session tracking, streaks)
- Unit tests for `theme-store.ts` (theme toggle)
- Component tests for `Timer.tsx`, `TasksList.tsx`, `Report.tsx`
- Mock localStorage for isolation tests, real localStorage for integration
- Mock Web Worker for timer tick behavior
- Mock `Date.now()` for deterministic date-based tests
- Test script in `package.json`

**Out of Scope:**
- E2E tests (Playwright/Cypress)
- Visual regression tests
- Coverage thresholds/CI integration

## Context for Development

### Codebase Patterns

- **Framework:** Next.js 16 App Router with React 19
- **State:** Zustand stores with `persist` middleware (keys: `pomodoro-timer-storage`, `pomodoro-theme-storage`)
- **Language:** TypeScript with strict mode, path alias `@/*` → `./*`
- **Styling:** Tailwind CSS 4
- **Package Manager:** pnpm
- **Timer:** Web Worker at `public/timer-worker.js` sends 'tick' every 1s when started

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `store/timer-store.ts` | Timer state, task CRUD, session tracking, streak logic (~230 lines) |
| `store/theme-store.ts` | Theme toggle with localStorage persistence (~45 lines) |
| `components/Timer.tsx` | Main timer UI, Web Worker integration, AudioContext sounds (~280 lines) |
| `components/TasksList.tsx` | Task CRUD UI with inline editing (~130 lines) |
| `components/Report.tsx` | Session reporting, date grouping, chart calculations (~180 lines) |
| `public/timer-worker.js` | Simple Web Worker: start/stop interval, posts 'tick' messages |
| `tsconfig.json` | Path alias config, jsx: react-jsx |

### Technical Decisions

1. **Vitest over Jest** - Faster, native ESM, Vite-compatible, same API
2. **jsdom environment** - Required for React Testing Library DOM queries
3. **Co-located tests** - `*.test.ts(x)` next to source files
4. **Mock strategy:**
   - Web Worker: Mock `Worker` constructor globally in setup file (see detailed mock below)
   - localStorage: Clear between tests via `beforeEach`
   - Date/Time: `vi.useFakeTimers()` for deterministic tests
   - AudioContext: Mock to avoid errors, don't test audio output
5. **Path alias** - Configure Vitest to resolve `@/*` same as tsconfig
6. **Zustand persist isolation** - Create store reset helper, clear localStorage before each test

## Implementation Plan

### Tasks

- [ ] **Task 1: Install test dependencies**
  - File: `package.json`
  - Action: Run `pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react jsdom`
  - Notes: These are all dev dependencies

- [ ] **Task 2: Create Vitest config**
  - File: `vitest.config.ts` (new)
  - Action: Create config with:
    - `environment: 'jsdom'`
    - `globals: true`
    - Path alias resolution matching tsconfig (`@/*` → `./*`)
    - `setupFiles: ['./vitest.setup.ts']`
    - React plugin for JSX transform
  - Notes: Use `defineConfig` from vitest/config

- [ ] **Task 3: Create test setup file**
  - File: `vitest.setup.ts` (new)
  - Action: Create setup file with:
    - Import `@testing-library/jest-dom` for DOM matchers
    - **Worker mock (critical):** Must support property assignment for `onmessage`:
      ```typescript
      class MockWorker {
        onmessage: ((e: MessageEvent) => void) | null = null;
        postMessage = vi.fn();
        terminate = vi.fn();
        // Helper to simulate tick from outside
        simulateTick() {
          this.onmessage?.({ data: 'tick' } as MessageEvent);
        }
      }
      let mockWorkerInstance: MockWorker;
      vi.stubGlobal('Worker', vi.fn(() => {
        mockWorkerInstance = new MockWorker();
        return mockWorkerInstance;
      }));
      // Export for tests to trigger ticks
      export { mockWorkerInstance };
      ```
    - Mock `window.AudioContext` and `window.webkitAudioContext` (return mock with `createOscillator`, `createGain`, `destination`)
    - **Store reset helper:** Export `resetTimerStore()` and `resetThemeStore()` functions that reset Zustand state to initial values
    - `beforeEach`: Clear localStorage, reset stores
    - `afterEach`: Cleanup via `@testing-library/react`, restore timers if faked
  - Notes: This runs before every test file

- [ ] **Task 4: Add test script to package.json**
  - File: `package.json`
  - Action: Add scripts:
    - `"test": "vitest"`
    - `"test:run": "vitest run"`
  - Notes: `vitest` runs in watch mode, `vitest run` for CI

- [ ] **Task 5: Write timer-store unit tests**
  - File: `store/timer-store.test.ts` (new)
  - Action: Test all store actions with comprehensive coverage:
    - **startTimer() tests:**
      - Default: Sets isRunning=true, calculates endTime from workDuration
      - With customDuration param: Uses `customDuration * 60` instead of default
      - Different timerTypes: shortBreak and longBreak use their respective durations
    - **pauseTimer() tests:**
      - Sets isPaused=true, isRunning=false
      - Stores current `currentTime` in `pausedTimeRemaining`
      - Clears `endTime` to null
    - **resumeTimer() tests:**
      - Resumes from paused state, recalculates endTime from `pausedTimeRemaining`
      - **Fallback test:** When `pausedTimeRemaining` is null, falls back to `currentTime`
    - **resetTimer() tests:**
      - Resets based on current timerType (work/shortBreak/longBreak)
      - Clears isRunning, isPaused, endTime, pausedTimeRemaining
    - **tick() tests:**
      - Decrements currentTime based on endTime when running
      - **Guard condition test:** Does nothing when `isPaused=true`
      - **Guard condition test:** Does nothing when `isRunning=false`
      - **Guard condition test:** Does nothing when `endTime=null`
      - Calls `completeSession()` when remaining hits 0
    - **completeSession() tests:**
      - Creates session with correct timestamps and duration
      - Increments `totalCompleted`
      - Updates task's `completedPomodoros` if `currentTaskId` set
    - **Streak logic tests (critical):**
      - **Same day:** Session on same day as last session → streak stays same (no increment)
      - **Yesterday continuation:** Session today after session yesterday → streak increments by 1
      - **New streak:** Session today with no recent sessions → streak resets to 1
      - **First session ever:** No previous sessions → streak becomes 1
    - **Task CRUD tests:**
      - `addTask()`: Creates task with name, `targetPomodoros: 20` default, `completedPomodoros: 0`
      - `updateTask()`: Updates specific task by id
      - `deleteTask()`: Removes task, clears `currentTaskId` if deleted task was current
      - **deleteTask edge case:** Verify behavior when deleting non-current task (currentTaskId unchanged)
    - **setTimerType() tests:**
      - Changes timerType and calls resetTimer
      - **With running timer:** Captures `wasRunning` but currently unused - document this behavior
    - **updateSettings() tests:**
      - Updates duration settings
      - **When not running:** Calls `resetTimer()` to apply new duration
      - **When running:** Does NOT call `resetTimer()` (timer continues with old duration)
    - **setCurrentTask() tests:**
      - Sets both `currentTaskId` and `currentTaskName`
      - Can clear by passing undefined
  - Notes: Use `vi.useFakeTimers()` and `vi.setSystemTime()` for Date.now() control. Call `resetTimerStore()` in beforeEach.

- [ ] **Task 6: Write theme-store unit tests**
  - File: `store/theme-store.test.ts` (new)
  - Action: Test all store actions:
    - `toggleTheme()`: Flips light↔dark, sets manuallySet=true, updates DOM classList
    - `setTheme('dark')`: Sets theme to dark, updates DOM classList
    - `setTheme('light', true)`: Sets theme with manual flag
    - DOM classList updates: Verify `document.documentElement.classList.add/remove` called correctly
    - **SSR guard note:** The `typeof window !== "undefined"` check cannot be easily tested in jsdom (window always exists). Document this as untested branch - would require SSR test environment.
  - Notes: Use jsdom's real `document.documentElement.classList`. Call `resetThemeStore()` in beforeEach.

- [ ] **Task 7: Write Timer component tests**
  - File: `components/Timer.test.tsx` (new)
  - Action: Test component behavior:
    - Renders initial state with formatted time (25:00)
    - Timer type buttons switch between work/shortBreak/longBreak
    - Start button calls `startTimer()`
    - Pause/Resume button toggles timer state
    - Reset button calls `resetTimer()`
    - Task input shows/hides on "+ Add focus task" button click
    - Task input submits on Enter, calls `setCurrentTask()`
    - **Task input with existing task (case-insensitive):** When input matches existing task name (case-insensitive), calls `setCurrentTask(existingTask.id, existingTask.name)`
    - **Task input with new task name:** When input doesn't match, calls `setCurrentTask(undefined, inputValue)`
    - Displays current task name when set
    - Progress circle updates with timer progress
    - **Worker tick simulation:** Use `mockWorkerInstance.simulateTick()` to verify `tick()` is called
  - Notes: Mock the timer store with `vi.mock()`. Test user interactions with `@testing-library/user-event`.

- [ ] **Task 8: Write TasksList component tests**
  - File: `components/TasksList.test.tsx` (new)
  - Action: Test component behavior:
    - Renders empty state message when no tasks
    - Renders list of tasks with name and progress (completedPomodoros / targetPomodoros)
    - Add task button (+ icon) shows input form
    - New task input submits on Enter, calls `addTask()`
    - **Escape key in add mode:** Pressing Escape closes add form without calling `addTask()`
    - Task checkbox toggles `setCurrentTask()` - checked calls with task id, unchecked calls with undefined
    - Edit button enables inline editing with current task name
    - **Escape key in edit mode:** Pressing Escape cancels edit without calling `updateTask()`
    - **Enter key in edit mode:** Pressing Enter saves edit, calls `updateTask()`
    - Delete button calls `deleteTask()` after confirm
    - Selected task (currentTaskId matches) shows highlight styling (ring-2 ring-blue-500)
  - Notes: Mock timer store, mock `window.confirm` to return true for delete tests (and false for cancel test).

- [ ] **Task 9: Write Report component tests**
  - File: `components/Report.test.tsx` (new)
  - Action: Test component behavior:
    - Renders empty state when no sessions ("No data yet...")
    - Renders chart section with last 7 days
    - Groups sessions by date correctly (uses `toDateString()`)
    - Calculates task totals correctly (sum of session durations per task)
    - Formats time as HH:MM (hours:minutes, not MM:SS)
    - Summary table shows tasks sorted by total time descending
    - **Date freezing methodology:** 
      1. Use `vi.useFakeTimers()` BEFORE importing/rendering component
      2. Set system time with `vi.setSystemTime(new Date('2026-01-25T12:00:00'))`
      3. Render component fresh (mount after time is frozen)
      4. This ensures `useMemo` calculations use frozen date
    - Verify correct 7-day range labels (Jan 19 - Jan 25 for frozen date)
  - Notes: Seed store with test sessions spanning multiple days and tasks before rendering.

### Acceptance Criteria

- [ ] **AC 1:** Given dependencies are installed, when running `pnpm test`, then Vitest starts in watch mode without errors
- [ ] **AC 2:** Given a test file exists, when it imports from `@/store/timer-store`, then the path alias resolves correctly
- [ ] **AC 3:** Given timer-store tests run, when `startTimer()` is called without params, then `isRunning` is true and `endTime` is set to `Date.now() + workDuration * 60 * 1000`
- [ ] **AC 3b:** Given timer-store tests run, when `startTimer(10)` is called with customDuration, then `duration` is `10 * 60` seconds
- [ ] **AC 4:** Given timer-store tests run, when `pauseTimer()` is called while running, then `isPaused` is true and `pausedTimeRemaining` stores the remaining time
- [ ] **AC 5:** Given timer-store tests run, when `completeSession()` is called, then a new session is added to `sessions` array with correct timestamps
- [ ] **AC 6:** Given timer-store tests run, when a session completes on a new day after yesterday's session, then `currentStreak` increments by 1
- [ ] **AC 6b:** Given timer-store tests run, when a session completes on same day as previous session, then `currentStreak` stays unchanged
- [ ] **AC 7:** Given timer-store tests run, when `addTask('Test Task')` is called, then a task with that name and `targetPomodoros: 20` is added
- [ ] **AC 8:** Given theme-store tests run, when `toggleTheme()` is called from light, then theme becomes dark and `document.documentElement.classList` contains 'dark'
- [ ] **AC 9:** Given Timer component renders, when user clicks 'Start', then `startTimer` action is called
- [ ] **AC 10:** Given Timer component renders with `isRunning: true`, when user clicks 'Pause', then `pauseTimer` action is called
- [ ] **AC 11:** Given TasksList component renders with tasks, when user clicks task checkbox, then `setCurrentTask` is called with task id
- [ ] **AC 12:** Given TasksList component renders, when user adds a new task via input, then `addTask` is called with the input value
- [ ] **AC 12b:** Given TasksList is in add mode, when user presses Escape, then add form closes without calling `addTask`
- [ ] **AC 13:** Given Report component renders with sessions, when dates are frozen to Jan 25 2026, then chart shows Jan 19-25 date range
- [ ] **AC 14:** Given Report component renders with sessions, when sessions exist for multiple tasks, then summary table shows correct totals per task sorted descending
- [ ] **AC 15:** Given all tests run via `pnpm test:run`, then all tests pass with exit code 0
- [ ] **AC 16:** Given timer-store tests run, when `tick()` is called while `isPaused=true`, then `currentTime` does not change
- [ ] **AC 17:** Given timer-store tests run, when `updateSettings({workDuration: 30})` is called while not running, then `resetTimer()` is called and `currentTime` reflects new duration

## Additional Context

### Dependencies

**Dev Dependencies to Install:**
- `vitest` - Test runner
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - DOM assertion matchers (toBeInTheDocument, etc.)
- `@testing-library/user-event` - User interaction simulation
- `@vitejs/plugin-react` - React plugin for Vite/Vitest JSX transform
- `jsdom` - DOM implementation for Node.js

### Testing Strategy

1. **Store tests (unit):**
   - Import store directly, call actions, assert state changes
   - **Reset store between tests:** Create helper functions that reset store to initial state:
     ```typescript
     // In vitest.setup.ts or test file
     export function resetTimerStore() {
       useTimerStore.setState({
         isRunning: false,
         isPaused: false,
         currentTime: 25 * 60,
         duration: 25 * 60,
         endTime: null,
         pausedTimeRemaining: null,
         timerType: 'work',
         workDuration: 25,
         shortBreakDuration: 5,
         longBreakDuration: 15,
         tasks: [],
         sessions: [],
         totalCompleted: 0,
         currentStreak: 0,
         longestStreak: 0,
         currentTaskId: undefined,
         currentTaskName: undefined,
       });
     }
     ```
   - Use `vi.useFakeTimers()` for time-dependent logic
   - No mocking of store internals - test public API

2. **Component tests (integration):**
   - Render component with `@testing-library/react`
   - Mock Zustand store to control state OR use real store with reset
   - Use `userEvent` for realistic user interactions
   - Assert on rendered output and mock function calls

3. **Mocking approach:**
   - Global mocks in `vitest.setup.ts` for Worker, AudioContext
   - Worker mock must be a class that supports `onmessage` property assignment
   - Export `mockWorkerInstance` to allow tests to simulate tick messages
   - Real localStorage in jsdom, cleared between tests

4. **Date/Time testing:**
   - Call `vi.useFakeTimers()` at top of test file or in beforeAll
   - Use `vi.setSystemTime(date)` to freeze specific dates
   - For components using `useMemo` with dates, freeze time BEFORE render
   - Call `vi.useRealTimers()` in afterAll to restore

### Notes

- **Risk: React 19 compatibility** - Ensure @testing-library/react version supports React 19 (v15+ should work)
- **Zustand persist handling:** Clearing localStorage in beforeEach + resetting store state ensures clean slate. Persist middleware will try to rehydrate but localStorage is empty so it uses initial state.
- **Limitation:** Audio playback not tested (mocked) - would require E2E for real audio testing
- **Limitation:** SSR guard branches (`typeof window !== "undefined"`) untested in jsdom environment
- **Potential bug noted:** `deleteTask()` clears `currentTaskId` but not `currentTaskName` when deleting current task - tests should document this behavior
- **Unused code noted:** `setTimerType()` captures `wasRunning` but doesn't use it - tests should document this
- **Future:** Could add coverage thresholds once baseline established
