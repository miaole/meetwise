# PGP-KEY-PARAM REQUEST — pgp_sym_encrypt 密钥移出 SQL 参数面起草刀（AUTHZ-HARDEN 残子刀·0108 SD 面最小改·两件一卷·rev 席复核通过 · **STOP=`draft:awaiting_pre_exec_dual`**·前值史录：`draft:awaiting_rev` 起草席落卷→2026-10-19 rev 翻面）

> 战役 meetwise · 支线 `line/pgp-key-param-draft` · 工作树 `meetwise-pgp` · 起草基线 @origin/feat/mysql-schema-skeleton=`4c2ea4c9f`（派单下界「fetch 后 origin tip≥4c2ea4c9f」以等号成立亲证：`git merge-base --is-ancestor 4c2ea4c9f origin/feat/mysql-schema-skeleton` PASS+`git log -1 origin/feat/mysql-schema-skeleton` 恰该 SHA·2026-10-19 实测）· ⛔push ⛔merge 主线（push/翻面/EXEC/SSOT 行权全归协调方）。**STOP=`draft:awaiting_pre_exec_dual`**（rev 席独立外席 2026-10-19 复核通过翻面·前值 `draft:awaiting_rev` 史录保留·三处同值：本头注+标题+§8）。
> 主仓 worktree 建支线：`git worktree add ../meetwise-pgp -b line/pgp-key-param-draft origin/feat/mysql-schema-skeleton`。
> 立项出处（不自建 SSOT 行——行翻面权归协调方）：①协调方派单 brief（2026-10-19·#143 P4：pgp_sym_encrypt 密钥作 SQL 参数可入日志·AUTHZ-HARDEN 残子刀·生产链路未启用·修法方向=密钥改会话级 set_config 注入**或**绑定参数形择一最小面）；②挂账主链 AUTHZ-HARDEN 5A 段：`ai-docs/delivery/harness/authz-harden-REQUEST.md:35`（#143 行·引文 `pgp_sym_encrypt(p_body,p_enc_key)`——D6 决策原文「链路生产未启用…P3→P4 备忘，启用前处理」）+`:111`（「#143：随卷登记备忘（P4·启用前改应用侧加密·零码动）」）；③承登链 `ai-docs/delivery/harness/repo-hygiene-REQUEST.md:65`（「#143（P4 备忘态·承登）…挂账主权仍在 AUTHZ-HARDEN 5A 段/协调方」）+`ai-docs/delivery/harness/supply-chain-REQUEST.md:46`（#249/#143 注记面·「#143…挂账主权不变·承登零触」）；④要求面 `ai-docs/requirements/use-cases/interview-question-bank-reliability-security.md:281`（「密钥不作为通用 SQL/日志参数暴露」）。

## §0 现状锚（四读码面全链双向锚·起草席亲读+blob 亲算 @`4c2ea4c9f`·**rev/EXEC 立项照本节对届时 tip 再重 pin——结论不变则只更行号**）

### 0.0 防重三查（强制项·@`4c2ea4c9f` 实跑）

1. `grep -rln "pgp-key-param\|enc_key.*set_config\|密钥改会话" ai-docs/delivery/` → **零命中**（EXIT=1 亲跑）；
2. `ai-docs/delivery/harness/` 314 文件 ls 全表亲证**无同名卷** `pgp-key-param-REQUEST.md`（近邻 `dbacl2-pgp-grant.md`/`db-acl-residual-REQUEST.md` 系 ACL 面非密钥参数面·零重叠）；
3. 挂账主权链亲读在卷（出处②③）——本卷=「启用前另刀」之那刀，起草不翻面。→ **停止条件未触发·可落卷**。

### 0.1 blob 锚表（起草席亲算 `git rev-parse --short=8 4c2ea4c9f:<path>`）

