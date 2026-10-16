/**
 * 积分明细列表只读面（billing-redesign §3.13 升 P1 面·LANDING-INDEX 十三节裁决②「双端逐笔可见」）。
 * 数据源恒=三真账 UNION：entitlement_consumption（场/预留 saga 粒度）+ topic_charge（话题结算粒度·
 * flag-on 后才有行）+ question_usage_ledger（模型调用归集审计粒度·0 值行）。影子计量面（只算不扣
 * 观测表）零引用——观测面 ≠ 账面，读影子即越账本。
 *
 * 语义钉死（读面裁决落值·调用方不得临场改表）：
 *   状态映射   consumption：reserved→reserved / confirmed→settled / partial_confirmed→settled /
 *              released→released；failed 标注=LEFT JOIN interview ON interview.id=idempotency_key
 *              AND service_type='mock_interview' 取 interview.status='failed'（唯一表联结语义）。
 *              topic_charge 三值→settled（waived=0 值子行·细值随 topic_status/reason 行内携带）；
 *              usage 行 settled·cause='generation_failed'→failed（cause 为唯一 failed 字面承载）。
 *   场景枚举   mock_interview/ocr/resume_quiz/resume_diagnosis（四活 service_type 直透）+ topic/usage
 *              （粒度自标）+ payment（获得行预留位·三账本零获得侧行·恒诚实空·Ban 伪造入账）。
 *   逐源引用投影 consumption 行 interview_id 仅 mock_interview（幂等键即场 id）·topic_id/invocation_key
 *              无列恒 NULL；topic 行 interview_id/topic_id 直读·invocation_key 无列 NULL；usage 行
 *              interview_id NOT NULL·topic_id 可空·invocation_key 直读。幂等键=consumption 幂等键/
 *              usage invocation_key/topic 自然键 interview_id||':'||topic_id。
 *   数额       consumption=-(units_settled)（reserved 取 units_requested·released 已回 0）·
 *              topic=-units·usage=0（审计行）——非逐笔余额推导（多桶 FIFO 下可用额≠Σ账本差），
 *              余额只以读时快照口径在分页头承载。consumption 行另透传 unitsRequested=units_requested
 *              原值——partial_confirmed→settled 时 requested−settled 差额由此对用户可见（topic/usage
 *              无此列 NULL）。
 *   分页       keyset 值基三段复合游标 (created_at DESC, source_discriminator, natural_key)——
 *              natural_key 序列化钉死：consumption=idempotency_key·usage=invocation_key·
 *              topic=interview_id||':'||topic_id；值基抗删行（游标载值非行偏移）。
 *              时间窗默认 90 天/上限 365 天；单页 LIMIT 50（commerce 列表窗先例同宽）。
 *
 * 只读铁律：本文件仅 SELECT——读错诚实抛错（不吞错不伪空列表·与影子计量 fail-soft 语义相反）。
 */
import type { Client } from '../principal.ts';

/** 逐笔行来源判别（UNION 三臂·游标第二段）。 */
export type LedgerSource = 'consumption' | 'topic' | 'usage';

/** 用户口径状态四值（映射表落值·Ban 执行席临场造词）。 */
export type LedgerEntryStatus = 'settled' | 'reserved' | 'released' | 'failed';

/** 逐笔行（引用四元逐源可空投影·字段语义见文件头）。 */
export interface LedgerEntry {
  createdAt: string;
  source: LedgerSource;
  /** 场景：四活 service_type 直透或 topic/usage 粒度自标（payment=获得行预留位·恒诚实空）。 */
  scene: string;
  status: LedgerEntryStatus;
  /** 带符号数额（扣分为负·released 已回 0·usage 审计行 0）。 */
  amountUnits: number;
  /** consumption 行 units_requested 原值（partial_confirmed→settled 时 requested−settled 差额用户可见·topic/usage 无列 NULL）。 */
  unitsRequested: number | null;
  interviewId: string | null;
  topicId: string | null;
  invocationKey: string | null;
  /** 幂等键：consumption=idempotency_key·usage=invocation_key·topic=interview_id||':'||topic_id。 */
  idempotencyKey: string;
  /** usage 行 cause 九值原样（其余来源 NULL）。 */
  cause: string | null;
  /** topic 行三值细值原样 counted/counted_capped/waived（其余来源 NULL）。 */
  topicStatus: 'counted' | 'counted_capped' | 'waived' | null;
  /** topic 行 reason（waived/skipped 等明示落行·其余来源 NULL）。 */
  reason: string | null;
  /** topic 行 rule_version（其余来源 NULL）。 */
  ruleVersion: string | null;
}

