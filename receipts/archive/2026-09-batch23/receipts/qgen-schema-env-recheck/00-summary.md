# SUMMARY — QGEN-P2 · GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀 EXEC（env 混杂排除 → 定值复跑 N=3 → 归因重裁 · 协调方授权后执行）

**Line**: QGEN-P2 · **Date**: 2026-10-08（UTC）· **授权**: REQUEST `81c41b48`（origin `line/qgen-schema-env-recheck`）→ 预执行双审 BOTH PASS（mw-model-op + mw-e2e-ha · 协调方宣布）→ 协调方 EXEC 授权（§3⑤ standing authorize · EXEC 指令六条含 errata 回填与 stdout log 自钉）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-qgen` · branch `line/qgen-schema-env-recheck` · **EXEC HEAD**: `2fddcbfb`（=REQUEST `81c41b48` + errata 纯 .md commit · 8 锚 blob 与 REQUEST 时代全等 · origin base tip `fe218b7a` 未前进零 rebase）

## 一句话定谳（归因重裁）

**判读分支落点=J-R1 复现成立**：unset 混杂排除后（钉值 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` × `MODEL_NAME=qwen-plus` trio 基线口径 · 生产 parity profile），**可测 DB 面 2/2 run 复现 `ai_model_invocation.error_code='schema_validation_failed' ×2`**（journey-start 窗首现 · 计数稳定恒 2 永不再增 · 吸收路径照旧 · 旅程至 completed）· run1 DB 面仪器缺口但 R-C 同形（EXIT=1 class=api 39774ms）。**unset→`deepseek-cn-public` 缺省端点混杂被排除为本失败成因——OB-3 复验门已行使，归因候选=产品 prompt/validator 面（候选非定谳 · 修复另刀）**。措辞纪律：「与 question-generation 面一致」≠「已证」· 2/3 可测样本限如实 · Ban 全称主张。

## 三元组 ×3 全台账（N=3 一次成型 · 全 attempt 如实 · 零删改零择优）

| run | 窗口（UTC） | EXIT/class/duration | R-A（error_code 分布） | R-B（吸收路径） | live 账本 |
|---|---|---|---|---|---|
| 1 | 02:30:23 → 02:31:04 | **1 / api / 39774ms** | **仪器缺口（J-R3 登记）**：sidecar import 期崩（ROOT 单层 `..` 错解析）· 零快照 · PG 已拆不可回补 | 不可读（同左） | est ≤7（est-not-counter） |
| 2 | 02:32:51 → 02:33:32 | **1 / api / 40511ms** | **复现**：succeeded=5 + failed/`schema_validation_failed`=**2**（02:33:04 首现 → 02:33:06=2 → 恒 2 · start job 02:33:02 后 ~2s） | **照旧**：interview completed=1+abandoned=1 · 6 job 全 done att=1 err=NULL · trace=5==succeeded | **live=7**（账本实测 5+2） |
| 3 | 02:34:10 → 02:34:55 | **1 / api / 44356ms** | **复现**：succeeded=5 + failed/`schema_validation_failed`=**2**（02:34:24 首现 → 02:34:26=2 → 恒 2 · start job 02:34:23 后 ≤1s） | **照旧**：completed 首现 02:34:43 · 6 job 全 done · trace=5==succeeded | **live=7**（账本实测 5+2） |

三 run 共同形状（与 G7W-era 表外读数逐点同形）：×2 落 journey-start 窗且此后不再增 · succeeded 增至 5 · interview completed（吸收路径行使）· route 面零行（未达）· `job_application`=0 行（尾段形状同族——**该面 G7X `GAP-G7W-API-TAIL-DEATH` P1 零触碰零归因 · 预期 EXIT=1 原值记账 retained**）。

## 归因重裁（J-R1 判据逐项对号）

- **混杂排除逻辑**：OB-3 门指认的混杂=unset → 缺省 profile `deepseek-cn-public`（`api.deepseek.com`）。本 EXEC 钉值后端点身份=trio 基线 `dashscope-cn-beijing`（`dashscope.aliyuncs.com/compatible-mode/v1`）——**失败照现且 ×2 形状不变** → env（端点/模型默认值漂移）非本失败成因。`MODEL_NAME` 两面同落 `qwen-plus`（G7W-era 缺省与本刀钉值同名）——模型名变量两面无差，非区分变量（如实注记）。
- **样本限如实**：可测 DB 面=2/3 run（run1 仪器缺口）——J-R1 判据「≥1 复现」成立且 2/2 全复现，但 **N=3 内 2 可测的样本限如实入卷**；是否需补足第 3 可测样本归协调方裁（Ban 本席私自补跑）。
- **face 归着注记**：`ai_model_invocation.service` 列全行 null（succeeded 与 failed 同）——face 归着靠三重联合（G7W post-dual 码面三方验证链 + 本 run 吸收路径读数 + 8 锚 blob 码面零漂移），**非 service 列直读**；「与 X 一致」≠「X 已证」。
- **致命性子读数（R-B）**：2/2 可测 run 旅程 completed（吸收路径行使 · trace=5==succeeded 与 persistTrace error 旁路一致）——**in-sample 非致死读数**；行原文「致命性未定谳」维持，定谳权归协调方。
- **值域外**：零——两可测 run 的 error_code 值域恰为 `schema_validation_failed` 本码 + succeeded，无其它码出现。

