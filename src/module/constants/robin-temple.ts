// ./src/module/constants/robin-temple.ts

/** 沿用原版共同净化机制，回合状态由模块独立保存。 */
export interface RobinTemplePunishment {
  joint: boolean;
  started: boolean;
  timer: number;
  repeats: number;
  phase: number;
  action: '' | 'Player' | 'Robin' | 'Sydney' | 'Vibrate';
  result: 'active' | 'rest' | 'passed' | 'hospital';
  choice: 'hold' | 'belt' | 'hit' | 'plead' | 'touch' | 'close';
  target: 'Robin' | 'Sydney' | 'both';
  partners: Partial<Record<'Robin' | 'Sydney', { pain: number; arousal: number; hold: number; belt: number; hit: number; plead: number; touch: number }>>;
}

/** 路线状态保存在当前 SugarCube 存档中，不属于浏览器会话。 */
export interface RobinTempleState {
  stage: 'none' | 'invited' | 'scheduled' | 'failed' | 'member' | 'approved' | 'promised';
  templePromised: '' | 'Robin';
  chastity_timer: number;
  monthly_checked: boolean;
  exam_day: number;
  prepared_day: number;
  service: number;
  grace: number;
  pendant: boolean;
  faith_band: 'steady' | 'belief' | 'doubt';
  faith_transition: '' | 'belief' | 'doubt';
  faith_review_day: number;
  assessment_fire: boolean;
  assessment_passed: boolean;
  assessment_day: number;
  assessment_bonus: number;
  abandoned: boolean;
  work_day: number;
  vigil_attempt_day: number;
  vigil_attending: boolean;
  vigil_with_robin: boolean;
  vigil_result: '' | 'passed' | 'failed';
  vigil_followup: boolean;
  evaluation_day: number;
  evaluation_marks: number;
  evaluation_answer: string;
  evaluation_phase: number;
  /** 是否已由剧情解锁第二份誓约。 */
  dual_promise: boolean;
  punish: RobinTemplePunishment | null;
  confession_response: 'hold' | 'speak' | '';
  confession_day: number;
  confession_recognized: boolean;
  confession_resolved: boolean;
  prayer_day: number;
  rest_day: number;
  hospital_day: number;
  hospital_stage: '' | 'waiting' | 'discharged' | 'therapy' | 'rescue' | 'vanilla';
  hospital_support: boolean;
  prayer_event_day: number;
  prayer_event: number;
  prayer_event_done: boolean;
  prayer_event_resolved: boolean;
  walk_day: number;
  night_day: number;
  night_scene: 'rain' | 'voice' | 'blanket' | 'embers' | 'ledger' | '';
  intimacy_active: boolean;
  spear_seen: boolean;
  spear_return_seen: boolean;
  transformation_day: number;
  transformation_count: number;
  transformation_kind: 'fox' | 'wolf' | 'cat' | 'bird' | 'cow' | '';
  donation_day: number;
  donation_amount: number;
  clasp_discussed: boolean;
  clasp_equipped: boolean;
  clasp_request: '' | 'remove' | 'refit';
  clasp_request_day: number;
}

export const DEFAULT_ROBIN_TEMPLE_STATE: RobinTempleState = {
  stage: 'none',
  templePromised: '',
  chastity_timer: 30,
  monthly_checked: true,
  exam_day: -1,
  prepared_day: -1,
  service: 0,
  grace: 0,
  pendant: false,
  faith_band: 'steady',
  faith_transition: '',
  faith_review_day: -1,
  assessment_fire: false,
  assessment_passed: false,
  assessment_day: -1,
  assessment_bonus: 0,
  abandoned: false,
  work_day: -1,
  vigil_attempt_day: -1,
  vigil_attending: false,
  vigil_with_robin: false,
  vigil_result: '',
  vigil_followup: false,
  evaluation_day: -1,
  evaluation_marks: 0,
  evaluation_answer: '',
  evaluation_phase: 1,
  dual_promise: false,
  punish: null,
  confession_response: '',
  confession_day: -1,
  confession_recognized: false,
  confession_resolved: false,
  prayer_day: -1,
  rest_day: -1,
  hospital_day: -1,
  hospital_stage: '',
  hospital_support: false,
  prayer_event_day: -1,
  prayer_event: 0,
  prayer_event_done: false,
  prayer_event_resolved: false,
  walk_day: -1,
  night_day: -1,
  night_scene: '',
  intimacy_active: false,
  spear_seen: false,
  spear_return_seen: false,
  transformation_day: -1,
  transformation_count: 0,
  transformation_kind: '',
  donation_day: -1,
  donation_amount: 0,
  clasp_discussed: false,
  clasp_equipped: false,
  clasp_request: '',
  clasp_request_day: -1
};
