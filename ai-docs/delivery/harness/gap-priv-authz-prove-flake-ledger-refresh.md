# Harness — **GAP-PRIV-AUTHZ-PROVE-FLAKE · honesty ledger refresh**（Line AH · docs REQUEST · **`draft:awaiting_pre_exec_dual`** · gap stays **OPEN** mitigated/cause-unknown）

**Status**: **`draft:awaiting_pre_exec_dual`**（L0 docs REQUEST only · Ban coding · Ban prove 执行 · Ban rerun · **Ban close** · **Ban claim fixed** · Ban claim root-caused · Ban forge PROCESS_EXIT · Ban self-approve）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · canHonestlyFlip=false
**Date**: 2026-10-06
**Base / parent tip**: `origin/feat/mysql-schema-skeleton` **`416b6a5`** / full `416b6a5b5c71d97a1816974c2b174dbf4b9c8cb8`（wave start · sibling Line AD/AE/AF/AG REQUEST commits may land alongside · Ban touch siblings）
**Knife**: **GAP-PRIV-AUTHZ-PROVE-FLAKE honesty ledger refresh**（Line AH · 小刀）——在 Line X rootcause/repro ledger NAIL 之后，按当 tip **刷新** 诚实账：blob 锚复核 · Line X 后增量登记 · ECONNREFUSED 族分界（防互借）· 未来 teed first-run 前置条件更新；**零** prove · **零** 新 EXIT
**Gap id**: **`GAP-PRIV-AUTHZ-PROVE-FLAKE`**（backlog `gap-bug-backlog.md:68` · P2 · **OPEN** · mitigated/cause-unknown · 本刀不改该行）
**Prior nail**: Line X · NAIL `40bed97` / `40bed9708667239d5af71d3abe361567e03c1fd0` · evidence tip `b3e0f41` / `b3e0f4172e188f23dbcc34aac0bae82e571a10dc` · REQUEST `5773243` · POST dual mw-e2e-ha `424c7f0` + mw-privacy-int `2974d45` BOTH PASS · ledger `receipts/gap-priv-authz-prove-flake/2026-10-05-rootcause-ledger.md`
**Experts**: `mw-privacy-int` + `mw-e2e-ha`（stubs PENDING · Ban self-approve · alone ≠ dual）
**Authority**: meetwise — docs REQUEST only · Ban SSOT edit · Ban coding product · Ban `principal.ts` / `checkpoint-principal.ts` · Ban self-nail

## 0. 冲突检查（为何可与 AD–AG 并行）

- 无 in-flight PRIV-AUTHZ REQUEST（Line X 已 nail `40bed97`；之后无新 priv-flake REQUEST）。
- 与 **Line AE**（C-PERF-TEARDOWN）共享「ECONNREFUSED」字面，但 **不同 gap / 不同发生点**；本刀只读引用 `44154aa`，**Ban** 互借、**Ban** 碰 AE 文件。
- 不碰 UC-052 行（stays **partial**）· 不碰 018/025。

## 1. 现状如实陈述（引 Line X ledger · 零改写）

| 批次 | tip | n | EXIT=0 | EXIT=1 | class |
|------|-----|---|--------|--------|-------|
| 历史 first-run | `69de818` | 2 | 1 | **1** | cold `ECONNREFUSED 127.0.0.1:33010` |
| cold v1 | `71ec253` | 5 | 4 | **1** | cold `ECONNREFUSED 127.0.0.1:33047`（`state_bytes=29`） |
| warm v1 | `71ec253` | 2 | 1 | **1** | warm SQLSTATE **23505** `interview_pkey` |
| cold_v2 / warm_v2 | `3d0c71e` | 10 / 10 | 10 / 10 | 0 | mitigation only · warm_v2 = 新容器（非复用库 · review `49ef158` §5）→ 23505 类 **未被重新覆盖** |
| oneshot attempt-1 | `5b6e693` | 1 | JSON 0 / log 无退出码 | — | **不同意**（L1 保留） |
| teed attempt-2 | `6673042`（可达等价 `606677d`） | 1 | 1（`PROCESS_EXIT=0`） | 0 | 三角一致（≠ close） |

合计已记录 EXIT=1 **3** 次 · **2 类 class 并存未归一** · cause unknown · backlog `:68` **OPEN**。

## 2. Refresh 内容（授权后 · docs-only · 零 CMD）

