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
          // 再次拿走后清除当前归还状态，随后原版 Lake Ruin Ivory 会将痴迷重新设为20。
          src: '<<set $necklaceThief to "player">>',
          applyafter: '<<wraith-necklace-retake>>',
          expected: 1
        },
        { src: '<<if _leave>>', applyafter: '<<ivory-necklace-link>>', expected: 1 }
      ],
      'Town Hall Projects Diving 2': [
        {
          // 前置归还判断，保留怨灵的倒影 1.3.4 使用的 `"player">>` 尾部锚点。
          // 接受已注入的前缀，使重复处理保持幂等，其它模组追加的条件原样保留。
          srcmatch: /(?:!\$RBR\?\.necklace\?\.returned and )?(\$museumAntiques\.antiques\.antiqueivorynecklace isnot "found" and \$necklaceThief is "player")/,
          to: '!$RBR?.necklace?.returned and $1',
          expected: 1
        }
      ],
      'Town Hall Projects Diving Buy': [
        {
          // 潜水队仍可取得放回的项链，不把潜水队的行为计作PC再次盗取。
          src: '<<set $necklaceThief to "diver">>',
          applyafter: '<<if $RBR?.necklace and !$replayScene and !$statFreeze>><<set $RBR.necklace.returned to false>><</if>>',
          expected: 1
        }
      ],
      'Town Hall Computer 2': [
        {
          // 原版这一段总是假定展示盒里有项链，这里只包裹该段，不改电脑任务。
          src: '<<if $necklaceThief is "player">>',
          to: '<<if $RBR?.necklace?.returned>><<ivory-necklace-quinn-empty>><<else>><<if $necklaceThief is "player">>',
          expected: 1
        },
        {
          srcmatchgroup: /(<<\/if>>\s*[^<]*<br><br>)/,
          to: '$1<</if>>',
          expected: 1
        }
      ]
    },
    widgetPassage: {
      // 只在格威岚的正常店内菜单出现，不越过追逐、礼物或离场分支。
      'Gwylan Widgets': [{ src: '<<gwylanOptionsClothing>>', applyafter: '<<ivory-necklace-gwylan-link>>', expected: 1 }]
    }
  });

  maplebirch.tool.addTo('Journal', 'ivory-necklace-journal');
}
