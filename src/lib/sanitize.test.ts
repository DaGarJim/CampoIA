import { describe, expect, it } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('elimina etiquetas <script>', () => {
    const out = sanitizeHtml('<p>hola</p><script>alert(1)</script>');
    expect(out).toContain('hola');
    expect(out).not.toContain('<script');
  });

  it('elimina manejadores de eventos inline', () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(out.toLowerCase()).not.toContain('onerror');
  });

  it('neutraliza URLs javascript:', () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    expect(out.toLowerCase()).not.toContain('javascript:');
  });

  it('elimina iframes', () => {
    const out = sanitizeHtml('<iframe src="https://evil.example"></iframe>');
    expect(out).not.toContain('<iframe');
  });

  it('conserva formato seguro', () => {
    const out = sanitizeHtml('<p><strong>negrita</strong> y <em>cursiva</em></p>');
    expect(out).toContain('<strong>');
    expect(out).toContain('<em>');
  });
});
