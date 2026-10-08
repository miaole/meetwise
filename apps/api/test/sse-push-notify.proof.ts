/**
 * SSE-PUSH prove (user-adjudicated knife · coordinator Opt1 通道健康分级兜底).
 *
 * P-1 NOTIFY-LATENCY   real trigger(0143 self-installed) → real LISTEN (API
 *                      process singleton) → SSE frame over real HTTP < 500ms.
 * P-2 FALLBACK         (a) degraded arm: live trigger_missing phase proves the
 *                      legacy 2s poll cadence through the real controller/service
 *                      (= the exact path that re-greens sse-slot / uc010 unmodified,
 *                      per coordinator constraint ③ wording: 退化面验证);
 *                      (b) healthy arm: notify suppressed → fallback timer wakes →
 *                      fetch + `: ping`; notify 主推 wakes before fallback;
 *                      (c) LISTEN 断连退避重连 100ms→5s cap readings (listener
 *                      lifecycle copy of job-wakeup-listener, unit seam);
 *                      (d) health flip + structured degradation logs + windows.
 * P-3 DISCONNECT-RESUME mid-hold abort → waiter unregistered (router Map → 0) +
 *                      close 即醒(健康态不滞留 30s)→ Last-Event-ID resume only seq>N.
 * P-4 MULTI-WAITER     same stream_key two waiters single notify both wake;
 *                      different stream_key not falsely woken.
 * P-5 TRIGGER-E2E      dedicated test LISTEN connection receives payload =
 *                      bare stream_key (trigger real, not mock; id only — never
 *                      owner / kind / event data).
 *
 * Coordinator constraints (adjudicated Opt1):
 *   ① health = LISTEN 在位 + establish 期一次 pg_trigger SELECT 实证 0143 在场
 *      (dual condition — Phase A proves the trigger half is load-bearing:
 *      LISTEN reachable yet trigger absent ⇒ degraded);
 *   ② degradation ⇒ structured log `SSE_NOTIFY_DEGRADED reason=listen_down|
 *      trigger_missing` + this proof registers the observed degradation windows
 *      as PIN receipts (live window + unit windows);
 *   ③ the two pre-existing SSE proofs re-green unmodified **as degradation-path
 *      verification**; production B6 posture (polling fallback-only, healthy
 *      fallback = 30s pinned in source) is carried HERE by P-1..P-5 real LISTEN.
 *
 * Fixture notes:
 *   - `_neg-harness` loads sql/01_schema.sql which DROPs interview_event → any
 *     pre-applied migration trigger is destroyed; this proof therefore installs
 *     the REAL 0143 migration content (file bytes, not a retyped copy) after the
 *     degraded-phase demo — proof-local migration-content install follows the
 *     uc010 0058-stub precedent.
 *   - 0058 not in harness → minimal privacy-active stub (uc010 precedent).
 *   - Worker wakeup channel untouched (Ban); event-table schema body untouched
 *     (trigger only, additive).
 *
 *   pnpm sse-push:notify:prove        (isolated runner + receipt)
 *   pnpm -C apps/api prove:sse-push-notify   (raw; needs isolated DATABASE_URL)
 *
 * releaseEvidence=false · Not HA · 本绿 ≠ full.e2e 三流绿(未在本证明面) ·
 * ≠ 跨副本 SSE 槽(HC-GAP-008) · actualSpendCny=null
 */
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { FastifyReply } from 'fastify';
import { boot, mkAssert } from './_neg-harness';
import type { Client } from '@meetwise/db';
import { getSseNotify, SseNotifyService, SSE_NOTIFY_CHANNEL, SSE_NOTIFY_TRIGGER_NAME } from '../src/platform/sse-notify.service.ts';
import { pumpSseEvents } from '../src/platform/sse-pump.ts';

const h = await boot();
const { A, done } = mkAssert('sse-push:notify');

