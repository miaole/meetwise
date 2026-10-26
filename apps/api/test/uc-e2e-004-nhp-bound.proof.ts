/**
 * uc-e2e-004-nhp-bound.proof.ts — NHP-004-BOUND-01 · career-path begin 台账面边界隔离 prove
 * (NHP 批 B · 覆盖矩阵 §1.0.1 行 4 UC-E2E-004 BOUND 列 · REQUEST=ai-docs/delivery/harness/nhp-batch-b-REQUEST.md)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - nhp-batch-b-REQUEST.md §1.4 行 4（§9-rev.1 修正句一收缩后）：NHP-004-BOUND-01（begin 台账边界隔离 prove）。
 *  - 机制面（真实代码，断言即据此）：
 *    apps/api/src/modules/interview/interview.service.ts generateCareerPath(:827-892)：
 *      tx1 pre-tx 守卫（privacy 404 → 409 assessment_required → 409 insufficient_evidence·零写）
 *      tx2 ledger.begin(:850-868)：guardInterviewPrivacy → 事务级 advisory 锁
 *          pg_advisory_xact_lock(hashtext('career-path'),hashtext(principal:id))（:853·并发 begin 串行化）
 *          → latest 行 FOR UPDATE → 无行 INSERT version=1 lease=now()+120s（:860-862）|
 *          有行接管 UPDATE status='active',version=version+1,lease 刷新 now()+120s（:863-866）
 *      tx3 commitSuccess(:869-881)：career_path upsert + active→succeeded version+1（fence）+ lease 清空
 *      tx4 markFailed(:882-887)：active→failed version+1 + lease 清空
 *    packages/db/migrations/0001_baseline.sql:36-37 uq_active_run partial UNIQUE(graph_name,thread_id)
 *      WHERE status IN ('created','active','waiting_user','migrating','paused') ⇒ 单 active 行=DB 侧硬约束。
 *
 * 边界族（本 prove 断言面 · 与 UC-001 BOUND 202 alreadyBegun 形明确区分）：
 *  B1 重复 begin = 接管（同一 run 行 version 递增），非 UC-001 式 202 {accepted,jobId,alreadyBegun}
 *     ——POST 恒 200 全量 body（controller :237-238 @HttpCode(OK)），version 每 成功一轮 +2（begin+commit）。
 *  B2 advisory 锁串行化：测试侧持同键 pg_advisory_xact_lock → HTTP begin 阻塞于 tx2（无行落库）→
 *     释放后放行完成（对照 uc004-fault 先例 BEGIN→持锁→放行形）。
 *  B3 单 active 行：全程 ai_graph_run(career-path,thread) 恰 1 行 · active 行数恒 ≤1（uq_active_run）·
 *     并发 4 路 begin 风暴全 200 零 5xx 零 uq_active_run 冲突，末态单行 version=8 status=succeeded。
 *  B4 lease 120s 刷新：career_path 表锁驻停 tx3（BEGIN;LOCK TABLE 先例形）→ 观察已提交 active 行
 *     lease_owner 非 NULL ∧ lease_expires_at ∈ (now()+100s, now()+130s)（钉 120s 常量量级）；
 *     接管二轮同法再驻停 → lease 重新 ≈ now()+120s（刷新）∧ version 已递增；放行后 lease 清空。
 *
 * 隔离：scripts/run-e2e-isolated.mjs 三层壳（root uc004:nhp-bound:prove → :raw → apps/api
 * prove:uc004-nhp-bound）· 随机容器+动态端口 · _neg-harness boot() 进程内真栈+sql/ 链+privacy 镜像 ·
 * 零 live 模型（boot() 内剥 provider key，本文件零 provider 词面）· est live=0。
 * EXIT 契约：EXIT 0 ⇔ B1-B4 全绿；任一红 → EXIT 1 诚实保留（attempts 台账 · Ban retry-to-green）。
 * EXIT0 = case 证据 ≠ covered ≠ 翻行；BOUND 列 gap→case-only 措辞登记，coveredCount=8 不动。
 */
import { boot } from './_neg-harness';

const CMD = 'pnpm uc004:nhp-bound:prove';
const STAMP = Date.now().toString(36).toUpperCase();
const IV_B = `IV_B4BND_${STAMP}`;   // 主边界线程
const OWNER = 'userA';

