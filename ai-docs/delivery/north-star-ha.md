# 北星 — Meetwise 面试平台生产 100% 高可用

> **2026-09-17 (~01:15 PT) · stack overlay (PG-retained)**  
> Sole relational+vector truth = **Postgres (+pgvector + PostgresSaver)** — **not** MySQL+Qdrant.  
> Line below that says sole stack = MySQL+Qdrant+Redis is **HISTORICAL / superseded** for relational+vector. Redis wake still separately evaluable.  
> This overlay does **not** claim HA / suite green / releaseEvidence. See `adr-postgres-retained.md`.

> **2026-09-17 (~01:47 PT) · workflow SSOT (W0–W8 · additive)**  
> **W0** PG retained (**`post_prove_dual_pass`** · close **`5c2bf9a`** · dual on `0c95883` · wake provisional overlay after dual) → **W1** inventory (**`post_prove_dual_pass`** · ZERO deletes · dual on `675269c`) → **W1b** retire/trace (**`executed:awaiting_post_prove_dual`** · Batch A+B executed · ZERO DROP · no delete batch · Ban self-write post_prove_dual_pass · `harness/w1b-pg-redundant-retire-batches.md`) → **W6** P0-CB+SCOR honesty (**`post_prove_dual_pass`** · dual on `a6ca9e3` · W3 DELETE=503 freeze remains · ≠ product-complete · `harness/w6-p0-cb-scor-honesty.md`) → **W7** E2E/NHP gap-close plan (**`post_prove_dual_pass`** · dual on `b709753` · Ban covered without EXIT · Ban false green · Dual PASS ≠ fake-close matrix · `harness/w7-e2e-nhp-matrix-gap-close.md`) → W2–W5 closed per SSOT · W8 not open · Dual PASS ≠ coding.  
> Ban DROP in W1/W1b · Ban delete batch · Ban inventing DROP targets · Ban MySQL/Qdrant cutover revival · Ban claiming W8/HA · Ban SCOR/P0-CB product-complete from W6 docs close · Ban covered without EXIT / false green from W7. Dual PASS on W1 ≠ W1b coding.


**状态**：目标声明 · **releaseEvidence=false** · **≠HA** · **不得叙事已 HA**
**硬闸 SSOT**：`north-star-hard-gates.md`（G1–G7：可核验 · 非快乐路径 · 需求→评测→实现 · 独立审 · 禁假绿 · 性能负载 · **本地全量验证关**；**G7=已生效**（门禁强制；≠ 套件已绿））
**并列北星（未齐）**：生产 **100% HA** · **全量 E2E 零遗漏** · **0 BUG**（须证据；不得叙事已达成）

## 目标
生产环境面试平台 **100% 高可用**（可复现证据：多实例 / 故障注入 / prove+EXIT / CI）。**当前 ≠HA**。

## 当前服务该目标的工作流
1. Sole stack（**SUPERSEDED 2026-09-17 relational+vector**）：曾写 MySQL + Qdrant + Redis — **retained** = **Postgres (+pgvector + PostgresSaver)**；Redis wake orthogonal / separately evaluable
2. Eval-first：覆盖矩阵诚实推进（禁连通绿冒充 covered）
3. E2E 目录重构 S0–S4（非 UI 主；LIVE/prove-shell/conn-only）
4. P0 backlog / 对抗审计（≥2 域）

## 证据阶梯（未齐前禁止 HA 叙事）
| 阶 | 内容 | 状态 |
|----|------|------|
| A | 本地 sole-stack + 评测矩阵 partial→covered（诚实） | 进行中 |
| B | E2E 目录收敛 + LIVE 白名单可执行 | S0–S2 pass；S3 blocked→修中 |
| C | 同 VPC 多实例拓扑 + 故障注入 | **骨架已落** + **multi-instance 工具轨** + **C1 真 compose** + **C3 本地 shared 路径**（`compose.ha-dual.shared.yml` · `ha:dual:compose-shared` · `ha:prove:shared`；sole-stack Redis A→B + MySQL marker；需 `MEETWISE_HA_SHARED_AUTHORIZED`）；**C3b 本地 Nest session 路径**（`compose.ha-dual.pg.yml` · `ha:prepare:nest-pg` · `--compose-pg` · `ha:prove:nest-session -- --prove`；需 `MEETWISE_HA_NEST_PG_AUTHORIZED`；本地 `nestSessionOk` 可 true **仍** Not HA / `releaseEvidence=false`）；**C2 stub/授权 compose 可跑**；**本地 C3/C3b ≠ 阶 C 绿 ≠ 生产 HA**；**阶 C prove 未绿**；stub/工具/本地 compose/shared/pg 绿 ≠ 拓扑绿 |
| D | `ha:probe` 类证明 + CI 绿 + 独立审 | **探针骨架** + **`ha:probe:multi`**（可 `--with-shared` / `--with-fault-inject`；仍 `haStatus: NOT_HA` / `releaseEvidence=false`；`--require-evidence` **恒** fail-closed 拒生产 HA）；真生产级 `ha:probe`+CI+独立审 **未开**；stub/本地 C4 绿 ≠ 生产 HA |

