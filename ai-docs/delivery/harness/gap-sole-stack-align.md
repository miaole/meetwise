# Harness — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包**（Line SS2 · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · 零行为语义裁决权）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban self-approve · Ban coding · Ban prove · Ban push · 本 commit 不运行任何 e2e / prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Date**: 2026-10-07
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`50423a6f`** / full `50423a6fa6f18d4c9d193611cf84c4702e067208`（docs tip · not a prove tip · fetch 成功、本地 origin ref 与主仓 HEAD 一致）
**Worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-ss2` · branch `line/ss2-sole-stack`（一切 git 写操作只在此 worktree；路径与分支在本 REQUEST 前已按基线 tip 预建于 `50423a6f`、干净零 diff，故未另建 `-2`）
**Knife**: **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 代码路径对齐包**（N 线 `a778255` 显式遗留的「另包」· 行为语义裁决交双审 · **≠ sole cutover** · 本 REQUEST docs-only）
**Gap id**: **`GAP-E2E-ISO-BANNER-PG-RETAINED`**（`ai-docs/delivery/gap-bug-backlog.md:63` · P1 · named gap · backlog 行状态本刀不改）
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（stub PENDING · Ban self-approve · alone ≠ dual · 不代签 peer · PG-retained 属隐私/栈域故 `mw-privacy-int` 入双审）
**Authority**: meetwise — docs REQUEST open only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit（本 commit）· Ban push

## 0. 本刀在谱系中的位置（先读再写的事实链）

- **Line N**（`line/n-nail` `a778255`）：REQUEST `8cd5ed2` → exec `aab0e8b`（ADR `:39` clarify bullet + harness 新增 4 行 `E2E_ISO_STACK_NOTE` 纯 narration）→ nail `a778255`。nail 原文钉死两件事：**backlog `:63` 翻转未授权（stays OPEN）**；**「SOLE_STACK 代码路径对齐另包」**。`E2E_ISO_STACK_NOTE` **永为 narration-only**。
- **Line AL residual**（REQUEST `27c2e99` → exec `c633584`）：banner 字符串对齐——把 R5-MARKED-RED 里的 `intended sole default=${SOLE_STACK}` 与 `(sole stack = MySQL+Qdrant+Redis)` **移除**，改为 `SOLE_STACK=… is a dual-track code-path label ≠ product stack truth` + 指向 `adr-postgres-retained.md`；commit message 显式 **Ban SOLE_STACK（const/allowlist/dual-track untouched）**，并把 residual 明示为 **「file header comment `:5` and `const SOLE_STACK` untouched」**。Line AL nail（backlog `:593-598` 段）重申：**gap stays OPEN · Ban rewrite `SOLE_STACK` · Ban closing backlog `:63`**。
- **本刀（Line SS2）**：即上述两刀显式遗留的「另包」。范围＝把 ADR L39 点名的 residual（header `:5` 注释 + `SOLE_STACK` 常量面）逐消费点披露、给出 ≥2 方案与 prove 方案，交双审裁决**行为语义**（`SOLE_STACK` 是否被 G3 fail-closed 分支 / fixture gate 消费、改名波及面是否可接受）。本 REQUEST 本身零 scripts/ 触碰。

## 1. 现状陈述（只读取证 · file:line 全引 · 基线 tip `50423a6f` 实读；N 线时代行号 L1603-1606 / L1694-1697 已因 tip 前进漂移，现址如下）

### 1.1 三常量定义（`scripts/run-e2e-isolated.mjs`）

- `:1845`　`const SOLE_STACK = 'mysql-qdrant-redis';`
- `:1846`　`const LEGACY_STACK = 'pgvector-legacy';`
- `:1847`　注释：`// G3: sole's only approved fixture config — compose.mysql-local (MySQL+Qdrant+Redis), NOT any PG/pgvector image.`
- `:1848`　`const SOLE_APPROVED_FIXTURE_CONFIG = 'compose.mysql-local';`
- 上文 `:1843-1844`：`LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16'`（G3 注释：default image UNCHANGED）。

### 1.2 `SOLE_STACK` 全部消费点（14 处 · 逐点实读）

