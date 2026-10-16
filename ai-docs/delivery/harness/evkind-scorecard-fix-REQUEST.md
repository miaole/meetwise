# EVKIND-SCORECARD-FIX REQUEST — interview_event.kind 值域对撞修复刀（ck_interview_event_kind 拒 'score_card_written'·0202 扩域 +1 + 目录补录恰 2 产品件·零 TS 零测试改·docs-only REQUEST 卷·起草落卷即停）

**Status**: **`closed`**（2026-10-15 卷主翻面·协调方授权批量滞后卷 Status 对账翻面·沿 ag37/ag-cost5/ha-6 状态行翻面先例·一行依据=checklist「Line evkind-scorecard-fix nail」段 :2808 已载 任务书授权链 pre-exec 双审会签 BOTH PASS→EXEC→续作收官+nail merge @`0b88d2fe`（对 HEAD `git merge-base --is-ancestor` 亲证 EXIT=0）——原 `executed:awaiting_post_prove_dual` 系滞后登记 · est live=0 · Ban self-approve · alone≠dual · ⛔push）

**席位**：EVKIND-SCORECARD-FIX 起草席（诊断+起草双责·协调方派·perf-prep 门矩阵 2026-10-14 首曝红立靶）。
**基线**：`feat/mysql-schema-skeleton` @ `6ca9f3e7`（fetch 后 origin tip 同指亲证·docs:check 2109≤cap 2112 本树亲跑）· 分支 `line/evkind-scorecard-fix`（建前 `git branch --list "line/evkind*"` 零同名命中·本席 `git worktree add ../meetwise-evk -b line/evkind-scorecard-fix feat/mysql-schema-skeleton` 亲立·HEAD 落 `6ca9f3e7` 亲证）· 工作树 `meetwise-evk`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/meta/index.md` → `ai-docs/architecture/backend/domain-events-catalog.md`（件② 落点·权威目录）→ `ai-docs/rules/global/production-invariants.md` → `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（形制范本·§0-§8/停止条件四类/Ban-pins 形制沿承）→ 红靶收据 `git show 77091bad:receipts/perf-prep/2026-10-14-nail-prep.md`（line/perf-prep @`77091bad`·worktree 共享对象库可解析·门3 RED+溯源节）→ 涉事迁移 `packages/db/migrations/0103_scoring_deterministic_aggregation.sql`/`0192_interview_event_created_at_kind_check.sql`/`0100_scoring_fact_root.sql`/`0109_scoring_evidence_conflict_uncertainty.sql`/`0149_money_status_constraints.sql`（熔单先例）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①perf-prep nail-prep 收据（出处见必读清单·门3=interview:prove:raw EXIT=1·18 PASS 后 23514 `ck_interview_event_kind` 拒 `'score_card_written'`·溯源节=0103 :286 写点 vs 0192 值域主线树内自相矛盾）；②协调方派单 brief（2026-10-14·EVKIND-SCORECARD-FIX 战役·三写点+0192+目录三方对撞指派·修法三择一裁决授权起草席）；③结构范本=出处必读清单 negbend 卷。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg/sed/git hash-object 实测 @`6ca9f3e7`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 27 树实测（主仓+26 支线树）——无第二 evkind 同名树；`git branch --list "line/evkind*"` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | rg evkind` 建前零命中→落卷后唯一同名卷=本卷。
- **EXEC 立项日复测（并线 c830405f 树·2026-10-15）**：`git worktree list`=30 树·evkind 命中恰 1=本树；`git branch --list "line/evkind*"` 恰 1=本分支；harness 目录 evkind 恰 1=本卷。防重零触。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀产品触面=恰 2 件（新迁移 0202+`ai-docs/architecture/backend/domain-events-catalog.md`）。届时对各在飞分支执行 `git log -1 -- ai-docs/architecture/backend/domain-events-catalog.md` 逐树复核（新迁移为 A 新文件无撞面·目录 .md 是唯一共享触面），任一分支顶对该文件存在主线 `6ca9f3e7` 之后的新增提交→触停止条件「现场漂移」停手上报。
- **在飞交叠复核执行记录（EXEC·c830405f 树）**：全部远程分支逐树 `git log -1 -- <目录文件>` 复核——在飞 `line/*` 族全数 last-touch=`ba8fdd78`（merge-base 内·零触）；命中 AFTER-BASE 者仅 11 支陈旧分支（`cursor/bailian-fail-closed-audit-b89b`/`cursor/interview-answer-dual-write-fence-0730`/`feature/ecs-*` 三支/`feature/governance-history-*` 三支/`feature/fix-preview-archive-validation`/`feature/preview-absent-web-stop`/`feature/public-release`）——其 last-touch 提交日期 2026-08/09、behind 主线 2025~2162 commit、非本战役在飞刀（与主线目录差异=旧基线未并所致非新增工作）→非「在飞新增提交」·停止条件零触。

### 0.1 blob 锚表（`git hash-object` 亲算 @`6ca9f3e7`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `packages/db/migrations/0103_scoring_deterministic_aggregation.sql` | `3e3987c1`（355 行） | **`:99` `scoring_write_final_score_card(uuid,uuid,jsonb,text)` def·`:242-244` CAS claimed/dispatched→scored·`:252-261` score_card INSERT·`:284` `pg_advisory_xact_lock(hashtext(interview_id))`·`:285` INSERT interview_event·`:286` kind 字面 `'score_card_written'`·`:291` event_key `'score_card_written:'\|\|card_id`·`:298` GRANT EXECUTE scoring_worker_executor**（EXEC 重 pin 修正：CAS 原锚 `:262-267`→`:242-244`·score_card INSERT 原锚 `:268-277`→`:252-261`·席1 P2 亲证 blob 恒等仅行锚误） |
| `packages/db/migrations/0192_interview_event_created_at_kind_check.sql` | `27b4c39d`（51 行） | **`:8-18` 值域=闭合 19 值头注（自述「裁决③权威=domain-events-catalog.md+生产写点全量 rg 实测」·溯源引 interview-signal-conclude.ts:13+generation-progress.ts:14 两 TS 件）·`:22-37` 前置存量 fail-loud DO 块（值域外非 0 即拒跑不洗·SELECT NOT IN `:26-32`·RAISE `:33-35`）·`:42-49` ADD CONSTRAINT ck_interview_event_kind CHECK 19 值 NOT VALID（19 值枚举 `:44-49`）·`:51` VALIDATE**（EXEC 重 pin 修正：头注原锚 `:9-16`→`:8-18`·DO 块原锚 `:27-40`→`:22-37`·CHECK 原锚 `:43-50`→`:42-49`·blob 恒等仅行锚误） |
| `packages/db/migrations/0100_scoring_fact_root.sql` | `d88b2910`（1031 行） | **`:769` `scoring_record_score_card` def·`:890` INSERT interview_event·`:891` kind 字面同值·`:902` GRANT executor**（SCOR-01 legacy 写卡路径·TS 包装 `recordScoreCard`=`packages/db/src/scoring/scoring-fact-root.ts:171`·生产调用零命中仅 scor-01 测试触） |
| `packages/db/migrations/0109_scoring_evidence_conflict_uncertainty.sql` | `2fe4eca9`（527 行） | **`:200` `scoring_adjudicate_score_card(uuid,uuid,jsonb,jsonb,boolean)` def·`:511` INSERT interview_event·`:512` kind 字面同值·`:527` GRANT executor**（SCOR-03 冲突裁决路径·生产调用零命中·`score-writer.ts:21` 注释自证冲突面接线随 EXTREV-4 落） |
| `packages/db/migrations/0149_money_status_constraints.sql` | `cec80b94`（83 行） | **`:16-18` 熔单 ALTER 形注记（DROP+ADD NOT VALID 单语句原子·无裸 DROP 窗·VALIDATE 后行独立短事务）·`:48-50` 熔单先例原文**——件① 语句形制先例 |
| `packages/db/src/scoring/scoring-aggregation.ts` | `6b1cf675`（113 行） | **`:63` writeFinalScoreCard def·`:68` `SELECT * FROM scoring_write_final_score_card($1,$2,$3,$4)`——简报所指生产调用点·`:6-8` 头注自证「聚合只读 score_card·legacy answer_evaluated.score 结构性不参与」** |
| `apps/worker/src/score-writer.ts` | `fcb93f6d`（126 行） | **`:63` writeScoreCardAfterProjection def·`:71-77` fence 复核（`:71` privacyActive 查询·`:72-75` fence 分支）→`:80` claim（claimScoreRequest 单次 CAS）→`:102` writeFinalScoreCard 调用·`:118-125` writeScoreCardAfterProjectionFenceTolerant（`:121-124` try/catch·`:33-34` isPrivacyFenceCode 只捕 `interview_privacy_fenced`/`interview_answer_fact_fenced` 两码·`:124` 其余如实上抛·23514 必上抛）**（EXEC 重 pin 席1 P2 亲证：原锚 `:81-128`/`:97-103`/`:110-117` 行位误·原 `:131-140` 段越 EOF 删·blob 恒等） |
| `apps/worker/src/adaptive-lifecycle.ts` | `1e6129ed`（609 行） | **`:493` 写卡门=`d.scoreWriterLeaseOwner && !unscored && !clarifying && typeof last.score==='number'`·`:496-502` writeScoreCardAfterProjectionFenceTolerant 调用（answer-job drain 内·投影事务提交后 markJobDone 前）**（EXEC 重 pin 修正：调用原锚 `:495-502`→`:496-502`·blob 恒等仅行锚 ±1） |
| `apps/worker/src/interview-consumer.ts` | `27ddbcf1`（657 行） | **`:463` `scoreWriterLeaseOwner: d.leaseOwner`（job 级 worker 身份接线·生产链源头）** |
| `apps/worker/test/interview.proof.ts` | `645ec783`（556 行） | **`:25` import writeScoreCardAfterProjection·`:261` 首触发（红点·perf-prep 收据同锚）·`:307` count 查询 kind='score_card_written'·`:323` 断言「写卡同事务原子追加…（0103 原语④）」·`:326/:417/:520` 重放调用** |
| `packages/db/test/scor-01.proof.ts` / `scor-02.proof.ts` / `scor-03.proof.ts` / `scor-parity.proof.ts` / `growth.proof.ts` | `333ff918`(455) / `649c25d1`(543) / `01f781e7`(491) / `d61d0e22`(617) / `7512b481`(231) | 五套件头注自证「跑在 run-e2e-isolated.mjs 起的临时 Postgres（**完整迁移**+nonce 校验）」→ 主线链（含 0192）上对三写点 by-mechanism 同红；断言形「写卡同事务原子发出/追加 score_card_written 事件（原语④）」=`333ff918 :210`/`649c25d1 :203`/`01f781e7 :245` 等 |
| `ai-docs/architecture/backend/domain-events-catalog.md` | `31bfacf8`（73 行·EXEC 立项 pin·件② 落卷后 `b4155710` 75 行） | **`:57` SSE 业务事件注记（InterviewEvent 有序流·worker 写 api 订阅转发）·`:59` session_concluded inline 条目·`:61` interview_unavailable inline 条目——件② 补录落点=`:61` 之后 `## 3.`（`:63`）之前新起一条 blockquote**·EXEC 立项时全卷 score_card_written 零命中（rg 亲证·仅 ai-docs/delivery/receipts 两旧 log 词面）（EXEC 重 pin 席1 P2 亲证：session_concluded 原锚 `:58`→`:59`·interview_unavailable 原锚 `:59`→`:61`·blob 恒等仅行锚误） |
| `scripts/run-e2e-isolated.mjs` | `e69e317a`（3189 行·并线 c830405f 漂移·原 `f986c56b` 3166 行） | **`:680-701` interview:prove:raw 注册（watch 名单含 scoring-aggregation.ts 等）·`:1809/:1824/:1842/:1858/:1875` scor-01/parity/02/scor03/growth 注册·`:2401-2402` scoring-integrity→`pnpm -C apps/worker prove:scoring-integrity`·`:2517-2525` scor 族命令映射（`pnpm -C packages/db prove:scor-01/02/03` 等）**（漂移源=主线 tokstream-s4b 注册零触本刀面·blob 漂移行号随并线重 pin） |
| `package.json`（根） | `3b04b871`（675 行·续作收官并线 5bd92ce8 漂移·`35611a1f`=并线 c830405f 值·初值 `f9755fa2` 669 行） | `:271` interview:prove→interview:prove:raw·`:495` scoring-integrity:prove（两行号恒等零漂·blob 随并线漂移）·**续作重 pin 亲证：`:8` lint 预算随并 5224→5235=承登红②（root 5235>5224）自动消偿翻绿·计数恰等** |

### 0.2 派单简报核实登记（结论零变·如实补全）

1. 简报「0103:286 函数写 kind='score_card_written'」准确（`:286` 字面行亲证）；**补全**：同值写点实为三处非一处——0100 `:891`（scoring_record_score_card）+0109 `:512`（scoring_adjudicate_score_card）rg 全量补齐；同一修复面（扩域 +1 一次覆盖三写点）零额外施工。
2. 简报「生产链 scoring-aggregation.ts:68 仍在调」准确，且上游实触链完整闭合（§1.2·生产实触非仅测试）。
3. 简报「0192 值域闭合 19 值不含该值」准确（`27b4c39d` `:43-50` 逐值亲点 19 值·零 score_card_written）；「目录零该条目」准确（`31bfacf8` 全卷 rg 零命中）。
4. 简报「主线 DB 上该写路径必炸」机制成立且**强于简报口径**：CHECK 违约抛在函数体 `:285` INSERT 处→整个写卡事务回滚（§1.3）——非仅事件丢失。

### 0.3 迁移号登记（预期恰 1 新迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**201**·头 `0201_qbank_fusion_owner_rank_org_dedup.sql`（本树亲证）。
- **EXEC 立项日复测（并线 c830405f 树）**：`ls packages/db/migrations | wc -l`=**201**·头 `0201_qbank_fusion_owner_rank_org_dedup.sql` 恒等——并线零新增迁移·0202 未占·**占号成立**。
- 本刀占位号=**0202**（`0202_interview_event_kind_score_card_written.sql`）。协调规则：EXEC 立项日对届时主线链顶 `ls packages/db/migrations` 亲数+在飞分支题面复核后取最小未占号顺延（零硬编码·沿 AG39 改占勘误/5B 链顶 0187+cost4 占 0188 先例）·Ban 抢号 Ban 私占·若届时 0202 已被占→按亲数取下一个最小未占号并全卷同步改锚（停止条件「现场漂移」零触·属认领规则内动作）。

## §1 红事实（机制链·全部亲证 @`6ca9f3e7`）

### 1.1 对撞三方

- **方一（写点·三处）**：`0103:285-291`（主写点·本刀简报靶）+`0100:890-896`+`0109:511-517`——三函数同构：score_card 落库同事务内 `pg_advisory_xact_lock`+`MAX(seq)+1` 向 interview_event 追加 kind=`'score_card_written'`（载荷 cardId/questionId/rubricVersion/measurementVersion/status/deterministicTotal·event_key=`'score_card_written:<cardId>'` 幂等键）。SECURITY DEFINER·EXECUTE 授 scoring_worker_executor（`0103:298`/`0100:902`/`0109:527`）。
- **方二（值域闭合）**：0192（主线 `7152cd3c` BATCH5B-MIG 落·commit 文亲证「0192 interview_event created_at+kind CHECK 19 值闭合（裁决③）」）`:43-51` CHECK 19 值+VALIDATE·`:27-40` fail-loud DO 块保零值域外存量。**根因=溯源面漏采**：`:9-16` 头注自述「生产写点全量 rg 实测·逐值溯源」，所引溯源件全为 TS（interview-signal-conclude.ts/generation-progress.ts）——migrations 内 SECURITY DEFINER 函数体三写点漏采→值域与既有生产写点主线树内自相矛盾。
- **方三（目录零登记）**：权威目录（裁决③）`31bfacf8` 全卷零 score_card_written 条目——目录与 0192 同权威同漏·两造一致地漏录该 kind。
- **红观测**：perf-prep 门矩阵 2026-10-14（union 树 `4710e80d`·含 0192）interview:prove:raw EXIT=1·**18 PASS 后 23514 check_violation `ck_interview_event_kind`**·隔离收据与 `/tmp/perfp-interview-nailprep.log` 在卷（收据门3 表+溯源节逐字）；三工件 `git diff 148cf83b HEAD` 空亲证=主线 tip 逐位必现；BATCH5B 门矩阵（uniqueness/migrate/drift/db:prove/db-acl/db-intfk）不含 interview:prove→主线继承未登记红首次曝光。

### 1.2 上游调用链与实触性（生产实触判定=实触）

```
interview-consumer.ts:463  scoreWriterLeaseOwner: d.leaseOwner      （answer-job drain 接线·job 级 worker 身份）
  → adaptive-lifecycle.ts:493  门=scoreWriterLeaseOwner && !unscored && !clarifying && typeof last.score==='number'
  → adaptive-lifecycle.ts:495-502  writeScoreCardAfterProjectionFenceTolerant(…)
  → score-writer.ts:71-80  fence 复核→asScoringWorkerPrincipal 事务 claim（复用 lease_token）
  → score-writer.ts:102 → scoring-aggregation.ts:63,68  writeFinalScoreCard
  → SELECT scoring_write_final_score_card($1,$2,$3,$4)（0103 :99 def）
  → 0103 :285-291  INSERT interview_event kind='score_card_written'   ←23514 在此抛
```

- **触发业务行为**：每条 0092 账本家族 adaptive 面试**答案提交后的 drain 写卡步**（投影事务提交后、同一 drain、markJobDone 前·`score-writer.ts:8-10` 注释自证接线位）。**生产实触**（worker 常驻 drain 链·非仅测试触）——候选(c) 死码清除直接出局。
- **测试触面**：interview.proof（`:261/:293/:326/:417/:520` 五调用点）+scor-01（0100 面）+scor-02（0103 面）+scor03-evidence-conflict（0109 面）+scor-parity/growth（混合）——五套件跑隔离 PG 完整迁移链（`333ff918` 头注自证）→主线链上 by-mechanism 同红（修复前未跑·修复后门矩阵直证翻绿）。
- **旁证面（免疫亲证·非本刀门）**：`db:prove`（`packages/db/proof/primitives.sql:21-27`）自建最小 interview_event 表（零 CHECK）→对 0192 免疫；`scoring-integrity:prove`（`7bd95540`·23 PASS）不触三写点→主线绿恒等。

### 1.3 受影响面（23514 的业务后果·若不修）

CHECK 违约抛在 `scoring_write_final_score_card` 函数体 `:285` INSERT 处→**整个写卡事务回滚**：score_card INSERT（`:252-261`）+score_evidence/score_card_criterion 逐条 INSERT+score_request CAS→scored（`:242-244`）全滚→score_request 滞留 claimed/dispatched。后果链：①权威计分卡（ScoreCard=唯一计分权威·`6b1cf675 :6-8` 头注自证 legacy 分结构性不参与）永不落库；②`aggregateInterviewScores`（`6b1cf675 :83-98`）eligible_card_count 恒 0→C 端评分聚合/报告消费链死（报表/积分面）；③worker 侧 23514 非 fence 码→`fcb93f6d :118-125`（`:124`）如实上抛→drain 失败→job at-least-once 重投循环。**性质=主业务写路径整体断·非仅审计事件丢失**。（EXEC 重 pin：CAS/INSERT/上抛三处行锚随 §0.1 席1 P2 修正同步）

### 1.4 修法三择一裁决：**采 (a) 0202 扩域 +1 + 目录补录**

- **(c) 死码清除·出局**：§1.2 生产链实触（interview-consumer 常驻 drain 接线）非死码——事实不符。
- **(b) 停写/改映射·双路出局**：①停写=砍已登记交付契约——「写卡同事务原子追加 score_card_written 事件（原语④）」由五套件断言承载（`645ec783 :323`/`333ff918 :210`/`649c25d1 :203`/`01f781e7 :245`/scor-parity 同形）且 0100/0103/0109 三函数头注+SCOR-01/02/03 收据在卷=契约本体，砍事件=为绿改契约（negbend-fix §1.3 候选丙同类·Ban 沿承）；②改映射到值域内最近值 `answer_evaluated`=语义混淆——answer_evaluated 是 worker TS 侧进度 hint 事件（hint 分结构性不参与计分权威·`6b1cf675 :6-8` 自证）vs score_card_written 是 DB 侧权威评分事实·dedupe 键独立（`'score_card_written:<cardId>'`）——两事件生产方/载荷/幂等键三不相容。
- **(a) 采·四理由**：①写路径合法生产实触（§1.2）；②0192 溯源面漏采 SQL 函数体系机制性根因——扩域=补全溯源·非改契约；③expand-only 零洗数据——0192 `:27-40` fail-loud 已保零值域外存量·加值对存量行不可能新增违约（CHECK 收紧才需前置检测·放宽不需要）；④目录登记义务——catalog §2 自述「新增模块间交互必须先在此登记事件」·补录溯及既往闭合「目录↔值域↔写点」三角一致。

## §1-修法（预期恰 2 产品件 + 收据·零 TS 零测试文件改动）

- **件①（迁移·全文规格钉定）**：新文件 `packages/db/migrations/0202_interview_event_kind_score_card_written.sql`（号沿 §0.3 认领规则）·`-- @migration-mode multi-statement`（0192/0149 同mode·migrate.ts:591 亲证解析）·**恰 2 语句**：语句1=熔单 ALTER（`DROP CONSTRAINT IF EXISTS ck_interview_event_kind, ADD CONSTRAINT ck_interview_event_kind CHECK (kind IN (<19 值逐字承 0192 :44-49>+'score_card_written')) NOT VALID`——0149 `:48-50` 熔单先例·单语句原子无裸 DROP 窗·短 ACCESS EXCLUSIVE 不扫存量）；语句2=`VALIDATE CONSTRAINT ck_interview_event_kind`（独立短事务·SHARE UPDATE EXCLUSIVE）。语句体逐字如下（EXEC 照抄·文件头注释可微调·**Ban 前置 DO 块**（放宽不需检测·加则超规格）·Ban 改约束名·Ban 19 值列表漂移·Ban 洗数据）：

```sql
-- 0202_interview_event_kind_score_card_written.sql — EVKIND-SCORECARD-FIX · ck_interview_event_kind 值域扩容 +1
--
-- @migration-mode multi-statement
--
-- 对撞修复（perf-prep 2026-10-14 nail-prep 收据首次曝光·主线 7152cd3c 落 0192 时值域溯源
-- 面仅 TS 写点、漏采 migrations 内 SECURITY DEFINER 函数三写点 0100:891/0103:286/0109:512）：
-- interview_event.kind 值域补 +1 'score_card_written'——权威评分事实事件（写卡同事务原子
-- 追加·生产链 interview-consumer.ts:463→adaptive-lifecycle.ts:493→score-writer.ts:102→
-- scoring-aggregation.ts:68 实触）。扩域 expand-only：0192 fail-loud DO 块已保零值域外存量，
-- 放宽对存量行不可能新增违约→零前置检测零洗数据。
-- 2 语句 = 1 熔单 ALTER（DROP+ADD NOT VALID 单语句原子无裸窗·0149:48-50 先例）+ 1 VALIDATE。
-- 19 值列表逐字承 0192:44-49·约束名不变。

ALTER TABLE interview_event
  DROP CONSTRAINT IF EXISTS ck_interview_event_kind,
  ADD CONSTRAINT ck_interview_event_kind
  CHECK (kind IN (
    'question_ready','answer_evaluated','answer_unscored','clarification_needed',
    'report_ready','report_unavailable','interview_unavailable','assessment_unavailable',
    'session_concluded','progress','section_ready','rewrite_ready','diagnosis_ready',
    'diagnosis_unavailable','quiz_ready','quiz_unavailable','generation_started',
    'model_first_token','generation_progress','score_card_written')) NOT VALID;

ALTER TABLE interview_event VALIDATE CONSTRAINT ck_interview_event_kind;
```

- **件②（目录补录·恰 1 条 inline 目）**：`ai-docs/architecture/backend/domain-events-catalog.md` §2 注记块 interview_unavailable 条目行（`:59`）之后、`## 3. outbox 拓扑` 之前新起一条 blockquote inline 条目（session_concluded/interview_unavailable 同形）·必含七字段（缺一即断言红）：①性质=权威评分事实事件·写卡同事务原子追加（原语④）·与 score_card 行同事务同生共滚；②生产方=三 DB 函数（`scoring_record_score_card` 0100:891/`scoring_write_final_score_card` 0103:286/`scoring_adjudicate_score_card` 0109:512·SECURITY DEFINER·EXECUTE scoring_worker_executor）；③消费方=零直读（全仓非测试 rg 零命中亲证）·随 SSE 网关按流透传；④载荷要点=cardId/questionId/rubricVersion/measurementVersion/status/deterministicTotal；⑤dedupeKey/event_key=`score_card_written:<cardId>`（同卡重放零重复）；⑥流=interview（stream_key=interviewId·pg_advisory_xact_lock+MAX(seq)+1 单调 seq）；⑦值域入册注=0192 初闭 19 值时溯源面仅 TS 写点漏采函数体·0202 扩域 +1 补录（指向本卷）。**Ban 改目录既有行 Ban 动 §2 登记表十行**。
- **件③（改前必做 run + 收据）**：①改前本树实跑恰一次 `node scripts/run-e2e-isolated.mjs interview:prove:raw`（不计 prove·取红名单+23514 红点行为门1 diff 分母·沿 negbend rev2 必做条款）；②收据 `receipts/evkind-scorecard-fix/00-exec.md`（**仓根 receipts/=非受管根·零 docs:check 增量**·沿 perf-prep 2026-10-14 nail-prep tracked 先例）七字段：门矩阵全表 EXIT 原值+改前改后 PASS 名单 diff+diff numstat+重 pin 全表+偏离清单+pins 零翻声明+改前红点摘录。

## §2 验收断言（pre-exec 双审核对单基面·门矩阵十一门·**数字口径以实跑实测为准·各行熔断阈值即停止条件「验收红不可修」触发面**）

1. **interview:prove:raw 翻绿**：`node scripts/run-e2e-isolated.mjs interview:prove:raw` EXIT=0·改前改后 PASS 名单 diff=改前红点（`:261` 写卡臂）后段全翻·改前 18 PASS 前缀零弱化（分母=件③改前 run 本树名单·对 perf-prep 收据 18 前缀交叉对齐）·`:323` 断言 PASS 在名单。
2. **scoring 邻面翻绿/不回退**：`scor-01:prove:raw`/`scor-02:prove:raw`/`scor03-evidence-conflict:prove:raw`/`scor-parity:prove:raw`/`growth:prove:raw` 五套 EXIT=0（修复前 by-mechanism 红·翻绿=三写点修复直证）；`node scripts/run-e2e-isolated.mjs scoring-integrity:prove` EXIT=0 **23 PASS 恒等**（对 perf-prep 门2 基线·PASS 数≠23 即停承登）。
3. **migrate:prove**：`pnpm migrate:prove` EXIT=0·链头实测=本刀认领号（预期 0202·届时链顶顺延如实记）。
4. **drift:prove 零漂移**：`pnpm drift:prove` EXIT=0·豁免 2 项恒等——drift 只对账 UNIQUE/PK（`scripts/schema-drift-check.mjs:63-66` 亲证 CHECK 不入对账面·扩域理论零扰动）；若红→停承登 Ban 自改基线。
5. **migration uniqueness**：`node scripts/check-migration-version-uniqueness.mjs`→`files=202 violations=0 exemptions=0143,0152,0160`（files 对届时链顶亲数·violations 恒 0）。
6. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached 口径沿 SSOT 门矩阵）。
7. **lint 三值恰等+worker 观察**：`pnpm turbo lint` 12 任务全 0 errors·web **601**/root **5224**/api **1421** 三值恰等（届时实跑为准·任一超即停承登）+worker **950** 观察恒等（主线 `6f2be138` 口径·基线 6ca9f3e7 为 docs-only 零码变更）——超即停承登·Ban 顺手消偿。
8. **docs:check（红停条款）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·**≤cap（>cap 即红停上报·cap 上抬权归协调方）**·**EXEC 口径三分（并线 c830405f 后重 pin·起草口径 2109/cap 2112 随主线 tokstream-s4b sanction 漂移——`public-text-policy.mjs:63-65` cap 2112→2120 亲证）**：基线（merge 树净·移出件① A/B 实测）=**2118**·落卷（件①+件②+本卷笔改后本树亲跑 EXIT=0）=**2119**（件① .sql 确入扫面 +1 A/B 亲证）·投影=**2119 ≤cap 2120·余 1 贴边如实承登**·收据在仓根 receipts/ 非受管根零增量。
9. **markers 零命中**：本刀改动集（件① .sql+件② .md+本卷 .md+收据）新增行五类标记词 grep 零命中（词族沿 i6-239 门口径·词面不复抄卷内防自指·命令与回执入收据）。
10. **diff 面机检**：`git diff --numstat <base>` **恰 3 tracked 路径**=件① .sql（A）+件② .md+本卷 .md（+收据目录 untracked 仓根非受管根口径）——多任何 tracked 路径即停（越界需要类）。
11. **卫生**：`pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 双向记录·`actualSpendCny=null`·est live=0（prove 全离线隔离 PG·零模型外呼）。

## §3 范围外（边界清单·越界即 FAIL）

1. **TS 码面零触**：scoring-aggregation.ts/score-writer.ts/adaptive-lifecycle.ts/interview-consumer.ts 及全部 .ts 零字节改——修复面纯 DB 值域+目录·写路径代码本形正确。
2. **测试文件零触**：五套件 proof 文件+blob 前后全等（§0.1 五 blob 锚）——断言本体承载原语④契约·「为绿改断言」Ban（negbend 候选丙沿承）。
3. **已应用迁移零触**：0192/0100/0103/0109 本体零改（Ban 重写应用史）；0192 头注 19 值枚举的历史性不追溯修正（0202 头注担纲勘误记载）。
4. **run-e2e-isolated 注册行零触**：主线 7152cd3c 新增迁移零触此行先例+perf-prep 两红/绿亲跑实证无 skip 面（注册行非缓存键）。
5. **共享 SSOT 零改**：backlog/checklist/LEDGER/north-star 只读引用——interview RED 红登记行翻面权归协调方 nail。
6. **迁移恰 1 件**：Ban 第二迁移 Ban 顺手扩面——EXEC 期若 rg 复查发现第二个 off-vocab kind 写点→停上报（Ban 就地扩号修）。

## §4 依赖

**①上游已满足**：0192（`7152cd3c` 在链）+三写点（0100/0103/0109 在链）=对撞两造在树；perf-prep 收据=红靶确认。**②无同文件并发**：产品触面=新文件 0202+目录 .md——§0.0 在飞交叠复核规则 EXEC 立项日必做。**③迁移号**：§0.3 占位 0202·认领规则在卷。**④下游**：interview RED 红登记行翻面+scor 五套件主线基线红注销归协调方 nail/批边界；perf-prep 门6 lint 双 +1（root 5225/worker 951）系该支线本地值·主线 tip `6ca9f3e7` 口径（web 601/root 5224/api 1421/worker 950·`6f2be138` 门读数·其后 docs-only 零码）与本刀门7 分母无涉（分叉如实登记）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（改前/改后 run 恰各一次·红不重跑冲销）；Ban 改测试文件/断言（§3-2）；Ban 触 TS 码面（§3-1）；Ban 触已应用迁移本体（§3-3）；Ban 改约束名/19 值列表漂移/前置 DO 块超规格（§1-修法件①）；Ban 洗数据；Ban 第二迁移/顺手扩面（§3-6）；Ban 触 run-e2e-isolated 注册行（§3-4）；Ban 改共享 SSOT（§3-5）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（EXEC 期 prove 全离线隔离 PG·零模型外呼·§2-11 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·回执随 EXEC 收据留痕·五类词不复抄卷内防自匹配——沿 negbend/g7w 卷 §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本 commit 不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）；③EXEC 立项**不得改 §1.4 裁决 (a) 与 §5 Ban/pins 与 §1-修法件①② 施工面规格**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·迁移号按 §0.3 认领规则重核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且结论受疑（0192 CHECK 实文变/三写点消失或改 kind/`scoring-aggregation.ts:68` 调用形变/目录既有行变/链顶实测后 0202 已被占且认领规则不可达）→停·重 pin 回炉。
- **机制不满足**：件①② 落卷后改后 run 五套件任一未翻绿或红点机制与 §1.1 推定形不符（非 23514 `ck_interview_event_kind` 形）→根因诊断被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出件①② 恰 2 件面（需触 TS/测试/已应用迁移/第二迁移/注册行/SSOT/第二 off-vocab 值）→停·另刀或协调方裁决（§1.4 (b)(c) 否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻套件新红/lint 三值+worker 任一超/docs:check>2112/drift 红/uniqueness violations>0）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 EXEC 记录（2026-10-15·EXEC 施工席落卷）

**工序**：①`git fetch`+`git merge --no-ff feat/mysql-schema-skeleton`@`3b32b6c8`→merge **`c830405f`**（merge-tree 预演 EXIT=0 tree=`bd80175a`·冲突解=∅ 零 union 手解·⛔pull --rebase 未用）；②§0 全量重 pin（15/17 blob 恒等·2 blob 并线漂移随重 pin=`run-e2e-isolated.mjs` f986c56b→e69e317a·根 package.json f9755fa2→35611a1f）+席1 P2×7 随 pin 落锚（0103 CAS `:242-244`/score_card INSERT `:252-261`·score-writer `:63`/`:71-77`/`:80`/`:102`/`:118-125` 删越 EOF `:131-140` 段·目录 `:57`/`:59`/`:61`/`## 3.`=`:63`·0192 头注 `:8-18`/DO 块 `:22-37`/CHECK `:42-49`·adaptive-lifecycle 调用 `:496-502`±1·漂移全表=收据 §8）；③改前 run（五 attempt·前四 boot 段环境失败如实登记=磁盘满 43.66GB 死卷 prune+本树 node_modules 缺 `pg` 致宿主探针假败·修复后第五次成跑=唯一红测量）**18 PASS→23514 `ck_interview_event_kind` 拒 'score_card_written'**（抛点链 proof:261→score-writer:102→aggregation:64·与 §1.2 推定形全符·机制满足）；④件① `0202_interview_event_kind_score_card_written.sql`（链顶复测 201·头 0201·0202 未占占号成立·SQL 与 §1-修法规格 diff 逐字恒等·恰 2 语句机检·@migration-mode multi-statement）；⑤件② 目录补录恰 1 blockquote inline 目七字段齐（:61 后 ## 3.(=:)63 前·+2/-0 纯增既有行零触碰·落卷后 blob `b4155710` 75 行）。

