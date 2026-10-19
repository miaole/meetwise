# MANAGED-FILE-CEILING-2320 受管文件上限步进记录（mini·快速链·沿 managed-file-ceiling-2312 先例形）

**Status**: **`executed:awaiting_post_prove_dual`**（码面已落·门按顺序亲跑·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` 未成独立提交·随「只 commit 一次」史录保留于 §8/文末 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）

## §0 锚（本工作树亲算·8ece8ea0 届时值·不抄旧行号）

- **基线**：`8ece8ea08982d9f3de8b4634b88b4c1900860f14`（短 `8ece8ea0`·`git rev-parse HEAD` 开工前亲证恰等·`git status --porcelain` 为空）。分支 `line/managed-ceiling-2320-draft`。工作树 `meetwise-cap20`。`git rev-parse --abbrev-ref --symbolic-full-name '@{upstream}'` 亲证上游为 `origin/feat/mysql-schema-skeleton`（退出 0）。本记录不拉取、不推送。
- **锚A** `scripts/ai-docs/public-text-policy.mjs` blob `7639e5da`（全 `7639e5dae237ca6467a77d25f4c2644591c57bdf`·`git rev-parse HEAD:scripts/ai-docs/public-text-policy.mjs` 亲证）：
  - `:110-:111` 注记栈现值 latest=`cap 2304→2312`（2026-10-20·新条目置顶形）。旧句不洗：
    - `// cap 2304→2312（2026-10-20 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304 十三先例形·快速链·授权随令）：`
    - `// 主线这棵树开工前已扫 2303 余量 1·加上本记录后扫描变成 2304（2303+1=2304≤2304·步进只许 +8·先加 8 而不是改成恰好余量或取消上限·恰达上限仍通过·多一个仍拒绝·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
  - `:130` `const MAX_FILES = 2_312;`（常量唯一定义点）；
  - `:342` `if (paths.length > MAX_FILES)` 早返回臂 → 错误串 `PTP_FILE_LIMIT:${paths.length}`（常量引用·字面量零现）；
  - `:399` `if (!Array.isArray(listed.paths) || listed.paths.length > MAX_FILES)` 臂同上（零字面量）。
- **锚B** `scripts/ai-docs/public-text-policy.proof.mjs` blob `3b22e15d`（全 `3b22e15df3f19dad5d13fc21a1da5942295d5535`·同命令亲证）·越限臂：
  - `:299` MANAGED-FILE-CEILING-2312 随刀注记一行（旧注记保留面）。旧句不洗：
    - `// MANAGED-FILE-CEILING-2312 随刀：cap 2304→2312（2026-10-20·+8·开工前已扫 2303 余量 1·加上本记录后扫描变成 2304·步进只许 +8·恰达上限仍通过·多一个仍拒绝）——本臂 fabricated 数随 cap 再联动同步（这次数字跟着上限走·语义不变·强度不减）。`
  - `:323` fabricated 环 `for (let i = 0; i < 2_312; i += 1)`；
  - `:330` `assert.equal(atCap.scannedFiles, 2_312)`（恰 cap 臂）；
  - `:331` 注记「第 2313 个注入路径触发早返回」；`:332` 注记「错误串恰为 `PTP_FILE_LIMIT:2313`」；
  - `:333` 越限注入路径 `'ai-docs/f-2312.md'`；
  - `:336` `assert.deepEqual(overCap.errors, [\`${PUBLIC_TEXT_POLICY_CODES.FILE_LIMIT}:2313\`])`。
- **计数锚**：开工前、本文件尚未存在时，`node scripts/ai-docs/check-docs.mjs` 亲跑 EXIT=0，输出 `public text policy scanned 2310 managed worktree files`（上限 2312·余量 2）。本文件使扫描变成 2311。日志 `.cap2320-baseline.log`。
- 旧卷状态句不洗（`managed-file-ceiling-2312-REQUEST.md` 头行原句）：`**Status**: **`executed:awaiting_post_prove_dual`**（码面已落·门按顺序亲跑·post-prove 双审两独立外席待派·alone≠dual·Ban self-approve · 前值 `draft:awaiting_pre_exec_dual` 未成独立提交·随「只 commit 一次」史录保留于 §8/文末 · est live=0 · ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase）`。

## §1-修法（两文件加本记录·沿 managed-file-ceiling-2312 形制·旧注记零洗）

