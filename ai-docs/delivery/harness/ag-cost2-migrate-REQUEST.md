# AG-COST2 — 成本轨第②步：AG-07 迁移三件套（去重换键/加窗/水位线）+ 因子合并语义 + 90 天保留期（B 席六步之② · EXEC REQUEST）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·本刀 docs-only 恰 1 .md 零码动。EXEC/任何实施须预执行双审两外席 PASS + 协调方明示授权 · **Ban self-approve** · **alone≠dual** · Dual PASS ≠ 开工 · ⛔push）

**席位**：meetwise 战役 AG 成本轨第②步起草席（AG-07 迁移三件套 + 因子合并语义 + 90 天保留期 · EXPERT-REVIEWS §七 成本轨 B 席六步之 **②**——「①与②合并一个发布窗口」（cost1 REQUEST §3-1/checklist :2357）的②·①止血旋钮已 nail `6f2ed876` 缺省关停·**本刀=关停态下为重启用做准备**·与失败语义轨 A 席六刀零硬依赖）。
**基线**：`feat/mysql-schema-skeleton` @ `2bc4e2bd`（开工建树时点主线 tip·`git log -1` 实测 2026-10-11·docs(ssot) AG+计费战役刀位图立节笔。起草窗口内主线零前移（worktree 立-tip 与现 tip 同 hash 亲证））。分支 `line/ag-cost2-migrate` · 工作树 `meetwise-cost2`（`git worktree add ../meetwise-cost2 -b line/ag-cost2-migrate` 仓根同级·沿 cost1 卷同形·建前亲证：worktree list 15 树无 cost2·`branch -a | grep cost2` 零命中）。
**防重双对表（亲证）**：`rg -n "ag-cost2" ai-docs/` → 零命中；`ls ai-docs/delivery/harness/ | grep cost2` → 零同名刀卷（cost1 卷在案为前驱非冲突）；`ls packages/db/migrations | sort` 主线顶=**0169**（0170-0173 号位已分配 billing·0174=刀 B 已落 agb 树 `0174_ag06_settled_failed_usage_source.sql`·0175=刀 C 计划·0176=qsec 已 declare 占用）→ **本刀迁移号 0177 起**（EXEC 立项时实测顺延·`scripts/check-migration-version-uniqueness.mjs` 终裁）。→ **停止条件未触发·可建树落卷**。
**蓝本**：①`ai-docs/delivery/ai-capability-review/issues-final.md` AG-07 详情 **:125-134**（file:line 四要素+膨胀算术+修法原文「水位线增量/PK 去 batch/全局聚合/降频或关掉」）+ 总览 **:19**（P1·专家裁定降 P2 见 EXPERT-REVIEWS §一 :10）②同目录 `EXPERT-REVIEWS.md` **§七 :67 成本轨②（修法权威：「观测表去重+PK 去 batch·配对/枚举加窗+水位线·因子 max(old,增量) 合并保上界）+90 天保留期」）** + **§六 :51 EG-B1 备注**（unknown 预留零清算=另一账本不可信源·修法=unknown ageing 对账器**与状态机同批**——非本刀面·本刀水位线/保留期与 EG-B1 零语义交叠）+ **§八 :77-78**（62747d74 跑真迁移真隔离 PG 先例）③**任务书修法权威·四件**（协调方对 §七② 的四件展开·本卷逐件落 §1-修法）：观测表按 (owner,invocation_key) 去重保留最早 batch→DROP CONSTRAINT+ADD PRIMARY KEY；配对函数加窗 v2 镜像 completed_at>p_since 旧函数保留；水位线表 ai_usage_calibration_watermark(owner PK,last_completed_at) 单调推进+gateway_owners 同步加窗；因子合并语义 factor'=max(factor_prev,增量 rawMax×(1+safety)) 显式定义否则增量丢失上界保证 ④成本①刀 `ai-docs/delivery/harness/ag-cost1-bleed-observe-REQUEST.md`（nail `6f2ed876`·旋钮+观测已落=本刀输入·其 §3-1 范围外第 1 条即本刀·其 execution-master-checklist **:2357 STILL OPEN 原文承接**）+ `product-campaign-LEDGER.md` **:404-417 刀位图**（成本轨②-⑥=队列·②以①旋钮+观测为输入）⑤形制沿 cost1 卷（§0-§8·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `2bc4e2bd`·file:line 逐条 rg/sed/git ls-tree 实测复核·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 blob 锚表（@`2bc4e2bd`·`git ls-tree` 实测·12 位短 blob·EXEC 立项逐条对 blob·漂则重 pin）

