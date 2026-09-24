# E2E / 评测覆盖矩阵初稿（eval first）

**状态**：draft · **releaseEvidence=false** · **≠HA** / **Not HA** · 不宣称 `controlPlaneClosed=true`  
**栈裁定**：sole stack 方向 = **MySQL + Qdrant + Redis**；默认 `E2E_PG_IMAGE=pgvector/pgvector:pg16` **≠** sole-stack 真相。  
**硬规矩**：连通绿（`mysql-stack` skeleton/ping/m2–m5、`mysql-schema:skeleton`、`qdrant-store:skeleton`）**不计入**业务 `covered`。骨架/ping 绿 ≠ 业务 E2E。  
**评测优先**：本矩阵是 meetwise / meetwise-core「评测优先」基线；先钉缺口再扩实现。  
**硬闸**：`north-star-hard-gates.md` G1–G7（**G7=已生效** · 门禁强制 · **≠** 套件已绿）。**仅快乐路径绿 = 假绿**。后续 knife **必须**带 NEG + FAULT + BOUND + ADV + PERF + LOAD 列（§0.5 / §1.0；分面 api/web/worker）。本表 **无** `covered` 发明；盲区列禁止填假绿。**成功唯一标准 = G7 验证关**（刀绿/dual/prove ≠ 成功；`releaseEvidence` 保持 false 直至 G7 全量收据）。
**2026-09-16 MAIN knife**：扩 BOUND+LOAD+分面；新建 case/harness/eval + REQUEST 双审；**未**执行 prove 作绿关。

## 0. 总声明

| 钉 | 裁定 |
|----|------|
| `releaseEvidence` | **false**（本文与一切本地/静态 prove 均不得勾 true） |
| HA | **≠HA** / **非 HA**；云矩阵 `TC-CLOUD-*` 当前多为 `blocked`，不得当发布证据 |
| 连通绿 ≠ E2E | `mysql-stack:*` / skeleton / ping EXIT=0 **仅**文档或栈连通；**永不**写成 UC-E2E / RAG / 隐私 / 队列已覆盖 |
| 真业务 E2E | HTTP：`pnpm e2e:isolated` → `e2e/full.e2e.ts`（fetch/SSE，需 live `MODEL_API_KEY`）；浏览器：`pnpm e2e:ui:isolated` → `apps/web/e2e-ui/` |
| R5 夹具 | 宽 isolated 默认仍绑 pgvector → **BUG-FAKE-R5 / BUG-E2E-ISO**：即使业务断言绿，也只能记 `partial`/`green-risk`，不得写 sole-stack 已迁 |
| marked-red ≠ deleted | `vectorstore:prove` 等保留；见 `harness/r5-pgvector-fixture-mark-red.md` |

### 交叉引用（已存在则并入解读，勿互相抹掉）

| 文件 | 角色 | 与本矩阵关系 |
|------|------|--------------|
| `gap-bug-backlog.md` | P0/P1 缺口与假绿库存 | 本表 `GAP-*` / `BUG-*` 列与其对齐；不重复实现计划 |
| `e2e-case-inventory.md` | R5 假绿家族登记 | §假绿清单继承其家族表；标红须指家族非单点 |
| `harness/e2e-full-suite.inventory.md` | 全量本地 E2E 家族 CMD / EXIT 纪律 | §建议补集命令与家族 A–F 对齐 |
| `testing/cloud-runtime-migration-test-matrix.md` | 云端 TC 矩阵 | 云行一律 `blocked`（缺 ECS executor / TargetGrant / 未授权） |
| `requirements/use-cases/e2e-scenarios.md` | UC-E2E-xxx 需求源 | 本表主行按 UC 展开 |
| `testing/conventions/e2e-directory-contract.md` | helpers/场景/runner 契约 | 静态门 ≠ live E2E |
| `north-star-hard-gates.md` | 交付北星硬闸 G1–G7（G7 已生效=门禁强制 ≠ 套件已绿） | 本表 §0.5 / §1.0 是 G2/G6 盲区列 SSOT；不得把 happy-only 绿写成四列已齐；**全量成功叙事挂 G7 收据** |
| `north-star-ha.md` | 100% HA 目标 / 证据阶梯 | 本表绿 ≠ HA；releaseEvidence=false |
| `testing/e2e-performance-evidence.md` | 性能门回执边界 | PERF 列多数 `not_run`/过期 → **blind**；本地绿 ≠ 生产容量 |

### 覆盖状态词

| 状态 | 含义 |
|------|------|
| `covered` | 有可执行业务用例，且断言落在需求验收（仍须标注 fixture；sole-stack 未迁时慎用） |
| `partial` | 有部分路径/集成 prove，但缺关键验收或夹具非 sole-stack |
| `gap` | 需求已写、本地无对等用例或未接线 |
| `blocked` | 前置不满足（无 Key / 无授权云目标 / 控制面未关 / 夹具未换）——非失败、也非通过 |
| `conn-only` | **仅连通/文档绿**；矩阵中单独标出，**禁止**升格为 covered |
| `blind` | **快乐路径盲区**（§0.5）：该非快乐列既无用例也无执行；happy-only 绿不得掩盖 |
| `honesty-pin` | 静态诚实钉（blocked/缺失/仍拒）；EXIT=0 **仅**钉诚实，**≠** covered |

### 0.5 非快乐路径 + 性能/负载强制列（G2 / G6 · 后续 knife **强制**）

硬闸 G2 + G6。**仅快乐路径绿 = 假绿 / 假阳性**。后续每一个 knife / eval / harness / 本表新行或改行 **必须**填写下列列（不得省略；不得用沉默当已覆盖）。

| 列 | 含义 | 缺列读法 |
|----|------|----------|
| **NEG** | 负路径：拒、错签、越权、过期、错误码、业务拒绝 | `blind` 或 `gap` |
| **FAULT** | 故障/注入：杀进程、断 SSE、依赖 5xx、夹具失败、队列宕 | `blind` 或 `gap` |
| **BOUND** | 边界：0/空/超大、幂等、竞态、时钟、TTL（可并记 NEG/FAULT，**不得省略**） | `blind` 或 `gap` |
| **ADV** | 对抗：注入、越狱、篡改、重放、诱导造假 | `blind` 或 `gap` |
| **PERF** | 可复现性能（分面见下）：命令 + 负载形状 + 期望 + 收据路径 | `blind` / `not_run`（**禁止**用 n/a 偷关容量） |
| **LOAD** | 可复现压力/吞吐（分面 **worker** 为主；队列/检索另注） | `blind` / `not_run` |

**分面列（G6 · api / web / worker — 不得单列 n/a 偷关）**

| 分面列 | 面 | 典型对象 | 假绿禁令 |
|--------|----|----------|----------|
| **PERF_api** | api | HTTP/SSE 延迟、错误率、契约负路径并发 | `e2e:isolated` 终态秒数 ≠ API SLO |
| **PERF_web** | web | Playwright 流式窗口、首屏/交互预算 | 单机 Chromium ≠ 真机容量 |
| **LOAD_worker** | worker | 图/报告/OCR/队列消费吞吐与积压 | 进程内 cap ≠ 集群锁；compose healthy ≠ 产能 |

列值词汇（**本切片 / 本刀不填 `covered`**）：

| 值 | 含义 |
|----|------|
| `blind` | 该列无用例 **且** 无执行（快乐路径盲区） |
| `gap` | 需求已写该面，无可执行对等用例 |
| `partial` | 有部分用例/prove，**≠ covered**（继承 §1 既有诚实状态，非新绿） |
| `case-only` | 本刀已写评测用例 ID（见 `non-happy-path-perf-load-case-matrix.md`），**尚未**双审后 prove |
| `honesty-pin` | 静态钉「仍缺/仍拒/仍 blocked」；本绿 ≠ 已关 |
| `blocked` | 前置不满足，未跑 |
| `not_run` | 历史门/命令存在，无当前可核验收据 |
| `n/a` | **仅** conn-only 行（非 E2E）；n/a **不是**「该列已满足」 |
| `covered` | **禁止本切片/本刀填写** |

§1.1 覆盖状态列仍是业务 covered 词。**六列+分面盲区以 §1.0 为 SSOT**；禁止把 §1.1 的 `partial` 读成 NEG/FAULT/BOUND/ADV/PERF/LOAD 已齐。

