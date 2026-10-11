# CI-WIRING REQUEST（批5 第三刀 · CI 接线归属 · 5D 位图十五件 · L 体量大刀）

**先盘点后起草**。位图行：TASK-SOP-v2:84 `| 5D | CI-WIRING | #96（LINT S3-S5 续）+#155+#98/#240 主链 E2E+#114+#175+#113/#97/#99/#147/#159/#169/#226/#176/#177 |`（任务书 :82 有 ±2 行漂移·实测 :84）；LEDGER:87 `**5D CI（15）**：#96 🔒LINT S0-S2✅·S3-S5 续·#155 prove 纳 CI·#98+#240 主链 E2E nightly·#114 neg:* 纳 CI·#175 drift 恢复·#113/#97/#99/#147/#159/#169/#176/#177/#226 — 🆕 CI-WIRING 大刀（SCORE S2 后最有价值）`；LEDGER:96 `6. **批 5**：MIG-RUNNER→AUTHZ-HARDEN→CI-WIRING→5C 四子刀→5E 批量`；LEDGER:212 批5 `4/143` 残 139 含本刀。归属外部背书：extrev-deps-audit-REQUEST:92 与 extreview-fix-campaign-SOP:26/:54 均把 #96/#155/#98/#114/#175 先立项归 CI-WIRING 且两刀自缚「ci.yml 既有步骤零改」。

## §0 现状锚（起草席亲读·base `feat/mysql-schema-skeleton` @`2f6662ef`·file:line 实测·**EXEC 立项照本节重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.1 workflow 面盘点（8 workflows 共 798 行实测）
`ci.yml` 297 行（secrets-scan+verify 双 job）：:150 `pnpm migrate:prove`、:240 `pnpm migrate-cli:prove`（MIG 卷锚仍准）；neg:* 仅 :152 `pnpm neg:bend` 一条已纳；typecheck/turbo/tokenstream/vector-plane-erasure/sse-push/drift 逐名 grep **全零命中**；:56-59 e2e-static-guards（fake-service flags+secret-redaction 脱敏扫）已纳；:78-81 provider-egress:inventory+prove 已纳（#178 解封面）；:129-134 双镜像构建门；:283-284 `pnpm api:validate`（隔离库先例·无 key）；:294-297 结尾注释=**E2E 不在 per-push 的结构性闸原文**：「run-e2e.mjs 要求 E2E_ISOLATED=1 + MODEL_API_KEY，缺 Key 必须非零退出。禁止 skip-if-absent。nightly.yml 当前也没有跑 e2e:isolated / e2e:ui:isolated」。`nightly.yml` 65 行单 job `live-model`（cron 0 18 * * *）：model:smoke 硬门（:40 缺 key exit 0）、recall:eval（:49 continue-on-error）、scoring:eval（:57 continue-on-error）——#97 面原样在。另六件：deploy.yml（:8-12 workflow_run:[ci]、:26-29 conclusion==success 才部署）/deps-audit.yml 42 行（extrev 刀面·本刀零触）/governance-history.yml/pages.yml/release.yml/ha-probe-multi.yml。

