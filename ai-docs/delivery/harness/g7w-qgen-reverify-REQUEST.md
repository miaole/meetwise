# G7W-QGEN-REVERIFY REQUEST（GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门二行使刀 · P2 · docs REQUEST · 钉死统一口径 → 定值复跑（现树）→ 归因重裁 · 前轮 env 已排除承登 · 码面/复跑 EXEC 期落卷 · 起草零实跑落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（闭合 EXEC 已行使 2026-11-05 · 起草席落卷 2026-11-05 · docs REQUEST only · 本 turn 零实跑零 live 零 Key 加载零 DB 连接 · 改动集=本卷+姊妹 tail-close 卷两 .md+cap 届值步进两 policy 脚本联动（CAP-SANCTION-2481·派单「cap 届值步进预登」随令）· docs:check EXIT=0 2481≤cap 2481 恰等+markers 五类零命中+diff 面亲跑（回执随交付报告）· pre-exec 双审两独立外席待派 · alone ≠ dual · ⛔push ⛔merge 主线 · Ban self-approve · Ban retry-to-green · Ban coding · 起草 est live=0 · `actualSpendCny=null`）

**席位**：GAP-G7W-QGEN-SCHEMA-VALIDATION 复验门二行使刀 起草席（协调方派单令「门④三块拦路之二」· 承前卷 `harness/qgen-schema-env-recheck.md` 三步法一轮全链（REQUEST→errata→EXEC `a285e4cf`→post dual BOTH PASS→nail · backlog `:807`/`:811` 行使注）· 本刀=该注裁决②「第 3 可测样本如需=新授权臂独立 REQUEST」+现树产物变化后的复验门二行使）。
**基线**：`origin/main` @ **`edda65a4`**（fetch 后亲证 origin tip=#198 merge 点 · worktree **`meetwise-g7w`**（与姊妹 tail-close 卷同树同支 · 两刀分开两卷互不并裁）· branch **`line/g7w-draft`** · 建树 docs:check 亲跑 EXIT=0 scanned 2479=cap 2479 恰等）。
**立项出处（不自建 SSOT 行——行翻面权沿例归协调方）**：①协调方派单令（QGEN 复验门刀起草 ·「env 口径统一→定值复跑→归因重裁——复验门已行使过一次（env 已排除），本刀钉死统一口径后定值复跑并按结果重裁归因」原文）；②`ai-docs/delivery/gap-bug-backlog.md`（blob `403fc48e` · 979 行）**`:111` GAP-G7W-QGEN-SCHEMA-VALIDATION 行 P2 OPEN 原文 intact**（派单令引 P2·OB-3 · 行原文零触）+ **`:807`/`:811` 复验门行使登记注**（双保留双注同值 · 「OB-3 复验门措辞更新：『已行使（2026-10-08 EXEC 定值复现在卷）』——env 混杂被排除为本失败成因」+「归因候选=产品 prompt/validator 面（候选非定谳 · **2/3 可测样本限如实**——run1 sidecar 仪器缺口 J-R3 登记）」+两席裁决②「run1 不补跑 · 第 3 可测样本如需=**新授权臂独立 REQUEST** · Ban 私自补跑」=本刀授权源）；③前卷 `harness/qgen-schema-env-recheck.md`（blob `dedd3672` · 三步法母本：钉值表/N=3 预注册/sidecar 仪表/J-R 判读表/est ≤24 口径全承之）；④**现树产物变化三件（本刀二轮的实体理由）**：刀F 有界 re-roll（`cf196a035` 2026-10-12 · PR #108 并线 · 吸收路径改形）+invoke 观测档名变化（`6b66a14cf` 2026-10-19 · span 档 `schema_retry`→`schema_invalid`）+账本隐私改形（`31e1afe1b` 2026-10-22 账本不再保存题干和报告正文）——见 §0.2；⑤**结构范本**=前卷 `dedd3672`（§1 三步法/§2 码面锚/§3 硬 Ban/§4 prove 方案形制承之·姊妹收口卷 `g7w-tail-close-REQUEST.md` §0/§1.3/§2 形制互承）。

---

## §0 现状锚（起草席亲证 · 全部 rg/Read/sed/git log/git show 实测 @`edda65a4` · 后继 pre-exec dual/EXEC 面照本节对届时 tip 再重 pin——blob 漂移如实改锚·结论不变则只更行号；行锚漂移超 ±3 且结论受影响 → §8 停止条件①）

### 0.0 防重双对表（本 turn 实测）

- `git worktree list`：`meetwise-g7w` 名下**恰 1 树**=本树；`git branch --list "line/g7w-draft"` 恰 1 命中 · 零同名。
- `ls ai-docs/delivery/harness/ | grep -E "g7w-qgen-reverify|g7w-tail-close"` 落卷前**零命中**（无同名卷）；与前卷 `qgen-schema-env-recheck.md`（一轮行使已 nail）卷名/分支名不同名、域相承不重叠（前卷=复验门一轮行使已归档 · 本卷=二行使新授权臂）；与姊妹收口卷域 disjoint（`:111` QGEN 行 vs `:110` TAIL-DEATH 行 · 双向 Ban 归因 · 沿 `:807` 注「G7X 尾段面零触碰零归因」同构互认）。

### 0.1 blob 锚表（`git ls-tree` 亲算 · 8 hex · @`edda65a4` 亲读）

