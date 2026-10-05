/**
 * UC-E2E-002 ADV prove (NHP-002-ADV-01 · GAP-UC002-ADV-LED-CROSSUSER).
 * 两族六类 SSE 会话对抗注入真证据：伪造 LED 族（V1/V2/V3）+ 跨用户 session 族（V4/V5/V6）。
 *
 * Row: UC-E2E-002 ADV column（non-happy-path-perf-load-case-matrix.md:45 · blind→case-only）
 * 期望口径（矩阵 :45 原文）:「401/403/空；不泄露他用户事件」。
 * 权威验收源: e2e-scenarios.md:89-99（E-越权恢复 :90「0 行 → 404，不泄露存在性」·
 *   E-重放去重 :91 · 验收 A1–A3 :93 · TC-E2E-002-resume/lease-race/replay :97-99）。
 * DISCLOSED（pre-exec dual 裁决 · C-ADV-1）: 产品 authz 无 403 出口——跨用户越权被折叠为
 *   404 不泄露存在性（scenarios :90 原文机制，严格更安全）。本 prove 按实际产品语义断言
 *   400/401/404/空，403 面作为 disclosed 项逐类入映射表；Ban 为凑 403 改产品。
 *
 * V1 伪造 LED·非法格式  → 400 invalid_last_event_id（fail-closed）+ 零副作用 DB 快照
 * V2 伪造 LED·越界      → 200 空 replay（零事件、非 5xx、无全流扫描错误）
 * V3 伪造 LED·重复重放  → 恒定 seq>N 窗口：两次重放逐 seq 一致、不重不漏（seq 列表落 receipt）
 * V4 跨用户·state       → 404 不泄露存在性（与不存在 id 响应不可区分）+ no-leak 断言
 * V5 跨用户·events      → 404/400 + 零事件流 no-leak（无 seq/kind/payload）
 * V6 伪造认证           → 401 unauthenticated/invalid_token/reserved_principal + 零副作用
 *
 * 互不替代（rag C3）: uc002:http:prove(H1–H3+H-authz) / uc002:lease:prove(L1–L3) /
 *   uc010:sse-resume:prove(R1–R4) / uc033:cross-user-authz:prove(X1–X11) 继续是各自锚点；
 *   本文件不改它们。PERF_api/PERF_web/LOAD_worker 显式 blind 保持（§1.0.2 :147）。
 *
 * EXIT 0 ⇔ V1–V6 每类断言全成立；任一不成立 → EXIT 1 + GAP-UC002-ADV-LED-CROSSUSER 明细
 * （诚实保留 blind/case-only · Ban retry-to-green · EXIT1 不记 flake）。
 * EXIT 0 ≠ 翻行 ≠ covered（coveredCount=8 不动 · 翻行须 post-prove dual PASS + 协调方授权）。
 *
 * releaseEvidence=false · Not HA · 隔离壳 run-e2e-isolated（随机容器/动态端口/白名单迁移）。
 *   pnpm uc002:adv:prove
 *   pnpm -C apps/api prove:uc002-adv   (raw; needs isolated DATABASE_URL)
 */
import { boot, mkAssert, tokenFor } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc002:adv');
const failures: string[] = [];
const AA = (name: string, cond: boolean) => {
  if (!cond) failures.push(name);
  A(name, cond);
};

console.log('UC-E2E-002 ADV prove (NHP-002-ADV-01 · GAP-UC002-ADV-LED-CROSSUSER) · releaseEvidence=false · Not HA');
console.log('NOTE: EXIT0≠covered；row UC-E2E-002 ADV stays blind/case-only（翻行须 post-prove dual + 协调方授权）');
console.log('CITE: uc002:http:prove / uc002:lease:prove / uc010:sse-resume:prove / uc033:cross-user-authz:prove 互不替代 · PERF/LOAD 显式 blind 保持');

// ── C-ADV-2 · 环境口径记录（dev-header 子 case 按实断言）─────────────────────
const envRecord = {
  AUTH_DEV_HEADER: process.env.AUTH_DEV_HEADER ?? '<unset>',
  NODE_ENV: process.env.NODE_ENV ?? '<unset>',
};
console.log(`ENV_RECORD C-ADV-2 AUTH_DEV_HEADER=${envRecord.AUTH_DEV_HEADER} NODE_ENV=${envRecord.NODE_ENV} (isolated shell actual · product guard principal.guard.ts:62-67)`);
const devHeaderActive = envRecord.AUTH_DEV_HEADER === '1' && envRecord.NODE_ENV !== 'production';