### 0.2 5D 十五件逐件查重表（issues-master 更正版原文要点+码面实测判定）
| # | 原文要点（修法列） | tip 实测 | 判定 |
|---|---|---|---|
| #96 | 各包补 typecheck 并 ci.yml 加 turbo typecheck 门（:167 修法列） | apps/api|worker/package.json、packages/db|ai-runtime|domain/package.json typecheck 键**5/5 零**；turbo.json `typecheck`/`//#typecheck`/`lint` task 壳**已预置**（点灯缺芯）；根 `typecheck`=typecheck:e2e 单包 | **开放**（A 簇） |
| #96🔒LINT | LEDGER「S0-S2✅·S3-S5 续」；lint-design:54 S3=dry-run 基线+四规则计数+`--max-warnings N`、S4=per-workspace lint script、S5=turbo lint 全量绿+收据 | packages/config/ 四产物在（S0-S1✅）；workspace extends `@meetwise/config` **0/10**（仅 config 自引用·S2 半）；`"lint"` script 全仓 0；max-warnings 零痕（S3-S5 未动） | **开放**（B 簇·LEDGER「S0-S2✅」与实测有出入→0.6 漂移登记） |
| #155 | ~12 新 prove（tokenstream/db-*、vector-plane-erasure、sse-push 等）逐个评估纳 per-push/nightly（:172） | ci.yml 逐名零命中（0.1） | **开放**（D 簇·归置表=§8 裁①） |
| #98 | 隔离库主链 E2E 纳 nightly+发布门（:168） | ci.yml:294-297 闸注释+nightly 零 e2e | **S7 用户闸·排除登记**（§3） |
| #240 | 主链 A1-A5 断言补齐进 nightly 与 #98 一起（:315） | golden.spec 终态多臂同族 :311 | **S7 用户闸·排除登记**（断言钉死半随 #98 同批） |
| #114 | neg:auth/resume/interview/commerce/input+uc033 纳 CI·复用 api:validate 隔离库方式（:251） | 根 package.json:98-110 五 neg:*+neg:all 脚本在；ci.yml 仅 :152 neg:bend；run-e2e-isolated.mjs:89 `LIVE_E2E_TARGETS={'e2e:prove','e2e:ui','performance:e2e'}`——neg:*/**不在 live 集·无 MODEL_API_KEY 可跑**（:2319 仅 fake-service-flag 断言）；api:validate 同 runner 已在 CI | **开放**（C 簇·不被 S7 闸·关键判据） |
| #175 | 恢复逐列+约束比对门，**或**删 sql/ 镜像+neg 夹具改迁移建库（:276 两径） | packages/db/sql/ 仍存在（01/02/03_schema 族实测）；ci.yml drift 零命中；`"drift"` script 已从 package.json 消失（替换后未复活） | **开放**（E 簇·两径=§8 裁②） |
| #113 | adaptive-attack 接 nightly（配 key 硬门）+security.proof ⑤ 两条近同义反复改真实注入回放（:250） | nightly 无 attack；apps/worker/test/security.proof.ts:53-56 在 | **拆分**：keyed 半=S7 闸排除；⑤ 改写半=**开放**（G 簇） |
| #97 | 缺 key 视为失败/skipped 告警+评测阈值硬门（:243） | nightly.yml:40/54/64 skip-if-absent、:49/:57 continue-on-error 原样 | **S7 用户闸·排除登记**（无 key 时 fail 化=nightly 恒红·必须先有 key 决策） |
| #99 | 静态契约/假依赖/真集成三类标签+组件测试+覆盖率（:244） | 零刀触 | **开放**（G 簇·标签面先行·组件/覆盖率为 §8 裁⑥ 后续批） |
| #147 | 标注静态门+删恒真断言（:405） | tenant-wiring-e5.proof.ts:84 `A(..., true)` 恒真仍在（亲读） | **开放**（G 簇） |
| #159 | model_first_token 标注未接线+proof 改名 fake-seam（:271） | tokstream-*.md 卷 rg #159 零命中（未被认领） | **开放**（G 簇） |
| #169 | worker/src 31 个 r4-*（7,163 行）迁 evidence/test·生产镜像不含（:275） | `ls apps/worker/src \| grep -c ^r4-` = **31 仍在** | **开放**（F 簇·形态=§8 裁③） |
| #226 | recruiter:prove+recruiting-bound 纳 nightly+终态钉死单一臂（:451） | recruiter:prove:raw package.json:209 在·workflows 零命中·**不在 LIVE_E2E_TARGETS（无 key）**；recruiting-bound.spec.ts:137/:285/:311 Promise.any 多臂仍在 | **开放**（F 簇·钉臂语义=§8 裁④） |
| #176 | uc018 在 Linux 拓扑验证并写明网络参数（:420） | scripts/uc018-perf-load-capped-child.mjs 头注 Docker caps 自述；CI runner=ubuntu 即 Linux 拓扑 | **开放**（D 簇随归置表·CI 纳入即天然 Linux 验证面） |
| #177 | S2 探针保留但 egress 清单登记·门禁按 #178 修（:421） | provider-egress-inventory.json:1250/:1765 `source: scripts/tokstream-s2-probe.mjs` **已登记**；#178 已闭（JSON parse 实测 OK·冲突标记 0·:78-81 prove 已纳） | **残值≈0**（复核性残面并入 G 簇·不单独计件） |

