# Receipt — NEGRESFIX · neg:resume 12 红 driver 断言面回和刀 EXEC（mw-negresfix-exec）

**Date**: 2026-10-07（Asia/Shanghai）
**Line/Knife**: NEGRESFIX neg:resume-driver-fix · EXEC 席 `mw-core`（作者 `git -c user.name=mw-negresfix-exec -c user.email=mw-negresfix-exec@meetwise.local`——§STOP 期零行使·协调方裁决〔§6〕后续行面行使·commit hash 见交付报告）
**蓝本**: `ai-docs/delivery/harness/negresume-driver-fix-REQUEST.md` rev2 @ `b7b83996`（唯一蓝本·预执行双审闭环·席2 终态确认 PASS·协调方 EXEC 授权）
**Worktree**: `meetwise-line-negresfix` · branch `line/negresume-driver-fix` · 执行起点 tip = `b7b83996`（工作树 clean 起刀）
**Lifecycle**: `draft_rev2:pre_exec_dual` →（协调方 EXEC 授权）→ 两 run 已行使 → `exec:stopped_input_lane_signature_mismatch`（§3.2 判别式签名不一致分支命中·§5 通用 STOP 停手上报）→（协调方裁决 2026-10-07 input lane 重钉·见 §6·五段判据 MET 成立·prove 有效·放行续行面）→ **`exec:awaiting_post_prove_dual`（本收据终态·commit+push 已落地）**
**Ban self-approve** · alone ≠ dual · 续行/重钉/交付裁决归协调方

---

## 0. Pins 十一值（REQUEST §4 逐字照抄 · 本刀不改口·零翻转）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · 公开 DELETE=**503** · `g7SuiteGreen=false` · `r1Closed=false` + 脚注 `actualSpendCny=null`。本刀 ≠ trio 三绿 ≠ `g7SuiteGreen` 翻转 ≠ :107 关闭。Non-claim：driver 回和 ≠ 产品行为变化（产品侧 `3f5bdc80` 起已钉 fail-closed，本刀仅让测试对齐现实）。

## 1. 交付面（diff face · 恰 1 文件 · 零 commit 留存工作树）

`apps/api/test/neg-resume.proof.ts` 单文件：**+25/−16**（`git diff --numstat`）。三断言块恰 **12 条 A() 改写**（B1×2 + B2×6 + B3×4），其余 58 个静态 A() 位点逐字零变（名单 diff 机证=本目录 `name-list-diff.txt`：removed=12/added=12）；A() 静态位点数改前=改后=73（分母 87 稳定：run1 mkAssert 实印 **87** 条）。非 A() 增行=块内注释（B1 指引四行+B2 一行+B3 三行）+ B3 前置 `beforeTrace`/`beforeInvocation` 两个 before 计数行（「503 后行数不变」式承载行，沿 `validate.ts:552-:555` 形）。**零产品码**（`apps/api/src` 零 diff）·零迁移·零其他测试文件·零 harness/runner 改动·零 CLAUDE.md/CI 触碰。

