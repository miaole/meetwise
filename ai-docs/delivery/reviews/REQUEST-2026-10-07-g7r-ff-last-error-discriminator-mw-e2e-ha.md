# REQUEST — **F-F · interview_job last_error 甄别刀**（仪器化重跑 + 容器拆除前 DB 只读甄别 · ≠ 修复 ≠ trio 翻绿）· pre-dual · mw-e2e-ha

**Status**: **PENDING** / `draft:awaiting_re_pre_exec_dual`（**RE-PRE round 2** · round-1 本席 verdict=**FAIL**（B-FF-1/B-FF-2 · 下附段 append-only 随卷保留零删改）· 实现方已按两审处方面 rewrite · 本 stub 重开待本席复审 · Ban 实现方 self-write 任何 PASS · Ban self-approve · alone ≠ dual · 不代签 peer）
**RE-PRE 注记（实现方 mw-core · 2026-10-08）**：rewrite commit 落于 `line/ff-last-error`（base 重钉 `0b18169c`，rebase drop 孪生 `1dd1e630`）。本席 round-1 处方兑现：B-FF-1（§1.3(1)+白名单 `updated_at`→`created_at` + C-HA-FF-1 语义注记 + DDL 核实在卷）· B-FF-2（§1.3(2) `error`→`error_code` + C-HA-FF-2 值域注记 @`0037:14`/`0088:113`）· C-HA-FF-3（§1.3 前注 + §1.2-A 快照逐查询 ok/error + §3.4/§3.5 报错≠空读封口）· C-HA-FF-4（本段 append-only 随卷 + OB-FF-1 孪生 provenance/OB-FF-2 措辞注记于 harness Base/§1.2-A 如实继承）· C-HA-FF-5（withhold blob `13dbfc43` 钉与判读表措辞纪律零触碰）。请本席复审。
**Pins**: haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · public DELETE stays 503 · `g7SuiteGreen=false` · `r1Closed=false` · `techRoleFailClosedOptOutG7Only=true` · trio OPEN · GAP-G7K-API-REDS **P1 OPEN** · `actualSpendCny=null`
**Expert**: `mw-e2e-ha`
**Knife**: `harness/g7r-ff-last-error-discriminator.md` · slice `g7r-ff-last-error-discriminator.slice.md`
**上游**: G7R post-dual BOTH PASS `bfd868e0`（残余候选裁决：H0-alt-5 结构性 pre-model throw 最强 · H0-alt-1 协调方 Key 直探出局（输入事实：F-A-1 配对 200 成功 + 错配 401 复现）· H0-alt-2 code-face 驳回）· G7R EXEC 实跑 code SHA `3767f783`（trio EXIT 1/1/1 retained）
**Base tip**: `bfd868e0`（full `bfd868e028821531db0dcb905066730d56f64685` · 本机 origin ref 实测 · **如实登记：本 turn fetch 两次网络失败，以本机 ref 为基线恰满足预期 ≥`bfd868e0`；EXEC 期重 fetch 重钉** · 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）
**Date**: 2026-10-07
**Line**: **F-F**

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
| `actualSpendCny` | **null**（沿 G7R/I 线 · Ban invented spend） |

## 请审什么（mw-e2e-ha · e2e 夹具契约 / 证据诚实 / EXIT 纪律 / withhold 面）

Line F-F · **interview_job last_error 甄别刀**（甄别=只读诊断，修复另刀）。请审（e2e-ha 首责面）：

1. **withhold 契约零触碰（硬 · C-HA-2 延续）**：甄别读数走 **DB 直读旁路**（sidecar 连隔离 PG SELECT-only），与子进程 stdio 零接触——`run-e2e-isolated.mjs` 全文件零 diff，withhold 冻结函数体（blob `13dbfc43` 与 G7R 冻结钉 hash-object 全等 · 本树实测 `runFullE2E` 起 `:2082` · `:2088` `child.stderr.on('data', () => {})`；先例 `:2084-2098`/`:2093` 行号注记偏差如实登记）原样；**Ban 改 wrapper 输出机制**（Ban 为取明细开假面/回显 stderr/落盘子进程输出）；G7R post-dual mw-model-op 已确认「读 DB 不读子进程 stderr」路径合法——本 stub 是否如实呈现该授权边界与「读 DB ≠ 读 stderr」的论证。
2. **prove 容器即毁与读取窗口诚实**：`docker run --rm -d`（`run-e2e-isolated.mjs:2296`）+ finally `docker rm -f`（`:2367`）→ DB 状态随容器消失（G7R EXEC 工件不可回读的原因如实登记）；首选机制 A（run 内 sidecar 端口行监测 + 300ms 轮询 + 快照留痕）的窗口保证论证（端口行 `:2310` 先于 e2e spawn、run 时长 ≫ 采样间隔）是否成立且未夸大；机制 B keep-container 兜底的 **prove 契约偏差弱点**（绕过 wrapper 收据面）是否如实标注并锁死在「协调方显式批准」边界内。
3. **EXIT 契约诚实（双向）**：甄别 run 目的=取 `last_error` 非翻绿——预期 EXIT=1、红 EXIT ≠ 甄别失败、**甄别成功判据=快照捕获读数**（捕获 ≠ e2e pass ≠ trio 翻绿）；备选 iso run 触发条件唯一（「无 failed 行可读」）且须登记触发原因——是否构成 retry-to-green 变体的空间是否已被 Ban 条款封死（Ban 删改 attempt、Ban 只留绿 attempt、红 EXIT 不冲销）。
4. **断言与 spec 零触碰**：甄别 run 复用既有 spec（uc018-abandon ×2 / iso full 链）零改动——Ban 为绿改语义/洗断言（F-D/F-E 否决延续）；`e2e:ui:isolated`/`e2e:isolated` wiring 行号按 EXEC 当 tip 重核的纪律是否在案。
5. **判读表措辞纪律（C-HA-3 延续）**：§1.4 判读表系码面亲读的**机械归类**非根因断言；「与 X 一致」≠「X 已证」；「判读表未覆盖值域」与「读数矛盾」（如 last_error=结构门但 ai_model_invocation 有 dispatch 行；`reaped:worker_died` 与秒抛观测矛盾；`graph_fence_lost` 不应出现而出现）都是**合法收据结论**且须如实记——假设/断言边界是否守住。
6. **输入事实引用边界**：H0-alt-1 出局系协调方 Key 直探（F-A-1 配对 200 + 错配 401）**输入事实**，本 turn 未独立复证——harness §5.3 已锁「EXEC 读数矛盾则如实登记回协调方，Ban 掩盖」；引用与非主张（Non-claims）边界是否如实。
7. **收据与归档**：甄别收据落 `receipts/g7r-ff-last-error-discriminator/`（G7R `receipts/gap-g7k-api-reds-fix/` 零改写零覆盖）；七字段逐 attempt 全记录；evidenceOfRecord/SSOT 登记留 nail 阶段；`g7SuiteGreen=false` 保持声明在案。
8. **Ban 清单确认**：Ban coding（本 turn 与 EXEC 默认 plan——sidecar 探针=psql/node-pg 只读单行命令，零新增代码文件入树；机制 B 同禁代码化）· Ban prove 执行（本 turn 零实跑零 live 零 Key 加载零 DB 连接）· Ban push · Ban SSOT/backlog 状态翻转 · Ban 洗绿/Ban retry-to-green/Ban flake 记法 · Ban 改 withhold 机制 · Ban 为绿改产品（读数命中任何门 → 修复另刀，沿 C-MO-11）· Ban 碰 `:68`/`:70`/`:71` 已清面（registry start-job chat ops `wired:true` 裁决域）· Ban 碰已占用行/sibling 归档 · Ban self-approve · alone ≠ dual。

