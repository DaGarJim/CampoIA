import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const assetsDir = join(process.cwd(), 'dist', 'assets');
const budgetBytes = 650 * 1024;
const files = await readdir(assetsDir);
const jsFiles = files.filter((f) => f.endsWith('.js') && f.startsWith('index-'));

if (jsFiles.length === 0) {
  console.error('No initial index JS chunk found in dist/assets.');
  process.exit(1);
}

const largest = await Promise.all(
  jsFiles.map(async (file) => {
    const size = (await stat(join(assetsDir, file))).size;
    return { file, size };
  }),
);

largest.sort((a, b) => b.size - a.size);
const main = largest[0];

if (main.size > budgetBytes) {
  console.error(`Initial JS chunk ${main.file} is ${main.size} bytes, over budget ${budgetBytes}.`);
  process.exit(1);
}

console.log(`Initial JS chunk ${main.file} is ${main.size} bytes, within budget ${budgetBytes}.`);
