# 审查归档 — R4 **REAL-WIRE-IMPL**（Worker retrieve 真接线验收门 · **不 coding / 不 prove**）· mw-e2e-ha

**日期**：2026-09-16（PT；本审只读 ~08:16 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审 · 执行前第二域；**不采信**实现方自报；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-2026-09-16-r4-real-wire-impl-mw-e2e-ha.md`  
**harness**：`harness/r4-real-wire-impl.md`（路径不变）  
**配对**：`REQUEST-2026-09-16-r4-real-wire-impl-mw-rag-route.md`（**待审 / 不替代**本域）  
**前序边界**：
- `2026-09-16-r4-real-wire-mw-e2e-ha.md`（**pass** · inventory + **正确不接线**）
- `2026-09-16-r4-p-planner-post-prove-mw-e2e-ha.md` + 配对 rag `2026-09-16-r4-p-planner-post-prove-mw-rag-route.md`（**双域已齐** · unit only · **dispatch 仍零** · **R4 仍开**）
- FOLLOW honesty post-prove（**仍不接线**）
**结论**：**pass**（仅 **REAL-WIRE-IMPL 验收门文档闸诚实 + 本刀正确不 coding / 不 prove**；**pre-exec**）  
**批准范围**：**仅**同意 harness/eval/slice 够格当将来接线验收门（W1–W7 + 假绿标红）；同意本刀零代码/零 prove；同意 **P-FAKEPLAN 禁令**、完整 generationId/recipeId、**G-R2-5 保留**、`recheck_failed` fail-closed；同意 **R4 仍 NOT closed**；同意 **接线绿 ≠ wrong_track=0**（ADV 单独）；同意 **P-PLANNER post-prove dual-pass ≠ 自动授权本刀 coding**；同意本刀 dual pass **本身不**自动开工改仓  
**不批**：本刀内 Worker coding / prove 绿关 · 把 P-PLANNER dual 写成可接线批准 · 把本 pass 写成自动 authorize coding · R4 关闭 · 题域已隔离 · wrong_track=0 · full P-WIRE · dispatch 已接线 · covered · HA · `releaseEvidence=true` · sole cutover · flip default · open DELETE · P-FAKEPLAN · 升格 NHP-R4 covered  
**硬钉**：`releaseEvidence=false` · **Not HA** · **≠ covered** · **本审未改仓库、未跑任何 prove** · **接线仍无** · **R4 仍开** · **P-PLANNER dual ≠ 本刀 coding** · **通过前禁 coding/prove** · HEAD `639134f`

---

## 0. 交付与成功标准（对照 REQUEST · 本审列）

| # | 交付 / 成功标准 | 本审核验 |
|---|-----------------|----------|
| S1 | harness / eval / slice / 双 REQUEST 齐；状态 `REQUEST-ready` / `not_run:pre_dual_review` | **成立** |
| S2 | 验收链钉：planner output → validate → assemble 完整 `RetrievalPlan`（**含 generationId/recipeId**）→ `dispatchTrackLocalRetrieval` → recheck | **成立**（harness §1.1 W1–W5；对齐父轨 §6c intended wire + §6e） |
| S3 | **P-FAKEPLAN 禁令**显式（主叶硬塞 / 缺 generation·recipe = 假绿） | **成立**（§0 / W3 / §1.2 / §4 假绿表 / REQUEST Q4；**未漏禁**） |
| S4 | **G-R2-5 保留**；`recheck_failed` **fail-closed**（不回退 unscoped / 兄弟叶 / legacy） | **成立**（W5–W6） |
| S5 | **接线绿 ≠ R4 closed ≠ wrong_track=0**；本刀 ≠ 关 R4；ADV 单独 | **成立**（W7 / 全文钉；eval E1–E10 一律「关闭 R4？否」；**未偷关**） |
| S6 | 本刀 **零 coding · 零 prove**；Worker **仍零** dispatch；CMD=`not_run:pre_dual_review` | **成立**（eval §2 + 独立静态旁证；本审未跑 prove） |
| S7 | **P-PLANNER dual-pass ≠ 自动授权本刀 coding**；本刀须 **独立 dual pass** 后才可谈开工改仓 | **成立且本审显式钉**（见 §2.4 / §5） |
| S8 | 本刀 dual pass **不**自动授权 Worker coding（须 **separate authorize**）；通过前禁 coding/prove | **成立**（harness §8 / REQUEST Q9；本审同意） |
| S9 | NHP-R4 六列 **不升格 covered**；相对 P-PLANNER/REAL-WIRE/FOLLOW 无升格 | **成立**（matrix §1.5；见 §3） |
| S10 | sole allowlist **不**因本切片扩面；北星「已生效」≠ 笼统 prove 开跑 | **成立**（sole 恰 5；prove=`not_run`） |
| S11 | 与 inventory / P-PLANNER / FOLLOW 边界清晰：前序仍 = 正确不接线 / unit 组装绿 / dispatch 仍零 | **成立**（见 §2.4） |

→ 上述为 **REAL-WIRE-IMPL 验收门文档闸** 成功标准；**不是** Worker 实现授权，**更不是** R4 关闭条件。  
→ **可核验性**：本刀成功标准均为文档存在性 + 禁令完整性 + 静态 gap 旁证 + 旗标不升格；将来接线实现须另对照 W1–W7 / 新 prove / 双域 post；**接线绿仍 ≠ R4 关**。

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承：验收门文档 · 不 coding/prove · 非关 R4 · 非 dispatch 已接线 · await dual | **属实**；本审独立签核，**非**实现方自批 |
| harness 定义 W1–W7 + 假绿标红 + 冻结 CMD | **属实且够格**当验收门（见 §2） |
| 实现方本刀 **未改** Worker 接线；**未跑** REAL-WIRE-IMPL prove | **属实**（eval `not_run` + 本审未跑；静态仍零 dispatch） |
| P-PLANNER `post_prove_dual_pass`（unit only）· 双域已齐 | **属实**（本域 + 配对 rag 均 pass）；**≠** 本刀 coding 授权 |
| REAL-WIRE inventory dual pass = correctly NOT wiring | **属实**；本刀 = 其后 **打开验收门**，不是翻案去接线 |
| FOLLOW honesty 仍不接线；≠ 本刀 coding 授权 | **属实** |
| 父轨 §6c / §6e / status §9 指针与本刀一致 | **属实** |
| mw-rag-route 配对 REQUEST | **待审**；**不替代**本域；本审独立 |
| 「meetwise authorize opening real wire next」 | **读为打开验收门文档**；**≠** 已批 Worker coding（见 §2.3） |

对照源：`REQUEST-2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` · `harness/r4-real-wire-impl.md` · `eval/r4-real-wire-impl.eval.md` · `r4-real-wire-impl.slice.md` · `harness/r4-domain-isolation.md` §6c/§6e · `r4-domain-isolation-status.md` §7–§9 · `harness/r4-p-planner.md` · `non-happy-path-perf-load-case-matrix.md` §1.5 · `e2e-requirement-coverage-matrix.md` GAP-RAG-04 · `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope,qbank-planner-retrieval-plan}.ts` · `scripts/run-e2e-isolated.mjs` SOLE set · 前序 REAL-WIRE / P-PLANNER post-prove / FOLLOW · 配对 REQUEST（rag）

---

## 2. 对抗：范围过宽 / 漏禁假绿 / 偷关 R4 / 边界

### 2.1 范围是否过宽？

| 检查 | 裁定 |
|------|------|
| 本刀是否把「打开验收门」偷写成「已授权 Worker coding / 已接线」？ | **否** — REQUEST/harness/slice/eval 均钉 **零 coding · 零 prove**；coding 须 dual + **separate authorize** |
| W1–W7 是否把 R4 关闸全集（wrong_track=0 / R1 / R2 overall / META）塞进本刀？ | **否** — W7 显式分离：接线绿 ≠ R4 closed ≠ wrong_track=0；ADV 另刀 |
| 是否借 REAL-WIRE-IMPL 扩 sole / flip / DELETE / HA / `releaseEvidence=true`？ | **否** — 显式禁；sole 恰 5、未扩 |
| 相对父轨 §6c W1–W6，本刀 W1–W7 是否扩面？ | **否（拆细）** — 本刀把 inventory 的 planner/validate/assemble 拆步，并单列 W7 关闸边界；**不是**加新产品面 |
| 将来 coding 刀是否被写成「本刀 dual pass 即可改仓」？ | **否（条文）** / **主假绿面** — 见 §2.3：本审钉死 **谈 ≠ 改仓** |

**本审**：范围 **未过宽**；送审立场是 **文档闸 + 正确不改仓**，不是冲绿接线计划。

### 2.2 是否漏禁假绿？

| 检查 | 裁定 |
|------|------|
| P-FAKEPLAN（主叶硬塞 / 缺 generationId·recipeId） | **未漏** — §0 / W3 / §1.2 / §4 / REQUEST Q4 |
| `recheck_failed` 回退 unscoped / 兄弟叶 / 写 question_ready | **未漏** — W5 fail-closed |
| 削弱 G-R2-5 / 缺 snapshot 打开 unscoped | **未漏** — W6 |
| 「P-PLANNER dual = full P-WIRE / retrieve 已消费」 | **未漏** — harness §4 首行；eval E10；**本审再钉**（§5） |
| 「本刀 REQUEST / dual pass = coding 已批」 | **未漏** — harness §4；REQUEST Q3/Q9；**本审再钉** |
| 「接线绿 = R4 关 / wrong_track=0」 | **未漏** — W7；eval E5 |
| NHP-R4 升 covered / HA / flip / DELETE | **未漏** |
| FOLLOW honesty 绿 = 可接线 | 父轨 §6c.2 仍在；本刀 harness §4 未单列 FOLLOW 行（**nit**，非阻塞；本审 §2.4 补钉） |
| helper 存在 = retrieve 已消费 | P-PLANNER harness 已标红；本刀依赖 I2「存在 · 未进 retrieve」；**本审独立核验 helper 零消费点** |

**本审**：**未漏禁**关键假绿（P-FAKEPLAN / 偷关 R4 / P-PLANNER dual 冒充接线 / REQUEST 冒充 coding 批）。FOLLOW/helper 行在父轨与前序仍有效，本刀未翻案。

### 2.3 是否偷关 R4？

| 风险说法 | 裁定 |
|---------|------|
| 「REAL-WIRE-IMPL harness / REQUEST 齐 = R4 关 / 题域已隔离」 | **假绿 / 禁** — 全文 NOT closed；E1–E10 一律否 |
| 「P-PLANNER post-prove dual 已齐 = 本刀可开工 coding」 | **假绿 / 禁** — unit 组装合同绿；dispatch 仍零；**须本刀独立 dual**；dual 后才可 **谈**；仍须 **separate authorize** |
| 「本刀 dual pass = Worker coding 已批 / prove 已绿」 | **假绿 / 禁** — 须 **separate authorize**；本审批「可谈（双域齐后）」≠ 批「可改 Worker」 |
| 「meetwise authorize opening real wire next = 已批接线实现」 | **假绿读法** — 正确读：授权 **打开验收门文档**；coding/prove **forbidden** until dual + separate authorize |
| 「g4-dispatch-recheck-prereq 绿 = dispatch 已齐」 | **假绿** — 旁证期望仍 **0 调用**；绿 = **未接线** 诚实钉 |
| 「helper / production-capable seam = retrieve 已消费 per-turn」 | **假绿** — 主路径仍 `decideRouteSnapshotRetrieve`；helper **零 import** |
| 「将来接线绿 = wrong_track=0 / NHP-R4-ADV 关 / R4 关」 | **假绿 / 禁** — W7；ADV 另刀 |
| 「本刀 = 完整 E2E / covered / HA / `releaseEvidence=true`」 | **假绿 / 禁** |
| 「inventory pass 翻案 = 现在该接线」 | **假绿 / 禁** — inventory pass = **正确不接线**；本刀只开验收门，不在本刀接线 |

**本审结论**：送审材料 **未**偷关 R4 / 未假 covered；对抗面在 **叙事外推**（把 P-PLANNER dual / 「opening real wire」/ 本刀 dual 读成可改仓或 R4 关）。批准范围钉死即可控。

### 2.4 与 P-PLANNER / inventory / FOLLOW 边界（硬钉）

| 切片 | 批准了什么 | 未批准什么 |
|------|------------|------------|
| FOLLOW post-prove | honesty 复跑绿 + **仍不接线** | R4关 · full wire · coding 真接线 |
| REAL-WIRE inventory | inventory 诚实 + **继续不接线** + await PREREQ | 开工接线 · REAL-WIRE prove 绿关 · R4关 |
| P-PLANNER post-prove（**双域已齐**） | unit/acceptance 绿 + **仍不接线** + 组装合同 | **本刀 coding** · dispatch 已齐 · retrieve 已消费 · R4关 · wrong_track=0 |
| **本刀 REAL-WIRE-IMPL** | **验收门文档**诚实 + 本刀 **不 coding/prove** + **双域齐后可谈**开工改仓 | **本刀内改仓** · prove 绿关 · 自动 authorize coding · R4关 |

**显式钉（本审强制）**：

1. **P-PLANNER dual-pass ≠ 自动授权本刀 coding。** unit 合同绿只解除「无组装器」主挡；dispatch **仍零**；R4 **仍开**。  
2. **本刀仍须独立 dual pass 后才可谈开工改仓。** 本域 pass ≠ 双域齐；配对 rag **不替代**；双域齐 ≠ 自动改仓。  
3. **接线绿 ≠ R4 关**；**通过前禁 coding/prove**（本刀 CMD=`not_run:pre_dual_review`）。  
4. REQUEST / harness 路径不变：`REQUEST-2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` + `harness/r4-real-wire-impl.md`。

边界 **清晰**：四者叠加仍 = **正确不接线**；将来接线实现须 **新** authorize + 另刀 prove + 双域 post；接线绿仍 ≠ R4 关 ≠ wrong_track=0。

---

## 3. NHP-R4 / sole / 静态旁证（无 prove）

| 列 | Case | 旗 | covered？ |
|----|------|-----|-----------|
| NEG | NHP-R4-NEG-01 | **partial** | **否** |
| FAULT | NHP-R4-FAULT-01 | **gap**/blind | **否** |
| BOUND | NHP-R4-BOUND-01 | **partial**/honesty | **否** |
| ADV | NHP-R4-ADV-01 | **gap**/blocked | **否** |
| PERF | NHP-R4-PERF-01 | **blind** | **否** |
| LOAD | NHP-RAG-LOAD-01 | **blind** | **否** |

任一行 covered？ **否** — 相对 P-PLANNER / REAL-WIRE inventory / FOLLOW **无升格**。  
GAP-RAG-04 / R4：**仍 gap/blocked** · NOT closed（coverage-matrix 措辞偏旧至 FOLLOW await，方向保守、**未偷关**）。

**sole allowlist（独立）**：恰 **5** — `sole-stack:wiring:prove` / `ping` / `qdrant-backed` / `vectorstore-adapter` / `vectorstore-qdrant`；**无** g4 / r4 / dispatch / real-wire / planner 入表。

**静态接线（独立 · 无 prove · 本审 ~08:16 PT）**：

| 维度 | 本审结果 |
|------|----------|
| `apps/worker/src` `dispatchTrackLocalRetrieval(` | **零**调用（Python 剥注释后 **CALL_SITES=0**；仅注释否定：`main` / `interview-consumer` / `qbank-retrieve-scope`） |
| helper `qbank-planner-retrieval-plan.ts` | **存在**（P-PLANNER unit 产物）；文首钉 **NOT wired into retrieve** |
| 其他 Worker src **import** helper？ | **无** |
| retrieve 主路径 | **仍** `decideRouteSnapshotRetrieve`（`interview-consumer.ts:244`）→ 主叶 scope + G-R2-5 |
| `InterviewPlannerOutput` → retrieve/dispatch | Worker src **零**生产路径 |
| db `dispatchTrackLocalRetrieval` | **合同 seam 在**；生产 Worker **未消费** |
| P-WIRE | **partial only**（主叶 + G-R2-5；**无** full dispatch/recheck / per-turn leaf 消费） |
| 工作树脏文件 | consumer/main 有既有改动（P-PLANNER/G-R2-5 族注释与 helper）；**本刀未把 retrieve 改成 dispatch**；本审 **不**把脏树读成本刀已接线 |

---

## 4. REQUEST 十问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本刀是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关 / dispatch 已接线？ | **否**。REQUEST/harness/eval/status 均自钉否定；本审未检出冒充 |
| 2 | harness 是否够格当 REAL-WIRE-IMPL 验收门（非实现刀）？ | **是**。W1–W7 + 假绿标红 + 冻结 `not_run` 够格当文档闸 |
| 3 | 是否同意：**本刀无 coding / 无 prove**？ | **同意**。通过前禁；本审亦未改仓、未跑 prove |
| 4 | 是否同意：**P-FAKEPLAN 禁令**、完整 generationId/recipeId、G-R2-5 必须保留？ | **同意** |
| 5 | 是否同意：`recheck_failed` 必须 fail-closed，不回退 unscoped？ | **同意** |
| 6 | 是否同意：**R4 仍 NOT closed**；接线绿 ≠ wrong_track=0（ADV 单独）？ | **同意** |
| 7 | sole allowlist 是否因本切片扩面？（期望：**否**） | **否**。恰 5；未扩 |
| 8 | NHP-R4 是否仍 **不得**因本刀升 covered？ | **同意 · 不得升**。六列零 covered |
| 9 | 是否同意：本刀 dual pass **不**自动授权 Worker coding（须 separate authorize）？ | **同意**。双域齐后才可 **谈**开工改仓；谈 ≠ 自动改仓 |
| 10 | 是否同意：禁 flip default / open DELETE / HA？ | **同意**。保持 `releaseEvidence=false` |

---

## 5. 接线 / coding 裁定（本刀 · 核心）

| 选项 | 裁定 |
|------|------|
| 验收门文档（W1–W7 + 假绿/fail-closed/关闸分离） | **批准（本刀 pass 范围）** |
| 本刀内 Worker coding / 改仓 | **否** |
| 跑 REAL-WIRE-IMPL prove 作本刀绿关 | **否**（`not_run:pre_dual_review`） |
| 把 P-PLANNER dual-pass 写成自动授权本刀 coding | **否** |
| 本刀 dual pass 后 **谈**开工改仓 | **可**（须 **双域齐**；本域 pass ≠ 双域齐） |
| 本刀 dual pass = 自动 authorize 改仓 / 开工接线 | **否** — 须 **separate authorize** |
| 批 R4 / full P-WIRE / wrong_track=0 关闸 | **否** |
| 接线绿 = R4 关 | **否** |

### 将来有条件接线（**非本刀授权** · 仅规则钉）

仅当 **本刀独立 dual pass**（rag + 本域）+ **separate authorize** 之后，可开 **新** 实现刀改仓；仍须：真 per-turn planner→validate→完整 `RetrievalPlan`（含 generationId/recipeId）→ `dispatchTrackLocalRetrieval` → recheck · 禁 P-FAKEPLAN · 保留 G-R2-5 · `recheck_failed` fail-closed · 单独 wrong_track=0（ADV）· **接线绿 ≠ R4 关** · 另刀 prove + 双域 post · 仍 ≠HA · `releaseEvidence=false`。  
**本审 pass ≠ 该实现刀已批。**

---

## 6. 阻塞栏（关 R4 / 宣称接线齐 / 本刀开工 coding）

| 阻塞项 | 现状 | 挡什么 |
|--------|------|--------|
| **本刀未 dual / 未 separate authorize** | 本域审中；配对 rag **待审** | **挡本刀开工 coding / 改仓**（主） |
| **P-PLANNER → retrieve 消费** | unit 组装齐；helper **未**进 retrieve | 挡「planner 生产已齐 / 图内已消费」；**不**挡打开本验收门 |
| **P-FAKEPLAN** | 禁令仍在 | 挡主叶硬塞 / 缺 generation·recipe 假接线 |
| **G-R4-1** | 无 full dispatch/recheck / per-turn leaf 消费 | 挡 full P-WIRE / R4关 |
| **G-R4-2 / P-WT0** | wrong_track=0 未证；ADV gap/blocked | 挡 R4关（接线≠ADV关） |
| **P-R2 / P-R1 / P-META** | 仍开（并列） | 挡 R4 关闸全集 |
| **NHP FAULT/PERF/LOAD** | gap/blind | 挡假 covered |
| **sole / HA / releaseEvidence** | allowlist 恰5；Not HA；false | 挡切流/发布叙事 |
| **配对 mw-rag-route** | 本刀 REQUEST **待审** | 挡「单域当双域」；**不替代** |

上述 **阻塞本刀开工 coding 与宣称 R4关**；**不**阻塞本「验收门文档闸 + 正确不 coding」pass。

---

## 7. 裁定

| 项 | 裁定 |
|----|------|
| **结论** | **pass**（REAL-WIRE-IMPL **验收门文档闸诚实 + 本刀正确不 coding / 不 prove**） |
| **是否允许开工 coding** | **否** |
| **是否允许谈开工改仓** | **本刀独立 dual pass 齐后才可谈**；本域 pass ≠ 双域齐；谈 ≠ 自动改仓（须 separate authorize） |
| **批准** | 仅：harness 够格当验收门；W1–W7 / P-FAKEPLAN / G-R2-5 / recheck fail-closed / 接线绿≠R4关；同意本刀零代码零 prove |
| **不批** | 本刀 coding · prove 绿关 · 把 P-PLANNER dual 当本刀 coding 批 · R4/G4 关 · 题域已隔离 · wrong_track=0 · full wire · dispatch 已齐 · covered · HA · `releaseEvidence=true` |
| **假绿风险** | **中（叙事外推）** — 文档诚实；主风险：把「P-PLANNER dual / opening real wire / 本刀 pass」误读成可改仓或 R4关。批准范围钉死则可控 |
| **与前序** | inventory 正确不接线 + P-PLANNER unit dual + FOLLOW 仍不接线 **均仍有效**；**叠加仍 ≠** 接线批准 / ≠ R4关 |

### Nit（非阻塞）

- 本刀 harness W1–W7 相对父轨 §6c W1–W6 为拆细 + 关闸边界，不是扩面；实现刀须对照 **本刀** W 表，勿混编号。
- harness §4 假绿表未单列 FOLLOW honesty 行（父轨 §6c.2 仍在）；本审 §2.4 已补钉。
- 文案「meetwise authorize opening real wire next」易被过读为 coding 已批；正确读 = 打开 **验收门文档**。
- coverage-matrix GAP-RAG-04 仍写 FOLLOW await dual，略旧；方向保守（仍 gap/blocked），建议实现刀对齐 next=REAL-WIRE-IMPL await dual。
- eval §4 勾选为实现方占位（未勾）；本审以独立交叉为准，**不**把勾选当专家签核。
- 配对 `mw-rag-route` **仍待审**；本域独立 pass **不替代**双域齐。
- 实现/文档落在工作树（HEAD 仍 `639134f`）；本审未 commit、未改码、未跑 prove。

---

## 8. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA** · **≠ covered**
- [x] 本审 **只读** · **未改仓库** · **未跑 prove**
- [x] **R4 仍开** · **≠ 题域已隔离** · **≠ wrong_track=0**
- [x] **接线状态：dispatch 仍无 · recheck 仍无 · planner 组装未进 retrieve** · P-WIRE=partial only
- [x] **P-PLANNER dual-pass ≠ 自动授权本刀 coding**
- [x] **本刀须独立 dual pass 后才可谈开工改仓**；本域 pass ≠ 双域齐
- [x] **接线绿 ≠ R4关**；**通过前禁 coding/prove**
- [x] FOLLOW honesty 绿 **不**冒充可接线批准
- [x] inventory pass **不**翻案为本刀接线批准
- [x] NHP-R4 六列 **零 covered** · 无升格
- [x] sole allowlist **未**扩（恰 5）
- [x] 批准范围仅 **验收门文档闸**；**不批** 开工 coding / R4关
- [x] REQUEST/harness 路径不变：`REQUEST-2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` + `harness/r4-real-wire-impl.md`
- [x] 配对 rag **不替代**本域

---

## 9. 结论与回传摘要

- **裁定：pass**（R4 REAL-WIRE-IMPL · **验收门文档闸诚实 + 本刀正确不 coding / 不 prove**）
- **是否允许开工 coding：否**
- **是否允许谈改仓：本刀独立 dual pass（rag+本域）齐后才可谈**；谈 ≠ 自动 authorize；须 separate authorize；另刀 prove + 双域 post
- **阻塞栏**：本刀未 dual / 未 separate authorize（挡开工 coding）· P-FAKEPLAN · G-R4-1 · G-R4-2/wrong_track=0 · P-R2/P-R1/P-META · NHP gap/blind · 配对 rag 待审
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-r4-real-wire-impl-mw-e2e-ha.md`（覆盖 `REQUEST-2026-09-16-r4-real-wire-impl-mw-e2e-ha.md`）
- **harness 路径**：`ai-docs/delivery/harness/r4-real-wire-impl.md`
- **假绿风险**：中（叙事外推：P-PLANNER dual / 「opening real wire」/ 本刀 pass → 误读为可改仓或 R4关）；批准范围钉死则可控
- **硬钉**：`releaseEvidence=false` · ≠HA · ≠covered · R4仍开 · 接线仍无 · **P-PLANNER dual ≠ 本刀 coding** · 通过前禁 coding/prove · HEAD `639134f`

对照：`REQUEST-2026-09-16-r4-real-wire-impl-mw-e2e-ha.md` · `harness/r4-real-wire-impl.md` · `eval/r4-real-wire-impl.eval.md` · `r4-real-wire-impl.slice.md` · 父轨 §6c/§6e · status §9 · matrix §1.5 · 前序 REAL-WIRE inventory / P-PLANNER post-prove 双域 / FOLLOW · 配对 REQUEST（rag）

---

*mw-e2e-ha · R4 REAL-WIRE-IMPL pre-exec · 2026-09-16 ~08:16 PT · releaseEvidence=false · ≠HA · 批文档闸 · 不批开工 coding · P-PLANNER dual ≠ 本刀 coding · 接线绿 ≠ R4关*
