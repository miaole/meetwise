/**
 * Static public-text policy for original, project-owned descriptions.
 *
 * This module is deliberately local-only: it reads the current Git worktree's
 * managed public-text paths (tracked plus non-ignored additions), never loads
 * scanned modules, consults no environment variables, and does not make
 * network requests.  A scan failure is a policy failure rather than a pass.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';

export const PUBLIC_TEXT_POLICY_VERSION = 5;
export const PUBLIC_TEXT_POLICY_CODES = Object.freeze({
  ATTRIBUTION_ZH: 'PTP_ATTRIBUTION_ZH',
  ATTRIBUTION_EN: 'PTP_ATTRIBUTION_EN',
  CODE_HOST_URL: 'PTP_CODE_HOST_URL',
  EXTERNAL_REFERENCE_LINK: 'PTP_EXTERNAL_REFERENCE_LINK',
  NEEDS_REVIEW: 'PTP_NEEDS_REVIEW',
  LOCAL_PATH: 'PTP_LOCAL_PATH',
  ROOT_MISSING: 'PTP_ROOT_MISSING',
  ROOT_SYMLINK: 'PTP_ROOT_SYMLINK',
  GIT_LIST_FAILED: 'PTP_GIT_LIST_FAILED',
  PATH_ESCAPE: 'PTP_PATH_ESCAPE',
  PATH_MISSING: 'PTP_PATH_MISSING',
  PATH_SYMLINK: 'PTP_PATH_SYMLINK',
  PATH_TYPE: 'PTP_PATH_TYPE',
  PATH_READ_FAILED: 'PTP_PATH_READ_FAILED',
  FILE_LIMIT: 'PTP_FILE_LIMIT',
  FILE_TOO_LARGE: 'PTP_FILE_TOO_LARGE',
  PRIVATE_KEY: 'PTP_PRIVATE_KEY',
  CLOUD_IDENTIFIER: 'PTP_CLOUD_IDENTIFIER',
  API_KEY: 'PTP_API_KEY',
});

const MANAGED_ROOTS = Object.freeze(['ai-docs', 'apps', 'packages', 'scripts', 'docker', 'e2e', '.github', '.claude', 'ops', 'docs']);
const REQUIRED_ROOTS = Object.freeze(['ai-docs', 'apps', 'packages', 'scripts']);
const ROOT_FILES = new Set(['README.md', 'AGENTS.md', 'CLAUDE.md']);
export const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.mjs', '.cjs', '.js', '.ts', '.tsx', '.mts', '.cts', '.json', '.yaml', '.yml', '.sql', '.sh', '.toml', '.conf', '.service', '.timer', '.html', '.css', '.txt', '.pem', '.py']);
// cap 2048→2064（2026-10-13 协调方授权上调：AG-38 qa-tool-layer 等批次刀净增受管文件·计数预算非内容策略；
// AG-12 成本轨③ EXEC 立项随翻同值——该清欠在飞未及落主线·本刀 +3 文件（2 proof+1 迁移）触顶 2050·
// 按派单 sanctioned 值最小实现·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减·偏离清单随 REQUEST §9 落卷）。
// cap 2064→2072（2026-10-14 协调方授权上调：ciw2 四新件+主线增长·计数预算非内容策略）。
// cap 2072→2080（AG-11 成本轨④ post 补证派单：新 settle 五相 proof 件净增 1 受管文件·EXEC 已触顶 2064·
// 沿前次 +16 同步长·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减·偏离清单随 REQUEST §9 附记落卷）。
// cap 2072→2080（2026-10-14 协调方授权上调：S4b 流式进度收口 +7 受管新文件+余量·计数预算非内容策略）。
// cap 2064→2080（2026-10-14 · 5B 迁移消费刀 EXEC 按 AG-12/COST2 先例机制最小实现：本刀 +11 受管文件
// （10 版本化迁移+1 运维手册·均为派单授权产出）触顶 2073>2064；计数预算非内容策略·越限臂 fabricated 数
// 随 cap 联动同步·语义不变强度不减·偏离清单随 REQUEST §9 EXEC 附记显耀登记·post 双审/协调方可否决·
// 并线时主线侧已由 AG-11 同值至 2080·union 并集解·cap 终值 2080 维持）。
// cap 2080→2081（2026-10-14 协调方 sanction：ag39q 迁移+新 proof 两受管件·EXEC 红停 PTP_FILE_LIMIT 2081>2080·
// 最小步 +1·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2080→2088（2026-10-14 协调方授权 sanction：API-HARDEN 0189 迁移+proof/卷三受管件+并集增长·计数预算非内容策略·
// 越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2080→2090（2026-10-14 · 5B-MIG nail 续作协调方授权上调：line/batch5b-mig 并主线 union 并集
// 受管文件必然越顶 2080；计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减·
// 沿 AG-12/COST2 先例机制与 ciw2 5580a059 形制·偏离清单随 REQUEST §9 附记落卷·双 sanctioned 取大 union 并集解）。
// cap 2090→2104（2026-10-14 协调方 sanction·+14 沿 +8 系先例形：并线树 f7fe7078 实测 2093>2090 红停——
// 5B-MIG 0190-0199 十迁移+批5b 卷/proof 受管件+主线 0189 后 +3 件双亲增量并集·并覆盖成本⑤/ag39q/S4b
// 后继四刀并集+余量；计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2104→2112（2026-10-14 协调方 sanction·+8 本刀收据受管件增量·沿 +8 先例形·
// ssepush-notify 回归修复刀并线树受管件并集+余量；计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2112→2120（2026-10-14 协调方 sanction·+8 S4b 收据/卷/token-stream 三面受管件：tokstream-s4b 卷
// +sse-delta-arm/token-stitch/token-typewriter/token-delta/worker token-stream 及其 proof/invoke-model-delta
// proof 计面 8 件·主线 2106+并集=2114 实测红停 PTP_FILE_LIMIT:2114>2112·沿 +8 先例取 2120 头空；
// 计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2120→2128（2026-10-14 协调方预 sanction·+8 evkind-scorecard-fix 收官并线 feat/mysql-schema-skeleton
// @5bd92ce8 新增 admin-disable-evict/ag04-consumer-fix 两受管件+余量·沿 +8 先例形；
// 计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2128→2136（2026-10-15 协调方 sanction·+8 沿 +8 先例形：perfload-env-fix EXEC 红停
// PTP_FILE_LIMIT:2132>2128——perf-load:prove 史上首绿·件③ 机检产出 7 件经 proof 设计 TRACKED_DIR
// ai-docs/delivery/receipts/uc018-perf-load/ 首现+merge 漂 1+收据 1=2132·stash 对照亲证基线 2124 绿；
// perf-load 机检产出 TRACKED_DIR 首现·协调方 sanction·计数预算非内容策略·越限臂 fabricated 数随
// cap 联动同步·语义不变强度不减）。
// cap 2136→2144（2026-10-15 协调方 sanction·+8 沿 +8 先例形：ci-wiring3 EXEC 红停
// PTP_FILE_LIMIT:2137>2136——并线树恰 2136=cap 零余量（0a787906 batch-residual-plan.md 耗尽
// ci-red-clear 余 1）+件④ 收据 1 至 2137·reconcile 迁移 +1 至 2137·三刀在飞共享余量·stash 对照
// 亲证收据移出同树 2136≤2136 EXIT=0 绿；协调方 sanction·计数预算非内容策略·越限臂 fabricated 数随
// cap 联动同步·语义不变强度不减）。
// cap 2136→2144（2026-10-15 协调方 sanction·+8 沿 +8 先例形：RECONCILE-RETRY EXEC 红停
// PTP_FILE_LIMIT:2137>2136——merge 点 HEAD 实测恰 2136=cap 绿·红唯一增量=件① 迁移 .sql 受管计面 +1
// 至 2137·三刀在飞共享余量·协调方 sanction·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·
// 语义不变强度不减）。
// cap 2136→2144（2026-10-15 协调方 sanction·+8 沿 +8 先例形：UC184-SLOT-ORDER nail 并线树——
// reconcile 迁移/ci-wiring3 收据/uc184 收据三刀在飞共享·沿 +8 先例·计数预算非内容策略·
// 越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2224→2232（2026-10-17 协调方 sanction·+8 沿 +8 先例形：2224 帽算术漏计 progress-write +1·
// AG-15（+5）落地 2225>2224 必红·本刀补 +8）。
// cap 2216→2224（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 92086586 2212·
// 在飞 AG-16（+4）/幽灵脚本（+2）/AG-15（+5）三刀并线即 2223 超限）。
// cap 2208→2216（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 10799a3e 2203·
// 在飞 QUEUE/AG-43/G7W/TSW/BV/WSS/AG-16 七 REQUEST+AG-16 proof 族三件并线即 2213 超限）。
// cap 2200→2208（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 f7caa206 2194·
// 在飞 G7W-DIAG-NEEDLES/WORKER-HANG-GUARD 两 REQUEST 并入即 2201 超限）。
// cap 2192→2200（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 a0f3bd46 2185·
// 在飞 sse-api/obs/api-harden/ai-graphs 环解四卷各 +1~2 预算必越）
// cap 2184→2192（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 d1d01853 2178·
// 在飞四卷 session-summary-deepen(2180)/5e-cleanup-sweep/queue-shutdown-phases/dbacl2-ci-shallow-fix 各 +1~2 预算必越）
// cap 2176→2184（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 77ff91fb 2165 余 11·
// 在飞五卷 rkw/qgen-critique-resilience/dbacl2-ci-wire/gitleaks-placeholder-remedy/g7w-tail-diag 各 +2 预算必越）
// cap 2168→2176（2026-10-16 协调方 sanction·+8 沿 +8 先例形：主线 59127126 2159·
// 在飞四卷 qbank-integrity-chain/e2e-runner-stale-build-guard/qbank-pipeline-scope/dbacl2-ci-wire 各 +2 预算必越）
// cap 2160→2168（2026-10-15 协调方 sanction·+8 沿 +8 先例形：主线 5a0bf9e4 2156 余 4·
// 在飞四卷 nul-escape/qbank-integrity-chain/e2e-runner-stale-build-guard/i18n-metadata-ssr 各 +2 预算必越）
// cap 2152→2160（2026-10-15 协调方 sanction·+8 沿 +8 先例形：主线 685befed docs:check 2151 余 1·
// 在飞四卷 cache-observe/qbank-scope-fix/uc003-arm4/g7-env-billing 各 +2 预算必越）——
// cap 2144→2152（2026-10-15 协调方预 sanction·+8 沿 +8 先例形：COST-COLUMNS nail 并线树——
// 本刀树 2144=cap 恰等零余量+主线并线增量必越·cost-columns 收据+三刀在飞共享余量·
// 协调方 sanction·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2240→2248（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240 五先例形·快速链·授权随令）：
// 2240 恰等零余量·在飞四刀并线 2249 超限（DB-HOTSPOT +3/TRACE-RECON +4/#101 供应链 +1/#185 打卡键 +1·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2232→2240（2026-10-17 协调方 sanction·+8 沿 2208/2216/2224/2232 四先例形·N-19 修复刀随刀行使·授权随令）：
// 2224 恰等漏计勘误承 2232 刀+本刀 N-19 REQUEST 触顶（PTP_FILE_LIMIT:2233>2232 红停承登·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
const MAX_FILES = 2_248;
const MAX_FILE_BYTES = 2 * 1_024 * 1_024;
const CODE_HOSTS = [
  ['git' + 'hub', 'com'],
  ['git' + 'lab', 'com'],
  ['bit' + 'bucket', 'org'],
  ['git' + 'ee', 'com'],
  ['code' + 'berg', 'org'],
  ['source' + 'forge', 'net'],
];
const ZH_EXPLICIT_ATTRIBUTIONS = [
  '改' + '编' + '自',
  '移' + '植' + '自',
  '照' + '搬' + '自',
  '借' + '鉴' + '自',
  '参' + '考' + '自',
  '参' + '照' + '自',
  '参' + '考' + '至',
  '参' + '照' + '至',
  '参' + '考' + '到',
  '参' + '照' + '到',
  '依' + '附' + '于',
];
const LOCAL_PATH_MARKERS = ['/' + 'Users' + '/', '/' + 'private' + '/' + 'tmp' + '/', 'claude-' + '501'];

// 项目自己的 canonical 出处与预览链接：README 指向自身仓库/页面是导航，不是对外引用或来源署名，
// 因此不落入 CODE_HOST_URL / EXTERNAL_REFERENCE_LINK 拦截。host 名同样按拆词拼接，避免本策略文件被自身扫描命中。
// 仅精确匹配（后随边界），任何其它 host/repo（含同 repo 前缀的更长时间路径）仍照常拦截。
const SELF_CANONICAL_URLS = Object.freeze([
  'git' + 'hub' + '.com/miaole/meetwise',
  'miaole.' + 'git' + 'hub' + '.io/meetwise',
]);
const SELF_URL_BOUNDARY = /[A-Za-z0-9._-]/;
function isSelfUrl(text) {
  for (const url of SELF_CANONICAL_URLS) {
    const index = text.indexOf(url);
    if (index === -1) continue;
    const next = text[index + url.length];
    if (next === undefined || !SELF_URL_BOUNDARY.test(next)) return true;
  }
  return false;
}

// These patterns deliberately require an attribution construction.  They do
// not ban legitimate terms such as “参照系”, “schema reference”, or “citation”.
const POLICY_RULES = Object.freeze([
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: new RegExp(`(?:${ZH_EXPLICIT_ATTRIBUTIONS.join('|')})`, 'u'),
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: /(?:来自|源自|基于)\s*(?:(?:外部|其他|某(?:个)?|该|这个)\s*)?(?:开源\s*)?(?:项目|仓库|代码库|代码仓|repo(?:sitory)?)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: /(?:本项目|本系统|本仓库|Meetwise|知面)\s*(?:由|从)\s*[^\n]{0,80}?(?:项目|仓库|代码库|代码仓|repo(?:sitory)?)\s*(?:衍生|改编|迁移|移植|复制|照搬|构建)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_ZH,
    re: /(?:以|按)\s*[^\n]{0,80}?(?:项目|仓库|代码库|代码仓|repo(?:sitory)?)\s*(?:为基础|改造|迁移|移植|照搬)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\b(?:adapted|ported|derived|copied|migrated|forked)\s+from\s+(?:(?:an?|the|external)\s+)*(?:project|repository|repo)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\bbased\s+on\s+(?:(?:an?|the|external)\s+)*(?:project|repository|repo)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\b(?:reference|refer)\s+(?:to|from)\s+(?:(?:an?|the|external)\s+)*(?:project|repository|repo)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.ATTRIBUTION_EN,
    re: /\b(?:this\s+)?(?:project|repository|repo)\s+(?:is\s+)?(?:adapted|ported|derived|copied|migrated|forked)\s+from\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.CODE_HOST_URL,
    re: new RegExp(`\\b(?:https?:\\/\\/)?(?:www\\.)?(?:${CODE_HOSTS.map(([host, suffix]) => `${host}\\.${suffix}`).join('|')})\\/[A-Za-z0-9][A-Za-z0-9._-]*\\/[A-Za-z0-9][A-Za-z0-9._-]*`, 'iu'),
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.NEEDS_REVIEW,
    re: /(?:归属|来源)\s*(?:待确认|未确认|待审计)|\b(?:attribution|origin)\s+(?:pending|unknown)\b/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.LOCAL_PATH,
    re: new RegExp(`(?:${LOCAL_PATH_MARKERS.map((marker) => marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'u'),
  },
]);

// 云端标识 / 私钥 / API 密钥:真实生产标识不得进入开源仓库。真正的密钥/凭据由 gitleaks(全历史)
// 与 check-staged-secrets(提交时)负责;这里补上 IP/实例 ID/Tailscale/RDS hostname 这类 gitleaks
// 抓不到的「标识」泄漏兜底。公钥(BEGIN PUBLIC KEY)不命中;合成夹具用 SYNTHETIC_IDENTIFIER_PATTERNS 精确放行。
export const CLOUD_IDENTIFIER_RULES = Object.freeze([
  { code: PUBLIC_TEXT_POLICY_CODES.PRIVATE_KEY, re: /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/ },
  { code: PUBLIC_TEXT_POLICY_CODES.CLOUD_IDENTIFIER, re: /\bizbp[a-z0-9]{8,}\b/ },
  { code: PUBLIC_TEXT_POLICY_CODES.CLOUD_IDENTIFIER, re: /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.ts\.net\b/ },
  { code: PUBLIC_TEXT_POLICY_CODES.CLOUD_IDENTIFIER, re: /\b[a-z0-9-]+\.(?:pg|redis|mysql|mssql|mariadb)\.rds\.aliyuncs\.com\b/ },
  { code: PUBLIC_TEXT_POLICY_CODES.API_KEY, re: /\bLTAI[A-Za-z0-9]{12,}\b/ },
  { code: PUBLIC_TEXT_POLICY_CODES.API_KEY, re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/ },
  { code: PUBLIC_TEXT_POLICY_CODES.API_KEY, re: /\bsk-(?!example|test|xxx|placeholder|changeme|dummy|fake|your_)[A-Za-z0-9._-]{16,}\b/ },
]);

// 合成夹具精确放行(proof 里的假 tailnet/RDS endpoint);只放行这批显式登记的值,任何真实值仍命中。
export const SYNTHETIC_IDENTIFIER_PATTERNS = Object.freeze([
  /(?:^|\.)tail0000000\.ts\.net$/i,
  /^pgm-(?:test|proof)\.pg\.rds\.aliyuncs\.com$/i,
]);
export function isSyntheticIdentifier(text) {
  return SYNTHETIC_IDENTIFIER_PATTERNS.some((re) => re.test(text));
}

// Published project documents state their own contracts and evidence. They
// must not outsource either to an external citation link. This applies to all
// public Markdown roots, not the private agent-skill library under `.claude`.
// URLs that form part of a configuration example are not a citation, while a
// rendered external reference is.
const PUBLISHED_MARKDOWN_ROOTS = Object.freeze(['ai-docs', 'apps', 'packages', 'scripts', 'docker', 'e2e', '.github', 'docs']);
const PUBLISHED_MARKDOWN_REFERENCE_RULES = Object.freeze([
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /\]\(\s*(?:https?:)?\/\/[^\s)]+\s*\)/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /^\s*\[[^\]\n]+\]:\s*<?(?:https?:)?\/\/[^\s>]+/imu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /<(?:https?:)?\/\/[^\s>]+>/iu,
  },
  {
    code: PUBLIC_TEXT_POLICY_CODES.EXTERNAL_REFERENCE_LINK,
    re: /<a\b[^>]*\bhref\s*=\s*(?:"(?:https?:)?\/\/[^"\s>]+"|'(?:https?:)?\/\/[^'\s>]+'|(?:https?:)?\/\/[^\s>]+)/iu,
  },
]);

function rulesForPath(trackedPath) {
  const isPublishedMarkdown = /\.mdx?$/iu.test(trackedPath) && (
    ROOT_FILES.has(trackedPath)
    || PUBLISHED_MARKDOWN_ROOTS.some((root) => trackedPath.startsWith(`${root}/`))
  );
  return [
    ...(isPublishedMarkdown ? [...POLICY_RULES, ...PUBLISHED_MARKDOWN_REFERENCE_RULES] : POLICY_RULES),
    ...CLOUD_IDENTIFIER_RULES,
  ];
}

function stable(values) {
  return [...new Set(values)].sort();
}

function isManagedPath(candidate) {
  if (typeof candidate !== 'string' || candidate.length === 0 || candidate.includes('\0') || isAbsolute(candidate)) return false;
  const normalized = candidate.split('\\').join('/');
  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) return false;
  if (ROOT_FILES.has(normalized)) return true;
  if (!TEXT_EXTENSIONS.has(extname(normalized))) return false;
  return MANAGED_ROOTS.some((root) => normalized.startsWith(`${root}/`));
}

function pathError(code, path) {
  return `${code}:${path}`;
}

function rootErrors(repoRoot) {
  const errors = [];
  if (!existsSync(repoRoot)) return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')];
  let rootStat;
  try {
    rootStat = lstatSync(repoRoot);
  } catch {
    return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')];
  }
  if (rootStat.isSymbolicLink()) return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_SYMLINK, '.')];
  if (!rootStat.isDirectory()) return [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')];
  for (const root of REQUIRED_ROOTS) {
    const candidate = resolve(repoRoot, root);
    try {
      const stat = lstatSync(candidate);
      if (stat.isSymbolicLink()) errors.push(pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_SYMLINK, root));
      else if (!stat.isDirectory()) errors.push(pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, root));
    } catch {
      errors.push(pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, root));
    }
  }
  return stable(errors);
}

export function listTrackedPublicTextPaths(repoRoot) {
  const errors = rootErrors(repoRoot);
  if (errors.length > 0) return { paths: [], errors };
  let listed;
  let deleted;
  try {
    // Scan additions as well as index entries.  A new public document is part
    // of the worktree claim before it is staged, so excluding it would let the
    // local gate pass while the same content is waiting to be committed.
    listed = execFileSync('git', ['-C', repoRoot, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'], { encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] });
    deleted = execFileSync('git', ['-C', repoRoot, 'ls-files', '--deleted', '-z'], { encoding: 'buffer', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return { paths: [], errors: [pathError(PUBLIC_TEXT_POLICY_CODES.GIT_LIST_FAILED, 'git-ls-files')] };
  }
  // A file deleted in the current working tree is not public text to scan. A
  // later race or an explicitly supplied missing path still fails closed.
  const deletedPaths = new Set(deleted.toString('utf8').split('\0').filter(Boolean));
  const paths = listed.toString('utf8').split('\0').filter(Boolean)
    .filter((path) => !deletedPaths.has(path))
    .filter(isManagedPath)
    .sort();
  if (paths.length > MAX_FILES) {
    return { paths: [], errors: [pathError(PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT, String(paths.length))] };
  }
  return { paths, errors: [] };
}

function safelyReadTrackedText(repoRoot, realRoot, trackedPath) {
  const normalized = trackedPath.split('\\').join('/');
  if (!isManagedPath(normalized)) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_ESCAPE, normalized) };
  const candidate = resolve(repoRoot, normalized);
  const relativeCandidate = relative(repoRoot, candidate);
  if (relativeCandidate === '..' || relativeCandidate.startsWith(`..${sep}`) || isAbsolute(relativeCandidate)) {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_ESCAPE, normalized) };
  }
  let stat;
  try {
    stat = lstatSync(candidate);
  } catch {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_MISSING, normalized) };
  }
  if (stat.isSymbolicLink()) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_SYMLINK, normalized) };
  if (!stat.isFile()) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_TYPE, normalized) };
  if (stat.size > MAX_FILE_BYTES) return { error: pathError(PUBLIC_TEXT_POLICY_CODES.FILE_TOO_LARGE, normalized) };
  let realCandidate;
  try {
    realCandidate = realpathSync(candidate);
  } catch {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_READ_FAILED, normalized) };
  }
  const bounded = relative(realRoot, realCandidate);
  if (bounded === '..' || bounded.startsWith(`..${sep}`) || isAbsolute(bounded)) {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_ESCAPE, normalized) };
  }
  try {
    return { text: readFileSync(candidate, 'utf8') };
  } catch {
    return { error: pathError(PUBLIC_TEXT_POLICY_CODES.PATH_READ_FAILED, normalized) };
  }
}

function lineNumber(text, offset) {
  return text.slice(0, offset).split('\n').length;
}

/**
 * Scan the current public-text worktree.  `trackedPaths` is injectable only
 * for deterministic proof fixtures; production callers omit it and use Git.
 */
