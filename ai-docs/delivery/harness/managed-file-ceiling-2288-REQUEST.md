# MANAGED-FILE-CEILING-2288 受管文件上限步进记录（mini·快速链·沿 cap-sanction-2280 先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（码面已落·门按顺序亲跑·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` 未成独立提交·随「只 commit 一次」史录保留于 §8/卷尾注 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（本工作树亲算·53441bff 届时值·不抄旧行号）

- **基线**：`53441bffd71e964af5abe46a4b8bcd5efc5257fb`（短 `53441bff`·`git rev-parse HEAD` 开工前亲证恰等·`git status --porcelain` 为空）。分支 `line/managed-file-ceiling-draft`。工作树 `meetwise-cap2288`。上游未设。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `244d60c3`（全 `244d60c3dde2c81e3e3fcdb9e49525a53bccdd96`·`git rev-parse HEAD:scripts/ai-docs/public-text-policy.mjs` 亲证）：
  - `:110-:111` 注记栈现值 latest=`cap 2272→2280`（2026-10-19·新条目置顶形）；
  - `:122` `const MAX_FILES = 2_280;`（常量唯一定义点）；
  - `:334` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:391` `if (!Array.isArray(listed.paths) || listed.paths.length > MAX_FILES)` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `4b510dde`（全 `4b510dded7a5fe128085bf0c2a0c8bfb390873d9`·同命令亲证）·越限臂：
  - `:299-:301` CAP-SANCTION-2280 随刀注记三行（旧注记保留面）；
  - `:315` fabricated 环 `for (let i = 0; i < 2_280; i += 1)`；
  - `:322` `assert.equal(atCap.scannedFiles, 2_280)`（恰 cap 臂）；
  - `:323` 注记「第 2281 个注入路径触发早返回」；`:324` 注记「错误串恰为 `PTP_FILE_LIMIT:2281`」；
  - `:325` 越限注入路径 `'ai-docs/f-2280.md'`；
  - `:328` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2281\`])`。
- **计数锚**：开工前、本文件尚未存在时，`node scripts/ai-docs/check-docs.mjs` 亲跑 EXIT=0，输出 `public text policy scanned 2280 managed worktree files`（余量 0）。本文件是第 2281 个受管文件。

## §1-修法（两文件加本记录·沿 cap-sanction-2280 形制·旧注记零洗）

