# REQUEST — **P0-CB-01 · 申请↔面试不可替代绑定（GAP-PROD-02 首面）** · pre-exec · `mw-privacy-int`

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（empty review stub · Ban self-approve · alone ≠ dual）
**Expert**: `mw-privacy-int`
**Knife**: `harness/p0cb01-application-binding.md` · `p0cb01-application-binding.slice.md`
**Base**: `origin/feat/mysql-schema-skeleton` · `fe218b7a` / `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9`
**Branch under review**: `line/p0cb01-application-binding`
**Date**: 2026-10-07（Asia/Shanghai · UTC+8）
**Peer stub**: `reviews/REQUEST-2026-10-07-p0cb01-mw-e2e-ha.md`（**不代签** · alone ≠ dual · 末行仍 PENDING）

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

## Scope（待审 · privacy/interior 视角）

docs-only REQUEST 立卷（P0-CB-01 · 一刀一行 · Ban 顺手 CB-02/03）。待审要点：**「不可替代」语义边界**（DB 绑定 ≠ 审计意义不可替代的判读、immutable snapshot 层是否为必要证据面、C-EH-3 冻结的 `consent_version` 事务绑定终裁是否恰当归本刀执行期而非本卷预设结论）· **方案 A 隐私面**（snapshot 表 INSERT-only 封口是否覆盖 app_role 全路径、evidence hash 是否引入新可关联面、快照只读投影是否泄露 C 端 transcript/成长档案——B 端可见字段仅限 application 域）· **CB-02 越界防线**（本刀 consent 面仅限 `consent_version` 绑定列，ShareGrant/撤回/在途终止/全数据面清理零实现——是否守住 01→02 内序）· **G-2 零 hit 口径复核**（`consent_version|consentVersion` rc=1 亲测可复现）· **DELETE=503/privacy 主链/checkpoint-principal.ts 冻结**与 INT-TRANSCRIPT-01 blocked 不动 · **码面锚/blob 亲算复核**（harness §1.1/§1.2 全表）· EXIT0 ≠ 闭合 ≠ `:78` 翻转 ≠ covered ≠ `releaseEvidence=true`。

## Ban（待审确认）

Ban coding/prove 执行（本卷零执行）· Ban live/secrets（Key name-only）· Ban 碰 settlement/early-stop（`adaptive-lifecycle.ts`/`commerce.ts`）· Ban 公开 DELETE=503/privacy 主链/`checkpoint-principal.ts` · Ban SSOT edit（`:78` 翻转归协调方 nail）· Ban 顺手做 CB-02/03（ShareGrant/撤回面/三主体矩阵零实现）· Ban 动摇 `0028`/`0046`/`0082` 语义 · Ban B 端数值恢复 · Ban retry-to-green · Ban force-push · Ban self-approve（alone ≠ dual）· Ban 审降级/换默认（dual = mw-e2e-ha + mw-privacy-int）。

本 stub 未跑 prove、未起容器、未连远程环境、未改产品码 / migrations / scripts / `package.json`、未读 `.env*`、SSOT 零触碰。执行须 PRE BOTH PASS + meetwise AUTHORIZE + SCOR 启动门。

## Verdict

**PENDING**（awaiting 本席亲审 · alone ≠ dual · 不代签 peer mw-e2e-ha）
