# Receipt 02 — 实验二 · CMD1 api 面 sidecar 甄别（G7W EXEC · `pnpm e2e:isolated` ×1 + sidecar 直读隔离 PG · EXIT=1 class=api 38013ms · J-A1~A6 对称定谳）

**Line**: G7W · **Date**: 2026-10-08（UTC）· **worktree/branch/实跑 SHA**: 同 Receipt 01（`10e25f38` · tracked 树零改）

## 七字段

| 字段 | 值 |
|---|---|
| CMD 原文 | `pnpm run e2e:isolated`（wiring `package.json:278` blob `0afb3bd2` tip 复核不变 · = `node scripts/run-e2e-isolated.mjs e2e:prove`） |
| EXIT | **1**（machine receipt `.tmp/e2e-receipts/2026-10-08T00-22-39…json`：outcome=failed · exitCode=1 · **failureClass=api** · **durationMs=38013** · assertionCount=null · startedAt `2026-10-08T00:22:39.853Z` → finishedAt `00:23:17.866Z` · reviewLedger=2 capability skip（image_ocr_unavailable / voice_unavailable · 常规）· sourceDigests 含 `e2e/full.e2e.ts sha256 f55f57f3…`（与本树 `shasum -a 256` 亲算全等）） |
| 时间戳（UTC） | wrapper 起跑 ~00:22:34（sidecar 启动同秒）→ receipt 00:22:39.853 → 00:23:17.866 |
| 实跑 SHA | `10e25f38`（工作树内容同一 · EXEC 前后 tracked 树零改 + 三钉 blob 前后全等机检） |
| Key presence（name-only） | `MODEL_API_KEY=set`（loader source）· `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset（**OB-3** 同 Receipt 01 · 如实登记）· `.env*` 全 ABSENT |
| 关键输出 | `E2E_FAILURE_CLASS class=api` · `ISOLATED_POSTGRES_OUTPUT_WITHHELD` · **与 G7S CMD1（38428ms）/ G7U CMD1（40560ms）/ G7U CMD3 内层（37904ms）同形同量级**（38.0s 落 37.9–40.6s 簇正中） |
| 预算 | **live=7 次（DB 账本实测读数非计数器**：`ai_model_invocation` 成功 5 + 失败 2 · 见判读）≤ ≤10 口径 · `actualSpendCny=null` |

## EXEC 定值兑现（协调方落字）

| 定值 | 兑现 |
|---|---|
| sidecar 周期=1000ms | **兑现**——35 tick 全程 1000ms（00:22:42.740 → 00:23:16.801 · receipt 终点前 1.06s 仍有成功快照） |
| 快照落点 `.tmp/g7w-sidecar/`（不入 git） | **兑现**——`.tmp/g7w-sidecar/snapshots.log` 27714B · 35 tick · sidecar 本体 `.tmp/g7w-sidecar.mjs` 不入 git |
| **C-MO-1/C-HA-1 表名纠偏**：白名单 (8) 实表=`job_application` | **兑现**——`packages/db/migrations/0005_*:20` 实测 `CREATE TABLE IF NOT EXISTS job_application`（`status text NOT NULL DEFAULT 'invited' CHECK (status IN ('invited','interviewing','completed'))` 列存在亲读）→ 甄别 SQL 已按实测逐字修正为 `SELECT status, count(*) FROM job_application GROUP BY 1`；**纠偏必要性实证**：tick-1 同族 `relation … does not exist` error 形状在卷——若沿原 `FROM application` 将永久 ERROR（仪器缺口）而非空读；修正后 q8 全部 tick `ok`（含 `ok:[]` 空读合法参与判读）· 修正在本收据与 SUMMARY 双落字 |

## sidecar 机制执行（沿 F-F §1.2-A · wrapper 零 diff）

- 启动 00:22:34.704Z 监测 `.tmp/g7w-cmd1.log`（wrapper stdout 直录）→ 00:22:41.728 命中端口行 `E2E isolated PostgreSQL: meetwise-e2e-13757-1791418959851 on 127.0.0.1:61663`（`run-e2e-isolated.mjs:2310`）→ 00:22:42.740 宿主 TCP 连入（凭据=wrapper 自身固定测试凭据 `:1984-1986` 同面 · 非模型 Key）→ 1000ms 轮询 35 tick。
- **逐查询执行状态纪律（C-HA-FF-3）兑现**：tick-1 五查询 `relation does not exist` ERROR（迁移尚在途）→ tick-2 起 ok；**迁移完成后零残余 error**（9 查询全 ok 至 run 终）→ 无仪器缺口、空读均为合法 ok。
- **withhold 零触碰**：探针只读 DB（SELECT-only 白名单 · Ban `interview_job.payload` / Ban `ai_invocation_trace.output` / 零写语句）、与子进程 stdio 零接触；case 名/断言原文零回读。
- **OB-2 仪器注记（如实）**：sidecar 进程在容器拆除瞬间因 pg Client 未处理 `error` 事件（`terminating connection due to unexpected postmaster exit`）以 exit 1 退出——**拆除伪影非覆盖缺口**：崩溃发生于全窗口捕获完成之后（35/35 tick · 末成功快照 00:23:16.801，receipt 终点 00:23:17.866 前 1.06s）；崩溃路径绕过了连续失败计数器（pg Client error 事件走 reject 之外的 event 通道）——后继甄别器宜挂 `client.on('error')` 兜底（登记为仪器改进项，非本刀域）。

## DB 时间线（SELECT-only 白名单 · 35 tick · 关键读数）

| 时刻（UTC） | 读数 |
|---|---|
| 00:22:42（tick 1） | 迁移在途：5 查询 relation ERROR（ok/error 纪律如实记）· `ai_invocation_trace=0` |
| 00:22:50–51（tick 9–10） | `interview_job` 首现：**start ×2 queued**（两 interview 壳）；`interview`：**abandoned=1 + created=1**（负路径壳面试即刻弃置 + 主驱动面试创建）；`ai_model_invocation` 首现：**1 failed `schema_validation_failed`** |
| 00:22:53（tick 12） | **第 2 个 `schema_validation_failed` 落账**（累计 failed=2 · 此后不再增）；首个 succeeded 出现 |
| 00:22:56 → 00:23:05（tick 15–24） | answer jobs ×4 依次 done；`ai_model_invocation` succeeded 增至 **5**；`interview` created → **completed** |
| 00:23:05 → 00:23:16（tick 24–35） | **~11s DB 静默窗**（零新行 · 零状态迁移）——驱动在后旅程段活动 |
| 终态（tick 35 = 00:23:16.801） | `interview_job`：**6 行全 done（start ×2 + answer ×4）· attempts=1 · last_error 全 NULL**；`job_route_decision`/`job_semantic_revision`=0 行；`interview`：completed=1 + abandoned=1；`ai_model_invocation`：succeeded=5 + **failed/schema_validation_failed=2**；`ai_invocation_trace`=5（=succeeded 数 · persistTrace 仅 !error 落）；`route_consumption_event`=0 / `interview_route_snapshot`=0（主驱动为未绑岗直创面试 · route 面未被行使）；**`job_application`=0 行（全程 35 tick 恒空 · 纠偏后合法 ok 读数）** |

## 判读（J-A1~A6 对称定谳 · harness §1.2 判读表）

| 锚 | 判定 | 依据 |
|---|---|---|
| **J-A1** worker 面（last_error） | **排除** | 6 job 全 done · attempts=1 · last_error 全 NULL · 零 failed 行——F-F 值域（结构门/invoke 内部态/基建/reaper）零命中 |
| **J-A2** classify/route 面残留 | **排除（未被行使）** | `job_route_decision`/`job_semantic_revision` 零行——主驱动未绑岗直创面试，route 面不在本 run 路径（非「通过」而是「未达」· 如实区分） |
| **J-A4** 早段 | **排除** | 旅程到达终态（answer ×4 done · interview completed）——非鉴权/简历/交易早段死 |
| **J-A3**（修正读法）happy-path 下游尾段 | **命中** | 全 job done + interview completed → 死亡点在后旅程尾段；`job_application` 35 tick 恒 0 行 → **死于申请面（状态机段）之前**（report/B-side/review 尾段） |
| **J-A6** 死亡窗口 | **定位** | 末 DB 活动 00:23:05 → receipt 终点 00:23:17.866：**≈12s 尾段静默后死亡**；duration 38.0s 与 G7S/G7U 簇同量级（旅程成本 ~26s + 尾段 ~12s 恒定构成） |
| **J-A5** provider/准入面（provider_rejected/deterministic_refusal） | **值域未现** | 两注册值域零命中；**代之出现判读表未注册值 `schema_validation_failed` ×2** → 见「表外读数登记」 |

## 表外读数登记（判读表未覆盖 → 回协调方 · Ban 就地 reinterpret）

1. **`ai_model_invocation.error_code='schema_validation_failed' ×2`**（00:22:50–53 · 旅程开头 3s 内）：码面溯源（只读亲读）——写入方 `packages/ai-runtime/src/invoke.ts:711-712`（`validated.stage==='schema'` → error_code='schema_validation_failed'）；`packages/domain/src/question-generation.ts:39/:46` 将其列入 MALFORMED 族并映射 `schema_invalid`——**该失败被 question-generation 优雅路径吸收，旅程随后 5 连成功至 completed（致死性本席不定谳）**。与 OB-3（本 run `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset，与 G7U 口径有差）的联合解释力（端点/模型默认值相关的输出 schema 偏移候选）——**裁定权归协调方**（是否立 backlog 行 / 是否换定值复跑 / 是否产品刀，Ban 本席主张）。
2. **精确断言原文**：withhold 契约内不可回读（本刀读 DB 不读 stderr · case 名回读裁定权归协调方）——尾段死亡的具体断言定位以上表 J-A3/J-A6 段为界。

