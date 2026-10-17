# TRACE-RECON REQUEST — trace 对账回补小刀起草（fail-open 缺失面 recon 承接·批5 残件 #172·后继观测刀承接位·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷 2026-10-16·pre-exec 双审两独立外席待派·alone≠dual·EXEC 未开工·本 commit 不预 claim 任何 EXEC 门矩阵结果·est live=0）

**席位**：trace-recon REQUEST 起草席（读码定稿+修法裁量+起草三责·协调方派·批5 残件 #172 承接位=`trace 写入 fail-open 后无对账回补·丢失即永久丢`·后继观测刀=LEDGER :87 四子刀 OBS 域在案承继）。
**基线**：`feat/mysql-schema-skeleton` @ `4124c803`（origin tip 恒等亲证——`git fetch` 后 `origin/feat/mysql-schema-skeleton`=`4124c803`·派单下界「origin tip≥最新」成立·主仓 HEAD `7d71a64f` 落后 13 commit 本席未用·分支 `line/trace-recon`（`git worktree add ../meetwise-trc -b line/trace-recon origin/feat/mysql-schema-skeleton` 亲立·HEAD 落 `4124c803` 亲证）·工作树 `meetwise-trc`（主仓仓根同级）·docs:check 基线 **2223≤cap 2232** 本树亲跑 EXIT=0·迁移链 **204 文件头 0204** 亲数）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①批5 残件 #172 派单 brief（2026-10-16·后继观测刀承接位）；②LEDGER `ai-docs/delivery/harness/product-campaign-LEDGER.md:87` 5C 可靠性行「**#172 残余（A2 recon 回补臂）归后继观测刀（四子刀 OBS 域在案）**」+`:492` 5C-SSE-API 子刀行「#172 trace 丢失率分母 ✅ nail 收官」（分母半已闭·回补半=本刀靶）；③GAP 台账 `ai-docs/delivery/gap-bug-backlog.md:732`「`GAP-UC028-RECON`（A2 对账补写 · F5 实证本刀不做）…仍 OPEN · 待各自 REQUEST 刀」——本卷即其 REQUEST 刀；④harness 缺口件 `ai-docs/delivery/harness/uc-e2e-028-trace-ledger-fail-open.md:63` §1b-3「missing-trace 重写/标记缺失+事后对账补写路径+prove」三件套原文；⑤形制范本 `ai-docs/delivery/harness/trace-service-wire-REQUEST.md`（§0-§8+trailer 形制·STOP 三条款+四类停止条件+pins 十一值沿承）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/Read/git hash-object 实测 @`4124c803`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git branch --list "line/trace-recon*"` 恰 1 命中=本席分支；`git worktree list` 含 `meetwise-trc` 恰 1 树；`ls ai-docs/delivery/harness/ | grep -i trace-recon` 建前零命中→落卷后唯一同名卷=本卷。
- **本刀=docs-only 起草卷（本 commit 恰 1 .md·零产品码）**：在飞交叠复核对象=§0.1 十四锚 Stability（非触面）——任一锚 blob 对届时 tip 漂移→重 pin 改锚非停（本刀零写触·漂移不改结论）；共享 SSOT（LEDGER/checklist/backlog）零写触（§3-4）。

### 0.1 blob 锚表（`git hash-object` 亲算 @`4124c803`）

