# Harness — QGEN-P2 · **GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀**（env 混杂排除 → 定值复跑 → 归因重裁 · 三步法 · docs REQUEST · `draft:awaiting_pre_exec_dual` · ≠ 修复 ≠ 归因定谳 ≠ 行翻转）

**Pins（文首照抄 · 原值全抄 · 未动）**: `haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · **PG-retained** · **公开 DELETE=503** · **`g7SuiteGreen=false`** · **`actualSpendCny=null`**

**Status**: **`draft:awaiting_pre_exec_dual`**（docs REQUEST only · 本 turn 零实跑零 live 零 Key 加载零 DB 连接 · Ban coding · Ban prove 执行 · Ban push · Ban fake green · Ban `g7SuiteGreen=true` · Ban retry-to-green（**复跑=判别实验非翻绿** · 每跑有假设+判读+反例 · 沿 FLK 预注册先例）· Ban 碰产品码（`prompts.ts`/validator/`question-generation.ts` 全族——**归因≠修复 · 修复另刀**）· Ban 混杂未排除前下产品结论 · Ban 碰 G7X 尾段死亡调查线 · Ban 关 `GAP-G7W-QGEN-SCHEMA-VALIDATION` 行 · Ban 改共享 SSOT · Ban self-approve · alone ≠ dual · 本 commit 不预claim 任何 post-commit EXIT）
**Date**: 2026-10-07
**Line**: **QGEN-P2**（backlog 行 `GAP-G7W-QGEN-SCHEMA-VALIDATION` **P2 OPEN** @ `gap-bug-backlog.md:109` · G7W nail `209f71c714157d167b88ca6c6137972919512f80` 立行 · **P2 优先级低于 `GAP-G7W-API-TAIL-DEATH` P1 尾段面** · 行原文明钉「复验门刀排队（P2 · 非修复授权 · 非归因定谳）」——本刀即该复验门刀的指名 REQUEST）
**授权链**: G7W EXEC 表外读数登记（`schema_validation_failed ×2` · EXEC `7db84c18`≡origin 孪生 `a4e49b8a` · Receipt 02 §表外读数登记）→ G7W post-dual BOTH PASS（mw-model-op `4eae75c9`≡origin `3000192c` C-MO-P1 裁决：独立立行 P2+复验门 · 不并入 G7T 残余行不并入 `:107`）→ coordinator G7W nail `209f71c7`（backlog `:109` 立行 + OB-3 复验门落字）→ **本 REQUEST（docs-only）→ 预执行双审（mw-model-op + mw-e2e-ha）→ meetwise（协调方）EXEC 授权（env 钉值+判别复跑定值一次成型）→ EXEC（env 钉值+判别复跑）→ post 双审 → meetwise（协调方）授权 nail**。双审 PASS ≠ 本 stub 自批 ≠ EXEC 授权 ≠ 归因定谳 ≠ 行翻转。
**输入事实（只读在案引用 · 行原文+三收据已读）**：
- **行原文（`gap-bug-backlog.md:109` · @`209f71c7` 立行 · 锚点子句摘引）**：`ai_model_invocation.error_code='schema_validation_failed' ×2`（00:22:50–53 · journey start ~3s 内 · 此后不再增）· 写入方 `packages/ai-runtime/src/invoke.ts:711-712`（`validated.stage==='schema'`）· `packages/domain/src/question-generation.ts:39/:46` 列入 MALFORMED 族映射 `schema_invalid`——**被 question-generation MALFORMED graceful path 吸收**（旅程随后 succeeded 增至 5 · interview completed · **致命性未定谳**）；与 G7T p.v2（`430d4c84` route-classify 面 zero-validator-change）关系=同机制族不同操作面（两面无因果通道——post-dual mw-model-op 裁决，不并入 G7T 残余行不并入 `:107`）；**OB-3 复验门**：`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset 混杂未排除前 **Ban 归因产品 prompt 质量**（端点/模型默认值相关输出 schema 偏移候选 · G7U 收据口径 `dashscope-cn-beijing`/`qwen-plus` 与本 run unset 有差）；复验路径=**env 口径统一 → 定值复跑 → 归因重裁** · 是否产品刀/是否换定值归协调方裁。
- **三收据（`receipts/g7w-golden-api-discriminator/` · EXEC `7db84c18`）**：`00-summary.md`（OB-3 仪器披露 #3：本机 loader 仅导出 `MODEL_API_KEY`——`MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset；与实验二读数的联合解释力交协调方裁）· `01-exp1-golden-coldstart.md`（env 透传链码面亲读：`run-e2e-isolated.mjs:1950` `inheritedEnv={...process.env}` 仅剥离云凭据 denylist · `MODEL_API_KEY` 存活）· `02-exp2-cmd1-sidecar.md`（读数原文：00:22:50–51 首个 failed `schema_validation_failed` 落账 → 00:22:53 累计 ×2 此后不再增 → succeeded 增至 5 · interview completed · `ai_invocation_trace=5==succeeded` persistTrace error 旁路；sidecar 机制=SELECT-only 白名单 + 1000ms + `.tmp/` 不入 git + withhold 读 DB 不读 stderr）。
- **混杂 delta（码面+收据联合在案）**：G7W run（unset）下解析默认值=profile **`deepseek-cn-public`**（`text-endpoint-config.ts:77` `env.MODEL_ENDPOINT_PROFILE?.trim() || 'deepseek-cn-public'`）+ model 缺省 **`qwen-plus`**（`:67` F4 fix）；G7U/G7S trio 基线口径（生产 parity 口径 · 协调方既授权配对值）=**`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` × `MODEL_NAME=qwen-plus`**（`receipts/gap-red1-timing-face/01-cmd1-iso.md:27` G7U CMD1 · `receipts/gap-begin-snapshot-supply-fix/00-summary.md:30` G7S）——**两面端点 host 不同**（`api.deepseek.com` vs `dashscope.aliyuncs.com/compatible-mode/v1` · `text-endpoint-config.ts:40-43` 注册表）。freelier 守卫旁路确认：`g7-freetier-reprove-guard.ts:103`（`G7_FREETIER_REPROVE==='1'` 才启用）·`:135`（启用才 pin `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME`）· wrapper `:1990/:2000`（仅 set 时透传）——G7W run 该 flag unset → 守卫未介入。
**Base**: `origin/feat/mysql-schema-skeleton` **`fe218b7a`**（full `fe218b7aecaebda92f3f1ede7dd3b77eb6059cd9` · fetch 后实测 tip · 满足 ≥`fe218b7a` · G7W EXEC `10e25f38`→`fe218b7a` 间产品码零 diff——`e2e/full.e2e.ts` blob `7d65d0f3` 前后全等 · 唯一 tracked 非文档改动=`apps/web/e2e-ui/recruiting-bound.spec.ts`（G7V UI 面校准 · **不在 `e2e:isolated` HTTP full E2E 面**）· 实跑 code SHA 以 EXEC 期 worktree HEAD 实测为准）· worktree `/Users/miaole/Desktop/golucky/meetwise-line-qgen` · branch `line/qgen-schema-env-recheck`
**Retained（本刀零翻转）**: `GAP-G7W-QGEN-SCHEMA-VALIDATION` **P2 OPEN**（`:109` 行状态不翻——重裁结论=行内更新建议归协调方 nail · Ban 本刀关行）· `GAP-G7W-API-TAIL-DEATH` **P1 OPEN**（G7X 尾段死亡调查线 · **非本刀面 · 零触碰 · 该线 Ban 归因本面，互不越界**）· trio **OPEN**（G7U 真测 **1/1/1** retained）· G7W 残红②挂起 · 残红① · Disclosure-1 OPEN · `GAP-G7K-API-REDS` **P1 OPEN**（`:107` 不翻）· G7T 残余行（不并）· **`g7SuiteGreen=false`** · **`actualSpendCny=null`**

