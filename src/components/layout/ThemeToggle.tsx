import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyTheme, getStoredCoachTheme, setStoredCoachTheme, type Theme } from '@/lib/theme';
import { tapHaptic } from '@/lib/haptics';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getStoredCoachTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    setStoredCoachTheme(next);
    void tapHaptic();
  }

  return (
    <Button variant="secondary" size="icon" onClick={toggle} aria-label="Cambiar tema claro u oscuro">
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}
