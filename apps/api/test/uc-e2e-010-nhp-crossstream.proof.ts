/**
 * uc-e2e-010-nhp-crossstream.proof.ts — NHP-010-ADV-02 · 同主体多流交叉隔离 prove
 * (SSE-ADV 残余面·覆盖矩阵 §1.0.1 `:116` UC-E2E-010 ADV 格残余·REQUEST=ai-docs/delivery/harness/sse-adv-REQUEST.md)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - sse-adv-REQUEST.md §1.4：NHP-010-ADV-02 四族臂 B1–B4（同主体双流×对抗游标交换×双持实时注入·
 *    期望=零跨流帧交付+账本零写副作用）；残余盘点②：全树无任何 HTTP 级双流帧交付隔离断言
 *    （批 B A5 全臂在他人 principal 的 404 拒绝路径·本刀全臂在 200 路径内断言帧隔离·两臂面正交）。
 *  - 机制面（真实代码·锚 @本支 merge tip `a0b5893f4`（origin/main `e072e957f` 并线）亲证——
 *    缝 blob 对起草基线 `0246361dd` 逐字节零漂：interview.service.ts=a8ae0d15·controller=d10db4ae·
 *    sse-pump=b93121dc·last-event-id=40b12d01·0062=9e5dec05·0143=4d4bf7c4）：
 *    interview.service.ts:910-917 events()——:911 parseLastEventId 先于 privacy·:912 asPrincipal RLS 上下文·
 *      :913 guardInterviewPrivacy·:914 SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND
 *      seq>$2 ORDER BY seq（游标裸数字无流绑定·流隔离全托 stream_key=$1 单谓词）。
 *    interview.controller.ts:257-279 GET :id/events——:261-262 per-principal 槽 5（429 too_many_streams·
 *      计数面已证 sse-principal-slot·本刀零重复只引旁证）·:264-265 initial null→404·:273 fetchMore(lastSeq)
 *      每轮重调 events() 重过 guard·:276 deltaSource=subscribeToken(id)（订阅键=流键）。
 *    sse-pump.ts:169/:191 notify.waitFor(o.streamKey) per-streamKey waiter·:130 权威帧 id: ${e.seq}·
 *      :165 token_delta 无 id 帧（光标防毒）·:64/:73 per-streamKey delta 环形缓冲（广播复制·禁互偷帧）。
 *    last-event-id.ts:8-18 双门 fail-closed（批 B A1/A2 已证·本刀零臂零重复）。
 *    0062_interview_privacy_event_stream_scope.sql:59-62 p_owner policy——**harness 未载 0062**（G-GAP pin）。
 *    0214_interview_event_statement_notify.sql:22-27 语句级触发器（已取代 0143 逐行活机制·0143 字节不改仅历史）
 *      ——**harness 未载·B3 自装并字节版本钉明**（见下）。
 *
 * P2×5 执行锚全履行（r2 席2 pre-exec 双审 P2 单逐条落码轨迹）：
 *  - P2① B4 措辞勘误「双流三形」：userB 对照=双流（S1/S2）×三形（合法游标/伪造高游标/无游标）·
 *    非REQUEST 草面「三流」误读·A5 同值复证一行分界锚·非重复臂。
 *  - P2② B2 kind/payload 值域互斥种子：逐流独立 marker（s1_* vs s2_* kind 前缀+s1-seed-N/s2-seed-N
 *    marker）+流标签 payload（"stream":"S1"/"S2"）——seq 值跨流重叠（两流各有 2,3）不可作判别面·
 *    kind/marker/流标签值域互斥方使「零跨流帧字节」可判定。
 *  - P2③ B3 token_delta 零出现子断言配主动注入：S1 hold 中主动注入 S2 权威行（INSERT 触发器）
 *    +S2 token 帧（pg_notify interview_token_ch 直发）双动作·并配 S2 自身交付对照（S2 连接收到
 *    所注入行+token 帧=注入非空转）·在此前提下断言 S1 连接 token_delta 零出现。
 *  - P2④ egress 二择一=**避词面路**：本文件零 provider 词面（boot() 内剥 provider key·
 *    _neg-harness 已登记两键不动）→provider-egress-inventory.json 零新登记·DASHSCOPE_* 族词面
 *    同样零出现·双登记路不触发（REQUEST §1.4 egress 预置条款第一形）。
 *  - P2⑤ GAP-pin 承登：harness 隐私镜像=sql owner-match stub（_neg-harness interview_privacy_active
 *    镜像）**≠ 0062 interview_event_stream_privacy_active 域查 RLS ≠ fence covered**——0062 RLS/围栏
 *    410 面归真迁移链主证（privacy-erasure-http.proof.ts:415/:427-432）·本 prove 只证 200 路径内
 *    跨流帧隔离·Ban 借本收据宣 fence covered。
 *
 * Fixture：_neg-harness boot()（sql/ 链+privacy 最小镜像·沿批 B uc010-nhp-adv 同壳）。同主体 userA
 * 持双流 S1=IV_SSE_X_S1（seq 1..3·maxSeq=3）+S2=IV_SSE_X_S2（seq 1..5·maxSeq=5）·S1/S2 分语句种子
 * （0214 语句级触发器语义下单条多行 INSERT 触单键 notify·本刀 B3 注入恒单流单语句）·userB 零权限。
 * B1 夹具保证：S1.maxSeq=3 < S2 游标 5（高游标空集·`3>5`=false）。
 * 隔离壳 run-e2e-isolated 三层（uc010:nhp-crossstream:prove → :raw → prove:uc010-nhp-crossstream）·
 * 零 live 模型·est live=0。EXIT 契约：EXIT 0 ⇔ B1-B4 全绿；任一红 → EXIT 1 诚实保留（attempts 台账·
 * Ban retry-to-green）。EXIT0 = case 证据 ≠ covered ≠ 翻行；`:116` 格 blind 保持+case-only additive
 * 注记·coveredCount=8 不动。
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { boot, mkAssert } from './_neg-harness';

const CMD = 'pnpm uc010:nhp-crossstream:prove';
const S1 = 'IV_SSE_X_S1';
const S2 = 'IV_SSE_X_S2';
const TOKEN_CHANNEL = 'interview_token_ch';

const h = await boot();
const { A, done } = mkAssert('uc010:nhp-crossstream');

console.log('NHP-010-ADV-02 同主体多流交叉隔离 prove · releaseEvidence=false · Not HA');
console.log(`CMD=${CMD}`);
console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · :116 格 blind 保持+case-only additive 注记 · Ban retry-to-green');
console.log('NOTE: egress=P2④ 避词面路（零 provider 词面→零新登记）· est live=0');

// ── Fixture:双流分语句种子（P2② 值域互斥）+各一张 userA interview 行 ──────────
await h.pool.query(
  `INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active'),($2,'userA','active')
   ON CONFLICT (id) DO UPDATE SET status='active', owner_user_id='userA'`,
  [S1, S2],
);
await h.pool.query('DELETE FROM interview_event WHERE stream_key IN ($1,$2)', [S1, S2]);
await h.pool.query(
  `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
    ('userA',$1,1,'s1_question_ready','{"stream":"S1","marker":"s1-seed-1","q":1}'),
    ('userA',$1,2,'s1_progress','{"stream":"S1","marker":"s1-seed-2","q":1,"pct":30}'),
    ('userA',$1,3,'s1_waiting_user','{"stream":"S1","marker":"s1-seed-3","q":1}')`,
  [S1],
);
await h.pool.query(
  `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
    ('userA',$1,1,'s2_question_ready','{"stream":"S2","marker":"s2-seed-1","q":1}'),
    ('userA',$1,2,'s2_progress','{"stream":"S2","marker":"s2-seed-2","q":1,"pct":25}'),
    ('userA',$1,3,'s2_waiting_user','{"stream":"S2","marker":"s2-seed-3","q":1}'),
    ('userA',$1,4,'s2_progress','{"stream":"S2","marker":"s2-seed-4","q":1,"pct":50}'),
    ('userA',$1,5,'s2_waiting_user','{"stream":"S2","marker":"s2-seed-5","q":1}')`,
  [S2],
);

interface Frame { id: number; kind: string; data: string }
const parseFrames = (buf: string): Frame[] =>
  [...buf.matchAll(/^id: (\d+)\nevent: ([^\n]+)\ndata: ([^\n]+)\n$/gm)].map((m) => ({ id: Number(m[1]), kind: m[2] ?? '', data: m[3] ?? '' }));
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** SSE 双持探针:LED 经 header（led=undefined 则无游标）;holdMs 窗口后 abort;返回 status+buf+frames。 */
async function holdStream(opts: { stream: string; led?: string; uid?: string; holdMs: number }): Promise<{
  status: number; buf: string; frames: Frame[]; sawPing: boolean;
}> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts.holdMs);
  let status = 0;
  let buf = '';
  try {
    const headers: Record<string, string> = { ...(opts.uid ? h.U(opts.uid) : h.U('userA')) };
    if (opts.led !== undefined) headers['last-event-id'] = opts.led;
    const res = await fetch(`${h.base}/interview/${opts.stream}/events`, { headers, signal: ac.signal });
    status = res.status;
    if (status === 200 && res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      try {
        for (;;) {
          const { done: d, value } = await reader.read();
          if (d) break;
          buf += dec.decode(value, { stream: true });
        }
      } finally { try { reader.releaseLock(); } catch { /* aborted */ } }
    } else if (res.body) {
      buf = await res.text().catch(() => '');
    }
  } catch { /* abort=hold 断流预期 */ }
  finally { clearTimeout(timer); }
  return { status, buf, frames: parseFrames(buf), sawPing: buf.includes(': ping') };
}

