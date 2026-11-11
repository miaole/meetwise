/**
 * H2 QBANK-CORPUS 静态门(§5.1 锚复现 + §5.6 静态断言 + §5.8 markers/est 面)·零 PG 零外呼。
 *
 * 覆盖:
 *  - §5.1 全锚逐条复现(行号集合与卷一致;draft 系 docs-only,代码锚在 20186718 基线行号上成立)。
 *  - §5.6 静态断言:crag.ts 对基线零 diff(deny_external/gradeRetrieval 决策面零变)·G-R2-5 门语义
 *    字面在位(缺行/缺叶同拒·永不 unscoped)·#40 合同面/LEVEL-SCHEME 落卷面零触;
 *    embedding compute seam 对 HARDEN-R1 钉(f40577fde,已合入 main 的安全硬化)零触——
 *    相对 20186718 仅允许该已审查改动(Redis eval → sendCommand(['EVAL', …]))，不回滚硬化,
 *    其后对 seam 的真实改动仍必须红。
 *  - §5.8 markers=0:只扫产品源码改动集的新增行(及未跟踪产品源码全文)五类标记词零命中。
 *    范围见下方 SECTION 注释:排除 ai-docs/、receipts/、扫描器自身与锁文件;
 *    不把 20186718 以来整仓 ~4865 文件当改动集,也不去删历史文档里的词。
 *    词面在运行时组装,消除门自指(「词不复抄」纪律的机检化)。
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
const GIT_OPTS = { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 };
const git = (args) => { try { return execFileSync('git', args, GIT_OPTS); } catch { return ''; } };
/** fail-closed: 失败时 ok=false,不得把空输出当成零 diff。maxBuffer 放大以容纳对 20186718 的产品源码统一 diff。 */
const gitRun = (args) => {
  try {
    return { ok: true, out: execFileSync('git', args, GIT_OPTS) };
  } catch (err) {
    const stderr = err && typeof err === 'object' && 'stderr' in err ? String(err.stderr ?? '') : '';
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, out: stderr || msg };
  }
};

/** 扫 TypeScript 非注释残码（行注释/块注释剔除；模板字符串与引号内的内容视为代码）。 */
function tsLineResiduals(src) {
  const residuals = [];
  let state = 'code'; // code | block | sq | dq | tmpl
  let tmplExpr = 0;
  for (const line of src.split('\n')) {
    let residual = '';
    let i = 0;
    const n = line.length;
    while (i < n) {
      const ch = line[i];
      const nxt = i + 1 < n ? line[i + 1] : '';
      if (state === 'block') {
        if (ch === '*' && nxt === '/') { state = 'code'; i += 2; continue; }
        i += 1; continue;
      }
      if (state === 'sq' || state === 'dq') {
        const q = state === 'sq' ? "'" : '"';
        residual += ch;
        if (ch === '\\') { residual += (nxt || ''); i += 2; continue; }
        if (ch === q) state = 'code';
        i += 1; continue;
      }
      if (state === 'tmpl') {
        residual += ch;
        if (ch === '\\') { residual += (nxt || ''); i += 2; continue; }
        if (ch === '`') { state = 'code'; i += 1; continue; }
        if (ch === '$' && nxt === '{') { tmplExpr += 1; residual += nxt; i += 2; continue; }
        if (ch === '}' && tmplExpr > 0) tmplExpr -= 1;
        i += 1; continue;
      }
      // code
      if (ch === '/' && nxt === '/') break;
      if (ch === '/' && nxt === '*') { state = 'block'; i += 2; continue; }
      if (ch === "'") { state = 'sq'; residual += ch; i += 1; continue; }
      if (ch === '"') { state = 'dq'; residual += ch; i += 1; continue; }
      if (ch === '`') { state = 'tmpl'; residual += ch; i += 1; continue; }
      residual += ch;
      i += 1;
    }
    residuals.push(residual);
  }
  return residuals;
}

