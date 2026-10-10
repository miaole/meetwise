# Harness — **GAP-UC002-ADV-LED-CROSSUSER · NHP-002-ADV-01**（SSE 会话伪造 LED / 跨用户 session ADV 真证据 · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · row stays blind/case-only）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban push · Ban self-approve · Ban invent a fix · this commit is not coding authorization and is not a prove）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`a778255`** / full `a778255c8a600304001207a514621323e77da3d2`（Line R worktree `/Users/miaole/Desktop/golucky/meetwise-line-r` · branch `line/r-next-nhp`）
**Knife**: **NHP-002-ADV-01 / UC-E2E-002 ADV 列 · 伪造 LED / 跨用户 session 真证据**（一刀一行 · ADV 一列；不是把 `uc002:http:prove` H-authz 单锚 / `uc010` R-authz / `uc033` X 系当 ADV 已铺——三者均无本行专用对抗矩阵收据、无 no-leak payload 断言、无伪造 LED 分类）
**Gap id**: **`GAP-UC002-ADV-LED-CROSSUSER`**（本刀新具名 · 对应矩阵 ADV blind/case-only 读法「伪造 LED / 跨用户 session」未执行；不改任何既有 gap id）
**Case id**: **`NHP-002-ADV-01`**
**Row**: **`UC-E2E-002`**（ADV 列）· not UC-E2E-018 · not UC-E2E-052 · not UC-E2E-025 · not UC-E2E-004 · not UC-E2E-014/026
**Experts**: `mw-e2e-ha` + `mw-rag-route`（stubs PENDING · Ban self-approve · alone ≠ dual；本行非隐私域——SSE 会话 ADV 无 PII/擦除面、不触 privacy-erasure/tenant/0091 任何行，RLS/`asPrincipal` 仅作为既有 authz 机制的真实接线被断言，故不换 `mw-privacy-int`）
**Authority**: meetwise — docs REQUEST only · Ban secrets / `.env*` · Ban force-push · Ban push · Ban SSOT edit · Ban invent a fix · Ban coding

## 选行（Line R · 一刀一行）

通读两矩阵后全部 status=gap|blind 行已盘点；**排除**：UC-018（flip-ban FINAL nail `post_prove_dual_pass` 生效）、UC-052（F/G/A' 线 · stays partial）、UC-025（B'' 接线已落 · 门锁生效）、UC-004（C'' 线 FAULT EXIT=1 诚实保留）、UC-014/026（K 线 `NHP-014-ADV-01` EXIT=0 双 fresh 已落 · 矩阵注记已有 ADV 证据 · 勿重选）。其余 gap|blind 行不选的主因：UC-011 ADV（refund-callback 产品口缺失=执行面 gap，K 线已声明归其它刀）、UC-027/028/040–043/012/024（产品未接线/blocked，prove 无法落地）、UC-031/032（需真模型 ai-eval，本环境 Key-blocked）、UC-030/015/017/010（无已注册 case id 或需时钟/跨副本/worker 注入基础设施）、UC-001（主链 Key-blocked 面 + begin 已耦合 UC-025 quiz-id 接线）、PRIVACY-HTTP（DELETE=503 冻结）、GAP-RAG-01…05 与 NHP-R4/R5-PERF、NHP-RAG-LOAD-01（RAG 域 G-R4-5 线密集占用）、NHP-UI-PAY / NHP-CLOUD-KILL / NHP-HA-FAILOVER（out-of-scope / 无授权 / stub）、NHP-PERF/LOAD suites（重量级另刀）。

