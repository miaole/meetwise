# Prove receipt — **NHP-017-LOAD-w-01 · UC-017 LOAD 大量孤儿预占回收**（Line Y · coding+prove 阶段）

**Status**: prove 完成 · **implementer pre-commit runs · not evidence of record**（沿 UC-018 PERF/LOAD 先例措辞 · evidence of record = post-prove 双审独立复跑，另行另派）
**Date**: 2026-10-07
**Knife**: `ai-docs/delivery/harness/gap-uc017-load-sweep-nhp.md` · slice `gap-uc017-load-sweep-nhp.slice.md` · gap id **GAP-UC017-LOAD-01**
**Code SHA**: `4804c3dc54e696b5f7af17574d21e1bbe68482a4`（branch `line/y-next-nhp` · worktree pre-commit 态 · REQUEST `1948f1b` 同补丁 drop 落 origin tip `4804c3dc` 后）
**Pins（原值 · 零漂移）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503

## CMD 与 attempt 台账（全录）

**CMD**: `MW_GIT_SHA=<4804c3dc…> env -u MODEL_API_KEY -u DASHSCOPE_API_KEY -u DASHSCOPE_COMPAT_BASE_URL pnpm uc017:nhp-load:prove`

| # | EXIT | 断言 | 结果 |
|---|------|------|------|
| 1 | **0** | 45 PASS / 0 FAIL | waves: w1 released=100 settled=10 backlog=0 406ms · w2 0/0 252ms · errors=0/840。**实现方接线缺陷披露（非产品非断言）**：收据落点路径常量少一级 → 误落 `packages/.tmp/`（违 C-6 落点）；处置 = 收据原样搬迁保留 + 修复路径常量（零断言改动）→ attempt#2 以 shipped code 复跑 |
| 2 | **0** | 45 PASS / 0 FAIL | waves: w1 released=100 settled=10 backlog=0 245ms · w2 0/0 135ms · errors=0/840 · 收据落点正确。**本 attempt = 提交代码原样运行（EXIT0 主证）** |

- attempts 全录：`.tmp/uc017-perf-load-receipts/`（attempt001/002.json）+ tracked 镜像 `ai-docs/delivery/receipts/uc017-perf-load/`（含 `attempt-ledger.txt`）· `.tmp/yc-progress.log` 逐里程碑。
- Ban retry-to-green / Ban flake 记绿 / Ban 改断言迁就：**attempt#1 本已全绿，无 green 追逐**；#2 复跑唯一目的是以提交代码行使修复后的收据落点（C-6），两次运行断言集逐字相同。
- 隔离：三层壳 `pnpm uc017:nhp-load:prove` → `scripts/run-e2e-isolated.mjs`（fresh PG container `meetwise-e2e-<pid>-<ts>` · nonce tripwire `assertIsolatedTestTarget` · migrations applied=140）→ `pnpm -C packages/db prove:uc017-nhp-load` → `packages/db/test/uc-e2e-017-nhp-load.proof.ts`。E2E_PG_IMAGE=`pgvector/pgvector:pg16` digest `sha256:7b822b0aac60…da199b90a`（本机 mirror tag 同 digest 比对，无 pull）。零 live 模型 · 零 MODEL_API_KEY 加载（env -u 三键）。

## 冻结参数（receipt 登记 · harness :63）

**N=20 owners × M=5 orphans/owner（=100 orphans）· C=10 并发 reconcile workers · S=10 settled cohort · F=20 fresh control（1/owner）** · orphan/fresh/settled units=1.00 · 桶 TTL=now()+300 days（**C-4 前提**：run 期无桶 `expires_at` 边界穿越——run 实测 wall <1s ≪ 300d 余量）· lease heartbeat（真 `renewReservationLease`）=1800s · drain MAX_WAVES=10（实际 2 轮稳态）。UC-017 PERF_api 面：**不适用 → 显式 blind 不动**（本刀 LOAD_worker 专属，Ban 借收据宣 PERF/SLO/容量/HA）。

## rag-route C-1（裁决①）选择：**路由 (a) settled cohort（非 re-scope）**

- 真落账路径造已结算 cohort：S=10 经真 `reserveEntitlement` → 真 `confirmConsumption`（outbox `settlement_proposed` 唯一生产点 `commerce.ts:130`）→ prove 全程 `commerce_outbox` 有真实行（造数后 pending===10）→ Wave1 C=10 并发 reconcile 行使 `settleOutbox`（**`commerce.ts:363`** · `FOR UPDATE OF o SKIP LOCKED`）争用 → ledger exactly-once 断言全过。
- 断言落点：outbox pending===10 前置 → N1 ledger 行===distinct consumption_id===S(10) ∧ Σworker settled===10 ∧ outbox 全 relayed(pending=0/relayed=10) ∧ ledger 集==settled cohort 集（set 等值）→ L4 二次 reconcile ledger 增量===0 ∧ settled 增量===0。**settlement 半边非空壳绿**（0 outbox 行记绿 = FAIL trigger 未触发）。
- 参数 S=10 与 N/M/C 一并冻结（上节）。

