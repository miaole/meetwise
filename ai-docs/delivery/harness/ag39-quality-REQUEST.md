# AG39-QUALITY REQUEST（AG-39 质量收尾小刀 · RRF 融合层 owner 秩补全 + org 调用方同内容双行内容级去重 · docs-only 落卷即停）

**Status**: `draft:awaiting_pre_exec_dual`（起草席写完即停零码动·本刀恰 1 .md·待 pre-exec 双审两外席+协调方授权。Ban self-approve · alone≠dual · Dual PASS ≠ 开工）

**席位**：meetwise 战役「AG-39 质量收尾小刀（RRF owner 秩+org 双行）」REQUEST 起草席（docs-only·零码动·单文件落卷）。
**基线**：主线 tip `d68ffe17`（`git log -1` 开工实测·2026-10-14·docs(ssot) AG-39 nail 收官随翻三件笔）。分支 `line/ag39-quality` · 工作树 `../meetwise-ag39q`（仓根同级·本起草席已立：`git worktree add ../meetwise-ag39q -b line/ag39-quality d68ffe17`·建前亲证 `worktree list` 13 树零 ag39q·`branch -a` 零同名质量线）。
**防重对表（亲证）**：`ls ai-docs/delivery/harness/ | grep -i "quality\|ag39q"` → 仅 `gap-route-classify-quality.md`（GAP 路由卷·非本刀同名）；`branch -a` → 仅 `line/ag39-org-qbank`（母刀线·已收官）与本刀新建线。→ **停止条件未触发·可落卷**。
**蓝本**：①`ai-docs/delivery/execution-master-checklist.md` **:2583**「Line AG-39 nail」段 + **:2588** STILL OPEN 五项（本刀认领第①②两项：RRF 融合层 owner 秩注记 + org 双行质量面；第③项 ann 内层截断召回=质量调优归后继不认领·第④项 org_id 过渡形态+存量回填=划界裁决项§8-④·第⑤项席1 errata ②-⑤=登记不阻塞不认领）②`ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md` **§8 :126-130** 母卷裁决②（RRF 融合层不承担优先序=§5 Ban 延伸·现状注记归后继——本刀即该后继）+裁决⑥ rev2 E1（去重 owner 作用域化=双行面成因）③母卷 §9-EXEC/§9-post-errata 附记（0186+0187 落点与 50 臂 proof 形制）④形制沿 `ag37-deficit-persist-REQUEST.md`（§0-§8 小刀卷形制·Ban/pins 同源誊录见 §5）。

## §0 现状锚（起草席亲读·base `d68ffe17`·file:line 逐条 rg/sed/Read/跨树 ls 实测复核·**EXEC 立项照本节重 pin**——漂则重锚·结论不变则只更行号）

### 0.1 锚表（全 @`d68ffe17` 工作树 `meetwise-ag39q` 实测·2026-10-14）

