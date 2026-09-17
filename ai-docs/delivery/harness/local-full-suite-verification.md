# Harness — Local Full-Suite Verification / Execution Plan（G7）

**状态**：suite **`post_suite_dual_pass`**（honesty only）· meetwise 【授权执行·G7 全套】已跑 · post-suite dual **pass** 齐 · **suite green NOT claimed** · `releaseEvidence=false`  
**日期**：2026-09-16（~19:38 PT · G7 full-suite **post_suite_dual_pass** · dual reviews 齐）  
**releaseEvidence=false** · **≠HA** / Not HA · **≠ covered** · **≠ 0 BUG 已证** · **≠ controlPlaneClosed** · **≠ suite green** · **≠ full suite pass**  
**硬钉**：**pass ≠ suite green ≠ full suite pass ≠ HA ≠ 0 BUG** · **R2/R4 still open** · **4×nonzero retained as gaps** · **3×Key-blocked honesty retained**  
**硬闸 SSOT**：`north-star-hard-gates.md` **G7**（2026-09-16 双域文档闸齐 + meetwise 授权改钉 → **已生效**）  
**本刀**：meetwise authorize 下已执行 §4 inventory；收据 `receipts/2026-09-16-g7-full-suite-run.md`；post-suite dual **pass**；**仍 ≠ suite green** · 假绿禁令保持  
**切片**：`../g7-full-suite-plan.slice.md` · **Eval**：`../eval/g7-full-suite-plan.eval.md`  
**审据（门禁生效 · 非本刀）**：
- `reviews/2026-09-16-north-star-g7-local-full-suite-mw-e2e-ha.md`
- `reviews/2026-09-16-north-star-g7-local-full-suite-mw-rag-route.md`
**本刀 REQUEST（执行计划）**：
- `reviews/REQUEST-2026-09-16-g7-full-suite-plan-mw-e2e-ha.md`
- `reviews/REQUEST-2026-09-16-g7-full-suite-plan-mw-rag-route.md`
**计划审据 · mw-e2e-ha**：**pass**（RECHECK）· `reviews/2026-09-16-g7-full-suite-plan-RECHECK-mw-e2e-ha.md`（前序 conditional：`…-g7-full-suite-plan-mw-e2e-ha.md`）  
**计划审据 · mw-rag-route**：**pass**（plan-only + RECHECK）· `reviews/2026-09-16-g7-full-suite-plan-mw-rag-route.md` · `…-RECHECK-mw-rag-route.md`  
**执行收据（本刀）**：`receipts/2026-09-16-g7-full-suite-run.md`（41×0 / 4×nonzero / 3×Key-blocked · **≠ suite green**）  
**Post-suite dual 审据（本旗依据 · 禁自批）**：
- `reviews/2026-09-16-g7-full-suite-post-run-mw-e2e-ha.md`（**pass** · 收据诚实性 only · **≠ suite green**）
- `reviews/2026-09-16-g7-full-suite-post-run-mw-rag-route.md`（**pass** · RAG/域隔离诚实 only · **≠ suite green**）
**Post-suite REQUEST（已覆盖）**：
- `reviews/REQUEST-2026-09-16-g7-full-suite-post-run-mw-e2e-ha.md`
- `reviews/REQUEST-2026-09-16-g7-full-suite-post-run-mw-rag-route.md`
**Honesty knives（index · ≠ verification success）**：
- Index：`../g7-honesty-knives.slice.md`（**`K1+K2+K3+A dual-closed honesty`** · MAIN sole∩scor **untouched**）
- **K1/K2/K3** → **`post_prove_dual_pass`** · harness `g7-k1-…` / `g7-k2-…` / `g7-k3-…` · post-prove dual **pass**
- **A** → **`post_change_dual_pass`** · harness `g7-key-blocked-x3-honesty.md` · post-change dual **pass** · Key-blocked live still blocked
- Main track：`harness/g7-sole-fixture-retire-scor00.md`（sole夹具退役 ⋂ scor-00；B4 superseded · **≠ retired**）
- Hard pins：≠ R2/R4 closed ≠ suite green ≠ HA ≠ 题域已隔离 · sole ≠ retired · **G6 OPEN** · `releaseEvidence=false`

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| **G7 已生效** | **是** — 门禁条款强制 / policy |
| **G7 全套已跑通 / suite green** | **否** — suite `post_suite_dual_pass`（honesty only）· green **NOT claimed** · **pass ≠ suite green ≠ full suite pass** |
| 本刀目标 | 定义如何站起完整本地环境 + 如何跑 **全部** cases/UCs（含 NEG/FAULT/BOUND/ADV/PERF/LOAD）+ CMD 冻结 + 诚实/假绿禁令 |
| 本刀禁止 | 任何 suite / prove / `e2e:isolated` / `verify:e2e-performance` / LOAD / 云 TC / HA live；读 `.env*`；改 Worker；commit；自批 pass |
| 成功唯一标准 | **验证关是成功唯一标准** / The verification gate is the only success standard |
| 刀绿 / dual / prove EXIT=0 | **≠** 成功；须另行通过 G7 全量收据套件 |

