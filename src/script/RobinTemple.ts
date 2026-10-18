// ./src/script/RobinTemple.ts

/** 注册罗宾神殿线的属性提示、日记入口和原版流程补丁。 */
export default function RobinTemple(maplebirch: typeof window.maplebirch): void {
  maplebirch.once(':sugarcube', () => {
    const { macro } = maplebirch.tool;
    for (const direction of [1, -1]) {
      for (let amount = 1; amount <= 3; amount++) {
        const name = (direction > 0 ? 'g' : 'l').repeat(amount) + 'conviction';
        macro.create(name, (npc: string) => {
          const label = maplebirch.auto(npc) + lanSwitch("'s Faith", '的信仰');
          return macro.statChange(label, direction * amount, direction > 0 ? 'gold' : 'lblue');
        });
      }
    }
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
        V.RobinTemple?.dual_promise
          ? broken
            ? lanSwitch('You have broken your shared vows.', '你打破了彼此的誓言。')
            : lanSwitch('You are bound to two partners. Intimacy with either will not break your vows.', '你已与两人缔结承诺，与他们亲密不会破坏你们的誓言。')
          : broken
            ? lanSwitch('The temple will know.', '神殿的人会知道的。')
            : lanSwitch("You've been bound to another member of the temple. Sex with this person will not break your vows.", '你已经与神殿中另一人缔结承诺，与这个人性交不会破坏你们的誓言。')
    }))
  );

  maplebirch.tool.patch.traits.add({
    title: 'NPC Traits',
    name: () => lanSwitch('Confounded Vow', '混乱誓约'),
    colour: 'wraith',
    has: () => V.RobinTemple?.dual_promise === true,
    text: () => lanSwitch('Inside becomes outside. Betrayal, or belonging? Promise partners +1.', '表里相易，内外相别，此是背叛，还是同在？承诺对象 +1。')
  });

  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'robin-temple-hospital-followup', passage: 'Hospital front' });
  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'robin-temple-vigil-reminder', passage: 'Temple' });
  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'secret-day-link', passage: 'Temple' });
  // widget 要求正常房屋菜单的街道出口，贝利堵门时没有这个入口。
  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'robin-temple-home-link', passage: 'Deadwood Reblooms Property Home' });

  // 结果补充放在原版选择前，试炼中的反应在正文对应位置注入。
  maplebirch.tool.addTo(
    'BeforeLinkZone',
    { widget: 'robin-temple-vigil-bell', passage: 'Temple Vigil 9' },
    { widget: 'robin-temple-vigil-pyre', passage: 'Temple Vigil 10' },
    { widget: 'robin-temple-vigil-failed', passage: 'Temple Vigil Refuse 2' },
    { widget: 'robin-temple-vigil-failure', passage: ['Temple Vigil End', 'Temple Vigil End Sydney'] },
    { widget: 'robin-temple-vigil-return', passage: ['Temple Vigil Refuse 2', 'Temple Vigil 15', 'Temple Vigil 15 Sydney', 'Temple Vigil End 2', 'Temple Vigil End Sydney 2'] }
  );
  // 从末尾定位拒绝选项，悉尼的牵手选择出现时不改变插入位置。
  maplebirch.tool.addTo('CustomLinkZone', { widget: [-1, 'robin-temple-vigil-options 8'], passage: 'Temple Vigil 10' }, { widget: [-1, 'robin-temple-vigil-options'], passage: 'Temple Vigil Refuse' });

  maplebirch.tool.inject({
    locationPassage: {
      Temple: [
        // 原版先过一小时再进入弥撒正文，入场时记录同场者，跨过13点也不丢失本场叙事。
        {
          srcmatchgroup: /\|Temple Mass(?: Angel| Fallen Angel| Demon)?\]\]>>/g,
          applyafter: "<<robin-temple-mass-record 'vanilla'>>",
          expected: 4
        },
        // 两人的描述与各自入口相邻，罗宾留在普通大厅的人物区，不依赖链接数量定位。
        {
          src: '<<if C.npc.Sydney.init is 1 and $exposed lte 0>>',
          applybefore: '<<robin-temple-hall-link>>\n\t',
          expected: 1
        },
        // 同一条月检分支优先处理罗宾，不拆改原版悉尼与单人检查的条件。
        {
          src: '<<elseif $temple_chastity_timer lte 0',
          applybefore: "<<elseif maplebirch.get('RobinTemple').examinationDue>><<robin-temple-examination>>\n",
          expected: 1
        }
      ],
      ...Object.fromEntries(
        ['Temple Mass', 'Temple Mass Angel', 'Temple Mass Fallen Angel', 'Temple Mass Demon'].map(passage => [
          passage,
          [
            {
              // 追加在原版弥撒与悉尼互动之后，继续链接保留原样。
              srcmatch: /<<endevent>>(?=\s*<<link \[\[[^\n]+\|Temple\]\]>>)/,
              applybefore: '<<robin-temple-mass-presence>>\n',
              expected: 1
            }
          ]
        ])
      ),
      'Temple Quarters': [{ src: '<<getouticon>>', applybefore: '<<robin-temple-links>>', expected: 1 }],
      'Sydney Temple Pure': [
        // 神殿不主持第二份誓约，亵渎仪式独立结算。
        {
          src: '<<if !_sydneyStatus.includes("pure")>>',
          to: '<<if $RobinTemple.templePromised is "Robin">><<robin-temple-promise-blocked>><<sydneyOptions>><<elseif !_sydneyStatus.includes("pure")>>',
          expected: 1
        }
      ],
      'Adult Shop Approach Sydney': [
        // 普通交谈已由 sydneyOptions 输出返回。离店等特殊分支仍保留原页面的退出入口。
        {
          srcmatch: /<<link \[\[[^|\]]+\|Adult Shop\]\]>><<\/link>>/,
          to: '<<if ["home", "englishPlay"].includes(_sydney_location)>>$&<</if>>',
          expected: 1
        }
      ],
      'Lake Shore': [
        {
          // 正常离开分支内，不能在原版危险事件发生时另开出行入口。
          src: '<<foresticon>>',
          applybefore: '<<secret-promise-lake>>',
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
      'Temple Vigil 3': [{ src: '<<stress 2>><<gstress>>', applyafter: '<<robin-temple-vigil-arrival>>', expected: 1 }],
      'Temple Vigil 7': [
        {
          src: "<<if (currentSkillValue('willpower') / 10) gte ($pain + random(0, 10))>>",
          applybefore: '<<robin-temple-vigil-cold>>',
          expected: 1
        }
      ],
      'Temple Vigil 8': [
        { src: '<<stress 6>><<trauma 6>><<gstress>><<gtrauma>>', applyafter: '<<robin-temple-vigil-whisper>>', expected: 1 },
        {
          srcmatch: /The four of you|你们四人/,
          to: '<<robin-temple-vigil-group>>',
          expected: 1
        },
        {
          srcmatch: /, and Sydney,|还有悉尼/,
          to: '<<robin-temple-vigil-companions>>',
          expected: 1
        }
      ],
      'Temple Vigil 11': [
        {
          src: '<<set $player.bodyTemperature to $player.bodyTemperature + 1>>',
          applyafter: '<<robin-temple-vigil-hand>>',
          expected: 1
        },
        // 罗宾牵手沿用原版悉尼的 -10 疼痛判定修正。
        {
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
        },
        // 罗宾与悉尼同时牵手时，原版的「你和悉尼互相搀扶」应包含罗宾。
        {
          srcmatch: /You and Sydney carry each other forwards\.|你和悉尼互相搀扶着前进。/,
          to: '<<robin-temple-vigil-carry>>',
          expected: 1
        }
      ],
      'Temple Vigil 14': [
        // 在同一条件链中增加罗宾结局，不再跨正文寻找最后一个 </if>。
        {
          src: '<<if $phase is 2>>',
          to: '<<if $RobinTemple.vigil_attending and $RobinTemple.vigil_with_robin>><<robin-temple-vigil-success>><<elseif $phase is 2>>',
          expected: 1
        },
        {
          srcmatchgroup: /<<set \$temple_rank to "monk">>/g,
          applyafter: '<<robin-temple-vigil-result>>',
          expected: 2
        }
      ],
      'Temple Vigil Focus': [{ srcmatch: /Then the flame vanishes\.|然后，火焰消逝/, applybefore: '<<robin-temple-vigil-focus>>', expected: 1 }],
      'Temple Vigil Yield': [{ srcmatch: /Then the flame vanishes\.|然后，火焰消逝/, applybefore: '<<robin-temple-vigil-yield>>', expected: 1 }],
      'Temple Confess': [
        // 在怨灵清空事件池之前添加罗宾告解事件。
        {
          src: '<<if _wraithConfess>>',
          applybefore: '<<robin-temple-confession-event>>\n',
          expected: 1
        }
      ]
    },
    widgetPassage: {
      'Widgets Temple': [
        {
          // 只添加 Robin 分支，PC、Sydney 与 dark 分支保留原版。
          src: '<<widget "temple_title">><<silently>>\n\t<<if _args[0] is "Sydney">>',
          to: '<<widget "temple_title">><<silently>>\n\t<<if _args[0] is "Robin">>\n\t\t<<robin-temple-title>>\n\t<<elseif _args[0] is "Sydney">>',
          expected: 1
        },
        {
          src: '<<widget "temple_Title">><<silently>>\n\t<<if _args[0] is "Sydney">>',
          to: '<<widget "temple_Title">><<silently>>\n\t<<if _args[0] is "Robin">>\n\t\t<<temple_title "Robin">><<capitalise>>\n\t<<elseif _args[0] is "Sydney">>',
          expected: 1
        }
      ],
      // 原版没有 Robin 的贞操器具战斗反应，按 Sydney 的写法把区块补进原版 widget。
      'Widgets speech-Robin': [
        {
          // 罗宾的器具挡下 PC（$speechNPCChastity），以及 PC 的器具被罗宾看见
          //（$speechgenitals + playerChastity()）。顺序照原版 Sydney，插在无名台词兜底之前。
          srcmatch: /<<else>>\s*<<set _noNameComment to true>>/,
          applybefore:
            // 多 NPC 同场时 $speechNPCChastity 是全局标记，再确认罗宾本人确实戴着器具。
            '\t<<elseif $speechNPCChastity is 1 and (C.npc.Robin.chastity.penis.includes("chastity") or C.npc.Robin.chastity.vagina.includes("chastity") or C.npc.Robin.chastity.anus.includes("shield")) and !$robinUniqueComments.includes("NPCChastity")>>\n' +
            '\t\t<<set $robinUniqueComments.pushUnique("NPCChastity")>>\n' +
            '\t\t<<robin-chastity-speech-device>>\n' +
            '\t<<elseif $speechgenitals is 1 and playerChastity() and !$robinUniqueComments.includes("chastity")>>\n' +
            '\t\t<<set $robinUniqueComments.pushUnique("chastity")>>\n' +
            '\t\t<<robin-chastity-speech-player>>\n',
          expected: 1
        }
      ],
      'Widgets Ejaculation-ROBIN': [
        ['$NPCList[_nn].vagina is "vagina"', 'vagina', 'robin-chastity-ejac-trib'],
        ['$NPCList[_nn].vagina is "otheranusfrot" or $NPCList[_nn].vagina is "otheranusentrance"', 'anus', 'robin-chastity-ejac-otheranus'],
        ['$NPCList[_nn].vagina is "frot"', 'vagina', 'robin-chastity-ejac-frot'],
        ['$NPCList[_nn].penis is "vaginaentrance"', 'penis', 'robin-chastity-ejac-blocked "vagina"'],
        ['$NPCList[_nn].penis is "vaginaimminent"', 'penis', 'robin-chastity-ejac-blocked "vagina"'],
        ['$NPCList[_nn].penis is "cheeks"', 'penis', 'robin-chastity-ejac-blocked "cheeks"'],
        ['$NPCList[_nn].penis is "anusentrance"', 'penis', 'robin-chastity-ejac-blocked "anus"'],
        ['$NPCList[_nn].penis is "anusimminent"', 'penis', 'robin-chastity-ejac-blocked "anus"'],
        ['$NPCList[_nn].penis is "otheranusfrot" or $NPCList[_nn].penis is "otheranusentrance" or $NPCList[_nn].penis is "otheranusimminent"', 'penis', 'robin-chastity-ejac-blocked "anus"'],
        ['$NPCList[_nn].penis is "penis"', 'penis', 'robin-chastity-ejac-blocked "penis"'],
        ['$NPCList[_nn].penis is "penisentrance" or $NPCList[_nn].penis is "penisimminent"', 'penis', 'robin-chastity-ejac-penis'],
        ['$NPCList[_nn].penis is "mouthentrance"', 'penis', 'robin-chastity-ejac-mouth'],
        ['$NPCList[_nn].penis is "mouthimminent"', 'penis', 'robin-chastity-ejac-mouth']
      ].map(([condition, part, widget]) => ({
        src: `<<elseif ${condition}>>`,
        applybefore: `<<elseif (${condition}) and $NPCList[_nn].chastity.${part}.includes("${part === 'anus' ? 'shield' : 'chastity'}")>><<${widget}>>\n`,
        expected: 1
      })),
      'Widgets Robin': [
        {
          src: '<<robinbully>>',
          applybefore: '<<robin-temple-room-link>><<secret-promise-talk "Robin">>\n\t\t',
          expected: 1
        }
      ],
      'Widgets Sydney': [
        {
          // 普通会面统一接入，日程已计算。不接入 sydneyOptionsLeave 等离开分支。
          srcmatch: /<<widget ["']sydneyOptions["']>>\s*<<sydneySchedule>>/,
          applyafter: '<<secret-promise-talk "Sydney">>',
          expected: 1
        }
      ],
      Widgets: [
        // 原版变身判定也要识别独立誓约，避免和罗宾相处时误判为违誓。
        {
          src: '$templePromised isnot $NPCList[$vaginatarget].fullDescription',
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and $NPCList[$vaginatarget].fullDescription is "Robin")',
          expected: 1
        },
        {
          src: '$templePromised isnot $NPCList[$penistarget].fullDescription',
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and $NPCList[$penistarget].fullDescription is "Robin")',
          expected: 1
        },
        // 只扩展原版伴侣条件，继续使用原版的结果提示。
        {
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
        // 扩展誓约伴侣比较，保留原版及其他模组追加的条件。
        {
          srcmatchgroup: /\$templePromised isnot \$_taker/g,
          applyafter:
            ' and !($RobinTemple.templePromised is "Robin" and $_taker is "Robin") and !(maplebirch.get("RobinTemple")?.secret.protectsRiteVows' +
            ' and (["Robin", "Sydney"].includes($_taker) or (Array.isArray(_args[0]) and _args[0].length is 2' +
            ' and ["Robin", "Sydney"].includes($_npc?.fullDescription) and ["Robin", "Sydney"].includes($_npc2?.fullDescription)' +
            ' and $_npc.fullDescription isnot $_npc2.fullDescription)))',
          expected: 2
        },
        {
          src: '$templePromised isnot _args[0]',
          applyafter: ' and !($RobinTemple.templePromised is "Robin" and _args[0] is "Robin") and !(maplebirch.get("RobinTemple")?.secret.protectsRiteVows and ["Robin", "Sydney"].includes(_args[0]))',
          expected: 1
        },
        {
          src: '$templePromised isnot $_npc.fullDescription',
          applyafter:
            ' and !($RobinTemple.templePromised is "Robin" and $_npc.fullDescription is "Robin") and !(maplebirch.get("RobinTemple")?.secret.protectsRiteVows and ["Robin", "Sydney"].includes($_npc.fullDescription))',
          expected: 1
        }
      ]
    }
  });

  maplebirch.tool.addTo('Journal', 'robin-temple-journal', 'secret-promise-journal');
}
