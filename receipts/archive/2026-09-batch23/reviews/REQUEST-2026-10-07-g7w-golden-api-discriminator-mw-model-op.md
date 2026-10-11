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

---

# POST-PROVE dual 审查段（mw-model-op · model-op/甄别域焦点 · G7W EXEC 裁决 · 2026-10-08）

**被审包**: EXEC `7db84c18`（`line/g7w-discriminator` tip · 恰 3 收据文件 `receipts/g7w-golden-api-discriminator/{00-summary,01-exp1-golden-coldstart,02-exp2-cmd1-sidecar}.md` +181/−0 纯插入）· 本地孪生：主线 `feat/mysql-schema-skeleton` @`a4e49b8a` 与 `7db84c18` **tree 全等 `9b779bdf`**（同 parent `10e25f38` · 同 author mw-core · 仅 committer 异=孪生非两内容）· parent `10e25f38`=本席 PRE 段（rv 原始 `f9d0f686` 的主线承载·review 文件 blob `fcd79897` 三点全等）+ 并行席 `1cfb0cdf`。**链锚如实记录**: `origin/feat/mysql-schema-skeleton`=`10e25f38` **不含 EXEC**（`git merge-base --is-ancestor 7db84c18 origin/…` FAIL · origin tip 为 EXEC 直父）→ 按任务书以本地 `line/g7w-discriminator` `7db84c18` 为被审链建 worktree `rv/g7wp-model-op`（`/Users/miaole/Desktop/golucky/meetwise-rv-g7wp-model-op`），主线上孪生 `a4e49b8a` 同内容并行在卷。

## 一、包完整性机检（本席自跑 · 命令+读数全可复现）

1. `git diff --name-status 10e25f38 7db84c18` → **恰 3 个 A**（全在 `ai-docs/delivery/receipts/g7w-golden-api-discriminator/`）· 零产品码/零 spec/零 wrapper/零 SSOT/零 migration/零 `.env*` diff——「tracked 树零改」主张与提交树一致 ✓。
2. **三钉 blob 本席重算全等**: `git hash-object` 实测 `scripts/run-e2e-isolated.mjs`=`13dbfc43c744…` · `e2e/full.e2e.ts`=`7d65d0f35e39…` · `packages/ai-runtime/src/model-operation-registry.ts`=`63af556fd166…`；`git rev-parse 10e25f38:<path>` 三点逐一与 EXEC 树全等——**pre==post==REQUEST 时代钉值**，C-MO-3 blob 机检独立复算 PASS ✓。receipt 自证 sha256：本席 `shasum -a 256 e2e/full.e2e.ts`=`f55f57f36bc2a686…` 与收据 `sourceDigests` 前缀全等 ✓。
3. **本席 PRE 段 append-only 保全**: review 文件 blob `fcd798974c49…` 于 `f9d0f686`/`10e25f38`/`7db84c18` 三 commit 全等（21694B · md5 `aedfa7e7…` · 末行 `Verdict: PASS` 原样）——PRE 段零改 ✓。
4. **Key 物料机扫**: 收据三文件 `sk-*`/`Bearer`/`PRIVATE KEY`/`AKIA` 扫描唯一命中=收据自述句本身（「扫描零命中」的措辞），零真实 Key 值/fingerprint 入树 ✓。
5. SSOT 钉值 EXEC 树实读: `g7SuiteGreen=false`（retained 措辞原样）· `actualSpendCny=null` · trio OPEN 1/1/1 · GAP-G7K-API-REDS P1 OPEN（`0c6c3287` 不翻）——叠加 diff 空性=**Pins 零翻转结构性成立** ✓。

## 二、条件逐条裁决（本席 PRE C-MO-1~4 · POST 对账）

