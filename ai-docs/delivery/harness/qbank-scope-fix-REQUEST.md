# QBANK-SCOPE-FIX REQUEST — agent 题库 generation 存量红首曝修复刀（directSqlBoundary 直调臂 owner GUC 供给缺位·恰 1 测试文件净 +1 行修·qbank-scope-fix 战役·起草落卷即停）

**Status**: **`draft:awaiting_pre_exec_dual`**（起草席落卷即停·pre-exec 双审两独立外席待派·alone≠dual·Dual PASS ≠ 开工·Ban self-approve · est live=0 · ⛔push）

**席位**：QBANK-SCOPE-FIX 起草席（诊断+起草双责·协调方派·CI 首曝实测立靶=PR #108 verify step 71 run `38728371250`）。
**基线**：`feat/mysql-schema-skeleton` @ `bab69561`（dbhy1-p4-fix nail SSOT commit·fetch 后与 origin tip 恒等亲证 `git rev-parse` 双值 `bab69561…`）· 分支 `line/qbank-scope-fix`（本起草席 `git worktree add ../meetwise-qsf -b line/qbank-scope-fix feat/mysql-schema-skeleton` 亲立·HEAD 落 `bab69561` 亲证）· 工作树 `meetwise-qsf`（仓根同级）。
**立项出处（不自建 SSOT 行——行翻面权归协调方）**：①协调方派单 brief（QBANK-SCOPE-FIX 题库检索域修复刀·CI 首曝实测=run `38728371250` step 71 红·`✗ error: qbank_retrieval_scope_missing`·栈 `apps/worker/test/qbank-generation.proof.ts:556:24 ← packages/db/src/principal.ts:997:15 asPrincipal·23514 check_violation`·日志尾 `migrations applied=203 skipped=0`）；②CI 步定义 `.github/workflows/ci.yml:274-275`（步名「agent 题库 generation（完整迁移 / 不可变 recipe / 完整工件 / 撤销）」→ `pnpm rag-generation:prove`）；③结构范本 `ai-docs/delivery/harness/negbend-fix-REQUEST.md`（§0-§8 形制·基线树在卷 `git cat-file -e` 亲证 EXIT=0）；④修法语义先例 `ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md`（裁决⑧ setup 补 GUC 授权·`3303f991`）+sibling 夹具先例两处（`apps/worker/test/qbank-integrity-upgrade.proof.ts:258`/`:368`·`apps/worker/test/qbank-retrieval-eval-pg.proof.ts:142`——「AG39 裁决⑧ setup 注入」行在位绿）。

## §0 现状锚（起草席亲读·file:line+blob 逐条 rg(-a)/sed/Read/git hash-object 实测 @`bab69561`·**EXEC 立项照本节对届时 tip 再重 pin**——基线漂移如实改锚·结论不变则只更行号）

### 0.0 防重双对表

- `git worktree list` 建后 **24 树**（主仓+23 树含本 qsf）——无第二 qbank-scope 同名树；`git branch --list "line/qbank-scope*"` 恰 1 命中=本席分支。
- `ls ai-docs/delivery/harness/ | grep qbank-scope` 建前零命中→落卷后唯一同名卷=本卷。
- **在飞交叠复核规则（EXEC 立项日必做）**：本刀唯一产品触面=`apps/worker/test/qbank-generation.proof.ts`（现 blob `02f1675b`·末次产品变更=`b20ee350` qsec 小刀随锚加位·已在主线）。届时对各在飞分支执行 `git log <branch> -1 -- apps/worker/test/qbank-generation.proof.ts` 逐树复核，任一分支顶对该文件存在主线 `bab69561` 之后的新增提交→触停止条件「现场漂移」停手上报。

### 0.1 blob 锚表（`git hash-object` 亲算 @`bab69561`）

