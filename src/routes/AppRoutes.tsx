import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthProvider';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProvisioningPage } from '@/features/auth/ProvisioningPage';
import { CoachShell } from '@/features/coach/CoachShell';
import { DashboardPage } from '@/features/coach/pages/DashboardPage';
import { PlayersPage } from '@/features/coach/pages/PlayersPage';
import { MatchesPage } from '@/features/coach/pages/MatchesPage';
import { TrainingPage } from '@/features/coach/pages/TrainingPage';
import { TasksPage } from '@/features/coach/pages/TasksPage';
import { MetricsPage } from '@/features/coach/pages/MetricsPage';
import { MessagesPage } from '@/features/coach/pages/MessagesPage';
import { AICoachPage } from '@/features/coach/pages/AICoachPage';
import { ReportsPage } from '@/features/coach/pages/ReportsPage';
import { SettingsPage } from '@/features/coach/pages/SettingsPage';
import { PlayerShell } from '@/features/player/PlayerShell';
import { PlayerHomePage } from '@/features/player/pages/PlayerHomePage';
import { PlayerCheckinPage } from '@/features/player/pages/PlayerCheckinPage';
import { PlayerTasksPage } from '@/features/player/pages/PlayerTasksPage';
import { PlayerMatchesPage } from '@/features/player/pages/PlayerMatchesPage';
import { PlayerProfilePage } from '@/features/player/pages/PlayerProfilePage';
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
  if (status === 'unprovisioned') return <ProvisioningPage />;

  if (role === 'player') {
    return (
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
    );
  }

  return (
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
  );
}
