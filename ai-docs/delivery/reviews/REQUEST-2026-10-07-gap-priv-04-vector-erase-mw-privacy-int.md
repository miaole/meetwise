# REQUEST — **PRIV4 · GAP-PRIV-04 vector erase** · pre-exec · mw-privacy-int

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer `mw-e2e-ha`）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503
**Expert**: `mw-privacy-int`
**Peer**: `mw-e2e-ha`（独立签 · alone ≠ dual）
**Knife**: `harness/gap-priv-04-vector-erase.md` · slice `gap-priv-04-vector-erase.slice.md`
**Parent tip**: `14c14a31`（full `14c14a316477745d142bbd02ba383e477888adde` · `origin/feat/mysql-schema-skeleton` MOP01 nail tip · not a prove tip · 开工时点 origin 最新 tip；首测 `2fd78ea1` 被并发 nail 前移 · delta 恰 MOP01 立卷 append · 与本刀面零交集）
**边界 cite**: AR 线 `71713718`（GAP-PRIV-EXTERNAL-SINK async purge nail · backlog `:64` **OPEN** · stub≠cloud · cloudVendorDeleted=false · NB-3 · Ban count-as-erased）——**只读边界 · Ban 借证据/状态 · Ban 洗 OPEN 钉**
**Date**: 2026-10-07
**Line**: **PRIV4**（队列 Phase 3 privacy · vector erase）

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained**（Ban Qdrant / replace-pgvector cutover） |
| Public DELETE | **503**（stays · GAP-PRIV-02 冻结） |
| backlog `:60` GAP-PRIV-04 | **OPEN**（本 commit 零 SSOT 编辑 · Ban close via docs alone） |
| backlog `:64` AR external sink | **OPEN**（cite only） |
| UC-052 | **partial**（Ban covered flip） |
| cloudVendorDeleted 类 | **false**（本地/隔离擦除 ≠ 云端真删 · 沿 AR 口径） |

## 请审什么（mw-privacy-int）

1. **候选裁定诚实性**：A 软删标记 / B 物理删除（0125 同形）/ C 擦除收据链三候选利弊是否如实（B 的 HNSW 索引内部页/WAL/备份不在证据面披露 · A 的「非物理擦除 · Ban soft-as-erased」）· 实现方倾向（B 主体 + C receipt 收尾）是否被正确标为**非绑定、交双审裁**。
2. **0091 主链边界**：候选 C 是否写死「复用 0091 `privacy_deletion_receipt` **现有**形状/函数 · **0091 语义不动除非显式申报**」——Ban 借刀动 authorization/issuer 主链（issuer 快照 / `privacy_epoch`+`target_set_digest` / completed guard L516–545 语义不动）。
3. **向量面 vs AR `:64` external 面边界**：PG 向量面证据 ≠ oss/redis/langfuse async purge 证据 · Ban 借 AR 证据/状态 · Ban 洗 `:64` OPEN 钉 · 两面 receipt 互不抵扣。
4. **fail-closed 断言充分性**：未授权擦除拒绝（fence/403 红）+ 授权后 subject 向量 recall=0 + 行数=0 + 残留快照=0 + 跨 subject/qbank intact + `privacy-erasure:http:prove` DELETE=503 同列入账。
5. **范围边界**：Ban 删 `kind='qbank'`/共享语料 · Ban 假造 INT `sink='vector'` 面试作用域键（无键=诚实不建 target 现状保持）· `eraseInterviewData` 503 一字不动 · GAP-PRIV-01/`:68` 面不动。
6. **诚实条款**：Ban 把本地/隔离擦除写成「数据已彻底删除」· cloudVendorDeleted=false 披露沿 AR 口径 · EXIT1 诚实失败路径（做不出→保留 · attempts 全录 · Ban retry-to-green）。
7. **docs-only 边界**：本 commit 恰 4 文件 · 零产品码/migration/script · 零 SSOT 翻行（`:60`/`:64`/checklist/matrix）· Ban coding until PRE dual BOTH PASS + coordinator AUTHORIZE。

## Ban

