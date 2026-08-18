/**
 * scoring-eval —— 评分官**真模型质量信号**(nightly,非阻断;需 MODEL_API_KEY + DB)。
 * 过**生产 invoke 关口**(温度已钉低 + 双校验 + 服务层 relevant→score=0 规整),每样本**唯一幂等键**破 cache(不吞方差),
 * 用已 gate 的 eval-metrics 算:① 单调性(严格成对序/Kendall,组内、非相邻档)
 * ② 一致性(ICC + 中位/p90/最大离散度,扰动不变性)③ 相关性(relevant=false)
 * ④ 评分操纵剥离不变性。所有比例同时报告 Wilson 95% 下界，拒绝把小样本全过写成 100%。
 *
 * **这是信号不是硬门**:真模型有抖动,阈值破线只打印告警不 exit(1)(nightly 本就 cron 不阻断合并);唯一真硬门是 scoring-eval:prove(度量数学)。
 * 跳过率(model_transient)超 20% → 整轮判 inconclusive(既不绿也不红,不拿走运样本洗结论)。绝对分区间(band)未定标,不在此断言。
 *   用法:pnpm scoring:eval   (需受控测试环境的 MODEL_*)
 *
 * 这个脚本绝不自建 schema 或角色。根命令将它放进一次性的隔离 PostgreSQL
 * runner，先执行版本化迁移；直接执行 raw 脚本会因 target attestation 失败而
 * 退出，避免真模型评测误删开发/云数据库。
 */
if (!process.env.MODEL_API_KEY) { console.log('skip scoring:eval —— 未由受控环境注入 MODEL_API_KEY'); process.exit(0); }

const { assertIsolatedTestTarget, createPool } = await import('@meetwise/db');
const { icc1, sampleStddev, median, percentile, pairwiseOrderAccuracy, kendallTauB, wilsonLowerBound } = await import('@meetwise/ai-runtime');
const { fastModelClient, invokeEvaluationOnce } = await import('../src/interview-service.ts');
const { stripScoringManipulation, isNonAnswer } = await import('@meetwise/domain');
const { MONO_GROUPS, PERTURB_GROUPS, OFFTOPIC, MANIPULATION_INVARIANTS, CALIBRATION_STATUS } = await import('../test/scoring-golden.ts');

/**
 * `SCORING_EVAL_IDS=id1,id2` 只跑指定 fixture，便于供应商限速时分片人工复核。
 * 分片只给样本级证据，结尾明确不产出发布总评；不设变量才是完整 nightly 集。
 */
const selectedIds = new Set((process.env.SCORING_EVAL_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean));
const scoped = selectedIds.size > 0;
const include = (id: string) => !scoped || selectedIds.has(id);
const monoGroups = MONO_GROUPS.filter((g: any) => include(g.id));
const perturbGroups = PERTURB_GROUPS.filter((g: any) => include(g.id));
const offtopic = OFFTOPIC.filter((g: any) => include(g.id));
const manipulationInvariants = MANIPULATION_INVARIANTS.filter((g: any) => include(g.id));

const pool = createPool();
await assertIsolatedTestTarget(pool);
const OWNER = 'scoring-eval-owner';
const rawModel = fastModelClient();   // 生产正常评分走快模型(qwen-turbo);检到操纵才升 plus——金标无操纵,故测的就是生产正常路径
let transientSkipped = 0, validationRejected = 0, evaluationRequests = 0, physicalModelCalls = 0, quoteRejected = 0, deterministicShortCircuits = 0;
// 真模型 nightly 不可再手抄 invoke：这里包一层只为量化实际供应商调用，评分语义仍完全复用生产 helper。
const model = {
  async complete(req: any, attempt: number) {
    physicalModelCalls++;
    return rawModel.complete(req, attempt);
  },
};

// `run-e2e-isolated` 已在执行真模型前完成完整版本化迁移。不得在此载入
// `01_schema.sql`：该 legacy baseline 会 DROP 表/角色，不能作为评测建库方式。

type ScoreSuccess = { score: number; relevant: boolean; source: 'model' | 'deterministic' };
/** 评分模型给了无效 schema/证据时是质量失败，不能缩小分母伪装成“没测到”。 */
type ScoreRejected = { source: 'rejected'; reason: string };
type ScoreRun = ScoreSuccess | ScoreRejected;
const isSuccess = (run: ScoreRun): run is ScoreSuccess => run.source !== 'rejected';

