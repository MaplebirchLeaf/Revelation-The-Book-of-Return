// ./src/script/Revelation/Tips.ts

type Tip = readonly [english: string, chinese: string];

/** 接入原版随机提示池，只注册已启用剧情模块的提示。 */
export default function Tips(core: typeof maplebirch): void {
  const add = (...tips: Tip[]) => {
    core.tool.patch.tips.add('general', ...tips.map(([en, cn]) => `<<lanSwitch ${JSON.stringify(en)} ${JSON.stringify(cn)}>>`));
  };

  if (core.get('RobinTemple'))
    add(
      [
        'After joining the temple and taking its vow, you can discuss it in Robin’s room. Your relationship and Robin’s health still matter.',
        '加入神殿并佩戴贞操器具后，可以在罗宾的房间谈起神殿。你们的关系和罗宾的健康状况也会影响入口。'
      ],
      [
        'Robin’s trial needs an appointment with Jordan. Check your journal for the date before returning to the temple quarters.',
        '罗宾的试炼需要先向约旦预约。前往神殿宿舍前，可以在日志里确认日期。'
      ],
      [
        'Before Robin’s trial, an evening visit to the temple can help with preparation. School, tutoring and work may leave less time for it.',
        '罗宾参加试炼前，傍晚可以陪同去神殿准备。上学、家教和工作可能会占用这段时间。'
      ],
      ['Failing the trial does not end Robin’s route. Give Robin time before discussing another attempt.', '试炼失败不会结束罗宾的路线。先给罗宾一些时间，再谈是否重新尝试。'],
      [
        'Joining the temple does not make Robin available all day. A note or a temple attendant may tell you where to look.',
        '加入神殿后，罗宾也不会全天都有空。门口的字条或值班侍从可以告诉你去哪里找人。'
      ],
      [
        'Your grace and Robin’s temple contribution are separate. Praying for yourself does not complete Robin’s shared duties.',
        '你的恩典与罗宾的神殿贡献分别记录。为自己祈祷，不能代替和罗宾一起完成工作。'
      ],
      [
        'Robin’s faith and doubt can change through your time together. Listen when Robin has something to say about the temple.',
        '共同相处会影响罗宾的信仰与动摇。罗宾想谈神殿时，不妨听听对方的想法。'
      ],
      [
        'Jordan considers your contributions, shared work and Robin’s faith before approving a promise. Love alone is not enough.',
        '批准承诺仪式前，约旦会考虑你们的贡献、共同完成的工作和罗宾的信仰。仅有爱意还不够。'
      ],
      ['The temple will not authorise a second promise while the first still stands.', '已有共同誓约时，神殿不会再为你主持第二份承诺仪式。'],
      [
        'Your examination date keeps approaching even when Robin is absent. <span class="gold">Check the journal before it is due.</span>',
        '罗宾暂时不在，也不会推迟共同检查的日期。<span class="gold">记得查看日志里的检查安排。</span>'
      ],
      ['Agreeing to investigate a ritual is not the same as agreeing to take part. Robin and Sydney may need time to reconsider.', '答应调查仪式，不等于答应参加仪式。罗宾和悉尼可能需要时间重新考虑。']
    );

  if (core.get('TempleChoir'))
    add(
      ['Temple members can ask Jordan about the choir in the hall. You do not need to bring Robin to join.', '神殿成员可以在大厅向约旦询问唱诗班。加入时不需要带上罗宾。'],
      ['Choir practice runs from nine to six, once a day, except during Sunday mass.', '唱诗练习在上午九点至下午六点开放，每天一次。周日弥撒期间暂停练习。'],
      [
        'Report for choir duty between eleven and one on Sunday. Attending ordinary mass first uses the same daily opportunity.',
        '周日上午十一点至下午一点可以参加唱诗。先参加普通弥撒，也会占用当天的机会。'
      ],
      [
        '<span class="red">Starting choir duty uses your mass opportunity for the day.</span> Finish all three parts to earn its allowance bonus.',
        '<span class="red">开始唱诗就会占用当天的弥撒机会。</span>唱完三部分，才能登记本次津贴加款。'
      ],
      ['Fatigue and alcohol make singing harder. Recent practice helps you keep up with the choir.', '疲劳和醉酒会影响歌唱表现。近期练习有助于跟上唱诗班。'],
      ['Following the choir is easier than singing harmony or leading. Choose a part that suits your current singing level.', '跟唱比和声与领唱更容易。可以按当前歌唱等级选择适合自己的部分。'],
      ['Leading the choir requires practice, completed services and a good performance as well as singing skill.', '取得领唱许可不只看歌唱等级，也需要练习出勤、完整参加唱诗和较好的表现。'],
      [
        'Choir earnings are recorded in your journal. <span class="gold">Collect them with your monthly temple allowance after the examination.</span>',
        '唱诗收入会记在日志里。<span class="gold">月度检查后，随神殿津贴一并领取。</span>'
      ],
      [
        'If the temple withholds your allowance, earlier choir earnings remain on the ledger until you are allowed to collect them.',
        '神殿暂时扣发津贴时，已经登记的唱诗收入仍会保留，等获准领取时再结算。'
      ]
    );
}
