# SSE-ADV REQUEST — UC-010 SSE 越权重连·批 B nail 后残余 ADV 面（同主体多流交叉）起草卷（docs-only REQUEST 卷·起草落卷即停）

**Status**: **`closed`**（2026-10-27 §9-post post 双审双 PASS 会签席翻终态 · 前值 `executed:awaiting_post_prove_dual`/`draft:awaiting_pre_exec_dual` 史录保留于 §8/§9-EXEC/§9-post/卷尾注不回改 · pre-exec dual r2 双 PASS+协调方授权落码+行使 · 主门 21 断言 EXEC 双 fresh+post 期再两跑全绿（§9-EXEC.5 EXIT 原值在卷·§9-post 收据为凭）· post-dual 席1+席2 双 PASS 落卷（§9-post·红次两笔收据 digest 钉明·stdout 未持久化）· alone≠dual）· **STOP=closed（三处钉：本 Status 行 + §8 + 卷尾·三处同值）** · 本 commit 落码=§9-EXEC 交付面 · EXIT0=case≠covered · 起草 commit 系 docs-only（恰 1 新 .md·零码面零 SSOT 零他卷触）史录。

**席位**：SSE-ADV 起草席（诊断+起草双责·协调方派·认领覆盖矩阵 `:116` UC-E2E-010 ADV 格**批 B nail 后残余面**·与批 B CLOSED 面/批 C 在飞面/UC-011 已落 `:117` 面行级互斥零重叠）。
**基线**：`origin/main` @ **`0246361dd`**（full `0246361dd75ac84beb70c6bed99be387da989499` · 2026-10-27 05:15 +0800 · PR #148 micro-batch 并线 tip · `git fetch origin` 本 turn 成功·worktree 建于该 tip 亲证 HEAD 落位）· `node scripts/ai-docs/check-docs.mjs` 本树亲跑 **EXIT=0 · scanned 2382 ≤ cap 2386**（`public-text-policy.mjs:149` `MAX_FILES = 2_386` 亲证·§2-1）· 分支 `line/sse-adv-draft`（建前 `git branch --list "line/sse-adv*"` 零命中·`git worktree add ../meetwise-sse-adv -b line/sse-adv-draft origin/main` 亲立）· 工作树 `meetwise-sse-adv`（仓根同级）。
**必读清单（EXEC 立项前逐件亲读·显式路径）**：`AGENTS.md` → `ai-docs/delivery/e2e-requirement-coverage-matrix.md`（§0.5 强制列 / §1.0.1 `:116` / §1.0.2 `:147` / §1.0.3 `:164` 双表同步令）→ `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md`（`:46-:48` NHP-010 三行）→ `ai-docs/requirements/use-cases/e2e-scenarios.md`（UC-E2E-010 `:223-:235`·E-越权恢复 `:90`·E-重放去重 `:91`）→ `ai-docs/delivery/harness/nhp-batch-b-REQUEST.md`（§9-EXEC.2 NHP-010-ADV-01 A1–A6 承登+§9-rev.4 两分防误停·**本卷分界基面**）→ `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md`（§1b+G-GAP 六 pin）→ 涉事机制源 `apps/api/src/modules/interview/interview.service.ts` / `interview.controller.ts` / `apps/api/src/platform/last-event-id.ts` / `sse-pump.ts` / `packages/db/migrations/0062_interview_privacy_event_stream_scope.sql` / `0143_sse_push_notify.sql` → 既有证据面 `apps/api/test/uc-e2e-010-sse-resume.proof.ts` / `uc-e2e-010-nhp-adv.proof.ts` / `uc-e2e-002-adv-led-crossuser.proof.ts` / `privacy-erasure-http.proof.ts` / `sse-principal-slot.proof.ts`。
**立项出处（不自建 SSOT 行——翻面权归协调方）**：①协调方派单令（「认领矩阵 UC-E2E-010 行 ADV cell 残余·与 NHP-B 面分界清晰化·侦察发现覆盖殆尽则零残余不入卷」原文随令）；②`e2e-requirement-coverage-matrix.md` §1.0.1 **`:116`** ADV 格现值「**blind** / `case-only`（NHP-010-ADV-01 真证据已落（2026-10-26 批 B nail）…本列状态不动：blind 保持+case-only 措辞登记）」亲读——批 B 已落格后**残余对抗面未盘点**·本卷即该残余盘点+认领卷；③结构范本=`harness/nhp-batch-c-REQUEST.md`（§0-§8 形制·起草时在 `line/nhp-c-draft`（#149 已并线·EXEC 期在树））与 `harness/nhp-batch-b-REQUEST.md` §0-§8（批 B CLOSED 全形）。

---

## 残余盘点（三候选面逐一码面亲证·覆盖殆尽则零残余不入卷·本席裁定=**残余非空·恰一族入卷**）

派单令列三候选面：**①重连游标越权面 ②多流交叉 ③seq 回放越权**。本席对既有证据面全族亲读（`uc-e2e-010-nhp-adv.proof.ts` 60b9da01 196 行 A1–A6 · `uc-e2e-010-sse-resume.proof.ts` 680fbd66 320 行 R1–R4/R-mid/R-authz · `uc-e2e-002-adv-led-crossuser.proof.ts` a26d145d 420 行 V1–V6 · `privacy-erasure-http.proof.ts` d810d165 467 行 410 sweep · `sse-principal-slot.proof.ts` 692c4d01 204 行 · `neg-interview.proof.ts` afd63185 `:509-:513` · `uc-e2e-033-cross-user-authz.proof.ts` `:132/:181/:298` · 相邻单元层臂 `sse-push-notify.proof.ts` 3056a929 934 行 P-4/F2/N2 · `sse-delta-arm.proof.ts` 8a6ff458 319 行 `:189-:199`）逐一裁定：

| 候选面 | 裁定 | 依据（file:line 亲证·详 §1.1 覆盖图） |
|---|---|---|
| ①重连游标越权面 | **覆盖殆尽·零残余** | 游标×主体全矩阵已证：跨主体×合法/伪造高/无游标三形恒 404 零泄出（批 B A5 `:171-:180`）+ malformed×越权/未知流 400 无泄露差（A3 `:151-:159`）+ 伪造高游标 200 空 catch-up=R4 设计内语义（A4 `:161-:169`+R4 `:218-:229`+§9-rev.4 两分）+ 越权删除/围栏流 404/410 fail-closed（`privacy-erasure-http.proof.ts:415` events 入 410 sweep `:427-:432`·`neg-interview.proof.ts:509-:511` 未知流 404）+ 伪造认证 401（uc002 V6）——**游标×授权态全组合无未测格** |
| ③seq 回放越权面 | **覆盖殆尽·零残余** | 回放授权=主体维度已闭（A5/V4/V5/uc033/neg-interview 五面 404 零泄出）+ 回放确定性已证（uc002 V3 重复重放恒定 seq 窗逐 seq 一致）+ 本流 seq 边界已证（R2 `:196-:210` LED=3→[4,5] · R3 `:212-:216` LED=2→[3,4,5]）——**seq 粒度越权除「跨流」维度外无未测格**；其跨流维度即② |
| ②多流交叉面 | **真残余·本卷认领** | 全树**无任何既有 HTTP 级 proof 持双流帧交付隔离断言**：A5 全部臂在他人 principal 的 404 拒绝路径（单流对端）；R 族/R-mid 全单流；uc002 V 族单流；`sse-principal-slot` 只断言槽计数 429 面非数据隔离面——**同主体双流×对抗游标交换×双持实时注入的「零跨流帧交付」断言零存在**（rg 亲证：`apps/api/test/` 全 proof **无 HTTP 级双流帧交付隔离断言**；相邻单元层臂已登记 §1.1） |

**结论**：残余非空——认领面收窄为恰「**同主体多流交叉**」一族（`NHP-010-ADV-02`）；两候选面①③覆盖殆尽如实登记不入臂（**Ban 重复批 B 断言**·派单令「不重复该断言」条款兑现）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 Read/rg/git hash-object 实测 @`0246361dd`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表 + 在飞交叠登记

