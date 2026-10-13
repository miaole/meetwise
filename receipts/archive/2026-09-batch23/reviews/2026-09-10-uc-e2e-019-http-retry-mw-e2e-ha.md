# 审查归档 — UC-E2E-019 HTTP report/retry 抬 covered 切片 · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~02:47–02:48 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审）  
**双域**：`mw-model-op` spot 已对 UC-019 HTTP retry 账本/D1 结论 **pass**（见 `reviews/2026-09-10-uc-e2e-019-http-retry-mw-model-op-spot.md`）。**本审不因 spot pass 放水**；E2E/矩阵阶梯独立复跑 prove + 假绿排查后另下结论。  
**结论**：**pass**  
**是否允许 / 维持 partial**：**是**（矩阵维持 **partial** + P1-5；**禁止**升 **covered**）  
**releaseEvidence=false** · **Not HA** · **≠ UC-E2E-019 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk** · **NON-UI** · **无 Key**

## Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc019:report-regenerate:http:prove` | **0** | H1–H4 **34 PASS**；真 `POST /interview/:id/report/retry`；`[R5-MARKED-RED]`（`E2E_PG_IMAGE=pgvector`）；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-47-51-228Z-1124102-987ba712-9929-4465-8bb9-61ffebe96e41.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc019:report-regenerate:http:prove:raw` · `outcome=passed`）；印 `GAP-UC019-REFUND-FIRST-ORDER` / `QUARANTINE-REGEN` / `REGEN-IDEM-KEY` / `HTTP-REGENERATE` / `FULL-E2E` / `DEMAND-PATH` + PRIVACY-STUB |
| `pnpm uc019:report-regenerate:prove` | **0** | G1–G4 **全 PASS**；R5；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-48-02-934Z-1124941-b5b000b5-b396-47a8-9ccf-e076e9a41e15.json`（`releaseEvidence=false`）；印 `BLOCKED_FOR_FULL_E2E` + 同族 GAP |
| `pnpm eval-harness-matrix-cite:prove` | **0** | `uc-e2e-019-report-regenerate` harness+eval 引用矩阵行；钉 partial / ≠covered / releaseEvidence=false / Not HA / `uc019:…:prove` + `uc019:…:http:prove` / §1b / report/retry mouth / UC019 GAP；**matrix: UC-E2E-019 is partial (not covered)**；`does not claim covered` |

### H1–H4 核对（实测）

| ID | 声称 | 本审结果 |
|----|------|----------|
| **H1** | failed → HTTP `POST …/report/retry`：首次 200 `requeued:true`→queued；二/三次 404；HTTP 额度不扣；confirmed | **PASS**（真口；连点幂等；regenerate 免费口径） |
| **H2** | HTTP retry ∥ `releaseConsumption`：release→`already_confirmed`；无 `released∧(queued\|running)`；额度不退 | **PASS**（retry 赢→queued∧confirmed；非法组合否） |
| **H3** | A3 退款先赢 **GAP** + quarantined HTTP retry → **404** `no_retriable_report` | **PASS**（诚实钉 BLOCKED；印 `GAP-UC019-REFUND-FIRST-ORDER` / `GAP-UC019-QUARANTINE-REGEN`） |
| **H4** | 无 regenerate* 列；`POST /reports/:id/regenerate`→404；retry 未鉴权→401；GAP pins | **PASS**（demand-path / regenerateAttempt 诚实缺口；≠产品闭环） |

### G1–G4 核对（原 prove 复跑）

| ID | 本审结果 |
|----|----------|
| G1 / G2 / G3 / G4 | **PASS**（与先前 db 切片一致；仍印 BLOCKED_FOR_FULL_E2E；requeue 代理 ≠ regenerateAttempt 产品口） |

## 硬钉（勾选）

- [x] **≠ covered**（HTTP 34 PASS ≠ UC-E2E-019 covered；cite 亦钉；矩阵行 **partial**；§1b 仍缺）
- [x] **R5 green-risk**（isolated → pgvector；banner 已印；≠ sole-stack / HA）
- [x] **releaseEvidence=false** · Not HA
- [x] **未把 `POST …/report/retry` 绿写成 regenerate 闭环 / `POST /reports/:id/regenerate` covered**
- [x] 未把 G3/H3/H4 EXIT=0 写成 A3 / regenerateAttempt / demand-path / quarantine 出口已闭环
- [x] 未把 `uc011` / `report:prove` / `commerce:prove` 冒充本 UC 专用验收
- [x] 真口核对：`interview.controller` `@Post(':id/report/retry')` → `retryReport` → `requeueFailedReport`（仅 `status='failed'→queued` CAS）；receipt 含 controller/service/report digests；**非** stub route
- [x] `e2e/full.e2e.ts` **无** regenerate / report/retry 场景引用（本审 grep 计数 **0**）→ FULL-E2E 缺口诚实
- [x] 双域：model-op spot pass ≠ 本审 E2E 阶梯放行；**禁因 spot 升 covered**

## 假绿排查（优先：POST retry 绿冒充 regenerate 闭环 / 假升 covered）

| 风险说法 | 裁定 |
|---------|------|
| `uc019:…:http:prove` 34 PASS = **covered** / regenerate 产品闭环 | **否** — 聚焦 HTTP `report/retry`；最多 **partial**；§1b 仍缺 regenerateAttempt / A3 / quarantine 出口 / full.e2e / demand-path ADR |
| `POST …/report/retry` 绿 = `POST /reports/:id/regenerate` **已落地 covered** | **否** — H4 实测 demand-path **404**；产品口 ≠ 需求名路径；钉 `GAP-UC019-DEMAND-PATH` / `GAP-UC019-HTTP-REGENERATE` |
| H1 连点幂等绿 = `(interviewId, regenerateAttempt)` 幂等键 **已产品化** | **否** — 仅 failed CAS via `requeueFailedReport`；`ai_report` **无** regenerate* 列（H4/G4）；钉 `GAP-UC019-REGEN-IDEM-KEY` |
| H3 quarantine 404 EXIT=0 = quarantine 免费 regenerate **已闭环** | **否** — SELECT 含 quarantined 但 requeue 仅 failed→queued → HTTP 404 **BLOCKED**；诚实 GAP，≠出口 covered |
| H3/H4 EXIT=0 = A3「退款先到→released→regen 拒」**已闭环** | **否** — confirmed 上 release→`already_confirmed`；无 confirmed→released 产品口；诚实钉 |
| `uc019:report-regenerate:prove`（db）绿 = covered | **否** — requeue 代理 only；先前 HA 已钉；本波叠加 HTTP 仍 ≠ covered |
| model-op spot pass → 可升 covered / 放水阶梯 | **否** — spot 仅 D1/账本旁证；本审独立复跑；**互不替代** |
| `uc011` R2/H2 绿 = 019 covered | **否** — 仅 quarantine 不可 requeue；≠ regenerate×退款并发 G*/H* |
| isolated/pgvector 绿 = sole-stack / HA / releaseEvidence | **否** — R5 mark-red；receipt `releaseEvidence=false` |
| GAP pins / honesty `A(..., true)` EXIT=0 = gap 关闭 | **否** — 诚实钉；prove/harness 明示「抬 covered 仍缺」 |

**partial 是否诚实**：**是**。db G1–G4 + 真 HTTP H1–H4 可执行合同已绿，足以**维持**矩阵 **partial** + P1-5「集成+HTTP prove 已挂」；harness §1b / 矩阵行 / cite / prove GAP pins 均明示 ≠ covered；**未**因 POST retry 绿假升 covered，**未**把 report/retry 冒充 demand-path / regenerateAttempt 闭环。

**§1b / 声称 GAP 是否诚实**：**是**。实现方诚实 GAP（regenerateAttempt、A3、quarantine exit、demand-path、full.e2e）与 harness §1b 六项、H4/G3/G4 PIN、矩阵「仍缺」、`full.e2e.ts` 零命中、service 仅 failed CAS 对齐；非空话标签。

## 阻塞栏（升 covered / 全链路前必填）

| 阻塞项 | 现状 | 关闭条件 |
|--------|------|----------|
| 幂等键 `(interviewId, regenerateAttempt)` | `ai_report` **无** regenerate* 列；仅 `requeueFailedReport` failed→queued CAS；H4 钉 `GAP-UC019-REGEN-IDEM-KEY` | schema/API 落 regenerateAttempt（或等价）+ 连点仅一次产品口断言（非仅 status CAS） |
| A3 退款先赢→released→regen 拒 | `releaseConsumption` 对 confirmed→`already_confirmed`；**无** confirmed→released 产品口；H3 钉 `GAP-UC019-REFUND-FIRST-ORDER` | 产品路径（或正式 ADR 降级）可执行后：退款先到→released→regen/retry 拒且可解释 |
| quarantined 免费 regenerate 出口 | `retryReport` SELECT 含 quarantined，但 `requeueFailedReport` 仅 failed→queued → HTTP **404**；H3 钉 `GAP-UC019-QUARANTINE-REGEN` | 产品 quarantine→regen 出口接线 **或** ADR「quarantine 终态不可 regen」+ 与额度守卫合同后再评；**禁止**借 404 冒充出口 covered |
| 需求名 `POST /reports/:id/regenerate` | H4 实测 **404**；产品口是 `report/retry`；钉 `GAP-UC019-DEMAND-PATH` | 需求路径落地 **或** 正式 ADR 降级为 `POST /interview/:id/report/retry`（本 prove 已钉 retry ≠ demand-path covered） |
| `full.e2e.ts` / `e2e:isolated` 显式 regenerate/retry TC | 聚焦 http prove 已绿；`full.e2e.ts` **0** 命中；钉 `GAP-UC019-FULL-E2E` | 鉴权→failed report→`POST …/report/retry`（或正式 regenerate）+ 额度并发进 isolated 复跑绿后复评 |
| fixture=pgvector → R5 / sole-stack | isolated 仍 pgvector；≠ MySQL+Qdrant+Redis | 按 sole-stack 迁或持续 mark-red；**不因本绿宣称 HA** |
| 完整 0058 privacy fence | `_neg-harness` minimal stub（`GAP-UC019-PRIVACY-STUB`）；spot pass ≠ fence covered | 载入真实 privacy fence；**禁止**借 stub/spot 宣称隐私 covered |

**本切片不因上述阻塞而 block partial**；上述仅 **阻塞升 covered / 宣称全链路 E2E covered / 把 POST report/retry 绿或 model-op spot 写成 regenerate 闭环 covered**。

## 结论与建议

- **pass**；**允许并维持**矩阵 **partial**（P1-5）；**禁止 covered**（含：禁止因 HTTP 34 PASS 或 model-op spot pass 升阶；禁止把 `report/retry` 写成 regenerateAttempt / demand-path 闭环）
- HTTP 合同诚实：真 `@Post(':id/report/retry')` → `requeueFailedReport`；H1–H4；GAP / stub pins 齐；§1b 诚实
- 对抗裁定：**POST retry 绿 ≠ 假升 covered**；**≠ regenerate 产品闭环 covered**；声称 GAP **诚实**
- 双域：`mw-e2e-ha` = pass（阶梯/假绿）；`mw-model-op` HTTP spot = pass（D1/账本）——**互不替代、不放水**
- 下一刀 P1：regenerateAttempt 幂等键 + demand-path ADR 或正式 regenerate 口；并行 A3 confirmed→released→regen 拒与 quarantine regen 出口；再进 `full.e2e`
- 对照：`harness/uc-e2e-019-report-regenerate.md` §1b · `eval/uc-e2e-019-report-regenerate.eval.md` · `apps/api/test/uc-e2e-019-report-regenerate-http.proof.ts` · `packages/db/test/uc-e2e-019-report-regenerate.proof.ts` · 矩阵 `UC-E2E-019` / P1-5 · 前审 `reviews/2026-09-10-uc-e2e-019-mw-e2e-ha.md` · spot `reviews/2026-09-10-uc-e2e-019-http-retry-mw-model-op-spot.md`
