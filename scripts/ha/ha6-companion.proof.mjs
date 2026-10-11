#!/usr/bin/env node
/**
 * HA-6 companion prove — static only (est live=0 · 零容器 up · 零网络外呼 · 零模型外调).
 *
 * R-20 连接预算帽 + R-21 PgBouncer 裁决 + R-23 多实例状态处置 配套 proof。
 * REQUEST: ai-docs/delivery/harness/ha-6-companion-REQUEST.md · base 20186718 · HEAD 8ba93f0b
 *
 * B1（沙箱 PG 活体 pg_stat_activity 探针）经协调方裁定【裁撤】，本脚本不实现 B 组、
 * 无 MEETWISE_HA6_PROOF_AUTHORIZED 授权闸。裁撤理由（落卷 ai-docs/delivery/harness/
 * ha-6-companion-disposition.md §四）：
 *   1) 沙箱 PG（tmpfs pgvector:pg16）max_connections 走镜像默认 100，与生产云参数不同值，
 *      活体读数不可外推到生产预算面；
 *   2) 静态断言已闭合三风险面（A1 算术/A2 config 锚传播/A4 负断言）；
 *   3) est live=0 全保。
 *
 * A1 预算算术：PGPOOL_MAX 单值解析 + principal.ts:946 单源 + 恰两处显式 max:1 +
 *   6P+4 公式双断言（P=12→76·余 21·≤97）+ [10,15] 端点数字 + 越界 FAIL=漂移门。
 * A2 锚传播：compose.prod+ha 双文件全 `:?` 必填变量动态枚举 stub（ha-2 B8 口径，
 *   实测 85 distinct + MEETWISE_HA_WEB_B_HOST_PORT 显式旋钮 = 86 stub）→ config EXIT=0，
 *   api-a/api-b/worker-a/worker-b 四 service environment 含 PGPOOL_MAX="12"；
 *   原 api/worker/web 经 profiles ha-disabled 在渲染输出缺席（RX-1 面）。
 * A3 13 流 census：与 receipts/ha-1/rate-limit-dilution.json current 列逐流全等 +
 *   本刀 receipts/ha-6/rate-limit-census.json 13 行点数闭合 + 漂移「6 流 7 对 5 组」
 *   精确口径在卷 + 7 对新行号逐行命中（行号再漂=FAIL→回 REQUEST 补审）+ 6 处零漂常量。
 * A4 负断言：pgbouncer 于 docker/scripts/packages/apps 四面零命中（本脚本自排除自身
 *   文件——席2 注记 3·路径过滤）+ docker/ 面 max_connections 零命中 + apps/api/package.json
 *   redis 依赖零命中。
 * A5 治理回归：principal.ts（946-964 池参数面·HA-3 已落）零 diff + probe.multi.mjs 零改 +
 *   compose.ha.yml 恰一行新增（1 insertion 0 deletion）+ 既有 compose 治理面零触 +
 *   根 package.json additive（既有脚本零删改）。
 *
 * releaseEvidence=false. NOT HA. prove EXIT=0 ≠ DONE (claimDone=false).
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(join(dirname(fileURLToPath(import.meta.url)), '..', '..'));
const SELF = join(root, 'scripts/ha/ha6-companion.proof.mjs');
const rel = (p) => resolve(p).slice(root.length + 1);

let exitCode = 0;
const lines = [];
function pass(msg) { lines.push(`PASS  ${msg}`); }
function fail(msg) { lines.push(`FAIL  ${msg}`); exitCode = 1; }
function check(ok, okMsg, failMsg) { if (ok) pass(okMsg); else fail(failMsg); }
function readRepoText(p) { return readFileSync(join(root, p), 'utf8'); }
function lineAt(text, n) { return (text.split('\n')[n - 1] ?? ''); }

// 治理基线 = REQUEST 落卷提交（派单钉：HEAD 8ba93f0b·父=20186718）。
// 对该基线取工作树 diff：commit 前后读数一致，且同时捕获「未提交越触」与「已提交越触」。
const BASELINE = '8ba93f0b';

/** git-tracked + untracked-non-ignored file list under dirs (rg-face semantics). */
function repoFiles(dirs) {
  const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', ...dirs], {
    cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\n').filter(Boolean);
}

