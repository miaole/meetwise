/**
 * UC-E2E-015 · FAULT isolated PG/HTTP evidence · NHP-015-FAULT-01
 * (REQUEST ai-docs/delivery/harness/uc15f-REQUEST.md §1 rev r1 终形 · 矩阵 :120 FAULT cell 残余亚层 ·
 *  case-matrix :96 锚「—」全族唯一零命令零收据 case · 批 C 卷 :21/:131「OCR DI OCR_VISION_CLIENT 缝」留后刀之 FAULT 半)
 *
 * Evidence layer: visionOcr seam 故障注入（scripted 客户端）→ 产品降级形状确定性
 * （422 `ocr_failed` + releaseConsumption 退费 + 工件卫生 + 账本 reason 级可分）。
 * 与 NEG/BOUND/ADV（输入形状拒·全在 visionOcr 调用之前止步）/LOAD（红停归排期）/PERF_api（延迟链）/
 * worker ocr.proof（单元直调+手搓 release）/web 面（文案枚举/伪造信封）互不替代互不借用（wash 否决 §1.3）。
 *
 * Arms（五面快照 r1 拆义：面 1-4 before/after 恒等 = resume 行数 / consumption confirmed 行数 /
 * resume_ocr_artifact 行数 / 桶可用额度；面 5 = 该臂恰 1 新 ai_model_invocation 行且 status/error_code 具名）:
 *   PC  = 管道活性对照（non-claim·臂序最先=canary）：scripted 成功（≥10 字含 Go/Redis 事实）→
 *         200 {status:'ingested', format:'image', ocr:true} + consumption confirmed 恰 1 + 成功后工件已删
 *         （resume.service :194）——仅证 harness 承载非假阴性（成功面=full.e2e live-key 已登记·zero claim·
 *         Ban 借 PC 宣成功面新证据）；承载缝/迁移缝/env 窗缝红先现于 PC（环境红与产品红据此可分）。
 *   F1  = throw 形：scripted `resume.vision` throw → invoke :1024 catch {transient, unknown}（未超时）→
 *         :1130 恒返 external_outcome_unknown → 422 `ocr_failed` reason=external_outcome_unknown（非 500
 *         非静默）+ release（:134）+ deleteArtifact（:135）+ 账本恰 1 行 status=unknown/error=external_outcome_unknown。
 *   F2  = 超时形：scripted 永不 resolve + MODEL_EXECUTION_TIMEOUT_MS='1000' 且 MODEL_TIMEOUT_MS='1000'
 *         成对进程窗（r1 P1 双席同判：invoke :377 单键即 fallback 30_000>max 1_000 抛 model_deadline_config_invalid
 *         → :751 prepare 相位裸传 500·窗为承载面处方非产品面）→ withAbortTimeout 到点 reject+abort →
 *         :1116 unknownReason='model_execution_timeout' → :1120 入账 → :1130 恒返 → HTTP 422 同 F1 码面
 *         （:1130 恒返·两成因 HTTP 口不可区分=如实承登·区分面=账本 reason）+ 账本恰 1 行 status=unknown/
 *         error=model_execution_timeout（reason 级可分=本形独立断言面）。
 *   F3  = 空转写形：scripted 返回 {ok:true, raw:{text:'   '}} → resume-ocr :138 businessValidate
 *         <MIN_OCR_CHARS=10 → invoke :1164-1169（error=business:ocr_text_too_short 调用方可读·
 *         errorCode=business_validation_failed 落库机器码二者分离）→ :1199 persistValidatedOutput 跳过
 *         （工件零写入·非删后残留）→ 422 `ocr_failed` reason=business:ocr_text_too_short + 账本恰 1 行
 *         status=failed/error_code=business_validation_failed（model-invocation completeModelInvocation
 *         error≠undefined→'failed'·r1 修订③勘正）。
 *   N   = 净账臂：F1–F3 全程 entitlement_consumption 零 confirmed 净账（reserve→release 闭环·可用额度
 *         逐臂回升·resume/artifact 零行聚合）——e2e-scenarios :155 A3「全程无扣费」+ case-matrix :96
 *         「可解释失败；无悬挂消费」对码。
 *
 * 承载（双层·如实承登）：boot()（_neg-harness）供隔离池+迁移链+AUTH env+consent 产品路径种子
 * （POST /privacy/consent·ADV :103-104 先例）——boot() 硬钉 OCR_ENABLED='0'（_neg-harness :54-56 注释
 * +Object.assign 无条件覆写·r2 行锚微漂重 pin :53-54→:54-55）→ boot HTTP 层不可承载 OCR 臂（闸先应
 * 422 image_ocr_unavailable=neg-resume B1 已钉面）——共享 harness 面零触 → OCR 臂全走最小模块同进程承载
 * （sse-principal-slot :112-131 先例·useValue 行现锚 :116/:91；uc-e2e-017-orphan-http-sse :344-356
 * boot+最小模块同进程先例）：@Module{controllers:[ResumeController], providers:[PrincipalGuard,
 * DbService(useValue 真例·env 直构同库第二池·非包裹 boot h.pool·零共享连接池), RateLimitService(useValue
 * new RateLimitService()·Map 模式供体形钉 r1 修订④——Ban 裸 class provider：rate-limit.service :27
 * ctor @Optional() db?: DbService（r2 行锚微漂重 pin :30→:27）·裸注册会经 DI 注入同模块 DbService 走
 * 共享 PG 模式与 Map 模式登记不符), ResumeService(useFactory 恰闭合三依赖), {provide: OCR_VISION_CLIENT,
 * useValue: scripted}]} + NestFactory.create + AllExceptionsFilter + listen(0,'127.0.0.1')——零组合根
 * 零 main.ts:146 启动校验（createApp 不经·assertCriticalEnv/resolveModelDeadlineConfig 不在承载面）。
 * env 窗后置（boot 返回后进程窗 OCR_ENABLED=1+OCR_PREVIEW=1——isOcrFeatureEnabled :27-29 call-time 读·
 * 窗值披露：产品组合根不受窗影响·最小模块不触组合根）；F2 成对窗=请求前置·臂后 finally 删两键
 * （save/restore adaptive-degrade.proof.ts :72-90 先例形·apps/worker/test/ 路径）。
 *
 * 夹具面（种子豁免枚举·具名·枚举外零裸 INSERT）：①consent=产品路径 POST /privacy/consent（boot app 层）；
 * ②entitlement_bucket 直 INSERT（每臂独立 principal 一桶·worker ocr.proof :31-33 先例形）。
 * 夹具面②（boot-world 对齐块·ADV 0189/0121 重放同族·PERF 0121 重放+批 C「0206/0058 ACL 重放块」同形）：
 * pre-migrate 世界 migrate 全链在先 → boot() 的 sql/01 镜像（:7-15）DROP OWNED BY app_role+DROP ROLE 后
 * 重建 app_role（迁移期函数 EXECUTE ACL 全失）并以基础形重建 ai_model_invocation（:7 含
 * ai_model_invocation_transition_permit CASCADE·列面回退 0037 基形）——r1⑤ pre-migrate 承重钉与 boot
 * 承载钉在现 harness 面互斥（起草面未预见·值差如实承登·Ban 借机改共享 harness/产品码/迁移文件）。对齐块
 * 全部真相=迁移链逐字：①七列 ADD COLUMN IF NOT EXISTS+CHECK（0057 cost_scope_id/0085
 * logical_node_key_digest/0119 estimate_input_tokens/0174 usage_source/0181 prompt_version/0184
 * estimator_version+calibration_factor_version·全幂等形）；②迁移链 whole-file 重放六件（0121 pgp ACL/
 * 0085 logical-node+dispatch-slot/0088 permit+状态机 definer/0120 共享准入+fee ledger（seeds ON CONFLICT
 * DO NOTHING 幂等）/0179 release-refused/0209 claim 19 参末形——全 CREATE OR REPLACE+REVOKE+GRANT 幂等形）；
 * ③重放收敛（0088 重放复活 claim 15 参/terminalize 9 参旧重载——真链由 0119:178/0181:177/0184:218/
 * 0174:35 逐代 DROP 收敛·四行逐字取用）+terminalize 10 参 GRANT（末位 definer=0174 系 plain CREATE
 * 非 whole-file 可重放·取 :104 GRANT 行）。
 * 零新迁移零 harness 触零产品码触·PIN 断言钉对齐生效（claim 19 参末形+terminalize 10 参+permit 表+
 * admission fn 在场）——环境红与产品红据此可分。
 * 署名规则（r1 修订⑥）：每臂 scripted 调用计数恰 1 断言（okVisionCalls 先例形）+计数判读红线
 * （计数=0 或 PC 红=承载缝/环境红；计数=1 且形状不符=机制不满足 STOP）+每臂独立 principal+独立图字节
 * （ocrKey=sha256(图字节) 幂等锚 resume.service :97-98·Ban 跨臂共用致 409 ocr_duplicate 污染面）。
 *
 * 值差承登：case-matrix :96 layer=worker 系注册期读法——产品面亲证 OCR 管线同步运行于 API 请求路径内
 * （resume.service :95-198·visionOcr :127 同步 await·worker 源零 OCR 消费路径）·layer 格值零动·
 * 翻面权归协调方。egress 登记：proof 含 MODEL_API_KEY/MODEL_BASE_URL 词面（R6 隔离自删+ISO 断言·
 * ADV :123-127 同形）→ manifest additive 2 条（起草卷「零新增条目预期」如实修正承登）。
 *
 * 请求 wall 上限：每臂 fetch 挂 AbortSignal.timeout(30_000)（悬挂缝防门滞留·uc001 :160-167 先例族·
 * F2 产品超时 1_000ms 远在窗内；到点即臂红非悬挂）。
 *
 * Live-key isolation（R6·uc025/ADV 同形）: 本 proof 进程内先自删 MODEL_API_KEY/MODEL_BASE_URL，
 * boot 前后各断言一次 unset。零 provider 外呼（scripted 注入零出站·model-client :731 未配置即未派发承登）·
 * est live=0。
 *
 * Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true ·
 * coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false ·
 * r1Closed=false · actualSpendCny=null · EXIT0=case≠covered · 格值 partial 保持零翻 · ⛔push
 *
 *   pnpm uc015:nhp-fault:prove
 *   pnpm -C apps/api prove:uc015-nhp-fault   (raw; needs isolated DATABASE_URL·pre-migrate 世界：
 *   0120 ai_model_admission_acquire_scoped 必需——OCR invoke=operation-scoped 共享准入
 *   （resume-ocr :136 operation {id:'resume.ocr.v1'}→invoke :749 resolveModelAdmissionPartition→
 *   admitSharedModelOperation model-admission :126-145 无 try/catch 裸调）·virgin 世界漏登记=PC 臂
 *   裸 500 环境红非产品红·runner pre-migrate 名单承重位 r1 修订⑤+0120 :59 resume.ocr.v1 allowed 种子已核)
 */
