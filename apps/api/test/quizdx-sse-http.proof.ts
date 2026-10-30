/**
 * quizdx-sse-http.proof.ts — quiz / diagnosis 逐实体 SSE 流 HTTP 级证明。
 *
 * 八臂一 proof（quiz QD1–QD4 / diagnosis DX1–DX4），真 Nest 栈 + 隔离 PG + 真 HTTP：
 *   QD1/DX1  全量 catch-up 逐实体帧（帧集 id/kind 序 + payload deep-equal + 残留等式/孤儿门）
 *   QD2/DX2  断线窗续写 + Last-Event-ID 续传 + 终态收口（三连）
 *   QD3/DX3  live hold → live-tail → 终态（自装 0214 语句级触发器的 notify 精确唤醒）
 *   QD4/DX4  同一 principal 三线并发（quiz/diagnosis/interview）跨流 key 域隔离 + 跨 owner 404
 *            + token 无订阅零帧（QZ/DX）/ 恰一帧正控（IV）
 *
 * 机制面（真实代码，本 prove 零产品码零迁移零 Key）：
 *   quiz.controller.ts  GET /quiz/:id/events      终态 quiz_ready｜quiz_unavailable｜error
 *   diagnosis.controller.ts GET /diagnosis/:id/events 终态 diagnosis_ready｜diagnosis_unavailable｜error
 *   interview.controller.ts GET /interview/:id/events 终态五 kind + deltaSource=subscribeToken
 *   sse-pump.ts          权威帧 `id: seq\nevent: kind\ndata: json\n\n`；每轮先注册 waiter 再取数；
 *                        token_delta 无 id 旁路帧；空 tail `: ping\n\n`
 *   sse-notify.service.ts 单 LISTEN 通道 + per-streamKey waiter / token 订阅路由
 *   quiz/diagnosis/interview service 单谓词 `stream_key=$1 AND seq>$2`
 *
 * Fixture：boot() → 自装 0214（语句级触发器）→ notify 健康预热 → 清场 12 key → 三表 upsert →
 *   interview_event 逐行种入（owner 逐列写死，八臂 principal 两两互异）→ 夹具自检。
 *   0214-only 世界未重放 0143 的 REVOKE：本 prove 只证触发器行为面，不证授权面。
 *   harness 未载 0062：IV 线只走臂内 principal 的 owner 匹配正臂，不冒充隐私围栏。
 *
 *   pnpm quizdx:sse-http:prove
 *   pnpm -C apps/api prove:quizdx-sse-http   (raw; needs isolated DATABASE_URL)
 *
 * releaseEvidence=false · Not HA · 本绿 = case 证据 ≠ covered ≠ 翻行 ≠ full e2e。
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { getSseNotify, SSE_TOKEN_CHANNEL } from '../src/platform/sse-notify.service.ts';
import { boot, mkAssert } from './_neg-harness';

const CMD = 'pnpm quizdx:sse-http:prove';
const QZ_CATCH = 'QZ_CATCH';
const QZ_LED = 'QZ_LED';
const QZ_LIVE = 'QZ_LIVE';
const QZ_ISO = 'QZ_ISO';
const QZ_ISO_DX = 'QZ_ISO_DX';
const DX_CATCH = 'DX_CATCH';
const DX_LED = 'DX_LED';
const DX_LIVE = 'DX_LIVE';
const DX_ISO = 'DX_ISO';
const DX_ISO_DX = 'DX_ISO_DX';
const IV_ISO = 'IV_ISO';
const IV_ISO_DX = 'IV_ISO_DX';
const ALL_KEYS = [QZ_CATCH, QZ_LED, QZ_LIVE, QZ_ISO, QZ_ISO_DX, DX_CATCH, DX_LED, DX_LIVE, DX_ISO, DX_ISO_DX, IV_ISO, IV_ISO_DX] as const;
const CLOSED_SILENT_MS = 250;
const SILENT_MS = 200;

const h = await boot();
const { A: baseA, done } = mkAssert('quizdx:sse-http');
const reg: string[] = [];
const failedIds: string[] = [];
const A = (id: string, cond: boolean) => {
  reg.push(id);
  if (!cond) failedIds.push(id);
  return baseA(id, cond);
};

console.log('quizdx:sse-http · quiz/diagnosis 逐实体 SSE 流 HTTP prove · releaseEvidence=false · Not HA');
console.log(`CMD=${CMD}`);
console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · quiz_unavailable/diagnosis_unavailable 失败终态不在证面 · 槽/429 面零认领');

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

async function until(cond: () => boolean, timeoutMs: number, stepMs = 25): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (cond()) return true;
    await sleep(stepMs);
  }
  return cond();
}

// ── hardStop：七读数表（含 N/A 行）+ class 行，逐行直写 fd 2 后非零退出 ─────────────
type HardStopCtx = {
  health?: unknown;
  pgTrigger?: unknown;
  gates?: unknown;
  injection?: unknown;
  hold?: unknown;
  waitingCount?: number;
  tokenSubscriberCount?: number;
};
function hardStop(reason: string, cls: 'env' | 'instrument' = 'env', ctx: HardStopCtx = {}): never {
  writeSync(2, `HARDSTOP ${reason}\n`);
  const readings: Array<[string, unknown]> = [
    ['health', ctx.health ?? getSseNotify().health()],
    ['pgTrigger', ctx.pgTrigger],
    ['gates', ctx.gates],
    ['injection', ctx.injection],
    ['hold', ctx.hold],
    ['waitingCount', ctx.waitingCount ?? getSseNotify().waitingCount()],
    ['tokenSubscriberCount', ctx.tokenSubscriberCount ?? getSseNotify().tokenSubscriberCount()],
  ];
  for (const [k, v] of readings) writeSync(2, `HARDSTOP_READING ${k}=${v === undefined ? 'N/A' : JSON.stringify(v)}\n`);
  writeSync(2, `HARDSTOP_CLASS=${cls}\n`);
  process.exit(2);
}

// ── 帧解析 / 剥离 / 残留等式（本 proof 本地实现，禁回灌既有 proof）──────────────────
interface Frame { id: number; kind: string; data: string; raw: string }
type ExpFrame = { id: number; kind: string; payload: unknown };

const parseFrames = (buf: string): Frame[] =>
  [...buf.matchAll(/^id: (\d+)\nevent: ([^\n]+)\ndata: (.+)\n\n/gm)].map((m) => ({
    id: Number(m[1]), kind: m[2] ?? '', data: m[3] ?? '', raw: m[0],
  }));

const AUTH_FRAME = /^id: \d+\nevent: [^\n]+\ndata: [^\n]*\n\n/;
const TOKEN_FRAME = /^event: token_delta\ndata: [^\n]*\n\n/;
const PING_FRAME = /^: ping\n\n/;

/** 从头消费式分词：完整权威帧 / 完整 token 帧 / 完整 ping 帧；只删 token+ping 区间，不消费任何前导字节。 */
function stripNoise(s: string): { stripped: string; cuts: Array<[number, number]> } {
  let i = 0;
  const cuts: Array<[number, number]> = [];
  for (;;) {
    const rest = s.slice(i);
    const auth = AUTH_FRAME.exec(rest);
    if (auth) { i += auth[0].length; continue; }
    const tok = TOKEN_FRAME.exec(rest);
    if (tok) { cuts.push([i, i + tok[0].length]); i += tok[0].length; continue; }
    const ping = PING_FRAME.exec(rest);
    if (ping) { cuts.push([i, i + ping[0].length]); i += ping[0].length; continue; }
    break;
  }
  let stripped = '';
  let cursor = 0;
  for (const [from, to] of cuts) {
    stripped += s.slice(cursor, from);
    cursor = to;
  }
  stripped += s.slice(cursor);
  return { stripped, cuts };
}

/** 余量 = 空 ∪ 完整 `: ping\n\n` 的真前缀 ∪ 完整 token 帧的真前缀。 */
function isNoisePrefix(rem: string): boolean {
  if (rem === '') return true;
  if (': ping\n\n'.startsWith(rem)) return true;
  const head = 'event: token_delta\ndata: ';
  if (head.startsWith(rem)) return true;
  if (rem.startsWith(head)) {
    const tail = rem.slice(head.length);
    if (/^[^\n]*$/.test(tail)) return true;
    if (/^[^\n]*\n$/.test(tail)) return true;
  }
  return false;
}

interface FrameFacets {
  frames: Frame[];
  orderOk: boolean;
  structOk: boolean;
  deepOk: boolean;
}

