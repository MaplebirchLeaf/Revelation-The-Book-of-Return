// ./scripts/zip.ts

import path from 'node:path';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import AdmZip from 'adm-zip';

interface Dependency {
  modName: string;
  version: string;
}

interface ModPackage {
  name: string;
  version: string;
  scml: {
    nickName: Record<string, string>;
    dependenceInfo: Dependency[];
    addonPlugin?: unknown[];
  };
}

export interface PackageAsset {
  fileName: string;
  buffer: Buffer;
}

async function collect(dir: string, prefix = ''): Promise<Map<string, Buffer>> {
  const files = new Map<string, Buffer>();
  if (!existsSync(dir)) return files;
  for (const entry of (await readdir(dir, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      for (const [name, contents] of await collect(path.join(dir, entry.name), relative)) files.set(name, contents);
    } else if (entry.isFile()) files.set(relative, await readFile(path.join(dir, entry.name)));
  }
  return files;
}

export async function createZipPackage(root: string): Promise<PackageAsset> {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')) as ModPackage;
  if (!pkg.name || !pkg.version || !pkg.scml?.nickName || !Array.isArray(pkg.scml.dependenceInfo)) {
    throw new Error('package.json lacks mod package metadata');
  }

  const files = new Map<string, Buffer>([
    ...(await collect(path.join(root, 'dist'), 'dist')),
    ...(await collect(path.join(root, 'src', 'twee'))),
    ...(await collect(path.join(root, 'src', 'styles'))),
    ...(await collect(path.join(root, 'public')))
  ]);
  for (const required of ['dist/module.js', 'dist/script.js']) {
    if (!files.has(required)) throw new Error(`Missing build output: ${required}`);
  }

  const names = [...files.keys()].sort();
  const dependency = pkg.scml.dependenceInfo.find(item => item.modName === 'maplebirch');
  if (!dependency) throw new Error('Missing maplebirch framework dependency');
  const language = Object.fromEntries(['EN', 'CN'].map(code => [code, names.filter(name => name.startsWith(`translations/${code}/`) && /\.ya?ml$/.test(name))]));
  const framework = {
    modName: 'maplebirch',
    addonName: 'maplebirchAddon',
    modVersion: dependency.version,
    params: {
      module: ['dist/module.js'],
      script: ['dist/script.js'],
      language
    }
  };
  const boot = {
    name: pkg.name,
    nickName: pkg.scml.nickName,
    alias: [],
    version: pkg.version,
    imgFileList: names.filter(name => /\.(?:png|jpe?g|webp|gif|svg)$/i.test(name)),
    styleFileList: names.filter(name => name.endsWith('.css')),
    tweeFileList: names.filter(name => name.endsWith('.twee')),
    additionFile: names.filter(name => /\.(?:ya?ml|json)$/i.test(name)),
    scriptFileList: names.filter(name => name === 'dist/game.js'),
    scriptFileList_preload: names.filter(name => name === 'dist/preload.js'),
    scriptFileList_earlyload: names.filter(name => name === 'dist/earlyload.js'),
    scriptFileList_inject_early: names.filter(name => name === 'dist/inject_early.js'),
    additionDir: [],
    additionBinaryFile: [],
    addonPlugin: [framework, ...(pkg.scml.addonPlugin ?? [])],
    dependenceInfo: pkg.scml.dependenceInfo
  };

  const zip = new AdmZip();
  for (const name of names) zip.addFile(name, files.get(name)!);
  zip.addFile('boot.json', Buffer.from(JSON.stringify(boot, null, 2)));
  return { fileName: `${pkg.name}-v${pkg.version}.mod.zip`, buffer: zip.toBuffer() };
}
