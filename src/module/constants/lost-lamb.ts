// ./src/module/constants/lost-lamb.ts

import { LOST_LAMB_MAIN_SCENES } from './lost-lamb-main';
import { LOST_LAMB_STAY_SCENES } from './lost-lamb-stay';
import { choice, type LostLambEnding, type LostLambScene, type LostLambTalk } from './lost-lamb-types';
import { LOST_LAMB_VERDICT_SCENES } from './lost-lamb-verdict';

export interface LostLambState {
  unlocked: boolean;
  recalled: boolean;
  active: boolean;
  scene: string;
  marks: string[];
  childhood: string[];
  note: string;
  doubt: number;
  fear: number;
  notice: number;
  ending: LostLambEnding | '';
  endings: LostLambEnding[];
  date: number;
  talk: LostLambTalk | '';
  talkVow: 'offered' | 'sealed' | '';
  known: { bishop: boolean; gwylan: boolean; auriga: boolean };
}

// 跨梦保留的约定。重走同一条路线时，只留下这次选择的结果。
export const LOST_LAMB_VOWS: readonly (readonly string[])[] = [
  ['stay-vow-bound', 'stay-vow-broken'],
  ['verdict-vow-sealed', 'verdict-vow-broken'],
  ['main-vow-offered', 'main-vow-refused']
];

export const DEFAULT_LOST_LAMB_STATE: LostLambState = {
  unlocked: false,
  recalled: false,
  active: false,
  scene: '',
  marks: [],
  childhood: [],
  note: '',
  doubt: 0,
  fear: 10,
  notice: 0,
  ending: '',
  endings: [],
  date: 0,
  talk: '',
  talkVow: '',
  known: { bishop: false, gwylan: false, auriga: false }
};

// 首次共有的下午很短。结束一条路线后，直接回到门口选择另一种梦。
export const LOST_LAMB_SCENES: Record<string, LostLambScene> = {
  arrival: { part: 'before', choices: [choice('arrival', 'Go downstairs', '下楼', 'hall')] },
  hall: {
    part: 'before',
    choices: [
      choice('draw', 'Draw together', '一起画画', 'drawing', { once: true }),
      choice('garden', 'Go into the garden', '去花园玩', 'garden', { once: true }),
      choice('kitchen', 'Look for something to eat', '去找点吃的', 'kitchen', { once: true }),
      choice('before-supper', 'Stay until supper', '玩到晚饭时', 'supper')
    ]
  },
  drawing: {
    part: 'before',
    choices: [
      choice('share', 'Let Sydney draw the way out', '让悉尼画出去的路', 'drawing-end', { mark: 'shared' }),
      choice('keep', 'Keep the ending for yourself', '自己画结尾', 'drawing-end', { mark: 'kept' })
    ]
  },
  'drawing-end': { part: 'before', choices: [choice('drawing-back', 'Put the pencils away', '收好画笔', 'hall')] },
  garden: {
    part: 'before',
    outside: true,
    choices: [choice('shortcut', 'Take the narrow path', '走窄一些的小路', 'race', { mark: 'shortcut' }), choice('wait-friend', 'Wait for Sydney', '等悉尼跟上', 'race', { mark: 'waited' })]
  },
  race: {
    part: 'before',
    outside: true,
    choices: [
      choice('flower', 'Give Sydney the fallen flower', '把掉落的花递给悉尼', 'garden-end', { mark: 'flower' }),
      choice('flowers-leave', 'Leave it where it fell', '把花留在原处', 'garden-end')
    ]
  },
  'garden-end': { part: 'before', outside: true, choices: [choice('garden-back', 'Go back inside', '回屋里', 'hall')] },
  kitchen: {
    part: 'before',
    choices: [choice('help', 'Help set the table', '帮忙摆餐具', 'kitchen-end', { mark: 'helped' }), choice('steal-bite', 'Sneak a taste', '偷偷尝一口', 'kitchen-end', { mark: 'tasted' })]
  },
  'kitchen-end': { part: 'before', choices: [choice('kitchen-back', 'Carry the cups out', '把杯子拿出去', 'hall')] },
  supper: {
    part: 'before',
    clock: [0, 18, 0],
    choices: [
      choice('ask-visit', 'Ask when Sydney can visit again', '问悉尼什么时候再来', 'departure'),
      choice('ask-work', 'Ask what your parents are working on', '问父母最近在忙什么', 'departure', { mark: 'work' })
    ]
  },
  departure: {
    part: 'before',
    outside: true,
    clock: [0, 18, 30],
    choices: [
      choice('promise', 'Promise to save the unfinished drawing', '答应留着没画完的画', 'crossroads', { mark: 'promised' }),
      choice('wave', 'Wave from the steps', '站在台阶上挥手', 'crossroads')
    ]
  },
  crossroads: {
    part: 'before',
    outside: true,
    note: ['Sydney has left. There is still a voice in the garden, and quiet talk in the kitchen.', '悉尼已经离开。花园仍有声音，厨房里有人低声说话。'],
    choices: [
      choice('crossroads-stay', 'Follow Sydney’s voice into the garden', '跟着悉尼的声音去花园', 'stay-start'),
      choice('crossroads-verdict', 'Go closer to the talk in the kitchen', '靠近厨房里的谈话声', 'verdict-start'),
      choice('crossroads-main', 'Stay to hear your own voice', '留下来听自己的声音', 'main-start')
    ]
  },
  ...LOST_LAMB_STAY_SCENES,
  ...LOST_LAMB_VERDICT_SCENES,
  ...LOST_LAMB_MAIN_SCENES
};
