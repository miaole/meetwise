# REQUEST — **NHP-017-LOAD-w-01 · UC-017 LOAD 大量孤儿预占回收** · pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-uc017-load-sweep-nhp.md` · slice `gap-uc017-load-sweep-nhp.slice.md`
**Parent tip**: `1c4588f9`（full `1c4588f952b77e6173acfadf7f3351c311b0cff0`；`git fetch origin` 本 turn 成功 · pre-exec 前复核线上 tip 未前进）
**Date**: 2026-10-07

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

## 选刀摘要（Phase 2 item 12 · 非 banned UCs）

Line Y · 下一 NHP = **NHP-017-LOAD-w-01**（UC-E2E-017 LOAD_worker 分面 · 大量孤儿预占回收 · blind→case/prove 显式化）。排除清单：**018/052/025/004/011/014/026/002/001**（已占用/FINAL）。其余 gap|blind 行落选理由见 harness 表（015-FAULT 无 prove 锚 · 016-FAULT model-op 邻域 · 031 eval 域禁 fake-model · 033-FAULT live 重面 · 040–043 接线未证 · 027 blocked · R4/R5-PERF green-risk · RAG-LOAD 重 · UI-PAY runner 前置 · CLOUD-KILL/HA-RTO blocked）。行引证：NHP 矩阵 `:63`（`blind`→case-only · 锚「—」）· §1.0.1 `:122` · §1.0.2 `:148` LOAD_worker blind · 需求源 `e2e-scenarios.md:197`（高并发/逃逸 spec 明文）· seam `commerce.ts:341/:384/:359`。零 Key 依赖（K/R 线标准：三件套齐+接线真实+无 Key 优先）。

## 请审什么（mw-e2e-ha · 隔离证据层诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-017 LOAD_worker（blind · 锚「—」）vs 015/016/031/033/040–043/027/R 系/UI-PAY/CLOUD/HA — 裁决是否成立；排除清单是否被遵守；是否与他线在办撞行。
2. **负载合同**：诚实造数（真 `reserveEntitlement` → 置 lease 过期 · **Ban 裸 INSERT 绕过 CAS/bucket 账面**）下 **L1** 回收完成（稳态残留=0 · spec A3）+ **L2** 无漏扣（bucket 回补=allocations · `availableUnits` 净变 0 · 无负值 · spec A1）+ **L3** C 并发 reconcile 释放集互斥/恰一次 released + **L4** 幂等重跑零增量 + **L5** 收据（吞吐/backlog/error rate · ≠SLO≠容量≠HA）是否机检可断言。
3. **NEG 硬闸**（G7）：**N1** 并发无双放/无双退/无重复入账（settlement_ledger exactly-once 保持）· **N2** 任何漏扫/回补不齐 = EXIT1（Ban 洗 flake）· **N3** 新鲜（heartbeat 活）reserved **不得被扫**（commerce.ts:341 头注释自证条款 · Ban 全扫冒充回收完成）· **N4** 重跑无二次副作用。缺任一 = 合同不成立。
4. **PC positive control**：小规模单 sweep（镜像 O2）先跑全绿；对照缺失 = Ban 假绿。
5. **product diff 声明**：本刀拟 **prove-only**（新 proof 文件 + `package.json` script 注册 · 零 `apps/api/src`/`packages/db/src` diff 意向）；LOAD 实证缺陷 → EXIT1 + backlog，修复另刀，**Ban 借刀改 `commerce.ts`**。coding 仅在 PRE dual PASS + 协调方授权后。
6. **老 prove 关系**：`uc017:orphan:prove`（O1–O4）零改动；单孤儿 ≠ bulk；Ban 静默改老 proof/断言文本。
7. **EXIT0 ≠ covered**：EXIT0 = PC+L1–L5+N1–N4 全绿+收据 = 具名 case 证据 ≠ covered ≠ suite green ≠ PERF_api/PERF_web 面填补 ≠ 容量/SLO/HA；UC-017 行/§1.0.2 LOAD_worker 措辞不动（升格仅经 coordinator nail）；coveredCount=8 冻结。**EXIT1 = 诚实保留**；attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就。
8. **PERF/LOAD 适用性**：本行 = LOAD_worker（适用 · 主证）；PERF_api **不适用 → 显式 blind**、PERF_web n/a(非 UI 主) 保持不动；Ban 借 LOAD 收据宣 PERF。
9. **隔离与 Ban live**：isolated 真 PG（`run-e2e-isolated` 三层壳 + `assertIsolatedTestTarget` 先例）· 零 live 模型 · 不加载 MODEL_API_KEY · 拟名 `uc017:nhp-load:prove` / `prove:uc017-nhp-load` / `uc-e2e-017-nhp-load.proof.ts` 无命名冲突。
10. docs-only 本 turn；PRE dual PASS ≠ coding ≠ prove ≠ nail；专家对 mw-e2e-ha + mw-rag-route（非隐私域 · 不换 privacy-int）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual 审查 — mw-e2e-ha（adversarial evidence-honesty · 2026-10-07）

