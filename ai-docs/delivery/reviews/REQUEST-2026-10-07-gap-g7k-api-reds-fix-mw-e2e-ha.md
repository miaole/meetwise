# REQUEST — **GAP-G7K-API-REDS 修复刀**（G7K 三红根因诊断 + 修复方案 + trio 复跑方案 · ≠ suite green）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/gap-g7k-api-reds-fix.md` · slice `gap-g7k-api-reds-fix.slice.md`
**上游**: G7K nail `0c6c3287`（GAP-G7K-API-REDS P1 OPEN 登记）· G7K EXEC `f02602cb`（实跑 code SHA `8c6860e3` · trio EXIT 1/1/1）
**Base tip**: `7b28a492`（`origin/feat/mysql-schema-skeleton` fetch 后实测 tip · not a prove tip · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **G7R**

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
| `r1Closed` / Disclosure-1 | **false / OPEN**（retained） |
| Trio | **OPEN**（EXIT 1/1/1 真实业务红 retained） |
| GAP-G7K-API-REDS | **P1 OPEN**（`0c6c3287` 登记 · 本刀不翻 backlog 状态） |

## 请审什么（mw-e2e-ha · e2e 纪律 / 诚实性 / HA 口径）

Line G7R · **GAP-G7K-API-REDS 修复刀**（G7K trio 真实业务红的根因诊断 + 修复方案 + trio 复跑 REQUEST）。请审：

