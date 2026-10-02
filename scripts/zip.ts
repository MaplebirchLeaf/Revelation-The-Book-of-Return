// ./scripts/zip.ts

import path from 'node:path';
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import AdmZip from 'adm-zip';

interface ScmlPlugin {
  modName: string;
  addonName: string;
  modVersion: string;
  params?: unknown;
}

interface ScmlConfig {
  nickName: unknown;
  alias?: string[];
  dependenceInfo: Array<{ modName: string; version: string }>;
  addonPlugin?: ScmlPlugin[];
}

interface RootPackage {
  name: string;
  version: string;
  scml: ScmlConfig;
}

interface PackageInfo {
  name: string;
  version: string;
  baseName: string;
}

export interface PackageAsset {
  fileName: string;
  buffer: Buffer;
}

interface ScanOptions {
  prefix?: string;
}

interface TweePatcherRule {
  passage: string;
  all?: boolean;
  findString?: string;
  findRegex?: string;
  regexFlag?: string;
  replace?: string;
  replaceFile?: string;
}

interface ReplacePatcherRule {
  from: string;
  to: string;
  fileName: string;
}

interface BootFileLists {
  styleFileList: string[];
  tweeFileList: string[];
  additionFile: string[];
}

interface BeautySelectorParams {
  types: Array<{
    type: string;
    imgFileListFile: string;
  }>;
}

const BEAUTY_SELECTOR_TYPE = {
  type: 'Revelation-The-Book-of-Return-Images',
  imgFileListFile: 'Revelation-The-Book-of-Return-Images.json'
} as const;

const scriptFileLists = {
  scriptFileList: ['dist/game.js'],
  scriptFileList_preload: ['dist/preload.js'],
  scriptFileList_earlyload: ['dist/earlyload.js'],
  scriptFileList_inject_early: ['dist/inject_early.js']
} as const;

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);
const ADDITION_EXTENSIONS = new Set(['.json', '.yaml', '.yml']);

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, '/');
}

async function scan(dir: string, { prefix = '' }: ScanOptions = {}): Promise<Map<string, Buffer>> {
  const out = new Map<string, Buffer>();
  if (!existsSync(dir)) return out;
  const entries = (await readdir(dir, { withFileTypes: true })).sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = normalizePath(path.join(prefix, entry.name));
    if (entry.isDirectory()) {
      const subFiles = await scan(fullPath, { prefix: relPath });
      subFiles.forEach((buffer, filePath) => out.set(filePath, buffer));
    } else if (entry.isFile()) out.set(relPath, await readFile(fullPath));
  }
  return out;
}

function upsertPlugin(plugins: ScmlPlugin[], match: (plugin: ScmlPlugin) => boolean, next: ScmlPlugin | null, toFront = false): void {
  const index = plugins.findIndex(match);
  if (index === -1) {
    if (!next) return;
    if (toFront) plugins.unshift(next);
    else plugins.push(next);
    return;
  }
  if (!next) {
    plugins.splice(index, 1);
    return;
  }
  plugins[index] = next;
  if (toFront && index > 0) {
    const [plugin] = plugins.splice(index, 1);
    plugins.unshift(plugin);
  }
}

function parseYamlList<T>(content: string, fileName: string, normalize: (item: Record<string, unknown>) => T | null): T[] {
  const parsed: unknown = Bun.YAML.parse(content);
  if (!Array.isArray(parsed)) throw new Error(`${fileName} must contain a YAML list.`);
  return parsed.map((item, index) => {
    if (item == null || typeof item !== 'object' || Array.isArray(item)) throw new Error(`${fileName} rule #${index + 1} must be an object.`);
    const rule = normalize(item as Record<string, unknown>);
    if (!rule) throw new Error(`${fileName} rule #${index + 1} is incomplete.`);
    return rule;
  });
}

function buildRules(content: string, type: 'twee'): TweePatcherRule[];
function buildRules(content: string, type: 'patcher'): ReplacePatcherRule[];
function buildRules(content: string, type: 'twee' | 'patcher'): Array<TweePatcherRule | ReplacePatcherRule> {
  return parseYamlList(content, type === 'twee' ? 'TweeReplacer.yaml' : 'ReplacePatcher.yaml', item => {
    const sourceKey = type === 'twee' ? 'findString' : 'from';
    const source = typeof item[sourceKey] === 'string' ? item[sourceKey] : '';
    const regex = type === 'twee' && typeof item.findRegex === 'string' ? item.findRegex : '';
    const before = typeof item.before === 'string' ? item.before : '';
    const after = typeof item.after === 'string' ? item.after : '';
    const relative = before || after ? `${before}${source || '$&'}${after}` : undefined;

    if (type === 'patcher') {
      const rule: ReplacePatcherRule = {
        from: source,
        to: typeof item.to === 'string' ? item.to : (relative ?? ''),
        fileName: typeof item.fileName === 'string' ? item.fileName : ''
      };
      return rule.from && rule.fileName && (typeof item.to === 'string' || relative !== undefined) ? rule : null;
    }

    const rule: TweePatcherRule = { passage: typeof item.passage === 'string' ? item.passage : '' };
    if (source) rule.findString = source;
    else if (regex) rule.findRegex = regex;
    if (typeof item.regexFlag === 'string') rule.regexFlag = item.regexFlag;
    if (item.all === true) rule.all = true;
    if (typeof item.replace === 'string') rule.replace = item.replace;
    else if (typeof item.replaceFile === 'string') rule.replaceFile = item.replaceFile;
    else if (relative !== undefined) rule.replace = relative;

    return rule.passage && (rule.findString || rule.findRegex) && (rule.replace !== undefined || rule.replaceFile !== undefined) ? rule : null;
  });
}

