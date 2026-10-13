// ./src/compat/DoLX.ts

/** 保留 DoLX 津贴算法，唱诗报酬随成功月检的原生付款一并领取。 */
export default function DoLX(core: typeof window.maplebirch): void {
  core.once(':addon:preparePatch', () => {
    const data = core.services.addonPlugin.SC2DataManager.getSC2DataInfoAfterPatch();
    if (!data.scriptFileItems.getByNameWithOrWithoutPath('xchange.js')) return;
    if (core.get('TempleChoir')) {
      for (const title of ['Temple Test', 'Sydney Temple Test 2']) {
        const rules = core.tool.zone.locationPassage[title] ?? [];
        core.tool.zone.locationPassage[title] = [
          ...rules.filter(rule => !rule.to?.includes("maplebirch.get('TempleChoir').allowance") && !rule.to?.includes("maplebirch.get('TempleChoir').settle()")),
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
        ];
      }
    }
    // 罗宾月检与共同月检共用这个 widget，沿用当前 DoLX 页面里的原生公式。
    const formula = data.passageDataItems.map.get('Temple Test')?.content.match(/<<set _templeAllowance to [^\r\n]+?>>/)?.[0];
    if (core.get('RobinTemple') && formula) {
      core.tool.inject({
        widgetPassage: {
          'RobinTemple Examination Widgets': [
            { src: '<<if !$RobinTemple.monthly_checked>>', applyafter: formula, expected: 1 },
            {
              srcmatch: /maplebirch\.get\('TempleChoir'\)\?\.allowance \?\? \(\$grace \* 4000\)/g,
              to: "(_templeAllowance + (maplebirch.get('TempleChoir') ? $TempleChoir.bonus : 0))",
              expected: 6
            },
            {
              src: "<<money `(maplebirch.get('TempleChoir')?.settle() ?? ($grace * 4000))`>>",
              to: "<<money `(_templeAllowance + (maplebirch.get('TempleChoir') ? $TempleChoir.bonus : 0))` \"templeAllowance\" { divineTfAdjusted: true }>><<if maplebirch.get('TempleChoir')>><<set $TempleChoir.bonus to 0>><</if>>",
              expected: 1
            }
          ]
        }
      });
    }
  });
}
