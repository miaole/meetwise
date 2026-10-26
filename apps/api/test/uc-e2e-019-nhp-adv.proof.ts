/**
 * NHP-019-ADV-01 · UC-E2E-019 ADV 列缺列隔离收据（blind→case-only · case registration only）。
 *
 * REQUEST: ai-docs/delivery/harness/uc019-e2e-REQUEST.md §1.4（V1–V6 对抗臂表·一行一 case）。
 * 既有 uc019 db 29 臂 + http 35 臂 #229 回归面零触零增臂零改写（互不替代·只读引用）。
 *
 * Real HTTP + real isolated PostgreSQL（run-e2e-isolated → 隔离真 PG · in-process NestJS createApp）。
 * 零 live key · 零模型外呼（retry 链零模型调用·est live=0）· Ban 伪造 Key 面。
 *
 * 对抗臂表（行为面=届时码面亲证 @interview.service.ts :36/:64-73/:776-780 · interview-report.ts :35-44 ·
 * report.ts :7/:10/:66-71）：
 *   V1 未鉴权            无 principal 头 POST report/retry → 401（H4 :293 同族旁证）。
 *   V2 跨 owner          他人 principal 对目标 interview retry → 410 GONE interview_privacy_fenced
 *                        （stub 形·guardInterviewPrivacyTx :64-73 先于状态 SELECT :35-44——interview 行
 *                        存在故非 404 not_found_or_forbidden 分支；owner-match stub 披露保留
 *                        ·PIN GAP-UC019-PRIVACY-STUB ≠ 0058 fence covered）。
 *   V3 伪造状态           ready/running 报告上 POST retry → 404 no_retriable_report（状态白名单外
 *                        一律拒=状态机外拒绝面·白名单 ('failed','quarantined') :35-44）。
 *   V4 连点重放风暴        同一 failed report 连发 5 POST 真序列：200 requeued:true → 404 → 404 →
 *                        429 report_retry_limited → 429（RL capacity 3 · refill 3/h 测试窗回填可忽略；
 *                        RL 闸 :778 先于 retryReportById 委托 :780·令牌逐发消耗）·恰单行·零重复入队·
 *                        额度不变——「连点仅一次重生成」现由 RL+状态 CAS 承载非幂等键（429≠幂等键·
 *                        GAP-UC019-REGEN-IDEM-KEY 现势证据）。
 *   V5 quarantined 出口    对照臂（H3 同构回归·零替代既有 H3 臂）：poison→quarantined→POST retry →
 *                        200 requeued:true + attempts=0 + 额度不变 + consumption confirmed
 *                        （#229 D2 后现势·对 harness 陈旧句=现势对照证据非 wash·PIN_RETIRED）。
 *   V6 键缺席诚实钉        information_schema 双查（ai_report 无 regenerate* 列·零 regenerate* 表）
 *                        + 半臂：伪造 regenerateAttempt 字段双发（body 一发 + query 一发）→ 行为与
 *                        无字段同（controller :185-189 零读取该字段·仍循 V4 同序列 200→404）
 *                        + 键零物化（注入后复查仍无 regenerate* 列/表）+ GAP_PIN 族再钉。
 *
 * fixture 纪律：per-arm 独立 interview/report（RL 桶 report_retry:<id> 按报告分键·臂间零共桶）；
 * 遗留 queued 报告逐臂 parked 出 claim FIFO（沿既有 http proof H1 先例）。
 *
 * EXIT 0 = V1–V6 结构收据 + GAP 钉在卷 = **case registration only**。
 * EXIT0 ≠ covered · ≠ UC-E2E-019 covered · matrix stays partial · coveredCount=8 零翻 ·
 * covered 翻面权归协调方（§0.5 covered 禁填）。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · coveredCount=8 ·
 * PG-retained · actualSpendCny=null · est live=0。
 *
 *   pnpm uc019:nhp-adv:prove                  (isolated; 零模型外呼·零 Key)
 *   pnpm -C apps/api prove:uc019-nhp-adv      (raw; needs isolated DATABASE_URL)
 */
