# UC-025 E2E 残面收口 · EXEC 收据（00-exec）

**Knife**: UC-025 行收口四件合卷（`ai-docs/delivery/harness/uc025-e2e-REQUEST.md` §1-修法 件①-④ · §9-rev R1-R8 全约束）
**Gap ids**: `GAP-UC025-BOUND-ISOLATED-01`（件①）· `GAP-UC025-REQUIZ-ENTRY-01`（件②）· `GAP-UC025-COVERED-REASSESS-01`（件③）
**EXEC base**: `line/uc025-draft` @`6da9821c8`（协调方授权 committed SHA·base `main` `47dd6be5`）
**Code commit**: **`4513dc8d4`**（9 files · +886 −5 · secret gate passed · ⛔push 未推）
**Receipt commit**: 本 commit（件④+§9-EXEC·R3 定序：件③ EXIT0 先行→收据后写）
**Date**: 2026-10-26 · **est live=0**（prove 全离线隔离 PG·零模型外呼·零 Key 加载）· **actualSpendCny=null**

---

## ⑦ STOP 终态（置顶·如实）

**STOP 未翻：维持 `draft:awaiting_pre_exec_dual`（史录值）**——**门② 六证回归之 `uc025:nhp-adv:prove` EXIT=1，为基线遗留红（stash 亲证 @`6da9821c8` 净树同红·根因不在本刀交付面·详见 ②/偏离 D2）**，按 REQUEST §8「验收红不可修→停·如实登记（Ban 借机修）」与派单 brief「任一门红…命中即停上报」处置：四件全部落码、门矩阵十门 EXIT=0、一门红如实登记、STOP 不翻 `executed:awaiting_post_prove_dual`（uc028 `8f86d50a5` 受阻上报同形先例）。**待协调方两裁**：D1 追认 11 tracked 口径；D2 裁基线遗留红处置（另刀修 ADV 静态 pin 或授权窄豁免）。

## ① 门矩阵全表（EXIT 原值·全部本席亲跑）

| # | 门 | CMD | EXIT 原值 | 明细 |
|---|----|-----|-----------|------|
| 1 | BOUND 隔离面 | `pnpm uc025:nhp-bound-isolated:prove` | **0** | 27/27 · B1–B5+ISO+PIN 全过 · **attempts 1,0**（attempt1 EXIT0=lint REWORK 前文件·attempt2 EXIT0=REWORK 后·REWORK=零警告化仅·见偏离 D3） |
| 2a | 六证·stale-quiz-expiry | `pnpm uc025:stale-quiz-expiry:prove` | **0** | 隔离壳 |
| 2b | 六证·nhp-neg | `pnpm uc025:nhp-neg:prove` | **0** | in-process |
| 2c | 六证·nhp-bound | `pnpm uc025:nhp-bound:prove` | **0** | 改前基线恰一次 EXIT0（@`6da9821c8` 留档）+改后 EXIT0 |
| 2d | 六证·nhp-fault | `pnpm uc025:nhp-fault:prove` | **0** | in-process |
| 2e | 六证·nhp-fault-isolated | `pnpm uc025:nhp-fault-isolated:prove` | **0** | 隔离壳 |
| 2f | 六证·nhp-adv | `pnpm uc025:nhp-adv:prove` | **1** | **基线遗留红**·45 asserts 中恰 1 fail=`[PIN\|infra] anchor toLowerCase compare`·18/18 ADV-new+8/8 complementary 全过·stash 亲证净树 @`6da9821c8` 同红（GAP_DETAIL 逐字同）·见偏离 D2 |
| 3 | web 行为面 | `pnpm -C apps/web prove` | **0** | 423→**427** 断言（+4=件②新断言·既有零弱化·语义重锚见 ③） |
| 3b | web action 面 | `pnpm -C apps/web prove:interviews-actions` | **0** | 17→**20** 断言（+3=①b stale_quiz 透传臂） |
| 4 | covered 评估跑点 | `pnpm uc025:covered-reassess:prove` | **0** | canHonestlyFlip=false **由 evaluate() 算出** · refuse 含 STATUS-NOT-COVERED+OPEN-GAP · 矩阵 ：125/:274 行锚恰等 · 评估器零字节 · report-only |
| 5 | migrate | `pnpm migrate:prove` | **0** | 链头不变·本刀零迁移零新表 |
| 6 | typecheck | `pnpm turbo typecheck --force` | **0** | 8/8 successful·0 cached 口径 |
| 7 | lint | `pnpm turbo lint` | **0** | 12/12·0 errors · web **601=帽 601 贴线**（基线 601→改后 601=本刀零增）· api 1423=帽 1423（基线 1423→改后 1423=件①文件零警告化后）· root 5242=帽 |
| 8 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **0** | **2344 ≤ cap 2346**（届值恰等 REQUEST §2-8 预期 2344·余量 2） |
| 9 | markers 五类 | 本刀改动集净增行探针 | **0/0/0/0/0** | 冲突标记 0·遗留标词 0·假绿/弱化词（`.skip(`/`.only(`/`xit(`/`xdescribe(`）0·secrets 样值 0·词面运行时组装防自指 |
| 10 | diff 面 | `git diff --numstat 6da9821c8..HEAD`（两 commit 合计） | **11 tracked** | **原 spec 恰 10 → 恰 11**（偏离 D1·第 11 路径=`scripts/run-e2e-isolated.mjs`）·评估器/六 proof/API 产品码/SSOT 零触 |
| 11 | 卫生 | `pnpm install --frozen-lockfile` | **0** | 零 lockfile 改 · `.env*` ABSENT（ls 无命中双向记录）· actualSpendCny=null · est live=0 |

