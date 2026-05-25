type BadgeVariant = 'success' | 'warning' | 'danger' | 'muted';

/** Interpreta el resultado "a-b" (a = goles del equipo del jugador). */
export function resultMeta(result: string | null): { label: string; variant: BadgeVariant } {
  if (!result) return { label: '—', variant: 'muted' };
  const m = result.match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!m) return { label: result, variant: 'muted' };
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a > b) return { label: result, variant: 'success' };
  if (a === b) return { label: result, variant: 'warning' };
  return { label: result, variant: 'danger' };
}

export const MATCH_ROLES = ['Titular', 'Suplente', 'No jugó', 'No convocado'] as const;