### 0.3 MIG-RUNNER 裁③交点（唯一交点·现状在飞形态）
`line/mig-runner` @a09e35a2（REQUEST 已落卷 `draft:awaiting_pre_exec_dual`）工作树 meetwise-mig **有未提交在飞码面**：`?? scripts/check-migration-version-uniqueness.mjs`（#140 修法②·数值前缀唯一性门·豁免登记面 0143/0152/0160·自包含零 workspace import·EXIT 0/1 语义）+`M .github/workflows/ci.yml`（db:prove 后 migrate:prove 前插一步·步骤名自述「MIG-RUNNER 裁决项③ 本刀落码·**CI-WIRING 只登记接线归属**」）。即裁③已按 MIG 卷 §8-③ 倾向落定：**唯一性检查=per-push verify·MIG 落码·本刀零触该步**，本刀义务=接线归属登记（本卷 §0.3 即登记·EXEC 收据复诵）。MIG 卷 :111「未决期间两刀两不动」随落定自动解除。⚠️ 该步合并后 ci.yml 行号整体 +2——EXEC 重 pin 锚。

### 0.4 近期刀顺带面查重（逐件判）
① **regfix 组8 脱敏钩**：已落 CI（ci.yml:56-59 secret-redaction scan 实测在）——非本刀件。② **G7FIX 系**（g7fix1-5 卷）：rg `ci.yml|nightly` **零命中**——纯 e2e driver 面·零交。③ **extrev-deps-audit**：deps-audit.yml 独立文件在（42 行）·其卷自缚「ci.yml 既有步骤零改」——零交·本刀 Ban 该文件。④ **TOKSTREAM**：#159 未认领·#177 已由 egress 登记消化（0.2）——零冲突。⑤ **#178**：批0 已闭（15/15）·「CI 先恢复变绿」前置依赖**已释放**——本刀不被闸。

### 0.5 依赖与闸
**被谁闸**：S7（TASK-SOP:96·「授权范围须定义：端点清单+费用上限+**是否含 CI MODEL_API_KEY（5D）**与 voice key」）——keyed 件 #98/#240/#97/#113-keyed 半显式排除（§3）·**登记不预支**；S7 解后 keyed nightly 归宿仍归本刀卷登记面（§4）。批5 序 MIG（EXEC 在飞）→AUTHZ（worktree 在飞）→本刀：与 AUTHZ 域不相交·与 MIG 唯一交点已裁断（0.3）·ci.yml 同文件并发面=MIG 已定分一落。**闸谁**：#98/#240 E2E nightly 宿面（G7 trio keyed fresh run 的 CI 归宿）·#97 硬门化·#113 attack 面·#226 nightly 归置·HA 簇告警/备份面部分 R-2x——均收本刀后置或 S7 后置。

### 0.6 漂移登记
issues-master 证据列旧锚 @`2fab7946` vs `2f6662ef` 实测：#114 `:152,272-273,281,283`→现 `:152`/`:283-284` 近准；#96 `ci.yml:134`→`:133-134`；#155 `dbhy1:prove 在 :153-154`→现 `:153-154` 准；#97 nightly 锚 :40/:48-49/:54/:56-57/:64 全准。LEDGER:87「#96 🔒LINT S0-S2✅」vs 实测 S2 半（extends 0/10·0.2）——LEDGER 只读不改·如实登记。任务书行号 TASK-SOP :82→实测 :84·LEDGER :84→实测 :87。

