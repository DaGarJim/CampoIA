import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Dumbbell,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  MessageSquare,
  Settings,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/services/auth.service';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { PageTransition } from '@/components/layout/PageTransition';
import { Button } from '@/components/ui/button';
import { cn, initials } from '@/lib/utils';
import { tapHaptic } from '@/lib/haptics';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  mobile?: boolean;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true, mobile: true },
  { to: '/players', label: 'Jugadores', icon: Users, mobile: true },
  { to: '/matches', label: 'Partidos', icon: Trophy, mobile: true },
  { to: '/training', label: 'Entrenos', icon: Dumbbell },
  { to: '/metrics', label: 'Métricas', icon: BarChart3 },
  { to: '/tasks', label: 'Tareas', icon: ListChecks, mobile: true },
  { to: '/messages', label: 'Mensajes', icon: MessageSquare },
  { to: '/ai', label: 'IA Coach', icon: Sparkles, mobile: true },
  { to: '/reports', label: 'Informes', icon: FileText },
  { to: '/settings', label: 'Ajustes', icon: Settings },
];

const TITLES: Record<string, string> = {
  '/': 'Centro de mando',
  '/players': 'Jugadores',
  '/matches': 'Partidos',
  '/training': 'Entrenamientos',
  '/metrics': 'Métricas',
  '/tasks': 'Tareas',
  '/messages': 'Mensajes',
  '/ai': 'IA Coach',
  '/reports': 'Informes',
  '/settings': 'Ajustes',
};

function navLinkClass(isActive: boolean): string {
  return cn(
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary/10 text-primary shadow-[inset_3px_0_0_hsl(var(--primary))]'
      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  );
}

export function CoachShell() {
  const { name } = useAuth();
  const location = useLocation();
  const title = TITLES[location.pathname] ?? 'CAMPO';

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar (desktop) */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-display text-lg font-extrabold text-white shadow-glow">
            C
          </div>
          <div>
            <div className="font-display text-lg font-extrabold leading-none tracking-tight">CAMPO</div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Coach OS</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navLinkClass(isActive)}>
              <item.icon className="size-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2.5 rounded-md px-2 py-2">
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
              {initials(name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{name || 'Coach'}</div>
              <div className="text-[11px] text-muted-foreground">Personal Coach</div>
            </div>
            <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={() => void signOut()}>
              <LogOut />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur safe-top lg:px-7">
          <span className="font-display text-base font-bold lg:text-lg">{title}</span>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="secondary"
              size="icon"
              className="lg:hidden"
              aria-label="Cerrar sesión"
              onClick={() => void signOut()}
            >
              <LogOut />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-24 pt-5 lg:px-7 lg:pb-10">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-card/95 backdrop-blur safe-bottom lg:hidden">
        {NAV.filter((i) => i.mobile).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => void tapHaptic()}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors active:scale-95',
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