- **件①** 锚A `:130`：`const MAX_FILES = 2_312;` → `const MAX_FILES = 2_320;`（置顶两行后届时行 `:132`）。两消费臂仍引用常量：届时 `:344` `paths.length > MAX_FILES`、`:401` `listed.paths.length > MAX_FILES`。不改成数字字面量。`MAX_FILE_BYTES` 不改。
- **件②** 锚A `:110` 前插注记两行（新条目置顶·`:112-:113` 的 `cap 2304→2312` 两行原样保留）：
  - `// cap 2312→2320（2026-10-20 协调方 sanction·+8 沿 2208/2216/2224/2232/2240/2248/2256/2264/2272/2280/2288/2296/2304/2312 十四先例形·快速链·授权随令）：`
  - `// 主线这棵树开工前已扫 2310 余量 2·加上本记录后扫描变成 2311（2310+1=2311≤2312·步进只许 +8·先加 8 而不是改成恰好余量或取消上限·恰达上限仍通过·多一个仍拒绝·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减）。`
- **件③** 锚B 越限臂从 2312/2313 改到 2320/2321，并在 `:299` 前新增置顶注记一行（`:300` 的 MANAGED-FILE-CEILING-2312 一行原样保留）。这行说明这次数字跟着上限走：
  - `:299` `// MANAGED-FILE-CEILING-2320 随刀：cap 2312→2320（2026-10-20·+8·开工前已扫 2310 余量 2·加上本记录后扫描变成 2311·步进只许 +8·恰达上限仍通过·多一个仍拒绝）——本臂 fabricated 数随 cap 再联动同步（这次数字跟着上限走·语义不变·强度不减）。`
  - `:324` `i < 2_312` → `i < 2_320`；
  - `:331` `scannedFiles, 2_312` → `scannedFiles, 2_320`；
  - `:332` 「第 2313 个」→「第 2321 个」；`:333` `PTP_FILE_LIMIT:2313` → `PTP_FILE_LIMIT:2321`；
  - `:334` `'ai-docs/f-2312.md'` → `'ai-docs/f-2320.md'`；
  - `:337` `deepEqual ... :2313` → `:2321`。deepEqual 必须是 2321，不能停在 2313。
- **语义申明**：只加 8（2312→2320）。计数预算，不改门语义。零产品码、零迁移、零锁文件。恰好达到上限仍然通过，多一个文件仍被拒绝。开工前扫描 2310，加上本记录后为 2311，仍不超过旧上限；先加 8 是因为步进单位只许 +8，不许改成恰好余量，也不许取消上限。旧卷同段原句保留不洗：「只加 8（2304→2312）。计数预算，不改门语义。零产品码、零迁移、零锁文件。恰好达到上限仍然通过，多一个文件仍被拒绝。开工前扫描 2303，加上本记录后为 2304，仍不超过旧上限；先加 8 是因为步进单位只许 +8，不许改成恰好余量，也不许取消上限。」

## §1.3 否决

1. **+16 或更大步进（含一步加到 2312 以上超过 8）**：派定值只加 8。再加即停。否决。
2. **取消上限（删 cap，或把 `MAX_FILES` 改成无界）**：恰达上限臂与越限错误码形状两臂会失去语义。否决。
3. **不改证明（越限臂留在 2_312/2313）**：上限已是 2320 时，2313 个路径仍不超过上限，越限臂会从拒绝变成通过，deepEqual 仍停在 2313。否决。
4. **洗旧注记（改写或删掉既有 2304→2312 及更早注记）**：历史注记只追加、置顶，不改旧行。否决。
5. **把上限改成 2320 以外的数**：步进只许 +8。否决。

## §2 门（按顺序亲跑·日志写入 cap2320-*.log·原值只记入 §9·不预写）

1. `node scripts/ai-docs/public-text-policy.proof.mjs` 必须 `static_preflight_valid: selected=12/12` 且 EXIT=0。日志 `cap2320-proof.log`。
2. `node scripts/ai-docs/check-docs.mjs` 必须 EXIT=0，扫描数必须等于基线 2310+1，并且仍然 ≤2312，同时 ≤2320。预期 2311。大于 2312 则停手不提交。日志 `cap2320-docs.log`。
3. 自审：两个 script 的活代码与断言不得再把 2312 当作当前上限，也不得把 2313 当作越限值。历史注记里的 2312 与 2313 可以留。deepEqual 必须是 `FILE_LIMIT:2321`。
4. `git diff --name-only` 相对 HEAD 恰这 3 个文件：`scripts/ai-docs/public-text-policy.mjs`、`scripts/ai-docs/public-text-policy.proof.mjs`、`ai-docs/delivery/harness/managed-file-ceiling-2320-REQUEST.md`。