**Reviewer**: `mw-e2e-ha`（独立审 · 非实现方 · 不代签 `mw-rag-route` · alone ≠ dual）
**审 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-y-e2e-ha`（branch `rv/y-e2e-ha` · 自 `origin/feat/mysql-schema-skeleton` tip `d0dc312f`）
**被审对象**: REQUEST commit `e47101e2`（`docs(e2e): REQUEST NHP-017-LOAD-w-01 NHP (pre_dual)` · 镜像 `1948f1be` 同内容·空 diff）· 仅 4 新增 md（harness + slice + 2 stubs · +245/−0）
**方法**: 只认命令 + EXIT + 可复现证据；产品源码/需求源/SSOT 全程只读；本审不跑 prove、不改产品码、不改共享 SSOT。

## 检查表（命令 → EXIT → 证据）

| # | 项 | 可复现证据 | 结果 |
|---|----|-----------|------|
| 1 | docs-only · 4 新增 md | `git show --stat e47101e2` → `gap-uc017-load-sweep-nhp.slice.md` + `harness/gap-uc017-load-sweep-nhp.md` + 2 stubs，全部 `.md` 新增，+245/−0 · `git diff e47101e2 1948f1be` 空 | ✓ |
| 2 | 祖先 + parent 声明 | `git merge-base --is-ancestor e47101e2 d0dc312f` EXIT0 · `git log -1 e47101e2^` = `1c4588f952b77e6173acfadf7f3351c311b0cff0` 与两 stub「Parent tip」逐字一致 | ✓ |
| 3 | 行引证逐字 | NHP 矩阵 `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md:63`（`回收完成+无漏扣；收据 │ blind→case-only │ —`）· §1.0.1 `e2e-requirement-coverage-matrix.md:122` · §1.0.2 `:148`（`无并发退款/对账负载收据`）· `e2e-scenarios.md:197`（UC-E2E-017 · 七类「高并发 ✅（对账 vs 重试竞态）· 逃逸 ✅（对账 sweeper）」· A1 额度恢复原值 / A3 无超 TTL 孤儿残留）— 全部逐字命中 | ✓ |
| 4 | seam 真实（只读） | `packages/db/src/commerce.ts:341` `sweepExpiredReservations`（状态翻转与 `lease_expires_at < now()` 同一条原子 UPDATE · 头注释自证 heartbeat-vs-sweep TOCTOU）· `:384` `reconcile`（sweep + settle）· `settleOutbox` 函数声明在 `:363`（REQUEST 引 `:359` = 其 JSDoc 块起行 · nit 见 C1）· `SKIP LOCKED` + `ledger UNIQUE(consumption_id) ON CONFLICT DO NOTHING` 属实 — 非静态 G-GAP，sweeper 真实可跑 | ✓ |
| 5 | 隔离壳三层先例 | `package.json:108-109`（`uc017:orphan:prove` → `:raw` → `pnpm -C packages/db prove:uc017-orphan`）· `scripts/run-e2e-isolated.mjs` 存在 · `packages/db/package.json` `prove:uc017-orphan` → `test/uc-e2e-017-orphan-reservation.proof.ts` 含 O1–O4 且 import `assertIsolatedTestTarget`（`:16/:50`） | ✓ |
| 6 | 命名 / gap-id 冲突 | 仓内 grep `nhp-load`、`prove:uc017-nhp-load`、`uc-e2e-017-nhp-load`、`GAP-UC017` — 除本 REQUEST 4 文件外零命中；`GAP-UC017-LOAD-01` 为新认领，无既有钉翻动 | ✓ |
| 7 | 撞行 / 禁碰面 | NHP-017-FAULT-01（Batch2 钉 `:39`）、NHP-017-BOUND-01（Batch3 钉 `:41`）各自自标「**≠** LOAD_worker」· LOAD_w 分面（矩阵 `:63`）blind/锚「—」无主 · 本 commit 未触 018/052/025/004/011/014/026/002/001 任一行或文件（diff 仅 4 新 md）· batch3 `:89/:106`「无既有 prove 锚」引证逐字命中 | ✓ |
| 8 | Pins 原值 | 8 项与共享 pins（`PARALLEL-DISPATCH-2026-10-02.md:3`、`execution-master-checklist.md:432`）逐字一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · DELETE=503 · 本 commit 零 SSOT diff | ✓ |
| 9 | PC+L1–L5 / N1–N4 机检性 | PC=单 owner 单 sweep（镜像 O2）全绿为 bulk 前置闸（对照缺失=Ban 假绿）· L1=稳态后「reserved ∧ lease_expires_at<now()」残留=0（DB 计数 → spec A3）· L2=逐 bucket `units_reserved` 回补==allocations 和 + 全 run `availableUnits` 净变 0 + 无负值（DB 快照 → spec A1）· L3=C 并发 reconcile 下释放集互斥 + 每 consumption 恰一次 released + Σreleased==孤儿数（原子 UPDATE 行锁语义的真实行使）· L4=稳态二次 reconcile released 增量=0 + `settlement_ledger` 零新增 · L5=吞吐/wall time/backlog 逐轮/error rate 落 receipt · N1=ledger exactly-once 审计 · N2=漏扫漏补=EXIT1 · N3=新鲜对照组残留 reserved（原子 UPDATE lease 子句负向行使）· N4=already-released 重入 0 行 — 全部可由隔离 PG 快照/计数机检断言 | ✓ |
| 10 | 造数诚实 | 经真产品路径 `reserveEntitlement` 预占 → 仅置 `lease_expires_at` 时移（**Ban 裸 INSERT 绕 CAS/bucket 账面**）· 账面（units_reserved/allocations/bucket version）全程留产品维护 → sweep 释放路径被真实行使 · 造数理由在 harness `:63` 有自洽论证 | ✓ |
| 11 | LOAD 面诚实 | 登记值（拟 N=20×M=5=100 · C=10）显式「拟」+「参数冻结入 receipt」· L5「≠ 线上 SLO · ≠ 容量 · ≠ HA」· Non-claims「not production capacity · not SLO · not HA」· EXIT0 行「capacityRepresentative=false · ≠HA」· 收据措辞「implementer pre-commit runs · not evidence of record」与 UC-018 先例（`harness/uc-e2e-018-perf-load.md:11/:90`）一致 | ✓ |
| 12 | PERF 面不越权 | PERF_api「不适用 → 显式 blind」、PERF_web n/a(非 UI 主) 均保持不动；§1.0.1/§1.0.2 措辞不动声明三处（harness EXIT0 行/行语义/slice EXIT 契约）；EXIT0 ≠ covered ≠ suite green ≠ 行升格（升格仅经 coordinator nail）· coveredCount=8 冻结 | ✓ |
| 13 | EXIT 契约双向诚实 | EXIT0=PC+L1–L5+N1–N4 全绿+收据=具名 case 证据（非 covered）；EXIT1=诚实保留（双放/漏扫/误扫/幂等破防/对照不齐/造数不可信 → attempts 全记录 · Ban retry-to-green · EXIT1 不记 flake · 缺陷登记 backlog · 修复另刀）· **Ban 借刀改 `commerce.ts`** 在 harness 差异声明/EXIT1/Ban 列表 + slice + 两 stub 五处重复钉死 | ✓ |
| 14 | 老 prove 关系 | O1–O4 零改动声明 · 「单孤儿 ≠ bulk」明文 · Ban 静默改老 proof / 改断言文本 | ✓ |
| 15 | 自批 / 代签 | 两 stub 均 PENDING · 本审仅 append 本 stub · 未触碰 `mw-rag-route` stub · 不签 nail | ✓ |

## Fail-trigger audit（命中任一即 FAIL）

| trigger | 结果 |
|---------|------|
| fake-green / retry-to-green / flake 洗绿条款 | 未发现（反向三连显式 Ban：attempts 全记录 · EXIT1 不记 flake · Ban 改断言迁就） |
| invent covered / SSOT 翻行 / 「EXIT0=covered」措辞 | 未发现（coveredCount=8 · EXIT0≠covered 多处钉死 · 零 SSOT diff） |
| 产品码 / SSOT / 他线在办文件触碰 | 未发生（docs-only 4 新 md · 禁碰名单零触碰） |
| 借 LOAD 收据宣 PERF/容量/SLO/HA | 未发现（L5 + Non-claims + EXIT0 三重否认 · PERF_api 显式 blind 不动） |
| 裸 INSERT 绕账面造数 / 全扫冒充回收完成 | 未发现（显式 Ban + PC 对照闸 + N3 新鲜对照组负向闸） |
| 自批 / 代签 peer / 自宣 dual | 未发现（双 stub PENDING · alone ≠ dual · peer stub 未动） |

**触发 0/6。**

## Blockers

无阻塞。抽查可复现：`git show --stat e47101e2` · `git merge-base --is-ancestor e47101e2 d0dc312f` · `sed -n '63p' non-happy-path-perf-load-case-matrix.md` · `sed -n '341,400p' packages/db/src/commerce.ts` · `sed -n '108,109p' package.json` · `grep -rn 'GAP-UC017\|nhp-load'`（零外部命中）。C1 为引用行 nit、C2–C5 为执行期条件，均非阻塞。

## Conditions（carry to 授权 / prove 接线 / 执行）

- **C1（引用锚 nit）**：REQUEST 引 `settleOutbox :359` 为其 JSDoc 块起行，函数声明实际在 `commerce.ts:363`；后续 prove 收据/POST 引用以 `:363` 为准，**Ban 借此回改 REQUEST**。
- **C2（UC-028 禁碰）**：UC-028（矩阵 `:107` gap）为 **Line X 在办**（`harness/nhp-028-fault-01-trace-fail-open.md` draft），未列入本 harness 具名排除表（由「Ban 碰他线在办文件」兜底）→ 本刀全阶段（prove/POST/nail）禁碰 UC-028 行与 Line X 文件。
- **C3（对照组造数同规）**：N3 新鲜（heartbeat 活）对照组造数同样走真 `reserveEntitlement`（如需维活用真 `renewReservationLease`），prove 接线时写明；Ban 对照组走裸 INSERT 而主组走真路径的双标。
- **C4（L2 前提冻结）**：`availableUnits` 只计 `expires_at > now()` 桶 → L2「净变 0」断言以「run 期间无桶 `expires_at` 边界穿越」为前提；造数桶 TTL ≥ run 时长+余量，与 N/M/C 一并冻结入 receipt 参数。
- **C5（L4 措辞边界）**：L4 引证「spec 幂等重发/不超扣」为原则性映射（A2 原义 = 同键用户重试 → `ON CONFLICT DO NOTHING`）；prove 收据按 **worker 侧幂等**（sweep+settle 重跑零增量）表述，**不宣 A2 用户重试面已被本刀覆盖**。
- **C6（attempts / receipt）**：每次 `pnpm uc017:nhp-load:prove` attempt 序号+EXIT+失败类全录（Asia/Shanghai + code SHA）· 落 `.tmp/` + tracked 镜像 · implementer 收据 ≠ evidence of record · Ban retry-to-green · Ban EXIT1 记 flake（harness 已声明，此处承接为执行条件）。
- **C7（alone ≠ dual）**：本 PASS 仅 mw-e2e-ha 半签；peer `mw-rag-route` stub 保持 PENDING 由其自审自签；两 PASS 齐后方可交协调方裁授权；本审不改写 peer 审查域（exactly-once/管线叙事）结论。

## 中文三行摘要

1. REQUEST `e47101e2` 纯 docs（4 新 md · +245/−0 · 祖先属实 · 镜像同内容），行引证/seam/壳先例/命名/pins 十五项全查实，零产品码、零 SSOT、零禁碰行触碰。
2. PC+L1–L5+N1–N4 逐项机检可断言，造数诚实（真 reserve + 仅 lease 时移 + Ban 绕账面），LOAD 面不越权宣 PERF/容量/SLO/HA，EXIT 双向契约含 EXIT1 诚实保留 + Ban 借刀改 `commerce.ts` 五处钉死。
3. Fail-trigger 0/6 · 无 Blocker · 7 条 Condition（:363 锚 · UC-028 禁碰 · 对照组同规造数 · 桶 TTL 冻结 · L4 措辞边界 · attempts 全录 · alone≠dual）→ **PASS**；本 PASS ≠ dual ≠ 授权 ≠ prove ≠ covered。

Verdict: PASS

---

# POST-PROVE dual 审查 — mw-e2e-ha（adversarial evidence-honesty · 2026-10-07）

**Reviewer**: `mw-e2e-ha`（独立审 · 非实现方 · 禁自批 · 不代签 peer `mw-rag-route` · alone ≠ dual）
**审 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-yp-e2e-ha`（branch `rv/yp-e2e-ha` · 自 `origin/feat/mysql-schema-skeleton` tip `a7638deb` 新建）
**被审对象**: coding `dd471a74`（9 files +12730/−2）· shipped face = `a7638deb^..a7638deb`（同一补丁 drop 落 origin tip；**9 文件 blob 逐字全等实证**：`git rev-parse dd471a74:<f>` ≡ `a7638deb:<f>` ×9 · 两 commit tree 差集恰为 MOP-01 base 移动的 4 md，Y 面零语义差）
**Pre-exec binding 复核**: REQUEST `e47101e2`（镜像 `1948f1be`）为 `a7638deb` 祖先 EXIT0 · PRE-EXEC mw-e2e-ha `9b1313a` ≡ in-origin `1db7199a`（该文件 diff=0 行，rebase drop 同内容）· peer rag-route 审在并行，本审看不到也不看。
**方法**: 只认命令 + EXIT + 可复现证据；产品源码/SSOT 只读；本审恰一次独立复跑（fresh re-run），未 retry。

