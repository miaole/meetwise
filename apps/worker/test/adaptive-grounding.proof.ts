/**
 * TC-INT-02-E2b：首题的候选人经历只能来自解析后的事实，不得由模型“补全”。
 * 这是生产 deps 工厂的确定性契约；真实模型/浏览器回归另行验证完整链路。
 */
import { buildAdaptiveDeps } from '../src/adaptive-interview-service.ts';

let failures = 0;
const assert = (name: string, ok: boolean) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failures++;
};

async function main() {
  let localCalls = 0;
  let modelCalls = 0;
  const deps = buildAdaptiveDeps({
    pool: {} as any,
    owner: 'grounding-owner',
    threadId: 'grounding-thread',
    model: { complete: async () => { modelCalls++; return { ok: false, kind: 'transient' as const }; } } as any,
    competencies: ['缓存与一致性'],
    localRetrieve: async () => { localCalls++; return []; },
    webExplore: async () => [],
  });

  const fact = '负责 Redis 限流与幂等订单改造';
  const grounded = await deps.retrieveAndGenerate('缓存与一致性', 3, 0, 0, [fact], 'grounded');
  assert('接地题逐字引用唯一可用简历事实', grounded.question.includes(`「${fact}」`));
  assert('接地题不产生注入的虚构项目、指标或雇主', !/电商促销|履约时效|增长项目|15%|三年/.test(grounded.question));
  assert('接地题不调用模型、检索或网络，避免模型补全用户经历', modelCalls === 0 && localCalls === 0 && grounded.sources.length === 0);

  const empty = await deps.retrieveAndGenerate('缓存与一致性', 3, 0, 0, [], 'grounded');
  assert('纵深 fallback 在空事实时不声称“简历中提到”', !empty.question.includes('简历中写到') && modelCalls === 0 && localCalls === 0);

  console.log(`\n${failures === 0 ? '✓ 自适应首题事实接地合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();
