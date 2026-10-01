// ./src/module/Revelation.ts

import { DEFAULT_REVELATION_STATE } from './constants/revelation';
import Module from './Module';
import RobinEN from '@/assets/hint/EN/RobinTemple.md';
import RobinCN from '@/assets/hint/CN/RobinTemple.md';
import ChoirEN from '@/assets/hint/EN/TempleChoir.md';
import ChoirCN from '@/assets/hint/CN/TempleChoir.md';

interface GuideModule {
  guide: {
    render(id: string, intro: string, sections: readonly { id: string; title: string; content: string; module: string }[]): string;
  };
}

/** 指南借用枯木逢春的提示弹窗，剧情模块保持独立。 */
export default class Revelation extends Module {
  public constructor(core: typeof maplebirch) {
    super(core, 'RBR', DEFAULT_REVELATION_STATE);
  }

  public preInit(): void {
    super.preInit();
    this.core.tool.onInit(() => {
      if (this.core.get('DeadwoodReblooms')) setup.maplebirch.hint.push('<<= maplebirch.get("RBR").wiki>>');
    });
  }

  public get wiki(): string {
    const deadwood = this.core.get('DeadwoodReblooms') as GuideModule | undefined;
    return (
      deadwood?.guide.render('revelation-guide', lanSwitch('Temple routes and choir work.', '神殿路线与唱诗工作。'), [
        { id: 'RobinTemple', title: lanSwitch('Robin · Temple route', '罗宾 · 神殿路线'), content: lanSwitch(RobinEN, RobinCN), module: 'RobinTemple' },
        { id: 'TempleChoir', title: lanSwitch('Temple choir · Singing', '神殿唱诗班 · 歌唱'), content: lanSwitch(ChoirEN, ChoirCN), module: 'TempleChoir' }
      ]) ?? ''
    );
  }
}