## 1. 包完整性（shipped face 逐项）

| # | 项 | 可复现证据 | 结果 |
|---|----|-----------|------|
| 1 | 恰 9 申报文件 +12730/−2 | `git diff --numstat a7638deb^ a7638deb` → 5 receipts（prove doc + README + ledger + 2 JSON）+ root `package.json`(+2) + `packages/db/package.json`(+1) + `proof.ts`(+453) + `run-e2e-isolated.mjs`(+9/−2) = 9 files · numstat 合计 +12730/−2 逐字吻合 | ✓ |
| 2 | 产品码零 diff | `git diff --stat a7638deb^ a7638deb -- 'packages/*/src' 'apps/*/src' 'packages/db/migrations'` 空 · `*commerce.ts` 空 | ✓ |
| 3 | 老 O1–O4 proof 零触碰 | `git diff --name-only a7638deb^ a7638deb -- packages/db/test` 仅 `uc-e2e-017-nhp-load.proof.ts`（新文件）；`uc017:orphan:prove` 接线行零 diff | ✓ |
| 4 | SSOT/禁碰 UC 行零 diff | `git diff` 空：`e2e-requirement-coverage-matrix.md` · `e2e-covered-path-backlog.md` · `execution-master-checklist.md` · `PARALLEL-DISPATCH-2026-10-02.md`（pins）· `e2e-live-targets-whitelist.md`（UC-028 面）· Line X 在办 `harness/nhp-028-fault-01-trace-fail-open.md` 不在 face；018/052/025/004/011/014/026/002/001 行零触碰 | ✓ |
| 5 | Pins 原值 | proof.ts `:22-23`（releaseEvidence=false · Not HA · coveredCount=8 · EXIT0 ≠ covered ≠ suite green ≠ 行升格 ≠ PERF ≠ 容量 ≠ SLO ≠ HA）+ SSOT 零 diff 实证 | ✓ |
| 6 | 三层接线真实 | root `package.json:109-110`（`uc017:nhp-load:prove`→`:raw`→`pnpm -C packages/db prove:uc017-nhp-load`）· `run-e2e-isolated.mjs` 四处注册（`isolatedReceiptSources :689-693` · known-targets allowlist `:1482` · `isolatedCommand :1564-1565` · migrate-list `:2279`）— fresh run 全链路行使 | ✓ |

