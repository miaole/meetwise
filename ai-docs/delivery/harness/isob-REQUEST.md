# Harness — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 命名语义收口任务书**（Line ISOB · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · docs 钉刀 · 零产品行为变更）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban self-approve · Ban coding · Ban prove · 本 commit 不运行任何 e2e / prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Date**: 2026-10-26
**Base / parent tip**: `origin/main` **`2818c252`** / full `2818c2522a4d5003fb4f9a888c9fa67e7881adc9`（docs tip · not a prove tip · fetch EXIT=0、本地 origin ref 与远端一致；本地 `main` 分支落后于 origin/main 属正常滞后，非分叉）
**Worktree**: `meetwise-isob`（仓根同级 worktree）· branch `line/isob-draft`（一切 git 写操作只在此 worktree）
**Knife**: **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 命名语义收口任务书**（总盘 #11 派单 · 隔离 runner PG 容器横幅命名含 SOLE_STACK 陈旧语义 · 刀型二择一裁决 = **docs 钉刀** · **≠ sole cutover** · **零产品行为变更**）
**Gap id**: **`GAP-E2E-ISO-BANNER-PG-RETAINED`**（`ai-docs/delivery/gap-bug-backlog.md:63` · P1 · named gap · **backlog 行状态本刀不改 · stays OPEN**）
**Experts**: `mw-e2e-ha` + `mw-privacy-int`（stub PENDING · Ban self-approve · alone ≠ dual · 不代签 peer · PG-retained 属隐私/栈域故 `mw-privacy-int` 入双审）
**Authority**: meetwise — docs REQUEST open only · Ban secrets / `.env*` · Ban force-push · Ban SSOT edit（本 commit）· Ban push

## 0. 本刀在谱系中的位置（先读再写的事实链）

- **Line N**（`line/n-nail` nail `a778255`）：REQUEST `8cd5ed2` → exec `aab0e8b`（ADR `:39` clarify bullet + runner 新增 `E2E_ISO_STACK_NOTE` 纯 narration）→ nail。nail 钉死：**backlog `:63` 翻转未授权（stays OPEN）**；**「SOLE_STACK 代码路径对齐另包」**。
- **Line AL**（REQUEST `27c2e99` → exec `c633584`）：banner 字符串对齐——R5-MARKED-RED 移除 `intended sole default=` / `(sole stack = MySQL+Qdrant+Redis)` 旧措辞，改为 `SOLE_STACK=… is a dual-track code-path label ≠ product stack truth` + 指向 `adr-postgres-retained.md`；residual 明示为 **「file header comment `:5` and `const SOLE_STACK` untouched」**；AL nail 重申 **gap stays OPEN · Ban rewrite `SOLE_STACK` · Ban closing backlog `:63`**。
- **Line SS2**（REQUEST `gap-sole-stack-align.md` → exec `2fa7b31a`≡origin `ee7563a2` → nail `1a61a8067`）：**只行使方案 (a)**（header `:5-6` 注释对齐 +2/−2 · 零代码面）；**方案 (b) 常量改名未获放行**，其 §2(b) 自载「本 REQUEST 不预判砍留……若双审判 (b) 必要，须另行拆分授权与 prove 回归计划」、遗留再载「须另立 REQUEST」。
- **本刀（Line ISOB）**：即总盘 #11「backlog :63 行翻转 · SOLE_STACK const 改名方案 b 复活**须新 REQUEST**」所指的新 REQUEST。范围＝①产品面侦察（const 现形 + 全树引用面亲点）②刀型二择一裁决（§2，裁决 **docs 钉刀**）③方案 b 复活路径预登（§4）④GAP 收口注记（§5）。本 commit 零 scripts 产品面触碰（cap 计数预算联动两 policy 件除外，见 §6）。

## 1. 产品面侦察（只读取证 · file:line 全引 · 基线 tip `2818c252` 实读；SS2 时代行号 `:1845-1848` 已因 tip 前进漂移，现址如下）

### 1.1 常量现形（`scripts/run-e2e-isolated.mjs`）