| # | 文件 | blob（8 hex） | 行数 | 关键行锚 |
|---|---|---|---|---|
| 1 | `packages/ai-runtime/src/invoke.ts` | `44340f39` | 1211 | **trace 唯一写入口+fail-open 旁路**：`:490` `persistTrace(`→`:502`/`:508` 两条 `INSERT INTO ai_invocation_trace(...)`（`ON CONFLICT(owner_user_id,idempotency_key) DO NOTHING`——**幂等 arbiter=0001 PK 既有·零新约束**）→`:516-:519` 书面域界「失败 trace 的对账重写属 A2 recon 域，本旁路不冒充 recon」→**`:522` `persistTraceBestEffort(`**：`:526` `inc(aiTracePersistAttempts)`（丢失率分母）·`:529` `inc(aiTracePersistFailures)`（分子）·`:533-:539` 结构化日志 `event='ai_trace_persist_failed'` 字段=`service`/`idempotencyKey`/`errorName`/`pgCode`（脱敏纪律：不放 owner/原文/堆栈）；`:1171` fail-open 调用点（**事务外**·`if (!error)`=仅 validated success 写 trace）；`:1146` `stored` 派生（redactOutput→`{redacted:true}`）；`:794` `claim.action==='cached'` 回放臂读 **ai_model_invocation 面**（非 trace·业务真相/回放不受损三面剥离之一）；`:1167-:1169` A1 契约注释（trace 拆出事务·INSERT 失败不连坐 settle/complete） |
| 2 | `packages/ai-runtime/src/metrics.ts` | `a34c585d` | 187 | `:109` `aiTracePersistFailures: 'ai_trace_persist_failures_total'`（分子）·`:112` `aiTracePersistAttempts: 'ai_trace_persist_attempts_total'`（分母·丢失率=PromQL 侧除法零新 gauge `:110-:111` 原文）·`:102-:107` #10 先例双 gauge（`model_invocation_reconcile_dispatching_aged`/`model_invocation_unknown_backlog`·「gauge 是全局绝对值…告警侧 max() 去重」低基数纪律）·`:165-:166` 零预填 |
| 3 | `packages/db/migrations/0001_baseline.sql` | `d68f8dd0` | 485 | `:55-:60` `CREATE TABLE ai_invocation_trace`（output jsonb **NOT NULL**·`PRIMARY KEY (owner_user_id,idempotency_key)` **:59=回补幂等 arbiter**）·`:62` `GRANT SELECT, INSERT, UPDATE ON ALL TABLES … TO app_role`（**回补 INSERT 通路在**）·`:66-:75` 五表 `ENABLE+FORCE RLS` owner 双侧策略（**写必须经 principal 作用域**） |
| 4 | `packages/db/migrations/0037_ai_model_invocation_durable_claim.sql` | `9916a37e` | 41 | **真相面（回补源）**：`:7-:9` PK(owner,idempotency_key)+`succeeded 可安全回放非敏感输出`·`:15` `output jsonb`·`:17-:21` `service/input_tokens/output_tokens/latency_ms/request_id` 全列·`:30-:31` CHECK `(status='succeeded' AND output IS NOT NULL AND completed_at IS NOT NULL)`（**succeeded 行 output 恒非空=trace output NOT NULL 可满足**）·`:34-:35` 部分索引+FORCE RLS owner 策略 |
| 5 | `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a` | 475 | P1 `:26-:31` `ai_model_invocation.estimate_input_tokens` 列（**全 outcome 落库**·claim 后 identity-immutable）——**estimate 无法事后重算（invoke.ts `:492-:495`「原始 prompt 因隐私只落 digest」）但已随 claim 冻结真相面=回补可携带**·trace 侧同名列仅 `!error` 臂落（`:499` invoke.ts 已知缺口原文） |
| 6 | `packages/db/migrations/0056_model_invocation_reconcile.sql` | `17ffb25a` | 59 | **scoped 函数先例**：`:12-:30` `ai_cost_mark_unknown_for_model_reconcile_scoped` SECURITY DEFINER+`search_path=public,pg_temp`+输入校验（key 1-256 `:19-:22`）+`ai_cost_require_request_owner` 卫（`:20`）·`:44` `gateway_model_invocation_owners` 窗口校验 22023 形（**owner 枚举面**） |
| 7 | `packages/db/migrations/0179_ag_d_release_refused_claim.sql` | `d17b6c12` | 85 | scoped SECURITY DEFINER 函数完形（`:33-:46` 签名+白名单前置校验+`:47-:49` `FOR UPDATE` 存在性探测→`:59` `INSERT … ON CONFLICT … DO NOTHING` 同款幂等形）——回补函数形制模板 |
| 8 | `packages/db/migrations/0035_ai_cost_principal_scope.sql` | `93be6aec` | 54 | `:4-:10` `ai_cost_require_request_owner`：`current_setting('app.principal_user',true) IS DISTINCT FROM p_request_owner`→`insufficient_privilege`——**scoped 函数 principal 一致性卫（RLS 等价纪律的函数内执行点）·回补函数必带** |
| 9 | `packages/db/migrations/0203_gateway_model_invocation_backlog.sql` | `55b462c7` | 32 | **#10 观测化先例（聚合只读面）**：`gateway_model_invocation_backlog` SECURITY DEFINER **只读双 COUNT**·窗口校验 22023·`REVOKE ALL … FROM PUBLIC, app_role`+`GRANT EXECUTE … TO app_gateway_role`（`:29-:31` 聚合面与行级面分离纪律）·「零 owner/PII/原文」头注 |
| 10 | `packages/db/migrations/0039_resume_derivative_erasure.sql` | `d0b2199f` | 6 | `:6` `GRANT DELETE ON ai_invocation_trace, ai_model_invocation TO app_role`——**擦除连删两表**（回补差集自然不含已擦 owner·Ban 复活已擦身份的通路=源行已失） |
| 11 | `packages/db/migrations/0198_trace_created_at_index.sql` | `50823c80` | 9 | `ai_invocation_trace(created_at)` 时间索引（保留期清理支撑）——**回补行 created_at=回补时刻≠原时刻**的保留窗边界载体（§1.2 边界③） |
| 12 | `packages/db/migrations/0027_interview_event_unique_constraint_reconcile.sql` | `520d5903` | 5 | **event_key 幂等先例**：`ADD CONSTRAINT … UNIQUE (stream_key, event_key)`——「表级唯一约束 arbiter+重放 DO NOTHING」幂等形；trace 面该 arbiter 已由 0001 `:59` PK 承载（**回补零需新约束**） |
| 13 | `apps/worker/src/model-invocation-reconcile.ts` | `7877f309` | 145 | **sweep 臂形制模板**：`:42` `resolveModelInvocationReconcileConfig(env)`·`:70` owner 级 reconcile（per-owner principal）·`:92-:132` `tick`（owner 枚举→逐 owner→`inc(..., {result})` 分类计数→`:129-:130` `setGauge` 双水位）·`:141-:144` `runModelInvocationReconciler`=drainLoop intervalMs 30_000 |
| 14 | `apps/worker/src/main.ts` | `d5e8ff2b` | 857 | **接线面**：`:34-:36` reconciler 三 import（commerce/model-invocation/usage-calibration）·`:820-:821` shutdown 登记 `{name, stop, phase:'loop'}`·`:854` ready 横幅 reconciler 清单——回补 sweep 循环同位接入（新 `trace-recon.ts` 第四 reconciler） |

