import { Navigate, Route, Routes } from 'react-router-dom';
import {
  BarChart3,
  ClipboardCheck,
  Dumbbell,
  FileText,
  ListChecks,
  MessageSquare,
  Settings,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { CoachShell } from '@/features/coach/CoachShell';
import { DashboardPage } from '@/features/coach/pages/DashboardPage';
import { PlayersPage } from '@/features/coach/pages/PlayersPage';
import { MatchesPage } from '@/features/coach/pages/MatchesPage';
import { PlayerShell } from '@/features/player/PlayerShell';
import { PlayerHomePage } from '@/features/player/pages/PlayerHomePage';
import { Placeholder } from '@/components/Placeholder';
import { Spinner } from '@/components/ui/spinner';

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center bg-background">
      <Spinner className="size-8" />
    </div>
  );
}

export function AppRoutes() {
  const { status, role } = useAuth();

  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'unauthenticated') return <LoginPage />;

  if (role === 'player') {
    return (
      <Routes>
        <Route element={<PlayerShell />}>
          <Route path="/player" element={<PlayerHomePage />} />
          <Route
            path="/player/checkin"
            element={<Placeholder icon={ClipboardCheck} title="Check-in diario" description="Registra ánimo, energía y descanso cada día." />}
          />
          <Route
            path="/player/tasks"
            element={<Placeholder icon={ListChecks} title="Misiones" description="Tus tareas y retos asignados por el entrenador." />}
          />
          <Route
            path="/player/matches"
            element={<Placeholder icon={Trophy} title="Tus partidos" description="Histórico de partidos y minutos." />}
          />
          <Route
            path="/player/profile"
            element={<Placeholder icon={User} title="Tu perfil" description="Tu progreso, nivel y datos personales." />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/player" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<CoachShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route
          path="training"
          element={<Placeholder icon={Dumbbell} title="Entrenamientos" description="Sesiones, carga y RPE." />}
        />
        <Route
          path="metrics"
          element={<Placeholder icon={BarChart3} title="Métricas" description="Evolución de rendimiento y carga." />}
        />
        <Route
          path="tasks"
          element={<Placeholder icon={ListChecks} title="Tareas" description="Asigna y sigue las tareas de cada jugador." />}
        />
        <Route
          path="messages"
          element={<Placeholder icon={MessageSquare} title="Mensajes" description="Conversaciones con tus jugadores." />}
        />
        <Route
          path="ai"
          element={<Placeholder icon={Sparkles} title="IA Coach" description="Asistente con el contexto real de tus jugadores." />}
        />
        <Route
          path="reports"
          element={<Placeholder icon={FileText} title="Informes" description="Genera informes PDF por jugador." />}
        />
        <Route
          path="settings"
          element={<Placeholder icon={Settings} title="Ajustes" description="Tu cuenta, marca y preferencias." />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
