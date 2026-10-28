# Harness — **GAP-E2E-ISO-BANNER-PG-RETAINED · SOLE_STACK 命名语义收口任务书**（Line ISOB · docs REQUEST · **`closed`** · docs 钉刀 · 零产品行为变更）

**Status**: **`closed`**（dual r1 双 PASS 放行 + 协调方显式授权 EXEC 落卷 · 修订 r1 逐条随落 · rev r2 回炉修订随落（post 双审双 FAIL·互盲同判 P1·§0.0.1/§9）·§9 承登 · EXEC commit 零 e2e / 零 docker / 零 live key / 零模型调用（门=三静态门 + A 层 prove 抽验四件本地 EXIT 核·§7）· Ban self-approve · Ban coding · Ban push）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503
**Date**: 2026-10-26
**Base / parent tip**: 起草基线 `origin/main` **`2818c252`** / full `2818c2522a4d5003fb4f9a888c9fa67e7881adc9`（#176·docs tip · not a prove tip · fetch EXIT=0）→ **EXEC 立项并线届值如实采重 pin**：`origin/main` **`33fdd233`** / full `33fdd233c4069942569b12b40a95fc05ff448de2`（#173 xrep 合卷已落·含 #178 uc15f 合卷 `91aca39bf` + XREP 二轮 CAP-SANCTION-2445 步进 `9047aefdc` 在前·fetch EXIT=0）·merge **`f76e05751`**（dual-keep 恰 2 处冲突·cap 取大恒 2_445·union 实测与步进见 §6）
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

### 0.0.1 回炉修订 rev r2（post 双审双 FAIL · 互盲同判 P1 裁决 · 2026-10-26）

- **post 双 FAIL 分歧**：EXEC 落卷后 post 双审两席（互盲）均 FAIL——席1 P1×1+P2×3 / 席2 P1×2+P2×3（分歧在 P1 计数与 P2 面拆分·非在 P1 定性）。
- **同判 P1 裁决**：两席互盲同判交叉印证＝**§9 门实测记录对 g7 失实**——g7 EXIT=3 内含 1 条**先在未承登断言红**（`:27` 钉 `g7-sole-fixture-retire-scor00.md` 已被 ptp-archive `426e0b281` git mv 迁往 `receipts/archive/2026-09-batch23/harness/`·proof 常量未随迁 → missing FAIL·`:40` prereq() 把 exit 1 掩码为 3）·「PREREQ 臂非断言红 / 26 项全过 / 与 r5-mark-red 异质」三处申报失实 → 协调方裁决**两席修订清单全采纳**（P1×3＝清单①②③·P2×5＝清单④⑤⑥⑦⑧）·checklist 补登沿 documented-red 承登先例形 additive 登记·**Ban 翻转既有行**。
- **清单索引（rev r2 八条）**：① §9:168 g7 三处改登+陷阱注记（**[P2 微勘·post 复审席 P2-A/P2-B 登记·证面冻结零触]** 该「§9:168」系 r1 修订前位置锚·r2 落卷后现址 `:175`；**[P2-B]** §7/§9 所登 qb 75/0/3 两复审席未独立复跑·抽验余量如实注记）；② checklist `:1255` r5-mark-red 条目紧邻 additive 补登 g7 先在红（裁决授权的 SSOT additive 例外）；③ §7/§9 prereq-override 型门抽验方法条款+两件复跑机检数字落卷；④ §6 r5mr 第三线「三线同号」+并线序届值重排；⑤ §6/§9 policy 注记位 `:256`→`:254`+§1 行锚标注；⑥ §9 背书范围收窄（g1/g3 限 runner SOLE_STACK 锚点/禁项/allowlist/G3 行为臂·ADR 词面覆盖主体=docs:check+uc018-sole assertPins）；⑦ §9 A/B 复核注记（对照实验零留痕·两席独立复现同值承登）；⑧ 即本小节。STOP 三处维持 `executed:awaiting_post_prove_dual`（回炉后待 post 复审）。

