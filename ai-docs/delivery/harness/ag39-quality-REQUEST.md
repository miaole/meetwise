# AG39-QUALITY REQUEST（AG-39 质量收尾小刀 · RRF 融合层 owner 秩补全 + org 调用方同内容双行内容级去重 · docs-only 落卷即停）

**Status**: `draft:awaiting_pre_exec_dual`（起草席写完即停零码动·本刀恰 1 .md·待 pre-exec 双审两外席+协调方授权。Ban self-approve · alone≠dual · Dual PASS ≠ 开工）· **rev2 勘误席已落**：pre-exec 双审两席 FAIL findings 全数处置（B1 迁移号改占+A17 重锚+谓词镜像+夹具不对称形+裁决①⑦收紧+缓存零残留+行号勘正·§9 处置摘要）·STOP 维持本态

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
| A9 | 同上 `:102-104` / `:106` / `:110` / `:111`（**rev2 行号勘正**：原 :108→:106·:112→:111·rg 亲证） | ann：owner 谓词入内层 WHERE；内层 `LIMIT greatest(k*8,40)`（:106）；外层 `ORDER BY (CASE WHEN a.owner_kind='org' THEN 0 ELSE 1 END), a.dist`（:110）；外层 `LIMIT k`（:111）（**内层前导排序键=embedding 距离·Ban 零触面**·ORDER BY 在 :105） |
| A10 | 同上 `:120-121` / `:151-153` / `:154-155` / `:156`（**rev2 行号勘正**：原 :157→:156·owner 秩 ORDER BY 实跨 :154-155·rg 亲证） | `qbank_generation_lexical_search` `RETURNS TABLE(ref_id text, lexical_score double precision)`（owner 不在返回面）；owner 谓词；owner 秩先于词频；`LIMIT k` |
| A11 | 同上 `:163` / `:201` / `:241` | distances/evidence/question_evidence 三取证函数 owner 行级谓词（无优先序语义） |
| A12 | `packages/db/migrations/0144*.sql:659-667`（:657 REVOKE·:716 GRANT） | `qbank_generation_ann_search` 薄壳 `CREATE OR REPLACE` + `SELECT * FROM tf_...` 穿透——tf_ 签名扩展则薄壳 RETURNS TABLE 须同拍（返回类型变更=DROP+CREATE·CREATE OR REPLACE 不可改返回类型） |
| A13 | `packages/db/migrations/0186_qbank_org_owner_columns.sql:48-49` / `:62-63` / `:76-77` / `:92-93` | 四层 owner 列（qbank_source/qbank_chunk/qbank_question/qbank_generation_chunk 各 owner_kind+org_id） |
| A14 | 同上 `:110-112` | `DROP INDEX uq_qsrc_active_hash` + `CREATE UNIQUE INDEX uq_qsrc_active_hash_scoped ON qbank_source (owner_kind, COALESCE(org_id,''), content_hash) WHERE status <> 'rejected'`——**同 content_hash 在 org 与 platform 两 owner 下均可各持一活跃源（不同 refId）=双行面成因** |
| A15 | `packages/db/migrations/0029_qbank_generation_hybrid_retrieval.sql:30-34` / `:41-47` | qbank_chunk：`ref_id` PK + `content_hash` NOT NULL；RLS 读策略 `USING (qbank_is_curator())`——**服务角色直读被 RLS 挡** |
| A16 | 同上 `:138-143` / `:147-152` | qbank_generation_chunk：**`content_hash text NOT NULL`（:141·投影自带内容指纹）**+PK(generation_id,ref_id)；RLS 读策略 `USING (qbank_is_curator())`（服务角色直读被挡·取证必须经 SECURITY DEFINER 函数） |
| A17 | `packages/db/src/qbank/qbank-ingest.ts:192` / `:305` / `:312`（头注 `:12`/:22）·**rev2 重锚** | refId=调用方供给（`SAFE_REF_ID` 校验 :192）；qbank_chunk `INSERT ... ON CONFLICT (ref_id) DO NOTHING`（owner 列版 :305 与 legacy 版 :312 并存·仲裁键=ref_id）；**rev2 勘误**：原锚「同 owner 内 chunk 去重沿 UNIQUE(owner,kind,hash)」失实——该 UNIQUE 属 legacy vector_chunk upsert（`retrieval-store.ts:25` `ON CONFLICT (owner_user_id,kind,content_hash)`）；qbank 路径 qbank_chunk PK=ref_id（0029 :30-36·PK :31）+qbank_generation_chunk PK(generation_id,ref_id)（0029 :138-146·PK :145）**零内容级唯一约束**·同 owner 同内容双 refId 行机械可达（头注 :12「源身份=内容,同文本多 refId 共享一源」+头注 :22「chunk ON CONFLICT(owner,kind,hash)」同为 legacy vector_chunk 语义陈旧残留）；内容级唯一真实承重面=源级 `uq_qsrc_active_hash_scoped`（A14·0186 :111）+hash 由应用层从正文派生（0029 :37 头注）+单活跃源纪律——**双行不仅跨 owner（org↔platform）：同 owner 双 refId 行亦可达（登记边界·§1.3）** |
| A18 | `packages/db/src/qbank/qbank-retrieval-cache.ts:16-19` / `:283` | `CACHE_KEY_VERSION = 'qbank-retrieval-cache:v5'`（v5 绑 owner 两值）；`cachedQbankSearch` 内 `hybridQbankSearch(...)`——**融合/折叠语义一变则 v5 缓存全量陈旧·须升版** |
| A19 | `packages/db/src/retrieval/retrieval-store.ts:52-56` / `:78` | 直连兼容读入口 `SELECT ref_id, distance FROM qbank_generation_ann_search(...)`——additive 增列逐位兼容·本刀零触面（无 RRF 融合·无折叠语义） |
| A20 | `apps/worker/src/main.ts:569` + `packages/db/src/qbank/qbank-track-local-retrieval.ts:266`·**rev2 勘正**（原锚 main.ts `:554` 实为注释行非调用·rg 全集重 pin 恰两处） | 生产调用点=两处 `cachedQbankSearch`（经 A18 缓存包裹进融合层·main.ts:554 同点位系「localRetrieve remains compat/test seam」注释行不计） |
| A21 | `package.json:386-389` + `apps/worker/package.json:57` + `apps/worker/test/ag39-org-qbank-isolation.proof.ts` | 门注册链 `ag39-org-qbank:prove`→`prove:ag39-org-qbank`→`test/ag39-org-qbank-isolation.proof.ts`；**`  A('` 实测恰 50 臂**；②-b-1 `:254-256`（B 端 ann org 行序在 platform 前）/②-b-2 `:259-260`（lexical 同）/⑤-1 `:274-275`（platform 零变负臂）/④ `:304-314`（curation scoped 去重臂·dupHash 同 hash 双 owner 源共存实证臂形） |
| A22 | 迁移号现场（跨树 `ls`+`git ls-tree` 实测·2026-10-14·**rev2 勘误注：派单指令原预留「0190 起若需」失效——0190-0199 已被 5B-MIG 在飞实占·按协调方 B1 裁决改占 0200**） | 主线链深 187（checklist A1 段「applied=187」）；`meetwise-cost4` 树 `packages/db/migrations/0188_ag11_cost_reserve_least_and_settle_relax.sql` 在飞占号；**0190-0199 恰十号已被 5B-MIG 在飞实占**（`meetwise-b5m` 树 @`7152cd3c` `git ls-tree` 亲证：`0190_outbox_consumption_unique_concurrent.sql`…`0199_redundant_index_drop.sql` 十文件在场）；0189 全树零占用（16 工作树 `ls` 亲证）但占之违链单调（0190 序已在飞在前·后落 0189 应用序倒挂）·**协调方 B1 分配本刀改占 0200** → 若需迁移自 **0200** 起 |