| # | 文件 | blob | 角色 |
|---|---|---|---|
| 1 | `packages/db/migrations/0119_usage_reconciliation_wiring.sql` | `1922910a79da` | **迁移主触面 A**：:399-413 观测表（PK :412 `(owner_user_id,batch,invocation_idempotency_key)` **含 batch**）+ :414-417 因子表 RLS（`ai_usage_calibration`·与观测表行段分开）+ :422-431 RLS/GRANT（app_role 仅 SELECT,INSERT）+ :438-473 配对函数 `ai_usage_calibration_pairs_scoped(text)` **单参无时间窗**（:470 ORDER BY completed_at） |
| 2 | `packages/db/migrations/0134_usage_calibration_gateway_owners.sql` | `8288a57d697e` | **迁移主触面 B**：:11-25 `gateway_usage_calibration_owners()` 枚举**全部**有配对 owner（WHERE :21-23 无时间谓词） |
| 3 | `packages/ai-runtime/src/usage-calibration-reconciler.ts` | `8b7b257bc849` | 域级本体：:110 `listUsageCalibrationPairs` 读**全历史** + :133-140 逐条 INSERT（batch=入参）+ :144-151 因子 insert-only 落库 + :12 注释原文「每组读**全历史**配对（因子只升不降）」——**单调性的真实来源=全史读，加窗后必须显式补** |
| 4 | `packages/db/src/model-op/usage-calibration.ts` | `fec7d3a91ce6` | 数据访问层：:39-56 `listUsageCalibrationPairs` 走 v1 函数 `$1` 单参 + :69-74 因子 ON CONFLICT DO NOTHING（内容寻址 insert-only）+ :104 观测 ON CONFLICT `(owner_user_id,batch,invocation_idempotency_key)` DO NOTHING |
| 5 | `packages/ai-runtime/src/usage-reconciliation.ts` | `3567750fecec` | 因子语义单真源：:196 rawMaxRatio=逐观测取 max + :205 `factor = rawMaxRatio × (1 + safetyMargin)` + :219-224 refineEstimate「仍是上界」+ :36 防退化观测上界注释 |
| 6 | `packages/db/src/jobs/gateway-dispatch.ts` | `fb7d55415d1b` | 枚举 wrapper：:59-63 `gatewayUsageCalibrationOwners` 走 0134 函数（生产唯一调用点 reconcile.ts:81） |
| 7 | `apps/worker/src/usage-calibration-reconcile.ts` | `ddf39a00d5ed` | **成本①旋钮所在**：:18-24 hourBatch=`cal-YYYYMMDDHH` 小时桶 + :39-72 config/resolve（boundedInteger/boundedBoolean 纪律）+ :75-102 tick（:81 全量枚举→逐 owner reconcile）+ :105 `runUsageCalibrationReconciler(pool, intervalMs = 60_000)` 默认参原值保留 |
| 8 | `apps/worker/src/main.ts` | `8ed81327e02d` | **成本①接线所在**：:35 import + :712-716 resolve+条件起循环（**缺省 ENABLED=false 不起循环**）+ :744 ready 可选短路 + :778 drainStop |
| 9 | `packages/ai-runtime/src/invoke.ts` | `647e0aa952f0` | 计费面（ModelUsage :48-58 / settle :335-347）——**本刀零触面**（成本①已钉「只观测不改计费」·本刀延续） |
| 10 | `packages/ai-runtime/src/metrics.ts` | `2cd9daf00925` | 成本①观测 metric（METRIC 两键+基线预注册）——本刀零触面（观测面已落·背景） |
| 11 | `packages/db/src/index.ts` | `3fa6f9a8648f` | 导出面（:48 gateway 族 / :219 calibration 四原语）——代码增量加导出走此面 |
| 12 | `packages/ai-runtime/src/index.ts` | `0c135cb22ffc` | 导出面（reconciler 族）——代码增量加导出走此面 |

