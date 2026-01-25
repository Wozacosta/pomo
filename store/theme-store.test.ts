import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from './theme-store';

describe('theme-store', () => {
  beforeEach(() => {
    // Reset DOM classList
    document.documentElement.classList.remove('dark', 'light');
  });

  describe('toggleTheme()', () => {
    it('flips light to dark', () => {
      useThemeStore.setState({ theme: 'light', manuallySet: false });
      useThemeStore.getState().toggleTheme();

      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
      expect(state.manuallySet).toBe(true);
    });

    it('flips dark to light', () => {
      useThemeStore.setState({ theme: 'dark', manuallySet: false });
      useThemeStore.getState().toggleTheme();

      const state = useThemeStore.getState();
      expect(state.theme).toBe('light');
      expect(state.manuallySet).toBe(true);
    });

    it('sets manuallySet=true', () => {
      useThemeStore.setState({ theme: 'light', manuallySet: false });
      useThemeStore.getState().toggleTheme();

      expect(useThemeStore.getState().manuallySet).toBe(true);
    });

    it('updates DOM classList to dark', () => {
      useThemeStore.setState({ theme: 'light', manuallySet: false });
      useThemeStore.getState().toggleTheme();

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('updates DOM classList to light', () => {
      useThemeStore.setState({ theme: 'dark', manuallySet: false });
      useThemeStore.getState().toggleTheme();

      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  describe('setTheme()', () => {
    it('sets theme to dark', () => {
      useThemeStore.setState({ theme: 'light', manuallySet: false });
      useThemeStore.getState().setTheme('dark');

      const state = useThemeStore.getState();
      expect(state.theme).toBe('dark');
    });

    it('sets theme to light', () => {
      useThemeStore.setState({ theme: 'dark', manuallySet: false });
      useThemeStore.getState().setTheme('light');

      const state = useThemeStore.getState();
      expect(state.theme).toBe('light');
    });

    it('sets theme with manual flag true', () => {
      useThemeStore.setState({ theme: 'light', manuallySet: false });
      useThemeStore.getState().setTheme('dark', true);

      expect(useThemeStore.getState().manuallySet).toBe(true);
    });

    it('sets theme with manual flag false (default)', () => {
      useThemeStore.setState({ theme: 'light', manuallySet: true });
      useThemeStore.getState().setTheme('dark');

      expect(useThemeStore.getState().manuallySet).toBe(false);
    });

    it('updates DOM classList.add dark and remove light', () => {
      document.documentElement.classList.add('light');
      useThemeStore.getState().setTheme('dark');

      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });

    it('updates DOM classList.add light and remove dark', () => {
      document.documentElement.classList.add('dark');
      useThemeStore.getState().setTheme('light');

      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  // Note: SSR guard (typeof window !== "undefined") cannot be tested in happy-dom
  // as window always exists. This would require an SSR test environment.
});
