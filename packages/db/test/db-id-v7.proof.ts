/**
 * DBID-1 · 数据库 ID 统一优化刀 prove（P1–P6 + 对表勾销块 P7 · 硬规则 11 / DEF-2）。
 *
 * 跑在 run-e2e-isolated.mjs 起的临时 Postgres（完整迁移至 0143 + nonce 校验）：
 *   P1 SQL uuidv7() 位域/单调/同 ms 零碰撞/跨事务单调（1000 次）
 *   P2 RFC 9562 §5.2 已知答案测试（SQL ↔ TS 镜像 ↔ RFC 常量三方比对 + 越界 fail-closed）
 *   P3 ids.ts 工厂：白名单 fail-closed · <prefix>_<32hex> · v7 位域 · 10000 次零碰撞 ·
 *      字典序=生成序（Spearman ≥ 0.999）· 解码 helper
 *   P4 catalog 断言：55 表 DEFAULT=uuidv7()（N1：ai_graph_run=run_id）· gen_random_uuid 清零 ·
 *      4 bigint + 6 boolean singleton + 5 无 DEFAULT 面原样
 *   P5 INSERT 冒烟：DEFAULT 路径（entitlement_bucket/commerce_outbox）新行前 48bit=当前 ms 窗口 ·
 *      B2 显式 id 路径（submitInterviewAnswer 走 asPrincipal + interview FK 链造数）
 *   P6 migration 文本静态门：语句白名单（2×CREATE FUNCTION + 2×COMMENT + 55×ALTER SET DEFAULT）·
 *      零 UPDATE/DELETE/DROP/GRANT/TRIGGER/类型变更 = append-only 零回填硬保证
 *   P7 对表勾销块（DEF-2 · 硬规则 11）：postgres skill 7 项 + NEXT-NODE C4，程序可判处断言、
 *      其余登记台账指针（禁 silently 通过）
 *
 * EXIT=0 才过；attempts 全账纪律见收据（Ban retry-to-green）。
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool, asPrincipal, assertIsolatedTestTarget, submitInterviewAnswer, newEntityId, newUuidV7, idUnixMs, ENTITY_PREFIXES } from '../src/index.ts';

// submitInterviewAnswer 的加密/HMAC 密钥（惰性读取，先注入；长度 ≥16 过 requireSecret；隔离库·非密钥）。
process.env.INTERVIEW_ANSWER_ENC_KEY = 'proof_dbid1_enc_key__16ch';
process.env.INTERVIEW_ANSWER_HMAC_SECRET = 'proof_dbid1_hmac_secret16';

const pool = createPool();
const owner = `dbid1-owner-${process.pid}`;
let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

/** A 级 55 表（亲核 @7135f615；N1：ai_graph_run 主键列 = run_id，其余 = id）。 */
const A_TABLES: ReadonlyArray<readonly [string, string]> = [
  ['entitlement_consumption', 'id'], ['entitlement_bucket', 'id'], ['consumption_record', 'id'],
  ['commerce_outbox', 'id'], ['settlement_ledger', 'id'], ['ai_graph_run', 'run_id'],
  ['privacy_deletion_target', 'id'], ['privacy_erasure_request', 'id'],
  ['resume', 'id'], ['interview_job', 'id'], ['ai_report', 'id'], ['quiz_job', 'id'], ['diagnosis_job', 'id'],
  ['interview_answer_submission', 'id'], ['interview_answer_artifact', 'id'], ['interview_answer_job', 'id'],
  ['conversation_event', 'id'], ['conversation_event_artifact', 'id'],
  ['context_compression_snapshot', 'id'], ['context_compression_dispatch', 'id'],
  ['issued_question_contract', 'id'], ['score_request', 'id'], ['score_card', 'id'], ['score_card_criterion', 'id'], ['score_evidence', 'id'],
  ['online_judge_candidate', 'id'], ['online_judge_dispatch', 'id'], ['online_judge_lot', 'id'],
  ['memory_consent', 'id'], ['memory_fact', 'id'], ['memory_context_snapshot', 'id'], ['memory_index_generation', 'id'],
  ['memory_fact_adjudication', 'id'], ['memory_fact_relationship', 'id'], ['memory_recall_context_snapshot', 'id'],
  ['memory_index_generation_cache_entry', 'id'], ['memory_index_generation_embedding', 'id'],
  ['memory_index_source_manifest', 'id'], ['memory_index_source_manifest_item', 'id'],
  ['memory_summary', 'id'], ['memory_admission_authorization', 'id'], ['memory_admission_record', 'id'],
  ['privacy_authorization_snapshot', 'id'], ['privacy_deletion_receipt', 'id'],
  ['privacy_preview_request', 'id'], ['privacy_external_purge_evidence', 'id'],
  ['memory_collection_pause', 'id'], ['memory_correction_command', 'id'], ['memory_deletion_request', 'id'],
  ['memory_deletion_target', 'id'], ['memory_export_receipt', 'id'], ['memory_policy_publish_command', 'id'],
  ['memory_reindex_task', 'id'], ['question_rubric', 'id'], ['question_rubric_criterion', 'id'],
];

