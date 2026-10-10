/**
 * uc-e2e-011-adv-refund-callback.proof.ts — NHP-011-ADV-01 · UC-E2E-011 ADV 列 ·
 * refund-callback 错签/重放 real-evidence prove（Line V）。
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - non-happy-path-perf-load-case-matrix.md:58 NHP-011-ADV-01「refund-callback 错签/重放 | 拒；无双退 | gap→case-only | 产品口缺失 = 仍 gap 执行面」
 *  - e2e-requirement-coverage-matrix.md:117 ADV gap / case-only；「缺 refund-callback；ADV=case-only（NHP-011-ADV-01）；≠ covered」
 *  - e2e-scenarios.md E3/A3/TC-E2E-011-refund-idem：契约 POST /payment/refund-callback；重复退款回调仅退一次
 *  - harness/nhp-011-adv-01-real-evidence.md：A1 错签拒+无双退 · A2 重放幂等安全；口仍 404 → EXIT1 + 双 GAP；Ban wash 404=pass
 *  - model-op C-1：具名 status/error 仅在产品口落地后钉；口仍 404 保持 EXIT1 诚实
 *
 * 产品事实基线（本树读码）：
 *  - POST /payment/refund-callback · POST /commerce/webhook/refund/:id · POST /commerce/orders/:id/refund-callback → 运行时 404
 *  - commerce-webhook.controller.ts 仅 @Post('pay/:id')；commerce.service 无 refundCallback/refundWebhook
 *  - packages/db/src/payment.ts 仅 createOrder/getOrder/markOrderPaidAndCredit；无 markOrderRefunded
 *  - H4/H5（uc-e2e-011-report-refund-http.proof.ts）已钉 GAP-UC011-REFUND-CALLBACK；本刀不互借关闭产品口
 *
 * EXIT 契约：
 *  - EXIT 0 ⇔ A1+A2 真证据成立：具名非-404 可解释拒签/重放响应 + DB before/after 无双退。
 *    EXIT0 ≠ UC-011 covered ≠ ADV auto-partial；coveredCount=8；须 post-prove dual + 协调方 nail。
 *  - EXIT 1 = 口缺失（404 UNREACHABLE）或断言不成立。打印 GAP-UC011-ADV-01 + GAP-UC011-REFUND-CALLBACK。
 *    Ban 把 404 洗成 A1「拒=pass」· Ban invent 产品口 · Ban retry-to-green · Ban flake 标签。
 *
 * 隔离：pnpm uc011:adv:prove → run-e2e-isolated → apps/api prove:uc011-adv-refund-callback；
 * _neg-harness boot() 自建 schema；PAY_PROVIDER_SECRET 仅进程环境；Ban MODEL_API_KEY / live。
 * releaseEvidence=false · NOT_HA · PG-retained · DELETE=202 软删受理(purge_pending)。
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boot, paySig } from './_neg-harness';

const CMD = 'pnpm uc011:adv:prove';
const GAP_ADV = 'GAP-UC011-ADV-01';
const GAP_PRODUCT = 'GAP-UC011-REFUND-CALLBACK';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '../../..');
function readRepo(rel: string): string {
  const p = resolve(repoRoot, rel);
  if (!existsSync(p)) throw new Error(`missing ${rel}`);
  return readFileSync(p, 'utf8');
}

type Leg = 'A1' | 'A2' | 'INV';
const failures: { leg: Leg; name: string }[] = [];
let total = 0;
const A = (leg: Leg, name: string, cond: boolean) => {
  total++;
  if (!cond) {
    failures.push({ leg, name });
    console.log(`FAIL  [${leg}] ${name}`);
  } else {
    console.log(`PASS  [${leg}] ${name}`);
  }
};

/** 404（及网关未接线的 405）= 执行面 UNREACHABLE，绝非 ADV「拒签/重放」真证据。 */
function isUnreachable(status: number): boolean {
  return status === 404 || status === 405;
}

/** A1 真证据要求：可解释的验签失败 4xx，且绝不是口缺失 404。C-1：具名 error 码待产品口落地后再钉。 */
function isExplainableRejectNotGap(status: number): boolean {
  return status >= 400 && status < 500 && !isUnreachable(status);
}