| # | 位置 | 性质 | 行为语义 |
|---|------|------|----------|
| 1 | `:1854` | 校验 | `isolationStack !== LEGACY_STACK && isolationStack !== SOLE_STACK` → 未知栈值 **EXIT=2**（fail-closed） |
| 2 | `:1857` | 文案 | 报错文本 `(allowed: ${LEGACY_STACK} \| ${SOLE_STACK})` |
| 3 | `:1881` | **分支入口** | `if (isolationStack === SOLE_STACK)` → 进入 G3 fail-closed 块（消费点 4-9 的宿主） |
| 4 | `:1889-1890` | 文案 | `[G3-E2E-PG-IMAGE] E2E_ISOLATION_STACK=${SOLE_STACK} forbids E2E_PG_IMAGE=…` → 显式 PG 图像 **EXIT=3** |
| 5 | `:1899-1900` | 文案 | `[G3-E2E-PG-IMAGE] …without approved image/fixture config` → **EXIT=3** |
| 6 | `:1907` | 文案 | `[R5-DUAL-TRACK] …not on sole wiring allowlist`（→ `:1922` EXIT=3） |
| 7 | `:1911` | 文案 | `Use ${LEGACY_STACK} explicitly for pgvector fixture proves.` |
| 8 | `:1925-1926` | 文案 | `[R5-SOLE-WIRING]` 成功横幅（allowlist 通过） |
| 9 | `:1936` | 文案 | R5-MARKED-RED 横幅（post-AL 措辞）：`SOLE_STACK=${SOLE_STACK} is a dual-track code-path label ≠ product stack truth` |
| 10 | `:2202` | **分支入口** | `isolationStack === SOLE_STACK && SOLE_WIRING_ALLOWLIST.has(target)` → sole env 注入分支（无 disposable PG 容器） |
| 11 | `:2205` | **env 值** | 子进程 `E2E_ISOLATION_STACK: SOLE_STACK`（同步注入 `:2206` `E2E_SOLE_APPROVED_FIXTURE`、删 `PG*`/`E2E_PG_IMAGE`，`:2211-2220`） |
| 12 | `:2243` | **receipt 字段** | `stack: SOLE_STACK` 写入 `class='local_untrusted_sole_stack_allowlist_receipt'`（`:2240-2270`，含 `releaseEvidence:false` · `notHa:true` · `claimsForbidden[9]`） |
| 13 | `:2282` | **分支入口** | G3 defense-in-depth：`if (isolationStack === SOLE_STACK)` → 拒绝 docker-run 任何 PG image，**EXIT=3** |
| 14 | `:2284` | 文案 | `[G3-E2E-PG-IMAGE] refuse docker-run of image=${image} on E2E_ISOLATION_STACK=${SOLE_STACK}` |

**关键结论（披露，非裁决）**：`SOLE_STACK` **不是纯装饰字符串**——它是 3 个 fail-closed 分支入口（消费点 1/3/13：EXIT=2 与两处 EXIT=3）、1 个 env 注入分支入口（消费点 10-11）、1 个 receipt 字段（消费点 12）的**判定值与数据值**。改常量**值**（`'mysql-qdrant-redis'`）即改 G3/DUAL-TRACK 匹配语义与子进程 env、receipt 内容；改常量**名**（标识符）即波及下 §1.5 的源码扫描型 prove。post-AL 的 R5-MARKED-RED 措辞（消费点 9）与 receipt `claimsForbidden`（消费点 12）已把该 label 诚实框定为 code-path label ≠ product truth——**语义现状是否需要改名，属双审裁决，不在本 REQUEST 判**。

### 1.3 `LEGACY_STACK` 消费点（6 处）

`:1850`（默认值解析：未设 env → legacy）；`:1852`（回写 `process.env.E2E_ISOLATION_STACK = LEGACY_STACK`）；`:1854`/`:1857`（校验与文案）；`:1911`（文案）；`:1934`（`if (isolationStack === LEGACY_STACK)` → R5-MARKED-RED 横幅分支入口）；`:1943`（`[G7-SCOR00-PG-FIXTURE]` 文案）。

### 1.4 `SOLE_APPROVED_FIXTURE_CONFIG` 消费点（6 处）

`:1885-1886`（approvedFixture 默认解析：unset → 该值）；`:1890`（文案）；`:1897`（`approvedFixture !== SOLE_APPROVED_FIXTURE_CONFIG` → **EXIT=3**，fixture gate 本体）；`:1900`（文案）；`:1926`（文案）；`:2206`（子进程 env `E2E_SOLE_APPROVED_FIXTURE`）。

### 1.5 值/标识符的仓内耦合面（改名/改值 ripple · 全 grep 实读）