### 0.2 漂移登记 + 起草席实证结论

1. **行号漂移（结论不变）**：checklist `:2588` 与母卷裁决②写「应用侧 qbank-generation-retrieval `:240-250`」·现 tip 实测融合段=`:290-300`（A6·0186+0187 并线后同文件函数体扩展所致·机制描述逐字成立）。
2. **「迁移号预期零」实证修订（起草席结论·裁决项⑤）**：派单指令预写「迁移号预期零（纯函数+proof）」——**实证不成立**：修法①强形态需把 owner_kind 暴露到函数返回面（A8/A10 两函数返回面无 owner·A15/A16 RLS `qbank_is_curator()` 挡服务角色直读表·应用层无 per-row owner 数据源）→ 返回类型变更=DROP+CREATE=迁移；修法②两案至少一案落 SQL 体（CREATE OR REPLACE 亦须迁移承载）→ **预期恰 1 迁移 `0200`**（A22·rev2 B1 改占）·零迁移仅剩「登记不动」退化案=不解决 STILL OPEN（不推荐·§1 两案并陈如实列）。
3. **C 端零影响（结论锚）**：C 端 owner_kind='platform' 查询经内层谓词恒只见 platform 行（A9/A10 谓词面）→ org 行不在候选池·双行面仅 org 调用方存在——两修法对 C 端臂（A21 ②-a/⑤ 区）逐位零变。
4. **cache 交互（结论锚）**：融合层排序/折叠语义变更→`cachedQbankSearch` 语义随之变→缓存键 v5→v6 必跳（A18）·升版动作随裁决⑥形态定（同刀一次跳）·**零残留论证（rev2 F4）**：版本串内嵌于键→旧 v5 键在新代码下不可达+TTL 有界自净（代码缺省 `DEFAULT_TTL_SECONDS=120`·`qbank-retrieval-cache.ts:22` 亲证·调用面自定义上界沿审席口径 ≤3600s）+PG `qbank_retrieval_fill_intent` 旧键行 inert（键含版本串新代码永不命中·singleflight 面 :175-196）+滚动部署新旧实例键空间不相交（版本串不同）→零跨版本脏读残留；**v4→v5 归属勘正**：v5=AG-39 母刀 EXEC `1408d8c2` 升版绑 owner 两值（文件头注 :16-18「v5 additionally binds the AG39 owner layer」可验·`git log -L` 亲证）·**非 AG-24**。