据此选 **`NHP-002-ADV-01`**（同 K 线标准）：需求源枚举最全（`e2e-scenarios.md:79-99` E-并发resume / E-越权恢复 / E-重放去重 + 验收 A1–A3 + TC-E2E-002-resume/lease-race/replay 三件套齐备）、产品接线真实（`parseLastEventId` fail-closed 400 + `asPrincipal` RLS + `guardInterviewPrivacy` 404 不泄露 + `PrincipalGuard` fail-closed 401）、P0 关联（覆盖矩阵 §3 **P0-7「UC-E2E-002 跨设备」**行）、无 Key 可跑（`uc002:http:prove` 先例）、且 ADV 是该行唯一 blind/case-only 未执行列 → **prove 可落地性最高**。

## Quoted from the files

`non-happy-path-perf-load-case-matrix.md:45` row **`NHP-002-ADV-01`**: `002 | ADV | api | 伪造 LED / 跨用户 session | 401/403/空；不泄露他用户事件 | **blind**→**case-only** | uc033 旁证`。

`e2e-requirement-coverage-matrix.md:113`（§1.0.1）row **`UC-E2E-002`**: NEG **partial** · FAULT **partial** / `case-only`（跨副本杀 SSE）· BOUND **partial**（lease）· ADV **blind** / `case-only` · 读法「lease/双 session GET+LED = BOUND/FAULT partial；ADV=`case-only`（NHP-002-ADV-01）；≠ covered」。`:171`（§1.1）:「lease+HTTP GET/LED 可跑（无 Key）；≠ covered；缺 HTTP lease mouth + snapshot 专用口 + full.e2e 双设备…本绿≠全链路 E2E」。`:147`（§1.0.2）:「UC-E2E-002 / 010（SSE/lease）| blind | blind | blind | 跨副本压测未证」。`:267`（§3 P0-7）:「UC-E2E-002 跨设备…矩阵 partial；禁止升 covered」。

`ai-docs/requirements/use-cases/e2e-scenarios.md` UC-E2E-002（:79 起）: E-并发resume「thread lease CAS…恰一个抢到」（:89）· E-越权恢复「RLS principal 绑定 fail-closed · 0 行 → 404，不泄露存在性」（:90）· E-重放去重「`Last-Event-ID` + seq 去重 · 事件不重不漏」（:91）；验收 A1 seq 重放一致 · A2 双设备并发 resume 仅一个可推进 · A3 非属主 →404（:93）；TC-E2E-002-resume / lease-race / replay（:97-99）。

`scripts/run-e2e-isolated.mjs` 头注口径:「local green ≠ HA · need multi-instance + fault-inject for releaseEvidence」。

## 现有 prove 缺什么（读源码结论 · 本刀的靶）

- **无专用 uc002 ADV proof**：`apps/api/test/` 无 `uc-e2e-002-adv*`，root/apps `package.json` 无 `uc002:adv` script（grep 0 命中）。伪造 LED / 跨用户 session 两族对抗无任何单一机器可复核收据。
- 覆盖散且为**子集**：`apps/api/test/uc-e2e-002-cross-device-http.proof.ts` H-authz（:188 起）仅 2 条断言（userB GET→404 + userB SSE→404），无 no-leak payload 断言、无伪造 LED 分类、无未认证/伪造令牌类；`uc010:sse-resume:prove` R-authz 与 `uc033:cross-user-authz:prove` X1–X11 为旁证（≠002、非本行专用矩阵）。矩阵 ADV 列因此保持 blind/case-only。
- 产品现状（本树读码，ADV 断言的真实接线依据）：
  - `apps/api/src/platform/last-event-id.ts:8-18` `parseLastEventId`：正则 `^(0|[1-9]\d{0,15})$` 拒 Infinity/小数/科学计数/空白/负数/超 16 位 → 400 `{error:'invalid_last_event_id'}`（fail-closed，头注明言「feeding those to SQL silently changes replay semantics and can force a full-stream scan」）。
  - `apps/api/src/modules/interview/interview.service.ts:814-820` `events()`：`parseLastEventId` → `db.asPrincipal(principal,…)` RLS 绑定 → `guardInterviewPrivacy`（:164 起）→ 注释明言「返回 null 表示越权/不存在(404)」；查询恒 `seq>$2 ORDER BY seq`（LED 语义权威在服务端）。
  - `apps/api/src/modules/interview/interview.controller.ts:251-252` `GET /interview/:id/events` 收 `last-event-id` 头；`apps/api/src/main.ts:67` CORS allowlist 含 `last-event-id`。
  - `apps/api/src/platform/principal.guard.ts:54-68`：无/坏令牌 → 401 `invalid_token`/`unauthenticated`（fail-closed）；保留 sentinel uid → 401 `reserved_principal`（:55/:65）；`x-user-id` dev 回退生产禁用（:7/:62）。