| # | 锚 | 实测值 |
|---|---|---|
| A1 | `ai-docs/delivery/execution-master-checklist.md:2583` | 「Line AG-39 nail」段（0186+0187 落点如实转写·链深 187·门矩阵十门支线复验零新红） |
| A2 | `ai-docs/delivery/execution-master-checklist.md:2588` | STILL OPEN 五项原文（本刀认领①②·③④⑤定界见蓝本①） |
| A3 | `ai-docs/delivery/harness/ag39-org-qbank-REQUEST.md:126-130` | 母卷 §8：裁决②「RRF 融合层（应用侧）不得承担优先序=§5 Ban 库内强制的延伸」+ann 内层 LIMIT greatest(k*8,40) 截断先于外层 owner 秩登记+裁决⑥ rev2 E1 去重 owner 作用域化 |
| A4 | `packages/db/src/qbank/qbank-generation-retrieval.ts:12` / `:14` | `const RRF_K = 60` / `const MAX_CANDIDATES = 200`（融合常量·本刀零动） |
| A5 | 同上 `:39-51` / `:88-96` | `QbankServingScopeInput.ownerKind/orgId` additive 契约 + `setServingScope` 四 GUC 事务级注入（serving/taxonomy/owner_kind/org_id） |
| A6 | 同上 `:271-312` | `hybridQbankSearch` 全体：`:284` rrf 候选池 `min(MAX_CANDIDATES, max(k*8, candidateK??40))`；`:285` ann 调用列面 `ref_id, distance`；`:286-288` dense 臂直返（SQL 已 owner 秩序·零融合缝）；`:289` lexical 调用列面 `ref_id, lexical_score`；`:290-295` rank map **以 refId 为键**、`:293` 位置分 `1/(RRF_K+position+1)` 累加；`:296-297` 双通道按行位入池；`:298-300` 融合输出=按融合分降序+refId localeCompare 稳定序截 `slice(0, k)`——**零 owner 维度·零内容维度**；`:302-311` distances 补真距离+revoked 候选不复活 |
| A7 | `packages/db/migrations/0187_qbank_owner_scoped_retrieval.sql:29-30` | 头注登记原文：「RRF 融合层（应用侧 hybridQbankSearch）不承担优先序——其位置分继承 SQL 已排序行序，§5 Ban 库内强制语义不破」（母卷裁决②的库内侧如实注记=本刀修订对象） |
| A8 | 同上 `:77-78` | `tf_qbank_generation_ann_search` `RETURNS TABLE(ref_id text, distance double precision)`——**owner_kind 不在返回面** |
| A9 | 同上 `:102-104` / `:108` / `:110` / `:112` | ann：owner 谓词入内层 WHERE；内层 `LIMIT greatest(k*8,40)`；外层 `ORDER BY (CASE WHEN a.owner_kind='org' THEN 0 ELSE 1 END), a.dist`；外层 `LIMIT k`（**内层前导排序键=embedding 距离·Ban 零触面**） |
| A10 | 同上 `:120-121` / `:151-153` / `:154-156` / `:157` | `qbank_generation_lexical_search` `RETURNS TABLE(ref_id text, lexical_score double precision)`（owner 不在返回面）；owner 谓词；owner 秩先于词频；`LIMIT k` |
| A11 | 同上 `:163` / `:201` / `:241` | distances/evidence/question_evidence 三取证函数 owner 行级谓词（无优先序语义） |
| A12 | `packages/db/migrations/0144*.sql:659-667`（:657 REVOKE·:716 GRANT） | `qbank_generation_ann_search` 薄壳 `CREATE OR REPLACE` + `SELECT * FROM tf_...` 穿透——tf_ 签名扩展则薄壳 RETURNS TABLE 须同拍（返回类型变更=DROP+CREATE·CREATE OR REPLACE 不可改返回类型） |
| A13 | `packages/db/migrations/0186_qbank_org_owner_columns.sql:48-49` / `:62-63` / `:76-77` / `:92-93` | 四层 owner 列（qbank_source/qbank_chunk/qbank_question/qbank_generation_chunk 各 owner_kind+org_id） |
| A14 | 同上 `:110-112` | `DROP INDEX uq_qsrc_active_hash` + `CREATE UNIQUE INDEX uq_qsrc_active_hash_scoped ON qbank_source (owner_kind, COALESCE(org_id,''), content_hash) WHERE status <> 'rejected'`——**同 content_hash 在 org 与 platform 两 owner 下均可各持一活跃源（不同 refId）=双行面成因** |
| A15 | `packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql:30-34` / `:41-47` | qbank_chunk：`ref_id` PK + `content_hash` NOT NULL；RLS 读策略 `USING (qbank_is_curator())`——**服务角色直读被 RLS 挡** |
| A16 | 同上 `:138-143` / `:147-152` | qbank_generation_chunk：**`content_hash text NOT NULL`（:141·投影自带内容指纹）**+PK(generation_id,ref_id)；RLS 读策略 `USING (qbank_is_curator())`（服务角色直读被挡·取证必须经 SECURITY DEFINER 函数） |
| A17 | `packages/db/src/qbank/qbank-ingest.ts:192` / `:303-312`（头注 `:12`） | refId=调用方供给（`SAFE_REF_ID` 校验）；`INSERT INTO qbank_chunk(...owner_kind, org_id...) ON CONFLICT (ref_id) DO NOTHING`（owner 列版）与 legacy 版并存；头注：同 owner 内 chunk 去重沿 UNIQUE(owner,kind,hash)——**同 owner 同内容无双行·双行仅跨 owner（org↔platform）** |
| A18 | `packages/db/src/qbank/qbank-retrieval-cache.ts:16-19` / `:283` | `CACHE_KEY_VERSION = 'qbank-retrieval-cache:v5'`（v5 绑 owner 两值）；`cachedQbankSearch` 内 `hybridQbankSearch(...)`——**融合/折叠语义一变则 v5 缓存全量陈旧·须升版** |
| A19 | `packages/db/src/retrieval/retrieval-store.ts:52-56` / `:78` | 直连兼容读入口 `SELECT ref_id, distance FROM qbank_generation_ann_search(...)`——additive 增列逐位兼容·本刀零触面（无 RRF 融合·无折叠语义） |
| A20 | `apps/worker/src/main.ts:554` / `:569` + `packages/db/src/qbank/qbank-track-local-retrieval.ts:266` | 生产调用点=两处 `cachedQbankSearch`（经 A18 缓存包裹进融合层） |
| A21 | `package.json:386-389` + `apps/worker/package.json:57` + `apps/worker/test/ag39-org-qbank-isolation.proof.ts` | 门注册链 `ag39-org-qbank:prove`→`prove:ag39-org-qbank`→`test/ag39-org-qbank-isolation.proof.ts`；**`  A('` 实测恰 50 臂**；②-b-1 `:254-256`（B 端 ann org 行序在 platform 前）/②-b-2 `:259-260`（lexical 同）/⑤-1 `:274-275`（platform 零变负臂）/④ `:304-314`（curation scoped 去重臂·dupHash 同 hash 双 owner 源共存实证臂形） |
| A22 | 迁移号现场（跨树 `ls` 实测·2026-10-14） | 主线链深 187（checklist A1 段「applied=187」）；`meetwise-cost4` 树 `packages/db/migrations/0188_ag11_cost_reserve_least_and_settle_relax.sql` 在飞占号；0189 全树零占用但**协调方本刀派单指令明文预留「0190 起若需」**→ 若需迁移自 **0190** 起 |

