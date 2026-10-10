# Slice — QGEN-P2 · **GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀**（env 混杂排除 → 定值复跑 → 归因重裁 · Line QGEN-P2 · docs REQUEST · `draft:awaiting_pre_exec_dual`）

**配套**: harness `harness/qgen-schema-env-recheck.md`（三步法全文/钉值表/判读表/读取清单/prove 契约以 harness 为准）· 双审 stub `reviews/REQUEST-2026-10-07-qgen-env-recheck-mw-model-op.md` + `reviews/REQUEST-2026-10-07-qgen-env-recheck-mw-e2e-ha.md`（PENDING · 预执行双审待两审 append-only）
**上游**: G7W EXEC 表外读数登记（`schema_validation_failed ×2` · journey start ~3s · EXEC `7db84c18`≡origin `a4e49b8a`）→ G7W post-dual BOTH PASS（mw-model-op `4eae75c9`≡origin `3000192c` C-MO-P1：独立立行 P2+复验门 · 不并入 G7T 残余行不并入 `:107`）→ coordinator G7W nail `209f71c7`（backlog `:109` 立行 P2 OPEN + OB-3 复验门落字）——本 REQUEST 即该行的指名**复验门刀**（P2 · 低于 `GAP-G7W-API-TAIL-DEATH` P1 尾段面 · 非修复授权 · 非归因定谳）
**Base**: `origin/feat/mysql-schema-skeleton` `fe218b7a`（fetch 后实测 tip ≥`fe218b7a` 恰等 · G7W EXEC `10e25f38`→`fe218b7a` 产品码零 diff · `full.e2e.ts` blob `7d65d0f3` 全等）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-qgen` · branch `line/qgen-schema-env-recheck`
**本 turn 边界**: docs-only 一次 commit · Ban coding · Ban prove 执行 · Ban live（零调用零 Key 加载零 DB 连接）· Ban push · Ban 预claim 复现与否/归因分支 · Ban 碰产品码（prompts.ts/validator/question-generation 全族——归因≠修复修复另刀）· Ban 混杂未排除前下产品结论 · Ban 碰 G7X 尾段死亡调查线（互不越界）· Ban 关 `:109` 行（重裁结论=行内更新建议归协调方 nail）· Ban 改共享 SSOT · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT

## 范围（REQUEST 要点）

1. **范围 = 三步法**（沿 FLK 预注册先例 · 每跑假设+判读+反例 · **复跑=判别实验非翻绿**）：
   - **① env 口径统一**：混杂本体=G7W run `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset（OB-3）→ 解析缺省落 `deepseek-cn-public`（`text-endpoint-config.ts:77`）端点身份异于 trio 基线；钉值=**`dashscope-cn-beijing` × `qwen-plus`**（G7U/G7S 生产 parity 口径 · 协调方既授权配对值 · `gap-red1-timing-face/01-cmd1-iso.md:27` 在卷）；Key 只经进程环境 `~/.meetwise-secrets/load-model-api-key.sh` loader（仅导出 `MODEL_API_KEY` · name-only 入卷 · Ban `.env*`）；`G7_FREETIER_REPROVE` unset 守卫不介入（`g7-freetier-reprove-guard.ts:103/:135`）；每 attempt 跑前跑后 name-only 环境探针。
   - **② 定值复跑**：同一 journey-start 面=`pnpm run e2e:isolated`（wiring `:278` =G7W exp2 CMD1 同体）× **N=3 预注册一次成型**（≤5 内）；sidecar 直读隔离 PG（F-F→G7W 三代机制承卷 · 1000ms · SELECT-only 白名单 Ban output 列族 · `client.on('error')` 兜底 C-MO-P4 基线 · wrapper `13dbfc43` 零 diff · 快照 `.tmp/qgen-env-recheck/` 不入 git）；读数三元组 R-A（`ai_model_invocation` error_code 分布 · question-generation 面主读）/ R-B（吸收路径：interview 终态+job done+trace==succeeded · 致死性只记不定谳）/ R-C（EXIT 原值+failureClass+durationMs · **预期 EXIT=1 尾段红 retained ≠ 判别失败**）；est ≤24 ≤ 任务帽 25 ≪ 硬帽 200（est-not-counter · `actualSpendCny=null`）。
   - **③ 归因重裁**（预注册判读表）：**J-R1** ≥1/3 复现→产品 prompt/validator 面候选（修复另刀）；**J-R2** 3/3 零复现→env 特异性归因候选（Ban 定谳永不复现 · Ban 反向全称）；**J-R3** 仪器缺口→回协调方 Ban 私自补跑；值域外 error_code 如实另记 Ban reinterpret；措辞纪律「与 X 一致」≠「X 已证」· 单一读数不定谳；**产出=行内更新建议非行翻转**——行状态/产品刀立项/关行建议全归协调方 nail。
2. **硬 Ban（任务书五条全承）**：Ban 碰 prompts.ts/validator/question-generation 产品码；Ban 归因未排除混杂前下产品结论；Ban 碰 G7X 尾段死亡调查线（`GAP-G7W-API-TAIL-DEATH` P1 · 该线 Ban 归因本面互不越界）；Ban 关 `GAP-G7W-QGEN-SCHEMA-VALIDATION` 行（`:109` P2 OPEN 零翻转）；Ban 改共享 SSOT（backlog/checklist/matrix/sibling 归档零改写）。
3. **Pins 文首照抄（原值全抄）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**；retained：`:109` 行 P2 OPEN · 尾段 P1 OPEN · trio OPEN（1/1/1）· G7W exp2 `×2` 读数 retained（复跑零冲销）· `:107` P1 OPEN。双审 = mw-model-op（env 解析链/模型消费面/归因重裁判读忠实性）+ mw-e2e-ha（e2e 纪律/复跑合法性/sidecar 与 withhold 边界/诚实性）。
4. **流程声明**：REQUEST → 预执行双审（mw-model-op + mw-e2e-ha）→ meetwise（协调方）EXEC 授权（env 钉值+判别复跑定值一次成型）→ EXEC（env 钉值+判别复跑）→ post 双审 → meetwise（协调方）授权 nail。收据落 `receipts/qgen-schema-env-recheck/`；七字段逐 attempt 全记录 · 四来源交叉一致；Ban retry-to-green（读数不冲销任何在案真测）。

## Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 归因定谳 · not 产品 prompt 质量缺陷/无缺陷主张 · not 致死性定谳 · not G7X 尾段死亡归因 · not `:109` 行关行/翻转（P2 OPEN retained）· not G7T 并线 · not trio green（1/1/1 retained）· not suite green · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog/SSOT 翻转 · not live（本 turn）· not coordinator authorize · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual

---
*Slice · QGEN-P2 复验门刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · env 口径统一（dashscope-cn-beijing × qwen-plus trio 基线钉值 · loader 只载 Key）→ 定值复跑（CMD1 同体 N=3 · sidecar 白名单 · R-A/R-B/R-C）→ 归因重裁（复现=产品面候选 · 零复现=env 特异候选 · 结论=行内更新建议）· 复跑=判别非翻绿 · Ban 产品码/Ban 未排除混杂下结论/Ban 碰 G7X 线/Ban 关行/Ban 改 SSOT · est ≤24 ≤25 ≪ 200 · STOP*