- `git worktree list` 建后 **32 树**实测——`line/sse-adv-draft` 恰 1 命中=本席分支；`ls ai-docs/delivery/harness/ | grep sse-adv` 建前零命中→落卷后唯一同名卷=本卷。
- **已落面互斥亲证**：批 B（#146 `b894cad88` 并线）ADV-01 A1–A6=**CLOSED**（`nhp-batch-b-REQUEST.md` Status=`closed` 三处钉·§9-post 双 PASS 会签）；UC-011 `:117` ADV=uc011 线已落（`GAP-UC011-ADV-01` CLOSED wired+2026-10-26 tip 收据注记·refund 域与 SSE 域零重叠）；UC-002 `:113` ADV=Line R V1–V6 已落。本卷认领面=`:116` 格内批 B 未触的**同主体多流交叉**——**格级共存不冲突**（EXEC 期对 `:116` 格作 additive append 注记·批 B 既有措辞一字不洗）。
- **在飞线逐树亲读**（`git log -1` + `git diff --name-only origin/main...<branch>` + ancestor 亲证）：
  - **基线现值（本修订 turn `git fetch origin` 亲证）**：`origin/main` tip=**`39cf555c4`**（#150 micro-batch2 并线）·cap 届值=**`MAX_FILES = 2_394`**（origin/main `public-text-policy.mjs:151` 亲证·本树 `:149` 仍 2_386）。
  - `line/nhp-c-draft` **已落**（#149 `69e603255` 并线·origin/main 祖先亲证）——其双矩阵邻区/cap 脚本/runner/两 package.json 触面随并线在树·其 case-matrix 增行使本卷 `:48` 以下行号漂移已兑现（EXEC 期照 §0 协议对届时 tip 重 pin·如实改锚）。
  - `line/killsw-draft` @`249331328`（已落文·触仅自有 `killsw-REQUEST.md`）·`line/pay-neg-draft` @`40926d7af`（已落文·触仅自有 `pay-neg-REQUEST.md`）——两线与本卷触面**零交叠亲证**。
  - `line/reassess-draft` @`9c4784bc5`（EXEC 落卷·本修订 turn 亲证其上更增 `582d4cf08` 配额放宽 chore）——触 runner（`run-e2e-isolated.mjs`）+root package.json+cap 脚本（`public-text-policy.mjs`）+egress inventory 四点→**EXEC 复核必交涉项**（与本卷 EXEC 注册行/egress 登记面共享·届时逐件交涉·Ban 静默并改）。
  - `line/ag18-draft` @`4c2ea4c9f`（非 main 祖先）——触 `apps/api/src/modules/interview/interview.service.ts`+`apps/api/src/platform/sse-notify.service.ts`（**本卷机制缝同文件**）——EXEC 期 `git log -1 -- <缝文件>` 逐树复核。
  - `line/cap-2272` @`52846f9d8`（非 main 祖先·旧 cap 线）——触 `sse-notify.service.ts`；`line/uc31-draft` @`112ac8af0`——认领 `:129` 面与本卷零重叠。
- **在飞交叠复核规则（EXEC 立项日必做）**：本卷起草 turn 产品触面=0（docs-only 恰 1 新 .md）；EXEC 期触面=隔离 prove 新文件（`apps/api/test/uc-e2e-010-nhp-crossstream.proof.ts`）+双表行内改（矩阵 `:116` 格 additive append+case-matrix `:48` 后新行）+注册行（root/apps-api package.json+runner 注册位·沿批 B 五位形·boot() 形先例不入迁移族表）。届时对各在飞分支执行 `git log -1 -- <触面文件>` 逐树逐件复核，任一分支顶对任一触面存在 `0246361dd` 之后新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`0246361dd`）

| 文件 | blob（8 hex·行数） | 关键行锚 |
|---|---|---|
| `ai-docs/delivery/e2e-requirement-coverage-matrix.md` | `6fc92dd0`（520 行） | **§1.0.1 `:116`（UC-E2E-010 行·ADV 格现值 blind/`case-only` 批 B nail 注）·`:117`（UC-011 行·uc011 线面·本卷零触）**·§1.0.2 **`:147`（UC-002/010 SSE/lease 分面行·三值 blind+批 B/uc002/uc017 注记）**·`:148`（011/017/019）·§0.5 `:47-84` 强制列（`covered` 禁填 `:80`）·§1.0.3 `:164` 双表同步令 |
| `ai-docs/delivery/non-happy-path-perf-load-case-matrix.md` | `cbf9d97f`（199 行） | **`:46` NHP-010-FAULT-01（partial）·`:47` NHP-010-NEG-01（partial）·`:48` NHP-010-ADV-01（blind→case-only·批 B 收据）**——本刀 EXEC 新行 `NHP-010-ADV-02` 插于 `:48` 后（additive·三既有行零触）·`:40` NHP-001-PERF-api-01（批 C 面零触） |
| `ai-docs/requirements/use-cases/e2e-scenarios.md` | `9976f9c3` | UC-E2E-010 `:223-:235`（主流程 `:227` 重连带 `Last-Event-ID=N` 增量重放 seq>N · E-replay `:231` 不丢不重从断点续 · 验收 A2 `:235` 仅重放 seq>N）· E-越权恢复 `:90`（0 行→404 不泄露存在性）· E-重放去重 `:91`（事件不重不漏） |
| `ai-docs/delivery/harness/nhp-batch-b-REQUEST.md` | `65060326`（235 行） | §9-EXEC.2-3（NHP-010-ADV-01 A1–A6 承登）· §9-rev.4（malformed/well-formed 两分防误停）· §9-post 席2 安全面四项推演——**本卷分界基面（其 CLOSED 面零触零洗零重复）** |
| `ai-docs/delivery/harness/uc-e2e-010-sse-resume.md` | `06e29b3a`（122 行） | §1b 缺口清单+G-GAP 六 pin（`:305-:317` proof 侧）·本刀对其零触 |
| `ai-docs/delivery/REMAINING-NORTH-STAR-QUEUE.md` | `a7d8959a`（54 行） | Phase 2 item 12（`:28`）one-knife-one-row（批 A/B/C 同源·本卷系批 B 行内残余面·非新 SSOT 行） |

### 0.2 码面锚（机制缝+证据面·symbol 级位移按 symbol 重钉）

**机制缝（残余面行使靶·全亲读）**

| 锚 | blob（行数） | 钉位 |
|----|------------|------|
| `apps/api/src/modules/interview/interview.service.ts` | `a8ae0d15`（918） | **`:910-:917` `events()`——`:911` `parseLastEventId` 先于 privacy · `:912` `asPrincipal(principal)` RLS 上下文 · `:913` `guardInterviewPrivacy` · `:914` `SELECT seq,kind,payload FROM interview_event WHERE stream_key=$1 AND seq>$2 ORDER BY seq`（**游标裸数字无流绑定·流隔离全托 `stream_key=$1` 单谓词**）**·`:64-:75` `guardInterviewPrivacyTx`（rowCount 0→404 `not_found_or_forbidden` · fence→410 `interview_privacy_fenced` 双出口）·`:413-:414` 委托 |
| `apps/api/src/modules/interview/interview.controller.ts` | `d10db4ae`（280） | **`:257-:279` `GET :id/events`——`:261-:262` per-principal 槽 5（429 `too_many_streams`）·`:264-:265` initial null→404 ·`:273` `fetchMore(lastSeq)`=每轮重调 `events(req.principal, id, …)` 重过 guard ·`:276` `deltaSource=getSseNotify().subscribeToken(id, onFrame)`（订阅键=流键）·`:278` finally 释放槽** |
| `apps/api/src/platform/sse-pump.ts` | `b93121dc`（223） | **`:169`/`:191` `notify.waitFor(o.streamKey)` per-streamKey waiter ·`:199` `fetchMore(lastSeq)` ·`:130` 权威帧 `id: ${e.seq}` ·`:165` token_delta 无 id 帧（§C-4 光标防毒）·`:73`/`:146` per-streamKey delta 环形缓冲（「广播复制·禁互偷帧」`:64`）** |
| `apps/api/src/platform/last-event-id.ts` | `40b12d01`（18） | `:8-:18` 双门 fail-closed（`:10-:11` regex 门 · `:14-:16` 安全整数门 · 均 400 `invalid_last_event_id`）——批 B A1/A2 已证·本卷零臂 |
| `packages/db/migrations/0062_interview_privacy_event_stream_scope.sql` | `9e5dec05`（87） | `:8-:41` `interview_event_stream_privacy_active`（principal=owner 硬门 `:13-:16` · interview 墓碑防绕先于 quiz/diagnosis 查找 `:24-:28`）·`:59-:62` `p_owner` policy（USING+WITH CHECK 同谓词） |
| `packages/db/migrations/0143_sse_push_notify.sql` | `4d4bf7c4`（37） | `:12-:19` AFTER INSERT→`pg_notify('interview_event_ch', NEW.stream_key)`——**payload 恰裸 stream_key 零 owner 零事件数据·lossy hint 唤醒后重取必经 `events()` guard** |
| `packages/db/migrations/0214_interview_event_statement_notify.sql` | `d1f36f17`（27） | **`:22-:27` `DROP TRIGGER IF EXISTS interview_event_sse_notify`+`FOR EACH STATEMENT`+`REFERENCING NEW TABLE AS inserted`（语句级触发器·`:16-:17` 按语句过渡表 DISTINCT stream_key notify·通道/载荷仍裸 stream_key）——已取代 0143 逐行活机制（0143 文件字节不改仅历史）** |
| `packages/db/migrations/0208_unstube_event_immutable_relax.sql`+`0219_interview_event_retention_purge.sql` | `6f6b90e5`（59）+`6bccd18b`（149） | **immutable 豁免臂**——0208 `:51-:56` DELETE 面四元豁免（TG_OP+privacy_worker_owner+purge GUC+session_user 合取）·0219 `:94-:110` 0208 体逐字节保留+恰一 additive DELETE 臂（retention worker·序末回 0195 恒拦基线）·UPDATE 面零豁免 |
| `packages/db/migrations/0195_interview_event_settlement_append_only.sql` | `d323706e`（41） | append-only（BEFORE UPDATE OR DELETE·**UPDATE 面恒拦·DELETE 面仅 0208/0219 四元豁免臂（harness 不可达）**·23514）——账本零写副作用断言的静态旁证 |

