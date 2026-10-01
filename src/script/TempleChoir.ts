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

  maplebirch.tool.inject({
    locationPassage: {
      // 两种月检共用津贴规则，金额显示与发放保持一致。
      ...Object.fromEntries(
        ['Temple Test', 'Sydney Temple Test 2'].map(passage => [
          passage,
          [
            { srcmatchgroup: /\(\$grace \* 40\)(?=>>)/g, to: "(maplebirch.get('TempleChoir').allowance / 100)", expected: 3 },
            { srcmatchgroup: /`\(\$grace \* 4000\)`/g, to: "`maplebirch.get('TempleChoir').settle()`", expected: 3 }
          ]
        ])
      ),
      Temple: [
        {
          src: '<<templeicon "pray">>',
          applybefore: '<<temple-choir-hall-link>>\n\t\t',
          expected: 1
        },
        // 弥撒分支内的共用锚点，避免匹配整段时间与资格判断。
        {
          src: '<<if $angel gte 6>>',
          applybefore: '<<temple-choir-mass-link>>\n\t\t',
          expected: 1
        }
      ]
    }
  });
}
