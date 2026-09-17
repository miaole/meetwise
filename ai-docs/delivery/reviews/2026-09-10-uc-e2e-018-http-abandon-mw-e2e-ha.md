# 审查归档 — UC-E2E-018 HTTP abandon 抬 covered 切片 · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~02:24–02:25 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审）  
**双域**：`mw-privacy-int` spot 已对 UC-018 HTTP abandon 结论 **pass**（隐私/stub/authz 旁注）。**本审不因 spot pass 放水**；不得借 stub/spot 升 covered / 宣称 0058 擦除或全链路 E2E covered。E2E/矩阵阶梯独立复跑 prove + 假绿排查后另下结论。  
**结论**：**pass**  
**是否允许 / 维持 partial**：**是**（矩阵维持 **partial** + P0-8；**禁止**升 **covered**）  
**releaseEvidence=false** · **Not HA** · **≠ UC-E2E-018 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk** · **NON-UI** · **无 Key**

## Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc018:abandon:http:prove` | **0** | H1 / H1-shell / H2 / H3 / H-authz+terminal + honesty **共 36 PASS**；真 `POST /interview/:id/abandon`；`[R5-MARKED-RED]`（`E2E_PG_IMAGE=pgvector`）；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-24-34-526Z-954290-1da65473-c31e-4efb-88aa-859ea19f3a9a.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc018:abandon:http:prove:raw` · `outcome=passed`）；印 `GAP-UC018-PRIVACY-STUB` / `LIST-SCHEMA-STUB` + GRAPH / TTL / WAITING-USER / FULL-E2E |
| `pnpm uc018:abandon:prove` | **0** | A1 / A1-shell / A2 / A3 / A-created-reserved（db 集成）；R5；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-24-46-450Z-955048-305622bc-f534-4c20-848c-1c1f9186ffc9.json`（`releaseEvidence=false`）；印 `BLOCKED_FOR_FULL_E2E` |
| `pnpm eval-harness-matrix-cite:prove` | **0** | `uc-e2e-018-user-abandon` harness+eval 引用矩阵行；钉 partial / ≠covered / releaseEvidence=false / Not HA / `uc018:abandon:prove` + `uc018:abandon:http:prove` / §1b 抬 covered；**matrix: UC-E2E-018 is partial (not covered)**；`does not claim covered` |

### H1–H3 + H-authz 核对（实测）

| ID | 声称 | 本审结果 |
|----|------|----------|
| **H1** | HTTP active+reserved → 200 abandoned+released；额度净变 0 | **PASS**（reserve→reserved；额度 -1→回补；body `abandoned=true`/`released=released`；DB 终态） |
| **H1-shell** | HTTP created 空壳 → 200 `released=noop`；额度不变 | **PASS** |
| **H2** | 二次 alreadyAbandoned+noop；`POST …/begin` → **409** `interview_not_active` | **PASS**（不双退；不可复活） |
| **H3** | GET/list abandoned 可读；create 不复用 abandoned dead | **PASS** |
| **H-authz** | 越权 404 / 未鉴权 401 / 不存在 404；completed/failed → 409 | **PASS**（≠ 0058 privacy fence covered；minimal stub） |
| **honesty** | GAP pins 已印；HTTP 绿 ≠ covered | **PASS**（GRAPH / TTL / WAITING-USER / FULL-E2E + PRIVACY-STUB / LIST-SCHEMA-STUB） |

### A1–A3 核对（原 abandon prove 复跑）

| ID | 本审结果 |
|----|----------|
| A1 / A1-shell / A-created-reserved / A2 / A3 | **PASS**（与先前 db 切片一致；仍印 BLOCKED_FOR_FULL_E2E） |

## 硬钉（勾选）

- [x] **≠ covered**（HTTP prove 绿 ≠ UC-E2E-018 covered；cite 亦钉；矩阵行 **partial**；§1b 仍缺）
- [x] **R5 green-risk**（isolated → pgvector；banner 已印；≠ sole-stack / HA）
- [x] **releaseEvidence=false** · Not HA
- [x] 未把 `uc018:abandon:http:prove` 绿写成 **full.e2e / e2e:isolated 已含放弃口** 或 **covered**
- [x] 未把 `commerce:prove` / `commerce-reconcile:prove` / `neg:interview` / `api:validate` 冒充本 UC 专用验收
- [x] 真口核对：`interview.controller` `@Post(':id/abandon')` → service；receipt 含 controller/service/commerce digests；**非** stub route
- [x] `e2e/full.e2e.ts` **无** abandon 场景引用（本审 grep 计数 0）→ FULL-E2E 缺口诚实
- [x] 双域：privacy spot pass ≠ 本审 E2E 阶梯放行；PRIVACY-STUB ≠ 0058 / 擦除 covered

## 假绿排查（优先：HTTP 口绿冒充 covered + §1b 诚实）

| 风险说法 | 裁定 |
|---------|------|
| `uc018:abandon:http:prove` 绿 = **covered** / full.e2e 已含 | **否** — 聚焦 HTTP 口；`full.e2e.ts` 无 abandon；最多 **partial**；§1b 仍缺 |
| `uc018:abandon:prove` 绿 = covered | **否** — db 集成 only；先前审已钉；本波叠加 HTTP 仍 ≠ covered |
| API 已有 `@Post(':id/abandon')` = E2E 口已关 / covered | **否** — 产品口存在 + 聚焦 prove ≠ full suite 场景矩阵纳入 |
| GAP pins / honesty `A(..., true)` EXIT=0 = gap 关闭 | **否** — 诚实钉；prove/harness 明示「抬 covered 仍缺」 |
| PRIVACY-STUB / LIST-SCHEMA-STUB + privacy spot pass = 隐私 / list 快照 covered | **否** — minimal stub ≠ 0058 fence；spot 不抬门槛 |
| `commerce:prove` / reconcile TTL 绿 = 018 TTL / covered | **否** — 另轨旁证；`GAP-UC018-TTL` 仍开 |
| isolated/pgvector 绿 = sole-stack / HA / releaseEvidence | **否** — R5 mark-red；receipt `releaseEvidence=false` |
| privacy spot pass → 可升 covered | **否** — 明确禁止因 spot 放水 |

**partial 是否诚实**：**是**。db A1–A3 + 真 HTTP H1–H3/H-authz 可执行合同已绿，足以**维持**矩阵 **partial** + P0-8「集成+HTTP prove 已挂」；harness §1b / 矩阵行 / cite / prove GAP pins 均明示 ≠ covered；**未**因 HTTP 口绿假升 covered。

**§1b 缺口是否诚实**：**是**。harness §1b 六项（full.e2e / AiGraphRun safely_terminated / TTL / waiting_user / UI / sole-stack）与 prove PIN（GRAPH / TTL / WAITING-USER / FULL-E2E）及矩阵「仍缺」对齐；CAS 实测 abandon 仅 `created\|active`（`commerce.ts`），`failInterview` 含 `waiting_user` 而 abandon **不含** — WAITING-USER 缺口非空话。

## 阻塞栏（升 covered / 全链路前必填）

| 阻塞项 | 现状 | 关闭条件 |
|--------|------|----------|
| `full.e2e.ts` / `e2e:isolated` 显式 abandon TC | 聚焦 `uc018:abandon:http:prove` 已绿；**未**进 full suite；`full.e2e.ts` 无 abandon | 鉴权→begin 预留→`POST /interview/:id/abandon`→abandoned+released+不可 resume 进 isolated 复跑绿后复评 |
| `AiGraphRun → safely_terminated` | `abandonInterviewAndRelease` **不碰** graph run；`GAP-UC018-GRAPH` | 集成/E2E 钉 safe_terminating→safely_terminated + 业务事实保全 |
| TTL sweeper → abandoned | 属 `commerce-reconcile` 旁证；`GAP-UC018-TTL` | 专用钉与用户主动放弃同终态口径后复评 |
| `waiting_user` interview 放弃 | abandon CAS 仅 `created\|active`；`GAP-UC018-WAITING-USER` | 扩展 CAS 或产品确认永不落 `waiting_user` 后补 prove |
| UI「点放弃」 | NON-UI；Playwright 未要求本审 | UI E2E（降次于 HTTP）接线后复评 |
| fixture=pgvector → R5 / sole-stack | isolated 仍 pgvector；≠ MySQL+Qdrant+Redis | 按 sole-stack 迁或持续 mark-red；**不因本绿宣称 HA** |
| 完整 0058 privacy fence | `_neg-harness` minimal stub（`GAP-UC018-PRIVACY-STUB`）；spot pass ≠ fence covered | 载入真实 privacy fence；**禁止**借 stub/spot 宣称隐私 covered |

**本切片不因上述阻塞而 block partial**；上述仅 **阻塞升 covered / 宣称全链路 E2E covered / 把 HTTP 口绿或 privacy spot 写成业务闭环**。

## 结论与建议

- **pass**；**允许并维持**矩阵 **partial**（P0-8）；**禁止 covered**（含：禁止因 HTTP 36 PASS 或 privacy spot pass 升阶）
- HTTP 合同诚实：真 `@Post(':id/abandon')`；H1–H3 + authz；GAP / stub pins 齐；§1b 诚实
- 双域：`mw-e2e-ha` = pass（阶梯/假绿）；privacy spot = pass（旁注）——**互不替代、不放水**
- 下一刀 P0：`full.e2e` / `e2e:isolated` 显式 abandon 场景；并行 AiGraphRun 终态与 `waiting_user` CAS
- 对照：`harness/uc-e2e-018-user-abandon.md` §1b · `eval/uc-e2e-018-user-abandon.eval.md` · `apps/api/test/uc-e2e-018-user-abandon-http.proof.ts` · `packages/db/test/uc-e2e-018-user-abandon.proof.ts` · 矩阵 `UC-E2E-018` / P0-8 · 前审 `reviews/2026-09-10-uc-e2e-018-mw-e2e-ha.md`
