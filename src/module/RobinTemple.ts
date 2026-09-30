// ./src/module/RobinTemple.ts

import Module from './Module';
import { DEFAULT_ROBIN_TEMPLE_STATE } from './constants';
import type { RobinTemplePunishment } from './constants/robin-temple';

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
      conviction: {
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
    this.core.npc.Schedule.get('Robin').when(() => this.isTempleTime(), 'temple', { id: 'revelation-robin-temple' });
    this.core.dynamic.regTimeEvent('onDay', ':revelation-robin-temple-daily', {
      exact: true,
      action: () => this.dailyUpdate()
    });
  }

  private dailyUpdate(): void {
    const state = V.RobinTemple;
    const robin = C.npc.Robin;
    // 检查日历不因罗宾受伤、失踪或暂停值班而停止。
    if (state?.chastity_timer > 0) state.chastity_timer--;
    if (!state || robin?.init !== 1 || V.robinmissing || V.robin.timer.hurt !== 0 || robin.trauma >= 80 || (this.core.get('Robin') && V.RobinExpansion?.asylum?.status === 'admitted')) return;
    if (state.stage === 'scheduled' || state.stage === 'failed') {
      state.assessment_bonus = Math.min(15, state.assessment_bonus + (state.pendant ? 3 : 1));
      return;
    }
    if (!['member', 'approved', 'promised'].includes(state.stage)) return;
    // 罗宾的信仰在中立区间之外逐日变化，贡献按上学与休息日增减。
    const conviction = robin.conviction ?? 0;
    if (conviction >= 120) robin.conviction = Math.min(200, conviction + 1);
    else if (conviction < 80) robin.conviction = Math.max(0, conviction - 1);
    this.reviewFaith();
    const increment = Time.weekDay === 1 ? 3 : !Time.schoolDay && !Time.isWeekEnd() ? 2 : !Time.schoolDay ? 1 : -1;
    if (state.grace < 100) state.grace = Math.max(0, Math.min(100, state.grace + increment * (state.pendant && increment >= 0 ? 2 : 1)));
  }

  /** 罗宾在信仰阈值 80/120 处以 35% 概率触发转折，同一天只抽取一次。 */
  public reviewFaith(): void {
    const state = V.RobinTemple;
    const robin = C.npc.Robin;
    if (!state || !['member', 'approved', 'promised'].includes(state.stage) || robin?.init !== 1) return;
    const conviction = robin.conviction ?? 0;
    const band = conviction >= 120 ? 'belief' : conviction <= 80 ? 'doubt' : 'steady';
    if (band === 'steady' || band === state.faith_band || state.faith_review_day === Time.days) return;
    state.faith_review_day = Time.days;
    if (Math.random() >= 0.35) return;
    state.faith_band = band;
    state.faith_transition = band;
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

  /** 沿用原版规则：拒绝、坦白和检查失败均立即进入共同净化。 */
  public startPunishment(joint = false): void {
    const state = V.RobinTemple;
    if (state.punish || state.templePromised !== 'Robin' || (joint && V.templePromised !== 'Sydney')) return;
    const partner = () => ({ pain: 2, arousal: 0, hold: 0, belt: 0, hit: 0, plead: 0, touch: 0 });
    state.punish = {
      joint,
      started: false,
      timer: 16,
      repeats: 0,
      phase: 1,
      action: '',
      result: 'active',
      choice: 'close',
      target: 'Robin',
      partners: joint ? { Robin: partner(), Sydney: partner() } : { Robin: partner() }
    };
  }

  /** 沿用原版的 16/14 回合、同伴阈值 6 和十次失败结束规则。 */
  public punishmentRound(): void {
    const p: RobinTemplePunishment | null = V.RobinTemple.punish;
    if (!p || p.result !== 'active') return;
    for (const partner of Object.values(p.partners)) {
      partner.pain = Math.max(0, partner.pain);
      partner.arousal = Math.max(0, partner.arousal + 1);
    }
    p.timer--;
    if (V.stress >= V.stressmax) p.result = 'hospital';
    else if (p.timer <= 0) p.result = 'passed';
    else if ((V.pain >= 100 && V.willpowerpain === 0) || V.arousal >= V.arousalmax || Object.values(p.partners).some(npc => npc.pain >= 6 || npc.arousal >= 6)) {
      p.result = 'rest';
      p.repeats++;
    } else {
      // 按本轮参与者抽取动作，三人净化时包含悉尼。
      const actions: RobinTemplePunishment['action'][] = ['Player', 'Robin', ...(p.joint ? ['Sydney' as const] : []), 'Vibrate'];
      p.action = p.action === '' ? 'Player' : actions[random(1, actions.length) - 1];
    }
  }

  /** 选择只影响当前净化的参与者；PC 数值效果由原版宏在链接内执行。 */
  public punishmentChoice(choice: RobinTemplePunishment['choice'], target: RobinTemplePunishment['target'] = 'both'): boolean {
    const p: RobinTemplePunishment | null = V.RobinTemple.punish;
    if (!p || p.result !== 'active') return false;
    const names = target === 'both' ? (Object.keys(p.partners) as ('Robin' | 'Sydney')[]) : [target];
    const partners = names.flatMap(name => (p.partners[name] ? [p.partners[name]] : []));
    if (partners.length !== names.length) return false;
    const limit = choice === 'hit' || choice === 'plead' ? 4 : 5;
    if (choice !== 'close' && partners.some(npc => npc[choice] >= limit)) return false;
    if (choice === 'hit' && !names.includes(p.action as 'Robin' | 'Sydney')) return false;
    if (choice === 'plead' && p.action !== 'Player') return false;
    if (choice === 'touch' && partners.some(npc => npc.touch > 0 && !hasSexStat('promiscuity', npc.touch + 1))) return false;
    p.choice = choice;
    p.target = target;
    for (const npc of partners) {
      if (choice !== 'close') npc[choice]++;
      if (choice === 'hold') npc.pain--;
      else if (choice === 'belt') npc.arousal -= 2;
      else if (choice === 'touch') npc.pain -= 4;
      // 原版先将行动后的负数归零，再判断下一次鞭打是否有人代受。
      npc.pain = Math.max(0, npc.pain);
      npc.arousal = Math.max(0, npc.arousal);
    }
    return true;
  }

  /** 沿用原版互相挡鞭的条件，罗宾与悉尼分别结算。 */
  public punishmentAttack(): string {
    const p: RobinTemplePunishment | null = V.RobinTemple.punish;
    if (!p || p.result !== 'active') return '';
    if (p.action === 'Player') {
      const defenders = Object.entries(p.partners).filter(([, npc]) => npc.pain <= 3 && (V.pain >= 50 || npc.arousal >= 4));
      if (defenders.length) {
        for (const [, npc] of defenders) {
          npc.pain += 2;
          npc.arousal--;
        }
        return defenders.map(([name]) => name).join(',');
      }
      return 'Player';
    }
    if (p.action === 'Vibrate') {
      for (const npc of Object.values(p.partners)) npc.arousal++;
      return 'Vibrate';
    }
    if (p.action === 'Robin' || p.action === 'Sydney') {
      if (p.choice === 'hit') return 'blocked';
      const npc = p.partners[p.action];
      if (npc) {
        npc.pain += 2;
        npc.arousal--;
      }
      return p.action;
    }
    return '';
  }

  /** 沿用原版重试规则：休息后恢复 14 回合，累计十次失败则结束净化。 */
  public punishmentRest(): void {
    const p: RobinTemplePunishment | null = V.RobinTemple.punish;
    if (!p || p.result !== 'rest') return;
    for (const npc of Object.values(p.partners)) {
      // 原版先减去恢复值，下一回合增加情欲后才归零，不能在休息时提前截断。
      npc.pain -= 4;
      npc.arousal -= 4;
      npc.hold = npc.belt = npc.hit = npc.plead = npc.touch = 0;
    }
    p.timer = 14;
    p.result = p.repeats >= 10 ? 'passed' : 'active';
  }

  /** 沿用原版结算：正常结束和昏倒送医均恢复参与者的神殿誓言状态。 */
  public finishPunishment(): boolean {
    const state = V.RobinTemple;
    const p: RobinTemplePunishment | null = state.punish;
    if (!p || (p.result !== 'passed' && p.result !== 'hospital')) return false;
    V.player.virginity.temple = true;
    C.npc.Robin.virginity.temple = true;
    if (p.joint) {
      C.npc.Sydney.virginity.temple = true;
      V.daily.sydney.punish = 1;
    }
    state.punish = null;
    return true;
  }

  private isTempleTime(): boolean {
    if (
      !V.RobinTemple ||
      !['member', 'approved', 'promised'].includes(V.RobinTemple.stage) ||
      C.npc.Robin?.init !== 1 ||
      V.robinmissing ||
      V.robin.timer.hurt !== 0 ||
      C.npc.Robin.trauma >= 80 ||
      (this.core.get('Robin') && V.RobinExpansion?.asylum?.status === 'admitted')
    )
      return false;

    const housing = this.core.get('VanillaPlus') as ResidentialModule | undefined;
    const livesWithPlayer = Boolean(housing?.realEstate.residenceOf('Robin'));
    const overnight = !livesWithPlayer && ((Time.weekDay === 7 && Time.hour >= 21) || (Time.weekDay === 1 && Time.hour < 7));
    const sundayService = Time.weekDay === 1 && Time.hour >= 11 && Time.hour < 13;
    const freeWeekday = !Time.schoolDay && !Time.isWeekEnd() && Time.hour >= 9 && Time.hour < 16;
    const vigil = V.RobinTemple.vigil_result !== 'passed' && ((Time.weekDay === 1 && Time.hour >= 20) || (Time.weekDay === 2 && Time.hour < 7));
    return overnight || sundayService || freeWeekday || vigil;
  }
}

export default RobinTemple;
