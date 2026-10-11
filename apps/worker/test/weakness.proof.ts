/**
 * H4 WEAKNESS-LOOP prove（#252 族弱项闭环·R1-R8 断言族·REQUEST §2b 判据落卷）。
 *
 * 载体形态（§2b.2 EXEC 定）：新 `weakness.proof.ts`——静态接线断言（read-file 跨仓 src,沿 web-logic.proof
 * :1307-1313 read-file 先例形制）+ 纯函数直行使（R3 预算/R7 匹配/payload 解析）+ 隔离库动态段（R6 衰减窗/
 * R5 回灌/R7 偏置联动,真 Postgres·assertIsolatedTestTarget 钉死,禁影子 schema 假绿）。
 *
 * 判据（fix-roadmap :97 验收原文为主判据）：
 *   ① focus 全链透传五断点（controller 头→service 归一/payload→db payload 读→consumer 解析→lifecycle→planner prompt v3）;
 *   ② 专项预算 5-8（focus 派生·显式 maxTurns 隔离 E2E 优先级不变·通用 2-3 分界零触）;
 *   ③ 衰减窗（达标移出+未达标保留+窗外衰减+冷启动恒等·固定 N=5 不依赖 H1）;
 *   ④ 匹配（同义名命中·异名不误挡·精确恒中·禁 embedding/模型·纯确定性）;
 *   ⑤ 回灌（历史 learning_plan 勾选幂等·本场排除·计划本体零重写·围栏场不回灌）;
 *   ⑥ 复审处方①②（报告页再练入口+action 携 focus / LearningSection 去练入口——同型静态断言亦落
 *      apps/web/test/web-logic.proof.ts 独立守卫,双落位互为备）。
 *   难度/confidence 隔离铁律零触：prompt v3 文本+initMind 注记+bias 注记静态钉死。
 * 运行：仅经 scripts/run-e2e-isolated.mjs weakness:prove:raw（隔离 PG;零 Key 零网络·est live=0）。
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertIsolatedTestTarget, asPrincipal, createPool, historicalWeakDimensions, WEAKNESS_DECAY_WINDOW_SESSIONS } from '@meetwise/db';
import { derivedFocusSoftBudget, FOCUS_SOFT_BUDGET_MAX, FOCUS_SOFT_BUDGET_MIN, initMind } from '@meetwise/domain';
import { biasByPastWeakness, WEAKNESS_MATCH_THRESHOLD, weaknessMatches } from '../src/adaptive-interview-service.ts';
import { parseFocusPayload, FOCUS_LABEL_MAX_COUNT } from '../src/interview-consumer.ts';
import { backfillLearningProgressFromAssessment } from '../src/weakness-backfill.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const read = (rel: string) => {
  const p = resolve(repoRoot, rel);
  if (!existsSync(p)) throw new Error(`missing file: ${rel}`);
  return readFileSync(p, 'utf8');
};
/** 行号定位（沿 web-logic.proof lineOf 先例·漂移表用）。 */
const lineOf = (src: string, re: RegExp): number => src.split('\n').findIndex((l) => re.test(l)) + 1;

