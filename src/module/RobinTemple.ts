// ./src/module/RobinTemple.ts

import Module from './Module';
import SecretPromise from './SecretPromise';
import { DEFAULT_ROBIN_TEMPLE_STATE } from './constants';
import type { RobinTempleForm, RobinTemplePunishment } from './constants/robin-temple';

interface ResidentialModule {
  realEstate: { residenceOf(name: string): unknown };
}

interface NPCAvatarModule {
  overlay(name: string, resolve: (npc: { pronoun?: string }) => { src: string } | undefined): void;
}

class RobinTemple extends Module {
  public readonly secret = new SecretPromise(this);

  public get publicPromise(): string {
    return V.RobinTemple.dual_promise ? this.secret.state.first : V.RobinTemple.templePromised || V.templePromised;
  }

  constructor(core: typeof maplebirch) {
    super(core, 'RobinTemple', DEFAULT_ROBIN_TEMPLE_STATE);
  }

  public preInit(): void {
    // 属性默认值为 0，社交卡片仅在罗宾加入神殿后显示这项属性。
    this.core.npc.addStats({
      conviction: {
        default: 0,
        min: 0,
        max: 100,
        minValue: 0,
        maxValue: 100,
        position: 7,
        name: () => lanSwitch('Faith', '信仰'),
        value: () => T.npcData.conviction,
        activeIcon: 'img/ui/robin-temple-conviction.png',
        color: 'white',
        requirements: () => T.npcData.nam === 'Robin' && this.member
      },
      doubt: {
        default: 0,
        min: 0,
        max: 100,
        minValue: 0,
        maxValue: 100,
        position: 8,
        name: () => lanSwitch('Doubt', '动摇'),
        value: () => T.npcData.doubt,
        activeIcon: 'img/ui/robin-temple-doubt.png',
        color: 'lblue',
        requirements: () => T.npcData.nam === 'Robin' && this.member
      }
    });
    super.preInit();
    this.core.tool.onInit(() => {
      const avatars = this.core.get('MoreLoveInterestsAndNPCAvatars') as NPCAvatarModule | undefined;
      // 前景只更换神殿衣装，底图继续使用头像模块的关系表情。
      avatars?.overlay('Robin', npc => {
        if (!this.member || window.getRobinLocation() !== 'temple') return;
        return { src: `img/misc/icon/social/robin/temple_${npc.pronoun === 'm' ? 'm' : 'f'}.png` };
      });
    });
    this.core.npc.Schedule.get('Robin').when(() => this.templeTime, 'temple', { id: 'revelation-robin-temple', before: 'robin-location' });
    this.core.once(':storyready', () => {
      const location = window.getRobinLocation;
      window.getRobinLocation = () => {
        const current = location();
        if (!this.templeTime) return current;
        T.robin_location = 'temple';
        return 'temple';
      };
    });
    this.core.dynamic.regTimeEvent('onDay', ':revelation-robin-temple-daily', {
      exact: true,
      action: () => this.dailyUpdate()
    });
  }

  public get member(): boolean {
    return ['member', 'approved', 'promised'].includes(V.RobinTemple?.stage);
  }

  /** 当前路线的身份来自入殿与晋升结果，不另存一份等级。 */
  public get rank(): 'prospective' | 'monk' | 'initiate' {
    return !this.member ? 'prospective' : V.RobinTemple.vigil_result === 'passed' ? 'monk' : 'initiate';
  }

  /** 守夜晋升为修士后解锁床铺，承诺仪式不替代晋升。 */
  public get bunk(): boolean {
    return this.rank === 'monk';
  }

  /** 任一月检日历到期时共同检查，罗宾暂时缺席也不拆成两轮。 */
  public get examinationDue(): boolean {
    const state = V.RobinTemple;
    return (
      (this.publicPromise === 'Robin' || state.dual_promise) &&
      (state.chastity_timer <= 0 || V.temple_chastity_timer <= 0 || !state.monthly_checked) &&
      V.temple_rank !== undefined &&
      V.temple_rank !== 'prospective' &&
      V.exposed <= 0
    );
  }

  /** 未承诺且保有初次贞洁时，拆除沿用原版神殿的 £80 捐赠。 */
  public get claspFee(): number {
    return V.RobinTemple.templePromised !== 'Robin' && C.npc.Robin.virginity.vaginal === true && C.npc.Robin.virginity.penile === true ? 8000 : 0;
  }

  /** 沿用旧模组的白天办理流程，约旦缺席或弥撒期间等待。 */
  public get claspReady(): boolean {
    return this.member && this.available && window.getRobinLocation() === 'temple' && this.jordanAvailable;
  }