## §1 修法（五簇·只增不改建·ci.yml 既有步骤零改语义·EXEC 立项重 pin）
- **A 簇·#96 typecheck 全包门**：apps/api、apps/worker、packages/db、packages/ai-runtime、packages/domain 各补 `typecheck` script（tsc -p 零 emit）→点亮 turbo.json 既有 `typecheck` task（壳已预置·0.2）→ci.yml verify 加一步 `pnpm turbo typecheck`（置 arch 步 :92 邻位）→修正 strictNullChecks 过期注释（#96 修法列尾句）。web/contracts/e2e 已有门不重复。
- **B 簇·LINT S3-S5 续**（沿 lint-design:54 设计零偏离）：S3 `pnpm dlx` 瞬态 dry-run 全量+四规则真计数钉死+`--max-warnings N` 基线定值（零修复·warn 态·N=§8 裁⑦）；S4 per-workspace `"lint"` script 点亮（≤5 文件/批）；S5 `pnpm turbo lint` 全量绿+收据进 CI（A 簇同步邻位）。format-only diff 若行使须独立 commit 另行授权。
- **C 簇·#114 neg:*+uc033 纳 per-push**：ci.yml verify DB-up 段（:137 后）加 neg:auth/neg:commerce/neg:resume/neg:interview/neg:input+uc033:cross-user-authz 六步（api:validate :283-284 同 runner 同隔离库先例·无 key·0.2 判据）·紧邻 :152 neg:bend 族。归置 per-push（负例门=合并闸语义·不作 nightly 软化）。
- **D 簇·#155+#176 逐件归置**：tokenstream:prove（fake seam）/sse-push:notify:prove/vector-plane-erasure/db-* 族等逐名评估纳 per-push 或 nightly（**无 key 件为限**·LIVE_E2E_TARGETS 三件除外）——归置表=§8 裁① EXEC 定；uc018:perf-load 纳入即 #176 Linux 拓扑验证落实+头注网络参数补写。
- **E 簇·#175 drift 门复活**：两径§8 裁②——径1=逐列+约束比对门复活（packages/db/test 新 proof+ci.yml 一步）；径2=packages/db/sql/ 镜像退役清零+neg 夹具迁移建库 prove 改造。任一径后 drift 面在 CI 零命中状态终结。
- **F 簇·#169+#226**：r4-* 31 文件迁 apps/worker/evidence/（生产入口 import 零化+构建门 :129-134 复用证镜像零含·形态§8 裁③）；recruiter:prove 纳 nightly（无 key）+recruiting-bound.spec.ts 终态 Promise.any 钉死单一臂（:137/:285/:311 三处·期望臂§8 裁④）。
- **G 簇·证明诚实小件**：#147 静态门标注+恒真断言删除（tenant-wiring-e5:84 等）；#159 model_first_token 标注未接线+proof 改名 fake-seam；#113⑤ security.proof:53-56 改真实注入回放断言（keyed attack 半不在本刀）；#99 三类标签（形§8 裁⑥）；#177 残面复核（egress 登记完整性一行复核收据）。

