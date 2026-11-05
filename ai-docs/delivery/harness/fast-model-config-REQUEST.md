# FAST-MODEL-CONFIG REQUEST（fast 模型缺省与 scoring:eval 跳过归因修复刀·起草席落卷）

**Status**: **`draft:awaiting_pre_exec_dual`**（2026-11-05 起草席落卷·修法已随起草落卷·待 pre-exec 双审两独立外席·alone≠dual·Ban self-approve·est live=71 模型调用已如实入卷·markers=0·⛔push⛔merge 主线）

> 任务类型：产品码修复起草刀（fast 模型配置缺省 + 真模型评测跳过归因面 + 质量面后继登记）。
> 立项出处：协调方派单 brief（meetwise 快模型配置与 scoring:eval 修复刀起草席·主仓 main `92a82a944` cap 2486·诊断席根因在卷 `g7-diag-scoringeval-qwenplus-1105.log`）。
> 本刀修法面：① `MODEL_FAST_NAME` 代码缺省 qwen-turbo→qwen-plus（单源常量两处引用）+ worker.env.example 四行；② 真模型评分跳过原因 HTTP 状态族归因 plumbing（ModelResult/InvokeOutcome additive `errorCode`/`errorDetail`·unknown 冻结/落库/熔断阈值零变）；③ 质量面读数后继登记（本刀零触评分 prompt）。

## §0 事实锚（本席亲证清单·2026-11-05）

