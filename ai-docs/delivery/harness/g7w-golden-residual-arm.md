# Harness — G7W-G · **golden 冷启残红 ×1 全 suite 上下文复现臂**（鉴别刀 · Line G7W-G · docs REQUEST · `draft:awaiting_pre_exec_dual` · H-G3 假说族判别器 · ≠ 修复 ≠ 翻绿 ≠ 残红定谳）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿/Ban retry-to-green · **N=3+对照 1 一次成型 · Ban 事后加跑/择优** · Ban 碰 spec/产品码/wrapper · Ban 改共享 SSOT · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT/判别结果）
**Date**: 2026-10-07
**Line**: **G7W-G**（G7W nail 登记块 @`execution-master-checklist.md:1348-1358`（主线 tip `eef469d9` 可读）指名后继：实验一归因裁决 **suspended**——「残留=『G7U 两轮环境特异（宿主负载/栈启动抖动）』候选如实挂起回协调方（**Ban 定谳『永不复现』· 是否立行/全 suite 上下文复现臂归协调方**）」→ 协调方现裁决：**立全 suite 上下文复现臂刀**——检验「golden ×1 只在全 suite 上下文（多 spec 并行/资源竞争）复现」假设 · 残红①/残红③/P2 复验门均不在本刀）
**授权链**: G7U EXEC（真测 trio EXIT 1/1/1 · CMD2 golden 全量上下文红在卷）→ G7U POST dual BOTH PASS → coordinator G7U nail `bbc361fa` → G7W REQUEST `93b3c215`（origin · 孪生 `9b95f04c` patch-id 全等）→ G7W PRE dual BOTH PASS（mw-e2e-ha `1cfb0cdf` + mw-model-op `10e25f38`）→ 协调方 EXEC 授权 → G7W EXEC `7db84c18`（实验一 6 run/12 golden 执行全绿 · 含冷栈+冷 build 最高红概率条件 · 分段 3.0–4.4s ≪ 20s）→ G7W POST dual BOTH PASS（mw-e2e-ha `33ad1181` + mw-model-op `4eae75c9`）→ coordinator G7W nail（suspended 登记 · checklist `:1348-1358`）→ **协调方裁决立 G7W-G → 本 REQUEST（docs-only）→ pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ meetwise 授权 EXEC（N=3+1 一次成型）→ post-prove dual BOTH PASS → meetwise 授权 nail**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权 ≠ 判别结论预claim。
**输入事实（只读在案引用）**：
- **残红② 红样本 ×2 全部发生于全量上下文**：G7U EXEC CMD2（`dbed8a6f` 实跑 · Receipt 02 · `e2e:ui:isolated` 全量）golden(chromium) ✘——resume 页 `textarea[name="text"]` `toBeVisible` 20s 超时（收据锚 `golden.spec.ts:10` · blob `8db8746b`）；G7U post-dual mw-model-op fresh re-run（**11P/3F/10S 全量**）golden 红同位复现；第三样本 mw-e2e-ha re-run（12P/2F/10S 全量）golden PASS 3.1s——**同码 2 红 1 绿三样本全部是全 suite 上下文样本**。
- **G7W 实验一 6 run / 12 golden 执行全部是过滤单跑**（CMD=`E2E_UI_GREP='golden path' pnpm run e2e:ui:isolated`）全绿——run1 含冷栈+冷 build 最高红概率条件（OB-4 · runner 原生行为非破坏注入）· 分段 3.0–4.4s ≪ 20s（G7W POST mw-e2e-ha 逐 log 亲读在卷）。**红组（全量）与绿组（过滤）上下文口径不同=未受控混杂变量——此即本刀唯一检验面**。
- **判读仪表基线（G7W 在卷）**：golden 执行分段 3.0–4.4s（navigation/consent/textarea 三段沿 G7W 判读仪表）vs 失败面 20s 超时窗（`golden.spec.ts:10` 内层断言 `:48`/`:50`）。
**Base**: `origin/feat/mysql-schema-skeleton` **`eef469d9`**（full `eef469d9b1305e290d41f510922c0b0795f2266f` · fetch 后实测 tip=预期 ≥`eef469d9` 恰等 · 无 turn 内 origin 前进）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-golden` · branch `line/g7w-golden-residual-arm`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**
**Retained（本刀零翻转）**: 残红② golden 冷启归因 **suspended/OPEN**（本刀指名面 · **行状态翻转归协调方 nail · Ban 本刀关行**）· trio **OPEN**（G7U 真测 1/1/1 · G7W 6 甄别绿 + CMD1 预期红 1 零冲销）· GAP-G7K-API-REDS **P1 OPEN**（backlog `:107` 不翻）· `GAP-G7W-API-TAIL-DEATH` **P1 OPEN**（残红③ · 刀①/刀②域 · 非本刀）· `GAP-G7W-QGEN-SCHEMA-VALIDATION` **P2 OPEN**（复验门 · 非本刀）· 残红① 旅程自适应早停 ×2 **OPEN**（非本刀 · 产品正确性面已定谳）· 红③ `full.e2e.ts:203`（C-MO-P3 · 非本刀）· Disclosure-1 OPEN · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true`

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban 实跑的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码/spec/wrapper 改动**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`eef469d9`；关键码面 blob `git hash-object` 亲算在卷 §1.3）；**(b)** G7W EXEC 收据 3 文件（`ai-docs/delivery/receipts/g7w-golden-api-discriminator/` · commit `7db84c18`）+ G7W POST dual + G7W nail 登记块（checklist `:1348-1358`）引用；**(c)** G7U EXEC 收据链（`c9e262a5`）引用；**(d)** suite 清单 `ls`+`grep -c 'test('` 实测在卷 §2。不发明任何未在案明细；行号 EXEC 期按当 tip 重核回填。**判别结论无论何向，如实入收据（Ban 两向定谳压力 · Ban 就地 reinterpret）。**

