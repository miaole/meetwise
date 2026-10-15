# CACHE-OBSERVE-REPIN EXEC 收据（件⑤·七字段）——cache-observe-repin 战役 EXEC 席 · 2026-10-14

工作树 `meetwise-cob` · 分支 `line/cache-observe-repin` · 授权链=起草 `59be71dc` → rev2 落卷 `7edd9934` → 窄域复审 PASS（席 `agent_e2faa007`·双审会签基线干净·可授权 EXEC）→ 协调方 EXEC 明示授权（派单 brief·STOP→executed:awaiting_post_prove_dual）→ EXEC 本卷 · est live=0（门矩阵 proof 全离线/隔离 fixture·零模型外呼·零 Key 加载·零生产操作）· `actualSpendCny=null` 零支出记录。

## ① 门矩阵全表（十四门·EXIT 原值·并线树 `c4122888` 基·交付 commit 前实测）

| # | 门 | 判据 | 实测 | EXIT | 结论 |
|---|---|---|---|---|---|
| 0 | 改前基线 run（恰 1 次·不计 prove·零 retry） | EXIT=1·恰 27 绿 1 红·红臂名含「词面恰三处」=臂一 | EXIT=1·**PASS 27/FAIL 1**·红臂恰=`零计费负臂：invoke.ts 中 cachedInputTokens 词面恰三处（…settle/validUsage 仍零读…）`（臂一）·词符实测（node 同 proof 正则法）=**9** | 1（预期红） | 绿（机制满足） |
| 1 | prove 复绿 | EXIT=0·28/28·臂数≠28 即停 | EXIT=0·**PASS 28/FAIL 0**·`✓ #48 cached_tokens 观测三形证明全部通过`（PASS 名单 diff 见 §②） | 0 | 绿 |
| 2 | 邻面 ag11-settle-relax | 12/12 臂（8 既有+ι/κ/λ/μ·臂数≠12 即停） | `pnpm ag11-settle:prove`（根隔离 wrapper·见偏离②）EXIT=0·**PASS 12/FAIL 0** | 0 | 绿 |
| 3a | model-op00:prove | EXIT=0 | EXIT=0·`✓ MODEL-OP-00 DB 状态机补充回归…全部通过` | 0 | 绿 |
| 3b | model-op02:prove | EXIT=0 | EXIT=0·`✓ MODEL-OP-02 共享 provider 准入/账本/并发/断路器全部通过` | 0 | 绿 |
| 3c | model-op02-endpoint-partition:prove | EXIT=0 | EXIT=0·`✓ AG-08 端点分域相位+对表全部通过` | 0 | 绿 |
| 3d | failover:prove | EXIT=0 | EXIT=0·`✓ failover：仅发送前选健康端点；结果不明不重复派发` | 0 | 绿 |
| 4 | neg:all 六段 | 687（90+90+91+102+179+135） | EXIT=0·**PASS 687/FAIL 0**·六段 ✓ 行=90/90/91/102/179/135（对 §2-4 锚恒等） | 0 | 绿 |
| 5 | interview:prove | 57 臂 | EXIT=0·**PASS 57/FAIL 0**·`✓ 当前 v64 面试链路全部通过` | 0 | 绿 |
| 6 | migrate:prove | EXIT=0·链头届时=204 头 0204 | EXIT=0·`✓ 迁移运行器 全部通过`·链 `ls packages/db/migrations`=**204 文件·头 `0204_ai_cost_cached_input_price.sql`** | 0 | 绿 |
| 7 | drift:prove | EXIT=0 零漂移 | EXIT=0·`✓ schema 无漂移:迁移路径覆盖 sql/ 真相(退役残面经登记豁免·fresh deploy 安全)` | 0 | 绿 |
| 8 | uniqueness | violations=0 | `files=204 violations=0 exemptions=0143,0152,0160` | 0 | 绿 |
| 9 | typecheck | 8/8·0 cached | `pnpm turbo typecheck --force`：`Tasks: 8 successful, 8 total`·`Cached: 0 cached, 8 total` | 0 | 绿 |
| 10 | lint 五值恰等 | web 601/root 5235/api 1421/worker 954/ai-runtime 628·0 errors | `pnpm turbo lint` EXIT=0 `Tasks: 12 successful, 12 total`·五域 `npx eslint .`（域内）：web `601 problems (0 errors, 601 warnings)`+root `5235 (0 errors)`+api `1421 (0 errors)`+worker `954 (0 errors)`+ai-runtime `628 (0 errors)`——五值与 §2-10 钉值逐一恰等 | 0 | 绿 |
| 11 | docs:check | EXIT=0·scanned≤cap 2152（>2152 红停） | `scanned 2151 managed worktree files` ≤ cap **2152**（`scripts/ai-docs/public-text-policy.mjs:90 MAX_FILES = 2_152`·收据+§9 落卷后终树实测·余量 1） | 0 | 绿 |
| 12 | markers 五类 | 改动集零命中 | 改动集（tracked diff 对 base `7ac68ed7`+untracked 收据）五类标记词+冲突标记对运行时组装扫描（同 `scripts/i6-239-gates.proof.mjs:151-163` 口径·词面不入卷防自匹配）**零命中** | 1（零命中） | 绿 |
| 13 | diff 面机检 | 对 `<base>`=并线 merge 第二亲 `7ac68ed7` 恰 2 tracked 路径 | `git diff --numstat 7ac68ed7`=恰 `packages/ai-runtime/test/model-usage-cache-observe.proof.ts`（7+/6−）+`ai-docs/delivery/harness/cache-observe-repin-REQUEST.md`（155+/0− 起草+rev2 两卷·§9 落卷后 numstat 见 §③）+收据目录 untracked（本件） | — | 绿 |
| 14 | 卫生 | 四件 | `pnpm install --frozen-lockfile` EXIT=0 零 lockfile 改·`.env*` ABSENT 四查（仓根/apps/api/apps/worker/packages/db 均 no matches）·`actualSpendCny=null`·est live=0·**运行副效应登记**：typecheck 门曾翻动 `apps/web/tsconfig.tsbuildinfo`（tracked 构建状态件·1/1 行）——`git checkout` 回滚基线（沿 negbend-fix §9 先例·保门 13 恰 2 tracked） | 0 | 绿 |