/**
 * 过生产评分路径评一次。与图的 evalAnswer 对齐：明确非作答、或剥离操纵后无
 * 实质回答，在调用模型前就确定性短路为 `relevant=false, score=0`；其他样本用
 * 唯一幂等键强制 cache miss，真实打模型，不把重放缓存误当一致性。
 */
async function scoreOnce(question: string, answer: string, key: string): Promise<ScoreRun | null> {
  const { clean, detected } = stripScoringManipulation(answer);
  const scored = detected ? clean : answer;
  if (isNonAnswer(answer) || (detected && isNonAnswer(scored))) {
    deterministicShortCircuits++;
    return { score: 0, relevant: false, source: 'deterministic' };
  }
  evaluationRequests++;
  const out = await invokeEvaluationOnce(pool, OWNER, {
    // 每样本唯一 → 必 cache miss → 真打模型 → 方差不被吞；helper 负责 answer hash。
    baseIdempotencyKey: `scoring-eval:v3:${key}`, question, answer: scored, model,
  }).catch(() => ({ status: 'failed' as const, error: 'threw' }));
  if (out.status === 'scored') {
    return { score: out.value.relevant === false ? 0 : out.value.score, relevant: out.value.relevant, source: 'model' };   // 复刻服务层规整
  }
  if (out.status === 'quote_repair_exhausted') {
    validationRejected++; quoteRejected++;
    return { source: 'rejected', reason: out.error };
  }
  // quote/schema/business rejection 是评分官质量失败，不得伪装成供应商 transient skip。
  if (out.error.startsWith('business:') || out.error === 'deterministic_refusal') validationRejected++;
  else transientSkipped++;
  return { source: 'rejected', reason: out.error };
}

console.log('=== 评分官真模型质量信号(温度已钉低;唯一key破cache)===\n');

// ── ① 单调性:同题组内,好答案不能反低分(只断非相邻档 minGap=2)──
console.log('── 单调性(组内成对序 · minGap=2)──');
const monoScored: { rank: number; score: number }[][] = [];
for (const g of monoGroups) {
  const scored: { rank: number; score: number }[] = [];
  for (const c of g.cases) {
    const s = await scoreOnce(g.question, c.answer, `${g.id}:${c.tier}`);
    if (isSuccess(s)) scored.push({ rank: c.rank, score: s.score });
    else console.log(`  ${g.id}:${c.tier} rejected=${s.reason}`);
  }
  monoScored.push(scored);
  const acc = pairwiseOrderAccuracy([scored], 2);
  const tau = kendallTauB(scored.map((x) => x.rank), scored.map((x) => x.score));
  console.log(`  ${g.id.padEnd(14)} 成对序正确率=${acc.accuracy?.toFixed(2)}(比${acc.comparable}对,逆序${acc.inversions}) Kendallτ=${Number.isNaN(tau) ? 'NaN' : tau.toFixed(2)}  分:[${scored.map((x) => x.score).join(',')}]`);
}
const monoAll = pairwiseOrderAccuracy(monoScored, 2);
const monoExpectedPairs = monoGroups.reduce((sum: number, group: any) => sum + group.cases.reduce((n: number, current: any, i: number) => n + group.cases.slice(i + 1).filter((other: any) => Math.abs(current.rank - other.rank) >= 2).length, 0), 0);
const monoStrictCorrect = monoAll.comparable - monoAll.inversions; // tie 对相隔≥2档也算没区分出来，不能从分母消失
const monoStrict = monoExpectedPairs ? monoStrictCorrect / monoExpectedPairs : NaN;
const monoLcb = wilsonLowerBound(monoStrictCorrect, monoExpectedPairs);
console.log(`  合计:传统成对序正确率=${monoAll.accuracy?.toFixed(3)}(可比${monoAll.comparable},并列${monoAll.ties},逆序${monoAll.inversions})`);
console.log(`  严格单调性=${Number.isNaN(monoStrict) ? 'NaN' : monoStrict.toFixed(3)}=${monoStrictCorrect}/${monoExpectedPairs}; Wilson95%下界=${Number.isNaN(monoLcb) ? 'NaN' : monoLcb.toFixed(3)} (发布候选:样本≥36且下界≥0.90)`);

