# Harness — **DBTF-1** · 触发器函数族收敛刀（公共函数库 + 版本 diff 对齐证明 · REQUEST）

**Status**: **`executed:awaiting_post_prove_dual`**（pre-exec 双审 **BOTH PASS** 裁定经协调方带外转达：D1=案B/D2=U/D4=保留/D5=**改裁双参**/D6=引入/D7=足量/D8=保形 · EXEC 落盘 2026-10-08 · 零 SSOT（backlog/matrix 零改 · nail 阶段才登记）· **Ban self-write `post_prove_dual_pass`** · Ban nail until POST BOTH + 协调方）
**Date**: 2026-10-07
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503（stays） · g7SuiteGreen=false · actualSpendCny=null
**Experts**: `mw-model-op` + `mw-privacy-int`（pre-exec 双审 · 本 REQUEST 只送审 · **Ban self-approve** · **Dual PASS ≠ 自动开工** · 须 meetwise 明示授权才进 EXEC）
**Slice**: `../db-trigfam-unify.slice.md`
**Authority**: gap-bug-backlog `GAP-DEBT-DB-TRIGFAM` **P0 OPEN**（W2 首刀 · TASK-SOP-REFACTOR Wave 2 第 4 项）· 债行现状/目标原文照抄在案
**Parent tip**: `48dee7a2`（branch `line/db-trigfam` · base `origin/feat/mysql-schema-skeleton` @ `48dee7a2`）
**Honesty**: 本 REQUEST 全部清单为 mw-core 在 `48dee7a2` 上亲核（grep/awk 逐函数逐迁移比对）· 非 AI 凭记忆 · 与协调方在卷审计的口径差（419/≈40 vs 423/78）已在 §1.4 标注

---

## 0. Stance

| Statement | Ruling |
|-----------|--------|
| **本刀是什么** | DB 迁移层触发器/SQL 函数族债务收敛：0144 单一新迁移建**公共函数库单一真相源**（Tier-1 族终端函数体改为库调用 · 挂接点零变）+ `interview_derived_score(stream_key)` 评分公式抽出 + 表驱动状态机评估（0028/0046/0051 语义差异表并陈）+ 版本 diff 对齐 prove（终端行为=库行为）· 演进规则冻结（后续走 ALTER 或新名版本化 · Ban 同名全量重贴） |
| **本刀不是什么** | **不是** 历史迁移文件改写（0001–0143 字节不动 · append-only）· **不是** 触发器挂接点变更（表/列/时机/函数名全零变 · 只换函数体来源）· **不是** RLS/ACL/SECURITY DEFINER 面/幂等键变更 · **不是** GAP-COMM-PARTIAL-PAIR 语义裁决（partial_confirmed 张力面只保形不扩大）· **不是** 0082 校准冻结解除（SCOR-01..08 前数值完成仍被 DB 阻断）· **不是** 本 turn 编码（REQUEST 写完即停） |
| **增益边界（诚实）** | 单一真相源 = 后续演进只改一处 + 新增 sink/work/definer 不再全量重抄（40 处重贴的增量维护成本与「改一漏三」风险消除）· **不 claim** 任何运行时性能改善 · **不 claim** 历史文件变干净（历史副本按 append-only 永久保留 · 收敛只作用于活对象） |
| **现在** | `draft:awaiting_pre_exec_dual` · docs-only · 等双审 + meetwise 授权 |

---

## 1. 审计现状（亲核 @ `48dee7a2` · `packages/db/migrations/0001–0143`）

### 1.1 总量

| 度量 | 数值（亲核） | 口径 |
|------|------|------|
| `CREATE OR REPLACE FUNCTION` 总数 | **423** | grep 逐文件计数（§1.4 口径差） |
| 去重函数名数 | **346** | 按首 token（schema.name）去重 |
| 同名重贴（≥2 份）函数名 | **55** | 版本链见 §1.2/§1.3 与附录 A |
| 同名重贴多余份数 | **77**（**N1 勘误**：原记 78 为手算+1 误） | Σ(份数−1)=40+18+15+4——协调方「约 40 处」为保守下限（§1.4） |
| `CREATE TRIGGER` 语句总数 / live 挂接点 | 语句 **100** / **live 85**（迁移语句含 DROP+重建 · live 行集为 P1 差分口径） | live 85 全零变（Ban 面 §7-2 · P1 断言） |
| 调用面 | 应用层直调 6 处 + principal.ts 封印 3 处 | §2.5 |

### 1.2 Tier-1 族（本刀 0144 全量收敛面 · 四簇）

