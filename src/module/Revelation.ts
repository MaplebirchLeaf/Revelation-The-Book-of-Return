// ./src/module/Revelation.ts

import RobinEN from '@/assets/hint/EN/RobinTemple.md';
import RobinCN from '@/assets/hint/CN/RobinTemple.md';
import ChoirEN from '@/assets/hint/EN/TempleChoir.md';
import ChoirCN from '@/assets/hint/CN/TempleChoir.md';
import LambEN from '@/assets/hint/EN/LostLamb.md';
import LambCN from '@/assets/hint/CN/LostLamb.md';

interface GuideModule {
  guide: {
    add(id: string, sections: () => readonly { id: string; title: string; content: string; module: string }[]): void;
  };
}

/** 指南借用枯木逢春的提示弹窗，剧情模块保持独立。 */
export default class Revelation {
  public constructor(private readonly core: typeof maplebirch) {}

  public preInit(): void {
    this.core.tool.onInit(() => {
      const deadwood = this.core.get('DeadwoodReblooms') as GuideModule | undefined;
      deadwood?.guide.add('revelation-guide', () => [
        { id: 'RobinTemple', title: lanSwitch('Robin · Temple route', '罗宾 · 神殿路线'), content: lanSwitch(RobinEN, RobinCN), module: 'RobinTemple' },
        { id: 'TempleChoir', title: lanSwitch('Temple choir · Singing', '神殿唱诗班 · 歌唱'), content: lanSwitch(ChoirEN, ChoirCN), module: 'TempleChoir' },
        { id: 'LostLamb', title: lanSwitch('Kylar · Manor', '凯拉尔 · 庄园'), content: lanSwitch(LambEN, LambCN), module: 'LostLamb' }
      ]);
    });
  }
}
