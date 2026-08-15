/** 系统指标注册表证明(纯):counter/gauge/histogram → Prometheus 文本曝光。 pnpm metrics:prove */
import { createMetrics, registerBaselineMetrics, METRIC } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const m = createMetrics();
m.inc('http_requests_total', { route: '/health', status: '200' });
m.inc('http_requests_total', { route: '/health', status: '200' });
m.inc('http_requests_total', { route: '/interview', status: '500' });
m.observe('http_request_duration_ms', 42, { route: '/interview' });
m.observe('http_request_duration_ms', 380, { route: '/interview' });
m.setGauge('queue_depth', 7, { queue: 'interview_job' });
m.setGauge('circuit_breaker_open', 1, { dep: 'model' });
const out = m.render();
A('counter 累加 + label(/health 200 = 2)', /http_requests_total\{route="\/health",status="200"\} 2/.test(out));
A('counter 多 label 系列(/interview 500 = 1)', /http_requests_total\{route="\/interview",status="500"\} 1/.test(out));
A('histogram 出 _bucket/_sum/_count', out.includes('http_request_duration_ms_bucket') && /http_request_duration_ms_sum\{route="\/interview"\} 422/.test(out) && /http_request_duration_ms_count\{route="\/interview"\} 2/.test(out));
A('histogram le 桶单调(le=50 计入42那条)', /http_request_duration_ms_bucket\{route="\/interview",le="50"\} 1/.test(out));
A('gauge:队列深度 + 熔断态(运维一眼看)', /queue_depth\{queue="interview_job"\} 7/.test(out) && /circuit_breaker_open\{dep="model"\} 1/.test(out));
A('# TYPE 头齐全(Prometheus 合法曝光)', out.includes('# TYPE http_requests_total counter') && out.includes('# TYPE http_request_duration_ms histogram') && out.includes('# TYPE queue_depth gauge'));

// ---- 告警数据源指标(熔断打开 / 退款失败 counter + 队列健康 gauge)---------------------
// 断言:新指标真注册 + 常量名与告警 expr/白名单一致(防漂移)+ Prometheus 文本格式合法。
const m2 = createMetrics();
registerBaselineMetrics(m2);
const base = m2.render();
A('METRIC 常量名与告警 expr/白名单一致(单一真源防漂移)',
  METRIC.circuitBreakerOpen === 'model_circuit_breaker_open_total' && METRIC.refundFailed === 'refund_failed_total' &&
  METRIC.jobsQueued === 'worker_jobs_queued' && METRIC.jobsRunningExpired === 'worker_jobs_running_expired' && METRIC.jobsDead === 'worker_jobs_dead' &&
  METRIC.ragRetrievalTotal === 'rag_retrieval_total' && METRIC.ragCostDecisions === 'rag_cost_decisions_total' &&
  METRIC.ragCostBudgetRemainingRatio === 'rag_cost_budget_remaining_ratio' &&
  METRIC.modelInvocationReconcileInvocations === 'model_invocation_reconcile_invocations_total' &&
  METRIC.modelInvocationReconcileFrozenCosts === 'model_invocation_reconcile_frozen_costs_total');
A('registerBaselineMetrics 预注册熔断/退款 counter 为 0 序列(开机即有序列,告警不空)',
  /model_circuit_breaker_open_total\{dep="model"\} 0/.test(base) && /refund_failed_total 0/.test(base));
m2.inc(METRIC.circuitBreakerOpen, { dep: 'model' });
m2.inc(METRIC.circuitBreakerOpen, { dep: 'model' });
m2.inc(METRIC.refundFailed);
m2.setGauge(METRIC.jobsQueued, 12, { queue: 'interview_job' });
m2.setGauge(METRIC.jobsRunningExpired, 3, { queue: 'report' });
m2.setGauge(METRIC.jobsDead, 1, { queue: 'quiz_job' });
m2.inc(METRIC.ragRetrievalTotal, { outcome: 'budget_exhausted', mode: 'dense' });
m2.inc(METRIC.ragCostDecisions, { decision: 'unknown' });
m2.setGauge(METRIC.ragCostGovernanceEnabled, 1);
m2.setGauge(METRIC.ragCostBudgetRemainingRatio, 0.09);
m2.setGauge(METRIC.ragCostUnknownReservations, 2);
m2.inc(METRIC.modelInvocationReconcileInvocations, { result: 'terminalized' }, 2);
m2.inc(METRIC.modelInvocationReconcileInvocations, { result: 'enumeration_failed' });
m2.inc(METRIC.modelInvocationReconcileInvocations, { result: 'owner_failed' });
m2.inc(METRIC.modelInvocationReconcileFrozenCosts, undefined, 2);
const out2 = m2.render();
A('熔断打开 counter 累加 + dep 低基数标签', /model_circuit_breaker_open_total\{dep="model"\} 2/.test(out2) && /refund_failed_total 1/.test(out2));
A('队列健康 gauge 三系列 + queue 标签(queued/卡住/DLQ)',
  /worker_jobs_queued\{queue="interview_job"\} 12/.test(out2) && /worker_jobs_running_expired\{queue="report"\} 3/.test(out2) && /worker_jobs_dead\{queue="quiz_job"\} 1/.test(out2));
A('新指标 # TYPE 头齐全(counter/gauge 合法曝光)',
  out2.includes('# TYPE model_circuit_breaker_open_total counter') && out2.includes('# TYPE refund_failed_total counter') && out2.includes('# TYPE worker_jobs_queued gauge'));
A('RAG 成本与检索指标使用固定低基数标签，预算/未知结果可直接告警',
  /rag_retrieval_total\{outcome="budget_exhausted",mode="dense"\} 1/.test(out2)
  && /rag_cost_decisions_total\{decision="unknown"\} 1/.test(out2)
  && /rag_cost_budget_remaining_ratio 0.09/.test(out2)
  && /rag_cost_unknown_reservations 2/.test(out2));
A('模型派发后对账只暴露低基数结果与冻结次数，不暴露主体/幂等键/提示词',
  /model_invocation_reconcile_invocations_total\{result="terminalized"\} 2/.test(out2)
  && /model_invocation_reconcile_invocations_total\{result="enumeration_failed"\} 1/.test(out2)
  && /model_invocation_reconcile_invocations_total\{result="owner_failed"\} 1/.test(out2)
  && /model_invocation_reconcile_frozen_costs_total 2/.test(out2));

console.log(`\n${fail === 0 ? '✓ 系统指标注册表(Prometheus 曝光)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
