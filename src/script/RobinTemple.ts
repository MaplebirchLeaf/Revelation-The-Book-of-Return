// ./src/script/RobinTemple.ts

/** 注册神殿路线的日记入口与共同立誓特质。 */
export default function RobinTemple(maplebirch: typeof window.maplebirch): void {
  maplebirch.tool.addTo('Journal', 'robin-temple-journal');
  maplebirch.tool.patch.traits.add({
    title: 'Special Traits',
    name: () => maplebirch.t('revelation-the-book-of-return:robinTemple:trait:promise:name'),
    colour: 'blue',
    has: () => V.RobinTemple?.stage === 'promised',
    text: () => maplebirch.t('revelation-the-book-of-return:robinTemple:trait:promise:text')
  });
}
