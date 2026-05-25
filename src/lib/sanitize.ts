import DOMPurify from 'dompurify';

/**
 * Sanitiza HTML enriquecido (informes, salida de IA, markdown ya convertido)
 * antes de inyectarlo con `dangerouslySetInnerHTML`. JSX escapa texto plano
 * por defecto; esto es SOLO para HTML que debe renderizarse como tal.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style'],
    ALLOW_DATA_ATTR: false,
  });
}

/** Helper para usar directamente en JSX: dangerouslySetInnerHTML={toSafeHtml(x)}. */
export function toSafeHtml(dirty: string): { __html: string } {
  return { __html: sanitizeHtml(dirty) };
}
