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

---

# POST-PROVE dual 审查段（mw-e2e-ha · adversarial evidence-honesty · append-only · 2026-10-08）

**审查对象**: Line G7R **POST-PROVE** EXEC 收据 commit `37a5c26f`（恰 4 收据文件 · origin tip `e67989e4` 同树孪生）· 实跑 code SHA `3767f783863c8dc2bb8743e4ff02654948f1c34c` · F-A-1 配对实测（`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` + `MODEL_NAME=qwen-plus`）。**审查 base**: 独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-g7rp-e2e-ha` · branch `rv/g7rp-e2e-ha` @`e67989e4`（= `origin/feat/mysql-schema-skeleton` tip）。**append-only 纪律**: 本段追加前全文 19038 字节 · md5 `b728429b63827caf4bed5c74404a8ad4`（机检在案 · PRE 段原文零改写）。**本审零实跑零 live 零 Key 值读取零产品改动**；证据 = git 只读亲算 + G7K committed 收据（`g7-trio-keyed/`）+ G7R EXEC 磁盘工件只读抽查（`.tmp/g7r-fa1-20261007/` · machine receipts · `apps/web/test-results/` trace.zip 解包亲读——未入 git 属如实披露范畴）。

## A. 包完整性机检（独立复算 · 非抄被审文本）

| # | 项 | 结果 | 本席证据 |
|---|-----|------|----------|
| A1 | 收据恰 4 文件 | ✅ | `git show 37a5c26f --stat` = 恰 4 md 全 `+`（+207/−0）全在 `receipts/gap-g7k-api-reds-fix/`；EXEC 全距 `git diff --name-only fa10e01e e67989e4` 仅此 4 + 双 PRE review 文件，**零产品码零 package.json 零 spec 零脚本零 SSOT 三件零 backlog/checklist 零 `.env*`**（`grep -Ev '^ai-docs/'` 计数=0） |
| A2 | 零 Key 物料 | ✅ | committed 收据 `sk-*`/`Bearer` 长令牌机扫 **0 hit**；EXEC 期 3 条原始 log 同法机扫 **0 hit**（本席独立扫）；`.tmp/` gitignore `.gitignore:15` 亲读在位 |
| A3 | 七字段/presence/预算 | ✅ | 三 CMD 收据七字段齐（CMD 原文/EXIT/时间戳/实跑 SHA/envModelApiKey/关键输出/预算）；`.tmp/g7r-fa1-20261007/01/02/03.env-presence.txt` 磁盘亲读 = **3×3 全 ABSENT**；`01/02/03.key-presence.txt` name-only（`envModelApiKey=set` + `profile=dashscope-cn-beijing model=qwen-plus`）零值泄露；预算结构估 <10/<30/<10 = <50 < 200 · 超限即停未触发 · `actualSpendCny=null` |
| A4 | 三来源交叉 | ✅ | `01/02/03.exit`=1/1/1 磁盘亲读；machine receipt CMD1 `{outcome=failed, exitCode=1, failureClass=api, durationMs=15215}` + suite 级 `{failure=e2e_performance_suite_failed:HTTP full E2E:exit=1, gitHead=3767f783…自证}` + 内层 `{exitCode=1, failureClass=api, durationMs=14581}`；start/end 时间戳与收据逐字同 |
| A5 | 同形基线（G7K） | ✅ | `g7-trio-keyed/` 4 文件在案：EXIT 1/1/1 · F1/F2 35.3s/35.6s @`:96` · F3/F4 1.6s/2.5s @`:139` · 24=10P/4F/10S · ledger=[ocr,voice] |

## B. C-HA-1~8 逐条裁决（PRE Conditions · 逐条对 EXEC 收据）

| 条件 | 裁决 | 本席独立证据 |
|------|------|--------------|
| **C-HA-1 重钉** | **满足** | 祖先链 `7b28a492 < fa10e01e < d6d1d64e < 3767f783` 亲证（merge-base --is-ancestor PASS）＝REQUEST + 双 PRE 全在实跑 tip 之内；`7b28a492→3767f783` 非-ai-docs drift **机检 0**；wiring `:278`(e2e:isolated)/`:279`(e2e:ui:isolated)/`:282`(verify:e2e-performance) @`3767f783` sed 亲读回填（PRE OB-3 预钉兑现）；7 blob 锚重算全等：`c655235c`/`aa86fb3f`/`13dbfc43`/`de4991e6`/`3309dc38`/`7d65d0f3`(`e2e/full.e2e.ts`)/`005c68cc`。「origin push 间歇堵」如实登记与 EXEC 时点相符，且**现 origin tip 已含全链**（本席 fetch 亲证 3767f783/d6d1d64e 在 origin），登记核验闭合 |
| **C-HA-2 withhold 零触碰** | **满足** | `run-e2e-isolated.mjs` blob `13dbfc43c744…` @`fa10e01e` 与 @`3767f783` rev-parse 双算**全等**；EXEC 全距零代码 diff ⇒ F-F 不可能已开（无新脚本/探针入树）；case 名甄别仅收据三角法（ledger 越 `:153` → 主 drive 段 · 零发明 case 名） |
| C-HA-3 定谳措辞 | **满足** | 「与 F-A-1 实测不一致（**置信度显著下降 · 非证伪**）」+「H0 与 H0-alt-1 联合假设空间仍开放」逐字在卷（SUMMARY §定谳）；OB-4 探针未作配对证据（egress 401 探针正确标注为连通性面·零 Key 零模型调用） |
| C-HA-4 sticky 口径 | **满足** | 每 CMD 独立 fresh 容器 DB · classify 每新 revision 恰一次新尝试；无旧 sticky 岗位复活记已修的叙事 |
| C-HA-5 EXIT 契约 | **满足** | EXIT 1/1/1 原值未洗；逐 case 五分类在卷；根因假设修正如实登记（H0 置信度下降 + 残余候选集）；每 CMD 恰 1 attempt（`0N.exit` 各一 · Ban retry-to-green 兑现）；CMD3 not_run ≠ pass 原样 |
| C-HA-6 预算 | **满足** | 结构估 <50/200（est-not-counter 基础如实披露）· 无中止 · `actualSpendCny=null` |
| C-HA-7 Key 卫生 | **满足** | 进程环境唯一通道（loader name-only）· `.env*` 三文件 ABSENT 探针逐 CMD 在案（A3 亲读）· 值/fingerprint 零入树零入据（A2 机扫）· F-A-1 两枚配置值非 secret 经协调方下达 |
| C-HA-8 alone≠dual | **满足** | 收据 lifecycle `executed:awaiting_post_prove_dual` · Ban 自批在卷；本段仅为 mw-e2e-ha 一席半签，不代签并行 peer mw-model-op |

## C. 核心裁决——F-A-1 vs G7K 同形性（本席独立对照）

**逐面同形表（G7K @`8c6860e3` vs F-A-1 @`3767f783` · 本席逐格独立复算）**：

| 面 | G7K | F-A-1 | 形态 |
|----|-----|-------|------|
| trio EXIT | 1/1/1 | 1/1/1 | 同形 |
| CMD1 class / ledger | api / [ocr,voice]（越 `:153`） | api / 同 | 同形 |
| CMD2 计分 | 24 = 10P/4F/10S | 同 | 同形 |
| 红① case/点/窗 | recruiting-bound ×2 · waitForURL 30s @`:96` · 35.3s/35.6s | 同 case 同点 @`:96` · 34.8s/34.5s | **同形**（差 ≤0.8s · 均=30s 超时窗+开销 · 量级不变） |
| 红① digest | 190419086 | 382212850 | 同面新 digest（每 run 随机 · 非形态面 · 磁盘快照「出错了·错误标识:382212850」亲读） |
| 红② case/点/耗时 | abandon ×2 · 409≠200 @`:139` · 1.6s/2.5s | 同 case 同点 @`:139` · 1.8s/1.9s | **同形**（秒败量级不变 · 2×「Received: 409」log 亲读） |
| CMD3 | build EXIT0 + migrate EXIT0 → HTTP EXIT1 class=api → 短路 not_run | 同序（22.5s/4.7s/14.6-14.8s · G7K 97.2s/15.0s/31.8s） | 同形（EXIT 序列同形 · 墙钟差属环境面不属失败形态） |
| Key gate / quota | `live_provider_key_missing` 0 hit · quota 0 | 3 log grep 复算 **0/0/0** | 同形 |
| suite pin | `g7SuiteGreen=false` | retained | 同 |
| 新证据面 | 红② SSE 未取证 | **SSE 亲证**（见 D） | 证据增量非形态变化 |

**裁决：同形成立（10/10 面全同形 · 逐格值变化均属同量级/环境面/digest 随机面）。**

**「配对值变化不改变失败形态 → H0 唯一根因置信度下降」推理是否成立：在限缩读法下成立，且必须限缩。** 本席裁定推理链如下：

1. 该同形观测打击的是**联合假设 J =（H0：默认配对错配为三红唯一根因）∧（P：Key provenance=百炼系且具 qwen-plus 权限）**——在 J 下 F-A-1 是真修复，预测行为面必变；实测零变 ⇒ J 似然后验显著下降。这一步成立。
2. 但 H0 **单独**（¬P 分支）对此观测**不做该预测**：若 Key 非 百炼系，F-A-1 值以异源 Key 打 dashscope 端点 → 仍失败 → 零行为变化恰为 H0+¬P 所预测。故同形观测**不可分辨 H0 vs H0-alt-1**——收据「H0 与 H0-alt-1 的联合假设空间仍开放」一句正是本席 PRE C-HA-3/OB-4 所要求的分解，**措辞精度合格**。
3. 同形本身对任一残余候选（H0-alt-1/2/5）**不构成正面证据**——它是失败的区别性预测，不是选票。收据将其列为「登记 backlog 候选 · 非定谳」并把甄别手段（provider 级 name-only 探针/F-F/F-B）正确上交协调方（均未授权未执行）——边界守约。
4. 故收据结论「置信度显著下降 · **非证伪**」是唯一与证据强度匹配的措辞：任何「H0 已证伪」或反向「H0 仍成立」的写法在本观测下均越权。**同形推理裁决：成立（限缩于联合假设 J）· 措辞裁决：合格。**

## D. 新 SSE 证据取证完整性（本席从 primary artifact 独立复现）

CMD2 trace.zip（`apps/web/test-results/uc018-abandon-…-chromium/trace.zip`）解包，resource `647bec132e68157425bd97b232f8a229d4292b2a.dat` **逐字节亲读**：

```
id: 1
event: interview_unavailable
data: {"kind":"start","reason":"job_failed"}
```

与收据引用**逐字全等**。旁证三重独立复现：(a) 同 trace `error-context.md` 页快照「已结束」+ alert「面试启动/处理遇到问题,已停止…」+「重新开始面试」逐字在案；(b) Playwright log 2×「Received: 409」；(c) **码面一致性**——`apps/worker/src/interview-consumer.ts:78` `reason: 'job_failed' | 'worker_died', kind?` + `:162` `terminalizeUnsettledInterview(…, 'job_failed', job.kind)`（`kind:"start"` 与 job.kind 同源）· web 侧 `ALL_PHASES` 含 `interview_unavailable` · quiz/diagnosis consumer 同形 `{reason:'job_failed'}`——SSE 证据非孤证、非发明。**取证完整性：成立**（trace 工件未入 git · 引用合法性收据已如实披露）。

## E. 诚实性专项 audit

- **F-A-2 未触发守约（C-MO-7）**：触发条件（收据现 4xx model-not-exist）在 withhold 面下**不可判读 → 未换值未重跑**，`key-presence` 三文件 profile/model 同值亲读、无第二 attempt——Ban 就地改值重跑兑现。
- **「置信度下降非证伪」措辞**：C-2 已裁合格。
- **`g7SuiteGreen=false` 保持**：Pins/Non-claims/三收据状态行四处 retained，亲读全中。
- **Non-claims 面**：not pass/not fixed/not root-cause-proven/not provider-status-determined/not F-A-2 attempted/not SSOT flip 全列——零越权 claim。
- **Fail-trigger 全未触发**：假设升格结论？否。预填/洗 EXIT？否（1/1/1 原值）。发明 case 名？否。为绿改码/改 spec/改 withhold？否（A1 零 diff）。SSOT/backlog 翻转？否。Key 越界？否（A2/A3）。retry-to-green？否（各 1 attempt）。自批/代签？否。

## F. Blockers

**0 Blocker。**

## G. 观察（非阻断 · 如实登记）

- **OB-P1** origin tip `e67989e4` 系 `37a5c26f` 的**同树重提交**（tree `3909d578` + parent `3767f783` 全等 · committer `meetwise`≠`mw-core` · +122s）——内容 byte-identical，纯 provenance 备注，协调方 nail 时登记取数来源即可。
- **OB-P2** CMD3 收据表内「HTTP full E2E 14826ms」与本收据自钉 machine receipt `durationMs=14581` 差 ~245ms，两数均不见于原始 log 逐字（log 仅 `:207` 短路 `exit=1`）；authoritative 值（machine receipt 14581）已正确在卷且与表内同卷披露——下游引用**须以 14581 为准**（随 C-HA-P4）。
- **OB-P3** 「trace 网络面 GET events→200」的 URL/status 框架本席未能从 `.network` 文件独立解析（录制形态所限），但 SSE body resource + 页快照 + 409 log 三重旁证已覆盖全部承重事实；该 status 表述不承担额外推理载荷。
- **OB-P4** 残余候选排序（H0-alt-2 → H0-alt-1 → H0-alt-5）系披露性判断（附 structural note：`model-operation-registry.ts:148/:153` embedding `wired:false`），在 withhold 面下**非似然排序**——收据已自钉「按证据强度如实排序·非定谳」，下游不得引为概率主张。

## H. Conditions（PASS 随卷 · 下游强制）

- **C-HA-P1** `g7SuiteGreen=false`/trio OPEN/GAP-G7K-API-REDS P1 OPEN 保持；翻转 = 三绿 + post-dual BOTH + 协调方 nail 全链，缺一不可。
- **C-HA-P2** 残余候选（H0-alt-1/2/5）甄别（provider name-only 探针 / F-F / F-B）须经协调方显式授权 + 独立记账 REQUEST，Ban 自批就地开 probe；F-A-2 转换仍须 C-MO-7 触发条件的收据证据。
- **C-HA-P3** H0 措辞纪律延续：「置信度下降」≠「已证伪」；同形观测不得引为对任一残余候选的正面证据；OB-4 探针继续不得作配对证据。
- **C-HA-P4** 下游引用 CMD3 HTTP 步时长以 machine receipt **14581ms** 为准（OB-P2）；引用 SSE/trace 证据须随卷披露其未入 git 状态或以脱敏收据落卷（C-HA-P4a）。
- **C-HA-P5** OB-P1 同树重提交事实由协调方 nail 登记一句即可，Ban 追加改写收据正文。
- **C-HA-P6** alone ≠ dual：本 PASS 仅为 mw-e2e-ha 一席半签，不代签 mw-model-op；本 PASS ≠ EXEC 续授权 ≠ H0 定谳 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`。