| 文件 | blob（8 hex） | 关键行锚 |
|---|---|---|
| `apps/worker/test/qbank-generation.proof.ts` | `02f1675b`（640 行·**含 6 枚裸 NUL 字节：行 `:380`×2/`:384`×2/`:385`×2·系 cache-key 模板串分隔符惯例非文件损坏——rg 判二进制静默跳过的结构根源·§1.2-④**） | **`:21` OWNER=`qgen-reader`+METADATA（v1/backend/general 夹具）·`:536-542` scopeMissingProbe（内捕错探针·asPrincipal 事务）·`:543-549` 五 RAISE 探针臂（**故意无 GUC**=断言面）·`:550-551` scopeMissingRaise 判定·`:553` directSqlBoundary=asPrincipal 开事务·`:554-555` 仅设 serving 双 GUC（**本刀修法点**）·`:556-559` retiredAnn 直调 `qbank_generation_ann_search`（CI 栈 `:556:24`）·`:576-578` retired/bounded 判定·`:581` 「双空 GUC 直调五函数逐一报错」断言·`:582-583` boundary 断言（retired 0 行+封顶 ≤50）** |
| `packages/db/migrations/0187_qbank_owner_scoped_retrieval.sql` | `5eee1f56`（324 行·AG39 EXEC `1408d8c2` 2026-10-13 落·**本红引入迁移**） | **`:46-68` 断言助手 owner 维度并入·`:52-55` serving 双空判定先行（0176 原判定·顺序不动）·`:58-59` 读 `app.qbank_owner_kind`/`app.qbank_org_id`·`:60-63` 四非法形（缺失/kind 第三值/org 半缺/platform 带非空 org_id）·`:64` owner RAISE `'qbank_retrieval_scope_missing'` ERRCODE check_violation（**本红抛点·message/code 与 serving 双空恒等=P2-c**）·`:11-16` 镜像纪律头注（不回改 0106/0144/0146/0176 原文）** |
| `packages/db/migrations/0176_qbank_control_plane_authz_closeout.sql` | `38c1ec22`（363 行·qsec 小刀 `b20ee350` 权威体） | `:118-135` 助手初形（仅 serving 维度）·`:124-127` serving 双空 RAISE·`:27-33` REVOKE PUBLIC+GRANT qbank_control_definer |
| `packages/db/src/qbank/qbank-generation-retrieval.ts` | `2c5ed849`（317 行） | **`:88-96` `setServingScope` 四 GUC 恒供给·`:89` scope undefined 直接 return（fail-closed 契约）·`:93-95` owner 缺省 `platform`+空串（生产路径零嫌疑的机制根据）**·`:76-86` 头注自证「two-field callers keep byte-identical platform-era behavior」 |
| `packages/db/src/principal.ts` | `c31cbac0`（2123 行） | `:991-1001` asPrincipal（`:994` BEGIN·`:995` SET LOCAL ROLE app_role·`:996` principal GUC·`:997` `await fn(c)`=**CI 栈第二帧（传播帧非抛点）**·`:1000` ROLLBACK 后 rethrow） |
| `.github/workflows/ci.yml` | `97252708`（361 行） | `:274-275` 步 71「agent 题库 generation」→ `pnpm rag-generation:prove` |
| `ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md` | `3303f991`（233 行） | `:130` 裁决项⑧（九文件逐 file:line 枚举+rev3 开放判据兜底=「rg 普查」·**枚举与兜底均无本刀触面文件=双盲区实证**）·`:201` 裁决⑧ 行·`:18` 断言语义 P2-c（message 恒等钉死） |
| `scripts/ai-docs/public-text-policy.mjs` | `7937bafa` | `:87` `MAX_FILES = 2_144`（PTP cap·sanction 权归协调方·`:299`/:356 越限判定） |
| `packages/db/migrations/0186_qbank_org_owner_columns.sql` | —（只读引用） | `:24-25`/`:48` owner 列 `NOT NULL DEFAULT 'platform'`（存量零回填）——**夹具语料 platform 属主的列层根据** |
| `apps/worker/src/qbank-generation.ts` | —（只读引用） | `:288`/`:337` owner 缺省 `'platform'` 穿链（投影写手·夹具生成行 owner_kind='platform' 的写层根据） |

### 0.2 派单简报漂移登记（结论零变·如实改锚）

