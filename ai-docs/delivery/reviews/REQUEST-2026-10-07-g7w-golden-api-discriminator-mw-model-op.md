# REQUEST — **G7W golden 冷启归因 + api 面拒因甄别刀**（两甄别实验设计：golden ×3 受控复现 + CMD1 sidecar 仪器化甄别 · ≠ 修复 ≠ trio 翻绿 ≠ 残红定谳）· pre-exec · mw-model-op

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-model-op`
**Knife**: `harness/g7w-golden-api-discriminator.md` · slice `g7w-golden-api-discriminator.slice.md`
**上游**: 本席 G7U POST-PROVE PASS `7e76e6c1`（残红后移登记承卷：golden 2R/1G 非确定性双档在卷 · api 面 G7S 同形 40560/37904/38428ms class=api receipts 亲验 · route_decided ×2 先于 begin 全过 · sidecar 白名单族亲读合法确认）· coordinator G7U nail `bbc361fa`（残红三点另刀预留）· F-F 甄别刀先例（本席 F-F RE-PRE PASS C-MO-P1 证伪分支处方 + §1.2-A 机制 + 读 DB 不破 stderr withhold 确认）· FLK 预注册先例（每实验假设+判读+反例）
**Base tip**: `bbc361fa`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7W**

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
| `actualSpendCny` | **null**（retained） |
| Trio | **OPEN**（G7U 真测 **1/1/1** · 全 attempt 如实 retained） |
| 残红② golden 冷启 | **OPEN**（2R/1G 非确定性 · 本刀指名面） |
| 残红③ api 面 | **OPEN**（G7S 同形 retained · 本刀指名面） |
| 残红① 旅程自适应早停 ×2 | **OPEN**（非本刀 · 处置权归协调方） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · backlog `:107` 状态行不翻） |

## 请审什么（mw-model-op · 判读表忠实性 / 模型消费面 / 供给面修复定谳逻辑 / F-F 承卷一致性）

Line G7W · **golden 冷启归因 + api 面拒因甄别刀**（G7U nail 残红②③ 指名后继 · 甄别=只读诊断 · Ban 修复）。请审：

1. **F-F 承卷一致性（本席处方复读）**：实验二机制是否原样承 F-F §1.2-A（sidecar 直读隔离 PG · wrapper stdout tee `.tmp/` 不入 git · 端口行 `:2310` 触发 · 容器 finally 拆除前最后成功快照即证据 · 读 DB 不读 stderr）；逐查询执行状态 ok/error 纪律（本席 F-F C-HA-FF-3 处方）是否硬闭合；**embedding/rerank 签名显式证伪分支**（本席 F-F C-MO-P1 处方：读数现 `qbank.embedding-*`/`qbank.rerank` 签名=registry wired:false 前提被打破 → 如实记矛盾 + 回协调方，Ban 扫入基建 catch-all、Ban 就地 reinterpret）是否逐字承卷。
2. **判读表忠实性（本审首责）**：J-A1 last_error 值域映射是否与 F-F §1.4 判读表逐值一致（结构门 `interview_resume_reference_*` / invoke 内部态 `model_*_state` / 基建 checkpoint/SQL throw / `reaped:worker_died` 反例分支）——**F-F 已定谳值域本刀零重裁**；J-A5 provider/准入面（401/404 invoke 层扁平化 `provider_rejected` 不可分注记沿 F-F 随行 · 值迭代须新 EXEC 沿 C-MO-7 纪律）；`interview-jobs.ts:214-215` last_error 写入方（blob `33fbecba`）与 `full.e2e.ts:384` class=api 兜底分类（blob `7d65d0f3`）码面锚请独立复算；交叉互证规则（单一读数不定谳 · 「与 X 一致」≠「X 已证」沿 G7R C-MO-2）。
3. **G7S 供给面修复定谳逻辑（本审首责）**：J-A3（全 done + completed + consumption/snapshot 行在 + trace >0 → 下游尾段 · 供给面修复已生效红后移）vs J-A1/J-A2（供给/classify 面仍在）vs J-A4（早段）三分是否对称完备——G7U CMD3 37.9s vs G7S 38.4s「同形不同内容」的定谳是否被正确设计为**本刀产出而非预claim**；J-A2 classify 面（G7S C-MO-Q2 `validation_rejected`/`route_unresolved` sticky 同族）与 G7T v2 校准（`result_validated` 翻绿先例）的相容性判读；Ban 把「api 面未变」误读成「G7S 修复无效」的措辞纪律（修复面=begin 供给链 · CMD1 面可能与之正交——判读表是否如实区分）。
4. **实验一模型消费面旁证**：golden 冷启三假说（H-G1 chromium/worker 冷启 / H-G2 简历页组件首渲染·consent 门/上传表单供给 / H-G3 宿主资源）与 UI runner 每 run 重 spawn 真栈（production `next start` · `run-e2e-ui.mjs:141-163`）的物理相容性；golden 上传路径的模型消费面（简历摄取解析）在冷启样本中的延迟贡献是否被 trace 分段正确隔离（Ban 把模型首调延迟误归 runner 冷启 · Ban 反向）；「三跑全绿=削弱非证伪 · Ban 定谳永不复现」与升压臂 B 预注册触发的措辞纪律。
5. **预注册纪律（与 mw-e2e-ha 共审）**：两实验每跑假设+判读+反例是否闭合；**Ban retry-to-green 式重跑**（升压臂 B 唯一触发条件=主臂 A 零红 · 实验二无备选跑 · 窗口错失回协调方）；红 EXIT 不冲销 G7U 真测 1/1/1 retained；甄别结论无论是否定位如实入收据（Ban 定谳压力）。
6. **边界完整性**：`model-operation-registry.ts:63-71`（blob `63af556f`）已清面零触碰（G7R post-dual 裁决维持）；残红① 与旧红③ `full.e2e.ts:203`（C-MO-P3）零触碰；withhold 契约零触碰（断言原文/case 名回读=契约变更裁定权归协调方 · Ban 本刀）；修复一律另刀（冷启面→夹具/基建刀 · 组件供给面→产品刀 · worker 面→F-F 族产品刀 · 下游尾段→断言面刀——各自独立 REQUEST+双审+协调方授权）；SSOT/backlog 状态翻转 Ban（`0c6c3287` `:107` 不翻 · sibling 归档零改写）。
7. **预算与 Key 卫生**：est ≤40 ≪ 200（est-not-counter · 超限即停如实记中止）；`actualSpendCny=null`；DB 直读用容器固定测试凭据（非模型 Key）；模型 Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader source · name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban 实跑 · Ban live · Ban push · Ban 甄别结论预claim · Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. 残红②③ OPEN（本刀指名面 · 甄别非修复）。残红① 非本刀。**F-F 判读表零重裁 · G7S 定谳=产出非预claim · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 甄别 run 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含两实验面裁定）；implementer 不自批；本 PASS（如落）仅为 model-op 半签，mw-e2e-ha stub 不代签。

---

*REQUEST stub · G7W golden+api 甄别刀 · Line G7W · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查段（mw-model-op · model-op/甄别域焦点 · 判读表忠实性/模型消费面/供给面修复定谳逻辑/F-F 承卷一致性 · docs gate only · append-only）

**被审**: REQUEST `93b3c215`（`93b3c2153176629de1fa5f0f62af710bf3a734dd` · 本地主线 `feat/mysql-schema-skeleton` tip ·恰 4 .md +276/−0 纯插入零删除）· 审查 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7w-model-op`（branch `rv/g7w-model-op`）· 审查日期 2026-10-07（本机时钟 2026-10-08 提交）
**Pre 段保全机检**: stub 前 7527B md5 `19255a92ed0ad93273211453ced2c3bf`——本段为纯追加，前缀逐字节保全（POST 可复检）

