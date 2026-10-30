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

    switch (module) {
      case 'TempleDuties': {
        maplebirch.dynamic.regStateEvent('append', 'revelation-ordination-feat', {
          output: 'earnFeat "Revelation Ordination"',
          cond: () =>
            !V.replayScene && !!V.feats?.currentSave && V.feats.currentSave['Revelation Ordination'] === undefined && !!maplebirch.get('TempleDuties') && (V.TempleDuties?.ordained ?? -1) >= 0
        });
        break;
      }
      case 'TempleChoir': {
        maplebirch.dynamic.regStateEvent('append', 'revelation-choir-lead-feat', {
          output: 'earnFeat "Revelation Choir Lead"',
          cond: () => !V.replayScene && !!V.feats?.currentSave && V.feats.currentSave['Revelation Choir Lead'] === undefined && !!maplebirch.get('TempleChoir') && V.TempleChoir?.lead === true
        });
        break;
      }
    }
  }
}

export default Achievements;
