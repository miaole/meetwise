# Receipt 01 — 实验一 · golden 冷启归因（G7W EXEC · 主臂 A ×3 + 升压臂 B ×3 · 共 6 run / 12 golden 执行 · 全绿）

**Line**: G7W · **Date**: 2026-10-08（UTC）· **worktree**: `/Users/miaole/Desktop/golucky/meetwise-line-g7w` · branch `line/g7w-discriminator`（rebase 后 tip `10e25f38` · 双审 PRE 链 mw-e2e-ha `1cfb0cdf` + mw-model-op `10e25f38` 在卷）· **实跑 code**: 工作树内容 = `10e25f38`（EXEC 前后 tracked 树零改 · 三钉 blob 前后全等 · SUMMARY §码面机检）

## EXEC 定值兑现（协调方落字）

| 定值 | 兑现 |
|---|---|
| 过滤机制=`E2E_UI_GREP`→`--grep` 契约内透传 | **兑现**——`scripts/run-e2e-ui.mjs:193`（tip 实测行号恰 `:193`）：`if (env.E2E_UI_GREP?.trim()) playwrightArgs.push('--grep', env.E2E_UI_GREP.trim())`；env 透传链码面亲读（`run-e2e-isolated.mjs:1950` `inheritedEnv={...process.env}` 仅剥离云凭据 denylist · `E2E_UI_GREP`/`MODEL_API_KEY` 存活）；grep 值=`golden path`（仅选中 golden.spec.ts test `:10` 正身 · middleware 测试不在实验面） |
| 升压臂=总样本 ≥6 / 预算 +≤15 一次成型 | **兑现**——A 臂 3 run 零红 → 预注册触发条件成立 → B 臂追加 ×3 轮（harness §1.1 预注册两形态中「追加 ×3 轮」；`--repeat-each` 透传无契约机制故不走）→ 总样本恰 6 run（12 golden 执行）· B 臂 live est ≤12 ≤ +15 |

## 预注册（沿 FLK · EXEC 前写死）

- **假设**：H-G1 chromium/worker 冷启（suite 首测+栈刚就绪窗口）· H-G2 简历页组件首渲染/供给慢（consent 门/上传表单）· H-G3 宿主资源/位次竞争。判读仪表=trace（`retain-on-failure` 零改动）+ 分段时间轴 + 页快照（error-context）；判读表=harness §1.1 五行。
- **反例分支**：≥1 红 → 复现成立 → 分段归因；A 全绿 → 升压臂 B（预注册非事后补偿）；B 仍全绿 → 环境特异挂起回协调方（Ban 定谳「永不复现」）。

## 七字段逐 run 全记录（6/6 · 全 attempt 台账 · 零删改）

| # | run 窗口（UTC） | 条件 | EXIT | tally | golden 分段时长（chromium / mobile） | 备注 |
|---|---|---|---|---|---|---|
| 1 | 00:17:28 → 00:18:59 | **冷栈+冷 build**（worktree 无 `.next/BUILD_ID` → runner 先 `next build` 再 `next start` · runner 原生行为 OB-4） | 0† | **2 passed (8.1s)** · 零 ✗ | **3.6s / 3.4s** | H-G1 最高红概率条件（build+全冷）下绿 |
| 2 | → 00:19:55 | 暖 build · 冷栈（每 run 重 spawn） | 0 | 2 passed (7.3s) | 3.0s / 3.4s | |
| 3 | → 00:20:28 | 暖 build · 冷栈 | 0 | 2 passed (7.7s) | 3.6s / 3.3s | A 臂收 |
| 4 | → 00:21:18（log mtime） | 暖 build · 冷栈 | 0 | 2 passed (8.6s) | 4.4s / 3.4s | B-1 |
| 5 | → 00:21:40 | 暖 build · 冷栈 | 0 | 2 passed (8.3s) | 4.3s / 3.2s | B-2 |
| 6 | → 00:22:00 | 暖 build · 冷栈 | 0 | 2 passed (7.6s) | 3.7s / 3.1s | B-3 |

† **OB-1 仪器注记（如实）**：run1 显式 EXIT 捕获变量在 zsh 管道下未展开（`PIPESTATUS` vs zsh `pipestatus`）——EXIT=0 以四证承担：playwright tally `2 passed` + 零 `✗` 行 + wrapper 正常收尾 + 后台复合进程 exit 0；run2-6 已改直录法（`> log 2>&1; echo EXIT=$?`）显式捕获全 `0`。

- **CMD 原文**（6 run 同一）：`E2E_UI_GREP='golden path' pnpm run e2e:ui:isolated`（wiring `package.json:279` blob `0afb3bd2` tip 复核不变）。
- **实跑 SHA**：`10e25f38`（EXEC 前后 tracked 树零改机检）。
- **Key presence（name-only）**：`MODEL_API_KEY=set`（`. ~/.meetwise-secrets/load-model-api-key.sh` source 注入 · 进程环境）· `.env*` 全程 ABSENT（`ls .env* apps/*/.env*` 零命中）· **OB-3**：本机 loader 仅导出 `MODEL_API_KEY`，`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset（G7U 收据口径为 `dashscope-cn-beijing`/`qwen-plus`——env 口径差如实登记，协调方裁定可比性权重）。
- **机器 receipt**：UI 面 `e2e:ui` 无 LOCAL_E2E_RECEIPT（G7S/G7T/G7U 同口径）——log tally + EXIT 即记录。
- **trace**：全绿 → `retain-on-failure` 无失败 trace 可留（预期行为 · 非缺口）；分段读数以 list reporter 逐测时长承担（3.0–4.4s ≪ 20s 超时窗）。

## 判读（判读表 harness §1.1 · 逐行落字）

- **第 4 行命中（三跑全绿且分段 <5s）**→ 假说削弱（非证伪）→ 升压臂 B（预注册触发）→ **B 臂 3 run 亦全绿**。
- **归因定谳=未定谳（削弱+挂起）**：H-G1/H-G2 在本刀 6 run / 12 执行（含冷栈+冷 build 最高红概率条件）**零复现**，分段时长 3.0–4.4s 全部 ≪ 20s 超时窗——两假说置信度显著下降；H-G3（宿主资源/位次竞争）**不可在契约内证伪**（破坏性注入=Ban · harness §1.1 慢速因子纪律）。
- **归因残留（如实挂起回协调方）**：与 G7U 在卷 2R/1G（EXEC CMD2 红 + post-dual 双 re-run 一红一绿 3.1s）合并读——红样本全部产生于 G7U 两轮（全 suite 上下文 · recruiting-bound/uc018 长旅程同场），本刀过滤单跑上下文 12/12 全绿；**「G7U 两轮环境特异（宿主负载/栈启动抖动）」为残留候选**，是否成立、是否立 backlog 行、是否需全 suite 上下文复现臂——裁定权归协调方（Ban 本席就地定谳 · Ban 定谳「永不复现」）。
- **表外值域**：零（无红 → 无判读表外步骤）。

## 预算

est ≤24 live（12 执行 × 1–2 次简历摄取调用 · est-not-counter）⊆ A ≤15 + B ≤15 定值 · 无超限中止 · **`actualSpendCny=null`**。

---
*Receipt 01 · G7W 实验一 · 2026-10-08 · golden ×6 run / 12 执行全绿（冷+build 条件含）· EXEC 定值（GREP `:193` 透传 / ≥6 样本 / +≤15）兑现 · 判读表第 4 行 → 假说削弱非证伪 → 环境特异残留挂起回协调方 · Ban 定谳永不复现 · OB-1/OB-3/OB-4 如实 · `actualSpendCny=null` · STOP*