## ② 门② 红根因机证（D2·基线遗留·非本刀）

- 失败断言：`A('PIN', 'anchor toLowerCase compare', !!uniqueHit(/toLowerCase\(\)\s*!==\s*resumeId\.toLowerCase\(\)/)))`（`apps/api/test/uc-e2e-025-nhp-adv.proof.ts:299`·**恰一命中**否则红·AK 冻结面 §3-2 六脚本零字节改）。
- 机证链：`beginInterviewCore` 区域内该 regex 命中数=**2**（BOUND 守卫 `pinnedResumeId.toLowerCase()…` + `ebba26bef`（2026-10-20 `fix(api): 重复开始按同一简历标识认`·早于 base `47dd6be5` 入主线）新增的 `interview_resume_binding_conflict` 守卫 `existingResumeId.toLowerCase()…`）→ `uniqueHit` 返 null → 红。
- **stash 对照亲证基线**（§8 规定动作）：`git stash push -u` → 净树 @`6da9821c8` 跑 `pnpm uc025:nhp-adv:prove` → **EXIT=1·45/1·`GAP_DETAIL [PIN] anchor toLowerCase compare` 与本刀树上逐字同** → `git stash pop` 复原（9 paths 复核恰等）。
- 时间线：AK nail EXIT=0 钉在 tip `4a804a8`（2026-10-06·`ebba26bef` 非其祖先）→ 10-20 该 compare 落主线后**无人重跑** → 潜伏红先于本刀存在。AK 钉表行 :404 EXIT0 仍锚其当时 tip，非本 tip。
- **本刀零责机证**：该 pin 输入面（`interview.service.ts`+ADV proof 自身）在本刀 diff 中**零字节**（numstat 表无此两文件）。

## ③ 件② 断言面改前/改后（语义重锚 R1 登记·强度只迁不降）

- 改前（base @`6da9821c8`）`:903-908`：`A('防御码七枚透传不折叠丢失：interviews 四码→begin_failed 原文；…', ['interview_resume_binding_unavailable', 'legacy_resume_reference_unavailable', 'resume_version_mismatch', 'interview_not_active'].every(…))`——`resume_version_mismatch` 对 begin_failed 原文断言。
- 改后：四码数组→三码（`resume_version_mismatch` 移出·余三码原文断言逐字保留）+该码并入新三码映射断言（text/href `/quiz`/hrefLabel `重新押题`/不含「请稍后重试」）·标题如实标注「语义重锚·强度只迁不降」。**机理**：该码自 `INTERVIEW_BEGIN_DEFENSIVE_CODES` 移除后旧断言必然红·重锚=断言随产品语义迁移。
- 新增断言全名单：web-logic ERRMSG 族 +4（三码映射/页域专属 null/hrefLabel 缺省恒等 + ROLE-INPUT 区 page.tsx `?? '额度说明'` 静态恒等）=423→427；interviews-actions ①b 臂 +3（abandon 恰一次/码不折叠 redirect error=stale_quiz/不重试）=17→20。

