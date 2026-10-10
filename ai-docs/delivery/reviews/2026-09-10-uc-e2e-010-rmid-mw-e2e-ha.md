# 审查归档 — UC-E2E-010 SSE R-mid（mid-interview live-tail→LED）· mw-e2e-ha

**日期**：2026-09-10（PT；本审独立复跑 ~02:42 PT）  
**审稿人**：`mw-e2e-ha`（对抗独立审；实现方不自审）  
**结论**：**pass**  
**是否允许 / 维持 partial**：**是**（矩阵维持 **partial** + P1-1；**禁止**升 **covered**）  
**releaseEvidence=false** · **Not HA** · **≠ UC-E2E-010 covered** · **本绿 ≠ 全链路 E2E covered** · **R5 green-risk** · **NON-UI** · **无 Key**

> privacy spot（`2026-09-10-uc-e2e-010-rmid-mw-privacy-int-spot.md`）对本波 R-authz/stub **pass** **不改变**本审门槛：不得因 spot / R-mid 绿假升 covered，或宣称 full.e2e mid-interview / A3 / 0058 / 全链路 E2E covered。

## Prove（本审独立复跑）

| CMD | EXIT | 摘要 |
|-----|------|------|
| `pnpm uc010:sse-resume:prove` | **0** | R1–R4 + **R-mid** + R-authz + G-GAP **13 PASS**；`[R5-MARKED-RED]`（`E2E_PG_IMAGE=pgvector`）；receipt `.tmp/isolated-proof-receipts/2026-09-10T09-42-17-695Z-1111977-373f3ef5-5718-47fc-ba63-e2dd3ac29df8.json`（`releaseEvidence=false` · `exitCode=0` · `target=uc010:sse-resume:prove:raw` · `outcome=passed`）；印 PRIVACY-STUB + FULL-E2E / A3-KILL-BILLING / UI / PRIVACY-0058 / CROSS-REPLICA / LAYER；NOTE「still ≠covered；R-mid=HTTP ledger live-tail only」 |
| `pnpm eval-harness-matrix-cite:prove` | **0** | `uc-e2e-010-sse-resume` harness+eval 引用矩阵行；钉 partial / ≠covered / releaseEvidence=false / Not HA / Last-Event-ID / disconnect-resume / **R-mid mid-interview live-tail** / 抬 covered §1b / GAP honesty / layer cites；**matrix: UC-E2E-010 is partial (not covered)**；`does not claim covered` |

### R1–R4 + R-mid + R-authz + G-GAP 核对（实测）

| ID | 声称 | 本审结果 |
|----|------|----------|
| **R1** | 全量 catch-up 后 abort；seq=[1,2,3]；kinds=question_ready/waiting_user/progress | **PASS** |
| **R2** | 断线窗口账本续写 → `Last-Event-ID=3` → 仅 seq=[4,5]；无 seq≤3 重复 | **PASS** |
| **R3** | `Last-Event-ID=2` → seq=[3,4,5] | **PASS** |
| **R4** | `Last-Event-ID=5` → SSE 200 + 空 ids + hold `: ping` | **PASS** |
| **R-mid** | hold 开着时 inject [6,7]→live-tail 收齐→abort→断线窗写 [8,9]→`Last-Event-ID=7` 仅 [8,9]；无 Key/worker | **PASS**（4 断言；HTTP ledger live-tail 阶 only） |
| **R-authz** | userB 越权订阅 → **404** | **PASS**（≠ 0058 fence / 擦除 covered） |
| **G-GAP** | 打印 GAP-UC010-*（FULL-E2E / A3 / UI / PRIVACY-0058 / CROSS-REPLICA / LAYER）+ PRIVACY-STUB；EXIT=0 仅=诚实钉 | **PASS**（印齐；≠闭环） |

## 硬钉（勾选）

- [x] **≠ covered**（R-mid / prove 绿 ≠ UC-E2E-010 covered；cite 亦钉；矩阵行 **partial**）
- [x] **R-mid ≠ full.e2e mid-interview**（无 Key/worker；仅 NON-UI HTTP ledger hold→live-tail→abort→LED）
- [x] **R5 green-risk**（isolated → pgvector；banner 已印；≠ sole-stack / HA）
- [x] **releaseEvidence=false** · Not HA
- [x] 未把 `helpers/sse` / `last-event-id:unit:prove` / `sse-slot:prove` / `stream-window.spec.ts` 冒充本 UC 业务 covered
- [x] 未把 G-GAP EXIT=0 写成 A3 kill/无双扣 / full.e2e / 0058 / 跨副本已闭环
- [x] **未因 privacy spot pass 放水**（R-authz=404 + PRIVACY-STUB ≠ 0058 / 擦除 / 升 covered）
- [x] harness **§1b 抬 covered 清单仍非空**（#1–#6 仍缺；仅 HTTP mid live-tail 阶标 CLOSED，且钉 ≠ covered / ≠ full.e2e）