- ADV 期望「401/403/空；不泄露他用户事件」中 403 面：产品 authz 无 403 出口（跨用户=404 不泄露、未认证=401）——本刀按**实际产品语义**断言 401/404/空，如实记录「本行场景期望写 401/403/空；产品当前把越权折叠为 404 以不泄露存在性（e2e-scenarios E-越权恢复原文即 0 行→404）」，**Ban** 为凑 403 改产品加错误码。

## ADV 注入表（inject what · 恰两族六类）

| id | 族 | 注入什么 | 注入在哪 | 观察什么 |
|----|----|----------|----------|----------|
| **V1 伪造 LED·非法格式** | 伪造 LED | `last-event-id` 喂 `Infinity`/小数/科学计数/空白/负数/17 位溢出 | `GET /interview/:id/events`（属主令牌） | 400 `invalid_last_event_id`（fail-closed 非 5xx、非静默 0）+ **零副作用**：interview_event 无读扩散副作用、无 fabricated 行（DB before/after 快照） |
| **V2 伪造 LED·越界** | 伪造 LED | 合法格式但 seq > 全流 max（如 999999999999999） | 同 V1 | 200 **空 replay**（零事件、非 5xx、不崩溃、无全流扫描错误） |
| **V3 伪造 LED·重复重放** | 伪造 LED | 同一 LED 连续重放（E-重放去重对抗面） | 同 V1 | 恒定 `seq>N` 窗口：两次重放事件集逐 seq 一致、**不重不漏**（幂等 replay，无重复发射、无丢事件） |
| **V4 跨用户·state** | 跨用户 session | 他人有效令牌 GET `/interview/:id` | `GET /interview/:id` | 404 不泄露存在性 + **no-leak**：响应体不含属主题面/进度/display_code |
| **V5 跨用户·events** | 跨用户 session | 他人有效令牌 GET events（合法/非法 LED 各一） | 同 V1 | 404 / 零事件流；**no-leak**：任何 `seq/kind/payload` 均不泄露 |
| **V6 伪造认证** | 跨用户 session | 无令牌 / 坏令牌 / 保留 sentinel uid / 伪造 dev-header | 同 V1 | 401 `unauthenticated`/`invalid_token`/`reserved_principal`（fail-closed）+ 零副作用快照 |

V1/V4/V6 内嵌 **NEG 面**（业务拒 + 可解释错误码 + 零副作用），满足 G7「必须带 NEG」硬闸。本刀只动 **ADV** 列；NEG/FAULT/BOUND 列保持既有 partial（不动、不翻）；PERF_api / PERF_web / LOAD_worker **显式 blind**（§1.0.2 :147 本行全 blind「跨副本压测未证」，本行无 PERF/LOAD case，Ban 用 n/a 偷关，Ban 用本刀绿 wash PERF/LOAD）。

## Prove CMD（授权后才存在 · 本 docs commit 不添加任何代码）

- 待授权产物：`apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts` + root script `uc002:adv:prove`（走 `scripts/run-e2e-isolated.mjs` 隔离壳，同 `uc002:http:prove` 三层包装形态：root `:prove` → `:raw` → apps/api `prove:*`，见 `package.json:138-139` 先例；复用 `_neg-harness.ts` 惯例）。本 REQUEST 一个代码行都不加。
- Prove 必须：真实起 api + 隔离 PG、真实执行 V1–V6 注入、每类 HTTP 状态码+响应体+DB before/after 快照+no-leak 断言逐项断言、全输出落 receipt。

