# Review — mw-e2e-ha — NHP-001-NEG-01 · UC-001 NEG blind→case POST-PROVE（Line Y）

**Reviewer**: `mw-e2e-ha`（独立审查 · 非实现方 · Ban self-approve · alone ≠ dual · **不代签** `mw-rag-route`）
**Review date**: 2026-10-05（Asia/Shanghai）
**Knife**: Line Y · `harness/nhp-001-neg-01-blind-to-case.md` · case `NHP-001-NEG-01` · gap `GAP-UC001-NEG-01` · row `UC-E2E-001` NEG
**REQUEST tip**: `48e2a3b`（`48e2a3b6f552c3382f9ed25ffad4173686011edf`）
**PRE dual**: mw-e2e-ha `78be465`（`78be465052fade0f2b278e6664317a5015d9e7ee`）PASS + mw-rag-route `ad37608`（`ad376082d0de279ae9c562d08f83a1b5962185be`）PASS（ancestry verified）
**CODE**: `1761311`（`1761311c81e48e43d74c778b36bc86e0cebb6150`）· 4 files · **零产品业务改动**
**Claim PROVE tip**: `ff74522`（`ff74522ac4db4ad661e72265e50ad8d860a68812`）· receipt `ai-docs/delivery/receipts/2026-10-05-nhp-001-neg-01-blind-to-case-prove.md`
**本审 tip（detach origin）**: `e8fa74c`（`e8fa74cd35c8acbbcadbba0851e05ca754aec60d` · `1761311`/`ff74522` 均为祖先）
**本审未读**: `.env*` · 未 print secrets · 未 git config · 未 force-push · 未改产品代码 · 未代签 peer

> **EXIT0 = case 证据（blind→case）≠ covered ≠ nail ≠ HA。** alone ≠ dual。PASS ≠ coding ≠ covered ≠ SSOT flip。

---

## 1. Tip / ancestry — 通过

| SHA | Role | Full | Ancestor of HEAD? |
|-----|------|------|-------------------|
| `48e2a3b` | REQUEST | `48e2a3b6f552c3382f9ed25ffad4173686011edf` | YES → CODE |
| `78be465` | PRE mw-e2e-ha | `78be465052fade0f2b278e6664317a5015d9e7ee` | YES → CODE |
| `ad37608` | PRE mw-rag-route | `ad376082d0de279ae9c562d08f83a1b5962185be` | YES → CODE |
| `1761311` | CODE | `1761311c81e48e43d74c778b36bc86e0cebb6150` | YES → PROVE tip |
| `ff74522` | Claim PROVE tip | `ff74522ac4db4ad661e72265e50ad8d860a68812` | YES → HEAD `e8fa74c` |

`git fetch` + detach `origin/feat/mysql-schema-skeleton` @ `e8fa74c`。零信任协调方口述；本审独立 `git cat-file` / `merge-base --is-ancestor`。

## 2. CODE 面 · 零产品业务改动 — 通过

`git show --name-status 1761311`（相对 parent）仅：

| 文件 | 状态 |
|------|------|
| `apps/api/test/uc-e2e-001-nhp-neg.proof.ts` | **A**（prove） |
| `apps/api/package.json` | M（`prove:uc001-nhp-neg`） |
| `package.json` | M（`uc001:nhp-neg:prove` / `:raw`） |
| `scripts/run-e2e-isolated.mjs` | M（target 白名单 / 映射 / migrate / receipt sources） |

**零 diff**：`apps/api/src/**` · `packages/**` · `apps/web/**` · migrations · SSOT（矩阵 / NHP / checklist / backlog）。产品锚点只**读**证（service/controller/guard），未改。**Flag blocker if product path edited** → 无。

Harness `ai-docs/delivery/harness/nhp-001-neg-01-blind-to-case.md`：N1 无额度 / N2 鉴权失败开面合同与 prove 一致；旁证 011/017/neg:auth ≠ 本 case 收据（proof 明文 Ban wash · 未 import `_neg-harness`）。

## 3. 独立重跑（恰一次 · Ban retry-to-green）— 通过

| 项 | 本审实测 |
|----|----------|
| **CMD** | `sg docker -c 'env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove'`（box 非 docker 组 → `sg docker`；与 claim 等价：`env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm uc001:nhp-neg:prove`） |
| **Window** | 2026-10-05 23:46:45 → 23:47:39 CST |
| **HEAD at run** | `e8fa74cd35c8acbbcadbba0851e05ca754aec60d`（含 CODE `1761311`） |
| **SHELL_EXIT** | **0** |
| **SUMMARY** | `asserts=26 failed=0` |
| **Process line** | `CMD=pnpm uc001:nhp-neg:prove EXIT=0` |
| **Machine receipt** | `.tmp/isolated-proof-receipts/2026-10-05T15-47-39-242Z-371908-f384ce0b-ad8f-4a70-b9ce-8e0d5b7b2a41.json`（release_evidence=false） |
| **Retry** | **无**（one-shot） |