Ban coding（until PRE dual BOTH PASS + coordinator AUTHORIZE）· Ban prove 执行 · Ban push · Ban self-nail · Ban self-approve（alone ≠ dual）· Ban 借刀动 authorization/issuer 主链（0091 语义不动除非显式申报）· Ban 开公开 DELETE（DELETE=503）· Ban 把 soft 标记/fence 写成 erased/彻底删除 · Ban 借 AR `:64` 证据/状态 · Ban 洗 `:64` OPEN 钉 · Ban count-as-erased · Ban flip UC-050/051/052 covered · Ban SSOT 翻行 · Ban Qdrant / replace-pgvector cutover（PG-retained）· Ban 删 qbank/共享语料 · Ban retry-to-green · Ban Meridian · Ban secrets / `.env*` · Ban force-push · Ban buy cloud · Ban 冒充 dual / 代签 · Ban claiming PRE PASS · Ban product/infra code。

本 stub 不授权 coding / prove / push 冒充执行 / buy cloud；pre-exec dual BOTH PASS 后由协调方 AUTHORIZE 执行；implementer 不自批 · 不代填 Verdict。

## Verdict

**PENDING**（awaiting `mw-privacy-int` · implementer 不得填写）

---

*Stub · awaiting expert pre-exec dual · awaiting_pre_exec_dual · STOP*

---

## PRE-EXEC dual 审查段 — `mw-privacy-int`（append-only · 2026-10-07）

**被审对象**: PRIV4 REQUEST `docs(privacy): REQUEST GAP-PRIV-04 vector erase (pre_dual)` —— origin 镜像 `f4268abe`（full `f4268abec971207afa7157c3947df332a7bfdb49` · parent=`14c14a31`=`origin/feat/mysql-schema-skeleton` tip）≡ 本地线副本 `08825639`（parent=`b2e0eaec`）；`git patch-id --stable` 双侧全等 `a2038a37b11ee689a4e4c9fb6198ab7de50f7182`（亲算）。
**审查 worktree**: `/Users/miaole/Desktop/golucky/meetwise-rv-p4-privacy-int` · branch `rv/p4-privacy-int`（HEAD=`f4268abe` · 本刀全部 git 写操作仅在此 worktree · 禁 push）。锚定说明：命令面 ref `origin/feat/mysql-schema-skeleton`=`14c14a31` 是 REQUEST 镜像的 **parent**（镜像恰在其上一跳，镜像未入 tracking ref）；锚在 `14c14a31` 则 REQUEST 四文件不在树中、无法 append——故锚 `f4268abe`，其父恰为命令 ref，base 链（origin tip→REQUEST→本审 commit）与既有 PRIV 审查惯例（审 commit 直接承接被审 REQUEST）一致，如实记录。
**本段性质**: **docs gate only** · 单侧 PRE-EXEC 审查（**alone ≠ dual** · 不代签 peer `mw-e2e-ha`）· Ban coding / Ban prove 执行 / Ban 改共享 SSOT / Ban 自批 · 本 PASS ≠ coding 授权 ≠ prove ≠ nail ≠ dual。

### 检查表（全部命令实证 · 可复现）