import {
  asPrincipal, reserveEntitlement, releaseConsumption, completeInterviewAndConfirm,
  enqueueReport, claimReport, markReportFailed, sweepReports, getReport,
  MAX_REPORT_ATTEMPTS,
} from '@meetwise/db';
import { boot, mkAssert } from './_neg-harness';

const h = await boot();
const { A, done } = mkAssert('uc019:nhp-adv');

console.log('NHP-019-ADV-01 · UC-E2E-019 ADV 缺列隔离收据 · releaseEvidence=false · Not HA · est live=0');
console.log('NOTE: EXIT0=case registration only · ≠ covered · matrix stays partial · coveredCount=8 零翻');
console.log('NOTE: 对抗臂 V1-V6 · per-arm 独立 fixture（RL 桶按报告分键·臂间零共桶）·零 live key·零模型外呼');

// Minimal privacy-active stub（0058 真链不在 _neg-harness·与既有 http proof 同形 owner-match stub·披露保留）。
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
console.log('PIN   GAP-UC019-PRIVACY-STUB: minimal privacy-active stub（owner-match 形·≠ 0058 fence covered）');

const HDR_A = h.U('userA');
const HDR_B = h.U('userB');
const S = Date.now().toString(36);
const IID = (k: string) => `IV_A019_${k}_${S}`;

async function httpUnits(ownerHdr: Record<string, string>): Promise<number | undefined> {
  const r = await h.req('GET', '/commerce/entitlement', ownerHdr);
  if (r.status !== 200) return undefined;
  const u = r.body?.availableUnits;
  return typeof u === 'number' ? u : undefined;
}

async function consStatus(owner: string, key: string): Promise<string | undefined> {
  return asPrincipal(h.pool, owner, (c) => c.query(
    'SELECT status FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2',
    [owner, key],
  )).then((r) => r.rows[0]?.status as string | undefined);
}

async function reportRows(interviewId: string): Promise<Array<{ status: string; attempts: number }>> {
  const r = await h.pool.query(
    'SELECT status, attempts FROM ai_report WHERE interview_id=$1 ORDER BY created_at',
    [interviewId],
  );
  return r.rows as Array<{ status: string; attempts: number }>;
}

/** 把遗留 queued 报告 parked 出 owner-FIFO claim 面（沿既有 http proof H1 先例·防污染后臂 setup）。 */
async function parkQueued(interviewId: string) {
  await h.pool.query(
    "UPDATE ai_report SET status='ready', content=$2::jsonb, lease_owner=NULL WHERE interview_id=$1 AND owner_user_id='userA' AND status='queued'",
    [interviewId, JSON.stringify({ parkedBy: 'uc019-nhp-adv' })],
  );
}

/**
 * complete+confirm + enqueue + 单发失败 → status=failed（attempts=1）。
 * claimReport owner-FIFO——前臂遗留 queued 兄弟臂 neutralize 出队（沿既有 http proof 同形）。
 */
async function setupFailedReport(owner: string, interviewId: string, leaseOwner: string) {
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')",
    [interviewId, owner],
  );
  await asPrincipal(h.pool, owner, (c) =>
    reserveEntitlement(c, owner, interviewId, 'mock_interview', 1.0));
  await asPrincipal(h.pool, owner, (c) =>
    completeInterviewAndConfirm(c, owner, interviewId));
  await asPrincipal(h.pool, owner, (c) => enqueueReport(c, owner, interviewId));
  let claimed: { reportId: string; interviewId: string; attempts: number; lease: string } | null = null;
  for (let i = 0; i < 32; i++) {
    const lease = `${leaseOwner}-d${i}`;
    const c0 = await asPrincipal(h.pool, owner, (c) => claimReport(c, owner, lease));
    if (!c0) break;
    if (c0.interviewId === interviewId) {
      claimed = { ...c0, lease };
      break;
    }
    await asPrincipal(h.pool, owner, (c) => c.query(
      "UPDATE ai_report SET status='ready', content=$3::jsonb, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$4",
      [c0.reportId, owner, JSON.stringify({ neutralized: true, from: c0.interviewId }), lease],
    ));
  }
  if (!claimed) throw new Error('claimReport_missed_target');
  const ok = await asPrincipal(h.pool, owner, (c) =>
    markReportFailed(c, owner, claimed!.reportId, claimed!.lease, 'uc019_adv_injected_fail'));
  if (!ok) throw new Error('markReportFailed_missed');
}