## 1. 产品面侦察（只读取证 · file:line 全引 · 基线 tip `2818c252` 实读；SS2 时代行号 `:1845-1848` 已因 tip 前进漂移，现址如下）**[rev r2 行锚标注]**：本节 file:line 均为**起草基线值（并线后漂移**——如 `:3746` SOLE_STACK 定义并线后现址 `:3798`·漂移 +52 亲证**）·定位一律按文本锚优先，基线行号仅为参考**

### 1.1 常量现形（`scripts/run-e2e-isolated.mjs`）

- `:3740`　`const container = \`meetwise-e2e-${process.pid}-${Date.now()}\`;` —— 一次性 PG 容器名本体**中性**（`meetwise-e2e-*` 前缀，无 sole 词面）；陈旧语义不在容器名，在横幅与常量词面（§1.2）。
- `:3741`　`const LEGACY_PG_IMAGE_DEFAULT = 'pgvector/pgvector:pg16';`（legacy 轨默认图，G3 注释 UNCHANGED）。
- `:3746`　`const SOLE_STACK = 'mysql-qdrant-redis';` ← **词面本体**。
- `:3747`　`const LEGACY_STACK = 'pgvector-legacy';`
- `:3749`　`const SOLE_APPROVED_FIXTURE_CONFIG = 'compose.mysql-local';`
- `:3767`　`const SOLE_WIRING_ALLOWLIST`（恰 5 target）· `:3774`　`const SOLE_WIRING_PREREQS`（6 条）——同族 SOLE_ 前缀标识符。
- `:5`　文件头注释（post-SS2(a) 措辞）：`Sole-track code-path label: SOLE_STACK='mysql-qdrant-redis' is a dual-track isolation label ≠ product stack truth; product stack pin = ai-docs/delivery/adr-postgres-retained.md …`。

### 1.2 「PG 容器横幅」词面现形（张力本体）

- `:3835-3848`　R5-MARKED-RED 横幅块（legacy pgvector disposable PG 容器路径，分支入口 `:3835` `isolationStack === LEGACY_STACK`）：`:3837` 文案 `(dual-track; SOLE_STACK=${SOLE_STACK} is a dual-track code-path label ≠ product stack truth)` + `:3838-3839` 指向 ADR。**陈旧语义 = 标识符名「SOLE_STACK（唯一栈）」+ 值 `'mysql-qdrant-redis'` 在 PG-retained ADR（Postgres · PostgresSaver · pgvector retained）下的时代错位**；runtime 已由 post-AL banner + post-SS2(a) header 诚实框定，唯名面残留——即 backlog `:63` 「SOLE_STACK 对齐另包」所指剩余开放面。
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
| `:3808` / `:3809` | 文案 | `[R5-DUAL-TRACK]` allowlist 拒绝文案两行（分支入口 `:3806` → EXIT=3·EXEC 行号勘误 `:3806→:3808` 补 `:3809`） |
| `:3826` | 文案 | `[R5-SOLE-WIRING]` 放行横幅 |
| `:3837` | 文案 | R5-MARKED-RED 横幅（§1.2 张力本体） |
| `:4103` | **分支入口** | sole env 注入分支（无 disposable PG 容器） |
| `:4106` | **env 值** | 子进程 `E2E_ISOLATION_STACK: SOLE_STACK`（`:4107` 同步注入 fixture env） |
| `:4144` | **receipt 值** | `stack: SOLE_STACK` 写入 `class='local_untrusted_sole_stack_allowlist_receipt'`（`:4143` class · `:4156` claimsForbidden · `:4174` stdout 收据行） |
| `:4183` / `:4185` / `:4186` | **分支入口** / 文案 | G3 defense-in-depth 拒 docker-run（`:4183` 独立列＝分支入口 → EXIT=3·文案 `:4185`/`:4186`·EXEC 行号勘误 `:4185→:4185/:4186`） |

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
| `scripts/conn-stack/mysql-stack.r5-mark-red.proof.mjs:109, :133, :191-193` | 值字面量三重扫描门（根 `scripts/mysql-stack.r5-mark-red.proof.mjs` 为 forwarder 同红）· **先在红补注（EXEC 承登）**：`:182-184` 门锚 `/NOT sole-stack truth/` 对 post-AL 现横幅文（`is a dual-track code-path label ≠ product stack truth`·Line AL `c633584` 改串遗留）不匹配＝**documented-red**（execution-master-checklist `:1255` 承登在案·非本刀引入·本刀零触碰该 prove·修复＝改 prove 扫描正则须另刀授权——协调方已另授权 r5-mark-red 修复刀在途·本卷登记指针） |
| `packages/qdrant-store/test/qdrant-vectorstore-adapter.proof.ts:131` | `/pgvector-legacy/ && /mysql-qdrant-redis/` 值扫描 |
| `scripts/conn-stack/mysql-stack.sole-wiring.proof.mjs:34` | 自持 `const STACK = 'mysql-qdrant-redis'` 读 env 匹配 |
| receipt 值族 | `scripts/lib/uc-covered-real-gatherer.mjs:42, :227-229, :253-254`（`parseSoleStack` 值解析）· `scripts/uc018-receipt-backfill-emit.mjs:174-176`（backfill 发射 `soleStack`）· `scripts/uc-e2e-018-covered-criterion.proof.mjs:630`（`delete j.soleStack`） |

