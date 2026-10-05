# Slice — **NHP-002-ADV-01 · UC-E2E-002 伪造 LED / 跨用户 session ADV 真证据**（docs REQUEST · **`draft:awaiting_pre_exec_dual`**）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · row stays blind/case-only · ADV is not closed）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Date**: 2026-10-05
**Base**: `origin/feat/mysql-schema-skeleton` · `a778255c8a600304001207a514621323e77da3d2`（Line R worktree `meetwise-line-r` · branch `line/r-next-nhp`）
**Authority**: meetwise — L0 docs only · Ban coding · Ban prove 执行 · Ban push · Ban invent a fix · Ban self-approve

## One-line

矩阵 `NHP-002-ADV-01`（`non-happy-path-perf-load-case-matrix.md:45`，**blind→case-only**）+ §1.0.1 `UC-E2E-002` ADV **blind** / `case-only`（`e2e-requirement-coverage-matrix.md:113`「lease/双 session GET+LED = BOUND/FAULT partial；ADV=`case-only`（NHP-002-ADV-01）；≠ covered」）。本刀为该行求 **SSE 会话两族六类 ADV 真证据**：伪造 LED 族 V1 非法格式（400 `invalid_last_event_id` fail-closed）/ V2 越界（空 replay）/ V3 重复重放（不重不漏）；跨用户 session 族 V4 state 404 不泄露 / V5 events 零事件流 no-leak / V6 伪造认证 401 fail-closed。**不是**把 `uc002:http:prove` H-authz 双断言、`uc010` R-authz、`uc033` X 系当本行 ADV 已铺——三者均无本行专用对抗矩阵收据、无 no-leak payload 断言、无伪造 LED 分类。

## 选行理由（Line R）

- 排除清单：UC-018（flip-ban FINAL nail 生效）· UC-052（F/G/A' 线 · stays partial）· UC-025（B'' 接线已落 · 门锁）· UC-004（C'' 线 FAULT EXIT=1 诚实保留）· UC-014/026（K 线 `NHP-014-ADV-01` EXIT=0 双 fresh 已落 · 矩阵注记已有 ADV 证据 · 勿重选）。
- 其余 gap|blind 行不选主因：UC-011 ADV 产品口缺失、UC-027/028/040–043/012/024 产品未接线、UC-031/032 Key-blocked、UC-030/015/017/010 无已注册 case id 或需时钟/跨副本/worker 注入设施、UC-001 主链 Key-blocked 且 begin 已耦合 UC-025 quiz-id、PRIVACY-HTTP 冻结、GAP-RAG-01…05 / NHP-R4/R5-PERF / NHP-RAG-LOAD-01 RAG 域占用、NHP-UI-PAY / CLOUD-KILL / HA-FAILOVER out-of-scope/无授权/stub、PERF/LOAD suites 重量级另刀。
- 本行信息最全：P0-7 关联行（`e2e-requirement-coverage-matrix.md:267`）；需求源三件套齐备（`e2e-scenarios.md:79-99` E-越权恢复/E-重放去重 + A1–A3 + TC×3）；产品接线真实（`parseLastEventId` fail-closed 400 `last-event-id.ts:10-16` + `asPrincipal` RLS + `guardInterviewPrivacy` 404 不泄露 `interview.service.ts:814-820` + `PrincipalGuard` fail-closed 401 `principal.guard.ts:54-68`）；无 Key 可跑（`uc002:http:prove` 先例 `package.json:138`）→ 与 K 线同标准下 **prove 可落地性最高**。

## Products

| Role | Path |
|------|------|
| Harness | `harness/gap-uc002-adv-led-crossuser-nhp.md` |
| Dual `mw-e2e-ha` | `reviews/REQUEST-2026-10-05-gap-uc002-adv-led-crossuser-nhp-mw-e2e-ha.md` |
| Dual `mw-rag-route` | `reviews/REQUEST-2026-10-05-gap-uc002-adv-led-crossuser-nhp-mw-rag-route.md` |

（本行非隐私域：SSE 会话 ADV 无 PII/擦除面、不触 privacy-erasure/tenant/0091 任何行，RLS/`asPrincipal` 仅作为既有 authz 机制的真实接线被断言 → 双审维持 mw-e2e-ha + mw-rag-route，不换 mw-privacy-int。）

## Scope / Not

只做 UC-E2E-002 **ADV 列**的两族六类 SSE 会话 ADV prove REQUEST（case `NHP-002-ADV-01`）。NEG 面内嵌于 V1/V4/V6 业务拒+错误码+零副作用断言（G7 硬闸）；NEG/FAULT/BOUND 列保持既有 partial 不动；PERF/LOAD **显式 blind**（§1.0.2 :147 本行全 blind「跨副本压测未证」，Ban n/a 偷关）。Not UC-018。Not UC-052。Not UC-025。Not UC-004。Not UC-014/026。不碰 UC-011 refund-callback、UC-019 regenerate、UC-033 七类越权、跨副本杀 SSE（NHP-002-FAULT-01 归其它刀）。不发明验收标准（口径以 `e2e-scenarios.md` UC-E2E-002 原文为准；产品把越权折叠为 404 不泄露是 scenarios E-越权恢复原文机制，Ban 为凑「403」改产品）。

诚实条款：若六类任一做不出/断言不成立（尤其 V1 非法 LED 被静默接受、V5 跨用户流泄露 payload），**保持 blind/case-only**、如实落 receipt（`receipts/2026-10-05-gap-uc002-adv-led-crossuser-nhp-prove.md`）。Ban invent fix。attempts 全记录 · Ban retry-to-green · EXIT1 不记 flake。

## Ban

Ban coding · Ban prove 执行（pre-exec dual PASS 后由协调方授权）· Ban push · Ban covered · Ban 翻任何 SSOT 行 · Ban 碰已占用行（UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026）任何行/文件 · Ban retry-to-green（attempts 全记录）· Ban 改 `uc-e2e-002-cross-device-http.proof.ts` / `uc010` / `uc033` 现有断言 · Ban self-approve（alone ≠ dual）。

Pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503.

*Slice · NHP-002-ADV-01 · UC-E2E-002 ADV · forged-LED / cross-user session evidence · awaiting_pre_exec_dual · blind/case-only · STOP*
