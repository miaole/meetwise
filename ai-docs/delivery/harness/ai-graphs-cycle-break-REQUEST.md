# AI-GRAPHS-CYCLE-BREAK REQUEST — PR #109 verify step 14 `pnpm arch` no-circular 红解刀（ai-graphs adaptive-interview session-summary↔state type-only 双向环 · 甲案=SessionTurnInput 结构子集去回边 · 恰 2 码文件 +3 docs · 诊断+起草席落卷 · STOP=`draft:awaiting_pre_exec_dual` 三处）

> 战役 meetwise · 支线 `line/ai-graphs-cycle-break` · 工作树 `meetwise-agc2` · 起草基线 @origin/feat/mysql-schema-skeleton=`3cd159dd`（派单下界「fetch 后 origin tip≥3cd159dd」以等号成立亲证）· ⛔push ⛔merge 主线（push/翻面权归协调方）。前席超时零 commit 如实登记：支线曾立 @`a0f3bd46`（=line/5e-cleanup-sweep tip 恒等·零 unique commit·工作树净）已清重建 @`3cd159dd`，零丢失亲证（`git rev-parse` 两支线恒等后删）。

## §0 现状锚（双向边锚·起草席亲读+blob 亲算 @`3cd159dd`·**EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

### 0.1 blob 锚表（`git rev-parse 3cd159dd:<path>` 亲算）

| 文件 | blob @`3cd159dd` | 本刀触面 |
|---|---|---|
| `packages/ai-graphs/src/adaptive-interview/session-summary.ts` | `92f1a2ba` | 件① 触 |
| `packages/ai-graphs/src/adaptive-interview/state.ts` | `498c2be9` | 件② 触 |
| `packages/ai-graphs/src/adaptive-interview/index.ts` | `47d381f2` | **零字节 Ban** |
| `.dependency-cruiser.cjs` | `562f23c9` | **零字节 Ban**（§1.3 丙否决载体） |

### 0.2 红事实与双向边两沿（file:line 亲证）

- 红事实：PR #109 verify step 14 `pnpm arch`（`package.json:124` → depcruise `--config .dependency-cruiser.cjs apps packages`）报 `no-circular`（`.dependency-cruiser.cjs:9-15` severity=error `to:{circular:true}`）：`packages/ai-graphs/src/adaptive-interview/session-summary.ts → state.ts → session-summary.ts`。
- 沿① session-summary→state：`session-summary.ts:12` `import type { Turn } from './state.ts';`（#51 EXEC `23c479c2` 件① 引入·`Turn['kind']` :31 + 形参 :56 两用点）。
- 沿② state→session-summary：`state.ts:12` `import type { SessionSummary } from './session-summary.ts';`（#51 件④ 第 9 additive 参注解的自用 import·使用点 `state.ts:159` `session?: SessionSummary | null`）+ `state.ts:248` `export type { SessionSummary, SessionTurnDigest } from './session-summary.ts';`（#51 件④ 尾行 re-export·供 `index.ts:4-12` type 块经 `'./state.ts'` 路由取）。
- 归因：#51 SESSION-SUMMARY-DEEPEN EXEC `23c479c2`（件① Turn import × 件④ 自用 import+re-export 合环）·与 ssd-egress nail 席定谳一致·本席独立复核亲证。

## §1 修法定稿（甲案·起草席验证后落卷）

### 1.0 乙案否决核（派单预申明的裁决点·亲证判死）

乙案（index.ts type 块改源 `'./session-summary.ts'` 直取 + 删 state.ts :12 import 与 :248 re-export）**不可行**：`state.ts:159` 第 9 参注解 `session?: SessionSummary | null` = state.ts 内部自用 SessionSummary，删 :12 import 即 state.ts typecheck 红；保 :12 则沿② 在·环不解。派单裁决条款「若 state.ts 内部使用则乙案不可行·改甲案」行使，亲证行号 :159（派单简报 :149 系锚漂移·同区 ±10 行·如实登记）。

### 1.1 甲案三件（恰 2 码文件·纯类型面零行为变更）

