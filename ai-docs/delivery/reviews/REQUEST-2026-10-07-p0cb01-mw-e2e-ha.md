# REQUEST — **P0-CB-01 · 申请↔面试不可替代绑定（GAP-PROD-02 首面）** · pre-exec · `mw-e2e-ha`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-e2e-ha`
**Knife**: `harness/p0cb01-application-binding.md` · `p0cb01-application-binding.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `fe218b7a` / `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`
**Branch under review**: `line/p0cb01-application-binding`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-p0cb01-mw-privacy-int.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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
| g7SuiteGreen | **false** |
| actualSpendCny | **null** |
| backlog `:78` GAP-PROD-02 | **OPEN**（翻转归协调方 nail · 本刀任何结果零翻行） |

## Scope（待审 · e2e/HA 视角）

docs-only REQUEST 立卷（P0-CB-01 · 一刀一行 · Ban 顺手 CB-02/03）。待审要点：**缺陷面收窄是否诚实**（基底实存 vs 验收证据面缺口——E-1…E-4 erratum 口径继承、G-1…G-7 缺口逐项亲算可复现）· **码面锚/blob/行号逐一亲算复核**（`0028` blob `ef940e26`/`recruiter.ts` blob `d06b4f49` 等 harness §1.1 全表）· **方案 A 推荐裁决**（additive snapshot INSERT-only vs B embed vs C 中间表——破坏面/迁移面/fail-closed 三轴对比是否成立、是否动摇 `0028` 语义）· **Prove 拟案覆盖度**（NEG N1-N5 / HP H1-H4 对 audit `:110/:111/:112/:114` 验收表逐项映射、命令/期望 EXIT/attempt 纪律、Ban retry-to-green `:68` 先例、底座回绿面）· **浏览器面**（H4 扩展分支不替换既有 `recruiting-bound.spec.ts` 断言、settlement/early-stop 臂零触碰）· **顺序合同**（SCOR then P0-CB 启动门是否写死且未被绕过）· EXIT0 ≠ 闭合 ≠ `:78` 翻转 ≠ covered ≠ `releaseEvidence=true`。

## Ban（待审确认）

Ban coding/prove 执行（本卷零执行）· Ban live/secrets（Key name-only）· Ban 碰 settlement/early-stop（`adaptive-lifecycle.ts`/`commerce.ts`）· Ban 公开 DELETE=503/privacy 主链/`checkpoint-principal.ts` · Ban SSOT edit（`:78` 翻转归协调方 nail）· Ban 顺手做 CB-02/03 · Ban 动摇 `0028`/`0046`/`0082` 语义 · Ban B 端数值恢复 · Ban retry-to-green · Ban force-push · Ban self-approve（alone ≠ dual）· Ban 审降级/换默认（dual = mw-e2e-ha + mw-privacy-int）。

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts / `package.json`、未读 `.env*`、SSOT 零触碰。执行须 PRE BOTH PASS + meetwise AUTHORIZE + SCOR 启动门。

## Verdict

**PENDING**（awaiting 本席亲审 · alone ≠ dual · 不代签 peer mw-privacy-int）
