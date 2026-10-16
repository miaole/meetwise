# PERF-PREP EXEC 收据 — perf 复跑前置基线红两件清欠（stress:prove 7 FAIL + scoring-integrity:prove ①c graph 段）· 2026-10-14

- 席位：PERF-PREP EXEC · 授权=协调方（E2E 矩阵侦察席上报的两处基线红 fail-fast 卡死 verify:e2e-performance 全量复跑·门禁① PERF/LOAD 解锁候选前置小刀）· alone≠dual（STOP=executed:awaiting_post_prove_dual·⛔push）
- 工作树：`meetwise-perfp`（branch `line/perf-prep`·base=主线 tip `609ca5fa`·worktree 新建·`pnpm install --frozen-lockfile` EXIT=0）
- 定位：**纯 test fixture 随翻**·零产品码·零迁移·est live=0（全隔离容器+本地 loopback echo·零真实模型外呼）·actualSpendCny=null·0 Key 值接触

## 1. 逐件复现与溯源分类（基线亲跑复现=侦察席同形·日志在卷）

### 件① stress:prove（run-e2e-performance-suite 第 12 步 long-context pressure·基线 7 FAIL 逐条复现 `2026-10-14-stress-baseline-7fail.log`·与 pristine `ai-docs/delivery/receipts/evidence-delivery/2026-10-10-stress-final.log` 逐条同形）

| FAIL 断言 | 溯源（git log -p+pristine 对照） | 分类 |
|---|---|---|
| 真实截断带 nonce 标记（v6 信道：截断→档位 below）·C 段 1 项 | echo 观测正则 `/内容过长已截断-[a-z0-9]+\]$/`（初版 `9c92826e`）只认小写+数字；生产 nonce 随 `546b1c48`（tokstream-s4a）改 `randomBytes(8).toString('base64url').slice(0,10)`（packages/ai-runtime/src/model-client.ts:680/:898·base64url 含大写/`_`/`-`）后漏检率≈99.97% | **陈旧钉**（proof 观测信道滞后 nonce 字符集演进） |
| 当前图实际完成至少 3 次评估/累计≥30000 字（实际 0k）/极差<50（实际 Infinity）/队列承载 8000 字/job 收口 done+额度扣 1/报告舱壁·D+E 段 6 项 | R1 起 `MEETWISE_TECH_ROLE_FAIL_CLOSED` 默认 ON，consumer 角色解析 fail-closed 只认 route snapshot；本 proof 未跟进 0142 供给面→start job 全部 `adaptive_role_route_missing` 失败→D/E 连锁红。**同根因同修法已随翻 twin 面**：interview.proof.ts:81-89（S1 fixture 修复在卷）+adaptive-consumer.proof.ts:80-87，唯 context-stress.proof.ts 漏随 | **陈旧钉**（fixture 滞后 0142 route supply·非真回归：生产链在 twin proof 全绿亲证） |

### 件② scoring-integrity:prove（run-e2e-performance-suite 第 17 步·基线 ①c FAIL+:116 `Object.hasOwn` TypeError 崩溃·后段 ②③ 不可达·复现 `2026-10-14-scoring-baseline-1c-crash.log`·与 pristine `2026-10-10-scoring-integrity-final.log` 同形）

| FAIL/崩点 | 溯源（临时插桩亲证·debug 输出已还原） | 分类 |
|---|---|---|
| ①c 两断言 FAIL+:116 崩（graphTurn undefined） | 插桩亲证 `generationProvenance.invokeError='privacy_fenced_pre_dispatch'`：生产 ask seam invoke 携 `privacyInterviewId=threadId`（adaptive-interview-service.ts），invoke 预派发隐私围栏（ai-runtime/invoke.ts:864-873）经 `interview_privacy_active()`（0058 迁移：interview 行**在场性**校验·无行=false）→出题 failClosed 整场→transcript 恒空→`.at(-1)` undefined。fixture 合成 thread（`quote-repair-graph-*`）从未建 interview 行；同族 proof 先例 adaptive-flow.proof.ts:35/g7fix4-reroll.proof.ts:103/ag-f-reroll.proof.ts:103 均补 `INSERT INTO interview(id,owner_user_id,status) …'active'` | **陈旧钉**（fixture 滞后 0058 隐私围栏在生产 deps 直建图路径的行使） |
| ② 段 unscored 断言 FAIL（①c 修后解阻暴露·同族下一层） | 两层滞后：a) scripted 题面 `你怎么做限流？`（7 字）过不了 genQuestion 节点生产 critiqueQuestion 闸（too_short <8·domain/question-critique.ts 自 init 即在）；`9aafb14a` 时代 critique 失败走 `deterministicQuestionFallback` 兜底出题吸收，`3d88cb64`（#67「no invented interview questions」fail-closed 硬化）移除兜底改 failClosed→concluded→transcript 空。b) 断言字面（concluded+`degraded.reason==='evaluation_exhausted_retries'`+score===null）滞后 **AG-F**（`b29d861d` 修法③/裁决③a·卷面登记）：unscored 改按 0 计继续（score 0 非 null·reason 保留在 turn·concluded 禁置·degraded 不置位·不 re-invoke·mind 不 ingest） | **陈旧钉**（fixture 滞后 #67 fail-closed+AG-F unscored 契约·断言语义保意图重写·非弱化） |