- `:3740`　`const container = \`meetwise-e2e-${process.pid}-${Date.now()}\`;` —— 一次性 PG 容器名本体**中性**（`meetwise-e2e-*` 前缀，无 sole 词面）；陈旧语义不在容器名，在横幅与常量词面（§1.2）。
- `:3741`　`const LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16';`（legacy 轨默认图，G3 注释 UNCHANGED）。
- `:3746`　`const SOLE_STACK = 'mysql-qdrant-redis';` ← **词面本体**。
- `:3747`　`const LEGACY_STACK = 'pgvector-legacy';`
- `:3749`　`const SOLE_APPROVED_FIXTURE_CONFIG = 'compose.mysql-local';`
- `:3767`　`const SOLE_WIRING_ALLOWLIST`（恰 5 target）· `:3774`　`const SOLE_WIRING_PREREQS`（6 条）——同族 SOLE_ 前缀标识符。
- `:5`　文件头注释（post-SS2(a) 措辞）：`Sole-track code-path label: SOLE_STACK='mysql-qdrant-redis' is a dual-track isolation label ≠ product stack truth; product stack pin = ai-docs/delivery/adr-postgres-retained.md …`。

### 1.2 「PG 容器横幅」词面现形（张力本体）

- `:3836-3848`　R5-MARKED-RED 横幅块（legacy pgvector disposable PG 容器路径，分支入口 `:3836` `isolationStack === LEGACY_STACK`）：`:3837` 文案 `(dual-track; SOLE_STACK=${SOLE_STACK} is a dual-track code-path label ≠ product stack truth)` + `:3838-3839` 指向 ADR。**陈旧语义 = 标识符名「SOLE_STACK（唯一栈）」+ 值 `'mysql-qdrant-redis'` 在 PG-retained ADR（Postgres · PostgresSaver · pgvector retained）下的时代错位**；runtime 已由 post-AL banner + post-SS2(a) header 诚实框定，唯名面残留——即 backlog `:63` 「SOLE_STACK 对齐另包」所指剩余开放面。
- 邻接横幅：`:3826-3831` `[R5-SOLE-WIRING]`（sole 轨放行横幅）· `:3790-3792` / `:3800-3802` `[G3-E2E-PG-IMAGE]` fail-closed 文案 · `:3818-3822` `[G7-SCOR00-SOLE-PREREQ]`。
- 隔离 PG 容器就绪横幅：`:4214` `E2E isolated PostgreSQL: ${container} …` + `:4216` `E2E_ISO_STACK_NOTE`（Line N 产物 · narration-only · 本刀保留原样，Ban 触碰）。ADR `:39` 所引 `@L2139/L2141` 系 2026-10-06 时点行锚，现漂移至 `:4214/:4216`——行号漂移本身如实登记，ADR 文本本刀不改。

### 1.3 `SOLE_STACK` 在 runner 内全部消费点（`rg -c "SOLE_STACK"` = **恰 15 行** · 逐点亲读）

| 位置 | 性质 | 行为语义 |
|---|---|---|
| `:5` | 注释 | header code-path label 措辞（post-SS2(a)） |
| `:3746` | **定义** | `const SOLE_STACK = 'mysql-qdrant-redis'` |
| `:3755` / `:3758` | **判定值 / 文案** | 未知栈值校验 → **EXIT=2**（fail-closed） |
| `:3782` | **分支入口** | `isolationStack === SOLE_STACK` → G3 fail-closed 块 |
| `:3790` / `:3800` | 文案 | `[G3-E2E-PG-IMAGE]` 两处 EXIT=3 文案插值 |
| `:3806` / `:3808` | 文案 | `[R5-DUAL-TRACK]` allowlist 拒绝文案（→ EXIT=3） |
| `:3826` | 文案 | `[R5-SOLE-WIRING]` 放行横幅 |
| `:3837` | 文案 | R5-MARKED-RED 横幅（§1.2 张力本体） |
| `:4103` | **分支入口** | sole env 注入分支（无 disposable PG 容器） |
| `:4106` | **env 值** | 子进程 `E2E_ISOLATION_STACK: SOLE_STACK`（`:4107` 同步注入 fixture env） |
| `:4144` | **receipt 值** | `stack: SOLE_STACK` 写入 `class='local_untrusted_sole_stack_allowlist_receipt'`（`:4143` class · `:4156` claimsForbidden · `:4174` stdout 收据行） |
| `:4185` | 文案 | G3 defense-in-depth 拒 docker-run 文案（分支入口 `:4183` → EXIT=3） |

