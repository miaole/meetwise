/** agent 优雅降级证明:出题模型失败(重试耗尽)→ retrieveAndGenerate 返兜底题、不抛错崩面试。 pnpm adaptive-degrade:prove (db:up) */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createPool } from '@meetwise/db';
import { scriptedModelClient, type ModelClient } from '@meetwise/ai-runtime';
import { buildAdaptiveDeps, planCompetencies } from '../src/adaptive-interview-service.ts';

const pool = createPool();
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');
// 模型对 interviewer.ask 无 handler → invoke 重试耗尽 → error
const failingModel: ModelClient = scriptedModelClient({ 'mock-interview.evaluate': () => ({ ok: true, raw: { score: 50, evidence: ['x'] } }) });

async function main() {
  await pool.query(sql('01_schema'));
  const deps = buildAdaptiveDeps({
    pool, owner: 'degA', threadId: 'deg-' + Date.now(), model: failingModel, competencies: ['并发'],
    localRetrieve: async () => [], webExplore: async () => [],
  });
  let threw = false, gen: any = null;
  try { gen = await deps.retrieveAndGenerate('并发', 3, 0, 0, ['限流经历']); } catch { threw = true; }
  A('出题模型失败 → 不抛错(面试不崩)', threw === false);
  A('返回确定性兜底题(含目标能力「并发」,可继续)', !!gen && typeof gen.question === 'string' && gen.question.includes('并发') && gen.question.length > 10);
  A('兜底题无伪造来源(sources 空,诚实)', Array.isArray(gen.sources) && gen.sources.length === 0);

  // 规划路径降级:规划模型失败 → 默认能力集(面试仍可开)
  const noModel = scriptedModelClient({});
  const comps = await planCompetencies(pool, 'degA', 'deg-plan-' + Date.now(), noModel, '后端', ['限流']);
  A('规划失败 → 默认能力集(面试仍可开,不卡在开局)', comps.length >= 1);

  // 评分路径降级:评分模型失败 → 中性分 + 留痕,不抛错
  const deps2 = buildAdaptiveDeps({ pool, owner: 'degA', threadId: 'deg-eval-' + Date.now(), model: noModel, competencies: ['并发'], localRetrieve: async () => [], webExplore: async () => [] });
  let threwE = false, ev: any = null;
  try { ev = await deps2.assess('q', 'a', '并发', 0); } catch { threwE = true; }
  A('评分失败 → 不抛错(面试不崩)', threwE === false);
  A('评分降级给中性分(50)+ 留痕(诚实标记)', !!ev && ev.score === 50 && ev.evidence[0].includes('降级'));

  console.log(`\n${fail === 0 ? '✓ agent 优雅降级(出题失败→兜底题继续,不崩面试)全部通过' : '✗ ' + fail + ' 失败'}`);
  await pool.end(); process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error('✗', e?.message ?? e); process.exit(1); });
