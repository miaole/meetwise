# FIX-G3：全栈 E2E 进 CI、sse-slot 时序断言去抖、全仓冲突标记扫描

> 审查域：**mw-e2e-ha**。本刀需要 mw-e2e-ha **独立审查**，实现方不自审、不自合并。
> 来源：`review-refactor-189c0054a.md` 的 P1-2（#98）、P2-1（sse-slot flaky）、P2-6（#178 残留），第 6 节 G3。
> 分支：`fix/g3-ci-e2e-gate`，基底 `origin/main` = `9c9809446`（PR #237 `line/final-polish` 没有改 workflow 和 sse-slot proof，所以不基于它）。
> 状态：NOT_HA，releaseEvidence=false。本刀只改 CI 接线与测试，不改产品代码。时间均为北京时间。

## 1. 改了什么

| 文件 | 改动 | 性质 |
|---|---|---|
| `.github/workflows/ci.yml` | ① `secrets-scan` job 末尾新增 step「合并冲突标记全仓扫描」；② 文件末尾新增 job `e2e-isolated`（PR + push main，跑 `pnpm e2e:isolated`）；③ 两处注释改成与新事实一致（sse-slot 断言口径、e2e 已接入） | 只新增 job/step；`secrets-scan` 前 2 步、`verify` 全部 104 步逐项不变（脚本比对，见第 4 节） |
| `.github/workflows/nightly.yml` | 新增 job `e2e-isolated`（每日 UTC 18:00 ≈ 北京 02:00，及手动触发） | `live-model` 9 步不变 |
| `apps/api/test/sse-principal-slot.proof.ts` | 时序断言改为条件驱动（见第 2 节） | 只改测试 |
| `scripts/conflict-marker-scan.mjs`（新） | 全仓冲突标记扫描 | 新增 |
| `scripts/conflict-marker-scan.proof.mjs`（新） | 扫描器种植证明 | 新增 |
| `package.json` | 新增 `conflict-markers:check`、`conflict-markers:prove` | 新增 2 行 |
| `scripts/ai-docs/public-text-policy.mjs` / `.proof.mjs` | 受管文件计数上限 2530→2533（本刀新增 3 个受管文件，按 CAP-SANCTION 惯例四联动点同步） | 计数预算 |

## 2. sse-slot 不稳的根因（已核实）

旧断言：在 `sleep(2100)` 窗口里，counting stub 恰好 +5（5 条 holder 各轮询 1 次）。

用插桩副本记录 userA 每次 `asPrincipal` 的时间（相对首批连接发起时刻，ms）：

```
窗口起点 T = 4030
窗口前：   13,14,15,15,16（catch-up） | 2014..2020（第 1 次轮询） | 4015..4020（第 2 次轮询）
窗口结束： 再多 6015..6021（第 3 次轮询）→ +5
```

- SSE 的响应头要等泵第一次写（第一个 2s 周期后的 ping）才发出，所以每次 `openSse` 约 2s 才返回。
- 因此窗口起点（userB 那条连接打开之后）≈ 4030ms，而 5 条 holder 的第 2 次轮询在 4015–4020ms，**只比窗口起点早 10–20ms**。
- 负载下（审查时与 e2e 并发）这个先后一旦翻转，第 2、3 次轮询都会落进窗口，计数变成 +6..+10。这就是首跑红、单独重跑绿的原因。
- 证据文件：`/workspace/ua-snapshots/fix-g3/root-cause-timeline.log`、`root-cause-instrumented.proof.ts.txt`（盒子上，不进仓）。

修法（没有加大任何 sleep）：