**关键结论**：`SOLE_STACK` 不是纯装饰字符串——3 个 fail-closed 判定值分支（EXIT=2 ×1、EXIT=3 ×2）、1 个 env 注入分支 + 子进程 env 值、1 个 receipt 数据值。**改常量值**即改 G3/DUAL-TRACK 匹配语义、子进程 env、receipt 内容；**改标识符名**即波及 §1.4A 四件源码扫描型 prove。同族 SOLE_ 前缀标识符（`SOLE_WIRING_ALLOWLIST` `:3767` 消费 `:3806/:3808/:3818/:3847/:4103/:4153`；`SOLE_WIRING_PREREQS` `:3774` 消费 `:3811`；`SOLE_APPROVED_FIXTURE_CONFIG` `:3749` 消费 `:3786-3787/:3791/:3798/:3801/:3827/:4107`）在方案 b 下同需同步。

### 1.4 全树引用面分级（rg 全树亲跑 · 三层）

**A. 标识符级扫描门（改名 `SOLE_STACK` 即红 · 恰 4 件已注册 prove）**：

| 文件:行 | 耦合方式 |
|---|---|
| `scripts/g1-default-switch-prep.proof.mjs:101-116` | 正则锚 `/const SOLE_STACK\s*=\s*'mysql-qdrant-redis'/`（:101 在场断言）+ 禁 `/rawIsolationStack\s*\|\|\s*SOLE_STACK/`（:112-113）+ 默认须 LEGACY 断言（:110） |
| `scripts/g3-e2e-pg-image.proof.mjs:115-118, :137` | 禁 default-to-SOLE_STACK 正则（:115）+ `isolationStack === SOLE_STACK` 在场断言（:137） |
| `scripts/g7-scor00-sole-fixture.proof.mjs:114-115` | 须匹配 `/const SOLE_STACK\s*=\s*'mysql-qdrant-redis'/` |
| `scripts/conn-stack/mysql-stack.qdrant-backed.prove.mjs:274-275` | `/SOLE_STACK/` && `process.exit(3)` && `PREREQ|GAP` && `/SOLE_WIRING_ALLOWLIST/` 复合在场门 |

**B. 值级 spawn/扫描合同（改值 `'mysql-qdrant-redis'` 即红/断 · ≥6 面）**：

| 文件:行 | 耦合方式 |
|---|---|
| `package.json:440-444` | 5 条 alias 以 `E2E_ISOLATION_STACK=mysql-qdrant-redis` spawn harness |
| `scripts/g3-e2e-pg-image.proof.mjs:177-178, :186, :205, :218` | 扫 package.json 值防 flip + 扫自源值 + fail-closed 子进程 env 值两处 |
| `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:109, :133, :191-193` | 值字面量三重扫描门（根 `scripts/mysql-stack.r5-mark-red.proof.mjs` 为 forwarder 同红） |
| `packages/qdrant-store/test/qdrant-vectorstore-adapter.proof.ts:131` | `/pgvector-legacy/ && /mysql-qdrant-redis/` 值扫描 |
| `scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs:34` | 自持 `const STACK = 'mysql-qdrant-redis'` 读 env 匹配 |
| receipt 值族 | `scripts/lib/uc-covered-real-gatherer.mjs:42, :227-229, :253-254`（`parseSoleStack` 值解析）· `scripts/uc018-receipt-backfill-emit.mjs:174-176`（backfill 发射 `soleStack`）· `scripts/uc-e2e-018-covered-criterion.proof.mjs:630`（`delete j.soleStack`） |

