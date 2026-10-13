# REQUEST — **NHP-017-LOAD-w-01 · UC-017 LOAD 大量孤儿预占回收** · pre-exec · mw-rag-route

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-rag-route`
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

## 为何 mw-rag-route（域说明）

UC-017 面 = **对账管线**：`reconcile` = `sweepExpiredReservations`（回收）+ `settleOutbox`（outbox→`settlement_ledger` exactly-once 结算消费 · `SKIP LOCKED` 多消费者不重复处理 · ledger UNIQUE + ON CONFLICT DO NOTHING）——与 retrieval/调用链同属「管线降级/账本叙事」耦合域：负载下 exactly-once 与 backlog 形状的诚实性直接影响管线叙事可信度；属 mw-rag-route 域内。**非隐私域**（钱/额度预占对账 · 非 PII 擦除/导出/checkpoint）→ 不换 mw-privacy-int。peer = `mw-e2e-ha`（隔离证据层主场）；不代签。既有 RAG 裁决（G-R2-5 等）不动不洗。

## 选刀摘要（Phase 2 item 12 · 非 banned UCs）

Line Y · 下一 NHP = **NHP-017-LOAD-w-01**（UC-E2E-017 LOAD_worker 分面 · 大量孤儿预占回收 · blind→case/prove 显式化）。排除清单：**018/052/025/004/011/014/026/002/001**（已占用/FINAL）。其余 gap|blind 行落选理由见 harness 表（015-FAULT 无 prove 锚 · 016-FAULT model-op 邻域 · 031 eval 域禁 fake-model · 033-FAULT live 重面 · 040–043 接线未证 · 027 blocked · R4/R5-PERF green-risk · RAG-LOAD 重 · UI-PAY runner 前置 · CLOUD-KILL/HA-RTO blocked）。行引证：NHP 矩阵 `:63`（`blind`→case-only · 锚「—」）· §1.0.1 `:122` · §1.0.2 `:148` LOAD_worker blind「无并发退款/对账负载收据」· 需求源 `e2e-scenarios.md:197`（高并发/逃逸 spec 明文）· seam `commerce.ts:341`（翻转与 lease 复核同一条原子 UPDATE · 自证 TOCTOU 杜绝）/`:384` `reconcile`/`:359` `settleOutbox`。零 Key 依赖（K/R 线标准：三件套齐+接线真实+无 Key 优先）。

## 请审什么（mw-rag-route · 管线 exactly-once 负载诚实 · Ban fake-green suite · Ban live）

1. **选刀**：UC-017 LOAD_worker（blind · 锚「—」）vs 015/016/031/033/040–043/027/R 系/UI-PAY/CLOUD/HA — 裁决是否成立；排除清单是否被遵守；RAG-LOAD-01 留后刀是否正当（不借本刀洗 R4/RAG LOAD 盲区）。
2. **exactly-once 负载合同**：`settleOutbox` 在并发 reconcile 下 **SKIP LOCKED + ledger UNIQUE ON CONFLICT** 语义真实行使 —— L3 释放集互斥 + N1 无双放/无双退/无重复入账（ledger 恰一次）是否机检可断言；Ban 用「单消费者」绕开并发面。
3. **NEG 硬闸**（G7）：**N1** 无双放/无双退/无重复入账 · **N2** 漏扫/回补不齐 = EXIT1（Ban 洗 flake）· **N3** 新鲜（heartbeat 活）reserved 不得被扫（commerce.ts:341 自证条款 · Ban 全扫冒充回收完成）· **N4** 幂等重跑零增量。缺任一 = 合同不成立。
4. **L4 幂等 + L5 收据读法**：稳态二次 reconcile released 增量=0；收据（吞吐/backlog/error rate）≠ SLO ≠ 生产容量 ≠ HA；**EXIT0 ≠ covered** ≠ suite green ≠ PERF_api/PERF_web 填补；UC-017 行/§1.0.2 措辞不动 · coveredCount=8 冻结。
5. **product diff 声明**：本刀拟 **prove-only**（新 proof + script 注册 · 零产品码 diff 意向）；缺陷 → EXIT1 + backlog · **Ban 借刀改 `commerce.ts`**；既有 RAG/路由裁决零触碰。
6. **老 prove 关系**：`uc017:orphan:prove`（O1–O4）零改动；单孤儿 ≠ bulk；Ban 静默改老 proof。
7. **EXIT1 = 诚实保留**：attempts 全记录；Ban retry-to-green · Ban flake 记绿 · Ban 改断言迁就。
8. **隔离与 Ban live**：isolated 真 PG 三层壳 + `assertIsolatedTestTarget` · 零 live 模型 · 不加载 MODEL_API_KEY。
9. docs-only 本 turn；PRE dual PASS ≠ coding ≠ prove ≠ nail；专家对 mw-e2e-ha + mw-rag-route（非隐私域 · 不换 privacy-int）是否成立。

---

*Stub · awaiting expert pre-exec dual · STOP*

---

# PRE-EXEC dual · NHP-017-LOAD-w-01 UC-017 LOAD sweep · mw-rag-route（docs gate only · Ban prove · Ban product edit）

**Reviewed SHA**: `e47101e29e555f9ab8fbe2d37d5525b575e205ee`（`docs(e2e): REQUEST NHP-017-LOAD-w-01 NHP (pre_dual)` · = origin `1948f1b`（`line/y-next-nhp`）的镜像，`git patch-id --stable` 两侧同为 `92304ded5b0d25d932f772d1dce9bb15de45ae37` 完全一致）· 审查基线独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-y-rag-route`（branch `rv/y-rag-route` @ `origin/feat/mysql-schema-skeleton` = `d0dc312f`）
**Scope**: docs gate only——只审 `e47101e2` 引入的 4 个 `.md`（harness / slice / 双审 stubs）；不执行 prove · 不加代码 · 不改产品文件 · 不改 SSOT · 不代签 mw-e2e-ha（其 stub 仍 PENDING · `Verdict` 0 处）。
**环境注记（诚实披露）**: 本审 `git fetch origin` 本 turn 失败（curl 28 连接超时，与 Line X 当次同环境）；审查基于本地 remote-tracking `origin/feat/mysql-schema-skeleton`=`d0dc312f`（= 任务申报 origin tip），祖先关系与 docs-only 在该基线上可复现核验。C-7 要求授权时网络可用复核 tip 未前进。

