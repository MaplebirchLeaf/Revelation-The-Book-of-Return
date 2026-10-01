// ./src/module/SecretPromise.ts

import type RobinTemple from './RobinTemple';
import type { SecretPromiseState } from './constants/robin-temple';

/** 亵渎仪式：在原版凯拉尔父母异教仪式的旧址上，PC 与罗宾、悉尼缔结第二份承诺。 */
export default class SecretPromise {
  constructor(private readonly temple: RobinTemple) {}

  public get state(): SecretPromiseState {
    return V.RobinTemple.secret;
  }

  public get known(): boolean {
    return Boolean(V.hcEndings?.includes('S') && V.wraithPrison?.vision);
  }

  public get eligible(): boolean {
    return (
      this.known &&
      this.temple.member &&
      this.temple.available &&
      V.robinromance === 1 &&
      V.sydneyromance === 1 &&
      C.npc.Robin.love >= 80 &&
      C.npc.Robin.dom >= 60 &&
      C.npc.Robin.trauma < 40 &&
      C.npc.Sydney.love >= 125 &&
      C.npc.Sydney.purity >= 80 &&
      C.npc.Sydney.virginity.temple === true &&
      C.npc.Robin.virginity.temple === true &&
      V.player.virginity.temple === true &&
      V.temple_rank &&
      V.temple_rank !== 'prospective' &&
      // 只有走到淫乱 6 的 PC 才会把罗宾与悉尼带进这场亵渎仪式。
      hasSexStat('promiscuity', 6) &&
      !V.RobinTemple.punish &&
      !V.possessed &&
      (this.state.first === 'Robin'
        ? V.RobinTemple.templePromised === 'Robin' && !V.templePromised
        : this.state.first === 'Sydney'
          ? V.templePromised === 'Sydney' && !V.RobinTemple.templePromised
          : (V.templePromised === 'Sydney' && !V.RobinTemple.templePromised) || (V.RobinTemple.templePromised === 'Robin' && !V.templePromised))
    );
  }

  /** 偷窃后的追杀和失去子嗣的报复必须先在原版路线处理。 */
  public get threatened(): boolean {
    return Boolean(
      V.possessed || V.wraith?.hunt > 0 || V.foresthunt > 0 || V.wraith?.state === 'haunt' || V.wraith?.offspring === 'dead' || (C.npc['Ivory Wraith']?.lust ?? 0) >= 20 || (V.wraith?.timer ?? 0) >= 10
    );
  }

  public get ready(): boolean {
    const s = this.state;
    return (
      this.eligible &&
      s.stage === 'research' &&
      V.stress < V.stressmax - 40 &&
      V.pain < 50 &&
      V.tiredness < 1500 &&
      s.prepared &&
      s.survey_day >= 0 &&
      s.robin_day >= 0 &&
      s.sydney_day >= 0 &&
      Time.days >= Math.max(s.robin_day, s.sydney_day, s.survey_day) + 3 &&
      Time.isBloodMoon() &&
      Time.hour >= 21 &&
      Time.hour < 23 &&
      !Weather.isFrozen('lake') &&
      Weather.precipitation !== 'rain' &&
      !V.laketeenspresent &&
      !this.threatened &&
      s.night !== Time.days
    );
  }

  public get active(): boolean {
    return (
      ['travelling', 'ritual'].includes(this.state.stage) &&
      this.state.night === Time.days &&
      Time.isBloodMoon() &&
      // 只有出发受 21:00-23:00 限制（见 ready）；仪式一旦开始就要能做完，不能被午夜截断。
      (Time.hour >= 21 || Time.hour < 5) &&
      this.eligible &&
      V.stress < V.stressmax - 12 &&
      V.pain < 50 &&
      V.tiredness < 1500 &&
      !Weather.isFrozen('lake') &&
      Weather.precipitation !== 'rain' &&
      !this.threatened
    );
  }

  public begin(): boolean {
    if (this.state.stage !== 'none' || !this.eligible) return false;
    this.state.first = V.templePromised === 'Sydney' ? 'Sydney' : 'Robin';
    this.state.stage = 'research';
    return true;
  }

  public agree(name: 'Robin' | 'Sydney'): boolean {
    if (!this.eligible || this.state.stage !== 'research') return false;
    this.state[name === 'Robin' ? 'robin_day' : 'sydney_day'] = Time.days;
    return true;
  }

  public survey(): boolean {
    if (!this.eligible || this.state.stage !== 'research' || Time.dayState !== 'day' || Weather.isFrozen('lake') || this.threatened) return false;
    if (this.state.survey_day < 0) this.state.survey_day = Time.days;
    return true;
  }

  public prepare(): boolean {
    if (!this.eligible || this.state.survey_day < 0 || this.state.robin_day < 0 || this.state.sydney_day < 0 || this.state.stage !== 'research') return false;
    this.state.prepared = true;
    return true;
  }

  public depart(): boolean {
    if (!this.ready) return false;
    this.state.stage = 'travelling';
    this.state.night = Time.days;
    this.state.trial = '';
    return true;
  }

  public enter(): boolean {
    if (!this.active || this.state.stage !== 'travelling') return false;
    this.state.stage = 'ritual';
    return true;
  }

  public choose(choice: 'burden' | 'exit'): boolean {
    if (!this.active || this.state.stage !== 'ritual' || (choice === 'burden' ? this.state.trial !== '' : this.state.trial !== 'burden')) return false;
    this.state.trial = choice;
    return true;
  }

  public finish(): boolean {
    if (!this.active || this.state.stage !== 'ritual' || this.state.trial !== 'exit') return false;
    V.RobinTemple.dual_promise = true;
    V.RobinTemple.templePromised = 'Robin';
    V.RobinTemple.stage = 'promised';
    V.templePromised = 'Sydney';
    this.state.stage = 'complete';
    this.state.rite_done = true;
    return true;
  }

  public abort(): void {
    if (!['travelling', 'ritual'].includes(this.state.stage)) return;
    this.state.stage = 'research';
    this.state.trial = '';
    this.state.rite_active = false;
    // 再次出行需重新私下确认，不能沿用一次冒险前的同意。
    this.state.robin_day = this.state.sydney_day = -1;
    this.state.prepared = false;
  }
}
