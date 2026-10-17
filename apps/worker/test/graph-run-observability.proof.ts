/** GRAPH-RUN-OBSERVABILITY(AG-15 图运行时可观测小刀) prove·纯函数+阈值谓词+db 哑读写 stub+静态锚四组臂·零 DB 零外呼零 env·tsx 直跑免 runner 注册。
 *  组A=classifyAdaptiveRunPosition 纯分类(done/'END'·pending tasks 形 'interrupt:awaitAnswer'·裸节点卡死形·degraded conclude lastError·确定性);
 *  组B=graphRunStuckThresholdCrossed 阈值谓词(首观测 false/同名裸节点 true/异名 false/前次 interrupt: 形 false/stuck=false false);
 *  组C=db 哑读写模块 stub 客户端(record SQL 三列 SET 零 version/status= 赋值+六值活行 WHERE·read 返回形·列侧谓词五值域·stub 拒绝诚实上抛);
 *  组D=静态锚 C5(observeGraphRunPosition try/catch+console.warn·两挂点恰 2·零新增 invoke(null·metrics 尾槽·index 导出·0205 三列·01_schema 镜像)。
 *  断言失败只记命中名,零业务数据 dump。est live=0(纯函数+stub·零 Key·零 fetch·零 env 触)。 */
import { readFileSync } from 'node:fs';
import { classifyAdaptiveRunPosition, graphRunStuckThresholdCrossed } from '../src/adaptive-lifecycle.ts';
import {
  readGraphRunObservation, recordGraphRunObservation, graphRunPositionIsStuck,
  type GraphRunObservationRecord,
} from '../../../packages/db/src/interview/graph-run-observability.ts';

let fail = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) fail++; };

// ───────────────────────── 组A classifyAdaptiveRunPosition 纯分类(纯函数零 IO) ─────────────────────────
function sectionA() {
  A('A1 done snap(next=[])→currentNode=\'END\' ∧ stuck=false ∧ lastError=null',
    (() => { const r = classifyAdaptiveRunPosition({ next: [], values: {} }); return r.currentNode === 'END' && r.stuck === false && r.lastError === null; })());
  A('A2 pending snap(tasks[0].interrupts[0].value 形)→\'interrupt:awaitAnswer\' ∧ stuck=false',
    (() => {
      const r = classifyAdaptiveRunPosition({ next: ['awaitAnswer'], values: {}, tasks: [{ interrupts: [{ value: { questionId: 'q1' } }] }] });
      return r.currentNode === 'interrupt:awaitAnswer' && r.stuck === false;
    })());
  A('A3 next=[\'genQuestion\'] 无 pending 无 failure→裸节点 \'genQuestion\' ∧ stuck=true(卡死形状)',
    (() => { const r = classifyAdaptiveRunPosition({ next: ['genQuestion'], values: {} }); return r.currentNode === 'genQuestion' && r.stuck === true && r.lastError === null; })());
  A('A4 degraded conclude(generationProvenance.origin=\'unavailable\'+next 空)→\'END\' ∧ lastError 带 generation_ 前缀',
    (() => {
      const r = classifyAdaptiveRunPosition({ next: [], values: { concluded: true, generationProvenance: { origin: 'unavailable', errorCode: 'model_overloaded' } } });
      return r.currentNode === 'END' && r.stuck === false && typeof r.lastError === 'string' && r.lastError.startsWith('generation_');
    })());
  const detSnap = { next: ['decide'], values: {} };
  const d1 = classifyAdaptiveRunPosition(detSnap);
  const d2 = classifyAdaptiveRunPosition(detSnap);
  A('A5 同 snap 双调恒等(确定性)', JSON.stringify(d1) === JSON.stringify(d2) && d1.stuck === true && d1.currentNode === 'decide');
}

