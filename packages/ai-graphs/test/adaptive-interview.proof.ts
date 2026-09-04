/** 自适应 agent 图端到端证明(脑子接身体):规划→决策→CRAG出题→等答→评估→更新→动态下一步→报告。
 *  fake deps 确定性:并发=弱(30)→被追问;缓存=强(88)。验证"非固定题单"。 pnpm adaptive-graph:prove */
import { MemorySaver, Command } from '@langchain/langgraph';
import { DEFAULT_ABSOLUTE_MAX_TURNS } from '@meetwise/domain';
import { buildAdaptiveInterviewGraph, createEphemeralAnswerVault } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const asked: { competency: string; question: string }[] = [];
const assessedAnswers: string[] = [];
const answerVault = createEphemeralAnswerVault();
const rawCheckpointMarker = '__RAW_ANSWER_MUST_NOT_REACH_CHECKPOINT__';
const resumeFactMarker = '__RESUME_FACT_MUST_NOT_REACH_CHECKPOINT__';
const deps = {
  competencies: ['并发', '缓存'], maxTurns: 8,
  competencyKeywords: { 并发: ['并发'], 缓存: ['缓存'] },
  retrieveAndGenerate: async (competency: string, difficulty: number) =>
    ({ question: `Q[${competency}@d${difficulty}]`, sources: ['qbank:' + competency] }),
  // relevant:true(真实作答路径)——本证明验追问/换题/难度自适应,答案都是 on-topic 真作答(非"答非所问"用例,后者见 worker adaptive-offtopic.proof)。
  assess: async (_q: string, answer: string, competency: string) => {
    assessedAnswers.push(answer);
    return competency === '并发' ? { score: 30, evidence: ['含糊'], relevant: true } : { score: 88, evidence: ['清晰'], relevant: true };
  },
  loadAnswer: answerVault.loadAnswer,
};

async function checkpointContains(saver: MemorySaver, cfg: { configurable: { thread_id: string } }, marker: string): Promise<boolean> {
  for await (const tuple of saver.list(cfg)) {
    if (JSON.stringify(tuple).includes(marker)) return true;
  }
  return false;
}

