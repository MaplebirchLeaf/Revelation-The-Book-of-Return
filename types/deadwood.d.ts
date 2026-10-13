// Optional cross-mod contracts: keep ownership at the current public modules.

interface DeadwoodResidence {
  id: string;
  name: { EN: string; CN: string };
}

declare global {
  interface MaplebirchExtensions {
    Finance: {
      realEstate: {
        current: DeadwoodResidence | undefined;
        residenceOf(name: string): DeadwoodResidence | undefined;
        residentsHome(id: string): { id: string }[];
        visit(id: string): boolean;
        enter(): void;
        outings: {
          state: { visits: Record<string, { property: string; until: number; at: string }> };
          travelling: boolean;
          plan: { name: string } | null;
          receive(name: string, property: string, kind: 'ride' | 'outing' | 'temple'): void;
        };
      };
    };
    Robin: { tutoring: { lessonDays: number[] } };
    Transport: {
      state: { commute: { boarded: boolean; arrived: boolean; npc: string } | null };
    };
  }
}

export {};