function collectImageFiles(files: string[]): string[] {
  return files.filter(filePath => filePath.startsWith('img/') && IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()));
}

function AdditionDirs(imgFileList: string[]): string[] {
  return [...new Set(imgFileList.map(filePath => filePath.split('/')[0]))].sort();
}

function BeautySelectorParams(imgFileList: string[]): BeautySelectorParams | null {
  return imgFileList.length ? { types: [BEAUTY_SELECTOR_TYPE] } : null;
}

function BootFileLists(files: string[]): BootFileLists {
  const styleFileList: string[] = [];
  const tweeFileList: string[] = [];
  const additionFile: string[] = [];
  for (const filePath of files) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.css') styleFileList.push(filePath);
    else if (ext === '.twee') tweeFileList.push(filePath);
    else if (ADDITION_EXTENSIONS.has(ext)) additionFile.push(filePath);
  }
  return { styleFileList, tweeFileList, additionFile };
}

function filterExistingFiles(fileSet: Set<string>, fileList: readonly string[]): string[] {
  return fileList.filter(filePath => fileSet.has(filePath));
}

function buildFrameworkPlugin(distFileSet: Set<string>, translationFiles: Record<'CN' | 'EN', string[]>, version: string, current?: ScmlPlugin): ScmlPlugin {
  const params = {
    ...((current?.params && typeof current.params === 'object' && !Array.isArray(current.params) ? current.params : {}) as Record<string, unknown>),
    language: translationFiles
  } as Record<string, unknown>;
  delete params.module;
  delete params.script;
  if (distFileSet.has('dist/module.js')) params.module = ['dist/module.js'];
  if (distFileSet.has('dist/script.js')) params.script = ['dist/script.js'];
  return { modName: 'maplebirch', addonName: 'maplebirchAddon', modVersion: version, params };
}

function buildAddonPlugins(
  addonPlugin: ScmlPlugin[],
  dependencies: ScmlConfig['dependenceInfo'],
  distFileSet: Set<string>,
  translationFiles: Record<'CN' | 'EN', string[]>,
  beautySelectorParams: BeautySelectorParams | null,
  tweePatcherRules: TweePatcherRule[],
  replacePatcherRules: ReplacePatcherRule[]
): ScmlPlugin[] {
  const versions = new Map(dependencies.map(dep => [dep.modName, dep.version]));
  const frameworkVersion = versions.get('maplebirch');
  if (!frameworkVersion) throw new Error('Missing maplebirch framework dependency');
  const frameworkPlugin = addonPlugin.find(plugin => plugin.modName === 'maplebirch' && plugin.addonName === 'maplebirchAddon');
  upsertPlugin(
    addonPlugin,
    plugin => plugin.modName === 'maplebirch' && plugin.addonName === 'maplebirchAddon',
    buildFrameworkPlugin(distFileSet, translationFiles, frameworkVersion, frameworkPlugin),
    true
  );
  upsertPlugin(
    addonPlugin,
    plugin => plugin.modName === 'BeautySelectorAddon' && plugin.addonName === 'BeautySelectorAddon',
    beautySelectorParams ? { modName: 'BeautySelectorAddon', addonName: 'BeautySelectorAddon', modVersion: '>=2.0.0', params: beautySelectorParams } : null
  );
  upsertPlugin(
    addonPlugin,
    plugin => plugin.modName === 'TweeReplacer' && plugin.addonName === 'TweeReplacerAddon',
    tweePatcherRules.length ? { modName: 'TweeReplacer', addonName: 'TweeReplacerAddon', modVersion: '>=1.0.0', params: tweePatcherRules } : null
  );
  upsertPlugin(
    addonPlugin,
    plugin => plugin.modName === 'ReplacePatcher' && plugin.addonName === 'ReplacePatcherAddon',
    replacePatcherRules.length ? { modName: 'ReplacePatcher', addonName: 'ReplacePatcherAddon', modVersion: '>=1.0.0', params: { js: replacePatcherRules } } : null
  );
  return addonPlugin.filter(plugin => versions.has(plugin.modName) && hasContent(plugin.params)).map(plugin => ({ ...plugin, modVersion: versions.get(plugin.modName)! }));
}