1. **简报「CHECK 约束 or RAISE？」→ 定谳=RAISE 非列 CHECK**：全仓 `qbank_retrieval_scope_missing` 抛点共三处 SQL=0176`:126`（serving 双空·初形）+0187`:54`（serving 臂镜像重申）+0187`:64`（owner 维度·**本红实际抛点**）——全为 `RAISE EXCEPTION … USING ERRCODE='check_violation'`（23514 借码·`0176:101-103` 头注自证「不占 42501」设计）。0186 列层 CHECK（platform→org_id IS NULL 等）系数据一致性另一面，与本红零接触。
2. **简报栈帧 `principal.ts:997:15 asPrincipal` → 定谳=传播帧非抛点**：`:997` 是 `await fn(c)`（回调调用点），真实抛点=DB 端 RAISE 经 `:1000` catch-ROLLBACK-rethrow 透传——CI 错误签名与该帧逐字相容。
3. **简报「双 serving-scope GUC 已设下仍抛的机制」→ 定谳=抛者非 serving 臂**：`:554-555` 确已设 `app.qbank_serving_scope`+`app.qbank_taxonomy_version` 双 GUC→0187`:52-55` serving 先行判定 PASS；抛的是 **0187 新增 owner 臂 `:64`**（owner 双 GUC 未供给→`:60` 第一非法形 `v_owner_kind IS NULL`）——owner 臂 message/code 与 serving 场景**刻意恒等**（AG39 P2-c 断言面兼容设计），故 CI 签名只见 message、表观「已设仍抛」，实为第二维度缺供给。
4. **简报「哪笔迁移/代码引入——0187 qbank 域？」→ 坐实=0187（`1408d8c2` AG39 EXEC·2026-10-13）**：`git log -S "qbank_owner_kind" -- packages/db/migrations` 恰两命中=`1408d8c2`（引入）+`45b14757`（cap sanction 卷面）亲证；0176 时代该直调臂绿（助手仅 serving 维度·`:554-555` 双 GUC 足以通过）。
5. **简报「0c06033d 起三树同红·存量红首曝」→ 时序亲证**：`git merge-base --is-ancestor 1408d8c2 0c06033d` EXIT=0=红自 `1408d8c2`（10-13）在链；`0c06033d`（ci-red-clear nail SSOT·10-15）清欠更早步红（gitleaks/egress/僵尸步）后 step 71 首次可达→存量红首曝。「三树同红」系派单 brief 观测口径（主线+两战役树），本卷不重测 CI、以改前必做 run 复核。
6. **简报「前 32 臂 PASS」→ 结构相容**：`:556` 抛点先于 `:581`/`:582` 两断言行执行，此前臂全走生产 writer/retrieval 路径（`setServingScope` 四 GUC 在先）——首曝红为**未捕获异常**（`✗ error:` 形）非断言红，与臂计数口径相容；精确分母以改前必做 run 实测为准。

### 0.3 迁移号登记（预期零迁移）

- 主线链顶实测：`ls packages/db/migrations | wc -l`=**203**·头 `0203_gateway_model_invocation_backlog.sql`（与 SSOT 题面「链 203 头 0203」恒等·`0203` 归 reconcile-retry 刀 #10）。
- 本刀修法=纯测试夹具一行（§1-修法件①）·**预期零迁移零 DDL**。协调规则：EXEC 期若实测产生非预期迁移需求→**停（越界需要类）上报**，认领号=对届时主线链顶亲数+在飞分支题面复核后取最小未占号顺延（零硬编码·沿 AG39 改占勘误先例）·Ban 抢号 Ban 私占。

## §1 红事实（机制链·全部亲证·「与 X 一致」≠「X 已证」措辞纪律全卷适用）

### 1.1 CI 首曝形（观测面）

- run `38728371250`·PR #108·verify step 71（`97252708` `:274-275`）：`pnpm rag-generation:prove`（root `package.json:562`→`scripts/run-e2e-isolated.mjs` 隔离容器→`pnpm -C apps/worker prove:qbank-generation`·`apps/worker/package.json:60`→`tsx test/qbank-generation.proof.ts`）。
- 隔离容器真迁移链 `applied=203 skipped=0`（简报日志尾·与链顶亲证恒等）→ **0187 在效**。
- 前 32 臂 PASS 后 `✗ error: qbank_retrieval_scope_missing`（23514 check_violation）·栈=`qbank-generation.proof.ts:556:24 ← principal.ts:997:15`——与 §0.1 两锚行逐字相容。

### 1.2 根因链（四环·每环独立亲证）

