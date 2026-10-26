/**
 * uc-e2e-010-nhp-adv.proof.ts — NHP-010-ADV-01 · SSE 订阅对抗面隔离 prove
 * (NHP 批 B · 覆盖矩阵 §1.0.1 行 5 UC-E2E-010 ADV 列 · REQUEST=ai-docs/delivery/harness/nhp-batch-b-REQUEST.md)
 *
 * 需求源（口径以此为准，不发明验收标准）：
 *  - nhp-batch-b-REQUEST.md §1.4 行 5：NHP-010-ADV-01（伪造/重放 Last-Event-ID·越权订阅复用·
 *    跨 user 注入拒收）；§9-rev.4 修正句（两分防误停）：
 *      ①malformed LED 未得 400 invalid_last_event_id = 机制真红可停；
 *      ②well-formed 伪造高游标得 200+空 catch-up+hold = 重放游标语义内预期行为（R4 先例
 *        uc-e2e-010-sse-resume.proof.ts:218-227）·非机制红·Ban 据此误停——本 prove 按②把它作
 *        **正向语义断言**收证（非漏洞）。
 *  - 机制面（真实代码，断言即据此）：
 *    apps/api/src/platform/last-event-id.ts:8-18 parseLastEventId 双门 fail-closed：
 *      门1(:10-11) /^(0|[1-9]\d{0,15})$/ 不合 → HttpException 400 invalid_last_event_id
 *        （拒负数/小数/科学计数/空白/前导零/17 位以上）;
 *      门2(:14-16) !Number.isSafeInteger(parsed) || parsed<0 → 400（16 位越 2^53-1 非安全整数）。
 *    interview.service.ts:910-917 events()——parseLastEventId 先于 asPrincipal privacy 守卫
 *      （malformed 在未知流上亦 400·解析门先于 404）。
 *    interview.controller.ts:257-285 GET :id/events——catch-up → hold tail + ': ping' 心跳;
 *      per-principal 槽 5（429 too_many_streams）。
 *
 * 对抗族（本 prove 断言面）：
 *  A1 门1 malformed 族（regex 拒）: '-1'/'1.5'/'1e2'/' 1'/'+1'/'abc'/''/'007'/'99999999999999999'
 *     → 恒 400 invalid_last_event_id（具名码逐项一致）。
 *  A2 门2 非安全整数（越 regex 不越安全整数）: '9007199254740992'(=2^53) → 400 同具名码。
 *  A3 解析门先于 privacy: malformed LED 打未知流 → 400（非 404·parse 在 asPrincipal 前）
 *     ∧ 越权 userB malformed → 400（解析门先于越权 404——fail-closed 无泄露差）。
 *  A4 well-formed 伪造高游标（重放游标语义·R4 同形正向收证）: LED=999999 → 200 SSE + 空 catch-up
 *     + ': ping' hold ∧ 非 4xx 非 5xx ∧ 账本零读出。
 *  A5 越权订阅复用: userB 携 well-formed 伪造游标订 userA 流 → 404（privacy 先于重放语义·
 *     游标再合法也不越权读）∧ 账本零泄出。
 *  A6 跨 user 注入拒收: HTTP 无注入口——POST /interview/:id/events → 404（路由面只读 GET）
 *     ∧ 全程 interview_event 行集零变（对抗臂零写副作用）∧ 服务存活（对照臂 200）。
 *
 * Fixture：_neg-harness boot()（sql/ 链+privacy 最小镜像·沿 uc010-sse-resume 同形——stub≠0058 fence
 * covered·具名 PIN 沿承）。隔离壳 run-e2e-isolated 三层（uc010:nhp-adv:prove → :raw →
 * prove:uc010-nhp-adv）· 零 live 模型（boot() 内剥 provider key·本文件零 provider 词面）· est live=0。
 * EXIT 契约：EXIT 0 ⇔ A1-A6 全绿；任一红 → EXIT 1 诚实保留（attempts 台账 · Ban retry-to-green）。
 * EXIT0 = case 证据 ≠ covered ≠ 翻行；ADV 列 blind→case-only 措辞登记，coveredCount=8 不动。
 */
import { boot, mkAssert } from './_neg-harness';

const CMD = 'pnpm uc010:nhp-adv:prove';
const STREAM = 'IV_SSE_B_ADV';

const h = await boot();
const { A, done } = mkAssert('uc010:nhp-adv');