用例/harness SSOT（本刀新建，**未执行**）：`delivery/non-happy-path-perf-load-case-matrix.md` · `harness/non-happy-path-perf-load-matrix.md` · `eval/non-happy-path-perf-load-matrix.eval.md`。

---

## 1. 覆盖矩阵（需求/能力 ID → 现有用例/prove → 缺口）

> 备注列明确「是否仅连通」。`fixture=pgvector` 的业务绿一律不得解释为 sole-stack cutover。
> 快乐路径盲区（NEG/FAULT/ADV/PERF）以 **§1.0** 为准；本表覆盖状态列不得被读成四列已齐。

### 1.0 非快乐路径盲区矩阵（NEG / FAULT / BOUND / ADV / PERF / LOAD · 分面）

> **诚实**：下列 `partial` 只继承 §1.1/§1.2 已登记的负路径/失败族/越权 prove，**不是**新发明的 covered。`case-only` = 本刀已登记用例 ID、**尚未**执行。PERF/LOAD 对照 `testing/e2e-performance-evidence.md`：当前全量性能门多为 `not_run` 或过期回执 → **一律 blind/not_run**，禁止填绿。  
> **releaseEvidence=false** · **≠HA** · 全量 E2E 零遗漏 = **目标未齐**。  
> **G7（Local Full-Suite Verification Gate）**：**已生效**（门禁条款强制；2026-09-16 双域 + meetwise 授权改钉）；验证关是成功唯一标准；刀绿/dual/prove ≠ 成功；无 G7 全量 CMD+EXIT 收据 → forbid 宣称 100% HA / 0 BUG / `releaseEvidence=true`。见 `north-star-hard-gates.md` G7 · `harness/local-full-suite-verification.md`（suite `not_run`；禁宣称 suite green）。  
> **本刀未跑** prove / live E2E / 压测 / **全量本地套件** 作绿关；G7 生效 ≠ suite 已跑通。

#### 1.0.1 UC / 能力行 — NEG · FAULT · BOUND · ADV

| 需求/能力ID | NEG | FAULT | BOUND | ADV | 快乐路径盲区读法 |
|-------------|-----|-------|-------|-----|------------------|
| UC-E2E-001 | **blind** / `case-only` | **partial** | **blind** / `case-only` | **blind** / `case-only` | **黄金路径主叙事 = 典型快乐盲区**。FAULT partial 仅因 isolated worker 注入下 report 未必 ready；无独立 NEG/BOUND/ADV 进 full.e2e；无 Key = live blocked；**happy-only 绿=假绿**；≠ covered |
| UC-E2E-002 | **partial** | **partial** / `case-only`（跨副本杀 SSE） | **partial**（lease） | **blind** / `case-only` | lease/双 session GET+LED = BOUND/FAULT partial；ADV=`case-only`（NHP-002-ADV-01）；≠ covered |
| UC-E2E-003 | **gap** | **blind** | **partial**（key parity） | **blind** | 静态管道；无故障/对抗 |
| UC-E2E-004 | **gap** | **gap** | **gap** | **blind** | 整行 gap；A3 失败降级未接线 |
| UC-E2E-010 | **partial** | **partial** | **partial**（LED） | **blind** | 断 SSE/R-mid = FAULT；R-authz = NEG；无跨副本 |
| UC-E2E-011 | **partial** | **partial** | **partial**（幂等误 release） | **gap** / `case-only` | 缺 refund-callback；ADV=`case-only`（NHP-011-ADV-01）；压测仍 blind；≠ covered |
| UC-E2E-012 / 024 | **gap** | **gap** | **gap** | **blind** | 补评闭环未进 HTTP E2E |
| UC-E2E-014 / 026 | **partial** | **partial** | **partial**（入账幂等） | **gap** | 重放/篡改七类未全铺 |
| UC-E2E-015 | **partial** | **partial** | **partial**（0字节/超大） | **blind** | F1–F5 ≠ 负载；扫描件 reason 缺 |
| UC-E2E-016 / 029 | **gap** | **gap** | **partial**（0 题） | **blind** | 有终态无显式失败注入 |
| UC-E2E-017 | **partial** | **partial** | **partial**（sweeper） | **blind** | HTTP/SSE 注入未进 isolated |
| UC-E2E-018 | **partial** | **partial** | **partial**（CAS waiting_user） | **partial** | FULL-E2E+GRAPH+TTL+UI+SOLE(PG-retained) 已关；**#6 alone ≠ covered** · **≠ covered** · matrix stays **partial** · covered-lift assessed **canHonestlyFlip=false**（refuse ADV was **blind** · tip `abfbbc0` · retained）· **NHP-018-ADV-01** **partial**（`pnpm uc018:adv:prove` EXIT=0 · harness `harness/uc-e2e-018-adv.md` · tip `27dd6ae` · `post_prove_dual_pass` · `GAP-UC018-ADV` **CLOSED** · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48`）· **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban claim PERF/LOAD closed · **covered-lift-reassess executed** `harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` · `executed:awaiting_post_prove_dual` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban假关 · Ban claim PERF/LOAD closed · Ban skip to UC-011 |
| UC-E2E-019 | **partial** | **partial** | **partial**（retry 幂等） | **blind** | regenerateAttempt GAP |
| UC-E2E-025 | **gap** | **gap** | **gap** | **blind** | 产品 reject 未接线 |
| UC-E2E-027 | **gap** | **gap** | **gap** | **blind** | 产品未接线 / blocked |
| UC-E2E-028 | **gap** | **gap** | **gap** | **blind** | fail-open 本是 FAULT UC；未接线 |
| UC-E2E-030 | **partial** | **gap** | **partial**（过期） | **blind** | 长会话刷新 E2E 缺 |
| UC-E2E-031 / 032 | **gap** | **blind** | **blind** | **gap**(e2e)/**partial**(eval) | 禁 fake-model 冒充安全闭环 |
| UC-E2E-033 | **partial** | **partial** | **partial**（X10 burst） | **partial** | 七类未齐；W1≠闭环；X10≠容量 SLO |
| UC-E2E-040–043 | **gap** | **gap** | **gap**（席位 CAS） | **blind** | 单岗位闭环；批/CAS/载重缺 |
| UC-E2E-050–052 | **partial** | **gap** | **blind** | **blind** | DELETE=503 honesty-pin ≠ 删除闭环 |
| NEG-AUTH / NEG-* | **partial** | **gap** | **partial** | **blind** | 负路径家族；非全链路 E2E；R5 |
| PRIVACY-HTTP | **honesty-pin** | **gap** | **blind** | **blind** | pin 绿 ≠ 产品删除闭环 |
| GAP-RAG-01…05 | **gap**/**partial** | **gap**/**partial** | **gap** | **partial**(eval green-risk) | R2 **wire 已齐**（P-MODEL…P-START/P-FAKE dual-passed；G-R2-5）；**overall NOT closed**（≠ 路由已生效；P-LIVE dual 收据齐；仍 ≠ 路由已生效 / harness）；R4 NOT closed；≠ covered |
| NHP-UI-PAY-NEG-01（UI 支付拒绝） | **gap** / **out-of-scope** | **blind** | **blind** | **blind** | 显式缺口；≠ 001/011 api 钱路径已覆盖 UI 拒付 |
| NHP-CLOUD-KILL-FAULT-01（云 kill/跨 AZ） | **blocked** | **gap** / **out-of-scope** | **blind** | **blind** | 显式缺口；≠ PERF-CLOUD blocked alone |
| NHP-HA-FAILOVER-RTO-01（多副本 failover/RTO） | **blind** | **gap** / **out-of-scope** | **blind** | **blind** | 显式缺口；≠ LOAD-HA-FAULT stub；≠ 002 跨副本 SSE case-only |
| TC-CLOUD-* | **blocked** | **blocked** | **blocked** | **blocked** | 无授权；禁止冒充 |
| PLATFORM-STATIC / MW-STACK-* | **n/a** | **n/a** | **n/a** | **n/a** | 静态/conn-only；n/a≠已满足 |

#### 1.0.2 分面 PERF / LOAD（api · web · worker）

| 需求/能力ID 或门 | PERF_api | PERF_web | LOAD_worker | 读法 |
|------------------|----------|----------|-------------|------|
| UC-E2E-001（黄金路径） | **blind** / `case-only` | **blind** / `case-only` | **blind** / `case-only` | 终态秒数 ≠ SLO；无分面收据 |
| UC-E2E-002 / 010（SSE/lease） | **blind** | **blind** | **blind** | 跨副本压测未证 |
| UC-E2E-011 / 017 / 019（钱/对账） | **blind** | **n/a**(非 UI 主) | **blind** | 无并发退款/对账负载收据 |
| UC-E2E-015（摄取） | **blind**（413 单点≠负载） | **blind** | **blind** | 超大单点 ≠ ingest LOAD |
| UC-E2E-033（越权） | **gap**（X10≠SLO） | **blind** | **blind** | burst ≠ 容量 |
| UC-E2E-040–043（B 批） | **gap** | **gap** | **gap** | 批载重未接线 |
| `verify:e2e-performance` 族 | **not_run** | **not_run** | **not_run** | 历史回执过期/不可复核；见 e2e-performance-evidence |
| RAG / qbank-pg-eval | **blind**/green-risk | **n/a** | **blind** | 机械绿 ≠ 发布召回 SLO |
| 云 THR-CLOUD-v1 | **blocked** | **blocked** | **blocked** | 无 TargetGrant |
| HA fault-inject stub | **n/a** | **n/a** | **conn-only** | stub ≠ 阶 C/D ≠ HA |

