# 审查归档 — UC-E2E-002 HTTP 双 session / LED 抬 covered 切片 · mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~02:36–02:37 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审）  
**双域**：`mw-privacy-int` spot 已对 UC-002 HTTP 结论 **pass**（跨用户 404 + 同主双 session 授权旁注）。**本审不因 spot pass 放水**；不得借 stub/spot / HTTP GET+LED 绿升 **covered** / 宣称 0058 擦除 / 全链路 E2E covered / HTTP lease mouth 已关。E2E/矩阵阶梯独立复跑 prove + 假绿排查后另下结论。  
**结论**：**pass**  
**是否允许 / 维持 partial**：**是**（矩阵维持 **partial** + P0-7；**禁止**升 **covered**）  
**releaseEvidence=false** · **Not HA** · **≠ UC-E2E-002 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk** · **NON-UI** · **无 Key**

## Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc002:http:prove` | **0** | H1–H3 + H-authz + G-GAP **共 13 PASS**；双 session 同主 GET 一致；A断→B `Last-Event-ID` 续；中位游标；userB GET/SSE→404；`[R5-MARKED-RED]`（`E2E_PG_IMAGE=pgvector`）；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-37-25-815Z-1098928-384925eb-6663-4378-b110-270850389930.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc002:http:prove:raw` · `outcome=passed`）；印 `GAP-UC002-HTTP-LEASE-MOUTH` / `SNAPSHOT-ROUTE` / `PLAYWRIGHT-DUAL` / `FULL-E2E` / `UC010-CITE` + PRIVACY-STUB / LIST-SCHEMA-STUB；`BLOCKED_FOR_COVERED` |
| `pnpm uc002:lease:prove` | **0** | L1 并发恰一胜；L2 释放后顺序接管 + version CAS 递增；L3 RLS 0 行/抢不到；R5；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-37-43-390Z-1099881-12df33cb-d672-4d3d-9c9f-dc148bf3e46f.json`（`release_evidence=false`）；`BLOCKED_FOR_COVERED: HTTP lease mouth + snapshot + Playwright dual + full.e2e`；**≠ HTTP lease mouth** |
| `pnpm eval-uc-e2e-001-002-cite:prove` | **0** | harness/eval/矩阵钉 **partial**、NON-UI、≠covered、releaseEvidence=false、Not HA；`cites uc002:http:prove`；`uc010 旁证 ≠ 002 covered`；`HTTP lease mouth remaining`；`matrix: UC-E2E-002 remains partial`；`does not claim covered` |
| `pnpm uc010:sse-resume:prove` | **旁证·未作本审门禁** | harness/prove 钉 **SSE LED 旁证 ≠ UC-E2E-002 covered**；本审**不**因旁证绿放水 |

### H1–H3 + H-authz 核对（实测）

| ID | 声称 | 本审结果 |
|----|------|----------|
| **H1** | 双 HTTP session 顺序 `GET /interview/:id` 同 id/status/progress | **PASS**（同 principal 两 client；200；投影一致） |
| **H2** | device-A catch-up → 账本续写 → device-B `Last-Event-ID=3` → seq=[4,5] | **PASS**（不重放 1..3） |
| **H3** | device-B `Last-Event-ID=2` → seq=[3,4,5] | **PASS** |
| **H-authz** | 他主体 GET/SSE → **404** | **PASS**（≠ 0058 privacy fence covered；minimal stub） |
| **G-GAP** | HTTP lease / snapshot / Playwright / full.e2e / uc010 旁证 pins | **PASS**（诚实钉；EXIT=0≠covered） |

### L1–L3 核对（原 lease prove 复跑）

| ID | 本审结果 |
|----|----------|
| L1 / L2 / L3 | **PASS**（db `withInterviewGraphFence` CAS；仍 ≠ HTTP lease mouth） |

## 硬钉（勾选）

- [x] **≠ covered**（HTTP prove 绿 ≠ UC-E2E-002 covered；cite 亦钉；矩阵行 **partial**；§1b 仍缺）
- [x] **R5 green-risk**（isolated → pgvector；banner 已印；≠ sole-stack / HA）
- [x] **releaseEvidence=false** · Not HA
- [x] 未把 `uc002:http:prove` 绿写成 **covered** / full.e2e 双设备已含 / HTTP lease mouth 已关
- [x] 未把 `uc010:sse-resume:prove` / lease CAS / stream-window / sse helpers 冒充本 UC **covered**
- [x] 搜码：`@Get(':id')` + `@Get(':id/events')` **有**；**无** `@Get(':id/snapshot')`；interview 模块 **无** HTTP thread lease CAS /「会话在别处活跃」口
- [x] `e2e/full.e2e.ts` **无** UC-E2E-002 / cross-device 引用（本审 grep 计数 **0**）→ FULL-E2E 缺口诚实
- [x] 双域：privacy spot pass ≠ 本审 E2E 阶梯放行；PRIVACY-STUB ≠ 0058 / 擦除 covered

## 假绿排查（优先：HTTP 双 GET/LED 绿假升 covered + uc010 旁证冒充 + GAP 诚实）

| 风险说法 | 裁定 |
|---------|------|
| `uc002:http:prove` 绿 = **covered** / 跨设备全关 | **否** — 仅 HTTP 双 session GET+LED；缺 HTTP lease mouth + snapshot + full.e2e + UI；最多 **partial**；§1b 仍开 |
| `uc002:lease:prove` 绿 = HTTP lease mouth / covered | **否** — db fence CAS only；prove 自钉 ≠ HTTP dual-session / lease mouth |
| `uc010:sse-resume:prove` 绿 = 002 covered | **否** — **旁证** 单 session LED；harness/矩阵/cite/G-GAP `UC010-CITE` 钉死 ≠002 covered |
| stream-window / `e2e/helpers/sse.ts` 绿 = 双设备 covered | **否** — UI 降次 / helper ≠ 验收场景 |
| GAP pins / honesty `A(..., true)` EXIT=0 = gap 关闭 | **否** — 诚实钉；`BLOCKED_FOR_COVERED` 明示抬 covered 仍缺 |
| PRIVACY-STUB + privacy spot pass = 隐私 / 0058 covered | **否** — minimal stub ≠ fence；**禁止因 spot 放水** |
| `GET /interview/:id` = 专用 snapshot 已关 | **否** — stand-in；`GAP-UC002-SNAPSHOT-ROUTE` 仍开；无 ADR 钉「GET=:snapshot」 |
| isolated/pgvector 绿 = sole-stack / HA / releaseEvidence | **否** — R5 mark-red；receipt `releaseEvidence=false` |
| cite EXIT=0 = 业务 covered | **否** — 静态文档钉；NOTE 明示 ≠业务 covered |
| privacy spot pass → 可升 covered | **否** — 明确禁止因 spot 放水 |

**partial 是否诚实**：**是**。L1–L3 db lease + H1–H3/H-authz HTTP dual GET/LED 可执行合同已绿，足以**维持**矩阵 **partial** + P0-7「NON-UI lease+HTTP prove 已挂」；harness §1b / 矩阵行 / cite / prove GAP pins 均明示 ≠ covered；**未**因 HTTP/LED 绿或 privacy spot 假升 covered。

**§1b / GAP 是否诚实**：**是**。本审搜码：`interview.controller` 仅有 `@Get(':id')` / `@Get(':id/events')` 等，**无** `/snapshot`，**无** HTTP lease/「会话在别处活跃」产品口；lease 仍 `packages/db` `withInterviewGraphFence`；`full.e2e.ts` 对 UC-002/cross-device **0** 命中；Playwright 双 context 未接线。与 prove PIN（HTTP-LEASE-MOUTH / SNAPSHOT-ROUTE / PLAYWRIGHT-DUAL / FULL-E2E / UC010-CITE）及 harness §1b #1–#5 对齐。

## 阻塞栏（升 covered / 全链路前必填）

| 阻塞项 | 现状 | 关闭条件 |
|--------|------|----------|
| HTTP **thread lease CAS** 产品口（「会话在别处活跃」或等价） | 仅有 db `withInterviewGraphFence` L1–L3；`GAP-UC002-HTTP-LEASE-MOUTH` | 双 session 并发 resume → 恰一胜 + 输者产品口；HTTP prove 断言后复评 |
| 专用 `GET /interview/:id/snapshot`（或 ADR 钉 GET=:snapshot + 字段齐） | 本 prove 用 `GET /:id` 顶替；`GAP-UC002-SNAPSHOT-ROUTE` | 产品路由或正式 ADR + 题面/历史字段齐后复评 |
| `full.e2e.ts` / `e2e:isolated` **显式**双设备 TC | 聚焦 `uc002:http:prove`；full suite **无** 002/cross-device；`GAP-UC002-FULL-E2E` | 鉴权→作答→换 session resume + LED + lease 进 isolated 复跑绿后复评 |
| Playwright 双 `browser.newContext` | 降次未接线；`GAP-UC002-PLAYWRIGHT-DUAL` | UI 接线后复评（不可单独升 covered） |
| fixture=pgvector → R5 / sole-stack | isolated 仍 pgvector；≠ MySQL+Qdrant+Redis | 按 sole-stack 迁或持续 mark-red；**不因本绿宣称 HA** |
| 完整 0058 privacy fence | `_neg-harness` minimal stub（`GAP-UC002-PRIVACY-STUB`）；spot pass ≠ fence covered | 载入真实 privacy fence；**禁止**借 stub/spot 宣称隐私 covered |
| uc010 SSE 旁证冒充 002 | harness/矩阵/cite/G-GAP 已钉旁证 | 持续禁止把 uc010 绿写成 002 covered |

**本切片不因上述阻塞而 block partial**；上述仅 **阻塞升 covered / 宣称全链路 E2E covered / 把 HTTP GET+LED 绿、uc010 旁证或 privacy spot 写成业务闭环**。

## 结论与建议

- **pass**；**允许并维持**矩阵 **UC-E2E-002 = partial**（P0-7）；**禁止 covered**（含：禁止因 HTTP 13 PASS、lease 绿、cite 绿或 privacy spot pass 升阶）
- HTTP 合同诚实：双 session GET + LED + H-authz；GAP / stub / uc010 旁证 pins 齐；§1b 诚实
- 升 **covered** 前须接线 **HTTP lease mouth**（+ snapshot / full.e2e；UI/sole-stack 按 §1b）并复跑绿；勿因 HTTP/lease/cite EXIT=0 回写 covered

## 对照

`harness/uc-e2e-002-cross-device.eval.md` §1b · `eval/uc-e2e-002-cross-device.eval.md` · 矩阵 §1.1 UC-E2E-002 · §3 P0-7 · `REQUEST-2026-09-10-uc-e2e-002-http-for-mw-e2e-ha.md` · privacy spot `2026-09-10-uc-e2e-002-http-mw-privacy-int-spot.md`