## 1. 假设族（预注册 · 不预设结论 · 沿 FLK/G7W 先例每假设带预测+反例分支）

> **承卷**：G7W 实验一 H-G1/H-G2 削弱+suspended、H-G3（宿主资源/位次竞争）契约内不可证伪（破坏性注入=Ban）——本刀不重开 G7W 判读表、不重裁已定谳值域；只在 **H-G3 族内**加立可判别子假设，检验「上下文」这一唯一未受控变量。

- **H-G3a（全 suite 上下文资源竞争）**：golden 简历页 textarea 超时只在**全 suite 上下文**（多 spec 收集+执行期的栈进程/Playwright/宿主资源竞争）复现——G7U 两轮红均发生于 trio 全量上下文。**预测**：主臂（全量 ×3）≥1 红 · 对照臂（过滤 ×1）绿。**反例分支**：主臂全绿且对照绿 → a 削弱（非证伪）。
- **H-G3b（与上下文无关）**：单跑（过滤）亦复现——**G7W 已 6 绿 · 先验低**（如实登记非剔除）。**预测**：对照臂亦红。**反例分支**：对照臂绿 → b 进一步削弱。
- **H-G3c（位次/执行序非确定性）**：非确定性与 **suite 内执行序/收集上下文**有关——golden 字母序首位=suite 首测位（G7U 在卷「suite 首测」候选承卷）；全量收集（7 spec 清单）vs 过滤单 spec 收集的位次效应差异。**预测**：主臂红（与 a 同向）。
- **a/c 关系预声明**：两假说对主臂**同预测（红）**——本刀**不预设二者可分**；分流证据=分段读数形状（资源竞争预期多段普遍膨胀/抖动 · 位次效应预期首测位特异而同窗热位次同路由秒级），形状判读**入收据 · a/c 归一或分流=登记非定谳**，定谳权归协调方。
- **判别读数（预注册）**：每次 golden 执行的**分段时长**（基线 3.0–4.4s vs 超时窗 20s——`t_navigate(/resume)` / `t_consent(可见)` / `t_textarea(可见)` 三段沿 G7W 判读仪表 · trace `retain-on-failure` 零改动）+ **上下文并行度如实记录**（runner project/worker 配置 @EXEC tip 实测：`workers:1` `:17` · `fullyParallel:false` `:13` · projects chromium+mobile 双端 `:27-31` · `retries:0` `:19`——**零改动只记录**）。

