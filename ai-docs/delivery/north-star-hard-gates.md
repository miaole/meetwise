# 北星硬闸 — 交付 SSOT（七条 · 不可叙事绕过）

> **2026-09-17 (~01:15 PT) · stack overlay (PG-retained)**  
> Delivery truth stack for relational+vector = **Postgres (+pgvector + PostgresSaver)**. Former sole-stack MySQL+Qdrant claims **superseded**. Redis wake separately evaluable.  
> `releaseEvidence=false` · ≠HA · ≠suite green · see `adr-postgres-retained.md`. G1–G7 gate *enforcement* unchanged by this overlay.

> **2026-09-17 (~01:20 PT) · workflow SSOT (W0–W8 · additive)**  
> Order: **W0** PG retained → **W1** redundant/obsolete inventory (**ZERO deletes**) → dual → later **W1b** (not open) → **W2…W8** (not open). See `harness/w1-pg-redundant-table-inventory.md`. Ban DROP in W1 · Dual PASS ≠ authorize W1b deletes · F8 parallel OK.


**状态**：G1–G7 **已生效**（2026-09-16 双域文档闸齐 + meetwise 授权改钉） · **releaseEvidence=false** · **≠HA** / **Not HA** · 不宣称 `controlPlaneClosed=true`  
**生效钉（G1–G6）**：2026-09-16 经 `mw-e2e-ha` + `mw-rag-route` 双域文档闸齐后，由协调 **授权改钉生效**。落库 / 实现方自书仍 **≠** 自批；矩阵 prove 仍须单独 REQUEST→独立审，**不得**借本文宣称非快乐路径执行面已跑绿 / covered / HA。  
**生效钉（G7）**：2026-09-16 双域文档闸齐（`2026-09-16-north-star-g7-local-full-suite-mw-e2e-ha.md` + `2026-09-16-north-star-g7-local-full-suite-mw-rag-route.md`）+ meetwise **授权改钉** → G7 **已生效**。  
**硬诚实（G7）**：生效 = **门禁条款强制**；**≠** G7 全套已跑通；knife/prove/dual **≠** 成功直至全环境+全 case 验证收据；`releaseEvidence=false`；**禁宣** HA / 0 BUG / `controlPlaneClosed`。  
**本切片**：授权改钉 G7 生效 + 指针；**不跑** 全量本地套件 / live E2E；**不发明** covered 绿；**不勾** `releaseEvidence=true`；**不**阻断并行 R4 REAL-WIRE-IMPL。  
**北星目标（未齐前禁止勾 true / 禁止叙事已达成）**：

| 北星 | 当前裁定 |
|------|----------|
| 生产 **100% HA** | **目标** · **≠HA** · 阶 C/D 未绿（见 `north-star-ha.md`） |
| **全量 E2E 零遗漏** | **目标** · 矩阵大量 `partial`/`gap`/`blind` → **未齐** |
| **0 BUG** | **硬闸** · P0 / 假绿 / 对抗 conditional 未清 = **禁发布**；宣称须 CMD+EXIT + ≥2 域审，不得叙事 |

对照：`north-star-ha.md`（HA 目标与证据阶梯）· `impl-review-gate.md`（切片流程）· `e2e-requirement-coverage-matrix.md`（覆盖真相 + 盲区列）· `execution-master-checklist.md`（执行顺序）· `gap-bug-backlog.md`（P0 假绿库存）· `testing/e2e-performance-evidence.md`（perf 回执边界）

---

## 0. 文首钉死

| 钉 | 裁定 |
|----|------|
| `releaseEvidence` | **false**（本文、一切本地/静态 prove、knife 回执均不得勾 true；**直至 G7 全量 CMD+EXIT/CI 收据套件齐**） |
| HA | **≠HA**；骨架 / stub / 本地 compose / shared / nest-session 绿 **≠** 生产 HA；**无 G7 收据禁止宣称生产 100% HA** |
| covered | 仅当：需求验收断言 + 非快乐路径已执行 + CMD+EXIT/CI/收据 + 独立专家审；**禁止本切片填写 covered** |
| 叙事 | **叙事 ≠ 证据**；无 CMD+EXIT / CI / 收据的段落不得当通过；**刀绿 / dual pass / prove EXIT=0 ≠ 成功**（成功唯一标准 = **G7 验证关**） |
| 实现方 | **禁止自审自批**；关键切片 **≥2 独立域** 对抗 |
| **G7** | **已生效**（门禁条款强制）；生效 **≠** 全套已跑通；无全量收据前不得勾 `releaseEvidence=true` / `controlPlaneClosed` / 宣称 0 BUG / 生产 100% HA |