env **名**面（仅当 env 改名才涉及，const 改名不触）：`scripts/uc018-perf-load-capped-child.mjs:114` 透传白名单含 `E2E_ISOLATION_STACK`。

**C. 文档/收据引用面（非运行时耦合 · 不随码改断）**：`ai-docs/` **82 件**引用 SOLE_STACK 词面（含 `adr-postgres-retained.md:39` residual 点名、`harness/gap-sole-stack-align.md`、coverage matrix、backlog）；`receipts/` **332 件**历史日志含词面——**append-only · Ban 改写**。

### 1.5 backlog `:63` 登记原文（亲读）

> `| GAP-E2E-ISO-BANNER-PG-RETAINED | P1 | run-e2e-isolated.mjs R5-MARKED-RED banner 仍写 MySQL+Qdrant+Redis 为 intended sole · ≠ adr-postgres-retained 真相 | 收据/审查 不得 引用该 banner 作 stack truth；SOLE_STACK 对齐另包 | e2e / privacy | Line B N1 · named gap | adr-postgres-retained.md；scripts/run-e2e-isolated.mjs |`

行文「仍写…intended sole」相对 post-AL banner 现文（`:3837` 已改为 code-path label 措辞）**已滞后**，但行状态 stays OPEN 是 N/AL nail 与 SS2 conditions（C-SS2P「backlog `:63` 翻转须另立授权」）三重钉死——**行文勘误与行状态翻转均属 SSOT 另授权，本刀 Ban（§8-3）**。

### 1.6 方案 b 复活力语义（亲点复核）

SS2 §2(b) 自评（tip `50423a6f` 时点）：利「命名层最大诚实」；弊「blast radius 覆盖 ≥5 个已注册 prove 的扫描门与 spawn 合同，任何一步不同步即红」+「需要 coding+prove 全量授权，远超 docs 刀形态」。**本 tip `2818c252` 亲点复核**：标识符锚定 prove 恰 4 件（§1.4A）、值级合同 ≥6 面（§1.4B）、receipt 值解析 1 族、同族 SOLE_ 前缀标识符 3 组（§1.3）——爆炸半径在 `50423a6f` → `2818c252` 间**未缩小**（g7 `:114`、qdrant-backed `:274` 均现行在飞门）。复活力 = 名面残留仍在（backlog `:63` OPEN）；复活成本 = 未降反稳。**基线含一件 documented-red 门**：§1.4B r5-mark-red `:182-184` `/NOT sole-stack truth/`（checklist `:1255` 承登在案·修复刀协调方另授权在途·本卷登记指针）——方案 b 全量回归台账（门⑤）须将该先在红单列，Ban 冒领修复、Ban 以其冒充方案 b 新增红。

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
5. **[R5 nail 时另授权事项预登]**：execution-master-checklist 本刀条目落笔时**显式携 freeze 指针**（本卷 executed 态 commit hash + STOP 三钉位置：标题/Status/尾注）**与 §4 六门位置**（①—⑦ 复活门全清单·含第⑦观察门）——两指针缺一即补登，Ban 空引、Ban 只引「见 REQUEST」不带 §4 定位。