## 逐类结果（PC + L1–L5 + N1–N4 · attempt#2 · 45/45 PASS）

| 类 | 断言（等值/计数 · rag C-3 口径） | 结果 |
|----|--------------------------------|------|
| **PC** | 单 owner 单孤儿单 sweep（镜像 O2 · bulk 前置闸）：reserve→reserved · avail 5→4 · staleReleased===1 · 回补恰 +1.0（4→5）· 生命周期净变 0（post===基线 5.0）· 终态 released · **gate 全绿** | 7/7 PASS |
| **造数** | 100 orphans + 20 fresh 全经真 `reserveEntitlement`（0 错误）· 造数后逐 owner avail===0 ∧ units_reserved===6.0 · 孤儿化仅孤儿行 lease 时移（计数===100）· fresh lease 严格未来 | 5/5 PASS |
| **settled cohort** | 真 reserve→confirm 0 错误 · outbox pending===10 · units_consumed===10.0 ∧ units_reserved===0 · settle 前 ledger 行===0 | 3/3 PASS |
| **L1 回收完成**（spec A3） | drain 稳态（第 2 轮 released===0）· 全库「reserved ∧ lease 过期」残留===0 · 逐孤儿终态 100/100 released | 3/3 PASS |
| **L3 并发互斥** | Σworker reported released===100 ∧ distinct swept===100（每 consumption 恰一次）· 释放集==孤儿集（set 等值） | 3/3 PASS |
| **L2 无漏扣**（spec A1） | 逐 owner avail 回补恰等（0→5.0=total−1 fresh holdout）· units_reserved 6.0→1.0（逐 owner 全量）· 全库无负 units_reserved（行===0） | 3/3 PASS |
| **L4 幂等**（**worker 侧幂等措辞** · e2e C-5） | 二次 reconcile released 增量===0 ∧ settled 增量===0 · ledger 无新增（仍===10）· outbox 无新增（pending===0 ∧ relayed 不变）。**不宣 A2 用户重试面已被本刀覆盖**（A2 由 O1–O4/FAULT/BOUND partial 承载） | 4/4 PASS |
| **L5 收据** | drain waves=2 · wall=382.031ms · throughput=261.76 orphans/s · backlog 形状 [(1,100,10),(2,0,0)] · errorRate=0（0/840 calls）→ JSON 收据。**≠ 线上 SLO ≠ 生产容量 ≠ HA ≠ PERF_api/PERF_web** | PASS |
| **N1 无双放/无双退/无重复入账** | distinct swept===孤儿数 ∧ set 等值（无双放）· 负 units_reserved 行===0 ∧ Σ余留 reserved===fresh holdout 20.0（无双退）· ledger 行===distinct consumption_id===10 ∧ Σunits===10.0 ∧ Σworker settled===10 ∧ outbox 全 relayed ∧ ledger 集==cohort 集（无重复入账 · SKIP LOCKED 多消费者恰一次） | 6/6 PASS |
| **N2 漏扫漏补=EXIT1** | 残留 reserved∧过期===0（漏扫===0）· units_reserved≠1.0 的 owner 数===0（回补不齐===0） | 2/2 PASS |
| **N3 误扫活会话=EXIT1** | fresh 20/20 仍 reserved · fresh 中 released===0（DB 面）· fresh∩swept===0（worker 面）· fresh lease 严格未来（真心跳维活）· swept 集==孤儿集（**Ban 全扫冒充** · set 等值） | 5/5 PASS |
| **N4 重入 0 行** | Wave2 全部 420 次 reconcile（10 workers×21 owners×2 轮）逐 call staleReleased===0 ∧ settled===0 · 账面零漂移（逐 owner units_reserved 相等）· 稳态残留仍===0 | 3/3 PASS |
| **收尾** | fresh cohort 真 `releaseConsumption` → 逐 owner avail===units_total（**全 run 净变 0 · A1 等值**） | 1/1 PASS |

## Conditions 逐条自评（PRE-EXEC 双审 binding）

