# H2 QBANK-CORPUS EXEC 收据（executed:awaiting_post_prove_dual）

- 工作树 `/Users/miaole/Desktop/golucky/meetwise-h2q` · 分支 `line/h2-qbank-corpus` · 基线 `20186718` + draft `19229b9a` + 勘误 `11191e9e`（均 docs-only）。
- 执行时点：2026-10-11 · 席位：H2 QBANK-CORPUS EXEC（预执行双审 BOTH PASS 后协调方派单开工）。
- 改动集：14 个修改文件 + 7 个新增文件（`git diff --stat 20186718`：503 insertions/43 deletions + 未跟踪 7 件）。
- ⛔push 未执行 · ⛔动主线未触 · est live=0（详见 §八）。

## 一、逐项实施（§3 六项）

### ① 导入工具+审核流程（#75）
- `scripts/qbank-import.cli.ts`（新增）：plan/commit 双模式审核门。plan=校验+近重复扫描+待审清单输出，零写库；commit=重跑全部校验+批内+存量全量扫描（control executor 只读取 `qbank_chunk`×`qbank_question_chunk` prompt 文本，规模帽 20000 如实注记），近重复命中未带 `--accept-near-duplicate` → EXIT 2 复核位拦截（不静默拒不静默灌），确认后走 `ingestQuestionBankArtifacts` 既有治理路径（propose→qbank_source→approve→promoteToPool，零新表）。annotationSource 默认 `curator_reviewed`；`seed_v1_reviewed` 须显式指定（内置种子通道语义保持）。embedder：`--embedder mock`（确定性向量；generation 模式 ingest 本不调 embed）/provider 形注明须运营真实 Key（本仓 prove 零外呼）。
- 导入件构造：`packages/db/src/qbank/qbank-corpus.ts:165 buildQuestionArtifact`（扁平项→逐题四 chunk artifact）；`validateQuestionArtifacts` 由 `qbank-ingest.ts` 导出复用（校验全接）。
- 种子扩容（自撰·沿头注版权先例）：`apps/worker/src/qbank-seed.ts:209 QBANK_SEED_V2_SOURCE` 13 条逐题撰写种子（rubric/followUp/antiPattern 逐题互异），难度 1×2/2×6/5×5（补齐 1/2/5 零题档），scope 三值→七值（新增 backend/go、backend/python、frontend/web、qa/quality_engineering=0086 已释放叶），:283 `QBANK_ARTIFACTS=legacy(33 字节保留)+V2(13)`。
- **旧 33 条种子与其 COACHING 共享块字节保留零改**（EXEC 裁决：同 refId 内容不可变守卫禁止原位改写；#76 病灶以「旧通道兼容保留」登记，新语料面已逐题化）。legacy `vector_chunk` 通道（`main.ts:320` `have < QBANK_SEED.length`）保持 33 条语义零改；生产 generation 通道 46 条。

### ② 逐题 rubric/追问（#76）
- `qbank-corpus.ts:140 assertPerQuestionCoachingDistinct`：同 competency 任两题 rubric/follow_up/anti_pattern 三件套逐字段互异，违者抛 `qbank_question_shared_coaching:<competency>:<idA>:<idB>:<role>`。CLI plan/commit 强制执行；prove 断言共享即拒。
- 数据模型零改（§1.4 已证 capable）；零增列 → **零 schema 迁移**（见 §五迁移裁决）。

### ③ 难度 1-5 谱+检索 difficulty 过滤参数（#77）
- 谱扩容：种子 V2 五档各有供给（§一①）+ prove 谱样五题 d1-d5 入库存真（DB CHECK 既有）。
- 池级过滤谓词：`packages/db/src/qbank/qbank-track-local-retrieval.ts:268-289`（Phase 4.5，recheck **之后**）：经 `readGenerationQuestionChunkProjection`（control executor 只读，零新权限零新 SECURITY DEFINER）把 chunk 命中映射到题面 questionId/difficulty/questionState，`published && difficulty===plan.difficulty` 方入服务题池；非题面 chunk 剔除（结果组装本就不产题）。**落点=卷 §3-③ 候选「qbank-generation-retrieval.ts 候选池过滤」同层（结果组装前一层），语义=服务题池不含非目标难度题，非查询文本拼接**。
- **关键裁决（重构）**：过滤原置 recheck 前吞掉 recheck_failed 状态面（generation_race/cross_track/tamper 被 pre-filter 吞成 served-empty，rag04 承重契约红）→ 移至 recheck 之后只作用于已过权威重验的候选。recheck 调用与全部 fail-closed 状态逐字节保持（rag04 复跑全绿 33 PASS）。
- 相邻档 ±1 放宽：**先严格相等**（谱满后），留后刀 ADR（模块头注释+本收据登记）。
- 空池（过滤全滤空）→ `filteredEmpty=true` 语义位（:315）→ worker `scoredRefsFromDispatch`（`qbank-track-local-retrieve.ts:220`）显式映射 `degradedRetrieval('no_eligible_in_scope')`——空池降级非发明；既有零命中空 serve 语义零改（仍 []，CRAG fallback_web 原样）。真零候选不置位 → negative-cache 记录语义零改；滤空态**不记** leaf 级负面 verdict（`qbank-track-local-retrieve.ts:548-559` 抑制，防毒化同 leaf 其他难度查询；rag06 facet/record/read 函数零字节零触）。