### 0.2 漂移登记（成本①快照 `b95c9c4b` → 现树 `2bc4e2bd`·全亲读重 pin）

| 成本①锚 | 现树重 pin（实测） | 漂移判读 |
|---|---|---|
| 0119 `1922910a79da`（PK :399-413/:412·配对函数 :438-470） | blob **逐字节不变**（成本①零迁移·亲证同 blob）·行号 :399-417/:412/:438-473 | 不变 |
| 0134 `8288a57d697e`（枚举无窗） | blob **逐字节不变** | 不变 |
| reconciler.ts `8b7b257bc849`（域级本体零字节承诺） | blob **逐字节不变**（成本① Ban 动域级本体已兑现） | 不变 |
| reconcile.ts（成本①止血 :32-73 旋钮区+:105 默认参） | 现树 `ddf39a00d5ed`：:18-24 hourBatch·:39-72 旋钮·:75-102 tick·:105 默认 60_000 原值 | **成本①改动后新态**（本刀红事实按新态记） |
| main.ts（成本① :35/:713-716/:744/:778） | 现树 `8ed81327e02d`：:712-716 缺省关停条件起循环亲证 | **成本①改动后新态** |
| usage-calibration.ts / gateway-dispatch.ts / usage-reconciliation.ts（成本①未记锚） | `fec7d3a91ce6` / `fb7d55415d1b` / `3567750fecec`（本席补 pin） | 补 pin |

### 0.3 现势并发登记（强制）

1. **迁移号占用图**（LEDGER :404-417 刀位图 + qsec 卷 :52 亲证）：billing 0170-0173（立项待·号位已分配）· 刀 B=0174 **已落 agb 树**（`0174_ag06_settled_failed_usage_source.sql`·EXEC 修复中未并主线）· 刀 C=0175（BOTH PASS 待 EXEC·rev 在途）· qsec=**0176 起（REQUEST 9484bc54 明示 declare）**· 刀 D（AG-D）卷 ffa1fa62 原文「0177 待协调方裁定」（晚本卷六分钟·非本卷可证面·**已由协调方分配消解**）。→ **协调方裁定：0177=本刀（COST2）·刀 D（AG-D）改 0178**——本刀 **0177 起**；若 EXEC 立项时 qsec/刀 C 有让位或占位变化·**实测顺延**·`check-migration-version-uniqueness` 门终裁。
2. **跨轨文件交点**：刀 B（AG-06·model-client.ts 管道）·刀 C（AG-04·0175 迁移+interview-jobs 面）与本刀触面（0119/0134 新迁移+reconciler/db wrapper/worker 调度侧）**零文件交集**·可并行·互不为前置。成本①已 nail 关停态·本刀落库后 reconciler 仍处缺省关停（重启用=显式后继决策·非本刀自动翻转）。

## §1 红事实 + 修法

### 红事实（AG-07 四要素现 pin·全亲证）

| 要素 | 锚（@`2bc4e2bd` 实测） | 事实 |
|---|---|---|
| 60s 拍 | `reconcile.ts:105` 默认参 60_000（:45/:104 worker 默认注记）＋成本①旋钮 :39-72（缺省 ENABLED=false + INTERVAL_MS 缺省 86_400_000） | **成本①已旋钮化·缺省关停**——机制未除·旋钮只是减速带；显式启用（哪怕按天）膨胀照旧发生（见膨胀算术）·**本刀为重启用做准备** |
| owner 无窗 | `0134:11-25`（WHERE :21-23 只滤 estimate/input/completed_at 非空·**无时间谓词**）+ `reconcile.ts:81` 每 tick 全量枚举 | 曾经调用过的 owner 永久留在枚举集·每拍全 owner 扫描·随历史线性增长 |
| 配对全史 | `0119:438-473`（`ai_usage_calibration_pairs_scoped(text)` 单参·**无 completed_at 窗**）+ `usage-calibration.ts:39-56`（`$1` 单参调用）+ `reconciler.ts:110` | 每 owner 每拍读**全部历史**配对（含最老一行）——`reconciler.ts:12` 注释自证「每组读全历史配对（因子只升不降）」 |
| PK 含 batch | `0119:412` `PRIMARY KEY (owner_user_id, batch, invocation_idempotency_key)` + `reconcile.ts:18-24` hourBatch 每小时新桶 + `usage-calibration.ts:104` ON CONFLICT DO NOTHING（**同桶内才去重**） | 同一调用每小时换新 batch 桶**整行重写**：跨桶不去重→观测行随拍数×历史线性膨胀 |
| **膨胀算术**（issues-final :132 原文） | 1 万用户 × 平均 100 次历史调用 = **100 万配对**；成本①前 60s 拍：每分钟 100 万次 INSERT·**每小时实际新增 100 万行·一天 2400 万行**；成本①后按天档：**每天仍 +100 万行** | 且随历史线性增长·DB 膨胀→worker 对账事务越来越长→拖累主链路连接池；产出因子生产零读取（成本① :62 红事实 A 亲证·resolveLatestCalibratedFactor 生产零调用） |
| 因子只升的来源=全史读（加窗风险面） | `usage-reconciliation.ts:196`（rawMaxRatio 逐观测取 max）+ `:205`（factor=rawMaxRatio×(1+safetyMargin)） | 上界保证完全由「读全历史」隐式达成——**若直接加窗而不定义合并语义·增量 rawMax 只覆盖窗口·新因子可低于旧因子·上界保证静默丢失**（任务书修法第四件 raison d'être） |

