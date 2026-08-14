/**
 * Narrow typed boundary around the online-Judge control-plane procedures.
 * Callers must already run under `asOnlineJudgeScheduler()` or
 * `asOnlineJudgeExecutor()`; this module deliberately never accepts user
 * content and never constructs a provider request.
 */
import type { Client } from './principal.ts';

export type OnlineJudgeFeature = 'agent' | 'rag' | 'scoring' | 'voice' | 'memory' | 'observability';
export type OnlineJudgeLanguageGroup = 'zh' | 'en' | 'mixed';
export type OnlineJudgeModality = 'text' | 'asr';
export type OnlineJudgeRiskBucket = 'normal' | 'anaphora' | 'low_evidence' | 'injection_handled';
export type OnlineJudgeSourcePolicy = 'synthetic' | 'public_licensed';
export type OnlineJudgeSelectionState = 'pending' | 'lot_closed_unsampled' | 'selected' | 'skipped_budget' | 'skipped_privacy';
export type OnlineJudgeDispatchTerminal = 'judged' | 'failed' | 'unknown';

export interface RegisterOnlineJudgeCandidateInput {
  policyVersion: string;
  sourceAttemptHmac: string;
  subjectDayHmac: string;
  packetRefHmac: string;
  redactionReceiptHmac: string;
  /** Current control plane fail-closes all real-user source policies. */
  sourcePolicy: OnlineJudgeSourcePolicy;
  sourceLicenseRef: string;
  feature: OnlineJudgeFeature;
  languageGroup: OnlineJudgeLanguageGroup;
  modality: OnlineJudgeModality;
  riskBucket: OnlineJudgeRiskBucket;
  /** UTC date in YYYY-MM-DD; the procedure rejects a different current UTC day. */
  utcDay: string;
  /** HMAC rank produced by the separately privileged scheduler. */
  rankHmac: string;
}

export interface OnlineJudgeCandidateReceipt {
  candidateId: string;
  replayed: boolean;
  eligibilityState: 'eligible' | 'rejected_privacy' | 'revoked';
  selectionState: OnlineJudgeSelectionState;
  lotId: string;
  lotSlot: number;
}

export async function registerOnlineJudgeCandidate(c: Client, input: RegisterOnlineJudgeCandidateInput): Promise<OnlineJudgeCandidateReceipt> {
  const result = await c.query(
    `SELECT * FROM online_judge_register_candidate(
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::date,$13
    )`,
    [
      input.policyVersion, input.sourceAttemptHmac, input.subjectDayHmac, input.packetRefHmac, input.redactionReceiptHmac,
      input.sourcePolicy, input.sourceLicenseRef, input.feature, input.languageGroup, input.modality, input.riskBucket,
      input.utcDay, input.rankHmac,
    ],
  );
  const row = result.rows[0];
  if (!row) throw new Error('online_judge_candidate_receipt_missing');
  return {
    candidateId: String(row.candidate_id), replayed: row.replayed === true,
    eligibilityState: String(row.eligibility_state) as OnlineJudgeCandidateReceipt['eligibilityState'],
    selectionState: String(row.selection_state) as OnlineJudgeSelectionState,
    lotId: String(row.lot_id), lotSlot: Number(row.lot_slot),
  };
}

export async function revokeOnlineJudgeCandidate(c: Client, policyVersion: string, sourceAttemptHmac: string): Promise<boolean> {
  const result = await c.query('SELECT online_judge_revoke_candidate($1,$2) AS ok', [policyVersion, sourceAttemptHmac]);
  return result.rows[0]?.ok === true;
}

export interface ClaimedOnlineJudgeDispatch {
  dispatchId: string;
  candidateId: string;
  packetRefHmac: string;
  leaseToken: string;
  policyVersion: string;
  mode: 'triage_only' | 'calibrated';
}

/**
 * This returns no source text.  A future consented packet reader must be an
 * independent, audited capability; callers cannot derive a model payload from
 * this receipt alone.
 */
export async function claimNextOnlineJudgeDispatch(c: Client, executorId: string, leaseSeconds: number): Promise<ClaimedOnlineJudgeDispatch | null> {
  const result = await c.query('SELECT * FROM online_judge_claim_next_dispatch($1,$2)', [executorId, leaseSeconds]);
  const row = result.rows[0];
  return row ? {
    dispatchId: String(row.dispatch_id), candidateId: String(row.candidate_id), packetRefHmac: String(row.packet_ref_hmac),
    leaseToken: String(row.lease_token), policyVersion: String(row.policy_version), mode: String(row.mode) as ClaimedOnlineJudgeDispatch['mode'],
  } : null;
}

export async function markOnlineJudgeDispatching(c: Client, dispatchId: string, leaseToken: string): Promise<boolean> {
  const result = await c.query('SELECT online_judge_mark_dispatching($1,$2) AS ok', [dispatchId, leaseToken]);
  return result.rows[0]?.ok === true;
}

export interface CompleteOnlineJudgeDispatchInput {
  dispatchId: string;
  leaseToken: string;
  terminalStatus: OnlineJudgeDispatchTerminal;
  resultCode: string;
  resultScore?: number | null;
  providerReceiptHmac?: string | null;
}

export async function completeOnlineJudgeDispatch(c: Client, input: CompleteOnlineJudgeDispatchInput): Promise<boolean> {
  const result = await c.query(
    'SELECT online_judge_complete_dispatch($1,$2,$3,$4,$5,$6) AS ok',
    [input.dispatchId, input.leaseToken, input.terminalStatus, input.resultCode, input.resultScore ?? null, input.providerReceiptHmac ?? null],
  );
  return result.rows[0]?.ok === true;
}