## 2. 实验设计（预注册 · 一次成型 N=3+1 · Ban 事后加跑/择优/retry-to-green）

**suite 清单基线（实测 @`eef469d9`）**：`apps/web/e2e-ui/` 恰 7 spec 文件——`golden.spec.ts` 2 tests（`:10` golden path 触 resume 面 · `:61` 无 cookie 重定向不触）/ `online-public.spec.ts` 2 / `recruiting-bound.spec.ts` 1 / `screenshots.spec.ts` 3（runner `--grep-invert 'capture README screenshots'` 常驻排除）/ `stream-window.spec.ts` 1 / `uc018-abandon.spec.ts` 1 / `voice-duplex.spec.ts` 9；skip 门如实（online-public `ONLINE_BASE_URL` 门 `:15` · voice-duplex DASHSCOPE key 门 `:9`）——**EXEC 期逐 run tally（P/F/S）如实记录不预设**。

- **主臂（全 suite 上下文臂）**：`pnpm run e2e:ui:isolated`（**无 `E2E_UI_GREP`** · wiring `package.json:279` blob `0afb3bd2`）× **N=3**（预注册）——同 committed SHA 同命令独立 worktree；读数=golden 执行红/绿 + 分段时长分布 + 全 suite tally + 上下文并行度实测值。
- **对照臂（同窗对照）**：`E2E_UI_GREP='golden path' pnpm run e2e:ui:isolated` ×1——**预期绿**（G7W 6 绿口径同形 · 作同窗对照锚）；**执行序预注册固定=主臂 S1→S2→S3 → 对照 C1**（Ban 事后调序/插跑）。
- **判别判据（预注册 · 双向契约）**：
  - **主臂 golden 红 ≥1** → **H-G3a/c 候选成立（登记非定谳）**——措辞纪律「与全 suite 上下文一致」≠「H-G3a/c 已证」（沿 G7R C-MO-2）；处置（夹具/基建刀 or backlog 立行 or 关闭）归协调方。
  - **主臂 3 全绿** → **残红持续 suspended（不闭行不定谳）**——假说再削弱（样本量限制如实），**Ban 定谳「永不复现」· Ban 触发任何追加 run** · 如实回协调方。
  - **对照臂红（预期绿实红）** → **H-G3b 升权**如实登记（表外值域 → 回协调方 · Ban 就地 reinterpret）。
  - **双向契约**：主臂红/绿、对照臂红均为合法判别读数——**预期红≠判别失败同构沿 G7W**（红方向无冲销对象 · 红原值记账）；任何方向结果都不触发补跑/加样/调参重跑。

### 1.3 码面锚（blob 亲算 @`eef469d9`）

| 锚 | file:line | blob | 内容 |
|---|---|---|---|
| golden 失败面 | `apps/web/e2e-ui/golden.spec.ts:10`（内层断言 `:48`/`:50` · 第二 test `:61` 不触 resume 面） | `8db8746b` | resume 页 textarea `toBeVisible` 20s 超时窗（与 G7W 时代 blob 全等） |
| 并行度/trace 配置 | `apps/web/playwright.config.ts:12`（expect 10s）· `:13`（fullyParallel:false）· `:17`（workers:1）· `:19`（retries:0）· `:24`（trace retain-on-failure）· `:27-31`（projects chromium+mobile） | `321b80e0` | **上下文并行度判别读数的配置面——零改动只记录** |
| UI runner | `scripts/run-e2e-ui.mjs:141`（spawn api）· `:144`（spawn worker）· `:161`（BUILD_ID 缺席才 build）· `:179`（spawn web production `next start`）· `:193`（`E2E_UI_GREP`→`--grep` 透传）· `:194`（`E2E_UI_PROJECT`→`--project`） | `aa86fb3f` | 每 run 重新 spawn 真栈=冷启窗口物理来源（G7W H-G1 承卷）；主臂=不设 GREP · 对照臂=GREP 透传（契约内既有机制） |
| wiring | `package.json:278`（`e2e:isolated`）· `:279`（`e2e:ui:isolated`） | `0afb3bd2` | 主/对照臂共同命令体（与 G7W 时代 blob 全等） |

