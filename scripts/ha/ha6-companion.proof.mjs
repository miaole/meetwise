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
 * HA6-REPIN 漂移账（append-only·禁删改旧行·后续任何再注册/再锚只追加新行）：
 *   2026-10-14 复审 26 红四簇归因：簇 A 20（A3 行号钉全灭）=冻结基线 8ba93f0b 后主线演进
 *     挪行·逐文件主因 commit——auth ee424923（normalizeEmail 内容变）+f31d56d1（await 词面
 *     变）/recruiter d76eb5d2（经 c042729b 并线带入净 +46）/quiz e54fc551/interview.controller
 *     baf31a4e（经 8676777c 并线）/resume 57370d67+86303901/interview.service 7b6d0f38+57370d67；
 *     簇 B/C（max:1 两钉+census 行号集合失配）=位移链——sse-notify baf31a4e→f31d56d1→
 *     8676777c、worker main.ts 接线刀链累积净 +10；簇 D 三红=724d61b5 AG24 sanctioned
 *     合法清理撞冻结基线 diff 门（机制错非行为错·限流/预算值零实质漂移）。
 *   裁决四条：①A3 行号钉→已验真内容正则+count 门（13 流值等断言保留·行号降非门读数）；
 *     ②A5 冻结基线→滚动注册帧（重锚新基线否决·再注册唯一通道=REQUEST 补审 append）；
 *     ③max:1 census→内容集合门；④漂移事实 append-only 登记。
 *   冻结基线 8ba93f0b 退役（由滚动注册帧承替）·初注册提交 8ae2a93e。
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

// ── 滚动注册帧（HA6-REPIN REQUEST sanctioned 2026-10-14·append-only）──
// 再注册唯一通道=REQUEST 补审（授权越触后更新 blob+追加登记行·Ban 静默改 blob）。
const ROLLING_REGISTRY = [
  { file: 'scripts/ha/probe.multi.mjs', blob: 'b91917e8ede075e08b080f7a9ae76933cfe36dcd',
    registered: '8ae2a93e', note: 'HA6-REPIN 初注册（fail-closed 面整文件·旧 8ba93f0b 零 diff 态顺承）' },
  { file: 'package.json', kind: 'scripts-set',
    digest: '106e457929a535e9b87d303b94d7487adbbca054', registered: '8ae2a93e',
    note: 'rev2 R5 基线 scripts 键值集 digest（计算式唯此一条：git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin·8ae2a93e 与 rev2 起草树亲证恒等·Node JSON.stringify 键排序形=96e70b39e30b781c3d9065c071613c9630d4729d 与本值字节不同形已证·rev2 复审 P2 实测勘正原示例 3ef5dc2f 不可复现废·Ban 另造等价形替算）' },
];
const SCRIPTS_MUST_EXIST = ['ha6:prove', 'migrate:prove', 'docs:check', 'drift:prove'];
const SCRIPTS_MUST_NOT_EXIST = ['breaker:prove', 'prove:breaker']; // 724d61b5 AG24 sanctioned 双删·防复活（rev2 R3-P2 补第二键）

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

