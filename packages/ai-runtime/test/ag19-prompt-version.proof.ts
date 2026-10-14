/**
 * AG-19-PROMPT-VERSION（prompt 版本观测落库刀）真 PG 隔离证明。
 *
 * 修法权威=issues-final AG-19 :265「invoke spec 带上 promptVersion，写入 ai_model_invocation、
 * trace 和 metric 标签」。本证明钉四件事（纯观测增强·零评分语义·零 requestDigest）：
 *  (1) 透传八值对表：invoke（spec.service∈registry）→ span.promptVersion + ai_model_invocation.
 *      prompt_version 逐 service = prompts.ts 注册表 version 常量（八值逐字）；registry 外/缺省
 *      service→NULL 臂；显式 spec.promptVersion 覆盖臂（span/DB 生效·metric 标签不受注入——Ban 有界）。
 *  (2) DB 列全 outcome 写入（0119 :5-8 先例）：success / schema-失败 / business-失败 / unknown 四臂
 *      claim 时冻结 prompt_version；identity-immutable 臂（claim 后 UPDATE→拒）；CHECK 目录钉 +
 *      claim 函数 64/65 边界臂（裁决⑤(a) 宽松形）。
 *  (3) metric 版本标签（裁决③(a)）：registerBaselineMetrics 自 promptVersions() 播种八对零序列
 *      + '(unregistered)'/'none' 占位；invoke 入口 emit 恰一次；值域有界负证（渲染序列 label 值
 *      ⊆ registry 版本∪'none'）；调用方注入不进标签负证。
 *  (4) trace/Langfuse 附带 + digest 零变负证：langfuseSafeModelMetadata.promptVersion 标量在案
 *      （缺省 null）+ 脱敏负证（无 prompt 原文）；同 system/userData 双 invoke 不同显式版本 →
 *      request_digest 恒等而 prompt_version 相异（版本非语义输入·幂等/缓存语义零位移）+ 正控
 *      （system 变→digest 变，证列真载摘要）。外加 prompts.ts 字节恒定面（git blob sha1 对表）。
 *
 * 运行方式：经 scripts/run-e2e-isolated.mjs 的 `ag19-prompt-version:prove` gate（一次性 pgvector
 * 容器 + 全量版本化迁移含 0181）。不 require 任何真实 provider；确定性 stub/seam（est live=0）。
 */
import { createHash, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { asPrincipal, assertIsolatedTestTarget, claimModelInvocation, createPool } from '@meetwise/db';
import {
  createMetrics, getPrompt, invoke, langfuseSafeModelMetadata, METRIC, modelFor, promptVersions,
  recordingTracer, registerBaselineMetrics, setMetrics, setTracer,
  type CompletionRequest, type Model, type ModelCallSpan, type ModelClient, type ModelResult,
} from '../src/index.ts';

const pool = createPool();
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const OWNER = `ag19-pv-${suffix}`;
const Schema = z.object({ answer: z.string().min(1) });

/** prompts.ts 注册表八 service 版本逐字对表（期望值面·与 §0.1 #1 blob :44/:65/:74/:101/:132/:166/:199/:209 对表）。 */
const EXPECTED: [string, string][] = [
  ['job.route-classify.v1', 'p.v2'],
  ['resume-quiz.generate', 'v2'],
  ['resume-diagnosis.generate', 'v1'],
  ['planner.competencies', 'v4'],
  ['interviewer.ask', 'v7'],
  ['mock-interview.evaluate', 'v6'],
  ['resume.vision', 'v2'],
  ['report.generate', 'v3'],
];

/** 无 cost policy 的 scripted model（unbilled claim 路径·零价格书需求）。 */
function scripted(result: ModelResult, digest = 'a'.repeat(64)): Model {
  return {
    requestDigest: digest,
    call: async () => result,
    prepare: () => ({ ready: true as const, execute: async () => result }),
  };
}

const invocationRow = async (key: string) => (await pool.query<{
  status: string; prompt_version: string | null; request_digest: string;
}>(
  `SELECT status,prompt_version,request_digest FROM ai_model_invocation WHERE owner_user_id=$1 AND idempotency_key=$2`,
  [OWNER, key],
)).rows[0];

/** 从 render() 抽 model_invocation_prompt_version_total 全序列：[{labels, value}]。 */
function promptVersionSeries(render: string): { service: string; prompt_version: string; v: number }[] {
  const out: { service: string; prompt_version: string; v: number }[] = [];
  for (const m of render.matchAll(/model_invocation_prompt_version_total\{([^}]*)\}\s+(\d+)/g)) {
    const labels = new Map<string, string>();
    for (const pair of (m[1] ?? '').matchAll(/(\w+)="([^"]*)"/g)) labels.set(pair[1]!, pair[2]!);
    out.push({ service: labels.get('service') ?? '', prompt_version: labels.get('prompt_version') ?? '', v: Number(m[2]) });
  }
  return out;
}