### 0.2 派单简报漂移登记（结论零变处如实改锚/定性·实质漂移一处如实在案）

1. **简报候选甲原述「recon sweep=定期扫失败日志→按 idempotencyKey 重放 trace INSERT」——源面语义缺陷·读码定稿修正（§1.2 定稿承接种）**：失败「日志」系 `console.error` 单行 JSON 流（锚#1 `:533-:539`）——进程生存期态·多实例分裂·无游标无查询接口·重启即失，**不可作为 sweep 源构造**。唯一可靠回补源=`ai_model_invocation` 真相差集（锚#4）：`status='succeeded' AND error_code IS NULL` 且 trace 无同键行。该修正不改派单「recon sweep 承接」结论·改其源面定义（红事实 §1.1-③机制链）。
2. **简报「AI_TRANSITIONAL 表可写性核」——全仓零 `AI_TRANSITIONAL` 字面（`grep -rn "AI_TRANSITIONAL"` 亲证零命中·ai-docs 零命中）**：按派单语境读作「AI 域过渡/旁路两表（ai_invocation_trace+ai_model_invocation）回补写通路核」——核讫=**通路成立**：INSERT GRANT 在（锚#3 `:62`）·但 FORCE RLS 钉死写路径必须 principal 作用域（asPrincipal 或 scoped SECURITY DEFINER+`ai_cost_require_request_owner` 卫锚#8）·聚合只读面沿 0203 走 app_gateway_role 与行级写面分离（锚#9 `:29-:31`）——**零需新 GRANT/新 role/BYPASSRLS**（§1.2 定稿②）。
3. **TSW 登记卷定性承继（零漂移·亲证不变）**：#172 定性「trace=可观测旁路+usage 估算对账样本面·业务真相/计费/回放三面不受损」对本基线逐字复核成立（锚#1 `:794` cached 臂读 ai_model_invocation·trace 生产读路径零命中）——本刀即其登记的「后继观测刀」承接位：TSW §0.2-3/§1.3 候选丙登记的回补靶面=本卷 §1.2 定稿对象。