// 显式 max:1 生产池恰两处（sse-listen / job-wakeup）——内容集合门（HA6-REPIN 内容化·命中行号只作非门读数）
const maxOneHits = [];
for (const f of repoFiles(['apps', 'packages'])) {
  if (!/\.(ts|mts|mjs)$/.test(f)) continue;
  const t = readFileSync(join(root, f), 'utf8');
  t.split('\n').forEach((l, i) => {
    if (/createPool\(\{\s*max: 1\s*,/.test(l)) maxOneHits.push(`${f}:${i + 1}`);
  });
}
const maxOneFiles = [...new Set(maxOneHits.map((h) => h.replace(/:\d+$/, '')))].sort();
const maxOneFilesExpected = ['apps/api/src/platform/sse-notify.service.ts', 'apps/worker/src/main.ts'].sort();
check(maxOneHits.length === 2 && maxOneFiles.join('|') === maxOneFilesExpected.join('|'),
  `explicit max:1 production pool sites exactly two: ${maxOneHits.join(' + ')}`,
  `explicit max:1 census drifted: got [${maxOneHits.join(', ')}] expected files [${maxOneFilesExpected.join(', ')}]`);
const sseMaxOneHits = readRepoText('apps/api/src/platform/sse-notify.service.ts').split('\n')
  .map((l, i) => ({ l, n: i + 1 }))
  .filter(({ l }) => /createPool\(\{ max: 1, purpose: 'sse-listen' \}\)/.test(l));
check(sseMaxOneHits.length === 1,
  `sse-notify.service.ts sse-listen max:1 content pin exactly one line (:${sseMaxOneHits[0]?.n ?? '?'})`,
  `sse-notify.service.ts sse-listen max:1 content drifted: hit-lines=${sseMaxOneHits.length}`);
const workerMaxOneHits = readRepoText('apps/worker/src/main.ts').split('\n')
  .map((l, i) => ({ l, n: i + 1 }))
  .filter(({ l }) => /createPool\(\{ max: 1, purpose: 'job-wakeup' \}\)/.test(l));
check(workerMaxOneHits.length === 1,
  `worker main.ts job-wakeup max:1 content pin exactly one line (:${workerMaxOneHits[0]?.n ?? '?'})`,
  `worker main.ts job-wakeup max:1 content drifted: hit-lines=${workerMaxOneHits.length}`);

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

// C1 结构复合门：PGPOOL_MAX: "12" 在位恰 1 行 + AG24 死 env 两键本文件零残留
// （原「+1/-0 diff vs 冻结基线」语义由该结构态等价承替——HA6-REPIN 滚动注册帧）
const pgpoolPinHits = haComposeLines
  .map((l, i) => ({ l, n: i + 1 }))
  .filter(({ l }) => /^  PGPOOL_MAX: "12"/.test(l));
const deadEnvHits = haComposeLines.filter((l) => /MODEL_MAX_CONCURRENT|MODEL_RPM/.test(l));
check(pgpoolPinHits.length === 1 && deadEnvHits.length === 0,
  `docker/compose.ha.yml structural gate: PGPOOL_MAX: "12" exactly one line (:${pgpoolPinHits[0]?.n ?? '?'}) + AG24 dead env keys (MODEL_MAX_CONCURRENT|MODEL_RPM) zero residue`,
  `docker/compose.ha.yml structural gate drifted: PGPOOL_MAX "12" hit-lines=${pgpoolPinHits.length}, dead env hits=${deadEnvHits.length} — 回 REQUEST 补审`);

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

// 逐流：值与 ha-1 current 列全等（保留）+ 内容锚 count 门（HA6-REPIN 内容化·行号只作 PASS 读数）。
// flow11 rev2 R1：删字节恒等重复锚（want=1 与 turn count=2 门同形异值恒假红）·
// 「turn 恰两消费点」治理语义由第三锚 count=2 门独承（现树两消费点同词面 rg 计数=2）。
const pins = [
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 0,
    anchors: [[/rl\.allow\(`signup:\$\{email\}`, 3, 0\.02\)/, 1]] },
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 1,
    anchors: [[/\?\? '10,0\.05'/, 1], [/^const SIGNUP_IP_CAPACITY = Number\(RL_SIGNUP_IP_RAW\[0\]\).*: 10;/m, 1], [/^const SIGNUP_IP_REFILL = Number\(RL_SIGNUP_IP_RAW\[1\]\).*: 0\.05;/m, 1]] },
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 2,
    anchors: [[/rl\.allow\('signup:global', 60, 1\)/, 1]] },
  { file: 'apps/api/src/modules/auth/auth.service.ts', flow: 3,
    anchors: [[/rl\.allow\(`login:\$\{email\}`, 5, 0\.2\)/, 1]] },
  { file: 'apps/api/src/modules/recruiter/recruiter.service.ts', flow: 4,
    anchors: [[/rl\.allow\(`invite:\$\{principal\}`, 12, 0\.05\)/, 1]] },
  { file: 'apps/api/src/modules/recruiter/recruiter.service.ts', flow: 5,
    anchors: [[/rl\.allow\(`invite:ip:\$\{ip \?\? 'unknown'\}`, 12, 0\.05\)/, 1]] },
  { file: 'apps/api/src/modules/quiz/quiz.controller.ts', flow: 6,
    anchors: [[/rl\.acquireSlot\(slotKey, 5\)/, 1]] },
  { file: 'apps/api/src/modules/interview/interview.controller.ts', flow: 7,
    anchors: [[/rl\.acquireSlot\(slotKey, 5\)/, 1]] },
  { file: 'apps/api/src/modules/resume/resume.service.ts', flow: 8,
    anchors: [[/rl\.allow\(`resume-file:\$\{principal\}`, 15, 0\.1\)/, 1]] },
  { file: 'apps/api/src/modules/resume/resume.service.ts', flow: 9,
    anchors: [[/^const PARSE_MAX = Number\(process\.env\.RESUME_PARSE_MAX \?\? 6\)/m, 1], [/rl\.acquireSlot\('resume-parse:global', PARSE_MAX\)/, 1]] },
  { file: 'apps/api/src/modules/interview/interview.service.ts', flow: 10,
    anchors: [[/const VOICE_RL = \{ capacity: 40, refillPerSec: 0\.3 \}/, 1], [/rl\.allow\(`voice:\$\{principal\}`, VOICE_RL\.capacity, VOICE_RL\.refillPerSec\)/, 1]] },
  { file: 'apps/api/src/modules/interview/interview.service.ts', flow: 11,
    anchors: [[/const TURN_RL = \{ capacity: 30, refillPerSec: 0\.2 \}/, 1], [/rl\.allow\(`turn:\$\{principal\}`, TURN_RL\.capacity, TURN_RL\.refillPerSec\)/, 2]] },
  { file: 'apps/api/src/modules/interview/interview.service.ts', flow: 12,
    anchors: [[/const REPORT_RETRY_RL = \{ capacity: 3, refillPerSec: 3 \/ 3600 \}/, 1], [/rl\.allow\('report_retry:' \+ id, REPORT_RETRY_RL\.capacity, REPORT_RETRY_RL\.refillPerSec\)/, 1]] },
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
  for (const [re, want] of pin.anchors) {
    const hitLines = fl.map((l, i) => ({ l, n: i + 1 })).filter(({ l }) => re.test(l)).map(({ n }) => n);
    const got = hitLines.length;
    check(got === want,
      `${pin.file} flow #${pin.flow + 1} anchor hits ${got}/${want} (hit-lines :${hitLines.join(' :') || '-'})`,
      `${pin.file} flow #${pin.flow + 1} anchor got ${got} != want ${want} — 值/锚形漂移，回 REQUEST 补审`);
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
// principal.ts 行号自由内容锚两断言（跨刀共享面·池参数 facet 钉即治理本体·选内容锚弃 blob）
const principalLines = principal.split('\n');
const singleSourceHits = principalLines
  .map((l, i) => ({ l, n: i + 1 }))
  .filter(({ l }) => /max: Number\(o\.max \?\? process\.env\.PGPOOL_MAX \?\? 20\)/.test(l));
check(singleSourceHits.length === 1,
  `principal.ts single-source pool max expression exactly one line (:${singleSourceHits[0]?.n ?? '?'}) (池参数单源 · R-22 面零重做)`,
  `principal.ts single-source pool max expression drifted: hit-lines=${singleSourceHits.length} — 回 REQUEST 补审`);
const keepAliveHits = principalLines.filter((l) => /keepAlive: true/.test(l)).length;
const queryTimeoutHits = principalLines.filter((l) => /query_timeout: Number\(process\.env\.PG_QUERY_TIMEOUT_MS \?\? 15000\)/.test(l)).length;
check(keepAliveHits === 1 && queryTimeoutHits === 1,
  'principal.ts HA-3 pool-param face pinned (keepAlive: true ×1 + query_timeout ×1)',
  `principal.ts HA-3 pool-param face drifted: keepAlive=${keepAliveHits}, query_timeout=${queryTimeoutHits} — 回 REQUEST 补审`);

// probe.multi.mjs 注册 blob 门（滚动注册帧·整文件登记行逐件全等）
const registryFileRows = ROLLING_REGISTRY.filter((r) => r.kind !== 'scripts-set');
const driftedRows = registryFileRows
  .filter((r) => execFileSync('git', ['hash-object', join(root, r.file)], { cwd: root, encoding: 'utf8' }).trim() !== r.blob);
check(driftedRows.length === 0,
  `rolling registry full-file rows blob-identical (${registryFileRows.map((r) => `${r.file}@${r.blob.slice(0, 8)}`).join(', ')}) (fail-closed 面零改零弱化)`,
  `rolling registry blob drifted: ${driftedRows.map((r) => r.file).join(', ')} 文件漂移——若为授权越触·走 REQUEST 补审重注册（append-only 追加登记行）·Ban 静默改 blob`);

const BANNED_COMPOSE = [
  'docker/compose.prod.yml', 'docker/compose.prod.override.yml', 'docker/compose.monitoring.yml',
  'docker/compose.ha-dual.yml', 'docker/compose.ha-dual.pg.yml', 'docker/compose.ha-dual.shared.yml',
  'docker/compose.ha-dual.skeleton.yml', 'docker/compose.ha.sandbox.yml',
  'docker/compose.dev.yml', 'docker/compose.demo.yml', 'docker/compose.backup.yml',
  'docker/compose.backup.sandbox.yml', 'docker/compose.mysql-local.yml',
  'docker/compose.ha-2-proof.yml', 'docker/compose.ha-3-proof.yml',
];
// 既有治理 compose 复合门：15 文件存在性全真 + AG24 死 env 两键 15 文件零残留（治理面结构态不回退）
const missingCompose = BANNED_COMPOSE.filter((f) => !existsSync(join(root, f)));
const deadEnvResidue = BANNED_COMPOSE.filter((f) => existsSync(join(root, f)) && /MODEL_MAX_CONCURRENT|MODEL_RPM/.test(readRepoText(f)));
check(missingCompose.length === 0 && deadEnvResidue.length === 0,
  `既有治理 compose 存在性全真（${BANNED_COMPOSE.length} files）+ AG24 死 env 两键零残留`,
  `Ban violated: missing=[${missingCompose.join(', ')}] dead-env-residue=[${deadEnvResidue.join(', ')}]`);

// 根 package.json 注册脚本账：must-exist 四键非空 + must-not-exist 两键零命中
//   + 基线 scripts 键值集 digest 复算恒等（登记式 jq 管道·值漂=非 additive 演进→REQUEST 补审 append）
const curPkg = JSON.parse(readRepoText('package.json'));
const curScripts = curPkg.scripts ?? {};
const missingMust = SCRIPTS_MUST_EXIST.filter((k) => !curScripts[k]);
const bannedResurrect = SCRIPTS_MUST_NOT_EXIST.filter((k) => k in curScripts);
const scriptsSetRow = ROLLING_REGISTRY.find((r) => r.kind === 'scripts-set');
const recomputedDigest = scriptsSetRow
  ? execFileSync('sh', ['-c', `git show HEAD:package.json | jq -cS '.scripts' | git hash-object --stdin`], { cwd: root, encoding: 'utf8' }).trim()
  : '(scripts-set row missing)';
check(missingMust.length === 0 && bannedResurrect.length === 0 && recomputedDigest === scriptsSetRow?.digest,
  `root package.json registered scripts ledger: ${SCRIPTS_MUST_EXIST.length} must-exist keys non-empty + ${SCRIPTS_MUST_NOT_EXIST.length} must-not-exist keys absent + baseline scripts-set digest identical (${recomputedDigest.slice(0, 8)})`,
  `package.json registered scripts ledger violated: missing=[${missingMust.join(', ')}] resurrected=[${bannedResurrect.join(', ')}] digest got=${recomputedDigest} want=${scriptsSetRow?.digest} — 值漂=非 additive 演进→REQUEST 补审 append`);
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
console.log('note: ha6-repin rolling registry active (baseline 8ba93f0b retired 2026-10-14)');
console.log(`CMD=node ${SELF} EXIT=${exitCode}`);
process.exit(exitCode);
