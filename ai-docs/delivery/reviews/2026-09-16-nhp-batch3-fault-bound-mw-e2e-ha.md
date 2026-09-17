# 审查归档 — NHP Batch3 FAULT/BOUND（执行前切片）· mw-e2e-ha

**日期**：2026-09-16（~19:12 PT）  
**审稿人**：`mw-e2e-ha`（对抗主审工作臂；**不采信**实现方自批；本审**未跑**任何 prove / e2e / load）  
**送审**：`reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-e2e-ha.md`  
**配对**：`reviews/2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md`（已落库 · **changes_requested**；冲突取更严；**不采信代替**）  
**结论**：**conditional**（**执行前文档闸 only**；见 §0）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ family green** · **≠ LOAD/PERF SLO** · **≠ R2/R4 closed** · **≠ planner leaf** · **≠ wrong_track ADV covered** · **本审未跑 prove**  
**开跑**：**否** — 双审通过前禁 prove；本域 conditional **≠** 双域齐；配对已 **changes_requested**；即便日后双域齐，开跑仍须 meetwise-core（或等价）**另发执行授权** + 逐 CMD **新** EXIT 回执；Batch1+Batch2 `post_prove_dual_pass` / 硬闸文档闸生效 / 矩阵闸 pass **均 ≠** 本批 prove 授权

---

## 0. 结论表

| 项 | 裁定 |
|----|------|
| 父代理词汇 | **conditional**（执行前文档闸；R4-FAULT 诚实钉须先改钉；零 prove） |
| Batch3 范围（7 IDs · FAULT/BOUND + R4 NEG/FAULT honesty）是否可接受 | **条件可**（高价值 partial；可无云 Key 谈；LOAD/HA/云/UI-pay/wrong_track ADV / 015-FAULT deferred）— **前提**：FAULT/矩阵「无接线」过期句改钉 |
| 与 Batch1+Batch2 14 IDs 是否无重叠 | **是**（见 §2） |
| 是否允许**谈**本批 prove | **否（现时）** — 本域 conditional + 配对 changes_requested → **不得**宣称双域齐 / 不得开议程；改钉后仍须配对独立 pass |
| 是否允许**开跑**本批 prove | **否（硬）** — 双审前零 prove；双审后仍须 meetwise-core 另授权 + CMD+EXIT；本审 ≠ 授权 |
| EXIT=0 是否 = covered / R2·R4 关 / SLO / LOAD / HA | **否** — 处处钉 partial / honesty ≠ covered；`releaseEvidence=false`（FAULT 行另有过期「无接线」须改，见 §5） |
| 是否批 covered / HA / `releaseEvidence=true` / LOAD·PERF SLO / R4 closed / planner leaf / wrong_track ADV covered | **否** |
| 本审是否执行 prove | **否（禁止）** |
| model-op 是否须并列 | **否**（本批无 MODEL-OP live 子集；不强制加） |
| Batch1+2 post_prove_dual_pass / 硬闸生效是否授权本批 prove | **否** |

---

## 1. 对照路径（已读）

