/**
 * billing-redesign §3.13 积分明细列表（升 P1 面·LANDING-INDEX 十三节裁决②「双端逐笔可见」）证明：
 * C 端三真账 UNION RLS 直读 + 状态/场景映射钉死 + keyset 值基三段复合游标 + B 端 0185 受控 DEFINER
 * 读函数（payer=principal 硬谓词单跳自证）+ 影子表零引用 + 值基抗删行翻页。
 *
 * 此测试只能由 `scripts/run-e2e-isolated.mjs` 在完整版本化迁移（0001→0185 全链 applied）后运行。
 * 禁止用 `packages/db/sql/` 影子 schema（影子数据库结构）伪造通过。
 * 零模型真实外呼：零假体注入需求（纯读面 fixture 直插）；零生产 DSN/零凭据落盘；零真实扣费。
 *
 * 七臂：
 *   ⓪ 形制臂：0185 函数在位（SECURITY DEFINER·pronargs=0）+ 镜像逐字节同文（0185 ↔ 23 直载比对）
 *      + ACL 断言（GRANT app_role EXECUTE·REVOKE PUBLIC/app_gateway_role）+ 读面零写静态
 *      （ledger.ts/0185/23 镜像块零 INSERT INTO/UPDATE SET/DELETE FROM）。
 *   ① C 端 RLS 直读臂：asPrincipal(owner) 只回本人行（他 owner 预置行零泄漏）+ 逐源引用四元可空
 *      投影逐字段断言（consumption 非 mock 场 interview_id NULL/topic 无 invocation_key/usage topic 可空）。
 *   ② 映射臂：confirmed→settled/partial_confirmed→settled/reserved→reserved(-requested)/released→
 *      released(0)/interview.status='failed' 联结→failed/waived(reason=skipped)→settled 0 值子行/
 *      counted_capped→settled/usage generation_failed→failed（映射表逐值）+ partial 行 unitsRequested
 *      原值透传（settled 差额用户可见）+B 端投影 unitsRequested 同步（真 service 直调）。
 *   ③ B 端 DEFINER 臂：asPrincipal(recruiter) 直调 0185——payer=principal 行可见（跨候选人两行）·
 *      payer≠principal 行零·payer IS NULL 行零·伪造 payer 形参 42883（函数签名零形参+硬谓词双遮蔽）·
 *      approved recruiter 门谓词探针（approved=1/pending=0/candidate=0·生产 SQL 逐字镜像）。
 *   ④ 影子零引用臂：影子计量行在场而 listLedger 响应零影子衍生行（行数恰=三真账种子数）+
 *      静态零 topic_shadow_meter 引用。
 *   ⑤ 分页稳定臂：三段复合游标翻页不重不漏（同 created_at 三源混排·source 段+自然键段全 exercised）·
 *      窗界（200 天行缺省窗不现/365 天窗现）·窗越界/垃圾游标双层（DB 层具名错 fail-closed AND service
 *      包装层 HTTP 400 映射·真 CommerceService 最小 seam 直调）·游标边界行删除后翻页不重不漏（值基抗删行）。
 *   ⑥ 零行为变更负臂：listLedger 双读逐字节一致（纯读幂等）+ 种子行原值未动（读面零写运行时证）
 *      + API 装配静态（service 门序/薄 controller/契约注册）。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  asPrincipal, assertIsolatedTestTarget, createPool, createResumeWithBlob, transitionResume,
  completeIngestion, listLedger,
  type DbPool,
} from '@meetwise/db';
import { ingestResume } from '@meetwise/domain';
import { CommerceService } from '../../../apps/api/src/modules/commerce/commerce.service.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ────────`);

const OWNER_A = `bill4-a-${process.pid}`;
const OWNER_B = `bill4-b-${process.pid}`;
const REC = 'bill4-rec-1';
const REC2 = 'bill4-rec-2';
const PENDING = 'bill4-rec-pending';
const CAND = 'bill4-cand-1';
const RESUME = ['工作经历', '负责网关限流改造，使用 Redis 计数器保护下游。', '技能', 'Redis、限流'].join('\n');

const errCode = (e: unknown): string => (e as { code?: string }).code ?? '';

const root = (f: string) => readFileSync(fileURLToPath(new URL(`../../../${f}`, import.meta.url)), 'utf8');

/** 抽取 0185 语句块（CREATE FUNCTION 起·GRANT EXECUTE 止）——镜像逐字节同文比对载体（entpay-s3 同款）。 */
function extractBlock(src: string): string {
  const m = src.match(/^CREATE OR REPLACE FUNCTION gateway_billing_ledger_payer\(\)[\s\S]*?^GRANT EXECUTE ON FUNCTION gateway_billing_ledger_payer\(\) TO app_role;$/m);
  if (!m) throw new Error('ledger_block_not_found');
  return m[0];
}