**既有证据面（覆盖图载体·零触只读）**

| 锚 | blob（行数） | 钉位 |
|----|------------|------|
| `apps/api/test/uc-e2e-010-nhp-adv.proof.ts` | `60b9da01`（196） | A1 `:119-:136`（malformed 七臂 400）·A2 `:138-:149`（2^53 门）·A3 `:151-:159`（解析门先于 privacy）·A4 `:161-:169`（伪造高游标 200 空 catch-up）·**A5 `:171-:180`（跨主体三形 404 零泄出——本卷 Ban 重复）**·A6 `:182-:193`（POST/PUT 注入拒收+账本零变） |
| `apps/api/test/uc-e2e-010-sse-resume.proof.ts` | `680fbd66`（320） | R1 `:185` · R2 `:196-:210` · R3 `:212-:216` · R4 `:218-:229` · R-mid `:232-:273` · **R-authz `:275-:303`** · G-GAP `:305-:317`（六 pin） |
| `apps/api/test/uc-e2e-002-adv-led-crossuser.proof.ts` | `a26d145d`（420） | V1/V2/V3（伪造 LED 族·V3 重复重放恒定窗）·V4/V5（跨 user 零泄）·V6（伪造认证 401）——uc002 行面·本卷零臂 |
| `apps/api/test/privacy-erasure-http.proof.ts` | `d810d165`（467） | `:415` events 入 410 sweep · `:427-:432` fencedEndpoints 断言（围栏态 SSE=410） |
| `apps/api/test/sse-principal-slot.proof.ts` | `692c4d01`（204） | `:197` 5+1 429+shared principal bucket——**槽计数面已证·数据隔离面未证（残余面旁证分界）** |
| `e2e/helpers/sse.ts` | `f41719a2`（110） | SSE 助手（EXEC 臂复用基面·零触） |

### 0.3 认领登记（`:116` 格现值亲读逐字）

| 位置 | 现值（亲读 @`6fc92dd0`） | 本刀认领 |
|---|---|---|
| 矩阵 `:116` ADV 格 | **blind** / `case-only`（**NHP-010-ADV-01 真证据已落（2026-10-26 批 B nail）**：…17 断言 · **EXIT0 = case ≠ covered** · 本列状态不动：blind 保持+case-only 措辞登记 · §1.0.2 :147 blind 保持 · coveredCount=8 不变） | **残余面**=同主体多流交叉（`NHP-010-ADV-02`）·EXEC 期格内 **additive append** 注记（批 B 措辞一字不洗·格值 blind 保持+case-only 措辞沿同形） |
| case-matrix `:46-:48` | FAULT=partial · NEG=partial · ADV-01=blind→case-only（批 B 收据） | EXEC 期 `:48` 后 additive 新行 **`NHP-010-ADV-02`**（010 · ADV · api · 同主体双流游标交换/双持实时跨流注入 · 期望=零跨流帧交付+账本零变 · blind→case-only 措辞）·三既有行零触 |
| §1.0.2 `:147` | UC-002/010 三分面 blind（PERF_api/PERF_web/LOAD_worker+批 B/uc002/uc017 注记） | **零触**（本刀 ADV 面非 PERF/LOAD 证据·Ban n/a 偷关 Ban wash·三值 blind 保持） |

## §1 红事实（机制链·全部亲证 @`0246361dd`·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 覆盖图（已落证据九族·本卷零臂零重复·Ban 借证 wash）

1. **游标伪造两门**：malformed 七臂+2^53 非安全整数恒 400 具名码（批 B A1/A2+`last-event-id:unit:prove` 直行使面+uc002 V1）。
2. **伪造高游标语义**：well-formed 越前游标→200 空 catch-up+hold=R4 重放游标设计内语义非机制红（批 B A4+R4+批 B §9-rev.4 两分）。
3. **跨主体订阅拒绝**：他人 principal×合法游标/伪造高游标/无游标三形恒 404 零泄出（批 B A5）+R-authz+uc002 V4/V5+uc033 `:132/:181/:298`+neg-interview `:509-:513`+uc017 `:308`——**跨主体维度证据六面冗余**。
4. **注入拒收**：HTTP 无注入口 POST/PUT→404+账本零变（批 B A6）+伪造认证 401（uc002 V6）。
5. **围栏/删除态**：围栏后 events→410 `interview_privacy_fenced`（privacy-erasure `:415/:427-:432`）·未知流/越权流 404 同信封不泄露存在性（`e2e-scenarios.md:90` 原文机制）。
6. **回放确定性**：本流 seq 边界（R2/R3）+重复重放恒定窗（uc002 V3）+R-mid live-tail→LED 续传。
7. **槽位面**：per-principal 5+1→429 `too_many_streams`（sse-slot `:197`）——计数面已证。
8. **相邻单元层臂·notify 路由层（层=notify 路由非 HTTP 帧交付）**：`sse-push-notify.proof.ts`（`3056a929` 934 行）——P-4 `:312-:334` waiter 层异流不误醒 · F2 `:415-:424` 双键通知 · N2 `:682-:687` 双流全醒。
9. **相邻单元层臂·token 分派层（非 HTTP 帧交付）**：`sse-delta-arm.proof.ts`（`8a6ff458` 319 行）`:189-:199` token 分派层跨流不误投——**B1–B4 与其零重复**（本刀四族臂全在 HTTP 帧交付面·两行臂在单元层路由/分派面·层异面正交）；B3 token_delta 子句仅单元层同构·HTTP 级空白注记（rg 亲证·残余盘点②行/§1.2 同源）。

### 1.2 残余缝四读码面（同主体多流交叉·注入缝逐条 file:line）