### 0.2 漂移登记 + 起草席实证结论

1. **行号漂移（结论不变）**：checklist `:2588` 与母卷裁决②写「应用侧 qbank-generation-retrieval `:240-250`」·现 tip 实测融合段=`:290-300`（A6·0186+0187 并线后同文件函数体扩展所致·机制描述逐字成立）。
2. **「迁移号预期零」实证修订（起草席结论·裁决项⑤）**：派单指令预写「迁移号预期零（纯函数+proof）」——**实证不成立**：修法①强形态需把 owner_kind 暴露到函数返回面（A8/A10 两函数返回面无 owner·A15/A16 RLS `qbank_is_curator()` 挡服务角色直读表·应用层无 per-row owner 数据源）→ 返回类型变更=DROP+CREATE=迁移；修法②两案至少一案落 SQL 体（CREATE OR REPLACE 亦须迁移承载）→ **预期恰 1 迁移 `0190`**（A22）·零迁移仅剩「登记不动」退化案=不解决 STILL OPEN（不推荐·§1 两案并陈如实列）。
3. **C 端零影响（结论锚）**：C 端 owner_kind='platform' 查询经内层谓词恒只见 platform 行（A9/A10 谓词面）→ org 行不在候选池·双行面仅 org 调用方存在——两修法对 C 端臂（A21 ②-a/⑤ 区）逐位零变。
4. **cache 交互（结论锚）**：融合层排序/折叠语义变更→`cachedQbankSearch` 语义随之变→缓存键 v5→v6 必跳（A18）·升版动作随裁决⑥形态定（同刀一次跳）。

## §1 红事实 + 修法（两件·对应 STILL OPEN 第①②项·每件两案并陈·落位形=裁决项）

### 1.1 红事实

- **红①（RRF 融合层 owner 秩缺位）**：0187 已使 ann/lexical 两通道行序 owner 秩在先（A9/A10）·但融合层（A6 `:290-300`）只按通道位置分 `1/(RRF_K+pos+1)` 累加——org 行仅经「位置分」**部分**继承优先序：跨通道累加可逆转 owner 秩（例：org 行 dense@1+lex@1 累分 < platform 行 dense@0+lex@0 累分）·与 README 端到端「私有优先」语义有缝·母卷 0187 头注如实登记（A7）。
- **红②（org 调用方同内容双行）**：A14 scoped 唯一索引使 org A 与 platform 对同 content_hash 各持活跃源（合法·母卷裁决⑥ E1 反静默映射的既定代价）→ 两源各自派生不同 refId 的 chunk/question 进同代投影（A17 refId=调用方供给+ON CONFLICT(ref_id)）→ org A 查询经 A9/A10 谓词同见 org 行+platform 行 → 融合层 A6 **按 refId 去重不按内容** → 同内容占两槽（k 槽位浪费·排序噪声）。C 端恒单行不受影响（0.2-3）。