### ④ 导入时近重复检测+人工复核（#78·非向量形）
- `qbank-corpus.ts:53 NEAR_DUP_JACCARD_THRESHOLD=0.2`（EXEC 裁决）：卷建议 0.8，但种子近重复对（seed:limit-3 ↔ seed:design-2）**实测 3-gram Jaccard=0.289**、同域非重复对全量实测 ≤0.086（12 题全对实测）——0.8 落不中卷点名「如实命中」的种子对；0.2 落在 3 倍以上间隔带，方向=召回优先（命中只进复核队列）。
- 门形：`normalizeCorpusText`（NFKC+小写+空白标点折叠）→ 规范化精确 hash 同碰（exact_normalized·score=1）→ 逐对 charShingles(3) Jaccard ≥ 阈值（shingle_jaccard）；`NearDuplicateVectorSeam`（:36 接口缝，`nearDuplicate?(normalizedText)`）留向量 cosine 后刀升级，本刀零 embedding 实现（注入才出现 vector_seam 通道）。
- 复核位：CLI commit 门（§一①）；种子近重复对处置=prove 如实命中登记（不合并不静默），保留双题留人工裁决（Ban 静默丢弃遵守）。

### ⑤ 检索面扩展（#79）
- scenario 接检索：`adaptive-interview-service.ts:310` `useRetrieval = kind === 'fundamental' || kind === 'scenario'`（白名单 EXEC 裁决：behavioral 考行为面经与技术题库语料错配，不纳入，留后刀，非「漏接」）。scenario 无素材（local+web 全空）→ `:331 approvedTemplateGeneration(scenarioDegradeTemplate(competency))` 显式降级模板（自撰·括注明示降级·零模型调用·零 fail 硬死，沿 ：247-257 grounded 先例形）；fundamental 既有语义零改。
- 查询带岗位/技术栈：`buildCragPlannerQuery`（:158，自撰清洗+段构造：`${competency}[ 岗位{role}][ 栈{stack}] 难度${d}`）；岗位=`deps.targetRole`（#259 供给线：interview-consumer:338 `targetRole: requestContext.targetRole` → lifecycle `makeDeps` → service）；技术栈=`selectGroundedFacts(d.resumeFacts)` 同源（每 fact ≤60 清洗×≤2 条，段帽 128）。协议扩展：`parseCragPlannerQuery`（`qbank-track-local-retrieve.ts:114`）三/四段解析（自尾剥栈→剥岗位；段含保留词/控制字符/超长 → fail-closed null），**旧单/双段逐字节兼容**（可选段缺省）。构造端先清洗——生产查询永不触发解析拒绝面。
- 已问排除（#79·最小形=refId 集合过滤）：新表 `qbank_served_question_ref`（0162）+ `qbank-served-refs.ts`（record/list）。写入=`dispatchTrackLocalRetrieval` Phase 6 与 served 转换**同一 asPrincipal 事务**（`qbank-track-local-retrieval.ts:311`，登记失败=serve 整体回滚，plan 留 dispatched 可重派，无漏排窗口）；读取=Phase 4.5 与 difficulty 谓词同位过滤。零已问机制现状如实（新建面，非假称既有）。