**硬句**：**G7 effective as policy ≠ suite green** · **≠ claim 0 BUG** · **≠ HA** · **`releaseEvidence=false`** 直至全量 CMD+EXIT/CI 收据齐。

---

## 1. Prereqs（站起本地全栈 · **已 bring-up mysql-local**）

> 执行刀已 `docker compose -f docker/compose.mysql-local.yml up -d`（Compose v2.29.7 via `/tmp/docker-compose`）。**仍禁**读 `.env*` / 发明 Key。

### 1.1 Sole-stack 方向（真相栈）

| 组件 | 本地入口 | 诚实钉 |
|------|----------|--------|
| **MySQL 8+** | `docker/compose.mysql-local.yml` · ADR `adr-mysql-qdrant-local.md` | sole-stack 真相；**≠** 默认 `E2E_PG_IMAGE=pgvector` |
| **Qdrant** | 同 compose / mysql-local 轨 | 向量真相方向；缺 ready → PREREQ；**≠** 默认 `vectorstore:prove` 已切 |
| **Redis** | 同 compose | Streams/租约方向；**≠** 生产 wakeup 已切 |
| 应用服务 | api / worker / web（按家族需要） | 须另授权才可 bring-up；**本刀不启** |

**禁止**：把 legacy `compose.dev.yml`（pgvector）写成 sole-stack 已默认；把 `compose.demo.yml` / `compose.prod*.yml` 本地绿写成生产 HA。

### 1.2 环境 / 密钥 / 文件纪律

| 项 | 要求 |
|----|------|
| `.env*` | **永不读取 / 不打印 / 不提交**（本刀硬禁） |
| `MODEL_API_KEY` | 无 Key → LIVE/`e2e:isolated` 记 **blocked**（见 `g6-e2e-iso-blocked`）；**禁止**发明 Key |
| HA 授权旗 | `MEETWISE_HA_*_AUTHORIZED` 仅在 **另发执行授权** 后才可谈；本刀 **不**置位 |
| 收据目录 | 将来写入 `.tmp/e2e-receipts/` / 家族 receipt；本刀 **零**新建执行收据 |
| Worker / apps | **零改码**（本刀 docs+REQUEST only） |

### 1.3 栈诚实（假绿禁令入口）

| 绿表面 | 禁止读成 |
|--------|----------|
| `mysql-stack:*:prove` EXIT=0 | 业务 covered / 全量 E2E / G7 绿 |
| `e2e:isolated` on pgvector | sole-stack 已迁 / R5 关 / covered |
| HA skeleton / stub / 本地 dual compose | 生产 100% HA / 阶 C/D 已证 |
| 单刀 prove / Batch dual pass | G7 全套已齐 / `releaseEvidence=true` / 0 BUG |

对照：`harness/r5-retirement-sole-stack-status.md` · `harness/g6-e2e-iso-blocked.md` · `harness/e2e-full-suite.inventory.md`。

---

## 2. Suite inventory（要跑什么 · 执行后见 receipt；**≠ suite green**）

> 执行面 = **全部** 下列家族 + 矩阵行 + UC e2e + R2/R4 proves + HA probes（**honesty-not-HA**）。本刀仅登记；**零执行**。

### 2.1 非快乐矩阵 · Batch1 / Batch2 / Batch3