| 文件:行 | 耦合方式 | 改动后果 |
|---|---|---|
| `scripts/g1-default-switch-prep.proof.mjs:107-125` | **正则扫 harness 源码标识符**：`must default unset stack to LEGACY_STACK (not SOLE_STACK)`、禁止 `/rawIsolationStack\s*\|\|\s*SOLE_STACK/`、要求 `/!rawIsolationStack[\s\S]{0,80}E2E_ISOLATION_STACK\s*=\s*LEGACY_STACK/`、`SOLE_WIRING_ALLOWLIST\s*=\s*new Set\(` 块提取 | **改标识符名 → G1 prove 红** |
| `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:191` | 扫 harness 文本要求 `/pgvector-legacy/ && /mysql-qdrant-redis/` 同时在场 | **改常量值 → 红** |
| `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:182` | 扫 harness 文本要求 `/R5-MARKED-RED/ && /NOT sole-stack truth/`（**字面量已不存在**，见 §3） | **基线即静态红（先在缺陷，非本刀引入）** |
| `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:196-204` | allowlist 形状门（恰 5 个 target、逐名匹配、禁 rag/memory-qdrant） | 改 allowlist 项名 → 红 |
| `packages/qdrant-store/test/qdrant-vectorstore-adapter.proof.ts:130-137` | 扫 harness `/pgvector-legacy/ && /mysql-qdrant-redis/` + `/process\.env\.E2E_ISOLATION_STACK\s*=\s*LEGACY_STACK/` | 改名/改值 → 红 |
| `scripts/g3-e2e-pg-image.proof.mjs:177-178,186,218` | 以 env **值字面量** `'mysql-qdrant-redis'` spawn fail-closed 子进程 + 扫 package.json 防 flip | 改值 → G3 prove 子进程匹配失效 |
| `scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs:34,69-74` | 自持 `const STACK = 'mysql-qdrant-redis'` + 读 env 匹配 | 改值需同步 |
| `scripts/g7-scor00-sole-fixture.proof.mjs:6` | 自身 header：`T1 Isolated intended sole stack = mysql-qdrant-redis (plan pinned; G1 flip NOT done)` | 文档级引用 |
| `package.json:283,285` | `e2e-isolation:sole-wiring:prove` / `e2e-isolation:sole-qdrant-backed:prove` 以 `E2E_ISOLATION_STACK=mysql-qdrant-redis` spawn harness | 改值 → 两条 npm alias 失效 |
| `scripts/uc018-perf-load-capped-child.mjs:110` | env **名** `E2E_ISOLATION_STACK` 透传白名单 | 改 env 名 → 透传断 |
| `scripts/mysql-stack.r5-mark-red.proof.mjs`（根） | 纯 forwarder → conn-stack 拷贝（`import './conn-stack/…'`） | 与 conn-stack 同红 |

### 1.6 adjacent narration（AL 后仅存 residual）

- **`:5-6` 文件头注释**：`Intended sole default = mysql-qdrant-redis (MySQL+Qdrant+Redis). Allowlisted sole targets …`——**「intended sole default」措辞的全仓 harness 内最后一处**（AL 只改了 banner，header 原样；ADR `:39` 原文点名）。静态核实：无任何 prove 正则锚定该注释文本（`Intended sole` 在 scripts/ 仅 `:5` 与 g7 proof 自身 header 两处，互不扫描）。
- `:1860-1872` `SOLE_WIRING_ALLOWLIST`（恰 5 target + 注释）；`:1874-1880` `SOLE_WIRING_PREREQS`（6 条）；`:1847` G3 注释。
- `:2312-2313` `E2E_ISO_STACK_NOTE`（**Line N 产物 · narration-only · 本刀保留原样，Ban 触碰**）。
- `ai-docs/delivery/adr-postgres-retained.md:9-11`（keep Postgres / `PostgresSaver` / pgvector）· `:3`（accepted · direction pin）· **`:39` Non-claims banner-clarify bullet（本刀的直接授权来源与 residual 点名处：residual = header `:5` + `const SOLE_STACK`；「SOLE_STACK code-path alignment is a separate package」）**。

## 2. 方案候选（≥2 · 利弊交双审 · 行为语义裁决权在双审，实现方不预判）

