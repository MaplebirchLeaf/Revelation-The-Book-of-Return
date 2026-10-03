// ./src/module/LostLamb.ts

import { DEFAULT_LOST_LAMB_STATE, LOST_LAMB_SCENES, type LostLambState } from './constants/lost-lamb';
import type { LostLambChoice, LostLambStat, LostLambTalk } from './constants/lost-lamb-types';
import Module from './Module';

/** 模块关闭后仍能恢复梦中存档，与正常醒来共用同一条恢复路径。 */
export function restoreLostLamb(): void {
  if (!V.LostLamb?.active || V.replayScene) return;
  const progress = clone(V.LostLamb);
  // unfreeze 会还原包括本模块在内的全部变量，因此要在它之后放回演绎进度。
  new maplebirch.SugarCube.Wikifier(null, '<<unfreezePlayerStats>><<canvas-model-override "clear">>');
  V.LostLamb = progress;
  V.LostLamb.active = false;
}

/** 使用原版演绎冻结机制，进度在恢复真实存档后单独保留。 */
export default class LostLamb extends Module {
  public constructor(core: typeof maplebirch) {
    super(core, 'LostLamb', DEFAULT_LOST_LAMB_STATE);
  }

  public get state(): LostLambState {
    return V.LostLamb;
  }

  public get available(): boolean {
    return (
      C.npc.Kylar.init === 1 &&
      C.npc.Kylar.state === 'active' &&
      V.location === 'kylarmanor' &&
      (this.state.unlocked || V.kylar_manor_secret >= 2) &&
      this.state.recalled &&
      V.kylar_sleep_abduction !== undefined &&
      V.combat !== 1 &&
      !V.frozenValues &&
      !V.replayScene
    );
  }

  public get active(): boolean {
    return this.state.active && Boolean(this.scene);
  }

  public get scene() {
    return Object.hasOwn(LOST_LAMB_SCENES, this.state.scene) ? LOST_LAMB_SCENES[this.state.scene] : undefined;
  }

  public get mainReady(): boolean {
    return this.state.endings.includes('stay') && this.state.endings.includes('verdict');
  }

  public get reward(): boolean {
    return this.mainReady && this.state.endings.includes('main') && !this.state.active && !V.statFreeze && !V.replayScene;
  }

  public get nightmareStress(): number {
    return this.reward ? 4.5 : 6;
  }

  public get day(): number {
    const start = new DateTime(Time.startDate.year, 9, 1).timeStamp;
    return this.state.date ? Math.floor((this.state.date - start) / 86400) + 1 : 0;
  }

  public get kylarHere(): boolean {
    return (
      C.npc.Kylar.init === 1 &&
      C.npc.Kylar.state === 'active' &&
      V.location === 'kylarmanor' &&
      (Time.hour >= 18 || Time.hour <= 6) &&
      V.combat !== 1 &&
      !this.state.active &&
      !V.statFreeze &&
      !V.frozenValues &&
      !V.replayScene
    );
  }

  public get reaction(): 'guarded' | 'close' | 'quiet' {
    return C.npc.Kylar.rage >= 60 ? 'guarded' : C.npc.Kylar.love >= 60 ? 'close' : 'quiet';
  }

  public get talkReady(): boolean {
    return this.reward && !this.state.talk && this.kylarHere && Time.hour >= 18;
  }

  /** 现实交谈只结算一次，重新演绎不重置这次选择。 */
  public talk(kind: LostLambTalk): boolean {
    if (!this.talkReady || !['company', 'night', 'space'].includes(kind)) return false;
    this.state.talk = kind;
    const effects = kind === 'space' ? '<<pass 5>>' : '<<pass 10>><<npcincr Kylar love 1>><<stress -2>>';
    new maplebirch.SugarCube.Wikifier(null, effects);
    return true;
  }

  public get choices() {
    if (!this.state.active) return [];
    return (this.scene?.choices ?? [])
      .filter(choice => this.allowed(choice))
      .map(choice => {
        // 跳到下一个日子的场景由正文交代，普通行动显示原版格式的耗时。
        const minutes = choice.minutes ?? 10;
        const time = LOST_LAMB_SCENES[choice.to].clock ? '' : ` (${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')})`;
        return { ...choice, text: choice.text.map(text => text + time) as [string, string] };
      });
  }

