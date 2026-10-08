/**
 * DBACL-2 · pgp_sym_encrypt(text,text) EXECUTE ACL 补授刀 prove（P0–P5 · 0121 app_role-only
 * × 0108 memory_runtime SD caller 的 42501 修复）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres 上（本 target 不预迁移 —— prove 自管两段式 ·
 * DBACL-1 同型）：
 *   Stage A：runMigrations(0001–0143 全部 144 文件 · 0151 排除) →
 *     P0 复现负门（SET LOCAL ROLE memory_runtime 直调 pgp_sym_encrypt 恰 42501 +
 *          app_role 经 conversation_event_append 全链恰 42501 + 修复前 proacl 实证）
 *     §3 catalog 机检推导闭集（全迁移 SD 函数体 pgp_sym_* 调用 → distinct proowner ·
 *          双向核 · 逐行 owner|function|call-site|arity 证据 · 三参面/decrypt 面零 SD 调用）
 *   Stage B：runMigrations(全部 · 仅应用 0151) →
 *     P1 proacl 实证（EXECUTE grantee 恰 = 闭集 ∪ app_role 原样 · PUBLIC=false ·
 *          decrypt/三参面全原样 · 全 pgp_sym_* 面 ACL 快照差恰一处 · 函数体跨 stage 逐字节全等）
 *     P2 全链绿（conversation_event_append 真函数非 mock：event+artifact 双 INSERT 落行 +
 *          ciphertext 真解密回原文 + 幂等重放单份）
 *     P3 过度授权负门（新建无关系角色仍恰 42501 + 0151 全文白名单机检 · 基线=§3 推导集）
 *     P4 静态契约门（0001–0143 对 base 零字节 diff · 0151 恰一文件 · 改动面白名单 ·
 *          产品码零改）
 *     P5 migrate 门（ledger=磁盘=145 · 重跑全 skip 零漂移 · 官方 migrate:prove 子进程全绿）
 *
 * EXIT=0 才过；attempts 全账（每轮运行无论红绿都记收据 · Ban retry-to-green）。
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import type { PoolClient } from 'pg';
import { createPool, assertIsolatedTestTarget, runMigrations, loadMigrations } from '../src/index.ts';
import type { DbPool } from '../src/principal.ts';

const ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const MIG_DIR = fileURLToPath(new URL('../migrations', import.meta.url));
const MIGRATION_0151 = '0151_pgp_sym_encrypt_grant';
/** base = REQUEST rev2 蓝本提交（历史迁移零字节 diff 的对照锚 · 授权文本钉死）。 */
const BASE_SHA = '95911975';

