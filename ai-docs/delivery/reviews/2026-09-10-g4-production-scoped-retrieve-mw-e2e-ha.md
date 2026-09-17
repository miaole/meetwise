# 审查归档 — G4 production scoped retrieve · P-WIRE（partial）· mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~04:09 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；**不采信实现方自报**；实现方禁止自批）  
**送审对照**：`reviews/REQUEST-g4-production-scoped-retrieve-mw-e2e-ha.md`  
**结论**：**pass**（仅 **partial P-WIRE 登记**）  
**批准范围**：**仅** production scoped retrieve **partial** 接线登记（`localRetrieve` 可转发 optional `scope`；consumer 从 snapshot 主叶解析；`qbank-retrieve-scope.ts`；`pnpm g4-production-scoped-retrieve:prove`；harness/status/GAP-RAG-04/r5-G4 诚实更新）  
**不批**：**R4 关闭** / **G4 关闭** / 题域已隔离 / 生产完整隔离 / full `dispatchTrackLocalRetrieval` / recheck 生产路径 / wrong_track=0 / covered / HA / `releaseEvidence=true` / sole cutover / flip default / 切 qbank·向量真相  
**硬钉**：`releaseEvidence=false` · **Not HA** · **EXIT=0 ≠ R4 closed** · **partial ≠ 题域已隔离** · **无 dispatch/recheck** · **R4 仍开** · **缺 snapshot 仍 unscoped**

---

## 1. 送审对照（不采信 · 独立复核）

| 送审项 | 本审结果 |
|--------|----------|
| REQUEST 自承 partial / 非关 R4 / 非 covered·HA | **属实**；本审独立签核，**非**实现方自批 |
| `qbank-retrieve-scope.ts` | **存在**；主叶 max-bps → `QbankServingScopeInput`；缺/无效 → `undefined`；自钉 ≠ dispatch / ≠ wrong_track=0 |
| `main.ts` `localRetrieve` | **已**接受 `scope?` 并转发进 `cachedQbankSearch` + `qbankQuestionResultsForHits`；注释钉 partial / GAP-RAG-04 |
| `interview-consumer.ts` | **已** `getInterviewRouteSnapshot` → `resolveServingScopeFromRouteSnapshot` → 闭包传入 retrieve |
| `dispatchTrackLocalRetrieval` 生产调用 | **无**（worker `src` 仅注释提及；**零** `dispatchTrackLocalRetrieval(` 调用） |
| recheck 生产路径 | **无**（recheck 仅在 `packages/db` 合同 seam / rag04 prove-shell；Worker 未走 plan+recheck） |
| harness / status / GAP-RAG-04 / r5 G4 | **仍钉** 题域隔离 NOT closed；G-R4-1 改为「仅 partial」但仍挡关闸 |
| sole allowlist | **未扩**；仍恰 5（wiring/ping/qdrant-backed/vectorstore-adapter/vectorstore-qdrant）；**无** g4/r4 |

---

## 2. Prove（本审独立复跑 · CMD+EXIT）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm g4-production-scoped-retrieve:prove` | **0** | resolver unit + 静态：main 转发 scope；consumer 解析 snapshot；**无** dispatch；harness/status 钉 NOT closed；NOTE：`partial P-WIRE; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false` |
| `pnpm mysql-stack:r4-domain-isolation:prove` | **0** | 诚实钉 + partial P-WIRE 静态断言；NOTE：`honesty pins only; partial P-WIRE ok; R4 NOT closed; ≠ wrong_track=0; releaseEvidence=false; Not HA` |
| `pnpm conn-stack:r4-domain-isolation:prove` | **0** | 同 body；同上 |

**硬读法**：**EXIT=0 只证明 partial 接线 + 否定钉可执行**；**不得**写成 R4/G4 已关、题域已隔离、wrong_track=0 已证、covered、HA、`releaseEvidence=true`。

---

## 3. 生产路径独立核验：wiring 实际状态

### 3.1 scope / dispatch / recheck（硬表）