**① job_app/interview 状态机族（0028→0046→0051→0082 全量重抄 4 遍 · 每份微调）**

| 函数 | 版本链（份） | 终端 | 触发器挂接点（零变） |
|------|------|------|------|
| `finalize_bound_job_application_on_interview_completion` | 0028:42 · 0046:175 · 0051:8 · 0082:9（4） | **0082** | `trg_finalize_bound_job_application` ON interview AFTER UPDATE OF status（0028:73 唯一建点） |
| `enforce_job_application_interview_binding` | 0028:95 · 0046:220 · 0051:37 · 0082:29（4） | **0082** | `trg_enforce_job_application_interview_binding` ON job_application BEFORE UPDATE（0028:140 唯一建点） |
| `enforce_interview_application_binding_immutable` | 0028:78 · 0046:203 · 0049:51 · 0064:45（4） | **0064** | `trg_interview_application_binding_immutable` ON interview BEFORE INSERT OR UPDATE OF application_id,application_attempt,job_id,resume_id,resume_privacy_epoch（0064:100 末次重建 · 列面=终端） |
| `enforce_interview_job_resume_reference`（伴族 · **N1 勘误**） | **0054:16 · 0064:108**（2 · 原误记 0049·0064 · 0049 无此函数） | 0064:108 | `trg_interview_job_resume_reference` ON interview_job（0064:176-178） |
| `enforce_interview_consumption_terminal_pair`（伴族 · GAP-COMM-PARTIAL-PAIR 张力面） | 0020:26 · 0046:144（2） | **0046** | `trg_interview_consumption_terminal_pair` ON interview（0020:62 唯一建点） |

**② ai_cost_reserve/settle 族（0033→0034→0036→0083 抄 4 代 + 0035/0056/0057 变体蔓延 · 7 文件 17 函数对象）**

| 函数 | 版本链 | 终端 | 调用面 |
|------|------|------|------|
| `ai_cost_reserve`（7 参） | 0033:72 · 0034:5（2） | 0034 后被 0035 REVOKE 弃用（app_role 无 EXECUTE） | 无应用调用 |
| `ai_cost_settle` / `ai_cost_release`（4 参） | 0033 · 0034（各 2） | 同上（0035 收权） | 无应用调用 |
| `ai_cost_reserve_scoped`/`ai_cost_settle_scoped`/`ai_cost_release_scoped` | 0035（各 1） | 0035 | 无应用调用 |
| `ai_cost_reserve_text`/`ai_cost_settle_text`（8 参） | 0036:21/:101（1 代） | 0083 签名换 9 参（+`p_price_revision`）后 8 参体被 REVOKE 弃用 | 无 |
| `ai_cost_reserve_text_scoped`（8 参） | 0036:160（1） | 同上弃用 | 无 |
| `ai_cost_reserve_text`（9 参） | 0083:8 | **0083** | 经 `_scoped` 包装 |
| `ai_cost_reserve_text_scoped`（9 参） | 0036:160 → 0083:134（重贴换签） | **0083** | `packages/db/src/ai-cost-governance.ts:43`（唯一应用调用点） |
| `ai_cost_mark_unknown_for_model_reconcile_scoped` | 0056:8 · 0057:43（2） | 0057 | worker reconcile 路径 |

**③ 四点名族**

| 函数 | 版本链（份） | 终端 | 终端语义增量 | 调用/封印面 |
|------|------|------|------|------|
| `qbank_generation_ann_search` | 0029:240 · 0067:69 · 0106:55 · 0138:32（4）+ **0139 ALTER FUNCTION SET `hnsw.iterative_scan='strict_order'`**（版本化演进唯一示范） | 0138 体 + 0139 proconfig | 0029 裸 HNSW → 0067 加 control-plane 边界 → 0106 加 serving-scope/taxonomy GUC 过滤 → 0138 candidate JOIN 前置（filter-locus） | `qbank-generation-retrieval.ts:235` · `retrieval-store.ts:62` · 封印 `principal.ts:76`（SECURITY DEFINER + search_path `public, pg_temp`） |
| `qbank_is_generation_control_definer` | 0070:20 · 0071:15 · 0072:11 · 0087:35 · 0089:12（5） | **0089** | 白名单逐刀膨胀：regprocedure 成员 **4→8→9→11→15** | 封印 `principal.ts:62`（QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST 成员 · `pg_catalog, public, pg_temp`） |
| `privacy_begin_checkpoint_erasure` | 0048:171 · 0058:118 · 0096:96（3） | **0096** | 擦除闭包逐刀扩 sink（0048 物理擦除 → 0058 队列栅栏 → 0096 剩余 sink 全量枚举 · 函数体 ~500 行） | `checkpoint-privacy.ts:78` · **forbidden 封印** `principal.ts:1010`（privacy_worker_executor 禁 EXECUTE） |
| `gateway_dispatch_owners` | 0040:13 · 0128:12 · 0132:15（3） | **0132** | CASE work 分支 5→5→**6**（0132 增 `job_route`）+ 0128 interview 臂公平序 | `gateway-dispatch.ts:24` |