- **游标无流绑定缝**：`Last-Event-ID` 头=裸十进制数字（`last-event-id.ts:10` regex 无流域）——游标与流的绑定关系**只存在于服务端查询谓词** `WHERE stream_key=$1 AND seq>$2`（`interview.service.ts:914`）；客户端携 A 流游标订 B 流不构成任何门（非 malformed 非 404 路径）→ 唯一隔离防线=该单谓词+`p_owner` RLS（0062 `:59-:62`）双层。**跨流混淆行为语义（skip-not-error）零既有断言**。
- **seq 命名空间 per-stream**：`UNIQUE(stream_key,seq)`（0001/0027 族）——seq 非全局单调，跨流游标值语义不互译；B 流高游标施于 A 流=`seq>$2` 空集（R4 同构跨流变体）；A 流游标施于 B 流=恰重放 B 流 `seq>cursor` 段——**「跨流游标交换后各连接帧集恒不出本流」零既有断言**（A5 三形全在他人 principal 404 拒绝路径·本面全在 200 路径内断言帧隔离·两臂面正交）。
- **实时尾跨流隔离缝**：hold 尾等待臂=per-streamKey waiter（`sse-pump.ts:169/:191`）+0143 notify payload 恰裸 stream_key（`0143:12-:19`）+唤醒后重取必经 `events()` 重过 guard（controller `:273`→service `:913-:914`）+delta 臂 per-streamKey 环「禁互偷帧」（`sse-pump.ts:64/:73`）——构造上隔离，但**「S1 hold 中向 S2 注入→S1 连接零 S2 帧（含 token_delta 帧零出现）」零既有 HTTP 级断言**（rg 亲证：`apps/api/test/` 全 proof **无 HTTP 级双流帧交付隔离断言**；相邻单元层臂已登记 §1.1·既有注入臂单流 R-mid uc010 `:232-:258`）。
- **账本零写副作用**：events 面=纯 SELECT（`interview.service.ts:914` 唯一语句）+0195 append-only——跨流对抗全程账本字节恒等零既有跨流对照臂。

### 1.3 否决面（三否决·本席起草适用·EXEC 期同纹·命中即停）

1. **Ban invent covered**：隔离 prove EXIT=0 仅=case 证据；`:116` 格措辞只允许 blind 保持+case-only additive 注记·**禁止升 covered/partial**·coveredCount=8 零翻转·covered 翻面权归协调方（§0.5 `:80` covered 禁填沿承）。
2. **Ban live key**：零 `MODEL_API_KEY` 加载/伪造·零 live 外呼·boot() 内剥 provider key（`_neg-harness` 既有形）·est live=0（§6）。
3. **Ban retry-to-green**：任一门红即停如实登记·attempts 台账逐次留痕·禁红后重跑冲销·禁改既有断言凑绿。

### 1.4 修法裁决：**恰 1 子刀 `NHP-010-ADV-02`（同主体多流交叉隔离 prove·docs+test-only·零产品码触）**

- **新 proof**=`apps/api/test/uc-e2e-010-nhp-crossstream.proof.ts`（`_neg-harness` boot() 形·沿 uc010-nhp-adv 同壳·隔离壳 run-e2e-isolated 注册沿批 B 五位形·boot() 形先例三件不入迁移族表）。Fixture：同主体 userA 持双流 S1（seq 1..3）+S2（seq 1..5）·userB 零权限对照·**S1/S2 分语句种子（0214 语句级触发器单条多行 INSERT 触双键 notify）+各一张 userA interview 行（沿批 B 壳）**。
- **臂（四族·期望值逐条对码）**：
  - **B1 跨流高游标（skip-not-error 跨流变体）**：userA 携 S2 游标 5 订 S1 → 200+空 catch-up+hold ping 非 4xx/5xx（`914` 谓词 `3>5`=空集·A4/R4 语义同构）+零帧零 `id:` 行。
  - **B2 跨流低游标（核心隔离断言）**：userA 携 S1 游标 1 订 S2 → 200+恰 S2 `seq=[2,3,4,5]`（kinds/payload 逐字节=S2 种子）+**零 S1 seq/kind/payload 帧字节出现**（`914` `stream_key=$1` 单谓词真隔离·`e2e-scenarios.md:231` 不重不漏跨流变体）。
  - **B3 双持实时跨流注入**：userA 双连接同持 S1+S2（2≤5 槽·429 面零重复只引 sse-slot 旁证）→ S1 hold 中向 S2 注入新 seq → S1 连接零 S2 帧（含 token_delta 零出现·`sse-pump.ts:169` per-streamKey waiter+`0143` 裸 stream_key+`controller:273` fetchMore 重 guard 链）·反向同构对称断言。
  - **B4 账本零变+确定性**：B1–B3 全程双流账本字节恒等（SELECT-only+0195 append-only）+B2 重复行使恒定窗（uc002 V3 同构跨流版）+userB 对照三流均 404 零泄出（A5 同值复证一行·**非重复臂·仅作分界对照锚**）。
- **双表同步令**：EXEC 期同 turn 改矩阵 `:116` 格（additive append）+case-matrix 新行（§1.0.3 `:164` 强制）·缺列视为未完成 G2/G6。
- **egress 预置条款（词面登记与 proof 同 commit）**：EXEC proof 臂文**避开 `MODEL_API_KEY`/`MODEL_BASE_URL` 词面**（boot() 剥 Key·零 provider 词面→`provider-egress-inventory.json` 零新登记·批 B §9-EXEC.1 同裁）；若届时臂文必含词面→沿 uc025 `7bb462445`/uc028 `10b920521` 先例 **environment_references additive 双登记与 proof 同 commit**（漏登即 CI `environment_reference_unregistered` 红停）·两形二择一落卷如实登记。

## §2 验收断言（pre-exec 双审核对单基面·起草门 4 门本 commit 适用+EXEC 预基面届时重 pin·**数字口径以实跑实测为准·熔断阈值即停止条件「验收红不可修」触发面**）

1. **docs:check（红停条款）+ cap 预算核**：`node scripts/ai-docs/check-docs.mjs` EXIT=0·起草亲跑 **EXIT=0 · scanned 2382**（本卷落卷前基）·本修订 turn 本树亲跑 **EXIT=0 · scanned 2383**（本卷 .md 在树）·cap 届值=**2_394**（origin/main `39cf555c4` `public-text-policy.mjs:151` `MAX_FILES = 2_394` 亲证·本树 `:149` 2_386）→ **2383 ≤ 2_394 = 不越限·无需步进·无越限臂联动**；若 EXEC 期在飞并线使届时 scanned > 2_394 → 触「验收红不可修」停手上报（cap 上抬权归协调方·Ban 就地改 cap）。
2. **markers 五类零命中**：本刀改动集新增行五类标记词 grep 零命中（词族沿 `scripts/i6-239-gates.proof.mjs:154-:163` 门口径·词面运行时组装·不复抄卷内防自指·命令与回执入 EXEC 收据·起草 turn 本席已亲跑 0 命中）。
3. **diff 面机检**：起草 commit `git diff --numstat <base>` **恰 1 tracked 路径**=本卷 .md（多任何 tracked 路径即停）；EXEC 期 diff 面=本卷+双表行内改（矩阵 `:116` 格+case-matrix `:48` 后）+新 proof 文件+注册行（root/apps-api package.json+runner 五位）+egress 登记按 §1.4 二择一——届时逐件登记。
4. **est live=0**：零实跑零模型外呼零 Key 加载（§6）。
5. **EXEC 预基面（届时重 pin）**：隔离 prove EXIT=0 **双 fresh**（实现方恰一次+独立复验恰一次·attempts 台账含红次如实）·邻面不回退（`uc010:sse-resume:prove`/`uc010:nhp-adv:prove` EXIT=0 恒等·**批 B 收据面零回归**）·typecheck/lint 按届时口径·双表同步 diff 逐件登记·任一门红→§8 停止条件。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码面零触**：`apps/`、`packages/` 产品源零 diff（EXEC 期仅新增 test prove 文件+注册行·沿 uc001/uc025/批 B nhp 族 prove-only 先例）。
2. **批 B CLOSED 面零触**：`uc-e2e-010-nhp-adv.proof.ts`/`uc-e2e-010-sse-resume.proof.ts` 及一切既有 proof 文件**零触只读引用**（Ban 只增臂 Ban 复用壳内断言——本卷 prove 为独立新文件）·批 B REQUEST 卷与其 `:116` 格既有措辞一字不洗。
3. **他线面零触**：UC-011 `:117`+case-matrix `:58-:61`（uc011 线）·UC-002 `:113`（Line R）·批 C 在飞面（`:112/:120/:121/:146/:150`+case-matrix `:40-:42/:86-:89`）·`:147-:148` 分面行·其余 §1.0 行只读。
4. **共享 SSOT 零改**：REMAINING-NORTH-STAR-QUEUE / product-campaign-LEDGER / execution-master-checklist / gap-bug-backlog 只读引用——翻面权归协调方。
5. **covered/queue 翻面零预支**：本刀收据不构成 covered 抬升·Ban 预写翻面措辞。
6. **零迁移零配置**：Ban 新迁移 Ban 触告警/CI 配置（越界即停）。

