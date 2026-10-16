# AG-B-CLASSIFY EXEC receipt（AG-06 确定性失败结算分类+AG-14 解析层折叠·席=EXEC·2026-10-12）

分支 `line/ag-b-classify` · 树 `meetwise-agb` · 开工 HEAD `434a57dc`（REQUEST·pre-exec 双审 BOTH PASS 落协调方+协调方常设 loop 授权）· ⛔push（本卷零 push）· est live=0（新 proof=本地 http 脚本 provider+隔离库·零模型外呼）· pins 十一值零翻。

## §0 并线重 pin（merge `feat/mysql-schema-skeleton` @`4c178a4c` → merge commit `13cf7c33`·零冲突 EXIT=0）

- 三 commit 全 docs（billing-verify 计费蓝本定谳+landing-sync 两批）·排除 `*.md`/`ai-docs` 后码面 diff 为空=**blob 恒等**。
- §0.1 blob 锚表 14 行 `git ls-tree` 新 HEAD 亲算**全部逐位恒等**（model-client `27eb7516`·invoke `68e3c1f4`·0119 `1922910a`·usage-calibration `fec7d3a9`·reconciler `8b7b257b`·rag-cost `85f477e2`·0120 `645a9a73`·0088 `cbc07c09`·context-stress `d69d287f`·op00 `073627b6`·reconcile `e8f2ccec`·worker pkg `107d3d2d`·issues-final `dac7f58c`·EXPERT `5d446552`）——§0/§1/§2 行锚零变。
- **迁移号**：实测 tip 次空号=0170·协调方登记 0170=刀 C 计划+0170-0173=计费蓝本 → 本刀按交接指示用 **0174** 避撞。
- **cost1 反向登记**（协调方增补 relay）：成本轨①卷 `line/ag-cost1-bleed-observe` @`31df8aa1` 共租 model-client.ts 同行邻区（其申报 :623/:668-670 vs 本刀 :623/:662-687）——先落者为准·本刀先行落码·cost1 后到重 pin 以本刀现码为准。

## §1 施工落点（修法六条·全 file:line 亲算）

| # | 修法 | 落点 |
|---|---|---|
| ① | ModelResult 增 known_executed（携 usage+finish_reason+errorCode） | `packages/ai-runtime/src/invoke.ts:69-85`（判别联合第三臂）+`ModelUsage.usageSource` :51-56 |
| ② | 解析失败三态分类（管道缝=dispatchOnce 返回与 parse 之间） | `packages/ai-runtime/src/model-client.ts:662-737`：content/finishReason 提取 :663-668·usage 构建（上限补齐+打标）:671-687·outputInvalidCode/knownExecutedResult :688-695·parse 与传输错误分离 :705（parseError 捕获·usage 缺失 :732 照旧抛 catch 零回归）·g7 finalize 后分类 :723-728 |
| ③ | finish_reason==='length' 补读 | `model-client.ts:622`（choices 类型扩读）+:666（`'length'` 判据）+:689-691（截断码优先于 parse） |
| ④ | usage_missing 按上限打标绝不按 0 | `model-client.ts:671-687`（`?? 0` 废除→缺失字段=policy max 补齐+usageSource 打标）+`invoke.ts:355-366`（validUsage 口径 1 折叠：usage 整体缺失→undefined→归并既有 provider_usage_invalid 臂 :853-870 不新造语义） |
| ⑤ | invoke 路由沿 settled-failed 先例 | `invoke.ts:844-907`（known_executed 臂：usage 缺失归并 :848-870·settle 真实 token+completeModelInvocation(error 码)+breaker success :872-895·settle 失败臂同形 :896-905）+成功相位打标透传 :982 |
| ⑥ | 打标行配对剔除（新迁移镜像铁律） | `packages/db/migrations/0174_ag06_settled_failed_usage_source.sql`：usage_source 列+CHECK :22-29·terminalize DROP+CREATE 镜像 0088 增 `p_usage_source text DEFAULT NULL` :35-101（REVOKE/GRANT 镜像 :103-106）·配对函数镜像 0119 增谓词 `AND i.usage_source IS DISTINCT FROM 'usage_missing'` :143 |

配套接线：`packages/db/src/model-op/model-invocation.ts:142/:148`（CompleteModelInvocationInput.usageSource+`$10::text` 第 10 参·DEFAULT 保 9 参旧调用形）。门注册三名：worker `prove:ag-b-classify`+root `ag-b-classify:prove`/`:prove:raw`+run-e2e-isolated receipt 源清单/允许表/migrate 名单三处。

**失败码登记**（协调方裁示·沿既有码族·Ban 发明语义外码名）：`deterministic_output_invalid`（空 content/坏 JSON）+`deterministic_output_truncated`（finish_reason='length'）——ASCII 合 0088 约束·登记三处=REQUEST §8 行使记录+0174 头注+本收据。