- **方案 (a) 纯文案对齐（注释级）**：只改 `scripts/run-e2e-isolated.mjs:5-6` 文件头注释（及如获授权的 `:1847` 注释微调），把「Intended sole default = …」改为与 post-AL banner 同构的双轨 code-path label 措辞 + 指向 `adr-postgres-retained.md`；**标识符、常量值、allowlist、控制流、exit code、env 名值、receipt schema 全部零触碰**。零 prove 扫描面命中（§1.6 已核实无正则锚定该注释）。利：零行为风险、精确关闭 ADR L39 点名的 narration residual、与 AL 修法同构延续；弊：不改「label 本身的名字/值」，`SOLE_STACK` 仍叫 sole——依赖 post-AL banner + receipt `claimsForbidden` 的诚实框定继续成立；backlog `:63` 行仍 OPEN。
- **方案 (b) 常量改名 + 消费点同步**：例如 `SOLE_STACK` → `SOLE_TRACK_LABEL` 一类 code-path 命名，并同步 §1.2 的 14 处 + §1.3 的 6 处 + §1.4 的 6 处 + §1.5 全部外部扫描器（g1 正则按**标识符名**匹配、r5-mark-red `:191` 与 adapter proof 按**值字面量**匹配、g3 spawn 值、package.json env 值、uc018 env 名若改）。利：命名层最大诚实；弊：**blast radius 覆盖 ≥5 个已注册 prove 的扫描门与 spawn 合同**，任何一步不同步即红；且 post-AL banner 与 receipt 已把 label 语义框定诚实，边际收益小、回归风险大；需要 coding+prove 全量授权，远超 docs 刀形态。**本 REQUEST 不预判砍留，交双审逐条裁决；若双审判 (b) 必要，须另行拆分授权与 prove 回归计划。**
- **方案 (c) 诚实保留 + 仅 backlog 更新**：零文件改动（含注释），仅在 post-align docs 阶段更新 backlog `:63` 行，记录「banner residual 已由 AL 对齐；余留 = header `:5` + const label，已由 post-AL banner/receipt 框定为 code-path label ≠ product truth」。利：零代码风险；弊：**backlog 是 SSOT，本 commit Ban 碰**（只能在授权后的 post-align 阶段动），且 header `:5` 的「Intended sole default」stale narration 原样留存——正是 ADR L39 点名的 residual 不关闭。
- **默认执行形态（提议，供双审裁）**：**(a)** 为执行本体；若双审同时放行 backlog 更新，则 post-align 阶段并做 (c) 的 SSOT 记录；(b) 除非双审显式判必要，否则不作。任一方案被双审砍掉即不做该方案。

## 3. 先在缺陷披露（静态读证 · Ban prove 未运行 · 复跑与修复裁决留执行阶段）

`scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:182-184`：

```js
if (/R5-MARKED-RED/.test(e2e) && /NOT sole-stack truth/.test(e2e)) {
  pass('run-e2e-isolated.mjs: R5-MARKED-RED / NOT sole-stack truth banner');
} else fail('run-e2e-isolated.mjs: must emit R5-MARKED-RED banner');
```

- Line AL（`c633584`）把 banner 字面量改为 `NOT stack truth / NOT cutover evidence`（现 `:1937`），全文件不再含 `NOT sole-stack truth` 字节序列（`grep -n "NOT sole-stack truth" scripts/run-e2e-isolated.mjs` → 仅 `:3` header `E2E_PG_IMAGE ≠ sole-stack truth`，不匹配该正则；本 REQUEST 以只读 grep 披露，**未运行该 prove**——Ban prove）。
- **静态判定**：`pnpm mysql-stack:r5-mark-red:prove`（package.json:54，根 forwarder）与 `pnpm conn-stack:r5-mark-red:prove`（package.json:64）在基线 tip `50423a6f` 上**预计 EXIT=1**——**先在缺陷**，由 AL banner-string 对齐引入（其 commit 自述仅验证 `node --check`、zero e2e run），**非本刀引入、非本刀可静默洗白**。修复路径（更新扫描正则接受 post-AL 措辞 = prove 文件代码改动）须双审+协调方显式授权；未授权则该红保持 documented-red 并进 attempts 台账，**Ban retry-to-green · Ban 洗白 · Ban 借本刀夹带修复**。
- 该披露不改变本刀 docs-only 性质：它划定了 §4 回归清单里唯一一个「基线即红」的预期项。

## 4. prove 方案（执行阶段经授权后 · 本 REQUEST 零运行）

1. **语法门**：`node --check scripts/run-e2e-isolated.mjs` → 契约 **EXIT=0**。
2. **受影响 prove 回归复跑清单**（执行 commit 后逐条记录 EXIT 与日志路径；注释级改动 (a) 的 EXIT 契约 = 除 §3 先在红外与基线逐项相同）：

