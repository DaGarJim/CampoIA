import { LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { signOut } from '@/services/auth.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { initials } from '@/lib/utils';

export function SettingsPage() {
  const { name, user } = useAuth();

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground">Tu cuenta y preferencias.</p>
      </div>

      <Card>
        <CardContent className="flex items-center gap-4 p-5">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-lg font-extrabold text-white">
            {initials(name)}
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-lg font-bold">{name || 'Coach'}</div>
            <div className="truncate text-sm text-muted-foreground">{user?.email}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm">
            <div className="font-medium">Tema</div>
            <div className="text-muted-foreground">Alterna entre claro y oscuro.</div>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => void signOut()}>
            <LogOut /> Cerrar sesión
          </Button>
        </CardContent>
      </Card>

      <p className="text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground/60">
        CAMPO · v1.0
      </p>
    </div>
  );
}