import 'reflect-metadata';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { asPrincipal, availableUnits } from '@meetwise/db';
import { scriptedModelClient, type ModelClient, type ModelResult } from '@meetwise/ai-runtime';
import { boot } from './_neg-harness';
import { ResumeController } from '../src/modules/resume/resume.controller.ts';
import { OCR_VISION_CLIENT, ResumeService } from '../src/modules/resume/resume.service.ts';
import { AllExceptionsFilter } from '../src/platform/all-exceptions.filter.ts';
import { DbService } from '../src/platform/db.service.ts';
import { PrincipalGuard } from '../src/platform/principal.guard.ts';
import { RateLimitService } from '../src/platform/rate-limit.service.ts';

const CMD = 'pnpm uc015:nhp-fault:prove';
const CASE_ID = 'NHP-015-FAULT-01';
const ATTEMPT_STARTED_AT = new Date().toISOString();

type Cls = 'PC' | 'F1' | 'F2' | 'F3' | 'N' | 'ISO' | 'PIN';
let total = 0;
const failures: { cls: Cls; name: string }[] = [];
const A = (cls: Cls, name: string, cond: boolean) => {
  total++;
  if (!cond) {
    failures.push({ cls, name });
    console.log(`FAIL  [${cls}] ${name}`);
  } else {
    console.log(`PASS  [${cls}] ${name}`);
  }
};

