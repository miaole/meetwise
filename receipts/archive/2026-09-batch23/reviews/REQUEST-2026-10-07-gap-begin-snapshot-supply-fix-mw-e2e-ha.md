# REQUEST — **通用 begin 供给面收口产品刀**（adaptive_role_route_missing 三红根因修复方案 + trio 复跑方案 · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-begin-snapshot-supply-fix.md` · slice `gap-begin-snapshot-supply-fix.slice.md`
**上游**: F-F EXEC receipt `3da3f0cb`（实跑 code SHA `7ed35f0d` · last_error=adaptive_role_route_missing ×2）· F-F POST-PROVE dual PASS `d4580d6c`(mw-model-op · 根因归类 H0-alt-5·d=产品供给面) + `0d97d7be`(mw-e2e-ha) · **C-MO-Q1~3 转本刀硬义务**
**Base tip**: `91f1c751`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · 初 fetch `0d97d7be` · turn 内 origin 前进恰一笔 = coordinator F-F nail `91f1c751` docs-only · 码面锚零漂移 · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7S**

## Pins（retained · 本 stub 不改）

| Pin | Value |
|-----|-------|
| `haStatus` | **NOT_HA** |
| `releaseEvidence` | **false** |
| `claimProductionHA` | **false** |
| `gR45Closed` | **true** |
| `coveredCount` | **8** |
| `ms3EqualsR4Closed` | **false** |
| Stack | **PG-retained** |
| Public DELETE | **503**（stays） |
| `g7SuiteGreen` | **false**（retained · 至三绿 + post-dual + 协调方 nail · Ban flip true） |
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained · C-MO-Q3：OPEN 至供给面实际修复） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |
| `actualSpendCny` | **null**（沿 I 线 · Ban invented spend） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 诚实性 / HA 口径）

Line G7S · **通用 begin 供给面收口产品刀**（F-F 甄别 + model-op 双审裁决根因的修复 REQUEST）。请审：

1. **根因承卷与码面复核（harness §1）**：`adaptive_role_route_missing` 三红根因 = 通用 begin 面 route snapshot 结构性零写——门 `adaptive-role-resolve.ts:35-39/:55-62`（blob `80abbb80` 默认 ON）+ 消费点 `interview-consumer.ts:343-356`（blob `7b1b6713` · `:344` `roleFromJobRouteMetadata` 死源）+ 全树唯一 snapshot 生产者 `recruiter.ts:428`（blob `d06b4f49`）+ 通用 begin `interview.service.ts:192-340`（blob `257718cf`）`:337` 入队零 snapshot 写、`create():587` 裸壳无 application/job 祖先；断点=「binding→snapshot」跳通用面缺位（结构性无链非链断中段）；`validateModelRouteOutput`（`job-route-classifier.ts:115`，blob `79ceded8`）保证 route_decided 必带有效叶 → 「有 snapshot 而叶空」不可达。行号/blob EXEC 期按当 tip 重核。
2. **修复候选归类与触碰面（harness §2 · C-MO-Q1 承接）**：候选 A（begin 同步供给+前置 eligibility fail-closed 镜像+死源并案 · 本刀推荐）/ B（worker 侧补写）/ C（interview 维度异步漏斗）/ D（范围决策 · 默认不选）利弊是否如实；**门语义零弱化铁律**（fail-closed 门零改动 · 缺叶仍拒 · 修「供给缺失」非「放松门」）；**DDL 硬约束发现**（`0104_job_route_decision.sql:161-173` `application_id/job_id NOT NULL`+FK → 供给候选必涉 DDL 演进；伪造 binding/application = masking Ban）；夹具刀仅红①时序面合法、通用面强造 metadata=masking Ban；opt-out=0 仅 G7 临时 · never R1 · Ban 记作修复。
3. **trio 复跑纪律（harness §3 · G7K C-K1~C-K8 / G7R C-HA-1~8 沿用）**：三条 CMD（`pnpm e2e:isolated`/`e2e:ui:isolated`/`verify:e2e-performance`，wiring `package.json:278/:279/:282` @blob `0afb3bd2` · EXEC 按 tip 重核回填）**各恰好一次**（iso→ui→perf）；单条 CMD 内部重试按自身契约算一次 attempt；七字段逐 attempt 全记录；退出码/machine receipt/原始 log 三来源交叉一致；withhold 机制零触碰（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结）。
4. **预算诚实（harness §3.2）**：上限沿 G7K/G7R **≤200 次 live 调用**；**修复生效后 live 面较 F-F（live=2）显著增大**（uc018 start job 秒抛改真实 adaptive 全展开 ×2 project ×2 CMD 面）——偏差已预披露；超限即停如实记中止；voice/OCR/ASR/TTS capability skip = 0 调用 ≠ green；`actualSpendCny=null` 沿 I 线。
5. **读取面板扩查（C-MO-Q2 硬义务）**：EXEC 期新增授权查询 `job_route_decision`/`route_consumption_event`/`interview_route_snapshot`（SELECT-only 白名单 · Ban `interview_job.payload`/`ai_invocation_trace.output`）定谳红①归因；**Ban 沿 F-F 四查询读数就地定谳红①**；sidecar/keep-window 机制沿 F-F 先例由协调方 EXEC 落字。
6. **EXIT 契约双向（harness §4）**：三绿 → **`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；trio 绿 ≠ suite green）；仍红 → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法 · Ban retry-to-green · Ban 只留绿 attempt**；uc018 面（trio UI 面经过的已占用用例）只许「红转绿」Ban 改其断言。
7. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT/backlog 状态翻转（GAP P1 `0c6c3287` 不翻 · nail 阶段才落字）· Ban 碰已占用行（018/052/025/004/011/014/026/002/001/028/016/017）/sibling 归档（AC/AD/U/L/G7B/G7K/G7R/F-F 零改写）· **Ban recruiter-flow 面回归**（`recruiter.ts:428` 唯一生产者链零改动）。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. Disclosure-1 **OPEN**（C-MO-Q3）. **门语义零弱化** · 供给候选未裁决（A/B/C/D 均为候选）· **Ban 假绿叙事** · Ban 洗断言。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方授权 coding/EXEC；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · 通用 begin 供给面收口产品刀 · Line G7S · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

---

# POST-PROVE dual 审查段（mw-e2e-ha · adversarial evidence-honesty · 2026-10-07/08）

审查方：mw-e2e-ha（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7sp-e2e-ha` · branch `rv/g7sp-e2e-ha` · base `origin/feat/mysql-schema-skeleton`=`a9bc4bcf`）。被审对象：G7S EXEC 链 `939f1b44`（实现 7 files +366/−9）+ `a5ef4280`（trio 收据 4 md）。前缀说明：本段为 append-only 追加，上文 REQUEST stub 原文未动一字（追加前 md5 `a4133e28c9c2af30c2fcbd7a24952a8c` / 6650B 机检在卷）。