## 4. 方案 b 复活路径预登（不预判翻案 · 若未来启动须全数具备）

① §1.4A 恰 4 件标识符扫描 prove 同步改写授权（g1/g3/g7/qdrant-backed·授权主体＝双审+协调方显式授权·alone ≠ dual）；② §1.4B 值级合同同步（package.json 5 alias、g3 spawn 值 3 处、r5-mark-red 值门 3 处、adapter 值门、sole-wiring 自持值）；③ receipt 值迁移策略（历史收据 append-only Ban 改写 → 新旧值并存期 `parseSoleStack` 双读兼容）；④ §1.3 同族 SOLE_ 前缀 3 组标识符一并裁决是否改名（授权主体＝双审+协调方显式授权）；⑤ 全量 prove 回归计划（基线红/绿逐项台账·§1.4B r5-mark-red 先在红单列）；⑥ backlog `:63` 翻转另授权（授权主体＝双审+协调方显式授权·**另需 nail 层 SSOT 授权**）；⑦ ai-docs 82 件词面引用面同步观察门（§1.4C·非阻断观察：方案 b 落卷时 82 件词面引用逐一同步或显式豁免登记·观察结果随 post 双审卷承登）。缺一即不得开工。

## 5. GAP 收口注记（docs 钉刀本体）

**命名语义现状一句话**：`SOLE_STACK` = 隔离壳双轨制下 MySQL+Qdrant+Redis **历史本地原型轨**的 code-path label（值 `'mysql-qdrant-redis'`，标识符名沿 sole 时代旧语义），**≠ 产品栈真相**；产品栈钉 = `ai-docs/delivery/adr-postgres-retained.md:9-11`（Postgres · PostgresSaver · pgvector retained）；runtime 消费面（banner `:3837` / header `:5` / receipt `claimsForbidden` `:4156`）均已诚实框定。**GAP-E2E-ISO-BANNER-PG-RETAINED 剩余开放面 = 标识符命名层残留**（backlog `:63` stays OPEN），收口 = 本卷登记 + 未来方案 b 专刀（若启动，须过 §4 六门）。

**横幅判读双 Ban（延续 ADR `:39` 语义）**：收据/审查**不得**引用 PG 容器横幅（`:4214` / `:3836-3848`）作 stack truth；亦**不得**引用作 cutover 证据——隔离测试 PG ≠ 产品栈变更 ≠ cutover 证据。

## 6. cap 预算核 + 零重叠核 + est live

