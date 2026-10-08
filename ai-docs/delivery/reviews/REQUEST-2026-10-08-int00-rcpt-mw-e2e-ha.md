# REQUEST — **INT00-A · INT-TRANSCRIPT-00 四条已接线 prove 单窗回执收尾刀** · pre-exec dual · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/int00-prove-receipt.md` · `int00-prove-receipt.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `9265e4d8` / `9265e4d8a58eaa064244eb3c5fd02c165e83d8fc`
**Date**: 2026-10-08（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-08-int00-rcpt-mw-privacy-int.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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
| g7SuiteGreen | **false** |
| actualSpendCny | **null** |
| backlog `:58`-`:64` | **OPEN** 原样（503 冻结 · GAP-PRIV-03 00 ◐ · GAP-PRIV-04 · `:64` EXTERNAL-SINK） |
| backlog `:68` | **mitigated/cause-unknown** 原样（Ban retry-to-green 先例行） |
| backlog BUG-CP-CLAIM | **open** 原样（当前 `:103` · I103 期 `:101` · 行号漂移以行 ID 为准） |
| checklist `:67` | **原文零改**（raw answer 不得称 canonical artifact） |
| checklist `:173`-`:176` | **◐/◐/◐/[ ] blocked 原文零改**（INT-TRANSCRIPT-00 ◐ · 01 blocked） |
| checklist `:1214` | **原文零改 · 留 nail**（STILL OPEN 行 · SSOT 登记属 nail 阶段） |
| `INT-P0-RAW-QUEUE` | **open**（legacy `/turn` plaintext payload 不可洗） |
| coveredCount 扩面 | **无**（本刀零 matrix edit） |

## Scope（待审 · e2e/HA/隔离壳视角）

docs-only REQUEST：四条已接线 prove 的**单窗回执收尾**立卷。待审要点：**形态二选一（D1）**（拟 (i) 纯 prove 执行刀零 coding · 备选 (ii) additive 扩 `mem00-int00:prove-path` 编排步目 +4 步 · 13 条 gate 断言零弱化 only-additive · 属 EXEC 面交双审）· **隔离壳契约**（四条命令已接线经 `run-e2e-isolated.mjs <t>:raw`——临时独立 cluster · 只删自建 `meetwise-e2e-*` 容器 · 绝不触碰开发库 · BUG-FAKE-R5 fail-closed 头注纪律 · Ban 绕壳直连 · Ban `pnpm db:up` · Ban compose.dev 捷径）· **单窗语义（D4）**（gate 基线 13/13 前置 + 四命令顺序 attempt=1 · 拟「全录不中断」：任一步 blocked/failed 不阻断后续入账但整窗 EXIT≠0）· **blocked ≠ pass**（`int-transcript-preview-submit:http:prove` 远程 PG env 未注入 → blocked + 步 EXIT≠0 + 不写通过回执 · Docker 缺失 → `blocked:docker_daemon_missing` · Ban skip-as-pass）· **attempts 全录**（序号 · Asia/Shanghai(+08:00) · codeSha · EXIT · reason · 失败与成功同列 · Ban retry-to-green `:68` 先例 · 单次 attempt 窗）· **回执形态（D2）**（`receipts/2026-10-08-int00-prove-receipt-attempt1.md` committed + `.tmp/isolated-proof-receipts/*` 机器原始回执引路径 · `class=local_untrusted` · 4 钉常量）· **HA 语义**（NOT_HA / claimProductionHA=false 不动 · 本 prove 不产生任何 HA/发布证据）· **EXIT0 ≠** 控制面关 ≠ 00 关闭 ≠ 01 解禁 ≠ DELETE 开放 ≠ `:60`/`:64` closed ≠ UC-052 covered ≠ HA ≠ `releaseEvidence=true` ≠ suite green ≠ coveredCount 变动（Line C 口径）· 零 live。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · Ban `pnpm db:up` · Ban compose.dev 捷径 · Ban 绕隔离壳直连 · **Ban 01 任何推进**（blocked 不动 · checklist `:176` 原文零改）· **Ban DELETE 503 松动** · **Ban SSOT 翻行**（backlog `:58`-`:64`/`:68`/`:100`-`:103`/`:128` · checklist `:67`/`:173`-`:176`/`:1214` 原文零改 · covered flip · coveredCount 变动 · matrix edit · `:24`/`:45` 自行迁移）· **Ban canonical 宣称**（checklist `:67`）· **Ban `INT-P0-RAW-QUEUE` 洗白** · **Ban 借 #104 面**（`fix/privacy-authorization-lease-takeover` 他刀）· **Ban blocked 写 pass** · Ban 历史回执当当前通过 · Ban retry-to-green · Ban 单 attempt 窗外重跑 · Ban gate ≠13/13 开窗 · Ban 碰 sibling AN 文件 · Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · **Ban push** · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts / package.json、未读 `.env*`；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE 双审 BOTH PASS + meetwise AUTHORIZE。

*Stub · awaiting expert pre-exec dual · STOP*
