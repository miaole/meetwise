/**
 * REPORT-RETRY prove · #229 报告重试刀 D2 五件（db 层 · eval-first · packages/db）。
 *
 * REQUEST: ai-docs/delivery/harness/report-retry-REQUEST.md @9d381aaf rev2 · mw-retry229-exec
 *
 *   P1 注入故障自动重试至 ready：fail×2（退避 next_attempt_at 断言）→ sweep 重排 → 第 3 次 good → ready；
 *      全程 availableUnits / consumption=confirmed 逐位不变（§4-①）。
 *   P2 持续故障 3 次 → quarantined（db sweep 面）；手动 requeueFailedReport 解锁 → attempts=0/next_attempt_at=NULL
 *      （#229 D2② 新语义·全新 3 次自动预算）→ good → ready（§4-② db 腿）。
 *   P3 零扣费断言：P2 全链 + 手动重试×3 轮：额度恒定、consumption 恒 confirmed、无 released、无新 consumption 行；
 *      静态门：重试链路四文件（interview-report/report/report-worker/actions）reserve/confirm/release 非测试调用=0；
 *      自动重试防回归锚钉：MAX_REPORT_ATTEMPTS=3 + 2^attempts 退避 + sweepReports SQL 原样（§1.① 静态锚钉）（§4-③）。
 *   P4 存量重排：fixture 直插 attempts≥3 quarantined 存量行 → 同一手动出口 requeue → ready；
 *      ledger snapshot byte-identical（除 ai_report 行自身）·零补偿面（§4-⑥）。
 *
 * NO MODEL_API_KEY · NO HTTP/UI e2e（HTTP 腿+频控+web 契约面 → report-retry-http.proof.ts）。
 * releaseEvidence=false · Not HA · 本绿 ≠ 全链路 E2E covered · ≠ UC-E2E-011/019 covered
 *
 *   pnpm report-retry:prove
 *   pnpm -C packages/db prove:report-retry
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertIsolatedTestTarget, createPool, asPrincipal,
  reserveEntitlement, availableUnits, completeInterviewAndConfirm,
  enqueueReport, claimReport, markReportReady, markReportFailed, sweepReports, getReport,
  requeueFailedReport, MAX_REPORT_ATTEMPTS,
} from '../src/index.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
function readRepo(rel: string): string {
  const p = resolve(repoRoot, rel);
  if (!existsSync(p)) throw new Error(`missing ${rel}`);
  return readFileSync(p, 'utf8');
}

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const S = Date.now().toString(36);
const OWN = (k: string) => `rr229-${k}-${S}`;
const IID = (k: string) => `iv-rr229-${k}-${S}`;

async function seed(owner: string, units = 5.0) {
  await pool.query(
    "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',$2, now()+interval '300 days')",
    [owner, units],
  );
}

/** complete+confirm + enqueue（付费基座：报告 job 在 confirmed 账本上重试，零新增扣费口）。 */
async function setupConfirmedWithReport(owner: string, interviewId: string) {
  await pool.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
    [interviewId, owner],
  );
  await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, interviewId, 'mock_interview', 1.0));
  await asPrincipal(pool, owner, (c) => completeInterviewAndConfirm(c, owner, interviewId));
  const enq = await asPrincipal(pool, owner, (c) => enqueueReport(c, owner, interviewId));
  return enq.reportId;
}

async function units(owner: string) {
  return asPrincipal(pool, owner, (c) => availableUnits(c, owner));
}

async function consRows(owner: string) {
  return asPrincipal(pool, owner, (c) => c.query(
    'SELECT idempotency_key, status, units_requested::text AS ur FROM entitlement_consumption WHERE owner_user_id=$1 ORDER BY idempotency_key',
    [owner],
  )).then((r) => JSON.stringify(r.rows));
}

async function bucketRows(owner: string) {
  return pool.query(
    'SELECT id::text, kind, units_total::text, units_reserved::text, units_consumed::text, version FROM entitlement_bucket WHERE owner_user_id=$1 ORDER BY id',
    [owner],
  ).then((r) => JSON.stringify(r.rows));
}

/** 手动 claim+fail 一轮（db API 同形 uc011 forceQuarantine；backdoorBypassBackoff=把退避窗拉到过去）。 */
async function failOnce(owner: string, leaseOwner: string) {
  const claimed = await asPrincipal(pool, owner, (c) => claimReport(c, owner, leaseOwner));
  if (!claimed) return null;
  await asPrincipal(pool, owner, (c) =>
    markReportFailed(c, owner, claimed.reportId, leaseOwner, 'rr229_injected_fail'));
  return claimed;
}