console.log('SSE-PUSH prove · Opt1 通道健康分级兜底 · releaseEvidence=false · Not HA');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── constraint ② live receipt tap: capture the PRODUCTION console.warn seam ──
const degradedLogs: Array<{ line: string; t: number }> = [];
const originalWarn = console.warn.bind(console);
console.warn = ((line: unknown, ...rest: unknown[]) => {
  if (typeof line === 'string' && line.startsWith('SSE_NOTIFY_DEGRADED')) degradedLogs.push({ line, t: Date.now() });
  return (originalWarn as (...a: unknown[]) => void)(line, ...rest);
}) as typeof console.warn;
function triggerMissingLog(): { line: string; t: number } {
  return degradedLogs.find((l) => l.line.includes('reason=trigger_missing')) ?? { line: 'MISSING', t: Date.now() };
}

// Real 0143 migration bytes (self-install after degraded phase; harness DROP made
// any runner-pre-applied trigger impossible — memo 876eaeac §0 anchor 2).
const migration0143 = readFileSync(
  fileURLToPath(new URL('../../../packages/db/migrations/0143_sse_push_notify.sql', import.meta.url)),
  'utf8',
);

// Minimal privacy-active stubs (0058 not in _neg-harness; uc010 precedent).
await h.pool.query(`
CREATE OR REPLACE FUNCTION interview_privacy_active(target_interview text)
RETURNS boolean
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
DECLARE
  principal text := current_setting('app.principal_user', true);
BEGIN
  IF principal IS NULL OR length(principal)=0 OR target_interview IS NULL OR length(target_interview)=0 THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM interview i
     WHERE i.id = target_interview AND i.owner_user_id = principal
  );
END $$;
CREATE OR REPLACE FUNCTION assert_interview_privacy_active(target_interview text)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public, pg_temp AS $$
BEGIN
  IF NOT interview_privacy_active(target_interview) THEN
    RAISE EXCEPTION 'interview_privacy_fenced' USING ERRCODE='P0001';
  END IF;
END $$;
GRANT EXECUTE ON FUNCTION interview_privacy_active(text) TO app_role;
GRANT EXECUTE ON FUNCTION assert_interview_privacy_active(text) TO app_role;
`);
console.log('PIN   GAP-SSEPUSH-PRIVACY-STUB: minimal privacy-active stub (≠ 0058 fence covered; uc010 precedent)');

const AUTH_A = h.U('userA');

async function seedStream(streamKey: string, events: Array<{ seq: number; kind: string; payload: unknown }>): Promise<void> {
  await h.pool.query(
    `INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')
     ON CONFLICT (id) DO UPDATE SET status='active', owner_user_id='userA'`,
    [streamKey],
  );
  await h.pool.query('DELETE FROM interview_event WHERE stream_key=$1', [streamKey]);
  if (!events.length) return;
  const values = events.map((e, i) => `('userA',$${i * 3 + 1},$${i * 3 + 2},'${e.kind}',$${i * 3 + 3}::jsonb)`).join(',');
  await h.pool.query(
    `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ${values}`,
    events.flatMap((e) => [streamKey, e.seq, JSON.stringify(e.payload)]),
  );
}

async function appendEvent(streamKey: string, seq: number, kind: string, payload: unknown): Promise<void> {
  await h.pool.query(
    'INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES ($1,$2,$3,$4,$5::jsonb)',
    ['userA', streamKey, seq, kind, JSON.stringify(payload)],
  );
}