| 批 | 状态（既有） | 入口 | G7 读法 |
|----|--------------|------|---------|
| **Batch1** NEG+PERF（7 IDs） | `post_prove_dual_pass` · honesty ≠ covered | `nhp-batch1-neg-perf.slice.md` · harness/eval | 可计入 G7 收据池 **仅当** 有可核验 CMD+EXIT；**仍 ≠** 全家 covered / ≠ G7 自动绿 |
| **Batch2** NEG/FAULT/BOUND（7 IDs） | `post_prove_dual_pass` · honesty ≠ covered | `nhp-batch2-neg-fault.slice.md` | 同上 |
| **Batch3** FAULT/BOUND + R4 NEG/FAULT（7 IDs） | **`post_prove_dual_pass`**（他刀 7×已跑 · dual post-prove done） | `nhp-batch3-fault-bound.slice.md` · harness | **EXIT=0 honesty ≠ covered ≠ 自动并入 G7 绿** · **≠** G7 收据齐 · post-prove dual pass 仍不得当全量绿证据；G7 suite CMDs 仍全部 `not_run` |
| 矩阵全表其余行 | case-only / partial / blind / gap / deferred | `non-happy-path-perf-load-case-matrix.md` | G7 须覆盖 **适用列** NEG/FAULT/BOUND/ADV/PERF/LOAD；缺列 = 盲区保留 |

**SSOT**：`non-happy-path-perf-load-case-matrix.md` · 父 harness `harness/non-happy-path-perf-load-matrix.md` · 覆盖矩阵 `e2e-requirement-coverage-matrix.md` §0.5 / §1.0。

**Batch3 硬句（B1 对齐）**：现场状态 = **`post_prove_dual_pass`**（dual post-prove done）。**Batch3 EXIT=0 honesty ≠ covered ≠ automatic G7 suite green** · **≠** `releaseEvidence=true`。G7 authorize 刀已重跑相关 CMD 并记入 receipt；**仍 ≠ suite green**。

### 2.2 业务 UC e2e（端到端）

| UC / 家族 | 代表 CMD（计划） | 诚实钉 |
|-----------|------------------|--------|
| UC-E2E-001 黄金路径 | `pnpm e2e:isolated` · `uc001:live-blocked:prove` | 无 Key → blocked；pgvector → R5 green-risk；**≠** 全 UC 齐 |
| UC-002 / 010 / 011 / 015 / 017 / 018 / 019 / 025 / 027 / 028 / 031-032 / 033 / 040-043 / 003 / 004 | 对应 `pnpm uc*:prove`（见 §4 冻结表） | 单 UC EXIT=0 ≠ covered 全家；≠ G7 绿 |
| UI 流 | `pnpm e2e:ui:isolated` | 历史/无 Key → not_run/blocked |
| 隐私 HTTP | `pnpm privacy-erasure:http:prove` 等 | DELETE=503 pin ≠ 产品删除闭环 |
| 性能门 | `pnpm verify:e2e-performance` | **≠** 线上 SLO / ≠ LOAD 产能 / ≠ HA |

Harness 叶：`harness/uc-e2e-*.md` · inventory `harness/e2e-full-suite.inventory.md` · `e2e-case-inventory.md`。

### 2.3 R2 / R4 proves（诚实 · ≠ closed）

| 轨 | 代表 CMD（计划） | EXIT=0 读法 |
|----|------------------|-------------|
| R2 classify / live | `r2-classify-job-route-prereq:prove` · `r2-p-*-route-classify:prove` · `r2-p-live-route-effective:prove` | honesty / wire 面；**≠ R2 overall closed** · **≠ 路由已生效**（除非另有生效授权+收据） |
| R2-5 / retrieve fail-closed | `g-r2-5-retrieve-fail-closed:prove` | fail-closed pin；**≠ R4 closed** |
| R4 recheck / wire / planner / wrong_track | `g4-dispatch-recheck-prereq:prove` · `r4-real-wire-impl:prove` · `r4-p-planner-unit:prove` · wrong_track ADV harness | FLIPPED/wire/unit ≠ R4 closed · ≠ wrong_track=0 · ≠ ADV covered |
| R4 domain isolation | `mysql-stack:r4-domain-isolation:prove` | **conn/static ≠ ADV covered** |