## 对抗：R-mid 绿是否假升 covered？§1b 是否诚实？

| 风险说法 | 裁定 |
|---------|------|
| `uc010:sse-resume:prove` / R-mid 绿 = **covered** | **否** — 最多 **partial**；R-mid 仅关 §1b「HTTP mid-interview live-tail→LED」阶；#1–#6 仍开 |
| R-mid 绿 = full.e2e mid-interview / A3 kill+无双扣 covered | **否** — prove/harness/G-GAP 显式 `R-mid=HTTP ledger live-tail ≠ full.e2e`；无 Key/worker/commerce |
| §1b 把 R-mid CLOSED 写成「抬 covered 已齐」 | **否** — CLOSED 行注明「仍 ≠ covered；≠ full.e2e」；表头仍列 full.e2e / A3 / UI / 0058 / 跨副本 / sole-stack |
| `last-event-id:unit` / `sse-slot` / `helpers/sse` / `stream-window` 绿 = 010 covered | **否** — 层旁证；G-GAP-LAYER + cite 均钉 |
| G-GAP / PRIVACY-STUB EXIT=0 = A3 / 0058 / full.e2e 闭环 | **否** — 诚实钉 |
| privacy spot pass → 可升 covered | **否** — spot 限 R-authz/stub；本审门槛不放水 |
| isolated/pgvector 绿 = sole-stack / HA / releaseEvidence | **否** — R5 mark-red；receipt `releaseEvidence=false` |
| 矩阵行 / P1-1 已写 R-mid 即暗示 covered | **否** — 行状态仍 **partial**；备注「≠ covered」「R-mid≠full.e2e」；cite：`matrix: UC-E2E-010 is partial (not covered)` |

**partial 是否诚实**：**是**。相对前波（R1–R4 only），本波 **R-mid** 诚实推进 HTTP mid-interview live-tail→LED 阶，足以维持矩阵 **partial** + P1-1「R-mid 已挂」；**未**假升 covered；§1b 缺口（full.e2e / A3 / UI / 0058 去 stub / 跨副本 / sole-stack）仍明示非空。

## 阻塞栏（升 covered / 全链路前必填）

| 阻塞项 | 现状 | 关闭条件 |
|--------|------|----------|
| `full.e2e` / `e2e:isolated` mid-interview SSE kill→resume | `GAP-UC010-FULL-E2E`；**R-mid ≠ 此条**；未接线；无 Key 时 isolated 另 blocked | 真面试链路（Key+worker）中途断 SSE → `Last-Event-ID` 续传进 isolated 复跑绿后复评 |
| A3 进程 kill + 无双扣费 / seq 无洞 | `GAP-UC010-A3-KILL-BILLING`；本 prove 不碰 worker+commerce/额度 | worker+commerce 可执行断言（无双扣、seq 连续）后复评 |
| Playwright UI 断线重连 | `GAP-UC010-UI`；`stream-window` ≠ 断线续传 | UI E2E 显式断线→续传（降次于 HTTP）接线后复评 |
| 完整 0058 privacy fence | minimal stub（`GAP-UC010-PRIVACY-STUB` / `GAP-UC010-PRIVACY-0058`）；R-authz 仅 404；**privacy spot pass ≠ 去 stub** | 载入真实 0058 fence + 擦除/越权合同；**禁止**借 stub/spot 宣称隐私 covered |
| 跨副本 SSE 槽 | `GAP-UC010-CROSS-REPLICA` / `HC-GAP-008`；`sse-slot:prove` 仅进程内 | 跨副本槽位合同可执行后另评（≠本 UC covered 捷径） |
| fixture=pgvector → R5 / sole-stack | isolated 仍 pgvector；§1b #6 | 按 M5/sole-stack 迁关系 prove→MySQL 或持续 mark-red；**不因本绿宣称 HA** |

**本切片不因上述阻塞而 block partial**；上述仅 **阻塞升 covered / 宣称全链路 E2E covered / 把 R-mid 或 privacy stub/spot 写成业务闭环**。

## 结论与建议

- **pass**；**允许并维持**矩阵 **UC-E2E-010 = partial**（P1-1）；**禁止 covered**
- R-mid 绿 = HTTP ledger mid-interview live-tail→LED 阶诚实推进；**≠** 假升 covered；**≠** full.e2e
- §1b 诚实：HTTP mid 阶 CLOSED；#1–#6 仍缺；矩阵/cite 未漂到 covered
- **不因 privacy spot pass 放水**
- 下一刀：full.e2e mid-interview（需 Key）或 A3 kill+billing；并行 0058 去 stub / 跨副本 / sole-stack
- 对照：`harness/uc-e2e-010-sse-resume.md` §1b · `eval/uc-e2e-010-sse-resume.eval.md` · `apps/api/test/uc-e2e-010-sse-resume.proof.ts` · 矩阵 `UC-E2E-010` / P1-1 · privacy spot `2026-09-10-uc-e2e-010-rmid-mw-privacy-int-spot.md`
