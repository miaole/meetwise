# TSCGATE-2 修复四批+门禁点亮刀 — run manifest（EXEC 跑账）

- 蓝本：REQUEST rev4 @`e237e82e`（ai-docs/delivery/harness/tscgate2-fixbatches.md·唯一蓝本，协调方正式授权 EXEC）
- worktree：`/Users/miaole/Desktop/golucky/meetwise-line-tscgate2` · 分支 `line/tsc-fix-batches` · EXEC 起点 HEAD = `e237e82e1e71dbd243c3d6c841daebf93d6eaeb9`（工作树干净亲证）
- base（代码）= 主线 `c17804a5`（蓝本载明：含 E2EFAIL-1 修复补收 3a2a2e2b·B1 已消·残余 10 错）
- 环境：tsc 6.0.3（`node_modules/.bin/tsc`）· turbo 2.10.0 · pnpm 10.18.0（packageManager 字段）· 零依赖安装改动·零 .env 触碰

## 跑账（全账·按发生序）

| # | 命令 | 性质 | EXIT | 用途 |
|---|------|------|------|------|
| R1 | `tsc -p <tmp>/tsconfig.e2e.baseline.json`（临时配置首次误放 /tmp，include 相对解析 TS18003 空选；即弃重写根级临时文件） | 基线复现 | 2 | 复现蓝本残余 10 错（逐行与 erratum 吻合·01 附录） |
| R2 | `tsc -p tsconfig.e2e.baseline.tmp.json`（根级临时·用后即删） | 基线复现（canonical 口径） | 2 | **10 错原值**：B2 proof.ts:54 TS2304+:70 TS2552·B3 interview.ts:182 TS2322·B4 sse.ts:10 TS2322+:12 TS2345·ocr-fixture.ts:75/:76 TS2532×2·performance.e2e.ts:52-54 TS2532×3 |
| R3 | 同 R2 配置（B2 d.ts 初版=蓝图钉值并集 `Record<string,string|readonly string[]>` 无 undefined） | 修复中途验证 | 2 | **发现蓝图 10 错清单外新错** proof.ts:79 TS2345（undici HeaderRecord 索签值域 `string|undefined` 不可赋给无 undefined 的 Record 值域）→ 蓝图 B2 括注「HeaderRecord KnownHeaderValues 收窄适度放宽=tests 面 non-claim」授权放宽 → d.ts 值域加 `\| undefined`（03 erratum-E5） |
| R4 | `turbo run typecheck --dry=json`（attempt 1：仅 `//#typecheck` 声明+`typecheck:e2e` script） | 接线验证 | 0 | `//#typecheck` 入选但 command=`<NONEXISTENT>`（turbo 2.10 根任务按名找根 package.json `typecheck` script）→ 补根级别名 script（03 attempt-A2） |
| R5 | `turbo run typecheck --dry=json`（attempt 2：+`typecheck`: `pnpm typecheck:e2e`） | 接线验证 | 0 | **18 槽位·恰 1 runnable=`//#typecheck`·command 逐字 `pnpm typecheck:e2e`**（蓝图书 10 workspace 槽位 NONEXISTENT·实测 11 个 `#typecheck`+6 个 `^build` 依赖槽位=17 个 NONEXISTENT·性质同为预期跳过·计数漂移登记 03） |
| R6-R9 | **四门验收恰 1 run 批**（下表） | 验收 | 全 0 | 唯一验收账·零重跑零取优 |

## 四门验收批（恰 1 run·R6-R9 原值）

| 门 | 命令 | EXIT | 原值 |
|----|------|------|------|
| 门1 | `tsc -p tsconfig.e2e.json --noEmit`（e2e 域） | **0** | 零输出（清零） |
| 门2 | `pnpm typecheck:e2e` | **0** | `tsc -p tsconfig.e2e.json` 静默绿 |
| 门3 | `pnpm e2e-static-guards:check` | **0** | `e2e static guards passed: runners=6 helpers=21 flags=9 aiPaths=6; releaseEvidence=false` |
| 门4 | `pnpm e2e-platform:check` | **0** | `{"outcome":"passed_directory_contract_core_boundaries_and_trust","releaseEvidence":false,"aiOutputTrusted":false,"coreBoundaries":"ran","trustGuard":"ran","directoryErrors":0,"trustErrors":0,"boundaryErrors":0}` |

- §4 补全：`pnpm e2e-helpers:prove` EXIT=**0**·`PASS e2e-helpers proof: 26 scenarios; releaseEvidence=false`（26 scenarios 达标）；
- **`e2e-parity:check` 移出验收**（rev3 席1 处方：base c17804a5 实测红 EXIT=1·sibling 债务 parity-baseline 再生另立）——本刀零触碰；
- apps/api 禁点亮：未给 apps/api 任何点亮动作（蓝图实测 26 错红·维持）。