## 0. 提交合规（先决）

- **祖先**：`e47101e2` 为 `d0dc312f`（origin tip）祖先（`git merge-base --is-ancestor` OK）；其 parent 实测 = `1c4588f952b77e6173acfadf7f3351c311b0cff0`，与 stub/harness/slice 申报 parent tip 逐字一致。
- **docs-only 核验**：`git diff --name-only e47101e2^ e47101e2` 恰 4 个新文件（slice / harness / 双审 stubs），全部在 `ai-docs/` 下，零删除、零代码、零 SSOT、零 `.env*`/secrets、零伪 receipt。`1c4588f9→d0dc312f` 间 Y 三件套**零改动**（后续 commit 均为他线 REQUEST docs：RAG-02 / MOP-01）。
- 提交作者 mw-core（REQUEST 方），非自批；本审在独立 worktree 独立分支复核，非 REQUEST 方。

## 1. 检查表（file:line · 只读核验）

| # | 检查项 | 结论 | 证据 |
|---|--------|------|------|
| 1 | 选行=真 blind（引矩阵原文逐字） | PASS | `non-happy-path-perf-load-case-matrix.md:63` 逐字：`NHP-017-LOAD-w-01 │ 017 │ LOAD │ worker │ 大量孤儿预占回收 │ 回收完成+无漏扣；收据 │ **blind**→**case-only** │ —`——flag=blind→case-only、锚「—」（零执行零旁证）属实；`:61/:62` FAULT/BOUND=partial（锚 `uc017:orphan:prove`）佐证 LOAD 行锚确为「—」而非被挪用 |
| 2 | coverage 双矩阵行逐字 | PASS | `e2e-requirement-coverage-matrix.md:122` §1.0.1 `UC-E2E-017 │ partial │ partial │ partial（sweeper） │ blind │ HTTP/SSE 注入未进 isolated`；`:148` §1.0.2 `UC-E2E-011 / 017 / 019（钱/对账） │ blind │ n/a(非 UI 主) │ blind │ 无并发退款/对账负载收据`——盲区原文逐字在 |
| 3 | 需求源三件套 | PASS | `e2e-scenarios.md:197` = UC-E2E-017 标题【评审必补#4·核心分布式洞】；七类自列「高并发 ✅（对账 vs 重试竞态）· 逃逸 ✅（对账 sweeper）」；验收 A1 额度恢复原值 / A3 无超 TTL 孤儿残留（:206）；`TC-E2E-017-sweeper` :216「造超 TTL 孤儿 reserved，跑 sweeper 断言回收」——需求源齐，无 invent 验收 |
| 4 | 产品接线真实（只读直读） | PASS | `packages/db/src/commerce.ts:341` `sweepExpiredReservations`：状态翻转与 `lease_expires_at < now()` 复核**同一条原子 UPDATE**（行锁下再判，自证 TOCTOU 杜绝；头注释「心跳活着的长会话预留不会被扫」自证条款逐字在）；`:363` `settleOutbox`（`:359` 为其文档注释块起点，引用公平）：`FOR UPDATE OF o SKIP LOCKED` + `INSERT … ON CONFLICT (consumption_id) DO NOTHING`；`:384` `reconcile` = sweep + settleOutbox；`migrations/0001_baseline.sql:139-147` `settlement_ledger` 含 `CONSTRAINT uq_settlement_consumption UNIQUE (consumption_id)`——exactly-once 机制非纸面 |
| 5 | 排除清单合规 | PASS | 018（ADV/PERF/LOAD partial · `post_prove_dual_pass` 钉）、052、025（NEG/FAULT/BOUND/ADV 四面钉）、004、011（NEG/FAULT/BOUND/ADV partial 锚）、014/026（ADV 2026-10-03 nail）、002、001（四面钉）均已在办/FINAL；Y REQUEST 零触碰各行文件 |
| 6 | 与在办线零重叠 | PASS | 全仓 grep `GAP-UC017`/`uc017:nhp-load`/`UC017-LOAD`：仅 Y REQUEST 4 文件命中；`gap id GAP-UC017-LOAD-01` 全仓唯一新认领（无既有钉翻动）；batch2/batch3 文件只涉 UC-017 FAULT/BOUND 面（已 partial），与本刀 LOAD 面不重叠；R4-PERF（:119）/RAG-LOAD（:121）留后刀未洗 |
| 7 | 负载合同 L1–L5 非空壳 | PASS | L1 残留=0（spec A3 逐字）· L2 每 bucket 回补==allocations 和 + availableUnits 净变 0（spec A1）+ 无负 `units_reserved` · L3 释放集互斥 + 总 released == 孤儿数 + 原子 UPDATE 并发行使 · L4 released 增量=0 · L5 吞吐/wall time/backlog 形状/error rate 落 receipt——全部为等值/计数可机检断言，非恒真结构 |
| 8 | NEG N1–N4 真实非装饰 | PASS | N1 并发窗口审计无双放/无双退/无重复入账（违者 EXIT1）· N2 逐孤儿对账漏扫漏补=EXIT1 + Ban 洗 flake · N3 新鲜对照组不得被扫（commerce.ts:341 头注释自证条款 · Ban 全扫冒充）· N4 already-released 重入→0 行 + 无二次副作用——四闸齐备，G7「缺任一=合同不成立」条款在（harness:78） |
| 9 | K 线口径一致性（同一 exactly-once 管道两面） | PASS | K 线（UC-014 webhook ADV）：重放「首 `credited`/次 `already`」+ `markOrderPaidAndCredit` CAS + txn 恰 1 行（`=== 1` 非 ≤1）；Y 线：`already-released 重入→0 行` + ledger UNIQUE ON CONFLICT 恰一次入账——同为「重入零二次副作用 + 等值恰一次」家族，无双放/无双退/无重复入账与 UC-011「无双退」/UC-018「无双放」口径同族；**无口径漂移**（但 settlement 面行使材料缺口见裁决①） |
| 10 | 无 Key 依赖 + 隔离 | PASS | 纯 PG/worker 面（reserve→lease 过期→sweep→settle），零模型调用零 MODEL_API_KEY；沿 `uc017:orphan:prove` 三层壳先例（`package.json:108-109` root→`:raw`→`pnpm -C packages/db prove:uc017-orphan`）+ `assertIsolatedTestTarget`（老 proof 实存、含 2 处） |
| 11 | Pins 原值逐字 | PASS | stub:4 / slice:5 / harness:4 三处 Pins 行逐字相同，且与 K 线 stub（UC-014）Pins 行逐字一致：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503；coveredCount=8 与 SSOT nails（矩阵 UC-018/UC-014/UC-025 行「coveredCount=8 不变」）一脉 |
| 12 | 禁碰清单 | PASS | `e47101e2` 未触碰任何产品码/测试/矩阵/backlog/老 proof/老 harness（`uc-e2e-017-orphan-reservation.md` 实存未动）；矩阵 :63/:122/:148 原文原位；peer stub mw-e2e-ha 仍 PENDING 未被代签 |
| 13 | EXIT 契约诚实 | PASS | EXIT0=PC+L1–L5+N1–N4 全绿 ≠ covered ≠ suite green ≠ 行升格，coveredCount=8 冻结、capacityRepresentative=false、≠HA；EXIT1 触发枚举（双放/漏扫/误扫/幂等破防/对照不齐/造数不可信）+ attempts 全记录 + Ban retry-to-green；PERF_api 显式 blind 保持、PERF_web n/a 不动、Ban 借 LOAD 收据宣 PERF/容量/SLO/HA（harness:87） |