### 0.3 迁移号登记（预期恰 1 迁移·EXEC 期认领）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**204**·头 `0204_ai_cost_cached_input_price.sql`。
- 本刀 EXEC 期预期恰 1 新迁移：`0205_ai_trace_backfill_scoped.sql`（§1.2 定稿①·函数单文件 multi-statement 形沿 0203 头注 `@migration-mode` 纪律）——**EXEC 立项时认领号=对届时主线链顶亲数+在飞分支题面复核后取最小未占号顺延·Ban 抢号**；若届时 0205 已被占→顺延取号·本卷号面作废重登记非停。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 fail-open 旁路现形（丢失面机制钉死）

- **写入口唯一+幂等形既有**：`ai_invocation_trace` 全仓 INSERT 仅 invoke.ts `:502`/`:508` 双形（requestId 列有无分支）·`ON CONFLICT(owner,idempotency_key) DO NOTHING`——回补臂与原写共享同一 arbiter（0001 `:59` PK）·**原写与回补竞态=零重复零冲突错**（后到者 DO NOTHING）。
- **fail-open 旁路**（UC-028 A1 已钉契约）：`:522-:542` persistTraceBestEffort 在自己的 principal 事务内 best-effort——INSERT 失败不回滚已提交的 settle/complete 业务事务·不改写 invoke 成功终态·`:1171` 事务外调用且仅 `!error`（validated success）臂写。
- **观测面（回补定位键已留痕）**：分母 attempts `:526`（成功失败都过入口计一次）+分子 failures `:529`（丢失率=failures/attempts·PromQL 侧除法）+单行 JSON 日志 `service`/`idempotencyKey`/`errorName`/`pgCode`（`:533-:539`·脱敏不放 owner/原文/堆栈）——**但日志非持久账面**（§0.2-1）：可定位≠可回放·回放必须回到真相面。
- **丢失面定性（三面剥离·承 TSW 亲证复核）**：丢失=①观测链断点（trace 缺行）②estimate↔usage 校准样本缺失（`:492-:495` 已知缺口书面在案·且 estimate 原值随 claim 冻结于真相面锚#5——**丢失后仍可再生**）——业务真相/计费/幂等回放三面不受损（`:794` cached 臂读 ai_model_invocation）。「丢失即永久丢」的精确域=**可回补窗口有限**：真相面 succeeded 行受自身保留期/擦除约束（0039 DELETE·0198 保留期索引）——**不回补则源行清理后永缺·检测越晚可补集越小**，此即 A2 补写臂的时间性理由。

### 1.2 回补臂候选裁量（读码定稿核心交付·最小面定稿）

**定稿=真相差集 sweep 回补臂（修正源面）·三件最小闭合面**：

