# REQUEST — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-sole-stack-align.md` · slice `gap-sole-stack-align.slice.md`
**基线 tip**: `50423a6f`（full `50423a6fa6f18d4c9d193611cf84c4702e067208` · fetch 成功 · docs tip · not a prove tip）
**Worktree / branch**: `/Users/miaole/Desktop/golucky/meetwise-line-ss2` · `line/ss2-sole-stack`
**Date**: 2026-10-07

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| 公开 DELETE | **503**（stays） |

## 范围 / 背景

Line SS2 · docs-only REQUEST（§3 loop 第③步）· 兑现 N 线 `a778255` 遗留的「SOLE_STACK 对齐另包」。现状（基线 `50423a6f` 实读）：`scripts/run-e2e-isolated.mjs` 三常量 `SOLE_STACK='mysql-qdrant-redis'`（`:1845`）/ `LEGACY_STACK='pgvector-legacy'`（`:1846`）/ `SOLE_APPROVED_FIXTURE_CONFIG='compose.mysql-local'`（`:1848`）；R5-MARKED-RED 字符串（现 `:1936-1940`）已由 Line AL `c633584` 对齐为「dual-track code-path label ≠ product stack truth」，余留 = 文件头 `:5`「Intended sole default = mysql-qdrant-redis (MySQL+Qdrant+Redis)」注释 + 常量命名/值面（ADR `:39` 点名 residual）。**消费点结论（待审）**：`SOLE_STACK` 非 pure 文案——3 个 fail-closed 分支入口（`:1854` EXIT=2 · `:1881` G3 块 · `:2282` defense-in-depth，均 EXIT=3）+ env 注入分支（`:2202-2206`）+ receipt 字段（`:2243`）的判定/数据值；改值/改名波及 ≥5 个 prove 扫描器（g1 标识符正则、conn-stack r5-mark-red `:191` 值字面量、adapter proof `:131`、g3 spawn 值、package.json:283/285 alias）。**先在缺陷披露**：`conn-stack:r5-mark-red:prove:182` 门锚定 AL 前字面量 `NOT sole-stack truth`（已不存在），基线静态预计 EXIT=1——未运行（Ban prove），修复须显式授权。**行为语义裁决（`SOLE_STACK` 是否被 G3 fail-closed / fixture gate 消费、方案取舍）交双审。**

方案候选（细节与利弊见 harness §2）：**(a)** 纯文案对齐（仅 header 注释，零标识符/值/控制流触碰）；**(b)** 常量改名+全消费点同步（blast radius 大，需另立授权与回归计划）；**(c)** 诚实保留+仅 post-align 阶段 backlog 更新。提议默认 (a)，任一方案被双审砍掉即不做。

## prove 方案（执行阶段 · 本 stub 零运行）

`node --check scripts/run-e2e-isolated.mjs` EXIT=0 + 受影响 prove 回归复跑清单（g1-default-switch:prep / g3-e2e-pg-image 预期 EXIT=0 不变；conn-stack:mysql-stack `r5-mark-red` 双 alias 基线预期 EXIT=1 先在红——未授权修复则 documented-red 原样入账，授权修复则改后 EXIT=0 并记 diff 与授权出处；compose 依赖族与 qdrant adapter 双审未要求则 named-not-run）。EXIT 契约：任何基线绿→执行红 = STOP；attempts 全记录；Ban retry-to-green · Ban 洗白 · Ban 以 `node --check` 替代清单复跑；全刀零 e2e 运行、零新 receipt。

## 禁碰 / Ban（逐条）

1. **Ban coding**（本 REQUEST 零 scripts/ 触碰；授权后执行仅限双审放行方案范围）· **Ban prove**（零运行）· Ban push / force-push / self-approve / secrets / `.env*`。
2. **Ban 改 e2e 断言与其他 prove 面**（g1/g3/r5-mark-red/adapter prove 文件零触碰，除 §3 先在红显式授权修复）。
3. **Ban 触碰 `E2E_ISO_STACK_NOTE`（`:2312-2313`，Line N narration-only 产物）**。
4. **Ban SSOT edit**（matrix / backlog `:63` / execution-master-checklist 本 commit 零改动）。
5. **Ban 把对齐写成 sole cutover / MySQL 切流暗示**；Ban 改 `adr-postgres-retained.md` Decision 本体（L7-14 逐字不动）；Ban 碰 UC-018/052/25/004 行与 `coveredCount=8`。

本 stub 不是 nail、不是 HA、不是 covered、不是 cutover 授权。

## 流程