## 2. 口径裁决（写进 Conditions）

**裁决① settlement 面「无重复入账」非空壳化（本审唯一实质发现 · docs 层可修）**
- 产品事实（只读实测）：`commerce_outbox` pending 行**唯一生产点** = `commerce.ts:130`（consume/落账路径 `INSERT … 'settlement_proposed'`）；reserve 路径与 sweep 回收路径**均不投 outbox**。
- 缺口：harness 负载形状登记为「N owners × M orphans（reserve→置 lease 过期）+ C 并发 reconcile + 新鲜对照组」——orphan 只经 reserve→sweep，**全程 0 条 outbox 行**；该形状下 `settleOutbox` 恒 settled=0，N1「无重复入账（settlement_ledger exactly-once）」与 L4「settlement_ledger 无新增」将**空壳为真**，`SKIP LOCKED` 多消费者争用面（REQUEST 自列审查项「Ban 用『单消费者』绕开并发面」）**零行使**。
- 裁决：**接受 REQUEST 意图（sweep+settle 两面同审），但 prove 授权前须二选一**：(a) 负载形状补登记 **settled cohort**——S 笔真 consume/落账（真路径投 `settlement_proposed`）后由 C 并发 reconcile 行使 `settleOutbox` 争用，断言 ledger rows==S 恰一次、无双入、outbox 全 relayed、L4 二次 reconcile ledger 增量=0（参数冻结入 receipt）；或 (b) 显式将 N1/L4 的 settlement 半边 re-scope 出本刀形状并在 harness+receipt 披露（Ban 静默、Ban 保留「settleOutbox exactly-once 真实行使」叙事却空跑）。任一路径下，**prove 运行全程 outbox 0 行而 N1/L4 settlement 半边记绿 = 空壳绿 = 本审 FAIL trigger（追溯生效）**。release 面（L1/L2/L3/N1 双放半边/N2/N3/N4）不受此裁决影响，形状已真实行使。

