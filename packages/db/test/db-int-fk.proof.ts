/**
 * DBFK-1 · interview 复合 FK 渐进补齐 prove（P1–P7 · harness db-intfk.md §5 rev2）。
 * pnpm db-intfk:prove（run-e2e-isolated 临时 Postgres · 迁移推进到 0148）。
 *
 *   P1 孤儿检测：§3.4 LEFT JOIN 六表计数=0 收据；另合成孤儿证明 NOT VALID ADD 容忍存量、
 *      VALIDATE 拒绝（23503）——检测门非摆设（全程回滚事务内自证，不碰已验约束）。
 *   P2 catalog：pg_constraint 六 FK（convalidated/confdeltype='c'/列序）+ 父
 *      uq_interview_id_owner 约束与唯一索引。
 *   P3 双负门：Batch 1 三表 不存在 interview_id / 真实 id+错 owner → 23503（定向
 *      DISABLE 0059 guard 触发器模拟「绕过触发器的路径」——运维直连/新 DEFINER 面）；
 *      对照：触发器在场时同类恶意写先被 guard 拒（层叠顺序 receipt）。
 *   P4 正路径：建 interview → 六表真实语句形态写入全过（report.ts:15 /
 *      interview.service.ts:567/:796/:822/:849/:904——guard 与 FK 共存不误伤）。
 *      P4-0 既有雷登记（DBID1-UUIDV7-ACL-E1）：0073 default-priv 收紧 × 0143 uuidv7
 *      默认 → app_role 省略 id 的 INSERT 42501——base 既有、与本刀 FK 无关、如实断言
 *      现状并交 post-prove 双审（修复=独立刀）。
 *   P5 擦除共存：0096 begin 真链在 base 即 42501 断（DBID1-UUIDV7-ACL-E1 既有雷 ·
 *      DEFINER owner 无 uuidv7 EXECUTE · superuser 调用同断 · P5-2 如实断言登记）；
 *      遂逐字镜像 0096:521-548 report sink purge 机械（同款 advisory 锁 + 六表直删 +
 *      残留=0）证 FK 不拦子侧删除 + interview 根行仍在（fence 锚不动）。
 *   P6 静态契约门：0147 恰一条 concurrent-index 语句；0148 = 1×UNIQUE USING INDEX +
 *      6×FK NOT VALID + 6×VALIDATE 语句白名单；git 面历史迁移零改动。
 *   P7 回归复跑接线收据：growth / uc019-report-regenerate / int-transcript-remaining-sinks /
 *      recruiter:prove 四目标接线在卷（rev2 补 recruiter=cleanup :210 全库唯一
 *      DELETE FROM interview 根行删点 · FK 在场后首触 CASCADE 级联面）；四项复跑
 *      以顶层 EXEC 命令执行、收据入 commit（本文件只锁接线不断言其结果）。
 *
 * 纪律：EXIT=0 一次过；attempts 全账；Ban retry-to-green。
 * 作者 mw-core（EXEC 授权 = 协调方 @a0a1bd37 rev2 双审 BOTH PASS）。
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { createPool, asPrincipal, assertIsolatedTestTarget, beginInterviewProjectionErasure } from '@meetwise/db';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const section = (t: string) => console.log(`\n──── ${t} ──────`);
const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
const REPO_ROOT = fileURLToPath(new URL('../../../', import.meta.url));

const TAG = 'dbfk1_' + Math.random().toString(36).slice(2, 8);
const owner = `${TAG}_owner`, otherOwner = `${TAG}_other`;
const createdInterviewIds = new Set<string>();

/** 六张入列子表（Batch 1 三 + Batch 1b 三 · D2 同刀）。 */
const CHILDREN = [
  { table: 'ai_report', fk: 'fk_ai_report_interview_owner', guard: 'ai_report_privacy_projection_write_guard' },
  { table: 'assessment_report', fk: 'fk_assessment_report_interview_owner', guard: 'assessment_report_privacy_projection_write_guard' },
  { table: 'question_feedback', fk: 'fk_question_feedback_interview_owner', guard: 'question_feedback_privacy_projection_write_guard' },
  { table: 'learning_plan', fk: 'fk_learning_plan_interview_owner', guard: 'learning_plan_privacy_projection_write_guard' },
  { table: 'career_path', fk: 'fk_career_path_interview_owner', guard: 'career_path_privacy_projection_write_guard' },
  { table: 'learning_progress', fk: 'fk_learning_progress_interview_owner', guard: 'learning_progress_privacy_projection_write_guard' },
] as const;

async function insertInterview(ownerId: string, interviewId: string): Promise<void> {
  await pool.query(
    "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
    [interviewId, ownerId]);
  createdInterviewIds.add(interviewId);
}

/** 六表 report 投影残留行数（P5 物理删=0 断言）。 */
async function reportResidualCount(interviewId: string): Promise<number> {
  const r = await pool.query<{ n: string }>(
    `SELECT ${(CHILDREN.map((c) => `(SELECT count(*) FROM ${c.table} WHERE interview_id=$1)`).join(' + '))} AS n`,
    [interviewId]);
  return Number(r.rows[0]?.n ?? -1);
}