env **名**面（仅当 env 改名才涉及，const 改名不触）：`scripts/uc018-perf-load-capped-child.mjs:114` 透传白名单含 `E2E_ISOLATION_STACK`。

**C. 文档/收据引用面（非运行时耦合 · 不随码改断）**：`ai-docs/` **82 件**引用 SOLE_STACK 词面（含 `adr-postgres-retained.md:39` residual 点名、`harness/gap-sole-stack-align.md`、coverage matrix、backlog）；`receipts/` **332 件**历史日志含词面——**append-only · Ban 改写**。

### 1.5 backlog `:63` 登记原文（亲读）

> `| GAP-E2E-ISO-BANNER-PG-RETAINED | P1 | run-e2e-isolated.mjs R5-MARKED-RED banner 仍写 MySQL+Qdrant+Redis 为 intended sole · ≠ adr-postgres-retained 真相 | 收据/审查 不得 引用该 banner 作 stack truth；SOLE_STACK 对齐另包 | e2e / privacy | Line B N1 · named gap | adr-postgres-retained.md；scripts/run-e2e-isolated.mjs |`

行文「仍写…intended sole」相对 post-AL banner 现文（`:3837` 已改为 code-path label 措辞）**已滞后**，但行状态 stays OPEN 是 N/AL nail 与 SS2 conditions（C-SS2P「backlog `:63` 翻转须另立授权」）三重钉死——**行文勘误与行状态翻转均属 SSOT 另授权，本刀 Ban（§8-3）**。

### 1.6 方案 b 复活力语义（亲点复核）

SS2 §2(b) 自评（tip `50423a6f` 时点）：利「命名层最大诚实」；弊「blast radius 覆盖 ≥5 个已注册 prove 的扫描门与 spawn 合同，任何一步不同步即红」+「需要 coding+prove 全量授权，远超 docs 刀形态」。**本 tip `2818c252` 亲点复核**：标识符锚定 prove 恰 4 件（§1.4A）、值级合同 ≥6 面（§1.4B）、receipt 值解析 1 族、同族 SOLE_ 前缀标识符 3 组（§1.3）——爆炸半径在 `50423a6f` → `2818c252` 间**未缩小**（g7 `:114`、qdrant-backed `:274` 均现行在飞门）。复活力 = 名面残留仍在（backlog `:63` OPEN）；复活成本 = 未降反稳。

## 2. 刀型裁决（二择一）

**裁决 = docs 钉刀（不改码 · 登记命名语义现状 + GAP 收口注记）**。理由三点：

1. **派单停止条件如实触发**：「改名牵动断言面需大改」——§1.4A 恰 4 件标识符锚定扫描 prove + §1.4B ≥6 值级合同 + receipt 值解析族 + §1.3 同族标识符 3 组，「EXEC 小刀（const 改名+全引用面同步）」实际 = 跨 10+ 文件的 prove 断言面重写 + 全量 prove 回归 + 双审授权拆分，远超 docs/const 小刀形态。按派单「如实红停上报改判 docs 钉刀」条款裁决。
2. **边际收益小**：post-AL banner（`:3837`）+ post-SS2(a) header（`:5`）+ receipt `claimsForbidden`（`:4156`）已把 label 语义诚实框定为 code-path label ≠ product stack truth；PG 容器横幅对产品真相的**方向性误导已在字符串层根除**，残留只是「诚实框定下的时代错位命名」，非说谎面。
3. **谱系自洽**：SS2 §2(b) 已预判此局面并预留复活路径（新 REQUEST + 授权拆分 + prove 回归计划）——本卷即该新 REQUEST；裁决 docs 钉刀 = 对 SS2 预判的执行态确认，方案 b 不灭只冻（§4 预登）。

docs 钉刀执行形态：本卷即收口登记面（§5）；可选（若双审放行）在 `adr-postgres-retained.md:39` 后 append-only additive bullet 一条（既有受管文件行内编辑 · +0 受管计面）；**零 scripts 产品面触碰**。

## 3. 流程（若双审 + 协调方放行 docs 钉刀）

