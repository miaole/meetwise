/**
 * V7 负载回执归属。本地失败终态演练的谓词，不是业务恢复，也不是生产 HA。
 * releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false
 *
 * 成功下限只挡「零成功却因没有 5xx 而变绿」。连接错允许发生并必须入账，不是零连接错承诺。
 */
export const V7_LOAD_COUNT = 40;
export const V7_MIN_SUCCESSES = 1;
export const V7_LOAD_PATH = '/profile';
export const V7_CLOCK_SKEW_MS = 2_000;

const RUN_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function loadArtifactName(slot, runId) {
  if (slot !== 1 && slot !== 2 && slot !== 3) throw new Error('v7_load_slot');
  if (!RUN_ID_RE.test(String(runId))) throw new Error('v7_run_id');
  return `out-load${slot}-${runId}.json`;
}

function finiteTime(value) {
  const n = typeof value === 'number' ? value : Date.parse(value);
  return Number.isFinite(n) ? n : null;
}

export function acceptLoadArtifact(artifact, expect) {
  const reasons = [];
  if (!artifact || typeof artifact !== 'object' || Array.isArray(artifact)) {
    return { ok: false, reasons: ['missing'] };
  }
  if (artifact.complete !== true) reasons.push('incomplete');
  if (artifact.runId !== expect.runId) reasons.push('run_id');
  if (artifact.count !== expect.count) reasons.push('count');
  if (artifact.path !== expect.path) reasons.push('path');
  const started = finiteTime(artifact.startedAt);
  const finished = finiteTime(artifact.finishedAt);
  const skew = expect.clockSkewMs ?? V7_CLOCK_SKEW_MS;
  if (started == null || finished == null || finished < started) reasons.push('time');
  if (started != null && started < expect.attemptStartedAtMs - skew) reasons.push('before_attempt');
  if (finished != null && expect.readAtMs != null && finished > expect.readAtMs + skew) reasons.push('after_read');
  if (!Number.isInteger(artifact.failures) || artifact.failures < 0 || artifact.failures > artifact.count) reasons.push('failures');
  else if ((artifact.count - artifact.failures) < expect.minSuccesses) reasons.push('successes');
  const statuses = artifact.statuses && typeof artifact.statuses === 'object' && !Array.isArray(artifact.statuses)
    ? artifact.statuses
    : null;
  if (!statuses) reasons.push('statuses');
  else if (Object.keys(statuses).some((code) => String(code).startsWith('5'))) reasons.push('http_5xx');
  if (expect.requireOverlap) {
    const killed = expect.killedAtMs;
    if (started == null || finished == null || !Number.isFinite(killed) || killed < started || killed > finished) {
      reasons.push('overlap');
    }
  }
  return { ok: reasons.length === 0, reasons };
}

export function acceptV7Attempt(input) {
  const reasons = [];
  if (!Array.isArray(input.startups) || input.startups.length !== 3 || input.startups.some((ok) => ok !== true)) {
    reasons.push('startup');
  }
  if (!Array.isArray(input.loads) || input.loads.length !== 3) reasons.push('loads');
  else {
    input.loads.forEach((artifact, index) => {
      const accepted = acceptLoadArtifact(artifact, {
        runId: input.runId,
        count: input.count,
        path: input.path,
        minSuccesses: input.minSuccesses,
        attemptStartedAtMs: input.attemptStartedAtMs,
        readAtMs: input.readAtMs,
        clockSkewMs: input.clockSkewMs,
        requireOverlap: index === 0,
        killedAtMs: input.killedAtMs,
      });
      if (!accepted.ok) reasons.push(`load${index + 1}:${accepted.reasons.join('+')}`);
    });
  }
  return {
    ok: reasons.length === 0,
    reasons,
    claim: 'local-failure-terminal-drill',
    notBusinessRecovery: true,
    notProductionHa: true,
  };
}