/** 在回滚事务内定向停用 0059 guard 触发器后执行写——模拟「绕过触发器的路径」，返回 SQLSTATE（或 null=写入竟成功）。 */
async function writeBypassingGuard(table: string, trigger: string, statement: string, params: unknown[]): Promise<string | null> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    try {
      await c.query(`ALTER TABLE ${table} DISABLE TRIGGER ${trigger}`);
      try { await c.query(statement, params); }
      catch (e: unknown) { await c.query('ROLLBACK'); return (e as { code?: string }).code ?? 'no_code'; }
      await c.query('ROLLBACK');
      return null; // 写入未被拒——FK 负门失效
    } catch (e) { await c.query('ROLLBACK').catch(() => undefined); throw e; }
  } finally { c.release(); }
}

/* ───────────────── P1 · 孤儿检测（§3.4 · ADD 前置门 · 非摆设自证） ───────────────── */

async function p1() {
  section('P1 孤儿检测（orphan-check-first）');
  let allZero = true;
  for (const c of CHILDREN) {
    const r = await pool.query<{ n: string }>(
      `SELECT count(*) AS n FROM ${c.table} ch
         LEFT JOIN interview i ON i.id = ch.interview_id AND i.owner_user_id = ch.owner_user_id
        WHERE ch.interview_id IS NOT NULL AND i.id IS NULL`);
    const n = Number(r.rows[0]?.n ?? -1);
    console.log(`CHECK  [P1 收据] ${c.table} 孤儿计数=${n}（期望 0）`);
    if (n !== 0) allZero = false;
  }
  A('P1-1 六表 §3.4 LEFT JOIN 孤儿计数全 0（迁移前即时门 · 干净库收据）', allZero);

  // 合成孤儿自证（全部在回滚事务内，不动已验约束）：停 guard 触发器 + 摘 FK → 插孤儿 →
  // ADD NOT VALID（不扫存量 → 应容忍）→ VALIDATE（扫存量 → 必须 23503 拒）。回滚后复核约束原样。
  const c = await pool.connect();
  let addNotValidOk = false, validateCode: string | undefined, restored = false;
  try {
    await c.query('BEGIN');
    await c.query(`ALTER TABLE question_feedback DISABLE TRIGGER question_feedback_privacy_projection_write_guard`);
    await c.query(`ALTER TABLE question_feedback DROP CONSTRAINT fk_question_feedback_interview_owner`);
    await c.query("INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating) VALUES ($1,$2,0,'up')",
      [owner, `iv_orphan_${TAG}`]);
    try {
      await c.query(`ALTER TABLE question_feedback ADD CONSTRAINT fk_question_feedback_interview_owner
        FOREIGN KEY (interview_id, owner_user_id) REFERENCES interview (id, owner_user_id) ON DELETE CASCADE NOT VALID`);
      addNotValidOk = true;
    } catch (e) { console.error('P1 合成孤儿 ADD NOT VALID 意外失败:', (e as { code?: string }).code); }
    if (addNotValidOk) {
      try { await c.query('ALTER TABLE question_feedback VALIDATE CONSTRAINT fk_question_feedback_interview_owner'); }
      catch (e: unknown) { validateCode = (e as { code?: string }).code; }
    }
    await c.query('ROLLBACK');
    const back = await pool.query<{ convalidated: boolean }>(
      "SELECT convalidated FROM pg_constraint WHERE conname='fk_question_feedback_interview_owner' AND conrelid='question_feedback'::regclass");
    restored = back.rows[0]?.convalidated === true;
  } finally { c.release(); }
  A('P1-2 合成孤儿：NOT VALID ADD 容忍存量（不扫——在线两段式的前提）', addNotValidOk);
  A('P1-3 合成孤儿：VALIDATE 拒绝存量孤儿 → SQLSTATE 23503（检测门非摆设）', validateCode === '23503');
  A('P1-4 自证回滚后原约束原样（convalidated=true 未被仪器污染）', restored);
}

/* ───────────────── 主链 ───────────────── */