(async () => {
  const h = await boot();
  const pool = h.pool;

  console.log('PINS: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=202 软删受理(purge_pending)');
  console.log('EXIT 契约: EXIT 0 ⇔ A1+A2 真证据（拒+无双退 · 非-404）；口 404 → EXIT 1 + 双 GAP。EXIT0 ≠ covered · Ban wash 404=pass。');
  console.log(`CMD=${CMD}`);
  console.log('NOTE: Ban live · Ban MODEL_API_KEY · Ban invent product mouth · Ban 互借关 GAP-UC011-REFUND-CALLBACK');

  // ── INV · 静态库存（产品口缺失前提 · 与 H5 对齐，不发明口）──
  {
    console.log('\n──────── INV · static inventory（refund 产品面）────────');
    const paymentSrc = readRepo('packages/db/src/payment.ts');
    const webhookCtrl = readRepo('apps/api/src/modules/commerce/commerce-webhook.controller.ts');
    const commerceCtrl = readRepo('apps/api/src/modules/commerce/commerce.controller.ts');
    const commerceSvc = readRepo('apps/api/src/modules/commerce/commerce.service.ts');

    A('INV', 'payment.ts 有 markOrderPaidAndCredit（pay 面存在）',
      /export async function markOrderPaidAndCredit\b/.test(paymentSrc));
    A('INV', 'payment.ts 无 markOrderRefunded / refundOrder / applyRefund',
      !/\b(markOrderRefunded|refundOrder|applyRefund|markOrderRefund)\b/.test(paymentSrc));
    A('INV', 'webhook 仅 @Post(pay/:id)，无 refund 路由',
      /@Post\(['"]pay\/:id['"]\)/.test(webhookCtrl) && !/@Post\(['"]refund/i.test(webhookCtrl));
    A('INV', 'commerce.controller 无 refund-callback 路由',
      !/refund-callback|refund\b/i.test(commerceCtrl));
    A('INV', 'commerce.service 无 refundCallback / refundWebhook',
      !/\b(refundCallback|refundWebhook|markOrderRefunded)\b/.test(commerceSvc));
  }

  // ── fixtures：paid 单 + created 单（口若浮出可供 A1/A2；今日 404 时仅服务 before/after 零副作用核验）──
  const owner = 'adv011Owner';
  const paidOrd = 'ADV011_PAID';
  const createdOrd = 'ADV011_CREATED';
  await pool.query(
    `INSERT INTO user_account(id,email,password_hash,is_admin,role) VALUES
       ($1,'adv011@x.com','scrypt$x$y',false,'candidate')
     ON CONFLICT (id) DO NOTHING`,
    [owner],
  );
  await pool.query(
    `INSERT INTO payment_order(id,owner_user_id,product_id,amount_cents,units,status,provider_txn) VALUES
       ($1,$2,'pack_10',9900,10,'paid','adv011-paid-txn'),
       ($3,$2,'pack_10',9900,10,'created',NULL)
     ON CONFLICT (id) DO NOTHING`,
    [paidOrd, owner, createdOrd],
  );

  const orderRow = async (id: string) =>
    (await pool.query(
      'SELECT id, owner_user_id, status, units, amount_cents, provider_txn FROM payment_order WHERE id=$1',
      [id],
    )).rows[0] ?? null;
  const bucketSum = async (uid: string) =>
    Number((await pool.query(
      'SELECT COALESCE(SUM(units_total),0)::float8 s FROM entitlement_bucket WHERE owner_user_id=$1',
      [uid],
    )).rows[0].s);
  const consCount = async (uid: string) =>
    Number((await pool.query(
      'SELECT count(*)::int n FROM entitlement_consumption WHERE owner_user_id=$1',
      [uid],
    )).rows[0].n);

  const MOUTHS = [
    { id: 'payment-refund-callback', path: '/payment/refund-callback', authed: true },
    { id: 'commerce-webhook-refund', path: `/commerce/webhook/refund/${paidOrd}`, authed: false },
    { id: 'commerce-orders-refund-callback', path: `/commerce/orders/${paidOrd}/refund-callback`, authed: true },
  ] as const;

  type Probe = { id: string; path: string; status: number; body: unknown };
  const probes: Probe[] = [];

  console.log('\n──────── SURFACE PROBE · demand mouths（scenarios 契约名）────────');
  for (const m of MOUTHS) {
    const headers = m.authed ? h.U(owner) : {};
    const r = await h.post(m.path, headers, {
      orderId: paidOrd,
      providerTxn: 'adv011-probe-txn',
      sig: paySig('probe-unrelated'),
    });
    probes.push({ id: m.id, path: m.path, status: r.status, body: r.body });
    console.log(`PROBE  ${m.id} POST ${m.path} → HTTP ${r.status} body=${JSON.stringify(r.body)?.slice(0, 120)}`);
  }

  const anyReachable = probes.some((p) => !isUnreachable(p.status));
  const allUnreachable = probes.every((p) => isUnreachable(p.status));
  console.log(`SURFACE: anyReachable=${anyReachable} allUnreachable=${allUnreachable}`);
  if (allUnreachable) {
    console.log(`${GAP_PRODUCT}: 三口皆 404/405 — 执行面 UNREACHABLE（H4/H5 一致）`);
    console.log(`${GAP_ADV}: A1/A2 无法取得非-404 验签/重放证据（Ban wash 404=pass）`);
  }

  // Primary mouth for A1/A2 attempts = scenarios 契约名；等价 webhook 作旁证
  const primaryPath = '/payment/refund-callback';
  const equivPath = `/commerce/webhook/refund/${paidOrd}`;

  // ════════════════════════════════════════════════════════════════════════
  // A1 错签：垃圾/错 HMAC · 观察「拒（非-404 4xx）+ 无双退」
  // 404 ≠ 拒签证据（缺口的 404 拒一切请求，不是验签证明）
  // ════════════════════════════════════════════════════════════════════════
  {
    console.log('\n──────── A1 · 错签（garbage/wrong HMAC）────────');
    const before = {
      paid: await orderRow(paidOrd),
      created: await orderRow(createdOrd),
      buckets: await bucketSum(owner),
      cons: await consCount(owner),
    };

    const wrongSig = paySig('forged-unrelated-string');
    const garbageShort = 'zz';
    const r1 = await h.post(primaryPath, h.U(owner), {
      orderId: paidOrd, providerTxn: 'adv011-a1-txn', sig: wrongSig,
    });
    const r2 = await h.post(primaryPath, h.U(owner), {
      orderId: paidOrd, providerTxn: 'adv011-a1-txn', sig: garbageShort,
    });
    const r3 = await h.post(equivPath, {}, {
      providerTxn: 'adv011-a1-txn', sig: wrongSig,
    });

    console.log(`A1 OBSERVE primary wrongSig → HTTP ${r1.status} body=${JSON.stringify(r1.body)?.slice(0, 160)}`);
    console.log(`A1 OBSERVE primary garbage → HTTP ${r2.status} body=${JSON.stringify(r2.body)?.slice(0, 160)}`);
    console.log(`A1 OBSERVE webhook-equiv wrongSig → HTTP ${r3.status} body=${JSON.stringify(r3.body)?.slice(0, 160)}`);

    // 关键闸：404 不得记 PASS。真证据 = 非-404 可解释拒。
    A('A1', '错签 primary 得非-404 可解释 4xx 拒（Ban wash 404=pass）',
      isExplainableRejectNotGap(r1.status));
    A('A1', '垃圾短签 primary 得非-404 可解释 4xx 拒（Ban wash 404=pass）',
      isExplainableRejectNotGap(r2.status));
    A('A1', '等价 webhook 错签得非-404 可解释 4xx 拒（Ban wash 404=pass）',
      isExplainableRejectNotGap(r3.status));

    if (isUnreachable(r1.status) || isUnreachable(r2.status) || isUnreachable(r3.status)) {
      console.log(`GAP-ITEM leg=A1 reason=UNREACHABLE primary=${r1.status} garbage=${r2.status} equiv=${r3.status}`);
      console.log(`  → ${GAP_ADV} 执行面不可达；${GAP_PRODUCT} 产品口未落（POST /payment/refund-callback + webhook refund）`);
    }

    const after = {
      paid: await orderRow(paidOrd),
      created: await orderRow(createdOrd),
      buckets: await bucketSum(owner),
      cons: await consCount(owner),
    };
    A('A1', '无双退/零误改: paid 单 status/txn 不变',
      after.paid?.status === before.paid?.status
      && after.paid?.provider_txn === before.paid?.provider_txn
      && Number(after.paid?.units) === Number(before.paid?.units));
    A('A1', '无双退/零误改: created 单仍 created + txn NULL',
      after.created?.status === 'created' && after.created?.provider_txn === null);
    A('A1', '无双退/零误改: entitlement_bucket 合计不变', after.buckets === before.buckets);
    A('A1', '无双退/零误改: entitlement_consumption 行数不变', after.cons === before.cons);

    // C-1 disclosure：具名 error code 未钉（口缺失）；口落地后须对齐 UC014 级 bad_signature 等
    console.log('C-1 DISCLOSED: A1 具名 HTTP status/error body 未预填（产品口今日缺失）；口落地刀 GAP-UC011-REFUND-CALLBACK 后再钉，Ban 本刀发明码');
  }

  // ════════════════════════════════════════════════════════════════════════
  // A2 重放：同幂等键合法回调顺序重放 · 首退一次 / 次 already|no-op · 无双退
  // 口 404 → 首腿都做不出 → UNREACHABLE → FAIL（非 flake）
  // ════════════════════════════════════════════════════════════════════════
  {
    console.log('\n──────── A2 · 重放（同幂等键顺序两次）────────');
    const before = {
      paid: await orderRow(paidOrd),
      buckets: await bucketSum(owner),
      cons: await consCount(owner),
    };

    // 无产品口 = 无法构造「合法签名回调」。仍发出两次同体请求以证明执行面不可达，
    // 并断言：不得把 404 记成「幂等 already/no-op」。
    const body = {
      orderId: paidOrd,
      providerTxn: 'adv011-a2-replay-txn',
      sig: paySig(`${paidOrd}:adv011-a2-replay-txn:refunded`),
    };
    const first = await h.post(primaryPath, h.U(owner), body);
    const second = await h.post(primaryPath, h.U(owner), body);
    console.log(`A2 OBSERVE first  → HTTP ${first.status} body=${JSON.stringify(first.body)?.slice(0, 160)}`);
    console.log(`A2 OBSERVE second → HTTP ${second.status} body=${JSON.stringify(second.body)?.slice(0, 160)}`);

    const firstOk = !isUnreachable(first.status) && first.status >= 200 && first.status < 300;
    const secondIdempotent = !isUnreachable(second.status)
      && (
        // 幂等安全：2xx already/no-op 或可解释 4xx conflict（具名码 C-1 产品口后钉）
        (second.status >= 200 && second.status < 300)
        || (second.status >= 400 && second.status < 500)
      );

    A('A2', '首回调可达且非-404（合法退一次的执行面存在）', firstOk);
    A('A2', '次回调可达且幂等安全（already/no-op/conflict · 非-404）', secondIdempotent);
    A('A2', 'Ban wash: 双次 404 不得记成重放幂等 PASS',
      !(isUnreachable(first.status) && isUnreachable(second.status)));

    if (isUnreachable(first.status) || isUnreachable(second.status)) {
      console.log(`GAP-ITEM leg=A2 reason=UNREACHABLE first=${first.status} second=${second.status}`);
      console.log(`  → ${GAP_ADV} 重放腿不可达；${GAP_PRODUCT} 无 refund-callback 验签/幂等执行面`);
      console.log('  → scenarios E3/A3 / TC-E2E-011-refund-idem 仍缺产品口，Ban 互借关闭');
    }

    const after = {
      paid: await orderRow(paidOrd),
      buckets: await bucketSum(owner),
      cons: await consCount(owner),
    };
    // 口缺失时：两次 404 不得产生双退副作用（零误改仍应成立，但是 A2 真证据不够）
    A('A2', '无双退: paid 单 status/txn 未被错误改写（口缺失时保持原样）',
      after.paid?.status === before.paid?.status
      && after.paid?.provider_txn === before.paid?.provider_txn);
    A('A2', '无双退: entitlement_bucket 合计不变（口缺失路径）', after.buckets === before.buckets);
    A('A2', '无双退: entitlement_consumption 行数不变（口缺失路径）', after.cons === before.cons);

    console.log('C-1 DISCLOSED: A2 具名二次 status/already|no-op 字段未预填（产品口今日缺失）；口落地后再钉');
  }

  // ── EXIT 裁决 ──
  console.log(`\n断言合计: ${total} 条, 失败 ${failures.length} 条`);
  for (const leg of ['INV', 'A1', 'A2'] as Leg[]) {
    const n = failures.filter((f) => f.leg === leg).length;
    console.log(`  ${leg}: ${n === 0 ? 'ALL PASS' : `${n} FAILED`}`);
  }

  if (failures.length > 0) {
    console.log(`\n${GAP_ADV} — 诚实保留 gap（EXIT 1 · 非 flake · 非环境问题 · Ban invent fix · Ban wash 404=pass）:`);
    for (const f of failures) {
      console.log(`  GAP-ITEM leg=${f.leg} assertion="${f.name}"`);
    }
    console.log(`${GAP_PRODUCT} — POST /payment/refund-callback + markOrderRefunded / webhook refund 产品口未落（H4/H5 一致）`);
    console.log('依据: apps/api/src/modules/commerce/commerce-webhook.controller.ts（仅 pay/:id）· commerce.service.ts（无 refund*）· packages/db/src/payment.ts（无 markOrderRefunded）');
    console.log('处置: row UC-E2E-011 stays partial · ADV stays gap/case-only · coveredCount=8 · 不翻行；attempts 台账记 EXIT=1');
    console.log('非宣称: ≠ covered · ≠ ADV partial · ≠ 产品口已落 · ≠ HA · Ban self-nail');
    console.log(`CMD=${CMD} EXIT=1`);
    process.exit(1);
  }

  console.log(`\nEXIT=0 — A1+A2 refund-callback ADV 真证据成立（${total} 条断言全绿）。`);
  console.log('EXIT 0 ≠ 翻行 ≠ covered：ADV gap→partial 须 post-prove dual PASS + 协调方 nail；coveredCount=8 不动。');
  console.log('releaseEvidence=false · NOT_HA · local green ≠ HA');
  console.log(`CMD=${CMD} EXIT=0`);
  process.exit(0);
})().catch((e) => {
  console.error(`${GAP_ADV} harness 崩溃（EXIT 1 · 记入 attempts 台账 · 非 flake）:`, e);
  console.log(`CMD=${CMD} EXIT=1`);
  process.exit(1);
});