/** Timestamped SSE reader: headers → background chunk loop with arrival times. */
type SseReader = {
  status: number;
  chunks: Array<{ t: number; text: string }>;
  abort(): Promise<void>;
  text(): string;
  ids(): number[];
};
async function openSse(streamKey: string, lastId: number | undefined, maxMs = 30_000): Promise<SseReader> {
  const ac = new AbortController();
  const hardTimer = setTimeout(() => ac.abort(), maxMs);
  const chunks: Array<{ t: number; text: string }> = [];
  let status = 0;
  try {
    const res = await fetch(`${h.base}/interview/${streamKey}/events`, {
      headers: { ...AUTH_A, ...(lastId != null && lastId > 0 ? { 'last-event-id': String(lastId) } : {}) },
      signal: ac.signal,
    });
    status = res.status;
    if (status === 200 && res.body) {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      void (async () => {
        try {
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push({ t: Date.now(), text: dec.decode(value, { stream: true }) });
          }
        } catch { /* aborted */ }
      })();
    }
  } catch { /* aborted */ }
  const self: SseReader = {
    status,
    chunks,
    abort: async () => { clearTimeout(hardTimer); ac.abort(); await sleep(60); },
    text: () => chunks.map((c) => c.text).join(''),
    ids: () => [...self.text().matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1])),
  };
  return self;
}

async function until(cond: () => boolean, timeoutMs: number, stepMs = 25): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (cond()) return true;
    await sleep(stepMs);
  }
  return cond();
}

// ═══ Phase A · 退化面(活体):trigger 缺席 ⇒ 降级 + legacy 2s cadence(约束①②)═══
{
  console.log('\n──────── Phase A · live degraded (trigger_missing) ────────');
  const notify = getSseNotify();
  const warmup = notify.waitFor('sse-push:warmup');           // 惰性起:首 establish 即查 trigger
  // 等到"trigger_missing"这一具体降级因(初态 listen_down 会立即满足 !healthy,不能作等待条件)
  const reasonOf = () => (notify.health() as { healthy: boolean; reason?: string }).reason;
  await until(() => reasonOf() === 'trigger_missing', 5000);
  warmup.dispose();
  const healthA = notify.health();
  A('P-2a 约束①双条件:LISTEN 可达但 trigger 缺席 → 仍降级 reason=trigger_missing(LISTEN 在位非充分)',
    healthA.healthy === false && healthA.reason === 'trigger_missing');
  const trigLog = triggerMissingLog();
  A('P-2a 约束②结构化降级日志:reason=trigger_missing + fallback=legacy_2s_poll',
    /^SSE_NOTIFY_DEGRADED reason=trigger_missing fallback=legacy_2s_poll hint=/.test(trigLog.line));
  console.log(`PIN   OPT1-C2-LIVE-DEGRADED-LOG ${trigLog.line}`);

  // Legacy 2s cadence through the REAL controller+service+DB (degraded path =
  // the exact behavior that re-greens sse-slot / uc010 unmodified; constraint ③).
  // NOTE: undici 不冲刷 hijack 响应的 headers——首 body 字节(此处=首个 ping)才一并到达,
  // 故延迟锚 = 请求发起时刻(非 fetch resolve 时刻)。
  const S0 = 'IV_SSEPUSH0';
  await seedStream(S0, [{ seq: 1, kind: 'progress', payload: { pct: 10 } }]);
  const t0a = Date.now();
  const r = await openSse(S0, 1);
  const gotPing = await until(() => r.text().includes(': ping'), 3600);
  const pingDelay = gotPing ? r.chunks.find((c) => c.text.includes(': ping'))!.t - t0a : -1;
  A(`P-2a 退化=legacy 2s 轮询(真实 HTTP):首 ping 延迟 ${pingDelay}ms ∈[1800,3600](30s 兜底不可能绿)`,
    gotPing && pingDelay >= 1800 && pingDelay <= 3600);
  await r.abort();
  await until(() => notify.waitingCount() === 0, 2000);
  A('P-2a 断开后 router 归零(退化态 waiter 同样无泄漏)', notify.waitingCount() === 0);
}

