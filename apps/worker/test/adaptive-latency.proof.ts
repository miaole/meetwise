/**
 * 反问延迟优化证明:按任务分模型——**评分/规划走快模型(qwen-turbo),出题走质量模型(qwen-plus)**。
 * 用打标 + 人为时延的 scripted client 跑真 deps 工厂(经 invoke 关口),断言路由正确 + 报告每轮延迟前后对比。
 * pnpm adaptive-latency:prove (需 db:up)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool } from '@meetwise/db';
import type { ModelClient, ModelResult } from '@meetwise/ai-runtime';
import { buildAdaptiveDeps, planCompetencies } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const QUALITY_MS = 200, FAST_MS = 20;   // 模拟 qwen-plus(慢/质量) vs qwen-turbo(快/约束性任务)
const hits: { tier: 'quality' | 'fast'; service: string }[] = [];
function tagged(tier: 'quality' | 'fast', ms: number): ModelClient {
  const raw: Record<string, () => ModelResult> = {
    'planner.competencies': () => ({ ok: true, raw: { competencies: ['并发', '缓存'] } }),
    'interviewer.ask': () => ({ ok: true, raw: { q: '结合你的限流经历谈谈高并发下如何兼顾吞吐与一致性', refs: [] } }),
    'mock-interview.evaluate': () => ({ ok: true, raw: { score: 80, relevant: true, evidence: ['讲清了'] } }),
  };
  return { async complete(req) { hits.push({ tier, service: req.service }); await sleep(ms); return (raw[req.service] ?? (() => ({ ok: false, kind: 'deterministic' as const })))(); } };
}

async function main() {
  await pool.query(readFileSync(fileURLToPath(new URL('../../../packages/db/sql/01_schema.sql', import.meta.url)), 'utf8'));
  const OWNER = 'latA', TID = 'lat-' + Date.now();
  const quality = tagged('quality', QUALITY_MS), fast = tagged('fast', FAST_MS);

  // 规划走快模型(lifecycle 传 fastModel 进 planCompetencies)
  await planCompetencies(pool, OWNER, TID, fast, '后端工程师', ['限流改造']);
  A('规划官 → 走快模型(约束性任务)', hits.some((h) => h.service === 'planner.competencies' && h.tier === 'fast'));

  const deps = buildAdaptiveDeps({ pool, owner: OWNER, threadId: TID, model: quality, fastModel: fast, competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [] });

  const tAsk = Date.now();
  await deps.retrieveAndGenerate('并发', 3, 0, 0, ['限流改造']);
  const askMs = Date.now() - tAsk;
  A('出题 retrieveAndGenerate → 走**质量模型**(出题质量关键,不降)', hits.some((h) => h.service === 'interviewer.ask' && h.tier === 'quality'));
  A('出题未误走快模型', !hits.some((h) => h.service === 'interviewer.ask' && h.tier === 'fast'));

  const tEval = Date.now();
  const ev = await deps.assess('q', '我用滑动窗口加令牌桶扛住峰值并做了降级', '并发', 0);
  const evalMs = Date.now() - tEval;
  A('评分 assess → 走**快模型**(约束性任务,降延迟)', hits.some((h) => h.service === 'mock-interview.evaluate' && h.tier === 'fast'));
  A('评分未误走质量模型', !hits.some((h) => h.service === 'mock-interview.evaluate' && h.tier === 'quality'));
  A('快模型评分仍给出 relevant(off-topic 判定不受降速影响)', typeof ev.relevant === 'boolean' && ev.relevant === true);

  // 每轮(评分→出题)串行延迟前后对比:before=两步都质量;after=评分降到快模型
  const beforeTurn = QUALITY_MS + QUALITY_MS;   // 旧:assess(质量) + ask(质量)
  const afterTurn = askMs + evalMs;             // 新:ask(质量,实测) + assess(快,实测)
  A(`每轮延迟下降(before≈${beforeTurn}ms 串行两质量打 → after≈${afterTurn}ms,评分降速)`, afterTurn < beforeTurn);
  console.log(`  ↳ 实测:出题(质量)=${askMs}ms,评分(快)=${evalMs}ms;每轮 ${beforeTurn}ms → ${afterTurn}ms(降 ${Math.round((1 - afterTurn / beforeTurn) * 100)}%)`);

  console.log(`\n${fail === 0 ? '✓ 反问延迟优化(评分/规划走快模型、出题留质量模型)路由正确 + 每轮延迟下降' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
