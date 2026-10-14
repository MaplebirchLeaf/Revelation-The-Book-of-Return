// ./src/module/SecretPromise.ts

import type RobinTemple from './RobinTemple';
import type { SecretPromiseState } from './constants/robin-temple';

/** 亵渎仪式属于异教仪式路线，庄园见闻与湖底调查共同提供线索。 */
export default class SecretPromise {
  public readonly difficulty = { promise: 700, danger: 900 } as const;

  constructor(private readonly temple: RobinTemple) {}

  public get state(): SecretPromiseState {
    return V.RobinTemple.secret;
  }

  /** 不屈意志抵抗耳液操控，不免除仪式代价或幽灵追猎。 */
  public get unyielding(): boolean {
    const vanillaPlus = this.temple.core.get('VanillaPlus') as { hasTrait(trait: 'willpower'): boolean } | undefined;
    return vanillaPlus?.hasTrait('willpower') ?? false;
  }

  public get known(): boolean {
    // 检查本局亲历的主教揭密，不使用跨存档的成就解锁状态。
    return Boolean(V.hcEndings?.includes('S') && V.wraithPrison?.vision && V.kylar_manor_secret === 3);
  }

  public get settled(): boolean {
    return this.state.witness_day >= 0 && Time.days >= this.state.witness_day + 3;
  }

  /** 参考罗宾原版主动亲密分支，欲望只约束参与仪式，不约束初次调查。 */
  public get wants(): Readonly<Record<'Robin' | 'Sydney', boolean>> {
    return { Robin: C.npc.Robin.lust >= 60, Sydney: C.npc.Sydney.lust >= 60 };
  }

  /** 沿用原版日程与交谈地点，谈完返回当前地点，不固定在午休图书馆。 */
  public get sydneyMeeting(): { available: boolean; passage: string } {
    const places: Record<string, [string, string]> = {
      school: ['library', 'School Library'],
      temple: ['temple', 'Temple'],
      adult_shop: ['shop', 'Adult Shop']
    };
    const [location, passage] = places[V.location] ?? ['', 'Temple'];
    return {
      available:
        Boolean(location) &&
        T.sydney_location === location &&
        (V.location !== 'school' || V.bus === 'schoollibrary') &&
        (V.location !== 'temple' || !['sleep', 'mass', 'anguish'].includes(V.sydney_templeWork)) &&
        V.combat !== 1 &&
        this.state.stage === 'research' &&
        this.state.sydney_day < 0,
      passage
    };
  }

  /** 检查实际器具，不以讨论过拆除或完成过承诺代替当前状态。 */
  public get unfitted(): boolean {
    if (window.playerChastity() || window.playerChastity(['penis', 'vagina', 'anus'])) return false;
    return ['Robin', 'Sydney'].every(name => ['anus', 'vagina', 'penis'].every(slot => C.npc[name].chastity[slot] === ''));
  }

  public get eligible(): boolean {
    const first = V.templePromised === 'Sydney' && !V.RobinTemple.templePromised ? 'Sydney' : !V.templePromised && V.RobinTemple.templePromised === 'Robin' ? 'Robin' : '';
    return Boolean(
      first &&
      (!this.state.first || this.state.first === first) &&
      this.known &&
      this.temple.member &&
      this.temple.available &&
      this.unfitted &&
      V.robinromance === 1 &&
      V.sydneyromance === 1 &&
      C.npc.Robin.love >= 80 &&
      // 混乱誓约要求罗宾持续处于高创伤。自信不限制这条路线。
      C.npc.Robin.trauma >= 40 &&
      C.npc.Sydney.love >= 125 &&
      // 对齐 sydneyStatusCheck 的堕落分支，纯洁与中立悉尼都不会接受。
      C.npc.Sydney.purity < 50 &&
      C.npc.Sydney.corruption >= 10 &&
      // 悉尼已有承诺时不再走堕落仪式，作为第二位对象时须先完成它。
      (first === 'Sydney' || V.sydneySeen?.includes('corruptroom')) &&
      C.npc.Sydney.virginity.temple === true &&
      C.npc.Robin.virginity.temple === true &&
      V.player.virginity.temple === true &&
      V.temple_rank &&
      V.temple_rank !== 'prospective' &&
      // 只有走到淫乱 6 的 PC 才会把罗宾与悉尼带进这场亵渎仪式。
      hasSexStat('promiscuity', 6) &&
      !V.RobinTemple.punish &&
      !V.possessed
    );
  }

  /** 追猎、幽灵的敌意和失去子嗣的报复都会阻止出行。 */
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
      (s.witness_day < 0
        ? Time.days >= Math.max(s.robin_day, s.sydney_day, s.survey_day) + 3
        : this.settled && s.robin_day >= s.witness_day + 3 && s.sydney_day >= s.witness_day + 3 && this.wants.Robin && this.wants.Sydney) &&
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

  /** 首次仪式的第二位尚未登记；只在已同意的双人战斗中保留三份完整誓言。 */
  public get protectsRiteVows(): boolean {
    const s = this.state;
    return Boolean(
      this.temple.core.get('RobinTemple') &&
      s.stage === 'ritual' &&
      s.rite_active === true &&
      V.combat === 1 &&
      V.enemytype === 'man' &&
      V.consensual === 1 &&
      ((V.passage === 'RobinTemple Secret Sex' && s.rite_stage === 4) || (V.passage === 'RobinTemple Secret Madness' && s.rite_stage === 7)) &&
      V.player.virginity.temple === true &&
      C.npc.Robin.virginity.temple === true &&
      C.npc.Sydney.virginity.temple === true &&
      V.NPCList.some((npc: { fullDescription: string; virginity: { temple: boolean | string } }) => npc.fullDescription === 'Robin' && npc.virginity.temple === true) &&
      V.NPCList.some((npc: { fullDescription: string; virginity: { temple: boolean | string } }) => npc.fullDescription === 'Sydney' && npc.virginity.temple === true) &&
      ((s.first === 'Robin' && V.RobinTemple.templePromised === 'Robin' && !V.templePromised) || (s.first === 'Sydney' && V.templePromised === 'Sydney' && !V.RobinTemple.templePromised))
    );
  }