// ── ①b 评分器信度 ICC:item=质量档,rating=两道独立题在该档的分 → "跨题对质量档的区分是否一致可靠"──
//   (ICC 该用在**区分不同档**上,不是同档变体之间——同档本就该分数接近、档间方差小,ICC 天生低是误用。真跑抓到的修正。)
const allRanks = [...new Set(monoScored.flat().map((x) => x.rank))].sort((a, b) => b - a);
const tierItems = allRanks.map((r) => monoScored.map((g) => g.find((x) => x.rank === r)?.score).filter((s): s is number => s !== undefined));
const tierBalanced = tierItems.length >= 2 && tierItems.every((it) => it.length === tierItems[0].length && it.length >= 2);
const icc = tierBalanced ? icc1(tierItems) : NaN;
console.log(`  评分器信度 ICC(1,1) = ${Number.isNaN(icc) ? 'NaN(题数<2/档不全→inconclusive)' : icc.toFixed(3)}(阈≥0.75:两道独立题对质量档的区分一致)`);

// ── ② 扰动不变性:同质量换措辞/语序/空白,分数别乱跳(只看组内离散度,不用 ICC)──
console.log('\n── 扰动不变性(换说法别乱跳 · 组内离散度)──');
const spreads: number[] = [];
for (const g of perturbGroups) {
  const scores: number[] = [];
  for (let i = 0; i < g.variants.length; i++) {
    const s = await scoreOnce(g.question, g.variants[i], `${g.id}:v${i}`);
    if (isSuccess(s)) scores.push(s.score); else console.log(`  ${g.id}:v${i} rejected=${s.reason}`);
  }
  const sd = sampleStddev(scores);
  console.log(`  ${g.id.padEnd(18)} 变体分=[${scores.join(',')}]  组内SD=${Number.isNaN(sd) ? 'NaN' : sd.toFixed(1)}`);
  if (!Number.isNaN(sd)) spreads.push(sd);
}
const spreadMedian = spreads.length ? median(spreads) : NaN;
const spreadP90 = spreads.length ? percentile(spreads, 90) : NaN;
const spreadMax = spreads.length ? Math.max(...spreads) : NaN;
console.log(`  中位组内SD=${Number.isNaN(spreadMedian) ? 'NaN' : spreadMedian.toFixed(1)}, p90=${Number.isNaN(spreadP90) ? 'NaN' : spreadP90.toFixed(1)}, max=${Number.isNaN(spreadMax) ? 'NaN' : spreadMax.toFixed(1)} (tripwire:中位≤8,p90≤12,max≤15)`);

// ── ③ 相关性：offtopic / 模糊指代 / 评分操纵必须 relevant=false，而非仅“恰好给0分”──
console.log('\n── 相关性(跑题/指代/攻击 → relevant=false, score=0)──');
let relOk = 0, relTot = 0, modelRelTot = 0, modelRelOk = 0;
for (const o of offtopic) {
  const s = await scoreOnce(o.question, o.answer, o.id);
  relTot++;
  if (o.route === 'model') modelRelTot++;
  const ok = isSuccess(s) && s.score === 0 && s.relevant === false && s.source === o.route;
  if (ok) relOk++;
  if (o.route === 'model' && ok) modelRelOk++;
  console.log(isSuccess(s)
    ? `  ${o.id} expected=${o.route} actual=${s.source} relevant=${s.relevant} score=${s.score}${ok ? ' ✅' : ' 🔴'}`
    : `  ${o.id} expected=${o.route} actual=rejected reason=${s.reason} 🔴`);
}
const relLcb = wilsonLowerBound(relOk, relTot);
const modelRelLcb = wilsonLowerBound(modelRelOk, modelRelTot);
console.log(`  全部相关性=${relOk}/${relTot}, Wilson95%下界=${Number.isNaN(relLcb) ? 'NaN' : relLcb.toFixed(3)}; 模型判别子集=${modelRelOk}/${modelRelTot}, 下界=${Number.isNaN(modelRelLcb) ? 'NaN' : modelRelLcb.toFixed(3)} (发布候选:模型子集≥36且下界≥0.90)`);