对照：`harness/r2-*` · `harness/r4-*` · NHP-R2-* / NHP-R4-* 矩阵行。

### 2.4 HA probes（**honesty-not-HA**）

| CMD（计划） | 读法（硬钉） |
|-------------|--------------|
| `pnpm ha-track:skeleton:prove` | 骨架静校；**Not HA** |
| `pnpm ha:probe:skeleton` | 默认 `haStatus: NOT_HA`；**永不** production HA |
| `pnpm ha-track:multi:prove` · `ha:probe:multi` | 工具轨 / 本地 dual；**≠** 阶 C/D 绿 · **≠** 生产 HA |
| `ha:dual:*` / `ha:prove:shared` / `ha:prove:nest-session` / fault-inject | 须另授权旗；本地绿 **仍 Not HA** · `releaseEvidence=false` |

对照：`harness/ha-track.skeleton.md` · `harness/ha-track.multi-instance.md` · `north-star-ha.md`。  
**G7 纳入 HA probes = 诚实探针收据**；**禁止**把 HA 探针绿写成「G7 已证生产 HA」或「0 BUG」。

### 2.5 明确 **非** G7 业务绿（禁并入成功叙事）

```text
mysql-stack:skeleton|ping|m2|m3|m4|m5:prove   → 连通/文档 only
e2e-case-inventory:prove / r5-mark-red:prove → 静态钉 only
compose config 静校 / livez 单实例           → ≠ multi-instance / ≠ HA
```

---

## 3. G7 生效 ≠ suite green · 退出标准（收据）

### 3.1 生效 vs 执行

| 命题 | 真？ |
|------|------|
| G7 门禁条款已强制（policy） | **是** |
| 全量本地套件已跑通 | **否**（`not_run`） |
| 可宣称交付成功 / 全量 E2E 已齐 | **否** |
| 可勾 `releaseEvidence=true` / `controlPlaneClosed` | **否** |
| 可宣称生产 100% HA / 0 BUG | **forbid**（无全量收据） |

### 3.2 G7 收据退出标准（将来 · 本刀未达）

须 **同时**满足（缺一不可）：

1. **全栈已拉起**（sole-stack 方向：MySQL + Qdrant + Redis + 所需服务）；夹具列写清；禁止默认可假绿。  
2. **全部** 矩阵适用 cases + 业务 UCs **端到端执行**（含 NEG/FAULT/BOUND/ADV/PERF/LOAD 适用处）；失败如实 **非零 / blocked / not_run**（禁 skip-as-pass）。  
3. 清晰 **CMD+EXIT / CI 收据套件**（按家族可核验、可复现）。  
4. 双域（至少 `mw-e2e-ha` + `mw-rag-route`）对收据套件 **独立审**；实现方 **禁止自批**。  
5. **仅在此之后** 才可 **裁定**「生产 100% HA」与「0 BUG」是否为真——**裁定 ≠ 自动宣称**；仍须协调授权勾选。

**本刀执行后**：CMD 已跑并出收据 → post-suite dual **pass** → suite **`post_suite_dual_pass`**（honesty only）；退出标准第4项（独立双审收据诚实性）**已达**；第5项（裁定 HA/0 BUG）**未达且禁自动宣称** · **suite green NOT claimed** · `releaseEvidence=false` · **4×nonzero gaps + 3×Key-blocked retained** · **R2/R4 still open**。

---

## 4. CMD 冻结表（inventory · 已跑见 receipt · **≠ suite green**）

> 下列为 inventory；本 authorize 刀已跑并记 EXIT（见 receipt）。**EXIT=0 ≠ covered ≠ suite green**。

