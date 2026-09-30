// ./src/module/constants/robin-temple.ts

/** 路线状态保存在当前 SugarCube 存档中，不属于浏览器会话。 */
export interface RobinTempleState {
  stage: 'none' | 'invited' | 'scheduled' | 'failed' | 'member' | 'approved' | 'promised';
  exam_day: number;
  exam_attempts: number;
  readiness: number;
  prepared_day: number;
  service: number;
  grace: number;
  pendant: boolean;
  assessment_fire: boolean;
  assessment_passed: boolean;
  assessment_day: number;
  assessment_bonus: number;
  abandoned: boolean;
  work_day: number;
  vigil_day: number;
  vigil_attempt_day: number;
  vigil_prepared_day: number;
  vigil_readiness: number;
  vigil_attending: boolean;
  vigil_with_sydney: boolean;
  vigil_result: '' | 'passed' | 'failed';
  vigil_followup: boolean;
  vigil_recovery: boolean;
  evaluation_day: number;
  evaluation_style: 'honest' | 'protective' | '';
  evaluation_marks: number;
  evaluation_memory: 'first' | 'care' | 'rescue' | 'work' | 'sky' | '';
  evaluation_records_done: boolean;
  evaluation_memory_done: boolean;
  evaluation_interview: '' | 'wait' | 'heard' | 'caught';
  evaluation_result: '' | 'passed' | 'failed';
  evaluation_belief_done: boolean;
  joint_consent: boolean;
  joint_sydney_penance: boolean;
  penance_day: number;
  penance_service: number;
  penance_work_day: number;
  breach: '' | 'pc' | 'robin' | 'both';
  penance_response: 'hold' | 'speak' | 'endure' | '';
  penance_trial_done: boolean;
  penance_hearing_done: boolean;
  confession_day: number;
  confession_recognized: boolean;
  prayer_day: number;
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
  exam_day: -1,
  exam_attempts: 0,
  readiness: 0,
  prepared_day: -1,
  service: 0,
  grace: 0,
  pendant: false,
  assessment_fire: false,
  assessment_passed: false,
  assessment_day: -1,
  assessment_bonus: 0,
  abandoned: false,
  work_day: -1,
  vigil_day: -1,
  vigil_attempt_day: -1,
  vigil_prepared_day: -1,
  vigil_readiness: 0,
  vigil_attending: false,
  vigil_with_sydney: false,
  vigil_result: '',
  vigil_followup: false,
  vigil_recovery: false,
  evaluation_day: -1,
  evaluation_style: '',
  evaluation_marks: 0,
  evaluation_memory: '',
  evaluation_records_done: false,
  evaluation_memory_done: false,
  evaluation_interview: '',
  evaluation_result: '',
  evaluation_belief_done: false,
  joint_consent: false,
  joint_sydney_penance: false,
  penance_day: -1,
  penance_service: 0,
  penance_work_day: -1,
  breach: '',
  penance_response: '',
  penance_trial_done: false,
  penance_hearing_done: false,
  confession_day: -1,
  confession_recognized: false,
  prayer_day: -1,
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