| 文件 | blob @`4c2ea4c9f` | 本刀触面 |
|---|---|---|
| `packages/db/migrations/0108_ctx03_immutable_session_event_source.sql` | `351aeb45` | **零字节 Ban**（历史迁移不可改·修法走新迁移 CREATE OR REPLACE+DROP·:255 靶行存照） |
| `packages/db/migrations/0151_pgp_sym_encrypt_grant.sql` | `e6e76af1` | **零字节 Ban**（:31 `GRANT EXECUTE …pgp_sym_encrypt(text,text) TO memory_runtime` 修法后仍承重=SD 体仍执行 pgp·零触） |
| `packages/db/src/context/ctx03-event-source.ts` | `0a27f2cf` | **件② 触**（appendConversationEvent :108-135 两语句化·密钥移入会话 GUC） |
| `packages/db/test/db-acl2.proof.ts` | `31ce9fb5` | **件③ 触**（:170/:178/:269/:320/:323 签名与函数体锚 13→12 参连带重 pin·EXEC 面义务） |
| `packages/db/src/principal.ts` | `23e5b770` | **零字节 Ban**（:1000 `set_config('app.principal_user',$1,true)` 绑定参数母形存照·修法沿此形） |
| `packages/db/src/resume/resume.ts` | `f55d772b` | **零字节 Ban**（sibling 面 :78/:151/:183/:200/:213 已绑定形·防夹带） |
| `packages/db/src/transcript/int-transcript.ts` | `7151c7fc` | **零字节 Ban**（sibling 面 :158 已绑定形·防夹带） |
| `apps/api/src/modules/resume/resume.service.ts` | `1769589e` | **零字节 Ban**（生产接线见证 :126/:211/:252） |
| `apps/api/src/modules/interview/interview.service.ts` | `7c139c1d` | **零字节 Ban**（preview 门见证 :483+:526） |
| `docker/compose.prod.yml` | `663720c3` | **零字节 Ban**（:20 RESUME_ENC_KEY 强制见证·CONVERSATION_EVENT_* 零命中=CTX 链 env 未配） |
| `packages/db/src/index.ts` | `7cdad52e` | **零字节 Ban**（:514 导出面·调用者缺失亲证锚） |
| `ai-docs/delivery/harness/authz-harden-REQUEST.md` | `4180d446` | **零字节 Ban**（挂账出处 :35/:111） |
| `ai-docs/delivery/harness/repo-hygiene-REQUEST.md` | `0316c1eb` | **零字节 Ban**（承登出处 :65） |
| `ai-docs/requirements/use-cases/interview-question-bank-reliability-security.md` | `c5d17053` | **零字节 Ban**（要求面 :281） |
| 新迁移 `packages/db/migrations/0210_*.sql` | （新面无 blob） | **件① 新增**（0209=max 届树亲证·0210 空闲） |

### 0.2 四读码面事实（file:line 亲证 @`4c2ea4c9f`·四工序逐条对应派单）

**读一·pgp_sym_encrypt 调用面全集（拼接形 vs 绑定参数形二分）**：

- **A 组·SD 函数参数面（本刀靶面·密钥经 SQL 函数参数）**：`0108:177-190` `conversation_event_append` 13 参签名（`p_enc_key` 第 9 位 `:186`）→`:214` 入参 fail-closed 校验（NULL/空即 `22023`）→`:255` `INSERT … pgp_sym_encrypt(p_body, p_enc_key)`（authz-harden :35 引文逐字同源）。应用调用点唯一：`ctx03-event-source.ts:121-127` `SELECT * FROM conversation_event_append($1…$13)`——**句文本全占位符·密钥=绑定参数 $9**（`encKey` @`:115`/`:124`）。
- **B 组·应用侧直连绑定形（sibling·已合规零触）**：`resume.ts:78` `pgp_sym_encrypt($3,$4)`（$4=`RESUME_ENC_KEY()`）+`:151`/`:183` `pgp_sym_decrypt(…,$3)`（keyForVersion 选钥）+`:200` `pgp_sym_encrypt($3,$4)`（OCR 工件）+`:213` decrypt；`int-transcript.ts:158` `pgp_sym_encrypt($6,$7)`（$7=`ANSWER_ENC_KEY()`）。**全部绑定参数形·零字面拼接**：`pgp_sym_encrypt('` 全树非测试面零命中+`pgp_sym_encrypt(${` 插值零命中（grep 亲跑）。
- **C 组·测试面（字面形仅存于 test/ 夹具·不入生产面）**：`int-answer-dual-write-fence.proof.ts:273` `pgp_sym_encrypt('x','k')`（字面 key·夹具）；`int-transcript-answer-fact-root.proof.ts:117/:196/:228`（占位符+夹具混合）；`db-acl2.proof.ts:178` 13 参真调用（签名锚）+:269/:320 `pg_get_functiondef('public.conversation_event_append(text,…,bigint)' 13 参 regprocedure)` 锚+:323 函数体跨 stage 逐字节全等臂——**此三者=修法连带重 pin 面（§1-件③）**；`migrate.proof.ts:356-361` pgp ACL 臂断言 pgp_sym_encrypt 授予形——修法零扰（0151 授予不变）。

**读二·密钥来源（env/config）**：CTX 链 `CONVERSATION_EVENT_ENC_KEY`（`ctx03:33`·`requireSecret` prod 缺失 fail-closed 抛错+dev 缺省仅非 prod `:26-31`）+轮转 `CONVERSATION_EVENT_ENC_KEY_V{n}`（`:41-44`）+HMAC secret 分离（`:35`）；resume `RESUME_ENC_KEY`（`resume.ts:20`+V{n} `:27-29`）；answer `INTERVIEW_ANSWER_ENC_KEY`（`int-transcript:33`+V{n} `:43`）。生产注入唯一面=`docker/compose.prod.yml:20` `RESUME_ENC_KEY: ${RESUME_ENC_KEY:?set … from the cloud secret manager}`（cloud secret manager 强制）——**`CONVERSATION_EVENT_*` 全 docker/（compose 九件+env 四 example）零命中（grep 亲跑）**=CTX 链生产 env 从未配置。