/** 账本快照（B4:双流逐行 JSON·append-only 对照基面）。 */
const ledgerRows = async (stream: string): Promise<string[]> =>
  (await h.pool.query(
    'SELECT seq, kind, payload::text, owner_user_id FROM interview_event WHERE stream_key=$1 ORDER BY seq', [stream],
  )).rows.map((r: Record<string, unknown>) => JSON.stringify(r));
const snapshotS1 = await ledgerRows(S1);
const snapshotS2 = await ledgerRows(S2);

// ══ B1 · 跨流高游标（skip-not-error 跨流变体）═════════════════════════════════
// userA 携 S2 游标 5 订 S1（S1.maxSeq=3<5 夹具保证）→ `seq>$2` 空集 → 200+空 catch-up+hold ping
// 非 4xx/5xx（service :914 谓词·A4/R4 语义同构跨流变体）+零帧零 id: 行。
{
  console.log('\n──────── B1 · 跨流高游标 skip-not-error（S2 游标 5 施于 S1）────────');
  const r = await holdStream({ stream: S1, led: '5', holdMs: 2800 });
  A('B1 携 S2 游标 5 订 S1 → 200（非 4xx 非 5xx·跨流高游标不判非法不拒连）', r.status === 200);
  A('B1 空 catch-up: 零 id: 帧（S1.maxSeq=3<5 空集·不重放本流亦不杜撰他流）', r.frames.length === 0 && !/\nid: /m.test(r.buf));
  A('B1 hold ping 在证（skip-not-error·空集非错误·进 SSE hold tail）', r.sawPing);
  A('B1 全窗零 event 帧（S1/S2 种子字节均零出现·空 catch-up 纯净）',
    !r.buf.includes('event: ') && !r.buf.includes('s1-seed') && !r.buf.includes('s2-seed'));
}

