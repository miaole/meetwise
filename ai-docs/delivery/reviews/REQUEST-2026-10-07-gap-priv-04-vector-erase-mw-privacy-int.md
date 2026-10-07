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
