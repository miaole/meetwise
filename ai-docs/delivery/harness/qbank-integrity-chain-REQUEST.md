# QBANK-INTEGRITY-CHAIN REQUEST（qbank 链窗修复刀 · retrieval 版面探针缝 + integrity 链窗 proof 红翻绿 · docs-only 落卷即停）

**Status**: **`executed:awaiting_post_prove_dual`**（EXEC 落卷·主门 qbank-integrity-upgrade:prove 红翻绿 20 PASS/0 FAIL·门矩阵 §2 全表已跑·两基线红承登非本刀因果如实登记·alone≠dual·Ban self-approve·待 post 双审两外席会签+协调方·⛔push）

**席位**：meetwise 战役「QBANK-INTEGRITY-CHAIN-EXTEND 链窗修复刀」诊断+起草席（docs-only·零码动·单文件落卷）。
**基线**：支线 `line/qbank-integrity-chain` @ `77ba32ab`（本起草席新建·`git worktree add ../meetwise-qit -b line/qbank-integrity-chain 77ba32ab`·工作树 `../meetwise-qit`·仓根同级）。`77ba32ab`=主线 nail（cache-observe-repin 收官卷·并线 feat/mysql-schema-skeleton@`317ea3df` 双亲 `ec8e19d6`+`317ea3df`）；fetch 实测 origin/main=`c4244470`（2026-09-04·**系 `77ba32ab` 祖先**·rev-list 亲证 `origin/main..77ba32ab`=2153/`77ba32ab..origin/main`=0）。**派单前提勘误注（如实登记）**：派单书「origin tip≥77ba32ab」按祖先序实测方向相反——origin/main 包含于 `77ba32ab`；且红签名文件 `packages/db/src/qbank/qbank-generation-retrieval.ts` 在 origin/main **不存在**（`git cat-file -e` 亲证 NOT_ON_ORIGIN·系本仓线栈增文件）→ 切基=本地线栈最新 nail `77ba32ab`（恰符「≥77ba32ab」下界语义·含 origin/main 全集）。
**防重对表（亲证）**：`ls ai-docs/delivery/harness/ | grep -i integrity-chain` → 零命中；`git branch --list line/qbank-integrity-chain` → 仅本刀新建 1 条；worktree list 27 树零 qit 同名。→ **停止条件未触发·可落卷**。
**蓝本**：①qbank-scope-fix post 席1 金标准定谳（本卷诊断起点）：`qbank-integrity-upgrade:prove` EXIT=1·红签名=`error: column "owner_kind" does not exist` @ `packages/db/src/qbank/qbank-generation-retrieval.ts:285:21` ← proof `:261`·「两红异源」定谳成立并精化（见 §1·**列加入 commit 精化为 0201 非 0186/0187·勘误注见 0.2-1**）；②`ai-docs/delivery/harness/ag39-quality-REQUEST.md`（母卷=引入 commit `45b14757` 的 REQUEST·§0/§5/§8 形制同源誊录）；③`ai-docs/delivery/harness/baseline-red5-REQUEST.md` 先例（同 proof 上一红 schema_migrations_steps 权限面已闭·`proof.ts:211` GRANT 行在树亲证 `49c4e401` :211——**本卷红≠该红·机制不同源**）。

## §0 现状锚（起草席亲读·base `77ba32ab` 工作树 `meetwise-qit`·file:line+blob 逐条 sed/rg/git log -L 实测·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 锚表（2026-10-14/15 实测）

