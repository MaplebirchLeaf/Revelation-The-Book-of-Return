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

  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'robin-temple-links', passage: 'Temple Quarters' }, { widget: 'robin-temple-hospital-followup', passage: 'Hospital front' });

  // 守夜对白放在原版选择前，保留涉及原句替换与判定的精确补丁。
  maplebirch.tool.addTo(
    'BeforeLinkZone',
    { widget: 'robin-temple-vigil-arrival', passage: 'Temple Vigil 3' },
    { widget: 'robin-temple-vigil-cold', passage: 'Temple Vigil 7' },
    { widget: 'robin-temple-vigil-whisper', passage: 'Temple Vigil 8' },
    { widget: 'robin-temple-vigil-bell', passage: 'Temple Vigil 9' },
    { widget: 'robin-temple-vigil-pyre', passage: 'Temple Vigil 10' },
    { widget: 'robin-temple-vigil-failed', passage: 'Temple Vigil Refuse 2' },
    { widget: 'robin-temple-vigil-focus', passage: 'Temple Vigil Focus' },
    { widget: 'robin-temple-vigil-yield', passage: 'Temple Vigil Yield' },
    { widget: 'robin-temple-vigil-failure', passage: ['Temple Vigil End', 'Temple Vigil End Sydney'] },
    { widget: 'robin-temple-vigil-return', passage: ['Temple Vigil Refuse 2', 'Temple Vigil 15', 'Temple Vigil 15 Sydney', 'Temple Vigil End 2', 'Temple Vigil End Sydney 2'] }
  );
  // 从末尾定位拒绝选项，悉尼的牵手选择出现时不改变插入位置。
  maplebirch.tool.addTo('CustomLinkZone', { widget: [-1, 'robin-temple-vigil-options 8'], passage: 'Temple Vigil 10' }, { widget: [-1, 'robin-temple-vigil-options'], passage: 'Temple Vigil Refuse' });

  maplebirch.tool.inject({
    locationPassage: {
      Temple: [
        // 亵渎仪式后由本模组的三人联合检查统一处理，避免原版只检查 PC 与悉尼。
        {
          src: '$temple_chastity_timer lte 0 and $temple_rank',
          to: '$temple_chastity_timer lte 0 and !$RobinTemple.dual_promise and $temple_rank',
          expected: 1
        },
        // 在原版大厅入口计算月检条件，具体流程交由 widget 处理。
        {
          src: '<<effects>>',
          applyafter: '<<robin-temple-examination-ready>>',
          expected: 1
        },
        // 罗宾月检优先进入，保留原版悉尼检查分支。
        {
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
        // 神殿不主持第二份誓约，亵渎仪式独立结算。
        {
          src: '<<if !_sydneyStatus.includes("pure")>>',
          to: '<<robin-temple-promise-limit>><<if _robinPromiseBlocked>><<robin-temple-promise-blocked>><<sydneyOptions>><<elseif !_sydneyStatus.includes("pure")>>',
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
      'Temple Vigil 8': [
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
        // 在原版成功结局外追加罗宾同行分支，保留原文锚点。
        {
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
      'Temple Confess': [
        // 在怨灵清空事件池之前添加罗宾告解事件。
        {
          src: '<<if _wraithConfess>>',
          applybefore: '<<robin-temple-confession-event>>\n',
          expected: 1
        },
        // 罗宾是忏悔者，因此回应项走模组自己的 Forgive/Repent/Contrition/Purge，其余忏悔者保留原版。
        {
          src: '<<if !_noOptions>>',
          to: `<<if $attendant.includes('robin')>>\n\t\t<<robin-temple-confession-options>>\n<<elseif !_noOptions>>`,
          expected: 1
        }
      ]
    },
    widgetPassage: {
      // 原版没有 Robin 的贞操器具战斗反应，按 Sydney 的写法把区块补进原版 widget。
      'Widgets speech-Robin': [
        {
          // 罗宾的器具挡下 PC（$speechNPCChastity），以及 PC 的器具被罗宾看见
          //（$speechgenitals + playerChastity()）。顺序照原版 Sydney，插在无名台词兜底之前。
          src: '\t<<else>>\n\t\t<<set _noNameComment to true>>',
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
        // 女性罗宾：磨蹭、护肛板、与 PC 的阴茎相抵。
        {
          src: '\t\t\t<<elseif $NPCList[_nn].vagina is "vagina">>',
          applybefore: '\t\t\t<<elseif $NPCList[_nn].vagina is "vagina" and $NPCList[_nn].chastity.vagina.includes("chastity")>>\n\t\t\t\t<<robin-chastity-ejac-trib>>\n',
          expected: 1
        },
        {
          src: '\t\t\t<<elseif $NPCList[_nn].vagina is "otheranusfrot" or $NPCList[_nn].vagina is "otheranusentrance">>',
          applybefore:
            '\t\t\t<<elseif ($NPCList[_nn].vagina is "otheranusfrot" or $NPCList[_nn].vagina is "otheranusentrance") and $NPCList[_nn].chastity.anus.includes("shield")>>\n\t\t\t\t<<robin-chastity-ejac-otheranus>>\n',
          expected: 1
        },
        {
          src: '\t\t\t<<elseif $NPCList[_nn].vagina is "frot">>',
          applybefore: '\t\t\t<<elseif $NPCList[_nn].vagina is "frot" and $NPCList[_nn].chastity.vagina.includes("chastity")>>\n\t\t\t\t<<robin-chastity-ejac-frot>>\n',
          expected: 1
        },
        // 男性罗宾：被自己的器具挡在体外。
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "vaginaentrance">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "vaginaentrance" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-blocked "vagina">>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "vaginaimminent">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "vaginaimminent" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-blocked "vagina">>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "cheeks">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "cheeks" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-blocked "cheeks">>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "anusentrance">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "anusentrance" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-blocked "anus">>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "anusimminent">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "anusimminent" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-blocked "anus">>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "otheranusfrot" or $NPCList[_nn].penis is "otheranusentrance" or $NPCList[_nn].penis is "otheranusimminent">>',
          applybefore:
            '\t\t<<elseif ($NPCList[_nn].penis is "otheranusfrot" or $NPCList[_nn].penis is "otheranusentrance" or $NPCList[_nn].penis is "otheranusimminent") and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-blocked "anus">>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "penis">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "penis" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-blocked "penis">>\n',
          expected: 1
        },
        // 男性罗宾在被 PC 的器具挡下时用不到；这里补齐阴茎互相摩擦的状态。
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "penisentrance" or $NPCList[_nn].penis is "penisimminent">>',
          applybefore:
            '\t\t<<elseif ($NPCList[_nn].penis is "penisentrance" or $NPCList[_nn].penis is "penisimminent") and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-penis>>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "mouthentrance">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "mouthentrance" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-mouth>>\n',
          expected: 1
        },
        {
          src: '\t\t<<elseif $NPCList[_nn].penis is "mouthimminent">>',
          applybefore: '\t\t<<elseif $NPCList[_nn].penis is "mouthimminent" and $NPCList[_nn].chastity.penis.includes("chastity")>>\n\t\t\t<<robin-chastity-ejac-mouth>>\n',
          expected: 1
        }
      ],
      'Widgets Robin': [
        {
          src: '<<robinbully>>',
          applybefore: '<<robin-temple-room-link>><<secret-promise-talk "Robin">>\n\t\t',
          expected: 1
        }
      ],
      'Widgets Sydney': [
        {
          src: '<<widget "sydneyOptionsTalk">>',
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

  maplebirch.tool.addTo('Journal', 'robin-temple-journal', 'secret-promise-journal');
}