| # | 文件 | blob | 关键行锚（@`edda65a4` 亲读） |
|---|------|------|------|
| 1 | `ai-docs/delivery/gap-bug-backlog.md` | `403fc48e`（979 行） | **`:111` 行 P2 OPEN 原文 intact**（行原文零触）· `:807`/`:811` 一轮行使注（双保留 · env 排除+2/3 可测样本限+J-R3+两席裁决② 授权源）· `:110` TAIL-DEATH 行（姊妹域零触） |
| 2 | `packages/ai-runtime/src/invoke.ts` | `f6102433`（era `6668eff7` → 现值 · **写入点漂移如实改锚：era `:711`-`:712` → 现 `:1168`-`:1169`**） | `:1168`-`:1169` `validated.stage === 'schema' ? 'schema_validation_failed' : ...`——**error_code 值恒等亲证**（`6b66a14cf` 只改 span 观测档名 · 本值零触） |
| 3 | `packages/domain/src/question-generation.ts` | `31079959`（era `3e27164b` → 现值 · **刀F re-roll 族落地后值**） | `:72` MALFORMED RE（`schema_validation_failed` 词面在场）· `:79` `invokeError==='schema_validation_failed' → 'schema_invalid'` · `:28`-`:33` QUESTION_GENERATION_REROLL_FAMILY（**`schema_invalid` 在族内** · 刀F 裁决④a 注释：确定性出题失败族=有界 re-roll+耗尽换 competency 共用族边界） |
| 4 | `apps/worker/src/adaptive-interview-service.ts` | `71c9a502` | `:32` MAX_DUPLICATE_REROLL=2 · **`:44` MAX_ERROR_REROLL=2（per-turn · 头注「生成调用总数 ≤3 含初诊」）** · `:711`-`:719` familyRolls seam（rerollable 判定+帽断）· `:728`-`:733` 耗尽→unavailableGeneration+`reroll: familyRolls` trajectory（`:740`-`:744` business_invalid 同形）——**吸收路径现形=有界 re-roll ×2 后 graceful · 非初败即降级** |
| 5 | `packages/ai-runtime/src/text-endpoint-config.ts` | `005c68cc`（**与前卷 era blob 恒等零漂移**） | `:77` 缺省 profile `deepseek-cn-public` · `:67` 缺省 model `qwen-plus`（F4 fix 注）· `:36`-`:40` 注册表 host（`deepseek-cn-public`=api.deepseek.com · `dashscope-cn-beijing`=dashscope.aliyuncs.com/compatible-mode/v1）——**混杂 delta 解析链承重锚原样在场** |
| 6 | `packages/ai-runtime/src/g7-freetier-reprove-guard.ts` | `4e75fae7`（**与前卷 era blob 恒等零漂移**） | `:103` gate（`G7_FREETIER_REPROVE==='1'` 才启用）· `:112` `G7_FREE_PRIMARY_MODEL || 'qwen3.8-flash'` · `:127` endpointProfile=`dashscope-cn-beijing` · `:132`-`:136` pin 函数 `applyG7FreetierReproveEnv`（`:135`-`:136` `MODEL_ENDPOINT_PROFILE`/`MODEL_NAME` pin 行 · **现树生产零调用**——全仓 grep 仅定义+单测 · GODFN-1b 组合根装配不 pin env）· `:30` `qwen-plus ∈ G7_PAID_FALLBACK_ALLOWLIST`——**守卫臂形（`G7_FREETIER_REPROVE=1`）实测口径=qwen3.8-flash（案 A 账本实证）≠ trio 基线 qwen-plus（口径分叉机读锚 · §0.2-② rev r1 机制精度勘正）** |
| 7 | `scripts/run-e2e-isolated.mjs` | `cde76fda`（era `13dbfc43` 漂移如实改锚 · withhold 契约语义零变更） | `:4015` inheritedEnv（仅剥离云凭据 denylist `:4033` · MODEL_* 存活）· `:4055`-`:4065` G7_FREETIER_REPROVE/账本臂透传 · `:4208` ISOLATED_POSTGRES_OUTPUT_WITHHELD · **`:4379` PG 端口行（era `:2310` sidecar 停靠锚 → 现值**） |
| 8 | `harness/qgen-schema-env-recheck.md` | `dedd3672` | 前卷三步法母本（钉值表/N=3/sidecar/J-R 判读表/est ≤24）+ EXEC 收据链引用（`a285e4cf`） |
| 9 | `harness/g7w-tail-close-REQUEST.md` | 本 commit 姊妹卷 | 收口刀（`:110` 域）· 本卷与其互不并裁不互代位（两刀分开两卷 · 派单令原文）· 域 disjoint 双向 Ban 互认 |
| 10 | `packages/ai-runtime/src/model-operation-registry.ts` | `f07688cb` | `:77` operationId `interview.question-generation.v1` 注册 · `:250`-`:251` profile 绑定（`dashscope-cn-beijing` 在列）——**rev r1 补锚（席1 P2-3）· §1.2 R-A 主读 service 锚 · 纳入 §2-B1 blob pre/post 全等机检** |

### 0.2 读码四项（派单任务 1 考证 · 起草席亲读定稿）

#### 0.2a · 一轮行使结论承登（`:807`/`:811` 注 · 零翻转承接）

钉值 `MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` × `MODEL_NAME=qwen-plus`（trio 基线口径）下可测 DB 面 **2/2 run 复现 `schema_validation_failed` ×2**（journey-start 窗首现→恒 2 不再增 · 吸收路径照旧 interview completed · trace=5==succeeded）→ **env 混杂已排除为本失败成因**（有效结论承登 · 本刀不重开该环）；归因候选=**产品 prompt/validator 面（候选非定谳）**；run1 sidecar 仪器缺口 J-R3 如实登记（2/3 可测）；致命性=in-sample 非致死（行原文「致命性未定谳」维持）。

#### 0.2b · env 口径分叉（本刀「钉死统一口径」的考证实体）

| 口径 | 端点 | 模型名 | 在案行使 | 机读锚 |
|---|---|---|---|---|
| trio 基线（生产 parity） | dashscope-cn-beijing | **qwen-plus** | 前轮复验门 2/2 可测样本（钉值口径）· G7U/G7S 收据 | 前卷 §1.1 钉值表 |
| 守卫臂（freetier 自由层） | dashscope-cn-beijing | **qwen3.8-flash** | 案 A LIVE 判别 run（`G7_FREETIER_REPROVE=1` · 账本 actualModel 全数 qwen3.8-flash · 案 A §9-LIVE ④） | 守卫 `:127`/`:132`-`:136`/`:112` 亲证（pin 函数现树生产零调用 · rev r1） |
| G7W-era 原始失败面 | **deepseek-cn-public**（unset 缺省） | qwen-plus（unset 缺省） | G7W exp2 `×2` 原始读数 | `text-endpoint-config.ts:77`/`:67` |