## 定谳（措辞纪律：「与 X 一致」≠「X 已证」· 单一读数不定谳 · 多读数联合）

**「同形不同内容」成立**：
- **形**：EXIT=1 · failureClass=api · 38013ms——落 G7S CMD1（38428）/ G7U CMD1（40560）/ G7U CMD3 内层（37904）同簇（37.9–40.6s）· `ISOLATED_POSTGRES_OUTPUT_WITHHELD` 同形。
- **内容（本 run 正面定谳）**：**供给链清白**——begin/start job 双双 done、interview completed、零 failed job、零 last_error（G7S 供给面修复 effective face 在 iso 主驱动上实测无缺）· **api 红 = 后旅程尾段死亡（report/B-side/review 段 · 申请面前）· ~12s 静默窗后 uncaught throw**。
- G7S 时点 api 红内容因容器即毁不可回溯（F-F 已登记的 `--rm` 物理限制）——本刀只能就 G7W run 内容定谳，Ban 追认 G7S 内容。
- **处置路由（供协调方裁）**：尾段断言面甄别须 withhold 契约内新形态（如 driver 侧结构化失败埋点）或契约变更裁定——均非本刀域；`schema_validation_failed ×2` 是否独立立案见上。

---
*Receipt 02 · G7W 实验二 · 2026-10-08 · CMD1 ×1 EXIT=1 class=api 38013ms（同簇）· sidecar 35 tick 全窗口 · C-MO-1/C-HA-1 `job_application` 纠偏兑现（原表名将成永久仪器错误——实证在卷）· J-A1/A2/A4 排除 · J-A3（修正）+J-A6 命中=供给链清白 + 尾段 ~12s 静默后死亡 · 表外登记 `schema_validation_failed` ×2（被 MALFORMED 路径吸收 · 致死性不定谳）· 同形不同内容成立 · withhold 零触碰 · live=7（账本实测）· `actualSpendCny=null` · STOP*