**读三·日志面可达性（密钥入日志的机理与控制点）**：绑定参数值在服务端语句日志**可达**——`log_statement`（all/mod/ddl）与 `log_min_duration_statement`/`log_duration` 对扩展协议语句除句文本（占位符）外按 `log_parameter_max_length`（**PG 默认 -1=全量输出**）附绑定参数值→密钥（连同正文 $5）可入服务端日志；`log_parameter_max_length_on_error` PG 默认 0=错误语句默认不带参数值；`pg_stat_statements` 只存句文本占位符不存参数值；`auto_explain.log_parameters` 默认 off（repo 仅测试面会话级 LOAD·`rag03-hnsw-completeness.proof.ts:238-242`/`rag03c-exactk-observe.proof.ts:305-309`·非常驻配置）。**repo 控制点亲证：全树 `log_statement|log_min_duration_statement|log_parameter_max_length|shared_preload` 配置零命中**（conf/compose/ops grep 亲跑）→生产 DB 系云托管（`compose.prod.yml:9-11` `RUNTIME_DATABASE_URL`+`DATABASE_SSL_CA_PATH=rds_ca`·「Cloud-only」头注 :1-4）→服务端语句日志开启态在云管控制面、repo 侧不可亲证=结构性不可见残余（恰是 D6「启用前处理」窗口存在的结构性理由）。应用日志面另有纵深（observability-strategy.md:69 日志禁词机检+gitleaks）但管不到 DB 服务端日志=两轨异面。

**读四·生产链路启用状态亲证（判词复核·停止条件裁决）**：

- **靶面（A 组 CTX-03 链）未启用·判词未过时**：`appendConversationEvent` 在 apps/+e2e **零调用者**（grep 亲跑·仅 `packages/db/src/index.ts:514` 导出+定义本体）；`CONVERSATION_EVENT_ENC_KEY`/`CONVERSATION_EVENT_HMAC_SECRET` 生产编排面零配置（读二）→**停止条件「生产链路已启用」未命中**。
- **范围歧义如实登记（裁决权归协调方·防夹带）**：对照组 resume 链生产**在位**（`:20` env 强制+`resume.service.ts:211` ingest 主路径+worker 侧 `quiz-lifecycle.ts:26`/`diagnosis-lifecycle.ts:31`/interview-consumer `decryptActiveResumeBlob`）；answer 链=preview 门内（`interview.service.ts:483` `requirePublicPreviewControlledWrite`→`:526`）。但两者系 **app_role 直连绑定形**（0121:16 授 app_role EXECUTE pgp·不经 SD 函数参数面），而 #143 挂账引文 `pgp_sym_encrypt(p_body,p_enc_key)`（=0108:255 签名逐字）+0151:31（memory_runtime 补授·**该补授唯一动因=SD 函数 conversation_event_append 求 EXECUTE 42501**·0151:4-8 序言自证）恰唯一指向 A 组 SD 链；P4 定级与「生产链路未启用」判词互证。→本卷范围=A 组面；B 组「密钥仍居数据语句绑定参数表、慢日志可达」同族残余**不在本卷修法**（§1.3-① 否决理由+§9-2 登记）。
- 判词过时另两查：0108/0151/ctx03 面 blob 与基线一致（本卷树即基线树）；无任何在飞刀占用 0210 迁移号（0209=max `git ls-tree` 亲证）。

### 0.3 迁移号

件① 预期占 **0210**（届树 `packages/db/migrations/` 209 文件·max=0209_ag09_replay_first_claim.sql 亲证；既有豁免 0143/0152/0160 与本刀零涉）——EXEC 落卷前对届时 tip 重 pin 空闲性+`node scripts/check-migration-version-uniqueness.mjs` 复跑（撞号治理=后到者重编号）。

## §1 修法（两件一卷+1 连带重 pin·零 env 零 lockfile）

**裁量定稿（两候选择一·最小面）**：取**会话级 set_config 注入**。「绑定参数形」候选否决（§1.3-①：三链现状已全绑定形=零修复力）。密钥离开数据语句参数表、迁入事务级自定义 GUC，沿 `principal.ts:1000` 既有母形（`set_config('app.principal_user',$1,true)` 绑定参数·事务局部·仓库现役形）——非新发明面。

