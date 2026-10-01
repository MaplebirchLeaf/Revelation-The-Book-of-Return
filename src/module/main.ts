// ./src/module/main.ts

import RobinTemple from './RobinTemple';
import TempleChoir from './TempleChoir';
import { version } from './constants';

maplebirch.define('RBR', { version }, ['var']);
maplebirch.define('RobinTemple', new RobinTemple(maplebirch), ['RBR', 'var', 'npc']);
maplebirch.define('TempleChoir', new TempleChoir(maplebirch), ['RBR', 'var']);