| # | PRE 条件 | 裁决 | 依据（本席复算） |
|---|---|---|---|
| C-MO-1 | 表名事实钉: EXEC 纠偏 `job_application` 或如实记 error；J-A4 子锚同步；Ban 静默 reinterpret | **兑现 ✓** | `grep -n 'CREATE TABLE IF NOT EXISTS job_application' packages/db/migrations/0005_job_application.sql`→**恰 `:20`**（status CHECK `:26`）亲读；纠偏 SQL 逐字入收据 02（`SELECT status, count(*) FROM job_application GROUP BY 1`）；纠偏必要性实证在卷（tick-1 同族 `relation … does not exist` error 形状=若沿 `FROM application` 将永久 ERROR 非空读）；**纠偏后 q8 全 35 tick ok**（含 `ok:[]` 空读合法参与判读）——tick-1 的 5 个 relation ERROR 属**其余查询**迁移在途窗口，C-HA-FF-3 ok/error 纪律如实记，不与「q8 35 tick 全 ok」相悖（精度如实区分）；J-A4 锚在修正名查询 ok 后参与判读（`job_application` 35 tick 恒 0 行→死于申请面前），零改判零静默 reinterpret ✓ |
| C-MO-2 | 协调方 EXEC 面定值一次成型: grep 透传/升压臂 ≥6·+≤15/sidecar 1000ms | **兑现 ✓** | ①grep: `scripts/run-e2e-ui.mjs:193` 行号 tip 实测恰对（`if (env.E2E_UI_GREP?.trim()) playwrightArgs.push('--grep', …)` 本席亲读）；②升压臂: A×3+B×3=**恰 6 run/12 golden 执行 ≥6**，B 臂 est ≤12 ≤ +15，触发=A 零红预注册分支非事后补偿 ✓；③sidecar: 35 tick 全程 1000ms（00:22:42.740→00:23:16.801=34.061s/34 间隔≈1002ms 算术自洽），快照落点 `.tmp/g7w-sidecar/` 不入 git ✓；④交叉算术: 38013ms=00:22:39.853→00:23:17.866 精确，落 G7S 38428/G7U 40560/G7U 内层 37904 簇（37.9–40.6s）✓ |
| C-MO-3 | 三 blob pre/post 全等机检+红 EXIT 原值记账+两值保持 | **兑现 ✓** | 三钉本席重算全等（见一.2）；红 EXIT=1 于 attempts 台账 run 7 原值记账（甄别样本·Ban 冲销 G7U trio 1/1/1 retained）；`g7SuiteGreen=false`/`actualSpendCny=null` 保持（见一.5）✓ |
| C-MO-4 | 定谳措辞按面限定「与 X 一致」≠「X 已证」 | **兑现 ✓** | 实验一=「未定谳（削弱+挂起）」+Ban 定谳「永不复现」如实挂起回协调方；实验二内容定谳显式限定「本 run 正面定谳」+「Ban 追认 G7S 内容」（容器即毁物理限制如实）+「致死性不定谳」；Non-claims 全谱（not pass/not fixed/not trio green/not suite green/not Pin 翻转）+STOP/禁自批/禁 push 在卷 ✓ |

**Fail-trigger audit（十二项）**: retry-to-green ✗（7 attempt 全台账·升压臂=预注册分支）· masking ✗ · withhold 触碰 ✗（读 DB 不读 stderr·断言原文零回读·wrapper `13dbfc43` 全等）· Pin 翻转 ✗ · self-approve ✗（本段=POST 半签）· SSOT/backlog 翻转 ✗ · 判读表值域就地 reinterpret ✗（`schema_validation_failed` 表外登记非就地归值）· F-F 已定谳值域重裁 ✗（J-A1 四族零重裁·embedding/rerank 显式证伪承卷）· invented spend ✗（`actualSpendCny=null`·live=7 为 DB 账本实测非计数器）· 破坏性注入 ✗（H-G3 如实记「契约内不可证伪」）· 非本刀残红触碰 ✗（残红①/旧红③ `:203` 零触碰在卷）· 越权修复 ✗（零码改·修复四向路由建议交协调方）——**全未触发**。

## 三、表外登记裁决（本席域 · `schema_validation_failed`×2 与 G7T v2 关系定谳）

