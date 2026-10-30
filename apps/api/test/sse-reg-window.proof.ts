/**
 * SSE 注册窗口 proof（流式注册窗口退化态证明面 · 单元缝零 DB 零模型外呼零 HTTP 起服·actualSpendCny=null）。
 *
 * 证明面 = 两区结构（只证不修·产品码零触）：
 *   区1 泵内尾循环取数窗：`sse-pump.ts` 每轮先 `notify.waitFor` 再 `fetchMore`（D5 对偶），
 *        且上一轮 `wait.dispose()` 与下一轮 `waitFor` 之间无 `await`（同步段消灭宏任务插入面）
 *        → 结构零窗。证伪式：静态锁序（源 token / 剥离注释后的区间）+ 动态注入在途事件，
 *        提示必须命中已注册 waiter 即时送达；序回归即退化为兜底周期时延（判决性）。
 *   区2 控制器 pre-fetch 边界窗：三控制器先 `await <svc>.events(...)` 取 initial，再调泵；
 *        快照之后、waiter 注册之前落库的事件其 NOTIFY 命中零在册 waiter → 提示掉地
 *        （`onNotification` 无在册 Set 即 return、不排队），只能由兜底臂收。
 *        承接式：窗内提交 → 兜底送达，零丢失/零重放/有界时延（零丢失以泵未提前收尾为前提）。
 *
 * 刀型 = 双臂复合（证伪 + 承接）：
 *   RW-0 结构静态 7（源 token 锚优先）· RW-6 静态接线 15（镜像泵 + proof 自身源闭合）+ 动态镜像泵 4
 *   PA-0 共享健康前置门 1 · RW-1 证伪 4 · RW-2 承接 5 · RW-3 立即承接 3 · RW-4 退化 3 · RW-5 终态 2
 *   合计 44 臂断言 = 静态 22 + 动态 22；另注入自证 1 条 + PA-0 fake 契约 3 项（按臂重复执行、
 *   打印加臂名前缀、去重后入账）→ 去重 PASS 行 48。
 *
 * keyless：真 `SseNotifyService({ connect: fake LISTEN client })` + fake sink/内存行存储；
 * 零 `@meetwise/db` 连接、零 PG、零 HTTP 起服、零模型外呼、零环境变量。**零控制器 import**：
 * quiz/diagnosis/interview 一律不 import（静态接线断言只 `readFileSync` 读源文本），
 * 故 `principal.guard.ts` 模块顶层的 `getSseNotify().whenHealthy()` 副作用零触面。
 *
 * 判据口径：`until` 轮询超时一律 ≥ 该臂判据上沿 + 余量（RW-4 专值 6000ms、其余 2000ms）；
 * 时间断言只作判决性判别（<300ms vs 1000ms 兜底、下沿 40ms / 1900ms），上沿一律容差边。
 * `waitingCount()` 为进程级跨 key 量 → 臂一律串行（上一臂 `await notify.stop()` 返回后才起下一臂）。
 * 每臂泵 promise 一律 `bounded()` 有界收敛 guard（guard timer 由外部变量持有、`finally clearTimeout`，
 * 不 unref——挂死必须得到 arm_timeout 而非静默空退出）。`until` 的轮询 timer 保持 ref'd 10ms。
 *
 * 运行：pnpm -C apps/api prove:sse-reg-window（零 DB·单元缝直跑）。
 */
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { FastifyReply } from 'fastify';
import type { Client } from '@meetwise/db';
import {
  SseNotifyService,
  SSE_NOTIFY_CHANNEL,
  getSseNotify,
  type SseNotifyWait,
} from '../src/platform/sse-notify.service.ts';
import { createSseRegistry, getSseRegistry, type SseRegistry } from '../src/platform/sse-registry.ts';
import { pumpSseEvents, type SseEventRow, type SsePumpOptions } from '../src/platform/sse-pump.ts';

// ── 类型面旁证（区间2 存在性）：`SsePumpOptions` 若无 fetchInitial/loadInitial，
//    `Extract<...>` 求值为 never；一旦把 initial 取数移进泵，该别名即编译错（比裸求值更硬）。
//    必须 export：no-unused-vars 只有 argsIgnorePattern，无 varsIgnorePattern。
type MustBeNever<T extends never> = T;
export type _RW05 = MustBeNever<Extract<keyof SsePumpOptions, 'fetchInitial' | 'loadInitial'>>;

// ── 断言台账（去重判据）────────────────────────────────────────────────────────
const ARM_IDS = [
  'RW-0-1', 'RW-0-2', 'RW-0-3', 'RW-0-4', 'RW-0-5a', 'RW-0-5b', 'RW-0-6',
  'RW-6-S1:quiz', 'RW-6-S2:quiz', 'RW-6-S3:quiz', 'RW-6-S4:quiz', 'RW-6-S5:quiz', 'RW-6-S6:quiz', 'RW-6-S7:quiz',
  'RW-6-S1:diagnosis', 'RW-6-S2:diagnosis', 'RW-6-S3:diagnosis', 'RW-6-S4:diagnosis',
  'RW-6-S5:diagnosis', 'RW-6-S6:diagnosis', 'RW-6-S7:diagnosis',
  'RW-6-S8',
  'PA-0',
  'RW-1-1', 'RW-1-2', 'RW-1-3', 'RW-1b',
  'RW-2-1a', 'RW-2-1b', 'RW-2-2', 'RW-2-3', 'RW-2-4',
  'RW-3-0', 'RW-3-1', 'RW-3-2',
  'RW-4-1', 'RW-4-2', 'RW-4-3',
  'RW-5-1', 'RW-5-2',
  'RW-6-M1', 'RW-6-M2', 'RW-6-M3', 'RW-6-M4',
];
const EXTRA_IDS = ['INJECTION', 'PA-0-FAKE-1', 'PA-0-FAKE-2', 'PA-0-FAKE-3'];

const outcomes = new Set<string>();
let failures = 0;

function diagnose(detail: unknown): string {
  try { return JSON.stringify(detail); } catch { return String(detail); }
}

/** aux=true 的自证不入 48 台账（臂收尾自证等），但失败同样计红。 */
const A = (id: string, label: string, ok: boolean, detail?: unknown, aux = false): void => {
  console.log(`${ok ? (aux ? 'PASS·aux' : 'PASS') : 'FAIL'}  ${label}`);
  if (!ok && detail !== undefined) console.log(`      ↳ detail: ${diagnose(detail)}`);
  if (!ok) { failures += 1; return; }
  if (!aux) outcomes.add(id);
};

// ── 有界收敛工具（败者一律清理，不留悬挂句柄）──────────────────────────────────
const sleep = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