### §1-修法（任务书修法权威·四件 + 因子合并语义显式定义 + 90 天保留期——全部走新迁移 0177 起 + 关停态下代码增量·历史迁移 0001-0174 零字节）

**件① 观测表去重 + PK 换键（新迁移·同事务先去重后换键）**：`ai_usage_calibration_observation` 按 `(owner_user_id, invocation_idempotency_key)` 分组去重，**每组保留最早 batch 行**（batch=`cal-YYYYMMDDHH` 字典序=时间序· ties 按 created_at 最早；仅删组内多余行·绝不丢任何唯一调用），随后 `DROP CONSTRAINT ai_usage_calibration_observation_pkey` + `ADD PRIMARY KEY (owner_user_id, invocation_idempotency_key)`。`batch` 列保留为溯源列（NOT NULL 维持·语义降级为「首次观测桶」）。去重必须与换键**同一迁移同一事务**（先换键不去重会因现存重复行直接失败·先去重不换键则膨胀机制未除）。

**件② 配对函数加窗 v2（旧函数保留）**：新迁移 `CREATE OR REPLACE FUNCTION ai_usage_calibration_pairs_scoped_v2(p_owner_user_id text, p_since timestamptz)` **逐字镜像 v1 体**（0119:438-473·含 SECURITY DEFINER/search_path/owner 断言/header JOIN）仅增两处：入参 `p_since` + WHERE 追加 `AND i.completed_at > p_since`。**v1 函数零字节保留**（回滚/对照面·镜像纪律沿 0088 逐字镜像先例与 AG-11 修法形制）。db wrapper 增 `listUsageCalibrationPairsSince(c, owner, since)` 走 v2（v1 wrapper 保留）。

**件③ 水位线表 + 枚举加窗**：新表 `ai_usage_calibration_watermark(owner_user_id text PRIMARY KEY, last_completed_at timestamptz NOT NULL, updated_at timestamptz NOT NULL DEFAULT clock_timestamp())`——RLS 同 0119 形制（ENABLE/FORCE RLS + owner policy + GRANT SELECT,INSERT,UPDATE 给 app_role；UPSERT 需 UPDATE 通道·水位线系内部记账非账本·不违因子 insert-only）。**单调推进**：`INSERT … ON CONFLICT (owner_user_id) DO UPDATE SET last_completed_at = GREATEST(ai_usage_calibration_watermark.last_completed_at, EXCLUDED.last_completed_at)`——**绝不回拨**（对账重放/乱序完成只前移）。`gateway_usage_calibration_owners` **同步加窗**：新迁移增 `gateway_usage_calibration_owners_v2(p_since timestamptz)`（0134 体镜像 + 与 watermark/v2 配对同谓词的 completed_at 下界·只返回窗口内有新配对的 owner）；旧函数零字节保留；worker tick 改走 v2 wrapper（传各 owner 水位线或整批最近水位·EXEC 细化）。reconciler 加窗路径：读 owner 水位线→v2(p_since=水位线) 取增量→写观测/合并因子→推进水位线至本批 max(completed_at)（同 principal 事务·失败整体回滚水位线不前移=at-least-once 幂等重放安全·观测 ON CONFLICT DO NOTHING 去重已由新 PK 兜底）。

