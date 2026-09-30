// ./src/script/RobinTemple.ts

/** Patch only stable macro structure; vanilla EN and CN labels differ. */
export default function RobinTemple(maplebirch: typeof window.maplebirch): void {
  maplebirch.tool.addTo('Journal', 'robin-temple-journal');
  maplebirch.tool.patch.traits.add({
    title: 'Special Traits',
    name: () => maplebirch.t('revelation-the-book-of-return:robinTemple:trait:promise:name'),
    colour: 'blue',
    has: () => V.RobinTemple?.stage === 'promised',
    text: () => maplebirch.t('revelation-the-book-of-return:robinTemple:trait:promise:text')
  });
  maplebirch.tool.inject({
    widgetPassage: {
      Widgets: [
        {
          // Only Robin displays this stat, and only after joining the temple.
          src: 'return !statOverrides.hasOwnProperty("requirements") || statOverrides.requirements;',
          to: 'return (stat !== "revelationConviction" || T.npcData.nam === "Robin" && ["member", "approved", "promised"].includes(V.RobinTemple?.stage)) && (!statOverrides.hasOwnProperty("requirements") || statOverrides.requirements);',
          expected: 1
        },
        {
          // The vanilla Social card checks the saved NPC value, then renders the config's value.
          src: 'return Object.assign({}, baseConfig, T.npcOverrides[stat]);',
          to: 'return Object.assign({}, baseConfig, T.npcOverrides[stat], stat === "revelationConviction" ? { value: T.npcData[stat] } : {});',
          expected: 1
        }
      ],
      'Widgets Combat': [
        {
          // The original promise variable belongs to Sydney. Extend only the partner exception for Robin.
          src: '<<if $templePromised isnot $_taker>>',
          to: '<<if $templePromised isnot $_taker and !($RobinTemple.stage is "promised" and $_taker is "Robin")>>',
          expected: 1
        },
        {
          src: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot $_taker>>',
          to: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot $_taker and !($RobinTemple.stage is "promised" and $_taker is "Robin")>>',
          expected: 1
        },
        {
          src: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot _args[0]>>',
          to: '<<if $player.virginity.temple is true and (_args[1] is "vaginal" or _args[1] is "penile") and $templePromised isnot _args[0] and !($RobinTemple.stage is "promised" and _args[0] is "Robin")>>',
          expected: 1
        },
        {
          src: '<<if ($_vType is "vaginal" or $_vType is "penile") and $_npc.virginity.temple is true and $templePromised isnot $_npc.fullDescription>>',
          to: '<<if ($_vType is "vaginal" or $_vType is "penile") and $_npc.virginity.temple is true and $templePromised isnot $_npc.fullDescription and !($RobinTemple.stage is "promised" and $_npc.fullDescription is "Robin")>>',
          expected: 1
        }
      ],
      'Widgets Robin': [
        {
          src: '\t\t<<robinbully>>',
          applybefore: '\t\t<<robin-temple-room-link>>\n',
          expected: 1
        }
      ]
    },
    locationPassage: {
      'Temple Vigil 3': [
        {
          src: '<<stress 2>><<gstress>>',
          applyafter: '\n<<robin-temple-vigil-arrival>>',
          expected: 1
        }
      ],
      'Temple Vigil 7': [
        {
          src: '<<effects>>',
          applyafter: '\n<<robin-temple-vigil-cold>>',
          expected: 1
        }
      ],
      'Temple Vigil 8': [
        {
          src: '<<effects>>',
          applyafter: '\n<<robin-temple-vigil-whisper>>',
          expected: 1
        }
      ],
      'Temple Vigil 9': [
        {
          src: '<<person1>>',
          applyafter: '\n<<robin-temple-vigil-bell>>',
          expected: 1
        }
      ],
      'Temple Vigil 10': [
        {
          // Offer Robin's route at the same pyre choice as Sydney's vanilla route.
          src: '<<refuseicon>>',
          applybefore: '<<robin-temple-vigil-options>>\n',
          expected: 1
        }
      ],
      'Temple Vigil 12': [
        {
          src: '<<set $player.bodyTemperature to $player.bodyTemperature + 1>><<set $fire to 2>>',
          applyafter: '\n<<robin-temple-vigil-left-behind>>',
          expected: 1
        }
      ],
      'Temple Vigil End': [
        {
          src: '<<person1>>',
          applyafter: '\n<<robin-temple-vigil-failure>>',
          expected: 1
        }
      ],
      'Temple Vigil End Sydney': [
        {
          src: '<<person1>>',
          applyafter: '\n<<robin-temple-vigil-failure>>',
          expected: 1
        }
      ],
      Temple: [
        {
          // This anchor is inside the hall's ordinary navigation branch. Link zones also run during examinations.
          src: '<<templeicon "pray">>',
          applybefore: '<<robin-temple-hall-link>>\n',
          expected: 1
        },
        {
          // Sydney's branch precedes Robin's in vanilla. A shared vow needs its own examination.
          src: '\t<<if $templePromised is "Sydney">>',
          to: '\t<<if $templePromised is "Sydney" and $RobinTemple.stage is "promised">>\n\t\t<<robin-temple-joint-examination>>\n\t<<elseif $templePromised is "Sydney">>',
          expected: 1
        },
        {
          // Vanilla handles Sydney here and otherwise falls through to a solo examination.
          src: '\t<<elseif C.npc.Sydney.init is 1 and C.npc.Sydney.virginity.temple isnot true and $templePromised isnot "Sydney">>',
          applybefore: '\t<<elseif $RobinTemple.stage is "promised">>\n\t\t<<robin-temple-monthly-examination>>\n',
          expected: 1
        }
      ],
      'Temple Quarters': [
        {
          srcmatch: /\t<<getouticon>><<link \[\[[^\]\n]+\|Temple\]\]>><<pass 1>><<\/link>>/,
          applybefore: '\t<<robin-temple-links>>\n',
          expected: 1
        }
      ],
      "Robin's Room Entrance": [
        {
          // Follow the shared Robin location override so another mod can keep Robin elsewhere.
          src: '<<elseif _robin_location is "school">>',
          applybefore: '<<elseif ["member", "approved", "promised"].includes($RobinTemple.stage) and _robin_location is "temple">>\n\t<<robin-temple-room-note>>\n',
          expected: 1
        }
      ],
      'Temple Confess': [
        {
          // The original event pool is language independent. Add Robin before the Wraith's final override.
          src: '<!-- Must be last. -->',
          applybefore: '<<robin-temple-confession-event>>\n',
          expected: 1
        }
      ]
    }
  });
}