**判读**：两口径同端点**异模型名**——`qwen-plus` 与 `qwen3.8-flash` 输出 schema 行为可异（模型身份系输出 schema 偏移候选变量 · 与行原文 OB-3「端点/模型默认值相关输出 schema 偏移候选」同族）；前轮归因候选系钉值（qwen-plus）口径下成立，若二轮改走守卫臂（qwen3.8-flash）则与前轮样本异口径=归因不可比。**故本刀第一步=口径钉死统一为前轮钉值（dashscope-cn-beijing × qwen-plus）**——跨时代可比+守卫 `G7_FREETIER_REPROVE` 必须保持 unset（rev r1 机制精度勘正〔席2 P2-a〕：守卫臂形〔`G7_FREETIER_REPROVE=1`〕实测口径=qwen3.8-flash 系**案 A 账本实证** · guard 源 `:132-136` pin 函数 `applyG7FreetierReproveEnv` **现树生产零调用**——全仓 grep 仅定义+单测 · GODFN-1b 组合根装配不 pin env · `qwen-plus ∈ G7_PAID_FALLBACK_ALLOWLIST` guard `:30`——防后继席按「启用即 pin 覆盖 MODEL_NAME」已失效机制推演 · 防覆盖处方（unset）不变仍充分 · 前卷 §1.1「unset（守卫不介入）」原文承）；**换定值分支**（守卫臂口径 or 其它定值）=并陈交协调方裁（行原文「是否换定值归协调方裁」· 本刀不代裁）。

#### 0.2c · 现树吸收路径变化（刀F re-roll · 判读形状改形的实体理由）

刀F（`cf196a035` 2026-10-12 · PR #108 并线）后：`schema_invalid` ∈ QUESTION_GENERATION_REROLL_FAMILY → generation 失败=**有界 re-roll ≤2（MAX_ERROR_REROLL=2 · per-turn · 生成调用总数 ≤3 含初诊 · `:44`/`:711`-`:719`）** → 耗尽仍 `unavailableGeneration`+`reroll` trajectory provenance（`:728`-`:743`）。**前轮判读形状「恒 2 不再增」系 re-roll 落地前的单值形**——现树同失败面的 DB 计数形状可变（每 turn 失败计数 0..3 · trace/succeeded 计数随 re-roll 上行 · journey 终态=completed 或 generation 面 unavailable 均可能）→ **本刀判读按「分布+吸收终态」族判 · Ban 按旧单值形逐字节恒等判**（如实预注册 · §1.3）。

#### 0.2d · 观测面变化两件（判读仪表兼容性亲证）

①`6b66a14cf`（2026-10-19）：span 观测档名 `schema_retry`→`schema_invalid`（trace 面 · 「本层从不自动重试同键」注释）——**`ai_model_invocation.error_code` 值 `schema_validation_failed` 恒等不变**（`invoke.ts:1168`-`:1169` 亲证）→ 前卷 R-A 主读（error_code 分布）**仪表兼容有效**；②`31e1afe1b`（2026-10-22）：账本不再保存题干和报告正文（隐私改形）——R-A/R-B 计数面不受影响 · 本刀 Ban 读 `output` 列族承前卷（现值列内容已不含题干/正文 · 双重不读）。

## §1 三步法二轮（钉死统一口径 → 定值复跑 → 归因重裁 · 沿前卷预注册先例形 · 每跑假设+判读+反例）

### 1.1 第一步：env 口径统一钉死（EXEC 钉值 · 定值一次成型 · 协调方授权落字）

| 变量 | 钉值 | 注入路径 | 依据 |
|---|---|---|---|
| `MODEL_ENDPOINT_PROFILE` | **`dashscope-cn-beijing`** | 与 loader 同 shell `export`（先 `source` loader 后 export · 再起 `pnpm run e2e:isolated`）· 进程链继承=`run-e2e-isolated.mjs:4015` inheritedEnv（denylist `:4033` · MODEL_* 存活） | 前轮钉值恒等=跨时代可比 · trio 基线生产 parity 口径 |
| `MODEL_NAME` | **`qwen-plus`** | 同上（同 shell 同 export · 显式钉死消除缺省漂移自由度） | 同上 · 与 `:67` 解析缺省一致=把缺省变显式 |
| `MODEL_API_KEY` | **不钉值不换值**（保持原值） | **只经进程环境**：`source ~/.meetwise-secrets/load-model-api-key.sh`（loader 唯一授权路径）· 收据/日志/commit 一律 name-only（`MODEL_API_KEY=set`） | Key 卫生硬 Ban：Ban `.env*` · Ban 值/fingerprint 入树 |
| `G7_FREETIER_REPROVE` | **unset（守卫不介入）** | 探针如实记录 name-only | **口径分叉防覆盖**（rev r1 机制精度）：守卫臂形实测口径=qwen3.8-flash（案 A 账本实证）· guard 源 `:132-136` pin 函数现树生产零调用（全仓 grep 仅定义+单测 · GODFN-1b 装配不 pin env）· 防覆盖处方（unset）不变仍充分 · 前卷 §1.1 同款承 |
| 其余 `MODEL_*`（`MODEL_BACKUP_API_KEY`/`MODEL_TEST_TRANSPORT_OVERRIDES`/`G7_FREE_*` 等） | 如实现状 | 探针 name-only 逐项记录（set/unset · 不记值） | 前卷 §1.1 同款承 |

**环境探针（每 attempt 跑前+跑后各一次 · name-only 入收据）**：`MODEL_API_KEY` set/unset · `MODEL_ENDPOINT_PROFILE` 值 · `MODEL_NAME` 值 · `G7_FREETIER_REPROVE` unset · `MODEL_BACKUP_API_KEY` set/unset · `MODEL_TEST_TRANSPORT_OVERRIDES` unset · `.env*`（根+`apps/*`）全 ABSENT。探针与实际跑 env 同 shell 同源；Ban 愿望式记录（记实不记应）。

### 1.2 第二步：定值复跑（现树 · N=3 预注册一次成型）