// ══ B2 · 跨流低游标（核心隔离断言·P2② 值域互斥种子）══════════════════════════
// userA 携 S1 游标 1 订 S2 → 200+恰 S2 seq=[2,3,4,5]·kinds/payload 逐帧=S2 种子·零 S1 域字节。
{
  console.log('\n──────── B2 · 跨流低游标零跨流帧（S1 游标 1 施于 S2）────────');
  const exercise = (): Promise<{ status: number; frames: Frame[]; buf: string }> => holdStream({ stream: S2, led: '1', holdMs: 1400 });
  const r = await exercise();
  const expected: Array<{ id: number; kind: string; marker: string }> = [
    { id: 2, kind: 's2_progress', marker: 's2-seed-2' },
    { id: 3, kind: 's2_waiting_user', marker: 's2-seed-3' },
    { id: 4, kind: 's2_progress', marker: 's2-seed-4' },
    { id: 5, kind: 's2_waiting_user', marker: 's2-seed-5' },
  ];
  A('B2 携 S1 游标 1 订 S2 → 200+恰 seq=[2,3,4,5]（不丢不重·跨流变体 :914 stream_key=$1 单谓词）',
    r.status === 200 && r.frames.map((f) => f.id).join(',') === '2,3,4,5');
  const byteExact = r.frames.length === 4 && r.frames.every((f, i) => {
    const exp = expected[i];
    if (!exp) return false;
    const p = JSON.parse(f.data) as { stream?: string; marker?: string };
    return f.kind === exp.kind && p.stream === 'S2' && p.marker === exp.marker;
  });
  A('B2 逐帧 kind/payload=S2 种子（流标签 stream=S2+独立 marker 逐帧核·非仅 seq 面）', byteExact);
  A('B2 零 S1 域帧字节（kind s1_ 前缀/marker s1-seed/流标签 "S1" 全族零出现·seq 2,3 跨流同值不可判别·值域互斥判别面兑现）',
    !r.buf.includes('s1_') && !r.buf.includes('s1-seed') && !r.buf.includes('"stream":"S1"'));
  const r2 = await exercise();
  A('B2 重复行使恒定窗（两次帧集逐字节恒定·uc002 V3 同构跨流版）',
    JSON.stringify(r.frames) === JSON.stringify(r2.frames));
}

