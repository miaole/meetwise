/**
 * qbank 策展源表 + 审核门 + 跨租户投毒隔离证明(真 Postgres)。对齐 apps/worker/src/qbank-curation.ts 的门 SQL,
 * 但**在 DB 层直证**(RLS + 触发器 + CAS + 视图才是安全源头,绕过 TS 包装照样被挡)。
 *
 * 诚实边界:本证明证的是**策展门本身**(源状态机 + 审核授权 + 投毒隔离 + approved-only 池视图)。
 *   它**不**证旧检索路径 annSearch(kind='qbank' 直读 vector_chunk)——那条路尚未接管本门(见 0013 文末 TODO),
 *   在接管前旧 vector_chunk 直写洞仍在。此处 candidatesSQL 用的是本门的 approved-only 视图,不是生产 annSearch。
 *
 *   pnpm qbank-source:prove   (需 pnpm db:up)
 *
 * 断言:① 源状态机(合法跃迁 / 非法跃迁+关键列篡改被拒 / 陈旧 CAS 落败);
 *      ② 跨租户投毒隔离(自审批 / 越权审核 / 非 curator 塞池[RLS 与触发器两条门分别打] / 自封 curator 全被拒);
 *      ③ approved-only 视图:未审/被撤销内容不在候选,池表禁止直读(结构保证);
 *      ④ content_hash 去重防重复投毒 + 无幽灵 id + 被拒 hash 不永久占坑。
 * 断言用 ERRCODE 收窄(23514=触发器 check / 42501=RLS·权限),避免"任何错都算门生效"的假绿。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal } from '../src/index.ts';

const pool = createPool();
let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sql = (f: string) => readFileSync(fileURLToPath(new URL(f, import.meta.url)), 'utf8');

const CURATOR = 'curator1', CAND = 'cand1', CAND2 = 'cand2';

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
  await pool.query(sql('../sql/01_schema.sql'));                 // app_role + RLS 基座
  // 测试台重建(仅证明用,非迁移的一部分):qbank_* 不在 01_schema,持久库跨 schema 改动需先拆,
  // 否则迁移的 CREATE TABLE IF NOT EXISTS 会静默跳过旧异构表 → 约束不更新。生产迁移保持非破坏(IF NOT EXISTS)。
  await pool.query(`DROP VIEW IF EXISTS qbank_retrieval_candidate CASCADE;
    DROP TABLE IF EXISTS qbank_pool_entry, qbank_source, qbank_curator CASCADE;
    DROP FUNCTION IF EXISTS qbank_is_curator(), qbank_active_source_id(text),
      qbank_source_guard_update(), qbank_pool_requires_approved() CASCADE;`);
  await pool.query({ text: sql('../migrations/0013_qbank_source.sql') });   // 源表 + 门(被测对象)
  // 授权根:curator 由超级用户 seed(setup 路径),app_role 无权自封。
  await pool.query('INSERT INTO qbank_curator(user_id) VALUES ($1) ON CONFLICT DO NOTHING', [CURATOR]);

  section('① 审核状态机:合法跃迁 / 非法跃迁+关键列篡改被拒 / 陈旧 CAS 落败');
  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S1', 'hashA'));
  A('候选人提议源 → 落 pending, added_by=自己',
    await asPrincipal(pool, CURATOR, (c) => c.query("SELECT status,added_by FROM qbank_source WHERE id='S1'"))
      .then((r) => r.rows[0].status === 'pending' && r.rows[0].added_by === CAND));
  A('curator: pending→approved 生效(CAS 1 行)',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S1', 'pending', 'approved')).then((r) => r.rowCount === 1));
  A('curator: 已 approved 再传 from=pending → 陈旧 CAS 落败(0 行)',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S1', 'pending', 'approved')).then((r) => r.rowCount === 0));
  A('非法跃迁 approved→pending 被触发器拒(23514)',
    await errCode(() => asPrincipal(pool, CURATOR, (c) => c.query("UPDATE qbank_source SET status='pending' WHERE id='S1'"))) === CHK);
  A('关键列篡改:curator 借审核 UPDATE 改 content_hash 被触发器拒(23514,内容不可偷换)',
    await errCode(() => asPrincipal(pool, CURATOR, (c) => c.query("UPDATE qbank_source SET content_hash='hEvil' WHERE id='S1'"))) === CHK);

  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S2', 'hashB'));
  A('curator: pending→rejected 生效',
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S2', 'pending', 'rejected')).then((r) => r.rowCount === 1));
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
    (await asPrincipal(pool, CAND, (c) => review(c, 'S3', 'pending', 'approved'))).rowCount === 0);
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
    await asPrincipal(pool, CURATOR, (c) => review(c, 'S1', 'approved', 'rejected')).then((r) => r.rowCount === 1));
  A('P1 池条目仍在(未删,超级用户绕 RLS 可见)', (await pool.query("SELECT count(*)::int n FROM qbank_pool_entry WHERE id='P1'")).rows[0].n === 1);
  cands = (await asPrincipal(pool, CAND2, (c) => c.query(candidatesSQL))).rows.map((r) => r.ref_id);
  A('撤销后候选(视图)只剩 ref_s5(被撤销源的块即时剔除,即便池行仍在)', cands.length === 1 && cands[0] === 'ref_s5');
  A('撤销后池表直读也只剩 ref_s5(RLS 结构过滤,不靠查询自觉)',
    await direct(CAND2).then((d) => d.length === 1 && d[0] === 'ref_s5'));

  section('④ content_hash 去重防重复投毒 + 无幽灵 id + 被拒 hash 不永久占坑');
  const dup = await asPrincipal(pool, CAND2, (c) => propose(c, CAND2, 'S5_DUP', 'hashE'));   // 别人重投同活跃内容
  const h5 = (await pool.query("SELECT count(*)::int n, min(added_by) ab FROM qbank_source WHERE content_hash='hashE'")).rows[0];
  A('重复投同活跃 content_hash → ON CONFLICT DO NOTHING(不新增行)', dup.rowCount === 0 && h5.n === 1);
  A('既有源不被劫持(added_by 仍是原提议者 cand1)', h5.ab === CAND);
  // 无幽灵 id:他人 pending 源被 RLS 挡成不可见时,去重回退经 SECURITY DEFINER 反查真既有 id(非未落库的传入 id)
  await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S6', 'hashF'));                    // cand1 的 pending 源(cand2 不可见)
  const conflict = await asPrincipal(pool, CAND2, (c) => propose(c, CAND2, 'S6_PHANTOM', 'hashF'));
  const resolved = (await asPrincipal(pool, CAND2, (c) => c.query('SELECT qbank_active_source_id($1) AS id', ['hashF']))).rows[0].id;
  A('命中去重回退取到真既有源 id(S6),非传入的幽灵 id(S6_PHANTOM 从未落库)',
    conflict.rowCount === 0 && resolved === 'S6' &&
    (await pool.query("SELECT count(*)::int n FROM qbank_source WHERE id='S6_PHANTOM'")).rows[0].n === 0);
  // 被拒 hash 不永久占坑:hashB(S2 已 rejected)可被重新提议成新活跃源(partial unique 排除 rejected)
  const reproposed = await asPrincipal(pool, CAND, (c) => propose(c, CAND, 'S2B', 'hashB'));
  A('被拒的 hashB 可重新提议成活跃源(误拒不造成永久 DoS)',
    reproposed.rowCount === 1 &&
    (await pool.query("SELECT count(*)::int n FROM qbank_source WHERE content_hash='hashB' AND status<>'rejected'")).rows[0].n === 1);

  section('公共读边界:approved 源公开可读 / pending 对他人不可见');
  A('他人(cand2)能读到 approved 源 S5(=已进策展目录, 公共读)',
    (await asPrincipal(pool, CAND2, (c) => c.query("SELECT 1 FROM qbank_source WHERE id='S5'"))).rowCount === 1);
  A('他人(cand2)读不到 cand1 的 pending 源 S3(未审核不外泄)',
    (await asPrincipal(pool, CAND2, (c) => c.query("SELECT 1 FROM qbank_source WHERE id='S3'"))).rowCount === 0);

  console.log(`\n${fail === 0 ? '✓ qbank 策展源表 + 审核门 + 投毒隔离 全部通过' : '✗ ' + fail + ' 项失败'}`);
  await pool.end();
  process.exit(fail === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
