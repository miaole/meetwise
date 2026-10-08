# REQUEST — **HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀**（本地多实例+故障注入 · C3/C3b/C4/probe 级四面齐套 · ≠ 阶 C 绿 ≠ 生产 HA）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins（十值照抄）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null
**Expert**: `mw-model-op`
**Knife**: `harness/ha-local-prove.md` · slice `ha-local-prove.slice.md`
**上游现状**: `north-star-ha.md:42` —— 阶 C 骨架已落但 **阶 C prove 未绿**（各路径只到「可跑/骨架」态；2026-09-23 三刀系旧 tip 分刀局部收据，无单 tip 全链齐套）· 用户直裁「HA 那个可以本地模拟好的」
**Base tip**: `9028eb70`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **HALOC-1**

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
| `g7SuiteGreen` | **false**（retained · trio OPEN 独立核算） |
| `actualSpendCny` | **null**（沿 I 线 · Ban invented spend） |
| 阶 C/D | **prove 未绿**（本刀目标=**本地**全链绿 · ≠ 阶 C 绿 · nail 阶段前 SSOT 行不翻） |

## 请审什么（mw-model-op · 零 live 预算 / Key 卫生 / 成本叙事 / Ban 买云）

Line HALOC-1 · **HA 阶 C 本地模拟 prove 全链绿刀**（docs REQUEST）。请审：

1. **零 live 预算口径（harness §4）**：est = 全部 CMD（Phase P/A/B/C/D + 负检 N1–N3）**0 次 live 模型调用 / 0 次 Key 加载 / 0 外购**——依据（2026-09-23 三刀历史收据实测形态 + `scripts/ha/*.mjs` 源码无模型调用路径）是否成立、是否需要在 EXEC 收据里逐 CMD 复核「0 live」实测值；**est 0 ≠ 已实测**措辞在位；`actualSpendCny=null` 沿 I 线（Ban invented spend · est 0 不充当 spend 记录）。
2. **Key 卫生（harness §3/§4）**：本刀**全程不加载 Key**；Key 存在性 = name-only 探针；Ban Key 值/fingerprint 入树入据；compose 内 local-dev placeholder 凭据（与 `compose.mysql-local.yml` 同类 · 源码在案）与生产 secret 的边界是否钉死（**Ban 引为生产凭据叙事**）。
3. **`.env*` ABSENT（harness §2 P7/§4）**：worktree 根 `.env*` 三文件 presence 逐相记录（期望 ABSENT）；EXEC 全程禁读禁写；授权四变量**只经进程 env · 逐 CMD 前缀**，不落 `.env*` 不入 git 不入收据值位。
4. **Ban 买云叙事（harness §5）**：本刀零云面零采购推进；D3 prepurchase quote（`harness/ha-d3-prepurchase-quote.md` · `pre_exec_pass` · alone ≠ dual · UNQUOTED · ¥0）是另轨——本 REQUEST 不引用为已决、不发明云价/实例型/采购数；「`haStatus` 翻转归生产多实例证据（**买云后另刀**）」的另刀归属是否足以阻断本刀变相开采购面。
5. **成本/证据叙事纪律**：本刀产物上限 = 「HA 阶 C 本地证据包」+ 矩阵 HA 行本地子面**建议**（harness §6.3 · 本刀不落行）；Ban 把本地收据升格为 covered/阶 C 绿/suite green/G7/0 BUG/`releaseEvidence` 任何面证据；`coveredCount=8` 不动。
6. **授权链与预算关系（harness 授权链/§3）**：pre-exec dual BOTH PASS → 协调方 EXEC 显式开闸（四授权变量）才实跑；双审 PASS ≠ EXEC 授权；若 EXEC 期需任何额外诊断复跑（正检红面甄别），须协调方另批**独立记账**（计入预算口径复核 · Ban retry-to-green 借道）。
7. **边界（本 REQUEST turn）**：docs-only 一次 commit · 零实跑零 docker 零 live 零 Key 加载 · 本 commit 不预claim 任何 post-commit EXIT。

阶 C/D **STILL NOT GREEN**（本刀目标为本地全链绿 ≠ 阶 C 绿）。`haStatus=NOT_HA` · `releaseEvidence=false`。零 live 刀 ≠ 模型面任何绿。

本 stub 不授权 coding / prove 执行 / docker 操作 / live / push / 采购；pre-exec dual PASS 后由协调方 EXEC 授权（含四枚授权变量开闸权）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · HALOC-1 · HA 阶 C 本地模拟 prove 全链绿刀 · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · STOP*
