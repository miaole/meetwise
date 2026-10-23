# MANAGED-FILE-CEILING-2296 受管文件上限步进记录（mini·快速链·沿 managed-file-ceiling-2288 先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（码面已落·门按顺序亲跑·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` 未成独立提交·随「只 commit 一次」史录保留于 §8/文末 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（本工作树亲算·1a3fb08b 届时值·不抄旧行号）

- **基线**：`1a3fb08b4676cdea22698be56169c193ecb76eb1`（短 `1a3fb08b`·`git rev-parse HEAD` 开工前亲证恰等·`git status --porcelain` 为空）。分支 `line/managed-file-ceiling-2296-draft`。工作树 `meetwise-cap96`。`git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'` 亲证上游为 `origin/feat/mysql-schema-skeleton`（本记录不拉取、不推送）。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `cd9b4c96`（全 `cd9b4c96b64085582845ea98eff0a629c264485a`·`git rev-parse HEAD:scripts/ai-docs/public-text-policy.mjs` 亲证）：
  - `:110-:111` 注记栈现值 latest=`cap 2280→2288`（2026-10-19·新条目置顶形）；
  - `:124` `const MAX_FILES = 2_288;`（常量唯一定义点）；
  - `:336` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:393` `if (!Array.isArray(listed.paths) || listed.paths.length > MAX_FILES)` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `4e821974`（全 `4e8219746e25a358ec62ea6cd1e8dbf73045e974`·同命令亲证）·越限臂：
  - `:299-:301` MANAGED-FILE-CEILING-2288 随刀注记三行（旧注记保留面）；
  - `:318` fabricated 环 `for (let i = 0; i < 2_288; i += 1)`；
  - `:325` `assert.equal(atCap.scannedFiles, 2_288)`（恰 cap 臂）；
  - `:326` 注记「第 2289 个注入路径触发早返回」；`:327` 注记「错误串恰为 `PTP_FILE_LIMIT:2289`」；
  - `:328` 越限注入路径 `'ai-docs/f-2288.md'`；
  - `:331` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2289\`])`。
- **计数锚**：开工前、本文件尚未存在时，`node scripts/ai-docs/check-docs.mjs` 亲跑 EXIT=0，输出 `public text policy scanned 2285 managed worktree files`（上限 2288·余量 3）。本文件使扫描变成 2286。

## §1-修法（两文件加本记录·沿 managed-file-ceiling-2288 形制·旧注记零洗）