function checkFrames(snap: string, exp: ExpFrame[]): FrameFacets {
  const frames = parseFrames(snap);
  const orderOk = frames.length === exp.length && frames.every((f, i) => f.id === exp[i]!.id && f.kind === exp[i]!.kind);
  let structOk = frames.length === exp.length;
  let deepOk = frames.length === exp.length;
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i]!;
    const lines = f.raw.split('\n');
    const struct = lines.length === 5
      && lines[0] === `id: ${f.id}`
      && lines[1] === `event: ${f.kind}`
      && (lines[2] ?? '').startsWith('data: ')
      && lines[3] === '' && lines[4] === ''
      && !f.raw.includes('\r');
    if (!struct) structOk = false;
    const e = exp[i];
    if (!e) { deepOk = false; continue; }
    let parsed: unknown;
    try { parsed = JSON.parse(f.data); } catch { parsed = Symbol('unparsable'); }
    if (!isDeepStrictEqual(parsed, e.payload)) deepOk = false;
  }
  return { frames, orderOk, structOk, deepOk };
}

/** 孤儿 id 门：snap 内每个行首 `id: N` 必须被某帧消费；abort 窗允许恰一在飞帧（其后余量不含 `\n\n`）。 */
function orphanGate(stripped: string, frames: Frame[], cut: 'closed' | 'abort'): { ok: boolean; unmatched: number; detail: string } {
  const markers = [...stripped.matchAll(/^id: (\d+)$/gm)].map((m) => ({ id: Number(m[1]), index: m.index ?? 0 }));
  const left = new Map<number, number>();
  for (const f of frames) left.set(f.id, (left.get(f.id) ?? 0) + 1);
  const unmatched: Array<{ id: number; index: number }> = [];
  for (const mk of markers) {
    const available = left.get(mk.id) ?? 0;
    if (available > 0) left.set(mk.id, available - 1);
    else unmatched.push(mk);
  }
  if (unmatched.length === 0) return { ok: true, unmatched: 0, detail: 'none' };
  if (cut === 'closed') return { ok: false, unmatched: unmatched.length, detail: 'closed expects zero orphan id markers' };
  if (unmatched.length >= 2) return { ok: false, unmatched: unmatched.length, detail: 'abort allows at most one in-flight frame' };
  const one = unmatched[0]!;
  const re = new RegExp(`^id: ${one.id}$`, 'm');
  const pos = stripped.search(re);
  if (pos < 0) return { ok: false, unmatched: 1, detail: `orphan id ${one.id} not locatable in stripped` };
  const tail = stripped.slice(pos);
  const ok = !tail.includes('\n\n');
  return { ok, unmatched: 1, detail: `orphan id=${one.id} tailHasBlankLine=${tail.includes('\n\n')}` };
}

/** 帧间零残留：residual 必须是 stripped 的前缀；closed 余量 ∈ 噪声前缀集；abort 另加 4 KiB 上界。 */
function residualGate(stripped: string, residual: string, cut: 'closed' | 'abort'): { ok: boolean; detail: string } {
  const prefixOk = stripped.startsWith(residual);
  const rem = stripped.slice(residual.length);
  if (!prefixOk) return { ok: false, detail: `residual is not a prefix (stripped=${stripped.length}B residual=${residual.length}B)` };
  if (cut === 'closed') {
    const ok = isNoisePrefix(rem);
    return { ok, detail: `closed remainder=${JSON.stringify(rem.slice(0, 80))} noisePrefix=${ok}` };
  }
  const boundOk = stripped.length - residual.length <= 4096;
  const ok = boundOk && isNoisePrefix(rem);
  return { ok, detail: `abort remainder=${JSON.stringify(rem.slice(0, 80))} bound=${stripped.length - residual.length}B prefix=${isNoisePrefix(rem)}` };
}

/** 八臂帧集唯一入口：吃已定格串；三 facet 无条件求值后合成单一布尔。 */
function assertFrameSet(snap: string, exp: ExpFrame[], opts: { cut: 'closed' | 'abort' }): boolean {
  const facets = checkFrames(snap, exp);
  const { stripped } = stripNoise(snap);
  const residual = facets.frames.map((f) => f.raw).join('');
  const orphan = orphanGate(stripped, facets.frames, opts.cut);
  const residualCheck = residualGate(stripped, residual, opts.cut);
  const ok = facets.orderOk && orphan.ok && residualCheck.ok;
  console.log(`FACET set cut=${opts.cut} order=${facets.orderOk} orphan=${orphan.ok} residual=${residualCheck.ok} ids=${facets.frames.map((f) => f.id).join(',')} exp=${exp.map((e) => e.id).join(',')}`);
  if (!orphan.ok) console.log(`FACET-DETAIL orphan ${orphan.detail}`);
  if (!residualCheck.ok) console.log(`FACET-DETAIL residual ${residualCheck.detail}`);
  return ok;
}

const tokCount = (s: string): number => (s.match(/^event: token_delta$/gm) ?? []).length;
const ctOk = (headers: Headers): boolean => (headers.get('content-type') ?? '').includes('text/event-stream');

// ── hold 助手：时间戳 reader（chunks 只作到达时刻旁证，帧边界=协议边界）────────────
interface SseHandle {
  status: number;
  headers: Headers;
  chunks: Array<{ t: number; text: string }>;
  text(): string;
  ids(): number[];
  frames(): Frame[];
  readonly ended: boolean;
  readonly aborted: boolean;
  readonly abortReason: string;
  lastAt(): number;
  abort(reason?: string): Promise<void>;
}

async function openSse(o: { path: string; uid: string; led?: number; maxMs?: number }): Promise<SseHandle> {
  const maxMs = o.maxMs ?? 8000;
  const ac = new AbortController();
  const hardTimer = setTimeout(() => { ac.abort(); }, maxMs);
  const chunks: Array<{ t: number; text: string }> = [];
  let status = 0;
  let headers = new Headers();
  let endedFlag = false;
  let abortedFlag = false;
  let abortReasonFlag = '';
  const text = () => chunks.map((c) => c.text).join('');
  try {
    const reqHeaders: Record<string, string> = { ...h.U(o.uid) };
    if (o.led != null && o.led > 0) reqHeaders['last-event-id'] = String(o.led);
    const res = await fetch(`${h.base}${o.path}`, {
      headers: reqHeaders,
      signal: ac.signal,
    });
    status = res.status;
    headers = res.headers;
    if (status === 200 && res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder('utf-8');
      void (async () => {
        try {
          for (;;) {
            const { done: d, value } = await reader.read();
            if (d) {
              const rest = dec.decode();
              if (rest) chunks.push({ t: Date.now(), text: rest });
              endedFlag = true;
              break;
            }
            chunks.push({ t: Date.now(), text: dec.decode(value, { stream: true }) });
          }
        } catch { /* hardTimer abort or teardown */ }
      })();
    }
  } catch { /* hardTimer abort or transport teardown */ }
  return {
    status,
    headers,
    chunks,
    text,
    ids: () => [...text().matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1])),
    frames: () => parseFrames(text()),
    get ended() { return endedFlag; },
    get aborted() { return abortedFlag; },
    get abortReason() { return abortReasonFlag; },
    lastAt: () => chunks.at(-1)?.t ?? 0,
    abort: async (reason?: string) => {
      clearTimeout(hardTimer);
      abortedFlag = true;
      abortReasonFlag = reason ?? 'caller';
      ac.abort();
      await sleep(60);
    },
  };
}