## §1 红事实 + 修法（两件·对应 STILL OPEN 第①②项·每件两案并陈·落位形=裁决项）

### 1.1 红事实

- **红①（RRF 融合层 owner 秩缺位）**：0187 已使 ann/lexical 两通道行序 owner 秩在先（A9/A10）·但融合层（A6 `:290-300`）只按通道位置分 `1/(RRF_K+pos+1)` 累加——org 行仅经「位置分」**部分**继承优先序：跨通道累加可逆转 owner 秩——逆转例**只可取通道成员不对称形（rev2 E2 改写）**：dense 距离窗（A6 :285）与 lexical 词频窗（:289）成员集天然不对称·org 行仅入单通道（dense）且居候选池末位（累分 1/(60+n)·n=池宽）·platform 行双通道在池（累分 ≥1/(60+p+1)+1/(60+q+1)·恒大于单通道末位分）→融合序 platform 先于 org=owner 秩逆转（原稿例「org dense@1+lex@1 vs platform dense@0+lex@0」**不可构造**：外层 A9 :110 owner 秩在先使同通道内 org 行恒先于 platform 行·platform @0 须该通道零 org 行与 org 在池矛盾）·与 README 端到端「私有优先」语义有缝·母卷 0187 头注如实登记（A7）。
- **红②（org 调用方同内容双行）**：A14 scoped 唯一索引使 org A 与 platform 对同 content_hash 各持活跃源（合法·母卷裁决⑥ E1 反静默映射的既定代价）→ 两源各自派生不同 refId 的 chunk/question 进同代投影（A17 refId=调用方供给+ON CONFLICT(ref_id)）→ org A 查询经 A9/A10 谓词同见 org 行+platform 行 → 融合层 A6 **按 refId 去重不按内容** → 同内容占两槽（k 槽位浪费·排序噪声）。C 端恒单行不受影响（0.2-3）。

### 1.2 修法① RRF 融合层 owner 秩补全（禁触 ann 内层前导排序键 Ban）