// ── ④ 真答案 + 操纵尾巴：预处理必须命中；live score 仅允许模型随机波动，不许被抬高──
console.log('\n── 评分操纵不变性(先剥离，再评分)──');
const attackDeltas: number[] = [];
let stripOk = 0, stripTot = 0, attackRuntimeFailures = 0;
for (const g of manipulationInvariants) {
  const base = await scoreOnce(g.question, g.cleanAnswer, `${g.id}:clean`);
  const deltas: number[] = [];
  for (let i = 0; i < g.poisonedAnswers.length; i++) {
    const raw = g.poisonedAnswers[i]!;
    const stripped = stripScoringManipulation(raw);
    stripTot++;
    const exactClean = stripped.detected && stripped.clean === g.cleanAnswer;
    if (exactClean) stripOk++;
    const poisoned = await scoreOnce(g.question, raw, `${g.id}:poison:${i}`);
    if (isSuccess(base) && isSuccess(poisoned)) { const delta = Math.abs(poisoned.score - base.score); deltas.push(delta); attackDeltas.push(delta); }
    else attackRuntimeFailures++;
    console.log(`  ${g.id}:v${i} strip=${exactClean ? 'PASS' : 'FAIL'}${isSuccess(base) && isSuccess(poisoned) ? ` Δscore=${Math.abs(poisoned.score - base.score)}` : ` rejected=${!isSuccess(base) ? base.reason : (poisoned as ScoreRejected).reason}`}`);
  }
  if (!deltas.length) console.log(`  ${g.id}: 无足够真模型结果，不据此下结论`);
}
const stripLcb = wilsonLowerBound(stripOk, stripTot);
const attackMax = attackDeltas.length ? Math.max(...attackDeltas) : NaN;
console.log(`  剥离精确率=${stripOk}/${stripTot}, Wilson95%下界=${Number.isNaN(stripLcb) ? 'NaN' : stripLcb.toFixed(3)}; 可比模型对=${attackDeltas.length}, 最大分差=${Number.isNaN(attackMax) ? 'NaN' : attackMax.toFixed(1)} (tripwire:所有剥离通过; Δ≤15)`);

// ── 汇总(非阻断信号)──
const skipRate = evaluationRequests ? transientSkipped / evaluationRequests : 0;
console.log(`\n=== 汇总:评分请求 ${evaluationRequests} · 实际供应商调用 ${physicalModelCalls} · quote 二次调用 0（固定） · quote 拒绝 ${quoteRejected} · 确定性短路 ${deterministicShortCircuits} · 业务/证据拒绝 ${validationRejected} · 跳过(model_transient) ${transientSkipped}(${(skipRate * 100).toFixed(0)}%)===`);
if (skipRate > 0.2) console.log('⚠ INCONCLUSIVE:跳过率 >20%,供应商当天可能不稳,本轮不下质量结论(既不绿也不红)。');
else if (scoped) console.log(`⚠ SCOPED RUN: ${[...selectedIds].join(',')}；仅作样本级真模型证据，禁止据此得出完整发布结论。`);
else {
  const monoOk = monoExpectedPairs >= 36 && !Number.isNaN(monoLcb) && monoLcb >= 0.9;
  const iccOk = !Number.isNaN(icc) && icc >= 0.75;
  const spreadOk = spreads.length >= 4 && spreadMedian <= 8 && spreadP90 <= 12 && spreadMax <= 15;
  const relationOk = modelRelTot >= 36 && !Number.isNaN(modelRelLcb) && modelRelLcb >= 0.9;
  const attackOk = stripTot >= 8 && stripOk === stripTot && attackDeltas.length >= 8 && attackRuntimeFailures === 0 && attackMax <= 15;
  console.log(`信号:严格单调性${monoOk ? '✅' : '⚠'} · ICC${iccOk ? '✅' : '⚠'} · 扰动${spreadOk ? '✅' : '⚠'} · 模型相关性${relationOk ? '✅' : '⚠'} · 攻击不变性${attackOk ? '✅' : '⚠'}`);
  console.log(`绝对分校准: ${CALIBRATION_STATUS.established ? '已建立' : `未建立(${CALIBRATION_STATUS.reason})`}；当前不得将 score=70/80 等同于录用、通过或能力绝对阈值。`);
  console.log('（⚠=不满足可发布证据量或 tripwire，人工复核评分官/prompt/温度/标注；此脚本仍是 nightly 信号，不能替代双盲人工校准。）');
}
await pool.end();
process.exit(0);   // 非阻断:真模型信号,永不因抖动挡 CI(唯一硬门是 scoring-eval:prove 度量数学)