## 2. Fresh re-run（C-DUAL-FROM-FRESH · 恰一次 · 禁重试）

- **CMD**: `MW_GIT_SHA=a7638debcea649c5b75f17b28bdf091cebdd9fc2 env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm uc017:nhp-load:prove`（本审 worktree · fresh checkout + `pnpm install --frozen-lockfile` EXIT0 · 恰运行一次，无重试）
- **EXIT = 0**；**45 PASS / 0 FAIL**（`grep -c '^PASS'`=45 · `'^FAIL'`=0）——与实现方 #2 完全一致，无不一致，非重大发现。
- 隔离直证（log 行号）：`:7` fresh PG `meetwise-e2e-71421-1791357701280` on 127.0.0.1:50802 · `:13` `migrations: applied=140 skipped=0` · `:5` `[R5-MARKED-RED] E2E_ISOLATION_STACK=pgvector-legacy`（test infra ≠ stack truth · releaseEvidence=false · Not HA）· 本机 `pgvector/pgvector:pg16` digest `7b822b0aac60…da199b90a` 与 ledger 逐字同（无 pull · 不依赖 docker.m.daocloud.io 可达性）· 零 live 模型（env -u 三键 + 零 MODEL_API_KEY 加载）。
- L5（本审 run）：waves=2 · wall=419ms · throughput=238.4 orphans/s · backlog [(1,100,10),(2,0,0)] · errors=0/840 —— 与 #1（151.09/s）/ #2（261.76/s）同族同形，仅时序抖动。
- 收据落点：`RECEIPT_WRITTEN …/.tmp/uc017-perf-load-receipts/uc017-nhp-load-attempt001.json`（**repo 根** `.tmp/`，即修复后 C-6 落点；`.gitignore:15` 忽略 · `overall=PASS · failedAsserts=0 · gitSha=a7638deb…`）。

