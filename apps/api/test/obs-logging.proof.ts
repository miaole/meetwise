import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * obs-logging.proof — 审计#89 可观测性刀的日志收据门(全本地·live=0·est live=0)。
 * 以子进程 boot 真 HTTP 服务器(obs-logging.runner.ts,带全量 Nest 过滤器/hooks/pino),抓其 stdout
 * 的 pino JSON 行,证明四件事:
 *  R1 访问面:/livez(health 零触,仅作观测样例)200 的请求完成行含 method/url/status/reqId/耗时;
 *  R2 500 面:人为未处理错 → 错误行 level=50 含 reqId(===响应头 x-request-id===客户端送的头)/
 *     method/url(去 query)/err.stack(含 marker);响应体仍 {error:'internal_error'} 零细节不泄堆栈;
 *  R3 Ban 面:全部日志行**不含** authorization 值与请求体内容(请求体/提示词/PII 零入卷);
 *  R4 非 500 不刷屏:401 HttpException 路径无 error 级行(仅 info 访问行),过滤分支保持现状。
 */

const here = dirname(fileURLToPath(import.meta.url));
const READY = '__OBS_PROOF_READY__';
const FIXED_ID = 'obs-proof-fixed-reqid-1';
const AUTH_VALUE = 'Bearer obs-proof-secret-token';
const BODY_MARKER = 'PII_MARKER_q7x9_body_never_logs';

let assertions = 0;
function ok(name: string, cond: boolean) {
  assertions += 1;
  assert.equal(cond, true, name);
}