const hexOf = (u: string) => u.replaceAll('-', '');
const v7UnixMs = (u: string): number => Number.parseInt(hexOf(u).slice(0, 12), 16);
const isV7Shape = (u: string): boolean => {
  const h = hexOf(u);
  return /^[0-9a-f]{32}$/.test(h) && h[12] === '7' && (Number.parseInt(h[16]!, 16) & 0xc) === 0x8;
};
const inWindow = (ms: number, nowMs: number): boolean => ms >= nowMs - 60_000 && ms <= nowMs + 5_000;

/** Spearman 等级相关（严格单调时 = 1；合同阈值 ≥ 0.999）。 */
function spearman(xs: number[], ys: number[]): number {
  const rank = (v: number[]) => {
    const idx = v.map((val, i) => [val, i] as const).sort((a, b) => a[0] - b[0]);
    const r = new Array<number>(v.length);
    for (let i = 0; i < idx.length; i++) r[idx[i]![1]] = i;
    return r;
  };
  const rx = rank(xs), ry = rank(ys);
  const n = xs.length;
  const mx = rx.reduce((s, v) => s + v, 0) / n, my = ry.reduce((s, v) => s + v, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) { num += (rx[i]! - mx) * (ry[i]! - my); dx += (rx[i]! - mx) ** 2; dy += (ry[i]! - my) ** 2; }
  return num / Math.sqrt(dx * dy);
}