| # | 项 | 命令/证据 | 结果 |
|---|----|-----------|------|
| 1 | worktree + 祖先链 | `git worktree add …/meetwise-rv-p4-privacy-int -b rv/p4-privacy-int f4268abe`；`git log --format='%H %P' -1 f4268abe` → parent=`14c14a31`；`git ls-remote origin refs/heads/feat/mysql-schema-skeleton` → `14c14a31…`（remote tip 亲证同值）→ 镜像直承 origin tip | PASS |
| 2 | docs-only 触碰面 | `git show --stat f4268abe` = 恰 4 新增 .md（slice +62 · harness +109 · e2e-ha stub +51 · 本 stub +52）· +274/−0；`git diff --name-only 14c14a31 f4268abe` 全 .md · 零 ts/sql/mjs/json；backlog/checklist/matrix/queue 不在 diff | PASS |
| 3 | REQUEST 双副本一致性 | `git patch-id --stable`：`git diff 14c14a31 f4268abe` ≡ `git diff b2e0eaec 08825639` → 同 `a2038a37`；origin 镜像主张成立 | PASS |
| 4 | tip 前移披露属实 | `git diff --stat 2fd78ea1 14c14a31` = 恰 2 md（execution-master-checklist +11 · backlog +2 恰 `@@ -81,6 +81,8 @@` 后 append）；`sed -n '60p;64p'` 两侧 backlog `:60` GAP-PRIV-04 / `:64` GAP-PRIV-EXTERNAL-SINK 逐字同 → `:60`/`:64` 锚零位移、与刀面零交集，harness/slice 披露如实 | PASS |
| 5 | 向量面 DDL | `0001_baseline.sql:279` 头注「只存向量+引用 id+hash,不存原文 PII」· `:285` CREATE TABLE vector_chunk · `:291` `embedding vector(512) NOT NULL` · `:295` HNSW `ix_vchunk_hnsw (vector_cosine_ops)` · kind CHECK∈{qbank,memory} · RLS p_owner —— REQUEST「`:279-300`」锚准确 | PASS |
| 6 | 0125 memory 擦除先例 | `0125:6`「INT 的 sink='vector' 无 interview 作用域键，面试删除诚实不建 target」· `:12` 永不 DELETE kind='qbank' · sink CHECK 扩 `memory_vector_chunk` · DELETE policy owner+kind='memory'+target-id 双谓词 · `:104` fence `42501 memory_vector_chunk_erasure_fenced` · `:193` claim 函数 · `:345` `DELETE FROM vector_chunk WHERE owner_user_id=principal AND kind='memory'` · `:355` 残留≠0 `55000 residual_rows` · `:343` receipt_hash 落账 —— harness §1 表逐项对得上 | PASS |
| 7 | 0125 授权根（fail-closed 链） | claim `:193-296` 十项全检：snapshot 在场 / `:219` issuer_id='meetwise-privacy-authz-v1' / `:222` status='consumed' / 未过期 / owner 一致 / purpose+scope / sink / subject / epoch+digest 一致 / drift 拒绝——任一不满足 42501/40901 raise；purge `:304` lease-token 门+残留 55000——B 沿 0125 同形即继承全链 fail-closed | PASS |
| 8 | 0091 主链形状（Ban 动对象） | `:56` privacy_authorization_snapshot（`privacy_epoch`+`target_set_digest` NOT NULL CHECK）· `:84` privacy_deletion_receipt per-sink · completed guard `:516` 头注+:524 函数+:556-558 触发器（INSERT/UPDATE 双生效 M2 · 零 target 拒绝 M3 · completed iff every target `erased` AND 无 `external_pending`/`failed_cleanup`）——REQUEST「L516–545」锚准确；候选 C「复用现有形状/函数·零语义改动」边界与此吻合 | PASS |
| 9 | DELETE=503 源码钉 | `privacy.controller.ts:51-52` `@Delete('interview-data/:id')`+`@HttpCode(SERVICE_UNAVAILABLE)`（grep 行号亲证）· `privacy.service.ts:56` `throw interview_erasure_authorization_not_available`（`:54-55` 注释自证 0125 只闭合 memory_vector_chunk）· REQUEST 零触碰该两文件 | PASS |
| 10 | AR 边界 `:64` | backlog `:64` GAP-PRIV-EXTERNAL-SINK-RETENTION **OPEN** 原文在位（「stub≠cloud · cloudVendorDeleted=false · Ban close :64 · NB-3」逐字）；AR nail `71713718` 在场（`nail(AR): post_prove_dual_pass … :64 OPEN · stub≠cloud`）；REQUEST 仅边界 cite：零借 AR 证据/状态、零洗 OPEN 钉、两面 receipt 互不抵扣写死（harness §0.1/:15/:86） | PASS |
| 11 | sink inventory | `ai-docs/architecture/ai/privacy-deletion-sink-inventory.md:74` 占位 sink 诚实不建 target · `:86` sink=`'vector'` 无 interview 作用域键不建 target · `:99` memory_vector_chunk 本迭代闭合 · `:104` 0107 7 值 CHECK 不含向量块 —— 引用路径 `architecture/ai/…` 系全仓 harness 惯用简写（AR/AN harness 同式），非本刀瑕疵 | PASS |
| 12 | prove 先例 CMD | `package.json` `memory-vector-chunk-erasure:prove`（:339 邻域）· `privacy-erasure:http:prove`（:351 邻域）· `vectorstore:prove`（:236 邻域）均经 `scripts/run-e2e-isolated.mjs` 隔离真 PG——拟议 prove 面有同形先例可依 | PASS |
| 13 | qbank/共享语料面 | `0029:138-142` qbank_generation_chunk `embedding vector(512) NOT NULL` · `:204-205` per-generation PARTITION+HNSW · `0032` rag_corpus_* 表族+`:529` visibility policy+`:532` per-table HNSW——共享语料「设计上不随 subject 删」主张与实码一致 | PASS |
| 14 | UC-052 / SSOT / pins | UC-052 文件零触碰（不在 diff）· `uc-e2e-050-052:15` stays **partial** 原文在位 · 四文件 pins 逐字 = NOT_HA/false/false/gR45Closed=true/coveredCount=8/ms3EqualsR4Closed=false/PG-retained/DELETE=503/`:60` OPEN/`:64` OPEN/UC-052 partial/canHonestlyFlip=false · e2e-ha stub 仍 PENDING 本审零触碰 | PASS |

