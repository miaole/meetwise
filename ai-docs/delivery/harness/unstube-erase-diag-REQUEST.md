# UNSTUBE-ERASE 基线红诊断刀 REQUEST — 0195 append-only 触发器 vs 0096 投影 purge 写（诊断定谳+修法裁量定稿·迁移面 0208 认领〔rev 勘误原 0207·§9-rev+§9-rev3 双审定谳修订〕）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 席落码+门矩阵亲跑落卷·pre-exec 双审第三轮双 PASS 会签+协调方授权 EXEC 在案 §9-EXEC·待 post-prove 双审两外席·**Ban self-approve**·**alone≠dual**·⛔push ⛔merge 主线·push/翻面权归协调方）。本值三处同值：Status 头+§8+卷尾注。

> 战役 meetwise · 支线 `line/unstube-erase-diag` · 工作树 `meetwise-und` · 起草基线 @origin/feat/mysql-schema-skeleton=`c4bd89132`（派单下界「fetch 后 origin tip≥`c4bd89132` 或更新」：届树 origin tip=`c4bd89132` 等号成立亲证；本 turn `git fetch` origin 访问受限零新波·如实登记沿 42cf5f121 先例形；`origin/main 112e6d26f` 为基线祖先 `git merge-base --is-ancestor` EXIT=0 亲证）。主仓建支线：`git worktree add ../meetwise-und -b line/unstube-erase-diag c4bd89132`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief「UNSTUBE-ERASE 基线红诊断刀」（DB-HOTSPOT EXEC 席+post 席1/2 三席独立复现 `pnpm unstube-erase:prove` EXIT=1·`failure_class=privacy_contract_failed pass_count=41 fail_count=0`·崩点 `interview_event_immutable`·如实升级在案：`ai-docs/delivery/execution-master-checklist.md:3637` + `ai-docs/delivery/harness/db-hotspot-REQUEST.md:191` §⑥）；②本席=第四席独立复核（链文件亲读+考古+PG16 触发器语义实证）。

## 必读清单（执行/双审开工前精读·显式路径）

1. 本卷 + `ai-docs/delivery/harness/TASK-SOP-v2.md`（闸列）+ `ai-docs/delivery/harness/product-campaign-LEDGER.md`（只读）。
2. 崩链四本体：`apps/api/test/unstube-erase.proof.ts:355-394`（完成推进 purge 环）· `packages/db/src/transcript/int-transcript-projection.ts:93-105`（purgeInterviewProjectionTarget）· `packages/db/migrations/0096_int_transcript_remaining_sinks.sql:480-594`（privacy_purge_interview_projection_target·event 臂 :528-531）· `packages/db/migrations/0195_interview_event_settlement_append_only.sql`（全 41 行）。
3. 豁免形先例权威：`packages/db/migrations/0152_resume_soft_delete_fence.sql`（0060 双拦截受审放行：current_user/session_user 三态判别矩阵+SET ROLE 伪造上游防注 :20-38 与 :151-156）+ 0152 头注「0060 law extension：对任何可登录角色授予 privacy definer 成员资格即破判别器·Ban」。
4. 基线红在案登记：`ai-docs/delivery/harness/batch5b-mig-REQUEST.md:297-310`（P-3 §1 清理句降级两处+§2 硬门 UPDATE-only 缺口自陈）——本卷 §1.1 据此定位第三类漏采点。

## §0 现状锚（起草席亲读+blob 亲算 @`c4bd89132`·`git rev-parse HEAD:<path>` 亲算·**EXEC 立项照本节对届时 tip 重 pin——结论不变只更行号·定性翻案即停**）

### 0.0 防重三对表

| 项 | 值 | 亲证 |
|---|---|---|
| 支线名 | `line/unstube-erase-diag` | 主仓 worktree 列表恰 `meetwise-und` 一株本刀·零同名株 |
| 基线 | `c4bd89132`（=origin/feat/mysql-schema-skeleton tip=origin/line/db-hotspot tip） | `git rev-parse` 恒等·本卷 blob 锚全在该树 |
| 邻刀撞面 | DB-HOTSPOT 已落基线（0206 read-tier 在链）·TRACE-RECON/供应链/打卡键在飞 | 0207 空号亲证 `ls packages/db/migrations` 恰 206 文件顶 0206〔起草时点口径·rev 勘误：0207 后被 TRACE-RECON 占用·本刀顺延 0208·§9-rev〕 |

### 0.1 blob 锚表（@`c4bd89132`）

| blob | path |
|---|---|
| `571234c99cae` | `apps/api/test/unstube-erase.proof.ts` |
| `8a93d2f6f9ba` | `packages/db/src/transcript/int-transcript-projection.ts` |
| `16657f5566f1` | `packages/db/migrations/0096_int_transcript_remaining_sinks.sql` |
| `d323706e2040` | `packages/db/migrations/0195_interview_event_settlement_append_only.sql` |
| `18e5183436b1` | `scripts/run-e2e-isolated.mjs`（failure_class 分类器 :2830-2837） |
| `0d523b18e5dd` | `receipts/archive/2026-09-batch23/receipts/g7-enoent-fix/unstube-erase-prove-PASS.json`（2026-10-10T10:19:57Z EXIT=0·schemaMigrationManifest.count=159） |
| `fae7c2b0db98` | `ai-docs/delivery/harness/batch5b-mig-REQUEST.md`（P-3 :297-310） |

### 0.2 崩链触点事实（file:line 亲证 @`c4bd89132`）