## A. 包完整性与祖先链机检（本席亲测）

1. **ancestry**: `git merge-base --is-ancestor` EXIT=0 ×3——`bbc361fa`（G7U nail）→ `14f507e9`（G7V REQUEST · 另刀）→ `93b3c215`（本 REQUEST）单链成立；REQUEST 即主线 tip 实测（`git branch --show-current`=feat/mysql-schema-skeleton @93b3c215）。
2. **docs-only**: `git diff --name-status bbc361fa 93b3c215` 全量=恰 8 个 .md 纯新增（A），零 M/零 D/零非 .md——G7U nail 后产品码/spec/wrapper/收据 sibling 零触碰；REQUEST 本身恰 4 文件（slice 23 行 + harness 151 行 + 双 stub 51 行×2）。
3. **blob 亲算 ×11 全等**（@93b3c215 实测，与 harness @bbc361fa 锚全等=docs-only 结构性自证）：golden.spec `8db8746b` · playwright.config `321b80e0` · full.e2e `7d65d0f3` · failure-class `102d0f3a` · run-e2e-isolated `13dbfc43` · interview-jobs `33fbecba` · perf-suite `7580fa02` · package.json `0afb3bd2` · registry `63af556f` · migrations 0005/0104/0001/0037 在树实读。
4. **无早产 EXEC 物证**: `receipts/` 下零 g7w/golden-api 目录（grep exit=1）——本 REQUEST 零实跑零 live 零收据，docs gate 边界守住。

