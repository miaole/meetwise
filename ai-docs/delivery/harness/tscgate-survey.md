# TSC-GATE-1 — e2e/ 全域 tsc 覆盖盘点刀（C1/C2 前置·零修复纯盘点）

**状态**：`exec:awaiting_post_prove_dual`（EXEC 已落 mw-core @worktree 分支 `line/tsc-gate-survey`：临时 `e2e/tsconfig.json`（extends root·include `["**/*"]` 非 root 相对·noEmit·allowJs:true+checkJs:false·strict/skipLibCheck 继承）· **canonical 全量跑恰 1 次** `tsc --pretty false` EXIT=2 原值 → **全量 11 错逐行机器可读诊断原档入收据**（TS2304×2·TS2552×1·TS2322×2·TS2345×1·TS2532×5·TS7006/TS7016/TS1484/TS2305/TS2307/TS2724 全零）· **双跑分离探针 1 次**（strict off·授权上限 2 用 1·与 Ban「恰 1 次盘点跑」关系预声明于 manifest：探针非盘点口径不形成第二份错数账）→ A∩B=4 strict 无关（真断链 1=full.e2e.ts:209 `emitE2EFailure`·类型环境缺口 2=proof.ts HeadersInit/RequestInfo·真型不配 1=interview.ts:182）+ A∖B=7 strict 噪声 · **每类抽核 ≥3 亲读达标** · 已知锚恰命中且在盘不动 · **史实发现：E2EFAIL-1 修复 `83a6ec8b` 非 HEAD 祖先**（仅存 `line/g7-driver-assert`·本 base 断链仍在——修复 REQUEST 须先裁并轨面）· 门禁建议：清零四批估算（B1 断链→B4 噪声 ≈15-20 行/6 文件）+ 三挂点利弊（static guards :95-:99/:137-:141 作钉·:check/:prove 族实测 491 立即可落·turbo.json:6 typecheck 全库空挂=现成落点作战略·apps include 模式可复制）· 合成建议 B+C 分层·A 作钉·反对降 strict 换绿（探针证残余 4 仍含真断链）· 收据 `receipts/tscgate-survey/`（manifest/分布+双跑/抽核/门禁/exec 收据/run-A/run-B 原档/sha256）· 临时 tsconfig 用后即删 untracked 零残留亲证·apps/packages src 零 diff 亲证 · STOP awaiting post-prove dual）· 前态 `draft:awaiting_pre_exec_dual` · base = 主线 `7ad2b3e2`（EXEC 实跑 base=`b24fcc5a`=本 harness REQUEST commit）· 分支 `line/tsc-gate-survey` · 立项依据 = E2EFAIL-1 nail forward 登记（e2e/ 全域零 tsc 覆盖缺口：root tsconfig 仅 paths 无 include·e2e/ 无自有 tsconfig·tsx transpile-only TS2304 级断链无门可抓——emitE2EFailure 断链存活根因）+ NEXT-NODE-BEST-PRACTICES C1/C2。

## 0. 席2 三附注（经协调方授权转达·EXEC 落字·逐条落实亲证）

1. **include `["**/*"]` 非 root 相对·防 TS18003**——落实 ✓：临时 tsconfig 置于 `e2e/` 内、include 相对本文件（=e2e/ 全域），Run A 正常产出 11 错、零 TS18003（无「未找到文件」畸形）。
2. **allowJs:true + checkJs:false·.mjs 边 TS7016 噪声排除**——落实 ✓：failure-class.mjs 计入解析（其 .ts 侧 re-export 经 failure.ts 类型面可达）而零诊断产出，TS7016 全零（若 allowJs 缺席此边必炸 TS7016 族）。
3. **双跑分离（strict on/off 各一或按 TS 码过滤）落实「真断链类〔TS2304/2305/2307/2724〕vs 严格噪声类〔TS7006/7016/2345/2322/strict-null/TS1484〕」抽核判据**——落实 ✓：strict-off 探针把 11 分离为 4（strict 无关·含真断链+真型不配）+7（strict-null 族机械噪声）；抽核实证 TS2322 同码二性（sse:10=噪声·interview:182=真错）、「降 strict 换绿」不可行——判据成立且已入门禁建议。

## 1. 手段（纯盘点·零修复·零产品码）
1. **盘点**：临时 e2e/tsconfig.json（extends root·include e2e/**/*·noEmit·不入 git——/tmp 或 worktree 用后即删）跑 `tsc --noEmit` 全量错数+错型分布（TS2304 断链/TS2345 型不配/TS7006 隐式 any 等）逐类统计；
2. **错样抽核**：每类抽 ≥3 例亲读（真断链 vs 严格模式噪声——distinction 决定门禁形态：strict 全开 vs 渐进收紧）；
3. **门禁设计建议**（产出=修复分批 REQUEST 的输入·零实施）：错数清零路径估算（分批批次/优先级：断链类优先沿 E2EFAIL-1 先例）/门禁挂点建议（static guards vs 独立 script vs CI）。

## 2. Ban
零产品码·零源码改动（临时 tsconfig 用后即删或 /tmp）·恰 1 次盘点跑·Key name-only·est 0 live·pins 十一值照抄（haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false）+脚注 actualSpendCny=null·实现不自批·alone≠dual。

## 3. 验收
全量错数+错型分布报告+每类 ≥3 例抽核+门禁设计建议+收据 `ai-docs/delivery/receipts/tscgate-survey/`。

## 4. Non-claims
本刀 ≠ 门禁落地 ≠ 任何修复 ≠ C1/C2 勾销（盘点=前置供料）。
