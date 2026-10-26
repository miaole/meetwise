# INTERVIEW-JOB-AUTOVACUUM REQUEST（面试作业表表级自动清理参数调优刀——5C 批表残半「调优半」承接·单迁移 expand-only·起草落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（起草 2026-10-19 落卷·est live=0·Ban self-approve·alone≠dual·⛔push·pre-exec 双审待两独立外席·翻面权归协调方）

**席位**：战役批表下一刀起草席（协调方派单·标的=5C 组半闭注记之「autovacuum 调优半」残面）。
**基线**：`origin/feat/mysql-schema-skeleton` @ `7a4288fb`（`git fetch` 后 `git rev-parse` 亲证=`7a4288fb137bbd162e176e3020f16b085f046bb2`）。分支 `line/autovacuum-tuning-draft`·工作树 `meetwise-iss4`（`git worktree add -B … ../meetwise-iss4 origin/feat/mysql-schema-skeleton` 本席亲立·直接落 origin tip 零 reset）。
**立项出处**：①`ai-docs/delivery/harness/product-campaign-LEDGER.md` `:87`（blob `b72c91291dc3d580a9b7252997dc599136b67ba4`）5C 组行 `#4（半闭注记 2026-10-13：退避半已随 AG-C 落=0175+claim 时闸·nail @928b2612；autovacuum 调优半无刀认领·维持开放勿翻面）`——本卷即「调优半」承接刀；批表翻面权归协调方·本卷零翻面；②`ai-docs/delivery/harness/queue-closeout-REQUEST.md`（blob `dd0639f851e948467bffeb09c5b2f8b279086762`）§1.3-1 先例拒认领定谳「n 系 DB 运维参数调优面…超本微刀量级与域·维持开放归协调方另裁」——本卷把可承载面收窄为**表级 reloptions 迁移**（码内/幂等/expand-only），全局配置域仍 Ban（§1.3-甲·与该定谳域一致不翻案）。

## §0 现状锚（起草席亲读·base `7a4288fb`·blob/file:line 逐条 rg/sed/grep/git rev-parse 实测亲证·**EXEC 立项对届时 tip 全量重 pin**——漂移如实改锚·结论不变则只更行号）

### 0.0 防重三查 + 在飞交叠复核

- `git worktree list`：本席建树时点 **5** 树（主仓/meetwise-agN2/meetwise-cap80/meetwise-hotfix/增本席 meetwise-iss4）·起草中段复测 **6** 树（增 `meetwise-iss24`=`line/outbox-partial-index-draft` 系并行席于本席建树后新立）——零 autovacuum 树（除本席）·时点值非恒定·EXEC 立项日复测为准。
- `git branch -a | grep autovacuum` 恰 1 笔=本席自建支线（`-B` 建前不存在的机证）；`ls ai-docs/delivery/harness/ | grep autovacuum` EXIT=1 零同名卷；`git log --all --oneline --grep=autovacuum` 恰 2 笔全 docs（`0a4d6901`/`b7dcce89`·零修码笔·零在飞修复刀）。→ 停止条件未触发·可落卷。
- 在飞交叠：并行在飞支线实测 `line/outbox-partial-index-draft`/`line/pgp-key-param-draft`/`line/ag-next2-draft` 等——**迁移撞号治理=后到者重编号**（仓内先例=ag-c-requeue rev2 E1 协调方裁定 0170-0175 编号分配）·本卷拟号 0211 仅作基线时点 pin·EXEC 立项届树重 pin。

### 0.1 blob 锚表（`git rev-parse HEAD:<path>` 亲算·全 @`7a4288fb`）

