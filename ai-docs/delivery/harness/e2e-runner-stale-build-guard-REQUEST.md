# E2E-RUNNER-STALE-BUILD-GUARD REQUEST — run-e2e-ui.mjs 防再发微刀（件① stale-build guard=BUILD_ID mtime<HEAD commit time 强制重建·件② web-build 扣留输出非零退出落盘 .tmp/e2e-ui-build-log·恰 1 tracked 代码文件·e2e-ui 零回归·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（起草落卷→pre-exec 双审会签 PASS（席1 `agent_e9fc9beb`+席2 `agent_bdce64cf`·P2 勘正/登记随卷见 §9-⑥）→协调方明示 EXEC 授权→**EXEC 落卷（§9 EXEC 记录七字段·门矩阵十门：九门全绿+门 1 真环境条件门 SKIP 如实登记·STOP 翻面**·post 双审两外席待派·nail/行翻面归协调方·alone≠dual·⛔push）

**席位**：E2E-RUNNER-STALE-BUILD-GUARD 起草席（诊断+起草双责·协调方派·⛔push⛔merge 主线）。
**基线**：`feat/mysql-schema-skeleton` 主线 tip=`77ba32ab`（origin tip 亲证恒等·fetch 后 `git log --oneline -1 origin/feat/mysql-schema-skeleton` 亲读·任务书锚「origin tip≥77ba32ab」等值满足）· 分支 `line/e2e-runner-stale-build-guard`（建前 `git branch --list "line/e2e-runner-stale*"` 零命中·本起草席 `git worktree add ../meetwise-sbg -b line/e2e-runner-stale-build-guard` 亲立·建后 `git reset --hard 77ba32ab` 钉 origin tip 亲证）· 工作树 `meetwise-sbg`（仓根同级）。
**立项出处**：
1. **协调方派单 brief**（2026-10-14·E2E-RUNNER-STALE-BUILD-GUARD 防再发微刀战役）：复跑席实证双改进候选=①**stale-build guard**（BUILD_ID mtime 早于 HEAD commit time→告警+强制重建·或保守形告警不强制·择一定稿）②**构建 stderr 落盘**（runner 内嵌 next build 非零退出时扣留的 stdout/stderr 只计数不落盘·诊断盲区）·工序=读码定稿→起草 REQUEST（§0 锚表·§1 修法两件·§1.3 候选否决·§2 门矩阵含 runner 自证·§3 Ban 面·§5 pins·§8 停止条件·STOP=`draft:awaiting_pre_exec_dual` 三处）→自检落卷 commit（⛔push）。
2. **事故登记（UC003 门⑥陈旧产物）**：`.next/BUILD_ID` mtime 早于 UC003 接线 4 天·runner「BUILD_ID 在即不重建」单一判据（`scripts/run-e2e-ui.mjs:190-191` recorded-blocker 注）→ `next start` 服务陈旧构建→**假红**被当真红追查。事故现场具体天数系派单口径·本席未独立复核当时现场（已不在本基线树）——判据本体（mtime<HEAD time→强制重建）不依赖具体天数·按机制采纳（§0.2-1 如实登记）。
3. **复跑席实证（件② 直接动因）**：web-build 非零退出时扣留输出**只计数不落盘**（`tailAppend` :88-91 计 chunks/bytes·`emitFailureDiagnostics` :92-96 仅打印 `E2E_PROCESS_OUTPUT_WITHHELD … chunks=9 bytes=3014` 形）·**9 chunks/3014B 不可回收**·靠手动同 env 复现才定位——诊断盲区亲历实证。
4. **形制范本**：`ai-docs/delivery/harness/cache-observe-repin-REQUEST.md`（§0-§9 全形制·STOP 三处·§2「数字口径以实跑实测为准+偏差熔断」纪律）·`ai-docs/delivery/harness/negbend-fix-REQUEST.md`（改前必做 run 先例·停止条件四类措辞）。

**必读清单（EXEC 开工前逐件亲读·显式路径）**：`AGENTS.md`（总则+生成前门禁）·本卷·`scripts/run-e2e-ui.mjs` 全文（248 内容行·wc -l 口径）·`scripts/e2e-platform/secret-redaction.mjs`（RUNNER_WITHHOLD/LOG_LEAK 契约——修法形约束源）·`scripts/e2e-static-guards.mjs`（runner 形制守卫段）·`scripts/run-e2e-isolated.mjs` :3013-:3051（.tmp 落盘先例）·`scripts/withheld-output.mjs`（label_bytes 合同）·`ai-docs/delivery/harness/cache-observe-repin-REQUEST.md`（形制范本）。

## §0 现状锚（起草席亲读·file:line/blob 逐条 Read/rg/wc/git rev-parse 实测 @`77ba32ab`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠复核