| CMD（package.json） | 基线静态预期 | 执行后契约 |
|---|---|---|
| `pnpm g1-default-switch:prep:prove`（:288） | EXIT=0 | **EXIT=0**（(a) 不触标识符；若双审放行 (b) 则须同步 g1 正则后复跑） |
| `pnpm g3-e2e-pg-image:prove`（:289） | EXIT=0 | **EXIT=0** |
| `pnpm conn-stack:r5-mark-red:prove`（:64）/ `pnpm mysql-stack:r5-mark-red:prove`（:54） | **EXIT=1（§3 先在红）** | 未授权修复：**EXIT=1 原样记录**（documented-pre-existing-red）；授权修复：改后 **EXIT=0** 并在 attempts 记修复 diff 与授权出处 |
| `pnpm conn-stack:sole-wiring:prove`（:65）等 compose 依赖族 | docker 依赖 | 双审未要求则 **named-not-run** 并记录原因；要求则全记录 |
| `packages/qdrant-store` adapter prove | EXIT=0 | 双审未要求则 named-not-run；要求则记录 |

3. **EXIT 契约总则**：任何**新增**红（基线绿→执行红）= 执行失败 → STOP，不得入账为 pass；attempts **全记录**（每次运行的 EXIT、命令全文、日志路径，含失败与放弃项）；Ban retry-to-green、Ban 选择性汇报、Ban 以 `node --check` 替代清单复跑。全刀零 e2e 运行、零 `.tmp/sole-stack-receipts/` 新 receipt。

## 5. 流程（§3 loop 第③步 → 第④步）

1. 本 commit：docs-only REQUEST（harness + slice + 两个 pre-exec stub，PENDING）。
2. 预执行双审：`mw-e2e-ha` + `mw-privacy-int` **BOTH PASS**（alone ≠ dual · Ban self-approve · 不代签 peer）。
3. 协调方（meetwise bot）显式授权 coding（授权须点名方案 (a)/(b)/(c) 取舍与 §3 先在红的处置）→ 实现方按授权执行。
4. 执行后 post-align docs supplement + post-align 双审**另起**；backlog `:63` 状态只在彼时、只按彼时授权更新。

## 6. Ban（逐条）

1. **Ban coding**（本 REQUEST 零 scripts/ 触碰；授权后执行也仅限双审放行的方案范围）。
2. **Ban prove**（本 REQUEST 不运行任何 e2e / prove / `node --check`；§3/§4 全部为静态读证与契约预告）。
3. **Ban push / force-push / self-approve / secrets / `.env*`**。
4. **Ban 改 e2e 断言 / 其他 prove 面**（g1/g3/r5-mark-red/adapter 等 prove 文件本刀零触碰，除非双审+协调方对 §3 先在红显式授权修复）。
5. **Ban 触碰 `E2E_ISO_STACK_NOTE`（`:2312-2313`）**——Line N 钉死的 narration-only 产物。
6. **Ban SSOT edit**（matrix / backlog / execution-master-checklist 本 commit 零改动；backlog `:63` 行状态不 flip）。
7. **Ban 把对齐写成 sole cutover / MySQL 切流暗示**；Ban 改 `adr-postgres-retained.md` Decision 本体（L7-14 逐字不动）；Ban 碰 UC-018/052/25/004 行与 `coveredCount=8`。

## 7. 验收判据（post-align 双审机检用 · 预告）

- 执行 commit 的 `run-e2e-isolated.mjs` diff 逐字等于被放行方案的申报预览；(a) 被放行时＝header 注释行级替换、零标识符/值/控制流/exit 变化，`node --check` EXIT=0。
- §4 清单逐条有 attempts 记录；新增红=0；§3 先在红按授权处置且台账可追溯。
- `E2E_ISO_STACK_NOTE` 字节不变；ADR Decision 本体零 diff；SSOT 文件零 diff（除授权后的 post-align 记录）。
- 全刀文件 Pins 逐字一致（§Pins）。

## 遗留（非本刀范围）

- §3 先在红（`conn-stack:r5-mark-red` 扫描门锚定 AL 前旧字面量）的修复授权归属。
- backlog `:63` 行状态翻转、matrix 头部 stale「栈裁定」措辞——均为 SSOT，须独立授权流程。
- 若双审判 (b)（常量改名）必要：g1 正则、r5-mark-red/adapter 值扫描、g3 spawn、package.json alias、uc018 env 透传的同步工程量与回归计划须另立 REQUEST。

## Pins（retained · 本刀不改）

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

---

*Harness · SOLE_STACK 代码路径对齐包 · draft:awaiting_pre_exec_dual · ≠ sole cutover · 零行为语义裁决权 · STOP*