### 候选裁决（授权根视角 · 本侧裁 · 供合裁，非单方授权）

- **B（物理删除 · 0125 同形扩展）+ C（0091 receipt 对齐收尾）组合：可过（本侧裁）**。B 沿 0125 同形 = 授权根语义**完整继承**（检查表 #7 十项 fail-closed 全链 + 残留≠0 55000 + qbank 永不删先例）；C 复用 0091 `privacy_deletion_receipt` 现有形状/函数、completed guard 触发器（`:556-558` DB 级 no-forge 约束）不动 → 组合保住「擦除必经 privacy_authorization 授权链、未授权拒绝 fail-closed」。**约束**：B 的 target/scope 谓词必须沿用 0125 owner+kind 双谓词形且精确到 subject 作用域，Ban owner 裸删/越界；C 的 ledger 接线若须新增 receipt_kind/函数重载/触碰 guard → 显式申报 + 重双审。
- **A（软删标记）：不得作为唯一擦除语义——Ban soft-as-erased 已写死**。stub Ban 列、harness §3.1 A 行 + §7、slice :56 三处同钉「Ban 把 soft 标记/fence 写成 erased/彻底删除」，且 A 与 0091 `status='erased'` 语义冲突已如实申报（动语义须显式申报，默认 Ban）、「假彻底删除洗白风险」自认。裁：A 仅可作 fence/additive 增强；A-as-erasure = 执行审 FAIL。
- **「0091 语义改动须显式申报（当前 Ban 默认）」：合理**。guard 是 DB 级约束（M2/M3 注释自证：直插 completed / 零 target completed 均已被封），静默改动即掏空授权根；「显式申报 + 双审」是相称逃生门而非绝对封死，与 0125 铁律「复用冻结 PrivacyAuthorizationIssuer（0091）」一脉相承。

### Fail-trigger audit（执行期任一触发 = 本域 FAIL）

- **FT-1** 以 A soft/fence 单独宣称 erased/completed，或无显式申报改 0091 `status='erased'`/completed guard/issuer/`privacy_epoch`+`target_set_digest` 语义。
- **FT-2** B/C 执行绕授权链：claim 十项检查任一削弱（issuer/consumed/expiry/owner/purpose+scope/sink/subject/epoch+digest/drift）、lease-token 门移除、残留≠0 不 raise、receipt 不落账。
- **FT-3** scope 谓词越界：删 `kind='qbank'`/共享语料/跨 subject 行；假造 INT `sink='vector'` 面试作用域键（无键=诚实不建 target 现状必须保持）。
- **FT-4** 借 AR `:64` 证据/状态、洗 `:60`/`:64` OPEN 钉、两面 receipt 互相抵扣、count-as-erased。
- **FT-5** 把本地/隔离擦除写成「数据已彻底删除/磁盘字节清零」；cloudVendorDeleted 类翻 true；HNSW 内部页/WAL/备份不在证据面未披露。
- **FT-6** 动 `privacy.controller.ts:51-52`/`privacy.service.ts:56` 503 面、开公开 DELETE；UC-052 flip；SSOT 翻行；pins 改值；Qdrant/replace-pgvector cutover；GAP-PRIV-01（`:57`）/`:68` 面被顺手触碰。
- **FT-7** prove 弱化：行数=0 替代 ANN probe recall=0、缺未授权拒绝红路径、缺 DELETE=503 同列入账、retry-to-green、EXIT0 叙事越权（covered/`:60` closed/UC-052 flip/HA/开放 DELETE）。

### Blockers

无（none）。

### Conditions（本 PASS 附带）

