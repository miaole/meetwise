/**
 * FENCE-REFLOW F5(#253)+F2 服务器 Action 行为证明（mock fetch+redirect 形·离线可证·§4-6 具名落槽）。
 *
 * 真实 app/interviews/actions.ts 代码经 node:module register 桩（test/f5-hooks.mjs）在 tsx 下执行：
 *   - globalThis.fetch = spy（计数/脚本化响应）——断言「恰好一次 POST :id/abandon」与零 retry 循环；
 *   - next/navigation redirect 桩把目标编码进 digest 抛出——断言带码 redirect 必达一次；
 *   - 'server-only'/'next/headers' 桩让 lib/api/server 可导入（cookies 桩返固定 token）。
 *
 * 断言面（§4-6）：①begin 非 2xx（401 除外）→ 恰好一次 POST :id/abandon；②abandon 非 2xx → redirect
 * 仍带原 begin 错误码（不阻塞·不重试）；③402 壳覆盖（码面不变 + isInterviewEnterable('abandoned')=false
 * 列表「已结束」口径）；④不重试（带码 redirect 必达一次）。外加 F2 行为面（reused 透传）与成功主链零改。
 *   pnpm -C apps/web exec tsx test/interviews-actions.proof.ts   （= prove:interviews-actions）
 */
import { register } from 'node:module';

register('./f5-hooks.mjs', import.meta.url);

// register() 只影响其后的模块加载：actions.ts（及其依赖的 server-only/next/*）必须动态导入。
const { startInterviewAction, restartInterviewAction } = await import('../app/interviews/actions.ts');
const { isInterviewEnterable } = await import('../lib/interview/progress.ts');

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };
const section = (t: string) => console.log(`\n──────── ${t} ────────`);

type Call = { method: string; url: string; headers: Record<string, string> | undefined; body: unknown };
interface Redirected { digest: string; url: string }

function digestUrl(digest: string | undefined): string {
  const marker = 'NEXT_REDIRECT;replace;';
  if (!digest || !digest.startsWith(marker)) throw new Error(`not_a_redirect_digest:${digest}`);
  const rest = digest.slice(marker.length);
  return rest.slice(0, rest.indexOf(';'));   // digest 形=NEXT_REDIRECT;replace;<url>;307; → 取到下一个 ';' 为止
}