async function probeStatus(path: string, uid: string): Promise<number> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), 1500);
  try {
    const res = await fetch(`${h.base}${path}`, { headers: h.U(uid), signal: ac.signal });
    const status = res.status;
    await res.text().catch(() => '');
    return status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

// ══ Fixture · 0214 自装 → notify 预热 → 清场 → 三表 upsert → 种入 → 自检 ══════════
const migPath = fileURLToPath(new URL('../../../packages/db/migrations/0214_interview_event_statement_notify.sql', import.meta.url));
const migBytes = readFileSync(migPath);
const migSha = createHash('sha256').update(migBytes).digest('hex');
await h.pool.query(migBytes.toString('utf8'));
const trigRow = await h.pool.query(`SELECT tgname FROM pg_trigger WHERE tgname='interview_event_sse_notify' AND tgrelid='interview_event'::regclass`);
const pgTrigger = { name: 'interview_event_sse_notify', present: (trigRow.rowCount ?? 0) === 1 };
console.log(`PIN   0214 trigger self-install bytes=${migBytes.length} sha256=${migSha.slice(0, 16)} present=${pgTrigger.present} (0143 字节不改仅历史·0214 取代)`);
console.log('PIN   0214-only world: 0143 REVOKE 未重放 ⇒ 函数 ACL=默认 PUBLIC EXECUTE；本 prove 只证触发器行为面，不证授权面');

const warm = await Promise.race([getSseNotify().whenHealthy().then(() => true), sleep(8000).then(() => false)]);
if (!warm) hardStop('env分口(notify-warmup)', 'env', { health: getSseNotify().health(), pgTrigger });
const warmHealth = getSseNotify().health();
console.log(`PIN   notify healthy=${warmHealth.healthy} reason=${warmHealth.healthy ? '-' : warmHealth.reason}`);

// ① 清场（12 枚全 key 显式枚举·必须先于任何 INSERT）
await h.pool.query(
  'DELETE FROM interview_event WHERE stream_key IN ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
  [...ALL_KEYS],
);
// ② 三表 upsert（只保聚合行幂等；owner 与臂内 principal 同名）
const aggregates: Array<{ table: 'resume_quiz' | 'resume_diagnosis' | 'interview'; id: string; owner: string; status: string }> = [
  { table: 'resume_quiz', id: QZ_CATCH, owner: 'userA1', status: 'generating' },
  { table: 'resume_quiz', id: QZ_LED, owner: 'userA2', status: 'generating' },
  { table: 'resume_quiz', id: QZ_LIVE, owner: 'userA3', status: 'generating' },
  { table: 'resume_quiz', id: QZ_ISO, owner: 'userC', status: 'generating' },
  { table: 'resume_quiz', id: QZ_ISO_DX, owner: 'userD', status: 'generating' },
  { table: 'resume_diagnosis', id: DX_CATCH, owner: 'userA4', status: 'generating' },
  { table: 'resume_diagnosis', id: DX_LED, owner: 'userA5', status: 'generating' },
  { table: 'resume_diagnosis', id: DX_LIVE, owner: 'userA6', status: 'generating' },
  { table: 'resume_diagnosis', id: DX_ISO, owner: 'userC', status: 'generating' },
  { table: 'resume_diagnosis', id: DX_ISO_DX, owner: 'userD', status: 'generating' },
  { table: 'interview', id: IV_ISO, owner: 'userC', status: 'active' },
  { table: 'interview', id: IV_ISO_DX, owner: 'userD', status: 'active' },
];
for (const a of aggregates) {
  await h.pool.query(
    `INSERT INTO ${a.table}(id,owner_user_id,status) VALUES ($1,$2,$3)
     ON CONFLICT (id) DO UPDATE SET owner_user_id=EXCLUDED.owner_user_id, status=EXCLUDED.status`,
    [a.id, a.owner, a.status],
  );
}

// ③ interview_event 逐行种入（owner 逐列写死；单语句单 key）
interface Seed { key: string; owner: string; seq: number; kind: string; payload: unknown }
const seeds: Seed[] = [
  // QD1 · quiz 全量 catch-up（4 行）
  { key: QZ_CATCH, owner: 'userA1', seq: 1, kind: 'progress', payload: { stage: 'generating' } },
  { key: QZ_CATCH, owner: 'userA1', seq: 2, kind: 'question_ready', payload: { question: 'Q1', refs: ['r1'] } },
  { key: QZ_CATCH, owner: 'userA1', seq: 3, kind: 'question_ready', payload: { question: 'Q2', refs: ['r2'] } },
  { key: QZ_CATCH, owner: 'userA1', seq: 4, kind: 'quiz_ready', payload: { count: 2, report: { score: 80, grounded: 2, summary: 's' } } },
  // QD2 · quiz 断线窗续写（3 行种子）
  { key: QZ_LED, owner: 'userA2', seq: 1, kind: 'progress', payload: { stage: 'generating' } },
  { key: QZ_LED, owner: 'userA2', seq: 2, kind: 'question_ready', payload: { question: 'Q1', refs: ['r1'] } },
  { key: QZ_LED, owner: 'userA2', seq: 3, kind: 'question_ready', payload: { question: 'Q2', refs: ['r2'] } },
  // QD3 · quiz live hold（2 行种子·非终态）
  { key: QZ_LIVE, owner: 'userA3', seq: 1, kind: 'progress', payload: { stage: 'generating' } },
  { key: QZ_LIVE, owner: 'userA3', seq: 2, kind: 'question_ready', payload: { question: 'Q1', refs: ['r1'] } },
  // QD4 · 三线各 1 行 catch-up 正控
  { key: QZ_ISO, owner: 'userC', seq: 1, kind: 'progress', payload: { stream: 'QZ_ISO', marker: 'q-iso-1' } },
  { key: DX_ISO, owner: 'userC', seq: 1, kind: 'progress', payload: { stream: 'DX_ISO', marker: 'd-iso-1' } },
  { key: IV_ISO, owner: 'userC', seq: 1, kind: 'progress', payload: { stream: 'IV_ISO', marker: 'i-iso-1' } },
  // DX1 · diagnosis 全量 catch-up（5 行）
  { key: DX_CATCH, owner: 'userA4', seq: 1, kind: 'progress', payload: { stage: 'generating' } },
  { key: DX_CATCH, owner: 'userA4', seq: 2, kind: 'section_ready', payload: { kind: 'structure', title: '结构', score: 70, findings: [{ text: 't1', refs: ['r1'] }] } },
  { key: DX_CATCH, owner: 'userA4', seq: 3, kind: 'section_ready', payload: { kind: 'completeness', title: '完整性', score: 68, findings: [{ text: 't2', refs: ['r2'] }] } },
  { key: DX_CATCH, owner: 'userA4', seq: 4, kind: 'rewrite_ready', payload: { before: 'b', after: 'a', refs: ['r'] } },
  { key: DX_CATCH, owner: 'userA4', seq: 5, kind: 'diagnosis_ready', payload: { overall: 78, summary: 's', sectionCount: 2, rewriteCount: 1 } },
  // DX2 · diagnosis 断线窗续写（2 行种子）
  { key: DX_LED, owner: 'userA5', seq: 1, kind: 'progress', payload: { stage: 'generating' } },
  { key: DX_LED, owner: 'userA5', seq: 2, kind: 'section_ready', payload: { kind: 'structure', title: '结构', score: 70, findings: [{ text: 't1', refs: ['r1'] }] } },
  // DX3 · diagnosis live hold（2 行种子·非终态）
  { key: DX_LIVE, owner: 'userA6', seq: 1, kind: 'progress', payload: { stage: 'generating' } },
  { key: DX_LIVE, owner: 'userA6', seq: 2, kind: 'section_ready', payload: { kind: 'structure', title: '结构', score: 70, findings: [{ text: 't1', refs: ['r1'] }] } },
  // DX4 · 三线各 1 行 catch-up 正控（键域与 QD4 完全互斥）
  { key: QZ_ISO_DX, owner: 'userD', seq: 1, kind: 'progress', payload: { stream: 'QZ_ISO_DX', marker: 'q-iso-1' } },
  { key: DX_ISO_DX, owner: 'userD', seq: 1, kind: 'progress', payload: { stream: 'DX_ISO_DX', marker: 'd-iso-1' } },
  { key: IV_ISO_DX, owner: 'userD', seq: 1, kind: 'progress', payload: { stream: 'IV_ISO_DX', marker: 'i-iso-1' } },
];
async function insertOne(key: string, owner: string, seq: number, kind: string, payload: unknown): Promise<void> {
  await h.pool.query(
    'INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,$3,$4,$5::jsonb)',
    [owner, key, seq, kind, JSON.stringify(payload)],
  );
}
for (const s of seeds) await insertOne(s.key, s.owner, s.seq, s.kind, s.payload);

// 夹具自检（不计 62 预算）：种入行数表比对（非终态帧数·QZ_LED 种 3 / 终态 6）
const seedCounts: Array<[string, number]> = [
  [QZ_CATCH, 4], [QZ_LED, 3], [QZ_LIVE, 2], [QZ_ISO, 1], [QZ_ISO_DX, 1],
  [DX_CATCH, 5], [DX_LED, 2], [DX_LIVE, 2], [DX_ISO, 1], [DX_ISO_DX, 1],
  [IV_ISO, 1], [IV_ISO_DX, 1],
];
const grouped = await h.pool.query(
  'SELECT stream_key, COUNT(*)::int AS c, MAX(seq)::int AS m FROM interview_event WHERE stream_key = ANY($1::text[]) GROUP BY stream_key',
  [[...ALL_KEYS]],
);
const byKey = new Map<string, { c: number; m: number }>();
for (const row of grouped.rows as Array<Record<string, unknown>>) {
  byKey.set(String(row['stream_key']), { c: Number(row['c']), m: Number(row['m']) });
}
const maxSeqByKey: Record<string, number | null> = {};
let seedCheckOk = true;
for (const [key, n] of seedCounts) {
  const got = byKey.get(key);
  maxSeqByKey[key] = got ? got.m : null;
  const ok = !!got && got.c === n && got.m === n;
  if (!ok) {
    seedCheckOk = false;
    console.log(`FACET-DETAIL fixture key=${key} count=${got?.c ?? 'missing'} maxSeq=${got?.m ?? 'missing'} expected=${n}`);
  }
}
if (!seedCheckOk) hardStop('夹具自检', 'instrument', { injection: { at: Date.now(), maxSeqBefore: 0, maxSeqAfter: maxSeqByKey } });
console.log(`PIN   fixture self-check 12 keys ok (counts=${seedCounts.map(([, n]) => n).join('/')})`);

const maxSeqOf = async (key: string): Promise<number> => {
  const r = await h.pool.query('SELECT COALESCE(MAX(seq),0)::int AS m FROM interview_event WHERE stream_key=$1', [key]);
  return Number((r.rows[0] as { m: number } | undefined)?.m ?? 0);
};
const notifyToken = (streamKey: string, attemptKey: string): Promise<unknown> =>
  h.pool.query('SELECT pg_notify($1, $2)', [SSE_TOKEN_CHANNEL, JSON.stringify({ v: 1, streamKey, attemptKey, seq: 2, text: 'tok-neutral' })]);

async function requireZeroBaseline(arm: string): Promise<void> {
  const ok = await until(() => getSseNotify().waitingCount() === 0 && getSseNotify().tokenSubscriberCount() === 0, 1000);
  if (!ok) hardStop(`env分口(${arm}-pre)`, 'env', { waitingCount: getSseNotify().waitingCount(), tokenSubscriberCount: getSseNotify().tokenSubscriberCount() });
}

const armCounts: Array<{ arm: string; n: number }> = [];
function armEnd(arm: string, from: number): void {
  armCounts.push({ arm, n: reg.length - from });
  console.log(`PIN   arm=${arm} assertions=${reg.length - from}`);
}

/** 自然收尾等待门：200 流等 ended；4xx/5xx 交给断言判产品红；status=0（无响应）归环境分口。 */
async function endGate(r: SseHandle, arm: string, ctx: HardStopCtx): Promise<void> {
  const ok = await until(() => r.ended || r.status !== 200, 3000);
  if (!ok) hardStop(`env分口(${arm}-end)`, 'env', ctx);
}

function payloadStreamOk(frames: Frame[], streamTag: string, markerPrefix: string): boolean {
  if (frames.length === 0) return false;
  const checks = frames.map((f) => {
    try {
      const p = JSON.parse(f.data) as { stream?: string; marker?: string };
      return p.stream === streamTag && p.marker === `${markerPrefix}-${f.id}`;
    } catch {
      return false;
    }
  });
  return checks.every(Boolean);
}

let t0 = Date.now();

// ══ QD1 · quiz 全量 catch-up 逐实体帧（5 条）═════════════════════════════════════
{
  const from = reg.length;
  await requireZeroBaseline('QD1');
  t0 = Date.now();
  const r = await openSse({ path: `/quiz/${QZ_CATCH}/events`, uid: 'userA1' });
  const holdStart = r.chunks[0]?.t ?? t0;
  await endGate(r, 'QD1', { hold: { openedAt: holdStart, frameArrivals: r.chunks.map((c) => c.t), holdMs: Date.now() - holdStart }, gates: { at: Date.now() } });
  const snap = r.text();
  const exp: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stage: 'generating' } },
    { id: 2, kind: 'question_ready', payload: { question: 'Q1', refs: ['r1'] } },
    { id: 3, kind: 'question_ready', payload: { question: 'Q2', refs: ['r2'] } },
    { id: 4, kind: 'quiz_ready', payload: { count: 2, report: { score: 80, grounded: 2, summary: 's' } } },
  ];
  const facets = checkFrames(snap, exp);
  A('QD1① quiz events 200 + text/event-stream', r.status === 200 && ctOk(r.headers));
  A('QD1② 帧集 id/kind 序恰 [1,2,3,4]（残留等式+孤儿 id 门）', assertFrameSet(snap, exp, { cut: 'closed' }));
  A('QD1③ 逐帧结构面（三段+恰一尾空行·护栏）', facets.structOk);
  A('QD1④ 逐帧 payload deep-equal 种子', facets.deepOk);
  A('QD1⑤ 终态后自然收尾且零 token_delta', r.ended === true && r.aborted === false && tokCount(snap) === 0);
  armEnd('QD1', from);
}

