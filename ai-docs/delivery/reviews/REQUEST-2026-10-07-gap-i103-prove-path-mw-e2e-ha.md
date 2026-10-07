# REQUEST — **#103 `chore/mem00-int00-prove-path` INFLIGHT 落地刀（INT/MEM control plane honesty）** · pre dual · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-i103-prove-path.md` · `gap-i103-prove-path.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `50423a6fa` / `50423a6fa6f18d4c9d193611cf84c4702e067208`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-i103-prove-path-mw-privacy-int.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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
| public DELETE | **503**（冻结 · GAP-PRIV-02 backlog `:58`） |
| backlog `:58`/`:59`/`:60`/`:64` | **OPEN** 原样（503 冻结 · GAP-PRIV-03 · GAP-PRIV-04 · EXTERNAL-SINK-RETENTION） |
| backlog `:101` BUG-CP-CLAIM | **open**（#103 正防此类 · #103 落地不自动关行） |
| UC-052 | **partial**（≠ covered ≠ 控制面已关） |
| INT-TRANSCRIPT-00 / 01 | **◐ / blocked**（checklist `:173`「这**不**授权 `INT-TRANSCRIPT-01` 生产 cutover」） |
| `INT-P0-RAW-QUEUE` | **open**（legacy `/turn` plaintext payload 不可洗） |
| INT01 harness §4 `:121` | **「属 #103 INFLIGHT、合入后方可称已存在」原样**（改回属合入后后续 nail · 本刀零触碰） |
| coveredCount 扩面 | **无**（本刀零 matrix edit · covered 不动） |

## Scope（待审 · e2e/HA/隔离壳视角）

docs-only REQUEST：#103 INFLIGHT 落地立卷。待审要点：**隔离壳契约**（isolated 5 步一律经 `scripts/run-e2e-isolated.mjs <target>:raw`——临时独立 cluster · 只删自建 `meetwise-e2e-*` 容器 · 绝不触碰开发库 · BUG-FAKE-R5 fail-closed 头注纪律 · Ban 绕壳直连 · Ban 本地 compose Postgres 捷径 · Ban `pnpm db:up`）· **CMD+EXIT 语义**（portable 全绿 **且** isolated 全绿才 EXIT0；任一 failed **或** blocked → EXIT≠0；缺 Docker → isolated 记 `blocked:docker_daemon_missing` 且**全模式必须 EXIT≠0**——blocked ≠ pass；`--portable-only` 降级模式 isolated 记 `skipped:portable_only` 且 skip ≠ pass、回执明记——D2 裁决点）· **attempts 全记录**（每步逐条入回执：序号 · Asia/Shanghai 时间 · code SHA · EXIT · reason；失败与成功同列入账 · Ban retry-to-green `:68` 先例 · 单次 attempt 窗口）· **回执形态**（`.tmp/mem00-int00-prove-path/*` gitignored · `class=local_untrusted_mem00_int00_prove_path_receipt` · `releaseEvidence=false`/`controlPlaneClosed=false`/`intTranscript01ProductionWrite=false`/`publicDeleteStill503Required=true` 常量 · honesty 注记内嵌）· **gate 静态门**（`:gate` 无 DB 无 Docker 无 `.env` · 继承草稿 11 条断言为基础 · 增减属 D3 裁决点）· **草稿继承 D1**（引用面在当前 tip `50423a6fa` 已亲证存活：portable 5 + isolated 5 `:raw` + `run-e2e-isolated.mjs` 位置参数契约 `process.argv[2]`；SSOT hunks 弃用）· **HA 语义**（NOT_HA / claimProductionHA=false 不动 · 本 prove-path 不产生任何 HA/发布证据 · `releaseEvidence=false` 恒定）· **EXIT0 ≠** 控制面关 ≠ 00/01 关闭 ≠ MEM 关闭 ≠ DELETE 开放 ≠ `:60`/`:64` closed ≠ UC-052 covered ≠ HA ≠ `releaseEvidence=true` ≠ suite green（Line C 口径）· 零 live。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · Ban `pnpm db:up` · Ban 绕隔离壳直连 · **Ban 翻 SSOT 行**（covered flip · coveredCount 变动 · `:24`/`:45` INFLIGHT→landed 自行迁移 · exec 只碰 `scripts/*`+`package.json` · SSOT 留 nail 阶段）· **Ban 借刀动 INT01 立卷合同**（`:121`/`:163` 零触碰）· **Ban 借刀动 PRIV4/AR 产物**（`:60`/`:64`）· Ban 碰 #104 lease-takeover 面 · **禁碰已占用行**（backlog `:58`/`:59`/`:60`/`:64`/`:68`/`:100`/`:101`/`:102`/`:123` · checklist `:154`/`:167`-`:176` · UC-052 partial · `INT-P0-RAW-QUEUE` open · 七类 TC planned/unmapped）· **Ban 宣称控制面已关** · Ban 公开 DELETE 开放（503 冻结）· Ban blocked/skipped 写成 pass · Ban 历史回执当当前通过 · Ban retry-to-green · Ban 单 attempt 窗外重跑 · Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push** · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE dual BOTH PASS + 协调方 AUTHORIZE。

*Stub · awaiting expert pre dual · STOP*