## ④ diff numstat（两 commit 合计·11 tracked）

```
apps/api/package.json                                  +1   -0
apps/api/test/uc-e2e-025-nhp-bound-isolated.proof.ts   +529 -0   （件①·REWORK 后版）
apps/web/app/interviews/page.tsx                       +1   -1   （件② hrefLabel ?? '额度说明'）
apps/web/lib/errors/action-error.ts                    +19  -1   （件② 三码映射行+hrefLabel 字段·防御集移出该码）
apps/web/test/interviews-actions.proof.ts              +14  -0   （件② ①b 臂）
apps/web/test/web-logic.proof.ts                       +25  -2   （件② 语义重锚+断言扩面）
package.json                                           +3   -0   （件① 两行+件③ 一行）
scripts/run-e2e-isolated.mjs                           +16  -1   （D1 偏离面·三条 additive 注册）
scripts/uc-e2e-025-covered-reassess.proof.mjs          +278 -0   （件③）
ai-docs/delivery/harness/uc025-e2e-REQUEST.md          （§9-EXEC append·本 commit）
receipts/uc025-e2e-residual/00-exec.md                 （件④·本 commit）
```

## ⑤ §0 重 pin 全表（EXEC 立项日对 tip `6da9821c8` 亲算·`git hash-object`+行验）

| 锚 | blob/行 | 结果 |
|---|---|---|
| e2e-requirement-coverage-matrix.md | `0cf6ae18`（519）·`:125`/:274 | **恰等** |
| e2e-scenarios.md | `9976f9c3`（648）·`:331-343` | **恰等** |
| interview.service.ts | `a8ae0d15`（918）·三守卫块抛序 | **恰等**（本刀零触） |
| uc-e2e-025-nhp-bound.proof.ts | `b8ff9235`（193）·`:18-22` 头注 | **恰等**（零触） |
| uc-e2e-025-nhp-fault-isolated.proof.ts | `964b6b0b`（505） | **恰等**（零触） |
| package.json（root） | `5bdf3111`（692）·`:190`/`:192-193`/`:196-197` | **恰等**（改前） |
| apps/api/package.json | `b3614fd8`（120）·`:78-83` | **恰等**（改前） |
| run-e2e-isolated.mjs | `f89fb27c`（3348）·`:2884-2899` 剥离清单不含 MODEL_API_KEY | **恰等**（改前）·D1 偏离即触此文件 |
| uc-covered-evaluator.mjs | `ec62c4c2`（340）·`:246` requiredNhp | **恰等**（零字节改） |
| uc-e2e-018-covered-lift-reassess.proof.mjs | `5f67d2ac`（527） | **恰等** |
| action-error.ts | `e5703cb0`（106）·`:58`/:61-65/:64/:19-23 | **恰等**（改前） |
| interviews/actions.ts | `ab7459fc`（111）·`:25-29` | **恰等**（零触·`beginErrorCode` 零改映射命中自动透传如实验证） |
| interviews/page.tsx | `5cac2bd7`（226）·`:68-70` 硬编码 | **恰等**（改前） |
| e2e-covered-path-backlog.md | `05a76401`（55）·`:13`/:17 | **恰等**（R4 锚） |
| web-logic.proof.ts | `:903-904` 防御码七枚断言实文 | **恰等**（改前） |
| 在飞交叠复核（§0.0） | 15 支逐树 `git log 47dd6be5..<b> -- 触面` | **行级零撞**：uc004/uc028/event-ttl 三支有 post-base commit 触 root+api package.json 与壳文件，但均 additive **异名注册行**（uc025 三新名 `uc025:nhp-bound-isolated:prove`/`uc025:covered-reassess:prove`/`prove:uc025-nhp-bound-isolated` 全支线 NO_COLLISION·两新 proof 文件+收据路径全历史 NO_HISTORY·web 三文件零支线 post-base 触碰）·5c 线已闭+campaign-state 零触面（协调方预裁决在案）·ag18/cap-2272 等 234 计数支线均为 10-18 前旧谱系非 post-base 新增 |

