/**
 * career-path 图 + AiGraphRun 状态机 单测证明（GAP-UC004-FI3-GRAPH-WIRING Candidate A · 无 DB · 零模型调用）。
 *   pnpm -C packages/ai-graphs exec tsx test/career-path.proof.ts
 *
 * 内存 ledger 镜像 API 组合根的 SQL 语义（每线程恰一行；create version=1 / reuse version+1；
 * 终态 succeeded/failed 各 version+1；version fence 不匹配 = 0 行）。真实 SQL 由
 * uc004:career-path-fault:prove（隔离 PG）观察——本测不替代 e2e 证据。
 */
import { readFileSync } from 'node:fs';
import { deriveCareerPath, type CareerPath } from '@meetwise/domain';
import {
  buildCareerPathGraph, runCareerPathGraph, selectCareerPathDerive,
  CAREER_PATH_GRAPH_NAME, CAREER_PATH_INJECTED_FAILURE, type CareerPathRunLedger,
} from '../src/index.ts';

let failures = 0;
const A = (n: string, c: boolean) => { console.log(`${c ? 'PASS' : 'FAIL'}  ${n}`); if (!c) failures++; };
const eq = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

interface Row { status: string; version: number }
/** 内存 ledger：镜像 interview.service.ts generateCareerPath 的 SQL（同 WHERE version/status fence）。 */
function memLedger(rows: Map<string, Row>, thread: string, opts: { failCommit?: boolean; failMark?: boolean } = {}) {
  const store = new Map<string, CareerPath>();
  const calls: string[] = [];
  const ledger: CareerPathRunLedger<{ version: number }> = {
    async begin() {
      calls.push('begin');
      const cur = rows.get(thread);
      if (!cur) { rows.set(thread, { status: 'active', version: 1 }); return { version: 1 }; }
      cur.status = 'active'; cur.version += 1; return { version: cur.version };
    },
    async commitSuccess(run, cp) {
      calls.push('commitSuccess');
      if (opts.failCommit) throw Object.assign(new Error('canceling statement due to statement timeout'), { code: '57014' });
      store.set(thread, cp);
      const cur = rows.get(thread)!;
      if (cur.version === run.version && cur.status === 'active') { cur.status = 'succeeded'; cur.version += 1; }
    },
    async markFailed(run) {
      calls.push('markFailed');
      if (opts.failMark) throw Object.assign(new Error('Connection terminated unexpectedly'), { code: 'ECONNRESET' });
      const cur = rows.get(thread)!;
      if (cur.version === run.version && cur.status === 'active') { cur.status = 'failed'; cur.version += 1; }
    },
  };
  return { ledger, store, calls };
}

const IN = { overall: 60, weaknesses: ['分布式锁', '消息队列'] };
const T_OK = 'IV_UNIT_OK';
const T_FI = 'IV_UNIT_FI3';

// 1) 图构建：单节点 derive，输出与 domain 纯函数逐字相同
{
  const out = await buildCareerPathGraph({ derive: deriveCareerPath }).invoke(IN);
  A('GRAPH-BUILD-DERIVE-EQUALS-DOMAIN', eq(out.careerPath, deriveCareerPath(IN.overall, IN.weaknesses)));
  A('GRAPH-NAME-CONST', CAREER_PATH_GRAPH_NAME === 'career-path');
}

// 2) seam：默认关 / 精确匹配 / fail-only
{
  A('SEAM-UNSET-SAME-REF', selectCareerPathDerive(T_OK, undefined, deriveCareerPath) === deriveCareerPath);
  A('SEAM-NULL-SAME-REF', selectCareerPathDerive(T_OK, null, deriveCareerPath) === deriveCareerPath);
  A('SEAM-EMPTY-SAME-REF', selectCareerPathDerive(T_OK, '', deriveCareerPath) === deriveCareerPath);
  A('SEAM-BLANK-SAME-REF', selectCareerPathDerive(T_OK, '   ', deriveCareerPath) === deriveCareerPath);
  A('SEAM-OTHER-THREAD-SAME-REF', selectCareerPathDerive(T_OK, T_FI, deriveCareerPath) === deriveCareerPath);
  A('SEAM-PREFIX-NO-MATCH', selectCareerPathDerive(`${T_FI}_X`, T_FI, deriveCareerPath) === deriveCareerPath);
  A('SEAM-SUBSTRING-NO-MATCH', selectCareerPathDerive(T_FI.slice(0, -1), T_FI, deriveCareerPath) === deriveCareerPath);
  const seamed = selectCareerPathDerive(T_FI, T_FI, deriveCareerPath);
  let code: string | undefined; let produced: unknown = 'none';
  try { produced = seamed(IN.overall, IN.weaknesses); } catch (e) { code = (e as { code?: string }).code; }
  A('SEAM-EXACT-MATCH-FAIL-ONLY', code === CAREER_PATH_INJECTED_FAILURE && produced === 'none');
}