## 3. 断言抽查（proof.ts file:line · 全部在本审 fresh run 中亲见 PASS）

| 断言 | 锚 | fresh run 证据 |
|------|----|---------------|
| L2 无漏扣（逐 owner avail 0→5.0） | `:308-314`（post≡total−1=5.0 ∧ pre≡0）+ `:315-319`（units_reserved 6.0→1.0 逐 owner）+ `:320` 无负 | PASS ×3 |
| L3 Σreleased=100=distinct | `:303-305`（Σ===100 ∧ distinct===100 ∧ set 等值无放大） | PASS ×3 |
| L4 二次增量=0 + ledger=10 | `:390-393`（released/settled 增量===0 · ledger 仍===10 · outbox 不变） | PASS ×4 |
| N1 无双放/无双退 + outbox 全 relayed | `:323-345`（set 等值 · 负 reserved 行===0 ∧ Σ余留===20.0 · ledger 行===distinct===10 ∧ Σworker settled===10 · pending===0 ∧ relayed===10 · ledger 集==cohort 集） | PASS ×6 |
| N3 fresh 20/20 零被扫 | `:356-366`（仍 reserved 20/20 · released===0 DB 面 · ∩swept===0 worker 面 · lease 严格未来 · swept 集==孤儿集 Ban 全扫） | PASS ×5 |
| N4 420 次 reconcile 0/0 | `:396-397`（10 workers × 21 owners × 2 轮 = 420 call 逐个 staleReleased===0 ∧ settled===0）+ `:398-403` 账面零漂移 | PASS ×3 |
| settled cohort 真路径 | `:229-256` 真 reserve→真 confirm（`commerce.ts:130` outbox `settlement_proposed` 唯一生产点，只读亲验）→ outbox pending===10 前置 → Wave1 `:274` C=10 并发 `reconcile` 行使 `settleOutbox`（`commerce.ts:363` 函数声明行只读亲验 · `FOR UPDATE OF o SKIP LOCKED` · ledger `ON CONFLICT(consumption_id) DO NOTHING`）→ settlement 半边非空壳绿 | PASS（前置 3/3 + N1 结算面 + L4） |