Trio stays **OPEN**（EXIT 1/1/1 真实业务红）。`g7SuiteGreen=false`. `actualSpendCny=null`. **甄别读数 ≠ 修复 ≠ trio 翻绿** · DB 读数 ≠ 产品修复 · **Ban 假绿叙事**。

本 stub 不授权 prove 执行 / 甄别 run / DB 连接 / 机制 B；pre-dual BOTH PASS 后由协调方授权 EXEC（run 面与机制 B 裁定时落字）；implementer 不自批；本 PASS（如落）仅为 mw-e2e-ha 半签，不代签并行 peer mw-model-op。

---

*REQUEST stub · F-F last_error discriminator · Line F-F · 2026-10-07 · PENDING awaiting mw-e2e-ha + mw-model-op pre-dual · alone ≠ dual · 禁 push · STOP*

---

# PRE-EXEC dual 审查段 — mw-e2e-ha（adversarial evidence-honesty）· append-only · 2026-10-07

**审者**：`mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ff-e2e-ha` · branch `rv/ff-e2e-ha`）。**被审树**：origin tip `0b18169c`（full `0b18169c78f20b0d2b8c5105d388b23d6d9cc865`，parent `bfd868e0`）。**方法**：0 prove run · 0 live · 0 Key 值读取 · 0 DB 连接 · 0 coding · 全部只读（git 亲读 + 文件亲读 + 全局 grep 机检）· alone ≠ dual，不代签并行 peer mw-model-op。

**Provenance（如实登记）**：任务单所引 REQUEST commit `1dd1e630` **非** origin 分支祖先（dangling 同树孪生）；origin tip `0b18169c` 与之 **tree 全等**（`b910a6da5d78029dbaede8ea91e1511563d6ba10` 双向 `rev-parse^{tree}` 亲算 + `git diff` 空）· 同 subject 同 4 文件 +255/−0 · parent 恰为 `bfd868e0`。本审对 tip `0b18169c` 执行，孪生 provenance 登记为 OB-FF-1（沿 G7R 同树重提交先例，非阻断）。docs-only 机检：4 文件全 `ai-docs/delivery/`，零产品码、零 SSOT、零 package.json、零 spec、零 `.env*`。REQUEST 祖先性：tip 即分支头，docs-only 成立。

## 一、检查表（逐维 · 只读抽验证据全部本树亲算）