1. **诊断前置的只读纪律与证据强度（harness §0/§1）**：本 REQUEST 零实跑零 live 零 Key 加载，证据来源 = git 只读 @`7b28a492`（行号+blob 亲算：spec blob `de4991e6`/`3309dc38`、`full.e2e.ts` `7d65d0f3`、`run-e2e-isolated.mjs` `13dbfc43`、`run-e2e.mjs` `c655235c`、`run-e2e-ui.mjs` `aa86fb3f`、gate blob 与 G7K 收据零漂移）+ G7K committed 收据 + G7K EXEC 磁盘工件（error-context 页快照 / 02 log · 未入 git · 引用合法性如实披露）；**根因假设均标注「假设非断言」**（红② G7K「候选解读」已升级为有证据强假设但仍非断言）——Ban 把假设当结论、Ban 发明未在案明细。
2. **红③ withhold 契约（本审首责）**：三角定位只走合法途径（`run-e2e-isolated.mjs:2084-2098` stderr 永不回显 + stdout 固定格式解析亲读；reviewLedger `[capability:image_ocr_unavailable(:58), capability:voice_unavailable(:153)]` → 执行越过 `:153` → 红面 `:154` 之后 class=api → 首选候选 `full.e2e.ts:199`、次选 `:333`）；**Ban 改 withhold 机制本身（F-E 否决）· Ban 发明 case 名**；EXEC 期 case 名甄别只走收据三角法或协调方显式批准的独立诊断 attempt（F-F · 独立记账 · 不替代 trio ×1）。
3. **修复候选归类与触碰面（harness §2）**：F-A env-gap（首选 · 零代码 · 值由协调方下达）/ F-B 产品缺陷另刀（须独立 REQUEST+双审+EXEC）/ F-C 既有专用 knob 备选（prove 契约变化须全披露 · UC018 断言语义零改）/ **F-D 改 spec 与 F-E 改 withhold = 否决**（Ban 为绿改语义/洗断言）；EXEC 默认 plan 零代码零夹具零 `package.json` 零 spec 零 SSOT。
4. **trio 复跑纪律（harness §3 · G7K C-K1~C-K8 沿用）**：committed SHA 重钉 + frozen-lockfile + 独立 worktree；三条 CMD **各恰好一次**（iso→ui→perf · wiring `:276/:277/:280` @`8c6860e3` 实测 · EXEC 按 tip 重核回填）；单条 CMD 内部重试按自身契约算一次 attempt（Ban 临时调高）；七字段逐 attempt 全记录（含 `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` name-only 探针与 `.env*` 三文件 ABSENT presence）；退出码/machine receipt/原始 log 三来源交叉一致；**Key 只经进程环境 · Ban `.env*` · Ban Key 值/fingerprint 入树**。
5. **预算诚实（harness §3.5）**：上限沿 G7K **≤200 次 live 调用**；**修复生效后 live 面较 G7K 增大**（recruiting-bound 完整 6 题×2 project + CMD1 三驱动全程生成——G7K 的 <120 是 bind 失败、生成面未展开下测得）——偏差已预披露；额度上限以协调方 EXEC 指令为准，超限即停如实记中止；voice/OCR/ASR/TTS capability skip = 0 调用 ≠ green；`actualSpendCny=null` 沿 I 线。
6. **EXIT 契约双向（harness §3.8/§6）**：三绿 → trio 翻绿收据成立，**`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链**（缺一不可；trio 绿 ≠ suite green——G6 OPEN/R5-MARKED-RED/Disclosure-1 OPEN 独立核算）；仍红 → EXIT=1 原值 + 逐 case 五分类明细 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；**Ban 假绿 · Ban flake 记法（env-gap 可定性为 FAIL 原因但不冲销 EXIT=1）· Ban retry-to-green · Ban 只留绿 attempt**。
7. **R5-MARKED-RED 与 env 探针保持**：`E2E_ISOLATION_STACK=pgvector-legacy` 披露原样（≠ stack truth ≠ cutover ≠ G6 closed）；docker/chromium/pnpm/node 探针逐 attempt 记录；本机 macOS ≠ 历史 Linux box 差异如实记 env-gap 不洗。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban push/force-push · Ban SSOT/backlog 状态翻转（GAP-G7K-API-REDS `0c6c3287` 状态行不翻 · nail 阶段才落字）· Ban 碰已占用行/sibling 归档（G7K 收据 lifecycle 冻结 · AC/AD/U/L/G7B 零改写）· ERRATUM 措辞冻结沿用（观察=`3424dc1` · 消除轮=`82981ff`）。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. `r1Closed=false`. Disclosure-1 **OPEN**. **假设 ≠ 断言** · env 补齐 ≠ H0 定谳 · **Ban 假绿叙事** · Ban 改 withhold · Ban 洗断言。

本 stub 不授权 coding / prove 执行 / trio 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含 env 注入值与 F-C/F-F 批准权）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · GAP-G7K-API-REDS fix · Line G7R · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查段（mw-e2e-ha · adversarial evidence-honesty · append-only · 2026-10-07）

**审查对象**: REQUEST `fa10e01e`（origin/feat/mysql-schema-skeleton tip · docs-only 4 文件 +248/−0 · REQUEST≡本审 HEAD 祖先亲证 `git merge-base --is-ancestor` PASS）。**审查 base**: 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7r-e2e-ha` · branch `rv/g7r-e2e-ha` @`fa10e01e`。**append-only 纪律**: 本段追加前 stub 6497 字节 · md5 `f73ab12fa5b7c13287414bb379a1aa6f`（机检在案）；前文 stub 原文零改写。**本审零实跑零 live 零 Key 加载零产品改动**；证据 = git 只读亲读（blob 逐个 `git hash-object` 复算）+ G7K committed 收据 + G7K EXEC 磁盘工件只读存在性/内容抽查（test-results error-context · `.tmp` log · 未入 git 属如实披露范畴）。

## A. 检查表（逐项亲验 · 证据 = 本席独立复算，非抄被审文本）

