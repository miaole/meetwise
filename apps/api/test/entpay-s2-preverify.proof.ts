import { fileURLToPath } from 'node:url';
import { createPool, runMigrations, loadMigrations, asPrincipal, type DbPool } from '@meetwise/db';

/**
 * entpay-s2-preverify — B271 #271 片2 **强制前置闸 §1.2.0-c 隔离库预验证**（REQUEST rev2·§9-1/§9-2 处方兑现）。
 * 本文件为 B271 片1 EXEC 席 2026-10-10 全新书写（形状乙措辞写死 @ab420f61）；片2 EXEC 席按 rev2-R2
 * **参数化双形状**重写（原 PV-1c 硬编码 owner=招聘方 → 形状甲现卷必 FAIL·D-1「两形状各跑」不可执行——
 * 本卷即其同步扩面兑现），并按 rev2-R1 扩 0-c⑤ 判据面（reconcileOwner B 端支路行为验证）、按 REQUEST
 * §1.0-c⑥ 新增第⑥件探针（租约续约连续性）、按 §9-5 并入 ④b（B 端 abandon 零悬账面·R5 二择一载体）。
 * 审计局限原话：「企业入账/人工确认/开票方案未在隔离库验证」「跨主体扣费未经隔离库验证」——
 * 片2（扣费路由·0157）开工前本脚本必须对**至少一个形状全六件 PASS**；两形状均不全 PASS=STOP 手上报。
 *
 * 隔离面：run-e2e-isolated 门注入的**本地临时** PG 实例（assertIsolatedTestTarget 形·禁 DATABASE_URL·
 * 零生产 DSN/零生产 Key/零凭据值落盘·E3 附款）；探针库=真 runMigrations 全量链 0001→0156 后叠加
 * **片2 形状的 ad-hoc 探针面**（0157 预览·仅存在于探针库·零生产物）：
 *   - entitlement_consumption 增 payer_user_id 列（片2 S2-C1 预览）；
 *   - probe_ent_reserve_for_application（SECURITY DEFINER·参数化 row_owner/bucket_owner/payer·FIFO 预留
 *     企业桶+记 payer·不足抛 insufficient_entitlement）——片2 受控预留函数的同形最小样板；
 *   - probe_ent_apply_allocation（SECURITY DEFINER·allocation 作用域绑定的桶增量应用器）——片2 对账/释放
 *     路由对偶（gateway_entpay_apply_allocation 同形样板·RLS 下 consumption owner 会话不可直写 payer 桶）。
 *
 * D-1 两形状（REQUEST §1.0 消费行 owner 语义·预验证即裁决）：
 *   - 形状甲：consumption 行 owner=候选人·payer_user_id=招聘方（租约续约/sweeper 枚举按候选人零改）；
 *   - 形状乙：consumption 行 owner=招聘方（=0-c② 字面·租约续约/sweeper 判支/abandon 全链须换 owner 语境）。
 * 裁决=「形状×判据」矩阵逐格留痕；取全 PASS 者写入 0157 头注；两形状均不全 PASS ⇒ STOP。
 *
 * est live=0（零模型外呼·零真实支付）。
 */

const CAND = 'pv-candidate-1';
const REC_A = 'pv-recruiter-a';   // 形状甲的企业付费主体
const REC_B = 'pv-recruiter-b';   // 形状乙的企业付费主体

/** D-1 两形状参数（§1.0）：rowOwner=consumption 行 owner_user_id·payer=企业付费主体（=桶 owner）。 */
interface D1Shape {
  id: 'A' | 'B';
  label: string;
  rowOwner: string;
  bucketOwner: string;
  payer: string;
}

const SHAPES: D1Shape[] = [
  { id: 'A', label: '形状甲(owner=候选人+payer=招聘方)', rowOwner: CAND, bucketOwner: REC_A, payer: REC_A },
  { id: 'B', label: '形状乙(owner=招聘方)', rowOwner: REC_B, bucketOwner: REC_B, payer: REC_B },
];

let mig: DbPool | null = null;