**裁决② PC 对照与老 prove 关系**：PC 镜像 O2 先跑（bulk 失败须确由负载引起，对照缺失=Ban 假绿）+ O1–O4 零改动、可选回归锚、「O1–O4 绿 ≠ LOAD 收据（单孤儿 ≠ bulk）」——接受，逐字进 Conditions C-5；本裁决无前置分歧。

## 3. Fail-trigger audit（触发即改判本审 FAIL / 追溯）

- 裁决①违反：prove 全程 0 outbox 行而 N1/L4 settlement 半边记绿；或未按 (a)/(b) 任一路径处置而保留「exactly-once 真实行使」表述。
- 任何产品码（`apps/api/src`/`packages/db/src`）/ 测试码 / SSOT（矩阵/backlog/checklist）/ 老 proof（O1–O4）/ 老 harness 改动；**Ban 借刀改 `commerce.ts`**。
- Pins 任一偏离：coveredCount≠8、DELETE≠503、翻 UC-E2E-017 行或 §1.0.2 LOAD_worker 列、`covered` 字样入文、haStatus/releaseEvidence/claimProductionHA/gR45/ms3 偏离。
- 碰 UC-018/052/025/004/011/014/026/002/001 任何行/文件；触碰 RAG/R4/R5/题库域行（RAG-LOAD-01 留后刀被洗 = FAIL）。
- 裸 INSERT 绕过 CAS/bucket 账面造数；「全扫」冒充回收完成；新鲜对照组被扫被洗（N3 破防）。
- EXIT1 记 flake/环境问题；retry-to-green；attempts 隐瞒；改断言迁就结果；借 LOAD 收据宣 PERF_api/PERF_web/生产容量/SLO/HA。
- secrets/`.env*` 入树入 receipt；零 live 模型被突破（MODEL_API_KEY 加载）；自批或代签 mw-e2e-ha（alone ≠ dual）。

## 4. Blockers

