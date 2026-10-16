# REQUEST — **QGEN-P2 · GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀**（env 口径统一 → 定值复跑 N=3 → 归因重裁三步法 · ≠ 修复 ≠ 归因定谳 ≠ 行翻转）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/qgen-schema-env-recheck.md` · slice `qgen-schema-env-recheck.slice.md`
**上游**: G7W EXEC 表外读数登记（`schema_validation_failed ×2` · journey start ~3s · EXEC `7db84c18`≡origin `a4e49b8a` · `02-exp2-cmd1-sidecar.md` 读数原文 + `00-summary.md` OB-3 仪器披露）· G7W post-dual BOTH PASS（mw-e2e-ha `33ad1181`≡origin `285081ae` + mw-model-op `4eae75c9`≡origin `3000192c` · C-MO-P1 独立立行 P2+复验门）· coordinator G7W nail `209f71c7`（backlog `:109` 立行 P2 OPEN + OB-3 复验门落字）
**Base tip**: `fe218b7a`（full `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9` · `origin/feat/mysql-schema-skeleton` fetch 后实测 tip · ≥`fe218b7a` 恰等 · G7W EXEC `10e25f38`→`fe218b7a` 产品码零 diff · `full.e2e.ts` blob `7d65d0f3` 全等=CMD1 面跨时代可比性码面前提 · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **QGEN-P2**（`GAP-G7W-QGEN-SCHEMA-VALIDATION` P2 OPEN @ `gap-bug-backlog.md:109` · 行原文+`receipts/g7w-golden-api-discriminator/` 三收据已读）

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
| `g7SuiteGreen` | **false**（retained · Ban flip true） |
| `actualSpendCny` | **null**（retained） |
| `GAP-G7W-QGEN-SCHEMA-VALIDATION` | **P2 OPEN**（`:109` 零翻转 · 重裁结论=行内更新建议归协调方 nail） |
| `GAP-G7W-API-TAIL-DEATH`（G7X 尾段死亡调查线） | **P1 OPEN**（非本刀面 · 零触碰 · 互不越界） |
| Trio | **OPEN**（G7U 真测 **1/1/1** retained） |
| G7W exp2 `schema_validation_failed ×2` 读数 | **retained**（复跑=判别实验零冲销） |
| `GAP-G7K-API-REDS` | **P1 OPEN**（`:107` 不翻） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 判别复跑合法性 / sidecar 与 withhold 边界 / 诚实性）

Line QGEN-P2 · **GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀**（G7W nail `:109` 行指名后继 · 判别实验非修复授权非归因定谳）。请审：

