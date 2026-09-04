/**
 * TC-INT-02-E2b：接地首题是批准模板，不得引用简历原文，也不得在失败时发明项目经历。
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
    resumeProfileAvailable: true,
    model: { complete: async () => { modelCalls++; return { ok: false, kind: 'transient' as const }; } } as any,
    competencies: ['缓存与一致性'],
    localRetrieve: async () => { localCalls++; return []; },
    webExplore: async () => [],
  });

  const fact = '负责 Redis 限流与幂等订单改造';
  const grounded = await deps.retrieveAndGenerate('缓存与一致性', 3, 0, 0, [fact], 'grounded');
  assert('接地题是批准模板且 ok', grounded.ok === true && grounded.provenance.origin === 'approved_template');
  assert('接地题只点名能力，不复述简历事实',
    grounded.ok === true && grounded.question.includes('缓存与一致性') && !grounded.question.includes(fact));
  assert('接地题不产生注入的虚构项目、指标或雇主', grounded.ok === true && !/电商促销|履约时效|增长项目|15%|三年/.test(grounded.question));
  assert('接地题不调用模型、检索或网络，避免模型补全用户经历',
    modelCalls === 0 && localCalls === 0 && grounded.ok === true && grounded.sources.length === 0);

  const emptyDeps = buildAdaptiveDeps({
    pool: {} as any, owner: 'grounding-owner', threadId: 'grounding-empty',
    resumeProfileAvailable: false,
    model: { complete: async () => { modelCalls++; return { ok: false, kind: 'transient' as const }; } } as any,
    competencies: ['缓存与一致性'],
    localRetrieve: async () => { localCalls++; return []; },
    webExplore: async () => [],
  });
  const empty = await emptyDeps.retrieveAndGenerate('缓存与一致性', 3, 0, 0, [], 'grounded');
  assert('无画像授权时模板不声称“简历中提到”',
    empty.ok === true && empty.provenance.origin === 'approved_template'
    && !empty.question.includes('简历中写到') && !empty.question.includes('简历中一段') && modelCalls === 0 && localCalls === 0);

  console.log(`\n${failures === 0 ? '✓ 自适应首题事实接地合同全部通过' : `✗ ${failures} 个失败`}`);
  process.exit(failures === 0 ? 0 : 1);
}
void main();
