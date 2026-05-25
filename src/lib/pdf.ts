import { jsPDF } from 'jspdf';
import type { Player } from '@/types/domain';

/** Genera y descarga un informe PDF de un jugador (cliente, sin servidor). */
export function generatePlayerReport(player: Player, coachName: string): void {
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

  doc.save(`CAMPO_${player.name.replace(/\s+/g, '_')}.pdf`);
}