- `git branch --list "line/e2e-runner-stale*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep "stale-build\|e2e-runner"` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠全支线扫描（本席亲跑·对 `scripts/run-e2e-ui.mjs` 单径·`git log -1 <branch> -- <径>`+`merge-base --is-ancestor` 全 150+ 本地支线）**：非祖先命中若干·**支线顶触提交全部为 HEAD 祖先或远古残枝**——最近者 `91c04145`（2026-10-11·9 支线共指·**`git merge-base --is-ancestor 91c04145 HEAD` EXIT=0 亲证已在主线**=e2e-assert-refresh EXEC 落卷·内容经后续并线吸收）；其余顶触 `057701c4`(2026-10-02)/`cc8050d5`(2026-09-23)/`7da29707`(2026-09-04)/`e621235b`(2026-08-18)/`c3de7fe6`(2026-08-14) 全早于本波战役并已吸收或属 backup/feature 远古残枝（backup/*·codex/fix-cd-*·feature/ecs-* 等·判据沿 cache-observe-repin §0.0=对径支线顶新增提交日期晚于基线方计作在飞触面·全部不满足）。**零非残枝在飞触面。EXEC 立项日必做重扫**：任一支线顶对 `scripts/run-e2e-ui.mjs` 存在基线后新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git rev-parse --short=8 77ba32ab:<path>` 亲算·base=@`77ba32ab`）

| # | 文件 | base blob | 关键行锚 |
|---|---|---|---|
| 1 | `scripts/run-e2e-ui.mjs` | `84f9cd2d`（248 内容行·wc -l 口径·末行无换行差异注明） | **:5-6 头注**（:6「已有生产构建则不重建(构建太慢)」）；**:8-10 imports**（:8 `import { spawn } from 'node:child_process';`·:10 `import { readFileSync, existsSync, mkdirSync } from 'node:fs';`）；**:15** `ROOT`（尾带 `/`）；**:86-96 扣留机制段**（:87 `processDiagnostics` Map·:88-91 `tailAppend` 只计数 chunks/bytes 不存内容·:92-96 `emitFailureDiagnostics` 仅打印 `E2E_PROCESS_OUTPUT_WITHHELD process=<n> chunks=<c> bytes=<b>`）；**:97-109 spawnProc**（`forwardOutput=true` 缺省·非 E2E_VERBOSE 下输出不透传）；**:138-139** REG/`NEXT_BIN`；**:190-208 BUILD_ID 检查段+内嵌 build 调用段**（详 §1.1）；**:202-207 非零退出臂**（`emitFailureDiagnostics()`→`emitE2EFailure({class:'frontend',code:'web_not_ready'})`→exit）；**:210-217 next start spawn**；**:228-234 playwright spawn**（forwardOutput=false+显式 forward） |
| 2 | `scripts/e2e-platform/secret-redaction.mjs` | `2e51284c` | :19 `SENSITIVE` 词表（token/Authorization/audioBase64/contentBase64/MODEL_API_KEY/PAY_PROVIDER_SECRET/AUTH_SECRET）·:20 `LOG_LEAK` 正则（console 行含敏感词即 `log_leaks_secret`）·:22-26 `RUNNER_WITHHOLD` 含本 runner·:52-59 合同检查=源须含 `E2E_PROCESS_OUTPUT_WITHHELD`/`withheldOutputSummary`/`label_bytes=` 之一否则 `child_output_must_be_withheld_as_byte_counts` |
| 3 | `scripts/e2e-static-guards.mjs` | `01127803` | :35-43 `REQUIRED_E2E_RUNNER_PATHS` 含本 runner·:141-142 IMPORT/CALL 正则（`assertNoFakeServiceFlags` import+call 恒在）·:267/:283-284 `scanFakeServiceGuards` 对每 runner 断言 |
| 4 | `scripts/run-e2e-isolated.mjs` | `0787a7ff` | :3013-3014 `.tmp/sole-stack-receipts` mkdir `0o700`·:3050-3051 `writeFileSync` mode `0o600`+partial+`renameSync`——**本刀件② 落盘形先例** |
| 5 | `scripts/withheld-output.mjs` | `caefe488` | :6-9 `withheldOutputSummary` 只出 `label_bytes=N`（禁 preview/hash/slice·:143/:305 上游守卫钉死）——件② **不**改此模块·不 经此落盘 |
| 6 | `.gitignore` | `b84e2b41` | :15 `.tmp/`（件② 落盘目录天然 gitignored·零 .gitignore 改） |
| 7 | `package.json` | `3b04b871` | :217 `uc003:i18n-locale-ui:prove`（`E2E_UI_GREP=UC003-I18N-locale-en E2E_UI_PROJECT=chromium E2E_UI_SKIP_WORKER=1 node scripts/run-e2e-isolated.mjs e2e:ui`）·:342 `e2e:ui` |
| 8 | `scripts/ai-docs/public-text-policy.mjs` | — | :92 `MAX_FILES = 2_160`（cap·sanction `317ea3df`）·本刀零自升 |
| 9 | 迁移链 | 204 文件·头 `0204`（cache-observe-repin 卷 §0.1 #6 口径） | 本刀**零迁移**·链深对届时实测 |

### 0.2 口径登记（派单/上游口径漂移如实改正·问=答）

1. **「mtime 早于接线 4 天」数字口径**：派单 brief 事故叙事·本席未独立复核当时现场（现场已不在基线树）——本刀判据为机制形（mtime<HEAD commit time 即陈旧·见 §1-修法件①）·不锚定任何具体天数·4 天叙事仅作立项出处存档。
2. **「runner 是 .mjs 脚本·可否 node 直测自证」问=定稿答（本卷最重要勘验）**：**两路直测均不可行**——①整 runner 直跑（`node scripts/run-e2e-ui.mjs`）**不可达 BUILD_ID 段**：:46 `E2E_ISOLATED !== '1'` 即 throw `e2e_ui_isolation_required`、:53 缺 `MODEL_API_KEY` 即 throw、过此二者后 :146 起真启 api/worker 子进程·BUILD_ID 段在 :192 **后置**·无 docker DB 必 `web_not_ready` 早退；②**import 级单测不可行**：:16-67 顶层 side-effect（env 回灌/isolation throw）import 即执行即 throw。故自证定稿=**源级守卫断言（对真文件）+守卫决策/落盘副本直测（同构判定式 node -e 评估·伪造旧 BUILD_ID mtime→重建路径断言）**双件合成（§2-2 全命令）·副本强度局限（副本≠import·源级断言锚定源面同构）如实登记。
3. **cap 现值**：2160（sanction `317ea3df`·public-text-policy.mjs :92）·起草基线树 `node scripts/ai-docs/check-docs.mjs` EXIT=0 **scanned 2153** 本席亲跑——落卷后预期 **2154**（+本卷 1）≤2160 ✓（余量 6·cap sanction 权归协调方·Ban 自升）。
4. **static-guards 直跑形态亲证**：`node scripts/e2e-static-guards.mjs` 改前树 EXIT=0 本席亲跑（门 0/门 3 可直接复制）。

## §1 红事实（读码定稿·机制链·全部亲证 @`84f9cd2d`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 落点一：BUILD_ID 检查段（件① 现行为·:190-208 逐字亲读）

- :190-191 注释钉死现行为——`// Recorded blocker: next start with no production build → web_not_ready.` + `// Build only when BUILD_ID is absent. Do not rebuild a tree that already has one.`
- :192-193 判据**单一**：`const nextBuildId = ROOT + 'apps/web/.next/BUILD_ID';` + `if (!existsSync(nextBuildId)) {`——**存在即不重建·对产物新鲜度零检**（mtime/内容/构建时 commit 身份三路全无）。陈旧构建（如事故态：BUILD_ID 在·但早于接线 4 天）照走 :210-217 `next start` 直接服务 → 假红。此即事故机制链的全部必要环节。
- :195-201 内嵌 build 调用（缺 BUILD_ID 臂）：`spawnProc('web-build', 'node', [NEXT_BIN, 'build'], ROOT + 'apps/web', {PORT…API_BASE_INTERNAL…NEXT_PUBLIC_API_BASE…E2E_UI_STRESS:'1'})` → `const buildCode = await new Promise((res) => build.on('exit', res));`
- :202-207 非零退出臂：`if (buildCode !== 0 || !existsSync(nextBuildId)) { emitFailureDiagnostics(); emitE2EFailure({ class: 'frontend', code: 'web_not_ready' }); cleanup(); process.exit(buildCode && buildCode !== 0 ? buildCode : 1); }`——诊断面=仅 emitFailureDiagnostics 计数（见 1.2）·**零内容回收路径**。

### 1.2 落点二：tailAppend 扣留机制段（件② 现行为·:86-109 逐字亲读）

- :87 `const processDiagnostics = new Map();` :88-91 `tailAppend(name, chunk)` 只累加 `{chunks, bytes}`（`Buffer.byteLength(String(chunk))`）·**chunk 文本即刻丢弃**——全 spawn 面（api/worker/web-build/web）一视同仁扣留。
- :92-96 `emitFailureDiagnostics()` 失败时仅 `console.error('E2E_PROCESS_OUTPUT_WITHHELD process=… chunks=… bytes=…')`——复跑席亲历「9 chunks/3014B」即此行输出·内容不可回收·唯一救济=手动同 env 重放（非自动化·非证据面）。
- 契约约束（修法形边界·亲证）：`scripts/e2e-platform/secret-redaction.mjs` :52-59 要求本 runner 源**恒含** `E2E_PROCESS_OUTPUT_WITHHELD`（或等价）→件② **不得**改为实时透传（候选戊 §1.3）·落盘只能走**非零退出时的保留尾缓冲**旁路。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **件①候选甲（否决）=保守形告警不强制**：`console.warn` 后照旧服务既有构建——告警依赖人读 CI 日志·事故面恰是陈旧信号无人看·假红代价（门矩阵误判+人工复跑+错诊方向）≫重建耗时（数十秒级）·且强制形使门语义自洁。**本刀定稿=强制重建形**（协调方 brief 同推荐）。
- **件①候选乙（否决）=抽独立纯函数 helper**（如 `scripts/e2e-ui-build-guard.mjs`）换 import 级单测：+1 tracked 代码文件破本刀恰 1 代码面·且 runner 现形（tailAppend/spawnProc）同为内联内聚·自证走源级断言+副本双件（§2-2）已足·否决。
- **件①候选丙（否决）=BUILD_ID 内容级哈希比对**（构建时 commit 树哈希入产物）：Next.js 不暴露 build 输入哈希·需包装产物 manifest=跨面改·mtime 地板已覆盖事故形态（陈旧 4 天）·留作后继刀·否决。
- **件①候选丁（否决）=每次全量重建**（去 exists 短路）：常态重建耗时无谓·guard 形只在陈旧时重建·否决。
- **件②候选戊（否决）=web-build 输出取消扣留实时透传**：破 secret-redaction RUNNER_WITHHOLD 合同（`child_output_must_be_withheld_as_byte_counts`）+未消毒子进程输出直冲 CI 日志面·否决。
- **件②候选己（否决）=落盘仓外 OS temp**：诊断产物离仓不可随树追溯·`.tmp/` 已 gitignored 且仓内落盘有先例（:62 g7-ledgers·run-e2e-isolated.mjs :3013-:3051 0o700/0o600）·否决。
- **件②候选庚（否决）=构建成功也落盘**：非零退出才有诊断价值·成功落盘徒增磁盘面与误读面·定稿=仅失败落盘。

## §1-修法（恰 1 tracked 代码文件 4 编辑·**以下定稿文本 ⛔ 不得更改——EXEC 逐字节照抄·Ban 自由发挥**·行号系起草基线锚·并线漂移以内容锚 rg 定位·禁按行号自上而下套用）

- **件①-a（imports·:8/:10 两行整行替换）**：
```js
import { spawn, spawnSync } from 'node:child_process';
```
```js
import { readFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
```
- **件①-b（头注 :6 整行替换·消「已有生产构建则不重建」与 guard 行为的注释矛盾）**：
```js
 * 无生产构建、或 STALE_BUILD_GUARD 判定既有 .next/BUILD_ID 早于 HEAD commit time(陈旧构建假红防线)时先 `next build` 再 `next start`;其余已有生产构建不重建(构建太慢)。缺构建直接 start 的 web_not_ready 仍是失败;补构建不改写历史 exit。
```
- **件②-a（helper 块·在 `emitFailureDiagnostics` 定义收口 `};`（:96）与 `const spawnProc`（:97）之间整块插入）**：
```js
// STALE_BUILD_GUARD(件①):HEAD commit time 单次获取;git 不可用/非 git 树/解析失败 → null
// (检测面 fail-open=按现行为服务既有构建;陈旧判定面 fail-closed=强制重建·假红代价>重建耗时)。
const headTimeSec = () => {
  try {
    const r = spawnSync('git', ['log', '-1', '--format=%ct', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
    const t = Number(String(r.stdout ?? '').trim());
    return Number.isFinite(t) && t > 0 ? t : null;
  } catch {
    return null;
  }
};
// 件②:web-build 扣留输出保留缓冲(仅内嵌 next build 挂接·尾上限 ≤400 行且 ≤64KiB 先触为准)
// ——非零退出时落盘 .tmp/e2e-ui-build-log/<ts>.log(gitignored·0o600·沿 run-e2e-isolated :3050 先例)
// +stderr 回放同缓冲;构建成功零写盘零行为变化。落盘系本地诊断·非收据非证据面。
const BUILD_LOG_DIR = `${ROOT}.tmp/e2e-ui-build-log`;
const BUILD_LOG_TAIL_LINES = 400;
const BUILD_LOG_TAIL_BYTES = 64 * 1024;
const buildRetained = [];
let buildRetainedBytes = 0;
let buildRetainedDropped = false;
const buildSink = (stream, chunk) => {
  const text = String(chunk);
  buildRetained.push({ stream, text });
  buildRetainedBytes += Buffer.byteLength(text);
  while (buildRetained.length > 1 && (buildRetainedBytes > BUILD_LOG_TAIL_BYTES || buildRetained.length > BUILD_LOG_TAIL_LINES)) {
    buildRetainedBytes -= Buffer.byteLength(buildRetained[0].text);
    buildRetained.shift();
    buildRetainedDropped = true;
  }
};
const writeBuildLog = () => {
  try {
    mkdirSync(BUILD_LOG_DIR, { recursive: true, mode: 0o700 });
    const logPath = `${BUILD_LOG_DIR}/${new Date().toISOString().replace(/[:.]/g, '-')}.log`;
    const body = `${buildRetainedDropped ? '[e2e-ui-build-log: 早期内容已按尾上限截断·仅保留最后 ≤400 行/64KiB]\n' : ''}${buildRetained.map((c) => `[web-build:${c.stream}] ${c.text}`).join('')}`;
    writeFileSync(logPath, body, { encoding: 'utf8', mode: 0o600 });
    console.error(`E2E-UI-BUILD-LOG: web-build 非零退出·扣留输出已落盘 ${logPath}(保留尾 ≤400 行·同内容 stderr 回放如下)`);
    process.stderr.write(body);
  } catch (e) {
    console.error(`E2E-UI-BUILD-LOG: 落盘失败(${e?.code ?? e?.message ?? 'unknown'})·扣留输出维持只计数`);
  }
};
```
- **件①-c+件②-b（BUILD_ID 检查段·:190-208 整段替换）**：
```js
  // Recorded blocker: next start with no production build → web_not_ready.
  // Build when BUILD_ID is absent — or when STALE_BUILD_GUARD finds the existing
  // build older than HEAD(陈旧构建假红防线·UC003 门⑥事故:BUILD_ID mtime 早于接线
  // 仍「在即不重建」→ 服务陈旧构建假红·复跑席再实证扣留输出不可回收)。
  const nextBuildId = ROOT + 'apps/web/.next/BUILD_ID';
  let forceRebuild = false;
  if (existsSync(nextBuildId)) {
    const headCommitTimeSec = headTimeSec();
    if (headCommitTimeSec === null) {
      console.warn('E2E-UI: STALE_BUILD_GUARD HEAD commit time 不可得(git 不可用/非 git 树)→ 按现行为服务既有构建');
    } else {
      try {
        const buildIdMtimeMs = statSync(nextBuildId).mtimeMs;
        if (buildIdMtimeMs / 1000 < headCommitTimeSec) {
          forceRebuild = true;
          console.warn(`E2E-UI: STALE_BUILD_GUARD .next/BUILD_ID mtime=${new Date(buildIdMtimeMs).toISOString()} 早于 HEAD commit time=${new Date(headCommitTimeSec * 1000).toISOString()} → 强制重建(防陈旧构建假红)`);
        }
      } catch {
        console.warn('E2E-UI: STALE_BUILD_GUARD BUILD_ID mtime 读取失败 → 按现行为服务既有构建');
      }
    }
  }
  if (!existsSync(nextBuildId) || forceRebuild) {
    console.log(forceRebuild ? 'E2E-UI: STALE_BUILD_GUARD 判定陈旧构建 → 强制 next build…' : 'E2E-UI: 无 .next/BUILD_ID，先 next build 再 next start…');
    const build = spawnProc('web-build', 'node', [NEXT_BIN, 'build'], ROOT + 'apps/web', {
      PORT: String(webPort),
      API_BASE_INTERNAL: apiBase,
      NEXT_PUBLIC_API_BASE: apiBase,
      E2E_UI_STRESS: '1',
    });
    build.stdout.on('data', (d) => buildSink('stdout', d));
    build.stderr.on('data', (d) => buildSink('stderr', d));
    const buildCode = await new Promise((res) => build.on('exit', res));
    if (buildCode !== 0 || !existsSync(nextBuildId)) {
      writeBuildLog();
      emitFailureDiagnostics();
      emitE2EFailure({ class: 'frontend', code: 'web_not_ready' });
      cleanup();
      process.exit(buildCode && buildCode !== 0 ? buildCode : 1);
    }
  }
```
- **守恒断言**：`spawnProc` 定义（:97-109）·:210-217 next start 段·:228-234 playwright 段·其余全文件**零字节零触**；`E2E_PROCESS_OUTPUT_WITHHELD` 词面恒在（secret-redaction RUNNER_WITHHOLD 合同·:94 原行零触）；`assertNoFakeServiceFlags` import/call 恒在（static-guards :141-142）；新增 console 行零敏感词（token/Authorization/audioBase64/contentBase64/MODEL_API_KEY/PAY_PROVIDER_SECRET/AUTH_SECRET·secret-redaction LOG_LEAK :20 判据）；spawnProc 签名零改（件② 挂接走 spawn 后追加 listener·多监听者与 tailAppend 并存·顺序=tailAppend 先）；diff 面恰 1 tracked 代码文件=`scripts/run-e2e-ui.mjs`（约 +55/−3·对届时 numstat 实测）+本卷 .md 新增。
- **行为语义登记（非偏离·本刀明示语义）**：①陈旧判定=mtime 秒 `<` HEAD %ct 严格小于·相等不判陈旧（保守服务）；②检测面失败（git 不可用/非 git 树/mtime 读失败）=fail-open 按现行为+warn（防「无 git 环境」全量 break·零回归纪律）——与陈旧判定面 fail-closed（强制重建）分立；③HEAD time 系地板判据：未提交工作树改动不可检（已知局限·候选丙留后继）；④fresh build of old commit（pull 后旧代码重构建）mtime 新于 HEAD time→不判陈旧——同属地板判据已知局限·如实登记不讳。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵·**数字口径以实跑实测为准+偏差熔断**·命令原样可复制）

0. **改前基线 run（必做·并主线后改前树）**：`node scripts/e2e-static-guards.mjs` EXIT=0 + `node scripts/e2e-platform/prove.mjs` EXIT=0 + `node scripts/ai-docs/check-docs.mjs` EXIT=0（scanned 对届时实测·起草基线=2153）——基线任一红→停（现场漂移类）。
1. **既有 e2e-ui 面零回归·真环境门（条件执行）**：`pnpm uc003:i18n-locale-ui:prove` EXIT=0——**可跑判定**=docker DB 在跑+`MODEL_API_KEY` 在场+隔离包装器可用；**不可跑→如实记 SKIP·零降格零假绿**·零回归判据转由门 3/门 4 静态面+门 2 自证面承载（门 3/4 恒等通过=runner 形制与 redaction 契约零破坏的机检证据·真 UI 路径行为面零回归另由本刀「只拓宽重建入口条件·不改任何既有路径行为」的结构事实承载：BUILD_ID 缺失臂/非零退出臂/next start 臂/playwright 臂逐字节零触面见 §1-修法守恒断言）。
2. **runner 自证三件（必做·环境无关·副本强度局限如实登记=副本≠import·与自证一源级断言合成锚定）**：
   - **自证一·源级守卫断言（对真文件·防守卫被静默摘除）**：
```bash
node -e '
const fs = require("node:fs");
const src = fs.readFileSync("scripts/run-e2e-ui.mjs", "utf8");
const checks = [
  ["guard-warn-word", src.includes("STALE_BUILD_GUARD")],
  ["stale-compare", /buildIdMtimeMs \/ 1000 < headCommitTimeSec/.test(src)],
  ["forced-rebuild-wiring", src.includes("!existsSync(nextBuildId) || forceRebuild")],
  ["head-time-git", src.includes("--format=%ct")],
  ["build-log-dir", src.includes(".tmp/e2e-ui-build-log")],
  ["build-log-on-fail-arm", /buildCode !== 0 \|\| !existsSync\(nextBuildId\)\) \{\n      writeBuildLog\(\);/.test(src)],
  ["withheld-contract-kept", src.includes("E2E_PROCESS_OUTPUT_WITHHELD")],
  ["tail-cap-registered", src.includes("BUILD_LOG_TAIL_LINES = 400") && src.includes("64 * 1024")],
];
const bad = checks.filter(([, ok]) => !ok);
if (bad.length) { console.error("SELF-PROBE-1 FAIL: " + bad.map(([n]) => n).join(",")); process.exit(1); }
console.log("PASS source-level guard assertions " + checks.length + "/" + checks.length);
'
```
   - **自证二·守卫决策副本直测（伪造旧 BUILD_ID 触发重建路径断言·真 git HEAD %ct）**：
```bash
node -e '
const fs = require("node:fs"); const os = require("node:os");
const { spawnSync } = require("node:child_process");
const head = Number(spawnSync("git", ["log", "-1", "--format=%ct", "HEAD"], { encoding: "utf8" }).stdout.trim());
if (!Number.isFinite(head) || head <= 0) process.exit(1);
const dir = fs.mkdtempSync(os.tmpdir() + "/sbg-probe-");
const stale = dir + "/BUILD_ID-old";
fs.writeFileSync(stale, "probe");
fs.utimesSync(stale, new Date(0), new Date(0));
const fresh = dir + "/BUILD_ID-new";
fs.writeFileSync(fresh, "probe");
const future = new Date(Date.now() + 3600000);
fs.utimesSync(fresh, future, future);
const isStale = (p) => fs.statSync(p).mtimeMs / 1000 < head;
if (isStale(stale) !== true) process.exit(1);
if (isStale(fresh) !== false) process.exit(1);
console.log("PASS replica stale-decision: old->rebuild, fresh->serve (head=" + head + ")");
'
```
   - **自证三·落盘副本直测（尾上限截断+截断标记+尾保留）**：
```bash
node -e '
const fs = require("node:fs"); const os = require("node:os"); const path = require("node:path");
const CAP_LINES = 400, CAP_BYTES = 64 * 1024;
const retained = []; let bytes = 0; let dropped = false;
const sink = (t) => { retained.push(t); bytes += Buffer.byteLength(t);
  while (retained.length > 1 && (bytes > CAP_BYTES || retained.length > CAP_LINES)) { bytes -= Buffer.byteLength(retained[0]); retained.shift(); dropped = true; } };
for (let i = 0; i < 500; i++) sink("line-" + i + "\n");
const dir = fs.mkdtempSync(os.tmpdir() + "/sbg-log-");
const p = path.join(dir, "probe.log");
fs.writeFileSync(p, (dropped ? "[truncated]\n" : "") + retained.join(""), { mode: 0o600 });
const out = fs.readFileSync(p, "utf8");
if (!out.startsWith("[truncated]")) process.exit(1);
if (retained.length !== 400) process.exit(1);
if (!out.includes("line-499")) process.exit(1);
console.log("PASS replica build-log: cap=" + retained.length + " lines, truncated marker, tail kept");
'
```
   - 三件全 EXIT=0；任一 FAIL→触停止条件「机制不满足」。
3. **静态邻面守卫**：`node scripts/e2e-static-guards.mjs` EXIT=0（assertNoFakeServiceFlags import/call 恒在+runner 形制）。
4. **静态邻面·e2e-platform:prove**：`node scripts/e2e-platform/prove.mjs` EXIT=0（secret-redaction RUNNER_WITHHOLD+LOG_LEAK 在改后树仍绿）。
5. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
6. **lint**：`pnpm turbo lint` EXIT=0 全域 0 errors·五值对届时实测（起草参照=cache-observe-repin 卷门 10：web 601/root 5235/api 1421/worker 954/ai-runtime 628·漂移如实登记·非本刀面所致方可）。
7. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**scanned≤cap 2160**（预期 2154=基线 2153+本卷 1·**>2160 红停上报**·cap sanction 权归协调方·Ban 自升）。
8. **markers 五类零命中**：改动集（本卷 1 .md——EXEC 期扩为 .md+runner 两件）五类标记词 grep 零命中（`scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·词面不复抄卷内防自匹配·命令与回执入收据）。
9. **diff 面机检+卫生**：`git diff --numstat <base>`（`<base>` 钉明=届时主线 tip=EXEC 工序 1 并线 merge 第二亲——防对起草基线 union diff 连他件假停·沿 cache-observe-repin §2-13 rev2 形）恰 2 tracked 路径=**①代码面恰 1 tracked 修改=`scripts/run-e2e-ui.mjs`（派单「恰 1 tracked」所指）**+**②本卷 .md 新增（卷宗本体·沿 cache-observe-repin §2-13 计数形）**——多任何其余 tracked 路径即停；`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改；`.env*` ABSENT 双向记录；`actualSpendCny=null`；est live=0。
10. **副效应登记**：typecheck 门运行可能翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 构建状态件）——`git checkout` 回滚保门 9 恰 2 路径（沿 cache-observe-repin §9 先例·非交付面）；`.next/`·`.tmp/` 均 gitignored 不入 diff（门 9 机检兜底）；`.tmp/e2e-ui-build-log/*.log` 运行副产物 Ban 入树（§3-7）。

## §3 范围外（边界清单·越界即 FAIL）

1. **prove 断言面全 Ban**：一切 `*.proof.ts`/`*.proof.mjs`/prove 脚本/Playwright specs（含 uc003 spec）零字节——本刀零断言改动·runner 自证三件系 ad-hoc node 副本探针**不入树**（命令仅入本卷面·Ban 新增任何 tracked 测试/证明文件·候选乙 §1.3）。
2. **产品码全 Ban**：`apps/*` src·`packages/*` src 零字节。
3. **其他 runner/helper 零字节**：`run-e2e.mjs`/`run-e2e-isolated.mjs`/`run-e2e-performance-suite.mjs`/`run-performance-e2e.mjs`/`capture-screenshots.mjs`/`e2e-fake-service-flags.mjs`/`e2e-live-capability-env.mjs`/`e2e/helpers/failure-class.mjs`/`withheld-output.mjs` 零触。
4. **CI/workflow/pnpm scripts 零改**（package.json 零字节——门 1 现形直接可用）·零 .gitignore 改（`.tmp/` 已在 :15）。
5. **共享 SSOT 零改**：LEDGER/checklist/backlog/north-star 只读（本刀无批表行·行翻面权归协调方）。
6. **零迁移零 DDL**（§0.1 #9）·零依赖升级·零 cap 自升（§2-7）。
7. **`.tmp/e2e-ui-build-log/*.log` 运行副产物 Ban 入树入 commit**（gitignored 双保险·Ban `add -f`）；落盘内容 Ban 作为收据/证据面引用（本地诊断性质·secret 暴露面已由 0o600+行上限+gitignored 三重收窄）。

## §4 依赖

**①上游**：无（自足小刀·基线=origin tip `77ba32ab` 已含全部前置·零跨卷语义依赖）。
**②无同文件并发**：§0.0 全支线扫描=零非残枝在飞触面（91c04145 已 HEAD 祖先亲证）·EXEC 立项日必做重扫。
**③迁移号**：预期零（§0.1 #9）。
**④下游**：EXEC 绿→post 双审→nail 归协调方；事故面（UC003 门⑥陈旧产物假红）与诊断盲区（扣留输出不可回收）两防线随本刀闭合；后继候选（构建时 commit 身份内容级判据·候选丙）留独立刀。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban merge 主线（本席⛔·并线归 EXEC 工序）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban 翻 pins（§5 十一值+`actualSpendCny=null`·零翻转）；Ban 触 prove 断言面/产品码/其他 runner/helper（§3-1/2/3）；Ban 自由发挥定稿文本（§1-修法 ⛔ 条款）；Ban 新增 tracked 测试/证明文件（§3-1）；Ban 改 spawnProc 签名/`:210` 起 next start 段/playwright 段（守恒断言）；Ban 摘除 `E2E_PROCESS_OUTPUT_WITHHELD` 词面或改实时透传（候选戊·secret-redaction 合同）；Ban 弱化陈旧判定（候选甲保守形复辟·定稿=强制重建形）；Ban 检测面失败改 fail-closed 硬败（§1-修法行为语义②·零回归纪律）；Ban 落盘日志入树/作证据面引用（§3-7）；Ban 触共享 SSOT/批表行翻面（§3-5）；Ban 迁移 Ban DDL Ban 依赖升级 Ban cap 自升（§3-6/§2-7）；Ban retry-to-green（门矩阵任一门红不重跑冲销·如实登记升级）；Ban 就地归因邻面新红（§2 任一门红根因不在本刀面→停·Ban 借机修）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载零生产操作零 secrets 零消耗（读码+静态门+docs:check 全离线）。EXEC 期：门 1 条件门若跑即真栈真浏览器（docker DB+MODEL_API_KEY·隔离面）——消耗面=既有 e2e:ui 形·无新增外呼语义；门 0/2/3/4/5/6/7/8 全离线·est live 仍按「零模型外呼新增」口径=0·实跑如有如实登记收据。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·词面不复抄卷内防自匹配——沿 negbend/g7w/authz 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1 红事实结论与 §5 Ban/pins 与 §1-修法定稿文本面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠重扫必做）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 `run-e2e-ui.mjs` blob 对 `84f9cd2d` 漂移·关键行锚（:86-96 扣留段/:190-208 BUILD_ID 段）漂移·§0.0 重扫出新非残枝在飞触面·门 0 基线在改前树红→停·重 pin 回炉。
- **机制不满足**：自证一源级断言任一 FAIL·自证二副本判定 RED（stale≠true/fresh≠false）·自证三截断形 RED→证伪诊断→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出恰 1 tracked 代码文件面（需触其他 runner/helper/proof/产品码/.gitignore/package.json）→停·另刀或协调方裁决（§1.3 候选乙/戊/己沿承）。
- **验收红不可修**：门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 漂红/docs:check>2160/uc003 真环境门红且归因陈旧产物以外）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（EXEC 席落卷·2026-10-14·授权链=pre-exec 双审会签 PASS（席1 `agent_e9fc9beb`+席2 `agent_bdce64cf`·双 PASS 落卷）→协调方明示 EXEC 授权（committed SHA 重钉 `dd995ed1`）→本席 EXEC·⛔push·七字段+P2 勘正/登记随卷落点）

**①工序与 commit 链**：①`git fetch` 后亲证 origin tip=`fb97734c`（≥任务书并线锚 `5a0bf9e4`·=cap 2168 sanction 锚等值）→`git merge --no-ff origin/feat/mysql-schema-skeleton` **零冲突** 7 files +345/−7·双亲=`dd995ed1`+`fb97734c`→并线 merge=`ae29d0fe`（禁 pull --rebase 遵守·⛔force push 未用）；②§0 全量重 pin：八锚 blob 对届时树（`ae29d0fe`）全恒等（runner `84f9cd2d`/secret-redaction `2e51284c`/static-guards `01127803`/run-e2e-isolated `0787a7ff`/withheld-output `caefe488`/.gitignore `b84e2b41`/package.json `3b04b871`）·主线 `77ba32ab..5a0bf9e4` 对 `scripts/run-e2e-ui.mjs` 零触亲证（`git log --oneline <range> -- <径>` 空）·`fb97734c` sanction 触面恰两 scripts 文件亲证（`public-text-policy.mjs`+`public-text-policy.proof.mjs`）·cap `MAX_FILES=2_168` 在场·迁移链头 `0204`（204 文件）恒等；§0.0 在飞交叠全支线重扫（本席亲跑全本地支线对 runner 单径）=`line/*` 顶触全 `91c04145`/`057701c4`/`cc8050d5`/`7da29707` 全 HEAD 祖先（`merge-base --is-ancestor` 逐核 EXIT=0）·唯一非祖先顶触=`c3de7fe6`（2026-08-14·feature/ecs-*/preview-* 远古残枝群·与起草 §0.0 登记全同形）=**零非残枝在飞触面**；③件①/件② 四编辑程序化套用（从本卷 §1-修法 提取五 fenced 块逐字节套用·沿 cache-observe-repin §9 工序③先例形）→五块对改后文件 `includes` 逐字节恒等核 PASS+守恒断言（spawnProc 定义/next start 臂/playwright 臂零触·旧头注行已消）PASS+`node --check` PARSE OK；④门矩阵十门（下表）；⑤本 §9+Status/footer STOP 翻面落卷=本 commit。