- **cap 预算核（届值亲跑·[P1] EXEC 全面重导如实改登）**：起草时基线 docs:check EXIT=0「public text policy scanned **2441** managed worktree files」= `scripts/ai-docs/public-text-policy.mjs` `MAX_FILES = 2_441` **恰等零余量**（亲证）→ 起草随刀预登 2441→2442（CAP-SANCTION-2442 注记在案·沿 CAP-SANCTION-2429/2433 起草随刀先例形）。**[P1] EXEC 立项并线届值如实采（禁止按预登 2442 行使·预登作废重导）**：fetch EXIT=0·origin/main `33fdd233`=#173 xrep 合卷已落（含 #178 uc15f 合卷 `91aca39bf`+XREP 二轮 CAP-SANCTION-2445 步进 `9047aefdc` 在前·起草预登时 anticipated #178 届值 2443 已被 #179 推移·如实采新届值）承 **2445**=cap 恰等·merge `f76e05751` dual-keep 恰 2 处冲突（两 policy 注记/cap 区·本支 CAP-SANCTION-2442 注记+main CAP-SANCTION-2443 双注记（XREP+UC-015）/2445 注记并留·号随 merge-tree 重排）·cap 取大恒 2_445 零再步进·合并树终验亲跑 docs:check **`PTP_FILE_LIMIT:2446>2445` 红（真 EXIT=1 亲证）**——union 实测 **2446**=main 届扫 2445+本支并入互斥受管目 1（`harness/isob-REQUEST.md`·两集合无交叠）→ 常设预授权「union 越限沿常设预授权恰等步进免再询」随令**恰等步进 2445→2446**：四联动点 = policy `:255` `MAX_FILES = 2_446` + proof 越限臂 `:438` `i < 2_446` / `:445` `scannedFiles, 2_446` / `:449` `f-2446.md` / `:452` `FILE_LIMIT:2447`，双链区 CAP-SANCTION-2446 注记各一条（policy `:254` / proof `:436`·[rev r2 行号勘误] 起草注 `:256` 系并线后漂移前值·现址亲证 `:254`）；**+1 零多放**·计数预算非内容策略·越限臂 fabricated 数随 cap 联动同步·语义不变强度不减→ 届终 2446 = cap 恰等（docs:check EXIT=0 scanned 2446 亲证）。EXEC 期 **+0** 受管计面（ADR bullet 为既有受管文件行内编辑；零新 proof 零收据件·`.log` ∉ TEXT_EXTENSIONS 不计）。
- **零重叠核**：`harness/` 无既有 `isob*` 件（git ls-files 全树零命中 · 文件名唯一）；在飞 worktree 43 个中与本刀同 tip（`2818c252`）者唯 `line/uc3f-draft`（0 commits ahead 尚未落卷 · 派单域 UC-003 后继与本刀触面零交）；本刀零触碰 `run-e2e-isolated.mjs`、§1.4 全部 prove 面与 receipt 族；policy 两件 cap 注记区若遇并线冲突沿 dual-keep 双留取大先例（CAP-SANCTION-2430 注记在案）。**[P1] 零重叠核失真补登（EXEC 如实承登·协调方裁决）**：上记「`line/uc3f-draft` 尚未落卷·触面零交」至 EXEC 并线时点已失真——uc3f 同基同刻落卷＝#178 uc15f 合卷（`91aca39bf`）已入 main，其 EXEC 面触恰同一对 policy 文件，且同号预登失真面按 [rev r2] 如实扩登为**三线同号**：uc3f `89f465776`（已 EXEC）/ isob 本卷（已 EXEC）/ r5mr `2157c2558`（预登·STOP=`draft:awaiting_pre_exec_dual`）三线均 **2445→2446 承 CAP-SANCTION-2446**（起草时点 uc3f/isob 两卷同号预登 CAP-SANCTION-2442 为其前形·史录保留）；并线 merge `f76e05751` 按协调方裁决 **dual-keep 双留+号随 merge-tree 重排**（uc15f 注记随其并线已重排为 CAP-SANCTION-2443 双注记·本支 2442 注记保留史录·本刀新步进承 CAP-SANCTION-2446）·**并线序按届值如实采各 +1 重排**（isob 先并承 2446·uc3f/r5mr 依次并线时各按届值实测 +1 顺延重排·Ban 同号撞册·沿号随 merge-tree 重排先例）；REQUEST 触面仍零交（uc15f 面=`uc15f-REQUEST.md`+`nhp-fault` proof·本刀面=`isob-REQUEST.md`）——零重叠结论对 REQUEST 面成立、对 policy 两件不成立，如实分记。
- **est live=0**：零 e2e / 零 docker / 零 live key / 零模型调用；门 = 三静态门（本地 node 脚本 + grep，§7）+ EXEC 期协调方工序增派 A 层 prove 抽验四件（g1/g3/g7/qdrant-backed·本地 node EXIT 核·stdout 即弃·零新 proof 零新收据件）；docs:check / PTP 属静态门不计 prove。