**无**（docs gate 层面零 blocker；裁决①为授权前 docs 修正项，走 Condition 非阻塞本 PASS）。非阻塞观察三条：
1. `:359` 指 `settleOutbox` 文档注释块起点（函数体 `:363`）——引用公平，receipt 落地时建议以 `:363` 注函数、`:359` 注契约注释。
2. L4 括注「spec 幂等重发/不超扣」中 A2（同键重试不产生第二条 reserved）属 reserve 幂等闸（`commerce.ts:48-54` ON CONFLICT DO NOTHING + duplicate），已由 UC-017 FAULT/BOUND partial 面（O1–O4）承载；本 LOAD 行 N4/L4 的操作语义（already-released 重入 0 行 / 二次 reconcile 零增量）自洽，**无须**为此扩形状，仅 Ban 把该括注读成新增 A2 cohort 义务。
3. REQUEST「pre-exec 前复核线上 tip 未前进」在本审 turn 不可执行（fetch curl 28）；已核 `1c4588f9→d0dc312f` 间 Y 三件套零改动、后续均为他线 docs——授权时按 C-7 复核。

## 5. Conditions（C-* · prove 授权前及运行期须持续成立）

- **C-1（裁决①）**：prove 授权前，harness 负载形状须按 (a) 补 settled cohort（真 consume/落账投 `settlement_proposed` → C 并发 reconcile 行使 `SKIP LOCKED` 争用 → ledger rows==S 恰一次、outbox 全 relayed、L4 二次 ledger 增量=0）**或** (b) 显式 re-scope + 披露 settlement 半边；prove 全程 0 outbox 行而 settlement 半边记绿 = 空壳绿 = FAIL trigger。参数 N/M/C/S 冻结入 receipt。
- **C-2**：造数诚实——全部经真产品路径（`reserveEntitlement` CAS+幂等闸；如含 settled cohort 则经真落账路径投递）；Ban 裸 INSERT 绕账面；新鲜对照组 lease 严格未来、sweep 后零被扫（N3 逐条断言）。
- **C-3**：断言全等值/计数（== 孤儿数、== 0、=== 1、净变 0、0 行重入），Ban ≤/≥/恒真/空壳；每断言带 DB before/after 或计数快照；Ban 改断言迁就。
- **C-4**：EXIT0 也不翻行——`UC-E2E-017` §1.0.1 行与 §1.0.2 LOAD_worker 列措辞不动、矩阵 :63 行 stays blind→case-only（升格仅经 post-prove dual + coordinator nail）；coveredCount=8；PERF_api 显式 blind / PERF_web n/a 保持；Ban covered / Ban 宣 PERF/容量/SLO/HA。
- **C-5**：老 prove 零改动——`uc017:orphan:prove`（O1–O4）、`harness/uc-e2e-017-orphan-reservation.md`、eval 文档零触碰；可作回归锚，「O1–O4 绿 ≠ LOAD 收据」随行。
- **C-6**：台账与卫生——attempts 逐次记录（EXIT+时间戳+失败类）；Ban retry-to-green/flake 记绿；receipt 落 `.tmp/uc017-perf-load-receipts/` + tracked `ai-docs/delivery/receipts/uc017-perf-load/`（implementer pre-commit runs · not evidence of record，沿 UC-018 先例措辞）；三层隔离壳 + `assertIsolatedTestTarget` 生效；零 live 模型、零 MODEL_API_KEY 加载。
- **C-7**：dual 完整 + tip 复核——mw-e2e-ha 须在其自身 stub 独立签署（本审不代签）；prove 授权时网络可用下复核 `origin/feat/mysql-schema-skeleton` tip（本审基线 `d0dc312f`，fetch 失败已披露）；本 PASS ≠ coding ≠ prove ≠ nail。

## 中文三行摘要

1. `e47101e2`（=origin `1948f1b` 镜像，patch-id 一致）为 docs-only 四文件新增、祖先关系成立、Y 三件套其后零改动；选行 NHP-017-LOAD-w-01 是真 blind（矩阵 :63 锚「—」逐字核验），需求源 `e2e-scenarios.md:197`/A1/A3/TC-017-sweeper 三件套齐，排除 018/052/025/004/011/014/026/002/001 合规、与在办线零重叠，`commerce.ts:341/:363/:384` 接线与 ledger UNIQUE 机制只读直读属实，Pins 原值、禁碰清单全数成立。
2. L1–L5 与 NEG N1–N4 逐条非空壳、与 K 线（UC-014 webhook ADV）already/CAS「恰一次 + 重入零二次副作用」口径同族无漂移；唯一实质发现=**settlement 面行使材料缺口**（outbox 唯一生产点在 consume 落账 `commerce.ts:130`，orphan-only 形状全程 0 outbox 行 → N1/L4 settlement 半边有空壳绿风险）——裁决①：授权前补 settled cohort 或显式 re-scope 披露，空壳绿=FAIL trigger。
3. 无 Blocker，PASS 附 Conditions C-1..C-7；PERF_api 盲保持、EXIT0≠covered、coveredCount=8 冻结、O1–O4 零改动、Ban 借刀改 `commerce.ts`；prove 待协调方授权 + mw-e2e-ha 独立签署（alone ≠ dual，不代签）。

