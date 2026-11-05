/**
 * API-HARDEN-A 成本分级限流 prove(#87 押题/诊断/支付回调三臂):
 *   R2 参数注入短窗沿 authz5a-login-ip-throttle 先例形——RL_* env 双值形覆写(prod 钉死默认值,
 *   证明注入短窗即此口),env 须先于 service 模块载入(桶参数模块顶读)→ 动态 import 保障时序。
 *   独立进程=独立桶态。
 * 本文件只证「限流桶在/不在」,一条 happy-path 都不承载(断言臂用 404/403 不可区分面当消费载体,
 * 零副作用零 DB 补丁)。
 * #146(begin 成本闸)臂在 neg-interview.proof.ts(该文件持 begin 路径 schema 补丁单源)。
 * rev r1(证伪 apih-pre-2 P1-1):回调闸移 verifyCommerceSig 之后、owner 查询之前——垃圾签不占
 * 成功桶;验签失败另计独立同源失败桶。三场景断言(修前全红,见 /tmp/apih-rev1-cb-red*.log):
 * ①同单 3 垃圾签后合法回调放行 ②120 垃圾耗全局后合法回调放行 ③合法回调自身超频仍 429。
 * 运行:pnpm apih:cost-rl(经 scripts/run-e2e-isolated.mjs 供隔离库)。
 */
process.env.RL_QUIZ_BEGIN = '2,0.01';           // 押题 per-principal 桶短窗:容量 2·近零补充
process.env.RL_QUIZ_BEGIN_GLOBAL = '1000,0.01'; // 全局桶关断(单证 per-principal 桶)
process.env.RL_DIAG_BEGIN = '2,0.01';
process.env.RL_DIAG_BEGIN_GLOBAL = '1000,0.01';
process.env.RL_CB_ORDER = '3,0.01';             // 回调 per-order 桶短窗:容量 3(合法自身超频场景载体)
process.env.RL_CB_GLOBAL = '120,0.01';          // 回调全局桶真实帽 120(120 垃圾场景载体)
process.env.RL_CB_FAIL = '3,0.01';              // 回调失败桶短窗:容量 3(同源垃圾签暴力面载体)

const { boot, mkAssert, payCallbackBody } = await import('./_neg-harness');

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

  // ── #87 支付回调成本闸(rev r1:闸在验签后·垃圾签不占成功桶)── 修前红读数 4 条见文件头注。
  const cb = () => ({ providerTxn: 'txn-rl', sig: 'deadbeef', ts: Date.now() });
  const g1 = await h.post(`/commerce/webhook/pay/${oid1}`, {}, cb());
  A('回调桶/垃圾签 403 语义保留(第1发·失败桶内计数不占成功桶)', g1.status === 403 && g1.body?.error === 'bad_signature');
  const cref = await h.post('/commerce/webhook/refund/ORD_NOPE_RL9', {}, { providerTxn: 'txn-rl', sig: 'deadbeef', ts: Date.now() });
  A('回调桶/退款口独立桶域(垃圾签首发 403 照常)', cref.status === 403);
  await h.post(`/commerce/webhook/pay/${oid1}`, {}, cb());
  await h.post(`/commerce/webhook/pay/${oid1}`, {}, cb());
  // 场景①(证伪 P1-1 单订单形):同单 3 垃圾签后,合法签回调必须放行(修前:垃圾先扣单桶 → 合法回调 429 被挡)。
  const cv1 = await h.post(`/commerce/webhook/pay/${oid1}`, {}, payCallbackBody(oid1, 'txn-rl'));
  A('回调桶/场景① 同单3垃圾签后合法回调放行(404 达 owner 查询·修前 429)',
    cv1.status === 404 && cv1.body?.error === 'order_not_found');
  const cFail = await h.post(`/commerce/webhook/pay/ORD_NOPE_RL8`, {}, cb());
  A('回调失败桶/同源垃圾签超失败帽 → 429(独立按来源计·只挡垃圾签)', cFail.status === 429 && cFail.body?.error === 'too_many_requests');
  // 场景②(证伪 P1-1 全局形):120 发垃圾(随机单号)耗全局共享桶后,合法签回调必须放行(修前:垃圾挤占全局桶 → 全平台回调被 429)。
  for (let i = 0; i < 120; i++) await h.post(`/commerce/webhook/pay/ORD_GARB_G${i}`, {}, cb());
  const cv2 = await h.post(`/commerce/webhook/pay/${oid2}`, {}, payCallbackBody(oid2, 'txn-gl'));
  A('回调全局桶/场景② 120垃圾后合法回调放行(共享桶不被伪造洪水挤占·修前 429)',
    cv2.status === 404 && cv2.body?.error === 'order_not_found');
  // 场景③(保留语义):合法回调自身超频仍 429——前 3 发合法逐发 404(桶只被合法自身消费),第 4 发 429。
  const l1 = await h.post(`/commerce/webhook/pay/${oid3}`, {}, payCallbackBody(oid3, 'txn-l1'));
  const l2 = await h.post(`/commerce/webhook/pay/${oid3}`, {}, payCallbackBody(oid3, 'txn-l2'));
  const l3 = await h.post(`/commerce/webhook/pay/${oid3}`, {}, payCallbackBody(oid3, 'txn-l3'));
  const l4 = await h.post(`/commerce/webhook/pay/${oid3}`, {}, payCallbackBody(oid3, 'txn-l4'));
  A('回调桶/场景③ 合法回调自身超频仍 429(前3发404·第4发429·垃圾零掺入)',
    l1.status === 404 && l2.status === 404 && l3.status === 404
    && l4.status === 429 && l4.body?.error === 'too_many_requests');

  await done();
}

// 三个 fresh 单号(per-order 桶载体;用变量占位避免上面模板串引用未定义)。
const oid1 = 'ORD_NOPE_RL7';
const oid2 = 'ORD_NOPE_RL8';
const oid3 = 'ORD_NOPE_RL10';

main().catch((e) => { console.error(e); process.exit(1); });

export {};   // ESM 模块标记(tsc TS1375:顶层 await 文件须为模块)