- **环①（抛点）**：0187 断言助手 owner 臂（`5eee1f56` `:60-64`）——owner 双 GUC 缺失即 RAISE，message/code 与 serving 双空场景恒等。serving 先行判定（`:52-55`）在本红场景 PASS（双 GUC 已设）→ 抛点定谳 `:64`。
- **环②（驱动路径）**：`directSqlBoundary` 直调臂（`02f1675b` `:553-583`）——qsec 小刀 `b20ee350` 随锚加位的「直接 SQL 边界」断言半：asPrincipal 事务内设 serving 双 GUC（`:554-555`）后直调五函数断言 retired 0 行/超大 k·refs 库内封顶（`:556-578`→`:582-583`）。该臂 **0176 时代绿**（助手仅 serving 维度·双 GUC 足以通过），0187 上链后 owner 维度缺供给→`:556` 首查询即抛（未捕获→进程级 `✗ error`）。五函数经 InitPlan 拍前求值助手（`0176:17-24` 头注自证）·空集同样可靠触发。
- **环③（生产面零嫌疑）**：`setServingScope`（`2c5ed849` `:88-96`）scope 在场时**恒供给四 GUC**（owner 缺省 `platform`+空串·`:93-95`）+`retrieval-store.ts:76` 直连点同供——生产与前 32 臂（走 `ensureActiveQbankGeneration`/`search()` 生产路径）全绿的结构根据；夹具语料行属主=platform（0186 `DEFAULT 'platform'` 列层+writer `:288`/`:337` 写层双证）——owner 供给形 `platform`+空串 与夹具逐位匹配。
- **环④（归因+漏枚举机制）**：AG39 EXEC `1408d8c2` 落 0187 时，裁决⑧「受影响 proof setup 段补两 owner GUC」对九文件逐 file:line 枚举（`3303f991` `:130`/`:201`）+rev3 开放判据兜底=「rg 普查（受影响 proof 全集=对五函数任一活调用且 setup 未含两 owner GUC 者）」——**普查工具盲区**：`apps/worker/test/qbank-generation.proof.ts` 含 6 枚裸 NUL 字节（`:380`/`:384`/`:385` cache-key 模板串分隔符·仓内多文件惯例：`qbank-generation-projection.ts`/`qbank-provider-input.ts`/`qbank-miss.ts`/`neg-auth`/`neg-input`/`neg-resume` 三 proof 同象·`git ls-files`+perl 逐字节亲证）→ rg 15.1.0 判二进制**静默跳过**（本席实测：全仓两次 `rg` 普查命中清单均无此文件；单文件显式 `rg` 报 "binary file matches (found \0 byte)"）→ 该文件落入枚举与兜底双盲区→directSqlBoundary 臂未获 owner GUC 供给→存量红。sibling 对照=九枚举文件全数在位（`qbank-integrity-upgrade.proof.ts:258`/`:368`+`qbank-retrieval-eval-pg.proof.ts:142` 等「AG39 裁决⑧ setup 注入」行）。
- **首曝时序**：红自 `1408d8c2`（10-13）在链，CI ≥60 轮被更早步红掩蔽；`0c06033d`（10-15 ci-red-clear nail）清欠后 step 71 首曝——「存量红首曝」定性成立（§0.2-5 is-ancestor 亲证）。

### 1.3 修法候选淘汰登记（防 EXEC 期重开）

- **候选甲（采纳）=派单方向 (a)：proof 夹具补 owner GUC 供给**——directSqlBoundary 事务内照 AG39 裁决⑧ canonical 形（`owner_kind='platform'`+`org_id=''`）补一行，与 sibling 两 proof 先例逐字同形（§1-修法件①）。定性=setup 注入非断言改动（AG39 裁决⑧ 原口径）·零语义翻面。
- **候选乙（否决·Ban）=派单方向 (b)：产品 CHECK/RAISE 语义修**（owner 缺失静默降级 platform / message 分叉 / 放宽助手）——0187 fail-closed 语义=AG39 rev2 B2 **协调方裁决行使**（「严格 RAISE fail-closed 维持」·`3303f991` `:137`）+README 决策原文「绝不静默降级」+三面断言承重（qbank-control-sec B1-B5 五臂 `:106-115`·ag39 isolation ②-d 四臂 `:215-234`·rag04 `:331-332`）——动产品语义即翻用户决策+翻三断言面，爆炸半径不可界。否决。
- **候选丙（否决·Ban）=拔除 proof 内 6 枚裸 NUL 使 rg 可见**——NUL 系 cache-key 分隔语义数据（改之即改缓存键形状·升维成本+邻面爆炸）；且非本红必要路径（候选甲一行即绿）。普查工具结构陷阱（rg 对 NUL 文件静默跳过）如实登记 STILL OPEN 候选（归后继 docs/工具刀·见 §4-④）。否决。

## §1-修法（权限链修复刀·预期恰 1 测试文件净 +1 行·零迁移零产品码零断言改动）

- **件①（唯一码改）**：`apps/worker/test/qbank-generation.proof.ts` `:555` 之后、`:556` 首查询之前插入恰一行（回调参数名=`c`·`02f1675b` `:553` 亲证；值=字面量无参·照 `qbank-integrity-upgrade.proof.ts:258` sibling 先例同形换绑 `c`）：

  ```ts
      await c.query("SELECT set_config('app.qbank_owner_kind','platform',true), set_config('app.qbank_org_id','',true)");   // AG39 裁决⑧ setup 注入（qbank-scope-fix 刀·0187 owner 维度夹具供给）
  ```

  **diff 预期=恰 1 文件净 +1 行·其余 tracked 树零改**。语义钉死三点：①值=裁决⑧ canonical 形 `platform`+空串（`org_id` 空串经助手 NULLIF 归一=P2-e·platform+空 恒合法组合）·与夹具语料 platform 属主逐位匹配（§1.2-环③）→retired 0 行/封顶 ≤50 判定（`:576-578`）恢复 0176 时代逐位行为；②落点=同一 asPrincipal 事务内、`set_config(…,true)`=SET LOCAL 事务级（`2c5ed849` `:77-79` 契约注释自证）→零跨事务泄漏；③五探针 RAISE 臂（`:543-551`·故意无 GUC）与 `:581`/`:582-583` 断言本体**零字节改**——探针臂在 0187 下 serving 双空先行判定（`:52-55` 先于 owner 判定）仍命中原 message，RAISE 断言面原值维持。
