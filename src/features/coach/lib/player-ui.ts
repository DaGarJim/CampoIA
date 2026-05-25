import type { PlayerStatus } from '@/types/domain';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted';

export const STATUS_META: Record<PlayerStatus, { label: string; variant: BadgeVariant }> = {
  available: { label: 'Disponible', variant: 'success' },
  risk: { label: 'En riesgo', variant: 'warning' },
  injured: { label: 'Lesionado', variant: 'danger' },
  unavailable: { label: 'No disponible', variant: 'muted' },
};

export const POSITIONS = [
  'Portero',
  'Defensa central',
  'Lateral',
  'Mediocentro',
  'Mediapunta',
  'Extremo',
  'Delantero',
] as const;

export const FEET = ['Derecho', 'Izquierdo', 'Ambidiestro'] as const;

export function scoreColor(score: number | null): string {
  if (score == null) return 'text-muted-foreground';
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-primary';
  return 'text-warning';
}