中文钉死：

- **releaseEvidence=false**
- **≠HA** / **Not HA**
- **全量 E2E 零遗漏**（目标，当前未齐）
- **100% HA**（目标，当前未齐；**无 G7 收据禁止宣称**）
- **0 BUG**（硬闸；未证不得宣称；**无 G7 收据禁止宣称**）
- **partial / GAP / conn-only / honesty-pin ≠ covered**
- **仅快乐路径绿 = 假绿**
- **本地绿 ≠ 生产容量**
- **先评测集/矩阵，后实现 E2E/prove**（禁先写绿再补需求）
- **验证关是成功唯一标准**（G7；刀绿 / dual pass / prove EXIT=0 ≠ 成功）
- **G7 = 已生效**（门禁条款强制；**≠** 全套已跑通 / 禁宣 HA·0 BUG·controlPlaneClosed）

---

## 1. 硬序（七条 · 必须按序 · 不可调换）

后续一切 knife / 切片 / harness / eval / 矩阵回写 **必须携带这七条的 verbatim 精神**。违反任一条 = 该切片不得合入主路径、不得升 covered、不得勾 `releaseEvidence=true`。

> **G7 生效注**：G1–G7 **均已生效**（2026-09-16 双域文档闸齐 + meetwise 授权改钉）。**生效 = 门禁条款强制**；**≠** G7 全套已跑通；knife/prove/dual ≠ 成功直至全环境+全 case 验证收据；禁宣 HA / 0 BUG / `controlPlaneClosed`；`releaseEvidence=false`。

### G1 — 一切可核验（CMD+EXIT / CI / 收据）

**硬句**：每一步都要可核验——命令、退出码、CI 或收据；**叙事 ≠ 证据**。

| 必须 | 禁止 |
|------|------|
| 每个验收步记录 **CMD + EXIT**（或等价 CI job + 不可变收据） | 用「已跑过 / 看起来 OK / 文档已写 / demo 通了」顶替 EXIT |
| 失败记非零 / `blocked` / `not_run:<reason>`，原因封闭 | skip-as-pass、把 blocked 改写成绿 |
| 回执含 `releaseEvidence=false` 直至发布接收器齐 | 把本地 JSON / 对话小结当发布证据 |

无 CMD+EXIT 的「完成」叙事，一律视为 **未执行**。

### G2 — 非快乐路径必须进完整 E2E

**硬句**：负路径 / 故障 / 边界 / 对抗必须进入 **评测用例 + 实际执行**；**仅快乐路径绿 = 假绿 / 假阳性**。

| 列 | 必须覆盖（用例 **且** 执行） | 缺列读法 |
|----|------------------------------|----------|
| **NEG** | 负路径（拒、错签、越权、过期、错误码） | `blind` / `gap` |
| **FAULT** | 故障注入（杀进程、断 SSE、依赖 5xx、夹具失败） | `blind` / `gap` |
| **ADV** | 对抗（注入、越狱、篡改、重放、诱导造假） | `blind` / `gap` |
| **BOUND** | 边界（0、空、超大、幂等、竞态、时钟） | 可并入 NEG/FAULT 列，但不得省略 |

**完整 E2E 零遗漏** = 上列进入 cases **并且** 被执行出 CMD+EXIT；矩阵有行但没跑 = 仍遗漏。  
Happy-only `e2e:isolated` / golden EXIT=0 **不得**写成 UC 已 covered。

### G3 — 需求 → 评测用例/矩阵 → 才允许实现 E2E/prove

**硬句**：先从 UC / requirements 产出 **eval cases + 覆盖矩阵行**（含 G2/G6 六列：NEG·FAULT·BOUND·ADV·PERF·LOAD），**然后**才实现 E2E / prove；**禁止先写绿再回填需求**。

强制顺序：

1. 冻结 UC / ADR / gap-bug 行（需求验收，不只连通）
2. 写/改 `e2e-requirement-coverage-matrix.md` 行 + `delivery/eval/` 评测笔记 + harness（命令、期望 EXIT、假绿标红、**NEG+FAULT+BOUND+ADV+PERF+LOAD 六列** + 分面 PERF_api/PERF_web/LOAD_worker）
3. **独立专家审** harness/评测集（G4）——通过前 **不得**当执行授权
4. 才允许实现 / 接线 / 跑 prove
5. 回写矩阵诚实状态（`partial`/`gap`/`blocked`/`conn-only`/`blind`）；**禁止**写绿后补矩阵