**真回归候选：零**。两件九处红全数归陈旧钉（proof/fixture 随翻），产品码零触。

## 2. 修复形（恰 2 文件·+48/−10 全 test fixture）

1. `apps/worker/test/context-stress.proof.ts`
   - import 增 `supplyCandidateProfileRoute`；`prepareInterview` 在 interview INSERT+reserve 后补生产同链 route 供给+断言 `supplied`（沿 interview.proof.ts:88 同款）→解 D+E 6 项连锁红
   - echo 正则字符集 `[a-z0-9]`→`[A-Za-z0-9_-]`（随 model-client.ts base64url nonce）→解 C 段 1 项
   - D 段极差断言保意图最小形：`spread < 50`→`spread < answer.length / 2`（恒定题面时代的字面阈值失真：生产出题链每轮题面合法变化=回声 canned/情景降级模板/grounded 模板轮换·亲证长度 `[10548,10534,10585,10549]` 平稳零累积·累积签名=每轮+单轮回答长≈10400 仍被 2×阈值精确捕获）
2. `apps/worker/test/scoring-report-integrity.proof.ts`
   - ①c 两合成 thread 各补 `INSERT INTO interview(id,owner_user_id,status) VALUES ($1,$2,'active')`（0058 围栏在场性·三先例同款）→解 ①c 崩溃
   - ② scripted 题面 7 字→≥8 字逐轮唯一（过 too_short/duplicate 生产 critique 闸·#67 随翻）+assess 调用计数（不 re-invoke 断言）+有界循环驱动全弧（护栏 8 轮）+断言按 AG-F 契约重写（0 计继续/concluded 禁置/degraded null/reason 保留/relevant false/画像零 ingest/每题一评——观测语义亲证后落值）

## 3. 门矩阵（工作树终态亲跑·日志在卷）

| 门 | 结果 |
|---|---|
| `node scripts/run-e2e-isolated.mjs stress:prove:raw` | **EXIT=0**（28 PASS·`2026-10-14-stress-final.log`） |
| `node scripts/run-e2e-isolated.mjs scoring-integrity:prove` | **EXIT=0**（23 PASS·含 ①c 后段 ②③ 首次可达全绿·`2026-10-14-scoring-final.log`） |
| 邻接 `node scripts/run-e2e-isolated.mjs interview:prove:raw` | **EXIT=0**（57 PASS·`2026-10-14-interview-adjacency.log`） |
| 邻接 `pnpm -C apps/web prove` | **EXIT=0**（✓ 全部通过） |
| `pnpm turbo typecheck --force` | **EXIT=0**（8/8·0 cached） |
| `pnpm docs:check` | **EXIT=0**（2078 managed ≤ cap 2080·receipts/ 非受管根零增量） |
| markers（`<<<<<<<`/`>>>>>>>`/`=======`/TODO 直扫改动集） | **0 命中** |

## 4. 「旧代码忽略仍正确」书面结论（message-bus §5.5 义务对位）

本刀零 wire 契约/Redis 结构/持久化 schema 变更（恰 2 个 test 文件·断言与 fixture 面）——该义务**不适用**。随翻面语义注记：①c fixture 补 interview 行后，生产 invoke 预派发围栏对该路径的拦截语义与生产链一致行使（非绕过·非 opt-out）；stress route 供给为生产同链 `supplyCandidateProfileRoute`（非 MEETWISE_TECH_ROLE_FAIL_CLOSED opt-out·非伪造 0104 job 维度行）。

## 5. 偏离任务书清单

1. 任务书口径「①c graph 段」一处红——实际修 ①c 后解阻暴露 **② 段 unscored 同族红**（pristine 收据已预告「①c 后段因既有红阻断不可达」）：同件同根因族（fixture 滞后）随翻修复，未越界（仍在 scoring-report-integrity.proof.ts 单文件内）。
2. 临时插桩诊断（3 处 console.error/差分探针）已**全量还原**，终态 diff 零 debug 残留（亲证）。
3. 零迁移预期维持·STOP=executed:awaiting_post_prove_dual·⛔push。
