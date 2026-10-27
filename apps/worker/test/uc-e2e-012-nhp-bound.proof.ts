/**
 * NHP-012-BOUND-01 · UC-E2E-012/024 BOUND 分面（幂等闸边界：event_key arbiter 原语/约束/并发级）
 *
 * REQUEST: ai-docs/delivery/harness/reassess-e2e-REQUEST.md §1 case-2（§1.0.1 :118 残余 BOUND cell
 * gap→case-only · 与批 A F3 drain 循环级互斥零借用）· Base: line/reassess-draft（merge
 * origin/main 0246361dd · EXEC tip 见 §9-EXEC）。
 *
 * 需求源: e2e-scenarios.md:282（E-补评幂等「同题补评只算一次」）· §0.2 缝 C：
 * interview-event.ts:16 appendEvent / :22 pg_advisory_xact_lock / :23-:26 event_key 先查
 * （replay-returns-existing）/ :29-:33 INSERT…SELECT MAX+1 + ON CONFLICT（:32）/ :37-:40 冲突复读；
 * 0021:3 `uq_interview_event_key` partial unique index（WHERE event_key IS NOT NULL）= HEAD 唯一
 * 底闸（0027 表级约束已于 0149:77 删除 · 零重建）；adaptive-lifecycle.ts:84-:86 kind 前缀键域注记。
 * D2 披露: 断言键全用产品真键域（kind 前缀 event_key），Ban 宣称字面 spec 键已验。
 *
 * 臂: **B1** replay-returns-existing（同 event_key 二次 append → 同 seq 返回 · 行数零增 · payload
 * 不被覆写）；**B2** 并发竞态收敛恰 1 行——**双 pool client 双会话**（B2a=双会话同键真并发 ·
 * advisory 锁串行+复读收敛；B2b=无锁直写会话×仓储会话交错 → ON CONFLICT(:32)+复读(:37-:40)
 * 收敛同 seq · **Ban 同事务自串行冒充并发**）；**B3** 键域边界（`answer_unscored:Q` 与
 * `answer_evaluated:Q` 同流共存零碰撞 · kind 前缀键域=spec `(interviewId,questionId)` 幂等键的
 * 产品映射）；**B4** 唯一底闸（绕仓储直 INSERT 同键 → **断言口径 errcode-only 23505**（Ban 约束
 * 名字面断言）· 0021 partial index 底闸 · 直 INSERT 会话=app_role+GUC 就位（0195 仅 REVOKE
 * UPDATE · INSERT 授权在）防 42501）。
 *
 * Evidence layer: isolated 真 PG（run-e2e-isolated 全迁移链）· 事件造数全部经产品原语 appendEvent
 * （被测系统本身）；裸直 INSERT 仅 B2b/B4 两处=REQUEST 具名对抗写手（约束级行使 · 具名入收据
 * 豁免清单）· interview 壳行 'created' 夹具（豁免具名）· 零 live 模型 · 零外呼。EXIT0 = 具名 case
 * 真证据 ≠ covered ≠ suite green；§1.0.1 :118 行措辞零翻动 · coveredCount=8。
 *
 *   pnpm uc012:nhp-bound:prove              （root · isolated）
 *   pnpm -C apps/worker prove:uc012-nhp-bound （raw; needs isolated DATABASE_URL from the runner）
 */
process.env.RESUME_ENC_KEY = 'uc012-nhp-bound-resume-enc-key';
process.env.RESUME_HASH_SECRET = 'uc012-nhp-bound-resume-hash-secret';
process.env.RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'uc012-nhp-bound-job-route-input-hmac-proof-key-not-production-01';
import {
  createPool, asPrincipal, provisionRuntimeLogin, appendEvent, assertIsolatedTestTarget,
} from '@meetwise/db';

let failures = 0;
let total = 0;
const A = (name: string, ok: boolean) => { total++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures += 1; };
const E = (id: string, data: unknown) => console.log(`EVIDENCE ${id} ${JSON.stringify(data)}`);
const section = (t: string) => console.log(`\n──────── ${t} ────────`);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const errCode = (e: unknown): string => String((e as { code?: string })?.code ?? '');

console.log('NHP-012-BOUND-01 UC-E2E-012/024 BOUND prove (B1-B4 · 缝 C 原语/约束/并发 · Ban live)');
console.log('Pins: haStatus=NOT_HA · releaseEvidence=false · coveredCount=8 · §1.0.1 :118 措辞零翻动 · EXIT0≠covered');

// ── 零模型面（本 case 零模型调用 · 三键具名不在场=防御性登记 · 词面已入 egress 清单）──
const keysOnEntry = ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']
  .filter((k) => String(process.env[k] ?? '').trim().length > 0);