- **件②（prove·恰 1 run 零 retry-to-green）**：①**改前基线 run 必做一次**（不计 prove·零冲销纪律）：`pnpm rag-generation:prove` 于改前树取红证据（预期 EXIT=1·`error: qbank_retrieval_scope_missing`·栈 `:556:24 ← principal.ts:997:15`·与 CI run `38728371250` 同签名）入收据；②改后 `pnpm rag-generation:prove` 恰 1 run 期望 EXIT=0 全臂绿。红不重跑冲销。
- **件③（收据）**：`ai-docs/delivery/receipts/qbank-scope-fix/00-exec.md`——七字段（门矩阵全表+EXIT 原值+改前改后红绿对照+diff numstat+重 pin 全表+偏离清单+pins 零翻声明）。

## §2 验收断言（pre-exec 双审核对单基面·数字口径以实跑实测为准·基线权威值=bab69561 SSOT/checklist「Line dbhy1-p4-fix nail」段 union 树终值）

1. **rag-generation:prove 复绿（本刀主门）**：`pnpm rag-generation:prove` EXIT=0·改前必做 run 红签名与 CI run `38728371250` 同形（§1-修法件②）·改后恰 1 run 全臂绿零 retry。
2. **qbank 域邻面不回退**：`qbank-control-sec:prove`（26 断言）+`ag39-org-qbank:prove`（50/50）+`qbank-handoff-closure:prove`（16/16）+`qbank-control-role:prove`+`dbhy1:prove`（28/28）+`rag03-filter-locus:prove`/`rag03-hnsw-completeness:prove`/`rag03c-exactk-observe:prove`/`rag04-track-local:prove` 全 EXIT=0（臂总数对基线登记值·任一臂数漂移±1 即触「现场漂移」上报）。
3. **基线红承登面对照**：`qbank-integrity-upgrade:prove`+`qbank-corpus-retrieve:prove` 若红→stash 对照基线树 `bab69561` 同红=承登既登基线（ag39 EXEC「基线红三处单列」口径·零因果）·**改后新红才阻塞**。
4. **neg 邻面**：`neg:all` 六段全绿 EXIT=0·总臂 **687**（90/90/91/102/179/135·±2 熔断上报）·PASS 名单对基线 diff=∅；`interview:prove` EXIT=0 **57 PASS**。
5. **迁移面**：`migrate:prove` EXIT=0 链 **203** 头 0203（届时顺延如实记）+`drift:prove` EXIT=0 零漂+`node scripts/check-migration-version-uniqueness.mjs`→`files=203 violations=0`（豁免 0143/0152/0160 恒等·files 数对届时链顶亲数）。
6. **typecheck**：`pnpm turbo typecheck --force` EXIT=0（8/8·0 cached）。
7. **lint**：`pnpm turbo lint` 12/12·0 cached·五值恰等 web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（恰等·任一越值即停）。
8. **docs:check ≤cap 2144 红——起草期已触·红停上报**：入库面 `bab69561` 实测 **2144=cap 恰等余 0**（本树亲跑 `node scripts/ai-docs/check-docs.mjs` EXIT=0·`PTP_FILE_LIMIT=2_144` `7937bafa :87`）·本卷为唯一新增受管件→落卷即 **2145>2144 EXIT=1**（本席亲证·`public_text_policy:PTP_FILE_LIMIT:2145`）。**cap sanction 归协调方**（沿 `971a4032`/`485a5601`/`4fcbeffb` 三先例形·+N 值由协调方裁·Ban 本席自改 `public-text-policy.mjs`）——sanction 落值前本卷 commit 红停（§8 验收红不可修类）。
9. **markers 五类零新增**：本刀改动集（本卷 .md+件① .ts+收据目录）五类标记词运行时组装词面 grep 零命中（i6-239 口径·词面不复抄卷内防自匹配·命令与回执入收据）。
10. **diff 面机检**：`git diff --numstat <base>` 恰 2 tracked 路径=件① .ts（+1/−0）+本卷 .md（+收据目录 untracked）——多任何 tracked 路径即停（越界需要类）。
11. **卫生**：est live=0（prove 全 run-e2e-isolated 隔离容器·零宿主库直跑）·0 Key 值·`.env*` ABSENT 双向记录·`actualSpendCny=null`。
12. **贴边注意（三条·EXEC 必读）**：①**rg 二进制陷阱**——对 `apps/worker/test/qbank-generation.proof.ts` 的任何 rg 断言/普查必须 `grep -a`/`rg --text`（§1.2-环④ 实证·rg 静默跳过=本红漏枚举机制·Ban 用裸 rg 结论判定本文件）；②turbo 副产 `apps/web/tsconfig.tsbuildinfo` 若被门运行翻动→`git checkout` 回滚保门 10 恰 2 路径（negbend §9 先例形）；③全部 prove 门经 `run-e2e-isolated.mjs` 隔离容器跑·Ban 宿主环境直连跑（夹具真迁移链 203 前提）。