// ══ B3 · 双持实时跨流注入零互偷（自装 notify 触发器字节版本钉明·P2③）═══════════
// harness 未载 0214（触发器缺席→service establish 期 trigger_missing 降级·2s 轮询形态）。
// 本臂自装 0214 语句级触发器（读迁移文件字节原文执行·sha256 字节版本钉明）→ LISTEN+trigger
// 双条件成立=生产 posture（per-streamKey waiter sse-pump :169/:191·健康兜底 30s+notify 精确醒）。
{
  console.log('\n──────── B3 · 双持实时跨流注入零互偷（自装 0214 触发器·字节版本钉明）────────');
  const migPath = fileURLToPath(new URL('../../../packages/db/migrations/0214_interview_event_statement_notify.sql', import.meta.url));
  const migBytes = readFileSync(migPath);
  const migSha = createHash('sha256').update(migBytes).digest('hex');
  await h.pool.query(migBytes.toString('utf8'));
  const trig = await h.pool.query(
    `SELECT 1 FROM pg_trigger WHERE tgname='interview_event_sse_notify' AND tgrelid='interview_event'::regclass`);
  A('B3 自装 0214 语句级触发器在证（pg_trigger 实证·非纸面安装）', (trig.rowCount ?? 0) === 1);
  console.log(`PIN   B3 notify trigger self-install file=0214_interview_event_statement_notify.sql bytes=${migBytes.length} sha256=${migSha.slice(0, 16)} (0143 字节不改仅历史·0214 取代)`);

  // 重连窗:service 单例 establish 退避上界 5s→等 6s 保 LISTEN+trigger 双条件翻面（token 通道随
  // 同连接第二 LISTEN 建立·token 帧交付对照即通道活体证）。
  await sleep(6000);
  const tokenNotify = (stream: string, attempt: string, seq: number, text: string): Promise<unknown> =>
    h.pool.query('SELECT pg_notify($1, $2)', [TOKEN_CHANNEL, JSON.stringify({ v: 1, streamKey: stream, attemptKey: attempt, seq, text })]);

  // 方向一:S1+S2 双持·S1 hold 中向 S2 注入权威行 seq=[6,7]（单条多行 INSERT=单语句→语句级触发器
  // DISTINCT stream_key 恰一 pg_notify(S2)）+S2 token 帧两条（P2③ 主动注入动作）·并向 S1 注入本流
  // 自身行 seq=4（窗内冲刷响应头——Node 头随首字节延迟发送·健康通道 30s 兜底前空闲连接无字节可读；
  // S1 线带本流帧非空窗=隔离断言非空转假绿）·断言 S1 线帧集恒不出本流自身注入外任何 S2 域字节。
  {
    const pS1 = holdStream({ stream: S1, led: '3', holdMs: 3600 });
    const pS2 = holdStream({ stream: S2, led: '5', holdMs: 3600 });
    await sleep(700); // 双连接建立+catch-up 完成
    await h.pool.query(
      `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
       ('userA',$1,6,'s2_progress','{"stream":"S2","marker":"s2-live-6","live":true}'),
       ('userA',$1,7,'s2_waiting_user','{"stream":"S2","marker":"s2-live-7","live":true}')`, [S2]);
    await sleep(150);
    await tokenNotify(S2, 'att-s2-live', 6, 's2-token-a');
    await sleep(150);
    await tokenNotify(S2, 'att-s2-live', 6, 's2-token-b');
    await sleep(150);
    await h.pool.query(
      `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload)
       VALUES ('userA',$1,4,'s1_progress','{"stream":"S1","marker":"s1-live-4","keepalive":true}')`, [S1]);
    const r1 = await pS1;
    const r2 = await pS2;
    if (!(r1.status === 200 && r1.frames.map((f) => f.id).join(',') === '4')) {
      console.log(`DEBUG B3-d1-S1 status=${r1.status} frames=${JSON.stringify(r1.frames)} buf=${JSON.stringify(r1.buf.slice(0, 400))}`);
    }
    if (!(r2.status === 200 && r2.frames.map((f) => f.id).join(',') === '6,7')) {
      console.log(`DEBUG B3-d1-S2 status=${r2.status} frames=${JSON.stringify(r2.frames)} buf=${JSON.stringify(r2.buf.slice(0, 400))}`);
    }
    A('B3 对照:S2 连接收到注入权威行 seq=[6,7]（单语句双行·注入非空转·hold-and-tail 在证）',
      r2.status === 200 && r2.frames.map((f) => f.id).join(',') === '6,7' && r2.frames[0]?.kind === 's2_progress');
    const tok2 = (r2.buf.match(/^event: token_delta$/gm) ?? []).length;
    A('B3 对照:S2 连接收到两条注入 token_delta（s2-token-a/b·LISTEN+trigger 通道活体证）',
      tok2 === 2 && r2.buf.includes('s2-token-a') && r2.buf.includes('s2-token-b'));
    A('B3 隔离:S1 连接帧集=本流自身注入 seq=[4] 且全窗零 S2 域帧字节（S2 行注入+token 注入全程·kind s2_/marker s2-live/流标签 "S2" 零出现·本流帧在证=线活非空窗·per-streamKey waiter :169/:191+stream_key=$1 谓词链）',
      r1.status === 200 && r1.frames.map((f) => f.id).join(',') === '4' && r1.frames[0]?.kind === 's1_progress'
        && !r1.buf.includes('s2_progress') && !r1.buf.includes('s2-live') && !r1.buf.includes('"stream":"S2"'));
    A('B3 隔离(P2③):S1 连接 token_delta 零出现（配对主动注入 S2 双 token 帧动作+S1 线本流帧非空窗·零互偷非假绿·delta 环 :64/:73 订阅键=流键）',
      (r1.buf.match(/^event: token_delta$/gm) ?? []).length === 0 && !r1.buf.includes('s2-token'));
  }
  // 方向二:对称反向（S1 注入 seq=5+S1 token 帧两条·并向 S2 注入本流自身行 seq=8 冲刷响应头·
  // 断言 S2 线帧集=本流自身注入 seq=[8] 且零 S1 域帧字节+token_delta 零出现）。
  {
    const pS1 = holdStream({ stream: S1, led: '4', holdMs: 3600 });
    const pS2 = holdStream({ stream: S2, led: '7', holdMs: 3600 });
    await sleep(700);
    await h.pool.query(
      `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload)
       VALUES ('userA',$1,5,'s1_progress','{"stream":"S1","marker":"s1-live-5","live":true}')`, [S1]);
    await sleep(150);
    await tokenNotify(S1, 'att-s1-live', 5, 's1-token-a');
    await sleep(150);
    await tokenNotify(S1, 'att-s1-live', 5, 's1-token-b');
    await sleep(150);
    await h.pool.query(
      `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload)
       VALUES ('userA',$1,8,'s2_waiting_user','{"stream":"S2","marker":"s2-live-8","keepalive":true}')`, [S2]);
    const r1 = await pS1;
    const r2 = await pS2;
    if (!(r1.status === 200 && r1.frames.map((f) => f.id).join(',') === '5')) {
      console.log(`DEBUG B3-d2-S1 status=${r1.status} frames=${JSON.stringify(r1.frames)} buf=${JSON.stringify(r1.buf.slice(0, 400))}`);
    }
    if (!(r2.status === 200 && r2.frames.map((f) => f.id).join(',') === '8')) {
      console.log(`DEBUG B3-d2-S2 status=${r2.status} frames=${JSON.stringify(r2.frames)} buf=${JSON.stringify(r2.buf.slice(0, 400))}`);
    }
    A('B3 对称对照:S1 连接收到注入权威行 seq=5+两条 token_delta（s1-token-a/b·反向注入非空转）',
      r1.status === 200 && r1.frames.map((f) => f.id).join(',') === '5'
        && (r1.buf.match(/^event: token_delta$/gm) ?? []).length === 2
        && r1.buf.includes('s1-token-a') && r1.buf.includes('s1-token-b'));
    A('B3 对称隔离:S2 连接帧集=本流自身注入 seq=[8] 且全窗零 S1 域帧字节（kind s1_/marker s1-live/流标签 "S1" 零出现·本流帧在证=线活非空窗·对称断言）',
      r2.status === 200 && r2.frames.map((f) => f.id).join(',') === '8' && r2.frames[0]?.kind === 's2_waiting_user'
        && !r2.buf.includes('s1_progress') && !r2.buf.includes('s1-live') && !r2.buf.includes('"stream":"S1"'));
    A('B3 对称隔离(P2③):S2 连接 token_delta 零出现（配对主动注入 S1 双 token 帧动作+S2 线本流帧非空窗·对称零互偷）',
      (r2.buf.match(/^event: token_delta$/gm) ?? []).length === 0 && !r2.buf.includes('s1-token'));
  }
}

