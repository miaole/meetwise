/** 自适应 agent 图端到端证明(脑子接身体):规划→决策→CRAG出题→等答→评估→更新→动态下一步→报告。
 *  fake deps 确定性:并发=弱(30)→被追问;缓存=强(88)。验证"非固定题单"。 pnpm adaptive-graph:prove */
import { MemorySaver, Command } from '@langchain/langgraph';
import { buildAdaptiveInterviewGraph } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

const asked: { competency: string; question: string }[] = [];
const deps = {
  competencies: ['并发', '缓存'], maxTurns: 8,
  competencyKeywords: { 并发: ['并发'], 缓存: ['缓存'] },
  retrieveAndGenerate: async (competency: string, difficulty: number, attempt: number) => attempt === 0
    ? ({ question: `${competency}就是这样对不对?`, sources: ['x'] })          // 诱导坏题 → 反思挡下
    : ({ question: `Q[${competency}@d${difficulty}]`, sources: ['qbank:' + competency] }),  // 重生成好题
  // relevant:true(真实作答路径)——本证明验追问/换题/难度自适应,答案都是 on-topic 真作答(非"答非所问"用例,后者见 worker adaptive-offtopic.proof)。
  assess: async (_q: string, _a: string, competency: string) => competency === '并发' ? { score: 30, evidence: ['含糊'], relevant: true } : { score: 88, evidence: ['清晰'], relevant: true },
};

async function main() {
  const g = buildAdaptiveInterviewGraph(new MemorySaver(), deps);
  const cfg = { configurable: { thread_id: 'adapt-1' } };
  let res: any = await g.invoke({}, cfg);
  let guard = 0;
  while (res.__interrupt__ && guard++ < 20) {
    const iv = res.__interrupt__[0].value;
    asked.push({ competency: iv.competency, question: iv.question });
    // 真实作答(够长、on-topic):避免被新加的"非作答(过短/套话)确定性闸"误判;本证明专注追问/换题/难度自适应。
    res = await g.invoke(new Command({ resume: `针对「${iv.question}」我在项目里是这样做的:先定方案再权衡取舍,踩过坑也复盘了` }), cfg);
  }
  const seq = asked.map((x) => x.competency);
  console.log('  问的能力序列:', JSON.stringify(seq));
  console.log('  问的题:', JSON.stringify(asked.map((x) => x.question)));

  A('动态出题非固定题单:同一弱能力被连续追问(并发出现≥2次)', seq.filter((c) => c === '并发').length >= 2);
  A('追问难度自适应下调(warmup d2 起,弱答 并发 d2→d1)', asked.some((x) => x.question.includes('并发@d2')) && asked.some((x) => x.question.includes('并发@d1')));
  A('弱能力探尽后换题(出现 缓存)', seq.includes('缓存'));
  A('收尾标记 concluded(报告走舱壁,不在图内出)', res.concluded === true);
  A('每题留转写(含分数,可审计)', res.transcript.length === asked.length && res.transcript.every((t: any) => typeof t.score === 'number'));
  A('能力模型驱动(并发被判弱、缓存够强)', res.mind.competencies.find((c: any) => c.name === '缓存').confidence >= 0.7);
  A('反思拦截:诱导坏题没问到候选人(asked 全是重生成的好题,无"对不对")', asked.every((x) => !x.question.includes('对不对')));
  A('反思留痕:坏题被自检挡(转写记录 critique,可审计)', res.transcript.every((t: any) => Array.isArray(t.critique)));

  /* ───── hasHook 端到端(经装配图):高分但有钩子 → 同一能力继续深追(多回合);题型 grounded→fundamental ───── */
  {
    const hookDeps = {
      competencies: [{ name: 'A', core: true }], maxTurns: 8,   // core,cap 3
      retrieveAndGenerate: async (competency: string, difficulty: number, _attempt: number, _turn: number, _facts: string[], kind: string) =>
        ({ question: `Q[${competency}@${kind}@d${difficulty}]`, sources: [] }),
      // 高分(90)但每次 hasHook=true:经图 → ingestAssessment 折进 confidence → 封顶 <0.7 → 继续 probe 同一能力
      assess: async () => ({ score: 90, evidence: ['有可深挖钩子'], relevant: true, hasHook: true }),
    };
    const gh = buildAdaptiveInterviewGraph(new MemorySaver(), hookDeps);
    const cfgh = { configurable: { thread_id: 'hook-1' } };
    const askedH: { competency: string; kind: string }[] = [];
    let rh: any = await gh.invoke({}, cfgh); let gd = 0;
    while (rh.__interrupt__ && gd++ < 10) {
      const iv = rh.__interrupt__[0].value;
      const m = iv.question.match(/Q\[(.+?)@(.+?)@/);
      askedH.push({ competency: m[1], kind: m[2] });
      rh = await gh.invoke(new Command({ resume: '我在项目里这样做并权衡了取舍,还踩过坑复盘了,细节是用了分段+本地缓存' }), cfgh);
    }
    const aProbes = askedH.filter((x) => x.competency === 'A').length;
    A('hasHook 端到端:高分(90)仍被同一能力连续深追(core A 问满 3 次,非 1 次即过)', aProbes === 3);
    A('hasHook 端到端:confidence 被 HOOK_CAP 封顶 <0.7(高分也不算够强)', rh.mind.competencies.find((c: any) => c.name === 'A').confidence < 0.7);
    A('hasHook 端到端:深追题型 grounded→fundamental→scenario(确定性策略,非模型)', JSON.stringify(askedH.map((x) => x.kind)) === JSON.stringify(['grounded', 'fundamental', 'scenario']));

    // 对照:同 deps 但 hasHook=false → 高分 1 次即 resolved 换/收尾(不过钻)
    const noHookDeps = { ...hookDeps, assess: async () => ({ score: 90, evidence: ['答透了'], relevant: true, hasHook: false }) };
    const gn = buildAdaptiveInterviewGraph(new MemorySaver(), noHookDeps);
    const cfgn = { configurable: { thread_id: 'nohook-1' } };
    let rn: any = await gn.invoke({}, cfgn); let gn2 = 0;
    while (rn.__interrupt__ && gn2++ < 10) rn = await gn.invoke(new Command({ resume: '我在项目里这样做并权衡了取舍,踩过坑也复盘了' }), cfgn);
    A('对照 hasHook=false:高分 1 次即够强,A 只问 1 次(不过度追问)', rn.mind.competencies.find((c: any) => c.name === 'A').depthProbed === 1 && rn.concluded === true);
  }

  console.log(`\n${fail === 0 ? '✓ 自适应 agent 图(脑子接身体:动态决策驱动一场真面试)全部通过' : '✗ ' + fail + ' 失败'}`);
  process.exit(fail === 0 ? 0 : 1);
}
main();
