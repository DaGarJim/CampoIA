import type { CoachProfile, Player } from '@/types/domain';

type Rgb = [number, number, number];
const BRAND_DEFAULT: Rgb = [124, 58, 237];

function hexToRgb(hex: string | null | undefined): Rgb {
  if (!hex) return BRAND_DEFAULT;
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return BRAND_DEFAULT;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function safeFileName(name: string): string {
  return (
    name
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/gi, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 80) || 'jugador'
  );
}

/** Dossier PDF completo del jugador, con branding del entrenador (coach_profiles). */
export async function generatePlayerDossier(player: Player, profile?: CoachProfile | null): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const brand = hexToRgb(profile?.brand_color);
  const brandName = profile?.brand_name?.trim() || 'CAMPO';
  const left = 18;
  let y = 24;

  doc.setFontSize(22);
  doc.setTextColor(brand[0], brand[1], brand[2]);
  doc.text(brandName, left, y);
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 140);
  doc.text('Dossier de jugador', left, (y += 7));
  if (profile?.brand_slogan) {
    doc.setFontSize(9);
    doc.text(profile.brand_slogan, left, (y += 5));
  }

  doc.setDrawColor(230, 230, 240);
  doc.line(left, (y += 5), 192, y);

  doc.setFontSize(18);
  doc.setTextColor(20, 20, 40);
  doc.text(player.name, left, (y += 12));
  doc.setFontSize(28);
  doc.setTextColor(brand[0], brand[1], brand[2]);
  doc.text(String(player.score ?? '—'), 178, y);
  doc.setFontSize(11);
  doc.setTextColor(110, 110, 130);
  const meta = [
    player.pos,
    player.category,
    player.club,
    player.age ? `${player.age} años` : null,
  ].filter(Boolean) as string[];
  doc.text(meta.join(' · ') || '—', left, (y += 7));

  const section = (title: string, rows: Array<[string, string]>) => {
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text(title, left, y);
    doc.setFontSize(11);
    rows.forEach(([label, value]) => {
      doc.setTextColor(110, 110, 130);
      doc.text(label, left, (y += 8));
      doc.setTextColor(20, 20, 40);
      doc.text(value, 110, y);
    });
  };

  section('Resumen competitivo', [
    ['Estado', player.status],
    ['Adherencia', `${player.adherence ?? 0}%`],
    ['Partidos jugados', String(player.played ?? 0)],
    ['Minutos', String(player.mins ?? 0)],
    ['Convocatorias', String(player.callups ?? 0)],
    ['Goles / Asistencias', `${player.scored ?? 0} / ${player.assisted ?? 0}`],
  ]);

  section('Valoración física', [
    ['Altura / Peso', `${player.height_cm ?? '—'} cm · ${player.weight_kg ?? '—'} kg`],
    ['Salto vertical / horizontal', `${player.vertical_jump ?? '—'} / ${player.horizontal_jump ?? '—'} cm`],
    ['CMJ', `${player.flexibility_cmj ?? '—'} cm`],
    ['RM Sentadilla / P.muerto / Banca', `${player.rm_squat ?? '—'} / ${player.rm_deadlift ?? '—'} / ${player.rm_bench ?? '—'} kg`],
  ]);

  if (player.ai_attributes) {
    const a = player.ai_attributes;
    section('Atributos estimados', [
      ['Técnica', String(a.tecnica)],
      ['Táctica', String(a.tactica)],
      ['Físico', String(a.fisico)],
      ['Mental', String(a.mental)],
      ['Velocidad', String(a.velocidad)],
      ['Lectura', String(a.lectura)],
    ]);
  }

  if (player.strength || player.improve) {
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(brand[0], brand[1], brand[2]);
    doc.text('Plan de desarrollo', left, y);
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 40);
    if (player.strength) doc.text(doc.splitTextToSize(`Fortaleza: ${player.strength}`, 174), left, (y += 7));
    if (player.improve) doc.text(doc.splitTextToSize(`A mejorar: ${player.improve}`, 174), left, (y += 12));
  }

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 165);
  const footer = profile?.report_footer?.trim() || `${profile?.name ?? brandName}`;
  doc.text(`${footer} · ${new Date().toLocaleDateString('es-ES')}`, left, 285);
  if (profile?.report_disclaimer) {
    doc.text(doc.splitTextToSize(profile.report_disclaimer, 174), left, 290);
  }

  doc.save(`CAMPO_${safeFileName(player.name)}_dossier.pdf`);
}

export interface ReportPdfMeta {
  typeLabel: string;
  playerName: string;
  period: string;
}