/** 轮询等待（沿 delta-arm 形制）。轮询 timer 保持 ref'd 10ms——防与 unref 叠加成静默空退出。 */
async function until(cond: () => boolean, timeoutMs: number): Promise<boolean> {
  const t0 = Date.now();
  for (;;) {
    if (cond()) return true;
    if (Date.now() - t0 > timeoutMs) return false;
    await sleep(10);
  }
}

/**
 * 有界收敛 guard（口径写死）：timer 由外部变量持有、`finally clearTimeout` 自清。
 * **不 unref**——挂死链若只剩 unref 定时器会静默 EXIT=0，使本 guard 在其设计的失败模式下失效；
 * 保留 ref 才能在挂死时真得到 `arm_timeout`。
 */
async function bounded<T>(p: Promise<T>, ms: number, tag: string): Promise<T> {
  let guardTimer: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<never>((_resolve, reject) => {
    guardTimer = setTimeout(() => reject(new Error(`arm_timeout_${tag}`)), ms);
  });
  try {
    return await Promise.race([p, guard]);
  } finally {
    if (guardTimer !== undefined) clearTimeout(guardTimer);
  }
}

/** 等泵自然收尾（close/终态）；超时即该臂有界收敛失败（aux 红，不改任何断言读数）。 */
async function awaitPump(p: Promise<void>, ms: number, tag: string): Promise<boolean> {
  try { await bounded(p, ms, tag); return true; } catch { return false; }
}

// ── 源文本静态工具（RW-0 / RW-6 共用；括号/字符串感知，不靠行号）────────────────
function readSource(relPath: string): string {
  return readFileSync(fileURLToPath(new URL(relPath, import.meta.url)), 'utf8');
}

function countOccurrences(hay: string, needle: string): number {
  let n = 0;
  let i = hay.indexOf(needle);
  while (i >= 0) { n += 1; i = hay.indexOf(needle, i + needle.length); }
  return n;
}