/** 断言收集器：逐条留痕 + 按判据(①-⑥)归格，收尾打「形状×判据」矩阵。 */
function mkMatrix() {
  const cells: Record<string, Record<string, boolean>> = {};
  const current: { shape?: string; cell?: string } = {};
  const A = (name: string, cond: boolean) => {
    console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`);
    const shapeId = current.shape, cellId = current.cell;
    if (shapeId !== undefined && cellId !== undefined) {
      const row = (cells[shapeId] ??= {});
      row[cellId] = (row[cellId] ?? true) && cond;
    }
    return cond;
  };
  const enter = (shape: string, cell: string) => { current.shape = shape; current.cell = cell; };
  return { A, enter, cells };
}

async function main() {
  const { A, enter, cells } = mkMatrix();
  console.log('════ B271 片2 0-c 前置闸预验证（D-1 双形状矩阵·rev2-R1/R2/R5 处方兑现）════');

  // ── 探针库：真迁移链全量应用（0001→0156）+ 片2 形状 ad-hoc 面完毕 ──────────────────
  // 直接落隔离容器**默认库**（runtime-role-http.proof 先例形；独立探针库会因 0001 的 cluster 级
  // 角色治理与 boot()/默认库互斥——B271 片1 prove attempt2/3 实测 2BP01）。本脚本不 boot()
  // （零 HTTP 面·纯 DB 形状探针），迁移链后叠加片2 ad-hoc 探针面（仅本一次性容器内存在）。
  mig = createPool({ purpose: 'entpay_s2_preverify_migrate' });
  await mig.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
  const manifest = loadMigrations(fileURLToPath(new URL('../../../packages/db/migrations', import.meta.url)));
  const first = await runMigrations(mig, manifest);
  const last = first.applied[first.applied.length - 1];
  // 双态兼容：0-c 闸=EXEC 前置（链末=0156）；0157 落树后复跑（终树回归态）链末=0157——两态均合法，
  // 探针 ad-hoc 面与 0157 生产函数族命名零冲突（probe_* vs gateway_*·payer 列 IF NOT EXISTS 幂等）。
  A('PV-0 真迁移链全量应用（末位=0156 企业桶充值·EXEC 前态 / 0157 扣费路由·终树回归态）',
    last === '0156_enterprise_bucket_billing' || last === '0157_billing_payer_route');
  A('PV-0b 探针库 0156 形状：kind CHECK 含 enterprise',
    (await mig.query(`SELECT count(*)::int AS n FROM pg_constraint WHERE conrelid='entitlement_bucket'::regclass AND conname='ck_bucket_kind' AND pg_get_constraintdef(oid) LIKE '%enterprise%'`)).rows[0]?.n === 1);
  A('PV-0c 探针库 0156 形状：bucket RLS FORCE+p_owner 在位（E1 断言已过=迁移成功落位）',
    (await mig.query(`SELECT count(*)::int AS n FROM pg_class WHERE oid='entitlement_bucket'::regclass AND relrowsecurity AND relforcerowsecurity`)).rows[0]?.n === 1);

  // 片2 预览面（仅探针库）：payer 列 + 受控预留函数（参数化双形状）+ allocation 作用域桶增量应用器
  await mig.query(`ALTER TABLE entitlement_consumption ADD COLUMN IF NOT EXISTS payer_user_id text`);
  await mig.query(`
CREATE OR REPLACE FUNCTION probe_ent_reserve_for_application(
  p_row_owner text, p_bucket_owner text, p_payer text, p_idempotency_key text, p_service_type text, p_units numeric, p_lease_seconds int
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
  VALUES (p_row_owner, p_idempotency_key, p_service_type, p_units, p_payer, now() + (p_lease_seconds || ' seconds')::interval)
  ON CONFLICT (owner_user_id, idempotency_key) DO NOTHING
  RETURNING id INTO v_consumption;
  IF v_consumption IS NULL THEN
    SELECT id INTO v_existing FROM entitlement_consumption
     WHERE owner_user_id = p_row_owner AND idempotency_key = p_idempotency_key;
    RETURN 'duplicate:' || coalesce(v_existing, 'missing');
  END IF;
  -- FIFO 预留 p_bucket_owner 的企业桶（0001 同形 CAS·不足抛 insufficient_entitlement → 外层事务回滚）
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
$$;
CREATE OR REPLACE FUNCTION probe_ent_apply_allocation(
  p_row_owner text, p_idempotency_key text, p_bucket_id text, p_reserved_delta numeric, p_consumed_delta numeric
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, public AS $$
BEGIN
  -- 作用域守卫：只允许对「调用方 principal 名下 consumption 行 allocations 所列桶」做增量（Ban 任意桶挪账）
  IF p_row_owner IS DISTINCT FROM current_setting('app.principal_user', true) THEN
    RAISE EXCEPTION 'entpay_apply_principal_mismatch' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM entitlement_consumption
     WHERE owner_user_id = p_row_owner AND idempotency_key = p_idempotency_key
       AND allocations @> jsonb_build_array(jsonb_build_object('bucket_id', p_bucket_id::uuid))
  ) THEN
    RAISE EXCEPTION 'entpay_apply_scope_rejected' USING ERRCODE = 'P0001';
  END IF;
  UPDATE entitlement_bucket
     SET units_reserved = units_reserved + p_reserved_delta,
         units_consumed = units_consumed + p_consumed_delta,
         version = version + 1
   WHERE id = p_bucket_id::uuid;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'entpay_apply_bucket_missing' USING ERRCODE = 'P0001';
  END IF;
END;
$$;
-- ACL（0156:318-326 纪律预演）：REVOKE 先于 GRANT·显式最小 EXECUTE 面
REVOKE ALL ON FUNCTION probe_ent_reserve_for_application(text, text, text, text, text, numeric, int) FROM PUBLIC, app_gateway_role;
REVOKE ALL ON FUNCTION probe_ent_apply_allocation(text, text, text, numeric, numeric) FROM PUBLIC, app_gateway_role;
GRANT EXECUTE ON FUNCTION probe_ent_reserve_for_application(text, text, text, text, text, numeric, int) TO app_role;
GRANT EXECUTE ON FUNCTION probe_ent_apply_allocation(text, text, text, numeric, numeric) TO app_role;`);
  A('PV-0d 片2 形状探针函数在位（SECURITY DEFINER×2·参数化双形状）',
    ((await mig.query(`SELECT count(*)::int AS n FROM pg_proc WHERE proname IN ('probe_ent_reserve_for_application','probe_ent_apply_allocation') AND prosecdef`)).rows[0]?.n ?? 0) === 2);

  // 种子：两形状招聘方（0155 门 approved）+ 各自企业桶 2.00；候选人零桶（共享·跨形状只以 idempotency_key 域分隔）
  await mig.query(`INSERT INTO user_account(id,email,password_hash,role,approval_status)
    VALUES ($1,$2,'x','recruiter','approved'),($3,$4,'x','recruiter','approved'),($5,$6,'x','candidate','approved')
    ON CONFLICT DO NOTHING`, [REC_A, 'pv-rec-a@x.com', REC_B, 'pv-rec-b@x.com', CAND, 'pv-cand@x.com']);
  await mig.query(`INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at)
    VALUES ($1,'enterprise',2.00, now()+interval '365 days'),($2,'enterprise',2.00, now()+interval '365 days')`, [REC_A, REC_B]);

  // ── 形状 B 端语境种子：真 interview 行（B 端绑定形状·application_id 非空）+ application 行 ──
  // interview 行 owner 恒=候选人（两形状同·05_interview_jobs p_owner owner-only 语境事实）。
  // application 行直接 superuser 播种（探针只考 sweeper 判支/租约续约的 RLS 行为面·非 start 全链路）。
  await mig.query(`INSERT INTO job_posting(id, owner_user_id, title, description, status)
    VALUES ('pv-job-a',$1,'pv-job-a-title','pv-desc','open'),('pv-job-b',$2,'pv-job-b-title','pv-desc','open')
    ON CONFLICT DO NOTHING`, [REC_A, REC_B]);
  // job_application 播种走 0046 lineage 触发器合法面：recruiter principal + source='invited' + scoreless invited 壳
  await asPrincipal(mig, REC_A, (c) => c.query(
    `INSERT INTO job_application(id, job_id, recruiter_user_id, candidate_user_id, status, source, job_title_snapshot, interview_attempt)
     VALUES ('pv-app-a','pv-job-a',$1,$2,'invited','invited','pv-job-a-title',0) ON CONFLICT DO NOTHING`, [REC_A, CAND]));
  await asPrincipal(mig, REC_B, (c) => c.query(
    `INSERT INTO job_application(id, job_id, recruiter_user_id, candidate_user_id, status, source, job_title_snapshot, interview_attempt)
     VALUES ('pv-app-b','pv-job-b',$1,$2,'invited','invited','pv-job-b-title',0) ON CONFLICT DO NOTHING`, [REC_B, CAND]));
  await mig.query(`INSERT INTO resume(id, owner_user_id, status, content_sha)
    VALUES ('00000000-0000-4000-8000-00000000000a',$1,'ingested','pv:resume:a'),
           ('00000000-0000-4000-8000-00000000000b',$1,'ingested','pv:resume:b')
    ON CONFLICT DO NOTHING`, [CAND]);
  await mig.query(`INSERT INTO interview(id, owner_user_id, status, application_id, application_attempt, job_id, job_title_snapshot, resume_id, resume_privacy_epoch)
    VALUES ('pv-iv-a',$1,'created','pv-app-a',1,'pv-job-a','pv-job-a-title','00000000-0000-4000-8000-00000000000a',1),
           ('pv-iv-b',$1,'created','pv-app-b',1,'pv-job-b','pv-job-b-title','00000000-0000-4000-8000-00000000000b',1)
    ON CONFLICT DO NOTHING`, [CAND]);

  for (const shape of SHAPES) {
    const tag = `[${shape.id}]`;
    const key1 = `pv-iv-${shape.id.toLowerCase()}-1`;
    const bucketOwner = shape.bucketOwner;
    const rowOwner = shape.rowOwner;
    console.log(`\n──── ${shape.label} ────`);

    // ── ① DEFINER 跨 RLS 写：候选人 principal 会话内调受控函数可写 RLS 企业桶 ─────────
    enter(shape.id, '①');
    const r1 = await asPrincipal(mig!, CAND, (c) => c.query(
      `SELECT probe_ent_reserve_for_application($1,$2,$3,$4,'mock_interview',1.00,3600) AS r`,
      [rowOwner, bucketOwner, shape.payer, key1]));
    A(`${tag}① 候选人 principal 会话内 DEFINER 预留企业桶成功（跨 RLS 写·片2①）`,
      String(r1.rows[0]?.r).startsWith('reserved:'));
    const bucket1 = await mig!.query(`SELECT units_reserved FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]);
    const cons1 = await mig!.query(`SELECT owner_user_id, payer_user_id, units_requested FROM entitlement_consumption WHERE idempotency_key=$1`, [key1]);
    A(`${tag}①b 企业桶 units_reserved=1.00（写入真实落位）`, Number(bucket1.rows[0]?.units_reserved) === 1);
    // 行形状按 D-1 语义逐形状断言（0-c② 判据本面：跨主体行 payer 落位正确）
    A(`${tag}①c consumption 行形状（D-1 语义·owner/payer 双落位）`,
      cons1.rows[0]?.owner_user_id === rowOwner && cons1.rows[0]?.payer_user_id === shape.payer && Number(cons1.rows[0]?.units_requested) === 1);

    // ── ② payer 列+幂等唯一约束：同 owner 同 key 重放收敛单行 ─────────────────────────
    enter(shape.id, '②');
    const r2 = await asPrincipal(mig!, CAND, (c) => c.query(
      `SELECT probe_ent_reserve_for_application($1,$2,$3,$4,'mock_interview',1.00,3600) AS r`,
      [rowOwner, bucketOwner, shape.payer, key1]));
    const cnt2 = await mig!.query(`SELECT count(*)::int AS n FROM entitlement_consumption WHERE idempotency_key=$1`, [key1]);
    const bucket2 = await mig!.query(`SELECT units_reserved FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]);
    A(`${tag}② 重放收敛单行（幂等·片2②）`, String(r2.rows[0]?.r).startsWith('duplicate:') && cnt2.rows[0]?.n === 1);
    A(`${tag}②b 重放不重复预留（units_reserved 仍=1.00）`, Number(bucket2.rows[0]?.units_reserved) === 1);
    // 释放（片2 语义对偶预览）：release 后再重放 → 已 released 行不被二次预留（幂等键唯一性背书）
    await mig!.query(`UPDATE entitlement_consumption SET status='released', lease_expires_at=NULL WHERE idempotency_key=$1`, [key1]);
    await mig!.query(`UPDATE entitlement_bucket SET units_reserved = units_reserved - 1.00 WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]);
    const r2c = await asPrincipal(mig!, CAND, (c) => c.query(
      `SELECT probe_ent_reserve_for_application($1,$2,$3,$4,'mock_interview',1.00,3600) AS r`,
      [rowOwner, bucketOwner, shape.payer, key1]));
    A(`${tag}②c released 后同 key 重放仍收敛单行（uq (owner,key) 背书·Ban 二次占坑）`,
      String(r2c.rows[0]?.r).startsWith('duplicate:') &&
      (await mig!.query(`SELECT count(*)::int AS n FROM entitlement_consumption WHERE idempotency_key=$1`, [key1])).rows[0]?.n === 1);
    // 恢复为 reserved + 预留在位（后续 ⑤⑥ 判据以在位预留为底座）
    await mig!.query(`UPDATE entitlement_consumption
        SET status='reserved', lease_expires_at=now()+interval '3600 seconds',
            allocations = jsonb_build_array(jsonb_build_object('bucket_id',
              (SELECT id FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise' LIMIT 1), 'units', 1.0))
      WHERE idempotency_key=$2`, [bucketOwner, key1]);
    await mig!.query(`UPDATE entitlement_bucket SET units_reserved = units_reserved + 1.00 WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]);

    // ── ③ RLS 纵深：候选人 principal 不可见企业桶（SELECT 零行）────────────────────────
    enter(shape.id, '③');
    const invis = await asPrincipal(mig!, CAND, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]));
    const invisCons = await asPrincipal(mig!, CAND, (c) => c.query(
      `SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1`, [bucketOwner]));
    const ownerSee = await asPrincipal(mig!, bucketOwner, (c) => c.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]));
    A(`${tag}③ 候选人 principal 下企业桶 SELECT=0 行（片2③·RLS FORCE）`, invis.rows[0]?.n === 0);
    // 他者 consumption 行（owner=企业付费主体）对候选人不可见；形状甲的行 owner=候选人本人可见=RLS 正确行为（不计格留痕）
    const ownRowSee = await asPrincipal(mig!, CAND, (c) => c.query(
      `SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1 AND idempotency_key=$2`, [rowOwner, key1]));
    A(`${tag}③b 候选人 principal 下他者 consumption SELECT=0 行`, invisCons.rows[0]?.n === 0);
    console.log(`INFO  ${tag}③-info 候选人对自己名下消费行可见性 rowCount=${ownRowSee.rows[0]?.n}（形状甲=1=RLS 正确·形状乙=0=不可见）`);
    A(`${tag}③c 控制组：招聘方本人可见自己的企业桶（恰 1 行）`, ownerSee.rows[0]?.n === 1);

    // ── ④ begin 事务形状回滚语义（④a）+ B 端 abandon 零悬账面（④b·§9-5 R5 载体）─────────
    enter(shape.id, '④');
    const rlbKey = `pv-iv-${shape.id.toLowerCase()}-rlb`;
    const rollbackProbe = async (): Promise<{ rolled: boolean; err?: string }> => {
      const c = await mig!.connect();
      try {
        await c.query('BEGIN');
        await c.query('SET LOCAL ROLE app_role');
        await c.query(`SELECT set_config('app.principal_user', $1, true)`, [CAND]);
        await c.query(`SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))`, ['begin', rlbKey]);
        // 同事务内先做一笔「先于预留的写」（begin 形状·经 DEFINER 同形落 consumption 行=RLS 语境无关），
        // 再调 DEFINER 预留 99.00（桶余不足）→ 抛 → 整事务回滚零悬账
        await c.query(`SELECT probe_ent_reserve_for_application($1,$2,$3,$4,'mock_interview',0.01,3600)`, [rowOwner, bucketOwner, shape.payer, rlbKey]);
        await c.query(`SELECT probe_ent_reserve_for_application($1,$2,$3,$4,'mock_interview',99.00,3600)`, [rowOwner, bucketOwner, shape.payer, rlbKey + ':2']);
        await c.query('COMMIT');
        return { rolled: false };
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message ?? '';
        await c.query('ROLLBACK');
        return { rolled: msg === 'insufficient_entitlement', err: msg };
      } finally { c.release(); }
    };
    const rr = await rollbackProbe();
    A(`${tag}④ 企业额度不足 → DEFINER 预留抛 insufficient_entitlement（402 映射源不变）`, rr.rolled);
    const after = await mig!.query(`SELECT
      (SELECT count(*)::int FROM entitlement_consumption WHERE idempotency_key IN ($1,$2)) AS cons,
      (SELECT coalesce(sum(units_reserved),0)::numeric FROM entitlement_bucket WHERE owner_user_id=$3 AND kind='enterprise') AS reserved`,
      [rlbKey, rlbKey + ':2', bucketOwner]);
    A(`${tag}④b-iv 回滚零残留：先导写+预留+消费行全部消失（begin 回滚语义不变·片2④）`,
      after.rows[0]?.cons === 0 && Number(after.rows[0]?.reserved) === 1);
    const advisory = await mig!.query(`SELECT pg_try_advisory_lock(hashtext('begin'), hashtext($1)) AS ok`, [rlbKey]);
    const advisoryOk = advisory.rows[0]?.ok === true;
    if (advisoryOk) await mig!.query(`SELECT pg_advisory_unlock(hashtext('begin'), hashtext($1))`, [rlbKey]);
    A(`${tag}④b-iv2 事务级 advisory 锁无悬挂（xact 锁随回滚释放）`, advisoryOk);
    // ④b（§9-5 R5）：B 端 abandon 零悬账面——owner 会话释放 + DEFINER 对偶退桶 → 桶回补/行 released/
    // 候选人桶零变/下一拍 sweeper 零扫。以「克隆行」演练（不动 ⑤⑥ 底座行）。
    const abKey = `pv-iv-${shape.id.toLowerCase()}-ab`;
    await mig!.query(`INSERT INTO entitlement_consumption(owner_user_id,idempotency_key,service_type,units_requested,payer_user_id,lease_expires_at,allocations)
      VALUES ($1,$2,'mock_interview',1.00,$3,now()+interval '3600 seconds',$4)`, [
      rowOwner, abKey, shape.payer,
      JSON.stringify([{ bucket_id: (await mig!.query(`SELECT id FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise' LIMIT 1`, [bucketOwner])).rows[0].id, units: 1.0 }]),
    ]);
    await mig!.query(`UPDATE entitlement_bucket SET units_reserved = units_reserved + 1.00 WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]);
    const abRel = await asPrincipal(mig!, rowOwner, (c) => c.query(
      `UPDATE entitlement_consumption SET status='released' WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='reserved' RETURNING allocations`, [rowOwner, abKey]));
    const abAllocs = (abRel.rows[0]?.allocations ?? []) as Array<{ bucket_id: string; units: number }>;
    let abRefundOk = abRel.rowCount === 1;
    for (const a of abAllocs) {
      try {
        await asPrincipal(mig!, rowOwner, (c) => c.query(
          `SELECT probe_ent_apply_allocation($1,$2,$3,$4::numeric,$5::numeric)`, [rowOwner, abKey, a.bucket_id, -Number(a.units), 0]));
      } catch (e) { abRefundOk = false; console.log(`DEBUG ④b applier: ${(e as { message?: string })?.message}`); }
    }
    const abBucket = await mig!.query(`SELECT units_reserved FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]);
    const abResweep = await asPrincipal(mig!, rowOwner, (c) => c.query(
      `UPDATE entitlement_consumption SET status='released' WHERE owner_user_id=$1 AND status='reserved' AND lease_expires_at < now() RETURNING id`, [rowOwner]));
    const candBuckets = await mig!.query(`SELECT count(*)::int AS n FROM entitlement_bucket WHERE owner_user_id=$1`, [CAND]);
    A(`${tag}④b B 端 abandon 零悬账：释放+DEFINER 对偶退桶 → units_reserved 回补至 1.00（R5 面）`,
      abRefundOk && Number(abBucket.rows[0]?.units_reserved) === 1);
    A(`${tag}④b-2 abandon 后行 released ∧ sweeper 下拍零扫 ∧ 候选人桶零变`,
      abResweep.rowCount === 0 && candBuckets.rows[0]?.n === 0);

    // ── ⑤ sweeper owner 传参+RLS 上下文重验证（rev2-R1 扩面：reconcileOwner B 端支路行为验证）──
    // 判支原文（commerce-reconcile.ts，rebase 后 :58）：SELECT application_id FROM interview
    //   WHERE id=$1 AND owner_user_id=$2 FOR UPDATE —— 在 sweeper owner 语境下 B 端行必须可见且
    //   application_id 非空 → 走 failInterviewAndRelease 支（:65）；0 行=静默误入 C 端 abandon 支（:75）
    //   =「错配 owner 下 B 端行静默误支」→ 判据 FAIL。桶退还=DEFINER 对偶（RLS 下 consumption owner
    //   会话不可直写 payer 桶·gateway_entpay_apply_allocation 同形）。
    enter(shape.id, '⑤');
    await mig!.query(`UPDATE entitlement_consumption SET lease_expires_at = now() - interval '1 second' WHERE idempotency_key=$1`, [key1]);
    // sweeper 枚举语境（gateway_dispatch_owners('commerce') 返回 consumption 行 owner——即 sweeper 将
    // 以该 principal 上下文进入 reconcileOwner）
    const enumerated = (await mig!.query(`SELECT gateway_dispatch_owners('commerce') AS o`)).rows.map((r: any) => String(r.o));
    A(`${tag}⑤-0 sweeper 枚举含消费行 owner（dispatch 语境=行 owner）`, enumerated.includes(rowOwner));
    // 判支行为验证：在「消费行 owner=形状 rowOwner」的 sweeper 语境下，B 端 interview 行必须可见
    const judged = await asPrincipal(mig!, rowOwner, (c) => c.query(
      `SELECT application_id FROM interview WHERE id=$1 AND owner_user_id=$2 FOR UPDATE`, ['pv-iv-' + shape.id.toLowerCase(), rowOwner]));
    const bBranchReachable = judged.rowCount === 1 && judged.rows[0]?.application_id != null;
    A(`${tag}⑤ B 端判支在消费行 owner 语境可见且 application_id 非空（必走 fail 支·不误入 abandon 支）`,
      bBranchReachable);
    // 反例守卫：错配 owner 语境（他者 principal）下判支=0 行 → 该形状若以他者上下文扫描即静默误支
    const wrongCtx = rowOwner === CAND ? bucketOwner : CAND;
    const judgedWrong = await asPrincipal(mig!, wrongCtx, (c) => c.query(
      `SELECT application_id FROM interview WHERE id=$1 AND owner_user_id=$2 FOR UPDATE`, ['pv-iv-' + shape.id.toLowerCase(), rowOwner]));
    A(`${tag}⑤-err 反例留痕：错配 owner 语境判支=0 行（0 行=会静默落入 C 端 abandon 支·不可作为 sweeper 语境）`,
      judgedWrong.rowCount === 0);
    // sweep 同形回收（消费行 owner 语境·原子 UPDATE 复核 lease）+ DEFINER 对偶退桶
    const sweep = await asPrincipal(mig!, rowOwner, (c) => c.query(
      `UPDATE entitlement_consumption SET status='released'
        WHERE owner_user_id=$1 AND status='reserved' AND lease_expires_at < now()
        RETURNING id, idempotency_key, service_type, allocations`, [rowOwner]));
    A(`${tag}⑤-sweep sweeper 同形回收：消费行 owner 语境下租约过期行被扫出（恰 1 行·${key1}）`,
      sweep.rowCount === 1 && sweep.rows[0]?.idempotency_key === key1);
    const allocs = (sweep.rows[0]?.allocations ?? []) as Array<{ bucket_id: string; units: number }>;
    let refundOk = sweep.rowCount === 1;
    for (const a of allocs) {
      try {
        await asPrincipal(mig!, rowOwner, (c) => c.query(
          `SELECT probe_ent_apply_allocation($1,$2,$3,$4::numeric,$5::numeric)`, [rowOwner, key1, a.bucket_id, -Number(a.units), 0]));
      } catch (e) { refundOk = false; console.log(`DEBUG ⑤-refund applier: ${(e as { message?: string })?.message}`); }
    }
    const bucket5 = await mig!.query(`SELECT units_reserved FROM entitlement_bucket WHERE owner_user_id=$1 AND kind='enterprise'`, [bucketOwner]);
    A(`${tag}⑤-refund sweeper 退还企业桶 units_reserved=0（DEFINER 对偶·零预留泄漏·对账兜底路可通行）`,
      refundOk && Number(bucket5.rows[0]?.units_reserved) === 0);

    // ── ⑥ 预留租约续约连续性（REQUEST §1.0-c⑥·interview-consumer.ts :224 主路/:233 心跳同拍）──
    // 续约调用形状（现码零改面）：renewReservationLease(c, owner, interviewId, …) 以 **dispatch owner
    // （=interview 行 owner=候选人）** 在其 principal 语境执行——语句镜像 commerce.ts renewReservationLease。
    enter(shape.id, '⑥');
    await mig!.query(`UPDATE entitlement_consumption SET status='reserved', lease_expires_at=now()-interval '1 second' WHERE idempotency_key=$1`, [key1]);
    const renewMain = await asPrincipal(mig!, CAND, (c) => c.query(
      `UPDATE entitlement_consumption SET lease_expires_at = now() + ('1800' || ' seconds')::interval
        WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='reserved'`, [CAND, key1]));
    const renewHeartbeat = await asPrincipal(mig!, CAND, (c) => c.query(
      `UPDATE entitlement_consumption SET lease_expires_at = now() + ('1800' || ' seconds')::interval
        WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='reserved'`, [CAND, key1]));
    A(`${tag}⑥ 主路续约（dispatch owner=候选人语境）rowCount=1（活会话不被 sweeper 误扫·片2⑥）`,
      renewMain.rowCount === 1);
    A(`${tag}⑥b 心跳同拍续约 rowCount=1（:224/:233 双路连续）`, renewHeartbeat.rowCount === 1);
    // 信息面（不计格）：若以行 owner 语境续约（形状乙的「适配后」形状）——rowCount 与所需 plumbing 改动留痕
    const renewRowOwner = await asPrincipal(mig!, rowOwner, (c) => c.query(
      `UPDATE entitlement_consumption SET lease_expires_at = now() + ('1800' || ' seconds')::interval
        WHERE owner_user_id=$1 AND idempotency_key=$2 AND status='reserved'`, [rowOwner, key1]));
    console.log(`INFO  ${tag}⑥-info 行 owner 语境续约 rowCount=${renewRowOwner.rowCount}（形状乙适配需 :224/:233 每 renewal 先解析消费行 owner=新增 plumbing·非现码零改面）`);
    // （⑤-sweep/⑤-refund 已将该形状消费行置 released 且桶预留归零——⑥ 只动 lease_expires_at，无需清理写）
  }

  // ── 「形状×判据」矩阵 + D-1 裁决（六件×两形状·缺格=裁决无效）────────────────────────
  const cellIds = ['①', '②', '③', '④', '⑤', '⑥'];
  console.log('\n════ D-1 「形状×判据」矩阵（六件×两形状·逐格留痕）════');
  console.log('形状\\判据    ①预留跨RLS  ②幂等单行  ③RLS纵深  ④回滚+④b零悬账  ⑤sweeper B支  ⑥租约续约');
  const shapeFullPass: string[] = [];
  for (const shape of SHAPES) {
    const row = cellIds.map((cid) => ((cells[shape.id]?.[cid] ?? false) ? 'PASS' : 'FAIL'));
    const full = cellIds.every((cid) => cells[shape.id]?.[cid] === true);
    if (full) shapeFullPass.push(shape.id);
    console.log(`${shape.id} ${shape.label.padEnd(24)} ${row.join('      ')}`);
  }
  if (shapeFullPass.length === 1) {
    const win = SHAPES.find((s) => s.id === shapeFullPass[0])!;
    console.log(`\nD-1 裁决：形状${win.id} 全六件 PASS ⇒ 消费行 owner=${win.rowOwner === CAND ? '候选人' : '招聘方'}·payer_user_id=招聘方（写入 0157 头注）`);
  } else if (shapeFullPass.length === 2) {
    console.log('\nD-1 裁决：两形状均全 PASS（并列·EXEC 按 REQUEST §1.0 形状甲=worker 面零改最小触面落卷）');
  } else {
    console.log(`\nD-1 裁决：无形状全六件 PASS（全 PASS 形状数=${shapeFullPass.length}）⇒ STOP 手上报协调方（Ban 择劣上码）`);
  }

  // 收尾判定：至少一个形状全六件 PASS ⇒ 闸开（0-c PASS·D-1 可裁决）；否则 FAIL=STOP。
  const gateOpen = shapeFullPass.length >= 1;
  console.log(gateOpen
    ? `✓ entpay:s2:preverify（0-c 闸）: 全${Object.values(cells).flatMap((r) => Object.values(r)).length} 格留痕·形状${shapeFullPass.join('/')} 全六件 PASS`
    : `✗ entpay:s2:preverify（0-c 闸）: 两形状均不全 PASS → FAIL=STOP·手上报协调方`);
  process.exit(gateOpen ? 0 : 1);
}

main()
  .catch(async (e: unknown) => {
    console.error('PREVERIFY-ABORT（FAIL=STOP·片2 前置闸 §1.2.0-c 未过·手上报协调方）', e);
    process.exit(1);
  })
  .then(async () => {
    for (const p of [mig]) { try { await p?.end(); } catch { /* ignore */ } }
  });