#### 1.0.3 合计读法（本刀 · 2026-09-16 PT）

- **没有任何一行** NEG+FAULT+BOUND+ADV+PERF+LOAD（含分面）全绿。  
- PERF/LOAD 分面 **零 covered**；绝大多数 **blind** / **not_run** / **blocked**。  
- UC-E2E-001 明确标为快乐路径盲区主叙事。  
- `case-only` **≠** 已执行；**≠** covered。  
- 后续 knife 改行时必须同步改本表 + `non-happy-path-perf-load-case-matrix.md`；缺列视为未完成 G2/G6。

### 1.1 UC-E2E（`e2e-scenarios.md`）

| 需求/能力ID | 描述 | 现有命令/用例路径 | 覆盖状态 | 备注（是否仅连通） |
|-------------|------|-------------------|----------|-------------------|
| UC-E2E-001 | 黄金路径：鉴权→简历→交易→面试→报告（+押题/诊断） | `pnpm e2e:isolated` → `e2e/full.e2e.ts`；UI 浅层 `e2e:ui:isolated` → `golden.spec.ts`；**eval harness** `harness/uc-e2e-001-golden-path.eval.md` + `eval/uc-e2e-001-golden-path.eval.md`；**live-blocked honesty** `pnpm uc001:live-blocked:prove` | **partial** / **blocked**(无 Key) | 真 HTTP/SSE 业务 E2E（非连通）。缺 A5 成长档案字段；报告终态在 isolated worker 注入故障下未必 `report_ready`。fixture=pgvector → green-risk / R5；**本绿≠sole-stack migrated**；无 Key 勿硬跑；**live 未覆盖**（`uc001:live-blocked:prove` EXIT=0 仅钉 blocked≠green live）；抬 covered=Key 到位后 `e2e:isolated`/`full.e2e`；eval≠covered；**禁止**宣称 live covered |
| UC-E2E-002 | 跨设备恢复 / lease 竞态 | **NON-UI** `pnpm uc002:lease:prove`（L1–L3）+ `pnpm uc002:http:prove` → `apps/api/test/uc-e2e-002-cross-device-http.proof.ts`（H1–H3 双 session GET + Last-Event-ID）；helpers `sse.ts`/`interview.ts`；UI `stream-window.spec.ts`（降次）；**uc010:sse-resume:prove=旁证≠002 covered**；**eval harness** `harness/uc-e2e-002-cross-device.eval.md` + `eval/uc-e2e-002-cross-device.eval.md` | **partial** | lease+HTTP GET/LED 可跑（无 Key）；**≠ covered**；缺 **HTTP lease mouth** + snapshot 专用口 + full.e2e 双设备；Playwright 双 context 降次未接线；stream-window≠双设备；uc010≠002 covered；本绿≠全链路 E2E；eval≠covered；抬 covered 见 harness §1b |
| UC-E2E-003 | i18n / locale 结构面 | **NON-UI** `pnpm uc003:i18n-locale:prove` → `apps/web/test/uc-e2e-003-i18n-locale.proof.mjs`（S1–S3 + G-GAP）；harness `harness/uc-e2e-003-i18n-locale.md` + `eval/uc-e2e-003-i18n-locale.eval.md`；`public-copy` 旁证 | **partial** | 静态：en/zh key parity + en.json CJK allowlist + i18n plumbing；G-GAP 钉错误码 zh-only map / 硬编码 zh UI / DOM e2e-ui 缺；**≠ covered**；Playwright DOM **降次/未接线**；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-004 | career-path 全链路 | **NON-UI** `pnpm uc004:career-path:prove` → `apps/api/test/uc-e2e-004-career-path.proof.mjs`（S1–S5 + G-GAP mark-red）；harness `harness/uc-e2e-004-career-path.md` + `eval/uc-e2e-004-career-path.eval.md`；`neg:interview` / `scor-00-honesty` / `report:prove` / `validate.ts` / web report GET **旁证≠covered** | **gap** | 静态诚实钉：HTTP POST/GET 存在但是 sync `deriveCareerPath`（非 AiGraphRun）；无 career-path 图文件；无 GrowthTimeline 写；无 e2e TC-004；G-GAP E2E-MAIN/GRAPH/GROWTH/FAIL-A3/UNCERTAINTY；**抬到 covered 还缺**见 harness §1b（e2e HTTP 主路径、图或 ADR 降级、成长落点、A1 曲线维、A3 失败降级、不确定性闸、UI、sole-stack）；**≠ covered**；fixture=pgvector → green-risk/R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-010 | SSE 断线重连 | `e2e/helpers/sse.ts`；`stream-window.spec.ts`；`last-event-id:unit:prove` / `sse-slot:prove`；**NON-UI** `pnpm uc010:sse-resume:prove` → `apps/api/test/uc-e2e-010-sse-resume.proof.ts`（R1–R4 + **R-mid** + R-authz + G-GAP）；harness `harness/uc-e2e-010-sse-resume.md` §1b + `eval/uc-e2e-010-sse-resume.eval.md` | **partial** | HTTP：断 SSE→LED + **R-mid** mid-interview live-tail→LED（无 Key）；**≠ covered**；缺 full.e2e mid-interview + A3 kill/无双扣 + UI + 0058 去 stub + 跨副本（§1b）；unit/slot/stream-window/helpers 为层旁证≠本 UC；fixture=pgvector → green-risk / R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-011 | 报告失败退款 + 计费边界 | `full.e2e.ts` `report_unavailable`+quarantined 兜底；**NON-UI** `pnpm uc011:report-refund:prove`（R1–R4）+ `pnpm uc011:report-refund:http:prove`（H1–H5 HTTP 额度/`GET /commerce/entitlement` + refund/wallet/balance-ui GAP + §1b refund-callback 抬 covered 前置）；harness `harness/uc-e2e-011-report-refund.md` §1b + `eval/uc-e2e-011-report-refund.eval.md`；`commerce:prove` / `neg:commerce` / `report:prove` 旁证 | **partial** | 集成+HTTP：面试失败→released+**HTTP 额度净变0**；报告 quarantine 后 **confirmed 不退**（HTTP 同口径）；误 release→already_confirmed；H4/H5/R4 钉 refund-callback/`GET /wallet`/balance-ui stub **产品缺失** + §1b#1 PREREQ；**≠ covered**；仍缺 refund-callback 产品口、balance-ui、fail HTTP mouth、full.e2e 额度回滚、regenerate(UC-019)、wallet 契约落地；fixture=pgvector → green-risk / R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-012 / 024 | 题级降级 / 补评闭环 | worker `adaptive-*:prove`；无独立 e2e 场景 | **gap**→**partial**(graph) | 模型质量归 ai-eval；状态机补评闭环未进 HTTP E2E |
| UC-E2E-014 / 026 | 支付 webhook 幂等 / 错签 | `full.e2e.ts` HMAC 入账+错签403+未知单404；`neg:commerce`；`commerce:prove` | **partial** | 主路径 covered-ish；重放/篡改七类未全铺 |
| UC-E2E-015 | 简历摄取失败族 | `full.e2e.ts` OCR 成功+duplicate 409（成功面）；`pnpm uc015:ingest-failures:prove` → `apps/api/test/uc-e2e-015-resume-ingest-failures.proof.ts`（F1–F5：加密/0字节/超大413/畸形/415）；harness `harness/uc-e2e-015-resume-ingest-failures.md` + `eval/uc-e2e-015-resume-ingest-failures.eval.md`；`neg:resume` / `ocr:prove` 旁证 | **partial** | HTTP 失败族 F1–F5 可跑（无 Key）；**≠ covered**；扫描件 reason/UI + Resume failed 枚举全铺仍缺；无 Key 时 e2e:isolated **blocked**；fixture=pgvector → **green-risk / R5**；本绿≠全链路 E2E covered；相对 OCR 成功+409 |
| UC-E2E-016 / 029 | 诊断/押题失败与 0 题边界 | `full.e2e.ts` quiz/diagnosis 跑到终态（含 unavailable） | **partial** | 有终态无死胡同；缺显式失败注入矩阵 |
| UC-E2E-017 | 孤儿预占对账 | `pnpm uc017:orphan:prove` → `packages/db/test/uc-e2e-017-orphan-reservation.proof.ts`（O1–O4）；harness `harness/uc-e2e-017-orphan-reservation.md` + `eval/uc-e2e-017-orphan-reservation.eval.md`；commerce/reconcile 另轨旁证 | **partial** | 集成 begin-fail→reserved→released + sweeper + 幂等 + RLS；**本绿≠全链路 E2E covered**；HTTP/SSE 注入未进 `e2e:isolated`；≠covered |
| UC-E2E-018 | 用户放弃面试 | **NON-UI** `pnpm uc018:abandon:prove` + `pnpm uc018:abandon:http:prove` + **`pnpm uc018:abandon:full-e2e:prove`** + **`pnpm uc018:graph:prove`** + **`pnpm uc018:ttl:prove`** + **`pnpm uc018:ui:prove`** + **`pnpm uc018:sole:prove`** + **`pnpm uc018:covered-lift:prove`** + **`pnpm uc018:adv:prove`** + **`pnpm uc018:covered-lift-reassess:prove`**（`GAP-UC018-FULL-E2E`+`GAP-UC018-GRAPH`+`GAP-UC018-TTL`+`GAP-UC018-UI`+`GAP-UC018-SOLE` **CLOSED** · sole=PG-retained · covered-lift **canHonestlyFlip=false** · refuse ADV was **blind** · tip `abfbbc0`；**ADV nailed** `harness/uc-e2e-018-adv.md` · tip `27dd6ae` · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · **ADV alone ≠ covered** · Ban wash ADV into covered · Ban flip §1.1 covered · Ban skip to UC-011；**covered-lift-reassess executed** `harness/uc-e2e-018-covered-lift-reassess.md` · `GAP-UC018-COVERED-LIFT-REASSESS` · `executed:awaiting_post_prove_dual` · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove` · Ban invent covered · Ban假关）；harness `harness/uc-e2e-018-user-abandon.md` §1b + `eval/uc-e2e-018-user-abandon.eval.md`；旁证 `commerce:prove` / `commerce-reconcile:prove`（旁证≠TTL钉）/ `neg:interview` | **partial** | db+HTTP+**full.e2e**+**graph**+**ttl**+**UI abandon**+**sole PG-retained**+covered-lift assessed+**ADV partial**；FULL-E2E+GRAPH+TTL+UI+SOLE 已关；§1.0 ADV **partial**；prior **canHonestlyFlip=false**（refuse ADV was **blind**）· reassess executed · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind**（**ADV alone ≠ covered** · PERF/LOAD still blind · Ban假关）；**≠ covered** · **ADV alone ≠ covered**；**UI alone ≠ covered**；**#6 alone ≠ covered**；Ban假关；Ban wash SOLE/ADV alone into covered；Ban wash MySQL/Qdrant sole-wiring；fixture=pgvector retained production-aligned（`adr-postgres-retained.md`）；本绿≠全链路 E2E；eval≠covered；coveredCount **8** retained |
| UC-E2E-019 | 报告重生成 + 与退款并发 | **NON-UI** `pnpm uc019:report-regenerate:prove`（G1–G4）+ `pnpm uc019:report-regenerate:http:prove`（H1–H4 HTTP `POST …/report/retry` + regenerateAttempt/demand-path GAP）；harness `harness/uc-e2e-019-report-regenerate.md` §1b + `eval/uc-e2e-019-report-regenerate.eval.md`；`uc011:report-refund:prove` / `report:prove` 旁证 | **partial** | 集成+HTTP：failed→requeue/report/retry 幂等；retry∥release 无 released∧regen 非法组合；G3/H3/H4 钉 A3 退款先赢 + quarantine regen 404 + regenerateAttempt/demand-path GAP；**≠ covered**；仍缺 regenerateAttempt 幂等键、A3 confirmed→released 闭环、quarantined regenerate 出口、full.e2e/UI、demand-path ADR；fixture=pgvector → green-risk / R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-025 | 押题产物过期作面试输入 | **NON-UI** `pnpm uc025:stale-quiz-expiry:prove` → `apps/api/test/uc-e2e-025-stale-quiz-expiry.proof.mjs`（S1–S4 + G-GAP mark-red）；harness `harness/uc-e2e-025-stale-quiz-expiry.md` + `eval/uc-e2e-025-stale-quiz-expiry.eval.md`；`quiz:prove` / full.e2e quiz **旁证≠covered** | **gap** | 静态诚实钉：begin 无 quiz 输入、`resume_quiz` 无 expires_at、无 stale/version-mismatch 面试错误码；G-GAP STALE-REJECT/VERSION-PIN/REGEN/ACCEPT；**≠ covered**；产品 reject/accept HTTP 未接线；fixture=pgvector → green-risk/R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-027 | 人工复核申诉 | **NON-UI** `pnpm uc027:manual-review-appeal:prove` → `apps/api/test/uc-e2e-027-manual-review-appeal.proof.mjs`（S1–S5 + G-GAP mark-red）；harness `harness/uc-e2e-027-manual-review-appeal.md` + `eval/uc-e2e-027-manual-review-appeal.eval.md`；qbank ReviewDecision / SelectiveReview / resume needs_review / web「人工复核还没开放」**旁证≠covered** | **gap** / **blocked** | 静态诚实钉：无 ManualReview HTTP/表/模块；无 e2e TC-027；G-GAP APPEAL-OPEN/OVERTURN-CAS/IDEMPOTENT/LEASE-EFFECT0/D3-STATUS/E2E；**抬到 covered 还缺**见 harness §1b；产品未接线；**≠ covered**；**≠** 假 partial-closed；fixture=pgvector → green-risk/R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-028 | trace/账本失败不阻塞 | **NON-UI** `pnpm uc028:trace-fail-open:prove` → `apps/api/test/uc-e2e-028-trace-ledger-fail-open.proof.mjs`（S1–S5 + G-GAP mark-red）；harness `harness/uc-e2e-028-trace-ledger-fail-open.md` + `eval/uc-e2e-028-trace-ledger-fail-open.eval.md`；report-bulkhead / reqid / admission best-effort **旁证≠covered** | **gap** | 静态诚实钉：persistTrace 与 settle 同事务（非 fail-open）、无 rewrite/recon、无 e2e 注入；G-GAP FAIL-OPEN/RECON/TRUTH-BLOCK-E2E/INJECT；**≠ covered**；fixture=pgvector → green-risk/R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-030 | 时钟漂移 / token 刷新 | `neg:auth` 有令牌过期/吊销负例 | **partial** | 负路径有；长会话刷新 E2E 缺 |
| UC-E2E-031 / 032 | 注入越狱 / 诱导造假 | **NON-UI** `pnpm uc031-032:injection-jailbreak:prove` → `apps/api/test/uc-e2e-031-032-injection-jailbreak.proof.mjs`（S1–S6 + G-GAP mark-red）；harness `harness/uc-e2e-031-032-injection-jailbreak.md` + `eval/uc-e2e-031-032-injection-jailbreak.eval.md`；`golden-tasks/` / `scoring:eval` / TC-AIIV-002 / TC-RES-012 / TC-quiz-078 / safety-defense-in-depth / `E2E_FAKE_MODEL` forbid **旁证≠covered** | **gap**(e2e) / **partial**(eval) | 静态诚实钉：e2e 禁假模型冒充安全闭环；质量断言归 **ai-eval**；G-GAP E2E-STRUCTURE/AI-EVAL/FABRICATE-REJECT/FAKE-MODEL-BAN/GUARDRAIL；**抬到 covered 还缺**见 harness §1b（**ai-eval suite + gates**，非 e2e）；**≠ covered**；fixture=pgvector → green-risk/R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-033 | 越权（C 跨用户 / B-C） | **NON-UI** `pnpm uc033:cross-user-authz:prove` → `apps/api/test/uc-e2e-033-cross-user-authz.proof.ts`（X1–X8 + **W1**/X9–X11 + G-GAP）；harness `harness/uc-e2e-033-cross-user-authz.md` **§1b** + `eval/uc-e2e-033-cross-user-authz.eval.md`；`full.e2e.ts` B RLS + `neg:auth`/`neg:bend`/`neg:interview`/`neg:commerce` **旁证≠covered** | **partial** | X1–X8 + W1 worker-principal honesty（job RLS+source pin）+ X9 更多 authz 类 + X10 burst + X11 404 不泄露；**系统化七类未齐**；A3 **live** worker GAP（W1≠闭环）；**≠ covered**；fixture=pgvector → green-risk/R5；本绿≠全链路 E2E；eval≠covered；§1b 抬 covered 非空 |
| UC-E2E-040–043 | B 端批匹配/题库/席位 | `full.e2e.ts` 岗位幂等+投递+绑定面试；UI `recruiting-bound.spec.ts`（**旁证≠covered**）；**NON-UI** `pnpm uc040-043:batch-qbank-seat:prove` → `apps/api/test/uc-e2e-040-043-batch-qbank-seat.proof.mjs`（S1–S5 + G-GAP mark-red）；harness `harness/uc-e2e-040-043-batch-qbank-seat.md` + `eval/uc-e2e-040-043-batch-qbank-seat.eval.md` | **partial** | 单岗位绑定闭环有；批任务/题库导入/席位 CAS **gap**（honest pin：GAP-UC040-BATCH-PARTIAL / UC041-IMPORT / UC042-DUAL-SIGN / UC043-SEAT-CAS / D4-STATUS / E2E）；**≠ covered**；fixture=pgvector → green-risk/R5；本绿≠全链路 E2E；eval≠covered |
| UC-E2E-050–052 | kill-switch / 无 PII / 删除导出 | `privacy-erasure:http:prove`（DELETE=503 pin）；`security:prove`；harness `harness/privacy-erasure-http-503-pin.md` + `eval/privacy-erasure-http-503-pin.eval.md` | **partial** / **blocked** | DELETE 必须 503（GAP-PRIV-02）；**本绿≠产品删除闭环**；导出/完整擦除未放行；非 covered |

### 1.2 负路径 / 集成 prove（非宽 E2E，但服务 UC）

| 需求/能力ID | 描述 | 现有命令/用例路径 | 覆盖状态 | 备注 |
|-------------|------|-------------------|----------|------|
| NEG-AUTH | 认证/令牌/改密负路径 | `pnpm neg:auth` → `apps/api/test/neg-auth.proof.ts`（经 isolated） | **partial** | 真负路径；fixture=pgvector |
| NEG-COMMERCE | 交易负路径 | `pnpm neg:commerce` | **partial** | |
| NEG-RESUME / INTERVIEW / BEND / INPUT | 简历/面试/B端/输入负路径 | `pnpm neg:resume` 等；`neg:all` | **partial** | |
| COMMERCE / RESUME / INTERVIEW | 域集成 prove | `commerce:prove` `resume:prove` `interview:prove` … | **partial** | 经 `run-e2e-isolated` → R5 家族 |
| PRIVACY-HTTP | 公开擦除 503 pin | `privacy-erasure:http:prove`；`harness/privacy-erasure-http-503-pin.md`；`eval/privacy-erasure-http-503-pin.eval.md` | **partial** | 业务验收 pin；**本绿≠产品删除闭环**；DELETE=503；BUG-PRIV-503；非 covered |
| SCOR-00 | 伪评分止血 | `scor-00:http:prove` `scor-00-honesty:prove` | **partial** | ≠ SCOR-01…08；BUG-SCORE-LEGACY |
| PLATFORM-STATIC | 目录契约/信任守卫 | `e2e-platform:check|prove|layout:prove`；`e2e-parity:check|prove`；`e2e-static-guards` | **covered**(静态) | **不是** live E2E；parity floors 37/342 |

### 1.3 Sole-stack / harness（连通与标红 — 不计入业务 covered）

| 需求/能力ID | 描述 | 现有命令/用例路径 | 覆盖状态 | 备注 |
|-------------|------|-------------------|----------|------|
| MW-STACK-PING | MySQL/Redis/Qdrant 本地连通 | `pnpm mysql-stack:ping:prove` | **conn-only** | **仅连通**；BUG-FAKE-CONN |
| MW-SCHEMA-SKEL | MySQL 骨架 migrate | `pnpm mysql-schema:skeleton:prove` | **conn-only** | EXIT=0 ≠ 授权根已迁；INFLIGHT:mysql-schema-prove |
| MW-STACK-M2..M5 | tenant/queue/rag/fixtures 文档骨架 | `mysql-stack:m2-tenant|m3-queue|m4-rag|m5-fixtures:prove` | **conn-only** | 静态/文档绿 |
| MW-R5-MARKRED | pgvector 夹具标红钉 | `pnpm mysql-stack:r5-mark-red:prove` | **conn-only**(静态钉) | 本绿≠夹具退役；≠ RAG 已迁 |
| QDRANT-SKEL | Qdrant upsert/search/recall=0 雏形 | `pnpm qdrant-store:skeleton:prove` | **partial**(原型) | 非生产向量真相；GAP-PRIV-04 |
| TENANT-PROTO | 应用层 tenant fail-closed | `pnpm --filter @meetwise/db tenant-enforcement:prove` | **partial** | ≠ RLS；BUG-PRIV-TENANT / GAP-PRIV-01 |
| REDIS-WAKEUP | Streams wakeup 旁路 | `pnpm worker-wakeup-redis:prove` | **partial** | flag 默认关；≠ 生产切流；GAP-MOP-01 |
| R1-TECH-ROLE | Worker 技术岗 fail-closed 合同 | `pnpm r1-tech-role-fail-closed:prove` | **partial** | prove 绿 ≠ R1 已关；见 harness/r1 |

### 1.4 RAG / 向量 / 评测（R5 假绿面）

| 需求/能力ID | 描述 | 现有命令/用例路径 | 覆盖状态 | 备注 |
|-------------|------|-------------------|----------|------|
| GAP-RAG-01 / R1 | 去静默「技术岗」+ fail-closed 合同 | `r1-tech-role-fail-closed:prove` | **partial** | 默认 flag-off 仍 legacy |
| GAP-RAG-02 / R2 | route snapshot 生产接线 | `r2-p-live-route-effective:prove` + `r2-p-fake-route-classify:prove` + prereq 等；`rag03-route:prove`（PG 夹具旁证） | **partial**(wire) / **gap**(overall closed) | **wire 已齐**（P-MODEL…P-START/P-FAKE dual-passed；G-R2-5；API=0 / Worker sole）；**overall NOT closed**（≠ 路由已生效；P-LIVE dual 收据齐；仍 ≠ 路由已生效）；≠ covered |
| GAP-RAG-03 / R3 | 过滤落点 / 禁 FULLTEXT 冒充 | hybrid/qbank prove（PG） | **gap** | BUG-RAG-FULLTEXT |
| GAP-RAG-04 / R4 | 题域隔离 wrong_track=0 | partial P-WIRE + G-R2-5；dispatch/recheck 未接线；FOLLOW REQUEST await dual | **gap** / **blocked** | NOT closed；≠ 题域已隔离；`REQUEST-2026-09-16-g4-dispatch-recheck-FOLLOW-*` |
| GAP-RAG-05 / R5 夹具 | pgvector fixtures 退役 | `mysql-stack:m5-fixtures:prove`；`r5-mark-red:prove`；`vectorstore:prove` | **partial**(计划+标红) | 夹具未换；BUG-FAKE-R5 |
| PRD-TEST-003/004 | 检索评测诚实 | `rag:adversarial:pg-eval`；`qbank-retrieval-eval-pg` | **partial** / **green-risk** | BUG-FAKE-QBANK-EVAL；≠ 发布召回 SLO |

### 1.5 云端矩阵（摘录）

| 需求/能力ID | 描述 | 现有命令/用例路径 | 覆盖状态 | 备注 |
|-------------|------|-------------------|----------|------|
| TC-CLOUD-TEST-001..003 | 串行 RDS 测试执行器 / 套件替换 / vectorstore 云面 | `cloud-test-serial:prove` 等（历史 test_only） | **blocked** | releaseEvidence=false；非完整 E2E runner |
| TC-CLOUD-01..04 | 云唯一依赖 / 迁移 / Tair / OSS | 契约 `pnpm cloud:verify --case …`（未实现为发布门） | **blocked** | 缺 ECS executor / TargetGrant / 未授权；**禁止**无授权硬跑破坏性云测 |
| GAP-PROD-02 / P0-CB | C↔B 浏览器矩阵 | `recruiting-bound.spec.ts`；`golden.spec.ts` | **partial** | 单链路有；三主体矩阵进 CI 仍缺 |

---

## 2. 假绿风险清单

| ID | 风险 | 为何假绿 | 正确读法 / 锚点 |
|----|------|----------|-----------------|
| BUG-FAKE-CONN | skeleton/ping/m2–m5 EXIT=0 | 文档/连通被写成队列/RAG/隐私已迁 | **conn-only**；`e2e-full-suite.inventory.md` §F |
| BUG-FAKE-R5 | `vectorstore:prove` / 宽 `e2e:isolated` / rag·memory·qbank | 默认 `E2E_PG_IMAGE=pgvector` | 绿=legacy 夹具机械正确；≠ RAG 已迁；`e2e-case-inventory.md` 家族表 |
| BUG-E2E-ISO | 宽 isolated + performance 同绑 pgvector | 业务 E2E 与向量夹具耦合 | 关系面 MySQL、向量面 Qdrant 拆夹具前只能 `partial`/`green-risk` |
| BUG-FAKE-QBANK-EVAL | `*-pg-eval` / `qbank-retrieval-eval-pg` | 易被读成生产检索质量 | 管道机械绿 ≠ 发布召回 SLO |
| BUG-PRIV-503 | 「删除已闭环」叙事 | 公开 DELETE 必须 503 | pin prove 绿 = 仍拒绝开放 |
| BUG-PRIV-TENANT | tenant helpers 替代 RLS | 授权根静默降级 | tenant≠RLS；审查 conditional |
| R1 prove 绿 | 「R1 已关 / 通用出题就绪」 | 默认 flag-off + 无 R2 | harness/r1 假绿表 |
| e2e-platform / parity 绿 | 「live E2E 已过」 | 仅静态目录/身份 floors | releaseEvidence=false；不执行 isolated |
| /livez 或 compose healthy | 「端到端已通」 | 端口/容器存活 | **连通 ≠ 业务 E2E** |
| 云 test_only 回执 | 「发布矩阵 passed」 | 历史 HMAC/FC 无 fence | 云 TC 保持 blocked |

---

## 3. 建议优先补的本地用例集（有序 · 命令级）

> 原则：eval first；先可执行缺口；不把连通 prove 塞进「业务 covered」。无 `MODEL_API_KEY` 时 **不要**硬跑 `e2e:isolated` 全量（记 blocked）。UC-E2E-001：`uc001:live-blocked:prove` EXIT=0 **仅**诚实钉 blocked，**永不**当 live covered。 G6 族：`g6-e2e-iso-blocked:prove` EXIT=0 **仅**钉 family blocked，**永不**当 G6/BUG-E2E-ISO 关。

| 优先级 | 目标缺口 | 建议动作（命令级） | 期望产物 |
|--------|----------|-------------------|----------|
| P0-1 | 假绿守门可复现 | `pnpm mysql-stack:r5-mark-red:prove`；`pnpm e2e-case-inventory:prove`（若已接线）；确认 banner/NOTE | EXIT=0 仅=标红钉 |
| P0-2 | 静态 E2E 契约不漂 | `pnpm e2e-parity:check`；`pnpm e2e-platform:check`；`pnpm e2e-platform:prove`；`node scripts/e2e-static-guards.mjs` | 身份 floors / 目录契约 |
| P0-3 | UC-E2E-001 真链路（有 Key 时） | `pnpm e2e:isolated`；有 UI 则 `pnpm e2e:ui:isolated`；eval 见 `harness/uc-e2e-001-golden-path.eval.md`；静态 `pnpm eval-uc-e2e-001-002-cite:prove`；无 Key 诚实钉 `pnpm uc001:live-blocked:prove`（EXIT=0=blocked 文档≠live 绿） | 业务 EXIT 分家族记；fixture=pgvector → green-risk；无 Key=blocked；**勿宣称 live covered**；本绿≠sole-stack migrated；抬 covered=Key→`e2e:isolated`/`full.e2e` |
| P0-4 | 隐私 pin / 评分止血 | `pnpm privacy-erasure:http:prove`（见 `harness/privacy-erasure-http-503-pin.md`）；`pnpm scor-00:http:prove`；静态 `pnpm eval-harness-matrix-cite:prove` | DELETE=503（本绿≠闭环）；伪评分 410；cite prove≠业务 covered |
| P0-5 | UC-E2E-017 孤儿预占 | **集成 prove 已挂** `pnpm uc017:orphan:prove` + `harness/uc-e2e-017-orphan-reservation.md`（O1–O4）；仍缺 HTTP begin-fail / SSE 注入进 `e2e:isolated` | 矩阵 **partial**；本绿≠全链路 E2E covered；≠covered |
| P0-6 | UC-E2E-015 摄取失败族 | **失败族 prove 已挂** `pnpm uc015:ingest-failures:prove` + harness（F1–F5：加密/0字节/超大/畸形/MIME）；仍缺 e2e:isolated 全 HTTP 家族（OCR+409 需 Key；扫描件 reason/UI） | 矩阵保持 **partial**；**禁止**升 covered；本绿≠全链路；R5 green-risk |
| P0-7 | UC-E2E-002 跨设备 | **NON-UI 优先** `pnpm uc002:lease:prove`（L1–L3）+ `pnpm uc002:http:prove`（H1–H3 GET+LED）；HTTP **lease mouth** 仍缺；Playwright 双 context **降次**；`uc010:sse-resume:prove`=旁证≠002 covered；eval 见 `harness/uc-e2e-002-cross-device.eval.md` §1b 抬 covered | 矩阵 **partial**；禁止升 covered；stream-window≠双设备；uc010≠002；eval≠covered |
| P0-8 | UC-E2E-018 用户放弃 | **集成+HTTP+full.e2e+graph+ttl+UI+sole PG-retained+covered-lift+ADV prove 已挂** `pnpm uc018:abandon:prove` + `pnpm uc018:abandon:http:prove` + `pnpm uc018:abandon:full-e2e:prove` + `pnpm uc018:graph:prove` + `pnpm uc018:ttl:prove` + `pnpm uc018:ui:prove` + `pnpm uc018:sole:prove` + `pnpm uc018:covered-lift:prove` + `pnpm uc018:adv:prove` + `pnpm uc018:covered-lift-reassess:prove` + harness §1b（FULL-E2E+GRAPH+TTL+UI+`GAP-UC018-SOLE` **CLOSED** under PG-retained；covered-lift **canHonestlyFlip=false** · refuse ADV was **blind** · tip `abfbbc0`；**ADV** tip `27dd6ae` · `GAP-UC018-ADV` **CLOSED** · **NHP-018-ADV-01** **partial** · `post_prove_dual_pass` · prove tip `bdc5993` · post-prove dual `5690779`/`9300d48` · **ADV alone ≠ covered**；**covered-lift-reassess executed** · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind** · `pnpm uc018:covered-lift-reassess:prove`）；**UI alone ≠ covered**；**#6 alone ≠ covered**；Ban假关 | 矩阵 **partial**；§1.0 ADV **partial**；本绿≠全链路 E2E covered；≠covered；Ban wash SOLE/ADV alone into covered；Ban wash MySQL/Qdrant sole-wiring；coveredCount **8** retained |
| P1-1 | UC-E2E-010 断线重连业务 | **HTTP prove 已挂** `pnpm uc010:sse-resume:prove` + harness §1b（R1–R4 + **R-mid** live-tail→LED；R-authz；G-GAP）；仍缺 full.e2e mid-interview + A3 kill/无双扣 + UI + 0058 + 跨副本；unit/slot/stream-window 降层 cite | 矩阵保持 **partial**；**禁止**升 covered；本绿≠全链路 E2E covered；R-mid≠full.e2e |
| P1-2 | UC-E2E-011 退款边界 | **集成+HTTP 额度 prove 已挂** `pnpm uc011:report-refund:prove` + `pnpm uc011:report-refund:http:prove` + harness §1b（R1/H1 fail→released+HTTP 额度；R2/H2 quarantine 不退；R3/H3 误退拒；R4/H4/H5 refund-callback/wallet/balance-ui GAP + §1b 抬 covered 前置）；仍缺支付回调产品口 / balance-ui / fail HTTP mouth / full.e2e / regenerate | 矩阵保持 **partial**；**禁止**升 covered；本绿≠全链路 E2E covered；见 harness §1b |
| P1-5 | UC-E2E-019 报告重生成×退款并发 | **集成+HTTP prove 已挂** `pnpm uc019:report-regenerate:prove` + `pnpm uc019:report-regenerate:http:prove` + harness §1b（G1/H1 retry 幂等；G2/H2 retry∥release 无非法组合；G3/H3/H4 A3+quarantine+regenerateAttempt/demand-path GAP）；仍缺 regenerateAttempt / A3 退款先赢闭环 / quarantine regen 出口 / full.e2e | 矩阵 **partial**；**禁止**升 covered；本绿≠全链路 E2E covered；见 harness §1b |
| P1-6 | UC-E2E-003 i18n/locale 结构面 | **静态 prove 已挂** `pnpm uc003:i18n-locale:prove` + harness（S1–S3 管道/键对齐/en CJK allowlist；G-GAP 错误码 en map + 硬编码 zh UI + DOM e2e-ui 缺席）；仍缺 Playwright locale=en DOM + 错误码 en 产品映射 | 矩阵 **partial**；**禁止**升 covered；本绿≠全链路 E2E covered；Playwright secondary |
| P1-7 | UC-E2E-033 越权 C-cross / B-C | **HTTP/DB prove 已挂** `pnpm uc033:cross-user-authz:prove` + harness **§1b**（X1–X8 + **W1**/X9–X11；G-GAP 七类未齐/A3 live worker）；`neg:*`/`full.e2e` RLS=旁证≠covered；仍缺 live worker/checkpointer / cache-trace 全路径 / 七类高并发竞态 / full.e2e 独立场景（W1/X10/X11≠闭环） | 矩阵保持 **partial**；**禁止**升 covered；本绿≠全链路 E2E covered；系统化七类未齐；见 harness §1b |
| P1-8 | UC-E2E-025 押题产物过期作面试输入 | **静态 GAP mark-red 已挂** `pnpm uc025:stale-quiz-expiry:prove` + harness（S1–S4；G-GAP STALE-REJECT/VERSION-PIN/REGEN/ACCEPT）；`quiz:prove`/full.e2e quiz=旁证≠covered；仍缺 HTTP 过期拒绝 + resumeVersion pin + 重押题入口 | 矩阵保持 **gap**（honest）；**禁止**升 covered / 假 partial-closed；本绿≠全链路 E2E covered |
| P1-9 | UC-E2E-004 career-path 全链路 | **静态 GAP mark-red 已挂** `pnpm uc004:career-path:prove` + harness（S1–S5；G-GAP E2E-MAIN/GRAPH/GROWTH/FAIL-A3/UNCERTAINTY；§1b 抬 covered 还缺）；`report:prove`/`neg:interview`/domain derive=旁证≠covered；仍缺 e2e HTTP 主路径 + AiGraphRun/ADR + GrowthTimeline + A3 | 矩阵保持 **gap**（honest）；**禁止**升 covered / 假 partial-closed；本绿≠全链路 E2E covered |
| P1-10 | UC-E2E-028 trace/账本失败不阻塞 | **静态 GAP mark-red 已挂** `pnpm uc028:trace-fail-open:prove` + harness（S1–S5；G-GAP FAIL-OPEN/RECON/TRUTH-BLOCK-E2E/INJECT；§1b 抬 covered 还缺）；report-bulkhead/admission best-effort/usage reconciler=旁证≠covered；仍缺 persistTrace 旁路隔离 + 故障注入 + recon 补写 + A3 对照 E2E | 矩阵保持 **gap**（honest）；**禁止**升 covered / 假 partial-closed；本绿≠全链路 E2E covered |
| P1-11 | UC-E2E-027 人工复核申诉 | **静态 GAP/blocked mark-red 已挂** `pnpm uc027:manual-review-appeal:prove` + harness（S1–S5；G-GAP APPEAL-OPEN/OVERTURN-CAS/IDEMPOTENT/LEASE-EFFECT0/D3-STATUS/E2E；§1b 抬 covered 还缺）；qbank ReviewDecision / SelectiveReview / needs_review=旁证≠covered；仍缺 D3 schema + 申诉 HTTP + overturn CAS + lease + e2e | 矩阵保持 **gap** / **blocked**（honest；产品未接线）；**禁止**升 covered / 假 partial-closed；本绿≠全链路 E2E covered |
| P1-12 | UC-E2E-031/032 注入越狱/诱导造假 | **静态 honesty 已挂** `pnpm uc031-032:injection-jailbreak:prove` + harness（S1–S6；G-GAP E2E-STRUCTURE/AI-EVAL×2/FABRICATE-REJECT/FAKE-MODEL-BAN/GUARDRAIL；§1b 抬 covered=**ai-eval suite + gates**）；golden-tasks/scoring:eval/TC-*-jailbreak=旁证≠covered；仍缺真模型 ai-eval 门 + 结构 e2e escape/biz-reject + GuardrailHit | 矩阵保持 **gap**(e2e) / **partial**(eval)（honest）；**禁止**升 covered / e2e fake-model 冒充；本绿≠全链路 E2E covered |
| P1-3 | B 端 040–043 | **静态 GAP mark-red 已挂** `pnpm uc040-043:batch-qbank-seat:prove` + harness（S1–S5；G-GAP BATCH/IMPORT/DUAL-SIGN/SEAT-CAS/D4/E2E；§1b 抬 covered 还缺）；`full.e2e`/`recruiting-bound`=旁证≠covered；仍缺 D4 载重 + BatchJob partial_failed + 题库导入 + 席位 CAS HTTP | 矩阵保持 **partial** + 批缺口 gap（honest）；**禁止**升 covered / 假 partial-closed；本绿≠全链路 E2E covered |
| P1-4 | R5 夹具拆分 | 跟 `m5-…`：关系 prove→MySQL；向量 prove→Qdrant 或 mark-red | 降 BUG-E2E-ISO |
| P2 | 云 TC | **仅**在有 TargetGrant + 项目授权后按 `cloud-runtime-migration-test-matrix.md`；本环境无授权 → 保持 blocked | 禁止冒充 |

**明确不做（本基线）**：把 `mysql-stack:ping|skeleton|m*:prove` 写入「业务 covered」；无 Key 时 skip-as-pass；无授权破坏性云测。

---

## 4. 只读探测记录（本执行器）

> 时间：2026-09-10 约 00:10–00:25 PT。未读 `.env*`。未改业务源码。未跑破坏性云测。

| 探测 | 命令 | EXIT | 结论 |
|------|------|------|------|
| 仓库路径 | `ls /workspace/meetwise` → symlink `projects/meetwise` | 0 | OK |
| MODEL_API_KEY | 环境变量名探测（不读文件） | — | **unset** → `e2e:isolated` **blocked**（`run-e2e.mjs`：`live_provider_key_missing`） |
| Docker sole-stack 本地 | `docker ps` | 0 | `meetwise-mysql-local` / `qdrant` / `redis-mysql-local` **healthy**（**仅连通**，≠ E2E） |
| e2e-parity | `node scripts/e2e-parity-check.mjs` | **0** | valid；testCount=37 assertionCount=342；`releaseEvidence=false` |
| Playwright list | `npx playwright test e2e-ui --list`（apps/web） | **0** | 22 tests / 6 files（chromium+mobile） |
| R5 mark-red | `node scripts/mysql-stack.r5-mark-red.proof.mjs` | **0** | 静态标红钉；NOTE：本绿≠已迁 |
| e2e-static-guards | `node scripts/e2e-static-guards.mjs` | **0** | 静态守卫通过（非 live E2E） |
| e2e:isolated 全量 | （未跑） | **blocked** | 原因：无 `MODEL_API_KEY`；且默认 fixture=pgvector（R5） |
| G6 e2e:isolated family blocked honesty | `pnpm g6-e2e-iso-blocked:prove` | **0**（本切片） | EXIT=0=钉 LIVE HTTP/UI **blocked**(无 Key)+fail-closed；**≠** family 绿；**≠** G6/BUG-E2E-ISO 关；有 Key 硬跑 Path 见 `harness/g6-e2e-iso-blocked.md`；releaseEvidence=false · Not HA |
| 云破坏性 TC | （未跑） | **blocked** | 无 TargetGrant / 无项目授权；矩阵本身均为 blocked |
| 隐私 HTTP 503 pin | `pnpm privacy-erasure:http:prove` | **0** | pass_count=19；**本绿≠产品删除闭环**；fixture=pgvector green-risk；见 harness/privacy-erasure-http-503-pin.md |
| eval harness cite | `pnpm eval-harness-matrix-cite:prove` | **0** | 静态：harness+eval 引用 UC-E2E-050 / PRIVACY-HTTP / UC-E2E-017 / UC-E2E-018（harness 非 stub）等；≠业务 covered |

| UC-E2E-001/002 eval cite | `pnpm eval-uc-e2e-001-002-cite:prove` | **0**（本切片） | 静态：harness+eval 钉 Key/fixture/green-risk/blocked/gap；**≠** live E2E；≠covered |
| UC-E2E-015 ingest-failures | `pnpm uc015:ingest-failures:prove` | **0**（2026-09-10 ~00:34 PT；12 PASS；R5） | F1–F5 HTTP；**partial**；≠covered；无 Key；R5 green-risk；相对 OCR 成功+409 |
| UC-E2E-001 live | `pnpm e2e:isolated` | **blocked** | 无 `MODEL_API_KEY`；文档见 `harness/uc-e2e-001-golden-path.eval.md` §1a；**未跑**；未发明假绿；**≠ live covered** |
| UC-E2E-001 live-blocked honesty | `pnpm uc001:live-blocked:prove` | **0**（本切片） | EXIT=0=钉 **blocked**(无 Key)+`run-e2e.mjs` fail-closed；**≠** green live；**≠** covered；抬 covered=Key 到位后 `e2e:isolated`/`full.e2e`；releaseEvidence=false |
| UC-E2E-018 abandon | `pnpm uc018:abandon:prove` + `pnpm uc018:abandon:http:prove` + `pnpm uc018:abandon:full-e2e:prove` + `pnpm uc018:graph:prove` + `pnpm uc018:ttl:prove` + `pnpm uc018:ui:prove` + `pnpm uc018:sole:prove` + `pnpm uc018:covered-lift:prove` + `pnpm uc018:adv:prove` + `pnpm uc018:covered-lift-reassess:prove` | **0**×10（db+HTTP+full-e2e+graph+ttl+UI+sole+covered-lift+ADV+reassess；R5） | db+HTTP+waiting_user+**FULL-E2E**+**GRAPH**+**TTL**+**UI**+**SOLE**+covered-lift assessed+**ADV partial**；**partial**；prior **canHonestlyFlip=false** · reassess executed · **canHonestlyFlip=false** · refuse：**PERF/LOAD blind**（**ADV alone ≠ covered** · PERF/LOAD still blind · Ban假关）；**UI alone ≠ covered** · **ADV alone ≠ covered**；**#6 alone ≠ covered**；≠covered；Ban假关；R5 |
| UC-E2E-010 sse-resume | `pnpm uc010:sse-resume:prove` | **0**（2026-09-10 ~02:39 PT；13 PASS；R-mid；R5） | R1–R4+**R-mid** HTTP LED；**partial**；≠covered；无 Key；R5；缺 full.e2e/A3/UI/0058/跨副本（§1b） |

| UC-E2E-027 manual-review-appeal | `pnpm uc027:manual-review-appeal:prove` | **0**（2026-09-10 ~02:12 PT；S1–S5+G-GAP 6 pins；R5） | S1–S5 + G-GAP 诚实钉；**gap**/blocked；≠covered；无 Key；R5 green-risk；无 fake API；qbank/Selective/needs_review=旁证≠covered |
| UC-E2E-040–043 batch-qbank-seat | `pnpm uc040-043:batch-qbank-seat:prove` | **0**（2026-09-10 ~02:08 PT；S1–S5+G-GAP 6 pins；R5） | S1–S5 + G-GAP 诚实钉；**partial**+批缺口 gap；≠covered；无 Key；R5 green-risk；full.e2e binding=旁证≠covered |
| UC-E2E-031/032 injection-jailbreak | `pnpm uc031-032:injection-jailbreak:prove` | **0**（2026-09-10 ~02:17 PT；S1–S6+G-GAP 6 pins；R5） | S1–S6 + G-GAP 诚实钉；**gap**(e2e)/**partial**(eval)；≠covered；无 Key；R5 green-risk；无 fake jailbreak pass；golden-tasks/ai-eval=旁证≠covered |

Playwright `--list` 用例名摘要：`golden`×2、`online-public`×2、`recruiting-bound`×1、`screenshots`×2、`stream-window`×1、`voice-duplex`×3（各项目 ×2）。

---

## 5. 真 E2E vs 仅栈连通（一句话收口）

| 类别 | 代表 | 可否当业务 covered |
|------|------|-------------------|
| **真业务 E2E** | `e2e:isolated`（`full.e2e.ts`）、`e2e:ui:isolated`、关键 `neg:*` HTTP 负路径 | 可以记 partial/covered，但须标 fixture；无 Key=blocked |
| **域集成 prove** | `interview:prove` `commerce:prove` `privacy-*:prove` `scor-00:*` | partial；多数经 isolated→R5 green-risk |
| **静态评测门** | parity / e2e-platform / r5-mark-red / case-inventory prove | 守门 only；**不是** E2E |
| **仅连通/骨架** | `mysql-stack:ping|skeleton|m2–m5`、`mysql-schema:skeleton`、compose healthy、`/livez` | **否**（conn-only） |

---

## 6. 维护纪律

1. 新增 UC 或 prove：先改**本矩阵**（含 **§1.0 四列**）与（若属 R5 家族）`e2e-case-inventory.md`，再扩实现（硬闸 G3：禁先写绿再回填需求）。  
2. 连通类脚本 EXIT=0 **禁止**回写本表为 `covered`。  
3. 与 `gap-bug-backlog.md` 冲突时：以 backlog 的 P0 假绿/冻结项为准，本表状态降为 `partial`/`blocked`/`conn-only`。  
4. `e2e-case-inventory.md` / `harness/e2e-full-suite.inventory.md` 已存在内容：**整合引用，不覆盖抹掉**。  
5. 更新后保持文首：`releaseEvidence=false` · **≠HA** / Not HA · 连通绿≠E2E。  
6. **后续 knife 强制列**：新行/改行/新 eval 笔记必须带 **NEG + FAULT + BOUND + ADV + PERF + LOAD**（分面 PERF_api / PERF_web / LOAD_worker）；缺列 = 快乐路径盲区未关，不得把该行从 §1.0 摘掉。PERF/LOAD 无新收据则保持 `blind`/`not_run`。  
7. **禁止**把 `partial` / `gap` / `blind` / `honesty-pin` / `conn-only` 改写成 `covered`（硬闸 G5）。本切片未发明任何 covered 绿。

---

*起草：Meetwise E2E/评测主导执行器 · eval-first 基线初稿 · 2026-09-10 PT*