/** Force poison-pill → quarantined（沿既有 http proof forceQuarantine 同形·H3 同构对照面）。 */
async function forceQuarantine(owner: string, interviewId: string, leaseOwner: string) {
  await asPrincipal(h.pool, owner, (c) => enqueueReport(c, owner, interviewId));
  for (let i = 0; i < MAX_REPORT_ATTEMPTS + 8; i++) {
    const lease = `${leaseOwner}-q${i}`;
    const claimed = await asPrincipal(h.pool, owner, (c) => claimReport(c, owner, lease));
    if (!claimed) break;
    if (claimed.interviewId !== interviewId) {
      await asPrincipal(h.pool, owner, (c) => c.query(
        "UPDATE ai_report SET status='ready', content=$3::jsonb, lease_owner=NULL, version=version+1 WHERE id=$1 AND owner_user_id=$2 AND status='running' AND lease_owner=$4",
        [claimed.reportId, owner, JSON.stringify({ neutralized: true }), lease],
      ));
      continue;
    }
    await asPrincipal(h.pool, owner, (c) =>
      markReportFailed(c, owner, claimed.reportId, lease, 'uc019_adv_poison'));
    await asPrincipal(h.pool, owner, (c) => c.query(
      "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
      [interviewId, owner],
    ));
    await asPrincipal(h.pool, owner, (c) => sweepReports(c, owner));
  }
  return asPrincipal(h.pool, owner, (c) => getReport(c, owner, interviewId));
}

// ── V1 · 未鉴权：无 principal 头 POST report/retry → 401（鉴权守卫链·H4 :293 同族）──
{
  console.log('\n──────── V1 · 未鉴权 POST report/retry → 401 ────────');
  const id = IID('v1');
  const anon = await h.post(`/interview/${id}/report/retry`, {}, {});
  A('V1 无 principal 头 POST report/retry → 401', anon.status === 401);
  A('V1 未鉴权探针零副作用（零 interview/零 report 行）',
    (await reportRows(id)).length === 0);
}

// ── V2 · 跨 owner：他人 principal 对目标 interview retry → 410 GONE（stub 形·guard 先行）──
{
  console.log('\n──────── V2 · 跨 owner retry → 410 GONE interview_privacy_fenced（guardInterviewPrivacyTx :64-73 先于状态 SELECT） ────────');
  const id = IID('v2');
  await setupFailedReport('userA', id, `w-uc019-adv-v2-${S}`);
  A('V2 pre target=failed（owner=userA 视角本可 retry 的目标）',
    (await asPrincipal(h.pool, 'userA', (c) => getReport(c, 'userA', id)))?.status === 'failed');
  A('V2 pre consumption=confirmed', (await consStatus('userA', id)) === 'confirmed');
  const before = await httpUnits(HDR_A);

  const r = await h.post(`/interview/${id}/report/retry`, HDR_B, {});
  A('V2 他人 principal POST retry → 410 GONE（interview 行存在故非 404 not_found_or_forbidden 分支）',
    r.status === 410);
  A('V2 body.error=interview_privacy_fenced（stub 形实测·P0001→GONE 映射）',
    r.body?.error === 'interview_privacy_fenced');
  A('V2 目标报告仍 failed（拒面发生在状态 SELECT 之前·零重排）',
    (await asPrincipal(h.pool, 'userA', (c) => getReport(c, 'userA', id)))?.status === 'failed');
  A('V2 consumption 仍 confirmed·额度不变', (await consStatus('userA', id)) === 'confirmed'
    && (await httpUnits(HDR_A)) === before);
  A('V2 owner 本方 GET report → 200（owner-match stub 形如实披露保留）',
    (await h.req('GET', `/interview/${id}/report`, HDR_A)).status === 200);
}

