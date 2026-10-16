# 审查归档 — G4 dispatch/recheck honesty PREREQ · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~04:20 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；**不采信实现方自报**；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-g4-dispatch-recheck-prereq-mw-e2e-ha.md`  
**结论**：**pass**（仅 **honesty PREREQ / fail-closed 诚实登记**）  
**批准范围**：**仅**登记「关闸前条件 + 否定钉可执行」——合同 seam 仍在、Worker **零**生产 `dispatchTrackLocalRetrieval(`、**无**生产 recheck、产品阻塞成立、`pnpm g4-dispatch-recheck-prereq:prove`、harness/status/GAP-RAG-04/r5-G4/P9 诚实更新  
**不批**：**R4 关闭** / **G4 关闭** / 题域已隔离 / 生产完整隔离 / full `dispatchTrackLocalRetrieval` 已接线 / recheck 生产路径已齐 / wrong_track=0 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / 切 qbank·向量真相 / 把本绿写成「dispatch 已齐」  
**硬钉**：`releaseEvidence=false` · **Not HA** · **EXIT=0 ≠ R4 closed** · **EXIT=0 ≠ dispatch/recheck 已齐** · **≠ 题域已隔离** · **≠ wrong_track=0** · **接线状态：仍无** · **R4 仍开**

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承 PREREQ / 未接线 / 非关 R4 / 非 covered·HA | **属实**；本审独立签核，**非**实现方自批；mw-rag-route 前序 pass **不替代**本域 |
| 前序 P-WIRE = partial only；**无** dispatch/recheck | **属实**（对照 `2026-09-10-g4-production-scoped-retrieve-mw-e2e-ha.md`）；本刀**未**偷偷补接线 |
| `g4-dispatch-recheck-prereq.proof.ts` | **存在**；静态否定钉：零调用 + seam 完整 + 产品阻塞 + R4 NOT closed |
| Worker `dispatchTrackLocalRetrieval(` | **零** callSites（`apps/worker/src` 仅注释「Does NOT call」） |
| 生产 recheck | **无**（`recheckHitsAtLeaf` / `recheck_failed` **不**出现在 worker src；仅 `packages/db` 合同 seam） |
| 合同 seam | **仍在**：`packages/db/src/qbank-track-local-retrieval.ts` export `dispatchTrackLocalRetrieval` + recheck→`recheck_failed`；domain `validateRetrievalPlan`/`leafTrackId` |
| harness / status P9 / G-R4-1 / GAP-RAG-04 / r5 G4 | **仍钉** 题域隔离 NOT closed；dispatch/recheck **未接线**；G-R4-1 **仍挡关闸** |
| sole allowlist | **未扩**；仍恰 5（wiring / ping / qdrant-backed / vectorstore-adapter / vectorstore-qdrant）；**无** g4/r4/dispatch-recheck |

---

## 2. Prove（本审独立复跑 · CMD+EXIT）

| CMD | EXIT | 摘要 / NOTE 硬读法 |
|-----|------|-------------------|
| `pnpm g4-dispatch-recheck-prereq:prove` | **0** | 合同 seam 完整；Worker callSites=0；R2 零 `classifyJobRoute(`；无 planner→retrieve；harness/status/GAP/REQUEST 钉 NOT closed。NOTE：`honesty PREREQ+fail-closed; NO production dispatch/recheck wire; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false` |
| `pnpm g4-production-scoped-retrieve:prove` | **0** | partial P-WIRE 仍在；**仍无** dispatch。NOTE：`partial P-WIRE; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false` |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | 诚实钉 + partial ok。NOTE：`honesty pins only; partial P-WIRE ok; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false; Not HA` |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** | 同 body；同上 |

**硬读法**：**EXIT=0 只证明「未接线」可执行否定钉 + 产品阻塞登记**；**不得**写成 dispatch/recheck 已齐、R4/G4 已关、题域已隔离、wrong_track=0、covered、HA、`releaseEvidence=true`。

---

## 3. 生产路径独立核验：接线状态

### 3.1 dispatch / recheck / scope（硬表）