let total = 0;
const failures: string[] = [];
const A = (name: string, cond: boolean, detail?: string) => {
  total++;
  if (!cond) { failures.push(name); console.log(`FAIL  ${name}${detail ? ` :: ${detail}` : ''}`); }
  else console.log(`PASS  ${name}`);
};

type RunRow = { runId: string; status: string; version: number; leaseOwner: string | null; leaseExpiresAt: string | null };

(async () => {
  const h = await boot();
  const pool = h.pool;

  const runRow = async (thread: string): Promise<RunRow | null> =>
    (await pool.query(
      `SELECT run_id::text AS "runId", status, version, lease_owner AS "leaseOwner", lease_expires_at::text AS "leaseExpiresAt"
         FROM ai_graph_run WHERE graph_name='career-path' AND thread_id=$1`,
      [thread],
    )).rows[0] ?? null;
  const runCount = async (thread: string): Promise<number> =>
    Number((await pool.query(
      `SELECT count(*)::int n FROM ai_graph_run WHERE graph_name='career-path' AND thread_id=$1`,
      [thread],
    )).rows[0].n);
  const careerPathCount = async (thread: string): Promise<number> =>
    Number((await pool.query(
      'SELECT count(*)::int n FROM career_path WHERE interview_id=$1', [thread],
    )).rows[0].n);
  const secondsUntil = (ts: string | null): number | null =>
    ts === null ? null : Math.round((new Date(ts).getTime() - Date.now()) / 1000);

  type Json = Record<string, unknown>;
  const post = async (thread: string): Promise<{ status: number; body: Json }> => {
    const r = await h.post(`/interview/${thread}/career-path`, h.U(OWNER), {});
    return { status: r.status, body: r.body as Json };
  };

  console.log('NHP-004-BOUND-01 career-path begin 台账面边界隔离 prove · releaseEvidence=false · Not HA');
  console.log(`CMD=${CMD}`);
  console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · BOUND 列 gap→case-only 措辞登记 · coveredCount=8 不动 · Ban retry-to-green');

  // 种子（特权 pool 直插 BYPASS RLS；0059 投影 fence 触发器在迁移链——sql/ 链无此触发器，
  // 但按 uc004-fault 先例同设 GUC 保证两形种子口径一致）。
  {
    const c = await pool.connect();
    try {
      await c.query(`SELECT set_config('app.principal_user','${OWNER}',false)`);
      const dims = JSON.stringify([
        { dimension: '分布式锁', score: 40, gap: true, evidence: [] },
        { dimension: '消息队列', score: 35, gap: true, evidence: [] },
      ]);
      await c.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'${OWNER}','completed') ON CONFLICT DO NOTHING`, [IV_B]);
      await c.query(
        `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions,overall)
         VALUES ($1,'${OWNER}',$2,'ready',$3::jsonb,60) ON CONFLICT DO NOTHING`,
        [`AR_${IV_B}`, IV_B, dims]);
    } finally { c.release(); }
  }

  // ══ B1 · 重复 begin = 接管 version 递增（非 UC-001 式 202 alreadyBegun）══
  {
    const r1 = await post(IV_B);
    A('B1 首次 POST career-path → 200 全量 body（readiness 非空串+milestones 数组）',
      r1.status === 200 && r1.body && typeof r1.body.readiness === 'string' && r1.body.readiness.length > 0
      && Array.isArray(r1.body.milestones) && r1.body.milestones.length > 0,
      `status=${r1.status} body=${JSON.stringify(r1.body).slice(0, 160)}`);
    const first = await runRow(IV_B);
    A('B1 首轮落库: 单行 version=2 status=succeeded（begin v1 + commitSuccess v2）',
      first !== null && first.version === 2 && first.status === 'succeeded',
      `row=${JSON.stringify(first)}`);
    A('B1 首轮 lease 清空（终态让位 uq_active_run 重试槽）',
      first !== null && first.leaseOwner === null && first.leaseExpiresAt === null);

    const r2 = await post(IV_B);
    const second = await runRow(IV_B);
    A('B1 重复 begin 非 202 alreadyBegun: 200 全量 body（无 accepted/jobId/alreadyBegun 键）',
      r2.status === 200 && r2.body && typeof r2.body.readiness === 'string' && r2.body.readiness.length > 0
      && r2.body.accepted === undefined && r2.body.jobId === undefined && r2.body.alreadyBegun === undefined,
      `status=${r2.status} body=${JSON.stringify(r2.body).slice(0, 160)}`);
    A('B1 重复 begin = 接管同一 run 行（run_id 恒等 · 单行 · version 2→4）',
      second !== null && first !== null && second.runId === first.runId
      && (await runCount(IV_B)) === 1 && second.version === 4 && second.status === 'succeeded',
      `row=${JSON.stringify(second)}`);
    A('B1 career_path 投影恰 1 行（upsert 不增生）', (await careerPathCount(IV_B)) === 1);
  }

  // ══ B2 · advisory 锁串行化：持锁 → begin 阻塞于 tx2 零落库 → 释放放行 ══
  {
    const lock = await pool.connect();
    let released = false;
    try {
      await lock.query('BEGIN');
      await lock.query('SELECT pg_advisory_xact_lock(hashtext($1),hashtext($2))', ['career-path', `${OWNER}:${IV_B}`]);
      const pending = post(IV_B);
      let settled = false;
      pending.then(() => { settled = true; }, () => { settled = true; });
      await new Promise((r) => setTimeout(r, 1200));
      A('B2 持 advisory 锁期间 HTTP begin 阻塞（未放行）', settled === false);
      A('B2 阻塞面=tx2 锁前置: 观察窗内零新行（ledger 写在锁后）', (await runCount(IV_B)) === 1,
        `runCount=${await runCount(IV_B)}`);
      await lock.query('ROLLBACK');
      released = true;
      const r = await pending;
      A('B2 释放后放行 → 200 完成（串行化非死锁）',
        r.status === 200 && r.body && typeof r.body.readiness === 'string' && Array.isArray(r.body.milestones),
        `status=${r.status}`);
      const after = await runRow(IV_B);
      A('B2 放行后单行接管 version=6 status=succeeded', after !== null && after.version === 6 && after.status === 'succeeded',
        `row=${JSON.stringify(after)}`);
    } finally {
      if (!released) await lock.query('ROLLBACK').catch(() => undefined);
      lock.release();
    }
  }

  // ══ B3 · 并发 begin 风暴：单 active 行硬约束 + 全 200 零 5xx + version 单调递增 ══
  //   期望形注记：并发下 commitSuccess fence（interview.service.ts:876「被并发接管时 0 行=不越权
  //   改别人的 run」设计内语义）可令个别 tx3 零增——version 单调无回退、每 begin 至少 +1、
  //   恰一轮 tx3 胜出落 succeeded；严格 +2N 非机制保证（发明期望=Ban）。单行+无冲突为硬断言。
  {
    const before = await runRow(IV_B);
    const storm = await Promise.all(Array.from({ length: 4 }, () => post(IV_B)));
    A('B3 并发 4 路 begin 全 200 零 5xx（全量 career path body）',
      storm.every((r) => r.status === 200 && r.body && typeof r.body.readiness === 'string'),
      `statuses=${storm.map((r) => r.status).join(',')}`);
    const after = await runRow(IV_B);
    A('B3 风暴后仍单行（uq_active_run 无冲突无分裂）', (await runCount(IV_B)) === 1,
      `runCount=${await runCount(IV_B)}`);
    A('B3 version 单调递增有界（before+8 ≥ after ≥ before+4 · 每 begin ≥+1 · 零回退）',
      before !== null && after !== null && after.version > before.version
      && after.version >= before.version + 4 && after.version <= before.version + 8,
      `before=${before?.version} after=${after?.version}`);
    A('B3 末态恰一轮 commitSuccess 胜出: 单行 status=succeeded ∧ lease 清空（fence 设计内收敛）',
      after !== null && after.status === 'succeeded' && after.leaseOwner === null && after.leaseExpiresAt === null);
  }

  // ══ B4 · lease 120s 刷新：career_path 表锁驻停 tx3 → 观察已提交 active 行 lease ══
  {
    // 第一轮:驻停 tx3 → active 行 lease ≈ now()+120s
    const lock = await pool.connect();
    let committed = false;
    try {
      await lock.query('BEGIN');
      await lock.query('LOCK TABLE career_path IN ACCESS EXCLUSIVE MODE');
      const pending = post(IV_B);
      const t0 = Date.now();
      let observed: RunRow | null = null;
      for (let i = 0; i < 80 && observed === null; i++) {
        await new Promise((r) => setTimeout(r, 100));
        const row = await runRow(IV_B);
        if (row !== null && row.status === 'active' && row.leaseOwner !== null) observed = row;
      }
      const waitMs = Date.now() - t0;
      A('B4 驻停窗内观察到 committed active 行（lease_owner 非 NULL）', observed !== null,
        `waitMs=${waitMs} row=${JSON.stringify(observed)}`);
      const secs = observed === null ? null : secondsUntil(observed.leaseExpiresAt);
      A('B4 lease 量级钉 120s: lease_expires_at ∈ (now()+100s, now()+130s)',
        secs !== null && secs > 100 && secs < 130, `secondsUntil=${secs}`);
      A('B4 驻停期间版本=接管递增（≥8）且 status=active',
        observed !== null && observed.version >= 8 && observed.status === 'active',
        `version=${observed?.version}`);
      await lock.query('COMMIT');
      committed = true;
      const r = await pending;
      A('B4 放行 → 200 完成', r.status === 200);
      const done = await runRow(IV_B);
      A('B4 完成后 lease 清空（succeeded · lease_owner/expires NULL）',
        done !== null && done.status === 'succeeded' && done.leaseOwner === null && done.leaseExpiresAt === null,
        `row=${JSON.stringify(done)}`);
    } finally {
      if (!committed) await lock.query('COMMIT').catch(() => undefined);
      lock.release();
    }

    // 第二轮接管:同法再驻停 → lease 重新 ≈ now()+120s（刷新）∧ version 再递增
    const lock2 = await pool.connect();
    let committed2 = false;
    try {
      const before2 = await runRow(IV_B);
      await lock2.query('BEGIN');
      await lock2.query('LOCK TABLE career_path IN ACCESS EXCLUSIVE MODE');
      const pending2 = post(IV_B);
      let observed2: RunRow | null = null;
      for (let i = 0; i < 80 && observed2 === null; i++) {
        await new Promise((r) => setTimeout(r, 100));
        const row = await runRow(IV_B);
        if (row !== null && row.status === 'active' && row.leaseOwner !== null) observed2 = row;
      }
      const secs2 = observed2 === null ? null : secondsUntil(observed2.leaseExpiresAt);
      A('B4 接管轮 lease 刷新: 再次 ∈ (now()+100s, now()+130s)',
        secs2 !== null && secs2 > 100 && secs2 < 130, `secondsUntil=${secs2}`);
      A('B4 接管轮同 run 行 version 再递增（before+1 起 active）',
        before2 !== null && observed2 !== null && observed2.runId === before2.runId
        && observed2.version === before2.version + 1,
        `before=${before2?.version} observed=${observed2?.version}`);
      await lock2.query('COMMIT');
      committed2 = true;
      const r2 = await pending2;
      const after2 = await runRow(IV_B);
      A('B4 接管轮完成: 200 ∧ 单行 version=前值+2 · succeeded · lease 清空',
        r2.status === 200 && (await runCount(IV_B)) === 1
        && after2 !== null && before2 !== null && after2.version === before2.version + 2
        && after2.status === 'succeeded' && after2.leaseOwner === null && after2.leaseExpiresAt === null,
        `row=${JSON.stringify(after2)}`);
    } finally {
      if (!committed2) await lock2.query('COMMIT').catch(() => undefined);
      lock2.release();
    }
  }

  // ── EXIT 裁决 ──
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  console.log('HONESTY: EXIT0 = NHP-004-BOUND-01 case 证据 · ≠ covered ≠ BOUND 翻 covered/partial 升格 · coveredCount=8 不动');
  console.log('HONESTY: 隔离库真 PG ≠ 生产容量 · 本 prove 零 PERF/LOAD 宣称 · est live=0（零模型外呼零 Key 加载）');
  if (failures.length > 0) {
    console.log(`\nNHP-004-BOUND-01 — 诚实保留 gap（EXIT 1 · 非 flake · Ban invent fix）:`);
    for (const f of failures) console.log(`  GAP-ITEM assertion="${f}"`);
    console.log('  依据: interview.service.ts:827-892 generateCareerPath ledger 链 · 0001_baseline.sql:36-37 uq_active_run');
    process.exit(1);
  }
  console.log(`\nEXIT=0 — NHP-004-BOUND-01 begin 台账面边界族（B1 接管/B2 advisory 锁/B3 单 active 行风暴/B4 lease 120s 刷新）全绿（${total} 条）。`);
  process.exit(0);
})().catch((e) => {
  console.error('NHP-004-BOUND-01 harness 崩溃（EXIT 1 · 记入 attempts 台账 · 非 flake）:', e);
  process.exit(1);
});