// 3) 成功：active（derive 执行时已持久）→ succeeded，version 1→2，业务落库
{
  const rows = new Map<string, Row>();
  const m = memLedger(rows, T_OK);
  let seenDuringDerive: Row | undefined;
  const derive = (o: number, w: string[]) => { seenDuringDerive = { ...rows.get(T_OK)! }; return deriveCareerPath(o, w); };
  const cp = await runCareerPathGraph(IN, { derive, ledger: m.ledger });
  A('SUCCESS-ACTIVE-STAGE-BEFORE-DERIVE', seenDuringDerive?.status === 'active' && seenDuringDerive.version === 1);
  A('SUCCESS-TERMINAL-SUCCEEDED-V2', eq(rows.get(T_OK), { status: 'succeeded', version: 2 }));
  A('SUCCESS-RESPONSE-SHAPE-FROZEN', eq(Object.keys(cp).sort(), ['level', 'milestones', 'readiness']) && eq(cp, deriveCareerPath(IN.overall, IN.weaknesses)));
  A('SUCCESS-BUSINESS-PERSISTED', eq(m.store.get(T_OK), cp));
  A('SUCCESS-CALL-ORDER', eq(m.calls, ['begin', 'commitSuccess']));
}

// 4) 失败（seam 注入）：active→failed v2，原错误 rethrow，无业务产物
const rowsFi = new Map<string, Row>();
{
  const m = memLedger(rowsFi, T_FI);
  let code: string | undefined;
  try { await runCareerPathGraph(IN, { derive: selectCareerPathDerive(T_FI, T_FI, deriveCareerPath), ledger: m.ledger }); }
  catch (e) { code = (e as { code?: string }).code; }
  A('FAIL-RETHROWS-ORIGINAL', code === CAREER_PATH_INJECTED_FAILURE);
  A('FAIL-TERMINAL-FAILED-V2', eq(rowsFi.get(T_FI), { status: 'failed', version: 2 }));
  A('FAIL-NO-BUSINESS-PRODUCT', m.store.size === 0);
  A('FAIL-CALL-ORDER', eq(m.calls, ['begin', 'markFailed']));
}

// 5) in-fault 重试：复用同一行 active v3 → failed v4（恰一行、version 递增）
{
  const m = memLedger(rowsFi, T_FI);
  let threw = false;
  try { await runCareerPathGraph(IN, { derive: selectCareerPathDerive(T_FI, T_FI, deriveCareerPath), ledger: m.ledger }); } catch { threw = true; }
  A('RETRY-IN-FAULT-FAILS-AGAIN', threw);
  A('RETRY-IN-FAULT-ONE-ROW-FAILED-V4', rowsFi.size === 1 && eq(rowsFi.get(T_FI), { status: 'failed', version: 4 }));
}

// 6) 撤注入后重试：failed 终态让位 → 复用 active v5 → succeeded v6
{
  const m = memLedger(rowsFi, T_FI);
  const cp = await runCareerPathGraph(IN, { derive: selectCareerPathDerive(T_FI, undefined, deriveCareerPath), ledger: m.ledger });
  A('RETRY-AFTER-FAULT-SUCCEEDED-V6', rowsFi.size === 1 && eq(rowsFi.get(T_FI), { status: 'succeeded', version: 6 }) && eq(cp, deriveCareerPath(IN.overall, IN.weaknesses)));
}