- **①迁移恰 1（`0205` 起号·§0.3）**：`ai_trace_backfill_scoped(p_owner_user_id, p_idempotency_key)` RETURNS boolean——形制沿 0056/0179 scoped 函数模板：`SECURITY DEFINER`+`SET search_path=public,pg_temp`+`PERFORM ai_cost_require_request_owner(p_owner_user_id)`（锚#8 principal 卫·**必带**）+输入校验（owner 非空·key `char_length BETWEEN 1 AND 256` 沿 0056 `:19-:22` 形）+`INSERT INTO ai_invocation_trace(owner_user_id,idempotency_key,output,service,input_tokens,output_tokens,estimate_input_tokens,latency_ms,request_id) SELECT 同列 FROM ai_model_invocation i WHERE i.owner=i AND i.key=key AND i.status='succeeded' AND i.error_code IS NULL ON CONFLICT(owner_user_id,idempotency_key) DO NOTHING`→`RETURN FOUND`（真插 true/已在或源缺 false）。requestId 列有无分支：函数按届时链是否含 0014 列恒真（0014 在基线链恒已应用·单形即可·EXEC 期对链亲证）。
- **②worker sweep 循环恰 1（新 `apps/worker/src/trace-recon.ts`）**：形制沿锚#13 模板全形——`resolveTraceReconConfig(env)`（intervalMs 缺省 30_000 同 drainLoop 族）+owner 枚举沿 `gatewayModelInvocationOwners`（0056 `:44` 先例面·窗口校验同形）+逐 owner `asPrincipal` 调 backfill_scoped+分类计数 `inc(aiTraceReconBackfilled, undefined, n)`+**差集水位 gauge**（`aiTraceReconMissing`·0203 gauge 形锚#2 `:102-:107` 纪律：稳态 0·>0=回补落后·零 label 低基数·告警侧 max() 去重）+main.ts 接线（锚#14 `:34-:36`/`:820-:821`/`:854` 三位）。
- **③proof 恰 1（新 `apps/worker/test/trace-recon.proof.ts`）**：fresh PG isolated·零 live 模型——注入链=真 invoke settle 成功+trace INSERT 强制失败（约束/权限注入臂沿 uc028 双 proof 注入形）→证丢失（trace 缺行+failures=1）→跑 sweep tick→证回补（trace 行在·全列恒等真相面）→幂等重放（二次 tick 零重复零值漂）→非 success 行不补（schema 失败/unknown 行差集外）→principal 卫（跨 owner 调用 insufficient_privilege）→水位 gauge 归零。
- **差集谓词语义镜像（零新语义裁决）**：`status='succeeded' AND error_code IS NULL` 恰=`:1171` `if (!error)` 的落库面镜像（completeModelInvocation 对 validated success 落 `error_code=NULL`·schema/business 失败落 `schema_validation_failed`/`business_validation_failed`）——**回补集=「本应有 trace 行而缺」·失败行本就无 trace 行不属丢失面·零扩面**。
- **回补=原 INSERT 语义逐字重放·零新数据面**：output=同一 `stored` 值（`:1146` 派生→`:1162` completeModelInvocation 与 `:1171` persistTrace 两路同源·redactOutput 行 `{redacted:true}` 回补零新暴露）·service/tokens/latency/request_id=0037 `:17-:21` 全列·estimate=0119 P1 全 outcome 已冻——**回补行内容⊆真相面·无第二真相**。
- **边界三如实登记（非缺口·EXEC proof 断言域）**：Ⅰ回补行 `created_at`=回补时刻（0198 保留窗自回补时刻重算·trace 系观测旁路非真相·真相面 created_at 原值不动）；Ⅱ owner 擦除后源行已失→差集自然不含·回补零复活已擦身份（0039 连删两表·0129 trace='adjacent' honest_unresolved 姿态不变）；Ⅲ `persistValidatedOutput` 加密域工件（OCR 臂）不经回补臂再生——其业务真相面在自身表（0038）·trace 仅观测副本。

### 1.3 候选淘汰登记（防 EXEC 期重开）

- **候选一（否决·Ban）=trace 写改同步**（persistTrace 迁回 settle/complete 同事务/INSERT 失败翻转业务终态/fail-closed 化）：UC-028 A1 fail-open 系已钉契约（spec「trace 写入失败不回滚业务事务」·invoke.ts `:1167-:1169` 注释+uc028 双 proof+harness 卷 §0 立场表）——翻改=爆炸半径全 invoke 成功相位+违 A1 语义+把可观测旁路升格为业务阻塞面·**否决**。
- **候选二（否决·Ban）=持久化队列**（新队列表·trace 写失败入队+worker 消费双写）：①新增第二真相面=双写一致性再生（队列行 vs trace 行漂移又需对账=递归缺口）；②失败时刻入队本身同处 fail-open 域（进程可即崩·队列表写亦可败）=把同一问题挪位非解；③真相面 ai_model_invocation **已是零成本持久队列**（succeeded 行=待补任务·PK=幂等 arbiter·CHECK=完备性·0119 estimate 已冻）——自建队列零增益纯增面·**否决**。
- **候选三（否决·Ban）=以失败日志为源的 sweep**（派单候选甲原述形）：console JSON 流非持久可查账面（§0.2-1 四缺陷）·不可构造——**原述形否决·修正承接种=真相差集源**（§1.2 定稿·结论=回补臂仍立·源面改定义）。
- **候选四（否决·Ban）=对账视图单立**（纯差集只读函数+计数告警·0203 同形无回补）：检测半成立但 A2=「对账**补写**」（harness 缺口件 §1b-3 三件套原文）——只检测不回补=缺口不闭合且可补集随真相面保留期/擦除**单调不可逆缩小**（§1.1-④时间性）——水位告警半**吸收为 §1.2 定稿②的 gauge 件**·单立否决。
- **候选五（否决·Ban）=免 principal 卫的批量回补**（全局 SECURITY DEFINER 批量函数/新 role/BYPASSRLS/REVOKE 翻改）：0203 聚合只读面与行级写面分离纪律（锚#9）+FORCE RLS owner 双侧（锚#3）——行级写必经 principal 作用域（锚#8 卫必带）·批量免卫=越权写面·**否决**。