**禁**：实现已绿 → 再补 UC；prove EXIT=0 → 再发明需求行；「先让 CI 绿再补评测」。

### G4 — 执行前独立专家审（实现方不自批）

**硬句**：每一切片的 harness / 执行计划须 **独立分域专家** 对照任务文档审过，才可执行；**实现方禁止自审自批**；关键切片 **双域对抗**。

| 规则 | 裁定 |
|------|------|
| 审谁 | 对照 **该任务 harness + 相关 delivery/UC/ADR/矩阵行 ID**；分域：privacy / model-op / rag / e2e-ha 等 |
| 何时 | **执行前**（跑 live/prove/切流之前）；预写仅 `reviews/REQUEST-*` |
| 谁不能签 | 实现方、同 orchestrator 自派后立刻自填 passed |
| 关键切片 | 目录搬迁、隐私/RAG/队列切流、宣称 covered/HA、本硬闸本身 → **≥2 独立域**；冲突以 **阻塞项** 为准 |
| 落点 | `ai-docs/delivery/reviews/`（结论 + 门禁 + prove CMD/EXIT） |

跳过独立审 = 违规。`review: passed` 作者自签 = `blocked:author_only`。

### G5 — 禁假绿 / 禁假阳性

**硬句**：**partial / GAP / conn-only / honesty-pin ≠ covered**；假绿阻断合入与发布。

| 记号 | 正确读法 | 升格 covered？ |
|------|----------|----------------|
| `partial` | 有部分路径，缺关键验收或夹具非 sole-stack | **否** |
| `gap` | 需求已写、无对等用例或未接线 | **否** |
| `blocked` | 前置不满足（无 Key / 无授权 / 夹具未换） | **否**（也非失败） |
| `conn-only` | 仅连通/文档/skeleton/ping/`/livez` | **永不** |
| `honesty-pin` / mark-red | 静态钉「仍缺/仍拒/仍 blocked」 | EXIT=0 **仅**钉诚实；**≠** 已关 |
| `green-risk` / R5 | 业务断言绿但 fixture=pgvector | **否**（≠ sole-stack migrated） |
| `blind` | 该非快乐列无用例且无执行 | happy-only；**假阳性** |

假绿阻断：`gap-bug-backlog` 未关 P0 / 假绿 / 对抗 **conditional** → **禁止生产发布** 与 `releaseEvidence=true`（同 `north-star-ha.md` 零 BUG 硬闸）。

### G6 — 性能 + 负载（可复现压测）

**硬句**：api / web / worker 等须有 **可复现** 的性能与压力证据；**本地绿 ≠ 生产容量**；**本机毫秒/RPS ≠ 线上 SLO ≠ HA**。

| 必须 | 禁止 |
|------|------|
| 矩阵 / eval 带 **PERF** 列：命令、负载形状、期望、收据路径 | 用 `e2e:isolated` 终态秒数冒充 API/worker SLO |
| 压测可复现（脚本 + 参数 + EXIT + 收据）；缺跑记 `blind`/`not_run` | 把 `verify:e2e-performance` 历史数字或 `not_run` 写成容量已证 |
| 分面：api / web / worker / 队列 / 检索；跨副本与故障叠加另列 | 单实例 Docker healthy = 产能；进程内 cap = 集群锁 |

证据边界见 `testing/e2e-performance-evidence.md`：当前多数 PERF 门为 `not_run` / 历史回执过期 → 矩阵 PERF 列保持 **blind** / **gap**，**禁止填 covered**。

### G7 — Local Full-Suite Verification Gate（本地全量套件验证关）