  /** 两项属性都存正值，增减时先抵消另一侧，零为中立。 */
  public get faith(): number {
    return C.npc.Robin.conviction - C.npc.Robin.doubt;
  }

  public set faith(value: number) {
    if (!Number.isFinite(value)) return;
    const amount = Math.clamp(value, -100, 100);
    C.npc.Robin.conviction = Math.max(0, amount);
    C.npc.Robin.doubt = Math.max(0, -amount);
  }

  /** 是否能参与日常活动，不包含神殿成员资格和当前地点。 */
  public get available(): boolean {
    return C.npc.Robin?.init === 1 && !V.robinmissing && V.robin.timer.hurt === 0 && C.npc.Robin.trauma < 80 && !(this.core.get('Robin') && V.RobinExpansion?.asylum?.status === 'admitted');
  }

  private get playerReady(): boolean {
    return ['initiate', 'monk', 'priest'].includes(V.temple_rank) && V.exposed <= 0 && V.stress < V.stressmax;
  }

  /** 房间里的对话沿用原版实际地点，不把上学、工作或住院中的罗宾拉回来。 */
  public get canTalk(): boolean {
    return this.playerReady && this.available && window.getRobinLocation() === 'orphanage';
  }

  /** 约旦的办理时段沿用原版 Time 日夜状态，周日弥撒期间不接待。 */
  public get jordanAvailable(): boolean {
    return C.npc.Jordan?.init === 1 && V.daily.jordanMissing !== 1 && !['night', 'dusk'].includes(Time.dayState) && !(Time.weekDay === 1 && Time.hour >= 11 && Time.hour < 13);
  }

  /** 同行和问询共需二十分钟，预留原版日程边界，预测只修改日期副本。 */
  public get canMeetJordan(): boolean {
    if (!this.canTalk || !this.jordanAvailable) return false;
    const end = new DateTime(Time.date).addMinutes(20);
    const expansion = this.core.get('Robin');
    if (['night', 'dusk'].includes(end.dayState)) return false;
    if (Time.schoolDay && Time.hour < 8 && end.hour >= 8) return false;
    if (Time.weekDay === 1 && Time.hour < 11 && end.hour >= 11) return false;
    const rainStall = expansion && (Time.season === 'winter' ? V.RobinExpansion?.chocolate >= 1 : V.RobinExpansion?.lemonade >= 1);
    if (Time.isWeekEnd() && Time.hour < 9 && end.hour >= 9 && (Weather.precipitation !== 'rain' || rainStall)) return false;
    if (Time.hour === 16 && Time.minute < 30 && end.hour === 16 && end.minute >= 30) {
      const watering =
        V.robin.autoWater &&
        C.npc.Robin.trauma < 50 &&
        Weather.precipitation !== 'rain' &&
        (Weather.precipitation !== 'snow' || V.alex_greenhouse >= 3) &&
        orphanagePlotsPlanted() &&
        !orphanagePlotsWatered();
      if (!V.daily.robin.bath || watering) return false;
    }
    if (V.englishPlay === 'ongoing' && V.englishPlayDays === 0 && Time.hour < 17 && end.hour >= 17) return false;
    if (V.halloween === 1 && Time.monthDay === 31 && Time.hour < 16 && end.hour >= 16) return false;
    const start = Time.hour * 60 + Time.minute;
    if (expansion && V.RobinExpansion?.tutor && Time.schoolDay && start < 18 * 60 + 30 && start + 20 >= 17 * 60 + 30) return false;
    return true;
  }

  /** 同行时借用原版地点覆盖，结束后恢复出发前的安排，零分钟表示结束。 */
  public visit(minutes: number): void {
    const state = V.RobinTemple;
    if (minutes > 0) {
      state.visit_override ??= V.robinlocationoverride || { location: 'orphanage', during: [] };
      V.robinlocationoverride = { location: 'temple', during: [Time.hour, new DateTime(Time.date).addMinutes(minutes).hour] };
    } else if (state.visit_override) {
      V.robinlocationoverride = state.visit_override;
      state.visit_override = null;
    }
  }

  /** 预约到期后保留至实际参加，健康、约旦缺席或时段不符都不结算。 */
  public get assessmentReady(): boolean {
    return (
      V.RobinTemple.stage === 'scheduled' &&
      Time.days >= V.RobinTemple.exam_day &&
      this.playerReady &&
      this.available &&
      this.jordanAvailable &&
      Time.hour >= 6 &&
      (Time.hour < 8 || (!Time.schoolDay && Time.hour < 18))
    );
  }