### 1.1 件① 新迁移 0210（密钥出函数签名·fail-closed 等价）

- `DROP FUNCTION conversation_event_append(text,text,text,text,text,text,integer,integer,text,text,text,bigint,bigint)`（13 参旧版）——**顺序承重**：PostgreSQL `CREATE OR REPLACE` 对不同签名系**新建重载而非替换**，故必须先 DROP 旧版再 CREATE 12 参新版，杜绝双版本并存漂移；fresh 回放序=0108 建 13 参→0210 DROP+CREATE 12 参（历史迁移零字节改铁律承 0151/0156 先例）。
- `CREATE OR REPLACE FUNCTION conversation_event_append(p_thread_id,p_category,p_source,p_event_key,p_body,p_body_hmac,p_hmac_key_version,p_enc_key_version,p_retention_class,p_consent_purpose,p_consent_revision,p_privacy_epoch)`（**恰去 p_enc_key 一参·12 参**）：函数体对 0108 逐字节承袭仅两处变——①入参校验：`v_enc_key := current_setting('app.conversation_event_enc_key', true)`；NULL/空即 `RAISE … ERRCODE='22023'`（与 0108:214 `p_enc_key IS NULL OR length=0` 同码同语义=fail-closed 等价·GUC 缺失即拒）；②`:255` 加密行改 `pgp_sym_encrypt(p_body, v_enc_key)`。其余（advisory 锁/幂等重放/digest 重算/MAX+1/审计 payload 双 INSERT）逐字节不动。
- 授予面同形重申（授予随签名走）：新 12 参版 `OWNER TO memory_runtime`+`REVOKE ALL … FROM PUBLIC`+`GRANT EXECUTE … TO app_role`（0108:273-276 同形）；**0151:31 零触**（SD 体仍执行 `pgp_sym_encrypt(text,text)`·memory_runtime 补授仍承重）；0121 app_role 补授零触（B 组面不动）。
- GUC 名取两段形 `app.conversation_event_enc_key`（沿 `app.principal_user` 两段先例·规避三段自定义 GUC 非法风险）；值永不入任何表列/审计 payload/日志，事务尾（is_local=true）自清零残留。

### 1.2 件② 应用侧 ctx03-event-source.ts（同事务两语句）

`appendConversationEvent`（:108-135）改：同 client 先 `SELECT set_config('app.conversation_event_enc_key', $1, true)`（**绑定参数**·密钥仍走扩展协议参数但不与数据语句同流）→再 12 参 `SELECT * FROM conversation_event_append($1…$12)`。**事务局部性语义写死注释**：本函数预期在 `asPrincipal` 事务内调用（现役唯一 DB 会话封装·BEGIN+SET LOCAL ROLE+set_config 同事务）；若误用于非事务上下文，set_config(true) 语句即终即蒸发→append 端 current_setting 缺失→`22023` fail-closed（静默降级不可能）。`encKeyForVersion` 轮转面/:33 env 面/`:47-48` HMAC 面零触。

### 1.3 否决（五件）

1. **绑定参数形（维持现状）**——§0.2 读一亲证三链生产面已全绑定形、全树非测试面零字面零插值；择之=**零修复力**（密钥仍居 `conversation_event_append($1…$13)`/`pgp_sym_encrypt($3,$4)` 数据语句参数表·慢日志开启即密钥+正文入云管日志）·否决。其可取半件（冻结绑定形防倒退）并入门矩阵执行期断言（件③ 重 pin 面+静态字面扫描沿用零命中口径）。
2. **应用侧加密全链重写**（authz-harden :111 原处方「启用前改应用侧加密」字面行使）——node:crypto 自管 AES-GCM 重写 A/B 两族全部加密/解密/密文格式/key_version 轮转/RLS 读侧/全部 proof=面放大数倍·与派单「择一最小面」约束冲突·**否决（处方刷新）**：本卷以 set_config 注入替代实现同一目标（密钥不入通用 SQL 参数）；D6 原文替代裁决权归协调方（rev 审点①）。
3. **密钥硬编码**（SQL 字面/迁移内联/把 dev 缺省升 prod）——违 `requireSecret` prod fail-closed 谱系（ctx03:26-31）+「密钥与敏感数据不进仓库」铁律·否决。
4. **服务端日志配置当修法本体**（`ALTER ROLE app_role SET log_parameter_max_length = 0` 或云管控制面关慢日志参数回显）——两候选外的第三路：**互补候补而非本体**登记（§9-1·服务端配置归运维轨/另刀裁决）；防本刀越界吞并云管面。
5. **KMS/envelope 重构**（三参重载换轨/bytea 信封加密/MODEL-OP 接管）——0108:42 诚实标注「真实 KMS 归 MODEL-OP/密钥运维」·域外·否决。

