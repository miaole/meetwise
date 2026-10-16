# Receipt 01 — CMD1 `pnpm e2e:isolated`（G7U EXEC · attempt-1 仪器误发 + attempt-2 真跑 · 全记录 · Ban retry-to-green 界定随卷）

**Line**: G7U · **Date**: 2026-10-07（UTC）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7u` · branch `line/g7u-timing-face`

## attempt-1（仪器误发 · 零测试执行 · 非业务红 · 非三 CMD 计数 attempt）

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm run e2e:isolated`（wiring `package.json:278` @`0afb3bd2`） |
| EXIT | **1**（machine receipt `.tmp/e2e-receipts/2026-10-07T22-21-52-002Z-87867-e5752648-e1e6-40c9-9947-c4654563d838.json`：outcome=failed · exitCode=1 · **durationMs=6581** · assertionCount=null · **无 failureClass** · 无 `E2E_FAILURE_CLASS` 上屏） |
| 时间戳（UTC） | start 22:21:45Z → end 22:21:52Z |
| 实跑 SHA | 工作树内容 = 后续 commit `dbed8a6f` 的 spec 修改（内容同一性机检见 SUMMARY §码面） |
| Key presence | **KEY-EMPTY**（事后 name-only 探针复现：wrapper 以 `eval "$(loader)"` 捕 stdout=空——loader 为 source 语义，`export` 落在子 shell 不出海） |
| 关键输出 | 容器 boot + `migrations: applied=142` 后内层立即死于 `run-e2e.mjs` provider 门（`live_provider_key_missing` 快速 throw 路径，`scripts/run-e2e.mjs:57`）——**零断言执行、零 live 模型调用、零 ✗ 行** |
| 预算 | 0 live（est-not-counter）· `actualSpendCny=null` |

**误发定性**：实现方 wrapper 仪器缺陷（Key 注入语义错），非被测码业务读数——`assertionCount=null` + 6.5s 早死于 provider 门 + 无 failureClass 三证在卷。G7T EXEC 先例（attempt-2 同码仪表化迭代合规）+ G7S sidecar v1 仪器缺口 OB 先例同族。attempt-2 = 三 CMD 计数的 CMD1 正身。

## attempt-2（三 CMD 计数的 CMD1 · 真跑）

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm run e2e:isolated`（wiring `package.json:278` @`0afb3bd2` · 同上） |
| EXIT | **1**（machine receipt `.tmp/e2e-receipts/2026-10-07T22-30-00-513Z-89200-5abede58-3f1a-4d44-a528-17abe94593c0.json`：outcome=failed · exitCode=1 · **failureClass=api** · durationMs=40560 · assertionCount=null） |
| 时间戳（UTC） | start 22:29:20Z → end 22:30:00Z（wrapper 启动含 `KEY-PRESENT (source)` name-only 探针 PASS 在卷） |
| 实跑 SHA | 工作树内容 = `dbed8a6f`（spec 修改 +72/−0；产品码 blob 链前=链后全等 · SUMMARY §码面） |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader source 注入 · 进程环境）· `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` · `MODEL_NAME=qwen-plus`（G7R F-A-1 协调方口径）· `.env*` 全 ABSENT |
| 关键输出 | `migrations: applied=142` · `E2E_FAILURE_CLASS class=api` · `ISOLATED_POSTGRES_OUTPUT_WITHHELD` · `LOCAL_E2E_RECEIPT … release_evidence=false`——**与 G7S EXEC CMD1 同形**（G7S：EXIT=1 · class=api · 38428ms · 断言原文经 withhold 不可回读） |
| 预算 | live 全 E2E 旅程估 ≤10（est-not-counter）· `actualSpendCny=null` |

## 五分类判读（如实 · 不定谳）

- class=**api** · duration 与 G7S CMD1 同量级（40.6s vs 38.4s）→ **G7S 既有 retained api 红面同形**（HTTP full E2E 面 · 非红① begin 面——G7S 时点 begin 面亦未红于 api journey 此段）；断言 ✗ 原文经 withhold 契约（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结）不可回读，C-HA/withhold 零触碰守住。非本刀指名面（本刀=红① begin 时序面，UI 面 spec 已证 begin 通过），**Ban 黏连归咎**；精确拒因甄别留协调方/post-dual。
- sidecar：attempt-1 侧 `PGPORT missing` 未启（仪器缺陷②）；attempt-2 侧无留痕（sidecar 于 attempt-2 修复后仅随 CMD2/CMD3 部署）——**CMD1 侧无 sidecar 时间线**，仪器缺口如实登记（G7S OB 同族）。

---
*Receipt 01 · G7U CMD1 · 2026-10-07 · attempt-1 仪器误发（Key 注入语义）+ attempt-2 真跑 EXIT=1 class=api 40.6s（G7S 同形）· 两档全记录 · Ban retry-to-green 界定=误发零测试执行非红档择优 · 预算 est ≤10 · `actualSpendCny=null` · STOP*
