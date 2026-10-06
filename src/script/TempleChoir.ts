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
  maplebirch.tool.addTo(
    'BeforeLinkZone',
    { widget: 'temple-choir-hall-link', passage: 'Temple' },
    { widget: 'temple-choir-mass-link', passage: 'Temple' },
    { widget: 'temple-choir-field-practice', passage: 'Bird Tower Sing' }
  );

  maplebirch.tool.inject({
    // 收益在玩家点击原版链接时结算，重绘结果页不会重复练唱。
    widgetPassage: {
      'Widgets Bird': [
        {
          srcmatchgroup: /(<<link \[\[[^\]\n]*\|Bird Tower Sing\]\]>>)([\s\S]*?<<\/link>>)/g,
          to: '$1<<singingskill 8>>$2<<gsingingskill>>',
          expected: 3
        }
      ]
    },
    locationPassage: {
      'Pub Music': [
        {
          srcmatchgroup: /(<<link \[\[[^\]\n]*\|Pub Music Sing\]\]>>)([\s\S]*?<<\/link>>)/g,
          to: '$1<<singingskill 10>>$2<<gsingingskill>>',
          expected: 1
        }
      ],
      'Pub Music Sing': [{ src: '<<if $seabird_lullaby gte 2 and random(0,100) is 1>>', applybefore: "<<temple-choir-field-practice 'pub'>><br><br>", expected: 1 }],
      // 两种月检共用津贴规则，金额显示与发放保持一致。
      ...Object.fromEntries(
        ['Temple Test', 'Sydney Temple Test 2'].map(passage => [
          passage,
          [
            { srcmatchgroup: /\(\$grace \* 40\)(?=>>)/g, to: "(maplebirch.get('TempleChoir').allowance / 100)", expected: 3 },
            { srcmatchgroup: /`\(\$grace \* 4000\)`/g, to: "`maplebirch.get('TempleChoir').settle()`", expected: 3 }
          ]
        ])
      )
    }
  });
}