// ---------------------------------------------------------------------------
// A1 预算算术断言
// ---------------------------------------------------------------------------
const PGPOOL_MIN = 10;
const PGPOOL_MAX_BOUND = 15;
const PG_DEFAULTS = 20;
const PG_MIRROR_DEFAULT_MAX = 100;
const PG_SUPERUSER_RESERVED = 3;
const PG_APP_CAP = PG_MIRROR_DEFAULT_MAX - PG_SUPERUSER_RESERVED; // 97

const haComposeRaw = readRepoText('docker/compose.ha.yml');
const haComposeLines = haComposeRaw.split('\n');

// 锚块结构解析：x-ha-cloud-runtime-env 定义行起，至下一 0 缩进顶层键止。
const anchorStartIdx = haComposeLines.findIndex((l) => l.startsWith('x-ha-cloud-runtime-env:'));
check(anchorStartIdx === 50, `compose.ha.yml x-ha-cloud-runtime-env anchor defined at line 51 (got ${anchorStartIdx + 1})`,
  'compose.ha.yml anchor x-ha-cloud-runtime-env not at line 51 — structure drift');
let anchorEndIdx = haComposeLines.length;
for (let i = anchorStartIdx + 1; i < haComposeLines.length; i++) {
  if (/^[^\s#-]/.test(haComposeLines[i])) { anchorEndIdx = i; break; }
}
const anchorBlock = haComposeLines.slice(anchorStartIdx, anchorEndIdx);

const pgpoolLines = anchorBlock.filter((l) => /^  PGPOOL_MAX:/.test(l));
check(pgpoolLines.length === 1, 'anchor block contains exactly one PGPOOL_MAX key',
  `anchor block PGPOOL_MAX key count ${pgpoolLines.length} != 1`);
const P = Number((pgpoolLines[0]?.match(/^  PGPOOL_MAX:\s*"?(\d+)"?$/) ?? [])[1]);
check(Number.isInteger(P), `PGPOOL_MAX parses as integer (got ${pgpoolLines[0]})`,
  `PGPOOL_MAX value not an integer: ${pgpoolLines[0]}`);
check(P >= PGPOOL_MIN && P <= PGPOOL_MAX_BOUND, `P=${P} within dual-review window [${PGPOOL_MIN},${PGPOOL_MAX_BOUND}]`,
  `P=${P} out of [${PGPOOL_MIN},${PGPOOL_MAX_BOUND}] — 修法漂移，回 REQUEST 补审（越界漂移门）`);

// 单源锚 principal.ts:946
const principal = readRepoText('packages/db/src/principal.ts');
const l946 = lineAt(principal, 946);
check(/max: Number\(o\.max \?\? process\.env\.PGPOOL_MAX \?\? 20\)/.test(l946),
  'principal.ts:946 single-source pool max expression pinned',
  'principal.ts:946 pool max single-source expression drifted');

// 显式 max:1 生产池恰两处（sse-listen / job-wakeup）
const maxOneExpected = new Set([
  'apps/api/src/platform/sse-notify.service.ts:151',
  'apps/worker/src/main.ts:661',
]);
const maxOneHits = [];
for (const f of repoFiles(['apps', 'packages'])) {
  if (!/\.(ts|mts|mjs)$/.test(f)) continue;
  const t = readFileSync(join(root, f), 'utf8');
  t.split('\n').forEach((l, i) => {
    if (/createPool\(\{\s*max: 1\s*,/.test(l)) maxOneHits.push(`${f}:${i + 1}`);
  });
}
check(maxOneHits.length === 2 && maxOneHits.every((h) => maxOneExpected.has(h)),
  `explicit max:1 production pool sites exactly two: ${maxOneHits.join(' + ')}`,
  `explicit max:1 census drifted: got [${maxOneHits.join(', ')}] expected [${[...maxOneExpected].join(', ')}]`);
check(/max: 1, purpose: 'sse-listen'/.test(lineAt(readRepoText('apps/api/src/platform/sse-notify.service.ts'), 151)),
  'sse-notify.service.ts:151 sse-listen max:1 pin',
  'sse-notify.service.ts:151 content drifted');
check(/createPool\(\{ max: 1, purpose: 'job-wakeup' \}/.test(lineAt(readRepoText('apps/worker/src/main.ts'), 661)),
  'worker main.ts:661 job-wakeup max:1 pin',
  'worker main.ts:661 content drifted');

// 6P+4 公式与数字双断言（调 P 必须同步改预期=漂移门）
const EXPECTED_P = 12;
const steady = 6 * P + 4;
check(steady === 6 * EXPECTED_P + 4 && steady === 76,
  `budget arithmetic: 6P+4 = ${steady} at P=${P} (expected 76 at P=12)`,
  `budget arithmetic drifted: 6P+4=${steady}, expected 76 at P=12 — P 调值未同步预期`);
check(steady <= PG_APP_CAP, `post-cap steady ${steady} <= PG app cap ${PG_APP_CAP}`,
  `post-cap steady ${steady} exceeds PG app cap ${PG_APP_CAP}`);
check(PG_APP_CAP - steady === 21, `headroom = ${PG_APP_CAP} - ${steady} = ${PG_APP_CAP - steady} (expected 21)`,
  `headroom drifted: ${PG_APP_CAP - steady} != 21`);
check(6 * PGPOOL_MIN + 4 === 64 && 6 * PGPOOL_MIN + 4 <= PG_APP_CAP,
  `window lower endpoint P=${PGPOOL_MIN}: 6P+4=64 <= ${PG_APP_CAP}`,
  'window lower endpoint arithmetic wrong');
check(6 * PGPOOL_MAX_BOUND + 4 === 94 && 6 * PGPOOL_MAX_BOUND + 4 <= PG_APP_CAP,
  `window upper endpoint P=${PGPOOL_MAX_BOUND}: 6P+4=94 <= ${PG_APP_CAP}`,
  'window upper endpoint arithmetic wrong');
check(6 * (PGPOOL_MAX_BOUND + 1) + 4 === 100 && 6 * (PGPOOL_MAX_BOUND + 1) + 4 > PG_APP_CAP,
  'P=16 out-of-window: 6P+4=100 > 97 (越界即超售，漂移门自洽)',
  'P=16 boundary arithmetic wrong');

// 现状帧对照账（P=20 默认帧）与单副本账
check(6 * PG_DEFAULTS + 4 === 124, `current-frame steady (no cap, P=${PG_DEFAULTS}) = ${6 * PG_DEFAULTS + 4} (expected 124)`,
  'current-frame 124 arithmetic wrong');
check((PG_DEFAULTS + 1) + (2 * PG_DEFAULTS + 1) === 62, `single-replica current account api ${PG_DEFAULTS + 1} + worker ${2 * PG_DEFAULTS + 1} = 62`,
  'single-replica 62 arithmetic wrong');

// 共址 worst-case（帽后帧）：76 + 3 条件池 ×2 副本 ×P
check(steady + 3 * 2 * P === 148, `co-location worst-case (post-cap frame) = ${steady} + 72 = ${steady + 3 * 2 * P} (expected 148)`,
  'co-location worst-case 148 arithmetic wrong');

// ---------------------------------------------------------------------------
// A2 锚传播断言（compose config 渲染）
// ---------------------------------------------------------------------------
const composeFiles = ['docker/compose.prod.yml', 'docker/compose.ha.yml'];
const requiredVars = new Set();
for (const f of composeFiles) {
  for (const m of readRepoText(f).matchAll(/\$\{([A-Z_0-9]+):\?/g)) requiredVars.add(m[1]);
}
const stubEnv = { ...process.env, MEETWISE_HA_WEB_B_HOST_PORT: '3001' };
[...requiredVars].forEach((v, i) => { stubEnv[v] = `ha6-stub-${i}`; });
const stubCount = requiredVars.size + 1;

const cfg = spawnSync('docker', ['compose', '-f', 'docker/compose.prod.yml', '-f', 'docker/compose.ha.yml', 'config'], {
  cwd: root, env: stubEnv, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
});
check(cfg.status === 0 && typeof cfg.stdout === 'string' && cfg.stdout.length > 0,
  `docker compose -f compose.prod.yml -f compose.ha.yml config EXIT=0 with ${requiredVars.size} enumerated :? stubs + 1 explicit knob = ${stubCount} stub entries (ha-2 B8 口径 · dispatch 86 stub 闭合)`,
  `docker compose config failed EXIT=${cfg.status}: ${(cfg.stderr || '').split('\n').slice(0, 5).join(' | ')}`);

if (cfg.status === 0) {
  // services 段块解析（2 空格缩进 service 名）
  const outLines = cfg.stdout.split('\n');
  const servicesIdx = outLines.findIndex((l) => l === 'services:');
  const serviceBlocks = new Map();
  let current = null;
  let inServices = false;
  for (let i = servicesIdx; i < outLines.length; i++) {
    const l = outLines[i];
    if (i > servicesIdx && /^[^\s]/.test(l)) { inServices = false; current = null; continue; }
    const m = inServices ? l.match(/^  ([A-Za-z0-9_-]+):\s*$/) : null;
    if (m) { current = m[1]; serviceBlocks.set(current, []); continue; }
    if (inServices && current) serviceBlocks.get(current).push(l);
    if (i === servicesIdx) inServices = true;
  }
  const rendered = [...serviceBlocks.keys()].sort();
  check(rendered.length > 0, `rendered config services parsed: ${rendered.join(', ')}`,
    'rendered config services parse produced zero service blocks');
  for (const svc of ['api-a', 'api-b', 'worker-a', 'worker-b']) {
    const block = serviceBlocks.get(svc) ?? [];
    check(block.some((l) => l.trim() === 'PGPOOL_MAX: "12"'),
      `service ${svc} environment inherits PGPOOL_MAX="12" via anchor merge`,
      `service ${svc} missing PGPOOL_MAX="12" — YAML anchor merge not propagating`);
  }
  for (const svc of ['api', 'worker', 'web']) {
    check(!serviceBlocks.has(svc),
      `original service ${svc} absent from rendered config (profiles ha-disabled · RX-1 面)`,
      `original service ${svc} present in rendered config — ha-disabled 覆盖失效，up 必端口冲突/假绿`);
  }
}

// C1 恰一行：compose.ha.yml 对 REQUEST 基线（8ba93f0b）恰 1 insertion / 0 deletion
const numstat = execFileSync('git', ['diff', '--numstat', BASELINE, '--', 'docker/compose.ha.yml'], { cwd: root, encoding: 'utf8' }).trim();
check(/^1\t0\tdocker\/compose\.ha\.yml$/.test(numstat),
  `docker/compose.ha.yml diff vs REQUEST baseline ${BASELINE} is exactly +1/-0 (${numstat || '(no diff — C1 baseline drifted?)'})`,
  `docker/compose.ha.yml diff vs REQUEST baseline ${BASELINE} is not exactly one added line: "${numstat}"`);

// 锚四消费点结构断言（api ×2 直挂 · worker ×2 另并 native-model-env）
const consumeLines = haComposeLines
  .map((l, i) => ({ l, n: i + 1 }))
  .filter(({ l }) => /^\s+<<:\s+(\[\s*)?\*ha-cloud-runtime-env/.test(l));
check(consumeLines.length === 4,
  `x-ha-cloud-runtime-env consumed by exactly 4 service environment blocks (${consumeLines.map((c) => `:${c.n}`).join(' ')})`,
  `x-ha-cloud-runtime-env consumption point count ${consumeLines.length} != 4`);

// ---------------------------------------------------------------------------
// A3 13 流 census 断言
// ---------------------------------------------------------------------------
const ha1 = JSON.parse(readRepoText('receipts/ha-1/rate-limit-dilution.json'));
const census = JSON.parse(readRepoText('receipts/ha-6/rate-limit-census.json'));
check(ha1.perFlowTable?.length === 13, 'ha-1 dilution receipt has 13 flow rows',
  `ha-1 dilution receipt rows ${ha1.perFlowTable?.length} != 13`);
check(census.perFlowTable?.length === 13, 'ha-6 census receipt has 13 flow rows',
  `ha-6 census receipt rows ${census.perFlowTable?.length} != 13 — 点数不闭合`);
check(census.countClosure?.flows === 13 && census.countClosure?.driftFlows === 6
  && census.countClosure?.driftPairs === 7 && census.countClosure?.driftGroups === 5,
  'census countClosure = 13 flows / 6 drift flows / 7 pairs / 5 groups',
  'census countClosure drifted from 13/6/7/5');
check(typeof census.driftFraming === 'string' && census.driftFraming.includes('6 流 7 对 5 组'),
  'census carries exact drift framing 「6 流 7 对 5 组」 (禁只写「5 锚」)',
  'census missing exact drift framing 「6 流 7 对 5 组」');

// 逐流：值与 ha-1 current 列全等 + 新行号码面逐行命中（漂移表 7 对新锚实树一致·再漂=FAIL）
const pins = [
  { file: 'apps/api/src/modules/auth/auth.service.ts', lines: { 28: /signup:\$\{b\.email\}`, 3, 0\.02/ }, flow: 0 },
  { file: 'apps/api/src/modules/auth/auth.service.ts', lines: { 11: /'10,0\.05'/, 12: /SIGNUP_IP_CAPACITY/, 13: /SIGNUP_IP_REFILL/ }, flow: 1 },
  { file: 'apps/api/src/modules/auth/auth.service.ts', lines: { 28: /'signup:global', 60, 1/ }, flow: 2 },
  { file: 'apps/api/src/modules/auth/auth.service.ts', lines: { 54: /login:\$\{b\.email\}`, 5, 0\.2/ }, flow: 3 },
  { file: 'apps/api/src/modules/recruiter/recruiter.service.ts', lines: { 114: /invite:\$\{principal\}`, 12, 0\.05/ }, flow: 4 },
  { file: 'apps/api/src/modules/recruiter/recruiter.service.ts', lines: { 116: /invite:ip:\$\{ip \?\? 'unknown'\}`, 12, 0\.05/ }, flow: 5 },
  { file: 'apps/api/src/modules/quiz/quiz.controller.ts', lines: { 56: /acquireSlot\(slotKey, 5\)/ }, flow: 6 },
  { file: 'apps/api/src/modules/interview/interview.controller.ts', lines: { 262: /acquireSlot\(slotKey, 5\)/ }, flow: 7 },
  { file: 'apps/api/src/modules/resume/resume.service.ts', lines: { 36: /resume-file:\$\{principal\}`, 15, 0\.1/ }, flow: 8 },
  { file: 'apps/api/src/modules/resume/resume.service.ts', lines: { 20: /PARSE_MAX = Number\(process\.env\.RESUME_PARSE_MAX \?\? 6\)/, 48: /acquireSlot\('resume-parse:global', PARSE_MAX\)/ }, flow: 9 },
  { file: 'apps/api/src/modules/interview/interview.service.ts', lines: { 25: /VOICE_RL = \{ capacity: 40, refillPerSec: 0\.3 \}/, 338: /voice:\$\{principal\}`, VOICE_RL\.capacity/ }, flow: 10 },
  { file: 'apps/api/src/modules/interview/interview.service.ts', lines: { 27: /TURN_RL = \{ capacity: 30, refillPerSec: 0\.2 \}/, 399: /turn:\$\{principal\}`, TURN_RL\.capacity/, 432: /turn:\$\{principal\}`, TURN_RL\.capacity/ }, flow: 11 },
  { file: 'apps/api/src/modules/interview/interview.service.ts', lines: { 30: /REPORT_RETRY_RL = \{ capacity: 3, refillPerSec: 3 \/ 3600 \}/, 701: /'report_retry:' \+ id, REPORT_RETRY_RL\.capacity/ }, flow: 12 },
];
const fileCache = new Map();
for (const pin of pins) {
  if (!fileCache.has(pin.file)) fileCache.set(pin.file, readRepoText(pin.file).split('\n'));
  const fl = fileCache.get(pin.file);
  const row = census.perFlowTable[pin.flow];
  const ha1Row = ha1.perFlowTable[pin.flow];
  check(row?.current === ha1Row?.current,
    `flow #${pin.flow + 1} value all-equal vs ha-1 current column: "${row?.current}"`,
    `flow #${pin.flow + 1} value drifted: census "${row?.current}" vs ha-1 "${ha1Row?.current}"`);
  for (const [n, re] of Object.entries(pin.lines)) {
    check(re.test(fl[Number(n) - 1] ?? ''),
      `${pin.file}:${n} hits expected pin (drift-table re-pin)`,
      `${pin.file}:${n} no longer matches expected anchor content — 行号再漂，回 REQUEST 补审`);
  }
}

// 6 处零漂常量同表断言（census zeroDriftConstants 记账面）
check(census.zeroDriftConstants?.count === 6 && census.zeroDriftConstants?.places?.length === 6,
  'census zero-drift constant places count = 6',
  `census zero-drift constants count drifted: ${census.zeroDriftConstants?.count}/${census.zeroDriftConstants?.places?.length} != 6/6`);

// ---------------------------------------------------------------------------
// A4 负断言（W2/W3 不引入面 · 本脚本自排除自身文件——席2 注记 3）
// ---------------------------------------------------------------------------
const FACES = ['docker', 'scripts', 'packages', 'apps'];
const scanFiles = repoFiles(FACES).filter((f) => resolve(root, f) !== SELF);
let pgbouncerHits = [];
let dockerMaxConnHits = [];
let scanned = 0;
for (const f of scanFiles) {
  let t;
  try {
    const abs = join(root, f);
    if (!existsSync(abs)) continue;
    const buf = readFileSync(abs);
    if (buf.includes(0)) continue; // binary skip
    if (buf.length > 4 * 1024 * 1024) continue; // oversized fixture skip
    t = buf.toString('utf8');
  } catch { continue; }
  scanned++;
  if (/pgbouncer/i.test(t)) pgbouncerHits.push(f);
  if (f.startsWith('docker/') && /max_connections/.test(t)) dockerMaxConnHits.push(f);
}
check(pgbouncerHits.length === 0,
  `negative: "pgbouncer" zero hits across docker/scripts/packages/apps (${scanned} text files scanned, proof self-excluded)`,
  `negative violated: pgbouncer hits: ${pgbouncerHits.join(', ')}`);
check(dockerMaxConnHits.length === 0,
  `negative: "max_connections" zero hits across docker/ (all compose+monitoring yml)`,
  `negative violated: docker/ max_connections hits: ${dockerMaxConnHits.join(', ')}`);
const apiPkg = readRepoText('apps/api/package.json');
check(!/redis/i.test(apiPkg), 'negative: apps/api/package.json zero "redis" (dependency face)',
  'negative violated: apps/api/package.json contains redis dependency face');

// ---------------------------------------------------------------------------
// A5 治理回归断言
// ---------------------------------------------------------------------------
function gitDiffEmpty(path) {
  const d = execFileSync('git', ['diff', BASELINE, '--', path], { cwd: root, encoding: 'utf8' });
  return d.trim() === '';
}
check(gitDiffEmpty('packages/db/src/principal.ts'),
  `packages/db/src/principal.ts zero diff vs REQUEST baseline ${BASELINE} (池参数/池创建面零触 · R-22 面零重做)`,
  'packages/db/src/principal.ts has diff vs REQUEST baseline — 产品码越触');
const principalLines = principal.split('\n');
check(/keepAlive: true/.test(principalLines[956]) &&
  /query_timeout: Number\(process\.env\.PG_QUERY_TIMEOUT_MS \?\? 15000\)/.test(principalLines[963]),
  'principal.ts:957 keepAlive + :964 query_timeout HA-3 face pinned (946-964 零改)',
  'principal.ts 946-964 HA-3 pool-param face drifted');
check(gitDiffEmpty('scripts/ha/probe.multi.mjs'),
  `scripts/ha/probe.multi.mjs zero diff vs REQUEST baseline ${BASELINE} (fail-closed 面零改零弱化)`,
  'scripts/ha/probe.multi.mjs has diff vs REQUEST baseline — 治理越触');

const BANNED_COMPOSE = [
  'docker/compose.prod.yml', 'docker/compose.prod.override.yml', 'docker/compose.monitoring.yml',
  'docker/compose.ha-dual.yml', 'docker/compose.ha-dual.pg.yml', 'docker/compose.ha-dual.shared.yml',
  'docker/compose.ha-dual.skeleton.yml', 'docker/compose.ha.sandbox.yml',
  'docker/compose.dev.yml', 'docker/compose.demo.yml', 'docker/compose.backup.yml',
  'docker/compose.backup.sandbox.yml', 'docker/compose.mysql-local.yml',
  'docker/compose.ha-2-proof.yml', 'docker/compose.ha-3-proof.yml',
];
const touched = BANNED_COMPOSE.filter((f) => !gitDiffEmpty(f));
check(touched.length === 0,
  `既有治理 compose 零原地改（${BANNED_COMPOSE.length} files checked · 唯一落点=compose.ha.yml 一行）`,
  `Ban violated: existing compose touched: ${touched.join(', ')}`);

// 根 package.json additive：相对 REQUEST 基线既有脚本零删改 + ha6 注册在位（commit 前后同读数）
const headPkg = JSON.parse(execFileSync('git', ['show', `${BASELINE}:package.json`], { cwd: root, encoding: 'utf8' }));
const curPkg = JSON.parse(readRepoText('package.json'));
const headScripts = headPkg.scripts ?? {};
const curScripts = curPkg.scripts ?? {};
const removedOrChanged = Object.entries(headScripts).filter(([k, v]) => curScripts[k] !== v);
check(removedOrChanged.length === 0,
  `root package.json existing scripts zero removal/zero change (${Object.keys(headScripts).length} keys intact)`,
  `package.json additive violated: ${removedOrChanged.map(([k]) => k).join(', ')}`);
check(curScripts['ha6:prove'] === 'node scripts/ha/ha6-companion.proof.mjs',
  'root package.json registers ha6:prove -> node scripts/ha/ha6-companion.proof.mjs (additive)',
  `package.json ha6:prove registration drifted: ${curScripts['ha6:prove']}`);
check(existsSync(join(root, 'receipts/ha-6/resource-budget.json')) &&
  existsSync(join(root, 'receipts/ha-6/rate-limit-census.json')),
  'receipts/ha-6/ artifacts present (resource-budget + rate-limit-census)',
  'receipts/ha-6/ artifacts missing');

// ---------------------------------------------------------------------------
// 输出
// ---------------------------------------------------------------------------
for (const line of lines) console.log(line);

console.log('haStatus: NOT_HA');
console.log('releaseEvidence: false');
console.log('claimProductionHA: false');
console.log('note: B1 sandbox live probe CUT by coordinator ruling (see header); static assertions close all three risk faces; est live=0');
console.log(`note: P=${P} steady=${steady} headroom=${PG_APP_CAP - steady} worstCaseCoLocated=${steady + 3 * 2 * P} pgAppCap=${PG_APP_CAP}`);
console.log(`CMD=node ${SELF} EXIT=${exitCode}`);
process.exit(exitCode);