// ═══ Phase B · 装真 0143 内容 → 健康翻转 + 降级窗口收据(约束②)══════════════
{
  console.log('\n──────── Phase B · install real 0143 → health flip ────────');
  await h.pool.query(migration0143);
  const trig = await h.pool.query(
    'SELECT 1 FROM pg_trigger WHERE tgname=$1 AND tgrelid=$2::regclass LIMIT 1',
    [SSE_NOTIFY_TRIGGER_NAME, 'interview_event'],
  );
  A('P-5 前置:0143 内容装载后 pg_trigger 实证 trigger 在场(真实迁移文件字节)', trig.rowCount === 1);
  const notify = getSseNotify();
  const flipped = await Promise.race([
    notify.whenHealthy().then(() => true),
    sleep(15_000).then(() => false),
  ]);
  const healthyAt = Date.now();
  A('P-2d 健康翻转:trigger 装载后(退避重连期内)LISTEN+trigger 双条件达成 → healthy',
    flipped && notify.health().healthy === true);
  const windowMs = healthyAt - triggerMissingLog().t;
  console.log(`PIN   OPT1-C2-DEGRADED-WINDOW reason=trigger_missing window_ms=${windowMs} (live receipt: degrade log → healthy flip)`);
  A('P-2d 约束②收据:降级窗口已登记(窗口为正、有限)', windowMs > 0 && windowMs < 60_000);
}

// ═══ Phase C · P-1 NOTIFY-LATENCY(真实 trigger→LISTEN→HTTP 帧)══════════════
{
  console.log('\n──────── P-1 · notify latency (real LISTEN, healthy) ────────');
  const S1 = 'IV_SSEPUSH1';
  await seedStream(S1, [
    { seq: 1, kind: 'question_ready', payload: { q: 1 } },
    { seq: 2, kind: 'waiting_user', payload: { q: 1 } },
  ]);
  // 空重放连接的 headers 不会冲刷(undici 首字节才 flush)——用 lastId=1 使 catch-up
  // (id:1,id:2) 立即下发,fetch 即刻 resolve、reader 就位、pump waiter 在册。
  const r = await openSse(S1, 1);
  await until(() => r.ids().includes(2), 3000);
  await sleep(150);                                            // catch-up 已收,waiter 已注册
  const t0 = Date.now();                                       // 保守:含 INSERT 往返
  await appendEvent(S1, 3, 'progress', { pct: 60 });
  const got = await until(() => r.ids().includes(3), 3000);
  const frame = r.chunks.find((c) => /(?:^|\n)id: 3\n/.test(c.text));
  const latency = got && frame ? frame.t - t0 : -1;
  A(`P-1 INSERT→SSE 帧端到端延迟 ${latency}ms < 500ms(notify 精确推送,非轮询相位)`, got && latency >= 0 && latency < 500);
  A('P-1 帧格式原值:id:/event:/data: 三段式(wire format 零改)', r.text().includes('id: 3\nevent: progress\ndata: {"pct":60}\n\n'));
  console.log(`PIN   P1_LATENCY_MEASURED insert_to_frame_ms=${latency} gate=<500`);
  console.log('PIN   P1_LEGACY_CONTRAST registered_not_gated: old 2s poll phase-worst ≥2000ms constant (对照登记不设门)');
  await r.abort();
}

// ═══ Phase D · P-3 断开即醒 + waiter 注销 + LED 续传(健康态)════════════════
{
  console.log('\n──────── P-3 · disconnect → close-wake → Last-Event-ID resume ────────');
  const S2 = 'IV_SSEPUSH2';
  await seedStream(S2, [{ seq: 1, kind: 'progress', payload: { pct: 10 } }]);
  const notify = getSseNotify();
  const live = await openSse(S2, 1);
  await appendEvent(S2, 2, 'progress', { pct: 20 });
  await until(() => live.ids().includes(2), 3000);
  // 健康态静默窗:无事件 ⇒ 零取数(2.8s 内无 ping——退化态 2s 必 ping,以此区分)
  await sleep(2800);
  const pingsInSilence = live.text().split(': ping').length - 1;
  A('P-3 健康态静默窗 2.8s 零 ping(= 零取数;轮询已消除,B6 兜底≥30s)', pingsInSilence === 0);
  await live.abort();                                          // 中途断开
  const drained = await until(() => notify.waitingCount() === 0, 2000);
  A('P-3 客户端断开 → waiter 即时注销(router Map 归零,close 即醒不滞留 30s)', drained && notify.waitingCount() === 0);
  await appendEvent(S2, 3, 'progress', { pct: 30 });           // 断线窗口续写
  const resume = await openSse(S2, 2, 4000);
  await until(() => resume.ids().length > 0 || resume.text().includes(': ping'), 3500);
  A('P-3 重连带 Last-Event-ID=2 → 只补 seq>2(=[3],不重放 1..2)', resume.ids().join(',') === '3');
  await resume.abort();
  await until(() => notify.waitingCount() === 0, 2000);
}