// ══ B4 · 账本零写副作用+确定性（P2① 措辞:双流三形）═══════════════════════════
{
  console.log('\n──────── B4 · 账本零写副作用+确定性（双流三形对照锚）────────');
  // 账本 appended-exactly:终态=初态 ∪ B3 注入行（S1+2 行 seq=4,5·S2+3 行 seq=6,7,8）·既存行逐字节零变异。
  const finalS1 = await ledgerRows(S1);
  const finalS2 = await ledgerRows(S2);
  A('B4 双流账本 appended-exactly: 既存行（S1×3/S2×5）逐字节恒等零变异零删（events 面纯 SELECT·:914 唯一语句）',
    finalS1.length === snapshotS1.length + 2 && finalS2.length === snapshotS2.length + 3
      && snapshotS1.every((row, i) => finalS1[i] === row)
      && snapshotS2.every((row, i) => finalS2[i] === row));
  const lastS1 = JSON.parse(finalS1[finalS1.length - 1] ?? '') as { seq: string; kind: string; payload: string };
  const [tailA, tailB, tailC] = finalS2.slice(-3).map((row) => JSON.parse(row) as { seq: string; kind: string });
  A('B4 恰增 B3 注入行: S1+seq4,5(s1_progress)/S2+seq6,7,8(s2_progress/s2_waiting_user×2) 外零多余行（注入即声明行·零隐式写副作用）',
    Number(lastS1.seq) === 5 && lastS1.kind === 's1_progress'
      && Number(tailA?.seq) === 6 && tailA?.kind === 's2_progress'
      && Number(tailB?.seq) === 7 && tailB?.kind === 's2_waiting_user'
      && Number(tailC?.seq) === 8 && tailC?.kind === 's2_waiting_user');
  // P2① 双流三形:userB 对照=双流（S1/S2）×三形（合法游标 1/伪造高游标 999999/无游标）→ 恒 404 零泄出
  // （A5 同值复证一行分界锚·非重复臂——批 B A5 单流·本锚双流展开）。
  const probes: Array<{ s: string; led?: string }> = [];
  for (const s of [S1, S2]) for (const led of ['1', '999999', undefined]) probes.push({ s, led });
  const results: Array<{ status: number; frames: Frame[]; buf: string }> = [];
  for (const p of probes) results.push(await holdStream({ stream: p.s, led: p.led, uid: 'userB', holdMs: 900 }));
  A('B4 双流三形: userB×(S1,S2)×(合法游标/伪造高游标/无游标) 六探恒 404（privacy 先于游标语义·分界对照锚）',
    results.every((r) => r.status === 404));
  A('B4 双流三形零泄出: 六探均零事件帧（404 body 无账本内容·双流账本字节零出流）',
    results.every((r) => r.frames.length === 0 && !r.buf.includes('-seed')));
}

