import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);

const copies = [
  ['archive.html', 'archive/index.html'],
  ['incident.html', 'incident/index.html'],
  ['subscribe.html', 'subscribe/index.html'],
];

for (const [from, to] of copies) {
  const source = join(dist.pathname, from);
  const target = join(dist.pathname, to);
  if (!existsSync(source)) continue;
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(source, target);
}