// ══ QD2 · quiz 断线窗续写 + LED 续传 + 终态收口（9 条）══════════════════════════════
{
  const from = reg.length;
  await requireZeroBaseline('QD2');
  t0 = Date.now();
  const r1 = await openSse({ path: `/quiz/${QZ_LED}/events`, uid: 'userA2', led: 1 });
  const g1 = await until(() => r1.ids().join(',') === '2,3', 1500);
  if (!g1) hardStop('env分口(QD2-gate1)', 'env', { gates: { gate: g1, at: Date.now() }, hold: { openedAt: r1.chunks[0]?.t ?? t0, frameArrivals: r1.chunks.map((c) => c.t) } });
  await sleep(700);
  await r1.abort();
  const snap1 = r1.text();
  await insertOne(QZ_LED, 'userA2', 4, 'question_ready', { question: 'Q3', refs: ['r3'] });
  await insertOne(QZ_LED, 'userA2', 5, 'question_ready', { question: 'Q4', refs: ['r4'] });

  t0 = Date.now();
  const r2 = await openSse({ path: `/quiz/${QZ_LED}/events`, uid: 'userA2', led: 3 });
  const g2 = await until(() => r2.ids().join(',') === '4,5', 1500);
  if (!g2) hardStop('env分口(QD2-gate2)', 'env', { gates: { gate: g2, at: Date.now() }, hold: { openedAt: r2.chunks[0]?.t ?? t0, frameArrivals: r2.chunks.map((c) => c.t) } });
  await sleep(700);
  await r2.abort();
  const snap2 = r2.text();
  await insertOne(QZ_LED, 'userA2', 6, 'quiz_ready', { count: 4, report: { score: 90, grounded: 4, summary: 's2' } });

  t0 = Date.now();
  const r3 = await openSse({ path: `/quiz/${QZ_LED}/events`, uid: 'userA2', led: 5 });
  const holdStart3 = r3.chunks[0]?.t ?? t0;
  await endGate(r3, 'QD2', { hold: { openedAt: holdStart3, frameArrivals: r3.chunks.map((c) => c.t), holdMs: Date.now() - holdStart3 }, gates: { at: Date.now() } });
  const snap3 = r3.text();

  const exp1: ExpFrame[] = [
    { id: 2, kind: 'question_ready', payload: { question: 'Q1', refs: ['r1'] } },
    { id: 3, kind: 'question_ready', payload: { question: 'Q2', refs: ['r2'] } },
  ];
  const exp2: ExpFrame[] = [
    { id: 4, kind: 'question_ready', payload: { question: 'Q3', refs: ['r3'] } },
    { id: 5, kind: 'question_ready', payload: { question: 'Q4', refs: ['r4'] } },
  ];
  const exp3: ExpFrame[] = [
    { id: 6, kind: 'quiz_ready', payload: { count: 4, report: { score: 90, grounded: 4, summary: 's2' } } },
  ];
  const f1 = checkFrames(snap1, exp1);
  const f2 = checkFrames(snap2, exp2);
  const c1 = tokCount(snap1);
  const c2 = tokCount(snap2);
  const c3 = tokCount(snap3);
  if (c1 !== 0 || c2 !== 0 || c3 !== 0) console.log(`token_delta window=${c1 !== 0 ? 'snap1' : c2 !== 0 ? 'snap2' : 'snap3'}`);
  const userB = await probeStatus(`/quiz/${QZ_LED}/events`, 'userB');
  console.log(`PIN   QD2 quiet=snap1:${Date.now() - r1.lastAt()}ms snap2:${Date.now() - r2.lastAt()}ms (CLOSED_SILENT_MS=${CLOSED_SILENT_MS}; 700ms 静默后定格)`);

  A('QD2① 首连 200 + text/event-stream', r1.status === 200 && ctOk(r1.headers));
  A('QD2② 首连帧集恰 [2,3]（不重放 1）', assertFrameSet(snap1, exp1, { cut: 'closed' }));
  A('QD2③ 首连逐帧 payload deep-equal 种子', f1.deepOk);
  A('QD2④ 二连帧集恰 [4,5]（无 ≤3 重放）', assertFrameSet(snap2, exp2, { cut: 'closed' }));
  A('QD2⑤ 二连逐帧 payload deep-equal 种子', f2.deepOk);
  A('QD2⑥ 三连帧集恰 [6]', assertFrameSet(snap3, exp3, { cut: 'closed' }));
  A('QD2⑦ 三连自然收尾（非 abort）', r3.ended === true && r3.aborted === false);
  A('QD2⑧ userB 越权订阅 → 404', userB === 404);
  A('QD2⑨ 三窗全程零 token_delta', c1 === 0 && c2 === 0 && c3 === 0);
  armEnd('QD2', from);
}