| # | 锚 | blob | 实测值 |
|---|---|---|---|
| A1 | `apps/worker/test/qbank-integrity-upgrade.proof.ts:90-96` | `49c4e401` | 链窗四组 filter：`legacy`=`version<='0067_qbank_control_plane_read_boundary'` 全前缀；`hardening`=`<='0068_qbank_content_fact_immutability'` 全前缀；`upgraded`=`<='0072_qbank_question_evidence_definer_rls'` 全前缀；`metadataUpgrade`=`[...upgraded, 0086_qbank_routed_metadata_taxonomy 恰选, 0087_qbank_control_definer_corpus_dependency 恰选]`（**跳 0073-0085·恰选对**） |
| A2 | 同上 `:98-103` | 同上 | 窗形断言原文：「upgrade fixture has the **reviewed** 0067 legacy prefix, 0068..0072 low-privilege suffix, and 0086/0087 metadata hardening pair」→ 窗=**受审历史钉**非链深控制 |
| A3 | 同上 `:105` / `:253` / `:277-278` / `:554-555` | 同上 | 施工期：`:105` legacy（≤0067 态）→`:253` firstHardening=hardening（≤0068 态·经 `runMigrationsAsRole(migrationRole,…)` 低权角色实跑）→`:277-278` upgraded×2（≤0072 态·幂等双跑）→`:554-555` metadataUpgrade×2（终态=≤0072+0086+0087） |
| A4 | 同上 `:258` | 同上 | `set_config('app.qbank_owner_kind','platform',true)+set_config('app.qbank_org_id','',true)`（AG39 裁决⑧ setup 注入·`:261` 红前亲证已执行=GUC 供给面无关·纯列缺位） |
| A5 | 同上 `:261-264` | 同上 | `const hits = await hybridQbankSearch(client,{query:'历史正文漂移',embedding:…,k:10,expectedRecipeId:…})`——**红首发点**（schema≤0068 态） |
| A6 | 同上 `:363-371` | 同上 | 第二检索块 `:371` 同函数再调（schema≤0072 态·upgrade 后隔离臂）——**红第二落点** |
| A7 | 同上 `:270-275` / `:381-386`（rev2 ±1 勘） | 同上 | 断言核心=dirty refId 在 hits/lexical/evidence 全排除+clean 源 byte-for-byte 存活（`:385-386`·rev2 同拍勘）——**历史态上的现行读边界隔离力·本刀禁弱化面** |
| A8 | `packages/db/src/qbank/qbank-generation-retrieval.ts:285` | `2c5ed849` | `SELECT ref_id, distance, owner_kind FROM qbank_generation_ann_search($1,$2::vector,$3)`——**红签名行（42703）** |
| A9 | 同上 `:289`（rev2 ±1 勘） | 同上 | `SELECT ref_id, lexical_score, owner_kind FROM qbank_generation_lexical_search($1,$2,$3)`——同源第二列面（rrf 臂·dense 默认下不达） |
| A10 | 同上 `:158-162` | 同上 | `retrievalMode(undefined)→'dense'`——dense 默认使 `:285` 恒先于 `:289` 执行=红首发于 `:285` 的机械成因 |
| A11 | 同上 `:165` / `:219` / `:196-197` / `:222` / `:308` | 同上 | 既有探针缝先例×2（`to_regprocedure('qbank_active_generation_metadata()')` fail-closed 探针+`to_regclass('qbank_question')` 在位探针）；取证三面 SELECT 恒 legacy 稳定列（`ref_id,excerpt`/`question_id,hit_rank,evidence`/`ref_id,distance`·`45b14757` 零触） |
| A12 | 同上 `:290-294`（rev2 ±1 勘） | 同上 | `45b14757` 随码头注：「AG39 quality follow-up (migration 0201)…ownerRank（org=0/platform=1）→ fused score → refId 三级稳定序…never weakens or replaces」+`ownerRank(unknown)=1`（`:294`·undefined 缺省 platform 秩） |
| A13 | `packages/db/migrations/0067_qbank_control_plane_read_boundary.sql:69-70` | `5188d0c2` | 窗内最后一次 ann_search 体定义：`CREATE OR REPLACE FUNCTION qbank_generation_ann_search(p_generation text, p_embedding vector, p_k integer) RETURNS TABLE(ref_id text, distance double precision)`——**无 owner_kind**（全文 `owner_kind` 计数=0 亲证） |
| A14 | `packages/db/migrations/0068_qbank_content_fact_immutability.sql:151/168/185/208` | `9b858f89` | 0068 对 ann_search 仅 `::regprocedure` 常量接线（candidate 视图 RLS 策略依赖）·**体零改** |
| A15 | `packages/db/migrations/0186_qbank_org_owner_columns.sql:48-49/62-63/76-77/92-93` | `bba0666c` | 四层**表** owner 列（source/chunk/question/generation_chunk 各 owner_kind+org_id）——**函数返回面零触** |
| A16 | `packages/db/migrations/0187_qbank_owner_scoped_retrieval.sql:77-78` | `5eee1f56` | `tf_qbank_generation_ann_search … RETURNS TABLE(ref_id text, distance double precision)`——**0187 返回面仍无 owner_kind**（owner 秩仅入 WHERE/ORDER BY·lexical 同 `:121`） |
| A17 | `packages/db/migrations/0201_qbank_fusion_owner_rank_org_dedup.sql:64-67` | `acfa1efc` | `DROP FUNCTION … tf_qbank_generation_ann_search` + `CREATE FUNCTION … RETURNS TABLE(ref_id text, distance double precision, owner_kind text)`——**owner_kind 输出列加入点=0201**（头注 `:17-19` additive 末列自述·`:124-125` 薄壳 DROP+CREATE 同拍） |
| A18 | `git log -L 285,285:packages/db/src/qbank/qbank-generation-retrieval.ts` | — | 行史恰两 commit：`d9394e91`（建文件·`SELECT ref_id, distance` 无 owner_kind）→ **`45b14757`**（2026-10-14「fix(ag39q): cap sanction 翻面——2081」·dense/lexical 两 SELECT 加 owner_kind+融合 ownerRank+迁移 0201 落卷+cache v5→v6）——**retrieval 端引入 commit 定谳**（补记 rev2：`d9394e91` 建于前移路径 `packages/db/src/qbank-generation-retrieval.ts`·`a9d1cbdc` git mv 入 `qbank/`） |
| A19 | `git log -S 'owner_kind' -- 同文件` | — | 恰两 commit=`1408d8c2`（AG39 母刀 EXEC·仅 `setServingScope` 两 GUC 行 `:94-95`·**未触 SELECT 列面**·0186+0187 落卷）+`45b14757`（A18·**红引入点**）——两红异源定谳=本刀承金标准并精化 |
| A20 | ann_search 全演化链（migrations rg 亲证全集） | — | 0029（建·`RETURNS TABLE(ref_id,distance)`）→0067（窗内末次重定义·A13）→0068（regprocedure 接线·A14）→**0106/0138/0139/0144（trigfam 薄壳化 :659-668）/0176（tf_ 镜像 :137）/0186（表列 A15）/0187（owner 谓词+秩·返回面未变 A16）/0201（返回面+owner_kind A17）**——0069-0072/0086/0087 对该函数零触（rg 全集互斥亲证） |
| A21 | `package.json:119` / `:348` / `:558` | — | 门注册：`qbank-integrity-upgrade:prove`→isolated `prove:qbank-integrity-upgrade`；`migrate:prove`；`neg:all`（EXEC 重 pin 勘正：卷面原 `:558`/`:348`/`:119` 首尾两行号与门名对调·现树 sed 亲证 `:119`=主翻门·`:348`=migrate:prove·`:558`=neg:all·三行号均在位） |

### 0.2 实证结论 + 派单勘误注