## 硬约束
- 不宣称 HA / `releaseEvidence=true` / controlPlaneClosed 直至收据齐（**含 G7 全量本地套件收据**；G7 已生效 ≠ 收据齐，更不得勾）
- 实现方不自审；关键切片双域对抗
- **七条硬闸**（全文 `north-star-hard-gates.md`，本文不降级；**G7 已生效=门禁强制 ≠ 套件已绿**）：
  1. **一切可核验**：每步 CMD+EXIT / CI / 收据；叙事 ≠ 证据
  2. **非快乐路径完整 E2E**：负/故障/边界/对抗须进 cases **且**执行；仅快乐绿 = 假绿
  3. **需求 → 评测用例/矩阵 → 才实现 E2E/prove**：禁止先写绿再回填需求
  4. **执行前独立专家审**：harness/执行须分域独立审；实现方不自批；双域对抗
  5. **禁假绿**：partial / GAP / conn-only / honesty-pin ≠ covered
  6. **性能+负载**：api/web/worker 可复现压测；本地绿 ≠ 生产容量
  7. **本地全量套件验证关（G7 · 已生效）**：验证关是成功唯一标准；刀绿/dual/prove≠成功；无 G7 全量 CMD+EXIT 收据套件 → **forbid** 宣称 100% HA / 0 BUG / `releaseEvidence=true`（生效 ≠ 套件已跑通）
- 后续 knife **必须**带 NEG + FAULT + BOUND + ADV + PERF + LOAD 列（矩阵 §0.5 / §1.0；分面 api/web/worker；见 `non-happy-path-perf-load-case-matrix.md`）

## 生产零 BUG 硬闸
- `gap-bug-backlog` 未关 **P0** / 假绿 / 对抗 **conditional** 阻塞 → **禁止生产发布** 与 `releaseEvidence=true`
- 宣称「无 BUG」须：整套相关 E2E+prove **EXIT=0** + **≥2 域**对抗审通过（不得叙事）
- 发现 BUG：立刻登记 backlog、标红、修→再审；**不得带病合入主路径**

## HA track 入口

- 骨架 Runbook：`harness/ha-track.skeleton.md` · 静态 `pnpm ha-track:skeleton:prove` · `pnpm ha:probe:skeleton`
- **多实例轨**（超骨架）：`harness/ha-track.multi-instance.md` · `pnpm ha-track:multi:prove` · `pnpm ha:dual:build-image` · `pnpm ha:dual:bring-up` / `ha:dual:stub` / `ha:dual:compose` / `ha:dual:compose-shared` / `ha:dual:compose-pg` · `pnpm ha:prepare:nest-pg` · `pnpm ha:prove:shared` · `pnpm ha:prove:nest-session` · `pnpm ha:probe:multi` · `pnpm ha:fault-inject:stub`
- 默认 / stub / 本地 compose 一律 `haStatus: NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false`
- **禁止**把骨架、stub、授权本地 compose、本地 C3 shared、或本地 C4 fault-inject EXIT=0 写成生产 HA / 阶 C/D 已绿

## 平行轨 — W0–W8 PG-retained workflow（非 HA）

- SSOT：`w0-w8-workflow-status.md` · W0–W7 **`post_prove_dual_pass`** · **W1b** `harness/w1b-pg-redundant-retire-batches.md`（`executed:awaiting_post_prove_dual` · Batch A+B executed · ZERO DROP · no delete batch · Ban self-write post_prove_dual_pass）· **W6** P0-CB+SCOR `harness/w6-p0-cb-scor-honesty.md`（post_prove_dual_pass · dual on `a6ca9e3` · W3 DELETE=503 freeze remains · ≠ product-complete）· **W7** E2E/NHP gap-close `harness/w7-e2e-nhp-matrix-gap-close.md`（post_prove_dual_pass · dual on `b709753` · Ban covered without EXIT · Ban false green · Dual PASS ≠ fake-close matrix）· W8 not open · Dual PASS ≠ authorize coding · ≠HA · `releaseEvidence=false`

## 平行轨 — R5 / sole-stack 诚实（非 HA）

- `harness/r5-retirement-sole-stack-status.md` · `harness/r5-pgvector-fixture-mark-red.md`
- Sole stack (**PG-retained 2026-09-17**) = Postgres (+pgvector + PostgresSaver)；former MySQL+Qdrant sole claim superseded；pgvector = retained vector truth（not a forced retirement target）
- **local green ≠ HA**；HA 仍须 multi-instance + fault-inject（上表 C/D）后才可谈 `releaseEvidence`
- 静态 `mysql-stack:r5-mark-red:prove` EXIT=0 **≠** fixtures retired **≠** HA

