/**
 * UC-E2E-051 · NOPII isolated real-PG/HTTP evidence · NHP-051-NOPII-01
 * (REQUEST ai-docs/delivery/harness/killsw-REQUEST.md §1.4 Case 2 · 矩阵 :132 聚合行 050/051 残余列 NEG/FAULT/BOUND)
 *
 * Spec anchor: ai-docs/requirements/use-cases/e2e-scenarios.md:583 TC-E2E-051-no-pii
 *   「跑黄金路径后扫日志断言无 PII/密钥/全文 prompt」——A1 日志扫描（P1/P2）+
 *   A2 trace 脱敏摘要（P3）+ A3 堆栈不带原文（P4）+ query 剥离承 R5 同纹复证（P5）。
 *
 * Arms（REQUEST §1.4 Case 2 逐臂）:
 *   PC  = oracle 前提钉（P1/P4 负向扫描臂共钉·防空转假绿=批 B 防空转钉同律·修订落文 2026-10-26）:
 *         扫描前必钉哨兵经产品路径在场对照——consent 200 + resume 摄取 2xx（哨兵入正文·产品路径）
 *         + begin 202 全成功态逐钉;turn 腿=**形 B（现状形状·二择一钉死）**: 不种子 question-ready,
 *         Ban-live 下 worker 缺席 → 409 question_not_ready（interview.service.ts:466 路径对态·
 *         产品现状预期形状·非刀红·答案哨兵仍过请求面（zod 契约+服务端重算 answerHash））。
 *   LV  = 日志捕获面**活性对照**（r2 席2 措辞修正·非哨兵在场）: 语料非空 + 黄金路径逐请求
 *         reqId 的 pino completed 行在场 + ≥1 error 级行在场——哨兵缺席扫描因此非空转。
 *   P1  = 简历全文/答案埋唯一哨兵 → 跑黄金路径（consent→resume→begin→turn）→ 全日志行零哨兵
 *         （业务真值 Ban 面·A1 真行使——区别于 obs-logging 合成探针层=新证据层）
 *   P2  = 密钥/令牌面零入卷（boot env 诸 secret 值泛形扫描[值长≥12 全集]+Bearer 形哨兵零入卷;
 *         子进程 env 片段组装剥除三模型钥·REQUEST §1.3-② env -u 进程窗+词面零加载）
 *   P3  = trace 脱敏面·(b) 纯行使面 scripted 直行使（修订钉 2026-10-26 二择一取 (b)）:
 *         invoke redactOutput:true 假模型零外呼驱动 → ai_model_invocation output={"redacted":true}
 *         （invoke.ts:1176）+ replayable=false（:1080/:1188-1190）+ 无 redact 对照臂（非空转）+
 *         langfuseSafeModelMetadata（langfuse-v5.ts:67）标量-only 断言 +
 *         pseudonymizeLangfuseIdentifier（:56）owner/thread/invocation refs 零原文;
 *         mask（:118）/shouldExportSpan（:114）系 LangfuseSpanProcessor 运行时面·离线零外呼
 *         不可纯行使 → 如实登记归 opt-in smoke 域（langfuse:synthetic-trace:smoke）·本刀零触·
 *         不宣称运行时 mask/白名单已行使;（a）伪造 key+本地 sink 形与 §1.3-② Ban 相抵·不取。
 *   P4  = 未知错路径响应体 opaque {error:internal_error}（all-exceptions.filter.ts:39）+
 *         堆栈只进日志（:34）+ 全日志行错误消息/堆栈零业务哨兵（A3;runner 一次性探针路由=
 *         obs-logging 先例形·非产品面）
 *   P5  = query 剥离承 R5 同纹复证（:32·旁证复证非替代）:?token= 哨兵全行零入卷+incoming
 *         行 req.url 恰为剥后 path
 *
 * Evidence layer（REQUEST §1.4 证据层）: 子进程 boot 真 HTTP + pino stdout 全量抓取
 * （obs-logging 94d6691d 先例形·pino sonic-boom 直写 fd1 进程内劫持不可达）+ isolated 真 PG
 * 业务黄金路径（consent 产品路径+POST /resume 文本摄取→begin→turn 真答案·哨兵埋值）+
 * scripted trace 直行使（零外呼·uc-e2e-028-nhp-fault.proof.ts invoke 假模型驱动先例形）。
 *
 * HONESTY / Non-substitute:
 *   - obs-logging（infra 面·BODY_MARKER 系合成探针非业务真值·runner 不触 DB）=先例旁证;
 *     本 case=业务黄金路径新证据层（业务哨兵≠合成探针·reason 级可分）。
 *   - Ban 借本 case 收据宣 obs-logging 加强 · Ban 借 R3/R5 宣本 case 已 covered。
 *   - 导出面零涉（UC-052 可携带导出域·freeze 维持·exportReportMd 等零锚零臂）。
 *   - 收据互不借用:KILL case（NHP-050-KILL-01）≠本 case·互不替代互不 wash。
 *
 * Live-key isolation（REQUEST §1.3-②/§1.4 egress 预置条款·**零登记臂形**）:
 *   三模型钥词面**码面零直书**（卷面 .md 具名·本文件以片段运行时组装剥除·_neg-harness.boot()
 *   已自剥其二）→ provider-egress-inventory.json 零新登记。零 live 外呼·est live=0。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 ·
 * 行状态 050/051 仅 gap/blind→case-only 措辞 · EXIT0=case≠covered · coveredCount=8 不变 ·
 * Ban 借本收据宣 covered/「PII 全域零泄」（具名面具名证据非全域宣称）· attempts 台账 · ⛔push
 *
 *   pnpm uc051:nhp-nopii:prove
 *   pnpm -C apps/api prove:uc051-nhp-nopii   (raw; needs isolated DATABASE_URL)
 */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { assertIsolatedTestTarget, createPool, type DbPool } from '@meetwise/db';