### ⑥ C 端检索面切 candidate-route（#202·收编）
- 消费面：`interview-consumer.ts:277` `routeSnapForRetrieve` 读源 `getInterviewRouteSnapshot` → `getInterviewRouteSnapshotForAdaptiveRole` 双轨（旧 recruiter snapshot 优先→缺行 fallback candidate_profile_route_snapshot）；B 端岗位面零回归（prove 旧表行在=双轨读逐字段等于旧表直读）。:374-380 旧注释「检索面维持旧表直读不动」如实勘注解除。
- **派发层**：`qbank-track-local-retrieval.ts:238` Phase 1 快照校验读源同切双轨（消费面单切会仍把 C 端拒成 snapshot_missing，双轨必须两层同切——本刀亲测发现并修复）。
- 结构性使能：`0163_qbank_plan_snapshot_interview_fk.sql`——`qbank_retrieval_plan`(0106:322)/`question_plan`(0110:74) 的 `snapshot_id` FK 从 `interview_route_snapshot(interview_id)` 改挂 `interview(id)`（candidate 面面试在旧表无行，plan 冻结必撞 FK=结构焊死 C 端检索面）。仅替换两条 FK 引用目标（text→text），零列变更零数据迁移，0106/0110 原文零字节。
- 门语义零弱化：缺行/缺叶仍 `route_snapshot_missing`→degraded→`deny_external`（crag.ts 零 diff 亲证），**永不 unscoped**（G-R2-5 语义零改，静态门+worker prove 双断言）；candidate 形状适配如实登记（jobId=''·revision=CANDIDATE_ROUTE_REVISION·routeDigest=input_digest·单 leaf·deficit 长度=1 非缺陷）。

## 二、验收矩阵（§2/§5 全量·EXIT 实测）

| # | 断言面 | 命令 | EXIT |
|---|---|---|---|
| 1 | §5.1 锚复现+Ban 邻面零触+markers 门+迁移裁决 | `node scripts/qbank-corpus-gates.prove.mjs` | 0 |
| 2 | §5.2 导入全链+拒面矩阵+逐题互异+CLI 子进程全链（plan EXIT0→复核位拦截 EXIT2→带位放行 EXIT0→3 题落库 published） | `node scripts/run-e2e-isolated.mjs qbank-corpus:prove` | 0（51 PASS） |
| 3 | §5.2c 谱样 d1-d5 入库存真（DB 五档各 1·published） | 同上（内含） | PASS |
| 4 | §5.3 难度池过滤（d2/d3 各只返回本档；前置证据=同 scope ANN 候选含双档）+空池 filteredEmpty+负面 verdict 不记录 | 同上（内含） | PASS |
| 5 | §5.4 近重复门（种子对 0.289 如实命中+非重复对不误报+规范化精确命中+seam 通道+零 embedding 依赖） | 同上（内含） | PASS |
| 6 | §5.5 已问排除（一三轮不重现·按题粒度不误伤未 served 题） | 同上（内含） | PASS |
| 7 | §5.6 db 面（B 端旧表优先轨零回归+C 端 fallback 读形+旧表无行=null） | 同上（内含） | PASS |
| 8 | §5.5 worker 面（解析兼容/fail-closed null 矩阵/scenario 双分支/behavioral 白名单/fundamental 零改） | `node scripts/run-e2e-isolated.mjs qbank-corpus-retrieve:prove` | 0（37 PASS） |
| 9 | §5.6 worker 面（route_snapshot_missing 逐字·缺行缺叶同拒·永不 unscoped） | 同上（内含） | PASS |
| 10 | 回归 §5.7 | `rag03-route:prove:raw` / `rag04-track-local:prove:raw` / `rag05-qbank-miss:prove:raw` / `interview:prove:raw` / `uc040-043:batch-qbank-seat:prove:raw` | 0/0/0/0/0 |
| 11 | 附加亲临面回归 | `migrate:prove`（95 PASS·fresh+幂等 skip+零数据丢失）/ `neg:interview` / `g-r2-5-retrieve-fail-closed:prove` / `r4-real-wire-impl:prove` | 0/0/**1=预存红（base 同红，FAIL 集合逐字相同·stash 前后对账·不洗）** |
| 12 | 类型检查 | `tsc --noEmit` packages/db / apps/worker | 24=24 IDENTICAL / 46=46（唯一差异=预存红位移 adaptive-lifecycle :179→:182，本刀 +3 行注释所致，零新增红） |

## 三、基线漂移与冲突预判清单（对主线 feat/mysql-schema-skeleton @c7142596，超前基线 15 提交）
1. **0161 已被 G5 占用**（`0161_practice_only_read_narrowing.sql` 主线在树）→ 本刀迁移 **0162/0163 起号**（§五）。
2. **interview-consumer.ts 主线 +1 行**（ha-7 `markJobFailed` 后 metrics 行，:184 邻域）——与本刀改面（:276-281 双轨/:338 targetRole/:374-380 勘注）零重叠，merge 冲突风险=低（import 行同段有单行并集可能）。
3. g5 动 `interview-assessment.ts`+neg:interview 97→102——本刀零触 interview-assessment；neg:interview 本树 95 PASS EXIT=0（本树基线 97 断言版本），主线合并时 neg:interview 以主线值为准（纯 additive 差异）。
4. 其余触面（qbank-seed/adaptive-interview-service/qbank-track-local-retrieve/qbank-*/crag/candidate-route/job-route-decision）主线相对基线**零漂**（`git diff 20186718..feat/mysql-schema-skeleton --stat` 实测仅 interview-consumer +1）。