// ── V3 · 伪造状态：ready/running 报告上 POST retry → 404 no_retriable_report（白名单外一律拒）──
{
  console.log('\n──────── V3 · 伪造状态（ready/running）POST retry → 404 no_retriable_report ────────');
  for (const st of ['ready', 'running'] as const) {
    const id = IID(`v3${st}`);
    await h.pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','completed')",
      [id],
    );
    await asPrincipal(h.pool, 'userA', (c) =>
      reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
    await asPrincipal(h.pool, 'userA', (c) =>
      completeInterviewAndConfirm(c, 'userA', id));
    await h.pool.query(
      "INSERT INTO ai_report(owner_user_id,interview_id,status,content) VALUES ('userA',$1,$2,'{\"adv_forged\":true}')",
      [id, st],
    );
    const before = await httpUnits(HDR_A);
    const r = await h.post(`/interview/${id}/report/retry`, HDR_A, {});
    A(`V3 ${st} 报告 POST retry → 404 no_retriable_report（白名单 ('failed','quarantined') 外一律拒）`,
      r.status === 404 && r.body?.error === 'no_retriable_report');
    A(`V3 ${st} 报告状态零变（拒绝面零副作用·仍 ${st}）`,
      (await reportRows(id))[0]?.status === st);
    A(`V3 ${st} consumption 仍 confirmed·额度不变`, (await consStatus('userA', id)) === 'confirmed'
      && (await httpUnits(HDR_A)) === before);
  }
}

// ── V4 · 连点重放风暴：同一 failed report 五连发真序列 200/404/404/429/429（RL+CAS 承载·恰单行）──
{
  console.log('\n──────── V4 · 连点五连发真序列 200 requeued → 404 → 404 → 429 report_retry_limited → 429 ────────');
  const id = IID('v4');
  await setupFailedReport('userA', id, `w-uc019-adv-v4-${S}`);
  A('V4 pre report=failed·consumption=confirmed',
    (await asPrincipal(h.pool, 'userA', (c) => getReport(c, 'userA', id)))?.status === 'failed'
    && (await consStatus('userA', id)) === 'confirmed');
  const before = await httpUnits(HDR_A);

  // 逐发 await（非并行）——令牌逐发消耗确定性（RL 闸 :778 先于 retryReportById 委托 :780）。
  const p1 = await h.post(`/interview/${id}/report/retry`, HDR_A, {});
  const p2 = await h.post(`/interview/${id}/report/retry`, HDR_A, {});
  const p3 = await h.post(`/interview/${id}/report/retry`, HDR_A, {});
  const p4 = await h.post(`/interview/${id}/report/retry`, HDR_A, {});
  const p5 = await h.post(`/interview/${id}/report/retry`, HDR_A, {});

  A('V4 第 1 发 → 200 requeued:true（failed 在白名单→CAS 离场入 queued）',
    p1.status === 200 && p1.body?.requeued === true);
  A('V4 第 2 发 → 404 no_retriable_report（状态已离场·RL 令牌仍消耗）',
    p2.status === 404 && p2.body?.error === 'no_retriable_report');
  A('V4 第 3 发 → 404（第 3 令牌消耗·capacity=3 耗尽）',
    p3.status === 404 && p3.body?.error === 'no_retriable_report');
  A('V4 第 4 发 → 429 report_retry_limited（capacity 3·refill 3/h 窗内回填可忽略）',
    p4.status === 429 && p4.body?.error === 'report_retry_limited');
  A('V4 第 5 发 → 429（桶空持续拒）',
    p5.status === 429 && p5.body?.error === 'report_retry_limited');
  A('V4 真序列恰等 [200,404,404,429,429]',
    [p1.status, p2.status, p3.status, p4.status, p5.status].join(',') === '200,404,404,429,429');

  const rows = await reportRows(id);
  A('V4 ai_report 恰单行（零重复入队）', rows.length === 1);
  A('V4 终态 queued + attempts=0（全新自动预算重置）',
    rows[0]?.status === 'queued' && rows[0]?.attempts === 0);
  const got = await h.req('GET', `/interview/${id}/report`, HDR_A);
  A('V4 GET report → 200 queued·attempts=0',
    got.status === 200 && got.body?.status === 'queued' && got.body?.attempts === 0);
  A('V4 HTTP 额度不变（regenerate 免费·风暴零扣费）', (await httpUnits(HDR_A)) === before);
  A('V4 consumption 仍 confirmed', (await consStatus('userA', id)) === 'confirmed');
  console.log('NOTE: V4 429≠幂等键——「连点仅一次重生成」现由 RL(3/时/份)+状态 CAS 承载（GAP-UC019-REGEN-IDEM-KEY 现势证据）');
  await parkQueued(id);
}