1. 本 commit：docs-only REQUEST（harness isob-REQUEST.md + cap 计数预算恰等步进两 policy 件，见 §6）。
2. 预执行双审：`mw-e2e-ha` + `mw-privacy-int` **BOTH PASS**（alone ≠ dual · Ban self-approve）。
3. 协调方显式授权 → 执行形态按 §2 末段行使（默认仅本卷登记；ADR bullet 须双审显式放行方可 append）。
4. post docs supplement + post 双审 + nail **另起**；backlog `:63` 行状态/行文只在彼时、只按彼时授权动。

## 4. 方案 b 复活路径预登（不预判翻案 · 若未来启动须全数具备）

① §1.4A 恰 4 件标识符扫描 prove 同步改写授权（g1/g3/g7/qdrant-backed）；② §1.4B 值级合同同步（package.json 5 alias、g3 spawn 值 3 处、r5-mark-red 值门 3 处、adapter 值门、sole-wiring 自持值）；③ receipt 值迁移策略（历史收据 append-only Ban 改写 → 新旧值并存期 `parseSoleStack` 双读兼容）；④ §1.3 同族 SOLE_ 前缀 3 组标识符一并裁决是否改名；⑤ 全量 prove 回归计划（基线红/绿逐项台账）；⑥ backlog `:63` 翻转另授权。缺一即不得开工。

## 5. GAP 收口注记（docs 钉刀本体）

**命名语义现状一句话**：`SOLE_STACK` = 隔离壳双轨制下 MySQL+Qdrant+Redis **历史本地原型轨**的 code-path label（值 `'mysql-qdrant-redis'`，标识符名沿 sole 时代旧语义），**≠ 产品栈真相**；产品栈钉 = `ai-docs/delivery/adr-postgres-retained.md:9-11`（Postgres · PostgresSaver · pgvector retained）；runtime 消费面（banner `:3837` / header `:5` / receipt `claimsForbidden` `:4156`）均已诚实框定。**GAP-E2E-ISO-BANNER-PG-RETAINED 剩余开放面 = 标识符命名层残留**（backlog `:63` stays OPEN），收口 = 本卷登记 + 未来方案 b 专刀（若启动，须过 §4 六门）。

**横幅判读双 Ban（延续 ADR `:39` 语义）**：收据/审查**不得**引用 PG 容器横幅（`:4214` / `:3836-3848`）作 stack truth；亦**不得**引用作 cutover 证据——隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据。

## 6. cap 预算核 + 零重叠核 + est live

- **cap 预算核（届值亲跑）**：基线 docs:check EXIT=0「public text policy scanned **2441** managed worktree files」= `scripts/ai-docs/public-text-policy.mjs:244` `MAX_FILES = 2_441` **恰等零余量**（亲证）。本卷 +1 受管（`harness/isob-REQUEST.md`）= 2442 必超（`PTP_FILE_LIMIT:2442>2441` 形）→ 沿派单常设预授权「越限沿先例步进承登预授权」**恰等步进 2441→2442 随本 commit 预登**：四联动点 = policy `:244` `2_442` + proof 越限臂 `:429` `i < 2_442` / `:436` `scannedFiles, 2_442` / `:439` `f-2442.md` / `:442` `FILE_LIMIT:2443`，双链区 CAP-SANCTION-2442 注记各一条；沿 CAP-SANCTION-2429（rcload 起草）/2433（perf2 起草·总盘小刀 #12-13）起草随刀恰等先例形，**+1 零多放**·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减。EXEC 期预计 **+0** 受管计面（ADR bullet 为既有受管文件行内编辑；收据 `.log` ∉ TEXT_EXTENSIONS 不计）→ 届终 2442 = cap 恰等。
- **零重叠核**：`harness/` 无既有 `isob*` 件（git ls-files 全树零命中 · 文件名唯一）；在飞 worktree 43 个中与本刀同 tip（`2818c252`）者唯 `line/uc3f-draft`（0 commits ahead 尚未落卷 · 派单域 UC-003 后继与本刀触面零交）；本刀零触碰 `run-e2e-isolated.mjs`、§1.4 全部 prove 面与 receipt 族；policy 两件 cap 注记区若遇并线冲突沿 dual-keep 双留取大先例（CAP-SANCTION-2430 注记在案）。
- **est live=0**：本 commit 与本刀全生命周期零 e2e / 零 prove 运行 / 零 docker / 零 live key / 零模型调用；门 = 三静态门（本地 node 脚本 + grep，§7）。