// ═══ Phase E · P-4 MULTI-WAITER(同流双醒 / 异流不误醒)══════════════════════
{
  console.log('\n──────── P-4 · multi-waiter routing ────────');
  const notify = getSseNotify();
  await until(() => notify.health().healthy, 5000);
  const SA = 'IV_SSEPUSH4A';
  const SB = 'IV_SSEPUSH4B';
  await seedStream(SA, []);
  await seedStream(SB, []);
  const w1 = notify.waitFor(SA);
  const w2 = notify.waitFor(SA);
  const wb = notify.waitFor(SB);
  let woke1 = false; let woke2 = false; let wokeB = false;
  void w1.promise.then(() => { woke1 = true; });
  void w2.promise.then(() => { woke2 = true; });
  void wb.promise.then(() => { wokeB = true; });
  await sleep(100);                                            // 等待者全部在册
  await appendEvent(SA, 1, 'progress', { n: 1 });              // 单 INSERT → 单 notify
  await until(() => woke1 && woke2, 2000);
  await sleep(400);                                            // 异流误醒观察窗
  A('P-4 同 stream_key 两 waiter 单次 notify 双醒', woke1 && woke2);
  A('P-4 异 stream_key 不误醒(等待者仍挂起)', !wokeB);
  w1.dispose(); w2.dispose(); wb.dispose();
  A('P-4 全部注销后 router 归零', notify.waitingCount() === 0);
}

// ═══ Phase F · P-5 TRIGGER-E2E(独立 LISTEN 连接实收裸 stream_key)══════════
{
  console.log('\n──────── P-5 · trigger → pg_notify payload (independent listener) ────────');
  const S5 = 'IV_SSEPUSH5';
  await seedStream(S5, []);
  const client = await h.pool.connect();
  try {
    const received: Array<{ channel: string; payload?: string }> = [];
    const onNotification = (m: { channel: string; payload?: string }) => received.push(m);
    client.on('notification', onNotification);
    await client.query(`LISTEN ${SSE_NOTIFY_CHANNEL}`);
    await appendEvent(S5, 1, 'progress', { note: 'owner_data_must_not_travel' });
    await until(() => received.length > 0, 3000);
    client.off('notification', onNotification);
    const msg = received[0];
    A('P-5 测试 LISTEN 连接实收 notification(真实 trigger,非 mock)', received.length >= 1);
    A('P-5 channel=interview_event_ch 且 payload=裸 stream_key 只 id(不携 owner/kind/事件数据)',
      msg?.channel === SSE_NOTIFY_CHANNEL && msg?.payload === S5);
  } finally {
    try { client.release(); } catch { /* already released */ }
  }
}