## B. 码面锚逐一对号（行号 @93b3c215≡@bbc361fa 亲读）

| 锚 | harness 主张 | 本席实读 | 裁决 |
|---|---|---|---|
| golden 失败面 | `:10` test · `:48` consent 20s · `:50` textarea 20s | 全对号（`:51` fill/`:53` 解析完成亦在） | ✓ |
| playwright.config | `:12` expect 10s · `:17` workers:1 · `:24` trace retain-on-failure | 全对号（另 `:19` retries:0=非确定性 2R/1G 记账相容） | ✓ |
| run-e2e-ui 起栈 | `:141-163` 每 run spawn api/worker/web + 无 BUILD_ID 先 build | 对号（`:141` api spawn · BUILD_ID 缺席才 build=冷启物理来源成立 · Ban 清 BUILD_ID 与 runner 事实相容） | ✓ |
| withhold 冻结 | `:2088` stderr 丢弃 · `:2143` WITHHELD · `:2310` 端口行 | 三点全对号（blob `13dbfc43` 本席亲算全等=零 diff 机检承重锚成立） | ✓ |
| class=api 兜底 | `:384` main().catch 兜底非端点定位 | 对号（`:383` catch → `:384` `emitClassifiedE2EFailure(e,{class:'api',code:'client_uncaught'})` · `:14` import · 分类器 `:233/:242` 对号）——码面定性诚实 | ✓ |
| last_error 写入方 | `interview-jobs.ts:214-215` slice(0,500) · reaper `:251` | 全对号（`markJobFailed` `error.slice(0,500)` · `last_error='reaped:worker_died'`） | ✓ |
| wiring | `:278` e2e:isolated · `:279` ui:isolated · `:282` verify:e2e-performance | 全对号 | ✓ |
| 已清面 | registry `:63-71` wired:true 块 | 对号（competency-planning/question-generation wired:true 在窗）——零触碰钉成立 | ✓ |
| CMD3 同体 | perf-suite 内层=CMD1 同体 e2e:isolated | 对号（`run-e2e-performance-suite.mjs:20` `['HTTP full E2E',['e2e:isolated']]`）——实验二「无备选新信息面」论据机器可证 | ✓ |

## C. 实验一（golden 冷启）三假说预注册 + 升压臂纪律复核

