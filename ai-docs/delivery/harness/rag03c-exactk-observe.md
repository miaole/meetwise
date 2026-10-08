# Harness — **RAG03-C · GAP-RAG-03 exact-K fill 观察刀**（合法非退化夹具真实验证 HNSW 候选返回与 exact-K fill · 多结局诚实 · docs REQUEST · `draft:awaiting_pre_exec_dual` · ≠ 修复 ≠ 关 `:71` ≠ production HNSW SLO）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · 本 turn Ban coding · Ban prove 执行 · Ban 实跑 · Ban live · **Ban 碰夹具/产品码/proof**（夹具改动属 EXEC 面·本 REQUEST §4 列明交双审）· Ban fake green · **Ban 假关 `:71`** · Ban retry-to-green · Ban 改共享 SSOT · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT/判别结局）
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**
**Date**: 2026-10-07
**Line**: **RAG03-C**（GAP-RAG-03 · residual id 承 **`R3-HNSW-COMPLETENESS`** 的 exact-K fill 观察面）
**授权链**: AQ nail（`post_prove_dual_pass` · checklist `execution-master-checklist.md:1094-1101` @tip · path-exercised residual closed **this knife only** · exact-K / production HNSW SLO **NOT claimed** · `hnswReturned=0` · `hnswExactFillObserved=false` disclosed · **`:71` OPEN**）→ **RAG03-B 侦察**（2026-10-07 · turn-level · `:71` 残余=真实面：AQ prove 中 `hnswReturned=0` · `hnswExactFillObserved=false` · fixture 下 HNSW 候选过滤非同表 Index Scan Filter · `iterative_scan` 不越未授权批 → exact-K fill 面事实性未行使 · HNSW prove 前置已满足 · CC-H7 决策点在协调方闸）→ **协调方裁决：授权本刀以合法非退化夹具真实验证 HNSW 候选返回与 exact-K fill · 多结局诚实**（**scoping Ban 由本新刀授权合法解除——沿 G7W-G golden arm 先例**：G7W nail 登记块挂起后继→协调方裁决立 G7W-G 复现臂；本刀同构：AQ nail 登记 exact-K NOT claimed + `:71` OPEN → 协调方裁决立 RAG03-C 观察刀）→ **本 REQUEST（docs-only）→ pre-exec 双审（mw-rag-route + mw-model-op）→ meetwise 授权 EXEC（夹具+prove 一次优先·多结局）→ post-prove 双审 → meetwise 授权 nail**。
**输入事实（只读在案引用 · 行号全 @tip `9265e4d8`）**：
- **AQ prove 读数（收据 `receipts/aq-gap-rag-03-r3-hnsw-completeness/2026-10-06-aq-hnsw-prove.md` §3/§5）**：`AQ-HNSW-PATH-EXERCISED` PASS（`HNSW_USED=true` · `qgc_hnsw_visible_119c9da81dd1499496fb9587ab5f6e21`）· `AQ-HNSW-LIVE-PLAN` PASS（`planSource=auto_explain_nested+substituted_body` · `LIVE_PLAN_CAPTURED_AUTO_EXPLAIN`）· safety PASS（returned=0 · unapproved=0 · outOfScope=0）· **`hnswReturned=0` · `hnswExactFillObserved=false`** · §5 披露原文：「ordered HNSW path was exercised, but JOIN-after-HNSW candidate filter is not a same-table Index Scan Filter, so `iterative_scan` did not continue past the unapproved batch under this fixture」。
- **夹具形态（`packages/db/test/rag03-hnsw-completeness.proof.ts:402-427`）**：F-STARVE = 45 近 in-scope **未批准**（dist 0.10–0.54）+ 5 远 in-scope **已批准**（dist 0.60–0.64）+ 10 最近 out-of-scope 已批准（dist 0.01–0.05）· K=5 · P-HNSW GUCs `enable_seqscan=off`+`enable_sort=off`（`:192-197`）→ **K 近邻窗口内全为未批准批，批准行被构造在窗口之外**——单批 `ef_search=40` 弹出的候选全被 candidate JOIN 丢弃 → `hnswReturned=0` 是**该退化构造下的必然而非 HNSW 机制证伪**。
- **机制面**：HNSW 部分索引 `qgc_hnsw_visible_*` = `USING hnsw (embedding vector_cosine_ops) WHERE visible`（`packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql:205`）· candidate JOIN 在 ann CTE 内 LIMIT 前（`0138_qbank_ann_candidate_before_limit.sql`）· `hnsw.iterative_scan='strict_order'` 函数级钉死（`0139_qbank_ann_hnsw_iterative_scan.sql`）——0138/0139 均 **AQ 已闭面 · 本刀零改动**。
- **行语义**：backlog `gap-bug-backlog.md:71` GAP-RAG-03 **P0 OPEN** · `:70` GAP-RAG-02 OPEN（R-b EXIT1 承接 · 非本刀）。
**Base**: `origin/feat/mysql-schema-skeleton` **`9265e4d8`**（full `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc` · fetch 后实测 tip=预期 ≥`9265e4d8` 恰等）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-rag03` · branch `line/rag03c-exactk-observe`
**Experts**: `mw-rag-route` + `mw-model-op`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — 授权链见上；双审 PASS ≠ EXEC 授权 ≠ 判别结论预claim。

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban 实跑的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码/夹具/proof 改动**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`9265e4d8`）；**(b)** AQ prove 收据 + AQ harness CC-H1..H8 + AQ nail 登记块（checklist `:1094-1101`）引用；**(c)** backlog `:70`/`:71` 原文引用。RAG03-B 侦察为 turn-level 指令链（未单独落树），其结论与在案 AQ 收据 §5 读数逐字可对——本 REQUEST 仅引用可核验在案文件为锚。**判别结局无论何向（H-E1/H-E2/H-E3/半填充），如实入收据（Ban 两向定谳压力 · Ban 就地 reinterpret）。**

## 1. 假设族（预注册多结局 · 不预设结论 · 沿 G7W-G 先例每假设带预测+反例分支）

> **承卷**：AQ nail 已闭面（path-exercised + live plan + safety）零重开零重证；本刀只在 AQ 收据 §5 披露的**未行使面**（exact-K fill 在 HNSW 路径下的事实性观测）上加立可判别假设。

- **H-E1（夹具向量分布退化致候选恒 0）**：`hnswReturned=0` 由 F-STARVE 形构造的**退化分布**决定——批准 in-scope 行被构造在 K 近邻窗口之外（dist 0.60–0.64 vs 未批准 0.10–0.54），`ef_search=40` 首窗全为未批准批 → 全被 candidate JOIN 丢弃。**预测**：换非退化分布（批准 in-scope 行穿插进入首窗）后 → `hnswReturned>0` 且 `hnswExactFillObserved=true`（恰 K 全批准 in-scope · 距离升序）。**反例分支**：非退化分布下仍 `hnswReturned=0` → E1 削弱（登记非证伪）。
- **H-E2（iterative_scan 参数面在合法分布下仍不越批）**：非退化分布下 JOIN-after-HNSW 使 `strict_order` 继续扫描语义仍不生效（配置面问题）。**预测**：非退化夹具下 `hnswReturned=0` 或 `<K`，且 EXPLAIN（live 口径）显示扫描在首窗即止/无继续翻批形态 → 参数方案（`ef_search` 提升 / `iterative_scan` 档位 / 其他 AUTHORIZE 面参数）**交双审另议**，本刀不改 0139 定值（`0139` = AQ 已闭面 · Ban 本刀触碰）。**反例分支**：参数面可越批（`hnswReturned` 随窗增大而增）→ E2 削弱。
- **H-E3（机制性不可观测）**：JOIN-after-HNSW **结构性排除** same-table Index Scan Filter 形态——pgvector `iterative_scan` 的继续扫描只在同表 Qual（Filter recheck）下生效，JOIN 谓词下机制性失效（AQ 收据 §5 披露面的一般化）。**预测**：非退化夹具下 `hnswReturned=0` 且 EXPLAIN 双口径均无 Index Scan Filter 形态（候选过滤落 JOIN 节点）→ E3 权重上升 → **如实登记为机制事实**；`R3-HNSW-COMPLETENESS` 行处置（含 backlog `:71` 剩余面表述）**升级协调方裁**。**反例分支**：出现 Filter 形态且返回随分布变化 → E3 削弱。
- **三向关系预声明**：H-E1 与 H-E2/H-E3 对「非退化夹具读数」预测相反（>0 vs =0/<K），可分；**H-E2 与 H-E3 对「仍 =0/<K」同预测**——本刀**不预设二者可分**；分流证据=EXPLAIN 形态读数（E2 预期首窗即止但形态可参数化 · E3 预期结构性无 Filter 形态），形状判读**入收据 · E2/E3 归一或分流=登记非定谳**，定谳权归协调方。
- **半填充结局（合法 · 预注册）**：`0 < hnswReturned < K` → 如实登记（exact-K fill 布尔=false 读数）· 归协调方（不强行归入任一假设）。
- **判别读数（预注册 · 三件套）**：① **EXPLAIN 计划树 Index Scan Filter 有无**（`qgc_hnsw_visible_*` 节点有无 + 同表 Filter vs JOIN 形态 · live（auto_explain nested）+ substituted_body 双口径 · 承 AQ CC-H2 口径与披露纪律）；② **`hnswReturned=<n>` 计数**；③ **exact-K fill 布尔**（返回恰 K 个批准 in-scope ref 且距离升序 = `hnswExactFillObserved` 承 AQ 同名口径）。**三读数均为记录产物非红绿门禁**（Ban 把 E1 预测写成败门 · Ban 预期读数落空当判别失败冲销）。

## 2. 夹具方案（≥2 对比交双审 · 全部合法非退化 · 硬约束见 §2.2）

### 2.1 候选方案对比表（双审裁选/修订 · EXEC 按裁定落码）

| # | 方案 | 构成（顺序不变量钉死 · 浮点值 EXEC 编码期细化并落收据） | HNSW 触发方式 | 时长（est-not-counter） | 对 0028/0100 体系破坏面 | 判别力 |
|---|------|------------------------------------------|---------------|------------------------|--------------------------|--------|
| **P1（主臂 · 推荐）** | **非退化向量分布（真实语义邻近度）+ 查询向量与库向量同分布** | 每 attempt 隔离库新建 generation；沿 AQ axis-construction（精确控距 · 查询向量即库向量族中心轴=同分布构型承 `rag03-hnsw-completeness.proof.ts:52-62` 机理）；corpus 骨架承 F-STARVE 三群（45 in-scope 未批准 + 5 in-scope 批准 + 10 out-of-scope 批准 · K=5）但**分布改非退化**——顺序不变量：① 越界 10 行保持全局最近；② **批准 in-scope 5 行穿插次近区间且全部落入 `ef_search=40` 首窗**（corpus 60 行 < 窗口约束 + 距离排序保证）；③ 未批准 45 行在批准行之后延展至远端 | P-HNSW GUCs（承 AQ `:192-197` 口径）强制 | ≈ AQ prove 同量级（ingest 60 行 · 单 attempt 容器 migrate + 跑 ~分钟级） | **零**：proof-local corpus 经既有 DDL/写入函数构造（ingest + control-executor + revoke 路径承 AQ）；无新 migration、无共享 DDL、无函数/索引/manifest 改动；0028（application-bound interview）与 0100（scoring fact root）域表零读写交叉；migrate 链零新增（收据口径 applied=140 不变） | 直接判 E1 vs E2/E3：首窗含批准行时 `hnswReturned>0` 与否即为分布敏感性直接读数 |
| **P2（对比臂）** | **行数量级提升**（+ 非退化穿插） | 同 P1 顺序不变量；corpus 放大至 **~2000 行** 量级（越界批 + 批准近批 + 未批准主体远批 · 配比保持批准行进入首窗）；P-DEFAULT（无 GUC）下加测规划器**自然选 HNSW** 面（小语料下规划器偏 candidate-driven nest+Sort · 0139 头注披露） | 自然选择（P-DEFAULT 读 `HNSW_USED`）+ P-HNSW GUCs 双读数 | ingest/构建分钟级上升（2000 行批写 · EXEC 实测落收据 · 超预算即停如实记中止） | **零**（同 P1：proof-local · 零 DDL · 零 migration） | 验证规划器自然触发面 + 大语料下窗口采样行为；E2「参数面」的量级敏感性读数 |
| **P3（落选 · 如实登记）** | **改共享 schema 换观测**（重建 HNSW 索引去 `WHERE visible` / `ALTER FUNCTION` 改 `ef_search`/`iterative_scan` 定值 / 去 candidate JOIN） | —— | —— | —— | **不可接受**：触 `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST` seal + 共享 migrate 链 → 冲击 0138/0139 已闭面与 0028/0100 同链 proof 重演 → **本刀 Ban**；若 E2 成立，参数方案属另刀双审 | —— |

### 2.2 夹具硬约束（EXEC 面合法性边界）

1. **只经既有 DDL/写入函数构造**（ingest / control-executor / 既有 revoke 路径 · 承 AQ fixtureConstruction 披露口径）· Ban 直写绕 trigger · Ban `DISABLE TRIGGER`（F-STARVE-HASH seam 不承卷——非本刀面）。
2. **零生产数据**：每 attempt 隔离库新建 · Ban 碰任何生产库/生产数据 · Ban 读生产。
3. **零栈替换**：PG/pgvector 唯一向量真相 · **Ban MySQL** · **Ban FULLTEXT** · **Ban Qdrant**。
4. **零共享面改动**：Ban 新增/修改 migration · Ban 改 `0029`/`0066`/`0068`/`0138`/`0139` · Ban 改 `qbank-generation-retrieval.ts` / `principal.ts` 等任何 src · Ban 改既有三 proof（`rag03-filter-locus` / `rag03-hnsw-completeness` / `rag03-route`）。
5. **safety 面承卷**：任何夹具下返回行必须满足 0 未批准 · 0 越界 · ≤K（`R3-HNSW-SAFETY` 承 AQ CC-H3 口径 · 本刀门禁非读数）。
6. fixture 前置断言不可构造 → 记 `FIXTURE_UNREACHABLE` · 该 attempt FAIL（≠绿 ≠红断言命中）→ 回 PRE 重议 · Ban 改夹具语义冒充通过（承 AN-RAG-R3 先例）。

## 3. EXEC 面（夹具+prove 一次优先 · 多结局 · pre-exec dual BOTH PASS + meetwise 授权后方可行）

| # | 文件 | 改动（精确） | Layer |
|---|------|--------------|-------|
| **C-1** | 新 proof `packages/db/test/rag03c-exactk-observe.proof.ts` | 本刀全部夹具+读数逻辑；零改动既有 proof | TEST |
| **C-2** | `packages/db/package.json` | `prove:rag03c-exactk-observe` 一行 | HARNESS 注册 |
| **C-3** | 根 `package.json` | `rag03c-exactk-observe:prove` + `:raw` 双行（沿 `:248-251` 四行形制） | HARNESS 注册 |
| **C-4** | `scripts/run-e2e-isolated.mjs` | 四处登记（沿 C-3 先例 · 行号 @`9265e4d8` EXEC 期重核）：依赖表（`rag03-hnsw-completeness:prove:raw` 块 `:1376` 后追加）· target 列表（`:1557-1558` 后追加）· 命令分派（`:1815-1818` 后追加）· migrate 白名单（`:2327` 数组内追加）；仅追加不改既有条目；漏任一处 → 收据披露并视为 C-4 未落 | HARNESS 注册 |

**Primary CMD（钉死）**: `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm rag03c-exactk-observe:prove`

**Attempts（一次成型 · 预注册）**: P1 ×3（`P1-a→P1-b→P1-c`）→ P2 ×1（`P2-a`）· 执行序固定 · Ban 事后加跑/插跑/择优/retry-to-green · 全 attempt 台账全录 Ban 删除覆盖。每 attempt 收据必录：code SHA（receipt commit ≠ 实跑 SHA）· `+08:00` 起止 · 隔离 PG 容器名 + image RepoDigests · `extversion` · `hnsw.ef_search`（未设记 `default(40)`）· ann 函数 proconfig · 实测 dist 表（对照 §2.1 顺序不变量）· **三判别读数**（EXPLAIN 双口径 JSON 原样 + `hnswReturned=<n>` + exact-K fill 布尔）· 红/绿断言名清单 · EXIT。落点 `ai-docs/delivery/receipts/rag03c-exactk-observe/`。

**断言名（预注册）**：门禁类——`R3C-FIXTURE-REACHABLE`（两臂各 attempt 前置）· `R3C-P1-HNSW-USED`（P1 的 P-HNSW 计划含 `qgc_hnsw_visible_*` · 承 CC-H1 口径）· `R3C-SAFETY`（0 未批准 · 0 越界 · ≤K · 两臂所有计划面）· `R3C-PEXACT-EXACT-K`（serving/P-EXACT 回归面 = 精确 5 全批准 in-scope 距离升序 · 承 `R3-STARVE-EXACT-K` 口径——**EXACT 路径不因本刀夹具变化回归**）· `R3C-READINGS-RECORDED`（三判别读数字段在收据中齐备非空）。**读数类（记录非门禁）**：`hnswReturned=<n>` · `hnswExactFillObserved=<bool>` · `planFilterShape=<same-table-filter|join|none>`（EXPLAIN 形态标签 · 双口径各一）· P2 `P-DEFAULT-HNSW-USED=<bool>`。EXIT 契约见 §5。

## 4. 执行纪律（承 G7W-G §4 口径）

1. **前置**：pre-exec dual BOTH PASS（mw-rag-route + mw-model-op）→ meetwise 显式 EXEC 授权（committed SHA 重钉含重新 fetch · attempts/执行序确认一次成型）→ 独立 worktree + `pnpm install --frozen-lockfile`（EXIT 记录）。
2. **EXEC 边界**：改动面恰 §3 表 C-1..C-4（src/migrations/apps 零字节 · `git diff --stat` 机检入收据）；夹具浮点值细化须保持 §2.1 顺序不变量（偏离=回 PRE · Ban 就地改判别序）。
3. **模型 Key**：只经进程环境（`env -u` 剥离 · name-only）· Ban Key 值/fingerprint 入 receipt/log/commit · Ban `.env*`。
4. **EXIT 后路由**：任一结局 → 收据 + SUMMARY（判别判据落点逐条对号 + 三读数全录 + Pins/Retained 原值）→ post-prove 双审 → meetwise 授权 nail；**行处置（`R3-HNSW-COMPLETENESS` 表述 · backlog `:71` 剩余面）归协调方**——观测读数入卷后裁，Ban 本刀关行。
5. **预算**：本地 prove 零模型调用（`env -u` 双键剥离 · 零外呼）· `actualSpendCny=null`（Ban invented spend）。

## 5. EXIT 契约（多结局双向）

- **EXIT 0（多结局兼容）** = fixture reachable + safety + EXACT 回归面保持 + 读数全录；**任一判别读数值（含 0 / <K / false）不构成红**。
- **红（EXIT 1）** 仅限：fixture unreachable（`FIXTURE_UNREACHABLE`）· safety 破（0 泄漏面失守）· `R3C-PEXACT-EXACT-K` 回归红 · `R3C-P1-HNSW-USED` 未达（AQ 已闭口径退化）· 读数记录缺失。红原值记账不冲销 AQ 台账。
- **结局路由**：`hnswReturned>0 且 exactFill=true` → H-E1 候选成立（**登记非定谳**——「与分布退化一致」≠「E1 已证」）；`仍 =0/<K` → E2/E3 权重上升（形状读数分流 · 归一或分流=登记非定谳）；半填充 → 如实登记归协调方。**任何结局 ≠ `:71` 关闭 ≠ production HNSW SLO ≠ exact-K completeness claimed ≠ covered flip ≠ HA**。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim 判别结局。

## 6. 边界（Ban 清单 · 硬 Ban 全录）

1. **Ban production SLO 宣称**：观测≠SLO · `hnswReturned>0`/`exactFill=true` ≠ production HNSW SLO ≠ exact-K completeness claimed。
2. **Ban 假关 `:71`**：backlog `:71` OPEN 不翻 · 行处置=观测读数入卷后归协调方裁 · Ban 本刀关行 · Ban covered flip（coveredCount=**8**）。
3. **Ban 碰 AQ nail 已闭面**：CC-H1/H2/H3 已闭事实不重开不 re-prove · `0138`/`0139`/`0029`/`principal.ts` 零触碰 · 既有三 proof 零触碰 · Ban wash AQ/AN-RAG-R3 nail。
4. **Ban 改共享 SSOT**：backlog/checklist/matrix/queue 零触碰（**登记归本刀 nail**）· Ban 洗 GAP-RAG-02 `:70`（R-b EXIT1 承接面非本刀）。
5. **Ban 生产数据 / Ban FULLTEXT / Ban Qdrant / Ban MySQL**（§2.2）· PG-retained。
6. **Ban secrets**：Ban Key 值/fingerprint 入 receipt/log/commit · Ban 写 `.env*` · Ban Meridian · Ban buy cloud。
7. **Ban retry-to-green / 事后加跑 / 择优 / 调序插跑**（一次成型 §3）· Ban 破坏性注入 · Ban masking。
8. **Ban self-approve / alone ≠ dual / Ban self-nail** · Ban force-push · Ban push 主线（本刀分支独立 push）。
9. **Ban 两向定谳**：Ban 定谳「E1/E2/E3 已证」、Ban 定谳「HNSW 机制已证完备/已证失效」——判别读数只作登记非定谳，定谳/关闭/立行权归协调方。
10. **Ban 本 turn 碰夹具/产品码**（夹具改动属 EXEC 面·本 REQUEST §3 列明交双审）· Ban coding · Ban prove 执行。

## 7. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not coding · not 判别结局定谳（E1/E2/E3/半填充结果未产生 · 本 turn 只有设计）· not `:71` closed（OPEN · 行处置归协调方）· not production HNSW SLO · not exact-K claimed · not AQ 已闭面 touched · not GAP-RAG-02 touched（`:70` 非本刀）· not covered（coveredCount=8）· not `releaseEvidence=true` · not HA · not nail · not SSOT edit · alone ≠ dual · `g7SuiteGreen=false` · `actualSpendCny=null`

## 8. 流程（本刀全生命周期）

REQUEST（本 commit · docs-only）→ **预执行双审**（mw-rag-route + mw-model-op · stubs PENDING）→ meetwise 授权 → **EXEC**（§3 夹具+prove · 一次优先 · 多结局全录）→ **post-prove 双审**（同两席）→ meetwise 授权 nail（登记归 nail · 含本刀 harness/slice/receipt SSOT additive）。

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `actualSpendCny=null` · backlog `:71` GAP-RAG-03 **OPEN** · backlog `:70` GAP-RAG-02 OPEN（非本刀）· `R3-HNSW-COMPLETENESS` OPEN · 三判别读数=记录非门禁 · STOP

---

*Harness · RAG03-C GAP-RAG-03 exact-K fill 观察刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 假设族预注册（H-E1 分布退化 / H-E2 参数面不越批 / H-E3 机制性不可观测 · 判别读数=EXPLAIN Index Scan Filter 有无 + hnswReturned 计数 + exact-K fill 布尔）· 夹具方案 P1 非退化分布+同分布查询（主臂 ×3）/ P2 行数量级提升（对比臂 ×1）交双审 · 对 0028/0100 体系破坏面=零（proof-local · 零 DDL · 零 migration）· 硬 Ban：production SLO 宣称 / 假关 `:71` / 碰 AQ 已闭面 / 改共享 SSOT / 生产数据 / FULLTEXT / Qdrant / MySQL / secrets · 多结局一次成型 Ban 事后加跑 · alone ≠ dual · STOP*
