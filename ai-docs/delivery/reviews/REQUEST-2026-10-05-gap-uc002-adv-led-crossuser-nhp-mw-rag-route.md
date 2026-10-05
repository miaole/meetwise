# REQUEST — **NHP-002-ADV-01 · UC-E2E-002 伪造 LED / 跨用户 session ADV 真证据** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Knife**: `harness/gap-uc002-adv-led-crossuser-nhp.md` · slice `gap-uc002-adv-led-crossuser-nhp.slice.md`
**Parent tip**: `a778255`（series open · not a prove tip）
**Date**: 2026-10-05

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |

## 请审什么（mw-rag-route 视角）

矩阵 `NHP-002-ADV-01`（`non-happy-path-perf-load-case-matrix.md:45` **blind→case-only**）· §1.0.1 `UC-E2E-002` ADV **blind** / `case-only`（`e2e-requirement-coverage-matrix.md:113`）。本刀 REQUEST 为该行求 SSE 会话两族六类 ADV 可复现真证据。请审：

1. **域边界与 RAG 无涉确认**：本 prove 注入路径 = `GET /interview/:id` + `GET /interview/:id/events`（interview 域 HTTP/SSE），不触 route snapshot / classify / retrieve / qbank / R2/R4/R5 任何面；`NHP-R4-*`/`NHP-R5-PERF-01`/`NHP-RAG-LOAD-01` 行不动、不 wash。请审本刀是否确有 RAG 域越界。
2. **两族六类可执行性与产品事实**：伪造 LED 族 V1 非法格式 / V2 越界空 replay / V3 重复重放不重不漏；跨用户 session 族 V4 state 404 不泄露 / V5 events no-leak / V6 伪造认证 401 fail-closed。产品事实链 = `last-event-id.ts:8-18`（fail-closed 400，头注明言防「silently changes replay semantics / full-stream scan」）+ `interview.service.ts:814-820`（`asPrincipal` RLS 绑定 + `guardInterviewPrivacy` → 404）+ `principal.guard.ts:54-68`（sentinel/reserved 拒 + dev-header 生产禁用）。RLS/`asPrincipal` 在此仅作为既有 authz 接线被断言，**非** privacy 域 knife（无 PII/擦除面，故双审维持 mw-e2e-ha + mw-rag-route、不换 mw-privacy-int）。
3. **EXIT 契约**：EXIT 0 = V1–V6 每类状态码+错误码+DB before/after（V1/V4/V6 零副作用 · V2 空流 · V3 幂等窗口 · V4/V5 no-leak）全成立；EXIT 1 = 诚实保留 blind/case-only + `GAP-UC002-ADV-LED-CROSSUSER` 明细 + attempts 全记录 · Ban retry-to-green · Ban flake 标签。EXIT 0 ≠ 翻行 ≠ covered。
4. **401/403 差异披露**：矩阵期望「401/403/空」vs 产品越权=404 不泄露（`e2e-scenarios.md:90` 原文机制）——prove 须如实披露差异，Ban 改产品凑 403；该差异作为 disclosed 项随 receipt/翻行评估带入。
5. **G7 列闸与不 widen**：NEG 内嵌 V1/V4/V6；NEG/FAULT/BOUND 保持 partial；PERF_api/PERF_web/LOAD_worker 显式 blind（§1.0.2 :147「跨副本压测未证」，Ban n/a 偷关）；不改 `uc002:http:prove` / `uc002:lease:prove` / `uc010:sse-resume:prove` / `uc033:cross-user-authz:prove` 四文件（互不替代）。
6. **禁碰清单**：Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件；Ban 碰 RAG/R4/R5 行与 `g-r4-5-*` / `r2-*` / `r5-*` / `m4-*` / `m5-*` 任何文件；Ban SSOT edit；Ban covered；coveredCount=8。

Row **`UC-E2E-002`** ADV column stays blind/case-only. Case `NHP-002-ADV-01` stays blind→case-only. 本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*
