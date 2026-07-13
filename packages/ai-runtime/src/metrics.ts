/**
 * 系统指标 seam(Prometheus 文本曝光)。覆盖 Langfuse 管不到的那半:HTTP 延迟/错误率、队列积压、熔断态、worker 存活。
 * 10 年依赖纪律:**自建极简注册表藏 seam 后**(counter/histogram/gauge + Prom exposition,~无依赖),
 *   日后压力大了换 prom-client/OTel 只换本文件,api/worker 不动。脱敏同 trace:label 只放低基数维度(route/status/outcome),绝不放 owner/PII/原文。
 */
export type Labels = Record<string, string>;
const HIST_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];   // ms

export interface Metrics {
  inc(name: string, labels?: Labels, by?: number): void;          // counter
  observe(name: string, value: number, labels?: Labels): void;    // histogram(ms)
  setGauge(name: string, value: number, labels?: Labels): void;   // gauge
  render(): string;                                               // Prometheus 文本曝光
}

const keyOf = (labels?: Labels) => labels ? Object.keys(labels).sort().map((k) => `${k}=${JSON.stringify(labels[k])}`).join(',') : '';
const lblStr = (labels?: Labels) => { const e = Object.entries(labels ?? {}); return e.length ? `{${e.map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(',')}}` : ''; };

export function createMetrics(): Metrics {
  const counters = new Map<string, { labels?: Labels; v: number }>();
  const gauges = new Map<string, { labels?: Labels; v: number }>();
  const hists = new Map<string, { labels?: Labels; buckets: number[]; sum: number; count: number }>();
  const id = (name: string, labels?: Labels) => `${name}|${keyOf(labels)}`;

  return {
    inc(name, labels, by = 1) {
      const k = id(name, labels); const c = counters.get(k) ?? { labels, v: 0 }; c.v += by; counters.set(k, c);
    },
    setGauge(name, value, labels) { gauges.set(id(name, labels), { labels, v: value }); },
    observe(name, value, labels) {
      const k = id(name, labels); const h = hists.get(k) ?? { labels, buckets: new Array(HIST_BUCKETS.length).fill(0), sum: 0, count: 0 };
      h.sum += value; h.count += 1;
      for (let i = 0; i < HIST_BUCKETS.length; i++) if (value <= HIST_BUCKETS[i]) h.buckets[i] += 1;
      hists.set(k, h);
    },
    render() {
      const out: string[] = [];
      const types = new Set<string>();
      const typeLine = (name: string, t: string) => { if (!types.has(name)) { out.push(`# TYPE ${name} ${t}`); types.add(name); } };
      for (const { labels, v } of counters.values()) { /* name embedded in key—recover */ }
      // counters
      for (const [k, c] of counters) { const name = k.split('|')[0]; typeLine(name, 'counter'); out.push(`${name}${lblStr(c.labels)} ${c.v}`); }
      for (const [k, g] of gauges) { const name = k.split('|')[0]; typeLine(name, 'gauge'); out.push(`${name}${lblStr(g.labels)} ${g.v}`); }
      for (const [k, h] of hists) {
        const name = k.split('|')[0]; typeLine(name, 'histogram');
        const base = h.labels ?? {};
        let cum = 0;
        for (let i = 0; i < HIST_BUCKETS.length; i++) { cum = h.buckets[i]; out.push(`${name}_bucket${lblStr({ ...base, le: String(HIST_BUCKETS[i]) })} ${cum}`); }
        out.push(`${name}_bucket${lblStr({ ...base, le: '+Inf' })} ${h.count}`);
        out.push(`${name}_sum${lblStr(base)} ${h.sum}`);
        out.push(`${name}_count${lblStr(base)} ${h.count}`);
      }
      return out.join('\n') + '\n';
    },
  };
}

// 进程级单例(组合根注入更佳;此处给默认,api/worker 共用同一进程内实例)
let active: Metrics = createMetrics();
export function setMetrics(m: Metrics): void { active = m; }
export function getMetrics(): Metrics { return active; }

/**
 * 指标名单一真源(emit 点、告警 expr、alerts-lint 白名单三方共用同一常量,防手滑漂移)。
 * 命名遵循 Prometheus 约定:counter 以 _total 收尾;label 低基数(dep/queue),绝不放 owner/PII/原文。
 *   - circuitBreakerOpen:模型关口熔断"打开"次数(counter)——emit 在 circuit-breaker.ts 相位翻到 open 时。
 *   - refundFailed:退款/额度释放失败次数(counter)——emit 点在 commerce 释放失败的 catch(本次任务边界外,见报告"诚实缺口")。
 *   - jobsQueued / jobsRunningExpired / jobsDead:worker 侧队列健康(gauge)——worker 周期从 DB 查全局计数 set(见 worker main.ts)。
 * gauge 是"全局绝对值":多 worker 实例各自查同一 DB 得同值,告警侧用 max() 去重实例视角(切勿 sum,会翻倍)。
 * counter 是"本实例事件数":跨实例告警侧用 sum(increase()) 合并(各实例熔断是不同真实事件)。
 */
export const METRIC = {
  circuitBreakerOpen: 'model_circuit_breaker_open_total',
  refundFailed: 'refund_failed_total',
  jobsQueued: 'worker_jobs_queued',
  jobsRunningExpired: 'worker_jobs_running_expired',
  jobsDead: 'worker_jobs_dead',
} as const;

/**
 * 预注册基线序列为 0:让 Prometheus 一开机即有序列(0 值也可评估/画图),避免"从未 emit=无序列=告警无数据"。
 * counter inc(…, 0) 只建序列不改值。worker 组合根启动时调一次。
 */
export function registerBaselineMetrics(m: Metrics = getMetrics()): void {
  m.inc(METRIC.circuitBreakerOpen, { dep: 'model' }, 0);
  m.inc(METRIC.circuitBreakerOpen, { dep: 'fast_model' }, 0);
  m.inc(METRIC.refundFailed, undefined, 0);
}