| 维度 | 独立结果 | 裁定 |
|------|----------|------|
| **`dispatchTrackLocalRetrieval(`** | `rg`：`apps/worker/src` **零** `dispatchTrackLocalRetrieval\s*\(`；提及仅注释否定（main≈L498、consumer≈L41/L237、scope≈L12） | **仍无** |
| **import 合同 seam** | worker/api src **无** `from …qbank-track-local` / 无消费 dispatch | **仍无** |
| **recheck 生产路径** | worker src **无** `recheckHitsAtLeaf` / `recheck_failed`；recheck 仅 db seam | **仍无** |
| **scope（前序 partial）** | `localRetrieve(..., scope?)` + snapshot 主叶 → optional GUC；缺 snapshot → unscoped | **partial only**（≠ full） |
| **per-turn planner leaf** | worker src **无** `InterviewPlannerOutput`→retrieve/dispatch | **仍无** |
| **`classifyJobRoute(`（R2）** | `apps/api`+`apps/worker` src **零**调用 | **仍开** |
| **fail-closed（无 snapshot）** | 缺 scope **不** fail-closed；走 unscoped | **未齐** |

→ **接线状态**：**dispatch=仍无** · **recheck=仍无** · scope=partial(optional) → **本刀正确为 PREREQ/诚实不接线**；**R4 仍开**。

### 3.2 产品阻塞（本审同意「不假接」）

| 阻塞 | 独立核验 |
|------|----------|
| 无 per-turn InterviewPlannerOutput→RetrievalPlan | worker src 无该路径 |
| R2：apps 无 `classifyJobRoute(` → 多数 job 无 snapshot | 静态零调用成立 |
| 缺 snapshot 仍 unscoped（假 fail-closed 会打爆 legacy） | scope helper / consumer 注释与行为一致 |
| 把主叶硬塞进 RetrievalPlan 而无 generation/recipe/planner = 假绿 | 本刀**未**做此假接线 |

### 3.3 对照前序（partial P-WIRE）

| 前序（scoped retrieve） | 本刀（dispatch/recheck PREREQ） | 不得偷换 |
|------------------------|--------------------------------|----------|
| optional scope 已接线 | **未**补 dispatch/recheck | 不得写成 full P-WIRE |
| 无 dispatch/recheck | **仍无**（本审复核） | 不得写成「下一刀已齐」 |
| R4 NOT closed | **仍 NOT closed** | EXIT=0 ≠ 关闸 |

---

## 4. 对抗：假绿面

| 风险说法 | 裁定 |
|---------|------|
| `g4-dispatch-recheck-prereq:prove` EXIT=0 = **dispatch 已齐 / R4 已关 / 题域已隔离** | **假绿** — 本绿 = **未接线** 诚实钉 + 产品阻塞 |
| 「合同 seam 还在 / recheck_failed 字样在 db」= **Worker 已生产 recheck** | **假绿** — Worker 零调用；seam ≠ 生产消费 |
| 「partial scope 绿 + 本 PREREQ 绿」= **full P-WIRE / wrong_track=0** | **假绿** — partial ≠ full；零生产 wrong_track 证据 |
| 「mw-rag-route 已 pass」= **本域可免审 / 可升格 covered·HA** | **假绿** — 双域独立；本审不采信他域代替 |
| 本绿 = covered / HA / `releaseEvidence=true` / sole cutover | **假绿** — 全程钉 false / Not HA；sole **未**扩 |
| 把「诚实推迟不接线」口头升成「关闸条件已满足可切题库」 | **假绿** — G-R4-1 / r5 G4 / GAP-RAG-04 **仍挡** |

**假绿风险（残留）**：**中（叙事外推）** — 交付文档自身诚实（未接线 / R4 NOT closed / releaseEvidence=false），主要风险是把「PREREQ prove 绿」误读成「dispatch/recheck 已接线或 R4 关」。**只要严格限制批准范围为 honesty PREREQ 登记即可控**。  
**禁止假绿 / 假 covered / 假 HA / `releaseEvidence=true` / 假宣称生产接线。**

---

## 5. REQUEST 四问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本切片是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true` / R4 已关？ | **否**。prove NOTE / harness / status / GAP / REQUEST / r5-G4 均自钉未接线 · Not HA · releaseEvidence=false · ≠ covered · R4 NOT closed；未检出冒充完整 E2E 或已接线 |
| 2 | EXIT=0 是否被文档明确标红为 **≠ 题域已隔离 / ≠ dispatch 已齐 / ≠ wrong_track=0**？ | **是**。harness 假绿表、status P9/G-R4-1、eval 勾选、prove OK 行、GAP-RAG-04、r5 G4 均显式标红 |
| 3 | sole allowlist 是否因本切片扩面？（期望：否） | **否**。独立核验 `SOLE_WIRING_ALLOWLIST` 仍恰 5；无 g4/dispatch-recheck 入表 |
| 4 | 与 G4 并列门（挡切题库/向量）是否仍一致钉 R4 NOT closed？ | **一致**。r5 G4、m4、GAP-RAG-04、本 harness/status 同钉 NOT closed + 并行门 + dispatch/recheck 未接线 |

