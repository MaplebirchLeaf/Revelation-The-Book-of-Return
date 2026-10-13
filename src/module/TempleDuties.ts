import Module from './Module';
import { DEFAULT_TEMPLE_DUTIES_STATE } from './constants/temple-duties';

/** 只注册存档；职务、调查和任命规则在 Twee 中维护。 */
export default class TempleDuties extends Module {
  public constructor(core: typeof maplebirch) {
    super(core, 'TempleDuties', DEFAULT_TEMPLE_DUTIES_STATE);
  }
}
