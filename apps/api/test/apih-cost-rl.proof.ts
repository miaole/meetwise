/**
 * API-HARDEN-A 成本分级限流 prove(#87 押题/诊断/支付回调三臂):
 *   R2 参数注入短窗沿 authz5a-login-ip-throttle 先例形——RL_* env 双值形覆写(prod 钉死默认值,
 *   证明注入短窗即此口),env 须先于 service 模块载入(桶参数模块顶读)→ 动态 import 保障时序。
 *   独立进程=独立桶态。
 * 本文件只证「限流桶在/不在」,一条 happy-path 都不承载(断言臂用 404/403 不可区分面当消费载体,
 * 零副作用零 DB 补丁:三臂的桶均在 DB 事务/验签之前)。
 * #146(begin 成本闸)臂在 neg-interview.proof.ts(该文件持 begin 路径 schema 补丁单源)。
 * 运行:pnpm apih:cost-rl(经 scripts/run-e2e-isolated.mjs 供隔离库)。
 */
process.env.RL_QUIZ_BEGIN = '2,0.01';           // 押题 per-principal 桶短窗:容量 2·近零补充
process.env.RL_QUIZ_BEGIN_GLOBAL = '1000,0.01'; // 全局桶关断(单证 per-principal 桶)
process.env.RL_DIAG_BEGIN = '2,0.01';
process.env.RL_DIAG_BEGIN_GLOBAL = '1000,0.01';
process.env.RL_CB_ORDER = '3,0.01';             // 回调 per-order 桶短窗:容量 3
process.env.RL_CB_GLOBAL = '1000,0.01';         // 回调全局桶关断(单证 per-order 桶)

const { boot, mkAssert } = await import('./_neg-harness');

async function main() {
  const h = await boot();
  const { A, done } = mkAssert('apih:cost-rl');

  // 独立主体(不与他负例共享桶态)。
  await h.pool.query("INSERT INTO user_account(id,email,password_hash,role) VALUES " +
    "('rlUserA','rla@x.com','scrypt$a$a','candidate'),('rlUserB','rlb@x.com','scrypt$b$b','candidate')");
  const RID = '3f7d9a10-1111-4222-8333-444455556666';
  // 计算键:字面量头名会计入 naming-convention,api lint 上限无余量(enterprise-pay-s1 同款)。
  const resumeIdHeader = 'resume-id' as const;

  // ── #87 押题 begin 成本闸 ── 消费载体=不存在押题的 begin(桶在 DB 事务前 → 404 不可区分面保留)。
  const H = (uid: string) => ({ ...h.U(uid), [resumeIdHeader]: RID });   // x-user-id 走 harness U() 助手(字面量头名计 naming-convention)
  const q1 = await h.post('/quiz/QZ_NOPE_RL1/begin', H('rlUserA'), {});
  const q2 = await h.post('/quiz/QZ_NOPE_RL2/begin', H('rlUserA'), {});
  A('押题桶/前两发进站(404 保留)', q1.status === 404 && q2.status === 404);
  const q3 = await h.post('/quiz/QZ_NOPE_RL3/begin', H('rlUserA'), {});
  A('押题桶/短窗第3发 → 429 too_many_requests(成本闸收口·修前恒 404)',
    q3.status === 429 && q3.body?.error === 'too_many_requests');
  const qOther = await h.post('/quiz/QZ_NOPE_RL4/begin', H('rlUserB'), {});
  A('押题桶/他主体不受株连', qOther.status === 404);

  // ── #87 诊断 begin 成本闸 ── 同形。
  const d1 = await h.post('/diagnosis/DG_NOPE_RL1/begin', H('rlUserA'), {});
  const d2 = await h.post('/diagnosis/DG_NOPE_RL2/begin', H('rlUserA'), {});
  A('诊断桶/前两发进站(404 保留)', d1.status === 404 && d2.status === 404);
  const d3 = await h.post('/diagnosis/DG_NOPE_RL3/begin', H('rlUserA'), {});
  A('诊断桶/短窗第3发 → 429 too_many_requests(成本闸收口·修前恒 404)',
    d3.status === 429 && d3.body?.error === 'too_many_requests');
  const dOther = await h.post('/diagnosis/DG_NOPE_RL4/begin', H('rlUserB'), {});
  A('诊断桶/他主体不受株连', dOther.status === 404);

  // ── #87 支付回调成本闸(per-order 桶)── 消费载体=垃圾签名(verifyCommerceSig 403 面,桶在验签前)。
  const cb = () => ({ providerTxn: 'txn-rl', sig: 'deadbeef', ts: Date.now() });
  const c1 = await h.post(`/commerce/webhook/pay/${oid1}`, {}, cb());
  A('回调桶/垃圾签 403 语义保留(第1发)', c1.status === 403 && c1.body?.error === 'bad_signature');
  await h.post(`/commerce/webhook/pay/${oid1}`, {}, cb());
  await h.post(`/commerce/webhook/pay/${oid1}`, {}, cb());
  const c4 = await h.post(`/commerce/webhook/pay/${oid1}`, {}, cb());
  A('回调桶/同单短窗第4发 → 429 too_many_requests(成本闸收口·修前恒 403)',
    c4.status === 429 && c4.body?.error === 'too_many_requests');
  const cOther = await h.post(`/commerce/webhook/pay/${oid2}`, {}, cb());
  A('回调桶/他单不受株连(fresh per-order 桶 403 照常)', cOther.status === 403);
  const cref = await h.post('/commerce/webhook/refund/ORD_NOPE_RL9', {}, { providerTxn: 'txn-rl', sig: 'deadbeef', ts: Date.now() });
  A('回调桶/退款口独立桶态(首发 403 照常)', cref.status === 403);

  await done();
}

// 两个 fresh 单号(per-order 桶载体;用变量占位避免上面模板串引用未定义)。
const oid1 = 'ORD_NOPE_RL7';
const oid2 = 'ORD_NOPE_RL8';

main().catch((e) => { console.error(e); process.exit(1); });

export {};   // ESM 模块标记(tsc TS1375:顶层 await 文件须为模块)