## §1 包完整性（机检）

- 恰 7+4 文件：`git diff dc48caf4 939f1b44 --name-status` = 4M+3A 恰 7；`dc48caf4..a9bc4bcf` 全距恰 +4 收据 md（00-summary/01-cmd1/02-cmd2/03-cmd3，全 A）。+366/−9 与声称一致。
- 零触碰 blob 全等自跑（dc48caf4↔a9bc4bcf 逐 blob `git rev-parse` 对碰，全 SAME）：`apps/worker/src/adaptive-role-resolve.ts`=`80abbb80b860`、`packages/db/src/recruiter.ts`=`d06b4f493341`、`e2e/full.e2e.ts`=`7d65d0f35e39`、withhold 冻结 wrapper `scripts/run-e2e-isolated.mjs`=`13dbfc43c744`、`package.json`=`0afb3bd2080b`（wiring :278/:279/:282 亲读在卷）。gate 链零触碰成立 → recruiter-flow 零回归（码面）成立。
- SSOT 零 diff：全距 name-status 除上列 11 文件外零条目；本 review 文件 EXEC 期未被 EXEC 触碰。

## §2 DDL/RLS 亲验（本席 scratch 实测 · 非转抄实现方读数）

scratch：`pgvector/pgvector:pg16` 容器（与 runner `LEGACY_PG_IMAGE_DEFAULT` 同像），全量迁移 **applied=142 skipped=0**（migrate-cli EXIT 0），`schema_migrations` 含 `0142_candidate_profile_route` 行。

- **RLS 姿态（镜像 0104 实测）**：`candidate_profile_route_decision`/`_snapshot` 双表 `relrowsecurity=t` 且 `relforcerowsecurity=t`；`role_table_grants` 中 **PUBLIC grant 行数=0**（postgres 行为 owner 隐式特权非 grant）；`app_role` 恰 SELECT+INSERT ×2 表，无 UPDATE/DELETE；策略恰 2 条 `FOR ALL TO app_role`，`USING`/`WITH CHECK` 均为 `<owner 列> = current_setting('app.principal_user', true)`。跨 owner 读隔离实测：`cand-2` 视角对 `cand-1` 行 visible=0。
- **FK 拒伪造实测**：以 `app_role`+principal 上下文对 snapshot 插入伪造 `decision_id='cprd_0000…'` → `ERROR … violates foreign key constraint candidate_profile_route_snapshot_decision_id_fkey (Key is not present)`；真实 decision 行则 owner 插入成功。
- **单值/CHECK 拒实测**：`attempt_outcome='model_decided'` 与 `allocation_bps=5000` 各自 CHECK 拒（错误原文在卷）。
- **0104 零漂移实测**：`interview_route_snapshot.application_id/job_id` 均 `is_nullable=NO`，`interview_route_snapshot_application_id_fkey` 在位；`application_route_binding` FK ×2 在位；`job_route_decision.job_id` NOT NULL + FK ×1 在位。0142 文件面零 `ALTER`/零触碰 0104 表（`git diff dc48caf4 939f1b44 -- packages/db/migrations/` 恰 +89 新文件）。**C-MO-S2/C-HA-1 additive-only 成立。**