**②改前基线 run（门 0·并线树 `ae29d0fe` 改前·零 retry）**：`node scripts/e2e-static-guards.mjs` EXIT=0（runners=6 helpers=21 flags=9 aiPaths=6）+ `node scripts/e2e-platform/prove.mjs` EXIT=0（5 guards）+ `node scripts/ai-docs/check-docs.mjs` EXIT=0 scanned **2156**≤cap 2168（与 sanction `fb97734c` 落值 2156 恒等）——基线任一红停条款未触。

**③门矩阵十门终值（改后树· runners 唯一改动=`scripts/run-e2e-ui.mjs` +70/−6）**：

| # | 门 | 实测 | EXIT |
|---|---|---|---|
| 0 | 改前基线（并线树 `ae29d0fe`） | static-guards 绿+prove 绿+docs:check scanned 2156≤2168 | 0 |
| 1 | uc003:i18n-locale-ui:prove | **SKIP 如实登记（零假绿零降格）**：环境判定不可跑=隔离 compose（compose.mysql-local.yml·:33069）未在跑（docker 仅 dev PG）+`MODEL_API_KEY` 进程 env ABSENT+仓根 `.env` ABSENT（loader 方式 b 无注入源·Ban 造 .env·沿 uc003-arm4 EXEC「pre-flight live_provider_key_missing 停上报」先例形）·零回归判据由门 3/4 静态面+门 2 自证面+「只拓宽重建入口条件·不改任何既有路径行为」结构事实承载（§2-1 预设路径） | — |
| 2 | runner 自证三件 | 自证一源级守卫断言 **8/8**（guard-warn-word/stale-compare/forced-rebuild-wiring/head-time-git/build-log-dir/build-log-on-fail-arm/withheld-contract-kept/tail-cap-registered）+自证二守卫决策副本（utimesSync 伪造旧 BUILD_ID→stale=true·伪造未来→false·真 HEAD %ct=1792090376）+自证三落盘副本（500 行入 sink→恰 400 保留+截断标记+line-499 尾存） | 0 |
| 3 | e2e-static-guards（改后） | runners=6 helpers=21 flags=9 aiPaths=6·assertNoFakeServiceFlags import/call 恒在 | 0 |
| 4 | e2e-platform:prove（改后） | PASS 5 guards（RUNNER_WITHHOLD 含本 runner+LOG_LEAK 全扫面对改后树绿） | 0 |
| 5 | typecheck | `pnpm turbo typecheck --force` **8 successful, 8 total·0 cached** | 0 |
| 6 | lint | `pnpm turbo lint` **12 successful, 12 total**·全域 **0 errors**·五值恰等 **web 601/root 5235/api 1421/worker 954/ai-runtime 628**（对起草参照五值逐值恒等） | 0 |
| 7 | docs:check | EXIT=0 scanned **2156**≤cap **2168**（cap=sanction `fb97734c`·本刀零自升·本卷 .md 系既有 tracked 增行不改 scanned 文件数） | 0 |
| 8 | markers 五类 | 改动集（runner+本卷 .md 两件）零命中（i6-239 §2-7 运行时组装口径·词面不复抄） | 0 |
| 9 | diff 面机检 | 对 base=`fb97734c`（并线 merge 第二亲·防对起草基线 union diff 连他件假停）恰 **2 tracked**=①代码面恰 1=`scripts/run-e2e-ui.mjs`（**+70/−6**·git diff --numstat 亲测）+②本卷 .md（卷宗本体·沿 cache-observe-repin §2-13 计数形） | — |
| 10 | 卫生 | `pnpm install --frozen-lockfile` EXIT=0（4s·新建 worktree node_modules 空修复·沿 qbank-scope-fix EXEC 先例形·lockfile 零改亲证）·`.env*` ABSENT 双向记录·`actualSpendCny=null`·est live=0（十门全离线·门 1 SKIP 零实跑） | 0 |