| # | 维度 | 结果 | 证据（本树亲读亲算） |
|---|---|---|---|
| 1 | docs-only + 无 SSOT 翻转 | ✅ | `git diff bfd868e0..0b18169c --numstat` = 4 docs 文件 +255/−0 |
| 2 | wrapper 零 diff / withhold 零触碰 | ✅ | `git hash-object scripts/run-e2e-isolated.mjs` = `13dbfc43c744511644649ae310696a13ee2f20f7` 与 G7R 冻结钉前缀全等；`runFullE2E` 实测起 `:2082`、`child.stderr.on('data', () => {})` 实测 `:2088`（REQUEST 登记的先例行号偏差 `:2084-2098/:2093` 属实且已如实披露） |
| 3 | sidecar 时序窗口 | ✅ | `:2309` `waitForPostgres` → `:2310` 端口行 → `:2333` `runFullE2E('pnpm',[target],env)`：端口行先于 spawn（无连接竞态，探针起采即 PG 已就绪）；`docker run --rm -d` `:2296`、动态映射 `:2301`、finally `docker rm -f` `:2367` 全精确命中；拆除仅发生于整个 e2e run 结束后（G7R 在案 34.5-35.6s 量级），job 秒级抛 → failed 行存活 ≈33s ≫ 300ms 轮询 → 采样量充裕 |
| 4 | SELECT-only / 隐私白名单 | ✅ | 四查询全 SELECT；Ban `payload`/`trace.output` 明文在案；凭据=容器固定测试值（`:2298-2300` POSTGRES_USER/PASSWORD/DB + `:2119` HOST_SQL_PROBE 同面），非模型 Key，零 Key 物料触碰 |
| 5 | 读 DB ≠ 读 stderr 契约 | ✅ | sidecar 只 tee wrapper 自身 stdout（端口行为 wrapper 设计内公开输出）+ 纯 DB SELECT，与子进程 stdio 零接触；「Ban 假面/回显 stderr/落盘子进程输出」Ban 条款在案；G7R post-dual 授权边界如实转述 |
| 6 | 判读表源码锚 | ✅ 全精确 | `interview-jobs.ts:214-217` markJobFailed `error.slice(0,500)`+`payload-'answer'`（`:211` markDone 同剥）；`:251` `reaped:worker_died`；`interview-consumer.ts:93`（interview_unavailable kind/reason）、`:162`（job_failed 终态）、`:176`（legacy disabled）、`:200-206`（resume-reference 结构门）、`:294-295`（enroll+fence）、`:313-314`（start locator throw）、`:370-381`（catch-all→failClaimedInterviewJob）、`:374-377`（fence_lost→requeue→'retry'）；`invoke.ts:494/:524/:562/:601/:662/:683` 六内部态 throw 逐行命中、`:646`（completeModelInvocation error=provider_rejected/deterministic_refusal）、`:352` 注释亲证 persistTrace 仅 `!error` 落；`model-invocation.ts:139-155`；registry `:63-71` wired:true 清面；wiring `:278/:279` |
| 7 | 判读表完整性/纪律 | ✅ | 逐值域映射 + 「机械归类非根因断言」+「未覆盖值域系合法收据结论」+ 三面联合判读单一读数不定谳 + 矛盾必记（reaped vs 秒抛 / fence_lost 出现 / 混合面）；`graph_fence_lost` 不可能论证经 `:374-377` 亲验成立（拦截先于 failClaimedInterviewJob）且具可证伪框架 |
| 8 | 红① 排除诚实性 | ✅ | 「interview_job 无对象」码面抽验成立：start 链 `interview.service.ts:208/:227/:248/:279/:305` 各 fail-closed 门全在 `:337` `enqueueInterviewJob` 之前；留 route 侧另刀如实、未越界 |
| 9 | EXIT/attempts 纪律 | ✅ | 预期 EXIT=1、红 EXIT ≠ 甄别失败、成功判据=快照捕获、备选触发条件唯一且须登记、attempts 全记录 Ban 删改、Ban retry-to-green/flake、机制 B 锁协调方显式批准 + provenance 弱点如实登记 |
| 10 | Pins/Retained 原值 | ✅ | harness §2/§4、slice、stub 三处一致：NOT_HA · false · false · true · 8 · false · PG-retained · DELETE=503 · g7SuiteGreen=false · trio OPEN · GAP P1 OPEN · actualSpendCny=null——本审零翻转 |
| 11 | Non-claims/输入事实边界 | ✅ | H0-alt-1 出局标注为协调方输入事实未独立复证 + §5.3 矛盾回协调方 Ban 掩盖；Non-claims 全集在案 |

## 二、Fail-trigger audit（可复现 · 全局 grep 排除补列）

- **F-FF-1（判读主查询 §1.3(1) 引用不存在的列）**：`SELECT id, kind, status, attempts, last_error, updated_at FROM interview_job ORDER BY updated_at DESC LIMIT 20` —— `interview_job` **无 `updated_at` 列**。DDL `packages/db/sql/05_interview_jobs.sql`（及同款内嵌 `migrations/0001_baseline.sql:253+`）仅有 `created_at`（`:18`）；全局机检 `packages/db/migrations/*.sql` + `packages/db/sql/*.sql`：唯一 `ADD COLUMN updated_at` 是 `app_setting`（`0003_app_setting_updated_at.sql:2`）；0058:227 的 `updated_at` 目标为 `privacy_erasure_request` 非本表。**后果**：隔离 PG 上该查询每次轮询必报 `column "updated_at" does not exist`——「一步定谳」主读为零产出；且 (1) 出错≠「无 failed 行可读」，若被误读为 NULL 结果将**可预期地误触发**备选 iso attempt（触发条件唯一性被仪器错误污染），白烧 attempt 预算并产生朝机制 B 的偏置。EXEC 期修复=偏离冻结 docs；不修复=甄别目的（快照捕获 §1.3 读数）必然落空。
- **F-FF-2（§1.3(2) 同类缺陷）**：`SELECT service, status, error, count(*) FROM ai_model_invocation …` —— 该表列名为 **`error_code`**（`0037_ai_model_invocation_durable_claim.sql:14`），无 `error` 列；后续 ALTER 全局 grep 仅 RLS enable/force，无补列。值域不受影响（0088:113 约束 `^[A-Za-z0-9._:-]{1,120}$` 可容 `provider_rejected`/`deterministic_refusal`），纯列名错误，但同样每轮必错。四查询中 (3) `count(*) FROM ai_invocation_trace`（表在 `0001_baseline:55`/`01_schema.sql:77`）与 (4) `interview.status`（`01_schema.sql:17+:4`）验证有效。
- **其余 Fail-trigger 逐项排查零命中**：withhold/blob/行号（见检查表 #2/3/6）、Pins 翻转、retry-to-green 空间、备选触发多义、机制 B 越权、Key 物料、`:68-71` 清面触碰、self-approve——全无。

## 三、机制/判读裁决

- **机制 A（sidecar）框架可行**：时序、零 wrapper diff、SELECT-only、隐私白名单、withhold 零触碰论证全部成立；**但读数仪器带两处必然报错的列引用（F-FF-1/F-FF-2），「仪器可行、读数清单不可行」**——恰是本刀赖以定谳的四查询之二。
- **判读表本身合格**：锚点全精确、值域映射纪律完整、矛盾处置框架（如实记/不定谳）符合 evidence-honesty；主查询失效属仪器缺陷而非判读逻辑缺陷。
- **OB-FF-2（非阻断）**：「必得数十至数百次采样」的必然性措辞以 sidecar 自身健康为条件（框架内 §1.2-B 兜底已覆盖残余风险）；「CMD 34.8-38.5s」上界 38.5 本树未复现（在案 34.8/34.5/35.3/35.6），承重命题（run 时长 ≫ 轮询间隔×行存活）不受影响，如实登记。

## 四、Blockers