- **件①** 锚A `:122`：`const MAX_FILES = 2_280;` → `const MAX_FILES = 2_288;`（置顶两行后届时行 `:124`）。两消费臂仍引用常量：届时 `:336` `paths.length > MAX_FILES`、`:393` `listed.paths.length > MAX_FILES`。不改成数字字面量。
- **件②** 锚A `:110` 前插注记两行（新条目置顶·`:112-:113` 的 `cap 2272→2280` 两行原样保留）：
  - `// cap 2280→2288（2026-10-19 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280 十先例形·快速链·授权随令）：`
  - `// 主线已扫 2280 余量 0·本卷使扫描变成 2281（2280+1=2281>2280·先手步进·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件③** 锚B 越限臂六处从 2280/2281 改到 2288/2289，并在 `:299` 前新增置顶注记三行（`:302-:304` 的 CAP-SANCTION-2280 三行原样保留）：
  - `:318` `i < 2_280` → `i < 2_288`；
  - `:325` `scannedFiles, 2_280` → `scannedFiles, 2_288`；
  - `:326` 「第 2281 个」→「第 2289 个」；`:327` `PTP_FILE_LIMIT:2281` → `PTP_FILE_LIMIT:2289`；
  - `:328` `'ai-docs/f-2280.md'` → `'ai-docs/f-2288.md'`；
  - `:331` `deepEqual ... :2281` → `:2289`。
- **语义申明**：只加 8（2280→2288）。计数预算，不改门语义。零产品码、零迁移、零锁文件。恰好达到上限仍然通过，多一个文件仍被拒绝。

## §1.3 否决

1. **+16 或更大步进（含一步加到 2280 以上超过 8）**：派定值只加 8。再加即停。否决。
2. **取消上限（删 cap，或把 `MAX_FILES` 改成无界）**：恰达上限臂与越限错误码形状两臂会失去语义。否决。
3. **不改证明（越限臂留在 2_280/2281）**：恰达上限臂会把 2288 判失败，越限值仍写成 2281。否决。
4. **洗旧注记（改写或删掉既有 2272→2280 及更早注记）**：历史注记只追加、置顶，不改旧行。否决。

## §2 门（按顺序亲跑·退出码写入 gate-ceiling-*.exit·原值只记入 §9）

1. `node scripts/ai-docs/public-text-policy.proof.mjs` 必须 `static_preflight_valid: selected=12/12` 且 EXIT=0。
2. `node scripts/ai-docs/check-docs.mjs` 必须 EXIT=0，且扫描数 ≤2288。预期 2281（基线 2280 加本记录 1）。大于 2288 则停手不提交。
3. `pnpm turbo typecheck --force` 必须 8/8 且 Cached 0。
4. `pnpm turbo lint` 必须 0 errors。警告上限不放宽：root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601。
5. 自审：两个 script 的活代码与断言不得再把 2280 当作当前上限，也不得把 2281 当作越限值。历史注记里的 2280/2281 可以留。
6. `git diff --name-only` 相对 HEAD 恰这 3 个文件：`scripts/ai-docs/public-text-policy.mjs`、`scripts/ai-docs/public-text-policy.proof.mjs`、`ai-docs/delivery/harness/managed-file-ceiling-2288-REQUEST.md`。

**停止条件**：证明非 12/12 或 EXIT≠0；文档扫描大于 2288；类型检查非 8/8 或出现缓存命中；lint 出现 error；自审发现活代码仍把 2280 当当前上限或把 2281 当越限值；diff 不是这 3 个文件。

## §8 STOP

- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头、本节、卷尾注）。前值 `draft:awaiting_pre_exec_dual` 只作史录，未另成提交。post-prove 双审两独立外席待派。alone≠dual。Ban self-approve。终态翻面不在本记录内宣称完成。
- 卫生：est live=0。⛔push。⛔merge 主线。⛔force。⛔pull --rebase。不改产品代码、迁移、锁文件。

## §9 实测记录（2026-10-19·退出码取自 gate-ceiling-*.exit·不预写）

1. **证明**：`node scripts/ai-docs/public-text-policy.proof.mjs` 输出 12 行 `✓`（TC-quality-04-main 与 E1..E11）并以 `static_preflight_valid: selected=12/12; releaseEvidence=false` 结束。`gate-ceiling-proof.exit` = **0**。stderr 空。
2. **文档扫描（本记录已在树中、本节回填前）**：`node scripts/ai-docs/check-docs.mjs` 输出 `ai-docs check passed: 80 required files verified; public text policy scanned 2281 managed worktree files`。`gate-ceiling-docs.exit` = **0**。2281≤2288。开工前同命令（本记录尚不存在）`gate-ceiling-docs-baseline.exit` = **0**，扫描 **2280**。本节回填后复跑 `gate-ceiling-docs-post.exit` = **0**，扫描仍是 **2281**。
3. **类型检查**：`pnpm turbo typecheck --force` 输出 `Tasks: 8 successful, 8 total`、`Cached: 0 cached, 8 total`、`Time: 9.299s`。八个任务均为 `cache bypass, force executing`。`gate-ceiling-typecheck.exit` = **0**。
4. **lint**：`pnpm turbo lint` 输出 `Tasks: 12 successful, 12 total`、`Cached: 11 cached, 12 total`、`Time: 6.718s`。根任务 `//:lint` 为 cache miss，其余 11 个为 cache hit。`gate-ceiling-lint.exit` = **0**。问题汇总均为 0 errors：root `5242 problems (0 errors, 5242 warnings)`、api `1423 problems (0 errors, 1423 warnings)`、domain `115 problems (0 errors, 115 warnings)`、ai-runtime `628 problems (0 errors, 628 warnings)`、worker `959 problems (0 errors, 959 warnings)`、db `1042 problems (0 errors, 1042 warnings)`、web `601 problems (0 errors, 601 warnings)`。警告上限未改。
5. **自审**：`git grep -n -E '2_280|2_281|2280|2281'` 只命中注记。`2_280` 与 `2_281` 零命中。2280/2281 命中行：policy `:110` `:111`（本记录置顶注记，说明 2280→2288，以及扫描从 2280 变成 2281）与 `:112`（保留的 2272→2280 注记）；proof `:299` `:300`（置顶注记）与 `:302`（保留的 CAP-SANCTION-2280 注记）。活代码与断言是 `MAX_FILES = 2_288`、`i < 2_288`、`scannedFiles, 2_288`、`ai-docs/f-2288.md`、`PTP_FILE_LIMIT:2289`。两处长度比较仍是 `paths.length > MAX_FILES` 与 `listed.paths.length > MAX_FILES`。
6. **改动面**：三路径入索引后 `git diff --name-only HEAD` 恰为 `ai-docs/delivery/harness/managed-file-ceiling-2288-REQUEST.md`、`scripts/ai-docs/public-text-policy.mjs`、`scripts/ai-docs/public-text-policy.proof.mjs`。`gate-ceiling-diff-head.exit` = **0**。无第四路径。
7. **STOP**：Status 头、§8、卷尾三处同值 **`executed:awaiting_post_prove_dual`**。未 push。

---

*MANAGED-FILE-CEILING-2288 记录 · 2026-10-19 · **`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual` 史录·未另成提交）· base `53441bffd71e964af5abe46a4b8bcd5efc5257fb` · 分支 `line/managed-file-ceiling-draft` · 工作树 `meetwise-cap2288` · 修法=MAX_FILES 2_280→2_288 + 置顶注记两行（主线已扫 2280、本记录使扫描变成 2281）+ 证明越限臂六处 2288/2289 · 旧注记不洗 · 证明 12/12 EXIT=0 · 文档扫描 2281 EXIT=0 · 类型检查 8/8 Cached 0 EXIT=0 · lint 12/12 全 0 errors EXIT=0 · ⛔push ⛔merge 主线*