// ══ QD3 · quiz live hold → live-tail → 终态（7 条）════════════════════════════════
{
  const from = reg.length;
  await requireZeroBaseline('QD3');
  const health = getSseNotify().health();
  if (!health.healthy) hardStop('env分口(QD3-health)', 'env', { health, pgTrigger });
  t0 = Date.now();
  const r = await openSse({ path: `/quiz/${QZ_LIVE}/events`, uid: 'userA3', led: 1 });
  const holdStart = r.chunks[0]?.t ?? t0;
  let gateSnap = '';
  const gateAt = Date.now();
  const gate = await until(() => {
    const v = r.text();
    const ids = parseFrames(v).map((f) => f.id);
    if (gateSnap === '' && ids[0] === 2) gateSnap = v;
    return ids[0] === 2;
  }, 1500);
  if (!gate) hardStop('env分口(QD3-gate)', 'env', { gates: { gate, at: gateAt }, health, hold: { openedAt: holdStart, frameArrivals: r.chunks.map((c) => c.t) } });

  // 注入排程在 gate 之后创建（基准=hold 起点；已过时点即立即注入，顺序保证 seq 3 先于 4）
  await sleep(Math.max(0, holdStart + 700 - Date.now()));
  const injAt = Date.now();
  const silentBeforeMs = Date.now() - r.lastAt();
  await insertOne(QZ_LIVE, 'userA3', 3, 'question_ready', { question: 'Q2', refs: ['r2'] });
  await sleep(Math.max(0, holdStart + 1400 - Date.now()));
  await insertOne(QZ_LIVE, 'userA3', 4, 'quiz_ready', { count: 2, report: { score: 88, grounded: 2, summary: 's' } });

  await endGate(r, 'QD3', { hold: { openedAt: holdStart, frameArrivals: r.chunks.map((c) => c.t), holdMs: Date.now() - holdStart }, gates: { gate, at: gateAt }, injection: { at: injAt, silentBeforeMs } });
  await sleep(SILENT_MS);
  const snap = r.text();
  const exp: ExpFrame[] = [
    { id: 2, kind: 'question_ready', payload: { question: 'Q1', refs: ['r1'] } },
    { id: 3, kind: 'question_ready', payload: { question: 'Q2', refs: ['r2'] } },
    { id: 4, kind: 'quiz_ready', payload: { count: 2, report: { score: 88, grounded: 2, summary: 's' } } },
  ];
  const facets = checkFrames(snap, exp);
  const terminalIds = parseFrames(snap).map((f) => f.id).filter((i) => i > 2);
  const fullIds = parseFrames(snap).map((f) => f.id);

  A('QD3① live 200 + text/event-stream', r.status === 200 && ctOk(r.headers));
  A('QD3② gate 内独立定格：首帧恰 [2]（catch-up 非空·非构造性）', parseFrames(gateSnap).map((f) => f.id).join(',') === '2');
  A('QD3③ 终态增量恰 [3,4]（严格多重集）', terminalIds.length === 2 && terminalIds.join(',') === '3,4');
  A('QD3④ 全序恰 [2,3,4] 无重放/无重复', assertFrameSet(snap, exp, { cut: 'closed' }) && fullIds.join(',') === '2,3,4');
  A('QD3⑤ 逐帧结构面 + payload deep-equal 种子', facets.structOk && facets.deepOk);
  A('QD3⑥ pg_trigger 物证（安装面旁证·护栏）', pgTrigger.present);
  A('QD3⑦ 终态后自然收尾且零 token_delta', r.ended === true && r.aborted === false && tokCount(snap) === 0);
  armEnd('QD3', from);
}

// ══ QD4 · quiz 跨流 key 域隔离 + 跨 owner 拒绝（10 条·principal=userC）════════════
{
  const from = reg.length;
  await requireZeroBaseline('QD4');
  const health = getSseNotify().health();
  if (!health.healthy) hardStop('env分口(QD4-health)', 'env', { health, pgTrigger });
  const wBefore = getSseNotify().waitingCount();
  const tBefore = getSseNotify().tokenSubscriberCount();
  t0 = Date.now();
  const [qz, dx, iv] = await Promise.all([
    openSse({ path: `/quiz/${QZ_ISO}/events`, uid: 'userC' }),
    openSse({ path: `/diagnosis/${DX_ISO}/events`, uid: 'userC' }),
    openSse({ path: `/interview/${IV_ISO}/events`, uid: 'userC' }),
  ]);
  const openedAt = t0;
  const gateAt = Date.now();
  const [gq, gd, gi] = await Promise.all([
    until(() => qz.ids().length >= 1, 1500),
    until(() => dx.ids().length >= 1, 1500),
    until(() => iv.ids().length >= 1, 1500),
  ]);
  if (!gq || !gd || !gi) hardStop('env分口(QD4-gate)', 'env', { gates: { gq, gd, gi, at: gateAt }, health, waitingCount: getSseNotify().waitingCount() });
  await sleep(25);
  const wAtGate = getSseNotify().waitingCount();
  console.log(`PIN   QD4 wAtGate=${wAtGate} wBefore=${wBefore} tBefore=${tBefore} (读数·非判据)`);

  const maxSeqBefore = { qz: await maxSeqOf(QZ_ISO), dx: await maxSeqOf(DX_ISO), iv: await maxSeqOf(IV_ISO) };
  const injAt = Date.now();
  const silentBeforeMs = { qz: injAt - qz.lastAt(), dx: injAt - dx.lastAt(), iv: injAt - iv.lastAt() };
  await insertOne(QZ_ISO, 'userC', 2, 'question_ready', { stream: 'QZ_ISO', marker: 'q-iso-2' });
  await insertOne(DX_ISO, 'userC', 2, 'question_ready', { stream: 'DX_ISO', marker: 'd-iso-2' });
  await insertOne(IV_ISO, 'userC', 2, 'question_ready', { stream: 'IV_ISO', marker: 'i-iso-2' });
  const [lq, ld, li] = await Promise.all([
    until(() => qz.ids().includes(2), 1500),
    until(() => dx.ids().includes(2), 1500),
    until(() => iv.ids().includes(2), 1500),
  ]);
  const maxSeqAfter = { qz: await maxSeqOf(QZ_ISO), dx: await maxSeqOf(DX_ISO), iv: await maxSeqOf(IV_ISO) };
  const wakeSkewMs = [qz, dx, iv].map((x) => (x.chunks.find((c) => c.text.includes('id: 2'))?.t ?? 0) - injAt);
  if (!lq || !ld || !li) hardStop('env分口(QD4-live)', 'env', { injection: { at: injAt, maxSeqBefore, maxSeqAfter, silentBeforeMs, wakeSkewMs }, gates: { gq, gd, gi, at: gateAt } });
  await sleep(300);

  const tokenAt = Date.now();
  await Promise.all([
    notifyToken(QZ_ISO, 'att-q'),
    notifyToken(DX_ISO, 'att-d'),
    notifyToken(IV_ISO, 'att-i'),
  ]);
  const tokGate = await until(() => /event: token_delta\ndata: .+\n\n/.test(iv.text()), 1500);
  if (!tokGate) hardStop('env分口(QD4-token)', 'env', { gates: { tokGate, at: Date.now() }, injection: { at: tokenAt, wakeSkewMs } });

  const remain = 3000 - (Date.now() - openedAt);
  if (remain > 0) await sleep(remain);
  const snapQz = qz.text();
  const snapDx = dx.text();
  const snapIv = iv.text();
  console.log(`PIN   QD4 holdMs=${Date.now() - openedAt} frames=qz:${parseFrames(snapQz).map((f) => f.id).join('/')} dx:${parseFrames(snapDx).map((f) => f.id).join('/')} iv:${parseFrames(snapIv).map((f) => f.id).join('/')}`);
  await Promise.all([qz.abort(), dx.abort(), iv.abort()]);
  const settled = await until(() => getSseNotify().waitingCount() === wBefore && getSseNotify().tokenSubscriberCount() === tBefore, 2000);
  if (!settled) {
    await sleep(200);
    if (getSseNotify().waitingCount() !== wBefore || getSseNotify().tokenSubscriberCount() !== tBefore) {
      hardStop('env分口(QD4-settle)', 'env', { waitingCount: getSseNotify().waitingCount(), tokenSubscriberCount: getSseNotify().tokenSubscriberCount() });
    }
  }

  const expQz: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stream: 'QZ_ISO', marker: 'q-iso-1' } },
    { id: 2, kind: 'question_ready', payload: { stream: 'QZ_ISO', marker: 'q-iso-2' } },
  ];
  const expDx: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stream: 'DX_ISO', marker: 'd-iso-1' } },
    { id: 2, kind: 'question_ready', payload: { stream: 'DX_ISO', marker: 'd-iso-2' } },
  ];
  const expIv: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stream: 'IV_ISO', marker: 'i-iso-1' } },
    { id: 2, kind: 'question_ready', payload: { stream: 'IV_ISO', marker: 'i-iso-2' } },
  ];
  const fQz = parseFrames(snapQz);
  const fDx = parseFrames(snapDx);
  const fIv = parseFrames(snapIv);
  const qzNeedles = ['"marker":"d-iso-', '"marker":"i-iso-', '"stream":"DX_ISO"', '"stream":"IV_ISO"'];
  const dxNeedles = ['"marker":"q-iso-', '"marker":"i-iso-', '"stream":"QZ_ISO"', '"stream":"IV_ISO"'];
  const ivNeedles = ['"marker":"q-iso-', '"marker":"d-iso-', '"stream":"QZ_ISO"', '"stream":"DX_ISO"'];
  const qzHits = qzNeedles.map((n) => snapQz.includes(n));
  const dxHits = dxNeedles.map((n) => snapDx.includes(n));
  const ivHits = ivNeedles.map((n) => snapIv.includes(n));
  const qzTok = tokCount(snapQz);
  const dxTok = tokCount(snapDx);
  const ivTok = tokCount(snapIv);
  const tokenMatch = /event: token_delta\ndata: (.+)\n\n/.exec(snapIv);
  let tokenPayload: { attemptKey?: string; seq?: number; text?: string } = {};
  try { tokenPayload = tokenMatch ? (JSON.parse(tokenMatch[1] ?? '{}') as typeof tokenPayload) : {}; } catch { tokenPayload = {}; }
  const userBQz = await probeStatus(`/quiz/${QZ_ISO}/events`, 'userB');
  const userBDx = await probeStatus(`/diagnosis/${DX_ISO}/events`, 'userB');

  A('QD4① QZ 线 200 + text/event-stream', qz.status === 200 && ctOk(qz.headers));
  A('QD4② QZ 线帧集恰 [1,2] + 本流 stream/marker 在证', assertFrameSet(snapQz, expQz, { cut: 'abort' }) && payloadStreamOk(fQz, 'QZ_ISO', 'q-iso'));
  A('QD4③ QZ 线零 DX/IV 域针（JSON 形态四针）', qzHits.every((x) => !x));
  A('QD4④ DX 线 200 + 帧集恰 [1,2] + 本流 stream/marker 在证', dx.status === 200 && ctOk(dx.headers) && assertFrameSet(snapDx, expDx, { cut: 'abort' }) && payloadStreamOk(fDx, 'DX_ISO', 'd-iso'));
  A('QD4⑤ DX 线零 QZ/IV 域针（JSON 形态四针）', dxHits.every((x) => !x));
  A('QD4⑥ IV 线 200 + 自身帧集恰 [1,2]（catch-up 正控 + 本流注入）', iv.status === 200 && ctOk(iv.headers) && assertFrameSet(snapIv, expIv, { cut: 'abort' }) && payloadStreamOk(fIv, 'IV_ISO', 'i-iso'));
  A('QD4⑦ IV 线零 QZ/DX 域针（不写零 ping）', ivHits.every((x) => !x));
  A('QD4⑧ userB 对 QZ_ISO / DX_ISO → 404', userBQz === 404 && userBDx === 404 && userBQz > 0 && userBDx > 0);
  A('QD4⑨ QZ/DX 线 token 无订阅零 token_delta（三线各一次注入后）', qzTok === 0 && dxTok === 0);
  A('QD4⑩ IV 线同一注入恰一帧 token_delta 正控（text=tok-neutral）', ivTok === 1 && tokenPayload.text === 'tok-neutral' && tokenPayload.seq === 2 && tokenPayload.attemptKey === 'att-i');
  armEnd('QD4', from);
}

