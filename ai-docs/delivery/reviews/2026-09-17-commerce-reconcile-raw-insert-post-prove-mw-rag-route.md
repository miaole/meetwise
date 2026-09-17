# Review — Knife **commerce-reconcile raw INSERT / missing `interviewId`** **post-prove** · mw-rag-route

**专家**：mw-rag-route  
**日期**：2026-09-17（~00:59 PT；对抗独立审 · **不采信**实现方自报 EXIT；实现方禁止自批）  
**结论**：**pass**（限：post-prove honesty — B 端 seed 对齐 R2 createJob→rule-classify→start · 专家独立复跑 EXIT=0 · **≠ RAG-FUNNEL-01 closed / ≠ R4 closed / ≠ 题域已隔离 / ≠ sole cutover / ≠ suite green / ≠ R5/G6/HA** · `releaseEvidence=false` · Ban forge route_decided · no self-approve）  
**硬钉**：**EXIT=0 ≠ FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green ≠ R5 retired ≠ G6 closed ≠ sole cutover ≠ knife product-done** · **R2 前置对齐 ≠ FUNNEL/R4 关刀** · **Ban forge route_decided** · **Ban secrets in repo（HMAC = proof 非生产字面量）** · **no self-approve** · HEAD `6cb6f88` · 未读 `.env*` · **Ban claiming R4 closed** · **Ban claiming FUNNEL-01 closed**  
**配对**：mw-e2e-ha · 本审不代签 · 本审不代改 harness（coordinator 可在双域齐后 → `post_prove_dual_pass` · 仍 ≠ FUNNEL-01/R4 closed · ≠ suite/HA）

覆盖 REQUEST：`REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md`  
对照：`apps/worker/test/commerce-reconcile.proof.ts` · `packages/db/src/commerce.ts`（本刀未改；空 key 守卫为 adaptive-life 遗留）· R2 P-START（无 `route_decided` 不得启动）· PR #108 · branch `feat/mysql-schema-skeleton` · 同形 adaptive-life B seed 先例

**本审动作**：读 REQUEST · 核对 commit `6cb6f88` diff（仅 proof B seed + docs/REQUEST；**零** production routing/qbank/FUNNEL 文件）· **独立** `pnpm commerce-reconcile:prove` · 确认 HEAD=宣称 SHA · RAG/routing/qbank/sole/metadata 正交性裁定 · **零** invent Key · **未读** `.env*` · **零** 自批 suite/R5/G6/HA/FUNNEL/R4 · **未改** production 代码（仅写本 review）

---

## 0. Verdict table

| Item | Ruling |
|------|--------|
| **Verdict** | **pass** |
| **Scope** | **post-prove honesty only** — commerce-reconcile B-side seed 对齐 R2；**NOT** close FUNNEL-01 / R4 / 题域 / sole / suite / R5 / G6 / HA |
| Implementer self-approve | **rejected** |
| `pnpm commerce-reconcile:prove`（expert re-run） | **EXIT=0** |
| HEAD / SHA | `6cb6f888a6830d5058af9cd2ab121b9a1fe2b05c` · **matches** claimed `6cb6f88` · **no drift** |
| B seed R2 honesty | **agree** — createJob → classifyJobRoute（rule_decided）→ invite → start → reserve(real interviewId)；**未** forge route_decided |
| Production routing / qbank / FUNNEL | **正交未改**（commit 无 prod routing/qbank/FUNNEL 文件；仅 proof + docs） |
| Empty-key guard | **未触**本刀 — `commerce.ts` 守卫为 adaptive-life 遗留；本刀未改 |
| `RAG_JOB_ROUTE_INPUT_HASH_KEY` | **proof-only** 非生产字面量（`…-not-production-01`）· Ban secrets |
| `releaseEvidence` | **false** |
| Blockers（this domain） | **none**（pair independent） |
| RAG-orthogonality | **yes** |

---

## 1. Independent re-run（~00:59 PT · HEAD `6cb6f88`）

| CMD | EXIT | Read |
|-----|------|------|
| **`pnpm commerce-reconcile:prove`** | **0** | §①–⑥ orphan/live/confirm/idempotent/concurrent/quiz PASS；§⑦ B 端 route seed + orphan release + attempt=2 PASS；≠ FUNNEL-01/R4 关 · ≠ suite/HA |

**Receipt highlights（本审捕获）**