1. **三假说齐备性**: H-G1（chromium/worker 冷启·runner 重 spawn 物理来源码面锚成立）/ H-G2（简历页组件首渲染/供给慢·产品面）/ H-G3（宿主资源位次）——每假说有归因候选+判读表行+证伪/反例分支；判读表五行走查（整页未渲染/仅 textarea 未现/navigation>15s 冷热对照/三跑全绿/trace 缺失）均落「产品刀/夹具基建刀/挂起回协调方/仪器缺口」四向之一，**判读表外值域（如可见性遮罩）显式另记 Ban 就地 reinterpret** ✓。
2. **升压臂 B 纪律**: 唯一触发=A 零红（预注册分支非事后补偿）· `--repeat-each`/追加轮 EXEC 定值一次成型 · B 全绿→「环境特异挂起 Ban 定谳永不复现」——**三跑全绿=削弱非证伪措辞诚实** ✓。
3. **模型消费面隔离（本审首责）**: 失败窗=consent `:48`/textarea `:50` 两断言均先于上传 `:51-52` 与解析 `:53`（模型摄取面）——trace 分段 `t_navigate/t_consent/t_textarea` 与失败窗同构，**模型首调延迟在结构上进不了被判窗口**（Ban 误归 runner 冷启/Ban 反向 双向结构性满足）；上传/解析面若红属 `:53` 另值域→判读表外如实另记 ✓。
4. **慢速因子**: 仅无破坏观测类（trace 分段+栈起日志 name-only 原文留 `.tmp/`）· Ban 清 BUILD_ID/降资源/杀进程——与 runner「BUILD_ID 缺席才 build」事实相容（清 BUILD_ID=强制重建=越界另刀，钉得准）✓。

## D. 实验二（CMD1 sidecar 甄别）八查询白名单核验（本席独立 C-MO-1 事实发现）

1. **逐查询机检（migrations 亲读 @93b3c215）**：(1) `interview_job`(id/kind/status/attempts/last_error/created_at 全列在 · `0001_baseline.sql:253`) ✓；(2) `job_route_decision`(route_outcome/attempt_outcome · CHECK 值域含 `validation_rejected`/`result_validated`/`known_not_sent`/`dispatched_unknown`/`rule_decided` 与 J-A2 值域同源 · `0104:65`) ✓；(3) `job_semantic_revision`(status · CHECK 含 `route_unresolved` · `0104:44`) ✓；(4) `interview`(status · `0001:18`) ✓；(5) `ai_model_invocation`(service/status/error_code 全列在 · `0037:7` · `output` 列存在但白名单未取=Ban 面守住) ✓；(6) `ai_invocation_trace` count（`0001:55` · `output` 列 Ban 守住）✓；(7) `route_consumption_event`+`interview_route_snapshot`（`0104:179/:161`）✓；**(8) `FROM application`——本 tip 无 `application` 表**（全 migrations CREATE TABLE 名单无此名；无 RENAME 无 VIEW 无裸 `application` 引用；实表=`job_application` · `0005_job_application.sql:20` · status CHECK IN ('invited','interviewing','completed')）——**本席独立复算与并行席 C-HA-1 事实发现同向收敛（独立得出 非转抄）**。
2. **定性裁决**: 非阻断——harness §1.2 已预注册「表名/列名 EXEC 期按当 tip schema 重核（application/route_consumption_event/interview_route_snapshot 名以 migrations 实测为准）」+ C-HA-FF-3 ok/error 纪律（报错≠空读·不得改判）双保险，设计自洽；但 **(8) 照抄必 error**，J-A4 的 application 子锚若不纠偏即惯常失活——须 EXEC 面落 Condition C-MO-1（见 G 节）。(1)-(7) 表名列名全有效。
3. **J-A1~A6 覆盖度**: 六判据 + 显式证伪行（embedding/rerank 签名沿 F-F C-MO-P1 逐字承卷——Ban 扫 catch-all/Ban 就地 reinterpret）+ 空读子情形（仅逐查询全 ok 才可判 J-A4 子例）+ 未覆盖值域回协调方兜底——对称完备走查无死角 ✓。J-A1 值域四族（`interview_resume_reference_*`/`model_*_state`/checkpoint·SQL throw 原文/`reaped:worker_died`）与 F-F §1.4 逐值对表全等，**F-F 已定谳值域零重裁** ✓；J-A5 provider_rejected/deterministic_refusal + 401/404 扁平化不可分注记沿 F-F ✓。
4. **G7S 定谳逻辑（本审首责）**: J-A3（全 done+completed+consumption/snapshot 在+trace>0→下游尾段·修复已生效红后移→「同形不同内容」为真）vs J-A1/J-A2（供给/classify 面仍在）vs J-A4（早段）三分对称；定谳措辞钉「与 X 一致」≠「X 已证」+ 单一读数不定谳 + 交叉互证强制（主读 (1) 与 (2)-(8) 联合）——**本刀产出非预claim** ✓；J-A1/J-A2 关系列均按「该面」限定（Ban 把「api 面未变」洗成「G7S 修复无效」——修复面=begin 供给链与 CMD1 面正交性被如实区分）✓。duration 簇 40560/37904/38428ms 三源收据本席 grep 亲验在卷。
5. **机制承卷**: F-F §1.2-A 原样（wrapper stdout tee `.tmp/` 不入 git · 端口行 `:2310` 触发 · finally 拆除前最后成功快照即证据 · 读 DB 不读 stderr · 零 wrapper diff）+ G7U sidecar 缺口（8 miss/9 timeout）如实承卷为健康性前提非必然性断言 + 窗口错失反例分支=回协调方 Ban 私自重跑 ✓。「预期 EXIT=1 ≠ 甄别失败·成功判据=快照捕获读取清单」双向契约闭合 ✓。