// ═══ Phase G · P-2 单元面(fake client 缝)══════════════════════════════════
type FakeClient = EventEmitter & {
  query: (sql: string, params?: unknown[]) => Promise<{ rowCount: number; rows: unknown[] }>;
  release: (err?: Error) => void;
};
function fakePgClient(opts: { triggerPresent?: boolean } = {}): Client {
  const c = new EventEmitter() as FakeClient;
  c.query = async (sql: string) => {
    if (/^LISTEN /i.test(sql.trim())) return { rowCount: 0, rows: [] };
    if (/pg_trigger/i.test(sql)) return { rowCount: opts.triggerPresent === false ? 0 : 1, rows: [] };
    return { rowCount: 0, rows: [] };
  };
  c.release = () => undefined;
  return c as unknown as Client;
}
type Sink = { writes: string[]; writeTimes: number[]; reply: unknown; reqRaw: EventEmitter };
function fakeSink(): Sink {
  const writes: string[] = [];
  const writeTimes: number[] = [];
  const reply = {
    hijack() { /* noop */ },
    raw: {
      writeHead() { /* noop */ },
      write: (s: string) => { writes.push(s); writeTimes.push(Date.now()); return true; },
      end() { /* noop */ },
    },
  };
  return { writes, writeTimes, reply, reqRaw: new EventEmitter() };
}
function startPump(sink: Sink, o: {
  streamKey: string;
  notify: SseNotifyService;
  fetchMore: (lastSeq: number) => Promise<{ rows: Array<{ seq: number; kind: string; payload: unknown }> } | null>;
  fallbackMsHealthy?: number;
  lastId?: number;
}): Promise<void> {
  return pumpSseEvents({
    reply: sink.reply as unknown as FastifyReply,
    reqRaw: sink.reqRaw,
    streamKey: o.streamKey,
    initial: { lastId: o.lastId ?? 0, rows: [] },
    fetchMore: o.fetchMore,
    isTerminal: () => false,
    notify: o.notify,
    fallbackMsHealthy: o.fallbackMsHealthy,
  });
}

{
  console.log('\n──────── P-2 unit · healthy fallback arm + notify 主推 ────────');
  // G1: 健康通道 notify 抑制 → 兜底臂唤醒 → fetch + ping(cadence=注入 fallbackMs,非 2s)
  let client: Client | undefined;
  const notify = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
  const sink = fakeSink();
  // 先等 establish 完成(初态 listen_down 的首臂是 2000ms,不能计入健康兜底 cadence 观察)
  await Promise.race([notify.whenHealthy(), sleep(2000)]);
  const finished = startPump(sink, { streamKey: 'UNIT_G1', notify, fetchMore: async () => ({ rows: [] }), fallbackMsHealthy: 250 });
  const t1 = Date.now();
  await until(() => sink.writes.filter((w) => w.includes(': ping')).length >= 3, 2000);
  sink.reqRaw.emit('close');
  await Promise.race([finished, sleep(1500)]);
  const pingIdx = sink.writes.map((w, i) => (w.includes(': ping') ? i : -1)).filter((i) => i >= 0);
  const pingTimes = pingIdx.map((i) => sink.writeTimes[i]!);
  const gaps = pingTimes.slice(1).map((t, i) => t - pingTimes[i]!);
  A('P-2b 健康态兜底臂:notify 抑制时由 fallback 计时器唤醒并写 `: ping`(注入 250ms ≥3 次)', pingTimes.length >= 3);
  A('P-2b 兜底 cadence=fallback 值而非 legacy 2s(最大间隔 <1000ms)', gaps.every((g) => g > 0 && g < 1000));
  console.log(`PIN   P2B_HEALTHY_FALLBACK_ARM injected_fallback_ms=250 observed_gaps_ms=[${gaps.join(',')}] elapsed_ms=${Date.now() - t1} (production pin: HEALTHY_FALLBACK_MS=30_000 in sse-pump.ts)`);
  A('P-2b 单元收尾:close 后 pump 返回且 waiter 归零', notify.waitingCount() === 0);
  await notify.stop();

  // G2: notify 主推——兜底 30s 注入下,notify 到达即刻唤醒取数发帧
  const notify2 = new SseNotifyService({ connect: async () => { client = fakePgClient(); return client; }, log: () => {}, random: () => 0 });
  const sink2 = fakeSink();
  let fetches2 = 0;
  const finished2 = startPump(sink2, {
    streamKey: 'UNIT_G2',
    notify: notify2,
    fallbackMsHealthy: 30_000,
    lastId: 100,
    fetchMore: async () => { fetches2 += 1; return { rows: fetches2 === 1 ? [{ seq: 101, kind: 'progress', payload: { z: 1 } }] : [] }; },
  });
  await until(() => notify2.health().healthy, 2000);
  await sleep(250);                                            // 确认静默:30s 兜底不醒
  const before = sink2.writes.length;
  const tEmit = Date.now();
  client!.emit('notification', { channel: SSE_NOTIFY_CHANNEL, payload: 'UNIT_G2' });
  const gotFrame = await until(() => sink2.writes.length > before, 2000);
  const frameDelay = gotFrame ? sink2.writeTimes[sink2.writeTimes.length - 1]! - tEmit : -1;
  A(`P-2b notify 主推:30s 兜底静默期 notify 即刻唤醒发帧(${frameDelay}ms <1000,不等兜底)`, gotFrame && frameDelay >= 0 && frameDelay < 1000);
  A('P-2b 帧格式原值(id/event/data 三段)', sink2.writes.join('').includes('id: 101\nevent: progress\ndata: {"z":1}\n\n'));
  sink2.reqRaw.emit('close');
  await Promise.race([finished2, sleep(1500)]);
  await notify2.stop();
}