- Isolation：`E2E_ISOLATION_STACK=pgvector-legacy` · R5-MARKED-RED banner 仍在 · **local green ≠ RAG migrated** · `releaseEvidence=false` · Not HA
- Migrations：applied=133 · `rag_control_manifest=not_requested` · `qbank_control_manifest=not_requested`
- §⑦ B 端：`PASS  B 端岗位 rule-classified route_decided（start 前置）`
- §⑦ B 端：`PASS  B 端 startApplicationInterview 返回 interviewId`
- §⑦：assessment_unavailable / released 恰一次 / attempt=2 恢复 PASS
- Final：`✓ C1 对账兜底调度侧:孤儿预留回收+终态事件+结算入账+幂等+并发安全 全部通过`
- Shell：**EXIT=0**

**SHA drift**：`git rev-parse HEAD` = `6cb6f888a6830d5058af9cd2ab121b9a1fe2b05c` · short `6cb6f88` · branch `feat/mysql-schema-skeleton` · **与 REQUEST 宣称一致 · 无 drift**

**Key**：本审未 invent · 未读 `.env*` · proof 内 `RAG_JOB_ROUTE_INPUT_HASH_KEY ??= 'commerce-reconcile-job-route-input-hmac-proof-key-not-production-01'` 仅为 test-only HMAC（同 adaptive-life/rag03/r4 proof 模式）

---

## 2. REQUEST Q1–Q4（rag-route answers）

| # | Q | Answer |
|---|---|--------|
| **1** | 独立复跑 `pnpm commerce-reconcile:prove`，附 CMD+EXIT？ | **Done** — **EXIT=0**（~00:59 PT · HEAD `6cb6f88`）；banner 含 R5-MARKED-RED / releaseEvidence=false / Not HA |
| **2** | B 端 seed 是否诚实对齐 R2（createJob → classify → start）且未 forge？生产路由/qbank/FUNNEL 是否正交未改？ | **Agree** — 真实调用 `createJob` + `classifyJobRoute`；`modelClassify` 故意 throw → 强制 rule path；断言 `status===route_decided && attemptOutcome===rule_decided`；start 后取真实 `interviewId` 再 `reserveEntitlement`；**无**直接 INSERT `route_decided` / 伪造 decision 行。**生产路由/qbank/FUNNEL 正交未改**（commit 文件集仅 proof + ai-docs） |
| **3** | EXIT=0 是否仍钉 ≠ FUNNEL-01 / ≠ R4 / ≠ suite green / ≠ R5/G6/HA / releaseEvidence=false？ | **Yes（hard）** — 本绿 = commerce-reconcile B seed CI 对齐；**不**关 FUNNEL/R4/题域/sole/suite/R5/G6/HA |
| **4** | `RAG_JOB_ROUTE_INPUT_HASH_KEY` 是否仅为 proof 非生产字面量（Ban secrets）？ | **Yes** — 字面量含 `not-production` · `??=` 仅 proof 进程内 · **非**生产密钥 · **Ban** 当 secrets 入库 |

---

## 3. RAG / routing / qbank / sole / metadata（正交裁定）

| Point | Ruling |
|-------|--------|
| **触碰面** | 本刀触及 **R2 路由前置**（classify → bind → start）——但仅在 **commerce-reconcile proof B seed** 对齐，使 P-START 能拿到 interviewId |
| **生产路由** | **未改** `classifyJobRoute` / job-route-decision / P-START 生产实现；仅 proof 调用既有 API |
| **Forge?** | **否** — rule unique leaf（nestjs/express/koa）经真实 classify；model 路径故意失败；断言 `rule_decided` |
| **qbank 隔离 / R4 / FUNNEL-01** | **正交** — 无 qbank corpus / metadata review / serving product / domain isolation 变更 |
| **sole allowlist** | **正交** — commerce-reconcile **不在** sole 恰 5；本 prove 走 **pgvector-legacy** isolation（R5-MARKED-RED）；**≠** sole cutover · **≠** RAG migrated |
| **metadata / P-META** | **正交** — 无 MetadataReviewReceipt / facets / serving wire |
| **诚实读法** | CI prove 对齐 R2 前置 ≠ RAG-FUNNEL-01 closed ≠ R4 closed ≠ 题域已隔离 ≠ HA ≠ suite green |
| **RAG-orthogonality** | **yes** |

---

## 4. Diff 诚实读（本审）