---

## 0. 本 turn 只读纪律声明

本 REQUEST 设计**零实跑、零 live 调用、零 Key 加载、零 DB 连接、零产品码改动、零 spec 改动、零 wrapper 改动、零 SSOT 改动**，证据全部来自只读：(a) 本 worktree git 只读源码亲读（行号一律 @`fe218b7a`；关键码面 blob `git hash-object` 亲算在卷 §2）；(b) G7W nail `209f71c7` 行原文 + `receipts/g7w-golden-api-discriminator/` 三收据引用；(c) G7U/G7S 收据 env 口径锚引用（`gap-red1-timing-face/01-cmd1-iso.md:27` · `gap-begin-snapshot-supply-fix/00-summary.md:30`）；(d) G7T v2 `430d4c84` commit 面引用。不发明任何未在案明细；码面行号 EXEC 期按当 tip 重核回填。**归因重裁结论无论落在哪支，如实入收据（Ban 定谳压力 · Ban 判读表外值域就地 reinterpret）。**

## 1. 范围 = 三步法（env 口径统一 → 定值复跑 → 归因重裁 · 沿 FLK 预注册先例：每跑假设 + 判读 + 反例）

> **预注册先例**：FLK `gap-flake-rootcause-investigation` 刀 + G7W 双甄别刀先例——每实验预注册假设/判读/反例、结论无论定位与否如实入收据。本刀复跑=**判别实验非翻绿**：红绿读数都不冲销任何在案真测（G7W exp2 `×2` 读数 · G7U trio 1/1/1 · `:107` P1 OPEN 全 retained）；**Ban retry-to-green 式重跑**——追加 run 仅限预注册分支触发（本刀预注册 N=3 一次成型 · 无事后加跑 · 无择优）。

