/**
 * AG39 企业私有题库隔离 proof（org fixture 投影 owner 穿链 + 库内强制过滤 + 私有优先 + 审计三值 + curation org 信任根）。
 *
 * REQUEST：ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md（§2-① 断言候选行使·沿 bill1 0170/qsec 0176 隔离库先例形）。
 * 隔离库真迁移链（run-e2e-isolated migrateWithRecovery 全链 applied→0186/0187 在场）· 零模型外呼（est live=0）·
 * releaseEvidence=false · NOT_HA。
 *
 * 断言面：
 *   ① 迁移臂——owner_kind/org_id 列在场+DEFAULT 'platform'+一致性 CHECK 三负臂（platform 带 org_id / org 缺 org_id /
 *      第三值 → 23514）+partial 索引在场+uq_qsrc_active_hash 已替换为 scoped 形+qbank_org_curator 白名单表在场。
 *   ② 隔离臂（主断言）——a. C 端 platform-only（org 题恒零·即便距离更近）；b. B 端私有优先（org A 行序在 platform 前）
 *      +platform 补足在场；c. 跨租户零泄漏（org B 零返回·即便最近）；d. owner 断言 fail-closed（缺失/半缺/非法组合
 *      → 23514 qbank_retrieval_scope_missing·绝不静默降级 platform·serving 双空先行判定 message 恒等）；
 *      e. 投影 owner 穿链（worker ensureActiveQbankGeneration 真写路径·org 块投影逐位 org/org-a·platform 行 platform/NULL）
 *      +跨表 owner 一致性（qbank_chunk↔qbank_question↔qbank_generation_chunk）。
 *   ③ 审计臂——served source_bank platform/org:{id} 读写回 + 非法值拒（TS 守卫+CHECK 23514 双臂）+
 *      session_generated 载体登记（question_issue_provenance.origin CHECK 原值在场）。
 *   ④ curation 臂（裁决⑥）——org 提议白名单（非白名单拒/白名单过）+去重 owner 作用域化（org 与 platform 同 hash
 *      不互斥不静默映射）+reviewSource reviewerScope（org 白名单过/外人拒/平台 curator 兜底过）。
 *   ⑤ 回归负臂——显式缺省 owner GUC（platform+空·与裁决⑧ setup 同形）下 platform 行为逐位零变。
 *   ⑦ 值源臂——deriveQbankOwnerScope 无绑定 interview 显式 platform 禁 RAISE（裁决⑦ N-A）。
 *
 * pnpm ag39-org-qbank:prove   （node scripts/run-e2e-isolated.mjs ag39-org-qbank:prove:raw）
 */
import { createHash } from 'node:crypto';
import type { Embedder } from '@meetwise/ai-runtime';
import {
  assertIsolatedTestTarget, asPrincipal, asQbankControlExecutor, createPool, deriveQbankOwnerScope,
  ingestQuestionBankArtifacts, proposeSource, recordServedQbankQuestionRefs, reviewSource,
  type QbankEmbedder, type QbankQuestionArtifact,
} from '@meetwise/db';
import { ensureActiveQbankGeneration } from '../src/qbank-generation.ts';