**④ 评分公式 `round(avg(...))` 嵌触发器 6 处**

`round(avg((e.payload->>'score')::numeric))::int`（`answer_evaluated` · `outcome<>'unresolved'` · score 正则守卫）字面重贴于：0028:50/:122 · 0046:183/:292 · 0051:16/:101。**亲核关键事实：终端版（0082）两个触发器函数体已不含该公式**（校准冻结把数值完成路径整体移除）——6 处副本全部是历史死代码面；0103:318 的 `round(avg(c.deterministic_total)) FILTER ...` 是另一公式（评分事实根 · 不入本簇）。

### 1.3 Tier-2 长尾（同族重贴登记 · 演进规则立即生效 · 0144 不换体）

附录 A 全列 55 名。除 §1.2 四簇外的主要长尾：`qbank_generation_question_evidence`（0031/0065/0067/0106 · 4）、`qbank_generation_lexical_search`/`_evidence`/`_distances`（各 3 · 0029/0067/0106）、`qbank_pool_requires_approved`/`qbank_chunk_requires_approved_pool`（各 3 · 0013/0065/0068）、`ai_model_claim_invocation_scoped`（0088/0119/0130 · 3）、`assert_privacy_erasure_request_completed_guard`（0091/0137/0140 · 3）、rag_control/rag_runtime 9 名（各 2）· 隐私收据族 5 名（各 2）· qbank 治理 14 名（各 2）等。

### 1.4 口径差（诚实标注）

协调方在卷审计报 **419** 个 `CREATE OR REPLACE FUNCTION` / 同族重贴 **约 40 处**；mw-core 在 `48dee7a2` 亲核 grep 计数 **423** / 同名重贴多余 **78 份**（55 名 ≥2 份）。差异为计数口径（是否含 `IF NOT EXISTS`/注释行/rag schema 限定名 · 「处」按函数名还是按族聚合）；**族的事实、版本链与终端判定一致**，不影响本刀范围。本 REQUEST 一律以亲核数为准。

---

## 2. 策略（0144 公共函数库 · 单一真相源）

### 2.1 布局裁定（决策点 D1 · mw-core 建议=案 B）

| 案 | 形态 | 评 |
|----|------|----|
| A | 独立 schema `_shared` | 语义清晰 · 但新增 schema USAGE/ACL 面 · 既有函数 pinned `search_path`（`public, pg_temp` 等）不含 `_shared` → 全部调用点必须 schema 限定 · 封印/manifest 需评估 |
| **B（建议）** | **public + `tf_` 前缀命名约定**（trigger-family library） | 零新 schema=零 USAGE 授权面 · 既有 pinned search_path 天然解析 `tf_*` 调用零限定 · `grep 'FUNCTION tf_'` 即单一真相源清单 · rag_control/rag_runtime/qbank 封印面完全不可见（封印只警备 SD 函数所在 schema） |

库成员命名：`tf_<族>_<职责>`（如 `tf_job_application_transition_guard(...)`、`tf_gateway_dispatch_owners(work)`、`tf_is_generation_control_definer()`、`tf_checkpoint_erasure_core(...)`）。库成员一律 `REVOKE ALL ON FUNCTION ... FROM PUBLIC` 默认拒（不是应用 API · 仅经族终端函数/触发器间接到达）；非 SECURITY DEFINER（ SECURITY 语义留在族终端函数原位不动）。

### 2.2 收敛语义（关键 · 只换函数体来源）

- 0144 对 Tier-1 每族：`CREATE OR REPLACE FUNCTION <同名同签名>()` 把终端函数体替换为**库调用薄壳**（参数/RETURN/异常码/异常消息逐字保留）；或（体本身即终点语义者，如 `enforce_job_application_interview_binding` 0082 语义）把完整逻辑移入 `tf_` 库函数、终端触发器函数变成 `RETURN tf_...(NEW)`。**函数名、schema、签名、SECURITY DEFINER、pinned search_path、ACL/GRANT、owner 一律不变**（封印按 signature+proconfig+prosecdef 断言 · 全保形）。
- 0139 先例（亲核）：`ALTER FUNCTION qbank_generation_ann_search(text,vector,integer) SET hnsw.iterative_scan='strict_order'` —— 体/签名/SD/search_path/ACL 全零变，仅 proconfig 增项，principal.ts `@>` 断言仍绿。0144 全面沿此纪律：**凡可 `ALTER FUNCTION` 达成的演进（SET/OWNER/ACL）禁止重贴体；凡体语义必须变时=新名版本化（`_v2` 等）或改 `tf_` 库内实现，禁止对既有名全量重抄**。
- Tier-2 长尾：0144 不换体（一刀不煮海）· **演进规则同刀生效**（§2.4）· 附录 A 立账。