// ───────────────────────── 组B graphRunStuckThresholdCrossed 阈值谓词 ─────────────────────────
function sectionB() {
  A('B1 首观测 previous=null→false(首观测只落列不 emit)',
    graphRunStuckThresholdCrossed(null, { currentNode: 'genQuestion', stuck: true }) === false);
  A('B2 前后同名裸节点→true(卡死形状重复观测=跨一 job 投递周期)',
    graphRunStuckThresholdCrossed({ currentNode: 'genQuestion' }, { currentNode: 'genQuestion', stuck: true }) === true);
  A('B3 前后异名→false',
    graphRunStuckThresholdCrossed({ currentNode: 'decide' }, { currentNode: 'genQuestion', stuck: true }) === false);
  A('B4 前次 interrupt: 形→false(正常等题不触发)',
    graphRunStuckThresholdCrossed({ currentNode: 'interrupt:awaitAnswer' }, { currentNode: 'genQuestion', stuck: true }) === false);
  A('B5 stuck=false→false(非卡死形状恒不超阈)',
    graphRunStuckThresholdCrossed({ currentNode: 'genQuestion' }, { currentNode: 'genQuestion', stuck: false }) === false);
}

// ───────────────────────── 组C db 哑读写模块 stub 客户端(零 DB) ─────────────────────────
type ClientLike = Parameters<typeof recordGraphRunObservation>[0];
const REC: GraphRunObservationRecord = {
  graphName: 'adaptive-interview', threadId: 't-obs-1', owner: 'owner-obs-1',
  currentNode: 'genQuestion', checkpointId: 'ckpt-obs-1', lastError: null,
};
const LIVE_SIX = ['created', 'active', 'waiting_user', 'migrating', 'paused', 'quarantined'];

async function sectionC() {
  const seen: Array<{ sql: string; params: unknown[] }> = [];
  const stub = {
    query: async (sql: string, params?: unknown[]) => { seen.push({ sql, params: params ?? [] }); return { rows: [], rowCount: 1 }; },
  } as unknown as ClientLike;
  const rowCount = await recordGraphRunObservation(stub, REC);
  const writeSql = seen[0]?.sql ?? '';
  const writeParams = seen[0]?.params ?? [];
  A('C1 record SQL:三列 SET(current_node=$4,last_error=$5,checkpoint_id=$6) ∧ 零 version 字样 ∧ 零 status=\' 赋值 ∧ 六值活行 WHERE ∧ 参数序 $1-⑥=rec ∧ rowCount 透传',
    writeSql.includes('SET current_node=$4, last_error=$5, checkpoint_id=$6')
    && !writeSql.includes('version') && !writeSql.includes("status='")
    && LIVE_SIX.every((s) => writeSql.includes(`'${s}'`))
    && JSON.stringify(writeParams) === JSON.stringify([REC.graphName, REC.threadId, REC.owner, REC.currentNode, REC.lastError, REC.checkpointId])
    && rowCount === 1);
  {
    const rs: Array<{ sql: string }> = [];
    const hit = {
      query: async (sql: string) => { rs.push({ sql }); return { rows: [{ ['current_node']: 'genQuestion' }], rowCount: 1 }; },
    } as unknown as ClientLike;
    const miss = { query: async () => ({ rows: [], rowCount: 0 }) } as unknown as ClientLike;
    const r1 = await readGraphRunObservation(hit, 'adaptive-interview', 't', 'o');
    const r2 = await readGraphRunObservation(miss, 'adaptive-interview', 't', 'o');
    const sql = rs[0]?.sql ?? '';
    A('C2 read 返回形:活行→{ currentNode } 透传 ∧ 空行→null ∧ read SQL 只读形(SELECT 无 SET/UPDATE·零 status=\' 赋值·六值活行 WHERE)',
      r1 !== null && r1.currentNode === 'genQuestion' && r2 === null
      && sql.startsWith('SELECT current_node FROM ai_graph_run') && !sql.includes('SET ') && !sql.includes('UPDATE ')
      && !sql.includes("status='")
      && LIVE_SIX.every((s) => sql.includes(`'${s}'`)));
  }
  A('C3 列侧谓词五值域:genQuestion=true/\'END\'=false/\'interrupt:awaitAnswer\'=false/null=false/\'\'=false',
    graphRunPositionIsStuck('genQuestion') === true && graphRunPositionIsStuck('END') === false
    && graphRunPositionIsStuck('interrupt:awaitAnswer') === false && graphRunPositionIsStuck(null) === false
    && graphRunPositionIsStuck('') === false);
  {
    const bad = { query: async () => { throw new Error('stub_reject'); } } as unknown as ClientLike;
    let threw = false;
    try { await recordGraphRunObservation(bad, REC); } catch { threw = true; }
    A('C4 stub 拒绝 query→recordGraphRunObservation 诚实上抛(fail-soft 归 observeGraphRunPosition 层)', threw);
  }
}

