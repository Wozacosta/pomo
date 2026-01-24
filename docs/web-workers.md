# Web Workers Primer

## What Are Web Workers?

Web Workers are a browser API that lets you run JavaScript in a **background thread**, separate from the main UI thread. This has two major benefits:

1. **No UI blocking**: Heavy computations don't freeze the page
2. **No throttling**: Workers aren't subject to background tab limitations

## The Background Tab Problem

Browsers aggressively throttle `setInterval` and `setTimeout` in background tabs to save battery and CPU:

| Context | setInterval frequency |
|---------|----------------------|
| Active tab | Every 1ms (as requested) |
| Background tab | ~1 per minute |
| Background + low battery | Even less frequent |

For a timer app, this means your countdown would freeze when users switch tabs.

## How Web Workers Solve This

Workers run in a separate thread that browsers don't throttle. A worker can maintain a reliable 1-second interval even when the main page is in the background.

```
┌─────────────────────────────────────────────────────────┐
│  Main Thread (throttled in background)                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  React App / UI                                  │   │
│  │  - Receives 'tick' messages                      │   │
│  │  - Updates state & DOM                           │   │
│  └─────────────────────────────────────────────────┘   │
│                         ▲                               │
│                         │ postMessage                   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Web Worker (NOT throttled)                      │   │
│  │  - setInterval runs every 1000ms                 │   │
│  │  - Sends 'tick' to main thread                   │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Web Worker Basics

### Creating a Worker

Workers are separate JS files loaded via the `Worker` constructor:

```javascript
// In your React component
const worker = new Worker('/timer-worker.js');
```

### Communication

Workers communicate via `postMessage` and `onmessage`:

```javascript
// Main thread → Worker
worker.postMessage('start');

// Worker → Main thread
worker.onmessage = (event) => {
  console.log(event.data); // 'tick'
};
```

### Terminating

Always clean up workers when done:

```javascript
worker.terminate();
```

### Limitations

Workers **cannot**:
- Access the DOM
- Use `window`, `document`, or `parent`
- Access most browser APIs (localStorage, etc.)

Workers **can**:
- Use `fetch`, `WebSocket`, `IndexedDB`
- Import other scripts via `importScripts()`
- Create sub-workers

## Implementation in This Repo

### Worker File: `public/timer-worker.js`

```javascript
let intervalId = null;

self.onmessage = function(e) {
  if (e.data === 'start') {
    if (intervalId) clearInterval(intervalId);
    intervalId = setInterval(() => {
      self.postMessage('tick');
    }, 1000);
  } else if (e.data === 'stop') {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }
};
```

**Why `public/`?** Next.js serves files from `public/` at the root URL, so the worker is available at `/timer-worker.js`.

### React Integration: `components/Timer.tsx`

```typescript
const workerRef = useRef<Worker | null>(null);

// Initialize worker once
useEffect(() => {
  workerRef.current = new Worker('/timer-worker.js');
  workerRef.current.onmessage = () => {
    tick(); // Update timer state
  };
  return () => {
    workerRef.current?.terminate();
  };
}, [tick]);

// Control worker based on timer state
useEffect(() => {
  if (isRunning && !isPaused) {
    workerRef.current?.postMessage('start');
  } else {
    workerRef.current?.postMessage('stop');
  }
}, [isRunning, isPaused]);
```

### Why This Works

1. **Worker keeps ticking**: Even in background tab, worker sends `tick` every second
2. **Timestamp-based time**: `tick()` calculates `endTime - Date.now()`, so time is always accurate
3. **Title updates**: Each tick updates `document.title` with remaining time

## Alternative Approaches

### requestAnimationFrame
- Stops entirely in background tabs
- Not suitable for timers

### setTimeout recursion
- Also throttled in background tabs
- Same problem as setInterval

### Service Workers
- Overkill for this use case
- More complex lifecycle
- Designed for caching/offline, not intervals

### Visibility API + catch-up
- Detect when tab becomes visible
- Recalculate time (we do this anyway)
- But title won't update in background

## Debugging Workers

### Check if Worker is loaded
```javascript
// In browser console
const w = new Worker('/timer-worker.js');
w.onmessage = (e) => console.log('Got:', e.data);
w.postMessage('start');
// Should see "Got: tick" every second
```

### Common Issues

| Problem | Cause | Fix |
|---------|-------|-----|
| Worker not found | Wrong path | Check file is in `public/` |
| No messages received | `onmessage` not set | Set before `postMessage` |
| Multiple intervals | Not clearing previous | Always `clearInterval` first |
| Memory leak | Not terminating | Call `terminate()` on unmount |

## Further Reading

- [MDN: Using Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)
- [MDN: Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Worker)
- [Chrome: Background Tab Throttling](https://developer.chrome.com/blog/background_tabs/)
