// ./src/module/main.ts

import RobinTemple from './RobinTemple';
import TempleChoir from './TempleChoir';
import Revelation from './Revelation';

maplebirch.define('RBR', new Revelation(maplebirch), ['var']);
maplebirch.define('RobinTemple', new RobinTemple(maplebirch), ['RBR', 'var', 'npc']);
maplebirch.define('TempleChoir', new TempleChoir(maplebirch), ['RBR', 'var']);