## §2 验收断言候选（pre-exec 双审核对单基面·断言力≥3）
1. **typecheck 门双向**：补 scripts 后 `pnpm turbo typecheck` 全绿 EXIT=0；临时类型错误样本本地 EXIT≠0（负测不落卷不留痕）。
2. **neg CI 六步**：六步入 verify 后 CI 环境 EXIT=0（隔离库·无 secrets）·与 :152 neg:bend 合计 neg 面 7 步；runner 对非 LIVE 目标缺 key 行为=既有语义零改。
3. **drift 门双向**（随裁②径）：恢复式=构造逐列漂移样本 EXIT≠0+现树 EXIT=0；退役式=packages/db/sql 清零+neg 夹具全迁移建库 prove 绿。
4. **lint 收据**：`pnpm turbo lint` EXIT=0+四规则计数与 `--max-warnings N` 基线值入收据。
5. **r4 迁移**：apps/worker/evidence/ 31 文件在·`rg "from .*r4-" apps/worker/src/main.ts apps/worker/src/*consumer*` 零命中·镜像构建门后镜像内 `ls dist` 零 r4。
6. **只增不减**：ci.yml diff 对基线=纯新增行（含 MIG 唯一性步合并后基线）·既有步零改零删零序动；nightly keyed 三步（:34-65）逐字节不动。
7. **钉臂**：recruiting-bound.spec.ts Promise.any 零命中+单臂断言新锚行号。

## §3 范围外（越界即 FAIL）
① **S7 keyed 件显式排除**：#98/#240（E2E nightly+E2E_CLOUD_ISOLATED 云资源）·#97（缺 key fail 化+eval 阈值）·#113 keyed 半（adaptive-attack）——**登记不预支**·S7 未决前任何 secret 引用新增=停手上报。② deps-audit.yml（extrev 面）·deploy.yml·pages/release/governance-history/ha-probe-multi 五件 workflow 零触。③ MIG 唯一性步（0.3）零触。④ e2e 产品码语义零改（#226 限 recruiting-bound.spec.ts 断言面·driver/helper 零触）。⑤ 迁移面零触（migrations/ 零新增零改·MIG 卷地盘）。⑥ secrets 名值零配置零读取新增。⑦ pins 十一值零翻（含 g7SuiteGreen=false——keyed 面排除故 G7 套件绿不被本刀主张）。

## §4 依赖（闸谁/被谁闸）
**被闸**：S7（CI MODEL_API_KEY·§3 排除面）——唯一用户硬闸；#178 前置已闭（0.4-⑤·依赖释放）；批5 序 MIG/AUTHZ 在飞与本刀零同文件冲突（MIG ci.yml 交点已裁断 0.3·AUTHZ api 授权面域不相交）。**闸**：#98/#240/#97/#113-keyed 的 nightly 宿面（S7 解后接线归本刀登记面·后继小步）·#226 nightly 归置·HA 告警面 R-2x 部分。EXEC 后置消费：5C 四子刀新 prove 归置可沿 D 簇归置表先例。

## §5 Ban 列表 + pins（沿 mig-runner 卷 §5 同源逐字誊 + 本刀面增补）

**Ban 列表**（同源逐字誊 + 本刀增补）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（product-campaign-LEDGER/batch-residual-plan/execution-master-checklist/issues-master 行与统计只读引用）；Ban 触 `crag.ts` 决策逻辑与 RAG 面产品码（本刀零相关）；Ban 动 embedding 计算面；Ban 迁移越权（本刀零新迁移·migrations/ 零新增零改动）；Ban 触其他工作树；Ban 伪造已问/已验来源；**本刀增补**：Ban 改 ci.yml 既有步骤语义/顺序/删除（只增不改建·0.3 MIG 步与 :56-59/:78-81/:129-134/:294-297 注释面零触）；Ban 触 nightly.yml keyed 三步与 secrets 引用（§3-①）；Ban 触 deps-audit.yml/deploy.yml 等 §3-② 六件 workflow；Ban secrets 新增配置（S7 未决·发现需要即停手上报）；Ban 弱化既有 prove 断言（G 簇删恒真=删**空证明**非删证明·删后必须补行为断言·只增强不削弱）；Ban fail-open（新门缺件必须 fail-loud）；Ban 洗基线计数（ci.yml 步数只增不减如实宣布）；Ban 生产库直连操作（prove 全隔离 fixture 库）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀全门=静态/隔离库机械断言·零模型外呼·零 secrets 消耗）