**状态**：**已生效**（2026-09-16 双域文档闸齐 + meetwise 授权改钉）— 审据：`reviews/2026-09-16-north-star-g7-local-full-suite-mw-e2e-ha.md` · `reviews/2026-09-16-north-star-g7-local-full-suite-mw-rag-route.md`。  
**硬诚实**：生效 = **门禁条款强制**；**≠** G7 全套已跑通 / suite green；suite = `post_suite_dual_pass`（honesty only；见 `harness/local-full-suite-verification.md`）· **pass ≠ suite green ≠ full suite pass ≠ HA ≠ 0 BUG**；4×nonzero gaps + Key-blocked retained；R2/R4 still open；knife/prove/dual ≠ 成功直至全量成功标准齐。
**执行计划 + 已跑 + post-suite dual**：`harness/local-full-suite-verification.md` · `g7-full-suite-plan.slice.md` · `eval/g7-full-suite-plan.eval.md` · receipt `receipts/2026-09-16-g7-full-suite-run.md` · post-run `reviews/2026-09-16-g7-full-suite-post-run-mw-e2e-ha.md` + `…-mw-rag-route.md` — 状态 **`post_suite_dual_pass`（honesty only）**；**≠** suite green / full suite pass / HA / 0 BUG；`releaseEvidence=false`。

**硬句（中+EN）**：**验证关是成功唯一标准** / **The verification gate is the only success standard.**  
任务做完 / 刀绿 / dual pass / prove EXIT=0 **≠** 成功；须 **另行**通过本验证关。

| 成功 ≠ | 成功 =（G7 生效后） |
|--------|---------------------|
| 单刀 / 切片 knife 绿 | 本地 **全栈** 已拉起（**PG-retained**：Postgres (+pgvector + PostgresSaver) + 相关服务；former MySQL+Qdrant sole 方向 **superseded**；Redis wake orthogonal） |
| 双域文档审 pass / dual pass  alone | **全部** 矩阵 cases + 业务 UCs **端到端执行**（含非快乐：NEG/FAULT/BOUND/ADV/PERF/LOAD 适用处） |
| 单点 / 家族 prove `EXIT=0` | 清晰 **CMD+EXIT / CI / 收据** 全量套件回执（可核验、可复现） |
| 「看起来能跑 / demo 通了」 | 非快乐路径与业务 UC **干净跑通**（失败如实记非零 / blocked / not_run，禁 skip-as-pass） |

**必须（生效后执行面）**：

1. 全部切片落地后：站起 **完整本地环境**（full local stack）。
2. 跑 **所有** 矩阵 cases + 业务 UCs 端到端（含非快乐路径；适用处覆盖 NEG/FAULT/BOUND/ADV/PERF/LOAD）。
3. 产出清晰 **CMD+EXIT / CI 收据套件**；`releaseEvidence` **保持 false** 直至本套件齐。
4. **仅在此之后** 才可裁定「生产 100% HA」与「0 BUG」是否为真。

**禁止（直至 G7 全量套件收据齐；闸已生效 ≠ 收据齐）**：

| 禁止宣称 / 勾选 | 说明 |
|-----------------|------|
| 生产 **100% HA** | 无 G7 全量套件收据 = **forbid** |
| **0 BUG** | 无 G7 全量套件收据 = **forbid** |
| `releaseEvidence=true` | **保持 false** |
| `controlPlaneClosed=true` | **forbid** |
| 「全量 E2E 已齐 / 已成功」 | 刀绿 / dual / 单 prove ≠ G7 |

**并行刀**：R4 REAL-WIRE-IMPL / 其他 knives **可继续**；但任何「成功」叙事 **必须挂在 G7**——不得用他刀绿冒充交付成功。

**本刀禁令**：不跑全量套件当绿关；不把 `harness/local-full-suite-verification.md` 的 `not_run` 写成已执行 / suite green；不得借「G7 已生效」宣称全量套件已跑通或交付已成功。

**执行指针（2026-09-16 ~19:38 PT）**：本地全量套件已 authorize 跑 + post-suite dual **pass** → `post_suite_dual_pass`（honesty only）。见 `harness/local-full-suite-verification.md` · receipt · post-run reviews。**硬钉**：`post_suite_dual_pass` ≠ suite green ≠ full suite pass ≠ 0 BUG ≠ HA；4×nonzero retained；Key-blocked retained；R2/R4 still open；`releaseEvidence=false`。

---

## 2. 后续 knife 强制列

**每一**个后续 knife（含 eval 笔记、harness、覆盖矩阵新行/改行、E2E 切片）**必须**携带：