## §1-修法（EXEC 期交付面·本 commit 零码·恰 1 .md=本卷）

- **本 commit（起草落卷）**：恰 1 tracked `.md`=本卷——零产品码零 proof 零迁移。
- **EXEC 期（立项后）预期交付面（六件·越界即停）**：件① `packages/db/migrations/0205_ai_trace_backfill_scoped.sql`（§1.2①·号面 §0.3）；件② `packages/db/src` wrapper+导出（函数类型+index.ts 出面·沿 `gatewayModelInvocationBacklog` 出面形锚 `packages/db/src/index.ts:48`）；件③ `apps/worker/src/trace-recon.ts`（§1.2②）；件④ `packages/ai-runtime/src/metrics.ts` 追加 `aiTraceReconBackfilled`（counter）+`aiTraceReconMissing`（gauge）+零预填两行；件⑤ `apps/worker/src/main.ts` 接线三位（import/shutdown/横幅）；件⑥ `apps/worker/test/trace-recon.proof.ts`（§1.2③）+root `package.json` `trace-recon:prove` wrapper 双行。**预期 diff 面=7-8 tracked 路径·全部∈上列·多任何 tracked 路径即停（越界需要类）**。EXEC 立项不得改 §1.2 裁量定稿与 §1.3 否决结论与 §5 Ban/pins（改则回炉重审）。

## §2 验收断言（EXEC 期行使·数字口径以实跑实测为准·题面值熔断另注）

1. **trace-recon:prove（本刀主验收·EXEC 新建）**：`pnpm trace-recon:prove` EXIT=0（isolated wrapper）——§1.2③ 七断言臂全绿·臂计数以届时 proof 实测为准（熔断=任一断言红·红不重跑冲销）。
2. **trace 邻面 proof 三门不回退**：`pnpm metrics:prove` EXIT=0（attempts/failures 常量+零预填臂·本刀追 gauge/counter 后臂面扩为届时实测值）+`pnpm uc028:trace-fail-open:prove` EXIT=0（A1 契约承载·候选一否决的契约面）+`pnpm uc028:nhp-fault:prove` EXIT=0（题面 45·对届时实测）。
3. **invoke 关口主证明**：`pnpm -C packages/ai-runtime prove` EXIT=0（runtime-kernel+claim-join-orphan+diag-honesty+ag24 四件）+`pnpm -C packages/ai-runtime prove:estimate-threading-invoke` EXIT=0（estimate↔usage 对账邻面=回补 estimate 列语义承载）。
4. **sweep 形制先例面不回退**：`pnpm model-invocation-reconcile:prove` EXIT=0（锚#13 模板承载面·本刀同形新臂不伤旧臂）。
5. **neg:all 六段全绿**：`pnpm neg:all` EXIT=0·总臂题面 **692**（TSW 卷终值 90+90+91+107+179+135·熔断：实测≠692 停上报如实记归因）。
6. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径）。
7. **lint 五贴线**：`pnpm turbo lint` 全绿 EXIT=0·五贴线预算**恰等零超支**：web `601≤601`+root `5235≤5235`+api `1421≤1421`+worker `954≤954`+ai-runtime `628≤628`（题面=TSW 卷终值·**本刀新增 .ts 面 worker/ai-runtime 两贴线可能漂移——EXEC 对届时实测·任一值新增超支或第三贴面出现即停**）。
8. **docs:check**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·≤cap **2232**（`scripts/ai-docs/public-text-policy.mjs:110` MAX_FILES=2232 亲证·基线 **2223** 本树亲跑 EXIT=0·本卷落卷后预期 **2224**·EXEC 期六件逐个计入后仍 ≤2232·**>2232 红停上报**·cap sanction 权归协调方·Ban 自升）。
9. **markers 五类零命中**：本刀改动集五类标记词 grep 零命中（词面沿 `scripts/i6-239-gates.proof.mjs` §2-7 运行时组装口径·四词逐字符拼接+行首冲突标记正则——**词面绝不复抄入卷防自匹配**·命令与回执入卷）。
10. **diff 面机检**：本 commit `git show --stat HEAD` 恰 **1** tracked=.md 本卷；EXEC 期 `git show --stat HEAD` tracked∈§1-修法清单（7-8·多即停）。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·零模型外呼（proof 全离线 isolated wrapper 口径·est live=0）。