本 stub 为 pre-exec 审查入口：`mw-e2e-ha` PASS + `mw-privacy-int` PASS（**BOTH**，alone ≠ dual）→ 协调方（meetwise bot）显式授权 coding（点名方案取舍与先在红处置）→ 实现方按授权执行 → post-align docs supplement + post-align 双审另起。本 commit 本身不运行任何 e2e / prove。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual 审查段（append-only · mw-e2e-ha · evidence-honesty · 2026-10-07）

**审法**：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ss2-e2e-ha` · branch `rv/ss2-e2e-ha` @ 本地主线 tip `23b2ceb5` · 被审 REQUEST `d0754918`（`git merge-base --is-ancestor d0754918 feat/mysql-schema-skeleton` → 0 · 主线祖先亲证成立）。只认命令+EXIT+可复现证据；0 prove run · 0 coding · 0 SSOT · 全程静态 read-only（git/sed/grep，含零 `node --check`）。

### R1 机检检查表

| # | 项 | 命令/证据（本席亲算） | 结果 |
|---|----|----------------------|------|
| R1.1 | docs-only | `git diff-tree --name-status -r d0754918` = 恰 4 ai-docs **新增**（slice / harness / 双 stub）+311/−0；`…name-only | grep -v '^ai-docs/' | wc -l` = **0** | PASS |
| R1.2 | 孪生镜像 | `git show d0754918 \| git patch-id --stable` = `cda96d90b7bba11f…` ≡ `1688184c`（line/ss2-sole-stack）**全等**；兄弟 rebase 镜像、互不祖先 | PASS |
| R1.3 | 基线无漂移 | `git diff --stat 50423a6f 23b2ceb5 -- scripts/ packages/` **空** → 申报基线 `50423a6f` 的全部 file:line 在 tip 逐字有效（主线段 parent=`19df4e7f` 为 rebase 机械重亲，非漂移） | PASS |
| R1.4 | 消费点 14 处亲读 | `grep -n "SOLE_STACK" scripts/run-e2e-isolated.mjs` = 恰 14 行：`:1845`(def)·`:1854`·`:1857`·`:1881`·`:1889`·`:1899`·`:1907`·`:1925`·`:1936`·`:2202`·`:2205`·`:2243`·`:2282`·`:2284`，与 harness §1.2 表逐一对应 | PASS |
| R1.5 | 「3 个 fail-closed 分支入口」论断 | `:1854` 校验 → `process.exit(2)`@`:1859`；`:1881` G3 块（EXIT=3 @`:1895`/`:1903`/`:1922`，**fixture gate 本体 `:1897` `approvedFixture !== SOLE_APPROVED_FIXTURE_CONFIG` 亲读在块内**）；`:2282` defense-in-depth → `process.exit(3)`@`:2287` —— **论断亲证成立，非纯文案** | PASS |
| R1.6 | env 注入 / receipt | `:2202` 分支入口 + `:2205` `E2E_ISOLATION_STACK: SOLE_STACK` + `:2206` fixture env + `:2243` `stack: SOLE_STACK`（receipt class `local_untrusted_sole_stack_allowlist_receipt`）亲读 | PASS |
| R1.7 | R5-MARKED-RED 已 AL 对齐 | `:1936-1937` 现文 `dual-track code-path label ≠ product stack truth` + `NOT stack truth / NOT cutover evidence` 亲读 | PASS |
| R1.8 | header residual 在场 | `:5` `Intended sole default = mysql-qdrant-redis (MySQL+Qdrant+Redis)` 亲读在场；`grep -rn "Intended sole default" *.mjs/*.ts/*.json` 全仓代码文件**仅 `:5` 一处** → 无扫描器锚定该注释 → **(a) 零扫描命中** | PASS |
| R1.9 | 先在红静态复核 | `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:182` = `/R5-MARKED-RED/ && /NOT sole-stack truth/` else `fail()`；`:36` `fail → exitCode=1`；文件尾 `process.exit(exitCode)`；`grep -n "NOT sole-stack truth" scripts/run-e2e-isolated.mjs` → **EXIT=1 零匹配**；根 forwarder `scripts/mysql-stack.r5-mark-red.proof.mjs` = `import './conn-stack/…'` → **双 alias 基线预计 EXIT=1 亲证成立**（未运行，Ban prove） | PASS |
| R1.10 | blast radius「≥5」如实性 | g1 `scripts/g1-default-switch-prep.proof.mjs:101` 锚**名+值**（`/const SOLE_STACK\s*=\s*'mysql-qdrant-redis'/`）+ `:113` 禁 default-to-SOLE 正则；r5-mark-red `:191` 值字面量；adapter `packages/qdrant-store/test/qdrant-vectorstore-adapter.proof.ts:131` 值+名；g3 `:214-218` spawn env 值字面量；sole-wiring `:34` 自持 const；package.json **5 条** alias `:283-287`；uc018 `:110` env 名 → 「≥5」成立且仅为**下界**（实际 ≥6 个注册 prove 文件） | PASS |
| R1.11 | 零触碰面 | `E2E_ISO_STACK_NOTE` `:2312-2314` 在场、本 commit 构造性零 diff；backlog `gap-bug-backlog.md:63` 行原文亲读（GAP-E2E-ISO-BANNER-PG-RETAINED ·「SOLE_STACK 对齐另包」）stays OPEN；ADR `adr-postgres-retained.md:39` 亲读：点名 residual = header `:5` + `const SOLE_STACK`、「separate package」——**本刀授权链成立** | PASS |
| R1.12 | Pins 逐字 | slice `:4/:43` · harness `:4/:149-158` · 双 stub `:4/:11-22` 八项一致 = haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 | PASS |
| R1.13 | 流程卫生 | 双 stub Status=**PENDING** · alone ≠ dual · 不代签 peer · Ban self-approve；REQUEST「未运行」声明与零运行一致；本审零 prove | PASS |

### R2 候选裁决（行为面焦点 · 本席意见）

- **(a) 纯文案对齐 → 本席放行为执行默认**。R1.4-R1.8：`SOLE_STACK` 全部消费均为 fail-closed 判定值/分支入口/数据值——**改值即改 `:1854`/`:1881`/`:1897`/`:2202`/`:2282` 匹配语义 + 子进程 env + receipt 内容 = 行为变更**；而 ADR `:39` 点名的 residual 本体仅 header `:5-6` 注释，且无任何 prove 正则锚定该注释（R1.8）。(a) 零行为、零扫描命中、精确关闭 residual、与 Line AL 修法同构——**行为面唯一安全解**。
- **(b) 常量改名 → 本刀否决**。g1 `:101` 锚名+值双匹配（改名或改值任一即红，R1.10）；实际耦合 ≥6 个注册 prove 文件 + package.json 5 条 alias + uc018 env 名，且 §1.5 清单**不完整**（R4-N1）；在现清单上执行 (b) 必红。若双审+协调方仍判 (b) 必要，须**另立 REQUEST** 重derive 全量 blast 清单（含 N1/N2 补项）与 prove 回归计划。
- **(c) 诚实保留 → 仅作 post-align 阶段补充**。backlog=SSOT 本 commit Ban 碰（双方 stub 已写死）；(c) 单独成立则 ADR `:39` residual 不关闭。作为 (a) 完成后的 backlog 记录（须彼时独立授权）合理，本刀不做。
- fixture gate 依赖字面值已亲证（`:1897`→`:1903` EXIT=3），故「改文案不改分支语义」仅对 **header 注释**成立、对常量值不成立——(a) 的「零触碰常量值/标识符」边界为**硬约束**。

### R3 Fail-trigger audit（何者会使本席 FAIL —— 逐项零命中）

1. REQUEST 触 scripts/ / 产品码 / 迁移 / package.json → **0 字节**（R1.1）。
2. REQUEST 触 SSOT（backlog `:63` / matrix / checklist）→ **0**（R1.1/R1.11）。
3. 触 `E2E_ISO_STACK_NOTE` → **0**。
4. Pins 漂移 → **0**（R1.12）。
5. 把 `SOLE_STACK` 写成 pure 文案、或实现方预判行为语义代替双审 → **未发生**（harness §1.2 明示「披露非裁决」、§2 明示裁决权在双审）。
6. 先在红洗白 / 已修 / 已跑 → **未发生**（§3 明示未运行 + documented-red + 修复须双审+显式授权；R1.9 亲证红仍将在场）。
7. stub 自签 / dual 宣称 / 代签 peer → **未发生**（双 stub PENDING · alone ≠ dual）。
8. prove / e2e / `node --check` 运行 → REQUEST 与本审均**零运行**。

### R4 观察项（非阻断 · 如实登记随卷）

- **N1**：harness §1.5 清单漏 `scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs`（`:193` allowlist 扫描 · `:214` package.json alias 值扫描 · `:271` harness 双轨值扫描 = 第 6 个值耦合 prove）；「≥5」措辞仍诚实（下界），但 (b) 若启动必须补齐。
- **N2**：§1.5「package.json:283,285 → 两条 npm alias 失效」**少报**：实为 `:283-287` 5 条。
- **N3**：清单行级小漂（对 (a) 零影响；(b) 启动则须按 R1.4 口径重清单）：§1.2 表第 7 行 `:1911` 实为 `LEGACY_STACK` 文案行（SOLE 分支内）；§1.3 漏 `:1892`；§1.4 漏 `:2285`；`E2E_ISO_STACK_NOTE` 实跨 `:2312-2314`；g1 锚实跨 `:101-130`（引 `:107-125`）。
- **N4**：REQUEST 主线段 parent=`19df4e7f`（非申报 base `50423a6f`）——孪生 rebase 机械重亲；R1.3 亲证 `scripts/ packages/` 零漂移，申报基线行号在 tip 逐字有效，**非诚实性缺陷**。

### R5 Blockers

**无（0 Blocker）。**

### R6 Conditions（C-HA-1~7 · 随 PASS 携带 · 执行/prove/post-align 期全额绑定）

- **C-HA-1**：执行默认 = (a) 且仅限 `scripts/run-e2e-isolated.mjs:5-6` 文件头注释行级替换（`:1847` 注释微调仅当协调方授权点名）；零标识符 / 零常量值 / 零控制流 / 零 exit code / 零 env 名值 / 零 receipt schema 变化；执行 commit 的 diff 逐字等于被放行申报，`node --check` EXIT=0。
- **C-HA-2**：(b) 本刀否决；任何 (b) 复活须另立 REQUEST，其 blast 清单必须补 N1/N2（qdrant-backed 扫描器 + package.json `:283-287` 5 条 alias）并按 R1.4 全量重derive，禁止沿用 §1.5 现表。
- **C-HA-3**：先在红处置 = **先红后修协议**：`conn-stack:r5-mark-red:prove` / `mysql-stack:r5-mark-red:prove` 基线 EXIT=1（R1.9 亲证）按 documented-pre-existing-red 原样入 attempts 台账；修复（扫描正则改写 = prove 文件代码改动）须**双审 + 协调方显式授权**，授权后改后 EXIT=0 并记修复 diff 与授权出处；**Ban retry-to-green · Ban 洗白 · Ban 借本刀夹带修复 · Ban 以 `node --check` 替代 §4 清单复跑**；任何基线绿→执行红 = STOP 不得入账。
- **C-HA-4**：`E2E_ISO_STACK_NOTE`（`:2312-2314`）字节不变；ADR Decision L7-14 零 diff；backlog `:63` stays OPEN 至 post-align 授权阶段；`coveredCount=8` / UC-018/052/25/004 行零触碰；≠ sole cutover 措辞红线维持。
- **C-HA-5**：Pins 八项（R1.12 值）在执行与 post-align docs 全程逐字保持。
- **C-HA-6**：alone ≠ dual：本 PASS 单侧有效；dual 生效须 `mw-privacy-int` 独立 PASS + 协调方显式 coding 授权（授权须点名 (a)/(b)/(c) 取舍与 §3 先在红处置）；本审不代签 peer、不预签 post-align 双审。
- **C-HA-7**：N1-N4 观察项随卷；post-align 双审须机检 C-HA-1~5 逐条（含 §4 EXIT 契约逐条 attempts 记录、零新 receipt、零 e2e 运行）。

### 三行中文摘要

1. 本席于独立 worktree `rv/ss2-e2e-ha`（@ 主线 tip `23b2ceb5`）对 REQUEST `d0754918`（≡`1688184c` 孪生 patch-id `cda96d90`）完成 PRE-EXEC dual 审：恰 4 ai-docs +311/−0 零产品码零 SSOT，基线 `50423a6f`→tip scripts/packages 零漂移、行号引用逐字有效。
2. 消费点 14 处逐行亲读：「3 个 fail-closed 分支入口」论断成立（`:1854`→EXIT=2@`:1859` · `:1881` G3 块 EXIT=3@`:1895/:1903/:1922` · `:2282`→EXIT=3@`:2287`）+ env 注入 `:2202-2206` + receipt `:2243`；先在红 `r5-mark-red:182` 锚 AL 前字面量静态亲证预计 EXIT=1（未运行）；裁决 **(a) 放行为执行默认、(b) 本刀否决**（g1:101 锚名+值、实际 ≥6 prove 文件 + 5 条 alias、§1.5 漏 qdrant-backed）、(c) 仅 post-align 补充。
3. 0 Blocker；Conditions C-HA-1~7 随卷（先红后修 · Ban 洗白 · `E2E_ISO_STACK_NOTE`/backlog `:63`/Pins 原值 · alone ≠ dual 不代签 mw-privacy-int）；0 prove run · 0 coding · 0 SSOT · 禁 push。

Verdict: PASS