// ───────────────────────── 组D 静态锚 C5(readFileSync 子串) ─────────────────────────
function sectionD() {
  const lifecycle = readFileSync(new URL('../src/adaptive-lifecycle.ts', import.meta.url), 'utf8');
  const metrics = readFileSync(new URL('../../../packages/ai-runtime/src/metrics.ts', import.meta.url), 'utf8');
  const dbIndex = readFileSync(new URL('../../../packages/db/src/index.ts', import.meta.url), 'utf8');
  const migration = readFileSync(new URL('../../../packages/db/migrations/0205_ai_graph_run_observability_columns.sql', import.meta.url), 'utf8');
  const schema = readFileSync(new URL('../../../packages/db/sql/01_schema.sql', import.meta.url), 'utf8');
  A('C5a observeGraphRunPosition:try/catch+console.warn(\'graph_run_observability_write_failed\' 静态在案(fail-soft 兜底)',
    lifecycle.includes('async function observeGraphRunPosition') && lifecycle.includes('console.warn(\'graph_run_observability_write_failed\'')
    && /catch \(error: unknown\)/.test(lifecycle));
  A('C5b 两挂点恰 2 处(await observeGraphRunPosition(d, snap);)',
    lifecycle.split('await observeGraphRunPosition(d, snap);').length - 1 === 2);
  A('C5c 零新增 invoke(null:代码形 await g.invoke(null 恒 2(AG-05/AG-26 既有修复臂·卡死臂零修复静态证)∧字面总数恒 5(4 基线+1 Ban 注释)',
    lifecycle.split('await g.invoke(null').length - 1 === 2 && lifecycle.split('invoke(null').length - 1 === 5);
  A('C5d metrics 尾槽:graphRunStuckObserved: \'graph_run_stuck_observed_total\' + 基线 0 行在案',
    metrics.includes("graphRunStuckObserved: 'graph_run_stuck_observed_total'")
    && metrics.includes('m.inc(METRIC.graphRunStuckObserved, undefined, 0);'));
  A('C5e db index 导出:graph-run-observability 三函数+type 导出在案',
    dbIndex.includes("from './interview/graph-run-observability.ts'")
    && dbIndex.includes('readGraphRunObservation, recordGraphRunObservation, graphRunPositionIsStuck'));
  A('C5f 0205 迁移:三 ADD COLUMN IF NOT EXISTS 幂等形在案',
    migration.includes('ADD COLUMN IF NOT EXISTS current_node text;')
    && migration.includes('ADD COLUMN IF NOT EXISTS last_error text;')
    && migration.includes('ADD COLUMN IF NOT EXISTS checkpoint_id text;'));
  A('C5g 01_schema 镜像:current_node/last_error/checkpoint_id 三列镜像在案',
    schema.includes('current_node text,') && schema.includes('last_error text,') && schema.includes('checkpoint_id text'));
}

// ───────────────────────── 主序 ─────────────────────────
sectionA();
sectionB();
await sectionC();
sectionD();
console.log(`graph-run-observability prove: ${fail === 0 ? 'ALL PASS' : `${fail} FAIL`}`);
if (fail > 0) process.exitCode = 1;