- **案①-A（推荐·需迁移 0200·rev2 B1 改占）SQL 面 additive 暴露 owner_kind**：迁移 0200 对 `tf_qbank_generation_ann_search` + 薄壳 `qbank_generation_ann_search`（A12 RETURNS TABLE 同拍·DROP+CREATE+REVOKE/GRANT 原形重放）+ `qbank_generation_lexical_search` 三函数返回面增 `owner_kind text` 列（体/谓词/排序/LIMIT 原形零改）→ 应用融合层 A6 `:298` 排序键改 `owner_rank → fused_score → refId` 三级稳定序（owner_rank=org 0/platform 1·**与 0187 外层 `:110` CASE 同构**）——或在 `:293` 融合分内 owner 加权·两形择一=裁决项①行使；dense 臂 `:286-288` 零触（SQL 已 owner 秩序直返）；缓存键 v5→v6（A18）。
- **案①-B（零迁移退化案·不推荐·列案只为裁决完备）**：仅更新 0187 头注/卷面注记维持现状——不解决 STILL OPEN 第①项·等于永久缝。
- **禁触（两案共同）**：ann 内层前导排序键 Ban（A9 `:105` 内层 `ORDER BY g.embedding <=> p_embedding` 原形零触·0176 旧锚延续）；RRF_K/MAX_K/MAX_CANDIDATES/candidateK 常量零动（A4）；返回 distance 恒真 cosine 距离零伪造（A6 `:267-269` 头注 doctrine）；库内 owner 谓词/外层 owner 秩零削弱（本刀=叠序非替代·衔接裁决=裁决项③）。

### 1.3 修法② org 双行内容级去重

- **案②-A（推荐）SQL 层同内容排除（谓词法·零签名变更）**：0200 同迁移（与①-A 合流则一迁移两用·rev2 B1 改占）对 ann/lexical（及 distances/evidence 取证一致性面·EXEC 按 rg 普查定）CREATE OR REPLACE **体**增同内容排除谓词：**仅当 owner GUC=org 时**·同 generation 投影内存在 `owner_kind='org' AND org_id=当前org AND content_hash=g.content_hash AND visible` 行则排除该 platform 行（org 行存活=私有优先语义自然结果）·**谓词镜像钉死（rev2 F1）**：NOT EXISTS 子查询须镜像本查询全谓词（同 generation+同 taxonomy_version+同 serving_scope_id+visible+candidate 成员+owner 域）——孪生在本查询不可召回则 platform 行存活（防跨 scope 误杀唯一可召回副本）；排除谓词内容级承重面=源级 `uq_qsrc_active_hash_scoped`（A14·0186 :111）+hash 由应用层从正文派生（0029 :37）+单活跃源纪律（A17 rev2 重锚）——**rev2 勘误**：原「同 owner 内无双行走 A17 UNIQUE(owner,kind,hash) 既有保证」失实（A17）·同 owner 同内容双 refId 行机械可达·**同 owner 双 refId 行不属本刀修面（登记边界）**·谓词零签名变更（返回类型不动·CREATE OR REPLACE 合法）。
- **案②-B 函数面暴露 content_hash → 融合层二次折叠**：与①-A 同迁移把 `content_hash` 一并暴露到返回面·融合层 refId 去重（现状 `:290-295`）后按 content_hash 二次折叠（同 hash 多 refId 保 owner 秩最高者·次序=裁决随①定）——数据经 SECURITY DEFINER 出 RLS 面进应用层·折叠面多一手实现。
- **共同面**：C 端臂逐位零变（0.2-3）；qbank_question 展面（curation 面）同内容双行=登记边界不并入（裁决项⑦）；缓存键同拍 v6。

## §2 验收断言候选（pre-exec 双审核对单基面·EXEC 立项重 pin·断言力≥3）