### 2.3 状态机表驱动（0028/0046/0051 语义差异表并陈 · 决策点 D2）

差异表（亲核逐版本比对 · **行=语义轴 · 列=版本**）：

| 语义轴 | 0028 | 0046 | 0051 | **0082（终端）** |
|---|---|---|---|---|
| 状态枚举 | invited/in_progress/completed/declined | + `assessment_unavailable` | 同 0046 | 同 0051 |
| 合法迁移 | invited→{in_progress,declined} · in_progress→completed | + in_progress→assessment_unavailable · assessment_unavailable→in_progress（恢复） | 同 0046 | **in_progress→completed 被移除**（数值完成禁止） · + completed→assessment_unavailable（历史隔离） |
| attempt 栅栏 | 无 | attempt 不可变 · 恢复必须 attempt+1 换绑 | 同 0046 | 同 0051 |
| start 前置 | 绑定四元组匹配 | + interview.status IN ('created','active') | 同 0046 | 同 0051 |
| completed 前置 | derived_score 逐字匹配 | 同 0028（无域守卫） | + score ∈ [0,100] 资格线 | **raise `job_application_score_calibration_required`**（公式整体移除） |
| assessment_unavailable 前置 | — | interview failed | interview failed **或** completed-无合格分 | interview IN (failed,completed) · score 必须 NULL |
| finalize 动作 | 回填 score+completed | 同 | 同 | **score=NULL + assessment_unavailable** |
| score 不可变提示 | `..._until_finalize` | 同 | 同 | `..._until_calibrated` |

**方案 U（统一 · mw-core 建议）**：`tf_` 库持**唯一**状态机=0082 终端语义 · 配套种子表 `job_application_transition_rule(from_status,to_status,allowed,guard_kind)` 初始行集=0082 迁移闭包 · 守卫函数 `tf_assert_job_application_transition()` 查表裁断+保异常码。理由：fresh deploy 全量重放 0001→0144 后**所有环境语义本就=0082**（后写 CREATE OR REPLACE 覆盖前写），0046/0051 语义无任何存活运行时；app 面（web surface/view-model）已消费 `assessment_unavailable` 终态。历史差异表作为本档 §2.3 存档（考古面）。
**方案 K（保留差异化）**：迁移规则表带 era 列保留各代语义。**无已知消费者**（无环境停留旧代 · 无按代回放需求）· mw-core 反对 · 若双审能指认存活旧代消费面则改裁 K。
**表驱动实现注意**：规则表本身触发器函数读取时 `SET search_path` 解析 · 种子行集由 0144 一次性 INSERT（幂等 `ON CONFLICT DO NOTHING`）· 该表为治理内部表（无 RLS 变更 · 非 app API）。

### 2.4 演进规则冻结（0144 起生效 · 写入库头注释 + prove 静态门背书）

1. **Ban 同名全量重贴**：新迁移不得对既有函数名 `CREATE OR REPLACE` 全函数体重抄（prove P7 静态门：0144 之后的迁移文件 grep 同名 CREATE OR REPLACE FUNCTION 计数=0 —— 本刀 EXEC 期只检 0144 自身形状，门对新迁移的持续执法由 review 纪律+后续 CI 刀承接）。
2. 演进走：`ALTER FUNCTION ... SET/OWNER`（配置/属主面 · 0139 示范）· 新名版本化（签名或语义断代）· `tf_` 库内实现变更（终端薄壳零动）。
3. 新 sink/work/definer 成员：改库内枚举（或种子表行），不再复制宿主函数。

### 2.5 调用面与封印保形（亲核全列 · EXEC 逐一断言）