// 7) 落库失败（如 statement_timeout 57014）：active→failed，原错误 rethrow
{
  const rows = new Map<string, Row>();
  const m = memLedger(rows, 'IV_UNIT_COMMIT_FAIL', { failCommit: true });
  let code: string | undefined;
  try { await runCareerPathGraph(IN, { derive: deriveCareerPath, ledger: m.ledger }); } catch (e) { code = (e as { code?: string }).code; }
  A('COMMIT-FAIL-RETHROW-57014', code === '57014');
  A('COMMIT-FAIL-TERMINAL-FAILED-V2', eq(rows.get('IV_UNIT_COMMIT_FAIL'), { status: 'failed', version: 2 }));
}

// 8) 转换自身失败：不伪装终态（行如实停留 active），原错误照常 rethrow，转换错误被观测
{
  const rows = new Map<string, Row>();
  const m = memLedger(rows, 'IV_UNIT_MARK_FAIL', { failCommit: true, failMark: true });
  const observed: unknown[] = [];
  let code: string | undefined;
  try { await runCareerPathGraph(IN, { derive: deriveCareerPath, ledger: m.ledger, onTransitionError: (e) => observed.push(e) }); }
  catch (e) { code = (e as { code?: string }).code; }
  A('TRANSITION-FAIL-ORIGINAL-ERROR-RETHROWN', code === '57014');
  A('TRANSITION-FAIL-OBSERVED', observed.length === 1 && (observed[0] as { code?: string }).code === 'ECONNRESET');
  A('TRANSITION-FAIL-ROW-STAYS-ACTIVE-HONEST', eq(rows.get('IV_UNIT_MARK_FAIL'), { status: 'active', version: 1 }));
  // 下一次 begin 接管残留 active（不被卡死）
  const m2 = memLedger(rows, 'IV_UNIT_MARK_FAIL');
  await runCareerPathGraph(IN, { derive: deriveCareerPath, ledger: m2.ledger });
  A('TRANSITION-FAIL-NEXT-BEGIN-TAKES-OVER', eq(rows.get('IV_UNIT_MARK_FAIL'), { status: 'succeeded', version: 3 }));
}

// 9) env 未设零行为差：多输入下图输出 ≡ domain 纯函数；domain 自身错误码原样穿透
{
  const cases: Array<[number, string[]]> = [[0, []], [49, ['a']], [50, []], [74, ['x', 'y']], [75, []], [100, ['z']]];
  let allEq = true;
  for (const [o, w] of cases) {
    const rows = new Map<string, Row>();
    const m = memLedger(rows, 'IV_UNIT_ZD');
    const cp = await runCareerPathGraph({ overall: o, weaknesses: w }, { derive: selectCareerPathDerive('IV_UNIT_ZD', undefined, deriveCareerPath), ledger: m.ledger });
    if (!eq(cp, deriveCareerPath(o, w))) allEq = false;
  }
  A('ZERO-DELTA-OUTPUT-EQUALS-DOMAIN', allEq);
  let code: string | undefined;
  try { await runCareerPathGraph({ overall: 101, weaknesses: [] }, { derive: deriveCareerPath, ledger: memLedger(new Map(), 'IV_UNIT_ZD2').ledger }); }
  catch (e) { code = (e as { code?: string }).code; }
  A('ZERO-DELTA-DOMAIN-ERROR-PASSTHROUGH', code === 'insufficient_evidence');
}

// 10) 纯度：图文件不引 db/contracts/ai-runtime/模型 SDK、不读 env、不写 trace
{
  const src = readFileSync(new URL('../src/career-path.ts', import.meta.url), 'utf8');
  const imports = [...src.matchAll(/^import\s.*?from\s+'([^']+)'/gm)].map((m) => m[1]);
  A('PURITY-IMPORTS-ONLY-LANGGRAPH-DOMAIN', eq(imports.sort(), ['@langchain/langgraph', '@meetwise/domain']));
  A('PURITY-DOMAIN-TYPE-ONLY', /^import type \{ CareerPath \} from '@meetwise\/domain';$/m.test(src));
  A('PURITY-NO-ENV-NO-TRACE-NO-NET', !/process\.env|ai_invocation_trace|fetch\(|@meetwise\/(db|contracts|ai-runtime)/.test(src.replace(/^\s*\*.*$/gm, '')));
}

console.log(failures === 0 ? 'CAREER_PATH_GRAPH_PROOF PASS' : `CAREER_PATH_GRAPH_PROOF FAIL failures=${failures}`);
process.exit(failures === 0 ? 0 : 1);