| 维度 | 独立结果 | 裁定 |
|------|----------|------|
| **scope 转发** | `main.ts` ≈ L499–533：`localRetrieve(owner, q, scope?)` → `cachedQbankSearch(..., scope)` + `qbankQuestionResultsForHits(..., scope)` | **有（optional）** |
| **scope 来源** | consumer：`getInterviewRouteSnapshot` → `resolveServingScopeFromRouteSnapshot`（**主叶 max allocationBps only**） | **有（partial）** |
| **缺 snapshot** | resolver 返回 `undefined` → **legacy unscoped** 路径保留 | **GAP 仍在**（R2 PREREQ） |
| **`dispatchTrackLocalRetrieval`** | `apps/worker/src` **无调用**（仅注释否定）；合同仍在 `packages/db/src/qbank-track-local-retrieval.ts` | **无（full wire 未齐）** |
| **recheck** | Worker 生产路径 **无** plan CAS / `recheck_failed` / 投影权威重验；recheck 属 dispatch seam | **无** |
| **per-turn planner leaf** | 仅 snapshot 主叶；非图内 planner 当轮 leaf | **无** |
| **fail-closed（无 scope）** | 缺 scope **不** fail-closed；走 unscoped | **未齐** |

→ **wiring 实际状态**：`scope=partial(optional)` · `dispatch=无` · `recheck=无` → **必须标 partial only**；**R4 仍开**。

### 3.2 对照前序审（G4 R4 domain isolation）

| 前序（诚实钉 only） | 本刀 | 不得偷换 |
|--------------------|------|----------|
| production `localRetrieve` **仍无 scope** | **已** optional scope 转发 | 不得写成「题域已隔离」 |
| 无 `dispatchTrackLocalRetrieval` | **仍无** | 不得写成 full P-WIRE / R4 关 |
| R4 NOT closed | **仍 NOT closed** | EXIT=0 ≠ 关闸 |

### 3.3 并列 PREREQ（仍开 · 本审核验）

| ID | 现状 |
|----|------|
| **P-R1** | 仍开（legacy 技术岗默认） |
| **P-R2** | `apps/api`+`apps/worker` src **无** `classifyJobRoute(` → 多数 job 无 snapshot → scope 常 `undefined` |
| **P-META** | MetadataReviewReceipt / RAG-FUNNEL-01 未关 |
| **P-WIRE full** | dispatch + recheck + per-turn leaf + 缺 snapshot fail-closed **未齐** |
| **G-R4-2** | wrong_track=0 **未**在生产读面证明 |

---

## 4. 对抗：假绿面

| 风险说法 | 裁定 |
|---------|------|
| `g4-production-scoped-retrieve:prove` EXIT=0 = **R4 已关 / 题域已隔离** | **假绿** — 只证 partial wire + 否定钉 |
| 「main 传了 scope」= **生产完整隔离 / wrong_track=0** | **假绿** — optional；缺 snapshot 仍 unscoped；无 dispatch/recheck；零生产 wrong_track 证据 |
| 「partial 绿 = G4/R4 关 / 可切题库·向量」 | **假绿** — r5 G4 / m4 §R4 / GAP-RAG-04 仍挡切流 |
| `rag04-track-local:prove` 绿 = 本刀生产隔离已证 | **假绿** — prove-shell + R5 假绿族；≠ Worker full wire |
| 本绿 = covered / HA / `releaseEvidence=true` / sole cutover | **假绿** — 全程钉 false / Not HA；sole allowlist 未扩 |
| 把 partial 登记口头升成「dispatch/recheck 已齐」 | **假绿** — 源码零调用 |

**假绿风险（残留）**：**中偏高（叙事外推）** — 交付文档自身诚实（partial / R4 NOT closed），主要风险是把「开始传 scope」误读成「题域已隔离 / R4 关 / wrong_track=0」。**只要严格限制批准范围为 partial P-WIRE 登记即可控**。  
**禁止假绿 / 假 covered / 假 HA / `releaseEvidence=true`。**

---

## 5. REQUEST 四问（mw-e2e-ha）

