import type { Player } from '@/types/domain';

export function levelOf(player: Player | null | undefined): number {
  return Math.max(1, Math.floor((player?.score ?? 0) / 12) + 1);
}

export function weekXp(player: Player | null | undefined): number {
  return Math.min(100, Math.max(0, player?.adherence ?? 0));
}

/** Normaliza horas de sueño (objetivo 8h) a 0-100. */
export function sleepScore(hours: number | null | undefined): number {
  if (!hours) return 0;
  return Math.min(100, Math.round((hours / 8) * 100));
}