## §3 范围外（边界清单·越界即 FAIL）

1. **fail-open 契约零触**：invoke.ts/persistTraceBestEffort/settle/complete 事务边界语义零改（§1.3 候选一否决承卷）——锚#1/锚#2 除 metrics 追加两常量+零预填两行外零字节改。
2. **真相面零写触**：ai_model_invocation 状态机/claim/settle 全臂零改（回补臂只读真相面）——0037/0119/0088/0130 blob 前后全等。
3. **零新表零新唯一约束零新 role/GRANT 翻改**（§1.2 定稿②·§1.3 候选五）——迁移面恰 1 函数文件。
4. **共享 SSOT 零改**：LEDGER/checklist/backlog/north-star 只读引用——#172/GAP-UC028-RECON 行翻面权归协调方（本刀不宣称关闭·GAP 收口归 EXEC+post-prove 双审后协调方 nail）。
5. **零 live 模型零 CI 改零依赖升级零 prompt 文本触碰**（est live=0 全期）·Ban 触其他工作树。

## §4 依赖

**①上游已满足（基线链亲证在案）**：UC-028 fail-open 旁路（锚#1 `:516-:542`）+attempts 分母（9af6bb99 件③·锚#2）+0037 真相面+0119 estimate 全 outcome 冻结（锚#5）+scoped 函数形制三先例（锚#6/#7/#8）+0203 聚合只读面+gauge 纪律（锚#9）+worker reconciler 形制（锚#13/#14）。**②无同文件并发**：本刀 docs-only·§0.1 锚漂=重 pin 非停（§0.0）；EXEC 期预期触面（metrics.ts/main.ts/package.json/index.ts+新文件）对在飞分支题面复核。**③迁移号**：§0.3 恰 1·0205 起号对届时链顶亲数。**④下游**：#172/GAP-UC028-RECON 收口翻面归协调方；本刀 EXEC 交付后 UC-E2E-028 §1b-3 缺口件三件套之「补写路径+prove」半闭合（故障注入臂=§1.2③注入链承袭·A3 对照 E2E 仍 OPEN 不在本刀域）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（门矩阵 prove 面 EXEC 期恰 1 次·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban trace 写改同步/fail-open 翻改（§1.3 候选一）；Ban 持久化队列/新队列表（§1.3 候选二）；Ban 失败日志源 sweep（§1.3 候选三·源=真相差集）；Ban 对账视图单立无回补（§1.3 候选四·告警半已吸收）；Ban 免 principal 卫批量回补/新 role/GRANT/BYPASSRLS/REVOKE 翻改（§1.3 候选五）；Ban 真相面写触与状态机改（§3-2）；Ban 共享 SSOT 写触与行翻面宣称（§3-4）；Ban 抢迁移号（§0.3）；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（本卷 docs-only·proof/neg 面零执行·EXEC 期门矩阵行使亦全离线·isolated wrapper 口径沿承）。