## 7. 门与验收判据（本 commit 亲跑原值 + post 双审机检预告）

- **基线原值（改动前亲跑）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**（scanned 2441）· `node scripts/ai-docs/public-text-policy.proof.mjs` **EXIT=0**（12/12 · `static_preflight_valid: selected=12/12; releaseEvidence=false`）· markers 全仓 grep（`^<<<<<<< ` / `^=======$` / `^>>>>>>> `）**EXIT=1** 零命中。
- **本 commit 后（[P1] 届值重导后 EXEC 实测预期）**：docs:check **EXIT=0**（scanned **2446** = 新 cap 恰等·§6）· PTP **EXIT=0**（12/12）· markers **EXIT=1** 零命中 · **A 层 prove 抽验四件 EXIT 核**（`g1-default-switch-prep` / `g3-e2e-pg-image` / `g7-scor00-sole-fixture` / `conn-stack/mysql-stack.qdrant-backed`·本地 node EXIT 核·stdout 即弃·先在红 r5-mark-red 不在抽验面且其 documented-red 状态不因本刀改变）。任何新增红（非先在红 documented-red）= 红停上报，Ban retry-to-green。
- **[rev r2 P1] prereq-override 型门抽验方法条款**：凡 prereq() 有 1→3 覆盖语义之门（如 g7 `:40`·EXIT=3 可掩断言红 1）·「EXIT 核」**Ban 再以 EXIT=3 单值断言「非断言红」**·须附 FAIL/PREREQ 行数机检（`grep -c '^FAIL'`==0 或 FAIL/PREREQ 行数逐一报数·`.log` 不计 cap 可留痕）——本刀两件复跑机检数字落卷：g7 `grep -c '^PASS'`=**26** / `grep -c '^FAIL'`=**1** / `grep -c '^PREREQ'`=**3**（＝2 臂行+尾行终态汇总 1 条非 prereq() 臂·臂行＝compose missing MySQL/Qdrant·Redis 63809 本机在起）·qdrant-backed `grep -c '^PASS'`=**75** / `grep -c '^FAIL'`=**0** / `grep -c '^PREREQ'`=**3**（全臂行）——EXIT 与行数双核一致方为有效抽验（详 §9）。
- **diff 面（如实）**：EXEC commit 恰 4 tracked = `ai-docs/delivery/harness/isob-REQUEST.md`（修订落卷）+ `scripts/ai-docs/public-text-policy.mjs`（cap const 2_446 + CAP-SANCTION-2446 注记）+ `scripts/ai-docs/public-text-policy.proof.mjs`（越限臂四联动点 + 注记）+ `ai-docs/delivery/adr-postgres-retained.md`（[R4] 放行 bullet·`:39` 后 append-only）；并线 merge `f76e05751` 单列（dual-keep 恰 2 policy 件·union 件随 origin/main 合入）；零其他。
- **验收**：本卷 §1 file:line 与起草 tip `2818c252` 亲点一致（EXEC 行号勘误四处如实注记：`:3806→:3808+:3809`·`:3836→:3835`·`:4183` 独立列·`:4185/:4186`；行号漂移按文本锚定位）；§2 裁决含三理由；§8 Ban 全数在卷；`run-e2e-isolated.mjs` / backlog / matrix / checklist 本 commit 零 diff·`adr-postgres-retained.md` 仅 `:39` 后 [R4] 放行 bullet 一条（Decision 本体 L7-14 逐字零改）。

## 8. Ban（逐条）

