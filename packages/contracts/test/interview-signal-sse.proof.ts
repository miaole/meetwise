/**
 * contracts prove:interview-signal-sse — SIGNAL-01 收尾理由 SSE 载荷。
 * 不进 OpenAPI，不是新 REST 写面。pnpm signal-sse-contract:prove
 */
import { InterviewSignalConcludeReason, SessionConcludedPayload, SIGNAL_CONCLUDE_CODES, apiContract } from '../src/index.ts';
import { buildOpenApiDocument } from '../src/openapi.ts';

let n = 0;
function ok(cond: boolean, msg: string) { if (!cond) { console.error('✗', msg); process.exit(1); } n++; }

ok(SIGNAL_CONCLUDE_CODES.join(',') === 'early_weak,thrashing', '契约码只含 early_weak/thrashing');

const good = { concludeReason: { code: 'early_weak' as const, turn: 4, citedCompetencies: ['并发'] } };
ok(SessionConcludedPayload.safeParse(good).success, '合法 early_weak 载荷通过');
ok(SessionConcludedPayload.safeParse({
  concludeReason: { code: 'thrashing', turn: 6, citedCompetencies: ['缓存'] },
}).success, '合法 thrashing 载荷通过');

ok(!InterviewSignalConcludeReason.safeParse({ code: 'coverage_met', turn: 8, citedCompetencies: [] }).success,
  'coverage_met 不是本切片信号码');
ok(!InterviewSignalConcludeReason.safeParse({ code: 'safety_ceiling', turn: 120, citedCompetencies: [] }).success,
  'safety_ceiling 不是本切片信号码');
ok(!InterviewSignalConcludeReason.safeParse({ code: 'early_weak', turn: 4.5, citedCompetencies: [] }).success,
  '非整数 turn 拒绝');
ok(!InterviewSignalConcludeReason.safeParse({ code: 'early_weak', citedCompetencies: [] }).success,
  '缺 turn 拒绝（不补造）');

ok(!SessionConcludedPayload.safeParse({
  concludeReason: { code: 'early_weak', turn: 4, citedCompetencies: [], score: 0 },
}).success, 'strict：concludeReason 带 score 拒绝');
ok(!SessionConcludedPayload.safeParse({
  concludeReason: { code: 'early_weak', turn: 4, citedCompetencies: [], overall: 12, band: 'junior' },
}).success, 'strict：overall/band 拒绝');
ok(!SessionConcludedPayload.safeParse({
  concludeReason: { code: 'early_weak', turn: 4, citedCompetencies: [] },
  overall: 88,
}).success, 'strict：顶层 overall 拒绝');
ok(!SessionConcludedPayload.safeParse({
  concludeReason: { code: 'early_weak', turn: 4, citedCompetencies: [], answer: '明文' },
}).success, 'strict：答案原文拒绝');

const spec = JSON.stringify(buildOpenApiDocument());
ok(!spec.includes('session_concluded'), 'session_concluded 不进 OpenAPI');
ok(!spec.includes('InterviewSignalConcludeReason'), '投影 schema 不进 OpenAPI 名');
ok(!apiContract.some((r) => r.path.includes('session_concluded') || r.id.includes('session_concluded')),
  '无新 REST 路由登记');

console.log(`✓ signal-sse contract ${n} assertions`);