| 面 | 位置 | 0144 要求 |
|----|------|-----------|
| 应用调用 ① | `packages/db/src/ai-cost-governance.ts:43` → `ai_cost_reserve_text_scoped` 9 参 | 签名/RECORD 形状零变 |
| 应用调用 ② | `packages/db/src/checkpoint-privacy.ts:78` → `privacy_begin_checkpoint_erasure(text,text)` | 同上 |
| 应用调用 ③ | `packages/db/src/gateway-dispatch.ts:24` → `gateway_dispatch_owners(text)` | 同上 |
| 应用调用 ④⑤ | `qbank-generation-retrieval.ts:235` · `retrieval-store.ts:62` → `qbank_generation_ann_search` | 同上 + 0139 proconfig 保形 |
| 封印 ① | `principal.ts` `QBANK_CONTROL_DEFINER_FUNCTION_MANIFEST`（`principal.ts:62` 等 27+ 成员 · signature+SD+search_path 断言） | 全签名零变 → 断言天然保形 |
| 封印 ② | `principal.ts:1303` `expected_control`/`expected_runtime` 27+8 计数 + `unexpected_*_definer=0` | `tf_` 库不进 rag_control/rag_runtime schema 且非 SD → 计数面零扰 |
| 封印 ③ | `principal.ts:1010` `forbidden_worker_function`（`privacy_begin_checkpoint_erasure(text,text)` 对 privacy_worker_executor 禁 EXECUTE） | ACL 零变 → 保形 |

---

## 3. `interview_derived_score(stream_key)` 评分公式抽出（§1.2-④）

- 新 public SQL 函数：`interview_derived_score(p_stream_key text) RETURNS int` · `LANGUAGE sql STABLE` · 体=**0051 变体**（终代含公式者）：`answer_evaluated` · `COALESCE(outcome,'answered')<>'unresolved'` · score 正则 `^[0-9]+(\.[0-9]+)?$` · **`(payload->>'score')::numeric BETWEEN 0 AND 100`** · `round(avg(...))::int`。
- **诚实定位**：终端 0082 触发器不含公式 → 本抽出是**休眠单一真相源**（SCOR-01..08 校准解冻后的数值完成路径预注册件），**不接线任何触发器**（接线=另刀+双审）；0144 落地后 6 处历史副本仍留在 append-only 历史文件（不动）· 库内 1 份=未来唯一抄写源。
- 签名注记（决策点 D5）：历史公式谓词对为 `(owner_user_id, stream_key)`（`interview_event` 只有 `UNIQUE(stream_key,seq)` · 0001:44）；任务契约名为 `(stream_key)` 单参。若 prove P3 发现跨 owner 同 stream_key 构造可使单参版与历史重放分歧，则扩为 `(p_owner_user_id text, p_stream_key text)` 双参（异常面：无——纯读取）。

---

## 4. Prove 设计（新 `packages/db/test/db-trigfam-unify.proof.ts` · `pnpm db-trigfam:prove` · EXIT=0）

对隔离 PostgreSQL（`assertIsolatedTestTarget` + 增量迁移至 0144），对照基线=同一库先迁到 0143 的 catalog/行为快照：

| 块 | 断言 |
|----|------|
| P1 catalog 对齐 | 0143 基线 vs 0144 后：`pg_trigger` 全 100 挂接点行集全等（tgname/tgrelid/tgfoid 指向同名函数/tgtype/tgenabled/tgargs）· Tier-1 函数 `proname/prosignature/prosecdef/proconfig/proacl/proowner` 全等（体来源换 · 元数据零变）· `tf_*` 新对象=清单成员且 `NOT prosecdef` 且 PUBLIC 无 EXECUTE |
| P2 状态机行为回归 | 0082 终端语义逐轴：invited→in_progress ✓ · in_progress→completed ⇒ raise `job_application_score_calibration_required` ✓ · in_progress→assessment_unavailable（interview failed/completed 双前置）✓ · completed→assessment_unavailable 隔离 ✓ · attempt 恢复栅栏（同绑拒/attempt+1 换绑收）✓ · 异常码/消息与 0143 基线逐字相等 · **partial_confirmed 张力保形：interview completed + consumption `partial_confirmed` ⇒ 同 23514 同消息**（GAP-COMM-PARTIAL-PAIR 面不扩大 · 只断言行不变不裁语义） |
| P3 公式对齐 | `interview_derived_score` vs 0051 历史公式 SQL 重放：夹具矩阵（answered/unresolved/malformed/0/100 边界/越界 150/空流）输出全等；0028/0046 vs 0051 分歧点（越界分纳入与否）在差异表 §2.3 存档非回归面 |
| P4 伴族行为回归 | `privacy_begin_checkpoint_erasure` 冒烟（请求落账+闭包计数与 0143 基线相等）· `gateway_dispatch_owners` 六 work 臂 owner 集合相等 · `qbank_generation_ann_search` 在 fixture 语料上结果序/distances 全等（0139 proconfig 生效断言保留）· definer 白名单 15 成员在迁移身份下布尔值不变 |
| P5 既有 prove 复跑 | `prove:ai-cost` · `prove:uc052-checkpoint-physical` · `privacy-erasure:prove` · `prove:qbank-control-role` · `prove:rag-control-role` · `recruiter`（recruiter-depth）· `prove:migrate` 全 EXIT=0（触发器行为回归=既有 prove 复跑面） |
| P6 静态契约门 | `git diff --stat 48dee7a2..HEAD`：0001–0143 历史迁移 **零字节** · 产品码零改（principal.ts 零改）· 0144 文本 grep：零 `DROP FUNCTION` · 零 `DROP TRIGGER`/`CREATE TRIGGER`（挂接点零变）· 零 `UPDATE`/`DELETE` 数据语句（规则表种子 `INSERT ... ON CONFLICT DO NOTHING` 唯一写）· 零 `GRANT` 新受者 · 零 RLS 语句 |
| P7 库形状门 | 0144 内 `CREATE OR REPLACE FUNCTION` 仅两类：`tf_*` 库成员（清单闭包）+ Tier-1 同名终端薄壳（其体含且仅含库调用/委托）· 每薄壳 `pg_get_functiondef` 与库声明逐字比对入账 |

