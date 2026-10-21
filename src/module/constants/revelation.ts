// ./src/module/constants/revelation.ts

export const version = maplebirch.modUtils.getMod('revelation-the-book-of-return')!.version;

/** 遗物调查归入根模块存档，不依赖罗宾或庄园路线。 */
export const DEFAULT_REVELATION_STATE = {
  wraithVisitDay: -1,
  necklace: {
    returned: false,
    returnedOnce: false,
    retaken: 0,
    advised: false,
    followedUp: false,
    reclaimed: false,
    saleChecked: false,
    known: false,
    prepared: false,
    attemptDay: -1,
    stage: '',
    aftercare: 'none',
    dreamChoice: '',
    confidants: [] as string[]
  }
};