## §2 门矩阵（起草席基线亲跑值在卷·rev/EXEC 期复跑）

1. **门1 markers**：改动集新增行五类标记词直扫 **0 hits**（四作业/临时代码标记词+行首冲突标记·词面运行时组装不复抄——`scripts/qbank-corpus-gates.prove.mjs:87-98` 同法）+全树行首冲突标记（`^<{5}|^>{5}`）`grep -rlE` **EXIT=1 零命中**——基线与届树两跑在卷（本席亲跑）。
2. **门2 docs:check**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0**·基线 **2261** managed files 亲跑在卷；本 REQUEST 落卷后 **2262**（docs-only 恰 +1·cap 谱系归属协调方·零上调诉求申明）。
3. **门3 迁移编号唯一性**：`node scripts/check-migration-version-uniqueness.mjs` **EXIT=0**（209 files·violations=0·豁免 0143/0152/0160 既存）——EXEC 期 0210 落卷后复跑+0210 空闲性届时重 pin。
4. **门4 diff 面**：本起草卷恰 **1 新 tracked 文件**（本 REQUEST）·零产品码（apps/packages 零字节）·零迁移零 DDL 零 env 零 lockfile（draft=docs-only）。
5. **门5 证明面（draft 期失义如实登记·EXEC 期义务在案）**：worktree 未装依赖+draft 零码触面→TS proof 不跑（承 readyz-privacy-wire §9.3 同形）；**EXEC 期义务**：件① 0210 迁移+件② ctx03 落改后 `db-acl2.proof.ts` 重 pin 三锚（0.1 表件③ 行）+隔离库全量 prove 复跑（含 `migrate.proof.ts:356-361` pgp ACL 臂零扰回归+db-acl2 P0 负门臂对 12 参新版重演）。

**停止条件（三类·含派单两停止臂）**：**现场漂移**=届时 tip 对 §0.1 任一锚 blob 漂移或 0108/0151/ctx03 面形变（签名/授予/GUC 名先例）→停·重 pin 回炉；**判词翻转**=`appendConversationEvent` 在 apps/e2e 出现调用者或 `CONVERSATION_EVENT_*` 入生产编排 env（=生产链路启用·派单停止臂②）或 B 组面出现字面拼接形（判词过时·停止臂②）→**命中即停·升级上报**（优先级重裁归协调方·本卷只停不改）；**门红**=门 1/2/3 任一红或届树意外越界诉求→停·如实升级（Ban 就地改基线）。

## §5 pins（Ban+预算）

- est live=0（起草+rev+EXEC 全程本地静态门·零容器 up 零模型外呼零 DB 连接零 secrets 消费）· 0 Key 值·`actualSpendCny=null`。
- **零字节 Ban**：`packages/db/src/principal.ts`（母形存照）·`packages/db/src/resume/resume.ts`+`packages/db/src/transcript/int-transcript.ts`（sibling 面）·`apps/api`+`apps/worker` 全树·`docker/` 全树·`0108`/`0151` 历史迁移（逐字节·修法全走 0210 新迁移）。
- 修法触面（EXEC 期预期）：恰 3 码面=0210 新迁移+`ctx03-event-source.ts`+`db-acl2.proof.ts` 重 pin；零 env 零 lockfile 零 cap 上调。

## §8 治理（STOP 协议·起草席权限边界）

- 本卷 **STOP=`draft:awaiting_pre_exec_dual`**（三处同值：标题+头注+本节·前值史录：`draft:awaiting_rev` 起草席落卷→2026-10-19 rev 席独立外席六项复核通过翻面·见 §9-rev）——rev 席已行使翻面臂（`awaiting_rev`→`awaiting_pre_exec_dual`）；**rev 落卷后派 pre-exec 双审两独立外席·alone≠dual·Ban self-approve**；EXEC/翻面/SSOT 行/并线/push 权全归协调方（⛔push ⛔merge 主线·本起草卷 docs-only 恰 1 文件）。
- rev 审点建议（不约束）：①§1.3-② 处方刷新（D6「改应用侧加密」→set_config 注入）裁决追认；②GUC 名 `app.conversation_event_enc_key` 两段形与 is_local=true 语义；③0210 DROP→CREATE 顺序与授予同形重申面；④§9 残余披露充分性（set_config 语句自身参数在 log_statement=all 下可达·是否上升为独立刀）。
- 前瞻耦合注记（处置归协调方/后继刀）：B 组三链密钥仍居数据语句绑定参数表（resume 链生产在位=同族残余最重处）；`log_parameter_max_length=0` role pin 为一次性低成本互补候选（§1.3-④）；CTX 链真实启用前本卷修法+门 5 EXEC 义务为**前置门槛**（D6「启用前处理」兑现路径）。