## 四、EXEC 裁决登记（卷内 EXEC 裁决项逐条）
1. 迁移：**0162/0163 两件**（0161 主线占用·撞号治理后到者重编号；`fresh/幂等双跑` migrate:prove 95 PASS 绿）。若 EXEC 判需增列→数据模型零增列（#76 数据面 capable），0162=已问排除最小表、0163=FK 使能（#202 结构必要，非越权：§3-⑥ 切面的必要前提）。
2. scenario 白名单=fundamental+scenario；behavioral 不纳入（错配，留后刀）。
3. 近重复阈值=0.2（实测依据见 §一④）；种子对处置=如实命中登记+保留双题（人工裁决留复核位）。
4. 相邻档放宽=先严格相等，留 ADR 注记。
5. 旧种子=兼容保留（字节零改）；新语料逐题化。
6. 纯切 vs 双轨=双轨（沿角色门先例，B 端零回归）。
7. rag04 红后的重构裁决=过滤置于 recheck 后（服务题池层）——拒绝语义面零改优先于前置剔除。

## 五、陷阱自检表
| 陷阱 | 结果 |
|---|---|
| 迁移撞号 | 避开（0161 主线占用亲证，0162/0163 起号） |
| crag.ts 决策面 | 零 diff（静态门 git 双断言+working tree 断言） |
| embedding compute seam/recipe | 零 diff；近重复零 embedding（纯文本扫描可断言） |
| #40 发布合同面 | 零 diff（interview.service/controller git 断言） |
| LEVEL-SCHEME 落卷面 | 零 diff（0160 两文件+career.ts git 断言） |
| rag06 负缓存毒化 | 滤空态不记 leaf 级负面 verdict；record/read/facets 函数零字节 |
| recheck 拒绝语义 | 过滤后置，recheck 状态面逐字节保持（rag04 复跑绿） |
| 候选面 dispatch 拒绝 | 派发层+消费层双层双轨；0163 FK 使能 |
| G-R2-5 弱化 | 静态门+prove 双断言永不 unscoped；crag.ts 零 diff |
| markers 自指 | 五类词运行时组装（零字面落改动集），改动集 grep 零命中 |
| 预存红洗白 | g-r2-5/r4 FAIL 集合 stash 前后逐字相同（不洗）；tsc 位置集对账 |
| retry-to-green | rag04 红为设计缺陷（非环境抖动）→重构修因后复跑，一次到位 |

## 六、est live=0 收据（逐 prove embedder 注入点）
- `qbank-corpus:prove`：embedder=proof 内联 `deterministicVector`（512 维 sha256 派生单位向量，id `h2q-corpus-proof-embedder:v1`），注入点=ingestQuestionBankArtifacts/buildActiveGeneration/dispatch `embedSeam`；CLI 子进程用 `--embedder mock`（generation 模式下 embed 零调用）。零模型外呼零计费。
- `qbank-corpus-retrieve:prove`：零 embedder 面——scripted ModelClient（interviewer.ask 假回放）+ fake localRetrieve/webExplore；invoke 走 fixture PG。零模型外呼。
- 静态门：零 I/O 零网络。隔离 PG 即用即灭（run-e2e-isolated 容器 172.17 私网·用后销毁）·零生产操作·零 secrets（HMAC 用固定测试键）。