/** 生产 approved-recruiter 门谓词探针（逐字镜像 commerce.service APPROVED_RECRUITER_SQL）。 */
const APPROVED_RECRUITER_PROBE =
  "SELECT 1 AS ok FROM user_account WHERE id = current_setting('app.principal_user', true) " +
  "AND role='recruiter' AND status='active' AND approval_status='approved'";

/** 门谓词探针在目标 principal 会话内执行（GUC=该 principal·镜像生产门判定语境）。 */
async function gateProbeRows(c: { query: (sql: string) => Promise<{ rows: unknown[] }> }): Promise<number> {
  const r = await c.query(APPROVED_RECRUITER_PROBE);
  return r.rows.length;
}

/** 翻页取全（窗 365 天·守卫防跑飞）。 */
async function fetchAll(owner: string, windowDays = 365) {
  let cursor: string | null = null;
  const all: Awaited<ReturnType<typeof listLedger>>['entries'] = [];
  for (let i = 0; i < 20; i++) {
    const page = await asPrincipal(pool, owner, (c) => listLedger(c, owner, { cursor, windowDays }));
    all.push(...page.entries);
    if (!page.nextCursor) return { entries: all, windowDays: page.windowDays };
    cursor = page.nextCursor;
  }
  throw new Error('fetch_all_page_guard_exceeded');
}

/** 最小 DbService seam（entpay-s3 同型）：asPrincipal 直连隔离池——真 service 包装层直调载体（RLS/事务边界全真）。 */
const seamDb = {
  asPrincipal: (owner: string, fn: (c: never) => unknown) => asPrincipal(pool, owner, fn as never),
} as never;
const commerce = new CommerceService(seamDb);

/** HttpException 鸭子型解构（status+响应体 error 码）——Ban 跨包 instanceof 单例歧义。 */
const httpErrOf = (e: unknown): { status: number; code: string } => {
  const x = e as { getStatus?: () => number; getResponse?: () => { error?: string } };
  return {
    status: typeof x?.getStatus === 'function' ? x.getStatus() : 0,
    code: x?.getResponse?.()?.error ?? '',
  };
};