## §9 偏离与诚实披露（起草卷）

1. **修法残余如实**：set_config 注入非零残余——`SELECT set_config(…,$1,true)` 语句自身绑定参数在 `log_statement=all`+`log_parameter_max_length=-1`（PG 默认）下仍可达密钥；慢日志（`log_min_duration_statement`）面**全消除**（set_config 恒速·永不越阈）；`log_statement=all` 下 append 语句 p_body 参数仍可达（正文不出函数参数=0108 结构决定·非本刀可去）。→「密钥可入日志」收窄为「仅 log_statement=all 单语句可达」；清零需 §1.3-④ 互补面（role pin）——两轨并行裁决归协调方。
2. **范围歧义登记**（0.2 读四）：B 组 resume/answer 链同族残余不在 #143 挂账锚内（引文+0151 补授动因+P4 定级三证互洽指向 A 组）；resume 生产在位一节若经协调方裁为 #143 范围内→本卷停（§2 停止条件臂②精神）·优先级重裁。
3. **draft 期证明面失义**：门 5 如实登记（worktree 零依赖+draft docs-only）——非跳门·EXEC 期义务在案可追溯。
4. PostgreSQL 机理断言（`log_parameter_max_length` 默认 -1 全量/`log_parameter_max_length_on_error` 默认 0/`pg_stat_statements` 不存参数值/CREATE OR REPLACE 异签名=重载）系通用版本行为，rev 席如需实库复证可在隔离库 arm 内亲跑（EXEC 门 5 顺带覆盖）·本席本地零 DB 未实测=如实登记。

## §9-rev rev 席复核注记（2026-10-19）

> rev 席=独立外席·工作树 `meetwise-pgp`@`line/pgp-key-param-draft`（届 tip `c7f30447`·父提交恰基线 `4c2ea4c9f`）·fetch 后亲证 `origin/feat/mysql-schema-skeleton`=`4c2ea4c9f54ec…` 恰等下界（主线未前进·零重 pin 诉求）。六项逐条亲证如下，**零停止条件命中**。

**一、§0.1 blob 锚表 15 行逐一亲算（`git rev-parse --short=8 4c2ea4c9f:<path>` rev 席亲跑）——15/15 恒等零漂移**：

| 锚 | 卷值 | rev 亲算 | 结论 |
|---|---|---|---|
| 0108 | `351aeb45` | `351aeb45` | 恒等 |
| 0151 | `e6e76af1` | `e6e76af1` | 恒等 |
| ctx03-event-source.ts | `0a27f2cf` | `0a27f2cf` | 恒等 |
| db-acl2.proof.ts | `31ce9fb5` | `31ce9fb5` | 恒等 |
| principal.ts | `23e5b770` | `23e5b770` | 恒等 |
| resume.ts | `f55d772b` | `f55d772b` | 恒等 |
| int-transcript.ts | `7151c7fc` | `7151c7fc` | 恒等 |
| resume.service.ts | `1769589e` | `1769589e` | 恒等 |
| interview.service.ts | `7c139c1d` | `7c139c1d` | 恒等 |
| compose.prod.yml | `663720c3` | `663720c3` | 恒等 |
| index.ts | `7cdad52e` | `7cdad52e` | 恒等 |
| authz-harden-REQUEST.md | `4180d446` | `4180d446` | 恒等 |
| repo-hygiene-REQUEST.md | `0316c1eb` | `0316c1eb` | 恒等 |
| 要求面 md | `c5d17053` | `c5d17053` | 恒等 |
| 0210 空闲锚 | 0209=max·0210 空闲 | `git ls-tree` 亲跑：209 files·max=0209_ag09_replay_first_claim.sql·`^021` 前缀 grep EXIT=1 | 恒等 |

**二、四读复核——四读全数维持·无一翻转**：