async function bypassBackoff(owner: string, interviewId: string) {
  await asPrincipal(pool, owner, (c) => c.query(
    "UPDATE ai_report SET next_attempt_at = now() - interval '1 second' WHERE interview_id=$1 AND owner_user_id=$2 AND status='failed'",
    [interviewId, owner],
  ));
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log('REPORT-RETRY (#229 D2) db prove · releaseEvidence=false · Not HA');
  console.log('NOTE: 本绿≠全链路 E2E covered；integration/static only；≠ UC-E2E-011/019 covered');
  console.log('NOTE: D2 — 失败可重试、重试不重复扣费、不退款；手动重排给全新 3 次自动预算 + 3 次/小时/份频控（API 层）');

  // ══ P1 · 注入故障自动重试至 ready（§4-①·sweepReports 保留件行使+零扣费逐位）══
  section('P1 · fail×2 → sweep 重排 → 第 3 次 good → ready（退避断言 + 零扣费逐位）');
  {
    const owner = OWN('p1'), id = IID('p1');
    await seed(owner, 5.0);
    await setupConfirmedWithReport(owner, id);
    const unitsBase = await units(owner);
    A('P1 pre 额度=4（confirm 后）', unitsBase === 4.0);
    const consBase = await consRows(owner);

    const f1 = await failOnce(owner, `w-p1-${S}`);
    A('P1 第 1 次 claim+fail（attempts=1）', f1?.attempts === 1);
    const rep1 = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A('P1 failed + 退避 next_attempt_at 在未来（2^attempts 指数退避行使）',
      rep1?.status === 'failed' && (await pool.query(
        "SELECT (next_attempt_at > now()) AS f FROM ai_report WHERE interview_id=$1 AND owner_user_id=$2", [id, owner],
      )).rows[0].f === true);
    await bypassBackoff(owner, id);
    const sw1 = await asPrincipal(pool, owner, (c) => sweepReports(c, owner));
    A('P1 sweep 重排（requeued=1·未超上限）', sw1.requeued === 1);

    const f2 = await failOnce(owner, `w-p1-${S}`);
    A('P1 第 2 次 claim+fail（attempts=2）', f2?.attempts === 2);
    await bypassBackoff(owner, id);
    const sw2 = await asPrincipal(pool, owner, (c) => sweepReports(c, owner));
    A('P1 sweep 二次重排', sw2.requeued === 1);

    const c3 = await asPrincipal(pool, owner, (c) => claimReport(c, owner, `w-p1-${S}`));
    await asPrincipal(pool, owner, (c) =>
      markReportReady(c, owner, c3!.reportId, `w-p1-${S}`, { overall: 70, sections: [{ title: 't', body: 'auto-retry to ready' }] }));
    const rep3 = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A('P1 第 3 次 good → ready（自动重试至就绪·MAX_REPORT_ATTEMPTS 预算内）', rep3?.status === 'ready');

    A('P1 零扣费逐位：额度恒 4.0', (await units(owner)) === unitsBase);
    A('P1 零扣费逐位：consumption 行 byte-identical（无 released/无新行）', (await consRows(owner)) === consBase);
  }

  // ══ P2 · 持续故障 3 次 quarantined + 手动重排解锁（§4-② db 腿·#229 D2② 新语义）══
  section('P2 · poison×3 → quarantined → 手动 requeueFailedReport 解锁（attempts=0）→ good → ready');
  {
    const owner = OWN('p2'), id = IID('p2');
    await seed(owner, 5.0);
    await setupConfirmedWithReport(owner, id);
    const unitsBase = await units(owner);
    const consBase = await consRows(owner);

    for (let i = 0; i < MAX_REPORT_ATTEMPTS; i++) {
      await failOnce(owner, `w-p2-${S}`);
      await bypassBackoff(owner, id);
      await asPrincipal(pool, owner, (c) => sweepReports(c, owner));
    }
    const rep = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A(`P2 poison×3 → quarantined（attempts=${MAX_REPORT_ATTEMPTS} 达上限隔离）`,
      rep?.status === 'quarantined' && rep?.attempts === MAX_REPORT_ATTEMPTS);

    // 旧语义：quarantined 不可 requeue（#229 D2 已决翻转·旧诚实钉 见 git blame）——现在解锁+重置预算。
    const rid = (await pool.query('SELECT id FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, id])).rows[0].id as string;
    const rq = await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, rid));
    A('P2 手动 requeueFailedReport(quarantined) → true（#229 D2 翻转旧钉 · 旧语义 见 git blame）', rq === true);
    const rep2 = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A('P2 重排重置预算：queued + attempts=0', rep2?.status === 'queued' && rep2?.attempts === 0);
    const na = (await pool.query('SELECT next_attempt_at FROM ai_report WHERE id=$1', [rid])).rows[0].next_attempt_at;
    A('P2 重排清退避：next_attempt_at=NULL（sweep 不被旧退避窗卡住）', na === null);

    const c2 = await asPrincipal(pool, owner, (c) => claimReport(c, owner, `w-p2-good-${S}`));
    A('P2 解锁后 claim 可领（attempts 0→1 全新预算起步）', c2?.attempts === 1);
    await asPrincipal(pool, owner, (c) =>
      markReportReady(c, owner, c2!.reportId, `w-p2-good-${S}`, { overall: 72, sections: [{ title: 't', body: 'manual unlock to ready' }] }));
    A('P2 解锁后 good → ready', (await asPrincipal(pool, owner, (c) => getReport(c, owner, id)))?.status === 'ready');

    A('P2 零扣费逐位：额度恒定', (await units(owner)) === unitsBase);
    A('P2 零扣费逐位：consumption byte-identical', (await consRows(owner)) === consBase);
  }

  // ══ P3 · 手动重试×3 轮零扣费 + 静态门 + 自动重试防回归锚钉（§4-③）══
  section('P3 · 手动重试×3 轮零扣费 + 四文件 reserve/confirm/release=0 静态门 + sweep 防回归锚钉');
  {
    const owner = OWN('p3'), id = IID('p3');
    await seed(owner, 5.0);
    await setupConfirmedWithReport(owner, id);
    const unitsBase = await units(owner);
    const consBase = await consRows(owner);
    const bucketBase = await bucketRows(owner);

    // 每轮：手动 requeue（200 语义）→ 再打回 failed（模拟模型继续故障）→ 预算重置断言 → ×3。
    for (let round = 1; round <= 3; round++) {
      await failOnce(owner, `w-p3-r${round}-${S}`);          // 先到 failed（可重试态）
      await bypassBackoff(owner, id);
      await asPrincipal(pool, owner, (c) => sweepReports(c, owner)); // 或走 sweep 到 queued 均可重试——此处统一打回 failed 保证下一轮 requeue 有对象
      const st = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
      if (st?.status === 'queued') {
        const c1 = await asPrincipal(pool, owner, (c) => claimReport(c, owner, `w-p3-fail-${round}-${S}`));
        await asPrincipal(pool, owner, (c) => markReportFailed(c, owner, c1!.reportId, `w-p3-fail-${round}-${S}`, 'rr229_round_fail'));
      }
      const rid = (await pool.query('SELECT id FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, id])).rows[0].id as string;
      const rq = await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, rid));
      const after = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
      A(`P3 手动重试第 ${round} 轮：requeue true + queued + attempts=0（全新自动预算）`,
        rq === true && after?.status === 'queued' && after?.attempts === 0);
      A(`P3 第 ${round} 轮零扣费：额度恒定 + consumption byte-identical`,
        (await units(owner)) === unitsBase && (await consRows(owner)) === consBase);
    }
    A('P3 三轮后 bucket 行 byte-identical（无预支/无回补抖动）', (await bucketRows(owner)) === bucketBase);

    // 静态门：重试链路四文件对 reserve/confirm/release 非测试调用=0（§1.③a）。
    const chainFiles = [
      'apps/api/src/modules/interview/interview-report.ts',
      'packages/db/src/report.ts',
      'apps/worker/src/report-worker.ts',
      'apps/web/app/report/[id]/actions.ts',
    ];
    for (const f of chainFiles) {
      const src = readRepo(f);
      const hits = src.match(/\b(reserveEntitlement|confirmConsumption|releaseConsumption)\b/g) ?? [];
      A(`P3 静态门 ${f}：reserve/confirm/release 调用=0（重试零扣费的地基=账本规则已在不触处）`, hits.length === 0);
    }

    // 自动重试防回归静态锚钉（§1.①：sweepReports 语义/参数/SQL 本刀零改——钉住防后续刀无声改动）。
    const reportDb = readRepo('packages/db/src/report.ts');
    const worker = readRepo('apps/worker/src/report-worker.ts');
    A('P3 锚钉 MAX_REPORT_ATTEMPTS=3 导出（自动重试上限原值）',
      /export const MAX_REPORT_ATTEMPTS = 3;/.test(reportDb));
    A('P3 锚钉 2^attempts 指数退避封顶 300（markReportFailed 原式）',
      /least\(power\(2, attempts\)::int, 300\)/.test(reportDb));
    A('P3 锚钉 sweepReports 超限隔离 SQL 原样（attempts >= $2 → quarantined）',
      /attempts >= \$2/.test(reportDb) && /status='quarantined', lease_owner=NULL/.test(reportDb));
    A('P3 锚钉 sweep 到期重排 SQL 原样（退避未到不重排）',
      /next_attempt_at IS NULL OR next_attempt_at <= now\(\)/.test(reportDb));
    A('P3 锚钉 worker sweepReportsOnce 终态事件 report_unavailable(max_attempts_exceeded) 原样',
      /'report_unavailable'/.test(worker) && /max_attempts_exceeded/.test(worker));
    A('P3 锚钉 worker 常驻调度 dispatchTick/runReportDispatcher 原样',
      /export async function dispatchTick\(/.test(worker) && /export function runReportDispatcher\(/.test(worker));
    A('P3 锚钉 API 层频控常量钉死（REPORT_RETRY_RL 3/时/份·S12 待追认可调）',
      /REPORT_RETRY_RL = \{ capacity: 3, refillPerSec: 3 \/ 3600 \}/.test(readRepo('apps/api/src/modules/interview/interview.service.ts')));
  }

  // ══ P4 · 存量 quarantined 重排零补偿（§4-⑥·fixture 直插存量行）══
  section('P4 · 存量 attempts≥3 quarantined 存量行 → 同一手动出口 → ready（ledger byte-identical 零补偿）');
  {
    const owner = OWN('p4'), id = IID('p4');
    await seed(owner, 5.0);
    // 存量行 fixture：不走 drain 链，直接 INSERT 一条"历史遗留"quarantined 行（attempts 已耗尽）。
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')",
      [id, owner],
    );
    await asPrincipal(pool, owner, (c) => reserveEntitlement(c, owner, id, 'mock_interview', 1.0));
    await asPrincipal(pool, owner, (c) => completeInterviewAndConfirm(c, owner, id));
    await asPrincipal(pool, owner, (c) => c.query(
      "INSERT INTO ai_report(owner_user_id,interview_id,status,attempts,last_error) VALUES ($1,$2,'quarantined',3,'legacy_stock_row')",
      [owner, id],
    ));
    const unitsBase = await units(owner);
    const consBase = await consRows(owner);
    const bucketBase = await bucketRows(owner);

    const rid = (await pool.query('SELECT id FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, id])).rows[0].id as string;
    const rq = await asPrincipal(pool, owner, (c) => requeueFailedReport(c, owner, rid));
    A('P4 存量 quarantined 手动出口 requeue → true（零特殊路径·同一 requeueFailedReport）', rq === true);
    const rep = await asPrincipal(pool, owner, (c) => getReport(c, owner, id));
    A('P4 存量行重排后 queued + attempts=0', rep?.status === 'queued' && rep?.attempts === 0);

    const c1 = await asPrincipal(pool, owner, (c) => claimReport(c, owner, `w-p4-${S}`));
    await asPrincipal(pool, owner, (c) =>
      markReportReady(c, owner, c1!.reportId, `w-p4-${S}`, { overall: 66, sections: [{ title: 't', body: 'legacy stock to ready' }] }));
    A('P4 存量重排 → good → ready（#40 接线后可生成）',
      (await asPrincipal(pool, owner, (c) => getReport(c, owner, id)))?.status === 'ready');

    // 零补偿面：ledger snapshot byte-identical（消费行+桶行；唯一允许变化=ai_report 行自身）。
    A('P4 零补偿：额度恒 4.0（不退款）', (await units(owner)) === unitsBase);
    A('P4 零补偿：consumption byte-identical', (await consRows(owner)) === consBase);
    A('P4 零补偿：bucket byte-identical', (await bucketRows(owner)) === bucketBase);
    A('P4 零补偿：consumption 行数仍恰 1 且 confirmed', JSON.parse(consBase).length === 1 && JSON.parse(consBase)[0].status === 'confirmed');
  }

  console.log(`\n${fail === 0
    ? '✓ REPORT-RETRY (#229 D2) db prove passed (partial ladder; ≠ covered; HTTP/频控/web 契约面 → report-retry-http.proof.ts)'
    : `✗ ${fail} REPORT-RETRY asserts failed`}`);
  console.log('NOTE: est live=0 · Ban live model · 零扣费承诺地基=完成时 confirm 一次（uc011 R2/R3 账本边界原样不改）');
  await pool.end();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