### 1.1 第一步：env 口径统一（混杂变量钉成定值）

**判别对象（混杂本体）**：G7W exp2 run 的 `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` unset（OB-3）vs G7U/G7S trio 基线（生产 parity 口径）的定值——unset 时解析默认值落 `deepseek-cn-public`（`text-endpoint-config.ts:77`）→ 端点 host 变为 `api.deepseek.com`，与 trio 基线 `dashscope-cn-beijing`（`dashscope.aliyuncs.com/compatible-mode/v1`）**非同端点**；模型名虽同落 `qwen-plus` 缺省（`:67`），但端点身份差异已构成输出 schema 偏移的候选混杂（行原文点名）。**口径统一=把运行 env 恢复到 trio 基线口径再复跑，使「G7W-era unset 面」与「trio 基线面」唯一差异变量收敛为 env 本身。**

**EXEC 钉值（定值 · 一次成型 · 协调方授权落字）**：

| 变量 | 钉值 | 注入路径 | 依据 |
|---|---|---|---|
| `MODEL_ENDPOINT_PROFILE` | **`dashscope-cn-beijing`** | 与 loader 同 shell `export`，先 `source` loader 后 export，再起 `pnpm run e2e:isolated`；进程链继承=`run-e2e-isolated.mjs:1950` `inheritedEnv={...process.env}`（仅剥离云凭据 denylist `:1973` · `MODEL_*` 存活——G7W Receipt 01 透传链亲读在卷） | G7U CMD1 收据 name-only 探针原值（`gap-red1-timing-face/01-cmd1-iso.md:27`）· G7S 同口径（`gap-begin-snapshot-supply-fix/00-summary.md:30`「协调方既授权值」）=生产 parity profile |
| `MODEL_NAME` | **`qwen-plus`** | 同上（同 shell 同 export） | 同上两收据 · 与解析缺省一致（`:67`）——钉值=把缺省变显式，消除「缺省漂移」自由度 |
| `MODEL_API_KEY` | **不钉值不换值**（保持原值） | **只经进程环境**：`source ~/.meetwise-secrets/load-model-api-key.sh`（loader 唯一授权路径 · 本机 loader 仅导出 `MODEL_API_KEY`——G7W 三收据 OB-3 口径）· **收据/日志/commit 一律 name-only**（`MODEL_API_KEY=set`） | Key 卫生硬 Ban：Ban `.env*` · Ban 值/fingerprint 入树 |
| `G7_FREETIER_REPROVE` | **unset（守卫不介入）** | 探针如实记录 name-only | `g7-freetier-reprove-guard.ts:103/:135/:414`——若 set 会覆盖 pin 值（`:135-137`），与本刀定值冲突 |
| 其余 `MODEL_*`（`MODEL_BACKUP_API_KEY`/`MODEL_TEST_TRANSPORT_OVERRIDES`/`G7_FREE_*` 等） | 如实现状 | 探针 name-only 逐项记录（set/unset · 不记值） | 备用端点开关 `:94-:99` · transport override 缝 `rejectTextTransportOverride` |

**环境探针（每 attempt 跑前+跑后各一次 · name-only 入收据）**：`MODEL_API_KEY` set/unset · `MODEL_ENDPOINT_PROFILE` 值（钉值本身非 Key 非秘密 · 如实记）· `MODEL_NAME` 值 · `G7_FREETIER_REPROVE` unset · `MODEL_BACKUP_API_KEY` set/unset · `MODEL_TEST_TRANSPORT_OVERRIDES` unset · `.env*`（根 + `apps/*`）全 ABSENT 探针。**探针与实际跑 env 同 shell 同源**；Ban 愿望式记录（记实不记应）。

