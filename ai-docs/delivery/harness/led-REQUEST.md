# 台账勘误 REQUEST — gap-bug-backlog 同编号多行矛盾唯一权威化 + 总控台账 R 号标签映射修正起草卷（docs-only · 起草落卷即停 · ⛔EXEC ⛔push ⛔动主仓）

**Status**: **`proofed:dual_pass`**（前值 `executed:awaiting_post_prove_dual` 2026-11-03 EXEC 行使后史录·更前值 `drafted:awaiting_pre_exec_dual` 2026-11-02 起草落卷即停史录·SSOT 勘误主体当时零行使——矛盾行改唯一权威值/冲突行标 superseded/R 号标签映射修正/对账表入卷四事留 EXEC 期随授权行使 · 本卷起草 commit 恰 3 tracked 路径=本卷 `.md` + 两 policy 脚本 CAP-SANCTION-2464 恰等步进 · **2026-11-03 pre-exec 双审 r1 席1+席2 BOTH PASS+协调方明示 EXEC 授权后已行使**（§9 EXEC 记录）· **2026-11-03 post-prove 双席 BOTH PASS**（关键读数 13 前缀+18 尾增机证·七注字节全等·intake 13 条抽验全实·cap 2465 独立复算·双席 P2 四条登记·留痕见 §9 post-prove 记录行）· alone≠dual · Ban self-approve · est live=0 · markers=0 · 状态钉四处：本行 + §8 + §9 + 卷尾 · 同值）

**席位**：meetwise 台账卫生勘误起草席（docs-only 起草 · 协调方派单「SSOT 卫生勘误刀起草」 · ⛔push ⛔EXEC ⛔动主仓）。

**基线**：`origin/main` @ **`2e808c9e3`**（full `2e808c9e3f55c069ac83f99ce95e59346dd52087` = PR #188 quizdx 并线点 · `git fetch origin` 本 turn EXIT=0 · worktree `meetwise-led` 由 `git worktree remove --force` 旧卷后 `git worktree add ... -B line/led-draft origin/main` 亲立 · HEAD 落 `2e808c9e3` 亲证）。**普查一律以 `git show origin/main:<path>` 亲读最新版两侧原文为据（本地 main checkout 落后 444 commit 陈旧勿直读）**。起草前本树三门亲跑：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2463 = cap `2_463` 恰等零余量**（`scripts/ai-docs/public-text-policy.mjs` `const MAX_FILES = 2_463` 亲读）；`node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**；改动集 markers 零命中（词面运行时组装·本卷不复抄·口径=同族 `scripts/i6-239-gates.proof.mjs` §2-7）。

## §0 认领核对与在飞对账

1. **认领唯一性**：`ls ai-docs/delivery/harness/ | grep -i '^led-'` 落卷前零命中 → 落卷后唯一同名卷=本卷；五编号（GAP-DEBT-DB-TRIGFAM/NOFK/SRCBOILER/MONEY3/HYGIENE）勘误无第二在飞卷认领（在飞 13 worktree 卷名逐一核对零命中）。
2. **L-10 零触**：`GAP-DEBT` 五编号之外，backlog `L-10`（SSOT 卫生勘误候选·checklist 5e-behavior 门矩阵 ⓐ/ⓔ 双同值失真）已由 **2026-10-26 台账卫生打包刀**钉注（checklist 门矩阵行「〔勘误注记 2026-10-26 …原文不洗…终值定谳权仍归 perf-load post 席2〕」亲读在卷）——定谳权在飞席，本卷零触零改。
3. **L-07/L-08/L-09/L-11/L-12/L-13 零触**：各有在飞定谳/另刀登记归属，本卷不代行使。
4. **在飞 cap 对账**：`line/nk1-draft` @`249ec97db`（EXEC+post-prove 落卷未并 main）已承 **CAP-SANCTION-2464 同值**（其树 `MAX_FILES = 2_464` 亲读）——两支并线期 union 沿常设预授权「cap 以合并树实测恰等步进免再询」届时重算承登；同触两 policy 脚本=已知共享热面 dual-keep 先例形（沿 CAP-SANCTION-2456 CWN/2461 EVAP 注记先例）。`line/sse2-draft` @`2e808c9e3` 零自有 commit 零步进。

## §1 全量普查清单（逐条亲读 origin/main 两侧原文 · 禁转述）

### §1-A 同编号多行矛盾（5 编号 / 12 行 · 全仓 `^\| ID` 行唯一编号去重机证无第 6 例）