// ══ DX1 · diagnosis 全量 catch-up 逐实体帧（5 条）════════════════════════════════
{
  const from = reg.length;
  await requireZeroBaseline('DX1');
  t0 = Date.now();
  const r = await openSse({ path: `/diagnosis/${DX_CATCH}/events`, uid: 'userA4' });
  const holdStart = r.chunks[0]?.t ?? t0;
  await endGate(r, 'DX1', { hold: { openedAt: holdStart, frameArrivals: r.chunks.map((c) => c.t), holdMs: Date.now() - holdStart }, gates: { at: Date.now() } });
  const snap = r.text();
  const exp: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stage: 'generating' } },
    { id: 2, kind: 'section_ready', payload: { kind: 'structure', title: '结构', score: 70, findings: [{ text: 't1', refs: ['r1'] }] } },
    { id: 3, kind: 'section_ready', payload: { kind: 'completeness', title: '完整性', score: 68, findings: [{ text: 't2', refs: ['r2'] }] } },
    { id: 4, kind: 'rewrite_ready', payload: { before: 'b', after: 'a', refs: ['r'] } },
    { id: 5, kind: 'diagnosis_ready', payload: { overall: 78, summary: 's', sectionCount: 2, rewriteCount: 1 } },
  ];
  const facets = checkFrames(snap, exp);
  A('DX1① diagnosis events 200 + text/event-stream', r.status === 200 && ctOk(r.headers));
  A('DX1② 帧集 id/kind 序恰 [1..5]（残留等式+孤儿 id 门）', assertFrameSet(snap, exp, { cut: 'closed' }));
  A('DX1③ 逐帧结构面（三段+恰一尾空行·护栏）', facets.structOk);
  A('DX1④ 逐帧 payload deep-equal 种子', facets.deepOk);
  A('DX1⑤ 终态后自然收尾且零 token_delta', r.ended === true && r.aborted === false && tokCount(snap) === 0);
  armEnd('DX1', from);
}

