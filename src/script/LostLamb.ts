// ./src/script/LostLamb.ts

import { restoreLostLamb } from '../module/LostLamb';

export default function LostLamb(maplebirch: typeof window.maplebirch): void {
  // 独立于模块开关注册，在新页面正文前恢复梦中存档。
  maplebirch.tool.addTo('Header', () => {
    if (!V.LostLamb?.active) return;
    const lamb = maplebirch.get('LostLamb');
    if (lamb?.active && maplebirch.SugarCube.State.passage === 'Lost Lamb Memory') return;
    restoreLostLamb();
  });
  if (!maplebirch.get('LostLamb')) return;

  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'lost-lamb-entry', passage: 'Manor Kylar Room' });
  maplebirch.tool.addTo('Journal', 'lost-lamb-record');
  maplebirch.tool.patch.traits.add({
    title: 'General Traits',
    name: () => lanSwitch('Dream Scar', '梦痕'),
    colour: 'lblue',
    has: () => Boolean(maplebirch.get('LostLamb')?.reward),
    text: () =>
      lanSwitch('You remember the way back from a dream. The ongoing stress caused by nightmares during sleep is reduced by 25%.', '你记得从梦中归来的路。睡眠中因噩梦持续增加的压力减少 25%。')
  });

  maplebirch.tool.inject({
    locationPassage: {
      'Manor Kylar Secret 5': [{ src: '<<effects>>', applyafter: '\n<<set $LostLamb.unlocked to true>>', expected: 1 }],
      'Manor Kylar Word 2': [{ src: '<<effects>>', applyafter: '\n<<set $LostLamb.recalled to true>>', expected: 1 }],
      // 原版绑架后的睡眠独立于 sleephour，同样减轻持续噩梦压力。
      'Moor Abduction Sleep': [
        {
          srcmatch: /(?<=<<if \$nightmares gte 1 and \$controlled is 0>>\s*<<stress )6(?=>>)/,
          to: "`maplebirch.get('LostLamb')?.nightmareStress ?? 6`",
          expected: 1
        }
      ]
    },
    widgetPassage: {
      // 原版 journal 在 statFreeze 时提前退出，不能用尾部区域展示演绎日志。
      'Widgets Journal': [{ src: '<<widget "journal">>', applyafter: '\n<<if maplebirch.get("LostLamb")?.active>><<lost-lamb-journal>><<exit>><</if>>', expected: 1 }],
      // 只替换每小时噩梦压力的参数，保留其它睡眠事件与原版提示。
      'Widgets Sleep': [
        {
          srcmatch: /(?<=<<if \$nightmares gte 1 and \$controlled is 0>>\s*<<stress )6(?=>>)/,
          to: "`maplebirch.get('LostLamb')?.nightmareStress ?? 6`",
          expected: 1
        }
      ]
    }
  });

  maplebirch.tool.onInit(() => {
    setup.feats['Lost Lamb'] ??= {
      get title() {
        return lanSwitch('Lost Lamb', '迷途羔羊');
      },
      get desc() {
        return lanSwitch('Follow Kylar’s childhood through the night that changed the manor, and find your way back.', '经历凯拉尔与悉尼来往的旧日生活，以及庄园改变的那一夜，并回到现在。');
      },
      difficulty: 3,
      series: '',
      filter: ['All', 'General']
    };
  });
}