// ── V5 · quarantined 出口对抗复验（对照臂·H3 同构回归·零替代既有 H3 臂）──
{
  console.log('\n──────── V5 · quarantined → POST retry → 200 requeued:true + attempts=0（对照臂·H3 同构） ────────');
  const id = IID('v5');
  await h.pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','created')",
    [id],
  );
  await asPrincipal(h.pool, 'userA', (c) =>
    reserveEntitlement(c, 'userA', id, 'mock_interview', 1.0));
  await asPrincipal(h.pool, 'userA', (c) =>
    completeInterviewAndConfirm(c, 'userA', id));
  const rel = await asPrincipal(h.pool, 'userA', (c) => releaseConsumption(c, 'userA', id));
  A('V5 pre release on confirmed → already_confirmed（D1）',
    rel.status === 'error' && (rel as { reason?: string }).reason === 'already_confirmed');

  const rep = await forceQuarantine('userA', id, `w-uc019-adv-v5-${S}`);
  A('V5 poison → quarantined', rep?.status === 'quarantined');
  const before = await httpUnits(HDR_A);
  const retry = await h.post(`/interview/${id}/report/retry`, HDR_A, {});
  A('V5 quarantined POST retry → 200 requeued:true（#229 D2 后现势）',
    retry.status === 200 && retry.body?.requeued === true);
  const afterRq = await h.req('GET', `/interview/${id}/report`, HDR_A);
  A('V5 重排重置预算：queued + attempts=0',
    afterRq.status === 200 && afterRq.body?.status === 'queued' && afterRq.body?.attempts === 0);
  A('V5 HTTP 额度不变（报告失败不退·重排零扣费）', (await httpUnits(HDR_A)) === before);
  A('V5 consumption 仍 confirmed', (await consStatus('userA', id)) === 'confirmed');
  console.log('PIN_RETIRED: GAP-UC019-QUARANTINE-REGEN — #229 D2 已决翻转（本臂=既有 http H3 同构对照复验·零替代）');
  await parkQueued(id);
}