12 条改写映射（改前名 → 改后名·全在 run1 PASS 名单）：
| # | 块 | 改前（红） | 改后（绿） |
|---|---|---|---|
| 1 | B1 :47 | `userB 图片上传未同意 → 403(计费前即拦,绝不先扣费)` | `→ 422(OCR 能力门先答,计费前即拦,绝不先扣费)` `f.status===422` |
| 2 | B1 :48 | `error=consent_required` | `error=image_ocr_unavailable` `f.body?.error==='image_ocr_unavailable'` |
| 3 | B2 :226 | `delete 不存在 id → 404` | `→ 503(fail-closed,不按存在性分叉)` |
| 4 | B2 :227 | `error=not_found_or_forbidden` | `error=resume_erasure_migration_in_progress` |
| 5 | B2 :230 | `userB 删 userA 的简历 → 404(越权无效)` | `→ 503(恒 fail-closed,不按归属分叉,不泄漏存在性)` `status===503 ∧ error===同码` |
| 6 | B2 :238 | `首次删除自有简历成功(前置,非业务断言)` 200 | `首次删除自有简历 → 503(fail-closed,等异步擦除状态机)` |
| 7 | B2 :240 | `二次删除同一简历 → 404(幂等…)` | `→ 503(幂等 fail-closed,…)` |
| 8 | B2 :241 | `二次删除 error=not_found_or_forbidden` | `error=resume_erasure_migration_in_progress` |
| 9 | B3 :283 | `删除自有简历数据成功(前置)` 200 | `→ 503(fail-closed,等异步擦除状态机)` |
| 10 | B3 :284 | `resumesRemoved===0`（旧形状字段） | `error=resume_erasure_migration_in_progress(旧三字段形状随退疫退役)` |
| 11 | B3 :285-286 | `OCR trace 被同一删除事务清除`（=0 式） | `OCR trace 行数在 503 后不变`＝`beforeTrace>0 ∧ after===beforeTrace`（种子护栏·禁裸 after===before） |
| 12 | B3 :287-288 | `OCR durable invocation 被同一删除事务清除` | 同 #11 形（`beforeInvocation>0 ∧ after===beforeInvocation`） |

对齐锚点（动码前亲测）：`resume.service.ts:96→:98`（consent throw 先于 reserveEntitlement）·`:278-280`（`remove(): never` 恒 503 不分叉）·`privacy.controller.ts:57-61`（`@HttpCode(503)`）·`privacy.service.ts:65-67`（恒 throw 503 `resume_erasure_migration_in_progress`）·`_neg-harness.ts:49`（`OCR_ENABLED:'0'`）·`package.json:47`（`neg:all` 六段序 auth→commerce→resume→interview→bend→input）。与探针 12 行分类表 1:1 对应。

## 2. prove（恰 2 run · 零 retry-to-green · EXIT 原值如实）

**协议**：两键均经授权隔离门 `node scripts/run-e2e-isolated.mjs <target>`（每 run 一次性 disposable pgvector 容器+按名单迁移预放·`--rm` 自拆·绝不触碰开发库）。首跑前置 `pnpm install --frozen-lockfile`（godfn-1d attempts #7 同例）。全离线本地 API·零真实模型外呼·**est live 模型调用 = 0**；Key 经授权 loader 进程 env **name-only 核查（本 shell 环境零 secret 系 env 名）零打印零落盘**；`.env*` 全树 ABSENT（find=0）；容器用后即焚（本刀两 run 零遗留——现存唯一 `meetwise-e2e-62497-cold2-*` 为 45h 前他刀残迹·零触碰）。

### 2.1 run1 `neg:resume`（改后）——**EXIT=0**
- `✓ neg:resume: 87 条负路径用例全绿`（PASS=87 / FAIL=0·分母 87 稳定）。
- 改前改后 PASS/FAIL 名单 diff **恰 12 条**（机证双证=①mkAssert 打印名单对 `name-list-diff.txt`：removed 12=改前 12 红、added 12 全 PASS；②`git diff` 改动行 ⊆ 12 条 A()+注释/前置行·其余零弱化）。§3 循环 10 展开+§4 循环 9 展开+§11 else 臂 2 条与 base 行为同构（§11 if 臂 3 条 base 亦未行使）。
- **base 12/87 签名导出式**：改前红名单非本刀复跑所得（恰 2 run 纪律），自 godfn-1d 收据 `receipts/godfn-decompose/1d/2026-10-07-exec-receipt.md:80` 导出——`neg:resume EXIT=1（12/87）base≡red 签名 IDENTICAL`（该收据 :120 协议：同 runner 同协议 `sort|uniq -c` diff IDENTICAL），红点语义与探针 `negresume-driver-fix-probe.md` 12 行分类表逐条对应=本刀改写面。

