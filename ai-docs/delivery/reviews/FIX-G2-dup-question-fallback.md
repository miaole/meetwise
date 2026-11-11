# FIX-G2 · 同用户第二场面试判重判死（generation_duplicate_question）修复说明

> 分支 `fix/g2-dup-question-fallback`，基底 `origin/main`=`9c9809446`。
> 需要 **mw-model-op（主审）** 和 **mw-rag-route（协审）** 分别独立审查，实现方不自批、不自合。
> 双审 PASS 已记录于第 7 节（对照 head `7a32ed7274f55ad95bc1aff662c298ddc61d9ec8`）。PASS ≠ nail，未在 GitHub 上 approve，未合并。
> 结论只适用于本机隔离环境：仍是 **NOT_HA**，releaseEvidence=false。
> 本说明不改共享进度文档（execution-master-checklist / REMAINING-NORTH-STAR-QUEUE / backlog），由协调方合入后统一回填。
> 标注规则：已核实（附 file:line，或命令+退出码）/ 推断 / 未找到。时间均为北京时间。

## 1. 问题与定位

- **来源：** 审查报告 `review-refactor-189c0054a.md` 的 P1-1 和第 6 节 G2。
- **现象：** 同一用户用同一份简历开第二场面试，必然以 `generation_duplicate_question` 整场失败。`pnpm e2e:isolated` 的 7a 段 2/2 都红。
- **分支归属（已核实）：**
  - `origin/main`（9c9809446）与 `origin/line/final-polish`（189c0054a，PR #237）中，三个相关文件逐字节相同（`git diff --quiet` 为真）。
  - 所以问题在 main 上就已存在，修复基于 `origin/main`。
- **根因（已核实）：**
  1. 判重重掷耗尽后，`apps/worker/src/adaptive-interview-service.ts` 原 :788 直接返回 `unavailableGeneration('duplicate_question')`（重掷上限 `MAX_DUPLICATE_REROLL=2`，见 :32）。
  2. 图节点 `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` 原 :134-155 只对 `QUESTION_GENERATION_REROLL_FAMILY` 换 competency。`duplicate_question` 不在这个族里，所以直接 `failClosed` 整场结束。
  3. 跨会话判重 `wasAsked` 是精确匹配：按 owner 查 episode，episode 由上一场 conclude 时 `recordAskedQuestions` 写入。同一份简历、同一组能力项的第二场，模型大概率给出同样的题面，于是撞满上限。
- **实测佐证（已核实，e2e 诊断查 interview_question）：**
  - 修复后，第二场的「协作与沟通」题面与第一场逐字相同，正是经降级臂出面的。
  - 「Backend Development」走的是 grounded 无事实固定模板（`adaptive-interview-service.ts:566` 早退臂：无可用选定事实时的既有模板，不是本刀新增的 G2 降级模板档 `duplicateFallbackTemplate`）。这条路径本来就不查跨场判重。

## 2. 修复策略与理由

**策略：判重耗尽后先换能力项；所有能力项都耗尽时优雅降级，不整场失败。**

1. **先换 competency。**
   - 新增族 `QUESTION_GENERATION_COMPETENCY_SWITCH_FAMILY`，等于 re-roll 族加上 `duplicate_question`，见 `packages/domain/src/question-generation.ts`。
   - 图节点换序臂改用这个族。帽仍是现有的 `MAX_COMPETENCY_EXHAUST_SWITCH=2`，与 AG-F、批判门换序共用。
   - **理由：** 沿用 AG-F 已有的「耗尽换 competency 不终场」设计（EXPERT §七 :65），不引入新机制。
   - `duplicate_question` **没有**加进 re-roll 族。seam 内判重 re-roll 仍有独立上限，g7fix4 钉住的键形与调用数不变。