// ── V6 · 键缺席诚实钉：information_schema 双查 + 伪造 regenerateAttempt 字段双发半臂（键零物化）──
{
  console.log('\n──────── V6 · 键缺席诚实钉 + 伪造 regenerateAttempt 双发（行为与无字段同·键零物化） ────────');

  const regenColumns = async (): Promise<string[]> => {
    const cols = await h.pool.query<{ columnName: string }>(
      `SELECT column_name AS "columnName" FROM information_schema.columns
        WHERE table_name='ai_report' AND table_schema='public'`,
    );
    return cols.rows.map((r) => r.columnName);
  };
  const regenTables = async (): Promise<string[]> => {
    const t = await h.pool.query<{ tableName: string }>(
      `SELECT table_name AS "tableName" FROM information_schema.tables
        WHERE table_schema='public'`,
    );
    return t.rows.map((r) => r.tableName).filter((n) => /regenerate/i.test(n));
  };

  const names1 = await regenColumns();
  A('V6 查一：ai_report 无 regenerate* 列（G4 :219 / H4 :283 同族互证）',
    !names1.some((n) => /regenerate/i.test(n)));
  A('V6 查一：ai_report 有 status/attempts（现仅 status CAS 代理）',
    names1.includes('status') && names1.includes('attempts'));
  A('V6 查一：零 regenerate* 表', (await regenTables()).length === 0);

  const id = IID('v6');
  await setupFailedReport('userA', id, `w-uc019-adv-v6-${S}`);
  const before = await httpUnits(HDR_A);

  // 半臂：伪造 regenerateAttempt 字段双发——body 一发 + query 一发（两值两注入面·controller :185-189
  // 形参仅 (principal, id)·零读取该字段 → 行为须与无字段 V4 前缀序列同）。
  const f1 = await h.post(`/interview/${id}/report/retry`, HDR_A, { regenerateAttempt: 'adv-forge-1' });
  const f2 = await h.post(`/interview/${id}/report/retry?regenerateAttempt=adv-forge-999`, HDR_A, {});
  A('V6 伪造字段 body 一发 → 200 requeued:true（与无字段同·白名单照常收）',
    f1.status === 200 && f1.body?.requeued === true);
  A('V6 伪造字段 query 一发 → 404 no_retriable_report（与无字段 V4 第 2 发同序列）',
    f2.status === 404 && f2.body?.error === 'no_retriable_report');
  A('V6 双发行为与无字段序列同构（200→404 = V4 前缀）',
    [f1.status, f2.status].join(',') === '200,404');

  const names2 = await regenColumns();
  A('V6 查二（注入后）：仍无 regenerate* 列（键零物化）',
    !names2.some((n) => /regenerate/i.test(n)) && names2.length === names1.length);
  A('V6 查二（注入后）：仍零 regenerate* 表', (await regenTables()).length === 0);
  const rows = await reportRows(id);
  A('V6 ai_report 恰单行 queued（伪造字段零新行零新列零新表）',
    rows.length === 1 && rows[0]?.status === 'queued');
  A('V6 额度不变·consumption confirmed', (await httpUnits(HDR_A)) === before
    && (await consStatus('userA', id)) === 'confirmed');

  console.log('GAP_PIN: GAP-UC019-REGEN-IDEM-KEY — 需求幂等键 (interviewId, regenerateAttempt) 未产品化；伪造字段行为与无字段同·键零物化（information_schema 双查在卷）');
  console.log('GAP_PIN: GAP-UC019-HTTP-REGENERATE — 产品口 POST /interview/:id/report/retry；需求名 /reports/:id/regenerate 未落；未进 full.e2e/UI');
  console.log('GAP_PIN: GAP-UC019-REFUND-FIRST-ORDER — 无 confirmed→released 产品口；A3「退款先赢→regen 拒」不可在现 API 闭环');
}

console.log('\n──────── GAP pins（抬 covered 仍缺·如实再钉）────────');
console.log('PIN   GAP-UC019-ADV-01: 本卷 NHP-019-ADV-01 对抗臂表 V1-V6 落卷=case registration only');
console.log('PIN   GAP-UC019-REGEN-IDEM-KEY: (interviewId, regenerateAttempt) 幂等键未产品化（V4 429≠幂等键·V6 键零物化）');
console.log('PIN   GAP-UC019-HTTP-REGENERATE: 需求名 POST /reports/:id/regenerate 未落（运行时 404）');
console.log('PIN   GAP-UC019-REFUND-FIRST-ORDER: 无 confirmed→released 产品口');
console.log('PIN   GAP-UC019-FULL-E2E / GAP-UC019-DEMAND-PATH: 未进 full.e2e/UI · demand-path 归 ADR/产品裁决面');
// [E2EA-05·assert-strengthen pin] 恒真声明钉：语义=申报入 prove 断言流（非值检查）·删除/弱化=红旗。
A('honesty: ADV prove EXIT=0 = case registration only · ≠ UC-E2E-019 covered · matrix stays partial（GAP pins 已印）', true);

await done();