| # | 编号 | 现行号 | 侧 A 原文（截真） | 侧 B 原文（截真） | 应改为唯一权威值 | 裁决依据（实树/已并线 commit 亲读） |
|---|------|--------|------------------|------------------|-----------------|-----------------------------------|
| A1 | GAP-DEBT-DB-TRIGFAM | `:887` vs `:889`/`:894` | `:887`「**CLOSED @0144 (DBTF-1 nail 2026-10-08)**…【处置：0144 tf_ 公共库 12 员+12 薄壳+双参 derived_score 收敛落地 · prove 51/51 · post-dual BOTH PASS（mw-privacy-int+mw-model-op）· 协调方授权 nail…】」 | `:889`/`:894`（同文重复两行）「**OPEN** · 触发器函数族全量重抄：0028→0046→0051→0082 状态机函数抄 4 遍…」 | `:887` 为唯一权威行（CLOSED）；`:889`/`:894` 标 superseded 指针（原文不洗） | `packages/db/migrations/0144_db_trigfam_unify.sql` 在树；`harness/db-trigfam-unify.md`(+`.exec.md`) 在卷；checklist「Line DBTF-1」nail 段；commit `4e734a522`（post-prove dual BOTH PASS）；backlog `:129` 汇总重钉笔 2026-10-26 亦明载「TRIGFAM…随 nail CLOSED 钉面」（上游统计已按最新态去重，行体未随——即本勘误区） |
| A2 | GAP-DEBT-DB-NOFK | `:890` vs `:888`/`:895` | `:890`「**CLOSED @0147+0148 (DBFK-1 nail 2026-10-08)**…【处置：6 FK 两段式落地+擦除链共存镜像 prove 31/31·双审 BOTH PASS·P7 四项 base-identical red=uuidv7 ACL 雷待 DBACL-1 复跑…】」 | `:888`「**OPEN** · interview 零外键被引用…」；`:895` 行首编号 **NOFK 但处置文=「**CLOSED @DBSB-1 nail 2026-10-08**…【处置：runAs/job 工厂/savepoint 收敛 30/30·双审 BOTH PASS…】」=编号错挂载（内容属 SRCBOILER/DBSB-1 面）** | `:890` 为唯一权威行（CLOSED）；`:888` 标 superseded；`:895` 标 superseded+「编号错挂载」注（其处置文内容 `:896` SRCBOILER 行已承载·零信息损失） | `0147_interview_owner_unique_index.sql`+`0148_interview_composite_fk_batch1.sql` 在树；`:892` append-only DBFK-1 EXEC 进度注（P1-P7 31/31·orphan 六表=0）；commit `32c9e2db8`（post-prove dual BOTH PASS mw-e2e-ha+mw-privacy-int）；错挂载源头=`0ff210196`（该 commit 新增三行时把 DBSB-1 处置文挂在 NOFK 编号下——git show 亲证） |
| A3 | GAP-DEBT-DB-SRCBOILER | `:896` vs `:893` | `:896`「**DBSB-1 EXEC'd 2026-10-08（runAs 泛型+8 wrapper 薄别名委托…prove 30/30 绿）·awaiting post-dual**·残面：案A 多态表未立项…【拟切片】EXEC'd·`harness/dbsb1-src-boiler-convergence.md`(+`.exec.md`)」 | `:893`「**OPEN** · src 层：14 份 SET LOCAL ROLE 事务样板…」（最滞后·连 11 份勘误都未承载） | `:896` 为唯一权威行；行内「awaiting post-dual」系滞后注——post 双审已 BOTH PASS 并 nail，勘误注订正为 `post_prove_dual_pass` nailed；`:893` 标 superseded | commit `0ff210196`（docs(dbsb1): post-prove dual BOTH PASS (mw-e2e-ha + mw-privacy-int)）即 `:896` 行所在 commit，其 checklist 新增段「Line DBSB-1 DB 样板收敛刀 NAIL … post-prove 双审 BOTH PASS · prove 30/30 EXIT=0」亲读在卷——行体滞后于本 commit 自身已录的 post 结论 |
| A4 | GAP-DEBT-DB-MONEY3 | `:899` vs `:897` | `:899`「**CLOSED @DBM3-1 nail 2026-10-08**…【处置：0149 四计数 DO+CHECK 护栏+11 值枚举+0027删保 0021·复跑 38/38（超集）·P3-1 转绿=0150 生效实证·双审 BOTH PASS·阻断→DBACL-1 独立刀→回支复跑纪律闭环】」 | `:897`「**OPEN** · 钱三轨制：amount_cents int(无正数 CHECK)/units numeric 无精度…」 | `:899` 为唯一权威行（CLOSED）；`:897` 标 superseded | `packages/db/migrations/0149_money_status_constraints.sql` 在树；`harness/dbm3-money-triple-track.exec.md` 在卷；commit `a79a811ae`（post-prove dual BOTH PASS · 0149 landed · rerun 38/38 strict） |
| A5 | GAP-DEBT-DB-HYGIENE | `:898` vs `:900` | `:898`「**CLOSED @DBHY-1 nail 2026-10-08**…【处置：0145 死表 DROP+jsonb DEPRECATED+GRANT×2（⊈0150 闭集）+0146 五重守卫·28/28·双审 BOTH PASS·sql/ 案B' 13 迁·drift 门退役换 dbhy1:prove…】」 | `:900`「**OPEN** · 死表 app_setting/consumption_record 在产…」 | `:898` 为唯一权威行（CLOSED）；`:900` 标 superseded | `0145_dead_table_jsonb_deprecate.sql`+`0146_qbank_partition_lifecycle.sql` 在树；`harness/dbhy1-db-hygiene.md` 在卷；commit `cb22270ca`（post-prove dual BOTH PASS） |

