// ./src/script/main.ts

import Tips from './Revelation/Tips';
import RobinTemple from './RobinTemple';
import TempleChoir from './TempleChoir';
import LostLamb from './LostLamb';
import DoLX from '../compat/DoLX';
import TempleDuties from './TempleDuties';
import Wraith from './Wraith';

(function (maplebirch): void {
  'use strict';

  if (maplebirch.get('RBR')) Tips(maplebirch);
  // 原版再次取物、潜水队移交与办公室显示继续同步已保存的遗物状态。
  Wraith(maplebirch);

  // 梦属于誓约的后续，停用模块或离开梦境时仍沿原版噩梦流程恢复现实。
  maplebirch.tool.addTo('Header', () => {
    if (!V.RobinTemple?.secret?.dream?.active || V.replayScene) return;
    if (maplebirch.get('RobinTemple') && maplebirch.get('LostLamb') && maplebirch.SugarCube.State.passage.startsWith('RobinTemple Dream ')) return;
    new maplebirch.SugarCube.Wikifier(null, '<<secret-dream-wake>>');
  });
  if (maplebirch.get('RobinTemple') && maplebirch.get('LostLamb')) {
    maplebirch.tool.inject({
      widgetPassage: {
        // 只扩展原版候选池，保留睡眠时长、其它噩梦及强制睡眠事件的优先级。
        'Widgets Nightmares': [
          {
            src: '<<if $_possibleNightmares.length gte 1>>',
            applybefore: '<<secret-dream-check>><<if _secretDreamReady>><<set $_possibleNightmares.pushUnique("RobinTemple Dream Start")>><</if>>\n',
            expected: 1
          }
        ]
      }
    });
  }

  // 入口只接入原版正常操作分支，月检、强制事件和昏倒页不开放额外链接。
  // 各模块共享标记，由 LinkZone 排列入口。
  if (maplebirch.get('RobinTemple') || maplebirch.get('TempleChoir') || maplebirch.get('TempleDuties')) {
    maplebirch.tool.inject({
      locationPassage: {
        Temple: [
          { src: '<<templeicon "pray">>', applybefore: "<<set _revelationTempleLinks to 'pray'>>", expected: 1 },
          {
            src: '<<if Time.weekDay is 1 and Time.hour gte 11 and Time.hour lte 12 and $daily.massAttended isnot 1 and $exposed lte 0 and C.npc.Jordan.init is 1>>',
            applyafter: "<<set _revelationTempleLinks to 'mass'>>",
            expected: 1
          }
        ]
      }
    });
  }

  if (maplebirch.get('RobinTemple')) RobinTemple(maplebirch);
  if (maplebirch.get('TempleChoir')) TempleChoir(maplebirch);
  // 即使模块关闭，保存于梦中的存档仍需要 Header 恢复。
  LostLamb(maplebirch);
  DoLX(maplebirch);
  if (maplebirch.get('TempleDuties')) TempleDuties(maplebirch);
})(maplebirch);
