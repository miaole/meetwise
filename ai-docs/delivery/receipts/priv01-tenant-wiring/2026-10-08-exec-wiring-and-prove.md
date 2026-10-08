# EXEC 收据 — **PRIV01-C · GAP-PRIV-01 应用层 tenant 强制接线**（2026-10-08 Asia/Shanghai · meetwise 协调方 AUTHORIZE 后 EXEC · coding+prove 一次优先 · post 双审归协调方派）

**Pins（不变）**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · actualSpendCny=null · backlog `:57` OPEN · UC-052 partial

## 0. base 重钉

- EXEC 开工 `git fetch origin`：origin tip **`5a2994c4`**（满足 ≥`5a2994c4`）→ `git rebase origin/feat/mysql-schema-skeleton` 干净落位（REQUEST 三 commit 重放零冲突）→ **EXEC base HEAD = `566e3b3d`** / full `566e3b3d6408da2fb3de04b405d35229b70de8f6`（全部 prove 运行时 HEAD 亲测同值）。
- 全锚重核：`git diff --stat eef469d9..5a2994c4 -- scripts/run-e2e-isolated.mjs packages/db apps/api` = **空**（上游 cmop03/checklist 两 commit 零 src 漂移）；runner 三道门（supported-target `:1510-1578` / migrate 白名单 `:2315-2317` / `isolatedReceiptSources :93`）、容器块 `:2296-2309`、R1 旧断言、barrel `index.ts:25-32` 在新 tip 逐一实测原位。

## 1. 接线清单（manifest 文件封套 · 精确全量触点数）

常量落盘：`packages/db/test/tenant-wiring.manifest.ts`（P1/P2 同源消费）。计数规则 = proof 扫描同规则（五符号 + `tenant` 路径段 specifier · 剥注释 · re-export span 外 · 按生产 src 文件计）。

| 文件（封套） | 精确计数 | 语义触点 |
|--------------|---------|----------|
| `apps/api/src/modules/interview/interview.service.ts` | **17** | E1×11（begin/turn/submitPreviewAnswer/speak/speakStreamPrepare/transcribe/questionFeedback/abandon/create/list/get）+ α×4（`interview.begin.quizScope`×3 查询 · `interview.begin.bind` 绑定 UPDATE · `interview.submitPreview.issued` GUC→参数 · `interview.list.scope` 列表谓词） |
| `apps/api/src/modules/resume/resume.service.ts` | **9** | E1×2（list/reparse）+ α×5（`resume.list.scope` 列表谓词·原隐式 RLS-only 增量面 / `resume.reparse.existing` / `.updateProfile` / `.updateStatus` / `resume.ocrConfirm.dedupe`） |
| `apps/api/src/modules/quiz/quiz.service.ts` | **9** | E1×3（create/begin/abandon）+ α×4（existingJob/resume/bind/abandon.cas） |
| `apps/api/src/modules/diagnosis/diagnosis.service.ts` | **9** | 同 quiz 镜像（E1×3 + α×4） |
| `apps/api/src/modules/profile/profile.service.ts` | **6** | E1×2（overview/growth）+ α×2（`profile.overview.answered` / `profile.growth.reports`——原 GUC 直读改参数绑定） |
| `apps/api/src/modules/notification/notification.service.ts` | **5** | E1×4（list/unread/readAll/read） |
| `apps/api/src/modules/jobs/applications.service.ts` | **5** | E1×4（mine/start/decline/finalize；finalize 第二 asPrincipal 同 owner） |
| `apps/api/src/modules/commerce/commerce.service.ts` | **3** | E1×2（payWebhook/refundWebhook gateway owner 回查显式校验 · 缺失/空→404 不可区分） |
| `packages/db/src/notification.ts` | **6** | α×4（list/read/unread/readAll 四 fn 补显式 owner 谓词——原 owner 形参零绑定最薄增量面） |
| `packages/db/src/recruiter.ts` | **9** | E1×7（候选侧 applyToJob/listMyApplications/finalizeApplication/markApplicationAssessmentUnavailable/markApplicationNoEligibleScore/startApplicationInterview/declineInvitation · 既有 assertPrincipal 之上补输入形状 fail-closed · owner 值全量流经） |
| `packages/db/src/candidate-route.ts` | **3** | E1×1（`candidate-route.supply` · 两席一致裁定纳入） |
| **合计** | **81** | 文件 11/11 · face B observed=81 == manifestTotal=81 |

导入形态：api 侧全走 `@meetwise/db` barrel；db 内部走相对 `'./tenant/index.ts'`（防桶成环 · 无 `src/` 路径段 → face A 保持 0）。

## 2. 残余面登记（本刀不接线 · Ban 静默缺席 · 全文见 manifest `RESIDUAL_PATHS`）