- **对象面**：`pnpm run e2e:isolated`（CMD1 同体 = G7W exp2 `×2` 原始产生面+前轮 2/2 复现面）· **现树 HEAD**（含刀F re-roll+观测改形 · §0.2c/0.2d）· N=**3**（预注册一次成型 · 奇数样本 · 无事后加跑 · 无择优）· 同 committed SHA 同命令同钉值同判读仪表 ×3。**预期 EXIT 形如实记（现树主旅程绿/红均可能——tail 域形状归收口刀/POST7B 域 · 本刀零归因零定位）≠ 判别失败**——判别成功判据=sidecar 快照捕获 §读取清单读数。
- **判读仪表（沿前卷三代机制 · 零 wrapper diff）**：sidecar 只读探针监测端口行 **`run-e2e-isolated.mjs:4379`（现锚 · era `:2310` 漂移如实改锚）** → 宿主 TCP 连隔离 PG（容器固定测试凭据 · 非模型 Key）→ 周期 1000ms → 快照追加 `.tmp/qgen-reverify2/`（不入 git）→ wrapper `finally` 拆除容器前最后一份成功快照即证据。仪器纪律承前卷：`client.on('error')` 兜底+逐查询 ok/error 纪律（报错≠空读 · 仪器错误不得改判）。
- **读取清单（SELECT-only 白名单 · 全列名按当 tip migrations 重核 · Ban `output` 列族 · 零写语句）**：

```sql
-- (R-A) 判别主读：模型调用账本 error_code 分布（前卷 (1) 原样 · 值 schema_validation_failed 恒等有效 §0.2d-①）
SELECT service, status, error_code, count(*)
  FROM ai_model_invocation GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 30;
-- (R-B1) 吸收路径旁证：面试终态（re-roll 耗尽面 completed/unavailable 分布）
SELECT status, count(*) FROM interview GROUP BY 1;
-- (R-B2) 供给链旁证：job 全 done + last_error
SELECT id, kind, status, attempts, last_error, created_at
  FROM interview_job ORDER BY created_at DESC LIMIT 20;
-- (R-B3) trace 旁证：persistTrace 仅 !error 落 → trace 数==succeeded 数（re-roll 上行亦然 · rev r1 判读纪律钉明：恒等式按「设计恒等·best-effort 允差」判——invoke.ts:518 注释原文「INSERT 失败不回滚」系 UC-028 fail-open 旁路设计内 · 小失配如实记账不自动升判读异常/仪器错误）
SELECT count(*) FROM ai_invocation_trace;
-- (R-C) journey 推进旁证（表名 job_application 纠偏承卷 · :20=CREATE TABLE 语句本体口径）
SELECT status, count(*) FROM job_application GROUP BY 1;
```

- **每跑读数三元组（全记录 Ban 删改）**：**R-A**=generation 面（`service=interview.question-generation.v1` · registry operationId · 现 blob `f07688cb`）`error_code='schema_validation_failed'` 计数**分布**（含 0 · 含 reroll trajectory 对照）+全 service 面分布全录；**R-B**=吸收路径（interview 终态分布+job 全 done+last_error+trace==succeeded〔「设计恒等·best-effort 允差」判读纪律钉明（rev r1 席2 P2-c）——`invoke.ts:518` INSERT 失败不回滚 · fail-open 旁路设计内 · 小失配如实记账不自动升异常〕）——**re-roll 语义下 R-B 系「吸收终态」判读非「completed 恒等」判读（§0.2c）**；**R-C**=run 形状（EXIT 原值+`E2E_FAILURE_CLASS`+machine receipt `durationMs`）。
- **七字段逐 attempt 全记录**：CMD 原文（含 env 钉值逐字）· EXIT 原值 · 起止时间戳（UTC）· 实跑 code SHA · worktree+branch · 环境探针 · 判读三元组。EXIT/`E2E_FAILURE_CLASS`/machine receipt/快照 log 四来源交叉一致才可引用；**全部 attempt 全记录 · Ban 删除/覆盖/择优**。
- **预算（est-not-counter）**：era 每 journey 观测口径 ≤7（succeeded 5+failed 2 账本实测）；刀F re-roll 后 generation 每 turn 调用上限 ≤3 → 每 run est 以**账本实测为准**（sidecar R-A 读数=账本实测载体 · 守卫臂 unset 无 G7_RUN_COST_LEDGER 账本臂承前卷 §1.1 同款）· N=3 est 上限=任务帽内预注册（EXEC 授权落字定值 · 前轮 ≤24 形）· 超限即停如实记中止（不洗 not_run）；链累计沿 g7p6 126+前卷 ≤21+案 A LIVE 17=≈164 在案 · **硬帽 200** 口径如实另账 · 超帽即停。**`actualSpendCny=null`**（无计价数据源 · Ban invented spend）· DB 直读用容器固定测试凭据。

### 1.3 第三步：归因重裁（预注册判读表二轮 · 「与 X 一致」≠「X 已证」）

判据：统一口径钉死（§1.1）+现树（刀F 后）×3 下 `schema_validation_failed` 是否复现（按 §0.2c 形状族判）。

| 判读分支 | 读数形状 | 归类（行内更新建议措辞 · Ban 就地改行） | 反例/边界 |
|---|---|---|---|
| **J2-R1 复现成立** | ≥1/3 run generation 面现 `schema_validation_failed` ≥1 | **产品 prompt/validator 面候选维持+加强**（前轮钉值口径 2/2+本轮同口径 ≥1 · 两轮 env 排除+re-roll 吸收后仍现）——修复一律**另刀**（产品刀独立 REQUEST+双审+协调方授权）；行内更新建议=「OB-3 门两轮已过 · 定值两轮复现在卷 · 产品面候选加强（P2 保留）」 | 单 run 不定谳全称（样本限如实）；re-roll 计数放大形如实记（×2→×N 非形状冲突 · §0.2c 判） |
| **J2-R2 复现不成立** | 3/3 run generation 面 `schema_validation_failed`=0 | **归因=未闭合（候选族并列如实）**：候选=时间窗跨时代漂移（模型服务端行为）or 前轮样本特异性 or 现树产物变化副差——**Ban 定谳「已修复」**（机读甄别：无针对 prompt/validator 面的修复 commit——刀F `cf196a035`=吸收语义变更（re-roll 非修复）· `6b66a14cf`=观测档名 · 两者均非 validator/prompt 修复 · 如实判定）；行内更新建议=「定值口径二轮零复现 · 前轮 2/2 retained · 归因未闭合（候选族并列）」 | **Ban 定谳「永不复现」**（沿 G7W 残红②措辞纪律）· Ban 反向定谳「产品 prompt 无缺陷」（全称超样本）· 前轮 `2/2`+G7W-era `×2` 读数 retained 零冲销 |
| **J2-R3 仪器缺口** | sidecar 窗口错失 / 白名单查询执行报错 / 快照未捕获 | **仪器缺口如实登记** → 回协调方（Ban 私自补跑 · Ban 据缺失读数定谳任一分支） | 逐查询 ok/error 纪律：报错≠空读 |
| 值域外读数 | 钉值口径下现**其它** error_code / journey 死于 generation 面 / reroll trajectory 异常形 | **判读表外如实另记回协调方（Ban 就地 reinterpret）**；J2-R1 判据仅对 `schema_validation_failed` 本码成立 | 致死性子读数（R-B）两分支都只**记录**——致命性定谳权归协调方（行原文「致命性未定谳」零翻转） |