/** fetch spy：按脚本逐次应答（命中 method+后缀匹配），记录全部调用。 */
function installFetchSpy(script: Array<{ match: (c: { method: string; url: string }) => boolean; status: number; body?: unknown }>) {
  const calls: Call[] = [];
  const scripted = globalThis.fetch;
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = String(init?.method ?? 'GET').toUpperCase();
    const call: Call = { method, url, headers: init?.headers as Record<string, string> | undefined, body: init?.body };
    calls.push(call);
    const hit = script.find((s) => s.match({ method, url }));
    if (!hit) throw new Error(`unexpected_fetch:${method}:${url}`);
    return new Response(JSON.stringify(hit.body ?? {}), {
      status: hit.status,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
  return {
    calls,
    count: (method: string, suffix: string) => calls.filter((c) => c.method === method && c.url.endsWith(suffix)).length,
    restore() { globalThis.fetch = scripted; },
  };
}

async function run(name: string, fn: () => Promise<void>) {
  section(name);
  try { await fn(); } catch (e) { console.error(e); A(`${name}（执行异常）`, false); }
}

const form = (resumeId: string, priorId?: string) => {
  const fd = new FormData();
  fd.set('resumeId', resumeId);
  if (priorId) fd.set('priorInterviewId', priorId);
  return fd;
};
const API = 'http://localhost:8787';

async function main() {
  const IV = 'iv-f5-shell-1';
  const resumeId = 'res-f5-1';

  await run('① begin 非 2xx → 恰好一次 POST :id/abandon 回收空壳 → 带原码 redirect（F5①）', async () => {
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: IV, reused: false } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/begin`, status: 409, body: { error: 'interview_not_active' } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/abandon`, status: 200, body: { status: 'abandoned' } },
    ]);
    try {
      const r: Redirected = await startInterviewAction(form(resumeId)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ digest: (e as Error).digest as string, url: digestUrl((e as Error).digest as string) }));
      A('begin 409 → 恰好一次 POST :id/abandon（fetch spy 调用数=1）', spy.count('POST', `/interview/${IV}/abandon`) === 1);
      A('begin 409 → 带原码 redirect（error=interview_not_active·映射命中不折叠）', r.url === '/interviews?error=interview_not_active');
      A('不重试：begin 恰 1 次·create 恰 1 次（零 retry 循环）', spy.count('POST', `/interview/${IV}/begin`) === 1 && spy.count('POST', '/interview') === 1);
    } finally { spy.restore(); }
  });

  await run('② abandon 非 2xx → 不阻塞：redirect 仍带原 begin 错误码（best-effort 兑现·F5②）', async () => {
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: IV, reused: false } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/begin`, status: 503, body: { error: 'public_preview_read_only' } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/abandon`, status: 500, body: { error: 'boom' } },
    ]);
    try {
      const r: Redirected = await startInterviewAction(form(resumeId)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ url: digestUrl((e as Error).digest as string) }));
      A('abandon 500 → 不重试（abandon 恰 1 次）', spy.count('POST', `/interview/${IV}/abandon`) === 1);
      A('abandon 500 → redirect 仍带原 begin 码（error=public_preview_read_only）', r.url === '/interviews?error=public_preview_read_only');
    } finally { spy.restore(); }
  });

  await run('③ 402 壳覆盖：create 落壳 → begin 402 → abandon → 码面不变 credits_unavailable（F5③）', async () => {
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: IV, reused: false } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/begin`, status: 402, body: { error: 'insufficient_entitlement' } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/abandon`, status: 200, body: { status: 'abandoned' } },
    ]);
    try {
      const r: Redirected = await startInterviewAction(form(resumeId)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ url: digestUrl((e as Error).digest as string) }));
      A('begin 402 → 恰好一次 POST :id/abandon（空壳回收）', spy.count('POST', `/interview/${IV}/abandon`) === 1);
      A('402 分支码面不变（redirect error=credits_unavailable）', r.url === '/interviews?error=credits_unavailable');
      A('回收后壳口径=已结束（isInterviewEnterable("abandoned")===false·列表不显「进入 →」）',
        isInterviewEnterable('abandoned') === false && isInterviewEnterable('created') === true);
    } finally { spy.restore(); }
  });

  await run('④ 401 跳登录除外：零 abandon（不回收他人会话语义·F5① 例外臂）', async () => {
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: IV, reused: false } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/begin`, status: 401, body: {} },
    ]);
    try {
      const r: Redirected = await startInterviewAction(form(resumeId)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ url: digestUrl((e as Error).digest as string) }));
      A('begin 401 → 跳登录（login?expired=1）且零 abandon', r.url === '/login?expired=1' && spy.count('POST', `/interview/${IV}/abandon`) === 0);
    } finally { spy.restore(); }
  });

  await run('④b 成功主链零改：begin 2xx → 直接进会话·零 abandon（reused=false byte 级不变）', async () => {
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: IV, reused: false } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/begin`, status: 200, body: { accepted: true, jobId: 'job-1' } },
    ]);
    try {
      const r: Redirected = await startInterviewAction(form(resumeId)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ url: digestUrl((e as Error).digest as string) }));
      A('begin 2xx → redirect /interview/:id（不回列表·零 abandon）', r.url === `/interview/${IV}` && spy.count('POST', `/interview/${IV}/abandon`) === 0);
    } finally { spy.restore(); }
  });

  await run('F2 行为面：create reused=true → 不盲 begin，透传 ?reused=<id> 回列表页', async () => {
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: IV, reused: true } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/begin`, status: 200, body: { accepted: true } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/abandon`, status: 200, body: {} },
    ]);
    try {
      const r: Redirected = await startInterviewAction(form(resumeId)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ url: digestUrl((e as Error).digest as string) }));
      A('reused=true → redirect /interviews?reused=<id>（选择面必达）', r.url === `/interviews?reused=${IV}`);
      A('reused=true → 不盲 begin·不误 abandon（零调用，交用户二选一）',
        spy.count('POST', `/interview/${IV}/begin`) === 0 && spy.count('POST', `/interview/${IV}/abandon`) === 0);
    } finally { spy.restore(); }
  });

  await run('F2 出口②「放弃后重来」：abandon 成功 → 重跑 create+begin 全新会话', async () => {
    const NEW = 'iv-f5-new-1';
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/abandon`, status: 200, body: { status: 'abandoned' } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: NEW, reused: false } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${NEW}/begin`, status: 200, body: { accepted: true } },
    ]);
    try {
      const r: Redirected = await restartInterviewAction(form(resumeId, IV)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ url: digestUrl((e as Error).digest as string) }));
      A('先 abandon 旧会话（恰 1 次）', spy.count('POST', `/interview/${IV}/abandon`) === 1);
      A('重跑 create+begin → redirect /interview/<新id>', r.url === `/interview/${NEW}` && spy.count('POST', `/interview/${NEW}/begin`) === 1);
    } finally { spy.restore(); }
  });

  await run('F2 出口②失败臂：abandon 非 2xx → 放弃未发生不重跑（回列表带码）', async () => {
    const spy = installFetchSpy([
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview/${IV}/abandon`, status: 409, body: { error: 'interview_not_active' } },
      { match: (c) => c.method === 'POST' && c.url === `${API}/interview`, status: 200, body: { interviewId: 'iv-should-not-happen', reused: false } },
    ]);
    try {
      const r: Redirected = await restartInterviewAction(form(resumeId, IV)).then(() => { throw new Error('expected_redirect'); }, (e) => ({ url: digestUrl((e as Error).digest as string) }));
      A('abandon 409 → 不重跑 create（create 零调用）', spy.count('POST', '/interview') === 0);
      A('abandon 409 → 带原码 redirect（error=interview_not_active）', r.url === '/interviews?error=interview_not_active');
    } finally { spy.restore(); }
  });

  console.log(`\n${failures === 0 ? '✓ FENCE-REFLOW F5/F2 interviews-actions 全部通过' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(1); });