断言总数复核：PC 7 + 造数 5 + settled 3 + L1 3 + L3 3 + L2 3 + N1 6 + N2 2 + N3 5 + L4 4 + N4 3 + 收尾 1 = **恰 45**，与 EXIT 契约一致。造数诚实面：消费生命周期全经真 `reserveEntitlement`/`confirmConsumption`/`releaseConsumption`/`renewReservationLease`（`:189-205` `:421-424`），唯一裸 INSERT = 桶 provision 夹具（`:72-78`，O1–O4 先例同款）；孤儿化仅孤儿行 lease 时移（`:221-223`），fresh 行 fixture 零触碰（`:225-227` 断言锚死）。

## 4. Attempts 裁决（#1 → #2 = 收据路径修复，非 retry-to-green）

**裁决：成立（path-fix · 无 green 追逐）**。依据：
1. **#1 本已全绿**：ledger + prove doc + attempt001.json 三处一致记录 `EXIT=0 · 45 PASS/0 FAIL`——无红可追，retry-to-green 动机不成立；#2 复跑唯一目的是以提交代码行使修复后的 C-6 收据落点。
2. **缺陷性质 = 接线非产品非断言**：RECEIPT_DIR 相对层级少一级 → 误落 `packages/.tmp/`（违 C-6 落点）；处置 = 收据原样搬迁 + 仅改路径常量。shipped `proof.ts:67` `../../../.tmp/uc017-perf-load-receipts/` 恰解析到 repo 根，**本审 fresh run 收据实际落点已验证修复生效**。
3. **两 receipts 结构全等**（本审逐字段比对 attempt001/002.json）：caseId/gapId/gitSha(4804c3dc)/frozenParams(N20·M5·C10·S10·F20·units1.0·TTL300d·hb1800s)/overall=PASS/failedAsserts=0/backlogShape [(1,100,10),(2,0,0)] 全同，差异仅时序（drainWallMs 661.9→382.0 · throughput 151.09→261.76）。
4. **披露诚实**：#1 缺陷在 ledger/prove doc 显要位置如实自曝（含违 C-6 定性），搬迁后 `line-y` worktree `.tmp/` 存两份 attempt JSON 且无 `packages/.tmp` 残留（本审只读查证），与「原样搬迁保留」声明吻合。
5. **Verification limit（如实记录，非阻塞）**：#1 运行时的 pre-fix proof 文本未单独入 git 史（单 commit 交付），「断言集两次逐字相同」无法由 git byte 级直证， rests on ledger 披露 + 两 receipts 结构全等 + 本审对 shipped 文件的独立 45/45 复跑（C6 本即规定 implementer 收据 ≠ evidence of record，evidence of record = 本审复跑）——该限度不改变裁决。