## ② 改前改后 PASS 名单 diff（§2-1 sort|uniq -c 协议·分母=门 0 改前 run 27）

```
> PASS  cached 贯通负臂（COST-COLUMNS 件②-b 随翻重钉·沿 AG-24 计数钉语义翻转登记先例）：invoke.ts 中 cachedInputTokens 词面恰九处七行（…计数随 COST-COLUMNS 件②-b 授权语义翻转登记不洗）   ←臂一翻绿（门 1 授权面）
< PASS  零计费负臂：价格本零缓存价（价格治理面零 cached 引用·沿 rg 红事实复证形）                        ←臂四旧显示名（件④ 随翻改名）
> PASS  零计费负臂：价格本零供应商 cached 字段词面（cached_tokens/prompt_cache_hit 零引用·cached 价经 COST-COLUMNS 件① 专用列…）  ←臂四新显示名（与 §1-修法 件④ 定稿文本逐字节恒等核验 log==mandated=true）
```

**协议口径如实登记（不洗）**：diff 呈 2 hunk——hunk1=臂一翻绿（§2-1 判据授权面）；hunk2=臂四**显示名**随 §1-修法 件④ 文本随翻改名（断言行字节恒等零触·断言结果 PASS→PASS 零变·改名文本与卷面件④ 定稿逐字节比对恒等）。§2-1「恰 1 条」字面与卷面件④ 必然改名效果相抵=卷内协议措辞口径·非未预期面·非断言弱化（臂数 28 守恒+其余 26 臂 PASS 名逐条零变机检确认）·升级 post 双审核对。

## ③ diff numstat（对 base=并线 merge 第二亲 `7ac68ed7`）

```
155  0  ai-docs/delivery/harness/cache-observe-repin-REQUEST.md   ←起草（59be71dc）+rev2（7edd9934）+§9 EXEC 记录（本 commit）
  7  6  packages/ai-runtime/test/model-usage-cache-observe.proof.ts ←件①-④（本 commit·恰 1 .ts）
```
收据目录 `ai-docs/delivery/receipts/cache-observe-repin/`（本件）untracked（§2-11 口径）。工作树未提交面（门 12/13 实测时点）恰 1 tracked=proof.ts。

## ④ 重 pin 全表（§0 协议·对并线树 `c4122888` 全量复核）