### 2.2 run2 `neg:all` 全链——**EXIT=1（原值如实记）**
| 段 | 结果 | 判 |
|---|---|---|
| neg:auth | `✓ 81 条全绿` | 绿 ✓ |
| neg:commerce | `✓ 84 条全绿` | 绿 ✓ |
| **neg:resume** | `✓ 87 条全绿` | **绿 ✓（修复实证入全链）** |
| neg:interview | `✓ 97 条全绿` | 绿 ✓ |
| neg:bend | `✓ 120 条全绿` | 绿 ✓ |
| neg:input | `✗ 2/135 失败` | **红 lane·判别式未过·见 §STOP** |

**五段判据 MET**（auth 81+commerce 84+resume 87+interview 97+bend 120 全绿·含 resume 修复实证）。input 段签名：PASS=133/FAIL=2（`run2-input-signature.txt`·段边界=neg:bend 汇总行后恰 135 行=分母），FAIL 名单：
1. `inj:sqli-in-status-query-nocrash`（neg-input.proof.ts:216·GET /interview?status= 注入 noCrash 面·interview 域）
2. `inj:non-uuid-id/resume-delete`（neg-input.proof.ts:229·DELETE /resume/not-a-uuid 期望 is4xx·现网 fail-closed 503 落 is4xx 之外——**与本刀 B2 同一 fail-closed 契约族的 driver 期望漂移**，唯位于 neg-input.proof.ts=本刀范围外〔零其他测试文件〕）

## §STOP · 判别式判定（REQUEST §3.2 预注册分支·命中上报）

REQUEST §3.2 安全港前提=「红点=neg:input **4/135** 且 PASS/FAIL 签名与 godfn-1d :81 IDENTICAL（`sort|uniq -c` diff 同该收据 ：120 协议）」。本 run 实测 **2/135**——计数与名单均与 godfn-1d :81 钉值（`EXIT=1（4/135）base≡red`）**不一致**→按同一条款预注册出口「**若签名不一致→触发 §5 通用 STOP 停手上报**」。EXEC 不自行裁定其良性（Ban self-approve），按机制停手：

- **零 commit 零 push**（授权 §5-§6 交付步未行使·改动面完整留存工作树：`apps/api/test/neg-resume.proof.ts` modified + 本收据目录 untracked）。
- **本刀 12 条改写本身零弱化零洗红**：run1 87/87+run2 resume 段 87/87 双实证；input 2 红与本刀零因果（本刀 diff 恰 1 测试文件·不在 input 段执行路径·零产品码；neg-input.proof.ts 自 `3c87bfa7` 创建后零变更史）。
- **lane 漂移事实供协调方裁决**：godfn-1d（base `86627721`）钉 4/135 → 本 tip（`b7b83996`+本刀工作树）实测 2/135。区间 38 commits（产品码=仅 `3c9f235c` godfn-1d 本身 + `47fcc36d` g7fix4）。godfn-1d 收据未枚举其 4 红名单（计数级钉账），故「2 红⊆旧 4 红·另 2 红被他刀修绿」为最简假说但**不可由在案收据机证**——归域上报，lane 重钉（或追钉）另刀/协调方裁决后本刀方可续行（续行面：commit+push+exec:awaiting_post_prove_dual）。

## 3. 勘误落账（EXEC 前亲测·非阻断披露）

1. **validate.ts 活断言实位**：REQUEST rev2/协调方令引「validate.ts:396（422 形）+:398（拒绝→计费增量 0）」——awk 1-based 亲测实位为 **:395**（422 形）+ **:396-:397**（增量 0·跨两行），:398 为空行。形状与所指断言逐字一致，系 ±1 计数漂移（同 REQUEST 自身 E1 勘误先例：rev1 引 :556 实形块 :552-:555）。B1 块内注释按实位落 `:395+:396`（代码内引真值·本收据记勘误）。
2. **B2 注释引 `validate.ts:548`**：亲测 1-based 恰为 :548（`旧单份删除不按资源存在性分叉…503`）·蓝本引值准确，零勘误。

## 4. 停止条件核查（授权令 §5 a-d）

