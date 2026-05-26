import type { CoachProfile, Match, Player, Task, TrainingSession } from '@/types/domain';

export interface ExportData {
  profile: CoachProfile | null;
  players: Player[];
  matches: Match[];
  trainings: TrainingSession[];
  tasks: Task[];
}

function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const stamp = () => new Date().toISOString().slice(0, 10);

export function buildJson(data: ExportData): string {
  return JSON.stringify(data, null, 2);
}

export function exportJson(data: ExportData) {
  download(`CAMPO_export_${stamp()}.json`, buildJson(data), 'application/json');
}

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function section<T>(title: string, rows: T[], cols: (keyof T)[]): string {
  if (rows.length === 0) return `# ${title}\n(sin datos)\n`;
  const header = cols.join(',');
  const body = rows.map((r) => cols.map((c) => csvCell(r[c])).join(',')).join('\n');
  return `# ${title}\n${header}\n${body}\n`;
}

export function buildCsv(data: ExportData): string {
  return [
    section('Jugadores', data.players, ['name', 'pos', 'age', 'club', 'category', 'status', 'score', 'adherence', 'mins', 'played', 'scored', 'assisted']),
    section('Partidos', data.matches, ['date', 'player_id', 'rival', 'result', 'mins', 'role', 'called']),
    section('Tareas', data.tasks, ['description', 'player_id', 'type', 'priority', 'due_date', 'done']),
    section('Entrenamientos', data.trainings, ['date', 'player_id', 'type', 'duration', 'rpe', 'goal', 'completed']),
  ].join('\n');
}

export function exportCsv(data: ExportData) {
  download(`CAMPO_export_${stamp()}.csv`, buildCsv(data), 'text/csv;charset=utf-8');
}