/** PC 臂 scripted 成功转写（≥MIN_OCR_CHARS=10·含 Go/Redis 事实过 ingestResume 下游门·worker ocr.proof 同构去 PII 尾）。 */
const PC_TEXT = '技能\nGo、Redis、Kubernetes\n经历\n在平台做限流网关,主导高并发架构设计落地';
/** 独立图字节 per arm（PNG 魔数过 #109 嗅探门 + per-arm 尾缀→ocrKey=sha256 逐臂互异·防 409 ocr_duplicate 污染面）。 */
const imageB64 = (tag: string) => Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from(`uc15f-nhp-fault-${tag}-bytes-not-a-real-image`),
]).toString('base64');

type PostResult = { status: number; body: any; wallCaps: boolean };
/** 每请求 wall 上限（悬挂缝防门滞留·到点=臂红非悬挂）。 */
const postUpload = async (base: string, principal: string, contentBase64: string): Promise<PostResult> => {
  try {
    const res = await fetch(`${base}/resume/file`, {
      method: 'POST',
      headers: { 'x-user-id': principal, 'content-type': 'application/json' },
      body: JSON.stringify({ filename: `cv-${principal}.png`, mimeType: 'image/png', contentBase64 }),
      signal: AbortSignal.timeout(30_000),
    });
    return { status: res.status, body: await res.json().catch(() => ({})), wallCaps: false };
  } catch {
    return { status: 0, body: { error: 'wall_cap_or_transport' }, wallCaps: true };
  }
};