// Minimal privacy-active stubs (0058 not in _neg-harness) — same shape as uc-e2e-002-cross-device-http.proof.ts.
await h.pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM interview i
     WHERE i.id = target_interview AND i.owner_user_id = principal
  );
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
console.log('PIN   GAP-UC002-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered)');

// GET projection needs additive columns that _neg-harness sql may omit (same as uc002:http prove).
await h.pool.query(`
  ALTER TABLE interview
    ADD COLUMN IF NOT EXISTS resume_id uuid,
    ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint,
    ADD COLUMN IF NOT EXISTS application_id text,
    ADD COLUMN IF NOT EXISTS application_attempt int,
    ADD COLUMN IF NOT EXISTS job_id text,
    ADD COLUMN IF NOT EXISTS job_title_snapshot text,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now()
`);

const STREAM = 'IV_UC002ADV';
const GHOST = 'IV_UC002ADV_GHOST'; // 不存在的 id（V4 存在性不可区分对照）
const OWNER = 'userA';
const ATTACKER = 'userB';
const AUTH_OWNER = h.U(OWNER);      // dev-header 回退（C-ADV-2：隔离壳实际 AUTH_DEV_HEADER=1）
const AUTH_OTHER = h.U(ATTACKER);
const OWNER_TOKEN = tokenFor(OWNER);      // 合法 Bearer（V4/V5 属主对照不用；V6 坏令牌基线用）
const SENTINEL = '__system_qbank__';
const SENTINEL_TOKEN = tokenFor(SENTINEL); // 令牌 uid 撞保留 sentinel（principal.guard.ts:55）

await h.pool.query(
  `INSERT INTO interview(id,owner_user_id,status,current_question_index,questions)
   VALUES ($1,$2,'active',1,'["q1","q2","q3"]'::jsonb)
   ON CONFLICT (id) DO UPDATE SET status='active', owner_user_id=$2, current_question_index=1`,
  [STREAM, OWNER],
);
await h.pool.query('DELETE FROM interview_event WHERE stream_key=$1', [STREAM]);
await h.pool.query(
  `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
    ($2,$1,1,'question_ready','{"n":1}'),
    ($2,$1,2,'waiting_user','{"n":2}'),
    ($2,$1,3,'progress','{"n":3}'),
    ($2,$1,4,'question_ready','{"n":4}'),
    ($2,$1,5,'waiting_user','{"n":5}')`,
  [STREAM, OWNER],
);

/** DB before/after 快照（读-only 面副作用探针 · 特权 pool 直查）。 */
async function snap() {
  const s = await h.pool.query(
    'SELECT count(*)::int AS n, COALESCE(max(seq),0)::int AS max_seq FROM interview_event WHERE stream_key=$1', [STREAM]);
  const t = await h.pool.query('SELECT count(*)::int AS n FROM interview_event');
  const iv = await h.pool.query(
    "SELECT count(*)::int AS n FROM interview WHERE id=$1 AND owner_user_id=$2 AND status='active'", [STREAM, OWNER]);
  return {
    streamEvents: Number(s.rows[0].n),
    maxSeq: Number(s.rows[0].max_seq),
    totalEvents: Number(t.rows[0].n),
    ownerRow: Number(iv.rows[0].n),
  };
}
const snapEq = (a: Awaited<ReturnType<typeof snap>>, b: Awaited<ReturnType<typeof snap>>) =>
  a.streamEvents === b.streamEvents && a.maxSeq === b.maxSeq
  && a.totalEvents === b.totalEvents && a.ownerRow === b.ownerRow;
const snapStr = (s: Awaited<ReturnType<typeof snap>>) =>
  `stream_events=${s.streamEvents} max_seq=${s.maxSeq} total_events=${s.totalEvents} owner_row=${s.ownerRow}`;

