/**
 * AG39 quality follow-up proof（RRF 融合层 owner 秩端到端 + org 同内容双行内容级去重 + org 孪生 question 解析边界）。
 *
 * REQUEST：ai-docs/delivery/harness/ag39-quality-REQUEST.md（rev3·§2 断言候选行使·沿 ag39-org-qbank-isolation 形）。
 * 隔离库真迁移链（run-e2e-isolated migrateWithRecovery 全链 applied→0201 在场）· 零模型外呼（est live=0）·
 * releaseEvidence=false · NOT_HA。
 *
 * 断言面：
 *   ① 迁移臂——ann tf_/薄壳/lexical 三函数返回面 owner_kind 末列在场+ACL 重放（tf_→qbank_control_definer·
 *      壳/lexical→app_role）+取证三函数返回面零触（distances 仍两列出参）。
 *   ② 融合 owner 秩臂（修法①）——通道成员不对称夹具：org 行组居 dense 池头部区块（外层 owner 秩先序·dense 单通道
 *      累分 1/61）·platform 行组双通道在池（dense 次位+lexical 在窗）原始通道累分严格更高——逆转可构造（红①复现性
 *      =断言力第 1 层）而 rrf 输出 org 域行组在前（修法①三级稳定序 owner_rank→fused_score→refId 落位）；dense 模式
 *      同夹具输出零变（SQL owner 秩序直返）；platform 域融合输出逐位零变（C 端零变硬验收）。
 *   ③ 双行折叠臂（修法②）——dupHash 双 owner 域各自 refId 入同代投影（红②可复现性=投影内同 hash 双域行共存）·
 *      org 域查询 ann/lexical 同内容恰 org 孪生组存活（platform 孪生组被排除·k 槽位不被双行消耗）·孪生在本查询
 *      不可召回则 platform 行存活的反例面由 platform 域查询逐位零变承接（C 端零变=断言力第 3 层）。
 *   ④ question 解析臂（裁决⑦边界）——org 孪生 refId 经 question_evidence 按 qc.ref_id 映射解析其自身 question；
 *      被排除 platform 孪生 refId 单独入参仍沿 owner 行级谓词解析其自身 question（取证面 owner 谓词零改）。
 *
 * pnpm ag39-quality:prove   （node scripts/run-e2e-isolated.mjs ag39-quality:prove:raw）
 */