(async () => {
  console.log(`UC-E2E-015 ${CASE_ID} isolated PG/HTTP FAULT evidence (visionOcr 缝故障注入→产品降级形状)`);
  console.log('releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · coveredCount=8 · PG-retained');
  console.log('EXIT0=case≠covered · FAULT 格 partial 保持零翻 · est live=0（scripted 注入零出站）');
  console.log(`ATTEMPT_START  iso=${ATTEMPT_STARTED_AT} · Ban retry-to-green · Ban fake-green\n`);

  // ── R6 live-key isolation：进程内自删 + pre-boot ISO 断言（ADV :123-127 同形）──
  delete process.env.MODEL_API_KEY;
  delete process.env.MODEL_BASE_URL;
  A('ISO', 'model-key-unset-in-process(self-deleted pre-boot · R6)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);
  if (process.env.NODE_ENV === 'production') process.env.NODE_ENV = 'test';

  // ── 第一层承载：boot()（隔离池+迁移链+AUTH env+consent 产品路径口）──
  const h = await boot();
  const pool = h.pool;
  A('ISO', 'model-key-still-unset-after-boot(no re-import regression)',
    process.env.MODEL_API_KEY === undefined && process.env.MODEL_BASE_URL === undefined);

  // ── env 窗后置（boot 返回后·:96 call-time 读·产品组合根不受窗影响——最小模块不触组合根）──
  process.env.OCR_ENABLED = '1';
  process.env.OCR_PREVIEW = '1';
  A('ISO', 'ocr-preview-window-post-boot(OCR_ENABLED=1 ∧ OCR_PREVIEW=1 · call-time read seam)',
    process.env.OCR_ENABLED === '1' && process.env.OCR_PREVIEW === '1');

  // ── 夹具面②：boot-world 对齐块（真相=迁移链逐字·承登见头注）──
  const mig = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/migrations/${f}`, import.meta.url)), 'utf8');
  const columnAlignment = [
    // 0057_model_invocation_cost_scope :8-15
    `ALTER TABLE ai_model_invocation ADD COLUMN IF NOT EXISTS cost_scope_id text;
     ALTER TABLE ai_model_invocation DROP CONSTRAINT IF EXISTS ai_model_invocation_cost_scope_id_check;
     ALTER TABLE ai_model_invocation ADD CONSTRAINT ai_model_invocation_cost_scope_id_check CHECK (cost_scope_id IS NULL OR cost_scope_id ~ '^[A-Za-z0-9._:-]{1,160}$');`,
    // 0085_ai_model_logical_node_dispatch_slot :9-16
    `ALTER TABLE ai_model_invocation ADD COLUMN IF NOT EXISTS logical_node_key_digest text;
     ALTER TABLE ai_model_invocation DROP CONSTRAINT IF EXISTS ai_model_invocation_logical_node_key_digest_check;
     ALTER TABLE ai_model_invocation ADD CONSTRAINT ai_model_invocation_logical_node_key_digest_check CHECK (logical_node_key_digest IS NULL OR logical_node_key_digest ~ '^[0-9a-f]{64}$');`,
    // 0119_usage_reconciliation_wiring :27-33
    `ALTER TABLE ai_model_invocation ADD COLUMN IF NOT EXISTS estimate_input_tokens integer;
     ALTER TABLE ai_model_invocation DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_estimate_input_tokens;
     ALTER TABLE ai_model_invocation ADD CONSTRAINT ck_ai_model_invocation_estimate_input_tokens CHECK (estimate_input_tokens IS NULL OR estimate_input_tokens BETWEEN 1 AND 2000000);`,
    // 0174_ag06_settled_failed_usage_source :23-29
    `ALTER TABLE ai_model_invocation ADD COLUMN IF NOT EXISTS usage_source text;
     ALTER TABLE ai_model_invocation DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_usage_source;
     ALTER TABLE ai_model_invocation ADD CONSTRAINT ck_ai_model_invocation_usage_source CHECK (usage_source IS NULL OR usage_source IN ('usage_missing'));`,
    // 0181_ag19_prompt_version_column :24-30
    `ALTER TABLE ai_model_invocation ADD COLUMN IF NOT EXISTS prompt_version text;
     ALTER TABLE ai_model_invocation DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_prompt_version;
     ALTER TABLE ai_model_invocation ADD CONSTRAINT ck_ai_model_invocation_prompt_version CHECK (prompt_version IS NULL OR char_length(prompt_version) BETWEEN 1 AND 64);`,
    // 0184_ag12_estimator_claim_freeze :30-42
    `ALTER TABLE ai_model_invocation ADD COLUMN IF NOT EXISTS estimator_version text;
     ALTER TABLE ai_model_invocation DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_estimator_version;
     ALTER TABLE ai_model_invocation ADD CONSTRAINT ck_ai_model_invocation_estimator_version CHECK (estimator_version IS NULL OR estimator_version IN ('utf8-bytes-v1', 'cjk-weighted-v1'));`,
    `ALTER TABLE ai_model_invocation ADD COLUMN IF NOT EXISTS calibration_factor_version text;
     ALTER TABLE ai_model_invocation DROP CONSTRAINT IF EXISTS ck_ai_model_invocation_calibration_factor_version;
     ALTER TABLE ai_model_invocation ADD CONSTRAINT ck_ai_model_invocation_calibration_factor_version CHECK (calibration_factor_version IS NULL OR calibration_factor_version ~ '^[A-Za-z0-9.:_-]{1,160}$');`,
  ];
  for (const stmt of columnAlignment) await pool.query(stmt);
  const replayFiles = [
    '0121_resume_pgcrypto_runtime_acl.sql',
    '0085_ai_model_logical_node_dispatch_slot.sql',
    '0088_ai_model_invocation_controlled_state_machine.sql',
    '0120_model_op02_shared_provider_admission_ledger_breaker.sql',
    '0179_ag_d_release_refused_claim.sql',
    '0209_ag09_replay_first_claim.sql',
  ];
  for (const f of replayFiles) await pool.query(mig(f));
  // 重放收敛（迁移链自有逐字行·旧重载复活收敛到真迁移链末形）：0088 重放复活 claim 15 参/terminalize 9 参
  // 旧重载——真链内由 0119:178/0181:177/0184:218（claim 逐代 DROP）与 0174:35（terminalize 9 参 DROP）收敛；
  // 0174 系 plain CREATE 非 whole-file 可重放，其 :35 DROP+:104 GRANT 两行单取。
  await pool.query('DROP FUNCTION IF EXISTS ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer)');
  await pool.query('DROP FUNCTION IF EXISTS ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer)');
  await pool.query('DROP FUNCTION IF EXISTS ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text)');
  await pool.query('DROP FUNCTION IF EXISTS ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer)');
  await pool.query('GRANT EXECUTE ON FUNCTION ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer,text) TO app_role');
  const carrierPin = await pool.query(`SELECT
    to_regprocedure('public.ai_model_claim_invocation_scoped(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer,text,text,text)')::text AS claim,
    to_regprocedure('public.ai_model_terminalize_scoped(text,text,text,text,jsonb,boolean,integer,integer,integer,text)')::text AS term,
    to_regclass('public.ai_model_invocation_transition_permit')::text AS permit,
    to_regproc('public.ai_model_admission_acquire_scoped')::text AS admit`);
  A('ISO', 'boot-world carrier alignment(claim 19 参末形+terminalize 10 参+permit 表+admission fn 在场·迁移链重放六件+七列对齐+重放收敛)',
    !!carrierPin.rows[0]?.claim && !!carrierPin.rows[0]?.term && !!carrierPin.rows[0]?.permit && !!carrierPin.rows[0]?.admit);
  console.log('PIN   NHP-015-FAULT-ISO-CARRIER-ALIGN: harness 面迁移链重放（0121/0085/0088/0120/0179/0209+七列对齐+收敛 DROP 四行+terminalize GRANT·真相=迁移链 migrate 全链·ADV 0189/0121 同形）');

  // ── 第二层承载：最小模块同进程（零组合根零 main.ts:146 启动校验）──
  // DbService 实构形（r1）：env 直构真例=同库第二池，非包裹 boot h.pool（零共享连接池）。
  const db = new DbService();
  // RateLimitService 供体形钉（r1 修订④）：useValue new（Map 模式）——Ban 裸 class provider
  // （:27 ctor @Optional() db? 裸注册会被 DI 注入同模块 DbService 走共享 PG 模式，与 Map 模式登记不符）。
  const rl = new RateLimitService();

  // scripted 缝：每臂恰 1 调用计数（okVisionCalls 先例形·§8 署名规则①）+ per-arm handler 换装。
  type VisionScript = (attempt: number) => ModelResult;
  let currentScript: VisionScript = () => ({ ok: false, kind: 'deterministic' });
  let visionCalls = 0;
  // F2 悬挂脚本：永不 resolve 的 Promise 经 async complete() adopt（类型面 ModelResult 强转·运行时即挂起,
  // 由产品 withAbortTimeout 到点 reject——scripted 缝自身不持 timer·AbortSignal 忽略同 worker 先例）。
  const HANGING_SCRIPT = new Promise<ModelResult>(() => {}) as unknown as ModelResult;
  const scripted: ModelClient = scriptedModelClient({
    'resume.vision': (attempt) => {
      visionCalls += 1;
      return currentScript(attempt);
    },
  });

  @Module({
    controllers: [ResumeController],
    providers: [
      PrincipalGuard,
      { provide: DbService, useValue: db },
      { provide: RateLimitService, useValue: rl },
      {
        provide: ResumeService,
        useFactory: (ddb: DbService, vision: ModelClient, rateLimit: RateLimitService) =>
          new ResumeService(ddb, vision, rateLimit),
        inject: [DbService, OCR_VISION_CLIENT, RateLimitService],
      },
      { provide: OCR_VISION_CLIENT, useValue: scripted },
    ],
  })
  class Uc015FaultModule {}

  const app = await NestFactory.create<NestFastifyApplication>(Uc015FaultModule, new FastifyAdapter(), { logger: false, abortOnError: false });
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.listen(0, '127.0.0.1');
  const base = (await app.getUrl()).replace('[::1]', '127.0.0.1');

  // ── 面快照（boot 第一池查询·五面 r1 拆义）──
  const countWhere = async (principal: string, table: string, extra = ''): Promise<number> => {
    const r = await asPrincipal(pool, principal, (c) => c.query<{ n: number }>(
      `SELECT count(*)::int AS n FROM ${table} WHERE owner_user_id=$1${extra}`, [principal],
    ));
    return Number(r.rows[0]?.n ?? 0);
  };
  const faces = async (principal: string) => ({
    resumeRows: await countWhere(principal, 'resume'),
    confirmed: await countWhere(principal, 'entitlement_consumption', " AND status='confirmed'"),
    artifacts: await countWhere(principal, 'resume_ocr_artifact'),
    units: await asPrincipal(pool, principal, (c) => availableUnits(c, principal)),
  });
  const invocations = async (principal: string) => {
    const r = await asPrincipal(pool, principal, (c) => c.query<{ status: string; error_code: string | null }>(
      'SELECT status, error_code FROM ai_model_invocation WHERE owner_user_id=$1', [principal],
    ));
    return r.rows;
  };

  // ── 种子（豁免枚举①②）：①consent=产品路径（boot app 层）②bucket 直 INSERT（每臂一桶）──
  const seedArm = async (cls: Cls, principal: string) => {
    const consent = await h.post('/privacy/consent', h.U(principal), { purpose: 'resume_processing' });
    A(cls, `seed consent via product path POST /privacy/consent → 200 (${principal})`, consent.status === 200);
    const bucket = await asPrincipal(pool, principal, (c) => c.query(
      "INSERT INTO entitlement_bucket(owner_user_id,kind,units_total,expires_at) VALUES ($1,'paid',5.0,now()+interval '300 days')",
      [principal],
    ));
    A(cls, `seed entitlement_bucket direct INSERT rowCount 1 (${principal} · 豁免②)`, bucket.rowCount === 1);
  };

  const UNIT_SEED = 5.0;
  const facesIdentity = (cls: Cls, tag: string, before: Awaited<ReturnType<typeof faces>>, after: Awaited<ReturnType<typeof faces>>) => {
    A(cls, `面1 resume 行 before/after 恒等 ${before.resumeRows}===${after.resumeRows} (${tag})`, before.resumeRows === after.resumeRows);
    A(cls, `面2 consumption confirmed 行恒等 0 (${tag})`, before.confirmed === after.confirmed && after.confirmed === 0);
    A(cls, `面3 resume_ocr_artifact 行恒等 0 (${tag})`, before.artifacts === after.artifacts && after.artifacts === 0);
    A(cls, `面4 桶可用额度扣 1 后回升恒等 ${UNIT_SEED.toFixed(1)} (${tag})`, Math.abs(before.units - after.units) < 1e-9 && Math.abs(after.units - UNIT_SEED) < 1e-9);
  };

  try {
    // ════ PC = 管道活性对照（non-claim·臂序最先=canary）════
    {
      const principal = 'uc15f_pc';
      await seedArm('PC', principal);
      const before = await faces(principal);
      A('PC', `面1-4 臂前基线（resume 0/confirmed 0/artifact 0/units ${UNIT_SEED.toFixed(1)}）`,
        before.resumeRows === 0 && before.confirmed === 0 && before.artifacts === 0 && Math.abs(before.units - UNIT_SEED) < 1e-9);
      currentScript = () => ({ ok: true, raw: { text: PC_TEXT } });
      visionCalls = 0;
      const r = await postUpload(base, principal, imageB64('pc'));
      A('PC', 'scripted 成功 → 200（非假阴性·承载活性）', r.status === 200 && !r.wallCaps);
      A('PC', "200 body status='ingested'", r.body?.status === 'ingested');
      A('PC', "200 body format='image'", r.body?.format === 'image');
      A('PC', '200 body ocr=true', r.body?.ocr === true);
      A('PC', 'scripted resume.vision 调用计数恰 1（承载缝红线·计数=0 即环境红）', visionCalls === 1);
      const after = await faces(principal);
      A('PC', 'consumption confirmed 恰 1（按次计费·:171-196 事务 confirmed）', after.confirmed === 1);
      A('PC', '成功后工件已删（:194 同事务 deleteResumeOcrArtifact）', after.artifacts === 0);
      A('PC', 'resume 恰 1 行（成功面登记于 full.e2e live-key·本臂 zero claim 仅证承载）', after.resumeRows === 1);
      A('PC', '可用额度恰扣 1（5.0→4.0）', Math.abs(after.units - (UNIT_SEED - 1)) < 1e-9);
    }

    // ════ F1 = throw 形 ════
    const f1Principal = 'uc15f_f1';
    {
      const cls: Cls = 'F1';
      await seedArm(cls, f1Principal);
      currentScript = () => { throw new Error('scripted_vision_transport_failure'); };
      visionCalls = 0;
      const before = await faces(f1Principal);
      const r = await postUpload(base, f1Principal, imageB64('f1'));
      A(cls, 'scripted throw 裸传 → 422（非 500 非静默·invoke :1024 catch→:1130 恒返）', r.status === 422 && !r.wallCaps);
      A(cls, "422 body error='ocr_failed'", r.body?.error === 'ocr_failed');
      A(cls, "422 body reason='external_outcome_unknown'", r.body?.reason === 'external_outcome_unknown');
      A(cls, '422 body hint 在场（可解释信封）', typeof r.body?.hint === 'string' && r.body.hint.length > 0);
      A(cls, 'scripted 调用计数恰 1', visionCalls === 1);
      const after = await faces(f1Principal);
      facesIdentity(cls, 'F1', before, after);
      const rows = await invocations(f1Principal);
      A(cls, '面5 账本恰 1 新行', rows.length === 1);
      A(cls, "面5 status='unknown'", rows[0]?.status === 'unknown');
      A(cls, "面5 error_code='external_outcome_unknown'", rows[0]?.error_code === 'external_outcome_unknown');
    }

    // ════ F2 = 超时形（成对窗·请求前置·臂后 finally 删两键·r1 P1）════
    const f2Principal = 'uc15f_f2';
    {
      const cls: Cls = 'F2';
      await seedArm(cls, f2Principal);
      currentScript = () => HANGING_SCRIPT;
      visionCalls = 0;
      const before = await faces(f2Principal);
      // 成对窗（r1 P1 双席同判）：单键 MODEL_EXECUTION_TIMEOUT_MS='1000' 时 :377 MODEL_TIMEOUT_MS
      // fallback 30_000>max 1_000 → model_deadline_config_invalid → :751 prepare 相位裸传 500。
      // 保存/恢复沿 adaptive-degrade.proof.ts :72-90 先例形。
      const prevExec = process.env.MODEL_EXECUTION_TIMEOUT_MS;
      const prevTransport = process.env.MODEL_TIMEOUT_MS;
      process.env.MODEL_EXECUTION_TIMEOUT_MS = '1000';
      process.env.MODEL_TIMEOUT_MS = '1000';
      A(cls, 'F2 成对窗请求前置（MODEL_EXECUTION_TIMEOUT_MS=1000 ∧ MODEL_TIMEOUT_MS=1000·下界 invoke :376-379 bounded）',
        process.env.MODEL_EXECUTION_TIMEOUT_MS === '1000' && process.env.MODEL_TIMEOUT_MS === '1000');
      let r: PostResult = { status: 0, body: {}, wallCaps: false };
      try {
        r = await postUpload(base, f2Principal, imageB64('f2'));
      } finally {
        if (prevExec === undefined) delete process.env.MODEL_EXECUTION_TIMEOUT_MS;
        else process.env.MODEL_EXECUTION_TIMEOUT_MS = prevExec;
        if (prevTransport === undefined) delete process.env.MODEL_TIMEOUT_MS;
        else process.env.MODEL_TIMEOUT_MS = prevTransport;
      }
      A(cls, '臂后成对窗 finally 删两键（save/restore·窗不外溢）',
        prevExec === undefined && prevTransport === undefined
          ? process.env.MODEL_EXECUTION_TIMEOUT_MS === undefined && process.env.MODEL_TIMEOUT_MS === undefined
          : true);
      A(cls, 'scripted 挂起 → 产品 withAbortTimeout 1_000ms 到点 → 422（HTTP 面与 F1 同码=:1130 恒返·如实承登）',
        r.status === 422 && !r.wallCaps);
      A(cls, "422 body error='ocr_failed'", r.body?.error === 'ocr_failed');
      A(cls, "422 body reason='external_outcome_unknown'（:1130 恒返·两成因 HTTP 口不可区分）", r.body?.reason === 'external_outcome_unknown');
      A(cls, 'scripted 调用计数恰 1', visionCalls === 1);
      const after = await faces(f2Principal);
      facesIdentity(cls, 'F2', before, after);
      const rows = await invocations(f2Principal);
      A(cls, '面5 账本恰 1 新行', rows.length === 1);
      A(cls, "面5 status='unknown'", rows[0]?.status === 'unknown');
      A(cls, "面5 error_code='model_execution_timeout'（:1116→:1120 账本 reason 级可分=本形独立断言面）",
        rows[0]?.error_code === 'model_execution_timeout');
    }

    // ════ F3 = 空转写形 ════
    const f3Principal = 'uc15f_f3';
    {
      const cls: Cls = 'F3';
      await seedArm(cls, f3Principal);
      currentScript = () => ({ ok: true, raw: { text: '   ' } });
      visionCalls = 0;
      const before = await faces(f3Principal);
      const r = await postUpload(base, f3Principal, imageB64('f3'));
      A(cls, '空转写（trim 后 0 < MIN_OCR_CHARS=10）→ 422（resume-ocr :138 businessValidate）', r.status === 422 && !r.wallCaps);
      A(cls, "422 body error='ocr_failed'", r.body?.error === 'ocr_failed');
      A(cls, "422 body reason='business:ocr_text_too_short'（调用方可读 reason·:1241-1243）", r.body?.reason === 'business:ocr_text_too_short');
      A(cls, 'scripted 调用计数恰 1', visionCalls === 1);
      const after = await faces(f3Principal);
      A(cls, '面3 工件零写入（:1199 persistValidatedOutput 跳过·写入从未发生非删后残留）',
        before.artifacts === 0 && after.artifacts === 0);
      A(cls, '面1 resume 行恒等 0', before.resumeRows === after.resumeRows && after.resumeRows === 0);
      A(cls, '面2 consumption confirmed 行恒等 0', before.confirmed === after.confirmed && after.confirmed === 0);
      A(cls, `面4 桶可用额度扣 1 后回升恒等 ${UNIT_SEED.toFixed(1)}`, Math.abs(before.units - after.units) < 1e-9 && Math.abs(after.units - UNIT_SEED) < 1e-9);
      const rows = await invocations(f3Principal);
      A(cls, '面5 账本恰 1 新行', rows.length === 1);
      A(cls, "面5 status='failed'（completeModelInvocation error≠undefined→'failed'·r1 修订③）", rows[0]?.status === 'failed');
      A(cls, "面5 error_code='business_validation_failed'（落库机器码·与调用方 reason 二者分离）",
        rows[0]?.error_code === 'business_validation_failed');
    }

    // ════ N = 净账臂（F1–F3 全程零悬挂消费·A3 对码）════
    {
      const cls: Cls = 'N';
      const f1c = await countWhere(f1Principal, 'entitlement_consumption', " AND status='confirmed'");
      const f2c = await countWhere(f2Principal, 'entitlement_consumption', " AND status='confirmed'");
      const f3c = await countWhere(f3Principal, 'entitlement_consumption', " AND status='confirmed'");
      A(cls, 'F1–F3 confirmed 净账恒 0（reserve→release 闭环·零 confirmed）', f1c + f2c + f3c === 0);
      const u1 = await asPrincipal(pool, f1Principal, (c) => availableUnits(c, f1Principal));
      const u2 = await asPrincipal(pool, f2Principal, (c) => availableUnits(c, f2Principal));
      const u3 = await asPrincipal(pool, f3Principal, (c) => availableUnits(c, f3Principal));
      A(cls, 'F1 可用额度回升恒等 5.0', Math.abs(u1 - UNIT_SEED) < 1e-9);
      A(cls, 'F2 可用额度回升恒等 5.0', Math.abs(u2 - UNIT_SEED) < 1e-9);
      A(cls, 'F3 可用额度回升恒等 5.0', Math.abs(u3 - UNIT_SEED) < 1e-9);
      const resumeSum = (await countWhere(f1Principal, 'resume')) + (await countWhere(f2Principal, 'resume')) + (await countWhere(f3Principal, 'resume'));
      const artifactSum = (await countWhere(f1Principal, 'resume_ocr_artifact')) + (await countWhere(f2Principal, 'resume_ocr_artifact')) + (await countWhere(f3Principal, 'resume_ocr_artifact'));
      A(cls, 'resume 行三臂聚合恒 0（无半写）', resumeSum === 0);
      A(cls, 'resume_ocr_artifact 行三臂聚合恒 0（工件卫生）', artifactSum === 0);
      const invTotal = (await invocations(f1Principal)).length + (await invocations(f2Principal)).length + (await invocations(f3Principal)).length;
      A(cls, '面5 三臂账本合计恰 3（每臂恰 1 新行·具名终态已逐臂断言）', invTotal === 3);
    }
  } finally {
    delete process.env.OCR_ENABLED;
    delete process.env.OCR_PREVIEW;
    await app.close().catch(() => undefined);
  }

  // ── 汇总（mkAssert 同形 EXIT 原值）──
  console.log(`\n${failures.length === 0
    ? `✓ uc015:nhp-fault: ${total} 条断言全绿（${CASE_ID} · FAULT cell 残余亚层 · EXIT0=case≠covered）`
    : `✗ uc015:nhp-fault: ${failures.length}/${total} 失败`}`);
  console.log('pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null');
  console.log(`est live=0 · scripted 缝零出站 · Ban 借 F 臂宣自动重试已证/成功面背书/HTTP 口可区分（:1130 恒返·区分面=账本 reason） · ⛔push · CMD=${CMD}`);
  process.exit(failures.length === 0 ? 0 : 1);
})();