## E. 预注册纪律审计（Ban retry-to-green / Ban 修复另刀 / withhold 零触碰）

1. **Ban retry-to-green**: 两实验每跑预注册假设+判读+反例（FLK `gap-flake-rootcause-investigation` 先例 nail @checklist `:1273` 亲读在卷）；红 EXIT 不冲销 G7U 真测 1/1/1 retained；追加 run 仅限预注册分支（实验一升压臂 A 零红·实验二无备选）——**硬闭合** ✓。
2. **甄别=只读诊断 Ban 修复**: 修复四向路由（冷启→夹具/基建刀 · 组件供给→产品刀 · worker→F-F 族产品刀 · 下游尾段→断言面刀）各自独立 REQUEST+双审+协调方授权；EXEC 期顺手修=违纪——✓。
3. **withhold 零触碰**: wrapper `13dbfc43` 前后全等机检强制；读 DB 不读 stderr 探针与 stdio 零接触；断言原文/case 名回读=契约变更 Ban 本刀裁定权归协调方——✓。
4. **预算/Key**: est ≤40 ≪ 200 est-not-counter 超限即停；`actualSpendCny=null`；DB 直读容器固定测试凭据非模型 Key；Key loader name-only Ban `.env*`——✓。

## F. Pins 与 retained 核验（SSOT 亲读）

`haStatus=NOT_HA`/`releaseEvidence=false`/`claimProductionHA=false`（north-star-ha.md `:67`）· `gR45Closed=true`/`coveredCount=8`/`ms3EqualsR4Closed=false`/PG-retained/DELETE=503（coverage matrix `:99`·PARALLEL-DISPATCH `:3`）· `g7SuiteGreen=false`（matrix `:99/:104`）· `actualSpendCny=null`（matrix `:104` "stays null · no invented spend"）——十值原值全对，REQUEST stub 零翻转 ✓。backlog GAP-G7K-API-REDS `:107` P1 OPEN 实读未翻（`0c6c3287`=line/g7k-nail 登记在卷）· trio OPEN 1/1/1 retained · 残红②③ OPEN 本刀指名 · 残红① OPEN 非本刀——retained 全数一致 ✓。

## Fail-trigger audit（十二项 · 全未触发）

retry-to-green 重跑冲销 ✗未触发 · masking/伪造状态 ✗ · withhold 契约触碰 ✗ · Pin 翻转 ✗ · self-approve ✗（本段=半签）· SSOT/backlog 翻转 ✗ · 早产 EXEC/prove/实跑 ✗（零收据目录机检过）· 判读表值域就地 reinterpret ✗ · F-F 已定谳值域重裁 ✗ · invented spend ✗ · 破坏性注入设计 ✗ · 非本刀残红触碰设计 ✗

