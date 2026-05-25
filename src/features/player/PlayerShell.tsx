import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardCheck, Home, ListChecks, Trophy, User, type LucideIcon } from 'lucide-react';
import { applyTheme } from '@/lib/theme';
import { cn } from '@/lib/utils';
import { tapHaptic } from '@/lib/haptics';
import { PageTransition } from '@/components/layout/PageTransition';

interface PlayerNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

const NAV: PlayerNavItem[] = [
  { to: '/player', label: 'Inicio', icon: Home, end: true },
  { to: '/player/checkin', label: 'Check-in', icon: ClipboardCheck },
  { to: '/player/tasks', label: 'Misiones', icon: ListChecks },
  { to: '/player/matches', label: 'Partidos', icon: Trophy },
  { to: '/player/profile', label: 'Perfil', icon: User },
];

export function PlayerShell() {
  // El portal del jugador es siempre la "arena" oscura.
  useEffect(() => {
    applyTheme('dark');
  }, []);

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-md px-4 pb-24 pt-4 safe-top">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-md border-t border-border bg-card/95 backdrop-blur safe-bottom">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => void tapHaptic()}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors active:scale-95',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )
            }
          >
            <item.icon className="size-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
