// ./src/script/main.ts

import Revelation from './Revelation';
import RobinTemple from './RobinTemple';
import TempleChoir from './TempleChoir';

(function (maplebirch): void {
  'use strict';

  if (maplebirch.get('RBR')) Revelation(maplebirch);

  // 入口只接入原版正常操作分支，月检、强制事件和昏倒页不开放额外链接。
  // 两个模块共享标记，LinkZone 负责排列，无需各自占用原版图标锚点。
  if (maplebirch.get('RobinTemple') || maplebirch.get('TempleChoir')) {
    maplebirch.tool.inject({
      locationPassage: {
        Temple: [
          { src: '<<templeicon "pray">>', applybefore: "<<set _revelationTempleLinks to 'pray'>>", expected: 1 },
          { src: '<<if $angel gte 6>>', applybefore: "<<set _revelationTempleLinks to 'mass'>>", expected: 1 }
        ]
      }
    });
  }

  if (maplebirch.get('RobinTemple')) RobinTemple(maplebirch);
  if (maplebirch.get('TempleChoir')) TempleChoir(maplebirch);
})(maplebirch);
