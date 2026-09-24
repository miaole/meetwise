# Harness — UC-E2E-018 用户主动放弃面试（eval-first · partial ladder）

**releaseEvidence=false** · **Not HA** · **本绿 ≠ 全链路 E2E covered** · **≠ UC-E2E-018 covered**  
**对照矩阵行**：`UC-E2E-018`  
**对照建议补集**：`e2e-requirement-coverage-matrix.md` §3 P0-8  
**对照需求**：`e2e-scenarios.md` UC-E2E-018 · 验收 A1/A2/A3  
**MODEL_API_KEY**：**不需要**（db 集成 + HTTP abandon 均不调 live 模型）

---

## 0. 立场（先读）

| 声明 | 裁定 |
|------|------|
| 现有覆盖 | 矩阵可升 **partial**（`uc018:abandon:prove` + `uc018:abandon:http:prove` 真跑绿）；**不得**写 covered |
| 本切片 | 可执行 **A1 / A1-shell / A2 / A3 / A-created-reserved / A-waiting-user**（db）+ **H1 / H1-shell / H2 / H3 / H-waiting-user / H-authz**（HTTP 真口） |
| 另轨 | `commerce:prove`（abandon×confirm 并发）/ `commerce-reconcile:prove`（TTL 旁证 only · **≠** `GAP-UC018-TTL` 专用钉；专用钉=`uc018:ttl:prove`）/ `neg:interview` abandon 负路径 **≠** 本 UC 专用验收（可旁证，勿冒充） |
| 假绿禁令 | 不得把本绿写成「UC-E2E-018 covered」；FULL-E2E+GRAPH+TTL 已关仍 ≠ covered（#5/#6 仍开） |
| 本绿≠全链路 E2E covered | **必须钉死**；`GAP-UC018-FULL-E2E`+#2 GRAPH+#3 TTL 已关 · 仍缺 §1b #5/#6 → 矩阵 **partial** · **≠ covered** |

专家：`mw-e2e-ha`（+ 若额度账本关键切片则第二域）。禁止作者自签 covered。

---

## 1. 测什么（A1–A3 + HTTP H* 可执行合同）

| ID | 场景 | 期望 | 执行体 |
|----|------|------|--------|
| **A1** | `active` + reserved → `abandonInterviewAndRelease` | `Interview=abandoned`；`entitlement_consumption=released`；额度净变 0 | `packages/db/test/uc-e2e-018-user-abandon.proof.ts` |
| **A1-shell** | `created` 无预留空壳放弃 | `abandoned` + `released=noop`；额度不变 | 同上 |
| **A-created-reserved** | `created`+reserved（begin 后、worker 置 active 前） | `abandoned` + `released`；额度净变 0 | 同上 |
| **A-waiting-user** | `waiting_user`+reserved（题间等待作答） | `abandoned` + `released`；额度净变 0；∉ in-progress | 同上 |
| **A2** | abandoned 后再 abandon / complete | 二次 → `already_abandoned`+noop；`completeInterviewAndConfirm` → `interview_settlement_failed`；仍 abandoned | 同上 |
| **A3** | in-progress 过滤 | `status NOT IN (completed,abandoned,failed)` **不含** abandoned id | 同上 |
| **H1** | HTTP `POST /interview/:id/abandon` · active+reserved | **200** `abandoned=true` `released=released`；DB abandoned+released；额度净变 0 | `apps/api/test/uc-e2e-018-user-abandon-http.proof.ts` |
| **H1-shell** | HTTP created 空壳 | **200** `released=noop`；额度不变 | 同上 |
| **H2** | HTTP 二次 abandon + begin 拒复活 | 二次 `alreadyAbandoned=true`+noop；`POST …/begin` → **409** `interview_not_active` | 同上 |
| **H3** | HTTP list / create 复用口径 | abandoned 终态可读；create 复用 live 非 dead | 同上 |
| **H-waiting-user** | HTTP `waiting_user`+reserved abandon | **200** `released=released`；DB abandoned；额度净变 0；begin→409 | 同上 |
| **H-authz** | 越权 / 未鉴权 / 终态 | 404 / 401 / 409 `interview_not_active` | 同上 |

