import Combat from './TempleDuties/Combat';

export default function TempleDuties(maplebirch: typeof window.maplebirch): void {
  Combat(maplebirch);

  maplebirch.tool.addTo(
    'BeforeLinkZone',
    { widget: 'temple-duty-link', passage: 'Temple' },
    { widget: 'temple-case-docks-link', passage: 'Docks' },
    // widget 要求原版 Chat 菜单，礼物和离场分支不接入。
    { widget: 'temple-manor-link', passage: 'Manor Kylar' }
  );

  maplebirch.tool.inject({
    locationPassage: {
      'Temple Library': [{ src: '<<effects>>', applyafter: '<<temple-duty-library>>', expected: 1 }],
      'Temple Prayer Entrance': [
        {
          src: '<<if $temple_garden gte 100 and $temple_quarters gte 100>>',
          to: '<<if maplebirch.get("TempleDuties") and $temple_rank is "priest">><<temple-duty-prayer>><<elseif $temple_garden gte 100 and $temple_quarters gte 100>>',
          expected: 1
        }
      ],
      'Temple Quarters': [{ srcmatch: /\$temple_rank is "monk"/g, to: '["monk", "priest"].includes($temple_rank)', expected: 3 }],
      'Temple Confessor Intro Ask': [{ src: '<<if $sydney.rank is "monk">>', to: '<<if ["monk", "priest"].includes($sydney.rank)>>', expected: 1 }]
    },
    widgetPassage: {
      // 普通店内菜单已通过原版日程与强制剧情判断，再添加咨询入口。
      'Gwylan Widgets': [{ src: '<<gwylanOptionsClothing>>', applyafter: '<<temple-case-gwylan-link>>', expected: 1 }]
    }
  });

  maplebirch.tool.addTo('Journal', 'temple-duties-journal');
}
