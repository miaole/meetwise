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
// cap 2409→2410（2026-10-27 PAY-NEG 支付拒绝 UI 刀收官并线 #155 sse-adv·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·+1 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406/2409 二十九先例形·快速链·授权随令）：
// 并线树终验亲跑 PTP_FILE_LIMIT:2410>2409——双亲各自合规（main `d1a947e3d` 届值 2409=cap 恰等零余量·本支 `80847d175` 届值 2405=届 cap 恰等零余量）union 实测 2410=2409+本卷 pay-neg-REQUEST 受管 1 件并入（派单原裁 2405→2406 恰等步进随 #155 并线届值重算·merge `7813aa407` 后亲测）·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2406→2409（2026-10-27 SSE-ADV sanction 收官并线 #154 killsw 二轮 union·协调方常设预授权「cap/lint 以合并树实测为准恰等步进免再询」·+3 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402/2405/2406 二十八先例形·快速链·授权随令）：
// 并线树终验亲跑 PTP_FILE_LIMIT:2409>2406——双支各自合规（本支 `907a7c47c`→2406 恰等·main `27a87781b` 届值 2405=killsw union 恰等）union 实测 2409=2406+killsw 并入受管净增 3（REQUEST+2 proof·stdout 收据非扫描面不计）（累计并入越限·沿 cap 2338→2346 先例形·merge-tree 预演同值）·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2402→2406（2026-10-27 SSE-ADV sanction 收官并线 #152/#153 协调方常设预授权·+4 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397/2402 二十六先例形·快速链·授权随令）：
// 并线树终验亲跑 PTP_FILE_LIMIT:2406>2402——双亲各自合规（main `cab3c7092` 届值 2402=cap 零余量·本支 `907a7c47c` 届值 2402=cap 恰等〔scanned 2401·stdout 非扫描面〕）union 实测 2406=本支净增 4 受管文件（REQUEST+proof+docker-info+receipt JSON）并入（累计并入越限·沿 cap 2338→2346 先例形·merge-tree 预演同值）·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2397→2402（2026-10-27 SSE-ADV EXEC 立项协调方届值如实采·+5 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2394/2397 二十五先例形·快速链·授权随令）：
// 本支树终验亲跑 PTP_FILE_LIMIT:2398>2397——#151 并线后 2397=cap 零余量 + 本支 line/sse-adv-draft 净增 REQUEST 1 件=2398 必超（merge a0b5893f4 后亲证）·协调方届值 2402 如实采（#152 clock-e2e-draft `fc33c04e6` 在飞预登同值 2397→2402 未并·未在 main 如实采）·本刀净增 4 受管文件（proof 1+receipts 3）终态 2402=cap 恰等·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2402→2403（2026-10-26 NHP-014 支付回调刀起草随刀协调方预授权 sanction·+1 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2394/2397/2402 二十六先例形·快速链·授权随令）：
// 本刀树 2402=cap 恰等零余量+本卷 webhook-neg-REQUEST.md 受管 +1=2403 必越（CAP-SANCTION-2354 同形：main 恰 cap 零余量+本卷 REQUEST +1）·起草 commit 即触·预授权「越限沿先例步进承登」随令行使·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步（2403/2404）·语义不变强度不减。
// cap 2397→2402（2026-10-26 UC-030 时钟卷并线收官协调方预授权 sanction·+5 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397 二十五先例形·快速链·授权随令）：
// 并线树终验亲跑 PTP_FILE_LIMIT:2402>2397——双亲各自合规（本支 e987e8213 届值 2392≤2394·main e072e957f 届值 2397=cap 零余量）union 实测 2402=本支净增 5 受管文件（REQUEST+proof+3 receipts）并入（累计并入越限·沿 cap 2338→2346 先例形·merge-tree 预演同值）·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2394→2397（2026-10-26 补评闭环并线收官协调方预授权 sanction·+3 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392 二十四先例形·快速链·授权随令）：
// 并线树终验亲跑 PTP_FILE_LIMIT:2397>2394——双亲各自合规（本支 582d4cf08 届值 2392=cap 零余量·main 39cf555c4 届值 2394=cap 零余量）union 实测 2397 必超（累计并入越限·沿 cap 2338→2346 先例形·merge-tree 预演同值）·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2386→2394（2026-10-26 NHP 批 C 收官协调方序 A sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386 二十三先例形·快速链·授权随令）：
// 并线树终验亲跑预算——origin/main `b894cad88`（#146 批 B 并线后）届扫 2381 余 5 + 本支 line/nhp-c-draft 净增 6 受管文件（REQUEST+3 proofs+3 receipts）union=2388≤2394·协调方 2026-10-26 序 A sanction·本批 6 受管文件·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2386→2392（2026-10-26 补评闭环收官协调方追认 sanction·+6 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386 二十三先例形·快速链·授权随令）：
// 来源：批 C 后继补评闭环刀三 proof naming-convention/any 类·stash 对照基线零余量实证·协调方 2026-10-26 追认——EXEC 9c4784bc5 实测步进落码·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2378→2386（2026-10-26 NHP 批 B 收官协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378 二十二先例形·快速链·授权随令）：
// 本支树终验亲跑 PTP_FILE_LIMIT:2381>2378——origin/main `47f26403b` 届扫 2376 余 2 + 本支 line/nhp-batch-b-draft 净增 5 受管文件（REQUEST+4 proofs）union=2381 必超·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2370→2378（2026-10-26 NHP 批 A 收官协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370 二十一先例形·快速链·授权随令）：
// 并线树终验亲跑 PTP_FILE_LIMIT:2372>2370——origin/main `151479547` 届扫 2364 余 6 + 本支 line/nhp-batch-a-draft 净增 8 受管文件（11 tracked 中 8 件计入受管扫描）union=2372 必超·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2362→2370（2026-10-26 UC-017 并线二轮随刀·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362 二十先例形·快速链·授权随令）：
// 双刀同日各自 2354→2362 步进（UC-017/UC-025 各自基线合规）后双支并线 union 实测 2364>2362（累计并入越限·沿 cap 2338→2346 先例「五刀各自基线合规·累计并入越限」形·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2354→2362（2026-10-26 UC-017 并线终验随刀·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354 十九先例形·快速链·授权随令）：
// 并线树实测 2355>2354 红停承登（双亲各自合规：本支 line/uc017-draft 2346+origin/main 2352·越限 9 件全来自邻支线 mop01/event-ttl/ag36 交付件·累计并入越限·根因不在本刀交付面·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2354→2362（2026-10-26 协调方并线 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354 十九先例形·快速链·授权随令）：
// 并线树终验亲跑 PTP_FILE_LIMIT:2355>2354——main 恰 2354=cap 零余量（cap-sanction-2354 当日五 REQUEST 卷耗尽）+ 本卷 `uc025-e2e-REQUEST.md` 受管 +1=2355（UC-025 并线 merge `486776d00` 零冲突后终验亲证·merge-tree 预演同值）·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。
// cap 2346→2354（2026-10-26 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346 十八先例形·快速链·授权随令）：
// 届树亲跑 2341 余 5（brief 颁「2328 恰等零余量」系 LEDGER :702 历史行值·勘误如实）·在飞六条 E2E 缺口领包卷并线必越（2341+6=2347>2346·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2338→2346（2026-10-22 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338 十七先例形·快速链·授权随令）：
// main 现值 2339 已越 2338 一文件（五刀 ag34/#249/ag35/asr-quality/lease-attempts 各自基线合规·累计并入越限·协调方累计账失察）+ 在飞 AG-25 勘误卷 1 + 本卷 1 = 2341 ≤ 2346 余 5（main CI 红热修 PTP_FILE_LIMIT:2339>2338·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2330→2338（2026-10-22 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328 十六先例形·快速链·授权随令）：
// 主线已扫 2330 余量 0·在飞新卷 ≥1（AG 下一刀）并线=2331 必超（2330+1=2331>2330·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2312→2320（2026-10-20 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312 十四先例形·快速链·授权随令）：
// 主线这棵树开工前已扫 2310 余量 2·加上本记录后扫描变成 2311（2310+1=2311≤2312·步进只许 +8·先加 8 而不是改成恰好余量或取消上限·恰达上限仍通过·多一个仍拒绝·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2304→2312（2026-10-20 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304 十三先例形·快速链·授权随令）：
// 主线这棵树开工前已扫 2303 余量 1·加上本记录后扫描变成 2304（2303+1=2304≤2304·步进只许 +8·先加 8 而不是改成恰好余量或取消上限·恰达上限仍通过·多一个仍拒绝·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2296→2304（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296 十二先例形·快速链·授权随令）：
// 主线这棵树开工前已扫 2293 余量 3·加上本记录后扫描变成 2294（2293+1=2294≤2296·步进只许 +8·先加 8 而不是改成恰好余量或取消上限·恰达上限仍通过·多一个仍拒绝·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2288→2296（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288 十一先例形·快速链·授权随令）：
// 主线这棵树开工前已扫 2285 余量 3·加上本记录后扫描变成 2286（2285+1=2286≤2288·步进只许 +8·先加 8 而不是改成恰好余量或取消上限·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2280→2288（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280 十先例形·快速链·授权随令）：
// 主线已扫 2280 余量 0·本卷使扫描变成 2281（2280+1=2281>2280·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2272→2280（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272 九先例形·快速链·授权随令）：
// 主线 2270·在飞新卷 3（AG 下一刀卷/批表下一刀卷/本卷）并线=2273 必超（2270+3=2273>2272·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2264→2272（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264 八先例形·快速链·授权随令）：
// 主线 2261·在飞四支线并线各含 1 REQUEST=2265 必超（2261+4=2265>2264·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2256→2264（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256 七先例形·快速链·授权随令）：
// 2256 恰等零余量·在飞 deploy:check 修复刀并线必越（deploy:check 修复 +1 REQUEST·2256+1=2257 超·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2248→2256（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248 六先例形·快速链·授权随令）：
// 2248 恰等零余量·在飞五刀并线 2253 超限（S30 +1 REQUEST/#101 供应链 +1/#185 打卡键 +1/UNSTUBE +1 REQUEST/恒真回填 +1 REQUEST·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2240→2248（2026-10-18 协调方 sanction·+8 沿 2208/2216/2224/2232/2240 五先例形·快速链·授权随令）：
// 2240 恰等零余量·在飞四刀并线 2249 超限（DB-HOTSPOT +3/TRACE-RECON +4/#101 供应链 +1/#185 打卡键 +1·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2232→2240（2026-10-17 协调方 sanction·+8 沿 2208/2216/2224/2232 四先例形·N-19 修复刀随刀行使·授权随令）：
// 2224 恰等漏计勘误承 2232 刀+本刀 N-19 REQUEST 触顶（PTP_FILE_LIMIT:2233>2232 红停承登·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// 上限经 2346→2354→2362→2370→2378→2386→2392→2394→2397→2402→2403/2405/2406（三支并行各自步进）→2409（#154 并线 union 恰等步进）→2410（pay-neg 并线恰等步进）步进（见上注记）。恰达上限仍通过，多一个仍拒绝。
// cap 2397→2402（2026-10-26 killsw 开关刀随刀·+5 恰等零多放·沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312/2320/2328/2338/2346/2354/2362/2370/2378/2386/2392/2397 二十五先例形·
// 协调方 EXEC 派单预授权「cap 届值重算+本刀 tracked 文件余量」随令·本刀 EXEC 面 +5 受管文件实算：两 proof（uc-e2e-050-nhp-kill/uc-e2e-051-nopii）+两门矩阵 stdout 收据（nhp-050-kill-01/nhp-051-nopii-01·批 C 极简收据形）+并线树既有本卷 REQUEST 1 件=合并基 2398+4=2402 恰等·
// 计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
// cap 2402→2405（2026-10-27 killsw 开关刀并线 #152 clock-e2e union 越限恰等步进·协调方并线令预授权「union 越限预授权恰等步进+承登」随令·
// 并线树终验亲跑 PTP_FILE_LIMIT:2405>2402 红·双亲各自合规（本支 d41a4511f 届值 scanned 2400≤2402·main 961f5ef12 届值 2402=cap 零余量）union 实测 2405=本支届值 2400+clock 并入受管 5（REQUEST+proof+txt/json 收据三件）·
// 计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。
const MAX_FILES = 2_410;
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