**纪律**：EXIT=0 一次过 · **attempts 全账** · **Ban retry-to-green**。

---

## 5. 硬 Ban（EXEC 期同样有效）

1. **Ban 历史迁移文件任何字节改动**（0001–0143 append-only · 6 处公式副本与 40 处重贴永久留档）。
2. **Ban 触发器挂接点任何变更**（100 处 CREATE TRIGGER 的表/列/时机/函数名零变 —— 收敛只换函数体来源；0144 零触发器语句 · P6 断言）。
3. **Ban 碰 RLS**（policy/schema ACL 零改）· **Ban 碰幂等键**（一切 `idempotency_key` 语义/UNIQUE/ON CONFLICT 不动）· **Ban 碰 secrets/真实数据**。
4. **Ban 碰封印/SSOT**：principal.ts 封印三处（§2.5）零改 · gap-bug-backlog/north-star/coverage 矩阵零改写（nail 阶段才登记）· **Ban GAP-COMM-PARTIAL-PAIR 未裁先动**（0046:162-166 语义逐字节保形 · 裁决属另刀）。
5. **Ban 0082 校准冻结解除**（completed 数值路径继续 DB 阻断 · `interview_derived_score` 不得接线触发器）。
6. **Ban 本 turn 编码**（REQUEST 写完即停回报 · EXEC 须双审 PASS + meetwise 明示授权）。

---

## 6. 决策点（请双审裁定）

| ID | 议题 | mw-core 建议 |
|----|------|--------------|
| D1 | 库布局：案 A `_shared` schema vs 案 B public `tf_` 前缀 | **案 B**（零 schema ACL 面 · pinned search_path 天然解析 · 封印不可见面） |
| D2 | 状态机：方案 U 统一（=0082 终端语义+表驱动）vs 方案 K 按 era 保留差异化 | **U**（无旧代存活消费者 · fresh 重放本就 0082 · 差异表存档本档 §2.3） |
| D3 | Tier-2 长尾（附录 A 41 名）0144 不换体 · 只立账+演进规则 | **确认**（一刀不煮海 · 扩面由双审指认另刀） |
| D4 | `ai_cost` 旧签名面（7 参/4 参/8 参弃用体）保留原样不收（收尸=DROP 变更 · 超保形面） | **确认保留**（弃用体是 append-only 历史 · 无调用 · 不动） |
| D5 | `interview_derived_score` 单参（stream_key）vs 双参（+owner） | **先单参**（P3 分歧则升双参 · §3 注记） |
| D6 | 规则表 `job_application_transition_rule` 引入（治理内部表 · 无 RLS · 非 API） | **确认引入**（表驱动载体 · 种子幂等） |
| D7 | prove P5 复跑清单是否足以覆盖触发器行为回归（或需增族） | **mw-model-op 裁**（§4 P5 列七项） |
| D8 | partial_confirmed 张力保形断言入 P2（非裁决） | **确认**（GAP-COMM-PARTIAL-PAIR 在册另裁） |

---

## 7. Acceptance（EXEC 后验收）