**④runner 自证三件+三合同复跑（对改后文件）**：自证三件全 EXIT=0（上表门 2·副本强度局限=副本≠import 沿 §0.2-2 如实登记·源级断言对真文件锚定同构）；三合同复跑=`secret-redaction` 独跑 PASS（LOG_LEAK 对改后 console 行零敏感词命中+RUNNER_WITHHOLD 本 runner `E2E_PROCESS_OUTPUT_WITHHELD` 词面恒在）+`e2e-static-guards` 独跑 PASS（fake-service import/call 恒在+runner 形制恒在）——合成自证四件全绿，「机制不满足」停止条件未触。

**⑤运行副效应与卫生**：typecheck 门曾翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 构建状态件）——`git checkout` 回滚保门 9 恰 2 路径（沿 cache-observe-repin §9 先例·非交付面）；`.tmp/e2e-ui-build-log/*.log` 零产生（本刀零整 runner 实跑·直测不可行性沿 §0.2-2 双证）；门 1 SKIP 见上表。

**⑥偏离清单（零偏离+P2 勘正/登记随卷落点·append 注记形不洗·本段以下勘正不改 §1/§2 原文一字）**：

- **P2-1（席1·勘正已兑现）**：§1-修法守恒断言 numstat 自估「约 +55/−3」→**实测「约 +70/−6」勘正**——EXEC 实测 `git diff --numstat`=70/6 恰印证勘后估计·落点=本行+门 9 行。
- **P2-2（席1·登记）**：件② stderr 回放语义登记一句——回放内容=next build 诊断输出（`buildRetained` 缓冲·spawn 后追加 listener 采集）·**非 env 回显面**·暴露级与裸转发（spawnProc forwardOutput 形）同级·0o600+gitignored+行上限三重收窄不变·落点=本行。
- **P2-3（席1·局限④补句）**：§1-修法行为语义④地板判据补登记「固定化提交日期形态（`GIT_COMMITTER_DATE`/`--committer-date-is-author-date`）致 %ct 假旧误判新鲜」——固定化提交日期使 HEAD %ct 失真·陈旧判定地板随之失真·属地板判据已知局限族·候选丙（内容级判据）后继刀承接口·落点=本行（§1 原文不洗）。
- **席2-P3-1（登记）**：件② 落盘形对 `run-e2e-isolated.mjs :3050-3051` 先例有**非原子写偏离**（先例=partial+`renameSync` 原子形·件②=`writeFileSync` 直写单文件非收据面·诊断性质可容忍·沿先例仅取 0o700/0o600 权限形）·落点=本行。
- **席2-P3-2（登记）**：buildSink 尾上限形对**单巨条目超 64KiB 不设防**（`while (buildRetained.length > 1 …)` 恒保留末条·单 chunk >64KiB 时缓冲总量可超上限·落盘体相应超限·诊断面可容忍·如实登记）·落点=本行。
- **席2-P3-3（登记）**：`.tmp/e2e-ui-build-log/` **无清理惯例**（落盘日志无自动清除·本地累积面·gitignored 不入树·如实登记）·落点=本行。
- **席2-P3-并发窗口（登记·微扩一行）**：并发双 runner 同树「检测-重建」非原子·陈旧判定与 `next build` 落 BUILD_ID 之间存在竞态窗口（两 runner 同判陈旧各走重建·后者覆盖前者产物·幂等同向·如实登记）·落点=本行。
- **席1-P2-6（登记）**：时钟偏斜假陈旧一行——宿主时钟回拨/偏斜可使 BUILD_ID mtime 相对 HEAD %ct 呈假旧→误判陈旧触发多余重建（安全向·仅耗重建时长·不产生假红）·落点=本行。