1. 每条连接用独立 stream id（`iv-slot-1..3`、`qz-slot-1..2`；被拒的是 `iv-reject`、`qz-reject`、`dx-reject`），events 包装器按 `principal|streamId` 计数。stub 对任意 id 都返回同样结果，被测语义不变。
2. 用 `waitUntil`（25ms 步长轮询，20s 超时）等「每个 holder 至少完成 2 个轮询周期」。
3. 在同一个同步段里取 stub 增量和 holder 轮询之和，断言**两者相等**且 ≥10，没有未归因的轮询。
4. 断言 3 条被拒连接的 stream id **零 catch-up、零轮询**。这比旧的「总数 +5」更强：旧断言只看总数，新断言逐连接归因。
5. 断开后的「槽归零」从 `sleep(2500)` 改为等待条件（槽在 pump 返回后的 finally 才释放，所以槽 = 0 即全部轮询循环已退出）。
6. 「释放后再等一个周期 stub 不增加」保留原来的 2100ms 观察窗：这是负向观察，槽归零后已无循环，不存在竞态。

断言数从 19 条变为 20 条（拆成「各 holder ≥2 周期」「增量 = holder 之和」「被拒零调用」三条，删掉旧的「恰 +5」一条）。`e2e-parity:check/prove` 退出码 0。

**需要同步但本刀没有改的文档**（共享进度文档按约定不在本刀改，合并时由协调方统一更新）：
- `ai-docs/architecture/current-runtime-truth.md:274` 仍写「随后一个 2s 周期 stub 只 +5（holders）」，应改为「每个 holder ≥2 个周期，stub 增量 = holder 轮询之和，被拒连接零调用」。

## 3. 全栈 E2E 接入（#98）

- **nightly**：`nightly.yml` 新增 job `e2e-isolated`，命令 `pnpm e2e:isolated`。
- **per-push / PR**：`ci.yml` 新增 job `e2e-isolated`，与 `verify` 并行。
  - 耗时评估：套件本身本机约 35s（审查报告 3c 节），加安装、拉 pgvector 镜像、迁移，估计 5–8 分钟；`verify` 最近一次约 14 分钟（run 42808436613：19:33:31→19:47:56）。所以不拖慢 PR 墙钟，直接跑完整套件，不需要缩成最小冒烟。
  - 加了 `concurrency`（同一 ref 新推送取消旧跑），避免重复的真模型调用。
- **硬门语义**：缺 `MODEL_API_KEY` 时输出 `::error::` 并退出 1。全栈 E2E 按 #98 规则禁止 skip-if-absent，未跑 ≠ 绿。这与 `live-model` job 的「缺 secret 跳过」约定刻意不同。
- `MODEL_ENDPOINT_PROFILE` 取仓库变量 `vars.E2E_MODEL_ENDPOINT_PROFILE`，留空时由 runner 默认 `dashscope-cn-beijing`（`scripts/e2e-live-capability-env.mjs`）。`MODEL_NAME`、`MODEL_FAST_NAME` 为空时会 unset，走仓库默认。

**已知且预期的红：**
1. **G2 合并前会红**：`generation_duplicate_question`（审查 P1-1，复现 2/2）。
2. **仓库目前没有任何 Actions secret**（`gh api repos/miaole/meetwise/actions/secrets` → `total_count: 0`，nightly-live-model 日志里 `MODEL_API_KEY` 为空）。在配置 secret 之前，两个 `e2e-isolated` job 都会以「未配置 MODEL_API_KEY」红。

**待用户拍板（本刀不替用户决定）：**
- 是否在仓库配置 `MODEL_API_KEY`（可选 `MODEL_NAME`、`MODEL_FAST_NAME`、变量 `E2E_MODEL_ENDPOINT_PROFILE`）。
- 是否接受每个 PR / main push 都有一次真模型 E2E 的调用成本。如果不接受，可以把 `ci.yml` 的 `e2e-isolated` 删掉、只保留 nightly。
- G2 合并、E2E 转绿之后，是否把 `e2e-isolated` 加进 main 分支保护的必过检查（当前必过只有 `verify`、`secrets-scan`）。

## 4. 冲突标记扫描（#178 残留）

