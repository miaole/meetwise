# REQUEST — **C-PERF-TEARDOWN · product rootcause fix** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/c-perf-teardown-product-rootcause-fix.md` · slice `c-perf-teardown-product-rootcause-fix.slice.md`
**Parent tip**: `59e2189`（full `59e21898fd29c8d64897e7414a228c379568e3e6` · not a prove tip）
**Date**: 2026-10-06
**Line**: **AN-PERF-TEAR**（wave AN）

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
| PERF/LOAD | **local partial** · capacityRepresentative=**false** |

## 请审什么（mw-rag-route）

1. **与 AE residual 分界**：新 harness 是否明确 cite AE 为 parent context · 本刀 = product rootcause fix · Ban 互借 AE R-A 0/0/0 关 CONDITION。
2. **产品面范围**：若 P-FIX，触碰面是否限于产品（非 AE Branch B 网络拓扑发明）；Ban 全局 uncaughtException 兜底。
3. **attempt1 账目**：`b29c191` EXIT=1 retained · Ban wash · Ban flake 叙事。
4. **CONDITION 诚实**：may stay OPEN until honest fix proved · Ban invent green · Ban HA/capacity。
5. **边界**：docs-only · Dual PASS ≠ coding · Ban re-open AG/AI/AK · Ban AN-CIMG-EA · Ban Meridian · Ban buy cloud。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban wash attempt1 · Ban UC-018 covered flip · Ban close CONDITION without honest fix proved · Ban wash AE residual · Ban SSOT edit · Ban buy cloud · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-rag-route` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · STOP*

## PRE-EXEC @110532e · mw-rag-route

**时间**：2026-10-06 20:15 +08:00
**REQUEST**：`110532e81f11064e543bc9bc420b67bb2f95ae1e`（只改 4 个 docs：harness +73、slice +25、两个 stub 各 +46；docs-only，是 origin tip `d269761` 的祖先）
**审查基**：临时 worktree `/tmp/mwrr-d269761` @ `d269761`（detached）· 仅本 box · 只读源码，无 prove、无 docker 操作 · 未读 `.env*` · 无 live 模型调用
**范围**：独立审查，不代签 mw-e2e-ha · alone ≠ dual

### 已满足

- attempt1 @ `b29c191` EXIT=1 永久保留，Ban wash（harness `:24`、`:37`、`:60`）；Ban UC-018 covered flip（`:38`、`:54`）；backlog `:35` CONDITION 保持 OPEN、零 SSOT 改动（`:49`、`:53`）。
- 与 Line S / Line AE 分界，Ban 借其绿（`:13-14`、`:19`、`:40`）。
- Pins 全部保留（`:4`、`:71`）；未声称 covered（`:67`）。
- 引用的 backlog `:35` 原文与仓库一致。

### 阻断项

**B1 · 根因主张没有任何代码锚点，P-FIX / P-HOLD 的判定被推给评审。** harness `:19`、`:32-33` 只说「若双审认定仍需产品面…」，全文没有一个 file:line 指向 teardown 代码，也没有根因假设。已核实的真实候选落点：
- 产品 pg 错误观测：`packages/db/src/principal.ts:928-931`（`pool.on('connect')` 给每个 client 挂 `error` 观测，`pool.on('error')`；`:870-900` 注释说明它只观测、不恢复）。Line S 判定它在结构上覆盖 attempt1 路径（`harness/gap-perf-teardown-rootcause-fix.md:29`）。
- runner 自身容器：`scripts/run-e2e-isolated.mjs:1714`（容器名 `meetwise-e2e-${pid}-${ts}`）、`:2239-2241`（finally 只 `docker rm -f` 自己的容器）。
- 发射器全局清理：`scripts/uc018-receipt-backfill-emit.mjs:555-560`，其中 `:559` 对**所有** `meetwise-e2e*` / `meetwise-uc018*` 容器 `docker rm -f`；而 try 内 `:206` / `:226` / `:248` 的 `process.exit()` 会跳过这个 finally。
- capped child：`scripts/uc018-perf-load-capped-child.mjs:18`（容器名 `meetwise-uc018-perf-api-*`，同样落在发射器的过滤范围内）、`:105-159`。

backlog `:35` 写明 attempt1 发生在 “PERF-LOAD teardown during backfill”，即在发射器下运行。因此「另一个并发 emit 的 `:559` 全局 `docker rm -f` 删掉了正在跑的 PG 容器 → `Connection terminated unexpectedly`」是一个必须排除或确认的**基建 / harness** 候选根因。
**修复**：新增「读码锚点 + 根因假设表」，列出上述四处（含行号）。每条写清可证伪的判据，并据此给出 P-FIX 或 P-HOLD 的书面初判，而不是留给 PRE 评审裁定。

**B2 · 没有区分产品 teardown 与 harness / infra teardown。** `:33`、`:41` 只是笼统地把基建归到 AE / Branch B。
**修复**：把每个落点标为产品（`principal.ts`、API 进程）、harness（`run-e2e-isolated.mjs`、capped child）或 infra（发射器全局 rm、docker 宿主）。P-FIX 只能动具名产品文件；若根因在发射器 `:559`（含 `process.exit` 跳过 finally），应另开 harness 刀，不得以「产品修复」名义关闭 CONDITION。

**B3 · LOOP §3③（`NORTH-STAR-EXECUTION-LOOP.md:81`）：命令与期望 EXIT 未钉。** `:47` 写「`pnpm uc018:perf-load:prove`（或 PRE 裁定之产品面专用 prove）· attempts 预声明」，但没有给出具体 attempts 数，也没有期望 EXIT。
**修复**：钉死完整命令 `./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm <script>`、attempts=N、每个 outcome 的期望 EXIT（复现前 / 修复后 / 变异），以及 code SHA 与 +08:00 时间戳要求。

**B4 · 没有可复现的故障注入、正控或变异。** 若无法让 mid-prove client teardown 确定性复现，P-FIX 就无法证明「修好了」。
**修复**：钉一个只针对本 run 自身资源的确定性注入。例如在 prove 中途对本 run 的 backend 执行 `pg_terminate_backend`，或只 `docker restart` 本 run 的容器 `meetwise-e2e-${pid}-…`，并钉住期望：修复前（或删去 `principal.ts:929` 的变异下）出现 `Unhandled 'error' event` / EXIT≠0；修复后为 `db_pool_error` 被观测、无未处理异常，EXIT 按设计钉死。正控为无注入时 EXIT 0。

**B5 · 回归未具名。**
**修复**：具名列出回归及期望 EXIT 0。至少包括 Line S 的 `uc018:perf-load:prove`、引入 pool 观测的 C'' FI prove，以及 PRE 选定的 UC-018 其他 prove。并写明 Ban 借这些绿当本刀证据。

**B6 · 证据层、宿主类与串行规则未声明。**
**修复**：
- 证据层：`run-e2e-isolated.mjs` 隔离真 PG（pgvector/pg16 fixture）。
- 宿主类：沿用 Line AE 的 R-A Linux-native-Docker-Engine；Desktop 类不在本刀范围。
- 串行规则：每次 prove 前 `docker ps -a --filter name=meetwise-e2e --filter name=meetwise-uc018` 必须为 0，有他线 prove 时不得运行。**禁止**经 `uc018:receipt-backfill:emit` 跑本刀（其 `:559` 会误杀他线容器）；故障注入只准作用于本 run 自己的容器 / backend。

### 结论

上述 6 项阻断未解除前不得进入 coding / prove。CONDITION（backlog `:35`）保持 OPEN；UC-018 / §1.1 保持 partial；attempt1 不洗。Pins 未变：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503。本审不代签 mw-e2e-ha；alone ≠ dual；coding 须双方 PASS 加协调方 AUTHORIZE。

Verdict: FAIL