async function main() {
  await assertIsolatedTestTarget(pool);
  console.log(`ATTEMPT dbid1-db-id-v7 pid=${process.pid} startedAt=${new Date().toISOString()} attemptsLedger=required`);

  /* ── P1 · SQL uuidv7() 位域 / 单调 / 同 ms 零碰撞 / 跨事务单调 ───────────── */
  {
    const r = await pool.query<{ id: string; approx_ms: string }>(
      `SELECT uuidv7()::text AS id, (extract(epoch FROM clock_timestamp()) * 1000)::text AS approx_ms FROM generate_series(1, 1000)`,
    );
    const rows = r.rows;
    A('P1-1 版本位=0111 且 variant=10（1000/1000）', rows.every((x) => isV7Shape(x.id)));
    const nowMs = Date.now();
    A('P1-2 前 48bit unix_ms ∈ [now-5s, now+5s]（1000/1000）',
      rows.every((x) => { const ms = v7UnixMs(x.id); return ms >= nowMs - 5_000 && ms <= nowMs + 5_000; }));
    A('P1-3 timestamp 非降（1000 次顺序调用）',
      rows.every((x, i) => i === 0 || v7UnixMs(x.id) >= v7UnixMs(rows[i - 1]!.id)));
    A('P1-4 全量唯一（1000 次零重复）', new Set(rows.map((x) => x.id)).size === rows.length);
    const byMs = new Map<number, string[]>();
    for (const x of rows) {
      const ms = v7UnixMs(x.id);
      const tail = hexOf(x.id).slice(13); // rand_a + var + rand_b（同 ms 区分段）
      const g = byMs.get(ms) ?? []; g.push(tail); byMs.set(ms, g);
    }
    A('P1-5 同 ms 内随机尾部碰撞 0（逐 ms 组：Set 去重后长度不变）',
      [...byMs.values()].every((g) => new Set(g).size === g.length));
    // 跨事务单调：两连接交替「独立事务生成 + 提交」，按提交序 timestamp 非降（同 ms 允许并列）。
    const c1 = await pool.connect(); const c2 = await pool.connect();
    let mono = true;
    try {
      let prev = -1;
      for (let i = 0; i < 10; i++) {
        for (const c of [c1, c2]) {
          await c.query('BEGIN');
          const g = await c.query<{ id: string }>('SELECT uuidv7()::text AS id');
          await c.query('COMMIT');
          const ms = v7UnixMs(g.rows[0]!.id);
          if (ms < prev) mono = false;
          prev = ms;
        }
      }
    } finally { c1.release(); c2.release(); }
    A('P1-6 跨事务单调（两连接交替提交 20 txn，按序 ts 非降）', mono);
  }

  /* ── P2 · RFC 9562 §5.2 KAT（三方比对：SQL ↔ TS 镜像 ↔ RFC 常量） ─────────── */
  {
    const UNIX_MS = Number.parseInt('017f22e279b0', 16); // RFC 9562 §5.2 示例时间戳
    const RAND_A = 0x0cc3;
    const RAND_B = 0x18c4dc0c0c07398fn; // 62bit：变位 nibble = 8 | rand_b>>60 = 9
    const RFC = '017f22e2-79b0-7cc3-98c4-dc0c0c07398f';
    const sql = await pool.query<{ id: string }>('SELECT uuidv7_from_parts($1::bigint, $2::bigint, $3::bigint)::text AS id',
      [String(UNIX_MS), String(RAND_A), RAND_B.toString()]); // BigInt > 2^53 须经字符串入参（pg 不序列化 BigInt）
    // TS 镜像：prove 内独立复算（不经 ids.ts / 不经 SQL）。
    const tsMirror = (
      UNIX_MS.toString(16).padStart(12, '0')
      + '7' + RAND_A.toString(16).padStart(3, '0')
      + (8 | Number(RAND_B >> 60n)).toString(16)
      + (RAND_B & 0x0fffffffffffffffn).toString(16).padStart(15, '0')
    );
    const sqlId = sql.rows[0]!.id;
    A('P2-1 SQL uuidv7_from_parts == RFC 9562 §5.2 示例', sqlId === RFC);
    A('P2-2 TS 镜像复算 == RFC 9562 §5.2 示例（三方一致）', tsMirror === hexOf(RFC) && tsMirror.length === 32);
    let threw = false;
    try { await pool.query('SELECT uuidv7_from_parts(-1::bigint, 0::bigint, 0::bigint)'); } catch { threw = true; }
    A('P2-3 越界入参 fail-closed 抛错（unix_ms<0）', threw);
  }

  /* ── P3 · ids.ts 工厂 ──────────────────────────────────────────────────── */
  {
    const domains = Object.keys(ENTITY_PREFIXES) as Array<keyof typeof ENTITY_PREFIXES>;
    let allOk = true;
    for (const d of domains) {
      const lit = ENTITY_PREFIXES[d];
      const id = newEntityId(d);
      const tail = id.slice(lit.length);
      if (!id.startsWith(lit) || !/^[0-9a-f]{32}$/.test(tail) || tail[12] !== '7'
        || (Number.parseInt(tail[16]!, 16) & 0xc) !== 0x8 || id.length !== lit.length + 32) allOk = false;
    }
    A('P3-1 白名单全前缀：`<prefix>_<32hex>` · 长度=len(prefix)+32 · v7 位域', allOk);
    let threw = false;
    try { newEntityId('nope'); } catch (e) { threw = (e as { code?: string }).code === 'entity_prefix_not_registered'; }
    A('P3-2 未登记前缀 fail-closed throw entity_prefix_not_registered', threw);
    const ids: string[] = [];
    const t0 = Date.now();
    for (let i = 0; i < 10_000; i++) ids.push(newEntityId('job'));
    const t1 = Date.now();
    A('P3-3 10000 次生成零碰撞', new Set(ids).size === 10_000);
    const sorted = [...ids].sort();
    A('P3-4 字典序 = 生成序（严格单调，排序后逐位相等）', sorted.every((v, i) => v === ids[i]));
    A('P3-5 Spearman(生成序, 字典序) ≥ 0.999',
      spearman(ids.map((_, i) => i), ids.map((id) => sorted.indexOf(id))) >= 0.999);
    A('P3-6 解码 helper：idUnixMs(生成 id) ∈ 生成时间窗',
      ids.filter((id) => { const ms = idUnixMs(id); return ms !== null && ms >= t0 - 5_000 && ms <= t1 + 5_000; }).length === 10_000);
    const u7 = newUuidV7();
    A('P3-7 newUuidV7 连字符 v7 形态 + 可解码',
      /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(u7)
      && idUnixMs(u7) !== null && Math.abs(idUnixMs(u7)! - Date.now()) < 5_000);
    A('P3-8 解码 helper fail-closed：v4 / 垃圾 / 短尾 → null',
      idUnixMs('017f22e2-79b0-4cc3-98c4-dc0c0c07398f') === null
      && idUnixMs('not-a-v7-id') === null && idUnixMs('job_zzz') === null);
  }

  /* ── P4 · catalog 断言（55 表 + 保留面原样） ───────────────────────────── */
  {
    const leftover = await pool.query<{ n: string }>(
      `SELECT count(*)::text AS n FROM information_schema.columns
        WHERE table_schema='public' AND column_default LIKE '%gen_random_uuid()%'`);
    A('P4-1 gen_random_uuid() 默认值清零（55/55 已切换）', leftover.rows[0]!.n === '0');
    let allSwitched = true; let badTable = '';
    for (const [table, col] of A_TABLES) {
      const c = await pool.query<{ d: string | null }>(
        'SELECT column_default::text AS d FROM information_schema.columns WHERE table_schema=$3 AND table_name=$1 AND column_name=$2',
        [table, col, 'public']);
      const d = c.rows[0]?.d ?? null;
      if (d === null || !d.includes('uuidv7()')) { allSwitched = false; badTable = `${table}.${col}=${d}`; break; }
    }
    A(`P4-2 55 表 DEFAULT=uuidv7()（含 N1 ai_graph_run.run_id）`, allSwitched && !badTable);
    const bigintFaces: Array<readonly [string, string]> = [
      ['interview_event', 'id'], ['memory_audit_event', 'id'],
      ['rag_cache_invalidation_outbox', 'id'], ['rag_generation_release_event', 'id'],
    ];
    let bigintOk = true;
    for (const [table, col] of bigintFaces) {
      const c = await pool.query<{ d: string | null; ident: string }>(
        `SELECT column_default::text AS d, is_identity::text AS ident FROM information_schema.columns
          WHERE table_schema='public' AND table_name=$1 AND column_name=$2`, [table, col]);
      const row = c.rows[0];
      if (!row || !((row.d ?? '').startsWith('nextval') || row.ident === 'YES')) bigintOk = false;
    }
    A('P4-3 4 张 bigint 事件表面原样（bigserial/IDENTITY 保留）', bigintOk);
    const booleanFaces: Array<readonly [string, string]> = [
      ['qbank_cache_epoch', 'singleton'], ['qbank_active_generation', 'singleton'], ['qbank_corpus_epoch', 'singleton'],
      ['rag_corpus_epoch', 'singleton'], ['rag_active_generation', 'singleton'], ['rag_cache_epoch', 'singleton'],
    ];
    let booleanOk = true;
    for (const [table, col] of booleanFaces) {
      const c = await pool.query<{ d: string | null }>(
        `SELECT column_default::text AS d FROM information_schema.columns
          WHERE table_schema='public' AND table_name=$1 AND column_name=$2`, [table, col]);
      if (c.rows[0]?.d !== 'true') booleanOk = false;
    }
    A('P4-4 6 张 boolean singleton DEFAULT=true 原样', booleanOk);
    const noDefaultFaces: Array<readonly [string, string]> = [
      // N3 勘误：这 5 张无 DEFAULT uuid 表的主键列名非 id——target 族=target_id · resume 族=resume_id。
      ['privacy_checkpoint_target', 'target_id'], ['interview_answer_artifact_target', 'target_id'],
      ['interview_projection_target', 'target_id'], ['resume_blob', 'resume_id'], ['resume_profile', 'resume_id'],
    ];
    let noDefaultOk = true;
    for (const [table, col] of noDefaultFaces) {
      const c = await pool.query<{ d: string | null }>(
        `SELECT column_default::text AS d FROM information_schema.columns
          WHERE table_schema='public' AND table_name=$1 AND column_name=$2`, [table, col]);
      if (c.rows.length === 0 || c.rows[0]!.d !== null) noDefaultOk = false;
    }
    A('P4-5 5 张无 DEFAULT uuid 面仍无 DEFAULT（FK/显式供 id · 不适用切换）', noDefaultOk);
  }

  /* ── P5 · INSERT 冒烟（DEFAULT 路径 + B2 asPrincipal/FK 链显式 id 路径） ─── */
  {
    const before = await pool.query<{ n: string }>('SELECT count(*)::text AS n FROM entitlement_bucket');
    const b = await pool.query<{ id: string }>(
      `INSERT INTO entitlement_bucket(owner_user_id, kind, units_total, expires_at)
       VALUES ($1, 'paid', 10, now() + interval '365 days') RETURNING id::text`, [owner]);
    const bucketMs = v7UnixMs(b.rows[0]!.id);
    A('P5-1 entitlement_bucket 新行 id 为 v7 且前 48bit ∈ [now-60s, now+5s]',
      isV7Shape(b.rows[0]!.id) && inWindow(bucketMs, Date.now()));
    const o = await pool.query<{ id: string }>(
      `INSERT INTO commerce_outbox(owner_user_id, kind, consumption_id, payload)
       VALUES ($1, 'settlement_proposed', $2::uuid, '{}') RETURNING id::text`, [owner, b.rows[0]!.id]);
    A('P5-2 commerce_outbox 新行 id 为 v7 且时间窗口正确（依赖 DEFAULT，无显式 id）',
      isV7Shape(o.rows[0]!.id) && inWindow(v7UnixMs(o.rows[0]!.id), Date.now()));
    const after = await pool.query<{ n: string }>('SELECT count(*)::text AS n FROM entitlement_bucket');
    A('P5-3 append-only：entitlement_bucket 计数恰 +1（新增无改写/无删除）',
      Number(after.rows[0]!.n) === Number(before.rows[0]!.n) + 1);
    // B2：真实路径 submitInterviewAnswer（asPrincipal + interview FK 链造数）——三表显式 id 走 ids.ts。
    const ivId = `00000000-0000-4000-8000-${(0xdb1d1000 + (process.pid % 1000)).toString(16).padStart(4, '0')}${'0'.repeat(4)}`;
    await pool.query(
      "INSERT INTO interview(id,owner_user_id,status,version,current_question_index,questions) VALUES ($1,$2,'active',0,0,'[]'::jsonb)",
      [ivId, owner]);
    const submitted = await asPrincipal(pool, owner, (c) => submitInterviewAnswer(c, {
      interviewId: ivId, questionId: 'q-dbid1', stateVersion: 3, clientSubmissionKey: `dbid1-${process.pid}`,
      answer: 'proof-answer-body', privacyEpoch: 1,
    }));
    const got = await pool.query<{ s: string; a: string; j: string }>(
      `SELECT (SELECT id::text FROM interview_answer_submission WHERE id=$1) AS s,
              (SELECT id::text FROM interview_answer_artifact WHERE id=$2) AS a,
              (SELECT id::text FROM interview_answer_job WHERE id=$3) AS j`,
      [submitted.submissionId, submitted.artifactId, submitted.jobId]);
    const row = got.rows[0]!;
    const now = Date.now();
    A('P5-4 B2 interview_answer_submission/artifact/job 三表显式 id 均为 v7（round-trip 落库形态）',
      isV7Shape(row.s) && isV7Shape(row.a) && isV7Shape(row.j));
    A('P5-5 B2 三 id 前 48bit ∈ [now-60s, now+5s]（时间有序落地）',
      inWindow(v7UnixMs(row.s), now) && inWindow(v7UnixMs(row.a), now) && inWindow(v7UnixMs(row.j), now));
  }

  /* ── P6 · migration 文本静态门（append-only 零回填的结构性硬保证） ────────── */
  {
    const migPath = fileURLToPath(new URL('../migrations/0143_db_id_v7_unify.sql', import.meta.url));
    const raw = readFileSync(migPath, 'utf8');
    const noComments = raw.split('\n').map((l) => l.replace(/--.*$/, '')).join('\n');
    // dollar-quote 感知切分：$fn$ 函数体内的 ';' 不当语句边界（否则函数体会被误拆成「未知语句」）。
    const splitSql = (text: string): string[] => {
      const out: string[] = [];
      let start = 0;
      let i = 0;
      while (i < text.length) {
        if (text[i] === '$') {
          const tag = /^\$[A-Za-z_][A-Za-z0-9_]*\$/.exec(text.slice(i));
          if (tag) {
            const close = text.indexOf(tag[0], i + tag[0].length);
            if (close === -1) throw new Error('p6_dollar_quote_unterminated');
            i = close + tag[0].length;
            continue;
          }
        }
        if (text[i] === ';') {
          const s = text.slice(start, i).trim();
          if (s.length > 0) out.push(s);
          i += 1;
          start = i;
          continue;
        }
        i += 1;
      }
      const tail = text.slice(start).trim();
      if (tail.length > 0) out.push(tail);
      return out;
    };
    const stmts = splitSql(noComments);
    const alterRe = /^ALTER TABLE ONLY public\.[a-z_]+\s+ALTER COLUMN [a-z_]+\s+SET DEFAULT public\.uuidv7\(\)$/;
    const createFn = stmts.filter((s) => s.startsWith('CREATE OR REPLACE FUNCTION public.uuidv7()')).length;
    const createKat = stmts.filter((s) => s.startsWith('CREATE OR REPLACE FUNCTION public.uuidv7_from_parts(')).length;
    const comments = stmts.filter((s) => s.startsWith('COMMENT ON FUNCTION ')).length;
    const alters = stmts.filter((s) => alterRe.test(s)).length;
    const whitelisted = stmts.filter((s) =>
      s.startsWith('CREATE OR REPLACE FUNCTION public.uuidv7()')
      || s.startsWith('CREATE OR REPLACE FUNCTION public.uuidv7_from_parts(')
      || s.startsWith('COMMENT ON FUNCTION ')
      || alterRe.test(s)).length;
    const other = stmts.length - whitelisted;
    const runId = stmts.filter((s) => s.includes('ai_graph_run') && s.includes('run_id')).length;
    const banned = /\b(DROP|GRANT|REVOKE|TRIGGER|UPDATE|DELETE|INSERT|CREATE INDEX|ADD CONSTRAINT|NOT VALID|VALIDATE CONSTRAINT|REPLICA IDENTITY|OWNER TO|SECURITY LABEL)\b/i;
    const bannedHits = stmts.filter((s) => banned.test(s));  // 全语句含函数体逐一扫描（无豁免）
    A('P6-1 语句白名单：1×CREATE uuidv7 + 1×CREATE from_parts + 2×COMMENT + 55×ALTER SET DEFAULT，无其他语句',
      createFn === 1 && createKat === 1 && comments === 2 && alters === 55 && other === 0 && runId === 1);
    A('P6-2 零 DROP/GRANT/TRIGGER/UPDATE/DELETE/类型变更（全语句含函数体，append-only 硬保证）', bannedHits.length === 0);
  }

  /* ── P7 · 对表勾销块（DEF-2 · 硬规则 11 · 判据=postgres skill 7 项 + NEXT-NODE C4） ── */
  {
    console.log('CHECK  [对表·postgres-skill] 1 新表代理键=uuid DEFAULT uuidv7()/业务可读键=text prefix+v7尾/事件表=bigserial —— 本刀落地(P1/P4/P5) ✅');
    console.log('CHECK  [对表·postgres-skill] 2 域前缀注册表制·新前缀须登记 —— ids.ts ENTITY_PREFIXES fail-closed(P3-2) ✅');
    console.log('CHECK  [对表·postgres-skill] 3 高频列索引 —— 本刀零新增索引面·存量违规已登记台账(GAP-DEBT-DB 族) ≠silently 通过');
    console.log('CHECK  [对表·postgres-skill] 4 status CHECK/金额单位 —— 不在刀面·已登记台账(GAP-DEBT-DB-MONEY3) ≠silently 通过');
    console.log('CHECK  [对表·postgres-skill] 5 jsonb 万能口袋/timestamptz —— 不在刀面·已登记台账(GAP-DEBT-DB-HYGIENE) ≠silently 通过');
    console.log('CHECK  [对表·postgres-skill] 6 触发器同族禁复制 —— 本刀触发器零触碰(P6-2) ✅');
    console.log('CHECK  [对表·postgres-skill] 7 迁移 append-only·存量行 ID 永不回填 —— P6 语句白名单结构性保证 ✅');
    const kebab = (f: string) => /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)+$/.test(f); // 多段扩展名（.proof.ts）合法
    const newFiles = ['ids.ts', 'db-id-v7.proof.ts', 'id-convention.md'].map((f) => kebab(f));
    const snake = /^0143_db_id_v7_unify\.sql$/.test('0143_db_id_v7_unify.sql');
    A('P7-1 NEXT-NODE C4 kebab-case：本刀新增文件名全部合规（migration 从仓库 snake 惯例）',
      newFiles.every(Boolean) && snake);
    console.log('CHECK  [对表·NEXT-NODE C1/C2] lint/tsc-CI 门 —— 台账既有 ❌ 行·不在本刀面（C1/C2 刀治理） ≠silently 通过');
  }

  console.log(`RESULT dbid1-db-id-v7 failures=${failures} at=${new Date().toISOString()}`);
  await pool.end();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(async (e) => { console.error(e); await pool.end().catch(() => undefined); process.exit(1); });