- **C-P4-1 alone ≠ dual**：本段为 `mw-privacy-int` 单侧 PRE-EXEC docs gate；`mw-e2e-ha` stub 仍 PENDING，其独立签发前不构成 PRE dual PASS；协调方 AUTHORIZE 前 Ban coding / Ban prove。本 PASS 不代签、不冒充 dual。
- **C-P4-2 target 集先钉后码**：AUTHORIZE 记录须先裁死具体擦除 target 集与 scope 谓词（B 沿 0125 owner+kind 形；INT `sink='vector'` 须经显式申报的面试作用域键设计，或诚实保持 no-target 现状）；未钉不开工。
- **C-P4-3 0091 零语义改动默认维持**：候选 C 任何 0091 形状/函数/约束变更（含新增 receipt_kind、函数重载、guard 触发器 :516-558 面）→ 显式申报 + 重双审，否则执行审 FAIL。
- **C-P4-4 断言强度不得弱化**：未授权拒绝红 + 授权后 ANN probe recall=0 + 行数=0 + 残留快照=0 + 跨 subject/qbank intact + `privacy-erasure:http:prove` DELETE=503 同列入账，六件套全保；EXIT1=诚实保留（attempts 全录 Asia/Shanghai+commit SHA）；Ban retry-to-green / 换弱断言凑绿。
- **C-P4-5 诚实披露沿 AR 口径**：cloudVendorDeleted 类=false 持续；本刀证据口径=授权后 subject 向量行物理不可存 + recall=0 + 残留=0 快照；Ban「彻底删除/磁盘字节清零」叙事。
- **C-P4-6 F-1 转注（非返工义务）**：harness §2「0032 corpus `p_*` 表」中 `p_*` 实为 0032 RLS 策略名（`p_<tab>_read/_delete` :524），表族为 `rag_corpus_*`；实质主张（共享语料面·可见性控制·不随 subject 删）经实码成立（检查表 #13）；exec 期后续引用时更正或如实转注即可。

### 三行中文摘要

1. GAP-PRIV-04 立卷 docs gate 本侧 PASS：恰 4 文件 +274/−0 纯 docs，SSOT/backlog `:60`/`:64`/UC-052/产品码零触碰，pins 原值逐字在位，origin 镜像 `f4268abe`≡本地 `08825639` patch-id 双侧全等 `a2038a37`，tip 前移 delta 披露经亲算属实。
2. 候选裁：B+C 组合可过——0125 同形完整继承授权根 fail-closed 链（claim 十项检查+残留 55000+qbank 永不删），C 复用 0091 现有 receipt 形状且 guard `:516-558` 不动；A 仅 additive、soft-as-erased 三处 Ban 写死；「0091 显式申报（默认 Ban）」门槛合理。
3. alone≠dual：本 PASS 不代签 mw-e2e-ha、不构成 AUTHORIZE；target 集未钉不开工，EXIT0≠covered≠`:60` closed≠HA，DELETE=503 与 cloudVendorDeleted=false 沿 AR 口径持续，0 Blocker · 6 Conditions。

Verdict: PASS

---

# POST-PROVE dual 审查段（Line PRIV4 · GAP-PRIV-04 向量面擦除实现复验）

