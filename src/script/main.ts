// ./src/script/main.ts

import RobinTemple from './RobinTemple';
import TempleChoir from './TempleChoir';
import LostLamb from './LostLamb';

(function (maplebirch): void {
  'use strict';

  if (maplebirch.get('RobinTemple')) RobinTemple(maplebirch);
  if (maplebirch.get('TempleChoir')) TempleChoir(maplebirch);
  if (maplebirch.get('LostLamb')) LostLamb(maplebirch);
})(maplebirch);