1. **Ban coding**：零 scripts 产品面触碰——`run-e2e-isolated.mjs`、§1.4A 四 prove、§1.4B 值级合同、receipt 族、`uc018-perf-load-capped-child.mjs` 本刀零 diff（cap 计数预算联动两 policy 件除外，其属常设预授权机制面非产品面）。
2. **Ban 方案 b 常量改名**（const 值与标识符名均不动）：复活须另立 REQUEST + 授权拆分 + prove 回归计划（§4 六门）。
3. **Ban SSOT edit**：backlog `:63` 行状态与行文零改（stays OPEN）· matrix · execution-master-checklist 零触碰。
4. **Ban 改 `adr-postgres-retained.md` Decision 本体**（L7-14 逐字不动）；可选 bullet 仅 `:39` 后 append-only additive，且须双审显式放行。
5. **Ban 触碰 `E2E_ISO_STACK_NOTE`（`:4215-4218` narration-only · Line N 钉死）** 与 `receipts/` 332 件历史日志（append-only）。
6. **Ban prove / e2e / docker / push / force-push / self-approve / secrets / `.env*`**；三门有红即红停上报，Ban retry-to-green · Ban 选择性汇报。
7. **Ban 把本刀写成 sole cutover / MySQL 切流暗示**；Pins 八项冻结；本 REQUEST ≠ nail ≠ gap 关闭 ≠ HA ≠ releaseEvidence；STOP 状态钉三处（标题 `:1` / Status `:3` / 尾注末行·第三处状态钉）EXEC 三处同翻 `executed:awaiting_post_prove_dual`·Ban 漏翻尾注第三钉。

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

## 9. EXEC 落卷承登（dual r1 修订逐条 + rev r2 回炉修订 · 2026-10-26）