/** SSE catch-up 读取（只回 status/seq 列表/kind 列表；绝不回传 payload 原文 —— C-ADV-3 卫生）。 */
async function readSseCatchUp(
  auth: Record<string, string>,
  lastId?: number,
  timeoutMs = 1200,
): Promise<{ status: number; ids: number[]; kinds: string[]; hasEventLine: boolean; hasErrorMarker: boolean }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  let status = 0;
  let buf = '';
  try {
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, {
      headers: {
        ...auth,
        ...(lastId != null && lastId > 0 ? { 'last-event-id': String(lastId) } : {}),
      },
      signal: ac.signal,
    });
    status = res.status;
    if (status === 200 && res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
      }
    } else if (res.body) {
      buf = await res.text().catch(() => '');
    }
  } catch {
    /* abort = expected hold-and-tail disconnect */
  } finally {
    clearTimeout(timer);
  }
  const ids = [...buf.matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1]));
  const kinds = [...buf.matchAll(/^event: (\w+)$/gm)].map((m) => m[1]);
  return {
    status,
    ids,
    kinds,
    hasEventLine: /^event: /m.test(buf),
    hasErrorMarker: /invalid_last_event_id|internal_error/.test(buf),
  };
}

const jsonOf = (body: any) => JSON.stringify(body ?? {});
const keysOf = (body: any) => Object.keys(body ?? {}).sort();

// ══ V1 · 伪造 LED·非法格式（NEG 内嵌：业务拒 + 错误码 + 零副作用）══════════════
{
  console.log('\n──────── V1 · 伪造 LED 非法格式 → 400 invalid_last_event_id（fail-closed）────────');
  // 空白代表: '1 2'（内部空白可穿透 HTTP 层）/ ''（空串）；纯前导/尾随 OWS 被 HTTP 传输层剥离，
  // 无法经 fetch 注入（DISCLOSED-D2）。17 位溢出按 mw-e2e-ha 裁决归 V1（正则拒）；15 位越界归 V2。
  const illegal = ['Infinity', '1.5', '1e3', '-1', '+1', '01', '1 2', '', '99999999999999999', 'NaN', '0x10'];
  const before = await snap();
  console.log(`DB_BEFORE V1 ${snapStr(before)}`);
  for (const bad of illegal) {
    const r = await h.req('GET', `/interview/${STREAM}/events`, { ...AUTH_OWNER, 'last-event-id': bad });
    const label = bad === '' ? "''" : bad;
    AA(`V1 LED=${JSON.stringify(label)} → 400`, r.status === 400);
    AA(`V1 LED=${JSON.stringify(label)} → invalid_last_event_id`, r.body?.error === 'invalid_last_event_id');
    AA(`V1 LED=${JSON.stringify(label)} 非流式响应（fail-closed 非 SSE）`,
      !(r.headers.get('content-type') ?? '').includes('text/event-stream'));
  }
  const after = await snap();
  console.log(`DB_AFTER  V1 ${snapStr(after)}`);
  AA('V1 零副作用：非法 LED 未产生任何 fabricated 行（快照 before==after）', snapEq(before, after));
  AA('V1 零副作用：无读扩散（stream 事件数仍 5 · max_seq 仍 5）',
    after.streamEvents === 5 && after.maxSeq === 5);
}

// ══ V2 · 伪造 LED·越界（合法格式 · seq > 全流 max → 200 空 replay）════════════
{
  console.log('\n──────── V2 · 合法格式越界 LED=999999999999999（15 位 · seq>max）→ 200 空 replay ────────');
  // DISCLOSED-D4: 空 initial replay 时 Node hijacked-SSE 的 200 响应头与首个 2s 心跳合并冲刷
  // （传输层冲刷时机，diag 实测 headers≈2050ms · 产品 replay 语义零事件不受影响）→ 客户端
  // 观察窗 4s（覆盖 ≥1 个 ping；deadline 封顶 10min），断言对象仍是「200 + 零 event 行」。
  const before = await snap();
  const r = await readSseCatchUp(AUTH_OWNER, 999_999_999_999_999, 4000);
  console.log(`V2_OVERBOUND status=${r.status} ids=[${r.ids.join(',')}] kinds=[${r.kinds.join(',')}]`);
  AA('V2 越界 LED → 200（非 4xx/5xx · 不崩溃）', r.status === 200);
  AA('V2 空 replay：零事件（ids=[]）', r.ids.length === 0);
  AA('V2 空 replay：零 event 行（无 SSE event: 行）', !r.hasEventLine && r.kinds.length === 0);
  AA('V2 无全流扫描错误 / 无 invalid_last_event_id 降级', !r.hasErrorMarker);
  AA('V2 越界不泄露任何他人事件（缓冲区无 seq/kind 发射）', r.ids.length === 0 && r.kinds.length === 0);
  const after = await snap();
  console.log(`DB_AFTER  V2 ${snapStr(after)}`);
  AA('V2 零副作用：越界读不产生行（快照 before==after）', snapEq(before, after));
}

