/** 在原版最后一页记录进度，链接区域只扩展庄园的正常交谈。 */
export default function LostLamb(maplebirch: typeof window.maplebirch): void {
  maplebirch.tool.addTo('CustomLinkZone', { widget: [-1, 'lost-lamb-links'], passage: 'Manor Kylar' });

  maplebirch.dynamic.regStateEvent('append', 'lost-lamb-progress', {
    extra: { passage: ['Manor Kylar Secret 5'] },
    cond: () => V.LostLamb != null && !V.LostLamb.discovered,
    action: () => {
      V.LostLamb.discovered = true;
    }
  });
}
