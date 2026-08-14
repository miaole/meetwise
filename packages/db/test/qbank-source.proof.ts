/**
 * qbank 策展源表 + 审核门 + 跨租户投毒隔离证明(真 Postgres)。对齐 apps/worker/src/qbank-curation.ts 的门 SQL,
 * 但**在 DB 层直证**(RLS + 触发器 + CAS + 视图才是安全源头,绕过 TS 包装照样被挡)。
 *
 * 覆盖范围:策展门本身(源状态机 + 审核授权 + 投毒隔离 + approved-only 池视图)**并**生产检索接管
 *   (0016:vector_chunk 写门收紧 + annSearch(kind='qbank') 与 approved 源求交)——即 0013 文末 TODO 的两步已落地并在此直证。
 *   诚实缺口:现有灌库 apps/worker qbank-ingest 直写 vector_chunk 但尚未把块登记进 qbank_pool_entry(灌库↔策展门未接线),
 *   故接管后经 annSearch 的生产 qbank 召回只见已进 approved 池的块;把 ingest 接进"促块进池"是后续步骤(不在本轮)。
 *
 *   pnpm qbank-source:prove   （根脚本会起临时 pgvector cluster；绝不重建共享开发库）
 *   pnpm qbank-source:prove:raw  （仅供已确认隔离的 cluster 调用）
 *
 * 断言:① 源状态机(合法跃迁 / 非法跃迁+关键列篡改被拒 / 陈旧 CAS 落败);
 *      ② 跨租户投毒隔离(自审批 / 越权审核 / 非 curator 塞池[RLS 与触发器两条门分别打] / 自封 curator 全被拒);
 *      ③ approved-only 视图:未审/被撤销内容不在候选,池表禁止直读(结构保证);
 *      ④ content_hash 去重防重复投毒 + 无幽灵 id + 被拒 hash 不永久占坑;
 *      ⑤ 检索接管(隔离 0016 delta:先回 OPEN 基线证洞真实,再由 0016 开→闭):直写投毒被写门拒(42501)+ DELETE 清库/UPDATE 劫持被拒(0 行)
 *        + annSearch 只召回可信可见集(残留投毒剔除、ref_id 碰撞投毒被 owner 过滤挡出、可信直灌保留、approved 策展召回)+ 撤销源即时消失 + 视图属主可绕 RLS 前置 + 其它 kind 零影响。
 * 断言用 ERRCODE 收窄(23514=触发器 check / 42501=RLS·权限),避免"任何错都算门生效"的假绿。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, createPool, asPrincipal, annSearch, upsertVectorChunk } from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (f: string) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');

const CURATOR = 'curator1', CAND = 'cand1', CAND2 = 'cand2';
const QOWNER = '__system_qbank__';   // 系统灌库 principal:接管后唯一可直写 qbank 向量块者(06_retrieval/0016 写门)

// 确定性 512 维单位向量(与 vectorstore.proof 同构):annSearch 需真 embedding 才能证求交/撤销即消失。
const DIM = 512;
function embed(seed: number): number[] {
  let s = (seed * 2654435761) >>> 0; const v: number[] = [];
  for (let i = 0; i < DIM; i++) { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; v.push(s / 2 ** 32 - 0.5); }
  const nrm = Math.hypot(...v); return v.map((x) => x / nrm);
}

// 门 SQL(与 qbank-curation.ts 一字对齐:测的是生产将发出的同一条被门约束的语句)。
const proposeSQL =
  `INSERT INTO qbank_source(id, kind, uri, content_hash, status, added_by)
     VALUES ($1,$2,$3,$4,'pending',$5) ON CONFLICT (content_hash) WHERE status <> 'rejected' DO NOTHING RETURNING id`;
const reviewSQL =
  `UPDATE qbank_source SET status=$3, reviewed_by=current_setting('app.principal_user', true),
     review_note=$4, reviewed_at=now(), version=version+1 WHERE id=$1 AND status=$2`;
const promoteSQL =
  `INSERT INTO qbank_pool_entry(id, source_id, ref_id, content_hash)
     VALUES ($1,$2,$3,$4) ON CONFLICT (ref_id) DO NOTHING`;
const candidatesSQL = `SELECT ref_id FROM qbank_retrieval_candidate`;   // approved-only 视图(本门候选口径)

const propose = (c: any, u: string, id: string, hash: string, kind = 'question_bank') =>
  c.query(proposeSQL, [id, kind, 'uri://' + id, hash, u]);
const review = (c: any, id: string, from: string, to: string) => c.query(reviewSQL, [id, from, to, to + ' by test']);
const statusOf = (c: any, id: string) => c.query('SELECT status FROM qbank_source WHERE id=$1', [id]).then((r: any) => r.rows[0]?.status);
// 收窄错误断言:返回 SQLSTATE(无错=null),调用点断言等于预期 code。
const errCode = async (fn: () => Promise<unknown>): Promise<string | null> => {
  try { await fn(); return null; } catch (e: any) { return e?.code ?? 'ERR'; }
};
const RLS = '42501', CHK = '23514';   // 42501=RLS 违规/权限拒;23514=触发器 check_violation

async function main() {
  await assertIsolatedTestTarget(pool);
  await pool.query(sql('../sql/01_schema.sql'));                 // app_role + RLS 基座
  await pool.query(sql('../sql/06_retrieval.sql'));              // vector_chunk(接管后写门:qbank 仅系统 principal 可写)
  // 测试台重建(仅证明用,非迁移的一部分):qbank_* 不在 01_schema,持久库跨 schema 改动需先拆,
  // 否则迁移的 CREATE TABLE IF NOT EXISTS 会静默跳过旧异构表 → 约束不更新。生产迁移保持非破坏(IF NOT EXISTS)。
  await pool.query(`DROP VIEW IF EXISTS qbank_retrieval_candidate CASCADE;
    DROP TABLE IF EXISTS qbank_pool_entry, qbank_source, qbank_curator CASCADE;
    DROP FUNCTION IF EXISTS qbank_is_curator(), qbank_active_source_id(text),
      qbank_source_guard_update(), qbank_pool_requires_approved() CASCADE;`);
  await pool.query({ text: sql('../migrations/0013_qbank_source.sql') });               // 源表 + 审核门(受审旁路)
  await pool.query({ text: sql('../migrations/0016_qbank_retrieval_takeover.sql') });   // 检索接管:vector_chunk 写门收紧 + 求交索引(被测对象)
  // 授权根:curator 由超级用户 seed(setup 路径),app_role 无权自封。
  await pool.query('INSERT INTO qbank_curator(user_id) VALUES ($1) ON CONFLICT DO NOTHING', [CURATOR]);

  section('① 审核状态机:合法跃迁 / 非法跃迁+关键列篡改被拒 / 陈旧 CAS 落败');
  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S1', 'hashA'));
  A('候选人提议源 → 落 pending, added_by=自己',
    await asPrincipal(pool, CURATOR, (c) => c.query("SELECT status,added_by FROM qbank_source WHERE id='S1'"))
      .then((r: any) => r.rows[0]?.status === 'pending' && r.rows[0]?.added_by === CAND));
  A('curator: pending→approved 生效(CAS 1 行)',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S1', 'pending', 'approved')).then((r: any) => r.rowCount === 1));
  A('curator: 已 approved 再传 from=pending → 陈旧 CAS 落败(0 行)',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S1', 'pending', 'approved')).then((r: any) => r.rowCount === 0));
  A('非法跃迁 approved→pending 被触发器拒(23514)',
    await errCode(() => asPrincipal(pool, CURATOR, (c) => c.query("UPDATE qbank_source SET status='pending' WHERE id='S1'"))) === CHK);
  A('关键列篡改:curator 借审核 UPDATE 改 content_hash 被触发器拒(23514,内容不可偷换)',
    await errCode(() => asPrincipal(pool, CURATOR, (c) => c.query("UPDATE qbank_source SET content_hash='hEvil' WHERE id='S1'"))) === CHK);

  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S2', 'hashB'));
  A('curator: pending→rejected 生效',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S2', 'pending', 'rejected')).then((r: any) => r.rowCount === 1));
  A('非法跃迁 rejected→approved 被触发器拒(23514)',
    await errCode(() => asPrincipal(pool, CURATOR, (c) => c.query("UPDATE qbank_source SET status='approved' WHERE id='S2'"))) === CHK);

  section('② 跨租户投毒隔离(最高危,ERRCODE 收窄)');
  // (a) 插入即 approved —— 自审批(RLS WITH CHECK 拒)
  A('候选人 INSERT status=approved → RLS WITH CHECK 拒(42501,不能自审批)',
    await errCode(() => asPrincipal(pool, CAND, (c) => c.query(
      "INSERT INTO qbank_source(id,kind,content_hash,status,added_by) VALUES ('EVIL','manual','hEvil2','approved',$1)", [CAND]))) === RLS);
  // (b) 越权审核:候选人 UPDATE 自己的 pending 源为 approved → RLS USING 假 → 0 行(不抛错,改不动)
  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S3', 'hashC'));
  A('候选人 UPDATE pending→approved → RLS USING 假, 0 行(改不动 status)',
    ((await asPrincipal(pool, CAND, (c) => review(c, 'S3', 'pending', 'approved'))) as any).rowCount === 0);
  A('S3 仍是 pending(投毒未生效)', await asPrincipal(pool, CURATOR, (c) => statusOf(c, 'S3')) === 'pending');
  // (c) 非 curator 塞池 —— 两条门分别打:
  //   c1) 用 pending 源 → BEFORE 触发器先于 RLS 触发 → 23514(未 approved 门)
  A('候选人促 pending 源(S3)进池 → 触发器先拒(23514,未 approved)',
    await errCode(() => asPrincipal(pool, CAND, (c) => c.query(promoteSQL, ['P_C1', 'S3', 'ref_c1', 'hashC']))) === CHK);
  //   c2) 用 approved 源(S1)→ 触发器放行 → 只剩 RLS WITH CHECK → 42501(非 curator 池门,单独打出)
  A('候选人促 approved 源(S1)进池 → RLS WITH CHECK 拒(42501,非 curator 塞不进全局池)',
    await errCode(() => asPrincipal(pool, CAND, (c) => c.query(promoteSQL, ['P_C2', 'S1', 'ref_c2', 'hashA']))) === RLS);
  // (d) 自提权为 curator(无 INSERT 授权)
  A('候选人 INSERT qbank_curator(自封 curator) → 无授权拒(42501,信任根不可自封)',
    await errCode(() => asPrincipal(pool, CAND, (c) => c.query('INSERT INTO qbank_curator(user_id) VALUES ($1)', [CAND]))) === RLS);
  // (e) 连 curator 也不能把未 approved 源的内容放进池(结构化门)
  A('curator 促 pending 源(S3)进池 → 触发器拒(23514,未 approved 不得进全局池)',
    await errCode(() => asPrincipal(pool, CURATOR, (c) => c.query(promoteSQL, ['P3', 'S3', 'ref3', 'hashC']))) === CHK);

  section('③ approved-only 视图:未审/被撤销不在候选 + 池表禁止直读(结构保证)');
  await asPrincipal(pool, CURATOR, (c) => c.query(promoteSQL, ['P1', 'S1', 'ref_s1', 'hashA']));        // approved S1 进池
  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S5', 'hashE'));
  await asPrincipal(pool, CURATOR, (c) => review(c, 'S5', 'pending', 'approved'));
  await asPrincipal(pool, CURATOR, (c) => c.query(promoteSQL, ['P5', 'S5', 'ref_s5', 'hashE']));        // approved S5 进池
  const direct = (a: string) => asPrincipal(pool, a, (c) => c.query('SELECT ref_id FROM qbank_pool_entry'))
    .then((r) => r.rows.map((x: any) => x.ref_id).sort());
  let cands = (await asPrincipal(pool, CAND2, (c) => c.query(candidatesSQL))).rows.map((r) => r.ref_id).sort();
  A('候选(视图)=两条 approved 源的块(ref_s1+ref_s5),pending(S3)不在', cands.length === 2 && cands[0] === 'ref_s1' && cands[1] === 'ref_s5');
  A('池表直读经 RLS 只暴露 approved 源条目(与视图一致,非查询自觉)',
    await direct(CAND2).then((d) => d.length === 2 && d[0] === 'ref_s1' && d[1] === 'ref_s5'));
  // 撤销 S1:approved→rejected → 其块即时从视图与直读双双消失(池条目 P1 仍在也不召回 → 真过滤,非"从没插入")
  A('撤销 S1: approved→rejected 生效',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S1', 'approved', 'rejected')).then((r: any) => r.rowCount === 1));
  A('P1 池条目仍在(未删,超级用户绕 RLS 可见)', (await pool.query("SELECT count(*)::int n FROM qbank_pool_entry WHERE id='P1'")).rows[0].n === 1);
  cands = (await asPrincipal(pool, CAND2, (c) => c.query(candidatesSQL))).rows.map((r) => r.ref_id);
  A('撤销后候选(视图)只剩 ref_s5(被撤销源的块即时剔除,即便池行仍在)', cands.length === 1 && cands[0] === 'ref_s5');
  A('撤销后池表直读也只剩 ref_s5(RLS 结构过滤,不靠查询自觉)',
    await direct(CAND2).then((d) => d.length === 1 && d[0] === 'ref_s5'));

  section('④ content_hash 去重防重复投毒 + 无幽灵 id + 被拒 hash 不永久占坑');
  const dup: any = await asPrincipal(pool, CAND2, (c) => propose(c, CAND2, 'S5_DUP', 'hashE'));   // 别人重投同活跃内容
  const h5: any = (await pool.query("SELECT count(*)::int n, min(added_by) ab FROM qbank_source WHERE content_hash='hashE'")).rows[0];
  A('重复投同活跃 content_hash → ON CONFLICT DO NOTHING(不新增行)', dup.rowCount === 0 && h5.n === 1);
  A('既有源不被劫持(added_by 仍是原提议者 cand1)', h5.ab === CAND);
  // 无幽灵 id:他人 pending 源被 RLS 挡成不可见时,去重回退经 SECURITY DEFINER 反查真既有 id(非未落库的传入 id)
  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S6', 'hashF'));                    // cand1 的 pending 源(cand2 不可见)
  const conflict: any = await asPrincipal(pool, CAND2, (c) => propose(c, CAND2, 'S6_PHANTOM', 'hashF'));
  const resolved = ((await asPrincipal(pool, CAND2, (c) => c.query('SELECT qbank_active_source_id($1) AS id', ['hashF']))) as any).rows[0]?.id;
  A('命中去重回退取到真既有源 id(S6),非传入的幽灵 id(S6_PHANTOM 从未落库)',
    conflict.rowCount === 0 && resolved === 'S6' &&
    (await pool.query("SELECT count(*)::int n FROM qbank_source WHERE id='S6_PHANTOM'")).rows[0].n === 0);
  // 被拒 hash 不永久占坑:hashB(S2 已 rejected)可被重新提议成新活跃源(partial unique 排除 rejected)
  const reproposed: any = await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S2B', 'hashB'));
  A('被拒的 hashB 可重新提议成活跃源(误拒不造成永久 DoS)',
    reproposed.rowCount === 1 &&
    (await pool.query("SELECT count(*)::int n FROM qbank_source WHERE content_hash='hashB' AND status<>'rejected'")).rows[0].n === 1);

  section('公共读边界:approved 源公开可读 / pending 对他人不可见');
  A('他人(cand2)能读到 approved 源 S5(=已进策展目录, 公共读)',
    (await asPrincipal(pool, CAND2, (c) => c.query("SELECT 1 FROM qbank_source WHERE id='S5'"))).rowCount === 1);
  A('他人(cand2)读不到 cand1 的 pending 源 S3(未审核不外泄)',
    (await asPrincipal(pool, CAND2, (c) => c.query("SELECT 1 FROM qbank_source WHERE id='S3'"))).rowCount === 0);

  section('⑤ 检索接管:0016 关 open 基线的直写/删/改-劫持洞 + annSearch 只召回可信可见集(含碰撞/撤销/属主前置)');
  // 策展治理通道(a):approved 源 SA + 促其块 qr_a 进池。
  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'SA', 'hashSA'));
  await asPrincipal(pool, CURATOR, (c) => review(c, 'SA', 'pending', 'approved'));
  await asPrincipal(pool, CURATOR, (c) => c.query(promoteSQL, ['PA', 'SA', 'qr_a', 'hashSA']));

  const eA = embed(101), eDirect = embed(202), ePoison = embed(303), eAttacker = embed(404);
  // —— 隔离 0016 的 delta:先回到 0001_baseline 的 OPEN 写策略,证明洞真实存在,再由 0016 开→闭。
  //    (否则 setup 已加载 06 的收紧策略,写门测试会假绿:即便删掉 0016 ① 也仍绿。)
  await pool.query(`
    DROP POLICY IF EXISTS p_vchunk_read ON vector_chunk;   DROP POLICY IF EXISTS p_vchunk_insert ON vector_chunk;
    DROP POLICY IF EXISTS p_vchunk_update ON vector_chunk; DROP POLICY IF EXISTS p_vchunk_delete ON vector_chunk;
    DROP POLICY IF EXISTS p_owner ON vector_chunk;
    CREATE POLICY p_owner ON vector_chunk
      USING (kind='qbank' OR owner_user_id = current_setting('app.principal_user', true))
      WITH CHECK (owner_user_id = current_setting('app.principal_user', true));`);
  // OPEN 态:候选人直写 qbank 投毒块"能成功"(证洞真实)——含一条 ref 撞将来 approved ref 'qr_a' 的碰撞投毒块(用攻击者向量)。
  const openWrite = await errCode(() => asPrincipal(pool, CAND, (c) => c.query(
    `INSERT INTO vector_chunk(id,owner_user_id,kind,ref_id,content_hash,embedding)
       VALUES ('lp1',$1,'qbank','qr_poison','hlp1',$2::vector),('lp2',$1,'qbank','qr_a','hlp2',$3::vector)`,
    [CAND, `[${ePoison.join(',')}]`, `[${eAttacker.join(',')}]`])));
  A('OPEN 基线:候选人直写 kind=qbank 投毒块能成功(洞真实,不是本来就写不进)',
    openWrite === null && (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE owner_user_id=$1 AND kind='qbank'", [CAND])).rows[0].n === 2);

  // —— 应用 0016(拆策略收紧写/改/删 + 建可信可见集视图 + 属主可绕 RLS 硬前置)。
  await pool.query({ text: sql('../migrations/0016_qbank_retrieval_takeover.sql') });

  // 属主可绕 RLS 前置(0016 DO 块已强制;此处显式复证:lane(b) 撤销正确性钉在此不变量上)。
  A('qbank_visible_ref 属主具 rolsuper/rolbypassrls(lane(b) NOT EXISTS 能看到被撤销池条目 → 撤销才生效)',
    (await pool.query(`SELECT bool_or(rolsuper OR rolbypassrls) ok FROM pg_roles
       WHERE rolname = (SELECT viewowner FROM pg_views WHERE viewname='qbank_visible_ref')`)).rows[0].ok === true);

  // 合法灌库:系统 principal 写策展块 qr_a(有池条目,与碰撞投毒块同 ref 不同 owner)+ 直灌块 qr_direct(无池条目)。
  await asPrincipal(pool, QOWNER, async (c) => {
    await upsertVectorChunk(c, QOWNER, { id: 'vqa', kind: 'qbank', refId: 'qr_a', contentHash: 'hva', embedding: eA });
    await upsertVectorChunk(c, QOWNER, { id: 'vqd', kind: 'qbank', refId: 'qr_direct', contentHash: 'hvd', embedding: eDirect });
  });

  // (a) 0016 后:直写投毒被写门拒(42501)——证明是 0016 把 open→闭。
  A('0016 后:候选人直写 kind=qbank → 写门拒(42501,本迁移把 OPEN 洞关上)',
    await errCode(() => asPrincipal(pool, CAND, (c) => c.query(
      "INSERT INTO vector_chunk(id,owner_user_id,kind,ref_id,content_hash,embedding) VALUES ('evil',$1,'qbank','qr_evil','hevil',$2::vector)",
      [CAND, `[${eA.join(',')}]`]))) === RLS);
  A('该投毒块未落库(vector_chunk 无 ref=qr_evil 行)',
    (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE ref_id='qr_evil'")).rows[0].n === 0);

  // (a2) DELETE 清库防护 + (a3) UPDATE 劫持防护(旧单条策略把 qbank 公共读泄漏到 USING → 任意用户可删/劫持共享题库)。
  A('候选人 DELETE ... WHERE kind=qbank → 0 行(RLS 行选择挡下,封死任意用户清空共享题库)',
    (await asPrincipal(pool, CAND, (c) => c.query("DELETE FROM vector_chunk WHERE kind='qbank'"))).rowCount === 0);
  A('候选人 UPDATE 系统 qbank 行夺 owner → 0 行(USING 挡下,不能劫持共享题库)',
    (await asPrincipal(pool, CAND, (c) => c.query("UPDATE vector_chunk SET owner_user_id=$1 WHERE ref_id='qr_direct'", [CAND]))).rowCount === 0);
  A('清库/劫持均未生效:系统 qbank 块仍 2 条',
    (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE owner_user_id=$1 AND kind='qbank'", [QOWNER])).rows[0].n === 2);

  // (b) annSearch 只召回可信可见集:残留 + 碰撞投毒块被读侧剔除。
  A('残留投毒 qr_poison + 碰撞投毒(owner=候选人,ref=qr_a)确在库(证下面是真剔除)',
    (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE owner_user_id=$1 AND kind='qbank'", [CAND])).rows[0].n === 2);
  const nearPoison = (await asPrincipal(pool, CAND2, (c) => annSearch(c, CAND2, 'qbank', ePoison, 5))).map((h) => h.refId);
  A('annSearch 剔除残留投毒 qr_poison(非系统 owner、非 approved 池)', !nearPoison.includes('qr_poison'));
  A('annSearch 结果 ⊆ 可信可见集 {qr_a,qr_direct}', nearPoison.length > 0 && nearPoison.every((r) => r === 'qr_a' || r === 'qr_direct'));
  // 碰撞防线:查询贴近攻击者向量;仅按 ref_id JOIN 会带出攻击者行(dist≈0),叠 owner 过滤后只剩系统 qr_a(dist≈系统向量,远)。
  const collide = (await asPrincipal(pool, CAND2, (c) => annSearch(c, CAND2, 'qbank', eAttacker, 5))).find((h) => h.refId === 'qr_a');
  A('碰撞投毒:查贴近攻击者向量,qr_a 仍以系统块向量返回(dist 非≈0),攻击者向量未被 JOIN 带出',
    !!collide && collide.distance > 0.5);
  A('approved 策展块正常召回(查 eA → 命中 qr_a)',
    (await asPrincipal(pool, CAND2, (c) => annSearch(c, CAND2, 'qbank', eA, 5))).some((h) => h.refId === 'qr_a'));
  A('可信直灌块正常召回(查 eDirect → 命中 qr_direct)',
    (await asPrincipal(pool, CAND2, (c) => annSearch(c, CAND2, 'qbank', eDirect, 5))).some((h) => h.refId === 'qr_direct'));

  // (c) 撤销源即时消失(先/后复证块仍在库,排除"消失=被删")。
  A('撤销前系统 qr_a 块确在库',
    (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE owner_user_id=$1 AND ref_id='qr_a'", [QOWNER])).rows[0].n === 1);
  A('撤销 SA(approved→rejected)生效',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'SA', 'approved', 'rejected')).then((r: any) => r.rowCount === 1));
  A('撤销后系统 qr_a 块仍在库(未删,证下面是求交剔除)',
    (await pool.query("SELECT count(*)::int n FROM vector_chunk WHERE owner_user_id=$1 AND ref_id='qr_a'", [QOWNER])).rows[0].n === 1);
  A('撤销后 qr_a 即时从 annSearch 消失(出 approved 池;有池条目故不落直灌通道漏召回)',
    !(await asPrincipal(pool, CAND2, (c) => annSearch(c, CAND2, 'qbank', eA, 5))).some((h) => h.refId === 'qr_a'));
  A('撤销不影响可信直灌块 qr_direct(仍正常召回)',
    (await asPrincipal(pool, CAND2, (c) => annSearch(c, CAND2, 'qbank', eDirect, 5))).some((h) => h.refId === 'qr_direct'));

  // (d) 其它 kind 零影响:memory 仍各用户自写 + owner 私有隔离,annSearch(memory) 行为不变。
  await asPrincipal(pool, CAND, (c) => upsertVectorChunk(c, CAND, { id: 'mem1', kind: 'memory', refId: 'mem_c1', contentHash: 'hmc1', embedding: eA }));
  A('候选人可写自己的 memory 块(写门只收 qbank,未误伤 memory)',
    (await asPrincipal(pool, CAND, (c) => annSearch(c, CAND, 'memory', eA, 5))).some((h) => h.refId === 'mem_c1'));
  A('memory 私有:cand2 检索不到 cand1 的 memory(其它 kind 隔离与召回不变)',
    (await asPrincipal(pool, CAND2, (c) => annSearch(c, CAND2, 'memory', eA, 5))).length === 0);

  console.log(`\n${fail === 0 ? '✓ qbank 策展源表 + 审核门 + 投毒隔离 全部通过' : '✗ ' + fail + ' 项失败'}`);
  await pool.end();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