- **读一成立**：A 组 `0108:177-190` 13 参签名（`p_enc_key` 恰第 9 位 `:186`）、`:214` `OR p_enc_key IS NULL OR length(p_enc_key)=0`、`:255` `pgp_sym_encrypt(p_body, p_enc_key)` 逐行亲读亲中；应用调用点 `ctx03:121-127` 句文本 `SELECT * FROM conversation_event_append($1,…,$13)` 全占位符·绑定参数表恰 13 元（`:123-125` 逐位亲数：$9=encKey·`encKey` 定义 `:115`）。B 组 `resume.ts:78` `pgp_sym_encrypt($3,$4)`/$4=RESUME_ENC_KEY()、`:151`/`:183` decrypt $3=keyForVersion、`:200` encrypt、`:213` decrypt；`int-transcript.ts:158` `pgp_sym_encrypt($6,$7)`/$7=encKey——全绑定形亲读亲中。`pgp_sym_encrypt('` 字面形全树仅 test 三处（`int-answer-dual-write-fence.proof.ts:273` `pgp_sym_encrypt('x','k')`、`int-transcript-answer-fact-root.proof.ts:196/:228`）·插值形 `pgp_sym_encrypt(${` 全树 grep EXIT=1 零命中——非测试面零字面零插值成立。C 组 `db-acl2:170/:178/:269/:320/:323`+`migrate.proof.ts:356-361` 逐行亲中。rev 加验：全树 `pgp_sym_encrypt` 命中文件逐一人读（0001/0092/03_resume 系注释·0121:14/:16+0122 系 ACL·0151:31 系 GRANT·ci.yml/sidecar-v3.mjs/run-e2e-isolated.mjs 系 step 名/归档注记/迁移清单）——**零漏报调用点·A/B/C 三分完备**。
- **读二成立**：`ctx03:26-31` requireSecret（`:28` `if (IS_PROD) throw` fail-closed+dev 缺省仅非 prod）·`:33` `CONVERSATION_EVENT_ENC_KEY`·`:35` HMAC 分离·`:41-44` V{n} 轮转全亲中；`docker/` 全目录 `CONVERSATION_EVENT` grep **EXIT=1 零命中**；`compose.prod.yml:20` `RESUME_ENC_KEY: ${RESUME_ENC_KEY:?set …}` 强制见证亲中。
- **读三成立**：`log_statement|log_min_duration_statement|log_parameter_max_length|shared_preload` 全仓控制面（yml/conf/sql/ts/mjs/sh/toml/json）grep **EXIT=1 零命中**；auto_explain 全树仅两 test 证明面会话级 LOAD（`rag03-hnsw-completeness.proof.ts:237-242`·`rag03c-exactk-observe.proof.ts:304-309`）非常驻配置亲证；应用日志纵深 `ai-docs/observability/observability-strategy.md:69` 禁词机检+gitleaks 亲中（两轨异面判词成立）。
- **读四成立**：`appendConversationEvent` 全树命中=定义本体（`ctx03:108`）+导出（`index.ts:514`）+**packages/db/test 六个证明面**（ctx03/ctx04/ctx05/ctx06/mem02/mem03 proof）——**apps/+e2e 零调用者亲证成立·生产链路未启用判词维持**；对照组 resume 链生产在位亲证（`resume.service.ts:126/:211/:252`+worker `quiz-lifecycle.ts:26`/`diagnosis-lifecycle.ts:31`/`interview-consumer.ts:115` decryptActiveResumeBlob）·answer 链 preview 门（`interview.service.ts:483`/`:526`）·`0121:16` app_role 补授·`0151:4-8` 序言 42501 动因自证全亲中——A 组唯一指向判词三证互洽成立。注记级补正：读四括注「仅 index.ts:514 导出+定义本体」未列 test 面六调用者，判词不受影响（proof 面非生产接线）。

**三、§1 修法复核——成立**：

- 件① 顺序承重正确：PostgreSQL `CREATE OR REPLACE FUNCTION` 对异签名系新建重载而非替换——先 `DROP` 13 参再 `CREATE` 12 参为必要序；仓内先例同形（0184 DROP 17 参→CREATE 19 参）。授予随签名走（旧函数 DROP 即 ACL 消亡）→授予面同形重申（对 0108:273-276 `OWNER TO memory_runtime`/`REVOKE … FROM PUBLIC`/`GRANT … TO app_role` 逐行亲读同形）必要且正确；`0151:31` 零触判词正确（补授对象系 `pgp_sym_encrypt(text,text)` 本体·SD 体仍执行故仍承重）。
- 件② 两语句序+fail-closed 等价成立：`set_config('app.conversation_event_enc_key',$1,true)` is_local=true 事务局尾自清（principal.ts:1000 母形 `SELECT set_config('app.principal_user',$1,true)` 逐字亲读·现役形）；非事务误用→语句即终即蒸发→`current_setting(…,true)` 返 NULL→空判即 `22023` 与 `0108:214-219` 同码同语义·静默降级不可能。GUC 两段形 `app.*` 系仓内全域现役形（principal.ts:1000/retrieval-store.ts:76/scoring-fact-root.ts:30/qbank-generation-retrieval.ts:91-95）·审点②成立。
- 五否决逐一成立：①绑定形=零修复力（三链已绑定形·读一亲证）；②应用侧重写=面放大（authz-harden `:111` 原文「启用前改应用侧加密·零码动」亲读在卷·替代保留同一目标）；③硬编码违 requireSecret 谱系；④日志配置归运维轨（互补候补登记）；⑤KMS 域外（0108:42 亲读「真实 KMS 归 MODEL-OP / 密钥运维」）。
- **rev 审点①建议（只建议·终裁归协调方）：追认成立**。处方刷新与派单 brief「set_config 注入或绑定参数形择一最小面」同向（协调方派单已授权该方向）·D6 原文系备忘级处方（P4·启用前处理·登记不实施）·目标同一（要求面 :281「密钥不作为通用 SQL/日志参数暴露」）。rev 自查未发现刷新面外更大残余：§9-1 单语句日志残余、§9-2 B 组同族残余、§8 前瞻耦合均已登记。显著登记一项：刷新系「收窄」而非「清零」日志面（严格读 :281 的「日志参数」字面）——清零路径（role pin 互补面/应用侧重写/MODEL-OP KMS）仍开放且已如实登记·追认时请协调方如悉此界。