async function main() {
  const child = spawn(process.execPath, ['--import', '@swc-node/register/esm-register', resolve(here, 'obs-logging.runner.ts')], {
    cwd: resolve(here, '..'),   // apps/api 根:swc-node loader 从 cwd 找 tsconfig.json;--import 裸说明符也从这里的 node_modules 解析
    env: {
      ...process.env,
      NODE_ENV: 'test',
      OCR_ENABLED: '0',
      AUTH_SECRET: 'obs-proof-auth-secret',
      RESUME_ENC_KEY: 'obs-proof-resume-key',
      PAY_PROVIDER_SECRET: 'obs-proof-pay-secret',
      DATABASE_URL: 'postgresql://obs:proof@db.invalid:5432/obs',   // 池惰性连接,本 proof 不触 DB
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const rawLines: string[] = [];
  let stdoutBuf = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk: string) => {
    stdoutBuf += chunk;
    let idx: number;
    while ((idx = stdoutBuf.indexOf('\n')) >= 0) {
      const line = stdoutBuf.slice(0, idx);
      stdoutBuf = stdoutBuf.slice(idx + 1);
      if (line) rawLines.push(line);
      const hit = line.startsWith(READY) ? /port=(\d+)/.exec(line) : null;
      if (hit) ready(Number(hit[1]));
    }
  });
  const stderr: string[] = [];
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk: string) => stderr.push(chunk));

  const port = await new Promise<number>((res, rej) => {
    const timer = setTimeout(() => rej(new Error(`runner not ready in 60s; stderr=${stderr.join('')}`)), 60_000);
    readyHooks.push((p: number) => { clearTimeout(timer); res(p); });
  });
  const base = `http://127.0.0.1:${port}`;

  // ── R1:health 面观测样例(/livez 不读 DB)──
  const live = await fetch(`${base}/livez`, { headers: { 'x-request-id': 'obs-proof-livez-1' } });
  ok('R1 /livez returns 200 (health surface untouched)', live.status === 200);
  const liveReqId = live.headers.get('x-request-id');
  ok('R1 /livez echoes sanitized x-request-id', liveReqId === 'obs-proof-livez-1');

  // ── R2:人为 500(带敏感头 + 敏感体,R3 同时验证 Ban 面)──
  const boom = await fetch(`${base}/__obs-proof-500`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-request-id': FIXED_ID, authorization: AUTH_VALUE },
    body: JSON.stringify({ answer: BODY_MARKER }),
  });
  const boomBody: any = await boom.json();
  ok('R2 synthetic 500 status', boom.status === 500);
  ok('R2 500 envelope is opaque {error:internal_error} (no stack/message leak)', JSON.stringify(boomBody) === JSON.stringify({ error: 'internal_error' }));
  ok('R2 response x-request-id === client-sent id', boom.headers.get('x-request-id') === FIXED_ID);

  // ── R4:非 500 HttpException 不刷 error 级(无 DB:PrincipalGuard 先 fail-closed)──
  const unauth = await fetch(`${base}/profile`, { headers: { 'x-request-id': 'obs-proof-401-1' } });
  ok('R4 unauth GET /profile is 401', unauth.status === 401);
  const unauthReqId = unauth.headers.get('x-request-id');
  ok('R4 401 response carries its own reqId', unauthReqId === 'obs-proof-401-1');

  // 收卷:SIGTERM 优雅关停,再解析全部日志行。
  child.kill('SIGTERM');
  const exitCode: number = await new Promise((res) => child.on('exit', (code) => res(code ?? -1)));
  ok('runner exits cleanly on SIGTERM', exitCode === 0);

  const logs: any[] = [];
  for (const line of rawLines) {
    if (!line.startsWith('{')) continue;
    try { logs.push(JSON.parse(line)); } catch { /* 非 JSON 行忽略 */ }
  }
  ok('pino produced JSON log lines on fd1', logs.length > 0);

  const completedFor = (reqId: string) => logs.find((l) => l.reqId === reqId && l.msg === 'request completed');
  const incomingFor = (reqId: string) => logs.find((l) => l.reqId === reqId && l.msg === 'incoming request');
  const liveLine = completedFor('obs-proof-livez-1');
  const liveIncoming = incomingFor('obs-proof-livez-1');
  ok('R1 completed line for /livez exists', Boolean(liveLine));
  ok('R1 incoming line has method/url', liveIncoming?.req?.method === 'GET' && liveIncoming?.req?.url === '/livez');
  ok('R1 completed line has status/reqId/latency', liveLine?.res?.statusCode === 200 && liveLine?.reqId === 'obs-proof-livez-1' && typeof liveLine?.responseTime === 'number');
  ok('R1 access lines are info level (not error)', liveLine?.level === 30 && liveIncoming?.level === 30);

  const errLine = logs.find((l) => l.level === 50 && l.reqId === FIXED_ID);
  ok('R2 error-level line exists for the 500 with the same reqId', Boolean(errLine));
  ok('R2 error line has method + query-stripped url', errLine?.method === 'POST' && errLine?.url === '/__obs-proof-500');
  ok('R2 error line carries err.stack containing the marker', typeof errLine?.err?.stack === 'string' && errLine.err.stack.includes('obs_proof_marker_e41c') && errLine.err.stack.includes('\n    at '));
  ok('R2 error line carries err.name/message', errLine?.err?.name === 'Error' && typeof errLine?.err?.message === 'string');
  ok('R2 error line msg label = unhandled', errLine?.msg === 'unhandled');
  ok('R2 500 keeps an info request-completed line too', Boolean(completedFor(FIXED_ID)) && completedFor(FIXED_ID)?.res?.statusCode === 500);

  const unauthLine = completedFor('obs-proof-401-1');
  ok('R4 401 still observed at info (not silently dropped)', unauthLine?.res?.statusCode === 401 && unauthLine?.level === 30);
  ok('R4 401 produced no error-level line', !logs.some((l) => l.level === 50 && l.reqId === 'obs-proof-401-1'));

  // ── R3:Ban 面 — 逐行扫描,敏感值零入卷 ──
  const serialized = rawLines.join('\n');
  ok('R3 authorization value never logged', !serialized.includes(AUTH_VALUE) && !serialized.includes('obs-proof-secret-token'));
  ok('R3 request body marker never logged', !serialized.includes(BODY_MARKER));

  // 收据样例(脱敏:剥 time/pid 字段)供交付报告引用。
  const receipt = (l: any) => JSON.stringify({ level: l.level, reqId: l.reqId, msg: l.msg, method: l.method, url: l.url, req: l.req, res: l.res, responseTime: l.responseTime, err: l.err ? { name: l.err.name, message: l.err.message, stack: `${String(l.err.stack).split('\n')[0]}\n    at <trimmed>` } : undefined });
  console.log(`--- log receipt (redacted) ---\naccess: ${receipt(liveLine)}\n500-err: ${receipt(errLine)}`);

  if (exitCode !== 0) console.error(`runner stderr:\n${stderr.join('')}`);
  console.log(`✓ obs-logging: ${assertions} assertions passed (audit #89 receipt; live=0, all local)`);
}

const readyHooks: Array<(port: number) => void> = [];
function ready(port: number) {
  for (const hook of readyHooks.splice(0)) hook(port);
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
