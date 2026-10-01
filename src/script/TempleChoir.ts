/** 注册神殿唱诗班入口、歌唱技能卡与原版神殿流程补丁。 */
export default function TempleChoir(maplebirch: typeof window.maplebirch): void {
  maplebirch.tool.addTo('SkillsBonusDisplay', 'temple-choir-skill-bonus');
  maplebirch.tool.addTo('SkillsBox', 'temple-choir-skill-box');
  maplebirch.tool.addTo('Journal', 'temple-choir-journal');

  maplebirch.tool.inject({
    locationPassage: {
      Temple: [
        {
          src: '<<templeicon "pray">>',
          applybefore: '<<temple-choir-hall-link>>\n\t\t',
          expected: 1
        },
        {
          // 弥撒分支内的共用锚点，避免匹配整段时间与资格判断。
          src: '<<if $angel gte 6>>',
          applybefore: '<<temple-choir-mass-link>>\n\t\t',
          expected: 1
        }
      ]
    }
  });
}