  /** 互动只使用未隐藏的部位，更多转化停用后不读取残留的转化等级。 */
  public get forms(): RobinTempleForm[] {
    const parts = V.transformationParts;
    const visible = (name: string, part: string): boolean => {
      const value = parts?.[name]?.[part];
      return typeof value === 'string' && value !== 'hidden' && value !== 'disabled';
    };
    const forms: RobinTempleForm[] = [];
    if (V.fox >= 6 && visible('fox', 'tail')) forms.push('fox');
    if (V.wolfgirl >= 6 && visible('wolf', 'ears')) forms.push('wolf');
    if (V.cat >= 6 && visible('cat', 'ears')) forms.push('cat');
    if (V.harpy >= 6 && visible('bird', 'wings')) forms.push('bird');
    if (V.cow >= 6 && visible('cow', 'horns')) forms.push('cow');
    const transformations = this.core.get('MoreTransformations');
    if (transformations) {
      if (V.maplebirch?.transformation?.horse?.level >= 6 && visible('horse', 'tail')) forms.push('horse');
      if (V.maplebirch?.transformation?.fish?.level >= 6 && visible('fish', 'fins')) forms.push('fish');
      if (V.maplebirch?.transformation?.raven?.level >= 6 && visible('raven', 'wings')) forms.push('raven');
    }
    return forms;
  }

  private dailyUpdate(): void {
    const state = V.RobinTemple;
    // 检查日历不因罗宾受伤、失踪或暂停值班而停止。
    if (state?.chastity_timer > 0) state.chastity_timer--;
    if (!state || !this.available) return;
    if (state.stage === 'scheduled' || state.stage === 'failed') {
      state.assessment_bonus = Math.min(15, state.assessment_bonus + (state.pendant ? 3 : 1));
      return;
    }
    if (!this.member) return;
    // 罗宾的信仰在中立区间之外逐日变化，贡献按上学与休息日增减。
    const faith = this.faith;
    if (faith >= 20) this.faith++;
    else if (faith <= -20) this.faith--;
    this.reviewFaith();
    const increment = Time.weekDay === 1 ? 3 : !Time.schoolDay && !Time.isWeekEnd() ? 2 : !Time.schoolDay ? 1 : -1;
    if (state.grace < 100) state.grace = Math.max(0, Math.min(100, state.grace + increment * (state.pendant && increment >= 0 ? 2 : 1)));
  }

  /** 信仰或动摇达到 20 时以 35% 概率触发转折，同一天只抽取一次。 */
  public reviewFaith(): void {
    const state = V.RobinTemple;
    const robin = C.npc.Robin;
    if (!state || !this.member || robin?.init !== 1) return;
    // 以净信念判定并维持两侧互斥，避免直接修改 NPC 数值后分支各自成立。
    const faith = this.faith;
    this.faith = faith;
    const band = faith >= 20 ? 'belief' : faith <= -20 ? 'doubt' : 'steady';
    if (band === 'steady') {
      state.faith_band = 'steady';
      state.faith_transition = '';
      return;
    }
    if (state.faith_transition && state.faith_transition !== band) state.faith_transition = '';
    if (band === state.faith_band || state.faith_review_day === Time.days) return;
    state.faith_review_day = Time.days;
    if (Math.random() >= 0.35) return;
    state.faith_band = band;
    state.faith_transition = band;
  }

  /** 每次预约只结算一次，避免重访结果页面时重新抽取火焰考验结果。 */
  public assess(): boolean {
    const state = V.RobinTemple;
    const robin = C.npc.Robin;
    if (!this.assessmentReady) return false;
    this.visit(1);
    if (state.assessment_day === state.exam_day) return true;
    state.assessment_day = state.exam_day;
    state.assessment_fire = robin.virginity.vaginal !== true || robin.virginity.penile !== true;
    if (!state.assessment_fire) {
      state.assessment_passed = true;
      return true;
    }
    const threshold = robin.dom >= 100 ? 35 : robin.dom >= 90 ? 55 : robin.dom >= 80 ? 75 : 95;
    state.assessment_passed = Math.floor(Math.random() * 100) + 1 + state.assessment_bonus >= threshold;
    return true;
  }

