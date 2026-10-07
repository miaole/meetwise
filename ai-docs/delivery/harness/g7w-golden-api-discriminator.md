# Harness — G7W · **golden 冷启归因 + api 面拒因甄别刀**（Line G7W · docs REQUEST · `draft:awaiting_pre_exec_dual` · G7U nail 残红②③ 指名后继 · 两甄别实验设计 · ≠ 修复 ≠ trio 翻绿 ≠ 残红定谳）

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · Ban coding · Ban prove 执行 · Ban 实跑 · Ban live（本 turn 零调用零 Key 加载零 DB 连接）· Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban 洗绿/Ban retry-to-green · **Ban retry-to-green 式重跑（每跑有假设+判读 · 沿 FLK 预注册先例）** · 甄别=只读诊断 **Ban 修复（修复按甄别结论另刀）** · Ban 改 withhold 机制（**读 DB 不读 stderr**）· Ban 碰 `:68`/`:70`/`:71` 已清面 · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **G7W**（G7U nail `bbc361fa` 残红后移登记的指名后继：「**STILL OPEN**：残红三点另刀（旅程自适应早停面 ×2 / golden 冷启 ×1 / api 面——新 REQUEST+双审+协调方授权）」——本 REQUEST 取其中 **残红②（golden 简历页 textarea 冷启 ×1）** + **残红③（api 面 G7S 同形 retained）** 两甄别实验；残红①（旅程自适应早停面 ×2）**不在本刀** · 旧红③ `full.e2e.ts:203` 断言语义（C-MO-P3）**不在本刀**——两者处置权归协调方）
**授权链**: G7U EXEC（真测 trio EXIT 1/1/1 · 残红后移登记在卷）→ G7U POST-PROVE dual BOTH PASS（mw-e2e-ha `79936f44` + mw-model-op `7e76e6c1` · 双 fresh re-run 恰一次各 1 prove · 12P/2F/10S 与 11P/3F/10S 双档如实）→ coordinator G7U nail `bbc361fa`（残红三点另刀预留 + backlog `:107` GAP-G7K-API-REDS stays P1 OPEN）→ **本 REQUEST（docs-only）→ pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ 协调方授权 EXEC（含两实验面裁定：实验一过滤机制 / 实验二 sidecar 参数定值）**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权 ≠ 甄别结论预claim。
**输入事实（只读在案引用）**：
- **残红②（golden 冷启 ×1 · 非确定性 2R/1G 在卷）**：G7U EXEC CMD2（`dbed8a6f` 实跑 · Receipt 02）golden(chromium) ×1 ✘——resume 页 `textarea[name="text"]` `toBeVisible` 20s 超时（收据锚 `golden.spec.ts:10` · 内层断言 `:50` blob `8db8746b`）· 收据五分类=「env/冷启候选」（suite 首测 · 与本刀零触碰文件 · run 于 recruiting-bound 之前）；G7U post-dual 双 fresh re-run：mw-model-op 侧 11P/3F/10S **golden 红复现**（三点同位 · golden chromium:10 冷启候选）· mw-e2e-ha 侧 12P/2F/10S **golden PASS 3.1s**（冷启非确定性反证样本）——**同码 3 样本 2 红 1 绿，非确定性在卷**。冷启归因候选（G7U POST 在卷）：Playwright worker 冷启慢 / 简历页组件首渲染慢 / chromium 冷启。
- **残红③（api 面 G7S 同形 retained · 内容未验）**：G7U CMD1 attempt-2 EXIT=1 **class=api · 40560ms** + G7U CMD3 内层 HTTP full E2E EXIT=1 **class=api · 37904ms** + G7S CMD1 **class=api · 38428ms** 三者同形同量级（machine receipt 三源在卷）；断言原文经 withhold 契约不可回读（`ISOLATED_POSTGRES_OUTPUT_WITHHELD`）。**码面定性（本席亲读 @`bbc361fa`）**：`failureClass=api` 来自 `e2e/full.e2e.ts:384`（blob `7d65d0f3`）`main().catch` 兜底 `emitClassifiedE2EFailure(e, { class: 'api', code: 'client_uncaught' })`——**class=api 是主驱动未捕获异常的兜底分类，非具体端点断言定位**（`e2e/helpers/failure-class.mjs` blob `102d0f3a`）；duration 簇 37.9–40.6s 高度紧凑 → 疑似确定性死亡点位而非随机超时。**G7S 供给面修复**（DDL `0142` candidate_profile_route + begin 事务同步供给 + 死源删除 · post-dual `d00be55c`/`3e471d62`）后形状未变但内容未验——G7U CMD3 37.9s vs G7S 38.4s 同形不同内容的定谳=本刀一并回答。
- **F-F 仪器化先例（甄别机制可行性在卷）**：F-F 甄别刀（`harness/g7r-ff-last-error-discriminator.md` · EXEC 收据 `receipts/g7r-ff-last-error-discriminator/`）验证「sidecar 直读隔离 PG」合法可行——读 DB 不破 stderr withhold（G7R post-dual mw-model-op §3.4-C 原文「读 DB 不读子进程 stderr」）；SELECT-only 白名单族经 G7T EXEC sidecar + G7U EXEC spec 内轮询 + F-F 甄别 run 三代在卷复用；G7U POST mw-model-op 路线甲核验亲读确认白名单族合法（零 payload/零 `ai_invocation_trace.output`/零写语句/输出仅非敏感列）。
**Base**: `origin/feat/mysql-schema-skeleton` **`bbc361fa`**（full `bbc361faa18fa80c45829d65899200c270832ae1` · fetch 后实测 tip = 预期 ≥`bbc361fa` 恰等 · 无 turn 内 origin 前进 · tip 即 coordinator G7U nail）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-g7w` · branch `line/g7w-discriminator`
**Pins（原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503**
**Retained（本刀零翻转）**: **`g7SuiteGreen=false`** · trio **OPEN**（G7U 真测 **1/1/1** · CMD1 40.6s api / CMD2 11P/3F/10S / CMD3 37.9s api · 全 attempt 如实 retained）· 残红② golden 冷启 **OPEN**（2R/1G 非确定性 · 本刀指名面）· 残红③ api 面 **OPEN**（G7S 同形 retained · 本刀指名面）· 残红① 旅程自适应早停面 ×2 **OPEN**（非本刀 · 处置权归协调方）· 旧红③ `full.e2e.ts:203` 断言语义 **另刀 C-MO-P3**（本刀零触碰 · blob `7d65d0f3` 零 diff）· `r1Closed=false` · Disclosure-1 **OPEN** · GAP-G7K-API-REDS **P1 OPEN**（`0c6c3287` 登记 · backlog `:107` 状态行不翻）· `techRoleFailClosedOptOutG7Only=true` · **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明（Ban coding / Ban prove 的证据来源披露）

本 REQUEST 的设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码改动、零 spec 改动、零 wrapper 改动**，证据全部来自只读：**(a)** 本 worktree git 只读源码亲读（行号一律 @`bbc361fa`；关键码面 blob `git hash-object` 亲算在卷 §1.3）；**(b)** G7U EXEC 收据 4 文件（`ai-docs/delivery/receipts/gap-red1-timing-face/` · commit `c9e262a5`）+ G7U POST 双审（`79936f44`/`7e76e6c1`）+ G7U nail（`bbc361fa`）引用；**(c)** F-F 甄别刀 harness + 收据（同树在案）机制引用；**(d)** G7S/G7T/G7R/G7K committed 收据链引用。不发明任何未在案明细；码面行号 EXEC 期按当 tip 重核回填。**甄别结论无论是否定位，如实入收据（Ban 定谳压力·Ban 就地 reinterpret）。**

## 1. 范围 = 两甄别实验设计（沿 FLK 预注册先例：每实验假设 + 判读标准 + 反例）

> **预注册先例**：FLK GAP-PRIV-AUTHZ-PROVE-FLAKE rootcause 刀（`gap-flake-rootcause-investigation.slice.md` · nail @checklist `:1273` `post_prove_dual_pass`）——每实验预注册假设/判读/反例、结论无论定位与否如实入根因报告。本刀两实验同构：**每跑有假设+判读+反例分支，Ban retry-to-green 式重跑**——红 EXIT 不触发「再跑直到绿」；任何追加 run 只能由**预注册分支条件**触发（触发条件在 EXEC 前写死，Ban 事后择优）。

### 1.1 实验一（残红②）：golden 冷启归因实验

**对象**：`apps/web/e2e-ui/golden.spec.ts`（blob `8db8746b`）test `:10`（chromium project）——失败面=注册后 `/resume` 页 `textarea[name="text"]` `toBeVisible` 20s 超时（`:50`；前置 consent 按钮 `:48` 同 20s 超时窗）。已知样本：EXEC 红 / post-dual 双 re-run 一红一绿（2R/1G）。

**归因候选（预注册）**：
- **H-G1（chromium/worker 冷启）**：UI runner（`scripts/run-e2e-ui.mjs`）每 run 重新 spawn 真栈（api+worker+web production `next start` · `:141-163` 亲读），golden 系 suite 首测（文件序首位）——chromium 首启 + 栈刚过就绪探测未热的窗口成本 → 首测位次偶发超 20s。
- **H-G2（简历页组件首渲染/供给慢）**：`/resume` 页首请求冷路径（production `next start` 首命中该路由的模块加载/数据供给/consent 门状态供给）本身偶发 >20s——与 runner 冷启无关，属产品首渲染面。
- **H-G3（宿主资源/位次竞争）**：run 期宿主负载（recruiting-bound 等并行进程/容器 boot 抖动）挤压首测窗口——环境特异非产品非 runner。

**实验臂（EXEC 期 · 预注册）**：
- **主臂 A「golden 单跑 ×3」**（受控复现）：同一 committed SHA 独立 worktree，golden 过滤单跑 ×3（过滤机制=EXEC 面裁定：runner 契约内过滤透传若可用则用之；否则整 suite 口径复跑读 golden 位次读数、预算如实入账）。每跑预注册判读：≥1 红 → 复现成立 → 进入判读表分段归因；3 全绿 → 冷启假说置信度下降（**非证伪**——样本量限制如实）→ 触发升压臂 B。
- **升压臂 B（仅当 A 零红时启用 · 预注册分支非事后补偿）**：同命令追加样本（`--repeat-each` 透传或追加 ×3 轮 · EXEC 定值一次成型）至总样本 ≥6；B 仍全绿 → 归因残留=「G7U 两轮环境特异（栈启动抖动/宿主负载）」如实挂起回协调方，**Ban 定谳「永不复现」**。
- **慢速因子纪律**：本刀慢速因子仅限**无破坏观测类**（trace 分段计时 + 栈起日志分段 + 冷/热位次对照读数）。**Ban 破坏性注入**（清 `.next/BUILD_ID` 强制重建 / 降宿主资源 / 杀进程复现）——均越只读诊断边界，如需属另刀。冷/热对照天然臂=同 run 内首测（冷）vs 后续 spec 位次（热）响应读数（在案 log/trace 只读）。

**判读仪表**：Playwright trace（`retain-on-failure` 既有配置 @`apps/web/playwright.config.ts:24` blob `321b80e0` · 零改动）+ 分段时间轴 `t_navigate(/resume) / t_consent(可见) / t_textarea(可见)` + runner 起栈就绪日志时间戳（name-only 摘录入收据，原文留 `.tmp/` 不入 git）。**把 20s 超时分解到 navigation/组件渲染/断言三段。**

**判读表（分段读数 → 归因 · 可证伪）**：

| 分段读数形状 | 归类 | 证伪/反例分支 |
|---|---|---|
| `goto('/resume')` navigation 完成后 **DOM 长期无 consent 按钮**（整页未渲染）且服务端已 200 | **H-G2 服务端首渲染/供给面**（产品刀候选） | 若同窗口热位次同路由秒级渲染 → 冷路径特异（仍 H-G2 子面·首请求冷路径）；若 navigation 本身 >15s → 转 H-G1 |
| consent 已现、**仅 textarea 未现**（consent 后表单供给慢） | **H-G2 子面（consent 后表单供给）**（产品刀候选） | 若 textarea 前置数据供给在服务端 log 显示慢查询/慢供给 → 产品面定谳；若 DOM 中 textarea 存在仅可见性断言未过 → 归「可见性/滚动/遮罩」如实另记（判读表外值域 → 如实回协调方 Ban 就地 reinterpret） |
| navigation 本身 >15s 且**冷跑独有、热对照无** | **H-G1/H-G3 冷启面**（runner/环境 · 夹具或基建刀候选） | 若热跑复现同慢 → H-G1/H-G3 证伪 → 转 H-G2 |
| 三跑全绿且全部分段 <5s | 假说削弱（非证伪）→ 升压臂 B | B 全绿 → 环境特异挂起回协调方（如实 · Ban 定谳永不复现） |
| trace 缺失（retain-on-failure 未落）/ 日志分段缺失 | **仪器缺口如实登记** | Ban 据缺失读数定谳任何归类；Ban 据此私下补跑（回协调方裁） |

### 1.2 实验二（残红③）：CMD1 sidecar 仪器化甄别实验

**对象**：`pnpm e2e:isolated`（wiring `package.json:278` blob `0afb3bd2`）×1——G7U CMD1 attempt-2 同体同形（EXIT=1 class=api 40.6s vs G7S 38.4s vs CMD3 内层 37.9s）。甄别目的=**定位 api 红的具体 case 与拒因 + 定谳 G7S 供给面修复后 api 面是否已部分变化**。

**码面定性承卷（本席亲读 @`bbc361fa`）**：class=api= `e2e/full.e2e.ts:384` `main().catch` 兜底（未捕获异常 · `failure-class.mjs` blob `102d0f3a` 分类器）——**withhold 契约内断言原文/case 名不可回读**（`run-e2e-isolated.mjs` blob `13dbfc43` 冻结 · stderr 丢弃 `:2088` · `ISOLATED_POSTGRES_OUTPUT_WITHHELD` `:2143`）；**甄别通道=只读 DB 侧状态（读 DB 不读 stderr）**——沿 F-F §1.2-A 机制原样。

**机制（沿 F-F 先例 · 零 wrapper diff）**：wrapper stdout tee 至 worktree `.tmp/g7w-cmd1.log`（不入 git）→ sidecar 只读探针监测端口行 `E2E isolated PostgreSQL: <container> on 127.0.0.1:<PGPORT>`（`run-e2e-isolated.mjs:2310` 实测）→ 宿主 TCP 连隔离 PG 轮询（周期 1000ms · EXEC 定值一次成型；凭据与 runner 自身探针同面 · 容器固定测试凭据非模型 Key）→ 快照追加 `.tmp/g7w-cmd1-sidecar.log`（时间戳 + **逐查询执行状态 ok/error（含报错摘要）** + 全部 SELECT 行）→ wrapper `finally` 拆除容器前**最后一份成功快照即证据**。G7U sidecar 缺口（8 连 miss/9 tick 超时）如实承卷——sidecar 自身健康性为窗口预期前提（非必然性断言），错失走反例分支。

**读取清单（SELECT-only 白名单 · G7T 四面族 + F-F last_error 族并集 · 任务点名三面全覆盖）**：

```sql
-- (1) 甄别主读（F-F 原样 · Ban interview_job.payload——payload 已剥 answer 仍按最小读面）
SELECT id, kind, status, attempts, last_error, created_at
  FROM interview_job ORDER BY created_at DESC LIMIT 20;
