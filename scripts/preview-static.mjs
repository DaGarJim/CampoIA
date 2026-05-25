// Static server for the built app (dist/). Node-version agnostic, so the
// preview harness can serve it even when its Node is too old for Vite.
// SPA fallback to index.html. Usage: node scripts/preview-static.mjs [dir] [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(projectRoot, process.argv[2] || 'dist');
const port = Number(process.argv[3] || process.env.PORT) || 5180;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
};

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const rel = normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(root, rel === '/' ? 'index.html' : rel);
  if (!filePath.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  readFile(filePath)
    .then((body) => {
      res.writeHead(200, { 'Content-Type': types[extname(filePath)] || 'application/octet-stream' });
      res.end(body);
    })
    .catch(() => {
      // SPA fallback
      readFile(join(root, 'index.html'))
        .then((body) => {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(body);
        })
        .catch(() => res.writeHead(404).end('Not found'));
    });
}).listen(port, () => {
  console.log(`CAMPO static preview -> http://localhost:${port} (serving ${root})`);
});