| ID | Criterion |
|----|-----------|
| A1 | `packages/db/migrations/0144_db_trigfam_unify.sql` 唯一新迁移（tf_ 库 + Tier-1 薄壳 + interview_derived_score + 规则表种子 · P7 形状门绿） |
| A2 | `db-trigfam-unify.proof.ts` EXIT=0（P1–P7 全 PASS · attempts 全账） |
| A3 | 历史迁移 0001–0143 零字节差 · 产品码（principal.ts/调用面）零改（P6） |
| A4 | 100 触发器挂接点 catalog 全等（P1）· partial_confirmed 张力面保形（P2） |
| A5 | 台账行 GAP-DEBT-DB-TRIGFAM 保持 OPEN 至 nail（nail 才 CLOSED · 对表勾销） |
| A6 | pins 全保留（§首行 · 无一翻转） |

---

## 8. 流程与产物

**流程**：REQUEST（本档）→ 预执行双审（`mw-model-op` + `mw-privacy-int`）→ **meetwise 授权** → EXEC（migration 0144 + prove + package.json script）→ post-prove 双审 → **meetwise 授权 nail**（台账行 CLOSED）。

**EXEC 文件面（预告 · 本 turn 不动）**：

| 文件 | 动作 |
|------|------|
| `packages/db/migrations/0144_db_trigfam_unify.sql` | 新增（tf_ 库 + Tier-1 终端薄壳换体 + `interview_derived_score` + 规则表+种子） |
| `packages/db/test/db-trigfam-unify.proof.ts` | 新增 prove（P1–P7） |
| `package.json` / `packages/db/package.json` | `db-trigfam:prove` script |
| （零产品码改动 · 零历史迁移改动） | — |

---

## Non-claims

Not HA · not suite green · not 运行时性能改善声明 · not 历史文件清理（副本永留）· not RLS/ACL/SD 变更 · not 挂接点/签名/封印变更 · not GAP-COMM-PARTIAL-PAIR 裁决（只保形）· not 0082 校准冻结解除 · not SCOR 交付 · not coding authorized（Dual PASS ≠ 开工）· not 覆盖任何 e2e 门（coveredCount=8 不变）· `releaseEvidence=false` · `actualSpendCny=null`。

---

## 附录 A · 同名重贴全清单（亲核 55 名 · ≥2 份 · @ `48dee7a2`）

5 份×1：`qbank_is_generation_control_definer`。
4 份×5：`finalize_bound_job_application_on_interview_completion` · `enforce_job_application_interview_binding` · `enforce_interview_application_binding_immutable` · `qbank_generation_ann_search` · `qbank_generation_question_evidence`。
3 份×9：`qbank_generation_lexical_search` · `qbank_generation_evidence` · `qbank_generation_distances` · `qbank_pool_requires_approved` · `qbank_chunk_requires_approved_pool` · `privacy_begin_checkpoint_erasure` · `gateway_dispatch_owners` · `assert_privacy_erasure_request_completed_guard` · `ai_model_claim_invocation_scoped`。
2 份×40：`ai_cost_reserve` · `ai_cost_settle` · `ai_cost_release` · `ai_cost_reserve_text`（8→9 参跨代）· `ai_cost_reserve_text_scoped` · `ai_cost_mark_unknown_for_model_reconcile_scoped` · `enforce_interview_consumption_terminal_pair` · `enforce_interview_job_resume_reference` · `scoring_publish_question_rubric` · `interview_privacy_active` · `enforce_interview_projection_privacy_active` · `assert_score_card_status_transition` · `assert_checkpoint_privacy_fence` · `assert_checkpoint_enrollment_not_privacy_fenced` · `privacy_resolve_deletion_receipt` · `privacy_purge_checkpoint_target` · `privacy_list_claimable_checkpoint_targets` · `privacy_issue_authorization_snapshot` · `privacy_claim_checkpoint_target` · `ai_model_transition_dispatched_scoped` · `ai_model_register_logical_node_header_scoped` · `ai_model_invocation_state_guard` · `qbank_validate_generation` · `qbank_source_visible_epoch_sync` · `qbank_question_chunk_requires_visible_source` · `qbank_question_chunk_artifact_guard` · `qbank_question_artifact_guard` · `qbank_prepare_generation_partition` · `qbank_mark_generation_failed` · `qbank_is_curator` · `qbank_generation_chunk_only_building` · `qbank_activate_generation` · `rag_runtime.rag_search_bound` · `rag_runtime.rag_resolve_query_binding` · `rag_runtime.rag_evidence_bound` · `rag_runtime.rag_bind_query` · `rag_control.rag_mark_request_dispatching` · `rag_control.rag_heartbeat_rebuild_run` · `rag_control.rag_claim_rebuild_run`。
（另有 `--` 前缀注释行 2 处计入 grep 噪声已剔除 · Tier-1=§1.2 四簇 14 名 · Tier-2=其余 41 名）