- 审查方：`mw-privacy-int`（独立 POST-PROVE dual 本侧；alone≠dual，不代签、不阅读、不评判并行中的 `mw-e2e-ha` 审）。
- 审查基点：独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-p4p-privacy-int`（分支 `rv/p4p-privacy-int` = `origin/feat/mysql-schema-skeleton` tip `972c6c2f` 亲证）。审查时间 2026-10-07。
- 被审包：coding 链 `fb1885a5`（0141 迁移 + `vector-plane-erasure` 模块 + worker 接线 + prove/CMD 注册，9 files +650/−4 亲证恰等）→ `90e4de7e`（prove fixture 42P08 分参修复，断言零改动）→ `d01e3d37`（receipt）。origin tip 载其为 rebase 孪生 `b5dd9aa3`/`972c6c2f`：patch-id 双侧亲算全等（code=`4f1f2d8e…`、fix=`952403a2…`，`git diff` 树零差异），tip 树 ≡ 被审包树。

## 1. 包完整性与冻结面（机检亲证）

- 恰 9 files +650/−4（`1b85b58a`→`972c6c2f` 全 diff）：0141 新迁移（137 行）、`packages/db/src/vector-plane-erasure.ts`（+126）、`packages/db/test/vector-plane-erasure.proof.ts`（+322）、`apps/worker/src/privacy-erasure-worker.ts`（+21/−2）、`apps/worker/src/main.ts`（+5/−3）、`packages/db/src/index.ts`（+11）、`package.json`（+2）、`packages/db/package.json`（+1）、`scripts/run-e2e-isolated.mjs`（+20/−3，恰 4 注册点：receipt sources / gate 白名单 / isolatedCommand 分派 / migrate-with-recovery 列表）。
- fix 提交 `972c6c2f` vs `b5dd9aa3`：单文件 fixture INSERT 参数 `$1::uuid`+`$2` 分参，断言行逐字未动（diff 亲证）——确定性 fixture bug 修复，非 retry-to-green。
- 零触碰亲证：`apps/api/src/modules/privacy/privacy.service.ts` / `privacy.controller.ts`（DELETE=503 冻结面，controller `:51-52` `@HttpCode(SERVICE_UNAVAILABLE)` + service `:56`/`:67` throw 亲读）零 diff；`0091`/`0125`/`0137`/`0140` 迁移零字节 diff；`ai-docs/` 恰 0 files 变更（backlog `:60`/`:64` OPEN 原文、UC-052 partial、SSOT 零触碰）。
- C-P4-3 强化：`local_erased` 系 0091 `:88` receipt_kind CHECK 既有枚举值（非新增）；receipt 落账复用既有 `privacy_record_deletion_receipt`（`privacy-authorization.ts:138-146` 亲读）；0091 文件零字节 diff = guard/issuer 主链零语义改动自证。

## 2. fail-closed 链亲验（0141 fence ↔ 0125 claim/purge 链同形逐项比对）

| # | 0125 既有裁定面 | 0141 对应 | 比对结论 |
|---|---|---|---|
| 1 | purge 以 `set_config` 安装 `app.privacy_target_id`+`app.privacy_lease_token`（0125 `:341-342`） | fence 读同一 GUC，三要素（principal/target/lease）缺一即 `42501 vector_plane_erasure_delete_not_authorized`（`:53-57`） | 同形，唯一合法 DELETE 上下文绑定成立 |
| 2 | lease 活性校验 status='leased'+token 等值+未过期（`:336-338`） | `t.status='leased' AND t.lease_token::text=lease GUC`（`:62-63`） | 同形 |
| 3 | sink 恰 `memory_vector_chunk`（claim `:250-252` / purge `:344`） | fence 白名单 `t.sink='memory_vector_chunk'`（`:64`） | 同形 |
| 4 | owner 绑定（claim `:228`/`:243-246`、purge `:326`） | 双检 `r.owner_user_id=principal`（`:65`）+ `OLD.owner_user_id=principal`（`:71-73`） | 同形且行级加严 |
| 5 | scope='account_data'（claim `:247`） | `r.scope='account_data'`（`:66`） | 同形 |
| 6 | request status ∈ fenced/purging/pending_external（claim `:271` / purge `:329`） | `:67` 同集 | 同形 |
| 7 | 全线 42501 fail-closed | `:56`/`:69`/`:72` 三处 42501 | 同形 |
| 8 | SECURITY DEFINER+OWNER+REVOKE（0125 `:297-299`/`:380-383`） | `:77-78` 同形（EXECUTE 撤自 PUBLIC+app_role） | 同形 |
| 9 | claim 十项链（issuer/consumed/expiry/owner/purpose+scope/sink/subject/epoch+digest/drift，`:214-269`）为唯一授权裁定者 | 0141 jti feed 只读解析（`:110-133`，头注自钉"非授权判定"）；jti 缺失→sweep 诚实跳过（模块 `:107-108`），解析错→claim 42501 | 裁定权未转移、未复制，drift 复核仍在 claim |

- **sink_forbidden drift 防线实证**：INT `sink='vector'` 假造 target 经真 claim 入口（0125 claim 十项链原样）→ `42501 privacy_authorization_sink_forbidden`（`:250-252` 既有门）；0141 feed 只出 `memory_vector_chunk`（`:97`）双保险。prove `INT:` 三断言 PASS（不进 feed + sink_forbidden 红 + 假造行清除后真靶 purge 照常绿，且代码内诚实注释 drift 防线本身系十项链一环）。
- **qbank 永不删双证**：fence `kind IS DISTINCT FROM 'memory' → RETURN OLD`（`:48-50`，只拦 kind='memory'）；purge 谓词只删 `owner=principal AND kind='memory'`（0125 `:345-346`）；prove `fence: qbank DELETE 不受 0141 影响` + ⑤ qbank digest 等值 PASS。
- **app_role 自删缺口实关**：fence BEFORE DELETE 触发器对所有角色生效；prove 以 `asPrincipal`（`principal.ts:949` `SET LOCAL ROLE app_role`）无 purge 上下文自删 → 42501 PASS——sink-inventory §5 已披露缺口以运行时证据闭合；错 token（lease 上下文+假 token）→ 42501 PASS，正 token purge 绿 PASS（fence 不拦授权路径）。

## 3. 六件套复核（receipt 实读 + prove 源码逐锚 + 我方 fresh re-run 复现）

1. ①未授权红=真入口：伪造 jti→42501 snapshot_not_found、issued 未 consume→42501 not_consumed、sweep 无 consumed 授权诚实跳过（claimed=0/erased=0/skipped=1 且行数仍 3）——prove `:167-190` 三断言 PASS。
2. ②ANN recall=0=真 ANN 查询：生产缝 `annSearchLegacy`（`retrieval-legacy.ts:11`，HNSW `<=>`）擦除前正对照 hit≥1 且首挑 `vp-mem-1`（probe 与主向量逐字节同源，证非空转）；擦除后同 probe 0 hit + admin 侧直探 0 hit——Ban 行数 proxy 守住。
3. ③行数=0：owner memory 3→0。
4. ④残留=0：0125 `:348-355` 同口径显式 count + purge 内建 `55000 memory_vector_chunk_target_residual_rows` fail-closed 未触发。
5. ⑤跨 subject/qbank intact：他户 memory / owner qbank / 系统 qbank 三组 content_hash+embedding 聚合 sha256 digest 擦除前后逐字节等值 + 他户 ANN probe 仍命中。
6. ⑥DELETE=503：源码钉（零 diff 亲证）+ `pnpm privacy-erasure:http:prove` EXIT=0 19/0 同列入账（receipt 实读）。
- 附加：0091 local_erased receipt hash 可复算（`sha256(targetId:vector_plane:local_erased:deletedCount)`，prove `:213-216` 断言逐字节相等）。
- attempt1 诚实保留实证：`meetwise-line-priv4/.tmp/p4c-prove-attempt1.log` 实读——28 PASS 后 `code: '42P08'` crash、`ATTEMPT1_EXIT=1`、时间 2026-10-07 17:31:42+08，与 receipt 申报逐字吻合；attempt2 17:33:44+08 EXIT=0。

## 4. fresh re-run（本审恰一次 · 禁重试未触发）

- CMD：`./scripts/with-docker-session.sh env -u MODEL_API_KEY -u MODEL_BASE_URL pnpm vector-plane-erasure:prove`（review worktree 内、依赖安装后恰执行一次）。
- 结果：**EXIT=0，33 PASS / 0 FAIL**；`migrations: applied=141 skipped=0`；隔离 PG `pgvector/pgvector:pg16`（R5-MARKED-RED 口径在位：isolation fixture ≠ stack truth ≠ cutover）；`LOCAL_ISOLATED_PROOF_RECEIPT file=.tmp/isolated-proof-receipts/2026-10-07T09-49-50-327Z-4247-5ed7743b….json`（0141 ∈ sourceDigests，21 文件）；尾行诚实披露原文在位（本地行级 ≠ 云端彻底删除 · releaseEvidence=false · HNSW/WAL/备份不在面 · DELETE=503 同列）。
- 与 receipt 申报（attempt2 EXIT=0 33/33, migrations=141 latest=0141）逐项吻合，无漂移。

## 5. 条件裁决（PRE-EXEC C-P4-1~6 逐条）

| 条件 | 裁决 | 依据 |
|---|---|---|
| C-P4-1 alone≠dual | **SATISFIED** | PRE dual 已 BOTH PASS（`b5dd9aa3` 头注载 29cc2dfd+909d6118）；本审仍为单侧 POST-PROVE（本侧），不代签 `mw-e2e-ha`，其并行审独立签发 |
| C-P4-2 target 先钉后码 | **SATISFIED** | target 集钉于 0141 头注 `:6-14`（码前、与双审 stub C-P4-2/C-EH-3 记载一致）；裁 `memory_vector_chunk`（0125 owner+kind 双谓词）+ INT `sink='vector'` 诚实 no-target——本条件明列的合法选项之一（显式申报面试作用域键 **或** 诚实保持 no-target）；不假造键 + `42501 sink_forbidden` drift 防线经真 claim 入口实证，符合双审裁决的诚实原则 |
| C-P4-3 0091 零语义改动 | **SATISFIED** | 0091 零字节 diff 亲证；`local_erased` 既有枚举（0091 `:88`）；receipt 函数/guard 原样复用；无新增 receipt_kind、无重载、guard 触发面零触碰 |
| C-P4-4 断言强度不弱化 | **SATISFIED** | 六件套全保零替换零弱化（§3 逐项）；attempt1 EXIT=1 诚实保留且 log 实存实读吻合；唯一 fix 为确定性 fixture 分参、断言零动；本审 fresh re-run 独立复现 33/33 EXIT=0 |
| C-P4-5 诚实披露沿 AR | **SATISFIED** | cloudVendorDeleted=false 持续；「彻底删除/磁盘字节清零」Ban 叙事零违反；披露口径四处一致（0141 头注/模块 docstring/proof 头注/fresh log 尾行）；sweep completed ≠ 账户删除完成 如实申报 |
| C-P4-6 F-1 转注 | **SATISFIED（义务闲置）** | 新工件（0141/模块/proof/worker）零 `0032`/`p_*` 引用（grep 亲证），本期无更正点；转注仍为 docs-side 持续义务 |

## Blockers

无（none）。

### Conditions（POST-PROVE PASS 附带）

- **CP4P-1 alone≠dual 持续**：本 PASS 仅为 `mw-privacy-int` 单侧 POST-PROVE dual 本侧签发，不构成、不代签 `mw-e2e-ha` 侧；dual 生效以协调方双签汇录为准。
- **CP4P-2 EXIT0 语义钉**：EXIT0 ≠ covered ≠ backlog `:60`/`:64` closed ≠ UC-052 flip（stays partial, coveredCount=8 冻结）≠ DELETE 开放（503 冻结持续）≠ HA ≠ releaseEvidence；本 sweep completed ≠ 账户删除完成；SSOT 翻行仍 Ban。
- **CP4P-3（OB-1 · docs-side 提示，非返工）**：receipt `d01e3d37` 为空提交——收据内容仅存于提交信息，isolated-proof JSON 位于未跟踪 `.tmp/`；后续引用本 prove 证据时以提交信息 + prove 日志为准，不得声称为 file-backed artifact。
- **CP4P-4（OB-2 · docs-side 提示，非返工）**：attempt1 log `.tmp/p4c-prove-attempt1.log` 系 implementer line worktree（`meetwise-line-priv4`）相对路径，主仓 checkout `.tmp` 无此文件；后续 ledger 引用注明所在 worktree。
- **CP4P-5**： pins 原值复核 held：NOT_HA / gR45Closed=true / coveredCount=8 / ms3EqualsR4Closed=false / PG-retained / DELETE=503 / `:60` OPEN / `:64` OPEN / UC-052 partial / canHonestlyFlip=false——零漂移。

### 三行中文摘要

1. POST-PROVE 本侧 PASS：包完整性机检恰 9 files +650/−4，rebase 孪生 `b5dd9aa3`/`972c6c2f` patch-id 双侧全等（`4f1f2d8e`/`952403a2` 亲算），503 冻结面与 0091/0125/0137/0140 及 SSOT 全部零 diff，attempt1 EXIT1 诚实保留且 42P08 log 实读吻合。
2. fail-closed 链亲验成立：0141 fence 与 0125 claim/purge 链八项同形逐项比对吻合、裁定权未转移（claim 十项链仍唯一），app_role 自删已披露缺口以运行时红证据闭合，qbank 永不删双证，INT sink='vector' 诚实 no-target + 假造键 `42501 sink_forbidden` drift 防线经真 claim 入口实证；fresh re-run 恰一次 EXIT=0 33/33（migrations=141）与 receipt 零漂移。
3. C-P4-1~6 六条全 SATISFIED（C-P4-2 裁：诚实不做假造键符合双审裁决精神）；0 Blocker · 5 Conditions（CP4P-1 alone≠dual 不代签 mw-e2e-ha；CP4P-2 EXIT0≠翻行≠HA；CP4P-3/4 docs-side 提示两项）；EXIT0≠covered≠`:60`/`:64` closed≠UC-052 flip≠DELETE 开放。

Verdict: PASS
