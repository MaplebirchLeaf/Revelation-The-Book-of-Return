// ./src/module/constants/temple-choir.ts

export interface TempleChoirState {
  joined: boolean;
  singing: number;
  auditionDay: number;
  practiceDay: number;
  serviceDay: number;
  lead: boolean;
  services: number;
  practices: number;
  exercise: string;
  bonus: number;
  shift: { round: number; score: number; result: string; bonus: number; done: boolean } | null;
}

export const DEFAULT_TEMPLE_CHOIR_STATE: TempleChoirState = {
  joined: false,
  singing: 0,
  auditionDay: -1,
  practiceDay: -1,
  serviceDay: -1,
  lead: false,
  services: 0,
  practices: 0,
  exercise: '',
  bonus: 0,
  shift: null
};