// ── G-GAP · honesty pins（P2⑤·EXIT=0 仅=诚实钉 ≠ covered）──────────────────
{
  const gaps = [
    'GAP-pin: harness RLS=sql 镜像 owner-match stub（interview_privacy_active 镜像）≠ 0062 interview_event_stream_privacy_active 域查 RLS ≠ fence covered——0062/围栏 410 面归真迁移链主证 privacy-erasure-http·本 prove 只证 200 路径内跨流帧隔离',
    'GAP-pin: 0214 触发器系本 harness 自装镜像（boot() 夹具非迁移·字节 sha256 钉明）·跨副本/多进程 LISTEN 面不可证（GAP-UC010-CROSS-REPLICA 沿承·本进程内壳）',
    'GAP-pin: EXIT0=case 证据≠covered≠翻行——:116 格 blind 保持+case-only additive 注记·coveredCount=8 零翻转·covered 翻面权归协调方',
  ];
  for (const g of gaps) console.log(`PIN   ${g}`);
  A('G-GAP honesty pins printed (P2⑤·EXIT=0≠covered)', gaps.length === 3);
}

console.log('\nNOTE: still ≠covered; matrix :116 格 blind 保持+case-only additive 注记·§1.0.2 :147 blind 保持·Ban 升 covered');
await done();