## §3 fresh re-run（恰好一次 · 禁重试已守）

- 命令：`pnpm e2e:ui:isolated`（= `node scripts/run-e2e-isolated.mjs e2e:ui`，wiring :279 @blob `0afb3bd2`）· **恰好 attempt 1** · start `2026-10-07T19:50:03Z` → end `19:52:48Z` · **EXIT=1**（本席 `.tmp/rv-cmd2-ui-attempt1.log` 末行 `CMD2_EXIT=1` · `ELIFECYCLE … exit code 1`）。Key 仅进程环境 loader name-only，零 `.env*` 写入。
- **playwright 计分：12 passed / 2 failed / 10 skipped (2.0m)**——与 EXEC 收据 CMD2 **逐项同值**。
- **修复面：`uc018-abandon.spec.ts:68` 双 project 全绿**（chromium 2.6s / mobile 2.3s）——G7S 修复面由 F-F 红转绿在独立复跑下**可复现**，断言零触碰。
- **红①仍在：`recruiting-bound.spec.ts:56` 双 project 红**（34.1s/35.1s = 30s `waitForURL` 超时签名 ×2）；本席 error-context 页快照双 project 同形：错误边界「出错了 · 错误标识:2026436977」×2（本席 run 内双 project digest 一致；与 EXEC run 的 1817280189 不同值——digest 为实例级非跨 run 指纹，稳定签名是 30s 超时+server action 错误边界+start 面拒启，与 G7K/G7R 基线同形）。
- `E2E_FAILURE class=frontend code=client_exited` ×2 · `ISOLATED_POSTGRES_OUTPUT_WITHHELD`（withhold 契约 `13dbfc43` 生效）；skipped=voice/OCR capability skip=0 调用 ≠ green，如实。**trio 维持 OPEN（EXIT 1），`g7SuiteGreen=false` 不翻转。**

## §4 C-MO-Q2 扩查裁决（红①定谳复核）

- **码面证据链逐环亲读全中**：`validateModelRouteOutput`（`job-route-classifier.ts:115`，校验 schema/taxonomy/校准/bps 和恰 10000/confidence 界）→ 输出不过 → `job-route-decision.ts:103` `route_unresolved`/`attemptOutcome='validation_rejected'`，`:180` `already_unresolved` noop = **sticky 终态永不自动重试** → 无 route_decided revision → `bindApplicationRoute` 不落 binding → `recruiter.ts:410` `return { status: 'interview_ineligible_route' }`（fail-closed 拒启，不创建 interview）→ start server action throw → 错误边界 → 30s `waitForURL` 超时。四行号（:115/:180/:410/:428）以当 tip 文件逐一亲核无误。
- **「begin 时序竞态」假说否定——本席维持并加码**：(a) 构造面——红①在 recruiting-bound（recruiter flow）面，G7S begin 供给仅当 `application_id IS NULL`（`interview.service.ts:333` 亲读）时触发，该面根本不经 candidate 供给路径；(b) 数据面——EXEC 读数 `job_route_decision=route_unresolved/validation_rejected ×2` 为**已落行终态**，非「决策尚未落」的悬空态，重试无对象。双重否定成立。
- **F-F 张力闭合**：「classify succeeded ×2」指**调用**成功（HTTP 200 记账），非输出有效——服务端 `validateModelRouteOutput` 拒其后。与码面语义一致，无矛盾。
- **红①边界裁决：归 route/model-op 侧另刀**（classify 输出质量/校准面）。G7S diff 对 `job-route-classifier.ts`/`recruiter.ts` 零触碰（blob 机检）且 begin 供给面与该面零交集；本席不代 route/model-op 侧定谳输出质量根因（模型校准细节非本刀证据可及）。
- **本席仪器缺口（如实登记，OB 非阻断）**：本席 sidecar 轮询脚本错用 `-U postgres`（实际容器 `POSTGRES_USER=meetwise`），且容器于 EXIT 后即拆除，**本席 fresh run 的 DB 级 Q2 复读数未捕获**（`route_consumption_event`/`interview_route_snapshot`/`candidate_profile_route_*` 行级读数未独立复测）。Q2 裁决据此立于：码面全链亲读 + 红①行为类独立复现（§3：×2/30s/错误边界同形）+ EXEC 收据读数内部自洽且与码面语义无矛盾。禁重试铁律下不再重跑 CMD2，此缺口不构成翻案依据，亦不构成对 EXEC 读数的反证。