### 1.2 第二步：定值复跑（同一 journey-start 面 · N=3 预注册）

- **对象面**：`pnpm run e2e:isolated`（wiring `package.json:278` blob `0afb3bd2` = `node scripts/run-e2e-isolated.mjs e2e:prove`）——G7W exp2 `schema_validation_failed ×2` 的原始产生面（journey start ~3s 窗）。N=**3**（预注册一次成型 · ≤5 上限内 · 奇数样本）：同 committed SHA、同命令、同钉值、同判读仪表 ×3。**预期 EXIT=1（尾段死亡 retained）≠ 判别失败**——甄别成功判据=sidecar 快照捕获 §读取清单读数（G7W exp2 双向契约同款）；尾段红属 G7X 调查线面，本刀零触碰零归因。
- **判读仪表（沿 F-F §1.2-A → G7W exp2 三代在卷机制 · 零 wrapper diff）**：sidecar 只读探针监测端口行 `run-e2e-isolated.mjs:2310` → 宿主 TCP 连隔离 PG（容器固定测试凭据 · 非模型 Key）→ 周期 **1000ms**（EXEC 定值）→ 快照追加 `.tmp/qgen-env-recheck/`（**不入 git**）→ wrapper `finally` 拆除容器前最后一份成功快照即证据。**仪器基线改进承卷**（G7W post-dual C-MO-P4）：sidecar 挂 `client.on('error')` 兜底（OB-2 拆除伪影不复现）；逐查询执行状态 ok/error 纪律沿 F-F C-HA-FF-3（报错≠空读 · 仪器错误不得改判）。
- **读取清单（SELECT-only 白名单 · 全列名按当 tip migrations 重核 · Ban `output` 列族）**：

```sql
-- (1) 判别主读：模型调用账本 error_code 分布（G7W exp2 (5) 原样）
SELECT service, status, error_code, count(*)
  FROM ai_model_invocation GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 30;
-- (2) 吸收路径旁证：面试终态（graceful path 吸收=completed 可达）
SELECT status, count(*) FROM interview GROUP BY 1;
-- (3) 供给链旁证：job 全 done + last_error（G7W exp2 (1) 原样 · 表名=job_application 已纠偏承卷）
SELECT id, kind, status, attempts, last_error, created_at
  FROM interview_job ORDER BY created_at DESC LIMIT 20;
-- (4) trace 旁证：persistTrace 仅 !error 落（invoke.ts:739）→ trace 数==succeeded 数
SELECT count(*) FROM ai_invocation_trace;
-- (5) application 状态（journey 推进旁证 · 表名=job_application@0005:20 纠偏承卷）
SELECT status, count(*) FROM job_application GROUP BY 1;
```

- **每跑读数三元组（判读仪表读出 · 全记录 Ban 删改）**：**R-A** 判别主读=`ai_model_invocation` 中 `service=interview.question-generation.v1`（registry `:69` operationId）面 `error_code='schema_validation_failed'` 计数（含 0）；全 service 面 error_code 分布全录。**R-B** 吸收路径=interview 终态 + job 全 done + last_error + trace==succeeded（**旅程是否照旧 succeeded 递增至 completed**）；任一 run 旅程死于 generation 面 → 致死性证据如实记（不定谳）。**R-C** run 形状=EXIT 原值 + `E2E_FAILURE_CLASS` + machine receipt `durationMs`（尾段红 expected）。
- **七字段逐 attempt 全记录**：CMD 原文（含 env 钉值逐字）· EXIT 原值 · 起止时间戳（UTC）· 实跑 code SHA · worktree+branch · 环境探针（§1.1 全项）· 判读三元组。`EXIT`/`E2E_FAILURE_CLASS`/machine receipt（`.tmp/e2e-receipts/*.json`）/快照 log 四来源交叉一致才可引用；**全部 attempt 全记录，Ban 删除/覆盖/择优**。
- **预算（est-not-counter）**：每 journey 观测口径 ≤7 次模型调用（G7W exp2 账本实测 succeeded 5 + failed 2）× N=3 → **est ≤24 ≤ 任务帽 25 ≪ 硬帽 200**；超限即停如实记中止（不洗 not_run）；**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）；DB 直读用容器固定测试凭据（非模型 Key）。