1. **派单前提勘误（列加入 commit）**：派单书「ann_search 定义演化链 0067→0186/0187 owner_kind 列加入」**精化不成立**——0187 返回面仍 `RETURNS TABLE(ref_id, distance)` 无 owner_kind（A16）；owner_kind 作 ann/lexical **输出列**加入点=**0201**（A17·同一 commit `45b14757` 携带，应用侧 SELECT 与迁移同刀落地自洽）；0186 仅表列（A15）、0187 仅谓词/排序语义（A16）。该勘误为候选甲裁决的承重前提（§1.3-甲）。
2. **红机制定谳（两红异源·金标准成立+精化）**：proof 链窗=受审历史钉（A2），四腿状态终态=≤0072+0086+0087——**该终态在窗内合法地不含 0106-0201 任何函数面演化**；而产品码 `retrieval.ts:285/:289`（A8/A9）自 `45b14757` 起按 ≥0201 版面 SELECT owner_kind。proof 以**现行产品码**穿**历史态**读（fixture 本意=A7 隔离力）→ `:261`（≤0068 腿）首发 42703。红与 GUC 供给面无关（A4 `:258` 注入在先仍红）。
3. **链窗扩长无效性（候选甲否决承重·实证）**：红首发腿=hardening 腿（`:253`→`:261`·schema≤0068）+第二落点 upgrade 腿（`:371`·schema≤0072）——**两腿 schema 由窗定义钉死**；扩窗尾选（0086/0087→…→0187 乃至 0201 全链）不改变 `:253`/`:277` 两腿所到状态→红**恒翻不动**；且 0187 亦无该列（0.2-1）。「0144+ 触发器族在窗实跑副作用/耗时」核（派单书嘱）：扩窗拖 0088-0201 全量（0106 serving scope/0138/0139/0144 trigfam 族 :615+/0176/0186/0187/0190-0199 5B-MIG/0200/0201）入隔离实跑——代价全付而红零翻。
4. **候选乙 Ban 倾向消解（裁决前提）**：产品码「版面探针缝」非 proof 兼容特判——同文件探针先例×2（A11 `to_regprocedure`/`to_regclass`）+ingest `schema-present 探针缝` 同族（`1408d8c2` 卷面自述「allowLegacyMetadataFixture 同族=历史前缀夹具兼容」）+滚动部署/未至 0201 环境同机械可达（版本面容差=真实产品关切）。0201 头注「叠序非替代」语义在 legacy 版面退化为「全 platform 秩=排序逐位恒等旧行为」（A12 `ownerRank(undefined)→1` 落值·sort 逐位回退 score→refId=前 `45b14757` 序）——**强度零减：库内强制/隔离臂（A7）零触，owner 秩仅在 ≥0201 版面参与（探针真值驱动）**。

## §1 红事实 + 归因链（诊断四项定谳）

### 1.1 红事实

`pnpm qbank-integrity-upgrade:prove` EXIT=1：`error: column "owner_kind" does not exist` @ `qbank-generation-retrieval.ts:285:21`，触发点 proof `:261`（hardening 腿·`:253` 施 0068 后的 asPrincipal(owner) 读块）。第二同源落点 `:371`（≤0072 腿）。

### 1.2 归因链（a/b/c/d 全链）

- **a) 链窗机制（A1-A3）**：filter 形=受审历史钉，非链深控制亦非历史 ledger 钉值——`:98` 断言词面自证「**reviewed** 0067 legacy prefix + 0068..0072 low-privilege suffix + 0086/0087 metadata hardening pair」。设计意图=以 0067 时代 legacy 部署态为底、经受审加固对（0068..0072+0086/0087 恰选·跳 0073-0085）升迁，证明**现行读边界**对 legacy 脏数据的隔离力（A7）。四腿（A3）各自由 filter 钉死 schema 状态。
- **b) retrieval 引入 commit（A18-A19）**：`:285/:289` owner_kind 列面由 `45b14757`（ag39q 收尾刀·2026-10-14）引入；`1408d8c2`（母刀）仅注 GUC 未触列面；`d9394e91` 建文件时为 legacy 列面。
- **c) ann_search 演化链（A13-A17+A20）**：0029→0067（窗内末次·无 owner_kind）→0068 接线→[窗外语境] 0106/0138/0139/0144/0176→0186 表列→0187 谓词/秩（返回面未变）→**0201 返回面加 owner_kind**。窗内终态（≤0072+0086+0087）与 0186/0187/0201 零交集。
- **d) 两红异源合成**：产品码版面假设（≥0201）×历史钉 fixture（≤0087 且两中腿更早）→ proof 以现行码穿历史态必红。**红责任面=产品码列面假设无版面容差，非 proof 断言过强、亦非链窗「过短」**。

### 1.3 候选裁决（三候选·否决两·定稿一）

- **候选甲（proof 链窗扩至含 0187）= 否决·三重**：①**靶错**：0187 返回面无 owner_kind（A16·0.2-1 勘误）——扩至 0187 列仍缺位；真列点=0201（A17），而 0201 前置连续前缀（5B-MIG 0190-0199+0200·账本守卫 migrate.ts 连续前缀 fail-closed 先例）→「恰选扩窗」形不成合法窗，只能全链扩。②**腿错**：红发于 `:253`/`:277` 两中腿（0.2-3）——扩窗尾不改变中腿状态，红恒在。③**语义变**：窗=受审历史钉（A2）——动窗即换 fixture 身份；且扩窗拖 0144 trigfam 族等 0088-0201 全量入窗实跑（副作用面/耗时），代价全付红零翻。三重独立成立，任一即否决。
- **候选丙（proof `:261` 断言改形）= 否决**：`:270-275`/`:381-386` 断言=A7 隔离力本体（历史态上现行读边界排 dirty 存 clean）——本 proof 立卷初心；改形=蒙眼，强度必减，违「窗口语义不变强度不减」总纲。
- **候选乙（retrieval 版面探针缝）= 定稿**：唯一不削断言力且可翻绿的候选。Ban 倾向消解理由=0.2-4（同文件探针先例×2+ingest 同族+滚动部署真实关切+legacy 态行为逐位恒等旧版）。落位形见 §1.4。

