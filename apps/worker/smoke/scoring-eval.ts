/**
 * scoring-eval —— 评分官**真模型质量信号**(nightly,非阻断;需 MODEL_API_KEY + DB)。
 * 过**生产 invoke 关口**(温度已钉低 + 双校验 + 服务层 relevant→score=0 规整),每样本**唯一幂等键**破 cache(不吞方差),
 * 用已 gate 的 eval-metrics 算:① 单调性(成对序/Kendall,组内、非相邻档)② 一致性(ICC + 中位离散度,扰动不变性)③ 相关性(offtopic→0)。
 *
 * **这是信号不是硬门**:真模型有抖动,阈值破线只打印告警不 exit(1)(nightly 本就 cron 不阻断合并);唯一真硬门是 scoring-eval:prove(度量数学)。
 * 跳过率(model_transient)超 20% → 整轮判 inconclusive(既不绿也不红,不拿走运样本洗结论)。绝对分区间(band)未定标,不在此断言。
 *   用法:pnpm scoring:eval   (需 .env 的 MODEL_*)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
for (const line of readFileSync(fileURLToPath(new URL('../../../.env', import.meta.url), ), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, '');
}
if (!process.env.MODEL_API_KEY) { console.log('skip scoring:eval —— 未配 MODEL_API_KEY(真模型质量信号只在配 key 的 nightly/手动跑)'); process.exit(0); }

const { createPool, asPrincipal } = await import('@meetwise/db');
const { invoke, promptedModel, icc1, sampleStddev, median, pairwiseOrderAccuracy, kendallTauB } = await import('@meetwise/ai-runtime');
const { fastModelClient, EvalSchema } = await import('../src/interview-service.ts');
const { stripScoringManipulation } = await import('@meetwise/domain');
const { MONO_GROUPS, PERTURB_GROUPS, OFFTOPIC } = await import('../test/scoring-golden.ts');

const pool = createPool();
const OWNER = 'scoring-eval-owner';
const model = fastModelClient();   // 生产正常评分走快模型(qwen-turbo);检到操纵才升 plus——金标无操纵,故测的就是生产正常路径
let skipped = 0, total = 0;

const sql = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8');
await pool.query(sql('../../../packages/db/sql/01_schema.sql'));   // ai_invocation_trace(invoke 落 trace 用)

/** 过生产 invoke 关口评一次,唯一 key 破 cache;返回规整后 score(relevant=false→0),失败返 null(记 skip)。 */
async function scoreOnce(question: string, answer: string, key: string): Promise<number | null> {
  total++;
  const { clean, detected } = stripScoringManipulation(answer);
  const scored = detected ? clean : answer;
  const out = await asPrincipal(pool, OWNER, (c: any) => invoke({
    idempotencyKey: `scoring-eval:${key}`,   // 每样本唯一 → 必 cache miss → 真打模型 → 方差不被吞
    schema: EvalSchema,
    businessValidate: (v: any) => (v.evidence.length === 0 && v.relevant !== false ? 'no_evidence' : null),
    model: promptedModel(model, 'mock-interview.evaluate', { question, answer: scored }),
  }, c, OWNER)).catch(() => ({ error: 'threw' }));
  if ('error' in out) { skipped++; return null; }
  return out.value.relevant === false ? 0 : out.value.score;   // 复刻服务层规整
}

console.log('=== 评分官真模型质量信号(温度已钉低;唯一key破cache)===\n');