**搜码结论（本波）**：产品口 **已存在** — `apps/api/src/modules/interview/interview.controller.ts` `@Post(':id/abandon')` → `InterviewService.abandon` → `abandonInterviewAndRelease`。本波 **不** 新开 route；HTTP prove 打真口。**CAS 补刀**：`abandonInterviewAndRelease` 允许集扩为 `created\|active\|waiting_user`（对齐场景 `active/waiting_user → abandoned`；仍不碰 AiGraphRun）。

### 明确不测 / BLOCKED（本 harness · 抬 covered 见 §1b）

| 非目标 | 原因 |
|--------|------|
| ~~`full.e2e.ts` / `e2e:isolated` 场景矩阵纳入~~ **CLOSED**（`GAP-UC018-FULL-E2E` · full.e2e 显式 abandon TC + `pnpm uc018:abandon:full-e2e:prove`） | 已关 · 矩阵仍 **partial**（#2/#3/#5/#6）· **≠ covered** |
| ~~`AiGraphRun → safely_terminated`~~ **CLOSED**（`GAP-UC018-GRAPH` · `abandonInterviewAndRelease` → `safe_terminating`→`safely_terminated` + 业务事实保全 + `pnpm uc018:graph:prove`） | 已关 · 矩阵仍 **partial**（#5/#6）· **≠ covered** |
| ~~TTL sweeper → abandoned~~ **CLOSED**（`GAP-UC018-TTL` · `pnpm uc018:ttl:prove`；旁证 `commerce-reconcile:prove` 仍 ≠ UC covered） | 已关 · 矩阵仍 **partial**（#5/#6）· **≠ covered** |
| UI「点放弃」（`GAP-UC018-UI` **OPEN** · §1b #5） | NON-UI 优先；Playwright 降次；**不可单独升 covered** · REQUEST `harness/uc-e2e-018-ui-abandon.md` |
| 完整黄金路径 UC-E2E-001 | 另轨；需 Key |

---

## 1b. 抬到 covered 还缺（HTTP/product path · 非仅 GAP 标签）

> partial ≠ done。下列是北星「全链路零遗漏」要关的路径，**不是**本 prove 已绿项。**禁止**因 H1–H3 绿而升 covered。

| # | 抬到 **covered** 仍缺 | 对应验收 / 缺口 |
|---|------------------------|-----------------|
| 1 | ~~`full.e2e.ts` / `e2e:isolated` **显式** TC：鉴权→begin 预留→`POST /interview/:id/abandon`→abandoned+released+不可 resume~~ **CLOSED**（`e2e/full.e2e.ts` 4-UC018 + `pnpm uc018:abandon:full-e2e:prove` / `E2E_UC018_ABANDON_ONLY=1`；HTTP prove 仍 ≠ covered） | was A1/A2 · `GAP-UC018-FULL-E2E` · **已关** · 矩阵仍 **partial** |
| 2 | ~~放弃时 `AiGraphRun`：`safe_terminating`→`safely_terminated`（或等价）+ 业务事实保全集成/E2E 钉~~ **CLOSED**（`pnpm uc018:graph:prove` / `packages/db/test/uc-e2e-018-graph-safely-terminated.proof.ts`；abandon 路径两步 CAS + 事件/题目/面试行保全） | was 主流程图终态 · `GAP-UC018-GRAPH` · **已关** · 矩阵仍 **partial** |
| 3 | ~~TTL sweeper 专用钉：租约过期孤儿 → abandoned + released（与用户主动放弃同终态口径）~~ **CLOSED**（`pnpm uc018:ttl:prove` / `apps/worker/test/uc-e2e-018-ttl-sweeper-abandon.proof.ts`；TTL tick → `abandonInterviewAndRelease` 同终态口径；`commerce-reconcile:prove` 仍为旁证 ≠ 本钉） | was TTL · `GAP-UC018-TTL` · **已关** · 矩阵仍 **partial** |
| 4 | ~~`waiting_user` CAS 放弃口 + prove~~ **CLOSED**（本波：CAS=`created\|active\|waiting_user` + A/H-waiting-user） | was `GAP-UC018-WAITING-USER` · **已关** |
| 5 | UI：面试中「放弃」触发 → 同上 HTTP 合同（`e2e:ui:isolated` 次层；不可单独升 covered）· **`GAP-UC018-UI` OPEN**（REQUEST `harness/uc-e2e-018-ui-abandon.md` · status `draft:awaiting_pre_exec_dual` · Ban claim UC covered · Ban wash TTL/GRAPH/FULL-E2E/HTTP into UI closed） | 触发/后置 · `GAP-UC018-UI` |
| 6 | sole-stack 夹具（MySQL+Qdrant+Redis）替换默认 pgvector isolated，去掉 **R5 green-risk** 后才可讨论发布级 covered | 矩阵 §0 / R5 |

