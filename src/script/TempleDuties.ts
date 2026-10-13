export default function TempleDuties(core: typeof maplebirch): void {
  core.tool.addTo('BeforeLinkZone', { widget: 'temple-duty-link', passage: 'Temple' }, { widget: 'temple-case-docks-link', passage: 'Docks' }, { widget: 'temple-manor-link', passage: 'Manor Kylar' });

  core.tool.inject({
    locationPassage: {
      'Temple Library': [{ src: '<<effects>>', applyafter: '<<temple-duty-library>>', expected: 1 }],
      'Temple Quarters': [{ srcmatch: /\$temple_rank is "monk"/g, to: '["monk", "priest"].includes($temple_rank)', expected: 3 }],
      'Temple Confessor Intro Ask': [{ src: '<<if $sydney.rank is "monk">>', to: '<<if ["monk", "priest"].includes($sydney.rank)>>', expected: 1 }]
    },
    widgetPassage: {
      // 普通店内菜单已通过原版日程与强制剧情判断，再添加咨询入口。
      'Gwylan Widgets': [{ src: '<<gwylanOptionsClothing>>', applyafter: '<<temple-case-gwylan-link>>', expected: 1 }]
    }
  });

  core.tool.addTo('Journal', 'temple-duties-journal');
}
