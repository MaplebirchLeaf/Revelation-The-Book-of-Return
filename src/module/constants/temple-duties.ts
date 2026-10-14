export type TempleCase = 'echo' | 'roots' | 'crate';
export type Ordinand = 'Robin' | 'Sydney';

export interface TempleDutiesState {
  note: string;
  topic: string;
  enrolled: boolean;
  duties: number;
  duty_day: number;
  rest_day: number;
  followups: Partial<Record<TempleCase, number>>;
  archive: {
    roof: number;
    shelves: number;
    sorted: number;
    sort_day: number;
    topics: string[];
  };
  case: {
    id: TempleCase;
    stage: 'field' | 'combat' | 'report';
    clues: string[];
    prepared: boolean;
    advised: boolean;
    result: 'resolved' | 'withdrawn' | 'mistaken' | '';
  } | null;
  reports: Partial<Record<TempleCase, { result: string; honest: boolean; day: number }>>;
  rewards: TempleCase[];
  review: boolean;
  declaration: 'private' | 'scar';
  oath: 'care' | 'obedience' | '';
  ordained: number;
  trial_day: number;
  bishop: 'none' | 'invited' | 'accepted' | 'refused' | 'reported';
  bishop_checked: boolean;
  manor: 'none' | 'accepted' | 'declined' | 'copied' | 'complete';
  speaker: 'Robin' | 'Sydney' | '';
  companion_day: number;
  candidates: Record<Ordinand, { agreed: boolean; lessons: string[]; reviewed: boolean; trial_day: number }>;
  party: Ordinand[];
  ceremony: string[];
  exercise: 'care' | 'wards' | '';
  watch: {
    day: number;
    until: number;
    party: Ordinand[];
    phase: 'threshold' | 'roots' | 'voices' | 'shadow' | 'seal' | 'passed' | 'failed';
    aids: string[];
    route: boolean;
  } | null;
}

export const DEFAULT_TEMPLE_DUTIES_STATE: TempleDutiesState = {
  note: '',
  topic: '',
  enrolled: false,
  duties: 0,
  duty_day: -1,
  rest_day: -1,
  followups: {},
  archive: { roof: -1, shelves: -1, sorted: 0, sort_day: -1, topics: [] },
  case: null,
  reports: {},
  rewards: [],
  review: false,
  declaration: 'private',
  oath: '',
  ordained: -1,
  trial_day: -1,
  bishop: 'none',
  bishop_checked: false,
  manor: 'none',
  speaker: '',
  companion_day: -1,
  candidates: {
    Robin: { agreed: false, lessons: [], reviewed: false, trial_day: -1 },
    Sydney: { agreed: false, lessons: [], reviewed: false, trial_day: -1 }
  },
  party: [],
  ceremony: [],
  exercise: '',
  watch: null
};