1. **判别复跑合法性（本审首责）**：同一 journey-start 面=`pnpm run e2e:isolated`（wiring `package.json:278` blob `0afb3bd2` =G7W exp2 CMD1 同体）× **N=3 预注册一次成型**（≤5 内）——同 committed SHA 同命令同钉值 ×3、七字段逐 attempt 全记录（CMD 原文含 env 钉值逐字/EXIT 原值/时间戳/实跑 SHA/worktree+branch/环境探针/判读三元组）、`EXIT`/`E2E_FAILURE_CLASS`/machine receipt/快照 log 四来源交叉一致、全部 attempt 全记录 Ban 删除覆盖择优；**复跑=判别实验非翻绿**——红绿读数零冲销 G7W exp2 `×2`/trio 1/1/1/`:107` 任何在案真测；无预注册分支外追加跑（unset 对照臂=协调方另授权 Ban 私自加）。
2. **env 探针诚实性（本审首责）**：钉值注入机制（loader source → 同 shell `export MODEL_ENDPOINT_PROFILE='dashscope-cn-beijing' MODEL_NAME='qwen-plus'` → 起跑）与继承链 `run-e2e-isolated.mjs:1950`（blob `13dbfc43` 冻结钉全等 · denylist `:1973` 仅剥云凭据）码面对号；每 attempt 跑前+跑后 name-only 探针（`MODEL_API_KEY` set/unset · 钉值两变量如实记值 · `G7_FREETIER_REPROVE` unset · `MODEL_BACKUP_API_KEY` presence · `MODEL_TEST_TRANSPORT_OVERRIDES` unset · `.env*` 全 ABSENT）；**记实不记应**（Ban 愿望式探针）；Key 只经进程环境 `~/.meetwise-secrets/load-model-api-key.sh`（仅导出 `MODEL_API_KEY` · OB-3 口径）· Ban `.env*` · Ban 值/fingerprint 入 receipt/log/commit。
3. **sidecar 仪器边界（本审首责）**：F-F §1.2-A → G7W exp2 三代机制承卷零 wrapper diff（`13dbfc43` pre/post 全等机检强制）；SELECT-only 白名单（Ban `ai_model_invocation.output`/`ai_invocation_trace.output` 列族 · 零写语句 · 列名按当 tip migrations 重核 · `job_application`@`0005:20` 纠偏承卷）；逐查询 ok/error 纪律（报错≠空读 · 仪器错误不得改判）；`client.on('error')` 兜底=C-MO-P4 仪器基线承卷（sidecar 本体 `.tmp/qgen-env-recheck/` 不入 git · 非产品码）；快照落点不入 git；**withhold 契约零触碰**（读 DB 不读 stderr · 探针与子进程 stdio 零接触 · Ban 回显/落盘子进程输出）。
4. **expected EXIT=1 诚实性（本审首责）**：复跑预期尾段红 retained（G7W exp2 38013ms class=api 同形预期）——**预期 EXIT=1 ≠ 判别失败**，判别成功判据=快照捕获读取清单读数（双向契约沿 G7W exp2）；尾段红原值记账即止——**零尾段断言定位/零 driver 埋点/零 withhold 契约讨论**（G7X `GAP-G7W-API-TAIL-DEATH` P1 线零触碰零归因 · 互不越界）；Ban 假绿叙事/Ban masking/Ban 破坏性注入（Ban 清 BUILD_ID/降资源/杀进程）。
5. **判读三元组与判读表纪律（与 mw-model-op 共审）**：R-A（error_code 分布主读）/R-B（吸收路径：interview 终态+job done+trace==succeeded · 致死性只记不定谳）/R-C（EXIT/failureClass/durationMs）联合判读；J-R1/J-R2/J-R3 三分支+值域外另记 Ban 就地 reinterpret；产出=行内更新建议——`:109` 行零翻转（关行/翻转权归协调方 nail）；Ban 混杂未排除前产品结论措辞（OB-3 门序）。
6. **预算与七字段账本**：est ≤24 ≤ 任务帽 25 ≪ 硬帽 200（3 journey × 观测 ≤7 次调用 · est-not-counter · 超限即停如实记中止不洗 not_run）；`actualSpendCny=null`（Ban invented spend）；DB 直读容器固定测试凭据（非模型 Key）。
7. **边界完整性**：`:109` P2 OPEN 零翻转；G7X 尾段线 P1 OPEN 零触碰；G7T 残余行/`:107`/trio/残红①②族零触碰；sibling 归档（G7W/G7U/G7S/G7T/G7K/G7R/F-F 收据 lifecycle）零改写；共享 SSOT（backlog/checklist/matrix）零改写；已清面 registry `:63-71`（blob `63af556f`）零触碰。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（零调用零 Key 加载零 DB 连接）· Ban push/force-push · Ban 复现与否/归因分支预claim · Ban self-approve。

`GAP-G7W-QGEN-SCHEMA-VALIDATION` stays **P2 OPEN**（`:109` 零翻转）。G7X 尾段线 stays P1 OPEN（零触碰）。trio stays **OPEN**（1/1/1）。`g7SuiteGreen=false`. `actualSpendCny=null`. **复跑=判别实验非翻绿 · 预期红 ≠ 判别失败 · withhold 零触碰**。

本 stub 不授权 coding / prove 执行 / 判别复跑 / live / push；pre-exec dual PASS 后由 meetwise（协调方）EXEC 授权（含 env 钉值与 N=3/1000ms/快照落点定值一次成型）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · QGEN-P2 复验门刀 · Line QGEN-P2 · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