旧卷 §2 第 3、4 条原句不洗，本步不执行、不记入 §9：`pnpm turbo typecheck --force` 必须 8 successful / 8 total，且 Cached 0。只在本工作树跑。日志 `gate-ceiling2304-typecheck.log`。`pnpm turbo lint` 必须 0 errors。警告数必须仍是 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601。不放宽，不改 lint 配置。日志 `gate-ceiling2304-lint.log`。

**停止条件**：证明非 12/12 或 EXIT≠0；文档扫描不等于基线+1，或大于 2312；自审发现活代码仍把 2312 当当前上限或把 2313 当越限值，或 deepEqual 仍是 2313；diff 不是这 3 个文件。

## §8 STOP

- **STOP = `executed:awaiting_post_prove_dual` 三处同值**（Status 头、本节、文末）。前值 `draft:awaiting_pre_exec_dual` 只作史录，未另成提交。post-prove 双审两独立外席待派。alone≠dual。Ban self-approve。终态翻面不在本记录内宣称完成。
- 卫生：est live=0。⛔push。⛔merge 主线。⛔force。⛔pull --rebase。不改产品代码、迁移、锁文件。

## §9 实测记录（2026-10-20·退出码取自 cap2320-*.log·不预写）

1. **证明**：`node scripts/ai-docs/public-text-policy.proof.mjs` 输出 12 行 `✓`（TC-quality-04-main 与 E1..E11）并以 `static_preflight_valid: selected=12/12; releaseEvidence=false` 结束。`cap2320-proof.log` 的 EXIT= **0**。日志无错误文本。证明文件在本节回填时未再改，该日志仍对应当前证明。
2. **文档扫描（本记录已在树中、本节数字回填前）**：`node scripts/ai-docs/check-docs.mjs` 输出 `ai-docs check passed: 80 required files verified; public text policy scanned 2311 managed worktree files`。当时 `cap2320-docs.log` 的 EXIT= **0**。2311 = 基线 2310+1，且 2311≤2312，亦 ≤2320。开工前同命令（本记录尚不存在）`.cap2320-baseline.log` 的 EXIT= **0**，扫描 **2310**。本节数字回填后复跑覆盖 `cap2320-docs.log`，EXIT= **0**，扫描仍是 **2311**。
3. **自审**：两个 script 中 `2_312` 与 `2313` 零命中。`2312` 只出现在注记：policy `:110` `:111`（本记录置顶注记，说明 2312→2320，以及开工前扫描 2310、加上本记录后 2311，2311≤2312 所以先加 8 不是因为已经越限）与 `:112`（保留的 2304→2312 注记）；proof `:299`（置顶注记，说明这次是 2312→2320，这次数字跟着上限走）与 `:300`（保留的 MANAGED-FILE-CEILING-2312 注记）。活代码与断言是 `MAX_FILES = 2_320`、`i < 2_320`、`scannedFiles, 2_320`、`ai-docs/f-2320.md`、`PTP_FILE_LIMIT:2321`。两处长度比较仍是 `paths.length > MAX_FILES`（`:344`）与 `listed.paths.length > MAX_FILES`（`:401`）。deepEqual 是 `FILE_LIMIT:2321`。
4. **改动面**：回填前 `git status --porcelain` 为 `M scripts/ai-docs/public-text-policy.mjs`、`M scripts/ai-docs/public-text-policy.proof.mjs`、`?? ai-docs/delivery/harness/managed-file-ceiling-2320-REQUEST.md`。未跟踪日志 `.cap2320-baseline.log`、`cap2320-proof.log`、`cap2320-docs.log` 不纳入提交。纳入这 3 个路径后 `git diff --name-only HEAD` 恰为这 3 个文件，无第四路径。
5. **STOP**：Status 头、§8、文末三处同值 **`executed:awaiting_post_prove_dual`**。前值 `draft:awaiting_pre_exec_dual` 未另成提交。未 push。本步未跑 pnpm turbo，也未跑隔离库证明。

---

*MANAGED-FILE-CEILING-2320 记录 · 2026-10-20 · **`executed:awaiting_post_prove_dual`**（前值 `draft:awaiting_pre_exec_dual` 史录·未另成提交）· base `8ece8ea08982d9f3de8b4634b88b4c1900860f14` · 分支 `line/managed-ceiling-2320-draft` · 工作树 `meetwise-cap20` · 修法=MAX_FILES 2_312→2_320 + 置顶注记两行（开工前已扫 2310、本记录使扫描变成 2311）+ 证明越限臂 2320/2321 · 旧注记不洗 · 证明 12/12 EXIT=0 · 文档扫描 2311 EXIT=0 · ⛔push ⛔merge 主线*
