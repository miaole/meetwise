import { fileURLToPath } from 'node:url';
import { mkAssert } from './_neg-harness';
import { createPool, runMigrations, loadMigrations, asPrincipal, type DbPool } from '@meetwise/db';

/**
 * entpay-s2-preverify — B271 #271 片2 **强制前置闸 §1.2.0-c 隔离库预验证**（REQUEST @6385804a rev3）。
 * 本文件为 B271 片1 EXEC 席 2026-10-10 全新书写（wave2 隔离档零恢复·本片1 EXEC 只写不跑片2 面；
 * 其执行归片2 前置闸开启时——0-b 现不满足：B110 双审未收口）。
 * 审计局限原话：「企业入账/人工确认/开票方案未在隔离库验证」「跨主体扣费未经隔离库验证」——
 * 片2（扣费路由·0157）开工前本脚本必须全绿；**任一 FAIL=STOP 手上报协调方，Ban 带伤上码**。
 *
 * 隔离面：run-e2e-isolated 门注入的**本地临时** PG 实例（assertIsolatedTestTarget 形·禁 DATABASE_URL·
 * 零生产 DSN/零生产 Key/零凭据值落盘·E3 附款）；探针库=真 runMigrations 全量链 0001→0156（含 0156
 * 企业桶 CHECK/RLS 在位断言对账）后叠加 **片2 形状的 ad-hoc 探针面**（0157 预览·仅存在于探针库·零生产物）：
 *   - entitlement_consumption 增 payer_user_id 列（片2 S2-C1 预览）；
 *   - probe_ent_reserve_for_application（SECURITY DEFINER·FIFO 预留企业桶+记 payer·不足抛
 *     insufficient_entitlement）——即片2 受控预留函数的同形最小样板。
 *
 * 五件事（§1.2.0 ①-④ + rev2-E2 增补⑤）：
 *  ① 新增受控 SECURITY DEFINER 预留函数在 app_role 上下文（候选人 principal 会话内调用）可对
 *     RLS 企业桶写入；
 *  ② entitlement_consumption payer 列+幂等唯一约束在跨主体行上行为正确（owner=招聘方·
 *     key=interviewId 重放收敛单行）；
 *  ③ RLS 下候选人 principal **不可见**企业桶（SELECT 零行）；
 *  ④ begin 现事务形状（advisory 锁+reserveEntitlement 抛→402 映射）在 DEFINER 换路后回滚语义
 *     不变（预留抛错→整事务回滚·预留/消费/面试态零残留）；
 *  ⑤（rev2-E2）sweeper（commerce-reconcile.ts:46/:56）owner 传参与 RLS 上下文重验证：payer 路由后
 *     consumption 行 owner=招聘方（sweeper 按 owner 枚举+asPrincipal(owner) 扫）——探针=租约过期行在
 *     sweepExpiredReservations 同形原子 UPDATE（owner 限域）下回收成功·企业桶 units_reserved 退还。
 *
 * est live=0（零模型外呼·零真实支付）。
 */

const CAND = 'pv-candidate-1';
const REC = 'pv-recruiter-1';

let mig: DbPool | null = null;

