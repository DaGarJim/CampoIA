import { supabase } from '@/lib/supabase';
import type { AIAttributes, AIMetrics, Match, Player, TrainingSession } from '@/types/domain';

/**
 * Cliente del IA Coach. La clave del proveedor (Gemini/Groq) NO está en el cliente:
 * vive como secret de la Supabase Edge Function `ai-coach` (multi-modo).
 */
type AiMode = 'chat' | 'report' | 'metrics' | 'season-import' | 'player-import';

async function invokeAi<T>(mode: AiMode, payload: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>('ai-coach', {
    body: { mode, payload },
  });
  if (error) {
    throw new Error('El IA Coach no está disponible. Revisa la Edge Function "ai-coach" en Supabase.');
  }
  return data as T;
}

export interface ChatTurn {
  role: 'user' | 'ai';
  text: string;
}

export async function askCoachAI(
  question: string,
  context?: string,
  conversation?: ChatTurn[],
): Promise<string> {
  const data = await invokeAi<{ reply: string }>('chat', { question, context, conversation });
  return data?.reply ?? '';
}

export interface AIMetricsResult {
  ai_attributes: AIAttributes;
  ai_metrics: AIMetrics;
  strength: string;
  improve: string;
}

export async function generateAIMetrics(player: Player): Promise<AIMetricsResult> {
  return invokeAi<AIMetricsResult>('metrics', {
    player: {
      name: player.name,
      pos: player.pos,
      age: player.age,
      score: player.score,
      adherence: player.adherence,
      mins: player.mins,
      height_cm: player.height_cm,
      weight_kg: player.weight_kg,
    },
  });
}

export type ReportType = 'weekly' | 'parents' | 'club' | 'match' | 'monthly' | 'agent';

export interface ReportRequest {
  type: ReportType;
  playerName: string;
  period: string;
  context: string;
  coachName?: string;
}

export async function generateReport(req: ReportRequest): Promise<string> {
  const data = await invokeAi<{ markdown: string }>('report', req);
  return data?.markdown ?? '';
}

export interface ParsedSeasonMatch {
  date: string;
  rival: string;
  result: string;
  role: string;
  mins: number;
}

export async function importSeason(text: string): Promise<ParsedSeasonMatch[]> {
  const data = await invokeAi<{ matches: ParsedSeasonMatch[] }>('season-import', { text });
  return data?.matches ?? [];
}

export interface ParsedPlayerFicha {
  name?: string;
  pos?: string;
  age?: number;
  foot?: string;
  club?: string;
  category?: string;
  height_cm?: number;
  weight_kg?: number;
}

export async function importPlayerFicha(text: string): Promise<ParsedPlayerFicha> {
  const data = await invokeAi<{ player: ParsedPlayerFicha }>('player-import', { text });
  return data?.player ?? {};
}

// --- Construcción de contexto compacto para chat/informes -------------------

function playerLine(p: Player): string {
  const parts = [
    p.name,
    p.pos ?? '',
    `score ${p.score ?? '—'}`,
    `adh ${p.adherence ?? 0}%`,
    `min ${p.mins ?? 0}`,
    `estado ${p.status}`,
  ];
  if (p.tag) parts.push(p.tag);
  return `- ${parts.filter(Boolean).join(' · ')}`;
}

/** Resumen compacto de la cartera para enviar como contexto a la IA. */
export function buildCoachContext(
  players: Player[],
  matches: Match[] = [],
  trainings: TrainingSession[] = [],
): string {
  const byId = new Map(players.map((p) => [p.id, p.name] as const));
  const sections: string[] = [];

  sections.push(`JUGADORES (${players.length}):\n${players.map(playerLine).join('\n')}`);

  if (matches.length) {
    const recent = matches
      .slice(0, 8)
      .map((m) => `- ${m.date} ${byId.get(m.player_id) ?? ''} vs ${m.rival ?? '?'} ${m.result ?? ''} (${m.mins ?? 0}', ${m.role ?? '—'})`)
      .join('\n');
    sections.push(`ÚLTIMOS PARTIDOS:\n${recent}`);
  }

  if (trainings.length) {
    const recent = trainings
      .slice(0, 6)
      .map((t) => `- ${t.date} ${byId.get(t.player_id ?? '') ?? ''} ${t.type ?? ''} ${t.duration ?? 0}' RPE ${t.rpe ?? '—'}`)
      .join('\n');
    sections.push(`ÚLTIMAS SESIONES:\n${recent}`);
  }

  return sections.join('\n\n');
}