| 文件 | blob（全 40 hex） | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0175_interview_job_next_attempt_at.sql` | `ac234d442571849f96eba1796840d8f2b8aaecc2` | `:15` ADD COLUMN next_attempt_at（**退避半已闭在树**·头注自证「#4 兑现」） |
| `packages/db/migrations/0001_baseline.sql` | `d68f8dd0e61682603e9cd8fc1c1e8aaaf4965b79` | **`:253-267` CREATE TABLE interview_job**（version/lease/attempts 状态机列）·`:268` ix_ijob_claim(owner_user_id,status,seq,created_at) |
| `packages/db/src/interview/interview-jobs.ts` | `fbd43616e5f612f78078a92b8a3dd2d52d0a5681` | **漂移后路径亲证**（重组出 interview/ 子目录·367 行）·`:11` LEASE_SECONDS=120·`:154` claim 改写·`:265`/`:269` 终态改写·`:279-282` requeue·`:294` 心跳续租·`:313`/`:317`/`:322` reaper 三臂·`:335` payload TTL=86_400·`:351` 滞留 payload 清理 |
| `apps/worker/src/job-heartbeat.ts` | `ebca2fe10c4bd7bef642a241dee01517b44f0886` | `:9` `intervalMs = 30_000`（运行期每 30s 一拍续租） |
| `apps/worker/src/interview-consumer.ts` | `2e02fa21229444140768ae0d17510cba9c4d37bd` | `:384-394` 心跳接线（renewInterviewJobLease）·`:630`/`:648` reaper/purge 周期拍·`:680` 消费拍 intervalMs=5000 |
| `apps/api/src/modules/interview/interview.service.ts` | `7c139c1def46ee51654f2e5745f7ea36775865a8` | `:279-282`/`:285` start 入队（payload={requestId,targetRole?,focus?,sourceQuizId?} 小元数据）·`:466` answer 入队 |
| `packages/db/src/interview/interview-event.ts` | `880a1dcb7b4751e061b28207df7699573b712931` | `:30` 唯一写点=INSERT（append-only·反选证据） |
| `ai-docs/delivery/harness/product-campaign-LEDGER.md` | `b72c91291dc3d580a9b7252997dc599136b67ba4` | `:87` 5C 组 #4 半闭注记原文（只读蓝本·翻面权归协调方） |
| `ai-docs/delivery/harness/queue-closeout-REQUEST.md` | `dd0639f851e948467bffeb09c5b2f8b279086762` | §1.3-1 调优面拒认领定谳（承接关系 SSOT） |

### 0.2 调优半 open 亲证 + 判词复核 + 勘误登记（诚实第一）

1. **调优半 open**：`rg -n 'autovacuum' packages/`（migrations/src/worker 全覆盖）EXIT=1 **零命中**——表级参数无任何刀已行使·亲证成立。
2. **退避半已闭**：0175（blob `ac234d44…`）`:15` ADD COLUMN next_attempt_at 在树·仅退避列零涉 reloptions——残面确为「调优半」·选标有效·未被顺带修复。
3. **侦察卡勘误两则（锚级如实登记·结论不变）**：①卡载「`0001_baseline.sql:226-236` interview_job 已含 next_attempt_at」——届树亲证 `:226-236` 系 **ai_report** 块（`:231` next_attempt_at 属 ai_report·0175 头注「范本 0001:231」同证）；interview_job 建表真身=`:253-267` 且 baseline 期**不含** next_attempt_at（该列由 0175 ADD COLUMN 补入）。②卡载 `packages/db/src/interview-jobs.ts` 已重组——漂移后正锚=`packages/db/src/interview/interview-jobs.ts`。
4. **表选论证（码面写频证据·pg_stat 看板归 §2⑨）**：interview_job=全生命周期多拍改写——claim（interview-jobs.ts `:154` status/lease/attempts/version 四列）→ 运行期**每 30s** 心跳续租一拍（job-heartbeat.ts `:9`+interview-consumer.ts `:384-394`）→ 终态 done/failed（`:265`/`:269` 含 payload 键摘除）→ requeue（`:279-282`）+reaper 三臂（`:313`/`:317`/`:322`）+滞留 payload TTL 清理（`:351`·86400s）；消费拍 5s（interview-consumer.ts `:680`）驱 `:630`/`:648` 周期拍。**反选 interview_event**：唯一写点=INSERT（interview-event.ts `:30`·0195 settlement append-only 铁律）零改写零死元组不入选。**反选其余队列族**（ai_report/quiz_jobs/gateway_dispatch）：同形疑似但非本标的面·各表须独立 pg_stat 举证·归后继刀（§1.3-丁）。

## §1 修法（恰 1 新迁移·expand-only·零 TS 产品码·零 schema 结构变更）

### 件① `packages/db/migrations/0211_interview_job_autovacuum_reloptions.sql`（拟号 0211@tip `7a4288fb`·EXEC 届树重 pin·撞号=后到者重编号）

卷面草图（头注沿 0175 形·EXEC 落码为准）：

```sql
-- 0211_interview_job_autovacuum_reloptions.sql（拟号·EXEC 届树重 pin）
-- 5C 批表残半：interview_job 高频改写表补表级自动清理触发参数（退避半=0175 已落·本件=调优半承接）。
-- 形：SET reloptions 仅目录项改写，零行数据改写，SHARE UPDATE EXCLUSIVE 瞬时锁，幂等可重放。
-- 回滚形：ALTER TABLE interview_job RESET (autovacuum_vacuum_scale_factor, autovacuum_vacuum_threshold, autovacuum_analyze_scale_factor);
ALTER TABLE interview_job SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_threshold = 200,
  autovacuum_analyze_scale_factor = 0.02
);
```

**参数值依据带（三值各有锚）**：
- `autovacuum_vacuum_scale_factor=0.02`：默认 0.2=20% 死元组方触发；本表 done/failed 行**永久保留**（产品码零清除语句——`rg 'DELETE FROM interview_job'` 恰 3 处全 test）→ 表单调增长 → 触发窗随 reltuples 线性恶化；2% 帽使滞后有界。
- `autovacuum_vacuum_threshold=200`：小表由阈值主导——per-owner queued 深度帽 N=3（interview-jobs.ts `:25`）+inflight 帽 1（`:20`）→ 活跃存量小，200 死元组≈分钟级窗即清理，覆盖 claim→终态的快速翻转。
- `autovacuum_analyze_scale_factor=0.02`：claim 走 ix_ijob_claim（0001 `:268`）前缀+status 谓词，高频 churn 后统计陈旧即计划劣化；与 vacuum 同步收紧保持直方图新鲜（analyze 阈值承全局 50 不另设）。
- **死元组增速估算**：单 job 生命周期 ≥3 次改写（claim/终态/可能 requeue）+运行期每 30s 心跳一拍——按 100 并发 running 计≈200 版本/分钟量级；心跳触列（lease_*）不在 ix_ijob_claim 可 HOT，但 status 翻转在索引列=非 HOT 生成**索引死元组**——提高清理频率同时收堆与索引膨胀。行宽面：payload 系小元数据（interview.service.ts `:279-282`/`:466`）属「窄行高频」型，非宽行型。
- **expand-only 论证**：SET reloptions=pg_class 目录项改写·零行数据改写·零表重写·SHARE UPDATE EXCLUSIVE 瞬时持锁不阻读写·幂等可重放（重复 SET 同值无 diff）。先例：reloptions SET 形 0094 `:53-54`（view security_invoker）在树——**表级 autovacuum 三参系仓内首例·如实登记**。PG16（docker/compose.dev.yml `:5` pgvector/pgvector:pg16）三参数全支持。

### §1.2 触面矩阵

起草期恰 **1 tracked**=本卷；EXEC 期 +1（件①迁移）=恰 **2 tracked**——零 TS 产品码·零历史迁移（0001-0210 零字节）·零 SSOT 翻面（LEDGER `:87` 原文零触·翻面权归协调方）。

### §1.3 否决（四面）

- **甲=全局 postgresql.conf 调参**：涉生产库配置域=queue-closeout §1.3-1 拒认领定谳域·越本刀码内可承载面·且全局值外溢全部表（误伤低频表多跑清理）——Ban。
- **乙=手动 VACUUM/运维脚本一次性清**：治标不治根（触发阈值未改·死元组滞留窗必然复现）·且脚本面越迁移纪律——Ban。
- **丙=pg_repack/VACUUM FULL/表重写类**：ACCESS EXCLUSIVE 全表锁+整表重写·与 expand-only 铁律反相·零证据表明需物理重组——Ban。
- **丁=扩面其余队列族同调**（ai_report/quiz_jobs/gateway_dispatch）：非本标的面·写频举证未在卷——留后继独立刀各带 pg_stat 举证。

## §2 门矩阵（EXEC 立项届树亲跑·每 prove 恰 1 次到裁决）

①`node scripts/check-migration-version-uniqueness.mjs` EXIT=0（**起草树亲测** files=210 violations=0 exemptions=0143,0152,0160·+件① 后 files=211 violations=0）；②迁移结构门 expand-only 机证：`rg -c 'DROP|DELETE|UPDATE' packages/db/migrations/0211_*.sql` 0 命中+`git diff --name-only <base>` 系纯新增文件零历史迁移触碰；③`pnpm exec turbo typecheck --force` EXIT=0 零 cached（帽面亲证：root lint cap=**5242** root package.json `--max-warnings 5242`·db cap=**1042** packages/db/package.json 同形——本刀零 TS 改动=帽值零变；turbo 包数起草期未预跑·届跑届值如实录）；④`pnpm exec turbo lint --force` EXIT=0 五值恰等；⑤`pnpm docs:check` EXIT=0（**起草树亲测** scanned=2270 ≤ cap=**2272**（scripts/ai-docs/public-text-policy.mjs `:120` MAX_FILES=2_272·fail 判据 `>MAX_FILES` `:332` 亲证）·本卷后 2271·EXEC 若迁移文件计入则 2272=恰等仍绿·届值如实录·触顶则 cap 步进归协调方裁定）；⑥markers 改动集净增行五类标记词+行首冲突标记 0 命中亲跑（本卷起草期自证 0/0）；⑦**出站两门豁免申明：本刀零模型调用零外呼零 Key 值——provider-egress 两门不适用·如实申明免跑**；⑧`git diff HEAD~1 --stat` 起草恰 1 tracked/EXEC 恰 2 tracked；⑨验收看板（非门·EXEC 落码后建议读回）：`SELECT reloptions FROM pg_class WHERE relname='interview_job'` 三参数在案+`SELECT n_dead_tup,n_tup_upd,n_tup_hot_upd FROM pg_stat_user_tables WHERE relname='interview_job'` 前后对比留痕。

## §3 裁决项（两件）

1. **拟号 0211**：EXEC 立项届树重 pin·撞号按「后到者重编号」归协调方裁定（先例=ag-c-requeue rev2 E1）。
2. **三参数值**：依据带内微调（scale_factor 0.01-0.05/threshold 100-500）授权 EXEC 就届值定·出带归协调方；analyze 臂可选行使（裁撤则收窄为两参数面·回滚形同步）。

## §5 Ban 面

历史迁移 0001-0210 零字节；零 TS 产品码·零 schema 结构变更（零列零索引零约束零函数）；全局 postgresql.conf 域零触；LEDGER/批表零翻面；⛔push ⛔merge 主线 ⛔force push ⛔pull --rebase。

## §8 停止条件与 STOP

- 停止四类（现场漂移超注记级/机制不满足/越界需要/验收红不可修）：起草期均未触发（§0 亲证·侦察卡两处勘误系锚级如实登记非结论漂移）。
- **本卷 STOP=`executed:awaiting_post_prove_dual`**（三处同值：Status 头+本节+卷尾注）·pre-exec 双审待两独立外席·Dual PASS≠开工·开工授权权归协调方·alone≠dual·Ban self-approve。
- **est live=0**（零模型外呼零 DNS 零 Key·零 env 闸零新增）·⛔push。

## §9-rev

与 §2②、§1 计数句冲突时以本节为准。

1. **门②**：执行时先去掉整行 `--` 注释，再对剩下的语句文本找 `DROP`、`DELETE`、`UPDATE`。语句里必须是 0。草图头注里的锁级别英文词是 SHARE UPDATE EXCLUSIVE，其中含 UPDATE 这三连字母；对草图整段做该检索命中 1，且只在该头注。去掉整行 `--` 注释后，剩下的语句只有 `ALTER TABLE interview_job SET` 三个存储参数，命中 0，可以在默认事务迁移里跑。头注可以保留锁级别的英文词。不要把锁级别写进语句本身。
2. **`DELETE FROM interview_job`**：产品代码 0 处。`*.ts` 里是测试里的 3 处（`apps/worker/test/adaptive-consumer.proof.ts`、`apps/api/test/validate.ts`、`apps/api/test/entpay-s2.proof.ts`）。另有一份 harness 文档 `ai-docs/delivery/harness/q2-validate-scene-fix-REQUEST.md` 引用了同一条测试 SQL（与 `validate.ts` 同句），所以全仓库不是「恰 3 处且全是测试」。单调增长的结论不变。
3. **小元数据**：是 start 入队那一段（`apps/api/src/modules/interview/interview.service.ts` `:279-282` 组装 requestId/targetRole?/focus?/sourceQuizId?，`:285` 以 kind `start` 入队），不是 turn 把整段回答写进 payload 的那一段（同文件 `turn` `:432`，`:466` 以 `{ ...body, requestId }` 入队 kind `answer`，body 含整段 `answer`）。
4. **历史提交**：提到 autovacuum 的不止起草时写的笔数（§0 写 `git log --all --oneline --grep=autovacuum` 恰 2 笔 `0a4d6901`/`b7dcce89`）。同一条检索现为 3 笔。多出来的 `9aa51852` 是文档里提到锁（`ai-docs/delivery/harness/batch5b-mig-REQUEST.md`：VALIDATE 期 SHARE UPDATE EXCLUSIVE 锁阻塞 autovacuum 时窗），不是给这张表设过存储参数。拒认领那句的原文起词是 autovacuum，不是别的字母（`queue-closeout-REQUEST.md` blob `dd0639f851e948467bffeb09c5b2f8b279086762` §1.3-1 原文起句为「autovacuum 系 DB 运维参数调优面」，§1 引文从该词末字母截成「n 系…」）。结论不变。

---
卷尾注：STOP=`executed:awaiting_post_prove_dual` 三处同值（Status 头/§8/本注）·起草落卷即停·est live=0·⛔push ⛔merge 主线 ⛔force push 未用·翻面权归协调方·alone≠dual·Ban self-approve。§9-rev 已改结构检查口径。§9-EXEC 已落码

## §9-EXEC

实际迁移号是 0213。合并后 `packages/db/migrations/` 已有前缀停在 0210，0211、0212、0213 都还没有文件，所以没有顺延。文件是 `packages/db/migrations/0213_interview_job_autovacuum_reloptions.sql`。

三参数原值：这张表此前没有表级存储参数，沿用 PostgreSQL 16 服务器默认。`autovacuum_vacuum_scale_factor` 原值 0.2，`autovacuum_vacuum_threshold` 原值 50，`autovacuum_analyze_scale_factor` 原值 0.1。本文件把三者设为 0.02、200、0.02。只改存储参数，不重写行。

去注释后的检索：先删掉整行以 `--` 开头的注释，再在剩下的语句里找 `DROP`、`DELETE`、`UPDATE`。命中 0，该命令退出码 0。剩下的语句只有 `ALTER TABLE interview_job SET` 和这三个存储参数。

各门退出码：

1. `node scripts/check-migration-version-uniqueness.mjs` 退出码 0。files=211，violations=0。
2. 去注释检索命中 0，退出码 0。相对 `origin/feat/mysql-schema-skeleton` 的文件名列表不含 0001 到 0210 的历史迁移。
3. `pnpm turbo typecheck --force` 退出码 0。8 successful，0 cached。
4. `pnpm turbo lint --force` 退出码 0。0 errors。警告数恰为 root 5242、api 1423、domain 115、ai-runtime 628、worker 959、db 1042、web 601。这些上限没有放宽。
5. `node scripts/ai-docs/check-docs.mjs` 退出码 0。扫描 2273，上限 2280，没有超过。新增受管文件只有这一份 sql。
6. 本次 diff 的五类标记词和行首冲突标记命中 0。
7. 没有跑出站清单。本改动没有模型调用。
8. `git diff --stat origin/feat/mysql-schema-skeleton` 恰 2 个 tracked 文件：这份 sql，和本文件。