### Ban live 确认

- 运行前 shell 内 `MODEL_API_KEY` 曾存在于父会话 → **显式** `env -u MODEL_API_KEY -u MODEL_BASE_URL` 剥离。
- Prove 子壳：`BAN_LIVE_OK:MODEL_API_KEY_unset` · `BAN_LIVE_OK:MODEL_BASE_URL_unset`。
- Proof L0：`PASS  L0 Ban live: MODEL_API_KEY absent on entry (not loaded)` · `EVIDENCE L0-ENV {"model_api_key_present_on_entry":false,"model_base_url_present_on_entry":false}`。
- L1：`PASS  L1 zero ai_model_invocation / ai_invocation_trace rows`（0→0）。
- **未读 `.env*` · 未打印 key 值**。

### N1 / N2 关键（本审 log）

| id | 观察 |
|----|------|
| **N1a** | `PASS  N1a zero entitlement → HTTP 402 insufficient_entitlement` · interview stays `created` · start job 0 · ledger 不变 |
| **N1b** | `PASS  N1b exhausted principal → HTTP 402 insufficient_entitlement` · 无双扣 · replay 202 `alreadyBegun` |
| **N2a** | `PASS  N2a no credential → HTTP 401 unauthenticated` |
| **N2b** | `PASS  N2b malformed bearer → HTTP 401 invalid_token` |
| **N2c** | `PASS  N2c wrong-secret bearer → HTTP 401 invalid_token` |
| **N2d** | `PASS  N2d expired bearer → HTTP 401 invalid_token` |
| **N2e** | `PASS  N2e x-user-id spoof (dev header disabled) → HTTP 401 unauthenticated` |
| N2-CONTROL | valid bearer → 202（401 来自 PrincipalGuard） |
| Anchors | service 402 after `reserveEntitlement` before enqueue · controller `@UseGuards(PrincipalGuard):15` · guard `invalid_token:54` / `unauthenticated:68` — ANCHOR-N1/N2 PASS |

**Ban wash**：本 prove 未导入 `_neg-harness`；旁证 UC-011 / UC-017 / neg:auth **≠** 本收据；`CASE  NHP-001-NEG-01 N1(402 insufficient_entitlement)+N2(401 PrincipalGuard) real HTTP evidence = blind→case`。

## 4. EXIT0 ≠ covered · Pins 原值 — 通过

- Proof / receipt / 本审均钉：`EXIT0 ≠ covered · ≠ UC-E2E-001 covered · ≠ e2e:isolated suite green · ≠ trio green · coveredCount=8`。
- **无 SSOT nail 自称** · Ban invent covered · Ban flip 矩阵/NHP/checklist。
- Pins **未翻**（hard pins）：

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503** |

## Blockers

无。

## Conditions

- **C-1（alone ≠ dual）**：本 PASS = mw-e2e-ha 半签；须 peer `mw-rag-route` 独立 post-prove PASS；**不代签**。
- **C-2（EXIT0 ≠ covered）**：blind→case 证据成立 **≠** covered；coveredCount=8；Ban invent covered · Ban SSOT flip · Ban self-nail。
- **C-3（Ban wash）**：旁证 011/017/neg:auth ≠ 本 case；本刀收据独立。
- **C-4（Ban live / Ban fake-green suite）**：MODEL keys unset + L0/L1；本绿 ≠ suite green / trio green / HA。
- **C-5（pins）**：上表 hard pins 冻结至协调方授权。
- **C-6（nail 门槛）**：NEG 升格仅经 **双方** post-prove + 协调方 nail；本 alone ≠ nail。

## 中文三行摘要

1. tip 链 REQUEST`48e2a3b`→PRE双PASS→CODE`1761311`（零产品）→PROVE`ff74522`；本审独立 `env -u MODEL_* pnpm uc001:nhp-neg:prove` **EXIT=0 · 26/26** · Ban live 确认。
2. N1→402 `insufficient_entitlement`（零/耗尽）；N2→401 五路（unauthenticated/invalid_token）；Ban wash 011/017/neg:auth；EXIT0≠covered · coveredCount=8。
3. Blockers 无。本 PASS = 半签；alone≠dual；≠ nail ≠ coding ≠ HA；不代签 `mw-rag-route`。

Verdict: PASS
