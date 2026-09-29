// ./scripts/protected-release.ts

import path from 'node:path';
import os from 'node:os';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import { createZipPackage } from './zip';

const root = path.join(import.meta.dirname, '..');
const tool = path.join(root, 'tools', 'dol-mod-protection-tools', 'src', 'zip-to-modpack.ts');
const asset = await createZipPackage(root);
const input = path.join(root, 'package', asset.fileName);
const output = input.replace(/\.mod\.zip$/, '.modpack');
const tempDir = await mkdtemp(path.join(os.tmpdir(), 'revelation-protected-release-'));

try {
  await stat(input);
  await stat(tool);
  // The tool generates auth.json in no-credential mode. Private keys stay in a temporary directory.
  const child = Bun.spawn([process.execPath, 'run', tool, '--input', input, '--out', output, '--auto-auth', '--no-credential-password', '--keys-out', path.join(tempDir, 'release.keys.json')], {
    cwd: root,
    stdout: 'inherit',
    stderr: 'inherit'
  });
  if ((await child.exited) !== 0) throw new Error(`Failed to encrypt ${asset.fileName}`);
  if ((await stat(output)).size === 0) throw new Error(`Empty encrypted package: ${output}`);
  console.log(`Protected release package: ${output}`);
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