**交叉互证规则**：R-A 主读必须与 R-B/R-C 联合判读 · 单一读数不得单独定谳；前轮 2/2 与 G7W-era `×2` 仅作历史锚引用不作本刀判读样本；**跨时代码面可比性披露（如实）**=吸收路径已变（刀F · §0.2c）+写入点漂移（`:711`-`:712`→`:1168`-`:1169` · 值恒等）+观测档名变化（§0.2d）——判读按形状族不按逐字节恒等；**本刀产出=行内更新建议（J2-R 措辞）非行翻转 · 非归因定谳收尾 · 非修复授权**——行状态翻转与后续处置（产品刀立项/换定值/关行建议）全归协调方 nail。

## §1.3 否决清单（veto · 双审/EXEC 违反任一即 FAIL）

1. **Ban 碰产品码（归因≠修复 · 修复另刀）**：`prompts.ts`/validator/`question-generation.ts`/`invoke.ts`/`adaptive-interview-service.ts`/registry 全族零触碰零「加固」零校准——**刀F re-roll/观测改形系在树既成事实非本刀产物 · Ban 为归因叙事改码/Ban 把 re-roll 说成修复（J2-R2 机读甄别钉）**；EXEC 全程 tracked 树零改（收据 commit 除外 · 双 stub append-only 除外）。
2. **Ban 归因未钉死口径前下产品结论**：口径钉死（§1.1）=门内（EXEC 前与 EXEC 中）Ban 任何「产品 prompt 质量缺陷/无缺陷」措辞 · 结论只按 §1.3 判读表落「候选/未闭合/更新建议」措辞 · Ban 定谳压力 · Ban 判读表外值域就地 reinterpret。
3. **Ban 碰 `:110` TAIL-DEATH 行域（姊妹收口刀域 · 双向 disjoint）**：该行域 Ban 归因本面 · 本面 Ban 归因彼行域 · 互不越界互不代位——复跑 EXIT 形状的尾段面读数原值记账即止 · 零尾段断言定位 · 零 driver 埋点讨论 · 零收口/闭合建议（全部归姊妹卷+协调方）。
4. **Ban 关 `:111` 行**：行状态 P2 OPEN 零翻转——归因重裁结论=**行内更新建议**交协调方 · 行翻转（含 OPEN→CLOSED · 洗 covered）=协调方 nail 专属。
5. **Ban 改共享 SSOT**：backlog/checklist/coverage matrix/sibling 归档全零改写；本刀新增文件仅限本卷 .md（EXEC 期新增仅收据目录）。
6. **Ban withhold 契约触碰**：读 DB 不读 stderr · 探针与子进程 stdio 零接触 · wrapper `cde76fda` pre/post 全等机检强制 · Ban `ai_model_invocation.output`/`ai_invocation_trace.output` 列族读取 · 零写语句。
7. **Ban retry-to-green / Ban masking / Ban 破坏性注入**：复跑=判别实验非翻绿——读数不冲销前轮 2/2、G7W-era `×2`、trio 1/1/1、任何在案真测；每跑预注册假设+判读+反例；N=3 一次成型 Ban 事后加跑/择优；Ban 伪造状态/Ban 降资源/Ban 杀进程；Ban 私自追加 unset 对照臂（如需对照臂=协调方另授权另预算）。
8. **Ban Key 物料越界 / Ban 起草期 live / Ban self-approve / alone ≠ dual**：模型 Key 只经进程环境（loader source · name-only）· Ban `.env*` 读写 · Ban 值/fingerprint 入 receipt/log/commit · 起草 turn 零实跑零外呼零 DB · ⛔push ⛔merge 主线 ⛔force push。

## §2 门矩阵（起草期本席全跑 + EXEC 期复跑行使全跑 · 每条可独立判定）

**A 段 · 起草期（本席亲跑 · 零码零 live）**：

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| A1 | docs:check | `node scripts/ai-docs/check-docs.mjs` | **EXIT=0**（起草基线 2479=cap 2479 恰等 · CAP-SANCTION-2481 步进后落卷终态 2481≤2481 恰等 · 两卷=唯一新增受管件） |
| A2 | markers 五类 | 改动集 grep（词族运行时组装四词+冲突标记对 · 词面本卷不复抄防自匹配） | **零新增命中** |
| A3 | diff 面 | `git diff --numstat HEAD~1 HEAD`（落卷后） | **恰 4 tracked=两新 .md（−0 纯新增）+两 policy 脚本（cap 联动四点+注记 · 语义零变更）· 零他 tracked**（SSOT 原文零触机检：backlog/checklist 对 HEAD 零 delta） |

**B 段 · EXEC 期（复跑行使时行使 · 本卷预 registered 判据 · LIVE 授权归协调方另行两票分立）**：

| # | 门 | 命令/判据 | 判定 |
|---|-----|-----------|------|
| B1 | 码面锚机检 | §0.1 #2-#7 六锚 + **#10 `model-operation-registry.ts`** 共七锚 blob pre/post 全等（`invoke.ts`/`question-generation.ts`/`text-endpoint-config.ts`/`g7-freetier-reprove-guard.ts`/`adaptive-interview-service.ts`/wrapper/registry · rev r1 席1 P2-3：registry 由 operationId 面旁证升格 blob 全等机检） | **全等 · 零 diff**（EXEC 全程 `git status --porcelain` tracked 零改） |
| B2 | 环境探针 | §1.1 探针全项跑前+跑后 | 钉值在位 · `G7_FREETIER_REPROVE` unset · `.env*` ABSENT · name-only |
| B3 | sidecar | 端口行 `:4379` 停靠 · 1000ms · 白名单 5 查询 · 快照在盘 | 每 run 快照捕获 · 逐查询 ok/error 纪律 |
| B4 | 三元组 | R-A/R-B/R-C ×3 | 全记录 · J2 判读分支落字 · 行内更新建议措辞落收据 |
| B5 | 预算 | est-not-counter 账本实测（sidecar R-A 读数） | ≤预注册任务帽 · 链累计 ≤200 硬帽 · 超限即停 |
| B6 | 收据落点 | `ai-docs/delivery/receipts/qgen-reverify2/`（per-run+00-summary） | 判读三元组 ×3+分支落字+行内更新建议+Pins/Retained 原值+`g7SuiteGreen=false`/`actualSpendCny=null` 保持声明 · sk/Bearer 扫描零命中 |

