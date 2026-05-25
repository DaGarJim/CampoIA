import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProvisioningPage } from '@/features/auth/ProvisioningPage';
import { CoachShell } from '@/features/coach/CoachShell';
import { PlayerShell } from '@/features/player/PlayerShell';
import { Spinner } from '@/components/ui/spinner';

const DashboardPage = lazy(() =>
  import('@/features/coach/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const PlayersPage = lazy(() =>
  import('@/features/coach/pages/PlayersPage').then((m) => ({ default: m.PlayersPage })),
);
const MatchesPage = lazy(() =>
  import('@/features/coach/pages/MatchesPage').then((m) => ({ default: m.MatchesPage })),
);
const TrainingPage = lazy(() =>
  import('@/features/coach/pages/TrainingPage').then((m) => ({ default: m.TrainingPage })),
);
const TasksPage = lazy(() =>
  import('@/features/coach/pages/TasksPage').then((m) => ({ default: m.TasksPage })),
);
const MetricsPage = lazy(() =>
  import('@/features/coach/pages/MetricsPage').then((m) => ({ default: m.MetricsPage })),
);
const MessagesPage = lazy(() =>
  import('@/features/coach/pages/MessagesPage').then((m) => ({ default: m.MessagesPage })),
);
const AICoachPage = lazy(() =>
  import('@/features/coach/pages/AICoachPage').then((m) => ({ default: m.AICoachPage })),
);
const ReportsPage = lazy(() =>
  import('@/features/coach/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);
const SettingsPage = lazy(() =>
  import('@/features/coach/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

const PlayerHomePage = lazy(() =>
  import('@/features/player/pages/PlayerHomePage').then((m) => ({ default: m.PlayerHomePage })),
);
const PlayerCheckinPage = lazy(() =>
  import('@/features/player/pages/PlayerCheckinPage').then((m) => ({ default: m.PlayerCheckinPage })),
);
const PlayerTasksPage = lazy(() =>
  import('@/features/player/pages/PlayerTasksPage').then((m) => ({ default: m.PlayerTasksPage })),
);
const PlayerMatchesPage = lazy(() =>
  import('@/features/player/pages/PlayerMatchesPage').then((m) => ({ default: m.PlayerMatchesPage })),
);
const PlayerProfilePage = lazy(() =>
  import('@/features/player/pages/PlayerProfilePage').then((m) => ({ default: m.PlayerProfilePage })),
);

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
  if (status === 'unprovisioned') return <ProvisioningPage />;

  if (role === 'player') {
    return (
      <Suspense fallback={<FullScreenLoader />}>
        <Routes>
          <Route element={<PlayerShell />}>
            <Route path="/player" element={<PlayerHomePage />} />
            <Route path="/player/checkin" element={<PlayerCheckinPage />} />
            <Route path="/player/tasks" element={<PlayerTasksPage />} />
            <Route path="/player/matches" element={<PlayerMatchesPage />} />
            <Route path="/player/profile" element={<PlayerProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/player" replace />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<FullScreenLoader />}>
      <Routes>
        <Route element={<CoachShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="players" element={<PlayersPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="training" element={<TrainingPage />} />
          <Route path="metrics" element={<MetricsPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="ai" element={<AICoachPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