**门矩阵**：interview:prove:raw **翻绿 EXIT=0 57 PASS**（改前 18 前缀零弱化 comm 亲证+39 翻·`:323` 原语④断言 PASS·零 23514）+scor 五套件全绿（64/65/64/57/31 PASS）+migrate:prove EXIT=0 链头 0202 认领+drift EXIT=0 零漂+uniqueness **files=202 violations=0** exemptions 恒等+typecheck **8/8 0 cached**+docs:check EXIT=0 三分口径=基线 2118（A/B 实测）/落卷 2119/≤cap 2120 余 1（cap 2112→2120 主线 sanction `public-text-policy.mjs:63-65` 亲证·件① .sql 入扫面 +1 A/B 亲证）+markers 五类零命中（40 新增行直扫 EXIT 全 1）+diff 恰 3 tracked 路径（件① A+件②+本卷·收据 untracked 非受管根口径）+卫生 install --frozen-lockfile EXIT=0 零 lockfile 改。lint：web 601/api 1421/worker 954/ai-runtime 628/db 1042/domain 115/contracts 265/ai-graphs 47/qdrant 27 全恰等恒等（worker 观察值 950→954 系主线 tokstream sanction 随重 pin 更记）。

**STOP=`stopped:exec_red_gate_baseline`（沿 AG38/tokstream `stopped:exec_red_gate_budget` 先例·Status 不落 executed·翻面权归协调方）——红两笔如实承登**：①**scoring-integrity:prove EXIT=1 PASS=10（预期恒等 23）**——stash A/B 基线亲证同红同形（净并线树 c830405f 同断言 `scoring-report-integrity.proof.ts:116:50` TypeError `Object.hasOwn`·`token_stream_reconcile frames=0` 指纹·PASS=10）=非本刀两产品件引入（零 TS 零测试改·CHECK 扩域无此接触面）·属并线窗新基线红（tokstream 窗触 interview-service/adaptive-interview-service/token-stream/sse-pump·其门矩阵不含 scoring-integrity 故未曝·其既登 TS-P1=tokenstream:prove ask 臂系不同 proof 不同断言·本红超其既登清单）·精确归因窗非本刀范围 Ban 就地追修留协调方；②**root lint 实测 5235>预算行 5224 → root 任务 EXIT=1**——主线既登承登红（`dd8f58a6` commit 文亲证「sanction 5224→5235·预算行未随落行勿自升承登」）·本刀零 TS 零词面新增 +0·Ban 自调预算行沿承。其余九门全绿·本刀产品件面自身零红。