### 1.3 第三步：归因重裁（预注册判读表 · 「与 X 一致」≠「X 已证」）

**判据**：unset 混杂排除后（钉值 trio 基线口径 ×3）`schema_validation_failed` 是否复现。

| 判读分支 | 读数形状 | 归类（行内更新建议措辞 · Ban 就地改行） | 反例/边界 |
|---|---|---|---|
| **J-R1 复现成立** | ≥1/3 run 在钉值口径下 question-generation 面现 `schema_validation_failed` ≥1 | **产品 prompt/validator 面候选**（混杂已排除仍现 · 频率/非确定性按实测如实记）——修复一律**另刀**（产品刀独立 REQUEST+双审+协调方授权）；行内更新建议=「OB-3 门已过 · 复现在卷 · 产品面候选成立（P2 保留）」 | 单一 run 不定谳全称（3-run 样本限如实）；全 3 run 都复现也只支持「候选」非「缺陷定谳」——定级/立产品缺陷行归协调方 |
| **J-R2 复现不成立** | 3/3 run question-generation 面 `schema_validation_failed`=0 | **env 特异性归因候选**（unset→`deepseek-cn-public` 缺省端点身份=区分变量候选）——行内更新建议=「OB-3 门已过 · 定值口径零复现 · 归因倾向 env 特异 · 产品 prompt 质量缺陷主张不成立（样本限内）」 | **Ban 定谳「永不复现」**（沿 G7W 残红②措辞纪律）；Ban 反向定谳「产品 prompt 无缺陷」（全称主张超出样本）；G7W-era unset 面 `×2` 读数 retained 不冲销 |
| **J-R3 仪器缺口** | sidecar 窗口错失 / 白名单查询执行报错 / 快照未捕获 | **仪器缺口如实登记** → 回协调方（Ban 私自补跑 · Ban 据缺失读数定谳任一分支） | 逐查询 ok/error 纪律：报错≠空读 |
| 值域外读数 | 钉值口径下现**其它** error_code（provider_rejected/timeout/…）或 journey 死于 generation 面 | **判读表外如实另记回协调方（Ban 就地 reinterpret）**；J-R1 判据仅对 `schema_validation_failed` 本码成立 | 致死性子读数（R-B）两分支都只**记录**——致命性定谳权归协调方（行原文「致命性未定谳」零翻转） |

**交叉互证规则**：R-A 主读必须与 R-B/R-C 联合判读，任何单一读数不得单独定谳；G7W-era `×2`（unset 面）仅作历史锚引用不作本刀判读样本；**本刀产出=行内更新建议（J-R 措辞），非行翻转、非归因定谳收尾、非修复授权**——行状态翻转与后续处置（产品刀立项/换定值/关行建议）全归协调方 nail。

## 2. 码面锚（blob 亲算 @`fe218b7a`）

| 锚 | file:line | blob | 内容 |
|---|---|---|---|
| error_code 写入方 | `packages/ai-runtime/src/invoke.ts:711-712` | `6668eff7` | `validated.stage==='schema'` → `'schema_validation_failed'`（行原文锚 · tip 复核恰对） |
| MALFORMED 族吸收 | `packages/domain/src/question-generation.ts:39`（正则）· `:46`（`→ 'schema_invalid'`）· `:50`（`provider_malformed`） | `3e27164b` | graceful path 分类面（行原文锚） |
| 吸收调用点 | `apps/worker/src/adaptive-interview-service.ts:161` | —（机制引用） | `unavailableGeneration(classifyQuestionGenerationError(out.error))` 优雅降级非 throw |
| 操作注册面 | `packages/ai-runtime/src/model-operation-registry.ts:69` | `63af556f` | `interview.question-generation.v1`（**与 G7W REQUEST 时代 blob 全等=已清面零触碰自证** · 非本刀触碰面） |
| profile 缺省 | `packages/ai-runtime/src/text-endpoint-config.ts:77`（`deepseek-cn-public`）· `:67`（model 缺省 `qwen-plus`）· `:40-43`（profile 注册表 host） | `005c68cc` | **混杂 delta 的解析链承重锚**：unset → `api.deepseek.com` ≠ trio 基线 `dashscope.aliyuncs.com/compatible-mode/v1` |
| freetier 守卫门 | `packages/ai-runtime/src/g7-freetier-reprove-guard.ts:103`（gate）· `:135`（pin 覆盖点）· `:414`（调用门） | `4e75fae7` | `G7_FREETIER_REPROVE==='1'` 才介入——unset 时钉值不被覆盖 |
| env 继承链 | `scripts/run-e2e-isolated.mjs:1950`（inheritedEnv）· `:1973`（denylist）· `:1990/:2000`（freetier 透传）· `:2310`（端口行） | `13dbfc43` | **与 G7R/G7U/G7W 冻结钉全等**——零 diff 机检承重锚 |
| wiring | `package.json:278`（`e2e:isolated`） | `0afb3bd2` | 判别复跑命令面（=G7W exp2 CMD1 同体） |
| CMD1 面 identity | `e2e/full.e2e.ts` blob `7d65d0f3` | `7d65d0f3` | 与 G7W EXEC 时代全等（`10e25f38`→`fe218b7a` 零 diff）——跨时代读数可比性的码面前提 |