| 角色 | 路径 |
|------|------|
| REQUEST（本域） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-e2e-ha.md` |
| REQUEST（配对） | `ai-docs/delivery/reviews/REQUEST-2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md` |
| 配对结论（已落） | `ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-mw-rag-route.md` · **changes_requested** |
| Slice | `ai-docs/delivery/nhp-batch3-fault-bound.slice.md` |
| Harness | `ai-docs/delivery/harness/nhp-batch3-fault-bound.md` |
| Eval | `ai-docs/delivery/eval/nhp-batch3-fault-bound.eval.md` |
| 用例全表 SSOT | `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` §1.2–§1.5 · §3.1 Batch3 指针 |
| 父 harness | `ai-docs/delivery/harness/non-happy-path-perf-load-matrix.md` |
| 覆盖矩阵抽核 | `e2e-requirement-coverage-matrix.md` UC-011/015/017/019/033 · GAP-RAG-04 |
| Batch1 对照 | `nhp-batch1-neg-perf.slice.md` = **`post_prove_dual_pass`**（≠ 本批授权） |
| Batch2 对照 | `nhp-batch2-neg-fault.slice.md` = **`post_prove_dual_pass`**（≠ 本批授权） |
| 前序矩阵闸 | `reviews/2026-09-16-non-happy-perf-matrix-mw-e2e-ha.md`（双域文档闸 **pass**；仍禁笼统 prove） |
| 硬闸头 | `north-star-hard-gates.md`（G1–G6 文档闸已生效 ≠ prove 笼统开跑；G7 草案） |
| REAL-WIRE 旁证（只读） | `harness/r4-real-wire-impl.md`；`apps/worker/src/qbank-track-local-retrieve.ts`；`apps/worker/test/g4-dispatch-recheck-prereq.proof.ts`（FLIPPED 注释） |
| CMD 静态核 | 根 `package.json`：7× 脚本名均存在（本审只读核对；**未跑**） |
| 仓库根 | `/workspace/meetwise` → `/workspace/projects/meetwise` · HEAD `639134f` |

**执行旗核验**：slice / harness / eval / REQUEST / 矩阵 §3.1 均为 `REQUEST-ready` / `not_run:pre_dual_review` / 「零 prove」；**未见**本刀把行升 `covered`；**未见**本刀 prove 回执。本审**未**执行任何 Batch3 CMD，亦未读 `.env*`。

---

## 2. 逐 case 核验

| Case ID | 矩阵旗 | CMD（冻结） | 定义完备？ | 与 B1/B2 重叠？ | EXIT=0 读法钉死？ | 本审裁定 | 缺口 / 假阳面 |
|---------|--------|-------------|----------------|-----------------|-------------------|----------|---------------|
| **NHP-015-BOUND-01** | partial | `pnpm uc015:ingest-failures:prove` | **是**（F2/F3 0 字节/超大 413 入口拒） | **否**（B1 为 015-**NEG**；同 CMD 不同分面 · harness §2.2） | **是**（≠ OCR FAULT / ≠ LOAD；pgvector→R5） | **可纳入** | 015-FAULT 无锚 deferred；共享 CMD 旧 EXIT≠本批 |
| **NHP-011-FAULT-01** | partial | `pnpm uc011:report-refund:prove` | **是**（失败→released+额度净 0 · **DB**） | **否**（B2 为 011-**NEG** + http 脚本） | **是**（≠ refund complete / ≠ UI-pay） | **可纳入** | 矩阵期望写「HTTP 额度」而 harness 钉 DB 脚本 → **软钉 N1**；011-BOUND deferred |
| **NHP-017-BOUND-01** | partial | `pnpm uc017:orphan:prove` | **是**（sweeper 幂等 / 无二次副作用） | **否**（B2 为 017-**FAULT**；同 CMD 不同分面） | **是**（≠ LOAD_worker） | **可纳入** | 共享 CMD 旧 EXIT≠本批；HTTP/SSE 注入仍缺 |
| **NHP-019-NEG-01** | partial | `pnpm uc019:report-regenerate:prove` | **是**（quarantine regen 404/GAP · DB） | **否**（B2 为 019-**FAULT** + **http** 脚本） | **是**（≠ 019 covered / ≠ 幂等键已落） | **可纳入** | regenerateAttempt / demand-path 仍 GAP |
| **NHP-033-BOUND-01** | partial/gap(PERF) | `pnpm uc033:cross-user-authz:prove` | **是**（X10 burst 稳定拒） | **否**（B1 为 033-**NEG**；同 CMD 不同分面） | **是**（≠ PERF/LOAD SLO / ≠ 七类 ADV 齐） | **可纳入** | X10≠容量；ADV 未齐 |
| **NHP-R4-NEG-01** | partial/honesty | `pnpm g-r2-5-retrieve-fail-closed:prove` | **是**（缺/非法 snapshot → degraded denial） | **否**（B1 为 R2-**FAULT** 同 CMD；**新 case ID / R4 分面**） | **是**（≠ R4 closed / ≠ 路由已生效） | **可纳入**（**配对域主审**） | 共享 `g-r2-5` 旧 EXIT≠本批 / ≠ R4 关 |
| **NHP-R4-FAULT-01** | gap/honesty | `pnpm g4-dispatch-recheck-prereq:prove` | **部分**（seam/recheck 合同有；**「生产路径无接线」过期**） | **否**（B2 为 R4-**BOUND** + 不同 CMD） | **部分**（≠ R4 closed / ≠ full wire **仍对**；但「无接线」与现网冲突） | **纳入但硬阻塞改钉** | 见 §5 **B1**；FLIPPED CALL_SITES≥1；**禁**再改 wire；**≠** ADV covered |

**合计**：6/7 可干净纳入；**R4-FAULT** 须先改钉诚实读法。**零**行批准升 `covered`；**零**行批准 R4/planner/wrong_track 关。

**与 Batch1+Batch2 ID 重叠**：无。  
Batch1 = 001-NEG / 001-PERF-api / 015-NEG / 050-NEG / 033-NEG / R2-NEG / R2-FAULT。  
Batch2 = 002-BOUND / 010-FAULT / 011-NEG / 017-FAULT / 018-NEG / 019-FAULT / R4-BOUND。

**CMD 静态核验（只读）**：`uc015:ingest-failures:prove` · `uc011:report-refund:prove` · `uc017:orphan:prove` · `uc019:report-regenerate:prove` · `uc033:cross-user-authz:prove` · `g-r2-5-retrieve-fail-closed:prove` · `g4-dispatch-recheck-prereq:prove` 均在根 `package.json` 存在。前 5 条经 `run-e2e-isolated` → 默认 pgvector **green-risk / R5**（即便将来 EXIT=0）。

---

## 3. REQUEST 六问（专家复核）

| # | 问 | 答 |
|---|----|-----|
| 1 | Batch3 是否足够小且高价值（FAULT/BOUND + R4 NEG/FAULT honesty），且可无云 Key 谈执行？ | **是（选型）**。7 IDs；无云 Key / 无 MODEL_API_KEY 要求；LOAD/HA/云 deferred。谈执行须先清 §5 B1。 |
| 2 | 是否与 Batch1+Batch2 14 IDs 无重叠？ | **是** |
| 3 | EXIT=0 / not_run 读法是否处处钉 ≠ covered / partial / honesty？ | **大体是**（harness §1/§3/§4 + eval + REQUEST + slice）；**例外**：R4-FAULT「生产路径无接线」过期 → 须改钉后才算处处诚实 |
| 4 | 是否错误把矩阵文档闸 pass / Batch1+2 post_prove_dual_pass / 硬闸生效读成「已授权开跑本批 prove」？ | **否（文档未误读）**；本审亦钉：上述均 ≠ 本批 prove 授权 |
| 5 | 实现方是否越权跑 prove / 回写 covered / 改 R4 wire / 读 `.env*`？ | **未见本刀越权**（`not_run:pre_dual_review`；无 covered 回写；注释块未解冻；本审零 prove；未读 `.env*`） |
| 6 | LOAD/HA/云/UI-pay/wrong_track ADV covered / 015-FAULT 是否被偷渡进本批绿叙事？ | **否**（明确 deferred；假绿表钉死） |

---

## 4. 专家五答（请专家回答）

| # | 问 | 答 |
|---|----|-----|
| 1 | 本 Batch3 范围与 CMD 冻结是否可接受为第三批执行前基线？ | **条件可接受** — 改钉 §5 B1 后可作为第三批执行前基线；**现时不得**宣称基线已齐 / dual pass |
| 2 | 是否同意：在双审通过前不得开始本批 prove？ | **同意（硬）** |
| 3 | 双审通过后，开跑是否仍须 meetwise-core（或等价）另发执行授权 + CMD+EXIT 回执？ | **是（硬）**；旧回执 / Batch1·2 dual-pass / FOLLOW / REAL-WIRE EXIT / 硬闸文档闸 **均不可**代替 |
| 4 | 阻塞项（若有）是什么？ | **有硬阻塞 B1**（见 §5）；软钉 N1–N3 不单独挡范围选型 |
| 5 | 是否需要扩/缩 case ID 列表？ | **否** — 保持 7；不扩 LOAD/HA/ADV/PERF-CLOUD/015-FAULT/011-BOUND；不缩 R4-NEG/FAULT（须配对域主审；FAULT 改钉后保留） |

---

## 5. 硬阻塞 / 软钉 / 假阳风险

### 5.1 硬阻塞

| ID | 项 | 读法 |
|----|-----|------|
| **B1** | NHP-R4-FAULT-01 / 矩阵 §1.5「生产路径无接线 / 生产路径无 / REAL-WIRE §6c 仍不接线」**过期** | 静态旁证：`qbank-track-local-retrieve.ts` 已调用 `dispatchTrackLocalRetrieval(`；`g4-dispatch-recheck-prereq.proof.ts` 头注释 **FLIPPED** 断言 CALL_SITES≥1；`harness/r4-real-wire-impl.md` 记 g4 EXIT=0 FLIPPED。**要求**：改写 harness §1 行 + 矩阵 §1.5 + eval 相关句为 seam/`recheck_failed` 合同 + FLIPPED CALL_SITES≥1 honesty；**仍钉** ≠ R4 closed / ≠ wrong_track=0 / ≠ ADV covered / ≠ planner leaf；**本批刀仍禁再改 wire**。改钉前：**不得** dual pass / **不得**开跑。配对 `mw-rag-route` 已同向 **changes_requested**（冲突取更严）。 |

### 5.2 软钉（非硬 block · 改钉 B1 时建议顺手对齐）

| ID | 项 | 读法 |
|----|-----|------|
| **N1** | 矩阵 NHP-011-FAULT 期望「HTTP 额度口径」 vs harness 冻结 `uc011:report-refund:prove`（DB） | Batch3 harness **已**钉 DB 诚实读法；**不**阻塞选型。建议矩阵锚点与 harness 字面分面对齐（非本刀必改） |
| **N2** | 共享锚 CMD（`uc015`/`uc017`/`uc033`/`g-r2-5`）曾服务 B1/B2 **不同 case ID** | harness §2.2 **已**诚实注记；历史 EXIT=0 **≠** 本批 executed / covered；授权后须**新** CMD+EXIT |
| **N3** | Batch1+2 `post_prove_dual_pass` / 矩阵文档闸 pass / 硬闸文档闸生效 / 本审 conditional / 配对 changes_requested | **均 ≠** 本批 prove 已授权；双审前零 prove；双审后仍须另授权 |

### 5.3 假阳表

| 若有人说… | 正确读法 |
|-----------|----------|
| 7× 将来 EXIT=0 = 非快乐路径全家 covered / family green | **假阳** — 仅 Batch3 honesty/partial executed |
| `g4-dispatch-recheck-prereq:prove` EXIT=0 = R4 closed / 生产 recheck 全家齐 / wrong_track=0 | **假阳** — FLIPPED CALL_SITES honesty only |
| `g-r2-5-retrieve-fail-closed:prove` EXIT=0 = R4 closed / 路由已生效 | **假阳** — snapshot missing honesty |
| X10 / 413 / orphan EXIT=0 = LOAD / PERF SLO | **假阳** |
| `uc011` DB EXIT=0 = refund complete / UI-pay | **假阳** |
| isolated pgvector EXIT=0 = sole-stack / R5 退役 | **假阳** — green-risk / R5 |
| 本域单方 conditional/pass = 可开跑 / 可代替 rag-route | **假阳** — 须双域；不采信代替 |
| Batch1/2 dual pass = Batch3 已授权 prove | **假阳** |

---

## 6. 批准范围 / 不批

| | |
|--|--|
| **批准范围** | 承认 Batch3（7 IDs）选型方向、CMD 名冻结、与 B1/B2 **无 ID 重叠**、假绿禁令与「双审前零 prove / 另授权才可跑」纪律；未见本刀 prove / covered 抬升 / 读 `.env*` / Meridian；**执行前文档闸 narrow scope only** |
| **不批** | 现时 dual pass；本刀 prove 绿关；单方/现时开跑；covered；HA；`releaseEvidence=true`；LOAD/PERF SLO；R2/R4 closed；planner leaf 关；wrong_track ADV covered；把「生产路径无接线」当现行诚实钉；把历史/Batch1·2/REAL-WIRE 回执当本批绿关 |
| **下一步** | 实现方（或协调）改钉 B1（harness + 矩阵 §1.5 ± eval）→ 再送 `mw-e2e-ha` + `mw-rag-route` 复审；双域均 pass 且无更严冲突后，**仅允许谈**；开跑须 meetwise-core 另授权 + 注释块 CMD 解冻执行 + 新 EXIT 回执 |

---

## 7. 硬钉（回传用）

- **结论**：**conditional**（执行前文档闸 / 第三批；B1 硬阻塞）  
- **是否允许开跑**：**否**（双审前禁；双审后仍须另授权 + CMD+EXIT）  
- **是否允许谈 prove**：**否（现时）**（conditional + 配对 changes_requested）  
- **与 B1/B2 重叠**：**无**  
- **阻塞项**：**B1** R4-FAULT「生产路径无接线」过期；软钉 N1–N3  
- **review 路径**：`ai-docs/delivery/reviews/2026-09-16-nhp-batch3-fault-bound-mw-e2e-ha.md`  
- **假阳风险**：EXIT=0≠covered；共享 CMD 旧绿≠本批；g4 FLIPPED≠R4 关；Batch1/2/矩阵闸≠本批授权；isolated=R5 green-risk；本域≠代替配对  
- **本审零 prove** · `releaseEvidence=false` · ≠HA · ≠ covered  
- **双域齐后仍须 meetwise-core 另授权才可跑**

---

*Review · mw-e2e-ha · NHP Batch3 FAULT/BOUND · 2026-09-16 ~19:12 PT · conditional（pre-exec） · 禁开跑 · releaseEvidence=false · ≠HA · ≠ covered · 零 prove*