- **基线/分支/工作树**：`origin/main` = `92a82a944`（=PR #209 perf-status-pin merge·fetch 后 `git rev-parse origin/main` 亲证）· 分支 `line/fastm-draft`（本席 `git worktree add ../meetwise-fastm -b line/fastm-draft origin/main` 亲立·**主仓只做 worktree add 零其他 mutation**）· 工作树 `meetwise-fastm`（仓根同级）· `pnpm install --frozen-lockfile` 亲跑 Done。
- **防重双查**：harness 目录 `fast-model-config-REQUEST.md` 建前零命中。
- **改前届值亲证**：worktree 基线（未改前）`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · public text policy scanned 2486 = cap 2486 恰等零余量**（`MAX_FILES = 2_486` @origin/main 亲证）·PTP proof 12/12 本席亲跑绿。
- **根因现状固化表**（全部亲读 @`92a82a944`）：

| # | 锚 | 亲证结论 |
| --- | --- | --- |
| 1 | `apps/worker/src/interview-service.ts:237` | `withFailover(process.env.MODEL_FAST_NAME ?? 'qwen-turbo', …)` ——快模型代码缺省 qwen-turbo（修法锚一） |
| 2 | `apps/worker/src/model-cost-governance.ts:160` | `const fastModel = env.MODEL_FAST_NAME ?? 'qwen-turbo'` ——enforce 模式 MODEL_FAST 计费行模型同缺省（修法锚二） |
| 3 | `docker/env/worker.env.example:48` | `MODEL_FAST_NAME=qwen-turbo`（:156/:177/:191 三处配套 Billing/Backup 名同 qwen-turbo——部署模板雷面） |
| 4 | `packages/db/migrations/0200_ag08_admission_partition_per_endpoint_seeds.sql:30-46` | scorer/job-route-classifier 等全部文本 op 分区 `breaker_threshold=5, breaker_cooldown_ms=30000`（共享准入断路器种子·failover 平分区 `provider_account|region` 来自端点身份与模型名无关） |
| 5 | `packages/ai-runtime/src/model-client.ts:933-936` | `ExternalHttpStatusError` → 429/5xx/408/425 → `kind:'transient', externalOutcome:'unknown'` ——HTTP 状态在结果面**丢失**（归因修法锚） |
| 6 | `packages/ai-runtime/src/invoke.ts`（execute 相位） | transient+unknown → 落库 unknownReason + breaker failure + `return { error: 'external_outcome_unknown' }` ——评测只见笼统 unknown |
| 7 | `apps/worker/smoke/scoring-eval.ts:97-99` | 非 `business:`/非 `deterministic_refusal` 一律 `transientSkipped++`；:219 跳过率>20% →「供应商当天可能不稳」INCONCLUSIVE（429 持续限速被误归成当日不稳） |
| 8 | 诊断证据 `.tmp/g7-diag-scoringeval-qwenplus-1105.log`（协调方显式指名路径·主仓 .tmp 不作业务上下文仅作诊断读数引证） | 显式 `MODEL_FAST_NAME=qwen-plus`：71 调用 0% 跳过全量有读数；缺省（qwen-turbo）轮共享熔断 429 打满后零外呼 INCONCLUSIVE（自 2026-08 共享熔断落地以来每轮） |

- **Key 行为亲证（非 freetier 档·诊断席证明+诊断 log 一致）**：当前真实 Key（付费模型 Key，qwen-plus 计费在 G7 console price book 0.8/2 每百万）对 **qwen-turbo 持续模型级 429（`limit_requests`）**；同 Key **qwen-plus / qwen3.8-flash 均 200**。即 qwen-turbo 对这把 Key 有效可用性=0（非当日抖动·不会自愈）。

## §1 影响面（fast 模型生产路径全图·本席逐行亲证 @`92a82a944`）

**生产 fast 模型路径清单**（effective `MODEL_FAST_NAME` 决定实际模型）：

| # | 路径 | file:line | 说明 |
| --- | --- | --- | --- |
| 1 | 组合根 | `apps/worker/src/main.ts:532` | `fastModelClient({primary: fastPrimary, backup: fastBackup})` |
| 2 | 正常作答评分 | `apps/worker/src/adaptive-interview-service.ts:821` | `model: detected ? d.model : (d.fastModel ?? d.model)` ——**未检到操纵的正常作答全部走 fastModel**；检到操纵才升 quality（qwen-plus 主端点） |
| 3 | 路由分类 | `apps/worker/src/main.ts:667` → `apps/worker/src/route-classify-consumer.ts:37` | `job.route-classify.v1` 全量仅 fastModel（无 quality 备臂） |
| 4 | 评测入口 | `apps/worker/smoke/scoring-eval.ts:50` | `fastModelClient()`（测生产正常评分路径） |
| 5 | 攻击 smoke | `apps/worker/smoke/adaptive-attack.ts:15` | `MODEL_FAST_NAME ?? 'qwen-turbo'`（同类缺省雷面·本刀随修） |
| 6 | enforce 计费行 | `apps/worker/src/model-cost-governance.ts:160,162` | 缺省模型进 `endpoint(env,'MODEL_FAST',…)`；`MODEL_FAST_BILLING_MODEL`（required）必须与之相等，否则启动即 `model_cost_model_binding_mismatch:model_fast` |

**非 freetier 档（当前真实 Key）行为判定**：effective 模型=qwen-turbo 时，每次评分/路由调用真外呼 → 429 → transient+unknown（冻结·零重试）+ 共享断路器 failure 计数；**第 5 次**打满 0200 种子 threshold=5 → 该 op 分区开闸 → 后续请求 `model_circuit_open` **零外呼**确定性拒绝；30s 半开探针立即再吃 429 → 再开闸。稳态=**整条快链不可用**。

**真实全量档结论**：不只是评测问题。compose.prod.yml `:164`/`:283` 将 `MODEL_FAST_NAME` 设为 required 变量，运维按 worker.env.example 模板填值即得 qwen-turbo → 生产评分正常路径（#:2）与路由分类（#:3）**整条链路持续不可用**（评分失败→unscored/澄清链；路由分类持续拒绝）。显式覆写 MODEL_FAST_NAME 的部署不受影响。诊断 log 显式 qwen-plus 的 71 调用 0% 跳过 = 同 Key 同代码路径换模型即全通的对照证明。

## §2 修法（已随起草落卷·⛔EXEC 期不得更改）

### §2.1 选型：代码缺省 + env example 两者都做（并单源化）

- **只改 env example 为何不够**：代码缺省仍是雷——任何未设 `MODEL_FAST_NAME` 的入口（本地脚本/评测/observe dev/裸镜像）继续打 qwen-turbo。
- **只改 env example + 评测入口显式指定为何不够**：评测显式指定会把评测面与生产缺省解耦——评测永远测不到生产真实缺省行为（本次事故正是「评测在测生产路径」才暴露）；且模板仍教 compose required 变量填 qwen-turbo，生产 enforce 行照旧打满断路器。
- **两者都做 + 单源常量**：`MODEL_FAST_DEFAULT_NAME='qwen-plus'` 导出于 `apps/worker/src/model-cost-governance.ts:108-115`（enforce 计费行语义属该文件），`interview-service.ts:241-242` 引用同一常量——两处缺省物理上不可再漂移（`model_cost_model_binding_mismatch`/`model_cost_policy_model_mismatch` 错配类事故封口）。
- **候选模型约束核查（全部亲证）**：`model-client.ts:682-686` profile×前缀合同（dashscope-cn-beijing 要求小写 `qwen` 前缀）——qwen-plus 合同过；`g7-freetier-reprove-guard.ts:30` `G7_PAID_FALLBACK_ALLOWLIST=['qwen-plus','deepseek-v4-flash']`——qwen-plus 是 allowlist 成员（:177-183 断言面）；G7 console price book qwen-plus 有价（0.8/2 每百万）；`applyG7FreetierReproveEnv:137` 显式覆写 `MODEL_FAST_NAME`（freetier 轮不受缺省影响）；`deploy-worker-env.proof.ts:84/:122` 与 `model-cost-governance.proof.ts:24/:33`、`estimator-v2-cjk.proof.ts:133` 均系**显式 fixture 值**非缺省断言——缺省变更不触（三 proof 亲跑 PASS）。
- **模板四行一致性**：`worker.env.example` :48 `MODEL_FAST_NAME`、:156 `MODEL_FAST_BILLING_MODEL`、:177 `MODEL_FAST_BACKUP_NAME`、:191 `MODEL_FAST_BACKUP_BILLING_MODEL` 同步 qwen-plus——enforce 模式 Billing 模型 required 且须与解析模型相等（模板内两两自洽）。
- **成本面诚实登记**：qwen-plus 单价高于 qwen-turbo（0.8/2 对 0.3/2 每百万）。qwen-turbo 对本 Key 有效可用性=0（持续 429=零成功调用），实际有效成本无穷大；本修法=「可用性换单价」。若供应商后续对该 Key 放开 qwen-turbo，`MODEL_FAST_NAME` env 显式改回即可（零代码回滚）。
- **随修两处（偏离登记 §9-①）**：`smoke/adaptive-attack.ts:15` 缺省同步（同一缺省雷类的 smoke 入口）；`scoring-eval.ts:50` 注释与头行（旧注释钉 qwen-turbo 已失真）。

### §2.2 评测门跳过归因（HTTP 状态族 plumbing·逐字 diff）

**语义不变铁律（三禁核查全过）**：① 熔断阈值零触（0200 种子/共享准入/ breaker failure 计数全部原值）；② 429 不记 success（仍在 transientSkipped 分母·>20% INCONCLUSIVE 阈值语义零变）；③ 已派发 unknown 冻结零重试语义零变（`externalOutcome`/落库 unknownReason/计费 unknown/零重试原值——`errorDetail` 零落库零持久面，仅进程内观测）。

```diff
--- packages/ai-runtime/src/invoke.ts
@@ export type ModelResult（第二臂 additive）
-  | { ok: false; kind: 'transient' | 'deterministic'; externalOutcome?: 'known_not_executed' | 'unknown' }
+  | { ok: false; kind: 'transient' | 'deterministic'; externalOutcome?: 'known_not_executed' | 'unknown';
+      /** 可选传输观测明细（additive·缺省=非 HTTP 失败）。仅 HTTP 状态失败时带出（`http_429` 形），
+       *  供进程内调用方按状态族归因；终态判定/unknown 冻结/落库 error_code 零字节受影响。 */
+      errorCode?: string }
@@ export type InvokeOutcome
-export type InvokeOutcome<T> = { value: T } | { error: string };
+export type InvokeOutcome<T> = { value: T } | { error: string; errorDetail?: string };
@@ known_not_executed 返回位（:1054-1060 现值）
-      return { error: result.kind === 'deterministic' ? 'deterministic_refusal' : 'provider_rejected' };
+      return { error: result.kind === 'deterministic' ? 'deterministic_refusal' : 'provider_rejected', ...(result.errorCode ? { errorDetail: result.errorCode } : {}) };
@@ transient/unknown 返回位（:1142-1148 现值·落库 unknownReason 原值零字节）
-    return { error: 'external_outcome_unknown' };
+    return { error: 'external_outcome_unknown', ...(result.errorCode ? { errorDetail: result.errorCode } : {}) };