// ══ DX2 · diagnosis 断线窗续写 + LED 续传 + 终态收口（9 条）════════════════════════
{
  const from = reg.length;
  await requireZeroBaseline('DX2');
  t0 = Date.now();
  const r1 = await openSse({ path: `/diagnosis/${DX_LED}/events`, uid: 'userA5', led: 1 });
  const g1 = await until(() => r1.ids().join(',') === '2', 1500);
  if (!g1) hardStop('env分口(DX2-gate1)', 'env', { gates: { gate: g1, at: Date.now() }, hold: { openedAt: r1.chunks[0]?.t ?? t0, frameArrivals: r1.chunks.map((c) => c.t) } });
  await sleep(700);
  await r1.abort();
  const snap1 = r1.text();
  await insertOne(DX_LED, 'userA5', 3, 'section_ready', { kind: 'completeness', title: '完整性', score: 68, findings: [{ text: 't2', refs: ['r2'] }] });
  await insertOne(DX_LED, 'userA5', 4, 'rewrite_ready', { before: 'b', after: 'a', refs: ['r'] });

  t0 = Date.now();
  const r2 = await openSse({ path: `/diagnosis/${DX_LED}/events`, uid: 'userA5', led: 2 });
  const g2 = await until(() => r2.ids().join(',') === '3,4', 1500);
  if (!g2) hardStop('env分口(DX2-gate2)', 'env', { gates: { gate: g2, at: Date.now() }, hold: { openedAt: r2.chunks[0]?.t ?? t0, frameArrivals: r2.chunks.map((c) => c.t) } });
  await sleep(700);
  await r2.abort();
  const snap2 = r2.text();
  await insertOne(DX_LED, 'userA5', 5, 'diagnosis_ready', { overall: 80, summary: 's2', sectionCount: 2, rewriteCount: 1 });

  t0 = Date.now();
  const r3 = await openSse({ path: `/diagnosis/${DX_LED}/events`, uid: 'userA5', led: 4 });
  const holdStart3 = r3.chunks[0]?.t ?? t0;
  await endGate(r3, 'DX2', { hold: { openedAt: holdStart3, frameArrivals: r3.chunks.map((c) => c.t), holdMs: Date.now() - holdStart3 }, gates: { at: Date.now() } });
  const snap3 = r3.text();

  const exp1: ExpFrame[] = [
    { id: 2, kind: 'section_ready', payload: { kind: 'structure', title: '结构', score: 70, findings: [{ text: 't1', refs: ['r1'] }] } },
  ];
  const exp2: ExpFrame[] = [
    { id: 3, kind: 'section_ready', payload: { kind: 'completeness', title: '完整性', score: 68, findings: [{ text: 't2', refs: ['r2'] }] } },
    { id: 4, kind: 'rewrite_ready', payload: { before: 'b', after: 'a', refs: ['r'] } },
  ];
  const exp3: ExpFrame[] = [
    { id: 5, kind: 'diagnosis_ready', payload: { overall: 80, summary: 's2', sectionCount: 2, rewriteCount: 1 } },
  ];
  const f1 = checkFrames(snap1, exp1);
  const f2 = checkFrames(snap2, exp2);
  const c1 = tokCount(snap1);
  const c2 = tokCount(snap2);
  const c3 = tokCount(snap3);
  if (c1 !== 0 || c2 !== 0 || c3 !== 0) console.log(`token_delta window=${c1 !== 0 ? 'snap1' : c2 !== 0 ? 'snap2' : 'snap3'}`);
  const userB = await probeStatus(`/diagnosis/${DX_LED}/events`, 'userB');
  console.log(`PIN   DX2 quiet=snap1:${Date.now() - r1.lastAt()}ms snap2:${Date.now() - r2.lastAt()}ms (CLOSED_SILENT_MS=${CLOSED_SILENT_MS}; 700ms 静默后定格)`);

  A('DX2① 首连 200 + text/event-stream', r1.status === 200 && ctOk(r1.headers));
  A('DX2② 首连帧集恰 [2]（不重放 1）', assertFrameSet(snap1, exp1, { cut: 'closed' }));
  A('DX2③ 首连逐帧 payload deep-equal 种子', f1.deepOk);
  A('DX2④ 二连帧集恰 [3,4]（无 ≤2 重放）', assertFrameSet(snap2, exp2, { cut: 'closed' }));
  A('DX2⑤ 二连逐帧 payload deep-equal 种子', f2.deepOk);
  A('DX2⑥ 三连帧集恰 [5]', assertFrameSet(snap3, exp3, { cut: 'closed' }));
  A('DX2⑦ 三连自然收尾（非 abort）', r3.ended === true && r3.aborted === false);
  A('DX2⑧ userB 越权订阅 → 404', userB === 404);
  A('DX2⑨ 三窗全程零 token_delta', c1 === 0 && c2 === 0 && c3 === 0);
  armEnd('DX2', from);
}

// ══ DX3 · diagnosis live hold → live-tail → 终态（7 条）═══════════════════════════
{
  const from = reg.length;
  await requireZeroBaseline('DX3');
  const health = getSseNotify().health();
  if (!health.healthy) hardStop('env分口(DX3-health)', 'env', { health, pgTrigger });
  t0 = Date.now();
  const r = await openSse({ path: `/diagnosis/${DX_LIVE}/events`, uid: 'userA6', led: 1 });
  const holdStart = r.chunks[0]?.t ?? t0;
  let gateSnap = '';
  const gateAt = Date.now();
  const gate = await until(() => {
    const v = r.text();
    const ids = parseFrames(v).map((f) => f.id);
    if (gateSnap === '' && ids[0] === 2) gateSnap = v;
    return ids[0] === 2;
  }, 1500);
  if (!gate) hardStop('env分口(DX3-gate)', 'env', { gates: { gate, at: gateAt }, health, hold: { openedAt: holdStart, frameArrivals: r.chunks.map((c) => c.t) } });

  await sleep(Math.max(0, holdStart + 700 - Date.now()));
  const injAt = Date.now();
  const silentBeforeMs = Date.now() - r.lastAt();
  await insertOne(DX_LIVE, 'userA6', 3, 'section_ready', { kind: 'completeness', title: '完整性', score: 68, findings: [{ text: 't2', refs: ['r2'] }] });
  await sleep(Math.max(0, holdStart + 1400 - Date.now()));
  await insertOne(DX_LIVE, 'userA6', 4, 'diagnosis_ready', { overall: 80, summary: 's', sectionCount: 2, rewriteCount: 1 });

  await endGate(r, 'DX3', { hold: { openedAt: holdStart, frameArrivals: r.chunks.map((c) => c.t), holdMs: Date.now() - holdStart }, gates: { gate, at: gateAt }, injection: { at: injAt, silentBeforeMs } });
  await sleep(SILENT_MS);
  const snap = r.text();
  const exp: ExpFrame[] = [
    { id: 2, kind: 'section_ready', payload: { kind: 'structure', title: '结构', score: 70, findings: [{ text: 't1', refs: ['r1'] }] } },
    { id: 3, kind: 'section_ready', payload: { kind: 'completeness', title: '完整性', score: 68, findings: [{ text: 't2', refs: ['r2'] }] } },
    { id: 4, kind: 'diagnosis_ready', payload: { overall: 80, summary: 's', sectionCount: 2, rewriteCount: 1 } },
  ];
  const facets = checkFrames(snap, exp);
  const terminalIds = parseFrames(snap).map((f) => f.id).filter((i) => i > 2);
  const fullIds = parseFrames(snap).map((f) => f.id);

  A('DX3① live 200 + text/event-stream', r.status === 200 && ctOk(r.headers));
  A('DX3② gate 内独立定格：首帧恰 [2]（catch-up 非空·非构造性）', parseFrames(gateSnap).map((f) => f.id).join(',') === '2');
  A('DX3③ 终态增量恰 [3,4]（严格多重集）', terminalIds.length === 2 && terminalIds.join(',') === '3,4');
  A('DX3④ 全序恰 [2,3,4] 无重放/无重复', assertFrameSet(snap, exp, { cut: 'closed' }) && fullIds.join(',') === '2,3,4');
  A('DX3⑤ 逐帧结构面 + payload deep-equal 种子', facets.structOk && facets.deepOk);
  A('DX3⑥ pg_trigger 物证（安装面旁证·护栏）', pgTrigger.present);
  A('DX3⑦ 终态后自然收尾且零 token_delta', r.ended === true && r.aborted === false && tokCount(snap) === 0);
  armEnd('DX3', from);
}