- `scripts/conflict-marker-scan.mjs`：`git grep -I` 扫 git 跟踪文件中三种整行标记：7 个 `<` 开头且后跟空格或行尾、整行恰为 7 个 `=`、7 个 `>` 开头且后跟空格或行尾。CR 可选，CRLF 文件也能扫到。
- 排除：二进制（`-I`）；`node_modules`、`vendor`、`third_party`、`third-party`、`.pnpm-store`。
- 输出只报「文件:行号:类型」，不回显行内容。在 Actions 里同时打 `::error file=…,line=…::` 注解。
- 退出码：0 = 零命中；1 = 有命中；2 = git 调用失败（不当作干净）。
- 标记字符串在运行时拼出，脚本自身不含字面标记。
- 放在 `secrets-scan` job（已是必过检查）里，所以一合入就是阻断门。
- 回归核对：同一正则对历史提交 `2fab7946` 扫出 `provider-egress-inventory.json:1745/1748/1766` 三处，正是 #178 当时的冲突残留。
- proof 第一次跑就抓到一个真缺陷：CRLF 文件的分隔行 `=======\r` 漏报，已修。

## 5. 验证矩阵（本机，2026-11-10，Node 22.23.3，pnpm 10.18.0）

| 命令 | 退出码 | 备注 |
|---|---|---|
| `actionlint .github/workflows/ci.yml .github/workflows/nightly.yml`（v1.7.7） | 0 | 改前基线也是 0。盒子上没有 shellcheck，所以 `run:` 脚本没有经过 shellcheck |
| YAML 解析 + 结构比对（python yaml） | 0 | ci：jobs `secrets-scan, verify` → 加 `e2e-isolated`；`secrets-scan` 2→3 步且前 2 步相同；`verify` 104 步逐项相同；触发器不变。nightly：`live-model` 9 步相同 |
| `pnpm sse-slot:prove` × 10（空闲） | 0 ×10 | 10/10 通过，每次约 13–14s。每次都是 stub +10 = holders +10 |
| `pnpm sse-slot:prove` × 5（16 个忙循环压 8 核） | 0 ×5 | 5/5 通过，每次约 16–17s |
| 改前 proof，16 个忙循环下 × 6 | 0 ×6 | 本机没能复现旧红；根因靠时间线核实（第 2 节），不是靠复现 |
| `pnpm conflict-markers:prove` | 0 | 10 条断言全过（Node 20 下也是 0） |
| `pnpm conflict-markers:check`（本仓） | 0 | 0 处 |
| `pnpm e2e-static-guards:check` / `:prove` | 0 / 0 | |
| `pnpm e2e-parity:check` / `:prove` | 0 / 0 | |
| `pnpm e2e-platform:check` | 0 | |
| `pnpm docs:check` | 0 | 上限改到 2533 之后。改前（main 届扫 2530 = 上限）加上本刀 3 个新文件会报 `PTP_FILE_LIMIT` |
| `pnpm e2e:isolated` | 未在本机跑 | 已知会因 G2 问题红（审查报告 2/2）。不为验证 CI 接线额外消耗真模型调用 |

原始日志：`/workspace/ua-snapshots/fix-g3/`（盒子上）。

## 6. 和其他组的关系

- **G1**：按约定 workflow 由 G3 统一改。G1 的「旧账本 → tip」升级路径 proof 出来后，只需在 `verify` 里 `migrate:prove` 附近**新增**一步 `pnpm <G1 脚本>`。本刀没有预留空 step。
- **G2**：G2 合并后 `e2e-isolated` 才可能转绿（还需要配置 secret）。
- **计数上限**：PR #237 和 G1/G2/G4 如果也新增受管文件，会在 `MAX_FILES` 一处冲突，按 CAP-SANCTION 惯例取并集重算。
- **没做**：`smoke/adaptive-attack.ts` 接线（#113，属于 mw-privacy-int）；`e2e:ui:isolated` 接入（需要 web 生产构建和 Playwright 浏览器，耗时另评）。
