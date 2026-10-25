// ./src/compat/DoLX.ts

/** 保留 DoLX 津贴算法，唱诗报酬随成功月检的原生付款一并领取。 */
export default function DoLX(core: typeof window.maplebirch): void {
  const data = core.services.addonPlugin.SC2DataManager.getSC2DataInfoAfterPatch();
  if (!data.scriptFileItems.getByNameWithOrWithoutPath('xchange.js')) return;
  const zone = core.tool.zone;
  if (data.passageDataItems.map.has('Museum Sell Ivory Necklace')) {
    if (!data.passageDataItems.map.get('Widgets Museum')?.content.includes('<<museumAntiqueStatus "antiqueivorynecklace" "talk">>')) {
      zone.widgetPassage['Widgets Museum'] = (zone.widgetPassage['Widgets Museum'] ?? []).filter(
        rule => rule.src !== '<<museumAntiqueStatus "antiqueivorynecklace" "talk">>' || !rule.to?.includes('$RBR?.necklace?.reclaimed')
      );
    }
    for (const title of ['Museum', 'Museum Sell']) {
      core.tool.inject({
        locationPassage: {
          [title]: [
            {
              src: '$museumAntiques.antiques.antiqueivorynecklace is "found" ? 2000 : 0',
              to: '$museumAntiques.antiques.antiqueivorynecklace is "found" and !$RBR?.necklace?.reclaimed ? 2000 : 0',
              expected: 1
            }
          ]
        }
      });
    }
  }
  if (core.get('RobinTemple')) {
    // DoLX 增加了誓约检查分支，各处继续使用罗宾独立的誓约状态。
    for (const rule of zone.widgetPassage['Widgets Text'] ?? []) {
      if (rule.srcmatchgroup?.source === '\\$templePromised isnot _args\\[0\\]') rule.expected = 6;
    }
    for (const rule of zone.widgetPassage['Widgets Combat'] ?? []) {
      if (rule.src !== '$templePromised isnot _args[0]') continue;
      delete rule.src;
      rule.srcmatchgroup = /\$templePromised isnot _args\[0\]/g;
      rule.expected = 2;
    }
  }
  if (core.get('TempleDuties')) {
    // 保留 DoLX 已计算的挑衅伤害，只在结果之后结算驱邪之术加成。
    for (const rule of zone.widgetPassage.Widgets ?? []) {
      if (!rule.applyafter?.includes('<<temple-watch-defiance')) continue;
      delete rule.src;
      rule.srcmatch =
        /<<if !Number\.isFinite\(_thedamage\) or _thedamage lt 0>>\s*<<set _thedamage to Math\.max\(0, 2 \* \(Number\.isFinite\(_defiance\) \? _defiance : Number\(_args\[0\]\) \|\| 1\)\)>>\s*<<\/if>>/;
    }
    for (const rule of zone.widgetPassage['Widgets Struggle'] ?? []) {
      if (rule.to?.includes('<<temple-watch-damage')) rule.srcmatch = /<<set \$struggle\.enemy\[_i\]\.health -= 1>>(?=\s*<<set _struggleDefenseResult to "guard">>)/;
    }
  }
  if (core.get('TempleChoir')) {
    for (const title of ['Temple Test', 'Sydney Temple Test 2']) {
      const rules = core.tool.zone.locationPassage[title] ?? [];
      core.tool.zone.locationPassage[title] = rules.filter(rule => !rule.to?.includes("maplebirch.get('TempleChoir').allowance") && !rule.to?.includes("maplebirch.get('TempleChoir').settle()"));
      core.tool.inject({
        locationPassage: {
          [title]: [
            {
              srcmatch: /<<printmoney _templeAllowance>>/g,
              to: '<<printmoney `_templeAllowance + $TempleChoir.bonus`>>',
              expected: 3
            },
            {
              srcmatch: /<<money _templeAllowance "templeAllowance" \{ divineTfAdjusted: true \}>>/g,
              to: '<<money `_templeAllowance + $TempleChoir.bonus` "templeAllowance" { divineTfAdjusted: true }>><<set $TempleChoir.bonus to 0>>',
              expected: 3
            }
          ]
        }
      });
    }
  }
  // 罗宾月检与共同月检共用这个 widget，沿用当前 DoLX 页面里的原生公式。
  const formula = data.passageDataItems.map.get('Temple Test')?.content.match(/<<set _templeAllowance to [^\r\n]+?>>/)?.[0];
  if (core.get('RobinTemple') && formula) {
    // 脚本注册时模组 Twee 尚未合并到游戏，修改等待合并的自有缓存。
    const cache = core.modUtils.getMod('revelation-the-book-of-return')?.cache;
    if (!cache) return;
    const title = 'RobinTemple Examination Widgets';
    const widget = cache.passageDataItems.map.get(title);
    if (!widget?.tags.includes('widget')) return;
    const replacements: Array<[RegExp, string, number]> = [
      [/<<if !\$RobinTemple\.monthly_checked>>/g, `$&${formula}`, 1],
      [/maplebirch\.get\('TempleChoir'\)\?\.allowance \?\? \(\$grace \* 4000\)/g, "(_templeAllowance + (maplebirch.get('TempleChoir') ? $TempleChoir.bonus : 0))", 6],
      [
        /<<money `\(maplebirch\.get\('TempleChoir'\)\?\.settle\(\) \?\? \(\$grace \* 4000\)\)`>>/g,
        "<<money `(_templeAllowance + (maplebirch.get('TempleChoir') ? $TempleChoir.bonus : 0))` \"templeAllowance\" { divineTfAdjusted: true }>><<if maplebirch.get('TempleChoir')>><<set $TempleChoir.bonus to 0>><</if>>",
        1
      ]
    ];
    let content = widget.content;
    for (const [pattern, replacement, expected] of replacements) {
      const matches = [...content.matchAll(pattern)].length;
      if (matches !== expected) {
        core.log(`${title}: 匹配 ${matches}，预期 ${expected} (${pattern})`, 'WARN');
        return;
      }
      content = core.services.addonPlugin.replace(content, [[pattern, replacement]], title);
    }
    widget.content = content;
    cache.passageDataItems.back2Array();
  }
}
