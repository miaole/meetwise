# REQUEST — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Expert**: `mw-privacy-int`（PG-retained 属隐私/栈域故入双审 · privacy/INT 前置焦点：栈真相对齐 ≠ 擦除/RLS/DELETE 面任何松动）
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

## 范围 / 背景（privacy/INT 视角）

Line SS2 · docs-only REQUEST（§3 loop 第③步）· 兑现 N 线 `a778255` 遗留「SOLE_STACK 对齐另包」，目标面 = `scripts/run-e2e-isolated.mjs` 三常量（`SOLE_STACK='mysql-qdrant-redis'` `:1845` / `LEGACY_STACK='pgvector-legacy'` `:1846` / `SOLE_APPROVED_FIXTURE_CONFIG='compose.mysql-local'` `:1848`）与 R5-MARKED-RED 字符串对齐 `adr-postgres-retained.md`（keep Postgres / `PostgresSaver` / pgvector · L9-11 · Non-claims L39 点名 residual = header `:5` + `const SOLE_STACK`）。banner 字符串本体已由 Line AL `c633584` 对齐；本刀不重开 AL 已 closed 的措辞面。

**privacy 域消费点披露（待审）**：`SOLE_STACK` 是 3 个 fail-closed 分支入口（`:1854` 未知栈 EXIT=2 · `:1881` G3 块入口 · `:2282` defense-in-depth 拒 docker-run PG image，后两者 EXIT=3）+ sole env 注入分支（`:2202-2220`：注入 MySQL/Redis/Qdrant 端点、**删除 `PG*` 全系与 `E2E_PG_IMAGE`**）+ allowlist receipt 字段（`:2243`，receipt 自带 `releaseEvidence:false` · `notHa:true` · `claimsForbidden[9]`）的判定/数据值——**G3 fail-closed 与 fixture gate 确实消费该常量**；改值即改 fail-closed 匹配语义与 receipt 内容，改名牌波及 ≥5 个 prove 扫描器（细节 harness §1.5）。

**privacy 红线确认（本刀不改、请审方复核）**：公开 `DELETE /privacy/interview-data/:id` = **503** 冻结不变；PG-retained / RLS / `asPrincipal`+`set_config` 授权根不变；UC-052 external=`retention_pending`、`:60`/`:64` stays OPEN、UC-052 stays partial 不变；本刀对齐**不构成**任何擦除、RLS、公开写面、栈切流的证据或授权；`coveredCount=8` 不变、不得写 covered。

方案候选（利弊见 harness §2）：**(a)** 纯文案对齐（仅 header 注释）· **(b)** 常量改名+全消费点同步（需另立授权）· **(c)** 诚实保留+仅 post-align backlog 更新。提议默认 (a)。**先在缺陷披露**：`conn-stack:r5-mark-red:prove:182` 门锚定 AL 前字面量 `NOT sole-stack truth`，基线静态预计 EXIT=1（未运行 · Ban prove）；未授权修复则 documented-red 原样入账，**Ban 借本刀夹带修复、Ban retry-to-green、Ban 洗白**。

## prove 方案（执行阶段 · 本 stub 零运行）

`node --check scripts/run-e2e-isolated.mjs` EXIT=0 + 受影响 prove 回归复跑清单与 EXIT 契约（harness §4 全表）：g1 / g3 预期 EXIT=0 不变；r5-mark-red 双 alias 按先在红处置协议记录；compose 依赖族与 qdrant adapter 双审未要求则 named-not-run。attempts 全记录（含失败与放弃项）；任何新增红 = STOP；全刀零 e2e 运行、零新 receipt。

## 禁碰 / Ban（逐条）

1. **Ban coding**（本 REQUEST 零 scripts/ 触碰）· **Ban prove**（零运行）· Ban push / force-push / self-approve / secrets / `.env*`。
2. **Ban 改 e2e 断言与其他 prove 面**（g1/g3/r5-mark-red/adapter prove 文件零触碰，除先在红显式授权修复）。
3. **Ban 触碰 `E2E_ISO_STACK_NOTE`（`:2312-2313`，Line N narration-only 产物）**。
4. **Ban SSOT edit**（matrix / backlog `:63` / execution-master-checklist 本 commit 零改动；gap 不 flip、不写 covered）。
5. **Ban 改 PG-retained pin 本体**（`adr-postgres-retained.md` Decision L7-14 逐字不动）· **Ban 碰 privacy 面**（公开 DELETE=503 冻结、RLS、0091/0125 主链、UC-052 行、erasure prove 族零触碰）· Ban 把对齐写成 sole cutover / MySQL 切流暗示 · Ban 碰 UC-018/052/25/004 行与 `coveredCount=8`。

