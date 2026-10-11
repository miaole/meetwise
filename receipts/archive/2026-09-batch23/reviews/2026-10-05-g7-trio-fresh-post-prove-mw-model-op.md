# POST-PROVE · mw-model-op · Line U G7 trio fresh

**Verdict**: **PASS**（审的是收据诚实度 · trio 仍 EXIT **1/1/1** · **≠** G7 suite green · **≠** R1 closed · **≠** HA · **≠** MODEL-OP-00 closed · **≠** nail · alone ≠ dual）  
**Role**: `mw-model-op`  
**Date**: 2026-10-05（Asia/Shanghai · CST · UTC+8）  
**Receipt tip**: `9ff3daf2ee7b9e5d355212d0e877f5b8be79db38`  
**Prove/code SHA**: `e8c63a913a1e9af285f692bcab16f7593294d144`（PRE mw-e2e-ha · 收据写明 ≠ receipt commit）  
**REQUEST**: `1c57bb36e79a34b9152bf05d47275e90bfa4c58b`  
**PRE dual**: mw-model-op `ad8d68e5f2536e83668ea07f6c1e224c23b32442` + mw-e2e-ha `e8c63a9…` **BOTH PASS**  
**Branch**: `feat/mysql-schema-skeleton`  
**Live re-run**: **not_run**（Ban live · 本审未调模型）  

**Pins**: `NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained**

---

## 1. Live discipline（相对 REQUEST 授权）

REQUEST / harness / PRE dual 授权的是：**Ban live** · Keys unset · 真实模型调用 **0** · 在 committed SHA 上产出 trio 新鲜 CMD+EXIT（预期诚实 EXIT=1）。**不是** Line C 式 chat-only live 再跑。

本轮收据：`Ban live` · **0** model calls · `actualSpendCny=null`（四处 md 均 null · **无**数字写入 · **无**把 estimate 标成 actual）。无 Key / fingerprint 字段。

因此 Line C 的「caps / fresh ledger / allow-ticket chat / deepseek 拒 / 旁路 hard-disable」**未在本窗口做 live 再证**——授权本身禁止 live。旁路/chat 未到产品断言（iso/UI 在 DB gate 即停；perf 在 migrate 停）。**不**把「未再跑 live 条件」记为本收据 FAIL。

## 2. Erratum（quota-403）

| Claim in NEW receipts | Ruling |
|------------------------|--------|
| **removal** attribution = `cc8050d` → `82981ff`（2026-09-23） | **OK** · 与 PRE C-2 / SSOT erratum 口径一致 · `cc8050d`（2026-09-23 20:57 PT）祖先于 `82981ff`（2026-09-23 21:44 PT） |
| Ban `b1d7b22` @ 09-23 for that removal | **OK** · `b1d7b22` = **2026-10-02** FR2 tautology / `offlineProvesAtCodeSha` · 新收据只在 erratum 禁写中提及，**未**把 403 事件钉到 `b1d7b22` |
| 本目录别处是否仍把 09-23 403 归 `b1d7b22` | **否** |

**观察 SHA（对照）**：2026-09-23 live 窗口（约 21:11–21:20 PT / UTC-7）跑的是 code **`3424dc19e69cbe96b0a69d57743f4be4ed1988ba`**，收据 tip **`5b2243eb32c65a25a11ea06e5941db1c02e3616f`**（commit 文案 `@3424dc1`）。`82981ff` **晚于**该窗口（21:44 PT），是 fix-round / **removal** 归因，**不是**当次 403 观察 SHA。新收据写的是 **removal**，未写成「403 happened at 82981ff」。**非 blocker**。

## 3. FAIL classification（receipt label vs 本审）

实现者 `.tmp` 日志（**不入 git**）已对照；CMD 日志内原文如下。

| CMD | Receipt label | Evidence line | This ruling |
|-----|---------------|---------------|-------------|
| `pnpm e2e:isolated` EXIT **1** · 23:15:54–23:15:55 CST | **env-gap**（docker.sock）+ fixture R5-MARKED-RED pgvector-legacy | stdout/stderr: `E2E_FAILURE class=db code=database_not_ready`；local receipt `failureClass=db` · `assertionCount=null` · durationMs≈29 | **env-gap 成立**（隔离 DB 未就绪 · **零 case**）。CMD 日志**无** `permission denied` 字样；同主机 `docker info` EXIT 1：`permission denied … /var/run/docker.sock`（uid `box` 不在 `docker` 组）可独立复现。**非** UI 409 / provenance / report max_attempts 等产品 case（未跑到）。 |
| `pnpm e2e:ui:isolated` EXIT **1** · 23:16:10–23:16:11 CST | **env-gap**（同）· chromium 已装 ≠ UI green | 同 `database_not_ready` · Playwright cases **not_run** | **env-gap 成立** · **非** recruiting-bound / voice 产品 FAIL 本轮复现（收据已标 not_executed）。 |
| `pnpm verify:e2e-performance` EXIT **1** · 23:16:16–23:17:09 CST | web build **0** 后 migrate **1** · **env-gap** + fixture | stderr: `e2e_performance_suite_failed:schema migration/deploy evolution:exit=1` + R5-MARKED-RED；HTTP full E2E **not_run** | **env-gap（级联）成立** · build EXIT=0 **≠** suite green（收据已钉）。**非**把历史 HTTP full E2E 产品红洗成绿。 |

**无**「产品 FAIL 被标成 env-gap」或反向。docker.sock 字样未进 CMD 日志 = **non-blocker note**（分类仍由 `database_not_ready` + 主机 docker 拒权支撑）。

## 4. No suite-green

四文件：`g7SuiteGreen=false` · status **honesty_red** · trio **OPEN** · R1 / Disclosure-1 **OPEN** · TECH_ROLE opt-out **never counts toward R1** · EXIT 1/1/1 **未**写成 pass。`g7SuiteGreen=true` 命中 **0**。`1c57bb3..9ff3daf` 对本刀仅新增 `receipts/g7-trio-fresh/*`（外加无关他线 reviews）；无假绿翻转。

## 5. Reproducibility

| Item | Result |
|------|--------|
| CMDs in repo @ `e8c63a9` | **yes** · `package.json` `:246` `e2e:isolated` · `:247` `e2e:ui:isolated` · `:250` `verify:e2e-performance`（非 `/tmp` 脚本） |
| Prove SHA | 四文件均钉 `e8c63a913a1e9af285f692bcab16f7593294d144` · meta `PROVE_SHA=` 同 · receipt commit `9ff3daf` **≠** prove SHA |
| Retarget without re-run | **未发现** |

## 6. Redaction

四 md：`sk-` / Bearer / `MODEL_API_KEY=` / private-key **0**；无新 fingerprint；无 PII。目录无 json/ndjson 入树。

## Blockers

无。

## Non-claims / non-blockers

- 本 PASS **只**认收据诚实 · **不**关 trio · **不**关 G7 · **不**授权 nail / SSOT。  
- alone ≠ dual（`mw-e2e-ha` 须另签）。  
- Ban live 窗口 **未**再证 Line C allow-ticket / caps / deepseek live 条件。  
- docker.sock 字样在主机诊断可复现，但未写入引用的 CMD `.tmp` 日志（分类仍成立）。  
- 403 **观察** SHA = `3424dc1`；本 erratum 讲的是 **removal** = `cc8050d`→`82981ff`。

---

Verdict: PASS