- a) 实树锚点与蓝本行号/形状不符——**B1/B2/B3 全部锚点 (:46-48/:226-241/:282-293) 及 resume.service/privacy.controller/harness/package.json/godfn-1d :81/:120 亲测吻合；validate.ts :396/:398 为 ±1 引漂（形状一致）→按 E1 先例勘误落账，未判 STOP**。
- b) 需触范围外任何文件——**未命中**（diff 恰 1 文件）。
- c) prove 红非 neg:input 预存红 lane——**input 红位于预存 lane 域但签名（2/135≠4/135）不满足预注册安全港判别式→按 §3.2 条款命中 §5 通用 STOP（本收据主体）**。
- d) 需要 live 外呼——**未命中**（est live=0·全离线）。

## 5. 纪律声明

Key name-only 零打印零落盘 · `.env*` ABSENT · 容器用后即焚（`--rm` 自拆·零遗留）· est live=0 · 零 retry-to-green（恰 2 run·EXIT 原值如实）· pins 十一值零翻转 · Ban secrets/.env* · Ban self-approve · **收据清单**：本收据 + `run1-neg-resume.post.log`（wrapper 全文·RUN1_EXIT=0）+ `run1-pass-list.txt`（87 PASS 名单全文）+ `run2-neg-all.post.log`（wrapper 全文·尾行 RUN2_EXIT=1）+ `run2-input-signature.txt`（input 段签名 sort|uniq -c 形）+ `name-list-diff.txt`（12 条名单 diff 机证·added 12 全标 run1 PASS）。

## 6. 协调方裁决（input lane 重钉 · 续行面放行 · 2026-10-07）

**裁决输入**：本收据 §STOP 上报（run2 五段判据 MET + neg:input 实测 2/135 ≠ godfn-1d :81 钉 4/135 签名漂移·EXEC 停手零 commit 零 push）。

**归因链（协调方定谳·逐条照录）**：
1. 实测 2/135 且 FAIL 名单恰 = `inj:sqli-in-status-query-nocrash`（neg-input.proof.ts:216·harness 环境缺口）+ `inj:non-uuid-id/resume-delete`（:229·driver 漂移·与本刀 B2 同 fail-closed 503 族）——**两条均已立项归 NEGINPUT 重划刀**（恰 1 文件 `apps/api/test/neg-input.proof.ts`：3 shim + 1 回和）。
2. godfn-1d 钉的另 2 红（:267/:268 XSS 对）在本刀 run2 **全链上下文转绿** = **上下文依赖红**（standalone 探针 4 红 vs 全链 2 红差异）——**登记为 finding 归 NEGINPUT 刀 §0**。
3. **lane 判定 = base≡red 族确认·签名漂移 4→2 归因 = 上下文依赖·非本刀 diff 所致**（本刀已证：diff 恰 1 测试文件不在 input 段执行路径 + neg-input.proof.ts 自 `3c87bfa7` 零变更史·§STOP 因果隔离三证）。
4. **裁决：五段判据 MET 成立·本刀 prove 有效·放行续行面**（commit+push+REQUEST 状态行推进 `exec:awaiting_post_prove_dual`）。

**续行面执行实录（本节）**：① 本 §6 落盘（含上下文依赖 finding 登记）；② commit+push（author `mw-negresfix-exec <mw-negresfix-exec@meetwise.local>`·branch `line/negresume-driver-fix`·hash 见交付报告）；③ REQUEST 状态行 append-only 推进 `exec:awaiting_post_prove_dual`；④ 工件修正落账：`name-list-diff.txt` 首行陈旧算术注释「70-12=58」更正为「73−12=61」并补 added=>run1 PASS 机证标记（数值面 73/73·12/12 原即正确）。**零其余改动**（零产品码·零范围外文件·§0-§5 原文零改写）。

**残留外域债登记（本刀不修不翻不闭）**：neg:input 2 红 + 上下文依赖红 finding 均归 NEGINPUT 重划刀；本刀 ≠ trio 三绿 ≠ `g7SuiteGreen` 翻转 ≠ :107 关闭（三绿判定=CMD3 全套件重验另刀/协调方裁决）。
