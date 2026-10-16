import { describe, expect, test } from 'bun:test';
import Wraith from '../src/script/Wraith';

type Patch = { srcmatch: RegExp; to: string; expected: number };
let divingPatch: Patch;
// Capture the production rule; do not maintain a separate copy of its regex.
Wraith({
  tool: {
    inject(data: { locationPassage: Record<string, unknown[]> }) {
      divingPatch = data.locationPassage['Town Hall Projects Diving 2'][0] as Patch;
    },
    addTo() {}
  }
} as unknown as typeof window.maplebirch);

const condition = '$museumAntiques.antiques.antiqueivorynecklace isnot "found" and $necklaceThief is "player"';
const vanilla = `<<if ${condition}>>body<</if>>`;
const guard = '!$RBR?.necklace?.returned and ';
// Exact rule from Wraith's Reflection 1.3.4:
// game/WraithsReflectionReplace/Shit.json5, "Town Hall Projects Diving 2".
const reflectionAnchor = '"player">>';
const reflectionReplacement = '"player" and !$necklaceWR>>';

function reflection(source: string): string {
  expect(source.split(reflectionAnchor).length - 1).toBe(1);
  return source.replace(reflectionAnchor, reflectionReplacement);
}

// Exercise the framework's SourcePatch contract: expected count is checked before
// replacement; mismatches leave the source intact for the framework diagnostic.
function revelation(source: string) {
  const matches = [...source.matchAll(new RegExp(divingPatch.srcmatch.source, 'g'))].length;
  if (matches !== divingPatch.expected) return { content: source, status: 'mismatch', matches };
  return { content: source.replace(divingPatch.srcmatch, divingPatch.to), status: 'applied', matches };
}

const combined = `<<if ${guard}${condition.replace('"player"', '"player" and !$necklaceWR')}>>body<</if>>`;

describe('ivory necklace diving condition compatibility', () => {
  test('standalone preserves the reflection tail anchor', () => {
    expect(revelation(vanilla)).toEqual({ content: `<<if ${guard}${condition}>>body<</if>>`, status: 'applied', matches: 1 });
    expect(revelation(vanilla).content).toContain(reflectionAnchor);
  });

  test('revelation then reflection preserves both guards', () => {
    expect(reflection(revelation(vanilla).content)).toBe(combined);
  });

  test('reflection then revelation produces the same condition', () => {
    expect(revelation(reflection(vanilla)).content).toBe(combined);
  });

  test.each([vanilla, combined])('repeated revelation injection is idempotent: %s', source => {
    const once = revelation(source);
    expect(revelation(once.content)).toEqual(once);
    expect(once.content.split(guard).length - 1).toBe(1);
  });

  test('preserves an existing grouped condition and surrounding content', () => {
    const source = `before\n<<elseif ${condition} and ($otherA or $otherB)>>after`;
    expect(revelation(source).content).toBe(`before\n<<elseif ${guard}${condition} and ($otherA or $otherB)>>after`);
  });

  test('does not match unrelated player conditions', () => {
    const source = '<<if $necklaceThief is "player">>unrelated<</if>>';
    expect(revelation(source)).toEqual({ content: source, status: 'mismatch', matches: 0 });
  });

  test('keeps expected: 1 and rejects ambiguous targets unchanged', () => {
    expect(divingPatch.expected).toBe(1);
    const source = `${vanilla}\n${vanilla}`;
    expect(revelation(source)).toEqual({ content: source, status: 'mismatch', matches: 2 });
  });
});