## §4 依赖

**①上游已满足**：机制缝全在树（§0.2 blob 亲算 13 件）+ `_neg-harness` boot() 壳先例（批 B 同形）+ run-e2e-isolated 三层壳+批 B EXEC 注册五位先例形。**②无同文件并发**：起草 turn 恰 1 新 .md 零交涉面；EXEC 期触矩阵 `:116` 格与 case-matrix `:48` 邻区——§0.0 在飞交叠复核必做（批 C 同文件行级互斥·ag18 线同缝文件）。**③下游**：`:116` 格残余面收据供 covered-lift 评估族引用（评估权归后继刀·本刀 Ban 代评）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（§1.3-③）；Ban invent covered（§1.3-①·含升格 partial/借旁证 wash）；Ban live key（§1.3-②·含伪造 Key 面/硬跑 blocked 面）；Ban 重复批 B 断言（A1–A6/R 族面零重复臂·B4 userB 对照仅一行分界锚）；Ban 触批 B/批 C/UC-011/UC-002/uc31 等他线触面（§3-2/§3-3）；Ban 触产品码面/迁移/CI 告警配置（§3-1/§3-6）；Ban 改共享 SSOT（§3-4）；Ban 触任何既有 proof 文件（零触只读引用·§3-2）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包；Ban 就地归因门矩阵外新红（若现新红→如实登记升级·Ban 借机修）；Ban 借本刀收据宣 PERF SLO/生产容量/HA/跨副本槽合同（`GAP-UC010-CROSS-REPLICA` 本进程内壳不可关·仍归后刀）。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本 commit）：est live=**0**——零实跑零模型外呼零 Key 加载·零生产操作·零 secrets·零消耗（EXEC 期隔离 PG·零模型外呼·§2-5 承）。

## §7 markers=0（卫生声明）

本刀改动集（本卷 1 .md·起草 turn）**五类标记词 grep 零命中**（起草席亲跑·词面运行时组装口径 `i6-239-gates.proof.mjs:154-:163` 防自指·回执随 EXEC 收据留痕——沿批 B/批 C §7 同形制）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `closed`**（2026-10-27 §9-post post 双审双 PASS 会签翻终态·原值 `executed:awaiting_post_prove_dual` 史录留痕不洗·更早 `draft:awaiting_pre_exec_dual` 史录不洗·三处钉=文首 Status/§8/卷尾同值）· alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权——本卷授权已兑现：pre-exec dual r2 双 PASS 放行+协调方派单令授权落码+行使）· **开工三条款已核**：①pre-exec 双审两外席 BOTH PASS 落卷（r2 双 PASS）；②协调方明示 EXEC 授权（派单令）；③EXEC 立项未改 §1.4 修法面与 §5 Ban/pins 与 §1.3 三否决 · 立项时照 §0 协议对届时 tip 全量重 pin（落点见 §9-EXEC.0·缝 blob 零漂·行号锚零移·§0.0 在飞交叠复核已做：#152 `fc33c04e6`/killsw `f39fcc0de`/pay-neg `1787a84e4`/ag18 `4c2ea4c9f` 逐树亲证零相撞）。**停止条件（四类·命中即停手上报·Ban 就地处置）——EXEC 期核：四类全未命中（§9-EXEC.6）**：
- **现场漂移**：届时 tip 对 §0.1/§0.2 任一锚 blob/机制漂移且结论受疑（`:116` 格被他刀改写·`events()` `:910-:917` 谓词/sse-pump per-streamKey 缝变·批 C 线并线改写双矩阵邻区·ag18 线并线改写 `interview.service.ts`/`sse-notify.service.ts`）→停·重 pin 回炉。
- **机制不满足**：EXEC 期新臂收据与 §1.2 红事实推定形不符（如跨流低游标重放出他流帧=真泄漏·B1 高游标得非 200·账本现写副作用）→根因诊断被证伪→**产品真红**→停·EXIT1 诚实保留+backlog 登记如实升级协调方（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出 §1.4 恰 1 子刀面（需触产品码/他线面/covered 翻面/共享 SSOT/迁移/告警配置）→停·另刀或协调方裁决（Ban 就地扩面）。
- **验收红不可修**：§2 任一门红且根因不在本刀交付面（docs:check>2386/邻套件新红/typecheck/lint 超）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

---

## §9-EXEC（2026-10-27 EXEC 立项落卷·pre-exec dual r2 双 PASS+协调方授权落码+行使已兑现·上文 §0-§8 一字不洗·冲突处以本节为准读）

**§9-EXEC.0 并线+§8 全量重 pin（届值如实采）**：`git fetch origin` EXIT=0·origin/main tip=**`e072e957f`**（#151 reassess 已并线）→ `git merge-tree` 预演 EXIT=0 零冲突 → `merge --no-ff` 落 **`a0b5893f4`**（届值含 #152 `line/clock-e2e-draft` @`fc33c04e6` 在飞如实采未并）·`pnpm install --frozen-lockfile` EXIT=0。**缝 blob 全量重 pin 零漂**：`interview.service.ts`=`a8ae0d15`/`interview.controller.ts`=`d10db4ae`/`sse-pump.ts`=`b93121dc`/`last-event-id.ts`=`40b12d01`/`0062`=`9e5dec05`/`0143`=`4d4bf7c4`——对 §0.2 起草锚**逐字节全等**（行号锚零移·`events()` :910-917/pump per-streamKey :169/:191 原值在树）·**现场漂移未命中**。**cap 重 pin**：并线树 `public-text-policy.mjs:155`（EXEC 时点锚·本支 sanction 注记两行插入后届树实位 `:157`·§9-post 勘正）`MAX_FILES = 2_397` 亲证（#151 恰等步进 2394→2397 零余量）·本支 REQUEST +1=**2398 越限亲证 `PTP_FILE_LIMIT:2398>2397`**（check-docs EXIT=1 红停承登）→ **协调方届值 2402 如实采**（#152 在飞预登同值 2397→2402 未并·未在 main 如实采）·先手步进 2397→2402（+5 恰等零多放=REQUEST1+proof1+receipts3·policy.mjs 注记+越限臂 fabricated 数联动 2_402/2403·`public-text-policy:prove` EXIT=0）·终验 `check-docs` EXIT=0 **scanned 2401 ≤ 2402**。**reassess #151 四点交涉面已在树对 union 后注册位重对账**：①runner 注册行（批 B `uc010:nhp-adv` 三位+批 C pre-migrate 第四位均在树·本刀沿批 B 三形——pre-migrate 位 N/A（`_neg-harness` boot() 自载 schema 非迁移链依赖·批 B 同形先例）·resource-caps 第五位 N/A（非 PERF/LOAD 面））；②root+apps-api package.json（union 后插入位亲证）；③cap 脚本（如上）；④egress inventory 373 目亲证 EXIT=0。**在飞顶值重录**：`line/killsw-draft` @**`f39fcc0de`**（2026-10-27 已自并 #151·触仅自有 killsw-REQUEST.md·与本刀触面零交叠亲证）·`line/pay-neg-draft` @`1787a84e4`（触仅自有卷）·`line/ag18-draft` @`4c2ea4c9f` 未并（触 `interview.service.ts`+`sse-notify.service.ts` 缝文件——本树缝 blob 对起草基线零漂·零现场漂移·在飞如实采）。

**§9-EXEC.1 egress 二择一（P2④）=避词面路**：本刀 proof 臂文零 provider 词面（rg 亲证零命中）→ `provider-egress-inventory.json` **零新登记**（environment_references=373 恒等·gate EXIT=0）·REQUEST §1.4 第一形兑现·双登记路不触发。