## EXIT 契约（含诚实保留路径）

- **EXIT 0 = 两族六类 ADV 真证据成立**，当且仅当 V1–V6 每类断言全部成立（含零副作用/no-leak DB 快照）。EXIT 0 也不自动翻行：ADV blind/case-only→partial 还须 post-prove dual PASS + 协调方授权，implementer 不自批；**Ban covered**。
- **EXIT 1 = 诚实保留 gap**：任一类做不出/断言不成立（例：非法 LED 被静默接受为 0、越界 LED 触发全流扫描/5xx、跨用户流泄露事件 payload、sentinel uid 冒充成功）。prove 须打印 `GAP-UC002-ADV-LED-CROSSUSER` 明细（哪类哪断言未证、file:line 依据），如实落 receipt；**保持 blind/case-only，Ban invent fix，Ban 把 EXIT1 说成 flake**；attempts 全记录（EXIT+时间戳）· **Ban retry-to-green**。
- 与既有 `uc002:http:prove`（H1–H3+H-authz）/ `uc002:lease:prove`（L1–L3）/ `uc010:sse-resume:prove`（R-authz）/ `uc033:cross-user-authz:prove`（X1–X11）**互不替代**：它们继续是各自 prove 的锚点/旁证；本刀不改动这四个文件。

## Receipt 落点

`ai-docs/delivery/receipts/2026-10-05-gap-uc002-adv-led-crossuser-nhp-prove.md`（prove 全输出 · EXIT 值 · V1–V6 逐项结果 · DB 快照 · attempt 台账）；如 emit 结构化证据另附同名 `.json`。`releaseEvidence=false` 惯例不变。

## Ban 列表

- **Ban coding**（本 turn docs-only）；**Ban prove 执行**（prove 需 pre-exec dual PASS 后由协调方授权）；**Ban push**。
- **Ban covered**：不写 covered、不翻 `UC-E2E-002` 行、不翻 `NHP-002-ADV-01` 行、coveredCount 保持 8。
- **Ban 翻任何 SSOT 行**：矩阵/backlog/checklist 只在 nail 改；本刀零 SSOT edit。
- **Ban 碰已占用行任何行/文件**：UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026（不 flip · K 线注记保留 · UC-052 stays partial · UC-025 门锁生效 · UC-004 归 C'' 线）。
- Ban invent a fix · Ban product code · Ban 为凑「403」改产品错误码折叠（404 不泄露是 scenarios 原文机制）· Ban 伪造事件/双发射 · Ban 改 `uc-e2e-002-cross-device-http.proof.ts` / `uc010` / `uc033` 现有断言 · Ban 把 EXIT1 记成 flake/环境问题。
- Ban secrets / `.env*` · Ban force-push · Ban SSOT edit · **Ban self-approve（alone ≠ dual）**。

## Scope

本 REQUEST 只为 `NHP-002-ADV-01` / `UC-E2E-002` ADV 列求真证据。不 widen：不动 NEG/FAULT/BOUND 列（保持 partial）；不碰 UC-011 refund-callback、UC-019 regenerate、UC-033 七类越权、跨副本杀 SSE（NHP-002-FAULT-01 case-only 归其它刀）；不碰 PERF/LOAD 行；不碰 RAG/R4/R5 行。验收口径以 `e2e-scenarios.md` UC-E2E-002 原文为准，不发明新验收标准。

## Pins

NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=**8** · ms3EqualsR4Closed=false · PG-retained · public DELETE stays **503** · row stays blind/case-only · STOP

*Harness · NHP-002-ADV-01 · UC-E2E-002 ADV · forged-LED / cross-user session evidence · awaiting_pre_exec_dual · ADV blind/case-only · STOP*