## 5. 条件裁决（e2e C1–C7 · PRE-EXEC binding 逐条）

| Cond | 内容 | 裁决 | 证据 |
|------|------|------|------|
| C1 | `settleOutbox` 引 `:363`（非 `:359` JSDoc 行）· Ban 回改 REQUEST | ✓ 兑现 | 只读亲验 `commerce.ts:363` = `export async function settleOutbox` 声明行；proof header `:16`、prove doc `:28` 均引 `:363`；REQUEST/harness 零 diff（§1 项4） |
| C2 | UC-028 禁碰（Line X 在办） | ✓ 兑现 | 9-file face 无 UC-028 行/文件；`e2e-live-targets-whitelist.md` 与 `run-e2e-isolated.mjs` 中 `uc028:trace-fail-open` 既有条目零改动（diff 仅插入 `uc017:nhp-load:prove:raw` token） |
| C3 | N3 对照组同规造数（真 reserve + 真 renew） | ✓ 兑现 | `proof.ts:194-205` fresh 走真 `reserveEntitlement` + 真 `renewReservationLease(1800s)`；无裸 INSERT 双标 |
| C4 | L2 前提 + 参数冻结入 receipt | ✓ 兑现 | `:52` TTL=300d 冻结（TTL ≥ run 时长+余量，实测 wall 419ms ≪ 300d，无 `expires_at` 穿越）；frozenParams 落 proof `:143-147` + 两 receipts + ledger `:17` |
| C5 | L4 按 worker 侧幂等措辞 · 不宣 A2 用户重试面 | ✓ 兑现 | `:369` 段标题「worker 侧幂等 · e2e C-5 措辞」· `:391` 同措辞；`grep 'A2\|用户重试' proof.ts` 零命中（A2 边界仅在 prove doc `:42` 以否认句出现） |
| C6 | attempts 全录 + 收据 ≠ EOR | ✓ 兑现 | ledger `:10-13` 两 attempt CMD/EXIT/失败类/时间全录（含 #1 缺陷披露）；`proof.ts:440` + ledger `:3` + prove doc `:3` 三处「implementer pre-commit run · not evidence of record」；**本审 fresh re-run = evidence of record**；无 retry-to-green |
| C7 | alone ≠ dual | ✓ 兑现 | 本审仅 append 本 stub；`REQUEST-…-mw-rag-route.md` 零触碰；不签 nail、不代签 peer、不宣 dual 成立（dual = 两 POST-PROVE PASS 齐 + 协调方裁） |

