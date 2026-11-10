# FIX-G3：sse-slot 时序断言去抖、全仓冲突标记扫描（全栈 E2E 按用户决定不进 CI）

> 审查域：**mw-e2e-ha**。本刀需要 mw-e2e-ha **独立审查**，实现方不自审、不自合并。
> 来源：`review-refactor-189c0054a.md` 的 P1-2（#98）、P2-1（sse-slot flaky）、P2-6（#178 残留），第 6 节 G3。
> 分支：`fix/g3-ci-e2e-gate`，基底 `origin/main` = `9c9809446`（PR #237 `line/final-polish` 没有改 workflow 和 sse-slot proof，所以不基于它）。
> 状态：NOT_HA，releaseEvidence=false。本刀只改 CI 接线与测试，不改产品代码。时间均为北京时间。

## 1. 改了什么

| 文件 | 改动 | 性质 |
|---|---|---|
| `.github/workflows/ci.yml` | ① `secrets-scan` job 末尾新增 step「合并冲突标记全仓扫描」；② `verify` job 加 `timeout-minutes: 30`（约 15 分钟实际耗时的两倍，避免 proof 卡死占满默认 360 分钟）；③ sse-slot 注释改成与新断言口径一致；④ 全栈 E2E 按用户决定不进 CI：不新增 `e2e-isolated` job，注释恢复「不在 per-push / nightly」，并注明本地手跑 | `secrets-scan` 原 2 步不变、末尾纯新增 1 步；`verify` 既有 104 步逐项不变，只加 job 级 timeout |
| `.github/workflows/nightly.yml` | 不新增 job（曾提案加 `e2e-isolated`，用户决定 CI 太重撤回）。结构与 base `9c9809446` 相同 | `live-model` 9 步不变 |
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
4. 断言 3 条被拒连接的 stream id **零 catch-up、零轮询**。这比旧的「总数 +5」归因更强；频率覆盖由新增下界断言补回。
5. 频率下界（P2-1，mw-e2e-ha 在 `b947f729` 上指出：只等 ≥2 周期时，把间隔改成 200ms 新 proof 仍 EXIT 0）：观察窗为「每个 holder ≥2 周期且自 t0 起不少于约 3500ms」，窗结束时每条 holder 轮询次数 ≤3。选次数上界，不受机器负载下计时拉长影响。3500ms 单独当退出条件会因相位（第一条周期可能在 t0 时已到期）在约 2000ms 就凑满 2 周期而误红，故与次数上界合用。间隔若退化为 200ms，3500ms 窗内每 holder 远超 3 次。
6. 断开后的「槽归零」从 `sleep(2500)` 改为等待条件（槽在 pump 返回后的 finally 才释放，所以槽 = 0 即全部轮询循环已退出）。
7. 「释放后再等一个周期 stub 不增加」保留原来的 2100ms 观察窗：这是负向观察，槽归零后已无循环，不存在竞态。

断言数从 19 条变为 21 条（拆成「各 holder ≥2 周期」「增量 = holder 之和」「被拒零调用」三条，删掉旧的「恰 +5」一条，再补「观察窗内每 holder ≤3 次」一条）。`e2e-parity:check/prove` 退出码 0。

**需要同步但本刀没有改的文档**（共享进度文档按约定不在本刀改，合并时由协调方统一更新）：
- `ai-docs/architecture/current-runtime-truth.md:274` 仍写「随后一个 2s 周期 stub 只 +5（holders）」，应改为「每个 holder ≥2 个周期，stub 增量 = holder 轮询之和，被拒连接零调用」。

## 3. 全栈 E2E 不进 CI（#98，用户决定）

用户决定：CI 太重，全栈 E2E 不进 CI / nightly，也不配置 `MODEL_API_KEY`。本地有 Key 时手跑 `pnpm e2e:isolated`。

- `ci.yml` / `nightly.yml` **不**新增 `e2e-isolated` job，也不为它增加 step / env / secret。`nightly.yml` 结构与 base `9c9809446` 相同。
- `ci.yml` 里关于全栈 E2E 的注释恢复「不在 per-push；nightly 也没有跑 e2e:isolated / e2e:ui:isolated」，并注明上述用户决定。
- 本刀不配置任何 Actions secret / 变量。必过检查仍只有 `verify` 和 `secrets-scan`。
- 曾在 PR 中间提案过接入，按这次决定已撤回，避免 CI 上缺 Key 的常红 job。