- **B-FF-1**：F-FF-1 必须修复（`updated_at` → `created_at`，或 `ORDER BY id DESC` 等价改写）方可送 EXEC。
- **B-FF-2**：F-FF-2 必须修复（`error` → `error_code`）。
- 两项均为 docs-only 一行级修正：**须新 docs commit 重走 pre-dual，禁 EXEC 期热修，禁在本 stub 上原地改**（冻结 docs 即 EXEC 契约）。

## 五、Conditions（随卷）

- **C-HA-FF-1**：修复 commit 中查询 (1) 改用 `created_at` 时须注明其语义为入队时刻（failed 行即首因写入时刻，排序语义等价）；如另选排序键须一并写明。
- **C-HA-FF-2**：§1.3(2) 修复为 `error_code` 并保留 0088:113 值域约束注记（`provider_rejected`/`deterministic_refusal` 可容性）。
- **C-HA-FF-3**：EXEC 契约须显式区分「查询报错」与「查询成功且零行」——仪器错误**不得**记作「无 failed 行可读」，不得据此触发备选 attempt；sidecar 快照 log 须含每查询执行状态（ok/error）。
- **C-HA-FF-4**：修复后重走 pre-dual 双审（mw-e2e-ha + mw-model-op），本 FAIL 段随卷留存不删改；OB-FF-1 孪生 provenance 与 OB-FF-2 措辞注记在修复 commit 中如实继承。
- **C-HA-FF-5（延续 C-HA-2/C-HA-3）**：withhold blob `13dbfc43` 钉与判读表「机械归类非根因断言」「与 X 一致 ≠ X 已证」措辞纪律在 EXEC 期不变。

## 六、中文三行摘要

1. F-F 甄别刀 REQUEST 文档框架合格：wrapper 零 diff（blob `13dbfc43` 亲算全等）、sidecar 时序窗口与 SELECT-only 纪律成立、判读表锚点 20+ 处逐一精确命中、红① 排除与 EXIT/attempts/Pins 纪律全部如实。
2. 但四查询中两个引用不存在的列——`interview_job` 无 `updated_at`（仅 `created_at`，全迁移全局 grep 排除补列）、`ai_model_invocation` 列名为 `error_code` 非 `error`——判读主查询与分布查询在隔离 PG 上必报错，一步定谳主读零产出，且仪器错误可被误读为「无 failed 行」而误触发备选 attempt。
3. 判 **FAIL**（机制缺陷、可复现、两行级 docs 修正即可），附 Blockers B-FF-1/2、Conditions C-HA-FF-1~5；修复须新 docs commit 重走 pre-dual，非对文档设计的否定——甄别框架本身保留，仪器读数清单须先修准。

alone ≠ dual：本 FAIL 仅为 mw-e2e-ha 半签，不代签并行 peer mw-model-op；peer 独立裁决。本审 0 prove run · 0 live · 0 Key 值读取 · 0 coding · 0 产品/SSOT 触碰 · 禁 push。本 FAIL ≠ REQUEST 框架整体否决 ≠ 判读表逻辑否定 = 仅 B-FF-1/B-FF-2 修复前置。

Verdict: FAIL

---

# RE-PRE dual 审查段 — mw-e2e-ha（adversarial evidence-honesty）· append-only · 2026-10-08

**审者**：`mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ffr-e2e-ha` · branch `rv/ffr-e2e-ha`，自 `line/ff-last-error` 创立）。**被审对象**：rewrite commit `c4ec760b`（full `c4ec760bd6fdbbfda6131317610e00627a56fd32` · parent `0b18169c` · author mw-core）。**方法**：`git diff 0b18169c c4ec760b` 逐 hunk 亲读 + 全局 grep 机检 + 锚点亲读重算；0 prove run · 0 live · 0 Key 值读取 · 0 DB 连接 · 0 coding；alone ≠ dual，本 PASS 仅为 mw-e2e-ha 半签，不代签并行 peer mw-model-op。

## 一、round-1 处方兑现核验表（逐条 · 证据全部本树亲算）