| Condition | 自评 |
|-----------|------|
| e2e **C1**（`settleOutbox` 引 `:363`） | ✓ 收据/proof 均引 `commerce.ts:363`（函数声明行）；`:130` 指 outbox 生产点（rag 审同款）；未回改 REQUEST |
| e2e **C2**（UC-028 禁碰） | ✓ 本刀 diff 零触 UC-028 行/文件/Line X 在办文件（git status 全集见「触碰面」节） |
| e2e **C3**（对照组同规造数） | ✓ fresh 走真 `reserveEntitlement` + 真 `renewReservationLease`（1800s）维活；与主组同规无双标 |
| e2e **C4**（L2 前提冻结） | ✓ 桶 TTL=300d 入冻结参数；run wall<1s 无 `expires_at` 穿越；L2 断言按此前提表述 |
| e2e **C5**（L4 措辞边界） | ✓ 按 **worker 侧幂等**（sweep+settle 重跑零增量）表述；不宣 A2 用户重试面 |
| e2e/rag **C6**（attempts 全录 + 收据口径） | ✓ 两 attempt 全录（含 attempt#1 接线缺陷披露）· `.tmp/` + tracked 镜像 · implementer 收据 ≠ evidence of record · Ban retry-to-green 遵守（无 green 追逐） |
| e2e **C7**（alone≠dual） | ✓ 本阶段仅实现方执行；post-prove 双审由协调方另派，未自批未代签 |
| rag **C-1**（裁决①） | ✓ **路由 (a) settled cohort**：S=10 真路径投 outbox → C 并发行使 SKIP LOCKED → exactly-once 断言；prove 全程 outbox 有真实行，settlement 半边非空壳绿；N/M/C/S 冻结入 receipt |
| rag **C-2**（造数诚实） | ✓ 消费生命周期全经真产品路径（reserve/confirm/release/renew）；Ban 裸 INSERT 绕账面（唯一 fixture INSERT=桶 provision，沿 O1–O4 先例）；fresh lease 严格未来 · sweep 后零被扫（N3 逐条断言） |
| rag **C-3**（断言等值/计数） | ✓ 45 断言全为 ===/set 等值/计数；无 ≤/≥/恒真；逐断言带 DB before/after 或计数快照；Ban 改断言（attempt#1→#2 断言集逐字相同） |
| rag **C-4**（EXIT0 不翻行） | ✓ UC-E2E-017 §1.0.1 行与 §1.0.2 LOAD_worker 列零触碰 · 矩阵 :63 stays blind→case-only · coveredCount=8 · PERF_api 显式 blind 不动 · Ban covered/PERF/容量/SLO/HA |
| rag **C-5**（老 prove 零改动） | ✓ `uc017:orphan:prove`（O1–O4）、`harness/uc-e2e-017-orphan-reservation.md`、eval 文档零触碰（git status 佐证） |
| rag **C-6**（台账与卫生） | ✓ attempts 全录 · 三层壳 + `assertIsolatedTestTarget` 生效 · 零 live 模型零 MODEL_API_KEY · `.tmp/uc017-perf-load-receipts/` + tracked 镜像 |
| rag **C-7**（dual 完整 + tip 复核） | ✓ PRE 双审 BOTH PASS（mw-e2e-ha 1db7199a + mw-rag-route 85a5e945）· `git fetch origin` 本 turn 失败（curl 28 连接超时，环境同 rag 审披露）——本阶段基于本地 `origin/feat/mysql-schema-skeleton`=`4804c3dc`（REQUEST 落 tip 复核在 fetch 成功的上一 turn 已由 rebase 实证）；post-prove 双审另派 |

## 触碰面（diff-face 全集）

- `package.json`（root）：`uc017:nhp-load:prove` / `:raw` 两 script 注册（+2 行）
- `packages/db/package.json`：`prove:uc017-nhp-load` script（+1 行）
- `scripts/run-e2e-isolated.mjs`：`isolatedCommand` 分支 + `isolatedReceiptSources` + known-targets allowlist + migrate-list 四处 `uc017:nhp-load:prove:raw` 注册（+9/−0 · 三层壳接线，非产品逻辑）
- `packages/db/test/uc-e2e-017-nhp-load.proof.ts`：新 proof 文件（+453）
- `ai-docs/delivery/receipts/uc017-perf-load/`（README + attempt-ledger + 2 JSON 镜像）+ 本 receipt
- **零产品码**（`apps/api/src`/`packages/db/src` 零 diff）· **零 SSOT**（矩阵/backlog/checklist）· **零老 proof/harness 改动** · UC-018/052/025/004/011/014/026/002/001 零触碰 · **`commerce.ts` 零触碰（Ban 借刀改产品码遵守）**

## Non-claims

Not covered · not suite green · not live · EXIT0 ≠ covered ≠ e2e:isolated suite green ≠ UC-E2E-017 行升格（§1.0.1/§1.0.2 措辞不动）≠ PERF_api/PERF_web 面填补 ≠ 生产容量 ≠ SLO ≠ HA · capacityRepresentative=false · coveredCount=8 · releaseEvidence=false · haStatus=NOT_HA · 本 receipt 为 implementer pre-commit run，**非 evidence of record**（evidence of record = post-prove 双审独立复跑）。**STOP——post-prove 双审（mw-e2e-ha + mw-rag-route）由协调方另派，禁自批。**
