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
 * A1 预算算术：PGPOOL_MAX 单值解析 + principal.ts 单源（内容锚·行号非门） + 恰两处显式 max:1 +
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
 *   2026-10-26 L-04 补审重注册（micro-batch2-REQUEST §1.B·EXEC tip 8f2fdb83c）：scripts-set
 *     digest 106e4579（registered 8ae2a93e）→cc72940d（registered 8f2fdb83c）·scripts 键集
 *     653→698 纯增 45 键 0 删（唯一计算式对 EXEC tip 复算·工作树与 HEAD 恒等）·additive
 *     演进漏补审承登·同刀补工作树双读数恒等臂（F2 机制闭合替代时点补偿）。
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

// ── 滚动注册帧（HA6-REPIN REQUEST sanctioned 2026-10-14·append-only）──
// 再注册唯一通道=REQUEST 补审（授权越触后更新 blob+追加登记行·Ban 静默改 blob）。
const ROLLING_REGISTRY = [
  { file: 'scripts/ha/probe.multi.mjs', blob: 'b91917e8ede075e08b080f7a9ae76933cfe36dcd',
    registered: '8ae2a93e', note: 'HA6-REPIN 初注册（fail-closed 面整文件·旧 8ba93f0b 零 diff 态顺承）' },
  { file: 'package.json', kind: 'scripts-set',
    digest: '4607eff444c3625f4d21de27e323cac7c9d6bf5f', registered: 'ea1c88aed',
    note: 'rev2 R5 基线 scripts 键值集 digest（计算式唯此一条：git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin·8ae2a93e 与 rev2 起草树亲证恒等·Node JSON.stringify 键排序形=96e70b39e30b781c3d9065c071613c9630d4729d 与本值字节不同形已证·rev2 复审 P2 实测勘正原示例 3ef5dc2f 不可复现废·Ban 另造等价形替算）·2026-10-26 L-04 补审重注册（micro-batch2-REQUEST §1.B·EXEC tip 复算）：8ae2a93e→8f2fdb83c scripts 纯增 45 键（653→698·0 删）·additive 演进漏补审承登·旧值 106e457929a535e9b87d303b94d7487adbbca054 退役留痕·2026-11-06 L-04 二次补审重注册（small-fixes-1105-REQUEST §1·工作树双读臂复核时发现 main 届漂：HEAD=工作树=d7540d569 恒等≠登记 cc72940df·注册 tip af55b8b 复算）：8f2fdb83c→af55b8b scripts 纯增 63 键（698→761·0 删·key-level diff 亲证）·2026-10-26 后诸刀 additive 演进漏补审承登·旧值 cc72940dfce57af2c9b379896a3a286797d5198f@8f2fdb83c 退役留痕·2026-11-06 勘误（xs-2 报告 P2-c·键=值对拍补登）：上注「纯增 63 键（698→761·0 删）」系键名层面——digest 钉键值对，8f2fdb83c→af55b8b 区间另有既有键值改 1 笔=root `lint` 帽 5274→5410，全部步进落在 main 侧 base 92a82a944 之前（届值逐笔：8f2fdb83c=5274→5284 caf1bef08 放宽告警配额登记→5296 9c4784bc5 EXEC 落卷→5358 16fd29bae 并线配额收敛→5379 5a560411a 并线→5383 128a35e9b 并线配额收敛→5389 967df9728 uc15f EXEC LINT-SANCTION→5408 6fe89f3f9 uc50 并线 LINT-SANCTION 双帽恰等→5410 70597801c uc3m EXEC 常设预授权恰等步进；sanction 承登三卷在案=uc3m-REQUEST §lint 预算段/卷尾+quizdx-REQUEST §0.0.3.0 基线重 pin+regw-REQUEST EXEC rebase 复跑注「root 帽 main 侧 5408→5410 与本刀零涉」）·本批 92a82a944..af55b8b 零触 root package.json（git log 亲证空集）·该笔值改随 63 键净增一并入账非静默放宽·「纯增 0 删」措辞自本勘误起按「键名纯增 63·键值改 1」口径读·2026-11-06 EXEC 并线三补审重注册（small-fixes-1105-REQUEST EXEC·rebase 并线 origin/main d549a497b=#212 期发现 main 届漂：#211 ONLINE-PAY EXEC `e4ab3b4cb` 对 root package.json .scripts additive 纯增 1 键 `online-pay:s1:prove`·本支零触 root package.json git log 亲证）：af55b8b→96f8e0d79 scripts 键名纯增 1（761→762·0 删·0 值改·key-level diff 亲证恰此一笔）·HEAD=工作树=2413a56e 恒等亲证·注册 tip 96f8e0d79 复算（本 EXEC 刀零触 root package.json·值随终 tip 恒等）·旧值 d7540d5694cdddf7b954be7666f3aab02b59dc9a@af55b8b 退役留痕·沿 L-04 二次补审同构先例形·2026-11-11 三次补审重注册（ha6:prove main 存量三红修复刀·本刀零触 root package.json·注册 tip c94c4a3d6 复算公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin）：2413a56e@96f8e0d79/e4ab3b4cb（762 键）→693dd08f@c94c4a3d6（771 键）·键名纯增 9（762→771·0 删·key-level diff 亲证）=apih:cost-rl:prove（07bccd8a2）+conflict-markers:check/prove（b947f7299 FIX-G3）+e2e-ui-stale-build-guard:prove（1f7f7f9b6）+migrate-upgrade:prove/raw（49165f42e G1）+tenant-rls-isolation:prove/raw（51f94c700）+uc031-032:structure:prove（9cd789ee3）·键值改 2 笔=root `lint` 帽 5410→5425（5c803621a R2 e2e testHttp 重构 warning 计入 sanctioned）+`voice-adaptive:prove` 由 `pnpm -C apps/worker prove:voice-adaptive` 改配 `node scripts/run-e2e-isolated.mjs voice-adaptive:prove:raw`（dd766036e 隔离跑器·与邻近 DB 证明同形制）·HEAD=工作树=693dd08fd0fd144522ad4fa117a409f2d8c389f4 恒等亲证·旧值 2413a56e01392022ed76ec991e2031732f5ea757@96f8e0d79/e4ab3b4cb 退役留痕·沿 L-04 / 2026-11-06 二次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-11 四次补审重注册（main 存量红修复刀·#248 body-limit:prove 并入后 scripts digest 漂·本刀零触 root package.json·注册 tip c4b66e355 复算公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin）：693dd08f@c94c4a3d6（771 键）→6c3f3762@c4b66e355（772 键）·键名纯增 1（771→772·0 删·0 值改·key-level diff 亲证恰此一笔）=body-limit:prove（bd0a8b63c / #248）·HEAD=工作树=6c3f3762496687d357041d0fa4f271e0c7c188b3 恒等亲证·旧值 693dd08fd0fd144522ad4fa117a409f2d8c389f4@c94c4a3d6 退役留痕·沿 L-04 / 2026-11-11 三次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-11 五次补审重注册（#259 并线 origin/main 65fdfe463=#245 后 scripts digest 再漂·本刀零触 root package.json·注册 tip 65fdfe463 复算公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin）：6c3f3762@c4b66e355（772 键·lint 5425）→fc6b8dc0@65fdfe463（775 键·lint 5430）·键名纯增 3（772→775·0 删·key-level diff 亲证）=int18:payload-strip:prove 及其 raw（6d9eb5fae / #249）+worker-inflight-crash:prove（82fca2952 / #247）·键值改 1 笔=root `lint` 帽 5425→5430（5425→5427 f6ca8b182 #247×#249 并线恰等计入；5427→5430 bc12783bd #245 并线恰等计入）·中间点 607f709a0=#247 为 775 键 / digest 9b1fcf9e / lint 5427，#245 合入后值改使 digest 再漂至 fc6b8dc0·HEAD=工作树=fc6b8dc0fd0e897aab1109768b1c42c3ab8545b1 恒等亲证（并线提交 d3de21090 的 package.json .scripts 与 65fdfe463 恒等）·旧值 6c3f3762496687d357041d0fa4f271e0c7c188b3@c4b66e355 退役留痕·沿 L-04 / 2026-11-11 四次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·合并树 docs:check scanned 2538=cap 2538，PTP 帽不必调·2026-11-11 六次补审重注册（#259 二次并线 origin/main 59baa20b2=#270 后 scripts digest 再漂·本刀零触 root package.json·注册 tip 59baa20b2 复算公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin）：fc6b8dc0@65fdfe463（775 键·lint 5430）→6f1a6e12@59baa20b2（776 键·lint 5431）·键名纯增 1（775→776·0 删·key-level diff 亲证恰此一笔）=verify:local（7b48c41b9 / #243 轻量 CI）·键值改 1 笔=root `lint` 帽 5430→5431（cf3262839 / #252 并线：PR 自身在帽内，合并树实测 5431 恰等计入·零规则放宽）·HEAD=工作树=6f1a6e12b7a65c98918aa847e3acb4ed91867357 恒等亲证·旧值 fc6b8dc0fd0e897aab1109768b1c42c3ab8545b1@65fdfe463 退役留痕·沿 L-04 / 2026-11-11 五次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-11 七次补审重注册（第二批合入收尾 docs PR·本刀零触 root package.json·注册 tip d70b75587=#267 复算公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin）：6f1a6e12@59baa20b2（776 键·lint 5431）→188d121c@d70b75587（782 键·lint 5378）·键名纯增 6（776→782·0 删·key-level diff 亲证）=erasure-job-projection:prove 及其 raw（#257）+sse-notify-trigger-health:prove 及其 raw（#263）+skip-as-clarify:http:prove 及其 raw（#254）·键值改 1 笔=root `lint` 帽 5431→5378（#267 lint 预算收回·合并树实测 5378 恰等零余量）·中间点 3a1d1e931=#257 778 键 digest 7596076d / b4de00205=#263 780 键 91a5801b / fbf0afb4e=#254 782 键 be7c9a40（#262 不触 root scripts）·HEAD=工作树=188d121c89a95134761d42035ba6d6755c1722c7 恒等亲证·旧值 6f1a6e12b7a65c98918aa847e3acb4ed91867357@59baa20b2 退役留痕·沿 L-04 / 2026-11-11 六次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-11 八次补审重注册（#273 verify:local 挂第二批新增 6 条 prove·已审 head 70f9cc144 并入 main 9ff50145a=#272 后在合并树复算·公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin·registered 记已审改 scripts 的提交 70f9cc144，其 .scripts 与合并树恒等）：188d121c@d70b75587（782 键·lint 5378）→711bff22@70f9cc144（782 键·lint 5378）·键名 0 增 0 删·键值改 1 笔=`verify:local` 末尾追加 worker-inflight-crash:prove / int18:payload-strip:prove / body-limit:prove / skip-as-clarify:http:prove / sse-notify-trigger-health:prove / erasure-job-projection:prove（与 ci-cd.md §8.2.1 S6–S11 对账）·HEAD=工作树=711bff221bd5b535ec81b89655af5c9f4f78b852 恒等亲证·旧值 188d121c89a95134761d42035ba6d6755c1722c7@d70b75587 退役留痕·沿 L-04 / 2026-11-11 七次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-11 九次补审重注册（PR #271 fix/pg-client-double-release 并线 origin/main 3da3dae03=#273 后 scripts digest 再漂·公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin）：711bff22@70f9cc144（782 键·lint 5378）→63d83fde@ea1c88aed（784 键·lint 5381）·键名纯增 2（782→784·0 删·key-level diff 亲证）=pg-client-double-release:prove 及其 raw·键值改 1 笔=root `lint` 帽 5378→5381（#267 收回后本刀 proof 净增 warning 实测恰等零余量）·HEAD=工作树=63d83fde56bd0d09f7dd9afdc8fb5279b8e33463 恒等亲证·旧值 711bff221bd5b535ec81b89655af5c9f4f78b852@70f9cc144 退役留痕·沿 L-04 / 2026-11-11 八次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-11 十次补审重注册（PR #271 G-3 白名单句柄·公式 git show <tip>:package.json | jq -cS \'.scripts\' | git hash-object --stdin）：63d83fde@ea1c88aed（784 键·lint 5381）→99c190c3（784 键·lint 5376）·键名 0 增 0 删·键值改 1 笔=root `lint` 帽 5381→5376（去掉本刀引入的 any/thread_id 告警，并顺手去掉 connect/installReleaseCleanup 的 any，实测恰等零余量，低于 main 5378）·HEAD=工作树=99c190c3964b695099a9981d62f665e1596dc462 恒等亲证·旧值 63d83fde56bd0d09f7dd9afdc8fb5279b8e33463@ea1c88aed 退役留痕·沿 L-04 / 2026-11-11 九次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-13 十一次补审重注册（verify:local 自包含：`voice:prove` / `graph:prove` 改配 isolated runner 并加 :raw 键·公式 jq -cS \'.scripts\' package.json | git hash-object --stdin）：99c190c3@ea1c88aed（784 键·lint 5376）→6c445dd8（786 键·lint 5376）·键名纯增 2（784→786·0 删·key-level diff 亲证）=`voice:prove:raw` + `graph:prove:raw`·键值改 2 笔=`voice:prove` / `graph:prove` 由裸 `pnpm -C apps/worker …` 改配 `node scripts/run-e2e-isolated.mjs …:raw`·lint 帽未抬·HEAD=工作树与本刀 tip 恒等亲证（提交后）·旧值 99c190c3964b695099a9981d62f665e1596dc462@ea1c88aed 退役留痕·沿 L-04 / 2026-11-11 十次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）·2026-11-13 十二次补审重注册（pre-cloud A 跟进：:raw 守卫 + isolated-env-policy:prove·公式 jq -cS \'.scripts\' package.json | git hash-object --stdin）：6c445dd8（786 键·lint 5376）→4607eff4（787 键）·键名纯增 1=`isolated-env-policy:prove`（786→787·0 删）·键值改 216 笔=非 runner 的 :raw 脚本前加 `node scripts/require-e2e-isolated.mjs -- ` 守卫·本刀一并重登·lint 帽以实测为准·HEAD=工作树与本刀 tip 恒等亲证（提交后）·旧值 6c445dd8edac5017730d9c7feea83d0df88785fe 退役留痕·沿 L-04 / 2026-11-13 十一次补审同构先例形（Ban 静默改账·再注册通道=本刀补审 append）' },
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

// 单源锚：内容正则+count 门（HA6-REPIN ① 行号降非门读数）。
// #244 审查非阻塞项：必须锚定行首/行尾，注释或尾随改写不得再命中。
const A1_POOL_MAX_RE = /^\s*max: Number\(o\.max \?\? process\.env\.PGPOOL_MAX \?\? 20\),\s*$/;
// 原 :946 行号钉随主线演进位移（现树 :779）·表达式字节未变·A5 同形内容门仍在。
const principal = readRepoText('packages/db/src/principal.ts');
const a1SingleSourceHits = principal.split('\n')
  .map((l, i) => ({ l, n: i + 1 }))
  .filter(({ l }) => A1_POOL_MAX_RE.test(l));
check(a1SingleSourceHits.length === 1,
  `principal.ts single-source pool max expression pinned (hit-line :${a1SingleSourceHits[0]?.n ?? '?'})`,
  'principal.ts pool max single-source expression drifted');

// 反证（构造串，不改仓库文件）：旧未锚定正则对注释行 / 尾随 `|| 100` 仍命中；锚定后必须 0 命中。
if (a1SingleSourceHits.length === 1) {
  const live = a1SingleSourceHits[0].l;
  const commented = live.replace(/^(\s*)/, '$1// ');
  const trailing = live.replace(/\)\s*,\s*$/, ') || 100,');
  check(!A1_POOL_MAX_RE.test(commented),
    'A1 反证：把单源行注释后锚定正则 0 命中',
    'A1 锚定不足：注释行仍命中');
  check(!A1_POOL_MAX_RE.test(trailing),
    'A1 反证：尾随 || 100 改写后锚定正则 0 命中',
    'A1 锚定不足：尾随改写仍命中');
}

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
  .filter(({ l }) => A1_POOL_MAX_RE.test(l));
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
// L-04 件b：工作树双读数恒等臂（F2 机制闭合·未提交窗内 scripts 漂移由工作树读数现形·
//   断言四点恒等=HEAD 管道值+工作树管道值+二者互等+与登记 digest）
const worktreeDigest = scriptsSetRow
  ? execFileSync('sh', ['-c', "jq -cS '.scripts' package.json | git hash-object --stdin"], { cwd: root, encoding: 'utf8' }).trim()
  : '(scripts-set row missing)';
check(missingMust.length === 0 && bannedResurrect.length === 0
  && recomputedDigest === scriptsSetRow?.digest && worktreeDigest === scriptsSetRow?.digest
  && recomputedDigest === worktreeDigest,
  `root package.json registered scripts ledger: ${SCRIPTS_MUST_EXIST.length} must-exist keys non-empty + ${SCRIPTS_MUST_NOT_EXIST.length} must-not-exist keys absent + scripts-set digest four-point identical (HEAD=${recomputedDigest.slice(0, 8)} worktree=${worktreeDigest.slice(0, 8)} registered=${scriptsSetRow?.digest.slice(0, 8)})`,
  `package.json registered scripts ledger violated: missing=[${missingMust.join(', ')}] resurrected=[${bannedResurrect.join(', ')}] digest HEAD got=${recomputedDigest} worktree got=${worktreeDigest} want=${scriptsSetRow?.digest} — 值漂=非 additive 演进→REQUEST 补审 append`);
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