## §3 边界（硬 Ban 清单 · 越界即 FAIL）

1. 产品码全域+迁移（零预占）+spec/夹具/锁文件（§1.3-1）。
2. `:110` TAIL-DEATH 行域+`:107`+POST7B+7A-DOWNGRADE 各行域+姊妹收口卷域（§1.3-3）· 前卷支 `line/qgen-schema-env-recheck`（已 nail 归档 · 零代推零改写零复活）。
3. withhold 契约码面全家（`run-e2e-isolated.mjs`/`run-e2e.mjs`/`run-e2e-ui.mjs`/`secret-redaction.mjs`/`withheld-output.mjs`）——只读锚定零触碰。
4. 共享 SSOT 其余全部行/行统计/LEDGER/矩阵（§1.3-5）。
5. 守卫臂/账本臂行使面（`G7_FREETIER_REPROVE=1` 形 · 含其收据门 runner 域残面）——本刀钉值口径下 unset · 如需该形=换定值分支另裁（§0.2b）。

## §4 依赖与迁移号

零新依赖——sidecar/探针/白名单全为前卷在案机制+Node 内建。**迁移号=零**（不预占任何号）。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push/pull --rebase · Ban 起草期码动+起草期 live（§1.3-8）· Ban 碰产品码/Ban re-roll 说成修复（§1.3-1）· Ban 未钉口径下产品结论（§1.3-2）· Ban 碰 `:110` 域/姊妹卷代位（§1.3-3）· Ban 关 `:111` 行/翻面（§1.3-4）· Ban 改共享 SSOT（§1.3-5）· Ban withhold 触碰/output 列族（§1.3-6）· Ban retry-to-green/择优/对照臂私加（§1.3-7）· Ban Key 物料/self-approve（§1.3-8）· Ban 定谳「永不复现」/Ban 定谳「已修复」/Ban 两向全称主张（§1.3 表边界列）· Ban 触 §3 全部域 · Ban 预占迁移号。

**pins（十一值照抄 · 零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（起草零调用零消耗 · 复跑消耗 EXEC 期账本实记）。

## §6 est live（起草=0 · EXEC 复跑 N=3 账本实测）

起草 turn 全只读（rg/Read/sed/git）；落卷期门行使面=docs:check+markers+git diff（全本地零外呼零容器零 DB）——**起草 est live=0 · `actualSpendCny=null`**。EXEC 期：静态门族（B1）全本地零外呼；复跑 N=3 各按账本实测（est-not-counter · §1.2 预算段 · 预注册任务帽 EXEC 授权落字定值 · 链累计 ≤200 硬帽口径如实另账 · 超限即停）· **LIVE 授权=协调方另行两票分立（EXEC 授权≠LIVE 授权）· 本卷起草期零行使**。

## §7 markers=0（卫生声明）

本刀起草改动集=两新 .md+两 policy 脚本 cap 联动，五类标记词起草席亲跑 grep 零新增（命令与回执随交付报告；五类标记词不在卷内复抄，避免自匹配——沿前卷/姊妹卷 §7 同形制）。

## §8 STOP（开工三条款）+ 停止条件

**STOP · `executed:awaiting_post_prove_dual`（闭合 EXEC 已行使 · 起草席落卷终态 · 三处实测一致=Status 头/本节/卷尾）· 起草席写完即停零实跑零码动条款在卷。** 开工三条款：①本卷 pre-exec 双审 BOTH PASS（双审对象=§0 锚保真+§0.2 读码四项（口径分叉表/re-roll 形状改形/观测兼容性）+§1 三步法二轮逐段（钉值表/N=3/判读表 J2-R1-R3）+§1.3 八款否决+§2 门矩阵——两独立外席 · alone ≠ dual）；②协调方 EXEC 授权（钉值一次成型落字+N=3+任务帽+sidecar 落点 · **LIVE 跑数须协调方另行两票分立授权**——EXEC 授权≠LIVE 授权）；③post-prove 双审+行状态归协调方裁。三者全属后继工序 · 本卷不含 EXEC 不含复跑。

**停止条件（五类 · 命中即停手上报）**：
1. **现场漂移**：pre-exec/EXEC 面对届时 tip 重 pin——`:111` 行被翻面/他刀插入注记、`:807`/`:811` 注记被改写、§0.1 七锚（含 registry）blob 漂移超面（error_code 值面/族面/钉值面/registry 注册面任一实质变化——漂移如实改锚结论不变则只更行号）、或行锚漂移超 ±3 且结论受影响 → 停手上报（不得就地改判读实质）。
2. **机制不满足**：吸收路径再变（REROLL_FAMILY/帽值/耗尽面被他刀改）、error_code 值面被改（`schema_validation_failed` 恒等前提破）、或 wrapper withhold 面被他刀动 → 停手上报回炉（不得就地改仪表）。
3. **越界需要**：执行中若需触 §3 任何域（产品码/`:110` 域/withhold 码面/守卫臂形）→ 停手上报（换定值分支若判必要=并陈回协调方 · 不得就地换钉值）。
4. **验收红不可修**：A 段任一门红且无法在本刀范围内归因修复 → 停手上报（Ban 为绿放宽门——含 Ban 放宽 cap 步进幅度：恰等 +2 零多放）。
5. **LIVE 边界**：EXEC 期复跑前协调方 LIVE 授权未落字 → 复跑停摆（静态门 B1 可先行）· Ban 未授权先跑。

---

## §9 pre-exec dual 交接（预留 · 本节零 SSOT 触碰）