const A6_TABLE = 'interview_route_snapshot';
const A6_INSERT_RE = /INSERT INTO interview_route_snapshot\s*\(/;
const A6_FROM_RE = /FROM interview_route_snapshot/;
const A6_FILE = 'packages/db/src/routing/job-route-decision.ts';
function evalA6(src) {
  const residuals = tsLineResiduals(src);
  const hits = residuals.map((code, i) => (code.includes(A6_TABLE) ? i + 1 : 0)).filter(Boolean);
  const hasInsert = hits.some((n) => A6_INSERT_RE.test(residuals[n - 1] ?? ''));
  const hasSelect = hits.some((n) => A6_FROM_RE.test(residuals[n - 1] ?? ''));
  return { ok: hits.length === 2 && hasInsert && hasSelect, hits };
}


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
{
  // A6 内容门（#259 P1 / 对等 ha6 A1）：只扫非注释残码，且 INSERT/SELECT 必须落在命中行上，
  // 不得用全文 test(src)（注释或删 SQL 只留关键词会假绿）。行号只作读数。
  const src = read(A6_FILE);
  const a6 = evalA6(src);
  A('A6 interview_route_snapshot 在 job-route-decision 恰 2 处（非注释行 INSERT 写 + SELECT 读·内容门·行号非门读数）',
    a6.ok, a6.hits.join(','));
  if (a6.hits.length) {
    const commented = src.split('\n').map((l, i) => (a6.hits.includes(i + 1) ? l.replace(/^(\s*)/, '$1// ') : l)).join('\n');
    const c = evalA6(commented);
    A('A6 反证：把两处命中行改成注释后必须红', !c.ok, `hits=${c.hits.join(',') || '0'}`);
    const wiped = src.split('\n');
    for (const n of a6.hits) wiped[n - 1] = '';
    wiped.splice((a6.hits[0] ?? 1) - 1, 0, '  /* INSERT INTO interview_route_snapshot(', '       FROM interview_route_snapshot */');
    const k = evalA6(wiped.join('\n'));
    A('A6 反证：删除真实 SQL、只在注释块保留关键词必须红', !k.ok, `hits=${k.hits.join(',') || '0'}`);
  }
}
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
{
  // 语义门:相对 20186718 的唯一已审差是 HARDEN-R1(f40577fde,已是 origin/main 祖先)把
  // Redis eval 改为 sendCommand(['EVAL', …])——安全硬化,不回滚。把本文件的零触基线前移到
  // 该已审提交;git 失败不得假绿;此后任何对 seam 的改动仍红。
  const SEAM = 'apps/worker/src/qbank-embedding-compute-seams.ts';
  const SEAM_PIN = 'f40577fde76e0b031fc0239d50b697fcefdb0bb8';
  const anc = gitRun(['merge-base', '--is-ancestor', SEAM_PIN, 'HEAD']);
  const diff = gitRun(['diff', SEAM_PIN, '--', SEAM]);
  A('embedding compute seam 对 HARDEN-R1 钉(f40577fde)零触(仅允许已审 EVAL→sendCommand)',
    anc.ok && diff.ok && diff.out === '',
    !anc.ok ? `pin 非 HEAD 祖先:${anc.out || 'exit 1'}` : (!diff.ok ? `git diff 失败:${diff.out}` : (diff.out === '' ? '' : 'seam 相对 HARDEN-R1 有 diff')));
}
A('G-R2-5 门语义字面在位(qbank-retrieve-scope 缺行缺叶同拒)',
  read('apps/worker/src/qbank-retrieve-scope.ts').includes("reason: 'route_snapshot_missing'"));
{
  const cons = linesOf('apps/worker/src/interview-consumer.ts');
  const consumerDual = cons.findIndex((l) => l.includes('getInterviewRouteSnapshotForAdaptiveRole'));
  A('消费面双轨读源在位(interview-consumer → ForAdaptiveRole)', consumerDual >= 0, `line ${consumerDual + 1}`);
}
A('派发层双轨读源在位(qbank-track-local-retrieval Phase 1 → ForAdaptiveRole)',
  read('packages/db/src/qbank/qbank-track-local-retrieval.ts').includes('getInterviewRouteSnapshotForAdaptiveRole'));

/* ── §5.8 markers=0 ──
 * 扫描范围(产品源码改动集,不是 20186718 以来整仓):
 *   纳入前缀: apps/、packages/、scripts/
 *   排除: 顶层 ai-docs/、receipts/(历史文档/收据——不去删里面的词);
 *         scripts/conflict-marker-scan.mjs 及其 proof(注释会描述标记形制,构成门自指);
 *         锁文件名(完整性哈希会偶然撞上标记词)。
 *   行范围: 只扫相对基线 20186718 的新增行;未跟踪的产品源码扫全文。
 *   既有词留在未改行里(例如 qbank-curation.ts 头注在基线已存在的标记词)不当新引入。
 *   全仓整行冲突标记仍由 conflict-markers:check 覆盖,本门不替代该硬门。
 */
{
  const words = [['T', 'O', 'D', 'O'].join(''), ['F', 'I', 'X', 'M', 'E'].join(''), ['X', 'X', 'X'].join(''), ['H', 'A', 'C', 'K'].join('')];
  const conflict = new RegExp(['<' + '<' + '<' + '<' + '<' + '<', '>' + '>' + '>' + '>' + '>' + '>'].join('|'));
  const PRODUCT_PREFIXES = ['apps/', 'packages/', 'scripts/'];
  const EXCLUDED_PREFIXES = ['ai-docs/', 'receipts/'];
  const EXCLUDED_EXACT = new Set([
    'scripts/conflict-marker-scan.mjs',
    'scripts/conflict-marker-scan.proof.mjs',
  ]);
  const EXCLUDED_BASENAMES = new Set(['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock']);
  const isProductSource = (rel) => {
    const norm = rel.replaceAll('\\', '/');
    const base = norm.split('/').pop() ?? norm;
    if (EXCLUDED_EXACT.has(norm) || EXCLUDED_BASENAMES.has(base)) return false;
    if (EXCLUDED_PREFIXES.some((p) => norm === p.slice(0, -1) || norm.startsWith(p))) return false;
    return PRODUCT_PREFIXES.some((p) => norm === p.slice(0, -1) || norm.startsWith(p));
  };
  const scanText = (rel, text, hits) => {
    for (const w of words) if (text.includes(w)) hits.push(`${rel}::${w}`);
    if (conflict.test(text)) hits.push(`${rel}::conflict-marker`);
  };
  const parseAddedLinesByFile = (diffText) => {
    const byFile = new Map();
    let cur = null;
    for (const line of diffText.split('\n')) {
      if (line.startsWith('+++ b/')) {
        cur = line.slice(6);
        if (cur === '/dev/null') cur = null;
        continue;
      }
      if (cur && line.startsWith('+') && !line.startsWith('+++')) {
        const list = byFile.get(cur) ?? [];
        list.push(line.slice(1));
        byFile.set(cur, list);
      }
    }
    return byFile;
  };

  const nameOnly = git(['diff', '--name-only', '20186718']).split('\n').map((s) => s.trim()).filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard']).split('\n').map((s) => s.trim()).filter(Boolean);
  const scopedTracked = nameOnly.filter(isProductSource);
  const scopedUntracked = untracked.filter(isProductSource);
  const hits = [];
  const addedDiff = gitRun(['diff', '-U0', '20186718', '--', 'apps', 'packages', 'scripts']);
  A('产品源码改动集 diff 可读取(fail-closed)', addedDiff.ok, addedDiff.ok ? '' : addedDiff.out.slice(0, 200));
  if (addedDiff.ok) {
    for (const [rel, lines] of parseAddedLinesByFile(addedDiff.out)) {
      if (!isProductSource(rel)) continue;
      for (const line of lines) scanText(rel, line, hits);
    }
  }
  for (const rel of scopedUntracked) {
    let text = '';
    try { text = readFileSync(join(ROOT, rel), 'utf8'); } catch { continue; }
    scanText(rel, text, hits);
  }
  A('markers=0(产品源码改动集新增行五类标记词零命中)', hits.length === 0, hits.join(' | '));
  A('产品源码改动集可枚举(基线 diff+未跟踪·已收窄范围)', scopedTracked.length + scopedUntracked.length > 0,
    `${scopedTracked.length}+${scopedUntracked.length} product-source files (excluded non-product from ${nameOnly.length}+${untracked.length})`);
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
