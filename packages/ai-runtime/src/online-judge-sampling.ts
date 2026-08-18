import { createHmac } from 'node:crypto';

export interface OnlineJudgeEligibleAttempt {
  attemptId: string;
  feature: string;
  languageGroup: 'zh' | 'en' | 'mixed';
  modality: 'text' | 'asr';
  riskBucket: 'normal' | 'anaphora' | 'low_evidence' | 'injection_handled';
}

export function onlineJudgeStratum(attempt: OnlineJudgeEligibleAttempt): string {
  return `${attempt.feature}\u0000${attempt.languageGroup}\u0000${attempt.modality}\u0000${attempt.riskBucket}`;
}

/** Select exactly one opaque attempt from a completed lot of 10 without exposing the source ID. */
export function selectOnlineJudgeLot(
  attempts: readonly OnlineJudgeEligibleAttempt[], secret: string, policyVersion: string,
): OnlineJudgeEligibleAttempt | undefined {
  if (attempts.length !== 10 || !secret || !policyVersion) return undefined;
  const stratum = onlineJudgeStratum(attempts[0]!);
  if (attempts.some((attempt) => onlineJudgeStratum(attempt) !== stratum)) throw new Error('online_judge_lot_mixed_stratum');
  return attempts
    .map((attempt) => ({
      attempt,
      rank: createHmac('sha256', secret).update(`${policyVersion}\u0000${stratum}\u0000${attempt.attemptId}`, 'utf8').digest('hex'),
    }))
    .sort((a, b) => a.rank.localeCompare(b.rank) || a.attempt.attemptId.localeCompare(b.attempt.attemptId))[0]!.attempt;
}

/** Pure reference scheduling: every complete lot contributes one sample; an incomplete suffix contributes none. */
export function sampleOnlineJudgeAttempts(
  attempts: readonly OnlineJudgeEligibleAttempt[], secret: string, policyVersion: string,
): OnlineJudgeEligibleAttempt[] {
  const byStratum = new Map<string, OnlineJudgeEligibleAttempt[]>();
  for (const attempt of attempts) {
    const key = onlineJudgeStratum(attempt);
    const bucket = byStratum.get(key) ?? [];
    bucket.push(attempt);
    byStratum.set(key, bucket);
  }
  const selected: OnlineJudgeEligibleAttempt[] = [];
  for (const bucket of byStratum.values()) {
    for (let offset = 0; offset + 10 <= bucket.length; offset += 10) {
      const chosen = selectOnlineJudgeLot(bucket.slice(offset, offset + 10), secret, policyVersion);
      if (chosen) selected.push(chosen);
    }
  }
  return selected;
}