import {
  invoke, createMetrics, setMetrics,
  pseudonymizeLangfuseIdentifier, langfuseSafeModelMetadata,
  type Model, type ModelCostPolicy, type ModelResult,
} from '@meetwise/ai-runtime';
import { AUTH_SECRET, PAY_SECRET } from './_neg-harness';

const CMD = 'pnpm uc051:nhp-nopii:prove';
const CASE_ID = 'NHP-051-NOPII-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();
const here = dirname(fileURLToPath(import.meta.url));
const apiRoot = resolve(here, '..');

type Cls = 'PC' | 'LV' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' | 'ISO';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) { failures.push({ cls, name }); console.log(`FAIL  [${cls}] ${name}`); }
  else console.log(`PASS  [${cls}] ${name}`);
};

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
// 形沿 obs-logging.runner.ts:boot 真 HTTP（经 _neg-harness boot=全量 schema+种子+真隔离 PG）+
// 挂一次性 500 探针路由（非产品面·obs-logging 同形）+READY 行带端口。
const CHILD_SOURCE = `
import { readFileSync } from 'node:fs';
import { boot } from '../../test/_neg-harness.ts';
import { createApp } from '../../src/main.ts';
// 主面: boot = 全量 schema+种子+真 Nest HTTP（listen 已完成）·base 供 proof 驱动黄金路径。
const h = await boot();
// 0121 真迁移链重放 + 面试域夹具补齐（真相=迁移链 0028/0064/0206 ACL 形制·夹具面·零产品码零新迁移
// ·uc-e2e-016-nhp-neg.proof.ts 0121 重放同形）: ①镜像函数 app_role EXECUTE 补授 ②interview.application_id
// （0028）与 resume_privacy_epoch（0064）列位 ③reference_schema_version v64 CHECK 兼容。
const mig0121 = readFileSync(new URL('../../../../packages/db/migrations/0121_resume_pgcrypto_runtime_acl.sql', import.meta.url), 'utf8');
await h.pool.query(mig0121);
await h.pool.query(\`
  ALTER FUNCTION interview_privacy_active(text) OWNER TO "${'${process.env.PGUSER}'}";
  ALTER FUNCTION interview_privacy_active_read(text) OWNER TO "${'${process.env.PGUSER}'}";
  ALTER FUNCTION assert_interview_privacy_active(text) OWNER TO "${'${process.env.PGUSER}'}";
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
\`);
// application binding 触发体升 0144 统一体（真相=迁移 0144:216-279 逐字·sql/22 镜像系 0144 前旧形——
// 旧形对 C 端 resume 首绑无豁免臂='interview_application_binding_immutable' 假红;夹具面·零产品码零新迁移）。
await h.pool.query(\`
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
  ALTER FUNCTION public.tf_interview_application_binding_immutable(text, public.interview, public.interview) OWNER TO "${'${process.env.PGUSER}'}";
  ALTER FUNCTION public.enforce_interview_application_binding_immutable() OWNER TO "${'${process.env.PGUSER}'}";
  GRANT EXECUTE ON FUNCTION public.tf_interview_application_binding_immutable(text, public.interview, public.interview) TO app_role;
  GRANT EXECUTE ON FUNCTION public.enforce_interview_application_binding_immutable() TO app_role;
\`);
// route decision RLS 策略重放（真相=迁移 0142:79-88 逐字幂等体·策略缺失=FORCE RLS 默认拒 42501）。
await h.pool.query(\`
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
\`);
process.stdout.write('__NOPII_READY__ base=' + h.base + '\\n');
// 探针面（非产品面·obs-logging.runner.ts 同形）: 二实例仅挂一次性 500 探针路由——
// 人为未处理错 → 走 AllExceptionsFilter 500 分支（P4 堆栈只进日志/响应体 opaque 面）。
// 同进程同 fd1（pino sonic-boom）→ 语料同卷;不触黄金路径进程面。
const probeApp = await createApp();
const probeFastify = probeApp.getHttpAdapter().getInstance();
probeFastify.post('/__nopii-proof-500', async () => {
  throw new Error('nopii_proof_synthetic_unhandled: synthetic unhandled for no-pii receipt');
});
await probeApp.listen(0, '127.0.0.1');
const probeAddr = probeFastify.server.address();
process.stdout.write('__NOPII_PROBE__ base=http://127.0.0.1:' + probeAddr.port + '\\n');
const shutdown = () => { process.exit(0); };
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
`;