## 3. 边界（硬 Ban 清单）

1. **Ban 碰产品码（归因≠修复 · 修复另刀）**：`prompts.ts`（G7T v2 面）/ validator / `question-generation.ts` / `invoke.ts` / `adaptive-interview-service.ts` / registry 全族零触碰零「加固」零校准；EXEC 全程 tracked 树零改（收据 commit 除外 · 双 stub append-only 除外）；prompt/validator 修复如归因指向，一律独立 REQUEST+双审+协调方授权。
2. **Ban 归因未排除混杂前下产品结论**：本刀即 OB-3 门的满足实验——门内（EXEC 前与 EXEC 中）Ban 任何「产品 prompt 质量缺陷/无缺陷」措辞；结论只按 §1.3 判读表落「候选/倾向/更新建议」措辞；Ban 定谳压力 · Ban 判读表外值域就地 reinterpret。
3. **Ban 碰 G7X 尾段死亡调查线（`GAP-G7W-API-TAIL-DEATH` P1）**：该线 Ban 归因本面，本线 Ban 归因彼面，互不越界——复跑预期 EXIT=1（尾段红）原值记账即止，**零尾段断言定位、零 driver 埋点、零 withhold 契约讨论**；尾段面全部处置权归该线。
4. **Ban 关 `GAP-G7W-QGEN-SCHEMA-VALIDATION` 行**：`gap-bug-backlog.md:109` 行状态 P2 OPEN 零翻转——归因重裁结论=**行内更新建议**交协调方；行翻转（含 OPEN→CLOSED、洗 covered）=协调方 nail 专属。
5. **Ban 改共享 SSOT**：`gap-bug-backlog.md` / `execution-master-checklist.md` / coverage matrix / sibling 归档（G7W/G7U/G7S/G7T/G7K/G7R/F-F 收据 lifecycle）全零改写；本刀新增文件仅限 harness+slice+双 stub（EXEC 期新增仅收据目录）。
6. **Ban withhold 契约触碰**：读 DB 不读 stderr；探针与子进程 stdio 零接触；wrapper `13dbfc43` 前后全等机检强制；Ban `ai_model_invocation.output` / `ai_invocation_trace.output` 列族读取；零写语句。
7. **Ban retry-to-green / Ban masking / Ban 破坏性注入**：复跑=判别实验非翻绿——读数不冲销 G7W exp2 `×2`、G7U trio 1/1/1、任何在案真测；每跑预注册假设+判读+反例；N=3 一次成型 Ban 事后加跑/择优；Ban 伪造状态/Ban 清 BUILD_ID/Ban 降资源/Ban 杀进程；Ban 私自追加 unset 对照臂（如需对照臂=协调方另授权另预算）。
8. **Ban Key 物料越界 / Ban self-approve / alone ≠ dual**：模型 Key 只经进程环境（`~/.meetwise-secrets/load-model-api-key.sh` loader source · name-only）；Ban `.env*` 读写；Ban 值/fingerprint 入 receipt/log/commit；DB 直读用容器固定测试凭据。

## 4. prove 方案（EXEC 期 · 预执行双审 BOTH PASS + 协调方授权后方可行）