--- packages/ai-runtime/src/model-client.ts（:933-938 现值）
           if (error instanceof ExternalHttpStatusError) {
             const transient = error.status >= 500 || error.status === 429 || error.status === 408 || error.status === 425;
-            return { ok: false, kind: transient ? 'transient' : 'deterministic', externalOutcome: transient ? 'unknown' : 'known_not_executed' };
+            return { ok: false, kind: transient ? 'transient' : 'deterministic', externalOutcome: transient ? 'unknown' : 'known_not_executed', errorCode: `http_${error.status}` };
           }

--- apps/worker/src/interview-service.ts
@@ EvaluationInvokeResult failed 臂 additive
-  | { status: 'failed'; error: string; primaryIdempotencyKey: string };
+  | { status: 'failed'; error: string; errorDetail?: string; primaryIdempotencyKey: string };
@@ invokeEvaluationOnce 透传
-  return { status: 'failed', error: primary.error, primaryIdempotencyKey };
+  return { status: 'failed', error: primary.error, ...(primary.errorDetail ? { errorDetail: primary.errorDetail } : {}), primaryIdempotencyKey };
```

- 其余四个 `external_outcome_unknown` 返回位（invoke.ts :1082/:1125/:1169/:1256 现值）均系 HTTP-200 已执行/结算/usage 面——无传输状态可带，**零字节**（unknown 冻结语义零触）。
- **评测面分桶（`apps/worker/smoke/scoring-eval.ts:52-69,118,216-228` 现值）**：`countSkipBucket` 把跳过分为五桶——熔断/准入拒绝（六 error 码闭集 `ADMISSION_ERRORS`=零外呼连锁面）/HTTP429 限速/HTTP5xx/HTTP4xx 拒绝/网络未知；汇总行带 `[…构成]` 明细；INCONCLUSIVE 消息按主导桶归因（429 主导 →「该模型对此 Key 持续不可用;属配置/额度问题,不会当天自愈」，替代旧「供应商当天可能不稳」笼统归因）。每样本 `rejected=${s.reason}` 词面原样保留 + 有明细才追加 ` detail=http_<status>`（scoring-eval-key 源形证明钉面零触·亲跑 PASS）。
- 头行新增 `快模型=<有效值>` 打印（`MODEL_FAST_NAME?.trim() || MODEL_FAST_DEFAULT_NAME`——非凭据·模型名·nightly 归因面）。

### §2.3 质量面后继登记（本刀零触评分 prompt·派单 Ban 面如实遵守）

- **读数（1105 诊断轮原值）**：严格单调性 Wilson 下界 **0.589**（发布候选线 ≥0.90）· 扰动组内 SD **p90=17.5**（tripwire ≤12）· 剥离 **Δ=50**（MI-锁-英文尾巴, tripwire ≤15）。
- **MI-锁-英文尾巴 Δ=50 定位（真实注入敏感？否——同输入方差）**：
  - fixture：`apps/worker/test/scoring-golden.ts:169-177`（poisonedAnswers :173 英文祈使尾巴 / :174 换行角色伪造尾巴）。
  - 剥离层：`packages/domain/src/adaptive-interview.ts:290-303` MANIPULATION_RE——:298 `(ignore|disregard|override)\b[^.\n]{0,24}(rubric|…)` 命中 v0；:302 `grading[- ]?override|award\s+(full|100)…` 与 :303 行首角色伪造命中 v1；`stripScoringManipulation` :311-327 按句剥（只去命中句）。
  - eval 臂：`apps/worker/smoke/scoring-eval.ts:200-206`——strip 判据 :202-203（`stripped.detected && stripped.clean === g.cleanAnswer`）；重评 :205。**关键机制**：`scoreOnce`（:95-97）先剥再派发，poisoned 臂实际送模型内容=cleanAnswer，与 clean 基线**逐字节同一 prompt**，仅幂等键不同（`${g.id}:poison:${i}` vs `${g.id}:clean`）=强制 cache miss 的两次独立真调。
  - **结论：Δ=50 不是注入敏感**——注入尾巴根本没到模型（strip=PASS 先剥）；它度量的是同输入两次调用的评分方差（评分温度钉 0.2 非 0：`model-client.ts:178-186` `resolveEvalTemperatureOverride` 缺省 0.2）。跨轮佐证：诊断轮 MI-锁:v1 Δ=50/本轮 v0 Δ=50（v1 翻 0）；MI-限流:v1、MI-RAG:v0+v1 本轮各 Δ=50 而诊断轮全 0——50 分摆动在臂间漂移，与载荷内容无关，形状=0↔50 档位翻转（relevant 翻转或 meets/below 判档翻转经 `evaluateOutcomeFromValue` 派生）。
  - **最小复现**：任取 question+cleanAnswer，连续两次 `invokeEvaluationOnce`（不同 baseIdempotencyKey 强制 cache miss，`promptAnswer`=cleanAnswer）→ 两次 derived score 之差在 0/50 间偶发摆动；`scoring-eval.ts` MI 臂（:200-206）即该复现的生产化版本。
  - **后继建议（登记不入刀）**：①评分温度 0.2→0 的显式决策评审（`route-classify`/`vision` 已钉 0 先例 :193-195；`MODEL_EVAL_TEMPERATURE` override 缝已在位）；②或评分 op 自一致性（k 样本取中位档）；③或 0↔50 边界判据加锚（rubric 对 meets/below 边界样本显式锚定）。
- **单调性 0.589 与扰动 p90 归因（诚实登记·不改口径）**：各组读数 `[100,50,0,0,0]`——档 3-5（中下/差/极差）全 0 分并列，非相邻档对（2,4）类 tie 计严格失败（5 组×1 对）+ MG-评分可信 `(1,3)` tie = 27/36。质量信号=评分官对「差答案梯度」无区分度（中下区间饱和压 0），与 Δ50 的 0/50 边界翻转同根。属评分官质量面，非本刀修法面。

## §3 cap 预登（CAP-SANCTION-2487 恰等步进·随届值如实采）

- 届值亲证：worktree 改前 `node scripts/ai-docs/check-docs.mjs` **EXIT=0 scanned 2486 = cap 2486 恰等零余量**（本席亲跑·`MAX_FILES = 2_486` @origin/main `92a82a944` 亲证）。
- 本卷 REQUEST 受管 1 件 → 2487 必超 → 沿协调方派单常设预授权「随届值如实采·恰等步进预登」随令行使 +1 恰等零多放：**cap 2486→2487（CAP-SANCTION-2487）**。
- 四联动点已随卷恰等改（两 policy 脚本）：`policy.mjs` `MAX_FILES 2_487` + 链区注记；`proof.mjs` loop `i < 2_487` / atCap `scannedFiles 2_487` / overCap `f-2487.md` / `FILE_LIMIT:2488` + 形状注释两行 + 链区注记（越限臂 fabricated 数随 cap 联动同步·既有注记栈 append-only 零改写·PTP 12/12 联动后亲跑绿）。
- 在飞如实列（merge-base `92a82a944` 亲测·`MAX_FILES` 承值逐支亲读）：**flipa-draft** ahead=1 承 2_487 两 policy 热面 / **online-pay-rev** ahead=2 承 2_487 同 / **s3caps-draft** ahead=5 承 2_487 同（前届注 2_485 ahead=3 系彼时届值·现树如实重采）/ **uc31-rev** ahead=1 承 2_487 同——四支同值 2487=共享热面，并线 union 沿常设预授权届时取大重算承登；ag20-residual-draft（origin）ahead=1、xs-draft ahead=4、uc31-draft、online-pay-draft、fix/* 三支 各 ahead≤4 两 policy 零触亲测；ccl/* ancient 簇（merge-base `112e6d26f`/`639134f60`·ahead 数百-数千）不预采。
- EXEC 期=既有码面 in-place + 收据 .log（∉TEXT_EXTENSIONS 不计）零新受管文件 → EXEC terminal **2487 零新增**。

## §5 Ban

- Ban self-approve · alone≠dual（pre-exec 双审两独立外席待派）· Dual PASS ≠ 开工。
- Ban 改评分 prompt/rubric/温度（§2.3 后继面本刀零触）· Ban 抬熔断阈值/改共享准入种子 · Ban 把 429 记 success · Ban 改已派发 unknown 冻结零重试语义 · Ban 改评测 INCONCLUSIVE 阈值（>20%）与发布候选线 · Ban 翻 pins。
- Ban push · Ban merge 主线 · Ban force push · 一切改动只交付本工作树（主仓零 mutation·worktree add 除外）· Ban 触其他工作树。
- Ban 超出 §3 预登值（2487）自升 cap（cap sanction 权归协调方·并线期 union 越限沿常设预授权届时重算承登·非本席越权）。
- Ban 洗史录（两 policy 注记栈 append-only·既有注记零字节改写）· Ban 假绿绕过与测试门弱化 · Ban 打印 Key 值/指纹（全程只报 set/unset·name-only）· Ban 读/建 `.env*`（真实 Key 仅经 `~/.meetwise-secrets/load-model-api-key.sh` 受控加载）。
- Ban 重跑冲销（评分 eval 只跑一次如实入卷·门红不重跑冲销·如实登记升级）· Ban 就地归因邻面新红（Ban 借机修）。

## §8 停手

**STOP · `draft:awaiting_pre_exec_dual` · 2026-11-05 起草席落卷即停 · pre-exec 双审两独立外席待派 · Ban self-approve · alone≠dual。** 停止条件四类（命中即停手上报·Ban 就地处置）：
- **file:line 不符**：亲证阶段全锚吻合（派单锚 :237/:160/:48/model-client :680-682 前缀合同/`g7-freetier-reprove-guard.ts:30` allowlist 全部实测命中·行号即 origin/main 现值）——EXEC 期再遇锚漂 → 停手上报。
- **机制不满足**：评分 eval 真跑若跳过率>0（本刀修法后应 0%）或快模型行非 qwen-plus → 红停上报（Ban 改判据凑绿）。
- **验收红且口径内修不了**：docs:check 超 §3 届值且协调方未裁 → 红停；PTP proof 红 → 红停；markers 净增非零 → 红停；typecheck/lint 超预算 → 红停。
- **越界**：需触评分 prompt/别的仓/主仓 mutation（worktree add 除外）/超出 §2 修法面的改动才能继续 → 停手记录现场证据上报。

## §9 落卷记录（2026-11-05 起草席）

- **落卷内容**（本 commit tracked 面恰 10 文件+收据）：① `apps/worker/src/interview-service.ts`（§2.1 缺省单源引用+§2.2 errorDetail 透传·+9/−4）② `apps/worker/src/model-cost-governance.ts`（§2.1 `MODEL_FAST_DEFAULT_NAME` 单源·+9/−1）③ `docker/env/worker.env.example`（§2.1 四行 qwen-plus·+4/−4）④ `apps/worker/smoke/adaptive-attack.ts`（§2.1 随修缺省·+1/−1）⑤ `apps/worker/smoke/scoring-eval.ts`（§2.2 分桶/归因/头行·+42/−11）⑥ `packages/ai-runtime/src/invoke.ts`（§2.2 ModelResult/InvokeOutcome additive·+21/−4）⑦ `packages/ai-runtime/src/model-client.ts`（§2.2 `http_<status>`·+3/−1）⑧ `scripts/ai-docs/public-text-policy.mjs`（§3 cap+链注·+2/−1）⑨ `scripts/ai-docs/public-text-policy.proof.mjs`（§3 四联动点+链注·+7/−6）⑩ 本卷 `ai-docs/delivery/harness/fast-model-config-REQUEST.md`；收据 `receipts/fast-model-config/scoringeval-postfix-2026-11-05.log`（∉TEXT_EXTENSIONS 不计面）。
- **评分 eval 真跑（修复后单跑一次·本席亲跑·Key 经受控 loader 只报 set/unset：MODEL_API_KEY=set·FINGERPRINT/PROFILE/FAST_NAME=unset·零值打印零 .env 触）**：`pnpm scoring:eval` 完整隔离 PG（migrations applied=222）→ **快模型=qwen-plus（MODEL_FAST_NAME unset·代码缺省生效直证）**·评分请求 71·实际供应商调用 71·quote 拒绝 0·确定性短路 5·业务/证据拒绝 0·**跳过(model_transient) 0(0%)**[熔断/准入拒绝=0·HTTP429=0·HTTP5xx=0·HTTP4xx=0·网络未知=0]。**四段信号行原值**（收据 .log 随卷逐字）：
  1. `严格单调性=0.750=27/36; Wilson95%下界=0.589 (发布候选:样本≥36且下界≥0.90)` ——**低于候选线**（⚠ 如实记录·不翻 pin 不改阈值；逐组分=[100,50,0,0,0]×5+[0,50,0,0,0]，tie 失败模式=§2.3 中下档饱和归因）
  2. `评分器信度 ICC(1,1) = 0.810(阈≥0.75:两道独立题对质量档的区分一致)` ——线内（诊断轮 NaN/题档不全，本轮四档全有读数）
  3. `中位组内SD=0.0, p90=0.0, max=0.0 (tripwire:中位≤8,p90≤12,max≤15)` ——线内（诊断轮 p90=17.5/max=25.0；本轮 PG-限流 变体分 [50,50,50,50] 零散）
  4. `全部相关性=18/18, Wilson95%下界=0.824; 模型判别子集=13/13, 下界=0.772 (发布候选:模型子集≥36且下界≥0.90)` + `剥离精确率=8/8, Wilson95%下界=0.676; 可比模型对=8, 最大分差=50.0 (tripwire:所有剥离通过; Δ≤15)` ——相关性/剥离全过但**下界未达 0.90/Δ=50 超 tripwire**（⚠ 如实记录；Δ=50 归因=§2.3 同输入方差·臂间漂移佐证）
  - 信号行总评 `信号:严格单调性⚠ · ICC✅ · 扰动✅ · 模型相关性⚠ · 攻击不变性⚠`；绝对分校准未建立（缺双盲人工锚·既有状态零变）。**低于候选线如实登记，未翻任何 pin、未改任何评测阈值**（派单第 4 条要求本身）。
- **门矩阵（本席亲跑）**：

| # | 门 | 期望 | 实测 | 结论 |
|---|---|---|---|---|
| 0a | docs:check 改前基线 | EXIT=0 scanned=cap | EXIT=0 scanned **2486**=cap 2486 恰等 | 绿 |
| 1 | `pnpm -C packages/ai-runtime typecheck` | EXIT=0 | EXIT=0 | 绿 |
| 2 | `pnpm -C apps/worker typecheck` | EXIT=0 | EXIT=0 | 绿 |
| 3 | ai-runtime lint | ≤628 warnings·0 errors | 0 errors/628 warnings（改动文件对 base 警告计数 32→32 恰等零新增） | 绿恰等 |
| 4 | worker lint | ≤999 warnings·0 errors | 0 errors/999 warnings（改动文件 14→14 恰等零新增） | 绿恰等 |
| 5 | `prove:deploy-worker-env`（worker） | 全 PASS | PASS×3 全绿（显式 fixture 值面·缺省变更零触亲证） | 绿 |
| 6 | `prove:model-cost-governance`（worker） | 全 PASS | PASS 全绿 | 绿 |
| 7 | `prove:estimator-v2-cjk`（worker） | 全 PASS | PASS 全绿（显式 fixture·零 DB） | 绿 |
| 8 | `prove:scoring-eval-key`（worker） | 全 PASS | PASS 全绿（`rejected=${s.reason}` 词面/构造点源形钉面零触） | 绿 |
| 9 | ai-runtime model-client-dispatch/failover/model-client-output-limit/model-client-stream/usage-estimate-threading | 全 PASS | 五件全 PASS | 绿 |
| 10 | PTP proof 落卷后 | 12/12 | `static_preflight_valid: selected=12/12; releaseEvidence=false` | 绿 |
| 11 | docs:check 落卷后 | EXIT=0 scanned=cap 2487 恰等 | 本席亲跑见下 | 绿 |
| 12 | markers 五类标记词探针（`i6-239-gates.proof.mjs:151-163` 同源运行时组装·词面防自指不入卷） | 改动集 0 命中 | 改动集 10+收据 .log 共 11 件 **0 命中** | 绿 |
| 13 | `node scripts/provider-egress-inventory.mjs` | EXIT=0 | EXIT=0（`MODEL_FAST_NAME` 非受管 environmentNames·零新增环境引用·manifest 零触亲证） | 绿 |
| 14 | 基线红（与本刀无关·不修不改判） | — | `failover-price-policy`/`adaptive-latency`/`invoke-model-delta`/`estimate-threading-invoke` 四 proof 需 DATABASE_URL env（`database_config_invalid:database_target_missing`）——**对 origin/main 基线同码同红亲证**（本席双侧亲跑·CI env 面非本刀触面） | 基线红单列 |

- **门 11 复跑读数**：`node scripts/ai-docs/check-docs.mjs` EXIT=0 · public text policy scanned **2487 = cap 2487 恰等零余量**（本卷 1 件落卷后·§3 算式兑现）。
- **偏离任务书清单（如实·两处）**：
  1. **缺省修法触面大于派单点名两处**：派单点名 `interview-service.ts:237`+`model-cost-governance.ts:160`+`worker.env.example:48`；本刀另触 `adaptive-attack.ts:15`（同一缺省雷类的 smoke 入口·不改则该入口继续打 qwen-turbo）、模板 :156/:177/:191 三行（enforce Billing/Backup 名必须与主名相等否则启动 `model_cost_model_binding_mismatch`——只改 :48 反而造启动红）、缺省字面量单源常量 `MODEL_FAST_DEFAULT_NAME`（两处缺省物理防漂移）。均在「改代码缺省」候选语义面内·机制必要非自由发挥。
  2. **评测入口未采「显式指定」候选**：选「两者都做」后评测继承新代码缺省（头行打印快模型有效值直证）——评测继续测生产真实缺省路径（本次事故的暴露机制本身）；显式指定会永久屏蔽缺省面回归。
- **est live=71**：评分 eval 真跑=71 次真实模型外呼（本刀唯一真模型消耗面·评分 eval 是 nightly 非阻断信号·成本口径 qwen-plus 计费）·actualSpendCny=null（无供价对账缝·如实 null）·零生产操作零 secrets 触面。
- **状态保持 `draft:awaiting_pre_exec_dual`**（待 pre-exec 双审两独立外席·EXEC 期复跑评分 eval/门矩阵归 EXEC 边界·本席零长驻服务零浏览器 UI runner）。

**STOP · `draft:awaiting_pre_exec_dual` · 2026-11-05 起草落卷 · pre-exec 双审两独立外席待派 · alone≠dual · ⛔push⛔merge主线⛔force push**

---

*FAST-MODEL-CONFIG REQUEST · 2026-11-05 起草落卷 · **`draft:awaiting_pre_exec_dual`** · base `origin/main` @`92a82a944`（=PR #209 perf-status-pin merge·fetch 后 rev-parse 亲证）· 分支 `line/fastm-draft` · 工作树 `meetwise-fastm`（本起草席 `git worktree add` 亲立·主仓零其他 mutation）· 立项出处=协调方派单 brief（快模型配置与 scoring:eval 修复刀起草席）· 根因=MODEL_FAST_NAME 代码缺省 qwen-turbo 两处+env example 模板·现网 Key 对 qwen-turbo 持续模型级 429（limit_requests）·5 次打满 0200 种子共享断路器（threshold=5）→ 评分正常路径（adaptive-interview-service.ts:821）+路由分类（route-classify-consumer.ts:37）整条快链 `model_circuit_open` 零外呼·生产全量档不可用（compose required 变量按模板填值即命中）·显式 qwen-plus 对照 71 调用 0% 跳过全通 · 修法=两者都做（代码缺省单源常量 MODEL_FAST_DEFAULT_NAME=qwen-plus+模板四行）+评测门跳过 HTTP 状态族归因 plumbing（ModelResult errorCode?/InvokeOutcome errorDetail? additive·`http_<status>`·五桶分桶+主导桶归因消息·熔断阈值/429=success/unknown 冻结零重试三禁零触·落库面零字节）· 质量面后继登记=MI-锁-英文尾巴 Δ=50 定位（strip 先剥·派发与 clean 逐字节同 prompt 仅幂等键异=同输入方差非注入敏感·温度 0.2·臂间漂移跨轮佐证·file:line 全锚）+单调性 0.589（中下档饱和 tie）+后继三建议（温度 0/自一致性/边界锚）·本刀零触评分 prompt · CAP-SANCTION-2487 恰等步进预登（2486→2487·四联动点 2_487/f-2487.md/:2488·在飞 flipa/online-pay-rev/s3caps/uc31-rev 四支承 2_487 两 policy 热面如实列·union 届时取大重算）· 评分 eval 修复后真跑一次 0% 跳过四段信号行原值入卷（单调性 0.589/ICC 0.810/扰动 p90=0.0/相关性下界 0.772+剥离 Δ=50·低于候选线如实记录零翻 pin 零改阈值）· 门矩阵 13 绿+基线红 4 单列（DB env 面·main 同红亲证）· 偏离两处如实登记 · pins 十一值照抄零翻（haStatus=NOT_HA·releaseEvidence=false·claimProductionHA=false·gR45Closed=true·coveredCount=8·ms3EqualsR4Closed=false·PG-retained·公开 DELETE=503·g7SuiteGreen=false·r1Closed=false·actualSpendCny=null）· est live=71 · markers=0 · 停止条件四类全设 · ⛔push ⛔merge主线 ⛔force push · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP*