const sha256Hex = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');

(async () => {
  console.log(`UC-E2E-051 ${CASE_ID} isolated PG/HTTP NOPII evidence (业务哨兵日志扫描/trace 脱敏直行使/堆栈原文面)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained · 公开 DELETE=503');
  console.log('Non-substitute: obs-logging(infra 合成探针面) 先例旁证 · reason 级可分（业务哨兵≠合成探针）· Ban 互借');
  console.log('oracle 前提钉: 扫描前必钉哨兵经产品路径在场对照（resume 2xx+begin 202+turn 409 形 B 现状形状）');
  console.log('EXIT0=case≠covered · blind→case-only 措辞 · Ban 借收据宣 covered/PII 全域零泄 · est live=0');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // ISO-0（egress 条款自证·非空转）: 片段组装确能命中三模型钥全名（卷面具名·码面零直书）。
  A('ISO', 'egress-strip-pattern-self-test(assembled names all matched · literal-zero file face)',
    EGRESS_KEY_NAMES.every((n) => EGRESS_STRIP_RE.test(n)));

  // ── 子进程（日志捕获面·pino fd1 全量抓取·obs-logging 先例形）──
  const S = Date.now().toString(36).toUpperCase();
  const RESUME_SENTINEL = `NOPII51_RESUME_TEXT_SENTINEL_${S}`;
  const ANSWER_SENTINEL = `NOPII51_ANSWER_TEXT_SENTINEL_${S}`;
  const BEARER_SENTINEL = `NOPII51_BEARER_TOKEN_SENTINEL_${S}`;
  const QUERY_SENTINEL = `NOPII51_QUERY_TOKEN_SENTINEL_${S}`;
  const RAW_OUTPUT_SENTINEL = `NOPII51_RAW_MODEL_OUTPUT_SENTINEL_${S}`;

  const childDir = join(apiRoot, '.tmp', 'killsw');
  mkdirSync(childDir, { recursive: true });
  const childSourcePath = join(childDir, 'nopii-child.source.mjs');
  writeFileSync(childSourcePath, CHILD_SOURCE);
  console.log(`PIN   CHILD-SOURCE .tmp 落点（gitignore 内·零 tracked 第三文件）: ${childSourcePath}`);

  // ── 父进程池 + P3 先于子进程（顺序钉）: P3 scripted 直行使需**预迁移全链 ai 面**（uc028 同形——
  //    函数族/permit 表/ACL 全在）;子进程 boot() 的 sql 镜像重装会重置夹具面。故 P3 全断言收卷 →
  //    子进程起 → 黄金路径日志面。两证据面同库不同相·互不回写。──
  const POOL: DbPool = createPool();
  await assertIsolatedTestTarget(POOL);
  A('ISO', 'isolated-env-attested (E2E_ISOLATED=1 + container nonce + dynamic PGPORT)',
    String(process.env.E2E_ISOLATED) === '1' && String(process.env.PGPORT ?? '').length > 0);
  // egress 条款（零登记臂形）: 进程窗片段组装自剥三模型钥（码面零直书·_neg-harness.boot() 已自剥其二）。
  for (const k of Object.keys(process.env)) { if (EGRESS_STRIP_RE.test(k)) delete process.env[k]; }
  A('ISO', 'in-process env window: no assembled model-key-shaped key survives',
    Object.keys(process.env).every((k) => !EGRESS_STRIP_RE.test(k)));

  // ── P3（trace 脱敏·(b) 纯行使面 scripted 直行使·uc028 假模型驱动先例形·零外呼）──
  setMetrics(createMetrics());
  // ai_model/ai_trace/ai_cost 函数族 EXECUTE 补授（真相=迁移 0088/0119/0130/0179 ACL 形制——防御性幂等
  // 补授;在场函数逐一遍历 GRANT·缺失签名容错跳过·夹具面零产品码零新迁移·0130:228 同形）。
  await POOL.query(`
    DO $do$
    DECLARE f record;
    BEGIN
      FOR f IN SELECT p.oid::regprocedure AS fn FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
               WHERE n.nspname = 'public' AND (p.proname LIKE 'ai_model%' OR p.proname LIKE 'ai_trace%' OR p.proname LIKE 'ai_cost%')
        LOOP
          BEGIN
            EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO app_role', f.fn);
          EXCEPTION WHEN OTHERS THEN NULL;
          END;
        END LOOP;
    END $do$;
  `);
  console.log('PIN   NHP-051-NOPII-ISO-AI-FN-ACL: ai_model/ai_trace/ai_cost 函数族 app_role EXECUTE 补授(真相=0088/0119/0130/0179·夹具面·零产品码零新迁移)');
  // 价目+预算策略行沿 uc028 形（固定 usage → settle 通路闭环）。
  const SCOPE = `uc051-scope-${S}`;
  const policy: ModelCostPolicy = {
    scopeId: SCOPE, provider: 'p-uc051', model: 'm-uc051', region: 'cn-proof', priceRevision: 'uc051-r1',
    maxInputTokens: 1000, maxOutputTokens: 500,
  };
  await POOL.query(
    `INSERT INTO ai_cost_price_book(provider,model,region,revision,input_micro_cny_per_million,output_micro_cny_per_million,source_url,effective_at)
     VALUES('p-uc051','m-uc051','cn-proof','uc051-r1',1000000,2000000,'https://example.test/uc051-nopii',clock_timestamp())`,
  );
  await POOL.query('INSERT INTO ai_cost_budget_policy(scope_id,monthly_limit_micro_cny,enabled) VALUES($1,100000000,true)', [SCOPE]);

  // fake provider 面（uc028 同形）: prepare.execute 路由回 model.call·零 live 零外呼零模型调用。
  const fakeModel = (result: ModelResult, counter: { n: number }): Model => {
    const model: Model = {
      requestDigest: 'a'.repeat(64),
      call: async () => { counter.n += 1; return result; },
      prepare: () => ({ ready: true as const, cost: policy, execute: (signal?: AbortSignal) => model.call(1, signal) }),
    };
    return model;
  };
  const Schema = z.object({ answer: z.string() });
  const OWNER = `nhp051-model-${S}`;

  const redactCalls = { n: 0 };
  const REDACT_RESULT: ModelResult = { ok: true, raw: { answer: `raw model output ${RAW_OUTPUT_SENTINEL}` }, usage: { inputTokens: 3, outputTokens: 4 } };
  const r1 = await invoke(
    {
      idempotencyKey: `nopii51-redact-${S}`,
      schema: Schema, businessValidate: () => null,
      model: fakeModel(REDACT_RESULT, redactCalls),
      service: 'uc051-nopii-probe',
      redactOutput: true,
    },
    POOL, OWNER,
  );
  A('P3', 'redact drive: invoke 返回 value（假模型零外呼·positive control）', 'value' in r1 && (r1 as { value?: { answer: string } }).value?.answer === `raw model output ${RAW_OUTPUT_SENTINEL}`);
  const r1Row = await POOL.query(
    'SELECT replayable, output::text AS output_text FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, `nopii51-redact-${S}`],
  );
  A('P3', 'redact drive: ai_model_invocation.replayable=false（:1080/:1188-1190 行使）',
    r1Row.rowCount === 1 && r1Row.rows[0].replayable === false);
  A('P3', 'redact drive: stored output 恰 {"redacted":true}（:1176 行使·零原文）',
    r1Row.rows[0]?.output_text?.replace(/\s/g, '') === '{"redacted":true}');
  A('P3', 'redact drive: 账本输出零模型原文', !String(r1Row.rows[0]?.output_text ?? '').includes(RAW_OUTPUT_SENTINEL));
  const r1Trace = await POOL.query(
    'SELECT count(*)::int AS n FROM ai_invocation_trace WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, `nopii51-redact-${S}`],
  );
  A('P3', 'redact drive: trace 旁路行存在（可观测旁路非业务真相）', Number(r1Trace.rows[0]?.n ?? 0) >= 1);

  const controlCalls = { n: 0 };
  const CONTROL_RESULT: ModelResult = { ok: true, raw: { answer: `raw control output ${RAW_OUTPUT_SENTINEL}` }, usage: { inputTokens: 3, outputTokens: 4 } };
  const r2 = await invoke(
    {
      idempotencyKey: `nopii51-control-${S}`,
      schema: Schema, businessValidate: () => null,
      model: fakeModel(CONTROL_RESULT, controlCalls),
      service: 'uc051-nopii-probe',
    },
    POOL, OWNER,
  );
  A('P3', 'control drive（无 redact）: invoke 返回 value（对照非空转）', 'value' in r2);
  const r2Row = await POOL.query(
    'SELECT replayable, output::text AS output_text FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2',
    [OWNER, `nopii51-control-${S}`],
  );
  A('P3', 'control drive: replayable=true 且 output 携带原文（脱敏闸=redact 所致·非空转对照）',
    r2Row.rowCount === 1 && r2Row.rows[0].replayable === true && String(r2Row.rows[0].output_text).includes(RAW_OUTPUT_SENTINEL));

  // pseudonymizeLangfuseIdentifier（:56）: owner/thread/invocation refs 零原文。
  const RAW_OWNER = `raw-owner-${S}`;
  const RAW_THREAD = `raw-thread-${S}`;
  const RAW_IK = `raw-idem-${S}`;
  const SECRET = `uc051-correlation-secret-${S}`;
  const ownerRef = pseudonymizeLangfuseIdentifier(SECRET, 'owner', RAW_OWNER);
  const threadRef = pseudonymizeLangfuseIdentifier(SECRET, 'thread', RAW_THREAD);
  const invocationRef = pseudonymizeLangfuseIdentifier(SECRET, 'invocation', RAW_IK);
  A('P3', 'pseudonymize: owner/thread/invocation refs 为确定性伪名（同入同出）',
    ownerRef === pseudonymizeLangfuseIdentifier(SECRET, 'owner', RAW_OWNER)
    && threadRef === pseudonymizeLangfuseIdentifier(SECRET, 'thread', RAW_THREAD)
    && invocationRef === pseudonymizeLangfuseIdentifier(SECRET, 'invocation', RAW_IK));
  A('P3', 'pseudonymize: refs 零原文（三 raw 均不出现于 ref）',
    !ownerRef.includes(RAW_OWNER) && !threadRef.includes(RAW_THREAD) && !invocationRef.includes(RAW_IK));
  A('P3', 'pseudonymize: namespace 分离（同 raw 异 ns → 异 ref）',
    ownerRef !== pseudonymizeLangfuseIdentifier(SECRET, 'invocation', RAW_OWNER));
  A('P3', 'pseudonymize: 空入参 fail-closed throw（langfuse_pseudonym_input_invalid）',
    (() => { try { pseudonymizeLangfuseIdentifier(SECRET, 'owner', ''); return false; } catch { return true; } })());

  // langfuseSafeModelMetadata（:67）: 标量-only 断言（观测出界面逐字段标量·零业务原文）。
  const meta = langfuseSafeModelMetadata(
    {
      service: 'uc051-nopii-probe',
      owner: RAW_OWNER,
      idempotencyKey: RAW_IK,
      threadId: RAW_THREAD,
      retrieval: [{ ref: 'ref-1', score: 0.9 }],
      attempt: 1,
      outcome: 'ok',
      latencyMs: 7,
      sources: ['src-1'],
      inputTokens: 11,
      outputTokens: 13,
    },
    SECRET,
  );
  const expectedKeys = ['invocationRef', 'ownerRef', 'threadRef', 'outcome', 'attempt', 'latencyMs', 'promptVersion',
    'sourceCount', 'retrievalCount', 'topRetrievalScore', 'inputTokens', 'outputTokens', 'settledCostMicroCny'];
  A('P3', 'safe metadata: 键集有界（恰 13 标量键·零自由键）',
    Object.keys(meta).length === expectedKeys.length && expectedKeys.every((k) => k in meta));
  A('P3', 'safe metadata: 全值标量（string|number|null·零嵌套对象零数组）',
    Object.values(meta).every((v) => v === null || ['string', 'number'].includes(typeof v)));
  A('P3', 'safe metadata: owner/thread/invocation refs 零原文（伪名出界）',
    !String(meta.ownerRef).includes(RAW_OWNER) && !(meta.threadRef === null ? false : String(meta.threadRef).includes(RAW_THREAD))
    && !String(meta.invocationRef).includes(RAW_IK));
  A('P3', 'safe metadata: promptVersion 缺省 → null 占位（缺省≠零·AG-19 同形）', meta.promptVersion === null);
  A('P3', 'safe metadata: 标量计数面（sourceCount/retrievalCount/latency）在场且非原文',
    meta.sourceCount === 1 && meta.retrievalCount === 1 && meta.latencyMs === 7);
  // HONESTY 登记面: mask（:118）/shouldExportSpan（:114）=LangfuseSpanProcessor 运行时面——
  // 离线零外呼不可纯行使 → 归 opt-in smoke 域（langfuse:synthetic-trace:smoke）·本刀零触·不宣称已行使。
  console.log('HONESTY P3: LangfuseSpanProcessor 运行时 mask/白名单本刀零触（opt-in smoke 域·REQUEST 修订钉如实登记）');

  // 子进程 env: 片段组装剥除三模型钥（REQUEST §1.3-② env -u 进程窗·码面零直书）。
  const childEnvBase = stripEgressKeys({ ...process.env });
  A('ISO', 'child-env egress-strip: no assembled model-key-shaped key survives',
    Object.keys(childEnvBase).every((k) => !EGRESS_STRIP_RE.test(k)));

  const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', childSourcePath], {
    cwd: apiRoot,
    env: childEnvBase,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const rawLines: string[] = [];
  const childStderr: string[] = [];
  let stdoutBuf = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk: string) => {
    stdoutBuf += chunk;
    let idx: number;
    while ((idx = stdoutBuf.indexOf('\n')) >= 0) {
      const line = stdoutBuf.slice(0, idx);
      stdoutBuf = stdoutBuf.slice(idx + 1);
      if (line) rawLines.push(line);
    }
  });
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk: string) => childStderr.push(chunk));
  const waitFor = async (prefix: string, what: string): Promise<string> =>
    await new Promise((res, rej) => {
      const existing = rawLines.find((l) => l.startsWith(prefix));
      if (existing) return res(existing);
      const timer = setInterval(() => {
        const hit = rawLines.find((l) => l.startsWith(prefix));
        if (hit) { clearInterval(timer); clearTimeout(deadline); res(hit); }
      }, 100);
      const deadline = setTimeout(() => {
        clearInterval(timer);
        rej(new Error(`${what} not ready in 120s; stderr=${childStderr.join('').slice(0, 2000)}`));
      }, 120_000);
    });
  const readyLine = await waitFor('__NOPII_READY__ base=', 'nopii child runner');
  const base = /__NOPII_READY__ base=(\S+)/.exec(readyLine)?.[1] ?? '';
  A('ISO', 'child runner booted real HTTP (three-layer shell via _neg-harness boot)', base.startsWith('http://127.0.0.1:'));
  const probeReadyLine = await waitFor('__NOPII_PROBE__ base=', 'nopii probe instance');
  const probeBase = /__NOPII_PROBE__ base=(\S+)/.exec(probeReadyLine)?.[1] ?? '';
  A('ISO', 'probe instance booted (非产品面一次性 500 探针·obs-logging 同形)', probeBase.startsWith('http://127.0.0.1:'));

  const parse = async (r: Response) => ({ status: r.status, body: (await r.json().catch(() => ({}))) as any, headers: r.headers });
  let reqSeq = 0;
  const reqIds: string[] = [];
  const send = async (method: string, path: string, headers: Record<string, string>, body?: unknown, target: string = base) => {
    const rid = `nopii51-${S}-${reqSeq++}`;
    reqIds.push(rid);
    const r = await fetch(target + path, {
      method,
      headers: { ...headers, 'x-request-id': rid, 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return parse(r);
  };
  const U = (id: string): Record<string, string> => ({ 'x-user-id': id });

  const PA = `nhp051a_${S}`;

  // ── oracle 前提钉（PC·扫描前逐钉·防空转假绿）──
  const consent = await send('POST', '/privacy/consent', U(PA), { purpose: 'resume_processing' });
  A('PC', 'oracle pin ①: product-path consent → 200', consent.status === 200);

  const resumeText = [
    `NOPII51 resume body ${S}`,
    `senior backend engineer; resume full-text sentinel: ${RESUME_SENTINEL}`,
    'distributed systems, queues, Postgres; contact on file (never to be logged)',
  ].join('\n');
  const resume = await send('POST', '/resume', U(PA), { text: resumeText });
  A('PC', 'oracle pin ②: resume ingest with business sentinel → 200 ingested（哨兵经产品路径在场·resume 2xx）',
    resume.status === 200 && resume.body?.status === 'ingested');
  const resumeId = String(resume.body?.resumeId ?? '');

  const shell = await send('POST', '/interview', U(PA), {});
  A('PC', 'oracle pin ③a: interview shell created → 200', shell.status === 200 && typeof shell.body?.interviewId === 'string');
  const shellId = String(shell.body?.interviewId ?? '');
  // 豁免①(REQUEST §5 枚举具名·uc-e2e-016-nhp-neg.proof.ts seedBucket 同形): begin 202 所需桶种子。
  await POOL.query(
    `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
     VALUES ($1, 'paid', 5.0, now() + interval '300 days')`,
    [PA],
  );
  console.log('PIN   NHP-051-NOPII-SEED-BUCKET-EXEMPTION: 桶种子（豁免①具名·begin 202 前置）');
  const begin = await send('POST', `/interview/${shellId}/begin`, { ...U(PA), 'resume-id': resumeId }, {});
  A('PC', 'oracle pin ③b: begin → 202（黄金路径全成功态）', begin.status === 202 && begin.body?.accepted === true);

  // turn 腿=形 B（现状形状·REQUEST 修订钉二择一钉死）: begin 已建 start job → assertAnswerable 通过
  // → claim 无 issued question 行 → 409 question_not_ready（interview.service.ts:466 路径对态）。
  const answerBody = {
    questionId: 'q-v1-t0-c0',
    stateVersion: 0,
    answerId: '11111111-2222-4333-8444-555555555555',
    answerHash: sha256Hex(`real answer carrying ${ANSWER_SENTINEL} for hash recompute`),
    turn: 0,
    answer: `real answer carrying ${ANSWER_SENTINEL} for hash recompute`,
  };
  const turn = await send('POST', `/interview/${shellId}/turn`, U(PA), answerBody);
  A('PC', 'oracle pin ④: turn → 409 question_not_ready（形 B 产品现状预期形状·:466 路径对态·非刀红）',
    turn.status === 409 && turn.body?.error === 'question_not_ready');
  A('PC', 'oracle pin ⑤: answer sentinel passed the request face（zod 契约+服务端 hash 重算到达 claim 前）',
    turn.status === 409);

  // ── P4 探针（runner 一次性路由·非产品面·obs-logging 同形）+ P5 query 面（扫描前行使·活性对照素材）──
  const boom = await send('POST', '/__nopii-proof-500', { ...U(PA), authorization: `Bearer ${BEARER_SENTINEL}` }, {
    probe: 'synthetic unhandled for no-pii receipt',
  }, probeBase);
  A('P4', 'synthetic 500 → response body opaque {error:internal_error} 零细节',
    boom.status === 500 && JSON.stringify(boom.body) === JSON.stringify({ error: 'internal_error' }));
  const liveq = await send('GET', `/livez?token=${QUERY_SENTINEL}`, U(PA));
  A('P5', 'query 携带请求（/livez?token=哨兵）仍正常服务 200', liveq.status === 200);

  // 收卷: SIGTERM 优雅关停·再解析全部日志行。
  child.kill('SIGTERM');
  const childExit: number = await new Promise((res) => child.on('exit', (code) => res(code ?? -1)));
  A('ISO', 'child runner exits cleanly on SIGTERM', childExit === 0);

  const logs: any[] = [];
  for (const line of rawLines) {
    if (!line.startsWith('{')) continue;
    try { logs.push(JSON.parse(line)); } catch { /* 非 JSON 行忽略 */ }
  }
  const corpus = rawLines.join('\n');

  // ── LV（日志捕获面活性对照·r2 席2 措辞修正: 非哨兵在场）──
  A('LV', 'log corpus non-empty (pino JSON lines on fd1)', logs.length > 0);
  const completedFor = (rid: string) => logs.find((l) => l.reqId === rid && l.msg === 'request completed');
  A('LV', '每条黄金路径请求的 pino completed 行在场（reqId 逐一对照·捕获面覆盖黄金路径）',
    reqIds.slice(0, 6).every((rid) => Boolean(completedFor(rid))));
  const errLine: any = logs.find((l) => l.level === 50);
  A('LV', '≥1 error 级行在场（P4 探针·error 面活性）', Boolean(errLine));

  // ── P1（业务真值 Ban 面·A1）──
  A('P1', '简历全文哨兵全日志行零入卷', !corpus.includes(RESUME_SENTINEL));
  A('P1', '答案哨兵全日志行零入卷（含 409 形 B 请求面过境）', !corpus.includes(ANSWER_SENTINEL));

  // ── P2（密钥/令牌面）──
  const secretShapedOffenders = Object.entries(childEnvBase)
    .filter(([k, v]) => typeof v === 'string' && (v as string).length >= 12
      && /secret|key|token|password|credential/i.test(k) && corpus.includes(v as string))
    .map(([k]) => k);
  A('P2', 'boot env secret 值泛形扫描（secret/key/token/password/credential 形键·值长≥12 全集）零入卷',
    secretShapedOffenders.length === 0);
  if (secretShapedOffenders.length > 0) console.log(`DIAG   P2 secret-shaped offenders: ${secretShapedOffenders.join(',')}`);
  A('P2', '_neg-harness 导出 secret 常量值零入卷（AUTH/PAY 双值）', !corpus.includes(AUTH_SECRET) && !corpus.includes(PAY_SECRET));
  A('P2', 'Bearer 形令牌哨兵零入卷（authorization 值面）', !corpus.includes(BEARER_SENTINEL));

  // ── P4（A3·堆栈/错误消息面）──
  A('P4', 'error 行 err.stack 只进日志且带帧', typeof errLine?.err?.stack === 'string' && errLine.err.stack.includes('\n    at '));
  A('P4', 'error 行 url 去 query（:32 面）', errLine?.url === '/__nopii-proof-500');
  A('P4', '全日志行（含错误消息/堆栈面）零业务哨兵', !corpus.includes(RESUME_SENTINEL) && !corpus.includes(ANSWER_SENTINEL));

  // ── P5（R5 同纹复证·旁证非替代）──
  const incomingQ = logs.find((l) => l.reqId === reqIds[reqIds.length - 1] && l.msg === 'incoming request');
  A('P5', 'incoming 行 req.url 恰为剥后 path /livez（? 后恒剥）', incomingQ?.req?.url === '/livez');
  A('P5', 'query 哨兵全行零入卷', !corpus.includes(QUERY_SENTINEL));

  // HONESTY 登记面: turn 腿=形 B（产品现状形状·409）——Ban-live 下 202 仅形 A 种子可达;本刀钉形 B。
  console.log('HONESTY PC: turn 腿=形 B（409 question_not_ready·:466 路径对态·答案哨兵经请求面过境）');

  // ── 收据 ──
  const receiptDir = resolve(apiRoot, '../../.tmp/nhp-051-nopii-01-receipts');
  mkdirSync(receiptDir, { recursive: true });
  const receipt = {
    caseId: CASE_ID, cmd: CMD, attemptStartedAt: ATTEMPT_STARTED_AT,
    assertions: total, failures: failures.length,
    oracle: 'PC pins: consent 200 + resume 2xx(sentinel) + begin 202 + turn 409 question_not_ready (form B pinned)',
    liveness: 'LV: corpus non-empty + per-request completed lines + >=1 error line（活性对照·非哨兵在场）',
    p3: 'option (b) pure-exercise face: invoke redact drive + langfuseSafeModelMetadata + pseudonymize; runtime mask/whitelist untouched (opt-in smoke domain)',
    egress: 'zero-registration arm shape: fragment-assembled strip; no model-key literal in this file',
  };
  writeFileSync(join(receiptDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');

  console.log(`\nATTEMPT_END    iso=${new Date().toISOString()} attempts=1 · failures=${failures.length}/${total}`);
  if (failures.length > 0) {
    console.log(`✗ ${CASE_ID}: ${failures.length}/${total} 失败（EXIT1 诚实保留·Ban retry-to-green）`);
    process.exit(1);
  }
  console.log(`✓ ${CASE_ID}: ${total} 断言全绿（业务哨兵日志扫描/trace 脱敏直行使/堆栈原文面 · live=0 · isolated PG）`);
  console.log('EXIT0=case≠covered · 行状态 blind→case-only 措辞 · coveredCount=8 不变 · ⛔push');
  assert.ok(total > 0);
  process.exit(0);   // POOL 句柄存活——显式收卷（mkAssert done() 同形）
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