// ══ DX4 · diagnosis 跨流 key 域隔离 + 跨 owner 拒绝（10 条·principal=userD）════════
{
  const from = reg.length;
  await requireZeroBaseline('DX4');
  const health = getSseNotify().health();
  if (!health.healthy) hardStop('env分口(DX4-health)', 'env', { health, pgTrigger });
  const wBefore = getSseNotify().waitingCount();
  const tBefore = getSseNotify().tokenSubscriberCount();
  t0 = Date.now();
  const [dx, qz, iv] = await Promise.all([
    openSse({ path: `/diagnosis/${DX_ISO_DX}/events`, uid: 'userD' }),
    openSse({ path: `/quiz/${QZ_ISO_DX}/events`, uid: 'userD' }),
    openSse({ path: `/interview/${IV_ISO_DX}/events`, uid: 'userD' }),
  ]);
  const openedAt = t0;
  const gateAt = Date.now();
  const [gd, gq, gi] = await Promise.all([
    until(() => dx.ids().length >= 1, 1500),
    until(() => qz.ids().length >= 1, 1500),
    until(() => iv.ids().length >= 1, 1500),
  ]);
  if (!gd || !gq || !gi) hardStop('env分口(DX4-gate)', 'env', { gates: { gq, gd, gi, at: gateAt }, health, waitingCount: getSseNotify().waitingCount() });
  await sleep(25);
  const wAtGate = getSseNotify().waitingCount();
  console.log(`PIN   DX4 wAtGate=${wAtGate} wBefore=${wBefore} tBefore=${tBefore} (读数·非判据)`);

  const maxSeqBefore = { qz: await maxSeqOf(QZ_ISO_DX), dx: await maxSeqOf(DX_ISO_DX), iv: await maxSeqOf(IV_ISO_DX) };
  const injAt = Date.now();
  const silentBeforeMs = { qz: injAt - qz.lastAt(), dx: injAt - dx.lastAt(), iv: injAt - iv.lastAt() };
  await insertOne(QZ_ISO_DX, 'userD', 2, 'question_ready', { stream: 'QZ_ISO_DX', marker: 'q-iso-2' });
  await insertOne(DX_ISO_DX, 'userD', 2, 'question_ready', { stream: 'DX_ISO_DX', marker: 'd-iso-2' });
  await insertOne(IV_ISO_DX, 'userD', 2, 'question_ready', { stream: 'IV_ISO_DX', marker: 'i-iso-2' });
  const [lq, ld, li] = await Promise.all([
    until(() => qz.ids().includes(2), 1500),
    until(() => dx.ids().includes(2), 1500),
    until(() => iv.ids().includes(2), 1500),
  ]);
  const maxSeqAfter = { qz: await maxSeqOf(QZ_ISO_DX), dx: await maxSeqOf(DX_ISO_DX), iv: await maxSeqOf(IV_ISO_DX) };
  const wakeSkewMs = [qz, dx, iv].map((x) => (x.chunks.find((c) => c.text.includes('id: 2'))?.t ?? 0) - injAt);
  if (!lq || !ld || !li) hardStop('env分口(DX4-live)', 'env', { injection: { at: injAt, maxSeqBefore, maxSeqAfter, silentBeforeMs, wakeSkewMs }, gates: { gq, gd, gi, at: gateAt } });
  await sleep(300);

  const tokenAt = Date.now();
  await Promise.all([
    notifyToken(QZ_ISO_DX, 'att-q'),
    notifyToken(DX_ISO_DX, 'att-d'),
    notifyToken(IV_ISO_DX, 'att-i'),
  ]);
  const tokGate = await until(() => /event: token_delta\ndata: .+\n\n/.test(iv.text()), 1500);
  if (!tokGate) hardStop('env分口(DX4-token)', 'env', { gates: { tokGate, at: Date.now() }, injection: { at: tokenAt, wakeSkewMs } });

  const remain = 3000 - (Date.now() - openedAt);
  if (remain > 0) await sleep(remain);
  const snapQz = qz.text();
  const snapDx = dx.text();
  const snapIv = iv.text();
  console.log(`PIN   DX4 holdMs=${Date.now() - openedAt} frames=dx:${parseFrames(snapDx).map((f) => f.id).join('/')} qz:${parseFrames(snapQz).map((f) => f.id).join('/')} iv:${parseFrames(snapIv).map((f) => f.id).join('/')}`);
  await Promise.all([dx.abort(), qz.abort(), iv.abort()]);
  const settled = await until(() => getSseNotify().waitingCount() === wBefore && getSseNotify().tokenSubscriberCount() === tBefore, 2000);
  if (!settled) {
    await sleep(200);
    if (getSseNotify().waitingCount() !== wBefore || getSseNotify().tokenSubscriberCount() !== tBefore) {
      hardStop('env分口(DX4-settle)', 'env', { waitingCount: getSseNotify().waitingCount(), tokenSubscriberCount: getSseNotify().tokenSubscriberCount() });
    }
  }

  const expDx: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stream: 'DX_ISO_DX', marker: 'd-iso-1' } },
    { id: 2, kind: 'question_ready', payload: { stream: 'DX_ISO_DX', marker: 'd-iso-2' } },
  ];
  const expQz: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stream: 'QZ_ISO_DX', marker: 'q-iso-1' } },
    { id: 2, kind: 'question_ready', payload: { stream: 'QZ_ISO_DX', marker: 'q-iso-2' } },
  ];
  const expIv: ExpFrame[] = [
    { id: 1, kind: 'progress', payload: { stream: 'IV_ISO_DX', marker: 'i-iso-1' } },
    { id: 2, kind: 'question_ready', payload: { stream: 'IV_ISO_DX', marker: 'i-iso-2' } },
  ];
  const fDx = parseFrames(snapDx);
  const fQz = parseFrames(snapQz);
  const dxNeedles = ['"marker":"q-iso-', '"marker":"i-iso-', '"stream":"QZ_ISO_DX"', '"stream":"IV_ISO_DX"'];
  const qzNeedles = ['"marker":"d-iso-', '"marker":"i-iso-', '"stream":"DX_ISO_DX"', '"stream":"IV_ISO_DX"'];
  const ivNeedles = ['"marker":"q-iso-', '"marker":"d-iso-', '"stream":"QZ_ISO_DX"', '"stream":"DX_ISO_DX"'];
  const dxHits = dxNeedles.map((n) => snapDx.includes(n));
  const qzHits = qzNeedles.map((n) => snapQz.includes(n));
  const ivHits = ivNeedles.map((n) => snapIv.includes(n));
  const qzTok = tokCount(snapQz);
  const dxTok = tokCount(snapDx);
  const ivTok = tokCount(snapIv);
  const tokenMatch = /event: token_delta\ndata: (.+)\n\n/.exec(snapIv);
  let tokenPayload: { attemptKey?: string; seq?: number; text?: string } = {};
  try { tokenPayload = tokenMatch ? (JSON.parse(tokenMatch[1] ?? '{}') as typeof tokenPayload) : {}; } catch { tokenPayload = {}; }
  const userBDx = await probeStatus(`/diagnosis/${DX_ISO_DX}/events`, 'userB');
  const userBQz = await probeStatus(`/quiz/${QZ_ISO_DX}/events`, 'userB');

  A('DX4① DX 线 200 + text/event-stream', dx.status === 200 && ctOk(dx.headers));
  A('DX4② DX 线帧集恰 [1,2] + 本流 stream/marker 在证', assertFrameSet(snapDx, expDx, { cut: 'abort' }) && payloadStreamOk(fDx, 'DX_ISO_DX', 'd-iso'));
  A('DX4③ DX 线零 QZ/IV 域针（JSON 形态四针）', dxHits.every((x) => !x));
  A('DX4④ QZ 线 200 + text/event-stream', qz.status === 200 && ctOk(qz.headers));
  A('DX4⑤ QZ 线帧集恰 [1,2] + 本流 stream/marker 在证 + 零 DX/IV 域针', assertFrameSet(snapQz, expQz, { cut: 'abort' }) && payloadStreamOk(fQz, 'QZ_ISO_DX', 'q-iso') && qzHits.every((x) => !x));
  A('DX4⑥ IV 线 200 + text/event-stream', iv.status === 200 && ctOk(iv.headers));
  A('DX4⑦ IV 线帧集恰 [1,2] + 零 QZ/DX 域针（不写零 ping）', assertFrameSet(snapIv, expIv, { cut: 'abort' }) && ivHits.every((x) => !x));
  A('DX4⑧ userB 对 DX_ISO_DX / QZ_ISO_DX → 404', userBDx === 404 && userBQz === 404 && userBDx > 0 && userBQz > 0);
  A('DX4⑨ QZ/DX 线 token 无订阅零 token_delta（三线各一次注入后）', qzTok === 0 && dxTok === 0);
  A('DX4⑩ IV 线同一注入恰一帧 token_delta 正控（text=tok-neutral）', ivTok === 1 && tokenPayload.text === 'tok-neutral' && tokenPayload.seq === 2 && tokenPayload.attemptKey === 'att-i');
  armEnd('DX4', from);
}

// ── 断言预算自检（顺序钉死：逐臂 reg.length 边界 + 总数；不等先补打 FAIL 行再 exit 2）──
const ARM_BUDGET: Array<[string, number]> = [
  ['QD1', 5], ['QD2', 9], ['QD3', 7], ['QD4', 10],
  ['DX1', 5], ['DX2', 9], ['DX3', 7], ['DX4', 10],
];
const countsOk = armCounts.length === ARM_BUDGET.length
  && ARM_BUDGET.every(([arm, n], i) => armCounts[i]?.arm === arm && armCounts[i]?.n === n);
const totalOk = reg.length === 62;
if (!countsOk || !totalOk) {
  console.log(`FACET budget perArm=${JSON.stringify(armCounts)} expected=${JSON.stringify(ARM_BUDGET)} total=${reg.length}/62`);
  for (const id of failedIds) writeSync(2, `FAIL  ${id}\n`);
  hardStop('断言预算', 'instrument', { gates: { at: Date.now() } });
}
console.log(`PIN   assertion budget perArm=${ARM_BUDGET.map(([arm, n]) => `${arm}:${n}`).join(' ')} total=${reg.length}`);

// ── honesty pins（EXIT=0 仅=案例证据 ≠ covered）──────────────────────────────────
console.log('PIN   non-claim: quiz_unavailable / diagnosis_unavailable 失败终态不在本证明面（生产者源见 quiz-consumer / diagnosis-consumer）');
console.log('PIN   non-claim: 槽容量/429（sse-slot:prove / uc002 旁证）· 跨副本（xrep CLOSED）· 30s 生产兜底 · : ping 心跳 cadence');
console.log('PIN   non-claim: 0062 隐私围栏（harness 未载·IV 线只走臂内 principal owner 匹配正臂）· 0143/0214 授权面（0214-only 世界 ACL 未重放）');
console.log('PIN   non-claim: token_delta 剥离前提=worker 纪律（仅传输态·不落 interview_event），非库约束');
console.log('NOTE: EXIT0=case 证据≠covered≠翻行≠full e2e; case 行/格值翻面权归协调方');

await done();
