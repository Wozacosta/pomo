# Dark Mode Troubleshooting Guide

## Quick Check

If dark mode is not working, follow these steps:

### 1. Check Node Version

Dark mode requires Next.js 16, which needs Node 20+:

```bash
node --version
# Should show v20.x.x or higher
```

If you're on Node 18, upgrade first:

```bash
# Using nvm
nvm install 20
nvm use 20

# Or using n
n 20

# Then reinstall dependencies
pnpm install
```

### 2. Start the Dev Server

```bash
pnpm dev
```

### 3. Test Dark Mode

1. Open http://localhost:3000
2. Open browser DevTools Console (F12)
3. Look for `[ThemeProvider]` logs
4. Click the sun/moon icon in the top-right header
5. Watch the console for theme changes

## How It Works

### Tailwind CSS v4 Configuration

The `app/globals.css` file contains the dark mode setup:

```css
@import "tailwindcss";

/* This tells Tailwind how to detect dark mode */
@custom-variant dark (&:where(.dark, .dark *));
```

This line is **critical** - it tells Tailwind v4 to apply `dark:` classes when the `.dark` class is present on any parent element.

### Theme Switching

1. **Initial Load**: 
   - Script in `layout.tsx` checks localStorage
   - Applies `.dark` class before React hydrates (prevents flash)

2. **System Preference**:
   - ThemeProvider checks `prefers-color-scheme`
   - Auto-applies if no saved preference

3. **Manual Toggle**:
   - Click sun/moon icon
   - Saves to localStorage
   - Updates immediately

## Debugging Steps

### Step 1: Check HTML Element Classes

Open DevTools Console and run:

```javascript
console.log(document.documentElement.classList.toString());
```

You should see either `"dark"` or `"light"` in the output.

### Step 2: Toggle Dark Mode Manually

In the console, run:

```javascript
document.documentElement.classList.add('dark');
```

If colors change, the CSS is working. The issue is with the React state.

### Step 3: Check localStorage

```javascript
console.log(localStorage.getItem('pomodoro-theme-storage'));
```

Should return something like:
```json
{"state":{"theme":"dark","manuallySet":true},"version":0}
```

### Step 4: Clear Storage and Reload

If things are stuck:

```javascript
localStorage.removeItem('pomodoro-theme-storage');
location.reload();
```

### Step 5: Force Dark Mode

In the console:

```javascript
// Get the store
const store = window.__POMODORO_STORE__;

// Or just use the DOM API
document.documentElement.classList.add('dark');
document.documentElement.classList.remove('light');
```

## Common Issues

### Issue 1: "Dark mode button does nothing"

**Cause**: State is updating but classes aren't being applied.

**Fix**: Check that the theme store is properly updating the DOM in `store/theme-store.ts`.

### Issue 2: "Colors don't change"

**Cause**: Tailwind isn't recognizing the `dark:` variant.

**Fix**: Make sure `@custom-variant dark (&:where(.dark, .dark *));` is at the top of `globals.css`.

### Issue 3: "Flash of wrong theme on reload"

**Cause**: The blocking script in `layout.tsx` isn't running.

**Fix**: Verify the script is in the `<head>` section before any other content.

### Issue 4: "Works in dev but not in production"

**Cause**: Build-time optimization might be removing the variant.

**Fix**: Run a production build to test:

```bash
pnpm build
pnpm start
```

## File Checklist

Ensure these files are configured correctly:

### ✅ `app/globals.css`

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

### ✅ `app/layout.tsx`

Should have the blocking script in `<head>`:

```tsx
<head>
  <script
    dangerouslySetInnerHTML={{
      __html: `
        try {
          const theme = localStorage.getItem('pomodoro-theme-storage');
          if (theme) {
            const parsed = JSON.parse(theme);
            if (parsed.state && parsed.state.theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          }
        } catch (e) {}
      `,
    }}
  />
</head>
```

### ✅ `components/ThemeProvider.tsx`

Should apply classes on theme change:

```tsx
useEffect(() => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.add("light");
    root.classList.remove("dark");
  }
}, [theme]);
```

### ✅ `store/theme-store.ts`

Should explicitly add/remove classes (not toggle):

```tsx
if (theme === "dark") {
  document.documentElement.classList.add("dark");
  document.documentElement.classList.remove("light");
} else {
  document.documentElement.classList.add("light");
  document.documentElement.classList.remove("dark");
}
```

## Testing Components

All components should have `dark:` classes for their background, text, and borders:

```tsx
// Example from Timer.tsx
<div className="bg-zinc-100 dark:bg-zinc-800">
  <span className="text-zinc-900 dark:text-zinc-50">Hello</span>
</div>
```

## Manual Test

Create a simple test page to verify Tailwind dark mode:

```tsx
// app/test-dark/page.tsx
'use client';

export default function TestDark() {
  const toggle = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 p-8">
      <button 
        onClick={toggle}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Toggle Dark
      </button>
      <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50">
        This should change color when you click the button
      </div>
    </div>
  );
}
```

Visit `/test-dark` and click the button. If it works here but not in your main app, the issue is with the state management.

## Still Not Working?

1. **Delete node_modules and reinstall**:
   ```bash
   rm -rf node_modules .next pnpm-lock.yaml
   pnpm install
   ```

2. **Check Tailwind v4 is installed**:
   ```bash
   pnpm list @tailwindcss/postcss
   # Should show v4.x.x
   ```

3. **Verify postcss.config.mjs**:
   ```javascript
   const config = {
     plugins: {
       "@tailwindcss/postcss": {},
     },
   };
   export default config;
   ```

4. **Open an issue** with:
   - Node version (`node --version`)
   - Package versions (`pnpm list next react @tailwindcss/postcss`)
   - Browser console logs
   - Screenshot of DevTools Elements tab showing `<html>` classes

## Success Criteria

Dark mode is working when:

- ✅ Clicking sun/moon icon changes the theme immediately
- ✅ Theme persists after page reload
- ✅ No flash of wrong theme on initial load
- ✅ Console shows `[ThemeProvider]` logs
- ✅ `document.documentElement.classList` contains `'dark'` or `'light'`
- ✅ All UI elements (buttons, cards, text) change colors
- ✅ Background goes from white to near-black

## Resources

- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Next.js 16 App Router](https://nextjs.org/docs)
- [Zustand Persist Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)