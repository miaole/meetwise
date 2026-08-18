/**
 * @meetwise/db · 评分证据冲突与多来源 uncertainty（SCOR-03）存储侧。
 *
 * 这是「证据必须针对当前答案版本复验」「required coverage」「多来源 uncertainty 独立保存」
 * 「冲突 → review_required（非 0 分）」的写路径数据访问面。与 SCOR-02 的
 * `scoring_write_final_score_card`（只写证据已确定性全量校验的可评分态卡）刻意分离：
 * 本 writer 写 practice_eligible / review_required 卡，总分仍在 0109 的 DB 函数内按
 * 确定性公式算（模型不输出自由总分）。
 *
 * 两层复验（答案正文 ciphertext，DB 无明文）：
 *   - domain `reverifyScoreEvidenceSet` 做文本级复验（span 界内 + digest 匹配），产出
 *     `reverified`（确定性 worker 代码计算，**不是模型输出字段**）。
 *   - DB `scoring_adjudicate_score_card` 做绑定级复验（source/version/span/digest 格式/成员），
 *     并据 `reverified=false` 强制 review_required、落 conflict_reason 固定码。
 *
 * 权限分离（复用 SCOR-01 角色，不新增角色）：
 *   - scoring_adjudicate_score_card → EXECUTE 授 scoring_worker_executor（asScoringWorkerPrincipal）。
 */
import type { Client } from './principal.ts';

function fail(code: string): never { throw Object.assign(new Error(code), { code }); }

export interface AdjudicateEvidenceInput {
  criterionId: string;
  sourceAnswerId: string;
  answerVersion: number;
  span: { offsetKind: 'utf8_byte'; start: number; end: number };
  spanDigest: string;
  disposition: 'below' | 'meets' | 'exceeds';
  /** 域级文本级复验结果（domain reverifyScoreEvidenceSet 产出；非模型字段）。 */
  reverified: boolean;
}

/** 8 个独立来源（与 domain ScoreUncertainty 逐值一致）。 */
export interface ScoreUncertaintyInput {
  evidenceCoverage?: 'complete' | 'partial' | 'missing';
  sourceIntegrity?: 'verified' | 'stale' | 'mismatch';
  voiceQuality?: 'ok' | 'low' | 'unavailable';
  modelDisagreement?: boolean;
  languageApplicable?: boolean;
  rubricDifficulty?: 'low' | 'mid' | 'high' | 'unknown';
  calibrationRelease?: boolean;
  humanReview?: 'none' | 'pending' | 'resolved';
}

export interface AdjudicateScoreCardInput {
  requestId: string;
  leaseToken: string;
  evidence: AdjudicateEvidenceInput[];
  uncertainty: ScoreUncertaintyInput;
  /** B 端高影响用途（spec §83：高影响用途进入 review_required）。 */
  highImpact: boolean;
}

export interface AdjudicateScoreCardResult {
  cardId: string | null;
  status: string | null;
  deterministicTotal: number | null;
  coverage: number | null;
  uncertainty: Record<string, unknown> | null;
  missingRequired: Array<{ criterionId: string; reason: string }> | null;
  recorded: boolean;
}

/** 证据裁决 writer。调用方须已 asScoringWorkerPrincipal（scoring_worker_executor）。 */
export async function adjudicateScoreCard(c: Client, input: AdjudicateScoreCardInput): Promise<AdjudicateScoreCardResult> {
  const r = await c.query<{
    card_id: string | null; status: string | null; deterministic_total: string | null;
    coverage: string | null; uncertainty: unknown; missing_required: unknown; recorded: boolean;
  }>(
    'SELECT * FROM scoring_adjudicate_score_card($1,$2,$3,$4,$5)',
    [input.requestId, input.leaseToken, JSON.stringify(input.evidence),
      JSON.stringify(input.uncertainty ?? {}), input.highImpact],
  );
  const row = r.rows[0];
  if (!row) fail('scoring_adjudicate_unavailable');
  return {
    cardId: row.card_id,
    status: row.status,
    deterministicTotal: row.deterministic_total == null ? null : Number(row.deterministic_total),
    coverage: row.coverage == null ? null : Number(row.coverage),
    uncertainty: (row.uncertainty ?? null) as Record<string, unknown> | null,
    missingRequired: (row.missing_required ?? null) as Array<{ criterionId: string; reason: string }> | null,
    recorded: row.recorded === true,
  };
}
