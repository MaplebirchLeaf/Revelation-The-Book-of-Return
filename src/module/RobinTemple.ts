// ./src/module/RobinTemple.ts

import Module from './Module';
import { DEFAULT_ROBIN_TEMPLE_STATE } from './constants';

class RobinTemple extends Module {
  constructor(core: typeof maplebirch) {
    super(core, 'RevelationRobinTemple', DEFAULT_ROBIN_TEMPLE_STATE);
  }

  public preInit(): void {
    // A zero value hides this stat on everyone else's Social card. Robin gains it on joining.
    this.core.npc.addStats({
      revelationConviction: {
        default: 0,
        value: 0,
        minValue: 0,
        maxValue: 200,
        position: 7,
        name: this.core.t('revelation-the-book-of-return:robinTemple:stat:conviction'),
        activeIcon: 'img/ui/revelation-robin-conviction.svg',
        color: 'white'
      }
    });
    super.preInit();
    this.core.on(':passagestart', () => this.syncStat(), 'Revelation Robin Temple conviction');
    this.core.on(':language', () => this.syncStat(), 'Revelation Robin Temple conviction language');
  }

  private syncStat(): void {
    const robin = C?.npc?.Robin;
    const stat = this.core.npc.customStats.revelationConviction;
    stat.value = robin?.revelationConviction ?? 0;
    stat.name = this.core.t('revelation-the-book-of-return:robinTemple:stat:conviction');
  }
}

export default RobinTemple;