  /** 原版选项旁的检定与变化预告。返回元素，避免 print 丢失片段中的颜色。 */
  public hint(choice: LostLambChoice): HTMLSpanElement {
    const output = document.createElement('span');
    if (V.settings.blindStatsEnabled) return output;
    const names = {
      doubt: lanSwitch('Doubt', '疑心'),
      fear: lanSwitch('Unease', '不安'),
      notice: lanSwitch('Attention', '注意')
    };
    if (choice.test) {
      const { stat } = choice.test;
      const passed = this.passes(choice.test);
      const name = document.createElement('span');
      name.className = 'orange';
      name.textContent = names[stat];
      output.append(' | ', name);
      if (V.settings.skillCheckStyle !== 'skillname') {
        // skillDifficultyText 只显示结果，不调用会消耗随机数的 skill_difficulty。
        new maplebirch.SugarCube.Wikifier(output, `: <<skillDifficultyText ${passed ? 100 : 0}>>`);
      }
    }
    for (const stat of ['doubt', 'fear', 'notice'] as const) {
      const delta = this.value(stat, choice.change?.[stat]) - this.state[stat];
      // 一个标记代表最多 10 点，最多显示三个，已到边界时不预告无效变化。
      const amount = Math.sign(delta) * Math.min(3, Math.ceil(Math.abs(delta) / 10));
      const color = stat === 'doubt' ? 'lblue' : delta > 0 ? 'red' : stat === 'notice' ? 'teal' : 'green';
      output.appendChild(this.core.tool.macro.statChange(names[stat], amount, color));
    }
    return output;
  }

  public get note() {
    return LOST_LAMB_SCENES[this.state.note]?.note;
  }

  public get paused(): boolean {
    return !this.active && Boolean(this.scene) && !this.state.ending;
  }

  public loadInit(): void {
    if (this.active) this.sync();
  }

  public begin(): boolean {
    if (!this.available || this.active) return false;
    const resume = this.paused;
    const known = { bishop: V.kylar_manor_secret >= 3, gwylan: Boolean(V.gwylanSeen?.includes('kylar_parents')) };
    // 与绝望轮回共用原版快照。定点设置演绎时间，不触发现实日结和框架时间事件。
    new maplebirch.SugarCube.Wikifier(null, '<<freezePlayerStats>><<visionPrepMorph>>');
    for (const name of Object.keys(V.maplebirch.transformation)) this.core.char.transformation.setTransform(name, 0);
    if (!resume) {
      const returning = this.state.endings.length > 0;
      this.state.scene = returning ? 'crossroads' : 'arrival';
      this.state.marks = returning ? [...this.state.childhood] : [];
      this.state.note = returning ? 'crossroads' : '';
      this.state.doubt = 0;
      this.state.fear = 10;
      this.state.notice = 0;
      this.state.ending = '';
      this.state.known = known;
      this.state.date = new DateTime(Time.startDate.year, 9, 1, returning ? 18 : 14, returning ? 30 : 0).timeStamp;
    }
    this.state.active = true;
    V.player.name = lanSwitch('Kylar', '凯拉尔');
    V.player.gender = C.npc.Kylar.gender;
    V.player.sex = C.npc.Kylar.gender;
    V.player.gender_body = C.npc.Kylar.gender;
    V.player.gender_posture = C.npc.Kylar.gender;
    V.player.penisExist = V.player.ballsExist = C.npc.Kylar.gender === 'm';
    V.player.vaginaExist = C.npc.Kylar.gender === 'f';
    V.player.breastsize = 0;
    V.player.bodyshape = 'slender';
    V.bodysize = 1;
    V.haircolour = C.npc.Kylar.hairColour;
    V.hairfringecolour = C.npc.Kylar.hairColour;
    V.naturalhaircolour = C.npc.Kylar.hairColour;
    V.hairColourGradient.colours = [V.haircolour, V.haircolour];
    V.hairFringeColourGradient.colours = [V.haircolour, V.haircolour];
    V.leftEyeColour = C.npc.Kylar.eyeColour;
    V.rightEyeColour = C.npc.Kylar.eyeColour;
    V.hairlength = V.fringelength = 100;
    V.hairlengthstage = V.fringelengthstage = 'short';
    V.hairtype = V.fringetype = 'default';
    // 沿用绝望轮回的演绎清理，避免现实镜片覆盖凯拉尔眼色。
    Object.assign(V.makeup, {
      lipstick: 0,
      eyeshadow: 0,
      eyelenses: { left: 0, right: 0 },
      blusher: 0,
      mascara: 0,
      mascara_running: 0,
      pbcolour: 0,
      browscolour: 0,
      concealer: 0
    });
    V.bellySizeDebug = 0;
    V.milk_volume = V.milk_amount = V.lactating = 0;
    V.vaginaWetness = V.penisWetness = V.anusWetness = 0;
    // 清掉现实衣装，使用原版的普通套装，不把成人衣装带进童年演绎。
    for (const slot of Object.keys(V.worn)) {
      if (setup.clothes[slot]) V.worn[slot] = clone(setup.clothes[slot][0]);
    }
    new maplebirch.SugarCube.Wikifier(null, '<<upperwear "t-shirt" "white">><<lowerwear "shorts" "black">><<underlowerwear "briefs" "white">><<feetwear "trainers" "black">><<endevent>>');
    this.sync();
    return true;
  }

