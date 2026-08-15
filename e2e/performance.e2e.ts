/**
 * 隔离本地 API 性能回归门。
 *
 * 它刻意使用真 HTTP、真 Nest API、真 PostgreSQL 和真实密码哈希，而非函数级 mock；
 * worker 保持启动以验证空库启动竞争不会被吞掉。预算只适用于本机回归（见 testing strategy），
 * 绝不能据此宣称线上容量或 SLA。
 */
import { randomUUID } from 'node:crypto';

const BASE = process.env.E2E_BASE ?? 'http://127.0.0.1:8787';
const READ_TOTAL = Number(process.env.PERF_READ_TOTAL ?? 128);
const READ_CONCURRENCY = Number(process.env.PERF_READ_CONCURRENCY ?? 16);
const WRITE_TOTAL = Number(process.env.PERF_WRITE_TOTAL ?? 24);
const WRITE_CONCURRENCY = Number(process.env.PERF_WRITE_CONCURRENCY ?? 4);
const RESUME_TOTAL = Number(process.env.PERF_RESUME_TOTAL ?? 8);
const RESUME_CONCURRENCY = Number(process.env.PERF_RESUME_CONCURRENCY ?? 4);

type Sample = { status: number; ms: number };

const percentile = (values: number[], p: number) => {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return NaN;
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
};

async function concurrent(total: number, concurrency: number, task: (index: number) => Promise<number>): Promise<{ samples: Sample[]; wallMs: number }> {
  let next = 0;
  const samples: Sample[] = [];
  const started = performance.now();
  await Promise.all(Array.from({ length: Math.min(total, concurrency) }, async () => {
    for (;;) {
      const index = next++;
      if (index >= total) return;
      const t0 = performance.now();
      const status = await task(index);
      samples.push({ status, ms: performance.now() - t0 });
    }
  }));
  return { samples, wallMs: performance.now() - started };
}

function summarize(name: string, result: { samples: Sample[]; wallMs: number }) {
  const latencies = result.samples.map((x) => x.ms);
  const non2xx = result.samples.filter((x) => x.status < 200 || x.status >= 300).length;
  const summary = {
    name,
    total: result.samples.length,
    success: result.samples.length - non2xx,
    non2xx,
    wallMs: Number(result.wallMs.toFixed(1)),
    rps: Number((result.samples.length / (result.wallMs / 1000)).toFixed(2)),
    p50Ms: Number(percentile(latencies, 0.5).toFixed(1)),
    p95Ms: Number(percentile(latencies, 0.95).toFixed(1)),
    p99Ms: Number(percentile(latencies, 0.99).toFixed(1)),
    maxMs: Number(Math.max(...latencies).toFixed(1)),
  };
  console.log(`PERF ${JSON.stringify(summary)}`);
  return summary;
}

const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(`performance_gate_failed:${message}`);
  console.log(`✓ ${message}`);
};

async function main() {
  // Liveness 不读数据库：它验证 HTTP server/socket 调度，不能把连接池排队伪装成进程死亡。
  const health = summarize('livez', await concurrent(READ_TOTAL * 2, READ_CONCURRENCY * 2, async () => {
    const r = await fetch(`${BASE}/livez`);
    return r.status;
  }));
  assert(health.non2xx === 0, `livez ${health.total}/${health.total} 为 2xx`);
  assert(health.p95Ms < 500, `livez p95=${health.p95Ms}ms < 500ms (本地回归预算)`);

  // Database-backed public read: not a cached mock and not merely a liveness probe.
  const products = summarize('commerce_products', await concurrent(READ_TOTAL, READ_CONCURRENCY, async () => {
    const r = await fetch(`${BASE}/commerce/products`);
    return r.status;
  }));
  assert(products.non2xx === 0, `commerce/products ${products.total}/${products.total} 为 2xx`);
  assert(products.p95Ms < 1_000, `commerce/products p95=${products.p95Ms}ms < 1000ms (本地回归预算)`);

  // Stateful write path: distinct identities prevent uniqueness collisions from disguising overload as success.
  const tag = randomUUID();
  const signup = summarize('signup', await concurrent(WRITE_TOTAL, WRITE_CONCURRENCY, async (index) => {
    const r = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `perf-${tag}-${index}@x.com`, password: 'strongpw123' }),
    });
    return r.status;
  }));
  assert(signup.non2xx === 0, `signup ${signup.total}/${signup.total} 为 2xx`);
  // Password hashing is deliberately CPU-intensive.  This broad ceiling catches queue starvation/connection leaks
  // without requiring one specific laptop's exact timing.
  assert(signup.p95Ms < 3_000, `signup p95=${signup.p95Ms}ms < 3000ms (4 并发、本地回归预算)`);

  // 真实受保护写路径：每个用户各自注册、同意 PIPL 后，再并发写入不同简历。它覆盖 JWT、RLS 事务、
  // 加密 blob、内容 HMAC、状态迁移和 profile 落库；不能仅以 /health 或注册吞吐代替。
  const resumeTag = randomUUID();
  const identities = await Promise.all(Array.from({ length: RESUME_TOTAL }, async (_, index) => {
    const signupResponse = await fetch(`${BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: `perf-resume-${resumeTag}-${index}@x.com`, password: 'strongpw123' }),
    });
    assert(signupResponse.ok, `resume setup signup index=${index} status=${signupResponse.status}`);
    const { token } = await signupResponse.json() as { token?: string };
    assert(typeof token === 'string' && token.length > 0, `resume setup token index=${index}`);
    const consentResponse = await fetch(`${BASE}/privacy/consent`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ purpose: 'resume_processing' }),
    });
    assert(consentResponse.ok, `resume setup consent index=${index} status=${consentResponse.status}`);
    return token;
  }));
  console.log(`✓ resume setup: ${identities.length}/${RESUME_TOTAL} distinct users registered and consented`);

  const resumes = summarize('resume_ingest', await concurrent(RESUME_TOTAL, RESUME_CONCURRENCY, async (index) => {
    const r = await fetch(`${BASE}/resume`, {
      method: 'POST',
      headers: { authorization: `Bearer ${identities[index]}`, 'content-type': 'application/json' },
      body: JSON.stringify({ text: `性能并发简历 ${resumeTag}-${index}。负责 Redis 限流、幂等写入、事务 outbox 与可观测性治理。` }),
    });
    return r.status;
  }));
  assert(resumes.non2xx === 0, `resume ingest ${resumes.total}/${resumes.total} 为 2xx`);
  assert(resumes.p95Ms < 3_000, `resume ingest p95=${resumes.p95Ms}ms < 3000ms (${RESUME_CONCURRENCY} 并发、本地回归预算)`);

  console.log('✓ performance E2E passed: 真 HTTP/API/PostgreSQL 的读突发、注册写入与受保护简历摄取并发均无 5xx；预算仅作本地回归门。');
}

main().catch((error) => { console.error(error); process.exit(1); });