## 七、Non-claims
本刀 ≠ #75-79 收口 ≠ 题库已富 ≠ 难度谱已校准 ≠ 检索质量已提升（归评测面）≠ 向量近重复已建（cosine 归后刀·seam 已留）≠ RAG 决策面改动（crag.ts 零 diff）≠ 评测基线已跑。种子扩容后仍为「起步+导入供给」形态。prove EXIT=0 ≠ DONE（走 post-prove 双审+nail）。

## 八、停止条件三查
1. 卷锚与实树不符→全部按 §9 重 pin 并登记（§三）；未超免责口径。
2. 断言写不绿→rag04 初红=设计缺陷已重构修因（非静默改口径，重构裁决入 §四7）；g-r2-5/r4/tsc 红=base 同红对账不洗。
3. Ban 邻近→crag.ts/embedding compute/#40/LEVEL-SCHEME/SSOT 五面 git 零 diff 静态门亲证；未触发停止条件。

—— H2 QBANK-CORPUS EXEC · 2026-10-11 · executed:awaiting_post_prove_dual · ⛔push · Ban self-approve · alone≠dual

## 九、nail 双席登记项勘误（post-prove 双席 BOTH PASS · nail 席随落卷 · 2026-10-11）

post-prove 双席（席1 实现核对+席2 验收回归·互盲独立·矩阵全数独立复现）BOTH PASS 后，双席登记项随 nail 落卷如下（docs-only 勘误·零码语义·本节为收据勘误节）：

1. **近重复数字重 pin（量测域勘误）**：§一④「种子对实测 3-gram Jaccard=**0.289**、同域非重复对全量实测 **≤0.086**（**12 题**全对实测）」系**未规范化域**量测；双席在**门域（=规范化后·即 `normalizeCorpusText` 实际生效域）**独立复算/复现同值重 pin 为：种子对=**0.382**（prove 日志如实锚：`receipts/h2-qbank-corpus/qbank-corpus.prove.stdout.log:35` `[score=0.382 threshold=0.2]`·在案无洗数）、同域非重复对上界=**≤0.115**、覆盖=**33 题全对**（席1 独立复算+席2 复现同值）。0.289/≤0.086/12 题三个数字按未规范化域口径如实体留于 §一④原文·本勘误不删不改只注域；阈值 0.2 裁决结论不变（0.382 与 ≤0.115 间隔带仍 3 倍以上·方向=召回优先成立）。
2. **rag03-route stdout 日志补存**：§二10 回归行 `rag03-route:prove` 的 stdout 日志 EXEC 卷未存（仅 rag04/rag05 有存）——nail 时按隔离 runner 形补存至 `receipts/h2-qbank-corpus/rag03-route.stdout.log`，命令名写隔离包装形：`node scripts/run-e2e-isolated.mjs rag03-route:prove:raw`（并后主线态实跑·EXIT=0·43 PASS）。
3. **tsc 精确命令与计数**：§二12 记法「24=24 IDENTICAL / 46=46」为 grep 计行口径；双席精确命令与计数重 pin：`pnpm -C packages/db exec tsc --noEmit`=**20 红**、`pnpm -C apps/worker exec tsc --noEmit`=**43 红**（nail 并后主线态复跑同值）；「零新增红+唯一预存位移 adaptive-lifecycle :179→:182（本刀 +3 行注释所致）」实质主张双席核实为**真**。
4. **行号漂移四处照更（并后主线态重 pin）**：§一③/⑤ 行号锚照更——难度池过滤（Phase 4.5 块）`:268-289`→**`qbank-track-local-retrieval.ts:273-302`**；served 登记同事务（Phase 6 块）`:311`→**`:308-315`**；`filteredEmpty` 语义位 `:315`→**`:318`**；#202 消费面读源赋值 `:277`→**`interview-consumer.ts:281-282`**（主线 ha-7 metrics +1 行致漂·实测亲证）。
5. **neg:interview「95 PASS」笔误**：§三3「本树 **95** PASS EXIT=0」系笔误，实为 **97**（`receipts/h2-qbank-corpus/neg-interview.stdout.log` 尾行「✓ neg:interview: 97 条负路径用例全绿」+逐 PASS 计数 97 亲证）；主线合并后以主线 102 断言版本为准（§三3 预判如实在案）。
6. **第三处恒真守卫残留登记**：`qbank-ingest.ts:319` ordinal 守卫中 `!seenRoleOrdinal.add(...)` 恒假（`Set#add` 恒真返回）——同 role:ordinal 重复在该子句**不可达**，实由 DB UNIQUE 兜底（0162 前既有约束面）；现数据路径（种子/CLI 导入件逐题构造）不触发·**非本刀缺陷**·登记残留：后刀修（改 `has` 前置判定）或明示豁免。
7. **CLI 死旗标登记**：`scripts/qbank-import.cli.ts:13` usage 声明 `--annotation-source`，但 argv 解析面零消费（annotationSource 仅读导入件字段 `file.annotationSource ?? 'curator_reviewed'`·`loadImportFile:74-108`）——旗标死·登记残留：后刀接 argv→annotationSource 透传或从 usage 摘除。
8. **审核流程语义张力登记**：蓝本 §3-①「复用既有治理路径 ingestQbank（propose→approve→promote）」与「approve 步骤=人工复核位·**不自动 approve**」存在张力（治理路径库函数含 approve 步，CLI 导入若逐字复用即含 approve 动作）。EXEC 解读=**复核位前移 CLI 近重复门**（commit 门 EXIT 2 拦截·`--accept-near-duplicate` 显式确认位=人工复核位载体），DB 层治理路径（propose→approve→promote）auto-approve 语义保持——席1 判**可接受解读**·显式登记留档。
9. **近重复 O(n²) 性能残留注记**：CLI commit 门批内+存量全量逐对 Jaccard 扫描为 O(n²)——control executor 规模帽 **20000** 内实测可达（帽内不可达上限风险），超帽场景后刀**签名索引**（如 minhash/LSH 形）建议·本刀如实注记不实施。
10. **Phase 3.5/4.5 注释统一**：`qbank-served-refs.ts:6` 头注与 `qbank-corpus.proof.ts:13` 头注作「Phase 3.5」，实际过滤块 `qbank-track-local-retrieval.ts:273` 标「**Phase 4.5**」——随 nail 统一为 Phase 4.5（comment-only 零语义·亲证两处已改）。

