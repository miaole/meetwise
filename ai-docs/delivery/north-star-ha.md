# 北星 — Meetwise 面试平台生产 100% 高可用

> **2026-09-17 (~01:15 PT) · stack overlay (PG-retained)**  
> Sole relational+vector truth = **Postgres (+pgvector + PostgresSaver)** — **not** MySQL+Qdrant.  
> Line below that says sole stack = MySQL+Qdrant+Redis is **HISTORICAL / superseded** for relational+vector. Redis wake still separately evaluable.  
> This overlay does **not** claim HA / suite green / releaseEvidence. See `adr-postgres-retained.md`.

> **2026-09-17 (~02:02 PT) · workflow SSOT (W0–W8 · additive)**  
> **W0** PG retained (**`post_prove_dual_pass`** · close **`5c2bf9a`** · dual on `0c95883` · wake provisional overlay after dual) → **W1** inventory (**`post_prove_dual_pass`** · ZERO deletes · dual on `675269c`) → **W1b** retire/trace (**`post_prove_dual_pass`** · dual on `c378943` · ZERO DROP · no delete batch · Dual ≠ DROP/delete-table · HARD RETAIN intact · `harness/w1b-pg-redundant-retire-batches.md`) → **W6** P0-CB+SCOR honesty (**`post_prove_dual_pass`** · dual on `a6ca9e3` · W3 DELETE=503 freeze remains · ≠ product-complete · `harness/w6-p0-cb-scor-honesty.md`) → **W7** E2E/NHP gap-close plan (**`post_prove_dual_pass`** · dual on `b709753` · Ban covered without EXIT · Ban false green · Dual PASS ≠ fake-close matrix · `harness/w7-e2e-nhp-matrix-gap-close.md`) → **W8** G7 full-suite honesty (**`post_prove_dual_pass`** · dual on `1605936` · gates-in-force ≠ suite-green · Ban false green · Ban claiming HA/suite green from this REQUEST · Dual PASS ≠ coding · ≠ suite green · `harness/w8-g7-full-suite-honesty.md`) → W2–W5 closed per SSOT · Dual PASS ≠ coding.  
> Ban DROP in W1/W1b · Ban delete batch · Ban inventing DROP targets · Ban MySQL/Qdrant cutover revival · Ban claiming HA/suite green from W8 · Ban SCOR/P0-CB product-complete from W6 docs close · Ban covered without EXIT / false green from W7 · gates-in-force ≠ suite-green · ≠ W1c-delete/DROP. Dual PASS on W1 ≠ W1b coding · Dual PASS on W1b ≠ DROP/delete-table.

> **2026-09-17 (~19:50 PT) · R2 real close / SSOT flip nailed (additive · ≠ W4)**  
> **R2-SSOT** `harness/r2-ssot-flip-real-close.md` · **`post_prove_dual_pass`** · dual on prove SHA **`5671982`** (e2e-ha+rag) · EXIT **6×0** · standing authorize after dual on `c3092c1` · SSOT flipped off `await_authorize` · prove receipt · **R2 structural CLOSED** · **R2 NOT closed** as HA/suite/verbal/controlPlane/R4/FUNNEL · **≠ verbal 生效** · **≠ W4** · **≠ W4 masquerade** · Ban假关 · Ban false green · sole 恰5 · PG retained · `releaseEvidence=false` · ≠HA · ≠suite.


> **2026-09-17 (~19:55 PT) · R4/FUNNEL rem honesty docs close (additive)**  
> **R4/FUNNEL rem** `harness/r4-funnel-remainder-honesty.md` · **`post_prove_dual_pass`** · dual on `669bca4` (e2e-ha+rag) · **MS3 true ≠ R4 closed** · **MS3 ≠ R4 closed** · **G-R4-5/FUNNEL dual-claim STILL OPEN** · **R4/FUNNEL STILL OPEN** · Ban false green · Ban假绿升格 · Ban elevating honesty to closed · Dual PASS ≠ coding假关 · Dual PASS ≠ authorize coding · zero coding · zero prove · `releaseEvidence=false` · ≠HA · ≠suite · Do NOT claim R4/FUNNEL closed or MS3 closes R4.

