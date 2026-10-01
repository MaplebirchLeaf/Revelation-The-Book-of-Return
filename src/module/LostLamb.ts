import { DEFAULT_LOST_LAMB_STATE, type LostLambState } from './constants/lost-lamb';
import Module from './Module';

export default class LostLamb extends Module {
  public constructor(core: typeof maplebirch) {
    super(core, 'LostLamb', DEFAULT_LOST_LAMB_STATE);
  }

  public get available(): boolean {
    return V.LostLamb.discovered && V.location === 'kylarmanor' && V.bus === 'kylarmanor' && Time.hour >= 18 && Time.hour < 23 && V.combat !== 1 && C.npc.Kylar.state === 'active';
  }

  /** 原版相机礼物事件优先，不能在打开或拒绝礼物前插入新交谈。 */
  public get links(): boolean {
    return this.available && !(T.kylarStatus?.includes('Love') && C.npc.Kylar.love >= 90 && V.kylar_camera === undefined);
  }

  public get reported(): boolean {
    return V.kylar_manor_secret >= 2;
  }

  public get truth(): boolean {
    return V.kylar_manor_secret === 3;
  }

  public choose(stance: LostLambState['stance']): boolean {
    if (!this.available || !['listen', 'report', 'truth', 'boundary', 'temple'].includes(stance) || (stance === 'report' && !this.reported) || (stance === 'truth' && !this.truth)) return false;
    V.LostLamb.stance = stance;
    V.LostLamb.talked = true;
    return true;
  }

  public tidy(): boolean {
    if (!this.available || !V.LostLamb.talked || V.LostLamb.stance === 'temple' || V.LostLamb.tidied) return false;
    V.LostLamb.tidied = true;
    return true;
  }
}