// ══ V3 · 伪造 LED·重复重放（E-重放去重 · seq 列表落 receipt —— C-ADV-4）═══════
{
  console.log('\n──────── V3 · 同一 LED=2 连续重放 → 恒定 seq>N 窗口 不重不漏 ────────');
  const r1 = await readSseCatchUp(AUTH_OWNER, 2);
  const r2 = await readSseCatchUp(AUTH_OWNER, 2);
  const r3 = await readSseCatchUp(AUTH_OWNER, 4);
  console.log(`V3_REPLAY1_SEQ=${r1.ids.join(',')}`);   // C-ADV-4：seq 列表逐字落 receipt
  console.log(`V3_REPLAY2_SEQ=${r2.ids.join(',')}`);   // C-ADV-4
  console.log(`V3_REPLAY3_SEQ(led=4)=${r3.ids.join(',')}`);
  console.log(`V3_REPLAY1_KINDS=[${r1.kinds.join(',')}]`);
  AA('V3 重放1 → 200 且窗口恰 seq=[3,4,5]', r1.status === 200 && r1.ids.join(',') === '3,4,5');
  AA('V3 重放2 → 200 且窗口恰 seq=[3,4,5]', r2.status === 200 && r2.ids.join(',') === '3,4,5');
  AA('V3 两次重放逐 seq 一致（幂等 replay）', r1.ids.join(',') === r2.ids.join(',') && r1.kinds.join(',') === r2.kinds.join(','));
  AA('V3 恒定 seq>N 窗口：无 seq≤2 泄漏', r1.ids.every((s) => s > 2) && r2.ids.every((s) => s > 2));
  AA('V3 不重（窗口内无重复 seq）',
    new Set(r1.ids).size === r1.ids.length && new Set(r2.ids).size === r2.ids.length);
  AA('V3 不漏（窗口连续无洞 · 3,4,5）',
    r1.ids.join(',') === [3, 4, 5].join(',') && r2.ids.join(',') === [3, 4, 5].join(','));
  AA('V3 边界 LED=4 → 恰 [5]（服务端权威窗口）', r3.status === 200 && r3.ids.join(',') === '5');
}

// ══ V4 · 跨用户·state（404 不泄露存在性 + no-leak）═══════════════════════════
{
  console.log('\n──────── V4 · 他人有效令牌 GET /interview/:id → 404 不泄露存在性 ────────');
  const owner = await h.req('GET', `/interview/${STREAM}`, AUTH_OWNER);
  AA('V4 属主对照 GET → 200（属主可见面存在）', owner.status === 200 && owner.body?.id === STREAM);
  const ownerKeys = keysOf(owner.body);
  console.log(`V4_OWNER_KEYS=[${ownerKeys.join(',')}]（仅用于 no-leak 键差集 · 不打印值）`);

  const before = await snap();
  const other = await h.req('GET', `/interview/${STREAM}`, AUTH_OTHER);
  AA('V4 跨用户 GET → 404（非 403/非 200）', other.status === 404);
  AA('V4 错误码 not_found_or_forbidden', other.body?.error === 'not_found_or_forbidden');
  const ghost = await h.req('GET', `/interview/${GHOST}`, AUTH_OTHER);
  AA('V4 存在性不可区分：不存在 id 同样 404', ghost.status === 404);
  AA('V4 不可区分：越权 404 与不存在 404 响应体逐字节一致',
    jsonOf(other.body) === jsonOf(ghost.body));
  AA('V4 no-leak：响应体无属主可见键（questions/progress/display_code 等零泄露）',
    keysOf(other.body).every((k) => !ownerKeys.includes(k)));
  AA('V4 no-leak：响应体不含 display_code/题面/进度标记',
    !jsonOf(other.body).includes('display_code') && !jsonOf(other.body).includes('question')
    && !jsonOf(other.body).includes('progress'));
  AA('V4 no-leak：响应体不含属主/流标识（owner id 与 stream key 零回显）',
    !jsonOf(other.body).includes(OWNER) && !jsonOf(other.body).includes(STREAM));
  const after = await snap();
  console.log(`DB_AFTER  V4 ${snapStr(after)}`);
  AA('V4 零副作用：跨用户 state 读不产生行（快照 before==after）', snapEq(before, after));
}

