# REQUEST — **PRIV4-B · GAP-PRIV-04 残余面侦察+收口（0091 残余拆解 + P0-CB-01 快照表 sink 候选裁决规则）** · pre-exec · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-privacy-int`
**Knife**: `harness/priv04b-residual.md` · `priv04b-residual.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `9265e4d8` / `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-priv04b-residual-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

## Pins（原值全抄 · retained 写死）

| Pin | 值 |
|-----|-----|
| haStatus | **NOT_HA** |
| releaseEvidence | **false** |
| claimProductionHA | **false** |
| gR45Closed | **true** |
| coveredCount | **8** |
| ms3EqualsR4Closed | **false** |
| Stack | **PG-retained** |
| public DELETE | **503**（冻结 · GAP-PRIV-02 `:58` · 协调项 (b) 用户闸） |
| backlog `:60` GAP-PRIV-04 | **OPEN**（行语义按原文判定不变 · 残余原文如实保留） |
| backlog `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION | **OPEN**（stub≠cloud · `cloudVendorDeleted=false` · NB-3） |
| backlog `:78` GAP-PROD-02 | **OPEN**（P0-CB-01 属其面 · 本刀只裁规则不建表） |
| UC-052 | **partial**（≠ covered ≠ DELETE 开放） |
| INT-TRANSCRIPT-01 | **blocked**（checklist `:176` 两道不可拆 release gate · 用户闸 · Ban 预授权六门任一） |
| `:60` 行翻行 | **Ban**（SSOT 协调面 · 非本刀） |

## Scope（待审 · privacy 视角）

docs-only REQUEST：①「仍 ≠ 0091 可写/对齐」残余拆解——判定本地 coding 可推进面=空集（DB 主链已由 0093/0125/0141 闭合至本地可证边界；残余子面全落用户闸/协调闸：生产 issuer key/JWS=cutover 门 1、公开 DELETE=门 4、INT sink='vector' 作用域键=门 3、`:60` 翻行=SSOT 协调面、UC-052、`:64`）；②协调项 (a) P0-CB-01 快照表（候选·未建）sink 候选裁决规则 R1–R6（R1 逐列数据分类入域判据 · R2 0125/0141 机制全对形——immutable 约束 app_role 写路径、擦除走特权租约事务消解与 subject-erase 互斥 · R3 DDL 与裁决同卷 Ban 未登记落表 · R4 B 端投影引用失效不删 B 端留存 · R5 沿 AR 诚实口径 · R6 编号顺延 Ban 抢号）——本刀只裁规则不建表，规则 ≠ 个案裁决。待审要点：拆解逐面归属是否漏面/错闸 · R1 判据操作化是否可执行（逐列清单必备附件）· R2 与 0125/0141/0091 先例机制对形性 · R3 与 sink inventory §6 同变更维护规则一致性 · R4 多主体边界 · Ban 面完备性 · 锚 file:line+blob 在位性。

## Ban（待审确认）

Ban coding · Ban prove 执行 · Ban 建表 / sink CHECK 改动 / 任何 migration · **Ban 碰 DELETE=503** · **Ban 动 INT-TRANSCRIPT-01 面 / Ban 预授权六门任一** · Ban 动 0091/0093/0125/0129/0141 语义 · **Ban 改共享 SSOT**（backlog/checklist/matrix/queue/audit 本体）· Ban 借 AR `:64` 证据/状态 · Ban 洗 OPEN 钉 · Ban count-as-erased · Ban 删 qbank/共享语料 · Ban 假造 INT 作用域键 · Ban UC-052 flip · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban buy cloud · Ban force-push · Ban push 主线/共享分支 · Ban self-approve（alone ≠ dual）· Ban self-nail。

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts、未读 `.env*`；docs gate ≠ 规则生效 ≠ EXEC 授权。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