1. **融合 owner 秩臂（修法①）**：新 proof 构造**通道成员不对称**累分逆转夹具（rev2 E2 改形：org 行仅入 dense 距离窗 A6 :285 且居候选池末位·lexical 词频窗 :289 成员缺席；platform 行双通道在池——两窗成员天然不对称可构造·原稿「org 双通道次位+platform 双通道首位」形在现状外层 A9 :110 全 org 先于 platform 下不可构造）·断言 rrf 模式输出 org 行序先于 platform 行（案①-A 落位后）——逆转夹具在**现状**必红（融合序 platform 先于 org=红①可复现性=断言力第 1 层）；dense 模式同夹具输出零变。
2. **双行折叠臂（修法②）**：沿 A21 ④区 dupHash 臂形扩展——org A 与 platform 各持同 content_hash 活跃源+各自 refId 入投影·断言 org A 检索输出同内容恰 1 行（org 行）·k 槽位不被双行消耗——现状必现双行（红②可复现性=断言力第 2 层）·**org 孪生 question 解析臂（rev2 F5）**：②-A 换 refId 后 org 行 refId 经 question_evidence 按 qc.ref_id 映射（0187 :263 `qc.ref_id=hit.ref_id`+:276-277 `g/ch.ref_id=qc.ref_id`）取证链可解析其 question 证据（断言在场）·被排除 platform 孪生 refId 不进本查询取证输入面（若单独入参仍沿 owner 行级谓词解析其自身 question=边界登记裁决⑦）。
3. **C 端零变负臂**：platform 查询对折叠/秩臂夹具输出与现状逐位一致（0.2-3 断言化=断言力第 3 层）。
4. **50 臂回归原值**：A21 全 50 臂原值零翻（②-b-1/②-b-2/⑤-1/④ 区逐位）。
5. **缓存升版断言**：CACHE_KEY_VERSION 字面 v6（rg 可验）·v5 语义陈旧性头注在场·**零残留断言面（rev2 F4）**：版本串内嵌键→v5 旧键不可达+TTL 有界自净（缺省 120s·`qbank-retrieval-cache.ts:22`）+fill_intent 旧键行 inert+滚动部署键空间不相交（论证见 0.2-4·随 proof 注记/rg 回执留痕）。

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
- 迁移仅 0200 一档预期（0.2-2·裁决项⑤·rev2 B1 改占）；若裁决项⑤翻案为零迁移退化案则本刀缩为注记卷·修法面全撤。

## §5 Ban 列表 + pins（沿母卷同源誊 + 本刀面增删·增删处显式标注）

**Ban 列表**（同源誊自 `ag39-org-qbank-REQUEST.md` §5·【增】/【删-改】标注为本刀面）：

Ban push；Ban 自批（双审须独立外席）；Ban retry-to-green；Ban 翻 pins（§5 pins 十一值·含 `actualSpendCny=null` 不翻）；Ban 改共享 SSOT（四件+INDEX 只读引用·行翻面权归协调方）；**Ban 检索算法改动**（【删-改·本刀面重述】RRF_K/MAX_K/MAX_CANDIDATES/candidateK 常量零动·dense|rrf 双模语义零动·distance 恒真 cosine 语义零动——融合层**排序键内 owner 维度叠序**不属算法改动 Ban 面·但其解禁以裁决项③双审核可为前置）；**Ban 触 CRAG 面**；**Ban 应用层过滤替代库内强制**（【本刀面重述】owner 隔离谓词与库内 owner 秩零削弱零替代——融合层叠序/折叠只增不削·proof 隔离臂仍以直连函数调用验证库内强制）；Ban owner GUC 作鉴权根；Ban 复活 qbank 数据面写路径 GUC 鉴权根 RLS 策略（rev4 限定口径同源）；Ban 静默降级（fail-closed RAISE 语义零豁免）；Ban 来源审计缺位（既有三值面零退化）；Ban 零弱化 B 端禁练习记录结构保证；Ban C 端企业私有中间态（本刀 C 端臂逐位零变=硬验收）；**Ban 历史迁移字节改**（0001-0187 零字节+`sql/` 影子零改·只加 0200 新迁移（rev2 B1 改占·0190-0199 已被 5B-MIG 在飞实占·A22）·0106/0144/0176/0186/0187 原文零触——0144 函数体若须镜像镜像进 0200 不回改）；Ban 新状态机；Ban 触他刀面；Ban 触其他工作树（在飞机互认）；Ban 伪造已问/已验来源；Ban 新 env 闸/新定时器/新配置面；Ban 顺带升级依赖包（DEPS-AUDIT 域）。

