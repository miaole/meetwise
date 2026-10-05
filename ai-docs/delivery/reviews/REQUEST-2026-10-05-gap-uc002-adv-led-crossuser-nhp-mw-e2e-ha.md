# REQUEST — **NHP-002-ADV-01 · UC-E2E-002 伪造 LED / 跨用户 session ADV 真证据** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
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

## 请审什么（mw-e2e-ha 视角）

矩阵 `NHP-002-ADV-01`（`non-happy-path-perf-load-case-matrix.md:45` **blind→case-only**）· §1.0.1 `UC-E2E-002` ADV **blind** / `case-only`（`:113`）。本刀 REQUEST 为该行求 SSE 会话两族六类 ADV 可复现真证据。请审：

1. **两族六类可执行性**：伪造 LED 族 V1 非法格式（Infinity/小数/科学计数/空白/负数/17 位溢出）/ V2 合法格式越界（seq>max）/ V3 同 LED 重复重放；跨用户 session 族 V4 他人令牌 GET state / V5 他人令牌 GET events（合法+非法 LED）/ V6 无令牌/坏令牌/保留 sentinel uid/伪造 dev-header。注入路径唯一 = `GET /interview/:id` 与 `GET /interview/:id/events` + `last-event-id` 头（`interview.controller.ts:251-252` · `main.ts:67` CORS allowlist）；产品事实 = `last-event-id.ts:8-18`（正则 fail-closed → 400 `invalid_last_event_id`）+ `interview.service.ts:814-820`（`asPrincipal` RLS + `guardInterviewPrivacy` → 404 不泄露；恒 `seq>$2 ORDER BY seq`）+ `principal.guard.ts:54-68`（401 `invalid_token`/`unauthenticated`/`reserved_principal` fail-closed；x-user-id dev 回退生产禁用）。
2. **EXIT 契约**：EXIT 0 = V1–V6 每类 HTTP 状态码+错误码+DB before/after 快照断言全成立（V1/V4/V6 零副作用；V2 空 replay 零事件；V3 两窗逐 seq 一致不重不漏；V4/V5 no-leak：响应体不含属主题面/进度/事件 `seq/kind/payload`）；任一不成立/做不出 → **EXIT 1 诚实保留 blind/case-only**。EXIT 0 也不自动翻行：ADV blind/case-only→partial 还须 post-prove dual + 协调方授权。
3. **诚实失败路径**：矩阵场景期望写「401/403/空」；产品当前把越权折叠为 **404 不泄露**（`e2e-scenarios.md:90` E-越权恢复原文即「0 行 → 404，不泄露存在性」）——prove 须按实际产品语义断言 401/404/空并**如实披露**此差异，**Ban** 为凑 403 改产品加错误码。EXIT1 打印 `GAP-UC002-ADV-LED-CROSSUSER` 明细；**Ban** 把 EXIT1 说成 flake；attempts 全记录 · **Ban retry-to-green**。
4. **隔离与安全**：prove 走 `scripts/run-e2e-isolated.mjs` 隔离壳（同 `uc002:http:prove` 三层包装，`package.json:138-139` 先例）；无 Key 依赖（SSE replay 纯账本读，不触模型）；Ban secrets/`.env*` 入树入 receipt；`releaseEvidence=false`。
5. **口径与既有 prove 关系**：`uc002:http:prove` H-authz（2 断言单锚）/ `uc002:lease:prove` L1–L3 / `uc010:sse-resume:prove` R-authz / `uc033:cross-user-authz:prove` X1–X11 与本刀收据**互不替代**；本刀不改这四个文件。receipt 落点 `receipts/2026-10-05-gap-uc002-adv-led-crossuser-nhp-prove.md`。
6. **G7 列闸**：NEG 内嵌 V1/V4/V6（拒+错误码+零副作用）；NEG/FAULT/BOUND 保持既有 partial 不动；PERF_api/PERF_web/LOAD_worker（§1.0.2 :147 本行全 blind「跨副本压测未证」）对本行无 case → **显式 blind**（Ban n/a 偷关、Ban wash）。

Row **`UC-E2E-002`** ADV column stays blind/case-only. Case `NHP-002-ADV-01` stays blind→case-only. **Ban covered** · coveredCount=8. **Ban 翻任何 SSOT 行**。**Ban 碰 UC-018 / UC-052 / UC-025 / UC-004 / UC-014·026 任何行/文件**（UC-052 stays partial）。**Ban retry-to-green · attempts 全记录**。

本 stub 不授权 coding / prove / push。pre-exec dual PASS 后由协调方授权 prove；implementer 不自批。Dual PASS ≠ coding ≠ nail。

---

*Stub · awaiting expert pre-exec dual · STOP*