1. `interview.service.ts` `:673-931` 段 16 处 asPrincipal 入口（读侧）+ `guardInterviewPrivacy :177-190`（E3/E5 先例原样保留不重写）→ 第二波 service 深化。
2. `resume.service.ts` upload/uploadFile/uploadImageViaOcr 入口 + `profile()` 读 → 第二波（owner 谓词在 db resume.ts）。
3. `quiz/diagnosis.service.ts` list/get/events（RLS-only · get 0 行→404 · events 0 行→null→404）→ 第二波。
4. `profile.service.ts` me/settings/changePassword/deactivate（user_account 主键即 principal · 非归属表）→ 不适用另议。
5. `commerce.service.ts` createOrder/payCallback/getOrder/entitlement → 第二波 db 层。
6. `notification.ts` insertNotification（系统插入 · worker lane）→ 第二波 worker 刀。
7. `recruiter.ts` B 端 8 fn + listOpenJobs（角色维度 §3.2 / 公开读 by-design）→ 不接线（角色域）。
8. `candidate-route.ts` getInterviewRouteSnapshotForAdaptiveRole（worker 角色门）→ 第二波 worker 刀。
9. db 深层模块族（resume.ts 18 · interview-jobs.ts 20 · commerce.ts 23 · payment.ts 10 · report.ts 10 · quiz-jobs/diagnosis-jobs 各 9 等系统消费 lane）→ 第二波 db 层刀。
10. 隐私主链/擦除链/向量/记忆/题库 lane owner 点 → **Ban 链不接线**（DELETE=503 冻结 · ADR 门 cite-only）。

## 3. R1 翻正后 face 断言全文（P1 log 逐字 · 供双审逐字比对）

```
PASS  wiring face A (flipped): zero literal src/tenant deep-path imports in production src — hits=0 files-scanned=332 (discipline: barrel/@meetwise/db or db-relative './tenant/index.ts' only)
PASS  wiring face B (flipped): consumption > 0 and EXACTLY equals wiring manifest (file envelope + exact per-file counts) — consumption=81 manifestTotal=81 files=11/11 extra=[] missing=[] mismatch=[]
PASS  R1: barrel re-export present and classified re-export≠consumption (index.ts :25-32) — barrelTenantReexportStatements=2 expected=2
```

翻正方向=**加严非放松**：face A 语义从「零接线=绿」翻转为「零深路径字面导入纪律=绿」（深路径 import 仍零容忍）；face B 从「0=绿」翻转为「>0 且 == manifest 文件集合+每文件精确计数双断言」（双向防静默收窄：未登记文件消费/已登记文件掉触点均 FAIL）；barrel 恰 2 条 re-export 断言零弱化原样。既有 35 基线断言一字不减（P1 PASS=35，其中 3 条即翻正后的接线面断言，占 PRIV01-B 35/0 同槽位）。

## 4. Prove 三段 · CMD + EXIT + attempts 全账（Asia/Shanghai · HEAD 全程 `566e3b3d`）

| 段 | CMD | attempt | 窗口 | EXIT | 结果 |
|----|-----|---------|------|------|------|
| P1 | `pnpm --filter @meetwise/db tenant-enforcement:prove` | attempt1 | 12:33:35..12:33:36 | **0** | **35 PASS / 0 FAIL**（35 基线回绿 + R1 翻正三断言在位） |
| P1 | （manifest 重分类后终态确认） | attempt2 | 12:36:20..12:36:20 | **0** | 35/0（确认跑——P2 缺陷修正触及 P1 所 import 的 manifest，非红后重试） |
| P2 | `pnpm tenant-wiring-e5:prove` | attempt1 | 12:33:47..12:33:48 | **1** | 149/14——**确定性 manifest 分类缺陷**：14 个 α 谓词绑定子触点误标 `single-id` 且自身无 e5Witness（其方法级 E5 分支由同文件兄弟条目见证） |
| P2 | 同 | attempt2 | 12:34:46..12:34:47 | **0** | **163 PASS / 0 FAIL**（singleId=28 fail-closed 见证 · list=16 白名单 · predicates=39 绑定见证 · E4 根在位）——修法=恰 manifest 分类改标 `predicate-bind` + P2 断言分支（零断言语义弱化 · 零产品码变更）· **缺陷定性交 post 双审裁（沿 PRIV01-B E-1 先例）** |
| P3 | `pnpm tenant-wiring-neg:prove`（=`node scripts/run-e2e-isolated.mjs tenant-wiring-neg:prove:raw`） | attempt1 | 12:35:00..12:35:06 | **1** | **确定性 fixture 缺陷**：notification 表 app_role GRANT 仅 SELECT/INSERT/UPDATE（`0001_baseline.sql:478`）→ fixture 预清理 DELETE 触 42501；容器一次性 `--rm` 本无需清理 |
| P3 | 同 | attempt2 | 12:35:42..12:35:48 | **0** | **9 具名红全 PASS**（见 §5）——修法=恰 fixture 去掉无授权 DELETE + 汇总行判定含环境失败（输出序修正 · 零断言语义变更 · 零产品码变更）· **缺陷定性交 post 双审裁** |

一次优先结论：P1 一次过；P2/P3 各一处确定性 test-fixture/manifest 字符串级缺陷，均最小修正后次跑绿——**沿 PRIV01-B attempts 1,0 可采先例与 PRIV4 台账口径，非 `:68` 型 retry-to-green；可采性由 post 双审裁，若裁不可采则各自 attempt1 EXIT=1 诚实保留为 EXEC 终态**。