Verdict: PASS

---

# POST-PROVE dual · NHP-017-LOAD-w-01 UC-017 LOAD sweep · mw-rag-route（coding `dd471a74` 补席 · alone ≠ dual · 不代签 peer mw-e2e-ha）

**Reviewed base**: `a7638debcea649c5b75f17b28bdf091cebdd9fc2`（`origin/feat/mysql-schema-skeleton` tip · 本 turn `git fetch origin` 成功复核 · 已含 Y coding：`dd471a74` 与 `a7638deb` 之间恰 4 文件 diff 且全为 ai-docs（MOP-01 slice/harness/双审 REQUEST），**9 文件包 blob 逐一 `git rev-parse <commit>:<path>` 比对全 SAME**）· 审查独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-yp-rag-route`（branch `rv/yp-rag-route` · 本审写操作仅在此）
**Scope**: POST-PROVE dual（rag-route 席）——包完整性 + 本方 C-1 裁决（settled cohort 路由 (a)）+ fresh re-run evidence of record + 本方 C-1..C-7 逐条条件裁决。peer mw-e2e-ha 的 POST-PROVE 审在并行，本审看不到也不需要看，**不代签**。
**Author of coding**: mw-core `dd471a74`（parent `4804c3dc`）· PRE-EXEC 双审 binding：mw-e2e-ha `1db7199a` + mw-rag-route `85a5e945`（本 file 上段）。

## 0. 包完整性（恰 9 文件 · 零产品码）

- `git diff-tree -r dd471a74` 恰 **9 文件**：root `package.json`(+2)、`packages/db/package.json`(+1)、`scripts/run-e2e-isolated.mjs`(+9/−2 · isolatedCommand/isolatedReceiptSources/known-targets allowlist/migrate-list 四处注册)、新 proof `packages/db/test/uc-e2e-017-nhp-load.proof.ts`(+453)、receipts 5 文件（本 receipt + README + attempt-ledger + 2 JSON 镜像）。
- **产品码零 diff**：9 文件中零 `packages/db/src`/`packages/db/migrations`/`apps` 触碰；`git diff 4804c3dc a7638deb -- packages/db/src apps packages/db/migrations` 为空；SSOT（coverage matrix / NHP matrix / e2e-scenarios / backlog / checklist）零触碰；老 proof O1–O4 与老 harness `uc-e2e-017-orphan-reservation.md` 零改动；`commerce.ts` 零触碰（Ban 借刀遵守）。
- **造数路径真 `reserveEntitlement`（proof 实读）**：消费生命周期全经真产品路径——reserve（proof :158 PC / :190 orphans / :197 fresh / :237 settled）· confirm（:240）· renewReservationLease（:203）· releaseConsumption（:422）。唯一裸 INSERT = `seedBucket` 桶 provision 夹具（:74-77），头注释 :14 显式披露、沿 `uc-e2e-017-orphan-reservation.proof.ts:30` 先例逐款同构；孤儿化 = 仅孤儿行 `lease_expires_at` 时移（:221-223），账面字段零触碰。**Ban 裸 INSERT 绕账面遵守**。

## 1. C-1 裁决（本审核心 · 裁决① 路由 (a) settled cohort）——**兑现成立**

三要素逐一实证（产品码只读直读 + proof 实读 + 本审独立复跑）：

| 要素 | 实证 | 结论 |
|------|------|------|
| outbox 行经真结算产生 | `commerce.ts:130-131` `confirmConsumption` 同事务 `INSERT … 'settlement_proposed'`（全仓唯一生产点）；proof S=10 真 `reserveEntitlement`→真 `confirmConsumption`（:234-243）后前置闸 `outbox pending === 10`（:244-248）——**0 outbox 行该闸即红，settlement 半边结构上不可能空壳绿** | ✓ 真产生 |
| `settleOutbox` 被并发行使 | `commerce.ts:363` `settleOutbox`（`:370` `FOR UPDATE OF o SKIP LOCKED`）；`reconcile`（:384）:386 调用之 → proof Wave1 `runConcurrentReconcileWave`（:100-131）C=10 并发 worker × allOwners(含 settleOwner) 逐轮真实行使 SKIP LOCKED 争用 | ✓ 并发行使 |
| ledger exactly-once 断言真实 | DB 机制实体：`migrations/0001_baseline.sql:146` `CONSTRAINT uq_settlement_consumption UNIQUE (consumption_id)` + `commerce.ts:377` `ON CONFLICT (consumption_id) DO NOTHING`；断言链（proof :329-345）ledger 行===distinct consumption_id===10 ∧ Σunits===10.0 ∧ Σworker settled===10 ∧ outbox pending===0∧relayed===10 ∧ ledger 集==settled cohort 集（set 等值）——若 settleOutbox 零行使则 ledger===0 即红、若双入则 rows≠distinct 即红，**非空壳绿** | ✓ 真实非空壳 |

**Fail-trigger 未触发**：本审独立复跑证 prove 全程 outbox 有真实行（造数后 pending===10 → 全 relayed 10/10），「0 outbox 行而 settlement 半边记绿」未发生；路由 (a) 实质处置完成，(b) 无需。参数 **N=20×M=5(=100)·C=10·S=10·F=20** 冻结入 receipt（frozenParams 实读核对一致）。

## 2. fresh re-run（evidence of record · 恰好一次 · 禁重试遵守）

- **CMD**: `MW_GIT_SHA=a7638debcea649c5b75f17b28bdf091cebdd9fc2 env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm uc017:nhp-load:prove`（worktree `rv/yp-rag-route` @ `a7638deb` · `pnpm install --frozen-lockfile` 后 tracked 树零改动）
- **EXIT=0**（恰一次执行 · 零重试）· **45 PASS / 0 FAIL**
- 隔离生效：fresh PG container `meetwise-e2e-72016-1791357810954` · nonce tripwire `assertIsolatedTestTarget` · migrations applied=140 · image `pgvector/pgvector:pg16` digest `7b822b0aac60…da199b90a` 本机同 digest 无 pull · 零 live 模型零 MODEL_API_KEY · R5-MARKED-RED / ISO_STACK NOTE 原文在位（隔离叙述 ≠ stack truth）
- 关键行（本审 log 实录）：w1 `released=100 settled=10 backlog=0 wall=250ms` · w2 `released=0 settled=0 backlog=0` · `errors=0/840` · settled cohort `outbox pending === 10` · N1 六断言全 PASS · L4/N4 全 PASS
- 收据：`.tmp/uc017-perf-load-receipts/uc017-nhp-load-attempt001.json`（落点正确 · gitSha=a7638deb · overall=PASS · backlogShape [(1,100,10),(2,0,0)]）· log 存 `.tmp/rv-rag-route/rv-rerun-nhp-load.log` + EXIT `.tmp/rv-rag-route/rv-rerun-exit.txt`。实现方两 attempt 收据维持 **pre-commit runs · not evidence of record** 口径。

## 3. 断言抽查（N1 / L4 / C-3 等值区分力）

- **N1**：无双放 = distinct swept===孤儿数 ∧ set 等值（:323）；无双退 = 负 `units_reserved` 行===0 ∧ Σ余留 reserved===fresh holdout 20.0（:324-328）；无重复入账 = ledger 行===distinct consumption_id===10（:329-334）——均计数/等值机检，违任一即红。✓
- **L4（worker 侧表述）**：二次 C=10 并发 reconcile released 增量===0 ∧ settled 增量===0 ∧ ledger 仍===10 ∧ outbox pending===0∧relayed 不变（:389-393）；N4 逐 call 420 次（10 workers×21 owners×2 轮）`staleReleased===0 ∧ settled===0`（:396-397）。按 e2e C-5 措辞收 worker 侧幂等边界，**未宣 A2 用户重试面被本刀覆盖**（receipt §L4 自评如实）。✓
- **C-3（等值断言非恒真 · 有区分力）**：`sweptSetEqualsOrphans`（:288-293）与 `ledgerSetEquals`（:343-345）均为 size+membership 双重比对——fresh 行被误扫或 ledger 混入外来 id 必红；全 45 断言 ===/计数/set 等值，无 ≤/≥/恒真；attempt#1→#2 断言集逐字相同（本审 blob 比对 SAME 佐证），Ban 改断言迁就遵守。✓

## 4. 条件裁决（本方 PRE-EXEC C-1..C-7 逐条）

| Condition | 裁决 | 依据 |
|-----------|------|------|
| **C-1**（裁决① settled cohort 路由） | **兑现（路由 (a)）** | §1 三要素全实证；outbox 全程有真实行；参数 N/M/C/S 冻结入 receipt；FAIL trigger 未触发。**残留**：harness `:63` 负载形状行（及 §L4/N1 形状句）仍为孤儿-only commissioned 形状、未随 (a) 增补 settled cohort 登记——登记实体在 proof 头注释 :15-17 + receipt §C-1 + 冻结参数，实质义务全清，残留为文档同步项 → 转 **C-RV-1**（非 Blocker 非改判） |
| **C-2**（造数诚实） | **兑现** | §0 造数路径实证；唯一 fixture INSERT=桶 provision 沿 O1–O4 先例并披露；fresh lease 严格未来零触碰（N3 逐条断言） |
| **C-3**（断言等值/计数） | **兑现** | §3 区分力抽查；无恒真；断言集两 attempt 逐字相同 |
| **C-4**（EXIT0 不翻行） | **兑现** | SSOT 零触碰（diff-tree 空举证）· coveredCount=8 · 矩阵 :63 stays blind→case-only · PERF_api 显式 blind 不动 · proof/receipt/log 三处 Non-claims 原文在位 |
| **C-5**（老 prove 零改动） | **兑现** | O1–O4 proof、老 harness、eval 文档零触碰（不在 9 文件、harness git log 末次=e47101e2） |
| **C-6**（台账与卫生） | **兑现** | attempts 全录（含 attempt#1 收据落点接线缺陷诚实披露 + attempt#2=shipped code 主证；attempt#1 本已全绿无 green 追逐 · 路径常量修复零断言改动——本审独立复跑以 shipped 代码再证 EXIT=0+落点正确）；三层壳+nonce+migrations=140；零 secrets 入树入 receipt |
| **C-7**（dual 完整 + tip 复核） | **本席侧兑现 · dual 半边留白** | 本 turn fetch 成功：origin tip=`a7638deb`=本审 base（复核成立）；PRE 双审 binding 在史（1db7199a + 85a5e945）；POST-PROVE peer mw-e2e-ha 在并行，**本审不代签**，dual 生效须其独立签署 + 协调方 AUTHORIZE |

## 5. Blockers

**无**（0 Blocker）。

## 6. Conditions（本 POST-PROVE 段新增/持续）

- **C-RV-1**（C-1 残留 · exec/nail 授权前置）：harness `gap-uc017-load-sweep-nhp.md` `:63` 负载形状行及 §L4/N1 形状句须增补 settled cohort 登记（S=10 真 reserve→confirm 投 `settlement_proposed` → C=10 并发行使 `settleOutbox` → ledger exactly-once 断言；参数冻结指向 receipt）——scoped 行级修订、零越面、按 house 规则 dual ack；不重开 prove。
- **C-RV-2**（Pins/Non-claims 持续）：EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ UC-E2E-017 行升格 ≠ PERF_api/PERF_web ≠ 生产容量 ≠ SLO ≠ HA；coveredCount=8 · releaseEvidence=false · haStatus=NOT_HA · claimProductionHA=false · gR45Closed=true · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 持续；UC-017 §1.0.1/§1.0.2 措辞不动。
- **C-RV-3**（alone ≠ dual）：本审仅 rag-route 席；不代签 mw-e2e-ha；PASS ≠ 授权 coding/prove/live/cutover/nail ≠ AUTHORIZE；dual 结论以双方独立 PASS + 协调方裁定为准。
- **C-RV-4**（Ban 项持续）：`commerce.ts`/产品码零触碰（Ban 借刀）、老 proof O1–O4 零改动、Ban push、本审零 retry（re-run 恰一次）持续有效。

## 中文三行摘要

1. 包完整性成立：`dd471a74` 恰 9 文件、与 origin tip `a7638deb` 9 blob 全 SAME、零产品码零 SSOT 零老 proof 触碰、造数全经真 `reserveEntitlement`/`confirmConsumption` 等真路径（唯一裸 INSERT=桶 provision 夹具沿 O1–O4 先例并披露）。
2. C-1 裁决=**兑现**：路由 (a) settled cohort 三要素（outbox 经 `commerce.ts:130` 真结算产生、`settleOutbox`（:363 SKIP LOCKED）经 `reconcile` :386 被 C=10 并发行使、ledger UNIQUE+ON CONFLICT exactly-once 断言真实非空壳）全实证，0-outbox 空壳绿 FAIL trigger 未触发；fresh re-run 恰一次 EXIT=0（45 PASS/0 FAIL · w1 100/10/backlog0 · errors 0/840）为本席 evidence of record。
3. 唯一残留=harness `:63` 负载形状行未随 (a) 增补 settled cohort 登记（实体登记在 proof+receipt）→ C-RV-1 授权前置 scoped 修订；0 Blocker，本方 C-1..C-7 全数兑现（C-7 dual 半边不代签 peer mw-e2e-ha）；EXIT0≠covered≠suite green≠行升格，coveredCount=8 冻结，禁 push。

Verdict: PASS