1. **前置**：pre-exec dual BOTH PASS（mw-model-op + mw-e2e-ha）→ 协调方 EXEC 显式授权（定值一次成型落字：§1.1 钉值表 + N=3 + sidecar 1000ms + 快照落点 `.tmp/qgen-env-recheck/`）→ 重新 `git fetch origin` 重核 tip ≥`fe218b7a` → 独立 worktree + `pnpm install --frozen-lockfile`（EXIT 记录）。
2. **逐 run 执行序 ×3**：环境探针（跑前）→ `source ~/.meetwise-secrets/load-model-api-key.sh` → `export MODEL_ENDPOINT_PROFILE='dashscope-cn-beijing' MODEL_NAME='qwen-plus'` → sidecar 起（端口行 `:2310` 触发 · 1000ms）→ `pnpm run e2e:isolated` → 收尾 → 环境探针（跑后）→ 判读三元组 R-A/R-B/R-C 落字 → 七字段入台账。**预期 EXIT=1 ≠ 判别失败**（§1.2）；三 run 间零变更（同 SHA 同命令同钉值）。
3. **机器机检**：§2 锚 blob pre/post 全等机检（至少 `invoke.ts`/`question-generation.ts`/`text-endpoint-config.ts`/`g7-freetier-reprove-guard.ts`/wrapper/registry/package.json 七锚）；EXEC 全程 `git status --porcelain` tracked 零改；收据三文件 `sk-*`/`Bearer` 扫描零命中。
4. **收据落点**：`ai-docs/delivery/receipts/qgen-schema-env-recheck/`——per-run 收据 + `00-summary.md`（判读三元组 ×3 + §1.3 判读分支落字 + 行内更新建议措辞 + Pins/Retained 原值 + `g7SuiteGreen=false`/`actualSpendCny=null` 保持声明）。SSOT/evidenceOfRecord 登记**留 nail 阶段**。
5. **EXIT 后路由**：J-R1 → 产品 prompt/validator 面候选交协调方裁（修复另刀）；J-R2 → env 特异性归因建议交协调方裁（是否行内更新/是否关行建议=nail 专属）；J-R3/值域外 → 如实回协调方；致死性子读数（R-B）两分支随收据上交，定谳权归协调方。post 双审（mw-model-op + mw-e2e-ha）→ meetwise（协调方）授权 nail。

## 5. EXIT 契约（双向）

- **判别完成（任一分支如实入收据）≠ 修复 ≠ 归因定谳收尾 ≠ 行翻转 ≠ trio 翻绿 ≠ `g7SuiteGreen=true`**——本刀只产出判别读数与行内更新建议。
- 红绿 EXIT 原值记账（expected EXIT=1 retained 记录 · 不冲销任何在案台账）；est 超限即停如实记中止；仪器错失走 J-R3 回协调方 Ban 私自补跑。
- 本 REQUEST（docs turn）不预claim 任何 post-commit EXIT、不预claim 复现与否、不预claim 归因分支。

## 6. Non-claims

Not a pass · not run（本 REQUEST 零实跑）· not fixed · not coding · not 归因定谳（三分支读数未产生 · 本 turn 只有设计）· not 产品 prompt 质量缺陷主张 · not 产品 prompt 无缺陷主张 · not 致死性定谳（「致命性未定谳」零翻转）· not G7X 尾段死亡归因（该线零触碰）· not `GAP-G7W-QGEN-SCHEMA-VALIDATION` 关行/翻转（P2 OPEN retained）· not G7T 残余并线（两面无因果通道裁决承卷）· not trio green（1/1/1 retained）· not suite green · not HA · not covered · not `releaseEvidence=true` · not nail · not backlog/SSOT 翻转 · not live（本 turn）· not coordinator authorize · `g7SuiteGreen=false` · `actualSpendCny=null` · alone ≠ dual

---
*Harness · QGEN-P2 · GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门刀 · 2026-10-07 · `draft:awaiting_pre_exec_dual` · docs-only · 三步法=env 口径统一（`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` × `MODEL_NAME=qwen-plus` trio 基线钉值 · loader 只载 Key name-only · unset→`deepseek-cn-public` 缺省端点=混杂本体在案）→ 定值复跑（CMD1 同体 journey-start 面 N=3 预注册 · sidecar SELECT-only 白名单 · R-A/R-B/R-C 三元组）→ 归因重裁（J-R1 复现=产品面候选 · J-R2 零复现=env 特异候选 · J-R3 仪器缺口 · 结论=行内更新建议非翻转）· 复跑=判别实验非翻绿 · Ban 产品码/Ban 未排除混杂下产品结论/Ban 碰 G7X 尾段线/Ban 关行/Ban 改 SSOT · est ≤24 ≤25 ≪ 硬帽 200 · STOP*
