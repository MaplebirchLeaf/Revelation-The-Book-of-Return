export default function Combat(core: typeof maplebirch): void {
  core.tool.patch.traits.add({
    title: 'General Traits',
    name: () => lanSwitch('Watchkeeper', '守望者'),
    colour: 'gold',
    has: () => Boolean(core.get('TempleDuties') && V.TempleDuties?.trial_day >= 0),
    text: () =>
      lanSwitch(
        'You kept the lower door and brought the lamp back. Your attacks and banishment deal 20% more damage to nonhuman creatures.',
        '你守住了下方的门，将灯带了回来。你对非人生物的攻击与放逐伤害提高 20%。'
      )
  });

  core.tool.inject({
    widgetPassage: {
      Widgets: [
        {
          src: '<<set _thedamage to (2 * _defiance * ($physique / 4000))>>',
          applyafter: '\n\t\t<<temple-watch-defiance _args[2]>>',
          expected: 1
        },
        { src: '<<npcdamage _args[1]>>', to: '<<npcdamage _args[1] _args[2]>>', expected: 1 }
      ],
      'Widgets NPC Damage': [
        { src: '<<widget "npcdamage">>', applyafter: '\n\t<<temple-watch-npcs _args[0] _args[1]>>', expected: 1 },
        { src: '$NPCList[_args[0]].health -= _thedamage', to: '$NPCList[_args[0]].health -= _watchHits[_args[0]]', expected: 1 },
        { src: '$NPCList[_npctodamage].health -= (_thedamage/_enemydivide)', to: '$NPCList[_npctodamage].health -= _watchHits[_npctodamage]', expected: 1 }
      ],
      'Widgets Effects Hands': [
        {
          src: '<<set $NPCList[_npctodamage].health -= _thedamage>>',
          applybefore: '<<temple-watch-damage $NPCList[_npctodamage] _thedamage>><<set _thedamage to _watchDamage>>\n\t\t\t\t',
          expected: 1
        }
      ],
      'Widgets Combat Tentacle Adv': [
        { src: '<<set $_amount to _args[1] or 1>>', applyafter: '\n\t<<temple-watch-record $_type $_amount `_args[2] ?? _tentacle` _args[3]>><<set $_amount to _watchDamage>>', expected: 1 },
        // 项圈电击与圣印反伤由敌人的接触触发，保留原伤害。
        { src: '<<tentacle_record "damage" 3>>', to: '<<tentacle_record "damage" 3 _tentacle "passive">>', expected: 1 },
        { src: '<<tentacle_record "banish" 12>>', to: '<<tentacle_record "banish" 12 _tentacle "passive">>', expected: 1 },
        // 格威岚的保护反噬也降低本体生命，仍属于被动效果。
        { srcmatch: /<<defiance 5>>(?=\s*<<\/if>>\s*<<arousal -500>>)/g, to: '<<defiance 5 undefined "passive">>', expected: 3 }
      ],
      'Widgets Combat Man-Combat': [
        { src: '<<arousal -1000>><<llarousal>><<defiance 5 _n>>', to: '<<arousal -1000>><<llarousal>><<defiance 5 _n "passive">>', expected: 1 },
        { src: '<<pain -8>><<llpain>><<defiance 5 _n>>', to: '<<pain -8>><<llpain>><<defiance 5 _n "passive">>', expected: 1 }
      ],
      'Widgets Struggle': [
        {
          srcmatch: /<<set \$struggle\.enemy\[_i\]\.health -= 1>>(?=\s*<<else>>\s*<span class="teal">)/,
          to: '<<temple-watch-damage $struggle.enemy[_i] 1>><<set $struggle.enemy[_i].health -= _watchDamage>>',
          expected: 1
        }
      ]
    }
  });
}