| # | 项 | 结果 | 本席证据（独立复算） |
|---|-----|------|----------------------|
| A1 | REQUEST docs-only + 祖先 | ✅ | `git show fa10e01e --stat` = 恰 4 文件（slice 25 + harness 126 + 双 stub 48/49）全 `+` 零 `−`；`merge-base --is-ancestor` PASS；SSOT 三件/backlog/checklist/产品码/spec/scripts/package.json 零 diff |
| A2 | blob 链 | ✅ | 17 blob 亲算全中：`005c68cc`(text-endpoint-config) · `3b1e7081`(job-route-classify) · `a621d8bd`(job-route-decision) · `d06b4f49`(recruiter) · `79ceded8`(job-route-classifier) · `67b8928b`(actions.ts) · `f9ca2214`(application-start-error @ `apps/web/lib/jobs/`) · `9a17cfe4`(applications.service) · `257718cf`(interview.service) · `223b7f09`(route-classify-consumer) · `aa86fb3f`/`13dbfc43`/`c655235c`(run-e2e-ui/isolated/·mjs) · `975fbb38`(assert.ts) · `7d65d0f3`(full.e2e.ts) · `de4991e6`/`3309dc38`(双 spec) |
| A3 | H0 读码核心 | ✅ | `:67` `env.MODEL_NAME?.trim() \|\| 'qwen-plus'` + `:77` `env.MODEL_ENDPOINT_PROFILE?.trim() \|\| 'deepseek-cn-public'` 逐字亲读 @blob `005c68cc`；`:38` `'deepseek-cn-public': { host: 'api.deepseek.com' … }`；允许集闭集 `TEXT_ENDPOINT_PROFILES`（:22 :37-39，仅 deepseek-cn-public/dashscope-cn-beijing 二值）——默认配对不一致是**码面事实**，「该不一致致三红」是假设，harness §1/§6.2 措辞纪律在位 |
| A4 | H0 与三红时序相容性 | ✅ | 毫秒级 provider 拒→红① classify 落 `knownNotSent`（`:130-132`/:179-195 catch-all + `:113-128` PRE_DISPATCH 族亲读）→ sticky `route_unresolved`（模块头 `:14` 亲读）→ `:295` route_not_decided → `recruiter.ts:410` fail-closed → `applications.service.ts:42-46` 409（三处行号逐字中）→ actions throw（`:34`/`:41`）→ 错误边界 → waitForURL 30s 必超时：链条每环码面可复演，×2 project 确定性由 sticky 单调性最好解释——自洽；红② 1.6s/2.5s 与「真生成 ≥数秒」矛盾→毫秒级快速失败为唯一候选族——推理成立且标注为强假设非断言；红③ 三角法见 A6 |
| A5 | 红② 链 + F-C 自证 | ✅ | abandon 409 面 `interview.service.ts:562-563`（`st==='completed'\|\|st==='failed'`→`interview_not_active`）亲读；`run-e2e-ui.mjs:136-138` 专用 knob 注释逐字在位（「避免 worker 秒级 fail-closed…竞态」「默认仍启 worker」）——G7K 默认 worker ON 输竞态的解读有码面自证；「候选解读→有证据强假设」升级措辞诚实 |
| A6 | 红③ withhold 契约 + 三角法（本审首责） | ✅ | `run-e2e-isolated.mjs:2084-2098` 亲读：`:2088` stderr 丢弃 + `:2091` 仅 stdout 固定格式判定 + `:2097-2098` 仅上浮 `E2E_FAILURE_CLASS`；`assert.ts:10` `defaultClass='api'` + `:15` `console.error('✗')`；`failure-class.mjs:277-284` `lastE2EFailureClass` 亲读；`full.e2e.ts` `:58`/`:153` capability record 亲读 → 执行越过 `:153` → 红面 `:154` 后、class=api、排除 `:205`/`:210`/`:248`/`:256`（worker 类）→ 首选 `:199`（`A(questions >= 1…)` 亲读）、次选 `:333`——三角法零发明 case 名，F-E 否决正确 |
| A7 | G7K 收据对照 | ✅ | `receipts/g7-trio-keyed/` 4 文件在案；EXIT 1/1/1 · F1/F2 35.3s/35.6s @`:96` · F3/F4 1.6s/2.5s @`:139` · machine receipt `reviewLedger=[capability:image_ocr_unavailable, capability:voice_unavailable]` · `durationMs=38541` · wiring `:276/:277/:280`@`8c6860e3` · budget <120/200 · 与 harness 引文逐条吻合 |
| A8 | 磁盘工件合法性抽查 | ✅ | `meetwise-line-g7k/apps/web/test-results/` error-context.md 只读抽查：recruiting-bound chromium 含「出错了」+「190419086」；uc018 chromium 含「已结束」+「interview_not_active」+「重新开始面试」——红①错误边界/红② fail-closed 决定性证据独立复现；harness §0「未入 git·仅路径引用」披露如实 |
| A9 | B'' stale_quiz 语义 | ✅ | `interview.service.ts:212-223` sourceQuizId 块 + `:211`「不带 sourceQuizId → 完全跳过本块」亲读；sourceQuizId 仅来自 controller quiz-id header（`:191`），actions.ts `:39` begin 只带 `resume-id` → stale_quiz 块结构性跳过——排除面成立 |
| A10 | 上游钉 | ✅ | nail `0c6c3287` 在案：backlog `:107` GAP-G7K-API-REDS P1 OPEN 登记原文与本 harness 三红描述逐字同源；REQUEST 零翻 backlog/checklist |
| A11 | Pins | ✅ | checklist `:173` Pins 行亲读 = haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE=503——harness/slice/双 stub 四处原值全中零漂移 |
| A12 | trio 复跑纪律 + EXIT 契约 | ✅ | 三 CMD 各恰好一次、单 CMD 内部重试按自身契约算一次、七字段逐 attempt、Key 进程环境唯一通道、Ban `.env*`、三来源交叉一致——harness §3 全额在位；EXIT 双向（三绿≠suite green·翻绿须三绿+post-dual BOTH+nail 全链；仍红如实迭代）在位 |