function hasContent(value: unknown): boolean {
  if (value == null) return false;
  if (Array.isArray(value)) return value.some(hasContent);
  if (typeof value === 'object') return Object.values(value).some(hasContent);
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

async function readRootPackage(rootDir: string): Promise<RootPackage> {
  const pkg = JSON.parse(await readFile(path.join(rootDir, 'package.json'), 'utf8')) as RootPackage;
  if (!pkg?.name || !pkg?.version) throw new Error('package.json missing name/version');
  if (!pkg.scml?.nickName || !Array.isArray(pkg.scml.dependenceInfo)) throw new Error('package.json missing scml.nickName / scml.dependenceInfo');
  return pkg;
}

export async function modPackageInfo(rootDir: string): Promise<PackageInfo> {
  const pkg = await readRootPackage(rootDir);
  return { name: pkg.name, version: pkg.version, baseName: `${pkg.name}-v${pkg.version}` };
}

export async function createZip(rootDir: string): Promise<Buffer> {
  const pkg = await readRootPackage(rootDir);
  const [publicFiles, sourceTweeFiles, sourceStyleFiles, distFiles, tweePatcherRulesRaw, replacePatcherRaw] = await Promise.all([
    scan(path.join(rootDir, 'public')),
    scan(path.join(rootDir, 'src', 'twee')),
    scan(path.join(rootDir, 'src', 'styles')),
    scan(path.join(rootDir, 'dist'), { prefix: 'dist' }),
    readFile(path.join(rootDir, 'src', 'TweeReplacer.yaml'), 'utf8'),
    readFile(path.join(rootDir, 'src', 'ReplacePatcher.yaml'), 'utf8')
  ]);
  for (const filePath of ['dist/module.js', 'dist/script.js']) {
    if (!distFiles.has(filePath)) throw new Error(`Required build output is missing: ${filePath}`);
  }

  const files = new Map([...publicFiles, ...sourceTweeFiles, ...sourceStyleFiles, ...distFiles]);
  const imgFileList = collectImageFiles([...publicFiles.keys()]).sort();
  if (imgFileList.length) files.set(BEAUTY_SELECTOR_TYPE.imgFileListFile, Buffer.from(JSON.stringify(imgFileList, null, 2)));
  const allFiles = [...files.keys()].sort();
  const distFileSet = new Set(distFiles.keys());
  const translationFiles = {
    CN: [...publicFiles.keys()].filter(filePath => filePath.startsWith('translations/CN/') && /\.ya?ml$/i.test(filePath)).sort(),
    EN: [...publicFiles.keys()].filter(filePath => filePath.startsWith('translations/EN/') && /\.ya?ml$/i.test(filePath)).sort()
  };
  const bootFileLists = BootFileLists(allFiles);
  const beautySelector = BeautySelectorParams(imgFileList);
  const addonPlugin = buildAddonPlugins(
    pkg.scml.addonPlugin?.map(plugin => ({ ...plugin })) ?? [],
    pkg.scml.dependenceInfo,
    distFileSet,
    translationFiles,
    beautySelector,
    buildRules(tweePatcherRulesRaw, 'twee'),
    buildRules(replacePatcherRaw, 'patcher')
  );
  const boot = {
    name: pkg.name,
    nickName: pkg.scml.nickName,
    alias: pkg.scml.alias ?? [],
    version: pkg.version,

    imgFileList,
    styleFileList: bootFileLists.styleFileList,
    tweeFileList: bootFileLists.tweeFileList,
    additionFile: bootFileLists.additionFile,

    scriptFileList: filterExistingFiles(distFileSet, scriptFileLists.scriptFileList),
    scriptFileList_preload: filterExistingFiles(distFileSet, scriptFileLists.scriptFileList_preload),
    scriptFileList_earlyload: filterExistingFiles(distFileSet, scriptFileLists.scriptFileList_earlyload),
    scriptFileList_inject_early: filterExistingFiles(distFileSet, scriptFileLists.scriptFileList_inject_early),

    additionDir: AdditionDirs(imgFileList),
    additionBinaryFile: [],

    addonPlugin,
    dependenceInfo: pkg.scml.dependenceInfo
  };

  const zip = new AdmZip();
  files.forEach((buffer, filePath) => {
    // 保留审查时的分行正文，打包时只移除语言分支开头的排版换行。
    const packaged = filePath.endsWith('.twee') ? Buffer.from(buffer.toString('utf8').replace(/(<<option ['"](?:EN|CN)['"]>>)\r?\n[\t ]+/g, '$1')) : buffer;
    zip.addFile(filePath, packaged);
  });
  zip.addFile('boot.json', Buffer.from(JSON.stringify(boot, null, 2)));
  return zip.toBuffer();
}

export async function createZipPackage(rootDir: string): Promise<PackageAsset> {
  const info = await modPackageInfo(rootDir);
  return { fileName: `${info.baseName}.mod.zip`, buffer: await createZip(rootDir) };
}
