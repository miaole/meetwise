/**
 * UC-E2E-050 · KILL isolated real-PG/HTTP evidence · NHP-050-KILL-01
 * (REQUEST ai-docs/delivery/harness/killsw-REQUEST.md §1.4 Case 1 · 矩阵 :132 聚合行 050/051 残余列 FAULT/NEG/BOUND)
 *
 * Spec anchor: ai-docs/requirements/use-cases/e2e-scenarios.md:575 TC-E2E-050-kill
 *   「触发 kill-switch 断言 safely_terminated + 业务一致」——本 case 行使**触发面**
 *   （env 闸 503+业务一致零副作用）；图终态面归 uc-e2e-018-graph-safely-terminated
 *   （49a33634 先例）互不替代（REQUEST §1.1 图面读·Ban 二次实现）。
 *
 * Arms（REQUEST §1.4 Case 1 逐臂）:
 *   K1  = env=1 begin → 503 content_safety_kill_switch_active + 诚实文案逐字 +
 *         净账零漂（job 行 0/额度净 0/interview 行 0·:425 闸前置时序）
 *   K2  = env=1 turn → 同 503 具名码 + 答案零入队（answer job 0·:436）
 *   K3  = off（unset）对照 → begin 照常 202 现状字节（off=现状保真·BOUND）
 *   K4  = 非法值 '2' → 500 internal_error fail-closed（非静默 off·NEG）+
 *         日志词面（子进程 pino fd1 抓取·obs-logging 94d6691d 先例形）
 *   K5  = 双闸同设（kill+preview 写门同窗）→ 503 kill 码先行（:425 先于 :426 闸序·BOUND）
 *         + 对照臂（kill 撤·preview 单设 → 503 public_preview_read_only=第二闸在位非空转）
 *   K6  = 全臂净账审计（job/entitlement/interview 三面零漂移·kill 臂零事务零写入;
 *         唯一写入=off 臂 begin·业务事实独立保全=A2 验收映射）
 *
 * Evidence layer（REQUEST §1.4 证据层）: isolated 真 PG + 真 HTTP（_neg-harness 三层壳 ·
 * uc-e2e-016-nhp-neg.proof.ts 先例形）+ 子进程 env 变体（kill 进程 env=1 / off 进程 unset ·
 * 沿 obs-logging spawn 形——pino sonic-boom 直写 fd1,日志收据必须子进程 stdout 抓取）。
 * 子进程 runner 源运行时落 apps/api/.tmp/（gitignore 内·零 tracked 第三文件——REQUEST §2-3
 * diff 面恰两 proof 新文件）。
 *
 * HONESTY（REQUEST §1.4 Case 1 头注同钉）:
 *   - applications.start 绕行残余面（applications.service.ts:44-58 同核未过 kill 闸）
 *     = NOT claimed（§1.1 边界读·零臂零断言零修复·Ban 借本收据宣「kill-switch 全入口覆盖」）。
 *   - 图安全终态面归 UC-018 先例（49a33634·只读旁证）·本 case=触发面 only。
 *   - i6-239 静态文本门（scripts/i6-239-gates.proof.mjs 源码词面断言）=邻接旁证·
 *     本 case=行为性行使·收据互不借用互不 wash。
 *   - privacy-erasure-http（DELETE 503 pin·UC-052 面）/ public-preview-write-gate（preview 闸）
 *     =旁证互不替代。
 *
 * Live-key isolation（REQUEST §1.3-②/§1.4 egress 预置条款·**零登记臂形**）:
 *   三模型钥词面**码面零直书**（卷面 .md 具名·本文件以片段运行时组装剥除子进程 env·
 *   _neg-harness.boot() 已自剥其二）→ provider-egress-inventory.json 零新登记。
 *   零 live 外呼·两 case 全离线隔离 · est live=0。
 *
 * Non-substitute: i6-239（静态词面门）/ uc018 图 prove（安全终态）/ public-preview-write-gate
 * （preview 闸行为）/ privacy-erasure-http（UC-052 DELETE pin）=旁证互不替代 · Ban 互借关列。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 ·
 * 行状态 050/051 仅 gap/blind→case-only 措辞 · EXIT0=case≠covered · coveredCount=8 不变 ·
 * Ban 借本收据宣 covered / 宣全入口覆盖 · attempts 台账逐次留痕 · Ban retry-to-green · ⛔push
 *
 *   pnpm uc050:nhp-kill:prove
 *   pnpm -C apps/api prove:uc050-nhp-kill   (raw; needs isolated DATABASE_URL)
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { boot } from './_neg-harness';

const CMD = 'pnpm uc050:nhp-kill:prove';
const CASE_ID = 'NHP-050-KILL-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();
const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(here, '..');

type Cls = 'K1' | 'K2' | 'K3' | 'K4' | 'K5' | 'K6' | 'ISO' | 'SEED' | 'CHILD';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

const KILL_ENV = 'MEETWISE_CONTENT_SAFETY_KILL_SWITCH';
const PREVIEW_ENV = 'MEETWISE_PUBLIC_PREVIEW';
const KILL_CODE = 'content_safety_kill_switch_active';
const KILL_MSG = '内容安全开关已开启：面试出题与作答提交暂停';
const INVALID_LITERAL = 'invalid_meetwise_content_safety_kill_switch';

// ── egress 预置条款（零登记臂形·REQUEST §1.4）: 三模型钥词面码面零直书——片段运行时组装。 ──
const KEY_FRAGMENTS = {
  a: ['MODEL', 'API', 'KEY'],
  b: ['DASHSCOPE', 'API', 'KEY'],
  c: ['DASHSCOPE', 'COMPAT', 'BASE', 'URL'],
} as const;
const fragJoin = (parts: readonly string[]): string => parts.join('_');
const EGRESS_KEY_NAMES = [fragJoin(KEY_FRAGMENTS.a), fragJoin(KEY_FRAGMENTS.b), fragJoin(KEY_FRAGMENTS.c)];
const EGRESS_STRIP_RE = new RegExp(EGRESS_KEY_NAMES.join('|'));
const stripEgressKeys = (env: NodeJS.ProcessEnv): NodeJS.ProcessEnv =>
  Object.fromEntries(Object.entries(env).filter(([k]) => !EGRESS_STRIP_RE.test(k)));

// 子进程 runner 源（运行时落 apps/api/.tmp/killsw/——gitignore 内·零 tracked 第三文件）。
// 形沿 obs-logging.runner.ts（受控 runner·自身不是门）:boot 真 HTTP 服务器+按 mode 脚本行使+
// __KILLSW_RESULT__ JSON 行落 fd1（与 pino 行同流·proof 侧按前缀分流）。
const CHILD_SOURCE = `
import { createHash } from 'node:crypto';
import { createApp } from '../../src/main.ts';
const mode = process.env.__KILLSW_MODE__;
const killVal = process.env[${JSON.stringify(KILL_ENV)}];
const app = await createApp();
await app.init();
await app.listen(0, '127.0.0.1');
if (mode === 'dual' && killVal === '1') {
  // 服务级双闸闸序面:preview env 窗必须在 boot 之后置入——createApp boot 期读该 env 决定
  // ingress 闸安装(部署面),请求期读才有 :426 denyPublicPreviewWrite 服务级闸在位而 ingress 闸未装。
  process.env[${JSON.stringify(PREVIEW_ENV)}] = '1';
}
const addr = app.getHttpAdapter().getInstance().server.address();
process.stdout.write('__KILLSW_READY__ port=' + addr.port + '\\n');
const base = 'http://127.0.0.1:' + addr.port;
const U = (id) => ({ 'x-user-id': id, 'x-request-id': 'child-' + mode + '-1' });
const post = async (p, h, body) => {
  const r = await fetch(base + p, { method: 'POST', headers: { ...h, 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) });
  return { status: r.status, body: await r.json().catch(() => ({})) };
};
const sha256 = (s) => createHash('sha256').update(s, 'utf8').digest('hex');
const results = [];
const principal = process.env.__KILLSW_PRINCIPAL__;
const shellId = process.env.__KILLSW_SHELL__;
if (mode === 'kill' || mode === 'dual' || mode === 'illegal') {
  const b1 = await post('/interview/' + shellId + '/begin', { ...U(principal), 'resume-id': process.env.__KILLSW_RESUME__ }, {});
  results.push({ arm: 'begin', status: b1.status, body: b1.body });
  const answer = 'KILLSW_CHILD_TURN_ANSWER_MARKER';
  const turn = await post('/interview/' + shellId + '/turn', U(principal), {
    questionId: 'q-v1-t0-c0', stateVersion: 0, answerId: '11111111-2222-4333-8444-555555555555',
    answerHash: sha256(answer), turn: 0, answer,
  });
  results.push({ arm: 'turn', status: turn.status, body: turn.body });
}
if (mode === 'off') {
  const b1 = await post('/interview/' + shellId + '/begin', { ...U(principal), 'resume-id': process.env.__KILLSW_RESUME__ }, {});
  results.push({ arm: 'begin', status: b1.status, body: b1.body });
}
process.stdout.write('__KILLSW_RESULT__ ' + JSON.stringify({ mode, killVal, results }) + '\\n');
// 停机契约:等待父进程 SIGTERM → fastify/pino 优雅关停(sonic-boom 缓冲随 close 落 fd1)——
// 禁 process.exit 直退(缓冲丢失=日志收据面假死·obs-logging SIGTERM 先例形)。
const shutdown = () => { void app.close().then(() => process.exit(0)); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`;

interface ChildResult {
  mode: string;
  killVal: string | undefined;
  results: { arm: string; status: number; body: any }[];
}

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');
const UUID_WELLFORMED_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

type Ledger = { available: number; consumptionRows: number };

(async () => {
  console.log(`UC-E2E-050 ${CASE_ID} isolated PG/HTTP KILL evidence (kill-switch 触发面/三态 fail-closed/双闸优先序/零副作用)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · 公开 DELETE=503');
  console.log('HONESTY: applications.start 绕行残余面 NOT claimed · 图面归 UC-018 先例 · 本 case=触发面 only');
  console.log('Non-substitute: i6-239 静态词面门 / uc018 图 prove / public-preview-write-gate / privacy-erasure-http 互不替代');
  console.log('EXIT0=case≠covered · gap→case-only 措辞 · Ban 借收据宣 covered/全入口覆盖 · est live=0');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // ISO-0（egress 条款自证·非空转）: 片段组装确能命中三模型钥全名（卷面具名·码面零直书）。
  A('ISO', 'egress-strip-pattern-self-test(assembled names all matched · literal-zero file face)',
    EGRESS_KEY_NAMES.every((n) => EGRESS_STRIP_RE.test(n)));

  const h = await boot();
  const pool = h.pool;
  const dbUrl = String(process.env.DATABASE_URL ?? process.env.PGHOST ?? '');
  const pgPort = String(process.env.PGPORT ?? '');
  A('ISO', 'dynamic-PG-port-present(or DATABASE_URL)', pgPort.length > 0 || /:\d+/.test(dbUrl));
  A('ISO', 'kill-switch-env-unset-at-boot(off=缺省现状)', process.env[KILL_ENV] === undefined);
  A('ISO', 'preview-env-unset-at-boot(ingress 闸未装·服务级闸序面可达)', process.env[PREVIEW_ENV] === undefined);

  // 0121 真迁移链重放(夹具面·REVOKE+GRANT 幂等·真相=迁移链): harness sql/01 重建 app_role 会抹
  // 0121 的 pgp_sym_encrypt EXECUTE ACL — 产品路径 POST /resume 全链(blob 加密)在 harness 面行使
  // 所需。零产品码触·零新迁移（uc-e2e-016-nhp-neg.proof.ts 同形）。
  const mig0121 = readFileSync(resolve(apiRoot, '../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql'), 'utf8');
  await pool.query(mig0121);
  console.log('PIN   NHP-050-KILL-ISO-0121-REPLAY: harness 面迁移链重放(pgp ACL·真相=迁移链 migrate 全链)');
  // 面试域夹具补齐(真相=迁移链 0028/0064/0206 ACL 形制·harness 镜像裸缺·0121 重放同律·零产品码零新迁移):
  //  ① 镜像函数 EXECUTE 补授(interview_privacy_active/_read/assert——sql 镜像面重建后 app_role 缺 EXECUTE
  //     → create 复用检查 42501;GRANT 幂等·迁移本存 app_role 授权则 no-op);
  //  ② interview.application_id(0028)与 interview/interview_job.resume_privacy_epoch(0064)列位补齐
  //     (beginInterviewCore :137 复用检查/begin 绑定读 42703 防御);
  //  ③ reference_schema_version v64 兼容(0064 CHECK 49/50/64·镜像 sql/05 内联 CHECK=50 需重建)。
  await pool.query(`
    ALTER FUNCTION interview_privacy_active(text) OWNER TO "${String(process.env.PGUSER ?? 'meetwise').replace(/"/g, '')}";
    ALTER FUNCTION interview_privacy_active_read(text) OWNER TO "${String(process.env.PGUSER ?? 'meetwise').replace(/"/g, '')}";
    ALTER FUNCTION assert_interview_privacy_active(text) OWNER TO "${String(process.env.PGUSER ?? 'meetwise').replace(/"/g, '')}";
    GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
    GRANT EXECUTE ON FUNCTION interview_privacy_active_read(text) TO app_role;
    GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
    ALTER TABLE interview ADD COLUMN IF NOT EXISTS application_id text;
    ALTER TABLE interview ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
    ALTER TABLE interview_job ADD COLUMN IF NOT EXISTS resume_privacy_epoch bigint;
    ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_check;
    ALTER TABLE interview_job DROP CONSTRAINT IF EXISTS interview_job_reference_schema_version_chk;
    ALTER TABLE interview_job ADD CONSTRAINT interview_job_reference_schema_version_chk CHECK (reference_schema_version IN (49,50,64));
    ALTER TABLE interview_job ALTER COLUMN reference_schema_version SET DEFAULT 64;
    ALTER TABLE interview DROP CONSTRAINT IF EXISTS ck_interview_application_binding_complete;
    ALTER TABLE interview ADD CONSTRAINT ck_interview_application_binding_complete
      CHECK (
        (application_id IS NULL AND job_id IS NULL)
        OR (application_id IS NOT NULL AND job_id IS NOT NULL AND resume_id IS NOT NULL)
      );
  `);
  // ④ application binding 触发体升 0144 统一体（真相=迁移 0144:216-279 逐字·sql/22 镜像系 0144 前旧形——
  //    旧形对 C 端 resume 首绑无豁免臂='interview_application_binding_immutable' 假红;0144 统一体含
  //    「unbound+created+首绑 resume」豁免与 epoch 一致性校验。harness 镜像函数面·零产品码零新迁移）。
  await pool.query(`
    CREATE OR REPLACE FUNCTION public.tf_interview_application_binding_immutable(
      p_op text, p_old public.interview, p_new public.interview
    ) RETURNS void LANGUAGE plpgsql AS $fn$
    BEGIN
      IF p_op='INSERT' THEN
        IF (p_new.resume_id IS NULL) <> (p_new.resume_privacy_epoch IS NULL) THEN
          RAISE EXCEPTION 'interview_resume_epoch_pair_required' USING ERRCODE='P0001';
        END IF;
        IF p_new.resume_id IS NOT NULL THEN
          PERFORM 1 FROM resume r
           WHERE r.id=p_new.resume_id AND r.owner_user_id=p_new.owner_user_id
             AND r.status='ingested' AND r.privacy_epoch=p_new.resume_privacy_epoch;
          IF NOT FOUND THEN RAISE EXCEPTION 'interview_resume_epoch_not_active_or_mismatched' USING ERRCODE='P0001'; END IF;
        END IF;
        RETURN;
      END IF;
      IF p_new.application_id IS DISTINCT FROM p_old.application_id
         OR p_new.job_id IS DISTINCT FROM p_old.job_id
         OR p_new.application_attempt IS DISTINCT FROM p_old.application_attempt THEN
        RAISE EXCEPTION 'interview_application_binding_immutable' USING ERRCODE='P0001';
      END IF;
      IF p_new.resume_id IS DISTINCT FROM p_old.resume_id
         OR p_new.resume_privacy_epoch IS DISTINCT FROM p_old.resume_privacy_epoch THEN
        IF NOT (
          p_old.application_id IS NULL AND p_new.application_id IS NULL
          AND p_old.resume_id IS NULL AND p_old.resume_privacy_epoch IS NULL
          AND p_new.resume_id IS NOT NULL AND p_new.resume_privacy_epoch IS NOT NULL
          AND p_old.status='created'
        ) THEN
          RAISE EXCEPTION 'interview_resume_binding_immutable' USING ERRCODE='P0001';
        END IF;
        PERFORM 1 FROM resume r
         WHERE r.id=p_new.resume_id AND r.owner_user_id=p_new.owner_user_id
           AND r.status='ingested' AND r.privacy_epoch=p_new.resume_privacy_epoch;
        IF NOT FOUND THEN RAISE EXCEPTION 'interview_resume_epoch_not_active_or_mismatched' USING ERRCODE='P0001'; END IF;
      END IF;
    END;
    $fn$;
    CREATE OR REPLACE FUNCTION public.enforce_interview_application_binding_immutable()
    RETURNS trigger LANGUAGE plpgsql AS $fn$
    BEGIN
      PERFORM public.tf_interview_application_binding_immutable(TG_OP, OLD, NEW);
      RETURN NEW;
    END;
    $fn$;
    ALTER FUNCTION public.tf_interview_application_binding_immutable(text, public.interview, public.interview) OWNER TO "${String(process.env.PGUSER ?? 'meetwise').replace(/"/g, '')}";
    ALTER FUNCTION public.enforce_interview_application_binding_immutable() OWNER TO "${String(process.env.PGUSER ?? 'meetwise').replace(/"/g, '')}";
    GRANT EXECUTE ON FUNCTION public.tf_interview_application_binding_immutable(text, public.interview, public.interview) TO app_role;
    GRANT EXECUTE ON FUNCTION public.enforce_interview_application_binding_immutable() TO app_role;
  `);
  // ⑤ route decision RLS 策略重放（真相=迁移 0142:79-88 逐字幂等体·策略缺失=FORCE RLS 默认拒 42501；
  //    策略在场则 no-op）。
  await pool.query(`
    DROP POLICY IF EXISTS p_candidate_profile_route_decision_owner ON candidate_profile_route_decision;
    CREATE POLICY p_candidate_profile_route_decision_owner ON candidate_profile_route_decision
      FOR ALL TO app_role
      USING (owner_user_id = current_setting('app.principal_user', true))
      WITH CHECK (owner_user_id = current_setting('app.principal_user', true));
    DROP POLICY IF EXISTS p_candidate_profile_route_snapshot_owner ON candidate_profile_route_snapshot;
    CREATE POLICY p_candidate_profile_route_snapshot_owner ON candidate_profile_route_snapshot
      FOR ALL TO app_role
      USING (candidate_user_id = current_setting('app.principal_user', true))
      WITH CHECK (candidate_user_id = current_setting('app.principal_user', true));
  `);
  const polCount = Number((await pool.query(
    `SELECT count(*)::int AS n FROM pg_policies WHERE tablename IN ('candidate_profile_route_decision','candidate_profile_route_snapshot')`,
  )).rows[0]?.n ?? 0);
  console.log(`PIN   NHP-050-KILL-ISO-INTERVIEW-FIXTURE: 面试域镜像 ACL/列位/触发体/RLS 策略补齐(真相=0028/0046/0049/0064/0142/0144/0206·夹具面·零产品码零新迁移·pg_policies=${polCount})`);

  const S = Date.now().toString(36).toUpperCase();
  // Principals: 一臂一主体（create() 复用检查=每主体恰一开放壳·互不污染·净账逐臂可归因）。
  const P_KILL = `nhp050k_${S}`;    // K1/K2/K4/K5 kill 臂壳
  const P_OFF = `nhp050o1_${S}`;    // K3 in-proc off 对照壳
  const P_OFF2 = `nhp050o2_${S}`;   // K3 子进程 off 对照壳（spawn env 变体面）

  const consent = async (principal: string) => {
    const r = await h.post('/privacy/consent', h.U(principal), { purpose: 'resume_processing' });
    A('SEED', `product-path consent ${principal} → 200`, r.status === 200);
    return r;
  };
  const uploadResume = async (principal: string, tag: string) => {
    const text = `NHP050 resume ${tag} ${S} — senior backend engineer with distributed systems background ${Math.random().toString(36).slice(2)}`;
    const r = await h.post('/resume', h.U(principal), { text });
    if (r.status !== 200 || r.body?.status !== 'ingested') {
      console.log(`SEED_FAIL uploadResume ${principal}/${tag} status=${r.status} body=${JSON.stringify(r.body)}`);
    }
    A('SEED', `product-path resume ${principal}/${tag} → 200 ingested`, r.status === 200 && r.body?.status === 'ingested');
    return r.body as { resumeId: string; status: string };
  };
  // 豁免①(REQUEST §5 枚举具名·uc-e2e-016-nhp-neg.proof.ts seedBucket 同形): entitlement_bucket
  // 桶种子 — begin 类臂（K3 off 对照/子进程 off 对照）所需。kill 臂不消费额度（闸前置）。
  const seedBucket = async (principal: string, units: number) => {
    await pool.query(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', $2, now() + interval '300 days')`,
      [principal, units],
    );
  };
  const createShell = async (principal: string) => {
    const r = await h.post('/interview', h.U(principal), {});
    A('SEED', `product-path interview shell ${principal} → 200 created`, r.status === 200 && typeof r.body?.interviewId === 'string');
    return String(r.body.interviewId);
  };

  const ledgerOf = async (principal: string): Promise<Ledger> => {
    const b = await pool.query(
      `SELECT COALESCE(SUM(units_total - units_reserved - units_consumed), 0)::float8 AS avail
         FROM entitlement_bucket WHERE owner_user_id=$1`, [principal]);
    const c = await pool.query(
      `SELECT count(*)::int AS n FROM entitlement_consumption WHERE owner_user_id=$1`, [principal]);
    return { available: Number(b.rows[0]?.avail ?? 0), consumptionRows: Number(c.rows[0]?.n ?? 0) };
  };
  const jobCountOf = async (interviewId: string, kind?: 'start' | 'answer') =>
    Number((await pool.query(
      `SELECT count(*)::int AS n FROM interview_job WHERE interview_id=$1 ${kind ? `AND kind='${kind}'` : ''}`,
      [interviewId],
    )).rows[0]?.n ?? 0);
  const interviewRowCountOf = async (principal: string) =>
    Number((await pool.query(
      `SELECT count(*)::int AS n FROM interview WHERE owner_user_id=$1`, [principal],
    )).rows[0]?.n ?? 0);

  // ── Seeds（kill 臂与 off 臂各自独立完备前置——off 臂 202 是唯一预期写入面）──
  await consent(P_KILL);
  await consent(P_OFF);
  await consent(P_OFF2);
  const resK = await uploadResume(P_KILL, 'K');
  const resO1 = await uploadResume(P_OFF, 'O1');
  const resO2 = await uploadResume(P_OFF2, 'O2');
  await seedBucket(P_KILL, 5.0);
  await seedBucket(P_OFF, 5.0);
  await seedBucket(P_OFF2, 5.0);
  const shellKill = await createShell(P_KILL);
  const shellOff1 = await createShell(P_OFF);
  const shellOff2 = await createShell(P_OFF2);
  A('SEED', 'three shells created (kill/off1/off2)', Boolean(shellKill && shellOff1 && shellOff2));

  const turnBody = {
    questionId: 'q-v1-t0-c0',
    stateVersion: 0,
    answerId: '11111111-2222-4333-8444-555555555555',
    answerHash: sha256('KILLSW_TURN_ANSWER_MARKER_TEXT'),
    turn: 0,
    answer: 'KILLSW_TURN_ANSWER_MARKER_TEXT',
  };

  // ── K3（off 对照·BOUND）: env unset → begin 照常 202 现状字节 ──
  A('K3', 'off: kill env stays unset through the off arm', process.env[KILL_ENV] === undefined);
  const offBefore = await ledgerOf(P_OFF);
  const offJobsBefore = await jobCountOf(shellOff1);
  const offBegin = await h.post(`/interview/${shellOff1}/begin`, { ...h.U(P_OFF), 'resume-id': resO1.resumeId }, {});
  A('K3', 'off begin → 202 (现状字节保真)', offBegin.status === 202);
  A('K3', 'off begin body {accepted:true, jobId} (现状形状)', offBegin.body?.accepted === true && typeof offBegin.body?.jobId === 'string');
  const offAfter = await ledgerOf(P_OFF);
  const offJobsAfter = await jobCountOf(shellOff1);
  const offDelta = {
    available: offBefore.available - offAfter.available,
    consumptionRows: offAfter.consumptionRows - offBefore.consumptionRows,
    jobs: offJobsAfter - offJobsBefore,
  };
  A('K3', 'off begin writes exactly one start job (对照面唯一写入)', offDelta.jobs === 1 && (await jobCountOf(shellOff1, 'start')) === 1);
  A('K3', 'off begin consumes/holds entitlement exactly once (额度单扣对照)', offDelta.consumptionRows === 1);
  console.log(`PIN   K3-OFF-DELTA available=-${offDelta.available} consumptionRows=+${offDelta.consumptionRows} jobs=+${offDelta.jobs} (off 单位成本基线)`);

  // ── K1（env=1 begin · FAULT）: 503 具名码 + 诚实文案逐字 + 零副作用 ──
  process.env[KILL_ENV] = '1';
  const killLedgerBefore = await ledgerOf(P_KILL);
  const killJobsBefore = await jobCountOf(shellKill);
  const killRowsBefore = await interviewRowCountOf(P_KILL);
  const killBegin = await h.post(`/interview/${shellKill}/begin`, { ...h.U(P_KILL), 'resume-id': resK.resumeId }, {});
  A('K1', 'env=1 begin → 503', killBegin.status === 503);
  A('K1', 'env=1 begin body error code exact (具名码)', killBegin.body?.error === KILL_CODE);
  A('K1', 'env=1 begin message 诚实文案逐字', killBegin.body?.message === KILL_MSG);
  const killLedgerAfter1 = await ledgerOf(P_KILL);
  A('K1', 'K1 net-ledger zero (额度净 0·消费行 0)', killLedgerAfter1.available === killLedgerBefore.available
    && killLedgerAfter1.consumptionRows === killLedgerBefore.consumptionRows);
  A('K1', 'K1 job rows zero for shell (job 行净 0)', (await jobCountOf(shellKill)) === killJobsBefore);

  // ── K2（env=1 turn · FAULT）: 同 503 具名码 + 答案零入队 ──
  const killTurn = await h.post(`/interview/${shellKill}/turn`, h.U(P_KILL), turnBody);
  A('K2', 'env=1 turn → 503 (同具名码)', killTurn.status === 503 && killTurn.body?.error === KILL_CODE);
  A('K2', 'env=1 turn 诚实文案逐字', killTurn.body?.message === KILL_MSG);
  A('K2', 'env=1 turn answer job rows zero (答案零入队)', (await jobCountOf(shellKill, 'answer')) === 0);

  // ── K4（非法值 fail-closed · NEG）: '2' → 500 opaque（非静默 off 非 202）──
  process.env[KILL_ENV] = '2';
  const illegalBegin = await h.post(`/interview/${shellKill}/begin`, { ...h.U(P_KILL), 'resume-id': resK.resumeId }, {});
  A('K4', "env='2' begin → 500 (fail-closed, 非静默 off)", illegalBegin.status === 500);
  A('K4', "env='2' begin body opaque {error:internal_error} 零细节", JSON.stringify(illegalBegin.body) === JSON.stringify({ error: 'internal_error' }));
  A('K4', 'K4 net-ledger zero (非法值路径零事务)', (await ledgerOf(P_KILL)).available === killLedgerAfter1.available
    && (await ledgerOf(P_KILL)).consumptionRows === killLedgerAfter1.consumptionRows);
  A('K4', 'K4 job rows still zero', (await jobCountOf(shellKill)) === killJobsBefore);
  process.env[KILL_ENV] = '1';

  // ── K5（双闸优先序 · BOUND）: kill+preview 同窗 → 503 kill 码先行（:425 先于 :426）──
  process.env[PREVIEW_ENV] = '1';
  const dualBegin = await h.post(`/interview/${shellKill}/begin`, { ...h.U(P_KILL), 'resume-id': resK.resumeId }, {});
  A('K5', 'dual-gate begin → 503 kill code first (非 public_preview_read_only)', dualBegin.status === 503 && dualBegin.body?.error === KILL_CODE);
  A('K5', 'dual-gate 诚实文案逐字（kill 闸文案）', dualBegin.body?.message === KILL_MSG);
  // 对照臂: kill 撤·preview 单设 → 503 public_preview_read_only（第二闸在位·优先序非空转）。
  delete process.env[KILL_ENV];
  const previewOnlyBegin = await h.post(`/interview/${shellKill}/begin`, { ...h.U(P_KILL), 'resume-id': resK.resumeId }, {});
  A('K5', 'control: kill removed + preview on → 503 public_preview_read_only (第二闸在位)',
    previewOnlyBegin.status === 503 && previewOnlyBegin.body?.error === 'public_preview_read_only');
  A('K5', 'K5 净账零（双闸/对照臂均零写入）', (await ledgerOf(P_KILL)).available === killLedgerBefore.available
    && (await jobCountOf(shellKill)) === killJobsBefore);
  // env 卫生: 测试窗收窗（REQUEST §3-6 仅测试进程 env 窗）。
  delete process.env[PREVIEW_ENV];
  A('ISO', 'env-window-hygiene: kill/preview env restored to unset after arms',
    process.env[KILL_ENV] === undefined && process.env[PREVIEW_ENV] === undefined);

  // ── 子进程 env 变体面（REQUEST §1.4 证据层·obs-logging spawn 形）──
  const childDir = join(apiRoot, '.tmp', 'killsw');
  mkdirSync(childDir, { recursive: true });
  const childSourcePath = join(childDir, 'killsw-child.source.mjs');
  writeFileSync(childSourcePath, CHILD_SOURCE);
  console.log(`PIN   CHILD-SOURCE .tmp 落点（gitignore 内·零 tracked 第三文件）: ${childSourcePath}`);

  const baseChildEnv = (): NodeJS.ProcessEnv => {
    // DATABASE_URL 与 PG* 组件互斥（database_url_conflicts_with_pg_components fail-closed）:
    // 本壳真 PG 形=PG* 组件（runner 注入·剥 DATABASE_URL）;假 DB 形=仅 DATABASE_URL（剥 PG*）。
    const env = stripEgressKeys({ ...process.env });
    delete env[KILL_ENV];
    delete env[PREVIEW_ENV];
    delete env.DATABASE_URL;
    return {
      ...env,
      NODE_ENV: 'test',
      OCR_ENABLED: '0',
      AUTH_DEV_HEADER: '1',
      AUTH_SECRET: 'test-secret-key',
      RESUME_ENC_KEY: 'test-resume-enc-key',
      RESUME_HASH_SECRET: 'test-resume-hash-secret',
      PAY_PROVIDER_SECRET: 'test-pay-secret',
    };
  };

  const runChild = async (mode: string, killVal: string | undefined, principal: string, shellId: string, resumeId: string, fakeDb: boolean) =>
    await new Promise<{ result: ChildResult | null; stdout: string[]; stderr: string[]; code: number }>((res) => {
      const env: NodeJS.ProcessEnv = {
        ...baseChildEnv(),
        __KILLSW_MODE__: mode,
        __KILLSW_PRINCIPAL__: principal,
        __KILLSW_SHELL__: shellId,
        __KILLSW_RESUME__: resumeId,
      };
      if (killVal === undefined) delete env[KILL_ENV]; else env[KILL_ENV] = killVal;
      if (fakeDb) {
        env.DATABASE_URL = 'postgresql://obs:proof@db.invalid:5432/obs';
        for (const pgKey of ['PGHOST', 'PGPORT', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) delete env[pgKey];
      }
      const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', childSourcePath], {
        cwd: apiRoot,
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const stdout: string[] = [];
      const stderr: string[] = [];
      let buf = '';
      let result: ChildResult | null = null;
      let sawResult = false;
      child.stdout.setEncoding('utf8');
      child.stdout.on('data', (chunk: string) => {
        buf += chunk;
        let idx: number;
        while ((idx = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, idx);
          buf = buf.slice(idx + 1);
          if (line) stdout.push(line);
          if (line.startsWith('__KILLSW_RESULT__') && !sawResult) {
            sawResult = true;
            try { result = JSON.parse(line.slice('__KILLSW_RESULT__ '.length)); } catch { result = null; }
            // RESULT 已得 → SIGTERM 优雅停机(pino/sonic-boom 缓冲随 close 落 fd1)·禁 SIGKILL 假死。
            setTimeout(() => { try { child.kill('SIGTERM'); } catch { /* noop */ } }, 250);
          }
        }
      });
      child.stderr.setEncoding('utf8');
      child.stderr.on('data', (c: string) => stderr.push(c));
      const timer = setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* noop */ } }, 120_000);
      child.on('exit', (code) => {
        clearTimeout(timer);
        if (!result) {
          const resultLine = stdout.join('').split('\n').find((l) => l.startsWith('__KILLSW_RESULT__'));
          if (resultLine) { try { result = JSON.parse(resultLine.slice('__KILLSW_RESULT__ '.length)); } catch { result = null; } }
        }
        if (!result || code !== 0) console.error(`child ${mode} no-result-or-exit-${code} stderr=${stderr.join('').slice(-800)}`);
        res({ result, stdout, stderr, code: code ?? -1 });
      });
    });

  // 子进程 env 变体自证: 剥除面无模型钥形键（ISO 面·组装口径亲证）。
  const childEnvProbe = baseChildEnv();
  A('ISO', 'child-env egress-strip: no assembled model-key-shaped key survives',
    Object.keys(childEnvProbe).every((k) => !EGRESS_STRIP_RE.test(k)));

  // child-kill（env=1 spawn 变体）: K1/K2 子进程面。假 DATABASE_URL（db.invalid）——503 路径
  // 零 DB 依赖的直接证据:闸前置,任何 DB 触碰都会使该臂非 503（机制红自暴露）。
  const killChild = await runChild('kill', '1', P_KILL, shellKill, resK.resumeId, true);
  A('CHILD', 'child(kill=1) exits cleanly', killChild.code === 0 && killChild.result !== null);
  const killChildBegin = killChild.result?.results.find((r) => r.arm === 'begin');
  const killChildTurn = killChild.result?.results.find((r) => r.arm === 'turn');
  A('CHILD', 'child(kill=1) begin → 503 具名码（spawn env 变体面）',
    killChildBegin?.status === 503 && killChildBegin?.body?.error === KILL_CODE && killChildBegin?.body?.message === KILL_MSG);
  A('CHILD', 'child(kill=1) turn → 503 具名码（spawn env 变体面）',
    killChildTurn?.status === 503 && killChildTurn?.body?.error === KILL_CODE);

  // child-dual（kill=1 + 请求期 preview=1）: 服务级双闸闸序 spawn 面（同假 DB 论证）。
  const dualChild = await runChild('dual', '1', P_KILL, shellKill, resK.resumeId, true);
  A('CHILD', 'child(dual) exits cleanly', dualChild.code === 0 && dualChild.result !== null);
  const dualChildBegin = dualChild.result?.results.find((r) => r.arm === 'begin');
  A('CHILD', 'child(dual) begin → 503 kill code 先行（:425 先于 :426 spawn 面）',
    dualChildBegin?.status === 503 && dualChildBegin?.body?.error === KILL_CODE);

  // child-off（unset spawn 变体）: K3 子进程面——唯一跨进程写入臂·净账由父审计。
  const off2LedgerBefore = await ledgerOf(P_OFF2);
  const offChild = await runChild('off', undefined, P_OFF2, shellOff2, resO2.resumeId, false);
  A('CHILD', 'child(off/unset) exits cleanly', offChild.code === 0 && offChild.result !== null);
  const offChildBegin = offChild.result?.results.find((r) => r.arm === 'begin');
  A('CHILD', 'child(off/unset) begin → 202 现状字节（spawn env 变体面·unset 唯一正确形）',
    offChildBegin?.status === 202 && offChildBegin?.body?.accepted === true);
  A('CHILD', 'child(off) write audited by parent: exactly one start job for its shell',
    (await jobCountOf(shellOff2, 'start')) === 1);
  const off2LedgerAfter = await ledgerOf(P_OFF2);
  A('CHILD', 'child(off) entitlement delta exactly one consumption（跨进程净账）',
    off2LedgerAfter.consumptionRows - off2LedgerBefore.consumptionRows === 1);
  A('CHILD', 'child spawn env truly had kill unset（result echoes killVal undefined）', offChild.result?.killVal === undefined);

  // child-illegal（env='2' spawn 变体·假 DB——该路径零 DB 触·K4 日志词面抓取面）。
  const illegalChild = await runChild('illegal', '2', P_KILL, shellKill, resK.resumeId, true);
  const illegalLines = illegalChild.stdout;
  const pinoLines: any[] = [];
  for (const line of illegalLines) {
    if (!line.startsWith('{')) continue;
    try { pinoLines.push(JSON.parse(line)); } catch { /* 非 JSON 行忽略 */ }
  }
  A('CHILD', 'child(illegal) 500 opaque body (spawn env 变体面)',
    illegalChild.result?.results.find((r) => r.arm === 'begin')?.status === 500
    && JSON.stringify(illegalChild.result?.results.find((r) => r.arm === 'begin')?.body) === JSON.stringify({ error: 'internal_error' }));
  A('CHILD', 'child(illegal) pino produced JSON log lines on fd1 (日志面活性对照)', pinoLines.length > 0);
  const errLine: any = pinoLines.find((l) => l.level === 50);
  A('CHILD', 'child(illegal) error-level line exists (K4 日志面活性)', Boolean(errLine));
  A('CHILD', 'K4 log literal: err.message === invalid_meetwise_content_safety_kill_switch (fail-closed 词面双断言·日志面)',
    errLine?.err?.message === INVALID_LITERAL);
  A('CHILD', 'K4 log err.stack present (堆栈只进日志面)', typeof errLine?.err?.stack === 'string' && errLine.err.stack.includes('\n    at '));
  A('CHILD', 'K4 log url query-stripped (url 去 query 面)', errLine?.url === `/interview/${shellKill}/begin`);
  if (!errLine) {
    console.log(`DIAG   child(illegal) pino msg 概览（诊断·非断言）: ${pinoLines.map((l) => `[${l.level}]${l.msg}`).join(' | ').slice(0, 600)}`);
    console.log(`DIAG   child(illegal) stderr 尾部: ${illegalChild.stderr.join('').slice(-800)}`);
  }

  // ── K6（全臂净账审计）: kill 臂零事务零写入·唯一写入=off 臂 begin×2 ──
  A('K6', 'kill-shell start jobs == 0（K1/K4/K5 全臂零入队）', (await jobCountOf(shellKill, 'start')) === 0);
  A('K6', 'kill-shell answer jobs == 0（K2 零入队）', (await jobCountOf(shellKill, 'answer')) === 0);
  A('K6', 'kill principal interview rows unchanged（零新面试行）', (await interviewRowCountOf(P_KILL)) === killRowsBefore);
  A('K6', 'kill principal entitlement net zero across all kill arms（额度净账 0）',
    (await ledgerOf(P_KILL)).available === killLedgerBefore.available
    && (await ledgerOf(P_KILL)).consumptionRows === killLedgerBefore.consumptionRows);
  A('K6', 'off arms total: exactly 2 start jobs / 2 consumption rows（唯一写入=off begin×2·业务事实独立保全）',
    (await jobCountOf(shellOff1, 'start')) === 1 && (await jobCountOf(shellOff2, 'start')) === 1
    && (await ledgerOf(P_OFF)).consumptionRows === offBefore.consumptionRows + 1
    && (await ledgerOf(P_OFF2)).consumptionRows === off2LedgerBefore.consumptionRows + 1);
  A('K6', 'off arms job kinds: start only（无 answer job 泄入）',
    (await jobCountOf(shellOff1)) === 1 && (await jobCountOf(shellOff2)) === 1);

  // ── 收据 ──
  const receiptDir = join(apiRoot, '../../.tmp/nhp-050-kill-01-receipts');
  mkdirSync(receiptDir, { recursive: true });
  const receipt = {
    caseId: CASE_ID, cmd: CMD, attemptStartedAt: ATTEMPT_STARTED_AT,
    assertions: total, failures: failures.length,
    killEnv: KILL_ENV, killCode: KILL_CODE, invalidLiteral: INVALID_LITERAL,
    egress: 'zero-registration arm shape: fragment-assembled strip; no model-key literal in this file',
    honesty: 'applications.start bypass NOT claimed; graph-face UC-018 precedent; trigger-face only',
  };
  writeFileSync(join(receiptDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');

  console.log(`\nATTEMPT_END    iso=${new Date().toISOString()} attempts=1 · failures=${failures.length}/${total}`);
  if (failures.length > 0) {
    console.log(`✗ ${CASE_ID}: ${failures.length}/${total} 失败（EXIT1 诚实保留·Ban retry-to-green）`);
    process.exit(1);
  }
  console.log(`✓ ${CASE_ID}: ${total} 断言全绿（kill 触发面/三态 fail-closed/双闸优先序/净账审计 · live=0 · isolated PG）`);
  console.log('EXIT0=case≠covered · 行状态 gap→case-only 措辞 · coveredCount=8 不变 · ⛔push');
  process.exit(0);   // boot() 的 listen/pool 句柄存活——显式收卷（mkAssert done() 同形）
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