### 1.2 修法① RRF 融合层 owner 秩补全（禁触 ann 内层前导排序键 Ban）

- **案①-A（推荐·需迁移 0190）SQL 面 additive 暴露 owner_kind**：迁移 0190 对 `tf_qbank_generation_ann_search` + 薄壳 `qbank_generation_ann_search`（A12 RETURNS TABLE 同拍·DROP+CREATE+REVOKE/GRANT 原形重放）+ `qbank_generation_lexical_search` 三函数返回面增 `owner_kind text` 列（体/谓词/排序/LIMIT 原形零改）→ 应用融合层 A6 `:298` 排序键改 `owner_rank → fused_score → refId` 三级稳定序（owner_rank=org 0/platform 1·**与 0187 外层 `:110` CASE 同构**）——或在 `:293` 融合分内 owner 加权·两形择一=裁决项①行使；dense 臂 `:286-288` 零触（SQL 已 owner 秩序直返）；缓存键 v5→v6（A18）。
- **案①-B（零迁移退化案·不推荐·列案只为裁决完备）**：仅更新 0187 头注/卷面注记维持现状——不解决 STILL OPEN 第①项·等于永久缝。
- **禁触（两案共同）**：ann 内层前导排序键 Ban（A9 `:105` 内层 `ORDER BY g.embedding <=> p_embedding` 原形零触·0176 旧锚延续）；RRF_K/MAX_K/MAX_CANDIDATES/candidateK 常量零动（A4）；返回 distance 恒真 cosine 距离零伪造（A6 `:267-269` 头注 doctrine）；库内 owner 谓词/外层 owner 秩零削弱（本刀=叠序非替代·衔接裁决=裁决项③）。

### 1.3 修法② org 双行内容级去重

- **案②-A（推荐）SQL 层同内容排除（谓词法·零签名变更）**：0190 同迁移（与①-A 合流则一迁移两用）对 ann/lexical（及 distances/evidence 取证一致性面·EXEC 按 rg 普查定）CREATE OR REPLACE **体**增同内容排除谓词：**仅当 owner GUC=org 时**·同 generation 投影内存在 `owner_kind='org' AND org_id=当前org AND content_hash=g.content_hash AND visible` 行则排除该 platform 行（org 行存活=私有优先语义自然结果）——同 owner 内无双行走 A17 UNIQUE(owner,kind,hash) 既有保证·谓词零签名变更（返回类型不动·CREATE OR REPLACE 合法）。
- **案②-B 函数面暴露 content_hash → 融合层二次折叠**：与①-A 同迁移把 `content_hash` 一并暴露到返回面·融合层 refId 去重（现状 `:290-295`）后按 content_hash 二次折叠（同 hash 多 refId 保 owner 秩最高者·次序=裁决随①定）——数据经 SECURITY DEFINER 出 RLS 面进应用层·折叠面多一手实现。
- **共同面**：C 端臂逐位零变（0.2-3）；qbank_question 展面（curation 面）同内容双行=登记边界不并入（裁决项⑦）；缓存键同拍 v6。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **融合 owner 秩臂（修法①）**：新 proof 构造跨通道累分逆转夹具（org 行双通道次位+platform 行双通道首位）·断言 rrf 模式输出 org 行序先于 platform 行（案①-A 落位后）——逆转夹具在**现状**必红（红①可复现性=断言力第 1 层）；dense 模式同夹具输出零变。
2. **双行折叠臂（修法②）**：沿 A21 ④区 dupHash 臂形扩展——org A 与 platform 各持同 content_hash 活跃源+各自 refId 入投影·断言 org A 检索输出同内容恰 1 行（org 行）·k 槽位不被双行消耗——现状必现双行（红②可复现性=断言力第 2 层）。
3. **C 端零变负臂**：platform 查询对折叠/秩臂夹具输出与现状逐位一致（0.2-3 断言化=断言力第 3 层）。
4. **50 臂回归原值**：A21 全 50 臂原值零翻（②-b-1/②-b-2/⑤-1/④ 区逐位）。
5. **缓存升版断言**：CACHE_KEY_VERSION 字面 v6（rg 可验）·v5 语义陈旧性头注在场。

## §3 范围外（边界清单·越界即 FAIL）