补充登记：`:882`/`:888` 号段两侧行号较复核席复核时点整体 +5（复核席读数系 2026-10-26 重钉笔落卷前时点值）——本表一律以 origin/main 现行号为准（写前逐行亲读）。

### §1-B 滞后注/过期注（行体 vs 已落地事实 · 不构成编号矛盾但属「过期」类）

| # | 位置 | 侧 A（行体现状） | 侧 B（已落地事实） | 应改为 | 依据 |
|---|------|-----------------|-------------------|--------|------|
| B1 | backlog `:879` BUG-E2E-FAILUNIMPORT | 行体现状「**OPEN** · 真 bug：e2e/full.e2e.ts:205 调用 emitE2EFailure 但 :14 只 import…」+行尾【处置：import 修复+e2e-static-guards 门+双常驻负例 TC 落地…】 | 修复刀已 post-prove dual BOTH PASS 落线：commit `665f98945`（import fix + static guard + 2 resident negative TCs）；`:129` 汇总重钉笔已按「陈旧 1（BUG-E2E-FAILUNIMPORT P0·本刀销账）」出账 | 行内 additive 滞后勘误注（已随 e2efail1 落线·统计已销账·OPEN 体原文不洗·终翻面权归协调方） | `git show 665f98945 --stat` 亲读 |
| B2 | backlog `:902` GAP-DEBT-BE-GODFN | 行体现状「**OPEN** · invoke() 372 行 8 职责…」（零进展承载） | 子刀 1a/1b/1c 已三 nail：checklist「Line GODFN-1a invoke 巨函数拆解刀 NAIL」（`1875` 行段·post-prove dual BOTH PASS）·「Line GODFN-1b G7 卫兵移组合根刀 NAIL」·「Line GODFN-1c interview.service 拆解刀 NAIL（955→745 行）」；STILL OPEN 残面=1d REQUEST 待立/r4 三键绿收据 rerun/trio base≡red | 行内 additive 进展注（三子刀已 nail+残面指针·OPEN 体不翻·残面如实） | checklist 三 nail 段亲读（commit `28d0d7a7`/`1af8987e` 链在卷） |

### §1-C 行统计区（`:116`-`:130`）——上游已重建 · 本卷零重改

- 复核席所报 `:119-:126`「合计 32 行」失真**已由上游修复**：origin/main 现值 `:122`「**合计 P0/P1 库存行 = 36**」+`:126-:127`「P0 20 / P1 16」+`:129`「**汇总重钉笔 2026-10-26**（台账卫生打包刀·协调方授权·docs-only·盘点席 A 级清单落地）：旧值 32=P0 23/P1 9 系 2026-09-17 PG-retained overlay 时点数沿滞留先例不追改。去重后现值口径=盘点席 OPEN=41（…同件多行去重取最新态：TRIGFAM/NOFK/MONEY3/HYGIENE 四件随 nail CLOSED 钉面…）−陈旧 1−在飞 4=36」（原文亲读）。
- **本勘误与 36 口径相容性论证**：重钉笔的计算基恰是「同件多行去重取最新态」——§1-A 勘误只把行体对齐到该去重口径（superseded 注记不改行数、不翻权威行状态），**行统计数值零变更**；EXEC 后 `:120-:121` 区段行数（A21/B11 旧口径时点数沿滞留先例不追改）零动。

### §1-D LEDGER（product-campaign-LEDGER.md）漂移与错位