2. **全部耗尽后降级（跨场可重复，当场不重复）。**
   - seam 判重耗尽时，失败形与原先逐字节同形（error、provenance 都不变），另外随附一个可选的 `duplicateFallback` 候选。由纯函数 `pickDuplicateFallback` 挑选，优先级如下：
     1. 本 turn 已生成的模型题，取最近一次 roll。条件是通过本场 critique（含本场 asked 判重）和引文闸，只与历史场次重复。标记为 `provenance.duplicateFallback='cross_session_repeat'`，origin=model。这是生产可达档。
     2. **纵深防御（生产 seam 走不到）。** 上一档没有合格候选时，用固定模板。文案与既有 grounded 无事实、无授权版逐字相同，不声称任何简历事实，同样须过本场 critique。标记为 `approved_template`。此档只在 scripted deps 下可达（见 §4 的 G2-c / G2-d、g7fix4 §4.2b）。
     3. **纵深防御（生产 seam 走不到）。** 两档都不过时返回 null，图节点照旧 failClosed，形状不变。此档只在 scripted deps 下可达（G2-c）。
   - **生产默认行为（已核实）：** 首个候选进入判重之前已经过 `seamCritique`（`adaptive-interview-service.ts:758` / `:781`）和引文核验（`:696` / `:616`）。因此生产 worker 链上 `pickDuplicateFallback` 总会选中某个模型候选，模板档（`:51`）和 null 档（`:62`）实际走不到。合并之后，生产里的实际默认就是：换能力项也失败时，允许重复别场问过的模型题。跨场是否应硬拒，仍待用户拍板（见第 7 节）。
   - 图节点只在**无序可换或换序帽满**时采用候选，并且采用后仍要过图级本场 critique 终闸。批判门没有放宽。
   - **理由：**
     - 跨场重复对练习者是可以接受的（复练同题）。当场重复不可接受，由本场 critique 保证。
     - 降级题面优先用模型已经产出、并且过了全部确定性闸的题。这符合「失败不发明题面」的原则。模板档与 null 档是纵深防御，不是生产默认出题路径；模板文案来自现有的 approved_template，不是新造的文案。
     - 没有选用「题库兜底」，因为需要新的检索调用和计费面，风险更高。
3. **额度、计费、幂等语义不变（已核实）：**
   - 降级**零额外模型调用、零新幂等键**。候选沿用自己的 `:0`/`:r{k}` 键。换序后的续掷沿用 AG-F 的统一 `:r{k}` 单调计数。
   - g7fix4 §4.5 lifecycle 全链实测：该用例走的是「全部候选都判重」路径，恰好 9 笔 invocation（3 个能力项 × 3 次生成），键为 `:0`、`:r1` … `:r8`，单调递增、不复用。interview 没有判 failed，预留保持 reserved。「9 次」不是全局硬上限，见下方费用披露。
   - 计费仍走既有 conclude 结算：成功 confirmed，失败 released。本刀没有改动结算代码。

### 费用披露

- 「9 次」指的是全部候选都判重时的路径次数（3 个能力项 × 每档 1 次初诊 + `MAX_DUPLICATE_REROLL=2` 次重掷 = 3×3），并不是全局硬上限。g7fix4 §4.5 的 9 笔断言钉的是这条路径，代码里没有 `calls>9` 的硬闸。
- 真正的硬上限是：`MAX_DUPLICATE_REROLL=2`（`adaptive-interview-service.ts:78`）、`MAX_ERROR_REROLL=2`（`:90`）、`MAX_COMPETENCY_EXHAUST_SWITCH=2`（`generate-question.ts:24`）。到达上限后依次走换能力项、降级、failClosed。
- family 重试与 dup 重试可在同一 seam 叠加。叠加时最多约 15 个 `:r` / `:gr` 键，有上界，高于 9，但不是键复用。
- 对照：本刀之前，判重路径最坏是 3 次 interviewer.ask（1 次初诊 + 2 次重掷，然后整场判死）。本刀把判重耗尽纳入换能力项后，纯判重最坏是 9 次；family 与 dup 叠加时约 15 次。降级本身不增加调用、不新建 reserve。

## 3. 改动清单

| 文件 | 改动 |
|---|---|
| `packages/domain/src/question-generation.ts`、`index.ts` | 新增 `QUESTION_GENERATION_COMPETENCY_SWITCH_FAMILY`、`QuestionDuplicateFallback(Candidate)`、`duplicateExhaustedGeneration`、`acceptDuplicateFallback`；provenance 加可选的审计字段 `duplicateFallback`；失败形加可选的 `duplicateFallback` 候选 |
| `apps/worker/src/adaptive-interview-service.ts` | 判重环收集候选；耗尽时返回 `duplicateExhaustedGeneration(...)`，失败形不变，另附候选；新增导出纯函数 `pickDuplicateFallback`、`duplicateFallbackTemplate` |
| `packages/ai-graphs/src/adaptive-interview/nodes/generate-question.ts` | 换序臂改用 switch 族；无序可换时采用降级候选，再过本场 critique 终闸；无候选时 failClosed 原样 |
| `packages/ai-graphs/test/adaptive-interview.proof.ts` | 新增 G2-a 到 G2-d 图级单测 |
| `apps/worker/test/g7fix4-reroll.proof.ts` | §4.2 增加降级候选断言；新增 §4.2b 纯函数挑选优先级；§4.5 lifecycle 从「判死」改为「先换序、后降级出题」，含计费与键账断言 |
| `e2e/full.e2e.ts` | 7a 的作答夹具改为实质作答（见第 5 节），不改产品代码 |
| `scripts/ai-docs/public-text-policy.mjs`、`.proof.mjs` | 本说明是 1 个新增受管文件。main 的届扫已经顶到 cap（2530），按仓库「恰等步进」惯例把 cap 改为 2530→2531，四个联动点同步修改。只是计数预算调整，内容策略不变 |

