# REQUEST — **`product-readiness-c-b-audit.md` stale 更正刀（erratum · 双登记不改写）** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-cb-audit-erratum.md` · `gap-cb-audit-erratum.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `50423a6f` / `50423a6fa6f18d4c9d193611cf84c4702e067208`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-gap-cb-audit-erratum-mw-privacy-int.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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
| public DELETE | **503**（冻结 · W3 freeze remains） |
| backlog `:78` GAP-PROD-02 | **OPEN**（更正 ≠ 闭合 · C-I-3 继承：snapshot 面闭合前不 flip） |
| backlog `:77` GAP-PROD-01 / `:103` BUG-SCORE-LEGACY | **OPEN / 防回归同列** |
| matrix `:234` GAP-PROD-02 | **partial**（「单链路有；三主体矩阵进 CI 仍缺」零翻行） |
| coveredCount 扩面 | **无**（本刀零 matrix edit） |
| audit frontmatter `version: 1`/`status: active` | **零触碰**（erratum 双登记 · 原文零字节改） |

## Scope（待审 · e2e/HA 视角）

docs-only REQUEST：audit 文档 erratum 式更正（4 条编号项 binding 口径：E-1/E-3/E-4 全 stale + E-2 部分 superseded）。待审要点：**E-4 消费者链亲证**（`apps/web/components/InterviewPanel.tsx:92-107` 终态自动触发 + `app/api/applications/[id]/finalize/route.ts` strict DTO 拒 interviewId——「消费者数 0」stale 判定是否成立、finalizedApplicationRef 去重是否足以支撑「消费者已实存」措辞）· **P0-CB-03 面零翻行**（`recruiting-bound.spec.ts` 单链路 ≠ 三主体矩阵 ≠ CI 收据；erratum 不得被读成「浏览器闭环已验」）· **验收表无收据面不弱化**（20 并发恰 1 / 错配 409 / 重放恰 1 / 真实浏览器 C→B 全链路 1 条必过——均无 named prove 收据，erratum 后缺口重心=验收证据面）· 同根复述点登记（`:59`/`:60`/`:62`/`:89`/`:91`/`:245`/`:254`）是否完整、有无漏登记的 stale 复述 · **原文保留铁律**（audit 文档零字节触碰 · Ban 加注 Ban 改 frontmatter）· **Ban 翻状态**（`:78` OPEN · `:77` OPEN · matrix partial · coveredCount=8 零扩面）· EXIT 契约（attempts 全录 · 诚实失败 · Ban retry-to-green · EXIT0 ≠ closed ≠ covered ≠ `releaseEvidence=true`）· HA 语义（NOT_HA / claimProductionHA=false 不动）。

## Ban（待审确认）

Ban coding · Ban prove execution · Ban live · **Ban 改写/删除/加注 audit 原文（含 frontmatter）** · Ban `:77`/`:78`/`:103` flip · Ban matrix/checklist/queue/backlog 翻行 · Ban coveredCount 变动 · Ban「P0-CB-01 已闭/绑定已建成/三主体矩阵 covered/浏览器闭环已验」宣称 · Ban B 端数值恢复 · Ban 开 DELETE（503 冻结）· Ban INT-TRANSCRIPT-01 blocked 摘除 · Ban S-SCOR-*/S-CB-* 实现借道 · Ban SCOR nail 待办代办（OB①/OB② 属协调方）· Ban SSOT edit · Ban 碰 sibling 立卷工件（W6 链/MOP 链/AN 系列/reviews 既有文件）· Ban 审降级/换默认（dual = mw-e2e-ha + mw-privacy-int）· Ban secrets / `.env*` · Ban Meridian · Ban buy cloud · Ban force-push · Ban push · Ban self-approve（alone ≠ dual）

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts / `package.json`、未读 `.env*`、audit 文档零字节触碰；named proves ≠ coding/prove 授权（I2 先例）。执行须 PRE BOTH PASS + 协调方 AUTHORIZE。

## Verdict

**PENDING**（awaiting 本席亲审 · alone ≠ dual · 不代签 peer mw-privacy-int）