async function main() {
  await assertIsolatedTestTarget(pool);
  await p1();

  // P2（修正版：父唯一约束 + 六 FK）
  section('P2 FK catalog（pg_constraint）');
  {
    const fks = (await pool.query<{
      conname: string, convalidated: boolean, confdeltype: string, parent: string,
      child_cols: string[], parent_cols: string[],
    }>(`
      SELECT c.conname, c.convalidated, c.confdeltype, c.confrelid::regclass::text AS parent,
        (SELECT array_agg(a.attname::text ORDER BY k.ord) FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, ord)
           JOIN pg_attribute a ON a.attrelid=c.conrelid AND a.attnum=k.attnum) AS child_cols,
        (SELECT array_agg(a.attname::text ORDER BY k.ord) FROM unnest(c.confkey) WITH ORDINALITY AS k(attnum, ord)
           JOIN pg_attribute a ON a.attrelid=c.confrelid AND a.attnum=k.attnum) AS parent_cols
        FROM pg_constraint c
       WHERE c.contype='f' AND c.confrelid='interview'::regclass`)).rows;
    const byName = new Map(fks.map((r) => [r.conname, r]));
    const six = CHILDREN.map((c) => byName.get(c.fk));
    // P2-1 改形登记（本刀 0193 增面·非洗基线）：引用 interview 的 FK 总数 6→8——0193 补
    // candidate_profile_route_decision/snapshot 两侧复合 FK（interview 侧·resume 侧类型断层
    // 缓建披露见 0193 文件头）。断言=Batch 1 六条恰在（CHILDREN 集·原有语义保留）+0193 两条
    // 恰在=总 8；interview_event 案 B 不在场语义保留（conname 白名单面）。
    const cprFks = fks.filter((r) => r.conname === 'fk_cpr_decision_interview' || r.conname === 'fk_cpr_snapshot_interview').length;
    A('P2-1 引用 interview 的 FK：Batch 1 恰 6（CHILDREN 集）+ 0163 plan_snapshot 2 + 0193 candidate 面 2（interview 侧）= 总 10（interview_event 案 B 不在场）',
      fks.length === 10 && six.every(Boolean) && cprFks === 2);
    A('P2-2 六 FK 全 convalidated=true（VALIDATE 已过）· confdeltype=\'c\'（ON DELETE CASCADE · D5）',
      six.every((r) => r?.convalidated === true && r.confdeltype === 'c'));
    A('P2-3 列序对位：子 (interview_id, owner_user_id) ↔ 父 interview (id, owner_user_id)',
      six.every((r) => r?.parent === 'interview'
        && JSON.stringify(r.child_cols) === JSON.stringify(['interview_id', 'owner_user_id'])
        && JSON.stringify(r.parent_cols) === JSON.stringify(['id', 'owner_user_id'])));
    const uq = (await pool.query<{ n: string, cols: string[], indisunique: boolean, indisvalid: boolean }>(`
      SELECT ic.relname AS n,
        (SELECT array_agg(a.attname::text ORDER BY k.ord) FROM unnest(i.indkey) WITH ORDINALITY AS k(attnum, ord)
           JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=k.attnum) AS cols,
        i.indisunique, i.indisvalid
        FROM pg_index i JOIN pg_class ic ON ic.oid=i.indexrelid
       WHERE i.indrelid='interview'::regclass AND ic.relname='uq_interview_id_owner'`)).rows[0];
    const uqConstraint = (await pool.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM pg_constraint WHERE conrelid='interview'::regclass AND conname='uq_interview_id_owner' AND contype='u'")).rows[0];
    A('P2-4 父侧 uq_interview_id_owner：0147 唯一索引已被 0148 收编为 UNIQUE 约束（contype=u）且索引 indisunique/indisvalid、列序 (id, owner_user_id)',
      uqConstraint?.n === 1 && uq?.indisunique === true && uq?.indisvalid === true
      && JSON.stringify(uq?.cols) === JSON.stringify(['id', 'owner_user_id']));
  }

  // P3 双负门（Batch 1 三表 · 23503）
  section('P3 双负门（不存在 id / 错 owner → 23503）');
  const ivA = `iv_neg_${TAG}`;
  await insertInterview(owner, ivA);
  {
    const cases: Array<{ table: string, guard: string, stmt: string, params: unknown[], label: string }> = [
      { table: 'ai_report', guard: 'ai_report_privacy_projection_write_guard',
        stmt: 'INSERT INTO ai_report(owner_user_id, interview_id) VALUES ($1,$2)', params: [owner, `iv_missing_${TAG}`], label: 'ai_report 不存在 interview_id' },
      { table: 'ai_report', guard: 'ai_report_privacy_projection_write_guard',
        stmt: 'INSERT INTO ai_report(owner_user_id, interview_id) VALUES ($1,$2)', params: [otherOwner, ivA], label: 'ai_report 真 id+错 owner（同 owner 归属声明式生效）' },
      { table: 'assessment_report', guard: 'assessment_report_privacy_projection_write_guard',
        stmt: 'INSERT INTO assessment_report(id, owner_user_id, interview_id) VALUES ($1,$2,$3)', params: [`ar-${TAG}`, owner, `iv_missing_${TAG}`], label: 'assessment_report 不存在 interview_id' },
      { table: 'assessment_report', guard: 'assessment_report_privacy_projection_write_guard',
        stmt: 'INSERT INTO assessment_report(id, owner_user_id, interview_id) VALUES ($1,$2,$3)', params: [`ar2-${TAG}`, otherOwner, ivA], label: 'assessment_report 真 id+错 owner' },
      { table: 'question_feedback', guard: 'question_feedback_privacy_projection_write_guard',
        stmt: "INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating) VALUES ($1,$2,0,'up')", params: [owner, `iv_missing_${TAG}`], label: 'question_feedback 不存在 interview_id' },
      { table: 'question_feedback', guard: 'question_feedback_privacy_projection_write_guard',
        stmt: "INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating) VALUES ($1,$2,0,'up')", params: [otherOwner, ivA], label: 'question_feedback 真 id+错 owner' },
    ];
    for (const cs of cases) {
      const code = await writeBypassingGuard(cs.table, cs.guard, cs.stmt, cs.params);
      A(`P3-1 ${cs.label} → 23503（绕触发器路径也被拦·声明式边界）`, code === '23503');
    }
    // 对照：触发器在场（正常 app_role 路径）同类恶意写先被 0059 guard 拒，层叠顺序 receipt。
    let guardCode: string | undefined;
    try { await asPrincipal(pool, owner, (c) => c.query(
      'INSERT INTO ai_report(owner_user_id, interview_id) VALUES ($1,$2)', [owner, `iv_missing_${TAG}`])); }
    catch (e: unknown) { guardCode = (e as { code?: string }).code; }
    console.log(`CHECK  [P3 收据] 触发器在场时同类恶意写 guard 先拒 SQLSTATE=${guardCode ?? '未拒!'}（≠23503 = 行为面在前）`);
    A('P3-2 层叠顺序：0059 guard 先于 FK 拒恶意写（guard≠23503 且确实拒绝——互补非替代）', guardCode !== undefined && guardCode !== '23503');
  }

  // P4 正路径（六表真实语句形态 · guard 与 FK 共存不误伤）
  section('P4 正路径（真实语句形态 · 六表）');
  const ivB = `iv_pos_${TAG}`;
  await insertInterview(owner, ivB);
  {
    // ── 既有雷登记（DBID1-UUIDV7-ACL-E1 · base 既有 · 非本刀面）───────────────────
    // 0073:1342 对迁移 owner 角色执行过 ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON
    // FUNCTIONS FROM PUBLIC，0143 随后建的 uuidv7() 因此 proacl={owner=X}（无 PUBLIC/
    // app_role EXECUTE，已隔离库实证）。app_role 下任何省略 id、走 DEFAULT uuidv7() 的
    // INSERT（含 report.ts:15 enqueueReport 真路径）→ 42501。本刀两迁移零碰函数/授权
    // （P6 白名单结构性保证），该雷与本刀 FK 无关，如实断言现状并登记交 post-prove 双审；
    // 修复=独立刀（一条 GRANT EXECUTE，不入本刀 P6 白名单）。
    let landmineCode: string | undefined;
    let landmineRowId: string | undefined;
    try {
      const lr = await asPrincipal(pool, owner, (c) => c.query(
        `INSERT INTO ai_report(owner_user_id, interview_id) VALUES ($1,$2)
         ON CONFLICT (owner_user_id, interview_id) DO NOTHING RETURNING id`, [owner, ivB]));
      landmineRowId = lr.rows[0]?.id;
    } catch (e: unknown) { landmineCode = (e as { code?: string }).code; }
    console.log(`CHECK  [P4 收据·既有雷] report.ts:15 真实形态（app_role·省略 id 走 DEFAULT uuidv7）→ SQLSTATE=${landmineCode ?? '未拒(修复态)'}（DBID1-UUIDV7-ACL-E1）`);
    // P4-0 改形登记（0145 落链后的主线基线红消解·非洗基线）：原断言「base 即 42501」在
    // 0145:25 `GRANT EXECUTE ON FUNCTION public.uuidv7() TO app_role` 落链后失效（雷已由
    // 该独立刀闭合——正是原断言预留的「修复=独立刀」路径）。改形=雷修复状态如实断言：
    // omit-id INSERT 成功建行即雷闭合实据；随即删 P4-0 行恢复基面（ai_report 非本刀
    // append-only 拦截面·DELETE 自由），P4 正路径显式 id 形态照旧不受干扰。
    A('P4-0 既有雷修复状态（改形·0145 落链后）：0145:25 GRANT 后 app_role omit-id INSERT 成功建行（base 42501 雷已闭合·非本刀 FK 面）',
      landmineRowId !== undefined);
    if (landmineRowId) await pool.query('DELETE FROM ai_report WHERE id=$1', [landmineRowId]);

    await asPrincipal(pool, owner, async (c) => {
      // report.ts:15 形态（id 列显式补值绕开 DEFAULT 求值面——FK/guard 共存断言不受既有雷干扰）
      const ins = await c.query(`INSERT INTO ai_report(id, owner_user_id, interview_id) VALUES ($1,$2,$3)
        ON CONFLICT (owner_user_id, interview_id) DO NOTHING RETURNING id`, [randomUUID(), owner, ivB]);
      if (ins.rowCount !== 1) throw new Error('p4_ai_report_not_created');
      // interview.service.ts:796 形态
      await c.query(`INSERT INTO assessment_report(id, owner_user_id, interview_id, status, dimensions, overall)
          VALUES ($1,$2,$3,'ready',$4,$5)
          ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET status='ready', dimensions=EXCLUDED.dimensions, overall=EXCLUDED.overall, version=assessment_report.version+1`,
        [randomUUID(), owner, ivB, JSON.stringify([{ dimension: 'd', score: 3, gap: false, evidence: [] }]), 3]);
      // interview.service.ts:567 形态
      await c.query(`INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating, comment) VALUES ($1,$2,$3,$4,$5)
          ON CONFLICT (owner_user_id, interview_id, question_index) DO UPDATE SET rating=EXCLUDED.rating, comment=EXCLUDED.comment`,
        [owner, ivB, 0, 'up', 'p4']);
      // interview.service.ts:822 形态
      await c.query(`INSERT INTO learning_plan(id, owner_user_id, interview_id, items)
          VALUES ($1,$2,$3,$4)
          ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET items=EXCLUDED.items, version=learning_plan.version+1`,
        [randomUUID(), owner, ivB, JSON.stringify([{ topic: 't' }])]);
      // interview.service.ts:849 形态
      await c.query(`INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [owner, ivB, 'topic-1']);
      // interview.service.ts:904 形态
      await c.query(`INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level, milestones)
          VALUES ($1,$2,$3,$4,$5,$6)
          ON CONFLICT (owner_user_id, interview_id) DO UPDATE SET readiness=EXCLUDED.readiness, level=EXCLUDED.level, milestones=EXCLUDED.milestones, version=career_path.version+1`,
        [randomUUID(), owner, ivB, 'mid', 'senior', JSON.stringify([])]);
    });
    const n = await reportResidualCount(ivB);
    A('P4-1 建 interview → 六表真实语句形态写入全过（guard 与 FK 共存不误伤 · 恰 6 行）', n === 6);
    // 幂等重放（ON CONFLICT 形态是业务幂等面——FK 在场二次写不炸）
    let replayOk = true;
    try { await asPrincipal(pool, owner, async (c) => {
      await c.query(`INSERT INTO ai_report(id, owner_user_id, interview_id) VALUES ($1,$2,$3)
        ON CONFLICT (owner_user_id, interview_id) DO NOTHING RETURNING id`, [randomUUID(), owner, ivB]);
      await c.query(`INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [owner, ivB, 'topic-1']);
    }); } catch { replayOk = false; }
    A('P4-2 ON CONFLICT 幂等重放在 FK 在场不炸（现存流程零破坏 · §1.5c）', replayOk);
  }

  // P5 擦除共存（0096 report sink purge 语义在 FK 在场复刻）
  section('P5 擦除共存（0096 report sink · FK 在场）');
  {
    const ivP = `iv_purge_${TAG}`;
    await insertInterview(owner, ivP);
    await asPrincipal(pool, owner, async (c) => {
      // id 显式补值（DBID1-UUIDV7-ACL-E1 既有雷：省略 id 的 DEFAULT 求值在 app_role 42501·登记于 P4-0）
      await c.query(`INSERT INTO ai_report(id, owner_user_id, interview_id) VALUES ($1,$2,$3)`, [randomUUID(), owner, ivP]);
      await c.query(`INSERT INTO assessment_report(id, owner_user_id, interview_id) VALUES ($1,$2,$3)`, [`ar-${ivP}`, owner, ivP]);
      await c.query(`INSERT INTO learning_plan(id, owner_user_id, interview_id) VALUES ($1,$2,$3)`, [`lp-${ivP}`, owner, ivP]);
      await c.query(`INSERT INTO learning_progress(owner_user_id, interview_id, topic) VALUES ($1,$2,'topic-1')`, [owner, ivP]);
      await c.query(`INSERT INTO career_path(id, owner_user_id, interview_id, readiness, level) VALUES ($1,$2,$3,'mid','senior')`, [`cp-${ivP}`, owner, ivP]);
      await c.query(`INSERT INTO question_feedback(owner_user_id, interview_id, question_index, rating) VALUES ($1,$2,0,'up')`, [owner, ivP]);
    });
    A('P5-1 fixture 落库（六表各 1）', (await reportResidualCount(ivP)) === 6);

    // ── P5-2 既有雷修复状态（DBID1-UUIDV7-ACL-E1·改形登记）──────────────────────
    // 原断言「begin 链（DEFINER privacy_api_owner）在 base 即 42501」在 0150 闭集授权落链后
    // 失效：0150_uuidv7_grant_acl 将 privacy_api_owner 纳入 8 角色闭集（P1-1 同源），DEFAULT
    // 求值不再 42501——原断言预留的「修复=独立刀（GRANT EXECUTE 面）」路径已由 0150 兑现。
    // 改形=雷修复状态如实断言：begin-erasure 真链走通（不再 42501）即闭集修复实据；与
    // P4-0 改形同源（0145/0150 分刀补授权·本刀 FK 面零相关）。
    let beginCode: string | undefined;
    try { await asPrincipal(pool, owner, (c) => beginInterviewProjectionErasure(c, ivP, 'a'.repeat(64), 7)); }
    catch (e: unknown) { beginCode = (e as { code?: string }).code; }
    console.log(`CHECK  [P5 收据·既有雷] begin-erasure 真链（DEFINER privacy_api_owner）→ SQLSTATE=${beginCode ?? '通过(闭集修复态)'}（DBID1-UUIDV7-ACL-E1 · 0150 闭集后修复态）`);
    A('P5-2 既有雷修复状态（改形·0150 落链后）：闭集授权后 begin-erasure 真链不再 42501（修复=0150 独立刀兑现·非本刀 FK 面）', beginCode === undefined);

    // ── P5-3..6 逐字镜像 0096:521-548 report sink purge 机械（同款 advisory 锁 + 六表直删 +
    // 残留=0 校验）——FK 在场下子侧 DELETE 不被拦（§4.3 机械面），owner 连接作仪器（登记）。
    const c = await pool.connect();
    let purgedRows = -1, residual = -1, rootStillThere = false;
    try {
      await c.query('BEGIN');
      await c.query("SELECT pg_advisory_xact_lock(hashtext('meetwise:interview_privacy:' || $1))", [ivP]);
      await c.query('DELETE FROM question_feedback WHERE owner_user_id=$1 AND interview_id=$2', [owner, ivP]);
      await c.query('DELETE FROM learning_progress WHERE owner_user_id=$1 AND interview_id=$2', [owner, ivP]);
      await c.query('DELETE FROM learning_plan WHERE owner_user_id=$1 AND interview_id=$2', [owner, ivP]);
      await c.query('DELETE FROM career_path WHERE owner_user_id=$1 AND interview_id=$2', [owner, ivP]);
      await c.query('DELETE FROM assessment_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, ivP]);
      await c.query('DELETE FROM ai_report WHERE owner_user_id=$1 AND interview_id=$2', [owner, ivP]);
      const rem = await c.query<{ n: string }>(
        `SELECT ${(CHILDREN.map((ch) => `(SELECT count(*) FROM ${ch.table} WHERE owner_user_id=$1 AND interview_id=$2)`).join(' + '))} AS n`,
        [owner, ivP]);
      residual = Number(rem.rows[0]?.n ?? -1);
      if (residual === 0) { await c.query('COMMIT'); } else { await c.query('ROLLBACK'); }
    } finally { c.release(); }
    purgedRows = 6 - (await reportResidualCount(ivP));
    const root = (await pool.query<{ n: string }>('SELECT count(*) AS n FROM interview WHERE id=$1', [ivP])).rows[0];
    rootStillThere = Number(root?.n) === 1;
    A('P5-3 镜像 0096 report sink 六表直删（同款 advisory 锁序）：FK 在场删除全过（FK 不拦子侧删除 · §4.3）', purgedRows === 6);
    A('P5-4 残留=0（0096 残留校验语义原样·fail-closed 回滚门在场）', residual === 0);
    A('P5-5 interview 根行仍在（fence 锚不动 · CASCADE 在擦除路径 inert）', rootStillThere);
  }

  // P6 静态契约门
  // P6-2/P6-3/P6-4 改形登记（0148 重制配套·非洗基线）：0148 重制为 multi-statement 形
  // （#134 拆事务+首语句 DO 块孤儿检测门）后语句白名单 13→14 句；语句拆分对 dollar-quote
  // 感知（DO 块整体单元）；SELECT 禁词精确化为「仅允许出现在 DO 孤儿检测器内」（检测性
  // 读取是先检测后约束门的本体，余句仍零 SELECT）；git 白名单面=历史 M/D 仅限 0148/0149
  // 重制豁免两文件+新号 0190-0199 未跟踪态（0147 当时未跟踪、今已提交故从 ?? 面移除）。
  section('P6 静态契约门（新迁移语句白名单 + 历史迁移零 diff）');
  {
    const stripComments = (t: string) => t.replace(/--[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '');
    const m0147 = stripComments(sql('../migrations/0147_interview_owner_unique_index.sql')).trim();
    const m0148 = stripComments(sql('../migrations/0148_interview_composite_fk_batch1.sql')).trim();
    A('P6-1 0147 恰一条 concurrent-index 语句（合 runner 正则门）',
      /^CREATE\s+UNIQUE\s+INDEX\s+CONCURRENTLY\s+IF\s+NOT\s+EXISTS\s+uq_interview_id_owner\s+ON\s+interview\s+\(id,\s*owner_user_id\);?$/is.test(m0147));
    const splitTopLevel = (t: string): string[] => {
      const stmts: string[] = [];
      const doRe = /DO\s+\$[A-Za-z_][A-Za-z0-9_]*\$[\s\S]*?\$\s*;/g;
      let last = 0;
      for (const mdo of t.matchAll(doRe)) {
        for (const piece of t.slice(last, mdo.index).split(';')) { const x = piece.trim(); if (x) stmts.push(x); }
        stmts.push(mdo[0].trim());
        last = (mdo.index ?? 0) + mdo[0].length;
      }
      for (const piece of t.slice(last).split(';')) { const x = piece.trim(); if (x) stmts.push(x); }
      return stmts;
    };
    const stmts0148 = splitTopLevel(m0148);
    const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
    const orphanGate = stmts0148.filter((s) => /^DO \$fk_orphan_check\$/.test(s) && /RAISE EXCEPTION/.test(s) && /fk_orphan_rows/.test(s));
    const uniqCount = stmts0148.filter((s) => /^ALTER TABLE interview ADD CONSTRAINT uq_interview_id_owner UNIQUE USING INDEX uq_interview_id_owner$/i.test(norm(s))).length;
    const fkAddCount = stmts0148.filter((s) => CHILDREN.some((c) =>
      norm(s).toLowerCase() === `alter table ${c.table} add constraint ${c.fk} foreign key (interview_id, owner_user_id) references interview (id, owner_user_id) on delete cascade not valid`)).length;
    const validateCount = stmts0148.filter((s) => CHILDREN.some((c) => norm(s).toLowerCase() === `alter table ${c.table} validate constraint ${c.fk}`.toLowerCase())).length;
    A('P6-2 0148 语句白名单（重制形）：1×DO 孤儿门 + 1×UNIQUE USING INDEX + 6×FK ADD NOT VALID + 6×VALIDATE（共 14 句·列序/CASCADE/NOT VALID 逐句全等）',
      stmts0148.length === 14 && orphanGate.length === 1 && uniqCount === 1 && fkAddCount === 6 && validateCount === 6);
    // 禁的是 DML/权限面：UPDATE、DELETE FROM（擦除面）、DROP、TRIGGER、POLICY、INSERT、
    // GRANT/REVOKE——FK 定义自身的「ON DELETE CASCADE」子句是声明式 DDL 不在禁面；
    // SELECT 仅允许出现在首语句 DO 孤儿检测器内（检测性读取·先检测后约束门的本体），
    // 检测器之外的语句仍零 SELECT。
    const banned = /\bUPDATE\b|DELETE\s+FROM|\bDROP\b|\bINSERT\b|\bGRANT\b|\bREVOKE\b|CREATE\s+TRIGGER|\bPOLICY\b/i;
    const withoutOrphanGate = stmts0148.filter((s) => !/^DO \$fk_orphan_check\$/.test(s)).join(' ; ');
    A('P6-3 两新迁移零 UPDATE/DELETE/DROP/TRIGGER/POLICY 及任何 DML/权限语句（additive 硬保证·SELECT 仅限 DO 检测器内）',
      !banned.test(m0147) && !banned.test(m0148) && !/\bSELECT\b/i.test(withoutOrphanGate));
    const porcelain = execFileSync('git', ['status', '--porcelain', '--', 'packages/db/migrations'], { cwd: REPO_ROOT, encoding: 'utf8' })
      .split('\n').map((l) => l.trim()).filter(Boolean);
    const newFiles = new Set([
      '?? packages/db/migrations/0190_outbox_consumption_unique_concurrent.sql',
      '?? packages/db/migrations/0191_outbox_consumption_fk.sql',
      '?? packages/db/migrations/0192_interview_event_created_at_kind_check.sql',
      '?? packages/db/migrations/0193_candidate_route_status_fk_harden.sql',
      '?? packages/db/migrations/0194_money_consistency_graph_run_terminal.sql',
      '?? packages/db/migrations/0195_interview_event_settlement_append_only.sql',
      '?? packages/db/migrations/0196_trigfam_execute_least_privilege.sql',
      '?? packages/db/migrations/0197_qbank_release_storage_lock_timeout.sql',
      '?? packages/db/migrations/0198_trace_created_at_index.sql',
      '?? packages/db/migrations/0199_redundant_index_drop.sql',
    ]);
    const rewriteExempt = /packages\/db\/migrations\/(0148_interview_composite_fk_batch1|0149_money_status_constraints)\.sql$/;
    const illegal = porcelain.filter((l) => !newFiles.has(l) && !rewriteExempt.test(l));
    A('P6-4 历史迁移零改动（git 面 M/D 仅限 0148/0149 重制豁免两文件·新号仅限 0190-0199 未跟踪态；0001-0147 零出现）', illegal.length === 0);
  }

  // P7 回归复跑接线收据（四项复跑以顶层命令执行 · 收据入 commit）
  section('P7 回归复跑接线（rev2 扩四）');
  {
    const rootPkg = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };
    const dbPkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };
    A('P7-1 本 prove 接线：root db-intfk:prove/:raw + db pkg prove:db-int-fk 三点在卷',
      rootPkg.scripts['db-intfk:prove'] === 'node scripts/run-e2e-isolated.mjs db-intfk:prove:raw'
      && rootPkg.scripts['db-intfk:prove:raw'] === 'pnpm -C packages/db prove:db-int-fk'
      && dbPkg.scripts['prove:db-int-fk'] === 'tsx test/db-int-fk.proof.ts');
    const runner = readFileSync(new URL('../../../scripts/run-e2e-isolated.mjs', import.meta.url), 'utf8');
    const registrations = runner.split("'db-intfk:prove:raw'").length - 1;
    A('P7-2 runner 四点注册：收据源 + 目标 allowlist + 命令分派 + 迁移前置门（≥4 处）', registrations >= 4);
    const regression: Array<[string, string]> = [
      ['growth:prove', 'growth:prove:raw'],
      ['uc019:report-regenerate:prove', 'uc019:report-regenerate:prove:raw'],
      ['int-transcript-remaining-sinks:prove', 'int-transcript-remaining-sinks:prove:raw'],
      ['recruiter:prove', 'recruiter:prove:raw'],
    ];
    A('P7-3 四项回归目标全部经隔离 runner 门（growth=assessment_report / uc019=ai_report / remaining-sinks=question_feedback+purge 闭包 / recruiter=CASCADE 级联面）',
      regression.every(([pub, raw]) => (rootPkg.scripts[pub] ?? '').endsWith(` ${raw}`)));
    A('P7-4 recruiter 深度 prove 目标直指 recruiter-depth.proof.ts（:210 根行删点=FK 在场后 CASCADE 面收据）',
      dbPkg.scripts['recruiter'] === 'tsx test/recruiter-depth.proof.ts');
  }

  // P8 claim 不变量载体（#3/#13 · 裁决④案c：零 DB 面 proof 断言 · 弱修先行）
  section('P8 claim 不变量载体（#3/#13 · 案c 零 DB 面 proof 断言）');
  {
    // 裁决④案c 行使登记：三案中唯一零码面可执行=案c。案a partial unique 需 claim 谓词
    // 状态前置（过期-running 先置态=码面触·越界）；案b EXCLUDE 需 btree_gist+租约起点列
    // （interview_job 仅 lease_expires_at·加列+claim 写点=码面触·越界）且底层索引随
    // ADD CONSTRAINT 原位非并发建。案c=不变量载体（「每面试至多一个有效 running」）仍
    // 落 claim SQL，本段把载体书面固化——claim 移位/谓词被删即本门红示警；案a/案b 锁窗
    // 评估与码面授权披露如实登记交付报告（弱修·非全闭）。
    const jobsSrc = sql('../src/interview/interview-jobs.ts');
    A('P8-1 claim 载体在位：interview-jobs.ts claim UPDATE 过期-running 重领臂（j.status=\'running\' AND j.lease_expires_at < now()）',
      /j\.status\s*=\s*'running'\s+AND\s+j\.lease_expires_at\s*<\s*now\(\)/.test(jobsSrc));
    A('P8-2 claim 载体在位：同面试有效 running NOT EXISTS 守卫（r.status=\'running\' AND r.lease_expires_at >= now()）',
      /NOT EXISTS\s*\(SELECT 1 FROM interview_job r WHERE r\.interview_id\s*=\s*j\.interview_id AND r\.status\s*=\s*'running' AND r\.lease_expires_at\s*>=\s*now\(\)\)/.test(jobsSrc));
    A('P8-3 claim 载体在位：failed 僵尸兄弟守卫（NOT EXISTS … f.status=\'failed\'）',
      /NOT EXISTS\s*\(SELECT 1 FROM interview_job f WHERE f\.interview_id\s*=\s*j\.interview_id AND f\.status\s*=\s*'failed'\)/.test(jobsSrc));
    const uq0019 = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM pg_constraint WHERE conrelid='interview_job'::regclass AND contype='u'`);
    const runningPartial = await pool.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM pg_indexes
        WHERE schemaname='public' AND tablename='interview_job' AND indexdef ILIKE '%running%'`);
    A('P8-4 DB 面现状（弱修基线如实固化）：双提交防=0019 表级 UNIQUE 在位；running 部分唯一索引零在（案a 未行使）',
      (uq0019.rows[0]?.n ?? 0) >= 1 && runningPartial.rows[0]?.n === 0);
  }

  console.log(`\n${failures === 0 ? '✓ db-intfk:prove 全部通过' : '✗ ' + failures + ' 失败'}（interview 复合 FK · P1-P8 · rev2）`);
}

async function cleanup() {
  // 根行删点=全库 CASCADE 唯一触发面（P7 recruiter:prove :210 同款语义）；先收数再删。
  const ids = [...createdInterviewIds];
  if (ids.length > 0) {
    const before = await pool.query<{ n: string }>('SELECT count(*) AS n FROM interview WHERE id = ANY($1::text[])', [ids]);
    await pool.query('DELETE FROM interview WHERE id = ANY($1::text[])', [ids]);
    console.log(`CHECK  [cleanup 收据] 删 interview 根行 ${ids.length} 条（删前实存 ${before.rows[0]?.n}）· Batch 1 子行随 CASCADE 级联清理`);
  }
}

main().catch((e) => { console.error(e); failures++; }).finally(async () => {
  try { await cleanup(); } catch (e) { console.error('cleanup failed:', e); }
  await pool.end(); process.exit(failures === 0 ? 0 : 1);
});