### 1.4 修法（候选乙定稿·恰几文件几行）

**恰 1 文件**：`packages/db/src/qbank/qbank-generation-retrieval.ts`（blob `2c5ed849`）·预期净 +18~+28/−4~−8 行（EXEC 实测落值入收据）。三件：

1. **探针助手（新·约 7-9 行）**：`ownerSurface(c, 函数名, 签名, 列名)`——`SELECT EXISTS (SELECT 1 FROM pg_proc WHERE oid = to_regprocedure('<名>(<签名>)') AND '<列>' = ANY(proargnames)) AS ok`（EXISTS 形永不 NULL·签名钉 `(text, vector, integer)`/`(text, text, integer)` 现行形）。**探针逐调用执行·Ban 连接级 memo**（proof 池连接跨腿复用+前向演化论证虽使 memo 可辩，零收益不引入陈旧类；探针为目录微查，生产热路径前置 cache v6 缺面才落探针）。**两个静态 SELECT 字面量按探针二择一，Ban 字符串拼接进 SQL**。
2. **`:285` dense 臂**：探针真→现行 SELECT（`ref_id, distance, owner_kind`·行为逐位不变）；探针假→legacy SELECT（`ref_id, distance`）+行 owner_kind 按 undefined 读→`ownerRank(undefined)=1`（A12 既有落值）→融合序逐位=前 `45b14757` 行为。**≥0201 真实链路零字节行为变**。
3. **`:289` lexical 臂**：同形（rrf 臂方达·探针独立调用不跨函数耦合）。

**禁触**：`:158-162` 检索模语义、RRF_K/MAX_K/MAX_CANDIDATES、distance 恒真语义、`:303-304` 排序键融合（rev2 ±1 勘）、`:196-197`/`:222`/`:308` 取证三面、`qbank-retrieval-cache` 键版本（v6 不跳——本刀零语义变·legacy 态行为=恒等旧版即版本语义已含）、probe fail-closed 语义（函数在而列不在=legacy 读；函数不在=既有 `activeQbankGeneration` 先行 fail-closed，探针零新豁免）。

## §2 门矩阵（EXEC 收尾必跑·原样可复制·原值锚=`77ba32ab` nail 门矩阵承卷）

| # | 门 | 命令 | 判据 |
|---|---|---|---|
| 1 | **主翻门** | `pnpm qbank-integrity-upgrade:prove` | **EXIT=0 红翻绿**（`owner_kind` 42703 消解·`:261`+`:371` 两落点全过·臂计数照 `:98` 窗形断言+既有 A 系断言全 PASS 零 FAIL） |
| 2-10 | **qbank 九邻面** | `pnpm qbank-pipeline:prove` / `pnpm qbank-control-sec:prove` / `pnpm qbank-source:prove` / `pnpm qbank-handoff-closure:prove` / `pnpm ag39-org-qbank:prove`（53 臂·承登：27224786 收据偏离②+blob 8b214386 三树恒等·静态恰 51·:148-153 三表循环一臂展三→运行时 53·内锚 EXEC 重 pin 勘正 :149-154→:148-153 现树 sed 亲证）/ `pnpm ag39-quality:prove` / `pnpm rag-cache:prove` / `pnpm rag03-filter-locus:prove` / `pnpm rag03-hnsw-completeness:prove` | 全 EXIT=0 零新红（ag39-org-qbank 53 臂逐位原值·ag39-quality 融合秩/折叠臂原值=≥0201 版面零变实证） |
| 11 | rag-generation | `pnpm rag-generation:prove` | **40/40 EXIT=0**（前置登记 rev2：qbank-scope-fix `6414c562` qbank-generation.proof.ts owner 双 GUC 已随主线 `5ef0b505` nail 携入——纯 `77ba32ab` 基线树本门=已知红（CI step 71）非本刀因果·并主线后 40/40） |
| 12 | migrate | `pnpm migrate:prove` | EXIT=0·**链 204 头 0204**（本刀零新迁移）+`pnpm drift:prove` 零漂 |
| 13 | neg | `pnpm neg:all` | **687/687**（90+90+91+102+179+135） |
| 14 | typecheck | `pnpm turbo typecheck --force` | **8/8 successful（0 cached）EXIT=0** |
| 15 | lint 五值 | `pnpm turbo lint` | 五值恰等承登：web **601**/root **5235**/api **1421**/worker **954**/ai-runtime **628**（触面 db/worker 贴线绿·承登双红如现行登记恒等则如实转录） |
| 16 | docs:check | `node scripts/ai-docs/check-docs.mjs` | EXIT=0（`≤cap 2168`·O1 随落：并线 fb97734c sanction 2160→2168·MAX_FILES=2_168 现树亲证） |
| 17 | markers 五类 | `git diff 77ba32ab -U0` 改动集新增行直扫 | 五类标记词族（词面沿 §7 口径不复抄）**零命中**·预申明：扫描排除判据行自指文本/注释形扫描（消自匹配·rev2 落卷） |
| 18 | diff 面 | `git diff --stat 77ba32ab` | 恰 1 码文件=`packages/db/src/qbank/qbank-generation-retrieval.ts`+本卷 .md；零迁移/零锁文件/零 `.env*` |

## §3 范围外（越界即 FAIL）

