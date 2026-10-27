// ./src/script/LostLamb.ts

import { restore } from '../module/LostLamb';

export default function LostLamb(maplebirch: typeof window.maplebirch): void {
  // 独立于模块开关注册，在新页面正文前恢复梦中存档。
  maplebirch.tool.addTo('Header', () => {
    if (!V.LostLamb?.active) return;
    const lamb = maplebirch.get('LostLamb');
    if (lamb?.active && maplebirch.SugarCube.State.passage === 'Lost Lamb Memory') return;
    restore();
  });
  if (!maplebirch.get('LostLamb')) return;

  maplebirch.tool.addTo(
    'BeforeLinkZone',
    { widget: 'lost-lamb-entry', passage: 'Manor Kylar Room' },
    { widget: 'lost-lamb-bishop-link', passage: ['Temple Confessor Intro Ask', 'Revelation Temple Bishop', 'Revelation Temple Monstrance'] }
  );
  maplebirch.tool.addTo('Journal', 'lost-lamb-record');
  maplebirch.tool.patch.traits.add({
    title: 'General Traits',
    name: () => lanSwitch('Dream Scar', '梦痕'),
    colour: 'black',
    has: () => Boolean(maplebirch.get('LostLamb')?.reward),
    text: () =>
      lanSwitch(
        'You remember the way back from a dream. The ongoing stress caused by nightmares during sleep is reduced by 25%.<<if maplebirch.get("Psyche")>> Dread gained on waking from nightmares is also reduced by 25%.<</if>>',
        '你记得从梦中归来的路。睡眠中因噩梦持续增加的压力减少 25%。<<if maplebirch.get("Psyche")>>噩梦醒后的恐惧增长也减少 25%。<</if>>'
      )
  });

  maplebirch.tool.inject({
    locationPassage: {
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
      'Widgets Sydney': [
        {
          src: '<<widget "sydneyOptionsTalk">>',
          applyafter: '\n<<lost-lamb-sydney-link>>',
          expected: 1
        }
      ],
      'Gwylan Widgets': [
        {
          src: '<<widget "gwylanOptionsSpecial">>',
          applyafter: '\n<<lost-lamb-gwylan-link>>',
          expected: 1
        }
      ],
      // 原版 journal 在 statFreeze 时提前退出，不能用尾部区域展示演绎日志。
      'Widgets Journal': [{ src: '<<widget "journal">>', applyafter: '\n<<if maplebirch.get("LostLamb")?.active>><<lost-lamb-journal>><<exit>><</if>>', expected: 1 }],
      // 按每小时结算后的钳位定位，兼容其它模组扩展噩梦条件，梦痕只减轻真实噩梦的压力。
      'Widgets Sleep': [
        {
          srcmatch: /(?<=<<stress )6(?=>>\s*<<\/if>>\s*<<sleep_clamp>>)/,
          to: "`$nightmares gte 1 and $controlled is 0 ? (maplebirch.get('LostLamb')?.nightmareStress ?? 6) : 6`",
          expected: 1
        }
      ]
    }
  });
}