**Fail-trigger audit（POST 面重扫）**：fake-green/retry-to-green＝无（#1 全绿非追逐 · 本审一次复跑）；invent covered/翻 SSOT/「EXIT0=covered」＝无（SSOT 零 diff · coveredCount=8 冻结）；借 LOAD 宣 PERF/容量/SLO/HA＝无（L5 note + Non-claims + fresh run 输出 `:5` 三重否认，PERF_api 显式 blind 未动）；借刀改 `commerce.ts`＝无（src 零 diff）；裸 INSERT 绕账面/全扫冒充＝无（§3 造数面 + N3 set 等值）；自批/代签＝无。**触发 0/6。**

## 6. Blockers

**无阻塞。** 一处 nit（不阻塞、不要求单独改面）：prove doc `:73` 记 `run-e2e-isolated.mjs`「+9/−0」，文件级 numstat 实为 **+9/−2**（allowlist/migrate 两长行插 token 计改写；coding commit message 本身已正确记 +9/-2）。纯记账口径差，face 内容已全量实证。

## 7. Conditions（carry forward）

- **CP-1（EOR 归属）**：本 NHP-017-LOAD-w-01 的 evidence of record = 本审 fresh re-run（`rv/yp-e2e-ha` · EXIT0 · 45/45 · 收据 `.tmp/uc017-perf-load-receipts/uc017-nhp-load-attempt001.json` gitSha `a7638deb…`）；implementer attempt001/002 维持 pre-commit run 定位，不得升格引用。
- **CP-2（不升格）**：EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ UC-E2E-017 行升格 ≠ PERF_api/PERF_web ≠ 容量 ≠ SLO ≠ HA；UC-017 行/§1.0.2 LOAD_worker 措辞不动（升格仅经 coordinator nail）；coveredCount=8 · releaseEvidence=false · NOT_HA · PG-retained · DELETE=503 持续。
- **CP-3（alone ≠ dual）**：本 PASS 仅为 mw-e2e-ha 半签；peer `mw-rag-route` POST-PROVE 审由其独立出具；dual 成立与否由协调方裁，任何一方不得代签或引用对方结论。
- **CP-4（verification limit 存档）**：#1 pre-fix proof 文本不在 git 史，「断言集逐字相同」依 §4-5 限度裁决；后续任何 turn Ban 倒填/改写 attempt 台账或收据（append-only）。
- **CP-5（nits 不重开）**：§6 记账 nit 不作为重开 prove/coding 的理由；仅当未来该文件因其他正因改面时顺带对齐。

## 中文三行摘要

1. coding `dd471a74`≡shipped `a7638deb` 九文件逐字全等（+12730/−2 恰 9 申报面），产品码/commerce.ts/老 O1–O4/SSOT/禁碰 UC 行零 diff，pins 原值零漂移，三层接线四处注册全实。
2. 本审 fresh re-run 恰一次 EXIT=0 **45 PASS/0 FAIL**（隔离容器+migrations=140+本机同 digest pg16+零 live），L2/L3/L4/N1/N3/N4 与 settled cohort 真路径逐锚亲见 PASS（`settleOutbox` `commerce.ts:363` SKIP LOCKED 真行使），与实现方 #2 零不一致。
3. attempts #1→#2 裁定为收据落点修复非 retry-to-green（#1 本已全绿·结构全等·披露诚实·修复经本审复跑验证生效），C1–C7 全兑现，Fail-trigger 0/6，0 Blocker 5 Conditions → **PASS**；本 PASS = 半签 ≠ dual ≠ covered ≠ 授权 nail。

Verdict: PASS