| # | 位置 | 侧 A 原文 | 侧 B（权威映射/现状） | 应改为 | 依据 |
|---|------|----------|----------------------|--------|------|
| D1 | LEDGER `:136` | 「`R-20/R-21/R-23/R-24/R-36/R-37/R-44/R-50/R-51` | 连接预算/PgBouncer/多实例状态/队列指标/登录锁定/scrypt/索引/生命周期 | HA 配套 | 中」——**九号八标签**：9 个 R 号对 8 个标签，尾段 R-44/R-50/R-51 三号对「索引/生命周期」两标签，R-50 无标签可挂=错位 | HA-7 已并线 REQUEST（commit `49ab12d24` 落卷·EXEC `bfd27b293`·post `857058d9d` BOTH PASS·merge `82ea54e41`）权威映射亲读：「**R-24=队列指标·R-50/51=队列深度/生命周期**」「R-50 队列深度治理（深度口径 0042 既有零改）」「DLQ retention/生命周期清理（R-51 本体）」；HA-6 REQUEST `:106` 亲读「R-24 队列指标 / R-36 登录锁定 / R-37 scrypt / R-44 索引 / R-50/51 生命周期」 | `:136` 标签列补「队列深度」并为逐号贴标签（R-20 连接预算/R-21 PgBouncer/R-23 多实例状态/R-24 队列指标/R-36 登录锁定/R-37 scrypt/R-44 索引/R-50 队列深度/R-51 生命周期=九号九标签一一对应），行尾 additive 勘误注记（原文不洗） | HA-7 REQUEST/EXEC/post 三 commit 亲读；HA-6 REQUEST 亲读 |
| D2 | LEDGER `:134` vs `:136`（跨卷引用漂移） | `ha-6-companion-REQUEST.md:5`/`:17`/`:106` 引「LEDGER :134」指配套行；现行号下 LEDGER `:134` 实为「`R-27 P1 | 迁移仅前进无 lock_timeout（→#179 承接） | ✅已在 5B | — |」·配套行已漂至 `:136`（表上方两行插入所致） | 历史卷 append-only 不回改；LEDGER `:136` 行勘误注内一并钉「本行历史引号 `:134` 系时点行号·现行号 `:136`·`:134` 现为 R-27 行与本簇无涉」；R-27 行本体零改（「→#179 承接 ✅已在 5B」与 `:86` 五B行「#179 runner 本体 ✅ MIG-RUNNER 全闭」一致·无矛盾） | ha-6 REQUEST 亲读+LEDGER `:86`/`:134`/`:136` 亲读 |
| D3 | checklist→backlog 跨卷行号漂移（模式登记·不逐一改写） | checklist「Line GODFN 定稿」段引「GAP-DEBT-BE-R4SCRIPTS `:879`」——backlog 现行号 `:901`；backlog `L-10` 引「checklist `:2755`」——现行号 `:2758` | 各卷行使时随卷逐件订正（沿 sse-api-family/x33「runner 收据锚行漂如实采」先例）；本卷不批量改写他卷行号 | 模式登记归 §2 修法边界 |

### §1-E 台账滞后（复核席 D 类移交 + 本席自证清单）

- **复核席移交**：backlog 复核席 D 类 13 条台账滞后清单由协调方信道 intake（逐条 PR/证据随 pre-exec dual 并卷入本节表）；本席按硬约束不凭转述登记任何未亲读条目。
- **本席自证清单（origin/main 亲读实证 · 独立复核与移交清单的并集/差集由 pre-exec dual 对账）**：§1-B B1/B2 两行 + §1-D D3 模式（checklist 内部跨段行号漂移实例——L-10 注记自身已承载一例「锚实为 :2756 门矩阵行」）。
- **不上账项（如实保留 · 零触）**：L-07（label 陈旧·定谳在飞）/L-08（静态门白名单·另刀）/L-09（环境 pending）/L-10（已由 2026-10-26 打包刀注记·终值权在 perf-load post 席）/`:871` GAP-COMM-PARTIAL-PAIR（语义裁决刀未立·OPEN 如实）/E2EA-01..06（P2 不入本账·E2EA-01 行使面 screg 已并线 `c0755edc8` 其台账承载在其自身链）。

**复核席 D 类 13 条台账滞后清单 intake 登记（2026-11-03 协调方信道·pre-exec r1 双审并卷 · 本席逐条亲读对账后落表 · 属 §1-A/§1-B 已覆盖的并卷行使 · 其余 additive 注落 backlog 行尾 · 登记不翻面·处置权仍归各注明载体或协调方）**

| # | 条目 | 登记（PR/证据·本席亲读） | 行使落点 |
|---|------|--------------------------|----------|
| 1 | GAP-DEBT-DB-TRIGFAM | 0144+commit `4e734a522`（commit 对象亲证在） | 并卷 §1-A A1（superseded 注 `:889`/`:894`） |
| 2 | GAP-DEBT-DB-NOFK | 0147+0148+commit `32c9e2db8`（亲证在） | 并卷 §1-A A2（superseded 注 `:888`/`:895`·错挂注归 `:896`） |
| 3 | GAP-DEBT-DB-MONEY3 | 0149+commit `a79a811ae`（亲证在） | 并卷 §1-A A4（superseded 注 `:897`） |
| 4 | GAP-DEBT-DB-HYGIENE | 0145+0146+commit `cb22270ca`（亲证在） | 并卷 §1-A A5（superseded 注 `:900`） |
| 5 | GAP-DEBT-DB-SRCBOILER | DBSB-1+commit `0ff210196`（亲证在） | 并卷 §1-A A3（订正注 `:896`+superseded 注 `:893`） |
| 6 | GAP-DEBT-BE-R4SCRIPTS | CI-WIRING F 簇 #169（checklist Line CI-WIRING nail 段 F 簇「r4-* 31 文件迁 apps/worker/evidence/」亲读） | additive 注 `:901` |
| 7 | BUG-E2E-FAILUNIMPORT | commit `665f98945`（亲证在·import 修复+static guard+双常驻负例 TC） | 并卷 §1-B B1（滞后注 `:879`） |
| 8 | E2EA-02 | nightly.yml 现树诚实门位（`.github/workflows/nightly.yml:33` 现文亲读=「门位如实:冒烟=硬门阻断…recall/scoring=信号臂(continue-on-error…)」在树） | 并卷 `:935` 既有销案注（零新注） |
| 9 | E2EA-05 | assert-strengthen `a0b01305`（checklist Line assert-strengthen nail 段亲读）+backfill nail（checklist Line e2ea05-backfill nail 段亲读：恒真 ×15 逐点定性锚表+漏网七处 M1-M7） | additive 注 `:938` |
| 10 | E2EA-06 | smoke-env-fix nail（backlog `:939` 行销案注+`:943` smoke-env-fix 注记亲读在卷） | 并卷 `:939`/`:943` 既有行注（零新注） |
| 11 | L-06 | DBACL2 PR #108（backlog `:917` DBACL2-CI-WIRE 收口注亲读在卷·PR #108 MERGED `112e6d26`） | 并卷 `:917` 既有收口注（零新注） |
| 12 | GAP-EVAL-PARSER-DETAILS-UNCLOSED | 移交清单记「uc3m（#186）」——亲读对账差异如实：EVAP 本体刀=本 GAP 收口已落线（`harness/evap-REQUEST.md` Status=`closed` 2026-10-30·PR #184 merge `1ca3ce1da` 在 origin/main 祖先亲证·fixture 在树）·uc3m #186 系 UC-003x N1b 两码映射刀（锚 `:953` 族·非本行）——登记以亲读为准·差异处置权归协调方 | additive 注 `:36`（对账差异如实） |
| 13 | C-PERF-TEARDOWN | 已 CLOSED 非 OPEN（backlog `:35` 现值亲读=「~~OPEN~~→CLOSED（fixed）2026-10-07 协调方授权翻转」在卷·移交清单口径滞后于行体现值） | 并卷 `:35` 现状（零新注） |

## §2 修法（EXEC 期行使内容 · 全部 additive 注记 · 原文不洗）

1. **superseded 标注形**（沿 `abd2080e2` unstub-erase「原文保留+superseded 注记」先例）：`:889`/`:894`/`:888`/`:895`/`:893`/`:897`/`:900` 七行行尾 additive 注「〔superseded 2026-11-02 台账勘误：同编号多行残排·唯一权威行=`:8XX`·本行原文不洗〕」；`:895` 加注「编号错挂载·处置文内容归 `:896` SRCBOILER 行承载」。
2. **唯一权威行订正**：`:896` 行内「awaiting post-dual」滞后注后 additive 订正注「〔勘误：post-prove 双审 BOTH PASS 已 nail @0ff210196·checklist Line DBSB-1 NAIL 段〕」；`:887`/`:890`/`:898`/`:899` 权威值零改（CLOSED 已是唯一值）。
3. **LEDGER `:136`**：标签列改九号九标签逐号对应形（§1-D1）+ 行尾勘误注（含 `:134` 引用漂移钉·§1-D2）。
4. **ID→唯一行对账表入卷**：§1-A 五行对账表（编号→唯一权威行号→权威状态→superseded 行号→依据 commit）随 EXEC append 到 backlog C 区「行统计与维护」之后（append-only·不动既有行与行统计）；本卷 §1-A 即其蓝本。
5. **滞后注**：B1/B2 两行 additive 注（§1-B「应改为」列）。
6. **零改承诺**：行统计数值（36/P0 20/P1 16/A21/B11）零改 · pins 零翻 · 「真实状态未知」条目（L-07/L-09 等）如实保留 OPEN 零触 · append-only 历史注（`:892` DBFK-1 进度注等）零洗 · 他卷（ha-6/ha-7 历史 REQUEST、checklist 既有行）零回改。

## §3 cap 预登（本卷 REQUEST +1 ⇒ CAP-SANCTION-2464 · 沿 nk1-REQUEST §3-C2/C3 预登形）

| 号 | 文件 | 内容 |
|----|------|------|
| C1 | `ai-docs/delivery/harness/led-REQUEST.md` | 本卷新增受管 1 件（起草 commit 即触 2463→2464）· EXEC 期零新增受管文件（勘误全为既有卷 in-place additive 注·对账表 append 进 backlog 既有文件）→ EXEC terminal=2464 零新增 |
| C2 | `scripts/ai-docs/public-text-policy.mjs` | `:283` `const MAX_FILES = 2_463` → **`2_464`** + 链区 `CAP-SANCTION-2464` 注记（本 rev 已随起草 commit 落·算术=届扫 2463=cap 2463 恰等+本卷 1=2464 恰等零多放·在飞 nk1-draft 承 2464 同值如实采·并线期 union 沿常设预授权重算）· `MANAGED_ROOTS`/`TEXT_EXTENSIONS`/扫描面零改（语义不变强度不减） |
| C3 | `scripts/ai-docs/public-text-policy.proof.mjs` | 四联动点随起草 commit 已落 **2464 形**：`i < 2_464` / `scannedFiles, 2_464` / `'ai-docs/f-2464.md'` / `${FILE_LIMIT}:2465` + 相邻注释 `2465` 两处同步 + 链区 `CAP-SANCTION-2464` 注记·PTP 12/12 亲跑（§4）·四处同一届值禁一处手改 |
| C4 | 收据面 | EXEC 期门读数 stdout 留痕落 `.log`（∉TEXT_EXTENSIONS 不计扫描面）· Ban 落 `.md`/`.txt`/`.json` 收据 |

## §4 门矩阵（起草期本席亲跑 · EXEC 期复跑同表）

1. `node scripts/ai-docs/check-docs.mjs` → 起草前 **EXIT=0 scanned 2463=cap 2463 恰等**；落卷后 **EXIT=0 scanned 2464=cap 2464 恰等**（§3 联动已先行落位）。
2. `node scripts/ai-docs/public-text-policy.proof.mjs` → **12/12 EXIT=0**（2464 形·落位后亲跑）。
3. markers 门 → 改动集（3 tracked 净增行）五类标记词（冲突/fake-green/门弱化/遗留标/secrets 样值·词面运行时组装防自指·同 `scripts/i6-239-gates.proof.mjs` §2-7 口径）+ 行首冲突标记 **0 命中**。
4. 面收敛门 → `git diff --name-status $(git merge-base HEAD origin/main)..HEAD` 恰 `A ai-docs/delivery/harness/led-REQUEST.md` + `M scripts/ai-docs/public-text-policy.mjs` + `M scripts/ai-docs/public-text-policy.proof.mjs`；**产品码/迁移/runner/既有 proof 零命中**。
5. EXEC 期（授权后）门：第 1-4 条复跑 + 勘误行使面 diff 复核（superseded 注七行+权威行订正注一行+LEDGER 一行+对账表 append+B1/B2 注两行·零既有字节改写机证 `git diff` 逐行核）。

## §5 Ban 清单

Ban push/force-push（git 写只本 worktree commit）· Ban 动主仓 · Ban EXEC（勘误行使全留授权后）· Ban self-approve（pre-exec 双审两独立外席·alone≠dual）· Ban 翻任一 pin · Ban 洗 append-only 历史注与原文（全部 additive）· Ban 改行统计数值 · Ban 触 L-07/L-08/L-09/L-10/L-11/L-12/L-13 与 `:871` GAP-COMM-PARTIAL-PAIR（真实状态未知/定谳权在飞条目如实保留 OPEN）· Ban 回改历史卷行号引用（ha-6/ha-7 REQUEST 零触）· Ban 在代码注释写任务号 · Ban secrets 入树 · Ban 落 `.md`/`.txt`/`.json` 收据 · Ban 借本刀宣称任一编号状态变化（勘误只对齐已并线事实·不产生新翻面）· Ban 批量改写跨卷行号引用（D3 模式只登记）。

## §6 pins（十一值照抄同族卷 · EXEC/审查不得改口 · 本刀零翻转 · cap 项唯一豁免=随届值如实采）

`haStatus=NOT_HA` · `releaseEvidence=false` · `claimProductionHA=false` · `gR45Closed=true` · `coveredCount=8` · `ms3EqualsR4Closed=false` · `PG-retained`（业务 + PostgresSaver + pgvector；禁 MySQL/Qdrant 业务切流叙事）· 公开 `DELETE /privacy/interview-data/:id` = **503** · `g7SuiteGreen=false` · `r1Closed=false` · 脚注 `actualSpendCny=null`（本刀零模型外呼·零消耗·est live=0）。

**本卷附加钉**：五编号唯一权威值=§1-A 表（TRIGFAM/NOFK/MONEY3/HYGIENE=CLOSED·SRCBOILER=EXEC'd→nail·均零新翻面·只对齐已并线事实）· superseded 七行原文不洗 · `:892` 进度注零洗 · 行统计 36 零改 · `cap=2464`（起草形恰等·CAP-SANCTION-2464）· EXEC 期零新增受管件。

## §7 Non-claims

本刀 **≠** 任一编号新翻面（§1-A 全部依据已并线 commit·勘误只消解行体滞后） **≠** NOFK/SRCBOILER 残面已清（P7 uuidv7 ACL 雷=DBACL-1 面·案A 多态表未立项·r4 物理迁出归 DIR-1 B3 等残面如实存续） **≠** GODFN 全闭（1d/r4 rerun/trio 残面存续） **≠** 行统计重算（上游 2026-10-26 重钉笔已重建·本刀只对齐行体） **≠** L-10 定谳（权在 perf-load post 席2） **≠** 复核席 D 类 13 条之定谳（移交清单 intake 随 pre-exec dual·本席只登记亲读实证项） **≠** HA/covered/suite green 任何变化 **≠** 产品码/迁移/runner 触面（docs-only）。

## §8 STOP

**STOP 已解 · `proofed:dual_pass`（2026-11-03 post-prove 双席 BOTH PASS 后转值·前值 `executed:awaiting_post_prove_dual` 2026-11-03 EXEC 行使后史录·更前值 `drafted:awaiting_pre_exec_dual` 2026-11-02 起草落卷即停史录 · 留痕见 §9 post-prove 记录行 · 四处钉：Status 行 + 本节 + §9 + 卷尾 · 同值）。** 开工三条款（已履行亲证）：① **pre-exec 双审两独立外席 BOTH PASS 落卷**（r1 席1+席2 BOTH PASS·含 §1-E 移交清单 intake 对账·cap 步进复核）；② **协调方明示 EXEC 授权**（勘误行使面=§2 六项逐项授权·本席明示授权行使全部勘误面）；③ **§1 全量对届时 tip 重 pin 已履行**——rebase 对届 tip `da1dae1de`（#189 nk1 已并）后五编号十二行（`:887`/`:888`/`:889`/`:890`/`:893`/`:894`/`:895`/`:896`/`:897`/`:898`/`:899`/`:900`）逐行亲读与 §1-A 表行号/原文零漂移·B1 `:879`/B2 `:902`/LEDGER `:136`/`:134` 同验零漂·结论不受疑未回炉。

停止条件：`docs:check` scanned > cap（2464）红 → 停（预登已先行落位不触发）；PTP 红 → 停；普查行号与届 tip 不符且去重口径无法重对 → 停如实登记；需越界（碰他卷历史原文/翻 pins/动产品码）才能继续 → 停。

## §9 EXEC 记录（2026-11-03 行使席落卷 · Status=**`proofed:dual_pass`**·2026-11-03 post-prove 双席 BOTH PASS 后转值·EXEC 时值 `executed:awaiting_post_prove_dual` 史录不洗·与 Status 行/§8/卷尾四处同值）

1. **rebase**：`git fetch origin` EXIT=0 → `git rebase origin/main` @`da1dae1de`（#189 nk1 已并·届值预登命中）恰 2 处冲突=两 policy 脚本注记/cap 区·dual-keep 双留（main 侧 CAP-SANCTION-2462 FLKWARM+2464 FLKWARM r1 两注记+本支 2464 台账勘误注记并留·值同 2_464）·rebase 后本支 tip `45205c9a8`。
2. **cap 步进 2464→2465**（先手步进·先步进再跑门）：union 算式=main 届扫 2464+本卷 REQUEST 1=**2465** 恰等零多放·协调方常设预授权「cap 以合并树实测恰等步进免再询」随令行使·`MAX_FILES = 2_465`+链区 CAP-SANCTION-2465 注记（「在飞如实采」按届重枚举：sse2 `5767389ae→7144da5fe` 承 2465 同值在飞·ha1 `b3ac84efa` 承 2_471 未落 main 不预采·nk1 已出在飞名单·其余九树陈旧如实列）+proof 四联动点 `2_465/f-2465.md/:2466`+相邻注释两处同步（预登 2464 形遇 nk1 并入按届重算承登·cap 随届值如实采=本卷附加钉唯一豁免）。
3. **勘误行使**（§2 六项+双审精度项·零既有字节改写机证 git diff 逐行前缀恒等·原文不洗·pins 零翻）：superseded 七注（`:889`/`:894` 唯一权威行=`:887`·`:888`=`:890`·`:895`=席2 修订形（模板权威行 `:890`+错挂注内容归 `:896`·E2 豁免 D2/14 项基线红 DBACL-1 复跑潮/r4→DIR-1 B3 详 checklist Line DBSB-1 NAIL 段 STILL OPEN 如实）·`:893`=`:896`·`:897`=`:899`·`:900`=`:898`）·`:896` 订正注（「awaiting post-dual」已被 `0ff210196` post BOTH PASS 超越+归档指针勘误半句·receipts/archive/2026-09-batch23/harness/ 仅 `.exec.md` 在卷亲证）·LEDGER `:136` 九号九标签修正+行尾勘误注（`:134` 引用漂移钉·§1-D2）·对账表 12 行 append（席1 修订形：行号列注「行号系本表落位届值·编号为机械锚」·**落位=文件尾 append**——两选项择一：C 区后插入将致 `:887`-`:902` 区段整体位移令本支行号注即落即漂·为零位移择文件尾·本行即选择记载）·B1 滞后注 `:879`/B2 进展注 `:902`（B2 依据=席2 修订形：checklist Line GODFN-1a/1b/1c NAIL 段（1b EXEC `1af8987e` 链）·`28d0d7a7` 经 `git cat-file -t` 亲证系 blob 非 commit·禁照抄假锚未引）·`:895` 三子项承载并引 checklist DBSB-1 NAIL 段（席1 P2-①-2）·L-07..L-13/`:871`/行统计数值/pins 零触。
4. **intake 对账**（§1-E 槽位）：复核席 D 类 13 条落表——5 条并卷 §1-A+1 条并卷 B1+3 条并卷既有行注（E2EA-02 `:935`/E2EA-06 `:939`/L-06 `:917`）+1 条并卷现状（C-PERF-TEARDOWN `:35` 已 CLOSED 非 OPEN·清单口径滞后）+3 条 additive 注（`:901` R4SCRIPTS/`:938` E2EA-05/`:36` GAP-EVAL-PARSER）·第 12 条对账差异如实登记（移交清单记 uc3m #186·亲读=EVAP PR #184 系本行本体刀·uc3m #186 系 `:953` 族·以亲读为准·差异处置权归协调方）。
5. **三门读数（EXEC 期复跑 §4 门 1-3）**：`node scripts/ai-docs/check-docs.mjs` **EXIT=0 · scanned 2465=cap 2_465 恰等** · `node scripts/ai-docs/public-text-policy.proof.mjs` **12/12 EXIT=0**（2465 形四联动点）· markers 门=改动集净增行五类标记词（词面运行时组装防自指·同 i6-239 §2-7 口径·本卷不复抄词面）+行首冲突标记 **0 命中** · §4 门 4 面收敛=EXEC commit diff 恰本卷 `.md`+backlog+LEDGER+两 policy 脚本**五 tracked 路径**·产品码/迁移/runner/既有 proof 零命中。
6. **收束**：`executed:awaiting_post_prove_dual`（post-prove 双审待派·翻面/收官/push 权归协调方·⛔push）。（2026-11-03 补记：post-prove 双席 BOTH PASS → 状态四处同值转 `proofed:dual_pass`，见下行 post-prove 记录行·本节 EXEC 时值史录不洗。）

7. **post-prove 记录行（2026-11-03 post-prove 双席亲审·BOTH PASS）**：两独立外席对行使树与 SSOT 落面逐项复核·BOTH PASS。关键读数：**13 前缀+18 尾增机证**（backlog 既有行逐行前缀恒等 13 注（+13/-13）+ 对账表及注记落位=文件尾纯尾增 18 行（+18/-0）·零既有字节改写）· **七注字节全等**（superseded 七注与行使 commit 逐字节全等·原文不洗）· **intake 13 条抽验全实**（§1-E 复核席 D 类移交清单逐条抽验与 backlog 落表相符·含第 12 条对账差异如实登记在卷）· **cap 2465 独立复算**（双席独立复算 scanned=cap 2_465 恰等·PTP 12/12·markers 0）。**双席 P2 登记**（均不在本卷行使·留痕归协调方）：席1 ①CAP-SANCTION-2465 注记 audit 树实为已落 #171 应出名单 ②pre-exec 记录载体惯例；席2 ①§9.3 前缀恒等机证范围=backlog 13 注+对账表·LEDGER `:136` 系授权行内插入 ②支线 nail SHA 与主线携入 SHA 分注纪律。双席 PASS ≠ 任何行翻面（pins 零翻·翻面/收官权归协调方）。
8. 【勘误注 2026-11-03（ERRATA-SWEEP 扫尾刀 · 登记面勘误 · append-only · 上行零字节改写）】: §9-3「零既有字节改写机证 git diff 逐行前缀恒等」的机证范围按上行席2 P2① 登记精确化=**backlog 13 注逐行前缀恒等（+13/-13）+ 对账表及注记落位文件尾纯尾增 18 行（+18/-0）**；LEDGER `:136` 九号九标签修正+行尾勘误注系**协调方授权行使面之行内插入形**（非前缀恒等机证对象·零删改既有字节·插入致后行顺延属预期）——两口径并存如实·本注不改史录字·仅把 §9-3 机证范围限定词挂明（沿上行双席 P2 登记兑现 · 登记形）。】

---

**卷尾 trace**：任务类型=L1 docs-only 台账勘误起草→EXEC 行使（docs 门·审核 ∧ 验证收束归协调方·post-prove 双审 BOTH PASS 已毕）· 工作区=`meetwise-led`（line/led-draft·起草 @`2e808c9e3` 基·rebase 对届 tip `da1dae1de` 后行使）· 来源证据=`git show origin/main:` 两 SSOT 卷逐行亲读+migrations `0144-0149` ls-tree+checklist nail 段（DBSB-1/GODFN-1a/1b/1c/CI-WIRING/assert-strengthen/e2ea05-backfill）+六 commit（`4e734a522`/`32c9e2db8`/`0ff210196`/`cb22270ca`/`a79a811ae`/`665f98945`）+HA-6/HA-7 REQUEST 亲读+EXEC 期补证（`1af8987e`/`a0b01305`/`49ab12d24`/`bfd27b293`/`857058d9d`/`82ea54e41`/`1ca3ce1da` 亲证·`28d0d7a7` blob 亲证排除） · 已读=AGENTS.md/meta/task-sop.md/两 policy 脚本/i6-239 gates §2-7/nk1-REQUEST（预登形模板） · 结论状态=`proofed:dual_pass`（前值 `executed:awaiting_post_prove_dual` 2026-11-03 EXEC 行使后史录·更前值 `drafted:awaiting_pre_exec_dual` 史录·2026-11-03 post-prove 双席 BOTH PASS·留痕见 §9 post-prove 记录行） · 验证=起草期 §4 门 1-4 全绿+EXEC 期 §9 三门亲跑全绿+post-prove 期三门复跑全绿（docs scanned 2465=cap 恰等/PTP 12/12/markers 0）。