## G. Blockers / Conditions / OB

**0 Blocker。**

**Conditions（转 EXEC 逐项兑现 · 缺一即 EXEC 违约）**:
- **C-MO-1（表名事实钉 · 本席独立发现）**: 白名单查询 (8) `FROM application` 在本 tip 无 `application` 表——实表=`job_application`（`packages/db/migrations/0005_job_application.sql:20`）。EXEC 期二择一且如实入收据：(a) EXEC 定值白名单将 (8) 纠偏为 `FROM job_application`（J-A4 的 application 子锚同步按 job_application 读）；或 (b) 照原样执行并按 ok/error 纪律如实记 error、J-A4 该子锚判 inert——**两向均 Ban 据此 error 读数改判/Ban 静默 reinterpret**；且 EXEC 钉 committed SHA 时按已预注册义务对全白名单表名列名重核（本发现 @93b3c215，EXEC tip 若前进须复测）。
- **C-MO-2（EXEC 面裁定范围）**: 协调方 EXEC 授权须显式落两实验面定值——实验一过滤机制口径 + 升压臂 B 追加轮定值一次成型；实验二 sidecar 周期/快照落点定值一次成型——缺任一不定值即不得开跑。
- **C-MO-3（EXEC 期机器检查清单）**: wrapper `13dbfc43`/full.e2e `7d65d0f3`/registry `63af556f` 三 blob pre/post 全等机检强制；红 EXIT 原值记账不冲销 G7U trio 1/1/1；收据落 `receipts/g7w-golden-api-discriminator/`；`g7SuiteGreen=false`/`actualSpendCny=null` 全程保持。
- **C-MO-4（定谳措辞纪律）**: J-A3「同形不同内容」与 J-A1/J-A2「未变」均须按面限定（「与 X 一致」≠「X 已证」· 单一读数不定谳）——Ban 把 CMD1 面读数洗成 G7S begin 供给链修复无效/有效的全局定谳（两面前交性如实记）。

**OB（非阻断观察）**: OB-1 主线链现载 G7V REQUEST `14f507e9`（adaptive early-stop）待其自身 dual/EXEC——与 G7W 面 disjoint（残红① 显式不在本刀）无冲突，排序归协调方；OB-2 Base 漂移 bbc361fa→93b3c215 由预注册「committed SHA 重钉含重新 fetch」吸收（docs-only 故码面 blob 全等=本席机检自证）；OB-3 sidecar 周期 F-F 300ms→本刀 1000ms 属 EXEC 定值参数（已入 C-MO-2），非承卷偏差。

## 中文三行摘要

1. 被审 REQUEST 93b3c215=主线 tip 恰 4 .md +276/−0 纯插入 docs-only，祖先链 bbc361fa→14f507e9→93b3c215 is-ancestor 全通，blob 亲算 ×11 全等，行号锚逐一对号，双甄别实验设计（golden ×3 三假说+升压臂预注册 · CMD1 sidecar 八查询白名单+J-A1~A6 判读表）沿 FLK/F-F 先例承卷忠实，Ban retry-to-green/Ban 修复另刀/withhold 零触碰三纪律硬闭合。
2. 本席独立事实发现（与并行席 C-HA-1 同向收敛·独立得出）：白名单查询 (8) `FROM application` 在本 tip 无此表——migrations 实表=`job_application`（0005），(1)-(7) 表名列名全有效；因 harness 已预注册 schema 重核义务+ok/error 纪律故非阻断，落 C-MO-1 强制 EXEC 纠偏或如实记 error、Ban 静默 reinterpret。
3. Pins 十值+retained 零翻转（g7SuiteGreen=false · trio OPEN 1/1/1 · actualSpendCny=null · backlog :107 P1 OPEN），0 Blocker · 4 Conditions · 3 OB；本 PASS 仅为 mw-model-op PRE-EXEC 半签——alone≠dual，不代签 mw-e2e-ha，≠EXEC 授权≠甄别结论预claim≠任何 Pin 翻转；禁 push。

Verdict: PASS