{
  console.log('\n──────── P-2 unit · degraded listen_down arm (legacy 2s) ────────');
  const logs: string[] = [];
  const notify = new SseNotifyService({ connect: async () => { throw new Error('listen_down_forced'); }, log: (l) => logs.push(l) });
  const sink = fakeSink();
  let fetches = 0;
  const t0 = Date.now();
  const finished = startPump(sink, { streamKey: 'UNIT_G3', notify, fetchMore: async () => { fetches += 1; return { rows: [] }; } });
  await sleep(2400);
  sink.reqRaw.emit('close');
  await Promise.race([finished, sleep(1500)]);
  A('P-2c listen_down 退化:2.4s 窗内恰 1 次取数 + 1 次 ping(legacy 2s cadence,非 30s)',
    fetches === 1 && sink.writes.filter((w) => w.includes(': ping')).length === 1);
  const firstPing = sink.writeTimes[0] ?? -1;                  // 空取数 → ping 1:1 映射取数时刻
  A(`P-2c 取数时刻 ≈2000ms(首个 ping 延迟 ${firstPing - t0}ms ∈[1800,2400])`,
    sink.writes.length === 1 && firstPing - t0 >= 1800 && firstPing - t0 <= 2400);
  A('P-2c 约束②:reason=listen_down 结构化日志',
    logs.some((l) => /^SSE_NOTIFY_DEGRADED reason=listen_down fallback=legacy_2s_poll hint=/.test(l)));
  console.log(`PIN   OPT1-C2-UNIT-DEGRADED-LOG ${logs.find((l) => l.includes('reason=listen_down')) ?? 'MISSING'}`);
  A('P-2c 退化态健康读数 reason=listen_down', notify.health().healthy === false && (notify.health() as { reason?: string }).reason === 'listen_down');
  await notify.stop();
}

{
  console.log('\n──────── P-2 unit · LISTEN 断连退避重连 100ms→5s cap 读数 ────────');
  const stamps: number[] = [];
  const notify = new SseNotifyService({
    connect: async () => { stamps.push(Date.now()); throw new Error('refused'); },
    log: () => {}, random: () => 0,                            // 确定性:delay = floor(cap*0.75)
  });
  notify.waitFor('UNIT_G4');                                   // 惰性起
  await until(() => stamps.length >= 8, 15_000);
  const deltas = stamps.slice(1).map((t, i) => t - stamps[i]!);
  A('P-2c 退避读数:首退避 ∈[40,160](base 100ms)',
    deltas.length >= 1 && deltas[0]! >= 40 && deltas[0]! <= 160);
  A('P-2c 退避读数:单调不减(指数增长)', deltas.every((d, i) => i === 0 || d >= deltas[i - 1]!));
  A('P-2c 退避读数:后期触顶(5s cap ×0.75=3750,读数 ∈[3500,5000])',
    deltas[deltas.length - 1]! >= 3500 && deltas[deltas.length - 1]! <= 5000);
  A('P-2c 退避读数:全部 ≤5000(cap 生效)', deltas.every((d) => d <= 5000));
  console.log(`PIN   P2C_BACKOFF_READINGS_MS base=100 max=5000 random=0 deltas=[${deltas.join(',')}] (蓝本 job-wakeup-listener 同构)`);
  await notify.stop();
}