1. ann 内层 LIMIT greatest(k*8,40) 截断召回调优（STILL OPEN 第③项·与召回率正交·归后继）——本刀零触候选池宽度。
2. org_id=recruiter_user_id 过渡形态更换+0142 前存量回填（STILL OPEN 第④项·org 实体刀落位面）——划界待裁决项④确认。
3. 席1 errata ②-⑤ 措辞级观察项（STILL OPEN 第⑤项·登记不阻塞）。
4. 检索算法常量（RRF_K/MAX_K/MAX_CANDIDATES/candidateK/dense|rrf 语义/距离语义）·CRAG 面·HNSW 索引形态——零动。
5. qbank_question curation 展面双行、qbank_source 展面语义（A14 索引语义本刀零改）——裁决项⑦边界。
6. retrieval-store 直连兼容面（A19·无融合语义·additive 列天然兼容）——零触。
7. 他刀面（AG-40/AG-42/AG-37/AG-43/AG-13/记忆边界/B 端扣额 #271）+其他工作树在飞机——零触。

## §4 依赖

- 前置已落：0186+0187（链深 187·A1/A13/A9）+母卷 50 臂 proof 绿（A21）——本刀为纯增量叠加面。
- 无新外依赖·无新 env/配置面（owner GUC 既有契约 A5 沿用）。
- 迁移仅 0190 一档预期（0.2-2·裁决项⑤）；若裁决项⑤翻案为零迁移退化案则本刀缩为注记卷·修法面全撤。

## §5 Ban 列表 + pins（沿母卷同源誊 + 本刀面增删·增删处显式标注）

**Ban 列表**（同源誊自 `ag39-org-qbank-REQUEST.md` §5·【增】/【删-改】标注为本刀面）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（四件+INDEX 只读引用·行翻面权归协调方）；**Ban 检索算法改动**（【删-改·本刀面重述】RRF_K/MAX_K/MAX_CANDIDATES/candidateK 常量零动·dense|rrf 双模语义零动·distance 恒真 cosine 语义零动——融合层**排序键内 owner 维度叠序**不属算法改动 Ban 面·但其解禁以裁决项③双审核可为前置）；**Ban 触 CRAG 面**；**Ban 应用层过滤替代库内强制**（【本刀面重述】owner 隔离谓词与库内 owner 秩零削弱零替代——融合层叠序/折叠只增不削·proof 隔离臂仍以直连函数调用验证库内强制）；Ban owner GUC 作鉴权根；Ban 复活 qbank 数据面写路径 GUC 鉴权根 RLS 策略（rev4 限定口径同源）；Ban 静默降级（fail-closed RAISE 语义零豁免）；Ban 来源审计缺位（既有三值面零退化）；Ban 零弱化 B 端禁练习记录结构保证；Ban C 端企业私有中间态（本刀 C 端臂逐位零变=硬验收）；**Ban 历史迁移字节改**（0001-0187 零字节+`sql/` 影子零改·只加 0190 新迁移·0106/0144/0176/0186/0187 原文零触——0144 函数体若须镜像镜像进 0190 不回改）；Ban 新状态机；Ban 触他刀面；Ban 触其他工作树（在飞机互认）；Ban 伪造已问/已验来源；Ban 新 env 闸/新定时器/新配置面；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全隔离库真迁移链+假体·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=隔离库真迁移链（本地临时 PostgreSQL·零生产 DSN/零生产 Key/零凭据落盘）+hybridQbankSearch 直连调用面（融合秩臂/折叠臂全本地可证·假体 embedder）+既有门全本地；typecheck/migrate:prove/drift:prove/docs:check=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草席恰 1 .md=`ai-docs/delivery/harness/ag39-quality-REQUEST.md`；EXEC 改动集预期=packages/db 迁移 1 文+应用融合层 1-2 文+新/展 proof 1-2 文·以 EXEC 立项清单为准）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 ttl-wire receipts 形留执行席收据·五类标记词不复抄卷内——避免自匹配·沿母卷/ag37 卷 §7 同形制）；docs:check（含 public text policy 路径标记扫描）落卷前后恒 EXIT=0·卷内全仓内相对径。

## §8 STOP（开工三条款）+ 裁决项 + 停止条件 + 交付报告格式

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（本卷系 checklist `:2588` STILL OPEN 登记的执行卷·非授权本身）；③EXEC 立项**不得改 §1 修法方向与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。Context Lock 口径：本卷属会话工单·派单时由主会话显式给路径·执行席不自行检索卷位。