> **2026-09-17 (~19:33 PT) · parallel REQUEST opens (additive · docs prep)**  
> **R1-close** `harness/r1-close-authorize-receipt.md` · **W1b-delete honesty** `harness/w1b-delete-honesty.md` · **MODEL-OP-wire** `harness/model-op-real-reconciler-wiring.md` — remaining **`REQUEST-ready / not_run:pre_dual`** where not otherwise closed (R4 rem = `post_prove_dual_pass` on `669bca4`).  
> Pins: R1 NOT closed · Ban flip default · **MS3 true ≠ R4 closed** · **G-R4-5/FUNNEL dual-claim STILL OPEN** · **R4/FUNNEL STILL OPEN** · **MS3 ≠ R4 closed** · Ban假绿升格 · **no delete batch authorized / candidates none or need more prove** · **ZERO DROP** · Dual ≠ DROP · **≠ W5** · PG LISTEN provisional · Redis deferred · Dual PASS ≠ coding · Ban false green · zero coding · `releaseEvidence=false` · ≠HA · ≠suite.


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

- SSOT：`w0-w8-workflow-status.md` · W0–W7 + **W1b** **`post_prove_dual_pass`** · **W1b** `harness/w1b-pg-redundant-retire-batches.md`（post_prove_dual_pass · dual on `c378943` · ZERO DROP · no delete batch · Dual ≠ DROP/delete-table · HARD RETAIN intact）· **W6** P0-CB+SCOR `harness/w6-p0-cb-scor-honesty.md`（post_prove_dual_pass · dual on `a6ca9e3` · W3 DELETE=503 freeze remains · ≠ product-complete）· **W7** E2E/NHP gap-close `harness/w7-e2e-nhp-matrix-gap-close.md`（post_prove_dual_pass · dual on `b709753` · Ban covered without EXIT · Ban false green · Dual PASS ≠ fake-close matrix）· **W8** G7 full-suite honesty `harness/w8-g7-full-suite-honesty.md`（post_prove_dual_pass · dual on `1605936` · gates-in-force ≠ suite-green · Ban false green · Ban claiming HA/suite green from this REQUEST · Dual PASS ≠ coding · ≠ suite green · ≠ W1c-delete/DROP）· suite tip `post_suite_dual_pass` on receipt **`7509f4f`**（45×EXIT0+3 Key-blocked · honesty only · Dual PASS ≠ self-approve green close · ≠ suite green ≠ HA ≠ 0 BUG）· Dual PASS ≠ authorize coding · ≠HA · `releaseEvidence=false`
- **R2-SSOT** (additive · ≠ W4): `harness/r2-ssot-flip-real-close.md` · **`post_prove_dual_pass`** · dual on **`5671982`** · EXIT **6×0** · R2 structural CLOSED · R2 NOT closed as HA/suite/verbal/controlPlane/R4/FUNNEL · ≠ W4 masquerade · Ban假关 · Ban false green · `releaseEvidence=false` · ≠HA

## 平行轨 — R5 / sole-stack 诚实（非 HA）

- `harness/r5-retirement-sole-stack-status.md` · `harness/r5-pgvector-fixture-mark-red.md`
- Sole stack (**PG-retained 2026-09-17**) = Postgres (+pgvector + PostgresSaver)；former MySQL+Qdrant sole claim superseded；pgvector = retained vector truth（not a forced retirement target）
- **local green ≠ HA**；HA 仍须 multi-instance + fault-inject（上表 C/D）后才可谈 `releaseEvidence`
- 静态 `mysql-stack:r5-mark-red:prove` EXIT=0 **≠** fixtures retired **≠** HA

