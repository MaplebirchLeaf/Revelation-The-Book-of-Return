export interface LostLambState {
  discovered: boolean;
  stance: '' | 'listen' | 'report' | 'truth' | 'boundary' | 'temple';
  talked: boolean;
  tidied: boolean;
}

export const DEFAULT_LOST_LAMB_STATE: LostLambState = {
  discovered: false,
  stance: '',
  talked: false,
  tidied: false
};
