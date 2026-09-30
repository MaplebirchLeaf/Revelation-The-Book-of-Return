// ./scripts/release.ts

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';

const root = path.join(import.meta.dirname, '..');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as { version: string };
const tag = `v${pkg.version}`;
const notes = path.join(root, '.github', 'release-notes', `${tag}.md`);
const git = (...args: string[]) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();

if (git('branch', '--show-current') !== 'main') throw new Error('Run bun release from main.');
if (git('status', '--porcelain')) throw new Error('Commit all changes before release.');
if ((await stat(notes)).size === 0) throw new Error(`Empty release notes: ${notes}`);
const head = git('rev-parse', 'HEAD');
let tagged: string | null = null;
try {
  tagged = git('rev-parse', `${tag}^{commit}`);
} catch {
  // 首次发布时尚未创建标签。
}
if (tagged && tagged !== head) throw new Error(`${tag} points to another commit.`);
if (!tagged) git('tag', '-a', tag, '-m', `Revelation: The Book of Return ${tag}`);
git('push', '--atomic', 'origin', 'refs/heads/main', `refs/tags/${tag}`);
console.log(`Pushed ${tag}; the release workflow will publish the encrypted modpack.`);