---

## 6. 阻塞栏（关 R4 / G4 前 · 本审不关）

| 阻塞项 | 现状 | 关闭条件（**未宣称达成**） |
|--------|------|---------------------------|
| **G-R4-1 full wire** | scope 仅 partial；**无** dispatch/recheck；缺 snapshot 仍 unscoped；无 per-turn leaf | full `dispatchTrackLocalRetrieval` + recheck + 缺 snapshot fail-closed + per-turn planner leaf |
| **G-R4-2 wrong_track=0** | 未在生产读面证明 | 伪造/缺失 metadata、未知分类、并发改岗、旧 checkpoint、cache 回放均零跨域 |
| **P-R1 / P-R2 / P-META** | 仍开（含 apps 零 `classifyJobRoute(`） | 见 GAP-RAG-01/02 / RAG-FUNNEL-01 |
| **G-R4-6 / R5** | rag04 等仍绑 pgvector 假绿夹具 | Qdrant/sole 夹具或显式标红退役后再作迁栈证据 |
| **切题库/向量 / sole / HA** | 被 G4 并列门挡住 | R4 + 并列门关闭且双域审；**禁止**本绿勾 releaseEvidence |

**本切片不因上述阻塞而 block「honesty PREREQ 登记」**；上述仅 **阻塞宣称 R4/G4 关 / 题域已隔离 / dispatch·recheck 已齐 / wrong_track=0 / covered / HA**。

---

## 7. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA**
- [x] **EXIT=0 ≠ R4 closed** · **EXIT=0 ≠ dispatch/recheck 已齐** · **≠ 题域已隔离**
- [x] **接线状态：dispatch 仍无 · recheck 仍无**（生产 Worker；已独立 `rg`）
- [x] **R4 仍开**（harness/status/GAP/r5-G4/P9/G-R4-1）
- [x] 诚实不接线：本刀为 PREREQ/清单/钉文，**未**伪装已接线
- [x] sole allowlist **未**因本切片扩面
- [x] 未宣称 covered / HA / `releaseEvidence=true` / sole cutover / flip default
- [x] 批准范围仅 **PREREQ 诚实登记**；**不批接线完成 / R4 关**

---

## 8. 结论与建议

- **裁定：pass**（G4 dispatch/recheck · **honesty PREREQ / fail-closed 登记 only**）
- **批准范围**：登记「关闸前条件 + Worker 仍零 dispatch/recheck + 产品阻塞 + 可执行否定钉」及关联 harness/status/GAP-RAG-04/r5-G4/P9/`pnpm g4-dispatch-recheck-prereq:prove`（绿 ≠ 已齐）
- **明确不批**：关 R4、关 G4、宣称题域已隔离、宣称生产 dispatch/recheck 已接线、wrong_track=0 生产证据、covered、HA、`releaseEvidence=true`、扩 sole allowlist、切 qbank/向量默认
- **下一刀（另切片）**：须先消产品阻塞（planner→RetrievalPlan、R2 classify 生产调用、缺 snapshot fail-closed 策略）后再开 **真实 full wire** 送双域审；**本 pass 不得引用为接线完成或 R4 关闭批准**

对照：`REQUEST-g4-dispatch-recheck-prereq-mw-e2e-ha.md` · `apps/worker/test/g4-dispatch-recheck-prereq.proof.ts` · `apps/worker/src/{main,interview-consumer,qbank-retrieve-scope}.ts` · `packages/db/src/qbank-track-local-retrieval.ts` · `harness/r4-domain-isolation.md` · `r4-domain-isolation-status.md`（P9/G-R4-1）· GAP-RAG-04 · `r5-retirement-sole-stack-status.md` G4 · 前序 `reviews/2026-09-10-g4-production-scoped-retrieve-mw-e2e-ha.md` · 并行 `reviews/2026-09-10-g4-dispatch-recheck-prereq-mw-rag-route.md`
