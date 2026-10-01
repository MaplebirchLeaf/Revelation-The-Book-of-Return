// ./src/script/main.ts

import RobinTemple from './RobinTemple';
import TempleChoir from './TempleChoir';

(function (maplebirch): void {
  'use strict';

  if (maplebirch.get('RobinTemple')) RobinTemple(maplebirch);
  if (maplebirch.get('TempleChoir')) TempleChoir(maplebirch);
})(maplebirch);
