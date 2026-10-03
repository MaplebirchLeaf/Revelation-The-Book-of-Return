// ./src/module/constants/lost-lamb-verdict.ts

import { choice, type LostLambScene } from './lost-lamb-types';

export const LOST_LAMB_VERDICT_SCENES: Record<string, LostLambScene> = {
  'verdict-start': {
    part: 'verdict',
    clock: [5, 14, 0],
    note: ['The promised visit has not happened.', '说好的来访没有发生。'],
    choices: [choice('verdict-wait-gate', 'Check the gate', '去大门口看看', 'verdict-coat', { change: { fear: 4 } })]
  },
  'verdict-coat': {
    part: 'verdict',
    choices: [
      choice('verdict-coat-straighten', 'Straighten the empty sleeves', '理好空着的袖子', 'verdict-table', { change: { doubt: 6 } }),
      choice('verdict-coat-leave', 'Leave them as they are', '不去动它们', 'verdict-table', { change: { fear: 5 } })
    ]
  },
  'verdict-table': {
    part: 'verdict',
    choices: [
      choice('verdict-table-ask', 'Ask which day Sydney is coming', '问悉尼哪天来', 'verdict-words', { change: { notice: 10, doubt: 10 }, mark: 'verdict-asked-visit' }),
      choice('verdict-table-listen', 'Keep eating and listen', '继续吃，留心听', 'verdict-words', { change: { doubt: 8 } })
    ]
  },
  'verdict-words': { part: 'verdict', choices: [choice('verdict-words-follow', 'Go to the landing', '去楼梯口', 'verdict-landing-entry', { minutes: 20, change: { doubt: 6 } })] },
  'verdict-landing-entry': {
    part: 'verdict',
    clock: [0, 17, 0],
    note: ['The adults lower their voices near the laboratory.', '大人在实验室附近压低了声音。'],
    choices: [choice('verdict-landing-stay', 'Find somewhere to listen', '找个能听见的地方', 'verdict-landing')]
  },
  'verdict-landing': {
    part: 'verdict',
    choices: [
      choice('verdict-listen-step', 'Sit on the cold step', '坐在冰凉的台阶上', 'verdict-step', { once: true, minutes: 15, mark: 'verdict-heard', change: { doubt: 14, fear: 5, notice: 8 } }),
      choice('verdict-listen-door', 'Listen through the connecting door', '隔着连通门听', 'verdict-listening-door', {
        once: true,
        minutes: 15,
        mark: 'verdict-heard',
        hours: [17, 17.5],
        change: { doubt: 22, fear: 8, notice: 25 }
      }),
      choice('verdict-listen-shoes', 'Bring the shoes from the mat', '把地垫上的鞋拿进去', 'verdict-shoes', {
        once: true,
        minutes: 15,
        mark: 'verdict-heard',
        change: { doubt: 10, fear: -6, notice: -12 }
      }),
      choice('verdict-listen-closer', 'Listen for the unfinished sentence', '听那句没有说完的话', 'verdict-overheard', {
        when: ['verdict-heard'],
        test: { stat: 'notice', threshold: 42, low: true, pass: 'verdict-overheard', fail: 'verdict-noticed' },
        change: { fear: 7 }
      })
    ]
  },
  'verdict-step': { part: 'verdict', choices: [choice('verdict-step-return', 'Move before your foot goes numb', '趁脚还没麻，挪开一点', 'verdict-landing', { mark: 'verdict-landing-return' })] },
  'verdict-listening-door': { part: 'verdict', choices: [choice('verdict-door-return', 'Leave the handle alone', '松开门把手', 'verdict-landing', { mark: 'verdict-landing-return' })] },
  'verdict-shoes': { part: 'verdict', choices: [choice('verdict-shoes-return', 'Put the shoes down', '把鞋放下', 'verdict-landing', { mark: 'verdict-landing-return' })] },
  'verdict-overheard': {
    part: 'verdict',
    note: ['You heard an agreement, but not who made it.', '你听见了一个约定，却不知道谁定下的。'],
    choices: [choice('verdict-overheard-hide', 'Step away from the light', '离开那片灯光', 'verdict-watched', { mark: 'verdict-unfinished', change: { doubt: 12, notice: 5 } })]
  },
  'verdict-noticed': {
    part: 'verdict',
    note: ['Someone saw you listening.', '有人发现你在偷听。'],
    choices: [
      choice('verdict-noticed-cups', 'Say you were bringing cups', '说自己是来拿杯子的', 'verdict-watched', { mark: 'verdict-cup-excuse', change: { notice: -12, doubt: 10 } }),
      choice('verdict-noticed-admit', 'Say you heard your name', '说自己听见了名字', 'verdict-watched', { mark: 'verdict-admitted', change: { notice: 5, fear: -8, doubt: 16 } })
    ]
  },
  'verdict-watched': {
    part: 'verdict',
    choices: [
      choice('verdict-watched-sit', 'Sit where they can see you', '坐到他们能看见的地方', 'verdict-dinner', { change: { notice: -15, fear: -6 } }),
      choice('verdict-watched-match', 'Match the voices to the supper places', '把声音与晚饭座位对上', 'verdict-dinner', {
        when: ['verdict-listen-closer-pass'],
        mark: 'verdict-matched-voices',
        change: { notice: -8, doubt: 10 }
      }),
      choice('verdict-watched-carry', 'Carry the cups where everyone can see you', '当着他们的面端杯子', 'verdict-dinner', {
        when: ['verdict-listen-closer-fail'],
        mark: 'verdict-carrying-cups',
        change: { notice: -20, fear: -12 }
      })
    ]
  },
  'verdict-dinner': {
    part: 'verdict',
    clock: [0, 19, 0],
    choices: [
      choice('verdict-dinner-name', 'Ask what the visitor is called', '问来客叫什么', 'verdict-visitor', { change: { doubt: 10, notice: 10 } }),
      choice('verdict-dinner-watch', 'Watch the place set for the visitor', '看着留给来客的位置', 'verdict-visitor', { change: { doubt: 12, fear: 5 } })
    ]
  },
  'verdict-visitor': {
    part: 'verdict',
    choices: [
      choice('verdict-visitor-question', 'Ask why Sydney cannot come', '问为什么悉尼不能来', 'verdict-question', { change: { notice: 12, doubt: 10 } }),
      choice('verdict-visitor-check', 'Ask which house they visited', '问他们去过哪一所房子', 'verdict-question', { mark: 'verdict-house-question', change: { doubt: 16 } })
    ]
  },
  'verdict-question': { part: 'verdict', choices: [choice('verdict-question-room', 'Go upstairs when told', '按他们说的上楼', 'verdict-night-call', { change: { notice: -10 } })] },
  'verdict-night-call': {
    part: 'verdict',
    clock: [3, 23, 0],
    note: ['You hear breaking glass from your room.', '你在房间里听见碎玻璃的声音。'],
    choices: [
      choice('verdict-night-still', 'Stay beneath the covers', '躲在被子下面', 'verdict-cup', { change: { fear: 18, doubt: 6 } }),
      choice('verdict-night-call-name', 'Call for your parents', '喊父母', 'verdict-cup', { mark: 'verdict-called-parents', change: { fear: 12, notice: 15, doubt: 8 } })
    ]
  },
  'verdict-cup': { part: 'verdict', clock: [1, 7, 0], choices: [choice('verdict-cup-upstairs', 'Carry water upstairs', '把水端上楼', 'verdict-upstairs', { change: { fear: -6 } })] },
  'verdict-upstairs': {
    part: 'verdict',
    choices: [choice('verdict-upstairs-retreat', 'Put the cup down out of reach', '把杯子放在够不到的地方', 'verdict-linen', { change: { fear: 12, doubt: 10 } })]
  },
  'verdict-linen': {
    part: 'verdict',
    choices: [
      choice('verdict-linen-wrap', 'Wrap your hand before carrying more', '先包住手，再搬东西', 'verdict-copy', { mark: 'verdict-wrapped', change: { fear: -10, doubt: 5 } }),
      choice('verdict-linen-leave', 'Leave the sharp pieces where they are', '先不去碰锋利的碎片', 'verdict-copy', { change: { fear: -5, doubt: 8 } })
    ]
  },
  'verdict-copy': {
    part: 'verdict',
    note: ['The words seem clearer when nobody is speaking.', '没人说话时，那些话反而更清楚。'],
    choices: [
      choice('verdict-copy-check', 'Leave a gap for the words you missed', '给没听见的地方留空', 'verdict-gap', {
        test: { stat: 'doubt', threshold: 95, pass: 'verdict-gap', fail: 'verdict-complete' },
        change: { fear: 4 }
      })
    ]
  },
  'verdict-gap': { part: 'verdict', choices: [choice('verdict-gap-turn', 'Turn the paper over', '把纸翻过来', 'verdict-script', { mark: 'verdict-left-gap', change: { doubt: 8 } })] },
  'verdict-complete': {
    part: 'verdict',
    choices: [choice('verdict-complete-cross', 'Cross out the answer you supplied', '划掉自己补出来的答案', 'verdict-script', { mark: 'verdict-crossed-out', change: { doubt: 16, fear: -4 } })]
  },
  'verdict-script': { part: 'verdict', choices: [choice('verdict-script-open', 'Open the window a little', '把窗户推开一点', 'verdict-morning', { change: { fear: -8 } })] },
  'verdict-morning': { part: 'verdict', clock: [1, 8, 0], choices: [choice('verdict-morning-out', 'Go out while it is light', '趁天亮出门', 'verdict-ticket', { change: { notice: -15, fear: -8 } })] },
  'verdict-ticket': {
    part: 'verdict',
    outside: true,
    choices: [choice('verdict-ticket-count', 'Count the houses instead of the numbers', '不看号码，数过那些房子', 'verdict-outside', { change: { doubt: 10, fear: -4 } })]
  },
  'verdict-outside': {
    part: 'verdict',
    outside: true,
    choices: [choice('verdict-outside-approach', 'Speak from the other side of the pavement', '隔着人行道说话', 'verdict-sydney', { change: { fear: -5, doubt: 6 } })]
  },
  'verdict-sydney': {
    part: 'verdict',
    outside: true,
    note: ['Sydney cannot explain the adults’ decision for them.', '悉尼不能替大人解释他们的决定。'],
    choices: [
      choice('verdict-sydney-let', 'Let Sydney go when called', '有人喊时，让悉尼走', 'verdict-return', { mark: 'verdict-let-sydney-go', change: { fear: 4, doubt: 12 } }),
      choice('verdict-sydney-demand', 'Ask for one clear reason first', '先要一个明确的理由', 'verdict-return', { mark: 'verdict-demanded-sydney', change: { notice: 8, doubt: 6, fear: 8 } })
    ]
  },
  'verdict-return': {
    part: 'verdict',
    outside: true,
    choices: [choice('verdict-return-door', 'Carry the ordinary shopping inside', '把普通的购物袋拿进去', 'verdict-kitchen-entry', { change: { fear: -6 } })]
  },
  'verdict-kitchen-entry': {
    part: 'verdict',
    clock: [0, 16, 30],
    note: ['There is company again. You have to prepare supper.', '家里又来了客人。你得准备晚饭。'],
    choices: [choice('verdict-kitchen-enter', 'Keep your hands occupied', '让手上有事做', 'verdict-kitchen')]
  },
  'verdict-kitchen': {
    part: 'verdict',
    choices: [
      choice('verdict-kitchen-stove', 'Warm the food slowly', '慢慢把食物热好', 'verdict-stove', { once: true, minutes: 25, mark: 'verdict-meal-ready', change: { fear: -15, notice: -10, doubt: 6 } }),
      choice('verdict-kitchen-cups', 'Wash the cups while they speak', '趁他们说话，洗好杯子', 'verdict-cups', {
        once: true,
        minutes: 20,
        mark: 'verdict-meal-ready',
        hours: [16, 17],
        change: { notice: 18, doubt: 14, fear: 6 }
      }),
      choice('verdict-kitchen-pantry', 'Move the stool to reach a bowl', '挪凳子，拿一只碗', 'verdict-pantry', {
        once: true,
        minutes: 20,
        mark: 'verdict-meal-ready',
        change: { fear: -8, doubt: 10, notice: 5 }
      }),
      choice('verdict-kitchen-present', 'Bring supper to the doorway', '把晚饭端到门口', 'verdict-understood', { when: ['verdict-meal-ready'], change: { notice: -8 } })
    ]
  },
  'verdict-stove': { part: 'verdict', choices: [choice('verdict-stove-return', 'Turn the heat down', '把火调小', 'verdict-kitchen', { mark: 'verdict-kitchen-return' })] },
  'verdict-cups': { part: 'verdict', choices: [choice('verdict-cups-return', 'Put the last cup upside down', '把最后一只杯子倒扣好', 'verdict-kitchen', { mark: 'verdict-kitchen-return' })] },
  'verdict-pantry': { part: 'verdict', choices: [choice('verdict-pantry-return', 'Get down before answering', '先下来，再回答', 'verdict-kitchen', { mark: 'verdict-kitchen-return' })] },
  'verdict-understood': { part: 'verdict', choices: [choice('verdict-understood-listen', 'Ask them to say it again', '请他们再说一遍', 'verdict-guest-room', { change: { doubt: 8, notice: 12 } })] },
  'verdict-guest-room': {
    part: 'verdict',
    choices: [
      choice('verdict-room-name', 'Ask who was actually there', '问当时谁真的在场', 'verdict-name', { change: { doubt: 12 } }),
      choice('verdict-room-chronology', 'Ask what happened first', '问哪件事先发生', 'verdict-name', { mark: 'verdict-asked-order', change: { doubt: 10, fear: 5 } })
    ]
  },
  'verdict-name': { part: 'verdict', choices: [choice('verdict-name-door', 'Look towards the door behind the chair', '看椅子后面的那扇门', 'verdict-door', { change: { fear: 8 } })] },
  'verdict-door': {
    part: 'verdict',
    note: ['The room offers an answer before you finish asking.', '问题还没问完，房间已经给出答案。'],
    choices: [
      choice('verdict-door-stay', 'Stay long enough to watch the hands', '留下来，看清那双手', 'verdict-stayed', {
        test: { stat: 'fear', threshold: 30, low: true, pass: 'verdict-stayed', fail: 'verdict-bolted' },
        change: { notice: 8 }
      })
    ]
  },
  'verdict-stayed': {
    part: 'verdict',
    choices: [choice('verdict-stayed-edge', 'Keep to the edge of the room', '沿着房间边缘走', 'verdict-corridor', { mark: 'verdict-seen-hands', change: { fear: 6, doubt: 10 } })]
  },
  'verdict-bolted': {
    part: 'verdict',
    choices: [choice('verdict-bolted-breathe', 'Breathe with your hand against the wall', '扶住墙，慢慢呼吸', 'verdict-corridor', { mark: 'verdict-fled-chair', change: { fear: -18, doubt: 12 } })]
  },
  'verdict-corridor': {
    part: 'verdict',
    choices: [
      choice('verdict-corridor-move', 'Follow the wall, not the voices', '沿着墙走，不跟着声音', 'verdict-map', { change: { fear: -10 } }),
      choice('verdict-corridor-shut', 'Limit the reach with the door', '借门挡住伸来的手', 'verdict-map', {
        when: ['verdict-door-stay-pass'],
        mark: 'verdict-shut-reaching-door',
        change: { fear: -12, notice: 5 }
      }),
      choice('verdict-corridor-count', 'Count the floorboards while moving', '数着木板往前走', 'verdict-map', {
        when: ['verdict-door-stay-fail'],
        mark: 'verdict-counted-floor',
        change: { fear: -16 }
      })
    ]
  },
  'verdict-map': {
    part: 'verdict',
    choices: [
      choice('verdict-map-fold', 'Fold the paper without covering the gap', '折起纸，但不遮住空白', 'verdict-laboratory', {
        when: ['verdict-copy-check-pass'],
        mark: 'verdict-preserved-gap',
        change: { doubt: 8 }
      }),
      choice('verdict-map-keep-error', 'Keep the crossed-out sentence visible', '让划掉的句子仍看得见', 'verdict-laboratory', {
        when: ['verdict-copy-check-fail'],
        mark: 'verdict-kept-contradiction',
        change: { doubt: 10, fear: -6 }
      }),
      choice('verdict-map-pocket', 'Put the paper away', '把纸收起来', 'verdict-laboratory', { change: { fear: -4 } })
    ]
  },
  'verdict-laboratory': {
    part: 'verdict',
    choices: [
      choice('verdict-lab-edge', 'Watch from the threshold', '站在门槛上看', 'verdict-light', { change: { doubt: 10, fear: 8 } }),
      choice('verdict-lab-shut', 'Push the door almost closed', '把门推得只剩一条缝', 'verdict-light', { mark: 'verdict-lab-slit', change: { fear: -8 } })
    ]
  },
  'verdict-light': { part: 'verdict', choices: [choice('verdict-light-answer', 'Ask the question without choosing a name', '先不指定名字，只问那个问题', 'verdict-answer', { change: { doubt: 8 } })] },
  'verdict-answer': {
    part: 'verdict',
    choices: [choice('verdict-answer-place', 'Make room for the person who saw it', '给目击者留一个位置', 'verdict-threshold', { mark: 'verdict-witness-place', change: { doubt: 8, notice: 10 } })]
  },
  'verdict-threshold': { part: 'verdict', choices: [choice('verdict-threshold-test', 'Ask why nobody came upstairs', '问为什么没人上楼', 'verdict-hear-again', { change: { fear: 10 } })] },
  'verdict-hear-again': {
    part: 'verdict',
    note: ['The same glass breaks behind every explanation.', '每一种解释后面，都是同一阵玻璃碎裂声。'],
    choices: [
      choice('verdict-hear-continue', 'Keep asking for a complete account', '继续要求他们讲完整', 'verdict-table-again', { change: { notice: 10, doubt: -12 } }),
      choice('verdict-hear-listen', 'Listen to where the voice comes from', '听清声音从哪里来', 'verdict-table-again', { mark: 'verdict-listened-child', change: { doubt: 10 } })
    ]
  },
  'verdict-table-again': {
    part: 'verdict',
    choices: [
      choice('verdict-seal-answer', 'Promise to keep their words inside the house', '答应把他们的话藏在家里', 'verdict', {
        mark: 'verdict-vow-sealed',
        change: { doubt: -18, fear: -12 }
      }),
      choice('verdict-find-child', 'Refuse and look for the child upstairs', '不答应，去找楼上的孩子', 'verdict-final-question', {
        mark: 'verdict-vow-broken',
        change: { doubt: 10, fear: 12, notice: 10 }
      })
    ]
  },
  'verdict-final-question': {
    part: 'verdict',
    choices: [choice('verdict-final-follow', 'Look for the child who is calling', '去找那个正在喊人的孩子', 'verdict-child-call', { change: { fear: -5 } })]
  },
  'verdict-child-call': { part: 'verdict', choices: [choice('verdict-child-open', 'Open the door yourself', '自己推开门', 'verdict')] },
  verdict: { part: 'verdict', ending: 'verdict', note: ['The visitor asked for silence. You remember what you answered.', '来客要求你保密。你记得自己怎样回答。'], choices: [] }
};