- **双审对象四件**：§0 全节（blob 锚表十行（七码锚+三卷锚）+读码四项 0.2a-0.2d）· §1 三步法二轮逐段（钉值表六行+复跑仪表与白名单 5 查询+判读表 J2-R1-R3 与边界列）· §1.3 八款否决 · §2 门矩阵 A/B 两段判据。
- **悬决项（归协调方）**：EXEC 排程 · 钉值一次成型落字（主口径 vs 换定值分支 §0.2b）· N=3+任务帽定值 · LIVE 两票分立授权 · 判别 run 与收口刀闭合 EXEC 排程先后（两卷互不依赖可并行）。
- **本卷落卷后事实基座不受后继裁决影响的部分**：§0 全节读数系读数登记（原值记账零冲销）；0.2a 一轮结论承登系既成事实。

## §9-r1 rev r1 修订注记（两席 pre-exec dual BOTH PASS · P2 修订清单去重落卷 · rev r1 修订席 2026-11-05 · 本节=修订回路台账 · 勘正处已随令就地落位 · STOP/pins/门矩阵判据零翻）

- **r1-①（席1 P2-3）§0.1 受管锚表补第 10 行**：`packages/ai-runtime/src/model-operation-registry.ts`（blob `f07688cb` · `:77` operationId 注册+`:250`-`:251` profile 绑定亲证）入表——并纳入 §2-B1 blob pre/post 全等机检（由「operationId 面」旁证升格 blob 全等锚 · 共七锚）。
- **r1-②（席2 P2-a）§0.2b（表行+判读段两处）/§1.1/§0.1#6/卷尾 计五处落位 机制叙述精度勘正**：「守卫启用即 pin 覆盖 MODEL_NAME」在现树生产码零调用（`applyG7FreetierReproveEnv` 全仓 grep 仅定义+单测 · GODFN-1b 组合根装配不 pin env）且 `qwen-plus ∈ G7_PAID_FALLBACK_ALLOWLIST`（guard `:30`）——改写为「守卫臂形（`G7_FREETIER_REPROVE=1`）实测口径=qwen3.8-flash（案 A 账本实证）· guard 源 `:132-136` pin 函数现树生产零调用 · 防覆盖处方（unset）不变仍充分」——防后继席按已失效机制推演。
- **r1-③（席2 P2-c）R-B3 恒等式判读纪律钉明**：「恒等式」按「设计恒等·best-effort 允差（`invoke.ts:518` INSERT 失败不回滚 · UC-028 fail-open 旁路设计内）」判——R-B3 SQL 注与 §1.2 R-B 判读句两处已就地落（小失配如实记账不自动升异常/仪器错误）。
- **r1 门回执**：rev r1 落卷期三门亲跑=docs:check EXIT=0（2481=cap 2481 恰等）+PTP EXIT=0 12/12+markers 改动集零命中（回执随交付报告）· STOP 三处 `draft:awaiting_pre_exec_dual` 零翻 · pins 十一值零翻 · 累计 diff 对 base `edda65a4` 恰 4 tracked 零增路径。

## §9-exec OB-3 归因判别 run 行内注（EXEC 期落卷 2026-11-05 · 单跑口径 · 读数原值如实记账红绿都记 · 零重跑零冲销 · 本节=读数登记+行内更新建议 非归因定谳非行翻转 · `:111` 行 P2 OPEN 零翻转 · backlog/共享 SSOT 零触碰 · LIVE 授权=协调方派单随令落字）

- **授权与口径**：协调方 EXEC 授权（pre-exec dual r2 两席 BOTH PASS 后派单）· 单跑 OB-3 归因判别 run（超 1 次行使即停 · 禁重跑刷绿）· 钉值口径=§1.1（`MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing` × `MODEL_NAME=qwen-plus` · 显式 export 钉死）· `G7_FREETIER_REPROVE=unset` 守卫不介入 · `MODEL_API_KEY` 仅经 loader source（name-only · 值/fingerprint 零落盘零入 receipt）· `.env*` 零读取零创建（探针 dotenv_absent_count=0）· 本节系单跑口径（§1.2 N=3 预注册复跑案未被本授权取代·如需仍归协调方另授权）。
- **B1 七锚 blob pre/post 全等机检**：`invoke.ts` `f6102433`/`question-generation.ts` `31079959`/`text-endpoint-config.ts` `005c68cc`/`g7-freetier-reprove-guard.ts` `4e75fae7`/`adaptive-interview-service.ts` `71c9a502`/`run-e2e-isolated.mjs` `cde76fda`/`model-operation-registry.ts` `f07688cb` —— pre（2026-11-04T20:06:05Z）=post（20:07:06Z）七值全等 · `git status --porcelain --untracked-files=no` 空=tracked 树零改（回执 `receipts/g7w-qgen-reverify/00-b1-pre-post.log`）。
- **环境探针（跑前+跑后 name-only）**：MODEL_API_KEY=set（loader）· MODEL_ENDPOINT_PROFILE=dashscope-cn-beijing · MODEL_NAME=qwen-plus · G7_FREETIER_REPROVE=unset · MODEL_BACKUP_API_KEY=unset · MODEL_TEST_TRANSPORT_OVERRIDES=unset · G7_RUN_COST_LEDGER_PATH=unset（无账本臂）· dotenv_absent_count=0 —— pre/post 全项同值（`01-env-probe.log`）。
- **run meta（R-C 三元组）**：cmd=`pnpm run e2e:isolated` · **EXIT=1** · start 2026-11-04T20:06:05Z → end 20:07:05Z（machine receipt durationMs=59196 · outcome=failed · failureClass=api · `.tmp/e2e-receipts/2026-11-04T20-07-05-419Z-48850-d1a9eb5f-409c-4aa6-bd92-4360de17e73b.json`）· `E2E_FAILURE_CLASS class=api` · withhold state_bytes=216 logs_bytes=53 · code SHA `86af8b34b` · worktree `meetwise-g7w` · branch `line/g7w-draft` · migrations applied=222 —— 红也是读数原值记账（预期 EXIT 形如实记 · 判别成功判据=sidecar 快照捕获读取清单读数=满足）· 尾段面形状归收口刀/POST7B 域·本刀零归因零定位（§1.3-3）。
- **判别读数原值（sidecar 白名单 5 查询 · 1000ms · 快照 57 份 · 最后 ok 快照 snap-0055 @2026-11-04T20:07:04.342Z · 逐查询 ok 纪律 5/5 ok · 末份 snap-0056=容器拆除后 connect_error 如实不计读数）**：
  - **R-A（全 service 面分布全录）**：`interviewer.ask`/succeeded/—/11 · `mock-interview.evaluate`/claimed/—/7 · `mock-interview.evaluate`/unknown/`external_outcome_unknown`/5 · `planner.competencies`/unknown/`external_outcome_unknown`/2 —— **generation 面 `schema_validation_failed` 计数=0（含 0 如实登记）**；
  - **R-B1**：interview `abandoned`×1 · `failed`×2（本 run 吸收路径未达前轮 completed 形——如实记录 · 致死性子读数只记录·致命性定谳权归协调方）；
  - **R-B2**：interview_job 15 行=start done×2 + start failed（attempts=0 · last_error=abandoned）×1 + answer done×12 · attempts 全 1（failed 0）· last_error 除 abandoned 外全 NULL；
  - **R-B3**：ai_invocation_trace=11 == R-A succeeded 计数 11（恒等式按「设计恒等·best-effort 允差」判——本 run 恒等成立零失配）；
  - **R-C**：job_application **0 行**；
  - **值域外读数如实另记**：`external_outcome_unknown` ×7（mock-interview.evaluate/planner.competencies 两 service 面·判读表外如实登记不就地 reinterpret·归协调方）· whitelist 5 查询未含 trajectory 列（本 run 无 schema 失败语义·reroll trajectory 无对照面·如实记）。