本 stub 不是 nail、不是 HA、不是 covered、不是 cutover 授权。

## 流程

本 stub 为 pre-exec 审查入口：`mw-privacy-int` PASS + `mw-e2e-ha` PASS（**BOTH**，alone ≠ dual · 不代签 peer）→ 协调方（meetwise bot）显式授权 coding（点名方案取舍与先在红处置）→ 实现方按授权执行 → post-align docs supplement + post-align 双审另起；backlog `:63` 只在彼时按彼时授权更新。本 commit 本身不运行任何 e2e / prove。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

## PRE-EXEC dual 审查（mw-privacy-int · privacy/INT 前置焦点 · docs gate only · 2026-10-07）

**审位**：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ss2-privacy-int` · branch `rv/ss2-privacy-int` @ 主线 tip `23b2ceb5`（被审 REQUEST `d0754918` = `docs(e2e): REQUEST SOLE_STACK align (pre_dual)` ∈ tip 祖先亲证；twin `1688184c` patch-id `cda96d90` 双侧亲算全等）。该分支旧 tip `55c8d5dd`（Line SS PRE 审）与主线 `5dbc391f` patch-id `77afddcd` 全等已归档，分支 reset 至 tip 属复用非删史（OB-1）。本审 **0 prove run · 0 coding · 0 SSOT · 全静态读证**。

### 检查表（P1–P12 · 逐项机检/亲读证据）

- **P1 docs-only**：REQUEST 恰 4 新增 md（slice +45 / harness +162 / 双 stub 50+54 = +311/−0）全在 `ai-docs/delivery/`；`scripts/`、SSOT（matrix / `gap-bug-backlog.md` / checklist）、`adr-postgres-retained.md` diff = 0 行机检 ✓
- **P2 消费点披露属实**（14 点逐点亲读）：`:1845-1848` 三常量逐字在位；`:1854` 未知栈 **EXIT=2**；`:1881` G3 块入口；`:1889-1894` 显式 PG image **EXIT=3**；`:1897-1903` fixture gate **EXIT=3**；`:1907-1922` allowlist 拒绝 **EXIT=3**；`:1925-1926` R5-SOLE-WIRING 横幅；`:1936-1940` post-AL R5-MARKED-RED（`dual-track code-path label ≠ product stack truth` / `NOT stack truth / NOT cutover evidence` 亲读吻合）；`:2202-2220` env 注入分支（注入 MySQL/Redis/Qdrant 端点 + delete `PG*` 全系与 `E2E_PG_IMAGE`）；`:2240-2270` receipt（`:2243` `stack: SOLE_STACK` · class `local_untrusted_sole_stack_allowlist_receipt` · `:2253-2254` `releaseEvidence:false`/`notHa:true`）；`:2282-2286` defense-in-depth **EXIT=3** —— 无虚报 ✓
- **P3 扫描面披露属实**：`conn-stack/mysql-stack.r5-mark-red.proof.mjs:182/:191/:196-204` · `g1-default-switch-prep.proof.mjs:107-125`（标识符正则 + allowlist Set 提取）· `qdrant-vectorstore-adapter.proof.ts:130-137` · `g3-e2e-pg-image.proof.mjs:177-186/:218`（package.json 防 flip + spawn 值字面量）· `package.json:54/:64/:65/:283/:285/:288/:289` · `uc018-perf-load-capped-child.mjs:110`（env 名透传）——「改名/改值波及 ≥5 prove 扫描器」亲读成立 ✓
- **P4 先在红披露诚实**：`grep -n "NOT sole-stack truth" scripts/run-e2e-isolated.mjs` = **0 hit**（exit 1 亲算）；`sole-stack truth` 仅 `:3` header（`E2E_PG_IMAGE ≠ sole-stack truth`，不匹配 `/NOT sole-stack truth/`）→ 双 alias 基线静态预计 **EXIT=1** 成立；r5-mark-red proof 文件零 diff = 修复未夹带；documented-red + Ban retry-to-green/Ban 洗白 落字在位 ✓
- **P5 `E2E_ISO_STACK_NOTE` Ban 触碰核验**：`:2312-2313` 现位亲读在位（narration-only · 指 ADR pin）· REQUEST scripts 零 diff → 零触碰 · N 线 nail `a778255c` ∈ 主线祖先亲证 ✓
- **P6 ADR 零触碰**：`adr-postgres-retained.md` Decision L7-14 逐字在位（keep Postgres / `PostgresSaver` / pgvector · prototypes **historical/experimental only**）· REQUEST 对 ADR 零 diff · L39 residual 点名（header `:5` + `const SOLE_STACK` · "separate package"）= 本刀授权来源如实引用 ✓
- **P7 叙事忠实 PG-retained（本审焦点）**：4 文件 grep `已删除|已废弃|deprecated|deleted code|已移除|removed from` = **0 hit**；erasure/DELETE 仅现于 Pins（DELETE=503）与 Ban/边界句；cutover/切流仅现于 `≠ sole cutover` / Ban 否定句；**无「Qdrant as erasure sink 已对齐」类 PRIV4/AR 越权**；backlog `:64`（AR/external-sink 行）零触碰 —— MySQL/Qdrant 全程按「历史原型保留态 / dual-track code-path label ≠ product stack truth」框定，与 ADR L12 忠实一致 ✓
- **P8 行为面 fail-closed 不松**：REQUEST 零代码改动；提议方案 (a) 注释级（`:5-6`，如获授权含 `:1847` 注释）零标识符/值/allowlist/控制流/exit/env/receipt 触碰 → 三 fail-closed 分支（消费点 1/3/13，EXIT=2/3）语义构造性保持 ✓
- **P9 Pins 原值**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 —— 4 文件逐字一致且与应然值全等 ✓
- **P10 状态诚实**：双 stub PENDING / `draft:awaiting_pre_exec_dual` · 零 self-approve · 零 `post_prove_dual_pass` self-write · 本 commit 零 e2e/prove 运行 ✓
- **P11 基线完整性**：4 文件 `d0754918`→tip `23b2ceb5` byte-identical（0 diff 机检）→ PRE 段无后手篡改；本审查段 append-only（原 stub 54 行 byte-intact）✓
- **P12 alone≠dual**：peer `mw-e2e-ha` stub 不代签；本 PASS ≠ dual 生效 ≠ coding/prove 授权 ✓

### 候选裁决（privacy/INT 焦点）

- **(a) 纯文案对齐 = 授权执行本体**：精确关闭 ADR L39 点名 residual（header `:5`），零行为风险、零扫描面命中（§1.6 无正则锚定该注释经 P3 亲证成立），与 Line AL 同构延续；privacy/INT 视角零擦除/RLS/DELETE/栈切流含义。
- **(b) 常量改名 = 本刀不做**：blast radius ≥5 已注册 prove 扫描门 + spawn 合同 + npm alias；post-AL banner + receipt `claimsForbidden` 已把 label 诚实框定，边际收益 < 回归风险；未来若双审判必要须另立 REQUEST + 回归计划（本审不预授）。
- **(c) 诚实保留 = 单独不充分**：ADR L39 residual 不关闭；其 backlog `:63` 更新成分仅可在 post-align 阶段按彼时授权并做。
- **先在红**：默认 documented-pre-existing-red 原样入账；修复（扫描正则更新接受 post-AL 措辞）须协调方显式授权并记 diff 与授权出处。

### Fail-trigger audit（触发即 FAIL · 逐项 0 hit）

代码/SSOT/ADR/`E2E_ISO_STACK_NOTE` 触碰 =0 · 删除/废弃叙事 =0 · PRIV4/AR 擦除越权 =0 · Pins 漂移 =0 · fail-closed 松动 =0 · 先在红隐瞒或夹带修复 =0 · prove 运行 =0 · self-approve/dual 混淆 =0 —— **0 hit**。

### Blockers

无（**0 Blocker**）。

### Conditions（C-SS2-1~7 · 随卷 binding）

- **C-SS2-1** 执行范围 = 方案 (a) 注释级对齐（`:5-6` 必做；`:1847` 注释微调如获协调方点名）；零标识符/值/allowlist/控制流/exit code/env 名值/receipt schema 改动；(b) 不在本刀、不预授。
- **C-SS2-2** 先在红处置：未获协调方显式授权修复 → 双 alias EXIT=1 按 documented-pre-existing-red 全录 attempts；获授权修复 → 改后 EXIT=0 + attempts 记修复 diff 与授权出处；Ban retry-to-green · Ban 洗白 · Ban 以 `node --check` 替代清单复跑；任何新增红 = STOP。
- **C-SS2-3** `E2E_ISO_STACK_NOTE`（`:2312-2313`）字节不变；`adr-postgres-retained.md` 全文件零 diff（Decision L7-14 逐字）；SSOT（matrix / backlog `:63` / checklist）零 diff——backlog 翻转仅 post-align 阶段按彼时授权。
- **C-SS2-4** 叙事纪律（本审焦点落字）：对齐后措辞必须保持「历史原型保留态 / dual-track code-path label ≠ product stack truth」；Ban 把对齐写成 MySQL/Qdrant 已删除/已废弃代码；Ban 任何「Qdrant as erasure sink 已对齐」类 PRIV4/AR 越权主张；Pins 八项逐字原值贯穿全刀产物。
- **C-SS2-5** 本 PASS = PRE-EXEC docs gate only：alone ≠ dual、不代签 peer `mw-e2e-ha`；PASS ≠ 协调方 coding 授权（授权须点名方案取舍与先在红处置）≠ prove 授权 ≠ nail ≠ gap flip ≠ AUTHORIZE；post-align 双审另起。
- **C-SS2-6** 本审查段 append-only（原 stub 54 行 byte-intact）为本 PASS 组成部分；末行裁决为文件最后非空行。
- **C-SS2-7** 勘误登记（保守方向 · 结论不受影响）：post-align docs supplement 须记录 `claimsForbidden` 实数 **12** 条（`:2256-2267`）而两 stub/harness §1.2#12 写 `claimsForbidden[9]`（50423a6f 基线亲算已是 12，方向保守：实际禁令多于记载）；Ban 借勘误改写其他任何面。

### Observations（非阻断）

- **OB-1** 分支复用记账：`rv/ss2-privacy-int` 旧 tip `55c8d5dd`（Line SS PRE 审）与主线 `5dbc391f` patch-id `77afddcd` 双侧亲算全等，分支 reset 至 `23b2ceb5` 属复用非删史。
- **OB-2** harness §3 措辞压缩：`grep -n "NOT sole-stack truth"` 字面实为 0 hit，「仅 `:3`」系更宽 grep（`sole-stack truth`）之果；结论（不匹配该正则 → 静态红）经独立亲算不变。
- **OB-3** ADR L39 行号引（@L2139/@L2141/@L1765-1768）为 AL 时代已漂移（现 `:2310-2314` / `:1936`）；ADR 本刀冻结、harness §1 已自我披露漂移机制，不构成本 REQUEST 缺陷。

### 中文摘要（3 行）

1. SS2 REQUEST docs-only 4 md 亲证：消费点/扫描面/先在红披露逐项实读吻合，PG-retained 叙事忠实（历史原型保留态 · 零删除/废弃措辞 · 零 PRIV4/AR 越权），`E2E_ISO_STACK_NOTE` 与 ADR Decision 零触碰，Pins 八项原值，fail-closed EXIT=2/3 构造性保持。
2. 候选裁决：授权 (a) 注释级对齐为执行本体；(b) 不做、须另立 REQUEST；先在红默认 documented-red、修复须显式授权；0 Blocker，Conditions C-SS2-1~7 随卷（含 claimsForbidden[9]→12 勘误登记）。
3. 本 PASS 为 PRE-EXEC docs gate only：alone≠dual 不代签 peer mw-e2e-ha，PASS≠coding/prove 授权≠nail≠gap flip；0 prove run · 0 coding · 0 SSOT · 禁 push。

Verdict: PASS
