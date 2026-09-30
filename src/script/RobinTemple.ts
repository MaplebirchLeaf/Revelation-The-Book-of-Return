// ./src/script/RobinTemple.ts

/** 注册罗宾神殿线的属性提示、日记入口和原版流程补丁。 */
export default function RobinTemple(maplebirch: typeof window.maplebirch): void {
  // 与枯木逢春相同：提示宏只显示变化方向，不再次修改存档数值。
  maplebirch.once(':sugarcube', () => {
    const { macro } = maplebirch.tool;
    macro.create('gconviction', () => macro.statChange(lanSwitch("Robin's Faith", '罗宾的信仰'), 1, 'white'));
    macro.create('ggconviction', () => macro.statChange(lanSwitch("Robin's Faith", '罗宾的信仰'), 2, 'white'));
    macro.create('gggconviction', () => macro.statChange(lanSwitch("Robin's Faith", '罗宾的信仰'), 3, 'white'));
    macro.create('lconviction', () => macro.statChange(lanSwitch("Robin's Faith", '罗宾的信仰'), -1, 'lblue'));
    macro.create('llconviction', () => macro.statChange(lanSwitch("Robin's Faith", '罗宾的信仰'), -2, 'lblue'));
    macro.create('lllconviction', () => macro.statChange(lanSwitch("Robin's Faith", '罗宾的信仰'), -3, 'lblue'));
  });

  maplebirch.tool.patch.traits.add(
    ...[false, true].map(broken => ({
      title: 'General Traits',
      replace: broken ? /^(?:Broken Promise:|破碎的承诺：)/ : /^(?:Rite of Promise:|承诺仪式：)/,
      name: () => {
        const prefix = broken ? lanSwitch('Broken Promise: ', '破碎的承诺：') : lanSwitch('Rite of Promise: ', '承诺仪式：');
        if (V.RobinTemple?.templePromised === 'Robin') {
          return prefix + (V.templePromised === 'Sydney' ? `<span class='tentacle'>${lanSwitch('As Two, As One', '两者如一')}</span>` : maplebirch.auto('Robin'));
        }
        return prefix + maplebirch.auto(V.templePromised);
      },
      colour: broken ? 'red' : 'blue',
      has: () => Boolean(V.templePromised || V.RobinTemple?.templePromised === 'Robin') && (broken ? V.player.virginity.temple !== true : V.player.virginity.temple === true),
      text: () =>
        broken
          ? lanSwitch('The temple will know.', '神殿的人会知道的。')
          : lanSwitch("You've been bound to another member of the temple. Sex with this person will not break your vows.", '你已经与神殿中另一人缔结承诺，与这个人性交不会破坏你们的誓言。')
    }))
  );

  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'robin-temple-links', passage: 'Temple Quarters' }, { widget: 'robin-temple-hospital-followup', passage: 'Hospital front' });

  maplebirch.tool.inject({
    locationPassage: {
      Temple: [
        {
          // 在原版大厅入口计算月检条件，具体流程交由 widget 处理。
          src: '<<effects>>',
          applyafter: '<<robin-temple-examination-ready>>',
          expected: 1
        },
        {
          // 罗宾月检优先进入，保留原版悉尼检查分支。
          src: '<<elseif $temple_chastity_timer lte 0',
          applybefore: '<<elseif _robinTempleExamDue>><<robin-temple-examination>>\n',
          expected: 1
        },
        {
          src: '<<templeicon "pray">>',
          applybefore: '<<robin-temple-vigil-reminder>><<robin-temple-hall-link>>\n',
          expected: 1
        }
      ],
      'Sydney Temple Pure': [
        {
          // 原版悉尼入口也遵守第二誓约的剧情解锁条件。
          src: '<<if !_sydneyStatus.includes("pure")>>',
          to: '<<robin-temple-promise-limit>><<if _robinPromiseBlocked>><<robin-temple-promise-blocked>><<sydneyOptions>><<elseif !_sydneyStatus.includes("pure")>>',
          expected: 1
        }
      ],
      "Robin's Room Entrance": [
        {
          src: '<<elseif _robin_location is "school">>',
          applybefore: '<<elseif _robin_location is "temple">><<robin-temple-room-note>>\n',
          expected: 1
        }
      ],
      'Temple Vigil': [
        {
          src: '<<effects>>',
          applyafter: '<<robin-temple-vigil-init>>',
          expected: 1
        }
      ],
      'Temple Vigil 3': [
        {
          src: '<<gstress>>',
          applyafter: '<<robin-temple-vigil-arrival>>',
          expected: 1
        }
      ],
      'Temple Vigil 7': [
        {
          src: '<<effects>>',
          applyafter: '<<robin-temple-vigil-cold>>',
          expected: 1
        }
      ],
      'Temple Vigil 8': [
        {
          srcmatch: /The four of you|你们四人/,
          to: '<<robin-temple-vigil-group>>',
          expected: 1
        },
        {
          src: '<<gtrauma>>',
          applyafter: '<<robin-temple-vigil-whisper>>',
          expected: 1
        },
        {
          srcmatch: /, and Sydney,|还有悉尼/,
          to: '<<robin-temple-vigil-companions>>',
          expected: 1
        }
      ],
      'Temple Vigil 9': [
        {
          src: '<<templeicon "trialcontinue">>',
          applybefore: '<<robin-temple-vigil-bell>>',
          expected: 1
        }
      ],
      'Temple Vigil 10': [
        {
          src: '<<refuseicon>>',
          applybefore: '<<robin-temple-vigil-pyre>><<robin-temple-vigil-options 8>>\n',
          expected: 1
        }
      ],
      'Temple Vigil Refuse': [
        {
          src: '<<templeicon "trialbail">>',
          applybefore: '<<robin-temple-vigil-options>>\n',
          expected: 1
        }
      ],
      'Temple Vigil Refuse 2': [
        {
          src: '<<effects>>',
          applyafter: '<<robin-temple-vigil-failed>><<robin-temple-vigil-return>>',
          expected: 1
        }
      ],
      'Temple Vigil 11': [
        {
          src: '<<set $player.bodyTemperature to $player.bodyTemperature + 1>>',
          applyafter: '<<robin-temple-vigil-hand>>',
          expected: 1
        },
        {
          // 罗宾牵手沿用原版悉尼的 -10 疼痛判定修正。
          src: '($pain + random(0, 10))',
          to: '(($pain - ($RobinTemple.vigil_with_robin ? 10 : 0)) + random(0, 10))',
          expected: 1
        }
      ],
      'Temple Vigil 12': [
        {
          src: '<<set $fire to 2>>',
          applyafter: '<<robin-temple-vigil-fire-result>>',
          expected: 1
        }
      ],
      'Temple Vigil Focus': [
        {
          srcmatch: /<<link[^>\n]+\|Temple Vigil 14\]\]>>/,
          applybefore: '<<robin-temple-vigil-focus>>',
          expected: 1
        }
      ],
      'Temple Vigil Yield': [
        {
          srcmatch: /<<link[^>\n]+\|Temple Vigil 14\]\]>>/,
          applybefore: '<<robin-temple-vigil-yield>>',
          expected: 1
        }
      ],
      'Temple Vigil 14': [
        {
          // 在原版成功结局外追加罗宾同行分支，保留原文锚点。
          src: '<<if $phase is 2>>',
          applybefore: '<<if $RobinTemple.vigil_attending and $RobinTemple.vigil_with_robin>><<robin-temple-vigil-success>><<else>>\n',
          expected: 1
        },
        {
          srcmatch: /<<\/if>>(?![\s\S]*<<\/if>>)/,
          applyafter: '<</if>>',
          expected: 1
        },
        {
          srcmatchgroup: /<<set \$temple_rank to "monk">>/g,
          applyafter: '<<robin-temple-vigil-result>>',
          expected: 2
        }
      ],
      'Temple Vigil 15': [
        {
          srcmatch: /<<link[^>\n]+\|Temple Cloister\]\]>>/,
          applybefore: '<<robin-temple-vigil-return>>\n',
          expected: 1
        }
      ],
      'Temple Vigil 15 Sydney': [
        {
          srcmatch: /<<link[^>\n]+\|Temple Cloister\]\]>>/,
          applybefore: '<<robin-temple-vigil-return>>\n',
          expected: 1
        }
      ],
      'Temple Vigil End': [
        {
          src: '<<person1>>',
          applyafter: '<<robin-temple-vigil-failure>>',
          expected: 1
        }
      ],
      'Temple Vigil End Sydney': [
        {
          src: '<<person1>>',
          applyafter: '<<robin-temple-vigil-failure>>',
          expected: 1
        }
      ],
      'Temple Vigil End 2': [
        {
          srcmatch: /<<link[^>\n]+\|Temple\]\]>>/,
          applybefore: '<<robin-temple-vigil-return>>',
          expected: 1
        }
      ],
      'Temple Vigil End Sydney 2': [
        {
          srcmatch: /<<link[^>\n]+\|Temple\]\]>>/,
          applybefore: '<<robin-temple-vigil-return>>',
          expected: 1
        }
      ],
      'Temple Confess': [
        {
          // 在怨灵清空事件池之前添加罗宾告解事件。
          src: '<<if _wraithConfess>>',
          applybefore: '<<robin-temple-confession-event>>\n',
          expected: 1
        }
      ]
    },
    widgetPassage: {
      'Widgets Robin': [
        {
          src: '<<robinbully>>',
          applybefore: '<<robin-temple-room-link>>\n\t\t',
          expected: 1
        }
      ],
      Widgets: [
        {
          // 原版变身判定也要识别独立誓约，避免和罗宾相处时误判为违誓。
          src: '$templePromised isnot $NPCList[$vaginatarget].fullDescription',
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and $NPCList[$vaginatarget].fullDescription is "Robin")',
          expected: 1
        },
        {
          src: '$templePromised isnot $NPCList[$penistarget].fullDescription',
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and $NPCList[$penistarget].fullDescription is "Robin")',
          expected: 1
        },
        {
          // 只扩展原版伴侣条件，继续使用原版的结果提示。
          src: '$templePromised is _args[0]',
          applyafter: ' or ($RobinTemple.templePromised is "Robin" and _args[0] is "Robin")',
          expected: 1
        }
      ],
      'Widgets Text': [
        {
          srcmatchgroup: /\$templePromised isnot _args\[0\]/g,
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and _args[0] is "Robin")',
          expected: 2
        }
      ],
      'Widgets Combat': [
        {
          // 扩展誓约伴侣比较，保留原版及其他模组追加的条件。
          srcmatchgroup: /\$templePromised isnot \$_taker/g,
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and $_taker is "Robin")',
          expected: 2
        },
        {
          src: '$templePromised isnot _args[0]',
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and _args[0] is "Robin")',
          expected: 1
        },
        {
          src: '$templePromised isnot $_npc.fullDescription',
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and $_npc.fullDescription is "Robin")',
          expected: 1
        }
      ]
    }
  });

  maplebirch.tool.addTo('Journal', 'robin-temple-journal');
}