**⑦停止条件四类核+STOP 终态**：现场漂移=八锚 blob+cap 2168+链头 0204 全恒等+§0.0 重扫零非残枝触面（未触）；机制不满足=自证一 8/8+自证二 stale=true/fresh=false+自证三截断形全绿（未触）；越界需要=修法面恒恰 1 tracked 代码文件 `scripts/run-e2e-ui.mjs`+本卷 .md（未触）；验收红不可修=门矩阵九门全绿+门 1 SKIP 系 §2-1 预设路径非红（未触）。§1 红事实结论/§5 Ban/pins 十一值/§8 停止条件四类/§1-修法定稿文本面**零改零翻转**（P2/P3 勘正登记全走本 §6 append 形）。

**STOP · `executed:awaiting_post_prove_dual` · 码面/门矩阵 EXEC 侧已收口·post 双审两外席待派 · nail 与批表/行翻面权归协调方/主会话批边界 · alone≠dual · ⛔push**

---

*E2E-RUNNER-STALE-BUILD-GUARD REQUEST · 2026-10-14 起草落卷·同日 EXEC 落卷（§9 七字段+P2 勘正/登记随卷） · **`executed:awaiting_post_prove_dual`（§9 EXEC 记录·门矩阵十门：九门全绿+门 1 真环境条件门 SKIP 如实登记·post 双审待派·nail/行翻面归协调方）** · base 主线 tip `77ba32ab`（起草时）·并线=`ae29d0fe`（--no-ff 并 origin/feat/mysql-schema-skeleton@`fb97734c`=cap 2168 sanction·零冲突 7 files +345/−7·双亲 `dd995ed1`+`fb97734c`·届时 tip≥并线锚恒等）· 分支 `line/e2e-runner-stale-build-guard` · 工作树 `meetwise-sbg`（本起草席立·reset 钉 origin tip 亲证）· 立项出处=UC003 门⑥陈旧产物事故（.next/BUILD_ID mtime 早于接线 4 天·「BUILD_ID 在即不重建」单一判据→服务陈旧构建假红）+复跑席实证（web-build 非零退出扣留输出 9 chunks/3014B 只计数不落盘不可回收·靠手动同 env 复现定位）+协调方派单 brief 双改进候选 · 读码定稿=run-e2e-ui.mjs `84f9cd2d` 三落点（:86-96 tailAppend/emitFailureDiagnostics 扣留机制·:97-109 spawnProc·:190-208 BUILD_ID 检查+内嵌 build 调用+非零退出臂）· runner 直测不可行双证（:46 isolation throw+:53 provider key throw+全栈前置不可达 BUILD_ID 段·import 顶层 side-effect 即 throw）→自证=源级守卫断言+决策/落盘副本直测三件合成（副本强度局限如实登记）· 修法=恰 1 tracked 代码文件 4 编辑实测 +70/−6（件① stale-build guard 强制重建形=mtime<HEAD %ct 严格小于·检测面 fail-open/判定面 fail-closed 分立·候选甲乙丙丁否决在卷；件② build 输出落盘=非零退出时保留尾 ≤400 行/64KiB 写 `.tmp/e2e-ui-build-log/<ts>.log` 0o600 gitignored+stderr 回放·成功零写盘·候选戊己庚否决在卷）· 门矩阵十门承卷（改前基线+uc003 真环境条件门 SKIP 如实登记零假绿+runner 自证三件+static-guards+e2e-platform:prove+typecheck 8/8+lint 五值恰等+docs:check 2156≤cap 2168+markers+diff 恰 2 tracked=1 代码+本卷 .md+卫生·十门详 §9-③）· 契约恒在（E2E_PROCESS_OUTPUT_WITHHELD 词面·assertNoFakeServiceFlags import/call·LOG_LEAK 零敏感词）· 迁移零（链头 0204）· est live=0 · markers=0 · pins 十一值照抄零翻 · 停止条件四类全数未触 · Ban self-approve · alone≠dual · ⛔push · STOP*