**既有臂零回归（git diff 审）**：known_not_executed 臂（invoke :826-841 原文）·unknown 臂（:908-922 原文）·provider_usage_invalid 臂（:926-943 原文）·settled-failed 先例（:956-1024 仅增 usageSource 一行透传 :982）·model-client catch :735-789 原文/completeStream :797+ 零改/五相位 1-4/流式面零字节。历史迁移（0088/0119/0120/0130 等）零字节改。

## §2 断言门全表（§2 四条+CI 权威形·全亲跑·收据文件同目录）

| # | 门 | 命令 | 结果 | 收据 |
|---|---|---|---|---|
| 1 | 新 proof（§2-①三臂+网络反向臂+归并臂+对照臂+客户端级+配对） | `node scripts/run-e2e-isolated.mjs ag-b-classify:prove:raw` | **EXIT=0·24 PASS/0 FAIL**·`migrations: applied=172`（含 0174 隔离容器真跑） | 01-ag-b-classify.log |
| 2 | 既有门 reconcile | `node scripts/run-e2e-isolated.mjs model-invocation-reconcile:prove:raw` | **EXIT=0·17 PASS/0 FAIL 原值** | 02-model-invocation-reconcile.log |
| 3 | 既有门 op00 | `node scripts/run-e2e-isolated.mjs model-op00:prove:raw` | **EXIT=0·17 PASS/0 FAIL 原值** | 03-model-op00-db-state.log |
| 4 | 既有门 stress | `node scripts/run-e2e-isolated.mjs stress:prove:raw` | **EXIT=1·14 PASS/7 FAIL=基线同红**——A/B 归因：`git stash -u` 摘施工面基线重跑同 7 FAIL 集（04-stress-BASELINE-stashed.log）·施工前后臂集 diff 空·`ARMDIFF_FINAL_EXIT=0` 机检恒等=**主线既有红·本刀零回归**（7 FAIL 全在自适应图/大答案队列/report 舱壁=刀 C/D/E 领地·不越界·已上报 REQUEST §0.3-3 勘误登记） | 04-stress.log+04-stress-BASELINE-stashed.log+04-stress-armdiff-vs-baseline.diff |
| 5 | typecheck CI 权威形 | `pnpm turbo typecheck --force` | **EXIT=0·3 successful/3 total·0 cached**（非两包过滤空转形·双审勘误统一） | 05-typecheck-turbo.log |
| 6 | typecheck 根 | `pnpm typecheck`（=tsc -p tsconfig.e2e.json） | **EXIT=0** | 06-typecheck-root.log |
| 7 | 附跑（非门·validUsage 近邻域保险） | `model-cost:prove:raw` | **EXIT=0·11 PASS** | 08-model-cost-bonus.log |
| 8 | markers=0 五门 | 冲突/fake-green/门弱化/遗留标/secrets 样值×本刀改动集 | **五门零命中**（门弱化原始模式 3 命中=`process.exit(` 子串误中·词界形复扫 EXIT=1·附注在卷） | 07-markers-estlive.log |

## §3 双声明

- **est live=0**：门 1-4/7=一次性隔离 PG 容器（wrapper 自建自清）+本地 http 脚本 provider（127.0.0.1 loopback·测试 override 缝）；门 5/6=本地构建。零模型外呼·零生产操作·零 secrets·零消耗（pins 脚注 `actualSpendCny=null` 同源）。
- **pins 十一值零翻**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §4 越面自查（13 条陷阱自检）

1. 并线重 pin：零冲突·14 锚 blob 恒等·§0.3 勘误落卷 ✓
2. 四态语义（refused/sent→settled|settled_failed|unknown）：known_executed 只在四态内·unknown 臂只留网络层不确定（5xx 反向臂证 breaker failure 仍计）✓
3. Ban 新造语义外码名：两码沿既有族+三处登记 ✓
4. 配对过滤迁移号：0174（避撞 0170-0173·协调方交接指示+收据登记）✓
5. 既有臂零回归：reconcile/op00 EXIT=0 原值·stress A/B 臂集恒等机检·model-cost 附跑绿·git diff 四臂原文未动 ✓
6. 流式面 completeStream 零改（diff 证 :753+ 零字节）✓
7. 打标列：usage_source 新列不进 identity-immutable（terminalize 时写）·成功/failed 两相位都透传 ✓
8. REQUEST 状态行 append 保史（draft 行原文保留+append 行新增）✓
9. 越面自查：零触 AG-01 准入面（:640/0130/0120 零字节）·零触报告键/consumer/embedding/AG-12 估算器·零共享 SSOT 行改 ✓
10. 回滚面：改动集=3 码文件+1 迁移+1 proof+3 注册文件+REQUEST/receipts docs——单 commit 可整回滚（迁移 0174 幂等形 ADD IF NOT EXISTS/DROP IF EXISTS）✓
11. 停止条件：零触发——专家边界与现码零冲突；唯一偏差（stress 门基线红）非边界冲突·A/B 证非本刀引入·如实登记+上报不自由发挥 ✓
12. ⛔push：本卷零 push（commit 后停·待 post-prove 双审）✓
13. est live=0+markers=0+pins 零翻：§3 双声明 ✓