## 7. 门与验收判据（本 commit 亲跑原值 + post 双审机检预告）

- **基线原值（改动前亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（scanned 2441）· `node scripts/ai-docs/public-text-policy.proof.mjs` **EXIT=0**（12/12 · `static_preflight_valid: selected=12/12; releaseEvidence=false`）· markers 全仓 grep（`^<<<<<<< ` / `^=======$` / `^>>>>>>> `）**EXIT=1** 零命中。
- **本 commit 后**：docs:check **EXIT=0**（scanned 2442 = 新 cap 恰等）· PTP **EXIT=0**（12/12）· markers **EXIT=1** 零命中。任何新增红 = 红停上报，Ban retry-to-green。
- **diff 面（如实）**：恰 3 tracked = `ai-docs/delivery/harness/isob-REQUEST.md`（新增）+ `scripts/ai-docs/public-text-policy.mjs`（cap const + 注记）+ `scripts/ai-docs/public-text-policy.proof.mjs`（越限臂 + 注记）；零其他。
- **验收**：本卷 §1 file:line 与 tip `2818c252` 亲点一致；§2 裁决含三理由；§8 Ban 全数在卷；`run-e2e-isolated.mjs` / `adr-postgres-retained.md` / backlog / matrix / checklist 本 commit 零 diff。

## 8. Ban（逐条）

1. **Ban coding**：零 scripts 产品面触碰——`run-e2e-isolated.mjs`、§1.4A 四 prove、§1.4B 值级合同、receipt 族、`uc018-perf-load-capped-child.mjs` 本刀零 diff（cap 计数预算联动两 policy 件除外，其属常设预授权机制面非产品面）。
2. **Ban 方案 b 常量改名**（const 值与标识符名均不动）：复活须另立 REQUEST + 授权拆分 + prove 回归计划（§4 六门）。
3. **Ban SSOT edit**：backlog `:63` 行状态与行文零改（stays OPEN）· matrix · execution-master-checklist 零触碰。
4. **Ban 改 `adr-postgres-retained.md` Decision 本体**（L7-14 逐字不动）；可选 bullet 仅 `:39` 后 append-only additive，且须双审显式放行。
5. **Ban 触碰 `E2E_ISO_STACK_NOTE`（`:4215-4218` narration-only · Line N 钉死）** 与 `receipts/` 332 件历史日志（append-only）。
6. **Ban prove / e2e / docker / push / force-push / self-approve / secrets / `.env*`**；三门有红即红停上报，Ban retry-to-green · Ban 选择性汇报。
7. **Ban 把本刀写成 sole cutover / MySQL 切流暗示**；Pins 八项冻结；本 REQUEST ≠ nail ≠ gap 关闭 ≠ HA ≠ releaseEvidence。

## 遗留（非本刀范围）

- 若双审判 EXEC 改名（方案 b）必要：本 REQUEST 撤回 §2 裁决、按 §4 拆分另立，本卷退化为登记卷。
- backlog `:63` 行文滞后（「仍写 intended sole」vs post-AL banner 现文）——行文勘误属 SSOT 另授权。
- 行号漂移常态化（SS2 `:1845` → 现 `:3746`；ADR `:39` 引 `L2139/L2141` → 现 `:4214/:4216`）：执行/审查阶段一律按**文本锚**定位，基线行号仅为参考。
- 远端 tip 前进时 rebase 后再入双审；policy cap 注记区冲突沿 dual-keep 取大先例。

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

*Harness · GAP-E2E-ISO-BANNER-PG-RETAINED SOLE_STACK 命名语义收口任务书 · draft:awaiting_pre_exec_dual · docs 钉刀 · ≠ sole cutover · 零产品行为变更 · STOP*