**四、§2 门矩阵——成立**：门1 方法源 `scripts/qbank-corpus-gates.prove.mjs:87-98` 亲读（五类运行时组装词）·rev 对本卷改动集（恰 1 文件）亲扫 **0 hits**+行首冲突标记 `git grep -lE '^<{5}|^>{5}'` EXIT=1；**门2 rev 亲跑 `node scripts/ai-docs/check-docs.mjs` EXIT=0·scanned 2262 恰等卷面落卷后申明值**（基线 2261=2262-1 自洽）；**门3 rev 亲跑 `node scripts/check-migration-version-uniqueness.mjs` EXIT=0·209 files·violations=0·豁免恰 0143/0152/0160**；门4 亲证（`git diff --name-status 4c2ea4c9f..HEAD` 恰 1 A·docs-only）；门5 EXEC 义务充分覆盖件①②（db-acl2 三锚重 pin 面=:170-179 调用臂+:269/:320 regprocedure+:323 全等臂·恰=§0.1 件③ 行；隔离库全量 prove 机械兜底 ctx03/ctx04/ctx05/ctx06/mem02/mem03 wrapper 证明面+migrate ACL 臂零扰+P0 负门臂 12 参重演）。rev 强化注记（非阻塞）：db-acl2 `:173-179` 直连 SQL 调用臂重 pin 时须补 set_config 步骤（直连调用无 GUC 即 22023·此即新契约），并建议 EXEC 期增补「GUC 缺失→22023」显式负门臂——若漏，门5 全量复跑机械兜红·不致漏网。

**五、§9 披露——如实充分**：§9-1 set_config 语句自身参数在 `log_statement=all`+默认全量参数回显下可达·慢日志面恒速消除·append 正文残余如实——三段披露与机理一致·rev 无增补面。注记级：`log_min_duration_statement=0`（全量记）极端位与本残余同类（操作者全量开日志一类）·已被「log_statement=all 单语句可达」口径覆盖。**rev 审点④建议（只建议）：暂不上升独立刀**。理由：链路未启用（读四）·残余已收窄至单类单语句·互补面（role pin）一次性低成本已登记 §1.3-④/§8 前瞻——建议将 role pin（或等价）作为 CTX 链真实启用刀的前置义务随启用一并裁决·现立独立刀与「择一最小面」约束不成比例。§9-2/§9-3/§9-4 诚实登记（本席本地零 DB·机理断言未实测=如实·EXEC 门5 隔离库可复证）成立。

**六、STOP 卫生——成立**：`draft:awaiting_rev` 三处同值亲证（标题 :1/头注 :3/§8 :98）+卷尾注 :109 同值第四处·零矛盾零他值。

**注记级勘误（结论不变·不行驶 rework）**：① `compose.prod.yml:9-11` 实际 DATABASE_URL=:12/SSL_CA=:14·Cloud-only 头注 :1-3（漂 1-3 行）；② 读二「compose 九件」实际 docker/ 现存 compose*.yml **16 件**（env 四 example 恰等）——零命中结论对全部 16 件亲跑成立·计数注记失真；③ 读四括注省略 test 面六调用者（见二）。三条均系注记级·靶面结论零扰。

**翻面臂行使**：零停止条件命中（锚零漂移·四读零翻转·门亲跑全绿）→ STOP 三处（标题/头注/§8）`draft:awaiting_rev`→**`draft:awaiting_pre_exec_dual`**（前值史录保留于本节+三处内注）。**rev 落卷后派 pre-exec 双审两独立外席·alone≠dual·Ban self-approve**·EXEC/翻面/SSOT 行/并线/push 权仍全归协调方（⛔push 未行使）。

*PGP-KEY-PARAM REQUEST · 2026-10-19 · 起草席落卷 · 2026-10-19 rev 席独立外席复核通过（§9-rev） · `draft:awaiting_pre_exec_dual`（前值 `draft:awaiting_rev`·2026-10-19 rev 翻面·史录保留） · 基线 `4c2ea4c9f` · ⛔push*