| 锚 | 卷面值 | 复核值 | 判定 |
|---|---|---|---|
| proof.ts blob | `245d6db8`（192 内容行·28 臂） | `245d6db8`·`rg -c "^\s+A\("`=28·wc -l=192 | 恒等零漂 |
| invoke.ts blob | `2320a0f2`（9 词符/7 行） | `2320a0f2`·node 同法=**9 词符**·行分布 `:76/:481/:482/:483/:744/:1044/:1151`·settle 形 `cachedInputTokens ?? 0` 恰 2·型面/span 正则在场 | 恒等·执行前置满足 |
| usage-reconciliation.ts blob | `9f6b5fae`（恒等·零引用） | `9f6b5fae`·rg cached 两词族=0 命中 | 恒等（臂二前提存活） |
| model-client.ts blob | `61471ed4`（emit 恰 2） | `61471ed4`·`emitUsageCacheObservation(req.service`=2 | 恒等（臂三前提存活） |
| model-cost-governance.ts blob | `51b880b7`（供应商词面 0） | `51b880b7`·rg `cached_tokens|prompt_cache_hit`=0 命中（断言存活） | 恒等（臂四前提存活） |
| 迁移链 | 届时 204 头 0204 | `ls`=204·头 `0204_ai_cost_cached_input_price.sql`·uniqueness files=204 | 恒等 |
| cap | 2152（sanction `591d07cf`） | `public-text-policy.mjs:90 MAX_FILES = 2_152` | 恒等 |
| §0.0 在飞交叠复扫 | 全支线两径·基线后新增提交判据 | 三互异顶触 commit `d44c8307`/`8676777c`/`b03d0182` 全数 `merge-base --is-ancestor`=**已 HEAD 祖先**（主线吸收）·零非残枝在飞触面 | 未触停 |

## ⑤ 偏离清单（如实登记·理想零）

1. **§2-1 PASS 名单 diff 协议口径（§② 详）**：2 hunk=臂一翻绿（授权）+臂四显示名随件④ 随翻改名（授权·字节恒等核验）——「恰 1 条」字面与件④ 改名效果相抵的卷内措辞口径·臂数/断言/其余 26 臂零变全守恒·非为绿改断言·升级 post 双审。
2. **门 2 命令形态**：卷面 `pnpm -C apps/worker prove:ag11-settle-relax` 裸跑缺隔离 DB target（`database_config_invalid:database_target_missing` EXIT=1·runner 设计如此）→经根隔离 wrapper `pnpm ag11-settle:prove`（`run-e2e-isolated.mjs` 包同 raw 脚本·cost-columns 收据 §二门 4 同形）EXIT=0 **12/12**——臂数判据恒等·形态差如实登记。
3. **运行副效应回滚 1 件**：typecheck 门翻动 `apps/web/tsconfig.tsbuildinfo`→`git checkout` 回滚（沿 negbend-fix §9 先例·非交付面零内容改动）。
4. **docs:check 计数**：卷面预期 ≈2148·实测 **2151**（+3 归因=并线携入受管文件多于 rev2 算术预估·收据经 `ls-files --others` 入扫口径）——≤cap 2152 判据恒等满足·余量 1·cap sanction 权归协调方零自升。
5. 其余零偏离：修法=恰 1 测试文件 4 处编辑（7+/6−）恒等 §1-修法 件①-④ 定稿文本（逐字节提取套用·零自由发挥）·28 臂守恒·臂二/臂三/其余 24 臂零字节·零产品码零迁移零 SSOT 零依赖升级。

## ⑥ pins 零翻声明 + 停止条件判定

十一值照抄零翻转：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。§1 红事实结论/§5 Ban 列表/§8 停止条件四类/§1-修法定稿文本面零改——四类停止条件全数未触（现场漂移=§0.1 六锚+cap+链头全恒等+§0.0 复扫零非残枝触面+词符=9；机制不满足=门 0 恰 27 绿 1 红臂一+件③ 新断言改后树 GREEN；越界需要=修法恒等恰 1 文件面；验收红不可修=十四门全绿）。

## ⑦ P2 勘正注记（nail 随卷·post 双审会签 PASS 双认授权·append 注记形不洗·上文原文保全不动）

- **勘正 a) 本卷 .md diff numstat 口径（§① 门 13 行+§③）**：两处原记「155+/0−」——勘正为「**193+/0−**（对 base=`7ac68ed7` 终值）」。依据=155 系门 13 实测时点（并线树 `c4122888`·rev2 阶段值）口径；§9 EXEC 记录落卷后终树 `git diff --numstat 7ac68ed7 ec8e19d6` 亲证本卷 REQUEST.md=**193/0**（起草 `59be71dc` 145+→rev2 `7edd9934` 净 +10→EXEC `ec8e19d6` §9 落卷净 +38·三笔各自无误·仅时点口径勘正·§9 落卷后终值=193）。