## §3 范围外（边界清单·越界即 FAIL）

1. **产品码零触**：`0176`/`0186`/`0187` 两迁移+`qbank-generation-retrieval.ts`/`retrieval-store.ts`/`principal.ts`/`qbank-generation.ts`/`qbank-owner.ts` 全零字节（候选乙否决沿承）。
2. **断言本体零触**：`02f1675b` 内五探针臂与 `:581`/`:582-583` 断言零字节改——本刀唯一改动=件① +1 行 setup 注入（候选丙沿承·「为绿改断言」Ban）。
3. **NUL 字节零触**：`:380`/`:384`/`:385` 六枚原值保留（cache-key 语义数据·候选丙否决沿承）。
4. **其他 proof 夹具零触**：九枚举文件 owner GUC 已在位（sibling 亲证）·零证明需动；`ag39-org-qbank-isolation.proof.ts` 探针形臂（`:215-234`）系断言面零触。
5. **cap sanction 面零自改**：`scripts/ai-docs/public-text-policy.mjs`（`7937bafa`）零字节——sanction 权归协调方（§2-8）。
6. **共享 SSOT 零改**：checklist/LEDGER/north-star/backlog 只读引用——批表行翻面权归协调方 nail。
7. **零迁移零 DDL**（§0.3）·零 CI/workflow 改·零 runner/wrapper 改·零依赖升级。

## §4 依赖（含 #10/#184 邻域关系）

- **①邻刀 #10（RECONCILE-RETRY 观测化刀·nail merge `06d79106`）**：本刀门矩阵基线权威值出自其 union 树 `a6675d7b` 十二门终值（neg 687/interview 57/链 203 头 0203/typecheck 8/8/lint 五值/docs:check cap 2144）——**cap 2144 sanction 即出自其刀**（`4fcbeffb` 2136→2144·+8 先例形）；其交付面（`0203_gateway_model_invocation_backlog.sql`+backlog 观测链）与本刀触面零交叠。
- **②邻刀 #184（UC184-SLOT-ORDER 取数序修复刀·nail merge `af9ab780`）**：同波并线刀（双亲 `0c06033d`+`971a4032`）——「0c06033d 起三树同红」观测窗内的在飞树之一；其交付面（面试/押题/诊断三控制器取数序+proof 断言翻面 8→5）与本刀触面零交叠；其门值（neg 687/interview 57）为本刀 §2-4 邻面基线。
- **③上游已满足**：0187 在链（`1408d8c2` 已主线）+`setServingScope` 四 GUC 生产面在树（`2c5ed849`）+隔离链 203——红靶=CI run `38728371250` 确认在案。
- **④下游（STILL OPEN 候选·归协调方另裁）**：rg 二进制盲区普查工具纪律（NUL 惯例文件清单 §1.2-环④ 六文件+两 png 除外口径·`grep -a`/`rg --text` 强制）归后继 docs/工具刀；本刀不搭车（§3-5/§5 Ban 借机修）。
- **⑤行翻面与 nail 排序归协调方**；PR #108 verify step 71 翻绿=qbank 域门全表回归前提。

## §5 Ban 列表 + pins

**Ban 列表**：Ban push/force-push（git 写只本 worktree commit·且 sanction 前红停不 commit）；Ban 自批（pre-exec 双审两独立外席·alone≠dual 不代签）；Ban retry-to-green（件② 恰 1 prove run·红不重跑冲销）；Ban 翻 pins（§5 十一值+`actualSpendCny=null` 脚注·零翻转）；Ban 为绿改断言/改测试断言面（§3-2·候选丙沿承）；Ban 触产品码与 0176/0186/0187 owner 语义（§3-1·候选乙否决沿承）；Ban 触 NUL 字节/其他 proof 夹具（§3-3/§3-4）；Ban 迁移 Ban DDL（§0.3 预期零·需则停上报走认领规则）；Ban 改共享 SSOT（§3-6）；Ban 自改 cap/sanction `public-text-policy.mjs`（§3-5·归协调方）；Ban 裸 rg 对 NUL 文件下结论（§2-12①）；Ban 触其他工作树；Ban 伪造已读/已验来源（§0 锚全亲证为本卷前提）；Ban 就地归因红靶外新红（邻面若现新红→如实登记升级·Ban 借机修）；Ban 造 .env*/写 Key 值入树入据；Ban 顺带升级依赖包。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · actualSpendCny=null。