- **件①** 锚A `:124`：`const MAX_FILES = 2_288;` → `const MAX_FILES = 2_296;`（置顶两行后届时行 `:126`）。两消费臂仍引用常量：届时 `:338` `paths.length > MAX_FILES`、`:395` `listed.paths.length > MAX_FILES`。不改成数字字面量。
- **件②** 锚A `:110` 前插注记两行（新条目置顶·`:112-:113` 的 `cap 2280→2288` 两行原样保留）：
  - `// cap 2288→2296（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288 十一先例形·快速链·授权随令）：`
  - `// 主线这棵树开工前已扫 2285 余量 3·加上本记录后扫描变成 2286（2285+1=2286≤2288·步进只许 +8·先加 8 而不是改成恰好余量或取消上限·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件③** 锚B 越限臂从 2288/2289 改到 2296/2297，并在 `:299` 前新增置顶注记三行（`:302-:304` 的 MANAGED-FILE-CEILING-2288 三行原样保留）：
  - `:321` `i < 2_288` → `i < 2_296`；
  - `:328` `scannedFiles, 2_288` → `scannedFiles, 2_296`；
  - `:329` 「第 2289 个」→「第 2297 个」；`:330` `PTP_FILE_LIMIT:2289` → `PTP_FILE_LIMIT:2297`；
  - `:331` `'ai-docs/f-2288.md'` → `'ai-docs/f-2296.md'`；
  - `:334` `deepEqual ... :2289` → `:2297`。
- **语义申明**：只加 8（2288→2296）。计数预算，不改门语义。零产品码、零迁移、零锁文件。恰好达到上限仍然通过，多一个文件仍被拒绝。开工前扫描 2285，加上本记录后为 2286，仍不超过旧上限；先加 8 是因为步进单位只许 +8，不许改成恰好余量，也不许取消上限。

## §1.3 否决

1. **+16 或更大步进（含一步加到 2288 以上超过 8）**：派定值只加 8。再加即停。否决。
2. **取消上限（删 cap，或把 `MAX_FILES` 改成无界）**：恰达上限臂与越限错误码形状两臂会失去语义。否决。
3. **不改证明（越限臂留在 2_288/2289）**：恰达上限臂会把 2296 判失败，越限值仍写成 2289。否决。
4. **洗旧注记（改写或删掉既有 2280→2288 及更早注记）**：历史注记只追加、置顶，不改旧行。否决。

## §2 门（按顺序亲跑·日志写入 gate-ceiling2296-*.log·原值只记入 §9·不预写）

1. `node scripts/ai-docs/public-text-policy.proof.mjs` 必须 `static_preflight_valid: selected=12/12` 且 EXIT=0。日志 `gate-ceiling2296-proof.log`。
2. `node scripts/ai-docs/check-docs.mjs` 必须 EXIT=0，扫描数必须等于基线 2285+1，并且 ≤2296。预期 2286。大于 2296 则停手不提交。日志 `gate-ceiling2296-docs.log`。
3. `pnpm turbo typecheck --force` 必须 8 successful / 8 total，且 Cached 0。只在本工作树跑。日志 `gate-ceiling2296-typecheck.log`。
4. `pnpm turbo lint` 必须 0 errors。警告数必须仍是 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601。不放宽，不改 lint 配置。日志 `gate-ceiling2296-lint.log`。
5. 自审：两个 script 的活代码与断言不得再把 2288 当作当前上限，也不得把 2289 当作越限值。历史注记里的 2288/2289 可以留。
6. `git diff --name-only` 相对 HEAD 恰这 3 个文件：`scripts/ai-docs/public-text-policy.mjs`、`scripts/ai-docs/public-text-policy.proof.mjs`、`ai-docs/delivery/harness/managed-file-ceiling-2296-REQUEST.md`。

**停止条件**：证明非 12/12 或 EXIT≠0；文档扫描不等于基线+1，或大于 2296；类型检查非 8/8 或出现缓存命中；lint 出现 error，或警告数偏离上列；自审发现活代码仍把 2288 当当前上限或把 2289 当越限值；diff 不是这 3 个文件。

## §8 STOP

- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头、本节、文末）。前值 `draft:awaiting_pre_exec_dual` 只作史录，未另成提交。post-prove 双审两独立外席待派。alone≠dual。Ban self-approve。终态翻面不在本记录内宣称完成。
- 卫生：est live=0。⛔push。⛔merge 主线。⛔force。⛔pull --rebase。不改产品代码、迁移、锁文件。

## §9 实测记录（2026-10-19·退出码取自 gate-ceiling2296-*.log·不预写）

1. **证明**：`node scripts/ai-docs/public-text-policy.proof.mjs` 输出 12 行 `✓`（TC-quality-04-main 与 E1..E11）并以 `static_preflight_valid: selected=12/12; releaseEvidence=false` 结束。`gate-ceiling2296-proof.log` 的 EXIT= **0**。日志无错误文本。
2. **文档扫描（本记录已在树中、本节数字回填前）**：`node scripts/ai-docs/check-docs.mjs` 输出 `ai-docs check passed: 80 required files verified; public text policy scanned 2286 managed worktree files`。`gate-ceiling2296-docs.log` 的 EXIT= **0**。2286 = 基线 2285+1，且 2286≤2296。开工前同命令（本记录尚不存在）`gate-ceiling2296-docs-baseline.log` 的 EXIT= **0**，扫描 **2285**。本节数字回填后复跑 `gate-ceiling2296-docs-post.log` 的 EXIT= **0**，扫描仍是 **2286**。
3. **类型检查**：`pnpm turbo typecheck --force` 输出 `Tasks: 8 successful, 8 total`、`Cached: 0 cached, 8 total`、`Time: 7.968s`。八个任务均为 `cache bypass, force executing`。`gate-ceiling2296-typecheck.log` 的 EXIT= **0**。范围行写了 13 个包，任务汇总是 8/8。
4. **lint**：`pnpm turbo lint` 输出 `Tasks: 12 successful, 12 total`、`Cached: 11 cached, 12 total`、`Time: 6.607s`。根任务 `//:lint` 为 cache miss，其余 11 个为 cache hit。`gate-ceiling2296-lint.log` 的 EXIT= **0**。问题汇总均为 0 errors：root `5242 problems (0 errors, 5242 warnings)`、api `1423 problems (0 errors, 1423 warnings)`、domain `115 problems (0 errors, 115 warnings)`、ai-runtime `628 problems (0 errors, 628 warnings)`、worker `959 problems (0 errors, 959 warnings)`、db `1042 problems (0 errors, 1042 warnings)`、web `601 problems (0 errors, 601 warnings)`。警告数未改。
5. **自审**：两个 script 中 `2_288` 与 `2_289` 零命中，`2289` 零命中。`2288` 只出现在注记：policy `:110` `:111`（本记录置顶注记，说明 2288→2296，以及开工前扫描 2285、加上本记录后 2286，2286≤2288 所以先加 8 不是因为已经越限）与 `:112`（保留的 2280→2288 注记）；proof `:299`（置顶注记，说明这次是 2288→2296）与 `:302`（保留的 MANAGED-FILE-CEILING-2288 注记）。活代码与断言是 `MAX_FILES = 2_296`、`i < 2_296`、`scannedFiles, 2_296`、`ai-docs/f-2296.md`、`PTP_FILE_LIMIT:2297`。两处长度比较仍是 `paths.length > MAX_FILES`（`:338`）与 `listed.paths.length > MAX_FILES`（`:395`）。
6. **改动面**：回填前 `git status --porcelain` 为 `M scripts/ai-docs/public-text-policy.mjs`、`M scripts/ai-docs/public-text-policy.proof.mjs`、`?? ai-docs/delivery/harness/managed-file-ceiling-2296-REQUEST.md`。无第四路径。
7. **STOP**：Status 头、§8、文末三处同值 **`executed:awaiting_post_prove_dual`**。前值 `draft:awaiting_pre_exec_dual` 未另成提交。未 push。

---

*MANAGED-FILE-CEILING-2296 记录 · 2026-10-19 · **`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual` 史录·未另成提交）· base `1a3fb08b4676cdea22698be56169c193ecb76eb1` · 分支 `line/managed-file-ceiling-2296-draft` · 工作树 `meetwise-cap96` · 修法=MAX_FILES 2_288→2_296 + 置顶注记两行（开工前已扫 2285、本记录使扫描变成 2286）+ 证明越限臂 2296/2297 · 旧注记不洗 · 证明 12/12 EXIT=0 · 文档扫描 2286 EXIT=0 · 类型检查 8/8 Cached 0 EXIT=0 · lint 12/12 全 0 errors EXIT=0 · ⛔push ⛔merge 主线*