- **判读分支落字（§1.3 判读表）**：读数方向=**J2-R2（复现不成立）**——本 run generation 面 `schema_validation_failed`=0；**单跑样本限如实**：N=1 不定谳全称 · 本 run journey 形状与前轮异形（interview failed/abandoned 非前轮 completed · 吸收路径形状未行使至前轮形 · 跨时代可比性披露承 §1.3）——**归因=未闭合（候选族并列如实）** · **Ban 定谳「已修复」**（机读甄别钉承：无针对 prompt/validator 面修复 commit · 刀F=吸收语义变更·`6b66a14cf`=观测档名）· **Ban 定谳「永不复现」** · 前轮 2/2 与 G7W-era `×2` retained 零冲销 · trio 1/1/1 零冲销。**行内更新建议（供协调方采/改 · Ban 就地改行）**：「OB-3 门两轮已行使 · 钉值口径（dashscope-cn-beijing × qwen-plus）单跑零复现（N=1 样本限·本 run journey 异形如实）· 前轮 2/2 retained · 归因未闭合（候选族并列 · 值域外 external_outcome_unknown ×7 另记）· 如需 N=3 定值复跑=协调方另授权」。
- **预算（est-not-counter 账本实测）**：本 run R-A 账本实测 **25 calls**（11+7+5+2）· 链累计 ≈164+25=**189 ≤200 硬帽** ✓ · **`actualSpendCny=null`**（无计价数据源·Ban invented spend）· DB 直读=容器固定测试凭据（非模型 Key）。
- **收据落点**：`ai-docs/delivery/receipts/g7w-qgen-reverify/`（00-run1.log · 00-b1-pre-post.log · 01-env-probe.log · 02-run-meta.log · 全 .log 非扫描扩展名不计 cap · sk/Bearer 扫描零命中）· sidecar 快照 57 份+脚本落 `.tmp/qgen-reverify2/`（不入 git · sidecar 读 DB 不读 stderr·与子进程 stdio 零接触·端口行锚 `run-e2e-isolated.mjs:4379` 停靠亲证）· `.tmp` 判别产物 name-only（e2e-seg-heartbeat.ndjson/e2e-consent-capture.ndjson/e2e-tsx-stderr-tail.ndjson——尾段面读数零触碰零归因）。
- **Pins 保持**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · `g7SuiteGreen=false` · `r1Closed=false` · `actualSpendCny=null` —— 十一值零翻转 · 行状态 `:111` P2 OPEN 零翻转（翻转权归协调方 nail）· alone≠dual.

---

*G7W-QGEN-REVERIFY REQUEST · 2026-11-05 起草 · **`executed:awaiting_post_prove_dual`** · ⛔push ⛔merge 主线 · alone ≠ dual · base `origin/main` @`edda65a4` · worktree `meetwise-g7w`（与姊妹 tail-close 卷同树 · 两刀分开两卷互不并裁）· branch `line/g7w-draft`（建前零同名树/同名分支/同名卷三查亲证）· 立项出处=协调方派单令+backlog `:111` 行 P2 OPEN+`:807`/`:811` 一轮行使注（env 排除+2/3 可测+J-R3+两席裁决② 新授权臂授权源）+前卷 `dedd3672` 三步法母本+现树产物变化三件（刀F re-roll `cf196a035`/观测档名 `6b66a14cf`/账本隐私 `31e1afe1b`）· 考证=env 口径分叉表（trio qwen-plus vs 守卫臂 qwen3.8-flash 同端点异模型名 · 守卫 `:132-136` pin 函数现树生产零调用 · 防覆盖处方 unset 不变仍充分 · rev r1 机制精度勘正）+吸收路径改形（REROLL_FAMILY schema_invalid 在族 · MAX_ERROR_REROLL=2 · 耗尽 unavailable+reroll trajectory · 旧「恒 2」单值形判读作废→分布+吸收终态族判）+观测兼容性（error_code 值恒等 · span 档名变化不涉 R-A）· 三步法二轮=口径钉死（dashscope-cn-beijing × qwen-plus · 守卫 unset 防覆盖 · 换定值分支并陈归协调方）→定值复跑（现树 N=3 预注册 · sidecar 白名单 5 查询 · 端口行现锚 `:4379` · R-A/R-B/R-C 三元组 · est-not-counter 账本实测 · 链累计 ≤200 硬帽）→归因重裁（J2-R1 候选加强/J2-R2 未闭合候选族并列+Ban「已修复」机读甄别/J2-R3 仪器缺口/值域外另记 · 致命性定谳权归协调方）· 门矩阵=A 段三锚（docs:check 2481≤2481+markers+diff 恰 4）+B 段六门（blob 机检/探针/sidecar/三元组/预算/收据）· 迁移号=零 · 起草 est live=0 · 复跑 est=账本实测（LIVE 两票分立另行授权）· pins 十一值照抄 · markers=0 · 停止条件五类全设 · Ban self-approve · pre-exec dual ≠ 开工 · STOP*