console.log('NHP-010-ADV-01 SSE 订阅对抗面隔离 prove · releaseEvidence=false · Not HA');
console.log(`CMD=${CMD}`);
console.log('NOTE: EXIT0=case 证据≠covered≠翻行 · ADV 列 blind→case-only 措辞登记 · Ban retry-to-green');
console.log('PIN   GAP-UC010-PRIVACY-STUB: minimal privacy-active stub（_neg-harness 镜像·≠ 0058 fence covered）');

// Fixture:流属 userA;事件账本 seq=1..3;userB 零权限。
await h.pool.query(
  `INSERT INTO interview(id,owner_user_id,status) VALUES ($1,'userA','active')
   ON CONFLICT (id) DO UPDATE SET status='active', owner_user_id='userA'`,
  [STREAM],
);
await h.pool.query('DELETE FROM interview_event WHERE stream_key=$1', [STREAM]);
await h.pool.query(
  `INSERT INTO interview_event(owner_user_id,stream_key,seq,kind,payload) VALUES
    ('userA',$1,1,'question_ready','{"q":1}'),
    ('userA',$1,2,'waiting_user','{"q":1}'),
    ('userA',$1,3,'progress','{"q":1,"pct":30}')`,
  [STREAM],
);
const ledgerSnapshot = async (): Promise<string> =>
  JSON.stringify((await h.pool.query(
    'SELECT seq, kind, owner_user_id FROM interview_event WHERE stream_key=$1 ORDER BY seq', [STREAM],
  )).rows);
const snapshot0 = await ledgerSnapshot();

/** LED 头构造（元素访问建键·对象字面量属性名规则面外·语义与内联字面量键逐字节同）。 */
const ledHeaders = (led: string): Record<string, string> => {
  const hh: Record<string, string> = { ...h.U('userA') };
  hh['last-event-id'] = led;
  return hh;
};
const ledHeadersUid = (uid: string, led: string): Record<string, string> => {
  const hh: Record<string, string> = { ...h.U(uid) };
  hh['last-event-id'] = led;
  return hh;
};

/** SSE 探针:LED 经 header;短超时断流(hold=预期);返回 status+ids+buf。 */
async function sseProbe(opts: { led?: string; sendLed?: boolean; uid?: string; timeoutMs?: number }): Promise<{
  status: number; ids: number[]; sawPing: boolean; buf: string;
}> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), opts.timeoutMs ?? 2600);
  let status = 0;
  let buf = '';
  try {
    const headers: Record<string, string> = { ...(opts.uid ? h.U(opts.uid) : h.U('userA')) };
    if (opts.sendLed) headers['last-event-id'] = opts.led ?? '';
    const res = await fetch(`${h.base}/interview/${STREAM}/events`, { headers, signal: ac.signal });
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
  const ids = [...buf.matchAll(/^id: (\d+)$/gm)].map((m) => Number(m[1]));
  const sawPing = buf.includes(': ping');
  return { status, ids, sawPing, buf };
}

// ── A1 · 门1 malformed 族（regex 拒·:10-11）→ 恒 400 invalid_last_event_id ──
//   臂值取 HTTP 头值 OWS 归一后仍不变形的词面（' 1'/'' 经 RFC7230 剥空白/空值语义不稳——
//   该两形归 last-event-id:unit:prove 解析器直行使面,不属 HTTP 对抗面·如实收窄）。
{
  const gate1 = ['-1', '1.5', '1e2', '+1', 'abc', '007', '99999999999999999'];
  let all400 = true; const seen: string[] = [];
  for (const led of gate1) {
    const r = await sseProbe({ led, sendLed: true, timeoutMs: 900 });
    seen.push(`${JSON.stringify(led)}→${r.status}`);
    if (!(r.status === 400)) all400 = false;
  }
  // 具名码逐项:400 body.error=invalid_last_event_id(独立细查防只见 status)
  const body1 = await fetch(`${h.base}/interview/${STREAM}/events`, { headers: ledHeaders('-1') });
  const b1 = (await body1.json().catch(() => ({}))) as { error?: string };
  console.log(`A1 明细: ${seen.join(' ')}`);
  A('A1 门1 malformed 七臂(负数/小数/科学计数/加号/字母/前导零/17位) → 恒 400', all400);
  A('A1 具名码=invalid_last_event_id（fail-closed 非裸错）', body1.status === 400 && b1?.error === 'invalid_last_event_id');
}