async function main() {
  const saver = new MemorySaver();
  const g = buildAdaptiveInterviewGraph(saver, deps);
  const cfg = { configurable: { thread_id: 'adapt-1' } };
  let res: any = await g.invoke({}, cfg);
  let guard = 0;
  while (res.__interrupt__ && guard++ < 20) {
    const iv = res.__interrupt__[0].value;
    asked.push({ competency: iv.competency, question: iv.question });
    // 真实作答(够长、on-topic):避免被新加的"非作答(过短/套话)确定性闸"误判;本证明专注追问/换题/难度自适应。
    res = await g.invoke(new Command({ resume: answerVault.issue(`针对「${iv.question}」我在项目里是这样做的:先定方案再权衡取舍,踩过坑也复盘了 ${rawCheckpointMarker}`) }), cfg);
  }
  const seq = asked.map((x) => x.competency);
  console.log('  问的能力序列:', JSON.stringify(seq));
  console.log('  问的题:', JSON.stringify(asked.map((x) => x.question)));

  A('动态出题非固定题单:同一弱能力被连续追问(并发出现≥2次)', seq.filter((c) => c === '并发').length >= 2);
  A('追问难度自适应下调(warmup d2 起,弱答 并发 d2→d1)', asked.some((x) => x.question.includes('并发@d2')) && asked.some((x) => x.question.includes('并发@d1')));
  A('弱能力探尽后换题(出现 缓存)', seq.includes('缓存'));
  A('收尾标记 concluded(报告走舱壁,不在图内出)', res.concluded === true);
  A('每题留转写(含分数,可审计)', res.transcript.length === asked.length && res.transcript.every((t: any) => typeof t.score === 'number'));
  A('原始回答只供本轮 assess；完成态 transcript 不复制 answer，submitted 已清空', assessedAnswers.length === asked.length && res.transcript.every((t: any) => !Object.hasOwn(t, 'a')) && res.submitted === null);
  A('原始回答不会进入任一实际历史 checkpoint tuple（不只验证完成态投影）', !await checkpointContains(saver, cfg, rawCheckpointMarker));
  A('能力模型驱动(并发被判弱、缓存够强)', res.mind.competencies.find((c: any) => c.name === '缓存').confidence >= 0.7);
  A('反思留痕:每题都记录确定性自检结果，供事后审计', res.transcript.every((t: any) => Array.isArray(t.critique)));

  // A critique failure used to call the provider with attempt=1/2. It now
  // emits a deterministic same-competency shell and carries the issue forward.
  {
    let calls = 0;
    const fallbackGraph = buildAdaptiveInterviewGraph(new MemorySaver(), {
      competencies: ['并发'], maxTurns: 1,
      competencyKeywords: { 并发: ['并发'] },
      retrieveAndGenerate: async (_competency: string, _difficulty: number, attempt: number) => {
        calls++;
        return { question: attempt === 0 ? '并发就是这样对不对？' : '不应被调用', sources: ['qbank:bad'] };
      },
      assess: async () => ({ score: 88, evidence: ['ok'], relevant: true }),
      loadAnswer: createEphemeralAnswerVault().loadAnswer,
    });
    const result: any = await fallbackGraph.invoke({}, { configurable: { thread_id: 'question-single-dispatch' } });
    const issued = result.__interrupt__[0].value;
    A('坏题自检只调用一次生成 seam，绝不以 attempt=1/2 重发模型', calls === 1);
    A('坏题改为同能力确定性题面且不伪造检索来源', issued.question.includes('并发') && !issued.question.includes('对不对') && result.pending?.sources.length === 0);
  }

  // Resume facts may exist in a runtime dependency, but no graph node is
  // permitted to hand them to a generator that could echo them into a durable
  // pending question/interrupt/transcript. This reproduces the old sink: the
  // dependency echoes its supplied fact only if the graph leaks it.
  {
    const factSaver = new MemorySaver();
    const factGraph = buildAdaptiveInterviewGraph(factSaver, {
      competencies: ['系统设计'], maxTurns: 1, resumeFacts: [resumeFactMarker], resumeProfileAvailable: true,
      retrieveAndGenerate: async (_competency: string, _difficulty: number, _attempt: number, _turn: number, facts: string[]) => ({
        question: facts.includes(resumeFactMarker) ? `泄露 ${resumeFactMarker}` : '请说明一次系统设计中的关键取舍。',
        sources: [],
      }),
      assess: async () => ({ score: 88, evidence: ['ok'], relevant: true }),
      loadAnswer: createEphemeralAnswerVault().loadAnswer,
    });
    const factCfg = { configurable: { thread_id: 'resume-fact-checkpoint-safe' } };
    const factResult: any = await factGraph.invoke({}, factCfg);
    A('简历事实不传给生成 seam，grounded 题面不复述原事实', !factResult.__interrupt__[0].value.question.includes(resumeFactMarker));
    A('简历事实不进入实际 checkpoint tuple/interrupt 历史', !await checkpointContains(factSaver, factCfg, resumeFactMarker));
  }

  // P0 replay barrier: genQuestion checkpoint 在 awaitAnswer 前，resume 绝不能再次调用出题依赖。
  {
    let generated = 0;
    const replayVault = createEphemeralAnswerVault();
    const replay = buildAdaptiveInterviewGraph(new MemorySaver(), {
      competencies: ['一致性'], maxTurns: 1,
      retrieveAndGenerate: async () => { generated++; return { question: 'Q[replay]', sources: [] }; },
      assess: async () => ({ score: 88, evidence: ['ok'], relevant: true }),
      loadAnswer: replayVault.loadAnswer,
    });
    const replayCfg = { configurable: { thread_id: 'replay-safe' } };
    const first: any = await replay.invoke({}, replayCfg);
    const issued = first.__interrupt__[0].value;
    await replay.invoke(new Command({ resume: replayVault.issue('我会先写入再通过幂等键对账，失败后重试') }), replayCfg);
    A('interrupt payload 带 server-issued questionId/stateVersion', /^q-v1-t0-c0$/.test(issued.questionId) && issued.stateVersion === 1);
    A('resume 不重跑 genQuestion(模型生成调用恰 1 次)', generated === 1);
  }

  {
    const capped = buildAdaptiveInterviewGraph(new MemorySaver(), {
      competencies: ['容量'], maxTurns: 999,
      retrieveAndGenerate: async () => ({ question: '容量题', sources: [] }),
      assess: async () => ({ score: 88, evidence: ['ok'], relevant: true }),
      loadAnswer: createEphemeralAnswerVault().loadAnswer,
    });
    const cappedResult: any = await capped.invoke({}, { configurable: { thread_id: 'hard-turn-cap' } });
    A('外部 maxTurns=999 不能无界：软预算夹到绝对杀开关 120（不是产品硬顶 16）',
      cappedResult.mind.maxTurns === DEFAULT_ABSOLUTE_MAX_TURNS && cappedResult.mind.absoluteMaxTurns === DEFAULT_ABSOLUTE_MAX_TURNS);
  }

  /* ───── UC-INT-LENGTH-01 图证明：早停 turn<8 / 深挖 turn>8 / 出处 ───── */
  {
    const skipVault = createEphemeralAnswerVault();
    const skipGraph = buildAdaptiveInterviewGraph(new MemorySaver(), {
      competencies: ['并发', '缓存', '可靠性'],
      retrieveAndGenerate: async (competency) => ({ question: `Q[${competency}]`, sources: [] }),
      assess: async () => ({ score: 50, evidence: ['不应评分'], relevant: true }),
      loadAnswer: skipVault.loadAnswer,
    });
    const skipCfg = { configurable: { thread_id: 'early-weak' } };
    let skipRes: any = await skipGraph.invoke({}, skipCfg);
    let skipGuard = 0;
    while (skipRes.__interrupt__ && skipGuard++ < 20) {
      skipRes = await skipGraph.invoke(new Command({ resume: skipVault.issue('跳过') }), skipCfg);
    }
    A('早停:连续跳过在 turn<8 收尾(early_weak/thrashing)', skipRes.concluded === true && skipRes.mind.turn < 8
      && (skipRes.concludeReason?.code === 'early_weak' || skipRes.concludeReason?.code === 'thrashing'));
    A('早停出处不含答案原文', typeof skipRes.concludeReason?.code === 'string' && !JSON.stringify(skipRes.concludeReason).includes('跳过'));
    A('早停后不再出题(next 空)', !skipRes.__interrupt__);
  }

  {
    const deepVault = createEphemeralAnswerVault();
    const deepGraph = buildAdaptiveInterviewGraph(new MemorySaver(), {
      competencies: [
        { name: 'A', core: true }, { name: 'B', core: true },
        { name: 'C', core: false }, { name: '协作与沟通', behavioral: true },
      ],
      maxTurns: 8,
      retrieveAndGenerate: async (competency) => ({ question: `Q[${competency}]`, sources: [] }),
      assess: async () => ({ score: 95, evidence: ['可深挖钩子'], relevant: true, hasHook: true }),
      loadAnswer: deepVault.loadAnswer,
    });
    const deepCfg = { configurable: { thread_id: 'deep-hook' } };
    let deepRes: any = await deepGraph.invoke({}, deepCfg);
    let deepGuard = 0;
    const askedDeep: string[] = [];
    while (deepRes.__interrupt__ && deepGuard++ < 40) {
      askedDeep.push(deepRes.__interrupt__[0].value.competency);
      deepRes = await deepGraph.invoke(new Command({ resume: deepVault.issue('我在项目里这样做并权衡了取舍,还踩过坑复盘了,细节是分段缓存加限流') }), deepCfg);
    }
    A('深挖:软预算 8 + hasHook → turn>8 且软预算被上调', deepRes.concluded === true && askedDeep.length > 8 && deepRes.mind.turn > 8 && deepRes.mind.maxTurns > 8 && (deepRes.mind.budgetRaises ?? 0) >= 1);
    A('深挖出处存在且不是 safety_ceiling/early_weak', typeof deepRes.concludeReason?.code === 'string' && deepRes.concludeReason.code !== 'early_weak' && deepRes.concludeReason.code !== 'safety_ceiling');
    A('深挖收尾后 transcript 分数不被 conclude 改写', deepRes.transcript.every((t: any) => t.score === 95 || t.score === 0));
  }

  /* ───── hasHook 端到端(经装配图):高分但有钩子 → 同一能力继续深追(多回合);空事实首问不得伪装 grounded ───── */
  {
    const hookVault = createEphemeralAnswerVault();
    const hookDeps = {
      competencies: [{ name: 'A', core: true }], maxTurns: 8,   // core,cap 3
      retrieveAndGenerate: async (competency: string, difficulty: number, _attempt: number, _turn: number, _facts: string[], kind: string) =>
        ({ question: `Q[${competency}@${kind}@d${difficulty}]`, sources: [] }),
      // 高分(90)但每次 hasHook=true:经图 → ingestAssessment 折进 confidence → 封顶 <0.7 → 继续 probe 同一能力
      assess: async () => ({ score: 90, evidence: ['有可深挖钩子'], relevant: true, hasHook: true }),
      loadAnswer: hookVault.loadAnswer,
    };
    const gh = buildAdaptiveInterviewGraph(new MemorySaver(), hookDeps);
    const cfgh = { configurable: { thread_id: 'hook-1' } };
    const askedH: { competency: string; kind: string }[] = [];
    let rh: any = await gh.invoke({}, cfgh); let gd = 0;
    while (rh.__interrupt__ && gd++ < 10) {
      const iv = rh.__interrupt__[0].value;
      const m = iv.question.match(/Q\[(.+?)@(.+?)@/);
      askedH.push({ competency: m[1], kind: m[2] });
      rh = await gh.invoke(new Command({ resume: hookVault.issue('我在项目里这样做并权衡了取舍,还踩过坑复盘了,细节是用了分段+本地缓存') }), cfgh);
    }
    const aProbes = askedH.filter((x) => x.competency === 'A').length;
    A('hasHook 端到端:高分(90)仍被同一能力连续深追(core A 问满 3 次,非 1 次即过)', aProbes === 3);
    A('hasHook 端到端:confidence 被 HOOK_CAP 封顶 <0.7(高分也不算够强)', rh.mind.competencies.find((c: any) => c.name === 'A').confidence < 0.7);
    A('空简历事实:首问在模型前 grounded→fundamental，后续按深度 fundamental→scenario', JSON.stringify(askedH.map((x) => x.kind)) === JSON.stringify(['fundamental', 'fundamental', 'scenario']));

    // 对照:同 deps 但 hasHook=false → 高分 1 次即 resolved 换/收尾(不过钻)
    const noHookVault = createEphemeralAnswerVault();
    const noHookDeps = { ...hookDeps, loadAnswer: noHookVault.loadAnswer, assess: async () => ({ score: 90, evidence: ['答透了'], relevant: true, hasHook: false }) };
    const gn = buildAdaptiveInterviewGraph(new MemorySaver(), noHookDeps);
    const cfgn = { configurable: { thread_id: 'nohook-1' } };
    let rn: any = await gn.invoke({}, cfgn); let gn2 = 0;
    while (rn.__interrupt__ && gn2++ < 10) rn = await gn.invoke(new Command({ resume: noHookVault.issue('我在项目里这样做并权衡了取舍,踩过坑也复盘了') }), cfgn);
    A('对照 hasHook=false:高分 1 次即够强,A 只问 1 次(不过度追问)', rn.mind.competencies.find((c: any) => c.name === 'A').depthProbed === 1 && rn.concluded === true);
  }

  console.log(`\n${fail === 0 ? '✓ 自适应 agent 图(脑子接身体:动态决策驱动一场真面试)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