## 5. P3 具名红（活 PG 端到端 NEG · 一次性容器 `meetwise-e2e-91036-…` · migrate applied=142）

```
PASS  N1  cross-owner list isolation: user-b sees none of user-a notifications — userBrows=0
PASS  N1b unreadCount scoped: user-b=0 while user-a=2 — userB=0 userA=2
PASS  N2  cross-owner single-id read: 0 rows (indistinguishable 404 at API) — rowCount=0
PASS  N3  cross-owner single-id write fail-closed: exactly one attempt → false — attempts=1 result=false
PASS  N3b user-a row untouched by cross-owner write
PASS  N4  cross-owner bulk write: user-b marks 0 of user-a rows — marked=0
PASS  N5  RLS root intact: cross-owner impersonating INSERT rejected (42501) — got=42501
PASS  N6  positive control: user-a own-id markNotificationRead → true — result=true
PASS  N7  helper fail-closed: blank/missing owner → tenant_owner_user_id_required — blank=…_required missing=…_required
```

写路径恰一次尝试：N3 显式 `attempts===1` 断言（无重试循环）。容器 `--rm` 自清理；runner 收据 `LOCAL_ISOLATED_PROOF_RECEIPT`（release_evidence=false）。

## 6. runner 三道门登记（EXEC 后行锚 · 相对 rev3 引锚有位移，位移=本刀 diff 所致）

| 门 | rev3 锚 | EXEC 后锚 | 登记 |
|----|---------|-----------|------|
| ① supported-target 数组 | `:1510-1578` | `:1519-1588`（数组项 `:1538` · throw `:1588`） | `'tenant-wiring-neg:prove:raw'` |
| ② PG-migrate 白名单 | `:2315-2317` | `:2326-2328`（数组项 `:2326` · `migrateWithRecovery` `:2328`） | 同上（migrateWithRecovery 先行 → 空 schema 消除） |
| ③ `isolatedReceiptSources` | `:93` | `:93`（条目 `:975-984`） | 触面文件清单登记 |
| ④ 命令解析（isolatedCommand 链尾） | — | `:1847-1848` | `['pnpm', ['-C', 'packages/db', 'prove:tenant-wiring-neg']]` |

runner 其余逻辑零改动（`node --check` 过）。

## 7. env 探针 / secrets / 触面自检（待 post 双审机检复核）

- env：node v22.22.3 · pnpm 10.18.0 · tsx v4.22.4 · darwin arm64 · PREREQ `pnpm install --frozen-lockfile`（4.7s 零 lockfile 变更）。
- secrets：**零触及**（Key name-only）· `.env*` ABSENT（`ls .env*` no matches）· **actualSpendCny=null**（零云购买 · 容器全本地 docker）。
- EXEC commit 触面 = 恰授权清单：11 接线生产文件 + `scripts/run-e2e-isolated.mjs`（三道门+命令分支）+ 两 `package.json`（named scripts）+ P1 翻正面 + 新增 test×3（manifest/e5/neg）+ 本收据 + harness/slice EXEC 登记。**零 `principal.ts` / 零 migrations / 零 `privacy.controller.ts` / 零 `checkpoint-principal.ts` / 零 worker/`src` / 零隐私·擦除链 / 零 SSOT 四件 / 零双审 stub / 零 secrets**。
- 加载 smoke：12 改动文件 tsx 载入全过（api×8 + db barrel/notification/recruiter/candidate-route）；裸 `tsc -p apps/api` 报错均为 base 既有 test 文件形态（`git show 566e3b3d:…resume.service.ts` 同款 `c.query<{…}>` 泛型在位，非本刀引入）。

## 8. Non-claims（逐条 · 本 EXEC 不宣称）

全绿 ≠ `:57` CLOSED/翻行（翻转=全链+双审+协调方 nail 后另议）≠ RLS abandon 门开 ≠ tenant=RLS 等价（接线为纵深防御**第二层**，授权根今日仍且仅为 PG RLS FORCE + `asPrincipal`+`set_config`）≠ 授权根已迁 ≠ cutover ≠ HA ≠ releaseEvidence ≠ UC-052 flip ≠ DELETE 开放 ≠ ADR 门全绿宣称（privacy-authorization/crypto/erasure 系列仍 cite-only 零执行零复跑零 receipt）≠ coveredCount 变化。E5 两半边切割：应用层半边=P2/P3 兑现；DB 层半边仍归 PRIV01-A 候选 A（待其授权）——**Ban 读作「E5 已全证」**。

---

*Receipt · PRIV01-C EXEC · 2026-10-08 · base `566e3b3d`（rebased on `5a2994c4`）· manifest 11 文件/81 触点精确封套 + 残余面 10 类登记 · P1 EXIT=0（35/0 × 2 跑）· P2 EXIT=0（163/0 · attempts 1,0 缺陷可采性交双审）· P3 EXIT=0（9 具名红 · attempts 1,0 同前）· alone ≠ dual · STOP（awaiting post-prove dual）*
