// ./src/module/constants/temple-choir.ts

export interface TempleChoirState {
  joined: boolean;
  singing: number;
  practiceDay: number;
  serviceDay: number;
  lead: boolean;
  services: number;
  practices: number;
  exercise: string;
  bonus: number;
  performanceDay: number;
  performance: {
    venue: 'pub' | 'park' | 'banquet';
    source: string;
    banquetDay: number;
    round: number;
    score: number;
    attention: number;
    last: 'clear' | 'unsteady' | 'lost' | '';
    tips: number;
    done: boolean;
  } | null;
  shift: { round: number; score: number; result: string; bonus: number; done: boolean } | null;
}

export const DEFAULT_TEMPLE_CHOIR_STATE: TempleChoirState = {
  joined: false,
  singing: 0,
  practiceDay: -1,
  serviceDay: -1,
  lead: false,
  services: 0,
  practices: 0,
  exercise: '',
  bonus: 0,
  performanceDay: -1,
  performance: null,
  shift: null
};