// ══ V5 · 跨用户·events（404/400 + 零事件流 no-leak）══════════════════════════
{
  console.log('\n──────── V5 · 他人有效令牌 GET events（合法/非法 LED 各一）→ 零事件流 no-leak ────────');
  const before = await snap();
  // (a) 合法 LED=0 → 属主面 RLS 0 行 → 404
  const v0 = await h.req('GET', `/interview/${STREAM}/events`, { ...AUTH_OTHER, 'last-event-id': '0' });
  AA('V5(a) 跨用户 events LED=0 → 404', v0.status === 404);
  AA('V5(a) 错误码 not_found_or_forbidden', v0.body?.error === 'not_found_or_forbidden');
  // (b) 合法 LED=2 → parse 过 → RLS 守卫 → 404（LED 不改变越权结局）
  const v2 = await h.req('GET', `/interview/${STREAM}/events`, { ...AUTH_OTHER, 'last-event-id': '2' });
  AA('V5(b) 跨用户 events LED=2 → 404（恒定不泄露）', v2.status === 404);
  // (c) 非法 LED → parse 先于 RLS → 400（只暴露解析错误码，不暴露面试存在性）
  const vbad = await h.req('GET', `/interview/${STREAM}/events`, { ...AUTH_OTHER, 'last-event-id': 'Infinity' });
  AA('V5(c) 跨用户 events 非法 LED → 400 invalid_last_event_id', vbad.status === 400 && vbad.body?.error === 'invalid_last_event_id');
  AA('V5 no-leak：全部响应体无 seq/kind/payload 字段',
    [v0, v2, vbad].every((r) => !('seq' in (r.body ?? {})) && !('kind' in (r.body ?? {})) && !('payload' in (r.body ?? {}))));
  AA('V5 no-leak：全部响应体仅 {error} 单键（零事件面）',
    [v0, v2, vbad].every((r) => keysOf(r.body).length === 1 && keysOf(r.body)[0] === 'error'));
  AA('V5 no-leak：响应非 SSE 流（无 event 发射）',
    [v0, v2, vbad].every((r) => !(r.headers.get('content-type') ?? '').includes('text/event-stream')));
  // (d) SSE 读路径直接验证（合法 LED · 404 在 hijack 前，无流）
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 700);
  let sseStatus = 0;
  try {
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, {
      headers: { ...AUTH_OTHER, 'last-event-id': '2' }, signal: ac.signal,
    });
    sseStatus = res.status;
    if (res.body) { await res.text().catch(() => ''); }
  } catch { /* 404 已决 */ } finally { clearTimeout(timer); }
  AA('V5(d) SSE 路径跨用户 → 404（零事件流）', sseStatus === 404);
  const after = await snap();
  console.log(`DB_AFTER  V5 ${snapStr(after)}`);
  AA('V5 零副作用：跨用户 events 读不产生行（快照 before==after）', snapEq(before, after));
}

