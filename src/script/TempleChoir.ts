// ./src/script/TempleChoir.ts

/** 注册神殿唱诗班入口、歌唱技能卡与原版神殿流程补丁。 */
export default function TempleChoir(maplebirch: typeof window.maplebirch): void {
  maplebirch.once(':sugarcube', () => {
    const { macro } = maplebirch.tool;
    macro.create('gsingingskill', () => macro.statChange(lanSwitch('Singing', '歌唱'), 1, 'green'));
  });

  maplebirch.tool.addTo('SkillsBonusDisplay', 'temple-choir-skill-bonus');
  maplebirch.tool.addTo('SkillsBox', 'temple-choir-skill-box');
  maplebirch.tool.addTo('Journal', 'temple-choir-journal');
  maplebirch.tool.addTo('BeforeLinkZone', { widget: 'temple-choir-hall-link', passage: 'Temple' }, { widget: 'temple-choir-mass-link', passage: 'Temple' });

  maplebirch.tool.inject({
    // 两种月检共用津贴规则，金额显示与发放保持一致。
    locationPassage: Object.fromEntries(
      ['Temple Test', 'Sydney Temple Test 2'].map(passage => [
        passage,
        [
          { srcmatchgroup: /\(\$grace \* 40\)(?=>>)/g, to: "(maplebirch.get('TempleChoir').allowance / 100)", expected: 3 },
          { srcmatchgroup: /`\(\$grace \* 4000\)`/g, to: "`maplebirch.get('TempleChoir').settle()`", expected: 3 }
        ]
      ])
    )
  });
}
