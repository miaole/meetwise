# EVENT-TTL REQUEST — `interview_event` 保留期清扫独立小刀起草卷（progress-write 件③留槽承接·新迁移 0219+worker sweep 接线+proof·docs-only 起草落卷·STOP=draft）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草落卷即停·rev1=P2 折入〔双审双 PASS 附清单·协调方授权折入·§9-rev 六项逐条落点〕·STOP 恒值至 EXEC 授权·alone≠dual·零 coding·零 prove 执行·零 live·零 SSOT 行改动·翻面权归协调方·Ban self-approve）

**席位**：interview_event 保留期清扫独立小刀起草席（盘点 B-list·S 级·读码定性+起草双责·协调方派·progress-write 卷件③留槽承接）。
**基线**：`origin/main` @ `38f6e7d78`（fetch 后 origin tip 同指亲证·`git log --oneline origin/main -1` 实测=merge e2e-ledger-stale-fix）· 分支 `line/event-ttl-draft`（前波已立·本席核状态接续：快进 `47dd6be5`→`38f6e7d78` 零冲突·`--ff-only` EXIT=0·零独有提交亲证）· 工作树 `../meetwise-ttl`。
**必读清单（pre-exec 双审逐件亲读·显式路径）**：`ai-docs/delivery/harness/progress-write-REQUEST.md`（`:70` 件③ TTL 修法留槽原文·本卷唯一立项出处）→ `ai-docs/delivery/harness/ttl-wire-REQUEST.md`（closed·`interview_jobs` payload TTL 旁路接线卷·**异表面**=本卷 sweep 先例非重复卷）→ `packages/db/migrations/0195_interview_event_settlement_append_only.sql` → `packages/db/migrations/0208_unstube_event_immutable_relax.sql` → `packages/db/migrations/0209_ag09_replay_first_claim.sql` → `packages/db/migrations/0059_interview_privacy_projection_fence.sql` → `packages/db/migrations/0062_interview_privacy_event_stream_scope.sql`（RLS 现行形=TO app_role 单 policy·`:59-62`）→ `packages/db/migrations/0096_int_transcript_remaining_sinks.sql` → `packages/db/migrations/0126_interview_answer_dual_write_fence.sql`（no_raw_answer_guard `:183-186`）→ `packages/db/migrations/0192_interview_event_created_at_kind_check.sql` → `packages/db/migrations/0212_outbox_relayed_retention.sql` + `packages/db/migrations/0177_usage_calibration_ag07_windowing.sql`（两 SD 保留期清扫先例）→ `apps/worker/src/usage-calibration-retention.ts` + `apps/worker/src/commerce-outbox-retention.ts`（两 worker 接线先例）→ `packages/db/src/interview/interview-event.ts` → `ai-docs/delivery/harness/interview-job-autovacuum-REQUEST.md`（`§`表选论证「反选 interview_event」边界注·只读）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①progress-write REQUEST `:70` 件③留槽原文：「**TTL 修法留槽**（后继独立小刀：SECURITY DEFINER 擦旧函数+保留期常量+既有 sweep loop 接线+prove·设计裁决权归后继刀派单）——本卷登记为派单输入」——本卷即该后继刀之起草兑现；②同卷 `:38` 红事实：「8 行永久落库（#164·亲证）……interview_event 现状零清理路径（锚#10：全表唯一生产 DELETE=0096 隐私擦除 `:529`·`:255` 已 REVOKE app_role DELETE）」；③同卷 `:55` 裁决「保留窗在零迁移约束内无解（§0.2-4 REVOKE 亲证）→登记裁量+留槽是唯一诚实形」；④派单 brief（盘点 B-list·S 级·修法=新迁移（清扫函数+保留期常量）+worker sweep 接线+proof·触发器共存性亲证·STOP=draft 三处）。

## §0 现状锚（亲读亲算 @`38f6e7d78`·file:line+blob 逐条 rg/sed/Read/`git hash-object` 实测·**pre-exec/EXEC 照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表（三道查重全亲证·零命中）

- `ls ai-docs/delivery/harness/ | grep -iE 'ttl|event-ttl'` 恰 2 命中逐一排除：`ttl-wire-REQUEST.md`=**closed** 卷·对象=`interview_jobs` 表 payload 旁路清理（`purgeStaleInterviewJobPayloads`·payload-'answer' 键摘除·TTL 86 400s·非行删除非保留期）——**异表面·恰系本卷 sweep 接线先例**；`bill3-settlement-REQUEST.md`=「se**ttl**ement」子串误命中。
- `git branch --list '*ttl*'` 恰 1 命中=`line/event-ttl-draft`（本席支线·前波已立·核状态接续·非他席在飞）；`git log --all -i --grep='interview_event TTL'` **零命中**。
- `grep -rliE 'interview_event.*(TTL|保留期|retention)' ai-docs/delivery/` 7 命中逐一排除：`interview-job-autovacuum-REQUEST.md`（`interview_job` 表 autovacuum·其表选论证**明文反选 interview_event**——「唯一写点=INSERT……零改写零死元组不入选」，其反选理由系死元组视角·与本卷保留期行删除异题·边界相容）；`unstube-erase-diag-REQUEST.md`（0195×0096 撞碰诊断卷·已随 0208 收官·本卷触发器面沿承其裁定非重复）；`db-hotspot-REQUEST.md`/`batch5b-mig-REQUEST.md`/`tokstream-s4b-REQUEST.md`/checklist（字面邻碰零卷级重叠）。→ **停止条件「查重命中」未触发**。