async function main() {
  const { A, done } = mkAssert('entpay:s2:preverify');

  // ── 探针库：真迁移链全量应用（0001→0156）+ 片2 形状 ad-hoc 面完毕 ──────────────────
  // 直接落隔离容器**默认库**（runtime-role-http.proof 先例形；独立探针库会因 0001 的 cluster 级
  // 角色治理与 boot()/默认库互斥——B271 片1 prove attempt2/3 实测 2BP01）。本脚本不 boot()
  // （零 HTTP 面·纯 DB 形状探针），迁移链后叠加片2 ad-hoc 探针面（仅本一次性容器内存在）。
  mig = createPool({ purpose: 'entpay_s2_preverify_migrate' });
  await mig.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  const manifest = loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
  const first = await runMigrations(mig, manifest);
  const last = first.applied[first.applied.length - 1];
  A('PV-0 真迁移链全量应用 0001→0156（末位=0156 企业桶充值）', last === '0156_enterprise_bucket_billing.sql');
  A('PV-0b 探针库 0156 形状：kind CHECK 含 enterprise',
    (await mig.query(`SELECT count(*)::int AS n FROM pg_constraint WHERE conrelid='entitlement_bucket'::regclass AND conname='ck_bucket_kind' AND pg_get_constraintdef(oid) LIKE '%enterprise%'`)).rows[0]?.n === 1);
  A('PV-0c 探针库 0156 形状：bucket RLS FORCE+p_owner 在位（E1 断言已过=迁移成功落位）',
    (await mig.query(`SELECT count(*)::int AS n FROM pg_class WHERE oid='entitlement_bucket'::regclass AND relrowsecurity AND relforcerowsecurity`)).rows[0]?.n === 1);

  // 片2 预览面（仅探针库）：payer 列 + 受控预留函数（SECURITY DEFINER·不足抛 insufficient_entitlement）
  await mig.query(`ALTER TABLE entitlement_consumption ADD COLUMN IF NOT EXISTS payer_user_id text`);
  await mig.query(`
CREATE OR REPLACE FUNCTION probe_ent_reserve_for_application(
  p_bucket_owner text, p_payer text, p_idempotency_key text, p_service_type text, p_units numeric, p_lease_seconds int
) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
DECLARE
  v_existing text;
  v_consumption uuid;
  b record;
  v_remaining numeric := p_units;
  v_alloc jsonb := '[]'::jsonb;
BEGIN
  -- 幂等占坑（reserveEntitlement 同形：ON CONFLICT DO NOTHING → duplicate 收敛）
  INSERT INTO entitlement_consumption(owner_user_id, idempotency_key, service_type, units_requested, payer_user_id, lease_expires_at)
  VALUES (p_bucket_owner, p_idempotency_key, p_service_type, p_units, p_payer, now() + (p_lease_seconds || ' seconds')::interval)
  ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_consumption;
  IF v_consumption IS NULL THEN
    SELECT id INTO v_existing FROM entitlement_consumption
     WHERE owner_user_id = p_bucket_owner AND idempotency_key = p_idempotency_key;
    RETURN 'duplicate:' || coalesce(v_existing, 'missing');
  END IF;
  -- FIFO 预留企业桶（0001 同形 CAS·不足抛 insufficient_entitlement → 外层事务回滚）
  FOR b IN
    SELECT id, (units_total - units_reserved - units_consumed) AS avail
      FROM entitlement_bucket
     WHERE owner_user_id = p_bucket_owner AND kind = 'enterprise' AND expires_at > now()
       AND (units_total - units_reserved - units_consumed) > 0
     ORDER BY expires_at ASC, id ASC
     FOR UPDATE
  LOOP
    EXIT WHEN v_remaining <= 0;
    IF b.avail > 0 THEN
      UPDATE entitlement_bucket SET units_reserved = units_reserved + least(b.avail, v_remaining), version = version + 1
       WHERE id = b.id AND (units_total - units_reserved - units_consumed) >= least(b.avail, v_remaining);
      IF FOUND THEN
        v_alloc := v_alloc || jsonb_build_array(jsonb_build_object('bucket_id', b.id, 'units', least(b.avail, v_remaining)));
        v_remaining := v_remaining - least(b.avail, v_remaining);
      END IF;
    END IF;
  END LOOP;
  IF v_remaining > 0 THEN
    RAISE EXCEPTION 'insufficient_entitlement' USING ERRCODE = 'P0001';
  END IF;
  UPDATE entitlement_consumption SET allocations = v_alloc WHERE id = v_consumption;
  RETURN 'reserved:' || v_consumption::text;
END;
$$;`);
  A('PV-0d 片2 形状探针函数在位（SECURITY DEFINER）',
    (await mig.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname='probe_ent_reserve_for_application' AND prosecdef`)).rows[0]?.n === 1);

  // 种子：招聘方（0155 门 approved）+ 企业桶 2.00；候选人零桶
  await mig.query(`INSERT INTO user_account(id,email,password_hash,role,approval_status) VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','candidate','approved') ON CONFLICT DO NOTHING`, [REC, 'pv-rec@x.com', CAND, 'pv-cand@x.com']);
  await mig.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'enterprise',2.00, now()+interval '365 days')`, [REC]);

  // ── ① DEFINER 跨 RLS 写：候选人 principal 会话内调受控函数可写 RLS 企业桶 ────────────
  const r1 = await asPrincipal(mig, CAND, (c) => c.query(`SELECT probe_ent_reserve_for_application($1,$2,$3,'mock_interview',1.00,3600) AS r`, [REC, REC, 'pv-iv-1']));
  A('PV-1 候选人 principal 会话内 DEFINER 预留企业桶成功（跨 RLS 写·片2①）',
    String(r1.rows[0]?.r).startsWith('reserved:'));
  const bucket1 = await mig.query(`SELECT units_reserved FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]);
  const cons1 = await mig.query(`SELECT owner_user_id, payer_user_id, units_requested FROM entitlement_consumption WHERE idempotency_key='pv-iv-1'`);
  A('PV-1b 企业桶 units_reserved=1.00（写入真实落位）', Number(bucket1.rows[0]?.units_reserved) === 1);
  A('PV-1c consumption 行 owner=招聘方·payer=招聘方（跨主体行形状）',
    cons1.rows[0]?.owner_user_id === REC && cons1.rows[0]?.payer_user_id === REC && Number(cons1.rows[0]?.units_requested) === 1);

  // ── ② payer 列+幂等唯一约束：同 owner 同 key 重放收敛单行 ─────────────────────────
  const r2 = await asPrincipal(mig, CAND, (c) => c.query(`SELECT probe_ent_reserve_for_application($1,$2,$3,'mock_interview',1.00,3600) AS r`, [REC, REC, 'pv-iv-1']));
  const cnt2 = await mig.query(`SELECT count(*)::int AS n FROM entitlement_consumption WHERE idempotency_key='pv-iv-1'`);
  const bucket2 = await mig.query(`SELECT units_reserved FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]);
  A('PV-2 重放收敛单行（幂等·片2②）', String(r2.rows[0]?.r).startsWith('duplicate:') && cnt2.rows[0]?.n === 1);
  A('PV-2b 重放不重复预留（units_reserved 仍=1.00）', Number(bucket2.rows[0]?.units_reserved) === 1);
  // 释放（片2 语义对偶预览）：release 后再重放→ 已 released 行不被二次预留（幂等键唯一性背书）
  await mig.query(`UPDATE entitlement_consumption SET status='released', lease_expires_at=NULL WHERE idempotency_key='pv-iv-1'`);
  await mig.query(`UPDATE entitlement_bucket SET units_reserved = units_reserved - 1.00 WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]);
  const r2c = await asPrincipal(mig, CAND, (c) => c.query(`SELECT probe_ent_reserve_for_application($1,$2,$3,'mock_interview',1.00,3600) AS r`, [REC, REC, 'pv-iv-1']));
  A('PV-2c released 后同 key 重放仍收敛单行（uq (owner,key) 背书·Ban 二次占坑）',
    String(r2c.rows[0]?.r).startsWith('duplicate:') &&
    (await mig.query(`SELECT count(*)::int AS n FROM entitlement_consumption WHERE idempotency_key='pv-iv-1'`)).rows[0]?.n === 1);

  // ── ③ RLS 纵深：候选人 principal 不可见企业桶（SELECT 零行）────────────────────────
  const invis = await asPrincipal(mig, CAND, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]));
  const invisCons = await asPrincipal(mig, CAND, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1`, [REC]));
  const ownerSee = await asPrincipal(mig, REC, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]));
  A('PV-3 候选人 principal 下企业桶 SELECT=0 行（片2③·RLS FORCE）', invis.rows[0]?.n === 0);
  A('PV-3b 候选人 principal 下招聘方 consumption SELECT=0 行', invisCons.rows[0]?.n === 0);
  A('PV-3c 控制组：招聘方本人可见自己的企业桶（恰 1 行）', ownerSee.rows[0]?.n === 1);

  // ── ④ begin 事务形状回滚语义：advisory 锁 + DEFINER 预留抛 → 整事务回滚零残留 ─────────
  // 现形（interview.service.ts:176,:304-309）：BEGIN → SET LOCAL ROLE app_role → principal →
  // pg_advisory_xact_lock(hashtext('begin'),hashtext(id)) → reserve（不足抛）→ catch→402 →外层 ROLLBACK。
  const rollbackProbe = async (): Promise<{ rolled: boolean; err?: string }> => {
    const c = await mig!.connect();
    try {
      await c.query('BEGIN');
      await c.query('SET LOCAL ROLE app_role');
      await c.query(`SELECT set_config('app.principal_user', $1, true)`, [CAND]);
      await c.query(`SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))`, ['begin', 'pv-iv-rlb']);
      // 同事务内先做一笔「先于预留的写」（begin 形状里的绑定/供给写），再调 DEFINER 预留
      await c.query(`INSERT INTO entitlement_consumption(owner_user_id,idempotency_key,service_type,units_requested,payer_user_id)
                     VALUES ($1,'pv-iv-rlb','mock_interview',1.00,$1)`, [REC]);
      await c.query(`SELECT probe_ent_reserve_for_application($1,$2,$3,'mock_interview',99.00,3600)`, [REC, REC, 'pv-iv-rlb2']);
      await c.query('COMMIT');
      return { rolled: false };
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message ?? '';
      await c.query('ROLLBACK');
      return { rolled: msg === 'insufficient_entitlement', err: msg };
    } finally { c.release(); }
  };
  const rr = await rollbackProbe();
  A('PV-4 企业额度不足 → DEFINER 预留抛 insufficient_entitlement（402 映射源不变）', rr.rolled);
  const after = await mig.query(`SELECT
    (SELECT count(*)::int FROM entitlement_consumption WHERE idempotency_key IN ('pv-iv-rlb','pv-iv-rlb2')) AS cons,
    (SELECT coalesce(sum(units_reserved),0)::numeric FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise') AS reserved`, [REC]);
  A('PV-4b 回滚零残留：先导写+预留+消费行全部消失（begin 回滚语义不变·片2④）',
    after.rows[0]?.cons === 0 && Number(after.rows[0]?.reserved) === 0);
  // 正常路径残检：锁可复得（无悬挂）
  const advisory = await mig.query(`SELECT pg_try_advisory_lock(hashtext('begin'), hashtext('pv-iv-rlb')) AS ok`);
  const advisoryOk = advisory.rows[0]?.ok === true;
  if (advisoryOk) await mig.query(`SELECT pg_unlock_advisory_lock(hashtext('begin'), hashtext('pv-iv-rlb'))`);
  A('PV-4c 事务级 advisory 锁无悬挂（xact 锁随回滚释放）', advisoryOk);

  // ── ⑤ sweeper owner 传参+RLS 上下文重验证（rev2-E2·commerce-reconcile.ts:46/:56 前置）────────
  // payer 路由后 consumption 行 owner=招聘方（sweeper 按 owner 枚举 + asPrincipal(owner) 扫）。
  // 探针=sweepExpiredReservations（commerce.ts:343-346）同形原子 UPDATE：owner 限域+租约复核 RETURNING，
  // 在 asPrincipal(REC)（RLS 上下文=招聘方本人）下回收租约过期预留并退还企业桶 units_reserved。
  await mig.query(`UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 second' WHERE idempotency_key='pv-iv-1'`);
  const sweep = await asPrincipal(mig, REC, (c) => c.query(
    `UPDATE entitlement_consumption SET status='released'
      WHERE owner_user_id=$1 AND status='reserved' AND lease_expires_at < now()
      RETURNING id, idempotency_key, service_type, allocations`, [REC]));
  A('PV-5 sweeper 同形回收：owner=招聘方 RLS 上下文下租约过期行被扫出（恰 1 行·pv-iv-1）',
    sweep.rowCount === 1 && sweep.rows[0]?.idempotency_key === 'pv-iv-1');
  // allocations 退还（sweepExpiredReservations :350 同形）
  const allocs = (sweep.rows[0]?.allocations ?? []) as Array<{ bucket_id: string; units: number }>;
  for (const a of allocs) {
    await asPrincipal(mig, REC, (c) => c.query(`UPDATE entitlement_bucket SET units_reserved = units_reserved - $2, version = version + 1 WHERE id=$1`, [a.bucket_id, a.units]));
  }
  const bucket5 = await mig.query(`SELECT units_reserved FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [REC]);
  A('PV-5b sweeper 退还企业桶 units_reserved=0（零预留泄漏·对账兜底路 RLS 可通行）', Number(bucket5.rows[0]?.units_reserved) === 0);
  // 候选人 principal 下 sweeper 同形扫=0 行（owner 传参错配即零行 → ⑤ 的反例守卫）
  const sweepWrong = await asPrincipal(mig, CAND, (c) => c.query(
    `UPDATE entitlement_consumption SET status='released'
      WHERE owner_user_id=$1 AND status='reserved' AND lease_expires_at < now()
      RETURNING id`, [REC]));
  A('PV-5c 反例守卫：owner 传参错配（候选人会话扫招聘方行）=0 行（错配即静默零回收→sweeper owner 必须路由到桶 owner）',
    sweepWrong.rowCount === 0);

  await done();
}

main()
  .catch(async (e: unknown) => {
    console.error('PREVERIFY-ABORT（FAIL=STOP·片2 前置闸 §1.2.0-c 未过·手上报协调方）', e);
    process.exit(1);
  })
  .then(async () => {
    for (const p of [mig]) { try { await p?.end(); } catch { /* ignore */ } }
  });