/** 剥离行注释/块注释（字符串字面量内不剥）；用于「区间内无 await」与选项块切分。 */
function stripComments(src: string): string {
  let out = '';
  let quote: string | null = null;
  for (let i = 0; i < src.length; i += 1) {
    const c = src.charAt(i);
    const n = src.charAt(i + 1);
    if (quote !== null) {
      out += c;
      if (c === '\\') { out += n; i += 1; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; continue; }
    if (c === '/' && n === '/') { while (i < src.length && src.charAt(i) !== '\n') i += 1; out += '\n'; continue; }
    if (c === '/' && n === '*') {
      i += 2;
      while (i < src.length && !(src.charAt(i) === '*' && src.charAt(i + 1) === '/')) i += 1;
      i += 1;
      continue;
    }
    out += c;
  }
  return out;
}

/** 自 `{` 起做括号配平扫描（字符串感知）；配平归零返回内容与收口下标，扫到文件尾未归零=失败。 */
function scanBalanced(src: string, braceStart: number): { ok: boolean; end: number; content: string } {
  let depth = 0;
  let quote: string | null = null;
  for (let i = braceStart; i < src.length; i += 1) {
    const c = src.charAt(i);
    if (quote !== null) {
      if (c === '\\') { i += 1; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; continue; }
    if (c === '{') depth += 1;
    else if (c === '}') {
      depth -= 1;
      if (depth === 0) return { ok: true, end: i, content: src.slice(braceStart + 1, i) };
      if (depth < 0) return { ok: false, end: -1, content: '' };
    }
  }
  return { ok: false, end: -1, content: '' };
}

/** `pumpSseEvents({` 起、配平归零 `})` 止的选项块（切片空或配平失败=失败）。 */
function optionsBlock(src: string, callIdx: number): { ok: boolean; content: string } {
  const braceStart = src.indexOf('{', callIdx);
  if (braceStart < 0) return { ok: false, content: '' };
  const bal = scanBalanced(src, braceStart);
  return { ok: bal.ok, content: bal.content };
}

/** events handler 作用域切片：自 `async events(` 起（含形参列表）至函数体收口 `}` 止。 */
function eventsHandlerSlice(src: string): { ok: boolean; content: string } {
  const start = src.indexOf('async events(');
  if (start < 0) return { ok: false, content: '' };
  const braceStart = src.indexOf('{', start);
  if (braceStart < 0) return { ok: false, content: '' };
  const bal = scanBalanced(src, braceStart);
  if (!bal.ok) return { ok: false, content: '' };
  return { ok: true, content: src.slice(start, bal.end + 1) };
}

// ── 选项块分类器（S1–S8 唯一分类定义）────────────────────────────────────────────
type Category = 'shorthand' | 'member' | 'identifier-value' | 'arrow' | 'unknown';

interface Entry { key: string; value: string; shorthand: boolean }

const BUSINESS_KEYS = ['reply', 'reqRaw', 'streamKey', 'initial', 'fetchMore', 'isTerminal'];
/** 绝对锚：类别由本卷常量表给出，不与 proof 块分类结果互比（proof 端由 S8 单独校验）。 */
const EXPECTED_CATEGORY: Record<string, Category> = {
  reply: 'shorthand',
  reqRaw: 'member',
  streamKey: 'identifier-value',
  initial: 'shorthand',
  fetchMore: 'arrow',
  isTerminal: 'shorthand',
};
const KEY_ASSERTION: Record<string, string> = {
  reply: 'S2', reqRaw: 'S3', streamKey: 'S4', initial: 'S5', fetchMore: 'S6', isTerminal: 'S7',
};

/** 顶层逗号切分（括号/字符串感知；丢弃尾随空片）——naive split 会被 fetchMore 内逗号切碎。 */
function splitEntries(block: string): string[] {
  const parts: string[] = [];
  let cur = '';
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < block.length; i += 1) {
    const c = block.charAt(i);
    if (quote !== null) {
      cur += c;
      if (c === '\\') { cur += block.charAt(i + 1); i += 1; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; cur += c; continue; }
    if (c === '(' || c === '[' || c === '{') depth += 1;
    else if (c === ')' || c === ']' || c === '}') depth -= 1;
    if (c === ',' && depth === 0) { parts.push(cur); cur = ''; continue; }
    cur += c;
  }
  parts.push(cur);
  while (parts.length > 0 && parts[parts.length - 1]!.trim() === '') parts.pop();
  return parts;
}

function parseEntry(raw: string): Entry {
  const text = raw.trim();
  const colon = text.indexOf(':');
  if (colon < 0) return { key: text, value: '', shorthand: true };
  return { key: text.slice(0, colon).trim(), value: text.slice(colon + 1).trim(), shorthand: false };
}

/** 判定优先级 arrow → member → identifier-value → shorthand（identifier-value 值须全串锚定）。 */
function classify(entry: Entry): Category {
  if (entry.shorthand) return 'shorthand';
  if (/^(async\s+)?(\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(entry.value)) return 'arrow';
  if (/^[A-Za-z_$][\w$]*(\.[\w$]+)+$/.test(entry.value)) return 'member';
  if (/^[A-Za-z_$][\w$]*$/.test(entry.value)) return 'identifier-value';
  return 'unknown';
}

interface Wiring {
  blockOk: boolean;
  keys: string[];
  categories: Map<string, Category>;
  values: Map<string, string>;
  handlerOk: boolean;
  handlerParamName: string | undefined;
  eventsConstPresent: boolean;
}

function analyzeController(relPath: string): Wiring {
  const src = readSource(relPath);
  const pumpIdx = src.indexOf('pumpSseEvents({');
  const blk = pumpIdx < 0 ? { ok: false, content: '' } : optionsBlock(src, pumpIdx);
  const keys: string[] = [];
  const categories = new Map<string, Category>();
  const values = new Map<string, string>();
  if (blk.ok) {
    for (const raw of splitEntries(stripComments(blk.content))) {
      if (raw.trim() === '') continue;
      const e = parseEntry(raw);
      keys.push(e.key);
      categories.set(e.key, classify(e));
      values.set(e.key, e.value);
    }
  }
  const handler = eventsHandlerSlice(src);
  let handlerParamName: string | undefined;
  if (handler.ok) {
    const matches = [...handler.content.matchAll(/@Param\('id'\)\s+([A-Za-z_$][\w$]*)/g)];
    if (matches.length === 1) handlerParamName = matches[0]?.[1];
  }
  return {
    blockOk: blk.ok,
    keys,
    categories,
    values,
    handlerOk: handler.ok && handlerParamName !== undefined,
    handlerParamName,
    eventsConstPresent: handler.ok && /const\s+initial\s*=\s*await\s+this\.[A-Za-z_$][\w$]*\.events\(/.test(handler.content),
  };
}

function sameArray(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function assertControllerWiring(name: string, w: Wiring): void {
  A(`RW-6-S1:${name}`, `RW-6-S1(${name}) 选项块键集恰六且无 deltaSource`,
    w.blockOk && sameArray([...w.keys].sort(), [...BUSINESS_KEYS].sort()),
    { blockOk: w.blockOk, keys: w.keys });
  for (const key of BUSINESS_KEYS) {
    const expectation = KEY_ASSERTION[key] ?? 'S?';
    const want = EXPECTED_CATEGORY[key];
    const got = w.categories.get(key);
    let ok = w.blockOk && got === want;
    let detail: unknown = { key, want, got, blockOk: w.blockOk };
    if (key === 'streamKey') {
      const value = w.values.get(key) ?? '';
      // 语义体补钉（仅限控制器块）：streamKey 值标识符 = 同 handler 的 @Param('id') 形参名。
      const bound = w.handlerOk && w.handlerParamName !== undefined && value === w.handlerParamName;
      ok = ok && bound;
      detail = { key, want, got, value, handlerOk: w.handlerOk, paramName: w.handlerParamName, bound };
    }
    if (key === 'initial') {
      // 语义体补钉（仅限控制器块）：initial 为简写且同函数前句存在 const initial = await this.<svc>.events(。
      ok = ok && w.eventsConstPresent;
      detail = { key, want, got, eventsConstPresent: w.eventsConstPresent };
    }
    A(`RW-6-${expectation}:${name}`, `RW-6-${expectation}(${name}) ${key} 值形=${want}`, ok, detail);
  }
}

// ── fake 组装（沿两形并集：delta-arm 的 EventEmitter reqRaw + writeTimes ＋ ha-2-drain 的 end 守卫）──
interface FakeListenClient extends EventEmitter {
  query: (sql: string, params?: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }>;
  release: (err?: Error) => void;
}

interface FakeListenCounters { listen: number; triggerRows: number[] }

function makeFakeListenClient(counters: FakeListenCounters): FakeListenClient {
  const c = new EventEmitter() as FakeListenClient;
  c.query = async (sql: string) => {
    const s = sql.trim();
    if (/^LISTEN /i.test(s)) { counters.listen += 1; return { rowCount: 0, rows: [] }; }
    if (/pg_trigger/i.test(s)) { counters.triggerRows.push(1); return { rowCount: 1, rows: [] }; }
    return { rowCount: 0, rows: [] };
  };
  c.release = () => undefined;
  return c;
}

interface FakeListenRig {
  counters: FakeListenCounters;
  connect: () => Promise<Client>;
  current: () => FakeListenClient | undefined;
}

function fakeListenRig(): FakeListenRig {
  const counters: FakeListenCounters = { listen: 0, triggerRows: [] };
  let client: FakeListenClient | undefined;
  return {
    counters,
    current: () => client,
    connect: async () => {
      const c = makeFakeListenClient(counters);
      client = c;
      return c as unknown as Client;
    },
  };
}

interface Sink {
  writes: string[];
  writeTimes: number[];
  reply: unknown;
  reqRaw: EventEmitter;
  readonly endCount: number;
  readonly writesAfterEnd: number;
}

function fakeSink(): Sink {
  const writes: string[] = [];
  const writeTimes: number[] = [];
  let endCount = 0;
  let writesAfterEnd = 0;
  let ended = false;
  const raw = {
    writeHead(_code: number, _headers: Record<string, string>) { /* 头非本刀断言面 */ },
    write(s: string) {
      if (ended) { writesAfterEnd += 1; throw new Error('ERR_STREAM_WRITE_AFTER_END'); }
      writes.push(s);
      writeTimes.push(Date.now());
      return true;
    },
    end() {
      if (ended) throw new Error('ERR_STREAM_DOUBLE_END');
      ended = true;
      endCount += 1;
    },
  };
  const reply = { hijack() { /* noop */ }, raw };
  return {
    writes,
    writeTimes,
    reply,
    reqRaw: new EventEmitter(),
    get endCount() { return endCount; },
    get writesAfterEnd() { return writesAfterEnd; },
  };
}

/** 受控取数：逐发手动 resolve（确定性时序，零真实库）。 */
function controlledFetch() {
  const pending: Array<(value: { rows: SseEventRow[] }) => void> = [];
  return {
    fetchMore: (_lastSeq: number) => new Promise<{ rows: SseEventRow[] }>((resolve) => { pending.push(resolve); }),
    resolveNext(value: { rows: SseEventRow[] }): void { pending.shift()?.(value); },
    get inFlight() { return pending.length; },
  };
}

/** 内存行存储：`seq > lastId` 谓词复刻取数面（initial 与 tail 同谓词）。 */
function memStore(seed: SseEventRow[]) {
  const rows = seed.slice();
  return {
    append(row: SseEventRow): void { rows.push(row); },
    async fetch(lastSeq: number): Promise<{ rows: SseEventRow[] }> {
      return { rows: rows.filter((r) => r.seq > lastSeq) };
    },
    get rows(): SseEventRow[] { return rows; },
  };
}

/** fire() 定义：payload 必须等于该臂 streamKey（写错键即整臂假红——无在册 Set 直接 return）。 */
function fire(client: FakeListenClient, streamKey: string): void {
  client.emit('notification', { channel: SSE_NOTIFY_CHANNEL, payload: streamKey });
}

/** id 抽取统一口径：writes 拼接后按 `\n\n` 切帧、每帧以 `^id: (\d+)\n` 锚定（ping 帧无 id 不入）。 */
function frameIds(sink: Sink): number[] {
  const ids: number[] = [];
  for (const frame of sink.writes.join('').split('\n\n')) {
    const m = /^id: (\d+)\n/.exec(frame);
    if (m !== null && m[1] !== undefined) ids.push(Number(m[1]));
  }
  return ids;
}

function writeTimeOf(sink: Sink, id: number): number | undefined {
  const idx = sink.writes.findIndex((w) => w.startsWith(`id: ${id}\n`));
  return idx < 0 ? undefined : sink.writeTimes[idx];
}

interface PumpDeps { notify: SseNotifyService; registry: SseRegistry }
interface HealthyArm extends PumpDeps { tag: string; client: FakeListenClient }

/**
 * 臂首：注入自证（身份比较必须是臂首首句，早于任何 waitFor/whenHealthy/stop）→ PA-0 有界健康门
 * → PA-0 fake 契约 3 项自证（LISTEN×3 / pg_trigger rowCount=1 / listenerCount=1：漂移探测器）。
 */
async function openHealthyArm(tag: string, notify: SseNotifyService, rig: FakeListenRig): Promise<HealthyArm> {
  const registry = createSseRegistry();
  A('INJECTION', `${tag}/INJ 注入件身份自证（notify/registry 均非进程单例·禁 ?? 回退）`,
    notify !== getSseNotify() && registry !== getSseRegistry());
  const h = await bounded(notify.whenHealthy(), 3000, `pa0_${tag}`);
  A('PA-0', `${tag}/PA-0 whenHealthy 3000ms 有界门 healthy=true 且 health().healthy===true`,
    h.healthy === true && notify.health().healthy === true, h);
  const c = rig.current();
  A('PA-0-FAKE-1', `${tag}/PA-0-FAKE LISTEN 恰 3 次（事件/token/evict 三通道全 resolve）`,
    rig.counters.listen === 3, { listen: rig.counters.listen });
  A('PA-0-FAKE-2', `${tag}/PA-0-FAKE pg_trigger rowCount===1（否则 trigger_missing 降级）`,
    rig.counters.triggerRows.length >= 1 && rig.counters.triggerRows.every((n) => n === 1),
    { triggerRows: rig.counters.triggerRows });
  A('PA-0-FAKE-3', `${tag}/PA-0-FAKE listenerCount('notification')===1（订阅在位）`,
    c !== undefined && c.listenerCount('notification') === 1, { n: c?.listenerCount('notification') });
  if (c === undefined) throw new Error(`arm_missing_listen_client_${tag}`);
  return { tag, notify, registry, client: c };
}

interface StartArmOptions {
  streamKey: string;
  initial: { lastId: number; rows: SseEventRow[] };
  fetchMore: (lastSeq: number) => Promise<{ rows: SseEventRow[] }>;
  isTerminal?: (kind: string) => boolean;
  fallbackMsHealthy: number;
}

function startArmPump(deps: PumpDeps, sink: Sink, o: StartArmOptions): Promise<void> {
  return pumpSseEvents({
    reply: sink.reply as unknown as FastifyReply,
    reqRaw: sink.reqRaw,
    streamKey: o.streamKey,
    initial: o.initial,
    fetchMore: o.fetchMore,
    isTerminal: o.isTerminal ?? (() => false),
    notify: deps.notify,
    registry: deps.registry,
    fallbackMsHealthy: o.fallbackMsHealthy,
  });
}

// ── RW-6 动态镜像块（S8 锚面：六业务键按控制器形书写 + 三注入键）─────────────────
interface MirrorStore { fetch(lastSeq: number): Promise<{ rows: SseEventRow[] }> }

function startMirrorPump(
  reply: FastifyReply,
  req: { raw: SsePumpOptions['reqRaw'] },
  id: string,
  initial: { lastId: number; rows: SseEventRow[] },
  store: MirrorStore,
  isTerminal: (kind: string) => boolean,
  notify: SseNotifyService,
  registry: SseRegistry,
): Promise<void> {
  return pumpSseEvents({
    reply,
    reqRaw: req.raw,
    streamKey: id,
    initial,
    fetchMore: (lastSeq) => store.fetch(lastSeq),
    isTerminal,
    notify,
    registry,
    fallbackMsHealthy: 60,
  });
}

async function main(): Promise<void> {
  console.log('SSE-REG-WINDOW prove · 流式注册窗口（区1 泵内零窗 + 区2 边界窗承接） · 单元缝零 DB · actualSpendCny=null');

  // ═══ 静态臂 RW-0（7 断言）═════════════════════════════════════════════════════
  {
    const pumpSrc = readSource('../src/platform/sse-pump.ts');
    const stripped = stripComments(pumpSrc);

    // RW-0-1 首次注册先于 catch-up（两处逐字 token，非行号硬绑）
    const waitForTokenCount = countOccurrences(stripped, 'notify.waitFor(o.streamKey)');
    const firstWaitForIdx = stripped.indexOf('notify.waitFor(');
    const catchUpIdx = stripped.indexOf('emit(o.initial.rows)');
    A('RW-0-1', 'RW-0-1 首次 waiter 注册先于 catch-up 重放（token 恰两处·首处 index < emit(initial.rows)）',
      waitForTokenCount === 2 && firstWaitForIdx >= 0 && catchUpIdx > firstWaitForIdx,
      { waitForTokenCount, firstWaitForIdx, catchUpIdx });

    // RW-0-2 下一轮注册先于取数（且先于 delta-only 分支：否则挪到 continue 之后仍绿=真窗回归）
    const secondWaitForIdx = stripped.indexOf('notify.waitFor(', firstWaitForIdx + 1);
    const fetchMoreIdx = stripped.indexOf('await o.fetchMore(lastSeq)');
    const deltaOnlyIdx = stripped.indexOf('deltaRing.length && !notifyWoke');
    A('RW-0-2', 'RW-0-2 尾取数窗序：第二处注册 index < fetchMore index 且 < delta-only 分支 index（合取）',
      secondWaitForIdx > firstWaitForIdx && fetchMoreIdx > 0 && deltaOnlyIdx > 0
      && secondWaitForIdx < fetchMoreIdx && secondWaitForIdx < deltaOnlyIdx,
      { secondWaitForIdx, fetchMoreIdx, deltaOnlyIdx });

    // RW-0-3 边界窗在控制器（per-controller 语义正则 + 选项块含 initial，三查聚合）
    const boundary: Record<string, unknown> = {};
    let boundaryOk = true;
    for (const item of [
      { name: 'interview', path: '../src/modules/interview/interview.controller.ts' },
      { name: 'quiz', path: '../src/modules/quiz/quiz.controller.ts' },
      { name: 'diagnosis', path: '../src/modules/diagnosis/diagnosis.controller.ts' },
    ]) {
      const src = readSource(item.path);
      const hits = [...src.matchAll(/const\s+\w+\s*=\s*await\s+this\.\w+\.events\(/g)].length;
      const pumpIdx = src.indexOf('pumpSseEvents({');
      const blk = pumpIdx < 0 ? { ok: false, content: '' } : optionsBlock(src, pumpIdx);
      const ok = hits === 1 && blk.ok && blk.content.includes('initial');
      boundaryOk = boundaryOk && ok;
      boundary[item.name] = { hits, blockOk: blk.ok, hasInitial: blk.content.includes('initial') };
    }
    A('RW-0-3', 'RW-0-3 边界窗在控制器：三文件各恰 1 处 const x = await this.<svc>.events( 且选项块含 initial',
      boundaryOk, boundary);

    // RW-0-4 双钉值在场
    A('RW-0-4', 'RW-0-4 双钉值在场：HEALTHY_FALLBACK_MS=30_000 / DEGRADED_POLL_MS=2_000',
      pumpSrc.includes('const HEALTHY_FALLBACK_MS = 30_000') && pumpSrc.includes('const DEGRADED_POLL_MS = 2_000'));

    // RW-0-5a 区2 类型面源 token（次级：改名即绕过；前置锚命中+块非空防假绿）
    const ifaceStart = pumpSrc.indexOf('export interface SsePumpOptions {');
    const ifaceEnd = ifaceStart < 0 ? -1 : pumpSrc.indexOf('\n}', ifaceStart);
    const ifaceBlock = ifaceStart >= 0 && ifaceEnd > ifaceStart ? pumpSrc.slice(ifaceStart, ifaceEnd + 2) : '';
    A('RW-0-5a', 'RW-0-5a SsePumpOptions 块不含 fetchInitial/loadInitial（锚命中且块非空·次级 token）',
      ifaceStart >= 0 && ifaceBlock.length > 0 && !/\bfetchInitial\b|\bloadInitial\b/.test(ifaceBlock),
      { ifaceStart, blockLen: ifaceBlock.length });

    // RW-0-5b 区2 正向结构：泵体首个 await 晚于首个 waitFor(
    const fnStart = stripped.indexOf('export async function pumpSseEvents');
    const bodyFirstAwait = fnStart < 0 ? -1 : stripped.indexOf('await ', fnStart);
    const bodyFirstWaitFor = fnStart < 0 ? -1 : stripped.indexOf('notify.waitFor(', fnStart);
    A('RW-0-5b', 'RW-0-5b 泵体首个 await index > 首个 waitFor( index（initial 未移入泵：区2 存在性一等判据）',
      fnStart >= 0 && bodyFirstWaitFor > fnStart && bodyFirstAwait > bodyFirstWaitFor,
      { fnStart, bodyFirstAwait, bodyFirstWaitFor });

    // RW-0-6 区1 零窗两区间（剥注释后两段均不含 await；截段须非空）
    const writeHeadIdx = stripped.indexOf('reply.raw.writeHead(');
    const firstDisposeIdx = stripped.indexOf('wait.dispose()');
    const seg1 = writeHeadIdx >= 0 && firstWaitForIdx > writeHeadIdx ? stripped.slice(writeHeadIdx, firstWaitForIdx) : '';
    const seg2 = firstDisposeIdx >= 0 && secondWaitForIdx > firstDisposeIdx ? stripped.slice(firstDisposeIdx, secondWaitForIdx) : '';
    A('RW-0-6', 'RW-0-6 区1 两区间（writeHead→首 waitFor / 首 dispose→次 waitFor）剥注释后均无 await',
      seg1.length > 0 && seg2.length > 0 && !/\bawait\b/.test(seg1) && !/\bawait\b/.test(seg2),
      { seg1Len: seg1.length, seg2Len: seg2.length });
  }

  // ═══ 静态接线臂 RW-6（S1–S7 ×2 + S8 = 15 断言）═══════════════════════════════
  {
    const quiz = analyzeController('../src/modules/quiz/quiz.controller.ts');
    const diagnosis = analyzeController('../src/modules/diagnosis/diagnosis.controller.ts');
    assertControllerWiring('quiz', quiz);
    assertControllerWiring('diagnosis', diagnosis);

    // S8：读 proof 自身源文本（`function startMirrorPump` 起始锚 + 括号配平切片；空/配平失败=红）
    const proofSrc = readFileSync(fileURLToPath(import.meta.url), 'utf8');
    const anchorIdx = proofSrc.indexOf('function startMirrorPump');
    const mirrorPumpIdx = anchorIdx < 0 ? -1 : proofSrc.indexOf('pumpSseEvents({', anchorIdx);
    const mirrorBlk = mirrorPumpIdx < 0 ? { ok: false, content: '' } : optionsBlock(proofSrc, mirrorPumpIdx);
    const mirrorKeys: string[] = [];
    const mirrorCats = new Map<string, Category>();
    if (mirrorBlk.ok) {
      for (const raw of splitEntries(stripComments(mirrorBlk.content))) {
        if (raw.trim() === '') continue;
        const e = parseEntry(raw);
        mirrorKeys.push(e.key);
        mirrorCats.set(e.key, classify(e));
      }
    }
    const extraKeys = mirrorKeys.filter((k) => !BUSINESS_KEYS.includes(k)).sort();
    const sixPresent = BUSINESS_KEYS.every((k) => mirrorCats.has(k));
    // 绝对锚（卷内常量表）+ 关系锚（与两控制器逐键相等）
    const catsMatch = BUSINESS_KEYS.every((k) => mirrorCats.get(k) === EXPECTED_CATEGORY[k]
      && mirrorCats.get(k) === quiz.categories.get(k)
      && mirrorCats.get(k) === diagnosis.categories.get(k));
    const extraOk = sameArray(extraKeys, ['fallbackMsHealthy', 'notify', 'registry']);
    A('RW-6-S8', 'RW-6-S8 镜像同形链闭合：六键名+值形双锚且差集恰 {notify,registry,fallbackMsHealthy}',
      anchorIdx >= 0 && mirrorPumpIdx > anchorIdx && mirrorBlk.ok && sixPresent && catsMatch && extraOk,
      { anchorIdx, mirrorPumpIdx, blockOk: mirrorBlk.ok, mirrorKeys, extraKeys, sixPresent, catsMatch, extraOk });
  }

  // ═══ 动态臂 RW-1（泵内尾窗零窗：4 断言）═══════════════════════════════════════
  {
    const rig = fakeListenRig();
    const notify = new SseNotifyService({ connect: rig.connect, log: () => {}, random: () => 0 });
    const arm = await openHealthyArm('RW-1', notify, rig);
    const sink = fakeSink();
    const key = 'RW1';
    const fetch = controlledFetch();
    const pumpP = startArmPump(arm, sink, {
      streamKey: key,
      initial: { lastId: 0, rows: [] },
      fetchMore: fetch.fetchMore,
      fallbackMsHealthy: 1000,
    });

    // arming：首轮 1000ms 兜底唤醒 → dispose#1 → 注册 waiter#2 → fetch#1 在飞（不 resolve）
    const inFlight1 = await until(() => fetch.inFlight === 1, 2000);
    const countAtInFlight = notify.waitingCount();
    A('RW-1-2', 'RW-1-② fetch#1 在飞时 waitingCount===1（:191 注册先于 :199 取数）',
      inFlight1 && countAtInFlight === 1, { inFlight1, countAtInFlight });

    // 落库 seq=1 → fire（命中在册 waiter#2）→ 随即让 fetch#1 让位
    const store = memStore([]);
    store.append({ seq: 1, kind: 'reply', payload: {} });
    const fireAt = Date.now();
    const countBeforeFire = notify.waitingCount();
    fire(arm.client, key);
    const countAfterFire = notify.waitingCount();
    A('RW-1-1', 'RW-1-① fire 前后 waitingCount 1→0（提示命中在册 waiter 并自摘除·不掉地）',
      countBeforeFire === 1 && countAfterFire === 0, { countBeforeFire, countAfterFire });

    fetch.resolveNext({ rows: [] });
    const inFlight2 = await until(() => fetch.inFlight === 1, 2000);
    fetch.resolveNext({ rows: [{ seq: 1, kind: 'reply', payload: {} }] });
    const delivered = await until(() => sink.writes.some((w) => w.startsWith('id: 1\n')), 2000);
    const writeAt = writeTimeOf(sink, 1);
    const elapsed = writeAt === undefined ? -1 : writeAt - fireAt;
    A('RW-1-3', 'RW-1-③ seq=1 写出 − fire 时刻 <300ms（序回归则退 1000ms 兜底=判决性）',
      delivered && elapsed >= 0 && elapsed < 300, { delivered, inFlight2, elapsed });
    console.log(`PIN  zero_window_delivery_ms=${elapsed}`);

    sink.reqRaw.emit('close');
    const closed = await awaitPump(pumpP, 3000, 'rw1_close');
    A('RW-1/aux', 'RW-1 收尾自证：close 后泵返回且 waitingCount===0', closed && notify.waitingCount() === 0,
      { closed, waiting: notify.waitingCount() }, true);
    await notify.stop();
  }

  // ═══ 动态臂 RW-1b（dispose→重注册微任务零窗：1 断言·零窗变异承重）══════════════
  {
    let wrapped = false;
    let preFireCount = -1;
    let postFireCount = -1;
    let fireAt = 0;
    let fireFn: (() => void) | undefined;
    class ProbeNotify extends SseNotifyService {
      override waitFor(streamKey: string): SseNotifyWait {
        const handle = super.waitFor(streamKey);
        if (!wrapped) {
          wrapped = true;
          const original = handle.dispose;
          handle.dispose = () => {
            original();
            // 微任务落在 :191 重注册之后；fire 前读 1、fire 后立即读 0（entry 先 settle 后自摘除）。
            queueMicrotask(() => {
              preFireCount = this.waitingCount();
              fireAt = Date.now();
              fireFn?.();
              postFireCount = this.waitingCount();
            });
          };
        }
        return handle;
      }
    }
    const rig = fakeListenRig();
    const notify = new ProbeNotify({ connect: rig.connect, log: () => {}, random: () => 0 });
    const arm = await openHealthyArm('RW-1b', notify, rig);
    fireFn = () => { fire(arm.client, 'RW1B'); };
    const sink = fakeSink();
    const fetch = controlledFetch();
    const pumpP = startArmPump(arm, sink, {
      streamKey: 'RW1B',
      initial: { lastId: 0, rows: [] },
      fetchMore: fetch.fetchMore,
      fallbackMsHealthy: 1000,
    });

    const inFlight1 = await until(() => fetch.inFlight === 1, 2000);
    fetch.resolveNext({ rows: [] });
    const inFlight2 = await until(() => fetch.inFlight === 1, 2000);
    fetch.resolveNext({ rows: [{ seq: 1, kind: 'reply', payload: {} }] });
    const delivered = await until(() => sink.writes.some((w) => w.startsWith('id: 1\n')), 2000);
    const writeAt = writeTimeOf(sink, 1);
    const elapsed = writeAt === undefined || fireAt === 0 ? -1 : writeAt - fireAt;
    A('RW-1b', 'RW-1b dispose 后微任务内 fire 前 waitingCount===1、fire 后立即 0，且 id:1 <300ms',
      inFlight1 && inFlight2 && preFireCount === 1 && postFireCount === 0 && delivered && elapsed >= 0 && elapsed < 300,
      { inFlight1, inFlight2, preFireCount, postFireCount, delivered, elapsed });
    console.log(`PIN  dispose_to_fire_delivery_ms=${elapsed}`);

    sink.reqRaw.emit('close');
    const closed = await awaitPump(pumpP, 3000, 'rw1b_close');
    A('RW-1b/aux', 'RW-1b 收尾自证：close 后泵返回且 waitingCount===0', closed && notify.waitingCount() === 0,
      { closed, waiting: notify.waitingCount() }, true);
    await notify.stop();
  }

  // ═══ 动态臂 RW-2（健康通道窗内事件由兜底收：5 断言）════════════════════════════
  {
    const rig = fakeListenRig();
    const notify = new SseNotifyService({ connect: rig.connect, log: () => {}, random: () => 0 });
    const arm = await openHealthyArm('RW-2', notify, rig);
    const key = 'RW2';
    const probeKey = 'RW2-PROBE';

    // ①b 负向探针：无 waiter 时 emit → 随后注册 → 120ms 内不 resolve（NOTIFY 不排队，掉地即永久掉地）
    fire(arm.client, probeKey);
    const probeStart = Date.now();
    const probeWait = notify.waitFor(probeKey);
    const probeResolved = await Promise.race([
      probeWait.promise.then(() => true),
      sleep(120).then(() => false),
    ]);
    const probeElapsed = Date.now() - probeStart;
    probeWait.dispose();
    A('RW-2-1b', 'RW-2-①b 注册前 NOTIFY 掉地不排队（后注册 120ms 内不 resolve·≥100ms）',
      probeResolved === false && probeElapsed >= 100, { probeResolved, probeElapsed });

    // ①a 主臂：快照后落库 seq=3 → 起泵前 fire 命中 0 waiter；post-fire 读必须在起泵之前
    const store = memStore([{ seq: 1, kind: 'reply', payload: {} }, { seq: 2, kind: 'reply', payload: {} }]);
    const sink = fakeSink();
    const initial = { lastId: 0, rows: store.rows.slice() };
    store.append({ seq: 3, kind: 'reply', payload: {} });
    const fireAt = Date.now();
    const countAtFire = notify.waitingCount();
    fire(arm.client, key);
    const countAfterFire = notify.waitingCount();
    A('RW-2-1a', 'RW-2-①a 注册前 fire：fire 时 waitingCount===0 且 fire 后仍 0（无在册=提示掉地）',
      countAtFire === 0 && countAfterFire === 0, { countAtFire, countAfterFire });

    const pumpP = startArmPump(arm, sink, {
      streamKey: key,
      initial,
      fetchMore: (lastSeq) => store.fetch(lastSeq),
      fallbackMsHealthy: 60,
    });
    const delivered = await until(() => sink.writes.some((w) => w.startsWith('id: 3\n')), 2000);
    const writeAt = writeTimeOf(sink, 3);
    const elapsed = writeAt === undefined ? -1 : writeAt - fireAt;
    A('RW-2-2', 'RW-2-② 窗内 seq=3 经 60ms 兜底送达 elapsed∈[40,1000]ms（下沿=判别边）',
      delivered && elapsed >= 40 && elapsed <= 1000, { delivered, elapsed });
    const ids = frameIds(sink);
    A('RW-2-3', 'RW-2-③ 写出 id 子序列恰 [1,2,3]（catch-up 不重放、窗行不丢、零间隙零重复）',
      sameArray(ids.map(String), ['1', '2', '3']), { ids });

    sink.reqRaw.emit('close');
    const closed = await awaitPump(pumpP, 3000, 'rw2_close');
    A('RW-2-4', 'RW-2-④ close 后泵返回且 waitingCount===0（无 waiter 泄漏）',
      closed && notify.waitingCount() === 0, { closed, waiting: notify.waitingCount() });
    await notify.stop();
  }

  // ═══ 动态臂 RW-3（立即承接·注册后提示即时取数：3 断言）══════════════════════════
  {
    const rig = fakeListenRig();
    const notify = new SseNotifyService({ connect: rig.connect, log: () => {}, random: () => 0 });
    const arm = await openHealthyArm('RW-3', notify, rig);
    const key = 'RW3';
    const store = memStore([]);
    const sink = fakeSink();
    let clock = 0;
    const initial = { lastId: 0, rows: [] as SseEventRow[] };
    const snapshotSeq = ++clock;
    store.append({ seq: 3, kind: 'reply', payload: {} });
    const insertSeq = ++clock;
    const pumpP = startArmPump(arm, sink, {
      streamKey: key,
      initial,
      fetchMore: (lastSeq) => store.fetch(lastSeq),
      fallbackMsHealthy: 1000,
    });
    // 泵调用返回后同 tick 立即 fire（泵体同步执行到 `await race`，`:169` waiter 已在册）
    const fireSeq = ++clock;
    const fireAt = Date.now();
    fire(arm.client, key);

    const delivered = await until(() => sink.writes.some((w) => w.startsWith('id: 3\n')), 2000);
    const writeAt = writeTimeOf(sink, 3);
    const elapsed = writeAt === undefined ? -1 : writeAt - fireAt;
    A('RW-3-0', 'RW-3-0 注入序自证 snapshotSeq<insertSeq<fireSeq 且快照不含 seq=3',
      snapshotSeq < insertSeq && insertSeq < fireSeq && initial.rows.every((r) => r.seq !== 3),
      { snapshotSeq, insertSeq, fireSeq, rows: initial.rows.length });
    A('RW-3-1', 'RW-3-1 送达 <300ms（:169 已注册→立即取数承接，非 1000ms 兜底）',
      delivered && elapsed >= 0 && elapsed < 300, { delivered, elapsed });
    const ids = frameIds(sink);
    A('RW-3-2', 'RW-3-2 恰一次写出 id:3（零重复零缺失）',
      delivered && ids.filter((n) => n === 3).length === 1, { ids });

    sink.reqRaw.emit('close');
    const closed = await awaitPump(pumpP, 3000, 'rw3_close');
    A('RW-3/aux', 'RW-3 收尾自证：close 后泵返回且 waitingCount===0', closed && notify.waitingCount() === 0,
      { closed, waiting: notify.waitingCount() }, true);
    await notify.stop();
  }

  // ═══ 动态臂 RW-4（退化 2s 轮询收窗内事件：3 断言·connect 永挂·无 fire·不执行 PA-0）══
  {
    let connectCalls = 0;
    const notify = new SseNotifyService({
      connect: () => { connectCalls += 1; return new Promise<never>(() => { /* 永挂 → health 恒 false */ }); },
      log: () => {},
      random: () => 0,
    });
    const registry = createSseRegistry();
    A('INJECTION', 'RW-4/INJ 注入件身份自证（notify/registry 均非进程单例·禁 ?? 回退）',
      notify !== getSseNotify() && registry !== getSseRegistry());

    const store = memStore([]);
    const sink = fakeSink();
    const initial = { lastId: 0, rows: [] as SseEventRow[] };
    store.append({ seq: 1, kind: 'reply', payload: {} });
    const startAt = Date.now();
    // fallbackMsHealthy=60 应被忽略：health=false 走 DEGRADED_POLL_MS=2_000
    const pumpP = startArmPump({ notify, registry }, sink, {
      streamKey: 'RW4',
      initial,
      fetchMore: (lastSeq) => store.fetch(lastSeq),
      fallbackMsHealthy: 60,
    });
    const delivered = await until(() => sink.writes.some((w) => w.startsWith('id: 1\n')), 6000);
    const writeAt = writeTimeOf(sink, 1);
    const elapsed = writeAt === undefined ? -1 : writeAt - startAt;
    A('RW-4-1', 'RW-4-1 healthy===false 且送达 ∈[1900,5000]ms（首 tick=2_000 → 走 DEGRADED_POLL_MS 非 60ms 注入值）',
      notify.health().healthy === false && delivered && elapsed >= 1900 && elapsed <= 5000,
      { healthy: notify.health(), delivered, elapsed });
    console.log(`PIN  degraded_delivery_ms=${elapsed}`);

    // RW-4-3 注入生效正证：送达之后有界读（禁起泵当拍同步读——同步前缀内恰为 1，插 await 后当拍为 0）
    const connectObserved = await until(() => connectCalls === 1, 2000);
    A('RW-4-3', 'RW-4-3 until(送达) 后有界读 connectCalls===1（connect 覆盖键被消费·establish 恰一次=注入生效）',
      connectObserved && connectCalls === 1, { connectObserved, connectCalls });

    sink.reqRaw.emit('close');
    const closed = await awaitPump(pumpP, 3000, 'rw4_close');
    A('RW-4-2', 'RW-4-2 close 后泵返回且 waitingCount===0（无 waiter 泄漏）',
      closed && notify.waitingCount() === 0, { closed, waiting: notify.waitingCount() });
    await notify.stop();
  }

  // ═══ 动态臂 RW-5（终态窗内事件：2 断言）════════════════════════════════════════
  {
    const rig = fakeListenRig();
    const notify = new SseNotifyService({ connect: rig.connect, log: () => {}, random: () => 0 });
    const arm = await openHealthyArm('RW-5', notify, rig);
    const key = 'RW5';
    const store = memStore([]);
    const sink = fakeSink();
    const initial = { lastId: 0, rows: [] as SseEventRow[] };
    store.append({ seq: 1, kind: 'report_ready', payload: {} });
    const fireAt = Date.now();
    fire(arm.client, key);   // 注册前掉地
    const pumpP = startArmPump(arm, sink, {
      streamKey: key,
      initial,
      fetchMore: (lastSeq) => store.fetch(lastSeq),
      isTerminal: (kind) => kind === 'report_ready',
      fallbackMsHealthy: 60,
    });
    const delivered = await until(() => sink.writes.some((w) => w.startsWith('id: 1\n')), 2000);
    const writeAt = writeTimeOf(sink, 1);
    const elapsed = writeAt === undefined ? -1 : writeAt - fireAt;
    A('RW-5-1', 'RW-5-1 兜底送达终态帧且 elapsed∈[40,1000]ms（不漏终态、不空转到 deadline）',
      delivered && elapsed >= 40 && elapsed <= 1000, { delivered, elapsed });
    const ended = await awaitPump(pumpP, 3000, 'rw5_end');
    A('RW-5-2', 'RW-5-2 end() 恰一次且无写后半截（writesAfterEnd===0）',
      ended && sink.endCount === 1 && sink.writesAfterEnd === 0,
      { ended, endCount: sink.endCount, writesAfterEnd: sink.writesAfterEnd });
    await notify.stop();
  }

  // ═══ 动态镜像泵臂 RW-6（M1–M4 = 4 断言）═════════════════════════════════════════
  {
    const rig = fakeListenRig();
    const notify = new SseNotifyService({ connect: rig.connect, log: () => {}, random: () => 0 });
    const arm = await openHealthyArm('RW-6', notify, rig);
    const key = 'RW6';
    const store = memStore([{ seq: 1, kind: 'reply', payload: {} }]);
    const sink = fakeSink();
    let clock = 0;
    const initial = { lastId: 0, rows: store.rows.slice() };
    const snapshotSeq = ++clock;
    store.append({ seq: 2, kind: 'reply', payload: {} });
    const insertSeq = ++clock;
    const fireSeq = ++clock;
    const fireAt = Date.now();
    const countAtFire = notify.waitingCount();
    fire(arm.client, key);
    const pumpP = startMirrorPump(
      sink.reply as unknown as FastifyReply,
      { raw: sink.reqRaw },
      key,
      initial,
      store,
      () => false,
      arm.notify,
      arm.registry,
    );
    const countAfterStart = notify.waitingCount();
    A('RW-6-M1', 'RW-6-M1 snapshotSeq<insertSeq<fireSeq 且 fire 拍 waitingCount===0 / 起泵后===1',
      snapshotSeq < insertSeq && insertSeq < fireSeq && countAtFire === 0 && countAfterStart === 1,
      { snapshotSeq, insertSeq, fireSeq, countAtFire, countAfterStart });

    const delivered = await until(() => sink.writes.some((w) => w.startsWith('id: 2\n')), 2000);
    const writeAt = writeTimeOf(sink, 2);
    const elapsed = writeAt === undefined ? -1 : writeAt - fireAt;
    A('RW-6-M2', 'RW-6-M2 窗行 seq=2 经 60ms 兜底送达 elapsed∈[40,1000]ms',
      delivered && elapsed >= 40 && elapsed <= 1000, { delivered, elapsed });
    const ids = frameIds(sink);
    A('RW-6-M3', 'RW-6-M3 写出 id 子序列恰 [1,2]（快照不重放、窗行不丢、零重复）',
      sameArray(ids.map(String), ['1', '2']), { ids });

    sink.reqRaw.emit('close');
    const closed = await awaitPump(pumpP, 3000, 'rw6_close');
    A('RW-6-M4', 'RW-6-M4 close 后 waitingCount/registry.count 归零且 endCount===0（close 守卫原值）',
      closed && notify.waitingCount() === 0 && arm.registry.count() === 0 && sink.endCount === 0,
      { closed, waiting: notify.waitingCount(), registry: arm.registry.count(), endCount: sink.endCount });
    console.log(`PIN  mirror_window_delivery_ms=${elapsed}`);
    await notify.stop();
  }

  // ═══ 源 token 回退面 PIN（读数，非断言：回退面被删除时不应红）══════════════════
  {
    const pumpSrc = readSource('../src/platform/sse-pump.ts');
    console.log(`PIN  sse-pump fallback tokens: o.notify ??=${pumpSrc.includes('o.notify ??')} o.registry ??=${pumpSrc.includes('o.registry ??')}`);
  }

  // ═══ 台账（去重 PASS 行；PA-0 与 fake 契约按臂重复执行、不重复入账）════════════════
  const countedIds = [...ARM_IDS, ...EXTRA_IDS];
  const missing = countedIds.filter((id) => !outcomes.has(id));
  if (missing.length > 0) {
    console.log(`FAIL  LEDGER 未执行/未通过的断言: ${missing.join(',')}`);
    failures += missing.length;
  }
  const armPass = ARM_IDS.filter((id) => outcomes.has(id)).length;
  const dedupPass = countedIds.filter((id) => outcomes.has(id)).length;
  console.log(`LEDGER  arm_assertions=${armPass}/44  dedup_pass_lines=${dedupPass}/48  failures=${failures}`);

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ 注册窗口矩阵全部通过（零 DB 零模型外呼·actualSpendCny=null）');
  process.exit(failures ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'sse_reg_window_proof_failed');
  process.exit(1);
});