1. **事实链亲验**: 写入方 `packages/ai-runtime/src/invoke.ts:711-712`（`validated.stage==='schema'`→error_code=`schema_validation_failed` 行号恰对亲读）；映射面 `packages/domain/src/question-generation.ts:39`（MALFORMED 正则含该码）+`:46`（显式 `→ 'schema_invalid'` 行号恰对）；吸收面 `apps/worker/src/adaptive-interview-service.ts:161`（`unavailableGeneration(classifyQuestionGenerationError(…))` 优雅降级非 throw）——收据「旅程开头 3s · 被 MALFORMED 优雅路径吸收 · 随后 5 连成功至 completed · 致死性不定谳」与码面三点全一致 ✓。
2. **与 G7T prompt v2 关系裁决（本席定谳）**: G7T v2=`430d4c84` **feat(route-classify) prompt p.v2 校准**（commit 明示 **zero validator change** · EXEC 活体复证=`route_decided ×2`）——其面=`job-route-classifier`（registry `:101`）。G7W 读数面=`interview.question-generation.v1`（registry `:69`）独立操作独立 schema。**决定性事实**: 本 run route classify 面**未被行使**（`job_route_decision`/`job_semantic_revision` 零行=J-A2「未达」非「通过」）→ 故（a）**非 G7T 修复面的同族残余**（v2 修复面根本不在本 run 路径，无从「修复后残留」）；（b）**非被 v2 间接缓解**（v2 只改 route-classify prompt、零 validator 改动、question-generation 的 prompt/schema 零触碰，两面无因果通道）。定性=**同机制族（invoke.ts doubleValidate schema 级失败）不同操作面**——登记裁决：**独立立行**（question-generation/模型输出质量域），**不并入 G7T 残余行、不并入 GAP-G7K-API-REDS**。
3. **登记优先级裁定**: **P2 级、带复验门**——非致死（优雅吸收+旅程 completed）、属质量/成本/延迟面（早段 ~3s 内 2 次浪费调用），优先级低于本刀 P1 面尾段死亡定位（J-A3/J-A6）；**但存在 OB-3 混杂因子**: 本 run `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset（G7U 收据口径 `dashscope-cn-beijing`/`qwen-plus`）——端点/模型默认值漂移是输出 schema 偏移的候选混杂，**复验条件=按 G7U 口径定值 env 复跑一次再裁产品面归因**，Ban 在混杂未排除前归因产品 prompt 质量、Ban 据此 2 例直接立产品缺陷行（登记行须携带此门）。
4. **persistTrace 旁路关系核验（对 G7R post 段承卷）**: 本席 G7R post 段已钉 trace success-only（`invoke.ts:348-352` 注释「只在输出校验通过时调用」）；EXEC tip 实测 `invoke.ts:739` `if (!error) await persistTraceBestEffort(…)` 行号恰对——error 路径调用**结构性零 trace 行**。收据读数 `ai_invocation_trace=5 == succeeded=5` 正是该旁路的实现；2 个 failed 调用仅由 `ai_model_invocation` 账本承载（failed=2 · error_code 恰为该码）——**码面-读数全一致且诚实**；推论如实记: 仅凭 trace 计数的甄别会系统性漏掉失败调用，本刀 sidecar 取 `ai_model_invocation` 账本面为承重读数=正确选择（正面注记）。

## 四、Blockers / Conditions / OB

**0 Blocker。**

**Conditions（转协调方/后继刀）**:
- **C-MO-P1（表外登记行）**: `ai_model_invocation.error_code='schema_validation_failed'×2` 按本席第三节裁定独立立行 P2+复验门（G7U 口径 env 定值复跑一次→再裁产品面归因）；立行与否最终归协调方。
- **C-MO-P2（尾段断言面）**: J-A3/J-A6 定位（后旅程尾段 · 申请面前 · ~12s 静默窗）为只读甄别产物——具体断言定位须 withhold 契约内新形态（driver 侧结构化埋点）或契约变更裁定，另刀 REQUEST+双审+协调方授权，Ban 本刀域内顺手修。
- **C-MO-P3（实验一残留）**: 「G7U 两轮环境特异」假说挂起——是否立 backlog/是否需全 suite 上下文复现臂归协调方；本刀 6 run 全绿=甄别样本，Ban 记为翻绿冲销（G7U CMD2 真测 EXIT=1 retained 不受影响，收据已如实区分）。
- **C-MO-P4（仪器改进项）**: sidecar `client.on('error')` 兜底（OB-2 拆除伪影）与 run1 EXIT 直录法（OB-1）入后继甄别器基线，非本刀域。

**OB（非阻断）**: OB-A run1 EXIT 捕获变量 zsh 管道未展开——四证承担（tally/零 ✗/收尾/复合进程 exit 0）如实注记、run2-6 直录法纠正，可信；OB-B sidecar 拆除瞬间 exit 1=伪影（35/35 tick 完整·末快照距 receipt 终点 1.06s）；OB-C 「≈12s」静默窗=12.87s 的诚实取整；OB-D 被审链不在 origin（本审按任务书落本地链，主线上孪生 `a4e49b8a` 同 tree 并行在卷，push 时机归协调方）；OB-E 本席 PRE OB-1（G7V REQUEST 链）已由其自身线推进，与本刀面 disjoint 维持。

## 中文三行摘要

1. G7W EXEC `7db84c18`（本地孪生 `a4e49b8a` 同 tree）恰 3 收据 +181/−0 纯插入，零产品码/SSOT/Key diff；三钉 blob（`13dbfc43`/`7d65d0f3`/`63af556f`）本席重算 pre==post==钉值全等，sha256 自证 `f55f57f3…` 全等，本席 PRE 段 blob `fcd79897` 三点逐字节保全。
2. 本席 PRE C-MO-1~4 逐条对账全兑现：`job_application`@`0005:20` 纠偏入收据+q8 35 tick 全 ok（tick-1 其余查询迁移在途 error 如实另记）；grep `:193`/升压臂 6 run/`+≤15`/sidecar 1000ms 定值兑现；红 EXIT=1 原值记账+Pins 零翻转；定谳措辞按面限定（未定谳/本 run 正面定谳/Ban 追认 G7S/致死性不定谳）。
3. 表外登记裁决（本席定谳）：`schema_validation_failed`×2=invoke.ts schema 校验同机制族**不同操作面**（question-generation ≠ G7T route-classify；本 run route 面未行使故既非 v2 残余亦非 v2 缓解）→ 独立立行 P2+OB-3 env 口径复验门，不并入 GAP-G7K-API-REDS；`invoke.ts:739` persistTrace error 旁路与读数 trace=5==succeeded=5 码面全一致。0 Blocker · 4 Conditions；本 PASS 仅为 mw-model-op POST-PROVE 半签——alone≠dual，不代签并行 peer mw-e2e-ha，≠修复授权≠trio 翻绿≠`g7SuiteGreen=true`≠任何 Pin 翻转；禁 push。

Verdict: PASS
