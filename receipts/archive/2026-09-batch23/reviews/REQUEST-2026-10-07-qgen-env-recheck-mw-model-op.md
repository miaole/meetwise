# REQUEST — **QGEN-P2 · GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀**（env 口径统一 → 定值复跑 N=3 → 归因重裁三步法 · ≠ 修复 ≠ 归因定谳 ≠ 行翻转）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/qgen-schema-env-recheck.md` · slice `qgen-schema-env-recheck.slice.md`
**上游**: G7W EXEC 表外读数登记（`schema_validation_failed ×2` · EXEC `7db84c18`≡origin `a4e49b8a` · Receipt 02 §表外读数登记）· 本席 G7W POST-PROVE PASS `4eae75c9`≡origin `3000192c`（C-MO-P1 裁决：独立立行 P2+复验门 · 同机制族不同操作面不并入 G7T 残余行不并入 `:107`）· coordinator G7W nail `209f71c7`（backlog `:109` 立行 P2 OPEN + OB-3 复验门落字）
**Base tip**: `fe218b7a`（full `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9` · `origin/feat/mysql-schema-skeleton` fetch 后实测 tip · ≥`fe218b7a` 恰等 · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
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

## 请审什么（mw-model-op · env 解析链忠实性 / 模型消费面 / 归因重裁判读表 · 审查域焦点）

Line QGEN-P2 · **GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀**（G7W nail `:109` 行指名后继 · 判别实验非修复授权非归因定谳）。请审：

1. **env 解析链忠实性（本审首责）**：混杂 delta 是否码面成立——unset 时 `text-endpoint-config.ts:77` 缺省 `deepseek-cn-public`（`api.deepseek.com`）vs trio 基线钉值 `dashscope-cn-beijing`（`dashscope.aliyuncs.com/compatible-mode/v1`）端点身份差异=输出 schema 偏移候选混杂的承重论据（blob `005c68cc` 亲算）；freetier 守卫门 `g7-freetier-reprove-guard.ts:103/:135/:414`（blob `4e75fae7`）unset 不介入判定；env 继承链 `run-e2e-isolated.mjs:1950/:1973`（blob `13dbfc43` 与 G7R/G7U/G7W 冻结钉全等）与 G7W Receipt 01 透传链亲读的一致性；钉值对（`dashscope-cn-beijing` × `qwen-plus`）与 G7U/G7S 收据 name-only 探针原值（`gap-red1-timing-face/01-cmd1-iso.md:27` · `gap-begin-snapshot-supply-fix/00-summary.md:30`「协调方既授权值」）逐字对号；Key 路径 loader 唯一（`~/.meetwise-secrets/load-model-api-key.sh` 仅导出 `MODEL_API_KEY` · OB-3 口径）· name-only · Ban `.env*`。
2. **归因重裁判读表忠实性（本审首责）**：J-R1（≥1/3 复现→产品 prompt/validator 面**候选** · 修复另刀）/ J-R2（3/3 零复现→env 特异性**候选** · Ban 定谳永不复现 · Ban 反向全称主张）/ J-R3（仪器缺口回协调方 Ban 私自补跑）三分是否对称完备；判据钉死在 `schema_validation_failed` 本码、值域外 error_code 另记 Ban reinterpret；「与 X 一致」≠「X 已证」· 单一读数不定谳 · R-A/R-B/R-C 联合判读；**产出=行内更新建议非行翻转**（`:109` 状态翻转权归协调方 nail）；**Ban 混杂未排除前任何产品结论措辞**（OB-3 门序）是否硬闭合。
3. **模型消费面锚对号**：`invoke.ts:711-712` 写入方（blob `6668eff7`）· `question-generation.ts:39/:46/:50` MALFORMED 族映射（blob `3e27164b`）· `adaptive-interview-service.ts:161` 吸收调用点 · registry `:69` `interview.question-generation.v1`（blob `63af556f` 与 G7W REQUEST 时代全等=已清面零触碰自证）；persistTrace error 旁路 `invoke.ts:739`（trace==succeeded 读数的码面前提 · 本席 G7W POST §三.4 承卷）；R-B 致死性子读数「只记不定谳」（行原文「致命性未定谳」零翻转）。
4. **与 G7T v2 关系承卷**：`430d4c84` route-classify 面 zero-validator-change 与本面（question-generation）无因果通道——本席 G7W POST §三.2 裁决（不并入 G7T 残余行不并入 `:107`）零重裁零翻转；两刀操作面独立性是否被如实保持（Ban 借本刀重开 G7T 面）。
5. **预注册纪律（与 mw-e2e-ha 共审）**：N=3 一次成型（≤5 内 · 奇数样本）无事后加跑无择优；**复跑=判别实验非翻绿**——读数不冲销 G7W exp2 `×2`/trio 1/1/1/任何在案真测；expected EXIT=1（尾段红 retained）≠判别失败双向契约；est ≤24 ≤ 任务帽 25 ≪ 硬帽 200（est-not-counter · 超限即停 · `actualSpendCny=null`）。
6. **边界完整性**：G7X 尾段死亡调查线（`GAP-G7W-API-TAIL-DEATH` P1）零触碰零归因（互不越界）；`:109` 行零翻转；G7T 残余行/`:107`/trio/残红族零触碰；sibling 归档零改写；共享 SSOT（backlog/checklist/matrix）零改写；withhold 契约零触碰（读 DB 不读 stderr · Ban output 列族 · wrapper 零 diff）。
7. **预算与 Key 卫生**：est ≤24（3 journey × 观测 ≤7 次调用 · est-not-counter）；DB 直读容器固定测试凭据（非模型 Key）；模型 Key 只经进程环境 loader source · name-only · Ban 值/fingerprint 入 receipt/log/commit。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban 实跑 · Ban live · Ban push · Ban 复现与否/归因分支预claim · Ban self-approve。

`GAP-G7W-QGEN-SCHEMA-VALIDATION` stays **P2 OPEN**（`:109` 零翻转）。G7X 尾段线 stays P1 OPEN（零触碰）。trio stays **OPEN**（1/1/1）。`g7SuiteGreen=false`. `actualSpendCny=null`. **复跑=判别实验非翻绿 · 归因≠修复 · 未排除混杂 Ban 产品结论**。

本 stub 不授权 coding / prove 执行 / 判别复跑 / live / push；pre-exec dual PASS 后由 meetwise（协调方）EXEC 授权（含 env 钉值与 N=3/1000ms/快照落点定值一次成型）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · QGEN-P2 复验门刀 · Line QGEN-P2 · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*