## B. H0 / 修复候选裁决（本席独立裁定）

1. **H0 裁决：成立为「证据支持的候选根因」，非断言**——配对不一致本身是码面事实（A3），级联三红的因果面是假设；G7K Key 探针在 committed 收据中仅 `envModelApiKey=set`（name-only），「HTTP 200 探针」系协调方 U4 授权链 in-band 外动作，**配对可用性无任何 committed 证据**——harness §1·H0 把此缝隙如实登记为最上游候选，本席裁：**H0 表述诚实、证据强度标注正确**。
2. **H0-alt-1/2/3 公平性：PASS**——三 alt（Key-provider 错配 / PRE_DISPATCH 拒绝族·码面在 `:113-128` 亲读 / worker env 缺口）与 H0 共享同一可观察面（fast-fail + known_not_sent 族），同判 EXEC 甄别、未被降格呈现；§6.3「F-A 生效≠H0 定谳（env 补齐对多 alt 同效）」措辞纪律在位。
3. **F-A 首选：正确**——零代码 env 补齐、值由协调方 EXEC 下达、值域限 `TEXT_ENDPOINT_PROFILES` 闭集（`:22`/`:37-39`）与 model 白名单；Ban agent 自造配置值在案。**F-B 边界：正确**——默认配对若实测证为真缺陷属产品修复，须另刀独立 REQUEST+双审+EXEC；本刀 Ban coding 兜住「为绿改产品」。
4. **F-C 备选边界：正确**——仅协调方显式另批、prove 契约变化须收据全披露、UC018 断言语义零改；`run-e2e-ui.mjs:136-138` 注释自证其专用钉定位（非洗绿门）。
5. **F-D/F-E 否决：确认**——改 spec/改 withhold 机制均属「为绿改语义/开假面」，与 Ban 清单一致；红③ case 名甄别只走收据三角法或协调方批准的 F-F 独立诊断 attempt（独立记账、不冲销 EXIT、Ban retry-to-green）——边界闭合。
6. **sticky 解除口径：码面确认**——sticky 终态按 (job,revision)（`route_unresolved`→noop `:180` · FOR UPDATE `:174` · 模块头 `:14` 永不自动重试）；F-A 只对新 revision 生效、新跑=新 job/revision、旧 sticky 岗位不复活不得记为已修——EXEC 收据须按此口径解读（随 C-HA-4 续绑）。

## C. Fail-trigger audit（本席 FAIL 触发面逐查 = 全未触发）

- 假设写成本文结论？否——§1/§6.2/Non-claims 三处钉死「假设非断言」。预填 EXIT/预claim post-commit 结果？否——harness §6.4 明文零预填。发明 case 名/绕 withhold？否——A6 三角法全在契约内。为绿改 spec/withhold/产品？否——F-D/F-E 否决 + F-B 另刀 + EXEC 默认 plan 零代码。SSOT/backlog 翻转？否——REQUEST diff 零触碰，backlog `:107` 原样。Key 物料越界？否——进程环境唯一通道 + Ban `.env*` + 值由协调方下达。预算隐瞒？否——「live 面较 G7K 增大」已预披露（诚实偏差登记的正确方向）。retry-to-green 后门？否——F-F 独立记账 + 不冲销 + Ban 条款三重钉。self-approve/代签 peer？否——本 PASS 仅 mw-e2e-ha 一席半签，mw-model-op stub 未读未签不代签。Pins 漂移？否——A11 四处全中。