1. proof 链窗四组 filter（A1）与 `:98` 窗形断言词面——零字节动（候选甲已否决）。
2. proof 全断言臂（含 `:270-275`/`:381-386`·rev2 ±1 勘）——零弱化零改形（候选丙已否决）。
3. 检索算法常量/dense|rrf 语义/distance 语义/融合排序键/取证三函数面（§1.4 禁触同源）。
4. 缓存键版本与 `qbank-retrieval-cache.ts`（v6 语义已含本刀 legacy 形）——零触。
5. 迁移链（0001-0204 历史字节+新迁移）——零触零加。
6. 0201 头注勘误句/0187 头注（历史字节零改纪律）——零触。
7. 他刀面（ag39 系/cache-observe 系/5B-MIG/cost 系）+其他工作树在飞机——零触。

## §4 依赖

前置已落：0186+0187+0201（A15/A16/A17·母刀卷承卷）+baseline-red5 同 proof 权限面修（`:211` GRANT 在树）——本刀为纯应用层增量缝。无新外依赖、无新 env/配置面、无新迁移。

**前置登记（rev2·P1-R3）**：qbank-scope-fix `6414c562`（qbank-generation.proof.ts owner 双 GUC）已随主线 `5ef0b505` nail 携入——纯 `77ba32ab` 基线树 rag-generation 门=已知红（CI step 71）非本刀因果·并主线后 40/40（§2-11 同源·§8-④ 加注该情形走并主线不回炉）。

**存量观察登记（rev2·席2③）**：0201 不 bump `qbank_cache_epoch`——滚动窗 TTL ≤120s 界定存量陈旧上界·系存量现状观察·非本刀引入·非本刀处置面。

## §5 Ban 列表 + pins（沿母卷同源誊 + 本刀面增删·增删处显式标注）

**Ban 列表**：Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins；Ban 改共享 SSOT（四件+INDEX 只读引用·行翻面权归协调方）；**【本刀面】Ban proof 链窗改**（A1 四组 filter+`:98` 断言零字节）；**【本刀面】Ban proof 断言弱化**（A7 臂零改形）；**Ban 检索算法改动**（RRF_K/MAX_K/MAX_CANDIDATES/candidateK/dense|rrf/distance 恒真·零动）；**Ban 应用层过滤替代库内强制**（探针缝只选列面不替谓词——库内 owner 谓词/秩零触）；**【本刀面】Ban SQL 字符串拼接**（静态字面量二择一）；**【本刀面】Ban 连接级/模块级 memo**（探针逐调用）；**【本刀面】Ban env/test 条件分支形**（探针=目录真值·零环境开关零 proof 特判）；**Ban 触 CRAG 面**；Ban owner GUC 作鉴权根；Ban 静默降级（函数缺位既有 fail-closed 零豁免）；**Ban 历史迁移字节改**（0001-0204 零字节）；Ban 新状态机/新 env 闸/新定时器/新配置面；Ban 顺带升级依赖包（DEPS-AUDIT 域）；Ban 触他刀面与在飞机。

**pins（十一值照抄·零翻转）**：haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀全隔离容器+假体 embedder·零模型外呼·零 secrets·零消耗）。

## §6 est live=0

零模型真实外呼：主翻门与九邻面=隔离容器真迁移链+假体 embedder；typecheck/lint/docs:check/markers=本地门。零生产操作·零凭据落盘（pins 脚注同源·EXEC 收据逐门登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草席恰 1 .md=本卷；EXEC 改动集预期=恰 1 码文件 `packages/db/src/qbank/qbank-generation-retrieval.ts`）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 receipts 形留执行席收据·五类词不复抄卷内防自匹配）；docs:check 落卷前后恒 EXIT=0·卷内全仓内相对径。**扫描形收据申明预登记（rev2·席2①）**：markers 扫描形=注释形词族·沿四卷先例——EXEC 收据申明照此形预登记。

## §8 STOP（开工三条款）+ 裁决项 + 停止条件 + 交付报告格式

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（本卷系 qbank-scope-fix post 席1 定谳红线的执行卷·非授权本身）；③EXEC 立项**不得改 §1.3 裁决与 §1.4 修法方向与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。Context Lock 口径：本卷属会话工单·派单时由主会话显式给路径·执行席不自行检索卷位。

**rev2 注（2026-10-14·落卷席）**：pre-exec 双审修订清单（席1 五项+席2 三项·双席 endorsed）已落卷——逐项落点见 §9·STOP 值不变·rev2 落卷后席1 复审确认方会签（alone≠dual）。

**裁决项（pre-exec 双审/EXEC 行使·四项）**：

1. **候选裁决复核（本卷承重裁决）**：候选甲否决三重（§1.3·0.2-1 勘误为承重前提）vs 双审若持异议须同时反驳 0.2-3 无效性实证——**推荐维持定稿候选乙**。
2. **探针签名钉死形**：§1.4-1 EXISTS+proargnames 形（推荐）vs `pg_get_functiondef` 文本扫描形（脆·不推荐）vs 42703 catch-retry 形（错误路径依赖·备选须双审明示）。
3. **legacy 态 owner 秩缺省值**：platform(1)（推荐=A12 既有落值·排序逐位恒等旧版·零新语义）vs 其他值（=新语义·越 Ban 面）。
4. **双 SELECT 字面量命名与放置**：模块级 const 对（推荐·审计友好）vs 函数内联（EXEC 审美域·零语义差）。

**停止条件（命中即停·四类全覆盖）**：

- **现场漂移**：EXEC 立项重 pin 时 §0 任一锚与现 tip 冲突（`:285` 列面已被他刀再改/`:261` 腿结构变/0201 返回面被改/A1 窗 filter 变）→ 停回炉重锚·不得就地改锚续刀。
- **机制不满足**：修后主翻门若在 `:261` 之后的臂新曝红（如他函数暗藏 owner 列面假设·现 rg 普查仅 `:285`/`:289` 两处=修面已盖全）→ 停回炉按新面改修法·不得带病施工。
- **越界需要**：施工中发现修法必须触及 §3 边界（链窗/断言/算法常量/缓存版本）方能闭环 → 停上报协调方裁决·不得自行扩权。
- **验收红不可修**：九邻面任一原值翻红或 rag-generation 非 40/40 → 停回炉（加注 rev2：rag-generation 若因纯 `77ba32ab` 基线缺 qbank-scope-fix 前置而红=§2-11 已知红——该情形走并主线不回炉）。

