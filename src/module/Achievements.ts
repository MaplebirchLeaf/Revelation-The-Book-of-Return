import definitions from '../assets/achievements.json';

type AchievementModule = 'RBR' | 'TempleDuties' | 'TempleChoir' | 'LostLamb';

class Achievements {
  /** 各模块注册成就定义，标题与说明随当前语言切换。 */
  public static add(maplebirch: typeof window.maplebirch, module: AchievementModule): void {
    maplebirch.tool.onInit(() => {
      for (const entry of definitions) {
        if (entry.module !== module) continue;
        setup.feats[entry.id] ??= {
          get title() {
            return lanSwitch(entry.title[0], entry.title[1]);
          },
          get desc() {
            return lanSwitch(entry.description[0], entry.description[1]);
          },
          difficulty: entry.difficulty,
          series: '',
          filter: entry.filter,
          ...('softLockable' in entry && entry.softLockable ? { softLockable: true } : {})
        };
      }
    });
  }
}

export default Achievements;
