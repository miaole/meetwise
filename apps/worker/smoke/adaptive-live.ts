/**
 * 自适应 agent **真模型实跑**(手动,需 .env 的 MODEL_*;DB up)。真 qwen 规划+出题(接地共享题库)+评分+自适应决策,Langfuse 一棵树。
 * 我代答(无真候选人)。问题/评分/决策全真。  pnpm adaptive:live
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { MemorySaver, Command } from '@langchain/langgraph';
import { createPool, asPrincipal, annSearch } from '@meetwise/db';
import { openAICompatibleClient, dashscopeEmbedder, setTracer, langfuseTracer, httpSpanTransport } from '@meetwise/ai-runtime';
import { buildAdaptiveInterviewGraph } from '@meetwise/ai-graphs';
import { ingestQbank } from '../src/qbank-ingest.ts';
import { QBANK_SEED } from '../src/qbank-seed.ts';
import { buildAdaptiveDeps, planCompetencies } from '../src/adaptive-interview-service.ts';

for (const line of readFileSync(fileURLToPath(new URL('../../../.env', import.meta.url)), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/); if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const pool = createPool();
const sql = (f: string) => readFileSync(fileURLToPath(new URL(`../../../packages/db/sql/${f}.sql`, import.meta.url)), 'utf8');
const OWNER = 'liveAgent', TID = 'adaptlive-' + Date.now();
const model = openAICompatibleClient();
const emb = dashscopeEmbedder();
const myAnswers = [
  '库存扣减我用 Redis Hash 存商品库存,扣减用 Lua 脚本把 库存校验+扣减+写流水 做成原子操作,避免 GET 再 SET 的竞态;限购用 user:item 维度的计数 key 一并在同一 Lua 里校验,key 按 sku 粒度命名带版本号;高并发下 EVAL 慢通常是大 key 或脚本里 O(n) 操作,我会用 slowlog 定位,把热点 sku 拆分或预热,必要时分片',
  '缓存击穿用互斥锁或逻辑过期续约,只让一个线程回源;穿透用布隆过滤器加空值短缓存挡住不存在的 key;雪崩用过期时间加随机抖动加多级缓存加熔断;一致性我用 cache-aside 先更库再删缓存,配合延迟双删和 binlog 订阅兜底,强一致场景才上分布式锁',
  '分布式锁我用 SET key uuid NX PX,value 放唯一 uuid 防误删,释放用 Lua 校验 uuid 再 DEL 保证原子;锁未释放阻塞那次我是从监控发现 P99 飙升定位到锁等待,加了看门狗自动续期 + 业务幂等兜底;Redlock 在多 master 漂移时才考虑,单实例 + 续期 + 幂等多数场景够用',
  '限流我用滑动窗口避免固定窗口的边界突刺:用 Redis ZSet 存请求时间戳,每次清理窗口外的再统计窗口内计数;边界踩点问题就是固定窗口才有,滑动窗口或令牌桶能平滑;迟到日志我按事件时间加水位线容忍一定乱序',
  'MySQL 慢查询我先 EXPLAIN 看是否走索引、扫描行数,索引失效常见于隐式类型转换、函数包列、最左前缀不满足、or 连接;优化加合适联合索引、覆盖索引避免回表、改写 SQL;高并发一致性用合适隔离级别加间隙锁防幻读,或乐观锁版本号,读多写少上读写分离',
];

async function main() {
  for (const f of ['01_schema', '06_retrieval']) await pool.query(sql(f));
  let lf: any = null; if (process.env.LANGFUSE_PUBLIC_KEY) { lf = langfuseTracer(httpSpanTransport()); setTracer(lf); console.log('Langfuse on → session', TID); }

  console.log('① 真 embedder 灌共享题库...');
  const n = await ingestQbank(pool, QBANK_SEED, emb);
  console.log(`   灌入 ${n} 题`);

  console.log('② 规划官(真 qwen)据简历定能力...');
  const comps = await planCompetencies(pool, OWNER, TID, model, '后端工程师', ['负责限流改造,Redis 计数器+滑动窗口', '熟悉缓存、分布式锁、MySQL']);
  console.log('   目标能力规格(core/behavioral):', JSON.stringify(comps));

  const localRetrieve = async (q: string) => {
    const [v] = await emb.embed([q]);
    const hits = await asPrincipal(pool, OWNER, (c) => annSearch(c, OWNER, 'qbank', v, 5));
    return hits.map((h) => ({ ref: h.refId, score: Math.max(0, 1 - h.distance) }));
  };
  const deps = buildAdaptiveDeps({ pool, owner: OWNER, threadId: TID, model, competencies: comps, localRetrieve, webExplore: async () => [] });
  const g = buildAdaptiveInterviewGraph(new MemorySaver(), { ...deps, maxTurns: 14 });   // 放宽预算,跑到深追(fundamental/scenario)+ 行为槽,展示题型全貌
  const cfg = { configurable: { thread_id: TID } };

  // 候选人由真模型扮演(无真人;面试官 agent 全真)——据**实际问到的题**作答,确保 on-topic、有"可深挖钩子",
  // 才能真实触发"硬题继续追问同一能力"的多回合深挖 + 深追题型(fundamental/scenario)。
  async function candidateAnswer(question: string, kind: string): Promise<string> {
    const persona = kind === 'behavioral'
      ? '你是资深后端工程师候选人,回答一道行为/软技能题。用一段真实亲身经历作答(冲突/压力/协作/失败复盘),有反思、不堆技术细节,120-220字。'
      : '你是资深后端工程师候选人,回答一道技术面试题。结合具体做法、关键取舍与踩过的坑作答,留一个值得继续深挖的技术细节,简洁有料,140-240字。';
    const r = await model.complete({ service: 'smoke.candidate', system: `${persona} 只返回 JSON: {"answer":"你的回答"}`, userData: `面试题:${question}` }, 0);
    const a = (r as any)?.raw?.answer;
    return r.ok && typeof a === 'string' && a.length > 10 ? a : myAnswers[0];   // 模型抖动 → 退回固定答案(不卡 smoke)
  }

  console.log('③ 真自适应面试回合(qwen 出题 + 评分 + 决策;题型由确定性策略定):');
  let res: any = await g.invoke({}, cfg); let i = 0;
  const seen: { competency: string; kind: string; q: string; score: number; outcome: string }[] = [];
  while (res.__interrupt__ && i < 14) {
    const iv = res.__interrupt__[0].value;
    const ans = await candidateAnswer(iv.question, iv.kind);   // 真模型据实际题作答(on-topic)
    console.log(`\n  Q${i + 1} [能力=${iv.competency} | 题型=${iv.kind}]: ${iv.question}`);
    console.log(`  A${i + 1}: ${ans.slice(0, 60)}...`);
    res = await g.invoke(new Command({ resume: ans }), cfg); i++;
    const last = res.transcript?.slice(-1)[0];
    if (last) { console.log(`  → 评分 ${last.score} | relevant ${last.relevant} | outcome ${last.outcome} | 来源 ${JSON.stringify(last.sources)}`); seen.push({ competency: iv.competency, kind: iv.kind, q: iv.question, score: last.score, outcome: last.outcome }); }
  }
  console.log(`\n④ 收尾:concluded=${res.concluded}, 共 ${res.transcript.length} 题`);
  console.log('   能力模型:', JSON.stringify(res.mind.competencies.map((c: any) => ({ [c.name]: c.confidence.toFixed(2) }))));
  // ⑤ 旗舰验收:题型多样(非全 grounded)+ 同能力多回合深挖
  const kinds = [...new Set(seen.map((s) => s.kind))];
  const multiDig = [...new Set(seen.map((s) => s.competency))].filter((c) => seen.filter((s) => s.competency === c).length >= 2);
  console.log('\n⑤ 旗舰验收:');
  console.log('   出现的题型:', JSON.stringify(kinds), kinds.length > 1 ? '✓ 非全 grounded(题型有变化)' : '✗ 题型单一');
  console.log('   多回合深挖的能力(同能力≥2题):', JSON.stringify(multiDig), multiDig.length ? '✓ 硬问题多回合讨论' : '(本场无连续深挖)');
  const fundamentalQs = seen.filter((s) => s.kind === 'fundamental').map((s) => s.q);
  const behavioralQs = seen.filter((s) => s.kind === 'behavioral').map((s) => s.q);
  console.log('   fundamental(非简历/通用原理)题:', JSON.stringify(fundamentalQs));
  console.log('   behavioral(软技能)题:', JSON.stringify(behavioralQs));

  // ⑥ 题目质量(v4 修:一轮一问 + 题型长度)。子问题数 = 问号数 ∪ "(1)(2)"/"1)"/"1." 分点数;一轮应 ≤1 核心问。
  const LEN: Record<string, [number, number]> = { fundamental: [20, 150], behavioral: [25, 120], grounded: [40, 160], scenario: [60, 220] };
  const subQ = (q: string) => {
    const marks = (q.match(/[?？]/g) ?? []).length;
    const numbered = (q.match(/[(（]\s*\d+\s*[)）]|(?:^|[；;。\s])\d+[.)、]/g) ?? []).length;
    return Math.max(marks, numbered);   // 取问号与分点的较大者当"塞了几个子问"
  };
  const bad = seen.map((s) => ({ kind: s.kind, len: [...s.q].length, sub: subQ(s.q), q: s.q }))
    .filter((x) => x.sub > 1 || x.len > (LEN[x.kind]?.[1] ?? 200));
  const sample = seen.slice(0, 6).map((s) => `[${s.kind}|${[...s.q].length}字|${subQ(s.q)}问] ${s.q.slice(0, 50)}…`);
  console.log('\n⑥ 题目质量(一轮一问 + 题型长度):');
  console.log('   样例:\n     ' + sample.join('\n     '));
  console.log(`   子问题数>1 或 超题型长度上限 的题: ${bad.length}/${seen.length}`,
    bad.length === 0 ? '✓ 每题单点聚焦、长度合规' : '✗ 仍有堆叠/超长:\n     ' + bad.map((b) => `[${b.kind}|${b.len}字|${b.sub}问] ${b.q.slice(0, 60)}…`).join('\n     '));

  if (lf) { await lf.flush(); }   // 退出前刷,确保落地
  if (process.env.LANGFUSE_PUBLIC_KEY) console.log(`\n去 Langfuse 看 session=${TID}(一棵树:plan/ask/eval 各 generation)`);
  await pool.end();
}
main().catch((e) => { console.error('✗', e?.stack ?? e); process.exit(1); });