## 3. 边界（Ban 清单）

1. **Ban 两向定谳**：Ban 定谳「永不复现」、Ban 定谳「环境特异已证」、Ban 定谳「H-G3a/c 已证」——判别读数只作**登记非定谳**，定谳/关闭/立行权归协调方。
2. **Ban 关 GAP-G7K-API-REDS 残红②**：suspended 行状态翻转归协调方 nail；backlog `:107` P1 OPEN 不翻；`GAP-G7W-API-TAIL-DEATH`/`GAP-G7W-QGEN-SCHEMA-VALIDATION` 行零触碰。
3. **Ban 碰 spec/产品码/wrapper**：`golden.spec.ts`（`8db8746b`）/`playwright.config.ts`（`321b80e0`）/`run-e2e-ui.mjs`（`aa86fb3f`）/`package.json`（`0afb3bd2`）四 blob EXEC 前后全等机检强制；Ban 调 `workers`/`projects`/`retries`/超时/Ban 加 `E2E_UI_PROJECT` 等任何配置操纵（并行度=如实记录的判别读数非操纵旋钮）。
4. **Ban 改共享 SSOT**：checklist/backlog/covered 矩阵/sibling 归档（G7K/G7R/F-F/G7S/G7T/G7U/G7W/G7X lifecycle）零触碰；登记留 nail 阶段。
5. **Ban 顺手做其他残红面**：残红①（旅程自适应早停 ×2 · 产品正确性已定谳）、残红③（刀①/刀②域 `GAP-G7W-API-TAIL-DEATH`）、`GAP-G7W-QGEN-SCHEMA-VALIDATION` P2 复验门、红③ `full.e2e.ts:203`（C-MO-P3）——均不在本刀。
6. **Ban retry-to-green / 择优 / 事后加跑**：N=3+1 一次成型；红 EXIT 原值记账**不冲销** G7U/G7W 台账（G7U CMD2 真红 + G7W 6 甄别绿 + G7W CMD1 预期红原值全保持）；无升压臂（G7W 升压臂 B 先例不承卷——本刀主臂即全量上下文，无「加样至 ≥6」预注册分支，**任何追加 run=违纪**）。
7. **Ban 破坏性注入**：Ban 降宿主资源/杀进程/清 BUILD_ID/限核复现——H-G3 族契约内不可证伪性承卷，本刀只做**自然上下文对照**（全量 vs 过滤）不注入；Ban masking/Ban 伪造状态。
8. **Ban Key 物料越界 / Ban self-approve / alone ≠ dual**：模型 Key 只经进程环境（loader source · name-only）· Ban Key 值/fingerprint 入 receipt/log/commit · Ban 写任何 `.env*`；栈进程凭据=容器固定测试凭据（非模型 Key）。

## 4. prove 方案（EXEC 期 · pre-exec dual BOTH PASS + meetwise 授权后方可行）

