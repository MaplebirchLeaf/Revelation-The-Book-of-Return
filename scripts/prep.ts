// ./scripts/prep.ts

import path from 'node:path';
import { rm } from 'node:fs/promises';

const root = path.join(import.meta.dirname, '..');
await Promise.all([rm(path.join(root, 'dist'), { recursive: true, force: true }), rm(path.join(root, 'package'), { recursive: true, force: true })]);
