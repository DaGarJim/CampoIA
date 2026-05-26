import { describe, expect, it } from 'vitest';
import { markdownToHtml } from './markdown';

describe('markdownToHtml', () => {
  it('renderiza titulares por nivel', () => {
    expect(markdownToHtml('# Uno')).toContain('<h1>Uno</h1>');
    expect(markdownToHtml('## Dos')).toContain('<h2>Dos</h2>');
    expect(markdownToHtml('### Tres')).toContain('<h3>Tres</h3>');
  });

  it('renderiza negrita y cursiva', () => {
    expect(markdownToHtml('**fuerte**')).toContain('<strong>fuerte</strong>');
    expect(markdownToHtml('*suave*')).toContain('<em>suave</em>');
  });

  it('agrupa items en una lista', () => {
    const html = markdownToHtml('- uno\n- dos\n• tres');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>uno</li>');
    expect(html).toContain('<li>tres</li>');
  });

  it('convierte enlaces http en anclas seguras', () => {
    const html = markdownToHtml('[campo](https://campo.app)');
    expect(html).toContain('href="https://campo.app"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('neutraliza <script> inyectado', () => {
    const html = markdownToHtml('Hola <script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html.toLowerCase()).not.toContain('alert(1)</script');
  });

  it('neutraliza img con onerror (queda como texto escapado, sin etiqueta real)', () => {
    const html = markdownToHtml('<img src=x onerror="alert(1)">');
    expect(html).not.toMatch(/<img/i); // no hay etiqueta <img> real
    expect(html).not.toMatch(/<img[^>]*onerror/i); // ni atributo ejecutable
    expect(html).toContain('&lt;img'); // sí aparece escapado como texto inerte
  });

  it('no crea anclas para esquemas peligrosos', () => {
    const html = markdownToHtml('[x](javascript:alert(1))');
    expect(html.toLowerCase()).not.toContain('<a href="javascript');
  });
});
