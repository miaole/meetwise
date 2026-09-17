# 审查归档 — UC-E2E-018 waiting_user CAS 补刀 · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~02:29 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审）  
**双域**：`mw-privacy-int` spot 已对 waiting_user CAS 扩面结论 **pass**（见 `reviews/2026-09-10-uc-e2e-018-waiting-user-mw-privacy-int-spot.md`）。**本审不因 spot pass 放水**；不得借 spot / §1b#4 CLOSED 升 **covered** 或宣称全链路 E2E covered。E2E/矩阵阶梯独立复跑 prove + 假绿排查后另下结论。  
**结论**：**pass**  
**是否允许 / 维持 partial**：**是**（矩阵维持 **partial** + P0-8；**禁止**升 **covered**）  
**releaseEvidence=false** · **Not HA** · **≠ UC-E2E-018 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk** · **NON-UI** · **无 Key**

## Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc018:abandon:prove` | **0** | A1 / A1-shell / A2 / A3 / A-created-reserved / **A-waiting-user** 真跑绿；印 `CLOSED: GAP-UC018-WAITING-USER` + `BLOCKED_FOR_FULL_E2E` + PIN GRAPH/TTL；`[R5-MARKED-RED]`（`E2E_PG_IMAGE=pgvector`）；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-29-01-916Z-1078076-81655d5d-87ce-49d6-8e19-902f63db7809.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc018:abandon:prove:raw` · `outcome=passed`） |
| `pnpm uc018:abandon:http:prove` | **0** | H1 / H1-shell / H2 / H3 / **H-waiting-user** / H-authz+terminal + honesty **共 46 PASS**；真 `POST /interview/:id/abandon`；印 `CLOSED GAP-UC018-WAITING-USER` + PIN GRAPH/TTL/FULL-E2E + PRIVACY-STUB/LIST-SCHEMA-STUB；R5；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-29-14-012Z-1079253-6c839e1a-ca57-4f75-b0d6-ca3d2ce96ec5.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc018:abandon:http:prove:raw` · `outcome=passed`） |
| `pnpm eval-harness-matrix-cite:prove` | **0** | `uc-e2e-018-user-abandon` harness+eval 引用矩阵行；钉 partial / ≠covered / releaseEvidence=false / Not HA / 两 prove / §1b；**matrix: UC-E2E-018 is partial (not covered)**；`does not claim covered` |

### waiting_user 断言真跑核对（本审实测 · 对抗重点）

| ID | 声称 | 本审结果 |
|----|------|----------|
| **A-waiting-user** | `waiting_user`+reserved → abandoned + released；额度净变 0；∉ in-progress | **PASS 真跑**（reserve→reserved；5→4→5；abandon→abandoned；released；consumption=released；∉ in-progress）— **非**跳过/空断言 |
| **H-waiting-user** | HTTP `waiting_user`+reserved → 200 released；DB abandoned；额度净变 0；begin→409 | **PASS 真跑**（POST 200；`abandoned=true`/`released=released`；DB 终态；额度回补；begin→409 `interview_not_active`） |
| **CAS 产品口** | `abandonInterviewAndRelease` 允许集 = `created\|active\|waiting_user` | **确认**（`commerce.ts` `status IN ('created','active','waiting_user')` + `owner_user_id=$2`；注释钉不碰 AiGraphRun） |

### 其余 A*/H*（回归未回退）

| ID | 本审结果 |
|----|----------|
| A1 / A1-shell / A-created-reserved / A2 / A3 | **PASS**（与先前 db 切片一致） |
| H1 / H1-shell / H2 / H3 / H-authz+terminal | **PASS**（46 条含 waiting_user；真口非 stub route） |
| honesty GAP pins | **PASS**（WAITING-USER **CLOSED**；GRAPH / TTL / FULL-E2E **仍 PIN**） |

## 硬钉（勾选）

- [x] **≠ covered**（waiting_user 绿 ≠ UC-E2E-018 covered；cite 亦钉；矩阵行 **partial**；§1b #1/#2/#3/#5/#6 仍缺）
- [x] **禁止因 waiting_user 绿假升 covered**（§1b#4 CLOSED 仅关 WAITING-USER 缺口，≠ 全 UC covered）
- [x] **R5 green-risk**（isolated → pgvector；banner 已印；≠ sole-stack / HA）
- [x] **releaseEvidence=false** · Not HA
- [x] 未把 `uc018:abandon:prove` / `…:http:prove` 绿写成 **full.e2e / e2e:isolated 已含放弃口** 或 **covered**
- [x] `e2e/full.e2e.ts` **abandon 引用计数 = 0** → FULL-E2E 缺口仍诚实
- [x] 双域：privacy spot pass ≠ 本审 E2E 阶梯放行；**禁止**借 spot 升 covered

## 假绿排查（优先：waiting_user 绿冒充 covered + §1b 其余缺口）

| 风险说法 | 裁定 |
|---------|------|
| waiting_user CAS + A/H-waiting-user 绿 = **covered** | **否** — 仅关 §1b#4；#1 full.e2e / #2 AiGraphRun / #3 TTL / #5 UI / #6 sole-stack **仍开**；最多 **维持 partial** |
| `uc018:abandon:http:prove` 46 PASS = full.e2e 已含 / covered | **否** — 聚焦 HTTP 口；`full.e2e.ts` abandon=0；≠ suite 纳入 |
| harness 把 #4 划 CLOSED = 可升 covered | **否** — harness 明文「本切片已关 §1b#4；仍明确不做 #1/#2/#3/#5/#6；禁止矩阵升 covered」 |
| CLOSED pin + honesty `A(..., true)` EXIT=0 = 全 gap 关闭 | **否** — WAITING-USER 关；GRAPH/TTL/FULL-E2E 仍 PIN |
| privacy spot pass → 可升 covered / 放宽 E2E | **否** — spot 仅配额/越权旁注；**本审不放水** |
| `commerce:prove` / reconcile TTL 绿 = 018 TTL / covered | **否** — 另轨旁证；`GAP-UC018-TTL` 仍开 |
| isolated/pgvector 绿 = sole-stack / HA / releaseEvidence | **否** — R5 mark-red；receipt `releaseEvidence=false` |
| CAS 扩面偷掉 owner / 假闭环 | **否**（privacy spot 已钉；本审 CAS 仍见 `owner_user_id=$2`；waiting_user 路径额度净变 0） |

**partial 是否诚实**：**是**。db A*+A-waiting-user + 真 HTTP H*+H-waiting-user 可执行合同已绿，足以**维持**矩阵 **partial** + P0-8「集成+HTTP prove 已挂（含 waiting_user CAS）」；§1b 其余缺口与矩阵「仍缺」对齐；**未**因 waiting_user 绿或 privacy spot pass 假升 covered。

**§1b 缺口是否仍钉**：**是**。

| §1b # | 状态（本审） |
|-------|-------------|
| 1 full.e2e / e2e:isolated 显式 abandon TC | **仍缺**（`full.e2e.ts` abandon=0） |
| 2 AiGraphRun safely_terminated | **仍缺**（commerce 明示不碰 graph；PIN GRAPH） |
| 3 TTL sweeper 专用钉 | **仍缺**（PIN TTL；reconcile 旁证不够） |
| 4 waiting_user CAS + prove | **CLOSED**（CAS 扩面 + A/H-waiting-user 真跑） |
| 5 UI「点放弃」 | **仍缺**（NON-UI） |
| 6 sole-stack 去 R5 | **仍缺**（pgvector → R5） |

## 阻塞栏（升 covered / 全链路前必填）

| 阻塞项 | 现状 | 关闭条件 |
|--------|------|----------|
| `full.e2e.ts` / `e2e:isolated` 显式 abandon TC | 聚焦 prove 已绿（含 waiting_user）；**未**进 full suite；abandon 引用=0 | 鉴权→begin 预留→`POST /interview/:id/abandon`（含 waiting_user 态可选）→abandoned+released+不可 resume 进 isolated 复跑绿后复评 |
| `AiGraphRun → safely_terminated` | `abandonInterviewAndRelease` **不碰** graph run；`GAP-UC018-GRAPH` | 集成/E2E 钉 safe_terminating→safely_terminated + 业务事实保全 |
| TTL sweeper → abandoned | 属 `commerce-reconcile` 旁证；`GAP-UC018-TTL` | 专用钉与用户主动放弃同终态口径后复评 |
| UI「点放弃」 | NON-UI；Playwright 未要求本审 | UI E2E（降次于 HTTP）接线后复评 |
| fixture=pgvector → R5 / sole-stack | isolated 仍 pgvector；≠ MySQL+Qdrant+Redis | 按 sole-stack 迁或持续 mark-red；**不因本绿宣称 HA** |
| 完整 0058 privacy fence | `_neg-harness` minimal stub（`GAP-UC018-PRIVACY-STUB`）；spot pass ≠ fence covered | 载入真实 privacy fence；**禁止**借 stub/spot 宣称隐私 covered |
| ~~waiting_user CAS~~ | **本波已关**（§1b#4）；**不再**作为升 covered 的唯一阻塞，也**不得**单独因关此项升 covered | — |

**本切片不因上述阻塞而 block partial**；上述仅 **阻塞升 covered / 宣称全链路 E2E covered / 把 waiting_user 绿或 privacy spot 写成业务闭环**。

## 结论与建议

- **pass**；**允许并维持**矩阵 **partial**（P0-8）；**禁止 covered**（含：禁止因 A/H-waiting-user 绿、§1b#4 CLOSED、或 privacy spot pass 升阶）
- waiting_user 合同诚实：CAS=`created|active|waiting_user`；A/H-waiting-user **真跑**；CLOSED pin 与 §1b 其余 PIN 并存
- 双域：`mw-e2e-ha` = pass（阶梯/假绿）；privacy spot = pass（旁注）——**互不替代、不放水**
- 下一刀 P0：`full.e2e` / `e2e:isolated` 显式 abandon 场景；并行 AiGraphRun 终态与 TTL 专用钉（waiting_user 本波已关，勿再当升阶借口）
- 对照：`harness/uc-e2e-018-user-abandon.md` §1b · `eval/uc-e2e-018-user-abandon.eval.md` · `packages/db/src/commerce.ts` · `packages/db/test/uc-e2e-018-user-abandon.proof.ts` · `apps/api/test/uc-e2e-018-user-abandon-http.proof.ts` · 矩阵 `UC-E2E-018` / P0-8 · 前审 `reviews/2026-09-10-uc-e2e-018-http-abandon-mw-e2e-ha.md` · spot `reviews/2026-09-10-uc-e2e-018-waiting-user-mw-privacy-int-spot.md`