**§9-EXEC.2 件① proof 落码+P2×5 全履行+attempts 台账**：`apps/api/test/uc-e2e-010-nhp-crossstream.proof.ts`（`_neg-harness` boot() 形·沿批 B 壳）四族臂 **21 断言**（B1 跨流高游标 skip-not-error ×4·S1.maxSeq=3<S2 游标 5 夹具保证/B2 跨流低游标零跨流帧 ×4·P2② kind/payload 值域互斥种子（s1_*/s2_* 独立 marker+流标签 payload·seq 2,3 跨流同值不可判别故值域互斥为判别面）/B3 双持实时跨流注入零互偷 ×8·自装 0214 语句级触发器**字节版本钉明**（bytes=898 sha256=14279a1acb06e11c·pg_trigger 实证+重连窗 6s·token_delta 零出现子断言配主动注入 S2 权威行+token 通道双帧动作+S2 自身交付对照=P2③）/B4 账本零写副作用+确定性 ×4·**P2① 措辞勘误兑现：双流三形**（userB 对照=双流 S1/S2×三形 合法游标/伪造高游标/无游标 六探恒 404 零泄出·非「三流」误读）/G-GAP ×1·**P2⑤ GAP-pin 承登在卷**（harness RLS=sql 镜像 owner-match stub ≠ 0062 域查 RLS ≠ fence covered·0062/围栏 410 面归真迁移链主证 privacy-erasure-http）。**attempts 台账（红次如实·Ban retry-to-green 未触）**：attempt1 **EXIT=1**（3/21 红=B3 隔离两臂+B4 tail）·归因两件均本刀交付面非产品红：①健康通道下空 catch-up 空闲连接 **Node 响应头随首字节延迟冲刷**（sse-pump 无 flushHeaders·健康 30s 兜底前线上零字节）→status=0 观测窗 artifact——**非跨流泄漏**（同窗对照臂 S2 全收到注入帧+token×2·B4 appended-exactly 全过·跨流零字节实质成立）；②B4 tail **bigint seq 以 string 返回**（`"6"!==6`·proof 侧类型错）。修正：两方向持线各配**本流自身注入帧**（线活非空窗·隔离断言由「零帧」升格「帧集=本流自身注入 seq 且零他流域字节」·强度只增不减·断言名零凑绿洗）+`Number()` 归一·attempt2 **EXIT=0 21/21**·attempt3 独立复验 **EXIT=0 21/21**（双 fresh：实现方 attempt2+复验 attempt3·恰两次绿·红次两笔在账）。

**§9-EXEC.3 件②注册+双表行内改**：runner 三位（SOURCE_PATHS 新行含 0214 迁移件/allowlist 新行/isolatedCommand 分支）·root package.json `uc010:nhp-crossstream:prove(:raw)` 两行+apps-api `prove:uc010-nhp-crossstream` 一行·矩阵 `:116` 格 **additive append**（批 B 措辞一字不洗·格值 blind 保持+case-only 注记·coveredCount=8 零翻转）·case-matrix `:48` 后新行 **NHP-010-ADV-02**（`：49`·三既有行零触·§1.0.3 `:164` 双表同步令兑现）·§1.0.2 `:147` 零触 blind 保持。

**§9-EXEC.4 件③收据**：`ai-docs/delivery/receipts/nhp-010-adv-02/` 3 件（00-docker-info.txt/01-isolated-receipt.json outcome=passed exitCode=0/02-stdout.log=attempt2 全绿 stdout·not evidence of record）·红次收据 digest 钉明留痕·stdout 未持久化（§9-post 勘正·两笔红收据 sha256=`b90137f1…`/`49dfd3ee…` 钉于 §9-post 席1-1）。

**§9-EXEC.5 门矩阵亲跑 EXIT 原值**：`docker info`=0（Server Version 29.5.2·2 CPUs）·主门 `uc010:nhp-crossstream:prove` attempt1=**1**（3/21 红次如实承登）·attempt2=**0**（21/21）·复验 attempt3=**0**（21/21）·邻门 `uc010:sse-resume:prove`=**0**（13/13·批 B 收据零回退）·`uc010:nhp-adv:prove`=**0**（17/17·零回退）·`check-docs`=**0**（scanned 2401≤2402）·root lint=**0**（预算 5306·stash 基线 5306 恰等·本刀文件 0 warning 零动）·provider-egress=**0**（373）·apps-api typecheck=**0**·markers 五类零命中（词族沿 `i6-239-gates.proof.mjs:154-163` 门口径·词面运行时组装防自指不落卷·亲跑 0 命中）·`public-text-policy:prove`=**0**（2_402 atCap+2403 overCap 越限臂联动后）。

**§9-EXEC.6 停止条件四类核**：**全未命中**——现场漂移（缝 blob 零漂·`:116` 格零被他刀改写）；机制不满足（主门绿·跨流隔离 200 路径内「帧集=本流自身注入+零他流域字节+零 token_delta」双方向亲证·账本 appended-exactly）；越界需要（交付面九件内闭环·零产品码触·零迁移零 CI/告警配置）；验收红不可修（cap 越限已按批 B/A §9-post 先例形 EXEC 实测步进落码·协调方届值 2402 如实采·**待协调方追认**·越限臂联动同步）。est live=0（零模型外呼零 Key 加载·boot() 内剥除）·⛔push ⛔force-push 全程兑现。

---

## §9-post（post 双审双 PASS 会签席落卷 · 2026-10-27 · **STOP 三处钉翻终态 `closed`** · 沿 nhp-batch-b-REQUEST §9-post 先例形在树亲证）

**post 输入**：§9-EXEC 门矩阵在卷（三处钉 `executed:awaiting_post_prove_dual`·待 post-prove 双审）→ post 双审席1+席2 分头行使（alone≠dual·协调方派单令所列两席范围）→ 双 PASS 会签 → 三处钉（Status 头+§8+卷尾）翻终态 `closed`；各历史节内 token（§8/§9-EXEC 节内原值）保留留痕不洗。卷 closed ≠ covered ≠ 矩阵列升格：coveredCount=8 零动 · releaseEvidence=false · Not HA · 翻面权归协调方。本节复跑 stdout 留痕 `.tmp/post-*.stdout`（gitignored 本地证据·durable 凭证=`.tmp/isolated-proof-receipts/` 收据 JSON+其 sha256）。