## 4. 冲突标记扫描（#178 残留）

- `scripts/conflict-marker-scan.mjs`：`git grep -I` 扫 git 跟踪文件中三种整行标记：7 个 `<` 开头且后跟空格或行尾、整行恰为 7 个 `=`、7 个 `>` 开头且后跟空格或行尾。CR 可选，CRLF 文件也能扫到。
- 排除：二进制（`-I`）；`node_modules`、`vendor`、`third_party`、`third-party`、`.pnpm-store`。
- 输出只报「文件:行号:类型」，不回显行内容。在 Actions 里同时打 `::error file=…,line=…::` 注解。
- 退出码：0 = 零命中；1 = 有命中；2 = git 调用失败（不当作干净）。
- 标记字符串在运行时拼出，脚本自身不含字面标记。
- 放在 `secrets-scan` job（已是必过检查）里，所以一合入就是阻断门。
- 回归核对：同一正则对历史提交 `2fab7946` 扫出 `provider-egress-inventory.json:1745/1748/1766` 三处，正是 #178 当时的冲突残留。
- proof 第一次跑就抓到一个真缺陷：CRLF 文件的分隔行 `=======\r` 漏报，已修。
- setext 误报（P3，mw-e2e-ha 指出）：markup 文件里「非空标题行」下一行恰 7 个 `=` 会被当成冲突分隔符。已修：仅在 md/mdx/markdown/mkd/rst/txt/adoc/asciidoc 中、且该文件没有 `<<<<<<<` / `>>>>>>>` 时，把这类行当作 setext 下划线抑制。非 markup 文件的孤立 `=======`、空行后或文件首的孤立 `=======` 仍报。已知限制：markup 文件中紧跟正文、且同文件没有尖括号标记的孤立残留会被当成 setext 而不报——优先消除误报。规避：用 `#` 标题，或把下划线改成不是 7 个 `=`。

## 5. 验证矩阵（本机，2026-11-10，Node 22.23.3，pnpm 10.18.0）

| 命令 | 退出码 | 备注 |
|---|---|---|
| `actionlint .github/workflows/ci.yml .github/workflows/nightly.yml`（v1.7.7） | 0 | 改前基线也是 0。盒子上没有 shellcheck，所以 `run:` 脚本没有经过 shellcheck |
| YAML 解析 + 结构比对（python yaml） | 0 | 补强后：ci jobs 仍为 `secrets-scan, verify`（不增加 `e2e-isolated`）；`secrets-scan` 2→3 步且前 2 步相同；`verify` 104 步逐项相同，仅加 job 级 `timeout-minutes: 30`；触发器不变。nightly 与 base `9c9809446` 结构相同 |
| `pnpm sse-slot:prove` × 10（空闲） | 0 ×10 | 10/10 通过，每次约 13–14s。每次都是 stub +10 = holders +10 |
| `pnpm sse-slot:prove` × 5（16 个忙循环压 8 核） | 0 ×5 | 5/5 通过，每次约 16–17s |
| 改前 proof，16 个忙循环下 × 6 | 0 ×6 | 本机没能复现旧红；根因靠时间线核实（第 2 节），不是靠复现 |
| `pnpm conflict-markers:prove` | 0 | 初版 10 条；补强后 14 条全过（含 setext 抑制与孤立残留边界） |
| `pnpm conflict-markers:check`（本仓） | 0 | 0 处 |
| `pnpm e2e-static-guards:check` / `:prove` | 0 / 0 | |
| `pnpm e2e-parity:check` / `:prove` | 0 / 0 | |
| `pnpm e2e-platform:check` | 0 | |
| `pnpm docs:check` | 0 | 上限改到 2533 之后。改前（main 届扫 2530 = 上限）加上本刀 3 个新文件会报 `PTP_FILE_LIMIT` |
| `pnpm e2e:isolated` | 未跑 | 按用户决定不进 CI / 不配 Key；本地有 Key 时手跑 |