## §7 markers=0（卫生声明·亲跑回执）

本刀改动集（本卷 1 .md）五类标记词 grep 零命中（起草席亲跑·五类词面**运行时组装**沿 `scripts/i6-239-gates.proof.mjs` §2-7 同口径：四词逐字符拼接组装+行首冲突标记正则——**词面绝不复抄入卷防自匹配**·命令与 EXIT 回执随本节留痕：改动集=`git diff --name-only HEAD`∪`git ls-files --others --exclude-standard` 双查·五类词+conflict 零命中 EXIT=0）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · 起草落卷 2026-10-16 · pre-exec 双审两独立外席待派 · EXEC 未开工 · 本 commit 不预 claim 任何 EXEC 门矩阵结果。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.2 裁量定稿与 §1.3 候选否决结论与 §5 Ban/pins 与 §1-修法交付面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 复核必做·迁移号对届时链顶亲数重认领）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚结论漂移（如 persistTraceBestEffort 契约被改/结构化日志定位键字段被删/真相面 succeeded CHECK 或 estimate 列被改/scoped 函数三先例形制被改/worker reconciler 形制被改）·门基线锚漂（neg 总臂≠届时实测账/docs:check cap≠2232 未经 sanction）→停·重 pin 回炉。
- **机制不满足**：§2 门矩阵任一门红且根因在本卷登记结论（如差集谓词镜像被证伪=completeModelInvocation 落 error_code 形与本卷 §1.2 断言不符/estimate 不可回补实证）→登记结论被证伪→停·如实升级协调方回炉（Ban 就地改登记 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1-修法六件面（需触 invoke/真相面状态机/新表新队列/翻 GRANT）→停·另刀或协调方裁决（§1.3 五候选否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻 proof 新红/lint 贴面新增超支/docs:check>2232）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

*TRACE-RECON REQUEST · 2026-10-16 起草落卷 · **`draft:awaiting_pre_exec_dual`**（pre-exec 双审两独立外席待派·alone≠dual·EXEC 未开工·翻面权归协调方） · base `feat/mysql-schema-skeleton` @`4124c803`（origin tip 恒等·派单下界成立） · 分支 `line/trace-recon` · 工作树 `meetwise-trc` · 读码定稿=fail-open 旁路现形（persistTraceBestEffort :522-:542·attempts 分母/failures 分子·结构化日志 service+idempotencyKey+pgCode 定位键·日志非持久账面）+回补臂裁量定稿（**真相差集 sweep**：源=ai_model_invocation `status='succeeded' AND error_code IS NULL` 反连接 trace 缺行·恰=`:1171` `if(!error)` 落库面镜像零扩面；形=0205 `ai_trace_backfill_scoped` SECURITY DEFINER+require_owner 卫+ON CONFLICT DO NOTHING 沿 PK arbiter/event_key 先例零新约束；臂=worker trace-recon.ts 沿 model-invocation-reconcile 全形+水位 gauge 沿 0203 纪律；回补=原 INSERT 语义逐字重放零新数据面）+AI_TRANSITIONAL 可写性核讫（字面全仓零·AI 域两表 INSERT GRANT 在·FORCE RLS 钉 principal 写路径·零需新授权）· §1.3 五候选否决（trace 写改同步/持久化队列/失败日志源/对账视图单立/免卫批量回补）· 修法=本 commit 恰 1 .md·EXEC 期六件（1 迁移+db wrapper+worker 循环+metrics 两常量+main 接线+proof）· 门矩阵=trace-recon:prove 主验收+trace 邻面三门（metrics/uc028 双 proof）+runtime 四件+estimate-threading+model-invocation-reconcile 先例面+neg:all 692（题面熔断）+typecheck 8/8+lint 五贴线 601/5235/1421/954/628（题面熔断）+docs:check 2224≤2232（基线 2223 亲跑 EXIT=0）+markers 五类零命中+diff 恰 1 tracked（本卷）+卫生（.env* ABSENT·actualSpendCny=null·est live=0）· 停止条件四类零触发 · 翻面权归协调方（本刀不宣称关闭） · ⛔push · ⛔force push · STOP*
