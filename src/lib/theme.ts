import { syncStatusBar } from './native';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'campo-coach-theme';

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  void syncStatusBar(theme);
}

export function getStoredCoachTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'dark' ? 'dark' : 'light';
}

export function setStoredCoachTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}