  /** 仅当前页面上的合法选择可以推进演绎，重复点击不能重复记入进度。 */
  public choose(id: string): boolean {
    if (!this.active) return false;
    const choice = this.scene?.choices.find(item => item.id === id && this.allowed(item));
    if (!choice) return false;
    let targetId = choice.to;
    if (choice.test) {
      const { pass, fail } = choice.test;
      const passed = this.passes(choice.test);
      targetId = passed ? pass : fail;
      this.state.marks.pushUnique(`${id}-${passed ? 'pass' : 'fail'}`);
    }
    if (this.state.scene === 'crossroads' && !this.state.endings.length) this.state.childhood = [...this.state.marks];
    if (choice.once) this.state.marks.pushUnique(id);
    if (choice.mark) this.state.marks.pushUnique(choice.mark);
    for (const stat of ['doubt', 'fear', 'notice'] as const) this.state[stat] = this.value(stat, choice.change?.[stat]);
    this.state.scene = targetId;
    const scene = LOST_LAMB_SCENES[targetId];
    if (scene.note) this.state.note = targetId;
    const date = new DateTime(this.state.date);
    const target = scene.clock ? new DateTime(date.year, date.month, date.day, scene.clock[1], scene.clock[2]).addDays(scene.clock[0]) : date.addMinutes(choice.minutes ?? 10);
    if (target.timeStamp < this.state.date) target.addDays(1);
    this.state.date = target.timeStamp;
    this.sync();
    if (scene.ending) {
      this.state.ending = scene.ending;
      this.state.endings.pushUnique(scene.ending);
    }
    return true;
  }

  private passes(test: NonNullable<LostLambChoice['test']>): boolean {
    return test.low ? this.state[test.stat] <= test.threshold : this.state[test.stat] >= test.threshold;
  }

  private value(stat: LostLambStat, amount = 0): number {
    return Math.clamp(this.state[stat] + amount, 0, 100);
  }

  private allowed(choice: LostLambChoice): boolean {
    const { marks } = this.state;
    if (choice.once && marks.includes(choice.id)) return false;
    if (choice.when?.some(mark => !marks.includes(mark)) || choice.unless?.some(mark => marks.includes(mark))) return false;
    if (choice.needs) {
      const { stat, min = 0, max = 100 } = choice.needs;
      if (this.state[stat] < min || this.state[stat] > max) return false;
    }
    // 包含起点，不包含终点，允许跨午夜。
    if (choice.hours) {
      const [start, end] = choice.hours;
      const hour = Time.hour + Time.minute / 60;
      if (start <= end ? hour < start || hour >= end : hour < start && hour >= end) return false;
    }
    const targets = choice.test ? [choice.to, choice.test.pass, choice.test.fail] : [choice.to];
    return targets.every(id => Object.hasOwn(LOST_LAMB_SCENES, id) && (!LOST_LAMB_SCENES[id].gate || this.mainReady));
  }

  private sync(): void {
    Time.setDate(new DateTime(this.state.date));
    V.location = 'kylarmanor';
    V.outside = this.scene?.outside ? 1 : 0;
    // 重新生成梦中天气，既不沿用现实雾，也不触发框架的现实时间跳转事件。
    V.weatherObj.keypointsArr = [];
    V.weatherObj.fogKeypoints = [];
    Weather.WeatherGeneration.generate(Time.date);
    Weather.set(this.scene?.weather ?? 'clear', true);
    Weather.FogGeneration.generateFogKeypoints(V.weatherObj.keypointsArr);
    Weather.FogGeneration.setFog(0);
    V.weatherObj.snow = 0;
    Weather.setTemperature(18);
  }
}
