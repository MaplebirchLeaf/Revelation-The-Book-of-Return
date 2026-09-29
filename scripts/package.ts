// ./scripts/package.ts

import path from 'node:path';
import { mkdir, readFile } from 'node:fs/promises';
import { createZipPackage } from './zip';

const root = path.join(import.meta.dirname, '..');
const asset = await createZipPackage(root);
const output = path.join(root, 'package', asset.fileName);
await mkdir(path.dirname(output), { recursive: true });

// Preserve timestamps when a package has not changed, as in Deadwood-Reblooms.
const current = await readFile(output).catch(() => null);
if (current?.equals(asset.buffer)) console.log(`Package unchanged: ${output}`);
else {
  await Bun.write(output, asset.buffer);
  console.log(`Package generated: ${output}`);
}