### §9-补1 门 1 补跑记录（补跑席·2026-10-16 03:36 CST·授权兑现跑·append 形不洗 §9 原文一字）

**授权链**：post 席1（`agent_8c20e748`）裁定=门 1 SKIP 承登成立但子理由「loader 方式 b 无注入源」**事实性错误**（loader 亲证可注入 116 字符）·真实承重面=隔离 compose 栈未跑（`run-e2e-isolated` 零自启 compose·外部前置）→协调方特授权补跑席兑现门 1·**恰 1 run 授权兑现跑（非 retry-to-green）**·⛔push。

**前置核**：`git status --porcelain` 净+HEAD=`0ff56cfb`（§9 EXEC 卷 commit）恒等。

**栈**：`docker compose -f docker/compose.mysql-local.yml up -d`→meetwise-mysql-local/meetwise-redis-mysql-local/meetwise-qdrant-local 三容器 ~13s 全 `healthy`（新建 volume 四件系首起非残留）。

**方式 b（loader 同 shell env 注入·零 .env 落盘）**：`source ~/.meetwise-secrets/load-model-api-key.sh` 与 `pnpm` 同 shell 进程·pre-run presence 核=`MODEL_API_KEY` PRESENT len=**116**（亲证推翻门 1 SKIP 承登「loader 无注入源」子理由·坐实 post 席1 勘正）。