| # | Refresh 项 | 内容 | 不得写成 |
|---|-----------|------|----------|
| **F1 · blob 锚复核** | Line X ledger 9 个 blob 锚在当 tip `git hash-object` 复核；REQUEST 撰写时只读预检 @ `416b6a5`：**9/9 一致**（jsonl `272f031…` · cold-5 `d066fcd…` · warm-2 `4ce66da…` · historical `db8ade3…` · attempt-1 json `8cc9db5…` / log `e8d0fbe…` · attempt-2 json `3919bf5…` / log `9b13414…` / receipt `8179553…`）—— 预检 ≠ 执行 refresh | 「锚复核 = 新证据」 |
| **F2 · Line X 后增量登记** | 自 evidence tip `b3e0f41` 起，共享隔离包装 `scripts/run-e2e-isolated.mjs` / `packages/db/src` 的提交逐条登记并分类（预检观察：`3d113c8` Line V · `bf1fdb2` Line Z（含 `packages/db/src/payment.ts` 新增 · `index.ts` 导出）· `6e96cf5` Line AB · `40a4f6c` Line V-main · `48c4a8a` Line W —— 表面均为新 prove 脚本注册/新增模块）；**须**读 diff 判定是否触及 `privacy-authorization:prove`（`package.json:288-289` → `pnpm -C packages/db prove:privacy-authorization`）执行路径 | 「增量 = 修复」· 「无关即已证无影响」（须读 diff 后写） |
| **F3 · 新证据计数** | Line X 之后 `privacy-authorization:prove` **新 attempt = 0**（预检：无新 receipt / jsonl 未变）→ 计数如实写 0 | 「0 新失败 = 已修复」 |
| **F4 · ECONNREFUSED 族分界（防互借）** | 三族并列表：(a) 本 gap cold 例 = 宿主侧 prove 前/中连接隔离 PG 发布端口拒绝（33047 / 33010）；(b) C-PERF-TEARDOWN `44154aa` = **API 容器内** `--network=host`（Docker Desktop）连宿主 loopback 端口拒绝 @ `assertIsolatedTestTarget`；(c) Line U = docker.sock **permission denied**（非 ECONNREFUSED · 已由 Line AC `with-docker-session.sh` 清除）—— 三者 **不同发生点 / 不同 gap** | 「同根」· 互借关闭 · 互借根因 |
| **F5 · 未来 teed first-run 前置更新（L6 延续）** | 若未来另开 rerun REQUEST：须 `scripts/with-docker-session.sh`（Line AC 先例 · Ban sudo/chmod/usermod）· 预声明 attempt 数 · cold/warm 分别（warm 须真复用库路径以重新覆盖 23505 类）· teed `PROCESS_EXIT` 行 · 独立 PRE dual —— **本刀不授权** | 「本 refresh 已授权再跑」 |
| **F6 · SUMMARY** | 拟 `receipts/gap-priv-authz-prove-flake/2026-10-0X-ledger-refresh.md`：F1–F5 + pins + non-claims + `:68` OPEN 原样 | — |

## 3. 验证契约（仅授权后 · 本 REQUEST 零实跑）

1. 只读：`git hash-object` / `sha256sum` / `git log` / `git diff` / `rg` / `git merge-base --is-ancestor`；**零** `pnpm privacy-authorization:prove` · **零** Docker / Postgres 启动。
2. 旧证据文件零改动（attempt-1/2 json/log/receipt · `uc052-pool-role-leak` jsonl/logs · Line X ledger）；新 refresh 写 **新文件**。
3. SSOT：零触碰 backlog `:68` / checklist / 矩阵。
4. 若 F1 出现任一锚漂移 → **FAIL** 如实登记（不修、不覆盖）。

## 4. 行语义 / 状态冻结

- backlog `:68` **GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN** · mitigated/cause-unknown · 2 类 class 并存
- UC-052 stays **partial** · coveredCount=8 · public DELETE=503 · canHonestlyFlip=false
- Line X / A'' teed / FINAL honesty 段 **原样**

## 5. Ban 列表

- **Ban close** · **Ban claim fixed** · Ban claim root-caused · Ban forge `PROCESS_EXIT` · Ban retry-to-green
- Ban coding product · Ban `packages/db/src/principal.ts` / `apps/worker/src/checkpoint-principal.ts` · Ban prove / rerun
- Ban 互借 C-PERF-TEARDOWN（Line AE）/ Line U·AC env-gap · Ban 碰 Line AD/AE/AF/AG 文件
- Ban Meridian · Ban secrets / `.env*` · Ban buy cloud · Ban force-push · Ban HA claim · Ban covered flip · Ban SSOT 擅自翻行
- Ban self-approve（alone ≠ dual）· Ban self-nail · Ban 代发 agent 消息

## 6. Non-claims

Not fixed · not closed · not root-caused · not a prove · not a rerun · not rerun authorization · not product change · not closing backlog `:68` · not HA · not covered · alone ≠ dual · **GAP-PRIV-AUTHZ-PROVE-FLAKE stays OPEN mitigated/cause-unknown**

## Pins

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · canHonestlyFlip=false · backlog `:68` OPEN · STOP

*Harness · GAP-PRIV-AUTHZ-PROVE-FLAKE ledger refresh · Line AH · 2026-10-06 · draft:awaiting_pre_exec_dual · docs-only · Ban close · Ban claim fixed · STOP*