| # | 处方 | 兑现 | 证据（本树亲读亲算） |
|---|---|---|---|
| 1 | **B-FF-1** `updated_at`→`created_at` | ✅ | §1.3(1) 改为 `SELECT id, kind, status, attempts, last_error, created_at FROM interview_job ORDER BY created_at DESC LIMIT 20`；DDL 亲读：`05_interview_jobs.sql` 仅 `created_at timestamptz NOT NULL DEFAULT now()`（本树实测 `:20`，文档按内容引用未钉错行）、内嵌 `0001_baseline.sql:266` 同款逐字命中；全局机检复核：`ADD COLUMN updated_at` 全迁移唯一=`0003_app_setting_updated_at.sql:2`（app_setting），`interview_job`+`updated_at` 同现 0 hit，`0058:227` updated_at 确系 `privacy_erasure_request`——文档排除补列论证全真 |
| 2 | **C-HA-FF-1** created_at 语义注记 | ✅ | §1.3(1) 注释块 + slice 范围3 + footer 三处在卷：「created_at=入队时刻；failed 行系首因写入（秒抛首败非多 attempt 续写），『最近失败优先』排序语义与失败时刻排序等价」 |
| 3 | **B-FF-2** `error`→`error_code` | ✅ | §1.3(2) 改为 `SELECT service, status, error_code, count(*) …`；DDL 亲读：`0037_ai_model_invocation_durable_claim.sql:14` 逐字=`error_code text,`；`0088:113` 逐字=`error_code !~ '^[A-Za-z0-9._:-]{1,120}$'`；后续 ALTER 全查：0057/0085/0119 补 `cost_scope_id`/`logical_node_key_digest`/`estimate_input_tokens`，**全库零 `error` 列**（`ADD COLUMN|grep -i error`=0 hit）——无 error 列承重命题成立 |
| 4 | **C-HA-FF-2** error_code 值域注记 | ✅ | §1.3(2) 注释块 + slice + footer：「0088:113 约束可容 provider_rejected/deterministic_refusal，值域判读不受列名修复影响」在卷 |
| 5 | **C-HA-FF-3** 查询报错≠空读 | ✅ 六处落字 | §1.3 专门前注段（仪器错误不得记「无 failed 行」/不得触发备选/快照逐查询 ok/error+报错摘要/Ban 读成空结果）；§1.2-A(3) 快照格式加「四查询逐条执行状态 ok/error（含报错摘要）」；§1.1 备选触发改为「查询成功且确实未捕获 failed 行」；§1.4 NULL 行加「『三面全空』仅在四查询逐条 ok 时方可判读」；§3.4 收据字段 + §3.5 attempt 纪律同面封口；slice 范围2/3/4/footer 同步 |
| 6 | **红① 措辞（C-MO-P2/OB-MO-1）** | ✅ | harness §1.1：「start job 未入队：`POST /` 的 interview 壳行已创建，四道 fail-closed 409 门 `interview.service.ts:278-279/:284-285/:304-305/:323-324` 全部先于 `:337` `enqueueInterviewJob` 入队（Ban 沿用『interview 从不创建』简写）」——六行号本树逐一亲验精确（throw 行 `:279/:285/:305/:324`，入队恰 `:337`），且全先于入队成立 |
| 7 | **C-HA-FF-4** FAIL 段随卷 append-only | ✅ | 本席 round-1 段（自 round-1 commit `a2c33c59` 提取）与 `c4ec760b` 卷内段 **cmp 逐字节全等**（10501B 前缀相等、其后零字节）；round-1 本体对 `0b18169c` 恰 +60/−0；peer 段同理 `rv/ff-model-op` `eccfebfd` 12116B 前缀全等——双审段零删改随卷；OB-FF-1 孪生 provenance（`1dd1e630` tree `b910a6da5d78029dbaede8ea91e1511563d6ba10` 与 `0b18169c` 全等亲算 rebase drop 属实）与 OB-FF-2 措辞（34.5-35.6s 如实改 + 「以 sidecar 自身健康为前提，非必然性断言」）于 Base/§1.2-A 继承在卷 |
| 8 | **C-HA-FF-5** blob 钉 + 措辞纪律 | ✅ | `git hash-object scripts/run-e2e-isolated.mjs` 重算=`13dbfc43c744511644649ae310696a13ee2f20f7` 全等（`:2082/:2088/:2119/:2296-2301/:2310/:2333/:2367` 行号逐一复验全中）；判读表「机械归类非根因断言」+「单一读数不定谳」交叉互证规则原文保留 |
| 9 | **C-MO-P1** embedding 证伪分支 | ✅ | §1.4 新增显式证伪行（签名=`qbank.embedding-build/-query/rerank` → 推翻 H0-alt-2 驳回、回协调方、Ban 扫入基建 catch-all、Ban 就地 reinterpret、与「未覆盖值域」兜底显式切割）；§3.4 显式负检查字段 + §5.2 例外条款 + 输入事实行交叉引用；registry `:148/:153/:158` wired:false 三行亲验精确、`invoke.ts:317-319` 降级不抛亲读 |
| 10 | **base 重钉** | ✅ | Base=`0b18169c`（full SHA 亲核）；抽验 ≥2 锚（实抽 20+：DDL 4 处 + registry 3 处 + service 5 处 + interview-jobs 214-217 + invoke 2 处 + consumer 8 处 + package.json `:278/:279` + wrapper blob）tip 树全中；`c4ec760b` name-status 恰 4 文件全 `ai-docs/delivery/`，零产品码/SSOT/package.json/spec/`.env*` |
| 11 | **改写面恰限 + 状态纪律** | ✅ | 全部 hunk 逐一面归处方（B-FF-1/2·C-HA-FF-1/3·C-MO-P1/P2·OB-FF-1/2·re-pin 轮次标注）；双 stub Status 仍 **PENDING**、实现方 RE-PRE 注记署名 mw-core 零代写 verdict、「Ban 实现方 self-write 任何 PASS」入条；Ban 面（wrapper/withhold/`:68`/`:70`/`:71`/SSOT/backlog）零触碰亲验 |

## 二、Blockers

- **0**。round-1 B-FF-1/B-FF-2 双 Blocker 均已兑现修复（核验表 #1/#3），无新 Fail-trigger：本审对 §1.3 四查询在 tip 树 DDL 全列存在性逐列机检通过，判读表锚点复抽全中，改写面无越界。

## 三、Conditions（随卷 · EXEC 期义务）

- **C-HA-FFR-1**：C-HA-FF-3 自本 PASS 起为 EXEC 硬义务——sidecar 快照须对四查询逐条记 ok/error+报错摘要；任一查询报错=仪器缺陷，如实登记回协调方并复核机制 A 窗口健康性，Ban 记空读、Ban 触发备选 attempt；违者=post 段 Fail-trigger。
- **C-HA-FFR-2**：C-MO-P1 负检查同为 EXEC 硬义务——四查询读数逐条核对无 `qbank.embedding-*`/`qbank.rerank` 签名，有即按 §1.4 证伪分支处置（回协调方），Ban 扫入基建 catch-all、Ban 就地 reinterpret。
- **C-HA-FFR-3**：C-HA-FF-5 延续——wrapper blob `13dbfc43` 钉与判读表「机械归类非根因断言」「与 X 一致 ≠ X 已证」措辞纪律 EXEC 期不变；blob 变动即停回协调方。

## 四、OB（非阻断 · 如实登记）

- **OB-FFR-1**：§1.3(2) 注记「后续 ALTER 全局 grep 仅 RLS enable/force 无补列」不精确——后续 0057/0085/0119 实补三列（cost_scope_id/logical_node_key_digest/estimate_input_tokens）；承重命题「无 error 列」经全库机检成立，且该措辞系本席 round-1 F-FF-2 原文被实现方忠实继承（非实现方引入）。精确表述应如本行；不阻断 EXEC（无任何判读/查询依赖该完备性子命题）。
- **OB-FFR-2**：slice 范围2 压缩区间「四道 fail-closed 409 门 `interview.service.ts:278-:305`」仅覆盖四门中三门（第四门 `:323-324` 在区间外）；harness（SSOT）枚举 `:278-279/:284-285/:304-305/:323-324` 精确无误，按 harness 为准，不阻断。

## 五、中文三行摘要