## §5 C-HA-1~5 条件裁决（本席逐条）

| 条件 | 裁决 | 依据 |
|---|---|---|
| C-HA-1 DDL 形态封口（additive-only） | ✅ PASS | §2 全项：新表 ×2、零 ALTER、0104 NOT NULL/FK live 复测零漂移、PUBLIC=0、FK 拒伪造实测 |
| C-HA-2 决定论面（rule + uc018） | ✅ PASS | 真代码探针 ×5 例（general-only→backend/general、general+python→backend/python、双语言→ambiguous、全栈词→no_signal_hit、frontend→frontend/web）二次调用全同结果；冻结优先序生效；uc018 双 project 绿复现；`UNIQUE(interview_id)`+ON CONFLICT 幂等 |
| C-HA-3 收据行号诚实 | ✅ PASS | `:203`（=identities===questions 断言行）/`:410`/:428/:115/:333-334/`:344`（已为处置注释，活标识符零残留）逐一亲核全中；CMD1 ✗ 原文 withheld 如实登记非编造 |
| C-HA-4 预算包络 | ✅ PASS | ≤26 ≪ 200、est-not-counter 双轨如实标注（sidecar v1 缺口如实）、`actualSpendCny=null`、超限即停未触发；本席复跑为审查方仪器面（本席 sidecar 失准已 §4 登记） |
| C-HA-5 边界保持 | ✅ PASS | §1 零触碰 blob 全等（gate/recruiter/withhold/full.e2e/package.json）、SSOT 零 diff、断言零改（full.e2e.ts 同 blob）、sibling 归档零触碰 |

## §6 Blockers

**0 Blockers。**

## §7 Conditions（非阻断 · 随卷生效）

1. **C-G7SP-1**：红①（recruiting-bound ×2）维持 route/model-op 侧另刀裁决；G7S 供给面与其零交集，Ban 以本刀名义修 classify 输出质量。
2. **C-G7SP-2**：iso/HTTP 面 `full.e2e.ts:203` 断言语义红维持 e2e 断言侧另刀；**Ban 为绿改断言**（本席复核断言文件同 blob 冻结）。
3. **C-G7SP-3**：trio OPEN（EXIT 1/1/1 原值）· `g7SuiteGreen=false` · Disclosure-1 OPEN 保持至协调方 nail 全链；本 PASS ≠ trio 翻绿 ≠ EXEC 续授权 ≠ nail 授权。
4. **C-G7SP-4**：本席 Q2 DB 级复读数缺口（sidecar `-U` 错用 + 容器即拆）如实随卷；若后续刀需行级对账，须由持新授权的 EXEC 期 sidecar（`-U meetwise`）采样，Ban 以本席缺口为由重跑已封卷 run。
5. **C-G7SP-5**：alone ≠ dual——本段仅为 mw-e2e-ha 半签；mw-model-op 并行审独立出卷，本席不代签、不互见。

## §8 三行中文摘要

1. G7S POST-PROVE 复验通过：7+4 包完整、零触碰面（gate/recruiter/withhold/full.e2e/package.json）blob 全等，0142 DDL 亲验 additive-only——RLS ENABLE+FORCE/PUBLIC=0/owner policy/FK 拒伪造/单值 CHECK 全过，0104 零漂移 live 复测成立。
2. 本席 fresh re-run 恰好一次：EXIT=1，12P/2F/10S 与 EXEC 逐项同值——uc018 修复面双 project 全绿可复现，红① recruiting-bound ×2 以 30s 超时+错误边界同形仍在；C-MO-Q2 定谳维持：classify 调用成功但输出被 `validateModelRouteOutput` 拒 → sticky 未决 → `interview_ineligible_route` 409，「begin 时序竞态」假说被构造+数据双重否定，红①归 route/model-op 另刀。
3. C-HA-1~5 全 PASS、0 Blocker、5 Conditions（另刀边界/trio OPEN/断言冻结/Q2 缺口登记/alone≠dual）；`actualSpendCny=null`；禁 push；本 PASS 不翻转任何 Pin。

Verdict: PASS
