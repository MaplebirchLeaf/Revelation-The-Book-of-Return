import { DEFAULT_TEMPLE_CHOIR_STATE } from './constants';
import Module from './Module';

class TempleChoir extends Module {
  public constructor(core: typeof maplebirch) {
    super(core, 'TempleChoir', DEFAULT_TEMPLE_CHOIR_STATE);
  }

  public get modifier(): number {
    let value = V.harpy >= 3 ? 120 : 100;
    if (V.tiredness >= V.tirednessmax / 2) value = Math.floor(value * 0.9);
    if (V.drunk > 0) value = Math.floor(value * 0.9);
    return value;
  }

  public get singing(): number {
    return Math.floor((V.TempleChoir.singing * this.modifier) / 100);
  }

  public get member(): boolean {
    return ['initiate', 'monk', 'priest', 'bishop'].includes(V.temple_rank) && V.exposed <= 0 && C.npc.Jordan.init === 1;
  }

  public get practice(): boolean {
    return this.member && V.TempleChoir.joined && V.TempleChoir.practiceDay !== Time.days && Time.hour >= 9 && Time.hour < 18 && !(Time.weekDay === 1 && Time.hour >= 11 && Time.hour < 13);
  }

  public get service(): boolean {
    return this.member && V.TempleChoir.joined && V.TempleChoir.serviceDay !== Time.days && V.daily.massAttended !== 1 && Time.weekDay === 1 && Time.hour >= 11 && Time.hour < 13;
  }

  public begin(): boolean {
    if (!this.service) return false;
    V.TempleChoir.serviceDay = Time.days;
    V.daily.massAttended = 1;
    V.TempleChoir.shift = { round: 0, score: 0, result: '', pay: 0, paid: false };
    return true;
  }

  /** 在链接中结算一次，再进入下一段正文，避免重访页面重复工作。 */
  public sing(style: 'follow' | 'harmony' | 'lead'): boolean {
    const state = V.TempleChoir;
    const shift = state.shift;
    if (!shift || shift.round >= 3 || shift.paid || (style === 'lead' && !state.lead)) return false;
    const threshold = style === 'lead' ? 700 : style === 'harmony' ? 400 : 100;
    const prepared = Time.days - state.practiceDay <= 2 && state.practiceDay >= 0 ? 100 : 0;
    const value = this.singing + prepared + random(-100, 100);
    shift.result = value >= threshold ? 'clear' : value >= threshold - 200 ? 'unsteady' : 'lost';
    shift.score += shift.result === 'clear' ? (style === 'lead' ? 3 : 2) : shift.result === 'unsteady' ? 1 : 0;
    shift.round++;
    if (!V.statFreeze) state.singing = Math.min(1000, state.singing + (style === 'follow' ? 6 : 10));
    return true;
  }

  public finish(): boolean {
    const state = V.TempleChoir;
    const shift = state.shift;
    if (!shift || shift.round !== 3 || shift.paid) return false;
    shift.paid = true;
    shift.pay = 1200 + Math.min(6, shift.score) * 200;
    state.services++;
    if (state.services >= 3 && state.practices >= 3 && state.singing >= 600 && shift.score >= 5) state.lead = true;
    return true;
  }
}

export default TempleChoir;