1. 重写 commit `c4ec760b` 对 round-1 处方逐条兑现：`updated_at`→`created_at`（DDL 仅 created_at、语义注记在卷）与 `error`→`error_code`（0037:14/0088:113 亲读命中）双修复机检通过，查询报错≠空读纪律六处落字，红①「start job 未入队」按 C-MO-P2 精确措辞且六行号亲验全中。
2. 改写面恰限成立：恰 4 个 ai-docs 文件、hunk 逐面归处方、双审段（本席 FAIL 10501B + peer PASS 12116B）cmp 逐字节 append-only 随卷、base 重钉 0b18169c 后 20+ 锚点重抽全中、wrapper blob 13dbfc43 重算全等、双 stub 保持 PENDING 零 self-approve。
3. 判 **PASS**（mw-e2e-ha 半签）：0 Blocker，2 OB 非阻断（「仅 RLS」注记不精确系本席 round-1 原文继承/slice 压缩区间漏第四门），3 Conditions 转 EXEC 硬义务；本 PASS ≠ EXEC 授权 ≠ trio 翻绿 ≠ g7SuiteGreen=true，RE-PRE dual 须 peer mw-model-op 独立半签后方达成。

alone ≠ dual：本 PASS 仅为 mw-e2e-ha 半签，不代签并行 peer mw-model-op；peer 独立裁决。本审 0 prove run · 0 live · 0 Key 值读取 · 0 coding · 0 产品/SSOT 触碰 · 禁 push。本 PASS ≠ EXEC 续授权 ≠ H0-alt-5 定谳 ≠ 修复 ≠ trio 翻绿 ≠ g7SuiteGreen=true。

Verdict: PASS

---

# POST-PROVE dual 审查段 — mw-e2e-ha（adversarial evidence-honesty）· append-only · 2026-10-08

**审者**：`mw-e2e-ha`（独立 worktree `/Users/miaole/Desktop/golucky/meetwise-rv-ffp-e2e-ha` · branch `rv/ffp-e2e-ha`，自 origin/feat/mysql-schema-skeleton `ca2e4ce0` 创立）。**被审对象**：F-F EXEC 收据 commit `3da3f0cb`（full `3da3f0cb1771444c0bbbc310a7467fe434d25dac` · parent `7ed35f0d` · author mw-core · 恰 2 收据 md +122/−0）。**实跑 code SHA（收据自称）**：`7ed35f0d05f7d31fcfca24e873664311160d157c`（= RE-PRE 双 PASS 镜像链 tip，本审逐锚重核）。**方法**：git 亲读亲算 + 码面/DDL 锚点亲读 + 收据内容机导复核；本审 0 prove run · 0 live · 0 Key 值读取 · 0 DB 连接 · 0 coding · 零远程（fetch 网络不可用，以本机 origin ref `ca2e4ce0` 为基线，与任务单给定 origin tip 全等）；alone ≠ dual，本 PASS 仅为 mw-e2e-ha 半签，不代签并行 peer mw-model-op（其 POST 段 parallel 在途，本审看不到亦不需要看）。

## 一、包完整性复核（全部本树亲算）

| # | 项 | 结果 | 证据 |
|---|---|---|---|
| 1 | 恰 2 收据文件 | ✅ | `git show --name-status 3da3f0cb` = 恰 2 个 **A**（新增）：`receipts/g7r-ff-last-error-discriminator/SUMMARY.md`（53 行）+ `e2e-ui-isolated.md`（69 行），+122/−0；G7R 收据目录（`receipts/gap-g7k-api-reds-fix/`）零改写零覆盖（diff 零触碰）亲验 |
| 2 | 零产品码/SSOT/Key 物料 | ✅ | 全距 `c5a1f8e3..ca2e4ce0` 恰 3 文件：2 收据 + peer 审查文件 +68（= peer RE-PRE 段落卷）；零 `apps/`/`packages/`/`scripts/`/SSOT/backlog/checklist/package.json/spec/`.env*`；diff 长 token 机扫仅 job UUID×2/commit SHA/env 名/表名/容器名——零 Key 物料（Key 仅 name-only loader 口径记录，值零入树） |
| 3 | wrapper blob post-run 复算 | ✅ | `git hash-object scripts/run-e2e-isolated.mjs`（tip working tree 实算）= `13dbfc43c744511644649ae310696a13ee2f20f7`，与 `7ed35f0d`/`3da3f0cb^{tree}`/`ca2e4ce0^{tree}` 四点 `git ls-tree` 全等——withhold 面零触碰、gate 机不可弱化（收据 §4-1 自评「post-run 复算全等」与实测一致） |
| 4 | 本席 PRE/RE-PRE 段 append-only 保留 | ✅ | 本文件 @`ca2e4ce0` = 26886B，与 `c5a1f8e3`（本席 RE-PRE 镜像）**逐字节全等**（`git diff` 空）；round-1 FAIL 段 + RE-PRE PASS 段原样随卷；追加前 md5 `fafe2783be522a58e4d92fa89209fc85`（26886B）随卷备查 |
| 5 | 授权链（C-HA-1 证据） | ✅ | RE-PRE 双 PASS 原始 commit `f7074586`（mw-e2e-ha，author epoch **1791394767**）+ `23e99856`（mw-model-op，author epoch **1791394838**）均早于 exec start epoch **1791395164**（17:46:04Z）；本席镜像 `c5a1f8e3` ≡ `f7074586` tree `5bae5f29` 全等亲算；协调方 EXEC 授权系输入事实（与 harness §3.1 契约结构一致，收据 §头如实转述） |

**Provenance 观察（OB-FFP-4，非阻断）**：peer 原始 `23e99856`（tree `9fbf7c8a`）与其分支镜像 `7ed35f0d`（tree `2b9e1c27`）tree 不同——差量恰为本席 RE-PRE 段 +47 行并入本席文件（镜像组合面，benign）；本席原始与镜像 tree 全等。两原始 commit 均 dangling 非 origin 祖先，授权链以「原始对象在场 + author 时间戳不变 + 镜像树全等」三重一致承重。

## 二、快照复核（甄别证据窗口 · 内容自证）