export function scanPublicTextPolicy({ repoRoot, trackedPaths } = {}) {
  const root = resolve(repoRoot ?? '.');
  const rootValidationErrors = rootErrors(root);
  if (rootValidationErrors.length > 0) return { valid: false, errors: rootValidationErrors, scannedFiles: 0 };

  const listed = trackedPaths === undefined
    ? listTrackedPublicTextPaths(root)
    : { paths: trackedPaths, errors: [] };
  if (listed.errors.length > 0) return { valid: false, errors: stable(listed.errors), scannedFiles: 0 };
  if (!Array.isArray(listed.paths) || listed.paths.length > MAX_FILES) {
    return { valid: false, errors: [pathError(PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT, String(listed.paths?.length ?? 'invalid'))], scannedFiles: 0 };
  }

  let realRoot;
  try {
    realRoot = realpathSync(root);
  } catch {
    return { valid: false, errors: [pathError(PUBLIC_TEXT_POLICY_CODES.ROOT_MISSING, '.')], scannedFiles: 0 };
  }
  const errors = [];
  let scannedFiles = 0;
  for (const trackedPath of [...listed.paths].sort()) {
    const read = safelyReadTrackedText(root, realRoot, trackedPath);
    if (read.error) {
      errors.push(read.error);
      continue;
    }
    scannedFiles += 1;
    for (const { code, re } of rulesForPath(trackedPath)) {
      const expression = new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`);
      for (const match of read.text.matchAll(expression)) {
        if (isSelfUrl(match[0]) || isSyntheticIdentifier(match[0])) continue;
        errors.push(`${code}:${trackedPath}:${lineNumber(read.text, match.index)}`);
      }
    }
  }
  const sortedErrors = stable(errors);
  return { valid: sortedErrors.length === 0, errors: sortedErrors, scannedFiles };
}