**pins（十一值照抄·零翻转）**：

haStatus=NOT_HA · releaseEvidence=false · claimProductionHA=false · gR45Closed=true · coveredCount=8 · ms3EqualsR4Closed=false · PG-retained · 公开 DELETE=503 · g7SuiteGreen=false · r1Closed=false · 脚注 actualSpendCny=null（本刀 proof 全隔离库真迁移链+假体·零模型外呼·零消耗）

## §6 est live=0

本刀零模型真实外呼：新 proof=隔离库真迁移链（本地临时 PostgreSQL·零生产 DSN/零生产 Key/零凭据落盘）+hybridQbankSearch 直连调用面（融合秩臂/折叠臂全本地可证·假体 embedder）+既有门全本地；typecheck/migrate:prove/drift:prove/docs:check=本地门——零生产操作·零 secrets·零消耗（pins 脚注同源·EXEC 收据逐 prove 登记零外呼口径）。

## §7 markers=0（卫生声明）

本刀改动集（起草席恰 1 .md=`ai-docs/delivery/harness/ag39-quality-REQUEST.md`；EXEC 改动集预期=packages/db 迁移 1 文+应用融合层 1-2 文+新/展 proof 1-2 文·以 EXEC 立项清单为准）**五类标记词 grep 零命中**（起草席亲跑·命令与回执沿 ttl-wire receipts 形留执行席收据·五类标记词不复抄卷内——避免自匹配·沿母卷/ag37 卷 §7 同形制）；docs:check（含 public text policy 路径标记扫描）落卷前后恒 EXIT=0·卷内全仓内相对径。

## §8 STOP（开工三条款）+ 裁决项 + 停止条件 + 交付报告格式

**STOP · `draft:awaiting_pre_exec_dual` · alone≠dual。** 起草席写完即停零码动（本卷恰 1 .md）。开工三条款：①预执行双审两外席 **BOTH PASS 落卷**；②**协调方明示授权**（本卷系 checklist `:2588` STILL OPEN 登记的执行卷·非授权本身）；③EXEC 立项**不得改 §1 修法方向与 §5 Ban/pins**（改则回炉重审·立项时照 §0 逐条重 pin）。Context Lock 口径：本卷属会话工单·派单时由主会话显式给路径·执行席不自行检索卷位。

**裁决项（pre-exec 双审/EXEC 行使·七项）**：