for (const k of ['MODEL_API_KEY', 'DASHSCOPE_API_KEY', 'DASHSCOPE_COMPAT_BASE_URL']) delete process.env[k];
A('L0 零模型: 三键（MODEL_API_KEY/DASHSCOPE_API_KEY/DASHSCOPE_COMPAT_BASE_URL）入场均不在场', keysOnEntry.length === 0);

const S = Date.now().toString(36);
const admin = createPool();
const role = `uc012_nhp_bound_${process.pid}`;
let runtime!: ReturnType<typeof createPool>;

const OWN = (k: string) => `uc012b-${k}-${S}`;
const IID = (k: string) => `iv-uc012b-${k}-${S}`;

const rowsOf = async (owner: string, stream: string, key?: string) =>
  (await asPrincipal(admin, owner, (c) => c.query(
    'SELECT seq::text, kind, payload, event_key FROM interview_event WHERE stream_key=$1 AND ($2::text IS NULL OR event_key=$2) ORDER BY seq',
    [stream, key ?? null]))).rows.map((r: any) => ({ ...r, seq: Number(r.seq) })) as Array<{ seq: number; kind: string; payload: any; event_key: string }>;

/** 夹具（豁免具名）：interview 壳行 'created'（批 A ②c 同形）——原语/约束级行使零业务流依赖，
 *  零 resume 链零 reserve 零 start job；事件造数全经被测原语 appendEvent（B2b/B4 直 INSERT=
 *  REQUEST 具名对抗写手除外）。 */
async function shellFixture(tag: string): Promise<{ owner: string; id: string }> {
  const owner = OWN(tag), id = IID(tag);
  await admin.query("INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'created')", [id, owner]);
  const st = await asPrincipal(admin, owner, (c) => c.query('SELECT status FROM interview WHERE id=$1 AND owner_user_id=$2', [id, owner]));
  A(`[${tag}] 守护① 壳行插入态='created'`, st.rows[0]?.status === 'created');
  return { owner, id };
}

/** 双 pool client 双会话（asPrincipal 同形手工展开 · SET LOCAL ROLE app_role + principal GUC）。 */
async function openPrincipalSession(owner: string) {
  const c = await admin.connect();
  await c.query('BEGIN');
  await c.query('SET LOCAL ROLE app_role');
  await c.query("SELECT set_config('app.principal_user', $1, true)", [owner]);
  return c;
}

