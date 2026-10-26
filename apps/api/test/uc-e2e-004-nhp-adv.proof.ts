/**
 * uc-e2e-004-nhp-adv.proof.ts — NHP-004-ADV-01 · career-path 对抗注入面隔离 prove
 * (NHP 批 B · 覆盖矩阵 §1.0.1 行 4 UC-E2E-004 ADV 列 · REQUEST=ai-docs/delivery/harness/nhp-batch-b-REQUEST.md)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - nhp-batch-b-REQUEST.md §1.4 行 4（§9-rev.1 修正句一收缩后）：NHP-004-ADV-01（伪造/越权 POST +
 *    fail seam 对抗·沿 Line T 缝形）；§9-rev.4 同律：把「设计内语义」误判为机制红 = Ban 误停。
 *  - 机制面（真实代码，断言即据此）：
 *    interview.service.ts :52-55 careerPathFailSeamThreadId——thread-scoped fail-only 注入缝，
 *      NODE_ENV=production 恒关（:53 先于 env 读）·未设/空=零行为差。
 *    :845-846 seam 生效点在 pre-tx 双 409 守卫之后、仅替换图 dep（selectCareerPathDerive 精确匹配
 *      threadId 才换抛错 dep·packages/ai-graphs/src/career-path.ts:48-52）。
 *    tx1 pre-tx（:829-843）: privacy 404 → 无评估行 409 assessment_required → overall 不可信
 *      409 insufficient_evidence（scoring-honesty.ts:140-148 isInsufficientEvidence(null)=true）。
 *    生效链: derive 抛 career_path_graph_injected_failure → runCareerPathGraph catch →
 *      ledger.markFailed（:882-887 UPDATE active→failed version=version+1 lease 清空）→ 原错 rethrow
 *      → AllExceptionsFilter → 500 internal_error。
 *
 * 对抗族（本 prove 断言面）：
 *  A1 优先级: 无评估 + seam 同设 → 409 assessment_required 先行（seam 未生效——生效点在 pre-tx 后）
 *     ∧ ai_graph_run 零行（tx1 零写·seam 未触图）。
 *  A2 优先级: 评估在而 overall=NULL(不可信) + seam 同设 → 409 insufficient_evidence 先行 ∧ 零图行。
 *  A3 有效 pre + seam 精确同设 → 500 internal_error ∧ ai_graph_run 恰 1 行 status=failed ∧
 *     version≥2（begin v1 + markFailed +1）∧ lease 清空 ∧ career_path 零行；in-fault 重试 →
 *     同行接管 version 再 +2（failed v4）——failed 终态行让位重试槽（uq_active_run 谓词不含 failed）。
 *  A4 seam thread-scoped: seam 指向他线程 → 本线程零影响照常 200（fail-only 精确匹配）。
 *  A5 production-off: 静态钉 interview.service.ts:53「NODE_ENV===production 恒关」在树 + 图层
 *     selectCareerPathDerive(id, undefined, derive) === derive（同引用=零行为差）+ 本 prove 运行面
 *     （非 production）env 未设臂全绿互证。
 *  A6 越权 POST: 他人 principal 对他人面试 POST career-path → 404（privacy 先于评估/seam）∧ 零副作用。
 *     （§9-rev.6: 与 uc004-draft 臂 6 同族越权拒绝面——只作同族旁证只读引用·Ban 借此 wash 任何列值。）
 *
 * 隔离：run-e2e-isolated 三层壳（uc004:nhp-adv:prove → :raw → prove:uc004-nhp-adv）· 随机容器+动态端口 ·
 * boot() 进程内真栈 · seam 经本进程 env 设/删（请求时读·逐臂切换·零产品码触）· 零 live 模型
 * （boot() 内剥 provider key·本文件零 provider 词面）· est live=0。
 * EXIT 契约：EXIT 0 ⇔ A1-A6 全绿；任一红 → EXIT 1 诚实保留（attempts 台账 · Ban retry-to-green）。
 * EXIT0 = case 证据 ≠ covered ≠ 翻行；ADV 列 blind→case-only 措辞登记，coveredCount=8 不动。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { selectCareerPathDerive, CAREER_PATH_INJECTED_FAILURE } from '@meetwise/ai-graphs';
import { deriveCareerPath } from '@meetwise/domain';
import { boot } from './_neg-harness';

const CMD = 'pnpm uc004:nhp-adv:prove';
const SEAM_ENV_KEY = 'MEETWISE_CAREER_PATH_FAIL_THREAD_ID';
const STAMP = Date.now().toString(36).toUpperCase();
const IV_ADV = `IV_B4ADV_${STAMP}`;      // 主对抗线程（无评估）
const IV_UNS = `IV_B4UNSTR_${STAMP}`;    // overall=NULL 线程
const IV_HIT = `IV_B4HIT_${STAMP}`;      // seam 命中线程（有效 pre）
const IV_CTL = `IV_B4CTL_${STAMP}`;      // seam 未设对照线程（有效 pre）
const IV_OFF = `IV_B4SCOP_${STAMP}`;     // seam 指向他线程的 scope 对照线程
const IV_OTH = `IV_B4OTH_${STAMP}`;      // userB 的面试（越权面）
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
  delete process.env[SEAM_ENV_KEY];   // 基线:缝未设(零行为差)——逐臂再设

  const graphRuns = async (thread: string): Promise<RunRow[]> =>
    (await pool.query(
      `SELECT run_id::text AS "runId", status, version, lease_owner AS "leaseOwner", lease_expires_at::text AS "leaseExpiresAt"
         FROM ai_graph_run WHERE graph_name='career-path' AND thread_id=$1 ORDER BY version`,
      [thread],
    )).rows;
  const careerPathCount = async (thread: string): Promise<number> =>
    Number((await pool.query('SELECT count(*)::int n FROM career_path WHERE interview_id=$1', [thread])).rows[0].n);

  type Json = Record<string, unknown>;
  const post = async (thread: string, uid = OWNER): Promise<{ status: number; body: Json }> => {
    const r = await h.post(`/interview/${thread}/career-path`, h.U(uid), {});
    return { status: r.status, body: r.body as Json };
  };

  console.log('NHP-004-ADV-01 career-path 对抗注入面隔离 prove · releaseEvidence=false · Not HA');
  console.log(`CMD=${CMD}`);
  console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · ADV 列 blind→case-only 措辞登记 · coveredCount=8 不动 · Ban retry-to-green');
  console.log(`NOTE: seam 键=${SEAM_ENV_KEY}（production 恒关·请求时读·本 prove 逐臂设/删·零产品码触）`);

  // 种子（特权 pool 直插 BYPASS RLS；GUC 同设沿 uc004-fault 先例形）
  {
    const c = await pool.connect();
    try {
      await c.query(`SELECT set_config('app.principal_user','${OWNER}',false)`);
      const dims = JSON.stringify([
        { dimension: '分布式锁', score: 40, gap: true, evidence: [] },
        { dimension: '消息队列', score: 35, gap: true, evidence: [] },
      ]);
      await c.query(
        `INSERT INTO interview(id,owner_user_id,status) VALUES
           ($1,'${OWNER}','completed'),($2,'${OWNER}','completed'),($3,'${OWNER}','completed'),
           ($4,'${OWNER}','completed'),($5,'${OWNER}','completed') ON CONFLICT DO NOTHING`,
        [IV_ADV, IV_UNS, IV_HIT, IV_CTL, IV_OFF]);
      await c.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userB','completed') ON CONFLICT DO NOTHING`, [IV_OTH]);
      // IV_UNS/IV_HIT/IV_CTL/IV_OFF: 评估在;IV_UNS overall=NULL(不可信) 其余 60(可信)
      for (const [iv, overall] of [[IV_UNS, null], [IV_HIT, 60], [IV_CTL, 60], [IV_OFF, 60]] as const) {
        await c.query(
          `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions,overall)
           VALUES ($1,'${OWNER}',$2,'ready',$3::jsonb,$4) ON CONFLICT DO NOTHING`,
          [`AR_${iv}`, iv, dims, overall]);
      }
    } finally { c.release(); }
  }

  // ══ A1 · 优先级: 无评估 + seam 同设 → 409 assessment_required 先行（seam 未生效·零图行）══
  {
    process.env[SEAM_ENV_KEY] = IV_ADV;
    const r = await post(IV_ADV);
    A('A1 无评估 + seam 同设 → 409 assessment_required 先行（非 500 非 seam 错）',
      r.status === 409 && r.body?.error === 'assessment_required',
      `status=${r.status} body=${JSON.stringify(r.body).slice(0, 120)}`);
    A('A1 seam 生效点在 pre-tx 后: ai_graph_run 零行（tx1 零写·seam 未触图）',
      (await graphRuns(IV_ADV)).length === 0,
      `rows=${JSON.stringify(await graphRuns(IV_ADV))}`);
    delete process.env[SEAM_ENV_KEY];
  }

  // ══ A2 · 优先级: overall 不可信 + seam 同设 → 409 insufficient_evidence 先行 ══
  {
    process.env[SEAM_ENV_KEY] = IV_UNS;
    const r = await post(IV_UNS);
    A('A2 overall=NULL + seam 同设 → 409 insufficient_evidence 先行（信任门先于 seam）',
      r.status === 409 && r.body?.error === 'insufficient_evidence',
      `status=${r.status} body=${JSON.stringify(r.body).slice(0, 120)}`);
    A('A2 零图行（信任门同样在 pre-tx 零写面）', (await graphRuns(IV_UNS)).length === 0);
    delete process.env[SEAM_ENV_KEY];
  }

  // ══ A3 · 有效 pre + seam 精确同设 → 500 internal_error + failed version≥2 ══
  {
    process.env[SEAM_ENV_KEY] = IV_HIT;
    const r = await post(IV_HIT);
    A('A3 有效 pre + seam 同设 → 500 internal_error（markFailed 后原错 rethrow）',
      r.status === 500 && r.body?.error === 'internal_error',
      `status=${r.status} body=${JSON.stringify(r.body).slice(0, 120)}`);
    const rows = await graphRuns(IV_HIT);
    A('A3 图行: 恰 1 行 status=failed', rows.length === 1 && rows[0]?.status === 'failed',
      `rows=${JSON.stringify(rows)}`);
    A('A3 version≥2（begin v1 + markFailed +1）∧ lease 清空',
      rows[0] !== undefined && rows[0].version >= 2 && rows[0].leaseOwner === null && rows[0].leaseExpiresAt === null,
      `row=${JSON.stringify(rows[0])}`);
    A('A3 career_path 投影零行（失败不落业务面）', (await careerPathCount(IV_HIT)) === 0);
    // in-fault 重试: 同行接管 version 再 +2 → failed（终态 failed 不占 uq_active_run 槽）
    const vBefore = rows[0]?.version ?? 0;
    const r2 = await post(IV_HIT);
    const rows2 = await graphRuns(IV_HIT);
    A('A3 in-fault 重试 → 仍 500（fail-only 缝确定性）', r2.status === 500 && r2.body?.error === 'internal_error');
    A('A3 重试=同行接管: 仍单行 failed ∧ version 再 +2（≥v+2）',
      rows2.length === 1 && rows2[0]?.runId === rows[0]?.runId
      && rows2[0]?.status === 'failed' && rows2[0]?.version === vBefore + 2,
      `rows=${JSON.stringify(rows2)}`);
    delete process.env[SEAM_ENV_KEY];
  }

  // ══ A4 · seam thread-scoped: 指向他线程 → 本线程零影响 ══
  {
    process.env[SEAM_ENV_KEY] = IV_HIT;   // 缝仍指 A3 线程
    const r = await post(IV_OFF);
    A('A4 seam 指向他线程: 本线程照常 200 全量 body（fail-only 精确匹配）',
      r.status === 200 && r.body && typeof r.body.readiness === 'string' && Array.isArray(r.body.milestones),
      `status=${r.status}`);
    const rows = await graphRuns(IV_OFF);
    A('A4 本线程图行 succeeded（未受缝波及）', rows.length === 1 && rows[0]?.status === 'succeeded',
      `rows=${JSON.stringify(rows)}`);
    delete process.env[SEAM_ENV_KEY];
  }

  // ══ A5 · production-off: 静态钉 + 图层同引用 + env 未设臂 ══
  {
    const svcSrc = readFileSync(fileURLToPath(new URL('../src/modules/interview/interview.service.ts', import.meta.url)), 'utf8');
    const seamIdx = svcSrc.indexOf('function careerPathFailSeamThreadId');
    const gateIdx = svcSrc.indexOf("process.env.NODE_ENV === 'production'", seamIdx);
    const envIdx = svcSrc.indexOf(SEAM_ENV_KEY, seamIdx);
    A('A5 静态钉: careerPathFailSeamThreadId 内 production 恒关分支在 env 读之前（:52-55 缝形）',
      seamIdx >= 0 && gateIdx > seamIdx && envIdx > gateIdx,
      `seamIdx=${seamIdx} gateIdx=${gateIdx} envIdx=${envIdx}`);
    // 图层: failThreadId undefined（production 缝读返回形）→ 原 dep 同一引用=零行为差
    A('A5 selectCareerPathDerive(id, undefined, derive) === derive（同引用零行为差）',
      selectCareerPathDerive(IV_CTL, undefined, deriveCareerPath) === deriveCareerPath);
    // 运行互证: env 未设 + 有效 pre → 200（未设=零行为差·对照 A3 同线程面设缝即 500）
    const r = await post(IV_CTL);
    A('A5 env 未设臂: 有效 pre 照常 200（零行为差运行面）',
      r.status === 200 && r.body && typeof r.body.readiness === 'string' && Array.isArray(r.body.milestones));
    A(`A5 注入失败码具名=${CAREER_PATH_INJECTED_FAILURE}（A3 500 非裸错·seam 错误码在树）`,
      typeof CAREER_PATH_INJECTED_FAILURE === 'string' && CAREER_PATH_INJECTED_FAILURE.length > 0);
  }

  // ══ A6 · 越权 POST: 他人 principal → 404 privacy 先行 ∧ 零副作用 ══
  {
    process.env[SEAM_ENV_KEY] = IV_OTH;   // 缝即使指向该线程·越权仍在 pre-tx 拒绝
    const r = await post(IV_OTH, 'userB');   // userB POST 自己的线程（无评估）→ 409 对照=面可达
    delete process.env[SEAM_ENV_KEY];
    A('A6 合法 owner 对照: userB POST 自己的面试 → 非 404（privacy 放行·409 评估面）',
      r.status !== 404, `status=${r.status}`);
    const beforeCtl = await graphRuns(IV_CTL);
    const cross = await post(IV_CTL, 'userB');   // userB 越权打 userA 线程
    A('A6 越权 POST career-path（userB→userA 线程）→ 404 not_found_or_forbidden',
      cross.status === 404 && cross.body?.error === 'not_found_or_forbidden',
      `status=${cross.status} body=${JSON.stringify(cross.body).slice(0, 120)}`);
    const afterCtl = await graphRuns(IV_CTL);
    A('A6 越权零副作用: userA 线程图行集零变（越权请求未触任何 ledger 写）',
      JSON.stringify(afterCtl) === JSON.stringify(beforeCtl),
      `before=${JSON.stringify(beforeCtl)} after=${JSON.stringify(afterCtl)}`);
  }

  // ── EXIT 裁决 ──
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  console.log('HONESTY: EXIT0 = NHP-004-ADV-01 case 证据 · ≠ covered ≠ ADV 升 covered/partial · coveredCount=8 不动');
  console.log('HONESTY: §9-rev.4 两分——malformed/越权未拒=机制红可停;well-formed 伪造游标得空 catch-up=设计内语义非红');
  console.log('HONESTY: §9-rev.6——A6 与 uc004-draft 臂 6 同族只作旁证只读引用·列值零联动零翻转');
  if (failures.length > 0) {
    console.log(`\nNHP-004-ADV-01 — 诚实保留 gap（EXIT 1 · 非 flake · Ban invent fix）:`);
    for (const f of failures) console.log(`  GAP-ITEM assertion="${f}"`);
    console.log('  依据: interview.service.ts:52-55 缝 · :829-843 pre-tx 双 409 · :845-846 生效点 · :882-887 markFailed');
    process.exit(1);
  }
  console.log(`\nEXIT=0 — NHP-004-ADV-01 对抗族（A1/A2 409 先行/A3 500+failed v≥2/A4 thread-scoped/A5 production-off/A6 越权 404）全绿（${total} 条）。`);
  process.exit(0);
})().catch((e) => {
  console.error('NHP-004-ADV-01 harness 崩溃（EXIT 1 · 记入 attempts 台账 · 非 flake）:', e);
  process.exit(1);
});