## 4. 测试与验证矩阵

环境：Node 22.23.3，pnpm 10.18.0，Docker 29.9.3，隔离 PG（pgvector/pgvector:pg16，随机端口）。常驻栈的 8787/3100/54392/63799 没有占用，也没有停。模型 Key 只从进程环境读取，没有打印。

**单测覆盖的路径：**

| 路径 | 用例 | 结果 |
|---|---|---|
| 判重耗尽后换能力项 | `adaptive-interview.proof.ts` 的 G2-a（带候选也优先换序）；g7fix4 §4.5（lifecycle 全链） | PASS |
| 全部耗尽后降级（生产可达：模型候选） | G2-b（模型候选出面）；g7fix4 §4.5（lifecycle 降级出题） | PASS |
| 纵深防御（仅 scripted deps 可达） | g7fix4 §4.2b（模板兜底、返回 null）；G2-c（无候选时 failClosed 原样）；G2-d（坏候选被批判门拒） | PASS |

模板档与 null 档在生产 seam 里走不到：首个候选进入判重前已经过 `seamCritique` 和引文核验，生产实际上总会选中模型候选。G2-c / G2-d / §4.2b 仍然保留，作为 scripted deps 下的纵深防御覆盖，不代表生产默认会走到这两档。

**命令与退出码：**

| 命令 | 退出码 |
|---|---|
| `pnpm e2e:isolated` 连续 3 次（最终提交态） | **0 / 0 / 0**（135s / 126s / 127s；7a=report_unavailable，即舱壁真被行使） |
| `pnpm adaptive-graph:prove` | 0 |
| `pnpm interview:prove` | 0 |
| `pnpm adaptive-flow:prove` | 0 |
| `pnpm adaptive-life:prove` | 0 |
| `pnpm adaptive-degrade:prove` | 0 |
| `pnpm scoring-integrity:prove` | 0 |
| `pnpm ag-f-reroll:prove` | 0 |
| `node scripts/run-e2e-isolated.mjs g7fix4-reroll:prove:raw` | 0 |
| `pnpm adaptive:prove` | 0 |
| `pnpm graph:prove`（`DATABASE_URL` 指向一次性 PG 容器 127.0.0.1:55771，用后即删） | 0 |
| `pnpm lint`（0 errors / 5408 warnings，上限 5425）、`pnpm typecheck` | 0 / 0 |
| `pnpm turbo typecheck`、`pnpm turbo lint` | 0 / 0 |
| `pnpm docs:check`（cap 步进后扫描 2531 个文件）、`pnpm public-text-policy:prove`（12/12） | 0 / 0 |
| `pnpm ha6:prove` | **1**（存量问题，不是本刀引入）：origin/main 9c9809446 的干净 detached worktree 亲跑同样 EXIT 1，3 条 FAIL 逐条一致，分别是 principal.ts:946 pool max 表达式漂移、interview-graph-lease.ts 命中 pgbouncer 负断言、package.json scripts 账本 digest。本刀没有改 package.json、principal.ts、interview-graph-lease.ts。建议归 mw-e2e-ha 处理 |
| `pnpm arch`、`pnpm e2e-static-guards:prove`、`pnpm e2e-ui-stale-build-guard:prove` | 0 ×3 |

**过程中的红（如实记录）：**

| 情况 | 结果 | 处理 |
|---|---|---|
| 仅修 G2 时跑 `e2e:isolated` | 1/1/1 | 7a 不再判重，但暴露了第 5 节的夹具前置问题 |
| 修夹具后第一轮 | 1/0/0 | 第 1 次为 `isolated_postgres_database_not_ready`，属环境/容器启动原因（推断：宿主负载）。随后重开一轮，连续 3 次全绿 |
| 新增本说明后 `docs:check` | 1 | `PTP_FILE_LIMIT:2531`。cap 步进后为 0 |
| `graph:prove` 首跑 | 1 | 原因是 `database_target_missing`：该 proof 不走隔离包装器，需要 `DATABASE_URL`。指向一次性 PG 后为 0 |