const pool = createPool();
let fail = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' ' + detail : ''}`);
  if (!ok) fail++;
};
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

/* ─────────────────────────── 常量与向量构造（精确余弦距离·rag03 同构） ─────────────────────────── */
const DIM = 512;
const T1 = 'v1';
const S1 = 'backend/nodejs';
const ORG_A = 'ag39-org-a';
const ORG_B = 'ag39-org-b';
const ORG_C = 'ag39-org-c';
const QUERY_TOKEN = 'ag39isolation';

function axis(i: number): number[] { const v = new Array<number>(DIM).fill(0); v[i] = 1; return v; }
/** doc = s·e_axis + sqrt(1-s²)·e_j（j 独占正交轴）→ cos distance = 1 - s（精确可控）。 */
function atDistance(queryAxis: number, ownAxis: number, d: number): number[] {
  const s = 1 - d;
  const v = new Array<number>(DIM).fill(0);
  v[queryAxis] = s;
  v[ownAxis] = Math.sqrt(Math.max(0, 1 - s * s));
  return v;
}
const vecLit = (e: number[]) => `[${e.join(',')}]`;
const QUERY_VEC = axis(0);

const vectorByContent = new Map<string, number[]>();
const embedder: QbankEmbedder = {
  dim: DIM,
  id: 'ag39-org-qbank-proof-embedder:v1',
  embed: async (texts: string[]) => texts.map((t) => {
    const v = vectorByContent.get(t);
    if (!v) throw new Error(`ag39_missing_vector_for_content:${t.slice(0, 48)}`);
    return v;
  }),
};

/* ─────────────────────────── fixtures：platform + org A + org B 各一题（同 leaf） ─────────────────────────── */
interface Fixture { artifact: QbankQuestionArtifact; refIds: string[]; questionId: string }
// 距离形与 owner 秩逆序（plat 0.05 < orgA 0.3）：②-b 断言 org A 行先行时距离序站在反方——
// 外层 owner 秩真被验证,杜绝「距离序恰与秩序同形→剜掉 owner 秩仍绿」的不可判异弱点;
// orgB 0.05 维持「最近邻仍被库内排除」原语义（②-c-1 原值）。
const DIST = { orgB: 0.05, orgA: 0.3, plat: 0.05 };

function makeFixture(owner: 'platform' | 'org', ownerOrg: string | undefined, label: string, dist: number, ownAxis: number): Fixture {
  const questionId = `ag39q_${label}`;
  const vec = atDistance(0, ownAxis, dist);
  const chunk = (role: 'prompt' | 'rubric' | 'follow_up', ordinal: number, required: boolean) => {
    const refId = `ag39r_${label}_${role}`;
    const text = `${QUERY_TOKEN} ${label} ${role} ${ordinal} 企业私有题库隔离夹具正文`;
    vectorByContent.set(text, vec);
    return { refId, text, role, ordinal, required };
  };
  const artifact: QbankQuestionArtifact = {
    id: questionId,
    competency: 'ag39-isolation',
    difficulty: 3,
    taxonomyVersion: T1,
    servingScopeId: S1,
    annotationSource: 'seed_v1_reviewed',
    chunks: [
      chunk('prompt', 0, true),
      chunk('rubric', 1, true),
      chunk('follow_up', 2, false),
    ],
    ownerKind: owner,
    orgId: ownerOrg,
  };
  return { artifact, refIds: artifact.chunks.map((c) => c.refId), questionId };
}
const plat = makeFixture('platform', undefined, 'plat', DIST.plat, 10);
const orgA = makeFixture('org', ORG_A, 'orga', DIST.orgA, 11);
const orgB = makeFixture('org', ORG_B, 'orgb', DIST.orgB, 12);

/* ─────────────────────────── SQL 臂助手（单一 checkout 客户端·BEGIN+SET LOCAL 定界） ─────────────────────────── */
const CHK = '23514';
const annSql = 'SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)';
async function withOwnerGucs<T>(ownerKind: string | undefined, orgId: string | undefined, fn: (c: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    // serving/taxonomy 双 GUC 恒设（合法组合的承重前提）；owner 两枚按臂注入（undefined=不设·fail-closed 探针）。
    await c.query("SELECT set_config('app.qbank_serving_scope',$1,true), set_config('app.qbank_taxonomy_version',$2,true)", [S1, T1]);
    if (ownerKind !== undefined) await c.query("SELECT set_config('app.qbank_owner_kind',$1,true)", [ownerKind]);
    if (orgId !== undefined) await c.query("SELECT set_config('app.qbank_org_id',$1,true)", [orgId]);
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally { c.release(); }
}
const errCodeOf = async (fn: () => Promise<unknown>): Promise<string | null> => {
  try { await fn(); return null; } catch (e) { return (e as { code?: string })?.code ?? 'ERR'; }
};
const errMsgOf = async (fn: () => Promise<unknown>): Promise<string> => {
  try { await fn(); return 'no_raise'; } catch (e) { return String((e as Error).message).split('\n')[0]; }
};

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);

  /* ── ① 迁移臂 ── */
  section('① 迁移臂：owner 列/DEFAULT/CHECK/索引');
  const colPlat = await pool.query(
    `SELECT column_name, column_default, is_nullable FROM information_schema.columns
      WHERE table_schema='public' AND table_name='qbank_source' AND column_name IN ('owner_kind','org_id') ORDER BY column_name`);
  A('①-1 qbank_source owner 两列在场', colPlat.rowCount === 2);
  const dflt = colPlat.rows.find((r) => r.column_name === 'owner_kind');
  A('①-2 owner_kind DEFAULT platform 且 NOT NULL', String(dflt?.column_default ?? '').includes("'platform'") && dflt?.is_nullable === 'NO');
  for (const t of ['qbank_chunk', 'qbank_question', 'qbank_generation_chunk']) {
    const r = await pool.query(
      `SELECT count(*)::int n FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1 AND column_name IN ('owner_kind','org_id')`, [t]);
    A(`①-3 ${t} owner 两列在场`, Number(r.rows[0].n) === 2);
  }
  const servedCol = await pool.query(
    `SELECT count(*)::int n FROM information_schema.columns
      WHERE table_schema='public' AND table_name='qbank_served_question_ref' AND column_name='source_bank'`);
  A('①-4 qbank_served_question_ref.source_bank 在场', Number(servedCol.rows[0].n) === 1);
  A('①-5 负臂 platform 行带 org_id → 23514',
    await errCodeOf(() => pool.query(
      `INSERT INTO qbank_source(id,kind,content_hash,added_by,owner_kind,org_id) VALUES ('ag39ck1','manual','ag39ckhash1','tester','platform','org-x')`)) === CHK);
  A('①-6 负臂 org 行缺 org_id → 23514',
    await errCodeOf(() => pool.query(
      `INSERT INTO qbank_source(id,kind,content_hash,added_by,owner_kind) VALUES ('ag39ck2','manual','ag39ckhash2','tester','org')`)) === CHK);
  A('①-7 负臂 owner_kind 第三值 → 23514',
    await errCodeOf(() => pool.query(
      `INSERT INTO qbank_source(id,kind,content_hash,added_by,owner_kind,org_id) VALUES ('ag39ck3','manual','ag39ckhash3','tester','tenant','org-x')`)) === CHK);
  const idxScoped = await pool.query(`SELECT 1 FROM pg_indexes WHERE indexname='uq_qsrc_active_hash_scoped'`);
  const idxOld = await pool.query(`SELECT 1 FROM pg_indexes WHERE indexname='uq_qsrc_active_hash'`);
  const idxOrg = await pool.query(`SELECT 1 FROM pg_indexes WHERE indexname='ix_qbank_chunk_org'`);
  A('①-8 scoped 去重索引在场+全局旧索引已替·org partial 索引在场', idxScoped.rowCount === 1 && idxOld.rowCount === 0 && idxOrg.rowCount === 1);
  const orgCuratorTbl = await pool.query(`SELECT to_regclass('qbank_org_curator') IS NOT NULL AS ok`);
  A('①-9 qbank_org_curator 信任根白名单表在场', orgCuratorTbl.rows[0].ok === true);
  await pool.query(`DELETE FROM qbank_source WHERE id IN ('ag39ck1','ag39ck2','ag39ck3')`);

  /* ── 夹具入库（真写手 owner 贯通·ingestQuestionBankArtifacts→ingestQbank） ── */
  section('夹具：platform/orgA/orgB 三题经真写手入库');
  // 治理通道 org seed 必经 org 信任根白名单（系统 seed 兜底例外仅平台灌库面）——
  // 两夹具 org 预授系统灌库主体（按 org 显式授权形·非免白名单面）。
  await pool.query(
    `INSERT INTO qbank_org_curator(org_id, user_id) VALUES ($1,'__system_qbank__'),($2,'__system_qbank__') ON CONFLICT DO NOTHING`,
    [ORG_A, ORG_B]);
  const ingested = await ingestQuestionBankArtifacts(pool, [plat.artifact, orgA.artifact, orgB.artifact], embedder);
  A('夹具 ingest 题数=3 块数=9', ingested.questionCount === 3 && ingested.chunkCount === 9);

  /* ── ②-e 投影 owner 穿链臂（worker ensureActiveQbankGeneration 真写路径） ── */
  section('②-e 投影 owner 穿链（qbank-generation.ts builder）+跨表一致性');
  const built = await ensureActiveQbankGeneration(pool, embedder as unknown as Embedder);
  A('②-e-0 generation 构建 activated', built?.status === 'activated', `status=${built?.status}`);
  const proj = await pool.query(
    `SELECT g.ref_id, g.owner_kind, g.org_id, ch.owner_kind AS chunk_kind, ch.org_id AS chunk_org
       FROM qbank_generation_chunk g JOIN qbank_chunk ch ON ch.ref_id=g.ref_id
      WHERE g.ref_id = ANY($1::text[]) ORDER BY g.ref_id`, [[...plat.refIds, ...orgA.refIds, ...orgB.refIds]]);
  A('②-e-1 投影行数=9', proj.rowCount === 9, `rows=${proj.rowCount}`);
  const byRef = new Map(proj.rows.map((r) => [String(r.ref_id), r]));
  A('②-e-2 org A 三行投影逐位 owner=org/org-a', orgA.refIds.every((r) => byRef.get(r)?.owner_kind === 'org' && byRef.get(r)?.org_id === ORG_A));
  A('②-e-3 org B 三行投影逐位 owner=org/org-b', orgB.refIds.every((r) => byRef.get(r)?.owner_kind === 'org' && byRef.get(r)?.org_id === ORG_B));
  A('②-e-4 platform 三行投影逐位 owner=platform/org_id NULL', plat.refIds.every((r) => byRef.get(r)?.owner_kind === 'platform' && byRef.get(r)?.org_id === null));
  A('②-e-5 跨表一致性 chunk↔projection owner 逐位相等',
    proj.rows.every((r) => r.owner_kind === r.chunk_kind && r.org_id === r.chunk_org));
  const qOwner = await pool.query(
    `SELECT id, owner_kind, org_id FROM qbank_question WHERE id = ANY($1::text[]) ORDER BY id`, [[plat.questionId, orgA.questionId, orgB.questionId]]);
  const qBy = new Map(qOwner.rows.map((r) => [String(r.id), r]));
  A('②-e-6 question 行 owner 逐位（platform/NULL·org/org-a·org/org-b）',
    qBy.get(plat.questionId)?.owner_kind === 'platform' && qBy.get(plat.questionId)?.org_id === null
    && qBy.get(orgA.questionId)?.owner_kind === 'org' && qBy.get(orgA.questionId)?.org_id === ORG_A
    && qBy.get(orgB.questionId)?.owner_kind === 'org' && qBy.get(orgB.questionId)?.org_id === ORG_B);

  const genId = String((await pool.query(`SELECT generation_id FROM qbank_active_generation WHERE singleton=true`)).rows[0].generation_id);

  /* ── ②-d owner 断言 fail-closed ── */
  section('②-d owner 断言 fail-closed（缺失/半缺/非法组合 → 23514·message 恒等）');
  const probe = (ownerKind?: string, orgId?: string) => withOwnerGucs(ownerKind, orgId, async (c) => {
    await c.query(annSql, [genId, vecLit(QUERY_VEC), 5]);
  });
  A('②-d-1 owner 全缺 → 23514 qbank_retrieval_scope_missing',
    (await errMsgOf(() => probe(undefined, undefined))).includes('qbank_retrieval_scope_missing')
    && await errCodeOf(() => probe(undefined, undefined)) === CHK);
  A('②-d-2 半缺（kind=org 缺 org_id）→ 23514',
    (await errMsgOf(() => probe('org', undefined))).includes('qbank_retrieval_scope_missing')
    && await errCodeOf(() => probe('org', undefined)) === CHK);
  A('②-d-3 非法组合（platform+非空 org_id）→ 23514',
    (await errMsgOf(() => probe('platform', ORG_A))).includes('qbank_retrieval_scope_missing')
    && await errCodeOf(() => probe('platform', ORG_A)) === CHK);
  A('②-d-4 非法 kind 第三值 → 23514',
    (await errMsgOf(() => probe('tenant', ORG_A))).includes('qbank_retrieval_scope_missing')
    && await errCodeOf(() => probe('tenant', ORG_A)) === CHK);
  const doubleEmpty = await withOwnerGucs(undefined, undefined, async (c) => {
    // serving 双空场景:owner GUC 同缺 → serving 先行判定,message 恒等（P2-c 断言面兼容）。
    await c.query("SELECT set_config('app.qbank_serving_scope','',true), set_config('app.qbank_taxonomy_version','',true)");
    try { await c.query(annSql, [genId, vecLit(QUERY_VEC), 5]); return 'no_raise'; }
    catch (e) { return `${(e as { code?: string }).code}|${String((e as Error).message).split('\n')[0]}`; }
  });
  A('②-d-5 serving 双空先行判定 message 恒等（23514|qbank_retrieval_scope_missing）',
    doubleEmpty.startsWith(`${CHK}|`) && doubleEmpty.includes('qbank_retrieval_scope_missing'), doubleEmpty);

  /* ── ②-a C 端 platform-only 硬过滤 ── */
  section('②-a C 端（platform+空）:org 题恒零·即便最近');
  await withOwnerGucs('platform', '', async (c) => {
    const ann = (await c.query(annSql, [genId, vecLit(QUERY_VEC), 10])).rows.map((r) => String(r.ref_id));
    A('②-a-1 ann 只回 platform（orgA/orgB 三近邻全被库内排除）',
      ann.length === 3 && ann.every((r) => plat.refIds.includes(r)), `refs=${ann.join(',')}`);
    const lex = (await c.query('SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [genId, QUERY_TOKEN, 10])).rows.map((r) => String(r.ref_id));
    A('②-a-2 lexical 只回 platform', lex.length === 3 && lex.every((r) => plat.refIds.includes(r)));
    const evi = (await c.query('SELECT ref_id FROM qbank_generation_evidence($1,$2::text[],$3)', [genId, [orgA.refIds[0], plat.refIds[0]], 64])).rows.map((r) => String(r.ref_id));
    A('②-a-3 evidence 只回 platform ref（orgA ref 恒空）', evi.length === 1 && evi[0] === plat.refIds[0]);
    const qe = (await c.query('SELECT question_id FROM qbank_generation_question_evidence($1,$2::text[],$3)', [genId, [orgA.refIds[0]], 800])).rows;
    A('②-a-4 question_evidence org 题恒零', qe.length === 0);
  });

  /* ── ②-b B 端私有优先 + 公共补足 / ②-c 跨租户零泄漏 ── */
  section('②-b/②-c B 端（org A）:私有优先排序+platform 补足+org B 零泄漏');
  await withOwnerGucs('org', ORG_A, async (c) => {
    const ann = (await c.query(annSql, [genId, vecLit(QUERY_VEC), 10])).rows.map((r) => String(r.ref_id));
    A('②-b-1 org A 私有行序在 platform 前（owner 秩先于距离）',
      ann.length === 6 && ann.slice(0, 3).every((r) => orgA.refIds.includes(r)) && ann.slice(3).every((r) => plat.refIds.includes(r)),
      `refs=${ann.join(',')}`);
    A('②-c-1 org B 最近邻（dist 0.05）恒零返回', ann.every((r) => !orgB.refIds.includes(r)));
    const lex = (await c.query('SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [genId, QUERY_TOKEN, 10])).rows.map((r) => String(r.ref_id));
    A('②-b-2 lexical 私有优先（orgA 先·platform 补·orgB 零）',
      lex.length === 6 && lex.slice(0, 3).every((r) => orgA.refIds.includes(r)) && lex.slice(3).every((r) => plat.refIds.includes(r)) && lex.every((r) => !orgB.refIds.includes(r)));
    const dist = (await c.query('SELECT ref_id FROM qbank_generation_distances($1,$2::vector,$3::text[])',
      [genId, vecLit(QUERY_VEC), [...orgB.refIds, ...plat.refIds]])).rows.map((r) => String(r.ref_id));
    A('②-c-2 distances 跨租户零泄漏（orgB 请求 ref 恒不回）', dist.length === 3 && dist.every((r) => plat.refIds.includes(r)));
    const qeBoth = (await c.query('SELECT question_id FROM qbank_generation_question_evidence($1,$2::text[],$3)',
      [genId, [orgA.refIds[0], plat.refIds[0], orgB.refIds[0]], 800])).rows.map((r) => String(r.question_id));
    A('②-b-3 question_evidence 私有+公共齐·orgB 题零',
      qeBoth.length === 2 && qeBoth.includes(orgA.questionId) && qeBoth.includes(plat.questionId) && !qeBoth.includes(orgB.questionId));
  });

  /* ── ⑤ 回归负臂：平台零变（显式缺省 owner GUC=裁决⑧ setup 同形） ── */
  section('⑤ 回归负臂：platform-only 行为逐位零变');
  await withOwnerGucs('platform', '', async (c) => {
    const ann = (await c.query(annSql, [genId, vecLit(QUERY_VEC), 10])).rows.map((r) => String(r.ref_id)).sort();
    A('⑤-1 显式缺省 owner GUC 下 platform 检索=3 platform refs（旧行为零改）',
      JSON.stringify(ann) === JSON.stringify([...plat.refIds].sort()));
    const evi = (await c.query('SELECT ref_id, excerpt FROM qbank_generation_evidence($1,$2::text[],$3)', [genId, plat.refIds, 64])).rows;
    A('⑤-2 evidence platform 全量取文', evi.length === 3);
  });

  /* ── ③ 审计臂（裁决④行使载体） ── */
  section('③ 审计臂：served source_bank 三值映射+非法值拒');
  const AUDIT_USER = 'ag39audituser';
  const w1 = await asPrincipal(pool, AUDIT_USER, (c) => recordServedQbankQuestionRefs(c, AUDIT_USER, 'ag39int1', ['ag39q_plat'], 'platform'));
  const w2 = await asPrincipal(pool, AUDIT_USER, (c) => recordServedQbankQuestionRefs(c, AUDIT_USER, 'ag39int2', ['ag39q_orga'], `org:${ORG_A}`));
  A('③-1 served platform/org:{id} 写入', w1 === 1 && w2 === 1);
  const back = await pool.query(
    `SELECT interview_id, source_bank FROM qbank_served_question_ref WHERE owner_user_id=$1 ORDER BY interview_id`, [AUDIT_USER]);
  A('③-2 source_bank 读写回逐位', back.rows[0].source_bank === 'platform' && back.rows[1].source_bank === `org:${ORG_A}`);
  A('③-3 TS 守卫拒非法 source_bank',
    await asPrincipal(pool, AUDIT_USER, async (c) => {
      try { await recordServedQbankQuestionRefs(c, AUDIT_USER, 'ag39int3', ['ag39q_x'], 'memory:evil'); return false; }
      catch (e) { return String((e as Error).message).includes('qbank_served_ref_invalid_source_bank'); }
    }));
  A('③-4 CHECK 负臂直插非法值 → 23514',
    await errCodeOf(() => pool.query(
      `INSERT INTO qbank_served_question_ref(owner_user_id,interview_id,question_ref,source_bank) VALUES ('u','i','r','other_bank')`)) === CHK);
  const originCk = await pool.query(
    `SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname LIKE 'question_issue_provenance_origin%'`);
  A('③-5 session_generated 载体登记（provenance origin CHECK 在场=llm_qbank_miss 单值族）',
    originCk.rowCount >= 1 && String(originCk.rows[0].def).includes('llm_qbank_miss'));
  await pool.query(`DELETE FROM qbank_served_question_ref WHERE owner_user_id=$1`, [AUDIT_USER]);

  /* ── ④ curation 臂（裁决⑥行使） ── */
  section('④ curation 臂：org 信任根白名单+去重 owner 作用域化');
  await pool.query(`INSERT INTO qbank_org_curator(org_id, user_id) VALUES ($1,'ag39-recruiter-a') ON CONFLICT DO NOTHING`, [ORG_A]);
  await pool.query(`INSERT INTO qbank_curator(user_id) VALUES ('ag39-platform-curator') ON CONFLICT DO NOTHING`);
  const dupHash = createHash('sha256').update('ag39-dup-content-hash').digest('hex').slice(0, 32);
  await asQbankControlExecutor(pool, async (c) => {
    const outsider = await proposeSource(c, {
      id: 'ag39src_o1', kind: 'manual', contentHash: dupHash + ':o1', addedBy: 'ag39-outsider',
      ownerKind: 'org', orgId: ORG_A,
    }).then(() => null).catch((e: Error) => e.message);
    A('④-1 非白名单 org 提议拒（qbank_source_org_curator_required）', String(outsider).includes('qbank_source_org_curator_required'));
    const p1 = await proposeSource(c, { id: 'ag39src_a1', kind: 'manual', contentHash: dupHash, addedBy: 'ag39-recruiter-a', ownerKind: 'org', orgId: ORG_A });
    A('④-2 白名单 org 提议落 pending（owner 列穿写）', p1.sourceId === 'ag39src_a1' && p1.dedup === false);
    const p2 = await proposeSource(c, { id: 'ag39src_p1', kind: 'manual', contentHash: dupHash, addedBy: 'ag39-platform-seed' });
    A('④-3 同 hash 平台源独立存活（去重 owner 作用域化·不静默映射回 org 源）', p2.sourceId === 'ag39src_p1' && p2.dedup === false);
    const p3 = await proposeSource(c, { id: 'ag39src_a2', kind: 'manual', contentHash: dupHash, addedBy: 'ag39-recruiter-a', ownerKind: 'org', orgId: ORG_A });
    A('④-4 同 owner 域同 hash dedup 幂等（scoped 唯一索引）', p3.sourceId === 'ag39src_a1' && p3.dedup === true);
    const ownRow = await c.query(`SELECT owner_kind, org_id FROM qbank_source WHERE id='ag39src_a1'`);
    A('④-5 org 源行 owner 列逐位（org/org-a）', ownRow.rows[0].owner_kind === 'org' && ownRow.rows[0].org_id === ORG_A);
    const revOutsider = await reviewSource(c, 'ag39src_a1', 'pending', 'approved', 'x', { reviewer: 'ag39-outsider' });
    A('④-6 org 源审核外人拒', revOutsider === false);
    const revOrg = await reviewSource(c, 'ag39src_a1', 'pending', 'approved', 'org curated', { reviewer: 'ag39-recruiter-a' });
    A('④-7 org 白名单招聘方审核过', revOrg === true);
    const p4 = await proposeSource(c, { id: 'ag39src_b1', kind: 'manual', contentHash: dupHash + ':b1', addedBy: 'ag39-recruiter-b-plain', ownerKind: 'org', orgId: ORG_B }).then(() => null).catch((e: Error) => e.message);
    A('④-8 org B 无白名单提议拒', String(p4).includes('qbank_source_org_curator_required'));
    await pool.query(`INSERT INTO qbank_org_curator(org_id, user_id) VALUES ($1,'ag39-recruiter-b') ON CONFLICT DO NOTHING`, [ORG_B]);
    const p5 = await proposeSource(c, { id: 'ag39src_b2', kind: 'manual', contentHash: dupHash + ':b2', addedBy: 'ag39-recruiter-b', ownerKind: 'org', orgId: ORG_B });
    const revFallback = await reviewSource(c, p5.sourceId, 'pending', 'approved', 'platform safety net', { reviewer: 'ag39-platform-curator' });
    A('④-9 平台 curator 兜底审核过（裁决⑥行使）', p5.dedup === false && revFallback === true);
    const revPlatByOrg = await reviewSource(c, 'ag39src_p1', 'pending', 'approved', 'x', { reviewer: 'ag39-recruiter-a' });
    A('④-10 平台公共源 org 招聘方拒（平台 curator 专属）', revPlatByOrg === false);
    const revPlatByCurator = await reviewSource(c, 'ag39src_p1', 'pending', 'approved', 'curated', { reviewer: 'ag39-platform-curator' });
    A('④-11 平台公共源平台 curator 过', revPlatByCurator === true);
    const sysSeedOrg = await proposeSource(c, {
      id: 'ag39src_s1', kind: 'manual', contentHash: dupHash + ':s1', addedBy: '__system_qbank__',
      ownerKind: 'org', orgId: ORG_C,
    }).then(() => null).catch((e: Error) => e.message);
    A('④-12 org seed（__system_qbank__）未经白名单拒（seed 兜底例外仅平台灌库面）',
      String(sysSeedOrg).includes('qbank_source_org_curator_required'));
  });

  /* ── ⑦ 值源派生臂（无绑定 interview 显式 platform·禁 RAISE） ── */
  section('⑦ owner 值源派生臂（deriveQbankOwnerScope）');
  const derived = await asPrincipal(pool, 'ag39owner', (c) => deriveQbankOwnerScope(c, 'ag39owner', 'ag39-nonexistent-interview'));
  A('⑦-1 无绑定/缺行 interview → 显式 platform（禁 RAISE）', derived.ownerKind === 'platform' && derived.orgId === undefined);

  console.log(`\nAG39 isolation proof: ${fail === 0 ? 'ALL GREEN' : `FAIL=${fail}`}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
