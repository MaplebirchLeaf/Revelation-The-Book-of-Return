/** 象牙怨灵的岸边回访与遗物归还共用此处接入。 */
export default function Wraith(maplebirch: typeof window.maplebirch): void {
  // 项链放回基座后仍可再次拿走，原版 notFound、拾取与潜水队取得流程保持有效。
  // 当前归还标记需随原版物品去向更新，即使玩家随后关闭根模块也如此。
  maplebirch.tool.inject({
    locationPassage: {
      'Lake Shore': [
        {
          // 原版已排除昏倒、追逐、随机遭遇、温特来访与耳史莱姆命令，才进入岸边普通菜单。
          src: '<<lakereturnjourney>>',
          applyafter: '<<revelation-wraith-visit-link>>',
          expected: 1
        }
      ],
      'Lake Ruin Plinth': [
        {
          // 从奎恩处盗回过的项链不再计入待售古董，再次取回也不能恢复售价。
          src: '<<set $antiquemoney += 2000>>',
          to: '<<if !$RBR?.necklace?.reclaimed>><<set $antiquemoney += 2000>><</if>>',
          expected: 1
        },
        {
          // 再次拿走后清除当前归还状态，随后原版 Lake Ruin Ivory 会将痴迷重新设为20。
          src: '<<set $necklaceThief to "player">>',
          applyafter: '<<wraith-necklace-retake>>',
          expected: 1
        },
        { src: '<<if _leave>>', applyafter: '<<ivory-necklace-link>>', expected: 1 }
      ],
      'Lake Ruin Ivory': [
        {
          srcmatch: /<<else>>(?=[^<]*<<\/if>>\s*<br><br>\s*<<link)/,
          to: '<<elseif $RBR?.necklace?.reclaimed>><<lanSwitch "You can see your reflection in the blue gemstones. The museum will not pay for the necklace twice." "你可以在蓝色宝石中看到自己的倒影。博物馆不会再为这条项链付一次钱。">><<else>>',
          expected: 1
        }
      ],
      'Town Hall Projects Diving 2': [
        {
          // 前置归还判断，保留怨灵的倒影 1.3.4 使用的 `"player">>` 尾部锚点。
          // 接受已注入的前缀，使重复处理保持幂等，其它模组追加的条件原样保留。
          srcmatch: /(?:!\$RBR\?\.necklace\?\.returned and )?(\$museumAntiques\.antiques\.antiqueivorynecklace isnot "found" and \$necklaceThief is "player")/,
          to: '!$RBR?.necklace?.returned and $1',
          expected: 1
        },
        { src: '<<effects>>', applyafter: '<<ivory-necklace-learn "quinn">>', expected: 1 }
      ],
      'Town Hall Projects Diving Buy': [
        {
          src: '<<if $museumAntiques.antiques.antiqueivorynecklace is "found">>',
          to: '<<if !$RBR?.necklace?.reclaimed and $museumAntiques.antiques.antiqueivorynecklace is "found">>',
          expected: 1
        },
        {
          // 潜水队仍可取得放回的项链，不把潜水队的行为计作PC再次盗取。
          src: '<<set $necklaceThief to "diver">>',
          applyafter: '<<if $RBR?.necklace and !$replayScene and !$statFreeze>><<set $RBR.necklace.returned to false>><</if>><<ivory-necklace-learn "quinn">>',
          expected: 1
        },
        {
          // 仅包裹展示盒描述，保留原文和两种状态共用的离场出口。
          srcmatch: /(<<else>>\s*)(<<He>>[^\r\n]*\s*<br><br>)/,
          to: '$1<<if $RBR?.necklace?.returned or !["talk", "museum"].includes($museumAntiques?.antiques?.antiqueivorynecklace)>><<ivory-necklace-quinn-empty>><<else>><<ivory-necklace-learn "quinn">>$2<</if>>',
          expected: 1
        }
      ],
      'Town Hall Projects Diving Necklace': [
        {
          src: '<<effects>>',
          applybefore: '<<if $RBR?.necklace?.reclaimed>><<ivory-necklace-resale-stop>><<exit>><</if>>',
          expected: 1
        },
        {
          // 原版宏不接受 found -> museum；补齐交接步骤，只记一次首次馆藏。
          src: '<<museumAntiqueStatus "antiqueivorynecklace" "museum">>',
          to: '<<museumAntiqueStatus "antiqueivorynecklace" "talk">><<museumAntiqueStatus "antiqueivorynecklace" "museum">><<ivory-necklace-learn "quinn">>',
          expected: 1
        }
      ],
      Museum: [
        {
          src: '<<if $museumAntiques.antiques.antiqueivorynecklace is "found">>',
          to: '<<if !$RBR?.necklace?.reclaimed and $museumAntiques.antiques.antiqueivorynecklace is "found">>',
          expected: 1
        }
      ],
      'Museum Immaculate Ivory Necklace': [
        {
          src: '<<effects>>',
          applyafter: '<<ivory-necklace-learn "quinn">>',
          expected: 1
        }
      ],
      'Town Hall Computer 2': [
        { src: '<<effects>>', applyafter: '<<ivory-necklace-learn "quinn">>', expected: 1 },
        {
          // 原版这一段总是假定展示盒里有项链，这里只包裹该段，不改电脑任务。
          src: '<<if $necklaceThief is "player">>',
          applybefore: '<<if $RBR?.necklace?.returned or !["talk", "museum"].includes($museumAntiques?.antiques?.antiqueivorynecklace)>><<ivory-necklace-quinn-empty>><<else>>',
          expected: 1
        },
        {
          srcmatchgroup: /(<<\/if>>\s*[^<]*<br><br>)/,
          applyafter: '<</if>>',
          expected: 1
        }
      ]
    },
    widgetPassage: {
      'Widgets Museum': [
        {
          src: '<<museumAntiqueStatus "antiqueivorynecklace" "talk">>',
          to: '<<if !$RBR?.necklace?.reclaimed>><<museumAntiqueStatus "antiqueivorynecklace" "talk">><</if>>',
          expected: 1
        },
        {
          src: '<<if $museumAntiques.antiques[_labelM] is "talk">>',
          to: '<<if $museumAntiques.antiques[_labelM] is "talk" and !(_labelM is "antiqueivorynecklace" and $RBR?.necklace?.reclaimed)>>',
          expected: 1
        }
      ],
      // 只在格威岚的正常店内菜单出现，不越过追逐、礼物或离场分支。
      'Gwylan Widgets': [{ src: '<<gwylanOptionsClothing>>', applyafter: '<<ivory-necklace-gwylan-link>><<wraith-return-talk-link "Gwylan">>', expected: 1 }],
      'Widgets Robin': [{ src: '<<robinbully>>', applybefore: '<<wraith-return-talk-link "Robin">>', expected: 1 }],
      'Widgets Sydney': [{ src: '<<widget "sydneyOptionsTalk">>', applyafter: '<<wraith-return-talk-link "Sydney">>', expected: 1 }],
      'Widgets Nightmares': [
        {
          src: '<<if $_possibleNightmares.length gte 1>>',
          applybefore: '<<wraith-return-dream-check>><<if _ivoryDreamReady>><<set $_possibleNightmares.pushUnique("Revelation Ivory Dream Start")>><</if>>',
          expected: 1
        }
      ]
    }
  });

  maplebirch.tool.addTo('Journal', 'ivory-necklace-journal');
  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'ivory-necklace-recovery-link', passage: 'Town Hall Wait' });
  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'wraith-return-rest-link', passage: 'Bed' });
  maplebirch.tool.addTo('Header', 'ivory-necklace-history');
  maplebirch.tool.addTo('Header', 'wraith-return-dream-cleanup');
}
