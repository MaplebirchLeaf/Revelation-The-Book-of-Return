// ./src/module/RobinTemple.ts

import Module from './Module';
import { DEFAULT_ROBIN_TEMPLE_STATE } from './constants';

interface ResidentialModule {
  realEstate: { residenceOf(name: string): unknown };
}

class RobinTemple extends Module {
  constructor(core: typeof maplebirch) {
    super(core, 'RobinTemple', DEFAULT_ROBIN_TEMPLE_STATE);
  }

  public preInit(): void {
    // 属性默认值为 0；社交卡片仅在罗宾加入神殿后显示这项属性。
    this.core.npc.addStats({
      revelationConviction: {
        default: 0,
        minValue: 0,
        maxValue: 200,
        position: 7,
        name: this.core.t('revelation-the-book-of-return:robinTemple:stat:conviction'),
        activeIcon: 'img/ui/robin-temple-conviction.svg',
        color: 'white'
      }
    });
    super.preInit();
    this.core.on(
      ':npcInit',
      (name: string) => {
        if (name !== 'Robin') return;
        const robin = V.NPCName.find((npc: { nam: string; revelationConviction?: number }) => npc.nam === name);
        if (robin) robin.revelationConviction ??= 0;
      },
      'RobinTemple conviction'
    );
    this.core.npc.Schedule.get('Robin').when(() => this.isTempleTime(), 'temple', { id: 'revelation-robin-temple' });
    this.core.dynamic.regTimeEvent('onDay', ':revelation-robin-temple-daily', {
      exact: true,
      action: () => this.dailyUpdate()
    });
  }

  private dailyUpdate(): void {
    const state = V.RobinTemple;
    const robin = C.npc.Robin;
    if (!state || robin?.init !== 1 || V.robinmissing || V.robin.timer.hurt !== 0 || robin.trauma >= 80 || (this.core.get('RobinExpansion') && V.RobinExpansion?.asylum?.status === 'admitted')) return;
    if (state.stage === 'scheduled' || state.stage === 'failed') {
      state.assessment_bonus = Math.min(15, state.assessment_bonus + (state.pendant ? 3 : 1));
      return;
    }
    if (!['member', 'approved', 'promised'].includes(state.stage)) return;
    // 沿用旧版规则：信仰仅在中立区间之外逐日变化，贡献按上学与休息日增减。
    const conviction = robin.revelationConviction ?? 0;
    if (conviction >= 120) robin.revelationConviction = Math.min(200, conviction + 1);
    else if (conviction < 80) robin.revelationConviction = Math.max(0, conviction - 1);
    const increment = Time.weekDay === 1 ? 3 : !Time.schoolDay && !Time.isWeekEnd() ? 2 : !Time.schoolDay ? 1 : -1;
    if (state.grace < 100) state.grace = Math.max(0, Math.min(100, state.grace + increment * (state.pendant && increment >= 0 ? 2 : 1)));
  }

  /** 每次预约只结算一次，避免重访结果页面时重新抽取火焰考验结果。 */
  public assess(): void {
    const state = V.RobinTemple;
    const robin = C.npc.Robin;
    if (state.stage !== 'scheduled' || Time.days < state.exam_day || state.assessment_day === state.exam_day) return;
    state.assessment_day = state.exam_day;
    state.assessment_fire = robin.virginity.vaginal !== true || robin.virginity.penile !== true;
    if (!state.assessment_fire) {
      state.assessment_passed = true;
      return;
    }
    const threshold = robin.dom >= 100 ? 35 : robin.dom >= 90 ? 55 : robin.dom >= 80 ? 75 : 95;
    state.assessment_passed = Math.floor(Math.random() * 100) + 1 + state.assessment_bonus >= threshold;
  }

  private isTempleTime(): boolean {
    if (
      !V.RobinTemple ||
      !['member', 'approved', 'promised'].includes(V.RobinTemple.stage) ||
      C.npc.Robin?.init !== 1 ||
      V.robinmissing ||
      V.robin.timer.hurt !== 0 ||
      C.npc.Robin.trauma >= 80 ||
      (this.core.get('RobinExpansion') && V.RobinExpansion?.asylum?.status === 'admitted')
    )
      return false;

    const housing = this.core.get('VP') as ResidentialModule | undefined;
    const livesWithPlayer = Boolean(housing?.realEstate.residenceOf('Robin'));
    const overnight = !livesWithPlayer && ((Time.weekDay === 7 && Time.hour >= 21) || (Time.weekDay === 1 && Time.hour < 7));
    const sundayService = Time.weekDay === 1 && Time.hour >= 11 && Time.hour < 13;
    const freeWeekday = !Time.schoolDay && !Time.isWeekEnd() && Time.hour >= 9 && Time.hour < 16;
    const vigil = Time.weekDay === 1 && Time.hour >= 20 && V.RobinTemple.vigil_day === Time.days && V.temple_rank === 'initiate';
    return overnight || sundayService || freeWeekday || vigil;
  }
}

export default RobinTemple;