1. **算术**：536 行 = 525 轮四查询全 ok + 8 轮仪器错误 + 3 行 phase 标记（525+8+3=536 ✓）。8 轮系 migrate 前空库窗口（17:46:06.7-17:46:08.8Z）`relation does not exist`——**如实记 error、未记空读、未触发备选**（C-HA-FF-3/C-HA-FFR-1 兑现；收据 §5 + §4-2 双处落字与收据 §6 快照逐查询 status 全 ok 一致）。
2. **「快照在 `docker rm -f` 之前」系内容自证，非仅时序主张**：最后全 ok 快照 t=`17:48:50.659Z` **读得** `created_at=17:48:49.644Z` 的 failed 行（1.015s 前）——已拆除容器不可能服务该读取；wrapper 拆除仅发生于 finally（`run-e2e-isolated.mjs:2365-2368` 亲读：`docker rm -f` 在 run 结束后的 finally 块内）。窗口保证成立。
3. **时间链自洽**：start epoch `1791395164`=17:46:04Z ↔ 容器名 `meetwise-e2e-8418-1791395164551` 后缀 ms 全合；end epoch `1791395330`=17:48:50Z ↔ dur=166s ↔ 收据 commit epoch 1791395720（+5min 落卷）；快照 .659s 处 finally 窗口内。attempts=1 ×2 与 fail-closed 秒抛一致（无 retry 消耗）。
4. **时间线整体对抗性复演**：recruiting-bound ×2（34.7s/34.5s，未入队面 C-MO-P2）失败时刻与 run 结束（17:48:50.000Z）及两 job created_at（17:47:44.030/17:48:49.644Z）在「rb 零入队 + 他 spec begin ×2 秒抛」模型下全部相容——收据对 job 归属未越权断言（见 §三.4），无矛盾残留。

## 三、甄别有效性裁决（核心）

1. **未预列值域处置程序正当**：判读表 §1.4（@`7ed35f0d` 亲读，12 行值域：a/a′/b×4/c/legacy/reaped/NULL 行/证伪行/fence_lost）确无 `adaptive_role_route_missing`——「六域无一命中」属实。收据按 §5.2（「判读表未覆盖值域」系合法收据结论：如实记原值 + 三面交叉读数）处置，并**额外**做码面归类登记 H0-alt-5·d——加良非违例。**未扫入 catch-all 成立**：·c 行域限定 checkpoint/SQL/连接类错误原文，role-resolve 系业务 fail-closed 门（`ADAPTIVE_ROLE_ROUTE_MISSING` 常量 `adaptive-role-resolve.ts:16` 亲读），排除正当；亦非 C-MO-P1 证伪分支域（签名全 absent）。
2. **码面锚全中（@`7ed35f0d` 逐行亲读）**：`isTechRoleFailClosedEnabled`（`:35-38`）默认 ON 仅精确 `0/false/off` 关闭；`resolveAdaptiveInterviewRole`（`:55-62`）route snapshot ?? metadata 双缺 → throw（`:59-61`）；调用点 `interview-consumer.ts:345-349`（`allocations[0].leafTrackId` 读）+ `:351-355`（resolve 调用）**先于** `:356` `startAdaptiveInterview`；catch-all `:370-381`（`:380`）→ `failClaimedInterviewJob`（`:155-168`，`:162` job_failed）→ `terminalizeUnsettledInterview`（`:77-96`，`:93` `interview_unavailable{reason,kind}`）→ `markJobFailed`（`interview-jobs.ts:214-216`，`last_error` + `slice(0,500)`）——收据 §7 传播链逐环命中。
3. **三面互证命题均为收据内数据机导出**：Q2 分布 rowCount=1（仅 `job.route-classify.v1`/`succeeded` ×2、`error_code` 全 NULL）⇒ 零 chat op 行 + 零 `provider_rejected`/`deterministic_refusal`/embedding/rerank 签名（C-MO-P1/C-HA-FFR-2 兑现，H0-alt-2 驳回维持）；Q3 trace=2 恰两次 classify；Q4 interview failed ×2。「start job 死于一切 interview chat op 之前」由 Q2 直接承载。
4. **措辞纪律守住（含红①）**：「与 H0-alt-5 一致」≠「H0-alt-5 已证」在 SUMMARY §3 行内 + §6 Non-claims（not root-cause-proven）双处明示；单一 run 单面限制披露；红①张力（rb ×2 仍红 vs classify succeeded ×2）**如实登记非定谳、回协调方**，`job_route` 归属查询在四查询授权外**未扩查**、留 route 侧另刀——本刀对红①零越权归因。甄别成功判据=快照捕获（4/4 ok）达成，与「预期红 EXIT=1 ≠ 甄别失败」契约一致。

**裁决：甄别 run 程序正当、证据窗口成立、归类登记合法、措辞纪律守住——有效性成立。** 承重边界（如实转述）：H0-alt-5·d 系「一致性归类 + 未预列登记」，非定谳终局；2 个 failed job 与 rb 红面的归属（需 `job_route`）未决，留 route 侧另刀。

## 四、C-HA-1~8 逐条裁决（继承 I103 `19cfe869` standing 系列 · 对本 EXEC 收据）