## :109 行内更新建议（全文 · 非翻转 · 行状态翻转权归协调方 nail）

> **`GAP-G7W-QGEN-SCHEMA-VALIDATION`（P2 OPEN）行内更新建议**：OB-3 复验门已行使——EXEC `qgen-schema-env-recheck`（3 run @EXEC HEAD `2fddcbfb` · 钉值 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` × `MODEL_NAME=qwen-plus` trio 基线口径 · 2026-10-08）定值复跑读数=可测 DB 面 2/2 run 复现 `schema_validation_failed ×2`（journey-start 窗 · 恒 2 · 吸收路径照旧 completed · run1 DB 面仪器缺口但 R-C 同形）。**unset→`deepseek-cn-public` 缺省端点混杂排除为本失败成因**；行内 OB-3 门措辞可更新为「已行使（2026-10-08 EXEC 复现在卷）」，归因候选=**产品 prompt/validator 面（模型输出 schema 偏移 · 与端点/模型默认值漂移无关 · 候选非定谳）**。致命性：in-sample 非致死读数 2/2（旅程 completed · 吸收行使），行「致命性未定谳」维持。修复=另刀（产品刀：prompt 校准 / validator 放宽 / schema 收敛——方向归协调方裁 · 须独立 REQUEST+双审+授权）。行状态 **P2 OPEN 维持**——是否立产品缺陷行/是否升级优先级/修复刀排序，全归协调方。

## 仪器披露与 erratum（非阻断 · 全量如实）

1. **OB-Q1（run1 sidecar 仪器缺陷 · J-R3 登记）**：sidecar 适配缺陷（`ROOT` 单层 `..` 沿用 G7W 版，本刀 sidecar 位于 `.tmp/qgen-env-recheck/` 深一层）→ import 期 `Cannot find module 'pg'` 崩，零快照零 watch（stderr `.tmp/qgen-env-recheck/sidecar-run1.out` 原文在卷）。修正为两层 `../..` + run2 前双探针验证（`pg module OK`/`ROOT resolve OK`）。**run1 不补跑**（Ban 私自补跑纪律）——run1 以 R-C-only 入台账，判读样本 2/3 可测。
2. **OB-Q2（C-MO-P4 兑现）**：`client.on('error')` 兜底于 run2（02:33:31.843）/run3（02:34:54.725）teardown 时各触发一次——零崩溃零 exit 1（G7W OB-2 拆除伪影不复现 · 仪器基线改进生效）。
3. **OB-Q3（外来容器）**：`meetwise-e2e-40151-1791426695734` 创建于 02:31:35 UTC（run1 终点后 ~31s · run2 起点前）——PID 命名不属本刀三 run 族（39418/40901/41856 全部 `--rm` 拆除无残留）· 非本 EXEC 派生 · 零触碰（Ban 杀非本刀进程）；各容器独立隔离 PG，本刀读数面无交叉；宿主共存如实登记。
4. **OB-Q4（run3 duration）**：44356ms 略高于 G-era 簇上沿（37.9–40.6s）——形状同族（class=api · journey 完成 · ~12s 尾段静默），如实记不改判。

## errata 回填说明（协调方 EXEC 指令 #2 · commit `2fddcbfb`）

1. **注册表行号**：harness `:12`/`:88` `text-endpoint-config.ts:40-43`→`:36-40`——**已回填**，本 tip 实测成立（`:36` 注释 / `:37` 声明 / `:38-39` 两 profile / `:40` 闭合）。
2. **`job_application` 0005 锚**：协调方指令 `:20`→`:19`（e2e-ha 席实测）。本席 tip 实测=**`:19` 为 DDL 前注释行（`-- ② 申请表…`），`CREATE TABLE IF NOT EXISTS job_application (` 语句本体=`:20`**（与 G7W-era C-MO-1 口径 `0005_job_application.sql:20` 一致）——按「记实不记应」纪律**未盲改**，harness 已改双行号并记（`:19`=注释 / `:20`=语句本体），差异如实回协调方复裁。
3. **stdout log 自钉**：`.tmp/qgen-env-recheck/cmd1-run{1,2,3}.log`（三代机制 stdout tee 承卷 · 三文件 1861/1861/1859B 在 `.tmp/` 不入 git）。
4. **指令行位注记**：协调方指令所引 harness `:62` 实测落 `:59`（grep 仅 `:12`/`:59`/`:88` 三处含旧值）——按实测行位修订。e2e-ha stub `:38` 的 `0005:20` 系 pre-exec PASS 时代原文（review 记录 append-only 零触碰），errata 范围=harness 本体。

## 预算（est-not-counter）

live 账本实测：run2=7（5+2）+ run3=7（5+2）=**14 实测**；run1 DB 面不可读 → est ≤7（同旅程形状）→ **总 est ≤21 ≤ 授权包络 24 ≪ 硬帽 200** · 无超限中止 · **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）· 模型 Key 只经进程环境 loader（name-only · `MODEL_API_KEY=set`）· DB 直读容器固定测试凭据（非模型 Key）。

## 码面机检（binding · 全 PASS）

1. **8 锚 blob pre/post 全等**（`.tmp/qgen-env-recheck/blob-pre.txt`≡`blob-post.txt` diff 空）：`invoke.ts 6668eff7` · `question-generation.ts 3e27164b` · `model-operation-registry.ts 63af556f` · `text-endpoint-config.ts 005c68cc` · `g7-freetier-reprove-guard.ts 4e75fae7` · `run-e2e-isolated.mjs 13dbfc43`（G7R/G7U/G7W 冻结钉全等）· `package.json 0afb3bd2` · `full.e2e.ts 7d65d0f3`——**零产品码/零 spec/零 wrapper/零 SSOT 改动**。
2. **tracked 树零改**：EXEC 全程 `git status --porcelain` 非 untracked 变更=0（三 run 跑前实测）。
3. **receipt 自证**：三 run machine receipt `sourceDigests["e2e/full.e2e.ts"]` sha256 `f55f57f3…` 与本树亲算全等（run1 实测前缀对号）。
4. **Key 物料机扫**：收据四文件 `sk-*`/`Bearer` 扫描零命中；Key 值/fingerprint 零入树；`.env*` 全程 ABSENT（六轮探针在卷）。

## EXIT 契约落点（双向）

- **J-R1 复现成立 ≠ 修复 ≠ 归因定谳收尾 ≠ 行翻转 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**——本 EXEC 仅主张判别读数与行内更新建议。
- 三 run 红色 EXIT 原值记账（预期尾段红 retained · 不冲销 G7W exp2/G7U trio 任何在案台账）；G7W-era `×2` 读数 retained（复跑零冲销）；`:109` 行 P2 OPEN 零翻转；G7X 尾段线 P1 OPEN 零触碰零归因。
- **后继处置权全归协调方**：`:109` 行内更新落字与否 / 是否补足第 3 可测样本 / 产品修复刀立项与方向 / erratum #2 双行号复裁 / post-prove 双审派单。

## Non-claims

Not a pass · not fixed · not coding（EXEC 零码改 · tracked 树零改机检在卷）· not 归因定谳（J-R1=候选非定谳 · 2/3 可测样本限如实）· not 产品 prompt 缺陷定谳 · not 致死性定谳（in-sample 非致死读数 · 行原文维持）· not G7X 尾段归因（四件套隔离生效 · 零触碰）· not `:109` 行翻转（P2 OPEN 维持）· not G7T 并线 · not trio green（1/1/1 retained）· not suite green · not HA · not covered · not `releaseEvidence=true` · not nail · not SSOT 翻转 · **`actualSpendCny=null`** · alone ≠ dual · **STOP——post-prove 双审由协调方另派 · 禁自批 · 已 push 待审**

---
*SUMMARY · QGEN-P2 EXEC · 2026-10-08 · env 混杂排除完成：钉值 trio 基线口径 ×3 判别复跑——可测 DB 面 2/2 run 复现 `schema_validation_failed ×2`（journey-start 窗 · 恒 2 · 吸收路径照旧 completed）→ **J-R1 复现成立：unset 端点混杂排除 · 产品 prompt/validator 面候选（修复另刀）**· run1 仪器缺口如实（sidecar ROOT 缺陷 · R-C 同形 · 零补跑）· :109 行内更新建议全文上卷（行 P2 OPEN 零翻转）· est ≤21 ≤24 · Pins 零翻转 · `actualSpendCny=null` · **STOP——post-prove 双审由协调方另派 · 禁自批 · STOP***