| File | Change | RAG 读法 |
|------|--------|----------|
| `apps/worker/test/commerce-reconcile.proof.ts` | 旧 raw `job_posting` INSERT → `createJob` + `classifyJobRoute`（rule）+ invite/start；断言 interviewId；test-only HMAC | **proof seed 诚实对齐 R2** · ≠ forge · ≠ FUNNEL/R4 关 |
| `packages/db/src/commerce.ts` | **本刀未改** | 空 key 守卫属 adaptive-life 遗留；本刀不碰 |
| ai-docs harness/slice/eval + REQUEST dual | 文档对齐 post-prove | **docs only** · ≠ 产品关 |

根因对齐 REQUEST：跳过 classify → start=`interview_ineligible_route`（无 interviewId）→ `reserve(undefined)` 炸 NOT NULL → CI fail。本修最小且诚实（同形 adaptive-life B）。

---

## 5. Fake-green bans（this review）

- Ban：EXIT=0 → FUNNEL-01 closed / R4 closed / 题域已隔离 / sole cutover / HA / suite green / R5 retired / G6 closed  
- Ban：B seed rule-classify PASS → RAG routing 产品关闸 / forge route_decided 合法化  
- Ban：pgvector-legacy commerce-reconcile 绿 → RAG migrated / sole flip  
- Ban：commerce 空 key 守卫（他刀遗留）→ 权益/HA 产品关  
- Ban：实现方 REQUEST = expert pass · self-approve  
- Ban：proof HMAC 字面量当 production secret · invent Live Key  
- Ban：single-domain pass = dual-complete without pair

---

## 6. Approve / do-not-approve

**Approve**：post-prove honesty that `pnpm commerce-reconcile:prove` independently EXIT=0 at HEAD `6cb6f88`；B 端 seed 诚实对齐 R2（createJob → rule-classify → start → reserve real interviewId）· 未 forge route_decided · 生产路由/qbank/FUNNEL **正交未改** · HMAC 仅为 proof 非生产字面量 · `releaseEvidence=false` · RAG/qbank/sole/metadata **正交=yes** · ≠ FUNNEL-01/R4/suite/R5/G6/HA · no self-approve.

**Do not approve**：RAG-FUNNEL-01 closed · R4 closed · 题域已隔离 · sole cutover · HA · suite green · R5 retired · G6 closed · `releaseEvidence=true` · forge route_decided · treating this green as RAG product close · treating this single-domain pass as dual-complete without pair.

---

## 7. 仍开 / 阻塞

| 类 | 项 |
|----|-----|
| **本域 post-prove honesty** | **无阻塞**（独立 EXIT=0 · R2 seed 诚实 · SHA match · RAG-orthogonal=yes → pass） |
| **suite / G6 / R5 / HA / product** | **仍开** |
| **仍开 siblings** | FUNNEL-01 · R4 / 题域隔离 · sole ≠ retired · R5 pgvector-legacy · G6 BUG-E2E-ISO · ≠ RAG migrated |
| **配对** | mw-e2e-ha 独立；本审不代签 |

---

## 8. Receipt

- Expert：`mw-rag-route`
- Cover：`REQUEST-2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md`
- Conclusion：`ai-docs/delivery/reviews/2026-09-17-commerce-reconcile-raw-insert-post-prove-mw-rag-route.md`
- HEAD / SHA：`6cb6f888a6830d5058af9cd2ab121b9a1fe2b05c`（matches claimed · no drift）
- Expert EXIT：`pnpm commerce-reconcile:prove` → **EXIT=0**（~00:59 PT）
- Confirm：B seed R2 honesty · no forge · HMAC proof-only · RAG/qbank/sole/metadata 正交=yes · 生产路由/FUNNEL/R4/qbank **未改** · EXIT=0 ≠ FUNNEL-01/R4/题域/sole/HA/suite/R5/G6 · `releaseEvidence=false` · 未读 `.env*` · 拒绝自批 · 配对独立 · **Ban R4 closed** · **Ban FUNNEL-01 closed** · **本审不代改 harness / 不改 production**

---

*Review · mw-rag-route · commerce-reconcile raw INSERT post-prove · 2026-09-17 ~00:59 PT · **pass**（honesty only）· expert EXIT=0 · SHA 6cb6f88 · releaseEvidence=false · ≠HA · ≠R4 closed · ≠FUNNEL-01 closed · RAG-orthogonal=yes · Ban forge · no self-approve*