**门预申明（EXEC 收尾必跑·§2 表原样）**：主翻门+九邻面+rag-generation+migrate/drift+neg:all+typecheck+lint 五值+docs:check+markers+diff 面（§2 十八行全跑全录）。

**交付报告格式（EXEC 收尾随翻·append 保史·§0-§8 原文零改）**：①门矩阵逐门 EXIT 实测值+主翻门臂计数；②裁决①-④行使结果逐项落值；③改动集文件清单+净行数+markers 五类扫描回执；④`:285`/`:289` 修后形与探针助手 rg 回执；⑤§0 重 pin 漂移登记（如有）+§0.0 式在飞枚举一句（预登记 rev2·席2②）；⑥STOP 翻面建议（`executed:awaiting_post_prove_dual`）归协调方。

**Sibling sections stay as written. alone≠dual · EXIT0≠covered · 实现方不 self-approve。**

**自检**：`node scripts/ai-docs/check-docs.mjs` EXIT=0；markers 五类改动集新增行零命中；STOP 维持 `draft:awaiting_pre_exec_dual`（alone≠dual·待双审复验+协调方授权·⛔push）。rev2 落卷后同两项复跑同绿（§9 回执）——席1 复审确认方会签。

## §9 修订记录（rev2·2026-10-14 落卷·append 保史·§0-§8 除勘正落点外原文零洗）

**授权与窗口**：pre-exec 双审修订清单落卷——席1 五项（P1×3+P2×2）+席2 P2 三条顺手落卷·方向双席 endorsed；draft 态 §8-③ 窗口内修订·零触 §1.3 裁决/§1.4 修法方向/§5 Ban/pins·STOP 值不变。八项逐项落点：