const seriesFor = (render: string, service: string, version: string) =>
  promptVersionSeries(render).find((s) => s.service === service && s.prompt_version === version)?.v ?? 0;

async function main() {
  await assertIsolatedTestTarget(pool);

  // ── 臂 0（纯面）：注册表八值逐字 + prompts.ts 字节恒定面（git blob sha1 对表）。 ──────────
  A('promptVersions()=八 service 版本对表逐字（单一真相在案）',
    promptVersions().length === 8
    && EXPECTED.every(([service, version]) => promptVersions().some((p) => p.service === service && p.version === version)));
  A('getPrompt(service).version 八值逐字（透传源=注册表常量）',
    EXPECTED.every(([service, version]) => getPrompt(service).version === version));
  {
    const content = readFileSync(fileURLToPath(new URL('../src/prompts.ts', import.meta.url)), 'utf8');
    const blobSha = createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0`).update(content).digest('hex');
    A('prompts.ts 字节恒定面（git blob sha1=8db00e904cba04cf0c3d775719cb3f2937e8f104·REGISTRY 零字节改动）',
      blobSha === '8db00e904cba04cf0c3d775719cb3f2937e8f104');
  }

  // ── 独立干净指标实例+基线播种；recording tracer 就位。 ────────────────────────────────
  const metrics = createMetrics();
  registerBaselineMetrics(metrics);
  const baselineRender = metrics.render();   // 播种面快照（任何 invoke 之前·八对+占位恰 9 序列全零）
  setMetrics(metrics);
  const rec = recordingTracer();
  setTracer(rec);

  // ── 臂 1（八值透传对表·unbilled invoke×8）：span+DB 双端逐字=注册表 version。 ──────────
  for (const [service, version] of EXPECTED) {
    const key = `ag19:ok:${service}:${suffix}`;
    const result = await invoke({
      idempotencyKey: key, schema: Schema, businessValidate: () => null,
      model: scripted({ ok: true, raw: { answer: 'ok' } }), service,
    }, pool, OWNER);
    const row = await invocationRow(key);
    const span = rec.spans.find((s) => s.outcome === 'ok' && s.idempotencyKey === key);
    A(`透传[${service}]=${version}:invoke ok+span.promptVersion 逐字`,
      'value' in result && span?.promptVersion === version);
    A(`透传[${service}]=${version}:ai_model_invocation.prompt_version 落库逐字`,
      row?.prompt_version === version);
  }
  A('八值对表全量：span 侧八 service 全带版本（无缺臂）',
    EXPECTED.every(([, version]) => rec.spans.some((s) => s.outcome === 'ok' && s.promptVersion === version)));

  // ── 臂 2（registry 外/缺省→NULL 臂 + 显式覆盖臂）。 ──────────────────────────────────
  {
    const missKey = `ag19:miss:${suffix}`;
    const miss = await invoke({
      idempotencyKey: missKey, schema: Schema, businessValidate: () => null,
      model: scripted({ ok: true, raw: { answer: 'ok' } }), service: 'no-such-service',
    }, pool, OWNER);
    const missRow = await invocationRow(missKey);
    const missSpan = rec.spans.find((s) => s.idempotencyKey === missKey && s.outcome === 'ok');
    A('registry 外 service:span 不带版本(undefined)+DB 落 NULL(旧行为字节等价)',
      'value' in miss && missSpan?.promptVersion === undefined && missRow?.prompt_version === null);

    const noneKey = `ag19:nosvc:${suffix}`;
    await invoke({
      idempotencyKey: noneKey, schema: Schema, businessValidate: () => null,
      model: scripted({ ok: true, raw: { answer: 'ok' } }),
    }, pool, OWNER);
    A('缺省 service:DB 落 NULL', (await invocationRow(noneKey))?.prompt_version === null);

    // 显式 spec.promptVersion 覆盖臂（additive 字段语义）：span/DB 带显式值;
    // metric 标签不受注入(有界 Ban·见臂 5 负证)。
    const explKey = `ag19:expl:${suffix}`;
    await invoke({
      idempotencyKey: explKey, schema: Schema, businessValidate: () => null,
      model: scripted({ ok: true, raw: { answer: 'ok' } }), service: 'interviewer.ask',
      promptVersion: 'ag19-explicit-vX',
    }, pool, OWNER);
    const explRow = await invocationRow(explKey);
    const explSpan = rec.spans.find((s) => s.idempotencyKey === explKey && s.outcome === 'ok');
    A('显式 spec.promptVersion 覆盖:span+DB 带显式值(调用方观测标签语义)',
      explSpan?.promptVersion === 'ag19-explicit-vX' && explRow?.prompt_version === 'ag19-explicit-vX');
  }

  // ── 臂 3（DB 列全 outcome 写入·0119 :5-8 先例：claim 时冻结·不等成功）。 ───────────────
  {
    const okKey = `ag19:out:ok:${suffix}`;
    await invoke({
      idempotencyKey: okKey, schema: Schema, businessValidate: () => null,
      model: scripted({ ok: true, raw: { answer: 'ok' } }), service: 'report.generate',
    }, pool, OWNER);
    const okRow = await invocationRow(okKey);
    A('全outcome[success]:status=succeeded+prompt_version=v3 冻结在案',
      okRow?.status === 'succeeded' && okRow?.prompt_version === 'v3');

    const schemaKey = `ag19:out:schema:${suffix}`;
    await invoke({
      idempotencyKey: schemaKey, schema: Schema, businessValidate: () => null,
      model: scripted({ ok: true, raw: { wrong: 'shape' } }), service: 'report.generate',
    }, pool, OWNER);
    const schemaRow = await invocationRow(schemaKey);
    A('全outcome[schema-失败]:status=failed+prompt_version=v3 照落(不等成功)',
      schemaRow?.status === 'failed' && schemaRow?.prompt_version === 'v3');

    const bizKey = `ag19:out:biz:${suffix}`;
    const biz = await invoke({
      idempotencyKey: bizKey, schema: Schema, businessValidate: () => 'not answerable',
      model: scripted({ ok: true, raw: { answer: 'ok' } }), service: 'report.generate',
    }, pool, OWNER);
    const bizRow = await invocationRow(bizKey);
    A('全outcome[business-失败]:error=business:*+status=failed+prompt_version=v3 照落',
      'error' in biz && biz.error === 'business:not answerable'
      && bizRow?.status === 'failed' && bizRow?.prompt_version === 'v3');

    const unknownKey = `ag19:out:unknown:${suffix}`;
    const unknown = await invoke({
      idempotencyKey: unknownKey, schema: Schema, businessValidate: () => null,
      model: scripted({ ok: false, kind: 'transient', externalOutcome: 'unknown' }), service: 'report.generate',
    }, pool, OWNER);
    const unknownRow = await invocationRow(unknownKey);
    A('全outcome[unknown]:status=unknown+prompt_version=v3 照落(观测事实 claim 时冻结)',
      'error' in unknown && unknown.error === 'external_outcome_unknown'
      && unknownRow?.status === 'unknown' && unknownRow?.prompt_version === 'v3');
  }

  // ── 臂 4（identity-immutable + CHECK/17 参边界·裁决②(a)/⑤(a)）。 ─────────────────────
  {
    // CHECK 目录钉 + claim 函数 64/65 边界（裁决⑤(a)：长 1..64 任意非空串·NULL 允许）。
    // b64 臂留下的 claimed 行（lease 60s 内）供 identity-immutable 行为臂复用。
    const ck = (await pool.query<{ conname: string; def: string }>(
      `SELECT conname,pg_get_constraintdef(oid) AS def FROM pg_constraint
        WHERE conrelid='ai_model_invocation'::regclass AND conname='ck_ai_model_invocation_prompt_version'`,
    )).rows[0];
    A('CHECK 目录在案：ck_ai_model_invocation_prompt_version=NULL 允许 OR 长 1..64（pg 反解析 BETWEEN 归一形）',
      ck?.def != null && /prompt_version IS NULL/.test(ck.def)
      && /char_length\(prompt_version\) >= 1/.test(ck.def) && /char_length\(prompt_version\) <= 64/.test(ck.def));

    const boundaryOk = await asOwnerClaim(`ag19:b64:${suffix}`, 'x'.repeat(64));
    const boundaryOver = await asOwnerClaim(`ag19:b65:${suffix}`, 'x'.repeat(65));
    A('claim 边界:64 字符版本身份过(execute)+65 字符→claim_invalid_input 拒',
      boundaryOk === 'execute' && boundaryOver.includes('ai_model_invocation_claim_invalid_input'));
    const nullOk = await asOwnerClaim(`ag19:bnull:${suffix}`, undefined);
    A('claim 缺省(NULL)向后兼容:16 参旧调用形语义不破(0174 先例同形)', nullOk === 'execute');

    // identity-immutable 行为臂：状态机守卫先吃 transition permit（0088 :48-51 缺 permit 即
    // permit_required 拒）——故按 0130 claimed→claimed 同形先播 permit 再 UPDATE，直达 identity 检查。
    const immutKey = `ag19:b64:${suffix}`;
    await pool.query(
      `INSERT INTO ai_model_invocation_transition_permit(owner_user_id,idempotency_key,expected_old_status,expected_new_status)
       VALUES($1,$2,'claimed','claimed') ON CONFLICT DO NOTHING`, [OWNER, immutKey],
    );
    let immutableRaised = '';
    try {
      await pool.query(
        `UPDATE ai_model_invocation SET prompt_version='tampered-v99' WHERE owner_user_id=$1 AND idempotency_key=$2`,
        [OWNER, immutKey],
      );
    } catch (error: unknown) {
      immutableRaised = String((error as { message?: string }).message ?? error);
    }
    A('identity-immutable:claim 后 UPDATE prompt_version→触发器拒绝(ai_model_invocation_identity_immutable)',
      immutableRaised.includes('ai_model_invocation_identity_immutable'));
    const untouched = await invocationRow(immutKey);
    A('identity-immutable:拒后列值原样(64 字符边界值零篡改)', untouched?.prompt_version === 'x'.repeat(64));

    // 17 参占位序=列序对表（0181 文件机械钉）：签名第 17 参/SELECT $17/INSERT 列集/GRANT 签名四处同源。
    const migration = readFileSync(fileURLToPath(new URL('../../db/migrations/0181_ag19_prompt_version_column.sql', import.meta.url)), 'utf8');
    const paramLines = [...migration.matchAll(/^\s{2}(p_\w+)(?:\s+\w+),?$/gm)].map((m) => m[1]);
    A('0181 claim 函数签名恰 17 参且第 17 参=p_prompt_version',
      paramLines.length === 17 && paramLines[16] === 'p_prompt_version');
    const claimTs = readFileSync(fileURLToPath(new URL('../../db/src/model-op/model-invocation.ts', import.meta.url)), 'utf8');
    A('TS claim seam 占位 $17,$18,$19 收尾（$17=0181 新增版本参·$18/$19=0184 冻结两参·向后兼容缺省 NULL 沿 0174 形）',
      /\$17,\$18,\$19\)/.test(claimTs) && /input\.promptVersion \?\? null,/.test(claimTs));
    A('0181 claim INSERT 列集含 prompt_version 且 VALUES 供 p_prompt_version',
      /estimate_input_tokens,prompt_version\n/.test(migration) && /p_estimate_input_tokens,p_prompt_version\n/.test(migration));
    A('0181 REVOKE/GRANT 用 17 参签名（16 参旧签名已 DROP）',
      /GRANT EXECUTE ON FUNCTION ai_model_claim_invocation_scoped\([^)]*,text\)/.test(migration)
      && /DROP FUNCTION IF EXISTS ai_model_claim_invocation_scoped\(text,text,text,text,text,text,text,uuid,integer,text,text,text,text,integer,integer,integer\)/.test(migration));
    A('0181 identity-immutable additive 一行（0119 :72 同位）',
      /OR OLD\.estimate_input_tokens IS DISTINCT FROM NEW\.estimate_input_tokens\n\s+OR OLD\.prompt_version IS DISTINCT FROM NEW\.prompt_version/.test(migration));
  }

  // ── 臂 5（metric 版本标签·裁决③(a)：播种+emit 恰一次+值域有界负证+注入不进标签）。 ──────
  {
    const renderBase = baselineRender;
    A('基线播种零缺失:八对 {service,prompt_version} 零序列+占位序列在案(开机即有序列)',
      EXPECTED.every(([service, version]) => seriesFor(renderBase, service, version) === 0)
      && seriesFor(renderBase, '(unregistered)', 'none') === 0
      && promptVersionSeries(renderBase).length === 9);

    const reg = metrics.render();
    const askCount = seriesFor(reg, 'interviewer.ask', 'v7');
    const missCount = seriesFor(reg, '(unregistered)', 'none');
    A('emit 恰一次/调用:registry 内(interviewer.ask×1+显式覆盖×1=v7 计 2)·registry 外/缺省计占位 2',
      askCount === 2 && missCount === 2);

    // 值域有界负证：渲染序列 label 值 ⊆ registry 版本∪'none' × registry service∪'(unregistered)'。
    const registryVersions = new Set([...promptVersions().map((p) => p.version), 'none']);
    const registryServices = new Set([...promptVersions().map((p) => p.service), '(unregistered)']);
    const all = promptVersionSeries(reg);
    A('值域有界负证:全部序列 label 值⊆registry 版本∪none × registry service∪(unregistered)(禁自由字符串)',
      all.length > 0 && all.every((s) => registryVersions.has(s.prompt_version) && registryServices.has(s.service)));
    A('注入不进标签负证:显式 spec.promptVersion 后无 caller-injected/ag19-explicit 系列诞生',
      !all.some((s) => s.prompt_version.includes('ag19-explicit') || s.prompt_version.includes('injected'))
      && seriesFor(reg, 'interviewer.ask', 'v7') === askCount);
  }

  // ── 臂 6（trace/Langfuse 附带+脱敏负证+AG-24 面零位移负证）。 ──────────────────────────
  {
    const withVersion: ModelCallSpan = {
      owner: 'o', idempotencyKey: 'k', attempt: 1, outcome: 'ok', latencyMs: 1,
      service: 'interviewer.ask', promptVersion: 'v7', inputTokens: 1, outputTokens: 1,
    };
    const meta = langfuseSafeModelMetadata(withVersion, 'fixture-secret');
    A('Langfuse metadata.promptVersion 标量在案(带版本 span→逐字外送)',
      meta.promptVersion === 'v7');
    const noVersion = langfuseSafeModelMetadata({ ...withVersion, promptVersion: undefined }, 'fixture-secret');
    A('Langfuse metadata.promptVersion 缺省 null(占位不省键·键集稳定)',
      noVersion.promptVersion === null && 'promptVersion' in noVersion);
    const systemSnippet = getPrompt('interviewer.ask').system.slice(0, 24);
    const external = JSON.stringify(meta);
    A('脱敏负证:metadata 无 prompt 原文(system 前缀/答案字面零出现·标量纪律)',
      !external.includes(systemSnippet) && !external.includes('上轮上下文'));
    const langfuseSrc = readFileSync(fileURLToPath(new URL('../src/langfuse-v5.ts', import.meta.url)), 'utf8');
    A('AG-24 已落面(语义翻转登记):model 真名归因=span.model 优先·缺省降级 service 名(safeName(span.model ?? span.service)原样字节)',
      /model: safeName\(span\.model \?\? span\.service, 'unknown'\)/.test(langfuseSrc));
  }

  // ── 臂 7（digest 零变负证+正控：版本非语义输入·幂等/缓存语义零位移）。 ───────────────────
  {
    const client: ModelClient = { complete: async () => ({ ok: true, raw: { answer: 'ok' } }) };
    const req: CompletionRequest = { service: 'interviewer.ask', system: 'AG19-DIGEST-SYSTEM', userData: 'AG19-DIGEST-DATA' };
    const modelA = modelFor(client, req);
    const keyA = `ag19:dg:a:${suffix}`;
    await invoke({
      idempotencyKey: keyA, schema: Schema, businessValidate: () => null,
      model: modelA, service: 'interviewer.ask', promptVersion: 'vA-not-in-digest',
    }, pool, OWNER);
    const keyB = `ag19:dg:b:${suffix}`;
    await invoke({
      idempotencyKey: keyB, schema: Schema, businessValidate: () => null,
      model: modelFor(client, req), service: 'interviewer.ask', promptVersion: 'vB-different-explicit',
    }, pool, OWNER);
    const rowA = await invocationRow(keyA);
    const rowB = await invocationRow(keyB);
    A('digest 零变负证:同 service/system/userData 双 invoke 显式版本相异→request_digest 恒等(版本不入摘要)',
      rowA?.request_digest != null && rowA.request_digest === rowB?.request_digest
      && rowA.prompt_version !== rowB.prompt_version);
    const changed = modelFor(client, { ...req, system: 'AG19-DIGEST-SYSTEM-CHANGED' });
    const keyC = `ag19:dg:c:${suffix}`;
    await invoke({
      idempotencyKey: keyC, schema: Schema, businessValidate: () => null,
      model: changed, service: 'interviewer.ask',
    }, pool, OWNER);
    const rowC = await invocationRow(keyC);
    A('digest 正控:system 变→request_digest 变(列真载语义摘要·非恒等凑数)',
      rowA?.request_digest != null && rowC?.request_digest != null && rowC.request_digest !== rowA.request_digest);
  }

  setTracer({ record() {} });
  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ AG-19 prompt 版本观测落库(透传对表+全 outcome 落库+metric 标签+digest 零变)全部通过');
  await pool.end();
  process.exit(failures ? 1 : 0);
}

/** 走真 claim 函数（17 参 TS seam）的边界探针：返回 action；函数拒（invalid_input）时返回错误串。 */
async function asOwnerClaim(key: string, promptVersion: string | undefined): Promise<string> {
  try {
    const claim = await asPrincipal(pool, OWNER, (c) => claimModelInvocation(c, {
      owner: OWNER, idempotencyKey: key, requestDigest: 'b'.repeat(64),
      leaseToken: randomUUID(), leaseSeconds: 60, promptVersion,
    }));
    return claim.action;
  } catch (error: unknown) {
    return String((error as { message?: string }).message ?? error);
  }
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : 'ag19_prompt_version_proof_failed');
  await pool.end();
  process.exit(1);
});