export interface LedgerPage {
  entries: LedgerEntry[];
  /** 下一页游标（base64url·不透明·调用方逐字回显自洽）；页短于单页宽=末页 NULL。 */
  nextCursor: string | null;
  /** 本页实际时间窗（天·回显自洽）。 */
  windowDays: number;
}

export interface ListLedgerOptions {
  /** 上页回显游标（不透明·原样透传）。 */
  cursor?: string | null;
  /** 时间窗天数（默认 90·上限 365）。 */
  windowDays?: number;
}

/** 单页宽（commerce 列表窗先例同宽）。 */
export const LEDGER_PAGE_SIZE = 50;

const DEFAULT_WINDOW_DAYS = 90;
const MAX_WINDOW_DAYS = 365;

const SOURCES: readonly LedgerSource[] = ['consumption', 'topic', 'usage'];

interface LedgerCursorPayload { v: 1; t: string; s: LedgerSource; k: string }

function encodeLedgerCursor(p: LedgerCursorPayload): string {
  return Buffer.from(JSON.stringify(p), 'utf8').toString('base64url');
}

const CURSOR_TS_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?Z$/;

/** 游标解码 fail-closed：形不对即抛（映射 HTTP 400）·绝不定格成首页。 */
function decodeLedgerCursor(cursor: string): LedgerCursorPayload {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
  } catch {
    throw Object.assign(new Error('ledger_cursor_invalid'), { code: 'ledger_cursor_invalid' });
  }
  const p = parsed as Partial<LedgerCursorPayload> | null;
  if (
    !p || p.v !== 1 || typeof p.t !== 'string' || !CURSOR_TS_RE.test(p.t)
    || typeof p.k !== 'string' || p.k.length === 0
    || !SOURCES.includes(p.s as LedgerSource)
  ) {
    throw Object.assign(new Error('ledger_cursor_invalid'), { code: 'ledger_cursor_invalid' });
  }
  return { v: 1, t: p.t, s: p.s as LedgerSource, k: p.k };
}

function assertPrincipal(c: Client, owner: string): Promise<void> {
  return c.query("SELECT current_setting('app.principal_user', true) AS p").then((r) => {
    if (r.rows[0].p !== owner) throw Object.assign(new Error('principal_owner_mismatch'), { code: 'principal_owner_mismatch' });
  });
}

/**
 * C 端本人逐笔读（RLS 直读·零 DEFINER 零特权）：三真账 UNION 有界投影 + keyset 值基三段
 * 复合游标翻页。行作用域由 p_owner FORCE RLS 兜底，owner 形参另做 principal 语境一致性断言
 * （availableUnits 同款）。
 */