- **席1 PASS（红次两笔归因机器实证+B1-B4 实质对码+五门独立复跑+cap 三方一致·本席届树亲证）**：
  1. **红次两笔归因机器实证（红账收据 digest 钉明·stdout 未持久化）**：红账两笔=attempt1 收据 `.tmp/isolated-proof-receipts/2026-10-27T00-39-45-725Z-73817-3f61a253-cbe0-40aa-afa9-4f035e81517d.json`（exitCode=1·文件 sha256=`b90137f1bd39b71c5ac0d7fee300a500947e82b3f494af8f6916faa6aa6efe3a`·内载 proof digest=`a95dad6d68c587d0…`）+attempt1b 收据 `…2026-10-27T00-42-22-083Z-74146-4caf1ce6-cae7-4385-83cd-451ab3d0d3ec.json`（exitCode=1·sha256=`49dfd3ee9c5a8930f23fb81c5defde3da5efb763f794f523f39fad32b1fe0a74`·proof digest=`08e59136a1ac0871…`）；绿账 attempt2/3 proof digest 恒=`7b2f0010edc34b3c…`=本树 on-disk sha256 亲算全等。**归因机证**：红绿四收据 `sourceDigests` 十目逐一对照——**除 proof 文件外九目（run-e2e-isolated/bounded-command/_neg-harness/controller/service/last-event-id/pump/notify-service/0214sql）逐字节恒等**，红→绿差异面被机证收窄至 proof 单文件（`a95dad6d`→`08e59136`→`7b2f0010`）·产品/机制零触。**两笔红因定性**：①**status=0 观测窗 artifact 非跨流泄漏**——proof `holdStream` 探针 status 仅在 fetch resolve 后赋值·空 catch-up 空闲连接无首字节→Node 响应头随首字节延迟冲刷（`flushHeaders` 全仓 rg 零命中亲证）→整窗零字节可读→holdMs abort 时 status 恒 0；同窗对照臂反证：红次仅 3/21 红（§9-EXEC.2 承登=B3 隔离两臂+B4 tail），同窗 S2 对照臂（收到注入权威行 seq=[6,7]+token×2）与 B4 appended-exactly 全绿=注入活体+交付链完好+跨流零字节实质成立；②**B4 tail bigint 类型错**——pg int8 以 string 返回（`"6"!==6`）·proof 侧类型处理疏。**修正=严格断言升格非凑绿**：两方向持线各配本流自身注入帧（线活非空窗）后，隔离断言由「零帧」升格「**帧集=本流自身注入 seq 恰等 且 全窗零他流域字节（kind s2_/marker s2-live/流标签三族判别·值域互斥）且 token_delta 零出现（配对主动注入+自身交付对照在证）**」（proof `:232/:235/:267/:270` 断言名亲读）——强度只增不减·零既有断言冲销零删臂+`Number()` 归一（`:288-:291` 亲读）。Ban retry-to-green 未犯（红账两笔在账零冲销）。
  2. **B1-B4 实质对码（21 断言逐族对机制锚）**：B1×4（`:143-:147`）↔`interview.service.ts` events() `stream_key=$1 AND seq>$2` 跨流高游标空集 200+hold ping skip-not-error；B2×4（`:162-:175`）↔同谓词低游标恰重放 seq=[2,3,4,5]+kind/payload 值域互斥种子逐帧核+重复行使恒定窗；B3×8（`:190-:271`）↔自装 0214 语句级触发器（pg_trigger 实证+bytes=898 sha256=`14279a1acb06e11c…` 字节钉·对 0214 收据 digest 恒等）+per-streamKey waiter（sse-pump `notify.waitFor(o.streamKey)` 逐轮重注册亲读）+delta 环「广播复制·禁互偷帧」+token_delta 无 id 帧；B4×4（`:281-:301`）↔账本 appended-exactly（初态逐字节恒等+恰增声明注入行零多余行）+userB 双流三形六探恒 404 零泄出；G-GAP 三 pin（`:306-:312`）。断言形与 §1.2 红事实+§9-EXEC.2 承登逐条对上·proof 头 HONESTY 钉「EXIT0=case≠covered」在。
  3. **五门独立复跑（本席 fresh·收据在 `.tmp/isolated-proof-receipts/`）**：主门 `uc010:nhp-crossstream:prove` **EXIT=0 21/21**（第三 fresh·receipt `2026-10-27T03-36-07-837Z-47738-8257214d-23c7-4312-866e-ed406fb2788e.json`）；邻门 `uc010:nhp-adv:prove` **EXIT=0 17/17**（receipt `…03-36-44-648Z-48174-d07bcec4-1c80-4059-b954-35c8f22f2f13.json`·批 B 收据零回退）；`public-text-policy:prove` **EXIT=0**（12/12·2_402 atCap+2403 overCap 越限臂在证）；`provider-egress:prove` **EXIT=0**（7/7·373 目零新登记）；`check-docs` **EXIT=0 · scanned 2401≤2402**。
  4. **cap 2402 三方一致**：本支 `scripts/ai-docs/public-text-policy.mjs:157` `MAX_FILES = 2_402` 亲读 = origin/main `961f5ef12` 同文件 `:157` `2_402` 亲读 = 派单令届值 2402——三方恒等（fetch 后 origin/main tip=`961f5ef12` 亲证）。
  5. **P2×5 登记（非阻塞）**：（P2-1）§9-EXEC.0 policy 行位锚 `:155` 系 EXEC 时点值·本支 sanction 注记两行插入后届树实位 **`:157`**——本节同笔勘正（时点注记保留·史录不洗）；（P2-2）§9-EXEC.4「红次 stdout 于 .tmp 台账留痕」句不实——`.tmp` gitignored 可覆写·红次 stdout 已不在·durable 凭证=两笔红收据 JSON 及其 sha256（本席-1 钉明）——本节同笔按派单令改句；（P2-3）红账两笔（attempt1+attempt1b·proof digest 两值）与 §9-EXEC.2 只明细 attempt1 的 3/21 叙述并存——attempt1b 系两修正之间诊断跑·本条补登记·§9-EXEC 原文不洗；（P2-4）§9-EXEC.0 受管文件算术「+1 REQUEST=2398·净增 4 终态 2402」系名义算术·实测本支 scanned=**2401**（`02-*.stdout.log` 非 TEXT_EXTENSIONS 扫描面·proof `.ts` 在扫·实测值为准）·非阻塞；（P2-5）**并线 cap union 曝正面（升级项·停手上报中）**：本支与 #152 各自恰等步进至 2402·双 at-cap 并线 union 实测 **2406>2402**（/tmp dual-keep 试合并 worktree 亲跑 `check-docs` → `PTP_FILE_LIMIT:2406` EXIT=1·净超来源=本支受管净增 4：REQUEST+00-docker-info.txt+01-receipt.json+proof.ts）——cap 上抬权归协调方（§2-1 Ban 就地改 cap）·并线终验第一门红·命中派单令停止条件「验收红不可修」·**停手上报待 sanction 步进或另裁**。
- **席2 PASS（主门+邻门独立复跑+安全面四项读码推演+10 sourceDigests 重算全等+六 blob 恒等·本席独立行使）**：
  1. **独立复跑**：主门 `uc010:nhp-crossstream:prove` **EXIT=0 21/21**（post 期又一 fresh·receipt `2026-10-27T03-45-15-204Z-49362-203cf09d-1120-4af8-a163-bdfa5ade5086.json`）；邻门 `uc010:sse-resume:prove` **EXIT=0 13/13**（receipt `…03-45-29-563Z-49632-70e600fa-c77d-4946-8e63-0ebbe31722a3.json`·批 B 收据零回退）——主门 EXEC 双 fresh+post 期两跑=四绿·红账两笔零错位。
  2. **安全面四项读码推演（源码逐行亲读）**：①游标无流绑定——`last-event-id.ts` regex 门 `^(0|[1-9]\d{0,15})$`+安全整数门双门 fail-closed 400（亲读）·流绑定只存在于服务端谓词 `stream_key=$1 AND seq>$2`（service events() 亲读·SELECT 唯一语句）+RLS 双层——跨流高游标=空集 200 skip-not-error（B1）·跨流低游标=恰本流段重放（B2）·既非 4xx 亦无他流字节；②实时尾隔离——per-streamKey waiter（sse-pump 亲读）+0214 语句级触发器 notify 载荷恰裸 stream_key（亲读 `DISTINCT stream_key`）+唤醒后 fetchMore 重调 events() 重过 guard（controller `:273`→service 亲读）+delta 环 per-streamKey 广播复制（`subscribeToken(id)` 订阅键=流键·禁互偷帧）——B3 双方向注入+对照臂+token_delta 零出现全在证；③授权面——per-principal 槽 5（429 `too_many_streams`·拒连路径零取数副作用·controller 亲读）+privacy guard 先于游标语义（userB 双流三形六探恒 404 零泄出·404 body 无账本内容·存在性不泄露）；④账本零写——events() 唯一语句=SELECT+0195 append-only·B4 appended-exactly 双流逐字节恒等+恰增声明行·零隐式写副作用。
  3. **10 sourceDigests 重算全等**：绿收据 `ai-docs/delivery/receipts/nhp-010-adv-02/01-gate-uc010-nhp-crossstream.isolated-receipt.json` `sourceDigests` 十目对本树逐一 sha256 重算——**10/10 全等**·schemaManifest 217 迁移 latest=0219 恒等。
  4. **六 blob 恒等**：`git hash-object` 亲算 `interview.service.ts`=`a8ae0d15`/`interview.controller.ts`=`d10db4ae`/`sse-pump.ts`=`b93121dc`/`last-event-id.ts`=`40b12d01`/`0062`=`9e5dec05`/`0143`=`4d4bf7c4`——对 §0.2/§9-EXEC.0 六钉**逐字节恒等**·现场漂移未命中。
  5. **P2×5 登记（非阻塞）**：（P2-1）先轮 post 尝试残留（`.tmp/review-seat1-*` 五件+收据 `03-12/03-13/03-17Z` 三笔全绿·未落卷）——本节全部以本席/席1 fresh 收据为准·残留仅 provenance 注记；（P2-2）B3 重连窗 6s 夹具骑 establish 退避上界 5s+健康兜底 30s（sse-pump 亲读）——上游退避参数变更需夹具窗联动重钉·夹具耦合观察；（P2-3）B3 token 帧系夹具级 `pg_notify('interview_token_ch')` 直注（零模型涉入）·est live=0+egress 避词面路维持（provider-egress 373 恒等·席1-3 复证）；（P2-4）G-GAP 三 pin 复证在印——harness RLS=sql 镜像 stub ≠ 0062 域查 RLS ≠ fence covered·跨副本 LISTEN 面 `GAP-UC010-CROSS-REPLICA` 沿承·EXIT0=case≠covered 维持；（P2-5）本席复跑均在并线前支 tip `992039dc8` 行使——union 树面门（typecheck/lint/scan/ancestor）归并线终验·现被席1-5 cap union 升级项拦停·随升级一并待协调方裁。