1. `unstube-erase.proof.ts:355-394` 完成推进：`projectionTargets` 按 `ORDER BY sink`（字典序 `ai_graph_run`→`checkpoint_rows`（:379 skip）→`event`→`report`）逐 target claim+purge；:380 `purgeInterviewProjectionTarget(c, t.id, claimed.leaseToken)` **无 try/catch**——proof 按 0096 立法契约预期 purge 成功（合法预期）。
2. `int-transcript-projection.ts:94`（函数体）/:99（`SELECT * FROM privacy_purge_interview_projection_target($1,$2)`）。
3. `0096:524-525` purge 事务内置 `app.privacy_target_id`+`app.privacy_lease_token`（set_config transaction-local）；:528-531 `sink='event'` 臂 `DELETE FROM interview_event WHERE owner_user_id=principal AND stream_key=target_row.interview_id`（SECURITY DEFINER owner=`privacy_worker_owner`·EXECUTE 仅 `privacy_worker_executor`·:589-594）。**派单 brief 语义勘误：崩点语句是 DELETE（物理擦除删除），非「写/INSERT/UPDATE」；0195 触发器本体=BEFORE UPDATE OR DELETE（:27-29），brief 所记「BEFORE UPDATE/INSERT」与本件不符·如实勘正。**
4. `0195:19-25` `assert_interview_event_immutable()` INVOKER 仅 RAISE（:23 `RAISE EXCEPTION 'interview_event_immutable' USING ERRCODE='23514'`）；:27-29 触发器 FOR EACH STATEMENT；:16 REVOKE UPDATE（DELETE 面 0096:255 已 REVOKE app_role·0001:65 本就未授 DELETE）。
5. `run-e2e-isolated.mjs:2832` 分类器 `/privacy_[a-z0-9_:-]+/i` 命中报错上下文中的 `privacy_purge_interview_projection_target` → `privacy_contract_failed`；进程级中断在 purge 环内（第 42 断言前）→ `pass_count=41 fail_count=0`（三席复现值；全卷断言 46=f9383f767 立卷值·本席静态 A( 位点 44·差异=条件/嵌套位点·如实两记）。
6. `ai_graph_run` 臂（:532-535）先于 event 执行且**不撞 0195**（0195 仅挂 interview_event+settlement_ledger；0194 ai_graph_run 终态冻结是 UPDATE 侧）→ 前序 41 断言可通过、恰在 event 臂崩——与三席复现指纹逐位吻合。

### 0.3 触发器语义实证（第四席新增证据·PG16 容器亲跑 2026-10-16）

最小复现（同构 0195 触发器形：BEFORE UPDATE OR DELETE·FOR EACH STATEMENT·INVOKER 仅 RAISE）：**零行 DELETE（WHERE 不命中·表空）与有行 DELETE 双双 RAISE**——语句级 BEFORE 触发器与行数无关。推论：崩点为**确定性·数据无关·100% 可复现**（即使目标访谈零 event 行照样崩）·Ban retry-to-green 语义成立；且触发器对全部角色生效（superuser 亦不豁·实证会话即 superuser）——「换角色跑」类幻想修法全数无效。

## §1 诊断定谳+修法裁量定稿（EXEC 立项不得改本节契约与 §5 pins·改则回炉重审）

### 1.1 定谳：三律撞碰·根因=0195 落链硬门第三类漏采点·非 DBH 非 proof 缺陷

- **绿→红边界=`7152cd3c2`（2026-10-14 15:29:49 +0800·BATCH5B-MIG EXEC·迁移 0190-0199）**。证据链：①proof 出生绿 `f9383f767`（2026-10-10 02:05:56·「46 断言 EXIT=0」立卷词）+PASS 收据 0d523b18e5dd（10-10T10:19Z EXIT=0·链 159）先于 0195 四天；②0195 内容自 `7152cd3c2` 逐字节不变（`git diff 7152cd3c2..112e6d26f` 与 `..HEAD` 该文件零差）；③10-14 后零绿run——5b 门矩阵（P-4 表：uniqueness/migrate/db-money3/uc004/db/drift/typecheck/docs/markers）与 DBH 门均不含 unstube-erase:prove·三席在 `c4bd89132` 独立复崩·本席链读+实证第四席同判。**时间序唯一相交=0195 落链。**
- **根因归属**：0195 头注前置硬门「rg 实测 `UPDATE interview_event`…零合法调用点」口径双重收窄（5b P-3 §2 已自陈：①仅 UPDATE 词面·触发器同拦 DELETE 未扫；②仅生产码目录）——其影响预判面（5b P-3 §1）亦只采到 test/proof 清理句两类调用点（g7fix4:123+recruiter-depth:350）。**第三类漏采点=迁移 SQL 函数体内的调用点（`0096:529`）**——它在 packages/db/migrations/ 而非生产码目录，rg 门与影响预判双双不可见。非 DBH 引入（`c4bd89132` diff 零触崩链四文件亲证·checklist :3637+db-hotspot-REQUEST :191 在案同判）；非 proof 缺陷（proof 断言的恰是 0096 立法契约·见 §1.2 定性）。
- **邻面 blast radius（量级）**：全链库上对 interview_event 的合法/既有 DELETE 恰三类〔rev3 勘误：原「恰两类」系普查失真——漏第三类=purge 调用方 proof 双件·pre-exec 席2 补采〕——①0096:529 purge（生产·撞死=本刀主面）；②测试清理句六文件（全链 2+neg 4〔rev3 勘误：原「五文件」计数失真〕：g7fix4:123·recruiter-depth:350·均 try/catch 吞（:133/:369）→ EXIT 不红但清理尾死·隔离库夹具残留跨轮累积·5b P-3 §1 已登记本刀不改；neg 链四 proof（sse-push/uc-e2e-002×2/uc-e2e-010）**零影响**（`_neg-harness` 载 `sql/01_schema.sql` 最小镜像·无 0195·亲证））；③purge 调用方 proof 双件〔rev3 新采〕——`packages/db/test/int-transcript-remaining-sinks.proof.ts`（:231/:295/:320 经 purge() 无 try/catch 直打 event sink·0195 在链后确定性红 EXIT=1·0096 立法本体 proof）+`packages/db/test/uc052-internal-erasure.proof.ts`（src `packages/db/src/privacy/uc052-internal-erasure.ts:228` 逐 target purge·红值归因 EXEC 期实跑分辨 DBID-1 旧红）。

### 1.2 修法裁量定稿：**0208 新迁移〔rev 勘误原 0207·§9-rev〕·0195 触发器函数谓词放宽·豁免形沿 0152 先例·proof 零改**

- **定性先立**：interview_event 的 erase DELETE 是**受审合法变更**——0096 铁律「删后 read=0=真物理删除+receipt，不是只靠 RLS fence 假绿」（0096 头注 :49）与 0195「事件流不可篡改」（头注 :5-10·立法靶=防原地改写/洗账·`settlement_ledger 更正走冲正行` 同段）**两律撞碰非律废律**：0195 防的是改写历史，0096 强制的是经 0091 issuer/claim/lease 全链授权的擦除·擦除完成后 read=0、行不再存在，无「历史被改」可言。仲裁=给擦除路径开**窄豁免**，防篡改语义对其余一切路径原样保留。
- **载体=新迁移 `packages/db/migrations/0208_unstube_event_immutable_relax.sql`（认领 0208〔rev 勘误 2026-10-16：原认领 `0207_interview_event_erasure_release.sql` 作废——0207 已被 TRACE-RECON `0207_ai_trace_backfill_scoped.sql` 占用·归因与扫描证全文在 §9-rev〕·基线顶 0206 空号亲证）**：`CREATE OR REPLACE FUNCTION assert_interview_event_immutable()` 保持 INVOKER/同签名/仅加判别前置——**0152 三态判别矩阵同构移植**：
  - 释放臂（恰一）：`TG_OP = 'DELETE' AND current_user = 'privacy_worker_owner' AND current_setting('app.privacy_target_id', true) IS NOT NULL AND session_user <> 'privacy_worker_owner'` → `RETURN NULL`（放行）〔rev3 双审收敛行使：增 `TG_OP='DELETE'` 收窄——UPDATE 窗口内无正当用途·0152 逐列精释同构度提升·双席均建议〕。三键逐条对 0096 purge 实况：current_user=definer（:589 OWNER）·GUC=purge 本体 :524 置（transaction-local·purge 外不存）·session_user=runtime 登录（经 privacy_worker_executor SET ROLE·0096:593-597 防漂移）；+TG_OP='DELETE' 第四元：0096 event 臂 :528-531 本就是 DELETE·purge 入臂零阻·UPDATE 侧豁免零正当（四元合取缺一不可·rev3 后口径）。
  - 其余一切（app_role 直写·直连 definer 会话·无 GUC 的 definer 路径）→ `RAISE … 'interview_event_immutable' 23514` 原样。SET ROLE 伪造上游防沿 0152 头注法：EXEC 亲证 `privacy_worker_owner` NOLOGIN/NOINHERIT/零成员授予（0092 族纪律），并对「向可登录角色授 privacy_worker_owner 成员资格」显式 Ban 落注（0060 law extension 同形）。
  - 触发器对象本体（BEFORE UPDATE OR DELETE·FOR EACH STATEMENT）零动·0195 文件零动（无 checksum churn 无 db 重建·CREATE OR REPLACE 只换函数体·ACL/OWNER 保持）；`settlement_ledger` 孪生触发器**零触**（无隐私擦除路径·豁免零正当性）。
  - 回滚形状〔rev3 补一行〕：0208 无 down 面·回滚=以 0195 原体 blob `d323706e2040`（§0.1 锚）`CREATE OR REPLACE FUNCTION assert_interview_event_immutable()` 复原。
- **proof 面零改**：unstube-erase.proof 断言的正是 0096 立法契约（purge→completed）；本修恢复 DB 侧履约，proof 红转绿零断言改动。EXEC 增臂仅**深度自证**（NEG）：app_role 直 UPDATE/DELETE interview_event 仍 23514·直连 definer 仍 23514·无 GUC definer 路径仍 23514（触发器豁免不外溢）。
- **量级裁量依据**：本修一行谓词消除确定性主门红；清理尾**不复活**〔rev3 双审收敛勘误：原「复活两处清理句尾（`cleanup failed` 消失=预期形）」系假预期——g7fix4:123/recruiter-depth:350 清理句系 invoker 直连 pool.query（隔离库角色=meetwise superuser·`run-e2e-isolated.mjs:3113` `POSTGRES_USER=meetwise`）·不满足释放臂键1 current_user=privacy_worker_owner→23514 必然仍在（`cleanup failed` 噪声原地保留·EXIT=0 不变·try/catch 吞如旧·处置留后继刀）〕；session_replication_role/DISABLE TRIGGER 形被 §1.3 全否决后，本形是唯一同时满足「0096 契约履约+0195 防篡改保全+fail-closed 宪章+最小迁移面」的载体。
- **superuser 通路注记〔rev3 补〕**：0208 落链后 superuser 亦可 `SET ROLE privacy_worker_owner`+置 GUC 入释放臂——无新增能力（superuser 本可 `session_replication_role` 绕触发器·§1.3-1 在案）·契约不改（§0.3 实证触发器对 superuser 亦生效·触发器非 superuser 防线·本刀不加防亦不洗）。

### 1.3 否决（EXEC 期不得翻案·翻案=回炉重审）

1. **`session_replication_role='replica'` 会话级绕触发器**——需 superuser·会话全局关停一切触发器（0059 写 guard/0194 结算/FK 全灭）·fail-open·违密封清单/fail-closed 宪章。Ban。
2. **`ALTER TABLE … DISABLE TRIGGER`（持久或事务内）**——持久形全局拆防；事务形仅剩测试侧 db-int-fk :78-93 既有先例（回滚内负探针）非生产载体。Ban。
3. **proof 断言适配洗红（接受 event 臂 purge 失败/降格 completed 断言）**——违 0096 铁律与 GAP-PRIV-02 supersession 立法（gap-bug-backlog :775「不得虚称删除/擦除已完成」）·event sink 永不物理擦除=隐私契约真破损非表述破损。Ban。
4. **0195 原地重写**——checksum churn+dev 库重建处置面（0148/0149 重制形代价）·本修零需。Ban。
5. **清理句改 TRUNCATE 载体**（5b P-3 §1 后继建议）——TRUNCATE 绕行 DELETE 触发器属同族 fail-open 面·权限/级联/FK 面未证·本刀对清理句零改（EXIT 不红·非主门）。本刀不行使·留后继裁决。
6. **跳过/豁免 settlement_ledger 孪生**——零隐私擦除路径·豁免无正当性。Ban。
7. **`DROP TRIGGER`/重建触发器/`WHEN` 子句改形载体**〔rev3 增·触发器对象零动 pin 显式化〕——重建即 0195 对象 churn（同 4 号 checksum/处置面）·`WHEN` 改形亦须 DROP+重建且把豁免谓词暴露为表级元数据（判别器外溢）·本修唯一载体=CREATE OR REPLACE 函数体内收窄（§1.2 载体件）。Ban。

## §2 门矩阵（十门·起草席基线值在卷·EXEC 期复跑落届值——届值照 sanctioned 口径沿 db-hotspot rev2 P1-b 形）

| 门 | 基线（起草席亲跑/在案） | EXEC 届时目标 |
|---|---|---|
| 1 `pnpm unstube-erase:prove` | **红** EXIT=1·privacy_contract_failed·41/0（三席复现+本席四席同判） | **绿** EXIT=0·46/46（唯一翻面主门） |
| 2 `pnpm migrate:prove` | 链 206（fresh 全量+幂等 skip 基线形） | 链头 0208 fresh 应用零漂移·PASS 只增不减（rev 勘误 0207→0208·链文件总数以届树实跑为准·§9-rev）·EXEC 立项届 fetch 后重跑 0208 全 ref 零占扫描+迁移链顶亲证〔rev3 显式化·防重演 TRACE-RECON 撞号〕 |
| 3 `node scripts/check-migration-version-uniqueness.mjs` | files=206 violations=0（5b P-4 口径续） | files=届树实跑值〔rev 勘误原 207·0208 认领后届树 207/208 两形·头 0208·§9-rev〕violations=0（豁免表 0143/0152/0160 不变）+同门2 EXEC 届 fetch 后 0208 全 ref 零占扫描+链顶亲证重跑〔rev3 显式化〕 |
| 4 `pnpm drift:prove` | 零漂移（豁免登记 2 项基线不变） | 零漂移 |
| 5 邻面 proof | g7fix4:finalize:prove+recruiter-depth:prove EXIT=0（清理尾死·`cleanup failed` 噪声在）；db-int-fk/privacy-erasure-http/settlement 面绿 | 同门 EXIT=0 且清理尾**不复活**〔rev3 双审收敛勘误：原「且清理尾复活」系假预期——g7fix4:123/recruiter-depth:350 清理句系 invoker 直连 pool.query（隔离库角色=meetwise superuser·run-e2e-isolated.mjs:3113 POSTGRES_USER=meetwise）·不满足释放臂键1 current_user=privacy_worker_owner→23514 必然仍在·`cleanup failed` 噪声原地保留·EXIT=0 不变·try/catch 吞如旧·处置留后继刀〕；int-transcript-remaining-sinks 现 EXIT=1→0208 后预期 EXIT=0（purge 走 definer+GUC 入释放臂·rev3 席2 普查补·预登）；db-int-fk P6-4 须 commit 后树净形跑（0208 已 tracked 非未跟踪态·rev 勘误） |
| 6 `turbo typecheck --force` | 8/8 0 cached（在案 sanctioned 值） | 8/8 0 cached |
| 7 `turbo lint` | 12/12·web 601/root 5224/api 1421 三值恰等（在案贴线） | 同值恰等·零超支 |
| 8 `pnpm docs:check` | EXIT=0·scanned 2244 ≤ cap 2248（起草席基线亲跑） | 本卷 draft 后 2245 ≤ 2248 余 3·EXEC 面零新受管件（0208 在 migrations 非受管根·rev 勘误·§9 附记为既有卷内行） |
| 9 markers 五类（四标记词+冲突标记·词面防自指不在本卷拼出） | 本卷改动集零命中（commit 前亲跑） | 零命中 |
| 10 diff 面 | 本卷 draft=恰 1 tracked（本 REQUEST）；est live=0 | EXEC 面=0208 新迁移〔rev 勘误原 0207·§9-rev〕+本卷 §9-EXEC 附记（proof 零改）·超出即红停 |

## §5 pins（Ban+预算）

- 崩点数据无关确定性红（§0.3 实证）·Ban retry-to-green·Ban flake 标注。
- 豁免恰一释放臂三键+`TG_OP='DELETE'` 收窄缺一不可〔rev3 双审收敛增补第四元·经 rev 回路行使·非 EXEC 期私改〕·键集改动=改 §1 契约回炉。
- settlement_ledger 孪生触发器零触 pin。
- 0195 文件零字节 pin（含头注——硬门缺口注记留 5b P-3 §2 原文·本刀不洗不补）。
- privacy_worker_owner 成员资格零授予 pin（0060 law extension·授予即破判别器）。
- est live=0·本卷 docs-only 恰 1 tracked。

## §8 STOP（开工条款+待裁决项）

- **STOP=`executed:awaiting_post_prove_dual`**（三处同值：Status 头+本节+卷尾注）。〔pre-exec 双审第三轮双 PASS 会签→协调方授权 EXEC 已行使·EXEC 面 §9-EXEC 落卷·2026-10-18〕
- post-prove 双审两外席审面建议优先序：§1.2 释放臂四元谓词逐字对 0208 文本与 0096 实况复核（双审主战场）→ §1.3 否决七件无翻案 → §2 门1 翻绿指纹（46/46·failure_class=none·`applied=207 skipped=0`）+门5 邻面回执（`cleanup failed` 噪声原地/sinks 翻绿/db-acl P3-6 转绿/uc052·db-int-fk 附记回执）。
- 裁决项一（不阻 EXEC）：5b P-3 §1 遗留「清理句 TRUNCATE 载体」后继处置是否另立刀（本刀 §1.3-5 已述不利面）。
- ⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase（push/翻面权归协调方）。

## §9-rev（协调方裁决 rev 注记·2026-10-16·迁移号 0207→0208 勘误·零码面零状态翻面）

- **裁决**：协调方裁决令（2026-10-16）——TRACE-RECON 保 `0207_ai_trace_backfill_scoped`（先落其 EXEC 波）；**本卷 UNSTUBE-ERASE 修法载体顺延认领 `0208_unstube_event_immutable_relax`**（全 ref 防撞扫描后认领·扫描证见下·本条即 §0.0 原预登邻刀撞面条款之行使）。
- **勘误面**：标题号面+§0.0 邻刀撞面行+§1.2 定稿头+§1.2 载体件+§2 门2/门3/门5/门8/门10 号面 0207→0208 照更（〔rev 勘误〕注记随位）——**结论零变·仅号面与文件名**（`0207_interview_event_erasure_release.sql`→`0208_unstube_event_immutable_relax.sql`）；卷尾注 append 随卷句不洗史。
- **撞号归因（协调方裁决词·逐字承立）**：「起草时 0207 间隙未察·TRACE-RECON 同日落主线暴露」——起草 turn `git fetch` 访问受限零新波（§0 头在案），§0.0 据届树 `ls packages/db/migrations` 恰 206 文件顶 0206 认 0207 空号（起草时点口径）；TRACE-RECON 系 cap-2248 sanction 在飞四刀之一（`5ec0cf6d0` 词面「TRACE-RECON +4」在案），其 EXEC 波 `d278dccce` 落 `packages/db/migrations/0207_ai_trace_backfill_scoped.sql`（父并线 merge `7388280f7`=origin/feat/mysql-schema-skeleton@`c4bd89132` 与本刀同基线波·该 merge 词「0207 净」系彼时点口径）——占用对本刀起草窗不可见·非抢号。遥测口径如实两记：届 fetch EXIT=0 零新波（全 remote-tracking `[up to date]`），origin/feat/mysql-schema-skeleton tip=`7b8bc1029`（`c4bd89132` 直后裔 docs(audit) 波）迁移链顶仍 0206·`d278dccce` 未入该遥测链——0207 占用事实以 `d278dccce` 在链+协调方裁决为权（push/翻面权归协调方）。〔rev3 遥测更注 2026-10-16·照现值：origin/feat/mysql-schema-skeleton tip=`57f5fab76` 已含 `d278dccce`（`git merge-base --is-ancestor` EXIT=0 亲证·链顶已 `0207_ai_trace_backfill_scoped.sql`）·0207 全 ref 5 命中（`line/audit-106-close`/`line/cap-sanction-2256`/`line/trace-recon`/`origin/feat/mysql-schema-skeleton`/`origin/line/trace-recon`）·全 ref 1160→1163·本 rev 席 fetch EXIT=0 亲跑〕
- **0208 防撞扫描证（rev 席亲跑 2026-10-16·全 ref 1160/1160 可读零跳过）**：①文件名全史——`git log --all --diff-filter=A -- '*0208*'` **零命中**（对照 `'*0207*'` 恰 1 命中=`d278dccce`·占用面亲证）；②全 ref 树面——`git for-each-ref` 全集 1160 ref 逐 ref `git ls-tree -r <ref> -- packages/db/migrations/` 扫 0206-0209 号段：0206 恰 9 ref（主线族）·0207 恰 1 ref（`refs/heads/line/trace-recon`）·**0208/0209 全 ref 零文件命中**；③词面全 ref tip——`git grep -I "0208"` × 全 ref × `packages/db/migrations`+`docs` 两树零命中；④本树文本面——`git grep -nw "0208"`（ai-docs/apps/packages/scripts）起草树零命中。认领成立。
- **0152 三态判别先例同构承立**：§1.2 豁免形沿 `packages/db/migrations/0152_resume_soft_delete_fence.sql` 先例（current_user/session_user 三态判别矩阵+SET ROLE 伪造上游防注）**承立零动摇**——撞号仅涉载体编号：释放臂三键（`current_user = 'privacy_worker_owner' AND current_setting('app.privacy_target_id', true) IS NOT NULL AND session_user <> 'privacy_worker_owner'`）、0060 law extension「成员资格零授予」Ban、fail-closed 宪章、proof 零改、§1.3 否决六件全部原样；§8 pre-exec 双审主战场（释放臂三键逐条对 0096 实况复核）不变。
- **卫生回执**：markers 改动集五类标记词零命中+全树行首冲突标记零命中（commit 前亲跑·运行时组装口径沿 `scripts/i6-239-gates.proof.mjs` §2-7·词面不入卷防自匹配）；docs:check 本树亲跑 EXIT=0（数值见 commit 词）；本 rev 仍恰 1 tracked `.md`=本卷零码面；**STOP 三处同值不变 `draft:awaiting_pre_exec_dual`**。

## §9-rev3（pre-exec 双审定谳修订落卷·2026-10-16·两外席 FAIL 互盲并行→协调方收敛清单→rev 席逐条行使·零码面零状态翻面）

- **收敛来源**：pre-exec 双审第三轮前 rev 回路——两外席审面 FAIL 清单互盲并行呈报·协调方收敛定谳（P1-甲双席收敛+P1-乙席2+P2 七件全行使）交修订席逐条落卷。**结论性翻面零**：§1.1 根因定谳（0195 落链硬门漏采）·载体 0208·0152 先例同构·proof 零改·STOP 值全部承维；修订面=假预期勘误+普查补采+显式化+收窄行使。
- **P1-甲（双席收敛）门5 假预期勘误**：§1.2 量级句原「复活两处清理句尾（`cleanup failed` 消失=预期形）」+§2 门5 EXEC 目标原「同门 EXIT=0 且清理尾复活」均为**假预期**——g7fix4:123/recruiter-depth:350 清理句系 invoker 直连 pool.query（隔离库角色=meetwise superuser·`run-e2e-isolated.mjs:3113` `POSTGRES_USER=meetwise`）·不满足释放臂键1 current_user=privacy_worker_owner→23514 必然仍在。两处照改：「清理尾**不复活**（invoker 直连 DELETE 不满足释放臂键1·`cleanup failed` 噪声原地保留·EXIT=0 不变·try/catch 吞如旧·处置留后继刀）」。落点：§1.2 量级裁量依据 bullet+§2 门5 EXEC 目标列。
- **P1-乙（席2）普查补采**：§1.1 原「合法 DELETE 恰两类」失真——第三类=purge 调用方 proof 双件：`packages/db/test/int-transcript-remaining-sinks.proof.ts`（:231/:295/:320 经 purge() 无 try/catch 打 event sink·0195 在链后确定性红 EXIT=1·0096 立法本体 proof）+`packages/db/test/uc052-internal-erasure.proof.ts`（src `uc052-internal-erasure.ts:228` 逐 target purge·归因 EXEC 期实跑分辨 DBID-1 旧红）。门5 增预登：int-transcript-remaining-sinks 现 EXIT=1→0208 后预期 EXIT=0（purge 走 definer+GUC 入释放臂·TG_OP='DELETE' 收窄后 event 臂 DELETE 照入臂零阻）。落点：§1.1 邻面 bullet（恰两类→恰三类）+§2 门5。
- **P2-①**：「测试清理句五文件」→「六文件（全链 2+neg 4）」。落点：§1.1 邻面 bullet ②。
- **P2-②**：§1.3 增第 7 件 Ban=DROP TRIGGER/重建触发器/WHEN 子句改形载体（触发器对象零动 pin 显式化）。落点：§1.3-7；连动 §8 审面优先序「否决六件」→「否决七件」。
- **P2-③**：§2 门2/门3 EXEC 目标增「EXEC 立项届 fetch 后重跑 0208 全 ref 零占扫描+迁移链顶亲证」显式化（防重演 TRACE-RECON 撞号）。落点：§2 门2/门3 EXEC 目标列。
- **P2-④**：§1.2 末补 superuser 通路注记（0208 后 superuser 可 SET ROLE+GUC 入释放臂·无新增能力·session_replication_role 本可绕·不改契约）。落点：§1.2 尾新 bullet。
- **P2-⑤**：释放臂修法增 `TG_OP='DELETE'` 收窄（UPDATE 窗口内无正当用途·0152 逐列精释同构度提升·双席均建议）。落点：§1.2 释放臂 bullet（谓词扩四元）+§5 释臂 pin 连动更注+§8 审面优先序连动更注。
- **P2-⑥**：补回滚形状一行（0208 无 down 面·回滚=以 0195 原体 blob `d323706e2040` CREATE OR REPLACE 复原）。落点：§1.2 载体 bullet 尾新 sub-bullet。
- **P2-⑦**：§9-rev 遥测句照现值更注（origin tip=`57f5fab76` 已含 `d278dccce`·0207 现 5 ref·全 ref 1163）。落点：§9-rev 裁决段遥测句尾〔rev3 遥测更注〕。
- **rev 席亲证回执（2026-10-16 本树亲跑）**：①`apps/api/test/g7fix4-finalize-contract.proof.ts:123`/`packages/db/test/recruiter-depth.proof.ts:350` 均为 `pool.query('DELETE FROM interview_event …')` invoker 直连·`:133`/`:369` try/catch 吞亲读；②`scripts/run-e2e-isolated.mjs:3113` `-e POSTGRES_USER=meetwise` 亲读；③int-transcript-remaining-sinks purge 行号 :231/:295/:320 亲读（:237/:242 graph/report 臂不撞 0195）+`packages/db/src/privacy/uc052-internal-erasure.ts:228` 逐 target purge 亲读；④遥测：fetch EXIT=0·origin/feat/mysql-schema-skeleton=`57f5fab76`·`d278dccce` ancestor EXIT=0·全 ref 1163·0207 恰 5 ref 命中·**0208 全 ref 1163 零命中重扫维持**（P2-③ 显式化条款之现值基座）·tip 迁移链顶=`0207_ai_trace_backfill_scoped.sql`；⑤0195 blob @本树 HEAD=`d323706e2040`（§0.1 锚恒等·P2-⑥ 回滚形状行基座）。
- **卫生回执**：markers 五类标记词+全树行首冲突标记零命中（commit 前亲跑）；docs:check 亲跑 EXIT=0（数值见 commit 词）；本 rev3 仍恰 1 tracked `.md`=本卷·零码面；**STOP 三处同值不变 `draft:awaiting_pre_exec_dual`**——rev3 落卷后重派 pre-exec 双审第三轮（审面以本节收敛清单为底稿）。

## §9-EXEC（EXEC 席落码+门矩阵亲跑落卷·2026-10-18·pre-exec 双审第三轮双 PASS 会签→协调方授权 EXEC·工作树 clean 起跑 @`f5dafe86a`）

- **落码面**：新建 `packages/db/migrations/0208_unstube_event_immutable_relax.sql` 恰一文件（§1.2-rev3 终形逐字）：`CREATE OR REPLACE FUNCTION assert_interview_event_immutable() RETURNS trigger LANGUAGE plpgsql`（INVOKER·SECURITY 未写=保持）——释放臂四元谓词 `TG_OP = 'DELETE' AND current_user = 'privacy_worker_owner' AND current_setting('app.privacy_target_id', true) IS NOT NULL AND session_user <> 'privacy_worker_owner'` → `RETURN NULL`·其余 `RAISE EXCEPTION 'interview_event_immutable' USING ERRCODE = '23514'` 原样（0195 原体 blob `d323706e2040` 为基·只加判别前置）。触发器对象本体/settlement_ledger 孪生/0195 文件零字节零触；头注含 0152 形 SET ROLE 上游防注（privacy_worker_owner NOLOGIN NOINHERIT 0048:16·成员资格授予 Ban）+superuser 通路注记+回滚形状行（blob `d323706e2040` CREATE OR REPLACE 复原）。迁移面零触其他文件·全链 `assert_interview_event_immutable` 改形面亲证仅 0195+0208 两处。
- **立项三证（rev3 P2-③ 显式化条款行使·2026-10-18 `git fetch` EXIT=0 后现值·届值照现值勿按旧值校对承命）**：全 ref 遥测漂移如实两记——rev3 词 1163→本 turn 现值 **1166**（扫描窗内 1165→1166 恰一新 ref 落·两采样恒等后号段扫以 1166 终集重跑）；①文件名全史 `git log --all --diff-filter=A -- '*0208*'` **零命中**（对照 `'*0207*'` 恰 1=`d278dccce` 占用面不变）；②号段扫（全 1166 ref 逐 ref `ls-tree`）：0206=18 ref·0207=12 ref·**0208=0·0209=0**（rev3 词 9/5→现值漂移如实两记·在飞并线所致）；③词面全 ref（`packages/db/migrations`+`docs` 两树）`git grep -I "0208"` 零命中。链顶亲证：origin/feat/mysql-schema-skeleton tip=`349c33e90`（=rev3 词 `57f5fab76` 直后裔·is-ancestor EXIT=0）链顶仍 `0207_ai_trace_backfill_scoped.sql`·origin/main 祖先 EXIT=0·本支线链顶 0206+工作树 0208。**认领维持零撞。**
- **门矩阵（EXIT 原值亲跑·界值照现值）**：
  - **门1 `pnpm unstube-erase:prove` EXIT=0**·`ISOLATED_PROOF_SUMMARY target=unstube-erase:prove:raw exit=0 pass_count=46 fail_count=0 failure_class=none`（基线红 41/0 privacy_contract_failed→绿 46/46·唯一翻面主门兑现）·同 run migrate `migrations: applied=207 skipped=0`=**0208 fresh 链头应用正面实证**。
  - **门2 `pnpm migrate:prove` EXIT=0**（123 PASS/0 FAIL·fresh 全链+幂等全 skip+multi-statement 三守卫+CI 唯一性豁免三历史双号面全 PASS）。
  - **门3 `node scripts/check-migration-version-uniqueness.mjs` EXIT=0**·files=207 violations=0·豁免 0143/0152/0160 不变。
  - **门4 `pnpm drift:prove` EXIT=0**（零漂移·豁免登记 2 项不变·临时双库 `_drift_mig` 全链含 0208 fresh 建=又一独立应用实证）。
  - **门5 邻面（四件实跑+两件洁净门卫留位）**：`g7fix4:finalize:prove` **EXIT=0** 且 `cleanup failed` 噪声原地保留；`recruiter:prove` **EXIT=0** 且 `cleanup failed: error: interview_event_immutable` 原地（invoker 直连 pool.query 不满足释放臂键1→23514 必然仍在·try/catch 吞如旧·**rev3 勘误预期形逐位吻合·清理尾不复活**）；`int-transcript-remaining-sinks:prove` **EXIT=0**（基线 EXIT=1→绿·rev3 预登兑现·INT-TRANSCRIPT-01 全 PASS）；`db-acl:prove` **EXIT=0** 且 `P3-6 purge（privacy_worker_owner · 物理删除 + target erased + 请求转 purging）绿 PASS`（**现状红→0208 后转绿如实记·双审 P2-R1 第三件兑现**）；`uc052:internal-erasure:prove` 现跑 **EXIT=1=C-UNCOMMITTED 洁净门卫红非断言红**（`?? 0208` untracked 本体先拒·0195 断言面未达·沿 attempt-ledger dev 先例 commit 后树净形复跑归因分辨 DBID-1 旧红）；`db-intfk:prove` P6-4 依 §2 门5 条款 commit 后树净形跑（P6-4 newFiles 白名单=0190-0199 未跟踪态·0208 tracked 后零出现即绿）——两件回执 **§9-EXEC 附记**（commit 后同 turn 落卷）。
  - **门6 `turbo typecheck --force` EXIT=0**·8/8 successful·0 cached。
  - **门7 `turbo lint` EXIT=0**·12/12·web 601/root 5240/api 1421 三值恰等旧帽口径·全包 0 errors（零 1423 形·#185 刀未涉本树）。
  - **门8 `pnpm docs:check` EXIT=0**·scanned 2246（=2245 基数+0208 .sql 恰 +1·帽内）。
  - **门9 markers 五类+冲突标记**：改动集零命中（§9 落卷后 commit 前终扫复跑·运行时组装口径沿 `scripts/i6-239-gates.proof.mjs` §2-7·词面不入卷防自指）。
  - **门10 diff 面（commit 时核）**：0208 新迁移+本卷（§9-EXEC 附记+STOP 三处翻面）——恰本刀面零越面。
- **EXEC 面基础设施红全账（attempt-ledger 纪律·非断言红·恢复手段如实记·同门复跑取终值）**：门2/unstube boot 红×3——①run1 `meetwise-postgres-dev` **OOMKilled=true ExitCode=137**（Docker VM TotalMemory≈2.35GB 帽·隔离实例并起内存挤压·宿主 16GB 不入帽）；②run2/3 确定性 boot 红=**本 worktree 零 node_modules**（`probeHostSql` host 面解析不到 `pg` 逐 attempt 必抛→streak 永不成立·容器本体健康 logs_bytes=2375 两跑恒等·手动同形 `docker run` probe 8s ready EXIT=0 证伪镜像/资源面）→ `pnpm install --frozen-lockfile` EXIT=0（1m0.3s）后门1/门2 一轮全绿；dev 库运行窗暂停/复起如实记（门4 需容器在跑·零触 dev 主库只建/弃临时双库）。
- **STOP 翻面**：`draft:awaiting_pre_exec_dual` → **`executed:awaiting_post_prove_dual`**（三处同值：Status 头+§8+卷尾注）。post-prove 双审审面优先序见 §8。

---

卷尾注：本卷=UNSTUBE-ERASE 基线红诊断刀起草落卷（诊断+起草席·2026-10-16）·基线 origin/feat/mysql-schema-skeleton @`c4bd89132`（fetch 访问受限零新波如实登记·下界等号成立）·支线 `line/unstube-erase-diag`（worktree `meetwise-und`）·本卷 draft=ai-docs/delivery/harness/unstube-erase-diag-REQUEST.md 恰 1 tracked·**STOP=`executed:awaiting_post_prove_dual` 三处同值（Status 头/§8/本注）**·est live=0·**rev §9-rev（2026-10-16）=迁移号 0207→0208 勘误**（协调方裁决·撞号归因=起草时 0207 间隙未察·TRACE-RECON 同日落主线暴露·载体照更 `0208_unstube_event_immutable_relax`·全 ref 防撞扫描零占用认领·0152 三态判别先例同构承立·STOP 承维不变）·**rev3 §9-rev3（2026-10-16）=pre-exec 双审定谳修订落卷**（P1-甲门5 假预期勘误「清理尾不复活」+P1-乙第三类 purge 调用方 proof 普查补采+P2 七件全行使含 TG_OP='DELETE' 释放臂收窄·落点逐一 §9-rev3·STOP 承维 `draft:awaiting_pre_exec_dual`·rev3 后重派双审第三轮）·**exec §9-EXEC（2026-10-18）=落码+门矩阵亲跑落卷**（pre-exec 双审第三轮双 PASS 会签→协调方授权 EXEC·0208 落码 §1.2-rev3 终形逐字·立项三证 fetch 后现值 1166 ref 零撞·门1 翻绿 46/46+`applied=207 skipped=0`·门2/3/4/6/7/8/9 全 PASS·门5 四件实跑 g7fix4/recruiter EXIT=0 噪声原地+sinks 翻绿+db-acl P3-6 转绿·uc052/db-int-fk 洁净门卫面 commit 后树净形附记回执·基础设施红全账 §9-EXEC·STOP 翻面 `executed:awaiting_post_prove_dual` 待 post-prove 双审两外席）·⛔push ⛔merge 主线。