1. **前置**：pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ meetwise 显式 EXEC 授权（committed SHA 重钉含重新 fetch · N=3+1 与执行序确认定值一次成型）→ 独立 worktree + `pnpm install --frozen-lockfile`（EXIT 记录）。
2. **执行序（固定 · 一次成型）**：S1→S2→S3（主臂全量）→ C1（对照臂过滤）；七字段逐 run 全记录：CMD 原文 + EXIT 原值 + 起止时间戳 + 实跑 code SHA（receipt commit ≠ 实跑 SHA）+ worktree/branch + 环境探针（`.env*` ABSENT presence + `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` name-only）+ 判读归类；`EXIT`/`E2E_FAILURE_CLASS`/machine receipt（`.tmp/e2e-receipts/*.json`）/Playwright tally 四来源交叉一致才可引用；**全部 attempt 全记录 Ban 删除/覆盖**。
3. **判读仪表（沿 G7W 零改动）**：trace `retain-on-failure`（`playwright.config.ts:24`）+ 分段时间轴 `t_navigate(/resume)/t_consent/t_textarea` + 栈起就绪日志 name-only 摘录入收据（原文留 `.tmp/` 不入 git）；**每次 golden 执行分段时长逐条落收据**（对照基线 3.0–4.4s · 20s 超时窗锚）；主臂红时 trace 逐段归入 §1 判别读数形状，判读表外值域→回协调方。
4. **上下文并行度如实记录（非操纵）**：`workers:1`/`fullyParallel:false`/projects（chromium+mobile 双 project 串行）/`retries:0` @EXEC tip 实测值 + suite 收集清单（7 spec · skip 门实际触发数）逐 run 落收据。
5. **预算（est-not-counter · 硬帽 ≤200）**：主臂全量 ×3——live 面按 suite spec 结构估（golden `:10` 1–2 简历摄取/执行 + recruiting-bound/stream-window 旅程面 ~≤7/run · voice-duplex/online-public 视 skip 门如实计）≈ est ≤30；对照臂 ×1 est ≤5（G7W golden 单跑口径）。**总 est ≤35 ≪ 200**；EXEC 期按当 tip spec 清单与 skip 门实数重估落收据，超限即停如实记中止（不洗 not_run）；**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
6. **收据落点**：`ai-docs/delivery/receipts/g7wg-golden-residual-arm/`——per-run 收据 + `SUMMARY.md`（判别判据落点逐条对号 + 分段时长分布 + 上下文并行度实测 + Pins/Retained 原值 + `g7SuiteGreen=false` 保持声明 + **判别结论无论何向如实入收据**）；evidenceOfRecord/SSOT 登记留 nail 阶段。
7. **EXIT 后路由**：候选成立 → 处置权归协调方（夹具/基建刀 or backlog 立行 or 关闭）；全绿 → suspended 持续如实回协调方（不闭行）；对照臂红 → H-G3b 升权登记回协调方。修复一律另刀（新 REQUEST+双审+授权）。

## 5. EXIT 契约（双向）

- **主臂红 ≥1** → H-G3a/c 候选成立**登记非定谳**（「与 X 一致」≠「X 已证」· a/c 分流=形状读数登记非定谳）；**候选成立 ≠ 修复 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**——`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + meetwise nail 全链（缺一不可）。
- **主臂全绿** → 残红持续 **suspended**（不闭行不定谳 · Ban 定谳「永不复现」）；对照臂红 → H-G3b 升权登记。
- **红原值记账**：本刀任何红 EXIT 均不冲销 G7U 真测 1/1/1、不冲销 G7W 6 甄别绿/1 预期红台账；预期红≠判别失败双向适用。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim 判别结果。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 判别结论定谳（H-G3a/b/c 结果未产生 · 本 turn 只有设计）· not 残红② closed/un-suspended（suspended 行状态翻转归协调方 nail）· not 残红① touched · not 残红③ touched（刀①/刀②域）· not P2 复验门 touched · not 旧红③ C-MO-P3 touched · not trio green（真测 1/1/1 retained）· not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 立行/状态翻转 · not live（本 turn）· not coordinator/meetwise authorize · `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

---
*Harness · G7W-G golden 冷启残红 ×1 全 suite 上下文复现臂（鉴别刀）· 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 假设族预注册（H-G3a 全 suite 上下文资源竞争 / H-G3b 上下文无关先验低 / H-G3c 位次执行序 · 判别读数=分段时长 3.0–4.4s 基线 vs 20s 超时窗 + 上下文并行度如实记录）· 主臂=`e2e:ui:isolated` 全量（无 GREP）×N=3 + 对照臂=过滤单跑 ×1 预期绿 · 判别判据：主臂红 ≥1→H-G3a/c 候选成立（登记非定谳）· 主臂全绿→suspended 持续（不闭行不定谳 Ban 定谳永不复现）· N=3+1 一次成型 Ban 事后加跑/择优/retry-to-green · 红原值记账不冲销 G7U/G7W 台账 · Ban 碰 spec/产品码/SSOT · Ban 顺手做残红①③/P2 面 · est ≤35 ≪ 200（est-not-counter）· `actualSpendCny=null` · STOP*
