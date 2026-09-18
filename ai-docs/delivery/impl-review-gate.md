# 实现审查闸（硬规矩）

**releaseEvidence=false** · **≠HA** / Not HA · 实现方 **禁止自审**
**硬闸 SSOT**：`north-star-hard-gates.md`（G1–G6 全文；本闸是切片流程，不降级硬序）
**北星（未齐）**：100% HA · 全量 E2E 零遗漏 · 0 BUG — 均须 CMD+EXIT + 独立审，不得叙事

## 硬序叠加（每一切片 · 摘自 `north-star-hard-gates.md`）

1. **G1 可核验**：每步 CMD+EXIT / CI / 收据；叙事 ≠ 证据
2. **G2 非快乐路径**：NEG / FAULT / ADV / 边界必须进评测用例 **且** 执行；仅快乐绿 = 假绿
3. **G3 需求→矩阵/eval→才实现**：先写矩阵行 + eval + harness（含 NEG+PERF 列），禁止先写绿再回填需求
4. **G4 执行前独立审**：harness/执行计划须分域专家审过才可跑；实现方不自批；关键切片双域对抗
5. **G5 禁假绿**：partial / GAP / conn-only / honesty-pin ≠ covered
6. **G6 性能+负载**：api/web/worker 可复现压测列；本地绿 ≠ 生产容量

后续 knife **必须**带 NEG + FAULT + BOUND + ADV + PERF + LOAD 列（分面 api/web/worker；SSOT `e2e-requirement-coverage-matrix.md` §0.5/§1.0 + `non-happy-path-perf-load-case-matrix.md`）。违反任一条 = 不得升 covered / 不得勾 `releaseEvidence=true`。

## 强制流程（每一切片）
1. **Harness 文档**（`ai-docs/delivery/harness/…`）：命令、前置、期望 EXIT、Not HA / releaseEvidence=false；**含 NEG / FAULT / ADV / PERF 列或显式 blind**
2. **评测集 + 矩阵行**（G3）：对照 UC/ADR 先改 `e2e-requirement-coverage-matrix.md` + `delivery/eval/` — **先于** 实现 E2E/prove
3. **独立专家审 harness/评测**（G4，**执行前**）：对照 **该任务 harness + 相关 delivery/UC/ADR/矩阵行 ID**（分域：privacy / model-op / rag / e2e）— **不得**由实现方自审顶替
4. **实现 + prove**（记录 CMD/EXIT；G1）
5. **落** `ai-docs/delivery/reviews/`（结论 + 门禁 + prove CMD/EXIT）
6. 再并 **下一切片**

跳过第 2–3 或第 5 步 = 违规。先实现再补矩阵 = 违反 G3。

## E2E 硬要求（叠加）
- **非 UI E2E 为主**：主评测 = `e2e:isolated` / `full.e2e` / prove 家族（HTTP/SSE）；Playwright `apps/web/e2e-ui` 为次要车道（见 `adr-e2e-directory-restructure.md`）。
- **禁止**用 `mysql-stack` skeleton/ping 或单点 prove **冒充**完整 E2E。
- 涉及端到端路径：除分域审外，须 **mw-e2e-ha** 对照 harness+任务文档复审，并尽量给出**整套 E2E 命令+EXIT**。
- 见 `harness/e2e-full-suite.inventory.md` + `e2e-case-inventory.md`（落地后）。

## Eval first（叠加 · = G3）
1. 对照 UC/ADR/gap-bug-backlog 完善**需求验收**评测集（覆盖需求，不只连通；**必须含 NEG+FAULT+ADV+PERF**）
2. Harness 钉：评哪些需求、命令、期望 EXIT、假绿标红、盲区旗
3. **独立专家先审评测集/harness**（执行前）；再实现；尽量整套 E2E CMD+EXIT（含非快乐路径）
4. **禁止**先实现再用 mysql-stack / 快乐路径绿冒充需求已满足；**禁止**写绿后回填需求

## 覆盖矩阵闸
- 实现/开修前对照 `e2e-requirement-coverage-matrix.md`（含 **§0.5 / §1.0 盲区列**）
- **无评测覆盖的需求不得宣称完成**
- 切片独立审须**引用矩阵行 ID**
- 新行/改行必须填 NEG / FAULT / ADV / PERF；缺列 = 快乐路径盲区未关
- `partial` / `gap` / `conn-only` / `honesty-pin` / `blind` **≠** `covered`

## 对抗审计（硬规矩）
1. 实现方禁止自审自批；预写仅 `reviews/REQUEST-*`
2. 关键切片（目录搬迁、隐私/RAG/队列切流、宣称 covered/HA）须 **≥2 独立域** 对照任务文档审；冲突以**阻塞项**为准
3. 协调方汇总冲突；禁止「看起来 OK」合入
4. 审结论落 `reviews/`；`releaseEvidence=false` 直至证据齐

## 生产零 BUG
同 `north-star-ha.md` + `north-star-hard-gates.md`：P0/假绿/conditional 未清禁发布；无 BUG 宣称须证据+双域审。**0 BUG 是北星硬闸，不是当前状态。**