## 5. 连带发现：7a 报告舱壁的前置依赖（已核实）

- **背景：** G2 修好后，第二场能跑完了，但 7a 断言「报告失败 → report_unavailable」仍红，终态为 report_ready。
- **诊断（e2e 临时 diag 查询，已撤回，未提交）：**
  - 旧夹具的回答是固定短答，澄清时回复「跳过」。所有作答最终都是 `outcome=unresolved`、score 0，eligible=0。
  - C 端 unbound 场次在这种情况下走 AG-10 守卫（`apps/worker/src/adaptive-lifecycle.ts:651-676`）：直接写「证据不足」模板报告，零模型调用，于是 post-provider 故障注入（`apps/worker/src/main.ts:203-210`）永远不会触发。
  - 这一前置此前被 G2 判死掩盖了：7a 在出第二题时就死了，从来没走到报告。
- **处理：** 只改夹具。7a 改用覆盖后端与协作两面的实质作答，澄清时也给同一份实质作答。改完后 7a 稳定落到 report_unavailable，舱壁被真正行使。产品代码零改动。
- **残留（推断）：**
  - 7a 能否得分仍取决于真模型的评估，属于真模型 E2E 固有的不确定性。本机连续 3 次绿。
  - 主循环（第 1 场）同样多为 unresolved，报告是模板，因此**主循环并没有覆盖模型报告生成**。这是覆盖缺口，建议 mw-e2e-ha 评估。

## 6. 遗留与待拍板

1. **跨场重复策略（待用户拍板）。** 本刀默认「跨场可重复、当场不重复」，只在换序帽满或无序可换时触发。如果产品希望跨场严格不重复，可改为只走模板兜底，或接题库兜底（需要新的检索与计费面）。不替用户决定。
2. **判重是精确匹配。** 模型高温度下同义改写不算重复；反过来，同简历同能力集几乎必然复现同题。审查报告建议的「跨会话撞题只降权、不当硬拒」（把 recentAsked 喂进 prompt 已部分做到）属于 prompt/RAG 面，归 mw-rag-route，本刀没有动。
3. **grounded 无事实模板路径不查跨场判重。** 现状如此，本刀未改，记录在案。
4. **P1-2：** 全栈 E2E 仍不在 CI per-push 或 nightly 中，归 G3/mw-e2e-ha。
5. **`ha6:prove` 在 main 上本来就红**（3 条 FAIL，见第 4 节），与本刀无关，需要单独跟进。
6. **docs 回填：** 共享进度文档没有改，合入后由协调方回填 execution-master-checklist、gap-bug-backlog（P1-1）、e2e-covered-path-backlog（7a 前置、主循环模板报告缺口）。

## 7. 审查记录

对照 head `7a32ed7274f55ad95bc1aff662c298ddc61d9ec8`。双审均在各自独立 worktree 上复跑，实现方不自批。PASS ≠ nail，alone ≠ dual；未在 GitHub 上 approve，未合并。

- **mw-model-op 主审 PASS。** 调用次数与幂等键、预算与费用 SLO、额度 reserved 与退回、批判检查均未放宽。降级不增加模型调用、不新建 reserve；(a) 复用已付费调用，既不双扣也不漏结算。
- **mw-rag-route 协审 PASS。** 换能力项与跨场重复模型题档均可达且有测试；题库隔离没有被破坏（降级不发起新检索，引文按本 turn 已知集核）；换序后 route snapshot 一致（`route.competency` 与 `qkind` 跟着更新）。

**后续跟进项（不在本 PR 做）：**

1. `duplicateFallback` 标记只记在图 checkpoint 里，没有投影到 `question_ready` 事件（`adaptive-lifecycle.ts:326-334`）。§4.5 也没有断言 `provenance=cross_session_repeat`，建议另刀补上。
2. 缺 HTTP 层「跳过当澄清」的 E2E。这是既有覆盖缺口，不是本 PR 引入的回归。
3. isolated 的 `runFullE2E` 吞掉了 stderr，Key-block 容易被误读成 PG 静默失败。
4. 「跨场撞题只降权、不硬拒」作为后续独立一刀，需要 PRE 双审。范围是在 `recentAskedForPrompt` 基础上对历史已问题面降权、判重改打分、当场仍硬拒，补 prove，用确定性相似度、不用 embedding。
5. 跨场重复的默认行为待用户拍板。本 PR 合并后，生产里的实际默认就是「换能力项也失败时，允许重复别场问过的模型题」。若要求严格不重复，应另开一刀，不要靠无上限重摇。