import type { Embedder } from '@meetwise/ai-runtime';
import {
  activeQbankGeneration, assertIsolatedTestTarget, createPool, hybridQbankSearch, ingestQuestionBankArtifacts,
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

/* ─────────────────────────── 常量与向量构造（精确余弦距离·母刀 proof 同构） ─────────────────────────── */
const DIM = 512;
const T1 = 'v1';
const S1 = 'backend/nodejs';
const ORG_A = 'ag39q-org-a';
const QUERY_TOKEN = 'ag39qualityq';
const QUERY_VEC = (() => { const v = new Array<number>(DIM).fill(0); v[0] = 1; return v; })();
/** doc = s·e_query + sqrt(1-s²)·e_axis → cos distance = 1 - s（精确可控·母刀 atDistance 同构）。 */
function atDistance(queryAxis: number, ownAxis: number, d: number): number[] {
  const s = 1 - d;
  const v = new Array<number>(DIM).fill(0);
  v[queryAxis] = s;
  v[ownAxis] = Math.sqrt(Math.max(0, 1 - s * s));
  return v;
}
const vecLit = (e: number[]) => `[${e.join(',')}]`;

const vectorByContent = new Map<string, number[]>();
const embedder: QbankEmbedder = {
  dim: DIM,
  id: 'ag39-quality-proof-embedder:v1',
  embed: async (texts: string[]) => texts.map((t) => {
    const v = vectorByContent.get(t);
    if (!v) throw new Error(`ag39q_missing_vector_for_content:${t.slice(0, 48)}`);
    return v;
  }),
};

/* ─────────────────────────── fixtures：融合秩夹具（不对称窗）+ 去重孪生夹具（同文本异 refId 异 owner 域） ─────────────────────────── */
interface Fixture { artifact: QbankQuestionArtifact; refIds: string[]; questionId: string }
// 距离形（红①可构造性承 rev3 定形）：org 行组 dist 0.01 居 dense 池头部区块（外层 owner 秩先序·dense 单通道
// 1/61）；platform 行组 dist 0.02 居 dense 次位区块且词项在窗（双通道累分>org）。去重孪生组 dist 0.30（双域同文本
// 同向量——同内容异 refId 异 owner 域=红②机械可达面）。
function makeFixture(owner: 'platform' | 'org', ownerOrg: string | undefined, label: string, dist: number, ownAxis: number, textPrefix: string): Fixture {
  const questionId = `ag39qq_${label}`;
  const vec = atDistance(0, ownAxis, dist);
  const chunk = (role: 'prompt' | 'rubric' | 'follow_up', ordinal: number, required: boolean) => {
    const refId = `ag39qr_${label}_${role}`;
    const text = `${textPrefix} ${role} ${ordinal}`;
    vectorByContent.set(text, vec);
    return { refId, text, role, ordinal, required };
  };
  const artifact: QbankQuestionArtifact = {
    id: questionId,
    competency: 'ag39-quality',
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
// 融合秩臂：org 组正文**不含**查询词项（lexical 词频窗天然缺席=通道成员不对称）；platform 组含词项（双通道在池）。
const fusionOrg = makeFixture('org', ORG_A, 'qfuso', 0.01, 20, `${QUERY_TOKEN}free 企业私有优先秩端到端夹具正文`);
const fusionPlat = makeFixture('platform', undefined, 'qfusp', 0.02, 21, `${QUERY_TOKEN} 平台公共秩对照夹具正文`);
// 去重臂：双 owner 域同文本（同 content_hash）异 refId——真写手入库后投影双行共存。
const DEDUP_TEXT_PREFIX = `${QUERY_TOKEN} 同内容双行折叠夹具正文`;
const dedupOrg = makeFixture('org', ORG_A, 'qddo', 0.3, 22, DEDUP_TEXT_PREFIX);
const dedupPlat = makeFixture('platform', undefined, 'qddp', 0.3, 22, DEDUP_TEXT_PREFIX);

/* ─────────────────────────── SQL 臂助手（单一 checkout 客户端·BEGIN+SET LOCAL 定界） ─────────────────────────── */
async function withOwnerGucs<T>(ownerKind: string, orgId: string, fn: (c: import('pg').PoolClient) => Promise<T>): Promise<T> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    await c.query("SELECT set_config('app.qbank_serving_scope',$1,true), set_config('app.qbank_taxonomy_version',$2,true)", [S1, T1]);
    await c.query("SELECT set_config('app.qbank_owner_kind',$1,true)", [ownerKind]);
    await c.query("SELECT set_config('app.qbank_org_id',$1,true)", [orgId]);
    const out = await fn(c);
    await c.query('COMMIT');
    return out;
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    throw e;
  } finally { c.release(); }
}
const sortedEq = (a: string[], b: string[]) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());

