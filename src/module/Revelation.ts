// ./src/module/Revelation.ts

import RobinEN from '@/assets/hint/EN/RobinTemple.md';
import RobinCN from '@/assets/hint/CN/RobinTemple.md';
import ChoirEN from '@/assets/hint/EN/TempleChoir.md';
import ChoirCN from '@/assets/hint/CN/TempleChoir.md';
import LambEN from '@/assets/hint/EN/LostLamb.md';
import LambCN from '@/assets/hint/CN/LostLamb.md';
import DutiesEN from '@/assets/hint/EN/TempleDuties.md';
import DutiesCN from '@/assets/hint/CN/TempleDuties.md';
import WraithEN from '@/assets/hint/EN/Wraith.md';
import WraithCN from '@/assets/hint/CN/Wraith.md';
import Module from './Module';
import { DEFAULT_REVELATION_STATE } from './constants/revelation';

interface GuideModule {
  guide: {
    add(id: string, sections: () => readonly { id: string; title: string; content: string; module: string }[]): void;
  };
}

/** 指南借用枯木逢春的提示弹窗，剧情模块保持独立。 */
export default class Revelation extends Module {
  public constructor(core: typeof maplebirch) {
    super(core, 'RBR', DEFAULT_REVELATION_STATE);
  }

  public override preInit(): void {
    super.preInit();
    this.core.tool.onInit(() => {
      const deadwood = this.core.get('DeadwoodReblooms') as GuideModule | undefined;
      deadwood?.guide.add('revelation-guide', () => [
        { id: 'RobinTemple', title: lanSwitch('Robin · Temple route', '罗宾 · 神殿路线'), content: lanSwitch(RobinEN, RobinCN), module: 'RobinTemple' },
        { id: 'TempleChoir', title: lanSwitch('Temple choir · Singing', '神殿唱诗班 · 歌唱'), content: lanSwitch(ChoirEN, ChoirCN), module: 'TempleChoir' },
        { id: 'LostLamb', title: lanSwitch('Kylar · Manor', '凯拉尔 · 庄园'), content: lanSwitch(LambEN, LambCN), module: 'LostLamb' },
        { id: 'TempleDuties', title: lanSwitch('Temple duties · Priest appointment', '神殿职务 · 司祭任命'), content: lanSwitch(DutiesEN, DutiesCN), module: 'TempleDuties' },
        { id: 'RevelationWraith', title: lanSwitch('The Ivory Wraith', '象牙怨灵'), content: lanSwitch(WraithEN, WraithCN), module: 'RBR' }
      ]);
    });
  }
}