1. **P1-R1**（§2-5 行·ag39-org-qbank:prove）：判据「50 臂原值」→「53 臂（承登：27224786 收据偏离②+blob 8b214386 三树恒等·静态恰 51·:149-154 三表循环一臂展三→运行时 53）」——本席亲证现树静态 A( 计数恰 51·blob 8b214386 恒等；同判据格「50 臂逐位原值」同拍勘正为 53。
2. **P1-R2**（§2-17 行）：判据行内嵌五类标记词族词面（卷内自此零再现）改述为「五类标记词族（词面沿 §7 口径不复抄）零命中」+预申明「扫描排除判据行自指文本/注释形扫描」——消自匹配。
3. **P1-R3**（§2-11 行+§4+§8-④）：补登前置 qbank-scope-fix `6414c562`（qbank-generation.proof.ts owner 双 GUC）已随主线 `5ef0b505` nail 携入——纯 `77ba32ab` 基线树本门=已知红（CI step 71）非本刀因果·并主线后 40/40；§8-④ 加注「该情形走并主线不回炉」。
4. **P2-R4**（§0.1 锚表±1 漂勘正·现树逐条 sed 亲证后落）：A9 :290→:289·A12 :291-295→:290-294+ownerRank :295→:294·A7 :267-274/:375-382→:270-275/:381-386（行内 byte-for-byte 附注 :380-382→:385-386 同拍）·排序键融合锚 :291-295→:303-304（§1.4 禁触行）；同物同号 prose 引用随勘对齐——A10/0.2-2/§1.2-b/§1.4-3/停止条件 rg 普查/交付④ 的 :290→:289·§1.3-丙/§3-2 的 :267-274/:375-382→:270-275/:381-386。
5. **P2-R5**（§0.1-A18 行）：补记 d9394e91 建于前移路径 packages/db/src/qbank-generation-retrieval.ts·a9d1cbdc git mv 入 qbank/。
6. **席2①**（§7）：markers 扫描形收据申明预登记（注释形词族·四卷先例）。
7. **席2②**（§8-交付报告⑤）：收据⑤补 §0.0 式在飞枚举一句预登记。
8. **席2③**（§4）：0201 不 bump qbank_cache_epoch·滚动窗 TTL ≤120s——存量观察登记（非本刀引入非本刀处置面）。

**rev2 自检回执（落卷席亲跑）**：`node scripts/ai-docs/check-docs.mjs` EXIT=0（2154≤cap 2160）；markers 五类 `git diff 77ba32ab -U0` 改动集新增行直扫零命中（词族与冲突标记双查·P1-R2 后词面全卷零再现·命令与回执沿 receipts 形留执行席收据）；改动集仍恰 1 .md=本卷。**STOP 终态**：三处（Status/§8/自检）恒 `draft:awaiting_pre_exec_dual`——rev2 落卷后席1 复审确认方会签·alone≠dual·⛔push。

**rev3 处置摘要（2026-10-16·post 审读席2 P1×2+P2+席1 P2 随卷落·落卷席 append）**：四项勘误以 §11 注记形落卷（P1-R1 A21 勘正倒置改回原值+P1-R2 blob 锚勘正 `3fd0c292`+P2 STOP 生效面=Status :3+§10⑥+席1 P2 探针参数名假阳观察登记）——§0-§10 原文零洗·零码面·改动集恰 1 .md=本卷；markers 新增行直扫零命中（词面运行时组装+冲突标记双查）；docs:check EXIT=0 复跑（≤cap 2168）；**STOP 维持 `executed:awaiting_post_prove_dual`**（勘误随 post 双审会签一并裁·alone≠dual·⛔push）。

## §10 EXEC 记录（2026-10-15/16 EXEC 席落卷·append 保史·§0-§8 正文零改·仅 §0 头款授权内重 pin 锚更行号+O1-O3 随落）

**授权链**：rev2 窄域确认 PASS（agent_1d83ef16·双审会签）→协调方 EXEC 授权（「本刀使命=CI step 72 最后残红翻面」）→本席执行。**序1 并线**：`git merge --no-ff origin/feat/mysql-schema-skeleton`@`fb97734c` 零冲突（7 files +345/−7·merge=`a3a84310` 双亲 `ccc344d1`+`fb97734c`·届时 tip=cap 2168 sanction 锚等值·⛔pull --rebase 未用）——携入 qbank-scope-fix 前置（§2-11 预登记条件成立面）。

**① §0 重 pin（全 21 锚现树亲证·file:line+sed+rg+git log -L/-S 全套）**：A1-A20 零漂（:90-96/:98-103/:105/:253/:258/:261/:270-275/:363-371 第二落点 :371/:554-555/:285/:289/:158-162/:165/:219/:196-197/:222/:308/:290-294/:303-304/0067 :69-70/0068 :151-208/0186/0187 :77-78/0201 :17-19·:64-67·:124-125/行史 d9394e91→45b14757/-S 1408d8c2+45b14757/ann_search 全链 0029→…→0201·0069-0087 窗内零触 rg 复证）。三处随落+一处勘验不动：**A21** 行号↔门名映射勘正（`:119`=主翻门·`:348`=migrate:prove·`:558`=neg:all·卷面首尾两行号对调）；**O2**（确认席）§2-5 内锚 `:149-154`→`:148-153`（三表循环现树 sed 亲证）；**O1**（确认席）§2-16 cap 转录 `2160`→`2168`（`fb97734c` MAX_FILES=2_168 亲证）；**O3**（确认席「第二落点 :370」）勘验**不动**——现树 grep+sed 双证 hybridQbankSearch 第二次调用恰 `:371`·卷面 A6/§1.1 原值已符·提议值与现树差 1·按「漂则重锚·以实测为准」纪律不落。

**② 裁决①-④行使（均推荐形）**：①候选乙维持（甲/丙否决承卷）；②探针形=EXISTS+proargnames（`retrievalOwnerSurface(c,签名)`·签名钉 `qbank_generation_ann_search(text, vector, integer)`/`qbank_generation_lexical_search(text, text, integer)`·`to_regprocedure($1)` 参数化零拼接·`'owner_kind' = ANY(proargnames)` 静态字面量·EXISTS 恒非 NULL·函数缺位既有 `activeQbankGeneration` 先行 fail-closed 零新豁免）；③legacy 秩缺省=platform(1)（`ownerRank(undefined)=1` 既有落值·dense 直返+rrf 排序逐位回退 score→refId=前 `45b14757` 序）；④双 SELECT 字面量=模块级 const 四值对（`DENSE_SEARCH_WITH_OWNER`/`DENSE_SEARCH_LEGACY`/`LEXICAL_SEARCH_WITH_OWNER`/`LEXICAL_SEARCH_LEGACY`·逐调用探针二择一·Ban 拼接/Ban memo/Ban env 特判全遵守）。**落值**：恰 1 产品文件 `packages/db/src/qbank/qbank-generation-retrieval.ts`（blob `2c5ed849`→`201bf1df`）·numstat **+30/−2·净增 +28**（+侧包络 18~28 上缘恰合；−2 低于 −4~−8 预估=两单行调用点 1:1 替换+A12 注释块禁触不 reflow·如实登记）；探针谓词 scratch DB 四象限排演（legacy 返回面 f/f·0201 返回面 t/t·RETURNS TABLE 出参入 proargnames 语义实证·用后即弃）。

**③ 主翻门红翻绿（CI step 72 同面直证）**：修前同树红捕获（`a3a84310`：`error: column "owner_kind" does not exist` @ `retrieval.ts:285:21` ← proof `:261`·EXIT=1）→修后 `pnpm qbank-integrity-upgrade:prove` **EXIT=0·20 PASS/0 FAIL**（`:261` hardening 腿+`:371` upgrade 腿两落点全过·`:98` 窗形断言 PASS·A7 隔离力臂零改形全过）。修后形 rg 回执：`retrievalOwnerSurface` 1 处定义+2 处调用（dense :305·lexical :315 现树行号）·双 SELECT 字面量 4 const·`:285`/`:289` 原单行面消失=探针二择一形。

**④ 门矩阵全表（§2 十八行）**：1 主门=绿（③）；2-10 九邻面=**7 绿+2 基线红承登**：qbank-control-sec 绿/qbank-source 绿/qbank-handoff-closure 绿/ag39-org-qbank **绿 53 臂**（判据 53 臂兑现·:148-153 三表循环一臂展三实证）/ag39-quality 绿 21 臂（融合秩/折叠臂原值=≥0201 版面零变实证）/rag03-filter-locus 绿 12/rag03-hnsw-completeness 绿 16；**qbank-pipeline 红（承登·非本刀翻红）**：EXIT=1 `qbank_retrieval_scope_missing` ← proof :72 `hitsFor` 无 scope 调用 × 0176/0187 fail-closed 断言——stash 同树对照直证基线红（a3a84310 无本刀改动同签名同行同臂 EXIT=1·改动弹回 numstat 30/2 恒等）+CI step 80 自 step 71/72 挡板长期 skipped（3229360a verify 恰 step 72 一红·:293 步 skipped 亲证）+branch 全史 ci.yml 100 runs 零 verify success=该门无在卷原值绿·机制面与本刀修面零交集·处置=承登不回炉（rev2 P1-R3 先例形·裁决权上交）；**rag-cache 红（承登·结构性未接线门）**：根脚本绕 runner 直连+runner isolatedCommand 零注册+proof 硬隔离 nonce 认资（dev 库结构性不可绿）——按 runner 同机制手工复刻隔离环境（nonce 容器+attestation env·零码动纯公开入口）后红=proof 自身 fixture（provisionPrerequisites 建表在先）×现行 `migrate.ts` 普查守卫冲突 `migration_uninitialized_nonempty_database` 确定性复现+在卷旧红两处（batch23 主线回归矩阵 root:rag-cache:prove exit=1·ci-wiring2 prove-placement「零动作登记」）·非本刀翻红非本刀处置面；11 rag-generation **绿 40/40**（并主线 qbank-scope-fix 前置·§2-11 预登记情形走并主线兑现）；12 migrate 绿（链 204·头 `0204_ai_cost_cached_input_price`·applied=204 skipped=0）+uniqueness 绿（204 files·0 violations·豁免 0143/0152/0160）+drift 绿（零漂·退役残面登记豁免·fresh deploy 安全）；13 neg:all **绿 687/687**（90+90+91+102+179+135 恰合）；14 typecheck **绿 8/8 successful（0 cached）**；15 lint **五值恰等** web 601/root 5235/api 1421/worker 954/ai-runtime 628（EXIT=0·本刀触文件单测 0 problems）；16 docs:check 绿 2156≤2168；17 markers 五类**零命中**（判据形=§2-17 `git diff 77ba32ab -U0` 改动集新增行直扫·i6-239 :151-163 口径运行时组装词面+冲突标记双查；附注：全文件形扫描命中均落并线携入两 SSOT 存量文本·非本刀新增行·新增行形双查零命中·收据申明沿 §7 预登记形）；18 diff 面=刀面恰 1 码文件+本卷 .md（`git diff a3a84310` 面）·并线面 7 files 系授权序1 另列·全集零迁移/零锁文件/零 `.env*`·typecheck 携出的 tracked `apps/web/tsconfig.tsbuildinfo` 伴生改动已 `git checkout --` 还原（卫生）。

**⑤ §0 重 pin 漂移登记+在飞枚举（§0.0 式一句·收据⑤预登记兑现）**：漂移=零结构漂·仅 A21 映射勘正+O2 内锚 ±1+O1 cap 转录（①节）；在飞枚举=EXEC 时点在飞卷沿 cap sanction 卷 `fb97734c` 载明四卷 `nul-escape-visibility`/`qbank-integrity-chain`（本卷）/`e2e-runner-stale-build-guard`/`i18n-metadata-ssr` 各 +2 预算·本刀改动集九文件（并线 7+本刀 2）他卷零命中亲证。**存量观察登记（§4 席2③ 承卷一句）**：0201 不 bump `qbank_cache_epoch`——滚动窗 TTL ≤120s 界定存量陈旧上界·系存量现状观察·非本刀引入·非本刀处置面。**缓存键 v6 零跳核**：`qbank-retrieval-cache.ts` 零触（change set 零命中）·`CACHE_KEY_VERSION='qbank-retrieval-cache:v6'` 恒等·legacy 态行为恒等旧版即版本语义已含（§1.4 禁触遵守）。**停止条件四类盘点**：现场漂移未命中/机制不满足未命中（主门 20 臂零新红·rg 普查复证 owner_kind 函数返回列面仅 `:285`/`:289` 两处=修面盖全）/越界未命中（修法未触 §3 边界·两承登红处置面在刀外未自行扩权）/验收红=两基线红承登非原值翻红（§3 边界未触·裁决权上交协调方+post 双审）。

**⑥ est live=0·actualSpendCny=null**（全隔离容器+假体 embedder·零模型外呼·零 secrets·scratch 排演库用后即弃·零生产操作）。**STOP 终态=`executed:awaiting_post_prove_dual`**（Status 行随翻·§8 体 draft 期 STOP 词面沿 append 保史零洗·EXEC 终态以本节+Status 为准·alone≠dual·待 post 双审两外席会签+协调方·⛔push 未用）。

## §11 rev3 勘误注记（2026-10-16 post 审读落卷席·append 保史·§0.1/§8/§9/§10 原文零洗·仅以本节四注记勘误·STOP 维持 `executed:awaiting_post_prove_dual`）

1. **P1-R1·A21 勘正倒置（落点=§0.1-A21 行+§10① A21 勘正句）**：rev3 注记改回原值——`:119`=neg:all·`:348`=migrate:prove·`:558`=主翻门 qbank-integrity-upgrade:prove（原卷 pin 本就正确·EXEC 勘正自身首尾颠倒·『现树 sed 亲证』证词与实测相反·席2 grep -n 实测为凭·落卷席同法 `grep -n package.json` 复核逐行亲证一致）。
2. **P1-R2·blob 锚转录错（落点=§10② 落值句）**：§10② 「blob `2c5ed849`→`201bf1df`」rev3 注记勘正为→**`3fd0c292`**（交付 blob·席2 cat-file 实证·201bf1df 对象不存在系中间态误录·行数/numstat/收据 sha256 66c983ca/a2610be1 均无恙）。
3. **P2·STOP 生效面**：本卷生效终态=Status `:3`+§10⑥（`executed:awaiting_post_prove_dual`）·§8 `:123` 与自检 `:147` draft 词面系条款节原文沿 append 保史零洗·非现态。
4. **席1 P2·探针参数名假阳观察登记**：`retrievalOwnerSurface` 探针谓词 `'owner_kind' = ANY(proargnames)` 对 proargnames 参数名词面存在理论假阳面——现状零撞名·窗内三函数入参沿 `p_*` 前缀惯例（p_generation/p_embedding/p_query/p_k·0201 `:66/:129/:149` sed 亲证）·p_* 前缀惯例护住·纯观察登记零码动。
