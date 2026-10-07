# REQUEST — **G7W golden 冷启归因 + api 面拒因甄别刀**（两甄别实验设计：golden ×3 受控复现 + CMD1 sidecar 仪器化甄别 · ≠ 修复 ≠ trio 翻绿 ≠ 残红定谳）· pre-exec · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_pre_exec_dual`（stub only · Ban self-approve · alone ≠ dual · 不代签 peer）
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7w-golden-api-discriminator.md` · slice `g7w-golden-api-discriminator.slice.md`
**上游**: G7U EXEC 真测 trio EXIT 1/1/1（CMD1 40.6s api / CMD2 11P/3F/10S / CMD3 37.9s api · 收据 `c9e262a5` 残红后移登记）→ G7U POST dual BOTH PASS（mw-e2e-ha `79936f44` + mw-model-op `7e76e6c1` · golden 2R/1G 非确性双档在卷）→ coordinator G7U nail `bbc361fa`（残红三点另刀预留 · GAP-G7K-API-REDS `:107` stays P1 OPEN）→ F-F 甄别刀先例（sidecar 直读隔离 PG 机制 + 读 DB 不破 stderr withhold · `harness/g7r-ff-last-error-discriminator.md`）· FLK 预注册先例（每实验假设+判读+反例）
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

## 请审什么（mw-e2e-ha · e2e 纪律 / 甄别 run 合法性 / 诚实性 / withhold 边界）

Line G7W · **golden 冷启归因 + api 面拒因甄别刀**（G7U nail 残红②③ 指名后继 · 甄别=只读诊断 · Ban 修复）。请审：

1. **预注册纪律（本审首责 · FLK 先例合规）**：两实验是否每跑有假设+判读标准+反例分支；**Ban retry-to-green 式重跑**是否硬闭合——实验一升压臂 B 触发条件=「主臂 A 零红」（预注册分支非事后补偿）· 实验二无备选跑（CMD3 内层=CMD1 同体 e2e:isolated 无新信息面 · sidecar 窗口错失=回协调方 Ban 私自重跑）；红 EXIT 不冲销 G7U 真测 1/1/1 retained 台账 · Ban flake 记法（非确定性可定性不冲销原值）· Ban 只留绿 attempt。
2. **实验一夹具/观测合法性（本审首责）**：golden ×3 受控复现零 spec 改动零产品码改动零 wrapper 改动（过滤机制=EXEC 面裁定：runner 契约内透传或整 suite 口径，预算如实）；判读仪表=trace（`retain-on-failure` 既有配置 blob `321b80e0` 零改动）+ 分段时间轴 + 栈起日志（name-only 摘要入收据 · 原文留 `.tmp/` 不入 git）；**慢速因子仅限无破坏观测类**——Ban 清 `.next/BUILD_ID` 强制重建/Ban 降宿主资源/Ban 杀进程复现（越只读诊断边界须另刀）；判读表分段归因（navigation/组件/断言三段）与「判读表外值域→如实回协调方 Ban 就地 reinterpret」分支是否闭合；「三跑全绿=假说削弱非证伪 · Ban 定谳永不复现」措辞纪律。
3. **实验二 withhold 边界（本审首责）**：**读 DB 不读 stderr**——sidecar 与子进程 stdio 零接触；`run-e2e-isolated.mjs` 零 diff（blob `13dbfc43` 前后全等机检强制 · stderr 丢弃 `:2088` / WITHHELD `:2143` / 端口行 `:2310` 行号 EXEC 按 tip 重核）；Ban 改 wrapper 输出机制/Ban 回显 stderr/Ban 落盘子进程输出；**断言原文/case 名回读=withhold 契约变更，Ban 本刀，裁定权归协调方**；SELECT-only 八查询白名单沿 G7T 四面族 + F-F last_error 族并集（Ban `interview_job.payload` / Ban `ai_invocation_trace.output` / 零写语句）；**逐查询执行状态 ok/error 纪律**（沿 F-F C-HA-FF-3：查询报错 ≠ 空读 · 仪器错误不得触发改判/补跑）；「预期 EXIT=1 ≠ 甄别失败——甄别成功判据=快照捕获读取清单」双向契约。
4. **判读表忠实性（与 mw-model-op 共审）**：J-A1~J-A6 值域映射的码面依据（`full.e2e.ts:384` class=api=兜底分类非端点定位 · blob `7d65d0f3`；`interview-jobs.ts:214-215` last_error 写入方 blob `33fbecba`；F-F 已定谳值域 Ban 本刀重裁）；交叉互证规则（单一读数不定谳 · 「与 X 一致」≠「X 已证」沿 G7R C-MO-2）；embedding/rerank 签名显式证伪分支（沿 F-F C-MO-P1）；G7S 供给面修复后「同形不同内容」定谳逻辑（J-A3 分支）是否对称覆盖「未变」（J-A1/J-A2）与「早段」（J-A4）情形。
5. **边界完整性**：残红①（旅程自适应早停 ×2）与旧红③ `full.e2e.ts:203`（C-MO-P3 断言语义 · blob `7d65d0f3` 零 diff）零触碰；`model-operation-registry.ts:63-71`（blob `63af556f`）已清面零触碰；occupied 断言面零触碰；sibling 归档（G7K/G7R/F-F/G7S/G7T/G7U 收据 lifecycle）零改写；SSOT/backlog 状态翻转 Ban（GAP-G7K-API-REDS `:107` 不翻 · nail 阶段才落字）。
6. **预算与 Key 卫生**：est ≤40 ≪ 200（实验一 ≤15 + 升压臂预注册 +≤15 · 实验二 ≤10 · est-not-counter）；超限即停如实记中止（不洗 not_run）；`actualSpendCny=null`；DB 直读用容器固定测试凭据（非模型 Key）；模型 Key 只经进程环境（loader source · name-only）· Ban `.env*` · Ban Key 值/fingerprint 入 receipt/log/commit · `.env*` ABSENT presence 逐 attempt 记录。
7. **七字段与四来源交叉一致**：CMD 原文/EXIT 原值/时间戳/实跑 code SHA/worktree+branch/环境探针/判读归类逐 attempt 全记录；`EXIT`/`E2E_FAILURE_CLASS`/machine receipt/快照 log 四来源交叉一致才可引用；全部 attempt 全记录 Ban 删除覆盖。
8. **边界（本 REQUEST turn）**：docs-only 一次 commit；Ban coding · Ban prove 执行 · Ban 实跑 · Ban live · Ban push/force-push · Ban 甄别结论预claim · Ban self-approve。

Trio stays **OPEN**（G7U 真测 1/1/1 如实）。`g7SuiteGreen=false`. `actualSpendCny=null`. 残红②③ OPEN（本刀指名面 · 甄别非修复）。残红① 非本刀。**甄别=只读诊断 · Ban 修复另刀 · Ban retry-to-green · Ban masking · Ban 假绿叙事**。

本 stub 不授权 coding / prove 执行 / 甄别 run 实跑 / live / push；pre-exec dual PASS 后由协调方 EXEC 授权（含实验一过滤机制与实验二 sidecar 参数定值）；implementer 不自批；本 PASS（如落）仅为 e2e-ha 半签，mw-model-op stub 不代签。

---

*REQUEST stub · G7W golden+api 甄别刀 · Line G7W · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-exec dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查段 — **mw-e2e-ha**（append-only · 2026-10-07 · 独立 worktree `rv/g7w-e2e-ha` @主线 REQUEST `93b3c215`）

**被审对象**：主线最新段 `93b3c2153176629de1fa5f0f62af710bf3a734dd`「docs(e2e): REQUEST golden cold-start + api face discriminator (pre_dual)」· 审查基面=本 stub（REQUEST 面）+ harness `harness/g7w-golden-api-discriminator.md`（151 行）+ slice `g7w-golden-api-discriminator.slice.md`（23 行）。**本段零产品码改动零 spec 改动零 SSOT 触碰**；只读核验 + 本 stub 末尾 append-only 追加 + worktree 内提交。

## 1. 检查表（逐项本席亲测 · 证据=命令+EXIT+hash，非转述）

| # | 检查项 | 结果 | 亲测证据 |
|---|---|---|---|
| 1 | worktree/祖先 | ✅ | `git worktree add …/meetwise-rv-g7w-e2e-ha -b rv/g7w-e2e-ha 93b3c215` EXIT=0；`merge-base --is-ancestor`：nail `bbc361fa` / post-dual `79936f44`(ha) / `7e76e6c1`(mo) 均 HEAD 祖先（三枚 EXIT=0 亲测） |
| 2 | REQUEST docs-only | ✅ | `git show --numstat 93b3c215` = 恰 4 文件全 `ai-docs/` +276/−0（删除行=0）；非 docs 命中=0；twin 同树孪生：`93b3c215` 与 `line/g7w-discriminator` `9b95f04c` patch-id **`4e82feaeef80b2dfea39e47b6d7b7f4fe08b4f54` 全等** |
| 3 | 码面 blob 锚 | ✅ | `git hash-object` 亲算 9/9 全等：`8db8746b`(golden.spec.ts) `321b80e0`(playwright.config) `7d65d0f3`(full.e2e.ts) `102d0f3a`(failure-class.mjs) `13dbfc43`(run-e2e-isolated.mjs) `33fbecba`(interview-jobs.ts) `7580fa02`(perf suite) `0afb3bd2`(package.json) `63af556f`(model-operation-registry) |
| 4 | 行号锚逐条 | ✅ | golden.spec `:10` test/:48 consent 20s/:50 textarea 20s；config `:12` expect 10s/`:17` workers:1/`:18` retries:0/`:24` trace retain-on-failure；full.e2e `:14` import/`:202-204` 旧红③/`:384` `main().catch→emitClassifiedE2EFailure({class:'api',code:'client_uncaught'})`；failure-class `:233/:242`；isolated `:2088` stderr 丢弃/`:2143` WITHHELD/`:2310` 端口行（逐字）；interview-jobs `:214-215` `error.slice(0,500)`/`:251` `reaped:worker_died`；package.json `:278/:279/:282`；registry `:63-71` wired:true 块；ui-runner `:141-163` 每 run spawn api+worker+web + 仅 BUILD_ID 缺席才 build（`:160-163` 亲读） |
| 5 | 白名单 schema 面 | ⚠️→C-HA-1 | 8 查询全 SELECT-only、零 payload/零 output/零写语句亲读；7/8 表名 migrations 实存（`route_consumption_event` 0104:179 · `interview_route_snapshot` 0104:161 · `job_route_decision` 0104:65 · `job_semantic_revision` 0104:44 · `ai_model_invocation` 0037:7 · `interview_job`/`interview`/`ai_invocation_trace` baseline）；列锚全实（`last_error` baseline:232 · `route_outcome`/`attempt_outcome` CHECK 域含 `validation_rejected` 0104:70-71 · `error_code` 0037:14 · `route_unresolved` 0104:50）；**查询(8) `FROM application` 在本 tip migrations 无此表**——实有 `job_application`/`application_route_binding`（全 migration CREATE TABLE 枚举亲测）——harness §1.2 自带「表名 EXEC 按 migrations 重核·差者按 ok/error 纪律如实记」条款预先覆盖，落条件 C-HA-1 |
| 6 | FLK 预注册先例 | ✅ | `harness/gap-flake-rootcause-investigation.md` §3 每实验假设+方法+判读+反例（H-COLD-1/2/3·H-WARM-1/2）+ §8「Ban 盲目重跑」；nail @checklist `:1273` `post_prove_dual_pass` 亲读——G7W harness 结构同构（H-G1/G2/G3 + 分段判读表含证伪列 + J-A1~A6） |
| 7 | F-F sidecar 先例 | ✅ | `harness/g7r-ff-last-error-discriminator.md` 亲读：sidecar 直读隔离 PG 机制 / C-HA-FF-3 逐查询 ok/error（报错≠空读）/ C-MO-P1 embedding/rerank 显式证伪 / C-MO-2「与 X 一致」≠「X 已证」/ Ban payload——G7W 全部承卷且 harness §1.2 逐条点名出处 |
| 8 | G7U 残红在卷 | ✅ | Receipt 02 golden `golden.spec.ts:10` textarea 20s env/冷启候选；00-summary trio 1/1/1 · 11P/3F/10S；nail append 亲读：2R/1G 双样本（EXEC 红 + mo re-run 11P/3F 红 + ha re-run 12P/2F 绿 3.1s 反证）· CMD1 40.6s/CMD3 37.9s/G7S 38.4s 同形族 · 残红①②③ 定位与 harness 输入事实逐条全等 |
| 9 | 实验二无备选跑依据 | ✅ | `run-e2e-performance-suite.mjs:20` `['HTTP full E2E', ['e2e:isolated']]` 亲读——CMD3 内层=CMD1 同体，备选无新信息面主张成立 |
| 10 | 过滤机制在契约内 | ✅ | `run-e2e-ui.mjs:193` `E2E_UI_GREP`→`--grep` 透传亲读存在；golden.spec.ts 在 `apps/web/e2e-ui/` 字母序首位（ls 亲测）——「suite 首测位次」主张成立 |
| 11 | Pins/Retained 原值 | ✅ | stub Pins 表 10 项 + retained 5 项与 harness §Pins/§Retained、slice、nail append 记录逐值全等：NOT_HA/false/false/true/8/false/PG-retained/503/`g7SuiteGreen=false`/`actualSpendCny=null` · trio OPEN 1/1/1 · 残红②③ OPEN（指名）· 残红① OPEN（非本刀）· GAP-G7K-API-REDS P1 OPEN（backlog `:107` 亲读仍在） |
| 12 | 本 turn 边界 | ✅ | docs-only 单 commit；零实跑零 live 零 DB 连接声明与本席独立观测无矛盾（本席亦零实跑）；push 未做（origin 视图如实记录：本地 remote-tracking ref `origin/feat/mysql-schema-skeleton`=`93b3c215` · 本 turn 零 fetch · push 链路间歇堵如实留协调方面知） |

## 2. 甄别有效性裁决（本审核心）

**裁决：两甄别实验设计均甄别有效（附条件 C-HA-1~C-HA-6 · 无 Blocker）。**

- **实验一（golden 冷启归因）有效**：H-G1（chromium/worker 冷启——物理来源 `run-e2e-ui.mjs:141-163` 每 run 重新 spawn 真栈亲证）/ H-G2（简历页首渲染供给）/ H-G3（宿主资源位次）三假说互斥覆盖 runner·产品·环境三归因面；判读表以 navigation/consent/textarea 三段读数归类、每行带证伪分支；2R/1G 先验下「主臂 A ×3 → ≥1 红=复现成立进分段归因 · 3 全绿=假说削弱非证伪→升压臂 B」是受控复现的合法最小设计；**升压臂 B 单向性=预注册纪律的承重结构**——B 仅在 A 零红时触发（加样只发生在绿方向，红方向无任何加样分支），retry-to-green 通道结构性关闭；慢速因子封闭在无破坏观测类（清 BUILD_ID/降资源/杀进程显式 Ban——runner 仅 BUILD_ID 缺席才 build 亲读，清 BUILD_ID=强制重建=破坏性注入，Ban 有物理依据）；「B 全绿→环境特异挂起回协调方 Ban 定谳永不复现」措辞纪律闭合。
- **实验二（CMD1 api 面 sidecar 甄别）有效**：甄别通道=读 DB 不读 stderr（F-F §3.4-C 合法性先例承卷）；八查询 SELECT-only 白名单沿 G7T 四面族+F-F last_error 族并集，零 payload/零 output/零写语句亲测；J-A1~A6 覆盖 worker 面/classify 面/下游尾段/早段/provider 面/时长死亡窗，**「同形不同内容」定谳条件化对称**（J-A3=修复已生效红后移→定谳为真 · J-A1/J-A2=该面未变 · J-A4=早于修复面——stub 请审点 4 的对称覆盖要求满足）；显式证伪分支（embedding/rerank 签名沿 C-MO-P1）+ 逐查询 ok/error 纪律（C-HA-FF-3：报错≠空读·不据仪器错误改判）+ 交叉互证（单一读数不定谳）+ 窗口错失反例分支（Ban 私自第二跑）四重防过claim 结构齐备。
- **预注册纪律硬闭合**：每跑有假设+判读+反例（两实验均落表）；红 EXIT 不冲销 G7U 真测 1/1/1 retained 台账（§4 双向 EXIT 契约）；Ban flake 记法（可定性不冲销原值）；甄别=只读诊断 Ban 修复另刀（§2.1 修复路由表按面分流）；withhold 零触碰（blob `13dbfc43` 全等机检承重 · case 名/断言原文回读显式 Ban、裁定权归协调方）。

## 3. Fail-trigger audit（足以判 FAIL 的六通道 · 逐一核验均不存在）

- **FT-1 retry-to-green 通道**：不存在——升压臂单向（仅零红加样）；实验二无备选（CMD3=CMD1 同体 `perf-suite:20` 实证）；追加 run 仅预注册分支；红 EXIT 原值记账（§2.5/§3.7）。
- **FT-2 withhold 破面通道**：不存在——探针与子进程 stdio 零接触；`run-e2e-isolated.mjs` 零 diff（`13dbfc43` 前后全等机检强制）；Ban 回显/落盘子进程输出；case 名回读 Ban+裁定权归协调方（§2.2）。
- **FT-3 pins/retained 翻转**：不存在——REQUEST diff 恰 4 个 ai-docs 新文件（backlog/SSOT/covered 矩阵零触碰亲测）；`:107` P1 OPEN 亲读仍在；`g7SuiteGreen=false`/`actualSpendCny=null` retained。
- **FT-4 破坏性注入**：不存在——慢速因子封闭于观测类；清 BUILD_ID/降资源/杀进程显式 Ban（§1.1/§2.6），且有码面物理依据（BUILD_ID 缺席才 build）。
- **FT-5 本 turn 越权**：不存在——docs-only +276/−0 亲测；Non-claims 全谱（not run/not fixed/not 甄别定谳/not trio green/not nail）；零 post-commit EXIT 预claim。
- **FT-6 预注册缺角**：不存在——两实验每跑假设+判读+反例齐备；判读表外值域→协调方闭环；trace/日志缺失行 Ban 据缺失读数定谳、Ban 私下补跑。

## 4. Blockers

**无。**（六条 Fail-trigger 通道全部核验不存在；唯一内容缺陷=白名单查询(8) 表名 `application`，已被 harness 自带 EXEC 重核条款预先覆盖且 ok/error 纪律兜底，落条件 C-HA-1 不构成 Blocker。）

## 5. Conditions（EXEC 期必须落字/执行 · 违任一条本席保留 POST 段翻案权）

- **C-HA-1（实验二 · 表名实测）**：查询 (8) `FROM application` 在本 tip migrations **无此表**（实有 `job_application`/`application_route_binding`——本席全 migration CREATE TABLE 枚举亲测）。EXEC 收据必须：(a) 记录 migrations 实测 CREATE TABLE 名；(b) 修正后 SQL 原文逐字入收据（白名单偏离可审计）；(c) 逐查询 ok/error 如实记录；(d) **J-A4 的 application 锚仅在修正名查询 ok 后才可参与判读**；修正后仍报错=仪器缺口回协调方，Ban 空读改判、Ban 就地 reinterpret。
- **C-HA-2（实验一 · 判读表覆盖边界）**：分段判读表锚=在案失败面（consent `:48`/textarea `:50`）；若 ×3 任一跑红在记录面之外步骤（如旅程更早步），读数=判读表外值域→如实登记回协调方，Ban 就地 reinterpret、Ban 追加跑（§3.7 闭环在收据显式引用）。
- **C-HA-3（实验一 · 过滤机制定值）**：契约内透传已实证存在（`E2E_UI_GREP`→`--grep` `run-e2e-ui.mjs:193` 亲读）；EXEC 裁定须记录所选机制与预算影响（est-not-counter）；整 suite 口径 fallback 同形记账。
- **C-HA-4（落点纪律）**：快照 log 与栈起日志原文留 `.tmp/` 不入 git；收据仅 name-only 摘要+DB 查询仪器错误摘要（不得含子进程 stderr 内容）；Ban Key 值/fingerprint。
- **C-HA-5（升压臂预算钉）**：B 臂样本仅至预注册总样本 ≥6、预算 +≤15 内；EXEC 定值一次成型；Ban 事后追加。
- **C-HA-6（机检钉重跑）**：EXEC committed SHA 处 blob `13dbfc43`（withhold wrapper）/`7d65d0f3`（旧红③ 断言面）/`63af556f`（`:68-:71` 已清面）前后全等机检须重跑并入收据；漂移即停报协调方。

## 6. 边界重申（本段效力）

本 PASS 仅为 **pre-exec dual 的 mw-e2e-ha 半签**：不授权 coding/prove 执行/甄别 run 实跑/live/push；EXEC 须待 mw-model-op 半签（本席不代签、不可见、不引用其内容）+ 协调方显式授权（含实验一过滤机制与实验二 sidecar 参数定值 · committed SHA 重钉）；甄别结论无论是否定位如实入收据；定位≠修复≠trio 翻绿≠`g7SuiteGreen=true`；Pins/Retained 原值零翻转；alone ≠ dual。

## 7. 三行中文摘要

1. G7W 双甄别 REQUEST（docs-only `93b3c215` · 主线链含 G7U nail+post-dual 祖先亲测 · twin patch-id `4e82feae` 全等）pre-exec 审：+276/−0 恰 4 ai-docs、9/9 blob 码面锚全等、行号逐条亲读全对、FLK/F-F 先例与 G7U 残红 2R/1G 在卷全等。
2. 甄别有效性成立：实验一三假说+三段判读表+升压臂仅零红预注册触发（retry-to-green 结构性关闭 · Ban 破坏性注入有码面物理依据）；实验二八查询 SELECT-only 白名单+J-A1~A6 对称定谳「同形不同内容」+ok/error 纪律沿 C-HA-FF-3。
3. 附条件 PASS：C-HA-1 查询(8) `application` 表本 tip 无此表（实为 `job_application`）——EXEC 须实测重核+修正 SQL 入收据后 J-A4 方可参与判读；另有 C-HA-2~6 观测/预算/机检条件；Blockers 无；mw-model-op 半签不代 · alone ≠ dual。

Verdict: PASS