### 0.1 blob 锚表（`git hash-object` 亲算 @`38f6e7d78`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0195_interview_event_settlement_append_only.sql` | `d323706e`（41 行） | **`:16-17` REVOKE UPDATE×2（interview_event+settlement_ledger）·`:19-25` `assert_interview_event_immutable`（INVOKER·无条件 RAISE 23514）·`:27-29` 触发器 `interview_event_append_only_guard` BEFORE UPDATE OR DELETE FOR EACH STATEMENT 挂 `interview_event`·`:31-36`+`:39-41` 孪生 `settlement_ledger_append_only_guard` 挂 `settlement_ledger`**（blob 与 0208 头注所引「0195 原体 blob `d323706e2040`」恒等=0195 自落链零改跨卷自洽旁证） |
| `packages/db/migrations/0208_unstube_event_immutable_relax.sql` | `6f6b90e5`（59 行） | **`:20-29` 释放臂四键注释（缺一不可·TG_OP='DELETE' 收窄）·`:50-59` 函数体现值：`:51-54` 四键合取（DELETE ∧ current_user='privacy_worker_owner' ∧ GUC `app.privacy_target_id` 非空 ∧ session_user≠'privacy_worker_owner'）·`:55` RETURN NULL ·`:57` RAISE 23514（其余一切路径 fail-closed）·`:38-45` 回滚形状注** |
| `packages/db/migrations/0209_ag09_replay_first_claim.sql` | `e562520a`（265 行） | **`:1-9` 头注（AG-09 回放优先重放）·`:42` CREATE OR REPLACE FUNCTION `ai_model_claim_invocation_scoped`（19 参 SD 函数重写·`ai_model_invocation` 面零触发器零 DELETE 面）**——0209 非触发器之亲证锚 |
| `packages/db/migrations/0214_interview_event_statement_notify.sql` | `d1f36f17`（27 行） | **`:9-17` `sse_event_notify_after_insert`（AFTER INSERT 语句级·零 DELETE 面）·`:23-26` 触发器 `interview_event_sse_notify` AFTER INSERT**——interview_event 挂表现役第 4 枚（P2-1 清点勘误后序·与 DELETE 面正交） |
| `packages/db/migrations/0192_interview_event_created_at_kind_check.sql` | `27b4c39d`（51 行） | **`:40` ADD COLUMN created_at timestamptz NOT NULL DEFAULT now()（保留期窗口锚列）·`:42-48` CHECK `ck_interview_event_kind` 19 值闭合（`:16-21` 值域清单含 progress 族 progress/generation_started/model_first_token/generation_progress）·`:51` VALIDATE** |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0`（485 行） | **`:38-46` CREATE TABLE interview_event（基线零 created_at 列·0192 前史锚）·`:64` CREATE ROLE app_role NOLOGIN ·`:69-78` RLS DO 块：`:73` ENABLE+`:74` FORCE ROW LEVEL SECURITY+`:75-78` `p_owner` policy（0001 原形无 TO 子句·**已被 0059 `:46-49`/0062 `:59-62` 两度重建为 `FOR ALL TO app_role` 单 policy 取代**·现行形=无适用 policy→默认拒绝）**——FORCE RLS 对 SD 函数 owner 同样生效+TO 收窄=SD 清扫必配专用 policy 之依据（P2 折入 item6 改形） |
| `packages/db/migrations/0059_interview_privacy_projection_fence.sql` | `4fbac173`（134 行） | **`:96-99` 触发器 `interview_event_privacy_projection_write_guard`（BEFORE INSERT OR UPDATE·interview_event 挂表现役第 1 枚·与 DELETE 面正交）·`:46-49` p_owner 重建 `FOR ALL TO app_role`（RLS 现行形链中继）·`:11-12` 头注「DELETE is deliberately not gated so a future privacy purger can remove the already-fenced rows」（DELETE 刻意不设门·与本刀放行臂同向旁证）**（P2-1 勘误新增锚） |
| `packages/db/migrations/0062_interview_privacy_event_stream_scope.sql` | `9e5dec05`（87 行） | **`:59-62` p_owner 再重建 `FOR ALL TO app_role`（USING `interview_event_stream_privacy_active`——interview_event RLS 现行形=TO app_role 单 policy·event_retention_worker 无适用 policy→默认拒绝·RLS 论证改形依据）**（P2 折入 item6 新增锚） |
| `packages/db/migrations/0126_interview_answer_dual_write_fence.sql` | `867ea729`（186 行） | **`:183-186` 触发器 `interview_event_no_raw_answer_guard`（BEFORE INSERT OR UPDATE OF payload·interview_event 挂表现役第 2 枚·与 DELETE 面正交）**（P2-1 勘误新增锚） |
| `packages/db/migrations/0096_int_transcript_remaining_sinks.sql` | `16657f55`（597 行） | **`:255` REVOKE DELETE ON interview_event FROM app_role ·`:256` GRANT SELECT, DELETE ON interview_event TO privacy_worker_owner ·`:282-285` worker SELECT policy（owner-scoped）·`:286-290` `interview_event_privacy_worker_delete` policy（GUC `app.privacy_target_id` 门）·`:524-525` set_config 双 GUC 事务局域 ·`:529` `DELETE FROM interview_event`（全表唯一生产 DELETE 路径·单目标臂）·`:589` ALTER FUNCTION OWNER TO privacy_worker_owner ·`:594` GRANT EXECUTE TO privacy_worker_executor ·`:597` REVOKE 成员资格防漂移** |
| `packages/db/migrations/0212_outbox_relayed_retention.sql` | `4677e598`（36 行） | **`:6` `commerce_outbox_relayed_retention_purge(integer,integer)` ·`:9-11` SD+SET search_path ·`:13-16` 界检查 fail-closed（7..365/1..10000）·`:19-28` 批 DELETE 子选 LIMIT ·`:29` GET DIAGNOSTICS ·`:34` REVOKE ALL FROM PUBLIC ·`:36` GRANT EXECUTE TO app_role**——本迁移件①函数形制直引先例 |
| `packages/db/migrations/0177_usage_calibration_ag07_windowing.sql` | `e1a95296`（172 行） | **`:153-168` `ai_usage_calibration_observation_retention_purge(p_keep_days)`（`:156` SD·`:160-161` 界 1..3650·`:162-165` 全窗 DELETE）·`:171-172` REVOKE PUBLIC+GRANT app_role**——保留期常量 SQL 侧界先例（worker 侧缺省 90 见 usage-calibration-retention.ts） |
| `packages/db/src/interview/interview-event.ts` | `880a1dcb`（43 行） | **`:22` 同 stream advisory 事务锁（`pg_advisory_xact_lock(hashtext(stream))`）·`:23-26` event_key 幂等（prior seq 查回即返·不添行）·`:29-33` INSERT…SELECT COALESCE(MAX(seq),0)+1（序分配=现存行 MAX——终态 kind 行被本刀保留→seq 不回绕之依据·§3-5 语义注）**（P2-5 三处行锚重 pin·blob 恒等实测） |
| `apps/worker/src/usage-calibration-retention.ts` | `aa9a2a38`（84 行） | **`:9-14` 旋钮注释（ENABLED 缺省 false·DAYS 缺省 90·INTERVAL 缺省 1d）·`:27-31` 常量界 ·`:44-58` resolveConfig 非法 env=启动失败非静默回退 ·`:65-80` tick 整拍不抛自吞下拍 ·`:82-84` runDrainLoop 常驻**——件③直引先例 |
| `apps/worker/src/commerce-outbox-retention.ts` | `a3ad2254`（91 行） | **`:1-8` 头注（40 批/拍·SD·app_role 无 DELETE）·`:21-26` 常量界（批 500·1..10000）·`:28` MAX_BATCHES_PER_TICK=40**——批化上限先例 |
| `apps/worker/src/main.ts` | `03bca620`（871 行） | **`:39-40` 两 retention import ·`:743-751` 条件挂载（`enabled ? run… : undefined`·缺省 false 不起循环）·`:814-836` 停机序注册**——件③接线位 |
| `apps/worker/src/drain-loop.ts` | `5e5e2cb3`（247 行） | **`:76` `runDrainLoop(tick, intervalMs, opts?)` 签名**——既有 sweep loop 承载面 |
| `ai-docs/delivery/harness/progress-write-REQUEST.md` | `16906dcc`（190 行） | **`:70` 件③ TTL 修法留槽原文（本卷唯一立项出处）·`:38` 8 行永久落库定谳 ·`:55` 「保留窗在零迁移约束内无解→留槽是唯一诚实形」·`:190` footer（executed·留槽挂账在卷）**（只读·零改） |
| `ai-docs/delivery/harness/ttl-wire-REQUEST.md` | `58243a8a`（123 行） | **`:1` 标题（`interview_jobs` payload 面）·`:3` Status=closed**（异表面先例·只读） |
| `scripts/ai-docs/public-text-policy.mjs` | `963ba81b`（437 行） | **`:139` MAX_FILES=2_354**（cap 锚·§2-4 门） |
| `packages/db/src/principal.ts` | `f04f70d7`（2136 行） | **`:1009` set_config `app.principal_user`**（asPrincipal RLS 语义·SD 清扫不携 principal→必配专用 policy 之旁证） |

### 0.2 派单 brief 核实登记（三处勘误·如实定性·结论方向不变）

1. **「0195/0209 触发器拦 DELETE」系误登——0209 非触发器**：0209 实测=AG-09 回放优先重放刀，内容为 `ai_model_claim_invocation_scoped` 19 参 SD 函数 CREATE OR REPLACE（`e562520a` `:1-9`/`:42` 亲证）——对象表 `ai_model_invocation`·零触发器·零 DELETE 面·与 interview_event 零交集。interview_event 的 DELETE 拦截面实为**一处触发器+一处函数体**：0195 触发器对象 `interview_event_append_only_guard`（BEFORE UPDATE OR DELETE·语句级·零行亦触发）+ 0208 对其函数体的隐私四键释放臂修订。settlement 面区分亲证：0195 孪生触发器 `settlement_ledger_append_only_guard` 挂 `settlement_ledger`（`:39-41`）——TTL 清扫零触该表，**该侧冲突按表区分消解成立**；真实冲突面仅在 interview_event 本体侧（下条）。
2. **「若 TTL 表非 interview_event 本体则冲突消解」——前置不成立·冲突真实且可解**：TTL 目标=interview_event 本体亲证三桩（progress-write `:38` 8 行进度行落 interview_event；0096 `:529` 全表唯一生产 DELETE 即对该表；`ck_interview_event_kind` 值域含 progress 族）→非 SD/GUC 形（app_role 直删）被**双墙**拦（0096 `:255` REVOKE 表权+0195 触发器 RAISE）；SD 形若 owner 非 privacy_worker_owner 仍被触发器 RAISE（语句级 INVOKER 触发器对任意执行者触发）；借道 0208 隐私臂（伪置 `app.privacy_target_id`）=伪造隐私授权链·违 0208 `:31-35` 显式 Ban 防漂移立法意旨——否决（§1.3-甲）。**可解路径=0208 已裁定的同构仲裁形**：「两律撞碰非律废律：仲裁=开窄豁免，防篡改语义对其余一切路径原样保留」（0208 `:12-14` 原文）——本迁移以 **additive 新释放臂**（专用 NOLOGIN 角色+专用 GUC·与隐私臂谓词完全不相交·既有臂逐字节保留）消解，非「触发器冲突不可解」→**停止条件不触发**。若协调方对本卷「additive 臂≠触既有触发器语义」读法有异议（严读=触发器函数体零字节）→触 §8 裁决点·停上报·不就地处置。
3. **「迁移号 0210-0213 已占」滞后届树勘误**：fetch 亲证 tip `38f6e7d78` 迁移目录已至 **0218**（0214_statement_notify/0215_gateway_b_qualitative_fence/0218_remit_invoice_id_v7 在树）·0216/0217 系历史添加后删除号（`git log --all --diff-filter=A` 亲证两历史 commit 后现树零文件·现役全分支 `ls-files` 扫描零占用）→**本卷认领=0219**（现最大 0218 顺延 +1·`ls packages/db/migrations/ | grep -c '^0219'`=0 + 全分支零 0219 文件双证·零冲突）。迁移目录现 216 文件·0219 落后 217·migrate:prove 链头预期 0219。

### 0.3 留槽出处漂移登记（append-only 口径）

- progress-write 留槽原文行号：起草基线（彼卷 blob `16906dcc` @本 tip）`:70`；其 EXEC 期基线为 `656fc7be`——pre-exec/EXEC 引用一律按届时本卷 §0.1 重 pin 实测行号，Ban 按旧号寻行。其卷内对 0096 锚 `:255`/`:529` 行号与本 tip 实测恒等（零漂）。

## §1 红事实（全部亲证 @`38f6e7d78`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 interview_event 写入面与「永久落库」现状

写入面=INSERT 单通道：`appendEvent`（`interview-event.ts:16-43`·advisory 锁+event_key 幂等+MAX+1 序分配·P2-5 随附重 pin）·UPDATE 权限已被 0195 `:16` REVOKE（append-only 立法）。清理面=**零**：全表唯一生产 DELETE=0096 `:529` 隐私擦除单目标臂（0091 issuer/consume/claim/lease 全链授权+lease+receipt 才可达）；表权层 app_role 无 DELETE（0096 `:255`）·触发器层 0195 恒 RAISE。进度族（generation_started/model_first_token/generation_progress/progress·≤8 行/生成·progress-write `:38` 量级算术）随生成频次 O(生成次数) 无界累积·无限期留存——#164「永久落库」半现状亲证成立，留槽即为此立。

### 1.2 DELETE 授权与触发器双层墙（共存性核·逐路径定性）

| 路径 | 表权（GRANT 面） | 触发器（0195 对象+0208 体） | RLS（0001 FORCE+p_owner / 0096 policy） | 定性 |
|---|---|---|---|---|
| app_role 直 DELETE | 无（0096 `:255` REVOKE） | RAISE（非隐私四键） | p_owner 拦 | **双墙+RLS 三拦** |
| SD 函数 owner≠privacy_worker_owner | 可 GRANT | **RAISE**（语句级·任意执行者·current_user=owner 不满足四键） | FORCE RLS 拦（现行 p_owner=`FOR ALL TO app_role` 单 policy·0062 `:59-62`——owner 角色无适用 policy→**默认拒绝零行**·静默 no-op 陷阱） | 触发器墙实存 |
| 借道 0208 臂（owner=privacy_worker_owner+伪置隐私 GUC） | 有（0096 `:256`） | 伪四键过 | 伪 GUC 过 `:286-290` | **伪造隐私授权链·否决（§1.3-甲）** |
| 本刀 additive 新臂（专用 NOLOGIN owner+专用 GUC+DELETE 收窄） | 新 GRANT（SELECT,DELETE） | 新 disjoint 臂放行·既有臂逐字节保留 | 新专用 policy（GUC 同键门·0096 `:286-290` 同构） | **唯一诚实路径** |

触发器清点（P2-1 勘误·两席合并亲证·起草卷「三现役面」系漏点）：**interview_event 挂表现役触发器 4 枚**——0059 `interview_event_privacy_projection_write_guard`（`4fbac173:96-99`·BEFORE INSERT OR UPDATE）+0126 `interview_event_no_raw_answer_guard`（`867ea729:183-186`·BEFORE INSERT OR UPDATE OF payload）+0195 `interview_event_append_only_guard`（`d323706e:27-29`·**唯一 DELETE 拦截面**）+0214 `interview_event_sse_notify`（`d1f36f17:23-26`·AFTER INSERT）；另 settlement 孪生（0195 `:39-41`）异表零触。**前置两枚 DELETE 正交如实注记**：0059/0126 均 INSERT/UPDATE 面零 DELETE 臂——0059 `:11-12` 头注明文 DELETE 刻意不设门以留后继 privacy purger（与本刀放行臂同向）；勘误不改结论（DELETE 拦截面唯一性=0195 恒成立）。RLS 现行形（P2 折入 item6）：interview_event 现行仅 p_owner 一枚且 `FOR ALL TO app_role`（0062 `:59-62`）——event_retention_worker **无适用 policy→默认拒绝**。

### 1.3 sweep 先例三件（本卷形制直引）

① **0212**（`4677e598`）：SD 保留期批删函数完备形——界检查 fail-closed（7..365/1..10000）+子选 LIMIT 批删+GET DIAGNOSTICS+REVOKE PUBLIC/GRANT app_role；worker 侧 `commerce-outbox-retention.ts`（40 批/拍·env 门缺省 false·非法 env 启动失败）+main.ts `:743-751` 条件挂载+`:814-836` 停机注册。② **0177 件⑥**（`e1a95296 :153-172`）：单参保留期清除形+SQL 侧界 1..3650+worker 侧缺省 90/1d（`usage-calibration-retention.ts:9-14`·「清除是生产数据删除·启用=显式后继运维决策」缺省 false 纪律）。③ **ttl-wire 卷**（closed）：sweep 接线入既有 worker loop 的纪律先例（同拍异常隔离/下拍重试措辞·本卷不涉其 interview_jobs 面）。

### 1.4 保留期语义面（本卷设计输入）

窗口锚列=created_at（0192 `:40`·timestamptz NOT DEFAULT-free）；值域门=`ck_interview_event_kind` 19 值（0192 `:42-48`）——清扫谓词的 kind 收窄必须落值域子集内。序分配依存=interview-event.ts `:29-33` MAX(seq)+1 按现存行取 MAX：**终态 kind 行（question_ready/answer_evaluated/report_ready 等）被本刀永久保留→活跃 stream 的 seq 不回绕**；仅「全 progress 族且永不终态」的废弃 stream 被整流清空后 seq 从 1 重起——SSE 旧游标跨清空窗语义=旧行不可达+新行重计（有界影响·如实登记 §3-5）。SSE 重放载体语义（interview_event=durable replay log·tokstream D-1 裁定在案）→business 终态 kind 划出清扫域=硬边界。

**清扫谓词索引面量化登记（P2-6·静态亲证零实跑）**：interview_event 零 created_at/kind 索引（全迁移目录 grep 亲证——索引面仅 0001 `:39` PK id+0001 `:45` UNIQUE(stream_key,seq)+0021 `uq_interview_event_key`）→件①-5 批 DELETE（created_at+kind 谓词）单批=1 次全表 seq scan·每拍≤40 批（件③ MAX_BATCHES_PER_TICK 帽）→≤40 次全表扫/拍·单批代价 O(现役全表行数) 线性；行数两族叠加无界：终态 kind 行与 progress 族同随生成频次累积（progress-write `:38` 量级算术 ≤8 行/生成）——如实登记·缺省 ENABLED=false 下零发生。**CONCURRENTLY 独立迁移裁量预登**：后继刀若为 created_at（或 kind,created_at 复合）补索引，沿 0190/0211 `@migration-mode concurrent-index` 先例（0190 头注「本刀起一切新迁移在存量（热）表上建索引一律 CONCURRENTLY」·0211 头注「语句在事务外执行」）以独立非事务迁移落——**Ban 入本卷 transactional 0219 内建索引**（executionMode=transactional 与 CONCURRENTLY 互斥）。

## §1-修法（四件·docs-only 起草钉定·EXEC 照此落码·基线漂移照 §0 协议重 pin）

- **件① 迁移 `packages/db/migrations/0219_interview_event_retention_purge.sql`**（executionMode=transactional·单事务原子·段序）：
  1. `CREATE ROLE event_retention_worker NOLOGIN NOINHERIT`（专用清扫 definer·0096 防漂移同族：不授予任何可登录角色成员资格·REVOKE FROM app_role 显式随发）——**迁移头注显式 Ban（0208 `:38-39` 同构原文形·P2-3）**：「对任何可登录角色授予 event_retention_worker 成员资格即破本判别器与 kind/龄双界——SET ROLE 改 current_user 不改 session_user（NOINHERIT 不拦 SET ROLE）·成员角色可在 SD 函数外自置 `app.event_ttl_sweep` GUC（custom GUC 任意角色可置）直删任意 kind 任意龄·绕函数界检查（龄窗 30..3650/kind 恰 4 值/批帽）·显式 Ban」；
  2. `GRANT SELECT, DELETE ON interview_event TO event_retention_worker`（0096 `:256` 同形·最小面）；
  3. RLS 双 policy（FORCE RLS 必配·0001 `:74`；**现行形依据（P2 折入 item6）**：interview_event 现行仅 p_owner 一枚且 `FOR ALL TO app_role`（0062 `:59-62`）——event_retention_worker 无适用 policy→默认拒绝零行·专用 `TO event_retention_worker` policy 为唯一开面通道）：`interview_event_retention_worker_select … FOR SELECT TO event_retention_worker USING (true)`（0096 worker_dispatch 同构·跨 owner 枚举仅此角色可达）+`interview_event_retention_worker_delete … FOR DELETE TO event_retention_worker USING (current_setting('app.event_ttl_sweep', true) IS NOT NULL)`（0096 `:286-290` GUC 门同构·裸删在 policy 层即拒）；
  4. `CREATE OR REPLACE FUNCTION assert_interview_event_immutable()`：**0208 体（blob `6f6b90e5 :50-59`）逐字节保留+恰一 additive 臂**（插于既有隐私臂 END IF 之后、RAISE 之前）：`IF TG_OP = 'DELETE' AND current_user = 'event_retention_worker' AND current_setting('app.event_ttl_sweep', true) IS NOT NULL AND session_user <> 'event_retention_worker' THEN RETURN NULL; END IF;`——四键与隐私臂谓词**完全不相交**（role/GUC 双异）·既有两行为（隐私臂放行/其余 RAISE）对一切现存路径逐字节不变；触发器对象本体零动·0195/0208 文件零字节零触；回滚形状=**两层（P2-4 补全）**——（a）触发器函数：以 0208 体（blob `6f6b90e5`）CREATE OR REPLACE 复原；（b）本卷新对象回滚序（后进先出）：`DROP FUNCTION interview_event_retention_purge`→`DROP POLICY`×2（retention_worker_select/retention_worker_delete）→`REVOKE ALL ON interview_event FROM event_retention_worker`→`DROP ROLE event_retention_worker`（函数 owner=该角色·故 DROP FUNCTION 必须先行）；**fail-closed 惰性化性质**：GUC `app.event_ttl_sweep` 唯一 setter=清扫函数本体（set_config 事务局域）——函数一 DROP 释放臂谓词永不可满足·序末 DROP ROLE 后 `current_user='event_retention_worker'` 恒假——任一中途态均零放行窗·终态回 0195 恒 RAISE 基线；
  5. 清扫函数 `interview_event_retention_purge(p_keep_days integer, p_batch_cap integer) RETURNS integer`：LANGUAGE plpgsql **SECURITY DEFINER SET search_path = public, pg_temp**（0212 `:9-11` 同形）；体=界检查 fail-closed（p_keep_days 30..3650 收窄下界防误删近窗·p_batch_cap 1..10000·0212 `:13-16`/0177 `:160-161` 同族）→`PERFORM set_config('app.event_ttl_sweep', clock_timestamp()::text, true)`（事务局域·幂等谓词键）→批 DELETE（外层 `WHERE created_at < clock_timestamp() - make_interval(days => p_keep_days) AND kind IN ('progress','generation_started','model_first_token','generation_progress') AND id IN (SELECT id … 同谓词 LIMIT p_batch_cap)`·0212 `:19-28` 同形）→GET DIAGNOSTICS→RETURN；`ALTER FUNCTION … OWNER TO event_retention_worker`；
  6. `REVOKE ALL ON FUNCTION … FROM PUBLIC, app_role; GRANT EXECUTE ON FUNCTION … TO app_role;`（0177 `:171-172` 同形——worker 登录身份直调·表权/行权/触发器全在 definer 侧收敛）。
  7. kind 收窄域裁决：**恰 4 值 ephemeral 族**（0192 值域子集）——generation_started/model_first_token/generation_progress（#164 审计目标族）+progress（diagnosis/quiz 进度行·同 ephemeral 语义）；**business 终态 kind（question_ready/answer_evaluated/report_ready 等 15 值）永久划出清扫域**（SSE 重放/事件账本载体·tokstream D-1）。Ban 扩域（§5）。
- **件② db 侧**：`packages/db/src/interview/interview-event-retention.ts` 新模块 `purgeExpiredInterviewEvents(c, keepDays, batchCap)`（SELECT 函数直调·`usage-calibration.ts:128` 同形）+`packages/db/src/index.ts` barrel export 恰 1 行。
- **件③ worker sweep 接线**：`apps/worker/src/interview-event-retention.ts` 新模块（`usage-calibration-retention.ts` 直引形）：env 旋钮 `INTERVIEW_EVENT_RETENTION_ENABLED`（缺省 **false**·不起循环——清除是生产数据删除·启用=显式后继运维决策·两先例同纪律）/`INTERVIEW_EVENT_RETENTION_DAYS`（缺省 **180**·界 30..3650 与 SQL 侧同域——**180 无先例锚·协调方裁决项预登（P2-2）**：留槽原文无数字亲证（progress-write `:70` 「保留期常量」无值）·参照锚 usage-calibration worker 缺省 90（`aa9a2a38:9-14`）/commerce worker 缺省 30（`a3ad2254:22` DEFAULT_KEEP_DAYS=30·7..365）/ttl-wire 86 400s（`58243a8a`）·本卷 180 系起草席裁量——与 §1.3-甲 并列 EXEC 前协调方确认项·§8）/`INTERVIEW_EVENT_RETENTION_INTERVAL_MS`（缺省 86_400_000·界 60_000..604_800_000）/`INTERVIEW_EVENT_RETENTION_BATCH`（缺省 500·界 1..10000）+MAX_BATCHES_PER_TICK=40（commerce 形）·resolveConfig 非法 env=启动失败非静默回退·tick 整拍不抛自吞下拍；`apps/worker/src/main.ts` 接线：import+条件挂载（`:743-751` 同形位随形）+停机序注册（`:814-836` 段）。
- **件④ proof**：`packages/db/test/interview-event-retention.proof.ts`（真迁移链隔离容器·假臂≥11·P2-3 增第⑪臂）：①界双臂 fail-closed（低/高越界 RAISE·0212 proof `:157-158` 形）②app_role `has_table_privilege(interview_event,'DELETE')`=false+`has_function_privilege(…,'EXECUTE')`=true ③超龄 progress 族行被清④未龄行零触⑤**超龄 business kind 行（question_ready 等）零触**（kind 收窄主断言）⑥app_role 直 DELETE 仍 23514 `interview_event_immutable`（0195 律回归臂）⑦函数内 UPDATE 形仍 RAISE（TG_OP='DELETE' 收窄臂）⑧0208 隐私臂回归（SET ROLE+隐私 GUC 形放行臂行为不变）⑨二连拍幂等（第二拍 purged=0）⑩RLS 裸删拒（无 GUC 下 definer 角色直 DELETE 零行/异常）⑪**pg_auth_members 防漂移长效臂（P2-3）**：断言 `event_retention_worker` 零可登录角色成员（pg_auth_members 全集扫描·成员均 rolcanlogin=false——0208 `:38-39` 同构 Ban 的库面长效回归）。`packages/db/package.json` 注册 `prove:interview-event-retention` 恰 1 行（假臂合计 **≥11**·P2-3 增 1）。
- **保留期常量归属声明**：SQL 侧=界（30..3650 fail-closed）·常量缺省在 worker env（180·件③）——与 0177/0212 两先例「SQL 界+env 缺省」归属分工恒等，不在 DB 侧设常量表。

### §1.3 否决（三臂全否·唯存活面=§1-修法四件）

- **甲（否决）触既有触发器语义**：Ban 改 0195 恒 RAISE 律对既有路径的覆盖·Ban 改 0208 隐私四键臂任一谓词·Ban 借道隐私 GUC（`app.privacy_target_id`）伪授权清扫·Ban DROP/DISABLE/重建触发器对象·Ban ALTER TRIGGER。本卷触发器面**唯一**动作=§1-修法件①-4 additive 臂（专用 role+专用 GUC 双异·谓词不相交·既有臂逐字节保留·0208 仲裁先例同构）。**裁决点预登**：若协调方将本否决严读为「触发器函数体零字节」→本刀在 pre-exec 停报（`stopped:trigger_arm_mandate`）·交协调方另裁（改派宽授权·或砍件）·本席不就地择径。
- **乙（否决）无保留期硬删**：Ban 无窗口 DELETE/全表 TRUNCATE/kind 无界清扫——SSE 重放载体+append-only 账本语义（tokstream D-1·0195 立法靶）双违；保留窗+kind 收窄+批上限三界缺一不可。
- **丙（否决）应用层逐行删**：Ban worker 应用层逐行 DELETE/逐 owner 循环删——表权 REVOKE（0096 `:255`）+0195 触发器双拦·且逐行非原子无批界；清扫唯一通道=件① SD 函数。

## §2 门矩阵（起草 turn 已跑门·本席亲跑回执随 commit·EXEC 期门届树实测为准）

**起草 turn（本卷落卷 commit 前）**：①docs:check `node scripts/ai-docs/check-docs.mjs` EXIT=0——基线树亲跑 `scanned 2343`≤cap 2354（`public-text-policy.mjs:139`）·落卷后预期 2344（+1·余 10·零 cap 步进）②markers 五类标记词+冲突标记×改动集零命中（词面运行时组装防自指·i6-239 门口径）③diff 面机检：`git diff --numstat` 恰 **1** tracked=本卷 .md（多任何 tracked 即停）④§0.1 十八锚 blob 全量 `git hash-object` 亲算恒等。
**P2 折入 rev turn（§9-rev·本 commit）**：①docs:check EXIT=0 `scanned 2344`≤cap 2354（零新增文件·零 cap 步进）②markers+冲突标记×改动集零命中（词面运行时组装）③`git diff --numstat` 恰 **1** tracked=本卷 .md ④§0.1 **二十一锚**（+0059/0062/0126 三行新增亲算·既有十八行恒等复算）blob 全量亲算恒等。
**EXEC 期预期**：①migrate:prove EXIT=0（链 217 头 `0219_interview_event_retention_purge.sql`）②drift:prove EXIT=0+uniqueness files=217 violations=0 ③件④ proof 全臂 EXIT=0 ④interview:prove EXIT=0（邻面·appendEvent 零改回归）⑤sse-push:notify:prove（0214 AFTER INSERT 邻面）⑥turbo typecheck --force 8/8+turbo lint 十二值恰等届树实测 ⑦docs:check≤cap+markers 五类零新增 ⑧邻面抽验 unstube-erase:prove（0208 触发器面回归·届树在册则跑）。

## §3 范围外（边界清单·越界即 FAIL）

1. 零触 settlement_ledger 及其孪生触发器（0195 `:39-41`·本刀表区分面）。
2. 零触 interview_jobs/`interview_job` autovacuum 域（ttl-wire closed 卷+job-autovacuum 卷各归其面）。
3. 零触 0192 值域/0202 扩域/0214 SSE 通知触发器/0096 隐私链（0091 issuer/consume/lease/receipt 全链零动）。
4. 零 SSOT 行改动（progress-write 卷/checklist/backlog 零字节——#164 翻面权归协调方·留槽承接≠翻面）。
5. 语义注（如实登记·非 blocker）：全 progress 族废弃 stream 整流清空后 seq 从 1 重起·SSE 旧游标跨清空窗=旧行不可达+新行重计（§1.4·有界·缺省 disabled 下不发生）。
6. 零业务语义变更：缺省 ENABLED=false·落码后生产行为零变化（与两先例「代码就绪·启用=运维决策」恒等）。

## §4 依赖

**①上游已满足**：0192 created_at 列在树·0195/0208 触发器面现状即本卷仲裁基线·0212/0177 函数形制先例在树·worker 双 retention 模块+main.ts 挂载位在树·progress-write 件③留槽在卷。**②EXEC 期容器依赖如实预登**：件④ proof 须隔离 PG 容器（run-e2e-isolated/assertIsolatedTestTarget 容器 nonce 形或 compose 本地栈·零外部托管依赖·零模型 Key·migrate:prove/drift:prove 同容器面）——起草 turn 零容器零实跑。**③无同文件并发**：0219 迁移号全分支零占用亲证（§0.2-3）；本卷落件（0219/两新模块/main.ts/index.ts/proof/package.json×2+本卷）届时若与他刀文件交集→停上报。**④下游**：#164 永久落库半的消解载体（翻面权归协调方）·0195 触发器面后继刀（若有）须以本卷 additive 臂为新基线。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban self-approve（pre-exec 双审两独立外席·alone≠dual）；Ban 触既有触发器语义（§1.3-甲全项·含隐私 GUC 借道/DROP·DISABLE 触发器）；Ban 无保留期硬删/kind 扩域越 4 值 ephemeral 族（§1.3-乙）；Ban 应用层逐行删（§1.3-丙）；Ban 迁移号漂移（0219 零占认领·届时冲突即停）；Ban 触 0195/0208/0096/0192/0214 五迁移文件零字节外的一切改动面；Ban 触 settlement_ledger 面；Ban ENABLED 缺省翻 true；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因门矩阵外新红（如实登记升级）；Ban `.env*`/Key 值入树入据；Ban 顺带升级依赖包。
**pins（零翻转）**：迁移号=0219 · 保留窗缺省=180d（界 30..3650·**无先例锚·协调方裁决项预登**——EXEC 前确认/改值均由协调方明示·P2-2/§8） · 批缺省=500（界 1..10000·40 批/拍帽） · ENABLED 缺省=false · kind 域=恰 4 值 ephemeral 族 · haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · actualSpendCny=null。

## §6 est live=0（起草 turn·pre-exec/EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零容器零模型外呼零 Key 加载零生产操作零 secrets 零消耗；全部锚=静态亲读+`git hash-object`；全卷零 `.env*`。

## §7 markers=0（卫生声明）

本卷改动集（本卷 1 .md·起草 turn）**五类标记词+冲突标记零命中**（起草亲核·词面运行时组装·回执随 pre-exec 留痕·词族沿 i6-239 门口径·词面不入卷防自匹配）·rev1 P2 折入改动集复检同零（§2 rev turn）。

## §8 STOP

**STOP=draft:awaiting_pre_exec_dual · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·落卷/翻面须协调方明示授权）· 本 commit 不预 claim 任何后续 EXIT。** 开工三条款：①pre-exec 双审两独立外席 **BOTH PASS 落卷**（§1.3-甲裁决点若起·先裁决后双审）；②协调方明示授权（committed SHA 重钉）；③立项不得改 §1.3 三否决与 §5 Ban/pins 与 §1-修法四件形制（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin。**EXEC 前协调方确认项（预登·P2-2·与 §1.3-甲 裁决点并列）**：保留窗缺省 180d 无先例锚（留槽原文无数字亲证·参照锚 usage-calibration 90d/commerce 30d/ttl-wire 86 400s）——EXEC 前由协调方 CONFIRM 或明示改值·未确认不开工。**停止条件（派单三处·命中即停手上报·Ban 就地处置）**：
- **查重命中**：届时 harness 出现同名/同面卷（interview_event 保留期清扫）·或 progress-write 留槽被他卷承接登记→停·防重上报。
- **触发器冲突不可解/裁决点起**：0195/0208 面现状漂移（additive 臂既有路径等价性被证伪·或协调方严读 §1.3-甲为函数体零字节）→停·`stopped:trigger_arm_mandate`·如实升级。
- **迁移号冲突**：0219 届树被占（在飞并线先行落 0219）→停·顺延重认领上报（零就地换号落码）。

## §9-rev（P2 折入 rev1·双审双 PASS 附清单·协调方授权折入·两席合并·逐条落点）

**折入凭据**：pre-exec 双审两独立外席双 PASS·附 P2 折入清单（六项）·协调方明示授权折入 @`cb3bf5904`。本 rev=docs-only 恰 1 文件（本卷 .md）·零码零跑零 live·STOP 恒 **`draft:awaiting_pre_exec_dual`**（折入≠开工授权·EXEC 授权另发）。逐条落点（事实锚全部本 rev 亲证·`git hash-object`/sed/rg 实测）：

- **P2-1 触发器清点勘误（三→四枚）**：**落点 §1.2 清点段改写+§0.1 新增 0059/0126 两行锚+§0.1 0214 行注「现役第二」→「第 4 枚」**。亲证：interview_event 挂表现役触发器 **4 枚**=0059 `interview_event_privacy_projection_write_guard`（`4fbac173:96-99`·BEFORE INSERT OR UPDATE）+0126 `interview_event_no_raw_answer_guard`（`867ea729:183-186`·BEFORE INSERT OR UPDATE OF payload）+0195 append_only_guard（`d323706e:27-29`·唯一 DELETE 拦截面）+0214 sse_notify（`d1f36f17:23-26`·AFTER INSERT）+settlement 孪生异表（0195 `:39-41`·零触）。**前置两枚 DELETE 正交如实注记**：0059/0126 均 INSERT/UPDATE 面·零 DELETE 臂；0059 `:11-12` 头注明文「DELETE is deliberately not gated so a future privacy purger can remove the already-fenced rows」——与本刀放行臂同向旁证。起草卷漏点不改结论：DELETE 拦截面唯一性（0195 恒 RAISE）恒成立·共存性结论零翻转。
- **P2-2 保留窗 180d 无先例锚·协调方裁决项预登**：**落点 件③ DAYS 旋钮+§5 pins+§8 新增「EXEC 前协调方确认项」段（与 §1.3-甲 并列）**。亲证：progress-write `:70` 留槽原文无保留期数字（「保留期常量」无值·sed 亲读）；参照锚三件=usage-calibration worker 缺省 90（`aa9a2a38:9-14`）/commerce worker 缺省 30（`a3ad2254:22` DEFAULT_KEEP_DAYS=30·界 7..365）/ttl-wire 86 400s（`58243a8a`）——本卷 180 无三先例任一支撑·系起草席裁量值。预登纪律：CONFIRM 或改值均由协调方明示·未确认不开工·非 §5 pins「零翻转」违约（预登在先）。
- **P2-3 成员资格显式 Ban（0208 `:38-39` 同构）+proof 防漂移臂**：**落点 件①-1+件④（假臂 ≥10→≥11）**。亲证 0208 `:38-39` 原文：「对任何可登录角色授予 privacy_worker_owner 成员资格即破本判别器，显式 Ban（0060 law extension 同形）」。同构推理链：可登录角色 R 获 `event_retention_worker` 成员资格→SET ROLE 可达（NOINHERIT 不拦 SET ROLE）→`current_user='event_retention_worker'` 且 `session_user=R` 满足臂判别器→R 于 SD 函数外自置 `app.event_ttl_sweep`（custom GUC 任意角色可置）→绕清扫函数界检查（龄窗 30..3650/kind 恰 4 值/批帽）直删任意 kind 任意龄——**判别器与 kind/龄双界双破**。件①-1 增迁移头注显式 Ban 同文；件④ 增第⑪臂=pg_auth_members 断言零可登录角色成员（防漂移长效面）。
- **P2-4 新对象回滚序补全**：**落点 件①-4 回滚形状（a）(b) 两层**。序=DROP FUNCTION→DROP POLICY×2→REVOKE 表权→DROP ROLE（函数 owner=该角色·DROP FUNCTION 必先）；fail-closed 惰性化性质注：GUC 唯一 setter=清扫函数本体且事务局域——任一中途态零放行窗·终态回 0195 恒 RAISE 基线（原「以 0208 体复原」半保留为 (a) 层）。
- **P2-5 §0.1 interview-event.ts 三处行锚重 pin**：**落点 §0.1 该行+随附引用同步（§1.1 `:23-42`→`:16-43`·§1.4 `:34-41`→`:29-33`）**。blob `880a1dcb`（43 行）恒等亲算·行锚：`:20-22`→**`:22`**（advisory 锁）·`:29-33`→**`:23-26`**（event_key 幂等）·`:34-41`→**`:29-33`**（INSERT…SELECT COALESCE(MAX(seq),0)+1）。
- **P2-6 seq scan 量化登记+CONCURRENTLY 独立迁移裁量**：**落点 §1.4 追加段**。亲证：interview_event 零 created_at/kind 索引（全迁移目录 grep 亲证——索引面仅 0001 `:39` PK id+0001 `:45` UNIQUE(stream_key,seq)+0021 `uq_interview_event_key`）→批 DELETE 单批=1 次全表 seq scan·每拍≤40 批→≤40 次/拍·O(现役行数) 线性（终态 kind 与 progress 族两族叠加·progress-write `:38` ≤8 行/生成）·缺省 disabled 零发生。CONCURRENTLY 裁量：后继刀补索引沿 0190/0211 `@migration-mode concurrent-index` 先例独立非事务迁移（0211 头注「语句在事务外执行」）·**Ban 入 transactional 0219 内建索引**（二者互斥）。
- **item6（P2 折入清单第 6 条）必读清单+RLS 论证改现行形**：**落点 §0 必读清单+§1.2 表 row2+件①-3+§0.1 0001 行注改形+§0.1 新增 0062 行**。亲证：interview_event RLS 现行=单 policy p_owner 且 `FOR ALL TO app_role`（0062 `:59-62`·0059 `:46-49` 前手同形重建）——0001 `:75-78` 无 TO 原形已两度被取代；event_retention_worker 零适用 policy→**「无适用 policy→默认拒绝」为 SD 清扫被拦的现行形机制**（旧形「principal 未置谓词假」论证废弃·改）。必读清单增 0059/0062（本条）+0126（P2-1 随附·§1.2 新引文件）。
- **门矩阵回执（本 rev）**：docs:check EXIT=0 `scanned 2344`≤2354·markers+冲突标记零命中（词面运行时组装·不入卷）·`git diff --numstat` 恰 1 tracked·§0.1 锚 18→**21** 行全量 `git hash-object` 亲算恒等。est live=0（§6 同·零实跑零容器零外呼）。

---

*EVENT-TTL REQUEST · 2026-10-26 起草落卷 · 2026-10-26 P2 折入 rev1（双审双 PASS 附清单·协调方授权折入·六项逐条落点=§9-rev） · **`draft:awaiting_pre_exec_dual`**（起草史录态·rev1 后恒值至 EXEC 授权·alone≠dual·翻面权归协调方） · base `origin/main` @`38f6e7d78`（fetch 亲证 origin tip 同指） · 分支 `line/event-ttl-draft`（前波已立·本席快进接续 `47dd6be5`→`38f6e7d78` 零冲突） · 工作树 `../meetwise-ttl` · 读码定性=interview_event 写入面 INSERT 单通道（appendEvent）+清理面零路径（0096 `:255` REVOKE+`:529` 隐私单目标臂唯一+0195 触发器恒 RAISE+0208 隐私四键臂）+progress 族永久落库（progress-write `:38` 定谳承接） · 修法=件① 0219 迁移（CREATE ROLE event_retention_worker NOLOGIN+GRANT SELECT,DELETE+RLS 双 policy GUC 门+SD 清扫函数批删 4 值 ephemeral kind 域+触发器函数 additive 释放臂〔0208 体逐字节保留〕）+件② db 模块+barrel+件③ worker env 门 sweep 接线（缺省 disabled·180d〔无先例锚·协调方裁决项预登 P2-2〕/500 批/1d 拍）+件④ 隔离容器 proof ≥11 臂（P2-3 增 pg_auth_members 防漂移臂） · 迁移号认领=0219（届 fetch 亲证：0214/0215/0218 已占·0216/0217 历史删除号·现最大 0218 顺延·全分支零占用双证） · 派单三勘误如实登记（0209 非触发器=AG-09 SD 函数重写/settlement 面按表区分消解/TTL 表即 interview_event 本体故冲突真实且按 0208 仲裁形可解） · 否决=甲 触既有触发器语义（additive 臂+裁决点预登）+乙 无保留期硬删+丙 应用层逐行删 · 门矩阵=docs:check 2343→2344≤2354+markers 零+diff 恰 1 tracked+十八锚 blob 亲算（起草 turn 亲跑）·rev1 复跑同门（docs:check 2344≤2354·markers 零·diff 恰 1·二十一锚亲算=P2 折入 turn）·EXEC 期 migrate:prove/drift:prove/uniqueness 217/proof 全臂/interview:prove/sse 邻面/typecheck/lint 八门 · 容器依赖如实预登（§4-②） · est live=0 · ⛔push · ⛔merge 主线 · ⛔force push · STOP=draft*