—— nail 席 · 2026-10-11 · merge `line/h2-qbank-corpus` @`634eb645` → 主线（--no-ff·ort 零冲突）· ⛔push

## 十、nail 并后复验（主线并后态·四键+邻面 · 2026-10-11）

| 键 | 命令（隔离包装形） | EXIT | 期望对账 |
|---|---|---|---|
| 1 | `node scripts/run-e2e-isolated.mjs qbank-corpus:prove` | 0 | **51 PASS** ✓ |
| 2 | `node scripts/run-e2e-isolated.mjs qbank-corpus-retrieve:prove` | 0 | **37 PASS** ✓ |
| 3 | `node scripts/run-e2e-isolated.mjs migrate:prove` | 0 | **95 PASS** ✓（0162/0163 并入全链 fresh+幂等·主线 0161 在树） |
| 4 | `node scripts/run-e2e-isolated.mjs neg:interview` | 0 | **102 PASS** ✓（主线 102 additive 为准·§三3 预判兑现） |
| 邻 | `node scripts/run-e2e-isolated.mjs rag03-route:prove:raw` | 0 | 43 PASS（stdout 补存·勘误§九2） |
| 邻 | `pnpm -C packages/db exec tsc --noEmit` / `pnpm -C apps/worker exec tsc --noEmit` | — | 20 / 43 红（与双席精确计数同值·唯一预存位移 `adaptive-lifecycle.ts(182,19)` 亲证） |

- 迁移链核查：`0159` → `0160_b_qualitative_projection` + `0160_level_policy_version`（预存双号·SOP 先登记者为准） → `0161_practice_only_read_narrowing`（主线 G5） → `0162_qbank_served_question_ref` → `0163_qbank_plan_snapshot_interview_fk`——序贯无新撞号 ✓。
- markers 门：本 nail 新增行（REQUEST Status append+收据 §九/§十+注释统一两处+rag03 日志）五类词运行时组装 grep 零命中 ✓。
- 冲突清单：**零 git 冲突**（ort auto-merge）——interview-consumer.ts 主线 ：184 邻域 +1（ha-7 metrics）与分支改面（:281-282 消费面/:338 targetRole/:374-380 勘注）零重叠；package.json 主线 ：595（ha6:prove）与分支 :449（qbank-corpus 三键）不同区域 additive。语义零纠缠·无 dual-keep 需次·无停止条件触发。

—— H2 QBANK-CORPUS nail 卷终 · post-prove 双席 BOTH PASS @2026-10-11 · ⛔push
