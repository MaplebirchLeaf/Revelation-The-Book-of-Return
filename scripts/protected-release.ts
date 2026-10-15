// ./scripts/protected-release.ts

import path from 'node:path';
import { injectZip } from '../tools/dol-mod-protection-tools/src/inject';
import { createModPackFromZip } from '../tools/dol-mod-protection-tools/src/modpack';
import { createZipPackage } from './zip';

const root = path.join(import.meta.dirname, '..');
const asset = await createZipPackage(root);
const input = path.join(root, 'package', asset.fileName);
const output = input.replace(/\.mod\.zip$/, '.modpack');

// 无凭证模式将解密密码内嵌到加载器，不签发玩家凭证或写出私钥。
const encrypted = await injectZip({ input, autoAuth: true, noCredentialPassword: true });
if (encrypted.generated?.credential) throw new Error('Credential-free release unexpectedly generated a credential.');
const modpack = createModPackFromZip(encrypted.modName, encrypted.patchedZip);
await Bun.write(output, modpack);
console.log(`Protected release package: ${output}`);