| 强制列 | 最低内容 |
|--------|----------|
| **NEG** | 负路径用例 ID 或显式 `blind`/`gap`（不得省略列） |
| **FAULT** | 故障/注入用例或显式 `blind`/`gap` |
| **BOUND** | 边界用例 ID 或显式 `blind`/`gap`（可并记 NEG/FAULT，**不得省略**） |
| **ADV** | 对抗用例或显式 `blind`/`gap` |
| **PERF** | 压测命令/收据或显式 `blind`/`not_run`；分面 **PERF_api / PERF_web**（**不得**用 n/a 偷关容量） |
| **LOAD** | 压力/吞吐用例或显式 `blind`/`not_run`；分面 **LOAD_worker** |

缺列 = 该 knife 未完成 G2/G6，矩阵不得把该行从盲区摘掉。  
SSOT 落点：`e2e-requirement-coverage-matrix.md` **§0.5 / §1.0** · 用例全表 `non-happy-path-perf-load-case-matrix.md` · harness `harness/non-happy-path-perf-load-matrix.md`。  
**2026-09-16**：cases/harness/REQUEST 已登记；**未**执行 prove 作绿关；**≠ covered**。

---

## 3. 与既有北星 / 闸的关系（一个结论一处）

| 文件 | 仍回答什么 | 本文不替代 |
|------|------------|------------|
| `north-star-ha.md` | 100% HA 目标、证据阶梯 A–D、HA track 入口、零 BUG 闸 | 七条硬序的展开（本文；**G7 已生效=门禁强制 ≠ 套件已绿**） |
| `impl-review-gate.md` | 每切片 harness→prove→独立审→reviews/ 流程 | 硬序精神（须引用本文） |
| `execution-master-checklist.md` | 工作包依赖与阶段出口 | 七条闸（G7 已生效）；完成定义须满足本文；**成功叙事挂 G7 全量收据** |
| `e2e-requirement-coverage-matrix.md` | 需求→用例覆盖真相 + **盲区列** | 不在矩阵里重写七条全文；§1.0 指针 G7 |
| `m4-rag-hard-gates.md` | R1–R5 RAG 域门 | 交付级硬序（本文） |
| `skills/testing/honesty-rules.md` / `fail-closed-gate.md` | 测试诚实与 AI 产物 fail-closed | 交付北星硬序 |

冲突时：**更严的禁止项为准**；任何文件都不得把本文 G1–G7 降级为 guide。**G7 已生效 ≠ 全量套件已绿**：不得借「G7 已生效」宣称 suite 已跑通 / HA / 0 BUG / `releaseEvidence=true`。

---

## 4. 本切片诚实边界

- **未**跑 `pnpm e2e:isolated` / 全量本地套件 / 云破坏性 TC / 生产 probe（**零 suite run**）。
- **未**把任何矩阵行改为 `covered`。
- **未**勾 `releaseEvidence=true`，**未**叙事 HA / 全量 E2E 已齐 / 0 BUG 已证 / `controlPlaneClosed`。
- 盲区列的 `partial` 继承既有矩阵诚实状态（失败族 / lease / 越权等已有 prove 的行），**不是**新发明的绿。
- **G1–G6 已生效（文档闸）**：双域收据齐 + 授权改钉。**≠** 矩阵 prove 已授权笼统开跑；**≠** covered / HA / `releaseEvidence=true`。
- **G7 = 已生效**（2026-09-16 双域文档闸齐 + meetwise 授权改钉）：门禁条款强制；**≠** suite green / full suite pass；suite = `post_suite_dual_pass`（honesty only）；禁宣 HA / 0 BUG / `controlPlaneClosed`；`releaseEvidence=false`。
- **交叉**：同批 non-happy / R4 wire 等刀可并行；不得借「G7 已生效 / post_suite_dual_pass」宣称验证关执行面已绿或交付已成功。
- harness / suite：`harness/local-full-suite-verification.md`（gate effective as policy；suite **`post_suite_dual_pass`** honesty only；禁宣称 suite green）。
- 切片/评测/收据/post-run：`g7-full-suite-plan.slice.md` · `eval/g7-full-suite-plan.eval.md` · `receipts/2026-09-16-g7-full-suite-run.md` · `reviews/2026-09-16-g7-full-suite-post-run-mw-e2e-ha.md` + `…-mw-rag-route.md`。

*G7 授权改钉生效 + full-suite post_suite_dual_pass（honesty only）：Meetwise 交付硬闸 · 2026-09-16 ~19:38 PT · releaseEvidence=false · ≠HA · ≠ suite green · ≠ full suite pass · R2/R4 open · G7 effective as policy ≠ suite green*