| # | 问题 | 本审回答 |
|---|------|----------|
| 1 | 本切片是否错误冒充完整 E2E / covered / HA / `releaseEvidence=true`？ | **否**。prove/docs/REQUEST 自钉 partial · Not HA · releaseEvidence=false · ≠ covered；未检出冒充完整 E2E |
| 2 | partial scoped retrieve 绿是否被文档明确标红为 **≠ 题域已隔离 / ≠ wrong_track=0**？ | **是**。harness §0/§1.3、status P4/G-R4-1、prove NOTE、GAP-RAG-04、r5 G4 均显式标红 |
| 3 | sole allowlist 是否因本切片扩面？（期望：否） | **否**。独立核验仍恰 5；无 g4/r4 入表 |
| 4 | 与 G4 并列门（挡切题库/向量）表述是否仍一致（R4 NOT closed）？ | **一致**。r5 G4、m4、GAP-RAG-04、本 harness/status 同钉 NOT closed + 并行门 |

---

## 6. 阻塞栏（关 R4 / G4 前 · 本审不关）

| 阻塞项 | 现状 | 关闭条件（**未宣称达成**） |
|--------|------|---------------------------|
| **G-R4-1 full wire** | scope **仅 partial**；无 dispatch/recheck；缺 snapshot 仍 unscoped；无 per-turn leaf | full `dispatchTrackLocalRetrieval` + recheck + 缺 snapshot fail-closed + per-turn planner leaf |
| **G-R4-2 wrong_track=0** | 未在生产读面证明 | 伪造/缺失 metadata、未知分类、并发改岗、旧 checkpoint、cache 回放均零跨域 |
| **P-R1 / P-R2 / P-META** | 仍开 | 见 GAP-RAG-01/02 / RAG-FUNNEL-01 |
| **G-R4-6 / R5** | rag04 等仍绑 pgvector 假绿夹具 | Qdrant/sole 夹具或显式标红退役后再作迁栈证据 |
| **切题库/向量 / sole / HA** | 被 G4 并列门挡住 | R4 + 并列门关闭且双域审；**禁止**本绿勾 releaseEvidence |

**本切片不因上述阻塞而 block「partial P-WIRE 登记」**；上述仅 **阻塞宣称 R4/G4 关 / 题域已隔离 / wrong_track=0 / covered / HA**。

---

## 7. 硬钉勾选

- [x] `releaseEvidence=false` · **Not HA**
- [x] **EXIT=0 ≠ R4 closed** · **partial ≠ 题域已隔离**
- [x] **scope：partial（optional 转发）** — 已独立核验
- [x] **dispatch：无** · **recheck：无**（生产 Worker）
- [x] **R4 仍开**（harness/status/GAP/r5-G4）
- [x] 缺 snapshot → **仍 unscoped**（非 fail-closed）
- [x] sole allowlist **未**因本切片扩面
- [x] 未宣称 covered / HA / `releaseEvidence=true` / sole cutover / flip default
- [x] 批准范围仅 **partial P-WIRE 登记**；**不批 R4/G4 关闭**

---

## 8. 结论与建议

- **裁定：pass**（G4 production scoped retrieve · **partial P-WIRE 登记 only**）
- **批准范围**：登记 Worker optional-scope 接线 + snapshot 主叶解析 helper + `pnpm g4-production-scoped-retrieve:prove` + harness/status/GAP-RAG-04/r5-G4 诚实更新（partial ≠ 关）
- **明确不批**：关 R4、关 G4、宣称题域已隔离、宣称生产完整隔离、宣称 dispatch/recheck 已齐、wrong_track=0 生产证据、covered、HA、`releaseEvidence=true`、扩 sole allowlist、切 qbank/向量默认
- **下一刀（另切片）**：full `dispatchTrackLocalRetrieval` + recheck + 缺 snapshot fail-closed + R1/R2/META 齐后，再开 **wrong_track=0 生产读面** 送双域审；**本 pass 不得引用为 R4 关闭批准**

对照：`REQUEST-g4-production-scoped-retrieve-mw-e2e-ha.md` · `apps/worker/src/main.ts`（localRetrieve）· `apps/worker/src/interview-consumer.ts` · `apps/worker/src/qbank-retrieve-scope.ts` · `apps/worker/test/g4-production-scoped-retrieve.proof.ts` · `packages/db/src/qbank-track-local-retrieval.ts` · `harness/r4-domain-isolation.md` · `r4-domain-isolation-status.md` · GAP-RAG-04 · `r5-retirement-sole-stack-status.md` G4 · 前序 `reviews/2026-09-10-g4-r4-domain-isolation-mw-e2e-ha.md`