**件④ 因子合并语义（显式定义·否则增量丢失上界保证）**：加窗后因子落库前必须与 prev 因子合并——**`factor' = max(factor_prev, rawMax_增量 × (1 + safetyMargin))`**（任务书公式·两肩同乘 (1+safety) 后在 factor 尺度取 max·保上界保单调只升不降）。合并结果以**新 content-addressed 因子版本 insert-only 落库**（绝不 UPDATE/DELETE 旧行·沿 0119 因子 append-only 纪律；factor_version 哈希输入须含 prev factorVersion 形成合并链可审计·EXEC 细化）。伴随语义显式定义：`observationCount' = observationCount_prev + observationCount_增量`（单调不减·CHECK ≥1 维持）；`hasUnderEstimate' = prev OR 增量`；`rawMaxRatio'`/`safetyMargin'` 落**合并语义下的有效值**（safetyMargin 维持原常量·系数口径=裁决项②）。无 prev（首窗）时退化为普通全量计算=现语义。水位线推进与合并因子落库同事务。

**90 天保留期（裁决项①：本刀含 vs 后继）**：`ai_usage_calibration_observation` 中 `created_at < now() - interval '90 days'` 行的保留期清除任务（EXPERT-REVIEWS §七 :67「+90 天保留期」）。形制候选：(a) SECURITY DEFINER 清除函数（新迁移内·app_role 对观测表保持无 DELETE——0119:431 insert-only GRANT 纪律零破坏·worker 低频循环或独占迁移内一次性+周期函数落库）；(b) 后继刀（本刀仅落水位线+加窗·保留期另卷）。**EG-B1 备注（边界·非本刀）**：EXPERT-REVIEWS §六 :51 unknown 预留零清算出口（unknown ageing 对账器·N 天按上限结算打 audit reason）系**账本清算**语义·修法与状态机同批（失败语义轨刀 B 面）——与本刀**观测日志保留期**（纯膨胀治理·不触钱）零语义交叠·本刀绝不顺手做 EG-B1。

## §2 验收断言候选（prove 全假体·pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **迁移 proof（隔离库真迁移链·沿 entpay-s1 真迁移链 proof 形/62747d74 真隔离 PG 先例）五臂**：①历史膨胀行去重保留最早——fixture 同 (owner,key) 三 batch 行（cal-…08/cal-…09/cal-…10）→ 迁移后恰留最早 batch 一行·组内计数断言+唯一调用零丢失断言；②新 PK 生效——information_schema/table constraint 断言 PK 列集恰 `(owner_user_id, invocation_idempotency_key)` 两列·同 key 二次 INSERT ON CONFLICT 命中（幂等仍绿）；③水位线单调——插入/推进后 GREATEST 生效·回拨尝试（更小 last_completed_at UPSERT）断言值不降；④加窗后旧数据不再入对账——fixture 造 p_since 前后各一配对→v2(p_since) 恰返回窗口内行·**v1 同 fixture 仍返回全史（旧函数保留 proof）**；枚举 v2 同谓词断言；⑤因子合并 max 语义——prev factor=0.9·增量 rawMax=0.7×(1+0.2)=0.84→merged=0.9（不降）；增量 rawMax=1.5×1.2=1.8→merged=1.8（只升）·merged 以新版本行落库且旧行原值在位（append-only 断言）·observationCount 相加断言。
2. **成本①旋钮 proof 回归**：`usage-calibration-bleed` 26 臂原值重跑 EXIT=0——**缺省 ENABLED=false 不因本刀翻转**（重启用=后继显式决策）；resolve 纪律（非法值 throw）零回归。
3. **reconciler 门回归**：`usage-calibration-reconciler.proof` 既有臂原值（全史路径语义不变=v1 未动）·ai-runtime/db 既有 test 全 EXIT 原值·基线同红登记不洗（DB 门=database_target_missing/ssl_ca_unreadable 沿成本①口径）。
4. **门与静态**：`turbo typecheck` 3/3 全绿 + `docs:check` EXIT=0 + `check-migration-version-uniqueness` EXIT=0（0177 号位唯一性）。