export async function listLedger(c: Client, owner: string, opts: ListLedgerOptions = {}): Promise<LedgerPage> {
  await assertPrincipal(c, owner);
  const windowDays = opts.windowDays ?? DEFAULT_WINDOW_DAYS;
  if (!Number.isInteger(windowDays) || windowDays < 1 || windowDays > MAX_WINDOW_DAYS) {
    throw Object.assign(new Error('ledger_window_invalid'), { code: 'ledger_window_invalid' });
  }
  const cur = opts.cursor ? decodeLedgerCursor(opts.cursor) : null;
  const r = await c.query<{
    created_at: Date; created_at_us: string; source: LedgerSource; scene: string; status: LedgerEntryStatus;
    amount_units: number; requested_units: number | null; interview_id: string | null; topic_id: string | null;
    invocation_key: string | null; natural_key: string; cause: string | null;
    topic_status: 'counted' | 'counted_capped' | 'waived' | null; reason: string | null;
    rule_version: string | null;
  }>(
    `SELECT created_at, to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS created_at_us,
            source, scene, status, amount_units, requested_units, interview_id, topic_id,
            invocation_key, natural_key, cause, topic_status, reason, rule_version
       FROM (
         SELECT ec.created_at,
                'consumption'::text AS source,
                ec.service_type AS scene,
                CASE WHEN i.status = 'failed' THEN 'failed'::text
                     WHEN ec.status = 'reserved' THEN 'reserved'
                     WHEN ec.status IN ('confirmed','partial_confirmed') THEN 'settled'
                     ELSE 'released' END AS status,
                CASE WHEN ec.status = 'reserved' THEN -ec.units_requested
                     ELSE -COALESCE(ec.units_settled, 0) END::float8 AS amount_units,
                ec.units_requested::float8 AS requested_units,
                CASE WHEN ec.service_type = 'mock_interview' THEN ec.idempotency_key END AS interview_id,
                NULL::text AS topic_id,
                NULL::text AS invocation_key,
                ec.idempotency_key AS natural_key,
                NULL::text AS cause, NULL::text AS topic_status, NULL::text AS reason,
                NULL::text AS rule_version
           FROM entitlement_consumption ec
           LEFT JOIN interview i ON i.id = ec.idempotency_key AND ec.service_type = 'mock_interview'
          WHERE ec.owner_user_id = $1
         UNION ALL
         SELECT tc.created_at, 'topic'::text, 'topic'::text, 'settled'::text,
                (-tc.units)::float8, NULL::float8 AS requested_units,
                tc.interview_id, tc.topic_id, NULL::text,
                (tc.interview_id || ':' || tc.topic_id),
                NULL::text, tc.status, tc.reason, tc.rule_version
           FROM topic_charge tc
          WHERE tc.owner_user_id = $1
         UNION ALL
         SELECT qu.created_at, 'usage'::text, 'usage'::text,
                CASE WHEN qu.cause = 'generation_failed' THEN 'failed'::text ELSE 'settled' END,
                0::float8, NULL::float8 AS requested_units,
                qu.interview_id, qu.topic_id, qu.invocation_key, qu.invocation_key,
                qu.cause, NULL::text, NULL::text, NULL::text
           FROM question_usage_ledger qu
          WHERE qu.owner_user_id = $1
       ) u
      WHERE u.created_at >= now() - ($2::text || ' days')::interval
        AND ($3::timestamptz IS NULL
             OR (u.created_at, u.source, u.natural_key) < ($3::timestamptz, $4::text, $5::text))
      ORDER BY u.created_at DESC, u.source DESC, u.natural_key DESC
      LIMIT $6::int`,
    [owner, String(windowDays), cur ? cur.t : null, cur ? cur.s : null, cur ? cur.k : null, LEDGER_PAGE_SIZE],
  );
  const entries: LedgerEntry[] = r.rows.map((row) => ({
    createdAt: row.created_at.toISOString(),
    source: row.source,
    scene: row.scene,
    status: row.status,
    amountUnits: Number(row.amount_units),
    unitsRequested: row.requested_units === null ? null : Number(row.requested_units),
    interviewId: row.interview_id,
    topicId: row.topic_id,
    invocationKey: row.invocation_key,
    idempotencyKey: row.natural_key,
    cause: row.cause,
    topicStatus: row.topic_status,
    reason: row.reason,
    ruleVersion: row.rule_version,
  }));
  const last = r.rows[r.rows.length - 1];
  // 游标时间戳载微秒文本（timestamptz 全精度）——JS Date/ISOString 截毫秒，同毫秒微秒差行会被
  // 值基谓词整段漏掉（keyset 精度必须不低于排序键精度）。
  const nextCursor = last && r.rows.length === LEDGER_PAGE_SIZE
    ? encodeLedgerCursor({ v: 1, t: last.created_at_us, s: last.source, k: last.natural_key })
    : null;
  return { entries, nextCursor, windowDays };
}