**偏离五笔**（全数登记·详见收据 §9）：①门 2f 红 STOP 承登（§9 上段）②root lint 承登红 ③改前 run 四次 infra 失败后第五次成跑（非红重跑冲销·boot 段未达测量面·环境修复=docker volume prune 死卷 43.66GB+pnpm install 即门 11）④收据 untracked 交付（门 10 机械恰 3 tracked 路径·tracked 翻面权归协调方）⑤worker 954 口径随主线 sanction 更记。**turbo daemon 串根事故登记**：同仓姊妹 worktree（meetwise-s4b）致 turbo 2.10 首跑任务 cwd 串根（298 外树路径）·`daemon stop`+`TURBO_DAEMON=false --force` 净跑复验（1239 路径全本树·计数恒等）·多 worktree 战役共性风险归协调方知悉。est live=0 · markers=0 · pins 十一值零翻 · ⛔push。

收据：`receipts/evkind-scorecard-fix/00-exec.md`（仓根非受管根零 docs:check 增量·untracked 交付）。

---

*EVKIND-SCORECARD-FIX REQUEST · 2026-10-14 起草 · 2026-10-15 EXEC 落卷（§9）· **`stopped:exec_red_gate_baseline`**（沿 AG38/tokstream 先例·红两笔承登=①scoring-integrity 基线红 stash A/B 亲证非本刀面②root lint 主线既登承登红·其余九门全绿·翻面权归协调方）· base 并线 `feat/mysql-schema-skeleton` @`3b32b6c8`→merge `c830405f`（零冲突）· 分支 `line/evkind-scorecard-fix` · 工作树 `meetwise-evk` · 红根因=0192 值域溯源面漏采 migrations 内 SECURITY DEFINER 函数体三写点（0100:891/0103:286/0109:512）→值域闭合与生产写点树内自相矛盾→23514 整事务回滚 · 裁决=(a) 0202 扩域 +1（expand-only·熔单 ALTER+VALIDATE 两语句·0149 先例形·19 值逐字承 0192:44-49）+目录补录恰 1 inline 目（七字段·:61 后 ## 3.(=:63) 前）· 改前红 18 PASS→23514 亲取·改后 57 PASS 翻绿·scor 五套件翻绿·migrate/drift/uniqueness 202/typecheck 8/8/docs:check 2119≤cap 2120/markers 五类零/diff 恰 3 tracked 路径/卫生绿 · est live=0 · markers=0 · pins 十一值零翻 · 停止条件四类（「验收红不可修」命中承登）· Ban self-approve · alone≠dual · ⛔push*
