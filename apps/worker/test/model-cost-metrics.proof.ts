import { createMetrics, METRIC, setMetrics } from '@meetwise/ai-runtime';
import { refreshModelCostGauges } from '../src/main.ts';

let failures = 0;
const A = (name: string, ok: boolean) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`); if (!ok) failures++; };

async function main() {
  const metrics = createMetrics();
  setMetrics(metrics);
  const disabledPool = {} as any;
  await refreshModelCostGauges(disabledPool, undefined);
  const disabled = metrics.render();
  A('observe/缺 scope 时显式曝光治理关闭，不留下陈旧预算 gauge',
    disabled.includes(`${METRIC.modelCostGovernanceEnabled} 0`)
      && disabled.includes(`${METRIC.modelCostBudgetRemainingRatio} 0`)
      && disabled.includes(`${METRIC.modelCostUnknownReservations} 0`));

  const governedMetrics = createMetrics();
  setMetrics(governedMetrics);
  let requestedScope: unknown;
  const governedPool = {} as any;
  await refreshModelCostGauges(governedPool, 'model-production', async (_pool, scope) => {
    requestedScope = scope;
    return { monthlyLimitMicroCny: 1000, usedMicroCny: 250, unknownCount: 3 };
  });
  const governed = governedMetrics.render();
  A('gauge 查询只带全局 scope，不带用户、请求或提示词', requestedScope === 'model-production');
  A('费用账本 1000/250 正确暴露剩余比例 0.75', governed.includes(`${METRIC.modelCostBudgetRemainingRatio} 0.75`));
  A('未知供应商结果以全局计数 3 暴露，供人工对账告警使用', governed.includes(`${METRIC.modelCostUnknownReservations} 3`));
  A('已启用治理显式曝光为 1', governed.includes(`${METRIC.modelCostGovernanceEnabled} 1`));

  console.log(failures ? `\n✗ ${failures} 项失败` : '\n✓ 模型费用监控 gauge 全部通过');
  process.exit(failures ? 1 : 0);
}
main().catch((error) => { console.error(error); process.exit(1); });
