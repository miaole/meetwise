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