- **并线**：fetch EXIT=0 → merge `f76e05751`=merge origin/main `33fdd233`（届值如实采·恰 2 处冲突=两 policy 注记/cap 区·dual-keep 双留+号随 merge-tree 重排·cap 取大恒 2_445）→ 合并树 docs:check 红 `PTP_FILE_LIMIT:2446>2445`（真 EXIT=1 亲证·union 实测 2446）→ `pnpm install --frozen-lockfile` EXIT=0。
- **修订逐条落点**：[P1] cap 重导 2446 恰等→§6 + 两 policy 四联动点/CAP-SANCTION-2446 双注记（policy `:255`/`:254`·proof `:436`/`:438`/`:445`/`:449`/`:452`·[rev r2 行号勘误] policy 注记位起草注 `:256` 系漂移前值·现址亲证 `:254`）；[P1] uc3f 同号双预订失真→§6 零重叠补登；[P2] r5-mark-red documented-red 先在红→§1.4B 行内补注+§1.6 补「基线含一件 documented-red 门」+§7 抽验面注记；[P2] §4 门①④⑥授权主体显式指名（⑥ 另需 nail 层 SSOT 授权）+第⑦门增补；[R4] ADR bullet→`adr-postgres-retained.md:39` 后 append-only 一条；[P2] 行号卫生→§6 policy `:255`/proof 现行值·§1.3 表 `:3808/:3809`+`:4183` 独立列+`:4185/:4186`·§1.2 `:3835`·§8 第三处状态钉；[R5 预登]→§3 第 5 条。
- **门实测（亲跑原值·stdout 即弃·零新 proof 零收据件）**：docs:check EXIT=**0**（scanned **2446** = cap 2446 恰等）· PTP EXIT=**0**（**12**/12 · `static_preflight_valid: selected=12/12; releaseEvidence=false`）· markers 全仓 grep EXIT=**1**（零命中）· A 层 prove 抽验四件：g1 EXIT=**0** / g3 EXIT=**0** / g7 EXIT=**3**（**[rev r2 三处改登]** 性质＝**PREREQ（sole compose 未起）+ 先在断言红 1 条**：`scripts/g7-scor00-sole-fixture.proof.mjs:27` 钉 `ai-docs/delivery/harness/g7-sole-fixture-retire-scor00.md` 已被 ptp-archive `426e0b281` git mv（R100）迁往 `receipts/archive/2026-09-batch23/harness/`·proof 常量未随迁 → missing FAIL·`:40` prereq() 把 exit 1 掩码为 3（基线 A/B 同 FAIL 亲证）·机检 **26 PASS+1 FAIL+2 PREREQ 臂行**+14 条 harness 文档钉被 `:71` existsSync 跳过；该红**与 r5-mark-red documented-red 同种（陈旧锚断言红）**——r5-mark-red 已承登在案（checklist `:1255`）·**g7 此红先在全仓未承登**（rev r2 补登入 checklist·§0.0.1 清单②）·**陷阱注记**：compose 起后 prereq() 不触发·exitCode 停 1·g7 将显形 EXIT=1） / qdrant-backed EXIT=**3**（同性质＝Qdrant `/readyz` PREREQ 拒 fake-green·非 §1.4A 复合扫描门红·机检 75 PASS+**0 FAIL**+3 PREREQ 全臂行）——g7/qdrant-backed 两 EXIT=3 已 **A/B 亲证先在**：临时 worktree `362b97f5c`（起草基线·本刀零触碰态）同跑同 EXIT=3·**[rev r2 A/B 复核注记]** 该对照实验零留痕（stdout 即弃·无收据件）·post 双审两席独立复现同值承登·非本刀引入·非停止条件所指断言红；扫描内容面背书**收窄**：g1/g3 EXIT=0 仅背书 **runner `SOLE_STACK` 锚点/禁项/allowlist/G3 行为臂**·ADR 词面影响面覆盖主体＝docs:check + `uc018:sole:prove` assertPins（`scripts/uc-e2e-018-sole-stack-pg-retained.proof.mjs:62`·并登记 **uc018-sole 先在红**（同 ptp-archive 迁移遗留 missing-harness 类·EXIT=1 亲证）**不在本刀抽验面**）。
- **STOP 三处翻**：标题 `:1` / Status `:3` / 尾注末行 三处同翻 `draft:awaiting_pre_exec_dual` → `executed:awaiting_post_prove_dual`。
- **零码面核验**：`run-e2e-isolated.mjs`·§1.4A 四 prove·§1.4B 值级合同·receipt 族·`uc018-perf-load-capped-child.mjs` 本刀零 diff（两 policy 件属常设预授权机制面）；backlog `:63`/matrix/checklist 零触碰；Decision 本体 L7-14 逐字零改。
- **[rev r2 回炉承登]**（修订逐条落点·索引见 §0.0.1）：① g7 三处改登→§9 门实测（上条）；② g7 先在红补登→checklist `:1255` r5-mark-red 条目紧邻 additive 一条（**裁决授权的 SSOT additive 例外**·Ban 翻转既有行）；③ prereq-override 型门机检条款→§7 新增 bullet+§9 两件复跑数字落卷（g7 26/1/2 臂+1 尾·qb 75/0/3）；④ r5mr 第三线三线同号→§6 零重叠核；⑤ `:256`→`:254` 勘误两处→§6/§9+§1 行锚标注；⑥ 背书收窄→§9 门实测末段；⑦ A/B 复核注记→§9 门实测；⑧ §0.0.1 本小节。回炉亲跑核验：g7 复跑 EXIT=3（26 PASS+1 FAIL+2 PREREQ 臂）·qb 复跑 EXIT=3（75 PASS+0 FAIL+3 PREREQ）·uc018-sole 亲证 EXIT=1（10 FAIL missing-harness 类·不在抽验面）·`:27` 钉文档 `git cat-file` 现址仅存 `receipts/archive/2026-09-batch23/harness/`·`426e0b281` R100 亲证。STOP 三处维持 `executed:awaiting_post_prove_dual`。

---

*Harness · GAP-E2E-ISO-BANNER-PG-RETAINED SOLE_STACK 命名语义收口任务书 · closed · docs 钉刀 · ≠ sole cutover · 零产品行为变更 · STOP*