{
  console.log('\n──────── P-2 unit · health flip + 约束②日志/计划关停静默 ────────');
  const logs: string[] = [];
  const clients: Client[] = [];
  const notify = new SseNotifyService({
    reconnectBaseMs: 10, reconnectMaxMs: 40, random: () => 0,
    connect: async () => { const c = fakePgClient(); clients.push(c); return c; },
    log: (l) => logs.push(l),
  });
  const ready = await Promise.race([notify.whenHealthy().then(() => true), sleep(2000).then(() => false)]);
  A('P-2d 翻转预备:fake LISTEN+trigger 在场 → healthy', ready && notify.health().healthy === true);
  clients[0]!.emit('error', new Error('connection_reset'));     // LISTEN 断连
  await until(() => !notify.health().healthy, 500);
  A('P-2d LISTEN 断连 → 即时降级 reason=listen_down + 结构化日志',
    (notify.health() as { reason?: string }).reason === 'listen_down' && logs.some((l) => l.includes('reason=listen_down')));
  const tDown = Date.now();
  await until(() => notify.health().healthy, 2000);            // 退避重连后复绿
  const windowMs = Date.now() - tDown;
  console.log(`PIN   OPT1-C2-UNIT-DEGRADED-WINDOW reason=listen_down window_ms=${windowMs} (断连→复绿单元收据)`);
  A('P-2d 退避重连后复绿(healthy 翻转回)', notify.health().healthy === true);
  const logCountBeforeStop = logs.length;
  await notify.stop();                                         // 计划内关停 ≠ 降级
  await sleep(120);
  A('P-2d 计划关停不打降级日志(关停 ≠ 退化转变)', logs.length === logCountBeforeStop);
}

// ── 收尾:honesty pins + singleton 关停 ──────────────────────────────────────
{
  const gaps = [
    'GAP-SSEPUSH-FULL-E2E: full.e2e 三流(interview/quiz/diagnosis 终态段)未在本证明面跑(本刀授权=三既有 proof 复跑)',
    'GAP-SSEPUSH-CROSS-REPLICA: 跨副本 SSE 槽/播 HC-GAP-008 未证(单进程单 LISTEN)',
    'GAP-SSEPUSH-QUIZ-DX-HTTP: quiz/diagnosis 控制器与 interview 共用同一 pump/同表同 channel(码面单源+类型检查;HTTP 级逐实体流证明未单列)',
    'GAP-SSEPUSH-PROD-30S: 生产兜底 30s 为源钉值(HEALTHY_FALLBACK_MS=30_000),行为证明用注入 250ms 加速 + HTTP 2.8s 静默窗旁证',
    'GAP-SSEPUSH-REG-WINDOW: 控制器 initial 取数→pump waiter 注册之间存在 ~ms 级窗口,窗内事件由兜底收(≤30s 一次,非丢失;退化态 2s 收)',
    'NOT-HA · releaseEvidence=false · actualSpendCny=null · ≠ covered 宣称 · Ban 全程生效(wakeup 五 blob/事件表本体/Last-Event-ID/secrets 零触碰)',
  ];
  for (const g of gaps) console.log(`PIN   ${g}`);
  A('G-GAP honesty pins printed (EXIT=0 ≠ covered)', gaps.length === 6);
  console.warn = originalWarn;
  await getSseNotify().stop();
}

console.log('\nNOTE: Opt1 退化面已活体实证(两既有 proof 复跑路径);生产 B6 posture 由 P-1~P-5 真 LISTEN 承担;≠ full e2e;≠ HA');
await done();