**裁决项（pre-exec 双审/EXEC 行使·七项）**：

1. **修法①落位形**：案①-A（SQL 面 additive 暴露 owner_kind·推荐）vs 案①-B（零迁移退化注记·不推荐）；若①-A：融合叠序形=三级稳定排序键（owner_rank→fused_score→refId·推荐·与 0187 外层 `:110` CASE 同构）vs 融合分内 owner 加权（权重值引入新自由度·次推）。
2. **修法②落位形**：案②-A（SQL 谓词排除·推荐·零签名变更·数据不出 RLS 面）vs 案②-B（暴露 content_hash+融合层二次折叠·与①-A 同迁移合流可省一函数面）。
3. **学说衔接核可（双审前置门）**：母卷裁决②「RRF 融合层不承担优先序=§5 Ban 延伸」（A3/A7）与本刀修法①的修订关系——本刀定位=0187 库内 owner 秩之上的**叠序**（库内谓词/秩零削弱·隔离语义不变·仅融合输出序补全端到端语义）·须 pre-exec 双审明示核可后方可进 EXEC·0187 头注 A7 段随 0190 迁移头注同步勘误（历史迁移字节零改·注记更新落新迁移头注）。
4. **质量面定界确认**：org_id 过渡形态+存量回填（STILL OPEN 第④项）本刀**划界外**（推荐）vs 并入——推荐划界·org 实体刀落位面零触。
5. **迁移号确认**：起草席实证「预期零」不成立（0.2-2·RLS 挡直读+返回面无 owner/content 数据源）→ 预期恰 1 迁移 **0190**（0188 cost4 在飞占用+0189 协调方预留·A22 亲证）vs 退化零迁移案（=裁决①选①-B 连带·不推荐）。
6. **缓存键升版形**：v5→v6 单跳（两修法同刀·推荐）vs 分刀各跳——同刀单跳。
7. **qbank_question 展面双行边界**：不并入本刀·登记后继（推荐·curation 面另刀）vs 并入（扩权须协调方明示）。

**停止条件（命中即停·四类全覆盖）**：

- **现场漂移**：EXEC 立项重 pin 时 §0 任一锚与现 tip 冲突（融合段行号漂移致 A6 机制描述不成立/A8+A10 返回面已被他刀改/A14 索引形已变/50 臂计数非 50）→ 停回炉重锚·不得就地改锚续刀。
- **机制不满足**：若 EXEC 实证推翻 0.2-2（发现不依赖迁移的 per-row owner/content 等价数据源·或 CREATE OR REPLACE 可变返回类型等）→ 停回炉按新机制改修法·不得带病施工。
- **越界需要**：施工中发现修法必须触及 §3 边界（算法常量/CRAG/他刀面/curation 展面）方能闭环 → 停上报协调方裁决·不得自行扩权。
- **验收红不可修**：A21 50 臂任一原值翻红·或新 proof 红·且断言面零翻失败（补 GUC 类 setup 授权不适用本刀·本刀无 setup 翻臂面）→ 停回炉。

**门预申明（EXEC 收尾必跑·原样可复制）**：

```
ag39-org-qbank:prove                 # 50 臂回归原值 EXIT=0
<新 proof 门·EXEC 立项注册行后回填>   # 融合秩臂+折叠臂+C 端零变臂 ALL GREEN
pnpm turbo typecheck --force         # EXIT=0
node scripts/ai-docs/check-docs.mjs  # EXIT=0
# 若 0190 落地增跑：migrate:prove · drift:prove · check-migration-version-uniqueness · qbank-control-sec:prove · rag03-filter-locus:prove · rag03-hnsw-completeness:prove（全 EXIT=0 零新红）
```

**交付报告格式（EXEC 收尾随翻·append 保史·§0-§8 原文零改）**：①门矩阵逐门 EXIT 实测值+新 proof 臂计数；②裁决①-⑦行使结果逐项落值；③0190 迁移号占用登记（若落）+链深实测（applied=188 预期·四处独立复现沿母卷形）；④改动集文件清单+markers 五类改动集扫描回执；⑤缓存 v6 升版 rg 回执；⑥§0 重 pin 漂移登记（如有）；⑦STOP 翻面建议（`executed:awaiting_post_prove_dual`）归协调方。

**Sibling sections stay as written. alone≠dual · EXIT0≠covered · 实现方不 self-approve。**