async function main() {
  await assertIsolatedTestTarget(pool);

  /* ───────── 播种（RLS 表走 asPrincipal·账号面走裸池=entpay-s3 同形）───────── */
  await pool.query(`INSERT INTO user_account(id,email,password_hash,role,approval_status)
    VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','recruiter','approved'),
           ($5,$6,'x','recruiter','pending'),($7,$8,'x','candidate','approved')
    ON CONFLICT DO NOTHING`,
    [REC, 'b4-rec1@x.com', REC2, 'b4-rec2@x.com', PENDING, 'b4-recp@x.com', CAND, 'b4-cand@x.com']);

  await asPrincipal(pool, OWNER_A, async (c) => {
    const created = await createResumeWithBlob(c, OWNER_A, RESUME);
    await transitionResume(c, OWNER_A, created.resumeId, 'uploaded', 'ingesting');
    await completeIngestion(c, OWNER_A, created.resumeId, ingestResume(RESUME));
  });
  /** 隐私面最小 interview 行（bill3 fixture 同形：resume_id+privacy_epoch 双选子查询）。 */
  async function createInterviewRow(interviewId: string, status: string): Promise<void> {
    await asPrincipal(pool, OWNER_A, (c) => c.query(
      "INSERT INTO interview(id,owner_user_id,status,resume_id,resume_privacy_epoch) VALUES ($1,$2,$3,(SELECT id FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1),(SELECT privacy_epoch FROM resume WHERE owner_user_id=$2 ORDER BY created_at DESC LIMIT 1))",
      [interviewId, OWNER_A, status],
    ));
  }

  // OWNER_A 消费行全家福（映射臂全值）+ payer 面行（B 端臂）。
  await createInterviewRow('b4-iv-done', 'completed');
  await createInterviewRow('b4-iv-fail', 'failed');
  await asPrincipal(pool, OWNER_A, (c) => c.query(`
    INSERT INTO entitlement_consumption(owner_user_id,idempotency_key,service_type,units_requested,units_settled,status,allocations,payer_user_id) VALUES
      ($1,'b4-iv-done','mock_interview',1.0,1.0,'confirmed','[]',NULL),
      ($1,'b4-iv-partial','mock_interview',1.0,0.5,'partial_confirmed','[]',NULL),
      ($1,'b4-iv-resv','mock_interview',1.0,NULL,'reserved','[]',NULL),
      ($1,'b4-iv-rel','mock_interview',1.0,NULL,'released','[]',NULL),
      ($1,'b4-iv-fail','mock_interview',1.0,NULL,'released','[]',NULL),
      ($1,'ocr:a-hash','ocr',1.0,1.0,'confirmed','[]',NULL),
      ($1,'ent-iv-1','mock_interview',1.0,1.0,'confirmed','[]',$2),
      ($1,'own-iv-1','mock_interview',1.0,1.0,'confirmed','[]',NULL),
      ($1,'ent-other','mock_interview',1.0,1.0,'confirmed','[]',$3)`,
    [OWNER_A, REC, REC2]));
  await asPrincipal(pool, OWNER_B, (c) => c.query(`
    INSERT INTO entitlement_consumption(owner_user_id,idempotency_key,service_type,units_requested,units_settled,status,allocations,payer_user_id) VALUES
      ($1,'iv-b-only','ocr',1.0,1.0,'confirmed','[]',NULL),
      ($1,'ent-iv-b','mock_interview',1.0,1.0,'confirmed','[]',$2)`,
    [OWNER_B, REC]));

  // 话题行：counted/counted_capped/waived(skipped) 三值（真账源之二）。
  await asPrincipal(pool, OWNER_A, (c) => c.query(`
    INSERT INTO topic_charge(owner_user_id,interview_id,topic_id,answers,units,status,reason,rule_version) VALUES
      ($1,'b4-iv-done','b4-topic-a',2,0.5,'counted',NULL,'b4-v1'),
      ($1,'b4-iv-done','b4-topic-b',1,0,'counted_capped',NULL,'b4-v1'),
      ($1,'b4-iv-done','b4-topic-skip',0,0,'waived','skipped','b4-v1')`,
    [OWNER_A]));

  // 归集行：generation_failed（failed 承载）+ retrieval 带 topic + 无 topic 行。
  await asPrincipal(pool, OWNER_A, (c) => c.query(`
    INSERT INTO question_usage_ledger(owner_user_id,invocation_key,interview_id,question_id,topic_id,operation_id,cause,usage_source) VALUES
      ($1,'b4-u-fail','b4-iv-done',NULL,NULL,'b4-op-1','generation_failed','not_applicable'),
      ($1,'b4-u-retrieval','b4-iv-done','b4-q1','b4-topic-a','b4-op-2','retrieval','provider'),
      ($1,'b4-u-plan','b4-iv-done',NULL,NULL,'b4-op-3','system_plan','estimate')`,
    [OWNER_A]));
  await asPrincipal(pool, OWNER_B, (c) => c.query(`
    INSERT INTO question_usage_ledger(owner_user_id,invocation_key,interview_id,question_id,topic_id,operation_id,cause,usage_source)
    VALUES ($1,'u-b-only','iv-b-only',NULL,NULL,'b4-op-b','retrieval','provider')`, [OWNER_B]));

  /* ───────── ⓪ 形制臂 ───────── */
  section('⓪ 形制臂：0185 函数/镜像/ACL/读面零写静态');
  const proc = await pool.query<{ prosecdef: boolean; pronargs: number }>(
    "SELECT prosecdef, pronargs::int FROM pg_proc WHERE proname='gateway_billing_ledger_payer'");
  A('⓪-a 0185 函数在位且 SECURITY DEFINER·零形参（伪造 payer 形参面=签名不存在）',
    proc.rows.length === 1 && proc.rows[0].prosecdef && proc.rows[0].pronargs === 0);
  const migSrc = root('packages/db/migrations/0185_gateway_billing_ledger_payer.sql');
  const sql23 = root('packages/db/sql/23_api_gateway.sql');
  A('⓪-b 0185 函数体+ACL 与 23_api_gateway.sql 镜像逐字节同文（0159:17-18 同款承重墙判据）',
    extractBlock(migSrc) === extractBlock(sql23));
  const acl = await pool.query<{ who: string; ok: boolean }>(`
    SELECT 'app_role' AS who, has_function_privilege('app_role','gateway_billing_ledger_payer()','EXECUTE') AS ok
    UNION ALL SELECT 'app_gateway_role', has_function_privilege('app_gateway_role','gateway_billing_ledger_payer()','EXECUTE')
    UNION ALL SELECT 'public', has_function_privilege('public','gateway_billing_ledger_payer()','EXECUTE')`);
  const aclOf = (who: string) => acl.rows.find((r) => r.who === who)?.ok;
  A('⓪-c 0159 形 ACL：GRANT EXECUTE app_role=true·app_gateway_role=false·PUBLIC=false',
    aclOf('app_role') === true && aclOf('app_gateway_role') === false && aclOf('public') === false);
  const ledgerTs = root('packages/db/src/commerce/ledger.ts');
  const mirrorBlock = extractBlock(sql23);
  A('⓪-d 读面零写静态：ledger.ts/0185/23 镜像块零 INSERT INTO·UPDATE SET·DELETE FROM（Ban 挂写端点）',
    [ledgerTs, migSrc, mirrorBlock].every((s) => !/INSERT INTO|UPDATE\s+\w+\s+SET|DELETE FROM/i.test(s.replace(/^--.*$/gm, ''))));

  /* ───────── ① C 端 RLS 直读臂 ───────── */
  section('① C 端 RLS 直读臂：本人行全集+他 owner 零泄漏+逐源引用投影');
  const allA = await fetchAll(OWNER_A);
  const keysA = new Set(allA.entries.map((e) => `${e.source}:${e.idempotencyKey}`));
  A('①-a 他 owner 预置行零泄漏（B 的 consumption/usage 行不在 A 页）',
    !keysA.has('consumption:iv-b-only') && !keysA.has('usage:u-b-only'));
  A('①-b 三真账 UNION 行数恰=本人种子数（consumption 9+topic 3+usage 3）',
    allA.entries.length === 15
    && allA.entries.filter((e) => e.source === 'consumption').length === 9
    && allA.entries.filter((e) => e.source === 'topic').length === 3
    && allA.entries.filter((e) => e.source === 'usage').length === 3);
  const entDone = allA.entries.find((e) => e.source === 'consumption' && e.idempotencyKey === 'b4-iv-done')!;
  const ocrRow = allA.entries.find((e) => e.source === 'consumption' && e.idempotencyKey === 'ocr:a-hash')!;
  const topicRow = allA.entries.find((e) => e.source === 'topic' && e.topicId === 'b4-topic-a')!;
  const usageRow = allA.entries.find((e) => e.source === 'usage' && e.invocationKey === 'b4-u-retrieval')!;
  const usageNoTopic = allA.entries.find((e) => e.invocationKey === 'b4-u-fail')!;
  A('①-c consumption 行投影：mock_interview interview_id=幂等键·topic_id/invocation_key 无列恒 NULL',
    entDone.interviewId === 'b4-iv-done' && entDone.topicId === null && entDone.invocationKey === null);
  A('①-d consumption 非 mock 场 interview_id NULL（ocr 幂等键=ocr:<imgHash>·场 id 投影不越 service）',
    ocrRow.interviewId === null && ocrRow.scene === 'ocr');
  A('①-e topic 行投影：interview_id/topic_id 直读·invocation_key 无列 NULL·幂等键=自然键 interview:topic',
    topicRow !== undefined && topicRow.interviewId === 'b4-iv-done' && topicRow.invocationKey === null
    && topicRow.idempotencyKey === 'b4-iv-done:b4-topic-a');
  A('①-f usage 行投影：interview_id NOT NULL·topic_id 可空（retrieval 带/generation_failed 不带）·幂等键=invocation_key',
    usageRow.interviewId === 'b4-iv-done' && usageRow.topicId === 'b4-topic-a'
    && usageNoTopic.topicId === null && usageRow.idempotencyKey === 'b4-u-retrieval');
  A('①-g 场景枚举四活直透+粒度自标（mock_interview/ocr/topic/usage）',
    entDone.scene === 'mock_interview' && ocrRow.scene === 'ocr'
    && topicRow.scene === 'topic' && usageRow.scene === 'usage');
  let mismatch: string = '';
  try {
    await asPrincipal(pool, OWNER_A, (c) => listLedger(c, 'someone-else'));
  } catch (e) { mismatch = errCode(e); }
  A('①-h principal 语境断言：owner 形参错配即拒（availableUnits 同款·availableUnits 调用方护栏）',
    mismatch === 'principal_owner_mismatch');

  /* ───────── ② 映射臂 ───────── */
  section('② 映射臂：状态映射表逐值（写死落值·Ban 临场造词）');
  const byKey = (s: string, k: string) => allA.entries.find((e) => e.source === s && e.idempotencyKey === k)!;
  A('②-a confirmed→settled·数额=-units_settled', byKey('consumption', 'b4-iv-done').status === 'settled' && byKey('consumption', 'b4-iv-done').amountUnits === -1);
  A('②-b partial_confirmed→settled·数额=-0.5 结算差额', byKey('consumption', 'b4-iv-partial').status === 'settled' && byKey('consumption', 'b4-iv-partial').amountUnits === -0.5);
  A('②-c reserved→reserved·数额=-units_requested（在持）', byKey('consumption', 'b4-iv-resv').status === 'reserved' && byKey('consumption', 'b4-iv-resv').amountUnits === -1);
  A('②-d released（正常场退回）→released·数额 0（已回·逐笔不给推导余额）', byKey('consumption', 'b4-iv-rel').status === 'released' && byKey('consumption', 'b4-iv-rel').amountUnits === 0);
  A('②-e released+interview.status=failed 联结→failed（唯一表联结语义·failed 标注承载）', byKey('consumption', 'b4-iv-fail').status === 'failed');
  A('②-f topic counted→settled·数额=-units', topicRow.status === 'settled' && topicRow.amountUnits === -0.5);
  A('②-g topic waived(reason=skipped)→settled 0 值子行·细值 reason 明示（跳过明细可见）',
    byKey('topic', 'b4-iv-done:b4-topic-skip').status === 'settled'
    && byKey('topic', 'b4-iv-done:b4-topic-skip').amountUnits === 0
    && byKey('topic', 'b4-iv-done:b4-topic-skip').topicStatus === 'waived'
    && byKey('topic', 'b4-iv-done:b4-topic-skip').reason === 'skipped');
  A('②-h topic counted_capped→settled·0 值子行（0172 ck：非 counted 态 units 恒 0）·topicStatus 细值原样',
    byKey('topic', 'b4-iv-done:b4-topic-b').status === 'settled'
    && byKey('topic', 'b4-iv-done:b4-topic-b').topicStatus === 'counted_capped'
    && byKey('topic', 'b4-iv-done:b4-topic-b').amountUnits === 0);
  A('②-i usage generation_failed→failed（cause 为 failed 字面承载）·0 值审计行',
    usageNoTopic.status === 'failed' && usageNoTopic.amountUnits === 0 && usageNoTopic.cause === 'generation_failed');
  A('②-j usage retrieval→settled 0 值审计行（cause 子标注原样）', usageRow.status === 'settled' && usageRow.cause === 'retrieval');
  // post-errata：partial_confirmed→settled 的 settled 差额用户可见——unitsRequested additive 透传原值。
  const partialRow = byKey('consumption', 'b4-iv-partial');
  const entSvcPage = await commerce.listEnterpriseLedger(REC);
  const entSvcRow = entSvcPage.entries.find((r: Record<string, unknown>) => r.idempotency_key === 'ent-iv-1') as Record<string, unknown> | undefined;
  A('②-k partial settled 差额可见+B 端投影同步：C 端 partial 行 unitsRequested=units_requested 原值×amountUnits=-settled（requested−settled 用户可见）·confirmed 行原值同透·topic/usage 无列 NULL·B 端真 service 直调 unitsRequested 同值在册',
    partialRow.unitsRequested === 1 && partialRow.amountUnits === -0.5
    && entDone.unitsRequested === 1
    && topicRow.unitsRequested === null && usageRow.unitsRequested === null
    && entSvcRow !== undefined && Number(entSvcRow.unitsRequested) === 1 && Number(entSvcRow.units_settled) === 1);

  /* ───────── ③ B 端 DEFINER 臂 ───────── */
  section('③ B 端 DEFINER 臂：payer=principal 硬谓词单跳自证');
  const recRows = await asPrincipal(pool, REC, (c) => c.query(
    'SELECT created_at, service_type, units_requested::float8 AS units_requested, units_settled::float8 AS units_settled, status, payer_user_id, idempotency_key FROM gateway_billing_ledger_payer()'));
  const recKeys = recRows.rows.map((r: Record<string, unknown>) => String(r.idempotency_key)).sort();
  A('③-a payer=principal 行可见（跨候选人 owner A+B 各一行·0157 形状甲授权链）',
    JSON.stringify(recKeys) === JSON.stringify(['ent-iv-1', 'ent-iv-b']));
  A('③-b payer≠principal 行零泄漏（REC2 行·伪造巡读面被硬谓词遮蔽）', !recKeys.includes('ent-other'));
  A('③-c payer IS NULL（C 端本人行）零泄漏', !recKeys.includes('own-iv-1'));
  A('③-d 投影钉死七列（零 allocations/lease_expires_at 内部面）',
    recRows.rows.every((r: Record<string, unknown>) =>
      !('allocations' in r) && !('lease_expires_at' in r)
      && r.payer_user_id === REC && r.status === 'confirmed' && r.service_type === 'mock_interview'
      && Number(r.units_settled) === 1));
  let forged = '';
  try {
    await asPrincipal(pool, REC, (c) => c.query('SELECT * FROM gateway_billing_ledger_payer($1)', ['ent-other']));
  } catch (e) { forged = errCode(e); }
  A('③-e 伪造 payer 形参=42883（签名零形参·入参伪造入口被遮蔽）', forged === '42883');
  const gateApproved = await asPrincipal(pool, REC, gateProbeRows);
  const gatePending = await asPrincipal(pool, PENDING, gateProbeRows);
  const gateCand = await asPrincipal(pool, CAND, gateProbeRows);
  A('③-f approved recruiter 门谓词探针（生产 SQL 逐字镜像）：approved=1/pending=0/candidate=0（fail-closed）',
    gateApproved === 1 && gatePending === 0 && gateCand === 0);
  const svc = root('apps/api/src/modules/commerce/commerce.service.ts');
  const entMethod = svc.slice(svc.indexOf('async listEnterpriseLedger'));
  A('③-g API 装配静态：listEnterpriseLedger 先 requireApprovedRecruiter 门后 0185 函数调用（listMyOfflineOrders 母形同序）',
    entMethod.indexOf('await this.requireApprovedRecruiter(principal)') >= 0
    && entMethod.indexOf('gateway_billing_ledger_payer()') > entMethod.indexOf('await this.requireApprovedRecruiter(principal)'));

  /* ───────── ④ 影子零引用臂 ───────── */
  section('④ 影子零引用臂：读真账不读影子');
  await asPrincipal(pool, OWNER_A, (c) => c.query(
    "INSERT INTO topic_shadow_meter(owner_user_id,interview_id,row_kind,topic_id,idem_key,status,meter_version) VALUES ($1,'b4-iv-done','topic','b4-shadow-t','b4-shadow-t','counted','shadow-v1')",
    [OWNER_A]));
  const allA2 = await fetchAll(OWNER_A);
  A('④-a 影子行在场而 ledger 响应零影子衍生行（行数仍恰 15·idem_key 不现）',
    allA2.entries.length === 15 && !allA2.entries.some((e) => e.idempotencyKey.includes('b4-shadow-t')));
  A('④-b 静态零 topic_shadow_meter 引用（ledger.ts/0185/23 镜像块·影子表零引用铁律）',
    [ledgerTs, migSrc, mirrorBlock].every((s) => !s.includes('topic_shadow_meter')));

  /* ───────── ⑤ 分页稳定臂 ───────── */
  section('⑤ 分页稳定臂：三段复合游标不重不漏+窗界+值基抗删行');
  // 63 行同一事务同时戳（now() 事务时间戳同值）：60 连号 usage（自然键段 exercised）+三源混排
  // （source 段 exercised）·created_at=now()+1h 使该块在全序头部、与既有种子时序无关。
  await asPrincipal(pool, OWNER_A, async (c) => {
    await c.query(`
      INSERT INTO question_usage_ledger(owner_user_id,invocation_key,interview_id,topic_id,operation_id,cause,usage_source,created_at)
      SELECT $1, 'bill4-pg-' || lpad(g::text, 3, '0'), 'b4-pg-iv', NULL, 'b4-pg-op', 'retrieval', 'provider', now() + interval '1 hour'
        FROM generate_series(0, 59) AS g`, [OWNER_A]);
    await c.query(
      "INSERT INTO entitlement_consumption(owner_user_id,idempotency_key,service_type,units_requested,units_settled,status,allocations,created_at) VALUES ($1,'b4-mix-c','ocr',1.0,1.0,'confirmed','[]',now()+interval '1 hour')",
      [OWNER_A]);
    await c.query(
      "INSERT INTO topic_charge(owner_user_id,interview_id,topic_id,answers,units,status,rule_version,created_at) VALUES ($1,'b4-mix-i','b4-mix-t',1,0.5,'counted','b4-v1',now()+interval '1 hour')",
      [OWNER_A]);
    await c.query(
      "INSERT INTO question_usage_ledger(owner_user_id,invocation_key,interview_id,topic_id,operation_id,cause,usage_source,created_at) VALUES ($1,'b4-mix-u','b4-mix-i',NULL,'b4-mix-op','system_plan','estimate',now()+interval '1 hour')",
      [OWNER_A]);
  });
  const p1 = await asPrincipal(pool, OWNER_A, (c) => listLedger(c, OWNER_A, { windowDays: 365 }));
  A('⑤-a 单页宽=50（commerce 列表窗先例同宽）·同时戳块内全序：自然键字节 DESC 连号（b4-mix-* 字节序沉底·usage 段 61 行满 50）',
    p1.entries.length === 50 && p1.entries[0].idempotencyKey === 'bill4-pg-059'
    && p1.entries[49].idempotencyKey === 'bill4-pg-010');
  A('⑤-b nextCursor 回显自洽（三段载荷 source=natural_key 双段在场·窗回显 365）',
    p1.nextCursor !== null
    && (() => { const p = JSON.parse(Buffer.from(p1.nextCursor!, 'base64url').toString('utf8')); return p.s === 'usage' && p.k === 'bill4-pg-010'; })()
    && p1.windowDays === 365);
  const p2 = await asPrincipal(pool, OWNER_A, (c) => listLedger(c, OWNER_A, { cursor: p1.nextCursor, windowDays: 365 }));
  const p1Keys = p1.entries.map((e) => `${e.source}:${e.idempotencyKey}`);
  const p2Keys = p2.entries.map((e) => `${e.source}:${e.idempotencyKey}`);
  A('⑤-c 翻页不重（page1∩page2=∅）', p1Keys.every((k) => !p2Keys.includes(k)));
  A('⑤-d 翻页不漏（两页并集=78 行全集·末页 nextCursor=NULL）',
    new Set([...p1Keys, ...p2Keys]).size === 78 && p2.nextCursor === null && p2.entries.length === 28);
  const mixAll = [...p1.entries, ...p2.entries];
  const mu = mixAll.findIndex((e) => e.idempotencyKey === 'b4-mix-u');
  const mt = mixAll.findIndex((e) => e.idempotencyKey === 'b4-mix-i:b4-mix-t');
  const mc = mixAll.findIndex((e) => e.idempotencyKey === 'b4-mix-c');
  A('⑤-e 同 created_at 跨 source 段定序：usage→topic→consumption（DESC 判别式）', mu >= 0 && mt >= 0 && mc >= 0 && mu < mt && mt < mc);
  // 窗界：200 天行缺省窗（90 天）不现·365 天窗现。
  await asPrincipal(pool, OWNER_A, (c) => c.query(
    "INSERT INTO entitlement_consumption(owner_user_id,idempotency_key,service_type,units_requested,units_settled,status,allocations,created_at) VALUES ($1,'b4-old-200d','ocr',1.0,1.0,'confirmed','[]',now()-interval '200 days')",
    [OWNER_A]));
  const winDefault = await fetchAll(OWNER_A, 90);
  const win365 = await fetchAll(OWNER_A, 365);
  A('⑤-f 时间窗界：200 天行缺省 90 天窗不现/365 天窗现（默认窗 90 落值）',
    !winDefault.entries.some((e) => e.idempotencyKey === 'b4-old-200d')
    && win365.entries.some((e) => e.idempotencyKey === 'b4-old-200d') && winDefault.windowDays === 90);
  let winErr = ''; let curErr = '';
  try { await asPrincipal(pool, OWNER_A, (c) => listLedger(c, OWNER_A, { windowDays: 366 })); } catch (e) { winErr = errCode(e); }
  try { await asPrincipal(pool, OWNER_A, (c) => listLedger(c, OWNER_A, { cursor: 'garbage-cursor' })); } catch (e) { curErr = errCode(e); }
  A('⑤-g 窗越界/垃圾游标 fail-closed（ledger_window_invalid/ledger_cursor_invalid·诚实 4xx 不吞）',
    winErr === 'ledger_window_invalid' && curErr === 'ledger_cursor_invalid');
  // 值基抗删行：删除游标边界行（bill4-pg-011）及同页后继 010..007 → 持原游标续翻页仍不重不漏。
  // 0171 只授 SELECT,INSERT（撤 DELETE）→ fixture 删行走裸池（隔离容器 runtime owner·非读面行为）。
  await pool.query(
    "DELETE FROM question_usage_ledger WHERE owner_user_id=$1 AND invocation_key IN ('bill4-pg-010','bill4-pg-009','bill4-pg-008','bill4-pg-007','bill4-pg-006')",
    [OWNER_A]);
  const p2after = await asPrincipal(pool, OWNER_A, (c) => listLedger(c, OWNER_A, { cursor: p1.nextCursor, windowDays: 365 }));
  const p2afterPg = p2after.entries.filter((e) => e.idempotencyKey.startsWith('bill4-pg-')).map((e) => e.idempotencyKey);
  A('⑤-h 删行（含游标边界行）后翻页不重不漏：续页恰=bill4-pg-005..000 值基续读（零偏移漂移·删行不位移）+同戳块尾部 b4-mix 行照常捞回',
    JSON.stringify(p2afterPg) === JSON.stringify(['bill4-pg-005', 'bill4-pg-004', 'bill4-pg-003', 'bill4-pg-002', 'bill4-pg-001', 'bill4-pg-000'])
    && p2afterPg.every((k) => !p1Keys.includes(`usage:${k}`))
    && ['b4-mix-u', 'b4-mix-i:b4-mix-t', 'b4-mix-c', 'b4-old-200d'].every((k) => p2after.entries.some((e) => e.idempotencyKey === k))
    && p2after.nextCursor === null);
  const afterDelete = await fetchAll(OWNER_A, 365);
  const afterPg = afterDelete.entries.filter((e) => e.idempotencyKey.startsWith('bill4-pg-'));
  A('⑤-i 值基翻页并集守恒：删后全翻页=74 存活行零重零漏（15 原+55 连号+3 mix+1 窗外界行）·连号块恰余 55 行',
    afterDelete.entries.length === 74
    && new Set(afterDelete.entries.map((e) => `${e.source}:${e.idempotencyKey}`)).size === 74
    && afterPg.length === 55);
  // post-errata 双层（与 ⑤-g DB 层 fail-closed 成 AND）：AllExceptionsFilter 只透传 HttpException，
  // plain Error 冒泡即 500——真 service 包装层直调（最小 seam·零 HTTP 面）断言映射 400 同码。
  let httpCur = { status: 0, code: '' };
  let httpWin = { status: 0, code: '' };
  try { await commerce.listMyLedger(OWNER_A, { cursor: 'garbage-cursor' }); } catch (e) { httpCur = httpErrOf(e); }
  try { await commerce.listMyLedger(OWNER_A, { windowDays: 366 }); } catch (e) { httpWin = httpErrOf(e); }
  A('⑤-j HTTP 层 400 映射（与 ⑤-g DB 层 fail-closed 双层）：垃圾游标/窗越界经 service 包装层→HttpException 400 同码（ledger_cursor_invalid/ledger_window_invalid·用户得 400 不再落 500）',
    httpCur.status === 400 && httpCur.code === 'ledger_cursor_invalid'
    && httpWin.status === 400 && httpWin.code === 'ledger_window_invalid');

  /* ───────── ⑥ 零行为变更负臂 ───────── */
  section('⑥ 零行为变更负臂：纯读幂等+种子原值+API 装配静态');
  const refA = await fetchAll(OWNER_A, 365);
  const againA = await fetchAll(OWNER_A, 365);
  A('⑥-a listLedger 双读逐字节一致（纯读幂等·读面零副作用运行时证）',
    JSON.stringify(refA.entries) === JSON.stringify(againA.entries));
  const raw = await asPrincipal(pool, OWNER_A, (c) => c.query(
    'SELECT status,units_settled FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2', [OWNER_A, 'b4-iv-done']));
  A('⑥-b 种子行原值未动（status/units_settled 原值·读列表零写）',
    raw.rows[0].status === 'confirmed' && Number(raw.rows[0].units_settled) === 1);
  const ctrl = root('apps/api/src/modules/commerce/billing-ledger.controller.ts');
  A('⑥-c API 装配静态：@Controller(billing)+GET ledger+PrincipalGuard（薄适配层·commerce.controller 零触）',
    ctrl.includes("@Controller('billing')") && ctrl.includes("@Get('ledger')")
    && ctrl.includes('@UseGuards(PrincipalGuard)'));
  A('⑥-d API 装配静态：listMyLedger 同事务同拍读余额（读时快照非实时余额承诺·分页头口径）',
    svc.slice(svc.indexOf('async listMyLedger')).includes('availableUnits(c, principal)'));
  A('⑥-e 契约注册静态：/billing/ledger 与 /billing/ledger/enterprise 入 apiContract（openapi additive）',
    root('packages/contracts/src/index.ts').includes("path: '/billing/ledger'")
    && root('packages/contracts/src/index.ts').includes("path: '/billing/ledger/enterprise'"));

  console.log(`\n${failures === 0 ? '✓ bill4-ledger-list 全部通过' : `✗ ${failures} 失败`}`);
  await pool.end();
  if (failures > 0) process.exitCode = 1;
}

main().catch(async (error) => {
  console.error(error);
  await pool.end().catch(() => undefined);
  process.exitCode = 1;
});