async function main(): Promise<void> {
  await assertIsolatedTestTarget(pool);

  /* ── 夹具入库（真写手 owner 贯通·ingestQuestionBankArtifacts→ingestQbank） ── */
  section('夹具：融合秩双题+去重孪生双题经真写手入库');
  // 治理通道 org seed 必经 org 信任根白名单（沿母刀 proof 同形·按 org 显式授权形）。
  await pool.query(
    `INSERT INTO qbank_org_curator(org_id, user_id) VALUES ($1,'__system_qbank__') ON CONFLICT DO NOTHING`,
    [ORG_A]);
  const ingested = await ingestQuestionBankArtifacts(
    pool, [fusionPlat.artifact, fusionOrg.artifact, dedupPlat.artifact, dedupOrg.artifact], embedder);
  A('夹具 ingest 题数=4 块数=12', ingested.questionCount === 4 && ingested.chunkCount === 12,
    `q=${ingested.questionCount} c=${ingested.chunkCount}`);
  const built = await ensureActiveQbankGeneration(pool, embedder as unknown as Embedder);
  A('generation 构建 activated', built?.status === 'activated', `status=${built?.status}`);
  const genId = String((await pool.query(`SELECT generation_id FROM qbank_active_generation WHERE singleton=true`)).rows[0].generation_id);
  const proj = await pool.query(
    `SELECT content_hash, owner_kind, org_id FROM qbank_generation_chunk WHERE generation_id=$1 AND visible`, [genId]);
  A('投影行数=12', proj.rowCount === 12, `rows=${proj.rowCount}`);

  /* ── ① 迁移臂：三函数返回面 owner_kind 末列+ACL 重放+取证面零触 ── */
  section('① 迁移臂：owner_kind 出面+ACL 重放+取证三函数零触');
  const outs = await pool.query(
    `SELECT p.proname,
            (SELECT array_agg(x ORDER BY ord)
               FROM unnest(p.proargnames, p.proargmodes::text[]) WITH ORDINALITY AS t(x, mode, ord)
              WHERE mode IN ('o','t')) AS out_names
       FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname IN ('tf_qbank_generation_ann_search','qbank_generation_ann_search','qbank_generation_lexical_search')
      ORDER BY p.proname`);
  const outByName = new Map(outs.rows.map((r) => [String(r.proname), r]));
  A('①-1 三函数出参末列=owner_kind',
    outs.rowCount === 3
    && ['tf_qbank_generation_ann_search', 'qbank_generation_ann_search', 'qbank_generation_lexical_search']
      .every((n) => {
        const names = (outByName.get(n)?.out_names ?? []) as unknown[];
        return names.length === 3 && names[2] === 'owner_kind';
      }),
    JSON.stringify([...outByName.entries()].map(([n, r]) => [n, r.out_names])));
  A('①-2 ACL 重放（tf_→qbank_control_definer·壳/lexical→app_role）',
    (await pool.query(`SELECT has_function_privilege('qbank_control_definer','public.tf_qbank_generation_ann_search(text,vector,integer)','EXECUTE') AS ok`)).rows[0].ok === true
    && (await pool.query(`SELECT has_function_privilege('app_role','qbank_generation_ann_search(text,vector,integer)','EXECUTE') AS ok`)).rows[0].ok === true
    && (await pool.query(`SELECT has_function_privilege('app_role','qbank_generation_lexical_search(text,text,integer)','EXECUTE') AS ok`)).rows[0].ok === true
    && (await pool.query(`SELECT has_function_privilege('app_role','public.tf_qbank_generation_ann_search(text,vector,integer)','EXECUTE') AS ok`)).rows[0].ok === false);
  const distOut = await pool.query(
    `SELECT count(*)::int AS n FROM information_schema.parameters
      WHERE specific_name LIKE 'qbank_generation_distances%' AND parameter_mode='OUT'`);
  A('①-3 取证三函数返回面零触（distances 仍两列出参）', Number(distOut.rows[0].n) === 2, `n=${distOut.rows[0].n}`);

  /* ── ③ 前置：红②可复现性——投影内同 hash 双 owner 域行共存 ── */
  section('③-0 红②可复现性：dupHash 投影双行共存（去重前现状）');
  // 孪生文本逐角色同文（同 content_hash·hash 由应用层从正文派生）→ 3 hash × 双 owner 域各 1 行 = 6 行。
  const twinRows = await pool.query(
    `SELECT ref_id, content_hash, owner_kind, org_id FROM qbank_generation_chunk
      WHERE generation_id=$1 AND visible AND ref_id = ANY($2::text[])`,
    [genId, [...dedupOrg.refIds, ...dedupPlat.refIds]]);
  const twinHashes = new Set(twinRows.rows.map((r) => String(r.content_hash)));
  A('③-0-1 孪生投影行=6·恰 3 hash（红②机械可达面）',
    twinRows.rowCount === 6 && twinHashes.size === 3, `rows=${twinRows.rowCount} hashes=${twinHashes.size}`);
  A('③-0-2 每 hash 恰 org/org-a 与 platform 各 1 行（双 owner 域共存·同 refId 恒异）',
    [...twinHashes].every((h) => {
      const rows = twinRows.rows.filter((r) => String(r.content_hash) === h);
      return rows.length === 2
        && rows.some((r) => r.owner_kind === 'org' && r.org_id === ORG_A)
        && rows.some((r) => r.owner_kind === 'platform' && r.org_id === null);
    })
    && dedupOrg.refIds.every((r) => dedupPlat.refIds.includes(r) === false));

  /* ── ③ 双行折叠臂（修法②）：org 域同内容恰 org 组存活·platform 域逐位零变 ── */
  section('③ 双行折叠臂：org 域去重（同内容恰 1 组）+C 端零变');
  await withOwnerGucs('org', ORG_A, async (c) => {
    const ann = (await c.query('SELECT ref_id, owner_kind FROM qbank_generation_ann_search($1,$2::vector,$3)', [genId, vecLit(QUERY_VEC), 10]))
      .rows.map((r) => String(r.ref_id));
    A('③-1 org 域 ann：platform 孪生组恒零（同内容排除）', dedupPlat.refIds.every((r) => !ann.includes(r)), `refs=${ann.join(',')}`);
    A('③-2 org 域 ann：org 孪生组全存活', dedupOrg.refIds.every((r) => ann.includes(r)));
    A('③-3 org 域 ann 全集=org 域 6+platform 非孪生 3（k 槽位不被双行消耗）',
      ann.length === 9 && sortedEq(ann, [...fusionOrg.refIds, ...dedupOrg.refIds, ...fusionPlat.refIds]), `n=${ann.length}`);
    const lex = (await c.query('SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [genId, QUERY_TOKEN, 10]))
      .rows.map((r) => String(r.ref_id));
    A('③-4 org 域 lexical：platform 孪生组恒零+org 孪生组全存活',
      dedupPlat.refIds.every((r) => !lex.includes(r)) && dedupOrg.refIds.every((r) => lex.includes(r)), `n=${lex.length}`);
  });
  await withOwnerGucs('platform', '', async (c) => {
    const ann = (await c.query('SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)', [genId, vecLit(QUERY_VEC), 10]))
      .rows.map((r) => String(r.ref_id));
    A('③-5 C 端 ann 逐位零变（platform 全集 6·org 恒零·去重谓词不触发）',
      ann.length === 6 && sortedEq(ann, [...fusionPlat.refIds, ...dedupPlat.refIds]), `refs=${ann.join(',')}`);
    const lex = (await c.query('SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [genId, QUERY_TOKEN, 10]))
      .rows.map((r) => String(r.ref_id));
    A('③-6 C 端 lexical 逐位零变', lex.length === 6 && sortedEq(lex, [...fusionPlat.refIds, ...dedupPlat.refIds]));
  });

  /* ── ② 融合 owner 秩臂（修法①）：不对称窗逆转可构造而输出 owner 秩在先 ── */
  section('② 融合 owner 秩臂：rrf 端到端（逆转可构造→owner 秩叠序落位）+dense 零变');
  await withOwnerGucs('org', ORG_A, async (c) => {
    const recipe = await activeQbankGeneration(c);
    // 原始通道面（断言力第 1 层·红①复现性）：org 组 dense 单通道累分 < platform 组双通道累分——无 owner 秩则融合序逆转。
    const denseRows = (await c.query('SELECT ref_id FROM qbank_generation_ann_search($1,$2::vector,$3)', [genId, vecLit(QUERY_VEC), 48]))
      .rows.map((r) => String(r.ref_id));
    const lexRows = (await c.query('SELECT ref_id FROM qbank_generation_lexical_search($1,$2,$3)', [genId, QUERY_TOKEN, 48]))
      .rows.map((r) => String(r.ref_id));
    const rawScore = (refId: string) => {
      const d = denseRows.indexOf(refId);
      const l = lexRows.indexOf(refId);
      return (d < 0 ? 0 : 1 / (60 + d + 1)) + (l < 0 ? 0 : 1 / (60 + l + 1));
    };
    const minPlatRaw = Math.min(...fusionPlat.refIds.map(rawScore));
    const maxOrgRaw = Math.max(...fusionOrg.refIds.map(rawScore));
    A('②-0 原始通道累分逆转可构造（platform 组最小累分>org 组最大累分·现状融合序必红形）',
      Number.isFinite(minPlatRaw) && Number.isFinite(maxOrgRaw) && minPlatRaw > maxOrgRaw,
      `minPlat=${minPlatRaw.toFixed(6)} maxOrg=${maxOrgRaw.toFixed(6)}`);
    const rrf = await hybridQbankSearch(c, {
      query: QUERY_TOKEN, embedding: QUERY_VEC, k: 9, expectedRecipeId: recipe.recipeId, retrievalMode: 'rrf',
      scope: { taxonomyVersion: T1, servingScopeId: S1, ownerKind: 'org', orgId: ORG_A },
    });
    A('②-1 rrf 输出 org 域行组（融合秩+去重孪生）全在前·platform 组在后（owner 秩叠序落位）',
      rrf.length === 9
      && rrf.slice(0, 6).every((h) => fusionOrg.refIds.includes(h.refId) || dedupOrg.refIds.includes(h.refId))
      && rrf.slice(6).every((h) => fusionPlat.refIds.includes(h.refId)),
      `refs=${rrf.map((h) => h.refId).join(',')}`);
    A('②-2 rrf channels 逐位（org 融合组 dense·platform 对照组 dense+lexical）',
      rrf.filter((h) => fusionOrg.refIds.includes(h.refId)).every((h) => JSON.stringify(h.channels) === JSON.stringify(['dense']))
      && rrf.filter((h) => fusionPlat.refIds.includes(h.refId)).every((h) => JSON.stringify(h.channels) === JSON.stringify(['dense', 'lexical'])));
    const dense = await hybridQbankSearch(c, {
      query: QUERY_TOKEN, embedding: QUERY_VEC, k: 9, expectedRecipeId: recipe.recipeId, retrievalMode: 'dense',
      scope: { taxonomyVersion: T1, servingScopeId: S1, ownerKind: 'org', orgId: ORG_A },
    });
    A('②-3 dense 模式同夹具输出零变（SQL owner 秩序直返·org 组在前）',
      dense.length === 9 && dense.slice(0, 6).every((h) => dedupOrg.refIds.includes(h.refId) || fusionOrg.refIds.includes(h.refId))
      && dense.slice(6).every((h) => fusionPlat.refIds.includes(h.refId))
      && dense.every((h) => JSON.stringify(h.channels) === JSON.stringify(['dense'])));
  });
  await withOwnerGucs('platform', '', async (c) => {
    const recipe = await activeQbankGeneration(c);
    const rrf = await hybridQbankSearch(c, {
      query: QUERY_TOKEN, embedding: QUERY_VEC, k: 9, expectedRecipeId: recipe.recipeId, retrievalMode: 'rrf',
      scope: { taxonomyVersion: T1, servingScopeId: S1, ownerKind: 'platform', orgId: undefined },
    });
    A('②-4 C 端融合输出逐位零变（恰 6 platform refs·org 恒零）',
      rrf.length === 6 && sortedEq(rrf.map((h) => h.refId), [...fusionPlat.refIds, ...dedupPlat.refIds]),
      `refs=${rrf.map((h) => h.refId).join(',')}`);
  });

  /* ── ④ question 解析臂（裁决⑦边界）：org 孪生解析自身 question·被排除 platform 孪生单独入参仍解析 ── */
  section('④ question 解析臂：org 孪生+被排除 platform 孪生 refId 取证边界');
  await withOwnerGucs('org', ORG_A, async (c) => {
    const orgQe = (await c.query('SELECT question_id FROM qbank_generation_question_evidence($1,$2::text[],$3)',
      [genId, [dedupOrg.refIds[0]], 800])).rows.map((r) => String(r.question_id));
    A('④-1 org 孪生 refId 经 question_evidence 解析其自身 question',
      orgQe.length === 1 && orgQe[0] === dedupOrg.questionId, `q=${orgQe.join(',')}`);
    const platQe = (await c.query('SELECT question_id FROM qbank_generation_question_evidence($1,$2::text[],$3)',
      [genId, [dedupPlat.refIds[0]], 800])).rows.map((r) => String(r.question_id));
    A('④-2 被排除 platform 孪生 refId 单独入参仍解析其自身 question（取证面 owner 行级谓词零改·裁决⑦边界）',
      platQe.length === 1 && platQe[0] === dedupPlat.questionId, `q=${platQe.join(',')}`);
  });

  console.log(`\nAG39 quality proof: ${fail === 0 ? 'ALL GREEN' : `FAIL=${fail}`}`);
  if (fail > 0) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