```bash
cd /workspace/meetwise
# === G7 local full-suite · post_suite_dual_pass (honesty only; ≠ suite green) · see receipts/2026-09-16-g7-full-suite-run.md ===
# --- 0. Prereq stack (plan only; do NOT run this knife) ---
# docker compose -f docker/compose.mysql-local.yml config   # 静校 ≠ 已起栈
# # bring-up MySQL+Qdrant+Redis — 另授权；禁读 .env*
#
# --- 1. Wide HTTP/UI / perf (inventory A/B) ---
# pnpm e2e:isolated                         # UC 主链家族；无 Key → blocked；fixture=pgvector → R5
# pnpm e2e:ui:isolated                      # UI；常 not_run/blocked
# pnpm verify:e2e-performance               # ≠ 线上 SLO / ≠ LOAD / ≠ HA
# pnpm g6-e2e-iso-blocked:prove             # Key-unset honesty ≠ family green
#
# --- 2. UC e2e proves (representative; 见 harness/uc-e2e-*) ---
# pnpm uc002:lease:prove
# pnpm uc002:http:prove
# pnpm uc003:i18n-locale:prove
# pnpm uc004:career-path:prove
# pnpm uc010:sse-resume:prove
# pnpm uc011:report-refund:prove
# pnpm uc011:report-refund:http:prove
# pnpm uc015:ingest-failures:prove
# pnpm uc017:orphan:prove
# pnpm uc018:abandon:prove
# pnpm uc018:abandon:http:prove
# pnpm uc019:report-regenerate:prove
# pnpm uc019:report-regenerate:http:prove
# pnpm uc025:stale-quiz-expiry:prove
# pnpm uc027:manual-review-appeal:prove
# pnpm uc028:trace-fail-open:prove
# pnpm uc031-032:injection-jailbreak:prove
# pnpm uc033:cross-user-authz:prove
# pnpm uc040-043:batch-qbank-seat:prove
# pnpm uc001:live-blocked:prove             # blocked honesty ≠ 001 covered
#
# --- 3. NHP Batch1/2/3（矩阵；G7 suite 本刀仍全部 not_run） ---
# # Batch1/2：既有 post_prove 收据可引用，≠ covered；重跑须另授权
# # Batch3：harness/nhp-batch3-fault-bound.md = post_prove_dual_pass（他刀已跑；dual post-prove done）
# #          EXIT=0 honesty ≠ covered ≠ automatic G7 suite green ≠ G7 收据齐
# #          本 G7 计划刀不重跑 / 不并入绿；suite CMDs 仍冻结 not_run
#
# --- 4. R2 / R4 proves（honesty ≠ closed） ---
# pnpm r2-classify-job-route-prereq:prove
# pnpm r2-p-worker-route-classify:prove
# pnpm r2-p-api-route-classify:prove
# pnpm r2-p-loop-route-classify:prove
# pnpm r2-p-start-route-classify:prove
# pnpm r2-p-fake-route-classify:prove
# pnpm r2-p-live-route-effective:prove      # ≠ 路由已生效笼统宣称
# pnpm g-r2-5-retrieve-fail-closed:prove    # ≠ R4 closed
# pnpm g4-dispatch-recheck-prereq:prove     # FLIPPED honesty ≠ R4 closed ≠ ADV
# pnpm r4-real-wire-impl:prove              # wire ≠ R4 closed
# pnpm r4-p-planner-unit:prove              # unit ≠ planner leaf 关
# pnpm r4-wrong-track-adv:prove               # DEFERRED (ADV); wire≠ADV≠R4 closed; may already EXIT=0 pending post-prove dual — still ≠ covered / ≠ suite green
# pnpm mysql-stack:r4-domain-isolation:prove  # ≠ ADV covered
#
# --- 5. Privacy / scor / wakeup / rag-qdrant (inventory C–E；按族记 EXIT) ---
# pnpm privacy-erasure:http:prove
# pnpm scor-00:http:prove
# pnpm scor-00-honesty:prove
# pnpm worker-wakeup:prove
# pnpm worker-wakeup-redis:prove            # ≠ 生产已切
# # vectorstore / rag* / memory* — 默认夹具 R5；opt-in qdrant 另记
#
# --- 6. HA probes · honesty-not-HA ---
# pnpm ha-track:skeleton:prove              # Not HA
# pnpm ha:probe:skeleton                    # haStatus: NOT_HA
# pnpm ha-track:multi:prove                 # ≠ 生产 HA
# pnpm ha:probe:multi                       # 仍 NOT_HA / releaseEvidence=false
# # ha:dual:* / ha:prove:shared / nest-session / fault-inject — 另授权；仍 Not HA
#
# --- 7. 仍禁并入 G7「业务绿」叙事 ---
# # pnpm mysql-stack:skeleton:prove / ping / m2–m5 — 连通 only
# # 云 TC / UI-pay / cloud-kill / PERF-CLOUD — deferred/blocked 另册
```