## I. 三行中文摘要

1. 包完整性机检全过：恰 4 收据 +207/−0 全 docs、EXEC 全距零产品码零 SSOT 零 Key 物料（收据+3 log 双机扫 0 hit）、presence 3×3 ABSENT 磁盘亲读、machine receipt/gitHead/exit 三源交叉全中、实跑 SHA `3767f783`=REQUEST+双 PRE 孪生链 patch-id 亲证——C-HA-1~8 逐条满足。
2. 同形性核心裁决：F-A-1 三红与 G7K 十面全同形（EXIT 1/1/1 · `:96` 34.8/34.5s · `:139` 409 1.8/1.9s · class=api · 计分 10P/4F/10S）——同形打击的是联合假设（H0唯一∧Key provenance 合配）而非 H0 本身，「置信度显著下降·非证伪」措辞成立且必要；新 SSE 证据 `interview_unavailable{kind:start,reason:job_failed}` 本席从 trace.zip resource 逐字节独立复现并三重旁证+码面同源（interview-consumer `:78`/`:162`）——取证完整性成立。
3. 0 Blocker · 4 非阻断观察（同树重提交 provenance、14826/14581ms 以 14581 为准、trace URL 框架不可独立解析、候选排序非似然）· 6 条 Conditions 随卷；`g7SuiteGreen=false`/trio OPEN 保持；本 PASS 仅为 mw-e2e-ha 半签，不代签 mw-model-op，post-dual BOTH ≠ 任何翻转授权。

Verdict: PASS