## §6 est live=0（起草 turn·EXEC 期同）

- 起草 turn（本卷）：est live=**0**——零 prove 实跑（全部数=rg(-a)/sed/Read/perl 静态亲证+PTP 探针件临时落删·零模型外呼零 Key 加载零 secrets 零消耗）；EXEC 期 prove 全 run-e2e-isolated 隔离容器零外呼（§2-11 承）。

## §7 markers=0 + 起草自检登记（如实载·含红停）

- 本刀改动集（起草 turn=本卷 1 .md）**五类标记词零命中**（起草席亲跑·运行时组装词面+冲突标记对·回执随 EXEC 收据留痕·词面不复抄卷内防自匹配）。
- **起草自检登记（红停如实载）**：①`node scripts/ai-docs/check-docs.mjs` 改前（基线树）EXIT=0 `scanned 2144`；落卷后 EXIT=1 `public_text_policy:PTP_FILE_LIMIT:2145`（**2145>cap 2144·红停上报**——本卷即唯一增量·cap sanction 归协调方·§2-8/§8 验收红不可修类）；②markers 五类亲跑零命中；③commit 状态=**红停未 commit**（sanction 落值后由协调方指令落卷·⛔push 恒）。

## §8 STOP（开工三条款 + 停止条件四类）

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual · Dual PASS ≠ 开工（PASS 只过审·开工须协调方明示授权）· 本卷不预 claim 任何 post-commit EXIT。** 开工三条款：①pre-exec 双审两外席 **BOTH PASS 落卷**；②**协调方明示 EXEC 授权**（committed SHA 重钉）+**cap sanction 落值**（§2-8·先行）；③EXEC 立项**不得改 §1.2 根因结论与 §5 Ban/pins 与 §1-修法件① 唯一码改面**（改则回炉重审）·立项时照 §0 协议对届时 tip 全量重 pin（行号漂移如实改锚·结论不变只更行号·§0.0 在飞交叠复核必做·§0.2 简报漂移复核）。**停止条件（四类·命中即停手上报·Ban 就地处置）**：
- **现场漂移**：届时 tip 对 §0.1 任一锚 blob/机制漂移且 §1.2 结论受疑（如助手 owner 臂语义改写/`setServingScope` 四 GUC 契约变/直调臂行漂/九枚举文件 sibling 形漂/§0.0 在飞分支对触面文件新增提交）→停·重 pin 回炉。
- **机制不满足**：改后 run 仍红或红形非 `qbank_retrieval_scope_missing`@`:556`（改前 run 签名对 CI `38728371250` 失配同罪）→§1.2 根因链被证伪→停·如实升级协调方回炉（Ban 就地改诊断 Ban 凑绿）。
- **越界需要**：修法诉求超出件① 恰 1 文件 +1 行面（需触产品码/断言面/NUL/其他夹具/迁移/cap 面）→停·另刀或协调方裁决（§1.3 候选乙/丙否决沿承·Ban 就地扩面）。
- **验收红不可修**：§2 门矩阵任一门红且根因不在本刀交付面（邻面新红/lint 五值越/docs:check>cap——**起草期已触·红停在案**）→停·stash 对照亲证基线·如实登记（Ban 借机修）。

## §9 收尾落卷（落卷席·2026-10-15·append 不洗·§0-§8 起草原文零改）

