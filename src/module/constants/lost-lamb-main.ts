// ./src/module/constants/lost-lamb-main.ts

import { choice, type LostLambScene } from './lost-lamb-types';

export const LOST_LAMB_MAIN_SCENES: Record<string, LostLambScene> = {
  'main-start': {
    part: 'main',
    gate: 'branches',
    clock: [7, 14, 0],
    note: ['Sydney has not come. You still have the place beside your things.', '悉尼没有来。你自己的东西旁边，还留着位置。'],
    choices: [choice('main-wait', 'Wait where the street is visible', '去能看见街道的地方等', 'main-missed', { minutes: 40, change: { doubt: 8, fear: -5 } })]
  },
  'main-missed': {
    part: 'main',
    choices: [
      choice('main-ask-sydney', 'Find Sydney where no visit needs arranging', '去一个不用安排来访的地方找悉尼', 'main-school', { minutes: 30, change: { doubt: -5 } }),
      choice('main-show-drawing', 'Take the drawing along', '带上那张画', 'main-school', { when: ['draw'], mark: 'drawing-carried', minutes: 30, change: { doubt: -8 } })
    ]
  },
  'main-school': {
    part: 'main',
    outside: true,
    clock: [2, 15, 0],
    choices: [choice('main-listen-friend', 'Give Sydney time to answer', '给悉尼一点回答的时间', 'main-return', { minutes: 15, change: { doubt: 5 } })]
  },
  'main-return': {
    part: 'main',
    note: ['The visits were forbidden. Sydney did not finish saying why.', '来访被禁止了。悉尼没能说完原因。'],
    choices: [choice('main-return-supper', 'Put the coat away', '把外套挂好', 'main-small-help', { minutes: 20, change: { fear: -5 } })]
  },
  'main-small-help': { part: 'main', choices: [choice('main-coat-mended', 'Put the coat on its hook again', '把外套重新挂好', 'main-evening', { minutes: 15, change: { fear: -5 } })] },
  'main-evening': {
    part: 'main',
    clock: [4, 18, 0],
    note: ['Your parents are excited tonight. They want you in bed early.', '今晚父母很兴奋，想让你早点上床。'],
    choices: [
      choice('main-eve-ask', 'Ask why they are so excited', '问他们为什么这么兴奋', 'main-bed', { mark: 'eve-ask', minutes: 10, change: { doubt: 8 } }),
      choice('main-eve-stay', 'Ask to stay up a little longer', '想再晚些睡', 'main-bed', { minutes: 10, change: { fear: -3 } })
    ]
  },
  'main-bed': { part: 'main', clock: [0, 20, 0], choices: [choice('main-close-eyes', 'Lie down and wait for sleep', '躺下，等自己睡着', 'main-noise', { minutes: 20, change: { fear: 15 } })] },
  'main-noise': {
    part: 'main',
    clock: [0, 23, 0],
    choices: [
      choice('main-night-call', 'Call for your parents', '喊父母', 'main-listen', { mark: 'called', minutes: 2, change: { fear: 15, notice: 18 } }),
      choice('main-night-watch', 'Watch the handle without moving', '不动，盯着门把', 'main-listen', { minutes: 2, change: { fear: 10, notice: -5 } })
    ]
  },
  'main-listen': {
    part: 'main',
    choices: [
      choice('main-breathe', 'Make a little space beneath the covers and breathe', '在被子下面撑出小空隙，呼吸', 'main-count', {
        minutes: 5,
        test: { stat: 'fear', threshold: 25, low: true, pass: 'main-count', fail: 'main-choke' },
        change: { fear: -8 }
      })
    ]
  },
  'main-count': { part: 'main', choices: [choice('main-count-dawn', 'Keep one finger on the loose stitch', '用一根手指勾着那针松线', 'main-grey', { minutes: 15, change: { notice: -8 } })] },
  'main-choke': {
    part: 'main',
    choices: [choice('main-choke-dawn', 'Keep a little space beneath the covers until morning', '守住被子下的小空隙，等天亮', 'main-grey', { minutes: 15, change: { fear: -12, notice: 10 } })]
  },
  'main-grey': {
    part: 'main',
    clock: [1, 7, 0],
    note: ['The windows broke. You stayed beneath the covers until morning.', '窗户碎了。你藏在被子下面，直到早晨。'],
    choices: [choice('main-downstairs', 'Put your shoes on and go down', '穿好鞋，下楼', 'main-landing', { minutes: 10, change: { fear: 8 } })]
  },
  'main-landing': {
    part: 'main',
    choices: [
      choice('main-find-parents', 'Call at your parents’ door', '去父母房门口喊人', 'main-door', { minutes: 5, change: { notice: 12 } }),
      choice('main-find-food', 'Get behind the kitchen table first', '先到厨房桌子后面', 'main-pantry', { minutes: 5, change: { fear: -5 } })
    ]
  },
  'main-door': { part: 'main', choices: [choice('main-open-parent', 'Keep a foot outside while opening it', '留一只脚在外面，推开门', 'main-parent', { minutes: 3, change: { fear: 10 } })] },
  'main-parent': {
    part: 'main',
    note: ['A gaunt face and silver nails beneath the bed. You recognise a little movement.', '床下有憔悴的脸和银色指甲。你认得一个小动作。'],
    choices: [choice('main-back-parent', 'Leave the bedroom and go down to the kitchen', '离开卧室，下楼去厨房', 'main-pantry', { mark: 'saw-parent', minutes: 5, change: { fear: 15, doubt: -10 } })]
  },
  'main-pantry': {
    part: 'main',
    choices: [
      choice('main-eat-first', 'Eat enough to stop your hands shaking', '先吃一点，让手别抖', 'main-eat', { mark: 'ate-first', minutes: 15, change: { fear: -12, notice: -5 } }),
      choice('main-share-first', 'Prepare all three portions first', '先做好三份食物', 'main-share', { minutes: 15, change: { fear: 8, notice: 5 } })
    ]
  },
  'main-eat': { part: 'main', choices: [choice('main-fed-yourself', 'Carry the other portions out', '把另外几份拿出去', 'main-feed', { minutes: 5, change: { notice: 5 } })] },
  'main-share': { part: 'main', choices: [choice('main-serve-first', 'Carry the first plate out', '把第一盘拿出去', 'main-feed', { minutes: 5, change: { notice: 10 } })] },
  'main-feed': {
    part: 'main',
    choices: [
      choice('main-offer', 'Slide the plate without calling again', '不再喊人，把盘子滑过去', 'main-food-quiet', {
        minutes: 5,
        test: { stat: 'notice', threshold: 25, low: true, pass: 'main-food-quiet', fail: 'main-food-spill' },
        change: { notice: -8 }
      })
    ]
  },
  'main-food-quiet': { part: 'main', choices: [choice('main-feed-step-back', 'Leave the plate and move away', '留下盘子，退开', 'main-clear', { minutes: 5, change: { fear: -8 } })] },
  'main-food-spill': {
    part: 'main',
    choices: [choice('main-feed-free', 'Let go of the plate and free your sleeve', '松开盘子，抽回袖子', 'main-clear', { minutes: 5, change: { fear: 12, notice: 10 } })]
  },
  'main-clear': {
    part: 'main',
    choices: [
      choice('main-sweep-action', 'Clear a strip beside the wall', '沿墙清出一条窄路', 'main-sweep', { once: true, mark: 'path', minutes: 25, change: { notice: 15, fear: -8 } }),
      choice('main-water-action', 'Drink and wash at the sink', '去水槽边喝水、洗手', 'main-wash', { once: true, mark: 'had-water', minutes: 20, change: { fear: -18, notice: -10 } }),
      choice('main-garden-action', 'See whether the gate still opens', '看看大门还能不能打开', 'main-garden', { once: true, mark: 'outside-view', minutes: 20, change: { doubt: -10, notice: -5 } }),
      choice('main-leave-yard', 'Go outside along the strip you cleared', '沿清出的窄路出去', 'main-street', { when: ['path'], minutes: 10, change: { fear: -5 } }),
      choice('main-quiet-garden', 'Use the garden doorway before the breathing moves', '趁呼吸还没换位置，从花园门走', 'main-backgate', {
        when: ['main-offer-pass'],
        unless: ['path'],
        minutes: 10,
        change: { doubt: 5, notice: -5 }
      })
    ]
  },
  'main-sweep': { part: 'main', choices: [choice('main-sweep-return', 'Leave the brush within reach', '把刷子放在够得到的位置', 'main-clear', { minutes: 5 })] },
  'main-wash': { part: 'main', choices: [choice('main-water-return', 'Keep the cup on the counter', '把杯子留在柜台上', 'main-clear', { minutes: 5 })] },
  'main-garden': {
    part: 'main',
    outside: true,
    note: ['The gate is not locked. People are passing in the street.', '大门没有锁。街上有人经过。'],
    choices: [choice('main-garden-return', 'Make room to get through the entrance', '留出能经过入口的空处', 'main-clear', { minutes: 5 })]
  },
  'main-backgate': {
    part: 'main',
    outside: true,
    choices: [choice('main-backgate-street', 'Keep the wall between you and the broken windows', '让墙隔在你和碎窗之间', 'main-street', { minutes: 10, change: { doubt: -5 } })]
  },
  'main-street': {
    part: 'main',
    outside: true,
    choices: [
      choice('main-call-help', 'Say that something happened to your parents', '说父母出事了', 'main-helper', {
        unless: ['verdict-vow-sealed'],
        minutes: 20,
        test: { stat: 'doubt', threshold: 10, low: true, pass: 'main-helper', fail: 'main-silent' },
        change: { doubt: -10 }
      }),
      choice('main-help-without-words', 'Keep the names to yourself and point to the broken window', '不说名字，只指给对方看碎窗', 'main-silent', {
        when: ['verdict-vow-sealed'],
        minutes: 20,
        change: { doubt: 5, fear: 8 }
      })
    ]
  },
  'main-helper': {
    part: 'main',
    outside: true,
    choices: [choice('main-helper-gate', 'Let the person walk as far as the gate', '让对方陪到大门边', 'main-entrance', { mark: 'first-help', minutes: 15, change: { fear: -10, doubt: -8 } })]
  },
  'main-silent': {
    part: 'main',
    outside: true,
    choices: [choice('main-silent-gate', 'Show the broken window instead', '改指给对方看碎窗', 'main-entrance', { minutes: 15, change: { fear: 5, doubt: -5 } })]
  },
  'main-entrance': {
    part: 'main',
    choices: [choice('main-let-visitor', 'Stay beside the entrance while they look', '留在入口旁，让对方看看', 'main-visitor', { minutes: 15, change: { notice: 10 } })]
  },
  'main-visitor': { part: 'main', choices: [choice('main-visitor-step', 'Ask them to wait outside the bedroom', '请对方别进卧室', 'main-private', { minutes: 20, change: { notice: -5, fear: 5 } })] },
  'main-private': {
    part: 'main',
    note: ['An adult has seen that something is wrong. They cannot explain the things beneath the bed.', '有大人看出了不对劲，却解释不了床下的东西。'],
    choices: [
      choice('main-private-supper', 'Keep the offered contact where you can find it', '把留下的联系方式放在找得到的地方', 'main-night-food', {
        mark: 'first-contact',
        minutes: 20,
        change: { doubt: -10 }
      })
    ]
  },
  'main-night-food': {
    part: 'main',
    clock: [0, 18, 0],
    choices: [choice('main-night-own-share', 'Eat your own portion sitting down', '坐下来，吃自己那份', 'main-night-room', { minutes: 30, change: { fear: -10 } })]
  },
  'main-night-room': {
    part: 'main',
    clock: [0, 21, 0],
    choices: [choice('main-night-rest', 'Lie down where the latch is visible', '躺在能看见门闩的位置', 'main-morning', { minutes: 30, change: { notice: -15 } })]
  },
  'main-morning': {
    part: 'main',
    clock: [1, 7, 0],
    choices: [choice('main-breakfast-start', 'Prepare enough bread for the morning', '准备够早晨吃的面包', 'main-breakfast', { minutes: 15, change: { fear: -5 } })]
  },
  'main-breakfast': {
    part: 'main',
    choices: [
      choice('main-carry-all', 'Balance all the breakfast on both hands', '用两只手端齐早餐', 'main-kitchen', { mark: 'breakfast-full', minutes: 5, change: { notice: 12 } }),
      choice('main-carry-one', 'Leave one hand free', '腾出一只手', 'main-kitchen', { mark: 'free-hand', minutes: 5, change: { fear: -5 } })
    ]
  },
  'main-kitchen': {
    part: 'main',
    note: ['The movement reached the kitchen. Yesterday’s safe place is not safe enough.', '动静已经来到厨房。昨天安全的位置不够安全了。'],
    choices: [
      choice('main-wet-cup', 'Get around the table without picking the cup up', '绕过桌子，不捡杯子', 'main-cup', { when: ['breakfast-full'], minutes: 10, change: { fear: 10 } }),
      choice('main-hold-chair', 'Keep the chair in front of you until you reach the garden', '让椅子一直挡在前面，退到花园', 'main-chair', { when: ['free-hand'], minutes: 10, change: { notice: -5 } })
    ]
  },
  'main-cup': { part: 'main', outside: true, choices: [choice('main-cup-shop', 'Take only what you can carry safely', '只拿能稳稳带走的东西', 'main-shop', { minutes: 25, change: { fear: -10 } })] },
  'main-chair': { part: 'main', outside: true, choices: [choice('main-chair-shop', 'Go somewhere with people in it', '去一个有人待着的地方', 'main-shop', { minutes: 25, change: { fear: -10 } })] },
  'main-shop': {
    part: 'main',
    outside: true,
    choices: [
      choice('main-errand-help', 'Admit that something is wrong and ask for company', '承认家里出事，请对方陪一段', 'main-help-home', {
        unless: ['verdict-vow-sealed'],
        mark: 'brought-help',
        minutes: 30,
        change: { doubt: -12, fear: -8 }
      }),
      choice('main-shop-break-silence', 'Break your promise and ask for help', '违背保密的约定，开口求助', 'main-help-home', {
        once: true,
        when: ['verdict-vow-sealed'],
        mark: 'verdict-vow-broken',
        minutes: 30,
        change: { doubt: 12, fear: 15, notice: 20 }
      }),
      choice('main-errand-hide', 'Say that somebody is waiting at home', '说家里有人在等', 'main-alone-home', { minutes: 30, change: { doubt: 10, fear: 5 } }),
      choice('main-errand-already', 'Tell the shopkeeper what you already told the last person', '把刚告诉那人的话，再说给店里的人听', 'main-help-home', {
        when: ['first-help'],
        minutes: 20,
        change: { doubt: -6, fear: -4 }
      })
    ]
  },
  'main-help-home': { part: 'main', choices: [choice('main-help-plan', 'Show them the place you can wait safely', '给对方看能安全等着的位置', 'main-late', { minutes: 15, change: { notice: 5 } })] },
  'main-alone-home': { part: 'main', choices: [choice('main-alone-plan', 'Use the contact left yesterday', '用昨天留下的联系方式', 'main-late', { minutes: 15, change: { doubt: -8 } })] },
  'main-late': {
    part: 'main',
    choices: [
      choice('main-watch-window', 'Look out without standing in the opening', '避开开口，往外看', 'main-window', { once: true, mark: 'window-checked', minutes: 15, change: { fear: -8, notice: -5 } }),
      choice('main-leave-message', 'Say exactly where someone should meet you', '说清该到哪里接你', 'main-message', {
        once: true,
        unless: ['verdict-vow-sealed', 'contact-left'],
        mark: 'contact-left',
        minutes: 25,
        change: { doubt: -12 }
      }),
      choice('main-message-break-silence', 'Write where to find you, even though you promised silence', '写下接你的地方，哪怕答应过保密', 'main-message', {
        icon: 'lost-lamb/open-note.png',
        once: true,
        when: ['verdict-vow-sealed'],
        unless: ['contact-left'],
        mark: 'verdict-vow-broken',
        minutes: 25,
        change: { fear: 12, notice: 15 }
      }),
      choice('main-make-rest', 'Arrange somewhere to sit with the way out clear', '留出退路，整理一个能坐的位置', 'main-rest', { once: true, mark: 'rest-space', minutes: 20, change: { fear: -15 } }),
      choice('main-keep-silence', 'Put the note away and follow the voice inside', '收起字条，循着屋里的声音走', 'main-attempt', {
        icon: 'lost-lamb/folded-note.png',
        when: ['verdict-vow-sealed'],
        unless: ['contact-left'],
        mark: 'kept-silence',
        minutes: 10,
        change: { doubt: -8, notice: 15 }
      }),
      choice('main-last-crossing', 'Cross the hall while the light lasts', '趁天还亮，经过大厅', 'main-attempt', { when: ['contact-left'], minutes: 10, change: { notice: 10 } })
    ]
  },
  'main-window': { part: 'main', choices: [choice('main-window-return', 'Move away before you are called from below', '赶在楼下喊你前退开', 'main-late', { minutes: 5 })] },
  'main-message': {
    part: 'main',
    note: ['The message gives a place to meet. It does not need to explain the silver nails.', '消息写清了见面地点，不必先解释银色指甲。'],
    choices: [choice('main-message-return', 'Leave the message where it can be seen', '把消息留在能被看见的位置', 'main-late', { icon: 'lost-lamb/open-note.png', mark: 'contact-left', minutes: 5 })]
  },
  'main-rest': { part: 'main', choices: [choice('main-rest-return', 'Stand when your legs are steady enough', '等腿稳住再站起来', 'main-late', { minutes: 5 })] },
  'main-attempt': {
    part: 'main',
    choices: [
      choice('main-return-noise', 'Draw the movement towards the garden', '把动静引向花园', 'main-noise-way', { mark: 'garden-noise', minutes: 5, change: { notice: 18, fear: 8 } }),
      choice('main-return-wall', 'Keep close to the opposite wall', '贴着对面墙绕过去', 'main-wall-way', { minutes: 5, change: { notice: -8, fear: 5 } })
    ]
  },
  'main-noise-way': { part: 'main', choices: [choice('main-noise-stairs', 'Keep going up without looking back', '继续往上，不回头', 'main-upstairs', { minutes: 3, change: { fear: 8 } })] },
  'main-wall-way': { part: 'main', choices: [choice('main-wall-stairs', 'Use the turn before it can follow', '赶在它跟来前穿过转角', 'main-upstairs', { minutes: 3, change: { fear: 8 } })] },
  'main-upstairs': {
    part: 'main',
    choices: [
      choice('main-close-rug', 'Pull the rug clear and hold the door steady', '拖开地毯，稳住门', 'main-latch', {
        minutes: 5,
        test: { stat: 'fear', threshold: 35, low: true, pass: 'main-latch', fail: 'main-brace' },
        change: { notice: -12 }
      }),
      choice('main-rest-rug', 'Use the slower movement you practised while resting', '用休息时练过的慢动作移开地毯', 'main-latch', {
        when: ['rest-space'],
        minutes: 10,
        change: { fear: -8, notice: -10 }
      }),
      choice('main-free-rug', 'Keep one hand on the frame while pulling the rug', '留一只手扶门框，再拖地毯', 'main-latch', {
        when: ['free-hand'],
        unless: ['rest-space'],
        minutes: 10,
        change: { fear: -5, notice: -10 }
      })
    ]
  },
  'main-latch': {
    part: 'main',
    choices: [choice('main-latch-bed', 'Move to the bed after checking the catch', '检查门闩后，移到床边', 'main-inbed', { icon: 'lost-lamb/silver-latch.png', minutes: 5, change: { fear: -10 } })]
  },
  'main-brace': {
    part: 'main',
    choices: [choice('main-brace-rug', 'Keep your shoulder against it and pull the corner with your foot', '肩膀抵住，用脚拖开一角', 'main-inbed', { minutes: 15, change: { fear: -5, notice: 12 } })]
  },
  'main-inbed': {
    part: 'main',
    choices: [choice('main-listen-outside', 'Listen for the ordinary voice outside', '听听外面那个普通的声音', 'main-last-call', { minutes: 10, change: { doubt: -8, fear: -8 } })]
  },
  'main-last-call': {
    part: 'main',
    note: ['One voice offers to keep everyone inside. Another calls from beyond the window.', '一个声音许诺把所有人留下。另一个声音从窗外喊你。'],
    choices: [
      choice('main-offer-vow', 'Promise to keep everyone inside the door', '答应把门里的人都留下', 'main', { icon: 'lost-lamb/empty-pillow.png', mark: 'main-vow-offered', minutes: 5 }),
      choice('main-refuse-vow', 'Refuse and call to the person outside', '不答应，喊门外的人', 'main', {
        icon: 'lost-lamb/knocking-window.png',
        unless: ['verdict-vow-sealed'],
        mark: 'main-vow-refused',
        minutes: 5,
        change: { fear: 10 }
      }),
      choice('main-break-final-silence', 'Break your promise and call to the person outside', '违背保密的约定，喊门外的人', 'main', {
        icon: 'lost-lamb/knocking-window.png',
        when: ['verdict-vow-sealed'],
        mark: ['main-vow-refused', 'verdict-vow-broken'],
        minutes: 5,
        change: { fear: 10 }
      })
    ]
  },
  main: { part: 'main', gate: 'branches', ending: 'main', choices: [] }
};