| # | 条件 | 裁决 | 证据（本审亲算） |
|---|---|---|---|
| 1 | 授权链 | ✅ | RE-PRE 双 PASS `f7074586`/`23e99856`（epoch 1791394767/1791394838）早于 exec 1791395164；镜像树全等；EXEC 由协调方下达（输入事实），binding 7 条随卷自评 §4 在卷 |
| 2 | 触碰面恰限 | ✅ | EXEC diff 恰 2 收据 md；零产品码/SSOT/Key/`:68-71` 清面/G7R 收据；wrapper blob `13dbfc43` 四点全等 |
| 3 | attempts 三字段 + C-HA-FF-3 | ✅ w/ OB-FFP-1 | attempt 序号（#1）+ code SHA 40 位全哈希（§4，receipt commit ≠ 实跑 SHA 如实登记）+ 时间戳（epoch+Z）；⚠ 时区呈现 UTC/Z 非 Asia/Shanghai（I103 原文字面），epoch 锚无歧义、保守向不阻断；sidecar 536=525+8+3 ✓；8 轮仪器错误如实记 error、未触发备选、未记空读——C-HA-FF-3 兑现核验通过 |
| 4 | gate 13 条 | ✅（零交集面） | 13 条义务系 I103 mem00-int00 prove-path 刀域；本刀 EXEC diff 零 gate 机触碰 + wrapper blob 冻结全等 ⇒ gate 面不可弱化；义务留存原刀不受本刀影响 |
| 5 | blocked→EXIT≠0 | ✅ | EXIT=1 原值如实（预期红）；10 skipped=诚实 capability skip（voice/OCR/ASR/TTS 0 调用）零洗绿；无自动降级路径触碰（blob 冻结）；sidecar exit 1 如实登记 |
| 6 | 单窗口 | ✅ | 恰 1 attempt（§1）；备选 iso 未触发（触发条件=「查询成功且无 failed 行」未满足）；机制 B 未启用；Ban retry-to-green 守约（红不冲销） |
| 7 | 零 live 报备口径 | ✅ | live=2/200 全部为 `job.route-classify.v1` succeeded ×2（Q2 机导出）；`actualSpendCny=null`（Ban invented spend）；Key name-only；isolated 经 wrapper 壳（sidecar 仅连 wrapper 所建容器 SELECT-only，无 `db:up`/compose 捷径） |
| 8 | Pins | ✅ | 收据 §5 八项原值（NOT_HA/false/false/true/8/false/PG-retained/DELETE=503）与 checklist `:432`/`:443` 亲读零漂移；retained（g7SuiteGreen=false/r1Closed=false/techRoleFailClosedOptOutG7Only=true/Disclosure-1 OPEN/trio OPEN/GAP P1 OPEN/actualSpendCny=null）零翻转；EXEC diff 零 checklist/backlog 文件 |

## 五、Blockers

- **0**。无新 Fail-trigger：收据原始值（EXIT/时长/行号/class）全部如实、无假绿叙事、无越权归因、无 SSOT/withhold/Gate 触碰。

## 六、Conditions（随卷 · POST 后义务）

- **C-FFP-1**：H0-alt-5·d 判读表增补须走 docs 刀（新 REQUEST + 双审 + 冻结纪律），Ban 就地改冻结 harness。
- **C-FFP-2**：红①归因所需 `job_route` 表查询属 route 侧另刀域——Ban 在本刀收据上扩查/回填/改写结论。
- **C-FFP-3**：role-resolve fail-closed 门修复=产品刀（route snapshot/metadata 供给面或门语义），另 REQUEST + 双审 + 协调方 EXEC；本收据 ≠ 修复授权。
- **C-FFP-4**：Pins/g7SuiteGreen=false/trio OPEN/GAP P1 OPEN 保持至修复落地 + 三绿 + post-dual BOTH + 协调方 nail 全链；evidenceOfRecord/SSOT 登记留 nail 阶段。

## 七、OB（非阻断 · 如实登记）

- **OB-FFP-1**：attempt 时间戳呈现 UTC/Z + epoch（I103 C-HA-3 字面为 Asia/Shanghai）；epoch 锚消歧、保守向，无证据完整性影响。
- **OB-FFP-2**：SUMMARY §3 标题「根因定谳段」与 e2e §7「H0-alt-5 族成立」措辞偏强；被 §3 行内「≠已证」与 §6 Non-claims「not root-cause-proven」双处明示限定，承重命题均收据内机导出，不构成 overclaim。
- **OB-FFP-3**：红面失败定位粒度与 G7R 不同——本 run 报 test 声明行（`:56`/`:68`）+ `client_exited`，G7R 为测内行（`:96` waitForURL/`:139`）；原始值全部如实入卷可自行对差，「逐面同形」主张在 spec×计数×时长×class 粒度成立且红①张力已显式登记，承面不受影响。
- **OB-FFP-4**：见 §一 Provenance 观察（peer 原始/镜像 tree 差 = 本席段落镜像并入，benign；授权链三重一致承重）。

## 八、中文三行摘要

1. F-F EXEC 收据 `3da3f0cb` 包完整性成立：恰 2 收据 md、零产品码/SSOT/Key、wrapper blob `13dbfc43` 四点复算全等（withhold 零触碰）、本席 PRE/RE-PRE 段逐字节随卷、RE-PRE 双 PASS（`f7074586`/`23e99856`）早于 exec 授权链成立。
2. 甄别有效性成立（核心）：最后全 ok 快照 17:48:50.659Z 系拆除前捕获（内容自证：快照读得 1.015s 前新建 failed 行）；`adaptive_role_route_missing` 未预列值域按 §5.2 处置 + 码面归类 H0-alt-5·d 登记（锚点 adaptive-role-resolve.ts:57-62 等全中、未扫入 catch-all、非证伪分支）；「与 H0-alt-5 一致 ≠ 已证」与红①排除（job_route 未扩查、留 route 侧另刀）双纪律守住；C-HA-FF-3 兑现（8 轮仪器错误如实记 error 零空读零备选）。
3. 判 **PASS**（mw-e2e-ha 半签）：0 Blocker，4 OB 非阻断（时区呈现/措辞强度/红面定位粒度/镜像 provenance），4 Conditions 随卷；live=2/200、Pins 零翻转、g7SuiteGreen=false、trio OPEN 保持；本 PASS ≠ H0-alt-5 定谳终局 ≠ 修复授权 ≠ trio 翻绿。

alone ≠ dual：本 PASS 仅为 mw-e2e-ha 半签，不代签并行 peer mw-model-op；peer 独立裁决，dual 以协调方合卷为准。本审 0 prove run · 0 live · 0 Key 值读取 · 0 coding · 0 产品/SSOT 触碰 · 禁 push。本 PASS ≠ H0-alt-5 定谳终局 ≠ 修复 ≠ trio 翻绿 ≠ g7SuiteGreen=true ≠ EXEC 续授权。

Verdict: PASS
