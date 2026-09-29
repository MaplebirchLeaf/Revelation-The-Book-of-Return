// ./src/script/RobinTemple.ts

/** Patch only stable macro structure; vanilla EN and CN labels differ. */
export default function RobinTemple(maplebirch: typeof window.maplebirch): void {
  maplebirch.tool.addTo('Journal', 'revelation-robin-temple-journal');
  maplebirch.tool.patch.traits.add({
    title: 'Special Traits',
    name: () => maplebirch.t('revelation-the-book-of-return:robinTemple:trait:promise:name'),
    colour: 'blue',
    has: () => V.RevelationRobinTemple?.stage === 'promised',
    text: () => maplebirch.t('revelation-the-book-of-return:robinTemple:trait:promise:text')
  });
  maplebirch.tool.inject({
    widgetPassage: {
      'Widgets Combat': [
        {
          // The original promise variable belongs to Sydney. Extend only the partner exception for Robin.
          src: '<<if $templePromised isnot $_taker>>',
          to: '<<if $templePromised isnot $_taker and !($RevelationRobinTemple.stage is "promised" and $_taker is "Robin")>>',
          expected: 1
        },
        {
          src: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot $_taker>>',
          to: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot $_taker and !($RevelationRobinTemple.stage is "promised" and $_taker is "Robin")>>',
          expected: 1
        },
        {
          src: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot _args[0]>>',
          to: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot _args[0] and !($RevelationRobinTemple.stage is "promised" and _args[0] is "Robin")>>',
          expected: 1
        },
        {
          src: '<<if ($_vType is "vaginal" or $_vType is "penile") and $_npc.virginity.temple is true and $templePromised isnot $_npc.fullDescription>>',
          to: '<<if ($_vType is "vaginal" or $_vType is "penile") and $_npc.virginity.temple is true and $templePromised isnot $_npc.fullDescription and !($RevelationRobinTemple.stage is "promised" and $_npc.fullDescription is "Robin")>>',
          expected: 1
        }
      ],
      'Widgets Robin': [
        {
          src: '\t\t<<robinbully>>',
          applybefore: '\t\t<<revelation-robin-room-link>>\n',
          expected: 1
        }
      ]
    },
    locationPassage: {
      Temple: [
        {
          // This anchor is inside the hall's ordinary navigation branch. Link zones also run during examinations.
          src: '<<templeicon "pray">>',
          applybefore: '<<revelation-robin-temple-hall-link>>\n',
          expected: 1
        },
        {
          // Sydney's branch precedes Robin's in vanilla. A shared vow needs its own examination.
          src: '\t<<if $templePromised is "Sydney">>',
          to: '\t<<if $templePromised is "Sydney" and $RevelationRobinTemple.stage is "promised">>\n\t\t<<revelation-robin-joint-examination>>\n\t<<elseif $templePromised is "Sydney">>',
          expected: 1
        },
        {
          // Vanilla handles Sydney here and otherwise falls through to a solo examination.
          src: '\t<<elseif C.npc.Sydney.init is 1 and C.npc.Sydney.virginity.temple isnot true and $templePromised isnot "Sydney">>',
          applybefore: '\t<<elseif $RevelationRobinTemple.stage is "promised">>\n\t\t<<revelation-robin-monthly-examination>>\n',
          expected: 1
        }
      ],
      'Temple Quarters': [
        {
          srcmatch: /\t<<getouticon>><<link \[\[[^\]\n]+\|Temple\]\]>><<pass 1>><<\/link>>/,
          applybefore: '\t<<revelation-robin-temple-links>>\n',
          expected: 1
        }
      ],
      "Robin's Room Entrance": [
        {
          // Keep the orphanage note in sync with Robin's temple shifts without replacing the vanilla room.
          src: '<<elseif _robin_location is "school">>',
          applybefore:
            '<<elseif ["member", "approved", "promised"].includes($RevelationRobinTemple.stage) and ((Time.weekDay is 7 and Time.hour gte 21) or (Time.weekDay is 1 and (Time.hour lt 7 or Time.hour gte 11 and Time.hour lte 12)) or (!Time.schoolDay and !Time.isWeekEnd() and Time.hour gte 9 and Time.hour lt 16) or _robin_location is "temple")>>\n\t<<revelation-robin-room-temple-note>>\n',
          expected: 1
        }
      ],
      'Temple Vigil Inquire': [
        {
          srcmatch: /\t<<getinicon>><<link \[\[[^\]\n]+\|Temple Vigil\]\]>><<\/link>>/,
          applybefore: '\t<<revelation-robin-vigil-link>>\n',
          expected: 1
        }
      ],
      'Temple Vigil 10': [
        {
          // The refusal icon is stable in both language exports and appears once in this scene.
          src: '<<refuseicon>>',
          applybefore: '<<revelation-robin-vigil-fire-link>>\n',
          expected: 1
        }
      ],
      'Temple Confess': [
        {
          // The original event pool is language independent. Add Robin before the Wraith's final override.
          src: '<!-- Must be last. -->',
          applybefore: '<<revelation-robin-confession-event>>\n',
          expected: 1
        }
      ]
    }
  });
}
