import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import Wraith from '../src/script/Wraith';

const source = readFileSync(new URL('../src/twee/Wraith.twee', import.meta.url), 'utf8');
const widgets = new Map([...source.matchAll(/<<widget '([^']+)'>>([\s\S]*?)<<\/widget>>/g)].map(match => [match[1], match[2]]));
const returnLink = source.split("<<lanLink ['Set the necklace on the plinth and let go',")[1];
const returnAction = returnLink.slice(returnLink.indexOf('>>') + 2).split('<</lanLink>>')[0];

// Execute the production set/if/widget subset, not a second implementation of
// the rules. Presentation and engine effects are intentionally outside this harness.
function execute(body: string, context: ReturnType<typeof fixture>) {
  const expression = (value: string) =>
    value
      .replace(/\$([A-Za-z]\w*)/g, 'V.$1')
      .replace(/\b_([A-Za-z]\w*)/g, 'T.$1')
      .replace(/\b(isnot|is|and|or|gte|gt|lt|to)\b/g, word => ({ isnot: '!==', is: '===', and: '&&', or: '||', gte: '>=', gt: '>', lt: '<', to: '=' })[word]!);
  let code = '';
  for (const [, macro] of body.matchAll(/<<([\s\S]*?)>>/g)) {
    const [name, ...rest] = macro.trim().split(/\s+/);
    const args = rest.join(' ');
    if (name === 'set') code += `${expression(args)};\n`;
    else if (name === 'if') code += `if (${expression(args)}) {\n`;
    else if (name === 'else') code += '} else {\n';
    else if (name === '/if') code += '}\n';
    else if (widgets.has(name)) code += `invoke(${JSON.stringify(name)});\n`;
    else if (name === 'museumAntiqueStatus') code += "V.museumAntiques.antiques.antiqueivorynecklace = 'notFound'; calls.antique++;\n";
    else if (name === 'checkWraith') code += 'calls.check++;\n';
    else if (name === 'wateraction') code += 'calls.water++;\n';
    else if (name === 'goto') code += 'calls.goto++;\n';
    else if (!['silently', '/silently'].includes(name)) throw new Error(`Unsupported macro: ${name}`);
  }
  const invoke = (name: string) => execute(widgets.get(name)!, context);
  const { V, T, C, Time, calls } = context;
  new Function('V', 'T', 'C', 'Time', 'calls', 'invoke', 'maplebirch', 'isPregnancyEnding', 'pcAreArmsBound', code)(
    V,
    T,
    C,
    Time,
    calls,
    invoke,
    { get: () => true },
    () => false,
    () => false
  );
}

function fixture() {
  return {
    V: {
      RBR: { necklace: { returned: false, returnedOnce: false, retaken: 0, advised: false, followedUp: false }, wraithVisitDay: -1 },
      museumAntiques: { antiques: { antiqueivorynecklace: 'found' } },
      necklaceThief: 'player',
      antiquemoney: 2000,
      combat: false,
      possessed: false,
      replayScene: false,
      statFreeze: false,
      nextPassage: '',
      nextPassageCheck: '',
      eventforced: false,
      stress: 0,
      stressmax: 100,
      location: 'lake_ruin',
      passage: 'Revelation Ivory Necklace Return',
      oxygen: 100,
      wraith: { state: 'haunt', offspring: '', hunt: false },
      wraithAngerCooldown: 0,
      outside: 1,
      bus: 'lakeshore',
      foresthunt: false,
      halloween: 0,
      halloween_lake: 0,
      town_projects: { diving: 0 }
    },
    T: {} as Record<string, unknown>,
    C: { npc: { 'Ivory Wraith': { init: 1, lust: 20 } } },
    Time: { days: 20, hour: 12, monthDay: 1, isBloodMoon: () => false },
    calls: { antique: 0, check: 0, water: 0, goto: 0 }
  };
}

const runWidget = (name: string, state: ReturnType<typeof fixture>) => execute(widgets.get(name)!, state);

describe('wraith native state and extension history', () => {
  test('first return settles once, even if the action is called again', () => {
    const state = fixture();
    execute(returnAction, state);
    execute(returnAction, state);
    expect(state.V.museumAntiques.antiques.antiqueivorynecklace).toBe('notFound');
    expect(state.V.antiquemoney).toBe(0);
    expect(state.V.RBR.necklace.returnedOnce).toBe(true);
    expect(state.V.RBR.wraithVisitDay).toBe(20);
    expect(state.C.npc['Ivory Wraith'].lust).toBe(10);
    expect(state.calls).toEqual({ antique: 1, check: 0, water: 1, goto: 1 });
  });

  test.each(['player', 'diver'])('%s taking the necklace clears only the appropriate history', thief => {
    const state = fixture();
    state.V.RBR.necklace.returned = true;
    state.V.RBR.necklace.returnedOnce = true;
    state.V.necklaceThief = thief;
    runWidget('wraith-necklace-taken', state);
    runWidget('wraith-necklace-taken', state);
    expect(state.V.RBR.necklace.returned).toBe(false);
    expect(state.V.RBR.necklace.returnedOnce).toBe(true);
    expect(state.V.RBR.necklace.retaken).toBe(thief === 'player' ? 1 : 0);
    expect(state.calls.check).toBe(thief === 'player' ? 1 : 0);
    expect(state.C.npc['Ivory Wraith'].lust).toBe(20);
  });

  test('old saves keep optional history defaults and uninitialised NPCs untouched', () => {
    const state = fixture();
    state.V.RBR.necklace.returned = true;
    Reflect.deleteProperty(state.V.RBR.necklace, 'retaken');
    state.C.npc['Ivory Wraith'].init = 0;
    runWidget('wraith-necklace-taken', state);
    expect(state.V.RBR.necklace.retaken).toBe(1);
    expect(state.calls.check).toBe(0);
    expect(state.C.npc['Ivory Wraith'].init).toBe(0);
    state.V.necklaceThief = 'diver';
    Reflect.deleteProperty(state.V.RBR.necklace, 'returned');
    runWidget('wraith-necklace-taken', state);
    expect(state.V.RBR.necklace.returned).toBe(false);
    expect(state.V.RBR.necklace.retaken).toBe(1);
  });

  test('repeat return uses saved first-return history', () => {
    const state = fixture();
    state.V.RBR.necklace.returnedOnce = true;
    state.V.RBR.necklace.retaken = 1;
    execute(returnAction, state);
    expect(state.C.npc['Ivory Wraith'].lust).toBe(19);
    expect(state.V.RBR.necklace.retaken).toBe(1);
  });

  test.each(['dead', 'sold', 'cooldown'])('%s grievance blocks relief and shore visits from the same native source', grievance => {
    const state = fixture();
    state.V.wraith.offspring = grievance === 'cooldown' ? '' : grievance;
    state.V.wraithAngerCooldown = grievance === 'cooldown' ? 1 : 0;
    execute(returnAction, state);
    expect(state.C.npc['Ivory Wraith'].lust).toBe(20);
    state.V.location = 'lake';
    state.V.passage = 'Lake Shore';
    state.Time.days += 3;
    runWidget('revelation-wraith-visit-check', state);
    expect(state.T.wraithVisitAngry).toBe(true);
    expect(state.T.wraithVisitReady).toBe(false);
    state.V.wraith.offspring = '';
    state.V.wraithAngerCooldown = 0;
    runWidget('revelation-wraith-visit-check', state);
    expect(state.T.wraithVisitReady).toBe(true);
  });

  test('shore cooldown and native pursuit guards remain independent', () => {
    const state = fixture();
    execute(returnAction, state);
    state.V.location = 'lake';
    state.V.passage = 'Lake Shore';
    state.Time.days = 22;
    runWidget('revelation-wraith-visit-check', state);
    expect(state.T.wraithVisitReady).toBe(false);
    state.Time.days = 23;
    runWidget('revelation-wraith-visit-check', state);
    expect(state.T.wraithVisitReady).toBe(true);
    state.V.wraith.hunt = true;
    runWidget('revelation-wraith-visit-check', state);
    expect(state.T.wraithVisitReady).toBe(false);
  });

  test.each(['replayScene', 'statFreeze'] as const)('%s prevents both return and taking settlement', guard => {
    const state = fixture();
    state.V[guard] = true;
    execute(returnAction, state);
    expect(state.V.antiquemoney).toBe(2000);
    state.V.RBR.necklace.returned = true;
    runWidget('wraith-necklace-taken', state);
    expect(state.V.RBR.necklace.returned).toBe(true);
    expect(state.V.RBR.necklace.retaken).toBe(0);
  });

  test('both native acquisition hooks call the same settlement widget', () => {
    let passages: Record<string, { applyafter?: string }[]> = {};
    Wraith({
      tool: {
        inject(data: { locationPassage: typeof passages }) {
          passages = data.locationPassage;
        },
        addTo() {}
      }
    } as unknown as typeof window.maplebirch);
    expect(passages['Lake Ruin Plinth'][0].applyafter).toBe('<<wraith-necklace-taken>>');
    expect(passages['Town Hall Projects Diving Buy'][0].applyafter).toBe('<<wraith-necklace-taken>>');
  });
});