原始日志：`/workspace/ua-snapshots/fix-g3/`（盒子上）。

## 6. 和其他组的关系

- **G1**：按约定 workflow 由 G3 统一改。G1 的「旧账本 → tip」升级路径 proof 出来后，只需在 `verify` 里 `migrate:prove` 附近**新增**一步 `pnpm <G1 脚本>`。本刀没有预留空 step。
- **G2**：全栈 E2E 按用户决定不进 CI，G2 合入与否不再挡住本刀 CI。本地手跑 `pnpm e2e:isolated` 仍可能受 G2（`generation_duplicate_question`）影响。
- **计数上限**：PR #237 和 G1/G2/G4 如果也新增受管文件，会在 `MAX_FILES` 一处冲突，按 CAP-SANCTION 惯例取并集重算。
- **没做**：`smoke/adaptive-attack.ts` 接线（#113，属于 mw-privacy-int）；`e2e:ui:isolated` 接入（需要 web 生产构建和 Playwright 浏览器，耗时另评）。

## 7. 审查记录与合并前补强（2026-11-10，北京时间）

mw-e2e-ha 在 head `b947f729` 上独立审查 **PASS**（只审未改未合，NOT_HA，releaseEvidence=false）。无阻塞项。按审查建议在合并前做了以下补强，并纳入用户关于 E2E 的新决定：

1. **P2-1 轮询频率下界**：`sse-principal-slot.proof.ts` 新增断言——观察窗为「每个 holder ≥2 周期且自 t0 起不少于约 3500ms」，窗结束时每条 holder 轮询 ≤3 次。选次数上界（不受机器负载下计时拉长影响）。反证：把 `DEGRADED_POLL_MS` 临时改成 200ms，proof 必须 EXIT 1，然后恢复。正常情况空闲 ×5、8 核加压 ×3，全部要求 EXIT 0。
2. **P3 `verify` timeout**：`ci.yml` 的 `verify` job 加 `timeout-minutes: 30`（实际耗时约 15 分钟的两倍），避免 proof 卡死占满默认 360 分钟。按用户决定不保留 `e2e-isolated` job，因此不再给它加 timeout。
3. **P3 setext 误报**：`conflict-marker-scan.mjs` 修掉 markup 文件里 7 个 `=` 的 setext 标题下划线误报（见第 4 节）；proof 增补对应种植用例。
4. **文档**：本节与第 2 节第 4/5 条同步把「更强」改为「归因更强；频率覆盖由新增下界断言补回」。**不改** `current-runtime-truth.md`（按约定等合并后统一同步）。未新建受管文件。
5. **用户决定（覆盖原 #98 接线提案）**：CI 太重，全栈 E2E 不进 `ci.yml` / `nightly.yml`，不配置 `MODEL_API_KEY`。本地手跑 `pnpm e2e:isolated`。已从两个 workflow 删除曾提案的 `e2e-isolated` job 及只为它加的 step/env，nightly 恢复为 base 结构。因此本刀合入后 CI 不应再有缺 Key 的常红 e2e job。

补强后本机复跑（2026-11-10，北京时间，Node 22，pnpm 10.18.0）：

| 命令 | 退出码 | 备注 |
|---|---|---|
| 反证：`DEGRADED_POLL_MS` 2_000→200，再 `pnpm sse-slot:prove` | 1 | 频率下界断言红：各 holder=17，elapsed=3505ms；其余断言仍绿。随后 `git checkout` 恢复 `sse-pump.ts` |
| `pnpm sse-slot:prove` ×5（空闲） | 0 ×5 | 各 holder=2，stub +10，elapsed≈4002–4009ms |
| `pnpm sse-slot:prove` ×3（8 个 node 忙循环压 8 核） | 0 ×3 | 各 holder=2，stub +10，elapsed≈3970–3997ms |
| `pnpm conflict-markers:prove` | 0 | 14/14 PASS |
| `pnpm conflict-markers:check` | 0 | 0 处 |
| `pnpm docs:check` | 0 | scanned 2533 = cap 2533（未新建或删除受管文件，无需重算） |
| `actionlint` v1.7.7（ci.yml + nightly.yml；本机无 shellcheck） | 0 | |