---

## EXEC 落盘（2026-10-08 · @ 协调方授权 · 两席处方逐条落实）

**处方落实**：①薄壳逐字重声明 SD+SET（实证 PG16：CREATE OR REPLACE 省略子句会清空 prosecdef/proconfig · ACL/owner 自动保留——亲测留痕）②tf_ 调用一律 `public.tf_` 前缀限定 ③base 双 0143 排序亲核（`loadMigrations` 文件名 localeCompare：`0143_db_id_v7_unify` → `0143_sse_push_notify` → 0144）④N1 勘误（§1.2-①/§1.1 已按勘误订正 · 77 份 · live 85 挂接点）⑤P1 catalog 差分含 proconfig 断言 ⑥P7 三类措辞（薄壳 12/tf_ 12+derived_score/种子 INSERT 1）⑦P5 七腿含 privacy 席增补 privacy-authorization。

**落地面**：`packages/db/migrations/0144_db_trigfam_unify.sql`（tf_ 库 12 员 + 12 薄壳 + `interview_derived_score(owner,stream_key)` 双参休眠 + 规则表+5 种子 + ACL 镜像）· `packages/db/test/db-trigfam-unify.proof.ts`（P1–P7 两段式差分：≤0143 快照/行为 → +0144 复比）· scripts 注册（package.json×2 + run-e2e-isolated.mjs×3 处 · **不入 migrate allowlist**——prove 自管两段式迁移）· `ai-docs/delivery/harness/db-trigfam-unify.exec.md`（EXEC 卷宗）。

**实现期发现与披露（F/N 全账 · Ban 假绿）**：
- **F1（DBID-1 潜伏残留 · 非本刀回归 · 另刀）**：0143 `uuidv7()` 受 0073:1342 默认 REVOKE PUBLIC 影响 ACL={owner}，`privacy_begin_checkpoint_erasure`（SD · privacy_api_owner）INSERT `privacy_erasure_request`（DEFAULT uuidv7）→ 42501 permission denied——0144 stash 后 0143 态同错亲证（差分保形 · P4 断言同签名）。privacy-authorization:prove 基线同红同根因。修法属 DBID-1 后续（uuidv7 GRANT 至 SD owner 角色或 DEFAULT 面）。
- **F2（prove 骨架 bit-rot · 登记）**：`packages/db/test/ai-cost-governance.proof.ts` 自 0033 基线迁移在净容器不可跑（缺 0001 表）且对全量 ledger 报 `migration_ledger_unknown_version`——P5 以 runner 管理的 `model-cost:prove:raw`（现行 ai_cost 真实覆盖面）替代并在此登记。
- **F3（基线既有红 · 登记）**：`recruiter:prove:raw` 在 0144 stash 后同红（`interview_event_raw_answer_fenced`）——P5 差分豁免同签名钉死。
- **N2（REQUEST §2.1 修正 · 保形优先）**：「库成员一律 REVOKE PUBLIC」修正为 **ACL 镜像终端**——簇① 终端为 PUBLIC 默认 ACL，库成员须显式 GRANT PUBLIC 全等镜像（亲测 permission denied 复现：app_role 经触发器路径不可达）。
- **N3（唯一 SD 库成员）**：`tf_assert_job_application_transition` SD 读 owner-only 规则表（零新 GRANT）。
- **N4（qbank definer 可达 · manifest 供给制）**：manifest 供给把控制面 SD 函数属主转 `qbank_control_definer`（含 `qbank_pool_visible_epoch_sync` 内联求值 definer 判定、ann_search 薄壳 SD definer）——0144 按供给同形态幂等确保角色存在 + 两笔镜像 GRANT（tf_is / tf_ann_search → qbank_control_definer；供给端 exists-check 兼容亲证）。
- **既有 prove 断言唯一改动（披露）**：`packages/db/test/migrate.proof.ts:373` terminal-pair def 文本钉死（含 `'failed'` 字面量）改为 **薄壳+库成员 def 链拼接** 断言（强度不减 · 位置无关 · 0144 收敛后字面量移入 tf_）。

**Non-claims 不变**：历史迁移零字节 · 挂接点零变 · RLS/幂等键/secrets 零触 · partial_confirmed 只保形（P2 逐字节断言 23514 同消息）· 0082 冻结未解 · pins 十值全保留。


---

*Harness · DBTF-1 触发器函数族收敛刀 REQUEST · 2026-10-07 · draft:awaiting_pre_exec_dual · parent `48dee7a2` · docs-only · pins: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · Dual PASS ≠ 开工 · Ban self-approve*
