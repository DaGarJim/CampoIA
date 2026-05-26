import { sanitizeHtml } from './sanitize';

/**
 * Conversor markdown→HTML deliberadamente acotado al subconjunto que devuelve la IA
 * (titulares, listas, negrita/cursiva, código en línea, enlaces http). Estrategia
 * "escape-first": se escapa TODO el HTML de entrada antes de aplicar formato, de modo
 * que ninguna etiqueta del texto original sobreviva. El resultado se pasa además por
 * DOMPurify como defensa en profundidad. Sin dependencias externas de parsing.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(text: string): string {
  let out = escapeHtml(text);
  // Código en línea primero para no formatear su contenido.
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // Enlaces [texto](url) solo con esquema http/https.
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, label: string, href: string) => {
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  return out;
}

export function markdownToHtml(markdown: string): string {
  const lines = (markdown ?? '').replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let listItems: string[] | null = null;
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(`<p>${paragraph.map(inline).join('<br>')}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (listItems && listItems.length) {
      blocks.push(`<ul>${listItems.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`);
    }
    listItems = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const listItem = /^\s*[-*•]\s+(.*)$/.exec(line);
    if (listItem) {
      flushParagraph();
      listItems ??= [];
      listItems.push(listItem[1]);
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();

  return sanitizeHtml(blocks.join('\n'));
}

/** Helper para JSX: dangerouslySetInnerHTML={renderMarkdown(text)}. */
export function renderMarkdown(markdown: string): { __html: string } {
  return { __html: markdownToHtml(markdown) };
}