**本切片已关 §1b#4（waiting_user）**；**已关 §1b#1（`GAP-UC018-FULL-E2E`）**；**已关 §1b#2（`GAP-UC018-GRAPH` · `uc018:graph:prove`）**；**已关 §1b#3（`GAP-UC018-TTL` · `uc018:ttl:prove`）**；**§1b#5 `GAP-UC018-UI` 仍 OPEN**（docs REQUEST `harness/uc-e2e-018-ui-abandon.md` · `draft:awaiting_pre_exec_dual` · UI alone ≠ covered）；仍明确不做：上表 #5/#6 实现升 covered；把旁证 prove / full.e2e/graph/ttl 绿写成 UI closed / covered；把矩阵升 covered。

---

## 2. 命令与期望 EXIT

| CMD | 期望 EXIT | 含义（诚实） |
|-----|-----------|--------------|
| `pnpm uc018:abandon:prove` | **0** | A1–A3 + A-waiting-user 集成断言绿；**本绿 ≠ 全链路 E2E covered**；fixture=pgvector → green-risk / R5 |
| `pnpm uc018:abandon:http:prove` | **0** | H1–H3 + H-waiting-user + H-authz 真 HTTP 放弃口绿；**仍 ≠ covered**；privacy stub pin；R5 |
| `pnpm uc018:abandon:prove:raw` / `…:http:prove:raw`（仅经 isolated 子进程） | **0** | raw：`pnpm -C packages/db prove:uc018-abandon` / `pnpm -C apps/api prove:uc018-abandon-http` |
| `pnpm uc018:abandon:full-e2e:prove` | **0** | full.e2e 显式 abandon TC（`E2E_UC018_ABANDON_ONLY=1` → isolated `e2e:prove`）；关 `GAP-UC018-FULL-E2E` only；**仍 ≠ covered**；R5 |
| `pnpm uc018:graph:prove` | **0** | AiGraphRun `safe_terminating`→`safely_terminated` + 业务事实保全；关 `GAP-UC018-GRAPH` only；**仍 ≠ covered**；R5 |
| `pnpm uc018:ttl:prove` | **0** | 租约过期孤儿 → abandoned+released（+graph safely_terminated）；关 `GAP-UC018-TTL` only；**仍 ≠ covered**；R5；Ban wash commerce-reconcile 旁证 |
| `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 `UC-E2E-018`；≠业务 covered |

```bash
cd /workspace/meetwise
# db/http prove：无需 MODEL_API_KEY；需 Docker disposable PG（run-e2e-isolated）
# full-e2e prove：需 MODEL_API_KEY（run-e2e.mjs fail-closed）；E2E_UC018_ABANDON_ONLY=1 早退，不跑黄金路径答题
pnpm uc018:abandon:prove ; echo EXIT=$?
pnpm uc018:abandon:http:prove ; echo EXIT=$?
pnpm uc018:abandon:full-e2e:prove ; echo EXIT=$?
pnpm uc018:graph:prove ; echo EXIT=$?
pnpm uc018:ttl:prove ; echo EXIT=$?
pnpm eval-harness-matrix-cite:prove ; echo EXIT=$?
```

执行体：  
- db：`packages/db/test/uc-e2e-018-user-abandon.proof.ts`  
- HTTP：`apps/api/test/uc-e2e-018-user-abandon-http.proof.ts`  

入口：`package.json` → `uc018:abandon:prove` / `uc018:abandon:http:prove` / `uc018:graph:prove` → `scripts/run-e2e-isolated.mjs …:raw`

**旁证（≠本 UC 验收）**：`pnpm commerce:prove`；`pnpm commerce-reconcile:prove`；`pnpm neg:interview`（abandon 负路径）；`apps/api/test/validate.ts` abandon 段。

---

## 3. 假绿标红

| 若有人说… | 正确读法 |
|-----------|----------|
| 「commerce:prove 绿了所以 018 covered」 | **假绿**。另轨并发 ≠ UC-E2E-018 A1–A3/H* 专用 |
| 「uc018:abandon:prove 绿 = covered」 | **假绿**。最多 **partial**；缺 §1b |
| 「uc018:abandon:http:prove 绿 = covered / full.e2e 已含」 | **假绿**。聚焦 HTTP 口 ≠ full.e2e 场景矩阵；仍缺 TTL/UI/sole-stack（waiting_user+FULL-E2E+GRAPH 已关） |
| 「写了 harness 所以 gap 关闭为 covered」 | **假绿**。partial ≠ covered |
| 「full.e2e abandon TC 绿 = UC-E2E-018 covered」 | **假绿**。仅关 `GAP-UC018-FULL-E2E`；TTL+#5/#6 中 #5/#6 仍开（TTL 已另钉）→ 矩阵 **partial** |
| 「uc018:graph:prove 绿 = UC-E2E-018 covered」 | **假绿**。仅关 `GAP-UC018-GRAPH`；#5 UI / #6 sole-stack 仍开（TTL 已另钉）→ 矩阵 **partial** |
| 「uc018:ttl:prove 绿 = UC-E2E-018 covered」 / 「commerce-reconcile:prove 绿 = TTL/UC covered」 | **假绿**。仅关 `GAP-UC018-TTL`；#5 UI / #6 sole-stack 仍开 → 矩阵 **partial**；commerce-reconcile 旁证 ≠ TTL 专用钉 |
| 「UI Playwright / e2e:ui:isolated 绿 = UC-E2E-018 covered」 / 「HTTP abandon 绿 = UI closed」 | **假绿**。仅关 `GAP-UC018-UI`（later）；#6 sole-stack 仍开 → 矩阵 **partial**；**UI alone ≠ covered**；Ban wash HTTP/full-e2e/graph/ttl into UI closed |

---

## 4. 矩阵锚点

| ID | 状态（有执行体绿后） | 本 harness |
|----|----------------------|------------|
| UC-E2E-018 | **partial**（db A1–A3+A-waiting-user + HTTP H*+H-waiting-user）；**≠ covered** | `harness/uc-e2e-018-user-abandon.md` |
| 评测说明 | `eval/uc-e2e-018-user-abandon.eval.md` | 引用矩阵行 ID |
| P0-8 | 集成+HTTP+**full.e2e abandon**+**graph**+**ttl** prove 已挂（含 waiting_user CAS + `GAP-UC018-FULL-E2E` + `GAP-UC018-GRAPH` + `GAP-UC018-TTL`）；UI / sole-stack 仍缺 | 见矩阵 §3 · harness §1b · 仍 **partial** |

## 5. 审查

- `mw-e2e-ha`：确认未把 partial 写成 covered；确认 `本绿≠全链路 E2E covered`；确认 HTTP prove 打的是真 `@Post(':id/abandon')` 而非 stub route
- 额度账本关键切片可加第二域；本文件钉集成+HTTP 合同 + 命令
- **禁止作者自签 covered**；须双审后才可讨论升阶