1. **修法①落位形**：案①-A（SQL 面 additive 暴露 owner_kind·推荐）vs 案①-B（零迁移退化注记·不推荐）；若①-A：融合叠序形**限三级稳定排序键单选**（owner_rank→fused_score→refId·与 0187 外层 `:110` CASE 同构·rev2 F3 钉为默认落位形）——融合分内 owner 加权仅作备选且须附支配性约束：**org 加成>融合分最大极差（1/61−1/(60+n)·n=候选池实测宽度≤MAX_CANDIDATES=200）**·约束不可满足或不固定权重值则选加权即须**显式降级承认**（加权形不构成 owner 秩硬保证·仅软偏置）否则回落三级键。
2. **修法②落位形**：案②-A（SQL 谓词排除·推荐·零签名变更·数据不出 RLS 面）vs 案②-B（暴露 content_hash+融合层二次折叠·与①-A 同迁移合流可省一函数面）；若②-A 则**谓词镜像钉死（rev2 F1）**：NOT EXISTS 须镜像本查询全谓词（同 generation+同 taxonomy_version+同 serving_scope_id+visible+candidate 成员+owner 域）·孪生不可召回则 platform 行存活（防跨 scope 误杀唯一可召回副本·与 §1.3 同文）。
3. **学说衔接核可（双审前置门）**：母卷裁决②「RRF 融合层不承担优先序=§5 Ban 延伸」（A3/A7）与本刀修法①的修订关系——本刀定位=0187 库内 owner 秩之上的**叠序**（库内谓词/秩零削弱·隔离语义不变·仅融合输出序补全端到端语义）·须 pre-exec 双审明示核可后方可进 EXEC·0187 头注 A7 段随 0200 迁移头注同步勘误（历史迁移字节零改·注记更新落新迁移头注）。
4. **质量面定界确认**：org_id 过渡形态+存量回填（STILL OPEN 第④项）本刀**划界外**（推荐）vs 并入——推荐划界·org 实体刀落位面零触。
5. **迁移号确认**：起草席实证「预期零」不成立（0.2-2·RLS 挡直读+返回面无 owner/content 数据源）→ 预期恰 1 迁移 **0200**（**rev2 B1 改占**：0188 cost4 在飞占用+0190-0199 已被 5B-MIG 在飞实占（b5m @7152cd3c ls-tree 亲证）+0189 全树零占用但占之违链单调·协调方分配 0200·A22 亲证）vs 退化零迁移案（=裁决①选①-B 连带·不推荐）。
6. **缓存键升版形**：v5→v6 单跳（两修法同刀·推荐）vs 分刀各跳——同刀单跳。
7. **qbank_question 展面双行边界**：不并入本刀·登记后继（推荐·curation 面另刀）vs 并入（扩权须协调方明示）·**rev2 F5 边界登记**：②-A 换 refId 后 question 解析下游走 question_evidence 按 qc.ref_id 映射（0187 :263+:276-277）——org 孪生 refId 取证可解析（§2-2 解析臂）·被排除 platform 孪生 refId 若单独入参（历史 served 记录等）仍沿 owner 行级谓词解析其自身 question（取证面 owner 谓词零改·无优先序语义）·该交互边界随展面双行一并登记后继。

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
# 若 0200 落地增跑：migrate:prove · drift:prove · check-migration-version-uniqueness · qbank-control-sec:prove · rag03-filter-locus:prove · rag03-hnsw-completeness:prove（全 EXIT=0 零新红）
```

**交付报告格式（EXEC 收尾随翻·append 保史·§0-§8 原文零改）**：①门矩阵逐门 EXIT 实测值+新 proof 臂计数；②裁决①-⑦行使结果逐项落值；③0200 迁移号占用登记（若落）+链深实测（applied=188 预期·四处独立复现沿母卷形）；④改动集文件清单+markers 五类改动集扫描回执；⑤缓存 v6 升版 rg 回执；⑥§0 重 pin 漂移登记（如有）；⑦STOP 翻面建议（`executed:awaiting_post_prove_dual`）归协调方。

**Sibling sections stay as written. alone≠dual · EXIT0≠covered · 实现方不 self-approve。**


## §9 rev2 勘误席处置摘要（2026-10-14·pre-exec 双审两席 FAIL findings 全数处置·docs-only 恰 1 .md·零码动·STOP 维持 `draft:awaiting_pre_exec_dual`）

**处置计数**：双审 findings 八族全数处置=B1（协调方裁决）+席1 E1/E2/E3+席2 F1/F2/F3/F4/F5/F6（E1+F2 合并处置=A17 重锚·E3+F6 合并处置=行号勘正）·改动集恰 1 .md=本卷·commit=rev2·⛔push。占号串 rg 实测：改前 13 串/12 行（协调方口径 9 处·以 rg 实测为准全改·偏差如实登记）·改后「0190」仅存 A22/§5 Ban/裁决⑤/本节之「0190-0199 已被 5B-MIG 实占」事实句·占号语义零残留。

1. **B1·迁移号改占 0200（协调方裁决）**：0190-0199 已被 5B-MIG 在飞实占（`meetwise-b5m` 树 @`7152cd3c` `git ls-tree` 亲证十文件在场·本席复跑同证）；0189 全树零占用（16 工作树 `ls` 亲证）但占之违链单调·协调方分配本刀改占 **0200**。落点=A22 重写（含勘误注）+0.2-2/案①-A/案②-A/§4/裁决③/裁决⑤/门预申明注释/交付报告③ 全部占号语义改 0200+§5 Ban「只加 0190 新迁移」同步改「只加 0200 新迁移」（含 0144 镜像落点 0200）。
2. **席1 E1+席2 F2（P1）·A17 重锚**：「UNIQUE(owner,kind,hash) 既有保证」失实亲证（该 UNIQUE 属 legacy vector_chunk upsert `retrieval-store.ts:25`；qbank 路径 qbank_chunk PK=ref_id 0029 :31/qbank_generation_chunk PK(generation_id,ref_id) 0029 :145·零内容级唯一约束；同 owner 同内容双 refId 行机械可达=qbank-ingest.ts :305/:312 ON CONFLICT(ref_id) 仲裁+头注 :12/:22 legacy 语义陈旧残留）。落点=A17 重锚（真实承重面=源级 uq_qsrc_active_hash_scoped 0186 :111+hash 派生约定 0029 :37+单活跃源纪律）+案②-A 承重面改引+§1.3 登记边界「同 owner 双 refId 行不属本刀修面」。
3. **席2 F1（P1）·谓词镜像钉死**：案②-A+裁决② 补「NOT EXISTS 须镜像本查询全谓词（同 generation+同 taxonomy_version+同 serving_scope_id+visible+candidate 成员+owner 域）·孪生不可召回则 platform 行存活」（防跨 scope 误杀唯一可召回副本）。
4. **席1 E2（P1）·夹具改通道成员不对称形**：亲证现状外层（0187 :110 CASE）使同通道内 org 行恒先于 platform 行→原稿例「org dense@1+lex@1 vs platform dense@0+lex@0」不可构造；改形=org 行仅入 dense 距离窗（qbank-generation-retrieval.ts :285）居池末位·platform 行双通道在池（lexical 词频窗 :289 成员天然不对称·双通道累分恒大于单通道池末位分）→融合序逆转·「现状必红」断言力保持（红①例证+§2-1 同步改写）。
5. **席2 F3·裁决① 收紧**：三级稳定排序键钉为单选默认落位形；加权形降为备选并须附支配性约束「org 加成>融合分最大极差（1/61−1/(60+n)·n=池宽≤MAX_CANDIDATES=200）」·不满足则须显式降级承认（软偏置非硬保证）否则回落三级键。
6. **席2 F4·缓存零残留+v4→v5 归属勘正**：§0.2-4+§2-5 补零残留论证（版本串内嵌键→旧键不可达+TTL 有界自净（缺省 `DEFAULT_TTL_SECONDS=120` `qbank-retrieval-cache.ts:22` 亲证·审席上界口径 ≤3600s）+fill_intent 旧键行 inert（:175-196 singleflight 面）+滚动部署键空间不相交）；v4→v5 归属勘正=AG-39 母刀 EXEC `1408d8c2`（`git log -L` 亲证·头注 :16-18「v5 additionally binds the AG39 owner layer」）·非 AG-24。
7. **席2 F5·org 孪生 question 解析臂/边界登记**：§2-2 增解析臂断言（②-A 换 refId 后 org refId 经 question_evidence 按 qc.ref_id 映射 0187 :263/:276-277 可取证）+裁决⑦ 增边界登记（被排除 platform refId 单独入参仍沿 owner 行级谓词解析其自身 question·取证面 owner 谓词零改）。
8. **席2 F6+席1 E3·行号勘正**：A20 main.ts `:554` 删（亲证系注释行「localRetrieve remains compat/test seam」非调用·rg 全集恰两处生产调用）·锚定 main.ts **:569**+track-local **:266**（两处均亲证为 `cachedQbankSearch(` 调用行）；A9 `:108`→**:106**（内层 LIMIT）·`:112`→**:111**（外层 LIMIT k）；A10 `:157`→**:156**（LIMIT k）·owner 秩 ORDER BY 精化为 :154-155。A9/A10 其余引用（:102-104/:110/:105/:120-121/:151-153）与本卷他处行号（A6 :284-:300/A14 0186 :111/裁决①③ 0187 :110）本席复验零漂。

**自检**：`node scripts/ai-docs/check-docs.mjs` EXIT=0；markers 五类改动集新增行零命中；STOP 维持 `draft:awaiting_pre_exec_dual`（alone≠dual·待双审复验+协调方授权·⛔push）。