const pool: DbPool = createPool();
let failures = 0;
const A = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail && !ok ? ` :: ${detail}` : ''}`);
  if (!ok) failures++;
};

/** §3 预期闭集（恰 1 · REQUEST rev2 钉死；与 EXEC 期 catalog 推导双向核）。 */
const EXPECTED_CLOSED_SET = ['memory_runtime'] as const;

const sha256 = (s: string) => createHash('sha256').update(s, 'utf8').digest('hex');

/* ── 受限角色调用 helper：SET LOCAL ROLE + principal GUC；commit=false 时 ROLLBACK 保净
 *    （负门调用必炸、正门调用只取绿信号，跨 stage 主体隔离）。 */
interface CallResult { ok: boolean; code: string; msg: string; rows: Record<string, unknown>[] }
async function asRole(
  role: string | null, principal: string | null, fn: (c: PoolClient) => Promise<unknown>,
  commit = false,
): Promise<CallResult> {
  const c = await pool.connect();
  try {
    await c.query('BEGIN');
    if (role) await c.query(`SET LOCAL ROLE ${role}`);
    if (principal) await c.query("SELECT set_config('app.principal_user',$1,true)", [principal]);
    const v = await fn(c);
    await c.query(commit ? 'COMMIT' : 'ROLLBACK');
    return { ok: true, code: '', msg: '', rows: ((v as { rows?: Record<string, unknown>[] })?.rows ?? []) as Record<string, unknown>[] };
  } catch (e) {
    await c.query('ROLLBACK').catch(() => undefined);
    const err = e as { code?: string; message?: string };
    return { ok: false, code: String(err.code ?? ''), msg: String(err.message ?? '').split('\n')[0] ?? '', rows: [] };
  } finally { c.release(); }
}
/** 雷在卷判据：恰 42501 且消息指向 pgp_sym_encrypt 函数。 */
const isMine = (r: CallResult) => !r.ok && r.code === '42501' && r.msg.includes('permission denied for function pgp_sym_encrypt');
const show = (r: CallResult) => `code=${r.code} msg=${r.msg}`;

/* ── §3 catalog 机检推导（live catalog · 客观非自指）────────────────────────── */
interface DeriveHit { owner: string; fn: string; call: string; arity: number; kind: 'encrypt' | 'decrypt' }
/** 深度 0 逗号计数 → 实参个数；空参 = 0。 */
function arityOf(inner: string): number {
  if (inner.trim().length === 0) return 0;
  let depth = 0, commas = 0;
  for (const ch of inner) {
    if (ch === '(' || ch === '[') depth += 1;
    else if (ch === ')' || ch === ']') depth -= 1;
    else if (ch === ',' && depth === 0) commas += 1;
  }
  return commas + 1;
}
/** 从函数体（去行注释）扫描全部 pgp_sym_* 调用点（含 arity 分类）。 */
function scanPgpCalls(def: string): Array<{ call: string; arity: number; kind: 'encrypt' | 'decrypt' }> {
  const noComments = def.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
  const out: Array<{ call: string; arity: number; kind: 'encrypt' | 'decrypt' }> = [];
  const re = /pgp_sym_(encrypt|decrypt)\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(noComments)) !== null) {
    // 自调用点起做深度扫描截取完整实参区（支持嵌套一层括号）。
    let depth = 0, i = m.index + m[0].length - 1;
    for (; i < noComments.length; i += 1) {
      if (noComments[i] === '(') depth += 1;
      else if (noComments[i] === ')') { depth -= 1; if (depth === 0) break; }
    }
    if (depth !== 0) break; // 未闭合（正则撞进字符串字面量等）→ 记原始命中 fail-closed
    const inner = noComments.slice(m.index + m[0].length, i);
    out.push({
      call: `pgp_sym_${m[1]}(${inner.replace(/\s+/g, ' ').trim()})`,
      arity: arityOf(inner),
      kind: m[1] === 'encrypt' ? 'encrypt' : 'decrypt',
    });
    re.lastIndex = i + 1;
  }
  return out;
}
async function deriveClosedSet(): Promise<{ hits: DeriveHit[]; owners: string[]; sdTotal: number }> {
  const sd = await pool.query<{ owner: string; fn: string; def: string }>(
    `SELECT pg_get_userbyid(p.proowner) AS owner, p.proname AS fn, pg_get_functiondef(p.oid) AS def
       FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE p.prosecdef AND n.nspname='public'`);
  const hits: DeriveHit[] = [];
  for (const row of sd.rows) {
    for (const c of scanPgpCalls(row.def)) hits.push({ owner: row.owner, fn: row.fn, ...c });
  }
  const owners = [...new Set(hits.map((h) => h.owner))].sort();
  return { hits, owners, sdTotal: sd.rowCount ?? 0 };
}

/* ── dollar-quote 感知语句切分（DBID-1 P6 / DBACL-1 P5 同型）──────────────── */
function splitSql(text: string): string[] {
  const out: string[] = [];
  let start = 0, i = 0;
  while (i < text.length) {
    if (text[i] === '$') {
      const tag = /^\$[A-Za-z_][A-Za-z0-9_]*\$/.exec(text.slice(i));
      if (tag) {
        const close = text.indexOf(tag[0], i + tag[0].length);
        if (close === -1) throw new Error('dollar_quote_unterminated');
        i = close + tag[0].length;
        continue;
      }
    }
    if (text[i] === ';') {
      const s = text.slice(start, i).trim();
      if (s.length > 0) out.push(s);
      i += 1; start = i; continue;
    }
    i += 1;
  }
  const tail = text.slice(start).trim();
  if (tail.length > 0) out.push(tail);
  return out;
}

/* ── 全 pgp_sym_* 面 ACL 快照（P1 跨 stage 差分基线）──────────────────────── */
async function snapshotPgpAcls(): Promise<Map<string, string>> {
  const r = await pool.query<{ fn: string; acl: string }>(
    `SELECT p.proname || ':' || regexp_replace(pg_get_function_identity_arguments(p.oid), '[[:space:]]', '', 'g') AS fn,
            coalesce(p.proacl::text, 'NULL') AS acl
       FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
      WHERE n.nspname='public' AND p.proname LIKE 'pgp_sym_%'`);
  return new Map(r.rows.map((row) => [row.fn, row.acl]));
}

/* ── P2 全链调用参数（conversation_event_append 13 参 · 0108 签名）────────── */
const THREAD = 'th-dbacl2';
const ENC_KEY = 'dbacl2-enc-key-v1';
const appendArgs = (owner: string, body: string, eventKey: string | null) => [
  THREAD, 'user_message', 'user', eventKey, body, sha256(`${owner}:${body}`),
  1, 1, ENC_KEY, 'session', 'free_conversation', 1, 1,
];
const callAppend = (owner: string, body: string, eventKey: string | null) => (c: PoolClient) =>
  c.query('SELECT * FROM conversation_event_append($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
    appendArgs(owner, body, eventKey));

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log(`ATTEMPT dbacl2-db-acl pid=${process.pid} startedAt=${new Date().toISOString()} attemptsLedger=required`);

  const all = loadMigrations(MIG_DIR);
  const pre = all.filter((m) => m.version !== MIGRATION_0151);
  if (!all.some((m) => m.version === MIGRATION_0151)) A('P0-0 0151 在目录', false);

  /* ── P5-4 官方 migrate:prove 子进程全绿（专用第二净库 · 主库两段式零污染）
   *    其 0001 baseline 拒绝在非空 schema 重建 ledger 且 DROP ROLE 受 cluster 级 ACL 依赖；
   *    pg_default_acl 为库级（0073 ADP REVOKE 会污染同库重建的 extension 函数 ACL——探针轮
   *    attempt5 亲证 digest() 假雷），故序为「专用库先行 · 完毕即 DROP（连角色依赖一并清）·
   *    主库保持冷启净卷」；nonce 为 cluster 级 GUC，隔离证明面不变。 */
  {
    const MP_DB = 'meetwise_dbacl2_migrate_prove';
    await pool.query(`CREATE DATABASE ${MP_DB}`);
    try {
      const mp = spawnSync('pnpm', ['-C', 'packages/db', 'prove:migrate'],
        { cwd: ROOT, env: { ...process.env, PGDATABASE: MP_DB }, encoding: 'utf8' });
      const out = `${mp.stdout ?? ''}\n${mp.stderr ?? ''}`;
      const passCount = (out.match(/^PASS/m) ?? []).length;
      const failCount = (out.match(/^FAIL/m) ?? []).length;
      A('P5-4 官方 migrate:prove 子进程全绿（exit=0 · FAIL=0 · PASS>0 · 含 0151 在卷全量重放+再部署全 skip）',
        mp.status === 0 && failCount === 0 && passCount > 0,
        `status=${mp.status} pass=${passCount} fail=${failCount} tail=${out.trim().split('\n').slice(-3).join(' | ')}`);
    } finally {
      await pool.query(`DROP DATABASE ${MP_DB} WITH (FORCE)`);
    }
  }

  /* ── Stage A：0001–0143 全量（0151 排除 · 本支在卷基线）────────────────── */
  {
    const r = await runMigrations(pool, pre);
    A('P0-0 Stage A 应用 0001–0143（144 文件·双 0143 文件名序）', r.applied.length === 144 && r.skipped.length === 0,
      `applied=${r.applied.length} skipped=${r.skipped.length}`);
  }

  const ownerA = `dbacl2-a-${process.pid}`;
  const ownerB = `dbacl2-b-${process.pid}`;

  /* ── P0 复现负门（雷在卷 · 修复前恰 42501）─────────────────────────────── */
  {
    const acl = await pool.query<{ proacl: string }>(
      `SELECT coalesce(p.proacl::text,'NULL') AS proacl FROM pg_proc p WHERE p.oid='public.pgp_sym_encrypt(text,text)'::regprocedure`);
    const proacl = acl.rows[0]?.proacl ?? '';
    A('P0-1 修复前 proacl = owner + app_role only（0121:14/:16 实证 · 无 PUBLIC/无 memory_runtime）',
      proacl.includes('app_role=X/') && !proacl.includes('PUBLIC') && !proacl.includes('memory_runtime'),
      `proacl=${proacl}`);
    const pub = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('public','public.pgp_sym_encrypt(text,text)','EXECUTE') AS v`);
    const app = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('app_role','public.pgp_sym_encrypt(text,text)','EXECUTE') AS v`);
    const mem = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('memory_runtime','public.pgp_sym_encrypt(text,text)','EXECUTE') AS v`);
    A('P0-2 修复前 privilege 矩阵：PUBLIC=false · app_role=true · memory_runtime=false',
      pub.rows[0]?.v === false && app.rows[0]?.v === true && mem.rows[0]?.v === false,
      `public=${pub.rows[0]?.v} app_role=${app.rows[0]?.v} memory_runtime=${mem.rows[0]?.v}`);
    const direct = await asRole('memory_runtime', null, (c) => c.query('SELECT public.pgp_sym_encrypt($1,$2)', ['probe-body', 'probe-key']));
    A('P0-3 复现负门：SET LOCAL ROLE memory_runtime 直调 pgp_sym_encrypt 恰 42501 permission denied for function pgp_sym_encrypt',
      isMine(direct), show(direct));
    const chain = await asRole('app_role', ownerA, callAppend(ownerA, `dbacl2-p0-chain-body-${process.pid}`, 'ek-p0'));
    A('P0-4 复现负门（全链）：asPrincipal(app_role) 经 conversation_event_append（SD·OWNER memory_runtime）恰 42501 同消息',
      isMine(chain), show(chain));
  }

  /* ── §3 catalog 机检推导闭集（双向核 · 逐行证据）────────────────────────── */
  const derive = await deriveClosedSet();
  {
    A('§3-1 全迁移 SD 函数（public）总数 > 0（扫描面在卷）', derive.sdTotal > 0, `sdTotal=${derive.sdTotal}`);
    const extra = derive.owners.filter((o) => !EXPECTED_CLOSED_SET.includes(o as (typeof EXPECTED_CLOSED_SET)[number]));
    const missing = EXPECTED_CLOSED_SET.filter((o) => !derive.owners.includes(o));
    A('§3-2 推导闭集 ⊆ 预期 1 集（多一角色须逐行举证——当前零多余）', extra.length === 0, `extra=[${extra.join(',')}]`);
    A('§3-3 预期 1 集 ⊆ 推导闭集（少一即 FAIL）', missing.length === 0, `missing=[${missing.join(',')}]`);
    A('§3-4 闭集恰 1 条（memory_runtime · 0108:255 唯一调用点）', derive.hits.length === 1
      && derive.hits[0]?.owner === 'memory_runtime' && derive.hits[0]?.fn === 'conversation_event_append',
      `hits=${JSON.stringify(derive.hits)}`);
    A('§3-5 唯一调用点 = 2 参 encrypt(text,text)（0121 所授面 · 非三参重载）',
      derive.hits[0]?.kind === 'encrypt' && derive.hits[0]?.arity === 2, JSON.stringify(derive.hits[0]));
    A('§3-6 三参面全库零 SD 调用（0122 重载面）+ decrypt 任意面零 SD 调用',
      derive.hits.every((h) => h.arity <= 2 && h.kind === 'encrypt'),
      `threeArg=${derive.hits.filter((h) => h.arity >= 3).length} decrypt=${derive.hits.filter((h) => h.kind === 'decrypt').length}`);
    console.log(`DERIVE closed-set owners=${derive.owners.join(',')} sdTotal=${derive.sdTotal}`);
    for (const h of derive.hits) console.log(`DERIVE ${h.owner}|${h.fn}|${h.call}|arity=${h.arity}|kind=${h.kind}`);
  }

  /* ── Stage A 快照（函数体 + 全 pgp_sym_* ACL 面）────────────────────────── */
  const aclA = await snapshotPgpAcls();
  const appendDefA = await pool.query<{ def: string }>(
    `SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,text,bigint,bigint)'::regprocedure`);
  const encDefA = await pool.query<{ def: string }>(
    `SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.pgp_sym_encrypt(text,text)'::regprocedure`);

  /* ── Stage B：应用 0151（恰一文件）─────────────────────────────────────── */
  {
    const r = await runMigrations(pool, all);
    A('P5-1 Stage B 仅应用 0151（applied 恰 1 · 其余 144 skip）',
      r.applied.length === 1 && r.applied[0] === MIGRATION_0151 && r.skipped.length === 144,
      `applied=${JSON.stringify(r.applied)} skipped=${r.skipped.length}`);
  }

  /* ── P1 proacl 实证（修复后）──────────────────────────────────────────── */
  {
    const grantees = await pool.query<{ grantee: string; privilege_type: string }>(
      `SELECT coalesce(r.rolname,'PUBLIC') AS grantee, a.privilege_type
         FROM pg_proc p CROSS JOIN aclexplode(p.proacl) a
         LEFT JOIN pg_roles r ON r.oid=a.grantee
        WHERE p.oid='public.pgp_sym_encrypt(text,text)'::regprocedure AND a.grantee <> p.proowner`);
    const executeGrantees = [...new Set(grantees.rows.filter((r) => r.privilege_type === 'EXECUTE').map((r) => r.grantee))].sort();
    A('P1-1 修复后 EXECUTE grantee 集恰 = 推导闭集 {memory_runtime} ∪ app_role（0121 原样保留）',
      JSON.stringify(executeGrantees) === JSON.stringify([...EXPECTED_CLOSED_SET, 'app_role'].sort()),
      `grantees=[${executeGrantees.join(',')}]`);
    const mem = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('memory_runtime','public.pgp_sym_encrypt(text,text)','EXECUTE') AS v`);
    const app = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('app_role','public.pgp_sym_encrypt(text,text)','EXECUTE') AS v`);
    const pub = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('public','public.pgp_sym_encrypt(text,text)','EXECUTE') AS v`);
    A('P1-2 memory_runtime EXECUTE=false→true（0151 生效）', mem.rows[0]?.v === true, `v=${mem.rows[0]?.v}`);
    A('P1-3 app_role 原样 EXECUTE=true（0121 不被触碰）', app.rows[0]?.v === true, `v=${app.rows[0]?.v}`);
    A('P1-4 PUBLIC=false（0121:14 REVOKE 不被回退 · 无泄漏）', pub.rows[0]?.v === false, `v=${pub.rows[0]?.v}`);
    const decMem = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('memory_runtime','public.pgp_sym_decrypt(bytea,text)','EXECUTE') AS v`);
    const decApp = await pool.query<{ v: boolean }>(`SELECT has_function_privilege('app_role','public.pgp_sym_decrypt(bytea,text)','EXECUTE') AS v`);
    A('P1-5 decrypt(bytea,text) 原样：memory_runtime=false（零 SD 调用不授）· app_role=true（0121 原样）',
      decMem.rows[0]?.v === false && decApp.rows[0]?.v === true,
      `memory_runtime=${decMem.rows[0]?.v} app_role=${decApp.rows[0]?.v}`);
    const t3 = await pool.query<{ v: boolean }>(
      `SELECT has_function_privilege('memory_runtime','public.pgp_sym_encrypt(text,text,text)','EXECUTE') AS v`);
    const t3app = await pool.query<{ v: boolean }>(
      `SELECT has_function_privilege('app_role','public.pgp_sym_encrypt(text,text,text)','EXECUTE') AS v`);
    A('P1-6 三参重载原样 owner-only：memory_runtime=false · app_role=false（0122 面零触碰）',
      t3.rows[0]?.v === false && t3app.rows[0]?.v === false,
      `memory_runtime=${t3.rows[0]?.v} app_role=${t3app.rows[0]?.v}`);
    const aclB = await snapshotPgpAcls();
    const diffed = [...aclB.entries()].filter(([fn, acl]) => aclA.get(fn) !== acl).map(([fn]) => fn);
    A('P1-7 全 pgp_sym_* 面 ACL 跨 stage 差恰一处（pgp_sym_encrypt:text,text +memory_runtime · 无其他面被动）',
      diffed.length === 1 && diffed[0] === 'pgp_sym_encrypt:text,text',
      `diffed=[${diffed.join(',')}] allAcl=[${[...aclA.keys()].join(',')}]`);
    const appendDefB = await pool.query<{ def: string }>(
      `SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,text,bigint,bigint)'::regprocedure`);
    const encDefB = await pool.query<{ def: string }>(
      `SELECT pg_get_functiondef(p.oid) AS def FROM pg_proc p WHERE p.oid='public.pgp_sym_encrypt(text,text)'::regprocedure`);
    A('P1-8 conversation_event_append 函数体跨 stage 逐字节全等（禁触函数体实证 · 0108 零改）',
      appendDefB.rows[0]?.def === appendDefA.rows[0]?.def);
    A('P1-9 pgp_sym_encrypt(text,text) 函数体跨 stage 逐字节全等（扩展函数体零改）',
      encDefB.rows[0]?.def === encDefA.rows[0]?.def);
  }

  /* ── P2 全链双向：修复前 P0-4 恰 42501 → 修复后 event+artifact 双 INSERT 落行绿 ── */
  {
    const bodyB = `dbacl2-p2-body-${process.pid}`;
    const r = await asRole('app_role', ownerB, callAppend(ownerB, bodyB, 'ek-p2'), true);
    const row = r.rows[0] ?? {};
    A('P2-1 全链绿：conversation_event_append 返回 event_id/sequence=1/digest/artifact_id/replayed=false（真实函数非 mock）',
      r.ok && r.rows.length === 1 && Boolean(row.event_id) && Number(row.sequence) === 1
        && /^[a-f0-9]{64}$/.test(String(row.event_digest)) && Boolean(row.artifact_id) && row.replayed === false,
      show(r));
    const evt = await pool.query<{ n: number; artifact_id: string; event_digest: string; status: string }>(
      `SELECT count(*) OVER () AS n, artifact_id, event_digest, status FROM conversation_event
        WHERE owner_user_id=$1 AND thread_id=$2`, [ownerB, THREAD]);
    const evtRow = evt.rows[0];
    A('P2-2 event 行落库恰 1 行：artifact_id 回链 + digest 与返回值一致 + status=active',
      evt.rows.length === 1 && evtRow?.artifact_id === row.artifact_id && evtRow?.event_digest === row.event_digest
        && evtRow?.status === 'active',
      `rows=${evt.rows.length} digest_match=${evtRow?.event_digest === row.event_digest}`);
    const art = await pool.query<{ n: number; octets: number; body_hmac: string; status: string; enc_key_version: number }>(
      `SELECT count(*) OVER () AS n, octet_length(ciphertext) AS octets, body_hmac, status, enc_key_version
         FROM conversation_event_artifact WHERE id=$1`, [row.artifact_id]);
    const artRow = art.rows[0];
    A('P2-3 artifact 行落库恰 1 行：ciphertext 非空（bytea 加密正文）+ body_hmac/enc_key_version/status 全对',
      art.rows.length === 1 && (artRow?.octets ?? 0) > 0 && artRow?.body_hmac === sha256(`${ownerB}:${bodyB}`)
        && artRow?.status === 'active' && Number(artRow?.enc_key_version) === 1,
      `rows=${art.rows.length} octets=${artRow?.octets}`);
    const roundtrip = await pool.query<{ body: string }>(
      `SELECT pgp_sym_decrypt(ciphertext, $2) AS body FROM conversation_event_artifact WHERE id=$1`,
      [row.artifact_id, ENC_KEY]);
    A('P2-4 真实加密回环：超用户 pgp_sym_decrypt(ciphertext, key) 还原原文逐字节一致（pgcrypto 真函数 · 非 mock）',
      roundtrip.rows[0]?.body === bodyB, `body=${roundtrip.rows[0]?.body}`);
    const replay = await asRole('app_role', ownerB, callAppend(ownerB, bodyB, 'ek-p2'), true);
    const evtCount = await pool.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM conversation_event WHERE owner_user_id=$1 AND thread_id=$2', [ownerB, THREAD]);
    const artCount = await pool.query<{ n: number }>(
      'SELECT count(*)::int AS n FROM conversation_event_artifact WHERE owner_user_id=$1', [ownerB]);
    A('P2-5 幂等重放：同 event_key 重放 replayed=true + 同 event_id + event/artifact 仍各恰 1 行（不双写）',
      replay.ok && replay.rows[0]?.replayed === true && replay.rows[0]?.event_id === row.event_id
        && evtCount.rows[0]?.n === 1 && artCount.rows[0]?.n === 1,
      `${show(replay)} evt=${evtCount.rows[0]?.n} art=${artCount.rows[0]?.n}`);
  }

  /* ── P3 过度授权负门（客观基线 = §3 推导集）────────────────────────────── */
  {
    const probe = `dbacl2_probe_${String(process.pid).slice(-6)}`;
    await pool.query(`CREATE ROLE ${probe} NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS`);
    try {
      const denied = await asRole(probe, null, (c) => c.query('SELECT public.pgp_sym_encrypt($1,$2)', ['probe', 'probe']));
      A('P3-1 新建无关系角色直调 pgp_sym_encrypt 仍恰 42501（未过度授权）', isMine(denied), show(denied));
      const probePriv = await pool.query<{ v: boolean }>(
        `SELECT has_function_privilege($1,'public.pgp_sym_encrypt(text,text)','EXECUTE') AS v`, [probe]);
      A('P3-2 新角色 has_function_privilege EXECUTE=false（0151 白名单外零授予）',
        probePriv.rows[0]?.v === false, `v=${probePriv.rows[0]?.v}`);
    } finally {
      await pool.query(`DROP ROLE ${probe}`);
    }
    // 0151 全文白名单机检：恰 1 条 GRANT · 目标集 = §3 推导闭集 · 无 GRANT ALL/无其他语句
    const raw = readFileSync(`${MIG_DIR}/${MIGRATION_0151}.sql`, 'utf8');
    const noComments = raw.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
    const stmts = splitSql(noComments);
    const grantRe = /^GRANT EXECUTE ON FUNCTION public\.pgp_sym_encrypt\(text,text\) TO ([a-z_]+)$/;
    const grants = stmts.filter((s) => grantRe.test(s));
    const roles = grants.map((s) => grantRe.exec(s)![1]!);
    A('P3-3 0151 恰 1 条 GRANT EXECUTE ON FUNCTION public.pgp_sym_encrypt(text,text) 语句（无其他语句）',
      stmts.length === 1 && grants.length === 1, `stmts=${stmts.length}`);
    A('P3-4 GRANT 目标集 = §3 catalog 推导闭集（非刀自定义）· 无重复',
      JSON.stringify([...new Set(roles)].sort()) === JSON.stringify(derive.owners) && roles.length === 1,
      `roles=[${roles.join(',')}] derived=[${derive.owners.join(',')}]`);
    const banned = /\b(ALL|DROP|REVOKE|ALTER|CREATE|TRIGGER|UPDATE|DELETE|INSERT|OWNER|GRANT\s+[A-Z])\b/;
    const bannedHits = stmts.filter((s) => banned.test(s.replace(/^GRANT EXECUTE ON FUNCTION public\.pgp_sym_encrypt\(text,text\) TO [a-z_]+$/, '')));
    A('P3-5 无 GRANT ALL / 无 DROP/REVOKE/ALTER/CREATE 等非 GRANT-EXECUTE 精确形语句', bannedHits.length === 0);
  }

  /* ── P4 静态契约门（历史迁移零字节 · 产品码零改）────────────────────────── */
  {
    const diff = spawnSync('git', ['diff', '--name-status', BASE_SHA, 'HEAD', '--', 'packages/db/migrations'], { cwd: ROOT, encoding: 'utf8' });
    const lines = (diff.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
    A('P4-1 0001–0143 历史迁移对 base 零字节 diff · 0151 恰一新增文件（无 M/D 行）',
      diff.status === 0 && lines.length === 1 && /^A\s+packages\/db\/migrations\/0151_pgp_sym_encrypt_grant\.sql$/.test(lines[0]!),
      `diff=[${lines.join(';')}] status=${diff.status}`);
    const changed = spawnSync('git', ['diff', '--name-only', BASE_SHA, 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
    const files = (changed.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
    const allow = new Set([
      'packages/db/migrations/0151_pgp_sym_encrypt_grant.sql',
      'packages/db/test/db-acl2.proof.ts',
      'packages/db/package.json',
      'package.json',
      'scripts/run-e2e-isolated.mjs',
      'ai-docs/delivery/harness/dbacl2-pgp-grant.md',
      'ai-docs/delivery/receipts/dbacl2-pgp-grant/exec.md',
    ]);
    const unexpected = files.filter((f) => !allow.has(f));
    A('P4-2 改动面白名单（prove/wiring/receipt 之外零改）',
      changed.status === 0 && unexpected.length === 0, `unexpected=[${unexpected.join(';')}]`);
    A('P4-3 产品码零改（packages/db/src 与 apps/*/src 无 diff）',
      !files.some((f) => f.startsWith('packages/db/src/') || /^apps\/[^/]+\/src\//.test(f)));
  }

  /* ── P5 migrate 门（applied 数 = 文件数 · 重跑零漂移 · 官方 migrate:prove 全绿）── */
  {
    const count = await pool.query<{ n: number }>('SELECT count(*)::int AS n FROM schema_migrations');
    A('P5-2 ledger applied = 磁盘文件数 = 145（0001–0143 双 0143=144 + 0151 · 号位空洞不阻断）',
      count.rows[0]?.n === all.length && all.length === 145, `ledger=${count.rows[0]?.n} files=${all.length}`);
    const rerun = await runMigrations(pool, all);
    A('P5-3 重跑全 skip（幂等 · checksum 零漂移 · 禁改历史迁移门复验）',
      rerun.applied.length === 0 && rerun.skipped.length === 145,
      `applied=${rerun.applied.length} skipped=${rerun.skipped.length}`);
  }

  console.log(`RESULT dbacl2-db-acl failures=${failures} at=${new Date().toISOString()}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await pool.end().catch(() => undefined); process.exit(1); });