// ── ① 单调性:同题组内,好答案不能反低分(只断非相邻档 minGap=2)──
console.log('── 单调性(组内成对序 · minGap=2)──');
const monoScored: { rank: number; score: number }[][] = [];
for (const g of MONO_GROUPS) {
  const scored: { rank: number; score: number }[] = [];
  for (const c of g.cases) { const s = await scoreOnce(g.question, c.answer, `${g.id}:${c.tier}`); if (s !== null) scored.push({ rank: c.rank, score: s }); }
  monoScored.push(scored);
  const acc = pairwiseOrderAccuracy([scored], 2);
  const tau = kendallTauB(scored.map((x) => x.rank), scored.map((x) => x.score));
  console.log(`  ${g.id.padEnd(14)} 成对序正确率=${acc.accuracy?.toFixed(2)}(比${acc.comparable}对,逆序${acc.inversions}) Kendallτ=${Number.isNaN(tau) ? 'NaN' : tau.toFixed(2)}  分:[${scored.map((x) => x.score).join(',')}]`);
}
const monoAll = pairwiseOrderAccuracy(monoScored, 2);
console.log(`  合计:非相邻档成对序正确率 = ${monoAll.accuracy?.toFixed(3)}(阈≥0.90 tripwire;比${monoAll.comparable}对,逆序${monoAll.inversions})`);

// ── ② 一致性:同质量换措辞,分数别乱跳(ICC + 中位离散度)──
console.log('\n── 一致性(扰动不变性 · ICC + 中位离散度)──');
const iccItems: number[][] = [];
const spreads: number[] = [];
for (const g of PERTURB_GROUPS) {
  const scores: number[] = [];
  for (let i = 0; i < g.variants.length; i++) { const s = await scoreOnce(g.question, g.variants[i], `${g.id}:v${i}`); if (s !== null) scores.push(s); }
  const sd = sampleStddev(scores);
  console.log(`  ${g.id.padEnd(18)} 变体分=[${scores.join(',')}]  组内SD=${Number.isNaN(sd) ? 'NaN' : sd.toFixed(1)}`);
  iccItems.push(scores);
  if (!Number.isNaN(sd)) spreads.push(sd);
}
// ICC 需平衡(等变体数);不平衡则 icc1 返 NaN(inconclusive)
const balanced = iccItems.length >= 2 && iccItems.every((it) => it.length === iccItems[0].length && it.length >= 2);
const icc = balanced ? icc1(iccItems) : NaN;
console.log(`  ICC(1,1) = ${Number.isNaN(icc) ? 'NaN(不平衡/样本不足→inconclusive)' : icc.toFixed(3)}(阈≥0.75 tripwire:组内紧+跨档分明) · 中位组内SD = ${spreads.length ? median(spreads).toFixed(1) : 'NaN'}(阈≤8)`);

// ── ③ 相关性:offtopic → 0(红队已覆盖,这里少量回归)──
console.log('\n── 相关性(offtopic → 0)──');
let relOk = 0, relTot = 0;
for (const o of OFFTOPIC) { const s = await scoreOnce(o.question, o.answer, o.id); if (s !== null) { relTot++; if (s === 0) relOk++; console.log(`  ${o.id} score=${s}${s === 0 ? ' ✅' : ' 🔴(应0)'}`); } }

// ── 汇总(非阻断信号)──
const skipRate = total ? skipped / total : 0;
console.log(`\n=== 汇总:${total} 次评分 · 跳过(model_transient) ${skipped}(${(skipRate * 100).toFixed(0)}%)===`);
if (skipRate > 0.2) console.log('⚠ INCONCLUSIVE:跳过率 >20%,供应商当天可能不稳,本轮不下质量结论(既不绿也不红)。');
else {
  const monoOk = !Number.isNaN(monoAll.accuracy) && monoAll.accuracy >= 0.9;
  const iccOk = !Number.isNaN(icc) && icc >= 0.75;
  const spreadOk = spreads.length > 0 && median(spreads) <= 8;
  const relRate = relTot ? relOk / relTot : NaN;
  console.log(`信号:单调性${monoOk ? '✅' : '⚠'} · 一致性ICC${iccOk ? '✅' : '⚠'}/离散${spreadOk ? '✅' : '⚠'} · 相关性${relTot ? (relOk / relTot).toFixed(2) : 'NaN'}${relRate >= 0.95 ? '✅' : '⚠'}`);
  console.log('（⚠=破 tripwire,人工复核评分官/prompt/温度;非阻断:nightly 信号,不 block 合并。band 绝对分区间待产品定标后再加。）');
}
await pool.end();
process.exit(0);   // 非阻断:真模型信号,永不因抖动挡 CI(唯一硬门是 scoring-eval:prove 度量数学)