## §3 范围外（边界清单·越界即 FAIL）

1. **AG-12 CJK 加权估算器（成本轨③）**：utf8-bytes-v1 估算语义零触（usage-reconciliation.ts 估算面· estimator 注册表零改）。
2. **回灌接线（成本轨⑥）**：resolveLatestCalibratedFactor 生产接线零字节（reconciler.ts:79-85 保持生产零调用）· 显式缓存改造（nonce 围栏渲染结构）不做。
3. **AG-11 三件套+补收（成本轨④）/ AG-08 熔断键（⑤）/ EG-B1 unknown ageing（与状态机同批）**：零触。
4. **#48 cached_tokens 收口**：观测面已落（成本①）·收口须待观测数据+本刀落地·本刀不翻任何 #48 结论。
5. **计费语义/价格零改**：settle/validUsage/预留/结算/价格行零字节（invoke.ts `647e0aa952f0` blob 恒等）。
6. **历史迁移零字节**：0001-0174 已落文件逐字节不变（含 0119/0134 两主触面——**本刀只增新迁移不改旧卷**）·0175（刀 C）/0176（qsec）号位不 claim。
7. **worker 其他循环零触**（commerce/model-invocation/gauge/privacy/vector/stub）；main.ts 仅当裁决项①取「本刀含保留期」时增一条可选循环接线（沿 privacyErasureLoop 可选循环先例）·否则零触。
8. **est live=0**：零模型真实外呼·零生产操作·零 secrets（§6）。

## §4 依赖

**唯一前置=成本①（已 nail `6f2ed876`·origin 已推）**：旋钮（缺省关停+按天）与 cached_tokens 观测已落=本刀输入·**非闸**（本刀在关停态下纯迁移+代码增量·不依赖旋钮翻开）。与失败语义轨（A 席六刀）零文件交集·可并行（刀 B=model-client·刀 C=0175 迁移+interview-jobs·与 0119/0134/reconciler/worker 调度侧零交集）。**迁移号协调**：billing 0170-0173/刀 B 0174/刀 C 0175/qsec 0176 已 declare——本刀 0177 起·EXEC 实测顺延·uniqueness 门终裁（§0.3-1）。**下游**：成本③（AG-12 估算器）以本刀窗口化对账产出的干净因子链为输入·非闸；#48 收口待观测数据。**与①同发布窗**（cost1 REQUEST §3-1/checklist :2357「①与②合并一个发布窗口」）：①已并主线·本刀并线即成窗。

## §5 Ban 列表 + pins（沿 cost1/authz 卷同源·逐字誊 + 本刀面增补）

**Ban 列表**：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 改历史迁移（0001-0174 已落文件零字节·0119/0134 blob 恒等对 §0.1 #1/#2）；Ban claim 0175/0176 号位（刀 C/qsec 已 declare·本刀 0177 起实测顺延）；Ban PK 换键不去重（先去重后换键·同一迁移同一事务·反序必 FAIL）；Ban 静默丢观测行（去重仅按 (owner,key) 组内保留最早·任何唯一调用行零丢失）；Ban 删旧函数（ai_usage_calibration_pairs_scoped/gateway_usage_calibration_owners v1 零字节保留）；Ban 水位线回拨（GREATEST 单调推进·失败回滚不前移）；Ban 因子下降（合并语义 max·上界保证只升不降）；Ban 破坏因子 append-only（绝不 UPDATE/DELETE ai_usage_calibration 因子行·合并=新 content-addressed 版本 insert-only）；Ban 破坏观测表 insert-only GRANT 纪律（app_role 保持无 DELETE·清除走 SECURITY DEFINER·沿 0119:431 形制）；Ban 保留期越界删数据（只触 ai_usage_calibration_observation 90 天前·绝不触因子表/ai_model_invocation 账本/其他任何表）；Ban 顺手回灌接线/AG-12 估算器/EG-B1（§3-1/2/3）；Ban 计费语义改动；Ban env 非法值静默回退（保留期天数若 env 化走 boundedInteger 纪律·沿成本①先例）；Ban 真实模型外呼（est live=0·隔离库 fixture 形）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 prove 全 假体/隔离库 fixture·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：①迁移 proof=隔离 PG 真迁移链+fixture 断言（零外呼·零生产库）；②旋钮/合并语义 proof=纯函数+内存断言；③回归门=既有 prove 原值重跑。prove 全 假体/静态/隔离库·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ag-cost2-migrate-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 diag/i3/cost1 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin·迁移号照 §0.3-1 实测顺延）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：

