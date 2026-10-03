// ./src/module/constants/lost-lamb-stay.ts

import { choice, type LostLambScene } from './lost-lamb-types';

export const LOST_LAMB_STAY_SCENES: Record<string, LostLambScene> = {
  'stay-start': {
    part: 'stay',
    note: ['Sydney has gone home. You want the next visit to begin.', '悉尼回家了。你盼着下一次来访。'],
    choices: [
      choice('stay-clear-shelf', 'Make room on the shelf', '腾出书架上的位置', 'stay-shelf', { change: { fear: -2 } }),
      choice('stay-run-window', 'Watch from the window', '去窗边看一会儿', 'stay-shelf', { mark: 'stay-window', change: { fear: 8, notice: 5 } })
    ]
  },
  'stay-shelf': { part: 'stay', choices: [choice('stay-next-visit', 'Wait for the next visit', '等下一次来访', 'stay-visit')] },
  'stay-visit': {
    part: 'stay',
    clock: [3, 14, 10],
    choices: [
      choice('stay-visit-tease', 'Insist Sydney was late', '坚持说悉尼来晚了', 'stay-rain', { mark: 'stay-teased', change: { fear: 5, notice: 5 } }),
      choice('stay-visit-bag', 'Ask what is in the bag', '问袋子里装着什么', 'stay-rain', { change: { doubt: 2 } })
    ]
  },
  'stay-rain': { part: 'stay', weather: 'lightPrecipitation', choices: [choice('stay-games', 'Choose something to play indoors', '选个能在屋里玩的游戏', 'stay-rain-hub')] },
  'stay-rain-hub': {
    part: 'stay',
    weather: 'lightPrecipitation',
    note: ['The third stair creaks. Two taps, a pause, and one mean the landing is clear.', '第三级台阶会响。敲两下，停一会儿，再敲一下，表示楼梯口没有大人。'],
    choices: [
      choice('stay-play-cards', 'Play the card game', '玩纸牌游戏', 'stay-cards', { mark: 'stay-cards', once: true, minutes: 15 }),
      choice('stay-play-hide', 'Play hide-and-seek', '玩捉迷藏', 'stay-hide', { mark: 'stay-hidden', once: true, minutes: 15 }),
      choice('stay-open-book', 'Check the picture in the book', '翻开书里的图画', 'stay-reading', {
        mark: 'stay-book',
        once: true,
        minutes: 10,
        needs: { stat: 'doubt', min: 8 },
        when: ['stay-cards']
      }),
      choice('stay-finish-games', 'Hear what is happening downstairs', '听听楼下有什么动静', 'stay-rain-door', { when: ['stay-cards', 'stay-hidden'] })
    ]
  },
  'stay-cards': {
    part: 'stay',
    weather: 'lightPrecipitation',
    choices: [
      choice('stay-cards-fair', 'Put the cards back in the agreed order', '按说好的顺序重新摆牌', 'stay-cards-end', { mark: 'stay-fair', change: { doubt: 5, fear: -3 } }),
      choice('stay-cards-win', 'Try to make the missing card count', '坚持把漏掉的那张也算进去', 'stay-cards-end', { mark: 'stay-score', change: { fear: 10, notice: 15 } })
    ]
  },
  'stay-cards-end': { part: 'stay', weather: 'lightPrecipitation', choices: [choice('stay-cards-back', 'Choose another game', '再选一个游戏', 'stay-rain-hub')] },
  'stay-hide': {
    part: 'stay',
    weather: 'lightPrecipitation',
    choices: [
      choice('stay-hide-cupboard', 'Hide behind the wardrobe door', '躲在衣柜门后', 'stay-hide-listen', { mark: 'stay-cupboard', change: { fear: 20, notice: 5 } }),
      choice('stay-hide-curtain', 'Hide behind the curtain', '躲在窗帘后', 'stay-hide-listen', { change: { fear: 5, notice: 10 } })
    ]
  },
  'stay-hide-listen': {
    part: 'stay',
    weather: 'lightPrecipitation',
    choices: [
      choice('stay-hide-count', 'Wait for the whole signal', '等暗号敲完', 'stay-hide-pass', { test: { stat: 'fear', threshold: 35, low: true, pass: 'stay-hide-pass', fail: 'stay-hide-fail' } })
    ]
  },
  'stay-hide-pass': {
    part: 'stay',
    weather: 'lightPrecipitation',
    choices: [choice('stay-hide-pass-back', 'Come out when Sydney calls', '等悉尼喊你再出去', 'stay-rain-hub', { change: { doubt: 4, fear: -5 } })]
  },
  'stay-hide-fail': {
    part: 'stay',
    weather: 'lightPrecipitation',
    choices: [choice('stay-hide-fail-back', 'Tell Sydney you heard something else', '告诉悉尼你听见了别的声音', 'stay-rain-hub', { change: { doubt: 2, fear: 5, notice: 10 } })]
  },
  'stay-reading': {
    part: 'stay',
    weather: 'lightPrecipitation',
    choices: [choice('stay-book-page', 'Turn the page without changing the ending', '不改结局，直接翻页', 'stay-reading-end', { change: { doubt: 4 } })]
  },
  'stay-reading-end': { part: 'stay', weather: 'lightPrecipitation', choices: [choice('stay-reading-back', 'Leave the book open', '把书摊着放下', 'stay-rain-hub')] },
  'stay-rain-door': {
    part: 'stay',
    weather: 'lightPrecipitation',
    choices: [
      choice('stay-rain-peep', 'Look through the gap', '从门缝看一眼', 'stay-coats', { mark: 'stay-peep', change: { doubt: 3, notice: 5 } }),
      choice('stay-rain-cups', 'Carry the cups downstairs', '把杯子拿下楼', 'stay-coats', { change: { fear: -3 } }),
      choice('stay-rain-keep-signal', 'Keep the landing clear for Sydney', '替悉尼留意楼梯口', 'stay-coats', {
        when: ['stay-hide-count-pass'],
        mark: 'stay-held-pause',
        change: { notice: -5, fear: -3 }
      })
    ]
  },
  'stay-coats': { part: 'stay', weather: 'lightPrecipitation', choices: [choice('stay-coat-goodbye', 'Say what you will play next time', '说好下次要玩什么', 'stay-waiting')] },
  'stay-waiting': {
    part: 'stay',
    clock: [6, 15, 0],
    note: ['Sydney was expected today. The second cup has not been used.', '今天本来要等到悉尼。第二只杯子一直没用过。'],
    choices: [choice('stay-wait-gate', 'Go as far as the gate', '去大门那里看看', 'stay-gate', { change: { fear: 5 } })]
  },
  'stay-gate': {
    part: 'stay',
    outside: true,
    choices: [
      choice('stay-gate-return', 'Go back before the lamps come on', '在路灯亮起前回去', 'stay-note', { mark: 'stay-went-home', minutes: 20, change: { fear: -3 } }),
      choice('stay-gate-late', 'Stay until the first lamp lights', '等到第一盏路灯亮起', 'stay-note', { mark: 'stay-long-wait', minutes: 90, change: { fear: 10, notice: 5 } })
    ]
  },
  'stay-note': {
    part: 'stay',
    choices: [
      choice('stay-note-send', 'Leave the note with the post', '把字条放进待寄的信里', 'stay-questions', { mark: 'stay-sent' }),
      choice('stay-note-pocket', 'Keep the note in your pocket', '把字条留在口袋里', 'stay-questions', { mark: 'stay-unsent', change: { fear: 3 } })
    ]
  },
  'stay-questions': {
    part: 'stay',
    choices: [
      choice('stay-ask-family', 'Ask whether Sydney is forbidden to come', '问是不是不让悉尼来', 'stay-post', { mark: 'stay-asked', change: { doubt: 7, notice: 10 } }),
      choice('stay-ask-next', 'Ask when the next visit will be', '问下次什么时候来', 'stay-post', { change: { doubt: 3 } })
    ]
  },
  'stay-post': { part: 'stay', clock: [3, 15, 20], choices: [choice('stay-school-go', 'Look for Sydney after school', '放学后去找悉尼', 'stay-school', { change: { doubt: 4 } })] },
  'stay-school': {
    part: 'stay',
    outside: true,
    choices: [
      choice('stay-school-call', 'Call before Sydney goes through the gate', '赶在悉尼出校门前喊住', 'stay-parting', { mark: 'stay-school-loud', change: { notice: 10, fear: 3 } }),
      choice('stay-school-walk', 'Walk beside Sydney', '走到悉尼旁边', 'stay-parting', { change: { notice: -5 } })
    ]
  },
  'stay-parting': {
    part: 'stay',
    outside: true,
    note: ['Sydney says the visits are forbidden. The reason is not finished.', '悉尼说不被允许来访。原因没有说完。'],
    choices: [
      choice('stay-parting-accept', 'Let Sydney go', '让悉尼先走', 'stay-walk', { change: { fear: -5 } }),
      choice('stay-parting-promise', 'Ask Sydney to remember the next game', '让悉尼记住下次的游戏', 'stay-walk', { mark: 'stay-next-game', change: { fear: 8, doubt: 3 } })
    ]
  },
  'stay-walk': {
    part: 'stay',
    outside: true,
    choices: [
      choice('stay-walk-count', 'Watch the shop windows on the way home', '回家时留意沿路的橱窗', 'stay-supper', { mark: 'stay-counted', change: { doubt: 6 } }),
      choice('stay-walk-rush', 'Hurry home with the note held tightly', '攥紧字条，赶快回家', 'stay-supper', { change: { fear: 5 } })
    ]
  },
  'stay-supper': { part: 'stay', choices: [choice('stay-second-cup', 'Leave the second cup out', '把第二只杯子留在桌上', 'stay-lamp', { change: { notice: 5 } })] },
  'stay-lamp': { part: 'stay', clock: [0, 20, 10], choices: [choice('stay-lamp-look', 'See where the light is coming from', '看看光是从哪里来的', 'stay-knock', { change: { fear: 8 } })] },
  'stay-knock': {
    part: 'stay',
    note: ['Sydney’s signal has a pause. The sound below did not wait.', '悉尼的暗号中间会停一下。下面的声音没有等。'],
    choices: [
      choice('stay-knock-test', 'Listen before opening anything', '先听清，再开门', 'stay-knock-pass', { test: { stat: 'doubt', threshold: 20, pass: 'stay-knock-pass', fail: 'stay-knock-fail' } })
    ]
  },
  'stay-knock-pass': { part: 'stay', choices: [choice('stay-knock-pass-move', 'Keep away from the door that answered', '避开应声的那扇门', 'stay-back-door', { change: { doubt: 8, fear: 5 } })] },
  'stay-knock-fail': {
    part: 'stay',
    choices: [choice('stay-knock-fail-move', 'Retreat before the hand can reach you', '赶在那只手碰到前退开', 'stay-back-door', { change: { doubt: 12, fear: 15, notice: 15 } })]
  },
  'stay-back-door': {
    part: 'stay',
    choices: [
      choice('stay-back-room', 'Return to the room with the picture', '回放着画纸的房间', 'stay-morning-return', { change: { notice: -5 } }),
      choice('stay-back-latch', 'Check the latch without opening the door', '不开门，只试门扣', 'stay-morning-return', {
        when: ['stay-knock-test-pass'],
        needs: { stat: 'fear', max: 60 },
        mark: 'stay-latch-checked',
        change: { doubt: 6, notice: -8 }
      }),
      choice('stay-back-correct', 'Tap the signal on the wall where you can see it', '在看得见的墙上重新敲暗号', 'stay-morning-return', {
        when: ['stay-knock-test-fail'],
        mark: 'stay-corrected-signal',
        change: { doubt: 6, fear: -5 }
      })
    ]
  },
  'stay-morning-return': {
    part: 'stay',
    clock: [1, 14, 10],
    note: ['Sydney is here again. The afternoon light has returned, but the latch feels wrong.', '悉尼又来了。下午的光回来了，门扣的触感却不对。'],
    choices: [choice('stay-return-friend', 'Go down to meet Sydney', '下楼迎接悉尼', 'stay-rehearsal')]
  },
  'stay-rehearsal': { part: 'stay', choices: [choice('stay-rehearse-change', 'Choose something different this time', '这次换一种玩法', 'stay-repeat-hub', { change: { doubt: 4 } })] },
  'stay-repeat-hub': {
    part: 'stay',
    note: ['The window shadow stays still. Sydney waits for you to choose each movement.', '窗前的影子没有移动。悉尼等你决定每一个动作。'],
    choices: [
      choice('stay-move-cups', 'Change the places of the cups', '换一下杯子的位置', 'stay-cups', { mark: 'stay-cups', once: true, minutes: 10, change: { doubt: 8 } }),
      choice('stay-change-rules', 'Let Sydney choose the rules', '让悉尼决定游戏规则', 'stay-rules', { mark: 'stay-rules', once: true, minutes: 10, change: { doubt: 8, notice: 8 } }),
      choice('stay-check-drawing', 'Try the door in the drawing', '试试画里的门', 'stay-drawing-check', {
        mark: 'stay-tested-drawing',
        once: true,
        minutes: 10,
        needs: { stat: 'doubt', min: 35 },
        when: ['stay-cups'],
        change: { doubt: 5 }
      }),
      choice('stay-check-exit', 'Check the way downstairs', '看看下楼的路', 'stay-stairs', { when: ['stay-cups', 'stay-rules'] })
    ]
  },
  'stay-cups': {
    part: 'stay',
    choices: [
      choice('stay-cups-quiet', 'Move only your own cup', '只移动自己的杯子', 'stay-cups-end', { mark: 'stay-own-cup', change: { notice: -5 } }),
      choice('stay-cups-drop', 'Let the spoon fall between them', '让勺子掉到杯子中间', 'stay-cups-end', { mark: 'stay-dropped-spoon', change: { notice: 12, fear: 8 } })
    ]
  },
  'stay-cups-end': { part: 'stay', choices: [choice('stay-cups-return', 'Leave the table as it is', '不再动桌上的东西', 'stay-repeat-hub')] },
  'stay-rules': {
    part: 'stay',
    choices: [
      choice('stay-rule-refuse', 'Say that you do not want to win', '说自己不想赢', 'stay-rules-end', { mark: 'stay-no-win', change: { doubt: 5, fear: 5 } }),
      choice('stay-rule-wait', 'Wait for a rule you did not suggest', '等一个不是你提出来的规则', 'stay-rules-end', { change: { doubt: 5, notice: -5 } })
    ]
  },
  'stay-rules-end': { part: 'stay', choices: [choice('stay-rules-return', 'Put the game away', '把游戏收起来', 'stay-repeat-hub')] },
  'stay-drawing-check': { part: 'stay', choices: [choice('stay-drawing-touch', 'Keep one hand on the real wall', '留一只手按着真正的墙', 'stay-drawing-end', { change: { fear: -3 } })] },
  'stay-drawing-end': { part: 'stay', choices: [choice('stay-drawing-return', 'Fold the paper before the window changes', '趁窗户还没变，折起画纸', 'stay-repeat-hub')] },
  'stay-stairs': {
    part: 'stay',
    note: ['The third stair warned you during the game. Making noise now brings the waiting faces closer.', '玩游戏时，第三级台阶会提醒你。现在发出声音，等着的脸便会靠近。'],
    choices: [
      choice('stay-stairs-test', 'Cross while Sydney looks towards the garden', '趁悉尼看着花园，走过去', 'stay-quiet-pass', {
        test: { stat: 'notice', threshold: 35, low: true, pass: 'stay-quiet-pass', fail: 'stay-quiet-fail' }
      })
    ]
  },
  'stay-quiet-pass': { part: 'stay', choices: [choice('stay-pass-out', 'Keep the window between you', '让窗户隔在你们中间', 'stay-street', { change: { fear: -5 } })] },
  'stay-quiet-fail': { part: 'stay', choices: [choice('stay-fail-out', 'Leave before the face turns fully', '赶在那张脸完全转过来前离开', 'stay-street', { change: { fear: 12 } })] },
  'stay-street': { part: 'stay', outside: true, choices: [choice('stay-street-follow', 'Follow the sound of the delivery cart', '循着送货车的声音走', 'stay-wall', { change: { doubt: 5 } })] },
  'stay-wall': {
    part: 'stay',
    outside: true,
    choices: [
      choice('stay-wall-mark', 'Keep the old scratch in sight', '盯住原来那道划痕', 'stay-errand', { mark: 'stay-wall-line', change: { doubt: 5 } }),
      choice('stay-wall-hand', 'Keep a hand on the bricks', '用手扶着砖墙', 'stay-errand', { change: { fear: -3 } })
    ]
  },
  'stay-errand': {
    part: 'stay',
    outside: true,
    choices: [
      choice('stay-let-fetch', 'Let Sydney go ahead alone', '让悉尼一个人先过去', 'stay-shadow', { mark: 'stay-friend-alone', change: { doubt: 5 } }),
      choice('stay-walk-together', 'Walk beside Sydney without holding on', '不抓着悉尼，并肩走过去', 'stay-shadow', { change: { fear: 3 } })
    ]
  },
  'stay-shadow': {
    part: 'stay',
    outside: true,
    note: ['The figure can follow a direction. It cannot leave while you are waiting for it to stay.', '那身影能照着指示走。你等着它留下时，它却无法离开。'],
    choices: [choice('stay-shadow-shed', 'Move where the window cannot see you', '去窗户看不到的地方', 'stay-shed', { change: { notice: -10 } })]
  },
  'stay-shed': {
    part: 'stay',
    outside: true,
    choices: [
      choice('stay-shed-listen', 'Listen to the knocks from both sides', '听清两边的敲击声', 'stay-heard', {
        mark: 'stay-trusted-pause',
        needs: { stat: 'doubt', min: 45 },
        when: ['stay-hide-count-pass'],
        change: { fear: -5 }
      }),
      choice('stay-shed-corrected', 'Use the signal you practised on the wall', '用在墙上重新敲过的暗号', 'stay-heard', {
        when: ['stay-corrected-signal'],
        needs: { stat: 'doubt', min: 45 },
        mark: 'stay-trusted-pause',
        change: { fear: -5 }
      }),
      choice('stay-shed-open', 'Open the side with daylight', '推开透着白昼的那一侧', 'stay-heard', { mark: 'stay-trusted-light', change: { fear: 8 } })
    ]
  },
  'stay-heard': { part: 'stay', outside: true, choices: [choice('stay-heard-call', 'Say Sydney’s name once', '只喊一声悉尼的名字', 'stay-grip')] },
  'stay-grip': {
    part: 'stay',
    outside: true,
    choices: [
      choice('stay-bind-vow', 'Promise never to let Sydney leave again', '答应以后不让悉尼走', 'stay-gate-closes', { mark: 'stay-vow-bound', change: { fear: -12, doubt: -10 } }),
      choice('stay-break-vow', 'Make it let go, even if the afternoon ends', '让它松手，哪怕下午结束', 'stay-gate-closes', { mark: 'stay-vow-broken', change: { fear: 15, doubt: 8 } })
    ]
  },
  'stay-gate-closes': {
    part: 'stay',
    outside: true,
    note: ['The last knock comes from the window. You remember what you promised at the lock.', '最后的敲击来自窗边。你记得自己在锁前作出的约定。'],
    choices: [
      choice('stay-final-lock', 'Try to take your hand off the latch', '试着把手从门闩上拿开', 'stay', { when: ['stay-vow-bound'] }),
      choice('stay-final-leave', 'Run with the torn paper in your hand', '握着撕破的纸，跑出去', 'stay', { when: ['stay-vow-broken'] })
    ]
  },
  stay: { part: 'stay', ending: 'stay', choices: [] }
};