## §6 est live=0

本刀零模型真实外呼：全部新增门=typecheck/lint 静态门+隔离库机械断言（api:validate 先例·0.2 C 簇判据）·零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐步登记零外呼口径）。keyed 面（§3-①）全排除故 est live 恒 0。

## §7 markers=0（卫生声明）

本刀改动集（恰 1 .md·`ai-docs/delivery/harness/ci-wiring-REQUEST.md`）**五类标记词 grep 零命中**（起草席自检·命令与回执留 prove）。五类标记词不复抄卷内（避免自匹配·沿 mig-runner/i3 卷 §7 同形制）。

## §8 STOP（开工三条款）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本刀恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**；③EXEC 立项**不得改 §1 修法清单与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。**alone≠dual**（单席自验不计双审）· **Dual PASS ≠ 开工**（PASS 只过审·开工须协调方授权）。

**待双审/EXEC 裁决项**：①#155+#176 归置表（逐名 per-push vs nightly·时长/库需求实测定·无 key 件为限）；②#175 两径（恢复 drift 门 vs sql/ 镜像退役+neg 夹具迁移建库）；③#169 迁移形态（git mv+import 批改 vs re-export 兼容壳过渡·倾向 git mv 零壳）；④#226 终态期望臂（四结算面钉哪臂·须与 B 端产品口径对齐后定）；⑤typecheck 基线强度（全 strict 一步到位 vs 渐进·strictNullChecks 过期注释修挂本刀或 5E）；⑥#99 三类标签形（文件头注 vs 目录约定 vs 清单文件）；⑦LINT S3 `--max-warnings N` 基线值（沿 lint-design 零修复 warn 态·四规则计数定 N）；⑧#113⑤ 注入回放断言样本源（真实回放语料选取·脱敏约束沿组8 钩）。

---

*CI-WIRING REQUEST · 2026-10-11 · draft:awaiting_pre_exec_dual · base `feat/mysql-schema-skeleton` @`2f6662ef`（git log -1 实测 2026-10-11·ptp-archive nail 补记卷）· 分支 `line/ci-wiring` · 工作树 `meetwise-ciw`（git worktree add 本起草席立·建前 worktree list 实查不存在）· 蓝本=批5 位图（TASK-SOP-v2:84+LEDGER :87/:96/:212 逐字）+issues-master 更正版 5D 十五件（:167/:168/:172/:243/:244/:250/:251/:271/:275/:276/:315/:405/:420/:421/:451 逐件誊录判定）+extrev-deps-audit:92/extreview-fix-campaign-SOP:26/:54 归属背书 · 形制沿 mig-runner-REQUEST（meetwise-mig 树 @`a09e35a2`·§0-§8 全·Ban/pins 同源誊录）· 防重双对表过：rg 命中 4 件逐条判定（TASK-SOP/LEDGER=位图槽本体·extrev-deps-audit/extreview-SOP=归属注记非竞品）·checklist 零命中·harness 无同名卷 · 收编判定：真开放 12 件同域（#96/#155/#114/#175/#147/#159/#169/#226/#176/#99/#113⑤/#177 残）·S7 keyed 件 #98/#240/#97/#113 半显式排除登记不预支·#177 残值≈0 并 G 簇 · MIG 裁③交点=已在飞落码（meetwise-mig 未提交 ci.yml+唯一性脚本亲读）·本刀登记归属 per-push 零触 · 顺带面查重：regfix 组8 脱敏钩已落 :56-59·G7FIX 零交·extrev 零交·#178 已闭依赖释放 · §0 六节全实测锚 · §1 五簇 A-G · §2 七条断言 · §8 八裁决项 · 恰 1 .md 零码动 · est live=0 · pins 十一值照抄 · markers=0 · ⛔push · Dual PASS ≠ 开工 · Ban self-approve · alone≠dual*