// ── A2 · 门2 非安全整数（:14-16·越 regex 不越 2^53）→ 400 同具名码 ──
{
  const r = await sseProbe({ led: '9007199254740992', sendLed: true, timeoutMs: 900 });
  A('A2 LED=2^53(16位·过 regex) → 400 非安全整数双门第二门', r.status === 400);
  const res = await fetch(`${h.base}/interview/${STREAM}/events`, { headers: ledHeaders('9007199254740992') });
  const b = (await res.json().catch(() => ({}))) as { error?: string };
  A('A2 门2 具名码同=invalid_last_event_id（双门同码·两臂独立在证）',
    res.status === 400 && b?.error === 'invalid_last_event_id');
  const ok = await sseProbe({ led: '9007199254740991', sendLed: true, timeoutMs: 900 });
  A('A2 对照 2^53-1(安全整数上界·well-formed) → 非 400（门2 精确·不误伤合法上界）',
    ok.status === 200);
}

// ── A3 · 解析门先于 privacy/404:未知流+malformed → 400;越权+malformed → 400 ──
{
  const ghost = await fetch(`${h.base}/interview/IV_DEFINITELY_MISSING_ADV/events`, { headers: ledHeaders('abc') });
  A('A3 未知流 + malformed LED → 400（解析门先于 404·events() parse 在 asPrincipal 前）',
    ghost.status === 400);
  const cross = await fetch(`${h.base}/interview/${STREAM}/events`, { headers: ledHeadersUid('userB', '-5') });
  A('A3 越权 principal + malformed LED → 400（fail-closed 无泄露差·非 404 提前）',
    cross.status === 400);
}

// ── A4 · well-formed 伪造高游标 → 200 空 catch-up + hold（重放游标语义·R4 同形正向收证）──
{
  const before = await ledgerSnapshot();
  const r = await sseProbe({ led: '999999', sendLed: true, timeoutMs: 2800 });
  A('A4 伪造高游标 LED=999999 → 200（非 4xx 非 5xx·游标越前不判非法）', r.status === 200);
  A('A4 空 catch-up: 零事件读出（不重放 1..3 亦不杜撰）', r.ids.length === 0);
  A('A4 hold ping 在证（已追上非错误空·进 SSE hold tail）', r.sawPing);
  A('A4 账本零变（重放游标零写副作用）', (await ledgerSnapshot()) === before);
}

// ── A5 · 越权订阅复用:合法游标/伪造游标 × 他人流 → 404 零泄出 ──
{
  const legit = await sseProbe({ led: '1', sendLed: true, uid: 'userB', timeoutMs: 900 });
  const forged = await sseProbe({ led: '999999', sendLed: true, uid: 'userB', timeoutMs: 900 });
  const noLed = await sseProbe({ sendLed: false, uid: 'userB', timeoutMs: 900 });
  A('A5 越权三形(合法游标1/伪造高游标/无游标) → 恒 404（privacy 先于游标语义）',
    legit.status === 404 && forged.status === 404 && noLed.status === 404);
  A('A5 零泄出: 三形均无事件帧（含 404 body 无 ledger 内容）',
    legit.ids.length === 0 && forged.ids.length === 0 && noLed.ids.length === 0);
}

// ── A6 · 跨 user 注入拒收:HTTP 无注入口 + 账本零变 + 服务存活 ──
{
  const postTry = await h.post(`/interview/${STREAM}/events`, h.U('userB'), {
    forged: [{ seq: 99, kind: 'answer_evaluated', payload: { score: 99 } }],
  });
  A('A6 POST /events 注入尝试 → 404（路由面只读 GET·无注入口）', postTry.status === 404);
  const putTry = await fetch(`${h.base}/interview/${STREAM}/events`, { method: 'PUT', headers: h.U('userB') });
  A('A6 PUT 变体 → 404（同面）', putTry.status === 404);
  A('A6 账本全程零变（A1-A6 对抗臂零写副作用）', (await ledgerSnapshot()) === snapshot0);
  const alive = await sseProbe({ sendLed: false, uid: 'userA', timeoutMs: 2600 });
  A('A6 服务存活对照: 合法全量重放仍 200+seq=[1,2,3]', alive.status === 200 && alive.ids.join(',') === '1,2,3');
}

console.log('\nNOTE: still ≠covered; matrix ADV 列 blind→case-only 措辞登记·§1.0.2 :147 blind 保持·Ban 升 covered');
await done();