  /** 沿用原版规则：拒绝、坦白和检查失败均立即进入共同净化。 */
  public startPunishment(joint = false): void {
    const state = V.RobinTemple;
    if (state.punish || state.templePromised !== 'Robin' || (joint && V.templePromised !== 'Sydney')) return;
    const partner = () => ({ pain: 2, arousal: 0, hold: 0, belt: 0, hit: 0, plead: 0, touch: 0 });
    state.punish = {
      joint,
      started: false,
      robinTrauma: 0,
      robinComfort: 0,
      timer: 16,
      repeats: 0,
      phase: 1,
      action: '',
      result: 'active',
      cause: '',
      causeTarget: '',
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
    if (V.stress >= V.stressmax) {
      p.result = 'hospital';
      p.cause = 'hospital';
    } else if (p.timer <= 0) {
      p.result = 'passed';
      p.cause = 'passed';
    } else if (V.pain >= 100 && V.willpowerpain === 0) {
      p.result = 'rest';
      p.cause = 'pain';
      p.repeats++;
    } else if (V.arousal >= V.arousalmax) {
      p.result = 'rest';
      p.cause = 'arousal';
      p.repeats++;
    } else {
      const names = ['Robin', 'Sydney'] as const;
      const painTarget = names.find(name => (p.partners[name]?.pain ?? -1) >= 6);
      const arousalTarget = names.find(name => (p.partners[name]?.arousal ?? -1) >= 6);
      const target = painTarget ?? arousalTarget;
      if (target) {
        p.result = 'rest';
        p.cause = painTarget ? 'partnerPain' : 'partnerArousal';
        p.causeTarget = target;
        p.repeats++;
      } else {
        // 按本轮参与者抽取动作，三人净化时包含悉尼。
        const actions: RobinTemplePunishment['action'][] = ['Player', 'Robin', ...(p.joint ? ['Sydney' as const] : []), 'Vibrate'];
        p.action = p.action === '' ? 'Player' : actions[random(1, actions.length) - 1];
      }
    }
  }

  /** 选择只影响当前净化的参与者，PC 数值效果由原版宏在链接内执行。 */
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
    if (names.includes('Robin') && (choice === 'hold' || choice === 'hit')) p.robinComfort = Math.min(6, (p.robinComfort ?? 0) + 1);
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
        if (defenders.some(([name]) => name === 'Robin')) p.robinTrauma = Math.min(20, (p.robinTrauma ?? 16) + 1);
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
        if (p.action === 'Robin') p.robinTrauma = Math.min(20, (p.robinTrauma ?? 16) + 1);
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
    p.cause = p.result === 'passed' ? 'passed' : '';
    p.causeTarget = '';
  }

  /** 正常结束和送医均只结算一次创伤，未完成的净化保留存档进度。 */
  public finishPunishment(): boolean {
    const state = V.RobinTemple;
    const p: RobinTemplePunishment | null = state.punish;
    if (!p || (p.result !== 'passed' && p.result !== 'hospital')) return false;
    // 支持沿用原版安慰的恢复倍率，净增交给 npcincr 限幅，避免先到顶再减而反降。
    const trauma = Math.clamp(p.robinTrauma ?? (p.started ? 16 : 0), 0, 20);
    const comfort = -Math.round(-Math.clamp(p.robinComfort ?? 0, 0, 6) * (V.robinTraumaMultiplier || 1));
    if (trauma > 0) {
      this.core.SugarCube.Wikifier.wikifyEval(`<<npcincr Robin trauma ${Math.max(0, trauma - comfort)}>>`);
      C.npc.Robin.comforted = 0;
    }
    V.player.virginity.temple = true;
    C.npc.Robin.virginity.temple = true;
    if (p.joint) {
      C.npc.Sydney.virginity.temple = true;
      V.daily.sydney.punish = 1;
    }
    state.punish = null;
    return true;
  }

  private get templeTime(): boolean {
    if (!this.member || !this.available) return false;
    // 预约与剧情覆盖优先，原版地点函数会处理它们。
    if (V.robinlocationoverride?.during?.includes(Time.hour)) return false;

    const housing = this.core.get('VanillaPlus') as ResidentialModule | undefined;
    const livesWithPlayer = Boolean(housing?.realEstate.residenceOf('Robin'));
    const overnight = this.bunk && !livesWithPlayer && ((Time.weekDay === 7 && Time.hour >= 21) || (Time.weekDay === 1 && Time.hour < 7));
    const sundayService = Time.weekDay === 1 && Time.hour >= 11 && Time.hour < 13;
    const freeWeekday = !Time.schoolDay && !Time.isWeekEnd() && Time.hour >= 9 && Time.hour < 16;
    const shopOpen = this.core.get('Robin') && V.RobinExpansion?.shop && (Time.hour > 18 || (Time.hour === 18 && Time.minute >= 30)) && Time.hour < 21;
    const vigil =
      V.RobinTemple.vigil_result !== 'passed' &&
      (!shopOpen || (V.RobinTemple.vigil_attending && V.RobinTemple.vigil_with_robin)) &&
      ((Time.weekDay === 1 && Time.hour >= 20) || (Time.weekDay === 2 && Time.hour < 7));
    return overnight || sundayService || freeWeekday || vigil;
  }
}

export default RobinTemple;