- **①90 天保留期归属（§七②原文含「+90 天保留期」·可选裁决）**：(a) **本刀含**（新迁移内 SECURITY DEFINER 清除函数+worker 低频可选循环接线·一步到位·但+1 worker 触面与 main.ts 接线面）·**推荐**（②落地后观测行增量受控·保留期是膨胀治理闭环的最后一件·拖后继则 90 天面继续堆旧账）；(b) 后继刀（本刀仅四件+合并语义·main.ts 零触·最小刀面）。
- **②合并 safety 系数与口径（件④授权面内细化）**：(a) factor 尺度 max 按任务书公式 `max(factor_prev, rawMax_增量×(1+safety))`·safety 沿 DEFAULT_SAFETY_MARGIN 常量·**推荐**（与任务书修法权威逐字一致）；(b) rawMax 尺度合并 `rawMax'=max(rawMax_prev, rawMax_增量)` 再统一乘 (1+safety)（结果 ≥(a) 恒成立·更保守·但偏离任务书公式字面·prev/增量同用 DEFAULT_SAFETY_MARGIN 时两形数学恒等·严格 ≥ 仅在 safety 异值时成立·两形均保上界）。两形均保上界·绝不静默选一。
- **③水位线粒度**：(a) owner 级（任务书表形 owner PK 单列水位·**推荐**——最小表形·枚举加窗 v2 谓词同粒度自洽）；(b) (owner, service, model) 级（更细增量·表形与合并因子链对齐·但水位行数×组数·首版过度设计）；(c) 全局单水位（最粗·单慢 owner 拖全局·排除项呈报完整性）。

---

*AG-COST2 REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · 基线 `feat/mysql-schema-skeleton` @`2bc4e2bd`（起草窗口主线零前移）· 分支 `line/ag-cost2-migrate` · 工作树 `meetwise-cost2` · 蓝本=issues-final AG-07 :125-134/:19 + EXPERT-REVIEWS §七 :67 成本轨②（修法权威）+§六 :51（EG-B1 边界备注）+§八 :77-78（真隔离 PG 先例）+ 任务书修法权威四件 + cost1 卷（nail 6f2ed876·STILL OPEN :2357 承接）+ LEDGER 刀位图 :404-417 · 范围=迁移四件（去重换键/配对 v2 加窗/水位线表/枚举加窗）+因子合并语义显式定义+90 天保留期（裁决项）· 不含=AG-12/回灌/AG-11/EG-B1 · 迁移号 0177 起（EXEC 实测顺延）· est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*

*rev 勘误席（docs-only 窄面·⛔push·零码动）· 2026-10-12 · 双审席1 FAIL 处置摘要（1 blocking+5 errata·结论零变·§8-③ 冻结维持·STOP 维持·markers=0·pins 十一值零翻）：①【blocking】§0.1 #10 metrics.ts blob `2adc31554c07`→`2cd9daf00925`（`git ls-tree 2bc4e2bd -- packages/ai-runtime/src/metrics.ts` 亲算后落笔·2adc31554c07 系 cost1 EXEC 中间态 a8f7078d 旧 blob）；②§0.3-1 占用图补登协调方裁定 **0177=本刀（COST2）·刀 D（AG-D）改 0178**（刀 D 卷 ffa1fa62 原文「0177 待协调方裁定」·晚本卷六分钟·非本卷可证面·已由协调方分配消解）；③引语「①与②合并一个发布窗口」归引改 cost1 REQUEST §3-1/checklist :2357（非 EXPERT-REVIEWS·§七 :67 无此语）；④裁决项②(b) 补措辞（prev/增量同用 DEFAULT_SAFETY_MARGIN 时两形数学恒等·严格 ≥ 仅在 safety 异值时成立·两形均保上界）；⑤杂锚：§1 row1 辅锚 :7→:45/:104·§0.1 #1 行段 :399-417→:399-413（因子表 RLS :414-417 分开）。恰 1 .md·零码动 · ⛔push*