- **cap sanction 落卷行（§2-8 红停解除依据）**：cap 2144→**2152** sanction 已由 COST-COLUMNS 价格列刀落主线——出处两件：**`591d07cf`**（cap 2152 sanction 落值 commit·`public-text-policy.mjs` MAX_FILES 2_144→2_152+越限臂 2152/2153 联动·协调方预 sanction +8 沿 +8 先例·事由=树 2144=cap 零余量+主线并线增量必越·cost-columns 收据+三刀在飞共享余量）+**`f417d8e7`**（cost-columns nail SSOT·现主线 tip `feat/mysql-schema-skeleton` 指向亲证·cap sanction 史落 LEDGER/checklist）。§2-8/§7①/§8「验收红不可修」之 docs:check 红停**就此解除**（sanction 主线生效）。本树 ⛔merge 未并线→本树 cap 常量仍 2144、`docs:check` 本地读数 `PTP_FILE_LIMIT:2146`（2144+本卷+收据）如实入收据·**nail 并线 union 面算术必绿 2146≤2152**·零就地处置（§3-5 sanction 面零自改沿承）。
- **落卷席收尾记录（协调方直令执行·如实载）**：①核卷=Status `draft:awaiting_pre_exec_dual`·无双审会签·§1-修法件① 未落（夹具 blob `02f1675b` 恒等）·git status 恰卷 1 untracked；②夹具落地=perl 字节级恰 1 行（`ad696c38`·47049=46840+209 恰等·NUL 6/6 原值·sibling `qbank-integrity-upgrade.proof.ts:258` canonical 形同形换绑 `c`·探针臂与断言本体零字节改）；③prove=改前基线红 run 必做（`applied=203`→30 臂 PASS→`✗ qbank_retrieval_scope_missing`@`:556:24←principal.ts:997:15`·与 CI run `38728371250` 同签名）→改后恰 1 run **EXIT=0 红翻绿 40 臂全 PASS**（两关键臂=探针 RAISE 断言面零触仍绿+directSqlBoundary 本红抛点臂复绿）·R0 一次容器 boot 基建失败如实登记（未达 prove 面·`pnpm install --frozen-lockfile` 修复·lockfile 零改）·零 retry 零冲销；④复跑四面=主门绿+docs:check（本地读数如实记·见上）+markers 五类零命中+diff 面恰三面（夹具 1 文件 +1/−0+本卷+收据）·§2 其余门按协调方收窄清单未跑（留双审面照 §2 全表行使）；⑤锚重 pin=§0.1 全表零机制漂移（唯一 blob 变更=件① 自改面）·链 203 头 0203·零迁移零 DDL·est live=0·pins 十一值零翻·`.env*` ABSENT。收据=`ai-docs/delivery/receipts/qbank-scope-fix/00-exec.md`（七字段）。
- **STOP 终态置定**：**维持 `draft:awaiting_pre_exec_dual`**（如实演进：前席起草落卷即停·pre-exec 双审两独立外席从未派审·本卷无会签痕迹；落卷席本收尾系协调方直令下的夹具落地面+红线直证·**非完整 EXEC**·本席不代签不 self-approve·alone≠dual）——落码事实与红翻绿直证已如实入卷+收据，**待 pre-exec 双审两外席对「卷+已落码面+收据」一并审**；若双审 BOTH PASS+协调方明示 EXEC/追认授权，post-prove 双审可直接复用本收据 §三 红绿对照与 §四 门读数起步。开工三条款中②之 cap sanction 已兑现（本节首行）·①双审与协调方 EXEC 明示授权仍悬。

---

*QBANK-SCOPE-FIX REQUEST · 2026-10-14 起草 · **`draft:awaiting_pre_exec_dual`** · base `feat/mysql-schema-skeleton` @`bab69561`（origin tip 恒等亲证）· 分支 `line/qbank-scope-fix` · 工作树 `meetwise-qsf`（本起草席立·建前 branch+worktree 双查不存在）· 立项出处=协调方派单 brief（CI run `38728371250` step 71 红靶）+negbend-fix 卷形制+ag39 卷裁决⑧ 语义先例 · 红根因四环=0187 owner 臂 RAISE（`:64`·message 恒等 P2-c 致「已设仍抛」表观矛盾）×directSqlBoundary 直调臂 serving-only 供给（`:554-555`·0176 时代绿）×生产四 GUC 面零嫌疑（`setServingScope` `:88-96`）×AG39 裁决⑧ rg 普查对 NUL 惯例文件静默跳过的工具盲区（六枚裸 NUL `:380/:384/:385`·枚举+兜底双漏）· 归因坐实=`1408d8c2`（2026-10-13·`git log -S` 亲证）·首曝=`0c06033d` 清欠更早步红后（is-ancestor 亲证时序）· 修法裁决=方向 (a) 夹具补 owner GUC（候选甲·照裁决⑧ canonical 形 `platform`+空串·sibling 两 proof 先例同形·恰 1 文件 +1 行）·方向 (b) 产品语义修=否决 Ban（rev2 B2 协调方裁决+三断言面承重）·方向 (c)=否决（NUL 拔除改缓存键语义·工具陷阱归 STILL OPEN）· 门矩阵（主门 rag-generation:prove 复绿+qbank 域九门+neg 687/interview 57+迁移链 203+typecheck/lint 五值+docs:check cap 红停+markers+diff 面机检+卫生·贴边三条=rg 二进制陷阱/tsbuildinfo 回滚/隔离容器）· #10/#184 邻域=门值基线出处+cap sanction 出处+触面零交叠（§4）· 预期零迁移（需则链顶顺延认领）· est live=0 · markers=0 · pins 十一值照抄 · **起草自检红停在案=docs:check 2145>2144（§7②·cap sanction 归协调方·commit 待 sanction 后落）** · 停止条件四类全设 · Ban self-approve · alone≠dual · Dual PASS ≠ 开工 · STOP · ⛔push*