let failures = 0;
const A = (name: string, condition: boolean, detail = '') => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${condition || !detail ? '' : `  [${detail}]`}`);
  if (!condition) failures++;
};
const section = (title: string) => console.log(`\n──────── ${title} ─────────`);

const W_OWNER = `weakness-proof-${process.pid}-w`;
const W2_OWNER = `weakness-proof-${process.pid}-w2`;

/* ═════════ S. 静态接线断言（R2 五断点+R1/R4 处方①②+R5 hook+R8·零 DB 零模型） ═════════ */
function staticSections() {
  const ctrl = read('apps/api/src/modules/interview/interview.controller.ts');
  const svc = read('apps/api/src/modules/interview/interview.service.ts');
  const jobs = read('packages/db/src/interview/interview-jobs.ts');
  const consumer = read('apps/worker/src/interview-consumer.ts');
  const lifecycle = read('apps/worker/src/adaptive-lifecycle.ts');
  const aisvc = read('apps/worker/src/adaptive-interview-service.ts');
  const prompts = read('packages/ai-runtime/src/prompts.ts');
  const page = read('apps/web/app/report/[id]/page.tsx');
  const actions = read('apps/web/app/interviews/actions.ts');
  const growth = read('apps/web/app/growth/page.tsx');
  const comparable = read('apps/web/lib/growth/comparable.ts');
  const worker = read('apps/worker/src/report-worker.ts');
  const backfill = read('apps/worker/src/weakness-backfill.ts');
  const memsvc = read('apps/worker/src/memory-service.ts');

  section('S-A R2① controller:focus 头透传（沿 target-role 形制·additive）');
  A('S1 controller 声明 focus 头', /@Headers\('focus'\)\s+focus\?:\s*string/.test(ctrl));
  A('S2 controller 透传 service.begin(…, targetRole, focus)', /this\.interviews\.begin\(req\.principal, id, resumeId, req\.reqId, quizId, targetRole, focus\)/.test(ctrl));

  section('S-B R2② service:白名单归一+payload additive（缺省零新键=现状字节）');
  A('S3 normalizeFocusHeader 纯函数导出在位', /export function normalizeFocusHeader\(/.test(svc));
  A('S4 beginInterviewCore 第 8 形参 focus(additive)', /requestId\?\: string, sourceQuizId\?\: string, targetRole\?\: string, focus\?\: string,/.test(svc));
  A('S5 begin 方法 8 参链下传', /beginInterviewCore\(c, owner, id, resumeId, requestId, sourceQuizId, targetRole, focus\)/.test(svc));
  A('S6 payload additive:focus 仅在场写入', /if \(focusNormalized\) startPayload\.focus = focusNormalized;/.test(svc));
  A('S7 focus 不入表列(payload 标量传输·Ban 走私面)', !/ALTER TABLE|SET\s+[^\n]*focus|focus\s+text NOT NULL/.test(svc.slice(svc.indexOf('export async function beginInterviewCore'), svc.indexOf('async turn('))));

  section('S-C R2③ payload→consumer:同门读出+白名单解析');
  A('S8 interview-jobs 读 payload->>focus(同门单查)', /payload->>'focus' AS focus/.test(jobs));
  A('S9 focus 缺省容忍(undefined·沿 targetRole 同形制)', /typeof focus === 'string' && focus \? \{ focus \} : \{\}/.test(jobs));
  A('S10 consumer parseFocusPayload 纯函数导出', /export function parseFocusPayload\(/.test(consumer));
  A('S11 consumer 解析+下传 startAdaptiveInterview', /const focus = parseFocusPayload\(requestContext\.focus\);/.test(consumer)
    && /startAdaptiveInterview\(life, role, admitted\.ok && admitted\.resumeProfileAvailable \? facts : \[\], focus\)/.test(consumer));

  section('S-D R2④⑤ lifecycle→planner prompt v4（上一轮评估摘要=criterion+弱点标签·fix-roadmap :97·v4=#200-A/#201 随演）');
  A('S12 startAdaptiveInterview 第 4 形参 focus', /export function startAdaptiveInterview\(d: AdaptiveLifecycleDeps, role: string, facts: string\[\], focus\?\: string\[\]\)/.test(lifecycle));
  A('S13 planCompetencies 第 7 实参 focus(+v4 第 8/9 实参 quizQuestions/routeLeaf·#200-A/#201)', /planCompetencies\(d\.pool, d\.owner, d\.interviewId, d\.fastModel \?\? d\.model, role, plannerFacts, focus, d\.quizQuestions, d\.routeLeaf\)/.test(lifecycle));
  A('S14 makeDeps focusWeaknesses(→plan 节点 initMind R3)', /makeDeps\(d, competencies, resumeProfileAvailable, undefined, grounding\.pool, focus\)/.test(lifecycle)
    && /focusWeaknesses: d\.focusWeaknesses,/.test(aisvc));
  A('S15 planCompetencies 第 7-9 形参+prompt focusWeaknesses/quizQuestions', /facts: string\[\], focus\?\: string\[\], quizQuestions\?\: string\[\], relevanceLeaf\?\: string\)/.test(aisvc)
    && /\{ role, facts, focusWeaknesses: focus, quizQuestions \}/.test(aisvc));
  A('S16 prompt ' + "'planner.competencies'" + ' 升 v4(注册表纪律:改 prompt=升 version·v4=#200-A 押题 data 段)', /service: 'planner\.competencies', version: 'v4',/.test(prompts));
  A('S17 prompt v3 上一轮弱点标签段(buildData additive·缺省逐字节回退)', /上一轮弱点标签/.test(prompts) && /focusWeaknesses as string\[\] \| undefined/.test(prompts));
  A('S18 难度/信心隔离铁律钉死(prompt 明示非难度信号)', /仅提示考什么·非难度信号/.test(prompts));

  section('S-E 复审处方①:报告页再练入口+action 携 focus(read-file 静态接线·沿 web-logic :1307-1313 先例)');
  A('S19 报告页 src 含再练入口(N=本场 gap 数运行时派生)', /再练这 \{gapCount\} 个弱项/.test(page) && /const gapDims = dims\.filter/.test(page) && /const gapCount = gapDims\.length/.test(page));
  A('S20 报告页 import startFocusRetrainAction(既有 create+begin 链·零新导航模式)', /import \{ startFocusRetrainAction \} from '\.\.\/\.\.\/interviews\/actions'/.test(page));
  A('S21 报告页表单携 focus(gap 维度名数组·上限=本 gap 数)', /name="focus" value=\{JSON\.stringify\(gapDims\.map\(\(d\) => d\.dimension\)\)\}/.test(page));
  A('S22 action 携 focus 头(begin headers·JSON 数组文本)', /export async function startFocusRetrainAction\(/.test(actions) && /focus: JSON\.stringify\(labels\)/.test(actions));

  section('S-F 复审处方②:LearningSection 去练入口(静态图标→真入口·携 topic=focus)');
  A('S23 学习项「去练」按钮在位(未完成项·topic=focus)', /去练/.test(page) && /name="focus" value=\{JSON\.stringify\(\[it\.topic\]\)\}/.test(page));
  A('S24 done 项不渲染去练(勾选主径=R5 自动回灌)', /!\w+\.done && resumeId \? \(/.test(page));

  section('S-G R8:成长曲线可比标注(标注形·新-#277 实现面锚)');
  A('S25 growth 页接 growthDeltaView(维度名交集约束)', /import \{ growthDeltaView \} from '@\/lib\/growth\/comparable'/.test(growth));
  A('S26 不可比中性标注在位(delta 不渲染·如实不比)', /delta-not-comparable/.test(growth) && /维度口径不同 · 不可比/.test(growth));
  A('S27 comparable 纯函数单源导出', /export function growthDeltaComparable\(/.test(comparable) && /export function growthDeltaView\(/.test(comparable));

  section('S-H R5 回灌 hook+Ban 守卫(只写 progress 不重写计划·围栏场不回灌)');
  A('S28 generateGrowthChain 评估段成功后紧邻回灌', /backfillLearningProgressFromAssessment\(pool, owner, interviewId\)/.test(worker) && /from '\.\/weakness-backfill\.ts'/.test(worker));
  A('S29 回灌只写 learning_progress(INSERT INTO learning_plan 零命中=Ban 一次性覆盖写)', /INSERT INTO learning_progress/.test(backfill) && !/INSERT INTO learning_plan/.test(backfill));
  A('S30 历史计划排除本场+围栏过滤', /interview_id <> \$2/.test(backfill) && /interview_privacy_active\(lp\.interview_id\)/.test(backfill));
  A('S31 幂等(PK ON CONFLICT DO NOTHING)', /ON CONFLICT DO NOTHING/.test(backfill));

  section('S-I R7 形制守卫(禁 embedding/模型·lean MVP 注记照守·分桶降级登记)');
  const wmRegion = aisvc.slice(aisvc.indexOf('export function weaknessMatches'), aisvc.indexOf('export async function biasByPastWeakness'));
  A('S32 weaknessMatches 纯确定性(区域零 await/零 invoke/零模型调用)', wmRegion.length > 0 && !/\bawait\b|invoke\(/.test(wmRegion));
  A('S33 memory-service lean MVP 注记原样(禁 embedding/语义召回/信念库)', memsvc.includes('**不用 embedding/语义召回/信念库**'));
  A('S34 分桶降级登记在案(assessment_report 无岗位列·owner 域即桶)', aisvc.includes('分桶面') && aisvc.includes('登记后刀'));
}

/* ═════════ P. 纯函数直行使（R3 预算/R7 匹配/payload 解析·零 DB） ═════════ */
function pureSections() {
  section('P-A R3 专项面 5-8 题预算(focus 派生·显式 maxTurns 优先·通用 2-3 分界零触)');
  A('P1 带值:1→5·2→6·3→7·4→8(线性+帽)', derivedFocusSoftBudget(1) === 5 && derivedFocusSoftBudget(2) === 6 && derivedFocusSoftBudget(3) === 7 && derivedFocusSoftBudget(4) === 8);
  A('P2 越界夹紧:0→5·9→8(带常量 MIN=5/MAX=8)', derivedFocusSoftBudget(0) === FOCUS_SOFT_BUDGET_MIN && derivedFocusSoftBudget(9) === FOCUS_SOFT_BUDGET_MAX);
  A('P3 initMind focus 在场→专项软预算(3 通用能力:通用 6→专项 5)', initMind(['A', 'B', 'C']).maxTurns === 6 && initMind(['A', 'B', 'C'], undefined, undefined, ['高并发']).maxTurns === 5);
  A('P4 initMind focus 多弱项→带内派生(2 弱项→6)', initMind(['A', 'B', 'C'], undefined, undefined, ['高并发', '缓存']).maxTurns === 6);
  A('P5 显式 maxTurns 优先级不变(隔离 E2E 形·focus 不夺)', initMind(['A', 'B', 'C'], 9, undefined, ['高并发', '缓存']).maxTurns === 9);
  A('P6 absoluteMaxTurns 杀开关照旧夹紧(focus 也不越平台顶)', initMind(['A', 'B', 'C'], undefined, 6, ['高并发', '缓存', '系统设计', '分布式']).maxTurns === 6);
  A('P7 focus 缺省=通用面逐字节(零 focus 参与重载路径)', initMind(['A', 'B', 'C'], undefined, undefined, []).maxTurns === 6);
  A('P8 难度/信心隔离:difficulty 恒中性 2·confidence 恒 0(focus 不触)', (() => {
    const m = initMind(['A', 'B', 'C'], undefined, undefined, ['高并发']);
    return m.difficulty === 2 && m.competencies.every((c) => c.confidence === 0);
  })());

  section('P-B R7 确定性匹配矩阵(同义命中·异名不误挡·精确恒中·禁模型)');
  A('P9 精确相等恒命中', weaknessMatches('高并发', '高并发') === true);
  A('P10 同义名命中(高并发能力↔高并发·双向)', weaknessMatches('高并发能力', '高并发') && weaknessMatches('高并发', '高并发能力'));
  A('P11 同义名命中(Redis 缓存↔Redis)', weaknessMatches('Redis 缓存', 'Redis') && weaknessMatches('Redis', 'Redis 缓存'));
  A('P12 异名不误挡(项目经验↗技术深度)', weaknessMatches('项目经验', '技术深度') === false);
  A('P13 异名不误挡(系统架构↗系统设计·词元覆盖不足)', weaknessMatches('系统架构', '系统设计') === false);
  A('P14 空名不命中(零误挡)', weaknessMatches('', '高并发') === false && weaknessMatches('高并发', '') === false);
  A('P15 阈值固定导出(0.5·确定性可 gate)', WEAKNESS_MATCH_THRESHOLD === 0.5);
  A('P16 大小写/空白归一命中(normalizeQuestion 同源)', weaknessMatches('  Redis  ', 'redis') === true);

  section('P-C R2③ payload focus 解析白名单(容忍不崩·沿 targetRole 同形制)');
  A('P17 缺失/空白 → undefined', parseFocusPayload(undefined) === undefined && parseFocusPayload('  ') === undefined);
  A('P18 非 JSON/非数组/空数组 → undefined(容忍)', parseFocusPayload('not-json') === undefined && parseFocusPayload('"x"') === undefined && parseFocusPayload('[]') === undefined);
  A('P19 合法数组:trim/去空/非串过滤', JSON.stringify(parseFocusPayload('[" 高并发 ","",42]')) === JSON.stringify(['高并发']));
  A('P20 总量帽 8(FOCUS_LABEL_MAX_COUNT)', (() => {
    const nine = JSON.stringify(Array.from({ length: 9 }, (_, i) => `弱项${i}`));
    return parseFocusPayload(nine)!.length === FOCUS_LABEL_MAX_COUNT;
  })());
  A('P21 逐名截断 100 字符', parseFocusPayload(JSON.stringify(['x'.repeat(120)]))![0]!.length === 100);
}

/* ═════════ D. 隔离库动态段（R6 衰减窗/R5 回灌/R7 偏置联动·真 Postgres） ═════════ */
async function dbSections() {
  const pool = createPool();
  await assertIsolatedTestTarget(pool);

  section('D-A R6 衰减窗:达标移出+未达标保留+窗外衰减+冷启动恒等(固定 N=5·不依赖 H1)');
  // fixture:owner W·iv-1..iv-12 十二场(时序递增)·war-1 Redis 弱·war-2..7 消息队列弱·
  // war-8 Redis/系统设计/消息队列 弱·war-9 Redis 达标(gap=false)+系统设计弱·war-10..12 算法弱。
  // 默认窗(最近 5 场=war-8..12):Redis 最新=war-9 达标→移出;系统设计最新=war-9 未达标→保留;
  // 消息队列最新=war-8 在窗→保留;算法在窗→保留。窗 4(war-9..12):消息队列出窗→衰减移出。
  await asPrincipal(pool, W_OWNER, (c) => {
    const ivs = Array.from({ length: 12 }, (_, i) => `('wiv-${i + 1}',$1,'created')`).join(',');
    return c.query(`INSERT INTO interview(id,owner_user_id,status) VALUES ${ivs}`, [W_OWNER]);
  });
  const reports: Array<[string, string, object]> = [
    ['war-1', 'wiv-1', [{ dimension: 'Redis', gap: true }]],
    ['war-2', 'wiv-2', [{ dimension: '消息队列', gap: true }]],
    ['war-3', 'wiv-3', [{ dimension: '消息队列', gap: true }]],
    ['war-4', 'wiv-4', [{ dimension: '消息队列', gap: true }]],
    ['war-5', 'wiv-5', [{ dimension: '消息队列', gap: true }]],
    ['war-6', 'wiv-6', [{ dimension: '消息队列', gap: true }]],
    ['war-7', 'wiv-7', [{ dimension: '消息队列', gap: true }]],
    ['war-8', 'wiv-8', [{ dimension: 'Redis', gap: true }, { dimension: '系统设计', gap: true }, { dimension: '消息队列', gap: true }]],
    ['war-9', 'wiv-9', [{ dimension: 'Redis', gap: false }, { dimension: '系统设计', gap: true }]],
    ['war-10', 'wiv-10', [{ dimension: '算法', gap: true }]],
    ['war-11', 'wiv-11', [{ dimension: '算法', gap: true }]],
    ['war-12', 'wiv-12', [{ dimension: '算法', gap: true }]],
  ];
  await asPrincipal(pool, W_OWNER, async (c) => {
    for (let i = 0; i < reports.length; i++) {
      const [id, iv, dims] = reports[i]!;
      await c.query(
        `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions,created_at) VALUES ($1,$2,$3,'ready',$4,$5)`,
        [id, W_OWNER, iv, JSON.stringify(dims), new Date(Date.UTC(2026, 0, 1 + i))],
      );
    }
  });
  A('D1 窗内(最近 5 场):算法+消息队列+系统设计(窗=war-8..12·dim 字节序)', JSON.stringify(await pastWeakOf(pool, W_OWNER)) === JSON.stringify(['消息队列', '算法', '系统设计']));
  A('D2 衰减窗常量固定 5(不依赖 H1 校准)', WEAKNESS_DECAY_WINDOW_SESSIONS === 5);
  A('D3 达标即移出(Redis 最新一场 war-9 gap=false·更早 war-1/war-8 gap=true 不救)', !(await pastWeakOf(pool, W_OWNER)).includes('Redis'));
  A('D4 未达标保留(系统设计最新一场 gap=true)', (await pastWeakOf(pool, W_OWNER)).includes('系统设计'));
  A('D5 窗外时间衰减移出(窗 4:消息队列最新出现 war-8 出窗→移出)', !(await pastWeakIn(pool, W_OWNER, 4)).includes('消息队列'));
  A('D6 窗口参数生效(窗 9 → 消息队列回投影;窗 1 → 只剩算法)', (await pastWeakIn(pool, W_OWNER, 9)).includes('消息队列') && JSON.stringify(await pastWeakIn(pool, W_OWNER, 1)) === JSON.stringify(['算法']));
  A('D7 冷启动恒等(零历史 owner → 空数组)', (await pastWeakOf(pool, `w-cold-${process.pid}`)).length === 0);
  A('D8 冷启动偏置恒等(稳定分区原序·非特殊分支)', JSON.stringify(await biasByPastWeakness(pool, `w-cold-${process.pid}`, ['B', 'A'])) === JSON.stringify(['B', 'A']));

  section('D-B R5 回灌:历史计划勾选(幂等·本场排除·计划零重写·R7 终形匹配)');
  await asPrincipal(pool, W2_OWNER, (c) => c.query(
    "INSERT INTO interview(id,owner_user_id,status) VALUES ('bw-prior',$1,'completed'),('bw-curr',$1,'completed')", [W2_OWNER]));
  await asPrincipal(pool, W2_OWNER, (c) => c.query(
    `INSERT INTO learning_plan(id,owner_user_id,interview_id,status,items) VALUES ('blp-1',$1,'bw-prior','active',$2)`,
    [W2_OWNER, JSON.stringify([
      { topic: '高并发能力', priority: 'high', action: '针对「高并发能力」系统复习 + 练习,目标达到 70 分' },
      { topic: '消息队列', priority: 'medium', action: '针对「消息队列」系统复习 + 练习,目标达到 70 分' },
    ])]));
  await asPrincipal(pool, W2_OWNER, (c) => c.query(
    `INSERT INTO learning_plan(id,owner_user_id,interview_id,status,items) VALUES ('blp-2',$1,'bw-curr','active',$2)`,
    [W2_OWNER, JSON.stringify([{ topic: '系统设计', priority: 'medium', action: '本场计划项(本场排除不回灌)' }])]));
  await asPrincipal(pool, W2_OWNER, (c) => c.query(
    `INSERT INTO assessment_report(id,owner_user_id,interview_id,status,dimensions) VALUES ('bar-1',$1,'bw-curr','ready',$2)`,
    [W2_OWNER, JSON.stringify([{ dimension: '高并发', score: 30, gap: true }, { dimension: '系统设计', score: 45, gap: true }])]));
  const planBefore = await asPrincipal(pool, W2_OWNER, (c) => c.query<{ items: unknown }>('SELECT items FROM learning_plan WHERE interview_id=$1', ['bw-prior']));
  const out1 = await backfillLearningProgressFromAssessment(pool, W2_OWNER, 'bw-curr');
  A('D9 回灌勾选:同义名命中(gap「高并发」→计划项「高并发能力」·R7 确定性相似)', out1.marked === 1
    && (await progressTopics(pool, W2_OWNER, 'bw-prior')).includes('高并发能力'));
  A('D10 异名不勾(消息队列 不被 高并发/系统设计 误挡命中)', !(await progressTopics(pool, W2_OWNER, 'bw-prior')).includes('消息队列'));
  A('D11 本场计划排除(bw-curr 自身计划项不回灌)', (await progressTopics(pool, W2_OWNER, 'bw-curr')).length === 0);
  A('D12 计划本体零重写(Ban 一次性覆盖写·items 逐字节)', JSON.stringify((await asPrincipal(pool, W2_OWNER, (c) => c.query<{ items: unknown }>('SELECT items FROM learning_plan WHERE interview_id=$1', ['bw-prior']))).rows[0].items) === JSON.stringify(planBefore.rows[0].items));
  const out2 = await backfillLearningProgressFromAssessment(pool, W2_OWNER, 'bw-curr');
  A('D13 幂等重放:再跑 marked=0·行数不变', out2.marked === 0 && (await progressTopics(pool, W2_OWNER, 'bw-prior')).length === 1);
  A('D14 provenance 观测面(gapDimensions=本场 gap 名)', JSON.stringify(out1.gapDimensions) === JSON.stringify(['高并发', '系统设计']));

  section('D-C R7×R6 联动:偏置消费衰减窗投影(同义前移·异名原序·稳定分区)');
  const biased = await biasByPastWeakness(pool, W2_OWNER, ['项目经验', '高并发能力', '技术深度']);
  A('D15 同义弱项前移(高并发能力↔高并发·R7 命中)', biased[0] === '高并发能力');
  A('D16 非弱项保持原序(稳定分区·绝不注入)', JSON.stringify(biased) === JSON.stringify(['高并发能力', '项目经验', '技术深度']));
  const biasedW = await biasByPastWeakness(pool, W_OWNER, ['算法综合', '项目经验', '消息队列']);
  A('D17 W owner 偏置消费衰减后投影(算法综合↔算法 同义命中·消息队列精确命中)', JSON.stringify(biasedW) === JSON.stringify(['算法综合', '消息队列', '项目经验']));
  A('D18 hint 非硬过滤:能力清单长度不变(只重排·绝不删能力)', biased.length === 3 && biasedW.length === 3);

  await pool.end();
}

/** R6 只读投影便捷封装(默认窗)。 */
async function pastWeakOf(pool: import('@meetwise/db').DbPool, owner: string): Promise<string[]> {
  return asPrincipal(pool, owner, (c) => historicalWeakDimensions(c, owner));
}
/** R6 只读投影便捷封装(显式窗)。 */
async function pastWeakIn(pool: import('@meetwise/db').DbPool, owner: string, windowSessions: number): Promise<string[]> {
  return asPrincipal(pool, owner, (c) => historicalWeakDimensions(c, owner, windowSessions));
}
async function progressTopics(pool: import('@meetwise/db').DbPool, owner: string, interviewId: string): Promise<string[]> {
  return (await asPrincipal(pool, owner, (c) => c.query<{ topic: string }>('SELECT topic FROM learning_progress WHERE owner_user_id=$1 AND interview_id=$2', [owner, interviewId])))
    .rows.map((x) => String(x.topic));
}

async function main() {
  staticSections();
  pureSections();
  await dbSections();
  console.log(`\n${failures === 0 ? '✓ H4 WEAKNESS-LOOP 断言族全部通过(R1-R8·三处方·est live=0)' : '✗ ' + failures + ' 项失败'}`);
  process.exit(failures === 0 ? 0 : 1);
}
main().catch((e) => { console.error(e); process.exit(1); });