- 件① `session-summary.ts`：:12 `import type { Turn } from './state.ts'` 删，换 `import type { QuestionKind } from '@meetwise/domain'`（domain 既有依赖零新包边）；新增导出 `SessionTurnInput` 结构子集（恰六字段=`buildSessionSummary` 实际只读面：`q: string`+`competency: string`+`score: number|null`+`outcome: 'answered'|'clarify'|'unresolved'|'unscored'`+`kind: QuestionKind`+`evidence?: string[]`·doc 注记环解出处与 state.ts 守卫联动）；:31 `kind: Turn['kind']` → `kind: SessionTurnInput['kind']`（型恒等 QuestionKind）；:56 形参 `readonly Turn[]` → `readonly SessionTurnInput[]`。函数体零字节·调用点兼容：`generate-question.ts:85` 传 `state.transcript`（Turn[] 结构覆盖子集·守卫钉死）。
- 件② `state.ts`：:12 import 增 `SessionTurnInput`（沿② 单向边沿用零新边）；Turn 接口闭合后新增导出编译期覆盖守卫 `export type TurnCoversSessionTurnInput = Turn extends SessionTurnInput ? true : never;`（satisfies 语义零运行时——session-summary 不再 import Turn 后，子集与 Turn 的结构契约由本守卫钉死：任一侧漂移失覆盖即 state.ts 编译红）。
- 件③（零字节项·如实登记非动面）：`state.ts:159` 第 9 参注解与 :248 re-export 零字节保留（沿② 单向合法）；`index.ts` type 块维持原源 `'./state.ts'` 零字节（type 路由经 :248 不变）。
- 效果：拆沿①·保沿②单向·零环；纯类型面·运行时字节零变·v8 渲染/proof 语义零触。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- 丙案（depcruise 豁免 Ban）：no-circular 加 path 豁免/justification——**否决**。放红不为修：`.dependency-cruiser.cjs` 豁免附录先例三形（proof harness/同包深链/退役墓碑）均非「产品码 type-only 结构债」；且 verify step 14 门语义弱化系门面变更越本刀授权面。`.dependency-cruiser.cjs` blob `562f23c9` 零字节 Ban。
- 乙案否决如 §1.0（:159 自用亲证）。
- 丁案（state.ts 拆文件让 Turn 出走）：超 #51 件④ 最小修复面·checkpoint 纪律文件结构重组零收益·否决。

## §2 验收断言（门矩阵·起草席亲跑实测 @支线树·EXEC 期重跑为准）

- 门 1 **`pnpm arch` EXIT=0**（0 errors·circular 词面 0 命中·1110 modules/3396 deps cruised·8 warnings=既有 no-orphans 面零新增）← **PR #109 step 14 红翻绿主证**。
- 门 2 ai-graphs 邻面三 prove：ai-graphs `prove:adaptive-graph` **34/34 EXIT=0** + worker `prove:interview`（隔离形 `run-e2e-isolated`·`LOCAL_ISOLATED_PROOF_RECEIPT` 在案 release_evidence=false）**57/57 EXIT=0** + worker `prove:session-summary` **17/17 EXIT=0**（34/57/17 恰等先例值·零断言红冲销）。
- 门 3 `turbo typecheck --force` **8/8 EXIT=0**（0 cached）。
- 门 4 `turbo lint --force` **12/12 EXIT=0**（ai-graphs `--max-warnings 47` 贴线）。
- 门 5 `docs:check` EXIT=0（2186≤cap 2200·3cd159dd cap sanction +8 后首用·+1 新 REQUEST·执行后实跑回填）。
- 门 6 markers 五类改动集新增行直扫零命中（词面不誊防自指·沿 batch5b-mig nail 口径）。
- 门 7 diff 面**恰 5 tracked**=2 码（件①②）+3 docs（本 REQUEST 新+LEDGER 刀位图行+checklist 段）。
- 门 8 卫生：`pnpm install --frozen-lockfile` 零 lockfile 改·tsbuildinfo 门副产 checkout 回滚·est live=0·`actualSpendCny=null`·零迁移零 DDL 零 env 闸。

## §5 Ban 列表 + pins

- Ban：`.dependency-cruiser.cjs`（`562f23c9`）·`adaptive-interview/index.ts`（`47d381f2`）·`state.ts:159`/:248 零字节·`prompts.ts` 与 ag19 proof（#51 件⑦ blob 钉 `899be6f2` 不触）·全部迁移/CI/门脚本。
- pins：基线 tip=`3cd159dd`·四 blob 锚 §0.1·邻面 34/57/17·门 1 基线「8 warnings/0 errors」·lint ai-graphs cap 47。
- ⛔push（origin 任何 ref）·⛔merge 主线（`feat/mysql-schema-skeleton`）·⛔force push·⛔pull --rebase。

## §8 est live / 预算 + STOP

- est live=0（纯类型面+docs·EXEC 期同）· 0 Key 值 · `actualSpendCny=null` · 零迁移 · 零模型外呼。
- **STOP=`draft:awaiting_pre_exec_dual`（三处同值：本 REQUEST §8 + LEDGER 刀位图「ai-graphs-cycle-break」行 + execution-master-checklist「Line ai-graphs-cycle-break」段）**。
- 开工条款：pre-exec 双审 BOTH PASS 后 EXEC 席按 §0 对届时 tip 重 pin 开工；若基线漂移致 §0.2 行号位移，结论不变则只更行号并如实登记。
- 停止条件：①重 pin 时 blob 漂移且语义变（→回炉起草）②门 1 在 HEAD 已被他刀翻绿（→本刀降级为 docs-only 空转·如实呈报协调方裁决）③邻面 34/57/17 任一非恰等（→熔断呈报·禁 retry-to-green）。
