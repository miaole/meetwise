/**
 * H2 QBANK-CORPUS 静态门(§5.1 锚复现 + §5.6 静态断言 + §5.8 markers/est 面)·零 PG 零外呼。
 *
 * 覆盖:
 *  - §5.1 全锚逐条复现(行号集合与卷一致;draft 系 docs-only,代码锚在 20186718 基线行号上成立)。
 *  - §5.6 静态断言:crag.ts 对基线零 diff(deny_external/gradeRetrieval 决策面零变)·G-R2-5 门语义
 *    字面在位(缺行/缺叶同拒·永不 unscoped)·#40 合同面/LEVEL-SCHEME 落卷面/embedding compute seam
 *    对基线零 diff(Ban 邻面零触)。
 *  - §5.8 markers=0:改动集(对基线的全部变更文件)五类标记词零命中——词面在运行时组装,不落入本
 *    改动集,消除门自指(「词不复抄」纪律的机检化)。
 *  - 迁移编号裁决登记:本刀迁移 = 0162/0163(0161 已被主线 G5 占用,沿撞号治理后到者重编号)。
 *
 * pnpm qbank-corpus-gates:prove · EXIT 0=全绿
 */
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
let fail = 0;
const A = (name, ok, detail = '') => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`); if (!ok) fail++; };

const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const linesOf = (rel) => read(rel).split('\n');
const lineIs = (rel, n, needle) => String(linesOf(rel)[n - 1] ?? '').includes(needle);
const git = (args) => { try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }); } catch { return ''; } };

/* ── §5.1 锚复现(EXEC 改面后按语义重 pin:内容在位断言 + 后置行号打印入收据) ── */
{
  const seed = linesOf('apps/worker/src/qbank-seed.ts');
  const srcStart = seed.findIndex((l) => l.includes('const QBANK_SEED_SOURCE'));
  const srcEnd = seed.findIndex((l) => l.trim() === '];');
  const legacyCount = (seed.slice(srcStart, srcEnd).join('\n').match(/refId:/g) ?? []).length;
  A('A1 legacy 种子 refId 计数=33(旧通道字节保留)', legacyCount === 33, `lines ${srcStart + 1}-${srcEnd + 1}`);
  const a2 = seed.findIndex((l) => l.includes('difficulty: prefix'));
  A('A2 legacy 难度三元在位(字节保留)', a2 >= 0, `line ${a2 + 1}`);
  const svc = linesOf('apps/worker/src/adaptive-interview-service.ts');
  const a3 = svc.findIndex((l) => l.includes("useRetrieval = kind === 'fundamental' || kind === 'scenario'"));
  A('A3 检索白名单(fundamental|scenario)在位(#79 扩面)', a3 >= 0, `line ${a3 + 1}`);
  const a4 = svc.findIndex((l) => l.includes('cragQuery'));
  A('A4 查询构造(岗位/栈/难度段)接入 cragRetrieve', a4 >= 0 && svc.some((l) => l.includes('await cragRetrieve(cragQuery')), `line ${a4 + 1}`);
}
{
  const cons = linesOf('apps/worker/src/interview-consumer.ts');
  const dual = cons.map((l, i) => [l, i + 1]).filter(([l]) => l.includes('routeSnapForRetrieve ='));
  const dualOk = dual.length === 1 && (cons[dual[0][1]] ?? '').includes('getInterviewRouteSnapshotForAdaptiveRole');
  A('A5 routeSnapForRetrieve 赋值(含续行)=双轨读(getInterviewRouteSnapshotForAdaptiveRole)',
    dualOk, `line ${dual.length ? dual[0][1] : '?'}-${dual.length ? dual[0][1] + 1 : '?'}`);
  A('A5b 消费面旧表直读退役(不再调用 getInterviewRouteSnapshot)',
    !cons.some((l) => l.includes('getInterviewRouteSnapshot(')));
}
A('A6 interview_route_snapshot 在 job-route-decision 的命中={333,358}(零触面行号原值)', (() => {
  const hits = linesOf('packages/db/src/routing/job-route-decision.ts')
    .map((l, i) => (l.includes('interview_route_snapshot') ? i + 1 : 0)).filter(Boolean);
  return JSON.stringify(hits) === JSON.stringify([333, 358]);
})());
{
  const cr = read('packages/db/src/routing/candidate-route.ts');
  const hits = cr.split('\n').map((l, i) => (l.includes('candidate_profile_route_snapshot') ? i + 1 : 0)).filter(Boolean);
  A('A7 candidate snapshot 读/写面在位(INSERT+两 SELECT+头注≥4 命中)', hits.length >= 4 && cr.includes('INSERT INTO candidate_profile_route_snapshot'), hits.join(','));
}
A('A8 crag.ts deny_external 命中={18,34,50,62,75}', (() => {
  const hits = linesOf('packages/domain/src/crag.ts')
    .map((l, i) => (l.includes('deny_external') ? i + 1 : 0)).filter(Boolean);
  return JSON.stringify(hits) === JSON.stringify([18, 34, 50, 62, 75]);
})());

/* ── §5.6 静态断言(Ban 邻面零触) ── */
A('crag.ts 对基线零 diff(决策面/deny_external 链路零变)', git(['diff', '20186718', '--', 'packages/domain/src/crag.ts']) === '');
A('crag.ts 工作树零未提交变更', git(['diff', '--', 'packages/domain/src/crag.ts']) === '');
A('#40 族合同面零触(interview.service/controller)', ['apps/api/src/interview.service.ts', 'apps/api/src/interview.controller.ts']
  .every((f) => git(['diff', '20186718', '--', f]) === ''));
A('LEVEL-SCHEME 落卷面零触(0160 两迁移+career.ts)', ['packages/db/migrations/0160_level_policy_version.sql', 'packages/db/migrations/0160_b_qualitative_projection.sql', 'apps/api/src/career/career.ts']
  .every((f) => git(['diff', '20186718', '--', f]) === ''));
A('embedding compute seam 零触(qbank-embedding-compute-seams)', git(['diff', '20186718', '--', 'apps/worker/src/qbank-embedding-compute-seams.ts']) === '');
A('G-R2-5 门语义字面在位(qbank-retrieve-scope 缺行缺叶同拒)',
  read('apps/worker/src/qbank-retrieve-scope.ts').includes("reason: 'route_snapshot_missing'"));
{
  const cons = linesOf('apps/worker/src/interview-consumer.ts');
  const consumerDual = cons.findIndex((l) => l.includes('getInterviewRouteSnapshotForAdaptiveRole'));
  A('消费面双轨读源在位(interview-consumer → ForAdaptiveRole)', consumerDual >= 0, `line ${consumerDual + 1}`);
}
A('派发层双轨读源在位(qbank-track-local-retrieval Phase 1 → ForAdaptiveRole)',
  read('packages/db/src/qbank/qbank-track-local-retrieval.ts').includes('getInterviewRouteSnapshotForAdaptiveRole'));

/* ── §5.8 markers=0(运行时组装词面·消除门自指) ── */
{
  const words = [['T', 'O', 'D', 'O'].join(''), ['F', 'I', 'X', 'M', 'E'].join(''), ['X', 'X', 'X'].join(''), ['H', 'A', 'C', 'K'].join('')];
  const conflict = ['<' + '<' + '<' + '<' + '<' + '<', '>' + '>' + '>' + '>' + '>' + '>'].join('|');
  const changed = git(['diff', '--name-only', '20186718']).split('\n').map((s) => s.trim()).filter(Boolean)
    .concat(git(['ls-files', '--others', '--exclude-standard']).split('\n').map((s) => s.trim()).filter(Boolean));
  const hits = [];
  for (const rel of changed) {
    let text = '';
    try { text = readFileSync(join(ROOT, rel), 'utf8'); } catch { continue; }
    for (const w of words) if (text.includes(w)) hits.push(`${rel}::${w}`);
    if (new RegExp(conflict).test(text)) hits.push(`${rel}::conflict-marker`);
  }
  A('markers=0(改动集五类标记词零命中)', hits.length === 0, hits.join(' | '));
  A('改动集文件可枚举(基线 diff+未跟踪)', changed.length > 0, `${changed.length} files`);
}

/* ── 迁移编号裁决(0161 主线占用→0162 起号) ── */
{
  const migs = git(['ls-files', '--others', '--exclude-standard', 'packages/db/migrations'])
    .split('\n').map((s) => s.trim()).filter((s) => s.endsWith('.sql'));
  const tracked = git(['ls-files', 'packages/db/migrations']).split('\n').map((s) => s.trim()).filter((s) => s.endsWith('.sql'));
  const all = [...new Set([...tracked, ...migs])].sort();
  const mine = all.filter((f) => f.includes('0162_') || f.includes('0163_'));
  A('本刀迁移=0162/0163(0161 主线 G5 占用·后到者重编号裁决)', mine.length === 2
    && mine.some((f) => f.includes('0162_qbank_served_question_ref'))
    && mine.some((f) => f.includes('0163_qbank_plan_snapshot_interview_fk')), mine.join(' , '));
}

console.log(`\n${fail === 0 ? 'H2 QBANK-CORPUS 静态门全部通过' : `${fail} 个静态断言失败`}`);
process.exit(fail === 0 ? 0 : 1);