- **STOP 终态=`closed`（三处翻面=Status 头+§8+卷尾）**——翻面依据=主门 21 断言 EXEC 双 fresh+post 期再两跑全绿（四 fresh）+红次两笔归因机证在卷（席1-1）+B1-B4 实质对码（席1-2）+邻门 sse-resume 13/13+nhp-adv 17/17 零回退（席1-3/席2-1）+安全面四项推演（席2-2）+10 sourceDigests 全等+六 blob 恒等（席2-3/4）+P2 errata 两处随卷落+post 双审双 PASS 会签；史录 token 保留 provenance 不回改；后续=并线 PR 走 main（fetch origin/main `961f5ef12` ✓→merge-tree 预演 ✓（policy.mjs+policy.proof.mjs 双注释冲突 dual-keep 解·/tmp 试合并亲证）→merge --no-ff→`pnpm install --frozen-lockfile`→终验五门→push→PR）——**终验第一门 docs:check 对试合并树实测 scanned=2406>2402 红（席1-5 P2-5·cap 上抬权归协调方·停手上报中）**·矩阵行/coveredCount/backlog 翻面权仍归协调方（本节 append 纯文面零码动·两处勘正=本卷自有文面归位）。
- **P2 errata 随卷（派单令两件·本节同笔落）**：①§9-EXEC.4「红次 attempt1/1b stdout 于 .tmp 台账留痕不入卷（cap 恰等预算内）」句改「**红次收据 digest 钉明留痕·stdout 未持久化**（§9-post 勘正·两笔红收据 sha256=`b90137f1…`/`49dfd3ee…` 钉于席1-1）」；②§9-EXEC.0 policy 行位 `:155` 勘正 `:157`（时点注记保留·席1 P2-1 同笔）。
- **并线收官承登（2026-10-27 sanction 席落卷·协调方常设预授权行使·append-only·本段纯文面登记）**：
  - **并线明细**：`git fetch origin` EXIT=0·origin/main tip=**`cab3c7092`**（#152 `961f5ef12`+`fc33c04e6` 与 #153 `e01db6990` 均已并线·届值如实采）→ `git merge-tree` 预演 **EXIT=1**（冲突恰两文件=`public-text-policy.mjs`+`public-text-policy.proof.mjs`·均为 cap 2397→2402 注释行 trivial 冲突——#152 与本支同值步进各自随刀注记·**双注释并留 dual-keep** 解·常量 `MAX_FILES=2_402` 双方同值 auto-merge 零漂移·越限臂 fabricated 数双方同值 2_402/2403 零漂移）→ `merge --no-ff` 落 **`6216a2ad0`**（共享文件 additive 直并零相撞亲证：e2e-requirement-coverage-matrix.md+non-happy-path-perf-load-case-matrix.md+apps/api/package.json+package.json+run-e2e-isolated.mjs·root lint 5306/api 1447 双亲同值取大零动）。
  - **帽对账（合并树实测）**：并线树终验亲跑 `check-docs` → **`PTP_FILE_LIMIT:2406>2402` EXIT=1**（对席1-5 P2-5 /tmp 试合并预演值 2406 恒等复证）→ 协调方常设预授权 sanction「cap/lint 以合并树实测为准恰等步进免再询」行使：**cap 2402→2406 +4 恰等零多放**（=本支净增 4 受管文件 REQUEST+proof+docker-info+receipt JSON 并入·stdout.log 非扫描面不计）·`policy.mjs` 注记链顶插 2402→2406 对+步进链 `→2406`+`MAX_FILES=2_406`·`public-text-policy.proof.mjs` CAP-SANCTION-2406 随刀+越限臂 fabricated 联动同步 2_406/`f-2406.md`/`FILE_LIMIT:2407`·`public-text-policy:prove` 复跑 EXIT=0·步进 commit `chore(test): 放宽文档配额登记` 随卷——**席1-5 P2-5 升级项（停手上报）与 STOP 段「终验第一门红」由本段 sanction 行使闭环**·越限臂强度只增不减（2402→2406 恰等带多扫 4 件预算·错误臂 2407 早返回语义不变）。
  - **复跑五门（并线+步进后届树·EXIT 原值随本段在卷）**：`check-docs` EXIT=0 scanned 2406=cap 恰等零余量 · `turbo typecheck` EXIT=0 · `turbo lint` EXIT=0（root 5306/api 1447 双帽恰等零新增）·markers=0 · `git merge-base --is-ancestor origin/main HEAD` 祖先亲证 EXIT=0。
- **并线收官承登·二轮（2026-10-27 #154 killsw 后到 union·协调方常设预授权再行使·append-only·上轮承登系其届树时点值史录保留）**：
  - **并线明细**：PR #155 在装期 `git fetch origin` EXIT=0·origin/main tip 前移 **`cab3c7092`→`27a87781b`**（#154 killsw `b00c09df3` 已并线·届值如实采）→ `git merge-tree` 预演 **EXIT=1**（冲突仍恰两文件=`public-text-policy.mjs`+`public-text-policy.proof.mjs`·killsw EXEC 2402 对+union 2402→2405 对与本支 sanction 注记相撞·**双注释并留 dual-keep** 全数保留·常量行/越限臂行 union 解）→ `merge --no-ff` 落 **`11d0c09a8`**（lint 帽 package.json 双亲 auto-merge 取大：root 5306→5334/api 1447→1475·runner 注册位 additive 并入·矩阵 .md additive 并入）。
  - **帽对账二轮（合并树实测）**：并线树终验亲跑 `check-docs` → **`PTP_FILE_LIMIT:2409>2406` EXIT=1** → 常设预授权 sanction 行使：**cap 2406→2409 +3 恰等零多放**（=killsw 并入受管净增 3：REQUEST+2 proof·stdout 收据非扫描面不计）·`policy.mjs` 注记链顶插 2406→2409 对+步进链 `→2409`（2405/2406 双支并行如实标注）+`MAX_FILES=2_409`·`public-text-policy.proof.mjs` CAP-SANCTION-2409 并线 union 随刀+越限臂 fabricated 联动 2_409/`f-2409.md`/`FILE_LIMIT:2410`·`public-text-policy:prove` 复跑 EXIT=0·步进 commit `chore(test): 放宽文档配额登记` 随卷。
  - **复跑五门二轮（#154 union+步进后届树·EXIT 原值随本段在卷）**：`check-docs` EXIT=0 scanned 2409=cap 恰等零余量 · `turbo typecheck` EXIT=0 · `turbo lint` EXIT=0（root 5334/api 1475 双帽恰等零新增）·markers=0（三标 grep 零命中）·`git merge-base --is-ancestor origin/main HEAD` 祖先亲证 EXIT=0。

---

*SSE-ADV REQUEST · 2026-10-26 起草（STOP=`draft:awaiting_pre_exec_dual` 史录保留零字洗）· 2026-10-27 §9-EXEC 翻面（`executed:awaiting_post_prove_dual` 史录保留零字洗）· 2026-10-27 §9-post post 双审双 PASS 会签翻终态 **STOP=`closed`**（三处钉：Status 行+§8+本行·前值史录不回改）· UC-010 SSE 越权重连批 B nail 后残余 ADV 面 · 认领=同主体多流交叉一族（`NHP-010-ADV-02`·B1 跨流高游标 skip-not-error/B2 跨流低游标零跨流帧/B3 双持实时跨流注入零互偷/B4 账本零变+确定性·双流三形）· 主门 21 断言双 fresh 全绿（红次两笔在账·全 EXEC 夹具/proof 侧归因）· 邻门 sse-resume 13/13+nhp-adv 17/17 零回退 · egress 避词面路零新登记（373 恒等）· cap 2397→2402 届值三方一致（§9-post 席1-4·并线 union 越限面如实升级协调方 §9-post 席1-5） · 并线 origin/main `e072e957f`（#151·merge `a0b5893f4`·#152 `fc33c04e6` 在飞如实采未并）· 分支 `line/sse-adv-draft` · 工作树 `meetwise-sse-adv` · coveredCount=8 不变 · §1.0.2 `:147` blind 保持 · EXIT0=case≠covered · alone≠dual·post-dual 双审双 PASS 已落卷（§9-post） · est live=0 · markers=0 · pins 十一值零翻 · ⛔push*