/** Convierte un informe en markdown a PDF con el branding del entrenador. */
export async function generateReportPdf(
  markdown: string,
  profile: CoachProfile | null | undefined,
  meta: ReportPdfMeta,
): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const brand = hexToRgb(profile?.brand_color);
  const brandName = profile?.brand_name?.trim() || 'CAMPO';
  const left = 18;
  const right = 192;
  const wrap = right - left;
  let y = 22;

  const ensure = (needed: number) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 22;
    }
  };

  doc.setFontSize(20);
  doc.setTextColor(brand[0], brand[1], brand[2]);
  doc.text(brandName, left, y);
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 140);
  doc.text(`${meta.typeLabel} · ${meta.playerName} · ${meta.period}`, left, (y += 6));
  doc.setDrawColor(230, 230, 240);
  doc.line(left, (y += 4), right, y);
  y += 4;

  for (const rawLine of (markdown ?? '').replace(/\r\n/g, '\n').split('\n')) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      y += 3;
      continue;
    }
    const h1 = /^#\s+(.*)/.exec(line);
    const h2 = /^##\s+(.*)/.exec(line);
    const h3 = /^###\s+(.*)/.exec(line);
    const bullet = /^\s*[-*•]\s+(.*)/.exec(line);
    const clean = (s: string) => s.replace(/\*\*/g, '').replace(/`/g, '');

    if (h1 || h2 || h3) {
      const text = clean((h1 ?? h2 ?? h3)![1]);
      const size = h1 ? 15 : h2 ? 13 : 11;
      ensure(10);
      y += 4;
      doc.setFontSize(size);
      doc.setTextColor(brand[0], brand[1], brand[2]);
      doc.text(text, left, (y += 6));
    } else if (bullet) {
      doc.setFontSize(10.5);
      doc.setTextColor(40, 40, 60);
      const lines = doc.splitTextToSize(`•  ${clean(bullet[1])}`, wrap - 4);
      ensure(lines.length * 6);
      doc.text(lines, left + 2, (y += 6));
      y += (lines.length - 1) * 5;
    } else {
      doc.setFontSize(10.5);
      doc.setTextColor(40, 40, 60);
      const lines = doc.splitTextToSize(clean(line), wrap);
      ensure(lines.length * 6);
      doc.text(lines, left, (y += 6));
      y += (lines.length - 1) * 5;
    }
  }

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 165);
  const footer = profile?.report_footer?.trim() || `${profile?.name ?? brandName}`;
  doc.text(`${footer} · ${new Date().toLocaleDateString('es-ES')}`, left, 288);

  doc.save(`CAMPO_${safeFileName(meta.typeLabel)}_${safeFileName(meta.playerName)}.pdf`);
}

/** Genera y descarga un informe PDF de un jugador (cliente, sin servidor). */
export async function generatePlayerReport(player: Player, coachName: string): Promise<void> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  const left = 18;
  let y = 24;

  doc.setFontSize(22);
  doc.setTextColor(124, 58, 237);
  doc.text('CAMPO', left, y);
  doc.setFontSize(11);
  doc.setTextColor(120, 120, 140);
  doc.text('Informe de jugador', left, (y += 7));

  doc.setDrawColor(230, 230, 240);
  doc.line(left, (y += 5), 192, y);

  doc.setFontSize(18);
  doc.setTextColor(20, 20, 40);
  doc.text(player.name, left, (y += 12));
  doc.setFontSize(11);
  doc.setTextColor(110, 110, 130);
  doc.text(`${player.pos ?? '—'} · ${player.club ?? 'Sin club'} · ${player.age ?? '?'} años`, left, (y += 7));

  const rows: Array<[string, string]> = [
    ['Estado', player.status],
    ['Score', String(player.score ?? '—')],
    ['Adherencia', `${player.adherence ?? 0}%`],
    ['Partidos jugados', String(player.played ?? 0)],
    ['Minutos', String(player.mins ?? 0)],
    ['Goles', String(player.scored ?? 0)],
    ['Asistencias', String(player.assisted ?? 0)],
    ['Pie', player.foot ?? '—'],
  ];

  y += 6;
  doc.setFontSize(12);
  rows.forEach(([label, value]) => {
    doc.setTextColor(110, 110, 130);
    doc.text(label, left, (y += 9));
    doc.setTextColor(20, 20, 40);
    doc.text(value, 110, y);
  });

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 165);
  doc.text(
    `Generado por ${coachName} · ${new Date().toLocaleDateString('es-ES')}`,
    left,
    285,
  );

  const safeName = player.name
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80);
  doc.save(`CAMPO_${safeName || 'jugador'}.pdf`);
}