  public get active(): boolean {
    return (
      ['travelling', 'decision', 'ritual'].includes(this.state.stage) &&
      // 原版 Time.days 在 07:00 递增，午夜后的同行仍属于出发时的同一游戏日。
      this.state.night === Time.days &&
      ((Time.hour >= 21 && Time.isBloodMoon()) || Time.hour < 5) &&
      this.eligible &&
      // 开始前重新确认欲望；仪式已经开始后，正常消耗欲望不撤销先前的回答。
      (this.state.stage !== 'ritual' || this.state.rite_active || (this.wants.Robin && this.wants.Sydney)) &&
      (this.state.stage === 'decision' || (this.state.prepared && this.state.robin_day >= 0 && this.state.sydney_day >= 0)) &&
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
    if (!this.eligible || this.state.stage !== 'research' || (this.state.witness_day >= 0 && (!this.settled || !this.wants[name]))) return false;
    const key = name === 'Robin' ? 'robin_day' : 'sydney_day';
    if (this.state[key] >= 0) return false;
    this.state[key] = Time.days;
    return true;
  }

  public survey(): boolean {
    if (!this.eligible || this.state.stage !== 'research' || this.state.survey_day >= 0 || Time.dayState !== 'day' || Weather.isFrozen('lake') || this.threatened) return false;
    this.state.survey_day = Time.days;
    return true;
  }

  public prepare(): boolean {
    if (!this.eligible || this.state.survey_day < 0 || this.state.robin_day < 0 || this.state.sydney_day < 0 || this.state.stage !== 'research' || (this.state.witness_day >= 0 && !this.settled))
      return false;
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
    if (!this.active || !this.wants.Robin || !this.wants.Sydney) return false;
    if (this.state.stage === 'decision') {
      if (!this.state.appeal || !this.state.persuaded) return false;
      this.state.robin_day = this.state.sydney_day = Time.days;
      this.state.prepared = true;
    } else if (this.state.stage !== 'travelling' || !this.settled || this.state.robin_day < this.state.witness_day + 3 || this.state.sydney_day < this.state.witness_day + 3) return false;
    this.state.stage = 'ritual';
    this.state.rite_round = 0;
    return true;
  }

  public witness(stay = false): boolean {
    if (!this.active || this.state.stage !== 'travelling' || this.state.witness_day >= 0) return false;
    this.state.witness_day = Time.days;
    this.state.stage = stay ? 'decision' : 'research';
    // 调查的同意不能替代仪式的同意，当晚继续也要听到两人的新回答。
    this.state.robin_day = this.state.sydney_day = -1;
    this.state.prepared = false;
    this.state.appeal = '';
    this.state.persuaded = false;
    return true;
  }

  /** 结果来自原版诡术宏，模块只记录本次话术与结果。 */
  public urge(appeal: 'promise' | 'danger', passed: boolean): boolean {
    if (this.state.stage !== 'decision' || !this.active || this.state.appeal || !['promise', 'danger'].includes(appeal)) return false;
    this.state.appeal = appeal;
    this.state.persuaded = passed;
    return true;
  }

  public get rushed(): boolean {
    return Boolean(this.state.appeal && this.state.persuaded && [this.state.night, this.state.night + 1].includes(this.state.witness_day));
  }

  /** 两人被误导，以为退出会招来危险，实际通道仍然开放。 */
  public get cornered(): boolean {
    return this.rushed && this.state.appeal === 'danger';
  }

  public choose(choice: 'burden' | 'exit'): boolean {
    if (!this.active || this.state.stage !== 'ritual' || (choice === 'burden' ? this.state.trial !== '' : this.state.trial !== 'burden')) return false;
    this.state.trial = choice;
    return true;
  }

  public advance(stage: 1 | 2 | 3 | 4 | 5 | 6 | 7): boolean {
    if (!this.state.rite_active) return false;
    if (this.state.rite_stage >= stage) return false;
    this.state.rite_stage = stage;
    return true;
  }

  /** 同席阶段再走一轮。与祈祷室 loveDrunk 同构，台词与致幻随轮次加深。 */
  public nextRound(): number {
    this.state.rite_round += 1;
    return this.state.rite_round;
  }

  public closeRite(): boolean {
    if (!this.state.rite_active) return false;
    this.state.rite_active = false;
    this.state.rite_stage = 0;
    // rite_round 保留：岸上的「再陪一会儿」要接着往下数，不退回第一轮。
    return true;
  }

  public finish(): boolean {
    if (
      !this.active ||
      this.state.witness_day < 0 ||
      this.state.robin_day < this.state.witness_day ||
      this.state.sydney_day < this.state.witness_day ||
      this.state.stage !== 'ritual' ||
      this.state.trial !== 'exit'
    )
      return false;
    V.RobinTemple.dual_promise = true;
    V.RobinTemple.templePromised = 'Robin';
    V.RobinTemple.stage = 'promised';
    V.templePromised = 'Sydney';
    this.state.stage = 'complete';
    this.state.rite_done = true;
    return true;
  }
}