// ══ V6 · 伪造认证（无令牌/坏令牌/保留 sentinel/伪造 dev-header → 401 fail-closed）═══
{
  console.log('\n──────── V6 · 伪造认证族 → 401 fail-closed（principal.guard.ts:54-68）────────');
  const before = await snap();
  const authz = (code: string) => `Bearer ${code}`;
  // (a) 无令牌（无 Authorization 无 x-user-id）
  const rNo = await h.req('GET', `/interview/${STREAM}/events`, {});
  AA('V6(a) 无令牌 → 401 unauthenticated', rNo.status === 401 && rNo.body?.error === 'unauthenticated');
  // (b) 坏令牌
  const rBad = await h.req('GET', `/interview/${STREAM}/events`, { authorization: authz('forged.token.value') });
  AA('V6(b) 坏令牌 → 401 invalid_token', rBad.status === 401 && rBad.body?.error === 'invalid_token');
  // (c) 保留 sentinel uid 的签名令牌（B 系统内部身份不可作 HTTP 主体 · guard:55）
  const rSent = await h.req('GET', `/interview/${STREAM}/events`, { authorization: `Bearer ${SENTINEL_TOKEN}` });
  AA('V6(c) sentinel Bearer 令牌 → 401 reserved_principal', rSent.status === 401 && rSent.body?.error === 'reserved_principal');
  // (d) 伪造 dev-header + sentinel（隔离壳实际 AUTH_DEV_HEADER=1 → 开启语义 · C-ADV-2）
  AA('V6(d) 前置：隔离壳 dev-header 实际开启（按实断言）', devHeaderActive);
  const rDevSent = await h.req('GET', `/interview/${STREAM}/events`, { 'x-user-id': SENTINEL });
  AA('V6(d) dev-header sentinel → 401 reserved_principal（guard:65）',
    rDevSent.status === 401 && rDevSent.body?.error === 'reserved_principal');
  // (e) 生产硬闸探针：NODE_ENV=production 时 dev-header 分支永不生效（guard:62-67 · guard:68 兜底）
  //     —— 进程内瞬态模拟生产语义（产品零改动 · DISCLOSED-D3），用毕立即还原。
  let rProd: { status: number; body: any } = { status: 0, body: undefined };
  const savedNodeEnv = process.env.NODE_ENV;
  try {
    process.env.NODE_ENV = 'production';
    rProd = await h.req('GET', `/interview/${STREAM}/events`, { 'x-user-id': ATTACKER });
  } finally {
    if (savedNodeEnv === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = savedNodeEnv;
  }
  console.log(`ENV_RESTORED NODE_ENV=${process.env.NODE_ENV ?? '<unset>'} AUTH_DEV_HEADER=${process.env.AUTH_DEV_HEADER}`);
  AA('V6(e) NODE_ENV=production + dev-header → 401 unauthenticated（生产硬闸 · guard:62-67）',
    rProd.status === 401 && rProd.body?.error === 'unauthenticated');
  // 全族 401 no-leak：响应体仅 {error}，无任何事件/属主面
  AA('V6 no-leak：全部 401 响应体仅 {error} 单键',
    [rNo, rBad, rSent, rDevSent, rProd].every((r) => keysOf(r.body).length === 1 && keysOf(r.body)[0] === 'error'));
  AA('V6 no-leak：401 响应体不含 stream/属主标识',
    [rNo, rBad, rSent, rDevSent, rProd].every((r) => !jsonOf(r.body).includes(STREAM) && !jsonOf(r.body).includes(OWNER)));
  const after = await snap();
  console.log(`DB_AFTER  V6 ${snapStr(after)}`);
  AA('V6 零副作用：伪造认证族不产生行（快照 before==after）', snapEq(before, after));
  AA('V6 对照：合法属主令牌仍通过（fail-closed 未误伤合法面）',
    (await h.req('GET', `/interview/${STREAM}`, AUTH_OWNER)).status === 200);
}

// ══ C-ADV-1 · 期望→实际→源锚 映射表（403↔404 折叠逐类可查 · disclosed）════════
{
  console.log('\n──────── MAPPING-TABLE C-ADV-1（期望（矩阵:45+scenarios:90/:93）→ 实际 → 源锚）────────');
  const rows: Array<[string, string, string, string]> = [
    ['V1', '矩阵:45「401/403/空」伪造LED族 · scenarios:91 seq 去重',
      '实际=400 invalid_last_event_id ×11 注入（fail-closed 非 5xx 非静默）',
      'apps/api/src/platform/last-event-id.ts:8-18'],
    ['V2', '矩阵:45「空」+「不泄露他用户事件」',
      '实际=200 空 replay（零事件 · 无全流扫描错误）',
      'apps/api/src/modules/interview/interview.service.ts:818（恒 seq>$2 ORDER BY seq）'],
    ['V3', 'scenarios:91 E-重放去重「事件不重不漏」· :93 A1',
      '实际=同 LED 两次重放 seq 窗口逐 seq 一致（3,4,5==3,4,5 · 不重不漏）',
      'interview.service.ts:818 + interview.controller.ts:274'],
    ['V4', '矩阵:45「403」↔ scenarios:90「0 行 → 404，不泄露存在性」· :93 A3「非属主 →404」',
      '实际=404 not_found_or_forbidden（403 被产品折叠为 404 · DISCLOSED-D1）',
      'apps/api/src/modules/interview/interview.service.ts:164-167'],
    ['V5', '矩阵:45「不泄露他用户事件」+「空」',
      '实际=404（合法LED）/400（非法LED）· 零事件流 · 无 seq/kind/payload',
      'apps/api/src/modules/interview/interview.service.ts:814-820'],
    ['V6', '矩阵:45「401」',
      '实际=401 unauthenticated/invalid_token/reserved_principal（含生产硬闸 dev-header 禁用）',
      'apps/api/src/platform/principal.guard.ts:54-68'],
  ];
  for (const [id, expect, actual, anchor] of rows) {
    console.log(`MAP ${id} | 期望: ${expect} | 实际: ${actual} | 源锚: ${anchor}`);
  }
  console.log("DISCLOSED-D1 403↔404 折叠: 产品 authz 无 403 出口；跨用户越权=404 不泄露（scenarios:90 原文机制 · 403 会泄露「存在但无权」=更弱）；矩阵:45「403」面按披露口径记为「产品以 404 折叠」；Ban 改产品凑 403 已遵守。");
  console.log('DISCLOSED-D2 空白注入: 纯前导/尾随 OWS 被 HTTP 传输层剥离无法经 fetch 注入；以内部空白 \'1 2\' + 空串 \'\' 为空白代表。');
  console.log('DISCLOSED-D3 V6(e) 生产硬闸为进程内瞬态 NODE_ENV 模拟（用毕还原 · 产品零改动）；隔离壳实际 AUTH_DEV_HEADER=1 · NODE_ENV 见 ENV_RECORD。');
  console.log('DISCLOSED-D4 V2 空 replay 的 200 响应头在 Node hijacked-SSE 下与首个 2s 心跳合并冲刷（传输层时机 · diag 实测 ≈2050ms）；客户端观察窗设 4s，断言对象仍是 200+零 event 行，产品 replay 语义不受影响。');
  console.log('BLIND-KEEP PERF_api/PERF_web/LOAD_worker 显式 blind 保持（§1.0.2 :147「跨副本压测未证」· 本刀零触碰）。');
  AA('C-ADV-1 映射表+披露项打印完成（6 类）', rows.length === 6);
}

// ══ EXIT 契约 · 诚实保留路径 ═════════════════════════════════════════════════
if (failures.length > 0) {
  console.log(`\nGAP-UC002-ADV-LED-CROSSUSER EXIT=1 · 未证断言 ${failures.length} 条（哪类哪断言 · 诚实保留 blind/case-only · Ban invent fix · 不记 flake）:`);
  for (const f of failures) console.log(`  GAP-DETAIL ${f}`);
  console.log('  锚: last-event-id.ts:8-18 · interview.service.ts:164-175/:814-820 · interview.controller.ts:250-286 · principal.guard.ts:54-68');
} else {
  console.log('\nEXIT-GATE V1–V6 全成立 → EXIT=0（仅证明两族六类 ADV 真证据成立 · 不翻行 · 不 covered · coveredCount=8 不动）');
}

// ── teardown drain（attempt2 教训：服务端 SSE hold 残留 + 即时 process.exit → pg pool
//    teardown race 非确定崩溃。只涉 prove 进程收尾，零产品改动，不影响任何断言；不吞错——
//    pool.end 异常/超时如实打 POOL_END_NOTE，EXIT 仍由断言结果决定）──
console.log('TEARDOWN_DRAIN 3.5s: 等服务端 SSE hold 循环观测 client 断开并释放连接/槽位');
await new Promise((r) => setTimeout(r, 3500));
await Promise.race([
  h.pool.end().then(
    () => console.log('TEARDOWN pool.end OK'),
    (e: any) => console.log(`POOL_END_NOTE ${e?.message ?? e}`),
  ),
  new Promise((r) => setTimeout(r, 6000)).then(() => console.log('POOL_END_NOTE timeout 6s（按断言结果退出）')),
]);
await done();