-- (2) route 决策账本（G7T 族 · 任务点名 job_route_decision）
SELECT route_outcome, attempt_outcome, count(*)
  FROM job_route_decision GROUP BY 1, 2;
-- (3) 语义修订状态分布（G7T 族）
SELECT status, count(*) FROM job_semantic_revision GROUP BY 1;
-- (4) 面试终态分布（F-F (4) 原样 · 旁证）
SELECT status, count(*) FROM interview GROUP BY 1;
-- (5) 模型调用账本（F-F (2) 原样 · error_code 列名沿 B-FF-2 修复 · Ban output）
SELECT service, status, error_code, count(*)
  FROM ai_model_invocation GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 30;
-- (6) 成功完成计数（F-F (3) 原样 · persistTrace 仅 !error 落 · Ban output 列）
SELECT count(*) FROM ai_invocation_trace;
-- (7) route 消费/snapshot 计数（G7T sidecar 时间线两面 · API 侧状态表）
SELECT count(*) FROM route_consumption_event;
SELECT count(*) FROM interview_route_snapshot;
-- (8) application 状态分布（API 侧状态表 · 早段定位锚）
SELECT status, count(*) FROM application GROUP BY 1;
```

**逐查询执行状态纪律（沿 F-F C-HA-FF-3）**：查询报错 ≠ 查询成功且零行——任一查询执行报错（列不存在/连接失败/超时）**不得**记作「无行可读」、不得据此改判；快照 log 逐条记录 ok/error + 报错摘要；仪器错误如实登记回协调方。表名/列名 EXEC 期按当 tip schema 重核（`application`/`route_consumption_event`/`interview_route_snapshot` 名以 migrations 实测为准，差者按 ok/error 纪律如实记）。

**判读表（读数形状 → api 红拒因归类 · 可证伪 · 定谳措辞沿 G7R C-MO-2「与 X 一致」≠「X 已证」）**：

| 读数形状 | 归类 | 与 G7S 修复定谳的关系 |
|---|---|---|
| **J-A1**：`interview_job` 有 failed 行且 `last_error` 命中 F-F 判读表值域（结构门 `interview_resume_reference_*` / invoke 内部态 `model_*_state` / 基建 checkpoint/SQL throw 原文 / `reaped:worker_died`） | **worker 面**——api 红主 drive 在面试链被供给面拒（沿 F-F 归类逐值映射 · Ban 本刀重裁 F-F 已定谳值域） | 供给面修复**未覆盖**该门 → G7S 修复后 api 面未变（该面） |
| **J-A2**：`job_route_decision.attempt_outcome=validation_rejected` / `job_semantic_revision.status=route_unresolved` sticky 行 | **classify 质量面残留在 iso 面同现**（G7S C-MO-Q2 同族） | classify 校准（G7T v2）未覆盖 iso 面样本 |
| **J-A3**：全 job done + `interview` 终态 completed + route consumption/snapshot 行在 + `ai_invocation_trace` 计数 >0 | **happy-path 下游尾段**——红在 full.e2e.ts 状态机/报告/RLS 尾段断言（DB 面只能定位「面」，断言原文 withhold 不可回读） | **供给面修复已生效、红后移下游**——G7U CMD3 37.9s vs G7S 38.4s「同形不同内容」定谳为真 |
| **J-A4**：无 interview 行 / 无 application 行 / application 状态早段缺席 | **早段**——鉴权/简历/交易 HTTP 面未捕获异常（首个缺席表=最小定位） | 早于 G7S 修复面（begin 尚未达） |
| **J-A5**：`ai_model_invocation.error_code=provider_rejected / deterministic_refusal` 分布异常 | **provider/准入面**（401/404 invoke 层扁平化不可分注记沿 F-F 随行） | Key/配对面回升须回协调方（值迭代须新 EXEC 沿 C-MO-7） |
| **J-A6**：时间轴维度——快照时间戳序列各行首现时刻 × machine receipt `durationMs` 交叉 | **死亡窗口定位**（最后成功写入与 run 结束间隔）——与 J-A1~J-A5 联合判读 | duration 簇 37.9–40.6s 是否对应固定死亡点位 |
| `last_error`/`error_code` 现 embedding/rerank 签名 | **显式证伪分支（沿 F-F C-MO-P1）**：如实记矛盾 + 回协调方，Ban 扫入基建 catch-all、Ban 就地 reinterpret | registry wired:false 前提被打破 |
| 四查询全空读 | 仅在**逐查询执行状态均 ok** 时可判「job 未入队/早段即死」（J-A4 子情形）；任一报错=仪器缺陷非空读 | — |

**交叉互证规则**：主读 (1) 与 (2)–(8) 必须联合判读，任何单一读数不得单独定谳；(7)(8) 为 API 侧旁证族。**判读表未覆盖读数 → 如实回协调方（Ban 就地 reinterpret）。**

**反例分支（预注册）**：sidecar 窗口错失（boot 前崩溃 / 连续 miss 提前停——G7U 仪器缺口同族）→ 仪器缺口如实登记，**本刀不启动备选第二跑**（CMD3 内层=CMD1 同体 e2e:isolated，备选无新信息面；窗口错失=回协调方裁，Ban 私自重跑冲销）。

### 1.3 码面锚（blob 亲算 @`bbc361fa`）

| 锚 | file:line | blob | 内容 |
|---|---|---|---|
| golden 失败面 | `apps/web/e2e-ui/golden.spec.ts:10`（内层断言 `:48`/`:50`/`:51`/`:53`） | `8db8746b` | resume 页 textarea `toBeVisible` 20s 超时窗（G7U 收据锚 :10 为 Playwright 失败报告口径） |
| UI runner 起栈 | `scripts/run-e2e-ui.mjs:141-163` | —（机制引用） | 每 run 重新 spawn api/worker/web（production `next start` · 无 BUILD_ID 先 build）——冷启窗口物理来源 |
| trace 配置 | `apps/web/playwright.config.ts:24`（`workers:1` `:17` · expect 10s `:12`） | `321b80e0` | `trace: 'retain-on-failure'` 既有配置零改动 |
| api 面兜底分类 | `e2e/full.e2e.ts:384`（`:14` import） | `7d65d0f3` | `main().catch → emitClassifiedE2EFailure(e,{class:'api',code:'client_uncaught'})`——class=api=未捕获异常兜底 **非端点定位** |
| 分类器 | `e2e/helpers/failure-class.mjs:233/:242` | `102d0f3a` | `emitE2EFailure` / `emitClassifiedE2EFailure` |
| withhold 冻结 | `scripts/run-e2e-isolated.mjs:2088`（stderr 丢弃）· `:2143`（WITHHELD 上屏）· `:2310`（PG 端口行） | `13dbfc43` | **与 G7R/G7U 冻结钉全等**——本刀零 diff 机检承重锚 |
| last_error 写入 | `packages/db/src/interview-jobs.ts:214-215`（reaper `:251`） | `33fbecba` | `markJobFailed` 持久化 `error.slice(0,500)`——实验二主读列的写入方 |
| perf suite | `scripts/run-e2e-performance-suite.mjs` | `7580fa02` | CMD3 内层=CMD1 同体（`e2e:isolated`）——备选面无新信息的依据 |
| wiring | `package.json:278/:279/:282` | `0afb3bd2` | `e2e:isolated` / `e2e:ui:isolated` / `verify:e2e-performance` |
| `:68-:71` 已清面 | `packages/ai-runtime/src/model-operation-registry.ts:63-71` | `63af556f` | start-job chat 操作注册面（competency-planning/question-generation `wired:true` 块）——G7R post-dual 已裁决清面，**零触碰** |
| 旧红③ 断言 | `e2e/full.e2e.ts:202-204` | `7d65d0f3` | C-MO-P3 断言语义刀（澄清重发 identity 计数）——**本刀零触碰** |

## 2. 边界（Ban 清单）

1. **甄别=只读诊断 · Ban 修复**：无论读数命中的面是什么，修复一律**另刀**（产品刀/夹具刀/基建刀各自独立 REQUEST + 双审 + EXEC 授权）；本刀 EXEC 期顺手修=违纪。
2. **withhold 契约零触碰**：`run-e2e-isolated.mjs` 全文件零 diff（blob `13dbfc43` 前后全等机检强制）；**读 DB 不读 stderr**——探针与子进程 stdio 零接触；Ban 改 wrapper 输出机制 / Ban 为取明细开假面 / Ban 回显 stderr / Ban 落盘子进程输出；**断言原文/case 名回读属 withhold 契约变更——Ban 本刀，裁定权归协调方**。
3. **Ban 碰 `:68`/`:70`/`:71` 已清面**：`model-operation-registry.ts` start-job chat 注册面（blob `63af556f`）零触碰、零「加固」、零重接线。
4. **Ban 碰非本刀残红**：残红①（旅程自适应早停面 ×2 · `early_weak` 控制流）不在本刀；旧红③ `full.e2e.ts:203`（C-MO-P3）断言面零触碰（blob `7d65d0f3` 零 diff 机检）；occupied 断言面（018/052/025/004/011/014/026/002/001/028/016/017）零触碰。
5. **Ban retry-to-green / Ban 洗绿**：每跑有预注册假设+判读+反例；红 EXIT 不冲销、不重跑冲销、Ban 只留绿 attempt、Ban flake 记法（非确定性可定性但**不冲销 G7U 真测 EXIT=1 原值记账**）；追加 run 仅限预注册分支触发（实验一升压臂 B=A 零红时；实验二无备选）。
6. **Ban masking / Ban 破坏性注入**：Ban 伪造产品不可能状态；慢速因子仅限无破坏观测类（§1.1）；Ban 清 BUILD_ID/降资源/杀进程复现。
7. **Ban SSOT/backlog 翻转**：GAP-G7K-API-REDS `:107` P1 OPEN 状态行不翻（`0c6c3287` 登记）；trio OPEN 保持；covered 矩阵零触碰（nail 阶段才改）；sibling 归档（G7K/G7R/F-F/G7S/G7T/G7U 收据 lifecycle）零改写。
8. **Ban Key 物料越界 / Ban push / Ban self-approve / alone ≠ dual**：DB 直读用容器固定测试凭据（非模型 Key）；模型 Key 若 EXEC 期在环境（loader source · name-only）探针即可，Ban 值/fingerprint 入 receipt/log/commit；Ban 写任何 `.env*`。

## 3. prove 方案（EXEC 期 · pre-exec dual BOTH PASS + 协调方授权后方可行）

1. **前置**：pre-exec dual BOTH PASS（mw-e2e-ha + mw-model-op）→ 协调方 EXEC 显式授权（两实验面裁定：实验一过滤机制口径 / 实验二 sidecar 周期与快照落点定值一次成型 · committed SHA 重钉含重新 fetch）→ 独立 worktree + `pnpm install --frozen-lockfile`（EXIT 记录）。
2. **实验一执行序**：主臂 A golden 单跑 ×3（同 SHA 同命令）→ 判读表逐跑落字 → 零红时升压臂 B（预注册分支）。**每跑预注册假设+判读+反例，Ban retry-to-green**。
3. **实验二执行序**：sidecar 随 run 启停（§1.2 机制）→ `pnpm e2e:isolated` ×1 → **预期 EXIT=1（retained api 红）≠ 甄别失败**——甄别成功判据=快照捕获 §1.2 读取清单读数（捕获成功 ≠ e2e pass ≠ trio 翻绿）。
4. **七字段逐 attempt 全记录**：CMD 原文 + EXIT 原值 + 起止时间戳 + 实跑 code SHA（receipt commit ≠ 实跑 SHA）+ worktree/branch + 环境探针（`.env*` ABSENT presence + `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` name-only + sidecar 端口行命中时刻/采样次数/逐查询执行状态）+ 判读表归类。`EXIT`/`E2E_FAILURE_CLASS`/machine receipt（`.tmp/e2e-receipts/*.json`）/快照 log 四来源交叉一致才可引用；**全部 attempt 全记录，Ban 删除/覆盖任何 attempt 记录**。
5. **预算与 live 面**：上限 ≤200 次 live 调用内报备。诚实结构估：实验一 ≤15（golden 单测 live 面 ~≤5/run × 3；升压臂触发再 +≤15 · est-not-counter）；实验二 = CMD1 全 E2E 旅程 ≤10（G7U CMD1 口径）。总 est ≤40 ≪ 200 · 超限即停如实记中止（不洗 not_run）· **`actualSpendCny=null`**（无计价数据源 · Ban invented spend）。
6. **收据落点**：`ai-docs/delivery/receipts/g7w-golden-api-discriminator/`——per-run 收据 + `SUMMARY.md`（两甄别定谳段/挂起段 + 判读表归类 + Pins/Retained 原值 + `g7SuiteGreen=false` 保持声明 + **甄别结论无论是否定位如实入收据**）。evidenceOfRecord/SSOT 登记**留 nail 阶段**。
7. **EXIT 后路由**：定位成立 → 修复走对应另刀（冷启面→夹具/基建刀 · 组件供给面→产品刀 · worker 面→F-F 族产品刀 · 下游尾段→断言面刀 · withhold 原文回读裁定权归协调方）；未定位/矛盾/仪器错失 → 如实回协调方，Ban 就地 reinterpret、Ban 私自补跑。

## 4. EXIT 契约（双向）

- **甄别定位成立** → 归因面定谳收据成立（措辞纪律：「与 X 一致」≠「X 已证」· 单一读数不定谳）；**定位 ≠ 修复 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**——`g7SuiteGreen` 翻转 = 三绿 + post-dual BOTH PASS + 协调方 nail 全链（缺一不可）。
- **未定位/矛盾/仪器错失** → 如实登记 → 回协调方；红 EXIT 原值记账（甄别 run 红 ≠ 失败 · 但也**不冲销** G7U 真测 1/1/1 retained 台账）。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim 两实验判读结果。

## 5. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 甄别结论定谳（两实验结果未产生 · 本 turn 只有设计）· not 残红②/③ closed · not 残红① touched（非本刀）· not 旧红③ C-MO-P3 touched · not trio green（真测 1/1/1 retained）· not suite green · not R1 closed · not Disclosure-1 closed · not G6 closed · not R5 retired · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog 状态翻转 · not live（本 turn）· not coordinator authorize · not withhold 契约裁定 · `g7SuiteGreen=false` · trio OPEN · `actualSpendCny=null` · alone ≠ dual

---
*Harness · G7W golden 冷启归因 + api 面拒因甄别刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 实验一=golden 单跑 ×3 受控复现（H-G1 chromium/worker 冷启 · H-G2 简历页组件首渲染 · H-G3 宿主资源 · trace 分段判读表 · 升压臂预注册）+ 实验二=CMD1 sidecar 仪器化甄别（沿 F-F 机制 · SELECT-only 八查询白名单 · 判读表 J-A1~J-A6 定位 case 与拒因 + G7S 修复后变化定谳）· 每跑有假设+判读+反例 Ban retry-to-green · 甄别=只读诊断 Ban 修复另刀 · 读 DB 不读 stderr withhold 零触碰 · `:68-:71` 已清面零触碰 · 预算 est ≤40 ≪ 200 · STOP*
