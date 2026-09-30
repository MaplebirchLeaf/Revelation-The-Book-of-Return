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

/** 将 YAML 中的前后插入写法转换为替换插件接受的规则。 */
function patchRules(content: string, type: 'twee' | 'script'): Record<string, string | boolean>[] {
  const parsed: unknown = Bun.YAML.parse(content);
  if (!Array.isArray(parsed)) throw new Error('补丁配置必须是 YAML 列表。');
  return parsed.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error(`补丁规则 ${index + 1} 必须是对象。`);
    const item = entry as Record<string, unknown>;
    const text = (key: string): string => (typeof item[key] === 'string' ? item[key] : '');
    const source = text(type === 'script' ? 'from' : 'findString');
    const regex = type === 'twee' ? text('findRegex') : '';
    const replacementKey = type === 'script' ? 'to' : 'replace';
    const replacement = typeof item[replacementKey] === 'string' ? text(replacementKey) : text('before') + (source || '$&') + text('after');
    if ((!source && !regex) || (!text('before') && !text('after') && typeof item[replacementKey] !== 'string')) throw new Error(`补丁规则 ${index + 1} 缺少匹配内容或替换内容。`);
    if (type === 'script') {
      if (!text('fileName')) throw new Error(`脚本补丁规则 ${index + 1} 缺少文件名。`);
      return { fileName: text('fileName'), from: source, to: replacement };
    }
    if (!text('passage')) throw new Error(`Twee 补丁规则 ${index + 1} 缺少段落名。`);
    const rule: Record<string, string | boolean> = { passage: text('passage'), replace: replacement };
    if (source) rule.findString = source;
    else rule.findRegex = regex;
    if (text('regexFlag')) rule.regexFlag = text('regexFlag');
    if (item.all === true) rule.all = true;
    return rule;
  });
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
  const [tweeRules, scriptRules] = await Promise.all([
    readFile(path.join(root, 'src', 'TweeReplacer.yaml'), 'utf8').then(content => patchRules(content, 'twee')),
    readFile(path.join(root, 'src', 'ReplacePatcher.yaml'), 'utf8').then(content => patchRules(content, 'script'))
  ]);
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
    addonPlugin: [
      framework,
      { modName: 'TweeReplacer', addonName: 'TweeReplacerAddon', modVersion: '1.0.0', params: tweeRules },
      { modName: 'ReplacePatcher', addonName: 'ReplacePatcherAddon', modVersion: '1.0.0', params: { js: scriptRules } },
      ...(pkg.scml.addonPlugin ?? [])
    ],
    dependenceInfo: pkg.scml.dependenceInfo
  };

  const zip = new AdmZip();
  for (const name of names) {
    const contents = files.get(name)!;
    // 源码将语言正文另起一行供审查；移除分支开头的排版换行，保留明确的 <br>。
    const packaged = name.endsWith('.twee') ? Buffer.from(contents.toString('utf8').replace(/(<<option ['"](?:EN|CN)['"]>>)\r?\n[\t ]+/g, '$1')) : contents;
    zip.addFile(name, packaged);
  }
  zip.addFile('boot.json', Buffer.from(JSON.stringify(boot, null, 2)));
  return { fileName: `${pkg.name}-v${pkg.version}.mod.zip`, buffer: zip.toBuffer() };
}