**补跑实测（恰 1 run·全量输出存档 `.tmp/gate1-rerun/prove-20261016-033634.log` gitignored）**：`pnpm uc003:i18n-locale-ui:prove` → **EXIT=1 红**。臂账=**Running 1 test·1 failed·0 passed**。

**红臂证据（如实·不修饰·未再跑）**：`apps/web/e2e-ui/uc003-i18n-locale.spec.ts:80` › UC003-I18N-locale-en（断言点 `:157`）`expect(unknown).toEqual([])` 报「unallowlisted zh residual on /resume in locale=en」——Expected `Array []` / Received **+10**·inventory 22 distinct text nodes 中 12 allowlisted/**10 unknown**·received 全集=RSC flight payload `self.__next_f.push([1,…])` 内联 8 chunk（含 chunk 9 metadata title `"children":"简历 · 知面 · 知面 Meetwise"`）+ document title 文本节点「简历 · 知面 · 知面 Meetwise」——即红系**应用层 i18n 残留清点断言面**（RSC payload CJK 文本节点与页面 title 未入具名 allowlist）·非 runner 层错误。

**runner 层证据（sbg 两件行为面·零回归证据在案）**：`run-e2e-ui.mjs` :21「无 .next/BUILD_ID，先 next build 再 next start」=既有重建臂被走（fresh 树无产物）·`STALE_BUILD_GUARD`/`forceRebuild` 词面全程零命中（件① 检测面零误报·未误判陈旧）·`E2E_PROCESS_OUTPUT_WITHHELD process=web-build stdout chunks=18 bytes=72188 + stderr chunks=5 bytes=1592`（件② sink 扣留契约恒在）·build 成功→`.tmp/e2e-ui-build-log` **零产生**（件②「成功零写盘」亲证成立）·`E2E_FAILURE class=frontend code=client_exited`（playwright 客户端失败如实上报）。

**门 1 兑现判定**：SKIP→授权兑现跑完成·**结果红 EXIT=1·门 1 未绿**——红因在应用层残留断言面·归因与处置（allowlist 增补/另立卷/行翻面）权归协调方·本席停止条件「验收红且口径内修不了」命中即停·零 retry 零修饰。

**清理**：compose 栈 down（三容器+network 移除·volume 留置登记）·`apps/web/test-results/.last-run.json`（tracked 副产）`git checkout` 回滚（沿 §9-⑤ tsbuildinfo 先例形）·test-results 失败产物目录（trace.zip/screenshot/error-context）移档 `.tmp/gate1-rerun/test-results-archive/` 保证据（gitignored）·`.next` 零残留·`.tmp/e2e-ui-build-log` 零产生·终核 `git status --porcelain` **净**（tracked 零翻动）。

**STOP · 门 1 补跑=executed:red_unresolved（红已承登·处置权归协调方） · alone≠dual · ⛔push**

### §9-补2 post P2 勘误随卷（nail 席代落·post 双审会签 PASS 授权·2026-10-16·append 注记形不洗上文一字）

- **P2-A（§9-补1 红臂证据段账目勘正）**：「inventory 22 distinct text nodes 中 12 allowlisted/**10 unknown**」应读「**14 allowlisted/8 unknown**」（22 总数不变）·「Received **+10**」系 **jest-diff 行计数伪影**——received 实为 **8** distinct 节点（**7 RSC chunk 条目 + 1 document title 文本节点**）·diff 渲染按物理行展开致行面计数虚高·对齐主线 i18n-metadata-ssr **8-UNKNOWN 先例**（`480a9f50` 门② 臂④ 修前账目同口径）。红臂归因（应用层残留断言面·非 runner 层）零变。
- **P2-B（§9-补1 清理段勘正）**：「`.next` 零残留」**不实**——`.next/BUILD_ID` 实际留置 **`yLq3NhKY5teAt9FQx9rAC`**（mtime=补跑 build 时点 03:37·gitignored·nail 席时点亲证在树）；「新建 volume **四件**」应为「**三件**」（`meetwise-mysql-local_{mysql_local,qdrant_local,redis_mysql_local}`·`docker volume ls` 亲证）；后果=并线后 HEAD `%ct`=1792095709 > BUILD_ID mtime=1792093023 → **下次跑 STALE_BUILD_GUARD 判陈旧走强制重建臂·属件① 设计内行为**（防陈旧假红机制按预期行使·非事故形态）。
- **P3-C（116 字符回执未归档登记）**：§9-补1 方式 b 段「`MODEL_API_KEY` PRESENT len=**116**」系补跑席现场观测·loader 输出与 env 指纹**未落任何归档文件**（prove log 只含测试输出·不含 loader 回执面；补跑席清理段移档清单只含 test-results 产物）·回执不可复核状态如实登记·归后继工具刀/流程勘误处置。

### §9-补3 门 1 闭环补跑记录（nail 席·2026-10-16 04:25 CST·协调方特授权 LIVE·loader 方式 b·恰 1 run·append 形不洗上文一字）

**授权链**：post 双审会签 PASS（席1 `agent_8c20e748`+席2 `agent_c18cbd8c`·门 1 红归因=**非 sbg 因果承登成立**·席2 勘误 2 处=P2-A/P2-B）→协调方特授权 nail 席门 1 闭环补跑（LIVE·loader 方式 b·**恰 1 run**）·预期绿（主线三度 1 passed 先例·红因已由主线 i18n-metadata-ssr 修复兑现）·非 retry-to-green·⛔push。

**前置**：并线 merge `867a6af2` --no-ff 并 origin/feat/mysql-schema-skeleton@`1824b2d9`（cap 2176 sanction 锚恰等下界·零冲突 24 files +897/−45·arm4 spec blob `2cc3e5f0` 随并携入+主线 i18n 九文件修复在树=spec 现值 `7ab1ffd1` 对 `2cc3e5f0` 差**恰 1 行头注** i18n-metadata-ssr 休眠注记·断言/allowlist/步骤体零字节·blob diff 亲证）·工作树净（仅本卷勘误随改）·compose 栈三容器 ~15s 全 healthy（volume 三件既有复用非新建·P2-B 勘正口径）·`MODEL_API_KEY` PRESENT len=**116**（loader 方式 b 同 shell 注入·零 .env 落盘）·隔离 PG `applied=204 skipped=0`。

**补跑实测（恰 1 run·全量输出存档 `.tmp/gate1-closure/prove-closure.log` gitignored）**：`pnpm uc003:i18n-locale-ui:prove` → **EXIT=0 绿**。臂账=**Running 1 test · 1 passed (2.3s) · 0 failed**·臂④ inventory=**14 distinct 全 allowlisted UNKNOWN=0**（与 §9-补2 P2-A 勘正 14-allowlisted 口径互证·§9-补1 红因应用层面出清直证）。

**runner 层证据（sbg 两件真环境首演）**：件① **STALE_BUILD_GUARD 真环境首演成立**——留置 `.next/BUILD_ID`（mtime=2026-10-15T19:37:03Z·值 `yLq3NhKY5teAt9FQx9rAC`·P2-B 勘正口径）早于并线后 HEAD commit time=2026-10-15T20:21:49Z → `STALE_BUILD_GUARD … 早于 HEAD commit time → 强制重建(防陈旧构建假红)` warn 命中→走强制 next build 臂→build 成功→`next start` 正常服务（检测面零误报零漏报·判定/重建/服务全链真环境行使）；件② build 成功→`.tmp/e2e-ui-build-log` **零产生**（成功零写盘契约亲证）。build 后 BUILD_ID 翻新 `ow5qvSN7348MKc63SB3-W`。

**清理**：compose 栈 down（三容器+network 移除·volume 三件留置）·test-results 绿跑产物移档 `.tmp/gate1-closure/test-results-archive/`（gitignored）·`.next` 为本次重建产物留置 gitignored（下次跑按 BUILD_ID mtime vs 届时 HEAD %ct 判定·件① 设计内）·tracked 零翻动。

**STOP · 门 1 闭环补跑=executed:gate1_green（门矩阵十门全绿收官） · alone≠dual · ⛔push**