async function main(): Promise<void> {
  await assertIsolatedTestTarget(admin);
  await provisionRuntimeLogin(admin, { roleName: role, password: `${role}-pw` });
  runtime = createPool({
    host: process.env.PGHOST, port: Number(process.env.PGPORT), database: process.env.PGDATABASE,
    user: role, password: `${role}-pw`, sslMode: 'disable',
  });

  // ── B1 · replay-returns-existing ──
  section('B1 · 同 event_key 二次 append → 同 seq 返回 · 行数零增（:23-:26 先查 / :37-:40 复读）');
  {
    const { owner, id } = await shellFixture('b1');
    const key = 'answer_unscored:q-b1';
    const seq1 = await asPrincipal(runtime, owner, (c) => appendEvent(c, owner, id, 'answer_unscored', { questionId: 'q-b1', turn: 1 }, key));
    const afterFirst = await rowsOf(owner, id, key);
    A('B1 首次 append 恰一行（seq 分配）', afterFirst.length === 1 && afterFirst[0]!.seq === seq1);
    const seq2 = await asPrincipal(runtime, owner, (c) => appendEvent(c, owner, id, 'answer_unscored', { questionId: 'q-b1', turn: 1, note: '二次同键（不同载荷）' }, key));
    const afterSecond = await rowsOf(owner, id, key);
    A('B1 replay 返回既有 seq（seq2===seq1 · 零新事件）', seq2 === seq1 && afterSecond.length === 1);
    A('B1 payload 不被覆写（首写载荷原样 · 零 upsert 语义）', JSON.stringify(afterSecond[0]!.payload).includes('"turn":1') && !JSON.stringify(afterSecond[0]!.payload).includes('二次同键'));
    E('B1-ROWS', afterSecond);
    A('B1 replay 不区分载荷全等（arbiter 仅键域仲裁 · :23-:26 先查）', seq2 === seq1);
  }

  // ── B2 · 并发竞态收敛恰 1 行（双 pool client 双会话 · Ban 同事务自串行）──
  section('B2a · 双会话同键真并发 → advisory 锁串行 + 复读收敛同 seq（:22/:23-:26）');
  {
    const { owner, id } = await shellFixture('b2a');
    const key = 'answer_unscored:q-b2a';
    const ca = await openPrincipalSession(owner);
    const cb = await openPrincipalSession(owner);
    let seqA: number | undefined;
    let seqB: number | undefined;
    let bErr: unknown;
    try {
      // 会话 A 先行：持 advisory xact 锁完成 INSERT（事务不提交）→ 会话 B 同键 append 在 :22 阻塞 →
      // A 提交后 B 的先查（read committed 语句级新快照）读回 A 行 → 同 seq 返回。
      // 开窗纪律：双会话事务窗全程 ≤ 数百 ms（idle-in-transaction 超时下不留长开事务），commit 即放。
      seqA = await appendEvent(ca, owner, id, 'answer_unscored', { questionId: 'q-b2a', w: 'A' }, key);
      const pB = appendEvent(cb, owner, id, 'answer_unscored', { questionId: 'q-b2a', w: 'B' }, key)
        .then((sv) => { seqB = sv; })
        .catch((e) => { bErr = e; });
      await sleep(80);             // B 已在 advisory 锁上排队（A 未提交）
      await ca.query('COMMIT');    // A 提交 → B 获锁 → 先查读回 A 行
      await pB;
      await cb.query('COMMIT').catch(() => undefined);
    } finally { ca.release(); cb.release(); }
    {
      A('B2a 双会话收敛同 seq（replay-returns-existing 跨会话成立）', seqB !== undefined && seqB === seqA);
      const rows = await rowsOf(owner, id, key);
      A('B2a 恰 1 行（双会话双 INSERT 意图 → 单行落地）', rows.length === 1 && rows[0]!.seq === seqA);
      A('B2a 无会话异常（B 零 23505 零 throw · 收敛走先查臂）', bErr === undefined);
      E('B2a-ROWS', rows);
    }
  }

  section('B2b · 无锁直写会话 × 仓储会话交错 → ON CONFLICT(:32)+复读(:37-:40) 收敛恰 1 行');
  {
    const { owner, id } = await shellFixture('b2b');
    const key = 'answer_unscored:q-b2b';
    // 豁免②B2b（具名入收据）：对抗写手=无 advisory 锁直 INSERT（B4 同形）——先查盲区（未提交不可见）
    // 下的真竞态形状，ON CONFLICT DO NOTHING+复读的防御对象。
    const cw = await openPrincipalSession(owner);
    const cr = await openPrincipalSession(owner);
    let repoSeq: number | undefined;
    try {
      await cw.query(
        `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload,event_key)
         SELECT $1,$2,COALESCE(MAX(seq),0)+1,'answer_unscored',$3::jsonb,$4 FROM interview_event WHERE stream_key=$2`,
        [owner, id, JSON.stringify({ questionId: 'q-b2b', w: 'direct' }), key]);
      // 直写未提交：仓储会话先查不可见 → INSERT…SELECT MAX+1 同 seq → 阻塞于唯一索引条目。
      const pRepo = appendEvent(cr, owner, id, 'answer_unscored', { questionId: 'q-b2b', w: 'repo' }, key)
        .then((sv) => { repoSeq = sv; });
      await sleep(80);                  // 仓储 INSERT 已在索引条目上等待直写事务
      await cw.query('COMMIT');         // 直写提交 → 仓储侧唯一冲突 → DO NOTHING → 复读收敛
      await pRepo;
      await cr.query('COMMIT').catch(() => undefined);
    } finally { cw.release(); cr.release(); }
    {
      const rows = await rowsOf(owner, id, key);
      const direct = rows.find((r) => (r.payload?.w ?? '') === 'direct');
      A('B2b 收敛同 seq（复读返回直写行 seq · :37-:40）', repoSeq !== undefined && direct !== undefined && direct.seq === repoSeq);
      A('B2b 恰 1 行（真竞态双写意图 → 单行 · :32 ON CONFLICT 底闸）', rows.length === 1);
      E('B2b-ROW', rows[0]);
    }
  }

  // ── B3 · 键域边界（kind 前缀键域零碰撞）──
  section('B3 · answer_unscored:Q 与 answer_evaluated:Q 同流共存零碰撞（:84-:86 键域注记同构）');
  {
    const { owner, id } = await shellFixture('b3');
    const q = 'q-b3';
    const sUnscored = await asPrincipal(runtime, owner, (c) => appendEvent(c, owner, id, 'answer_unscored', { questionId: q, side: 'unscored' }, `answer_unscored:${q}`));
    const sEvaluated = await asPrincipal(runtime, owner, (c) => appendEvent(c, owner, id, 'answer_evaluated', { questionId: q, side: 'evaluated' }, `answer_evaluated:${q}`));
    A('B3 两前缀键共存: 各自分配 seq（零碰撞 · 零互吞）', sUnscored !== sEvaluated);
    const rows = await rowsOf(owner, id);
    A('B3 恰 2 行（kind 前缀=键域边界 · spec 幂等键去前缀即碰撞的产品闸语义 · D2）',
      rows.length === 2 && rows.map((r) => r.event_key).sort().join(',') === `answer_evaluated:${q},answer_unscored:${q}`);
    const sReplay = await asPrincipal(runtime, owner, (c) => appendEvent(c, owner, id, 'answer_unscored', { questionId: q, side: 'unscored-replay' }, `answer_unscored:${q}`));
    A('B3 同前缀 replay 归位自身 seq（不吞异前缀行）', sReplay === sUnscored && (await rowsOf(owner, id)).length === 2);
    E('B3-ROWS', rows);
  }

  // ── B4 · 唯一底闸（直 INSERT 同键 → errcode-only 23505）──
  section('B4 · 绕仓储直 INSERT 同键 → 23505（0021:3 partial unique 底闸 · errcode-only 口径）');
  {
    const { owner, id } = await shellFixture('b4');
    const key = 'answer_unscored:q-b4';
    const seq = await asPrincipal(runtime, owner, (c) => appendEvent(c, owner, id, 'answer_unscored', { questionId: 'q-b4' }, key));
    A('B4 产品原语先写恰一行', (await rowsOf(owner, id, key)).length === 1);
    // 豁免②B4（具名入收据）：对抗直 INSERT=REQUEST 具名约束级行使（唯一底闸对象）。
    // 会话=app_role+GUC 就位（0195 仅 REVOKE UPDATE · INSERT 授权在 · 防 42501 假因红）。
    let caught: unknown;
    try {
      await asPrincipal(runtime, owner, (c) => c.query(
        `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload,event_key)
         SELECT $1,$2,COALESCE(MAX(seq),0)+1,'answer_unscored',$3::jsonb,$4 FROM interview_event WHERE stream_key=$2`,
        [owner, id, JSON.stringify({ questionId: 'q-b4', w: 'bypass' }), key]));
    } catch (e) { caught = e; }
    A('B4 底闸拒绝（抛错在场）', caught !== undefined);
    // 断言口径=errcode-only 23505（REQUEST Ban 约束名字面断言——0027 表级约束已于 0149:77 删除，
    // HEAD 唯一底闸=0021 partial unique index；底闸实现可演进，唯一稳定口径=SQLSTATE）。
    A('B4 errcode-only: SQLSTATE=23505（unique_violation · 不锚约束名）', errCode(caught) === '23505');
    A('B4 直写零落地（语句级原子 · 仍恰 1 行 · 零部分写）',
      (await rowsOf(owner, id, key)).length === 1 && (await rowsOf(owner, id, key))[0]!.seq === seq);
    A('B4 非其他错误类（非 42501 权限假因 · 非 23514 触发器类）', errCode(caught) !== '42501' && errCode(caught) !== '23514');
    E('B4-ERRCODE', { code: errCode(caught) });
  }

  // ── 全案完整性 ──
  section('INTEGRITY · 全案流账本总账（各行数恰为臂内意图 · 零越臂写入）');
  {
    for (const [tag, want] of [['b1', 1], ['b2a', 1], ['b2b', 1], ['b3', 2], ['b4', 1]] as const) {
      const n = (await rowsOf(OWN(tag), IID(tag))).length;
      A(`INTEGRITY ${tag}: 行数=${want}`, n === want);
    }
    A('INTEGRITY 零模型调用面（本 case 纯原语级 · 无 ai_model_invocation 残留）',
      Number((await admin.query('SELECT count(*)::int n FROM ai_model_invocation WHERE owner_user_id LIKE $1', [`${'uc012b-'}%`])).rows[0].n) === 0);
  }

  console.log(`\n${failures === 0
    ? `✓ NHP-012-BOUND-01 全臂绿（${total}/${total}）· EXIT=0 = 具名 case 真证据 ≠ covered`
    : `✗ ${failures}/${total} NHP-012-BOUND-01 断言失败`}`);
  console.log('PIN: BOUND cell gap→case-only · EXIT0≠covered · §1.0.1 :118 措辞零翻动 · coveredCount=8');
  console.log('PIN: B4 断言口径=errcode-only 23505（Ban 约束名字面 · 0021 唯一底闸 · 0027/0149 勘误承登）');
  console.log('PIN: B2=双 pool client 双会话真并发（Ban 同事务自串行冒充）· B3=kind 前缀键域（D2 披露）');
  console.log('PIN: haStatus=NOT_HA · releaseEvidence=false · alone≠dual · ⛔push');
  await runtime.end();
  await admin.end();
  process.exit(failures ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error('✗', (e as Error)?.message ?? e);
  process.exit(1);
});