| 本刀状态 | 值 |
|----------|-----|
| 执行旗 | **`post_suite_dual_pass`**（原 `executed:awaiting_post_suite_dual` 已清 · **honesty only** · **≠ suite green**） |
| suite run | **done** · 41×0 / 4×nonzero / 3×Key-blocked · **≠ suite green** · **≠ full suite pass** |
| 4×nonzero | **retained as gaps**（禁 skip-as-pass / 禁冲销为 covered） |
| Key-blocked | **3× honesty retained**（禁 invent Key） |
| R2/R4 | **still open** |
| Batch3 既有状态（他刀） | **`post_prove_dual_pass`** · EXIT=0 ≠ covered ≠ G7 绿 |
| Key / `.env*` | **不读** |
| Worker 改码 | **无** |
| 实现方自批 | **禁止** |
| `releaseEvidence` | **false** |

---

## 5. 假绿禁令（汇总）

| 禁止 | 说明 |
|------|------|
| G7 已生效 → suite green | **forbid** |
| 刀绿 / dual pass / 单 prove EXIT=0 → 交付成功 | **forbid** |
| `post_suite_dual_pass` → suite green / full suite pass / HA / 0 BUG | **forbid**（honesty only · 4×nonzero gaps + Key-blocked retained） |
| Batch1/2 `post_prove_dual_pass` → 全家 covered / G7 齐 | **forbid**（honesty only） |
| Batch3 `post_prove_dual_pass` / EXIT=0 → covered / 自动并入 G7 绿 | **forbid**（honesty only · ≠ G7 suite green） |
| HA probe EXIT=0 → 生产 HA / 0 BUG | **forbid**（honesty-not-HA） |
| pgvector / mysql-stack 连通绿 → sole-stack 已迁 / covered | **forbid** |
| skip-as-pass / 沉默省略非零 EXIT | **forbid** |
| 无全量收据勾 `releaseEvidence=true` / `controlPlaneClosed` / 宣称 0 BUG / 100% HA | **forbid** |

---

## 6. 并行刀

R4 REAL-WIRE-IMPL / NHP Batch3 / 其他 knives **可继续**；成功叙事 **必须挂 G7 全量收据**——不得用他刀绿冒充交付成功。本计划刀 **不阻断 / 不回滚** 并行轨。

---

## 7. 本刀诚实边界

- **已**按 authorize 跑 §4 inventory（41×EXIT=0 / 4×nonzero / 3×Key-blocked）；post-suite dual **pass** → **`post_suite_dual_pass`**；**suite green NOT claimed**。  
- **硬钉**：**pass ≠ suite green ≠ full suite pass ≠ HA ≠ 0 BUG** · `releaseEvidence=false` · **R2/R4 still open** · **4×nonzero retained as gaps** · **Key-blocked honesty retained**。  
- **未**读 `.env*`；**未**发明 Key；**未**改 Worker（本刀）；**未** commit；**未** Meridian。  
- **未**宣称 suite green / covered / HA / 0 BUG / `releaseEvidence=true` / controlPlaneClosed / R2·R4 closed / full suite pass。  
- G7 = **已生效（policy）**；suite = **`post_suite_dual_pass`**（honesty only · **≠** suite green）。  
- Batch3 既有 = **`post_prove_dual_pass`**；重跑 EXIT=0 **仍 ≠ covered ≠ automatic G7 suite green**。  
- HA probes = **honesty-not-HA**；privacy-erasure:http = DELETE **503** pin（未开产品 DELETE）。  
- UC isolated 默认 pgvector → **R5 green-risk**（sole-stack MySQL+Qdrant+Redis 已起 ≠ R5 关）。  
- 实现方 **禁止自批**；本旗仅反映专家 post-suite dual pass（收据诚实性）。

*Harness · G7 local full-suite · 2026-09-16 ~19:38 PT · post_suite_dual_pass (honesty only) · 41×0/4×nonzero/3×Key-blocked · releaseEvidence=false · ≠HA · ≠ suite green · ≠ full suite pass · R2/R4 open · G7 policy ≠ suite green*
