// ./src/module/constants/lost-lamb-types.ts

export type LostLambEnding = 'main' | 'stay' | 'verdict';
export type LostLambPart = 'before' | LostLambEnding;
export type LostLambStat = 'doubt' | 'fear' | 'notice';
export type LostLambTalk = 'company' | 'night' | 'space';

export interface LostLambChoice {
  id: string;
  text: readonly [string, string];
  to: string;
  icon?: string;
  mark?: string | readonly string[];
  once?: boolean;
  minutes?: number;
  change?: Partial<Record<LostLambStat, number>>;
  needs?: { stat: LostLambStat; min?: number; max?: number };
  when?: readonly string[];
  unless?: readonly string[];
  // [起点小时, 终点小时)，可跨午夜。
  hours?: readonly [number, number];
  // 先检测，再应用 change。low 表示不超过门槛，结果记作 id-pass / id-fail。
  test?: { stat: LostLambStat; threshold: number; low?: boolean; pass: string; fail: string };
}

export interface LostLambScene {
  part: LostLambPart;
  outside?: boolean;
  weather?: 'lightPrecipitation';
  // [跳过的天数, 小时, 分钟]，只移动梦中的时钟。
  clock?: readonly [number, number, number];
  ending?: LostLambEnding;
  gate?: 'branches';
  note?: readonly [string, string];
  choices: readonly LostLambChoice[];
}

export const choice = (id: string, en: string, cn: string, to: string, options: Omit<Partial<LostLambChoice>, 'id' | 'text' | 'to'> = {}): LostLambChoice => ({ id, text: [en, cn], to, ...options });
