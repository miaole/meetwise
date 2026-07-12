/** 自适应面试大脑证明(纯,确定性):感知→更新能力模型→策略决策(追问/换题/调难度/收尾)。 pnpm adaptive:prove */
import { initMind, ingestAssessment, decideNext, withCurrent, isSkip, isNonAnswer, classifyTurn, markClarify, markUnresolved, clarifyHint } from '../src/index.ts';
let fail = 0; const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

// 三个目标能力,预算 8 轮
let m = initMind(['并发', '系统设计', '数据库'], 8);
A('初始:三能力 confidence=0,难度2(warmup 从 2 起暖场)', m.competencies.length === 3 && m.competencies.every((c) => c.confidence === 0) && m.difficulty === 2);

// 第一步决策:没 current,挑一个 pivot
let act = decideNext(m);
A('开局 → ask/pivot(挑能力开探)', act.kind === 'ask' && act.mode === 'pivot');
const c0 = act.kind === 'ask' ? act.competency : '';
m = withCurrent(m, c0);

// 弱答(score 30)→ 该能力 confidence 低 → 继续追问(probe)+ 难度降
m = ingestAssessment(m, c0, 30, ['含糊,没讲清锁']);
act = decideNext(m);
A('弱答 → 同能力追问(probe deeper)', act.kind === 'ask' && act.mode === 'probe' && act.competency === c0);
A('弱答 → 难度下调(2→1)', m.difficulty === 1);

// 再弱一次(probe 满 MAX_PROBE=2)→ 不再死磕,换能力(pivot)
m = ingestAssessment(m, c0, 35, ['还是没说清']);
act = decideNext(m);
A('追问到上限仍弱 → 换能力(不死磕)', act.kind === 'ask' && act.mode === 'pivot' && act.competency !== c0);

// 强答路线:对一个新能力连续高分 → confidence 上去 → 难度升 + 该能力不再探
let m2 = withCurrent(initMind(['缓存'], 8), '缓存');
m2 = ingestAssessment(m2, '缓存', 90, ['讲清了穿透/雪崩/击穿']);
A('强答 → 难度上调(2→3)', m2.difficulty === 3);
A('强答一次即 confidence≥0.7(够强)', m2.competencies[0].confidence >= 0.7);
act = decideNext(m2);
A('唯一能力已够强 → 收尾(all_resolved)', act.kind === 'conclude' && act.reason === 'all_resolved');

// 预算耗尽 → 收尾
let m3 = initMind(['x', 'y'], 1);
m3 = ingestAssessment(m3, 'x', 50, []);   // turn→1 = maxTurns
A('预算耗尽 → 收尾(budget_exhausted)', decideNext(m3).kind === 'conclude' && (decideNext(m3) as any).reason === 'budget_exhausted');

/* ───────────── 答非所问 / 没答:确定性感知 + 决策(非作答≠弱答) ───────────── */
// 非作答检测:空/跳过/过短/整句套话 命中;真实长答案不误伤(即便含"不会"等词)
A('空答=非作答(且=skip)', isNonAnswer('') && isSkip(''));
A('"跳过"=skip(显式放弃)', isSkip('跳过') && isSkip(' 跳过 ') && isSkip('skip'));
A('"不知道""我不会""没做过"=非作答(整句套话)', isNonAnswer('不知道') && isNonAnswer('我不会') && isNonAnswer('没做过') && isNonAnswer('不清楚'));
A('过短(<8 有意义字符)=非作答', isNonAnswer('就那样') && isNonAnswer('用Redis'));
A('复读/乱敲规避(堆长度但字符多样性极低)=非作答', isNonAnswer('不知道不知道不知道') && isNonAnswer('啊啊啊啊啊啊啊啊') && isNonAnswer('不会不会不会不会'));
A('字符多样性正常的真实作答**不**被多样性闸误伤', !isNonAnswer('我用读写分离加本地缓存扛住峰值并权衡一致性与延迟'));
A('真实长答案**不**误伤(含"不会"但是真作答)', !isNonAnswer('我不会在生产直接删库,而是先灰度再回滚,通过开关控制流量') && !isSkip('我不会在生产直接删库,而是先灰度'));
A('真实作答(够长、非套话)= 非"非作答"', !isNonAnswer('我用读写分离加本地缓存扛住了峰值并权衡了一致性'));

// classifyTurn:skip→直接换题;非作答→先澄清(≤1);再非作答→换题;真实作答→并入
let cm = withCurrent(initMind(['并发', '缓存'], 12), '并发');
A('skip → unresolved(直接换题,不澄清)', classifyTurn(cm, { skipped: true, nonAnswer: true }) === 'unresolved');
A('非作答(首次)→ clarify(引导重答)', classifyTurn(cm, { skipped: false, nonAnswer: true }) === 'clarify');
A('真实作答 → ingest(正常并入)', classifyTurn(cm, { skipped: false, nonAnswer: false }) === 'ingest');
const cmAfterClarify = markClarify(cm);
A('已澄清 1 次后再非作答 → unresolved(不再澄清,换题)', classifyTurn(cmAfterClarify, { skipped: false, nonAnswer: true }) === 'unresolved');

// markClarify:不动难度/depthProbed/confidence,只 +clarifyAttempts +turn
A('markClarify:难度/depthProbed/confidence 全不变,仅 clarifyAttempts+1 & turn+1',
  cmAfterClarify.difficulty === cm.difficulty && cmAfterClarify.competencies[0].depthProbed === 0 &&
  cmAfterClarify.competencies[0].confidence === 0 && cmAfterClarify.clarifyAttempts === 1 && cmAfterClarify.turn === cm.turn + 1);

// markUnresolved:标弱(conf≤0.2)+ 探尽(depthProbed=MAX)+ 难度不变 → decideNext 必 pivot 不再 probe
const um = markUnresolved(cm, '并发');
A('markUnresolved:该能力 confidence≤0.2 且 depthProbed=MAX,难度不变',
  um.competencies[0].confidence <= 0.2 && um.competencies[0].depthProbed === 2 && um.difficulty === cm.difficulty && um.clarifyAttempts === 0);
const afterUn = decideNext(um);
A('markUnresolved 后 → 决策 pivot 到另一能力(不再追原能力,不循环)', afterUn.kind === 'ask' && afterUn.mode === 'pivot' && afterUn.competency === '缓存');

// 难度不变性硬断言:非作答路径(clarify/unresolved)绝不抬难度
A('非作答绝不抬难度(clarify 与 unresolved 难度都 ≤ 原难度)', markClarify(cm).difficulty <= cm.difficulty && markUnresolved(cm, '并发').difficulty <= cm.difficulty);

// 引导语:含能力名 + 可跳过出口(无死胡同)
A('clarifyHint 含能力名 + 明确"可跳过"出口', clarifyHint('高并发').includes('高并发') && clarifyHint('高并发').includes('跳过'));

console.log(`\n${fail === 0 ? '✓ 自适应面试大脑(感知→更新→决策 + 非作答处置,确定可解释)全部通过' : '✗ ' + fail + ' 失败'}`);
process.exit(fail === 0 ? 0 : 1);