## D. Blockers

**0 Blocker。**

## E. 观察（非阻断 · 如实登记）

- **OB-1 行号 cite 微漂（blob 全等 · 内容锚全中）**：actions.ts 子锚 harness 引 `:38-41`/`:47` 实际 `:30-35`/`:41`（blob `67b8928b` 三点全等）；abandon 409 引 `:557-559` 实际 `:562-563`；stale_quiz 块引 `:209-222` 实际 `:212-223`；RULE_SIGNALS 引 `:56-66` 实际 `:71`（0/≥2→null 门 `:95-99` 亲读成立）；stderr 丢弃引 `:2093` 实际 `:2088`——零语义影响，EXEC 期引用按当 tip 重核（沿 OB-P2 既有惯例记非阻断）。
- **OB-2** `application-start-error.ts` blob `f9ca2214` 引用未带目录，实际在 `apps/web/lib/jobs/`（blob 全等消歧）。
- **OB-3** trio wiring `:276/:277/:280` 为 @`8c6860e3` 实测值（G7K 收据同源在案），tip 实测 `:278/:279/:282`——harness/stub 已自钉「EXEC 按 tip 重核行号回填」，非缺陷。
- **OB-4**「Key 探针 HTTP 200 可用」无 committed 收据（协调方 U4 链 in-band 外），harness 以「存在性探测≠配对可用」如实降格处理——处置正确，EXEC 定谳不得引用该探针为配对证据。

## F. Conditions（PASS 随卷 · EXEC 期强制）

- **C-HA-1** EXEC 前重钉 committed SHA；trio CMD wiring 行号按当 tip 重核回填（OB-3）。
- **C-HA-2** F-A 注入值仅由协调方 EXEC 指令下达，值域限 `TEXT_ENDPOINT_PROFILES` 闭集 + model 白名单；agent Ban 自造/改写；收据记配置名值（非 secret）但 Ban 借值域外注入变相换端点。
- **C-HA-3** 根因定谳措辞按 §6.3：「与 H0 一致」≠「H0 已证」；SUMMARY 定谳段须附收据证据；Ban 引 OB-4 探针为配对证据。
- **C-HA-4** sticky `route_unresolved` 只对新 revision 解除；收据解读照此口径；旧 sticky 岗位不复活不得记已修。
- **C-HA-5** 任一红 → EXIT=1 原值 + 逐 case 五分类 + 根因假设修正如实登记 → 迭代刀重走 REQUEST；Ban flake 记法/retry-to-green/只留绿 attempt；env-gap 可定性 FAIL 原因不冲销 EXIT=1。
- **C-HA-6** trio 三 CMD 各恰好一次；预算 ≤200 沿 G7K；修复生效 live 面增大按预披露执行；超限即停如实记中止（不洗 not_run）。
- **C-HA-7** Key 卫生沿 G7K C-K6 全量：进程环境唯一通道、Ban `.env*`、Ban 值/fingerprint 入树入据；`.env*` 三文件 ABSENT presence 与 endpoint/model 配置 name-only 探针逐 attempt 记录。
- **C-HA-8** 本 PASS 仅为 mw-e2e-ha 一席半签；alone ≠ dual；不代签 mw-model-op；dual BOTH PASS ≠ EXEC 授权 ≠ trio 实跑许可；`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链，缺一不可。

## G. 三行中文摘要

1. 本席独立复算 17 blob 全等、H0 配对不一致码面坐实（`:67` qwen-plus × `:77` deepseek-cn-public）、三红级联链每环亲读可复演、G7K 收据与磁盘工件决定性证据独立复现——诊断只读纪律与「假设非断言」措辞全部合格。
2. 裁决：F-A env 补齐（值由协调方下达、零代码）首选正确；F-B 产品默认配对修复正确圈为另刀；F-C knob 备选边界闭合；F-D/F-E 否决确认；红③ withhold 契约零触碰、三角定位零发明。
3. 0 Blocker · 4 条非阻断观察（行号微漂/blob 全等、目录省略、wiring 行号自钉重核、Key 探针降格处置正确）· 8 条 Conditions 随卷；本 PASS 仅 mw-e2e-ha 半签，不代签 mw-model-op，dual BOTH ≠ EXEC 授权。

Verdict: PASS