## ⑥ 偏离清单（如实·待协调方）

- **D1（越 10 tracked→恰 11）**：件① 注册面 `run-e2e-isolated.mjs` 闭合 allowlist（`:2229-2347` `unsupported_e2e_target` throw·机证：改前注册形跑 `node scripts/run-e2e-isolated.mjs uc025:nhp-bound-isolated:prove:raw` → `Error: unsupported_e2e_target` EXIT=1）→ §1-修法两 package.json 注册行**必不能独立达门① EXIT0**。处置=壳内三条 **additive** 注册（isolatedReceiptSources 清单/allowlist 数组/isolatedCommand 映射·镜像 fault-isolated 同形与同周 uc004 `9e17c3713`/uc028 `8f86d50a5`/ttl `8a79c0b46` 三先例=package.json 行+壳三条目同 commit）·既有 target 行为零改（diff +16 −1·−1=allowlist 行内插位）。触 §3-2「run-e2e-isolated 零改」字面 → **待追认**；AskUserQuestion 上询未获答，按同周三先例 best-judgment 行事并全披露。
- **D2（门② nhp-adv 基线遗留红）**：详见 ②·本刀零责机证在案·Ban 借机修（AK 冻结面+API 产品码双冻结）·**待协调方裁**（另刀修静态 pin「恰一命中→按符号锚随演」或裁豁免）。
- **D3（件① attempts 1,0·REWORK）**：attempt1 EXIT0（27/27）后门⑦ lint 红（api 1427>帽 1423·根因=本刀新文件 +4 naming-convention warning）→ 件① 文件零警告化 REWORK（`Record` 索引签名替代 snake_case 成员声明+headers 括号写·行为语义零改）→ attempt2 EXIT0（27/27）。REWORK 非迁就：帽内零增量是本刀交付面自身义务。
- **D4（STOP 未翻）**：派单 brief 预设成功路径「STOP 三处翻面 executed:awaiting_post_prove_dual」；因门② 红命中停止条件，按 §8+brief 停止路径处置=**STOP 不翻**（uc028 受阻上报先例）· Truth 全在 ⑦/②/D2。

## ⑦ pins 零翻声明（十值）

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · **coveredCount=8**（门④ 机证保留·Ban 9 断言在列） · ms3EqualsR4Closed=false · PG-retained · public DELETE=503 · **canHonestlyFlip=false**（门④ 由 evaluate() 算出·非预设） · actualSpendCny=null — **十值零翻**。SSOT 零触碰（矩阵/NHP 矩阵/backlog/execution-master-checklist/e2e-covered-path-backlog 全零字节）·评估器/六 proof/API 产品码/`_neg-harness` 零字节（numstat 机证）·coveredCount=8 不动·行/列翻面权归协调方。

## ⑧ 改前基线名单摘录

- `pnpm uc025:nhp-bound:prove` @`6da9821c8` 改前恰一次：EXIT=0（`PASS NHP-025-BOUND-01 … 409 resume_version_mismatch before bind/reserve/enqueue` · `HTTP_ERROR_PIN status=409 CONFLICT · error=resume_version_mismatch`）。
- web 601 / api 1423 / root 5242 基线值=三帽原值（stash 亲证各一次）·本刀改后恰等（零增量）。
- ADV stash 基线：EXIT=1·45/1（GAP_DETAIL 逐字摘录见 ②）。

---

*UC-025 E2E 残面收口 EXEC 收据 · 2026-10-26 · code `4513dc8d4` · est live=0 · markers=0 · pins 十值零翻 · 四件落码·门矩阵 10×EXIT=0+1×EXIT1(基线遗留·stash 亲证)·两偏离（D1 恰 11 待追认·D2 待另刀/裁）·STOP 未翻维持 draft 史录·⛔push ⛔merge 主线 ⛔force push · post-prove dual 待协调方两裁后派单*
